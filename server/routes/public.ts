import { Router } from "express";
import { db } from "../services/firebase.js";

const router = Router();

router.get("/invoices/:id", async (req: any, res) => {
  try {
    const docSnap = await db.collection("invoices").doc(req.params.id).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Invoice not found" });
    
    const invoice: any = { id: docSnap.id, ...docSnap.data() };
    
    // Fetch user settings to get paypal Client ID
    let paypalClientId = null;
    if (invoice.userId) {
       const settingsSnap = await db.collection("settings").doc(invoice.userId).get();
       if (settingsSnap.exists) {
          paypalClientId = settingsSnap.data()?.paypalClientId || null;
       }
    }

    res.json({
      ...invoice,
      paypalClientId
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/invoices/:id/view", async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (invoiceSnap.exists) {
      const invoice: any = invoiceSnap.data();
      if (invoice.status === "sent") {
        const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
        currentLogs.unshift({
          action: "Viewed by Client",
          timestamp: new Date().toISOString(),
        });
        await docRef.update({
          status: "viewed",
          logs: currentLogs,
          isLocked: true,
        });
      }
    }
    res.sendStatus(200);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/invoices/:id/pay", async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (!invoiceSnap.exists) return res.status(404).json({ error: "Invoice not found" });

    const invoice: any = invoiceSnap.data();
    const { amount, gateway, method, transactionId } = req.body;
    const paymentAmountHalalas = Math.round((Number(amount) || (invoice.remainingBalanceHalalas / 100)) * 100);

    const paidAmountHalalas = (invoice.paidAmountHalalas || 0) + paymentAmountHalalas;
    const remainingBalanceHalalas = invoice.totalAmountHalalas - paidAmountHalalas;

    let status = invoice.status;
    if (remainingBalanceHalalas <= 0) {
      status = "paid";
    } else {
      status = "partially paid";
    }

    const gatewayInfo = gateway ? ` via ${gateway} (${method || "Direct"})` : "";
    const txnInfo = transactionId ? ` [Txn: ${transactionId}]` : "";

    const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
    currentLogs.unshift({
      action: `Payment Received: ${(paymentAmountHalalas / 100).toFixed(2)} ${invoice.currency}${gatewayInfo}${txnInfo}`,
      timestamp: new Date().toISOString(),
      note: `Remaining: ${(remainingBalanceHalalas / 100).toFixed(2)} ${invoice.currency}`,
    });

    const updateData = {
      paidAmountHalalas,
      remainingBalanceHalalas,
      status,
      logs: currentLogs,
      isLocked: true
    };

    await docRef.update(updateData);

    res.json({
      id: invoiceSnap.id,
      ...invoice,
      ...updateData
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
