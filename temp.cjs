var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if ((from && typeof from === "object") || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable,
        });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (
  (target = mod != null ? __create(__getProtoOf(mod)) : {}),
  __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule
      ? __defProp(target, "default", { value: mod, enumerable: true })
      : target,
    mod
  )
);

// server/app.ts
var import_express16 = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_url = require("url");
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_vite = require("vite");

// server/routes/auth.ts
var import_express = require("express");

// server/services/firebase.ts
var import_firebase_admin = __toESM(require("firebase-admin"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_firestore = require("firebase-admin/firestore");
var configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
var config = JSON.parse(import_fs.default.readFileSync(configPath, "utf8"));
var app;
function getFirebaseAdmin() {
  if (import_firebase_admin.default.apps.length === 0) {
    app = import_firebase_admin.default.initializeApp({
      projectId: config.projectId || process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    app = import_firebase_admin.default.apps[0];
  }
  return app;
}
var auth = getFirebaseAdmin().auth();
var db = (0, import_firestore.getFirestore)(getFirebaseAdmin(), config.firestoreDatabaseId);

// server/middleware/auth.ts
var authenticate = async (req, res, next) => {
  const token = req.cookies.mudarij_token || req.headers.authorization?.split(" ")[1];
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Access denied. No token provided or invalid token." });
  }
  try {
    const tokenParts = token.split(".");
    if (tokenParts.length !== 3) {
      console.warn("Invalid token format received");
      return res.status(401).json({ error: "Invalid token format" });
    }
    try {
      const header = JSON.parse(Buffer.from(tokenParts[0], "base64").toString());
      console.log("DEBUG: Verifying token with Project ID:", auth.app.options.projectId);
      if (!header.kid) {
        console.error("DEBUG: Token header missing 'kid'. Header:", header);
      }
    } catch (e) {}
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: decodedToken.role || "Administrator",
    };
    next();
  } catch (err) {
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
        const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
        console.error("Failing Token Header:", header);
        console.error("Failing Token Payload (subset):", {
          iss: payload.iss,
          aud: payload.aud,
          sub: payload.sub,
          project_id: payload.firebase?.project_id,
        });
      }
    } catch (e) {
      console.error("Could not parse failing token header/payload");
    }
    if (err.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("Firebase auth error details:", {
      code: err.code,
      message: err.message,
      tokenPreview: token.substring(0, 20) + "...",
      stack: err.stack,
    });
    res.status(401).json({ error: "Invalid token" });
  }
};

// server/routes/auth.ts
var router = (0, import_express.Router)();
router.get("/me", authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.id).get();
    if (!userDoc.exists)
      return res.status(404).json({ error: "User profile not found in Firestore" });
    res.json({ id: req.user.id, ...userDoc.data() });
  } catch (err) {
    console.error("Fetch me error:", err);
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
});
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ success: true });
});
var auth_default = router;

// server/routes/shipments.ts
var import_express2 = require("express");

// server/services/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient();

