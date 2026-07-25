// ESC/POS Thermal Printer Protocol & Driver Engine
// Supports WebUSB, WebBluetooth, and Web Serial for ZATCA Phase 2 POS Counters

import { generateZatcaQR, ZatcaData } from "./zatcaQr";

export interface ReceiptItem {
  name: string;
  qty: number;
  unitPriceSAR: number;
  totalPriceSAR: number;
}

export interface ReceiptData {
  companyName: string;
  companyVat: string;
  crNumber?: string;
  branchName?: string;
  invoiceNumber: string;
  issueDateTime: string; // ISO or formatted
  invoiceType: "simplified" | "standard" | "credit_note" | "debit_note";
  items: ReceiptItem[];
  subtotalSAR: number;
  vatAmountSAR: number;
  totalSAR: number;
  paymentMethod: "Mada" | "Cash" | "Credit Card" | "Apple Pay";
  cashierName?: string;
  zatcaQrBase64?: string;
  footerNote?: string;
}

export class ESCPOSBuilder {
  private buffer: number[] = [];
  private paperWidthMm: number = 80; // 80mm default or 58mm

  constructor(paperWidthMm: number = 80) {
    this.paperWidthMm = paperWidthMm;
    this.init();
  }

  /** Reset / Initialize Printer */
  init(): ESCPOSBuilder {
    this.buffer.push(0x1b, 0x40); // ESC @
    // Code Page WPC1256 for Arabic / Middle East
    this.buffer.push(0x1b, 0x74, 0x32);
    return this;
  }

  /** Alignment: 0 = Left, 1 = Center, 2 = Right */
  align(alignment: "left" | "center" | "right"): ESCPOSBuilder {
    const code = alignment === "center" ? 1 : alignment === "right" ? 2 : 0;
    this.buffer.push(0x1b, 0x61, code); // ESC a n
    return this;
  }

  /** Bold mode */
  bold(enable: boolean = true): ESCPOSBuilder {
    this.buffer.push(0x1b, 0x45, enable ? 1 : 0); // ESC E n
    return this;
  }

  /** Text Size multiplier: 1..8 */
  size(widthMultiplier: number = 1, heightMultiplier: number = 1): ESCPOSBuilder {
    const w = Math.min(Math.max(widthMultiplier - 1, 0), 7);
    const h = Math.min(Math.max(heightMultiplier - 1, 0), 7);
    const n = (w << 4) | h;
    this.buffer.push(0x1d, 0x21, n); // GS ! n
    return this;
  }

  /** Feed lines */
  feed(lines: number = 1): ESCPOSBuilder {
    for (let i = 0; i < lines; i++) {
      this.buffer.push(0x0a); // LF
    }
    return this;
  }

  /** Add raw UTF-8 text with LF */
  text(str: string): ESCPOSBuilder {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str + "\n");
    for (let i = 0; i < bytes.length; i++) {
      this.buffer.push(bytes[i]);
    }
    return this;
  }

  /** Print a horizontal divider line across receipt width */
  divider(char: string = "-"): ESCPOSBuilder {
    const cols = this.paperWidthMm === 58 ? 32 : 48;
    this.text(char.repeat(cols));
    return this;
  }

  /** Two-column key-value row formatted for thermal receipt width */
  twoColumn(key: string, value: string): ESCPOSBuilder {
    const totalCols = this.paperWidthMm === 58 ? 32 : 48;
    const spaceCount = Math.max(1, totalCols - (key.length + value.length));
    const line = key + " ".repeat(spaceCount) + value;
    this.text(line);
    return this;
  }

  /** Cut paper command (GS V 66 0) */
  cut(): ESCPOSBuilder {
    this.feed(3);
    this.buffer.push(0x1d, 0x56, 0x42, 0x00); // GS V 66 0
    return this;
  }

  /** Cash drawer kick (ESC p 0 25 250) */
  kickDrawer(): ESCPOSBuilder {
    this.buffer.push(0x1b, 0x70, 0x00, 0x19, 0xfa);
    return this;
  }

  /** Native ESC/POS QR Code printing (GS ( k) */
  qrCodeNative(base64Tlv: string, moduleSize: number = 6): ESCPOSBuilder {
    this.align("center");
    const dataEncoder = new TextEncoder();
    const qrBytes = dataEncoder.encode(base64Tlv);
    const storeLen = qrBytes.length + 3;
    const pL = storeLen & 0xff;
    const pH = (storeLen >> 8) & 0xff;

    // 1. Set QR model
    this.buffer.push(0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00);
    // 2. Set module size
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x43, moduleSize);
    // 3. Set error correction level M (48)
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x4e, 0x30);
    // 4. Store data
    this.buffer.push(0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30);
    for (let i = 0; i < qrBytes.length; i++) {
      this.buffer.push(qrBytes[i]);
    }
    // 5. Print QR code
    this.buffer.push(0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30);
    this.feed(1);
    return this;
  }

  /** Raster Bitmap Graphics printing (GS v 0) - Perfect for rendering canvas images/barcodes */
  rasterImage(width: number, height: number, monoBitmap: Uint8Array): ESCPOSBuilder {
    this.align("center");
    const widthBytes = Math.ceil(width / 8);
    const xL = widthBytes & 0xff;
    const xH = (widthBytes >> 8) & 0xff;
    const yL = height & 0xff;
    const yH = (height >> 8) & 0xff;

    // GS v 0 0 xL xH yL yH
    this.buffer.push(0x1d, 0x76, 0x30, 0x00, xL, xH, yL, yH);
    for (let i = 0; i < monoBitmap.length; i++) {
      this.buffer.push(monoBitmap[i]);
    }
    this.feed(1);
    return this;
  }

  /** Export binary Uint8Array */
  getUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }

  /** Export Hex string representation for debug/telemetry */
  getHex(): string {
    return this.buffer.map((b) => b.toString(16).padStart(2, "0").toUpperCase()).join(" ");
  }
}

