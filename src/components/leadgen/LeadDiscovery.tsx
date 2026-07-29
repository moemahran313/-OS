import React, { useState } from "react";
import {
  Search,
  Building2,
  MapPin,
  Star,
  Users,
  Globe,
  Phone,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  Plus,
  RefreshCw,
  X,
  FileSpreadsheet,
  Layers,
  Map as MapIcon,
  Send,
  Download,
  Flame,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeadCompany, LeadFilterParams, LeadContact } from "@/src/types/leadGen";
import { calculateLeadScore } from "@/src/services/leadGenService";
import { exportLeadsToCsv, exportLeadsToExcel } from "@/src/utils/leadExporter";
import { toast } from "sonner";

interface LeadDiscoveryProps {
  companies: LeadCompany[];
  contacts?: LeadContact[];
  onSelectCompany: (company: LeadCompany) => void;
  onPushToCrm: (company: LeadCompany) => void;
  onEnrichCompany: (company: LeadCompany) => void;
  onOpenImport: () => void;
  onOpenQualificationModal?: (company: LeadCompany) => void;
}

export const LeadDiscovery: React.FC<LeadDiscoveryProps> = ({
  companies,
  contacts = [],
  onSelectCompany,
  onPushToCrm,
  onEnrichCompany,
  onOpenImport,
  onOpenQualificationModal,
}) => {
  const [filters, setFilters] = useState<LeadFilterParams>({
    search: "",
    industry: "all",
    city: "all",
    country: "all",
    minEmployees: 0,
    maxEmployees: 1000,
    minRating: 0,
    hasWebsite: false,
    hasPhone: false,
    hasEmail: false,
    missingSsl: false,
    missingBooking: false,
    hasWhatsapp: false,
    radiusKm: 50,
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [addedToCrmMap, setAddedToCrmMap] = useState<Record<string, boolean>>({});

  // Preset search shortcuts requested by user
  const presetSearches = [
    { label: "Engineering Companies in Riyadh", search: "Engineering", city: "Riyadh", ind: "Engineering" },
    { label: "Dentists in Jeddah", search: "Dental", city: "Jeddah", ind: "Healthcare" },
    { label: "Logistics in Dammam", search: "Logistics", city: "Dammam", ind: "Logistics" },
    { label: "Law Firms in Dubai", search: "Legal", city: "Dubai", ind: "Legal" },
    { label: "Unsecure Websites (Missing SSL)", missingSsl: true },
    { label: "Missing Online Booking", missingBooking: true },
  ];

  const handleApplyPreset = (preset: any) => {
    setFilters((prev) => ({
      ...prev,
      search: preset.search || "",
      city: preset.city || "all",
      industry: preset.ind || "all",
      missingSsl: preset.missingSsl || false,
      missingBooking: preset.missingBooking || false,
    }));
  };

  const filteredCompanies = companies.filter((c) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q) || (c.nameAr && c.nameAr.toLowerCase().includes(q));
      const matchCity = c.city.toLowerCase().includes(q);
      const matchInd = c.industry.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchTags = c.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchInd && !matchDesc && !matchTags) return false;
    }

    if (filters.industry !== "all" && !c.industry.toLowerCase().includes(filters.industry.toLowerCase())) {
      return false;
    }

    if (filters.city !== "all" && c.city.toLowerCase() !== filters.city.toLowerCase()) {
      return false;
    }

    if (filters.country !== "all" && c.country.toLowerCase() !== filters.country.toLowerCase()) {
      return false;
    }

    if (filters.minEmployees > 0 && c.employeeCount < filters.minEmployees) return false;
    if (filters.minRating > 0 && c.rating < filters.minRating) return false;

    if (filters.missingSsl && c.webAudit?.hasSsl) return false;
    if (filters.missingBooking && c.webAudit?.hasOnlineBooking) return false;
    if (filters.hasWhatsapp && !c.socialLinks?.whatsapp) return false;

    return true;
  });

  const handleCrmClick = (e: React.MouseEvent, company: LeadCompany) => {
    e.stopPropagation();
    onPushToCrm(company);
    setAddedToCrmMap((prev) => ({ ...prev, [company.id]: true }));
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Header Controls & Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="ابحث بالشركة، النشاط، المدينة، أو الكلمات المفتاحية (مثال: شركات هندسية بالرياض...)"
              className="w-full pr-12 pl-4 py-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center gap-2 px-3.5 py-3 text-xs font-black rounded-xl border transition-all cursor-pointer ${
                showAdvancedFilters
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فلاتر متقدمة</span>
            </button>

            <button
              onClick={() => {
                exportLeadsToCsv(filteredCompanies, contacts, "mudarij_lead_discovery_export");
                toast.success(`تم تصدير ${filteredCompanies.length} شركة بصيغة CSV`);
              }}
              className="flex items-center gap-1.5 px-3 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-black rounded-xl border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
              title="تصدير النتائج كملف CSV"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => {
                exportLeadsToExcel(filteredCompanies, contacts, "mudarij_lead_discovery_export");
                toast.success(`تم تصدير ${filteredCompanies.length} شركة بصيغة Excel`);
              }}
              className="flex items-center gap-1.5 px-3 py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 text-xs font-black rounded-xl border border-emerald-500/30 transition-all cursor-pointer"
              title="تصدير النتائج كملف Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Excel</span>
            </button>

            <button
              onClick={onOpenImport}
              className="flex items-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              <span>استيراد</span>
            </button>
          </div>
        </div>

        {/* Preset Search Shortcuts */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          <span className="text-xs font-bold text-zinc-400 whitespace-nowrap flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> بحث سريع:
          </span>
          {presetSearches.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors whitespace-nowrap cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Advanced Filter Drawer Panel */}
        <AnimatePresence>
          {showAdvancedFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-zinc-200 dark:border-zinc-800 pt-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Industry Filter */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                    القطاع / النشاط
                  </label>
                  <select
                    value={filters.industry}
                    onChange={(e) => setFilters((prev) => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="all">جميع القطاعات</option>
                    <option value="Engineering">هندسة ومقاولات (AEC)</option>
                    <option value="Healthcare">صحة وطب أسنان</option>
                    <option value="Logistics">شحن ولوجستيات</option>
                    <option value="Hospitality">مطاعم وضيافة</option>
                    <option value="Legal">محاماة واستشارات قانونية</option>
                    <option value="Technology">تقنية معلومات وسحابية</option>
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">المدينة</label>
                  <select
                    value={filters.city}
                    onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="all">جميع المدن (السعودية والخليج)</option>
                    <option value="Riyadh">الرياض (Riyadh)</option>
                    <option value="Jeddah">جدة (Jeddah)</option>
                    <option value="Dammam">الدمام (Dammam)</option>
                    <option value="Khobar">الخبر (Khobar)</option>
                    <option value="Dubai">دبي (Dubai)</option>
                  </select>
                </div>

                {/* Min Employees Filter */}
                <div>
                  <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                    أدنى عدد للموظفين: {filters.minEmployees > 0 ? filters.minEmployees : "الكل"}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={filters.minEmployees}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minEmployees: Number(e.target.value) }))}
                    className="w-full accent-emerald-500"
                  />
                </div>

                {/* Gap Switches */}
                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={filters.missingSsl}
                      onChange={(e) => setFilters((prev) => ({ ...prev, missingSsl: e.target.checked }))}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span>المواقع بدون حماية (Missing SSL)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-zinc-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={filters.missingBooking}
                      onChange={(e) => setFilters((prev) => ({ ...prev, missingBooking: e.target.checked }))}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span>بدون نظام حجز أونلاين</span>
                  </label>
                </div>
              </div>

              {/* Reset Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() =>
                    setFilters({
                      search: "",
                      industry: "all",
                      city: "all",
                      country: "all",
                      minEmployees: 0,
                      maxEmployees: 1000,
                      minRating: 0,
                      hasWebsite: false,
                      hasPhone: false,
                      hasEmail: false,
                      missingSsl: false,
                      missingBooking: false,
                      hasWhatsapp: false,
                      radiusKm: 50,
                    })
                  }
                  className="text-xs font-bold text-rose-500 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> إعادة ضبط جميع الفلاتر
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-bold text-zinc-500 dark:text-zinc-400 px-1">
        <span>
          تم العثور على <strong className="text-zinc-900 dark:text-zinc-100 font-black">{filteredCompanies.length}</strong> شركة مستهدفة
        </span>
        <span>المصدر: دليل الشركات السعودية + محرك الاستكشاف المباشر</span>
      </div>

      {/* Companies Discovery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCompanies.map((company) => {
          const score = calculateLeadScore(company);
          const isAdded = addedToCrmMap[company.id];

          return (
            <motion.div
              key={company.id}
              whileHover={{ y: -4 }}
              onClick={() => onSelectCompany(company)}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group relative"
            >
              <div>
                {/* Top Row: Name, Score & Category Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg text-[10px] font-black uppercase tracking-wider mb-1.5">
                      {company.industry}
                    </span>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 leading-snug truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {company.nameAr || company.name}
                    </h3>
                    <p className="text-xs text-zinc-400 truncate">{company.name}</p>
                  </div>

                  {/* Lead Score Pill */}
                  <div
                    className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl border font-black ${
                      score >= 80
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : score >= 60
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-zinc-500/10 text-zinc-600 border-zinc-500/30"
                    }`}
                  >
                    <span className="text-sm leading-none">{score}</span>
                    <span className="text-[9px] font-bold text-zinc-400">تقييم</span>
                  </div>
                </div>

                {/* Company Specs & Location */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-400 mb-4 bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{company.city}، {company.country}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>{company.employeeCount} موظف</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />
                    <span>{company.rating} ({company.reviewCount} مراجعة)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>سجل: {company.crStatus === "VALID" ? "ساري" : "قيد التجديد"}</span>
                  </div>
                </div>

                {/* Web Audit Signals (SSL, Speed, Booking) */}
                {company.webAudit && (
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    {company.webAudit.hasSsl ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3" /> SSL آمن
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded text-[10px] font-bold">
                        <ShieldAlert className="w-3 h-3" /> بدون SSL
                      </span>
                    )}

                    {company.webAudit.hasOnlineBooking ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold">
                        <Calendar className="w-3 h-3" /> حجز أونلاين
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-[10px] font-bold">
                        بدون حجز آلي
                      </span>
                    )}

                    {company.socialLinks?.whatsapp && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded text-[10px] font-bold">
                        <MessageSquare className="w-3 h-3" /> واتساب متاح
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer Actions */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnrichCompany(company);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>إثراء AI</span>
                  </button>

                  {onOpenQualificationModal && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQualificationModal(company);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-lg text-xs font-black transition-colors cursor-pointer"
                      title="فتح نافذة التأهيل والترقية للصفقات"
                    >
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span>تأهيل</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={(e) => handleCrmClick(e, company)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    isAdded
                      ? "bg-emerald-500 text-black font-black"
                      : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>في CRM</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة لـ CRM</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
