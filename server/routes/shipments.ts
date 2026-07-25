import { Router } from "express";
import { prisma } from "../services/prisma.ts";
import { logAudit } from "../services/utils.ts";
import { authenticate } from "../middleware/auth.ts";
import { carrierService } from "../../src/services/carrierService.ts";
import { complianceService } from "../../src/services/complianceService.ts";
import { emitShipmentEvent, ShipmentEvents } from "../../src/services/eventService.ts";

const router = Router();

router.get("/", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const tenantId = user?.tenantId || "default_tenant";

    const shipments = await prisma.shipment.findMany({
      where: { tenantId },
      include: {
        broker: true,
        documents: true,
        comments: true,
        client: true,
        events: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(shipments);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const tenantId = user?.tenantId || "default_tenant";

    const {
      supplierName,
      productDescription,
      countryOfOrigin,
      carrier,
      brokerId,
      originPort,
      destinationPort,
      alias,
      estimatedDeliveryDate,
      clientId,
    } = req.body;

    const shipment = await prisma.shipment.create({
      data: {
        tenantId,
        supplierName,
        productDescription,
        countryOfOrigin,
        originPort,
        destinationPort,
        carrier: carrier || "Aramex",
        trackingNumber: `ARM-${Math.random().toString(36).substring(7).toUpperCase()}`,
        brokerId,
        alias,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : null,
        clientId,
        status: "planned",
        statusHistory: JSON.stringify(["planned"]),
      },
    });

    await emitShipmentEvent(ShipmentEvents.CREATED, {
      shipmentId: shipment.id,
      description: `Shipment created for ${supplierName}`,
    });

    logAudit(
      "IMPORT",
      { action: "Create Enterprise Shipment", id: shipment.id },
      { success: true },
      req
    );
    res.status(201).json(shipment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/track", authenticate, async (req: any, res) => {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: req.params.id },
      include: { events: true },
    });
    if (!shipment || !shipment.carrier) throw new Error("Shipment or carrier not found");

    const adapter = carrierService.getAdapter(shipment.carrier);
    const trackingInfo = await adapter.trackShipment(shipment.trackingNumber || "DEMO_TRACKING");

    let newStatus = shipment.status;
    const inTransitStatuses = [
      "SHIPPED",
      "IN_TRANSIT",
      "OUT_FOR_DELIVERY",
      "PICKED_UP",
      "TRANSIT",
      "ARRIVED_AT_FACILITY",
    ];

    if (trackingInfo.status === "DELIVERED") {
      newStatus = "cleared";
    } else if (inTransitStatuses.includes(trackingInfo.status)) {
      if (["planned", "documents_ready"].includes(shipment.status)) {
        newStatus = "in_transit";
      }
    }

    if (newStatus !== shipment.status) {
      await prisma.shipment.update({
        where: { id: shipment.id },
        data: {
          status: newStatus,
          estimatedDeliveryDate: trackingInfo.estimatedDelivery
            ? new Date(trackingInfo.estimatedDelivery)
            : shipment.estimatedDeliveryDate,
        },
      });

      const eventType =
        newStatus === "cleared"
          ? ShipmentEvents.ARRIVED
          : newStatus === "in_transit"
            ? ShipmentEvents.TRANSIT
            : ShipmentEvents.UPDATED;

      await emitShipmentEvent(eventType, {
        shipmentId: shipment.id,
        description: `تحديث من الناقل (${shipment.carrier}): ${trackingInfo.status}. تم تحويل حالة النظام إلى: ${newStatus}`,
        metadata: JSON.stringify({
          carrierStatus: trackingInfo.status,
          location: trackingInfo.location,
        }),
      });
    }

    res.json(trackingInfo);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id/compliance-report", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const tenantId = user?.tenantId || "default_tenant";

    const report = await complianceService.evaluateShipment(req.params.id, tenantId);
    res.json(report);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", authenticate, async (req: any, res) => {
  try {
    const {
      status,
      brokerId,
      alias,
      estimatedDeliveryDate,
      clientId,
      supplierName,
      productDescription,
      countryOfOrigin,
      originPort,
      destinationPort,
      carrier,
    } = req.body;
    const existing = await prisma.shipment.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Shipment not found" });

    const currentHistory = existing.statusHistory ? JSON.parse(existing.statusHistory) : [];
    const newHistory =
      status && !currentHistory.includes(status) ? [...currentHistory, status] : currentHistory;

    const shipment = await prisma.shipment.update({
      where: { id: req.params.id },
      data: {
        status,
        brokerId,
        alias,
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : undefined,
        clientId,
        supplierName,
        productDescription,
        countryOfOrigin,
        originPort,
        destinationPort,
        carrier,
        statusHistory: JSON.stringify(newHistory),
      },
    });

    if (status && status !== existing.status) {
      let description = `Shipment status updated to ${status}`;
      if (status === "documents_ready") {
        description = "Shipment status updated to 'documents_ready'. Compliance check initiated.";
      }

      await emitShipmentEvent(ShipmentEvents.UPDATED, {
        shipmentId: shipment.id,
        description,
        metadata: { oldStatus: existing.status, newStatus: status },
      });
    }

    res.json(shipment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/comments", authenticate, async (req: any, res) => {
  try {
    const { text, authorName } = req.body;
    const comment = await prisma.comment.create({
      data: {
        shipmentId: req.params.id,
        text,
        authorName: authorName || "System",
      },
    });
    res.status(201).json(comment);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/:id/documents", authenticate, async (req: any, res) => {
  try {
    const { documentType, fileUrl, validationStatus } = req.body;
    const document = await prisma.document.create({
      data: {
        shipmentId: req.params.id,
        documentType,
        fileUrl,
        validationStatus: validationStatus || "pending",
      },
    });
    res.status(201).json(document);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/webhooks/carrier-update", async (req, res) => {
  const { trackingNumber, status, carrier } = req.body;

  const shipment = await prisma.shipment.findFirst({
    where: { trackingNumber, carrier },
  });

  if (shipment) {
    await emitShipmentEvent(ShipmentEvents.UPDATED, {
      shipmentId: shipment.id,
      description: `Auto-update from carrier: ${status}`,
      metadata: { status },
    });
  }

  res.json({ received: true });
});

router.post("/:id/notify-whatsapp-broker", authenticate, async (req: any, res) => {
  try {
    const { documentName } = req.body;
    const shipmentId = req.params.id;

    // Webhook simulation for sending Whatsapp messages via API to the broker
    console.log(
      `[WHATSAPP WEBHOOK] Sending message to broker for shipment ${shipmentId} related to missing/expiring document: ${documentName}`
    );

    await emitShipmentEvent(ShipmentEvents.UPDATED, {
      shipmentId,
      description: `تم إرسال تنبيه آلي للمخلص عبر واتساب بخصوص: ${documentName}`,
    });

    res.json({ success: true, message: "تم إرسال رسالة واتساب بنجاح." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Fasah (فسح) Customs Clearance & Tariff Duty API
router.post("/fasah/calculate-duty", authenticate, async (req: any, res) => {
  try {
    const { cifValue = 0, hsCode = "8471.30", countryOfOrigin = "CN" } = req.body;
    const numCif = Number(cifValue) || 0;

    // HS Code tariff rate lookup
    let dutyRatePercent = 5.0; // Default Saudi Customs Tariff rate
    if (["8471.30", "8517.62"].includes(hsCode)) {
      dutyRatePercent = 5.0; // IT equipment
    } else if (["3926.90"].includes(hsCode)) {
      dutyRatePercent = 12.0; // Plastics
    } else if (["0401.10", "1001.19"].includes(hsCode) || countryOfOrigin === "SA" || countryOfOrigin === "AE") {
      dutyRatePercent = 0.0; // Exempt / GCC Trade
    }

    const customsDutySAR = Math.round((numCif * (dutyRatePercent / 100)) * 100) / 100;
    const vatBaseSAR = numCif + customsDutySAR;
    const importVatSAR = Math.round((vatBaseSAR * 0.15) * 100) / 100; // 15% Import VAT
    const fasahFeeSAR = 120.0; // Fixed Fasah Platform Fee
    const totalCustomsPayableSAR = Math.round((customsDutySAR + importVatSAR + fasahFeeSAR) * 100) / 100;

    res.json({
      hsCode,
      countryOfOrigin,
      cifValueSAR: numCif,
      dutyRatePercent,
      customsDutySAR,
      importVatSAR,
      fasahFeeSAR,
      totalCustomsPayableSAR,
      calculatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/fasah/submit-declaration", authenticate, async (req: any, res) => {
  try {
    const { shipmentId, hsCode, cifValue, customsPort = "ميناء الملك عبد العزيز - الدمام", description } = req.body;

    const declarationNo = `FSH-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const numCif = Number(cifValue) || 15000;
    const dutyRatePercent = 5.0;
    const customsDutySAR = Math.round(numCif * 0.05 * 100) / 100;
    const importVatSAR = Math.round((numCif + customsDutySAR) * 0.15 * 100) / 100;
    const totalPayableSAR = customsDutySAR + importVatSAR + 120;

    if (shipmentId) {
      await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          status: "cleared",
          statusHistory: JSON.stringify(["planned", "in_transit", "customs_cleared", "cleared"]),
        },
      });

      await emitShipmentEvent(ShipmentEvents.UPDATED, {
        shipmentId,
        description: `تم إفساح الشحنة رسمياً عبر منصة فسح (رقم البيان الجمركي: ${declarationNo})`,
        metadata: { declarationNo, totalPayableSAR },
      });
    }

    logAudit(
      "IMPORT",
      { action: "Fasah Customs Clearance Filed", declarationNo, shipmentId },
      { success: true },
      req
    );

    res.status(201).json({
      success: true,
      declarationNo,
      customsPort,
      status: "CLEARED_AUTOMATED",
      hsCode,
      cifValueSAR: numCif,
      customsDutySAR,
      importVatSAR,
      fasahFeeSAR: 120,
      totalPayableSAR,
      clearanceDate: new Date().toISOString(),
      qrVerificationUrl: `https://fasah.sa/verify/${declarationNo}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/fasah/declaration/:declarationNo", authenticate, async (req: any, res) => {
  try {
    const declarationNo = req.params.declarationNo;
    res.json({
      declarationNo,
      status: "APPROVED_CLEARED",
      customsAuthority: "هيئة الزكاة والضريبة والجمارك (ZATCA Customs Portal)",
      port: "ميناء جدة الإسلامي",
      vatStatus: "15% Import VAT Paid",
      dutiesPaidSAR: 750.00,
      importVatPaidSAR: 2362.50,
      clearedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