// server/services/utils.ts
var import_path2 = __toESM(require("path"), 1);
var import_fs2 = __toESM(require("fs"), 1);
var configPath2 = import_path2.default.join(process.cwd(), "firebase-applet-config.json");
var config2 = {};
try {
  config2 = JSON.parse(import_fs2.default.readFileSync(configPath2, "utf8"));
} catch (e) {
  console.error("Could not read firebase-applet-config.json");
}
var scrubPII = (data) => {
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
var logAudit = async (module2, payload, result, req) => {
  try {
    const userId = req.user?.uid || req.user?.id || req.headers["x-user-id"];
    const token = req.cookies?.mudarij_token || req.headers?.authorization?.split(" ")[1];
    if (!token || !config2.projectId || !config2.firestoreDatabaseId) return;
    const url = `https://firestore.googleapis.com/v1/projects/${config2.projectId}/databases/${config2.firestoreDatabaseId}/documents/audit_logs`;
    const docData = {
      fields: {
        userId: { stringValue: userId || "" },
        module: { stringValue: module2 || "SYSTEM" },
        action: { stringValue: payload.action || "Unknown" },
        payload: { stringValue: JSON.stringify(scrubPII(payload)) },
        result: { stringValue: JSON.stringify(scrubPII(result)) },
        ip: { stringValue: req.ip || "" },
        timestamp: { timestampValue: /* @__PURE__ */ new Date().toISOString() },
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

// src/services/carrierService.ts
var AramexAdapter = class {
  constructor(config3) {
    this.providerName = "Aramex";
    this.apiKey = config3.apiKey || "demo_aramex_key";
  }
  async createShipment(details) {
    console.log(`[Aramex] Creating shipment for ${details.supplierName} using key ${this.apiKey}`);
    return {
      success: true,
      trackingNumber: `ARM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: "https://aramex.com/labels/demo-label.pdf",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3).toISOString(),
    };
  }
  async trackShipment(trackingNumber) {
    console.log(`[Aramex] Tracking ${trackingNumber}`);
    const statuses = ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      trackingNumber,
      status,
      location: "Riyadh Distribution Center",
      lastUpdate: /* @__PURE__ */ new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toLocaleDateString(),
      events: [
        {
          status: "\u0623\u0645\u0631 \u0634\u062D\u0646 \u0645\u0624\u0643\u062F",
          location:
            "\u0645\u0635\u0646\u0639 \u0627\u0644\u0645\u0648\u0631\u062F (\u0627\u0644\u0635\u064A\u0646)",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1e3).toISOString(),
        },
        {
          status:
            "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0627\u0644\u0634\u062D\u0646\u0629 \u0641\u064A \u0627\u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0644\u0648\u062C\u0633\u062A\u064A",
          location: "Shenzhen Port",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1e3).toISOString(),
        },
        {
          status: "\u063A\u0627\u062F\u0631\u062A \u0627\u0644\u0645\u064A\u0646\u0627\u0621",
          location: "South China Sea",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
        },
        {
          status,
          location:
            "\u0645\u0631\u0643\u0632 \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0631\u064A\u0627\u0636",
          timestamp: /* @__PURE__ */ new Date().toISOString(),
        },
      ],
    };
  }
  async getRates(origin, destination, weight) {
    return [
      { service: "Ground", price: 45, currency: "SAR", days: 5 },
      { service: "Express", price: 120, currency: "SAR", days: 2 },
    ];
  }
};
var DhlAdapter = class {
  constructor(config3) {
    this.providerName = "DHL";
    this.apiKey = config3.apiKey || "demo_dhl_key";
  }
  async createShipment(details) {
    console.log(`[DHL] Creating shipment for ${details.supplierName}`);
    return {
      success: true,
      trackingNumber: `DHL-${Math.random().toString(10).substring(2, 12)}`,
      labelUrl: "https://dhl.com/labels/demo-label.pdf",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
    };
  }
  async trackShipment(trackingNumber) {
    console.log(`[DHL] Tracking ${trackingNumber}`);
    const statuses = ["PICKED_UP", "TRANSIT", "ARRIVED_AT_FACILITY", "DELIVERED"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
      trackingNumber,
      status,
      location: "Leipzig Hub, Germany",
      lastUpdate: /* @__PURE__ */ new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toLocaleDateString(),
      events: [
        {
          status: "Shipment Picked Up",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1e3).toISOString(),
        },
        {
          status: "Processed at Hong Kong",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1e3).toISOString(),
        },
        {
          status: "Departed from Facility",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1e3).toISOString(),
        },
        { status, location: "Leipzig Hub", timestamp: /* @__PURE__ */ new Date().toISOString() },
      ],
    };
  }
  async getRates(origin, destination, weight) {
    return [
      { service: "Express Worldwide", price: 15, currency: "USD", days: 3 },
      { service: "Express 12:00", price: 185, currency: "USD", days: 1 },
    ];
  }
};
var CarrierService = class {
  constructor() {
    this.adapters = /* @__PURE__ */ new Map();
    this.registerAdapter(new AramexAdapter({}));
    this.registerAdapter(new DhlAdapter({}));
  }
  registerAdapter(adapter) {
    this.adapters.set(adapter.providerName.toLowerCase(), adapter);
  }
  getAdapter(provider) {
    const adapter = this.adapters.get(provider.toLowerCase());
    if (!adapter) throw new Error(`Carrier ${provider} not supported`);
    return adapter;
  }
};
var carrierService = new CarrierService();

// src/services/complianceService.ts
var import_client2 = require("@prisma/client");
var prisma2 = new import_client2.PrismaClient();
var ComplianceService = class {
  async evaluateShipment(shipmentId, tenantId) {
    const shipment = await prisma2.shipment.findUnique({
      where: { id: shipmentId },
      include: { documents: true },
    });
    if (!shipment) throw new Error("Shipment not found");
    const rules = await prisma2.complianceRule.findMany({
      where: { tenantId },
    });
    const desc = shipment.productDescription.toLowerCase();
    let requirements = ["Commercial Invoice", "Packing List", "Bill of Lading"];
    let riskFlags = [];
    let missingDocs = [];
    for (const rule of rules) {
      if (desc.includes(rule.keyword.toLowerCase())) {
        requirements.push(rule.requiredDoc);
        if (rule.riskLevel === "high")
          riskFlags.push(`Critical: ${rule.requiredDoc} required for ${rule.keyword}`);
      }
    }
    const uploadedTypes = shipment.documents.map((d) => d.documentType);
    for (const req of requirements) {
      if (!uploadedTypes.includes(req)) {
        missingDocs.push(req);
      }
    }
    return {
      requirements,
      riskFlags,
      missingDocs,
      isCompliant: missingDocs.length === 0,
    };
  }
};
var complianceService = new ComplianceService();

// src/services/eventService.ts
var import_events = require("events");
var import_client3 = require("@prisma/client");
var prisma3 = new import_client3.PrismaClient();
var eventEmitter = new import_events.EventEmitter();
var emitShipmentEvent = async (type, payload) => {
  try {
    await prisma3.shipmentEvent.create({
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

// server/routes/shipments.ts
var router2 = (0, import_express2.Router)();
router2.get("/", authenticate, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.post("/", authenticate, async (req, res) => {
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
    await emitShipmentEvent("shipment.created" /* CREATED */, {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.post("/:id/track", authenticate, async (req, res) => {
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
          ? "shipment.arrived" /* ARRIVED */
          : newStatus === "in_transit"
            ? "shipment.transit" /* TRANSIT */
            : "shipment.updated"; /* UPDATED */
      await emitShipmentEvent(eventType, {
        shipmentId: shipment.id,
        description: `\u062A\u062D\u062F\u064A\u062B \u0645\u0646 \u0627\u0644\u0646\u0627\u0642\u0644 (${shipment.carrier}): ${trackingInfo.status}. \u062A\u0645 \u062A\u062D\u0648\u064A\u0644 \u062D\u0627\u0644\u0629 \u0627\u0644\u0646\u0638\u0627\u0645 \u0625\u0644\u0649: ${newStatus}`,
        metadata: JSON.stringify({
          carrierStatus: trackingInfo.status,
          location: trackingInfo.location,
        }),
      });
    }
    res.json(trackingInfo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.get("/:id/compliance-report", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const tenantId = user?.tenantId || "default_tenant";
    const report = await complianceService.evaluateShipment(req.params.id, tenantId);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.put("/:id", authenticate, async (req, res) => {
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
        estimatedDeliveryDate: estimatedDeliveryDate ? new Date(estimatedDeliveryDate) : void 0,
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
      await emitShipmentEvent("shipment.updated" /* UPDATED */, {
        shipmentId: shipment.id,
        description,
        metadata: { oldStatus: existing.status, newStatus: status },
      });
    }
    res.json(shipment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.post("/:id/comments", authenticate, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.post("/:id/documents", authenticate, async (req, res) => {
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
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router2.post("/webhooks/carrier-update", async (req, res) => {
  const { trackingNumber, status, carrier } = req.body;
  const shipment = await prisma.shipment.findFirst({
    where: { trackingNumber, carrier },
  });
  if (shipment) {
    await emitShipmentEvent("shipment.updated" /* UPDATED */, {
      shipmentId: shipment.id,
      description: `Auto-update from carrier: ${status}`,
      metadata: { status },
    });
  }
  res.json({ received: true });
});
var shipments_default = router2;

// server/routes/leads.ts
var import_express3 = require("express");

// server/services/webhooks.ts
var executeWebhooks = async (userId, eventType, payload) => {
  try {
    const snap = await db.collection("settings").doc(userId).get();
    if (!snap.exists) return;
    const settings = snap.data();
    if (eventType === "lead.created" && settings?.zapierWebhookNewLead) {
      fetch(settings.zapierWebhookNewLead, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Zapier webhook failed", err));
    }
    if (eventType === "invoice.paid" && settings?.zapierWebhookInvoicePaid) {
      fetch(settings.zapierWebhookInvoicePaid, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch((err) => console.error("Zapier webhook failed", err));
    }
    if (settings?.slackWebhookUrl) {
      let slackMessage = "";
      if (eventType === "lead.created") {
        slackMessage = `:tada: *New Lead Created!*
*Name:* ${payload.name}
*Company:* ${payload.company}
*Value:* SAR ${payload.value}`;
      } else if (eventType === "invoice.paid") {
        slackMessage = `:moneybag: *Invoice Paid!*
*Invoice #:* ${payload.invoiceNumber}
*Client:* ${payload.clientName}
*Amount:* ${payload.total}`;
      } else if (eventType === "invoice.overdue") {
        slackMessage = `:warning: *Invoice Overdue!*
*Invoice #:* ${payload.invoiceNumber}
*Client:* ${payload.clientName}
*Due Date:* ${payload.dueDate}`;
      }
      if (slackMessage) {
        fetch(settings.slackWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: slackMessage }),
        }).catch((err) => console.error("Slack webhook failed", err));
      }
    }
  } catch (error) {
    console.error("Execute Webhooks Error:", error);
  }
};

// server/routes/leads.ts
var router3 = (0, import_express3.Router)();
router3.get("/", authenticate, async (req, res) => {
  try {
    const snap = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const leads = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(leads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router3.put("/reorder", authenticate, async (req, res) => {
  const items = req.body;
  if (Array.isArray(items)) {
    try {
      const batch = db.batch();
      for (const item of items) {
        const docRef = db.collection("leads").doc(item.id);
        const updateData = {};
        if (item.status) updateData.status = item.status;
        if (item.order !== void 0) updateData.order = item.order;
        if (item.history) updateData.history = item.history;
        batch.update(docRef, updateData);
      }
      await batch.commit();
      res.sendStatus(200);
    } catch (err) {
      res.status(500).json({ error: "Reorder failed" });
    }
  } else {
    res.sendStatus(400);
  }
});
router3.post("/", authenticate, async (req, res) => {
  try {
    const { value, ...rest } = req.body;
    const leadData = {
      ...rest,
      userId: req.user.uid,
      value: value ? parseFloat(value) : 0,
      status: req.body.status || "new",
      createdAt: /* @__PURE__ */ new Date(),
    };
    const docRef = await db.collection("leads").add(leadData);
    logAudit("CRM", { action: "Create Lead", id: docRef.id }, leadData, req);
    executeWebhooks(req.user.uid, "lead.created", { id: docRef.id, ...leadData });
    res.status(201).json({ id: docRef.id, ...leadData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router3.put("/:id", authenticate, async (req, res) => {
  try {
    const { value, ...rest } = req.body;
    const updateData = { ...rest };
    if (value !== void 0) updateData.value = parseFloat(value);
    await db.collection("leads").doc(req.params.id).update(updateData);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router3.delete("/:id", authenticate, async (req, res) => {
  try {
    await db.collection("leads").doc(req.params.id).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var leads_default = router3;

// server/routes/invoices.ts
var import_express4 = require("express");
var import_puppeteer = __toESM(require("puppeteer"), 1);
var router4 = (0, import_express4.Router)();
router4.get("/", authenticate, async (req, res) => {
  try {
    const snap = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    const invoices = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});
router4.get("/:id", authenticate, async (req, res) => {
  try {
    const doc = await db.collection("invoices").doc(req.params.id).get();
    const invoice = doc.data();
    if (!invoice || invoice.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }
    res.json({ id: doc.id, ...invoice });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});
router4.post("/", authenticate, async (req, res) => {
  try {
    const {
      number,
      clientName,
      clientEmail,
      clientPhone,
      dueDate,
      currency,
      lineItems,
      subtotalHalalas,
      vatAmountHalalas,
      totalAmountHalalas,
      status,
      paymentTerms,
      notes,
      lateFee,
      branding,
      sectionOrder,
      statusConfig,
      zatcaConfig,
      billingEmail,
      numberFormat,
      recurringConfig,
    } = req.body;
    const invoiceId = `inv_${Date.now()}`;
    const host = req.get("host");
    const paymentLink = `http://${host}/pay/${invoiceId}`;
    const invoiceData = {
      userId: req.user.uid,
      number,
      clientName,
      clientEmail,
      clientPhone,
      issueDate: /* @__PURE__ */ new Date().toISOString().split("T")[0],
      dueDate,
      currency: currency || "SAR",
      lineItems: lineItems || [],
      subtotalHalalas: subtotalHalalas || 0,
      vatAmountHalalas: vatAmountHalalas || 0,
      totalAmountHalalas: totalAmountHalalas || 0,
      status: status || "draft",
      paymentLink,
      paymentTerms,
      notes,
      billingEmail,
      numberFormat,
      sectionOrder: sectionOrder || [],
      statusConfig: statusConfig || {},
      zatcaConfig: zatcaConfig || {},
      lateFeeConfig: lateFee || {},
      branding: branding || {},
      recurringConfig: recurringConfig || {},
      logs: [{ action: "Created", timestamp: /* @__PURE__ */ new Date().toISOString() }],
      isLocked: status !== "draft",
      version: 1,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date(),
    };
    const docRef = await db.collection("invoices").add(invoiceData);
    logAudit(
      "INVOICE",
      { action: "Create Invoice", invoiceId: docRef.id, number },
      { success: true },
      req
    );
    res.status(201).json({ id: docRef.id, ...invoiceData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router4.put("/:id", authenticate, async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const existing = snap.data();
    if (!existing || existing.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    if (existing.isLocked && existing.status !== "draft" && !req.body.isForceUpdate) {
      return res.status(403).json({ error: "Invoice is locked" });
    }
    const {
      lineItems,
      lateFee,
      branding,
      sectionOrder,
      statusConfig,
      zatcaConfig,
      dueDate,
      isDraftAutoSave,
      recurringConfig,
      ...rest
    } = req.body;
    const currentLogs = Array.isArray(existing.logs) ? [...existing.logs] : [];
    if (!isDraftAutoSave) {
      currentLogs.unshift({
        action: req.body.action || "Manual Update",
        timestamp: /* @__PURE__ */ new Date().toISOString(),
        note: req.body.versionNote,
        user: req.user.name || req.user.email,
      });
    }
    const updateData = {
      ...rest,
      dueDate: dueDate || existing.dueDate,
      lineItems: lineItems || existing.lineItems,
      lateFeeConfig: lateFee || existing.lateFeeConfig,
      branding: branding || existing.branding,
      recurringConfig: recurringConfig || existing.recurringConfig,
      sectionOrder: sectionOrder || existing.sectionOrder,
      statusConfig: statusConfig || existing.statusConfig,
      zatcaConfig: zatcaConfig || existing.zatcaConfig,
      logs: currentLogs.slice(0, 20),
      version: (existing.version || 1) + (isDraftAutoSave ? 0 : 1),
      updatedAt: /* @__PURE__ */ new Date(),
    };
    await docRef.update(updateData);
    res.json({ id: req.params.id, ...updateData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router4.post("/:id/payment", authenticate, async (req, res) => {
  try {
    const { amountHalalas } = req.body;
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const inv = snap.data();
    if (!inv || inv.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const newPaid = (inv.paidAmountHalalas || 0) + amountHalalas;
    const remainingBalanceHalalas = inv.totalAmountHalalas - newPaid;
    const newStatus = remainingBalanceHalalas <= 0 ? "paid" : "partially_paid";
    const currentLogs = Array.isArray(inv.logs) ? [...inv.logs] : [];
    currentLogs.unshift({
      action: `Payment Recorded: ${(amountHalalas / 100).toFixed(2)}`,
      timestamp: /* @__PURE__ */ new Date().toISOString(),
    });
    await docRef.update({
      paidAmountHalalas: newPaid,
      remainingBalanceHalalas,
      status: newStatus,
      logs: currentLogs,
    });
    logAudit(
      "FINANCE",
      { action: "Record Payment", id: req.params.id, amountHalalas },
      { success: true },
      req
    );
    if (newStatus === "paid") {
      executeWebhooks(req.user.uid, "invoice.paid", {
        invoiceNumber: inv.invoiceNumber,
        clientName: inv.clientName,
        total: (inv.totalAmountHalalas / 100).toFixed(2),
        id: req.params.id,
      });
    }
    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router4.get("/:id/pdf", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection("invoices").doc(id).get();
    const invoice = doc.data();
    if (!invoice || invoice.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }
    const browser = await import_puppeteer.default.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    const host = req.get("host") || "localhost:3000";
    const protocol = req.protocol;
    const url = `${protocol}://${host}/pay/${id}?print=true`;
    await page.goto(url, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    await browser.close();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=invoice_${invoice.number}.pdf`);
    res.send(pdf);
  } catch (error) {
    res.status(500).json({ error: "Failed to generate PDF", details: error.message });
  }
});
router4.post("/automation/run-reminders", authenticate, async (req, res) => {
  try {
    const today = /* @__PURE__ */ new Date().toISOString().split("T")[0];
    const overdueSnap = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .where("status", "not-in", ["paid", "cancelled"])
      .get();
    const results = [];
    const batch = db.batch();
    for (const doc of overdueSnap.docs) {
      const inv = doc.data();
      if (inv.dueDate && inv.dueDate < today) {
        let updatedTotal = inv.totalAmountHalalas;
        let updatedBalance = inv.remainingBalanceHalalas;
        let appliedFee = false;
        const lateFee = inv.lateFeeConfig || null;
        if (lateFee && lateFee.value) {
          let feeHalalas = 0;
          if (lateFee.type === "percentage") {
            feeHalalas = Math.round(inv.totalAmountHalalas * (lateFee.value / 100));
          } else if (lateFee.type === "fixed") {
            feeHalalas = lateFee.valueHalalas || 0;
          }
          if (feeHalalas > 0) {
            updatedTotal += feeHalalas;
            updatedBalance += feeHalalas;
            appliedFee = true;
            await logAudit(
              "INVOICE",
              { action: "Applied Late Fee", invoiceId: doc.id, amount: feeHalalas / 100 },
              { success: true },
              req
            );
          }
        }
        if (appliedFee) {
          batch.update(doc.ref, {
            totalAmountHalalas: updatedTotal,
            remainingBalanceHalalas: updatedBalance,
          });
        }
        results.push({
          invoiceNumber: inv.number,
          client: inv.clientName,
          action: "Reminder Processed",
        });
      }
    }
    await batch.commit();
    res.json({ success: true, processed: results.length, details: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router4.post("/:id/correction", authenticate, async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const snap = await docRef.get();
    const existing = snap.data();
    if (!existing || existing.userId !== req.user.uid) {
      return res.status(404).json({ error: "Invoice not found or unauthorized" });
    }
    const { type, amount, reason } = req.body;
    const amountHalalas = Math.round(amount * 100);
    const currentLogs = Array.isArray(existing.logs) ? [...existing.logs] : [];
    currentLogs.unshift({
      action: `Correction Issued: ${type === "credit" ? "Credit Note" : "Debit Note"}`,
      timestamp: /* @__PURE__ */ new Date().toISOString(),
      note: `Amount: ${amount}, Reason: ${reason}`,
    });
    let newTotalHalalas = existing.totalAmountHalalas;
    if (type === "credit") {
      newTotalHalalas -= amountHalalas;
    } else {
      newTotalHalalas += amountHalalas;
    }
    await docRef.update({
      totalAmountHalalas: newTotalHalalas,
      remainingBalanceHalalas: newTotalHalalas - (existing.paidAmountHalalas || 0),
      logs: currentLogs,
      isLocked: true,
      version: (existing.version || 1) + 1,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var invoices_default = router4;

// server/routes/payroll.ts
var import_express5 = require("express");

// server/services/payroll.service.ts
var PayrollService = class {
  static async simulatePayroll(userId, period) {
    const employeesSnap = await db
      .collection("employees")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();
    const payrollEntries = employeesSnap.docs.map((doc) => {
      const e = doc.data();
      const grossHalalas =
        (e.baseSalaryHalalas || 0) +
        (e.housingAllowanceHalalas || 0) +
        (e.transportAllowanceHalalas || 0);
      const deductionsHalalas = Math.round(grossHalalas * 0.09) + (e.otherDeductionsHalalas || 0);
      const netHalalas = grossHalalas - deductionsHalalas;
      return {
        employeeId: doc.id,
        employeeName: e.name,
        position: e.position,
        bank: e.bank,
        basic: (e.baseSalaryHalalas || 0) / 100,
        allowances: (grossHalalas - (e.baseSalaryHalalas || 0)) / 100,
        deductions: deductionsHalalas / 100,
        netPay: netHalalas / 100,
        status: "pending_approval",
      };
    });
    return {
      id: `pr_${Date.now()}`,
      period,
      totalGross: payrollEntries.reduce((acc, p) => acc + p.basic + p.allowances, 0),
      totalNet: payrollEntries.reduce((acc, p) => acc + p.netPay, 0),
      totalDeductions: payrollEntries.reduce((acc, p) => acc + p.deductions, 0),
      status: "simulated",
      entries: payrollEntries,
    };
  }
  static async generateWPS(userId, runId) {
    const runDoc = await db.collection("payroll_runs").doc(runId).get();
    const run = runDoc.data();
    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }
    let wpsData = `EDB,1234567890,CompanyBankID,CompanyAccount,${run.period}
`;
    for (const e of run.entries) {
      const empDoc = await db.collection("employees").doc(e.employeeId).get();
      const emp = empDoc.data();
      wpsData += `EMP,${e.employeeId},${emp?.bank || ""},${emp?.iban || ""},${run.period},${e.basic},${e.allowances},${e.deductions},${e.netPay},G
`;
    }
    return {
      data: wpsData,
      period: run.period,
    };
  }
  static async generateReport(userId, runId) {
    const runDoc = await db.collection("payroll_runs").doc(runId).get();
    const run = runDoc.data();
    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }
    let csvData = `\uFEFF\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0638\u0641,\u0627\u0644\u0628\u0646\u0643,\u0627\u0644\u0631\u0627\u062A\u0628 \u0627\u0644\u0623\u0633\u0627\u0633\u064A,\u0627\u0644\u0628\u062F\u0644\u0627\u062A,\u0627\u0644\u062E\u0635\u0648\u0645\u0627\u062A,\u0627\u0644\u0635\u0627\u0641\u064A
`;
    run.entries.forEach((e) => {
      csvData += `${e.employeeName || ""},${e.bank || ""},${e.basic},${e.allowances},${e.deductions},${e.netPay}
`;
    });
    return {
      data: csvData,
      period: run.period,
    };
  }
};

// server/routes/payroll.ts
var router5 = (0, import_express5.Router)();
router5.get("/", authenticate, async (req, res) => {
  try {
    const runsSnap = await db
      .collection("payroll_runs")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    const runs = runsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(runs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.post("/simulate", authenticate, async (req, res) => {
  try {
    const { period } = req.body;
    const result = await PayrollService.simulatePayroll(req.user.uid, period);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.post("/commit", authenticate, async (req, res) => {
  try {
    const { simulatedRunId, entries, ...runData } = req.body;
    const docRef = await db.collection("payroll_runs").add({
      ...runData,
      entries,
      userId: req.user.uid,
      status: "processed",
      createdAt: /* @__PURE__ */ new Date(),
    });
    await logAudit(
      "PAYROLL",
      {
        action: "Approve Payroll Run",
        runId: docRef.id,
        period: runData.period,
        totalNetPay: runData.totalNet,
      },
      { success: true },
      req
    );
    res.json({ id: docRef.id, ...runData, status: "processed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.get("/wps/:runId", authenticate, async (req, res) => {
  try {
    const { data, period } = await PayrollService.generateWPS(req.user.uid, req.params.runId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=WPS_${period}.csv`);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router5.get("/report/:runId", authenticate, async (req, res) => {
  try {
    const { data, period } = await PayrollService.generateReport(req.user.uid, req.params.runId);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=payroll_report_${period}.csv`);
    res.send(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var payroll_default = router5;

// server/routes/employees.ts
var import_express6 = require("express");
var router6 = (0, import_express6.Router)();
router6.get("/", authenticate, async (req, res) => {
  try {
    const snap = await db.collection("employees").where("userId", "==", req.user.uid).get();
    const employees = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.post("/", authenticate, async (req, res) => {
  try {
    const docRef = await db.collection("employees").add({
      ...req.body,
      userId: req.user.uid,
      createdAt: /* @__PURE__ */ new Date(),
    });
    logAudit("HR", { action: "Create Employee", id: docRef.id }, { id: docRef.id }, req);
    res.status(201).json({ id: docRef.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.put("/:id", authenticate, async (req, res) => {
  try {
    await db.collection("employees").doc(req.params.id).update(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router6.delete("/:id", authenticate, async (req, res) => {
  try {
    const docRef = db.collection("employees").doc(req.params.id);
    const doc = await docRef.get();
    const data = doc.data();
    await docRef.delete();
    await logAudit(
      "PAYROLL",
      {
        action: "Remove Employee",
        employeeId: req.params.id,
        name: data?.name,
      },
      { success: true },
      req
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var employees_default = router6;

// server/routes/dashboard.ts
var import_express7 = require("express");
var router7 = (0, import_express7.Router)();
router7.get("/", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const userInvoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
    });
    const userLeads = await prisma.lead.findMany({
      where: { userId: req.user.id },
    });
    const totalInvoicedHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.totalAmountHalalas || 0),
      0
    );
    const totalPaidHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.paidAmountHalalas || 0),
      0
    );
    const in3Days = /* @__PURE__ */ new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    const leads = await prisma.lead.findMany({
      where: {
        userId: req.user.id,
        expectedCloseDate: {
          lte: in3Days,
          gte: /* @__PURE__ */ new Date(),
        },
        status: { notIn: ["won", "lost"] },
      },
    });
    for (const lead of leads) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: req.user.id,
          relatedId: lead.id,
          type: "lead_close",
          createdAt: { gte: new Date(/* @__PURE__ */ new Date().setHours(0, 0, 0, 0)) },
        },
      });
      if (!existing) {
        try {
          await prisma.notification.create({
            data: {
              userId: req.user.id,
              title:
                "\u062A\u0646\u0628\u064A\u0647 \u0645\u0648\u0639\u062F \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0635\u0641\u0642\u0629",
              message: `\u0627\u0644\u0635\u0641\u0642\u0629 \u0645\u0639 "${lead.name}" \u062A\u0642\u062A\u0631\u0628 \u0645\u0646 \u0645\u0648\u0639\u062F \u0627\u0644\u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0645\u062A\u0648\u0642\u0639 (${lead.expectedCloseDate?.toLocaleDateString()})`,
              type: "lead_close",
              relatedId: lead.id,
            },
          });
        } catch (notifErr) {
          console.error("Failed to create dashboard notification:", notifErr);
        }
      }
    }
    const months = [
      "\u064A\u0646\u0627\u064A\u0631",
      "\u0641\u0628\u0631\u0627\u064A\u0631",
      "\u0645\u0627\u0631\u0633",
      "\u0623\u0628\u0631\u064A\u0644",
      "\u0645\u0627\u064A\u0648",
      "\u064A\u0648\u0646\u064A\u0648",
      "\u064A\u0648\u0644\u064A\u0648",
      "\u0623\u063A\u0633\u0637\u0633",
      "\u0633\u0628\u062A\u0645\u0628\u0631",
      "\u0623\u0643\u062A\u0648\u0628\u0631",
      "\u0646\u0648\u0641\u0645\u0628\u0631",
      "\u062F\u064A\u0633\u0645\u0628\u0631",
    ];
    const trendData = [];
    for (let i = 11; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setMonth(d.getMonth() - i);
      const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendData.push({ name, sales: 0 });
    }
    const oneYearAgo = /* @__PURE__ */ new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    userInvoices.forEach((inv) => {
      if (inv.status === "paid" && new Date(inv.createdAt) >= oneYearAgo) {
        const d = new Date(inv.createdAt);
        const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const item = trendData.find((t) => t.name === name);
        if (item) {
          item.sales += (inv.paidAmountHalalas || 0) / 100;
        }
      }
    });
    const currentMonth = /* @__PURE__ */ new Date().getMonth();
    const currentYear = /* @__PURE__ */ new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const revenueThisMonth =
      userInvoices.reduce((acc, inv) => {
        const d = new Date(inv.createdAt);
        if (
          inv.status === "paid" &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        ) {
          return acc + (inv.paidAmountHalalas || 0);
        }
        return acc;
      }, 0) / 100;
    const revenueLastMonth =
      userInvoices.reduce((acc, inv) => {
        const d = new Date(inv.createdAt);
        if (
          inv.status === "paid" &&
          d.getMonth() === lastMonth &&
          d.getFullYear() === lastMonthYear
        ) {
          return acc + (inv.paidAmountHalalas || 0);
        }
        return acc;
      }, 0) / 100;
    const revenueTrend =
      revenueLastMonth === 0
        ? revenueThisMonth > 0
          ? 100
          : 0
        : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
    const emps = await prisma.employee.findMany({ where: { userId: req.user.id } });
    const payrollCost =
      emps.reduce(
        (acc, e) =>
          acc +
          ((e.baseSalaryHalalas || 0) +
            (e.housingAllowanceHalalas || 0) +
            (e.transportAllowanceHalalas || 0) -
            (e.otherDeductionsHalalas || 0)),
        0
      ) / 100;
    const totalEmployees = emps.length;
    const saudiEmployeesCount = emps.filter(
      (e) =>
        e.nationality === "Saudi" ||
        e.nationality === "\u0633\u0639\u0648\u062F\u064A" ||
        e.nationality === "Saudi Arabia"
    ).length;
    const saudiRatio = totalEmployees > 0 ? saudiEmployeesCount / totalEmployees : 0;
    let complianceScore = 0;
    if (totalEmployees > 0) {
      complianceScore = Math.min(100, Math.round(saudiRatio * 60 + 40));
    }
    const previousRun = (
      await prisma.payrollRun.findMany({
        where: { userId: req.user.id },
        take: 1,
        orderBy: { createdAt: "desc" },
      })
    )[0];
    const previousPayrollCost = previousRun ? previousRun.totalGross : payrollCost * 0.98;
    const payrollTrend =
      previousPayrollCost > 0
        ? ((payrollCost - previousPayrollCost) / previousPayrollCost) * 100
        : 0;
    const vatExposure =
      (userInvoices.reduce((acc, inv) => {
        if (inv.status !== "paid") {
          return acc + (inv.totalAmountHalalas || 0);
        }
        return acc;
      }, 0) *
        0.15) /
      100;
    res.json({
      revenue: totalPaidHalalas / 100,
      totalInvoiced: totalInvoicedHalalas / 100,
      activeLeads: userLeads.length,
      payrollCost,
      complianceScore,
      saudiEmployees: saudiEmployeesCount,
      vatExposure,
      trends: {
        revenue: revenueTrend.toFixed(1),
        compliance: (saudiRatio * 5).toFixed(1),
        payroll: payrollTrend.toFixed(1),
      },
      pendingInvoices: userInvoices.filter((i) => i.status !== "paid").length,
      config: user?.dashboardConfig
        ? (function () {
            try {
              return JSON.parse(user.dashboardConfig);
            } catch (e) {
              return null;
            }
          })()
        : null,
      chartData: trendData,
      employeesCount: totalEmployees,
      recentLogs: await prisma.auditLog.findMany({
        where: { userId: req.user.id },
        take: 5,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { name: true } } },
      }),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var dashboard_default = router7;

// server/routes/fwcos.ts
var import_express8 = require("express");
var router8 = (0, import_express8.Router)();
router8.post("/zatca-validate", authenticate, async (req, res) => {
  const { crNumber, vatNumber, certificateNumber } = req.body;
  const isValid = true;
  const result = {
    valid: isValid,
    checkedAt: /* @__PURE__ */ new Date().toISOString(),
    details: {
      status: "Active",
      registrationDate: "2020-01-01",
      complianceLevel: "High",
    },
  };
  logAudit("ZATCA", req.body, result, req);
  res.json(result);
});
router8.get("/workers", authenticate, async (req, res) => {
  try {
    const workers = await prisma.employee.findMany({ where: { userId: req.user.id } });
    res.json(workers);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});
router8.post("/workers", authenticate, async (req, res) => {
  try {
    const worker = await prisma.employee.create({
      data: { ...req.body, userId: req.user.id },
    });
    res.status(201).json(worker);
  } catch (err) {
    res.status(500).json({ error: "Failed to create worker" });
  }
});
router8.get("/pro-tasks", authenticate, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: { module: "PRO_TASK", userId: req.user.id },
      orderBy: { timestamp: "desc" },
    });
    res.json(
      logs.map((l) => ({
        id: l.id,
        ...JSON.parse(l.payload || "{}"),
        result: JSON.parse(l.result || "{}"),
        timestamp: l.timestamp,
      }))
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch PRO tasks" });
  }
});
router8.post("/pro-tasks", authenticate, async (req, res) => {
  try {
    const task = req.body;
    await logAudit("PRO_TASK", task, { status: "created" }, req);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to create PRO task" });
  }
});
router8.get("/simulation-baseline", authenticate, async (req, res) => {
  try {
    const emps = await prisma.employee.findMany({ where: { userId: req.user.id } });
    const totalEmployees = emps.length;
    const saudiEmployees = emps.filter(
      (e) =>
        e.nationality === "Saudi" ||
        e.nationality === "\u0633\u0639\u0648\u062F\u064A" ||
        e.nationality === "Saudi Arabia"
    ).length;
    const expatEmployees = Math.max(0, totalEmployees - saudiEmployees);
    const monthlyPayroll =
      emps.reduce(
        (acc, e) =>
          acc +
          ((e.baseSalaryHalalas || 0) +
            (e.housingAllowanceHalalas || 0) +
            (e.transportAllowanceHalalas || 0) -
            (e.otherDeductionsHalalas || 0)),
        0
      ) / 100;
    res.json({
      totalEmployees,
      saudiEmployees,
      expatEmployees,
      monthlyPayroll,
      complianceScore: totalEmployees > 0 ? 92 : 0,
      vatExposure: 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch simulation baseline" });
  }
});
router8.get("/certificate/logs", authenticate, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: {
        module: "CERTIFICATE",
        OR: [{ userId: req.user.id }],
      },
      include: { user: { select: { id: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 50,
    });
    const filteredLogs = logs.filter(
      (log) => log.userId === req.user.id || req.user.role === "Administrator"
    );
    const parsedLogs = filteredLogs.map((log) => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : {},
      result: log.result ? JSON.parse(log.result) : {},
    }));
    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch certificate logs" });
  }
});
router8.post("/certificate/validate", authenticate, (req, res) => {
  const { certificateNumber, companyRegistrationNumber, province } = req.body;
  let companyName = "Unknown Company";
  if (companyRegistrationNumber?.startsWith("1010")) {
    companyName = "Riyadh Tech Solutions LLC";
  } else if (companyRegistrationNumber?.startsWith("4030")) {
    companyName = "Jeddah Trade Co.";
  } else if (companyRegistrationNumber) {
    companyName = "General Contracting Establishment";
  }
  const payload = {
    valid: !!(certificateNumber && certificateNumber.length > 5),
    companyName,
    province: province || "Riyadh",
    cpraNumber: `CPRA-${Math.floor(Math.random() * 1e6)}`,
    issuer: "Ministry of Human Resources and Social Development",
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    auditId: `AUD-${Math.floor(Math.random() * 1e4)}`,
    timestamp: /* @__PURE__ */ new Date().toISOString(),
  };
  logAudit("CERTIFICATE", req.body, payload, req);
  res.json(payload);
});
var fwcos_default = router8;

// server/routes/notifications.ts
var import_express9 = require("express");
var router9 = (0, import_express9.Router)();
router9.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router9.put("/:id/read", authenticate, async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var notifications_default = router9;

// server/routes/settings.ts
var import_express10 = require("express");
var router10 = (0, import_express10.Router)();
router10.put("/profile", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
    });
    logAudit("SETTINGS", { action: "Update Profile" }, { success: true }, req);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router10.put("/dashboard-config", authenticate, async (req, res) => {
  try {
    const { config: config3 } = req.body;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { dashboardConfig: JSON.stringify(config3) },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router10.get("/integrations", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const integrations = await prisma.integration.findMany({
      where: { tenantId: user?.tenantId || "default_tenant" },
    });
    res.json(integrations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var settings_default = router10;

// server/routes/analytics.ts
var import_express11 = require("express");

// src/services/analytics/segments.ts
var SegmentAnalyzer = class {
  /**
   * Analyzes customer segments and identifies growth opportunities.
   */
  analyzeSegments(invoices) {
    const rawSegments = {};
    invoices.forEach((inv) => {
      const segment = inv.clientIndustry || inv.industry || "General";
      const amount = (inv.totalAmountHalalas || 0) / 100;
      rawSegments[segment] = (rawSegments[segment] || 0) + amount;
    });
    return Object.entries(rawSegments).map(([name, value]) => ({
      name,
      value,
      growth: `\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631`,
      retention: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
    }));
  }
  calculateSegmentGrowth(segment) {
    return "+12%";
  }
  generateCohortData(leads) {
    const cohorts = {};
    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const key = `Q${Math.floor(d.getMonth() / 3) + 1}-${d.getFullYear().toString().slice(-2)}`;
      cohorts[key] = (cohorts[key] || 0) + 1;
    });
    return Object.entries(cohorts)
      .map(([cohort, count]) => ({
        cohort,
        retention: [
          100,
          Math.max(0, 85 - (count % 10)),
          Math.max(0, 70 - (count % 5)),
          Math.max(0, 60 - (count % 3)),
        ],
      }))
      .slice(-3);
  }
};

// src/services/analytics/engine.ts
var DataAnalyticsEngine = class {
  constructor() {
    this.segmentAnalyzer = new SegmentAnalyzer();
  }
  /**
   * Transforms raw business data into a premium intelligence report.
   */
  generateFullReport(invoices, leads) {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const totalInvoiced =
      safeInvoices.reduce((acc, inv) => acc + (inv.totalAmountHalalas || 0), 0) / 100;
    const totalPaid =
      safeInvoices.reduce((acc, inv) => acc + (inv.paidAmountHalalas || 0), 0) / 100;
    const collectedRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
    const avgLeadValue = leads.length > 0 ? totalValue / leads.length : 0;
    const kpis = [
      {
        id: "revenue_efficiency",
        label:
          "\u0643\u0641\u0627\u0621\u0629 \u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0625\u064A\u0631\u0627\u062F\u0627\u062A",
        value: `${collectedRate.toFixed(1)}%`,
        numericValue: collectedRate,
        unit: "%",
        trend: collectedRate > 80 ? "+5.1%" : "-2.3%",
        isPositiveTrend: collectedRate > 80,
        status: collectedRate > 85 ? "strong" : collectedRate > 60 ? "average" : "weak",
        subDrivers: [
          "\u062A\u0630\u0643\u064A\u0631\u0627\u062A \u0627\u0644\u062F\u0641\u0639",
          "\u0628\u0648\u0627\u0628\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0629",
          "\u0634\u0631\u0648\u0637 \u0627\u0644\u0627\u0626\u062A\u0645\u0627\u0646",
        ],
        description:
          "\u064A\u0642\u064A\u0633 \u0647\u0630\u0627 \u0627\u0644\u0645\u0624\u0634\u0631 \u0627\u0644\u0641\u062C\u0648\u0629 \u0628\u064A\u0646 \u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0645\u0635\u062F\u0631\u0629 \u0648\u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0627\u0644\u0646\u0642\u062F\u064A\u0629 \u0627\u0644\u0641\u0639\u0644\u064A\u0629 \u0627\u0644\u062F\u0627\u062E\u0644\u0629 \u0644\u0644\u0634\u0631\u0643\u0629.",
      },
      {
        id: "sales_conversion",
        label: "\u0645\u0639\u062F\u0644 \u0627\u0644\u0625\u063A\u0644\u0627\u0642 (Conversion)",
        value: `${leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : 0}%`,
        numericValue: leads.length > 0 ? (wonLeads / leads.length) * 100 : 0,
        unit: "%",
        trend: "+2.5%",
        isPositiveTrend: true,
        status: "average",
        subDrivers: [
          "\u0633\u0631\u0639\u0629 \u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629",
          "\u062F\u0642\u0629 \u0627\u0644\u0639\u0631\u0648\u0636",
          "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
        ],
        description:
          "\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0625\u0644\u0649 \u0635\u0641\u0642\u0627\u062A \u0631\u0627\u0628\u062D\u0629.",
      },
    ];
    const scenarios = [
      {
        name: "\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0623\u0633\u0627\u0633\u064A",
        color: "#cbd5e1",
        data: this.generateGrowthData(totalPaid, 0.1),
      },
      {
        name: "\u0633\u064A\u0646\u0627\u0631\u064A\u0648 \u0627\u0644\u0646\u0645\u0648 \u0627\u0644\u0645\u062A\u0641\u0627\u0626\u0644",
        color: "#10b981",
        data: this.generateGrowthData(totalPaid, 0.25),
      },
    ];
    const actionPlan = [
      {
        id: "1",
        action:
          "\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629",
        impact: "high",
        effort: "low",
        priority: 1,
        tradeOff:
          "\u0642\u062F \u064A\u0632\u0639\u062C \u0628\u0639\u0636 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u064A\u0646\u060C \u0644\u0643\u0646\u0647 \u064A\u062D\u0633\u0646 \u0627\u0644\u0633\u064A\u0648\u0644\u0629 \u0641\u0648\u0631\u0627\u064B.",
        secondOrderEffect:
          "\u064A\u0642\u0644\u0644 \u0627\u0644\u0636\u063A\u0637 \u0639\u0644\u0649 \u0627\u0644\u0645\u062D\u0627\u0633\u0628\u064A\u0646 \u0644\u0625\u062C\u0631\u0627\u0621 \u0645\u0643\u0627\u0644\u0645\u0627\u062A \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u064A\u062F\u0648\u064A\u0629.",
      },
      {
        id: "2",
        action:
          "\u062A\u062D\u0633\u064A\u0646 \u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A",
        impact: "medium",
        effort: "high",
        priority: 2,
        tradeOff:
          "\u064A\u062A\u0637\u0644\u0628 \u0648\u0642\u062A\u0627\u064B \u0623\u0637\u0648\u0644 \u0644\u0644\u062A\u0637\u0628\u064A\u0642 \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u062D\u0644\u0648\u0644 \u0627\u0644\u0633\u0631\u064A\u0639\u0629.",
        secondOrderEffect:
          "\u0628\u0646\u0627\u0621 \u0627\u0633\u062A\u062F\u0627\u0645\u0629 \u062A\u0633\u0648\u064A\u0642\u064A\u0629 \u0637\u0648\u064A\u0644\u0629 \u0627\u0644\u0623\u0645\u062F.",
      },
    ];
    return {
      timestamp: /* @__PURE__ */ new Date().toISOString(),
      executiveSummary:
        totalPaid < totalInvoiced * 0.7
          ? "\u0647\u0646\u0627\u0643 \u0641\u062C\u0648\u0629 \u0645\u0644\u062D\u0648\u0638\u0629 \u0641\u064A \u0627\u0644\u062A\u062D\u0635\u064A\u0644. \u0646\u0648\u0635\u064A \u0628\u062A\u0641\u0639\u064A\u0644 \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062A\u062D\u0635\u064A\u0644 \u0627\u0644\u0622\u0644\u064A \u0641\u0648\u0631\u0627\u064B."
          : "\u0627\u0644\u0623\u062F\u0627\u0621 \u0627\u0644\u0645\u0627\u0644\u064A \u0645\u0633\u062A\u0642\u0631 \u0645\u0639 \u0645\u0639\u062F\u0644\u0627\u062A \u062A\u062D\u0635\u064A\u0644 \u0645\u0645\u062A\u0627\u0632\u0629. \u0646\u0648\u0635\u064A \u0628\u0627\u0644\u062A\u0631\u0643\u064A\u0632 \u0639\u0644\u0649 \u0627\u0644\u062A\u0648\u0633\u0639 \u0648\u0627\u0644\u0627\u0633\u062A\u062D\u0648\u0627\u0630.",
      keyMetrics: kpis,
      unitEconomics: {
        cac: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
        ltv: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
        paybackPeriod: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
        margin: "\u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631",
      },
      segments: this.segmentAnalyzer.analyzeSegments(safeInvoices),
      forecast: {
        scenarios,
        variables: [
          "\u0623\u0633\u0639\u0627\u0631 \u0627\u0644\u0637\u0627\u0642\u0629",
          "\u0627\u0644\u0633\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0636\u0631\u064A\u0628\u064A\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629",
          "\u0645\u0648\u0633\u0645 \u0631\u0645\u0636\u0627\u0646",
        ],
      },
      alerts: [
        {
          id: "a1",
          title: "\u0641\u062C\u0648\u0629 \u0627\u0644\u062A\u062D\u0635\u064A\u0644",
          description: `\u0647\u0646\u0627\u0643 ${(totalInvoiced - totalPaid).toLocaleString()} \u0631.\u0633 \u0645\u0639\u0644\u0642\u0629 \u062D\u0627\u0644\u064A\u0627\u064B.`,
          severity: totalPaid < totalInvoiced * 0.6 ? "high" : "low",
          type: "anomaly",
        },
      ],
      benchmarks: [
        {
          metric: "\u0645\u0639\u062F\u0644 \u0627\u0644\u062A\u062D\u0635\u064A\u0644",
          current: collectedRate,
          industryAvg: 78,
          rating:
            collectedRate > 78
              ? "\u0645\u0645\u062A\u0627\u0632"
              : "\u0645\u062A\u0648\u0633\u0637",
        },
      ],
      actionPlan,
      decisiveAction:
        totalPaid < totalInvoiced * 0.7
          ? "\u0642\u0645 \u0628\u0625\u0644\u0632\u0627\u0645 \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u062C\u062F\u062F \u0628\u062F\u0641\u0639\u0629 \u0645\u0642\u062F\u0645\u0629 \u0628\u0646\u0633\u0628\u0629 \u0665\u0660\u066A \u0644\u062A\u0642\u0644\u064A\u0644 \u0645\u062E\u0627\u0637\u0631 \u0627\u0644\u062A\u0634\u063A\u064A\u0644."
          : "\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0628\u062F\u0621 \u0641\u064A \u0627\u0633\u062A\u062B\u0645\u0627\u0631\u0627\u062A \u062A\u0648\u0633\u0639\u064A\u0629 \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0627\u0633\u062A\u0642\u0631\u0627\u0631 \u0627\u0644\u062A\u062F\u0641\u0642 \u0627\u0644\u0645\u0627\u0644\u064A.",
    };
  }
  generateGrowthData(baseValue, rate) {
    const data = [];
    const months = [
      "\u064A\u0646\u0627\u064A\u0631",
      "\u0641\u0628\u0631\u0627\u064A\u0631",
      "\u0645\u0627\u0631\u0633",
      "\u0625\u0628\u0631\u064A\u0644",
      "\u0645\u0627\u064A\u0648",
      "\u064A\u0648\u0646\u064A\u0648",
    ];
    let current = baseValue || 5e4;
    for (const month of months) {
      data.push({ label: month, value: Math.round(current) });
      current *= 1 + rate;
    }
    return data;
  }
};

// server/routes/analytics.ts
var router11 = (0, import_express11.Router)();
var analyticsEngine = new DataAnalyticsEngine();
router11.get("/summary", authenticate, async (req, res) => {
  try {
    const invoicesSnapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .get();
    const invoices = invoicesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const leadsSnapshot = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const leads = leadsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const report = analyticsEngine.generateFullReport(invoices, leads);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router11.get("/context", authenticate, async (req, res) => {
  try {
    const userDoc = await db.collection("users").doc(req.user.uid).get();
    const user = userDoc.data();
    const leadsSnapshot = await db.collection("leads").where("userId", "==", req.user.uid).get();
    const invoicesSnapshot = await db
      .collection("invoices")
      .where("userId", "==", req.user.uid)
      .get();
    const employeesSnapshot = await db
      .collection("employees")
      .where("userId", "==", req.user.uid)
      .get();
    const stats = {
      leads: leadsSnapshot.size,
      invoices: invoicesSnapshot.size,
      employees: employeesSnapshot.size,
      companyName:
        user?.companyName ||
        "\u0645\u0646\u0634\u0623\u0629 \u063A\u064A\u0631 \u0645\u062D\u062F\u062F\u0629",
      city: user?.city || "\u063A\u064A\u0631 \u0645\u062D\u062F\u062F",
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to gather AI context" });
  }
});
var analytics_default = router11;

// server/routes/hr.ts
var import_express12 = require("express");
var router12 = (0, import_express12.Router)();
router12.post("/nitaqat/calculate", authenticate, async (req, res) => {
  const { totalEmployees, saudiEmployees, companySize } = req.body;
  const percentage = totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 0;
  let category = "Red";
  let targetPlatinum = 0;
  let targetGreen = 0;
  let platinumThreshold = 40;
  let greenThreshold = 20;
  if (percentage >= platinumThreshold) category = "Platinum";
  else if (percentage >= greenThreshold) category = "Green";
  else if (percentage >= 10) category = "Yellow";
  targetPlatinum = Math.ceil((platinumThreshold / 100) * totalEmployees) - saudiEmployees;
  targetGreen = Math.ceil((greenThreshold / 100) * totalEmployees) - saudiEmployees;
  const recommendations = [];
  if (category !== "Platinum") {
    recommendations.push(
      `Hire ${Math.max(1, targetPlatinum)} more Saudi national(s) to reach Platinum category.`
    );
  }
  if (category === "Red" || category === "Yellow") {
    recommendations.push(
      `Hire ${Math.max(1, targetGreen)} more Saudi national(s) to reach Green category.`
    );
  }
  recommendations.push(
    "Update contract details for all employees",
    "Ensure all employees are registered in GOSI"
  );
  if (companySize === "Small") {
    recommendations.push("Small companies are exempt from some quotas, check the official portal.");
  } else if (companySize === "Large") {
    recommendations.push("Large companies must strictly adhere to the 40% Platinum threshold.");
  }
  const payload = {
    score: percentage.toFixed(1),
    category,
    recommendations,
  };
  logAudit("NITAQAT", req.body, payload, req);
  res.json(payload);
});
router12.post("/workpermit/calculate", authenticate, (req, res) => {
  const { totalEmployees, expats, industry, durationYears = 1 } = req.body;
  const exemptCount = expats <= 4 && totalEmployees <= 9 ? expats : 0;
  const payingExpats = expats - exemptCount;
  let baseFee = 9600;
  if (industry === "industrial") baseFee = 7200;
  if (industry === "agricultural") baseFee = 4800;
  const totalFees = payingExpats * baseFee * durationYears;
  const payload = {
    totalFees,
    exemptCount,
    payingExpats,
    baseFee,
    durationYears,
  };
  logAudit("WORK_PERMIT", req.body, payload, req);
  res.json(payload);
});
var hr_default = router12;

// server/routes/isic.ts
var import_express13 = require("express");
var router13 = (0, import_express13.Router)();
router13.post("/match", authenticate, (req, res) => {
  const { occupation } = req.body;
  const isicDatabase = [
    {
      code: "7110",
      desc: "\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629 \u0648\u0627\u0644\u0627\u0633\u062A\u0634\u0627\u0631\u0627\u062A \u0627\u0644\u0647\u0646\u062F\u0633\u064A\u0629",
      keywords: [
        "\u0645\u0647\u0646\u062F\u0633",
        "\u0647\u0646\u062F\u0633\u0629",
        "\u062A\u0635\u0645\u064A\u0645",
        "\u0645\u0639\u0645\u0627\u0631\u064A",
        "\u0645\u062F\u0646\u064A",
        "\u0627\u0633\u062A\u0634\u0627\u0631\u0629",
      ],
    },
    {
      code: "6201",
      desc: "\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0628\u0631\u0645\u062C\u0629 \u0627\u0644\u062D\u0627\u0633\u0648\u0628\u064A\u0629",
      keywords: [
        "\u0628\u0631\u0645\u062C",
        "\u062A\u0637\u0648\u064A\u0631",
        "\u0633\u0648\u0641\u062A\u0648\u064A\u0631",
        "\u062A\u0637\u0628\u064A\u0642",
        "\u0645\u0648\u0642\u0639",
        "\u0643\u0648\u062F",
        "\u062D\u0627\u0633\u0628",
      ],
    },
    {
      code: "4100",
      desc: "\u062A\u0634\u064A\u064A\u062F \u0627\u0644\u0645\u0628\u0627\u0646\u064A",
      keywords: [
        "\u0628\u0646\u0627\u0621",
        "\u062A\u0634\u064A\u064A\u062F",
        "\u0645\u0642\u0627\u0648\u0644\u0627\u062A",
        "\u0639\u0642\u0627\u0631",
        "\u0645\u0628\u0646\u0649",
        "\u0639\u0645\u0627\u0631\u0629",
      ],
    },
    {
      code: "5610",
      desc: "\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u063A\u0630\u0627\u0626\u064A\u0629",
      keywords: [
        "\u0645\u0637\u0639\u0645",
        "\u0623\u0643\u0644",
        "\u063A\u0630\u0627\u0621",
        "\u0645\u0642\u0647\u0649",
        "\u0637\u0639\u0627\u0645",
        "\u0637\u0628\u062E",
      ],
    },
    {
      code: "8620",
      desc: "\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629 \u0648\u0623\u0637\u0628\u0627\u0621 \u0627\u0644\u0623\u0633\u0646\u0627\u0646",
      keywords: [
        "\u0637\u0628\u064A\u0628",
        "\u0635\u062D\u0629",
        "\u0645\u0633\u062A\u0634\u0641\u0649",
        "\u0639\u064A\u0627\u062F\u0629",
        "\u0623\u0633\u0646\u0627\u0646",
        "\u0639\u0644\u0627\u062C",
      ],
    },
  ];
  const searchTerms = (occupation || "").toLowerCase().split(/\s+/);
  let matchedItems = [];
  isicDatabase.forEach((item) => {
    let score = 0;
    item.keywords.forEach((kw) => {
      searchTerms.forEach((term) => {
        if (term.includes(kw) || kw.includes(term)) {
          score += 30;
        }
      });
    });
    if (item.desc.includes(occupation)) score += 50;
    if (score > 0) {
      matchedItems.push({
        activityDescription: item.desc,
        isicCode: item.code,
        confidence: Math.min(99, score),
      });
    }
  });
  if (matchedItems.length === 0) {
    matchedItems = [
      {
        activityDescription:
          "\u0623\u0646\u0634\u0637\u0629 \u062E\u062F\u0645\u0627\u062A \u062F\u0639\u0645 \u0627\u0644\u0623\u0639\u0645\u0627\u0644 \u0627\u0644\u0623\u062E\u0631\u0649 \u0646.\u064A.\u0645",
        isicCode: "8299",
        confidence: 40,
      },
    ];
  }
  matchedItems.sort((a, b) => b.confidence - a.confidence);
  const payload = { matches: matchedItems.slice(0, 5) };
  logAudit("ISIC4", req.body, payload, req);
  res.json(payload);
});
var isic_default = router13;

// server/routes/public.ts
var import_express14 = require("express");
var router14 = (0, import_express14.Router)();
router14.get("/invoices/:id", async (req, res) => {
  try {
    const docSnap = await db.collection("invoices").doc(req.params.id).get();
    if (!docSnap.exists) return res.status(404).json({ error: "Invoice not found" });
    const invoice = { id: docSnap.id, ...docSnap.data() };
    let paypalClientId = null;
    if (invoice.userId) {
      const settingsSnap = await db.collection("settings").doc(invoice.userId).get();
      if (settingsSnap.exists) {
        paypalClientId = settingsSnap.data()?.paypalClientId || null;
      }
    }
    res.json({
      ...invoice,
      paypalClientId,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});
router14.post("/invoices/:id/view", async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (invoiceSnap.exists) {
      const invoice = invoiceSnap.data();
      if (invoice.status === "sent") {
        const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
        currentLogs.unshift({
          action: "Viewed by Client",
          timestamp: /* @__PURE__ */ new Date().toISOString(),
        });
        await docRef.update({
          status: "viewed",
          logs: currentLogs,
          isLocked: true,
        });
      }
    }
    res.sendStatus(200);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router14.post("/invoices/:id/pay", async (req, res) => {
  try {
    const docRef = db.collection("invoices").doc(req.params.id);
    const invoiceSnap = await docRef.get();
    if (!invoiceSnap.exists) return res.status(404).json({ error: "Invoice not found" });
    const invoice = invoiceSnap.data();
    const { amount } = req.body;
    const paymentAmountHalalas = Math.round(
      (Number(amount) || invoice.remainingBalanceHalalas / 100) * 100
    );
    const paidAmountHalalas = (invoice.paidAmountHalalas || 0) + paymentAmountHalalas;
    const remainingBalanceHalalas = invoice.totalAmountHalalas - paidAmountHalalas;
    let status = invoice.status;
    if (remainingBalanceHalalas <= 0) {
      status = "paid";
    } else {
      status = "partially paid";
    }
    const currentLogs = Array.isArray(invoice.logs) ? [...invoice.logs] : [];
    currentLogs.unshift({
      action: `Payment Received: ${(paymentAmountHalalas / 100).toFixed(2)}`,
      timestamp: /* @__PURE__ */ new Date().toISOString(),
      note: `Remaining: ${(remainingBalanceHalalas / 100).toFixed(2)}`,
    });
    const updateData = {
      paidAmountHalalas,
      remainingBalanceHalalas,
      status,
      logs: currentLogs,
      isLocked: true,
    };
    await docRef.update(updateData);
    res.json({
      id: invoiceSnap.id,
      ...invoice,
      ...updateData,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
var public_default = router14;

// server/routes/auditLogs.ts
var import_express15 = require("express");
var router15 = (0, import_express15.Router)();
router15.get("/", authenticate, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      where: req.user.role === "Administrator" ? {} : { userId: req.user.id },
      include: { user: { select: { id: true, name: true, role: true } } },
      orderBy: { timestamp: "desc" },
      take: 100,
    });
    const parsedLogs = logs.map((log) => ({
      ...log,
      payload: log.payload ? JSON.parse(log.payload) : {},
      result: log.result ? JSON.parse(log.result) : {},
    }));
    res.json(parsedLogs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});
var auditLogs_default = router15;

// server/app.ts
var import_meta = {};
var __filename = (0, import_url.fileURLToPath)(import_meta.url);
var __dirname = import_path3.default.dirname(__filename);
async function createApp() {
  const app2 = (0, import_express16.default)();
  app2.set("trust proxy", 1);
  app2.use(import_express16.default.json());
  app2.use((0, import_cookie_parser.default)());
  const apiLimiter = (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app2.use("/api/auth", auth_default);
  app2.use("/api/employees", employees_default);
  app2.use("/api/shipments", shipments_default);
  app2.use("/api/leads", leads_default);
  app2.use("/api/invoices", invoices_default);
  app2.use("/api/payroll", payroll_default);
  app2.use("/api/payroll-runs", payroll_default);
  app2.use("/api/dashboard", dashboard_default);
  app2.use("/api/fwcos", fwcos_default);
  app2.use("/api/stats", fwcos_default);
  app2.use("/api/notifications", notifications_default);
  app2.use("/api/user", settings_default);
  app2.use("/api/analytics", analytics_default);
  app2.use("/api/isic4", isic_default);
  app2.use("/api/public", public_default);
  app2.use("/api/audit-logs", auditLogs_default);
  app2.use("/api", hr_default);
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mudarij OS API is active" });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app2.use(import_express16.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  return app2;
}

// server.ts
var PORT = 3e3;
function startPayrollCronJob() {
  setInterval(
    async () => {
      try {
        console.log("[Cron] Running scheduled task to verify locked payroll runs...");
        const snapshot = await db.collection("payroll_runs").where("isLocked", "==", true).get();
        const batch = db.batch();
        let updates = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (!data.systemLockDate) {
            batch.update(doc.ref, {
              systemLockDate: /* @__PURE__ */ new Date().toISOString(),
              preventModifications: true,
              status: "finalized",
              logs: [
                ...(data.logs || []),
                {
                  action: "System Auto-Lock",
                  timestamp: /* @__PURE__ */ new Date().toISOString(),
                  note: "Automatically locked by system after WPA/WPS submission or manual toggle.",
                },
              ],
            });
            updates++;
          }
        });
        if (updates > 0) {
          await batch.commit();
          console.log(`[Cron] Successfully locked ${updates} payroll runs.`);
        }
      } catch (err) {
        console.error("[Cron] Failed to run payroll lock checking job:", err);
      }
    },
    10 * 60 * 1e3
  );
}
async function start() {
  try {
    const app2 = await createApp();
    app2.listen(PORT, "0.0.0.0", () => {
      console.log(`\u{1F680} Mudarij OS running on http://localhost:${PORT}`);
      startPayrollCronJob();
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}
start();
