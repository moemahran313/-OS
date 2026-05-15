import { Router } from "express";
import puppeteer from "puppeteer";
import { logAudit } from "../services/utils.js";
import { authenticate } from "../middleware/auth.js";
import { db } from "../services/firebase.js";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db.collection("invoices")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    
    const invoices = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

router.get("/:id", authenticate, async (req: any, res) => {
  try {
    const doc = await db.collection("invoices").doc(req.params.id).get();
    const invoice = doc.data();
    
    if (!invoice || invoice.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }
    
    res.json({ id: doc.id, ...invoice });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const { 
      number, clientName, clientEmail, clientPhone, dueDate, 
      currency, lineItems, subtotalHalalas, vatAmountHalalas, 
      totalAmountHalalas, status, paymentTerms, notes, 
      lateFee, branding, sectionOrder, statusConfig, zatcaConfig,
      billingEmail, numberFormat
    } = req.body;

    const invoiceId = `inv_${Date.now()}`;
    const host = req.get('host');
    const paymentLink = `http://${host}/pay/${invoiceId}`;

    const invoiceData = {
      userId: req.user.uid,
      number,
      clientName,
      clientEmail,
      clientPhone,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      currency: currency || "SAR",
      lineItems: lineItems || [],
      subtotalHalalas: subtotalHalalas || 0,
      vatAmountHalalas: vatAmountHalalas || 0,
      totalAmountHalalas: totalAmountHalalas || 0,
      status: status || "draft",
      paymentLink,
      paymentTerms,
      notes,
      billingEmail,
      numberFormat,
      sectionOrder: sectionOrder || [],
      statusConfig: statusConfig || {},
      zatcaConfig: zatcaConfig || {},
      lateFeeConfig: lateFee || {},
      branding: branding || {},
      logs: [{ action: "Created", timestamp: new Date().toISOString() }],
      isLocked: status !== "draft",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection("invoices").add(invoiceData);

    logAudit("INVOICE", { action: "Create Invoice", invoiceId: docRef.id, number }, { success: true }, req);
    res.status(201).json({ id: docRef.id, ...invoiceData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const existing = snap.data();

    if (!existing || existing.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    if (existing.isLocked && existing.status !== 'draft' && !req.body.isForceUpdate) {
      return res.status(403).json({ error: "Invoice is locked" });
    }

    const { 
      lineItems, lateFee, branding, sectionOrder, statusConfig, zatcaConfig,
      dueDate, isDraftAutoSave, ...rest 
    } = req.body;

    const currentLogs = Array.isArray(existing.logs) ? [...existing.logs] : [];
    if (!isDraftAutoSave) {
      currentLogs.unshift({ 
        action: req.body.action || "Manual Update", 
        timestamp: new Date().toISOString(),
        note: req.body.versionNote,
        user: req.user.name || req.user.email,
      });
    }

    const updateData = {
      ...rest,
      dueDate: dueDate || existing.dueDate,
      lineItems: lineItems || existing.lineItems,
      lateFeeConfig: lateFee || existing.lateFeeConfig,
      branding: branding || existing.branding,
      sectionOrder: sectionOrder || existing.sectionOrder,
      statusConfig: statusConfig || existing.statusConfig,
      zatcaConfig: zatcaConfig || existing.zatcaConfig,
      logs: currentLogs.slice(0, 20),
      version: (existing.version || 1) + (isDraftAutoSave ? 0 : 1),
      updatedAt: new Date()
    };

    await docRef.update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/payment", authenticate, async (req: any, res) => {
  try {
    const { amountHalalas } = req.body;
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const inv = snap.data();
    
    if (!inv || inv.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    const newPaid = (inv.paidAmountHalalas || 0) + amountHalalas;
    const remainingBalanceHalalas = inv.totalAmountHalalas - newPaid;
    const newStatus = remainingBalanceHalalas <= 0 ? "paid" : "partially_paid";

    const currentLogs = Array.isArray(inv.logs) ? [...inv.logs] : [];
    currentLogs.unshift({
      action: `Payment Recorded: ${(amountHalalas / 100).toFixed(2)}`,
      timestamp: new Date().toISOString(),
    });

    await docRef.update({
      paidAmountHalalas: newPaid,
      remainingBalanceHalalas: remainingBalanceHalalas,
      status: newStatus,
      logs: currentLogs
    });

    logAudit("FINANCE", { action: "Record Payment", id: req.params.id, amountHalalas }, { success: true }, req);
    res.json({ success: true, status: newStatus });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/pdf", authenticate, async (req: any, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("invoices").doc(id).get();
    const invoice = doc.data();
    
    if (!invoice || invoice.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }

    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    
    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol;
    const url = `${protocol}://${host}/pay/${id}?print=true`;
    
    await page.goto(url, { waitUntil: 'networkidle0' });
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    
    await browser.close();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.number}.pdf`);
    res.send(pdf);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
});

router.post("/automation/run-reminders", authenticate, async (req: any, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const overdueSnap = await db.collection("invoices")
      .where("userId", "==", req.user.uid)
      .where("status", "not-in", ["paid", "cancelled"])
      .get();

    const results: any[] = [];
    const batch = db.batch();

    for (const doc of overdueSnap.docs) {
      const inv = doc.data();
      if (inv.dueDate && inv.dueDate < today) {
        let updatedTotal = inv.totalAmountHalalas;
        let updatedBalance = inv.remainingBalanceHalalas;
        let appliedFee = false;

        const lateFee = inv.lateFeeConfig || null;
        
        if (lateFee && lateFee.value) {
          let feeHalalas = 0;
          if (lateFee.type === 'percentage') {
            feeHalalas = Math.round(inv.totalAmountHalalas * (lateFee.value / 100));
          } else if (lateFee.type === 'fixed') {
            feeHalalas = lateFee.valueHalalas || 0;
          }

          if (feeHalalas > 0) {
            updatedTotal += feeHalalas;
            updatedBalance += feeHalalas;
            appliedFee = true;
            await logAudit("INVOICE", { action: "Applied Late Fee", invoiceId: doc.id, amount: feeHalalas / 100 }, { success: true }, req);
          }
        }

        if (appliedFee) {
          batch.update(doc.ref, {
            totalAmountHalalas: updatedTotal,
            remainingBalanceHalalas: updatedBalance
          });
        }
        results.push({ invoiceNumber: inv.number, client: inv.clientName, action: "Reminder Processed" });
      }
    }

    await batch.commit();
    res.json({ success: true, processed: results.length, details: results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/correction", authenticate, async (req: any, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const existing = snap.data();
    
    if (!existing || existing.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }

    const { type, amount, reason } = req.body;
    const amountHalalas = Math.round(amount * 100);
    
    const currentLogs = Array.isArray(existing.logs) ? [...existing.logs] : [];
    currentLogs.unshift({
      action: `Correction Issued: ${type === 'credit' ? 'Credit Note' : 'Debit Note'}`,
      timestamp: new Date().toISOString(),
      note: `Amount: ${amount}, Reason: ${reason}`
    });

    let newTotalHalalas = existing.totalAmountHalalas;
    if (type === 'credit') {
      newTotalHalalas -= amountHalalas;
    } else {
      newTotalHalalas += amountHalalas;
    }

    await docRef.update({
      totalAmountHalalas: newTotalHalalas,
      remainingBalanceHalalas: newTotalHalalas - (existing.paidAmountHalalas || 0),
      logs: currentLogs,
      isLocked: true,
      version: (existing.version || 1) + 1
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
