import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { auth } from "@/src/lib/firebase";
import { toast } from "sonner";
import {
  Sparkles,
  Mail,
  Share2,
  Megaphone,
  BrainCircuit,
  TrendingUp,
  Users,
  Percent,
  Plus,
  Send,
  Trash2,
  Volume2,
  Loader2,
  Bot,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Search,
  MessageSquare,
  Activity,
  Award,
  CheckCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import SeoCopilotModule from "@/src/components/marketing/SeoCopilotModule";

// Helper for Arabic/English multi-lingual text translation
const txt = (isAr: boolean, en: string, ar: string) => (isAr ? ar : en);

interface MarketingStats {
  email: {
    totalContacts: number;
    sent: number;
    openRate: number;
    clickRate: number;
    revenueSAR: number;
  };
  advertising: {
    totalSpendSAR: number;
    clicks: number;
    impressions: number;
    conversions: number;
    roas: number;
    cpaSAR: number;
    conversionRate: number;
  };
  social: {
    totalReach: number;
    totalEngagements: number;
    postsCount: number;
    averageEngagementRate: number;
  };
  unifiedScore: number;
  timestamp: string;
}

export default function MarketingCopilot() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // Core State
  const [stats, setStats] = useState<MarketingStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeSubTab, setActiveSubTab] = useState<"email" | "social" | "advertising" | "seo">("email");

  // Email Marketing States
  const [emailCampaigns, setEmailCampaigns] = useState<any[]>([]);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmailCampaign, setNewEmailCampaign] = useState({
    name: "",
    subject: "",
    segment: "All Leads",
  });

  // Social Media States
  const [socialPosts, setSocialPosts] = useState<any[]>([]);
  const [socialLoading, setSocialLoading] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [newSocialPost, setNewSocialPost] = useState({
    platform: "LinkedIn",
    text: "",
    status: "Scheduled",
  });

  // Social Listening Brand Scan
  const [brandKeyword, setBrandKeyword] = useState("Madarij OS");
  const [listeningResults, setListeningResults] = useState<any[]>([]);
  const [listeningLoading, setListeningLoading] = useState(false);

  // Ad Campaign States
  const [adCampaigns, setAdCampaigns] = useState<any[]>([]);
  const [adLoading, setAdLoading] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [newAdCampaign, setNewAdCampaign] = useState({
    name: "",
    network: "Google Ads",
    objective: "Conversions",
    budgetSAR: 5000,
    dailyBudgetSAR: 200,
  });

  // Gemini AI Copilot Chat Advisor States
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      text: txt(
        isAr,
        "Welcome to your AI Marketing Copilot! I am connected to your live system. Ask me to draft email copies, suggest LinkedIn posts, optimize your ad budget splits, or design a multi-channel funnel tailored to the Gulf market.",
        "مرحباً بك في مساعد التسويق الذكي! أنا متصل بنظامك المباشر الآن. اطلب مني صياغة رسائل البريد الإلكتروني، أو اقتراح منشورات LinkedIn، أو تحسين ميزانيات الإعلانات، أو تصميم قمع تسويقي مخصص للخليج."
      ),
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Historical Chart Mock Data
  const chartData = [
    { name: "Week 1", "Social Reach": 14000, "Email Clicks": 150, "Ad Conversions": 40 },
    { name: "Week 2", "Social Reach": 25000, "Email Clicks": 280, "Ad Conversions": 75 },
    { name: "Week 3", "Social Reach": 48000, "Email Clicks": 430, "Ad Conversions": 110 },
    { name: "Week 4", "Social Reach": 64000, "Email Clicks": 610, "Ad Conversions": 195 },
    { name: "Week 5", "Social Reach": 87400, "Email Clicks": 890, "Ad Conversions": 240 },
  ];

  // Load All Live Data on Mount
  useEffect(() => {
    fetchStats();
    fetchEmailCampaigns();
    fetchSocialPosts();
    fetchAdCampaigns();
  }, []);

  const getAuthHeaders = async () => {
    const token = await auth.currentUser?.getIdToken();
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/stats", { headers });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        console.error("Failed to fetch marketing stats");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEmailCampaigns = async () => {
    try {
      setEmailLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/email/campaigns", { headers });
      if (res.ok) {
        const data = await res.json();
        setEmailCampaigns(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEmailLoading(false);
    }
  };

  const fetchSocialPosts = async () => {
    try {
      setSocialLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/social/posts", { headers });
      if (res.ok) {
        const data = await res.json();
        setSocialPosts(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSocialLoading(false);
    }
  };

  const fetchAdCampaigns = async () => {
    try {
      setAdLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/campaigns", { headers });
      if (res.ok) {
        const data = await res.json();
        setAdCampaigns(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAdLoading(false);
    }
  };

  // --- ACTIONS ---

  // Create Email Campaign
  const handleCreateEmailCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailCampaign.name || !newEmailCampaign.subject) {
      toast.error(txt(isAr, "Please fill in all fields", "يرجى تعبئة جميع الحقول"));
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/email/campaigns", {
        method: "POST",
        headers,
        body: JSON.stringify(newEmailCampaign),
      });
      if (res.ok) {
        toast.success(txt(isAr, "Campaign draft created successfully!", "تم إنشاء مسودة الحملة بنجاح!"));
        setShowEmailModal(false);
        setNewEmailCampaign({ name: "", subject: "", segment: "All Leads" });
        fetchEmailCampaigns();
        fetchStats();
      }
    } catch (err) {
      toast.error(txt(isAr, "Failed to create campaign", "فشل إنشاء الحملة"));
    }
  };

  // Simulate Sending Email Campaign
  const handleSendEmailCampaign = async (id: string) => {
    try {
      toast.info(txt(isAr, "Dispatching campaign bulk emails...", "جاري إرسال البريد الإلكتروني الجماعي..."));
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/marketing-copilot/email/campaigns/${id}/send`, {
        method: "POST",
        headers,
      });
      if (res.ok) {
        toast.success(txt(isAr, "Campaign emails successfully sent & metrics recorded!", "تم إرسال الحملة بنجاح وتسجيل الإحصائيات المباشرة!"));
        fetchEmailCampaigns();
        fetchStats();
      }
    } catch (err) {
      toast.error(txt(isAr, "Failed to trigger dispatch", "فشل تشغيل إرسال الحملة"));
    }
  };

  // Create Social Post
  const handleCreateSocialPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSocialPost.text) {
      toast.error(txt(isAr, "Post text is required", "نص المنشور مطلوب"));
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/social/posts", {
        method: "POST",
        headers,
        body: JSON.stringify(newSocialPost),
      });
      if (res.ok) {
        toast.success(txt(isAr, "Social post scheduled!", "تمت جدولة المنشور بنجاح!"));
        setShowSocialModal(false);
        setNewSocialPost({ platform: "LinkedIn", text: "", status: "Scheduled" });
        fetchSocialPosts();
        fetchStats();
      }
    } catch (err) {
      toast.error(txt(isAr, "Failed to schedule post", "فشل جدولة المنشور"));
    }
  };

  // Delete Social Post
  const handleDeleteSocialPost = async (id: string) => {
    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/marketing-copilot/social/posts/${id}`, {
        method: "DELETE",
        headers,
      });
      if (res.ok) {
        toast.success(txt(isAr, "Post deleted successfully", "تم حذف المنشور بنجاح"));
        fetchSocialPosts();
        fetchStats();
      }
    } catch (err) {
      toast.error(txt(isAr, "Failed to delete post", "فشل حذف المنشور"));
    }
  };

  // Create Ad Campaign
  const handleCreateAdCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdCampaign.name) {
      toast.error(txt(isAr, "Campaign name is required", "اسم الحملة مطلوب"));
      return;
    }
    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/advertising/campaigns", {
        method: "POST",
        headers,
        body: JSON.stringify(newAdCampaign),
      });
      if (res.ok) {
        toast.success(txt(isAr, "Ad campaign registered and budget optimized!", "تم تسجيل الحملة وتخصيص الموازنة!"));
        setShowAdModal(false);
        setNewAdCampaign({
          name: "",
          network: "Google Ads",
          objective: "Conversions",
          budgetSAR: 5000,
          dailyBudgetSAR: 200,
        });
        fetchAdCampaigns();
        fetchStats();
      }
    } catch (err) {
      toast.error(txt(isAr, "Failed to register campaign", "فشل تسجيل الحملة الإعلانية"));
    }
  };

  // Brand Monitoring Search Grounding Web Scan
  const handleBrandScan = async () => {
    if (!brandKeyword.trim()) return;
    try {
      setListeningLoading(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/social/listen", {
        method: "POST",
        headers,
        body: JSON.stringify({ keyword: brandKeyword }),
      });
      if (res.ok) {
        const data = await res.json();
        setListeningResults(data);
        toast.success(txt(isAr, "Successfully grounded real brand mentions!", "تم جلب وتصنيف الإشارات الحقيقية بنجاح عبر الإنترنت!"));
      } else {
        toast.error(txt(isAr, "Brand monitoring scan failed", "فشل فحص تتبع العلامة التجارية"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setListeningLoading(false);
    }
  };

  // Gemini AI Chat Advisor
  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", text: userText }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const headers = await getAuthHeaders();
      const res = await fetch("/api/marketing-copilot/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: userText,
          currentContext: {
            stats,
            emailCampaignsCount: emailCampaigns.length,
            socialPostsCount: socialPosts.length,
            adCampaignsCount: adCampaigns.length,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", text: data.text }]);
      } else {
        toast.error("Gemini failed to reply");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  };

  // Quick prompt presets
  const handlePresetClick = (preset: string) => {
    setChatInput(preset);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1700px] mx-auto min-h-screen text-zinc-800 dark:text-zinc-100" dir={isAr ? "rtl" : "ltr"}>
      {/* Header Banner */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-6 md:p-8 backdrop-blur-md shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Bot className="w-3.5 h-3.5" />
              {txt(isAr, "CONSOLIDATED COPILOT", "مساعد التسويق الموحد")}
            </div>
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Sparkles className="w-8 h-8 text-emerald-500 animate-pulse" />
              {txt(isAr, "Marketing Copilot & Analytics Suite", "مساعد التسويق والنمو الذكي")}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-3xl leading-relaxed">
              {txt(
                isAr,
                "A unified marketing automation center consolidating your email sequences, scheduled social media channels, and paid Google/Meta search campaign planning. Powered by real-time analytics and grounded brand intelligence.",
                "منصة أتمتة تسويق موحدة تجمع حملاتك البريدية، جدولة قنوات التواصل الاجتماعي، وإدارة موازنات الإعلانات المدفوعة، مدعومة بالتحليلات اللحظية والذكاء الاصطناعي."
              )}
            </p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl shrink-0">
            <Activity className="w-8 h-8 text-emerald-500" />
            <div>
              <div className="text-[10px] text-zinc-400 font-bold uppercase">{txt(isAr, "Growth Health Score", "مؤشر صحة النمو")}</div>
              <div className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-1.5">
                {stats?.unifiedScore || 88}
                <span className="text-xs text-emerald-500 font-bold">/100</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Performance Analytics Bento Grid */}
      <h2 className="text-lg font-black text-zinc-950 dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-emerald-500" />
        {txt(isAr, "Real-time Marketing Channels Performance", "الأداء اللحظي لقنوات التسويق والنمو")}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Email Marketing Performance Card */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/20 transition-all shadow-xs relative">
          <div className="absolute top-4 right-4 text-zinc-400">
            <Mail className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="text-sm font-bold text-zinc-400 mb-1">{txt(isAr, "Email Marketing", "التسويق البريدي")}</div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            ) : (
              `${stats?.email.totalContacts.toLocaleString()}`
            )}
            <span className="text-xs font-semibold text-zinc-400 ml-1.5">{txt(isAr, "Active Contacts", "مستلم نشط")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "Avg Open Rate", "معدل فتح الرسائل")}</div>
              <div className="text-lg font-black text-emerald-500">
                {statsLoading ? "..." : `${stats?.email.openRate.toFixed(1)}%`}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "Avg Click Rate", "معدل النقر (CTR)")}</div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">
                {statsLoading ? "..." : `${stats?.email.clickRate.toFixed(1)}%`}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400 font-medium">
            {txt(isAr, "Attributed Conversion Sales:", "مبيعات منسوبة للبريد الإلكتروني:")}{" "}
            <span className="font-black text-zinc-900 dark:text-white">
              {statsLoading ? "..." : `${stats?.email.revenueSAR.toLocaleString()} SAR`}
            </span>
          </div>
        </div>

        {/* Paid Advertising Campaigns Card */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/20 transition-all shadow-xs relative">
          <div className="absolute top-4 right-4 text-zinc-400">
            <Megaphone className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="text-sm font-bold text-zinc-400 mb-1">{txt(isAr, "Paid Search & Display Ads", "الإعلانات الرقمية المدفوعة")}</div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            ) : (
              `${stats?.advertising.totalSpendSAR.toLocaleString()} SAR`
            )}
            <span className="text-xs font-semibold text-zinc-400 ml-1.5">{txt(isAr, "Total Spent", "إجمالي الصرف")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "ROAS Score", "العائد على الإنفاق")}</div>
              <div className="text-lg font-black text-indigo-500">
                {statsLoading ? "..." : `${stats?.advertising.roas.toFixed(2)}x`}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "Avg Cost Per Lead", "تكلفة العميل (CPA)")}</div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">
                {statsLoading ? "..." : `${stats?.advertising.cpaSAR.toFixed(1)} SAR`}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400 font-medium">
            {txt(isAr, "Live Conversion Count:", "إجمالي العملاء المحولين:")}{" "}
            <span className="font-black text-zinc-900 dark:text-white">
              {statsLoading ? "..." : `${stats?.advertising.conversions.toLocaleString()}`}
            </span>
          </div>
        </div>

        {/* Social Media Channels Card */}
        <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-2xl hover:border-emerald-500/20 transition-all shadow-xs relative">
          <div className="absolute top-4 right-4 text-zinc-400">
            <Share2 className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
          </div>
          <div className="text-sm font-bold text-zinc-400 mb-1">{txt(isAr, "Social Media & Networks", "الشبكات الاجتماعية وقنوات الاتصال")}</div>
          <div className="text-3xl font-black text-zinc-900 dark:text-white mb-4">
            {statsLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            ) : (
              `${stats?.social.totalReach.toLocaleString()}`
            )}
            <span className="text-xs font-semibold text-zinc-400 ml-1.5">{txt(isAr, "Total Reach", "الوصول الإجمالي")}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-4">
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "Scheduled Posts", "منشورات مجدولة")}</div>
              <div className="text-lg font-black text-emerald-500">
                {statsLoading ? "..." : stats?.social.postsCount}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-semibold">{txt(isAr, "Engagem. Rate", "معدل التفاعل")}</div>
              <div className="text-lg font-black text-zinc-900 dark:text-white">
                {statsLoading ? "..." : `${stats?.social.averageEngagementRate.toFixed(2)}%`}
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-400 font-medium">
            {txt(isAr, "Attributed Growth Platform:", "المنصة الرئيسية للنمو:")}{" "}
            <span className="font-black text-zinc-900 dark:text-white">LinkedIn / X</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left is Unified Interactive Dashboard, Right is Gemini AI advisor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Consolidated Channels & Tools (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section Navigation Tabs */}
          <div className="bg-zinc-100 dark:bg-zinc-800/40 p-1.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/60 inline-flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab("email")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2",
                activeSubTab === "email"
                  ? "bg-white dark:bg-zinc-900 text-emerald-500 shadow-xs border border-zinc-200/30 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Mail className="w-4.5 h-4.5" />
              <span>{txt(isAr, "Email Campaigns", "أتمتة البريد")}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("social")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2",
                activeSubTab === "social"
                  ? "bg-white dark:bg-zinc-900 text-emerald-500 shadow-xs border border-zinc-200/30 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Share2 className="w-4.5 h-4.5" />
              <span>{txt(isAr, "Social & Brand Scanning", "التواصل والاستماع")}</span>
            </button>
            <button
              onClick={() => setActiveSubTab("advertising")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2",
                activeSubTab === "advertising"
                  ? "bg-white dark:bg-zinc-900 text-emerald-500 shadow-xs border border-zinc-200/30 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Megaphone className="w-4.5 h-4.5" />
              <span>{txt(isAr, "Paid Advertising", "الإعلانات المدفوعة")}</span>
            </button>

            <button
              onClick={() => setActiveSubTab("seo")}
              className={cn(
                "px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2",
                activeSubTab === "seo"
                  ? "bg-white dark:bg-zinc-900 text-purple-500 shadow-xs border border-zinc-200/30 dark:border-zinc-800"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              <Sparkles className="w-4.5 h-4.5 text-purple-500" />
              <span>{txt(isAr, "SEO Copilot", "مساعد SEO والخليج")}</span>
            </button>
          </div>

          {/* Render Active Dashboard Tab Content */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            {activeSubTab === "email" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      {txt(isAr, "Email Campaigns & Sequences", "حملات وقنوات البريد الإلكتروني")}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {txt(isAr, "Track delivery rates, trigger sequences, and generate dynamic flows.", "تتبع نسب وصول الرسائل، أطلق الحملات، وصمم تدفقات مخصصة")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEmailModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{txt(isAr, "New Campaign", "حملة جديدة")}</span>
                  </button>
                </div>

                {emailLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" dir={isAr ? "rtl" : "ltr"}>
                      <thead>
                        <tr className="border-b border-zinc-100 dark:border-zinc-800/60 text-[11px] uppercase text-zinc-400 font-bold">
                          <th className="py-3 px-2">{txt(isAr, "Campaign Details", "تفاصيل الحملة")}</th>
                          <th className="py-3 px-2">{txt(isAr, "Target Segment", "الشريحة المستهدفة")}</th>
                          <th className="py-3 px-2">{txt(isAr, "Delivery Stats", "إحصائيات التسليم")}</th>
                          <th className="py-3 px-2 text-center">{txt(isAr, "Status", "الحالة")}</th>
                          <th className="py-3 px-2 text-right">{txt(isAr, "Actions", "الإجراءات")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/30 text-sm">
                        {emailCampaigns.map((c) => (
                          <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                            <td className="py-4 px-2">
                              <div className="font-bold text-zinc-900 dark:text-white leading-tight">{c.name}</div>
                              <div className="text-xs text-zinc-400 font-medium mt-1 truncate max-w-xs">{c.subject}</div>
                            </td>
                            <td className="py-4 px-2 font-semibold text-zinc-600 dark:text-zinc-300">
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-xs">{c.segment}</span>
                            </td>
                            <td className="py-4 px-2">
                              {c.status === "Sent" ? (
                                <div className="space-y-1 text-xs">
                                  <div>
                                    <span className="text-zinc-400 font-medium">{txt(isAr, "Sent:", "تم الإرسال:")}</span>{" "}
                                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{c.sentCount}</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <span className="text-emerald-500 font-bold">O: {Math.round((c.openCount/c.sentCount)*100)}%</span>
                                    <span className="text-indigo-500 font-bold">C: {Math.round((c.clickCount/c.sentCount)*100)}%</span>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-zinc-400 text-xs italic">{txt(isAr, "Not sent yet", "لم يتم الإرسال بعد")}</span>
                              )}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span
                                className={cn(
                                  "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                                  c.status === "Sent"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                                )}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-4 px-2 text-right">
                              {c.status !== "Sent" ? (
                                <button
                                  onClick={() => handleSendEmailCampaign(c.id)}
                                  className="px-3 py-1.5 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg transition-all cursor-pointer"
                                >
                                  {txt(isAr, "Trigger Send", "إطلاق الحملة")}
                                </button>
                              ) : (
                                <div className="text-xs text-zinc-400 font-medium flex items-center justify-end gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>{txt(isAr, "Delivered", "مكتمل")}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "social" && (
              <div className="space-y-8">
                {/* Real-time brand mentions (Search Grounding) */}
                <div className="border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 bg-zinc-50/50 dark:bg-zinc-900/40 relative">
                  <div className="absolute top-4 right-4 text-emerald-500/10">
                    <BrainCircuit className="w-16 h-16" />
                  </div>
                  <h4 className="font-black text-zinc-900 dark:text-white mb-1.5 flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-emerald-500" />
                    {txt(isAr, "Live Brand & Competitor Listening (Grounded Scan)", "التتبع اللحظي للعلامة التجارية والمنافسين عبر الإنترنت")}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-2xl leading-relaxed">
                    {txt(
                      isAr,
                      "Enter your brand name or competitor keywords. The Copilot will trigger a real web search utilizing Google Search Grounding, pulling live reviews and evaluating sentiments in real-time.",
                      "أدخل اسم علامتك التجارية أو كلمات مفتاحية للمنافسين. سيقوم المساعد بإجراء تتبع حي عبر الإنترنت وتصنيف الآراء واستخراج تفاعل الجمهور."
                    )}
                  </p>

                  <div className="flex gap-3 mb-6 max-w-xl">
                    <input
                      type="text"
                      value={brandKeyword}
                      onChange={(e) => setBrandKeyword(e.target.value)}
                      placeholder={txt(isAr, "Brand, e.g. Madarij OS, Aramco...", "اسم العلامة التجارية...")}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      onClick={handleBrandScan}
                      disabled={listeningLoading}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 text-white font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      {listeningLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>{txt(isAr, "Scanning Web...", "جاري الفحص...")}</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>{txt(isAr, "Run Web Scan", "ابدأ الفحص الحي")}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {listeningResults.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] uppercase font-bold text-zinc-400">{txt(isAr, "Detected Mentions", "الإشارات المكتشفة حركياً")}</div>
                      {listeningResults.map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-900/60 p-4 rounded-xl text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-zinc-900 dark:text-zinc-200 flex items-center gap-1">
                              <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold text-zinc-500">{item.source}</span>
                              <span>{item.author}</span>
                            </span>
                            <div className="flex gap-1.5">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase",
                                item.sentiment === "Positive" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                item.sentiment === "Negative" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                                "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
                              )}>
                                {item.sentiment}
                              </span>
                              <span className="bg-indigo-50/50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 px-2 py-0.5 rounded-full text-[9px] font-black">
                                Urgency: {item.urgency}
                              </span>
                            </div>
                          </div>
                          <p className="text-zinc-600 dark:text-zinc-300 italic">"{item.text}"</p>
                          {item.entities && item.entities.length > 0 && (
                            <div className="flex gap-1.5 flex-wrap items-center">
                              <span className="text-zinc-400 text-[10px] font-bold">{txt(isAr, "Subjects:", "المواضيع:")}</span>
                              {item.entities.map((ent: string, eidx: number) => (
                                <span key={eidx} className="bg-zinc-50 dark:bg-zinc-900 px-2 py-0.5 rounded-md text-[10px] text-zinc-500 border border-zinc-200/40 dark:border-zinc-800">
                                  {ent}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Social Posts Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-black text-zinc-900 dark:text-white">
                        {txt(isAr, "Scheduled & Live Posts", "جدولة وإطلاق المنشورات")}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {txt(isAr, "Schedule optimized text updates to your business LinkedIn & Twitter channels.", "جدول منشوراتك عبر لينكدإن وتويتر بذكاء لتوسيع دائرة عملائك.")}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowSocialModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{txt(isAr, "Draft Post", "إنشاء منشور")}</span>
                    </button>
                  </div>

                  {socialLoading ? (
                    <div className="py-12 flex justify-center items-center">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialPosts.map((post) => (
                        <div key={post.id} className="border border-zinc-150 dark:border-zinc-800 p-4 rounded-2xl relative bg-zinc-50/30 dark:bg-zinc-900/30 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                                {post.platform}
                              </span>
                              <span className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                                post.status === "Published" ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                              )}>
                                {post.status}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed mb-4">{post.text}</p>
                          </div>

                          <div className="border-t border-zinc-100 dark:border-zinc-800/60 pt-3 flex justify-between items-center mt-auto">
                            <div className="flex gap-4 text-[10px] text-zinc-400">
                              {post.status === "Published" ? (
                                <>
                                  <span>Reach: <strong className="text-zinc-700 dark:text-zinc-300">{post.reach.toLocaleString()}</strong></span>
                                  <span>Likes: <strong className="text-zinc-700 dark:text-zinc-300">{post.likes}</strong></span>
                                </>
                              ) : (
                                <span>Scheduled for: <strong className="text-zinc-500">{new Date(post.scheduledFor).toLocaleDateString()}</strong></span>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteSocialPost(post.id)}
                              className="text-zinc-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeSubTab === "advertising" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      {txt(isAr, "Paid Ad Campaigns & Budgets", "إدارة وتخطيط موازنات الإعلانات الرقمية")}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {txt(isAr, "Manage and distribute enterprise ad spend across major search & social networks.", "تحكم ووزع الصرف الإعلاني باحترافية على شبكات البحث ومواقع التواصل.")}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAdModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{txt(isAr, "Plan Campaign", "تخطيط حملة")}</span>
                  </button>
                </div>

                {adLoading ? (
                  <div className="py-20 flex justify-center items-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {adCampaigns.map((c) => (
                      <div key={c.id} className="border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-black text-[10px] text-zinc-500 uppercase">{c.network}</span>
                            <span className="text-xs text-zinc-400 font-semibold">{c.objective}</span>
                          </div>
                          <h4 className="font-bold text-zinc-900 dark:text-white text-sm">{c.name}</h4>
                          <div className="text-[10px] text-zinc-400 font-medium mt-1">
                            {txt(isAr, "Registered Budget: ", "الموازنة المسجلة: ")} <strong>{c.budgetSAR.toLocaleString()} SAR</strong>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-900">
                            <span className="text-zinc-400 block mb-0.5">{txt(isAr, "Spent", "تم صرفه")}</span>
                            <strong className="text-zinc-900 dark:text-zinc-100">{c.spentSAR.toLocaleString()} SAR</strong>
                          </div>
                          <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-900">
                            <span className="text-zinc-400 block mb-0.5">{txt(isAr, "Clicks", "النقرات")}</span>
                            <strong className="text-zinc-900 dark:text-zinc-100">{c.clicks.toLocaleString()}</strong>
                          </div>
                          <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-900">
                            <span className="text-zinc-400 block mb-0.5">{txt(isAr, "Conversions", "التحويلات")}</span>
                            <strong className="text-zinc-900 dark:text-zinc-100">{c.conversions.toLocaleString()}</strong>
                          </div>
                          <div className="bg-white dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-900">
                            <span className="text-emerald-500 block mb-0.5">ROAS</span>
                            <strong className="text-emerald-500">{c.roas > 0 ? `${c.roas.toFixed(1)}x` : "0x"}</strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSubTab === "seo" && <SeoCopilotModule />}
          </div>

          {/* Graphical Growth Trend Visualizer */}
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 backdrop-blur-md">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  {txt(isAr, "Aggregated Multi-Channel Growth Analytics", "تحليلات النمو والتحول الرقمي المتكاملة")}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  {txt(isAr, "Performance telemetry mapping social reach and conversion signals.", "مخطط الأداء ومستويات الوصول ونبض التحويل الرقمي")}
                </p>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(24, 24, 27, 0.9)",
                      border: "1px solid #3f3f46",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                  <Area type="monotone" dataKey="Social Reach" stroke="#10b981" fillOpacity={1} fill="url(#colorReach)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Email Clicks" stroke="#6366f1" fillOpacity={1} fill="url(#colorClicks)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Side: Gemini AI Advisor (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 backdrop-blur-md shadow-xs flex flex-col h-[700px] relative">
            {/* Advisor Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="w-11 h-11 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center font-bold relative animate-pulse shrink-0">
                <Bot className="w-6 h-6" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-white dark:border-zinc-900 rounded-full" />
              </div>
              <div>
                <h3 className="font-black text-zinc-900 dark:text-white text-sm flex items-center gap-1">
                  <span>{txt(isAr, "AI Growth Copilot", "المستشار التسويقي الذكي")}</span>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                </h3>
                <div className="text-[10px] text-zinc-400 font-bold uppercase">{txt(isAr, "Saudi Market Advisor Active", "مستشار السوق الخليجي نشط")}</div>
              </div>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 no-scrollbar scroll-smooth">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed",
                    msg.role === "user"
                      ? "bg-zinc-100 dark:bg-zinc-800/80 text-zinc-800 dark:text-zinc-100 ml-auto rounded-tr-none"
                      : "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/10 text-zinc-800 dark:text-zinc-200 mr-auto rounded-tl-none"
                  )}
                >
                  <p className="whitespace-pre-line font-medium">{msg.text}</p>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-center gap-2 text-zinc-400 text-xs mr-auto bg-emerald-50/30 dark:bg-emerald-950/10 p-3 rounded-2xl">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>{txt(isAr, "Copilot is analyzing market channels...", "المستشار يدرس القنوات المتاحة...")}</span>
                </div>
              )}
            </div>

            {/* Preset prompts suggestions */}
            <div className="py-2 border-t border-zinc-100 dark:border-zinc-800/60 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              <button
                onClick={() => handlePresetClick("Draft a LinkedIn post announcing Saudi Phase 2 integration")}
                className="text-[9px] font-black shrink-0 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 rounded-lg hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                📝 LinkedIn Post
              </button>
              <button
                onClick={() => handlePresetClick("Recommend budget distribution of 20K SAR between Meta and Google Search")}
                className="text-[9px] font-black shrink-0 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 rounded-lg hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                📊 Ad Allocations
              </button>
              <button
                onClick={() => handlePresetClick("Write a cold sales email template for financial directors of Saudi logistics firms")}
                className="text-[9px] font-black shrink-0 px-2.5 py-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800 rounded-lg hover:border-emerald-500/20 transition-all cursor-pointer"
              >
                ✉️ Sales Template
              </button>
            </div>

            {/* Input Form */}
            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/60 flex gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder={txt(isAr, "Ask advisor to write/plan...", "اطلب من المستشار الصياغة والتخطيط...")}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-xs focus:outline-hidden focus:border-emerald-500"
              />
              <button
                onClick={handleSendChat}
                className="p-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}

      {/* Email Modal */}
      <AnimatePresence>
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-zinc-900 dark:text-white text-base">{txt(isAr, "New Email Campaign Sequence", "حملة بريد الكتروني جديدة")}</h3>
                <button onClick={() => setShowEmailModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateEmailCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Campaign Name", "اسم الحملة")}</label>
                  <input
                    type="text"
                    value={newEmailCampaign.name}
                    onChange={(e) => setNewEmailCampaign((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Riyadh SME Warm Welcome"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Subject Line", "عنوان الرسالة (Subject)")}</label>
                  <input
                    type="text"
                    value={newEmailCampaign.subject}
                    onChange={(e) => setNewEmailCampaign((prev) => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. مرحباً بك في منصة مدارج للتحول الرقمي"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Target Segment", "الشريحة المستهدفة")}</label>
                  <select
                    value={newEmailCampaign.segment}
                    onChange={(e) => setNewEmailCampaign((prev) => ({ ...prev, segment: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  >
                    <option value="All Leads">All Leads</option>
                    <option value="SMEs">SMEs</option>
                    <option value="Enterprise Clients">Enterprise Clients</option>
                    <option value="Financial Directors">Financial Directors</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer mt-2"
                >
                  {txt(isAr, "Save Campaign Draft", "حفظ مسودة الحملة")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Social Modal */}
      <AnimatePresence>
        {showSocialModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-zinc-900 dark:text-white text-base">{txt(isAr, "Draft and Schedule Social Post", "جدولة منشور اجتماعي جديد")}</h3>
                <button onClick={() => setShowSocialModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateSocialPost} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Platform", "المنصة")}</label>
                  <select
                    value={newSocialPost.platform}
                    onChange={(e) => setNewSocialPost((prev) => ({ ...prev, platform: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X">X (Twitter)</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Post Content", "محتوى المنشور")}</label>
                  <textarea
                    rows={4}
                    value={newSocialPost.text}
                    onChange={(e) => setNewSocialPost((prev) => ({ ...prev, text: e.target.value }))}
                    placeholder="e.g. فخورون بتقديم المزايا الجديدة لنظامنا اليوم..."
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Action Plan", "خطة الإطلاق")}</label>
                  <select
                    value={newSocialPost.status}
                    onChange={(e) => setNewSocialPost((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                  >
                    <option value="Scheduled">Schedule For Later</option>
                    <option value="Published">Publish Live Immediately</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer mt-2"
                >
                  {txt(isAr, "Schedule Update", "جدولة التحديث")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Advertising Modal */}
      <AnimatePresence>
        {showAdModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-zinc-900 dark:text-white text-base">{txt(isAr, "Plan Digital Ad Budget Allocation", "تخطيط موازنة الحملات الإعلانية")}</h3>
                <button onClick={() => setShowAdModal(false)} className="text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateAdCampaign} className="space-y-4 text-xs">
                <div>
                  <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Campaign Name", "اسم الحملة")}</label>
                  <input
                    type="text"
                    value={newAdCampaign.name}
                    onChange={(e) => setNewAdCampaign((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Riyadh SME Tech Acquisition"
                    className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Network", "الشبكة الإعلانية")}</label>
                    <select
                      value={newAdCampaign.network}
                      onChange={(e) => setNewAdCampaign((prev) => ({ ...prev, network: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                    >
                      <option value="Google Ads">Google Ads</option>
                      <option value="Meta Ads">Meta Ads</option>
                      <option value="LinkedIn Ads">LinkedIn Ads</option>
                      <option value="Snapchat Ads">Snapchat Ads</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Objective", "الهدف الإستراتيجي")}</label>
                    <select
                      value={newAdCampaign.objective}
                      onChange={(e) => setNewAdCampaign((prev) => ({ ...prev, objective: e.target.value }))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 font-bold"
                    >
                      <option value="Conversions">Conversions</option>
                      <option value="Lead Generation">Lead Generation</option>
                      <option value="Awareness">Awareness</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Total Budget (SAR)", "الموازنة الإجمالية (ريال)")}</label>
                    <input
                      type="number"
                      value={newAdCampaign.budgetSAR}
                      onChange={(e) => setNewAdCampaign((prev) => ({ ...prev, budgetSAR: Number(e.target.value) }))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold text-zinc-400">{txt(isAr, "Daily Spend Limit (SAR)", "الحد اليومي للصرف")}</label>
                    <input
                      type="number"
                      value={newAdCampaign.dailyBudgetSAR}
                      onChange={(e) => setNewAdCampaign((prev) => ({ ...prev, dailyBudgetSAR: Number(e.target.value) }))}
                      className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl transition-all cursor-pointer mt-2"
                >
                  {txt(isAr, "Optimize & Start Campaign", "تخصيص الموازنة والبدء")}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
