import React, { useState, useMemo } from "react";
import {
  Layers,
  Search,
  Filter,
  Plus,
  Info,
  RefreshCw,
  Barcode,
  CheckCircle2,
  Calendar,
  ShieldAlert,
  Tag,
  LayoutGrid,
  MapPin,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface StocksAndLotsProps {
  items: any[];
  warehouses: any[];
  onUpdateProduct: (id: string, prodData: any) => void;
}

// Default serial numbers list
const INITIAL_SERIAL_NUMBERS = [
  {
    serial: "SN-9823102",
    productId: "TAB-101",
    status: "In Stock",
    warehouseId: "Main",
    purchaseDate: "2026-01-10",
    saleDate: null,
    warrantyMonths: 24,
    customer: null,
    supplier: "مجموعة الرياض للتأثيث",
  },
  {
    serial: "SN-9823103",
    productId: "TAB-101",
    status: "In Stock",
    warehouseId: "Main",
    purchaseDate: "2026-01-10",
    saleDate: null,
    warrantyMonths: 24,
    customer: null,
    supplier: "مجموعة الرياض للتأثيث",
  },
  {
    serial: "SN-1029311",
    productId: "CHR-202",
    status: "Sold",
    warehouseId: "Riyadh",
    purchaseDate: "2026-02-14",
    saleDate: "2026-05-10",
    warrantyMonths: 12,
    customer: "الشركة الوطنية للحلول",
    supplier: "مجموعة الرياض للتأثيث",
  },
];

// Default Batch / Lot Tracking list
const INITIAL_BATCHES = [
  {
    batchNo: "LOT-26A-01",
    productId: "TAB-101",
    prodDate: "2026-01-15",
    expiryDate: "2027-01-15",
    warehouseId: "Main",
    supplier: "مجموعة الرياض للتأثيث",
    initialQty: 100,
    remainingQty: 45,
    status: "Healthy",
  },
  {
    batchNo: "LOT-26B-02",
    productId: "TAB-101",
    prodDate: "2026-02-10",
    expiryDate: "2026-12-10",
    warehouseId: "Riyadh",
    supplier: "مجموعة الرياض للتأثيث",
    initialQty: 50,
    remainingQty: 15,
    status: "Expiring Soon",
  },
  {
    batchNo: "LOT-26C-03",
    productId: "TAB-101",
    prodDate: "2026-03-05",
    expiryDate: "2027-09-05",
    warehouseId: "Jeddah",
    supplier: "مجموعة الرياض للتأثيث",
    initialQty: 40,
    remainingQty: 8,
    status: "Healthy",
  },
];

export default function StocksAndLots({ items, warehouses, onUpdateProduct }: StocksAndLotsProps) {
  const [subTab, setSubTab] = useState<"matrix" | "serials" | "batches">("matrix");

  // States
  const [serials, setSerials] = useState<any[]>(INITIAL_SERIAL_NUMBERS);
  const [batches, setBatches] = useState<any[]>(INITIAL_BATCHES);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");

  // New Serial State
  const [newSerial, setNewSerial] = useState("");
  const [newSerialProd, setNewSerialProd] = useState("");
  const [newSerialWh, setNewSerialWh] = useState("");
  const [newSerialWarranty, setNewSerialWarranty] = useState("24");

  // New Batch State
  const [newBatchNo, setNewBatchNo] = useState("");
  const [newBatchProd, setNewBatchProd] = useState("");
  const [newBatchWh, setNewBatchWh] = useState("");
  const [newBatchProdDate, setNewBatchProdDate] = useState("2026-06-28");
  const [newBatchExpDate, setNewBatchExpDate] = useState("2027-06-28");
  const [newBatchQty, setNewBatchQty] = useState("50");

  // Bin locations editor state
  const [selectedItemForBin, setSelectedItemForBin] = useState<any | null>(null);
  const [binAisle, setBinAisle] = useState("");
  const [binRack, setBinRack] = useState("");
  const [binShelf, setBinShelf] = useState("");
  const [binCode, setBinCode] = useState("");

  // Reorder point rules state
  const [selectedItemForReorder, setSelectedItemForReorder] = useState<any | null>(null);
  const [minStockRule, setMinStockRule] = useState("");
  const [maxStockRule, setMaxStockRule] = useState("");
  const [safetyStockRule, setSafetyStockRule] = useState("");
  const [leadTimeRule, setLeadTimeRule] = useState("");

  // FEFO Picker State
  const [fefoProduct, setFefoProduct] = useState("");
  const [fefoSuggestedBatch, setFefoSuggestedBatch] = useState<any | null>(null);

  // Filter Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [items, searchQuery]);

  // Handle register serial number (cannot duplicate check)
  const handleRegisterSerial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSerial || !newSerialProd || !newSerialWh) {
      toast.error("يرجى إكمال جميع الحقول");
      return;
    }

    // DUPLICATION GUARD
    const exists = serials.some((s) => s.serial.toLowerCase() === newSerial.trim().toLowerCase());
    if (exists) {
      toast.error(`خطأ: الرقم التسلسلي (${newSerial}) مسجل مسبقاً في النظام ولا يمكن تكراره! ⚠️`);
      return;
    }

    const brandNew = {
      serial: newSerial.trim(),
      productId: newSerialProd,
      status: "In Stock",
      warehouseId: newSerialWh,
      purchaseDate: new Date().toISOString().split("T")[0],
      saleDate: null,
      warrantyMonths: Number(newSerialWarranty),
      customer: null,
      supplier: "شريك التوريد المعتمد",
    };

    setSerials([brandNew, ...serials]);
    setNewSerial("");
    toast.success("تم تسجيل الرقم التسلسلي والتحقق من التفرد بنجاح ✅");
  };

  // Handle register batch
  const handleRegisterBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBatchNo || !newBatchProd || !newBatchWh) {
      toast.error("يرجى إكمال جميع الحقول");
      return;
    }

    const quantity = Number(newBatchQty) || 0;

    const brandNew = {
      batchNo: newBatchNo.trim(),
      productId: newBatchProd,
      prodDate: newBatchProdDate,
      expiryDate: newBatchExpDate,
      warehouseId: newBatchWh,
      supplier: "مورد الدفعة المعتمد",
      initialQty: quantity,
      remainingQty: quantity,
      status: "Healthy",
    };

    setBatches([brandNew, ...batches]);
    setNewBatchNo("");
    setNewBatchQty("50");
    toast.success("تم إدراج دفعة الإنتاج بنجاح ورصد صلاحيتها 📅");
  };

  // Run FEFO picker
  const handleRunFefoPicker = (prodId: string) => {
    setFefoProduct(prodId);
    if (!prodId) {
      setFefoSuggestedBatch(null);
      return;
    }
    // Filter active batches of this product and sort by expiry date ascending (FEFO)
    const sorted = batches
      .filter((b) => b.productId === prodId && b.remainingQty > 0)
      .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

    if (sorted.length > 0) {
      setFefoSuggestedBatch(sorted[0]);
      toast.success(
        `توصية FEFO: الدفعة المناسبة للصرف هي (${sorted[0].batchNo}) بصلاحية حتى ${sorted[0].expiryDate}`
      );
    } else {
      setFefoSuggestedBatch(null);
      toast.error("لا توجد دفعات إنتاجية متاحة بصلاحية صالحة لهذا الصنف");
    }
  };

  // Edit Bin Locations inside product object
  const handleSaveBinLocation = () => {
    if (!selectedItemForBin) return;
    const binString = `${binAisle || "A0"}-${binRack || "R0"}-${binShelf || "S0"}-${binCode || "B0"}`;
    onUpdateProduct(selectedItemForBin.id, { binLocation: binString });
    setSelectedItemForBin(null);
    toast.success(`تم حفظ موقع الصنف بنجاح: ${binString} 📍`);
  };

  // Save reorder rule in product
  const handleSaveReorderRules = () => {
    if (!selectedItemForReorder) return;
    onUpdateProduct(selectedItemForReorder.id, {
      minStock: Number(minStockRule) || 10,
      maxStock: Number(maxStockRule) || 200,
      safetyStock: Number(safetyStockRule) || 15,
      leadTimeDays: Number(leadTimeRule) || 7,
    });
    setSelectedItemForReorder(null);
    toast.success("تم تحديث شروط إعادة الطلب الذكية للصنف بنجاح 🎯");
  };

  return (
    <div className="space-y-6">
      {/* Subtab Navigation */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border gap-1">
        <button
          onClick={() => setSubTab("matrix")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "matrix" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          📍 مواقع المخازن ورفوف الثنائيات
        </button>
        <button
          onClick={() => setSubTab("serials")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "serials" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          🎫 تتبع الأرقام التسلسلية (Serials)
        </button>
        <button
          onClick={() => setSubTab("batches")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "batches" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          📅 تتبع الدفعات وتواريخ الصلاحية (FEFO Lots)
        </button>
      </div>

      {/* SEARCH BAR (Used on all subtabs) */}
      <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center justify-between shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="ابحث بالاسم، SKU في الأرصدة والدفعات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none text-zinc-800 dark:text-zinc-100"
          />
        </div>
        <p className="text-[11px] text-zinc-400 font-bold hidden md:block">
          * تحديث مخزني فوري - متوافق مع قارئات الباركود المحمولة وجرد الكيو آر كود.
        </p>
      </div>

      {/* --- SUBTAB 1: STOCKS MATRIX & BIN LOCATIONS --- */}
      {subTab === "matrix" && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto text-xs font-bold text-right">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                  <th className="p-4">الصنف والمعلومات</th>
                  <th className="p-4">موقع الرف (Bin Location)</th>
                  {warehouses.map((wh) => (
                    <th key={wh.id} className="p-4 text-center">
                      {wh.nameAr}
                    </th>
                  ))}
                  <th className="p-4 text-center">الرصيد العام</th>
                  <th className="p-4">ضوابط إعادة الطلب</th>
                  <th className="p-4 text-center">تحديث الضوابط</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={warehouses.length + 5}
                      className="p-12 text-center text-zinc-400 font-bold"
                    >
                      لا توجد مواصفات مخزنية مسجلة حالياً.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => {
                    const totalQty = Object.values(item.warehouseQuantities || {}).reduce(
                      (a: any, b: any) => Number(a) + Number(b),
                      0
                    ) as number;
                    const minStock = item.minStock || 15;
                    const maxStock = item.maxStock || 200;

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all"
                      >
                        <td className="p-4">
                          <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                            {item.nameAr}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {item.sku}
                          </span>
                        </td>
                        <td className="p-4">
                          {item.binLocation ? (
                            <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 px-2.5 py-1 rounded-lg text-indigo-700 dark:text-indigo-400 text-[10px] border border-indigo-100">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              {item.binLocation}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedItemForBin(item);
                                setBinAisle("");
                                setBinRack("");
                                setBinShelf("");
                                setBinCode("");
                              }}
                              className="text-[10px] text-zinc-400 hover:text-indigo-600 underline"
                            >
                              تعيين موقع (Bin)
                            </button>
                          )}
                        </td>

                        {/* Warehouse Specific Quantities */}
                        {warehouses.map((wh) => {
                          const qty = Number(item.warehouseQuantities?.[wh.id] || 0);
                          return (
                            <td
                              key={wh.id}
                              className="p-4 text-center font-mono font-black text-zinc-800 dark:text-zinc-200"
                            >
                              <span
                                className={
                                  qty === 0 ? "text-zinc-300" : "text-zinc-900 dark:text-zinc-100"
                                }
                              >
                                {qty}
                              </span>
                            </td>
                          );
                        })}

                        {/* Grand Total */}
                        <td className="p-4 text-center font-mono">
                          <span
                            className={`px-2.5 py-1 rounded-full font-black text-xs ${totalQty === 0 ? "bg-red-50 text-red-700" : totalQty < minStock ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                          >
                            {totalQty}
                          </span>
                        </td>

                        {/* Reorder point configs */}
                        <td className="p-4 space-y-0.5 text-[10px] text-zinc-500">
                          <div className="flex justify-between">
                            <span>الحد الأدنى:</span>
                            <span className="font-mono text-zinc-800 dark:text-zinc-200">
                              {minStock}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>الحد الأقصى:</span>
                            <span className="font-mono text-zinc-800 dark:text-zinc-200">
                              {maxStock}
                            </span>
                          </div>
                          {totalQty < minStock && (
                            <span className="text-[9px] text-red-500 font-bold flex items-center gap-0.5 mt-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              طلب عاجل!
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedItemForReorder(item);
                              setMinStockRule(String(item.minStock || 15));
                              setMaxStockRule(String(item.maxStock || 200));
                              setSafetyStockRule(String(item.safetyStock || 15));
                              setLeadTimeRule(String(item.leadTimeDays || 7));
                            }}
                            className="text-[10px] bg-zinc-50 hover:bg-indigo-50 border px-2.5 py-1 rounded-lg text-zinc-600 hover:text-indigo-600"
                          >
                            إعداد الأمان 🎯
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: UNIQUE SERIAL NUMBERS --- */}
      {subTab === "serials" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Register Serial Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <Barcode className="w-4 h-4 text-indigo-600" />
              تسجيل رقم تسلسلي فريد لمنتج (Serialized Entry)
            </h3>
            <form onSubmit={handleRegisterSerial} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">
                  الرقم التسلسلي الفريد (cannot duplicate)
                </label>
                <input
                  type="text"
                  required
                  value={newSerial}
                  onChange={(e) => setNewSerial(e.target.value)}
                  placeholder="مثال: SN-9823104"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">المنتج المرتبط</label>
                <select
                  required
                  value={newSerialProd}
                  onChange={(e) => setNewSerialProd(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر المنتج --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nameAr} ({item.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">مستودع التخصيص</label>
                <select
                  required
                  value={newSerialWh}
                  onChange={(e) => setNewSerialWh(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر المستودع --</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">فترة الضمان بالشهور</label>
                <input
                  type="number"
                  required
                  value={newSerialWarranty}
                  onChange={(e) => setNewSerialWarranty(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
              >
                حفظ وتحقق من التفرد
              </button>
            </form>
          </div>

          {/* Serial numbers database list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
              قاعدة بيانات الأرقام التسلسلية المسجلة
            </h3>
            <div className="overflow-x-auto text-xs font-bold text-right">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                    <th className="p-3">الرقم التسلسلي</th>
                    <th className="p-3">المنتج والـ SKU</th>
                    <th className="p-3">المستودع</th>
                    <th className="p-3">الحالة والضمان</th>
                    <th className="p-3">تاريخ الدخول</th>
                  </tr>
                </thead>
                <tbody>
                  {serials.map((s, idx) => {
                    const matchItem = items.find(
                      (i) => i.id === s.productId || i.sku === s.productId
                    );
                    return (
                      <tr key={idx} className="border-b border-zinc-50 dark:border-zinc-800">
                        <td className="p-3 font-mono font-black text-indigo-600 dark:text-indigo-400">
                          {s.serial}
                        </td>
                        <td className="p-3">
                          <span className="block">
                            {matchItem ? matchItem.nameAr : "طاولة مكتبية فاخرة"}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            {matchItem ? matchItem.sku : "TAB-101"}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-600 dark:text-zinc-400">{s.warehouseId}</td>
                        <td className="p-3 space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black inline-block ${s.status === "In Stock" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-50 text-zinc-600"}`}
                          >
                            {s.status === "In Stock" ? "متوفر" : "مباع"}
                          </span>
                          <span className="block text-[9px] text-zinc-400 font-black">
                            ضمان: {s.warrantyMonths} شهر
                          </span>
                        </td>
                        <td className="p-3 font-mono text-zinc-500">{s.purchaseDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: BATCH / LOT EXPIRY TRACKING & FEFO PICKING --- */}
      {subTab === "batches" && (
        <div className="space-y-6">
          {/* FEFO picking optimizer simulator */}
          <div className="bg-gradient-to-r from-emerald-900/10 via-teal-900/5 to-transparent p-5 rounded-[2rem] border border-emerald-500/20 shadow-sm">
            <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              مستشار الصرف الذكي حسب تاريخ الصلاحية الأقرب (FEFO Picking Optimizer)
            </h3>
            <p className="text-xs text-zinc-500 mb-4">
              خوارزمية الصرف الذكي (FEFO) - تقوم بالبحث في جميع دفعات الإنتاج وتقترح الدفعة التي
              تقترب نهاية صلاحيتها لتجنب الهدر المالي للمواد.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-zinc-400 text-xs mb-1">اختر الصنف المراد صرفه:</label>
                <select
                  value={fefoProduct}
                  onChange={(e) => handleRunFefoPicker(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer text-xs font-bold"
                >
                  <option value="">-- اختر صنفاً --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameAr} ({i.sku})
                    </option>
                  ))}
                </select>
              </div>

              {fefoSuggestedBatch ? (
                <div className="md:col-span-2 bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-900/30 p-4 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-emerald-600 uppercase block">
                      الدفعة الموصى بصرفها حالياً (FEFO)
                    </span>
                    <h4 className="text-sm font-mono font-black text-indigo-600 mt-1">
                      رقم الدفعة: {fefoSuggestedBatch.batchNo}
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      تاريخ انتهاء الصلاحية:{" "}
                      <span className="font-mono text-red-500 font-bold">
                        {fefoSuggestedBatch.expiryDate}
                      </span>
                    </p>
                  </div>
                  <div className="text-left font-bold">
                    <span className="text-xs text-zinc-400">الكمية المتاحة:</span>
                    <span className="text-xl font-mono text-zinc-950 dark:text-white block font-black">
                      {fefoSuggestedBatch.remainingQty} حبة
                    </span>
                  </div>
                </div>
              ) : (
                <div className="md:col-span-2 py-4 text-center text-zinc-400 text-xs font-bold">
                  اختر منتجاً من القائمة لتحديد الدفعة الأقرب انتهاءً وصرفها تلقائياً.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Register Batch Form */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                تعريف دفعة إنتاج (Lot / Batch Entry)
              </h3>
              <form onSubmit={handleRegisterBatch} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الدفعة (Batch Number)</label>
                  <input
                    type="text"
                    required
                    value={newBatchNo}
                    onChange={(e) => setNewBatchNo(e.target.value)}
                    placeholder="مثال: LOT-26B-04"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">المنتج المرتبط بالدفعة</label>
                  <select
                    required
                    value={newBatchProd}
                    onChange={(e) => setNewBatchProd(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">-- اختر المنتج --</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nameAr} ({item.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">المستودع المضيف</label>
                  <select
                    required
                    value={newBatchWh}
                    onChange={(e) => setNewBatchWh(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">-- اختر المستودع --</option>
                    {warehouses.map((wh) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px]">تاريخ الإنتاج</label>
                    <input
                      type="date"
                      required
                      value={newBatchProdDate}
                      onChange={(e) => setNewBatchProdDate(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 text-[10px]">تاريخ الصلاحية</label>
                    <input
                      type="date"
                      required
                      value={newBatchExpDate}
                      onChange={(e) => setNewBatchExpDate(e.target.value)}
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1">الكمية المستلمة في الدفعة</label>
                  <input
                    type="number"
                    required
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
                >
                  حفظ الدفعة وصلاحيتها 📅
                </button>
              </form>
            </div>

            {/* List of active batches */}
            <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
                سجل دفعات الإنتاج وتواريخ انتهاء الصلاحية
              </h3>
              <div className="overflow-x-auto text-xs font-bold text-right">
                <table className="w-full">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                      <th className="p-3">رقم الدفعة</th>
                      <th className="p-3">الصنف المرتبط</th>
                      <th className="p-3">المستودع</th>
                      <th className="p-3">الصلاحية (تاريخ الانتهاء)</th>
                      <th className="p-3">الكمية المتبقية</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches.map((b, idx) => {
                      const matchItem = items.find(
                        (i) => i.id === b.productId || i.sku === b.productId
                      );
                      return (
                        <tr key={idx} className="border-b border-zinc-50 dark:border-zinc-800">
                          <td className="p-3 font-mono font-black text-indigo-600 dark:text-indigo-400">
                            {b.batchNo}
                          </td>
                          <td className="p-3">
                            <span className="block">
                              {matchItem ? matchItem.nameAr : "طاولة مكتبية فاخرة"}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono block">
                              {matchItem ? matchItem.sku : "TAB-101"}
                            </span>
                          </td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">
                            {warehouses.find((w) => w.id === b.warehouseId)?.nameAr ||
                              b.warehouseId}
                          </td>
                          <td className="p-3 font-mono space-y-0.5">
                            <span className="block text-zinc-800 dark:text-zinc-200">
                              {b.expiryDate}
                            </span>
                            <span className="block text-[9px] text-zinc-400">
                              إنتاج: {b.prodDate}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-black text-zinc-950 dark:text-white">
                            {b.remainingQty} حبة
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-black ${b.status === "Healthy" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                            >
                              {b.status === "Healthy" ? "سليم" : "قريب الانتهاء"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 1: SET WAREHOUSE BIN LOCATION --- */}
      {selectedItemForBin && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          dir="rtl"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 border-b pb-2">
              تحديد موقع الرف (Bin Location Config)
            </h4>
            <div className="text-xs font-bold space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الممر (Aisle)</label>
                  <input
                    type="text"
                    value={binAisle}
                    onChange={(e) => setBinAisle(e.target.value)}
                    placeholder="مثال: A3"
                    className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الرف (Rack)</label>
                  <input
                    type="text"
                    value={binRack}
                    onChange={(e) => setBinRack(e.target.value)}
                    placeholder="مثال: B"
                    className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الرف العمودي (Shelf)</label>
                  <input
                    type="text"
                    value={binShelf}
                    onChange={(e) => setBinShelf(e.target.value)}
                    placeholder="مثال: S2"
                    className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">رقم الحاوية (Bin)</label>
                  <input
                    type="text"
                    value={binCode}
                    onChange={(e) => setBinCode(e.target.value)}
                    placeholder="مثال: A"
                    className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800"
                  />
                </div>
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={handleSaveBinLocation}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black"
                >
                  تأكيد وحفظ الموقع
                </button>
                <button
                  onClick={() => setSelectedItemForBin(null)}
                  className="flex-1 py-2 bg-zinc-50 text-zinc-500 rounded-xl text-xs font-black"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: SET REORDER LIMIT RULES --- */}
      {selectedItemForReorder && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
          dir="rtl"
        >
          <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border w-full max-w-sm p-6 space-y-4">
            <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 border-b pb-2">
              قوانين حماية المخزون وإعادة الطلب
            </h4>
            <div className="text-xs font-bold space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">
                  الحد الأدنى للمخزون (نقطة الإنذار)
                </label>
                <input
                  type="number"
                  value={minStockRule}
                  onChange={(e) => setMinStockRule(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800 text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  الحد الأقصى للمستودع (السعة الاستيعابية)
                </label>
                <input
                  type="number"
                  value={maxStockRule}
                  onChange={(e) => setMaxStockRule(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800 text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  مخزون الأمان الإضافي (Safety Stock)
                </label>
                <input
                  type="number"
                  value={safetyStockRule}
                  onChange={(e) => setSafetyStockRule(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800 text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  فترة التوريد المعتادة بالأيام (Lead Time)
                </label>
                <input
                  type="number"
                  value={leadTimeRule}
                  onChange={(e) => setLeadTimeRule(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-zinc-50 dark:bg-zinc-800 text-right font-mono"
                />
              </div>

              <div className="flex gap-2 border-t pt-4">
                <button
                  onClick={handleSaveReorderRules}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black"
                >
                  حفظ القواعد الذكية
                </button>
                <button
                  onClick={() => setSelectedItemForReorder(null)}
                  className="flex-1 py-2.5 bg-zinc-50 text-zinc-500 rounded-xl text-xs font-black"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
