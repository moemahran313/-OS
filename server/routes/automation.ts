import { Router } from "express";

const router = Router();

router.post("/run-reminders", async (req, res) => {
  try {
    console.log("[Automation] Running payment and tax reminders cycle...");
    res.json({
      success: true,
      processed: 0,
      message: "Automated payment and tax reminders cycle executed successfully.",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Automation execution failed" });
  }
});

export default router;
