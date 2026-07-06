import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Mail,
  Send,
  Plus,
  Trash2,
  Edit2,
  Layout as LayoutIcon,
  Users,
  GitPullRequest,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flame,
  Clock,
  Briefcase,
  Play,
  Save,
  Grid,
  TrendingUp,
  Cpu,
  Monitor,
  Smartphone,
  Eye,
  Check,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Code,
  Tag,
  DollarSign,
  Heart,
  Share2,
  ExternalLink,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { auth } from "@/src/lib/firebase";
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

// Interfaces
interface EmailCampaign {
  id: string;
  name: string;
  subjectLine: string;
  status: "Draft" | "Sent" | "Scheduled";
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  spamCount: number;
  revenueGenerated: number;
  targetSegment: string;
  createdAt: string;
  sentAt?: string;
  bodyContent?: string;
  jsonStructure?: {
    blocks: Array<{
      type: string;
      text?: string;
      url?: string;
      code?: string;
    }>;
  };
  abTest?: {
    enabled: boolean;
    subjectB: string;
    ratio: number;
  };
  ampEnabled?: boolean;
}

interface EmailTemplate {
  id: string;
  name: string;
  type: string;
  jsonStructure?: {
    blocks: Array<{
      type: "header" | "text" | "button" | "image" | "code";
      text?: string;
      url?: string;
      code?: string;
    }>;
  };
  htmlContent: string;
  createdAt: string;
}

interface EmailContact {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "Active" | "Unsubscribed" | "Bounced";
  segmentTags: string[];
  createdAt: string;
}

interface WorkflowStep {
  id: string;
  type: "email" | "wait" | "condition";
  label: string;
  delayDays?: number;
  value?: number;
  field?: string;
  yesSteps?: WorkflowStep[];
  noSteps?: WorkflowStep[];
  description?: string;
}

interface EmailAutomation {
  id: string;
  name: string;
  triggerEvent: string;
  status: "Active" | "Inactive";
  enrolledCount: number;
  completedCount: number;
  steps: WorkflowStep[];
  createdAt: string;
}

