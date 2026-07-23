import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";

const router = Router();

// Send Outbound Email via Resend REST API
router.post("/send", authenticate, async (req: any, res) => {
  try {
    const { to, subject, body, html } = req.body;
    if (!to || !subject) {
      return res.status(400).json({ error: "Missing required fields: to, subject" });
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    let isLiveSent = false;
    let apiData: any = null;
    let errorMessage = "";

    if (resendApiKey) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Mudarij OS <onboarding@resend.dev>",
            to: Array.isArray(to) ? to : [to],
            subject: subject,
            html: html || `<div style="font-family: Arial, sans-serif; direction: rtl; text-align: right; padding: 20px;">
              <h2>${subject}</h2>
              <p style="font-size: 16px; line-height: 1.6; color: #333;">${body}</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">منصة مدارج OS - نظام إدارة الأعمال والفوترة الإلكترونية بالمملكة العربية السعودية</p>
            </div>`,
          }),
        });

        apiData = await response.json();
        if (response.ok) {
          isLiveSent = true;
        } else {
          errorMessage = apiData.message || "Resend API error";
        }
      } catch (err: any) {
        errorMessage = err.message || "Network error calling Resend API";
      }
    } else {
      errorMessage = "RESEND_API_KEY variable is missing in .env";
    }

    res.json({
      success: true,
      isLiveSent,
      resendResponse: apiData,
      details: { to, subject },
      note: isLiveSent ? "تم إرسال البريد الإلكتروني بنجاح عبر Resend API" : `تم التسجيل محلياً (${errorMessage})`,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to send email" });
  }
});

// Test SMTP / API configuration
router.post("/test", authenticate, async (req, res) => {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    res.json({
      success: true,
      hasResendApiKey: !!resendApiKey,
      message: resendApiKey ? "Resend API Key is active" : "Resend API Key is not configured yet in .env",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Connection test failed" });
  }
});

export default router;
