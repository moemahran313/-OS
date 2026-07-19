import { Router } from "express";
import puppeteer from "puppeteer";
import { logAudit } from "../services/utils.ts";
import { authenticate } from "../middleware/auth.ts";
import { db } from "../services/firebase.ts";
import { executeWebhooks } from "../services/webhooks.ts";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const snap = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();

    const invoices = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      number,
      clientName,
      clientEmail,
      clientPhone,
      dueDate,
      currency,
      lineItems,
      subtotalHalalas,
      vatAmountHalalas,
      totalAmountHalalas,
      status,
      paymentTerms,
      notes,
      lateFee,
      branding,
      sectionOrder,
      statusConfig,
      zatcaConfig,
      billingEmail,
      numberFormat,
      recurringConfig,
    } = req.body;

    const invoiceId = `inv_${Date.now()}`;
    const host = req.get("host");
    const paymentLink = `http://${host}/pay/${invoiceId}`;

    const invoiceData = {
      userId: req.user.uid,
      number,
      clientName,
      clientEmail,
      clientPhone,
      issueDate: new Date().toISOString().split("T")[0],
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
      recurringConfig: recurringConfig || {},
      logs: [{ action: "Created", timestamp: new Date().toISOString() }],
      isLocked: status !== "draft",
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await db.collection("invoices").add(invoiceData);

    // AUTOMATIC IMMUTABLE DOUBLE-ENTRY LEDGER INTEGRATION
    if (status && status !== "draft") {
      const journalData = {
        userId: req.user.uid,
        companyId: "default",
        journalNumber: `JV-AUTO-${number}`,
        date: new Date().toISOString().split("T")[0],
        description: `قيد ترحيل آلي - مبيعات الفاتورة رقم ${number}`,
        status: "Posted",
        currency: currency || "SAR",
        exchangeRate: 1,
        totalDebits: totalAmountHalalas / 100,
        totalCredits: totalAmountHalalas / 100,
        createdAt: new Date().toISOString(),
        lines: [
          {
            lineNo: 1,
            accountId: "acc-ar",
            accountCode: "1201",
            accountName: "ذمم العملاء / Accounts Receivable",
            debit: totalAmountHalalas / 100,
            credit: 0,
            baseDebit: totalAmountHalalas / 100,
            baseCredit: 0,
            originalCurrency: currency || "SAR",
            exchangeRate: 1,
            description: `إثبات مديونية الفاتورة رقم ${number} للعميل ${clientName}`,
          },
          {
            lineNo: 2,
            accountId: "acc-revenue",
            accountCode: "4101",
            accountName: "إيرادات المبيعات / Sales Revenue",
            debit: 0,
            credit: subtotalHalalas / 100,
            baseDebit: 0,
            baseCredit: subtotalHalalas / 100,
            originalCurrency: currency || "SAR",
            exchangeRate: 1,
            description: `إيرادات مبيعات الفاتورة رقم ${number}`,
          },
          {
            lineNo: 3,
            accountId: "acc-vat-out",
            accountCode: "2201",
            accountName: "ضريبة مخرجات مستحقة / VAT Output Tax",
            debit: 0,
            credit: vatAmountHalalas / 100,
            baseDebit: 0,
            baseCredit: vatAmountHalalas / 100,
            originalCurrency: currency || "SAR",
            exchangeRate: 1,
            description: `ضريبة مبيعات مستحقة للفاتورة رقم ${number}`,
          }
        ].filter(line => line.debit > 0 || line.credit > 0)
      };
      await db.collection("journals").add(journalData);
    }

    logAudit(
      "INVOICE",
      { action: "Create Invoice", invoiceId: docRef.id, number },
      { success: true, ledgerPosted: status !== "draft" },
      req
    );
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

    // STRICT RECONCILIATION & IMMUTABILITY ENFORCEMENT
    if (existing.isLocked && existing.status !== "draft" && !req.body.isForceUpdate) {
      return res.status(403).json({ error: "لا يمكن تعديل هذه الفاتورة. لقد تم ترحيلها مسبقاً وتأمينها في دفتر الأستاذ العام." });
    }

    const {
      lineItems,
      lateFee,
      branding,
      sectionOrder,
      statusConfig,
      zatcaConfig,
      dueDate,
      isDraftAutoSave,
      recurringConfig,
      ...rest
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

    const nextStatus = req.body.status || existing.status;
    const transitioningToLocked = existing.status === "draft" && nextStatus !== "draft";

    const updateData = {
      ...rest,
      dueDate: dueDate || existing.dueDate,
      lineItems: lineItems || existing.lineItems,
      lateFeeConfig: lateFee || existing.lateFeeConfig,
      branding: branding || existing.branding,
      recurringConfig: recurringConfig || existing.recurringConfig,
      sectionOrder: sectionOrder || existing.sectionOrder,
      statusConfig: statusConfig || existing.statusConfig,
      zatcaConfig: zatcaConfig || existing.zatcaConfig,
      logs: currentLogs.slice(0, 20),
      version: (existing.version || 1) + (isDraftAutoSave ? 0 : 1),
      isLocked: transitioningToLocked ? true : (existing.isLocked || false),
      updatedAt: new Date(),
    };

    await docRef.update(updateData);

    // Transitioning from Draft to Active/Sent means we POST to GL automatically
    if (transitioningToLocked) {
      const subtotalHalalas = req.body.subtotalHalalas || existing.subtotalHalalas || 0;
      const vatAmountHalalas = req.body.vatAmountHalalas || existing.vatAmountHalalas || 0;
      const totalAmountHalalas = req.body.totalAmountHalalas || existing.totalAmountHalalas || 0;
      const num = req.body.number || existing.number || "";
      const clientName = req.body.clientName || existing.clientName || "";
      const currency = req.body.currency || existing.currency || "SAR";

      const journalData = {
        userId: req.user.uid,
        companyId: "default",
        journalNumber: `JV-AUTO-${num}`,
        date: new Date().toISOString().split("T")[0],
        description: `قيد ترحيل آلي - مبيعات الفاتورة رقم ${num}`,
        status: "Posted",
        currency,
        exchangeRate: 1,
        totalDebits: totalAmountHalalas / 100,
        totalCredits: totalAmountHalalas / 100,
        createdAt: new Date().toISOString(),
        lines: [
          {
            lineNo: 1,
            accountId: "acc-ar",
            accountCode: "1201",
            accountName: "ذمم العملاء / Accounts Receivable",
            debit: totalAmountHalalas / 100,
            credit: 0,
            baseDebit: totalAmountHalalas / 100,
            baseCredit: 0,
            originalCurrency: currency,
            exchangeRate: 1,
            description: `إثبات مديونية الفاتورة رقم ${num} للعميل ${clientName}`,
          },
          {
            lineNo: 2,
            accountId: "acc-revenue",
            accountCode: "4101",
            accountName: "إيرادات المبيعات / Sales Revenue",
            debit: 0,
            credit: subtotalHalalas / 100,
            baseDebit: 0,
            baseCredit: subtotalHalalas / 100,
            originalCurrency: currency,
            exchangeRate: 1,
            description: `إيرادات مبيعات الفاتورة رقم ${num}`,
          },
          {
            lineNo: 3,
            accountId: "acc-vat-out",
            accountCode: "2201",
            accountName: "ضريبة مخرجات مستحقة / VAT Output Tax",
            debit: 0,
            credit: vatAmountHalalas / 100,
            baseDebit: 0,
            baseCredit: vatAmountHalalas / 100,
            originalCurrency: currency,
            exchangeRate: 1,
            description: `ضريبة مبيعات مستحقة للفاتورة رقم ${num}`,
          }
        ].filter(line => line.debit > 0 || line.credit > 0)
      };
      await db.collection("journals").add(journalData);
    }

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
      logs: currentLogs,
    });

    logAudit(
      "FINANCE",
      { action: "Record Payment", id: req.params.id, amountHalalas },
      { success: true },
      req
    );

    if (newStatus === "paid") {
      executeWebhooks(req.user.uid, "invoice.paid", {
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        total: (inv.totalAmountHalalas / 100).toFixed(2),
        id: req.params.id,
      });
    }

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
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol;
    const url = `${protocol}://${host}/pay/${id}?print=true`;

    await page.goto(url, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${invoice.number}.pdf`);
    res.send(pdf);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
});

router.post("/automation/run-reminders", authenticate, async (req: any, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const overdueSnap = await db
      .collection("invoices")
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
          if (lateFee.type === "percentage") {
            feeHalalas = Math.round(inv.totalAmountHalalas * (lateFee.value / 100));
          } else if (lateFee.type === "fixed") {
            feeHalalas = lateFee.valueHalalas || 0;
          }

          if (feeHalalas > 0) {
            updatedTotal += feeHalalas;
            updatedBalance += feeHalalas;
            appliedFee = true;
            await logAudit(
              "INVOICE",
              { action: "Applied Late Fee", invoiceId: doc.id, amount: feeHalalas / 100 },
              { success: true },
              req
            );
          }
        }

        if (appliedFee) {
          batch.update(doc.ref, {
            totalAmountHalalas: updatedTotal,
            remainingBalanceHalalas: updatedBalance,
          });
        }
        results.push({
          invoiceNumber: inv.number,
          client: inv.clientName,
          action: "Reminder Processed",
        });
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
      action: `Correction Issued: ${type === "credit" ? "Credit Note" : "Debit Note"}`,
      timestamp: new Date().toISOString(),
      note: `Amount: ${amount}, Reason: ${reason}`,
    });

    let newTotalHalalas = existing.totalAmountHalalas;
    if (type === "credit") {
      newTotalHalalas -= amountHalalas;
    } else {
      newTotalHalalas += amountHalalas;
    }

    await docRef.update({
      totalAmountHalalas: newTotalHalalas,
      remainingBalanceHalalas: newTotalHalalas - (existing.paidAmountHalalas || 0),
      logs: currentLogs,
      isLocked: true,
      version: (existing.version || 1) + 1,
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
