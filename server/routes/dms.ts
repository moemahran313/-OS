import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { GoogleGenAI, Type } from "@google/genai";
import { logAudit, generateContentWithRetry } from "../services/utils.js";

const router = Router();

// Lazy loader for Google GenAI SDK to comply with optional API key safety rules
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets."
    );
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

// REST route to analyze documents for DMS (OCR)
router.post("/analyze", authenticate, async (req: any, res) => {
  try {
    const { fileName, fileType, fileData } = req.body;

    if (!fileData) {
      return res.status(400).json({
        success: false,
        error: "يرجى توفير ملف صالح للمعالجة.",
      });
    }

    const ai = getGeminiClient();

    // Check if the mime type is supported directly or if we can process it
    // Gemini supports pdf, images, text, etc.
    let mime = fileType || "application/pdf";
    if (fileName && fileName.endsWith(".pdf")) {
      mime = "application/pdf";
    } else if (fileName && (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg"))) {
      mime = "image/jpeg";
    } else if (fileName && fileName.endsWith(".png")) {
      mime = "image/png";
    } else if (fileName && fileName.endsWith(".webp")) {
      mime = "image/webp";
    }

    const promptText = `Please perform OCR on this document named "${fileName}" and extract key metadata in Arabic.
Categorize it into one of these types:
- "عقود الموظفين" (for employment contracts, offers, labor agreements)
- "السجلات المدنية والجوازات" (for national IDs, iqamas, passports, civil registries)
- "التراخيص والسجلات (Wathiq)" (for commercial registrations CRs, municipal licenses, tax certificates)
- "اتفاقيات الموردين (NDAs)" (for non-disclosure agreements, supplier agreements, service agreements)
- "أخرى" (for any other general files)

Extract the critical expiry date if there is any (e.g. Iqama renewal date, contract end date, license expiration date) formatted exactly as YYYY-MM-DD. If none exists, output "-".
Extract a professional title/name for the document in Arabic.
Provide a concise one-sentence summary of the document contents in Arabic.`;

    const contents = {
      parts: [
        {
          inlineData: {
            data: fileData, // Base64 content from frontend
            mimeType: mime,
          },
        },
        {
          text: promptText,
        },
      ],
    };

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            documentTypeAr: {
              type: Type.STRING,
              description:
                "The categorized document type in Arabic, MUST be one of these exact values: 'عقود الموظفين' or 'السجلات المدنية والجوازات' or 'التراخيص والسجلات (Wathiq)' or 'اتفاقيات الموردين (NDAs)' or 'أخرى'.",
            },
            extractedTitleAr: {
              type: Type.STRING,
              description: "A descriptive extracted document title in Arabic.",
            },
            extractedExpiryDate: {
              type: Type.STRING,
              description:
                "The extracted critical expiry date, formatted as YYYY-MM-DD. If none is found or applicable, return '-'.",
            },
            extractedSummaryAr: {
              type: Type.STRING,
              description:
                "A short professional one-sentence summary of the document's contents in Arabic.",
            },
          },
          required: [
            "documentTypeAr",
            "extractedTitleAr",
            "extractedExpiryDate",
            "extractedSummaryAr",
          ],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from Gemini API");
    }

    const data = JSON.parse(resultText.trim());

    // Log the action to Audit log
    await logAudit(
      "DMS",
      { action: "DMS_DOCUMENT_OCR", fileName },
      { category: data.documentTypeAr, expiryDate: data.extractedExpiryDate },
      req
    );

    return res.json({
      success: true,
      analysis: data,
    });
  } catch (error: any) {
    console.error("DMS OCR Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "حدث خطأ غير متوقع أثناء معالجة المستند عبر الذكاء الاصطناعي.",
    });
  }
});

export default router;
