import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";
import { db } from "../services/firebase.js";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("employees").where("userId", "==", req.user.uid).get();
    const employees = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(employees);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const docRef = await db.collection("employees").add({
      ...req.body,
      userId: req.user.uid,
      createdAt: new Date(),
    });
    logAudit("HR", { action: "Create Employee", id: docRef.id }, { id: docRef.id }, req);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    await db.collection("employees").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", authenticate, async (req: any, res) => {
  try {
    const docRef = db.collection("employees").doc(req.params.id);
    const doc = await docRef.get();
    const data = doc.data();

    await docRef.delete();

    await logAudit(
      "PAYROLL",
      {
        action: "Remove Employee",
        employeeId: req.params.id,
        name: data?.name,
      },
      { success: true },
      req
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
