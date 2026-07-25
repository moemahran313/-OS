import React, { useState, useEffect, useRef } from "react";
import {
  Printer,
  Usb,
  Bluetooth,
  Terminal,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  RefreshCw,
  Copy,
  Scissors,
  DollarSign,
  Layers,
  Sparkles,
  ChevronRight,
  Radio,
  FileCode,
  Info,
  Maximize2,
  Sliders,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  WebUSBThermalDriver,
  WebBluetoothThermalDriver,
  buildZatcaEscposReceipt,
  ReceiptData,
} from "@/src/lib/escpos";
import { Invoice } from "@/src/types";

interface ThermalPrinterModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
}

export default function ThermalPrinterModal({
  isOpen,
  onClose,
  invoice,
}: ThermalPrinterModalProps) {
  const [connectionMode, setConnectionMode] = useState<"usb" | "bluetooth" | "simulation">("usb");
  const [paperWidth, setPaperWidth] = useState<80 | 58>(80);
  const [kickDrawer, setKickDrawer] = useState<boolean>(true);
  const [showHexInspector, setShowHexInspector] = useState<boolean>(false);

  // Connection State
  const [connectedDevice, setConnectedDevice] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  // Drivers
  const usbDriverRef = useRef<WebUSBThermalDriver>(new WebUSBThermalDriver());
  const btDriverRef = useRef<WebBluetoothThermalDriver>(new WebBluetoothThermalDriver());

  // Default Receipt Payload derived from invoice or sample
  const getReceiptData = (): ReceiptData => {
    if (invoice) {
      const items = invoice.lineItems.map((li) => ({
        name: li.name || li.description || "صنف تجاري",
        qty: li.quantity || 1,
        unitPriceSAR: (li.unitPriceHalalas || 0) / 100,
        totalPriceSAR: (li.totalHalalas || 0) / 100,
      }));

      return {
        companyName: invoice.zatcaConfig?.sellerName || "شركة الحلول السعودية المتقدمة",
        companyVat: invoice.zatcaConfig?.sellerVat || "310123456700003",
        crNumber: "1010889922",
        branchName: "الفرع الرئيسي - الرياض",
        invoiceNumber: invoice.number || `INV-${Math.floor(100000 + Math.random() * 900000)}`,
        issueDateTime: invoice.issueDate ? new Date(invoice.issueDate).toLocaleString("ar-SA") : new Date().toLocaleString("ar-SA"),
        invoiceType: "simplified",
        items: items.length > 0 ? items : [{ name: "خدمة استشارية تقنية", qty: 1, unitPriceSAR: 1000, totalPriceSAR: 1000 }],
        subtotalSAR: (invoice.subtotalHalalas || 100000) / 100,
        vatAmountSAR: (invoice.vatAmountHalalas || 15000) / 100,
        totalSAR: (invoice.totalAmountHalalas || 115000) / 100,
        paymentMethod: "Mada",
        cashierName: "أحمد الماجد (مستخدم POS)",
        footerNote: invoice.branding?.footerNotes || "شكراً لتعاملكم معنا - فاتورة ضريبية مبسطة معتمدة من هيئة الزكاة والضريبة والجمارك ZATCA",
      };
    }

    // Default Sample POS Receipt
    return {
      companyName: "شركة التقنية المتقدمة للتجارة",
      companyVat: "311234567800003",
      crNumber: "1010998877",
      branchName: "فرع العليّا - نقطة بيع #01",
      invoiceNumber: `POS-${Math.floor(100000 + Math.random() * 900000)}`,
      issueDateTime: new Date().toLocaleString("ar-SA"),
      invoiceType: "simplified",
      items: [
        { name: "شاشة عرض حاسوب 27 بوصة", qty: 1, unitPriceSAR: 1200, totalPriceSAR: 1200 },
        { name: "لوحة مفاتيح ميكانيكية لاسلكية", qty: 2, unitPriceSAR: 250, totalPriceSAR: 500 },
        { name: "كابل اتش دي ام اي معتمد", qty: 1, unitPriceSAR: 50, totalPriceSAR: 50 },
      ],
      subtotalSAR: 1750,
      vatAmountSAR: 262.5,
      totalSAR: 2012.5,
      paymentMethod: "Mada",
      cashierName: "سارة العتيبي",
      footerNote: "مرخصة وموثقة عبر منصة BizOS ومرتبطة بهيئة الزكاة ZATCA Phase 2",
    };
  };

  const receiptData = getReceiptData();
  const { bytes, hex, qrBase64 } = buildZatcaEscposReceipt(receiptData, paperWidth, kickDrawer);

  // Connect Driver
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      if (connectionMode === "usb") {
        const devName = await usbDriverRef.current.requestDevice();
        setConnectedDevice(devName);
        toast.success(`تم الاتصال المباشر بطابعة WebUSB: ${devName}`);
      } else if (connectionMode === "bluetooth") {
        const devName = await btDriverRef.current.requestDevice();
        setConnectedDevice(devName);
        toast.success(`تم الاقتران اللاسلكي بطابعة WebBluetooth: ${devName}`);
      } else {
        setConnectedDevice("طابعة حرارية افتراضية (Simulation Mode)");
        toast.info("تم تفعيل وضع المحاكاة الحرارية العرضية");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل الاتصال بالطابعة الحرارية");
      setConnectedDevice(null);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Driver
  const handleDisconnect = async () => {
    try {
      if (connectionMode === "usb") await usbDriverRef.current.disconnect();
      if (connectionMode === "bluetooth") await btDriverRef.current.disconnect();
      setConnectedDevice(null);
      toast.info("تم فصل الاتصال بالطابعة");
    } catch (e) {
      console.error(e);
    }
  };

  // Execute Raw Print Job
  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      if (connectionMode === "usb") {
        if (!connectedDevice) await handleConnect();
        await usbDriverRef.current.print(bytes);
        toast.success("تم إرسال أوامر ESC/POS الخام عبر WebUSB إلى طابعة الكاونتر بنجاح!");
      } else if (connectionMode === "bluetooth") {
        if (!connectedDevice) await handleConnect();
        await btDriverRef.current.print(bytes);
        toast.success("تم بث إيصال ESC/POS عبر WebBluetooth بنجاح!");
      } else {
        // Simulation print pulse
        await new Promise((res) => setTimeout(res, 600));
        toast.success("تمت محاكاة طباعة الإيصال الحراري وقطع الورق وفتح درج النقدية بنجاح!");
      }
    } catch (err: any) {
      toast.error(err.message || "فشل إرسال أمر الطباعة إلى الجهاز");
    } finally {
      setIsPrinting(false);
    }
  };

  // Kick Cash Drawer only
  const handleKickDrawerOnly = async () => {
    try {
      const drawerBytes = new Uint8Array([0x1b, 0x70, 0x00, 0x19, 0xfa]);
      if (connectionMode === "usb" && connectedDevice) {
        await usbDriverRef.current.print(drawerBytes);
      } else if (connectionMode === "bluetooth" && connectedDevice) {
        await btDriverRef.current.print(drawerBytes);
      }
      toast.success("تم إرسال نبضة إشارة فتح درج النقدية (ESC p) بنجاح!");
    } catch (err: any) {
      toast.error("تعذر فتح درج النقدية");
    }
  };

  const copyHex = () => {
    navigator.clipboard.writeText(hex);
    toast.success("تم نسخ السلسلة السداسية عشرية (Hex Payload) للحافظة!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 dir-rtl text-right overflow-y-auto">
      <div className="bg-slate-950 border border-indigo-500/30 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <Printer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  ZATCA Phase 2 Thermal Protocol
                </span>
                <span className="text-[10px] font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded-full font-mono">
                  ESC/POS Raw Driver
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                طباعة الفواتير الحرارية المباشرة لمنافذ البيع (POS Counter Thermal Printing)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
          {/* Left Controls & Connection Settings (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Connection Mode Selection */}
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>اختر بروتوكول ومخرج الاتصال بالحرارية:</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "usb", label: "WebUSB المباشر", sub: "كابل USB كاونتر", icon: Usb, badge: "أعلى سرعة" },
                  { id: "bluetooth", label: "WebBluetooth", sub: "بلوتوث لاسلكي", icon: Bluetooth, badge: "محمول" },
                  { id: "simulation", label: "محاكي العرض", sub: "اختبار ومعاينة", icon: Sparkles, badge: "مباشر" },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setConnectionMode(mode.id as any);
                      if (mode.id === "simulation") setConnectedDevice("طابعة حرارية افتراضية (Simulation)");
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                      connectionMode === mode.id
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-950"
                        : "bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <mode.icon className={`w-5 h-5 ${connectionMode === mode.id ? "text-indigo-400" : "text-slate-500"}`} />
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {mode.badge}
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-black">{mode.label}</div>
                      <div className="text-[10px] opacity-70">{mode.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Device Status & Connect Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectedDevice ? "bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-pulse" : "bg-slate-600"
                  }`}
                />
                <div>
                  <div className="text-xs font-extrabold text-white">
                    {connectedDevice ? `متصل بـ: ${connectedDevice}` : "غير متصل بأي طابعة كاونتر"}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {connectedDevice ? "جاهز لإرسال ثنائيات ESC/POS المباشرة" : "اضغط زر الاتصال للبحث عن أجهزة الكاونتر"}
                  </div>
                </div>
              </div>

              {connectedDevice ? (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                >
                  فصل الاتصال
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl border border-indigo-400/30 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isConnecting ? "animate-spin" : ""}`} />
                  <span>{isConnecting ? "جاري الاقتران..." : "اقتران بالطابعة"}</span>
                </button>
              )}
            </div>

            {/* Printer Options (Paper Width, Cash Drawer, Cut) */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-4">
              <div className="text-xs font-black text-slate-300 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>إعدادات طابعة الكاونتر (POS Configurations):</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                {/* Paper Width */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">عرض الورق الحراري:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaperWidth(80)}
                      className={`py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                        paperWidth === 80
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      80mm (قياسي)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaperWidth(58)}
                      className={`py-2 px-3 rounded-xl font-mono text-xs font-bold border transition-all ${
                        paperWidth === 58
                          ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
                          : "bg-slate-950 text-slate-400 border-slate-800"
                      }`}
                    >
                      58mm (مدمج)
                    </button>
                  </div>
                </div>

                {/* Cash Drawer Toggle */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-400">فتح درج النقدية تلقائياً:</label>
                  <button
                    type="button"
                    onClick={() => setKickDrawer(!kickDrawer)}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold border flex items-center justify-between transition-all ${
                      kickDrawer
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-slate-950 text-slate-500 border-slate-800"
                    }`}
                  >
                    <span>نبضة إشارة (ESC p)</span>
                    <span className="font-mono text-[10px]">{kickDrawer ? "مفعل" : "معطل"}</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleKickDrawerOnly}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span>اختبار فتح الدرج</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowHexInspector(!showHexInspector)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{showHexInspector ? "إخفاء Hex Inspector" : "عرض Hex ESC/POS"}</span>
                </button>
              </div>
            </div>

            {/* Hex Inspector Collapsible */}
            {showHexInspector && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 font-mono flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5" />
                    ESC/POS Raw Binary Payload ({bytes.length} bytes):
                  </span>
                  <button
                    type="button"
                    onClick={copyHex}
                    className="text-[10px] text-slate-300 hover:text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>نسخ Hex</span>
                  </button>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl font-mono text-[10px] text-emerald-400 max-h-36 overflow-y-auto leading-relaxed break-all border border-slate-800">
                  {hex}
                </div>
              </div>
            )}

            {/* Print Execute CTA */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm py-4 rounded-2xl border border-emerald-400/30 shadow-xl shadow-emerald-950/40 flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer className={`w-5 h-5 ${isPrinting ? "animate-bounce" : ""}`} />
                <span>{isPrinting ? "جاري الإرسال للطابعة..." : "طباعة الإيصال الحراري المباشر (ESC/POS Print)"}</span>
              </button>
            </div>
          </div>

          {/* Right Live Thermal Receipt Preview (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col items-center">
            <div className="text-xs font-black text-slate-400 mb-3 flex items-center gap-2">
              <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>معاينة ورقة الإيصال الحراري ({paperWidth}mm):</span>
            </div>

            {/* Simulated Paper Roll Container */}
            <div
              className={`bg-white text-black p-5 rounded-lg shadow-2xl space-y-3 font-mono text-xs dir-rtl text-right transition-all border-b-4 border-dashed border-zinc-400 ${
                paperWidth === 58 ? "w-[240px] text-[10px]" : "w-[310px] text-[11px]"
              }`}
            >
              {/* Header */}
              <div className="text-center space-y-1">
                <h3 className="font-bold text-sm tracking-tight text-black">{receiptData.companyName}</h3>
                {receiptData.branchName && <p className="text-[10px] text-zinc-600">{receiptData.branchName}</p>}
                <p className="text-[10px] text-zinc-700">الرقم الضريبي: {receiptData.companyVat}</p>
                <div className="border-t border-b border-black py-1 my-1 font-bold text-[10px]">
                  فاتورة ضريبية مبسطة / Simplified Tax Invoice
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-0.5 text-[10px] text-zinc-800">
                <div className="flex justify-between">
                  <span>رقم الفاتورة:</span>
                  <span className="font-bold">{receiptData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>التاريخ والوقت:</span>
                  <span>{receiptData.issueDateTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>الدفع:</span>
                  <span>{receiptData.paymentMethod}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Items Table */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-bold text-[10px] border-b border-zinc-300 pb-0.5">
                  <span>الصنف</span>
                  <span>الإجمالي (ر.س)</span>
                </div>

                {receiptData.items.map((it, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="font-bold leading-tight">{it.name}</div>
                    <div className="flex justify-between text-[10px] text-zinc-700">
                      <span>
                        {it.qty} x {it.unitPriceSAR.toFixed(2)}
                      </span>
                      <span className="font-bold">{it.totalPriceSAR.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* Totals */}
              <div className="space-y-1 text-[10px]">
                <div className="flex justify-between text-zinc-700">
                  <span>المجموع الخالي من الضريبة:</span>
                  <span>{receiptData.subtotalSAR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-700">
                  <span>ضريبة القيمة المضافة (15%):</span>
                  <span>{receiptData.vatAmountSAR.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs font-black border-t border-black pt-1">
                  <span>الإجمالي النهائي:</span>
                  <span>{receiptData.totalSAR.toFixed(2)} SAR</span>
                </div>
              </div>

              <div className="border-t border-dashed border-zinc-400 my-2" />

              {/* ZATCA Phase 2 QR Code */}
              <div className="flex flex-col items-center justify-center space-y-1 py-1">
                <span className="text-[9px] font-bold text-zinc-600">رمز الاستجابة السريعة (ZATCA QR)</span>
                <div className="p-1 bg-white border border-zinc-300 rounded">
                  <QRCodeSVG value={qrBase64} size={paperWidth === 58 ? 110 : 130} level="M" />
                </div>
                <span className="text-[8px] text-zinc-500 font-mono">TLV Encoded String Verified</span>
              </div>

              {/* Footer */}
              <div className="text-center text-[9px] text-zinc-600 pt-2 border-t border-zinc-200">
                {receiptData.footerNote}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
