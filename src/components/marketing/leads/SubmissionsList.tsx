import React, { useState } from "react";
import {
  Cpu,
  BarChart3,
  Calendar,
  Globe,
  DollarSign,
  User,
  Mail,
  Phone,
  Building,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { leadsService, Submission } from "@/src/services/leads.service";

interface SubmissionsListProps {
  submissions: Submission[];
  onRefresh: () => void;
}

export default function SubmissionsList({ submissions, onRefresh }: SubmissionsListProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // State
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(
    submissions[0] || null
  );
  const [enrichingId, setEnrichingId] = useState<string | null>(null);

  // Trigger Gemini AI Lead Enrichment and Intent engine
  const handleRunAIEnrichment = async (subId: string) => {
    setEnrichingId(subId);
    toast.info(
      isAr
        ? "جاري تشغيل محرك إثراء البيانات والبحث الذكي..."
        : "Triggering company enrichment and intent engine..."
    );
    try {
      const updated = await leadsService.analyzeSubmission(subId);

      // Update local state if the enriched submission is active
      if (selectedSubmission?.id === subId) {
        setSelectedSubmission(updated);
      }
      onRefresh();
      toast.success(
        isAr
          ? "اكتمل إثراء البيانات وتحليل النوايا بالذكاء الاصطناعي!"
          : "Lead enrichment and AI scoring completed!"
      );
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "فشل تحليل البيانات" : "Failed to analyze submission data");
    } finally {
      setEnrichingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Submissions List Sidebar Pane (lg:col-span-7) */}
      <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl p-5 flex flex-col overflow-hidden shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-black text-white">
            {isAr ? "سجل إدخالات وتحويلات العملاء" : "Acquisition Submission Records"}
          </h3>
          <span className="text-[10px] font-mono text-slate-500">
            {submissions.length} {isAr ? "مسجل" : "Records"}
          </span>
        </div>

        <div className="space-y-3 overflow-y-auto max-h-[550px] pr-1">
          {submissions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500 font-mono">
                {isAr ? "لا توجد عمليات التقاط حالية." : "No captured submissions recorded yet."}
              </p>
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                onClick={() => setSelectedSubmission(sub)}
                className={cn(
                  "p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-start",
                  selectedSubmission?.id === sub.id
                    ? "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-600/5"
                    : "bg-slate-900/30 border-slate-800/80 hover:bg-slate-900/60"
                )}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5 text-[10px] font-mono text-slate-500">
                    <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full">
                      {sub.source || "Direct"}
                    </span>
                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-white">
                      {sub.data?.name || (isAr ? "عميل مجهول" : "Anonymous Lead")}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{sub.data?.email}</p>
                    {sub.data?.company && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                        <Building className="w-3 h-3" />
                        {sub.data.company}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between h-full min-h-[70px]">
                  <span
                    className={cn(
                      "text-[9px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase",
                      sub.score === "Hot"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10"
                        : sub.score === "Warm"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/10"
                          : "bg-slate-800 text-slate-400"
                    )}
                  >
                    {sub.score || "Cold"}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-2">{sub.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. Lead Deep Insight Detail Pane (lg:col-span-5) */}
      <div className="lg:col-span-5">
        <AnimatePresence mode="wait">
          {selectedSubmission ? (
            <motion.div
              key={selectedSubmission.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-2xl relative"
            >
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  {isAr ? "تفاصيل الفرصة والتأهيل المتقدم" : "Sales Intel & Lead Profile"}
                </h3>
                <span className="text-[9px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                  ID: {selectedSubmission.id.slice(-6)}
                </span>
              </div>

              {/* Action: Trigger Gemini AI Enrichment */}
              <button
                onClick={() => handleRunAIEnrichment(selectedSubmission.id)}
                disabled={enrichingId === selectedSubmission.id}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15 transition-all disabled:opacity-50"
              >
                {enrichingId === selectedSubmission.id ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Cpu className="w-4 h-4" />
                )}
                {enrichingId === selectedSubmission.id
                  ? isAr
                    ? "جاري تأهيل وتدقيق البيانات..."
                    : "Fetching company context..."
                  : isAr
                    ? "إثراء البيانات وتقييم الأهمية بالذكاء الاصطناعي 🧠"
                    : "AI Deep Qualify & Score 🧠"}
              </button>

              {/* Section: Raw Client-Provided Info */}
              <div className="space-y-3 bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs">
                <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  {isAr ? "بيانات الإدخال الملتقطة" : "Captured Submissions Details"}
                </h4>

                <div className="space-y-2 font-mono text-slate-300">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">{isAr ? "الاسم:" : "Name:"}</span>{" "}
                    <span className="text-white font-sans">{selectedSubmission.data?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">{isAr ? "البريد:" : "Email:"}</span>{" "}
                    <span className="text-white">{selectedSubmission.data?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">{isAr ? "الهاتف:" : "Phone:"}</span>{" "}
                    <span className="text-white">{selectedSubmission.data?.phone || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">{isAr ? "الشركة:" : "Company:"}</span>{" "}
                    <span className="text-white font-sans">
                      {selectedSubmission.data?.company || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-slate-600" />
                    <span className="text-slate-500">{isAr ? "الميزانية:" : "Budget:"}</span>{" "}
                    <span className="text-indigo-400 font-bold">
                      {selectedSubmission.data?.budget || 0} SAR
                    </span>
                  </div>
                  {selectedSubmission.data?.message && (
                    <div className="pt-2 border-t border-slate-900 text-slate-400 font-sans leading-relaxed">
                      <span className="text-slate-500 block text-[10px] font-mono font-bold mb-1 uppercase">
                        {isAr ? "الرسالة والملاحظات:" : "User Message:"}
                      </span>
                      {selectedSubmission.data.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Section: Gemini AI Enriched Lead Info */}
              {selectedSubmission.enrichedData ? (
                <div className="space-y-3">
                  <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/10 space-y-2">
                    <h4 className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5" />
                      {isAr ? "ملف الشركة المثرى بالذكاء الاصطناعي" : "AI Company Insights"}
                    </h4>
                    <div className="text-xs space-y-1.5 font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500">{isAr ? "النطاق:" : "Domain:"}</span>{" "}
                        <span className="text-white">{selectedSubmission.enrichedData.domain}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">
                          {isAr ? "حجم الموظفين:" : "Headcount:"}
                        </span>{" "}
                        <span className="text-white">{selectedSubmission.enrichedData.size}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">
                          {isAr ? "الإيرادات السنوية:" : "Revenue:"}
                        </span>{" "}
                        <span className="text-emerald-400">
                          {selectedSubmission.enrichedData.revenue}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">{isAr ? "المجال:" : "Industry:"}</span>{" "}
                        <span className="text-white font-sans">
                          {selectedSubmission.enrichedData.industry}
                        </span>
                      </div>
                      <div className="pt-1.5 border-t border-slate-900/60">
                        <span className="text-slate-500 block text-[10px] uppercase mb-1">
                          Tech Stack Used
                        </span>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                          {selectedSubmission.enrichedData.technologiesUsed}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Qualification verdict */}
                  {selectedSubmission.qualification && (
                    <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 space-y-3 text-xs leading-relaxed">
                      <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {isAr ? "تقرير التأهيل والتوزيع الذكي" : "Lead Scoring Verdict"}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 font-mono">
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block text-[9px]">Conversion Prob</span>
                          <span className="text-white font-black">
                            {selectedSubmission.qualification.conversionProbability}%
                          </span>
                        </div>
                        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/60">
                          <span className="text-slate-500 block text-[9px]">Routed Rep</span>
                          <span className="text-white font-sans truncate block">
                            {selectedSubmission.qualification.assignedSalesRep}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="font-bold text-slate-400 block mb-1">
                          {isAr ? "تحليل النية والتأهيل:" : "Verdict Reason:"}
                        </span>
                        <p className="text-slate-300 font-sans">
                          {selectedSubmission.qualification.qualificationExplanation}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-900">
                        <span className="font-bold text-slate-400 block mb-1">
                          {isAr ? "الإجراء الموصى به للمبيعات:" : "Recommended Next Step:"}
                        </span>
                        <p className="text-slate-300 font-sans">
                          {selectedSubmission.qualification.recommendedFollowUp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-900/20 p-8 rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                  {isAr
                    ? "انقر على زر 'إثراء البيانات' أعلاه لاستدعاء الذكاء الاصطناعي لتأهيل العميل بالكامل."
                    : "No corporate info fetched. Click run AI enrichment above."}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500 font-mono">
              {isAr
                ? "اختر عميلاً من القائمة لعرض تفاصيله وإثراء بياناته."
                : "Select a submission to view metrics."}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
