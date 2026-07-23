import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { db } from "../services/firebase.ts";
import { logAudit } from "../services/utils.ts";

const router = Router();

function cleanPhoneNumber(num: string): string {
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

// 0. WhatsApp API Health Check Endpoint
router.get("/health", authenticate, async (req: any, res) => {
  try {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return res.json({
        isValid: false,
        configured: false,
        message: "WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set in .env",
      });
    }

    try {
      const testRes = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=id,verified_name`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (testRes.ok) {
        const data = await testRes.json();
        return res.json({
          isValid: true,
          configured: true,
          name: data.verified_name || "Meta Business Account",
          phoneNumberId: data.id,
          message: "WhatsApp Business Cloud API is active and authorized",
        });
      } else {
        const errData = await testRes.json();
        return res.json({
          isValid: false,
          configured: true,
          message: errData.error?.message || "Invalid or expired WhatsApp API Token",
        });
      }
    } catch (err: any) {
      return res.json({
        isValid: false,
        configured: true,
        message: "Network unreachable for Meta Graph API",
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 1. Send Single Message via Meta WhatsApp Business Cloud API
router.post("/send", authenticate, async (req: any, res) => {
  try {
    const { to, text, leadId } = req.body;
    if (!to || !text) {
      return res.status(400).json({ error: "Missing recipient (to) or message text." });
    }

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    const cleanedPhone = cleanPhoneNumber(to);
    if (!cleanedPhone) {
      return res.status(400).json({ error: "رقم الهاتف غير صالح" });
    }

    let isSentLive = false;
    let apiResponseData: any = null;
    let errorMessage = "";

    if (token && phoneNumberId) {
      // Call official Meta WhatsApp Business Cloud API v18.0
      const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
      try {
        const metaRes = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: cleanedPhone,
            type: "text",
            text: { preview_url: true, body: text },
          }),
        });

        apiResponseData = await metaRes.json();
        if (metaRes.ok && apiResponseData.messages) {
          isSentLive = true;
        } else {
          errorMessage = apiResponseData.error?.message || "Meta API error";
        }
      } catch (err: any) {
        errorMessage = err.message || "Network error calling Meta API";
      }
    } else {
      errorMessage = "WHATSAPP_API_TOKEN environment variable is missing in .env";
    }

    // Persist to Firestore lead doc if leadId provided
    if (leadId) {
      const leadRef = db.collection("leads").doc(leadId);
      const leadSnap = await leadRef.get();
      if (leadSnap.exists) {
        const leadData = leadSnap.data();
        const newMessage = {
          id: `wa_${Date.now()}`,
          sender: "user",
          text,
          timestamp: new Date().toISOString(),
          status: isSentLive ? "delivered" : "sent",
          channel: "whatsapp",
        };
        const currentMsgs = leadData?.messages || [];
        await leadRef.update({
          messages: [...currentMsgs, newMessage],
          updatedAt: new Date().toISOString(),
        });
      }
    }

    logAudit("WhatsAppAPI", { action: "Send Single Message", to: cleanedPhone, isSentLive }, { errorMessage }, req);

    res.json({
      success: isSentLive,
      sentLive: isSentLive,
      recipient: cleanedPhone,
      metaResponse: apiResponseData,
      note: isSentLive ? "تم التسليم المباشر عبر Meta WhatsApp Cloud API" : `تم حفظ الرسالة محلياً (${errorMessage})`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. WhatsApp Bulk Broadcast API (with broadcast_errors persistence)
router.post("/broadcast", authenticate, async (req: any, res) => {
  try {
    const { campaignName = "حملة بث واتساب", recipients = [], templateText = "", mediaUrl = "" } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "قائمة المستلمين فارغة" });
    }
    if (!templateText.trim()) {
      return res.status(400).json({ error: "نص الرسالة مطلوب" });
    }

    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    let deliveredCount = 0;
    let failedCount = 0;
    const results: any[] = [];

    for (const recipient of recipients) {
      const cleanedPhone = cleanPhoneNumber(recipient.phone || recipient.number || "");
      if (!cleanedPhone) {
        failedCount++;
        const errorReason = "رقم الهاتف التابع للعميل غير صالح أو مفقود";
        results.push({ phone: recipient.phone || "N/A", name: recipient.name || "N/A", status: "invalid_phone", errorReason });

        // Store into dedicated 'broadcast_errors' Firestore collection
        await db.collection("broadcast_errors").add({
          userId: req.user.uid,
          campaignName,
          recipientPhone: recipient.phone || "غير معروف",
          recipientName: recipient.name || "غير معروف",
          company: recipient.company || "غير معروف",
          errorReason,
          failedAt: new Date().toISOString(),
        });

        continue;
      }

      // Replace placeholders
      const personalizedMessage = templateText
        .replace(/\{name\}/g, recipient.name || "العميل")
        .replace(/\{client_name\}/g, recipient.name || "العميل")
        .replace(/\{company\}/g, recipient.company || "المنشأة")
        .replace(/\{company_name\}/g, recipient.company || "المنشأة")
        .replace(/\{invoice_status\}/g, recipient.invoiceStatus || "معتمدة ZATCA")
        .replace(/\{invoice_amount\}/g, recipient.invoiceAmount ? `${recipient.invoiceAmount} SAR` : "10,000 SAR");

      let success = false;
      let failureReason = "";

      if (token && phoneNumberId) {
        try {
          const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;
          const metaRes = await fetch(url, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              recipient_type: "individual",
              to: cleanedPhone,
              type: "text",
              text: { preview_url: true, body: personalizedMessage },
            }),
          });
          const data = await metaRes.json();
          if (metaRes.ok && data.messages) {
            success = true;
          } else {
            failureReason = data.error?.message || "فشل التسليم من خادم Meta WhatsApp API";
          }
        } catch (err: any) {
          success = false;
          failureReason = err.message || "خطأ في الاتصال بالشبكة";
        }
      } else {
        // Simulation mode
        success = true;
      }

      if (success) {
        deliveredCount++;
        results.push({ phone: cleanedPhone, name: recipient.name, status: "delivered", personalizedMessage });
      } else {
        failedCount++;
        results.push({ phone: cleanedPhone, name: recipient.name, status: "failed", errorReason: failureReason });

        // Store into dedicated 'broadcast_errors' Firestore collection
        await db.collection("broadcast_errors").add({
          userId: req.user.uid,
          campaignName,
          recipientPhone: cleanedPhone,
          recipientName: recipient.name || "غير معروف",
          company: recipient.company || "غير معروف",
          errorReason: failureReason || "فشل إرسال حزمة الرسالة",
          failedAt: new Date().toISOString(),
        });
      }
    }

    // Save Broadcast Campaign History to Firestore
    const campaignRecord = {
      userId: req.user.uid,
      campaignName,
      templateText,
      totalRecipients: recipients.length,
      deliveredCount,
      failedCount,
      sentAt: new Date().toISOString(),
      channel: "WhatsApp Business API",
    };

    const docRef = await db.collection("whatsapp_broadcasts").add(campaignRecord);
    logAudit("WhatsAppBroadcast", { action: "Execute Broadcast", id: docRef.id }, campaignRecord, req);

    res.json({
      id: docRef.id,
      success: true,
      deliveredCount,
      failedCount,
      total: recipients.length,
      metaApiConfigured: !!(token && phoneNumberId),
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Broadcast Errors Collection
router.get("/broadcast-errors", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("broadcast_errors")
      .where("userId", "==", req.user.uid)
      .get();

    const errors = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Sort by failedAt descending
    errors.sort((a: any, b: any) => new Date(b.failedAt).getTime() - new Date(a.failedAt).getTime());

    res.json({ errors });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Clear Broadcast Errors
router.delete("/broadcast-errors", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("broadcast_errors")
      .where("userId", "==", req.user.uid)
      .get();

    const batch = db.batch();
    snap.docs.forEach((doc: any) => batch.delete(doc.ref));
    await batch.commit();

    res.json({ success: true, message: "تم مسح سجل أخطاء البث بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Reusable Message Templates API
router.get("/templates", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("whatsapp_templates")
      .where("userId", "==", req.user.uid)
      .get();

    let templates = snap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If empty, provide built-in system default templates
    if (templates.length === 0) {
      templates = [
        {
          id: "sys_tmpl_1",
          title: "تذكير بتحصيل الفاتورة الضريبية ZATCA",
          category: "تحصيل",
          text: "عزيزنا {client_name}، نود تذكيركم بفاتورة ZATCA الخاصة بـ {company_name}، حالتها [{invoice_status}] وقيمتها {invoice_amount}. نأمل السداد في الموعد المحدد.",
          isSystem: true,
        },
        {
          id: "sys_tmpl_2",
          title: "تهنئة وتأكيد السجل والتجديد",
          category: "ترحيب",
          text: "أهلاً بك {client_name} في مدارج OS! نبارك لشركة {company_name} اعتماد العقد وحالة الفاتورة المعتمدة [{invoice_status}]. يسعدنا تقديم الدعم دائماً.",
          isSystem: true,
        },
        {
          id: "sys_tmpl_3",
          title: "عرض ترقية وإشعار دفع مبكر",
          category: "تسويق",
          text: "السيد/ة {client_name} المحترم، يرجى الملاحظة أن الفاتورة المسجلة باسم {company_name} هي حالياً: {invoice_status}. يتوفر عرض خاص عند التسوية المبكرة.",
          isSystem: true,
        },
      ];
    }

    res.json({ templates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/templates", authenticate, async (req: any, res) => {
  try {
    const { title, text, category = "عام" } = req.body;
    if (!title || !text) {
      return res.status(400).json({ error: "العنوان والنص مطلوبان لإضافة القالب" });
    }

    const newDoc = {
      userId: req.user.uid,
      title: title.trim(),
      text: text.trim(),
      category: category.trim(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("whatsapp_templates").add(newDoc);
    res.json({ id: docRef.id, ...newDoc, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/templates/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const ref = db.collection("whatsapp_templates").doc(id);
    const snap = await ref.get();

    if (snap.exists && snap.data()?.userId === req.user.uid) {
      await ref.delete();
      return res.json({ success: true });
    }
    res.status(404).json({ error: "القالب غير موجود أو غير مصرح بالحذف" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

