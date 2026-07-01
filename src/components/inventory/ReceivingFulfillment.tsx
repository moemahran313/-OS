import React, { useState } from "react";
import {
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Search,
  Filter,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Eye,
  ShoppingCart,
  Users,
  Play,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";
import { toast } from "sonner";

interface ReceivingFulfillmentProps {
  items: any[];
  warehouses: any[];
  onAddAdjustment: (adjData: any) => Promise<any>;
  onUpdateProduct: (id: string, prodData: any) => void;
}

// Initial Purchase Orders List
const INITIAL_PURCHASES = [
  {
    id: "PO-26102",
    supplier: "مجموعة الرياض للتأثيث",
    orderDate: "2026-06-15",
    expectedDate: "2026-06-30",
    items: [{ itemId: "TAB-101", qty: 50, costPrice: 150 }],
    totalAmount: 7500,
    targetWarehouseId: "Main",
    status: "Pending",
  },
  {
    id: "PO-26103",
    supplier: "مجموعة الرياض للتأثيث",
    orderDate: "2026-06-10",
    expectedDate: "2026-06-25",
    items: [{ itemId: "CHR-202", qty: 30, costPrice: 120 }],
    totalAmount: 3600,
    targetWarehouseId: "Riyadh",
    status: "Received",
  },
];

// Initial Sales Orders List
const INITIAL_SALES = [
  {
    id: "SO-88301",
    customer: "الشركة الوطنية للحلول",
    orderDate: "2026-06-20",
    targetWarehouseId: "Main",
    items: [{ itemId: "TAB-101", qty: 15, salePrice: 320 }],
    totalAmount: 4800,
    status: "Pending",
  },
  {
    id: "SO-88302",
    customer: "مؤسسة طويق اللوجستية",
    orderDate: "2026-06-18",
    targetWarehouseId: "Jeddah",
    items: [{ itemId: "CHR-202", qty: 8, salePrice: 280 }],
    totalAmount: 2240,
    status: "Shipped",
  },
];

export default function ReceivingFulfillment({
  items,
  warehouses,
  onAddAdjustment,
  onUpdateProduct,
}: ReceivingFulfillmentProps) {
  const [subTab, setSubTab] = useState<"purchases" | "sales">("purchases");
  const [purchases, setPurchases] = useState<any[]>(INITIAL_PURCHASES);
  const [sales, setSales] = useState<any[]>(INITIAL_SALES);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // New Purchase Order Form States
  const [newPoWh, setNewPoWh] = useState("");
  const [newPoSupplier, setNewPoSupplier] = useState("مجموعة الرياض للتأثيث");
  const [newPoItem, setNewPoItem] = useState("");
  const [newPoQty, setNewPoQty] = useState("");
  const [newPoCost, setNewPoCost] = useState("");

  // New Sales Order Form States
  const [newSoWh, setNewSoWh] = useState("");
  const [newSoCustomer, setNewSoCustomer] = useState("");
  const [newSoItem, setNewSoItem] = useState("");
  const [newSoQty, setNewSoQty] = useState("");
  const [newSoPrice, setNewSoPrice] = useState("");

  // Create PO
  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoWh || !newPoItem || !newPoQty || !newPoCost) {
      toast.error("يرجى إدخال جميع حقول أمر الشراء المعتمد");
      return;
    }

    const qty = Number(newPoQty);
    const cost = Number(newPoCost);
    const matchingProd = items.find((i) => i.id === newPoItem);
    if (!matchingProd) return;

    const newPO = {
      id: `PO-${Math.floor(10000 + Math.random() * 90000)}`,
      supplier: newPoSupplier,
      orderDate: new Date().toISOString().split("T")[0],
      expectedDate: new Date(Date.now() + 10 * 24 * 3600 * 1000).toISOString().split("T")[0], // 10 days out
      items: [{ itemId: newPoItem, qty, costPrice: cost }],
      totalAmount: qty * cost,
      targetWarehouseId: newPoWh,
      status: "Pending",
    };

    setPurchases([newPO, ...purchases]);
    setNewPoQty("");
    setNewPoCost("");
    toast.success(`تم إصدار أمر الشراء (${newPO.id}) وربطه بالمورد المستهدف 📝`);
  };

  // Create SO
  const handleCreateSO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSoWh || !newSoItem || !newSoQty || !newSoPrice || !newSoCustomer) {
      toast.error("يرجى إدخال تفاصيل طلب العميل بدقة");
      return;
    }

    const qty = Number(newSoQty);
    const price = Number(newSoPrice);
    const matchingProd = items.find((i) => i.id === newSoItem);
    if (!matchingProd) return;

    const newSO = {
      id: `SO-${Math.floor(10000 + Math.random() * 90000)}`,
      customer: newSoCustomer,
      orderDate: new Date().toISOString().split("T")[0],
      targetWarehouseId: newSoWh,
      items: [{ itemId: newSoItem, qty, salePrice: price }],
      totalAmount: qty * price,
      status: "Pending",
    };

    setSales([newSO, ...sales]);
    setNewSoQty("");
    setNewSoPrice("");
    setNewSoCustomer("");
    toast.success(
      `تم تسجيل طلب المبيعات للعميل (${newSO.id}) وبانتظار تأكيد الشحن والتفريغ المستودعي 🚛`
    );
  };

  // Receive PO (Adds ordered quantity to stock)
  const handleReceivePO = async (po: any) => {
    if (po.status === "Received") return;

    try {
      // For each item in the PO, update warehouseQuantities
      po.items.forEach(async (poItem: any) => {
        const prod = items.find((i) => i.id === poItem.itemId || i.sku === poItem.itemId);
        if (prod) {
          const currentWhStock = Number(prod.warehouseQuantities?.[po.targetWarehouseId] || 0);
          const updatedWhQuantities = { ...prod.warehouseQuantities };
          updatedWhQuantities[po.targetWarehouseId] = currentWhStock + poItem.qty;
          onUpdateProduct(prod.id, { warehouseQuantities: updatedWhQuantities });

          // Register transaction adjustment for audit trail
          const adjLog = {
            warehouseId: po.targetWarehouseId,
            itemId: prod.id,
            itemName: prod.nameAr,
            sku: prod.sku,
            type: "add",
            quantity: poItem.qty,
            reason: "Purchases Reception",
            notes: `استلام بضائع موردة ضمن أمر الشراء ${po.id}. تفتيش مطابق للمواصفات.`,
            glAccount: "120101",
            costCenter: "CC-101",
            createdAt: new Date().toISOString(),
          };
          await onAddAdjustment(adjLog);
        }
      });

      // Update PO Status in state
      setPurchases(purchases.map((p) => (p.id === po.id ? { ...p, status: "Received" } : p)));
      toast.success(`تم استلام شحنة أمر الشراء ${po.id} وتفريغها في المستودع بنجاح! 📦✅`);
    } catch (err: any) {
      toast.error("حدث خطأ أثناء معالجة الاستلام المستودعي");
    }
  };

  // Ship SO (Deducts stock after checking for sufficient quantities)
  const handleShipSO = async (so: any) => {
    if (so.status === "Shipped") return;

    try {
      let stockError = false;
      const shortfalls: string[] = [];

      // Check stock sufficiency in target warehouse
      so.items.forEach((soItem: any) => {
        const prod = items.find((i) => i.id === soItem.itemId || i.sku === soItem.itemId);
        if (!prod) {
          stockError = true;
          return;
        }
        const availableWhStock = Number(prod.warehouseQuantities?.[so.targetWarehouseId] || 0);
        if (availableWhStock < soItem.qty) {
          stockError = true;
          shortfalls.push(`${prod.nameAr} (المطلوب: ${soItem.qty}, المتوفر: ${availableWhStock})`);
        }
      });

      if (stockError) {
        toast.error(
          `نقص حاد في المخزون: لا يمكن تأكيد شحن البضائع للعميل بسبب عدم كفاية الأرصدة! تفاصيل النقص: ${shortfalls.join(", ")} ⚠️`
        );
        return;
      }

      // If all products have enough stock, deplete and ship
      so.items.forEach(async (soItem: any) => {
        const prod = items.find((i) => i.id === soItem.itemId || i.sku === soItem.itemId);
        if (prod) {
          const currentWhStock = Number(prod.warehouseQuantities?.[so.targetWarehouseId] || 0);
          const updatedWhQuantities = { ...prod.warehouseQuantities };
          updatedWhQuantities[so.targetWarehouseId] = currentWhStock - soItem.qty;
          onUpdateProduct(prod.id, { warehouseQuantities: updatedWhQuantities });

          // Register transaction adjustment for audit trail
          const adjLog = {
            warehouseId: so.targetWarehouseId,
            itemId: prod.id,
            itemName: prod.nameAr,
            sku: prod.sku,
            type: "subtract",
            quantity: soItem.qty,
            reason: "Sales Delivery / Shipment",
            notes: `صرف وتأكيد خروج شحنة مبيعات للعميل بطلب مبيعات ${so.id}.`,
            glAccount: "510102", // Cost of Goods Sold
            costCenter: "CC-101",
            createdAt: new Date().toISOString(),
          };
          await onAddAdjustment(adjLog);
        }
      });

      // Update SO Status in state
      setSales(sales.map((s) => (s.id === so.id ? { ...s, status: "Shipped" } : s)));
      toast.success(`تم تأكيد الشحن وخصم الكميات من مستودع الصرف بطلب مبيعات ${so.id}! 🚚💨`);
    } catch (err: any) {
      toast.error("حدث خطأ أثناء معالجة تفريغ شحنة المبيعات");
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Toggle */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border gap-1">
        <button
          onClick={() => setSubTab("purchases")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "purchases" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          📥 استلام بضائع المشتريات (Goods Receiving - POs)
        </button>
        <button
          onClick={() => setSubTab("sales")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "sales" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          🚚 تلبية وشحن طلبات العملاء (Order Fulfillment - SOs)
        </button>
      </div>

      {/* --- SUBTAB 1: PURCHASING (GOODS RECEPTION) --- */}
      {subTab === "purchases" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Create Purchase Order Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <ShoppingCart className="w-4 h-4 text-indigo-600" />
              إصدار أمر شراء رسمي جديد (New Purchase Order)
            </h3>

            <form onSubmit={handleCreatePO} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">المورد المستهدف</label>
                <select
                  value={newPoSupplier}
                  onChange={(e) => setNewPoSupplier(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="مجموعة الرياض للتأثيث">مجموعة الرياض للتأثيث</option>
                  <option value="سابك للبتروكيماويات">سابك للبتروكيماويات</option>
                  <option value="مؤسسة طويق اللوجستية">مؤسسة طويق اللوجستية</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">الصنف المراد توريده</label>
                <select
                  required
                  value={newPoItem}
                  onChange={(e) => setNewPoItem(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر الصنف --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameAr} ({i.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    required
                    value={newPoQty}
                    onChange={(e) => setNewPoQty(e.target.value)}
                    placeholder="50"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">سعر الشراء الفردي</label>
                  <input
                    type="number"
                    required
                    value={newPoCost}
                    onChange={(e) => setNewPoCost(e.target.value)}
                    placeholder="150"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">مستودع الاستلام الهدف</label>
                <select
                  required
                  value={newPoWh}
                  onChange={(e) => setNewPoWh(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر مستودع الاستقبال --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                إدراج طلب الشراء للمستندات
              </button>
            </form>
          </div>

          {/* Active POs Monitor list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2 flex items-center gap-1.5">
                <Truck className="w-4.5 h-4.5 text-indigo-600" />
                شحنات المشتريات المفتوحة والمستلمة (Purchase Receiving Control)
              </h3>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {purchases.map((po) => {
                  const targetWh =
                    warehouses.find((w) => w.id === po.targetWarehouseId)?.nameAr ||
                    po.targetWarehouseId;

                  return (
                    <div
                      key={po.id}
                      className="p-4 border border-zinc-50 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-indigo-600">
                            ID: {po.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black ${po.status === "Received" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700 animate-pulse"}`}
                          >
                            {po.status === "Received" ? "مكتمل ومفرغ" : "في انتظار التوريد"}
                          </span>
                        </div>
                        <h4 className="font-black text-zinc-900 dark:text-zinc-100 mt-1">
                          المورد: {po.supplier}
                        </h4>

                        <div className="space-y-1 mt-2 text-[10px] text-zinc-500 font-bold">
                          {po.items.map((item: any, idx: number) => {
                            const matchingProd = items.find(
                              (i) => i.id === item.itemId || i.sku === item.itemId
                            );
                            return (
                              <div key={idx} className="flex gap-2">
                                <span>
                                  الصنف:{" "}
                                  <strong className="text-zinc-700 dark:text-zinc-300">
                                    {matchingProd ? matchingProd.nameAr : "طاولة مكتبية فاخرة"}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  الكمية:{" "}
                                  <strong className="text-zinc-700 dark:text-zinc-300">
                                    {item.qty} حبة
                                  </strong>
                                </span>
                              </div>
                            );
                          })}
                          <p>
                            المستودع المضيف: <strong className="text-indigo-600">{targetWh}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-left font-bold space-y-2">
                        <span className="text-xs text-indigo-600 font-mono block">
                          إجمالي القيمة: {po.totalAmount} ر.س
                        </span>
                        {po.status === "Pending" && (
                          <button
                            onClick={() => handleReceivePO(po)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black shadow"
                          >
                            تأكيد الاستلام والتفريغ (Receive)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: SALES SHIPMENTS (FULFILLMENT) --- */}
      {subTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
          {/* Create Sales Order Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <Users className="w-4 h-4 text-indigo-600" />
              أمر مبيعات لعميل وصرف مستودعي (New Sales Order)
            </h3>

            <form onSubmit={handleCreateSO} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">العميل المستهدف</label>
                <input
                  type="text"
                  required
                  value={newSoCustomer}
                  onChange={(e) => setNewSoCustomer(e.target.value)}
                  placeholder="مثال: الشركة الوطنية للحلول"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">الصنف المطلوب بيعه</label>
                <select
                  required
                  value={newSoItem}
                  onChange={(e) => setNewSoItem(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر الصنف --</option>
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nameAr} ({i.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">الكمية المطلوبة</label>
                  <input
                    type="number"
                    required
                    value={newSoQty}
                    onChange={(e) => setNewSoQty(e.target.value)}
                    placeholder="10"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">سعر البيع المعتمد</label>
                  <input
                    type="number"
                    required
                    value={newSoPrice}
                    onChange={(e) => setNewSoPrice(e.target.value)}
                    placeholder="320"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">مستودع الصرف وتجهيز الشحنة</label>
                <select
                  required
                  value={newSoWh}
                  onChange={(e) => setNewSoWh(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر مستودع الخروج --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                إصدار طلب المبيعات وتسجيله
              </button>
            </form>
          </div>

          {/* Active SOs list */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2 flex items-center gap-1.5">
                <ClipboardList className="w-4.5 h-4.5 text-indigo-600" />
                تلبية وحظر شحن بضائع العملاء (Sales Fulfillment Center)
              </h3>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {sales.map((so) => {
                  const sourceWh =
                    warehouses.find((w) => w.id === so.targetWarehouseId)?.nameAr ||
                    so.targetWarehouseId;

                  return (
                    <div
                      key={so.id}
                      className="p-4 border border-zinc-50 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all duration-300"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-indigo-600">
                            ID: {so.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black ${so.status === "Shipped" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-50 text-zinc-600"}`}
                          >
                            {so.status === "Shipped" ? "تم الشحن والتسليم" : "بانتظار تجهيز الشحنة"}
                          </span>
                        </div>
                        <h4 className="font-black text-zinc-900 dark:text-zinc-100 mt-1">
                          العميل: {so.customer}
                        </h4>

                        <div className="space-y-1 mt-2 text-[10px] text-zinc-500 font-bold">
                          {so.items.map((item: any, idx: number) => {
                            const matchingProd = items.find(
                              (i) => i.id === item.itemId || i.sku === item.itemId
                            );
                            return (
                              <div key={idx} className="flex gap-2">
                                <span>
                                  الصنف:{" "}
                                  <strong className="text-zinc-700 dark:text-zinc-300">
                                    {matchingProd ? matchingProd.nameAr : "طاولة مكتبية فاخرة"}
                                  </strong>
                                </span>
                                <span>•</span>
                                <span>
                                  الكمية المطلوبة:{" "}
                                  <strong className="text-zinc-700 dark:text-zinc-300">
                                    {item.qty} حبة
                                  </strong>
                                </span>
                              </div>
                            );
                          })}
                          <p>
                            مستودع الصرف: <strong className="text-indigo-600">{sourceWh}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-left font-bold space-y-2">
                        <span className="text-xs text-indigo-600 font-mono block">
                          قيمة العقد: {so.totalAmount} ر.س
                        </span>
                        {so.status === "Pending" && (
                          <button
                            onClick={() => handleShipSO(so)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black shadow"
                          >
                            تأكيد الشحن وتفريغ المخزون (Ship)
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
