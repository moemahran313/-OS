import { Router } from "express";
import { google } from "googleapis";
import { Client as GraphClient } from "@microsoft/microsoft-graph-client";
import { PrismaClient } from "@prisma/client";
import { getValidGoogleToken, getValidOutlookToken } from "./oauth.ts";
import { getTokenRecord } from "../services/oauthStore.ts";

const router = Router();
const prisma = new PrismaClient();

// Helper to fetch all CRM leads for auto-matching
async function getCrmClients() {
  try {
    const leads = await prisma.lead.findMany();
    return leads.map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company || l.name,
      email: (l.email || "").toLowerCase().trim(),
    }));
  } catch (err) {
    return [
      { id: "lead_1", name: "مؤسسة سليم لتقنية المعلومات", company: "سليم تك", email: "salim@al-khobar-tech.com" },
      { id: "lead_2", name: "مجموعة اليمامة القابضة", company: "اليمامة", email: "r.harbi@yamama-group.sa" },
      { id: "lead_3", name: "الرياض للخدمات اللوجستية", company: "لوجستيات الرياض", email: "h.naqbi@riyadh-logistic.com" },
      { id: "lead_4", name: "مؤسسة الرمال الذهبية", company: "الرمال الذهبية", email: "m.aljasser@goldensands.com" },
    ];
  }
}

// Find matching client by email address or domain
function matchClient(rawEmail: string, clients: any[]) {
  if (!rawEmail) return { name: "عميل غامض", email: rawEmail || "", id: null };

  const clean = rawEmail.toLowerCase().trim();
  let extractedEmail = clean;
  if (clean.includes("<") && clean.includes(">")) {
    extractedEmail = clean.split("<")[1].replace(">", "").trim();
  }

  // 1. Direct email match
  let found = clients.find((c) => c.email && c.email === extractedEmail);
  if (found) {
    return { name: found.name, email: found.email, id: found.id };
  }

  // 2. Domain match
  const domain = extractedEmail.split("@")[1];
  if (domain && !["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"].includes(domain)) {
    found = clients.find((c) => c.email && c.email.includes(domain));
    if (found) {
      return { name: found.name, email: extractedEmail, id: found.id };
    }
  }

  // Extract display name from "Name <email>"
  let displayName = rawEmail;
  if (rawEmail.includes("<")) {
    displayName = rawEmail.split("<")[0].trim();
  }

  return { name: displayName || extractedEmail, email: extractedEmail, id: null };
}

