import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  Mail,
  MessageSquare,
  Linkedin,
  Tag,
  CheckCircle2,
  Copy,
  Send,
  RefreshCw,
  Zap,
  Globe,
  Receipt,
  Gift,
  Building2,
  Flame,
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

export interface SeasonalOccasionTemplate {
  key: "national_day" | "foundation_day" | "ramadan" | "biban_gitex";
  titleAr: string;
  titleEn: string;
  dateStrAr: string;
  dateStrEn: string;
  taglineAr: string;
  taglineEn: string;
  defaultCode: string;
  defaultDiscount: number;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  icon: React.ReactNode;
}

export const SEASONAL_TEMPLATES: SeasonalOccasionTemplate[] = [
  {
    key: "national_day",
    titleAr: "اليوم الوطني السعودي (94/95)",
    titleEn: "Saudi National Day (Sep 23)",
    dateStrAr: "23 سبتمبر",
    dateStrEn: "September 23",
    taglineAr: "نحلم ونحقق • عروض وخصومات المجد والازدهار",
    taglineEn: "We Dream & Achieve • National Pride Special Offers",
    defaultCode: "KSA94",
    defaultDiscount: 23,
    bgGradient: "from-emerald-950/50 via-zinc-900 to-zinc-950",
    borderColor: "border-emerald-500/40",
    accentColor: "text-emerald-400",
    icon: <span className="text-2xl">🇸🇦</span>,
  },
  {
    key: "foundation_day",
    titleAr: "يوم التأسيس السعودي",
    titleEn: "Saudi Foundation Day (Feb 22)",
    dateStrAr: "22 فبراير",
    dateStrEn: "February 22",
    taglineAr: "يوم بدينا • ثلاثة قرون من العز والأحرف الأصيلة",
    taglineEn: "Day We Started • 3 Centuries of Heritage & Leadership",
    defaultCode: "FOUNDING2026",
    defaultDiscount: 22,
    bgGradient: "from-amber-950/50 via-zinc-900 to-zinc-950",
    borderColor: "border-amber-500/40",
    accentColor: "text-amber-400",
    icon: <Award className="w-6 h-6 text-amber-400" />,
  },
  {
    key: "ramadan",
    titleAr: "عروض رمضان والهدايا المؤسسية",
    titleEn: "Ramadan Corporate Gifting",
    dateStrAr: "شهر رمضان المبارك",
    dateStrEn: "Holy Month of Ramadan",
    taglineAr: "مواسم الخير والبركة • باقات التحول الرقمي للشركات",
    taglineEn: "Season of Generosity • B2B Digital Solutions Package",
    defaultCode: "RAMADAN2026",
    defaultDiscount: 15,
    bgGradient: "from-purple-950/50 via-zinc-900 to-zinc-950",
    borderColor: "border-purple-500/40",
    accentColor: "text-purple-400",
    icon: <Gift className="w-6 h-6 text-purple-400" />,
  },
  {
    key: "biban_gitex",
    titleAr: "ملتقى بيبان ومعرض جيتكس السعودية",
    titleEn: "Biban & Gitex KSA Forum",
    dateStrAr: "مواسم المؤتمرات التقنية",
    dateStrEn: "Tech & Enterprise Seasons",
    taglineAr: "الابتكار وريادة الأعمال • باقات خاصة لزوار بيبان وجيتكس",
    taglineEn: "Innovation & Scale-ups • Special Enterprise Tech Credits",
    defaultCode: "BIBAN2026",
    defaultDiscount: 20,
    bgGradient: "from-indigo-950/50 via-zinc-900 to-zinc-950",
    borderColor: "border-indigo-500/40",
    accentColor: "text-indigo-400",
    icon: <Zap className="w-6 h-6 text-indigo-400" />,
  },
];

interface GeneratedContent {
  occasionNameAr?: string;
  occasionNameEn?: string;
  themeHeadlineAr?: string;
  themeHeadlineEn?: string;
  emailSubjectAr?: string;
  emailSubjectEn?: string;
  emailBodyAr?: string;
  emailBodyEn?: string;
  whatsappTextAr?: string;
  whatsappTextEn?: string;
  linkedinPostAr?: string;
  linkedinPostEn?: string;
  discountCode?: string;
  discountDescriptionAr?: string;
  discountDescriptionEn?: string;
  suggestedValidityDays?: number;
  targetAudienceAr?: string;
}

