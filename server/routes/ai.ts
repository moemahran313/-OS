import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../services/firebase.ts";
import { prisma } from "../services/prisma.ts";

const router = Router();

// Lazy loader for Google GenAI client
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

// 1. Process Business Command (General Co-Pilot Command Center)
router.post("/command", authenticate, async (req: any, res) => {
  try {
    const { command, language = "ar" } = req.body;
    if (!command) {
      return res.status(400).json({ error: "Missing command parameter" });
    }

    const ai = getAiClient();

    // Gather real user context to personalize the AI co-pilot response
    let contextStr = "User Context: Local environment, no DB stats available.";
    try {
      const userDoc = await db.collection("users").doc(req.user.uid).get();
      const user = userDoc.data();

      const leadsSnapshot = await db.collection("leads").where("userId", "==", req.user.uid).get();
      const invoicesSnapshot = await db.collection("invoices").where("userId", "==", req.user.uid).get();
      const employeesSnapshot = await db.collection("employees").where("userId", "==", req.user.uid).get();

      if (user) {
        contextStr = `User Context: Business: ${user.companyName || "منشأة غير محددة"}, City: ${user.city || "غير محدد"}. 
        Stats: ${leadsSnapshot.size} leads, ${invoicesSnapshot.size} invoices, ${employeesSnapshot.size} employees.`;
      }
    } catch (e) {
      console.warn("Could not fetch AI context for command", e);
    }

    const systemInstruction = `You are "Mudarij AI", the elite business co-pilot for Mudarij OS (مدارج), a specialized ERP and GRC platform for GCC and Saudi SMEs.
    Your tone is professional, helpful, objective, and authoritative.
    
    Knowledge Boundaries:
    - GCC VAT Regulations (15% standard rate in KSA).
    - SOCPA (Saudi Organization for Chartered and Professional Accountants) accounting standards.
    - Saudi Labor Law (Mudad, GOSI, Qiwa, Nitaqat, WPS).
    - ZATCA Phase 2 (Fatoora) e-invoicing requirements (cryptographic stamps, XML structure, QR codes).
    
    ${contextStr}

    The OS has 22 total integrated tools organized into 6 core workspaces:
    1. Core & Control (Dashboard, Analytics, Calculations)
    2. Growth & Marketing (LeadGen, EmailMarketing, SocialMedia, Advertising)
    3. CRM & Communications (CRM, Chat, SmartNegotiations)
    4. Financials & Compliance (Accounting, Invoices, Payroll, ZatcaAi, Labor Compliance)
    5. Projects & Operations (Projects, Workflows, Integrations, Support)
    6. Supply Chain & Contracts (Suppliers, Contracts, Inventory)

    Respond in a helpful, professional tone in the user's preferred language: ${language === "ar" ? "Arabic" : "English"}. Be concise.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: command,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
    } catch (apiErr) {
      console.warn("Primary gemini-3.5-flash failed for command, using gemini-3.1-flash-lite fallback", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: command,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
    }

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("[AI Command Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 2. Shipment Query Chat (Ad-hoc interactive chat on shipments page)
router.post("/shipment-query", authenticate, async (req: any, res) => {
  try {
    const { question, shipmentContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Missing question" });
    }

    const ai = getAiClient();

    let contextText = "";
    if (shipmentContext) {
      contextText = `Active Shipment Context:
      - Supplier Name: ${shipmentContext.supplierName || "Unknown"}
      - Product Description: ${shipmentContext.productDescription || "General Goods"}
      - Country of Origin: ${shipmentContext.countryOfOrigin || "Unknown"}
      - Carrier: ${shipmentContext.carrier || "Aramex"}
      - Status: ${shipmentContext.status || "Planned"}
      - Origin Port: ${shipmentContext.originPort || "N/A"}
      - Destination Port: ${shipmentContext.destinationPort || "N/A"}`;
    }

    const systemInstruction = `You are Mudarij ImportOS Copilot, an expert in Saudi Arabian Customs clearance, SABER, SASO, and SFDA guidelines.
    Your job is to assist Saudi importers in reviewing shipping files, customs declarations, and identifying regulatory requirements to ensure a seamless custom clearing experience at Saudi ports (Jeddah Islamic Port, King Abdulaziz Port, etc.).
    Always answer clearly in Arabic with professional term translations if needed. Keep it action-oriented and highly accurate.
    
    ${contextText}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
    } catch (apiErr) {
      console.warn("Primary model busy, falling back to gemini-3.1-flash-lite", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: question,
        config: {
          systemInstruction,
          temperature: 0.5,
        },
      });
    }

    res.json({ answer: response.text });
  } catch (err: any) {
    console.error("[AI Shipment Query Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Ad-hoc Compliance Check (SABER, SASO, SFDA requirements builder)
router.post("/ad-hoc-compliance", authenticate, async (req: any, res) => {
  try {
    const { desc, country } = req.body;
    if (!desc) {
      return res.status(400).json({ error: "Missing description" });
    }

    const ai = getAiClient();

    const prompt = `Analyze this ad-hoc shipment request for Saudi Arabian import requirements (ZATCA, SASO, SFDA).
    
    Product: ${desc}
    Origin: ${country || "Unknown"}
    
    Identify:
    1. Required Documents (e.g., Commercial Invoice, COO, Packing List, SABER CoC).
    2. Technical/Government Approvals (e.g., SFDA Registration, IECEE, GCTS).
    3. Risk Flags or specific warnings (e.g., Restricted items, High Customs Fees).
    
    Return ONLY a raw JSON object matching this structure:
    {
      "required_documents": ["string"],
      "required_approvals": ["string"],
      "risk_flags": ["string"]
    }
    
    Ensure the strings are clear, accurate and professional in Arabic.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              required_documents: { type: Type.ARRAY, items: { type: Type.STRING } },
              required_approvals: { type: Type.ARRAY, items: { type: Type.STRING } },
              risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["required_documents", "required_approvals", "risk_flags"],
          },
        },
      });
    } catch (apiErr) {
      console.warn("Primary model busy, falling back to gemini-3.1-flash-lite", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              required_documents: { type: Type.ARRAY, items: { type: Type.STRING } },
              required_approvals: { type: Type.ARRAY, items: { type: Type.STRING } },
              risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["required_documents", "required_approvals", "risk_flags"],
          },
        },
      });
    }

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("[AI Ad-hoc Compliance Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 4. Detailed Shipment Compliance Report (ZATCA, SASO, SFDA)
router.get("/shipment-compliance/:id", authenticate, async (req: any, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const ai = getAiClient();

    const prompt = `Analyze this shipment for Saudi Arabian import requirements (ZATCA, SASO, SFDA).
    
    Product: ${shipment.productDescription || "General Goods"}
    Origin: ${shipment.countryOfOrigin || "Unknown"}
    
    Return ONLY a JSON object with this structure:
    {
      "isCompliant": boolean,
      "requirements": ["string"],
      "missingDocs": ["string"],
      "riskFlags": ["string"]
    }
    
    Ensure the strings are clear, accurate and professional in Arabic.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCompliant: { type: Type.BOOLEAN },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["isCompliant", "requirements", "missingDocs", "riskFlags"],
          },
        },
      });
    } catch (apiErr) {
      console.warn("Primary model busy, falling back to gemini-3.1-flash-lite", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCompliant: { type: Type.BOOLEAN },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["isCompliant", "requirements", "missingDocs", "riskFlags"],
          },
        },
      });
    }

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (err: any) {
    console.error("[AI Shipment Compliance Report Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 5. General Shipment Narrative Analysis Summary
router.get("/shipment-analysis/:id", authenticate, async (req: any, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
    });

    if (!shipment) {
      return res.status(404).json({ error: "Shipment not found" });
    }

    const ai = getAiClient();

    const prompt = `Shipment Analysis Request:
    Supplier: ${shipment.supplierName}
    Product: ${shipment.productDescription}
    Origin: ${shipment.countryOfOrigin}
    Status: ${shipment.status}

    Provide a brief compliance summary and next steps for this shipment in Arabic.
    Mention required certificates if applicable.`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });
    } catch (apiErr) {
      console.warn("Primary model busy, falling back to gemini-3.1-flash-lite", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
      });
    }

    res.json({ text: response.text });
  } catch (err: any) {
    console.error("[AI Shipment Narrative Analysis Error]:", err);
    res.status(500).json({ error: err.message });
  }
});