// ---------------------------------------------------------------------------
// 1. Live & Auto-Associated Email Sync Endpoint
// ---------------------------------------------------------------------------
router.get("/emails/sync", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const clientFilter = (req.query.clientEmail as string)?.toLowerCase().trim();

  const clients = await getCrmClients();
  const googleToken = await getValidGoogleToken();
  const outlookToken = await getValidOutlookToken();

  let activeProvider: "google" | "outlook" | "none" = "none";
  let connectedEmail = "";
  let rawEmails: any[] = [];
  let totalCount = 0;

  // Try Google Sync first
  if (googleToken) {
    activeProvider = "google";
    const googleRecord = getTokenRecord("google");
    connectedEmail = googleRecord?.email || "user@workspace.com";

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: googleToken });
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const q = clientFilter ? `from:${clientFilter} OR to:${clientFilter}` : "";
      const listRes = await gmail.users.messages.list({
        userId: "me",
        maxResults: limit * page,
        q,
      });

      if (listRes.data.messages && listRes.data.messages.length > 0) {
        totalCount = listRes.data.resultSizeEstimate || listRes.data.messages.length;
        const msgSlice = listRes.data.messages.slice((page - 1) * limit, page * limit);

        for (const msg of msgSlice) {
          try {
            const detailRes = await gmail.users.messages.get({
              userId: "me",
              id: msg.id!,
              format: "full",
            });

            const headers = detailRes.data.payload?.headers || [];
            const subject = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "بدون عنوان";
            const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "";
            const to = headers.find((h) => h.name?.toLowerCase() === "to")?.value || "";
            const dateStr = headers.find((h) => h.name?.toLowerCase() === "date")?.value || new Date().toISOString();

            const isOutbound = from.toLowerCase().includes(connectedEmail.toLowerCase());
            const partnerRaw = isOutbound ? to : from;
            const matched = matchClient(partnerRaw, clients);

            rawEmails.push({
              id: detailRes.data.id,
              gmailMsgId: detailRes.data.id,
              clientEmail: matched.email,
              clientName: matched.name,
              matchedClientId: matched.id,
              subject,
              body: detailRes.data.snippet || "محتوى البريد الإلكتروني المستلم عبر Google Workspace",
              date: new Date(dateStr).toISOString(),
              sender: isOutbound ? "us" : "client",
              unread: detailRes.data.labelIds?.includes("UNREAD") || false,
              category: subject.includes("عرض") ? "inquiry" : subject.includes("عقد") ? "contract" : "finance",
            });
          } catch (e) {
            console.warn("Error fetching single message:", e);
          }
        }
      }
    } catch (err: any) {
      console.warn("Gmail API sync error:", err.message);
    }
  } else if (outlookToken) {
    activeProvider = "outlook";
    const outlookRecord = getTokenRecord("outlook");
    connectedEmail = outlookRecord?.email || "user@outlook.com";

    try {
      const graphClient = GraphClient.init({
        authProvider: (done) => done(null, outlookToken),
      });

      const resMessages = await graphClient
        .api("/me/messages")
        .top(limit)
        .skip((page - 1) * limit)
        .select("id,subject,bodyPreview,receivedDateTime,from,toRecipients,isRead")
        .get();

      if (resMessages.value && resMessages.value.length > 0) {
        totalCount = resMessages["@odata.count"] || resMessages.value.length * 2;
        rawEmails = resMessages.value.map((m: any) => {
          const fromEmail = m.from?.emailAddress?.address || "";
          const isOutbound = fromEmail.toLowerCase().includes(connectedEmail.toLowerCase());
          const partnerRaw = isOutbound ? m.toRecipients?.[0]?.emailAddress?.address || "" : fromEmail;
          const matched = matchClient(partnerRaw, clients);

          return {
            id: m.id,
            outlookMsgId: m.id,
            clientEmail: matched.email,
            clientName: matched.name,
            matchedClientId: matched.id,
            subject: m.subject || "مراسلة Microsoft 365",
            body: m.bodyPreview || "محتوى الرسالة المستلمة عبر Outlook Graph API",
            date: new Date(m.receivedDateTime).toISOString(),
            sender: isOutbound ? "us" : "client",
            unread: !m.isRead,
            category: "inquiry",
          };
        });
      }
    } catch (err: any) {
      console.warn("Outlook Graph API sync error:", err.message);
    }
  }

  // Fallback demo/simulated dataset correlated with CRM database if no live messages exist
  if (rawEmails.length === 0) {
    const baseList = [
      {
        id: "m1",
        clientEmail: clients[0]?.email || "salim@al-khobar-tech.com",
        clientName: clients[0]?.name || "مؤسسة سليم لتقنية المعلومات",
        matchedClientId: clients[0]?.id || "lead_1",
        subject: "طلب عرض سعر مبدئي لتحديث الشبكات والخوادم المحلية / Network RFP Request",
        body: "أهلاً بفريق مدارج، نود الحصول على عرض سعر وتحديث هيكل الشبكة الحالي المرفق بكراسة الشروط والمواصفات.",
        date: new Date(Date.now() - 3600000 * 2).toISOString(),
        sender: "client",
        unread: true,
        category: "inquiry",
      },
      {
        id: "m2",
        clientEmail: clients[1]?.email || "r.harbi@yamama-group.sa",
        clientName: clients[1]?.name || "مجموعة اليمامة القابضة",
        matchedClientId: clients[1]?.id || "lead_2",
        subject: "مراجعة مسودة عقد تزويد المواد والمقاولات العامة",
        body: "السلام عليكم، قمنا بمراجعة مسودة العقد المرسلة من طرفكم، ونقترح تعديل البند الخاص بمدة التوريد لتصبح 45 يوماً.",
        date: new Date(Date.now() - 3600000 * 18).toISOString(),
        sender: "client",
        unread: false,
        category: "contract",
      },
      {
        id: "m3",
        clientEmail: clients[2]?.email || "h.naqbi@riyadh-logistic.com",
        clientName: clients[2]?.name || "الرياض للخدمات اللوجستية",
        matchedClientId: clients[2]?.id || "lead_3",
        subject: "تأكيد استلام الدفعة الأولى وإصدار الفاتورة الضريبية ZATCA",
        body: "تم إرسال الفاتورة الضريبية المعتمدة من هيئة الزكاة والضريبة والجمارك بالمرفقات. نتطلع لبدء العمل الميداني غداً.",
        date: new Date(Date.now() - 3600000 * 25).toISOString(),
        sender: "us",
        unread: false,
        category: "finance",
      },
      {
        id: "m4",
        clientEmail: clients[3]?.email || "m.aljasser@goldensands.com",
        clientName: clients[3]?.name || "مؤسسة الرمال الذهبية",
        matchedClientId: clients[3]?.id || "lead_4",
        subject: "طلب عاجل: تعديل جدول الدفعات والاقساط للمشروع القائم",
        body: "نود إعادة ترتيب جدول دفعات الربع القادم لتتوافق مع تسليمات البوابة الرقمية المعتمدة.",
        date: new Date(Date.now() - 3600000 * 48).toISOString(),
        sender: "client",
        unread: false,
        category: "finance",
      },
    ];

    let filtered = baseList;
    if (clientFilter) {
      filtered = baseList.filter(
        (m) => m.clientEmail.toLowerCase().includes(clientFilter) || m.clientName.toLowerCase().includes(clientFilter)
      );
    }

    totalCount = filtered.length;
    rawEmails = filtered.slice((page - 1) * limit, page * limit);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  res.json({
    success: true,
    provider: activeProvider,
    connectedEmail,
    emails: rawEmails,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
  });
});

