import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Flame,
  MessageSquare,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Send,
  Plus,
  X,
  ShieldCheck,
  Award,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

export interface LeadItem {
  id: string;
  name: string;
  phone?: string;
  company?: string;
  industry?: string;
  value?: number;
  status: string;
  notes?: string;
  qualificationScore?: number;
  leadScore?: "Hot" | "Warm" | "Cold";
  leadScoreReason?: string;
  buyingSignals?: string[];
  riskFactors?: string[];
  nextBestAction?: string;
  leadScoreDate?: string;
  messages?: Array<{
    id?: string;
    sender: "client" | "agent" | "system";
    text: string;
    timestamp: string;
  }>;
}

interface AiLeadQualificationHubProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadItem[];
  onRefreshLeads?: () => void;
  isAr?: boolean;
}

export const AiLeadQualificationHub: React.FC<AiLeadQualificationHubProps> = ({
  isOpen,
  onClose,
  leads,
  onRefreshLeads,
  isAr = true,
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    leads.length > 0 ? leads[0].id : null
  );
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isSingleScoring, setIsSingleScoring] = useState(false);
  const [newSimulatedMsg, setNewSimulatedMsg] = useState("");
  const [newNoteText, setNewNoteText] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "simulator" | "logs">("overview");

  if (!isOpen) return null;

  const currentLead = leads.find((l) => l.id === selectedLeadId) || leads[0];

  // Calculate metrics
  const totalLeads = leads.length;
  const hotLeads = leads.filter(
    (l) => l.leadScore === "Hot" || (l.qualificationScore && l.qualificationScore >= 75)
  );
  const warmLeads = leads.filter(
    (l) =>
      l.leadScore === "Warm" ||
      (l.qualificationScore && l.qualificationScore >= 45 && l.qualificationScore < 75)
  );
  const coldLeads = leads.filter(
    (l) =>
      l.leadScore === "Cold" ||
      (l.qualificationScore && l.qualificationScore < 45) ||
      (!l.leadScore && !l.qualificationScore)
  );
  const hotStageLeads = leads.filter((l) => l.status === "hot");

  // Run Batch Qualification across all leads
  const handleBatchQualify = async () => {
    setIsBatchRunning(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/leads/auto-qualify-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(
          isAr
            ? `تمت إعادة تأهيل ${data.totalProcessed} فرصة! تم النقل الآلي لـ ${data.movedToHotCount} فرصة إلى 'فرص ساخنة (Hot Lead)'`
            : `Auto-qualified ${data.totalProcessed} leads! Promoted ${data.movedToHotCount} to Hot stage.`
        );
        if (onRefreshLeads) onRefreshLeads();
      } else {
        toast.error(data.error || (isAr ? "فشل التأهيل الجماعي" : "Batch qualification failed"));
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في الاتصال بالخادم" : "Connection error");
    } finally {
      setIsBatchRunning(false);
    }
  };

  // Run Single Lead Qualification
  const handleQualifySingle = async (leadId: string) => {
    setIsSingleScoring(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/leads/${leadId}/score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        if (data.autoMoved) {
          toast.success(
            isAr
              ? `🔥 تم نقل العميل تلقائياً إلى 'فرص ساخنة (Hot Lead)' بدرجة تأهيل ${data.qualificationScore}%!`
              : `🔥 Lead promoted to 'Hot Lead' stage with ${data.qualificationScore}% score!`
          );
        } else {
          toast.info(
            isAr
              ? `تم تحديث تقييم الفرصة: ${data.qualificationScore}% (${data.score})`
              : `Lead score updated: ${data.qualificationScore}% (${data.score})`
          );
        }
        if (onRefreshLeads) onRefreshLeads();
      } else {
        toast.error(data.error || "فشل تقييم الفرصة");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsSingleScoring(false);
    }
  };

  // Add Simulated WhatsApp Chat & Re-score
  const handleAddSimulatedMessage = async () => {
    if (!currentLead) return;
    if (!newSimulatedMsg.trim()) {
      toast.error(isAr ? "يرجى كتابة نص الرسالة" : "Message text required");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const existingMessages = currentLead.messages || [];
      const updatedMessages = [
        ...existingMessages,
        {
          id: `msg_${Date.now()}`,
          sender: "client",
          text: newSimulatedMsg,
          timestamp: new Date().toISOString(),
        },
      ];

      // Update lead doc with new WhatsApp message
      const resUpdate = await fetch(`/api/leads/${currentLead.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (resUpdate.ok) {
        toast.success(isAr ? "تم تسجيل رسالة الواتساب بنجاح! جاري إعادة التأهيل بالذكاء الاصطناعي..." : "WhatsApp message logged! Re-evaluating with AI...");
        setNewSimulatedMsg("");
        // Instantly trigger AI score
        await handleQualifySingle(currentLead.id);
      }
    } catch (err) {
      toast.error(isAr ? "فشل حفظ المحادثة" : "Failed to log chat");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md overflow-y-auto"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-5 border-b border-zinc-800 bg-zinc-950/70 gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 shadow-inner">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl text-white tracking-tight">
                  {isAr ? "محرك تأهيل الفرص بالذكاء الاصطناعي (AI Lead Qualification Engine)" : "AI Lead Qualification Engine"}
                </h3>
                <span className="bg-orange-500/10 text-orange-400 border border-orange-500/30 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                  Mudarij AI Core
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                {isAr
                  ? "تحليل رسائل الواتساب وملاحظات CRM لفرز العروض وحساب مؤشرات الشراء ونقل الفرص الساخنة تلقائياً"
                  : "Analyze WhatsApp chats & CRM notes to assign conversion scores and auto-promote Hot Leads."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleBatchQualify}
              disabled={isBatchRunning}
              className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBatchRunning ? "animate-spin" : ""}`} />
              <span>{isBatchRunning ? (isAr ? "جاري إعادة التقييم..." : "Qualifying All...") : (isAr ? "تأهيل كافة الفرص الآن" : "Auto-Qualify All Leads")}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-zinc-950/40 border-b border-zinc-800 shrink-0 text-xs">
          <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase">{isAr ? "إجمالي الفرص" : "Total Leads"}</p>
              <p className="text-lg font-black text-white">{totalLeads}</p>
            </div>
            <Layers className="w-5 h-5 text-zinc-500" />
          </div>

          <div className="bg-orange-950/30 border border-orange-500/30 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-orange-400 uppercase">{isAr ? "فرص ساخنة (Hot)" : "Hot Leads"}</p>
              <p className="text-lg font-black text-orange-400">{hotLeads.length}</p>
            </div>
            <Flame className="w-5 h-5 text-orange-400" />
          </div>

          <div className="bg-amber-950/30 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-amber-400 uppercase">{isAr ? "فرص دافئة (Warm)" : "Warm Leads"}</p>
              <p className="text-lg font-black text-amber-400">{warmLeads.length}</p>
            </div>
            <Zap className="w-5 h-5 text-amber-400" />
          </div>

          <div className="bg-blue-950/30 border border-blue-500/30 p-3 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-blue-400 uppercase">{isAr ? "فرص باردة (Cold)" : "Cold Leads"}</p>
              <p className="text-lg font-black text-blue-400">{coldLeads.length}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between col-span-2 md:col-span-1">
            <div>
              <p className="text-[10px] font-bold text-emerald-400 uppercase">{isAr ? "في مرحلة Hot Lead" : "In Hot Stage"}</p>
              <p className="text-lg font-black text-emerald-400">{hotStageLeads.length}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-zinc-950/50 border-b border-zinc-800 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "لوحة التقييم ومؤشرات الشراء" : "Qualification & Buying Signals"}</span>
          </button>

          <button
            onClick={() => setActiveTab("simulator")}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "simulator"
                ? "bg-orange-500/15 text-orange-400 border border-orange-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{isAr ? "محاكي رسائل الواتساب والمدونات" : "WhatsApp & Notes Simulator"}</span>
          </button>
        </div>

        {/* Main Body Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Leads List */}
          <div className="lg:col-span-5 space-y-3 flex flex-col h-full border-l border-zinc-800/80 pr-0 lg:pr-4">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center justify-between">
              <span>{isAr ? "قائمة الفرص البيعية المسجلة:" : "Sales Pipeline Leads:"}</span>
              <span className="text-[10px] font-mono text-zinc-500">{leads.length} عميل</span>
            </h4>

            <div className="space-y-2 overflow-y-auto max-h-[500px] pl-1">
              {leads.map((lead) => {
                const isSelected = lead.id === (currentLead?.id || "");
                const qScore = lead.qualificationScore ?? (lead.leadScore === "Hot" ? 85 : lead.leadScore === "Warm" ? 60 : 35);
                const isHot = lead.leadScore === "Hot" || qScore >= 75;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? "bg-orange-950/20 border-orange-500/50 shadow-md shadow-orange-500/10"
                        : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-bold text-sm text-white truncate">{lead.name}</h5>
                        {isHot && (
                          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/40 text-[9px] font-black px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                            <Flame className="w-2.5 h-2.5 animate-pulse" />
                            Hot
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">{lead.company || "غير محدد"} • {lead.phone || "بدون رقم"}</p>
                      
                      {lead.buyingSignals && lead.buyingSignals.length > 0 && (
                        <div className="flex items-center gap-1 flex-wrap mt-1">
                          <span className="text-[9px] font-medium bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 truncate max-w-[200px]">
                            💬 {lead.buyingSignals[0]}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Score Meter */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className={`text-sm font-black font-mono ${isHot ? "text-orange-400" : qScore >= 45 ? "text-amber-400" : "text-zinc-400"}`}>
                        {qScore}%
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500">
                        {lead.status === "hot" ? "مرحلة Hot Lead" : lead.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Lead Detail & AI Insights */}
          <div className="lg:col-span-7 space-y-5">
            {currentLead ? (
              <>
                {/* Active Lead Header Box */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">{currentLead.name}</h3>
                        <span className="text-xs bg-zinc-800 text-zinc-300 px-2.5 py-0.5 rounded-full border border-zinc-700">
                          {currentLead.company || "شركة محلية"}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        القطاع: {currentLead.industry || "عام"} • الهاتف: {currentLead.phone || "غير مسجل"} • القيمة: {currentLead.value?.toLocaleString() || 0} ر.س
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQualifySingle(currentLead.id)}
                        disabled={isSingleScoring}
                        className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className={`w-3.5 h-3.5 text-orange-400 ${isSingleScoring ? "animate-spin" : ""}`} />
                        <span>{isSingleScoring ? "جاري التقييم..." : "إعادة تقييم الفرصة"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Qualification Score Gauge Bar */}
                  <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-orange-400" />
                        <span>مؤشر الجاهزية والتأهيل (Qualification Score):</span>
                      </span>
                      <span className="font-mono text-base font-black text-orange-400">
                        {currentLead.qualificationScore ?? (currentLead.leadScore === "Hot" ? 85 : currentLead.leadScore === "Warm" ? 60 : 35)} / 100
                      </span>
                    </div>

                    <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700/80">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500 shadow-md shadow-orange-500/20"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(
                              10,
                              currentLead.qualificationScore ??
                                (currentLead.leadScore === "Hot" ? 85 : currentLead.leadScore === "Warm" ? 60 : 35)
                            )
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1 font-medium">
                      <span>0% (مستبعد)</span>
                      <span>50% (فرصة دافئة)</span>
                      <span className="text-orange-400 font-bold">75%+ (تحويل تلقائي إلى Hot Lead)</span>
                    </div>
                  </div>
                </div>

                {/* TAB CONTENT 1: OVERVIEW & SIGNALS */}
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    {/* Buying Signals extracted from WhatsApp & Notes */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>مؤشرات وإشارات الشراء المستخرجة (Buying Signals):</span>
                      </h4>

                      {currentLead.buyingSignals && currentLead.buyingSignals.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {currentLead.buyingSignals.map((signal, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-1.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 rounded-xl text-xs font-medium flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                              <span>{signal}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">
                          جاري تحليل الملاحظات ورسائل الواتساب لاستخراج إشارات الاهتمام...
                        </p>
                      )}
                    </div>

                    {/* AI Rationale & Next Best Action */}
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-orange-400 flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>توجيه المبيعات بالذكاء الاصطناعي (AI Rationale & Plan):</span>
                      </h4>

                      <p className="text-xs text-zinc-300 leading-relaxed font-sans bg-zinc-900 p-3 rounded-xl border border-zinc-800">
                        {currentLead.leadScoreReason || "اضغط على زر 'إعادة تقييم الفرصة' لتحليل المحادثات والملاحظات وتحديث التحليل الاستراتيجي."}
                      </p>

                      {currentLead.nextBestAction && (
                        <div className="p-3 bg-orange-950/30 border border-orange-500/30 rounded-xl flex items-center gap-2 text-xs font-bold text-orange-300">
                          <ArrowRight className="w-4 h-4 text-orange-400 shrink-0" />
                          <span>الخطوة الموصى بها: {currentLead.nextBestAction}</span>
                        </div>
                      )}
                    </div>

                    {/* Risk Factors if any */}
                    {currentLead.riskFactors && currentLead.riskFactors.length > 0 && (
                      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-2">
                        <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>عقبات وتحفظات الشراء (Risk Factors):</span>
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {currentLead.riskFactors.map((risk, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-lg text-xs"
                            >
                              • {risk}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB CONTENT 2: WHATSAPP & NOTES SIMULATOR */}
                {activeTab === "simulator" && (
                  <div className="space-y-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-white flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-emerald-400" />
                        <span>محاكي محادثات الواتساب الحية للعميل:</span>
                      </h4>

                      {/* Message History list */}
                      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                        {currentLead.messages && currentLead.messages.length > 0 ? (
                          currentLead.messages.map((m, idx) => (
                            <div
                              key={idx}
                              className={`p-2.5 rounded-xl text-xs ${
                                m.sender === "client"
                                  ? "bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 self-start"
                                  : "bg-zinc-800 text-zinc-300 self-end"
                              }`}
                            >
                              <div className="flex justify-between text-[9px] text-zinc-400 mb-1 font-mono">
                                <span>{m.sender === "client" ? "العميل (WhatsApp)" : "مسؤول المبيعات"}</span>
                                <span>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString("ar-SA") : ""}</span>
                              </div>
                              <p>{m.text}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-zinc-500 text-center py-4">
                            لا توجد رسائل واتساب مسجلة. يمكنك تجربة إضافة رسالة عميل لمعاينة التأهيل الفوري!
                          </p>
                        )}
                      </div>

                      {/* Input New Simulated WhatsApp Message */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newSimulatedMsg}
                          onChange={(e) => setNewSimulatedMsg(e.target.value)}
                          placeholder="مثال: مرحباً، نحن بحاجة لتوقيع العقد فوراً وتخصيص ميزانية 50,000 ر.س"
                          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddSimulatedMessage}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>إرسال وتأهيل</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-zinc-500 text-xs">
                يرجى اختيار فرصة من القائمة لعرض تفاصيل التأهيل.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
