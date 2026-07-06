import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit, generateContentWithRetry } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { GoogleGenAI } from "@google/genai";

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
// CONTACTS & SEGMENTS
// ==========================================

// List Contacts
router.get("/contacts", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("email_contacts").where("userId", "==", req.user.uid).get();
    const contacts = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // If empty, let's pre-populate some high quality active contacts from the CRM leads to be helpful
    if (contacts.length === 0) {
      const leadsSnap = await db.collection("leads").where("userId", "==", req.user.uid).limit(10).get();
      const defaultContacts = [];
      
      if (!leadsSnap.empty) {
        for (const doc of leadsSnap.docs) {
          const l = doc.data();
          const contactObj = {
            name: l.name || "عميل محتمل",
            email: l.email && l.email !== "N/A" ? l.email : `customer.${doc.id.slice(-4)}@corp.sa`,
            company: l.company || "N/A",
            status: "Active",
            segmentTags: l.leadScore === "Hot" ? ["High Value", "Qualified"] : ["Warm"],
            userId: req.user.uid,
            createdAt: new Date().toISOString()
          };
          const saved = await db.collection("email_contacts").add(contactObj);
          defaultContacts.push({ id: saved.id, ...contactObj });
        }
        return res.json(defaultContacts);
      } else {
        // Fallback robust default contacts
        const list = [
          { name: "أحمد الفهد", email: "a.fahad@aramco.com", company: "Aramco", status: "Active", segmentTags: ["High Value", "Tech Stack"], userId: req.user.uid, createdAt: new Date().toISOString() },
          { name: "منى الدوسري", email: "m.dosari@salla.sa", company: "Salla", status: "Active", segmentTags: ["E-commerce", "Active"], userId: req.user.uid, createdAt: new Date().toISOString() },
          { name: "عمر الحربي", email: "o.harbi@lean.sa", company: "Lean Tech", status: "Active", segmentTags: ["Developer", "Warm"], userId: req.user.uid, createdAt: new Date().toISOString() },
          { name: "فاطمة العمودي", email: "f.amoudi@foodics.com", company: "Foodics", status: "Active", segmentTags: ["Retail", "High Value"], userId: req.user.uid, createdAt: new Date().toISOString() }
        ];
        for (const contact of list) {
          const saved = await db.collection("email_contacts").add(contact);
          defaultContacts.push({ id: saved.id, ...contact });
        }
        return res.json(defaultContacts);
      }
    }
    res.json(contacts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Contact
router.post("/contacts", authenticate, async (req: any, res) => {
  try {
    const contactData = {
      ...req.body,
      userId: req.user.uid,
      status: req.body.status || "Active",
      segmentTags: req.body.segmentTags || [],
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection("email_contacts").add(contactData);
    res.status(201).json({ id: docRef.id, ...contactData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Contact
router.put("/contacts/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const contactRef = db.collection("email_contacts").doc(id);
    const snap = await contactRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Contact not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await contactRef.update(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Contact
router.delete("/contacts/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const contactRef = db.collection("email_contacts").doc(id);
    const snap = await contactRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Contact not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await contactRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// CAMPAIGNS & NEWSLETTERS
// ==========================================

// List Campaigns
router.get("/campaigns", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("email_campaigns").where("userId", "==", req.user.uid).get();
    const campaigns = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Pre-populate campaigns if none exist
    if (campaigns.length === 0) {
      const defaults = [
        {
          name: "إعلان تدشين نظام المدفوعات المطور",
          subjectLine: "🚀 طريقة ذكية لتسريع تسوياتك المالية اليوم!",
          status: "Sent",
          sentCount: 1250,
          openCount: 540,
          clickCount: 180,
          bounceCount: 5,
          spamCount: 1,
          revenueGenerated: 45000,
          targetSegment: "High Value",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          userId: req.user.uid
        },
        {
          name: "رسالة الترحيب الأسبوعية بالعملاء الجدد",
          subjectLine: "أهلاً بك في Madarij OS - دليلك المالي الأول",
          status: "Sent",
          sentCount: 890,
          openCount: 610,
          clickCount: 345,
          bounceCount: 2,
          spamCount: 0,
          revenueGenerated: 28000,
          targetSegment: "Warm",
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
          userId: req.user.uid
        },
        {
          name: "حملة استعادة السلال المتروكة",
          subjectLine: "⚠️ لم ينتهِ تسوقك بعد.. احصل على خصم 15% الآن!",
          status: "Draft",
          sentCount: 0,
          openCount: 0,
          clickCount: 0,
          bounceCount: 0,
          spamCount: 0,
          revenueGenerated: 0,
          targetSegment: "Inactive",
          createdAt: new Date().toISOString(),
          userId: req.user.uid
        }
      ];

      const savedList = [];
      for (const camp of defaults) {
        const docRef = await db.collection("email_campaigns").add(camp);
        savedList.push({ id: docRef.id, ...camp });
      }
      return res.json(savedList);
    }
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Campaign
router.post("/campaigns", authenticate, async (req: any, res) => {
  try {
    const campaignData = {
      ...req.body,
      userId: req.user.uid,
      status: "Draft",
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      bounceCount: 0,
      spamCount: 0,
      revenueGenerated: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection("email_campaigns").add(campaignData);
    logAudit("EmailMarketing", { action: "Create Campaign", id: docRef.id }, campaignData, req);
    res.status(201).json({ id: docRef.id, ...campaignData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Campaign
router.put("/campaigns/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const campaignRef = db.collection("email_campaigns").doc(id);
    const snap = await campaignRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Campaign not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await campaignRef.update(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Simulate Send Campaign & Create realistic Analytics data
router.post("/campaigns/:id/send", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const campaignRef = db.collection("email_campaigns").doc(id);
    const snap = await campaignRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Campaign not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    // Fetch total active contacts
    const contactsSnap = await db.collection("email_contacts").where("userId", "==", req.user.uid).get();
    const totalContacts = contactsSnap.empty ? 2500 : contactsSnap.size * 125; // amplify to simulate list

    // Realistic stats
    const openRate = 0.35 + Math.random() * 0.15; // 35% - 50%
    const clickRate = 0.12 + Math.random() * 0.08; // 12% - 20%
    const bounceRate = 0.005 + Math.random() * 0.01; 
    const spamRate = 0.001;
    const conversionRate = 0.03 + Math.random() * 0.04; // 3% - 7%

    const sentCount = totalContacts;
    const openCount = Math.round(sentCount * openRate);
    const clickCount = Math.round(openCount * clickRate);
    const bounceCount = Math.round(sentCount * bounceRate);
    const spamCount = Math.round(sentCount * spamRate);
    const revenueGenerated = Math.round(clickCount * conversionRate * 450); // average order value ~450 SAR

    const updateData = {
      status: "Sent",
      sentCount,
      openCount,
      clickCount,
      bounceCount,
      spamCount,
      revenueGenerated,
      sentAt: new Date().toISOString()
    };

    await campaignRef.update(updateData);
    logAudit("EmailMarketing", { action: "Send Campaign", id }, updateData, req);

    res.json({ id, ...updateData, success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Campaign
router.delete("/campaigns/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const campaignRef = db.collection("email_campaigns").doc(id);
    const snap = await campaignRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Campaign not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await campaignRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// EMAIL TEMPLATES
// ==========================================

// List Templates
router.get("/templates", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("email_templates").where("userId", "==", req.user.uid).get();
    const templates = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (templates.length === 0) {
      // Create rich default templates
      const defaults = [
        {
          name: "قالب ترحيب بوهيمي أنيق",
          type: "welcome",
          htmlContent: "<!-- Welcome Email Template -->",
          jsonStructure: {
            blocks: [
              { type: "header", text: "مرحباً بك في عائلة Madarij" },
              { type: "image", url: "https://images.unsplash.com/photo-1557200134-90327ee9fafa?w=800" },
              { type: "text", text: "يسعدنا انضمامك إلينا لبدء رحلتك الاستثمارية وبناء مستقبلك المالي بكل ثقة وكفاءة." },
              { type: "button", text: "ابدأ جولتك التعريفية الآن", url: "https://madarij.sa/get-started" }
            ]
          },
          userId: req.user.uid,
          createdAt: new Date().toISOString()
        },
        {
          name: "قالب عرض تخفيضات التجارة الإلكترونية",
          type: "promo",
          htmlContent: "<!-- Discount Coupon Template -->",
          jsonStructure: {
            blocks: [
              { type: "header", text: "خصم خاص ومحدود فقط لك!" },
              { type: "text", text: "استمتع بخصم فوري 20% على جميع باقات التشغيل الفورية باستخدام هذا الكود المخصص." },
              { type: "code", code: "MADARIJ20" },
              { type: "button", text: "احصل على العرض اليوم", url: "https://madarij.sa/pricing" }
            ]
          },
          userId: req.user.uid,
          createdAt: new Date().toISOString()
        }
      ];

      const savedList = [];
      for (const t of defaults) {
        const docRef = await db.collection("email_templates").add(t);
        savedList.push({ id: docRef.id, ...t });
      }
      return res.json(savedList);
    }
    res.json(templates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Template
router.post("/templates", authenticate, async (req: any, res) => {
  try {
    const templateData = {
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection("email_templates").add(templateData);
    res.status(201).json({ id: docRef.id, ...templateData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// AUTOMATION WORKFLOWS
// ==========================================

// List Automations
router.get("/automations", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("email_automations").where("userId", "==", req.user.uid).get();
    const automations = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (automations.length === 0) {
      const defaults = [
        {
          name: "قمع الترحيب والتأهيل الذاتي",
          triggerEvent: "Lead Created",
          status: "Active",
          enrolledCount: 340,
          completedCount: 210,
          steps: [
            { id: "1", type: "email", label: "إرسال رسالة الترحيب الأولى", delayDays: 0 },
            { id: "2", type: "wait", label: "انتظار يومين", value: 2 },
            { id: "3", type: "condition", label: "هل تم فتح الرسالة؟", field: "opened", yesSteps: [
              { id: "3a", type: "email", label: "إرسال كود خصم تفعيل النظام", delayDays: 0 }
            ], noSteps: [
              { id: "3b", type: "email", label: "تذكير بفوائد المنصة الرئيسية", delayDays: 1 }
            ] }
          ],
          userId: req.user.uid,
          createdAt: new Date().toISOString()
        },
        {
          name: "حملة استعادة السلال المتروكة",
          triggerEvent: "Cart Abandoned",
          status: "Active",
          enrolledCount: 180,
          completedCount: 112,
          steps: [
            { id: "1", type: "wait", label: "انتظار ساعة واحدة", value: 1 },
            { id: "2", type: "email", label: "أشياء رائعة تنتظرك في سلتك", delayDays: 0 },
            { id: "3", type: "wait", label: "انتظار 24 ساعة", value: 24 },
            { id: "4", type: "email", label: "تخفيض نهائي 15% لإكمال الشراء", delayDays: 0 }
          ],
          userId: req.user.uid,
          createdAt: new Date().toISOString()
        }
      ];

      const savedList = [];
      for (const aut of defaults) {
        const docRef = await db.collection("email_automations").add(aut);
        savedList.push({ id: docRef.id, ...aut });
      }
      return res.json(savedList);
    }
    res.json(automations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create Automation
router.post("/automations", authenticate, async (req: any, res) => {
  try {
    const automationData = {
      ...req.body,
      userId: req.user.uid,
      status: req.body.status || "Inactive",
      enrolledCount: 0,
      completedCount: 0,
      createdAt: new Date().toISOString()
    };
    const docRef = await db.collection("email_automations").add(automationData);
    logAudit("EmailMarketing", { action: "Create Automation", id: docRef.id }, automationData, req);
    res.status(201).json({ id: docRef.id, ...automationData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Automation
router.put("/automations/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const autRef = db.collection("email_automations").doc(id);
    const snap = await autRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Automation not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await autRef.update(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Automation
router.delete("/automations/:id", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const autRef = db.collection("email_automations").doc(id);
    const snap = await autRef.get();
    if (!snap.exists) return res.status(404).json({ error: "Automation not found" });
    if (snap.data()?.userId !== req.user.uid) return res.status(403).json({ error: "Unauthorized" });

    await autRef.delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// AI-POWERED COPILOT GENERATION ENDPOINTS
// ==========================================

// AI Content, Subject Lines & CTA Generation
router.post("/ai/generate", authenticate, async (req: any, res) => {
  try {
    const { type, productName, offerDetails, targetAudience, tone, language } = req.body;
    const ai = getGeminiClient();

    let prompt = "";
    if (type === "subject_lines") {
      prompt = `You are a world-class growth email marketing and Conversion Rate Optimization specialist (like Klaviyo / Mailchimp growth engineers).
Generate exactly 5 highly compelling subject lines and preview texts for:
Product Name: ${productName}
Offer Details: ${offerDetails}
Target Audience: ${targetAudience}
Requested Tone: ${tone || "engaging"}
Language: ${language || "ar"}

Provide options categorized as:
1. Catchy & Creative
2. High Urgency
3. Curious & Intriguing
4. Direct & Value-Driven
5. Question-based

Provide the response in strict JSON format. Do not use markdown backticks \`\`\`json.
JSON Structure:
{
  "options": [
    { "category": "Catchy & Creative", "subject": "Subject Line Text", "preview": "Compelling Preview snippet" },
    { "category": "High Urgency", "subject": "Subject Line Text", "preview": "Compelling Preview snippet" },
    { "category": "Curious & Intriguing", "subject": "Subject Line Text", "preview": "Compelling Preview snippet" },
    { "category": "Direct & Value-Driven", "subject": "Subject Line Text", "preview": "Compelling Preview snippet" },
    { "category": "Question-based", "subject": "Subject Line Text", "preview": "Compelling Preview snippet" }
  ]
}`;
    } else {
      // Generate email body content
      prompt = `You are an elite marketing copywriter who designs high-performing newsletters and SaaS promotional emails.
Draft a highly converting email body layout based on these inputs:
Product Name: ${productName}
Offer Details: ${offerDetails}
Target Audience: ${targetAudience}
Tone: ${tone || "professional"}
Language: ${language || "ar"}

The response must be structured as direct JSON. Avoid writing markdown blocks. Translate the response fully to the requested language.
JSON Structure:
{
  "subject": "Compelling optimized subject line",
  "preview": "Subtle preview teaser text",
  "headline": "Bold email main heading",
  "bodyParagraphs": [
    "Paragraph 1 establishing problem & hook",
    "Paragraph 2 presenting our offer as the clear solution",
    "Paragraph 3 highlighting benefits & urgency"
  ],
  "ctaText": "Primary CTA Button text",
  "productRecommendations": [
    { "title": "Bestseller Product/Baha", "desc": "Brief 1 sentence benefit" },
    { "title": "Add-on/Baha 2", "desc": "Brief 1 sentence benefit" }
  ],
  "optimalSendTime": "Best day of week and hour to send to this specific audience (e.g. Tuesday at 10 AM local time with reasoning in Arabic/English)"
}`;
    }

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from copywriting AI engine.");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("AI Email Marketing Generator failed:", err);
    res.status(500).json({ error: err.message });
  }
});

// AI Smart Workflow Automation Planner
router.post("/ai/workflow", authenticate, async (req: any, res) => {
  try {
    const { goal, triggerEvent, language } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert CRM automation architect and marketing operations lead.
Plan a complete customer nurturing email automation sequence/workflow for:
Automation Goal: ${goal || "Increase user activation"}
Trigger Event: ${triggerEvent || "Lead Created"}
Language: ${language || "ar"}

Provide a sequence of actions, timers, and conditional checkpoints in a structured JSON layout. Do not write markdown blocks.
JSON Structure:
{
  "workflowName": "SaaS Onboarding Flow",
  "triggerEvent": "${triggerEvent}",
  "steps": [
    {
      "id": "1",
      "type": "email",
      "label": "Action label in Arabic/English (e.g. Send Welcome Email)",
      "delayDays": 0,
      "description": "Short explanation of purpose"
    },
    {
      "id": "2",
      "type": "wait",
      "label": "Timer in Arabic/English (e.g. Wait 3 days)",
      "value": 3
    },
    {
      "id": "3",
      "type": "condition",
      "label": "Decision point (e.g. Check if Email Opened?)",
      "field": "opened",
      "yesSteps": [
        { "id": "3a", "type": "email", "label": "Send educational feature tutorial", "delayDays": 0 }
      ],
      "noSteps": [
        { "id": "3b", "type": "email", "label": "Send reminders about onboarding tour", "delayDays": 1 }
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
    if (!text) throw new Error("No response from AI automation architect.");
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err: any) {
    console.error("AI workflow planning failed:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
