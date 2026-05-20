import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";
import { db } from "../services/firebase.js";
import { executeWebhooks } from "../services/webhooks.js";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("leads")
      .where("userId", "==", req.user.uid)
      .get();
    const leads = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
      createdAt: new Date()
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

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    await db.collection("leads").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
