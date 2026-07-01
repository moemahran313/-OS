import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";

const router = Router();

router.put("/profile", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });
    logAudit("SETTINGS", { action: "Update Profile" }, { success: true }, req);
    res.json(user);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/dashboard-config", authenticate, async (req: any, res) => {
  try {
    const { config } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { dashboardConfig: JSON.stringify(config) },
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/integrations", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const integrations = await prisma.integration.findMany({
      where: { tenantId: user?.tenantId || "default_tenant" },
    });
    res.json(integrations);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
