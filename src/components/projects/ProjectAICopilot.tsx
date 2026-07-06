import React, { useState } from "react";
import {
  Sparkles,
  Loader2,
  ArrowRight,
  Check,
  Play,
  ListTodo,
  Milestone as MileIcon,
  Users,
  Calendar,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface ProjectAICopilotProps {
  language: string;
  onApplyPlan: (plan: any) => void;
  onClose: () => void;
}

const PRESETS = [
  {
    titleAr: "بوابة سداد ZATCA المرحلة الثانية",
    titleEn: "ZATCA Phase 2 Invoicing Gate",
    promptAr:
      "إنشاء خطة مشروع كاملة لربط نظام مبيعات الشركة مع منصة 'فاتورة' التابعة لـ ZATCA المرحلة الثانية، وتضمين الاختبارات الأمنية ومراجعة الأكواد ومطابقة شروط الفوترة الإلكترونية بالمملكة العربية السعودية.",
    promptEn:
      "Create a project plan to integrate the company POS/ERP with Saudi ZATCA Phase 2 'Fatoora' portal, including security clearance, XML signing, cryptographic stamp generation, and end-to-end sandbox testing.",
  },
  {
    titleAr: "تطبيق متجر إلكتروني متكامل",
    titleEn: "ERP Integrated E-commerce App",
    promptAr:
      "خطة تطوير متجر بقالة إلكتروني متكامل مع نظام إدارة المخزون والمستودعات في Madarij OS، يشمل الدفع الإلكتروني (مدى وفيزا) وإرسال الفواتير التلقائي للعملاء.",
    promptEn:
      "Plan to build a retail e-commerce application integrated with Madarij OS inventory, containing online payment (Mada/Visa), real-time stock sync, and automated receipt delivery.",
  },
  {
    titleAr: "أتمتة مستودعات سلاسل الإمداد",
    titleEn: "Supply Chain Warehouse Automation",
    promptAr:
      "خطة لتهيئة وإدخال أنظمة الباركود وتتبع الشحنات عبر الـ RFID في المستودع المركزي بجدة، مع ربط البيانات مع محاسبة التكاليف لإظهار تكلفة البضاعة المباعة بدقة.",
    promptEn:
      "Build a project timeline to deploy barcode systems and RFID-based tracking in our primary Jeddah distribution center, syncing with our cost accounting engine to display precise COGS.",
  },
];

export default function ProjectAICopilot({
  language,
  onApplyPlan,
  onClose,
}: ProjectAICopilotProps) {
  const { t } = useTranslation();
  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);

  const handleGenerate = async (selectedPrompt?: string) => {
    const activePrompt = selectedPrompt || promptText;
    if (!activePrompt.trim()) {
      toast.error(
        language === "ar" ? "الرجاء إدخال وصف للمشروع" : "Please describe your project first"
      );
      return;
    }

    setLoading(true);
    setGeneratedPlan(null);
    try {
      const response = await fetch("/api/projects/copilot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: activePrompt,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate plan");
      }

      const data = await response.json();
      setGeneratedPlan(data);
      toast.success(
        language === "ar"
          ? "تم توليد خطة العمل الذكية بنجاح!"
          : "Smart project structure generated successfully!"
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        language === "ar"
          ? "حدث خطأ أثناء الاتصال بـ Gemini API. يرجى التحقق من مفتاح الـ API."
          : "Gemini API integration error. Please verify your GEMINI_API_KEY."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedPlan) return;
    onApplyPlan(generatedPlan);
    onClose();
  };

  const isRtl = language === "ar";

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-tight text-white">
              {isRtl ? "مساعد المشاريع الذكي" : "AI Copilot Project OS"}
            </h3>
            <p className="text-[11px] text-zinc-400">
              {isRtl
                ? "توليد خطط مشاريع متكاملة بذكاء اصطناعي"
                : "Generate complete enterprise project plans"}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
        >
          <ArrowRight className={`w-5 h-5 ${isRtl ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Presets Grid */}
        {!generatedPlan && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {isRtl ? "نماذج جاهزة سريعة" : "Enterprise Project Templates"}
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPromptText(isRtl ? preset.promptAr : preset.promptEn);
                    handleGenerate(isRtl ? preset.promptAr : preset.promptEn);
                  }}
                  className="p-3 rounded-xl border border-zinc-800 hover:border-emerald-500/30 bg-zinc-950/40 hover:bg-zinc-950/90 text-left transition-all duration-200 group flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <h4 className="font-semibold text-xs text-zinc-200 group-hover:text-emerald-400 transition-colors">
                      {isRtl ? preset.titleAr : preset.titleEn}
                    </h4>
                    <p className="text-[11px] text-zinc-500 line-clamp-1">
                      {isRtl ? preset.promptAr : preset.promptEn}
                    </p>
                  </div>
                  <Play className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0 self-center" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Section */}
        {!generatedPlan && (
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
              {isRtl ? "وصف مخصص لمشروعك" : "Custom Project Description"}
            </label>
            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder={
                isRtl
                  ? "مثال: خطة لتصميم وبناء واجهة الفوترة الإلكترونية وتدريب المحاسبين..."
                  : "e.g., Plan to implement localized HR database with Mudad payroll alignment..."
              }
              rows={4}
              className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-xl p-3 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 text-white placeholder-zinc-600 resize-none outline-none"
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading || !promptText.trim()}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>
                    {isRtl
                      ? "جاري التفكير والتخطيط مع Gemini..."
                      : "Gemini is building your plan..."}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>
                    {isRtl ? "توليد خطة المشروع المتكاملة" : "Generate Complete Project Plan"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Preview of Generated Plan */}
        <AnimatePresence>
          {generatedPlan && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="p-3 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {isRtl ? "خطة العمل الذكية جاهزة!" : "Smart Project Plan Generated!"}
                </h4>
                <p className="text-[11px] text-zinc-300">
                  {isRtl
                    ? "قام الذكاء الاصطناعي بتوليد هيكلية متكاملة للمشروع مع المحطات الكبرى، المهام، التقديرات والميزانية."
                    : "The AI has engineered a comprehensive architecture with milestones, tasks, estimates, and budgets."}
                </p>
              </div>

              {/* General details */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                <h3 className="font-bold text-sm text-white">{generatedPlan.name}</h3>
                <p className="text-xs text-zinc-400">{generatedPlan.description}</p>
                <div className="flex items-center gap-4 text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-2 mt-2">
                  <div>
                    <span className="text-zinc-500 block">
                      {isRtl ? "الميزانية المقدرة" : "Est. Budget"}
                    </span>
                    <strong className="text-white text-xs">
                      {(generatedPlan.budget || 150000).toLocaleString()} SAR
                    </strong>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">
                      {isRtl ? "المهام المقترحة" : "Tasks"}
                    </span>
                    <strong className="text-white text-xs">
                      {generatedPlan.tasks?.length || 0} {isRtl ? "مهام" : "tasks"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Milestones Preview */}
              {generatedPlan.milestones && generatedPlan.milestones.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MileIcon className="w-3.5 h-3.5 text-zinc-500" />
                    {isRtl ? "محطات المشروع (Milestones)" : "Key Milestones"}
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.milestones.map((m: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 flex items-start justify-between"
                      >
                        <div>
                          <p className="font-semibold text-xs text-zinc-200">{m.name}</p>
                          <p className="text-[10px] text-zinc-500">{m.description}</p>
                        </div>
                        <span className="text-[10px] text-emerald-400/80 font-mono bg-emerald-500/5 px-1.5 py-0.5 rounded border border-emerald-500/10">
                          {m.dueDate}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Epics Preview */}
              {generatedPlan.epics && generatedPlan.epics.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <ListTodo className="w-3.5 h-3.5 text-zinc-500" />
                    {isRtl ? "المجموعات البرمجية الكبرى (Epics)" : "Project Epics"}
                  </h4>
                  <div className="space-y-1.5">
                    {generatedPlan.epics.map((e: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900"
                      >
                        <p className="font-semibold text-xs text-zinc-200">{e.name}</p>
                        <p className="text-[10px] text-zinc-500">{e.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources Preview */}
              {generatedPlan.resources && generatedPlan.resources.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    {isRtl ? "توزيع الموارد البشرية المقترح" : "Suggested Resource Allocations"}
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5">
                    {generatedPlan.resources.map((r: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 space-y-1"
                      >
                        <p className="font-semibold text-xs text-zinc-200">{r.name}</p>
                        <p className="text-[10px] text-zinc-500">{r.role}</p>
                        <div className="flex items-center justify-between text-[9px] pt-1 border-t border-zinc-850">
                          <span className="text-zinc-500">
                            {isRtl ? "تفرغ" : "Alloc"}: {r.allocation}%
                          </span>
                          <span className="text-emerald-400/90">{r.costRate} SAR/h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center gap-2 pt-4">
                <button
                  onClick={() => setGeneratedPlan(null)}
                  className="flex-1 py-2 px-3 border border-zinc-800 hover:border-zinc-700 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer text-center"
                >
                  {isRtl ? "توليد بديل" : "Regenerate"}
                </button>
                <button
                  onClick={handleApply}
                  className="flex-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer shadow-xl shadow-emerald-950/20"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>{isRtl ? "اعتماد واستيراد الخطة" : "Apply & Launch Project"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
