import fetch from "node-fetch";

const databaseId = "ai-studio-2de0c09a-34d2-4c2c-988b-3b6c1326a68d";
const projectId = "gen-lang-client-0463538779";
const collectionId = "audit_logs";

const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${databaseId}/documents/${collectionId}`;
console.log(url);
