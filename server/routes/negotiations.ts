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

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      // Graceful fallback with generated mock response if API Key is not set yet
      console.warn("Gemini Client initialization failed, returning mock response for preview safety:", err.message);
      
      const isArPrompt = text.includes("توظيف") || text.includes("ماجد") || text.includes("راتب");
      const isDisputeArPrompt = text.includes("نزاع") || text.includes("جزائي") || text.includes("تعويض");
      
      if (isArPrompt) {
        return res.json({
          success: true,
          isMock: true,
          category: "Employment",
          summaryAr: "تم تحليل الحوار كمسودة عقد توظيف للمهندس ماجد فهد كمدير مبيعات تقنية برمجيات براتب 12,000 ريال وفترة تجربة 90 يوماً.",
          summaryEn: "The dialogue was analyzed as an employment contract draft for Eng. Majid Fahd as a Software Sales Director with a salary of SAR 12,000 and a 90-day probation period.",
          variables: [
            {
              category: "Party",
              titleAr: "الطرف الأول (صاحب العمل)",
              titleEn: "First Party (Employer)",
              valueAr: "مجموعة الحلول التقنية المتقدمة للاستثمار",
              valueEn: "Advanced Technical Solutions Group",
              confidence: 98
            },
            {
              category: "Party",
              titleAr: "الطرف الثاني (المهندس الموظف)",
              titleEn: "Second Party (Designated Employee)",
              valueAr: "المهندس ماجد فهد الرويلي",
              valueEn: "Eng. Majid Fahd Al-Rowaily",
              confidence: 99
            },
            {
              category: "Payment",
              titleAr: "الرواتب والبدلات المالية",
              titleEn: "Salary & Housing Allocations Structure",
              valueAr: "راتب أساسي 12,000 ريال مع بدل سكن 3,000 ريال ومواصلات 1,000 ريال",
              valueEn: "SAR 12,000 basic, with SAR 3,000 housing & 1,000 transport allowances",
              confidence: 95
            },
            {
              category: "Condition",
              titleAr: "فترة التجربة وفحص الكفاءة",
              titleEn: "Probation & Competency Assessment",
              valueAr: "مدة 90 يوماً تبدأ من تاريخ توقيع ومباشرة العمل الرسمي في 1 يوليو 2026",
              valueEn: "90 days duration starting from official commencement on July 1, 2026",
              confidence: 93
            }
          ],
          actionItems: [
            {
              titleAr: "صياغة مسودة عرض العمل النهائي وإرسالها لماجد فهد",
              titleEn: "Draft final job offer sheet and deliver to candidate Majid Fahd",
              assignee: "Hiring Manager Layla",
              dueDate: "2026-06-25",
              priority: "High"
            },
            {
              titleAr: "تقديم شهادات المؤهل الأكاديمي والخبرات المهنية للموارد البشرية",
              titleEn: "Submit academic certificates and professional experience records to HR",
              assignee: "Eng. Majid Fahd",
              dueDate: "2026-06-28",
              priority: "Medium"
            }
          ]
        });
      } else if (isDisputeArPrompt) {
        return res.json({
          success: true,
          isMock: true,
          category: "Dispute Resolution",
          summaryAr: "جلسة تسوية وتوريد قطع الغيار البديلة وتطبيق شرط جزائي بقيمة 15,000 ريال في حال عجز المورد عن حل المشكلة خلال 7 أيام عمل.",
          summaryEn: "A settlement session regarding parts replacement supply and applying a SAR 15,000 penalty if the supplier fails to resolve within 7 business days.",
          variables: [
            {
              category: "Penalty",
              titleAr: "التعويض الفوري والبدائل العينية",
              titleEn: "In-kind Hardware Replacements Buffer",
              valueAr: "توريد أجهزة بديلة مطابقة للمواصفات خلال 7 أيام عمل من الإخطار المكتوب",
              valueEn: "Supply compliant server hardware alternates within 7 business days",
              confidence: 97
            },
            {
              category: "Penalty",
              titleAr: "الحد المالي للشرط الجزائي والغرامة المباشرة",
              titleEn: "Bilateral Delay Liquidated Damages",
              valueAr: "غرامة تعويض ثابتة قدرها 15,000 ريال سعودي تدفع مباشرة في حالة تجاوز المهلة",
              valueEn: "Flat compensation rate of SAR 15,000 applied immediately upon failure",
              confidence: 94
            },
            {
              category: "Condition",
              titleAr: "مرجعية التحكيم والحل القانوني البديل",
              titleEn: "Binding Arbitration Body Resolution",
              valueAr: "المركز السعودي للتحكيم التجاري (SCCA) بالمنطقة الشرقية",
              valueEn: "Saudi Center for Commercial Arbitration (SCCA) Eastern Province",
              confidence: 96
            }
          ],
          actionItems: [
            {
              titleAr: "إدراج شروط فض النزاعات SCCA لمسودة عقد توريد القطع",
              titleEn: "Append Eastern Region SCCA arbitration clause to parts contract draft",
              assignee: "Corporate Attorney Rawabi",
              dueDate: "2026-06-26",
              priority: "High"
            }
          ]
        });
      } else {
        // General default preview
        return res.json({
          success: true,
          isMock: true,
          category: "Supply",
          summaryAr: "تمت مراجعة شروط عقد التوريد السنوي لشبكات الخوادم بقيمة إجمالية قدرها 85 ألف ريال سعودي مع صيانة ومستويات خدمة SLA لمدة 36 شهراً.",
          summaryEn: "An annual server networking supply contract review with a total value of SAR 85,000. It includes full SLA support and warranty coverage for 36 months.",
          variables: [
            {
              category: "Party",
              titleAr: "الطرف الأول (المشتري الرئيسي)",
              titleEn: "First Party (Primary Purchaser)",
              valueAr: "مجموعة الحلول التقنية المتقدمة للاستثمار والمقاولات",
              valueEn: "Advanced Technical Solutions Investment & Contracting Group",
              confidence: 99
            },
            {
              category: "Party",
              titleAr: "الطرف الثاني (المورد الفني)",
              titleEn: "Second Party (Technical Supplier)",
              valueAr: "الشركة الشقيقة لصناعات الحوسبة والحلول السحابية",
              valueEn: "Sister Company for Computing Industries & Cloud Solutions LLC",
              confidence: 97
            },
            {
              category: "Payment",
              titleAr: "إجمالي التكلفة المالية والدفعات",
              titleEn: "Total Financial Value & Milestone Tranches",
              valueAr: "85,000 ريال سعودي تدفع على دفعتين متساويتين (60% مقدم، 40% عند الاستلام)",
              valueEn: "SAR 85,000 payable in dual installments (60% upfront, 40% upon formal signoff)",
              confidence: 94
            },
            {
              category: "Penalty",
              titleAr: "شرط جزائي للتأخير عن موعد التوريد المعتمد",
              titleEn: "Late Delivery Penalty Cap Rate",
              valueAr: "خصم 1% عن كل يوم تأخير بحد أقصى 10% من القيمة الإجمالية للعقد الفني",
              valueEn: "1% deduction for each day of delay, capped strictly at 10% of total scope value",
              confidence: 89
            },
            {
              category: "Obligation",
              titleAr: "فترة الصيانة والاستجابة التقنية الطارئة",
              titleEn: "Maintenance SLA Tech Support Window",
              valueAr: "صيانة مجدولة وضمان تشغيلي شامل لمدة 36 شهراً شاملة الدعم الفني على مدار الساعة",
              valueEn: "Comprehensive operational warranty for 36 months, with 24/7 technical callouts",
              confidence: 92
            },
            {
              category: "Condition",
              titleAr: "فض النزاعات والتحكيم المعتمد",
              titleEn: "Arbitration & Dispute Resolution body",
              valueAr: "المحاكم العامة في مدينة الرياض بالمملكة العربية السعودية",
              valueEn: "Primary courts of Riyadh, Kingdom of Saudi Arabia",
              confidence: 98
            }
          ],
          actionItems: [
            {
              titleAr: "تعديل نسبة المسؤولية القانونية لتكون بحد أقصى %100 من قيمة التوريد السنوي",
              titleEn: "Amend liability limitation clause to max out at 100% of the annual server supply value",
              assignee: "Attorney Majid Al-Subaie",
              dueDate: "2026-06-25",
              priority: "High"
            },
            {
              titleAr: "إجراء التحقق القانوني من شهادات الامتثال والضمانات الفنية المقدمة",
              titleEn: "Perform full legal compliance audit on manufacturer technical standard warranties",
              assignee: "CISO / Compliance Team",
              dueDate: "2026-06-28",
              priority: "Medium"
            },
            {
              titleAr: "إرسال النسخة التجريبية المحدثة للطرف الثاني للتوقيع عبر بوابة نفاذ",
              titleEn: "Transmit the updated draft contract to secondary party for sign-off via Nafath",
              assignee: "Legal Advisor Rawabi",
              dueDate: "2026-06-30",
              priority: "Low"
            }
          ]
        });
      }
    }

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

    // Try utilizing gemini-3.5-flash as the standard stable text model
    const response = await ai.models.generateContent({
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

export default router;
