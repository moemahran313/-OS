import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Copy,
  Check,
  Building2,
  MapPin,
  Target,
  ArrowLeft,
  ChevronLeft,
  Search,
  Eye,
  Zap,
  Globe,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import { trackLandingEvent } from "@/src/services/landingTracker";

interface GeneratedCopy {
  seoTitle: string;
  h1: string;
  h2: string;
  metaDescription: string;
  cta: string;
  conversionBulletPoints: string[];
}

export const SeoCopyGenerator: React.FC = () => {
  const [businessSector, setBusinessSector] = useState<string>("شركة مقاولات وتوريدات عمومية");
  const [city, setCity] = useState<string>("الرياض");
  const [targetServices, setTargetServices] = useState<string>("الفواتير الضريبية ZATCA، حماية الأجور، وتتبع المشاريع");
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [generatedResult, setGeneratedResult] = useState<GeneratedCopy>({
    seoTitle: "نظام إدارة شركات المقاولات بالرياض | مدارج OS للفوترة والرواتب",
    h1: "نظام تشغيل وإدارة شركات المقاولات والتوريدات في الرياض",
    h2: "أتمتة الفواتير الضريبية ZATCA Phase 2، مسير الرواتب المعتمد لـ مدد، وتكاليف المشاريع في منصة سحابية واحدة",
    metaDescription: "حل سحابي متكامل لمكاتب وشركات المقاولات بالرياض. امتثال كامل لاشتراطات هيئة الزكاة ونظام حماية الأجور مع توفير 80% من الاشتراكات.",
    cta: "ابدأ تجربة نظام المقاولات مجاناً",
    conversionBulletPoints: [
      "إصدار الفواتير الضريبية والمستخلصات مشفرة وفق معايير ZATCA خلال 3 ثوانٍ",
      "إعداد ملفات SIF المعتمدة بنظام مدد لحماية أجور العمالة والربط بالعنوان الوطني",
      "متابعة تكاليف المشاريع وإدارة الموردين والعقود الذكية في شاشة مركزية موحدة"
    ]
  });

  const presetSectors = [
    { label: "مقاولات وبناء", sector: "شركة مقاولات وتوريدات", focus: "مستخلصات، فواتير ZATCA، حماية أجور العمالة" },
    { label: "تجارة وتجزئة", sector: "سلسلة تجزئة وسوبرماركت", focus: "نقاط بيع، مخزون، فواتير مبسطة ZATCA" },
    { label: "استشارات وتقنية", sector: "مكتب استشارات وتقنية معلومات", focus: "عقود ذكية، إدارة عملاء CRM، واشتراكات" },
    { label: "خدمات صحية وطبية", sector: "مجمع طب أسنان وعيادات", focus: "مواعيد، فواتير المرضى، رواتب الكادر الطبي" },
    { label: "مطاعم وكافيهات", sector: "مجموعة مطاعم وكافيهات", focus: "فواتير فورية، تتبع الموردين، وإدارة العمالة" },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    trackLandingEvent(`مولد عناوين SEO - ${businessSector}`, "AI_SEO_GENERATOR");

    try {
      const res = await fetch("/api/public/seo-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessSector,
          city,
          targetServices,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedResult(data);
        toast.success("تم توليد عناوين SEO المخصصة لنشاطك بنجاح!");
      } else {
        throw new Error("Server error");
      }
    } catch (err) {
      console.warn("Using local generator logic:", err);
      // Client-side fallback if server offline
      setGeneratedResult({
        seoTitle: `نظام إدارة ${businessSector} بـ ${city} | مدارج OS`,
        h1: `نظام التشغيل الرقمي الموحد لـ ${businessSector} في ${city}`,
        h2: `أتمتة الفواتير الإلكترونية ZATCA المرحلة الثانية، حماية الأجور مدد، وCRM في منصة واحدة`,
        metaDescription: `أفضل منصة سحابية لـ ${businessSector} في ${city}. امتثال كامل لافتراطات هيئة الزكاة والضريبة ونظام حماية الأجور بخصم 80%.`,
        cta: `ابدأ التجربة المخصصة لـ ${businessSector}`,
        conversionBulletPoints: [
          `توليد فواتير ZATCA Phase 2 مشفرة ومقترنة بالختم الرقمي فورياً`,
          `مزامنة ملفات الرواتب SIF المعتمدة بنظام مدد مع العنوان الوطني SPL`,
          `لوحة قيادة ذكية تمنحك تحكماً كاملاً وتقضي على فوضى 5 برامج مبعثرة`
        ]
      });
      toast.info("تم إنشاء العناوين المخصصة لنشاطك!");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`تم نسخ ${fieldName} إلى الحافظة!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <section className="py-28 bg-zinc-950 text-white relative overflow-hidden border-t border-white/5" dir="rtl">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 right-1/4 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Bot className="w-4 h-4" />
            <span>محرك الذكاء الاصطناعي لتوليد محتوى SEO والتحويل الفائق</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-4">
            خصص واجهة مدارج OS وفق <span className="text-emerald-400">قطاع نشاطك التجاري</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg font-medium leading-relaxed">
            اختر قطاع عملك في المملكة ليتولى الذكاء الاصطناعي توليد العناوين الرئيسية (H1)، الفرعية (H2)، ووصف محركات البحث (SEO Meta) المخصص لزيادة معدل التحويل لشركتك.
          </p>
        </div>

        {/* Preset Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-10">
          <span className="text-xs font-bold text-zinc-500 ml-2">نماذج سريعة:</span>
          {presetSectors.map((preset, i) => (
            <button
              key={i}
              onClick={() => {
                setBusinessSector(preset.sector);
                setTargetServices(preset.focus);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                businessSector === preset.sector
                  ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                  : "bg-white/5 text-zinc-300 border-white/10 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Input Form Grid */}
        <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>نشاط أو قطاع الشركة:</span>
              </label>
              <input
                type="text"
                value={businessSector}
                onChange={(e) => setBusinessSector(e.target.value)}
                placeholder="مثال: شركة مقاولات وبناء"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>المدينة / المنطقة الرئيسية:</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="مثال: الرياض"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                <span>الخدمات أو النطاق المستهدف:</span>
              </label>
              <input
                type="text"
                value={targetServices}
                onChange={(e) => setTargetServices(e.target.value)}
                placeholder="مثال: الفواتير، الرواتب، وإدارة المشاريع"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-white placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGenerating ? (
                <Sparkles className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 text-amber-300" />
              )}
              <span>{isGenerating ? "جاري توليد نصوص SEO بذكاء مدارج..." : "توليد نصوص SEO والتحويل الفائق"}</span>
            </button>
          </div>
        </div>

        {/* Live SEO Preview Output Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Output Metadata Fields */}
          <div className="lg:col-span-7 bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">العناوين المولدة والمجهزة لمحركات البحث (SEO)</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                SEO Optimized • Google Ready
              </span>
            </div>

            {/* H1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
                <span>العنوان الرئيسي (H1 Tag):</span>
                <button
                  onClick={() => copyToClipboard(generatedResult.h1, "العنوان الرئيسي H1")}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "العنوان الرئيسي H1" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 text-emerald-300 font-black text-lg">
                {generatedResult.h1}
              </div>
            </div>

            {/* H2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
                <span>العنوان الفرعي المعزز (H2 Tag):</span>
                <button
                  onClick={() => copyToClipboard(generatedResult.h2, "العنوان الفرعي H2")}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "العنوان الفرعي H2" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-200 font-bold text-sm leading-relaxed">
                {generatedResult.h2}
              </div>
            </div>

            {/* Meta Description */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-bold">
                <span>وصف محركات البحث (SEO Meta Description - 150 Chars):</span>
                <button
                  onClick={() => copyToClipboard(generatedResult.metaDescription, "وصف SEO")}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedField === "وصف SEO" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>نسخ</span>
                </button>
              </div>
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-white/5 text-zinc-400 text-xs font-medium leading-relaxed">
                {generatedResult.metaDescription}
              </div>
            </div>

            {/* Conversion Bullet Points */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-zinc-400 font-bold block">نقاط التحويل الرئيسية للمبيعات:</span>
              <div className="space-y-2">
                {generatedResult.conversionBulletPoints.map((point, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-zinc-300 bg-zinc-950/80 p-2.5 rounded-lg border border-white/5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Search Engine Snippet Preview Box */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-zinc-900/60 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md">
            <div>
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
                <Search className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">شكل الظهور في نتائج بحث جوجل السعودية</h3>
              </div>

              {/* Google SERP Card Preview */}
              <div className="bg-white text-zinc-900 rounded-2xl p-5 shadow-xl space-y-2 border border-zinc-200">
                <div className="flex items-center gap-2 text-[11px] text-zinc-600 font-sans">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">M</span>
                  <span className="truncate">https://app.mudarij.com › {businessSector.toLowerCase().replace(/\s+/g, "-")}</span>
                </div>
                <h4 className="text-blue-700 hover:underline text-base font-bold leading-snug cursor-pointer dir-rtl">
                  {generatedResult.seoTitle}
                </h4>
                <p className="text-xs text-zinc-600 leading-relaxed font-sans dir-rtl">
                  {generatedResult.metaDescription}
                </p>
              </div>

              <div className="mt-6 bg-zinc-950 p-4 rounded-xl border border-white/5 space-y-2">
                <span className="text-[11px] text-zinc-400 font-bold block">زر الحث على اتخاذ الإجراء المقترح (CTA):</span>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-center text-xs rounded-lg shadow-md">
                  {generatedResult.cta}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
              <Link
                to="/demo"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>جرب النموذج في العرض التفاعلي</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
              <Link
                to="/app"
                className="px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-lg hover:bg-emerald-600 transition-colors"
              >
                تطبيق في لوحتك
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SeoCopyGenerator;
