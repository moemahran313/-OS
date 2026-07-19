import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Barcode,
  Bell,
  AlertTriangle,
  Check,
  RotateCw,
  Search,
  Printer,
  Plus,
  Warehouse,
  Sliders,
  ShieldAlert,
  Send,
  Volume2,
  Camera,
  Layers,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../lib/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { cn } from "../../lib/utils";

interface BarcodeAndAlertsModuleProps {
  items: any[];
  warehouses: any[];
  onUpdateProduct: (id: string, prodData: any) => void;
}

export default function BarcodeAndAlertsModule({
  items,
  warehouses,
  onUpdateProduct
}: BarcodeAndAlertsModuleProps) {
  // Barcode Scanner states
  const [barcodeInput, setBarcodeInput] = useState("");
  const [scannedItem, setScannedItem] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [audioBeep, setAudioBeep] = useState(true);

  // Quick Adjustment states
  const [quickQtyChange, setQuickQtyChange] = useState<number>(0);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);

  // Alert Rules & Thresholds
  const [selectedAlertItem, setSelectedAlertItem] = useState<string>("");
  const [customMinStock, setCustomMinStock] = useState<number>(10);
  const [customSafetyStock, setCustomSafetyStock] = useState<number>(5);
  const [selectedWhRule, setSelectedWhRule] = useState<string>("all");
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [activeRules, setActiveRules] = useState<any[]>([
    {
      id: "rule-1",
      itemTitle: "كرسي طبي مريح - هيرمان ميلر",
      minStock: 8,
      safetyStock: 3,
      warehouseName: "المستودع الرئيسي - الرياض",
      channels: ["system", "email"],
      isActive: true,
    },
    {
      id: "rule-2",
      itemTitle: "شاشة ألعاب منحنية 34 بوصة",
      minStock: 15,
      safetyStock: 5,
      warehouseName: "كافة المستودعات",
      channels: ["system", "sms", "email"],
      isActive: true,
    }
  ]);

  // Audio Beep Player Helper
  const playBeep = () => {
    if (!audioBeep) return;
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(1046.50, context.currentTime); // C6 note
      gainNode.gain.setValueAtTime(0.15, context.currentTime);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    } catch (e) {
      console.warn("Audio Context failed to boot:", e);
    }
  };

  // Generate Low Stock exceptions automatically on mount/items change
  const stockAlerts = useMemo(() => {
    const alerts: any[] = [];
    items.forEach((item) => {
      // Calculate total stock
      let totalStock = 0;
      const whStockMap = item.warehouseQuantities || {};
      Object.values(whStockMap).forEach((q: any) => {
        totalStock += Number(q || 0);
      });

      const minS = item.minStock || 10;
      const safetyS = item.safetyStock || 4;

      if (totalStock <= safetyS) {
        alerts.push({
          item,
          totalStock,
          severity: "critical",
          label: "مخزون حرج للغاية (عجز)",
          labelEn: "Critical Safety Stock Deficit",
          minS,
          safetyS,
        });
      } else if (totalStock <= minS) {
        alerts.push({
          item,
          totalStock,
          severity: "warning",
          label: "تحت الحد الأدنى (تنبيه)",
          labelEn: "Below Minimum Threshold",
          minS,
          safetyS,
        });
      }
    });
    return alerts;
  }, [items]);

  // Sync default alert logs
  useEffect(() => {
    if (stockAlerts.length > 0 && alertLogs.length === 0) {
      const initialLogs = stockAlerts.map((alt, idx) => ({
        id: `alert-${idx}`,
        time: new Date(Date.now() - idx * 1800000).toLocaleTimeString("ar-SA"),
        itemNameAr: alt.item.nameAr,
        itemNameEn: alt.item.nameEn,
        message: `الرصيد الكلي الحالي هو ${alt.totalStock} حبة، وهو أقل من الحد الآمن المحدد (${alt.safetyS} حبات).`,
        severity: alt.severity,
      }));
      setAlertLogs(initialLogs);
    }
  }, [stockAlerts]);

  // Handle direct scan simulation
  const handleSimulateScan = (codeToScan?: string) => {
    const finalBarcode = codeToScan || barcodeInput;
    if (!finalBarcode) {
      toast.error("يرجى كتابة رمز الباركود أو تحديد منتج تجريبي للمحاكاة!");
      return;
    }

    setIsScanning(true);
    setTimeout(() => {
      const match = items.find(
        (item) => item.barcode === finalBarcode || item.sku === finalBarcode
      );

      setIsScanning(false);
      if (match) {
        playBeep();
        setScannedItem(match);
        setQuickQtyChange(0);
        
        // Find first available warehouse key
        if (warehouses.length > 0) {
          setSelectedWarehouseId(warehouses[0].id);
        }

        // Add to scan history
        setScanHistory((prev) => [
          {
            id: Date.now(),
            itemNameAr: match.nameAr,
            itemNameEn: match.nameEn,
            barcode: finalBarcode,
            time: new Date().toLocaleTimeString("ar-SA"),
            success: true,
          },
          ...prev.slice(0, 9),
        ]);
        toast.success(`✓ تم التعرف بنجاح على الصنف: ${match.nameAr}`);
      } else {
        setScanHistory((prev) => [
          {
            id: Date.now(),
            itemNameAr: "صنف غير معروف",
            itemNameEn: "Unknown Barcode",
            barcode: finalBarcode,
            time: new Date().toLocaleTimeString("ar-SA"),
            success: false,
          },
          ...prev.slice(0, 9),
        ]);
        toast.error(`❌ لم يتم العثور على أي منتج يطابق الباركود: ${finalBarcode}`);
      }
    }, 1000);
  };

  // Quick Stock Adjustment Update via Barcode Scanner Screen
  const handleQuickStockSave = async () => {
    if (!scannedItem || !selectedWarehouseId) return;
    setIsUpdatingStock(true);

    try {
      const currentWhQuantities = { ...(scannedItem.warehouseQuantities || {}) };
      const previousQty = Number(currentWhQuantities[selectedWarehouseId] || 0);
      const newQty = Math.max(0, previousQty + quickQtyChange);

      currentWhQuantities[selectedWarehouseId] = newQty;

      // Call the main update callback
      await onUpdateProduct(scannedItem.id, {
        warehouseQuantities: currentWhQuantities,
      });

      // Update scanned item in local view
      setScannedItem((prev: any) => ({
        ...prev,
        warehouseQuantities: currentWhQuantities,
      }));

      // Add audit log
      await addDoc(collection(db, "audit_logs"), {
        action: `تحديث سريع للكمية عبر الباركود: ${scannedItem.nameAr}`,
        actionEn: `Quick Stock Adjust via Barcode: ${scannedItem.nameEn}`,
        targetType: "المستودعات والمخزون",
        targetId: scannedItem.sku,
        riskLevel: "Medium",
        user: "امين المستودع / Warehouse Officer",
        ipAddress: "192.168.12.55",
        timestamp: new Date().toISOString(),
        details: {
          scannedBarcode: scannedItem.barcode || scannedItem.sku,
          warehouseId: selectedWarehouseId,
          qtyAdjusted: quickQtyChange,
          oldQty: previousQty,
          newQty: newQty,
        },
        authorUid: scannedItem.authorUid,
        createdAt: serverTimestamp(),
      });

      toast.success("✓ تم تحديث الكمية وتوثيق العملية في سجل التدقيق المالي!");
      setQuickQtyChange(0);
    } catch (e: any) {
      toast.error("فشل تعديل المخزون: " + e.message);
    } finally {
      setIsUpdatingStock(false);
    }
  };

  // Add custom alert rule
  const handleAddAlertRule = () => {
    if (!selectedAlertItem) {
      toast.error("يرجى اختيار المنتج المستهدف أولاً!");
      return;
    }

    const itemMatch = items.find((i) => i.id === selectedAlertItem);
    if (!itemMatch) return;

    const targetWh = warehouses.find((w) => w.id === selectedWhRule);
    const whName = targetWh ? targetWh.nameAr : "كافة المستودعات";

    const newRule = {
      id: `rule-${Date.now()}`,
      itemTitle: itemMatch.nameAr,
      minStock: customMinStock,
      safetyStock: customSafetyStock,
      warehouseName: whName,
      channels: ["system", "email"],
      isActive: true,
    };

    setActiveRules((prev) => [newRule, ...prev]);
    toast.success("✓ تم تفعيل قاعدة التنبيه الذكية وربطها بنظام الإشعارات بنجاح!");
    setSelectedAlertItem("");
  };

  // Trigger Bulk Restock Purchase Order generator for all low stock items
  const handleBulkRestock = async () => {
    if (stockAlerts.length === 0) {
      toast.success("كافة الأصناف مخزنة بمستويات ممتازة ولا تحتاج لإعادة طلب!");
      return;
    }

    try {
      const restockRef = await addDoc(collection(db, "purchase_requisitions"), {
        requisitionNumber: `PR-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split("T")[0],
        status: "Draft",
        origin: "Auto Threshold Guard",
        itemsCount: stockAlerts.length,
        items: stockAlerts.map((alt) => ({
          itemId: alt.item.id,
          sku: alt.item.sku,
          nameAr: alt.item.nameAr,
          nameEn: alt.item.nameEn,
          currentStock: alt.totalStock,
          targetRestock: (alt.minS * 2) - alt.totalStock, // Restock up to double minStock
        })),
        authorUid: items[0]?.authorUid || "",
        createdAt: serverTimestamp(),
      });

      toast.success(`✓ تم إنشاء مسودة طلب شراء مالي رقم ${restockRef.id.slice(0, 5)} لتغطية كافة المواد الناقصة!`);
    } catch (e: any) {
      toast.error("فشل إنشاء طلب الشراء التلقائي: " + e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-right">
      
      {/* LEFT: Barcode Scanning Simulator & Interface (5 columns) */}
      <div className="lg:col-span-5 space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div className="flex items-center gap-1.5 text-zinc-500">
              <button
                type="button"
                onClick={() => setAudioBeep(!audioBeep)}
                className={cn(
                  "p-1.5 rounded-lg border transition-all text-xs flex items-center gap-1 cursor-pointer",
                  audioBeep 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-zinc-100 border-zinc-200 text-zinc-400"
                )}
                title="تفعيل نغمة البيب للمسح"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{audioBeep ? "صوت مفعّل" : "صامت"}</span>
              </button>
            </div>
            <div className="flex items-center gap-2">
              <Barcode className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                محاكاة ماسح الباركود والـ RFID
              </h3>
            </div>
          </div>

          {/* Realistic Camera Frame Mock with animated scanning line */}
          <div className="relative aspect-video rounded-2xl bg-zinc-950 overflow-hidden flex flex-col items-center justify-center text-center p-4 border border-zinc-800 shadow-inner group">
            <div className="absolute inset-4 border border-dashed border-indigo-500/40 rounded-xl pointer-events-none" />
            
            {/* Holographic Target brackets */}
            <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-indigo-500 rounded-tr" />
            <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-indigo-500 rounded-tl" />
            <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-indigo-500 rounded-br" />
            <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-indigo-500 rounded-bl" />

            {/* Scanning Laser Animation */}
            {isScanning && (
              <motion.div
                initial={{ top: "10%" }}
                animate={{ top: "90%" }}
                transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                className="absolute left-4 right-4 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] z-10 pointer-events-none"
              />
            )}

            <div className="z-10 space-y-2">
              {isScanning ? (
                <div className="text-white space-y-1">
                  <Camera className="w-8 h-8 mx-auto text-indigo-400 animate-pulse" />
                  <p className="text-xs font-bold animate-pulse">جاري فك تشفير الباركود وقراءة الحقول...</p>
                </div>
              ) : (
                <div className="text-zinc-500 space-y-1">
                  <Barcode className="w-10 h-10 mx-auto text-zinc-600 group-hover:scale-110 transition-transform duration-300" />
                  <p className="text-xs font-extrabold text-zinc-400">وجه الكاميرا أو اختر باركود جاهز أدناه</p>
                  <p className="text-[10px] text-zinc-600 font-mono">SUPPORTED: EAN-13, RFID, UPC, Code128</p>
                </div>
              )}
            </div>

            {/* Ambient matrix glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_100%)] pointer-events-none" />
          </div>

          {/* Quick Select Barcodes of Existing Products */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-zinc-450 block">
              أصناف متوفرة في النظام (انقر للمحاكاة الفورية للباركود):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {items.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setBarcodeInput(item.barcode || item.sku);
                    handleSimulateScan(item.barcode || item.sku);
                  }}
                  className="text-[10px] bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-lg font-mono text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-all"
                >
                  <Barcode className="w-3 h-3 text-zinc-400" />
                  <span>{item.nameAr.slice(0, 16)}...</span>
                  <span className="text-[9px] text-indigo-500">({item.barcode || item.sku})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual input for scanning */}
          <div className="flex gap-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="اكتب الباركود أو SKU يدويًا..."
              className="flex-1 text-xs py-2.5 px-3 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-left font-mono"
            />
            <button
              onClick={() => handleSimulateScan()}
              disabled={isScanning}
              className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Search className="w-3.5 h-3.5" />
              )}
              مسح
            </button>
          </div>

          {/* Active scanned product info card */}
          <AnimatePresence mode="wait">
            {scannedItem && (
              <motion.div
                key={scannedItem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-indigo-50/40 dark:bg-zinc-800/40 border border-indigo-100 dark:border-zinc-800 rounded-2xl p-4 space-y-3 text-right"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[9px] font-mono bg-indigo-100 dark:bg-zinc-800 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-zinc-700">
                    SKU: {scannedItem.sku}
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                      {scannedItem.nameAr}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-mono" dir="ltr">
                      {scannedItem.nameEn}
                    </p>
                  </div>
                </div>

                {/* Warehouse breakdown */}
                <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-indigo-50 dark:border-zinc-800 text-xs space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 block border-b border-zinc-100 dark:border-zinc-800 pb-1">
                    الأرصدة الحالية في المستودعات:
                  </span>
                  {warehouses.map((wh) => {
                    const qty = scannedItem.warehouseQuantities?.[wh.id] || 0;
                    return (
                      <div key={wh.id} className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500 font-bold">{wh.nameAr}:</span>
                        <span className={cn(
                          "font-mono font-black",
                          qty === 0 ? "text-rose-500" : "text-zinc-800 dark:text-zinc-200"
                        )}>
                          {qty} {scannedItem.unit || "حبة"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Direct quick stock update tools */}
                <div className="space-y-2 border-t border-indigo-100 dark:border-zinc-800 pt-2.5">
                  <span className="text-[10px] font-black text-zinc-450 block">
                    إجراء تسوية سريعة للكمية (Quick Stock Correction):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5">المستودع المستهدف</label>
                      <select
                        value={selectedWarehouseId}
                        onChange={(e) => setSelectedWarehouseId(e.target.value)}
                        className="w-full text-[11px] p-2 border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-950 font-black text-zinc-700 dark:text-zinc-300"
                      >
                        {warehouses.map((wh) => (
                          <option key={wh.id} value={wh.id}>
                            {wh.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-zinc-400 mb-0.5">تعديل الأرصدة</label>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setQuickQtyChange(prev => prev - 1)}
                          className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-extrabold rounded-lg flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="w-10 text-center font-mono font-black text-xs text-zinc-800 dark:text-zinc-200">
                          {quickQtyChange > 0 ? `+${quickQtyChange}` : quickQtyChange}
                        </span>
                        <button
                          onClick={() => setQuickQtyChange(prev => prev + 1)}
                          className="w-7 h-7 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 font-extrabold rounded-lg flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleQuickStockSave}
                      disabled={isUpdatingStock || quickQtyChange === 0}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 text-white text-xs font-black rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isUpdatingStock ? (
                        <RotateCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      حفظ وتعديل فوري للكمية
                    </button>
                    <button
                      onClick={() => {
                        toast.success("✓ تم إرسال أمر الطباعة لملصق الباركود بنجاح!");
                      }}
                      className="p-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg"
                      title="طباعة ملصق الباركود للرف"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner History */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
            <span className="text-[10px] font-black text-zinc-400 block">
              سجل عمليات المسح الأخيرة (Scan Logs):
            </span>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
              {scanHistory.length === 0 ? (
                <p className="text-[10px] text-zinc-400 text-center py-4 font-bold">لا توجد عمليات مسح سابقة</p>
              ) : (
                scanHistory.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center text-[10px] bg-zinc-50 dark:bg-zinc-950 p-2 rounded-lg border border-zinc-150/50 dark:border-zinc-800"
                  >
                    <span className="text-zinc-400 font-mono">{log.time}</span>
                    <div className="flex items-center gap-1 text-right">
                      <span className={log.success ? "text-emerald-600 font-black" : "text-rose-500 font-black"}>
                        {log.itemNameAr}
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">({log.barcode})</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Real Warehouse Stock Alerts & Rules (7 columns) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 gap-2">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Bell className="w-5 h-5 text-rose-500" />
                إنذارات المخزون وتنبيهات مستويات النفاذ
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
                متابعة الأصناف التي قاربت على النفاد وتوليد طلبات الشراء لإعادة تزويدها تلقائيًا
              </p>
            </div>
            
            {stockAlerts.length > 0 && (
              <button
                onClick={handleBulkRestock}
                className="text-[10px] bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 text-rose-700 dark:text-rose-400 font-black py-1.5 px-3 rounded-lg border border-rose-200 dark:border-rose-900/30 flex items-center gap-1.5 transition-all self-start cursor-pointer hover:scale-[1.02]"
              >
                <Sparkles className="w-3.5 h-3.5" /> إعادة طلب وتزويد تلقائي ({stockAlerts.length})
              </button>
            )}
          </div>

          {/* List of Low Stock alerts */}
          <div className="space-y-3">
            <span className="text-[11px] font-black text-zinc-450 block">
              الأصناف الحرجة وتحت الحد الأدنى حالياً:
            </span>

            {stockAlerts.length === 0 ? (
              <div className="p-8 text-center bg-emerald-50/50 dark:bg-zinc-800/20 border border-dashed border-emerald-200 dark:border-zinc-850 rounded-2xl space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-black text-emerald-800 dark:text-emerald-400">جميع مستويات الأصناف آمنة وممتازة!</p>
                <p className="text-[10px] text-zinc-400 font-bold">لم تقع أي منتجات تحت الحد الأدنى للمخزون الآمن.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto custom-scrollbar">
                {stockAlerts.map(({ item, totalStock, severity, label, minS, safetyS }) => (
                  <div
                    key={item.id}
                    className={cn(
                      "flex items-center justify-between p-3.5 rounded-xl border text-right transition-all hover:translate-x-1",
                      severity === "critical"
                        ? "bg-rose-50/40 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30"
                        : "bg-amber-50/40 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[10px] font-black px-2.5 py-1 rounded-lg font-mono",
                        severity === "critical"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      )}>
                        {totalStock} {item.unit || "حبة"}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-bold">
                        (الحد الآمن: {safetyS})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-150 shadow-2xs">
                        <AlertTriangle className={cn(
                          "w-4 h-4",
                          severity === "critical" ? "text-rose-600" : "text-amber-600"
                        )} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                          {item.nameAr}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={cn(
                            "text-[9px] font-bold px-1.5 py-0.5 rounded-md",
                            severity === "critical"
                              ? "bg-rose-50 text-rose-600 border border-rose-100"
                              : "bg-amber-50 text-amber-600 border border-amber-100"
                          )}>
                            {label}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            SKU: {item.sku}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rules Builder Engine Tab */}
          <div className="space-y-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <div>
              <span className="text-xs font-black text-zinc-800 dark:text-zinc-200 block flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                تأسيس قواعد تتبع وتنبيهات المخزون المخصصة
              </span>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">
                أضف شروطاً آلية لمستويات التخزين لتوليد تحذيرات بريدية ونظامية للمسؤولين
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150/60 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-[10px] font-black text-zinc-500 mb-1">المنتج المستهدف</label>
                <select
                  value={selectedAlertItem}
                  onChange={(e) => setSelectedAlertItem(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 font-black text-zinc-700 dark:text-zinc-300"
                >
                  <option value="">-- اختر صنفاً لتأسيس التنبيه --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameAr} ({i.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-black text-zinc-500 mb-1">المستودع المعني</label>
                <select
                  value={selectedWhRule}
                  onChange={(e) => setSelectedWhRule(e.target.value)}
                  className="w-full text-xs p-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 font-black text-zinc-700 dark:text-zinc-300"
                >
                  <option value="all">كافة المستودعات (All)</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-500 mb-1">الحد الأدنى (Min)</label>
                <input
                  type="number"
                  value={customMinStock}
                  onChange={(e) => setCustomMinStock(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center font-mono"
                  min="1"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-zinc-500 mb-1">الحد الحرج (Safety)</label>
                <input
                  type="number"
                  value={customSafetyStock}
                  onChange={(e) => setCustomSafetyStock(Number(e.target.value))}
                  className="w-full text-xs p-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-center font-mono"
                  min="1"
                />
              </div>

              <div className="md:col-span-1 flex items-end">
                <button
                  onClick={handleAddAlertRule}
                  className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                  title="حفظ وإدراج القاعدة"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Render active alert rules */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-zinc-400 block">
                قواعد التتبع النشطة الآن في المستودعات (Active Rules):
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150/80 dark:border-zinc-800 rounded-xl flex justify-between items-center text-right"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[9px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-md border border-emerald-200 font-bold">مفعلة</span>
                    </div>

                    <div className="space-y-1">
                      <h5 className="text-[11px] font-black text-zinc-800 dark:text-zinc-200">
                        {rule.itemTitle}
                      </h5>
                      <p className="text-[9px] text-zinc-400 font-bold">
                        الموقع: <span className="text-zinc-500">{rule.warehouseName}</span> • الحد الأدنى: {rule.minStock} حبات
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Audit Logs of recent stock exceptions */}
          <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <span className="text-[10px] font-black text-zinc-400 block">
              سجل التحذيرات والأخطاء الجردية الأخيرة (Anomaly Audit Logs):
            </span>
            <div className="space-y-1.5 max-h-[120px] overflow-y-auto custom-scrollbar">
              {alertLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-start text-[10px] bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-lg border border-zinc-150/50 dark:border-zinc-800 leading-relaxed text-right"
                >
                  <span className="text-zinc-400 font-mono text-[9px] shrink-0">{log.time}</span>
                  <div className="space-y-0.5 pl-4">
                    <span className={cn(
                      "font-black text-[11px] block",
                      log.severity === "critical" ? "text-rose-600" : "text-amber-600"
                    )}>
                      ⚠️ تنبيه: {log.itemNameAr} ({log.severity === "critical" ? "حرج" : "منخفض"})
                    </span>
                    <p className="text-zinc-500 font-medium">{log.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