export const SeasonalCampaigns: React.FC<{ isAr?: boolean }> = ({ isAr = true }) => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<
    "national_day" | "foundation_day" | "ramadan" | "biban_gitex"
  >("national_day");
  const [companyName, setCompanyName] = useState("Mudarij OS - مدرج لإنتاج وتسيير الأعمال");
  const [discountPercentage, setDiscountPercentage] = useState<number>(23);
  const [customNotes, setCustomNotes] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<GeneratedContent | null>(null);
  const [isSyncingDiscount, setIsSyncingDiscount] = useState(false);
  const [discountSynced, setDiscountSynced] = useState(false);
  const [activeChannelTab, setActiveChannelTab] = useState<"email" | "whatsapp" | "linkedin" | "invoicing">("email");
  const [activeLangTab, setActiveLangTab] = useState<"ar" | "en">("ar");

  const activeTemplate = SEASONAL_TEMPLATES.find((t) => t.key === selectedTemplateKey) || SEASONAL_TEMPLATES[0];

  // Template switch handler
  const handleSelectTemplate = (tpl: SeasonalOccasionTemplate) => {
    setSelectedTemplateKey(tpl.key);
    setDiscountPercentage(tpl.defaultDiscount);
    setGeneratedData(null);
    setDiscountSynced(false);
  };

  // Generate Campaign content via Gemini API
  const handleGenerateCampaign = async () => {
    setIsGenerating(true);
    setDiscountSynced(false);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/marketing-copilot/seasonal-campaign/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          occasion: selectedTemplateKey,
          discountPercentage,
          companyName,
          customNote: customNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setGeneratedData(data.campaign.generatedContent);
        toast.success(
          isAr
            ? `تم توليد حزمة الحملة التسويقية لـ (${activeTemplate.titleAr}) بالذكاء الاصطناعي بنجاح!`
            : `AI Campaign generated for (${activeTemplate.titleEn}) successfully!`
        );
      } else {
        toast.error(data.error || (isAr ? "فشل توليد محتوى الحملة" : "Failed to generate campaign"));
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في الاتصال بالخادم" : "Server connection error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Sync Discount Code directly to Invoicing / ERP Module
  const handleSyncDiscountToInvoicing = async () => {
    if (!generatedData && !activeTemplate) return;
    const codeToSync = generatedData?.discountCode || activeTemplate.defaultCode;
    const descToSync = generatedData?.discountDescriptionAr || activeTemplate.taglineAr;

    setIsSyncingDiscount(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/marketing-copilot/seasonal-campaign/sync-discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          discountCode: codeToSync,
          discountPercentage,
          description: descToSync,
          validityDays: generatedData?.suggestedValidityDays || 14,
          occasionKey: selectedTemplateKey,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountSynced(true);
        toast.success(
          isAr
            ? `تم ربط كود الخصم (${codeToSync}) بنسبة (${discountPercentage}%) بنجاح مع وحدة الفواتير ونظام المبيعات!`
            : `Discount Code (${codeToSync}) synced with Invoicing & ERP module!`
        );
      } else {
        toast.error(data.error || "فشل ربط كود الخصم");
      }
    } catch (err) {
      toast.error("خطأ أثناء ربط كود الخصم بالنظام المالي");
    } finally {
      setIsSyncingDiscount(false);
    }
  };

  const copyToClipboard = (text: string, labelAr: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isAr ? `تم نسخ ${labelAr} إلى الحافظة` : `Copied to clipboard!`);
  };

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Module Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-amber-500/20 to-purple-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
            <Sparkles className="w-7 h-7 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight">
                {isAr ? "منشئ الحملات الموسمية والمناسبات السعودية (Saudi Seasonality Campaign Builder)" : "Saudi Seasonality & Occasions AI Campaign Builder"}
              </h2>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                Vision 2030 Ready
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              {isAr
                ? "توليد فوري بضغطة زر لحملات البريد الإلكتروني، رسائل الواتساب، منشورات لينكدإن، وأكواد الخصم المربوطة بوحدة الفواتير"
                : "1-click AI generation for Saudi National Day, Foundation Day, Ramadan, and Biban/Gitex KSA with ERP Invoicing Sync."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 z-10">
          <button
            type="button"
            onClick={handleGenerateCampaign}
            disabled={isGenerating}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-amber-500 to-orange-500 hover:from-emerald-600 hover:to-orange-600 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} />
            <span>
              {isGenerating
                ? (isAr ? "جاري التوليد بالذكاء الاصطناعي..." : "Generating AI Content...")
                : (isAr ? "توليد الحملة الذكية الآن (1-Click AI)" : "Generate Campaign Content")}
            </span>
          </button>
        </div>
      </div>

      {/* 1-Click Occasion Templates Grid */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>{isAr ? "اختر المناسبة السعودية لتشغيل القالب الفوري:" : "Select Saudi Occasion Template:"}</span>
          <span className="text-[10px] font-mono text-emerald-400">{SEASONAL_TEMPLATES.length} قوالب رسمية</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SEASONAL_TEMPLATES.map((tpl) => {
            const isSelected = tpl.key === selectedTemplateKey;
            return (
              <div
                key={tpl.key}
                onClick={() => handleSelectTemplate(tpl)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? `bg-gradient-to-b ${tpl.bgGradient} ${tpl.borderColor} shadow-xl shadow-emerald-500/5 ring-1 ring-emerald-500/30`
                    : "bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/60"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tpl.icon}
                      <span className="text-xs font-black text-white">{isAr ? tpl.titleAr : tpl.titleEn}</span>
                    </div>
                    {isSelected && (
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 p-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-snug">
                    {isAr ? tpl.taglineAr : tpl.taglineEn}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-zinc-400">{isAr ? tpl.dateStrAr : tpl.dateStrEn}</span>
                  <span className={`font-black font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 ${tpl.accentColor}`}>
                    %{tpl.defaultDiscount} خصم
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Campaign Customizer Inputs */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
        <h4 className="text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <span>{isAr ? "إعدادات وتفاصيل المنشأة المخصصة للحملة:" : "Customize Business & Discount Parameters:"}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 font-bold mb-1.5">{isAr ? "اسم المنشأة/الشركة:" : "Company Name:"}</label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              placeholder="مثال: شركة مدرج لحلول الأعمال"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1.5">{isAr ? "نسبة الخصم المقترحة (%):" : "Discount Percentage (%):"}</label>
            <input
              type="number"
              min="1"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 font-bold mb-1.5">{isAr ? "ملاحظات إضافية للذكاء الاصطناعي:" : "Custom AI Prompt Notes:"}</label>
            <input
              type="text"
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-medium focus:outline-none focus:border-emerald-500"
              placeholder="مثال: ركز على باقات الاشتراكات السنوية لنظام ZATCA"
            />
          </div>
        </div>
      </div>

      {/* Generated Content Preview & Action Hub */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Hub Header & Language / Channel Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60 gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">{activeTemplate.icon}</span>
            <div>
              <h4 className="font-black text-sm text-white">
                {generatedData?.occasionNameAr || activeTemplate.titleAr}
              </h4>
              <p className="text-[11px] text-emerald-400 font-medium">
                {generatedData?.themeHeadlineAr || activeTemplate.taglineAr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Language Toggle */}
            <div className="bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex items-center text-xs font-bold">
              <button
                onClick={() => setActiveLangTab("ar")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeLangTab === "ar"
                    ? "bg-emerald-500 text-zinc-950 font-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setActiveLangTab("en")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeLangTab === "en"
                    ? "bg-emerald-500 text-zinc-950 font-black shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                English
              </button>
            </div>

            {/* Sync Discount Code Button */}
            <button
              onClick={handleSyncDiscountToInvoicing}
              disabled={isSyncingDiscount}
              className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                discountSynced
                  ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-400"
                  : "bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow-md shadow-amber-500/20"
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>
                {discountSynced
                  ? (isAr ? "تم الربط بوحدة الفواتير ✓" : "Synced with Invoicing ✓")
                  : (isAr ? `ربط الخصم (${generatedData?.discountCode || activeTemplate.defaultCode}) بالفواتير` : "Sync Discount to Invoicing")}
              </span>
            </button>
          </div>
        </div>

        {/* Channel Navigation Subtabs */}
        <div className="flex items-center gap-2 px-6 py-3 bg-zinc-950 border-b border-zinc-800 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveChannelTab("email")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeChannelTab === "email"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>{isAr ? "حملة البريد الإلكتروني (Email Campaign)" : "Email Campaign"}</span>
          </button>

          <button
            onClick={() => setActiveChannelTab("whatsapp")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeChannelTab === "whatsapp"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isAr ? "رسائل برودكاست الواتساب (WhatsApp)" : "WhatsApp Broadcast"}</span>
          </button>

          <button
            onClick={() => setActiveChannelTab("linkedin")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeChannelTab === "linkedin"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Linkedin className="w-4 h-4" />
            <span>{isAr ? "منشور لينكدإن الموجه (LinkedIn Executive)" : "LinkedIn Post"}</span>
          </button>

          <button
            onClick={() => setActiveChannelTab("invoicing")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              activeChannelTab === "invoicing"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{isAr ? "كود الخصم والمبيعات (ERP Discount)" : "ERP Discount Code"}</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="p-6">
          {/* EMAIL TAB */}
          {activeChannelTab === "email" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-400">{isAr ? "عنوان الرسالة (Subject Line):" : "Email Subject Line:"}</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeLangTab === "ar"
                        ? generatedData?.emailSubjectAr || `تهنئة خاصة بمناسبة ${activeTemplate.titleAr} من ${companyName}`
                        : generatedData?.emailSubjectEn || `Special Offer on ${activeTemplate.titleEn} from ${companyName}`,
                      "عنوان الرسالة"
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? "نسخ العنوان" : "Copy Subject"}</span>
                </button>
              </div>

              <div className="p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-white font-sans">
                {activeLangTab === "ar"
                  ? generatedData?.emailSubjectAr || `✨ تهنئة خاصة بمناسبة ${activeTemplate.titleAr} - خصم %${discountPercentage} على خدمات ${companyName}`
                  : generatedData?.emailSubjectEn || `✨ Happy ${activeTemplate.titleEn} - Special ${discountPercentage}% Offer from ${companyName}`}
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="font-bold text-zinc-400">{isAr ? "محتوى البريد الإلكتروني (Email Body):" : "Email Body Content:"}</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeLangTab === "ar"
                        ? generatedData?.emailBodyAr || "نص البريد الترحيبي..."
                        : generatedData?.emailBodyEn || "Email content body...",
                      "محتوى البريد"
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? "نسخ المحتوى" : "Copy Body"}</span>
                </button>
              </div>

              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                {activeLangTab === "ar"
                  ? generatedData?.emailBodyAr ||
                    `السلام عليكم ورحمة الله وبركاته،\n\nبمناسبة ${activeTemplate.titleAr}، يسرنا في ${companyName} أن نتقدم إليكم بأسمى آيات التهاني والتبريكات.\n\nواحتفاءً بهذه المناسبة العظيمة، يسعدنا أن نقدم لكم عرضاً خاصاً وباقة استثنائية بخصم %${discountPercentage} عند استخدام كود الخصم: (${
                      generatedData?.discountCode || activeTemplate.defaultCode
                    }).\n\nسارع بالاستفادة من العرض والتحول الرقمي المتكامل لشركتك.\n\nمع خالص التقدير والاحتفاء،\nفريق ${companyName}`
                  : generatedData?.emailBodyEn ||
                    `Dear Valued Partner,\n\nOn the occasion of ${activeTemplate.titleEn}, we at ${companyName} extend our warm wishes.\n\nIn celebration of this special season, we are delighted to offer you an exclusive ${discountPercentage}% discount using code: (${
                      generatedData?.discountCode || activeTemplate.defaultCode
                    }).\n\nBest regards,\n${companyName} Team`}
              </div>
            </div>
          )}

          {/* WHATSAPP TAB */}
          {activeChannelTab === "whatsapp" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-400">{isAr ? "مسودة بث الواتساب (WhatsApp Broadcast Draft):" : "WhatsApp Broadcast Draft:"}</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeLangTab === "ar"
                        ? generatedData?.whatsappTextAr || "نص الواتساب..."
                        : generatedData?.whatsappTextEn || "WhatsApp text...",
                      "رسالة الواتساب"
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? "نسخ نص الواتساب" : "Copy Message"}</span>
                </button>
              </div>

              <div className="p-5 bg-emerald-950/30 border border-emerald-500/30 rounded-2xl text-xs text-emerald-200 leading-relaxed font-sans whitespace-pre-line relative">
                {activeLangTab === "ar"
                  ? generatedData?.whatsappTextAr ||
                    `🇸🇦 ✨ *تهنئة خاصة بمناسبة ${activeTemplate.titleAr}* ✨\n\nنفخر بتقديم عرض استثنائي لجميع عملائنا الكرام بخصم *%${discountPercentage}* على كافة باقات وحلول الأعمال الرقمية من *${companyName}*.\n\n🎁 كود الخصم المباشر: *${
                      generatedData?.discountCode || activeTemplate.defaultCode
                    }*\n\nللاستفادة المباشرة أو التواصل مع مسؤول الحسابات:\nاضغط هنا لحجز استشارتك مجاناً!`
                  : generatedData?.whatsappTextEn ||
                    `🇸🇦 ✨ *Exclusive ${activeTemplate.titleEn} Offer* ✨\n\nCelebrate with *${companyName}* and get *${discountPercentage}% OFF* on all enterprise software solutions!\n\n🎁 Use Code: *${
                      generatedData?.discountCode || activeTemplate.defaultCode
                    }*\n\nClaim your special offer today!`}
              </div>
            </div>
          )}

          {/* LINKEDIN TAB */}
          {activeChannelTab === "linkedin" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-400">{isAr ? "منشور لينكدإن الموجه للشركات (LinkedIn B2B Executive Post):" : "LinkedIn Executive Post:"}</span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      activeLangTab === "ar"
                        ? generatedData?.linkedinPostAr || "منشور لينكدإن..."
                        : generatedData?.linkedinPostEn || "LinkedIn post...",
                      "منشور لينكدإن"
                    )
                  }
                  className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? "نسخ المنشور" : "Copy Post"}</span>
                </button>
              </div>

              <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-2xl text-xs text-zinc-200 leading-relaxed font-sans whitespace-pre-line">
                {activeLangTab === "ar"
                  ? generatedData?.linkedinPostAr ||
                    `بمناسبة ${activeTemplate.titleAr}، تجدد ${companyName} التزامها بتمكين المنشآت والشركات السعودية بأحدث تقنيات أتمتة الأعمال والامتثال المالي.\n\nيسعدنا مشاركة هذه الفرحة مع قطاع الأعمال بتقديم تسهيلات وخصم خاص بنسبة %${discountPercentage} لجميع الشركاء الجدد والحاليين.\n\n#رؤية_السعودية_2030 #اليوم_الوطني #MudarijOS #التحول_الرقمي`
                  : generatedData?.linkedinPostEn ||
                    `In celebration of ${activeTemplate.titleEn}, ${companyName} continues its commitment to driving business growth in Saudi Arabia.\n\nWe are pleased to offer an exclusive ${discountPercentage}% enterprise credit for all businesses upgrading their digital operations.\n\n#SaudiVision2030 #KSA #DigitalTransformation #MudarijOS`}
              </div>
            </div>
          )}

          {/* INVOICING & ERP DISCOUNT TAB */}
          {activeChannelTab === "invoicing" && (
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-amber-950/30 to-zinc-900 border border-amber-500/30 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-400" />
                    <h5 className="font-black text-sm text-white">{isAr ? "بيانات كود الخصم المرتبط بنظام الفواتير:" : "ERP Invoicing Coupon Details:"}</h5>
                  </div>
                  {discountSynced ? (
                    <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isAr ? "نشط ومربوط بالنظام" : "Active & Synced"}</span>
                    </span>
                  ) : (
                    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-bold">
                      {isAr ? "جاهز للربط" : "Ready to Sync"}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold block">{isAr ? "رمز الخصم:" : "Coupon Code:"}</span>
                    <span className="text-base font-black text-amber-400">{generatedData?.discountCode || activeTemplate.defaultCode}</span>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold block">{isAr ? "نسبة الخصم:" : "Discount Percentage:"}</span>
                    <span className="text-base font-black text-emerald-400">%{discountPercentage}</span>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 font-bold block">{isAr ? "الصلاحية المقترحة:" : "Validity Period:"}</span>
                    <span className="text-base font-black text-zinc-200">{generatedData?.suggestedValidityDays || 14} يوماً</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSyncDiscountToInvoicing}
                    disabled={isSyncingDiscount}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-zinc-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>{isAr ? "حفظ وتفعيل الكود في الفواتير الآن" : "Activate Code in Invoicing"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeasonalCampaigns;
