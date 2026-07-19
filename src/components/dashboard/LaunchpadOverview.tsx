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
      border: "border-blue-100 dark:border-blue-500/20",
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
      border: "border-emerald-100 dark:border-emerald-500/20",
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
      border: "border-purple-100 dark:border-purple-500/20",
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
    <div className="space-y-6">
      {/* Launchpad Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10 text-right rtl:text-right ltr:text-left">
          <div className="w-12 h-12 bg-white dark:bg-zinc-800 rounded-2xl flex items-center justify-center border border-emerald-500/20 shadow-sm shrink-0">
            <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
          </div>
          <div>
            <h3 className="font-black text-lg text-zinc-900 dark:text-zinc-100">
              {isAr ? "دليل انطلاق الأعمال السريع" : "Quick Launch Business Guide"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-semibold">
              {isAr
                ? "إليك ملخص مؤشراتك الأكثر نشاطاً في النظام لتقليل عبء التصفح والوصول الفوري للإجراءات"
                : "A summary of your most active system modules to reduce complexity and access shortcuts."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto">
          <button
            onClick={onNewInvoice}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "فاتورة سريعة" : "Quick Invoice"}</span>
          </button>
          <button
            onClick={onNewProject}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-black shadow-xxs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "مشروع جديد" : "New Project"}</span>
          </button>
        </div>
      </div>

      {/* Launchpad Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => {
          const CardIcon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
              className={`p-6 rounded-[2rem] border bg-white dark:bg-zinc-900/50 backdrop-blur-md transition-all duration-300 flex flex-col justify-between hover:shadow-lg hover:border-emerald-500/20 dark:hover:border-emerald-500/20 ${card.border}`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${card.bg}`}>
                    <CardIcon className={`w-5 h-5 ${card.color}`} />
                  </div>
                  <Link
                    to={card.route}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                <h4 className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-wider">
                  {isAr ? card.titleAr : card.titleEn}
                </h4>
                <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-1">
                  {isAr ? card.metricAr : card.metricEn}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold mt-1">
                  {isAr ? card.subMetricAr : card.subMetricEn}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <Link
                  to={card.route}
                  className="text-xs font-black text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
                >
                  {isAr ? "لوحة الإدارة" : "Manage Module"}
                </Link>
                <button
                  onClick={card.action}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500/30 dark:hover:border-emerald-500/30 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-black transition-all cursor-pointer"
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
