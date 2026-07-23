import React, { useState } from "react";
import {
  Search,
  Sparkles,
  Globe,
  Copy,
  CheckCircle2,
  Code,
  Share2,
  Tag,
  Loader2,
  FileText,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface SeoCopilotResult {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  canonicalUrl: string;
  structuredDataJson: string;
}

export const SeoCopilotModule: React.FC = () => {
  const [pageTitle, setPageTitle] = useState("صفحة الخدمات والحلول البرمجية");
  const [pageUrl, setPageUrl] = useState("https://app.mudarij.com/solutions");
  const [targetGccMarket, setTargetGccMarket] = useState("KSA");
  const [pageContent, setPageContent] = useState(
    "منصة سحابية متكاملة للفوترة الإلكترونية المرحلة الثانية ZATCA مع الربط الفوري بنظام حماية الأجور مدد وتوثيق العقود الإلكترونية وإصدار السجلات والسندات وفق الأنظمة السعودية."
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [seoResult, setSeoResult] = useState<SeoCopilotResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !pageContent.trim()) {
      toast.error("يرجى إدخال عنوان الصفحة ومحتواها للتحليل");
      return;
    }

    try {
      setIsGenerating(true);
      const res = await fetch("/api/ai/seo-copilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageTitle,
          pageContent,
          pageUrl,
          targetGccMarket,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSeoResult(data);
        toast.success("تم توليد بيانات SEO المخصصة لأسواق الخليج بذكاء Gemini!");
      } else {
        toast.error("حدث خطأ أثناء الاتصال بالمساعد الذكي لـ SEO");
      }
    } catch (err) {
      console.error(err);
      toast.error("فشل الاتصال بالخادم");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`تم نسخ ${fieldName} إلى الحافظة`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden text-right" dir="rtl">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SEO Copilot - محرك تحسين نتائج البحث للخليج والسعودية</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            توليد وسمات Meta Tags والكلمات المفتاحية نية البحث (Search Intent)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            أداة الذكاء الاصطناعي لتوليد العناوين والوصف ووسوم الميتا المهيأة لمحركات البحث والواتساب وفق الكلمات الأكثر بحثاً في السوق السعودي والخليجي
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-purple-400" />
            <span>سوق Target: {targetGccMarket === "KSA" ? "السعودية (KSA)" : "دول الخليج (GCC)"}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <form onSubmit={handleGenerateSeo} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                عنوان الصفحة الرئيسي (Page Title)
              </label>
              <input
                type="text"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                placeholder="مثال: خدمة الفوترة الإلكترونية المرحلة الثانية"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط الصفحة (Canonical URL)
                </label>
                <input
                  type="url"
                  value={pageUrl}
                  onChange={(e) => setPageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  السوق المستهدف
                </label>
                <select
                  value={targetGccMarket}
                  onChange={(e) => setTargetGccMarket(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
                >
                  <option value="KSA">المملكة العربية السعودية (KSA)</option>
                  <option value="GCC">دول مجلس التعاون (GCC)</option>
                  <option value="UAE">الإمارات العربية المتحدة (UAE)</option>
                  <option value="QATAR">قطر والكوست</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                محتوى الصفحة أو وصف الخدمة التفصيلي
              </label>
              <textarea
                rows={5}
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                placeholder="اكتب هنا محتوى الصفحة ليتولى الذكاء الاصطناعي تحليل نية البحث واستخراج الكلمات المفتاحية..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors resize-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 text-xs sm:text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تحليل المحتوى وتوليد وسمات SEO المعتمدة...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>توليد وسمات SEO ونية البحث بذكاء Gemini</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {seoResult ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
              {/* Google Search Preview Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                    <Globe className="w-3 h-3 text-emerald-400" />
                    <span>Google SERP Preview (معاينة محرك البحث)</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(seoResult.metaTitle, "عنوان الميتا")}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {copiedField === "عنوان الميتا" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>نسخ العنوان</span>
                  </button>
                </div>
                <h4 className="text-base font-bold text-blue-400 hover:underline cursor-pointer truncate">
                  {seoResult.metaTitle}
                </h4>
                <p className="text-xs text-slate-400 font-mono text-emerald-400/80 truncate">
                  {seoResult.canonicalUrl}
                </p>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">
                  {seoResult.metaDescription}
                </p>
              </div>

              {/* Keywords Intent */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-purple-400" />
                    <span>الكلمات المفتاحية المستهدفة (GCC Search Intent):</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoResult.keywords?.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 rounded-lg text-xs font-bold"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Open Graph Preview (WhatsApp / Social) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>وسوم المشاركة الاجتماعية (Open Graph / WhatsApp Cards):</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(seoResult.ogDescription, "وصف OG")}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>نسخ</span>
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-white">{seoResult.ogTitle}</p>
                  <p className="text-xs text-slate-400">{seoResult.ogDescription}</p>
                </div>
              </div>

              {/* JSON-LD Schema Snippet */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-emerald-400" />
                    <span>البيانات المنظمة (JSON-LD Schema):</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(seoResult.structuredDataJson, "كود Schema")}
                    className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <Copy className="w-3 h-3" />
                    <span>نسخ الكود</span>
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-[10px] font-mono text-slate-300 overflow-x-auto max-h-28">
                  {seoResult.structuredDataJson}
                </pre>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
              <Search className="w-12 h-12 text-slate-700 animate-pulse" />
              <div>
                <h4 className="text-sm font-bold text-slate-400">في انتظار أدخال محتوى الصفحة للتحليل</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  قم بإدخال عنوان وصفحتك واضغط على "توليد وسمات SEO" لتوليد البيانات المعتمدة لـ Google ووسوم الميتا المخصصة
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeoCopilotModule;
