import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { PayrollService } from "../services/payroll.service.ts";
import { logAudit } from "../services/utils.ts";
import { db } from "../services/firebase.ts";

const router = Router();

// Get all payroll runs for the user
router.get("/", authenticate, async (req: any, res) => {
  try {
    const runsSnap = await db
      .collection("payroll_runs")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const runs = runsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      createdAt: new Date(),
    });

    await logAudit(
      "PAYROLL",
      {
        action: "Approve Payroll Run",
        runId: docRef.id,
        period: runData.period,
        totalNetPay: runData.totalNet,
      },
      { success: true },
      req
    );

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

// Download SIF (Salary Information File) for Saudi Banks (Tab-Delimited)
router.get("/sif/:runId", authenticate, async (req: any, res) => {
  try {
    const runDoc = await db.collection("payroll_runs").doc(req.params.runId).get();
    const run = runDoc.data();

    if (!run || run.userId !== req.user.uid) {
      return res.status(404).json({ error: "Payroll run not found" });
    }

    let employerId = "1000000000"; // Fallback 10-digit MOL/CR number
    let employerIban = "SA0000000000000000000000";
    try {
      const userSnap = await db.collection("users").doc(req.user.uid).get();
      const userData = userSnap.data();
      if (userData?.crNumber && userData.crNumber.length === 10) {
        employerId = userData.crNumber;
      }
      if (userData?.iban) {
        employerIban = userData.iban;
      }
    } catch (e) {
      // Ignore
    }

    const date = new Date();
    const fileDate = date.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
    const fileTime = date.toTimeString().slice(0, 5).replace(/:/g, ""); // HHMM
    const periodStr = run.period.replace("-", ""); // YYYYMM

    const numEntries = run.entries.length;
    const totalNet = run.totalNet || run.entries.reduce((acc: number, entry: any) => acc + (entry.netPay || 0), 0);

    // Header Row (Type 14)
    let sifContent = `14\t${employerId}\t${employerIban}\t${fileDate}\t${fileTime}\t${periodStr}\t${totalNet.toFixed(2)}\t${numEntries}\tSAR\n`;

    // Employee Rows (Type 15)
    for (const entry of run.entries) {
      const empSnap = await db.collection("employees").doc(entry.employeeId).get();
      const empData = empSnap.data();

      // Iqama or National ID (10 digits)
      const iqamaOrId = empData?.iqamaNumber || empData?.nationalId || empData?.visaNumber || entry.employeeId.replace(/[^\d]/g, "").substring(0, 10).padEnd(10, "0");
      const iban = empData?.iban || "SA0000000000000000000000";
      const bank = empData?.bank || "ALBI";

      const basic = Number(entry.basic || 0).toFixed(2);
      const housing = Number(entry.housing || 0).toFixed(2);
      const otherAllowances = Number((entry.allowances || 0) - (entry.housing || 0)).toFixed(2);
      const deductions = Number(entry.deductions || 0).toFixed(2);
      const netPay = Number(entry.netPay || 0).toFixed(2);

      sifContent += `15\t${iqamaOrId}\t${iban}\t${entry.employeeName}\t${bank}\t${basic}\t${housing}\t${otherAllowances}\t${deductions}\t${netPay}\tG\n`;
    }

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=SIF_${run.period}.sif`);
    res.send(sifContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
