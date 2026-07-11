import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { GoogleGenAI, Type } from "@google/genai";
import { generateContentWithRetry } from "../services/utils.ts";

const router = Router();

// Initialize Gemini client lazily to prevent server crashes if the key is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required to run AI features");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Process Contract using Gemini
router.post("/process", authenticate, async (req: any, res) => {
  try {
    const { contractText, language, fileType } = req.body;
    if (!contractText) {
      return res.status(400).json({ error: "No contract text provided for parsing" });
    }

    const ai = getAiClient();

    const prompt = `You are a ZATCA Contract Intelligence AI. Please analyze the following contract and extract key financial, billing, and tax details according to Saudi ZATCA guidelines.
The standard VAT rate is 15% in Saudi Arabia.
Extract the details into a single valid JSON object following this JSON schema:
{
  "sellerName": "Name of the seller (Arabic or English)",
  "sellerVat": "15-digit tax registration number of the seller. If missing, return empty string.",
  "buyerName": "Name of the buyer (Arabic or English)",
  "buyerVat": "15-digit tax registration number of the buyer. If missing, return empty string.",
  "contractNumber": "Contract ID or reference number. If not present, generate a plausible one like CONT-2026-XXX",
  "contractDate": "ISO date of the contract like YYYY-MM-DD",
  "currency": "Currency of contract, e.g. SAR or USD",
  "paymentTerms": "A brief text summary of payment schedule/terms",
  "retention": 0, // Retention percentage withheld if any, as a number, or 0
  "deliveryDates": "Date range of deliverables",
  "lineItems": [
    {
      "id": 1,
      "name": "Item description",
      "quantity": 1,
      "unitPrice": 1000,
      "discount": 0,
      "vatPercent": 15
    }
  ],
  "milestones": [
    {
      "name": "Milestone name",
      "amount": 500,
      "date": "YYYY-MM-DD"
    }
  ]
}

Ensure the output is ONLY a raw JSON string conforming to the schema. Do not enclose it in markdown blocks.

Contract Text:
${contractText}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        systemInstruction:
          "You are an expert financial OCR parser specializing in Saudi commercial contracts and standard ZATCA e-invoicing compliance.",
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from AI engine");
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (err: any) {
    console.error("[ZATCA AI Contract Process Error]:", err);
    res.status(500).json({ error: "Failed to parse contract details", details: err.message });
  }
});

// 2. Bilingual Copilot Chat
router.post("/chat", authenticate, async (req: any, res) => {
  try {
    const { prompt, history, contractContext } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const ai = getAiClient();

    // Prepare message history formatted for Gemini SDK
    // SDK expects format: [{ role: 'user' | 'model', parts: [{ text: '...' }] }]
    const formattedContents: any[] = [];

    // Inject active contract context to guide the conversation if available
    let systemInstruction = `You are ZATCA Contract Intelligence AI Copilot, a helpful Saudi bilingual financial advisor.
Your job is to assist Saudi business owners and accountants in transition client SLA and service contracts into compliant e-invoices matching Saudi Arabia's ZATCA Phase 2 guidelines.
Always speak politely and elegantly. Support both English and Arabic. Respond in the language requested by the user.

Key Guidance:
- Standard VAT is 15% in KSA.
- ZATCA Phase 2 requires electronic invoices (XML + standard TLV QR code) registered within 24 hours of issuance.
- Standard invoices require cryptographic stamping. Simplified invoices (B2C) require reporting.
- If the contract currency is not SAR (like USD), mention that ZATCA requires converting totals and tax amounts into SAR using the official exchange rate (e.g. 3.75) for XML compliance files.
`;

    if (contractContext) {
      systemInstruction += `\nActive Contract Context:
- Seller: ${contractContext.sellerName || "N/A"} (VAT: ${contractContext.sellerVat || "Missing"})
- Buyer: ${contractContext.buyerName || "N/A"} (VAT: ${contractContext.buyerVat || "Missing"})
- Contract No: ${contractContext.contractNumber || "N/A"}
- Total Value: ${contractContext.total || "N/A"} ${contractContext.currency || "SAR"}
- Milestones: ${JSON.stringify(contractContext.milestones || [])}
- Line Items: ${JSON.stringify(contractContext.lineItems || [])}
`;
    }

    // Map history to SDK format
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.role === "user") {
          formattedContents.push({ role: "user", parts: [{ text: msg.content }] });
        } else if (msg.role === "assistant" || msg.role === "model") {
          formattedContents.push({ role: "model", parts: [{ text: msg.content }] });
        }
      });
    }

    // Add current user prompt
    formattedContents.push({ role: "user", parts: [{ text: prompt }] });

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });

    const reply = response.text || "I was unable to formulate a response. Please try again.";
    res.json({ reply });
  } catch (err: any) {
    console.error("[ZATCA AI Copilot Chat Error]:", err);
    res.status(500).json({ error: "Failed to generate AI response", details: err.message });
  }
});

export default router;
