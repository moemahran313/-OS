import { Router } from "express";
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

// 1. SSE Real-Time Streaming Chat Route powered by Gemini AI
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

    // Prepare Gemini Prompt with Saudi Business Context
    const conversationHistory = updatedMessagesWithUser
      .slice(-10)
      .map((m: any) => `${m.sender === "user" ? "المندوب" : m.sender === "client" ? "العميل" : "مساعد الذكاء الاصطناعي"}: ${m.text}`)
      .join("\n");

    const prompt = `You are a polite, professional, and knowledgeable AI Sales Copilot for a Saudi Enterprise Operating System (Mudarij OS / مدارج OS).
You are communicating with client ${leadData.name || "العزيز"} from company ${leadData.company || "الشركة"}.
Context: Mudarij OS provides ZATCA Phase 2 E-Invoicing, WPS Payroll (Mudad), Contracts, CRM, and Supply Chain automation.

Conversation History:
${conversationHistory}

Task: Respond to the client's inquiry in fluent, professional Arabic suitable for Saudi corporate business. Provide accurate answers, offer relevant Mudarij OS modules, and keep responses concise and clear.`;

    let ai;
    try {
      ai = getGeminiClient();
    } catch {
      const fallbackText = "مرحباً بكم! يسعدنا في منصة مدارج تقديم المساعدة المباشرة لأتمتة أعمالكم والامتثال مع الزكاة والضريبة. كيف يمكننا خدمتكم اليوم؟";
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
      // Fallback model
      const fallbackResp = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });
      accumulatedText = fallbackResp.text || "أهلاً بك! تم استلام رسالتكم وسيقوم فريق المبيعات والامتثال بالتواصل معكم مباشرة.";
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
      status: leadData.status === "new" ? "in_progress" : leadData.status,
      updatedAt: new Date().toISOString(),
    });

    logAudit("OmnichannelChat", { action: "Streamed AI Reply", leadId }, { messageLength: accumulatedText.length }, req);

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

export default router;