// Device Connection Drivers

export class WebUSBThermalDriver {
  private device: any = null;
  private endpointNumber: number = 1;

  async isSupported(): Promise<boolean> {
    return typeof navigator !== "undefined" && "usb" in navigator;
  }

  async requestDevice(): Promise<string> {
    if (!(await this.isSupported())) {
      throw new Error("متصفحك لا يدعم خاصية WebUSB Direct Hardware Access");
    }

    const nav = navigator as any;
    // Filter for Printer Class 7 or request device
    this.device = await nav.usb.requestDevice({
      filters: [{ classCode: 7 }],
    });

    await this.device.open();
    if (this.device.configuration === null) {
      await this.device.selectConfiguration(1);
    }
    await this.device.claimInterface(0);

    // Find OUT endpoint
    const iface = this.device.configuration?.interfaces[0];
    const endpoint = iface?.alternate.endpoints.find((e: any) => e.direction === "out");
    if (endpoint) {
      this.endpointNumber = endpoint.endpointNumber;
    }

    return this.device.productName || "طابعة حرارية USB (USB Thermal Printer)";
  }

  async print(data: Uint8Array): Promise<void> {
    if (!this.device) {
      throw new Error("لم يتم الاتصال بطابعة USB حتى الآن");
    }
    await this.device.transferOut(this.endpointNumber, data);
  }

  async disconnect(): Promise<void> {
    if (this.device) {
      await this.device.close();
      this.device = null;
    }
  }
}

export class WebBluetoothThermalDriver {
  private device: any = null;
  private characteristic: any = null;

  async isSupported(): Promise<boolean> {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  }

  async requestDevice(): Promise<string> {
    if (!(await this.isSupported())) {
      throw new Error("متصفحك لا يدعم خاصية WebBluetooth Direct Access");
    }

    const nav = navigator as any;
    // Standard SPP / ESC/POS Bluetooth GATT Service UUIDs
    this.device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [
        "000018f0-0000-1000-8000-00805f9b34fb",
        "e7810a71-73ae-499d-8c15-faa9aef0c3f2",
        "00001101-0000-1000-8000-00805f9b34fb",
        "49535343-fe7d-4ae5-8fa9-9fafd205e455",
      ],
    });

    const server = await this.device.gatt?.connect();
    if (!server) throw new Error("فشل الاتصال بجهاز البلوتوث المختار");

    // Discover service & write characteristic
    const services = await server.getPrimaryServices();
    for (const service of services) {
      const chars = await service.getCharacteristics();
      for (const char of chars) {
        if (char.properties.write || char.properties.writeWithoutResponse) {
          this.characteristic = char;
          break;
        }
      }
      if (this.characteristic) break;
    }

    if (!this.characteristic) {
      throw new Error("لم يتم العثور على خاصية الطباعة (Write Characteristic) في طابعة البلوتوث");
    }

    return this.device.name || "طابعة حرارية بلوتوث (Bluetooth Thermal Printer)";
  }

  async print(data: Uint8Array): Promise<void> {
    if (!this.characteristic) {
      throw new Error("لم يتم الاتصال بطابعة البلوتوث");
    }

    // Bluetooth chunking (max 512 bytes per packet for standard BLE GATT)
    const chunkSize = 128;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValueWithResponse(chunk);
      }
      // Brief pause to prevent buffer overflow on mobile BLE thermal printers
      await new Promise((res) => setTimeout(res, 20));
    }
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
  }
}

