import { prisma } from "./prisma.ts";
import { db } from "./firebase.ts";

let isProcessing = false;

export function startOutboxWorker() {
  console.log("[Outbox Worker] Starting transactional outbox sync worker...");
  setInterval(async () => {
    if (isProcessing) return;
    isProcessing = true;
    try {
      await processOutboxEvents();
    } catch (err) {
      console.error("[Outbox Worker] Error in outbox loop:", err);
    } finally {
      isProcessing = false;
    }
  }, 5000); // Poll every 5 seconds
}

async function processOutboxEvents() {
  // Find all PENDING or retryable outbox events
  const pendingEvents = await prisma.outbox.findMany({
    where: {
      status: { in: ["PENDING", "FAILED"] },
      attempts: { lt: 5 },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  if (pendingEvents.length === 0) return;

  console.log(`[Outbox Worker] Found ${pendingEvents.length} outbox events to process.`);

  for (const event of pendingEvents) {
    try {
      const payload = JSON.parse(event.payload);
      const collectionName = getCollectionName(event.aggregateType);

      if (collectionName) {
        if (event.eventType === "Deleted") {
          await db.collection(collectionName).doc(event.aggregateId).delete();
        } else {
          // Created or Updated - write to Firestore
          await db.collection(collectionName).doc(event.aggregateId).set(payload, { merge: true });
        }
      }

      // Mark as PROCESSED
      await prisma.outbox.update({
        where: { id: event.id },
        data: {
          status: "PROCESSED",
          attempts: event.attempts + 1,
          updatedAt: new Date(),
        },
      });
    } catch (err: any) {
      console.error(`[Outbox Worker] Failed to sync outbox event ${event.id}:`, err);
      await prisma.outbox.update({
        where: { id: event.id },
        data: {
          status: "FAILED",
          attempts: event.attempts + 1,
          lastError: err?.message || String(err),
          updatedAt: new Date(),
        },
      });
    }
  }
}

function getCollectionName(aggregateType: string): string | null {
  const mapping: Record<string, string> = {
    "User": "users",
    "Employee": "employees",
    "AuditLog": "audit_logs",
    "Shipment": "shipments",
    "Lead": "leads",
    "Business": "businesses",
    "EnrichmentLog": "enrichment_logs",
    "Notification": "notifications",
    "Comment": "comments",
    "Document": "documents",
    "SearchJob": "search_jobs",
    "DeduplicationAuditLog": "deduplication_logs",
  };
  return mapping[aggregateType] || null;
}
