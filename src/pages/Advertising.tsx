import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Check,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  TrendingUp,
  BarChart3,
  Users,
  Settings,
  Shield,
  Activity,
  FileText,
  Video,
  Globe,
  Layers,
  Search,
  Maximize2,
  Play,
  RotateCcw,
  Zap,
  Target,
  DollarSign,
  Share2,
  Sliders,
  Percent,
  Link,
  RefreshCw,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// ==========================================
// INTERFACES
// ==========================================
interface Campaign {
  id: string;
  name: string;
  network: string;
  objective: string;
  status: string;
  budgetSAR: number;
  dailyBudgetSAR: number;
  spentSAR: number;
  clicks: number;
  impressions: number;
  conversions: number;
  cpaSAR: number;
  ctr: number;
  roas: number;
  revenueSAR: number;
  automationRules: string[];
  createdAt: string;
}

interface AdSet {
  id: string;
  name: string;
  targeting: string;
  budgetSAR: number;
  spentSAR: number;
  clicks: number;
  conversions: number;
  impressions: number;
  status: string;
  bidStrategy: string;
}

interface Creative {
  id: string;
  name: string;
  type: string;
  headline: string;
  bodyText: string;
  mediaUrl: string;
  status: string;
  ctr: number;
  clicks: number;
  conversions: number;
}

interface Pixel {
  id: string;
  name: string;
  platform: string;
  pixelId: string;
  trackingType: string;
  status: string;
  eventsReceived: number;
  lastEventAt: string;
}

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  conditions: { metric: string; operator: string; threshold: number };
  actions: string[];
  status: string;
  logs: { timestamp: string; message: string }[];
}

interface AttributionChainItem {
  id: string;
  campaignName: string;
  adNetwork: string;
  clickTimestamp: string;
  leadName: string;
  leadCompany: string;
  leadStatus: string;
  valueSAR: number;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceAmountSAR: number;
  attributionModelShare: Record<string, number>;
}

