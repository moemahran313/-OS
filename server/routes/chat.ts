import { Router } from "express";
import crypto from "crypto";
import { authenticate } from "../middleware/auth.ts";
import { db } from "../services/firebase.ts";
import { GoogleGenAI } from "@google/genai";
import { logAudit } from "../services/utils.ts";

const router = Router();

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. SSE Real-Time Streaming Chat Route powered by Gemini AI with Intent Classification
router.post("/stream", authenticate, async (req: any, res: any) => {
  const { leadId, messageText, channel = "web_chat" } = req.body;

  if (!leadId || !messageText) {
    return res.status(400).json({ error: "leadId and messageText are required" });
  }

  // Set SSE Headers for continuous response streaming
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      res.write(`data: ${JSON.stringify({ error: "Lead not found in database" })}\n\n`);
      return res.end();
    }

    const leadData = leadSnap.data();
    if (leadData?.userId !== req.user.uid) {
      res.write(`data: ${JSON.stringify({ error: "Unauthorized access to lead" })}\n\n`);
      return res.end();
    }

    // Save User message first
    const userMsg = {
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: messageText,
      timestamp: new Date().toISOString(),
      status: "sent",
      channel,
    };

    const existingMessages = leadData.messages || [];
    const updatedMessagesWithUser = [...existingMessages, userMsg];

    await leadRef.update({
      messages: updatedMessagesWithUser,
      updatedAt: new Date().toISOString(),
    });

    let ai: any = null;
    try {
      ai = getGeminiClient();
    } catch {
      // Fallback if key is missing
    }

    // ------------------------------------------------------------------
    // Intent Classification & ZATCA Phase 2 Draft Generation Engine
    // ------------------------------------------------------------------
    let detectedIntent = "GENERAL_INQUIRY";
    let draftDocument: any = null;

    if (ai) {
      try {
        const classificationPrompt = `Analyze the following customer message in Arabic/English to classify intent.
Customer Message: "${messageText}"

Possible Intents:
1. "QUOTE_REQUEST": Asking for a price offer, quotation, cost estimate, or proposal (e.g., "عرض سعر", "تسعيرة", "كم التكلفة", "quote", "proposal").
2. "INVOICE_REQUEST": Asking for a tax invoice, bill, ZATCA invoice, or payment link (e.g., "فاتورة", "فاتورة ضريبية", "رابط الدفع", "invoice").
3. "GENERAL_INQUIRY": General question, greeting, or support query.

Return strictly a valid JSON object in this format:
{
  "intent": "QUOTE_REQUEST" | "INVOICE_REQUEST" | "GENERAL_INQUIRY",
  "serviceName": "Short descriptive module or product name requested",
  "amountSAR": number or 10000
}`;

        const classResp = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: classificationPrompt,
          config: { responseMimeType: "application/json" },
        });

        if (classResp.text) {
          const parsed = JSON.parse(classResp.text);
          if (parsed.intent && parsed.intent !== "GENERAL_INQUIRY") {
            detectedIntent = parsed.intent;

            const isInvoice = detectedIntent === "INVOICE_REQUEST";
            const docId = `inv_${Date.now()}`;
            const docNumber = isInvoice
              ? `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
              : `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const baseAmountSAR = parsed.amountSAR && Number(parsed.amountSAR) > 0 ? Number(parsed.amountSAR) : 10000;
            const subtotalHalalas = Math.round(baseAmountSAR * 100);
            const vatAmountHalalas = Math.round(subtotalHalalas * 0.15); // 15% ZATCA VAT
            const totalAmountHalalas = subtotalHalalas + vatAmountHalalas;

            const publicPath = `/pay/${docId}`;
            const host = req.get("host") || "app.madarij-os.com";
            const protocol = req.protocol || "https";
            const fullPayUrl = `${protocol}://${host}${publicPath}`;

            const serviceDesc = parsed.serviceName || "رخصة التشغيل السنوية والامتثال لمنصة مدارج OS (ZATCA Phase 2)";

            draftDocument = {
              id: docId,
              userId: req.user.uid,
              leadId: leadId,
              number: docNumber,
              clientName: leadData.name || "العميل الكريم",
              clientEmail: leadData.email || "",
              clientPhone: leadData.phone || "",
              issueDate: new Date().toISOString().split("T")[0],
              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              currency: "SAR",
              type: isInvoice ? "invoice" : "quote",
              subtotalHalalas,
              vatAmountHalalas,
              totalAmountHalalas,
              status: "draft",
              paymentLink: fullPayUrl,
              publicPath,
              lineItems: [
                {
                  description: serviceDesc,
                  quantity: 1,
                  unitPriceHalalas: subtotalHalalas,
                  vatRate: 15,
                  totalHalalas: totalAmountHalalas,
                },
              ],
              zatcaConfig: {
                phase: "2",
                uuid: crypto.randomUUID(),
                invoiceType: isInvoice ? "388" : "381",
                clearanceStatus: "CLEARED_ZATCA_SIMULATION",
                hash: crypto.createHash("sha256").update(`${docId}-${Date.now()}`).digest("hex"),
                qrCodeUrl: `${protocol}://${host}/pay/${docId}?qr=true`,
                xmlDraft: `<UBL2.1><UUID>${crypto.randomUUID()}</UUID><TaxTotal><TaxAmount currencyID="SAR">${(vatAmountHalalas / 100).toFixed(2)}</TaxAmount></TaxTotal></UBL2.1>`,
              },
              logs: [
                {
                  action: `Created via Gemini Intent Classification (${detectedIntent})`,
                  timestamp: new Date().toISOString(),
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };

            // Save draft invoice to Firestore database
            await db.collection("invoices").doc(docId).set(draftDocument);

            // Update CRM Deal / Lead Status
            const newCrmStatus = isInvoice ? "negotiation" : "proposal_sent";
            await leadRef.update({
              status: newCrmStatus,
              value: totalAmountHalalas / 100,
              lastInvoiceId: docId,
              updatedAt: new Date().toISOString(),
            });

            console.log(`✓ [Gemini Intent Engine] Created ZATCA Draft ${docNumber} for lead ${leadId}. CRM Status: '${newCrmStatus}'`);
          }
        }
      } catch (intentErr: any) {
        console.warn("[Gemini Intent Extraction Warning]:", intentErr.message);
      }
    }

    // Prepare Gemini Prompt with Saudi Business Context & Draft Link Injection
    const conversationHistory = updatedMessagesWithUser
      .slice(-10)
      .map((m: any) => `${m.sender === "user" ? "المندوب" : m.sender === "client" ? "العميل" : "مساعد الذكاء الاصطناعي"}: ${m.text}`)
      .join("\n");

    let prompt = `You are a polite, professional, and knowledgeable AI Sales Copilot for Saudi Enterprise Operating System (Mudarij OS / مدارج OS).
You are communicating with client ${leadData.name || "العزيز"} from company ${leadData.company || "الشركة"}.
Context: Mudarij OS provides ZATCA Phase 2 E-Invoicing, WPS Payroll (Mudad), Contracts, CRM, and Supply Chain.

Conversation History:
${conversationHistory}`;

    if (draftDocument) {
      const isInvoice = draftDocument.type === "invoice";
      const totalSAR = (draftDocument.totalAmountHalalas / 100).toLocaleString("ar-SA");
      prompt += `\n\nAUTOMATED ACTION COMPLETED:
A draft ${isInvoice ? "Tax Invoice (فاتورة ضريبية مرحلة ثانية)" : "Quote Proposal (عرض سعر ضريبي)"} has been created automatically!
- Document Number: ${draftDocument.number}
- Total with 15% ZATCA VAT: ${totalSAR} SAR
- Link to Review/Pay: ${draftDocument.publicPath}

INSTRUCTIONS:
1. Enthusiastically confirm to the client that their ${isInvoice ? "tax invoice" : "quotation proposal"} has been created and logged in the system.
2. Highlight that the document is ZATCA Phase 2 compliant with 15% VAT.
3. INCLUDE THE EXACT LINK in your response text: ${draftDocument.publicPath} so the client can click and preview or settle it immediately in the chat!`;
    } else {
      prompt += `\n\nTask: Respond to the client's inquiry in fluent, professional Arabic suitable for Saudi corporate business. Provide accurate answers and offer relevant Mudarij OS modules.`;
    }

    if (!ai) {
      const fallbackText = draftDocument
        ? `أهلاً بك! تم إنشاء مسودة ${draftDocument.type === "invoice" ? "الفاتورة الضريبية" : "عرض السعر"} (رقم: ${draftDocument.number}) بنجاح بقيمة ${(draftDocument.totalAmountHalalas / 100).toLocaleString("ar-SA")} ر.س شاملة 15% ضريبة الزكاة والدخل.\nيمكنك المعاينة والدفع عبر الرابط: ${draftDocument.publicPath}`
        : "مرحباً بكم! يسعدنا في منصة مدارج تقديم المساعدة المباشرة لأتمتة أعمالكم والامتثال مع الزكاة والضريبة. كيف يمكننا خدمتكم اليوم؟";

      const aiMsg = {
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: fallbackText,
        timestamp: new Date().toISOString(),
        status: "delivered",
      };
      await leadRef.update({
        messages: [...updatedMessagesWithUser, aiMsg],
        status: "in_progress",
      });
      res.write(`data: ${JSON.stringify({ text: fallbackText })}\n\n`);
      res.write("data: [DONE]\n\n");
      return res.end();
    }

    let accumulatedText = "";
    try {
      const responseStream = await ai.models.generateContentStream({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.4,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          res.write(`data: ${JSON.stringify({ text: chunk.text, fullText: accumulatedText })}\n\n`);
        }
      }
    } catch (err: any) {
      console.error("[Gemini Streaming Error, using fallback model]:", err);
      const fallbackResp = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });
      accumulatedText =
        fallbackResp.text ||
        `أهلاً بك! تم استلام طلبك وسيقوم فريق المبيعات والامتثال بالتواصل معكم مباشرة.\nرابط الاستعراض: ${draftDocument?.publicPath || "/app/invoices"}`;
      res.write(`data: ${JSON.stringify({ text: accumulatedText, fullText: accumulatedText })}\n\n`);
    }

    // Persist AI reply message directly into Firestore
    const aiMsg = {
      id: `msg_ai_${Date.now()}`,
      sender: "ai",
      text: accumulatedText.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    const finalMessages = [...updatedMessagesWithUser, aiMsg];
    await leadRef.update({
      messages: finalMessages,
      status: draftDocument ? (draftDocument.type === "invoice" ? "negotiation" : "proposal_sent") : (leadData.status === "new" ? "in_progress" : leadData.status),
      updatedAt: new Date().toISOString(),
    });

    logAudit("OmnichannelChat", { action: "Streamed AI Reply with Intent", leadId, detectedIntent }, { messageLength: accumulatedText.length }, req);

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err: any) {
    console.error("[Chat Stream Route Error]:", err);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

// 2. Non-Streaming Endpoint for Instant Auto-Reply
router.post("/reply", authenticate, async (req: any, res: any) => {
  try {
    const { leadId, messageText } = req.body;
    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) return res.status(404).json({ error: "Lead not found" });

    const leadData = leadSnap.data();
    if (leadData?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `أنت مساعد مبيعات ذكي لنظام مدارج OS السعودي. اكتب رداً احترافياً موجزاً بالعربية للعميل: ${messageText}`,
    });

    const aiText = response.text || "شكراً لتواصلكم، يسعدنا خدمتكم في منصة مدارج OS.";

    const aiMsg = {
      id: `msg_ai_${Date.now()}`,
      sender: "ai",
      text: aiText,
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    const currentMessages = leadData.messages || [];
    const updatedMessages = [...currentMessages, aiMsg];

    await leadRef.update({
      messages: updatedMessages,
      status: "in_progress",
      updatedAt: new Date().toISOString(),
    });

    res.json({ success: true, aiMessage: aiMsg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Real Outbound Omnichannel Dispatch (WhatsApp, Telegram, Live Web Chat)
router.post("/send", authenticate, async (req: any, res: any) => {
  try {
    const { leadId, text, channel = "whatsapp", mediaUrl, mediaType, fileName } = req.body;

    if (!leadId || (!text && !mediaUrl)) {
      return res.status(400).json({ error: "leadId and either text or mediaUrl are required" });
    }

    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const leadData = leadSnap.data();

    let sentLive = false;
    let externalMsgId = null;
    let externalError = null;

    const isInternal = req.body.isInternalNote === true || req.body.isInternal === true;

    // A. Dispatch via Meta WhatsApp Business Cloud API (skip if internal note)
    if (!isInternal && channel === "whatsapp") {
      const waToken = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      let rawPhone = leadData?.phone || "";
      let cleanPhone = rawPhone.replace(/\D/g, "");
      if (cleanPhone.startsWith("05") && cleanPhone.length === 10) {
        cleanPhone = "966" + cleanPhone.substring(1);
      }

      if (waToken && waPhoneId && cleanPhone) {
        try {
          let waPayload: any = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanPhone,
          };

          if (mediaUrl) {
            const waType = mediaType === "image" ? "image" : "document";
            waPayload.type = waType;
            waPayload[waType] = {
              link: mediaUrl,
              caption: text || "",
            };
            if (waType === "document") {
              waPayload.document.filename = fileName || "document.pdf";
            }
          } else {
            waPayload.type = "text";
            waPayload.text = { body: text };
          }

          const waRes = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${waToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(waPayload),
          });

          const waData = await waRes.json();
          if (waRes.ok && waData.messages?.[0]?.id) {
            sentLive = true;
            externalMsgId = waData.messages[0].id;
            console.log(`✓ Meta WhatsApp API sent live to ${cleanPhone}: ID ${externalMsgId}`);
          } else {
            externalError = waData.error?.message || JSON.stringify(waData);
            console.warn(`⚠️ Meta WhatsApp API response:`, externalError);
          }
        } catch (err: any) {
          console.error("WhatsApp dispatch network error:", err);
          externalError = err.message;
        }
      }
    }

    // B. Dispatch via Telegram Bot API (skip if internal note)
    if (!isInternal && channel === "telegram") {
      const tgToken = process.env.TELEGRAM_BOT_TOKEN;
      const tgChatId = leadData?.telegramChatId || leadData?.phone?.replace(/\D/g, "");

      if (tgToken && tgChatId) {
        try {
          let tgEndpoint = `https://api.telegram.org/bot${tgToken}/sendMessage`;
          let tgBody: any = {
            chat_id: tgChatId,
            text: text || "",
          };

          if (mediaUrl) {
            if (mediaType === "image") {
              tgEndpoint = `https://api.telegram.org/bot${tgToken}/sendPhoto`;
              tgBody = { chat_id: tgChatId, photo: mediaUrl, caption: text || "" };
            } else {
              tgEndpoint = `https://api.telegram.org/bot${tgToken}/sendDocument`;
              tgBody = { chat_id: tgChatId, document: mediaUrl, caption: text || "" };
            }
          }

          const tgRes = await fetch(tgEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(tgBody),
          });

          const tgData = await tgRes.json();
          if (tgRes.ok && tgData.ok) {
            sentLive = true;
            externalMsgId = `tg_${tgData.result?.message_id}`;
            console.log(`✓ Telegram Bot API sent live to ${tgChatId}: ID ${externalMsgId}`);
          } else {
            externalError = tgData.description || JSON.stringify(tgData);
            console.warn(`⚠️ Telegram Bot API response:`, externalError);
          }
        } catch (err: any) {
          console.error("Telegram dispatch network error:", err);
          externalError = err.message;
        }
      }
    }

    // Construct outbound message object
    const outboundMsg = isInternal
      ? {
          id: `note_${Date.now()}`,
          sender: "internal_note" as const,
          isInternalNote: true,
          authorName: req.user.email?.split("@")[0] || "موظف المبيعات",
          text: text,
          timestamp: new Date().toISOString(),
          status: "delivered" as const,
          channel: "internal" as const,
        }
      : {
          id: externalMsgId || `msg_out_${Date.now()}`,
          sender: "user" as const,
          text: text || (mediaUrl ? `[مرفق وسائط: ${mediaType || "ملف"}]` : ""),
          timestamp: new Date().toISOString(),
          status: sentLive ? ("delivered" as const) : ("sent" as const),
          channel,
          mediaUrl: mediaUrl || null,
          mediaType: mediaType || null,
          fileName: fileName || null,
          sentLive,
          externalError: externalError || null,
        };

    const existingMessages = leadData?.messages || [];
    const updatedMessages = [...existingMessages, outboundMsg];

    await leadRef.update({
      messages: updatedMessages,
      lastMessageTime: outboundMsg.timestamp,
      unreadCount: 0, // Reset unread when staff replies
      updatedAt: new Date().toISOString(),
    });

    logAudit("OmnichannelChat", { action: isInternal ? "Saved Internal Note" : "Dispatched Outbound Message", leadId, channel, sentLive }, { textLength: text?.length || 0 }, req);

    res.json({
      success: true,
      isInternalNote: isInternal,
      sentLive,
      externalMsgId,
      externalError,
      message: outboundMsg,
    });
  } catch (err: any) {
    console.error("[Chat Send Route Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Assign Conversation & Trigger FCM Push Notification
router.post("/assign", authenticate, async (req: any, res: any) => {
  try {
    const { leadId, assignedToUserId, assignedToName } = req.body;

    if (!leadId || !assignedToName) {
      return res.status(400).json({ error: "leadId and assignedToName are required" });
    }

    const leadRef = db.collection("leads").doc(leadId);
    const leadSnap = await leadRef.get();

    if (!leadSnap.exists) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const leadData = leadSnap.data();

    await leadRef.update({
      assignedToUserId: assignedToUserId || "emp_default",
      assignedToName,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Create Push Notification Payload in Firestore notifications collection (FCM Pipeline)
    const notificationDoc = {
      userId: assignedToUserId || "emp_default",
      title: "🔔 إسناد محادثة جديدة (FCM Push)",
      body: `تم إسناد محادثة العميل (${leadData?.name || "عميل جديد"}) إليك بواسطة ${req.user?.email || "إدارة النظام"}.`,
      type: "chat_assignment",
      leadId,
      clientName: leadData?.name,
      fcmPayload: {
        notification: {
          title: "إسناد محادثة جديدة - مدارج OS",
          body: `تم إسناد محادثة العميل ${leadData?.name} إليك`,
        },
        data: {
          leadId,
          click_action: "/app/chat",
        },
      },
      read: false,
      createdAt: new Date().toISOString(),
    };

    const notifRef = await db.collection("notifications").add(notificationDoc);

    logAudit("OmnichannelChat", { action: "Assigned Conversation & Dispatched FCM", leadId, assignedToName }, { notifId: notifRef.id }, req);

    res.json({
      success: true,
      assignedToName,
      assignedToUserId,
      notificationId: notifRef.id,
      fcmStatus: "SENT_TO_FIREBASE_MESSAGING",
    });
  } catch (err: any) {
    console.error("[Chat Assign Route Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
