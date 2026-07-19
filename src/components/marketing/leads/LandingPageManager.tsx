import React, { useState } from "react";
import {
  Sparkles,
  Layout as LayoutIcon,
  Plus,
  X,
  RefreshCw,
  Zap,
  Globe,
  Settings,
  Eye,
  BarChart3,
  MousePointerClick,
  Monitor,
  Smartphone,
  Palette,
  AlignLeft,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { leadsService, LandingPage } from "@/src/services/leads.service";

interface LandingPageManagerProps {
  landingPages: LandingPage[];
  onRefresh: () => void;
}

export default function LandingPageManager({ landingPages, onRefresh }: LandingPageManagerProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [activeConfigTab, setActiveConfigTab] = useState<"content" | "theme" | "seo">("content");

  const [aiPageInput, setAiPageInput] = useState({
    productName: "",
    industry: "",
    targetAudience: "",
    language: "ar",
    goal: "Capture Leads",
  });

  const handleGenerateLandingPageAI = async () => {
    if (!aiPageInput.productName || !aiPageInput.industry) {
      toast.error(
        isAr ? "يرجى تعبئة اسم المنتج والمجال" : "Please fill in product name and industry"
      );
      return;
    }
    setAiGenerating(true);
    try {
      const generated = await leadsService.generateLandingPageAI(aiPageInput);

      // Create new page with generated data
      const newPage: Partial<LandingPage> = {
        title: generated.title || "الصفحة المولدة",
        subtitle: generated.subtitle || "",
        slug: `${aiPageInput.productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
        status: "Draft",
        theme: generated.theme || {
          primaryColor: "#4f46e5",
          secondaryColor: "#0f172a",
          accentColor: "#10b981",
          fontFamily: "Inter",
        },
        seo: generated.seo || {
          title: generated.title,
          description: generated.subtitle,
          keywords: aiPageInput.industry,
        },
        sections: generated.sections || [],
      };

      const savedPage = await leadsService.createLandingPage(newPage);
      setSelectedPage(savedPage);
      setShowPageEditor(true);
      onRefresh();
      toast.success(
        isAr
          ? "تم إنشاء وتوليد صفحة الهبوط بالذكاء الاصطناعي بنجاح!"
          : "Landing page generated via AI successfully!"
      );
    } catch (err) {
      console.error(err);
      toast.error(
        isAr ? "فشل توليد الصفحة بالذكاء الاصطناعي" : "Failed to generate landing page via AI"
      );
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;
    try {
      await leadsService.updateLandingPage(selectedPage.id, selectedPage);
      onRefresh();
      toast.success(isAr ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully");
    } catch (err) {
      toast.error(isAr ? "فشل حفظ التعديلات" : "Failed to save page");
    }
  };

  const handleDeletePage = async (id: string) => {
    if (
      !window.confirm(
        isAr ? "هل أنت متأكد من حذف صفحة الهبوط هذه؟" : "Are you sure you want to delete this page?"
      )
    )
      return;
    try {
      await leadsService.deleteLandingPage(id);
      onRefresh();
      toast.success(isAr ? "تم حذف الصفحة" : "Page deleted successfully");
    } catch (err) {
      toast.error("Failed to delete page");
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showPageEditor ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* AI Generator Card */}
            <div className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                <h2 className="text-lg font-black text-white">
                  {isAr
                    ? "توليد صفحة هبوط ذكية عالية التحويل (AI)"
                    : "AI High-Converting Landing Page Generator"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    {isAr ? "اسم المنتج أو الشركة" : "Product/Company Name"}
                  </label>
                  <input
                    type="text"
                    value={aiPageInput.productName}
                    onChange={(e) =>
                      setAiPageInput({ ...aiPageInput, productName: e.target.value })
                    }
                    placeholder="e.g., Madarij SaaS"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    {isAr ? "المجال / القطاع" : "Industry"}
                  </label>
                  <input
                    type="text"
                    value={aiPageInput.industry}
                    onChange={(e) => setAiPageInput({ ...aiPageInput, industry: e.target.value })}
                    placeholder="e.g., Logistic Management"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    {isAr ? "الجمهور المستهدف" : "Target Audience"}
                  </label>
                  <input
                    type="text"
                    value={aiPageInput.targetAudience}
                    onChange={(e) =>
                      setAiPageInput({ ...aiPageInput, targetAudience: e.target.value })
                    }
                    placeholder="e.g., SME Business Owners"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 border-t border-slate-800/80">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={aiPageInput.language === "ar"}
                      onChange={() => setAiPageInput({ ...aiPageInput, language: "ar" })}
                      className="accent-indigo-500 h-4 w-4"
                    />
                    العربية
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={aiPageInput.language === "en"}
                      onChange={() => setAiPageInput({ ...aiPageInput, language: "en" })}
                      className="accent-indigo-500 h-4 w-4"
                    />
                    English
                  </label>
                </div>

                <button
                  onClick={handleGenerateLandingPageAI}
                  disabled={aiGenerating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2.5 border border-indigo-400/20 shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {aiGenerating
                    ? isAr
                      ? "جاري صياغة صفحة الهبوط..."
                      : "Designing high-converting UI..."
                    : isAr
                      ? "توليد صفحة الهبوط الفورية ⚡"
                      : "Generate Instant Landing Page ⚡"}
                </button>
              </div>
            </div>

            {/* Grid list of saved pages */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <LayoutIcon className="w-4 h-4 text-slate-400" />
                  {isAr ? "صفحات الهبوط المخزنة" : "Saved Landing Pages"}
                </h3>
              </div>

              {landingPages.length === 0 ? (
                <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-12 text-center">
                  <LayoutIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-sm text-slate-400 max-w-md mx-auto">
                    {isAr
                      ? "لا توجد صفحات هبوط منشأة بعد. يرجى ملء الحقول أعلاه لتوليد صفحة جديدة فوراً بالذكاء الاصطناعي!"
                      : "No landing pages yet. Generate one with AI above!"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {landingPages.map((page) => (
                    <div
                      key={page.id}
                      className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={cn(
                              "text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold border",
                              page.status === "Published"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-slate-800 text-slate-400 border-slate-700"
                            )}
                          >
                            {page.status}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono select-all">
                            /{page.slug}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-white mt-4 group-hover:text-indigo-400 transition-colors">
                          {page.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {page.subtitle}
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800/60">
                          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isAr ? "الزيارات" : "Views"}
                            </span>
                            <span className="text-sm text-white font-bold font-mono mt-0.5">
                              {page.views || 0}
                            </span>
                          </div>
                          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50 flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-500 font-medium">
                              {isAr ? "التحويلات" : "Conversions"}
                            </span>
                            <span className="text-sm text-emerald-400 font-bold font-mono mt-0.5">
                              {page.conversions || 0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-800/60">
                        <button
                          onClick={() => {
                            setSelectedPage(page);
                            setShowPageEditor(true);
                          }}
                          className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold py-2.5 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          {isAr ? "تخصيص وتحرير" : "Customize & Edit"}
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2.5 rounded-xl border border-rose-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          selectedPage && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[80vh]"
            >
              {/* Workspace Top Header Bar */}
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowPageEditor(false)}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      {isAr ? "محرر صفحات الهبوط التفاعلي" : "Visual Theme Editor"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedPage.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Viewport switch controls */}
                  <div className="flex bg-slate-900/80 p-1 rounded-lg border border-slate-800/80 mr-4">
                    <button
                      onClick={() => setPreviewDevice("desktop")}
                      className={cn(
                        "p-1.5 rounded-md text-slate-400 hover:text-white transition-all",
                        previewDevice === "desktop" && "bg-slate-800 text-indigo-400 font-bold"
                      )}
                    >
                      <Monitor className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice("mobile")}
                      className={cn(
                        "p-1.5 rounded-md text-slate-400 hover:text-white transition-all",
                        previewDevice === "mobile" && "bg-slate-800 text-indigo-400 font-bold"
                      )}
                    >
                      <Smartphone className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleUpdatePage}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
                  >
                    {isAr ? "حفظ التغيرات" : "Save Changes"}
                  </button>
                </div>
              </div>

              {/* Workspace Split Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
                {/* 1. Left Config & Editor Panel (lg:col-span-5) */}
                <div className="lg:col-span-5 border-r border-slate-800/60 p-5 space-y-6 bg-slate-900/20 max-h-[75vh] overflow-y-auto">
                  {/* Internal tabs configuration */}
                  <div className="flex border-b border-slate-800/80 pb-2 gap-4">
                    <button
                      onClick={() => setActiveConfigTab("content")}
                      className={cn(
                        "text-xs font-bold pb-2 transition-all border-b-2",
                        activeConfigTab === "content"
                          ? "text-indigo-400 border-indigo-500"
                          : "text-slate-500 border-transparent hover:text-slate-300"
                      )}
                    >
                      {isAr ? "المحتوى والأقسام" : "Content & Sections"}
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("theme")}
                      className={cn(
                        "text-xs font-bold pb-2 transition-all border-b-2",
                        activeConfigTab === "theme"
                          ? "text-indigo-400 border-indigo-500"
                          : "text-slate-500 border-transparent hover:text-slate-300"
                      )}
                    >
                      {isAr ? "الألوان والقالب" : "Theme & Styles"}
                    </button>
                    <button
                      onClick={() => setActiveConfigTab("seo")}
                      className={cn(
                        "text-xs font-bold pb-2 transition-all border-b-2",
                        activeConfigTab === "seo"
                          ? "text-indigo-400 border-indigo-500"
                          : "text-slate-500 border-transparent hover:text-slate-300"
                      )}
                    >
                      {isAr ? "محركات البحث (SEO)" : "SEO Metadata"}
                    </button>
                  </div>

                  {activeConfigTab === "content" && (
                    <div className="space-y-4">
                      {/* SEO Titles config */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "العنوان الرئيسي للصفحة" : "Hero Heading"}
                          </label>
                          <input
                            type="text"
                            value={selectedPage.title}
                            onChange={(e) =>
                              setSelectedPage({ ...selectedPage, title: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "العنوان الفرعي للمنتج" : "Hero Subheading"}
                          </label>
                          <textarea
                            value={selectedPage.subtitle}
                            onChange={(e) =>
                              setSelectedPage({ ...selectedPage, subtitle: e.target.value })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white h-20 focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Interactive Section List */}
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                        <h4 className="text-xs font-bold text-white mb-2">
                          {isAr ? "هيكلية الأقسام المكونة" : "Landing Page Sections"}
                        </h4>
                        <div className="space-y-2.5">
                          {selectedPage.sections?.map((sec, idx) => (
                            <div
                              key={sec.id || idx}
                              className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/10">
                                  {sec.type}
                                </span>
                                <span className="text-xs text-white font-medium">
                                  {(sec as any).heading ||
                                    sec.content?.heading ||
                                    "Section Heading"}
                                </span>
                              </div>
                              <button
                                onClick={() => {
                                  const filtered = selectedPage.sections.filter(
                                    (_, sIdx) => sIdx !== idx
                                  );
                                  setSelectedPage({ ...selectedPage, sections: filtered });
                                }}
                                className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-900 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === "theme" && (
                    <div className="space-y-4">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-indigo-400" />
                          {isAr ? "تخصيص لوحة الألوان والخطوط" : "Color Palette & Fonts"}
                        </h4>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-medium">
                              {isAr ? "اللون الأساسي" : "Primary Color"}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedPage.theme?.primaryColor || "#4f46e5"}
                                onChange={(e) =>
                                  setSelectedPage({
                                    ...selectedPage,
                                    theme: { ...selectedPage.theme, primaryColor: e.target.value },
                                  })
                                }
                                className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={selectedPage.theme?.primaryColor || ""}
                                onChange={(e) =>
                                  setSelectedPage({
                                    ...selectedPage,
                                    theme: { ...selectedPage.theme, primaryColor: e.target.value },
                                  })
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs font-mono text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-xs text-slate-400 font-medium">
                              {isAr ? "لون الخلفية" : "Secondary Color"}
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="color"
                                value={selectedPage.theme?.secondaryColor || "#0f172a"}
                                onChange={(e) =>
                                  setSelectedPage({
                                    ...selectedPage,
                                    theme: {
                                      ...selectedPage.theme,
                                      secondaryColor: e.target.value,
                                    },
                                  })
                                }
                                className="w-8 h-8 rounded border border-slate-800 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={selectedPage.theme?.secondaryColor || ""}
                                onChange={(e) =>
                                  setSelectedPage({
                                    ...selectedPage,
                                    theme: {
                                      ...selectedPage.theme,
                                      secondaryColor: e.target.value,
                                    },
                                  })
                                }
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs font-mono text-white"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "نوع الخط المعتمد" : "Font Family"}
                          </label>
                          <select
                            value={selectedPage.theme?.fontFamily || "Inter"}
                            onChange={(e) =>
                              setSelectedPage({
                                ...selectedPage,
                                theme: { ...selectedPage.theme, fontFamily: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                          >
                            <option value="Inter">Inter (SaaS Standard)</option>
                            <option value="Space Grotesk">Space Grotesk (Tech Modern)</option>
                            <option value="Cairo">Cairo (Arabic Premium)</option>
                            <option value="Almarai">Almarai (Arabic Elegant)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeConfigTab === "seo" && (
                    <div className="space-y-4">
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-emerald-400" />
                          {isAr ? "تهيئة السيو ومحركات البحث" : "SEO Metadata Settings"}
                        </h4>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "عنوان السيو (Title Tag)" : "SEO Title"}
                          </label>
                          <input
                            type="text"
                            value={selectedPage.seo?.title || ""}
                            onChange={(e) =>
                              setSelectedPage({
                                ...selectedPage,
                                seo: { ...selectedPage.seo, title: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "وصف السيو (Meta Description)" : "Meta Description"}
                          </label>
                          <textarea
                            value={selectedPage.seo?.description || ""}
                            onChange={(e) =>
                              setSelectedPage({
                                ...selectedPage,
                                seo: { ...selectedPage.seo, description: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white h-20 focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-slate-400 font-medium">
                            {isAr ? "الكلمات المفتاحية" : "Keywords"}
                          </label>
                          <input
                            type="text"
                            value={selectedPage.seo?.keywords || ""}
                            onChange={(e) =>
                              setSelectedPage({
                                ...selectedPage,
                                seo: { ...selectedPage.seo, keywords: e.target.value },
                              })
                            }
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Right Live Mockup Viewport Panel (lg:col-span-7) */}
                <div className="lg:col-span-7 bg-slate-950/40 p-5 flex items-center justify-center border-l border-slate-800/40">
                  <div
                    className={cn(
                      "rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-slate-950 transition-all duration-300",
                      previewDevice === "desktop"
                        ? "w-full max-w-4xl"
                        : "w-full max-w-xs aspect-[9/16]"
                    )}
                  >
                    {/* Live Browser Toolbar */}
                    <div className="bg-slate-950 px-4 py-2 border-b border-slate-800/80 flex items-center justify-between">
                      <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono select-all">
                        https://madarij.os/l/{selectedPage.slug}
                      </span>
                      <div className="w-4" />
                    </div>

                    {/* Rendered Live Preview Workspace Canvas */}
                    <div
                      className="p-8 space-y-10 min-h-[50vh] overflow-y-auto"
                      style={{
                        backgroundColor: selectedPage.theme?.secondaryColor || "#0f172a",
                        fontFamily: selectedPage.theme?.fontFamily || "Inter",
                      }}
                    >
                      {/* Live Hero Header */}
                      <div className="text-center space-y-4">
                        <h1 className="text-3xl font-black text-white leading-tight tracking-tight">
                          {selectedPage.title}
                        </h1>
                        <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                          {selectedPage.subtitle}
                        </p>
                        <div className="pt-3">
                          <button
                            className="text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg transition-all"
                            style={{
                              backgroundColor: selectedPage.theme?.primaryColor || "#4f46e5",
                            }}
                          >
                            {isAr ? "ابدأ التجربة مجاناً 🚀" : "Start For Free 🚀"}
                          </button>
                        </div>
                      </div>

                      {/* Display Page Sections inside Preview */}
                      {selectedPage.sections?.map((sec, sIdx) => {
                        const anySec = sec as any;
                        if (sec.type === "features") {
                          return (
                            <div key={sec.id || sIdx} className="pt-6 border-t border-slate-800/60">
                              <h3 className="text-sm font-black text-white text-center mb-4">
                                {anySec.heading ||
                                  sec.content?.heading ||
                                  (isAr ? "ميزات المنتج" : "Features")}
                              </h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {(anySec.items || sec.content?.items || []).map(
                                  (item: any, iIdx: number) => (
                                    <div
                                      key={iIdx}
                                      className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl text-center"
                                    >
                                      <Zap className="w-5 h-5 text-indigo-400 mx-auto mb-2" />
                                      <h4 className="text-xs font-bold text-white">{item.title}</h4>
                                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                        {item.description}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          );
                        }
                        if (sec.type === "stats") {
                          return (
                            <div
                              key={sec.id || sIdx}
                              className="pt-6 border-t border-slate-800/60 grid grid-cols-3 gap-3 text-center"
                            >
                              {(anySec.items || sec.content?.items || []).map(
                                (stat: any, sIdx2: number) => (
                                  <div key={sIdx2} className="p-2">
                                    <span className="block text-xl font-extrabold text-white">
                                      {stat.value}
                                    </span>
                                    <span className="block text-[10px] text-slate-500 mt-0.5">
                                      {stat.label}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