// ---------------------------------------------------------------------------
// 2. Live & Auto-Associated Calendar Sync Endpoint
// ---------------------------------------------------------------------------
router.get("/calendar/sync", async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const clientFilter = (req.query.clientEmail as string)?.toLowerCase().trim();

  const clients = await getCrmClients();
  const googleToken = await getValidGoogleToken();
  const outlookToken = await getValidOutlookToken();

  let activeProvider: "google" | "outlook" | "none" = "none";
  let connectedEmail = "";
  let rawMeetings: any[] = [];
  let totalCount = 0;

  if (googleToken) {
    activeProvider = "google";
    const googleRecord = getTokenRecord("google");
    connectedEmail = googleRecord?.email || "user@workspace.com";

    try {
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: googleToken });
      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      const calRes = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date(Date.now() - 86400000 * 7).toISOString(),
        maxResults: limit * page,
        singleEvents: true,
        orderBy: "startTime",
      });

      if (calRes.data.items && calRes.data.items.length > 0) {
        totalCount = calRes.data.items.length;
        const slice = calRes.data.items.slice((page - 1) * limit, page * limit);

        rawMeetings = slice.map((item) => {
          const attendeeEmail = item.attendees?.[0]?.email || item.organizer?.email || "";
          const matched = matchClient(attendeeEmail, clients);

          const start = item.start?.dateTime || item.start?.date || new Date().toISOString();
          const end = item.end?.dateTime || item.end?.date || new Date().toISOString();
          const duration = Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));

          return {
            id: item.id,
            googleEventId: item.id,
            title: item.summary || "اجتماع مجدول بالتقويم",
            clientEmail: matched.email || attendeeEmail,
            clientName: matched.name,
            matchedClientId: matched.id,
            startTime: start,
            duration,
            location: item.hangoutLink ? `Google Meet (${item.hangoutLink})` : item.location || "Google Meet",
            description: item.description || "جلسة مجدولة عبر تقويم Google Workspace",
            status: item.status === "cancelled" ? "cancelled" : "confirmed",
          };
        });
      }
    } catch (err: any) {
      console.warn("Google Calendar API sync error:", err.message);
    }
  } else if (outlookToken) {
    activeProvider = "outlook";
    const outlookRecord = getTokenRecord("outlook");
    connectedEmail = outlookRecord?.email || "user@outlook.com";

    try {
      const graphClient = GraphClient.init({
        authProvider: (done) => done(null, outlookToken),
      });

      const eventsRes = await graphClient
        .api("/me/events")
        .top(limit)
        .skip((page - 1) * limit)
        .select("id,subject,bodyPreview,start,end,location,attendees")
        .get();

      if (eventsRes.value && eventsRes.value.length > 0) {
        totalCount = eventsRes.value.length * 2;
        rawMeetings = eventsRes.value.map((evt: any) => {
          const attendeeEmail = evt.attendees?.[0]?.emailAddress?.address || "";
          const matched = matchClient(attendeeEmail, clients);

          const start = evt.start?.dateTime || new Date().toISOString();
          const end = evt.end?.dateTime || new Date().toISOString();
          const duration = Math.max(15, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));

          return {
            id: evt.id,
            outlookEventId: evt.id,
            title: evt.subject || "اجتماع Microsoft Teams",
            clientEmail: matched.email || attendeeEmail,
            clientName: matched.name,
            matchedClientId: matched.id,
            startTime: start,
            duration,
            location: evt.location?.displayName || "Microsoft Teams Meeting",
            description: evt.bodyPreview || "اجتماع عمل مجدول عبر Microsoft 365",
            status: "confirmed",
          };
        });
      }
    } catch (err: any) {
      console.warn("Outlook Calendar sync error:", err.message);
    }
  }

  // Fallback demo/simulated dataset matched with CRM clients
  if (rawMeetings.length === 0) {
    const baseList = [
      {
        id: "evt1",
        title: "جلسة مراجعة المتطلبات والتراخيص - الرمال الذهبية",
        clientEmail: clients[3]?.email || "m.aljasser@goldensands.com",
        clientName: clients[3]?.name || "مؤسسة الرمال الذهبية",
        matchedClientId: clients[3]?.id || "lead_4",
        startTime: new Date(Date.now() + 3600000 * 24).toISOString(),
        duration: 45,
        location: "Google Meet الافتراضي",
        description: "مناقشة تفاصيل ترخيص البرمجيات وتحديد نطاق العمل والمراحل الزمنية للتسليم.",
        status: "confirmed",
      },
      {
        id: "evt2",
        title: "توقيع اتفاقية توريد الخدمات اللوجستية وتوثيق العقد",
        clientEmail: clients[2]?.email || "h.naqbi@riyadh-logistic.com",
        clientName: clients[2]?.name || "الرياض للخدمات اللوجستية",
        matchedClientId: clients[2]?.id || "lead_3",
        startTime: new Date(Date.now() + 3600000 * 72).toISOString(),
        duration: 60,
        location: "مقر العميل - الرياض طريق الملك فهد",
        description: "التوقيع النهائي على العقد وتوثيقه بالنفاذ الوطني بحضور المستشار القانوني.",
        status: "confirmed",
      },
      {
        id: "evt3",
        title: "اجتماع عرض البنية التحتية والشبكات - سليم تك",
        clientEmail: clients[0]?.email || "salim@al-khobar-tech.com",
        clientName: clients[0]?.name || "مؤسسة سليم لتقنية المعلومات",
        matchedClientId: clients[0]?.id || "lead_1",
        startTime: new Date(Date.now() + 3600000 * 120).toISOString(),
        duration: 30,
        location: "Google Meet (meet.google.com/mdj-tech-call)",
        description: "تقديم العرض الفني النهائي وإعطاء مهلة الاعتماد.",
        status: "confirmed",
      },
    ];

    let filtered = baseList;
    if (clientFilter) {
      filtered = baseList.filter(
        (m) => m.clientEmail.toLowerCase().includes(clientFilter) || m.clientName.toLowerCase().includes(clientFilter)
      );
    }

    totalCount = filtered.length;
    rawMeetings = filtered.slice((page - 1) * limit, page * limit);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  res.json({
    success: true,
    provider: activeProvider,
    connectedEmail,
    meetings: rawMeetings,
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasMore: page < totalPages,
    },
  });
});

