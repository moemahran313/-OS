import React, { useState } from "react";
import {
  ShieldCheck,
  Award,
  FileCheck2,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  ArrowUpRight,
  Info,
  Clock,
  Download,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export const SaudiSmeKpiSummary: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"all" | "zatca" | "nitaqat" | "wps">("all");

  // Mocked/Calculated SME KPI Data
  const zatcaData = {
    status: "مشفّرة ومُعتمدة (Phase 2)",
    clearedCount: 1420,
    reportedCount: 3890,
    complianceScore: 100,
    certificateExpiryDays: 240,
    lastSyncTime: "قبل 4 دقائق",
  };

  const nitaqatData = {
    tier: "البلاتيني",
    tierColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    saudiCount: 18,
    expatsCount: 24,
    totalCount: 42,
    saudizationRate: 42.8,
    targetRate: 35.0,
    healthStatus: "ممتاز (أمان كامل من عقوبات الوزارة)",
  };

  const payrollData = {
    readinessPercent: 95,
    validIbansCount: 42,
    totalEmployees: 42,
    sifFormatValid: true,
    nextPayrollDate: "2026-07-27",
    daysRemaining: 5,
    netTotalSar: 245000,
    mudadSynced: true,
  };

  const splData = {
    verifiedRate: 98.2,
    verifiedCount: 41,
    pendingCount: 1,
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden" dir="rtl">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>مؤشرات الامتثال والسيادة التشغيلية للمنشآت السعودية</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            لوحة مؤشرات الأداء الحيوية (Saudi SME Localized KPIs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-medium">
            متابعة فورية لامتثال هيئة الزكاة (ZATCA)، حماية الأجور (WPS/مدد)، ونسب السعودة (نطاقات)
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setActiveTab("zatca")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "zatca" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            ZATCA Phase 2
          </button>
          <button
            onClick={() => setActiveTab("nitaqat")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "nitaqat" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            نطاقات
          </button>
          <button
            onClick={() => setActiveTab("wps")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "wps" ? "bg-emerald-500 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            الرواتب ومُدد
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Card 1: ZATCA Compliance */}
        {(activeTab === "all" || activeTab === "zatca") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>امتثال الفوترة (ZATCA)</span>
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  100% مطابقة
                </span>
              </div>

              {/* Meter graphic */}
              <div className="flex items-center gap-4 my-4">
                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-400"
                      strokeDasharray="100, 100"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-xs font-black text-white">100%</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white mb-0.5">{zatcaData.status}</h4>
                  <p className="text-[11px] text-slate-400 font-medium">
                    ختم تشفير RSA-2048 بت الربط الفوري عبر المباشر
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">فواتير مقبولة (B2B Clear):</span>
                  <span className="font-bold text-white">{zatcaData.clearedCount.toLocaleString()} فاتورة</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">فواتير مبلغة (B2C Report):</span>
                  <span className="font-bold text-white">{zatcaData.reportedCount.toLocaleString()} فاتورة</span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">الربط: {zatcaData.lastSyncTime}</span>
              <Link to="/app/invoices" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                <span>إدارة الفواتير</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Card 2: Nitaqat Saudization Health */}
        {(activeTab === "all" || activeTab === "nitaqat") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>صحة برنامج نطاقات (السعودة)</span>
                </span>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${nitaqatData.tierColor}`}>
                  النطاق {nitaqatData.tier}
                </span>
              </div>

              <div className="my-3 space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-300">نسبة التوطين الحالية:</span>
                  <span className="text-emerald-400 font-black">{nitaqatData.saudizationRate}%</span>
                </div>

                {/* Progress spectrum bar */}
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex p-0.5 relative">
                  <div className="w-1/4 h-full bg-rose-500/80 rounded-l" />
                  <div className="w-1/4 h-full bg-amber-500/80" />
                  <div className="w-1/4 h-full bg-emerald-600/80" />
                  <div className="w-1/4 h-full bg-emerald-400 rounded-r" />

                  {/* Indicator marker */}
                  <div
                    className="absolute top-0 bottom-0 w-1.5 bg-white shadow-lg rounded-full"
                    style={{ right: `${nitaqatData.saudizationRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span>أحمر</span>
                  <span>أصفر</span>
                  <span>أخضر</span>
                  <span className="text-emerald-400">بلاتيني</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-3">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">الموظفون السعوديون</span>
                  <span className="text-base font-black text-white">{nitaqatData.saudiCount} موظف</span>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-bold block">الموظفون الوافدون</span>
                  <span className="text-base font-black text-slate-300">{nitaqatData.expatsCount} موظف</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{nitaqatData.healthStatus}</span>
              </span>
              <Link to="/app/payroll" className="text-slate-400 hover:text-white font-bold flex items-center gap-1">
                <span>الكادر</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Card 3: Monthly Payroll & WPS/Mudad Readiness */}
        {(activeTab === "all" || activeTab === "wps") && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-md group"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-400" />
                  <span>جاهزية الرواتب ونظام حماية الأجور (WPS)</span>
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/30">
                  SIF Ready
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-bold">جاهزية ملف SIF المعتمد:</span>
                  <span className="text-teal-400 font-black">{payrollData.readinessPercent}% ({payrollData.validIbansCount}/{payrollData.totalEmployees} IBAN)</span>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${payrollData.readinessPercent}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">إجمالي مسير الرواتب الصافي:</span>
                  <span className="font-black text-white">{payrollData.netTotalSar.toLocaleString()} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">موعد إيداع المسير القادم:</span>
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>متبقي {payrollData.daysRemaining} أيام</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-mono">هيكل SIF tab-delimited مطابق 100%</span>
              <Link to="/app/payroll" className="text-emerald-400 font-bold hover:underline flex items-center gap-1">
                <span>تصدير SIF</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>ربط العنوان الوطني (SPL API): {splData.verifiedRate}% معتمد</span>
          </span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span className="hidden md:inline">جميع المعاملات المالية مشفرة بسجلات تدقيق غير قابلة للتعديل (SHA-256 Audit Log)</span>
        </div>
        <Link
          to="/app/crm"
          className="text-white font-bold bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl transition-colors border border-slate-700 shrink-0"
        >
          تحديث بيانات المنشأة
        </Link>
      </div>
    </div>
  );
};

export default SaudiSmeKpiSummary;
