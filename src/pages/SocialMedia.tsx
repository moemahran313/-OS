import React, { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  MessageSquare,
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
  Share2,
  HelpCircle,
  Activity,
  FileText,
  Video,
  Globe,
  Linkedin,
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  AtSign,
  Ghost,
  Search,
  MessageCircle,
  Layers,
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
  metrics?: {
    reach: number;
    engagement: number;
    clicks: number;
    shares: number;
  };
}

interface InboxItem {
  id: string;
  platform: string;
  authorName: string;
  authorAvatar: string;
  message: string;
  timestamp: string;
  status: "Read" | "Unread" | "Replied";
  type: "Comment" | "Mention" | "Direct Message";
  postTitle?: string;
  replies: Array<{
    author: string;
    text: string;
    timestamp: string;
  }>;
}

interface BrandMention {
  id: string;
  source: string;
  author: string;
  text: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  keyword: string;
  reach: number;
  createdAt: string;
}

export default function SocialMedia() {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  // Translation Helper
  const txt = (en: string, ar: string) => (isAr ? ar : en);

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "calendar" | "scheduler" | "ai" | "inbox" | "monitoring" | "competitors"
  >("calendar");

  // Loading States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Data States
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [inbox, setInbox] = useState<InboxItem[]>([]);
  const [monitoring, setMonitoring] = useState<BrandMention[]>([]);

  // Composer / Scheduler State
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["linkedin"]);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("10:00");
  const [postImage, setPostImage] = useState("");
  const [postStatus, setPostStatus] = useState<"Draft" | "Pending Approval" | "Scheduled">(
    "Scheduled"
  );

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiType, setAiType] = useState<"post" | "reels_script" | "caption">("post");
  const [aiTone, setAiTone] = useState("professional");
  const [aiLang, setAiLang] = useState(isAr ? "ar" : "en");
  const [aiResult, setAiResult] = useState<any>(null);

  // Unified Inbox State
  const [selectedInboxItem, setSelectedInboxItem] = useState<InboxItem | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSuggestingReply, setIsSuggestingReply] = useState(false);

  // Competitor Tracking State
  const [competitors, setCompetitors] = useState([
    { name: txt("Competitor A", "المنافس أ"), followers: 45000, engagement: 3.2, frequency: 12 },
    { name: txt("Competitor B", "المنافس ب"), followers: 68000, engagement: 2.1, frequency: 18 },
    {
      name: txt("Madarij OS (Us)", "مداريج (نحن)"),
      followers: 115900,
      engagement: 4.8,
      frequency: 22,
    },
  ]);
  const [newCompetitorName, setNewCompetitorName] = useState("");

  // Post Preview Modal
  const [selectedPreviewPost, setSelectedPreviewPost] = useState<SocialPost | null>(null);

  // Mock platforms map
  const platformIcons: { [key: string]: any } = {
    linkedin: Linkedin,
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
    tiktok: Video,
    youtube: Youtube,
    threads: AtSign,
    pinterest: PinIcon,
    snapchat: Ghost,
  };

  function PinIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="12" x2="12" y1="17" y2="22" />
        <path d="M5 17h14v-1.76a2 2 0 0 0-.44-1.24l-2.12-2.65A2 2 0 0 1 16 10.11V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v5.11a2 2 0 0 1-.44 1.24L5.44 14a2 2 0 0 0-.44 1.24Z" />
      </svg>
    );
  }

  // Set default scheduled date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchData();
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

  // Connect a new profile
  const handleConnectProfile = async (platform: string, handle: string, name: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/social-media/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, handle, name }),
      });
      if (res.ok) {
        const newAcc = await res.json();
        setAccounts((prev) => [...prev, newAcc]);
        toast.success(
          txt(`Successfully connected ${platform} account!`, `تم ربط حساب ${platform} بنجاح!`)
        );
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to connect account", "فشل ربط الحساب"));
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Post Creator
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) {
      toast.error(txt("Post content cannot be empty", "لا يمكن ترك محتوى المنشور فارغاً"));
      return;
    }
    try {
      setActionLoading(true);
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const payload = {
        content: newPostContent,
        platforms: selectedPlatforms,
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
        toast.success(txt("Social post scheduled successfully!", "تم جدولة المنشور بنجاح!"));
        // Clear composer state
        setNewPostContent("");
        setPostImage("");
        setActiveTab("calendar");
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to schedule post", "فشل جدولة المنشور"));
    } finally {
      setActionLoading(false);
    }
  };

  // Approve a post
  const handleApprovePost = async (postId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/social-media/posts/${postId}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, approvalStatus: "Approved", status: "Scheduled" } : p
          )
        );
        toast.success(txt("Post approved successfully!", "تمت الموافقة على المنشور بنجاح!"));
        setSelectedPreviewPost(null);
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to approve post", "فشل اعتماد المنشور"));
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel / Delete scheduled post
  const handleDeletePost = async (postId: string) => {
    if (
      !confirm(
        txt(
          "Are you sure you want to cancel this scheduled post?",
          "هل أنت متأكد من إلغاء جدولة هذا المنشور؟"
        )
      )
    )
      return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/social-media/posts/${postId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        toast.success(txt("Scheduled post deleted successfully", "تم حذف المنشور المجدول بنجاح"));
        setSelectedPreviewPost(null);
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to delete post", "فشل حذف المنشور"));
    } finally {
      setActionLoading(false);
    }
  };

  // Generate AI Copilot Content
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error(txt("Please provide a prompt/topic", "يرجى كتابة فكرة أو موضوع للمنشور"));
      return;
    }
    try {
      setActionLoading(true);
      setAiResult(null);
      const res = await fetch("/api/social-media/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: aiType,
          platform: selectedPlatforms[0] || "linkedin",
          promptText: aiPrompt,
          tone: aiTone,
          language: aiLang,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        toast.success(
          txt(
            "AI Copilot generated amazing content!",
            "قام مساعد الذكاء الاصطناعي بتوليد المحتوى بنجاح!"
          )
        );
      } else {
        const errData = await res.json();
        toast.error(
          errData.error || txt("AI generation failed", "فشل توليد المحتوى بالذكاء الاصطناعي")
        );
      }
    } catch {
      toast.error(
        txt("Network error during AI generation", "خطأ في الشبكة أثناء توليد الذكاء الاصطناعي")
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Reply in Inbox
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
        // Update local item
        const updatedInbox = inbox.map((item) =>
          item.id === selectedInboxItem.id
            ? { ...item, replies: data.replies, status: "Replied" as const }
            : item
        );
        setInbox(updatedInbox);
        setSelectedInboxItem({
          ...selectedInboxItem,
          replies: data.replies,
          status: "Replied" as const,
        });
        setReplyText("");
        toast.success(txt("Reply submitted successfully", "تم إرسال الرد بنجاح"));
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to send reply", "فشل إرسال الرد"));
    } finally {
      setActionLoading(false);
    }
  };

  // Use AI to suggest reply
  const handleSuggestReplyWithAI = async () => {
    if (!selectedInboxItem) return;
    try {
      setIsSuggestingReply(true);
      const res = await fetch("/api/social-media/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "caption",
          promptText: `Suggest a professional, friendly response to this user comment: "${selectedInboxItem.message}" on social media. Build on our branding as Madarij OS.`,
          tone: "friendly & professional",
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplyText(data.optimizedText || "");
        toast.success(
          txt("AI generated a response recommendation", "اقترح الذكاء الاصطناعي رداً مناسباً")
        );
      } else {
        throw new Error();
      }
    } catch {
      toast.error(txt("Failed to fetch AI reply recommendation", "فشل جلب اقتراح الرد الذكي"));
    } finally {
      setIsSuggestingReply(false);
    }
  };

  // Competitor form submission
  const handleAddCompetitor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompetitorName.trim()) return;
    setCompetitors([
      ...competitors,
      {
        name: newCompetitorName,
        followers: Math.round(Math.random() * 80000 + 10000),
        engagement: parseFloat((Math.random() * 3 + 1).toFixed(1)),
        frequency: Math.round(Math.random() * 15 + 5),
      },
    ]);
    setNewCompetitorName("");
    toast.success(txt("Competitor added for monitoring", "تم إضافة المنافس للمراقبة"));
  };

  // Helper to render calendar grid (Current Month July 2026)
  const renderCalendarDays = () => {
    // Current date state corresponds to July 2026 (as in metadata)
    const year = 2026;
    const month = 6; // July is index 6
    const firstDayIndex = 3; // July 1st, 2026 is Wednesday (index 3 if Sunday is 0)
    const totalDays = 31;

    const days = [];
    // Blank days
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <div key={`empty-${i}`} className="bg-slate-50 border border-slate-100 min-h-[100px]" />
      );
    }

    // Days with posts
    for (let d = 1; d <= totalDays; d++) {
      const dateString = `${year}-07-${String(d).padStart(2, "0")}`;
      const matchingPosts = posts.filter((p) => p.scheduledAt.startsWith(dateString));

      days.push(
        <div
          key={`day-${d}`}
          className="bg-white border border-slate-200 p-2 min-h-[110px] flex flex-col justify-between hover:shadow-sm transition-all group relative"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 group-hover:text-indigo-600 transition-colors">
              {d}
            </span>
            {matchingPosts.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            )}
          </div>
          <div className="flex-1 flex flex-col gap-1 mt-1 justify-end">
            {matchingPosts.map((post) => (
              <div
                key={post.id}
                onClick={() => setSelectedPreviewPost(post)}
                className={cn(
                  "text-[10px] p-1 rounded truncate cursor-pointer font-medium select-none transition-colors border",
                  post.approvalStatus === "Pending"
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : post.status === "Published"
                      ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                )}
              >
                <div className="flex items-center gap-1">
                  {post.platforms.map((p) => {
                    const Icon = platformIcons[p];
                    return Icon ? <Icon key={p} className="w-2.5 h-2.5 inline-block" /> : null;
                  })}
                  <span>{post.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div
      className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in text-slate-900"
      style={{ direction: isAr ? "rtl" : "ltr" }}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
              {txt("Enterprise Suite", "جناح المؤسسات")}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mt-2">
            {txt("Social Media & Growth Platform", "إدارة شبكات التواصل والنمو")}
          </h1>
          <p className="text-slate-500 mt-1">
            {txt(
              "Schedule, write with AI, track competitors, and monitor your brand authority across all major channels.",
              "خطط، اكتب بالذكاء الاصطناعي، راقب المنافسين، وتفاعل مع الجمهور عبر قنوات التواصل كافة."
            )}
          </p>
        </div>

        <button
          onClick={() => {
            setActiveTab("scheduler");
            setNewPostContent("");
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{txt("Composer", "منشئ المنشورات")}</span>
        </button>
      </div>

      {/* CHANNELS QUICK SLIDER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            {txt("Connected Social Channels", "القنوات والمنصات المرتبطة")}
          </h2>
          <span className="text-xs text-slate-400">
            {txt("Manage connected workspace profiles", "إدارة الحسابات المرتبطة بمساحة العمل")}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {[
            "linkedin",
            "instagram",
            "twitter",
            "facebook",
            "tiktok",
            "youtube",
            "threads",
            "pinterest",
          ].map((plat) => {
            const acc = accounts.find((a) => a.platform === plat);
            const Icon = platformIcons[plat];
            const isConnected = !!acc;

            return (
              <div
                key={plat}
                className={cn(
                  "p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all",
                  isConnected
                    ? "bg-slate-50/50 border-slate-200"
                    : "bg-white border-dashed border-slate-200 opacity-60 hover:opacity-100"
                )}
              >
                <div className="relative">
                  {Icon && (
                    <Icon
                      className={cn("w-6 h-6", isConnected ? "text-slate-800" : "text-slate-400")}
                    />
                  )}
                  {isConnected && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-xs font-semibold block capitalize text-slate-800">
                    {plat === "twitter" ? "X / Twitter" : plat}
                  </span>
                  <span className="text-[10px] text-slate-400 block truncate max-w-[100px]">
                    {isConnected ? acc.handle : txt("Disconnected", "غير متصل")}
                  </span>
                </div>
                {isConnected ? (
                  <span className="text-[10px] mt-2 font-medium bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                    {acc.followers.toLocaleString()} {txt("followers", "متابع")}
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      handleConnectProfile(plat, `@madarij_${plat}`, `Madarij ${plat}`)
                    }
                    className="mt-2 text-[10px] text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    + {txt("Connect", "ربط")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CORE STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: txt("Total Reach (GCC)", "الوصول الإجمالي (الخليج)"),
            value: "185.4K",
            icon: Globe,
            change: "+14.2%",
            positive: true,
          },
          {
            label: txt("Active Scheduled Posts", "المنشورات المجدولة النشطة"),
            value: posts.filter((p) => p.status === "Scheduled").length.toString(),
            icon: CalendarIcon,
            change: txt("Next post tomorrow", "التالي غداً"),
            positive: true,
          },
          {
            label: txt("Inbox Pending Reviews", "مراجعات وارد الصندوق"),
            value: inbox.filter((i) => i.status === "Unread").length.toString(),
            icon: MessageSquare,
            change: txt("Needs attention", "تحتاج مراجعة"),
            positive: false,
          },
          {
            label: txt("Avg. Engagement Rate", "معدل التفاعل الإجمالي"),
            value: "4.8%",
            icon: TrendingUp,
            change: "+1.2%",
            positive: true,
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="p-2 bg-slate-50 rounded-xl">
                <stat.icon className="w-5 h-5 text-indigo-600" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-950">{stat.value}</span>
              <span
                className={cn(
                  "text-xs font-bold",
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
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { id: "calendar", label: txt("Content Calendar", "تقويم المحتوى"), icon: CalendarIcon },
          { id: "scheduler", label: txt("Scheduler & Composer", "جدولة المنشورات"), icon: Clock },
          { id: "ai", label: txt("AI Copilot & Writer", "مساعد الذكاء الاصطناعي"), icon: Sparkles },
          {
            id: "inbox",
            label: txt("Unified Comments Inbox", "صندوق الوارد الموحد"),
            icon: MessageSquare,
          },
          {
            id: "monitoring",
            label: txt("Brand Mentions", "مراقبة الإشارات والسمعة"),
            icon: Activity,
          },
          {
            id: "competitors",
            label: txt("Competitors Tracking", "مراقبة المنافسين"),
            icon: BarChart3,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 border-b-2 font-semibold text-sm transition-all relative",
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT OUTLET */}
      <AnimatePresence mode="wait">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-200 rounded-2xl">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm mt-4 font-medium">
              {txt("Loading dynamic social feeds...", "جاري تحميل بيانات شبكات التواصل...")}
            </p>
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
                CALENDAR TAB
                ======================================================== */}
            {activeTab === "calendar" && (
              <div className="space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        {txt("July 2026 Calendar", "تقويم شهر يوليو ٢٠٢٦")}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {txt(
                          "Interact with dates or scheduled items below.",
                          "اضغط على الأيام لتفقد أو تعديل المنشورات المجدولة."
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {txt("Published", "تم النشر")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        {txt("Approved / Scheduled", "معتمد ومجدول")}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {txt("Pending Approval", "قيد المراجعة")}
                      </span>
                    </div>
                  </div>

                  {/* Calendar Grid Header */}
                  <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-500 text-xs mb-2 uppercase tracking-wider">
                    <div>{txt("Sun", "أحد")}</div>
                    <div>{txt("Mon", "اثنين")}</div>
                    <div>{txt("Tue", "ثلاثاء")}</div>
                    <div>{txt("Wed", "أربعاء")}</div>
                    <div>{txt("Thu", "خميس")}</div>
                    <div>{txt("Fri", "جمعة")}</div>
                    <div>{txt("Sat", "سبت")}</div>
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7 gap-1.5 bg-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                    {renderCalendarDays()}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                SCHEDULER & COMPOSER
                ======================================================== */}
            {activeTab === "scheduler" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Editor Panel */}
                <form
                  onSubmit={handleCreatePost}
                  className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6"
                >
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {txt("Compose Social Campaign", "إنشاء حملة تواصل")}
                  </h3>

                  {/* Channel Select */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {txt("Target Channels (Select Multiple)", "القنوات المستهدفة (تحديد متعدد)")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["linkedin", "instagram", "twitter", "facebook", "tiktok", "youtube"].map(
                        (plat) => {
                          const isSelected = selectedPlatforms.includes(plat);
                          const Icon = platformIcons[plat];
                          return (
                            <button
                              type="button"
                              key={plat}
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedPlatforms(selectedPlatforms.filter((p) => p !== plat));
                                } else {
                                  setSelectedPlatforms([...selectedPlatforms, plat]);
                                }
                              }}
                              className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all",
                                isSelected
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                              )}
                            >
                              {Icon && <Icon className="w-3.5 h-3.5" />}
                              <span className="capitalize">{plat === "twitter" ? "X" : plat}</span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Content input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {txt("Post Content Copy", "محتوى ونص المنشور")}
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewPostContent(
                            txt(
                              "We are happy to offer the best-integrated Saudi payroll & HR operations! Secure, compliant with local rules, and 100% cloud native.",
                              "يسرنا تقديم الحلول الأكثر تكاملاً لحساب الرواتب والموارد البشرية في المملكة! آمن، متوافق مع نظام العمل السعودي وسحابي بالكامل."
                            )
                          );
                        }}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{txt("Load Template", "تحميل مسودة")}</span>
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={txt(
                        "What would you like to share on corporate social media?",
                        "ما الذي تود طرحه على قنوات التواصل الخاصة بالمؤسسة؟"
                      )}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                    <div className="flex justify-between items-center mt-1 text-xs text-slate-400">
                      <span>
                        {newPostContent.length} {txt("characters", "حرف")}
                      </span>
                      <span>
                        {txt(
                          "Recommended: <280 for X, <3000 for LinkedIn",
                          "الموصى به: أقل من ٢٨٠ لـ X، ٣٠٠٠ للينكد إن"
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Graphic illustration */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {txt("Graphic Link / Asset URL", "رابط الصورة / أصل التصميم")}
                    </label>
                    <input
                      type="text"
                      value={postImage}
                      onChange={(e) => setPostImage(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                    <div className="flex gap-2 mt-2">
                      {[
                        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
                        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
                      ].map((preset, i) => (
                        <button
                          type="button"
                          key={i}
                          onClick={() => setPostImage(preset)}
                          className="w-14 h-10 border border-slate-200 rounded overflow-hidden opacity-80 hover:opacity-100"
                        >
                          <img src={preset} className="w-full h-full object-cover" alt="" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Workflow approvals & date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {txt("Post Setting / Workflow", "إعدادات النشر ومسار العمل")}
                      </label>
                      <select
                        value={postStatus}
                        onChange={(e) => setPostStatus(e.target.value as any)}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-white"
                      >
                        <option value="Scheduled">
                          {txt("Schedule & Publish Directly", "جدولة ونشر مباشر")}
                        </option>
                        <option value="Pending Approval">
                          {txt("Submit for Team Lead Approval", "إرسال لاعتماد قائد الفريق")}
                        </option>
                        <option value="Draft">
                          {txt("Save as Internal Draft", "حفظ كمسودة داخلية")}
                        </option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {txt("Date", "التاريخ")}
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          {txt("Time AST", "الوقت AST")}
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm flex items-center gap-2"
                    >
                      {actionLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      <span>
                        {postStatus === "Pending Approval"
                          ? txt("Submit to Approver", "تقديم للمراجعة")
                          : txt("Schedule Post Campaign", "جدولة الحملة الآن")}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Platform Preview Mockup Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-slate-500" />
                      {txt("Live Multi-Platform Mockup", "معاينة المنصات التفاعلية")}
                    </h4>

                    {/* Tabs within Mockup */}
                    <div className="flex gap-2 mb-4 bg-white p-1 rounded-xl border border-slate-200">
                      {["linkedin", "instagram"].map((tab) => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => {
                            if (!selectedPlatforms.includes(tab)) {
                              setSelectedPlatforms([...selectedPlatforms, tab]);
                            }
                          }}
                          className={cn(
                            "flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all",
                            selectedPlatforms.includes(tab)
                              ? "bg-slate-900 text-white"
                              : "text-slate-500 hover:text-slate-800"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    {/* Mockup Frame */}
                    {selectedPlatforms.includes("linkedin") && (
                      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                          <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150"
                            className="w-10 h-10 rounded-full object-cover border"
                            alt=""
                          />
                          <div>
                            <span className="text-xs font-extrabold text-slate-950 block">
                              Madarij OS Corporate
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              12,500 followers • 1h ago
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed mb-3">
                          {newPostContent ||
                            txt(
                              "Drafting social post... Content copy will instantly render here in real-time.",
                              "اكتب منشوراً ترويجياً... وسيتم تحديث نص المعاينة فوراً."
                            )}
                        </p>
                        {postImage && (
                          <div className="border border-slate-100 rounded-lg overflow-hidden mb-3">
                            <img
                              src={postImage}
                              className="w-full max-h-52 object-cover"
                              alt="Campaign Graphic"
                            />
                          </div>
                        )}
                        <div className="border-t border-slate-100 pt-2 flex justify-between text-slate-400 text-xs">
                          <span>👍 Like</span>
                          <span>💬 Comment</span>
                          <span>🔁 Repost</span>
                          <span>📤 Send</span>
                        </div>
                      </div>
                    )}

                    {!selectedPlatforms.includes("linkedin") &&
                      selectedPlatforms.includes("instagram") && (
                        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm max-w-[340px] mx-auto">
                          <div className="flex items-center gap-2 mb-3">
                            <img
                              src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150"
                              className="w-8 h-8 rounded-full object-cover border"
                              alt=""
                            />
                            <span className="text-xs font-extrabold text-slate-950">
                              madarij_os
                            </span>
                          </div>
                          <div className="bg-slate-100 border border-slate-200 rounded-lg aspect-square overflow-hidden mb-3 flex items-center justify-center">
                            {postImage ? (
                              <img src={postImage} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="text-center text-slate-400 p-4">
                                <Layers className="w-8 h-8 mx-auto mb-1 opacity-50" />
                                <span className="text-[10px]">
                                  {txt(
                                    "Upload or select graphic representation",
                                    "اختر صورة للمنشور للمعالجة"
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-slate-800 line-clamp-3">
                            <span className="font-extrabold mr-1">madarij_os</span>
                            {newPostContent || txt("Write caption...", "محتوى المنشور...")}
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                AI ASSISTANT
                ======================================================== */}
            {activeTab === "ai" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Inputs Panel */}
                <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
                      {txt("Gemini Social AI Copywriter", "محرر الذكاء الاصطناعي من Gemini")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {txt(
                        "Generate viral posts, caption hooks, video/reel scripts, translations and strategic schedules.",
                        "صمم منشورات فيروسية، خطاطيف فيديو، نصوص Reels، ترجمات فورية وجداول نشر ممتازة."
                      )}
                    </p>
                  </div>

                  {/* Template Types */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "post", label: txt("Viral Post", "منشور فيروسي"), desc: "LinkedIn/X" },
                      {
                        id: "reels_script",
                        label: txt("Reels / Short", "فيديو Reels"),
                        desc: "TikTok/Insta",
                      },
                      { id: "caption", label: txt("Smart Caption", "شرح ذكي"), desc: "General" },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setAiType(type.id as any)}
                        className={cn(
                          "p-3 rounded-xl border text-center transition-all",
                          aiType === type.id
                            ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-extrabold"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        <span className="text-xs block font-bold">{type.label}</span>
                        <span className="text-[10px] text-slate-400 block">{type.desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* Core Idea Prompt */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {txt("Describe Campaign Goal / Concept", "صِف فكرة المنشور أو هدف الحملة")}
                    </label>
                    <textarea
                      rows={4}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder={txt(
                        "e.g. Announcing our 24/7 dedicated Arabic client support for enterprise operations in Saudi Arabia.",
                        "مثال: الإعلان عن إطلاق الدعم الفني باللغة العربية طوال أيام الأسبوع لعملائنا في السعودية."
                      )}
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  {/* Tone and Language parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {txt("Desired Tone", "نبرة الصوت")}
                      </label>
                      <select
                        value={aiTone}
                        onChange={(e) => setAiTone(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      >
                        <option value="professional">
                          {txt("Professional & Trustworthy", "مهني وموثوق")}
                        </option>
                        <option value="inspiring">
                          {txt("Inspiring & Visionary", "ملهم وطموح")}
                        </option>
                        <option value="energetic">
                          {txt("Energetic & Creative", "نشط ومبدع")}
                        </option>
                        <option value="analytical">
                          {txt("Data-driven & Analytical", "تحليلي قائم على البيانات")}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {txt("Target Language", "لغة المحتوى")}
                      </label>
                      <select
                        value={aiLang}
                        onChange={(e) => setAiLang(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white"
                      >
                        <option value="ar">{txt("Arabic (العربية)", "العربية")}</option>
                        <option value="en">{txt("English (الإنجليزية)", "الإنجليزية")}</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleAIGenerate}
                    disabled={actionLoading}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    {actionLoading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    <span>
                      {txt("Write Social Content with Gemini", "صياغة المحتوى بالذكاء الاصطناعي")}
                    </span>
                  </button>
                </div>

                {/* Response Visual Panel */}
                <div className="lg:col-span-6 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {txt("Copilot Output", "مخرجات الذكاء الاصطناعي")}
                    </h4>

                    {aiResult ? (
                      <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-fade-in">
                        {aiType === "post" && (
                          <>
                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                                {txt("Generated Post Body", "نص المنشور المكتوب")}
                              </span>
                              <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed mt-1">
                                {aiResult.postContent}
                              </p>
                            </div>

                            {aiResult.hashtags && (
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {aiResult.hashtags.map((h: string, idx: number) => (
                                  <span
                                    key={idx}
                                    className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded"
                                  >
                                    #{h}
                                  </span>
                                ))}
                              </div>
                            )}

                            {aiResult.optimalSendTime && (
                              <div className="mt-4 p-2.5 bg-slate-50 rounded-lg flex items-center gap-2 text-xs text-slate-600">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>
                                  <strong>
                                    {txt("Recommended Time: ", "التوقيت الموصى به: ")}
                                  </strong>
                                  {aiResult.optimalSendTime}
                                </span>
                              </div>
                            )}
                          </>
                        )}

                        {aiType === "reels_script" && (
                          <div className="space-y-4">
                            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-xs">
                              <strong>
                                {txt("Retention Hook: ", "خطاف الفيديو الأول (Hook): ")}
                              </strong>
                              <p className="text-slate-800 mt-1 italic">"{aiResult.hook}"</p>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">
                                {txt("Timeline Breakdown", "تفصيل المشاهد والسيناريو")}
                              </span>
                              <div className="space-y-2.5 border-l-2 border-indigo-100 pl-4">
                                {aiResult.sceneOutline?.map((scene: any, i: number) => (
                                  <div key={i} className="text-xs">
                                    <span className="font-bold text-indigo-600">{scene.time}</span>
                                    <p className="text-slate-900 font-semibold mt-0.5">
                                      {scene.audio}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {txt("Visual Cue: ", "المشهد البصري: ")} {scene.visual}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                                {txt("Caption copy to post:", "الوصف المصاحب للفيديو:")}
                              </span>
                              <p className="text-xs text-slate-700">{aiResult.caption}</p>
                            </div>
                          </div>
                        )}

                        {aiType === "caption" && (
                          <>
                            <p className="text-xs text-slate-800 leading-relaxed">
                              {aiResult.optimizedText}
                            </p>
                            {aiResult.hashtags && (
                              <div className="flex flex-wrap gap-1 mt-3">
                                {aiResult.hashtags.map((h: string, idx: number) => (
                                  <span key={idx} className="text-xs text-indigo-600 font-semibold">
                                    #{h}
                                  </span>
                                ))}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="border border-dashed border-slate-200 rounded-xl py-16 text-center text-slate-400">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-xs font-medium">
                          {txt(
                            "Generated campaign layouts will appear here instantly.",
                            "ستظهر نتائج الصياغة الإبداعية للذكاء الاصطناعي هنا فوراً."
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {aiResult && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            aiResult.postContent || aiResult.optimizedText || aiResult.caption || ""
                          );
                          toast.success(txt("Copied to clipboard!", "تم النسخ للحافظة!"));
                        }}
                        className="flex-1 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
                      >
                        {txt("Copy to Clipboard", "نسخ النص")}
                      </button>
                      <button
                        onClick={() => {
                          setNewPostContent(
                            aiResult.postContent || aiResult.optimizedText || aiResult.caption || ""
                          );
                          if (aiResult.imagePrompt)
                            setPostImage(
                              "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800"
                            ); // Simulate assigning prompt
                          setActiveTab("scheduler");
                          toast.success(
                            txt("Content loaded into Composer!", "تم نقل النص لمحاكي المنشورات!")
                          );
                        }}
                        className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
                      >
                        {txt("Use in Composer", "العمل به في المحاكي")}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                UNIFIED COMMENTS INBOX
                ======================================================== */}
            {activeTab === "inbox" && (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                {/* List Column */}
                <div className="md:col-span-5 border-r border-slate-200 flex flex-col">
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                    <h3 className="text-sm font-extrabold text-slate-800 mb-2">
                      {txt("Conversations & Comments Inbox", "وارد الاستفسارات والتعليقات")}
                    </h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={txt("Filter by keyword...", "ابحث في الرسائل والتعليقات...")}
                        className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[450px]">
                    {inbox.map((item) => {
                      const Icon = platformIcons[item.platform];
                      const isUnread = item.status === "Unread";

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedInboxItem(item);
                            // Set read locally
                            setInbox((prev) =>
                              prev.map((i) =>
                                i.id === item.id ? { ...i, status: "Read" as const } : i
                              )
                            );
                          }}
                          className={cn(
                            "p-4 cursor-pointer transition-all hover:bg-slate-50 flex gap-3 relative",
                            selectedInboxItem?.id === item.id
                              ? "bg-indigo-50/40 border-l-4 border-l-indigo-600"
                              : ""
                          )}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={item.authorAvatar}
                              className="w-10 h-10 rounded-full object-cover border"
                              alt=""
                            />
                            {Icon && (
                              <span className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border shadow-sm">
                                <Icon className="w-3 h-3 text-slate-700" />
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <span className="text-xs font-extrabold text-slate-900 block truncate">
                                {item.authorName}
                              </span>
                              <span className="text-[10px] text-slate-400 block flex-shrink-0">
                                {new Date(item.timestamp).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                              {item.type}
                            </span>
                            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                              {item.message}
                            </p>
                          </div>
                          {isUnread && (
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 absolute right-4 top-1/2 -translate-y-1/2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Chat Details Column */}
                <div className="md:col-span-7 flex flex-col justify-between bg-slate-50/30">
                  {selectedInboxItem ? (
                    <>
                      {/* Active header */}
                      <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <img
                            src={selectedInboxItem.authorAvatar}
                            className="w-10 h-10 rounded-full object-cover border"
                            alt=""
                          />
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 block">
                              {selectedInboxItem.authorName}
                            </span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {selectedInboxItem.platform} • {selectedInboxItem.type}
                            </span>
                          </div>
                        </div>
                        {selectedInboxItem.postTitle && (
                          <span className="text-[10px] bg-slate-100 border border-slate-200 px-2 py-1 rounded text-slate-500 max-w-[200px] truncate">
                            {txt("Post: ", "المنشور: ")} {selectedInboxItem.postTitle}
                          </span>
                        )}
                      </div>

                      {/* Chat messages Area */}
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[350px]">
                        {/* User comment */}
                        <div className="flex gap-3 max-w-[85%]">
                          <img
                            src={selectedInboxItem.authorAvatar}
                            className="w-8 h-8 rounded-full object-cover border flex-shrink-0"
                            alt=""
                          />
                          <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-none shadow-sm">
                            <p className="text-xs text-slate-800 leading-relaxed">
                              {selectedInboxItem.message}
                            </p>
                            <span className="text-[9px] text-slate-400 block mt-1">
                              {new Date(selectedInboxItem.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Team replies */}
                        {selectedInboxItem.replies.map((rep, index) => (
                          <div key={index} className="flex gap-3 justify-end max-w-[85%] ml-auto">
                            <div className="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm">
                              <p className="text-xs leading-relaxed">{rep.text}</p>
                              <span className="text-[9px] text-indigo-200 block mt-1 text-right">
                                {new Date(rep.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-600 flex-shrink-0">
                              M
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Reply Editor */}
                      <form
                        onSubmit={handleSendInboxReply}
                        className="p-4 bg-white border-t border-slate-200"
                      >
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSuggestReplyWithAI}
                            disabled={isSuggestingReply}
                            className="p-2.5 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1 flex-shrink-0"
                          >
                            {isSuggestingReply ? (
                              <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                            )}
                            <span>{txt("AI Answer Guide", "رد ذكي")}</span>
                          </button>
                          <input
                            type="text"
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={txt(
                              "Type your team response or use AI Suggestion...",
                              "اكتب رد الفريق هنا أو استعن بالذكاء الاصطناعي..."
                            )}
                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="submit"
                            disabled={actionLoading || !replyText.trim()}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{txt("Reply", "إرسال")}</span>
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-24">
                      <MessageSquare className="w-10 h-10 text-slate-300 mb-2 animate-bounce" />
                      <p className="text-xs font-bold">
                        {txt(
                          "Select a conversation from the left to engage.",
                          "اختر إحدى المحادثات من القائمة الجانبية للرد والتفاعل."
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ========================================================
                BRAND MENTIONS & SENTIMENT
                ======================================================== */}
            {activeTab === "monitoring" && (
              <div className="space-y-6">
                {/* Brand overview row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    {
                      title: txt("Net Brand Sentiment Index", "مؤشر الرضا والسمعة الإيجابية"),
                      val: "84%",
                      bg: "bg-green-50 text-green-700 border-green-100",
                    },
                    {
                      title: txt("Share of Voice (Saudi Enterprise OS)", "الحصة من الحديث الإشاري"),
                      val: "38.5%",
                      bg: "bg-indigo-50 text-indigo-700 border-indigo-100",
                    },
                    {
                      title: txt("Active Tracked Hashtags", "الهاشتاغات النشطة الخاضعة للرصد"),
                      val: "#مداريج_OS",
                      bg: "bg-slate-50 text-slate-700 border-slate-100",
                    },
                  ].map((it, i) => (
                    <div key={i} className={cn("border p-5 rounded-2xl shadow-sm", it.bg)}>
                      <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                        {it.title}
                      </span>
                      <span className="text-3xl font-black block mt-2">{it.val}</span>
                    </div>
                  ))}
                </div>

                {/* Mentions Feed */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="text-sm font-extrabold text-slate-800 mb-4">
                    {txt(
                      "Real-Time Mentions Feed & Web Listening",
                      "قائمة الإشارات ورصد الويب الحي"
                    )}
                  </h3>

                  <div className="space-y-4">
                    {monitoring.map((m) => (
                      <div
                        key={m.id}
                        className="p-4 border border-slate-100 rounded-xl hover:shadow-sm transition-all bg-slate-50/30 flex justify-between items-start gap-4"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-slate-900">
                              {m.author}
                            </span>
                            <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-400">
                              {m.source}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(m.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed font-medium">
                            "{m.text}"
                          </p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-400">
                            <span>
                              <strong>{txt("Keyword: ", "الكلمة المفتاحية: ")}</strong>
                              {m.keyword}
                            </span>
                            <span>•</span>
                            <span>
                              <strong>{txt("Reach impact: ", "مدى التأثير والوصول: ")}</strong>
                              {m.reach.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Sentiment badge */}
                        <span
                          className={cn(
                            "px-2.5 py-1 text-[10px] font-black rounded-full border shadow-sm",
                            m.sentiment === "Positive"
                              ? "bg-green-50 border-green-200 text-green-700"
                              : m.sentiment === "Negative"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                          )}
                        >
                          {m.sentiment}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                COMPETITOR TRACKING
                ======================================================== */}
            {activeTab === "competitors" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form to add */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-800 mb-1">
                      {txt("Add Competitor Profile", "إضافة ملف تعريف لمنافس")}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {txt(
                        "Madarij OS AI web crawlers periodically parse competitor social profiles to chart comparisons.",
                        "يقوم زاحف الويب الذكي في مداريج بمسح دوري لحسابات المنافسين للمقارنة والتحليل."
                      )}
                    </p>
                  </div>

                  <form onSubmit={handleAddCompetitor} className="flex gap-2">
                    <input
                      type="text"
                      value={newCompetitorName}
                      onChange={(e) => setNewCompetitorName(e.target.value)}
                      placeholder={txt("e.g. SaudiCRM Pro", "مثال: نظام إدارة محاسب كذا")}
                      className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                    >
                      {txt("Track", "بدء الرصد")}
                    </button>
                  </form>

                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      {txt("Actively Tracked Competitors", "المنافسون قيد التتبع حالياً")}
                    </span>

                    {competitors.map((c, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl"
                      >
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">{c.name}</span>
                          <span className="text-[10px] text-slate-400 block">
                            {c.followers.toLocaleString()} {txt("followers", "متابع")}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-extrabold text-indigo-600 block">
                            {c.engagement}% ER
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {c.frequency} posts/mo
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Analytical Charts */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                  <h3 className="text-sm font-extrabold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-1.5">
                    <BarChart3 className="w-5 h-5 text-slate-500" />
                    {txt(
                      "Competitor Share of Engagement vs. Followers",
                      "توزيع التفاعل والمتابعين للمنافسين"
                    )}
                  </h3>

                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={competitors}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip />
                        <Bar
                          dataKey="engagement"
                          fill="#4f46e5"
                          radius={[4, 4, 0, 0]}
                          name={txt("Engagement Rate %", "معدل التفاعل %")}
                        />
                        <Bar
                          dataKey="frequency"
                          fill="#06b6d4"
                          radius={[4, 4, 0, 0]}
                          name={txt("Post Frequency /mo", "معدل النشر /شهر")}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED POST PREVIEW MODAL */}
      <AnimatePresence>
        {selectedPreviewPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {txt("Campaign Item Details", "تفاصيل محتوى الحملة")}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedPreviewPost(null)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  ✕
                </button>
              </div>

              {/* Header Profile Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-indigo-600">
                    M
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {selectedPreviewPost.authorName}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {txt("Scheduled Date: ", "تاريخ النشر: ")}{" "}
                      {new Date(selectedPreviewPost.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2.5 py-1 text-[10px] font-black rounded-full border",
                    selectedPreviewPost.approvalStatus === "Approved"
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-amber-50 border-amber-200 text-amber-700"
                  )}
                >
                  {selectedPreviewPost.approvalStatus}
                </span>
              </div>

              {/* Platforms */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  {txt("Publish Channels", "قنوات البث والنشر")}
                </span>
                <div className="flex gap-2">
                  {selectedPreviewPost.platforms.map((plat) => {
                    const Icon = platformIcons[plat];
                    return (
                      <span
                        key={plat}
                        className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs capitalize text-slate-700"
                      >
                        {Icon && <Icon className="w-3.5 h-3.5 text-slate-600" />}
                        <span>{plat}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Content text */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                {selectedPreviewPost.content}
              </div>

              {selectedPreviewPost.imageUrl && (
                <div className="border rounded-lg overflow-hidden max-h-48">
                  <img
                    src={selectedPreviewPost.imageUrl}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              )}

              {/* Actions row */}
              <div className="flex justify-between items-center border-t border-slate-100 pt-4">
                <button
                  onClick={() => handleDeletePost(selectedPreviewPost.id)}
                  disabled={actionLoading}
                  className="px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{txt("Delete / Cancel", "إلغاء وجدولة")}</span>
                </button>

                {selectedPreviewPost.approvalStatus === "Pending" && (
                  <button
                    onClick={() => handleApprovePost(selectedPreviewPost.id)}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{txt("Approve for Broadcast", "مواثقة واعتماد للنشر")}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
