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

    // Helpers to cleanse fields to satisfy strict Saudi Corporate Bank schema parsers
    const cleanId = (id: string) => id.replace(/[^\d]/g, "").substring(0, 10);
    const cleanIban = (iban: string) => iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 24);
    const cleanBank = (bank: string) => bank.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 4);
    const cleanName = (name: string) => {
      // SIF files must not contain tab, carriage return or newlines inside the text fields
      let cleaned = name.replace(/[\t\r\n]/g, " ");
      cleaned = cleaned.replace(/[@#$%*#_<>!?/\\()[\]{}]/g, ""); // strip characters that trip up parses
      cleaned = cleaned.replace(/\s+/g, " ").trim();
      return cleaned.substring(0, 45); // Standard maximum length limit
    };

    let headerEmployerId = cleanId(employerId).padEnd(10, "0");
    let headerEmployerIban = cleanIban(employerIban).padEnd(24, "0");

    // Construct tab-delimited SIF lines safely
    const sifRows: string[] = [];

    // Header Row (Type 14)
    sifRows.push(`14\t${headerEmployerId}\t${headerEmployerIban}\t${fileDate}\t${fileTime}\t${periodStr}\t${totalNet.toFixed(2)}\t${numEntries}\tSAR`);

    // Employee Rows (Type 15)
    for (const entry of run.entries) {
      const empSnap = await db.collection("employees").doc(entry.employeeId).get();
      const empData = empSnap.data();

      // Iqama or National ID (10 digits starting with 1 or 2)
      let iqamaOrId = empData?.iqamaNumber || empData?.nationalId || empData?.visaNumber || entry.employeeId;
      iqamaOrId = cleanId(iqamaOrId);
      if (!/^[12]\d{9}$/.test(iqamaOrId)) {
        iqamaOrId = iqamaOrId.substring(0, 10).padEnd(10, "0");
        if (!iqamaOrId.startsWith("1") && !iqamaOrId.startsWith("2")) {
          iqamaOrId = "1" + iqamaOrId.substring(1);
        }
      }

      const iban = cleanIban(empData?.iban || "SA0000000000000000000000");
      const bank = cleanBank(empData?.bank || "ALBI");
      const empName = cleanName(entry.employeeName || empData?.name || "Employee");

      const basic = Number(entry.basic || 0).toFixed(2);
      const housing = Number(entry.housing || 0).toFixed(2);
      const otherAllowances = Number((entry.allowances || 0) - (entry.housing || 0)).toFixed(2);
      const deductions = Number(entry.deductions || 0).toFixed(2);
      const netPay = Number(entry.netPay || 0).toFixed(2);

      sifRows.push(`15\t${iqamaOrId}\t${iban}\t${empName}\t${bank}\t${basic}\t${housing}\t${otherAllowances}\t${deductions}\t${netPay}\tG`);
    }

    const sifContent = sifRows.join("\n") + "\n";

    // Binary Stream Generation: Use Buffer.from with UTF-8 encoding to prevent system conversion and char-length corruption
    const binaryBuffer = Buffer.from(sifContent, "utf-8");

    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename=SIF_${run.period}.sif`);
    res.setHeader("Content-Length", binaryBuffer.length.toString());
    res.send(binaryBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
