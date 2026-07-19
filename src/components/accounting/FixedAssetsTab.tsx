import React, { useState, useEffect } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import {
  Briefcase,
  Plus,
  Calendar,
  FileText,
  Settings,
  Play,
  ArrowUpRight,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface FixedAsset {
  id: string;
  name: string;
  category: "Buildings" | "Machinery" | "IT Equipment" | "Vehicles";
  purchaseDate: string;
  cost: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: "Straight-Line" | "Declining-Balance";
  accumulatedDepreciation: number;
}

export default function FixedAssetsTab({
  onPostJournal,
}: {
  onPostJournal?: (journal: any) => void;
}) {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await auth.authStateReady();
        const user = auth.currentUser;
        if (!user) return;
        
        const assetsSnap = await getDocs(query(collection(db, "accounting_fixed_assets"), where("userId", "==", user.uid)));
        setAssets(assetsSnap.docs.map(d => ({ id: d.id, ...d.data() } as FixedAsset)));
      } catch (err) {
        console.error("Error fetching fixed assets data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newAsset, setNewAsset] = useState<Omit<FixedAsset, "id" | "accumulatedDepreciation">>({
    name: "",
    category: "IT Equipment",
    purchaseDate: "",
    cost: 0,
    residualValue: 0,
    usefulLifeYears: 5,
    depreciationMethod: "Straight-Line",
  });

  const [depreciationReport, setDepreciationReport] = useState<any[] | null>(null);
  const [isDepreciating, setIsDepreciating] = useState(false);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || newAsset.cost <= 0) return;

    try {
      const user = auth.currentUser;
      if (!user) return;
      
      const newDoc = {
        userId: user.uid,
        ...newAsset,
        accumulatedDepreciation: 0,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "accounting_fixed_assets"), newDoc);
      setAssets([{ id: docRef.id, ...newDoc } as FixedAsset, ...assets]);
      setShowAddAsset(false);
      setNewAsset({
        name: "",
        category: "IT Equipment",
        purchaseDate: "",
        cost: 0,
        residualValue: 0,
        usefulLifeYears: 5,
        depreciationMethod: "Straight-Line",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const calculateDepreciation = () => {
    setIsDepreciating(true);
    setTimeout(() => {
      const report = assets.map((asset) => {
        let monthlyDepreciation = 0;
        if (asset.depreciationMethod === "Straight-Line") {
          // (Cost - Residual) / usefulLifeYears / 12
          monthlyDepreciation = (asset.cost - asset.residualValue) / asset.usefulLifeYears / 12;
        } else {
          // Double declining rate = (2 / usefulLife) * (Cost - Accumulated) / 12
          const rate = 2 / asset.usefulLifeYears;
          monthlyDepreciation = (rate * (asset.cost - asset.accumulatedDepreciation)) / 12;
        }

        // Limit it to remaining book value
        const currentBookValue = asset.cost - asset.accumulatedDepreciation;
        if (monthlyDepreciation > currentBookValue - asset.residualValue) {
          monthlyDepreciation = Math.max(0, currentBookValue - asset.residualValue);
        }

        return {
          id: asset.id,
          name: asset.name,
          cost: asset.cost,
          bookValueBefore: currentBookValue,
          monthlyDep: Math.round(monthlyDepreciation),
          bookValueAfter: Math.round(currentBookValue - monthlyDepreciation),
        };
      });

      setDepreciationReport(report);
      setIsDepreciating(false);
    }, 1200);
  };

  const handlePostDepreciation = () => {
    if (!depreciationReport) return;

    const totalDepValue = depreciationReport.reduce((sum, item) => sum + item.monthlyDep, 0);

    // Trigger update on assets state
    setAssets((prev) =>
      prev.map((asset) => {
        const match = depreciationReport.find((r) => r.id === asset.id);
        if (match) {
          return {
            ...asset,
            accumulatedDepreciation: asset.accumulatedDepreciation + match.monthlyDep,
          };
        }
        return asset;
      })
    );

    if (onPostJournal) {
      // Auto-dispatch journal
      onPostJournal({
        description: `تسجيل قيد الإهلاك الشهري التلقائي للأصول الثابتة - الربع المالي الحالي`,
        lines: [
          {
            accountCode: "508001",
            accountName: "مصروف إهلاك الأصول الثابتة",
            debit: totalDepValue,
            credit: 0,
          },
          {
            accountCode: "108001",
            accountName: "مجمع إهلاك الأصول الثابتة المتراكم",
            debit: 0,
            credit: totalDepValue,
          },
        ],
      });
    }

    setDepreciationReport(null);
  };

  const totalCost = assets.reduce((sum, a) => sum + a.cost, 0);
  const totalAccDep = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0);
  const totalBookValue = totalCost - totalAccDep;

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            القيمة الشرائية الكلية للأصول (Total Cost)
          </span>
          <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono mt-2">
            {totalCost.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            مسجل لـ {assets.length} أصول رئيسية ومستدامة
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            إجمالي مجمع الإهلاك (Accumulated Dep.)
          </span>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-2">
            {totalAccDep.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            يمثل نسبة إهلاك تراكمية بنسبة {((totalAccDep / totalCost) * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <span className="text-[10px] text-zinc-400 font-bold uppercase">
            القيمة الدفترية الحالية (Net Book Value)
          </span>
          <h4 className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            {totalBookValue.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            القيمة المحاسبية الصافية المتبقية بالأستاذ العام
          </p>
        </div>
      </div>

      {/* Controller Buttons */}
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            سجل الأصول والترحيلات الجارية
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold">
            يمكنك إضافة الأصول هنا وتشغيل عملية إهلاك شهري فوري
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={calculateDepreciation}
            disabled={isDepreciating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-indigo-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            {isDepreciating ? "جاري احتساب الإهلاك..." : "تشغيل الإهلاك الشهري"}
          </button>
          <button
            onClick={() => setShowAddAsset(true)}
            className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> إضافة أصل جديد
          </button>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-zinc-50 dark:bg-zinc-100/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
            <tr>
              <th className="p-3">اسم الأصل الثابت</th>
              <th className="p-3">الفئة والتصنيف</th>
              <th className="p-3">طريقة الإهلاك</th>
              <th className="p-3 text-left">التكلفة الأساسية</th>
              <th className="p-3 text-left">مجمع الإهلاك</th>
              <th className="p-3 text-left">القيمة المتبقية</th>
              <th className="p-3 text-center">تاريخ الشراء</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr
                key={asset.id}
                className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
              >
                <td className="p-3">
                  <div className="font-black text-zinc-850 dark:text-zinc-150">{asset.name}</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    رمز: {asset.id.toUpperCase()}
                  </div>
                </td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black bg-zinc-100 text-zinc-650 dark:bg-zinc-800 dark:text-zinc-300">
                    {asset.category === "Buildings"
                      ? "عقارات ومباني"
                      : asset.category === "Machinery"
                        ? "آلات ومعدات"
                        : asset.category === "IT Equipment"
                          ? "أجهزة تقنية"
                          : "سيارات ونقل"}
                  </span>
                </td>
                <td className="p-3 font-bold text-zinc-500">
                  {asset.depreciationMethod === "Straight-Line" ? "قسط ثابت" : "قسط متناقص دوبل"}
                </td>
                <td className="p-3 text-left font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {asset.cost.toLocaleString()} ر.س
                </td>
                <td className="p-3 text-left font-mono text-rose-500">
                  {asset.accumulatedDepreciation.toLocaleString()} ر.س
                </td>
                <td className="p-3 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                  {(asset.cost - asset.accumulatedDepreciation).toLocaleString()} ر.س
                </td>
                <td className="p-3 text-center font-mono text-zinc-400">{asset.purchaseDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Depreciation simulation preview dialog */}
      <AnimatePresence>
        {depreciationReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-100 rounded-3xl max-w-2xl w-full border border-zinc-150 p-6 space-y-6 text-right"
            >
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-500" />
                  معاينة قيد الإهلاك الشهري التلقائي للأصول
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold">
                  تم احتساب قيم الإهلاك بناءً على المعايير المحاسبية المعتمدة للشركة
                </p>
              </div>

              <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-right">
                  <thead className="bg-zinc-50 dark:bg-zinc-100/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="p-3">اسم الأصل الثابت</th>
                      <th className="p-3 text-left">الدفترية الحالية</th>
                      <th className="p-3 text-left text-indigo-600">إهلاك الشهر</th>
                      <th className="p-3 text-left">الدفترية الجديدة</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depreciationReport.map((item) => (
                      <tr key={item.id} className="border-b border-zinc-50 dark:border-zinc-850">
                        <td className="p-3 font-bold">{item.name}</td>
                        <td className="p-3 text-left font-mono">
                          {item.bookValueBefore.toLocaleString()} ر.س
                        </td>
                        <td className="p-3 text-left font-mono font-black text-indigo-650 dark:text-indigo-400">
                          +{item.monthlyDep.toLocaleString()} ر.س
                        </td>
                        <td className="p-3 text-left font-mono font-bold text-zinc-700 dark:text-zinc-300">
                          {item.bookValueAfter.toLocaleString()} ر.س
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-50 dark:bg-zinc-100 font-black">
                      <td className="p-3">الإجمالي التراكمي لدفعة الإهلاك</td>
                      <td className="p-3"></td>
                      <td className="p-3 text-left font-mono text-indigo-600 dark:text-indigo-400">
                        {depreciationReport
                          .reduce((sum, i) => sum + i.monthlyDep, 0)
                          .toLocaleString()}{" "}
                        ر.س
                      </td>
                      <td className="p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Journal double entry representation representation */}
              <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-2">
                <span className="text-[10px] text-zinc-400 font-black block">
                  صيغة القيد المزدوج التلقائي المقترحة للأستاذ العام:
                </span>
                <div className="flex justify-between items-center text-xs font-bold border-b border-zinc-100 dark:border-zinc-850 pb-1.5 mt-2">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    حـ/ مصروف إهلاك الأصول الثابتة (مدين)
                  </span>
                  <span className="font-mono text-emerald-600">
                    {depreciationReport.reduce((sum, i) => sum + i.monthlyDep, 0).toLocaleString()}{" "}
                    ر.س
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-700 dark:text-zinc-300">
                    حـ/ مجمع إهلاك أصول الأستاذ (دائن)
                  </span>
                  <span className="font-mono text-rose-600">
                    {depreciationReport.reduce((sum, i) => sum + i.monthlyDep, 0).toLocaleString()}{" "}
                    ر.s
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePostDepreciation}
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
                >
                  ترحيل القيد المزدوج مباشرة للأستاذ العام
                </button>
                <button
                  onClick={() => setDepreciationReport(null)}
                  className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl text-xs hover:bg-zinc-200 transition-colors"
                >
                  إلغاء المعاينة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Asset Modal */}
      {showAddAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-100 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
          >
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              تسجيل أصل رأسمالي جديد
            </h3>
            <form
              onSubmit={handleAddAsset}
              className="space-y-3 text-xs font-bold text-zinc-700 dark:text-zinc-300"
            >
              <div className="space-y-1.5">
                <label>اسم ووصف الأصل الثابت</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: سيارة مرسيدس نقل للبضائع"
                  value={newAsset.name}
                  onChange={(e) => setNewAsset((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label>تصنيف الأصل</label>
                  <select
                    value={newAsset.category}
                    onChange={(e) =>
                      setNewAsset((p) => ({ ...p, category: e.target.value as any }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                  >
                    <option value="Buildings">مباني وعقارات</option>
                    <option value="Machinery">آلات ومعدات صناعية</option>
                    <option value="IT Equipment">خوادم ومعدات حاسوبية</option>
                    <option value="Vehicles">سيارات وسيارات توزيع</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label>تاريخ الشراء</label>
                  <input
                    type="date"
                    required
                    value={newAsset.purchaseDate}
                    onChange={(e) => setNewAsset((p) => ({ ...p, purchaseDate: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label>التكلفة الأساسية (ر.س)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={newAsset.cost || ""}
                    onChange={(e) =>
                      setNewAsset((p) => ({ ...p, cost: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label>قيمة الخردة / المتبقية</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newAsset.residualValue || ""}
                    onChange={(e) =>
                      setNewAsset((p) => ({ ...p, residualValue: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label>العمر الإنتاجي (بالسنوات)</label>
                  <input
                    type="number"
                    required
                    value={newAsset.usefulLifeYears}
                    onChange={(e) =>
                      setNewAsset((p) => ({ ...p, usefulLifeYears: parseInt(e.target.value) || 5 }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label>طريقة الإهلاك</label>
                  <select
                    value={newAsset.depreciationMethod}
                    onChange={(e) =>
                      setNewAsset((p) => ({ ...p, depreciationMethod: e.target.value as any }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                  >
                    <option value="Straight-Line">قسط ثابت (Straight Line)</option>
                    <option value="Declining-Balance">قسط متناقص دوبل (Double Declining)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black transition-colors"
                >
                  حفظ الأصل الرأسمالي بالدفتر
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAsset(false)}
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
