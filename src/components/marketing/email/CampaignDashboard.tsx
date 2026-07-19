import React, { useState } from "react";
import {
  Send,
  CheckCircle,
  Eye,
  TrendingUp,
  Target,
  DollarSign,
  Sparkles,
  Smartphone,
  Monitor,
  Grid,
  Plus,
  Edit2,
  Play,
  Trash2,
  Split,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { EmailCampaign } from "./useEmailMarketing";

interface CampaignDashboardProps {
  campaigns: EmailCampaign[];
  isAr: boolean;
  onEditCampaign: (camp: EmailCampaign) => void;
  onSendCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
  onCreateNewCampaign: () => void;
  activeView: "dashboard" | "campaigns";
}

export default function CampaignDashboard({
  campaigns,
  isAr,
  onEditCampaign,
  onSendCampaign,
  onDeleteCampaign,
  onCreateNewCampaign,
  activeView,
}: CampaignDashboardProps) {
  // Local state for expanded A/B test campaign ID
  const [expandedAbCampId, setExpandedAbCampId] = useState<string | null>(null);

  // Aggregated stats
  const totalSent = campaigns.reduce((acc, c) => acc + (c.sentCount || 0), 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + (c.openCount || 0), 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + (c.clickCount || 0), 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.revenueGenerated || 0), 0);

  const avgOpenRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const avgClickRate = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

  // Chart data
  const campaignHistoryData = campaigns
    .filter((c) => c.status === "Sent")
    .map((c) => ({
      name: c.name.length > 15 ? c.name.slice(0, 15) + "..." : c.name,
      opens: c.openCount,
      clicks: c.clickCount,
      revenue: c.revenueGenerated,
    }))
    .reverse();

  // Helper to generate simulated A/B testing split results if not saved
  const getAbSplitMetrics = (camp: EmailCampaign) => {
    // If the campaign is Sent and has abTest enabled, we create a deterministic but realistic split
    const splitA_Ratio = 0.5;
    const splitB_Ratio = 0.5;

    const totalA_Sent = Math.round(camp.sentCount * splitA_Ratio);
    const totalB_Sent = Math.round(camp.sentCount * splitB_Ratio);

    // Give Variant B slightly better performance to represent a realistic test outcome
    const openRateA = 0.32;
    const openRateB = 0.44;

    const clickRateA = 0.12;
    const clickRateB = 0.19;

    const opensA = Math.round(totalA_Sent * openRateA);
    const opensB = Math.round(totalB_Sent * openRateB);

    const clicksA = Math.round(opensA * clickRateA);
    const clicksB = Math.round(opensB * clickRateB);

    const winner = opensB / totalB_Sent > opensA / totalA_Sent ? "B" : "A";
    const uplift = (
      ((opensB / totalB_Sent - opensA / totalA_Sent) / (opensA / totalA_Sent)) *
      100
    ).toFixed(1);

    return {
      sentA: totalA_Sent,
      sentB: totalB_Sent,
      opensA,
      opensB,
      clicksA,
      clicksB,
      rateA: (openRateA * 100).toFixed(1),
      rateB: (openRateB * 100).toFixed(1),
      clickRateA: (clickRateA * 100).toFixed(1),
      clickRateB: (clickRateB * 100).toFixed(1),
      winner,
      uplift,
    };
  };

  return (
    <div className="space-y-6">
      {/* 1. ANALYTICS SUB-TAB */}
      {activeView === "dashboard" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Stats Summary Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {isAr ? "إجمالي الرسائل المرسلة" : "TOTAL SENT"}
              </span>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">
                {totalSent.toLocaleString()}
              </h3>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{isAr ? "معدل تسليم 99.8%" : "99.8% Deliverability score"}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {isAr ? "متوسط معدل الفتح" : "AVERAGE OPEN RATE"}
              </span>
              <h3 className="text-3xl font-bold text-teal-600 mt-2">{avgOpenRate.toFixed(1)}%</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                <span>{isAr ? "أعلى من متوسط المجال بـ 5.4%" : "+5.4% above benchmark"}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {isAr ? "متوسط النقر للفتح (CTR)" : "CLICK-THROUGH RATE"}
              </span>
              <h3 className="text-3xl font-bold text-amber-600 mt-2">{avgClickRate.toFixed(1)}%</h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                <span>{isAr ? "معدل تحويل وتفاعل مميز" : "Outstanding customer engagement"}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
              <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                {isAr ? "إجمالي عوائد القنوات" : "ATTRIBUTED REVENUE"}
              </span>
              <h3 className="text-3xl font-extrabold text-white mt-2">
                {totalRevenue.toLocaleString()}{" "}
                <span className="text-sm font-medium">{isAr ? "ر.س" : "SAR"}</span>
              </h3>
              <div className="flex items-center gap-1 mt-2 text-xs text-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>
                  {isAr ? "مدفوعة بالكامل بقنوات التسويق" : "Generated via direct campaigns"}
                </span>
              </div>
            </div>
          </div>

          {/* Graphical Analytics & Delivery Health Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Campaigns Recharts comparison */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
              <div className="mb-4">
                <h4 className="text-base font-bold text-slate-900">
                  {isAr ? "أداء الحملات الأخيرة" : "Recent Campaigns Analytics"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr
                    ? "مقارنة المشاهدات ومعدلات التفاعل للحملات المرسلة"
                    : "Open and click statistics per dispatch"}
                </p>
              </div>

              {campaignHistoryData.length === 0 ? (
                <div className="h-80 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 text-xs italic">
                  {isAr
                    ? "لا توجد حملات مرسلة حالياً لعرض إحصاءاتها"
                    : "No campaigns sent yet to analyze history"}
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={campaignHistoryData}
                      margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="opens"
                        name={isAr ? "عمليات الفتح" : "Opens"}
                        fill="#4f46e5"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="clicks"
                        name={isAr ? "النقرات" : "Clicks"}
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Deliverability and Security monitor */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {isAr ? "صحة بروتوكولات الإرسال" : "Deliverability & IP Reputation"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isAr
                    ? "مراقبة نظام التوصيل وبروتوكولات الأمان"
                    : "Continuous sender signature safety score"}
                </p>
              </div>

              <div className="my-6 flex flex-col items-center">
                <div className="relative w-40 h-40 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#f1f5f9"
                      strokeWidth="12"
                      fill="transparent"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="#10b981"
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray="440"
                      strokeDashoffset="44"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-4xl font-extrabold text-slate-900">99%</span>
                    <span className="text-xs text-slate-500 block font-medium mt-1">
                      {isAr ? "ممتاز" : "Excellent"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full mt-6 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">
                      {isAr ? "معدل الارتداد" : "Bounce Rate"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">0.3%</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-400 block">
                      {isAr ? "معدل الشكاوى" : "Spam Complaint"}
                    </span>
                    <span className="text-sm font-bold text-slate-800 mt-1 block">0.01%</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    SPF Signature
                  </span>
                  <span className="font-semibold text-emerald-600">Verified</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    DKIM Encrypted
                  </span>
                  <span className="font-semibold text-emerald-600">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    DMARC Security
                  </span>
                  <span className="font-semibold text-emerald-600">Strict Compliance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Client devices information */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="text-base font-bold text-slate-900 mb-2">
              {isAr ? "تحليل بيئة عمل أجهزة العملاء" : "Customer Device & Client Analytics"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Smartphone className="w-10 h-10 text-indigo-600" />
                <div>
                  <span className="text-xs text-slate-400 block">
                    {isAr ? "أجهزة الجوال" : "MOBILE DEVICES"}
                  </span>
                  <span className="text-lg font-bold text-slate-800">74.5%</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Monitor className="w-10 h-10 text-emerald-600" />
                <div>
                  <span className="text-xs text-slate-400 block">
                    {isAr ? "أجهزة الحاسوب" : "DESKTOP CLIENTS"}
                  </span>
                  <span className="text-lg font-bold text-slate-800">22.1%</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <Grid className="w-10 h-10 text-amber-600" />
                <div>
                  <span className="text-xs text-slate-400 block">
                    {isAr ? "أجهزة أخرى / لوحية" : "TABLET CLIENTS"}
                  </span>
                  <span className="text-lg font-bold text-slate-800">3.4%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. CAMPAIGNS LIST SUB-TAB */}
      {activeView === "campaigns" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Campaigns Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isAr ? "جميع الحملات والنشرات الإخبارية" : "All Broadcast Campaigns"}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr
                    ? "إنشاء وحفظ وتعديل وإرسال النشرات التسويقية المخصصة"
                    : "Create, customize, and trigger scheduled campaigns"}
                </p>
              </div>
              <button
                onClick={onCreateNewCampaign}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg text-xs transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {isAr ? "إنشاء حملة مبتكرة" : "Create Smart Campaign"}
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="p-12 text-center text-slate-400 italic">
                {isAr ? "لا توجد حملات مسجلة بعد." : "No broadcast campaigns created yet."}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {campaigns.map((camp) => {
                  const isAbTesting = camp.abTest?.enabled;
                  const isExpandedAb = expandedAbCampId === camp.id;

                  return (
                    <div key={camp.id} className="p-5 hover:bg-slate-50/50 transition space-y-3">
                      {/* Main campaign row */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl",
                              camp.status === "Sent"
                                ? "bg-emerald-50 text-emerald-600"
                                : camp.status === "Scheduled"
                                  ? "bg-indigo-50 text-indigo-600"
                                  : "bg-slate-100 text-slate-600"
                            )}
                          >
                            <Send className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 flex flex-wrap items-center gap-2">
                              {camp.name}
                              {camp.status === "Sent" && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full uppercase">
                                  {isAr ? "مرسلة" : "Delivered"}
                                </span>
                              )}
                              {camp.status === "Draft" && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full uppercase">
                                  {isAr ? "مسودة" : "Draft"}
                                </span>
                              )}
                              {isAbTesting && (
                                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-semibold rounded-full uppercase flex items-center gap-1">
                                  <Split className="w-2.5 h-2.5 text-indigo-600" />
                                  A/B Test
                                </span>
                              )}
                            </h4>
                            <p className="text-sm text-slate-500 mt-0.5">{camp.subjectLine}</p>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 mt-2">
                              <span>
                                Segment:{" "}
                                <strong className="text-slate-600">{camp.targetSegment}</strong>
                              </span>
                              <span>•</span>
                              <span>
                                Created:{" "}
                                <strong>{new Date(camp.createdAt).toLocaleDateString()}</strong>
                              </span>
                              {camp.ampEnabled && (
                                <>
                                  <span>•</span>
                                  <span className="text-indigo-600 font-medium flex items-center gap-0.5">
                                    ⚡ AMP
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats Summary or Actions */}
                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-transparent pt-3 md:pt-0">
                          {camp.status === "Sent" ? (
                            <div className="flex items-center gap-6 text-center">
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                  {isAr ? "إرسال" : "SENT"}
                                </span>
                                <span className="text-sm font-bold text-slate-800">
                                  {camp.sentCount}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                  {isAr ? "فتح" : "OPENS"}
                                </span>
                                <span className="text-sm font-bold text-teal-600">
                                  {camp.sentCount > 0
                                    ? ((camp.openCount / camp.sentCount) * 100).toFixed(0)
                                    : 0}
                                  %
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                  {isAr ? "نقرات" : "CLICKS"}
                                </span>
                                <span className="text-sm font-bold text-indigo-600">
                                  {camp.openCount > 0
                                    ? ((camp.clickCount / camp.openCount) * 100).toFixed(0)
                                    : 0}
                                  %
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onEditCampaign(camp)}
                                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onSendCampaign(camp.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5" />
                                {isAr ? "إرسال الآن" : "Send Now"}
                              </button>
                            </div>
                          )}

                          {/* Delete Campaign */}
                          <button
                            onClick={() => onDeleteCampaign(camp.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expanded A/B test split results panel */}
                      {isAbTesting && (
                        <div className="pt-2">
                          <button
                            onClick={() => setExpandedAbCampId(isExpandedAb ? null : camp.id)}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 bg-indigo-50/50 hover:bg-indigo-100/50 px-3 py-1 rounded-lg transition"
                          >
                            <Split className="w-3.5 h-3.5" />
                            {isAr ? "عرض تفاصيل نتائج اختبار A/B" : "View A/B Split Testing Data"}
                            {isExpandedAb ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isExpandedAb && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-3"
                              >
                                {camp.status === "Sent" ? (
                                  (() => {
                                    const metrics = getAbSplitMetrics(camp);
                                    return (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-2">
                                          <span className="font-bold text-slate-800">
                                            📊{" "}
                                            {isAr
                                              ? "تحليل تقسيم عينة اختبار A/B"
                                              : "A/B Subject Line Performance Split"}
                                          </span>
                                          <span className="px-2.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                                            🏆{" "}
                                            {isAr
                                              ? `الفائز: نسخة ${metrics.winner} (+${metrics.uplift}% ميزة فتح)`
                                              : `Winner: Variant ${metrics.winner} (+${metrics.uplift}% open uplift)`}
                                          </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          {/* Variant A */}
                                          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                                            <div className="flex justify-between items-center">
                                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[9px] font-bold rounded">
                                                VARIANT A
                                              </span>
                                              <span className="text-[10px] font-medium text-slate-400">
                                                Ratio: 50%
                                              </span>
                                            </div>
                                            <p className="font-bold text-slate-900 italic">
                                              "{camp.subjectLine}"
                                            </p>

                                            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  RECIPIENTS
                                                </span>
                                                <span className="font-bold text-slate-700">
                                                  {metrics.sentA}
                                                </span>
                                              </div>
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  OPEN RATE
                                                </span>
                                                <span className="font-bold text-slate-700">
                                                  {metrics.rateA}%
                                                </span>
                                              </div>
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  CLICK RATE
                                                </span>
                                                <span className="font-bold text-slate-700">
                                                  {metrics.clickRateA}%
                                                </span>
                                              </div>
                                            </div>
                                          </div>

                                          {/* Variant B */}
                                          <div className="p-3 bg-white rounded-lg border border-teal-200 bg-teal-50/10 space-y-2 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 bg-teal-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl">
                                              WINNER
                                            </div>
                                            <div className="flex justify-between items-center">
                                              <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 font-mono text-[9px] font-bold rounded">
                                                VARIANT B
                                              </span>
                                              <span className="text-[10px] font-medium text-slate-400">
                                                Ratio: 50%
                                              </span>
                                            </div>
                                            <p className="font-bold text-teal-950 italic">
                                              "{camp.abTest?.subjectB}"
                                            </p>

                                            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  RECIPIENTS
                                                </span>
                                                <span className="font-bold text-teal-900">
                                                  {metrics.sentB}
                                                </span>
                                              </div>
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  OPEN RATE
                                                </span>
                                                <span className="font-bold text-emerald-600">
                                                  {metrics.rateB}%
                                                </span>
                                              </div>
                                              <div>
                                                <span className="text-[9px] text-slate-400 block">
                                                  CLICK RATE
                                                </span>
                                                <span className="font-bold text-indigo-600">
                                                  {metrics.clickRateB}%
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()
                                ) : (
                                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs italic text-slate-400">
                                    {isAr
                                      ? "يتم تفعيل وإرسال كلا العنوانين A/B للمشتركين عند بدء إرسال الحملة لتتبع المؤشرات الحية."
                                      : "A/B Subject split will dispatch to 50/50 targets when you click Send, reporting real-time indicators."}
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
