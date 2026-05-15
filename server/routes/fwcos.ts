import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { logAudit } from "../services/utils.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post("/zatca-validate", authenticate, async (req: any, res) => {
  const { crNumber, vatNumber, certificateNumber } = req.body;
  
  // Simulation of ZATCA API
  const isValid = true; 
  const result = {
    valid: isValid,
    checkedAt: new Date().toISOString(),
    details: {
      status: "Active",
      registrationDate: "2020-01-01",
      complianceLevel: "High"
    }
  };

  logAudit("ZATCA", req.body, result, req);
  res.json(result);
});

// Workers management (using Employee model)
router.get("/workers", authenticate, async (req: any, res) => {
  try {
    const workers = await prisma.employee.findMany({ where: { userId: req.user.id } });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

router.post("/workers", authenticate, async (req: any, res) => {
  try {
    const worker = await prisma.employee.create({
      data: { ...req.body, userId: req.user.id }
    });
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ error: "Failed to create worker" });
  }
});

// PRO Tasks management (using AuditLog as a timeline of PRO actions)
router.get("/pro-tasks", authenticate, async (req: any, res) => {
  try {
    // In a real app, we might have a PROTask model. 
    // For now, we fetch from AuditLog where module is "PRO_TASK"
    const logs = await prisma.auditLog.findMany({
      where: { module: "PRO_TASK", userId: req.user.id },
      orderBy: { timestamp: "desc" }
    });
    res.json(logs.map(l => ({
      id: l.id,
      ...JSON.parse(l.payload || "{}"),
      result: JSON.parse(l.result || "{}"),
      timestamp: l.timestamp
    })));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PRO tasks" });
  }
});

router.post("/pro-tasks", authenticate, async (req: any, res) => {
  try {
    const task = req.body;
    await logAudit("PRO_TASK", task, { status: "created" }, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create PRO task" });
  }
});

// Simulation & Analytics
router.get("/simulation-baseline", authenticate, async (req: any, res) => {
  try {
    const emps = await prisma.employee.findMany({ where: { userId: req.user.id } });
    const totalEmployees = emps.length;
    const saudiEmployees = emps.filter(e => e.nationality === "Saudi" || e.nationality === "سعودي" || e.nationality === "Saudi Arabia").length;
    const expatEmployees = Math.max(0, totalEmployees - saudiEmployees);
    
    const monthlyPayroll = emps.reduce((acc, e) => acc + ( (e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0) + (e.transportAllowanceHalalas || 0) - (e.otherDeductionsHalalas || 0) ), 0) / 100;
    
    res.json({
      totalEmployees,
      saudiEmployees,
      expatEmployees,
      monthlyPayroll,
      complianceScore: totalEmployees > 0 ? 92 : 0, 
      vatExposure: 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch simulation baseline" });
  }
});

router.get("/certificate/logs", authenticate, async (req: any, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        module: "CERTIFICATE",
        OR: [
          { userId: req.user.id }
        ]
      },
      include: { user: { select: { id: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    
    const filteredLogs = logs.filter(log => log.userId === req.user.id || req.user.role === 'Administrator');

    const parsedLogs = filteredLogs.map(log => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : {},
      result: log.result ? JSON.parse(log.result) : {},
    }));

    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch certificate logs" });
  }
});

router.post("/certificate/validate", authenticate, (req: any, res) => {
  const { certificateNumber, companyRegistrationNumber, province } = req.body;
  let companyName = "Unknown Company";
  if (companyRegistrationNumber?.startsWith("1010")) {
     companyName = "Riyadh Tech Solutions LLC";
  } else if (companyRegistrationNumber?.startsWith("4030")) {
     companyName = "Jeddah Trade Co.";
  } else if (companyRegistrationNumber) {
     companyName = "General Contracting Establishment";
  }

  const payload = {
    valid: !!(certificateNumber && certificateNumber.length > 5),
    companyName,
    province: province || "Riyadh",
    cpraNumber: `CPRA-${Math.floor(Math.random() * 1000000)}`,
    issuer: "Ministry of Human Resources and Social Development",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    auditId: `AUD-${Math.floor(Math.random() * 10000)}`,
    timestamp: new Date().toISOString(),
  };
  logAudit("CERTIFICATE", req.body, payload, req);
  res.json(payload);
});

export default router;