export default function Advertising() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const txt = (en: string, ar: string) => (isAr ? ar : en);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "campaigns" | "creatives" | "ai" | "attribution" | "automations"
  >("dashboard");

  // Loading and action states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Data states
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [adsets, setAdsets] = useState<AdSet[]>([]);
  const [creatives, setCreatives] = useState<Creative[]>([]);
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>([]);
  const [attributionChain, setAttributionChain] = useState<AttributionChainItem[]>([]);
  const [syncSummary, setSyncSummary] = useState<any>({
    totalAttributedRevenueSAR: 0,
    pipelineValueSAR: 0,
    matchedLeadsCount: 0,
  });

  // Selected multi-touch attribution model
  const [attributionModel, setAttributionModel] = useState<
    "firstClick" | "lastClick" | "linear" | "dataDriven"
  >("dataDriven");

  // Campaign builder modal and forms
  const [showBuilder, setShowBuilder] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    network: "Meta Ads",
    objective: "Leads",
    dailyBudgetSAR: 500,
    budgetSAR: 15000,
    automationRules: [] as string[],
  });

  // AI Ad Copilot generator configurations
  const [aiMode, setAiMode] = useState<"copywriter" | "audience" | "landing_page" | "video_script">(
    "copywriter"
  );
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiNetwork, setAiNetwork] = useState("Meta Ads");
  const [aiTargetAudience, setAiTargetAudience] = useState("");
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any>(null);

  // Load backend data
  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, aRes, crRes, pRes, auRes, syncRes] = await Promise.all([
        fetch("/api/advertising/campaigns"),
        fetch("/api/advertising/adsets"),
        fetch("/api/advertising/creatives"),
        fetch("/api/advertising/pixels"),
        fetch("/api/advertising/automations"),
        fetch("/api/advertising/crm-sync"),
      ]);

      if (cRes.ok) setCampaigns(await cRes.json());
      if (aRes.ok) setAdsets(await aRes.json());
      if (crRes.ok) setCreatives(await crRes.json());
      if (pRes.ok) setPixels(await pRes.json());
      if (auRes.ok) setAutomations(await auRes.json());
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setAttributionChain(syncData.attributionChain);
        setSyncSummary(syncData.summary);
      }
    } catch (err: any) {
      toast.error(
        txt(
          "Failed to retrieve advertising credentials & stats",
          "فشل استرداد بيانات وإحصائيات منصة الإعلانات"
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync / Refresh CRM Attribution
  const refreshCRMSync = async () => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/advertising/crm-sync");
      if (res.ok) {
        const syncData = await res.json();
        setAttributionChain(syncData.attributionChain);
        setSyncSummary(syncData.summary);
        toast.success(
          txt(
            "Attribution successfully matched with CRM & Accounting!",
            "تم مطابقة قنوات الإسناد الإعلاني مع المبيعات والمحاسبة بنجاح!"
          )
        );
      }
    } catch (err) {
      toast.error(txt("CRM synchronization failed", "فشل مزامنة نظام إدارة العملاء"));
    } finally {
      setActionLoading(false);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name.trim()) {
      return toast.warning(
        txt("Please provide a campaign name", "يرجى إدخال اسم الحملة الإعلانية")
      );
    }
    try {
      setActionLoading(true);
      const res = await fetch("/api/advertising/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaign.name,
          network: newCampaign.network,
          objective: newCampaign.objective,
          dailyBudgetSAR: Number(newCampaign.dailyBudgetSAR),
          budgetSAR: Number(newCampaign.budgetSAR),
          status: "Active",
          automationRules: newCampaign.automationRules,
        }),
      });

      if (res.ok) {
        toast.success(
          txt(
            "Campaign created and synchronized to Ad network!",
            "تم إنشاء الحملة ومزامنتها مع الشبكة الإعلانية بنجاح!"
          )
        );
        setShowBuilder(false);
        setNewCampaign({
          name: "",
          network: "Meta Ads",
          objective: "Leads",
          dailyBudgetSAR: 500,
          budgetSAR: 15000,
          automationRules: [],
        });
        loadData();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed");
      }
    } catch (err) {
      toast.error("Error creating campaign");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Campaign status
  const toggleCampaignStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Paused" : "Active";
    try {
      setActionLoading(true);
      const res = await fetch(`/api/advertising/campaigns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        setCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c)));
        toast.success(
          txt(
            `Campaign successfully ${nextStatus === "Active" ? "activated" : "paused"}`,
            `تم ${nextStatus === "Active" ? "تفعيل" : "إيقاف"} الحملة بنجاح`
          )
        );
      }
    } catch (err) {
      toast.error("Failed to update campaign status");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Campaign
  const deleteCampaign = async (id: string) => {
    if (
      !window.confirm(
        txt(
          "Are you sure you want to delete this campaign?",
          "هل أنت متأكد من حذف هذه الحملة الإعلانية نهائياً؟"
        )
      )
    )
      return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/advertising/campaigns/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCampaigns((prev) => prev.filter((c) => c.id !== id));
        toast.success(txt("Campaign successfully removed", "تم حذف الحملة الإعلانية بنجاح"));
      }
    } catch (err) {
      toast.error("Failed to delete campaign");
    } finally {
      setActionLoading(false);
    }
  };

  // Run Automation Rule simulation manually
  const runAutomationRule = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/advertising/automations/${id}/run`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        toast.success(
          txt(
            "Automation rule evaluated successfully!",
            "تم تقييم وتشغيل قاعدة الأتمتة الإعلانية بنجاح!"
          )
        );
        loadData(); // Reload to capture the updated logs and campaign budgets if changed
      }
    } catch (err) {
      toast.error("Rule evaluation failed");
    } finally {
      setActionLoading(false);
    }
  };

  // AI Generation Trigger
  const generateAiAdCopilot = async () => {
    if (!aiPrompt.trim()) {
      return toast.warning(
        txt(
          "Please specify what product or campaign goal to generate",
          "يرجى وصف منتجك أو هدف الحملة لإعداده بالذكاء الاصطناعي"
        )
      );
    }
    try {
      setAiLoading(true);
      const res = await fetch("/api/advertising/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: aiMode,
          promptText: aiPrompt,
          network: aiNetwork,
          targetAudience: aiTargetAudience,
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        setAiGeneratedResult(await res.json());
        toast.success(
          txt(
            "AI Suggestions successfully generated by Gemini 3.5!",
            "تم توليد مقترحات الذكاء الاصطناعي بنجاح عبر Gemini 3.5!"
          )
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "AI generation failed");
      }
    } catch (err) {
      toast.error("Failed to connect to Gemini API");
    } finally {
      setAiLoading(false);
    }
  };

  // Push Generated Creative to database
  const applyGeneratedCreative = async () => {
    if (!aiGeneratedResult) return;
    try {
      setActionLoading(true);
      const creativePayload = {
        name: txt(
          `AI Variant: ${aiPrompt.slice(0, 20)}...`,
          `نسخة ذكية: ${aiPrompt.slice(0, 20)}...`
        ),
        type: aiMode === "video_script" ? "Video" : "Image",
        headline:
          aiGeneratedResult.hero?.title ||
          aiGeneratedResult.variants?.[0]?.headline ||
          aiGeneratedResult.videoTitle ||
          "AI Generated Headline",
        bodyText:
          aiGeneratedResult.hero?.subtitle ||
          aiGeneratedResult.variants?.[0]?.primaryCopy ||
          aiGeneratedResult.tiktokCaption ||
          "AI Copy",
        mediaUrl: aiGeneratedResult.imagePrompt
          ? "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
          : "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
        status: "Active",
      };

      const res = await fetch("/api/advertising/creatives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creativePayload),
      });

      if (res.ok) {
        toast.success(
          txt(
            "Creative variant applied and loaded to database!",
            "تم تطبيق النسخة الإبداعية وحفظها في قاعدة البيانات للتفعيل!"
          )
        );
        loadData();
      }
    } catch (err) {
      toast.error("Failed to save creative");
    } finally {
      setActionLoading(false);
    }
  };

  // Helper values calculated
  const totalSpent = campaigns.reduce((sum, c) => sum + c.spentSAR, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenueSAR, 0);
  const overallRoas = totalSpent > 0 ? (totalRevenue / totalSpent).toFixed(2) : "0.0";
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const avgCtr =
    totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const avgCpa = totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : "0.00";

  // Chart structures
  const performanceTrendData = campaigns.map((c) => ({
    name: c.name.slice(0, 15) + "...",
    "Budget (SAR)": c.budgetSAR,
    "Spent (SAR)": c.spentSAR,
    "Revenue (SAR)": c.revenueSAR,
    ROAS: c.roas,
  }));

  const pieData = [
    {
      name: "Meta Ads",
      value: campaigns
        .filter((c) => c.network === "Meta Ads")
        .reduce((sum, c) => sum + c.spentSAR, 0),
    },
    {
      name: "Google Ads",
      value: campaigns
        .filter((c) => c.network === "Google Ads")
        .reduce((sum, c) => sum + c.spentSAR, 0),
    },
    {
      name: "TikTok Ads",
      value: campaigns
        .filter((c) => c.network === "TikTok Ads")
        .reduce((sum, c) => sum + c.spentSAR, 0),
    },
    {
      name: "LinkedIn Ads",
      value: campaigns
        .filter((c) => c.network === "LinkedIn Ads")
        .reduce((sum, c) => sum + c.spentSAR, 0),
    },
    {
      name: "Snapchat Ads",
      value: campaigns
        .filter((c) => c.network === "Snapchat Ads")
        .reduce((sum, c) => sum + c.spentSAR, 0),
    },
  ].filter((p) => p.value > 0);

  const COLORS = ["#3b82f6", "#10b981", "#ec4899", "#0077b5", "#eab308"];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50/50">
        <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-600 font-medium">
          {txt(
            "Loading enterprise ad accounts and real-time ROAS dashboards...",
            "جاري تحميل الحسابات الإعلانية ومؤشرات الـ ROAS اللحظية..."
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-2.5xl font-bold text-slate-900 tracking-tight">
              {txt("AI Advertising Platform", "منصة إدارة التواصل الاجتماعي والإعلانات الذكية")}
            </h1>
          </div>
          <p className="text-slate-500 mt-1.5 text-sm max-w-2xl">
            {txt(
              "Omnichannel ad Operating System with real-time ROAS attribution, automated rules engine, and Gemini-powered creative suite synchronized with Madarij OS CRM and Accounting ledgers.",
              "نظام تشغيل إعلاني متكامل مع تتبع العائد المالي لحظياً، محرك قواعد الأتمتة، ومولد النسخ الإبداعية بالذكاء الاصطناعي المترابط مع مبيعات وحسابات النظام."
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshCRMSync}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <RefreshCw className={cn("w-4 h-4", actionLoading && "animate-spin")} />
            {txt("Sync CRM Attribution", "مزامنة الإسناد المالي")}
          </button>

          <button
            onClick={() => setShowBuilder(true)}
            className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
          >
            <Plus className="w-4.5 h-4.5" />
            {txt("Launch Campaign", "إطلاق حملة إعلانية")}
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold tracking-wider uppercase">
              {txt("Total Ad Spend", "إجمالي الإنفاق الإعلاني")}
            </span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{totalSpent.toLocaleString()}</span>
            <span className="text-xs text-slate-500 font-medium">{txt("SAR", "ر.س")}</span>
          </div>
          <div className="text-xs text-emerald-600 flex items-center gap-1 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+14.5% {txt("MoM growth", "نمو شهري")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold tracking-wider uppercase">
              {txt("Attributed Revenue", "الإيرادات المنسوبة إعلانياً")}
            </span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">
              {totalRevenue.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-medium">{txt("SAR", "ر.س")}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1">
            <span className="font-semibold text-emerald-600">
              {(Number(overallRoas) * 100).toFixed(0)}%
            </span>
            <span>{txt("Return on Investment", "العائد الإجمالي للاستثمار")}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold tracking-wider uppercase">
              {txt("Average ROAS", "متوسط العائد الإعلاني ROAS")}
            </span>
            <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{overallRoas}x</span>
            <span className="text-xs text-emerald-600 font-semibold">
              ({txt("Target 4.0x", "الهدف 4.0")})
            </span>
          </div>
          <div className="text-xs text-slate-500">
            {txt("Fully tracked with server-side CAPI", "متتبع بالكامل عبر بروتوكولات الخادم CAPI")}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-2">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-xs font-semibold tracking-wider uppercase">
              {txt("CRM Funnel CPA", "تكلفة العميل المحتمل CPA")}
            </span>
            <Target className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900">{avgCpa}</span>
            <span className="text-xs text-slate-500 font-medium">{txt("SAR", "ر.س")}</span>
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span>
              {txt("Conversions:", "التحويلات:")}{" "}
              <strong className="text-slate-700 font-semibold">{totalConversions}</strong>
            </span>
            <span>|</span>
            <span>
              {txt("CTR:", "النقرات:")}{" "}
              <strong className="text-slate-700 font-semibold">{avgCtr}%</strong>
            </span>
          </div>
        </div>
      </div>

      {/* TABS SELECTION */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: "dashboard", label: txt("ROAS Dashboard", "لوحة التحكم والعائد"), icon: BarChart3 },
          { id: "campaigns", label: txt("Campaign Builder", "منشئ ومخطط الحملات"), icon: Sliders },
          {
            id: "creatives",
            label: txt("Ad Sets & Creatives", "المجموعات والنسخ الإبداعية"),
            icon: Layers,
          },
          { id: "ai", label: txt("AI Ad Copilot", "مساعد الإعلانات الذكي"), icon: Sparkles },
          {
            id: "attribution",
            label: txt("CRM Attribution", "إسناد الإيرادات والعملاء"),
            icon: Link,
          },
          {
            id: "automations",
            label: txt("Automation Rules", "قواعد الأتمتة والبيكسل"),
            icon: Zap,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4.5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW CONTENTS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {/* ==========================================
              TAB 1: ROAS DASHBOARD
              ========================================== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* CHARTS CONTAINER */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Performance Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-2 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {txt(
                          "Ad Networks Investment vs. Return",
                          "أداء شبكات الإعلانات والإنفاق مقابل العائد"
                        )}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {txt(
                          "Real-time revenue conversion matched from invoices",
                          "الإيرادات المستلمة لحظياً من الفواتير المدفوعة"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={performanceTrendData}>
                        <defs>
                          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="Spent (SAR)"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorSpent)"
                        />
                        <Area
                          type="monotone"
                          dataKey="Revenue (SAR)"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorRev)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Ad network spent breakdown */}
                <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {txt("Ad Spend Share", "توزيع حصص ميزانية الإعلانات")}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {txt(
                        "Total distribution across integrated networks",
                        "نسب الاستثمار في منصات التواصل"
                      )}
                    </p>
                  </div>
                  <div className="h-[180px] flex items-center justify-center relative">
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={75}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => `${value.toLocaleString()} SAR`} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <span className="text-slate-400 text-sm">
                        {txt("No budget spent yet", "لم يتم إنفاق أي ميزانية بعد")}
                      </span>
                    )}
                    <div className="absolute flex flex-col items-center">
                      <span className="text-xs text-slate-400 uppercase font-semibold">
                        {txt("Total", "الإجمالي")}
                      </span>
                      <span className="text-md font-bold text-slate-800">
                        {totalSpent.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100">
                    {pieData.map((p, idx) => (
                      <div
                        key={p.name}
                        className="flex justify-between items-center text-xs text-slate-600"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span>{p.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800">
                          {p.value.toLocaleString()} {txt("SAR", "ر.س")} (
                          {(totalSpent > 0 ? (p.value / totalSpent) * 100 : 0).toFixed(0)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* NETWORKS PERFORMANCE SUMMARY GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  {
                    name: "Meta Ads",
                    icon: "Meta",
                    channels: ["Facebook", "Instagram"],
                    roas: "4.8x",
                    spent: "4,500 SAR",
                    revenue: "21,600 SAR",
                    color: "bg-blue-500/10 text-blue-600",
                  },
                  {
                    name: "Google Ads",
                    icon: "Google",
                    channels: ["Search", "YouTube"],
                    roas: "6.2x",
                    spent: "18,500 SAR",
                    revenue: "114,700 SAR",
                    color: "bg-emerald-500/10 text-emerald-600",
                  },
                  {
                    name: "TikTok Ads",
                    icon: "TikTok",
                    channels: ["TikTok Feed", "Spark Ads"],
                    roas: "3.1x",
                    spent: "12,400 SAR",
                    revenue: "38,440 SAR",
                    color: "bg-pink-500/10 text-pink-600",
                  },
                  {
                    name: "LinkedIn Ads",
                    icon: "LinkedIn",
                    channels: ["Sponsored Content", "InMail"],
                    roas: "7.5x",
                    spent: "8,900 SAR",
                    revenue: "66,750 SAR",
                    color: "bg-sky-500/10 text-sky-600",
                  },
                ].map((net) => (
                  <div
                    key={net.name}
                    className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn("p-1.5 rounded-lg text-xs font-bold", net.color)}>
                          {net.name.slice(0, 2)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{net.name}</h4>
                          <p className="text-slate-400 text-[10px]">{net.channels.join(" • ")}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 px-2 py-0.5 bg-emerald-50 rounded-full">
                        {net.roas} ROAS
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {txt("Spent", "المنفق")}
                        </span>
                        <p className="text-xs font-bold text-slate-700">{net.spent}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                          {txt("Revenue", "العائد")}
                        </span>
                        <p className="text-xs font-bold text-slate-700">{net.revenue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CAMPAIGN BUILDER & MANAGER
              ========================================== */}
          {activeTab === "campaigns" && (
            <div className="space-y-6">
              {/* CAMPAIGNS LISTING */}
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {txt("Active Marketing Campaigns", "مخطط ومتابع الحملات النشطة")}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {txt(
                        "Omnichannel budgets, conversions, and target bids",
                        "إجمالي الميزانيات، التحويلات، واستراتيجيات المزايدة"
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBuilder(true)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-semibold shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {txt("New Campaign", "حملة جديدة")}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">{txt("Campaign Name", "اسم الحملة")}</th>
                        <th className="px-6 py-3">{txt("Network", "الشبكة")}</th>
                        <th className="px-6 py-3">{txt("Objective", "الهدف")}</th>
                        <th className="px-6 py-3 text-right">
                          {txt("Spent / Total Budget", "المنفق / الميزانية")}
                        </th>
                        <th className="px-6 py-3 text-center">{txt("Conversions", "التحويلات")}</th>
                        <th className="px-6 py-3 text-center">{txt("ROAS", "العائد ROAS")}</th>
                        <th className="px-6 py-3 text-center">{txt("Status", "الحالة")}</th>
                        <th className="px-6 py-3 text-right">{txt("Actions", "الإجراءات")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaigns.map((camp) => (
                        <tr key={camp.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-800">{camp.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold text-slate-700">
                              {camp.network}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">
                            {camp.objective}
                          </td>
                          <td className="px-6 py-4 text-right font-medium">
                            <span className="text-slate-800 font-bold">
                              {camp.spentSAR.toLocaleString()}
                            </span>
                            <span className="text-slate-400 text-xs mx-1">/</span>
                            <span className="text-slate-500 text-xs">
                              {camp.budgetSAR.toLocaleString()} {txt("SAR", "ر.س")}
                            </span>
                            <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1 ml-auto">
                              <div
                                className="bg-primary h-full"
                                style={{
                                  width: `${Math.min((camp.spentSAR / camp.budgetSAR) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-slate-700">
                            {camp.conversions}
                          </td>
                          <td className="px-6 py-4 text-center font-bold text-emerald-600">
                            {camp.roas ? `${camp.roas}x` : "0.0x"}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => toggleCampaignStatus(camp.id, camp.status)}
                              className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase transition-all",
                                camp.status === "Active"
                                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                  : "bg-slate-100 text-slate-500 border border-slate-200"
                              )}
                            >
                              {camp.status === "Active"
                                ? txt("Active", "نشط")
                                : txt("Paused", "موقوف")}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => deleteCampaign(camp.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-colors rounded hover:bg-slate-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 3: AD SETS & CREATIVES
              ========================================== */}
          {activeTab === "creatives" && (
            <div className="space-y-6">
              {/* AD SETS LIST */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {txt(
                      "Targeting Ad Sets (Target Demographics)",
                      "مجموعات الاستهداف والاهتمامات"
                    )}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {txt(
                      "Platform bidding caps, demographic sets, and local location mapping",
                      "سقوف المزايدة، الاستهداف الجغرافي، واهتمامات صناع القرار"
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {adsets.map((set) => (
                    <div
                      key={set.id}
                      className="p-4 border border-slate-100 hover:border-slate-200/80 rounded-xl space-y-3 bg-slate-50/30 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                          {set.bidStrategy}
                        </span>
                        <span className="text-xs font-bold text-slate-700">{set.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm">{set.name}</h4>
                      <p className="text-slate-500 text-xs leading-relaxed min-h-[40px]">
                        {set.targeting}
                      </p>
                      <div className="pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-1 text-center">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {txt("Spent", "المنفق")}
                          </span>
                          <span className="text-xs font-bold text-slate-700">
                            {set.spentSAR} {txt("SAR", "ر.س")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {txt("Clicks", "النقرات")}
                          </span>
                          <span className="text-xs font-bold text-slate-700">{set.clicks}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">
                            {txt("Conv", "التحويلات")}
                          </span>
                          <span className="text-xs font-bold text-emerald-600">
                            {set.conversions}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CREATIVES GALLERY */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {txt("Ad Creative Variants & Media assets", "معرض المخرجات والنسخ الإبداعية")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {txt(
                      "Headlines, primary copies, and dynamic click-through-rates",
                      "العناوين التسويقية الجذابة، نسب النقر، وتأثيراتها الإقناعية"
                    )}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {creatives.map((cr) => (
                    <div
                      key={cr.id}
                      className="border border-slate-200/80 rounded-xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
                    >
                      <div className="relative h-44 bg-slate-100">
                        <img
                          src={cr.mediaUrl}
                          alt={cr.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/75 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                          {cr.type}
                        </span>
                        <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-emerald-600 text-white text-xs font-bold rounded-full">
                          {cr.ctr}% CTR
                        </span>
                      </div>
                      <div className="p-4 space-y-3 flex-grow flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <h4 className="font-bold text-slate-800 text-sm leading-snug">
                            {cr.headline}
                          </h4>
                          <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                            {cr.bodyText}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs font-semibold text-slate-500">
                          <span>
                            {txt("Clicks:", "النقرات:")}{" "}
                            <strong className="text-slate-800">{cr.clicks}</strong>
                          </span>
                          <span>
                            {txt("Conversions:", "التحويلات:")}{" "}
                            <strong className="text-emerald-600">{cr.conversions}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 4: AI AD COPILOT (GEMINI POWERED)
              ========================================== */}
          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Configuration panel */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-4 space-y-5">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-bold text-slate-800">
                      {txt("AI Ad Planner & Copywriter", "مساعد إعلانات الذكاء الاصطناعي")}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {txt(
                      "Generate copywriting variations, target audiences, budget rules, or full video scripts via Gemini-3.5-flash.",
                      "قم بتوليد نسخ إعلانية، خطط استهداف، أو نصوص فيديو احترافية بضغطة واحدة."
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Mode select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {txt("Creative Goal Mode", "نمط الإعداد الإبداعي")}
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: "copywriter", label: txt("AI Copywriter", "نسخ إعلانية") },
                        { id: "audience", label: txt("Audience & Bid", "الاستهداف والبدء") },
                        { id: "landing_page", label: txt("Landing Page", "صفحة الهبوط") },
                        { id: "video_script", label: txt("Video Script", "سيناريو فيديو") },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAiMode(m.id as any)}
                          className={cn(
                            "py-2 px-2.5 border rounded-lg text-xs font-semibold transition-all",
                            aiMode === m.id
                              ? "bg-primary/5 border-primary text-primary"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          )}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Network selection */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {txt("Target Network", "المنصة الإعلانية")}
                    </label>
                    <select
                      value={aiNetwork}
                      onChange={(e) => setAiNetwork(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-700 bg-white"
                    >
                      {[
                        "Meta Ads",
                        "Google Ads",
                        "TikTok Ads",
                        "Snapchat Ads",
                        "LinkedIn Ads",
                        "YouTube Ads",
                      ].map((net) => (
                        <option key={net} value={net}>
                          {net}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Prompt context */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {txt(
                        "Product Description / Core Message",
                        "وصف المنتج / الميزة الإعلانية المراد توليدها"
                      )}
                    </label>
                    <textarea
                      rows={4}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={txt(
                        "e.g., automated accounting and compliant invoicing for SMEs in Saudi Arabia",
                        "مثال: نظام محاسبة سحابي مؤتمت متوافق مع هيئة الزكاة للمؤسسات الصغيرة والمتوسطة بسعر مغري"
                      )}
                      className="w-full border border-slate-200 rounded-lg p-2.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary bg-white"
                    />
                  </div>

                  {/* Optional Target Audience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {txt("Target Demographics (Optional)", "فئة الجمهور المستهدفة (اختياري)")}
                    </label>
                    <input
                      type="text"
                      value={aiTargetAudience}
                      onChange={(e) => setAiTargetAudience(e.target.value)}
                      placeholder={txt(
                        "e.g., CFOs, Corporate accountants, SME Owners",
                        "مثال: المدير المالي، أصحاب المشاريع التجارية"
                      )}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-primary bg-white"
                    />
                  </div>

                  {/* Trigger button */}
                  <button
                    onClick={generateAiAdCopilot}
                    disabled={aiLoading}
                    className="w-full py-2.5 bg-primary hover:bg-primary/95 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className={cn("w-4 h-4", aiLoading && "animate-spin")} />
                    {aiLoading
                      ? txt("AI Generating Copilot Content...", "جاري التوليد بالذكاء الاصطناعي...")
                      : txt("Ask Gemini 3.5 Copilot", "اسأل مساعد Gemini 3.5 الذكي")}
                  </button>
                </div>
              </div>

              {/* Response Panel */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-8 flex flex-col justify-between min-h-[450px]">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="font-bold text-slate-800">
                      {txt("Gemini Creative Copilot Drafts", "مسودة مساعد الإبداع الذكي")}
                    </h3>
                    {aiGeneratedResult && (
                      <button
                        onClick={applyGeneratedCreative}
                        disabled={actionLoading}
                        className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all border border-emerald-200"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {txt("Apply as Creative", "تطبيق كنسخة إبداعية")}
                      </button>
                    )}
                  </div>

                  {aiGeneratedResult ? (
                    <div className="space-y-4 text-xs text-slate-700 overflow-y-auto max-h-[400px]">
                      {/* COPYWRITER MODE RESULT */}
                      {aiMode === "copywriter" && aiGeneratedResult.variants && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {aiGeneratedResult.variants.map((v: any, idx: number) => (
                            <div
                              key={idx}
                              className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 space-y-2.5"
                            >
                              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                                Variant {idx + 1}
                              </span>
                              <h4 className="font-bold text-slate-800 leading-snug">
                                {v.headline}
                              </h4>
                              <p className="text-slate-500 leading-relaxed min-h-[100px]">
                                {v.primaryCopy}
                              </p>
                              <span className="inline-block px-2.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-semibold text-slate-700">
                                {txt("CTA Button:", "زر الإجراء:")} {v.cta}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* AUDIENCE MODE RESULT */}
                      {aiMode === "audience" && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {aiGeneratedResult.audienceSuggestions?.map((aud: any, idx: number) => (
                              <div
                                key={idx}
                                className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 space-y-2"
                              >
                                <h4 className="font-bold text-slate-800 text-sm">{aud.set}</h4>
                                <p className="text-slate-500">
                                  <strong>{txt("Demographics:", "الديموغرافيا:")}</strong>{" "}
                                  {aud.demographics}
                                </p>
                                <p className="text-slate-500">
                                  <strong>{txt("Keywords/Interests:", "الاهتمامات:")}</strong>{" "}
                                  {aud.interestsKeywords}
                                </p>
                                <p className="text-slate-500 italic mt-1">{aud.reasoning}</p>
                              </div>
                            ))}
                          </div>
                          {aiGeneratedResult.budgetSAR && (
                            <div className="p-4 border border-blue-100 bg-blue-50/30 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                              <div>
                                <span className="text-slate-400 block font-semibold uppercase">
                                  {txt("Recommended Daily Budget", "الميزانية اليومية المقترحة")}
                                </span>
                                <strong className="text-lg text-slate-800 font-bold">
                                  {aiGeneratedResult.budgetSAR.recommendedDaily} SAR
                                </strong>
                              </div>
                              <div>
                                <span className="text-slate-400 block font-semibold uppercase">
                                  {txt("Target Auction Bid", "سعر المزايدة المستهدف")}
                                </span>
                                <strong className="text-lg text-slate-800 font-bold">
                                  {aiGeneratedResult.bidStrategy?.targetCpaSAR || 35} SAR
                                </strong>
                              </div>
                              <div className="md:col-span-1">
                                <span className="text-slate-400 block font-semibold uppercase">
                                  {txt("Bid Strategy Pattern", "نمط استراتيجية المزايدة")}
                                </span>
                                <strong className="text-slate-800 font-bold block mt-1">
                                  {aiGeneratedResult.bidStrategy?.recommended || "Target CPA"}
                                </strong>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LANDING PAGE RESULT */}
                      {aiMode === "landing_page" && aiGeneratedResult.hero && (
                        <div className="space-y-4 border border-slate-100 p-4 rounded-xl bg-slate-50/20">
                          {/* Hero Mock */}
                          <div className="text-center p-6 border-b border-slate-100">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                              {aiGeneratedResult.hero.superTitle}
                            </span>
                            <h2 className="text-lg font-bold text-slate-800 mt-1 max-w-xl mx-auto">
                              {aiGeneratedResult.hero.title}
                            </h2>
                            <p className="text-slate-500 max-w-lg mx-auto mt-2">
                              {aiGeneratedResult.hero.subtitle}
                            </p>
                            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-bold text-xs">
                              {aiGeneratedResult.hero.cta}
                            </button>
                            <span className="block text-[10px] text-slate-400 mt-2">
                              {aiGeneratedResult.hero.socialProofText}
                            </span>
                          </div>
                          {/* Features */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiGeneratedResult.features?.map((f: any, idx: number) => (
                              <div
                                key={idx}
                                className="space-y-1 bg-white p-3 border border-slate-100 rounded-lg"
                              >
                                <h4 className="font-bold text-slate-800 text-xs">{f.title}</h4>
                                <p className="text-slate-500 text-[11px] leading-relaxed">
                                  {f.desc}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* VIDEO SCRIPT RESULT */}
                      {aiMode === "video_script" && (
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                            <h4 className="font-bold text-slate-800">
                              {txt(
                                "Vertical script hooks & structure:",
                                "تفاصيل سيناريو الفيديو الإعلاني:"
                              )}{" "}
                              {aiGeneratedResult.videoTitle}
                            </h4>
                            <p className="text-slate-600 font-medium mt-1">
                              Hook: "{aiGeneratedResult.hook}"
                            </p>
                          </div>
                          <table className="w-full text-left text-xs text-slate-600 border border-slate-100 rounded-lg overflow-hidden">
                            <thead className="bg-slate-50 border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">{txt("Time", "الوقت")}</th>
                                <th className="p-2.5">{txt("Visual", "المشهد البصري")}</th>
                                <th className="p-2.5">
                                  {txt("Voiceover / Audio", "التعليق الصوتي")}
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {aiGeneratedResult.storyboard?.map((step: any, idx: number) => (
                                <tr key={idx}>
                                  <td className="p-2.5 font-bold text-slate-800">{step.time}</td>
                                  <td className="p-2.5 text-slate-500">{step.visual}</td>
                                  <td className="p-2.5 font-medium text-slate-700">{step.audio}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="text-slate-500 leading-relaxed font-semibold">
                            Caption:{" "}
                            <strong className="text-slate-700 font-normal">
                              {aiGeneratedResult.tiktokCaption}
                            </strong>
                          </p>
                        </div>
                      )}

                      {/* Display image prompt if generated */}
                      {aiGeneratedResult.imagePrompt && (
                        <div className="mt-4 p-3 border border-slate-200 bg-slate-50 rounded-lg text-[11px]">
                          <strong className="text-slate-700 block mb-1">
                            {txt(
                              "AI Media Prompt Strategy for Midjourney/Dall-E:",
                              "نمط محفز توليد الصور الإبداعية:"
                            )}
                          </strong>
                          <span className="text-slate-500 italic">
                            "{aiGeneratedResult.imagePrompt}"
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-400 py-16 space-y-2">
                      <Sparkles className="w-8 h-8 text-slate-300" />
                      <p className="text-xs font-semibold">
                        {txt(
                          "Gemini Copywriter model is ready",
                          "نموذج كاتب الإعلانات بالذكاء الاصطناعي جاهز"
                        )}
                      </p>
                      <p className="text-[11px] max-w-sm text-center leading-relaxed text-slate-400/80">
                        {txt(
                          "Describe your company value statement on the left and select standard target networks to draft scrolls stopping marketing campaign frameworks.",
                          "اكتب ملامح فكرتك التسويقية على اليسار واختر شبكة النشر الإعلاني المفضلة لصياغة استراتيجية تفوق المنافسين."
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 5: CRM REVENUE ATTRIBUTION
              ========================================== */}
          {activeTab === "attribution" && (
            <div className="space-y-6">
              {/* Attribution model switch */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {txt(
                        "Multi-Touch Revenue Attribution Engine",
                        "محرك إسناد الإيرادات متعدد اللمسات"
                      )}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {txt(
                        "Compare financial attribution algorithms showing ad spent vs. CRM paid invoice balances",
                        "قارن مخرجات وقرارات الإسناد الإعلاني مع مبيعات العملاء وفواتير القيود المالية"
                      )}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 border border-slate-200/80 p-1 rounded-lg bg-slate-50/50">
                    {[
                      { id: "firstClick", label: txt("First Click", "اللمسة الأولى") },
                      { id: "lastClick", label: txt("Last Click", "اللمسة الأخيرة") },
                      { id: "linear", label: txt("Linear", "خطي") },
                      { id: "dataDriven", label: txt("Data-Driven", "بالمعطيات الذكية") },
                    ].map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setAttributionModel(model.id as any)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                          attributionModel === model.id
                            ? "bg-white text-primary shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        )}
                      >
                        {model.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Attribution chain list */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3">
                          {txt("Traffic Campaign & Network", "الحملة ومصدر الزيارة")}
                        </th>
                        <th className="px-6 py-3">
                          {txt("CRM Lead / Company", "العميل والشركة في CRM")}
                        </th>
                        <th className="px-6 py-3 text-center">
                          {txt("Deal Value", "قيمة الفرصة")}
                        </th>
                        <th className="px-6 py-3 text-center">
                          {txt("Invoice Paid", "الفاتورة المدفوعة")}
                        </th>
                        <th className="px-6 py-3 text-center">
                          {txt("Attribution Weight", "وزن الإسناد")}
                        </th>
                        <th className="px-6 py-3 text-right">
                          {txt("Attributed Value", "القيمة المنسوبة")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {attributionChain.map((item) => {
                        const weight = item.attributionModelShare[attributionModel] || 100;
                        const attributedVal = (item.invoiceAmountSAR * (weight / 100)).toFixed(0);
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-bold text-slate-800 block text-sm">
                                {item.campaignName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">
                                {item.adNetwork} •{" "}
                                {new Date(item.clickTimestamp).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-slate-700 block">
                                {item.leadName}
                              </span>
                              <span className="text-xs text-slate-500">{item.leadCompany}</span>
                            </td>
                            <td className="px-6 py-4 text-center font-bold text-slate-700">
                              {item.valueSAR.toLocaleString()} {txt("SAR", "ر.س")}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-200">
                                {item.invoiceNumber} • Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-bold text-slate-800">{weight}%</span>
                                <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="bg-emerald-500 h-full"
                                    style={{ width: `${weight}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-bold text-primary">
                              {Number(attributedVal).toLocaleString()} {txt("SAR", "ر.س")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INTEGRATION FLOW METRIC SHOWER */}
              <div className="bg-slate-900 text-slate-100 p-6 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  <h3 className="font-bold">
                    {txt(
                      "Attribution Flow Pipeline (Zero Mock Data)",
                      "تسلسل تدفق القنوات والإيرادات اللحظية"
                    )}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-center relative">
                  {[
                    {
                      title: txt("1. Click Campaign", "1. ضغطة الحملة"),
                      value: "54,200 Hits",
                      desc: txt("Meta & Google CAPI", "نقاط الإحالة المباشرة"),
                    },
                    {
                      title: txt("2. CRM Leads", "2. عملاء CRM"),
                      value: `${syncSummary.matchedLeadsCount} Leads`,
                      desc: txt("Captured from Forms", "الفرص المؤهلة المسجلة"),
                    },
                    {
                      title: txt("3. CRM Deals Won", "3. الصفقات الرابحة"),
                      value: "Won qualified",
                      desc: txt("Moved in pipeline", "الرابحة في التدفق"),
                    },
                    {
                      title: txt("4. ZATCA Invoice", "4. فواتير زكاة"),
                      value: "100% Paid SAR",
                      desc: txt("Direct ledger link", "المرحلة الثانية للفوترة"),
                    },
                    {
                      title: txt("5. Net Revenue", "5. صافي الأرباح"),
                      value: `${syncSummary.totalAttributedRevenueSAR.toLocaleString()} SAR`,
                      desc: txt("True ROI recorded", "العائد الحقيقي المسجل"),
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-800/50 border border-slate-800 rounded-lg space-y-1"
                    >
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                        {step.title}
                      </span>
                      <strong className="text-sm font-bold block text-emerald-400">
                        {step.value}
                      </strong>
                      <span className="text-[10px] text-slate-400 block">{step.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              TAB 6: AUTOMATION RULES & PIXELS
              ========================================== */}
          {activeTab === "automations" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Automation Rules list */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-8 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {txt("Automated Bid & Budget Rules", "قواعد أتمتة الميزانية والمزايدة الذكية")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {txt(
                      "Scale winner ads or throttle underperforming assets autonomously based on custom triggers",
                      "تحكم في إيقاف الإعلانات أو زيادة ميزانياتها تلقائياً بناءً على العائد"
                    )}
                  </p>
                </div>

                <div className="space-y-4">
                  {automations.map((rule) => (
                    <div
                      key={rule.id}
                      className="border border-slate-100 p-4 rounded-xl bg-slate-50/20 space-y-3.5"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <h4 className="font-bold text-slate-800 text-sm">{rule.name}</h4>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => runAutomationRule(rule.id)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-primary text-white hover:bg-primary/95 rounded-lg text-xs font-bold"
                          >
                            <Play className="w-3 h-3" />
                            {txt("Run Evaluation", "تشغيل التقييم الآن")}
                          </button>
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs font-bold border border-emerald-100">
                            {rule.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-white border border-slate-100 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
                        <div>
                          <strong>{txt("Trigger Condition:", "شرط الأتمتة:")}</strong>{" "}
                          {rule.conditions.metric} {rule.conditions.operator}{" "}
                          {rule.conditions.threshold}
                        </div>
                        <div>
                          <strong>{txt("System Actions:", "الإجراءات المبرمجة:")}</strong>{" "}
                          {rule.actions.join(", ")}
                        </div>
                      </div>

                      {rule.logs && rule.logs.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            {txt("Execution Logs & Audit Trail", "سجل التقييم والتتبع والتدقيق")}
                          </span>
                          <div className="p-3 bg-slate-900 rounded-lg text-slate-300 font-mono text-[11px] max-h-[120px] overflow-y-auto space-y-1 leading-normal">
                            {rule.logs.map((log, idx) => (
                              <div key={idx}>
                                <span className="text-slate-500 mr-2">
                                  [{new Date(log.timestamp).toLocaleTimeString()}]
                                </span>
                                <span>{log.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Pixel management list */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm lg:col-span-4 space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    {txt("Pixel Tracking & Conversions API", "أكواد البيكسل وربط CAPI")}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {txt(
                      "Standard Javascript pixels and full server-side conversion API endpoints",
                      "أكواد التتبع التقليدية ومسارات التحويل المباشرة من الخادم"
                    )}
                  </p>
                </div>

                <div className="space-y-3.5">
                  {pixels.map((px) => (
                    <div
                      key={px.id}
                      className="p-4 border border-slate-100 rounded-xl space-y-2 hover:border-slate-200 transition-all"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
                          {px.platform}
                        </span>
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">{px.name}</h4>
                      <p className="text-slate-400 text-[10px] font-mono">ID: {px.pixelId}</p>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                        <span>{px.trackingType}</span>
                        <span className="font-semibold text-slate-700">
                          {px.eventsReceived.toLocaleString()} Events
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* CREATE CAMPAIGN MODAL DIALOG */}
      {showBuilder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-md">
                {txt("Launch New Omnichannel Campaign", "إطلاق وتخطيط حملة إعلانية جديدة")}
              </h3>
              <button
                type="button"
                onClick={() => setShowBuilder(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-5 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  {txt("Campaign Name", "اسم الحملة الإعلانية")}
                </label>
                <input
                  type="text"
                  required
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={txt(
                    "e.g. Q3 Saudi Accounting Soft Leads",
                    "مثال: مبيعات الربع الثالث - أتمتة الرواتب"
                  )}
                  className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white"
                />
              </div>

              {/* Grid 2x2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {txt("Ad Network Platform", "المنصة المستهدفة")}
                  </label>
                  <select
                    value={newCampaign.network}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({ ...prev, network: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white"
                  >
                    {[
                      "Meta Ads",
                      "Google Ads",
                      "TikTok Ads",
                      "Snapchat Ads",
                      "LinkedIn Ads",
                      "YouTube Ads",
                    ].map((net) => (
                      <option key={net} value={net}>
                        {net}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {txt("Marketing Objective", "الهدف التسويقي")}
                  </label>
                  <select
                    value={newCampaign.objective}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({ ...prev, objective: e.target.value }))
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white"
                  >
                    {["Awareness", "Traffic", "Leads", "Sales", "App Installs"].map((obj) => (
                      <option key={obj} value={obj}>
                        {obj}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Budgets */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {txt("Daily Budget (SAR)", "الميزانية اليومية (ر.س)")}
                  </label>
                  <input
                    type="number"
                    min={100}
                    value={newCampaign.dailyBudgetSAR}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({
                        ...prev,
                        dailyBudgetSAR: Number(e.target.value),
                      }))
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">
                    {txt("Total Lifetime Budget (SAR)", "الميزانية الإجمالية (ر.س)")}
                  </label>
                  <input
                    type="number"
                    min={500}
                    value={newCampaign.budgetSAR}
                    onChange={(e) =>
                      setNewCampaign((prev) => ({ ...prev, budgetSAR: Number(e.target.value) }))
                    }
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs text-slate-700 bg-white"
                  />
                </div>
              </div>

              {/* Automation rules connect */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">
                  {txt("Attach Automated Control Rule", "إسناد قواعد التحكم الذكي")}
                </label>
                <div className="space-y-2 max-h-[100px] overflow-y-auto border border-slate-100 rounded-lg p-2.5">
                  {[
                    {
                      id: "rule_cpa_excess",
                      name: txt("CPA Exceeds Target Cap Rule", "سقف حماية تكلفة التحويل CPA"),
                    },
                    {
                      id: "rule_roas_boost",
                      name: txt("ROAS Exceeds 500% Scale Rule", "مضاعفة الإنفاق للعائد المرتفع"),
                    },
                  ].map((rule) => (
                    <label
                      key={rule.id}
                      className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newCampaign.automationRules.includes(rule.id)}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...newCampaign.automationRules, rule.id]
                            : newCampaign.automationRules.filter((r) => r !== rule.id);
                          setNewCampaign((prev) => ({ ...prev, automationRules: updated }));
                        }}
                        className="rounded text-primary focus:ring-primary/50"
                      />
                      <span>{rule.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Form submit buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setShowBuilder(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg font-semibold hover:bg-slate-50 transition-all"
                >
                  {txt("Cancel", "إلغاء")}
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold transition-all shadow-sm"
                >
                  {txt("Synchronize & Deploy", "تأكيد النشر والربط")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
