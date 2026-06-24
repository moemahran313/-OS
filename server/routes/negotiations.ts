import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { GoogleGenAI, Type } from "@google/genai";
import { logAudit } from "../services/utils.js";

const router = Router();

// Lazy loader for Google GenAI SDK to comply with optional API key safety rules
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// Resilient wrapper that catches 503 UNAVAILABLE or high demand errors and retries using gemini-3.1-flash-lite
async function generateWithFallback(ai: any, params: any) {
  const primaryModel = params.model || "gemini-3.5-flash";
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    const errMsg = (err?.message || "").toLowerCase();
    const isUnavailable = errMsg.includes("503") || errMsg.includes("unavailable") || errMsg.includes("demand") || errMsg.includes("resource_exhausted") || errMsg.includes("429");
    if (isUnavailable && primaryModel !== "gemini-3.1-flash-lite") {
      console.warn(`Model ${primaryModel} is experiencing high demand or limit. Falling back to gemini-3.1-flash-lite...`);
      return await ai.models.generateContent({
        ...params,
        model: "gemini-3.1-flash-lite"
      });
    }
    throw err;
  }
}

// REST route to analyze meeting transcripts or manual minutes
router.post("/analyze", authenticate, async (req: any, res) => {
  try {
    const { text, title } = req.body;
    
    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: "يرجى تقديم تفاصيل الاجتماع أو النصوص المقروءة لتحليلها."
      });
    }

    const ai = getGeminiClient();

    const systemPrompt = `
      You are an expert AI Legal Analyst specializing in Saudi Arabian and multi-national commercial codes.
      Your task is to analyze meeting minutes, notes, transcripts, or drafts and extract legal conditions, variables, responsibilities, and action items.

      Please structure your response natively as JSON matching this schema:
      - category: The overall contract theme/category (e.g. Employment, Sales, Purchase, JV, Services, NDA, Dispute Resolution)
      - summaryAr: Executive Summary of the document and negotiation outcome, in professional Arabic
      - summaryEn: Executive Summary of the document and negotiation outcome, in professional English
      - variables: List of objects containing key parsed contract parameters, where each item must map to:
        - category: One of 'Party' | 'Payment' | 'Obligation' | 'Penalty' | 'Condition'
        - titleAr: Descriptive Arabic parameter key (e.g. "إجمالي التكلفة المالية والدفعات")
        - titleEn: Descriptive English parameter key (e.g. "Total Financial Value & Milestone Tranches")
        - valueAr: Detailed Arabic value extracted from notes (e.g. "85,000 ريال سعودي تدفع مقدمًا")
        - valueEn: Detailed English value extracted from notes (e.g. "SAR 85,000 payable upfront")
        - confidence: Match or parsing certainty percentage (0 to 100)
      - actionItems: List of follow-up tasks and legal obligations, where each item contains:
        - titleAr: Arabic task description
        - titleEn: English task description
        - assignee: Designated team member or generic role (e.g. "Employer Majid", "Attorney Rawabi")
        - dueDate: Estimated target completion date in standard YYYY-MM-DD template (e.g. "2026-06-25")
        - priority: Urgent state level, must be one of 'High' | 'Medium' | 'Low'

      Strict Instructions:
      - All text in summaryAr, titleAr, valueAr, titleAr should be in clear, high-quality, professional legal Arabic.
      - Do not include markdown code block characters like \`\`\`json in the response output if response schema is enforced.
      - Return exact factual values where specified in text notes (e.g. SAR amounts, dates, percentages, specific court locations like Riyadh general courts or SCCA).
    `;

    // Try utilizing gemini-3.5-flash as the standard stable text model with automatic lite fallback
    const response = await generateWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: `Draft text to analyze:\n"${text}"\n\nMeeting Title Context:\n"${title || "General Negotiation session"}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            summaryAr: { type: Type.STRING },
            summaryEn: { type: Type.STRING },
            variables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  titleAr: { type: Type.STRING },
                  titleEn: { type: Type.STRING },
                  valueAr: { type: Type.STRING },
                  valueEn: { type: Type.STRING },
                  confidence: { type: Type.INTEGER }
                },
                required: ["category", "titleAr", "titleEn", "valueAr", "valueEn", "confidence"]
              }
            },
            actionItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  titleAr: { type: Type.STRING },
                  titleEn: { type: Type.STRING },
                  assignee: { type: Type.STRING },
                  dueDate: { type: Type.STRING },
                  priority: { type: Type.STRING }
                },
                required: ["titleAr", "titleEn", "assignee", "dueDate", "priority"]
              }
            }
          },
          required: ["category", "summaryAr", "summaryEn", "variables", "actionItems"]
        }
      }
    });

    const parsedData = JSON.parse(response.text.trim());
    
    // Log audit log
    await logAudit(
      req.user?.uid || "internal-ai",
      "Smart Negotiation Analyzer",
      `Analyzed meeting transcript. Category recognized: ${parsedData.category}`,
      req
    );

    return res.json({
      success: true,
      ...parsedData
    });

  } catch (err: any) {
    console.error("AI Analysis Failed:", err);
    return res.status(500).json({
      success: false,
      error: `فشلت معالجة النصوص عبر الذكاء الاصطناعي: ${err.message}`
    });
  }
});

// REST route to create a real Google Meet space
router.post("/create-meet", authenticate, async (req: any, res) => {
  try {
    const { accessToken } = req.body;
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        error: "Google account access token is required to create a Meet space."
      });
    }

    const googleMeetRes = await fetch("https://meet.googleapis.com/v2/spaces", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        config: {
          accessType: "OPEN"
        }
      })
    });

    if (!googleMeetRes.ok) {
      const errText = await googleMeetRes.text();
      console.error("Google Meet API Error Reply:", errText);
      throw new Error(`Google Meet API error (${googleMeetRes.status}): ${errText}`);
    }

    const data = await googleMeetRes.json();
    return res.json({
      success: true,
      meetingUri: data.meetingUri,
      meetingCode: data.name?.replace("spaces/", "") || "",
      space: data
    });
  } catch (err: any) {
    console.error("Error creating Google Meet space:", err);
    return res.status(500).json({
      success: false,
      error: `Failed to create Google Meet space: ${err.message}`
    });
  }
});

export default router;
