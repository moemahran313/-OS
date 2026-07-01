import React, { useState, useEffect } from "react";
import {
  Scale,
  Calculator,
  Info,
  Landmark,
  Users,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";

interface Employee {
  id: string;
  name: string;
  nationality?: string;
  baseSalaryHalalas?: number;
  housingAllowanceHalalas?: number;
  transportAllowanceHalalas?: number;
  hireDate?: string;
  status?: string;
}

interface SaudiEosCalculatorProps {
  employees?: Employee[];
  user?: any;
}

export default function SaudiEosCalculator({ employees = [], user }: SaudiEosCalculatorProps) {
  const [calcTab, setCalcTab] = useState<"single" | "all">("single");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  // Single Calculator States
  const [basicSalary, setBasicSalary] = useState<number>(5000);
  const [allowances, setAllowances] = useState<number>(1500);
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(6);
  const [days, setDays] = useState<number>(0);
  const [reason, setReason] = useState<"resignation" | "termination">("resignation");

  // Monthly Provision States
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
  const [posting, setPosting] = useState<boolean>(false);
  const [postedEntries, setPostedEntries] = useState<string[]>([]);

  // Automatically update form fields when an employee is selected in single simulator
  useEffect(() => {
    if (selectedEmployeeId) {
      const emp = employees.find((e) => e.id === selectedEmployeeId);
      if (emp) {
        setBasicSalary(Math.round((emp.baseSalaryHalalas || 0) / 100));
        setAllowances(
          Math.round(
            ((emp.housingAllowanceHalalas || 0) + (emp.transportAllowanceHalalas || 0)) / 100
          )
        );

        if (emp.hireDate) {
          const duration = getServiceDuration(emp.hireDate);
          setYears(duration.years);
          setMonths(duration.months);
          setDays(duration.days);
        } else {
          setYears(1);
          setMonths(0);
          setDays(0);
        }
      }
    }
  }, [selectedEmployeeId, employees]);

  // Fetch posted journal entries to prevent double-posting
  useEffect(() => {
    if (!user) return;
    const fetchPostedProvisions = async () => {
      try {
        const q = query(collection(db, "journal_entries"), where("authorUid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const posted = querySnapshot.docs
          .map((doc) => doc.data().sourceDoc)
          .filter(
            (src): src is string => typeof src === "string" && src.startsWith("EOSB Provision - ")
          );
        setPostedEntries(posted.map((p) => p.replace("EOSB Provision - ", "")));
      } catch (err) {
        console.error("Error fetching posted provisions:", err);
      }
    };
    fetchPostedProvisions();
  }, [user, posting]);

  const getServiceDuration = (hireDateStr: string) => {
    if (!hireDateStr) return { years: 0, months: 0, days: 0, totalYears: 0 };
    const hireDate = new Date(hireDateStr);
    const today = new Date();
    if (isNaN(hireDate.getTime()) || hireDate > today)
      return { years: 0, months: 0, days: 0, totalYears: 0 };

    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = Math.floor((totalDays % 365) % 30);
    const totalYears = totalDays / 365.25;

    return { years, months, days, totalYears };
  };

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
      monthlyWage: totalWage,
    };
  };

  // Calculate monthly provision list for all active employees
  const getMonthlyProvisionsData = () => {
    let totalProvisionHalalas = 0;
    const list = employees
      .filter((emp) => emp.status === "active" || emp.status === "نشط" || !emp.status)
      .map((emp) => {
        const hireDateStr = emp.hireDate || new Date().toISOString().split("T")[0];
        const duration = getServiceDuration(hireDateStr);
        const basic = (emp.baseSalaryHalalas || 0) / 100;
        const allowancesSum =
          ((emp.housingAllowanceHalalas || 0) + (emp.transportAllowanceHalalas || 0)) / 100;
        const wage = basic + allowancesSum;

        // Formula: first 5 years = half month wage per year (which is wage/24 per month), after 5 years = full month wage per year (which is wage/12 per month)
        let monthlyProvision = 0;
        if (duration.totalYears <= 5) {
          monthlyProvision = wage / 24;
        } else {
          monthlyProvision = wage / 12;
        }

        totalProvisionHalalas += Math.round(monthlyProvision * 100);

        return {
          ...emp,
          hireDateStr,
          serviceYears: duration.totalYears,
          serviceFormatted: `${duration.years} سنة و ${duration.months} شهر`,
          monthlyWage: wage,
          monthlyProvision,
        };
      });

    return {
      list,
      totalProvisionHalalas,
    };
  };

  const provisionsData = getMonthlyProvisionsData();
  const results = calculateEos();
  const isMonthPosted = postedEntries.includes(selectedMonth);

  // Post accrual journal entry for EOSB monthly provisions
  const postMonthlyProvisionsEntry = async () => {
    if (!user) return;
    if (isMonthPosted) {
      toast.info(`لقد تم ترحيل قيد استحقاق مخصص نهاية الخدمة لشهر ${selectedMonth} سابقاً!`);
      return;
    }
    if (provisionsData.totalProvisionHalalas <= 0) {
      toast.error("إجمالي المخصصات صفر، لا يوجد شيء لترحيله.");
      return;
    }

    setPosting(true);
    try {
      // Find or create accounts
      const qAcc = query(collection(db, "chart_of_accounts"), where("authorUid", "==", user.uid));
      const accSnap = await getDocs(qAcc);
      const accountsList = accSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      const findOrCreateAccount = async (
        code: string,
        nameAr: string,
        nameEn: string,
        type: string
      ) => {
        let acc = accountsList.find((a) => a.accountCode === code);
        if (!acc) {
          const newDoc = await addDoc(collection(db, "chart_of_accounts"), {
            accountCode: code,
            nameAr,
            nameEn,
            type,
            balanceHalalas: 0,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
          });
          acc = { id: newDoc.id, accountCode: code, nameAr, nameEn, type };
        }
        return acc;
      };

      // 510350: مصروف مخصص مكافأة نهاية الخدمة
      // 210450: التزام مخصص مكافأة نهاية الخدمة المتراكم
      const expenseAcc = await findOrCreateAccount(
        "510350",
        "مصروف مخصص مكافأة نهاية الخدمة",
        "EOSB Provision Expense",
        "Expense"
      );
      const liabilityAcc = await findOrCreateAccount(
        "210450",
        "التزام مخصص نهاية الخدمة المتراكم",
        "Accrued EOSB Provision Liability",
        "Liability"
      );

      const lines = [
        {
          accountId: expenseAcc.id,
          accountCode: expenseAcc.accountCode,
          accountNameAr: expenseAcc.nameAr,
          accountNameEn: expenseAcc.nameEn,
          debitHalalas: provisionsData.totalProvisionHalalas,
          creditHalalas: 0,
        },
        {
          accountId: liabilityAcc.id,
          accountCode: liabilityAcc.accountCode,
          accountNameAr: liabilityAcc.nameAr,
          accountNameEn: liabilityAcc.nameEn,
          debitHalalas: 0,
          creditHalalas: provisionsData.totalProvisionHalalas,
        },
      ];

      const entryNumber = `JV-EOSB-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await addDoc(collection(db, "journal_entries"), {
        entryNumber,
        date: `${selectedMonth}-28`, // typically booked on 28th
        descriptionAr: `قيد استحقاق مخصص مكافأة نهاية الخدمة لشهر ${selectedMonth} تلقائياً`,
        descriptionEn: `Automated EOSB provision accrual for period ${selectedMonth}`,
        lines,
        isBalanced: true,
        sourceDoc: `EOSB Provision - ${selectedMonth}`,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      setPostedEntries((prev) => [...prev, selectedMonth]);
      toast.success(
        `تم توليد وترحيل قيد مخصص نهاية الخدمة للتسوية بنجاح! رقم القيد: ${entryNumber}`
      );
    } catch (err) {
      console.error(err);
      toast.error("فشل ترحيل قيد المخصصات");
    } finally {
      setPosting(false);
    }
  };

  return (
    <div
      className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 space-y-8"
      dir="rtl"
    >
      {/* Header section with tab switcher */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-zinc-900">
              مستحقات ومخصصات نهاية الخدمة (EOSB)
            </h3>
            <p className="text-sm text-zinc-500 font-medium mt-1">
              حساب مستحقات الموظفين الفردية وتوليد قيود الاستحقاق الشهرية للتسويات حسب نظام العمل
              السعودي.
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200/50">
          <button
            onClick={() => setCalcTab("single")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              calcTab === "single"
                ? "bg-white text-zinc-950 shadow-sm font-black"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Calculator className="w-3.5 h-3.5 inline-block ml-1.5" />
            حاسبة محاكاة الموظف
          </button>
          <button
            onClick={() => setCalcTab("all")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              calcTab === "all"
                ? "bg-white text-zinc-950 shadow-sm font-black"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <Users className="w-3.5 h-3.5 inline-block ml-1.5" />
            المخصصات الشهرية والترحيل المحاسبي
          </button>
        </div>
      </div>

      {/* Mode A: Single Employee Calculator */}
      {calcTab === "single" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-zinc-900 text-sm">معطيات الاحتساب والمستندات</h4>

              {/* Linked Employee Dropdown */}
              {employees.length > 0 && (
                <div className="relative">
                  <select
                    className="appearance-none bg-zinc-100 border border-zinc-200 rounded-xl pr-9 pl-4 py-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer text-zinc-700"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  >
                    <option value="">-- استيراد من سجل الموظفين --</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                  <Users className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500">الراتب الأساسي الحالي</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    value={basicSalary}
                    onChange={(e) => {
                      setBasicSalary(Math.max(0, Number(e.target.value)));
                      setSelectedEmployeeId(""); // break binding if manual change
                    }}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    ر.س
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500">
                  البدلات الشهرية (السكن + النقل... إلخ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    value={allowances}
                    onChange={(e) => {
                      setAllowances(Math.max(0, Number(e.target.value)));
                      setSelectedEmployeeId(""); // break binding if manual change
                    }}
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                    ر.س
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500">سبب إنهاء العلاقة التعاقدية</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReason("resignation")}
                  className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition-all ${
                    reason === "resignation"
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                      : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
                  }`}
                >
                  استقالة الموظف (المادة 85)
                </button>
                <button
                  type="button"
                  onClick={() => setReason("termination")}
                  className={`py-3 px-4 rounded-xl font-bold text-xs border text-center transition-all ${
                    reason === "termination"
                      ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
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
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                    value={years}
                    onChange={(e) => {
                      setYears(Math.max(0, Number(e.target.value)));
                      setSelectedEmployeeId(""); // break binding
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">أشهر</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                    value={months}
                    onChange={(e) => {
                      setMonths(Math.max(0, Math.min(11, Number(e.target.value))));
                      setSelectedEmployeeId("");
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase">أيام</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                    value={days}
                    onChange={(e) => {
                      setDays(Math.max(0, Math.min(29, Number(e.target.value))));
                      setSelectedEmployeeId("");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Block */}
          <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-200 flex flex-col justify-between space-y-6">
            <div>
              <h4 className="font-bold text-zinc-900 text-sm mb-4">التقرير الحسابي المعتمد</h4>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2.5 border-b border-zinc-200/60">
                  <span className="text-xs font-medium text-zinc-500">
                    الراتب الشهري الخاضع (الأساسي + البدلات)
                  </span>
                  <span className="text-sm font-black text-zinc-900">
                    {results.monthlyWage.toLocaleString()} ر.س
                  </span>
                </div>

                <div className="flex justify-between items-center py-2.5 border-b border-zinc-200/60">
                  <span className="text-xs font-medium text-zinc-500">
                    الحسبة التقديرية البدئية (المادة 84)
                  </span>
                  <span className="text-sm font-bold text-zinc-600">
                    {Math.round(results.rawReward).toLocaleString()} ر.س
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-b border-zinc-200/60">
                  <span className="text-xs font-black text-zinc-900">
                    المبلغ المستحق الفعلي (بعد الخصم/النسب)
                  </span>
                  <span className="text-lg font-black text-emerald-600">
                    {Math.round(results.finalReward).toLocaleString()} ر.س
                  </span>
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
      )}

      {/* Mode B: All Employees Monthly Provisions */}
      {calcTab === "all" && (
        <div className="space-y-6">
          {/* Action Header and Quick Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Filter Date Card */}
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 flex flex-col justify-between gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-zinc-400" />
                <span className="text-xs font-extrabold text-zinc-700">
                  تحديد فترة الاستحقاق للمخصص
                </span>
              </div>
              <input
                type="month"
                className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-primary/20 outline-none text-zinc-800"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
              <span className="text-[10px] text-zinc-400 font-bold">
                يتم حساب الاستحقاق تلقائياً بناءً على تاريخ تعيين كل موظف.
              </span>
            </div>

            {/* Total Accrued Provision Card */}
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200 flex flex-col justify-between gap-2">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-extrabold text-zinc-700">
                  إجمالي المخصص الشهري المستحق
                </span>
              </div>
              <div>
                <span className="text-2xl font-black text-zinc-950 block">
                  {(provisionsData.totalProvisionHalalas / 100).toLocaleString()}{" "}
                  <span className="text-xs font-bold text-zinc-400">ر.س / شهر</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-black uppercase mt-1 block">
                  دائن: حساب التزام مكافأة نهاية الخدمة المتراكم
                </span>
              </div>
            </div>

            {/* Post button & Status Card */}
            <div className="bg-zinc-950 p-6 rounded-3xl text-white flex flex-col justify-between gap-3 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <span className="text-[10px] font-black text-zinc-400 uppercase block">
                  الإجراء المحاسبي والتسوية
                </span>

                {isMonthPosted ? (
                  <div className="mt-2 flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl w-max text-xs font-black">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> تم ترحيل القيد بنجاح
                  </div>
                ) : (
                  <span className="text-xs font-medium text-zinc-300 mt-1 block">
                    جاهز للمطابقة والترحيل التلقائي
                  </span>
                )}
              </div>

              <button
                type="button"
                disabled={posting || isMonthPosted || provisionsData.totalProvisionHalalas === 0}
                onClick={postMonthlyProvisionsEntry}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isMonthPosted
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-[1.02] active:scale-95"
                }`}
              >
                {posting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> جاري ترحيل القيود...
                  </>
                ) : isMonthPosted ? (
                  "تم ترحيل القيد للتسوية"
                ) : (
                  "ترحيل قيد المخصصات الشهري تلقائياً"
                )}
              </button>
            </div>
          </div>

          {/* Provisions Table */}
          <div className="bg-white border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h5 className="text-sm font-black text-zinc-900">
                سجل المخصصات والمكافآت التراكمية للموظفين
              </h5>
              <span className="text-[10px] bg-zinc-100 border text-zinc-600 px-3 py-1 rounded-xl font-bold">
                {provisionsData.list.length} موظفين نشطين مشمولين بالحسبة
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 font-extrabold border-b border-zinc-100">
                    <th className="px-6 py-4">اسم الموظف</th>
                    <th className="px-6 py-4">تاريخ التعيين</th>
                    <th className="px-6 py-4">مدة الخدمة الإجمالية</th>
                    <th className="px-6 py-4">الراتب الخاضع (الأساسي+البدلات)</th>
                    <th className="px-6 py-4">معادلة الحسبة (نظام العمل)</th>
                    <th className="px-6 py-4 text-emerald-600">المخصص الشهري للتسوية</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {provisionsData.list.map((emp) => (
                    <tr key={emp.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-900">
                        {emp.name}
                        <span className="text-[9px] bg-zinc-100 text-zinc-500 border rounded px-1.5 py-0.5 mr-2 font-medium">
                          {emp.nationality || "سعودي"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-zinc-600">{emp.hireDateStr}</td>
                      <td className="px-6 py-4 font-bold text-zinc-900">{emp.serviceFormatted}</td>
                      <td className="px-6 py-4 font-bold text-zinc-700">
                        {emp.monthlyWage.toLocaleString()} ر.س
                      </td>
                      <td className="px-6 py-4 text-zinc-500 font-medium">
                        {emp.serviceYears <= 5 ? (
                          <span className="text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                            أقل من 5 سنوات (الراتب/24)
                          </span>
                        ) : (
                          <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            أكثر من 5 سنوات (الراتب/12)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-black text-emerald-600">
                        {Math.round(emp.monthlyProvision).toLocaleString()} ر.س
                      </td>
                    </tr>
                  ))}
                  {provisionsData.list.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-zinc-400 font-bold">
                        لا يوجد موظفين نشطين حالياً لحساب مخصصاتهم.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
