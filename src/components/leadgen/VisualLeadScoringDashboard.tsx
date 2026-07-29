import React, { useState } from "react";
import {
  Flame,
  Zap,
  Award,
  TrendingUp,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Filter,
  Download,
  FileSpreadsheet,
  Building2,
  Mail,
  MessageSquare,
  Linkedin,
  Phone,
  BarChart3,
  Layers,
  Star,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { LeadCompany, LeadContact } from "@/src/types/leadGen";
import { calculateLeadScore } from "@/src/services/leadGenService";
import { exportLeadsToCsv, exportLeadsToExcel } from "@/src/utils/leadExporter";
import { toast } from "sonner";

interface VisualLeadScoringDashboardProps {
  companies: LeadCompany[];
  contacts: LeadContact[];
  onSelectCompany: (company: LeadCompany) => void;
  onOpenQualificationModal: (company: LeadCompany) => void;
  onPushToCrm: (company: LeadCompany) => void;
}

export const VisualLeadScoringDashboard: React.FC<VisualLeadScoringDashboardProps> = ({
  companies,
  contacts,
  onSelectCompany,
  onOpenQualificationModal,
  onPushToCrm,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<"all" | "hot" | "warm" | "cold">("all");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  // Calculate scores and classify into tiers
  const scoredCompanies = companies.map((c) => {
    const score = calculateLeadScore(c);
    const tier = score >= 80 ? "hot" : score >= 60 ? "warm" : "cold";
    return { company: c, score, tier };
  });

  const hotCount = scoredCompanies.filter((s) => s.tier === "hot").length;
  const warmCount = scoredCompanies.filter((s) => s.tier === "warm").length;
  const coldCount = scoredCompanies.filter((s) => s.tier === "cold").length;
  const totalCount = companies.length;

  const hotPct = totalCount > 0 ? Math.round((hotCount / totalCount) * 100) : 0;
  const warmPct = totalCount > 0 ? Math.round((warmCount / totalCount) * 100) : 0;
  const coldPct = totalCount > 0 ? Math.round((coldCount / totalCount) * 100) : 0;

  // Filter list by active tier and industry
  const filteredScored = scoredCompanies.filter((s) => {
    if (selectedTierFilter !== "all" && s.tier !== selectedTierFilter) return false;
    if (selectedIndustry !== "all" && !s.company.industry.toLowerCase().includes(selectedIndustry.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => b.score - a.score);

  const handleExportCsv = () => {
    const leadsToExport = filteredScored.map((s) => s.company);
    exportLeadsToCsv(leadsToExport, contacts, "mudarij_lead_scoring_tier_report");
    toast.success(`تم تصدير تقرير التقييم الذكي بفرز التدرج (${leadsToExport.length} شركة) ملف CSV!`);
  };

  const handleExportExcel = () => {
    const leadsToExport = filteredScored.map((s) => s.company);
    exportLeadsToExcel(leadsToExport, contacts, "mudarij_lead_scoring_tier_report");
    toast.success(`تم تصدير تقرير التقييم الذكي بفرز التدرج (${leadsToExport.length} شركة) ملف Excel!`);
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Header & Export Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-500" />
              <span>لوحة تصنيف وتقييم الجاهزية (Visual Lead Scoring Dashboard)</span>
            </h2>
            <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
              AI Priority Engine
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-medium">
            تصنيف وتقسيم الشركات المستهدفة إلى شرائح وأولويات (Hot / Warm / Cold) لتسهيل توجيه فرق المبيعات.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>تصدير Excel</span>
          </button>
        </div>
      </div>

      {/* Visual Tiers Distribution Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* TIER 1: HOT */}
        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === "hot" ? "all" : "hot")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedTierFilter === "hot"
              ? "bg-rose-950/20 border-rose-500 shadow-xl shadow-rose-500/10 scale-[1.02]"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-black flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 animate-pulse text-rose-500" />
              <span>Tier 1: Hot Prospects 🔥</span>
            </span>
            <span className="text-xs font-mono font-black text-rose-500">80 - 100 نقطة</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{hotCount}</span>
            <span className="text-xs font-bold text-zinc-400">شركة ({hotPct}%)</span>
          </div>

          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${hotPct}%` }} />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            أعلى أولوية للتواصل المباشر. شركات مكتملة البيولوجيا وسجل ساري بحاجة لربط ZATCA / WPS.
          </p>
        </div>

        {/* TIER 2: WARM */}
        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === "warm" ? "all" : "warm")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedTierFilter === "warm"
              ? "bg-amber-950/20 border-amber-500 shadow-xl shadow-amber-500/10 scale-[1.02]"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-xs font-black flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Tier 2: Warm Opportunities ⚡</span>
            </span>
            <span className="text-xs font-mono font-black text-amber-500">60 - 79 نقطة</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{warmCount}</span>
            <span className="text-xs font-bold text-zinc-400">شركة ({warmPct}%)</span>
          </div>

          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${warmPct}%` }} />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            فرص متوسطة الجاهزية. تتطلب إرسال عروض أسعار مخصصة ومتابعة أصحاب القرار عبر الواتساب.
          </p>
        </div>

        {/* TIER 3: COLD */}
        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === "cold" ? "all" : "cold")}
          className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
            selectedTierFilter === "cold"
              ? "bg-blue-950/20 border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02]"
              : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-blue-500/50"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 rounded-lg text-xs font-black flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
              <span>Tier 3: Cold / Nurture ❄️</span>
            </span>
            <span className="text-xs font-mono font-black text-blue-500">0 - 59 نقطة</span>
          </div>

          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-black text-zinc-900 dark:text-zinc-100">{coldCount}</span>
            <span className="text-xs font-bold text-zinc-400">شركة ({coldPct}%)</span>
          </div>

          <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${coldPct}%` }} />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            فرص للتغذية والمتابعة اللاحقة. تفتقر لبعض بيانات الاتصال المباشرة أو بحاجة لإعادة التقييم.
          </p>
        </div>
      </div>

      {/* Filter Bar & Prioritized Prospect Queue */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">عرض قائمة الأولوية:</span>

            <button
              onClick={() => setSelectedTierFilter("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedTierFilter === "all"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              الكل ({totalCount})
            </button>

            <button
              onClick={() => setSelectedTierFilter("hot")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                selectedTierFilter === "hot"
                  ? "bg-rose-500 text-white"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Hot ({hotCount})
            </button>

            <button
              onClick={() => setSelectedTierFilter("warm")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                selectedTierFilter === "warm"
                  ? "bg-amber-500 text-black font-black"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Warm ({warmCount})
            </button>

            <button
              onClick={() => setSelectedTierFilter("cold")}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                selectedTierFilter === "cold"
                  ? "bg-blue-600 text-white"
                  : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              }`}
            >
              Cold ({coldCount})
            </button>
          </div>

          {/* Industry Filter Dropdown */}
          <select
            value={selectedIndustry}
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
          >
            <option value="all">تصفية بكافة القطاعات</option>
            <option value="Engineering">هندسة ومقاولات</option>
            <option value="Healthcare">رعاية صحية</option>
            <option value="Logistics">شحن ولوجستيات</option>
            <option value="Hospitality">ضيافة ومطاعم</option>
            <option value="Technology">تقنية معلومات</option>
          </select>
        </div>

        {/* Prospect List Cards */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pl-1">
          {filteredScored.length === 0 ? (
            <div className="p-8 text-center text-zinc-400 text-xs">
              لا توجد شركات مستهدفة مطابقة للفلاتر الحالية.
            </div>
          ) : (
            filteredScored.map(({ company, score, tier }, idx) => {
              const isHot = tier === "hot";
              const isWarm = tier === "warm";

              return (
                <div
                  key={company.id}
                  onClick={() => onSelectCompany(company)}
                  className="p-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 rounded-2xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div
                      className={`w-10 h-10 rounded-xl font-black flex items-center justify-center text-xs shrink-0 ${
                        isHot
                          ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : isWarm
                          ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                          : "bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                      }`}
                    >
                      #{idx + 1}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-emerald-500 transition-colors">
                          {company.nameAr || company.name}
                        </h4>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            isHot
                              ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                              : isWarm
                              ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                              : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                          }`}
                        >
                          {isHot ? "Hot 🔥" : isWarm ? "Warm ⚡" : "Cold ❄️"}
                        </span>

                        <span className="text-[10px] bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded font-bold">
                          {company.industry}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 truncate">
                        {company.city} • {company.employeeCount} موظف • {company.email || "بدون إيميل"}
                      </p>

                      {company.enrichment?.suggestedSalesPitch && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                          💡 المقترح: {company.enrichment.suggestedSalesPitch}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Score & Action Buttons */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-200 dark:border-zinc-700">
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {score} / 100
                      </span>
                      <span className="text-[9px] font-bold text-zinc-400">درجة الجاهزية</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQualificationModal(company);
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-sm cursor-pointer transition-all flex items-center gap-1"
                      >
                        <Flame className="w-3.5 h-3.5" />
                        <span>تأهيل الفرصة</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPushToCrm(company);
                        }}
                        className="p-2 bg-zinc-900 dark:bg-zinc-100 hover:opacity-90 text-white dark:text-zinc-900 rounded-xl text-xs font-black cursor-pointer transition-all"
                        title="تصدير لـ CRM"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
