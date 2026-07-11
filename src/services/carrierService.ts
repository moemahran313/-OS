// Carrier Adapter Interface
export interface CarrierAdapter {
  providerName: string;
  createShipment(details: any): Promise<any>;
  trackShipment(trackingNumber: string): Promise<any>;
  getRates(origin: string, destination: string, weight: number): Promise<any[]>;
}

// Aramex Implementation
export class AramexAdapter implements CarrierAdapter {
  providerName = "Aramex";
  private apiKey: string;

  constructor(config: { apiKey?: string }) {
    this.apiKey = config.apiKey || "demo_aramex_key";
  }

  async createShipment(details: any) {
    console.log(`[Aramex] Creating shipment for ${details.supplierName} using key ${this.apiKey}`);
    // Simulate API call
    return {
      success: true,
      trackingNumber: `ARM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      labelUrl: "https://aramex.com/labels/demo-label.pdf",
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async trackShipment(trackingNumber: string) {
    console.log(`[Aramex] Tracking ${trackingNumber}`);
    const statuses = ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      trackingNumber,
      status: status,
      location: "Riyadh Distribution Center",
      lastUpdate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      events: [
        {
          status: "أمر شحن مؤكد",
          location: "مصنع المورد (الصين)",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "تم استلام الشحنة في المركز اللوجستي",
          location: "Shenzhen Port",
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "غادرت الميناء",
          location: "South China Sea",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { status: status, location: "مركز توزيع الرياض", timestamp: new Date().toISOString() },
      ],
    };
  }

  async getRates(_origin: string, _destination: string, _weight: number) {
    return [
      { service: "Ground", price: 45.0, currency: "SAR", days: 5 },
      { service: "Express", price: 120.0, currency: "SAR", days: 2 },
    ];
  }
}

// DHL Implementation
export class DhlAdapter implements CarrierAdapter {
  providerName = "DHL";
  private apiKey: string;

  constructor(config: { apiKey?: string }) {
    this.apiKey = config.apiKey || "demo_dhl_key";
  }

  async createShipment(details: any) {
    console.log(`[DHL] Creating shipment for ${details.supplierName}`);
    return {
      success: true,
      trackingNumber: `DHL-${Math.random().toString(10).substring(2, 12)}`,
      labelUrl: "https://dhl.com/labels/demo-label.pdf",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async trackShipment(trackingNumber: string) {
    console.log(`[DHL] Tracking ${trackingNumber}`);
    const statuses = ["PICKED_UP", "TRANSIT", "ARRIVED_AT_FACILITY", "DELIVERED"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    return {
      trackingNumber,
      status: status,
      location: "Leipzig Hub, Germany",
      lastUpdate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      events: [
        {
          status: "Shipment Picked Up",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "Processed at Hong Kong",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          status: "Departed from Facility",
          location: "Hong Kong",
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
        },
        { status: status, location: "Leipzig Hub", timestamp: new Date().toISOString() },
      ],
    };
  }

  async getRates(_origin: string, _destination: string, _weight: number) {
    return [
      { service: "Express Worldwide", price: 15.0, currency: "USD", days: 3 },
      { service: "Express 12:00", price: 185.0, currency: "USD", days: 1 },
    ];
  }
}

// Carrier Service to manage adapters
export class CarrierService {
  private adapters: Map<string, CarrierAdapter> = new Map();

  constructor() {
    // Default setup, in production these would be initialized per tenant config
    this.registerAdapter(new AramexAdapter({}));
    this.registerAdapter(new DhlAdapter({}));
  }

  registerAdapter(adapter: CarrierAdapter) {
    this.adapters.set(adapter.providerName.toLowerCase(), adapter);
  }

  getAdapter(provider: string): CarrierAdapter {
    const adapter = this.adapters.get(provider.toLowerCase());
    if (!adapter) throw new Error(`Carrier ${provider} not supported`);
    return adapter;
  }
}

export const carrierService = new CarrierService();
