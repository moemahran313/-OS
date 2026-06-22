import React, { useState } from "react";
import { Scale, Calculator, Info, Landmark } from "lucide-react";
import { motion } from "motion/react";

export default function SaudiEosCalculator() {
  const [basicSalary, setBasicSalary] = useState<number>(5000);
  const [allowances, setAllowances] = useState<number>(1500);
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(6);
  const [days, setDays] = useState<number>(0);
  const [reason, setReason] = useState<"resignation" | "termination">("resignation");

  const calculateEos = () => {
    const totalWage = Number(basicSalary) + Number(allowances);
    const totalYears = Number(years) + Number(months) / 12 + Number(days) / 365;

    let reward = 0;

    // Standard EOS formula:
    // First 5 years: Half a month's wage for each year
    // Beyond 5 years: Full month's wage for each year
    if (totalYears <= 5) {
      reward = totalYears * (totalWage / 2);
    } else {
      reward = 5 * (totalWage / 2) + (totalYears - 5) * totalWage;
    }

    // Apply Saudi Labor Law resignation discounts:
    // If resignation (استقالة):
    // - Less than 2 years: No reward (المادة 85)
    // - From 2 to 5 years: One third of the reward (1/3)
    // - From 5 to 10 years: Two thirds of the reward (2/3)
    // - More than 10 years: Full reward
    let multiplier = 1;
    let articleNote = "المادة 84 من نظام العمل (استحقاق كامل بموجب إنهاء العقد)";

    if (reason === "resignation") {
      if (totalYears < 2) {
        multiplier = 0;
        articleNote = "المادة 85: الخدمة أقل من سنتين في حالة الاستقالة لا تستحق مكافأة.";
      } else if (totalYears < 5) {
        multiplier = 1 / 3;
        articleNote = "المادة 85: الخدمة من سنتين إلى 5 سنوات عند الاستقالة تستحق ثلث المكافأة.";
      } else if (totalYears < 10) {
        multiplier = 2 / 3;
        articleNote = "المادة 85: الخدمة من 5 إلى 10 سنوات عند الاستقالة تستحق ثلثي المكافأة.";
      } else {
        multiplier = 1;
        articleNote = "المادة 85: الخدمة أكثر من 10 سنوات عند الاستقالة تستحق المكافأة كاملة.";
      }
    }

    const rawReward = reward;
    const finalReward = reward * multiplier;

    return {
      rawReward,
      finalReward,
      articleNote,
      monthlyWage: totalWage
    };
  };

  const results = calculateEos();

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">حاسبة مكافأة نهاية الخدمة</h3>
            <p className="text-sm text-zinc-500 font-medium">حساب مكافآت الموظفين حسب تحديثات لائحة المادة (84) و (85) من نظام العمل السعودي.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="font-bold text-zinc-800 text-sm border-b pb-2">معطيات الاحتساب والمستندات</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">الراتب الأساسي الحالي</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Math.max(0, Number(e.target.value)))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">ر.س</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">البدلات الشهرية الخاضعة للاحتساب</label>
              <div className="relative">
                <input
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                  value={allowances}
                  onChange={(e) => setAllowances(Math.max(0, Number(e.target.value)))}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">ر.س</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500">سبب إنهاء العلاقة التعاقدية</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setReason("resignation")}
                className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition-all ${
                  reason === "resignation"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                استقالة الموظف (المادة 85)
              </button>
              <button
                onClick={() => setReason("termination")}
                className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition-all ${
                  reason === "termination"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                }`}
              >
                إنهاء من صاحب العمل / انتهاء العقد (المادة 84)
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500">مدة الخدمة الإجمالية</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">سنوات</label>
                <input
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  value={years}
                  onChange={(e) => setYears(Math.max(0, Number(e.target.value)))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">أشهر</label>
                <input
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  value={months}
                  onChange={(e) => setMonths(Math.max(0, Math.min(11, Number(e.target.value))))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase">أيام</label>
                <input
                  type="number"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                  value={days}
                  onChange={(e) => setDays(Math.max(0, Math.min(29, Number(e.target.value))))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 flex flex-col justify-between space-y-6">
          <div>
            <h4 className="font-bold text-zinc-900 text-sm mb-4">التقرير الحسابي المعتمد</h4>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500">الراتب الشهري الفعلي (الأساسي + البدلات)</span>
                <span className="text-sm font-black text-zinc-900">{results.monthlyWage.toLocaleString()} ر.س</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500">الحسبة التقديرية البدئية (المادة 84)</span>
                <span className="text-sm font-bold text-zinc-600">{Math.round(results.rawReward).toLocaleString()} ر.س</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-zinc-200">
                <span className="text-xs font-medium text-zinc-500">المبلغ المستحق الفعلي (بعد الخصم/النسب)</span>
                <span className="text-lg font-black text-emerald-600">{Math.round(results.finalReward).toLocaleString()} ر.س</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 text-xs font-medium text-zinc-600 space-y-2">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-zinc-800">قواعد نظام العمل المطبقة:</p>
                <p className="mt-1 leading-relaxed text-zinc-500">{results.articleNote}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
