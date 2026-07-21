import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  CreditCard,
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Percent,
  CheckCircle,
  Zap,
} from "lucide-react";
import { useSettings } from "@/src/contexts/SettingsContext";

interface LaunchpadOverviewProps {
  stats: {
    leadsCount: number;
    employeesCount: number;
    saudiEmployees: number;
    pendingInvoices: number;
    vatExposure: number;
    payrollCost: number;
  } | null;
  onNewInvoice: () => void;
  onNewLead: () => void;
  onNewPayroll: () => void;
  onNewProject: () => void;
}

export default function LaunchpadOverview({
  stats,
  onNewInvoice,
  onNewLead,
  onNewPayroll,
  onNewProject,
}: LaunchpadOverviewProps) {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";

  const cards = [
    {
      id: "invoices",
      titleAr: "إدارة الفواتير والضريبة",
      titleEn: "Invoices & VAT",
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-100/80 dark:border-blue-500/10",
      glowColor: "rgba(59, 130, 246, 0.12)",
      metricAr: `${stats?.pendingInvoices || 0} فاتورة معلقة`,
      metricEn: `${stats?.pendingInvoices || 0} Pending Invoices`,
      subMetricAr: `التعرض الضريبي: ${(stats?.vatExposure || 0).toLocaleString()} ر.س`,
      subMetricEn: `VAT Exposure: ${(stats?.vatExposure || 0).toLocaleString()} SAR`,
      btnTextAr: "فاتورة جديدة",
      btnTextEn: "New Invoice",
      action: onNewInvoice,
      route: "/app/invoices",
    },
    {
      id: "crm",
      titleAr: "علاقات العملاء والمبيعات (CRM)",
      titleEn: "CRM & Leads",
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-100/80 dark:border-emerald-500/10",
      glowColor: "rgba(16, 185, 129, 0.12)",
      metricAr: `${stats?.leadsCount || 0} عميل مهتم`,
      metricEn: `${stats?.leadsCount || 0} Active Leads`,
      subMetricAr: "زيادة بمعدل 12% عن الشهر الماضي",
      subMetricEn: "+12% growth vs last month",
      btnTextAr: "إضافة عميل",
      btnTextEn: "Add Lead",
      action: onNewLead,
      route: "/app/crm",
    },
    {
      id: "payroll",
      titleAr: "مسيرات الرواتب وحماية الأجور",
      titleEn: "Payroll & WPS",
      icon: CreditCard,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      border: "border-purple-100/80 dark:border-purple-500/10",
      glowColor: "rgba(168, 85, 247, 0.12)",
      metricAr: `${stats?.employeesCount || 0} موظف نشط`,
      metricEn: `${stats?.employeesCount || 0} Active Employees`,
      subMetricAr: `تكلفة الأجور: ${(stats?.payrollCost || 0).toLocaleString()} ر.س`,
      subMetricEn: `Total Payroll: ${(stats?.payrollCost || 0).toLocaleString()} SAR`,
      btnTextAr: "بدء مسير",
      btnTextEn: "Run Payroll",
      action: onNewPayroll,
      route: "/app/payroll",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Launchpad Welcome Header with a gorgeously styled, curved & animated banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="bg-gradient-to-br from-emerald-500/[0.08] via-zinc-50/[0.02] to-indigo-500/[0.06] dark:from-emerald-500/[0.05] dark:to-indigo-500/[0.04] border border-zinc-200/60 dark:border-zinc-800/60 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)] dark:shadow-none"
      >
        <div className="absolute right-[-100px] top-[-100px] w-72 h-72 bg-emerald-400/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute left-[-100px] bottom-[-100px] w-72 h-72 bg-indigo-400/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10 text-right rtl:text-right ltr:text-left">
          <div className="w-14 h-14 bg-white dark:bg-zinc-850 rounded-[1.25rem] flex items-center justify-center border border-zinc-150 dark:border-zinc-800 shadow-[0_10px_25px_rgba(0,0,0,0.03)] shrink-0 group hover:rotate-6 transition-transform duration-300">
            <Zap className="w-7 h-7 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 tracking-tight">
              {isAr ? "دليل انطلاق الأعمال السريع" : "Quick Launch Business Guide"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 font-bold leading-relaxed max-w-xl">
              {isAr
                ? "إليك ملخص مؤشراتك الأكثر نشاطاً في النظام لتقليل عبء التصفح والوصول الفوري للإجراءات"
                : "A summary of your most active system modules to reduce complexity and access shortcuts."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto shrink-0">
          <button
            onClick={onNewInvoice}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[1.25rem] text-xs font-black shadow-lg shadow-emerald-600/10 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "فاتورة سريعة" : "Quick Invoice"}</span>
          </button>
          <button
            onClick={onNewProject}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3.5 bg-white dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-[1.25rem] text-xs font-black shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "مشروع جديد" : "New Project"}</span>
          </button>
        </div>
      </motion.div>

      {/* Launchpad Cards Grid with staggered entrance, ultra curves, and dynamic ambient glows on hover */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, type: "spring", stiffness: 100, damping: 15 }}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: `0 30px 60px -15px ${card.glowColor}, 0 4px 20px -2px rgba(0, 0, 0, 0.02)`,
              }}
              className={`p-7 rounded-[2.5rem] border bg-white dark:bg-zinc-900/40 backdrop-blur-md transition-all duration-300 flex flex-col justify-between hover:border-emerald-500/25 dark:hover:border-emerald-500/25 relative overflow-hidden group shadow-[0_15px_40px_rgba(0,0,0,0.015)] ${card.border}`}
            >
              {/* Subtle ambient light source on the top right inside the card */}
              <div 
                className="absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[35px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" 
                style={{ backgroundColor: card.glowColor.replace('0.12', '0.25') }}
              />

              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3.5 rounded-[1.25rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${card.bg}`}>
                    <CardIcon className={`w-6 h-6 ${card.color}`} />
                  </div>
                  <Link
                    to={card.route}
                    className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </div>

                <h4 className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  {isAr ? card.titleAr : card.titleEn}
                </h4>
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-2 leading-none">
                  {isAr ? card.metricAr : card.metricEn}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold mt-2">
                  {isAr ? card.subMetricAr : card.subMetricEn}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between">
                <Link
                  to={card.route}
                  className="text-xs font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                >
                  {isAr ? "لوحة الإدارة" : "Manage Module"}
                </Link>
                <button
                  onClick={card.action}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-50/80 dark:bg-zinc-800/30 border border-zinc-200/60 dark:border-zinc-700 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 hover:bg-white dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-[1rem] text-xs font-black transition-all cursor-pointer shadow-xxs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isAr ? card.btnTextAr : card.btnTextEn}</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
