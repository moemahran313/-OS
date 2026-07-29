import React, { useState } from "react";
import {
  X,
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Users,
  Star,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  FileText,
  UserCheck,
  Plus,
  Send,
  Copy,
  Check,
  Zap,
  Tag,
  Clock,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeadCompany, LeadContact } from "@/src/types/leadGen";
import { processBusinessCommand } from "@/src/services/aiService";
import { toast } from "sonner";

interface CompanyProfileModalProps {
  company: LeadCompany | null;
  contacts: LeadContact[];
  onClose: () => void;
  onPushToCrm: (company: LeadCompany, contact?: LeadContact) => void;
  onEnrichCompany: (company: LeadCompany) => void;
  onOpenQualificationModal?: (company: LeadCompany) => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  company,
  contacts,
  onClose,
  onPushToCrm,
  onEnrichCompany,
  onOpenQualificationModal,
}) => {
  if (!company) return null;

  const [activeTab, setActiveTab] = useState<"overview" | "contacts" | "ai_enrich" | "web_audit" | "opportunities" | "crm_push">("overview");
  const [copiedText, setCopiedText] = useState(false);
  const [aiGeneratingType, setAiGeneratingType] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>("");

  const companyContacts = contacts.filter((c) => c.companyId === company.id);

  // Generate Cold Email / WhatsApp Pitch with Gemini AI
  const handleGenerateAiContent = async (type: "cold_email" | "whatsapp" | "proposal" | "audit_report") => {
    setAiGeneratingType(type);
    setGeneratedContent("جاري تحليل بيانات الشركة وتوليد النص المخصص بواسطة AI...");

    try {
      const prompt = `أنت خبير مبيعات وتسويق لإنتربرايز في السعودية. قم بكتابة مسودة ${type === "cold_email" ? "إيميل بارد (Cold Email)" : type === "whatsapp" ? "رسالة واتساب مخصصة" : type === "proposal" ? "عرض سعر ومبيعات متكامل" : "تقرير تدقيق الموقع الإلكتروني والفرص"} لشركة "${company.nameAr || company.name}" في قطاع "${company.industry}" بالرياض/الخليج. 
بيانات الشركة:
- المدينة: ${company.city}
- عدد الموظفين: ${company.employeeCount}
- الفجوات المكتشفة: ${company.webAudit?.keyGaps?.join(", ") || "تحسين نظام الفوترة وأتمتة مسيرات الرواتب"}
- المقترح Sales Pitch: ${company.enrichment?.suggestedSalesPitch || "ربط نظام مدرج للفوترة ZATCA والرواتب WPS"}`;

      const response = await processBusinessCommand(prompt);
      setGeneratedContent(response.text || response.summary || "تم توليد النص بنجاح.");
      toast.success("تم توليد المحتوى التسويقي المخصص بنجاح");
    } catch (err) {
      console.error(err);
      setGeneratedContent("تنبيه: تعذر توليد المحتوى مباشرة، يرجى إعادة المحاولة.");
    } finally {
      setAiGeneratingType(null);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    toast.success("تم نسخ النص إلى الحافظة");
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm dir-rtl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Modal Top Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xl font-black shrink-0">
              {company.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md text-[10px] font-black uppercase">
                  {company.industry}
                </span>
                {company.crStatus === "VALID" && (
                  <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-bold">
                    سجل تجاري موثق #{company.crNumber}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate">
                {company.nameAr || company.name}
              </h2>
              <p className="text-xs text-zinc-400 truncate">{company.name} • {company.city}، {company.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenQualificationModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenQualificationModal(company);
                }}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>تأهيل وترقية للصفقات</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-200/50 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex items-center gap-1 p-2 bg-zinc-100 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "overview"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            الملف العام
          </button>

          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "contacts"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <span>أصحاب القرار (Decision Makers)</span>
            <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px]">
              {companyContacts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ai_enrich")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "ai_enrich"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>إثراء الذكاء الاصطناعي (AI)</span>
          </button>

          <button
            onClick={() => setActiveTab("web_audit")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "web_audit"
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            تدقيق الموقع والتقنية
          </button>

          <button
            onClick={() => setActiveTab("opportunities")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeTab === "opportunities"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-500/30"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>فرص البيع (Opportunities)</span>
          </button>

          <button
            onClick={() => setActiveTab("crm_push")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "crm_push"
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            تصدير لـ Madarij CRM
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">الموقع الإلكتروني</span>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-black text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <Globe className="w-4 h-4 shrink-0" />
                    <span className="truncate">{company.website}</span>
                  </a>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">الهاتف والواتساب</span>
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                    <Phone className="w-4 h-4 text-emerald-500" />
                    <span>{company.phone}</span>
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">البريد المعتمد</span>
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1 truncate">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{company.email}</span>
                  </p>
                </div>
              </div>

              {/* Description & Address */}
              <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">نبذة عن النشاط التجاري</h4>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200 leading-relaxed">{company.description}</p>
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2 text-xs font-bold text-zinc-500">
                  <MapPin className="w-4 h-4 text-rose-500" />
                  <span>العنوان الوطني: {company.address}، {company.city}، {company.country}</span>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">حجم فريق العمل</span>
                  <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">{company.employeeCount} موظف</span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">نطاق الإيراد السنوي</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{company.revenueRange}</span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">تقييم العملاء</span>
                  <span className="text-sm font-black text-amber-500 flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-amber-500" /> {company.rating} ({company.reviewCount})
                  </span>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">سنة التأسيس</span>
                  <span className="text-sm font-black text-zinc-900 dark:text-zinc-100">{company.foundedYear}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTACTS */}
          {activeTab === "contacts" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  أصحاب القرار والمسؤولون التفيذييون ({companyContacts.length})
                </h3>
              </div>

              {companyContacts.length === 0 ? (
                <div className="p-8 text-center bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700">
                  <p className="text-sm font-bold text-zinc-500">لا يوجد أصحاب قرار مرتبطين حالياً بهذه الشركة.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {companyContacts.map((cnt) => (
                    <div
                      key={cnt.id}
                      className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-sm">
                          {cnt.firstName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                              {cnt.firstName} {cnt.lastName}
                            </h4>
                            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded text-[10px] font-bold">
                              {cnt.position}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400">{cnt.department} • {cnt.email}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <a
                          href={`https://wa.me/${cnt.mobile.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-black flex items-center gap-1 cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>واتساب</span>
                        </a>

                        <button
                          onClick={() => onPushToCrm(company, cnt)}
                          className="px-3 py-1.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg text-xs font-black cursor-pointer hover:opacity-90"
                        >
                          ربط بـ CRM
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AI ENRICHMENT */}
          {activeTab === "ai_enrich" && (
            <div className="space-y-6">
              {company.enrichment ? (
                <div className="space-y-6">
                  {/* Pitch Banner */}
                  <div className="p-5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="w-4 h-4" />
                      <span>مقترح العرض المبيعي الذكي (Suggested Sales Pitch)</span>
                    </div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                      {company.enrichment.suggestedSalesPitch}
                    </p>
                  </div>

                  {/* Generated Services & Potential Needs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <h4 className="text-xs font-black text-zinc-400 uppercase">الخدمات والمنتجات المقدمة</h4>
                      <ul className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {company.enrichment.servicesOffered.map((srv, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>{srv}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                      <h4 className="text-xs font-black text-zinc-400 uppercase">الاحتياجات المحتملة (Potential Needs)</h4>
                      <ul className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {company.enrichment.potentialNeeds.map((need, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            <span>{need}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* AI Sales Content Generator Section */}
                  <div className="bg-zinc-900 text-white p-5 rounded-2xl space-y-4">
                    <h4 className="text-sm font-black text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      مولد المحتوى التسويقي الذكي (AI Content Engine)
                    </h4>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleGenerateAiContent("cold_email")}
                        disabled={!!aiGeneratingType}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl border border-zinc-700 cursor-pointer transition-colors"
                      >
                        إيميل بارد (Cold Email)
                      </button>

                      <button
                        onClick={() => handleGenerateAiContent("whatsapp")}
                        disabled={!!aiGeneratingType}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl cursor-pointer transition-colors"
                      >
                        رسالة واتساب مخصصة
                      </button>

                      <button
                        onClick={() => handleGenerateAiContent("proposal")}
                        disabled={!!aiGeneratingType}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl border border-zinc-700 cursor-pointer transition-colors"
                      >
                        عرض مبيعات متكامل
                      </button>
                    </div>

                    {generatedContent && (
                      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 relative text-xs font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed">
                        <button
                          onClick={() => handleCopy(generatedContent)}
                          className="absolute left-3 top-3 px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-[10px] font-sans flex items-center gap-1 cursor-pointer"
                        >
                          {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedText ? "تم النسخ" : "نسخ النص"}</span>
                        </button>
                        {generatedContent}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 space-y-3">
                  <p className="text-sm font-bold text-zinc-500">لم يتم إثراء بيانات هذه الشركة بواسطة الذكاء الاصطناعي بعد.</p>
                  <button
                    onClick={() => onEnrichCompany(company)}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all"
                  >
                    تشغيل إثراء Gemini AI الآن
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB AUDIT */}
          {activeTab === "web_audit" && company.webAudit && (
            <div className="space-y-6">
              {/* Scores Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">سرعة الموقع (PageSpeed)</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {company.webAudit.pageSpeedScore}/100
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">تحسين محركات البحث (SEO)</span>
                  <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    {company.webAudit.seoScore}/100
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
                  <span className="text-xs font-bold text-zinc-400 block mb-1">سهولة الوصول (Accessibility)</span>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    {company.webAudit.accessibilityScore}/100
                  </div>
                </div>
              </div>

              {/* Tech Stack Badges */}
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase">التقنيات المستخدمة (Tech Stack)</h4>
                <div className="flex items-center gap-2 flex-wrap">
                  {company.webAudit.techStack.map((tech, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-lg text-xs font-bold border border-zinc-200 dark:border-zinc-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Suggestions */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
                <h4 className="text-xs font-black text-zinc-400 uppercase">مقترحات التحسين والتعديل</h4>
                <ul className="space-y-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  {company.webAudit.improvementSuggestions.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 5: OPPORTUNITIES */}
          {activeTab === "opportunities" && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>الفرص المكتشفة تلقائياً بواسطة محرك الذكاء الاصطناعي بناءً على الفجوات التقنية.</span>
              </div>

              {company.webAudit?.keyGaps && company.webAudit.keyGaps.length > 0 ? (
                <div className="space-y-3">
                  {company.webAudit.keyGaps.map((gap, i) => (
                    <div
                      key={i}
                      className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 font-black flex items-center justify-center text-xs">
                          !
                        </div>
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">{gap}</span>
                      </div>
                      <button
                        onClick={() => handleGenerateAiContent("cold_email")}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-lg cursor-pointer"
                      >
                        إنشاء عرض حل
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-zinc-500 text-center py-6">لم يتم رصد فجوات حرجة.</p>
              )}
            </div>
          )}

          {/* TAB 6: CRM PUSH */}
          {activeTab === "crm_push" && (
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-4 text-center">
              <Building2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                تصدير شركة "{company.nameAr || company.name}" إلى Madarij CRM
              </h3>
              <p className="text-xs font-bold text-zinc-500 max-w-md mx-auto">
                سيتم إضافة الشركة تلقائياً كعميل محتمل (Lead) في خط أنابيب المبيعات، وإنشاء سجل للشركة وأصحاب القرار، وإسناد مهمة متابعة لأحد مسؤولي المبيعات.
              </p>

              <button
                onClick={() => {
                  onPushToCrm(company);
                  toast.success("تم التصدير لـ Madarij CRM بنجاح");
                  onClose();
                }}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>مواكبة وتصدير الآن لـ CRM</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
