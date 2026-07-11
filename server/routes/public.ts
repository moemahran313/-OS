import { Router } from "express";
import { db } from "../services/firebase.ts";
import { GoogleGenAI } from "@google/genai";
import { generateContentWithRetry } from "../services/utils.ts";

const router = Router();

// Helper to get GoogleGenAI client safely
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required. Configure it in Settings.");
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

router.post("/seo-analyze-saudi", async (req: any, res) => {
  try {
    const { url, industry, city, channel } = req.body;

    if (!industry || !city) {
      return res.status(400).json({ error: "Industry and City are required fields." });
    }

    const ai = getGeminiClient();

    const prompt = `You are a world-class Saudi Arabian SEO growth and digital marketing strategist. 
Your goal is to perform a deep SEO and high-converting lead generation analysis specifically tailored to the Saudi Arabian market (local cities, Arabic search intents, local consumer habits, and Saudi regulatory/commercial landscapes) following the Pareto 80/20 principle.
The 80/20 principle states that 20% of the effort/keywords will generate 80% of the qualified purchase-intent leads.

Analyze the following company profile:
- Website URL (if any): ${url || "N/A"}
- Industry/Niche: ${industry}
- Primary Saudi City/Region: ${city}
- Major Acquisition Channel: ${channel || "Local Search & SEO"}

Provide a detailed Arabic-language strategy output in strictly valid JSON format.
Do NOT output any markdown blocks like \`\`\`json or backticks or conversational text. Output ONLY the JSON object.

The JSON object must have exactly this TypeScript schema structure:
{
  "paretoKeywords": [
    {
      "keyword": "Arabic search query (e.g. 'شراء شقق في الرياض')",
      "intent": "Arabic search intent category (e.g. 'شراء مباشر', 'استفسار تجاري')",
      "potentialVolume": "Arabic descriptive volume (e.g. 'عالي جداً', 'متوسط', 'عالي')",
      "reason": "Clear explanation in Arabic of why this is part of the 20% keywords that yield 80% of actual local leads"
    }
  ],
  "seoActions": [
    {
      "title": "Action title in Arabic",
      "description": "Short explanation in Arabic of the action",
      "impact": "High / Medium / Low in Arabic ('مرتفع', 'متوسط')",
      "effort": "High / Medium / Low in Arabic ('منخفض', 'متوسط')",
      "implementation": "Arabic clear step-by-step implementation notes"
    }
  ],
  "localInsights": [
    {
      "title": "Insight heading (e.g. 'لهجة البحث في الرياض', 'المواسم السنوية')",
      "insight": "Arabic detailed explanation of Saudi consumer behavior, localized dialect search terms, or seasonal impacts like Ramadan/Hajj"
    }
  ],
  "leadUpliftProjection": {
    "beforeTrafficQuality": 20,
    "afterTrafficQuality": 85,
    "explanation": "Arabic explanation of the projected 80/20 lead quality improvement, and how local brand visibility increases conversion rates."
  }
}

Ensure the analysis is highly professional, localized with real search trends of Saudi cities (like Riyadh, Jeddah, Dammam, Mecca, Medina), and written with premium copywriting. Ensure all outputs are strictly in Arabic. Do not include any HTML tags or conversational text around the JSON.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI generation engine.");

    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("Saudi SEO Pareto generation failed:", err);
    res.status(500).json({ error: err.message || "Failed to analyze Saudi SEO." });
  }
});

router.get("/invoices/:id", async (req: any, res) => {
  try {
    const docSnap = await db.collection("invoices").doc(req.params.id).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Invoice not found" });

    const invoice: any = { id: docSnap.id, ...docSnap.data() };

    // Fetch user settings to get paypal Client ID
    let paypalClientId = null;
    if (invoice.userId) {
      const settingsSnap = await db.collection("settings").doc(invoice.userId).get();
      if (settingsSnap.exists) {
        paypalClientId = settingsSnap.data()?.paypalClientId || null;
      }
    }

    res.json({
      ...invoice,
      paypalClientId,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/invoices/:id/view", async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (invoiceSnap.exists) {
      const invoice: any = invoiceSnap.data();
      if (invoice.status === "sent") {
        const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
        currentLogs.unshift({
          action: "Viewed by Client",
          timestamp: new Date().toISOString(),
        });
        await docRef.update({
          status: "viewed",
          logs: currentLogs,
          isLocked: true,
        });
      }
    }
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/invoices/:id/pay", async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (!invoiceSnap.exists) return res.status(404).json({ error: "Invoice not found" });

    const invoice: any = invoiceSnap.data();
    const { amount, gateway, method, transactionId } = req.body;
    const paymentAmountHalalas = Math.round(
      (Number(amount) || invoice.remainingBalanceHalalas / 100) * 100
    );

    const paidAmountHalalas = (invoice.paidAmountHalalas || 0) + paymentAmountHalalas;
    const remainingBalanceHalalas = invoice.totalAmountHalalas - paidAmountHalalas;

    let status = invoice.status;
    if (remainingBalanceHalalas <= 0) {
      status = "paid";
    } else {
      status = "partially paid";
    }

    const gatewayInfo = gateway ? ` via ${gateway} (${method || "Direct"})` : "";
    const txnInfo = transactionId ? ` [Txn: ${transactionId}]` : "";

    const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
    currentLogs.unshift({
      action: `Payment Received: ${(paymentAmountHalalas / 100).toFixed(2)} ${invoice.currency}${gatewayInfo}${txnInfo}`,
      timestamp: new Date().toISOString(),
      note: `Remaining: ${(remainingBalanceHalalas / 100).toFixed(2)} ${invoice.currency}`,
    });

    const updateData = {
      paidAmountHalalas,
      remainingBalanceHalalas,
      status,
      logs: currentLogs,
      isLocked: true,
    };

    await docRef.update(updateData);

    res.json({
      id: invoiceSnap.id,
      ...invoice,
      ...updateData,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
