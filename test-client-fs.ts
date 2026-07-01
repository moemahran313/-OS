import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, getDocs, limit, query } from "firebase/firestore";
import fs from "fs";
const config = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf8"));
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app, config.firestoreDatabaseId);

async function run() {
  try {
    let user;
    try {
      user = await signInWithEmailAndPassword(auth, "system@mudarij.os", "systempassword123");
    } catch (e) {
      user = await createUserWithEmailAndPassword(auth, "system@mudarij.os", "systempassword123");
    }
    console.log("Logged in:", user.user.uid);
    const snap = await getDocs(query(collection(db, "payroll_runs"), limit(1)));
    console.log("Found:", snap.size);
  } catch (e) {
    console.log("Error:", e);
  }
}
run();
