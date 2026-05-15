import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
const app = admin.initializeApp({ projectId: "demo" });
const db = getFirestore(app, "mydb");
console.log(db);
