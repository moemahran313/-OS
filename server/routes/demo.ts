import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

// Initialize GoogleGenAI on the server
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [], currentModule = "dashboard", language = "ar" } = req.body;

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not defined
      return res.json({
        text:
          language === "ar"
            ? "مرحباً بك في مدارج مدار! المساعد الذكي غير مفعّل حالياً لعدم وجود مفتاح API، ولكن يمكنك تصفح كافة أقسام ديمو مدارج التفاعلي باستخدام اللوحة الجانبية."
            : "Welcome to Madarij OS! The AI Assistant is currently idle due to missing API configurations, but feel free to explore the interactive dashboard and modules using the sidebar.",
        action: "none",
        actionPayload: {},
      });
    }

    // Build model prompt contents with context
    const systemInstruction = `
You are the AI Sales & ERP Specialist for Madarij OS (مدارج) - the elite Arabic-first, GCC-tailored Business Operating System (ERP).
You help enterprise prospects explore the live interactive demo of Madarij OS.

Your responses must be structured as JSON matching the following schema:
{
  "text": "Your textual response here. Use elegant Markdown. Keep it concise, high-impact, professional, and friendly. Answer in Arabic by default (since Madarij is Arabic-first), or in English if the user writes in English. Include relevant numbers, benefits, and metrics.",
  "action": "One of the following string actions to control the UI: 'navigate_to_module' | 'load_demo_data' | 'create_record' | 'none'",
  "actionPayload": {
    "module": "The module ID to navigate to. Valid module IDs: 'dashboard' | 'crm' | 'leads' | 'invoices' | 'accounting' | 'payroll' | 'projects' | 'marketing' | 'support' | 'shipping' | 'banking'",
    "query": "Optional query or search parameters",
    "recordType": "The record type if creating a record (e.g., 'invoice' | 'lead' | 'payment')",
    "recordData": "An optional object containing key-value data for creating a record, e.g., client, amount, items, etc."
  }
}

KEY BEHAVIORS & ROUTING GUIDELINES:
1. If the user asks to see or view a specific module (e.g., "أرني المحاسبة", "show manufacturing", "افتح إدارة المبيعات", "Show banking", "Show AI", "أرني التسويق"), set:
   "action": "navigate_to_module"
   "actionPayload": { "module": "<correct_module_id>" }
   And explain what that module does in Madarij OS in a compelling way.

2. If the user asks for specific ERP actions (e.g., "إنشاء فاتورة", "أريد تسجيل عميل جديد", "create an invoice", "اضف عميل"):
   "action": "create_record"
   "actionPayload": { "recordType": "invoice" or "lead", "recordData": { "client": "شركة النور للتجارة", "amount": 15000 } }
   And tell them you are launching the record creation form for them.

3. If they ask ERP analytical questions (e.g., "أرني الفواتير غير المدفوعة", "biggest customers", "cash flow", "why did revenue decline", "overdue customers", "duplicate payments"):
   "action": "load_demo_data"
   "actionPayload": { "module": "accounting" or "dashboard" or "crm", "query": "unpaid_invoices" or "biggest_customers" or "revenue_analysis" or "cash_flow" }
   Provide a concise analysis inside the "text" property and tell them you have highlighted this data on the screen.

4. If they ask product specialist questions (e.g., "QuickBooks vs Madarij", "QuickBooks", "Odoo", "VAT support", "Saudi VAT", "Excel migration", "implementation"):
   Give a masterclass product comparison:
   - vs QuickBooks: QuickBooks lacks local GCC-compliant e-invoicing (ZATCA Phase 2), Arabic-first localization, and Gulf payroll (WPS). Madarij has native integration.
   - vs Odoo: Odoo is bloated, requires heavy custom development, and is very expensive. Madarij is plug-and-play, incredibly fast, and specifically made for Saudi & Gulf markets.
   - Saudi VAT: Fully compliant with Phase 1 and Phase 2 (ZATCA integration, XML signing, cryptographic stamp, QR codes).
   - Excel Migration: Instant 1-click import for charts of accounts, products, and contact lists.
   - Implementation: Takes days instead of months with our automated onboarding engine.

Keep your answers visually beautiful with markdown, and use bullet points where necessary.
`;

    // Map conversation history
    const contents = history.map((item: any) => ({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content || item.text || "" }],
    }));

    // Add current user message
    contents.push({
      role: "user",
      parts: [
        {
          text: `[Current Screen: ${currentModule}, Preferred Lang: ${language}] User Prompt: ${message}`,
        },
      ],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            action: { type: Type.STRING },
            actionPayload: {
              type: Type.OBJECT,
              properties: {
                module: { type: Type.STRING },
                query: { type: Type.STRING },
                recordType: { type: Type.STRING },
                recordData: { type: Type.OBJECT },
              },
            },
          },
          required: ["text"],
        },
      },
    });

    const resultText = response.text || "{}";
    const resultJson = JSON.parse(resultText.trim());

    res.json(resultJson);
  } catch (err: any) {
    console.error("[Demo Chat Error]:", err);
    res.status(500).json({
      text:
        req.body.language === "ar"
          ? "عذراً، حدث خطأ أثناء الاتصال بمساعد مدارج الذكي. يرجى المحاولة مرة أخرى."
          : "Sorry, an error occurred while connecting to the AI Assistant. Please try again.",
      action: "none",
      actionPayload: {},
    });
  }
});

export default router;
