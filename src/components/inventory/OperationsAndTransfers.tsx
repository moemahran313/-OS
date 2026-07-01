import React, { useState, useMemo } from "react";
import {
  ArrowRightLeft,
  Layers,
  Plus,
  Search,
  Filter,
  HelpCircle,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Play,
  ClipboardList,
  RefreshCw,
  Send,
  FileSpreadsheet,
  Trash2,
  ShieldCheck,
  Printer,
  Landmark,
} from "lucide-react";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface OperationsAndTransfersProps {
  items: any[];
  warehouses: any[];
  transfers: any[];
  adjustments: any[];
  onAddTransfer: (transferData: any) => Promise<any>;
  onAddAdjustment: (adjustmentData: any) => Promise<any>;
  onCompleteTransfer?: (id: string) => Promise<any>;
  onUpdateProduct: (id: string, prodData: any) => void;
}

// Default Cost Centers
const COST_CENTERS = [
  { code: "CC-101", name: "إدارة العمليات واللوجستيات" },
  { code: "CC-202", name: "خط الإنتاج والتصنيع" },
  { code: "CC-303", name: "التسويق وعروض الهدايا" },
];

// Default General Ledger Accounts
const GL_ACCOUNTS = [
  { code: "120101", name: "مخزون المواد الخام" },
  { code: "510102", name: "تكلفة البضاعة المباعة" },
  { code: "310405", name: "حساب الخسائر والتلفيات" },
  { code: "410203", name: "حساب تسويات فروقات الجرد" },
];

