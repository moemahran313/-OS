import { getFirestore } from 'firebase-admin/firestore';
import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = admin.initializeApp({ projectId: config.projectId });
const db = getFirestore(app);
db.collection("test").add({ msg: "hello default" }).then(doc => console.log(doc.id)).catch(err => console.error(err));
