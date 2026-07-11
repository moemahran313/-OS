import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  MessageSquare,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Send,
  TrendingUp,
  BarChart3,
  Activity,
  Video,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  AtSign,
  Layers,
  Image as ImageIcon,
  Check,
  MoreVertical,
  Link as LinkIcon,
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
} from "recharts";

// ========================================================
// INTERFACES
// ========================================================
interface SocialAccount {
  id: string;
  platform: string;
  handle: string;
  name: string;
  avatar: string;
  followers: number;
  status: "Connected" | "Disconnected";
  accessToken?: string;
}

interface SocialPost {
  id: string;
  content: string;
  platforms: string[];
  status: "Draft" | "Pending Approval" | "Scheduled" | "Published";
  scheduledAt: string;
  imageUrl?: string;
  authorName: string;
  approvalStatus: "Draft" | "Pending" | "Approved";
  publishedAt?: string;
  metrics?: { reach: number; engagement: number; clicks: number; shares: number };
}

interface InboxItem {
  id: string;
  platform: string;
  authorName: string;
  authorAvatar: string;
  message: string;
  timestamp: string;
  status: "Read" | "Unread" | "Replied" | "Unresolved" | "In Progress" | "Resolved";
  type: "Comment" | "Mention" | "Direct Message";
  postTitle?: string;
  replies: Array<{ author: string; text: string; timestamp: string }>;
}

interface BrandMention {
  id: string;
  source: string;
  author: string;
  text: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  urgency?: "High" | "Medium" | "Low";
  entities?: string[];
  keyword: string;
  reach: number;
  createdAt: string;
}