export default function OperationsAndTransfers({
  items,
  warehouses,
  transfers,
  adjustments,
  onAddTransfer,
  onAddAdjustment,
  onCompleteTransfer,
  onUpdateProduct,
}: OperationsAndTransfersProps) {
  const [subTab, setSubTab] = useState<"transfers" | "adjustments" | "bom">("transfers");

  // Transfer Forms State
  const [transSourceWh, setTransSourceWh] = useState("");
  const [transDestWh, setTransDestWh] = useState("");
  const [transItem, setTransItem] = useState("");
  const [transQty, setTransQty] = useState("");
  const [transNotes, setTransNotes] = useState("");

  // Adjustment Forms State
  const [adjWh, setAdjWh] = useState("");
  const [adjItem, setAdjItem] = useState("");
  const [adjType, setAdjType] = useState<"add" | "subtract" | "set">("add");
  const [adjQty, setAdjQty] = useState("");
  const [adjReason, setAdjReason] = useState("Discrepancy");
  const [adjCostCenter, setAdjCostCenter] = useState("CC-101");
  const [adjGlAccount, setAdjGlAccount] = useState("410203");
  const [adjNotes, setAdjNotes] = useState("");

  // BOM Assembly States
  const [assemblyProduct, setAssemblyProduct] = useState("");
  const [assemblyWh, setAssemblyWh] = useState("");
  const [assemblyQty, setAssemblyQty] = useState("10");

  // Dynamic Component Selection for Assembly Product
  const selectedBOMComponents = useMemo(() => {
    if (!assemblyProduct) return [];
    const prod = items.find((i) => i.id === assemblyProduct);
    if (!prod || !prod.bomComponents) return [];

    // Components are stored in product as array of { itemId: string, quantity: number }
    return prod.bomComponents.map((c: any) => {
      const componentItem = items.find((i) => i.id === c.itemId);
      return {
        ...c,
        name: componentItem ? componentItem.nameAr : "مادة خام",
        sku: componentItem ? componentItem.sku : "RAW-00",
        currentStockInWh: componentItem
          ? Number(componentItem.warehouseQuantities?.[assemblyWh] || 0)
          : 0,
      };
    });
  }, [assemblyProduct, assemblyWh, items]);

  // Check BOM Assembly Readiness
  const assemblyReadiness = useMemo(() => {
    if (selectedBOMComponents.length === 0)
      return { ready: false, msg: "لا يوجد هيكل منتج (BOM) معرف لهذا الصنف" };
    const orderQty = Number(assemblyQty) || 1;

    let allReady = true;
    const missingParts: string[] = [];

    selectedBOMComponents.forEach((comp: any) => {
      const requiredTotal = comp.quantity * orderQty;
      if (comp.currentStockInWh < requiredTotal) {
        allReady = false;
        missingParts.push(
          `${comp.name} (المطلوب: ${requiredTotal}, المتوفر: ${comp.currentStockInWh})`
        );
      }
    });

    if (allReady) {
      return {
        ready: true,
        msg: "جاهز للتجميع المباشر! جميع المدخلات والمواد الخام متوفرة في المستودع المحدد ✅",
      };
    } else {
      return { ready: false, msg: `نقص في المكونات المادية: ${missingParts.join(", ")} ⚠️` };
    }
  }, [selectedBOMComponents, assemblyQty]);

  // Execute BOM Assembly
  const handleAssembleBOM = async () => {
    if (!assemblyProduct || !assemblyWh) {
      toast.error("يرجى اختيار المنتج النهائي والمستودع");
      return;
    }

    const orderQty = Number(assemblyQty) || 1;
    if (orderQty <= 0) {
      toast.error("يرجى إدخال كمية صحيحة للتجميع");
      return;
    }

    if (!assemblyReadiness.ready) {
      toast.error(assemblyReadiness.msg);
      return;
    }

    // Process Depletion of Raw materials and addition of Finished Good
    const finishedGood = items.find((i) => i.id === assemblyProduct);
    if (!finishedGood) return;

    try {
      // 1. Deplete Raw Material Components
      selectedBOMComponents.forEach((comp: any) => {
        const requiredTotal = comp.quantity * orderQty;
        const currentWhQuantities = { ...comp.warehouseQuantities };
        currentWhQuantities[assemblyWh] =
          Number(currentWhQuantities[assemblyWh] || 0) - requiredTotal;
        onUpdateProduct(comp.id, { warehouseQuantities: currentWhQuantities });
      });

      // 2. Increase Finished Good stock
      const finishedWhQuantities = { ...finishedGood.warehouseQuantities };
      finishedWhQuantities[assemblyWh] = Number(finishedWhQuantities[assemblyWh] || 0) + orderQty;
      onUpdateProduct(finishedGood.id, { warehouseQuantities: finishedWhQuantities });

      // 3. Register standard adjustment for audit trail
      const auditLog = {
        itemId: assemblyProduct,
        itemName: finishedGood.nameAr,
        sku: finishedGood.sku,
        warehouseId: assemblyWh,
        type: "set",
        quantity: orderQty,
        reason: "Assembly / Manufacturing",
        notes: `عملية تجميع BOM لـ ${orderQty} حبة بنجاح. تم سحب المكونات تلقائياً.`,
        glAccount: "120101",
        costCenter: "CC-202",
        createdAt: new Date().toISOString(),
      };
      await onAddAdjustment(auditLog);

      toast.success(
        `تم تجميع ${orderQty} حبة من الصنف (${finishedGood.nameAr}) وتحديث أرصدة المكونات فورياً! 🏭✅`
      );
      setAssemblyProduct("");
    } catch (err: any) {
      toast.error("فشلت عملية التجميع المستودعي");
    }
  };

  // Create PDF Delivery Note for Transfers
  const generateTransferPdf = (transfer: any) => {
    try {
      const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      // Use standard jsPDF features to draw a beautiful, compliant delivery note
      doc.setFontSize(22);
      doc.text("Madarij OS - Madarij Cloud ERP", 105, 20, { align: "center" });
      doc.setFontSize(14);
      doc.text("DELIVERY NOTE & INTER-WAREHOUSE TRANSFER", 105, 28, { align: "center" });
      doc.line(20, 32, 190, 32);

      doc.setFontSize(10);
      doc.text(`Transfer Reference: ${transfer.id.substring(0, 8).toUpperCase()}`, 20, 42);
      doc.text(
        `Date Initiated: ${transfer.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10)}`,
        20,
        48
      );
      doc.text(
        `Status: ${transfer.status === "completed" ? "DELIVERED / COMPLETED" : "IN TRANSIT"}`,
        20,
        54
      );

      // Warehouse information
      const sourceWh =
        warehouses.find((w) => w.id === transfer.sourceWarehouseId)?.nameAr ||
        transfer.sourceWarehouseId;
      const destWh =
        warehouses.find((w) => w.id === transfer.destinationWarehouseId)?.nameAr ||
        transfer.destinationWarehouseId;

      doc.text(`Source Warehouse: ${sourceWh}`, 120, 42);
      doc.text(`Destination Warehouse: ${destWh}`, 120, 48);
      doc.text(`Remarks: ${transfer.notes || "Standard Inter-warehouse Transfer"}`, 120, 54);

      // Table of items
      const tableData = [
        [
          transfer.sku || "TAB-101",
          transfer.itemName || "طاولة مكتبية فاخرة",
          transfer.quantity || 10,
          "Units",
        ],
      ];

      (doc as any).autoTable({
        startY: 65,
        head: [["SKU Code", "Product Description", "Transfer Qty", "Unit"]],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [79, 70, 229] }, // indigo
      });

      // Signature lines
      const finalY = (doc as any).lastAutoTable.finalY + 30;
      doc.text("Prepared By (Storekeeper): _________________", 20, finalY);
      doc.text("Approved Manager: _________________", 120, finalY);

      doc.save(`Transfer_Note_${transfer.id.substring(0, 8)}.pdf`);
      toast.success("تم تصدير مستند التحويل البيني بصيغة PDF معتمدة ومؤرخة 📄");
    } catch (err: any) {
      toast.error("حدث خطأ أثناء إنشاء ملف PDF");
    }
  };

  // Initiate Transfer
  const handleInitiateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transSourceWh || !transDestWh || !transItem || !transQty) {
      toast.error("يرجى إدخال جميع الحقول المطلوبة لطلب التحويل البيني");
      return;
    }

    if (transSourceWh === transDestWh) {
      toast.error("خطأ: لا يمكن إجراء تحويل لنفس المستودع المصدر!");
      return;
    }

    const qty = Number(transQty);
    if (qty <= 0) {
      toast.error("يرجى إدخال كمية تحويل موجبة");
      return;
    }

    // Verify stock availability in source warehouse
    const selectedProd = items.find((i) => i.id === transItem);
    if (!selectedProd) return;

    const availableStock = Number(selectedProd.warehouseQuantities?.[transSourceWh] || 0);
    if (availableStock < qty) {
      toast.error(
        `خطأ: الكمية المطلوبة للتحويل (${qty}) أكبر من المخزون المتوفر في المستودع المصدر (${availableStock})! ⚠️`
      );
      return;
    }

    const transferPayload = {
      sourceWarehouseId: transSourceWh,
      destinationWarehouseId: transDestWh,
      itemId: transItem,
      itemName: selectedProd.nameAr,
      sku: selectedProd.sku,
      quantity: qty,
      notes: transNotes || "Inter-warehouse transfer",
      status: "in-transit",
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddTransfer(transferPayload);

      // Deduct stock immediately from source warehouse and put it "in-transit"
      const updatedSourceQuantities = { ...selectedProd.warehouseQuantities };
      updatedSourceQuantities[transSourceWh] = availableStock - qty;
      onUpdateProduct(selectedProd.id, { warehouseQuantities: updatedSourceQuantities });

      setTransItem("");
      setTransQty("");
      setTransNotes("");
      toast.success("تم إرسال الشحنة ووضعها في حالة قيد العبور (In Transit) 🚛");
    } catch (err: any) {
      toast.error("حدث خطأ أثناء معالجة الشحنة البينية");
    }
  };

  // Receive Transfer (Complete)
  const handleCompleteTransferClick = async (transfer: any) => {
    if (transfer.status === "completed") return;

    try {
      if (onCompleteTransfer) {
        await onCompleteTransfer(transfer.id);
      }

      // Add stock to destination warehouse
      const prod = items.find((i) => i.id === transfer.itemId || i.sku === transfer.sku);
      if (prod) {
        const updatedDestQuantities = { ...prod.warehouseQuantities };
        updatedDestQuantities[transfer.destinationWarehouseId] =
          Number(updatedDestQuantities[transfer.destinationWarehouseId] || 0) +
          Number(transfer.quantity);
        onUpdateProduct(prod.id, { warehouseQuantities: updatedDestQuantities });
      }

      toast.success("تم تأكيد الاستلام وتفريغ الكميات في المستودع الوجهة فورياً! 📦🏭");
    } catch (err: any) {
      toast.error("فشل تأكيد الاستلام المستودعي");
    }
  };

  // Execute Stock Adjustment (Audit / Damaged)
  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjWh || !adjItem || !adjQty) {
      toast.error("يرجى اختيار المستودع، الصنف، والكمية المطلوبة للتسوية");
      return;
    }

    const qty = Number(adjQty);
    const selectedProd = items.find((i) => i.id === adjItem);
    if (!selectedProd) return;

    const currentStock = Number(selectedProd.warehouseQuantities?.[adjWh] || 0);
    let finalStock = currentStock;

    if (adjType === "add") {
      finalStock = currentStock + qty;
    } else if (adjType === "subtract") {
      if (currentStock < qty) {
        toast.error(`خطأ: لا يمكن إنقاص كمية أكبر من الرصيد المتوفر (${currentStock})`);
        return;
      }
      finalStock = currentStock - qty;
    } else {
      finalStock = qty;
    }

    const adjustmentPayload = {
      warehouseId: adjWh,
      itemId: adjItem,
      itemName: selectedProd.nameAr,
      sku: selectedProd.sku,
      type: adjType,
      quantity: qty,
      reason: adjReason,
      notes: adjNotes || "Physical cycle count adjustment",
      costCenter: adjCostCenter,
      glAccount: adjGlAccount,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddAdjustment(adjustmentPayload);

      // Update product quantities
      const updatedQuantities = { ...selectedProd.warehouseQuantities };
      updatedQuantities[adjWh] = finalStock;
      onUpdateProduct(selectedProd.id, { warehouseQuantities: updatedQuantities });

      setAdjQty("");
      setAdjNotes("");
      toast.success("تم تطبيق تسوية المخزون وإصدار قيد محاسبي تصفوي متوازن! ⚖️📊");
    } catch (err: any) {
      toast.error("فشل تسجيل حركة التسوية المالية");
    }
  };

  const reasonTranslations: Record<string, string> = {
    Discrepancy: "فروقات جرد دوري",
    Damaged: "تلفيات بضائع ورطوبة",
    Lost: "مفقودات عجز مستودعي",
    Found: "رصد بضائع زائدة",
    Gift: "عينات ترويجية وهدايا",
    Theft: "سرقة مستودعية مثبتة",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Tab Swticher */}
      <div className="flex border-b border-zinc-200 bg-zinc-50 dark:bg-zinc-800 p-1.5 rounded-2xl border gap-1">
        <button
          onClick={() => setSubTab("transfers")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "transfers" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          🚛 تحويل بيني مستودعي (Transfers)
        </button>
        <button
          onClick={() => setSubTab("adjustments")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "adjustments" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          ⚖️ تسوية الجرد والمالية (Adjustments)
        </button>
        <button
          onClick={() => setSubTab("bom")}
          className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${subTab === "bom" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
        >
          🏭 تجميع المنتجات (BOM Assembly)
        </button>
      </div>

      {/* --- SUBTAB 1: TRANSFERS MANAGEMENT --- */}
      {subTab === "transfers" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Initiate Transfer Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              طلب تحويل بيني مستودعي (New Transfer Order)
            </h3>

            <form onSubmit={handleInitiateTransfer} className="space-y-4 text-xs font-bold">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-400 mb-1">من مستودع (مصدر)</label>
                  <select
                    required
                    value={transSourceWh}
                    onChange={(e) => setTransSourceWh(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">-- اختر --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">إلى مستودع (وجهة)</label>
                  <select
                    required
                    value={transDestWh}
                    onChange={(e) => setTransDestWh(e.target.value)}
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                  >
                    <option value="">-- اختر --</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">الصنف المراد تحويله</label>
                <select
                  required
                  value={transItem}
                  onChange={(e) => setTransItem(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر الصنف --</option>
                  {items.map((i) => {
                    const stock = transSourceWh
                      ? Number(i.warehouseQuantities?.[transSourceWh] || 0)
                      : 0;
                    return (
                      <option key={i.id} value={i.id}>
                        {i.nameAr} (متوفر بالمصدر: {stock} حبة)
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">كمية التحويل المطلوبة</label>
                <input
                  type="number"
                  required
                  value={transQty}
                  onChange={(e) => setTransQty(e.target.value)}
                  placeholder="مثال: 15"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  ملاحظات وسند الشحن (مهم للجمارك والضرائب)
                </label>
                <textarea
                  value={transNotes}
                  onChange={(e) => setTransNotes(e.target.value)}
                  placeholder="مثال: تغطية نقص فروع المنطقة الغربية"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                شحن وتحويل البضائع قيد العبور
              </button>
            </form>
          </div>

          {/* Transfers Activity Monitor */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2 flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 text-emerald-600" />
                مراقبة الشحنات والتحويلات النشطة (Transfer Operations Logs)
              </h3>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {transfers.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 font-bold">
                    لا توجد عمليات تحويل جارية حالياً.
                  </div>
                ) : (
                  transfers.map((t) => {
                    const fromWh =
                      warehouses.find((w) => w.id === t.sourceWarehouseId)?.nameAr ||
                      t.sourceWarehouseId;
                    const toWh =
                      warehouses.find((w) => w.id === t.destinationWarehouseId)?.nameAr ||
                      t.destinationWarehouseId;

                    return (
                      <div
                        key={t.id}
                        className="p-4 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl flex items-center justify-between gap-4"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-black text-indigo-600">
                            ID: {t.id.substring(0, 8).toUpperCase()}
                          </span>
                          <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                            {t.itemName} ({t.quantity} حبة)
                          </span>
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-400">
                            <span>
                              من:{" "}
                              <strong className="text-zinc-600 dark:text-zinc-300">{fromWh}</strong>
                            </span>
                            <span>➔</span>
                            <span>
                              إلى:{" "}
                              <strong className="text-zinc-600 dark:text-zinc-300">{toWh}</strong>
                            </span>
                          </div>
                          {t.notes && (
                            <p className="text-[10px] text-zinc-400 italic">ملاحظة: {t.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-black ${t.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700 animate-pulse"}`}
                          >
                            {t.status === "completed" ? "تم الاستلام" : "قيد العبور"}
                          </span>

                          <button
                            onClick={() => generateTransferPdf(t)}
                            className="p-1.5 bg-zinc-50 hover:bg-indigo-50 border rounded-lg hover:text-indigo-600"
                            title="تحميل سند التحويل PDF"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {t.status !== "completed" && (
                            <button
                              onClick={() => handleCompleteTransferClick(t)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black"
                            >
                              تأكيد الاستلام
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 2: STOCK ADJUSTMENTS & GL ACCOUNTS INTEGRATION --- */}
      {subTab === "adjustments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Stock Adjustment Form */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              قيد تسوية مخزنية وتصحيح الجرد (Inventory Adjustment)
            </h3>

            <form onSubmit={handleExecuteAdjustment} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">المستودع المستهدف</label>
                <select
                  required
                  value={adjWh}
                  onChange={(e) => setAdjWh(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر المستودع --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">الصنف المستهدف بالتعديل</label>
                <select
                  required
                  value={adjItem}
                  onChange={(e) => setAdjItem(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر الصنف --</option>
                  {items.map((i) => {
                    const curStock = adjWh ? Number(i.warehouseQuantities?.[adjWh] || 0) : 0;
                    return (
                      <option key={i.id} value={i.id}>
                        {i.nameAr} (الرصيد بالموقع: {curStock} حبة)
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Adjustment Action Types */}
              <div className="grid grid-cols-3 gap-2 border bg-zinc-50 dark:bg-zinc-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAdjType("add")}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${adjType === "add" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-400"}`}
                >
                  إضافة مخزون (+)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("subtract")}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${adjType === "subtract" ? "bg-white dark:bg-zinc-900 text-red-600 shadow-sm" : "text-zinc-400"}`}
                >
                  صرف / تصفية (-)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjType("set")}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${adjType === "set" ? "bg-white dark:bg-zinc-900 text-amber-650 shadow-sm" : "text-zinc-400"}`}
                >
                  تعيين ثابت (=)
                </button>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">الكمية الخاضعة للتسوية</label>
                <input
                  type="number"
                  required
                  value={adjQty}
                  onChange={(e) => setAdjQty(e.target.value)}
                  placeholder="0"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>

              {/* Reason selection */}
              <div>
                <label className="block text-zinc-400 mb-1">سبب التسوية / الفروقات</label>
                <select
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="Discrepancy">فروقات جرد دوري (Discrepancy)</option>
                  <option value="Damaged">تلف في البضاعة / كسر (Damaged)</option>
                  <option value="Lost">بضائع مفقودة (Lost)</option>
                  <option value="Found">بضائع معثور عليها زائدة (Found)</option>
                  <option value="Gift">توزيع هدايا وتجربة (Gift)</option>
                </select>
              </div>

              {/* Accounting integration (GL Account & Cost center) */}
              <div className="border border-indigo-100 p-3.5 rounded-2xl bg-indigo-50/20 space-y-3">
                <h4 className="text-[10px] font-black text-indigo-600 flex items-center gap-1">
                  <Landmark className="w-3.5 h-3.5" />
                  أطراف المحاسبة المالية المتكاملة (GL Integrations)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <label className="block text-zinc-400 mb-1">الحساب المقابل</label>
                    <select
                      value={adjGlAccount}
                      onChange={(e) => setAdjGlAccount(e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg cursor-pointer font-sans"
                    >
                      {GL_ACCOUNTS.map((ac) => (
                        <option key={ac.code} value={ac.code}>
                          {ac.code} - {ac.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">مركز التكلفة</label>
                    <select
                      value={adjCostCenter}
                      onChange={(e) => setAdjCostCenter(e.target.value)}
                      className="w-full p-2 bg-white border rounded-lg cursor-pointer font-sans"
                    >
                      {COST_CENTERS.map((cc) => (
                        <option key={cc.code} value={cc.code}>
                          {cc.code} - {cc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">شرح وتفاصيل السند الجردي</label>
                <textarea
                  value={adjNotes}
                  onChange={(e) => setAdjNotes(e.target.value)}
                  placeholder="يرجى كتابة أرقام المحاضر الرسمية لتوثيق التسوية للتفتيش الضريبي..."
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                  rows={2}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-1.5"
              >
                تطبيق التسوية وإصدار القيد المحاسبي المتوازن 📊
              </button>
            </form>
          </div>

          {/* Audit trail of stock adjustments */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
              سجل التدقيق المستندى لتسويات الجرد المعتمدة (Adjustment Audit Trail)
            </h3>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
              {adjustments.length === 0 ? (
                <div className="py-12 text-center text-zinc-400 font-bold">
                  لا توجد تسويات جرد مسجلة.
                </div>
              ) : (
                adjustments.map((a, idx) => {
                  const matchingGl =
                    GL_ACCOUNTS.find((g) => g.code === a.glAccount)?.name || a.glAccount;
                  const matchingCc =
                    COST_CENTERS.find((c) => c.code === a.costCenter)?.name || a.costCenter;
                  return (
                    <div
                      key={idx}
                      className="p-4 border border-zinc-50 dark:border-zinc-800 rounded-2xl space-y-3 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                            {a.itemName}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            SKU: {a.sku} • مستودع:{" "}
                            {warehouses.find((w) => w.id === a.warehouseId)?.nameAr ||
                              a.warehouseId}
                          </span>
                        </div>
                        <div className="text-left">
                          <span
                            className={`px-2 py-1 rounded font-mono font-black text-xs block ${a.type === "add" ? "bg-emerald-50 text-emerald-700" : a.type === "subtract" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}
                          >
                            {a.type === "add" ? "+" : a.type === "subtract" ? "-" : "="}{" "}
                            {a.quantity} حبة
                          </span>
                        </div>
                      </div>

                      <div className="bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl grid grid-cols-2 gap-2 text-[10px] text-zinc-500 font-bold">
                        <div>
                          <span>سبب التسوية: </span>
                          <strong className="text-zinc-700 dark:text-zinc-300">
                            {reasonTranslations[a.reason || ""] || a.reason}
                          </strong>
                        </div>
                        <div>
                          <span>الحساب المقابل: </span>
                          <strong className="text-indigo-600 font-mono">{matchingGl}</strong>
                        </div>
                        <div>
                          <span>مركز التكلفة: </span>
                          <strong className="text-zinc-700 dark:text-zinc-300 font-sans">
                            {matchingCc}
                          </strong>
                        </div>
                        <div>
                          <span>المسؤول: </span>
                          <strong className="text-zinc-700 dark:text-zinc-300">
                            أمين المستودع العام
                          </strong>
                        </div>
                      </div>

                      {a.notes && (
                        <p className="text-[10px] text-zinc-400 font-bold bg-zinc-50 dark:bg-zinc-800/30 p-2 rounded-lg italic">
                          ملاحظة: {a.notes}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: BILL OF MATERIALS & ASSEMBLY (MANUFACTURING) --- */}
      {subTab === "bom" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Assemble manufacturing order card */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              أمر تصنيع وتجميع فوري (Build & Assemble BOM)
            </h3>

            <div className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">
                  المنتج النهائي المطلوب تجميعه (BOM Product)
                </label>
                <select
                  required
                  value={assemblyProduct}
                  onChange={(e) => setAssemblyProduct(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر صنف تجميعي --</option>
                  {items
                    .filter((i) => i.bomComponents && i.bomComponents.length > 0)
                    .map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nameAr} ({i.sku})
                      </option>
                    ))}
                </select>
                <span className="text-[9px] text-zinc-400 mt-1 block">
                  * يظهر فقط الأصناف التي تمتلك تركيبة مادية (BOM) مدخلة في النظام.
                </span>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">مستودع الإنتاج والتجميع المضيف</label>
                <select
                  required
                  value={assemblyWh}
                  onChange={(e) => setAssemblyWh(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- اختر المستودع --</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">
                  الكمية المستهدفة للتجميع (كمية الإنتاج)
                </label>
                <input
                  type="number"
                  value={assemblyQty}
                  onChange={(e) => setAssemblyQty(e.target.value)}
                  placeholder="10"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>

              {assemblyProduct && (
                <div className="border border-indigo-100 p-4 rounded-2xl bg-indigo-50/20 space-y-2">
                  <h4 className="text-[10px] font-black text-indigo-600">
                    تقرير جاهزية خط الإنتاج:
                  </h4>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-bold">
                    {assemblyReadiness.msg}
                  </p>
                </div>
              )}

              <button
                onClick={handleAssembleBOM}
                disabled={!assemblyProduct || !assemblyReadiness.ready}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none flex items-center justify-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                تجميع وإنتاج الصنف التام الصنع
              </button>
            </div>
          </div>

          {/* BOM Breakdown and component checking */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
              هيكلية المكونات والمواد اللازمة (Bill of Materials Breakdown)
            </h3>

            {assemblyProduct ? (
              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-zinc-400 block">المنتج المستهدف:</span>
                    <strong className="text-sm text-zinc-900 dark:text-zinc-100 block">
                      {items.find((i) => i.id === assemblyProduct)?.nameAr}
                    </strong>
                  </div>
                  <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-[10px] rounded-lg font-black font-mono">
                    SKU: {items.find((i) => i.id === assemblyProduct)?.sku}
                  </span>
                </div>

                <div className="overflow-x-auto text-xs font-bold text-right">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-zinc-100 dark:bg-zinc-800 border-b text-[10px] text-zinc-400 font-bold">
                        <th className="p-3">المادة الخام / الجزء</th>
                        <th className="p-3">رمز SKU</th>
                        <th className="p-3">الكمية المستهلكة لكل قطعة</th>
                        <th className="p-3">إجمالي الاحتياج للطلب</th>
                        <th className="p-3 text-center">المتوفر في المستودع المحدد</th>
                        <th className="p-3">حالة الجاهزية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBOMComponents.map((comp: any, idx: number) => {
                        const neededTotal = comp.quantity * (Number(assemblyQty) || 1);
                        const hasSufficient = comp.currentStockInWh >= neededTotal;

                        return (
                          <tr key={idx} className="border-b">
                            <td className="p-3 text-zinc-900 dark:text-zinc-100 font-black">
                              {comp.name}
                            </td>
                            <td className="p-3 font-mono">{comp.sku}</td>
                            <td className="p-3 font-mono text-zinc-500">{comp.quantity} حبة</td>
                            <td className="p-3 font-mono text-indigo-600 font-black">
                              {neededTotal} حبة
                            </td>
                            <td className="p-3 font-mono text-center">
                              {comp.currentStockInWh} حبة
                            </td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[9px] font-black inline-block ${hasSufficient ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
                              >
                                {hasSufficient ? "متوفر" : "غير كافي"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
                <ClipboardList className="w-8 h-8 text-zinc-300" />
                يرجى تحديد صنف تجميعي من لوحة التحكم لإظهار المواد والمكونات المادية المكونة له
                (BOM) والتحقق من أرصدة المواد الخام ومستويات كفايتها.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
