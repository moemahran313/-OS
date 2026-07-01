import { db } from "./server/services/firebase.js";
async function run() {
  try {
    const doc = await db.collection("payroll_runs").limit(1).get();
    console.log("Success:", doc.size);
  } catch (err) {
    console.log("Error limit 1:", err);
  }
}
run();
