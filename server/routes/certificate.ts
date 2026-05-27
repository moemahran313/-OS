import express from "express";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from "firebase/firestore";
import crypto from "crypto";

const router = express.Router();

router.post("/validate", async (req, res) => {
  try {
    const { certificateNumber, companyRegistrationNumber, province } = req.body;
    
    // Simulate validation
    const isValid = certificateNumber && certificateNumber.length >= 5;
    
    const result = {
      valid: isValid,
      timestamp: new Date().toISOString(),
      companyName: isValid ? "شركة معتمدة (Validated Entity)" : "غير مسجل",
      issuer: "Saudi ZATCA / MODON",
      expiryDate: isValid ? new Date(Date.now() + 1000 * 3600 * 24 * 365).toLocaleDateString() : "منتهي/غير صالح",
      cpraNumber: companyRegistrationNumber || "N/A",
      province: province || "Riyadh",
      auditId: "TRX-" + crypto.randomBytes(4).toString("hex").toUpperCase()
    };

    // Save to Firestore for audit logs
    try {
      const db = getFirestore();
      await addDoc(collection(db, "certificate_logs"), {
        timestamp: new Date().toISOString(),
        request: { certificateNumber, companyRegistrationNumber, province },
        result
      });
    } catch (dbErr) {
      console.error("Failed to save certificate log to db", dbErr);
    }

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const db = getFirestore();
    const logsRef = collection(db, "certificate_logs");
    const q = query(logsRef, orderBy("timestamp", "desc"), limit(20));
    const snapshot = await getDocs(q);
    
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json(logs);
  } catch (error: any) {
    console.error("Fetch logs error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
