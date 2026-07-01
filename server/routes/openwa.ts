import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { db } from "../services/firebase.js";
import { logAudit } from "../services/utils.js";

const router = Router();

// Helper to clean phone numbers for matching
function cleanPhoneNumber(num: string): string {
  if (!num) return "";
  let cleaned = num.replace(/@c\.us$/, "");
  cleaned = cleaned.replace(/\D/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  // Saudi 05 -> 9665
  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "966" + cleaned.substring(1);
  }
  return cleaned;
}

// 1. Send WhatsApp Message via OpenWA
router.post("/send", authenticate, async (req: any, res) => {
  try {
    const { to, text, leadId } = req.body;
    if (!to || !text) {
      return res.status(400).json({ error: "Missing recipient (to) or message text." });
    }

    // Get user settings to retrieve OpenWA credentials
    const settingsDoc = await db.collection("settings").doc(req.user.uid).get();
    if (!settingsDoc.exists) {
      return res.status(400).json({ error: "يجب ضبط إعدادات OpenWA أولاً في صفحة المحادثات." });
    }

    const settings = settingsDoc.data() || {};
    const openwaUrl = settings.openwaUrl || process.env.OPENWA_URL;
    const openwaApiKey = settings.openwaApiKey || process.env.OPENWA_API_KEY;

    if (!openwaUrl) {
      return res.status(400).json({ error: "رابط OpenWA API غير مهيأ. يرجى ضبطه في الإعدادات." });
    }

    // Format phone number for WhatsApp (needs to end in @c.us for many OpenWA endpoints)
    const cleanedPhone = cleanPhoneNumber(to);
    if (!cleanedPhone) {
      return res.status(400).json({ error: "رقم الهاتف غير صالح." });
    }
    const formattedTo = `${cleanedPhone}@c.us`;

    // Attempt to call OpenWA API
    const url = `${openwaUrl.replace(/\/$/, "")}/sendText`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (openwaApiKey) {
      headers["Authorization"] = `Bearer ${openwaApiKey}`;
      headers["X-Api-Key"] = openwaApiKey;
    }

    const payload = {
      to: formattedTo,
      chatId: formattedTo,
      content: text,
      body: text,
      message: text,
    };

    console.log(`Sending WhatsApp via OpenWA to ${formattedTo} at ${url}...`);

    let openwaSuccess = false;
    let openwaErrorMsg = "";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        openwaSuccess = true;
      } else {
        const errorText = await response.text();
        openwaErrorMsg = `HTTP ${response.status}: ${errorText}`;
        console.warn(`OpenWA returned error: ${openwaErrorMsg}`);
      }
    } catch (fetchErr: any) {
      openwaErrorMsg = fetchErr.message || "Network error calling OpenWA instance";
      console.error(`Fetch to OpenWA failed: ${openwaErrorMsg}`);
    }

    // Even if OpenWA is offline/failing during demo/dev, we can optionally save to Firestore
    // but we notify the user. This is perfect for high fidelity where we don't block progress.
    const newMessage = {
      id: `msg_wa_${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toISOString(),
      status: openwaSuccess ? "sent" : "failed",
      channel: "whatsapp",
      errorDetails: openwaErrorMsg || null,
    };

    if (leadId) {
      const leadRef = db.collection("leads").doc(leadId);
      const leadDoc = await leadRef.get();
      if (leadDoc.exists) {
        const leadData = leadDoc.data() || {};
        const messages = leadData.messages || [];
        await leadRef.update({
          messages: [...messages, newMessage],
        });
      }
    }

    logAudit(
      "Chat",
      { action: "Send WhatsApp", to: formattedTo, success: openwaSuccess },
      payload,
      req
    );

    return res.json({
      success: openwaSuccess,
      message: openwaSuccess
        ? "تم إرسال الرسالة بنجاح عبر واتساب"
        : "فشل الإرسال الحقيقي عبر واتساب (تم الحفظ محلياً في مدارج)",
      error: openwaErrorMsg || null,
      sentMessage: newMessage,
    });
  } catch (err: any) {
    console.error("WhatsApp sending error:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Public Webhook for incoming OpenWA messages (with payload validation and queueing)
router.post("/webhook", async (req: any, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId query parameter for routing." });
    }

    const payload = req.body;

    // --- PAYLOAD VALIDATION & SENDER VERIFICATION ---
    if (!payload || typeof payload !== "object") {
      return res.status(400).json({ error: "Invalid payload format. Expected a JSON object." });
    }

    // Support both standard event structure and direct message structure
    let messageData = payload.data || payload;
    if (payload.event === "onMessage" && payload.data) {
      messageData = payload.data;
    }

    const text = messageData.body || messageData.text || messageData.content;
    const fromRaw = messageData.from || (messageData.sender && messageData.sender.id);

    // Reject unrecognized formats or empty messages to protect the webhook
    if (!fromRaw || typeof fromRaw !== "string") {
      return res
        .status(400)
        .json({ error: "Unauthorized access: Missing or invalid message sender identifier." });
    }

    if (text === undefined || text === null) {
      return res.status(400).json({ error: "Unauthorized access: Missing message body/content." });
    }

    const cleanedIncomingPhone = cleanPhoneNumber(fromRaw);
    if (
      !cleanedIncomingPhone ||
      cleanedIncomingPhone.length < 7 ||
      cleanedIncomingPhone.length > 17
    ) {
      return res
        .status(400)
        .json({ error: "Unauthorized access: Invalid sender phone number format." });
    }

    // Validate webhook secret if configured in user settings
    const settingsDoc = await db.collection("settings").doc(userId).get();
    if (settingsDoc.exists) {
      const settings = settingsDoc.data() || {};
      const expectedSecret = settings.openwaWebhookSecret;
      if (expectedSecret) {
        const receivedSecret = req.query.secret || req.headers["x-webhook-secret"];
        if (receivedSecret !== expectedSecret) {
          console.warn(`Webhook unauthorized attempt for user: ${userId}. IP: ${req.ip}`);
          return res.status(401).json({ error: "Unauthorized access: Invalid Webhook Secret." });
        }
      }
    }

    console.log(
      `[Queue System] Incoming WhatsApp message from ${cleanedIncomingPhone}. Queuing message...`
    );

    // --- MESSAGE QUEUING SYSTEM ---
    // Store message in Firestore collection 'whatsapp_queue' for high volume safety
    const queueRef = db.collection("whatsapp_queue");
    const queueDoc = await queueRef.add({
      userId,
      status: "pending",
      payload,
      createdAt: new Date().toISOString(),
      processedAt: null,
      error: null,
    });

    // Trigger asynchronous non-blocking background queue processor
    setImmediate(async () => {
      try {
        await processQueueItem(queueDoc.id);
      } catch (err) {
        console.error(`[Queue System] Background processing failed for item ${queueDoc.id}:`, err);
      }
    });

    return res.json({
      status: "queued",
      queueId: queueDoc.id,
      message: "تم استقبال الرسالة ووضعها في طابور المعالجة بنجاح.",
    });
  } catch (err: any) {
    console.error("OpenWA Webhook Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Helper to process queued items and correlate them with CRM records
async function processQueueItem(docId: string) {
  const queueDocRef = db.collection("whatsapp_queue").doc(docId);
  const docSnap = await queueDocRef.get();
  if (!docSnap.exists) return;

  const data = docSnap.data();
  if (!data || data.status !== "pending") return;

  const { userId, payload } = data;

  try {
    let messageData = payload.data || payload;
    if (payload.event === "onMessage" && payload.data) {
      messageData = payload.data;
    }

    const text = messageData.body || messageData.text || messageData.content;
    const fromRaw = messageData.from || (messageData.sender && messageData.sender.id);
    const cleanedIncomingPhone = cleanPhoneNumber(fromRaw);

    // --- CORRELATION SERVICE ---
    // Fetch all leads for this user to find a phone number match
    const leadsSnap = await db.collection("leads").where("userId", "==", userId).get();
    let matchedLead: any = null;

    for (const doc of leadsSnap.docs) {
      const leadData = doc.data();
      const leadPhoneCleaned = cleanPhoneNumber(leadData.phone || "");
      if (
        leadPhoneCleaned &&
        (leadPhoneCleaned === cleanedIncomingPhone ||
          leadPhoneCleaned.endsWith(cleanedIncomingPhone) ||
          cleanedIncomingPhone.endsWith(leadPhoneCleaned))
      ) {
        matchedLead = { id: doc.id, ...leadData };
        break;
      }
    }

    const incomingMessage = {
      id: messageData.id || `msg_incoming_wa_${Date.now()}`,
      sender: "client" as const,
      text,
      timestamp: new Date().toISOString(),
      status: "delivered" as const,
      channel: "whatsapp",
    };

    if (matchedLead) {
      console.log(
        `[Correlation Service] Match found! Attaching WhatsApp history to Lead: ${matchedLead.name} (${matchedLead.id})`
      );
      const messages = matchedLead.messages || [];
      await db
        .collection("leads")
        .doc(matchedLead.id)
        .update({
          messages: [...messages, incomingMessage],
          lastMessageTime: incomingMessage.timestamp,
        });

      await queueDocRef.update({
        status: "processed",
        correlatedLeadId: matchedLead.id,
        action: "message_appended",
        processedAt: new Date().toISOString(),
      });
    } else {
      // Create a NEW lead automatically for the unrecognized WhatsApp number
      console.log(
        `[Correlation Service] No match found. Creating a new CRM Lead for WhatsApp number: ${cleanedIncomingPhone}`
      );

      const newLeadData = {
        userId,
        name: `عميل واتساب ${cleanedIncomingPhone.slice(-4)}`,
        company: "محادثة واتساب مباشرة",
        phone: `+${cleanedIncomingPhone}`,
        status: "new",
        value: 0,
        createdAt: new Date(),
        lastMessageTime: incomingMessage.timestamp,
        messages: [incomingMessage],
        notes: `تم إنشاء الفرصة البيعية تلقائياً عبر محادثة واتساب واردة (رقم ${cleanedIncomingPhone}).`,
      };

      const newDocRef = await db.collection("leads").add(newLeadData);

      await queueDocRef.update({
        status: "processed",
        correlatedLeadId: newDocRef.id,
        action: "lead_created",
        processedAt: new Date().toISOString(),
      });
    }
  } catch (err: any) {
    console.error(`[Queue System] Error processing item ${docId}:`, err);
    await queueDocRef.update({
      status: "failed",
      error: err.message || "Internal processing error",
      processedAt: new Date().toISOString(),
    });
  }
}

// 3. Test Connection to OpenWA
router.post("/test", authenticate, async (req: any, res) => {
  try {
    const { openwaUrl, openwaApiKey } = req.body;
    if (!openwaUrl) {
      return res.status(400).json({ error: "Missing openwaUrl" });
    }

    const url = `${openwaUrl.replace(/\/$/, "")}/getMe`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (openwaApiKey) {
      headers["Authorization"] = `Bearer ${openwaApiKey}`;
      headers["X-Api-Key"] = openwaApiKey;
    }

    console.log(`Testing OpenWA connection at ${url}...`);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
      });

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        return res.json({
          connected: true,
          message: "اتصال ناجح بمحرك OpenWA!",
          data,
        });
      } else {
        // Fallback check: sometimes getMe doesn't exist, try pinging base path or just /
        const baseResponse = await fetch(`${openwaUrl.replace(/\/$/, "")}/`, {
          method: "GET",
          headers,
        });
        if (baseResponse.ok) {
          return res.json({
            connected: true,
            message: "تم الاتصال بنجاح بالرابط الأساسي لـ OpenWA!",
          });
        }

        return res.status(400).json({
          connected: false,
          error: `تم رفض الاتصال من الخادم: HTTP ${response.status}`,
        });
      }
    } catch (e: any) {
      return res.status(400).json({
        connected: false,
        error: `تعذر الوصول إلى الرابط المحدد: ${e.message || e}`,
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Real-time Status Check for Dashboard Monitor
router.get("/status", authenticate, async (req: any, res) => {
  try {
    const settingsDoc = await db.collection("settings").doc(req.user.uid).get();
    if (!settingsDoc.exists) {
      return res.json({
        status: "disabled",
        connected: false,
        message: "لم يتم تهيئة الإعدادات بعد.",
      });
    }

    const settings = settingsDoc.data() || {};
    const openwaEnabled = settings.openwaEnabled || false;
    const openwaUrl = settings.openwaUrl;
    const openwaApiKey = settings.openwaApiKey;

    if (!openwaEnabled || !openwaUrl) {
      return res.json({
        status: "disabled",
        connected: false,
        message: "الربط غير مفعل أو الرابط غير مهيأ.",
      });
    }

    // Attempt a live ping with a timeout to detect real-time status
    const url = `${openwaUrl.replace(/\/$/, "")}/getMe`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (openwaApiKey) {
      headers["Authorization"] = `Bearer ${openwaApiKey}`;
      headers["X-Api-Key"] = openwaApiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        return res.json({
          status: "connected",
          connected: true,
          message: "متصل حياً بمحرك OpenWA",
        });
      } else {
        // Try fallback to base path
        const fallbackController = new AbortController();
        const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 1500);
        try {
          const baseResponse = await fetch(`${openwaUrl.replace(/\/$/, "")}/`, {
            method: "GET",
            headers,
            signal: fallbackController.signal,
          });
          clearTimeout(fallbackTimeoutId);
          if (baseResponse.ok) {
            return res.json({
              status: "connected",
              connected: true,
              message: "متصل حياً بالرابط الأساسي لـ OpenWA",
            });
          }
        } catch {
          clearTimeout(fallbackTimeoutId);
        }

        return res.json({
          status: "disconnected",
          connected: false,
          message: `خطأ من خادم OpenWA: HTTP ${response.status}`,
        });
      }
    } catch (e: any) {
      clearTimeout(timeoutId);
      return res.json({
        status: "disconnected",
        connected: false,
        message: `تعذر الاتصال بـ OpenWA: ${e.message || "خادم OpenWA غير متصل"}`,
      });
    }
  } catch (err: any) {
    console.error("OpenWA status check error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
