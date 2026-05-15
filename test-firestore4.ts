import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import path from 'path';
import fs from 'fs';
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

addDoc(collection(db, "test"), { msg: "from client sdk" })
  .then(doc => console.log('success', doc.id))
  .catch(err => console.error('fail', err));
