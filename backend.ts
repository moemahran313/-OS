import { createApp } from "./server/app.ts";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  writeBatch,
  doc,
} from "firebase/firestore";
import fs from "fs";
import path from "path";

const PORT = 3000;

// Initialize Firebase Client SDK for Server Cron
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const firebaseApp = initializeApp(config);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp, config.firestoreDatabaseId);

let isCronReady = false;

async function initCronAuth() {
  try {
    try {
      await signInWithEmailAndPassword(auth, "cron-system@mudarij.os", "SysAdmin!@#123lock");
    } catch (e: any) {
      if (e.code === "auth/user-not-found" || e.code === "auth/invalid-credential") {
        await createUserWithEmailAndPassword(auth, "cron-system@mudarij.os", "SysAdmin!@#123lock");
      } else {
        throw e;
      }
    }
    isCronReady = true;
    console.log("[Cron] System cron authenticated successfully.");
  } catch (e) {
    console.error("[Cron] Failed to authenticate system cron:", e);
  }
}

function startPayrollCronJob() {
  // Run every 2 minutes for testing, or 10 min usually
  setInterval(
    async () => {
      if (!isCronReady) return;
      try {
        console.log("[Cron] Running scheduled task to verify locked payroll runs...");
        const payrollRef = collection(db, "payroll_runs");
        // Use compound query in Firestore to filter only for documents where 'isLocked' is true and 'systemLockDate' is null
        const q = query(
          payrollRef,
          where("isLocked", "==", true),
          where("systemLockDate", "==", null)
        );
        const snapshot = await getDocs(q);

        let updates = 0;
        const batch = writeBatch(db);

        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data();
          batch.update(docSnapshot.ref, {
            systemLockDate: new Date().toISOString(),
            preventModifications: true,
            status: "finalized",
            systemLockState: "finalized",
            logs: [
              ...(data.logs || []),
              {
                action: "System Auto-Lock",
                timestamp: new Date().toISOString(),
                note: "Automatically locked by system after WPA/WPS submission or manual toggle.",
              },
            ],
          });

          // Add system alert
          const alertRef = doc(collection(db, "system_alerts"));
          batch.set(alertRef, {
            userId: data.userId,
            title: "إنذار: إقفال طارئ",
            message: `تم تفعيل الإقفال الآلي لمسير رواتب ${data.period || "قيد الإجراء"}. يرجى المراجعة.`,
            type: "emergency_lockdown",
            runId: docSnapshot.id,
            createdAt: new Date().toISOString(),
            isRead: false,
          });

          updates++;
        });

        if (updates > 0) {
          await batch.commit();
          console.log(`[Cron] Successfully locked ${updates} payroll runs.`);
        }
      } catch (err) {
        console.error("[Cron] Failed to run payroll lock checking job:", err);
      }
    },
    10 * 60 * 1000
  ); // 10 minutes
}

async function start() {
  try {
    await initCronAuth();
    const app = await createApp();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Mudarij OS running on http://localhost:${PORT}`);
      startPayrollCronJob();
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