// 6. Public Landing Page SEO Copy Generator for Saudi SMEs
router.post("/public/seo-generator", async (req: any, res) => {
  try {
    const { businessSector = "شركة مقاولات وتوريدات", city = "الرياض", targetServices = "الفوترة الإلكترونية، مسير الرواتب، وإدارة العملاء" } = req.body;
    
    let ai: GoogleGenAI | null = null;
    try {
      ai = getAiClient();
    } catch {
      // Fallback response if GEMINI_API_KEY is not set
      return res.json({
        seoTitle: `نظام إدارة ${businessSector} بالرياض | الفوترة والرواتب - مدارج`,
        h1: `نظام التشغيل الرقمي الموحد لـ ${businessSector} في ${city}`,
        h2: `أتمتة الفواتير الإلكترونية (ZATCA)، مسير الرواتب (مدد)، وإدارة المبيعات في منصة سيادية واحدة`,
        metaDescription: `حل سحابي متكامل لـ ${businessSector} في ${city}. امتثال كامل لافتراطات هيئة الزكاة المرحلة الثانية ونظام حماية الأجور بخصم 80% عن البرامج التقليدية.`,
        cta: `ابدأ تجربة نظام ${businessSector} مجاناً`,
        conversionBulletPoints: [
          `اصدار فواتير ZATCA المرحلة الثانية مشفرة بختم رقمي خلال 3 ثوانٍ`,
          `توليد ملفات SIF المعتمدة بنظام مدد والربط مع العنوان الوطني SPL`,
          `لوحة تحكم موحدة تمنحك سيادة كاملة وتقضي على فوضى 5 برامج مبعثرة`
        ]
      });
    }

    const prompt = `You are a world-class Ogilvy-grade conversion copywriter and SEO specialist for Saudi Arabian enterprise software (Saudi SME SaaS).
Generate high-converting, SEO-optimized Arabic marketing copy for a business with the following profile:
- Business Sector / Activity: ${businessSector}
- Primary Saudi City: ${city}
- Target Services / Focus: ${targetServices}

Return ONLY a valid JSON object matching this schema:
{
  "seoTitle": "String under 60 chars formatted with high search volume keywords for Saudi Arabia",
  "h1": "Compelling H1 Headline under 70 chars with strong value proposition in Arabic",
  "h2": "Persuasive H2 Subheadline highlighting compliance, speed, and cost savings in Arabic",
  "metaDescription": "Concise meta description 140-155 chars in Arabic with clear call to action",
  "cta": "Strong 3-5 word Action Button text in Arabic",
  "conversionBulletPoints": ["3 short bullet points highlighting specific regulatory compliance (ZATCA Phase 2, WPS Mudad, SPL) and ROI"]
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });
    } catch (apiErr) {
      console.warn("Primary gemini-3.5-flash failed, trying gemini-3.1-flash-lite fallback", apiErr);
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.4,
        },
      });
    }

    const parsed = JSON.parse(response.text.replace(/```json|```/g, "").trim());
    return res.json(parsed);
  } catch (err: any) {
    console.error("[SEO Generator Error]:", err);
    return res.json({
      seoTitle: `نظام تشغيل ${req.body.businessSector || "الشركات"} | مدارج OS`,
      h1: `المنصة السحابية الموحدة لـ ${req.body.businessSector || "الأعمال السعودية"}`,
      h2: `امتثال ZATCA وحماية الأجور WPS بذكاء اصطناعي سيادي`,
      metaDescription: `أتمتة كاملة لإدارة عملك وفق معايير هيئة الزكاة والضريبة والجمارك ونظام مدد لحماية الأجور.`,
      cta: `ابدأ التجربة المجانية الآن`,
      conversionBulletPoints: [
        `ربط فوري مع السجل التجاري والعنوان الوطني`,
        `توليد فواتير ZATCA المرحلة الثانية تلقائياً`,
        `حماية الأجور والرواتب بملفات SIF معتمدة`
      ]
    });
  }
});

// 7. SEO Copilot - Page Content Analysis & GCC Arabic Search Intent Meta Tag Generator
router.post("/seo-copilot", async (req: any, res) => {
  try {
    const { pageTitle = "الصفحة الرئيسية", pageContent = "", pageUrl = "https://app.mudarij.com", targetGccMarket = "KSA" } = req.body;

    let ai: GoogleGenAI | null = null;
    try {
      ai = getAiClient();
    } catch {
      return res.json({
        metaTitle: `${pageTitle} | مدارج OS - حلول إدارة الأعمال السحابية في المملكة`,
        metaDescription: `اكتشف ${pageTitle} عبر منصة مدارج OS. حلول سحابية متوافقة 100% مع هيئة الزكاة والضريبة (ZATCA Phase 2) ونظام حماية الأجور بخصم 80% للمشروعات والشركات.`,
        keywords: ["مدارج OS", "الفوترة الإلكترونية ZATCA", "نظام إدارة الشركات بالرياض", "حماية الأجور مدد", "نظام ERP سعودي"],
        ogTitle: `${pageTitle} - نظام التشغيل الموحد لشركات الخليج`,
        ogDescription: `حل رقمي سيادي متكامل لإدارة المبيعات والرواتب والفوترة بامتثال كامل مع اشتراطات ZATCA ووزارة الموارد البشرية.`,
        canonicalUrl: pageUrl,
        structuredDataJson: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Mudarij OS",
          "operatingSystem": "Cloud / Web",
          "applicationCategory": "BusinessApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "SAR" }
        }, null, 2)
      });
    }

    const prompt = `You are a Google GCC SEO & Search Intent Strategist specializing in Arabic SEO for Saudi Arabia and Gulf Cooperation Council (Saudi Arabia KSA, UAE, Qatar, Kuwait, Bahrain, Oman).
Analyze the following web page content and produce high-ranking Meta Tags, Search Intent Keywords, OpenGraph Tags, and JSON-LD Structured Data:
- Page Title: ${pageTitle}
- Page URL: ${pageUrl}
- Target Market: ${targetGccMarket}
- Raw Page Content / Features:
${pageContent.substring(0, 2000)}

Return ONLY a valid JSON object matching this schema:
{
  "metaTitle": "SEO Title under 60 chars in Arabic with primary keyword",
  "metaDescription": "Meta description 140-155 chars in Arabic with strong call to action",
  "keywords": ["5-8 high volume Arabic search intent keywords for Saudi/GCC market"],
  "ogTitle": "Catchy Social Media Open Graph Title",
  "ogDescription": "Engaging Open Graph Description for WhatsApp / LinkedIn sharing in Arabic",
  "canonicalUrl": "${pageUrl}",
  "structuredDataJson": "Formatted JSON string for Schema.org SoftwareApplication or Service"
}`;

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
    } catch (err) {
      response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      });
    }

    const parsed = JSON.parse(response.text.replace(/```json|```/g, "").trim());
    return res.json(parsed);
  } catch (err: any) {
    console.error("[SEO Copilot Error]:", err);
    return res.json({
      metaTitle: `${req.body.pageTitle || "مدارج OS"} | نظام التشغيل السعودي للشركات`,
      metaDescription: `منصة سحابية موحدة لأتمتة الفواتير الضريبية ZATCA والرواتب والمبيعات بامتثال كلي للأنظمة السعودية.`,
      keywords: ["مدارج OS", "نظام ZATCA", "الرواتب مدد", "ERP سعودي"],
      ogTitle: `${req.body.pageTitle || "مدارج OS"}`,
      ogDescription: `أتمتة الشركات والامتثال بذكاء اصطناعي محلي.`,
      canonicalUrl: req.body.pageUrl || "https://app.mudarij.com",
      structuredDataJson: "{}"
    });
  }
});

export default router;
