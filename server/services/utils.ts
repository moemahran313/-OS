import path from "path";
import fs from "fs";

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
let config: any = {};
try {
  config = JSON.parse(fs.readFileSync(configPath, "utf8"));
} catch (e) {
  console.error("Could not read firebase-applet-config.json");
}

export const scrubPII = (data: any) => {
  const sensitiveFields = [
    "email",
    "phone",
    "clientEmail",
    "clientPhone",
    "password",
    "passwordHash",
    "iban",
  ];
  const scrubbed = { ...data };
  for (const field of sensitiveFields) {
    if (scrubbed[field]) scrubbed[field] = "***";
  }
  return scrubbed;
};

export const logAudit = async (module: string, payload: any, result: any, req: any) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.headers["x-user-id"];
    const token = req.cookies?.mudarij_token || req.headers?.authorization?.split(" ")[1];
    if (!token || !config.projectId || !config.firestoreDatabaseId) return;

    const url = `https://firestore.googleapis.com/v1/projects/${config.projectId}/databases/${config.firestoreDatabaseId}/documents/audit_logs`;

    // Convert to Firestore REST API document format
    const docData = {
      fields: {
        userId: { stringValue: userId || "" },
        module: { stringValue: module || "SYSTEM" },
        action: { stringValue: payload.action || "Unknown" },
        payload: { stringValue: JSON.stringify(scrubPII(payload)) },
        result: { stringValue: JSON.stringify(scrubPII(result)) },
        ip: { stringValue: req.ip || "" },
        timestamp: { timestampValue: new Date().toISOString() },
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(docData),
    });

    if (!res.ok) {
      console.error("Firestore REST API Error:", await res.text());
    }
  } catch (err) {
    console.error("Failed to log audit:", err);
  }
};

export async function generateContentWithRetry(
  aiClient: any,
  params: {
    model: string;
    contents: any;
    config?: any;
  },
  maxRetries = 3,
  delayMs = 1500
): Promise<any> {
  let attempt = 0;
  while (true) {
    try {
      return await aiClient.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const isUnavailable =
        err?.message?.includes("503") ||
        err?.message?.includes("UNAVAILABLE") ||
        err?.status === "UNAVAILABLE" ||
        err?.code === 503 ||
        String(err).includes("UNAVAILABLE") ||
        String(err).includes("503") ||
        String(err).includes("high demand");

      if (isUnavailable && attempt <= maxRetries) {
        const backoff = delayMs * Math.pow(2, attempt - 1);
        console.warn(
          `[Gemini API] 503/UNAVAILABLE detected on attempt ${attempt}. Retrying in ${backoff}ms...`
        );
        await new Promise((resolve) => setTimeout(resolve, backoff));
        continue;
      }
      throw err;
    }
  }
}
