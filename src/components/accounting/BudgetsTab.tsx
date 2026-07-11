import React, { useState } from "react";
import { motion } from "motion/react";
import {
  PiggyBank,
  Plus,
  Search,
  Calendar,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowRightLeft,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface BudgetAllocation {
  id: string;
  accountCode: string;
  accountName: string;
  department: string;
  annualBudget: number;
  actualSpent: number;
}

export default function BudgetsTab() {
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([
    {
      id: "b-1",
      accountCode: "501001",
      accountName: "مصاريف التسويق الرقمي والدعاية",
      department: "Marketing",
      annualBudget: 150000,
      actualSpent: 165000,
    },
    {
      id: "b-2",
      accountCode: "502005",
      accountName: "إيجارات المكاتب والفروع",
      department: "HR & Admin",
      annualBudget: 450000,
      actualSpent: 410000,
    },
    {
      id: "b-3",
      accountCode: "505001",
      accountName: "البحوث والتطوير والبرمجيات",
      department: "Engineering",
      annualBudget: 300000,
      actualSpent: 120000,
    },
    {
      id: "b-4",
      accountCode: "504003",
      accountName: "مصاريف السفر والضيافة التنفيذية",
      department: "Sales",
      annualBudget: 60000,
      actualSpent: 59000,
    },
  ]);

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudget, setNewBudget] = useState({
    accountCode: "",
    accountName: "",
    department: "Marketing",
    annualBudget: "",
  });

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newBudget.annualBudget);
    if (!newBudget.accountCode || !newBudget.accountName || isNaN(amt) || amt <= 0) return;

    const added: BudgetAllocation = {
      id: "b-" + (allocations.length + 1),
      accountCode: newBudget.accountCode,
      accountName: newBudget.accountName,
      department: newBudget.department,
      annualBudget: amt,
      actualSpent: 0,
    };

    setAllocations([...allocations, added]);
    setShowAddBudget(false);
    setNewBudget({ accountCode: "", accountName: "", department: "Marketing", annualBudget: "" });
  };

  const totalBudget = allocations.reduce((sum, a) => sum + a.annualBudget, 0);
  const totalSpent = allocations.reduce((sum, a) => sum + a.actualSpent, 0);
  const totalVariance = totalBudget - totalSpent;

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            إجمالي الميزانية السنوية المعتمدة (Total Budget)
          </span>
          <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono mt-2">
            {totalBudget.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            تغطي {allocations.length} مراكز بنود تشغيلية رئيسية
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            إجمالي الإنفاق الفعلي (Actual Spent)
          </span>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-2">
            {totalSpent.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            يمثل نسبة صرف قدرها {((totalSpent / totalBudget) * 100).toFixed(1)}% من الميزانية
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            التباين المتبقي / الوفورات (Variance)
          </span>
          <h4
            className={`text-xl font-black font-mono mt-2 ${totalVariance >= 0 ? "text-emerald-600" : "text-rose-600"}`}
          >
            {totalVariance.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            {totalVariance >= 0 ? "معدل وفر إيجابي بالموازنات" : "تجاوز في بنود الخطة المعتمدة"}
          </p>
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            مراقبة وتعديل الموازنات التقديرية للشركة
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold">
            ربط البنود التقديرية بمراكز التكلفة والقطاعات التنظيمية لتجنب الهدر المالي
          </p>
        </div>
        <button
          onClick={() => setShowAddBudget(true)}
          className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> تخصيص موازنة جديدة
        </button>
      </div>

      {/* Variance Analysis Table */}
      <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-zinc-50 dark:bg-zinc-100/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="p-3">بند الموازنة (المصروف المالي)</th>
              <th className="p-3">رمز الحساب</th>
              <th className="p-3">القسم / مركز التكلفة</th>
              <th className="p-3 text-left">الميزانية التقديرية</th>
              <th className="p-3 text-left">المنصرف الفعلي</th>
              <th className="p-3 text-left">التباين (Variance)</th>
              <th className="p-3 text-center">نسبة الاستهلاك</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((item) => {
              const variance = item.annualBudget - item.actualSpent;
              const ratio = Math.min(100, (item.actualSpent / item.annualBudget) * 100);
              const isOverspent = variance < 0;

              return (
                <tr
                  key={item.id}
                  className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
                >
                  <td className="p-3">
                    <div className="font-black text-zinc-850 dark:text-zinc-150">
                      {item.accountName}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-zinc-500 font-bold">{item.accountCode}</td>
                  <td className="p-3 font-bold">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                      {item.department}
                    </span>
                  </td>
                  <td className="p-3 text-left font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {item.annualBudget.toLocaleString()} ر.س
                  </td>
                  <td className="p-3 text-left font-mono text-zinc-800 dark:text-zinc-200">
                    {item.actualSpent.toLocaleString()} ر.س
                  </td>
                  <td
                    className={`p-3 text-left font-mono font-black ${isOverspent ? "text-rose-600" : "text-emerald-600"}`}
                  >
                    {isOverspent ? "" : "+"}
                    {variance.toLocaleString()} ر.س
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-mono text-[10px] font-black">{ratio.toFixed(0)}%</span>
                      <div className="w-16 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full">
                        <div
                          className={`h-1.5 rounded-full ${isOverspent ? "bg-rose-500" : ratio > 85 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${ratio}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-100 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              تخصيص بند ميزانية تقديرية جديدة
            </h3>
            <form
              onSubmit={handleAddBudget}
              className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>كود الحساب المحاسبي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 501001"
                  value={newBudget.accountCode}
                  onChange={(e) => setNewBudget((p) => ({ ...p, accountCode: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label>اسم بند المصروف / الموازنة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ميزانية خدمات التسويق والإعلانات"
                  value={newBudget.accountName}
                  onChange={(e) => setNewBudget((p) => ({ ...p, accountName: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label>المؤسسة / القسم المعني</label>
                  <select
                    value={newBudget.department}
                    onChange={(e) => setNewBudget((p) => ({ ...p, department: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                  >
                    <option value="Marketing">التسويق والمبيعات (Marketing)</option>
                    <option value="HR & Admin">الموارد البشرية والإدارة (HR & Admin)</option>
                    <option value="Engineering">الهندسة والتطوير (Engineering)</option>
                    <option value="Sales">فريق المبيعات (Sales)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label>الموازنة التقديرية (ر.س)</label>
                  <input
                    type="number"
                    required
                    placeholder="0.00"
                    value={newBudget.annualBudget}
                    onChange={(e) => setNewBudget((p) => ({ ...p, annualBudget: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors"
                >
                  حفظ وتطبيق الموازنة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
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
