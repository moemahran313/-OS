import React, { useState } from "react";
import {
  Play,
  Pause,
  Plus,
  Trash2,
  Clock,
  Mail,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  ArrowDown,
  Layers,
  Filter,
  UserCheck,
  Send,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CampaignWorkflow, CampaignStep } from "@/src/types/leadGen";
import { toast } from "sonner";

interface CampaignWorkflowBuilderProps {
  campaigns: CampaignWorkflow[];
  onSaveCampaign: (campaign: CampaignWorkflow) => void;
}

export const CampaignWorkflowBuilder: React.FC<CampaignWorkflowBuilderProps> = ({
  campaigns,
  onSaveCampaign,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignWorkflow | null>(
    campaigns[0] || null
  );

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSegment, setNewSegment] = useState("");

  const handleToggleStatus = (camp: CampaignWorkflow) => {
    const updated: CampaignWorkflow = {
      ...camp,
      status: camp.status === "active" ? "paused" : "active",
    };
    onSaveCampaign(updated);
    if (selectedCampaign?.id === camp.id) setSelectedCampaign(updated);
    toast.success(
      updated.status === "active"
        ? "تم تفعيل حملة التواصل الآلية بنجاح"
        : "تم إيقاف الحملة مؤقتاً"
    );
  };

  const handleCreateNewCampaign = () => {
    if (!newTitle) {
      toast.error("يرجى إدخال اسم الحملة");
      return;
    }

    const newCamp: CampaignWorkflow = {
      id: `camp-${Date.now()}`,
      title: newTitle,
      status: "active",
      targetSegment: newSegment || "جميع الشركات المستهدفة",
      steps: [
        { id: "st-1", type: "import", label: "استيراد القائمة المستهدفة", config: {} },
        { id: "st-2", type: "ai_qualify", label: "تأهيل وتصنيف AI للشركات", config: { minScoreThreshold: 70 } },
        { id: "st-3", type: "send_email", label: "إرسال إيميل بارد مخصص", config: {} },
        { id: "st-4", type: "delay", label: "الانتظار لمدة 3 أيام", config: { delayDays: 3 } },
        { id: "st-5", type: "send_whatsapp", label: "إرسال رسالة واتساب متابعة", config: {} },
        { id: "st-6", type: "create_task", label: "إنشاء مهمة اتصال لمسؤول المبيعات", config: {} },
      ],
      leadsEnrolled: 0,
      emailsSent: 0,
      repliesReceived: 0,
      conversions: 0,
      createdAt: new Date().toISOString(),
    };

    onSaveCampaign(newCamp);
    setSelectedCampaign(newCamp);
    setIsCreatingNew(false);
    setNewTitle("");
    setNewSegment("");
    toast.success("تم إنشاء تسلسل التواصل الآلي بنجاح");
  };

  return (
    <div className="space-y-6 dir-rtl">
      {/* Top Header & Selector */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>باني تسلسلات التواصل الآلية (Outreach Campaign Builder)</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            تصميم مسارات تواصل متعددة القنوات (إيميل، واتساب، مهام مبيعات) تلقائياً للمستهدفين.
          </p>
        </div>

        <button
          onClick={() => setIsCreatingNew(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء حملة جديدة</span>
        </button>
      </div>

      {/* Campaign List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => {
          const isSelected = selectedCampaign?.id === camp.id;

          return (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaign(camp)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-white dark:bg-zinc-900 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/60 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        camp.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {camp.status === "active" ? "نشط الآن" : "موقوف مؤقتاً"}
                    </span>
                    <span className="text-xs text-zinc-400">{camp.targetSegment}</span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">{camp.title}</h3>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(camp);
                  }}
                  className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                    camp.status === "active"
                      ? "bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20"
                  }`}
                >
                  {camp.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-4 gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs font-bold">
                <div>
                  <span className="text-[10px] text-zinc-400 block">المستهدفون</span>
                  <span className="text-zinc-900 dark:text-zinc-100">{camp.leadsEnrolled}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">الإيميلات المرسلة</span>
                  <span className="text-blue-500">{camp.emailsSent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">الردود</span>
                  <span className="text-emerald-500">{camp.repliesReceived}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">التحويلات</span>
                  <span className="text-amber-500">{camp.conversions}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Workflow Steps Render */}
      {selectedCampaign && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div>
              <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                تسلسل خطوات الحملة: {selectedCampaign.title}
              </h3>
              <p className="text-xs text-zinc-400">
                {selectedCampaign.steps.length} خطوات متتالية مع معالجة ذكية للتأخير والشرط
              </p>
            </div>
          </div>

          <div className="space-y-4 max-w-xl mx-auto py-4">
            {selectedCampaign.steps.map((step, idx) => {
              const getIcon = () => {
                switch (step.type) {
                  case "import":
                    return <Filter className="w-4 h-4 text-purple-500" />;
                  case "ai_qualify":
                    return <Sparkles className="w-4 h-4 text-emerald-500" />;
                  case "send_email":
                    return <Mail className="w-4 h-4 text-blue-500" />;
                  case "delay":
                    return <Clock className="w-4 h-4 text-amber-500" />;
                  case "send_whatsapp":
                    return <MessageSquare className="w-4 h-4 text-emerald-500" />;
                  case "create_task":
                    return <UserCheck className="w-4 h-4 text-rose-500" />;
                  default:
                    return <Zap className="w-4 h-4 text-zinc-500" />;
                }
              };

              return (
                <React.Fragment key={step.id}>
                  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-2xl flex items-center justify-between gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        {getIcon()}
                      </div>
                      <div>
                        <span className="text-[10px] font-black text-zinc-400 block">الخطوة {idx + 1}</span>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">{step.label}</h4>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 bg-zinc-200/60 dark:bg-zinc-700/60 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-mono font-bold">
                      {step.type}
                    </span>
                  </div>

                  {idx < selectedCampaign.steps.length - 1 && (
                    <div className="flex justify-center">
                      <ArrowDown className="w-4 h-4 text-zinc-300 dark:text-zinc-600" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      <AnimatePresence>
        {isCreatingNew && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dir-rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">إنشاء تسلسل مبيعات آلي جديد</h3>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">اسم الحملة</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="مثال: حملة المكاتب الهندسية بالرياض"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-1">القطاع / الشرائح المستهدفة</label>
                <input
                  type="text"
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
                  placeholder="مثال: العيادات والمجمعات الطبية بجدة"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsCreatingNew(false)}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateNewCampaign}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl cursor-pointer"
                >
                  حفظ وتشغيل
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
