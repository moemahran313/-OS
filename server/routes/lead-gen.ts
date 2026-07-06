import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit, generateContentWithRetry } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { GoogleGenAI, Type } from "@google/genai";

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

// ==========================================
// LANDING PAGE BUILDER ENDPOINTS
// ==========================================

// List Landing Pages
router.get("/landing-pages", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("landing_pages").where("userId", "==", req.user.uid).get();
    const pages = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Landing Page
router.post("/landing-pages", authenticate, async (req: any, res) => {
  try {
    const pageData = {
      ...req.body,
      userId: req.user.uid,
      views: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("landing_pages").add(pageData);
    logAudit("LeadGen", { action: "Create Landing Page", id: docRef.id }, pageData, req);
    res.status(201).json({ id: docRef.id, ...pageData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Landing Page
router.put("/landing-pages/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const pageRef = db.collection("landing_pages").doc(id);
    const snap = await pageRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Page not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    await pageRef.update(updateData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Landing Page
router.delete("/landing-pages/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const pageRef = db.collection("landing_pages").doc(id);
    const snap = await pageRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Page not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await pageRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Landing Page via AI (Gemini)
router.post("/landing-pages/generate-ai", authenticate, async (req: any, res) => {
  try {
    const { productName, industry, targetAudience, language, goal } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are a world-class growth marketing designer and high-converting SaaS architect.
Generate a structured JSON layout for a premium landing page based on this business detail:
Product/Company Name: ${productName}
Industry: ${industry}
Target Audience: ${targetAudience}
Goal/CTA: ${goal || "Capture Leads"}
Language: ${language || "ar"}

The response must be structured JSON representing a high-fidelity page. Translate everything to the requested language (${language === "ar" ? "Arabic" : "English"}). Do not include any markdown format codeblocks like \`\`\`json, just return raw JSON matching this schema exactly:
{
  "title": "Headline",
  "subtitle": "Subheadline matching value proposition",
  "theme": {
    "primaryColor": "#hex",
    "secondaryColor": "#hex",
    "accentColor": "#hex",
    "fontFamily": "Inter"
  },
  "seo": {
    "title": "SEO Page Title",
    "description": "SEO Page Meta Description",
    "keywords": "comma-separated-keywords"
  },
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "heading": "Big Heading",
      "subheading": "Supporting detailed copy",
      "ctaText": "CTA Button Text",
      "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
    },
    {
      "id": "features",
      "type": "features",
      "heading": "Why choose us?",
      "items": [
        { "title": "Feature 1 Title", "description": "Feature 1 explanation", "icon": "Zap" },
        { "title": "Feature 2 Title", "description": "Feature 2 explanation", "icon": "Shield" },
        { "title": "Feature 3 Title", "description": "Feature 3 explanation", "icon": "BarChart3" }
      ]
    },
    {
      "id": "social_proof",
      "type": "testimonials",
      "heading": "Client Success Stories",
      "items": [
        { "quote": "Stellar product!", "author": "Sara", "role": "CEO of TechCorp" },
        { "quote": "Increased our conversions by 150%", "author": "Ahmed", "role": "VP of Growth" }
      ]
    },
    {
      "id": "cta",
      "type": "cta",
      "heading": "Ready to get started?",
      "subheading": "Sign up today to transform your acquisition pipeline.",
      "ctaText": "Join Now"
    }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
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
    console.error("Landing page AI generation failed:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// FORM BUILDER ENDPOINTS
// ==========================================

// List Forms
router.get("/forms", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("lead_forms").where("userId", "==", req.user.uid).get();
    const forms = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(forms);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Form
router.post("/forms", authenticate, async (req: any, res) => {
  try {
    const formData = {
      ...req.body,
      userId: req.user.uid,
      views: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("lead_forms").add(formData);
    logAudit("LeadGen", { action: "Create Form", id: docRef.id }, formData, req);
    res.status(201).json({ id: docRef.id, ...formData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Form
router.put("/forms/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const formRef = db.collection("lead_forms").doc(id);
    const snap = await formRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Form not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    await formRef.update(updateData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Form
router.delete("/forms/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const formRef = db.collection("lead_forms").doc(id);
    const snap = await formRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Form not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await formRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Generate Form via AI (Gemini)
router.post("/forms/generate-ai", authenticate, async (req: any, res) => {
  try {
    const { industry, purpose, language } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert CRM architect and Conversion Rate Optimization specialist.
Generate a high-converting, smart, multi-step lead capture form structure based on this request:
Industry: ${industry}
Purpose/Offer: ${purpose} (e.g., Get Free Quote, Join Webinar, Request Demo)
Language: ${language || "ar"}

The response must be raw JSON. Do not write markdown blocks. Translate labels and placeholders to ${language === "ar" ? "Arabic" : "English"}.
Response structure:
{
  "name": "Form Name",
  "steps": [
    {
      "stepTitle": "Step Title (e.g., Contact Info)",
      "fields": [
        { "id": "name", "label": "Full Name", "type": "text", "required": true, "placeholder": "Enter name" },
        { "id": "email", "label": "Email", "type": "email", "required": true, "placeholder": "Enter email" }
      ]
    },
    {
      "stepTitle": "Step Title (e.g., Company Info)",
      "fields": [
        { "id": "company", "label": "Company Name", "type": "text", "required": true, "placeholder": "Enter company name" },
        { "id": "companySize", "label": "Company Size", "type": "select", "options": ["1-10", "11-50", "51-200", "200+"], "required": false }
      ]
    }
  ]
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
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
    console.error("AI form generation failed:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// POPUPS BUILDER ENDPOINTS
// ==========================================

// List Popups
router.get("/popups", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("lead_popups").where("userId", "==", req.user.uid).get();
    const popups = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(popups);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Popup
router.post("/popups", authenticate, async (req: any, res) => {
  try {
    const popupData = {
      ...req.body,
      userId: req.user.uid,
      views: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("lead_popups").add(popupData);
    logAudit("LeadGen", { action: "Create Popup", id: docRef.id }, popupData, req);
    res.status(201).json({ id: docRef.id, ...popupData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Popup
router.put("/popups/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const popupRef = db.collection("lead_popups").doc(id);
    const snap = await popupRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Popup not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    await popupRef.update(updateData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Popup
router.delete("/popups/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const popupRef = db.collection("lead_popups").doc(id);
    const snap = await popupRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Popup not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await popupRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// CHATBOT & INTERACTION ENDPOINTS
// ==========================================

// Get Chatbot Config
router.get("/chatbots", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("lead_chatbots").where("userId", "==", req.user.uid).get();
    if (snap.empty) {
      // Return default configuration
      const defaultConfig = {
        name: "مستشار Madarij الذكي",
        greeting: "أهلاً بك! كيف يمكنني مساعدتك في تنمية أعمالك اليوم وتأهيل استفسارك؟",
        systemPrompt: "You are a professional corporate intelligence representative for Madarij OS. Always be courteous, answer product questions briefly, and guide the user politely to provide their name, email, company, and phone number to schedule a full presentation with our team.",
        capturedFields: ["name", "email", "company", "phone"],
        enabled: true,
        createdAt: new Date().toISOString(),
      };
      return res.json([defaultConfig]);
    }
    const chatbots = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(chatbots);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create/Update Chatbot Config
router.post("/chatbots", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("lead_chatbots").where("userId", "==", req.user.uid).get();
    const chatbotData = {
      ...req.body,
      userId: req.user.uid,
      updatedAt: new Date().toISOString(),
    };

    if (snap.empty) {
      chatbotData.createdAt = new Date().toISOString();
      const docRef = await db.collection("lead_chatbots").add(chatbotData);
      res.status(201).json({ id: docRef.id, ...chatbotData });
    } else {
      const docId = snap.docs[0].id;
      await db.collection("lead_chatbots").doc(docId).update(chatbotData);
      res.json({ id: docId, ...chatbotData });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Chatbot Message Endpoint (AI interactive response + data extraction)
router.post("/chatbots/message", async (req: any, res) => {
  try {
    const { messages, systemPrompt, capturedFields } = req.body;
    const ai = getGeminiClient();

    // Prepare history logs
    const messageHistory = messages.map((m: any) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`).join("\n");

    const prompt = `${systemPrompt || "You are an AI Sales Assistant capturing leads."}
Review this chat history:
${messageHistory}

Your tasks:
1. Provide a professional, warm reply to the user's latest statement in Arabic. Keep it brief and naturally guide them to complete missing lead fields: ${capturedFields ? capturedFields.join(", ") : "name, email, company, phone"}.
2. Inspect the user statements to see if any of these variables can be extracted.
   Extract and provide:
   - name: full name of user (if mentioned)
   - email: email address (if mentioned)
   - company: company name (if mentioned)
   - phone: phone number (if mentioned)
   - isLeadComplete: true if you have captured at least name & email.

Provide the response in structured JSON:
{
  "reply": "Assistant response text in Arabic",
  "extractedData": {
    "name": "extracted_name_or_empty",
    "email": "extracted_email_or_empty",
    "company": "extracted_company_or_empty",
    "phone": "extracted_phone_or_empty"
  },
  "isLeadComplete": false
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from chatbot AI.");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("Chatbot AI failed:", err);
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// SUBMISSIONS & ANALYSIS LOGS
// ==========================================

// Get Submissions list
router.get("/submissions", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("lead_submissions").where("userId", "==", req.user.uid).get();
    const submissions = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(submissions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Public Submission Endpoint
router.post("/submissions", async (req: any, res) => {
  try {
    const { formId, popupId, chatbotId, data, source, device, country, userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing target userId context." });
    }

    // Increment corresponding metric if formId or popupId is present
    if (formId) {
      const formRef = db.collection("lead_forms").doc(formId);
      const fs = await formRef.get();
      if (fs.exists) {
        await formRef.update({ conversions: (fs.data()?.conversions || 0) + 1 });
      }
    }
    if (popupId) {
      const popRef = db.collection("lead_popups").doc(popupId);
      const ps = await popRef.get();
      if (ps.exists) {
        await popRef.update({ conversions: (ps.data()?.conversions || 0) + 1 });
      }
    }

    const submissionData = {
      formId: formId || null,
      popupId: popupId || null,
      chatbotId: chatbotId || null,
      data: data || {},
      source: source || "Direct",
      device: device || "Desktop",
      country: country || "SA",
      userId,
      status: "New",
      score: "Warm", // default before AI analysis
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("lead_submissions").add(submissionData);

    // Sync to main CRM 'leads' collection automatically so it's a real lead!
    const leadPayload = {
      userId,
      name: data.name || data.fullName || "عميل محتمل مجهول",
      email: data.email || "N/A",
      phone: data.phone || data.phoneNumber || "N/A",
      company: data.company || data.companyName || "N/A",
      status: "new",
      value: data.budget ? parseFloat(data.budget) || 15000 : 15000,
      industry: data.industry || "N/A",
      companySize: data.companySize || "N/A",
      notes: `تم توليد الفرصة تلقائياً عبر: ${formId ? "نموذج رقم " + formId : popupId ? "نافذة رقم " + popupId : "الدردشة الذكية"}. بيانات العميل: ${JSON.stringify(data)}`,
      createdAt: new Date().toISOString(),
    };

    const leadRef = await db.collection("leads").add(leadPayload);

    res.status(201).json({ id: docRef.id, leadId: leadRef.id, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Deep Qualification, Scoring & Enrichment (Apollo/Clearbit Style)
router.post("/submissions/:id/analyze", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const subRef = db.collection("lead_submissions").doc(id);
    const snap = await subRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Submission not found" });
    const subData = snap.data();
    if (subData?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    const customerData = subData.data || {};
    const ai = getGeminiClient();

    // AI Prompts Clearbit enrichment simulation + scoring + rep assignment
    const prompt = `You are a professional corporate intelligence tool (Clearbit, Apollo.io, and Clay) and CRM strategist.
Enrich this raw B2B lead submission data and provide strategic qualification details:
Raw Data: ${JSON.stringify(customerData)}
Origin: ${subData.source || "Direct"}
Country: ${subData.country || "SA"}

Provide:
1. Enriched Company Profile:
   - companyName: Standardized company name
   - domain: estimated corporate domain
   - size: estimated headcount range
   - revenue: estimated annual recurring revenue range in SAR
   - industry: primary sector/niche
   - technologiesUsed: potential tech stack (comma separated)
2. Lead Qualification metrics:
   - score: "Hot" (High intent + B2B fit), "Warm" (Moderate intent/fit), or "Cold" (Low fit or test lead)
   - qualificationExplanation: Why this score is assigned in Arabic (max 2 sentences).
   - conversionProbability: percentage from 1 to 100
   - recommendedFollowUp: Recommended sales play/action item (Arabic, max 2 sentences)
   - assignedSalesRep: Recommended sales specialist name (Arabic)

Provide the output as STRICT JSON:
{
  "enriched": {
    "companyName": "",
    "domain": "",
    "size": "",
    "revenue": "",
    "industry": "",
    "technologiesUsed": ""
  },
  "qualification": {
    "score": "Hot",
    "qualificationExplanation": "",
    "conversionProbability": 85,
    "recommendedFollowUp": "",
    "assignedSalesRep": ""
  }
}`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from enrichment AI engine.");
    const parsed = JSON.parse(text);

    // Update submission record
    const updatePayload = {
      enrichedData: parsed.enriched,
      qualification: parsed.qualification,
      score: parsed.qualification.score,
      status: "Qualified",
      analyzedAt: new Date().toISOString(),
    };

    await subRef.update(updatePayload);

    // Search and update the linked lead in CRM 'leads' collection
    const emailToSearch = customerData.email || "N/A";
    const nameToSearch = customerData.name || customerData.fullName || "";
    if (emailToSearch !== "N/A" || nameToSearch) {
      const leadsSnap = await db.collection("leads")
        .where("userId", "==", req.user.uid)
        .where("email", "==", emailToSearch)
        .get();

      if (!leadsSnap.empty) {
        const leadId = leadsSnap.docs[0].id;
        await db.collection("leads").doc(leadId).update({
          leadScore: parsed.qualification.score,
          leadScoreReason: parsed.qualification.qualificationExplanation,
          leadScoreDate: new Date().toISOString(),
          companySize: parsed.enriched.size,
          industry: parsed.enriched.industry,
          conversionProbability: parsed.qualification.conversionProbability,
          notes: `[AI Enriched] الفرع: ${parsed.enriched.industry}. التقنية المستخدمة: ${parsed.enriched.technologiesUsed}. الإجراء الموصى به: ${parsed.qualification.recommendedFollowUp}. المندوب الموصى به: ${parsed.qualification.assignedSalesRep}`,
        });
      }
    }

    res.json({ id, ...updatePayload });
  } catch (err: any) {
    console.error("AI Enrichment failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