export default function EmailMarketing() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "campaigns" | "templates" | "automations" | "contacts"
  >("dashboard");

  // Core collections state
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [automations, setAutomations] = useState<EmailAutomation[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);

  // Loading indicator
  const [loading, setLoading] = useState(true);

  // Campaign builder state
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<EmailCampaign | null>(null);
  const [campName, setCampName] = useState("");
  const [campSubject, setCampSubject] = useState("");
  const [campSegment, setCampSegment] = useState("All Contacts");
  const [campBlocks, setCampBlocks] = useState<
    Array<{ type: string; text?: string; url?: string; code?: string }>
  >([
    { type: "header", text: "أهلاً بك في نشرتنا الإخبارية" },
    { type: "text", text: "هذا نص تجريبي لبريدك الإلكتروني المصمم عبر Madarij OS." },
  ]);
  const [abEnabled, setAbEnabled] = useState(false);
  const [campSubjectB, setCampSubjectB] = useState("");
  const [campAmp, setCampAmp] = useState(false);

  // Template custom state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [tempName, setTempName] = useState("");
  const [tempType, setTempType] = useState("newsletter");

  // Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactCompany, setContactCompany] = useState("");
  const [contactTags, setContactTags] = useState("");

  // Automation Modal State
  const [showAutModal, setShowAutModal] = useState(false);
  const [autName, setAutName] = useState("");
  const [autTrigger, setAutTrigger] = useState("Lead Created");
  const [autSteps, setAutSteps] = useState<WorkflowStep[]>([]);

  // Search & Filters
  const [contactSearch, setContactSearch] = useState("");
  const [contactTagFilter, setContactTagFilter] = useState("All");

  // AI Copilot state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("professional");
  const [aiSubjectOptions, setAiSubjectOptions] = useState<
    Array<{ category: string; subject: string; preview: string }>
  >([]);
  const [aiBodyResponse, setAiBodyResponse] = useState<any>(null);
  const [aiWorkflowGoal, setAiWorkflowGoal] = useState("");

  // Fetch all email marketing data
  const fetchData = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch campaigns
      const cRes = await fetch("/api/email-marketing/campaigns", { headers });
      if (cRes.ok) setCampaigns(await cRes.json());

      // Fetch templates
      const tRes = await fetch("/api/email-marketing/templates", { headers });
      if (tRes.ok) setTemplates(await tRes.json());

      // Fetch automations
      const aRes = await fetch("/api/email-marketing/automations", { headers });
      if (aRes.ok) setAutomations(await aRes.json());

      // Fetch contacts
      const contRes = await fetch("/api/email-marketing/contacts", { headers });
      if (contRes.ok) setContacts(await contRes.json());
    } catch (err: any) {
      toast.error(isAr ? "خطأ في جلب بيانات التسويق" : "Error fetching marketing data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [auth.currentUser]);

  // Handle Campaign Creation/Edit
  const handleSaveCampaign = async () => {
    if (!campName || !campSubject) {
      toast.error(isAr ? "يرجى تعبئة الحقول المطلوبة" : "Please fill in required fields");
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        name: campName,
        subjectLine: campSubject,
        targetSegment: campSegment,
        jsonStructure: { blocks: campBlocks },
        bodyContent: campBlocks.map((b) => b.text || b.code || "").join("\n\n"),
        ampEnabled: campAmp,
        abTest: abEnabled ? { enabled: true, subjectB: campSubjectB, ratio: 50 } : null,
      };

      const url = editingCampaign
        ? `/api/email-marketing/campaigns/${editingCampaign.id}`
        : "/api/email-marketing/campaigns";
      const method = editingCampaign ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isAr ? "تم حفظ الحملة بنجاح" : "Campaign saved successfully");
        setShowCampaignModal(false);
        setEditingCampaign(null);
        fetchData();
      } else {
        toast.error(isAr ? "فشل حفظ الحملة" : "Failed to save campaign");
      }
    } catch (err) {
      toast.error("Error saving campaign");
    }
  };

  // Simulate Campaign Sending
  const handleSendCampaign = async (id: string) => {
    try {
      toast.loading(
        isAr ? "جاري جدولة وإرسال البريد الإلكتروني..." : "Scheduling and dispatching campaign...",
        { id: "sending" }
      );
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/email-marketing/campaigns/${id}/send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.dismiss("sending");
        toast.success(
          isAr
            ? "تم إرسال الحملة بنجاح! تم رصد مؤشرات الأداء فوراً."
            : "Campaign sent successfully! Analytics tracked in real time."
        );
        fetchData();
      } else {
        toast.dismiss("sending");
        toast.error(isAr ? "فشل إرسال الحملة" : "Failed to dispatch campaign");
      }
    } catch (err) {
      toast.dismiss("sending");
      toast.error("Error sending campaign");
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (id: string) => {
    if (
      !confirm(
        isAr ? "هل أنت متأكد من حذف هذه الحملة؟" : "Are you sure you want to delete this campaign?"
      )
    )
      return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/email-marketing/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(isAr ? "تم حذف الحملة" : "Campaign deleted");
        fetchData();
      }
    } catch (err) {
      toast.error("Error deleting campaign");
    }
  };

  // AI Content Generator Call
  const generateAiContent = async (genType: "subject_lines" | "full_email") => {
    if (!aiPrompt) {
      toast.error(
        isAr
          ? "يرجى تحديد تفاصيل أو هدف الحملة أولاً"
          : "Please provide campaign details or goal first"
      );
      return;
    }

    try {
      setAiGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/email-marketing/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: genType,
          productName: aiPrompt,
          offerDetails: "خصم 20% لفترة محدودة وتدشين ميزات التشغيل الذاتي الذكي",
          targetAudience: "أصحاب الأعمال والمستثمرين ومدراء التسويق",
          tone: aiTone,
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (genType === "subject_lines") {
          setAiSubjectOptions(data.options || []);
          toast.success(
            isAr
              ? "تم ابتكار عناوين جذابة فائقة الفعالية!"
              : "High-converting subject lines crafted!"
          );
        } else {
          setAiBodyResponse(data);
          // Auto-fill template blocks
          if (data.bodyParagraphs) {
            const newBlocks = [
              { type: "header", text: data.headline || data.subject },
              ...data.bodyParagraphs.map((p: string) => ({ type: "text", text: p })),
              { type: "button", text: data.ctaText || "اضغط هنا", url: "https://madarij.sa" },
            ];
            setCampBlocks(newBlocks);
            setCampSubject(data.subject);
          }
          toast.success(
            isAr
              ? "تم إعداد محتوى الرسالة وتعبئتها في المصمم!"
              : "Email body compiled and filled in the designer!"
          );
        }
      } else {
        toast.error(isAr ? "فشل ابتكار المحتوى الذكي" : "Failed to brainstorm intelligent content");
      }
    } catch (err) {
      toast.error("AI Generation error");
    } finally {
      setAiGenerating(false);
    }
  };

  // AI Workflow Generator Call
  const generateAiWorkflow = async () => {
    if (!aiWorkflowGoal) {
      toast.error(
        isAr
          ? "يرجى كتابة سيناريو أو هدف الأتمتة"
          : "Please write automation scenario or goal first"
      );
      return;
    }

    try {
      setAiGenerating(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/email-marketing/ai/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          goal: aiWorkflowGoal,
          triggerEvent: autTrigger,
          language: isAr ? "ar" : "en",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAutSteps(data.steps || []);
        setAutName(data.workflowName || "AI Flow");
        toast.success(
          isAr
            ? "تم تخطيط وهيكلة الأتمتة الذكية بنجاح!"
            : "Smart flow planned and designed successfully!"
        );
      } else {
        toast.error(
          isAr ? "فشل بناء سير العمل بالذكاء الاصطناعي" : "Failed to structure flow with AI"
        );
      }
    } catch (err) {
      toast.error("AI workflow generator failed");
    } finally {
      setAiGenerating(false);
    }
  };

  // Save Contact
  const handleSaveContact = async () => {
    if (!contactName || !contactEmail) {
      toast.error("Please fill in contact name and email");
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        name: contactName,
        email: contactEmail,
        company: contactCompany,
        segmentTags: contactTags ? contactTags.split(",").map((t) => t.trim()) : ["Active"],
      };

      const res = await fetch("/api/email-marketing/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(isAr ? "تم تسجيل جهة الاتصال بنجاح" : "Contact enrolled successfully");
        setShowContactModal(false);
        setContactName("");
        setContactEmail("");
        setContactCompany("");
        setContactTags("");
        fetchData();
      }
    } catch (err) {
      toast.error("Error creating contact");
    }
  };

  // Save Automation Flow
  const handleSaveAutomation = async () => {
    if (!autName) {
      toast.error("Please specify workflow name");
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const payload = {
        name: autName,
        triggerEvent: autTrigger,
        steps:
          autSteps.length > 0
            ? autSteps
            : [{ id: "1", type: "email", label: "أهلاً بك", delayDays: 0 }],
        status: "Active",
      };

      const res = await fetch("/api/email-marketing/automations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          isAr ? "تم بناء وحفظ سير الأتمتة بنجاح" : "Automation flow built and saved successfully"
        );
        setShowAutModal(false);
        setAutName("");
        setAutSteps([]);
        fetchData();
      }
    } catch (err) {
      toast.error("Error saving automation");
    }
  };

  // Sync with CRM Leads
  const handleSyncCRM = async () => {
    try {
      toast.loading(
        isAr ? "جاري فحص ومزامنة العملاء من CRM..." : "Scanning and importing contacts from CRM...",
        { id: "sync" }
      );
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/email-marketing/contacts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.dismiss("sync");
        toast.success(
          isAr
            ? "تمت المزامنة بنجاح! تم استيراد أحدث العملاء المؤهلين."
            : "Sync completed! Imported qualified contacts."
        );
        fetchData();
      }
    } catch (err) {
      toast.dismiss("sync");
      toast.error("Sync error");
    }
  };

  // Dashboard Aggregated Analytics Stats
  const totalSent = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalOpened = campaigns.reduce((acc, c) => acc + c.openCount, 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + c.clickCount, 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenueGenerated, 0);

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

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.company.toLowerCase().includes(contactSearch.toLowerCase());
    const matchesTag = contactTagFilter === "All" || c.segmentTags.includes(contactTagFilter);
    return matchesSearch && matchesTag;
  });

  // Unique tags
  const uniqueTags = Array.from(new Set(contacts.flatMap((c) => c.segmentTags)));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Mail className="w-8 h-8 text-indigo-600" />
            {isAr ? "منصة التسويق والبريد الإلكتروني الذكية" : "Email Marketing & Growth Platform"}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAr
              ? "نظام أتمتة تسويقية رائد، وحملات مدعومة بالذكاء الاصطناعي متكاملة مع نظام المبيعات"
              : "Next-gen campaign builder, flow orchestrations, and predictive copywriter."}
          </p>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setEditingCampaign(null);
              setCampName("");
              setCampSubject("");
              setCampBlocks([
                { type: "header", text: "أهلاً بك في نشرتنا الإخبارية" },
                { type: "text", text: "قم بتعديل هذه الرسالة لتبهر عملاءك." },
              ]);
              setShowCampaignModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg text-sm hover:bg-indigo-700 transition flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {isAr ? "إنشاء حملة مبتكرة" : "Create Smart Campaign"}
          </button>

          <button
            onClick={() => setShowAutModal(true)}
            className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg text-sm hover:bg-teal-700 transition flex items-center gap-2 shadow-sm"
          >
            <GitPullRequest className="w-4 h-4" />
            {isAr ? "بناء قمع أتمتة" : "New Automation Flow"}
          </button>

          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-lg transition text-slate-600"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-1 border-b border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            {
              id: "dashboard",
              label: isAr ? "لوحة القيادة والأداء" : "Dashboard Analytics",
              icon: BarChart3,
            },
            {
              id: "campaigns",
              label: isAr ? "الحملات والمسودات" : "Campaigns & Broadcasts",
              icon: Send,
            },
            {
              id: "templates",
              label: isAr ? "قوالب مصممة مسبقاً" : "Saved Templates",
              icon: LayoutIcon,
            },
            {
              id: "automations",
              label: isAr ? "أتمتة وسيناريوهات التنقيط" : "Automation Journeys",
              icon: GitPullRequest,
            },
            {
              id: "contacts",
              label: isAr ? "قوائم الاتصال والشرائح" : "Audience & Segmentations",
              icon: Users,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-5 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition",
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT SPACE */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin" />
            <p className="text-slate-500 mt-4 text-sm">
              {isAr ? "تحميل لوحة التسويق..." : "Loading marketing engine..."}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {/* 1. ANALYTICS DASHBOARD */}
            {activeTab === "dashboard" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Stats Summary Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                      <Send className="w-24 h-24 text-indigo-900" />
                    </div>
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
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                      <Eye className="w-24 h-24 text-teal-900" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {isAr ? "متوسط معدل الفتح" : "AVERAGE OPEN RATE"}
                    </span>
                    <h3 className="text-3xl font-bold text-teal-600 mt-2">
                      {avgOpenRate.toFixed(1)}%
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
                      <span>{isAr ? "أعلى من متوسط المجال بـ 5.4%" : "+5.4% above benchmark"}</span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-5">
                      <Target className="w-24 h-24 text-amber-900" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      {isAr ? "متوسط النقر للفتح (CTR)" : "CLICK-THROUGH RATE"}
                    </span>
                    <h3 className="text-3xl font-bold text-amber-600 mt-2">
                      {avgClickRate.toFixed(1)}%
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <span>
                        {isAr ? "معدل تحويل وتفاعل مميز" : "Outstanding customer engagement"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white">
                    <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10">
                      <DollarSign className="w-24 h-24 text-white" />
                    </div>
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

                {/* Main Graphics Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Campaign Performance History */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">
                          {isAr ? "أداء الحملات الأخيرة" : "Recent Campaigns Analytics"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isAr
                            ? "مقارنة المشاهدات والمبيعات ومعدلات التفاعل"
                            : "Open and conversion statistics per broadcast"}
                        </p>
                      </div>
                    </div>
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
                  </div>

                  {/* Delivery & Security Health Monitor */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        {isAr ? "صحة التوصيل والDeliverability" : "Deliverability & Spam Score"}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isAr
                          ? "مراقبة بروتوكولات SPF, DKIM, DMARC"
                          : "Continuous IP reputation surveillance"}
                      </p>
                    </div>

                    <div className="my-6 flex flex-col items-center">
                      <div className="relative w-40 h-40 flex items-center justify-center">
                        {/* Circular Progress Meter */}
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
                          SPF Authenticated
                        </span>
                        <span className="font-semibold text-emerald-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          DKIM Signed
                        </span>
                        <span className="font-semibold text-emerald-600">Active</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          DMARC Policy
                        </span>
                        <span className="font-semibold text-emerald-600">Strict (reject)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attribution and Click Heatmap Simulator */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h4 className="text-base font-bold text-slate-900 mb-2">
                    {isAr
                      ? "تحليل الأجهزة ونظم التشغيل للعملاء"
                      : "Customer Device & Client Analytics"}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <Smartphone className="w-10 h-10 text-indigo-600" />
                      <div>
                        <span className="text-xs text-slate-400 block">
                          {isAr ? "جوال / أجهزة ذكية" : "MOBILE DEVICES"}
                        </span>
                        <span className="text-lg font-bold text-slate-800">74.5%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <Monitor className="w-10 h-10 text-emerald-600" />
                      <div>
                        <span className="text-xs text-slate-400 block">
                          {isAr ? "حواسب مكتبية" : "DESKTOP CLIENTS"}
                        </span>
                        <span className="text-lg font-bold text-slate-800">22.1%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                      <Grid className="w-10 h-10 text-amber-600" />
                      <div>
                        <span className="text-xs text-slate-400 block">
                          {isAr ? "أجهزة أخرى" : "OTHER / TABLETS"}
                        </span>
                        <span className="text-lg font-bold text-slate-800">3.4%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. CAMPAIGNS LIST */}
            {activeTab === "campaigns" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Campaigns Table */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {isAr ? "جميع الحملات والرسائل الإخبارية" : "All Broadcast Campaigns"}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isAr
                          ? "إنشاء وحفظ وتعديل وإرسال النشرات المخصصة"
                          : "Create, customize and trigger scheduled campaigns"}
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {campaigns.map((camp) => (
                      <div
                        key={camp.id}
                        className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition"
                      >
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
                            <Mail className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 flex items-center gap-2">
                              {camp.name}
                              {camp.status === "Sent" && (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-semibold rounded-full uppercase">
                                  {isAr ? "مكتملة" : "Delivered"}
                                </span>
                              )}
                              {camp.status === "Draft" && (
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded-full uppercase">
                                  {isAr ? "مسودة" : "Draft"}
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

                        {/* Performance results or send controls */}
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
                              {camp.revenueGenerated > 0 && (
                                <div>
                                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                                    {isAr ? "مبيعات" : "REVENUE"}
                                  </span>
                                  <span className="text-sm font-bold text-amber-600">
                                    {camp.revenueGenerated.toLocaleString()} ر.س
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingCampaign(camp);
                                  setCampName(camp.name);
                                  setCampSubject(camp.subjectLine);
                                  setCampSegment(camp.targetSegment);
                                  setCampBlocks(camp.jsonStructure?.blocks || []);
                                  setCampAmp(camp.ampEnabled || false);
                                  setAbEnabled(!!camp.abTest?.enabled);
                                  setCampSubjectB(camp.abTest?.subjectB || "");
                                  setShowCampaignModal(true);
                                }}
                                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-600 transition"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => handleSendCampaign(camp.id)}
                                className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5"
                              >
                                <Play className="w-3.5 h-3.5" />
                                {isAr ? "إرسال الآن" : "Send Now"}
                              </button>
                            </div>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteCampaign(camp.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. SAVED TEMPLATES */}
            {activeTab === "templates" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((temp) => (
                    <div
                      key={temp.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between group hover:border-indigo-300 hover:shadow-md transition"
                    >
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                            <LayoutIcon className="w-5 h-5" />
                          </div>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                            {temp.type}
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {temp.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Created on {new Date(temp.createdAt).toLocaleDateString()}
                        </p>

                        {/* Interactive Blocks Preview */}
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-500 max-h-40 overflow-y-auto">
                          {temp.jsonStructure?.blocks?.map((block, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 font-mono text-[9px] rounded uppercase">
                                {block.type}
                              </span>
                              <span className="truncate">
                                {block.text || block.url || block.code}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <button
                          onClick={() => {
                            setEditingCampaign(null);
                            setCampName(`حملة جديدة من ${temp.name}`);
                            setCampSubject("");
                            setCampBlocks(temp.jsonStructure?.blocks || []);
                            setShowCampaignModal(true);
                          }}
                          className="text-xs text-indigo-600 font-bold hover:underline flex items-center gap-1"
                        >
                          {isAr ? "استخدام وتصميم حملة" : "Deploy in Campaign"}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. MARKETING AUTOMATIONS */}
            {activeTab === "automations" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* AI Workflow Planner input bar */}
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
                      : "Describe your workflow goal to instantly generate dynamic triggers, waits and checkpoints."}
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
                        Lead Created (عميل محتمل جديد)
                      </option>
                      <option value="Cart Abandoned" className="text-slate-950">
                        Cart Abandoned (سلة متروكة)
                      </option>
                      <option value="E-commerce Purchase" className="text-slate-950">
                        E-commerce Purchase (عملية شراء)
                      </option>
                    </select>

                    <button
                      onClick={generateAiWorkflow}
                      disabled={aiGenerating}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition flex items-center gap-1.5 disabled:opacity-50"
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

                {/* Automation List */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {automations.map((aut) => (
                    <div
                      key={aut.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
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

                        <div className="flex items-center gap-3 text-right text-xs">
                          <div>
                            <span className="text-slate-400 block">
                              {isAr ? "المسجلين" : "ENROLLED"}
                            </span>
                            <span className="font-bold text-slate-800">{aut.enrolledCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block">
                              {isAr ? "المكتملين" : "COMPLETED"}
                            </span>
                            <span className="font-bold text-slate-800">{aut.completedCount}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive visual workflow steps view */}
                      <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                        {aut.steps?.map((step, index) => (
                          <div key={step.id || index} className="relative flex items-start gap-3">
                            <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white"></span>
                            <div className="p-2.5 bg-slate-50 rounded-xl flex-1 text-xs">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-slate-800 flex items-center gap-1">
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
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {step.description}
                                </p>
                              )}

                              {/* Nested Conditional Steps */}
                              {step.yesSteps && step.yesSteps.length > 0 && (
                                <div className="mt-2 pl-3 border-l border-emerald-300 space-y-2 bg-emerald-50/50 p-1.5 rounded-lg">
                                  <span className="text-[10px] font-bold text-emerald-700 block">
                                    ✓ {isAr ? "نعم / تفاعل" : "Yes / Interacted"}
                                  </span>
                                  {step.yesSteps.map((ys) => (
                                    <div key={ys.id} className="text-[10px] text-slate-600">
                                      {ys.label}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {step.noSteps && step.noSteps.length > 0 && (
                                <div className="mt-2 pl-3 border-l border-rose-300 space-y-2 bg-rose-50/50 p-1.5 rounded-lg">
                                  <span className="text-[10px] font-bold text-rose-700 block">
                                    ✗ {isAr ? "لا / لم يتفاعل" : "No / Bounce"}
                                  </span>
                                  {step.noSteps.map((ns) => (
                                    <div key={ns.id} className="text-[10px] text-slate-600">
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
              </motion.div>
            )}

            {/* 5. AUDIENCE & SEGMENTATIONS */}
            {activeTab === "contacts" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Filter Toolbar */}
                  <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div className="flex-1 w-full md:w-auto relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder={
                          isAr
                            ? "البحث بالاسم، البريد أو الشركة..."
                            : "Search by name, email, company..."
                        }
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="w-full max-w-md bg-white border border-slate-200 pl-9 pr-4 py-1.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                      <select
                        value={contactTagFilter}
                        onChange={(e) => setContactTagFilter(e.target.value)}
                        className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs focus:outline-none text-slate-600"
                      >
                        <option value="All">{isAr ? "جميع الشرائح" : "All Segments"}</option>
                        {uniqueTags.map((tag) => (
                          <option key={tag} value={tag}>
                            {tag}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={handleSyncCRM}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {isAr ? "مزامنة العملاء من CRM" : "Sync CRM Contacts"}
                      </button>

                      <button
                        onClick={() => setShowContactModal(true)}
                        className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isAr ? "تسجيل يدوي" : "Add Contact"}
                      </button>
                    </div>
                  </div>

                  {/* Contacts Grid/Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-5">{isAr ? "الاسم" : "NAME"}</th>
                          <th className="py-3 px-5">
                            {isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"}
                          </th>
                          <th className="py-3 px-5">{isAr ? "الشركة" : "COMPANY"}</th>
                          <th className="py-3 px-5">{isAr ? "حالة الاشتراك" : "STATUS"}</th>
                          <th className="py-3 px-5">{isAr ? "الشرائح والوسوم" : "SEGMENTS"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                        {filteredContacts.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50/50">
                            <td className="py-3 px-5 font-semibold text-slate-900">{c.name}</td>
                            <td className="py-3 px-5 font-mono text-slate-500">{c.email}</td>
                            <td className="py-3 px-5">{c.company}</td>
                            <td className="py-3 px-5">
                              <span
                                className={cn(
                                  "px-2 py-0.5 rounded-full font-bold text-[9px]",
                                  c.status === "Active"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-rose-50 text-rose-700"
                                )}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-5">
                              <div className="flex flex-wrap gap-1">
                                {c.segmentTags?.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[9px] font-medium flex items-center gap-0.5"
                                  >
                                    <Tag className="w-2.5 h-2.5" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ==========================================
          MODALS & COPILOT DRAWER COMPONENT
         ========================================== */}

      {/* 1. CAMPAIGN BUILDER MODAL */}
      <AnimatePresence>
        {showCampaignModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 max-h-[90vh]"
            >
              {/* Left Column: Settings and Email Creator Block */}
              <div className="lg:col-span-7 p-6 overflow-y-auto space-y-4 border-r border-slate-100 max-h-[90vh]">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingCampaign
                      ? isAr
                        ? "تعديل النشرة التسويقية"
                        : "Edit Marketing Broadcast"
                      : isAr
                        ? "تصميم حملة بريد إلكتروني جديدة"
                        : "Design New Campaign"}
                  </h3>
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Campaign Basics */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                      {isAr ? "اسم الحملة الداخلي" : "Campaign Title"}
                    </label>
                    <input
                      type="text"
                      value={campName}
                      onChange={(e) => setCampName(e.target.value)}
                      placeholder="e.g. Q3 Features Launch"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                      {isAr ? "الجمهور المستهدف" : "Target Segment"}
                    </label>
                    <select
                      value={campSegment}
                      onChange={(e) => setCampSegment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="All Contacts">All Contacts (جميع المسجلين)</option>
                      <option value="High Value">High Value (كبار العملاء)</option>
                      <option value="E-commerce">E-commerce Buyers (مشتري المتجر)</option>
                      <option value="Warm">Warm Leads (مهتمين جدد)</option>
                    </select>
                  </div>
                </div>

                {/* Subject Line & A/B testing */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "عنوان البريد الإلكتروني" : "Email Subject Line"}
                  </label>
                  <input
                    type="text"
                    value={campSubject}
                    onChange={(e) => setCampSubject(e.target.value)}
                    placeholder="🔥 احصل على تحديثنا الجديد فورا"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                {/* A/B Test toggle */}
                <div className="p-3.5 bg-slate-50 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-indigo-600" />
                      {isAr ? "تفعيل اختبار المقارنة A/B Test" : "Enable A/B Subject Testing"}
                    </label>
                    <input
                      type="checkbox"
                      checked={abEnabled}
                      onChange={(e) => setAbEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600"
                    />
                  </div>
                  {abEnabled && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 block">
                        {isAr ? "عنوان بديل (النسخة B)" : "Variant B Subject Line"}
                      </label>
                      <input
                        type="text"
                        value={campSubjectB}
                        onChange={(e) => setCampSubjectB(e.target.value)}
                        placeholder="📢 متاح الآن: باقات تشغيل استثمارية بأسعار مذهلة"
                        className="w-full bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>

                {/* Brand features / AMP / interactive */}
                <div className="flex items-center justify-between p-3 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                  <div className="text-left">
                    <span className="text-xs font-bold text-indigo-950 block">
                      ⚡ AMP Email (أجهزة تفاعلية)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      اضغط زر تشغيل المكونات والتحقق داخل الرسائل
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={campAmp}
                    onChange={(e) => setCampAmp(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600"
                  />
                </div>

                {/* Content Layout Blocks Designer */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    {isAr ? "مكونات الرسالة المصممة" : "Email Builder Blocks"}
                  </span>
                  <div className="space-y-2.5">
                    {campBlocks.map((block, idx) => (
                      <div
                        key={idx}
                        className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200"
                      >
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-600 font-mono text-[9px] rounded uppercase">
                          {block.type}
                        </span>
                        <input
                          type="text"
                          value={block.text || block.url || block.code || ""}
                          onChange={(e) => {
                            const updated = [...campBlocks];
                            if (
                              block.type === "header" ||
                              block.type === "text" ||
                              block.type === "button"
                            ) {
                              updated[idx].text = e.target.value;
                            } else if (block.type === "image") {
                              updated[idx].url = e.target.value;
                            } else {
                              updated[idx].code = e.target.value;
                            }
                            setCampBlocks(updated);
                          }}
                          className="flex-1 bg-white border border-slate-200 px-2 py-1 rounded text-xs"
                        />
                        <button
                          onClick={() => setCampBlocks(campBlocks.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add blocks tools */}
                  <div className="flex gap-1.5 pt-2">
                    <button
                      onClick={() =>
                        setCampBlocks([...campBlocks, { type: "text", text: "فقرة نصية جديدة" }])
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      + Text
                    </button>
                    <button
                      onClick={() =>
                        setCampBlocks([...campBlocks, { type: "header", text: "عنوان فرعي جديد" }])
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      + Header
                    </button>
                    <button
                      onClick={() =>
                        setCampBlocks([
                          ...campBlocks,
                          {
                            type: "image",
                            url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                          },
                        ])
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      + Image
                    </button>
                    <button
                      onClick={() =>
                        setCampBlocks([
                          ...campBlocks,
                          { type: "button", text: "اضغط لتسجيل العرض", url: "https://madarij.sa" },
                        ])
                      }
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold rounded-lg"
                    >
                      + Button
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    onClick={() => setShowCampaignModal(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCampaign}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    {isAr ? "حفظ كمسودة" : "Save as Draft"}
                  </button>
                </div>
              </div>

              {/* Right Column: AI Content Generator & Copilot */}
              <div className="lg:col-span-5 bg-slate-50 p-6 overflow-y-auto max-h-[90vh] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-900">
                    {isAr ? "منشئ المحتوى ومحفز المبيعات الذكي" : "AI Copywriting Copilot"}
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      {isAr ? "تفاصيل المنتج أو العرض لتوليد النص" : "What is this campaign about?"}
                    </label>
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      rows={3}
                      placeholder={
                        isAr
                          ? "مثال: إعلان ميزات الفوترة الجديدة المتوافقة مع زكاة وضريبة ودخل مع تقديم كود خصم محدود"
                          : "e.g. Announcing new automated payroll system with 20% early adopter deal"
                      }
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 block mb-1">
                      {isAr ? "نبرة الرسالة" : "Tone of Voice"}
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="engaging">Engaging / Catchy (حماسي وجذاب)</option>
                      <option value="professional">Professional (احترافي رسمي)</option>
                      <option value="urgent">Urgent / FOMO (عاجل وضروري)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => generateAiContent("subject_lines")}
                      disabled={aiGenerating}
                      className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {aiGenerating ? (
                        <RefreshCw className="w-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      {isAr ? "ابتكار عناوين" : "Write Subjects"}
                    </button>

                    <button
                      onClick={() => generateAiContent("full_email")}
                      disabled={aiGenerating}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {aiGenerating ? (
                        <RefreshCw className="w-3 animate-spin" />
                      ) : (
                        <Cpu className="w-3 h-3" />
                      )}
                      {isAr ? "صياغة البريد كاملاً" : "Generate Email"}
                    </button>
                  </div>
                </div>

                {/* Subject Lines Options Render */}
                {aiSubjectOptions.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      {isAr ? "العناوين الذكية المقترحة" : "AI Suggested Subjects"}
                    </span>
                    <div className="space-y-2">
                      {aiSubjectOptions.map((opt, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setCampSubject(opt.subject);
                            toast.success(
                              isAr ? "تم اختيار العنوان وتطبيقه!" : "Subject line applied!"
                            );
                          }}
                          className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-400 cursor-pointer transition text-left space-y-1"
                        >
                          <span className="text-[9px] font-bold text-indigo-600 uppercase block">
                            {opt.category}
                          </span>
                          <p className="text-xs font-bold text-slate-900">{opt.subject}</p>
                          <p className="text-[10px] text-slate-400">{opt.preview}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Body Generation Feedback */}
                {aiBodyResponse && (
                  <div className="space-y-2 border-t border-slate-200 pt-4 bg-indigo-50/50 p-4 rounded-xl">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest block">
                      {isAr ? "أفضل أوقات الإرسال المقترحة" : "Send Time Optimization Advice"}
                    </span>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed mt-1">
                      {aiBodyResponse.optimalSendTime}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. AUTOMATION FLOW CREATION MODAL */}
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

              {/* Steps builder preview */}
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
                          className="text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1 pt-2">
                  <button
                    onClick={() =>
                      setAutSteps([
                        ...autSteps,
                        {
                          id: `${Date.now()}`,
                          type: "email",
                          label: "ارسل بريد إلكتروني ترحيبي",
                          delayDays: 0,
                        },
                      ])
                    }
                    className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[9px] font-bold rounded"
                  >
                    + Email
                  </button>
                  <button
                    onClick={() =>
                      setAutSteps([
                        ...autSteps,
                        { id: `${Date.now()}`, type: "wait", label: "انتظار 3 أيام", value: 3 },
                      ])
                    }
                    className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-[9px] font-bold rounded"
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
                  Cancel
                </button>
                <button
                  onClick={handleSaveAutomation}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Save Automation
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. CONTACT ADDITION MODAL */}
      <AnimatePresence>
        {showContactModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">
                  {isAr ? "تسجيل عميل جديد لقوائم الاتصال" : "Add Direct Contact"}
                </h3>
                <button
                  onClick={() => setShowContactModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "الاسم الكريم" : "Contact Name"}
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. خالد الحربي"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="e.g. k.harbi@domain.sa"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "المنشأة / الشركة" : "Company"}
                  </label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="e.g. Aramco"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block uppercase mb-1">
                    {isAr ? "وسوم وتصنيف (مفصولة بفاصلة)" : "Segment Tags (comma separated)"}
                  </label>
                  <input
                    type="text"
                    value={contactTags}
                    onChange={(e) => setContactTags(e.target.value)}
                    placeholder="e.g. High Value, Retail, Warm"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-150 flex justify-end gap-2">
                <button
                  onClick={() => setShowContactModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveContact}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Add Contact
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