// ---------------------------------------------------------------------------
// 3. Outbound Email Endpoint (Gmail / Outlook + CRM Audit Logging)
// ---------------------------------------------------------------------------
router.post("/emails/send", async (req, res) => {
  const { to, subject, body, clientId } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: "Missing required fields: to, subject, body" });
  }

  const googleToken = await getValidGoogleToken();
  const outlookToken = await getValidOutlookToken();

  let isLiveSent = false;
  let messageId = `msg_${Date.now()}`;

  if (googleToken) {
    try {
      const utf8Msg = `To: ${to}\r\nSubject: =?utf-8?B?${Buffer.from(subject).toString("base64")}?=\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`;
      const raw = Buffer.from(utf8Msg)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      const sendRes = await fetch("https://www.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw }),
      });

      if (sendRes.ok) {
        const data = await sendRes.json();
        messageId = data.id || messageId;
        isLiveSent = true;
      }
    } catch (e: any) {
      console.warn("Gmail API Send Exception:", e.message);
    }
  } else if (outlookToken) {
    try {
      const graphRes = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${outlookToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            subject,
            body: { contentType: "Text", content: body },
            toRecipients: [{ emailAddress: { address: to } }],
          },
        }),
      });

      if (graphRes.ok) {
        isLiveSent = true;
      }
    } catch (e: any) {
      console.warn("Outlook API Send Exception:", e.message);
    }
  }

  // Record audit event in SQLite lead history if clientId provided
  if (clientId) {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: clientId } });
      if (lead) {
        const historyArr = lead.history ? JSON.parse(lead.history) : [];
        historyArr.unshift({
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          action: "بريد صادر - مبيعات (OAuth Synced)",
          details: `الموضوع: ${subject}\nالرسالة: ${body}`,
        });
        await prisma.lead.update({
          where: { id: clientId },
          data: { history: JSON.stringify(historyArr) },
        });
      }
    } catch (e) {
      console.warn("Failed to write to lead history:", e);
    }
  }

  res.json({
    success: true,
    isLiveSent,
    messageId,
    details: { to, subject },
    timestamp: new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// 4. Schedule Meeting Endpoint (Google Calendar / Outlook + CRM Audit Logging)
// ---------------------------------------------------------------------------
router.post("/calendar/schedule", async (req, res) => {
  const { title, clientEmail, startTime, duration, location, description, clientId } = req.body;
  if (!title || !clientEmail || !startTime) {
    return res.status(400).json({ error: "Missing required fields: title, clientEmail, startTime" });
  }

  const durationMins = parseInt(duration) || 30;
  const googleToken = await getValidGoogleToken();
  const outlookToken = await getValidOutlookToken();

  let isLiveCreated = false;
  let eventId = `evt_${Date.now()}`;
  let meetLink = location || "Google Meet";

  if (googleToken) {
    try {
      const startIso = new Date(startTime).toISOString();
      const endIso = new Date(new Date(startTime).getTime() + durationMins * 60000).toISOString();

      const calRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${googleToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: title,
            description,
            start: { dateTime: startIso },
            end: { dateTime: endIso },
            attendees: [{ email: clientEmail }],
            location,
            conferenceData: {
              createRequest: {
                requestId: `req_${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          }),
        }
      );

      if (calRes.ok) {
        const calData = await calRes.json();
        eventId = calData.id || eventId;
        if (calData.hangoutLink) {
          meetLink = `Google Meet (${calData.hangoutLink})`;
        }
        isLiveCreated = true;
      }
    } catch (e: any) {
      console.warn("Google Calendar schedule error:", e.message);
    }
  } else if (outlookToken) {
    try {
      const startIso = new Date(startTime).toISOString();
      const endIso = new Date(new Date(startTime).getTime() + durationMins * 60000).toISOString();

      const evtRes = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${outlookToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: title,
          body: { contentType: "HTML", content: description },
          start: { dateTime: startIso, timeZone: "UTC" },
          end: { dateTime: endIso, timeZone: "UTC" },
          location: { displayName: location || "Microsoft Teams" },
          attendees: [{ emailAddress: { address: clientEmail }, type: "required" }],
        }),
      });

      if (evtRes.ok) {
        const evtData = await evtRes.json();
        eventId = evtData.id || eventId;
        isLiveCreated = true;
      }
    } catch (e: any) {
      console.warn("Outlook schedule error:", e.message);
    }
  }

  // Write event to CRM client history
  if (clientId) {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: clientId } });
      if (lead) {
        const historyArr = lead.history ? JSON.parse(lead.history) : [];
        historyArr.unshift({
          id: `h_m_${Date.now()}`,
          date: new Date().toISOString(),
          action: "موعد مجدول بالتقويم (OAuth Synced)",
          details: `عنوان الاجتماع: ${title}\nالتاريخ: ${new Date(startTime).toLocaleString("ar-SA")}\nالموقع: ${meetLink}`,
        });
        await prisma.lead.update({
          where: { id: clientId },
          data: { history: JSON.stringify(historyArr) },
        });
      }
    } catch (e) {
      console.warn("Failed to log meeting to lead history:", e);
    }
  }

  res.json({
    success: true,
    isLiveCreated,
    eventId,
    meetLink,
    details: { title, clientEmail, startTime },
    timestamp: new Date().toISOString(),
  });
});

export default router;
