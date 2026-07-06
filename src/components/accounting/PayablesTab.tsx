import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Building2,
  Plus,
  Search,
  FileSpreadsheet,
  ArrowDownLeft,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface Supplier {
  id: string;
  nameAr: string;
  nameEn: string;
  vatNumber?: string;
  status: "Active" | "Inactive";
  balance: number;
  unpaidBillsCount: number;
}

interface Bill {
  id: string;
  billNo: string;
  supplierName: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  status: "Paid" | "Unpaid" | "Overdue";
}

export default function PayablesTab({
  accounts = [],
  activeBranchId = "all",
}: {
  accounts?: any[];
  activeBranchId?: string;
}) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: "supp-1",
      nameAr: "مؤسسة التوريدات اللوجستية",
      nameEn: "Logistics Supplies Est.",
      vatNumber: "310334455600003",
      status: "Active",
      balance: 65000,
      unpaidBillsCount: 2,
    },
    {
      id: "supp-2",
      nameAr: "شركة الخرسانة المتكاملة",
      nameEn: "Integrated Concrete Co.",
      vatNumber: "300445566700003",
      status: "Active",
      balance: 140000,
      unpaidBillsCount: 3,
    },
    {
      id: "supp-3",
      nameAr: "عالم التقنية للاستيراد",
      nameEn: "Import Tech World Ltd.",
      vatNumber: "310556677800003",
      status: "Active",
      balance: 0,
      unpaidBillsCount: 0,
    },
    {
      id: "supp-4",
      nameAr: "مصنع الرياض لقطع الغيار",
      nameEn: "Riyadh Spare Parts Factory",
      vatNumber: "300667788900003",
      status: "Active",
      balance: 35000,
      unpaidBillsCount: 1,
    },
  ]);

  const [bills, setBills] = useState<Bill[]>([
    {
      id: "bill-201",
      billNo: "BILL-2026-081",
      supplierName: "مؤسسة التوريدات اللوجستية",
      date: "2026-05-01",
      dueDate: "2026-06-01",
      amount: 40000,
      tax: 6000,
      status: "Unpaid",
    },
    {
      id: "bill-202",
      billNo: "BILL-2026-082",
      supplierName: "شركة الخرسانة المتكاملة",
      date: "2026-04-10",
      dueDate: "2026-05-10",
      amount: 90000,
      tax: 13500,
      status: "Overdue",
    },
    {
      id: "bill-203",
      billNo: "BILL-2026-083",
      supplierName: "مصنع الرياض لقطع الغيار",
      date: "2026-05-12",
      dueDate: "2026-06-12",
      amount: 35000,
      tax: 5250,
      status: "Unpaid",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    nameAr: "",
    nameEn: "",
    vatNumber: "",
    status: "Active" as const,
  });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    supplierId: "",
    amount: "",
    method: "Bank Transfer",
    description: "",
  });

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.nameAr || !newSupplier.nameEn) return;
    const added: Supplier = {
      id: "supp-" + (suppliers.length + 1),
      nameAr: newSupplier.nameAr,
      nameEn: newSupplier.nameEn,
      vatNumber: newSupplier.vatNumber || undefined,
      status: newSupplier.status,
      balance: 0,
      unpaidBillsCount: 0,
    };
    setSuppliers([...suppliers, added]);
    setNewSupplier({ nameAr: "", nameEn: "", vatNumber: "", status: "Active" });
    setShowAddSupplier(false);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentForm.amount);
    if (!paymentForm.supplierId || isNaN(amt) || amt <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === paymentForm.supplierId) {
          return { ...s, balance: Math.max(0, s.balance - amt) };
        }
        return s;
      })
    );

    setShowPaymentModal(false);
    setPaymentForm({ supplierId: "", amount: "", method: "Bank Transfer", description: "" });
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = suppliers.reduce((sum, s) => sum + s.balance, 0);
  const currentAging = Math.round(totalBalance * 0.4);
  const aging30 = Math.round(totalBalance * 0.35);
  const aging60 = Math.round(totalBalance * 0.15);
  const aging90Plus = Math.round(totalBalance * 0.1);

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center dark:bg-rose-950/50 dark:text-rose-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              إجمالي الذمم الدائنة
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {totalBalance.toLocaleString()} ر.س
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              مستحقة لـ {suppliers.filter((s) => s.balance > 0).length} موردين نشطين
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center dark:bg-amber-950/50 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              فواتير مستحقة الدفع قريباً
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-amber-600 font-mono">
              {(totalBalance * 0.6).toLocaleString()} ر.س
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              تستحق خلال الـ 14 يوماً القادمة
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center dark:bg-emerald-950/50 dark:text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              المدفوعات المسددة هذا الشهر
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              315,000 ر.س
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              عبر التحويلات والاعتمادات المستندية
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-zinc-50 text-zinc-600 rounded-xl flex items-center justify-center dark:bg-zinc-800 dark:text-zinc-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              فواتير شراء قيد الانتظار
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-zinc-950 dark:text-zinc-5 font-mono">
              {bills.length} فواتير معلقة
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              بانتظار مطابقة الفحص والفوترة
            </p>
          </div>
        </div>
      </div>

      {/* Payables Aging Analysis Summary */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            تقرير أعمار ديون الموردين (Aging Account Payables Summary)
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold">
            جدولة مستحقات الموردين لدعم تخطيط التدفق النقدي التشغيلي
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">مستحق حالي</span>
            <span className="font-mono font-black text-sm text-zinc-800 dark:text-zinc-200 block mt-1">
              {currentAging.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "40%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">من 31 - 60 يوم</span>
            <span className="font-mono font-black text-sm text-zinc-800 dark:text-zinc-200 block mt-1">
              {aging30.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-indigo-500 h-1 rounded-full" style={{ width: "35%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">من 61 - 90 يوم</span>
            <span className="font-mono font-black text-sm text-amber-600 block mt-1">
              {aging60.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: "15%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">أكثر من 90 يوم</span>
            <span className="font-mono font-black text-sm text-rose-600 block mt-1">
              {aging90Plus.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-rose-500 h-1 rounded-full" style={{ width: "10%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Suppliers list and outstanding Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-rose-500" />
                سجل الموردين التجاريين (Business Suppliers Register)
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">
                الحسابات الدائنة المخصصة لأستاذ الموردين الفرعي
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ابحث عن مورد..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddSupplier(true)}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> مورد جديد
              </button>
            </div>
          </div>

          <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">اسم المورد</th>
                  <th className="p-3">الرقم الضريبي VAT</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-left">فواتير مستحقة</th>
                  <th className="p-3 text-left">مجموع المديونية</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supp) => (
                  <tr
                    key={supp.id}
                    className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
                  >
                    <td className="p-3">
                      <div className="font-black text-zinc-800 dark:text-zinc-200">
                        {supp.nameAr}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {supp.nameEn}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-zinc-500">{supp.vatNumber || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                          supp.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {supp.status === "Active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-zinc-650 dark:text-zinc-300">
                      {supp.unpaidBillsCount}
                    </td>
                    <td className="p-3 text-left font-mono font-black text-rose-600">
                      {supp.balance.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => {
                          setPaymentForm((p) => ({ ...p, supplierId: supp.id }));
                          setShowPaymentModal(true);
                        }}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-[10px] font-bold rounded-lg text-rose-600 dark:bg-rose-950/30 dark:text-rose-400"
                      >
                        سداد دفعة (Pay)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bills list card */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-rose-500" />
              أحدث فواتير المشتريات المعلقة
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold">
              فواتير مخصصة للصرف تتبع الموازنة الإدارية
            </p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-800 transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-black text-rose-600 dark:text-rose-400">
                    {bill.billNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      bill.status === "Overdue"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30"
                    }`}
                  >
                    {bill.status === "Overdue" ? "متأخرة" : "غير مدفوعة"}
                  </span>
                </div>
                <div className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                  {bill.supplierName}
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>تاريخ الاستحقاق: {bill.dueDate}</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 font-black">
                    {(bill.amount + bill.tax).toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment submission modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              تسجيل سداد دفعة جديدة لمورد
            </h3>
            <form
              onSubmit={handlePaymentSubmit}
              className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>وسيلة الدفع والتمويل</label>
                <select
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, method: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                >
                  <option value="Bank Transfer">تحويل بنكي (Bank Transfer)</option>
                  <option value="Check">شيك بنكي مؤجل (Check)</option>
                  <option value="Cash">صندوق النقدية (Cash in Hand)</option>
                  <option value="Letter of Credit">اعتماد مستندي (L/C)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label>المبلغ المدفوع (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label>البيان / مرجع السداد</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: تسوية دفعة الحساب رقم TR-9824"
                  value={paymentForm.description}
                  onChange={(e) => setPaymentForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-colors"
                >
                  إثبات السداد وتخفيض الالتزام
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Supplier Modal */}
      {showAddSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              إضافة مورد تجاري جديد
            </h3>
            <form
              onSubmit={handleAddSupplier}
              className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>اسم المورد بالعربي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة تكرير البترول والمصانع"
                  value={newSupplier.nameAr}
                  onChange={(e) => setNewSupplier((p) => ({ ...p, nameAr: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label>اسم المورد (English)</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Petroleum Refining Co."
                  value={newSupplier.nameEn}
                  onChange={(e) => setNewSupplier((p) => ({ ...p, nameEn: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label>الرقم الضريبي للمورد VAT (15 خانة)</label>
                <input
                  type="text"
                  placeholder="3005XXXXXXXXXXX"
                  maxLength={15}
                  value={newSupplier.vatNumber}
                  onChange={(e) => setNewSupplier((p) => ({ ...p, vatNumber: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black transition-colors"
                >
                  حفظ المورد بالسجل الفرعي
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSupplier(false)}
                  className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
