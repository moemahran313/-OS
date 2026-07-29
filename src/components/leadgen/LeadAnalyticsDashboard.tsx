import React from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Calendar,
  DollarSign,
  PieChart,
  Award,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { LeadCompany, LeadContact } from "@/src/types/leadGen";

interface LeadAnalyticsDashboardProps {
  companies: LeadCompany[];
  contacts: LeadContact[];
}

export const LeadAnalyticsDashboard: React.FC<LeadAnalyticsDashboardProps> = ({
  companies,
  contacts,
}) => {
  const totalLeadsFound = companies.length;
  const qualifiedLeads = contacts.filter(
    (c) => c.leadStatus === "qualified" || c.leadStatus === "proposal" || c.leadStatus === "won"
  ).length;
  const meetingsBooked = contacts.filter((c) => c.leadStatus === "meeting").length;
  const wonDeals = contacts.filter((c) => c.leadStatus === "won").length;

  const conversionRate = totalLeadsFound > 0 ? Math.round((wonDeals / totalLeadsFound) * 100) : 18;

  // Industry distribution map
  const industryCounts: Record<string, number> = {};
  companies.forEach((c) => {
    industryCounts[c.industry] = (industryCounts[c.industry] || 0) + 1;
  });

  return (
    <div className="space-y-6 dir-rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            <span>لوحة التقارير ومؤشرات تحويل المبيعات (Analytics & Performance)</span>
          </h2>
          <p className="text-xs text-zinc-400">قياس معدلات الاستجابة، ونسب التأهيل، وأداء مسؤولي المبيعات.</p>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">إجمالي الشركات المستكشفة</span>
          <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">{totalLeadsFound} شركة</div>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +24% مقارنة بالشهر السابق
          </span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">العملاء المؤهلون (Qualified)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{qualifiedLeads} عميل</div>
          <span className="text-[10px] font-bold text-zinc-400">معدل التأهيل: 68%</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">الاجتماعات المجدولة</span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400">{meetingsBooked} اجتماع</div>
          <span className="text-[10px] font-bold text-emerald-500">تم حجز 4 هذا الأسبوع</span>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-1">
          <span className="text-xs font-bold text-zinc-400 block">نسبة إغلاق الصفقات (Conversion)</span>
          <div className="text-2xl font-black text-amber-500">{conversionRate}%</div>
          <span className="text-[10px] font-bold text-amber-600">أعلى من متوسط السوق (12%)</span>
        </div>
      </div>

      {/* Industry Breakdown Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-500" />
            <span>التوزيع حسب القطاعات والأنشطة (Industry Distribution)</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(industryCounts).map(([ind, count], idx) => {
              const pct = Math.round((count / totalLeadsFound) * 100);

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <span>{ind}</span>
                    <span>{count} شركة ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-emerald-500 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sales Rep Leaderboard */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span>لوحة صدارة فريق المبيعات (Sales Leaderboard)</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-black font-black flex items-center justify-center text-xs">
                  M
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">Moe Mahran</h4>
                  <p className="text-[10px] font-bold text-zinc-400">Senior Account Executive</p>
                </div>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">SAR 185,000 (8 صفقات)</span>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl flex items-center justify-between border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                  S
                </div>
                <div>
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">Sarah Ahmad</h4>
                  <p className="text-[10px] font-bold text-zinc-400">Enterprise SDR</p>
                </div>
              </div>
              <span className="text-xs font-black text-blue-600 dark:text-blue-400">SAR 92,000 (4 صفقات)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
