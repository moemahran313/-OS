import admin from 'firebase-admin';
import path from 'path';
import fs from 'fs';

// Read config to get databaseId
const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

let app: admin.app.App;

export function getFirebaseAdmin() {
  if (admin.apps.length === 0) {
    app = admin.initializeApp({
      projectId: config.projectId || process.env.FIREBASE_PROJECT_ID
    });
  } else {
    app = admin.apps[0]!;
  }
  return app;
}

import { getFirestore } from 'firebase-admin/firestore';
export const auth = getFirebaseAdmin().auth();
export const db = getFirestore(getFirebaseAdmin(), config.firestoreDatabaseId);
