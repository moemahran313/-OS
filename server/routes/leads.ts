import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { executeWebhooks } from "../services/webhooks.js";
import { GoogleGenAI, Type } from "@google/genai";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const leads = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/reorder", authenticate, async (req: any, res) => {
  const items = req.body;
  if (Array.isArray(items)) {
    try {
      const batch = db.batch();
      for (const item of items) {
        const docRef = db.collection("leads").doc(item.id);
        const updateData: any = {};
        if (item.status) updateData.status = item.status;
        if (item.order !== undefined) updateData.order = item.order;
        if (item.history) updateData.history = item.history;

        batch.update(docRef, updateData);
      }
      await batch.commit();
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ error: "Reorder failed" });
    }
  } else {
    res.sendStatus(400);
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const { value, ...rest } = req.body;
    const leadData = {
      ...rest,
      userId: req.user.uid,
      value: value ? parseFloat(value) : 0,
      status: req.body.status || "new",
      createdAt: new Date(),
    };

    const docRef = await db.collection("leads").add(leadData);

    logAudit("CRM", { action: "Create Lead", id: docRef.id }, leadData, req);

    // Trigger webhooks
    executeWebhooks(req.user.uid, "lead.created", { id: docRef.id, ...leadData });

    res.status(201).json({ id: docRef.id, ...leadData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const { value, ...rest } = req.body;
    const updateData: any = { ...rest };
    if (value !== undefined) updateData.value = parseFloat(value);

    await db.collection("leads").doc(req.params.id).update(updateData);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/score", authenticate, async (req: any, res) => {
  try {
    const leadId = req.params.id;
    const leadDoc = await db.collection("leads").doc(leadId).get();

    if (!leadDoc.exists) {
      return res.status(404).json({ error: "Lead not found" });
    }

    const leadData = leadDoc.data();
    if (leadData?.userId !== req.user.uid) {
      return res.status(403).json({ error: "Unauthorized access to this lead" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: "مفتاح Gemini API غير متاح في إعدادات النظام." });
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const prompt = `Analyze this sales lead and assign a lead priority score:
Lead Name: ${leadData.name || "N/A"}
Company: ${leadData.company || "N/A"}
Industry: ${leadData.industry || "N/A"}
Company Size: ${leadData.companySize || "N/A"}
Expected Deal Value: ${leadData.value || 0} SAR
Conversion Probability: ${leadData.conversionProbability || 0}%
Compliance Risk Level: ${leadData.complianceRisk || "low"}
Strategic Notes: ${leadData.notes || "N/A"}
Interaction/History Logs: ${JSON.stringify(leadData.history || [])}

Provide:
1. leadScore: Must be strictly one of "Hot" or "Warm" or "Cold"
2. leadScoreReason: A short, professional explanation (max 3 sentences) in Arabic (عربي) detailing why this score was assigned and offering actionable next steps.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            leadScore: {
              type: Type.STRING,
              description: "Strictly one of 'Hot', 'Warm', or 'Cold'",
            },
            leadScoreReason: {
              type: Type.STRING,
              description: "Short reason and strategic sales advice in Arabic.",
            },
          },
          required: ["leadScore", "leadScoreReason"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response from AI lead scoring engine.");
    }

    const parsed = JSON.parse(resultText);
    const score = parsed.leadScore || "Warm";
    const reason = parsed.leadScoreReason || "لا يوجد مبرر كافي.";

    // Append to lead history
    const newHistoryItem = {
      id: `h_ai_${Date.now()}`,
      date: new Date().toISOString(),
      action: "تقييم الذكاء الاصطناعي",
      details: `تم تقييم الفرصة البيعية كـ (${score}) بناءً على تحليل البيانات. السبب: ${reason}`,
    };

    const updatedHistory = [newHistoryItem, ...(leadData.history || [])];

    const updatePayload = {
      leadScore: score,
      leadScoreReason: reason,
      leadScoreDate: new Date().toISOString(),
      history: updatedHistory,
    };

    await db.collection("leads").doc(leadId).update(updatePayload);

    logAudit("CRM", { action: "AI Lead Scoring", id: leadId }, { score, reason }, req);

    res.json({ id: leadId, score, reason, date: updatePayload.leadScoreDate });
  } catch (err: any) {
    console.error("AI Lead scoring failed:", err);
    res.status(500).json({ error: err.message || "Failed to score lead with AI" });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await db.collection("leads").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
