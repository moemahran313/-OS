import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit, generateContentWithRetry } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Help initialize Gemini
const getAIClient = (res: any) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(400).json({ error: "مفتاح Gemini API غير متاح في إعدادات النظام." });
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// GET all tickets
router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("tickets").where("userId", "==", req.user.uid).get();
    const tickets = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST new ticket (either Agent or Customer Portal creates it)
router.post("/", authenticate, async (req: any, res) => {
  try {
    const ticketData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("tickets").add(ticketData);

    // Trigger basic automations
    await triggerAutomations(req.user.uid, docRef.id, ticketData, req);

    logAudit("Support", { action: "Create Ticket", id: docRef.id }, ticketData, req);

    res.status(201).json({ id: docRef.id, ...ticketData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update ticket properties
router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const ticketId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("tickets").doc(ticketId).update(updateData);

    // Fetch updated ticket to log or apply automation checks
    const updatedDoc = await db.collection("tickets").doc(ticketId).get();
    const updatedTicket = updatedDoc.data();

    if (updatedTicket) {
      await triggerAutomations(req.user.uid, ticketId, updatedTicket, req);
    }

    logAudit("Support", { action: "Update Ticket", id: ticketId }, updateData, req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ticket
router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    const ticketId = req.params.id;
    await db.collection("tickets").doc(ticketId).delete();
    logAudit("Support", { action: "Delete Ticket", id: ticketId }, { ticketId }, req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST message to ticket (Replies / Internal Notes / Chat)
router.post("/:id/messages", authenticate, async (req: any, res) => {
  try {
    const ticketId = req.params.id;
    const message = req.body; // { text: string, sender: "customer"|"agent"|"system"|"bot", senderName: string, id: string, createdAt: string }

    const docRef = db.collection("tickets").doc(ticketId);
    const ticketDoc = await docRef.get();

    if (!ticketDoc.exists) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    const ticketData = ticketDoc.data() || {};
    const messages = ticketData.messages || [];
    const newMessages = [...messages, message];

    await docRef.update({
      messages: newMessages,
      updatedAt: new Date().toISOString(),
    });

    logAudit("Support", { action: "Add Message", ticketId }, message, req);

    // If message is from customer, and AI Chatbot is active/available, let's simulate AI Bot reply!
    if (message.sender === "customer") {
      // Simulate automatic chatbot trigger
      setTimeout(async () => {
        try {
          const ai = getAIClient(res);
          if (!ai) return;

          // Search knowledge base
          const articlesSnap = await db
            .collection("knowledge_articles")
            .where("userId", "==", req.user.uid)
            .get();
          const articles = articlesSnap.docs.map((doc) => doc.data());
          const kbContext = articles
            .map((a) => `Title: ${a.title}\nCategory: ${a.category}\nContent: ${a.content}`)
            .join("\n\n");

          const botPrompt = `You are an elegant AI Chatbot for Madarij OS Support.
A customer sent this message: "${message.text}"
Context from our knowledge base:
${kbContext || "No relevant knowledge articles found."}

Please draft a helpful, professional support reply in the customer's language (mostly Arabic, keep it friendly, polite, and objective).
If the knowledge base contains the answer, use it. If not, politely ask for more details and say an agent will respond shortly.
Do NOT use system jargon. No markdown headers like '#', keep formatting minimal.`;

          const botReplyText = await generateContentWithRetry(ai, {
            model: "gemini-3.5-flash",
            contents: botPrompt,
          });

          const responseText = botReplyText.text || "تم استلام استفسارك وسيتم الرد عليك قريباً.";

          const botMessage = {
            id: "bot-" + Date.now(),
            sender: "bot",
            senderName: "مساعد الذكاء الاصطناعي",
            text: responseText,
            createdAt: new Date().toISOString(),
            read: false,
          };

          // Append bot reply
          const finalMessages = [...newMessages, botMessage];
          await docRef.update({
            messages: finalMessages,
            updatedAt: new Date().toISOString(),
          });
        } catch (botErr) {
          console.error("AI Chatbot reply simulation error:", botErr);
        }
      }, 2000);
    }

    res.json({ success: true, messages: newMessages });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// COPILOT: Summarize Ticket
router.post("/:id/copilot/summarize", authenticate, async (req: any, res) => {
  try {
    const ai = getAIClient(res);
    if (!ai) return;

    const ticketDoc = await db.collection("tickets").doc(req.params.id).get();
    if (!ticketDoc.exists) return res.status(404).json({ error: "Ticket not found" });

    const ticketData = ticketDoc.data() || {};
    const chatHistory = (ticketData.messages || [])
      .map((m: any) => `${m.senderName} (${m.sender}): ${m.text}`)
      .join("\n");

    const prompt = `Summarize this customer support ticket.
Ticket Title/Category: ${ticketData.category || "General"}
Priority: ${ticketData.priority || "Medium"}
Customer: ${ticketData.customerName || "N/A"}
Chat History:
${chatHistory || "No messages yet."}

Provide a concise, professional executive summary in Arabic (عربي) suitable for internal team notes.
Highlight the primary issue, current status, and next actions required.`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ summary: result.text || "لم نتمكن من تلخيص التذكرة." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// COPILOT: Suggest Reply
router.post("/:id/copilot/suggest-reply", authenticate, async (req: any, res) => {
  try {
    const ai = getAIClient(res);
    if (!ai) return;

    const ticketDoc = await db.collection("tickets").doc(req.params.id).get();
    if (!ticketDoc.exists) return res.status(404).json({ error: "Ticket not found" });

    const ticketData = ticketDoc.data() || {};
    const chatHistory = (ticketData.messages || [])
      .map((m: any) => `${m.senderName} (${m.sender}): ${m.text}`)
      .join("\n");

    const kbSnap = await db
      .collection("knowledge_articles")
      .where("userId", "==", req.user.uid)
      .get();
    const articles = kbSnap.docs.map((doc) => doc.data());
    const kbContext = articles
      .map((a) => `Article: ${a.title}\nContent: ${a.content}`)
      .join("\n\n");

    const prompt = `You are an elite support co-pilot. Suggest a high-quality, professional email/chat reply to the last message of this customer.
Customer: ${ticketData.customerName}
Full Chat History:
${chatHistory}

Knowledge Base Reference:
${kbContext || "None"}

Generate the reply in Arabic (عربي) with a friendly, highly professional, supportive, and objective tone.
The response must solve their problem or address their query using the KB, or suggest a path forward. Do not use placeholders like [Agent Name].`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ suggestedReply: result.text || "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// COPILOT: Categorize & Analyze Sentiment
router.post("/:id/copilot/categorize", authenticate, async (req: any, res) => {
  try {
    const ai = getAIClient(res);
    if (!ai) return;

    const ticketDoc = await db.collection("tickets").doc(req.params.id).get();
    if (!ticketDoc.exists) return res.status(404).json({ error: "Ticket not found" });

    const ticketData = ticketDoc.data() || {};
    const messages = ticketData.messages || [];
    const latestMessage = messages.length > 0 ? messages[messages.length - 1].text : "";

    const prompt = `Analyze this support ticket and latest customer query to extract categories and metadata.
Ticket Title/Description: ${ticketData.category || ""}
Latest Message: "${latestMessage}"

Provide analysis results:
1. category: Suggest one of: "Billing", "Technical Support", "Sales Inquiry", "Feature Request", "Complaint", "Refund", "General"
2. priority: Suggest one of: "low", "medium", "high", "urgent"
3. department: Suggest one of: "Finance", "IT Support", "Sales", "Engineering", "Operations"
4. urgency: Suggest one of: "low", "medium", "high", "critical"
5. sentiment: Suggest one of: "positive", "neutral", "negative", "frustrated"
6. predictedCsat: Score from 1 to 5 (integer, where 5 is extremely satisfied and 1 is highly frustrated/unhappy)`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            priority: { type: Type.STRING },
            department: { type: Type.STRING },
            urgency: { type: Type.STRING },
            sentiment: { type: Type.STRING },
            predictedCsat: { type: Type.INTEGER },
          },
          required: ["category", "priority", "department", "urgency", "sentiment", "predictedCsat"],
        },
      },
    });

    const analysis = JSON.parse(result.text);
    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// COPILOT: Translate Message
router.post("/copilot/translate", authenticate, async (req: any, res) => {
  try {
    const ai = getAIClient(res);
    if (!ai) return;

    const { text, targetLanguage } = req.body; // targetLanguage can be "Arabic" or "English"
    if (!text) return res.status(400).json({ error: "Text is required" });

    const prompt = `Translate the following customer support text into ${targetLanguage || "Arabic"}. Keep the exact support tone, politeness, and meaning intact.
Text: "${text}"

Output ONLY the translated text. No explanations or extra words.`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ translatedText: result.text?.trim() || "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// KNOWLEDGE ARTICLES
router.get("/kb", authenticate, async (req: any, res) => {
  try {
    const snap = await db
      .collection("knowledge_articles")
      .where("userId", "==", req.user.uid)
      .get();
    const articles = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(articles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/kb", authenticate, async (req: any, res) => {
  try {
    const articleData = {
      ...req.body,
      userId: req.user.uid,
      views: 0,
      helpfulCount: 0,
      unhelpfulCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("knowledge_articles").add(articleData);
    logAudit("Support", { action: "Create KB Article", id: docRef.id }, articleData, req);
    res.status(201).json({ id: docRef.id, ...articleData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/kb/:id", authenticate, async (req: any, res) => {
  try {
    const articleId = req.params.id;
    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection("knowledge_articles").doc(articleId).update(updateData);
    logAudit("Support", { action: "Update KB Article", id: articleId }, updateData, req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/kb/:id", authenticate, async (req: any, res) => {
  try {
    const articleId = req.params.id;
    await db.collection("knowledge_articles").doc(articleId).delete();
    logAudit("Support", { action: "Delete KB Article", id: articleId }, { articleId }, req);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// COPILOT: Generate Article via Gemini
router.post("/kb/generate", authenticate, async (req: any, res) => {
  try {
    const ai = getAIClient(res);
    if (!ai) return;

    const { title, category } = req.body;
    if (!title) return res.status(400).json({ error: "Title is required" });

    const prompt = `Write a comprehensive, professional knowledge base article in elegant, clear Arabic (عربي) for our support desk:
Title: "${title}"
Category: "${category || "عام"}"

Format of the article:
- It must be structured with Markdown (sub-headings, lists, bold terms).
- Keep it highly practical, giving step-by-step troubleshooting, FAQs, or guide instructions.
- Provide professional support solutions matching best enterprise practices.`;

    const result = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ content: result.text || "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// SLA & AUTOMATION REACTION LOGIC
async function triggerAutomations(userId: string, ticketId: string, ticket: any, req: any) {
  try {
    // 1. High Priority Notification
    if (ticket.priority === "urgent" || ticket.priority === "high") {
      const notificationPayload = {
        userId,
        title: "تنبيه تذكرة عاجلة",
        message: `تم إنشاء أو تحديث التذكرة رقم ${ticket.ticketNumber || ""} ذات الأولوية القصوى من العميل ${ticket.customerName || ""}. يرجى اتخاذ الإجراء السريع.`,
        isRead: false,
        createdAt: new Date().toISOString(),
        type: "support_sla_alert",
      };

      // Save notification to firestore
      await db.collection("notifications").add(notificationPayload);
    }

    // 2. Refund Automatic Action Simulation
    // If ticket is categorized as "Refund" and status is "resolved" (meaning approved), auto generate a credit note / notification for Finance
    if (ticket.category === "Refund" && ticket.status === "resolved") {
      // Add system note
      const systemMessage = {
        id: "sys-" + Date.now(),
        sender: "system",
        senderName: "النظام المالي الآلي",
        text: "تنبيه آلي: تمت الموافقة على طلب الاسترداد. تم إنشاء إشعار دائن (Credit Note) تجريبي وإرسال إشعار لقسم المحاسبة لصرف المبلغ.",
        createdAt: new Date().toISOString(),
        read: false,
      };

      // Check if this notification/message was already added so we don't repeat infinitely
      const hasSystemMessage = (ticket.messages || []).some((m: any) =>
        m.text.includes("إشعار دائن")
      );
      if (!hasSystemMessage) {
        const docRef = db.collection("tickets").doc(ticketId);
        const currentMessages = ticket.messages || [];
        await docRef.update({
          messages: [...currentMessages, systemMessage],
          updatedAt: new Date().toISOString(),
        });

        // Add a finance notification
        await db.collection("notifications").add({
          userId,
          title: "إشعار دائن آلي",
          message: `تم إنشاء إشعار دائن جديد تلقائياً بناءً على تذكرة الاسترداد المعتمدة رقم ${ticket.ticketNumber || ""}.`,
          isRead: false,
          createdAt: new Date().toISOString(),
          type: "finance",
        });
      }
    }

    // 3. Convert to Project Task simulation if requested
    // If user tags a project, and ticket has "create_task" flag
    if (ticket.linkedProject && ticket.createProjectTask) {
      // Create a task in the projects service/collection
      const taskData = {
        userId,
        projectId: ticket.linkedProject,
        title: `إصلاح مشكلة دعم: ${ticket.category || "تذكرة"} ${ticket.ticketNumber || ""}`,
        description: `تذكرة العميل: ${ticket.customerName}\nالأولوية: ${ticket.priority}\n\nيرجى مراجعة تفاصيل التذكرة وحلها برمجياً.`,
        status: "todo",
        priority: ticket.priority,
        createdAt: new Date().toISOString(),
      };

      await db.collection("project_tasks").add(taskData);

      // Update ticket to reset flag
      await db.collection("tickets").doc(ticketId).update({
        createProjectTask: false,
      });
    }
  } catch (err) {
    console.error("Error executing support automation rules:", err);
  }
}

export default router;
