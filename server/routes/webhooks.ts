import { Router } from "express";
import crypto from "crypto";
import { db } from "../services/firebase.ts";
import { logAudit } from "../services/utils.ts";

const router = Router();

// Clean and normalize Saudi & international phone numbers
function normalizePhone(num: string): string {
  if (!num) return "";
  let cleaned = num.replace(/\D/g, "");
  if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }
  if (cleaned.startsWith("05") && cleaned.length === 10) {
    cleaned = "966" + cleaned.substring(1);
  }
  return cleaned;
}

// ----------------------------------------------------------------------
// 1. Meta WhatsApp Business Cloud API Webhooks
// ----------------------------------------------------------------------

// GET /api/webhooks/whatsapp - Webhook Verification Challenge from Meta
router.get("/whatsapp", (req: any, res: any) => {
  try {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    const expectedVerifyToken =
      process.env.WHATSAPP_VERIFY_TOKEN ||
      process.env.WHATSAPP_API_TOKEN ||
      "madarij_wa_verify_secret";

    console.log("[WhatsApp Webhook Verification Request]", { mode, token });

    if (mode === "subscribe" && token === expectedVerifyToken) {
      console.log("✓ WhatsApp Webhook Verified successfully with Meta!");
      return res.status(200).send(challenge);
    } else {
      console.warn("❌ WhatsApp Webhook verification failed. Token mismatch.");
      return res.status(403).json({ error: "Verification token mismatch" });
    }
  } catch (err: any) {
    console.error("[WhatsApp Webhook GET Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhooks/whatsapp - Receive Incoming WhatsApp Messages & Events
router.post("/whatsapp", async (req: any, res: any) => {
  try {
    const rawBody = JSON.stringify(req.body);

    // Cryptographic Signature Verification (X-Hub-Signature-256)
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    const signatureHeader = req.headers["x-hub-signature-256"] as string;

    if (appSecret && signatureHeader) {
      const expectedSignature =
        "sha256=" +
        crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");

      if (
        !crypto.timingSafeEqual(
          Buffer.from(signatureHeader),
          Buffer.from(expectedSignature)
        )
      ) {
        console.warn("❌ WhatsApp HMAC Signature Verification Failed!");
        return res.status(401).json({ error: "Invalid HMAC Signature" });
      }
    }

    const payload = req.body;

    // Log payload in Firestore whatsapp_queue for audit trail
    await db.collection("whatsapp_queue").add({
      payload,
      headers: req.headers,
      receivedAt: new Date().toISOString(),
      status: "received",
    });

    if (payload.object === "whatsapp_business_account" && Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (!Array.isArray(entry.changes)) continue;

        for (const change of entry.changes) {
          const value = change.value;
          if (!value) continue;

          const contacts = value.contacts || [];
          const messages = value.messages || [];

          for (const msg of messages) {
            const senderPhone = normalizePhone(msg.from || "");
            const contactName =
              contacts.find((c: any) => c.wa_id === msg.from)?.profile?.name ||
              `عميل واتساب (${senderPhone})`;

            let messageText = "";
            let mediaUrl = "";
            let mediaType = "";
            let fileName = "";

            // Parse message type
            if (msg.type === "text" && msg.text) {
              messageText = msg.text.body;
            } else if (msg.type === "image" && msg.image) {
              messageText = msg.image.caption || "📷 صورة مرفقة عبر واتساب";
              mediaUrl = msg.image.url || `https://graph.facebook.com/v18.0/${msg.image.id}`;
              mediaType = "image";
            } else if (msg.type === "document" && msg.document) {
              messageText = msg.document.caption || msg.document.filename || "📄 مستند مرفق عبر واتساب";
              mediaUrl = msg.document.url || `https://graph.facebook.com/v18.0/${msg.document.id}`;
              mediaType = "document";
              fileName = msg.document.filename || "document.pdf";
            } else if (msg.type === "audio" || msg.type === "voice") {
              messageText = "🎵 تسجيل صوتي محول عبر واتساب";
              mediaType = "audio";
            } else if (msg.type === "location" && msg.location) {
              messageText = `📍 موقع جغرافي: ${msg.location.name || ""} (${msg.location.latitude}, ${msg.location.longitude})`;
            } else if (msg.type === "interactive" && msg.interactive) {
              messageText = msg.interactive.button_reply?.title || msg.interactive.list_reply?.title || "اختيار تفاعلي";
            } else {
              messageText = `[رسالة من نوع ${msg.type}]`;
            }

            // Construct standardized message object
            const incomingMsg = {
              id: msg.id || `wa_in_${Date.now()}`,
              sender: "client" as const,
              text: messageText,
              timestamp: msg.timestamp
                ? new Date(parseInt(msg.timestamp) * 1000).toISOString()
                : new Date().toISOString(),
              status: "delivered" as const,
              channel: "whatsapp" as const,
              mediaUrl: mediaUrl || null,
              mediaType: mediaType || null,
              fileName: fileName || null,
            };

            // Look up existing lead in Firestore by phone
            const leadsSnap = await db.collection("leads").get();
            let matchedDoc: any = null;

            for (const docSnap of leadsSnap.docs) {
              const lData = docSnap.data();
              const lPhone = normalizePhone(lData.phone || "");
              if (lPhone && (lPhone === senderPhone || senderPhone.endsWith(lPhone) || lPhone.endsWith(senderPhone))) {
                matchedDoc = docSnap;
                break;
              }
            }

            if (matchedDoc) {
              // Append to existing lead
              const leadData = matchedDoc.data();
              const existingMsgs = leadData.messages || [];
              const updatedMsgs = [...existingMsgs, incomingMsg];
              const currentUnread = (leadData.unreadCount || 0) + 1;

              await matchedDoc.ref.update({
                messages: updatedMsgs,
                lastMessageTime: incomingMsg.timestamp,
                unreadCount: currentUnread,
                updatedAt: new Date().toISOString(),
              });

              console.log(`✓ Synchronized incoming WhatsApp msg to lead ID: ${matchedDoc.id}`);
            } else {
              // Create a brand new lead in Firestore
              const newLead = {
                userId: "sys_omnichannel_bot",
                name: contactName,
                company: "محادثة واتساب مباشرة",
                phone: `+${senderPhone}`,
                status: "new",
                value: 0,
                messages: [incomingMsg],
                unreadCount: 1,
                lastMessageTime: incomingMsg.timestamp,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                channel: "whatsapp",
              };

              const newRef = await db.collection("leads").add(newLead);
              console.log(`✓ Created new lead for WhatsApp message ID: ${newRef.id}`);
            }
          }
        }
      }
    }

    res.status(200).json({ status: "success", received: true });
  } catch (err: any) {
    console.error("[WhatsApp Webhook POST Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------------------------------------------------------
// 2. Telegram Bot API Webhooks
// ----------------------------------------------------------------------

// POST /api/webhooks/telegram - Receive Incoming Telegram Messages
router.post("/telegram", async (req: any, res: any) => {
  try {
    const secretTokenHeader = req.headers["x-telegram-bot-api-secret-token"];
    const expectedSecret = process.env.TELEGRAM_SECRET_TOKEN;

    if (expectedSecret && secretTokenHeader !== expectedSecret) {
      console.warn("❌ Telegram Secret Token Verification Failed!");
      return res.status(401).json({ error: "Invalid Telegram Secret Token" });
    }

    const update = req.body;
    const message = update.message || update.edited_message;

    if (message) {
      const chatId = String(message.chat.id);
      const fromUser = message.from || {};
      const firstName = fromUser.first_name || "";
      const lastName = fromUser.last_name || "";
      const username = fromUser.username ? `@${fromUser.username}` : "";
      const fullName = `${firstName} ${lastName}`.trim() || username || `مستخدم تيليجرام (${chatId})`;

      let messageText = "";
      let mediaUrl = "";
      let mediaType = "";
      let fileName = "";

      if (message.text) {
        messageText = message.text;
      } else if (message.photo && message.photo.length > 0) {
        messageText = message.caption || "📷 صورة مرفقة عبر تيليجرام";
        const largestPhoto = message.photo[message.photo.length - 1];
        mediaUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${largestPhoto.file_id}`;
        mediaType = "image";
      } else if (message.document) {
        messageText = message.caption || message.document.file_name || "📄 مستند مرفق عبر تيليجرام";
        mediaUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${message.document.file_id}`;
        mediaType = "document";
        fileName = message.document.file_name || "document.pdf";
      } else if (message.voice) {
        messageText = "🎵 تسجيل صوتي مرفق عبر تيليجرام";
        mediaType = "audio";
      } else {
        messageText = "[رسالة تيليجرام تفاعلية]";
      }

      const incomingMsg = {
        id: `tg_in_${message.message_id || Date.now()}`,
        sender: "client" as const,
        text: messageText,
        timestamp: message.date
          ? new Date(message.date * 1000).toISOString()
          : new Date().toISOString(),
        status: "delivered" as const,
        channel: "telegram" as const,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        fileName: fileName || null,
      };

      // Query Firestore for existing lead by telegramChatId or username
      const leadsSnap = await db.collection("leads").get();
      let matchedDoc: any = null;

      for (const docSnap of leadsSnap.docs) {
        const lData = docSnap.data();
        if (
          lData.telegramChatId === chatId ||
          (username && lData.phone && lData.phone.includes(username)) ||
          (lData.phone && lData.phone.includes(chatId))
        ) {
          matchedDoc = docSnap;
          break;
        }
      }

      if (matchedDoc) {
        const leadData = matchedDoc.data();
        const existingMsgs = leadData.messages || [];
        const updatedMsgs = [...existingMsgs, incomingMsg];
        const currentUnread = (leadData.unreadCount || 0) + 1;

        await matchedDoc.ref.update({
          messages: updatedMsgs,
          telegramChatId: chatId,
          lastMessageTime: incomingMsg.timestamp,
          unreadCount: currentUnread,
          updatedAt: new Date().toISOString(),
        });

        console.log(`✓ Synchronized Telegram message to lead ID: ${matchedDoc.id}`);
      } else {
        const newLead = {
          userId: "sys_omnichannel_bot",
          name: fullName,
          company: "محادثة تيليجرام مباشرة",
          phone: username || `TG:${chatId}`,
          telegramChatId: chatId,
          status: "new",
          value: 0,
          messages: [incomingMsg],
          unreadCount: 1,
          lastMessageTime: incomingMsg.timestamp,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          channel: "telegram",
        };

        const newRef = await db.collection("leads").add(newLead);
        console.log(`✓ Created new lead for Telegram message ID: ${newRef.id}`);
      }
    }

    res.status(200).json({ ok: true });
  } catch (err: any) {
    console.error("[Telegram Webhook POST Error]:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/webhooks/status - Check status of active webhooks
router.get("/status", async (req: any, res: any) => {
  try {
    const waToken = process.env.WHATSAPP_API_TOKEN;
    const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;

    const domain = req.get("host") || "app.madarij-os.com";
    const protocol = req.protocol || "https";
    const baseUrl = `${protocol}://${domain}`;

    let tgBotInfo = null;
    let tgWebhookInfo = null;

    if (tgToken) {
      try {
        const meRes = await fetch(`https://api.telegram.org/bot${tgToken}/getMe`);
        if (meRes.ok) {
          tgBotInfo = await meRes.json();
        }

        const webhookRes = await fetch(`https://api.telegram.org/bot${tgToken}/getWebhookInfo`);
        if (webhookRes.ok) {
          tgWebhookInfo = await webhookRes.json();
        }
      } catch (e) {
        console.error("Telegram status check failed", e);
      }
    }

    res.json({
      status: "active",
      baseUrl,
      webhooks: {
        whatsapp: {
          url: `${baseUrl}/api/webhooks/whatsapp`,
          configured: !!(waToken && waPhoneId),
          verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || "madarij_wa_verify_secret",
          hasSecret: !!process.env.WHATSAPP_APP_SECRET,
        },
        telegram: {
          url: `${baseUrl}/api/webhooks/telegram`,
          configured: !!tgToken,
          botInfo: tgBotInfo?.result || null,
          webhookInfo: tgWebhookInfo?.result || null,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/webhooks/telegram/setup - Automatically register Telegram Webhook URL
router.post("/telegram/setup", async (req: any, res: any) => {
  try {
    const { botToken, webhookUrl } = req.body;
    const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return res.status(400).json({ error: "TELEGRAM_BOT_TOKEN is required" });
    }

    const domain = req.get("host");
    const protocol = req.protocol || "https";
    const targetUrl = webhookUrl || `${protocol}://${domain}/api/webhooks/telegram`;

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: targetUrl,
        allowed_updates: ["message", "edited_message"],
        secret_token: process.env.TELEGRAM_SECRET_TOKEN || undefined,
      }),
    });

    const data = await tgRes.json();

    logAudit("Webhooks", { action: "Set Telegram Webhook", targetUrl }, data, req);

    res.json({
      success: data.ok,
      telegramResponse: data,
      registeredUrl: targetUrl,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
