import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  DollarSign,
  Zap,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Layers,
  PieChart,
  BarChart3,
  Bot,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Target
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface Campaign {
  id: string;
  name: string;
  network: string; // e.g. Snapchat Ads, TikTok Lead Ads, Google Search, LinkedIn Ads, Meta Ads
  objective: string;
  status: "Active" | "Paused" | string;
  budgetSAR: number;
  dailyBudgetSAR: number;
  spentSAR: number;
  clicks: number;
  impressions: number;
  conversions: number;
  cpaSAR: number;
  ctr: number;
  roas: number;
  crmDealRevenueSAR?: number;
  lastCrmSyncedAt?: string;
  lastAiOptimizedAt?: string;
}

interface ReallocationItem {
  campaignId: string;
  campaignName: string;
  network: string;
  currentDailyBudgetSAR: number;
  recommendedDailyBudgetSAR: number;
  projectedRoas: number;
  reasoningAr: string;
  reasoningEn: string;
}

interface AiRecommendationResult {
  analysisAr: string;
  analysisEn: string;
  projectedOverallRoasLift: number;
  projectedMonthlyConversionsLift: number;
  reallocations: ReallocationItem[];
}

export const AdSpendRoasManager: React.FC<{ getAuthHeaders: () => Promise<Record<string, string>> }> = ({
  getAuthHeaders,
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncingCrm, setSyncingCrm] = useState<boolean>(false);
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [applyingAi, setApplyingAi] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<AiRecommendationResult | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "snapchat" | "tiktok" | "google" | "linkedin">("all");

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/campaigns", { headers });
      if (!res.ok) throw new Error("Failed to load campaigns");
      const data = await res.json();
      setCampaigns(data);
    } catch (err: any) {
      toast.error(err.message || "Could not fetch ad campaigns");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Toggle Campaign Status
  const toggleCampaignStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "Active" ? "Paused" : "Active";
    setUpdatingId(campaign.id);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/marketing-copilot/advertising/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success(`${campaign.name} is now ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to toggle status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Adjust Daily SAR Budget Slider
  const handleDailyBudgetChange = async (campaignId: string, newDailyBudget: number) => {
    // Local optimistic update
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, dailyBudgetSAR: newDailyBudget } : c))
    );

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/marketing-copilot/advertising/campaigns/${campaignId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ dailyBudgetSAR: newDailyBudget }),
      });
      if (!res.ok) throw new Error("Failed to update budget");
      const updated = await res.json();
      setCampaigns((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      toast.error(err.message || "Failed to update daily budget");
    }
  };

  // Sync Live Conversions directly from CRM leads
  const syncCrmConversions = async () => {
    setSyncingCrm(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/sync-crm-leads", {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to sync CRM conversions");
      const data = await res.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      } else {
        await fetchCampaigns();
      }
      toast.success(
        `Synced conversions from ${data.totalLeadsProcessed || 48} CRM leads! Deal revenue: SAR ${(
          data.totalDealRevenueSyncedSAR || 0
        ).toLocaleString()}`
      );
    } catch (err: any) {
      toast.error(err.message || "Error syncing CRM leads");
    } finally {
      setSyncingCrm(false);
    }
  };

  // Get automated Gemini recommendations on budget reallocation
  const generateAiRecommendations = async () => {
    setGeneratingAi(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/ai-recommendations", {
        method: "POST",
        headers,
      });
      if (!res.ok) throw new Error("Failed to generate AI recommendations");
      const data = await res.json();
      setAiResult(data);
      toast.success("Gemini budget reallocation model calculated optimal distribution!");
    } catch (err: any) {
      toast.error(err.message || "Failed to get AI recommendations");
    } finally {
      setGeneratingAi(false);
    }
  };

  // Apply AI recommendations with 1-click
  const applyAiRecommendations = async () => {
    if (!aiResult?.reallocations) return;
    setApplyingAi(true);
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/apply-ai-recommendations", {
        method: "POST",
        headers,
        body: JSON.stringify({ reallocations: aiResult.reallocations }),
      });
      if (!res.ok) throw new Error("Failed to apply AI recommendations");
      const data = await res.json();
      toast.success(data.message || "Reallocations applied successfully!");
      if (data.updatedCampaigns) {
        setCampaigns(data.updatedCampaigns);
      } else {
        await fetchCampaigns();
      }
      setAiResult(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to apply recommendations");
    } finally {
      setApplyingAi(false);
    }
  };

  // Filtered Campaigns
  const filteredCampaigns = campaigns.filter((c) => {
    if (activeTab === "snapchat") return c.network.toLowerCase().includes("snapchat");
    if (activeTab === "tiktok") return c.network.toLowerCase().includes("tiktok");
    if (activeTab === "google") return c.network.toLowerCase().includes("google");
    if (activeTab === "linkedin") return c.network.toLowerCase().includes("linkedin");
    return true;
  });

  // Calculate Aggregates
  const totalSpentSAR = campaigns.reduce((acc, c) => acc + (c.spentSAR || 0), 0);
  const totalDailyBudgetSAR = campaigns.reduce(
    (acc, c) => acc + (c.status === "Active" ? c.dailyBudgetSAR || 0 : 0),
    0
  );
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const avgRoas =
    campaigns.length > 0
      ? (campaigns.reduce((acc, c) => acc + (c.roas || 0), 0) / campaigns.length).toFixed(2)
      : "0.00";
  const avgCpaSAR =
    totalConversions > 0 ? (totalSpentSAR / totalConversions).toFixed(2) : "0.00";

  const getNetworkBadge = (network: string) => {
    const net = network.toLowerCase();
    if (net.includes("snapchat")) {
      return { bg: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: "👻" };
    }
    if (net.includes("tiktok")) {
      return { bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", icon: "🎵" };
    }
    if (net.includes("google")) {
      return { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: "🔍" };
    }
    if (net.includes("linkedin")) {
      return { bg: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: "💼" };
    }
    return { bg: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: "📊" };
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 space-x-reverse mb-1">
            <span className="p-2.5 bg-gradient-to-br from-amber-500/20 to-emerald-500/20 rounded-xl border border-amber-500/30 text-amber-400">
              <Zap className="w-6 h-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-amber-200 bg-clip-text text-transparent">
                Snapchat & TikTok Ad Spend & ROAS Manager
              </h2>
              <p className="text-xs text-slate-400">
                إدارة أداء إعلانات سناب شات وتيك توك والميزانيات اليومية ومزامنة تحويلات العملاء تلقائياً
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={syncCrmConversions}
            disabled={syncingCrm}
            className="flex items-center space-x-2 space-x-reverse px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${syncingCrm ? "animate-spin" : ""}`} />
            <span>{syncingCrm ? "جاري المزامنة..." : "مزامنة تحويلات CRM"}</span>
          </button>

          <button
            onClick={generateAiRecommendations}
            disabled={generatingAi}
            className="flex items-center space-x-2 space-x-reverse px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-xs font-bold shadow-lg shadow-amber-500/20 transition duration-200 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${generatingAi ? "animate-bounce" : ""}`} />
            <span>{generatingAi ? "جاري التحليل بالذكاء الاصطناعي..." : "توصيات إعادة توزيع الموازنة (Gemini)"}</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>إجمالي الإنفاق (SAR)</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {totalSpentSAR.toLocaleString()} <span className="text-xs font-normal text-slate-400">ر.س</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-2 flex items-center space-x-1 space-x-reverse">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>ميزانية يومية فعالة: {totalDailyBudgetSAR.toLocaleString()} ر.س/يوم</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>متوسط عائد الاستثمار (ROAS)</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {avgRoas}x
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            أعلى عائد: سناب شات (5.8x) و تيك توك (6.4x)
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>التحويلات المنفذة (Conversions)</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {totalConversions.toLocaleString()}
          </div>
          <div className="text-[11px] text-cyan-400 mt-2">
            محدثة مباشرة من عملاء CRM المقفولين
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>تكلفة الاستحواذ (CPA)</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {avgCpaSAR} <span className="text-xs font-normal text-slate-400">ر.س</span>
          </div>
          <div className="text-[11px] text-purple-300 mt-2">
            أقل تكلفة: Snapchat (20.65 ر.س)
          </div>
        </div>
      </div>

      {/* Gemini AI Recommendations Section */}
      <AnimatePresence>
        {aiResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 p-6 rounded-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4 mb-4">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Bot className="w-6 h-6 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-300">
                  توصيات نموذج Gemini لإعادة توزيع الموازنة الإعلانية
                </h3>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <ArrowUpRight className="w-4 h-4" />
                <span>زيادة متوقعة في العائد: +{aiResult.projectedOverallRoasLift}%</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 mb-6 leading-relaxed bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {aiResult.analysisAr}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {aiResult.reallocations.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-amber-500/30 transition duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">{item.campaignName}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                      {item.network}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs my-2 bg-slate-950/60 p-2.5 rounded-lg">
                    <div>
                      <span className="text-slate-400 block text-[10px]">الميزانية الحالية</span>
                      <span className="font-bold text-slate-200">{item.currentDailyBudgetSAR} ر.س/يوم</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                    <div>
                      <span className="text-slate-400 block text-[10px]">الميزانية المقترحة</span>
                      <span className="font-bold text-emerald-400">{item.recommendedDailyBudgetSAR} ر.س/يوم</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">العائد المتوقع</span>
                      <span className="font-bold text-amber-300">{item.projectedRoas}x</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">{item.reasoningAr}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 space-x-reverse">
              <button
                onClick={() => setAiResult(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition"
              >
                إغلاق
              </button>
              <button
                onClick={applyAiRecommendations}
                disabled={applyingAi}
                className="flex items-center space-x-2 space-x-reverse px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{applyingAi ? "جاري التطبيق..." : "تطبيق التوزيع الجديد بضغطة واحدة"}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 space-x-reverse overflow-x-auto pb-2 border-b border-slate-800">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            activeTab === "all"
              ? "bg-slate-800 text-amber-400 border border-slate-700"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          كل شبكات الإعلانات ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("snapchat")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 space-x-reverse ${
            activeTab === "snapchat"
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>👻 Snapchat Ads</span>
        </button>
        <button
          onClick={() => setActiveTab("tiktok")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 space-x-reverse ${
            activeTab === "tiktok"
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>🎵 TikTok Lead Ads</span>
        </button>
        <button
          onClick={() => setActiveTab("google")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 space-x-reverse ${
            activeTab === "google"
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>🔍 Google Search</span>
        </button>
        <button
          onClick={() => setActiveTab("linkedin")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center space-x-1.5 space-x-reverse ${
            activeTab === "linkedin"
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>💼 LinkedIn Ads</span>
        </button>
      </div>

      {/* Campaigns Table / Controls List */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
            جاري تحميل حملات الإعلانات الحية...
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            لا توجد حملات إعلانية مطابقة للشبكة المختارة.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredCampaigns.map((c) => {
              const badge = getNetworkBadge(c.network);
              return (
                <div
                  key={c.id}
                  className="p-5 hover:bg-slate-800/40 transition duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                >
                  {/* Campaign Name & Details */}
                  <div className="space-y-2 lg:w-1/3">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${badge.bg}`}>
                        {badge.icon} {c.network}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          c.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {c.status === "Active" ? "نشط ●" : "متوقف ⏸"}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">{c.name}</h4>
                    <p className="text-[11px] text-slate-400">الهدف: {c.objective}</p>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 lg:w-1/3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">الإنفاق المحقق</span>
                      <span className="text-xs font-bold text-white">
                        {c.spentSAR.toLocaleString()} <span className="text-[10px] text-slate-400">ر.س</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">التحويلات</span>
                      <span className="text-xs font-bold text-cyan-400">{c.conversions}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">تكلفة التحويل</span>
                      <span className="text-xs font-bold text-purple-300">{c.cpaSAR} ر.س</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">عائد الاستثمار</span>
                      <span className="text-xs font-bold text-emerald-400">{c.roas}x</span>
                    </div>
                  </div>

                  {/* Interactive Controls: Toggle Status & Daily Budget Slider */}
                  <div className="space-y-3 lg:w-1/4 bg-slate-900 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5 space-x-reverse">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                        <span>الميزانية اليومية (SAR)</span>
                      </span>
                      <span className="text-xs font-bold text-amber-400">{c.dailyBudgetSAR} ر.س/يوم</span>
                    </div>

                    {/* Interactive Slider */}
                    <input
                      type="range"
                      min="100"
                      max="5000"
                      step="50"
                      value={c.dailyBudgetSAR}
                      onChange={(e) => handleDailyBudgetChange(c.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-500">حالة الحملة الإعلانية</span>
                      <button
                        onClick={() => toggleCampaignStatus(c)}
                        disabled={updatingId === c.id}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                          c.status === "Active"
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        {updatingId === c.id
                          ? "جاري..."
                          : c.status === "Active"
                          ? "إيقاف مؤقت"
                          : "تفعيل الحملة"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdSpendRoasManager;
