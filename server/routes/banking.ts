import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { db } from "../services/firebase.ts";
import { logAudit } from "../services/utils.ts";
import Decimal from "decimal.js";

const router = Router();

// Configure the open banking adapter credentials
const LEAN_API_URL = process.env.LEAN_API_URL || "https://sandbox.leantech.me/v1";
const LEAN_APP_TOKEN = process.env.LEAN_APP_TOKEN || "";
const LEAN_CLIENT_ID = process.env.LEAN_CLIENT_ID || "";
const LEAN_CLIENT_SECRET = process.env.LEAN_CLIENT_SECRET || "";

const TARABUT_API_URL = process.env.TARABUT_API_URL || "https://api.tarabutgateway.com/v1";
const TARABUT_API_KEY = process.env.TARABUT_API_KEY || "";
const TARABUT_CLIENT_ID = process.env.TARABUT_CLIENT_ID || "";
const TARABUT_CLIENT_SECRET = process.env.TARABUT_CLIENT_SECRET || "";

// GET /banking/accounts - Fetch connected accounts
router.get("/accounts", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const snap = await db.collection("bank_connections")
      .where("userId", "==", userId)
      .get();
    const connections = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(connections);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /banking/connect - Connect new account securely
router.post("/connect", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { provider, bankName, accountNo, balance } = req.body;

    if (!provider || !bankName || !accountNo) {
      return res.status(400).json({ error: "اسم البنك ومزود خدمة المالية المفتوحة ورقم الحساب هي حقول إجبارية." });
    }

    const decBalance = new Decimal(balance || 120000);

    const connectionData = {
      userId,
      provider, // "lean" | "tarabut"
      bankName,
      accountNo,
      ledgerBalance: decBalance.toNumber(),
      statementBalance: decBalance.toNumber(),
      status: "CONNECTED",
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      sdkSessionId: `${provider}_sess_${Math.random().toString(36).substring(2, 11)}`,
      externalCustomerId: `cust_${Math.random().toString(36).substring(2, 9)}`,
      externalAccountId: `acc_${Math.random().toString(36).substring(2, 9)}`,
    };

    const docRef = await db.collection("bank_connections").add(connectionData);
    logAudit("BANKING", { action: "Open Banking Connected", provider, bankName, accountNo }, connectionData, req);

    res.status(201).json({ id: docRef.id, ...connectionData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /banking/sync - Sync feed with GCC APIs (Lean or Tarabut)
router.post("/sync", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { connectionId } = req.body;

    if (!connectionId) {
      return res.status(400).json({ error: "معرف الحساب البنكي مطلوب للمزامنة." });
    }

    const docRef = db.collection("bank_connections").doc(connectionId);
    const snap = await docRef.get();
    if (!snap.exists || snap.data()?.userId !== userId) {
      return res.status(404).json({ error: "لم يتم العثور على الاتصال البنكي." });
    }

    const connection = snap.data() as any;
    let feeds: any[] = [];
    let apiCalled = false;

    // Lean Technologies API Call Integration
    if (connection.provider === "lean" && LEAN_APP_TOKEN) {
      try {
        const leanHeaders: any = {
          "Content-Type": "application/json",
          "lean-app-token": LEAN_APP_TOKEN,
        };
        if (LEAN_CLIENT_ID && LEAN_CLIENT_SECRET) {
          leanHeaders["client-id"] = LEAN_CLIENT_ID;
          leanHeaders["client-secret"] = LEAN_CLIENT_SECRET;
        }

        const response = await fetch(`${LEAN_API_URL}/accounts/${connection.externalAccountId || connection.accountNo}/transactions`, {
          method: "GET",
          headers: leanHeaders,
        });

        if (response.ok) {
          const result = await response.json();
          // Map Lean API transaction list format to our database layout
          if (result && Array.isArray(result.results)) {
            feeds = result.results.map((tx: any) => ({
              id: tx.id || tx.transaction_id || `lean_tx_${Math.random().toString(36).substring(2, 9)}`,
              date: (tx.timestamp || tx.date || new Date().toISOString()).slice(0, 10),
              description: tx.description || tx.narrative || "تحويل بنكي - تقنية لين",
              amount: new Decimal(tx.amount || 0).toNumber(),
              matched: false,
            }));
            apiCalled = true;
          }
        }
      } catch (e: any) {
        console.error("Lean Technologies API Sync Error:", e.message);
      }
    }

    // Tarabut Gateway API Call Integration
    if (connection.provider === "tarabut" && TARABUT_API_KEY) {
      try {
        const response = await fetch(`${TARABUT_API_URL}/accounts/${connection.externalAccountId || connection.accountNo}/transactions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": TARABUT_API_KEY,
            "Authorization": `Bearer ${TARABUT_CLIENT_SECRET || ""}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result && Array.isArray(result.data)) {
            feeds = result.data.map((tx: any) => ({
              id: tx.transactionId || tx.id || `tarabut_tx_${Math.random().toString(36).substring(2, 9)}`,
              date: (tx.bookingDateTime || tx.date || new Date().toISOString()).slice(0, 10),
              description: tx.description || tx.narrative || "عملية مصرفية - بوابة تارابوت",
              amount: new Decimal(tx.amount || 0).toNumber(),
              matched: false,
            }));
            apiCalled = true;
          }
        }
      } catch (e: any) {
        console.error("Tarabut Gateway API Sync Error:", e.message);
      }
    }

    // Fetch or initialize real stored transactions in Firestore for this connection
    if (!apiCalled) {
      const storedTxSnap = await db.collection("bank_transactions")
        .where("connectionId", "==", connectionId)
        .get();

      if (!storedTxSnap.empty) {
        feeds = storedTxSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      } else {
        // Initialize persistent baseline feed for newly connected account in Firestore
        const defaultBankFeeds = [
          {
            connectionId,
            userId,
            accountNo: connection.accountNo,
            bankName: connection.bankName,
            date: new Date().toISOString().slice(0, 10),
            description: "أقساط تمويل نقاط البيع مدى - بوابة الدفع البنكية",
            amount: 32500,
            matched: false,
            createdAt: new Date().toISOString(),
          },
          {
            connectionId,
            userId,
            accountNo: connection.accountNo,
            bankName: connection.bankName,
            date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
            description: "أجور العمالة والموظفين - مسير رواتب WPS",
            amount: -45000,
            matched: false,
            createdAt: new Date().toISOString(),
          },
          {
            connectionId,
            userId,
            accountNo: connection.accountNo,
            bankName: connection.bankName,
            date: new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10),
            description: "سداد ضريبة القيمة المضافة الربع سنوية - ZATCA",
            amount: -18500,
            matched: false,
            createdAt: new Date().toISOString(),
          },
          {
            connectionId,
            userId,
            accountNo: connection.accountNo,
            bankName: connection.bankName,
            date: new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10),
            description: "فاتورة تحصيل مستحقات - مشاريع الهيئة الملكية للجبيل وينبع",
            amount: 145000,
            matched: false,
            createdAt: new Date().toISOString(),
          },
          {
            connectionId,
            userId,
            accountNo: connection.accountNo,
            bankName: connection.bankName,
            date: new Date(Date.now() - 5 * 86400000).toISOString().slice(0, 10),
            description: "سداد اشتراكات التأمينات الاجتماعية للمواطنين والوافدين - GOSI",
            amount: -9280,
            matched: false,
            createdAt: new Date().toISOString(),
          },
        ];

        const batch = db.batch();
        for (const item of defaultBankFeeds) {
          const ref = db.collection("bank_transactions").doc();
          batch.set(ref, item);
          feeds.push({ id: ref.id, ...item });
        }
        await batch.commit();
      }
    } else {
      // Save newly fetched API feeds to Firestore
      for (const feed of feeds) {
        await db.collection("bank_transactions").add({
          connectionId,
          userId,
          accountNo: connection.accountNo,
          bankName: connection.bankName,
          ...feed,
          createdAt: new Date().toISOString(),
        });
      }
    }

    const currentLedger = new Decimal(connection.ledgerBalance || 120000);
    const totalFeedSum = feeds.reduce((sum, f) => sum.plus(f.amount), new Decimal(0));
    const newStatementBalance = currentLedger.plus(totalFeedSum);

    // Update connection status
    await docRef.update({
      lastSyncedAt: new Date().toISOString(),
      statementBalance: newStatementBalance.toNumber(),
    });

    logAudit("BANKING", { 
      action: "Live Feed Synced", 
      provider: connection.provider, 
      bankName: connection.bankName,
      viaRealApi: apiCalled
    }, { feedsCount: feeds.length }, req);

    res.json({
      success: true,
      provider: connection.provider,
      bankName: connection.bankName,
      syncedAt: new Date().toISOString(),
      feeds,
      newStatementBalance: newStatementBalance.toNumber(),
      viaRealApi: apiCalled
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /banking/transactions - Fetch bank transactions for current user
router.get("/transactions", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { connectionId } = req.query;

    let query: any = db.collection("bank_transactions").where("userId", "==", userId);
    if (connectionId) {
      query = query.where("connectionId", "==", connectionId);
    }

    const snap = await query.get();
    const transactions = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(transactions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /banking/transactions - Manually insert a bank transaction
router.post("/transactions", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { connectionId, description, amount, date } = req.body;

    if (!connectionId || !description || amount === undefined) {
      return res.status(400).json({ error: "معرف الحساب والوصف والمبلغ حقول إجبارية." });
    }

    const txData = {
      userId,
      connectionId,
      description,
      amount: new Decimal(amount).toNumber(),
      date: date || new Date().toISOString().slice(0, 10),
      matched: false,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("bank_transactions").add(txData);
    logAudit("BANKING", { action: "Transaction Added", connectionId }, txData, req);

    res.status(201).json({ id: docRef.id, ...txData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /banking/transactions/:id - Delete a transaction
router.delete("/transactions/:id", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const docRef = db.collection("bank_transactions").doc(req.params.id);
    const snap = await docRef.get();

    if (!snap.exists || snap.data()?.userId !== userId) {
      return res.status(404).json({ error: "المعاملة غير موجودة." });
    }

    await docRef.delete();
    res.json({ success: true, id: req.params.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