// Generate ZATCA Phase 2 ESC/POS Receipt Binary
export function buildZatcaEscposReceipt(
  receipt: ReceiptData,
  paperWidthMm: number = 80,
  kickDrawerOnPrint: boolean = true
): { bytes: Uint8Array; hex: string; qrBase64: string } {
  const builder = new ESCPOSBuilder(paperWidthMm);

  // 1. ZATCA QR Code TLV Base64
  let qrBase64 = receipt.zatcaQrBase64;
  if (!qrBase64) {
    const vatStr = (receipt.vatAmountSAR || 0).toFixed(2);
    const totalStr = (receipt.totalSAR || 0).toFixed(2);
    qrBase64 = generateZatcaQR({
      sellerName: receipt.companyName || "مؤسسة الأعمال التجارية",
      sellerVat: receipt.companyVat || "310123456700003",
      timestamp: receipt.issueDateTime || new Date().toISOString(),
      totalWithVat: totalStr,
      vatAmount: vatStr,
    });
  }

  // 2. Open Cash Drawer if enabled
  if (kickDrawerOnPrint) {
    builder.kickDrawer();
  }

  // 3. Header Section
  builder
    .align("center")
    .bold(true)
    .size(2, 2)
    .text(receipt.companyName)
    .size(1, 1)
    .bold(false);

  if (receipt.branchName) {
    builder.text(`فرع: ${receipt.branchName}`);
  }

  builder
    .text(`الرقم الضريبي: ${receipt.companyVat}`)
    .text(`فاتورة ضريبية مبسطة (Simplified Tax Invoice)`)
    .divider("=")
    .align("left");

  // 4. Invoice Metadata
  builder
    .twoColumn("رقم الفاتورة:", receipt.invoiceNumber)
    .twoColumn("التاريخ والتوقيت:", receipt.issueDateTime)
    .twoColumn("طريقة الدفع:", receipt.paymentMethod);

  if (receipt.cashierName) {
    builder.twoColumn("الكاشير:", receipt.cashierName);
  }

  builder.divider("-");

  // 5. Items Table Header
  builder.bold(true).twoColumn("الصنف / الكمية", "الإجمالي (ر.س)").bold(false);
  builder.divider("-");

  // 6. Items
  for (const item of receipt.items) {
    builder.text(item.name);
    builder.twoColumn(
      `  ${item.qty} x ${item.unitPriceSAR.toFixed(2)}`,
      item.totalPriceSAR.toFixed(2)
    );
  }

  builder.divider("=");

  // 7. Totals Summary
  builder
    .twoColumn("المجموع الخالي من الضريبة:", receipt.subtotalSAR.toFixed(2))
    .twoColumn("ضريبة القيمة المضافة (15%):", receipt.vatAmountSAR.toFixed(2))
    .bold(true)
    .size(1, 2)
    .twoColumn("الإجمالي النهائي (شامل الضريبة):", `${receipt.totalSAR.toFixed(2)} SAR`)
    .size(1, 1)
    .bold(false)
    .divider("=");

  // 8. Embedded ZATCA Phase 2 QR Code
  builder
    .align("center")
    .bold(true)
    .text("رمز الاستجابة السريعة (ZATCA QR Code)")
    .bold(false)
    .qrCodeNative(qrBase64, paperWidthMm === 58 ? 5 : 7);

  // 9. Footer Note
  builder.feed(1).align("center");
  if (receipt.footerNote) {
    builder.text(receipt.footerNote);
  } else {
    builder.text("شكراً لتسوقكم معنا - BizOS POS Compliance Engine");
  }

  // 10. Paper Cut
  builder.cut();

  return {
    bytes: builder.getUint8Array(),
    hex: builder.getHex(),
    qrBase64,
  };
}