export default function SocialMedia() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const txt = (en: string, ar: string) => (isAr ? ar : en);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "calendar" | "scheduler" | "inbox" | "monitoring" | "analytics"
  >("scheduler");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [monitoring, setMonitoring] = useState<BrandMention[]>([]);

  // Composer State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [postImage, setPostImage] = useState("");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [postStatus, setPostStatus] = useState<"Draft" | "Pending Approval" | "Scheduled">(
    "Scheduled"
  );

  // Platform overrides
  const [activePlatformTab, setActivePlatformTab] = useState<string>("Global");
  const [platformOverrides, setPlatformOverrides] = useState<Record<string, string>>({});

  // UTM tracking builder
  const [utmUrl, setUtmUrl] = useState("");
  const [utmSource, setUtmSource] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  // Inbox
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSuggestingReply, setIsSuggestingReply] = useState(false);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);

  // Monitoring
  const [monitorKeyword, setMonitorKeyword] = useState("Madarij");
  const [isListening, setIsListening] = useState(false);

  // Analytics mock data
  const performanceData = [
    { name: "Mon", reach: 12000, engagement: 800 },
    { name: "Tue", reach: 15000, engagement: 1200 },
    { name: "Wed", reach: 14000, engagement: 900 },
    { name: "Thu", reach: 21000, engagement: 2100 },
    { name: "Fri", reach: 18000, engagement: 1500 },
    { name: "Sat", reach: 24000, engagement: 3000 },
    { name: "Sun", reach: 29000, engagement: 4200 },
  ];

  const platformIcons: Record<string, any> = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    tiktok: Video,
    youtube: Youtube,
    threads: AtSign,
  };

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split("T")[0]);
    fetchData();

    // Check URL parameters for OAuth connection result
    const params = new URLSearchParams(window.location.search);
    const connectedPlatform = params.get("connected");
    if (connectedPlatform) {
      toast.success(
        txt(`Successfully connected ${connectedPlatform} via OAuth 2.0!`, `تم التوصيل بنجاح!`)
      );
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accountsRes, postsRes, inboxRes, monitoringRes] = await Promise.all([
        fetch("/api/social-media/accounts"),
        fetch("/api/social-media/posts"),
        fetch("/api/social-media/inbox"),
        fetch("/api/social-media/monitoring"),
      ]);

      if (accountsRes.ok) setAccounts(await accountsRes.json());
      if (postsRes.ok) setPosts(await postsRes.json());
      if (inboxRes.ok) {
        const inboxData = await inboxRes.json();
        setInbox(inboxData);
        if (inboxData.length > 0) setSelectedInboxItem(inboxData[0]);
      }
      if (monitoringRes.ok) setMonitoring(await monitoringRes.json());
    } catch (err: any) {
      toast.error(txt("Failed to load social platform data", "فشل تحميل بيانات منصة التواصل"));
    } finally {
      setLoading(false);
    }
  };

  // Connect Profile (OAuth Flow)
  const handleConnectProfile = async (platform: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/social-media/connect/${platform}`);
      if (res.ok) {
        const data = await res.json();
        // Normally window.location.href = data.url
        // For simulation, we'll route to the simulated callback directly
        window.location.href = data.url;
      }
    } catch {
      toast.error(txt("OAuth initiation failed", "فشل بدء المصادقة"));
      setActionLoading(false);
    }
  };

  // Composer
  const handleComposerTextChange = (val: string) => {
    if (activePlatformTab === "Global") {
      setNewPostContent(val);
    } else {
      setPlatformOverrides((prev) => ({ ...prev, [activePlatformTab]: val }));
    }
  };

  const currentComposerText =
    activePlatformTab === "Global"
      ? newPostContent
      : (platformOverrides[activePlatformTab] ?? newPostContent);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() && Object.keys(platformOverrides).length === 0) {
      toast.error(txt("Post content cannot be empty", "لا يمكن ترك محتوى المنشور فارغاً"));
      return;
    }
    try {
      setActionLoading(true);
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const payload = {
        content: newPostContent,
        platforms: selectedPlatforms,
        overrides: platformOverrides,
        status: postStatus,
        approvalStatus: postStatus === "Pending Approval" ? "Pending" : "Approved",
        scheduledAt: scheduledDateTime,
        imageUrl: postImage || undefined,
      };

      const res = await fetch("/api/social-media/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        toast(txt("Post scheduled.", "تم جدولة المنشور."), {
          action: {
            label: txt("View in Calendar", "عرض في التقويم"),
            onClick: () => setActiveTab("calendar"),
          },
        });
        setNewPostContent("");
        setPlatformOverrides({});
        setPostImage("");
      }
    } catch {
      toast.error(txt("Failed to schedule post", "فشل جدولة المنشور"));
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishNow = async (postId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/social-media/posts/publish/${postId}`, { method: "POST" });
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, status: "Published" } : p)));
        toast.success(txt("Post published immediately!", "تم النشر فوراً!"));
      }
    } catch {
      toast.error("Failed to publish");
    } finally {
      setActionLoading(false);
    }
  };

  // Inbox & Webhooks
  const handleSendInboxReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInboxItem || !replyText.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/social-media/inbox/${selectedInboxItem.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ replyText }),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedInbox = inbox.map((item) =>
          item.id === selectedInboxItem.id
            ? { ...item, replies: data.replies, status: "Resolved" as const }
            : item
        );
        setInbox(updatedInbox);
        setSelectedInboxItem({
          ...selectedInboxItem,
          replies: data.replies,
          status: "Resolved" as const,
        });
        setReplyText("");
        setSmartReplies([]);
        toast.success(txt("Reply submitted successfully", "تم إرسال الرد بنجاح"));
      }
    } catch {
      toast.error(txt("Failed to send reply", "فشل إرسال الرد"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuggestReplyWithAI = async () => {
    if (!selectedInboxItem) return;
    try {
      setIsSuggestingReply(true);
      const res = await fetch(`/api/social-media/inbox/${selectedInboxItem.id}/smart-reply`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setSmartReplies(data.replies || []);
        if (data.replies?.length > 0) {
          setReplyText(data.replies[0]);
        }
        toast.success(txt("AI generated suggestions", "تم استلام الاقتراحات"));
      }
    } catch {
      toast.error(txt("Failed to fetch AI reply recommendation", "فشل جلب اقتراح الرد الذكي"));
    } finally {
      setIsSuggestingReply(false);
    }
  };

  // Brand Listening
  const handleStartListening = async () => {
    if (!monitorKeyword) return;
    try {
      setIsListening(true);
      const res = await fetch("/api/social-media/monitoring/listen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: monitorKeyword }),
      });
      if (res.ok) {
        const newMentions = await res.json();
        setMonitoring((prev) => [...newMentions, ...prev]);
        toast.success(txt("Active listening collected new mentions.", "تم التقاط إشارات جديدة."));
      }
    } catch {
      toast.error("Failed to start listening stream");
    } finally {
      setIsListening(false);
    }
  };

  const handleBuildUTM = () => {
    if (!utmUrl) return;
    const finalUrl = new URL(utmUrl);
    if (utmSource) finalUrl.searchParams.set("utm_source", utmSource);
    if (utmCampaign) finalUrl.searchParams.set("utm_campaign", utmCampaign);
    // Normally we would save to /api/social-media/links and get a short link
    const short = `https://${window.location.host}/api/social-media/l/track-${Date.now().toString().slice(-4)}`;
    const appendedText = `\n\n${short}`;
    if (activePlatformTab === "Global") {
      setNewPostContent((prev) => prev + appendedText);
    } else {
      setPlatformOverrides((prev) => ({
        ...prev,
        [activePlatformTab]: (prev[activePlatformTab] || newPostContent) + appendedText,
      }));
    }
    toast.success(txt("Tracking link injected to post", "تم إدراج الرابط في المنشور"));
    setUtmUrl("");
    setUtmSource("");
    setUtmCampaign("");
  };

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-7xl font-sans text-slate-900 bg-slate-50 min-h-screen"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded bg-slate-800 text-white shadow-sm">
              {txt("OS CORE MODULE", "وحدة النظام الأساسية")}
            </span>
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest rounded border border-slate-300 text-slate-600 bg-white">
              v2.1.0
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950">
            {txt("Social Media Management", "إدارة شبكات التواصل")}
          </h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-sm leading-relaxed">
            {txt(
              "Unify your enterprise presence. Command intelligent workflows, actively monitor brand sentiment via Gemini 3.5 Flash, and orchestrate deep multi-platform scheduling.",
              "وحّد تواجد مؤسستك. أدر مسارات العمل الذكية، وراقب سمعة علامتك التجارية وتحليل المشاعر باستخدام Gemini 3.5، مع جدولة متقدمة للمنصات كافة."
            )}
          </p>
        </div>

        <button
          onClick={() => setActiveTab("scheduler")}
          className="flex items-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-sm rounded shadow-lg transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{txt("Smart Composer", "المنشئ الذكي")}</span>
        </button>
      </div>

      {/* CORE STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: txt("Total Reach", "الوصول الإجمالي"),
            value: "185.4K",
            icon: Globe,
            change: "+14.2%",
            positive: true,
          },
          {
            label: txt("Scheduled Queue", "طابور الجدولة"),
            value: posts.filter((p) => p.status === "Scheduled").length.toString(),
            icon: CalendarIcon,
            change: txt("Active", "نشط"),
            positive: true,
          },
          {
            label: txt("Unresolved Tickets", "التذاكر المفتوحة"),
            value: inbox.filter((i) => i.status === "Unresolved").length.toString(),
            icon: MessageSquare,
            change: txt("Action needed", "تحتاج مراجعة"),
            positive: false,
          },
          {
            label: txt("Avg. Engagement", "معدل التفاعل"),
            value: "4.8%",
            icon: TrendingUp,
            change: "+1.2%",
            positive: true,
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded p-5 shadow-sm">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                {stat.label}
              </span>
              <stat.icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tighter">
                {stat.value}
              </span>
              <span
                className={cn(
                  "text-xs font-bold font-mono",
                  stat.positive ? "text-green-600" : "text-amber-500"
                )}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-300 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide gap-8">
        {[
          { id: "scheduler", label: txt("Composer", "المنشئ"), icon: Plus },
          { id: "calendar", label: txt("Calendar", "التقويم"), icon: CalendarIcon },
          { id: "inbox", label: txt("Unified Inbox", "صندوق الوارد"), icon: MessageSquare },
          { id: "monitoring", label: txt("Active Listening", "الاستماع النشط"), icon: Activity },
          { id: "analytics", label: txt("Deep Analytics", "التحليلات العميقة"), icon: BarChart3 },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 pb-4 border-b-2 font-bold text-sm transition-all relative uppercase tracking-wider",
              activeTab === tab.id
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* ========================================================
                SCHEDULER & SMART COMPOSER
                ======================================================== */}
            {activeTab === "scheduler" && (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Editor Panel */}
                <div className="xl:col-span-7 bg-white border border-slate-200 rounded p-6 shadow-sm space-y-8">
                  {/* Channels */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      {txt("1. Select Platforms", "١. اختر المنصات")}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {["linkedin", "instagram", "twitter", "facebook"].map((plat) => {
                        const isSelected = selectedPlatforms.includes(plat);
                        const acc = accounts.find((a) => a.platform === plat);
                        const Icon = platformIcons[plat];

                        return (
                          <div key={plat} className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                if (isSelected)
                                  setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
                                else setSelectedPlatforms([...selectedPlatforms, plat]);
                              }}
                              className={cn(
                                "flex items-center gap-2 px-4 py-2.5 rounded text-sm font-bold border transition-all",
                                isSelected
                                  ? "bg-slate-900 border-slate-900 text-white"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {Icon && <Icon className="w-4 h-4" />}
                              <span className="capitalize">{plat === "twitter" ? "X" : plat}</span>
                            </button>
                            {acc ? (
                              <span className="text-[10px] text-green-600 font-mono flex items-center gap-1">
                                <Check className="w-3 h-3" /> Connected
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConnectProfile(plat)}
                                className="text-[10px] text-blue-600 hover:underline font-mono text-left"
                              >
                                Connect OAuth
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Smart Composer Area */}
                  <div>
                    <div className="flex justify-between items-end border-b border-slate-200 mb-4">
                      <div className="flex gap-4">
                        <button
                          onClick={() => setActivePlatformTab("Global")}
                          className={cn(
                            "pb-2 text-xs font-bold uppercase tracking-widest border-b-2",
                            activePlatformTab === "Global"
                              ? "border-slate-900 text-slate-900"
                              : "border-transparent text-slate-400"
                          )}
                        >
                          GLOBAL
                        </button>
                        {selectedPlatforms.map((p) => (
                          <button
                            key={p}
                            onClick={() => setActivePlatformTab(p)}
                            className={cn(
                              "pb-2 text-xs font-bold uppercase tracking-widest border-b-2",
                              activePlatformTab === p
                                ? "border-slate-900 text-slate-900"
                                : "border-transparent text-slate-400"
                            )}
                          >
                            {p} OVERRIDE
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      rows={6}
                      value={currentComposerText}
                      onChange={(e) => handleComposerTextChange(e.target.value)}
                      placeholder={txt("Write your content...", "اكتب محتوى المنشور...")}
                      className="w-full px-4 py-3 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 focus:border-slate-900 text-sm font-medium bg-slate-50"
                    />
                    <div className="flex justify-between items-center mt-2 text-[10px] font-mono text-slate-500">
                      <span>{currentComposerText.length} CHARS</span>
                      <span>
                        {activePlatformTab === "twitter" && currentComposerText.length > 280 ? (
                          <span className="text-red-500 font-bold">OVER LIMIT (280)</span>
                        ) : (
                          "GOOD"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Media Uploader */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                      {txt("Media Engine", "محرك الوسائط")}
                    </label>
                    <div className="flex gap-4 mb-3">
                      {["1:1", "16:9", "9:16"].map((ratio) => (
                        <button
                          key={ratio}
                          onClick={() => setAspectRatio(ratio as any)}
                          className={cn(
                            "px-3 py-1 border text-xs font-mono font-bold rounded",
                            aspectRatio === ratio ? "bg-slate-900 text-white" : "text-slate-500"
                          )}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                      placeholder="Paste Image URL..."
                      className="w-full px-4 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-slate-900 text-sm font-mono mb-2"
                    />
                  </div>

                  {/* UTM Link Builder */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded">
                    <div className="flex items-center gap-2 mb-3">
                      <LinkIcon className="w-4 h-4 text-slate-500" />
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                        Attribution UTM Builder
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="url"
                        value={utmUrl}
                        onChange={(e) => setUtmUrl(e.target.value)}
                        placeholder="Destination URL"
                        className="col-span-3 px-3 py-2 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        placeholder="utm_source (e.g. twitter)"
                        className="px-3 py-2 border rounded text-xs"
                      />
                      <input
                        type="text"
                        value={utmCampaign}
                        onChange={(e) => setUtmCampaign(e.target.value)}
                        placeholder="utm_campaign"
                        className="px-3 py-2 border rounded text-xs"
                      />
                      <button
                        onClick={handleBuildUTM}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded"
                      >
                        Generate & Append
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="px-3 py-2 border rounded text-xs font-bold"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="px-3 py-2 border rounded text-xs font-bold"
                      />
                    </div>
                    <button
                      onClick={handleCreatePost}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded px-4 py-2 text-sm uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Clock className="w-4 h-4" /> Schedule Post
                    </button>
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="xl:col-span-5">
                  <div className="sticky top-8">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Eye className="w-4 h-4" /> Live Platform Preview
                    </h3>

                    {/* Interactive visual mockup */}
                    <div className="bg-white border border-slate-200 rounded overflow-hidden shadow-xl max-w-sm mx-auto">
                      <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex-shrink-0">
                          <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"
                            className="w-full h-full rounded-full object-cover"
                            alt="avatar"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">Madarij OS Corporate</p>
                          <p className="text-[10px] text-slate-500">
                            Sponsored • {activePlatformTab}
                          </p>
                        </div>
                      </div>
                      <div className="p-4 text-sm text-slate-800 whitespace-pre-wrap font-sans">
                        {currentComposerText || "Your captivating copy goes here..."}
                      </div>
                      {postImage && (
                        <div
                          className={cn(
                            "w-full bg-slate-100",
                            aspectRatio === "1:1"
                              ? "aspect-square"
                              : aspectRatio === "16:9"
                                ? "aspect-video"
                                : "aspect-[9/16]"
                          )}
                        >
                          <img
                            src={postImage}
                            className="w-full h-full object-cover"
                            alt="Preview"
                          />
                        </div>
                      )}
                      <div className="px-4 py-3 border-t border-slate-100 flex justify-between text-slate-400">
                        <span className="text-xs">Like</span>
                        <span className="text-xs">Comment</span>
                        <span className="text-xs">Share</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                CALENDAR
                ======================================================== */}
            {activeTab === "calendar" && (
              <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                <div className="flex justify-between items-end border-b border-slate-200 pb-4 mb-6">
                  <h2 className="text-2xl font-black text-slate-900">Publishing Timeline</h2>
                </div>

                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="flex gap-6 items-start group">
                      <div className="w-32 flex-shrink-0 text-right pt-2 border-r-2 border-slate-100 pr-6 group-hover:border-slate-900 transition-colors">
                        <p className="font-bold text-sm text-slate-900">
                          {new Date(post.scheduledAt).toLocaleDateString()}
                        </p>
                        <p className="font-mono text-xs text-slate-500">
                          {new Date(post.scheduledAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <div className="flex-1 bg-slate-50 border border-slate-200 rounded p-4 group-hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex gap-2">
                            {post.platforms.map((p) => {
                              const Icon = platformIcons[p];
                              return Icon ? (
                                <div key={p} className="p-1.5 bg-white border rounded">
                                  <Icon className="w-4 h-4 text-slate-700" />
                                </div>
                              ) : null;
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded",
                                post.status === "Published"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-amber-100 text-amber-700"
                              )}
                            >
                              {post.status}
                            </span>
                            {post.status !== "Published" && (
                              <button
                                onClick={() => handlePublishNow(post.id)}
                                className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase rounded"
                              >
                                Publish Now
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-700">{post.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                UNIFIED INBOX (WEBHOOKS)
                ======================================================== */}
            {activeTab === "inbox" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-[700px]">
                <div className="md:col-span-4 border border-slate-200 rounded bg-white overflow-y-auto">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 sticky top-0">
                    <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">
                      Active Tickets
                    </h3>
                  </div>
                  {inbox.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedInboxItem(item);
                        setSmartReplies([]);
                      }}
                      className={cn(
                        "w-full text-left p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors",
                        selectedInboxItem?.id === item.id
                          ? "bg-indigo-50 border-l-4 border-l-indigo-600"
                          : ""
                      )}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">
                            {item.authorName}
                          </span>
                          <span className="text-[10px] uppercase font-mono text-slate-500">
                            {item.platform}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 truncate">{item.message}</p>
                      <div className="mt-2">
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                            item.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          )}
                        >
                          {item.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="md:col-span-8 border border-slate-200 rounded bg-white flex flex-col relative">
                  {selectedInboxItem ? (
                    <>
                      <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-start">
                        <div className="flex gap-4">
                          <img
                            src={selectedInboxItem.authorAvatar}
                            alt="avatar"
                            className="w-12 h-12 rounded shadow-sm"
                          />
                          <div>
                            <h2 className="text-lg font-black text-slate-900">
                              {selectedInboxItem.authorName}
                            </h2>
                            <p className="text-xs text-slate-500 font-mono uppercase">
                              {selectedInboxItem.platform} • {selectedInboxItem.type}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50">
                        {/* Original message */}
                        <div className="flex flex-col items-start max-w-[80%]">
                          <div className="bg-white border border-slate-200 p-4 rounded-xl rounded-tl-none shadow-sm text-sm text-slate-800">
                            {selectedInboxItem.message}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono mt-1">
                            {new Date(selectedInboxItem.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Replies */}
                        {selectedInboxItem.replies.map((r, i) => (
                          <div key={i} className="flex flex-col items-end w-full">
                            <div className="bg-indigo-600 text-white p-4 rounded-xl rounded-tr-none shadow-sm text-sm max-w-[80%]">
                              {r.text}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono mt-1">
                              {r.author} • {new Date(r.timestamp).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Reply Box */}
                      <div className="p-4 border-t border-slate-200 bg-white">
                        {smartReplies.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1 w-full">
                              <Sparkles className="w-3 h-3 text-amber-500" /> Gemini Suggestions
                            </span>
                            {smartReplies.map((sr, i) => (
                              <button
                                key={i}
                                onClick={() => setReplyText(sr)}
                                className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 text-left border border-slate-200"
                              >
                                {sr}
                              </button>
                            ))}
                          </div>
                        )}
                        <form onSubmit={handleSendInboxReply} className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSuggestReplyWithAI}
                            disabled={isSuggestingReply}
                            className="px-3 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 rounded flex items-center justify-center transition-colors"
                          >
                            {isSuggestingReply ? (
                              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                          </button>
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type reply or generate with AI..."
                            className="flex-1 px-4 py-3 border border-slate-200 rounded text-sm focus:border-indigo-600 outline-none"
                          />
                          <button
                            type="submit"
                            disabled={actionLoading}
                            className="px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm uppercase tracking-widest rounded transition-colors"
                          >
                            Send
                          </button>
                        </form>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 font-mono text-sm uppercase tracking-widest">
                      Select a ticket
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                ACTIVE LISTENING & SENTIMENT
                ======================================================== */}
            {activeTab === "monitoring" && (
              <div className="space-y-6">
                <div className="bg-slate-950 rounded p-8 text-white flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl">
                  <div>
                    <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                      <Activity className="text-green-400 animate-pulse" /> Global Brand Stream
                    </h2>
                    <p className="text-slate-400 text-sm max-w-lg">
                      Powered by Gemini 3.5 Flash. Continuously monitor open-web sources, analyze
                      sentiment, and extract actionable competitive entities.
                    </p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      value={monitorKeyword}
                      onChange={(e) => setMonitorKeyword(e.target.value)}
                      placeholder="Keyword e.g., Madarij"
                      className="px-4 py-3 rounded text-slate-900 font-bold focus:outline-none"
                    />
                    <button
                      onClick={handleStartListening}
                      disabled={isListening}
                      className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded font-bold uppercase tracking-widest text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      {isListening ? "Listening..." : "Start Engine"}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {monitoring.map((m) => (
                    <div
                      key={m.id}
                      className="bg-white border border-slate-200 rounded p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">
                            {m.source}
                          </span>
                          <span
                            className={cn(
                              "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded",
                              m.sentiment === "Positive"
                                ? "bg-green-100 text-green-700"
                                : m.sentiment === "Negative"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {m.sentiment}
                          </span>
                        </div>
                        <p className="font-bold text-sm text-slate-900 mb-2">{m.author}</p>
                        <p className="text-sm text-slate-600">{m.text}</p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        {m.entities && m.entities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {m.entities.map((e, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-mono rounded"
                              >
                                Entity: {e}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] font-mono text-slate-400">
                          Reach: {m.reach.toLocaleString()} • Priority: {m.urgency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================
                ANALYTICS
                ======================================================== */}
            {activeTab === "analytics" && (
              <div className="bg-white border border-slate-200 rounded p-6 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900 mb-6">
                  Cross-Channel Attribution & Growth
                </h2>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dy={10}
                      />
                      <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dx={-10}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#64748b" }}
                        dx={10}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "8px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="reach"
                        stroke="#0f172a"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="engagement"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#4f46e5", strokeWidth: 2, stroke: "#fff" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
