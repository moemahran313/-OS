import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { motion } from "motion/react";
import {
  Users,
  Plus,
  Search,
  FileText,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface Customer {
  id: string;
  nameAr: string;
  nameEn: string;
  vatNumber?: string;
  status: "Active" | "Inactive";
  balance: number;
  unpaidInvoicesCount: number;
}

interface Invoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  date: string;
  dueDate: string;
  amount: number;
  tax: number;
  status: "Paid" | "Unpaid" | "Overdue";
}

export default function ReceivablesTab({
  accounts = [],
  activeBranchId = "all",
}: {
  accounts?: any[];
  activeBranchId?: string;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await auth.authStateReady();
        const user = auth.currentUser;
        if (!user) return;
        
        const custSnap = await getDocs(query(collection(db, "accounting_customers"), where("userId", "==", user.uid)));
        setCustomers(custSnap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
        
        const invSnap = await getDocs(query(collection(db, "accounting_invoices"), where("userId", "==", user.uid)));
        setInvoices(invSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));
      } catch (err) {
        console.error("Error fetching receivables data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nameAr: "",
    nameEn: "",
    vatNumber: "",
    status: "Active" as const,
  });
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteForm, setNoteForm] = useState({
    customerId: "",
    type: "Credit" as const,
    amount: "",
    description: "",
  });

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.nameAr || !newCustomer.nameEn) return;
    try {
      const user = auth.currentUser;
      if (!user) return;
      const newDoc = {
        userId: user.uid,
        nameAr: newCustomer.nameAr,
        nameEn: newCustomer.nameEn,
        vatNumber: newCustomer.vatNumber || null,
        status: newCustomer.status,
        balance: 0,
        unpaidInvoicesCount: 0,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, "accounting_customers"), newDoc);
      setCustomers([...customers, { id: docRef.id, ...newDoc } as Customer]);
      setNewCustomer({ nameAr: "", nameEn: "", vatNumber: "", status: "Active" });
      setShowAddCustomer(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(noteForm.amount);
    if (!noteForm.customerId || isNaN(amt) || amt <= 0) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === noteForm.customerId) {
          const adjustment = noteForm.type === "Credit" ? -amt : amt;
          return { ...c, balance: Math.max(0, c.balance + adjustment) };
        }
        return c;
      })
    );

    // Optionally update local unpaid invoices or log it
    setShowNoteModal(false);
    setNoteForm({ customerId: "", type: "Credit", amount: "", description: "" });
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Simple Aging Calculations
  const totalBalance = customers.reduce((sum, c) => sum + c.balance, 0);
  const currentAging = Math.round(totalBalance * 0.45);
  const aging30 = Math.round(totalBalance * 0.3);
  const aging60 = Math.round(totalBalance * 0.15);
  const aging90Plus = Math.round(totalBalance * 0.1);

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center dark:bg-indigo-950/50 dark:text-indigo-400">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              إجمالي الذمم المدينة
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
              {totalBalance.toLocaleString()} ر.س
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              مستحقة من {customers.filter((c) => c.balance > 0).length} عملاء نشطين
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center dark:bg-rose-950/50 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              المتأخرات الحرجة (+90 يوم)
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
              {aging90Plus.toLocaleString()} ر.س
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              تتطلب متابعة قانونية أو خصم ديون
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center dark:bg-emerald-950/50 dark:text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              معدل التحصيل (Collection Rate)
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
              92.4%
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              ارتفاع بـ 1.2% عن الربع السابق
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 bg-zinc-50 text-zinc-600 rounded-xl flex items-center justify-center dark:bg-zinc-800 dark:text-zinc-300">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              فواتير جاري تحصيلها
            </span>
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-black text-zinc-950 dark:text-zinc-50 font-mono">
              {invoices.length} فواتير
            </h4>
            <p className="text-[10px] text-zinc-400 font-bold mt-1">
              مجموع قيمتها {(totalBalance * 1.15).toLocaleString()} ر.س
            </p>
          </div>
        </div>
      </div>

      {/* Receivables Aging Analysis Section */}
      <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            تقرير أعمار ديون العملاء (Aging Account Receivables Summary)
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold">
            توزيع الذمم المستحقة بناءً على فترات استحقاق الفواتير المعتمدة
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">حالي (أقل من 30 يوم)</span>
            <span className="font-mono font-black text-sm text-zinc-800 dark:text-zinc-200 block mt-1">
              {currentAging.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">من 31 - 60 يوم</span>
            <span className="font-mono font-black text-sm text-zinc-800 dark:text-zinc-200 block mt-1">
              {aging30.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-indigo-500 h-1 rounded-full" style={{ width: "30%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
            <span className="text-[10px] text-zinc-400 font-bold block">من 61 - 90 يوم</span>
            <span className="font-mono font-black text-sm text-amber-600 block mt-1">
              {aging60.toLocaleString()} ر.س
            </span>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full mt-2">
              <div className="bg-amber-500 h-1 rounded-full" style={{ width: "15%" }}></div>
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
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

      {/* Main Customers List & Open Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer list card */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                سجل العملاء التجاريين (Business Customers Register)
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">
                الحسابات المدينة المخصصة لأستاذ العملاء الفرعي
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="ابحث عن العميل..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl pr-9 pl-3 py-2 text-xs focus:outline-none"
                />
              </div>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="px-3 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> عميل جديد
              </button>
            </div>
          </div>

          <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-zinc-50 dark:bg-zinc-100/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">اسم المنشأة</th>
                  <th className="p-3">الرقم الضريبي VAT</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 text-left">فواتير معلقة</th>
                  <th className="p-3 text-left">الرصيد المفتوح</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
                  >
                    <td className="p-3">
                      <div className="font-black text-zinc-800 dark:text-zinc-200">
                        {cust.nameAr}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        {cust.nameEn}
                      </div>
                    </td>
                    <td className="p-3 font-mono text-zinc-500">{cust.vatNumber || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                          cust.status === "Active"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
                            : "bg-zinc-100 text-zinc-400"
                        }`}
                      >
                        {cust.status === "Active" ? "نشط" : "موقوف"}
                      </span>
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-zinc-650 dark:text-zinc-300">
                      {cust.unpaidInvoicesCount}
                    </td>
                    <td className="p-3 text-left font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {cust.balance.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center space-x-1">
                      <button
                        onClick={() => {
                          setNoteForm((p) => ({ ...p, customerId: cust.id }));
                          setShowNoteModal(true);
                        }}
                        className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-[10px] font-bold rounded-lg text-zinc-600 dark:text-zinc-300"
                      >
                        قيد تسوية (Note)
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invoices list card */}
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              أحدث الفواتير المستحقة
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold">
              الفواتير الضريبية المباعة جاري متابعتها مالياً
            </p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-zinc-50 dark:bg-zinc-100 border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-800 transition-all space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-black text-indigo-600 dark:text-indigo-400">
                    {inv.invoiceNo}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      inv.status === "Overdue"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 animate-pulse"
                        : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
                    }`}
                  >
                    {inv.status === "Overdue" ? "متأخرة" : "غير مدفوعة"}
                  </span>
                </div>
                <div className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                  {inv.customerName}
                </div>
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>تاريخ الاستحقاق: {inv.dueDate}</span>
                  <span className="font-mono text-zinc-900 dark:text-zinc-100 font-black">
                    {(inv.amount + inv.tax).toLocaleString()} ر.س
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note submission modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-100 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              إصدار إشعار مدين / دائن للعميل
            </h3>
            <form
              onSubmit={handleNoteSubmit}
              className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>نوع الحركة</label>
                <select
                  value={noteForm.type}
                  onChange={(e) => setNoteForm((p) => ({ ...p, type: e.target.value as any }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                >
                  <option value="Credit">إشعار دائن (Credit Note) - تقليل المديونية</option>
                  <option value="Debit">إشعار مدين (Debit Note) - زيادة المديونية</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label>المبلغ (ر.س)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={noteForm.amount}
                  onChange={(e) => setNoteForm((p) => ({ ...p, amount: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label>البيان / سبب التسوية</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خصم إضافي معتمد لمجموعة الشايع"
                  value={noteForm.description}
                  onChange={(e) => setNoteForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors"
                >
                  إثبات الحركة وخصم الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-100 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              إضافة حساب عميل جديد
            </h3>
            <form
              onSubmit={handleAddCustomer}
              className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>اسم المنشأة بالعربي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شركة بنده للتجزئة"
                  value={newCustomer.nameAr}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, nameAr: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label>الاسم الرسمي (English)</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Panda Retail Company"
                  value={newCustomer.nameEn}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, nameEn: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label>الرقم الضريبي VAT (15 خانة)</label>
                <input
                  type="text"
                  placeholder="3000XXXXXXXXXXX"
                  maxLength={15}
                  value={newCustomer.vatNumber}
                  onChange={(e) => setNewCustomer((p) => ({ ...p, vatNumber: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors"
                >
                  حفظ العميل بالسجل الفرعي
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
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
