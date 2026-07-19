import React, { useState } from "react";
import {
  Sparkles,
  GitPullRequest,
  Mail,
  Clock,
  Filter,
  Plus,
  Trash2,
  XCircle,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { EmailAutomation, WorkflowStep } from "./useEmailMarketing";

interface AutomationFlowsProps {
  automations: EmailAutomation[];
  isAr: boolean;
  onSaveAutomation: (payload: Partial<EmailAutomation>) => Promise<boolean>;
  onGenerateAiWorkflow: (goal: string, trigger: string) => Promise<any>;
  aiGenerating: boolean;
}

export default function AutomationFlows({
  automations,
  isAr,
  onSaveAutomation,
  onGenerateAiWorkflow,
  aiGenerating,
}: AutomationFlowsProps) {
  const [showAutModal, setShowAutModal] = useState(false);
  const [autName, setAutName] = useState("");
  const [autTrigger, setAutTrigger] = useState("Lead Created");
  const [autSteps, setAutSteps] = useState<WorkflowStep[]>([]);

  // AI Workflow state
  const [aiWorkflowGoal, setAiWorkflowGoal] = useState("");

  const handleAiPlanFlow = async () => {
    if (!aiWorkflowGoal) return;
    const data = await onGenerateAiWorkflow(aiWorkflowGoal, autTrigger);
    if (data) {
      setAutSteps(data.steps || []);
      setAutName(data.workflowName || "AI Planned Flow");
      setShowAutModal(true);
    }
  };

  const handleSave = async () => {
    if (!autName) return;
    const payload = {
      name: autName,
      triggerEvent: autTrigger,
      steps:
        autSteps.length > 0
          ? autSteps
          : [
              {
                id: "1",
                type: "email" as const,
                label: isAr ? "أهلاً بك" : "Welcome Email",
                delayDays: 0,
              },
            ],
      status: "Active" as const,
    };
    const success = await onSaveAutomation(payload);
    if (success) {
      setShowAutModal(false);
      setAutName("");
      setAutSteps([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Workflow Planner Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-200 uppercase tracking-widest">
            {isAr ? "مساعد تصميم الأتمتة بالذكاء الاصطناعي" : "AI Workflow Copilot"}
          </span>
        </div>
        <h3 className="text-lg font-bold">
          {isAr
            ? "صمم قمع ومسار أتمتة مبيعات متطور بلحظات"
            : "Design high-converting multi-step email automations"}
        </h3>
        <p className="text-xs text-indigo-200 mt-1">
          {isAr
            ? "اكتب هدف الأتمتة والحدث المحفز، وسيقوم نظامنا بتصميم المسار والمؤقتات بالكامل"
            : "Describe your workflow goal to instantly generate dynamic triggers, waits, and checkpoints."}
        </p>

        <div className="mt-4 flex flex-col md:flex-row gap-2">
          <input
            type="text"
            value={aiWorkflowGoal}
            onChange={(e) => setAiWorkflowGoal(e.target.value)}
            placeholder={
              isAr
                ? "مثال: استعادة العملاء الذين لم يشتروا منذ 30 يوم، وتقديم عروض تصاعدية مخصصة"
                : "e.g. Onboard new real-estate clients with deep tutorials and exclusive discounts"
            }
            className="flex-1 bg-white/10 text-white border border-white/20 px-4 py-2.5 rounded-xl text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={autTrigger}
            onChange={(e) => setAutTrigger(e.target.value)}
            className="bg-white/10 text-white border border-white/20 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Lead Created" className="text-slate-950">
              {isAr ? "عميل محتمل جديد" : "Lead Created"}
            </option>
            <option value="Cart Abandoned" className="text-slate-950">
              {isAr ? "سلة متروكة" : "Cart Abandoned"}
            </option>
            <option value="E-commerce Purchase" className="text-slate-950">
              {isAr ? "عملية شراء" : "E-commerce Purchase"}
            </option>
          </select>

          <button
            onClick={handleAiPlanFlow}
            disabled={aiGenerating || !aiWorkflowGoal}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {aiGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isAr ? "جاري التخطيط..." : "Planning..."}
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                {isAr ? "ابتكار المسار الذكي" : "Design Workflow"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar to add custom automation manually */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h4 className="text-sm font-bold text-slate-800">
            {isAr ? "المسارات النشطة" : "Active Flow Journeys"}
          </h4>
          <p className="text-xs text-slate-400">
            {isAr
              ? "أتمتة مخصصة بالكامل لمراحل قمع المبيعات"
              : "Engage leads automatically at specific lifecycle steps"}
          </p>
        </div>
        <button
          onClick={() => {
            setAutName("");
            setAutSteps([]);
            setShowAutModal(true);
          }}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {isAr ? "بناء مسار مخصص" : "Create Custom Flow"}
        </button>
      </div>

      {/* Automation Flows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {automations.map((aut) => (
          <div
            key={aut.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-2">
                  {aut.name}
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full">
                    {aut.status}
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Trigger: <strong className="text-slate-600">{aut.triggerEvent}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3 text-right text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? "المسجلين" : "ENROLLED"}
                  </span>
                  <span className="font-bold text-slate-800">{aut.enrolledCount || 0}</span>
                </div>
                <div className="border-l border-slate-200 h-5" />
                <div>
                  <span className="text-[10px] text-slate-400 block">
                    {isAr ? "المكتملين" : "COMPLETED"}
                  </span>
                  <span className="font-bold text-slate-800">{aut.completedCount || 0}</span>
                </div>
              </div>
            </div>

            {/* flowchart step connector rendering */}
            <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2 pt-2">
              {aut.steps?.map((step, index) => (
                <div key={step.id || index} className="relative flex items-start gap-3">
                  <span className="absolute -left-[23px] top-1.5 w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-white"></span>
                  <div className="p-3 bg-slate-50/60 hover:bg-slate-50 rounded-xl flex-1 text-xs border border-slate-150 transition">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        {step.type === "email" ? (
                          <Mail className="w-3.5 h-3.5 text-indigo-500" />
                        ) : step.type === "wait" ? (
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                        ) : (
                          <Filter className="w-3.5 h-3.5 text-teal-500" />
                        )}
                        {step.label}
                      </span>
                      {step.delayDays !== undefined && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          Delay: {step.delayDays}d
                        </span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-[10px] text-slate-400 mt-1">{step.description}</p>
                    )}

                    {/* Yes steps nested path */}
                    {step.yesSteps && step.yesSteps.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-400 space-y-1.5 bg-emerald-50/30 p-2 rounded-lg">
                        <span className="text-[9px] font-bold text-emerald-700 block">
                          ✓ {isAr ? "إذا تفاعل / فتح البريد" : "Yes / Interacted"}
                        </span>
                        {step.yesSteps.map((ys) => (
                          <div
                            key={ys.id}
                            className="text-[10px] text-slate-600 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            {ys.label}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No steps nested path */}
                    {step.noSteps && step.noSteps.length > 0 && (
                      <div className="mt-2 pl-3 border-l-2 border-rose-400 space-y-1.5 bg-rose-50/30 p-2 rounded-lg">
                        <span className="text-[9px] font-bold text-rose-700 block">
                          ✗ {isAr ? "إذا لم يتفاعل" : "No / Bounce"}
                        </span>
                        {step.noSteps.map((ns) => (
                          <div
                            key={ns.id}
                            className="text-[10px] text-slate-600 flex items-center gap-1"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                            {ns.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CUSTOM WORKFLOW CREATOR MODAL */}
      <AnimatePresence>
        {showAutModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {isAr ? "تخطيط مسار أتمتة مخصص" : "Plan Custom Automation"}
                </h3>
                <button
                  onClick={() => setShowAutModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "اسم سير الأتمتة" : "Workflow Name"}
                  </label>
                  <input
                    type="text"
                    value={autName}
                    onChange={(e) => setAutName(e.target.value)}
                    placeholder="e.g. Welcome Nurture Sequence"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "المحفز / نقطة البداية" : "Trigger Event"}
                  </label>
                  <select
                    value={autTrigger}
                    onChange={(e) => setAutTrigger(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="Lead Created">Lead Created (عميل محتمل جديد)</option>
                    <option value="Cart Abandoned">Cart Abandoned (سلة متروكة)</option>
                    <option value="E-commerce Purchase">E-commerce Purchase (شراء منتج)</option>
                  </select>
                </div>
              </div>

              {/* Steps builder list */}
              <div className="space-y-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-h-60 overflow-y-auto">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">
                  {isAr ? "الخطوات المضافة" : "Flow Sequence"}
                </span>
                {autSteps.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">
                    {isAr ? "لا توجد خطوات مضافة بعد" : "No steps configured yet"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {autSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-150 text-xs font-semibold"
                      >
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] uppercase rounded">
                          {step.type}
                        </span>
                        <span className="flex-1 text-slate-800">{step.label}</span>
                        <button
                          onClick={() => setAutSteps(autSteps.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700 transition p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5 pt-2">
                  <button
                    onClick={() =>
                      setAutSteps([
                        ...autSteps,
                        {
                          id: `${Date.now()}`,
                          type: "email",
                          label: isAr ? "ارسل بريد إلكتروني ترحيبي" : "Dispatch welcome email",
                          delayDays: 0,
                        },
                      ])
                    }
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded transition"
                  >
                    + Email
                  </button>
                  <button
                    onClick={() =>
                      setAutSteps([
                        ...autSteps,
                        {
                          id: `${Date.now()}`,
                          type: "wait",
                          label: isAr ? "انتظار 3 أيام" : "Wait 3 days",
                          delayDays: 3,
                        },
                      ])
                    }
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold rounded transition"
                  >
                    + Wait
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  onClick={() => setShowAutModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleSave}
                  disabled={!autName}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
                >
                  {isAr ? "حفظ الأتمتة" : "Save Automation"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
