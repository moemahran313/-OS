import React, { useState } from "react";
import {
  Sparkles,
  FileText,
  Plus,
  X,
  RefreshCw,
  Zap,
  MousePointerClick,
  CheckCircle,
  Eye,
  Trash2,
  ListFilter,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { leadsService, LeadForm, Popup } from "@/src/services/leads.service";

interface FormBuilderProps {
  forms: LeadForm[];
  popups: Popup[];
  onRefresh: () => void;
}

export default function FormBuilder({ forms, popups, onRefresh }: FormBuilderProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showFormEditor, setShowFormEditor] = useState(false);
  const [selectedForm, setSelectedForm] = useState<LeadForm | null>(null);
  const [activeFormStepPreview, setActiveFormStepPreview] = useState(0);

  // Sub-tab for Forms vs Popups list
  const [builderTab, setBuilderTab] = useState<"forms" | "popups">("forms");

  const [aiFormInput, setAiFormInput] = useState({
    industry: "",
    purpose: "",
    language: "ar",
  });

  // AI Form generator handler
  const handleGenerateFormAI = async () => {
    if (!aiFormInput.industry || !aiFormInput.purpose) {
      toast.error(
        isAr ? "يرجى كتابة المجال والهدف من النموذج" : "Please provide industry and purpose"
      );
      return;
    }
    setAiGenerating(true);
    try {
      const generated = await leadsService.generateFormAI(aiFormInput);

      const newForm: Partial<LeadForm> = {
        name: generated.name || `نموذج ${aiFormInput.purpose}`,
        steps: generated.steps || [],
      };

      const savedForm = await leadsService.createForm(newForm);
      setSelectedForm(savedForm);
      setShowFormEditor(true);
      setActiveFormStepPreview(0);
      onRefresh();
      toast.success(
        isAr
          ? "تم إنشاء وتأهيل النموذج بالذكاء الاصطناعي بنجاح!"
          : "Multi-step smart form generated successfully!"
      );
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "فشل توليد النموذج بالذكاء الاصطناعي" : "Failed to generate smart form");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdateForm = async () => {
    if (!selectedForm) return;
    try {
      await leadsService.updateForm(selectedForm.id, selectedForm);
      onRefresh();
      toast.success(isAr ? "تم حفظ النموذج بنجاح" : "Form saved successfully");
    } catch (err) {
      toast.error("Failed to save form");
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذا النموذج؟" : "Delete this form?")) return;
    try {
      await leadsService.deleteForm(id);
      onRefresh();
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete form");
    }
  };

  // Popup Handlers
  const handleCreatePopup = async (popup: Partial<Popup>) => {
    try {
      await leadsService.createPopup(popup);
      onRefresh();
      toast.success(isAr ? "تم إنشاء النافذة المنبثقة بنجاح!" : "Popup created successfully!");
    } catch (err) {
      toast.error("Failed to create popup");
    }
  };

  const handleTogglePopupStatus = async (popup: Popup) => {
    try {
      const updatedStatus = popup.status === "Active" ? "Inactive" : "Active";
      await leadsService.updatePopup(popup.id, { ...popup, status: updatedStatus });
      onRefresh();
      toast.success(isAr ? "تم تعديل حالة النافذة" : "Popup status updated");
    } catch (err) {
      toast.error("Failed to update popup");
    }
  };

  const handleDeletePopup = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذه النافذة؟" : "Delete this popup?")) return;
    try {
      await leadsService.deletePopup(id);
      onRefresh();
      toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
    } catch (err) {
      toast.error("Failed to delete popup");
    }
  };

  // Add field to a specific step
  const handleAddField = (stepIdx: number) => {
    if (!selectedForm) return;
    const newField = {
      id: `field_${Date.now()}`,
      label: isAr ? "حقل جديد" : "New Field",
      type: "text" as const,
      required: false,
      placeholder: isAr ? "يرجى تعبئة الحقل..." : "Fill here...",
    };

    const updatedSteps = [...selectedForm.steps];
    updatedSteps[stepIdx].fields.push(newField);
    setSelectedForm({ ...selectedForm, steps: updatedSteps });
  };

  // Delete field from a step
  const handleDeleteField = (stepIdx: number, fieldIdx: number) => {
    if (!selectedForm) return;
    const updatedSteps = [...selectedForm.steps];
    updatedSteps[stepIdx].fields.splice(fieldIdx, 1);
    setSelectedForm({ ...selectedForm, steps: updatedSteps });
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {!showFormEditor ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* AI Form generator */}
            <div className="bg-slate-950/80 border border-indigo-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
                <h2 className="text-lg font-black text-white">
                  {isAr
                    ? "توليد قوالب النماذج الذكية متعددة الخطوات (AI)"
                    : "AI Multi-Step Smart Form Generator"}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    {isAr ? "المجال / النشاط التجاري" : "Industry"}
                  </label>
                  <input
                    type="text"
                    value={aiFormInput.industry}
                    onChange={(e) => setAiFormInput({ ...aiFormInput, industry: e.target.value })}
                    placeholder="e.g., Real Estate, Consulting"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">
                    {isAr ? "الهدف أو العرض من النموذج" : "Offer / Purpose of Form"}
                  </label>
                  <input
                    type="text"
                    value={aiFormInput.purpose}
                    onChange={(e) => setAiFormInput({ ...aiFormInput, purpose: e.target.value })}
                    placeholder="e.g., Free consultation, Get Pricing Plan"
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 border-t border-slate-800/80">
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={aiFormInput.language === "ar"}
                      onChange={() => setAiFormInput({ ...aiFormInput, language: "ar" })}
                      className="accent-indigo-500 h-4 w-4"
                    />
                    العربية
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={aiFormInput.language === "en"}
                      onChange={() => setAiFormInput({ ...aiFormInput, language: "en" })}
                      className="accent-indigo-500 h-4 w-4"
                    />
                    English
                  </label>
                </div>

                <button
                  onClick={handleGenerateFormAI}
                  disabled={aiGenerating}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl flex items-center gap-2.5 border border-indigo-400/20 shadow-lg transition-all disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {aiGenerating
                    ? isAr
                      ? "جاري صياغة النموذج..."
                      : "Designing Multi-Step Layout..."
                    : isAr
                      ? "توليد النموذج الفوري ⚡"
                      : "Generate Instant Form ⚡"}
                </button>
              </div>
            </div>

            {/* Sub Tabs Selection (Forms vs Popups) */}
            <div className="flex gap-2 border-b border-slate-800/80 pb-3">
              <button
                onClick={() => setBuilderTab("forms")}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-lg transition-all border",
                  builderTab === "forms"
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30"
                    : "bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-200"
                )}
              >
                {isAr ? "النماذج متعددة الخطوات" : "Multi-Step Lead Forms"}
              </button>
              <button
                onClick={() => setBuilderTab("popups")}
                className={cn(
                  "px-4 py-2 text-xs font-black rounded-lg transition-all border",
                  builderTab === "popups"
                    ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30"
                    : "bg-slate-900/40 text-slate-400 border-transparent hover:text-slate-200"
                )}
              >
                {isAr ? "النوافذ المنبثقة للتحويل" : "Smart Popups"}
              </button>
            </div>

            {builderTab === "forms" ? (
              <div className="space-y-4">
                {forms.length === 0 ? (
                  <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-12 text-center">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">
                      {isAr
                        ? "لا توجد نماذج بعد. قم بتوليد نموذج فوق بالذكاء الاصطناعي!"
                        : "No smart forms found. Start generating one above!"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {forms.map((form) => (
                      <div
                        key={form.id}
                        className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="bg-slate-800 text-indigo-400 border border-indigo-500/10 text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold">
                              {form.steps?.length} {isAr ? "خطوات" : "Steps"}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white mt-4 group-hover:text-indigo-400 transition-colors">
                            {form.name}
                          </h4>
                          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                            {isAr ? "حقول ملتقطة: " : "Variables: "}
                            {form.steps?.flatMap((s) => s.fields?.map((f) => f.label)).join(", ")}
                          </p>

                          {/* Stats */}
                          <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-800/60 font-mono">
                            <div className="text-center bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                              <span className="block text-[10px] text-slate-500">
                                {isAr ? "الزيارات" : "Views"}
                              </span>
                              <span className="text-xs text-white font-bold">
                                {form.views || 0}
                              </span>
                            </div>
                            <div className="text-center bg-slate-900/50 p-2 rounded-xl border border-slate-800/50">
                              <span className="block text-[10px] text-slate-500">
                                {isAr ? "الإكمالات" : "Completions"}
                              </span>
                              <span className="text-xs text-emerald-400 font-bold">
                                {form.conversions || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-800/60">
                          <button
                            onClick={() => {
                              setSelectedForm(form);
                              setShowFormEditor(true);
                              setActiveFormStepPreview(0);
                            }}
                            className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold py-2.5 rounded-xl border border-slate-800 transition-all flex items-center justify-center gap-2"
                          >
                            <Settings className="w-3.5 h-3.5" />
                            {isAr ? "تخصيص وتضمين" : "Customize & Embed"}
                          </button>
                          <button
                            onClick={() => handleDeleteForm(form.id)}
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
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-950/20 p-4 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {isAr ? "النوافذ المنبثقة الذكية للتحويل" : "Triggered Exit & Welcome Popups"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isAr
                        ? "أطلق نوافذ مخصصة بناءً على نية الخروج أو فترات البقاء."
                        : "Trigger discount popups or newsletter prompts."}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      handleCreatePopup({
                        name: isAr ? "خصم الخروج الذكي 🛒" : "Exit Discount Promo 🛒",
                        type: "discount",
                        triggerType: "exit-intent",
                        triggerValue: "0",
                        title: isAr ? "انتظر! لا تذهب قبل الاستفادة" : "Wait! Before You Leave...",
                        description: isAr
                          ? "سجل بريدك الآن واحصل على خصم 20% فوري على اشتراكك السنوي."
                          : "Save 20% on any plan when subscribing today.",
                        ctaText: isAr ? "احصل على العرض" : "Claim Discount Now",
                        status: "Active",
                      })
                    }
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition-all shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                    {isAr ? "إنشاء نافذة ذكية" : "New Smart Popup"}
                  </button>
                </div>

                {popups.length === 0 ? (
                  <div className="bg-slate-950/30 border border-slate-800/60 rounded-2xl p-12 text-center">
                    <MousePointerClick className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-sm text-slate-400">
                      {isAr ? "لا توجد نوافذ منبثقة مصممة بعد." : "No active popups defined yet."}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {popups.map((pop) => (
                      <div
                        key={pop.id}
                        className="bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between shadow-xl transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold",
                                pop.status === "Active"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              )}
                            >
                              {pop.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {pop.triggerType}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-white mt-4">{pop.name}</h4>
                          <p className="text-xs text-slate-300 font-bold mt-2 leading-relaxed">
                            {pop.title}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                            {pop.description}
                          </p>
                        </div>

                        <div className="flex gap-2.5 mt-5 pt-4 border-t border-slate-800/60">
                          <button
                            onClick={() => handleTogglePopupStatus(pop)}
                            className={cn(
                              "flex-1 text-xs font-bold py-2 rounded-xl border transition-all",
                              pop.status === "Active"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                            )}
                          >
                            {pop.status === "Active"
                              ? isAr
                                ? "تعطيل النافذة"
                                : "Deactivate"
                              : isAr
                                ? "تفعيل النافذة"
                                : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDeletePopup(pop.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-xl border border-rose-500/10 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          selectedForm && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-[80vh]"
            >
              {/* Form Workspace Top Header */}
              <div className="bg-slate-950 px-6 py-4 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowFormEditor(false)}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div>
                    <h3 className="text-sm font-black text-white">
                      {isAr ? "محرر خطوات النماذج التفاعلي" : "Multi-Step Form Workspace"}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{selectedForm.name}</p>
                  </div>
                </div>

                <button
                  onClick={handleUpdateForm}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/10"
                >
                  {isAr ? "حفظ التغيرات" : "Save Changes"}
                </button>
              </div>

              {/* Form Workspace Dual Pane Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
                {/* Left config (lg:col-span-5) */}
                <div className="lg:col-span-5 border-r border-slate-800/60 p-5 space-y-6 bg-slate-900/20 max-h-[75vh] overflow-y-auto">
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      {isAr ? "خصائص وتسمية النموذج" : "General Properties"}
                    </h4>
                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">
                        {isAr ? "اسم النموذج العام" : "Form Name"}
                      </label>
                      <input
                        type="text"
                        value={selectedForm.name}
                        onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Interactive Steps Designer */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-white flex items-center gap-1.5 px-1">
                      <Layers className="w-4 h-4 text-indigo-400" />
                      {isAr ? "خطوات الحقول والتحققات" : "Fields & Step Setup"}
                    </h4>

                    {selectedForm.steps?.map((step, sIdx) => (
                      <div
                        key={sIdx}
                        className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 space-y-3"
                      >
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                          <input
                            type="text"
                            value={step.stepTitle}
                            onChange={(e) => {
                              const updatedSteps = [...selectedForm.steps];
                              updatedSteps[sIdx].stepTitle = e.target.value;
                              setSelectedForm({ ...selectedForm, steps: updatedSteps });
                            }}
                            className="bg-transparent border-none text-xs font-black text-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500/20 px-1 rounded"
                          />
                          <span className="text-[10px] text-slate-500 font-mono font-bold">
                            Step {sIdx + 1}
                          </span>
                        </div>

                        {/* Fields List */}
                        <div className="space-y-2">
                          {step.fields?.map((fld, fIdx) => (
                            <div
                              key={fld.id || fIdx}
                              className="bg-slate-950 p-3 rounded-lg border border-slate-800/60 flex flex-col gap-2"
                            >
                              <div className="flex justify-between items-center">
                                <input
                                  type="text"
                                  value={fld.label}
                                  onChange={(e) => {
                                    const updatedSteps = [...selectedForm.steps];
                                    updatedSteps[sIdx].fields[fIdx].label = e.target.value;
                                    setSelectedForm({ ...selectedForm, steps: updatedSteps });
                                  }}
                                  className="bg-transparent border-none text-xs text-white focus:outline-none font-bold"
                                />
                                <button
                                  onClick={() => handleDeleteField(sIdx, fIdx)}
                                  className="text-slate-500 hover:text-rose-400 p-1 rounded"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                                <select
                                  value={fld.type}
                                  onChange={(e) => {
                                    const updatedSteps = [...selectedForm.steps];
                                    updatedSteps[sIdx].fields[fIdx].type = e.target.value as any;
                                    setSelectedForm({ ...selectedForm, steps: updatedSteps });
                                  }}
                                  className="bg-slate-900 text-[10px] text-slate-300 rounded border border-slate-800 p-1"
                                >
                                  <option value="text">Short Text</option>
                                  <option value="email">Email Address</option>
                                  <option value="tel">Telephone (Tel)</option>
                                  <option value="select">Dropdown Menu</option>
                                  <option value="file">File Upload</option>
                                  <option value="signature">E-Signature</option>
                                </select>

                                <label className="flex items-center gap-1.5 text-[10px] text-slate-400 cursor-pointer justify-end">
                                  <input
                                    type="checkbox"
                                    checked={fld.required}
                                    onChange={(e) => {
                                      const updatedSteps = [...selectedForm.steps];
                                      updatedSteps[sIdx].fields[fIdx].required = e.target.checked;
                                      setSelectedForm({ ...selectedForm, steps: updatedSteps });
                                    }}
                                    className="accent-indigo-500 h-3 w-3"
                                  />
                                  {isAr ? "مطلوب" : "Required"}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={() => handleAddField(sIdx)}
                          className="w-full border border-dashed border-slate-800 hover:border-slate-700 text-[11px] text-slate-400 hover:text-white py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          {isAr ? "إضافة حقل مخصص" : "Add Custom Field"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Mockup (lg:col-span-7) */}
                <div className="lg:col-span-7 bg-slate-950/40 p-5 flex items-center justify-center border-l border-slate-800/40">
                  <div className="w-full max-w-md bg-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none" />

                    <div className="text-center mb-6">
                      <h3 className="text-lg font-black text-white">{selectedForm.name}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {isAr
                          ? "يرجى ملء النموذج بخطوات بسيطة للتأهيل"
                          : "Please complete the steps below to finish"}
                      </p>
                    </div>

                    {/* Step indicator bars */}
                    <div className="flex gap-1.5 mb-6">
                      {selectedForm.steps?.map((_, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "h-1.5 flex-1 rounded-full transition-all duration-300",
                            idx <= activeFormStepPreview ? "bg-indigo-500" : "bg-slate-800"
                          )}
                        />
                      ))}
                    </div>

                    <AnimatePresence mode="wait">
                      {selectedForm.steps?.[activeFormStepPreview] && (
                        <motion.div
                          key={activeFormStepPreview}
                          initial={{ opacity: 0, x: isAr ? -15 : 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: isAr ? 15 : -15 }}
                          className="space-y-4 bg-slate-900/40 border border-slate-800 p-5 rounded-xl shadow-lg"
                        >
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-2.5 py-0.5 rounded-full font-mono font-bold">
                            {selectedForm.steps[activeFormStepPreview].stepTitle}
                          </span>

                          {selectedForm.steps[activeFormStepPreview].fields?.map((fld, fIdx) => (
                            <div key={fld.id || fIdx} className="space-y-1.5">
                              <label className="text-xs text-slate-300 font-bold">
                                {fld.label}{" "}
                                {fld.required && <span className="text-rose-500">*</span>}
                              </label>

                              {fld.type === "select" ? (
                                <select
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300"
                                  disabled
                                >
                                  <option>
                                    {fld.placeholder ||
                                      (isAr ? "اختر من القائمة..." : "Select options...")}
                                  </option>
                                </select>
                              ) : fld.type === "signature" ? (
                                <div className="border border-dashed border-slate-800 bg-slate-950 rounded-xl h-24 flex items-center justify-center text-[10px] text-slate-500 font-mono">
                                  {isAr
                                    ? "التوقيع الإلكتروني هنا"
                                    : "Sign here (electronic signature)"}
                                </div>
                              ) : fld.type === "file" ? (
                                <div className="border border-dashed border-slate-800 bg-slate-950 rounded-xl py-4 text-center cursor-pointer hover:bg-slate-900/60 transition-all">
                                  <span className="block text-xs text-indigo-400 font-bold">
                                    {isAr ? "تحميل ملف" : "Upload File"}
                                  </span>
                                  <span className="block text-[9px] text-slate-500 mt-0.5">
                                    {isAr
                                      ? "اسحب الملف أو اختر من جهازك"
                                      : "Drag and drop or select files"}
                                  </span>
                                </div>
                              ) : (
                                <input
                                  type={
                                    fld.type === "email"
                                      ? "email"
                                      : fld.type === "tel"
                                        ? "tel"
                                        : "text"
                                  }
                                  placeholder={fld.placeholder}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white"
                                  disabled
                                />
                              )}
                            </div>
                          ))}

                          <div className="flex gap-2 pt-2">
                            {activeFormStepPreview > 0 && (
                              <button
                                onClick={() => setActiveFormStepPreview((p) => p - 1)}
                                className="bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs py-2.5 px-4 rounded-xl font-bold border border-slate-800"
                              >
                                {isAr ? "السابق" : "Prev"}
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (activeFormStepPreview < (selectedForm.steps?.length || 1) - 1) {
                                  setActiveFormStepPreview((p) => p + 1);
                                } else {
                                  toast.info(
                                    isAr
                                      ? "هذا مجرد عرض تفاعلي للنموذج!"
                                      : "This is just an interactive mockup preview!"
                                  );
                                  setActiveFormStepPreview(0);
                                }
                              }}
                              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs py-2.5 rounded-xl font-bold transition-all"
                            >
                              {activeFormStepPreview === (selectedForm.steps?.length || 1) - 1
                                ? isAr
                                  ? "إرسال البيانات والتأهيل 🚀"
                                  : "Submit & Qualify 🚀"
                                : isAr
                                  ? "التالي"
                                  : "Next Step"}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
