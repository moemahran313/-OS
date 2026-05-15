import { Router } from "express";
import { prisma } from "../services/prisma.js";

const router = Router();

router.get("/invoices/:id", async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id }
    });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    
    res.json({
      ...invoice,
      lineItems: invoice.lineItems ? JSON.parse(invoice.lineItems) : [],
      sectionOrder: invoice.sectionOrder ? JSON.parse(invoice.sectionOrder) : undefined,
      statusConfig: invoice.statusConfig ? JSON.parse(invoice.statusConfig) : undefined,
      zatcaConfig: invoice.zatcaConfig ? JSON.parse(invoice.zatcaConfig) : undefined,
      branding: invoice.branding ? JSON.parse(invoice.branding) : undefined,
      logs: invoice.logs ? JSON.parse(invoice.logs) : [],
      lateFee: invoice.lateFeeConfig ? JSON.parse(invoice.lateFeeConfig) : undefined
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/invoices/:id/view", async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (invoice && invoice.status === "sent") {
      const currentLogs = invoice.logs ? JSON.parse(invoice.logs) : [];
      currentLogs.unshift({
        action: "Viewed by Client",
        timestamp: new Date().toISOString(),
      });
      await prisma.invoice.update({
        where: { id: req.params.id },
        data: {
          status: "viewed",
          logs: JSON.stringify(currentLogs),
          isLocked: true,
        }
      });
    }
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/invoices/:id/pay", async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const { amount } = req.body;
    const paymentAmountHalalas = Math.round((Number(amount) || (invoice.remainingBalanceHalalas / 100)) * 100);

    const paidAmountHalalas = (invoice.paidAmountHalalas || 0) + paymentAmountHalalas;
    const remainingBalanceHalalas = invoice.totalAmountHalalas - paidAmountHalalas;

    let status = invoice.status;
    if (remainingBalanceHalalas <= 0) {
      status = "paid";
    } else {
      status = "partially paid";
    }

    const currentLogs = invoice.logs ? JSON.parse(invoice.logs) : [];
    currentLogs.unshift({
      action: `Payment Received: ${(paymentAmountHalalas / 100).toFixed(2)}`,
      timestamp: new Date().toISOString(),
      note: `Remaining: ${(remainingBalanceHalalas / 100).toFixed(2)}`,
    });

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        paidAmountHalalas,
        remainingBalanceHalalas,
        status,
        logs: JSON.stringify(currentLogs),
        isLocked: true
      }
    });

    res.json({
      ...updated,
      lineItems: updated.lineItems ? JSON.parse(updated.lineItems) : [],
      logs: currentLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
