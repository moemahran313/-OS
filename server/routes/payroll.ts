import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { PayrollService } from "../services/payroll.service.js";
import { logAudit } from "../services/utils.js";
import { db } from "../services/firebase.js";

const router = Router();

// Get all payroll runs for the user
router.get("/", authenticate, async (req: any, res) => {
  try {
    const runsSnap = await db.collection("payroll_runs")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const runs = runsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(runs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Run a payroll simulation
router.post("/simulate", authenticate, async (req: any, res) => {
  try {
    const { period } = req.body;
    const result = await PayrollService.simulatePayroll(req.user.uid, period);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Commit a simulated payroll run (though the frontend might do this directly now)
router.post("/commit", authenticate, async (req: any, res) => {
  try {
    const { simulatedRunId, entries, ...runData } = req.body;
    
    const docRef = await db.collection("payroll_runs").add({
      ...runData,
      entries,
      userId: req.user.uid,
      status: "processed",
      createdAt: new Date()
    });
    
    await logAudit("PAYROLL", { 
      action: "Approve Payroll Run", 
      runId: docRef.id, 
      period: runData.period, 
      totalNetPay: runData.totalNet 
    }, { success: true }, req);

    res.json({ id: docRef.id, ...runData, status: "processed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download WPS File
router.get("/wps/:runId", authenticate, async (req: any, res) => {
  try {
    const { data, period } = await PayrollService.generateWPS(req.user.uid, req.params.runId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=WPS_${period}.csv`);
    res.send(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Download Payroll Report
router.get("/report/:runId", authenticate, async (req: any, res) => {
  try {
    const { data, period } = await PayrollService.generateReport(req.user.uid, req.params.runId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_report_${period}.csv`);
    res.send(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
