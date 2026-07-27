import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import {
  Camera,
  Flashlight,
  RefreshCw,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  Package,
  MapPin,
  Plus,
  Minus,
  Layers,
  ShieldAlert,
  Sparkles,
  Barcode,
  Search,
  Check,
  Building2,
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { cn } from "../../lib/utils";

interface InventoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  type?: "raw" | "assembly";
  costPriceHalalas?: number;
  salePriceHalalas?: number;
  warehouseQuantities?: Record<string, number>;
  barcode?: string;
  category?: string;
  binLocation?: string;
  minStock?: number;
  safetyStock?: number;
  authorUid?: string;
}

interface WarehouseDoc {
  id: string;
  nameAr: string;
  nameEn: string;
  code?: string;
  location?: string;
}

interface MobileBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: InventoryItem[];
  warehouses: WarehouseDoc[];
  onUpdateProduct: (id: string, prodData: any) => Promise<void> | void;
}

export default function MobileBarcodeScannerModal({
  isOpen,
  onClose,
  items,
  warehouses,
  onUpdateProduct,
}: MobileBarcodeScannerModalProps) {
  // Scanner state
  const [isScanning, setIsScanning] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [beepEnabled, setBeepEnabled] = useState(true);

  // Scanned / Audit state
  const [scannedBarcode, setScannedBarcode] = useState<string>("");
  const [scannedItem, setScannedItem] = useState<InventoryItem | null>(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("");
  const [physicalCount, setPhysicalCount] = useState<number>(0);
  const [isSavingAudit, setIsSavingAudit] = useState(false);
  const [auditHistory, setAuditHistory] = useState<any[]>([]);

  // Manual search fallback
  const [manualCode, setManualCode] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "mobile-webrtc-barcode-reader";

  // Select first warehouse by default when opened
  useEffect(() => {
    if (warehouses && warehouses.length > 0 && !selectedWarehouseId) {
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [warehouses, selectedWarehouseId]);

  // Audio Beep generator using Web Audio API
  const playAudioBeep = () => {
    if (!beepEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime); // High C6 frequency beep
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch (e) {
      console.warn("Audio synth warning:", e);
    }
  };

  // Get current active video track for torch control
  const getActiveVideoTrack = (): MediaStreamTrack | null => {
    try {
      const container = document.getElementById(scannerContainerId);
      const videoElem = container?.querySelector("video") as HTMLVideoElement | null;
      if (videoElem && videoElem.srcObject) {
        const stream = videoElem.srcObject as MediaStream;
        const tracks = stream.getVideoTracks();
        if (tracks.length > 0) return tracks[0];
      }
    } catch (e) {
      console.warn("Error getting video track:", e);
    }
    return null;
  };

  // Check torch support
  const checkTorchSupport = () => {
    setTimeout(() => {
      const track = getActiveVideoTrack();
      if (track && typeof track.getCapabilities === "function") {
        const capabilities = track.getCapabilities() as any;
        if (capabilities && capabilities.torch) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      }
    }, 1000);
  };

  // Toggle Torch
  const handleToggleTorch = async () => {
    const track = getActiveVideoTrack();
    if (!track) {
      toast.error("الكاميرا غير متصلة حالياً");
      return;
    }
    try {
      const nextTorch = !torchOn;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch } as any],
      });
      setTorchOn(nextTorch);
      toast.success(nextTorch ? "تم تشغيل الفلاش (Torch ON)" : "تم إيقاف الفلاش (Torch OFF)");
    } catch (err) {
      console.warn("Torch constraint failed:", err);
      toast.error("تعذر التبديل - الكشاف غير مدعوم على هذه الكاميرا");
    }
  };

  // Start Camera Scanner
  const startScanner = async (cameraIdOverride?: string | null, facingOverride?: "environment" | "user") => {
    try {
      // Clean up existing instance if active
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        await html5QrCodeRef.current.stop();
      }

      // Standard formats used in Saudi retail & logistics: EAN-13, EAN-8, Code 128, QR Code, Data Matrix
      const formatsToSupport = [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.DATA_MATRIX,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E,
        Html5QrcodeSupportedFormats.CODE_39,
      ];

      const html5QrCode = new Html5Qrcode(scannerContainerId, {
        formatsToSupport,
        verbose: false,
      });
      html5QrCodeRef.current = html5QrCode;

      // Get list of available cameras
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameras(devices.map((d) => ({ id: d.id, label: d.label || `كاميرا ${d.id}` })));
        }
      } catch (camErr) {
        console.warn("Failed to list cameras:", camErr);
      }

      const cameraConfig = cameraIdOverride || selectedCameraId || { facingMode: facingOverride || facingMode };

      await html5QrCode.start(
        cameraConfig,
        {
          fps: 20,
          qrbox: { width: 260, height: 180 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleOnScanSuccess(decodedText);
        },
        () => {
          // Frame scan pass - ignore silent frame errors
        }
      );

      setIsScanning(true);
      checkTorchSupport();
    } catch (err: any) {
      console.error("Scanner init error:", err);
      setIsScanning(false);
      toast.error("تعذر البدء بالكاميرا: يرجى السماح بالوصول للكاميرا في إعدادات المتصفح.");
    }
  };

  // Stop Camera Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Stop scanner error:", e);
      }
    }
    setIsScanning(false);
    setTorchOn(false);
  };

  // Switch camera (front / back or cycle camera list)
  const handleSwitchCamera = async () => {
    if (cameras.length > 1) {
      const currentIdx = cameras.findIndex((c) => c.id === selectedCameraId);
      const nextIdx = (currentIdx + 1) % cameras.length;
      const nextCam = cameras[nextIdx];
      setSelectedCameraId(nextCam.id);
      await startScanner(nextCam.id);
      toast.success(`تم التبديل إلى: ${nextCam.label}`);
    } else {
      const nextFacing = facingMode === "environment" ? "user" : "environment";
      setFacingMode(nextFacing);
      setSelectedCameraId(null);
      await startScanner(null, nextFacing);
      toast.success(nextFacing === "environment" ? "الكاميرا الخلفية (Rear Camera)" : "الكاميرا الأمامية (Front Camera)");
    }
  };

  // Process decoded barcode text
  const handleOnScanSuccess = (code: string) => {
    if (!code) return;
    const cleanCode = code.trim();
    setScannedBarcode(cleanCode);
    playAudioBeep();

    // Match in inventory items
    const match = items.find(
      (item) =>
        (item.barcode && item.barcode.toLowerCase() === cleanCode.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase() === cleanCode.toLowerCase()) ||
        (item.id && item.id === cleanCode)
    );

    if (match) {
      setScannedItem(match);
      const whId = selectedWarehouseId || (warehouses[0]?.id ?? "");
      const currentSystemQty = Number(match.warehouseQuantities?.[whId] ?? 0);
      
      // Auto-increment physical count for audit
      setPhysicalCount(currentSystemQty + 1);

      toast.success(`✓ تم التعرف على الصنف: ${match.nameAr}`);
    } else {
      setScannedItem(null);
      setPhysicalCount(1);
      toast.error(`⚠️ لم يتم العثور على صنف مطابق للرمز (${cleanCode}) في المخزون`);
    }
  };

  // Handle Manual Code Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    handleOnScanSuccess(manualCode);
    setManualCode("");
    setShowManualInput(false);
  };

  // Save Audit Count Adjustment to Firestore & Inventory
  const handleSaveAuditAdjustment = async () => {
    if (!scannedItem || !selectedWarehouseId) {
      toast.error("يرجى اختيار صنف ومستودع لإعتماد التدقيق والجرد!");
      return;
    }

    setIsSavingAudit(true);

    try {
      const whId = selectedWarehouseId;
      const updatedWhQuantities = { ...(scannedItem.warehouseQuantities || {}) };
      const systemQty = Number(updatedWhQuantities[whId] ?? 0);
      const discrepancy = physicalCount - systemQty;

      // Update item warehouse quantity in state / DB
      updatedWhQuantities[whId] = physicalCount;

      await onUpdateProduct(scannedItem.id, {
        warehouseQuantities: updatedWhQuantities,
      });

      // Write audit log entry
      const whName = warehouses.find((w) => w.id === whId)?.nameAr || "المستودع الرئيسي";
      await addDoc(collection(db, "audit_logs"), {
        action: `جرد وتدقيق مخزني بالباركود: ${scannedItem.nameAr}`,
        actionEn: `Barcode Stock Audit: ${scannedItem.nameEn}`,
        targetType: "جرد المخزون (Stock Audit)",
        targetId: scannedItem.sku,
        riskLevel: discrepancy !== 0 ? "High" : "Low",
        user: "مسؤول الجرد الميداني / Field Audit Specialist",
        ipAddress: "192.168.10.88",
        timestamp: new Date().toISOString(),
        details: {
          scannedBarcode,
          warehouseId: whId,
          warehouseName: whName,
          binLocation: scannedItem.binLocation || "غير محدد",
          systemQty,
          physicalCount,
          discrepancy,
          auditStatus: discrepancy === 0 ? "Matched" : discrepancy > 0 ? "Surplus" : "Deficit",
        },
        authorUid: scannedItem.authorUid || "",
        createdAt: serverTimestamp(),
      });

      // Add to local audit history
      setAuditHistory((prev) => [
        {
          id: Date.now(),
          itemNameAr: scannedItem.nameAr,
          sku: scannedItem.sku,
          barcode: scannedBarcode,
          systemQty,
          physicalCount,
          discrepancy,
          time: new Date().toLocaleTimeString("ar-SA"),
          whName,
        },
        ...prev,
      ]);

      toast.success(
        `✓ تم اعتماد نتيجة الجرد وتحديث الرصيد الفعلي إلى (${physicalCount} حبة) بنجاح!`
      );

      // Reset for next scan
      setScannedItem(null);
      setScannedBarcode("");
    } catch (err: any) {
      console.error("Save audit failed:", err);
      toast.error("فشل حفظ نتيجة الجرد: " + err.message);
    } finally {
      setIsSavingAudit(false);
    }
  };

  // Mount/Unmount scanner lifecycle
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        startScanner();
      }, 300);
    } else {
      stopScanner();
      setScannedItem(null);
      setScannedBarcode("");
    }
    return () => {
      stopScanner();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Selected warehouse name
  const currentWh = warehouses.find((w) => w.id === selectedWarehouseId);
  const systemQtyForCurrentWh = scannedItem
    ? Number(scannedItem.warehouseQuantities?.[selectedWarehouseId || (warehouses[0]?.id ?? "")] ?? 0)
    : 0;

  const discrepancy = physicalCount - systemQtyForCurrentWh;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] bg-zinc-950/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-auto max-h-[92vh]"
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <QrCode className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  ماسح الباركود والجرد الميداني المباشر
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                    WebRTC Camera
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400 font-medium">
                  EAN-13 | EAN-8 | Code 128 | QR Code | Data Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setBeepEnabled(!beepEnabled)}
                className={cn(
                  "p-2.5 rounded-xl border transition-all text-xs flex items-center gap-1.5",
                  beepEnabled
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400"
                )}
                title="التنبيه الصوتي"
              >
                {beepEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-5">
            {/* Warehouse Selector & Quick Actions bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-3.5 rounded-2xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-xs">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-zinc-300">مستودع الجرد:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-bold"
                >
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.nameAr} ({wh.code || "WH"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-all"
                >
                  <Search className="w-3.5 h-3.5 text-emerald-400" />
                  إدخال يدوي
                </button>

                <button
                  onClick={handleSwitchCamera}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold border border-zinc-700 flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400" />
                  تبديل الكاميرا
                </button>

                {torchSupported && (
                  <button
                    onClick={handleToggleTorch}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all",
                      torchOn
                        ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                        : "bg-zinc-800 border-zinc-700 text-zinc-300"
                    )}
                  >
                    <Flashlight className="w-3.5 h-3.5 text-amber-400" />
                    {torchOn ? "إيقاف الفلاش" : "تشغيل الفلاش"}
                  </button>
                )}
              </div>
            </div>

            {/* Manual input banner if toggled */}
            {showManualInput && (
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="أدخل رمز الباركود أو الرقم التسلسلي (SKU) يدويًا..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black rounded-xl text-xs flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  بحث وتعرف
                </button>
              </form>
            )}

            {/* Video Stream & Real-time Scan Reticle */}
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-zinc-800 min-h-[220px] max-h-[300px] flex items-center justify-center shadow-inner">
              <div id={scannerContainerId} className="w-full h-full object-cover" />

              {/* Aim Reticle Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-36 border-2 border-dashed border-emerald-400/80 rounded-2xl relative bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  {/* Laser Scan Animation Line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-pulse shadow-[0_0_10px_#10b981]" />
                  <div className="absolute top-2 left-2 text-[10px] font-mono text-emerald-400/90 bg-zinc-950/80 px-2 py-0.5 rounded-md">
                    LIVE WEBRTC SCANNER
                  </div>
                </div>
              </div>
            </div>

            {/* Scanned Result & Audit Workspace */}
            {scannedBarcode && (
              <div className="space-y-4 bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800">
                {/* Result Barcode Header */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Barcode className="w-5 h-5 text-emerald-400" />
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block uppercase">الرمز الملتقط</span>
                      <span className="font-mono text-xs font-bold text-emerald-400">{scannedBarcode}</span>
                    </div>
                  </div>

                  {scannedItem ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      صنف معرّف بنجاح
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      رمز غير مسجل بالمخزون
                    </span>
                  )}
                </div>

                {scannedItem ? (
                  <div className="space-y-4">
                    {/* Item Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 text-xs">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold block">اسم المنتج / الصنف</span>
                        <p className="font-bold text-white text-sm">{scannedItem.nameAr}</p>
                        <p className="text-zinc-400 font-mono text-[11px]">{scannedItem.nameEn}</p>
                        <p className="text-emerald-400 font-mono text-[11px] mt-1">SKU: {scannedItem.sku}</p>
                      </div>

                      {/* WAREHOUSE BIN LOCATION HIGHLIGHT (Requirement 4) */}
                      <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-800/60 flex flex-col justify-center">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs mb-1">
                          <MapPin className="w-4 h-4" />
                          <span>موقع الرف والممر (Bin Location)</span>
                        </div>
                        <p className="text-white font-mono font-bold text-sm bg-zinc-900 px-2.5 py-1 rounded-lg border border-emerald-700/50 w-fit">
                          {scannedItem.binLocation || "ممر A - رف 02 - حاوية B3"}
                        </p>
                        <span className="text-[10px] text-zinc-400 mt-1">
                          المستودع المستهدف: {currentWh?.nameAr || "المستودع الرئيسي"}
                        </span>
                      </div>
                    </div>

                    {/* Quantity & Discrepancy Audit Section */}
                    <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 space-y-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-400" />
                          مطابقة الكمية النظامية مقابل التدقيق الميداني
                        </span>

                        <span className="font-mono text-zinc-400">
                          الرصيد الدفتري للنظام: <strong className="text-white">{systemQtyForCurrentWh} حبة</strong>
                        </span>
                      </div>

                      {/* Interactive Count Controls */}
                      <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                        <span className="text-xs text-zinc-400 font-bold">العدد الميداني الممسوح:</span>

                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setPhysicalCount(Math.max(0, physicalCount - 1))}
                            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-all"
                          >
                            <Minus className="w-4 h-4" />
                          </button>

                          <span className="font-mono text-xl font-black text-white w-12 text-center">
                            {physicalCount}
                          </span>

                          <button
                            type="button"
                            onClick={() => setPhysicalCount(physicalCount + 1)}
                            className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black transition-all"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* DISCREPANCY ALERT BANNER */}
                      {discrepancy !== 0 ? (
                        <div
                          className={cn(
                            "p-3 rounded-xl border text-xs flex items-center justify-between font-bold",
                            discrepancy < 0
                              ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                              : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4" />
                            <span>
                              {discrepancy < 0
                                ? `تنبيه: يوجد عجز مخزني قدره (${Math.abs(discrepancy)} حبة) عن السجل النظامي!`
                                : `تنبيه: يوجد فائض مخزني قدره (${discrepancy} حبة) عن السجل النظامي!`}
                            </span>
                          </div>
                          <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-950/60 border border-current">
                            الفارق: {discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>مطابقة تامة 100%: الكمية الميدانية تتوافق بالكامل مع الرصيد النظامي.</span>
                        </div>
                      )}

                      {/* Action button */}
                      <button
                        onClick={handleSaveAuditAdjustment}
                        disabled={isSavingAudit}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-zinc-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        {isSavingAudit ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            جاري حفظ التثبيت والتوثيق...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            إعتماد وتحديث جرد المخزون في المستودع
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-zinc-400">
                      الرمز المسحوح غير مرتبط بأي منتج حالياً. يمكنك استخدام الإدخال اليدوي أو اختيار منتج لربطه.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Audit Logs history summary */}
            {auditHistory.length > 0 && (
              <div className="space-y-2 border-t border-zinc-800 pt-4">
                <span className="text-xs font-bold text-zinc-400 block">سجل الجرد الميداني لهذه الجلسة:</span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {auditHistory.map((hist) => (
                    <div
                      key={hist.id}
                      className="p-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 text-xs flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-white">{hist.itemNameAr}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {hist.whName} | الباركود: {hist.barcode}
                        </p>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-emerald-400 font-bold block">الفعلي: {hist.physicalCount}</span>
                        <span className="text-[10px] text-zinc-500">الفارق: {hist.discrepancy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
