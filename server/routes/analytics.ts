import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { DataAnalyticsEngine } from "../../src/services/analytics/engine.js";
import { db } from "../services/firebase.js";

const router = Router();
const analyticsEngine = new DataAnalyticsEngine();

router.get("/summary", authenticate, async (req: any, res) => {
  try {
    const invoicesSnapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .get();
    const invoices = invoicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const leadsSnapshot = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const leads = leadsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const report = analyticsEngine.generateFullReport(invoices as any[], leads as any[]);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/context", authenticate, async (req: any, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const user = userDoc.data();

    const leadsSnapshot = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const invoicesSnapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .get();
    const employeesSnapshot = await db
      .collection("employees")
      .where("userId", "==", req.user.uid)
      .get();

    const stats = {
      leads: leadsSnapshot.size,
      invoices: invoicesSnapshot.size,
      employees: employeesSnapshot.size,
      companyName: user?.companyName || "منشأة غير محددة",
      city: user?.city || "غير محدد",
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to gather AI context" });
  }
});

export default router;
