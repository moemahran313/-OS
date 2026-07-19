import { Router } from "express";
import { prisma } from "../services/prisma.ts";
import { authenticate } from "../middleware/auth.ts";
import crypto from "crypto";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: req.user.role === "Administrator" ? {} : { userId: req.user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    });

    const parsedLogs = logs.map((log) => {
      const resultObj = log.result ? JSON.parse(log.result) : {};
      const payloadObj = log.payload ? JSON.parse(log.payload) : {};
      
      // Extract or compute a compliant action hash
      const actionHash = resultObj.actionHash || crypto
        .createHash("sha256")
        .update(JSON.stringify({
          id: log.id,
          userId: log.userId || "",
          module: log.module,
          action: log.action,
          timestamp: log.timestamp.toISOString(),
        }))
        .digest("hex");

      return {
        ...log,
        payload: payloadObj,
        result: resultObj,
        actionHash,
      };
    });

    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
