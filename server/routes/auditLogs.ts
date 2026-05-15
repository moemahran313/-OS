import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: req.user.role === 'Administrator' ? {} : { userId: req.user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      take: 100
    });
    
    const parsedLogs = logs.map(log => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : {},
      result: log.result ? JSON.parse(log.result) : {},
    }));
    
    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
