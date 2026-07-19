import { EventEmitter } from "events";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const eventEmitter = new EventEmitter();

// Define Event Types
export const ShipmentEvents = {
  CREATED: "shipment.created",
  UPDATED: "shipment.updated",
  ARRIVED: "shipment.arrived",
  DEPARTED: "shipment.departed",
  TRANSIT: "shipment.transit",
  DOC_MISSING: "document.missing",
  COMPLIANCE_FAILED: "compliance.failed",
} as const;

export type ShipmentEvents = typeof ShipmentEvents[keyof typeof ShipmentEvents];

interface EventPayload {
  shipmentId: string;
  description: string;
  metadata?: any;
}

// Persist events to DB and emit for any listeners
export const emitShipmentEvent = async (type: ShipmentEvents, payload: EventPayload) => {
  try {
    await prisma.shipmentEvent.create({
      data: {
        shipmentId: payload.shipmentId,
        type,
        description: payload.description,
        metadata: payload.metadata ? JSON.stringify(payload.metadata) : null,
      },
    });

    eventEmitter.emit(type, payload);
    console.log(`[EventSystem] Emitted ${type} for shipment ${payload.shipmentId}`);
  } catch (err) {
    console.error(`[EventSystem] Failed to persist event ${type}:`, err);
  }
};

export default eventEmitter;
