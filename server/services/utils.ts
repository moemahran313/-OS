import path from "path";
import fs from "fs";
import crypto from "crypto";
import { prisma } from "./prisma.ts";
import { enqueueOutboxEvent } from "./outbox.ts";

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
    const userId = req?.user?.uid || req?.user?.id || req?.headers["x-user-id"];
    const token = req?.cookies?.mudarij_token || req?.headers?.authorization?.split(" ")[1];
    const ip = req?.ip || "";
    const timestampStr = new Date().toISOString();

    const cleanPayload = scrubPII(payload || {});
    const cleanResult = scrubPII(result || {});

    let payloadStr = "{}";
    try {
      payloadStr = JSON.stringify(cleanPayload);
    } catch (e) {
      console.warn("Failed to stringify cleanPayload in logAudit:", e);
    }

    let resultStr = "{}";
    try {
      resultStr = JSON.stringify(cleanResult);
    } catch (e) {
      console.warn("Failed to stringify cleanResult in logAudit:", e);
    }

    // Create an immutable regulatory SHA-256 action hash
    const actionHash = crypto
      .createHash("sha256")
      .update(
        JSON.stringify({
          userId: String(userId || ""),
          module: String(module || "SYSTEM"),
          action: payload?.action ? String(payload.action) : "Unknown",
          payload: payloadStr,
          result: resultStr,
          timestamp: timestampStr,
        })
      )
      .digest("hex");

    // Embed action hash inside result
    const enrichedResult = { ...cleanResult, actionHash };
    let enrichedResultStr = "{}";
    try {
      enrichedResultStr = JSON.stringify(enrichedResult);
    } catch (e) {
      console.warn("Failed to stringify enrichedResult in logAudit:", e);
    }

    // 1. Write to PostgreSQL and enqueue Outbox event atomically in a transaction
    try {
      await prisma.$transaction(async (tx) => {
        let prismaUserId: string | null = null;
        if (userId && typeof userId === "string") {
          try {
            const userExists = await tx.user.findUnique({ where: { id: userId } });
            if (userExists) {
              prismaUserId = userId;
            }
          } catch (userErr) {
            console.warn("Prisma user look up failed in logAudit:", userErr);
          }
        }

        const auditRecord = await tx.auditLog.create({
          data: {
            userId: prismaUserId,
            module: String(module || "SYSTEM"),
            action: payload?.action ? String(payload.action) : "Unknown",
            payload: payloadStr,
            result: enrichedResultStr,
            timestamp: new Date(timestampStr),
            ip: ip ? String(ip) : "",
          },
        });

        // Atomic Transactional Outbox Pattern:
        // Write the "Cloud Sync" instruction as part of the same transaction
        await enqueueOutboxEvent(tx, "AuditLog", auditRecord.id, "Created", {
          userId: userId || "",
          module: String(module || "SYSTEM"),
          action: payload?.action || "Unknown",
          payload: payloadStr,
          result: enrichedResultStr,
          ip: ip ? String(ip) : "",
          timestamp: timestampStr,
        });
      });
    } catch (prismaErr) {
      console.warn("Prisma audit logging and transactional outbox failed:", prismaErr);
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
