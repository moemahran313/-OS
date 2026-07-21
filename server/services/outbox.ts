import { prisma } from "./prisma.ts";

export async function enqueueOutboxEvent(
  tx: any,
  aggregateType: string,
  aggregateId: string,
  eventType: string,
  payload: any
) {
  try {
    return await tx.outbox.create({
      data: {
        aggregateType,
        aggregateId,
        eventType,
        payload: JSON.stringify(payload),
        status: "PENDING",
      },
    });
  } catch (err) {
    console.error(`[Outbox Service] Failed to enqueue event for ${aggregateType}:${aggregateId}:`, err);
    throw err;
  }
}
