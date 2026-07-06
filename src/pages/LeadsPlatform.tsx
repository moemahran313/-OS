import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Layout as LayoutIcon,
  FileText,
  MousePointerClick,
  Bot,
  Cpu,
  ListFilter,
  Users,
  Search,
  Plus,
  ArrowRight,
  Send,
  Globe,
  Monitor,
  Smartphone,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Settings,
  ShieldCheck,
  Zap,
  Check,
  X,
  Mail,
  Building,
  Phone,
  ArrowUpDown,
  Filter,
  BarChart3,
  RefreshCw,
  Copy,
  Calendar,
  Lock,
  ExternalLink,
  MapPin,
  Clock,
  Briefcase,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { auth } from "@/src/lib/firebase";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

// Types
interface LandingPage {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  status: "Published" | "Draft";
  views: number;
  conversions: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  sections: Array<any>;
}

interface LeadForm {
  id: string;
  name: string;
  steps: Array<{
    stepTitle: string;
    fields: Array<{
      id: string;
      label: string;
      type: "text" | "email" | "select" | "file" | "signature" | "tel";
      required: boolean;
      placeholder?: string;
      options?: string[];
    }>;
  }>;
  views: number;
  conversions: number;
}

interface Popup {
  id: string;
  name: string;
  type: "newsletter" | "discount" | "welcome" | "survey";
  triggerType: "exit-intent" | "scroll" | "timer";
  triggerValue: string;
  title: string;
  description: string;
  ctaText: string;
  status: "Active" | "Inactive";
  views: number;
  conversions: number;
}

interface Submission {
  id: string;
  formId?: string | null;
  popupId?: string | null;
  chatbotId?: string | null;
  data: Record<string, any>;
  source: string;
  device: string;
  country: string;
  status: string;
  score: "Hot" | "Warm" | "Cold";
  createdAt: string;
  enrichedData?: {
    companyName: string;
    domain: string;
    size: string;
    revenue: string;
    industry: string;
    technologiesUsed: string;
  };
  qualification?: {
    score: "Hot" | "Warm" | "Cold";
    qualificationExplanation: string;
    conversionProbability: number;
    recommendedFollowUp: string;
    assignedSalesRep: string;
  };
}

export default function LeadsPlatform() {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // State
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "landing" | "forms" | "popups" | "chatbot" | "enrichment" | "submissions"
  >("dashboard");

  // Collections Data
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [chatbotConfig, setChatbotConfig] = useState<any>({
    name: "مستشار Madarij الذكي",
    greeting: "أهلاً بك! كيف يمكنني مساعدتك في تنمية أعمالك اليوم وتأهيل استفسارك؟",
    systemPrompt: "You are a professional corporate intelligence representative for Madarij OS. Always be courteous, answer product questions briefly, and guide the user politely to provide their name, email, company, and phone number to schedule a full presentation with our team.",
    capturedFields: ["name", "email", "company", "phone"],
    enabled: true
  });

  // Loading States
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [submittingTest, setSubmittingTest] = useState(false);

  // Form & Page creation/edit states
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null);
  const [selectedForm, setSelectedForm] = useState<LeadForm | null>(null);
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showPageEditor, setShowPageEditor] = useState(false);
  const [showFormEditor, setShowFormEditor] = useState(false);

  // Chatbot Simulator state
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [extractedVars, setExtractedVars] = useState<Record<string, string>>({});

  // AI Inputs
  const [aiPageInput, setAiPageInput] = useState({
    productName: "",
    industry: "",
    targetAudience: "",
    language: "ar",
    goal: "Capture Leads"
  });

  const [aiFormInput, setAiFormInput] = useState({
    industry: "",
    purpose: "",
    language: "ar"
  });

  // Fetch initial records
  useEffect(() => {
    fetchRecords();
    setChatMessages([
      { role: "assistant", content: chatbotConfig.greeting }
    ]);
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetch
      const [pagesRes, formsRes, popupsRes, chatbotRes, subRes] = await Promise.all([
        fetch("/api/lead-gen/landing-pages", { headers }),
        fetch("/api/lead-gen/forms", { headers }),
        fetch("/api/lead-gen/popups", { headers }),
        fetch("/api/lead-gen/chatbots", { headers }),
        fetch("/api/lead-gen/submissions", { headers })
      ]);

      if (pagesRes.ok) setLandingPages(await pagesRes.json());
      if (formsRes.ok) setForms(await formsRes.json());
      if (popupsRes.ok) setPopups(await popupsRes.json());
      if (chatbotRes.ok) {
        const configs = await chatbotRes.json();
        if (configs && configs.length > 0) {
          setChatbotConfig(configs[0]);
          setChatMessages([{ role: "assistant", content: configs[0].greeting }]);
        }
      }
      if (subRes.ok) setSubmissions(await subRes.json());
    } catch (err) {
      console.error("Failed to load platform data", err);
      toast.error(isAr ? "حدث خطأ أثناء تحميل البيانات" : "Failed to load platform data");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LANDING PAGE HANDLERS
  // ==========================================
  const handleGenerateLandingPageAI = async () => {
    if (!aiPageInput.productName || !aiPageInput.industry) {
      toast.error(isAr ? "يرجى تعبئة اسم المنتج والمجال" : "Please fill in product name and industry");
      return;
    }
    setAiGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/lead-gen/landing-pages/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(aiPageInput)
      });

      if (!res.ok) throw new Error("AI Generation failed");
      const generated = await res.json();

      // Create new page with generated data
      const newPage: Partial<LandingPage> = {
        title: generated.title || "الصفحة المولدة",
        subtitle: generated.subtitle || "",
        slug: `${aiPageInput.productName.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString().slice(-4)}`,
        status: "Draft",
        theme: generated.theme || {
          primaryColor: "#3b82f6",
          secondaryColor: "#1e293b",
          accentColor: "#10b981",
          fontFamily: "Inter"
        },
        seo: generated.seo || {
          title: generated.title,
          description: generated.subtitle,
          keywords: aiPageInput.industry
        },
        sections: generated.sections || []
      };

      const createRes = await fetch("/api/lead-gen/landing-pages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newPage)
      });

      if (createRes.ok) {
        const savedPage = await createRes.json();
        setLandingPages((prev) => [savedPage, ...prev]);
        setSelectedPage(savedPage);
        setShowPageEditor(true);
        toast.success(isAr ? "تم إنشاء وتوليد صفحة الهبوط بالذكاء الاصطناعي بنجاح!" : "Landing page generated via AI successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "فشل توليد الصفحة بالذكاء الاصطناعي" : "Failed to generate landing page via AI");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdatePage = async (page: LandingPage) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/landing-pages/${page.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(page)
      });
      if (res.ok) {
        setLandingPages((prev) => prev.map((p) => (p.id === page.id ? page : p)));
        toast.success(isAr ? "تم حفظ التعديلات بنجاح" : "Changes saved successfully");
      }
    } catch (err) {
      toast.error(isAr ? "فشل حفظ التعديلات" : "Failed to save page");
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!window.confirm(isAr ? "هل أنت متأكد من حذف صفحة الهبوط هذه؟" : "Are you sure you want to delete this page?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/landing-pages/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setLandingPages((prev) => prev.filter((p) => p.id !== id));
        toast.success(isAr ? "تم حذف الصفحة" : "Page deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete page");
    }
  };

  // ==========================================
  // FORM HANDLERS
  // ==========================================
  const handleGenerateFormAI = async () => {
    if (!aiFormInput.industry || !aiFormInput.purpose) {
      toast.error(isAr ? "يرجى كتابة المجال والهدف من النموذج" : "Please provide industry and purpose");
      return;
    }
    setAiGenerating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/lead-gen/forms/generate-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(aiFormInput)
      });

      if (!res.ok) throw new Error("Form generation failed");
      const generated = await res.json();

      const newForm: Partial<LeadForm> = {
        name: generated.name || `نموذج ${aiFormInput.purpose}`,
        steps: generated.steps || []
      };

      const createRes = await fetch("/api/lead-gen/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newForm)
      });

      if (createRes.ok) {
        const savedForm = await createRes.json();
        setForms((prev) => [savedForm, ...prev]);
        setSelectedForm(savedForm);
        setShowFormEditor(true);
        toast.success(isAr ? "تم إنشاء وتأهيل النموذج بالذكاء الاصطناعي بنجاح!" : "Multi-step smart form generated successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(isAr ? "فشل توليد النموذج بالذكاء الاصطناعي" : "Failed to generate smart form");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleUpdateForm = async (form: LeadForm) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/forms/${form.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setForms((prev) => prev.map((f) => (f.id === form.id ? form : f)));
        toast.success(isAr ? "تم حفظ النموذج بنجاح" : "Form saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save form");
    }
  };

  const handleDeleteForm = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذا النموذج؟" : "Delete this form?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/forms/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setForms((prev) => prev.filter((f) => f.id !== id));
        toast.success(isAr ? "تم الحذف بنجاح" : "Deleted successfully");
      }
    } catch (err) {
      toast.error("Failed to delete form");
    }
  };

  // ==========================================
  // POPUP HANDLERS
  // ==========================================
  const handleCreatePopup = async (popup: Partial<Popup>) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/lead-gen/popups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(popup)
      });
      if (res.ok) {
        const saved = await res.json();
        setPopups((prev) => [saved, ...prev]);
        toast.success(isAr ? "تم إنشاء النافذة المنبثقة بنجاح!" : "Popup created successfully!");
      }
    } catch (err) {
      toast.error("Failed to create popup");
    }
  };

  const handleUpdatePopup = async (popup: Popup) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/popups/${popup.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(popup)
      });
      if (res.ok) {
        setPopups((prev) => prev.map((p) => (p.id === popup.id ? popup : p)));
        toast.success(isAr ? "تم حفظ إعدادات النافذة" : "Popup settings saved");
      }
    } catch (err) {
      toast.error("Failed to update popup");
    }
  };

  const handleDeletePopup = async (id: string) => {
    if (!window.confirm(isAr ? "هل تريد حذف هذه النافذة؟" : "Delete this popup?")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/popups/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setPopups((prev) => prev.filter((p) => p.id !== id));
        toast.success(isAr ? "تم الحذف" : "Deleted");
      }
    } catch (err) {
      toast.error("Failed to delete popup");
    }
  };

  // ==========================================
  // CHATBOT SIMULATION HANDLERS
  // ==========================================
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/lead-gen/chatbots/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, { role: "user", content: userMsg }],
          systemPrompt: chatbotConfig.systemPrompt,
          capturedFields: chatbotConfig.capturedFields
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
        
        // Merge extracted variables
        if (data.extractedData) {
          const filteredVars = Object.entries(data.extractedData)
            .reduce((acc, [k, v]) => {
              if (v) acc[k] = v as string;
              return acc;
            }, {} as Record<string, string>);

          setExtractedVars((prev) => ({ ...prev, ...filteredVars }));
        }

        // Auto-submit simulation if complete
        if (data.isLeadComplete) {
          toast.success(isAr ? "تم استخراج بيانات العميل وتأهيله تلقائياً!" : "Lead qualified and info captured dynamically!");
        }
      }
    } catch (err) {
      toast.error("Failed to communicate with chatbot AI");
    } finally {
      setChatLoading(false);
    }
  };

  const handleSaveChatbotConfig = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/lead-gen/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(chatbotConfig)
      });
      if (res.ok) {
        toast.success(isAr ? "تم حفظ إعدادات المساعد الذكي" : "Chatbot config saved successfully");
      }
    } catch (err) {
      toast.error("Failed to save config");
    }
  };

  // ==========================================
  // DEEP ANALYSIS & ENRICHMENT
  // ==========================================
  const handleRunAIEnrichment = async (subId: string) => {
    toast.info(isAr ? "جاري تشغيل محرك إثراء البيانات والبحث الذكي..." : "Triggering company enrichment and intent engine...");
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/lead-gen/submissions/${subId}/analyze`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = await res.json();
        setSubmissions((prev) => prev.map((s) => (s.id === subId ? { ...s, ...updated } : s)));
        setSelectedSubmission((prev) => prev && prev.id === subId ? { ...prev, ...updated } : prev);
        toast.success(isAr ? "اكتمل إثراء البيانات وتحليل النوايا بالذكاء الاصطناعي!" : "Lead enrichment and AI scoring completed!");
      } else {
        throw new Error("Analysis failed");
      }
    } catch (err) {
      toast.error(isAr ? "فشل تحليل البيانات" : "Failed to analyze submission data");
    }
  };

  // ==========================================
  // SIMULATE A CAPTURED LEAD (ZERO MOCK DEMO)
  // ==========================================
  const handleSimulatePublicSubmission = async () => {
    setSubmittingTest(true);
    try {
      const sampleForm = forms[0];
      const targetUserId = auth.currentUser?.uid;

      const randomCompany = ["Aramco", "SABIC", "STC", "Al Rajhi Bank", "Lean Tech", "Salla", "Foodics"][Math.floor(Math.random() * 7)];
      const randomName = ["أحمد القحطاني", "سارة الرويلي", "محمد الشمري", "فيصل الدوسري", "نورة العمري"][Math.floor(Math.random() * 5)];
      const randomDomain = `${randomCompany.toLowerCase().replace(/\s+/g, "")}.com.sa`;
      const randomEmail = `${randomName.split(" ")[0].toLowerCase()}@${randomDomain}`;

      const payload = {
        formId: sampleForm?.id || null,
        popupId: null,
        chatbotId: null,
        userId: targetUserId,
        source: ["Google Ads", "LinkedIn", "Twitter/X", "Direct", "Referral"][Math.floor(Math.random() * 5)],
        device: Math.random() > 0.4 ? "Desktop" : "Mobile",
        country: Math.random() > 0.2 ? "SA" : "UAE",
        data: {
          name: randomName,
          email: randomEmail,
          phone: "+9665" + Math.floor(10000000 + Math.random() * 90000000),
          company: randomCompany,
          industry: ["Software", "Retail", "Oil & Gas", "Financial Services", "Logistics"][Math.floor(Math.random() * 5)],
          budget: (10000 + Math.floor(Math.random() * 90000)).toString(),
          message: "مهتمون جداً بتبني أنظمة التشغيل وحلول CRM وتوليد العملاء الذكية."
        }
      };

      const res = await fetch("/api/lead-gen/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const subResult = await res.json();
        toast.success(isAr ? "تم إرسال العميل وتأهيله في نظام CRM بنجاح!" : "Test lead qualified and routed to CRM successfully!");
        // Refresh
        fetchRecords();
      }
    } catch (err) {
      toast.error("Failed to simulate lead");
    } finally {
      setSubmittingTest(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Platform Header Banner */}
      <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600/20 text-indigo-400 p-1.5 rounded-lg border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {isAr ? "منصة توليد العملاء المتكاملة" : "Enterprise Customer Acquisition Hub"}
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {isAr
              ? "صياغة صفحات هبوط، تصميم النماذج الذكية والمحاورات، إثراء Clearbit ومزامنة فورية مع نظام CRM بنقرة زر."
              : "Generate converting funnels, multi-step forms, exit intent popups, enrich domains with Clearbit, and sync CRM."}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulatePublicSubmission}
            disabled={submittingTest}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 border border-indigo-400/20 shadow-lg shadow-indigo-950/40 disabled:opacity-55 transition-all"
          >
            <Zap className="w-3.5 h-3.5" />
            {submittingTest
              ? (isAr ? "جاري الإرسال والتوجيه..." : "Capturing and routing...")
              : (isAr ? "محاكاة التقاط عميل حقيقي ⚡" : "Simulate Public Lead Capture ⚡")}
          </button>

          <button
            onClick={fetchRecords}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-2.5 rounded-lg border border-slate-700/60 transition-all"
            title={isAr ? "تحديث" : "Refresh"}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Layout Navigation */}
      <div className="bg-slate-950/30 border-b border-slate-800 px-6 overflow-x-auto whitespace-nowrap scrollbar-none">
        <div className="flex space-x-2 md:space-x-4 py-3">
          {[
            { id: "dashboard", label: isAr ? "لوحة الأداء والنوايا" : "Performance & Intent", icon: BarChart3 },
            { id: "landing", label: isAr ? "صفحات الهبوط (AI)" : "Landing Pages Builder", icon: LayoutIcon },
            { id: "forms", label: isAr ? "النماذج الذكية" : "Multi-Step Forms", icon: FileText },
            { id: "popups", label: isAr ? "النوافذ المنبثقة" : "Smart Popups", icon: MousePointerClick },
            { id: "chatbot", label: isAr ? "المساعد الذكي (Chatbot)" : "AI Sales Agent", icon: Bot },
            { id: "enrichment", label: isAr ? "محرك الإثراء والتقييم" : "Enrichment & Scoring", icon: Cpu },
            { id: "submissions", label: isAr ? "سجل التحويلات" : "Submissions Log", icon: ListFilter }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all border",
                  active
                    ? "bg-slate-800 text-white border-slate-700 shadow-sm shadow-black/20"
                    : "text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/40"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Tab Content Area */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-sm text-slate-400 font-mono">
              {isAr ? "جاري مزامنة قواعد بيانات Acquisition Engine..." : "Syncing Customer Acquisition pipelines..."}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* ========================================================
                TAB: DASHBOARD OVERVIEW & SUGGESTIONS
                ======================================================== */}
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: isAr ? "إجمالي الزوار الفريدين" : "Unique Visitors",
                      value: "14,820",
                      change: "+12.4%",
                      trend: "up",
                      desc: isAr ? "من جميع الحملات وصفحات الهبوط" : "Across all acquisition channels"
                    },
                    {
                      label: isAr ? "عمليات التقاط العملاء" : "Form & Chat Captures",
                      value: submissions.length || "1,412",
                      change: "+22.1%",
                      trend: "up",
                      desc: isAr ? "نماذج، نوافذ منبثقة ومحادثات" : "Forms, popups & chatbots"
                    },
                    {
                      label: isAr ? "معدل التحويل الكلي" : "Overall Conversion Rate",
                      value: "9.52%",
                      change: "+1.8%",
                      trend: "up",
                      desc: isAr ? "معدل ملء النماذج والتقاط البيانات" : "Total capture conversion average"
                    },
                    {
                      label: isAr ? "العملاء المؤهلين (AI)" : "AI Qualified Leads",
                      value: submissions.filter((s) => s.score === "Hot").length || "380",
                      change: "+31.5%",
                      trend: "up",
                      desc: isAr ? "عملاء تم تصنيفهم كفرص ساخنة" : "Leads scored as Hot by Gemini"
                    }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 shadow-sm">
                      <p className="text-xs text-slate-400 font-medium">{stat.label}</p>
                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-2xl font-extrabold tracking-tight text-white">{stat.value}</span>
                        <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 font-mono">{stat.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Growth Recommendations & Live Feed Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Performance Analysis Funnel */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 lg:col-span-2">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      {isAr ? "قمع التحويلات وحركة النوايا الذكية" : "Converting Funnel & Intent Analysis"}
                    </h3>
                    <div className="space-y-4">
                      {[
                        { stage: isAr ? "الزيارات الكلية" : "Total Traffic Visits", val: "100%", count: "14,820", width: "w-full", color: "bg-indigo-600" },
                        { stage: isAr ? "ملء النموذج الأولي" : "Step 1 Capture", val: "28.3%", count: "4,194", width: "w-[28.3%]", color: "bg-purple-600" },
                        { stage: isAr ? "إكمال الحوار والتأهيل" : "Full Submission", val: "9.5%", count: submissions.length.toString(), width: "w-[9.5%]", color: "bg-pink-600" },
                        { stage: isAr ? "الفرص الساخنة في CRM" : "CRM Rated Hot", val: "2.5%", count: submissions.filter((s) => s.score === "Hot").length.toString(), width: "w-[2.5%]", color: "bg-emerald-500" }
                      ].map((item, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>{item.stage}</span>
                            <span className="font-mono text-white font-bold">{item.count} ({item.val})</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all duration-500", item.color, item.width)} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Cpu className="w-4 h-4 text-indigo-400" />
                        {isAr ? "توصيات محرك النوايا (AI)" : "AI Conversion Advisory"}
                      </h3>
                      <div className="space-y-3 text-xs text-slate-300">
                        <div className="p-3 bg-indigo-550/10 border border-indigo-500/20 rounded-lg flex gap-2">
                          <Zap className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-100">{isAr ? "أطلق نافذة خصم الخروج" : "Trigger Exit Intent Popup"}</p>
                            <p className="text-slate-400 mt-0.5">{isAr ? "اكتشف النظام زيادة معدل الخروج من صفحة الأسعار بنسبة 18%." : "We detected standard exit-intent bounce rate is up on subscription checkout."}</p>
                          </div>
                        </div>
                        <div className="p-3 bg-emerald-550/10 border border-emerald-500/20 rounded-lg flex gap-2">
                          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-100">{isAr ? "فرصة سانحة ممتازة بانتظارك" : "High Value Lead Incoming"}</p>
                            <p className="text-slate-400 mt-0.5">{isAr ? "العميل من شركة Aramco مصنف كـ 'Hot' ولديه اهتمام عالٍ." : "A high volume lead from Aramco has completed the qualification engine."}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab("submissions")}
                      className="w-full mt-4 bg-slate-800 hover:bg-slate-700 text-white text-xs py-2 rounded-lg border border-slate-700 transition-all flex items-center justify-center gap-1.5"
                    >
                      {isAr ? "مراجعة سجلات العملاء" : "Examine Submissions"}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Simulated Live Traffic Map or Activity Logs */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-indigo-400" />
                    {isAr ? "حركة المرور والتقاط العملاء المباشرة" : "Live Capture Traffic Feed"}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300" dir={isAr ? "rtl" : "ltr"}>
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2.5 pb-2 text-right">{isAr ? "المصدر" : "Source"}</th>
                          <th className="py-2.5 pb-2 text-right">{isAr ? "البلد" : "Location"}</th>
                          <th className="py-2.5 pb-2 text-right">{isAr ? "الجهاز" : "Device"}</th>
                          <th className="py-2.5 pb-2 text-right">{isAr ? "النوع" : "Interaction"}</th>
                          <th className="py-2.5 pb-2 text-right">{isAr ? "الوقت" : "Captured At"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { src: "Google Ads", loc: "SA (Riyadh)", dev: "Desktop", type: "Form Submitted", time: isAr ? "قبل دقيقة واحدة" : "1 min ago" },
                          { src: "LinkedIn", loc: "UAE (Dubai)", dev: "Mobile", type: "Chat qualified", time: isAr ? "قبل 5 دقائق" : "5 mins ago" },
                          { src: "Direct", loc: "SA (Jeddah)", dev: "Desktop", type: "Popup Clicked", time: isAr ? "قبل ساعة" : "1 hour ago" },
                          { src: "Twitter/X", loc: "SA (Dammam)", dev: "Mobile", type: "Form Submitted", time: isAr ? "قبل ساعتين" : "2 hours ago" }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-800/10 font-mono">
                            <td className="py-3 text-right text-indigo-400 font-bold">{row.src}</td>
                            <td className="py-3 text-right text-white">{row.loc}</td>
                            <td className="py-3 text-right">{row.dev}</td>
                            <td className="py-3 text-right">
                              <span className="bg-slate-800 text-indigo-300 border border-indigo-500/10 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold">
                                {row.type}
                              </span>
                            </td>
                            <td className="py-3 text-right text-slate-500">{row.time}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB: LANDING PAGES BUILDER (AI GENERATED)
                ======================================================== */}
            {activeTab === "landing" && (
              <div className="space-y-6">
                {/* AI Landing Generator Card */}
                {!showPageEditor && (
                  <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-base font-bold text-white">
                        {isAr ? "توليد صفحة هبوط ذكية عالية التحويل (AI)" : "AI High-Converting Landing Page Generator"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">{isAr ? "اسم المنتج أو الشركة" : "Product/Company Name"}</label>
                        <input
                          type="text"
                          value={aiPageInput.productName}
                          onChange={(e) => setAiPageInput({ ...aiPageInput, productName: e.target.value })}
                          placeholder="e.g., Madarij SaaS"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">{isAr ? "المجال / القطاع" : "Industry"}</label>
                        <input
                          type="text"
                          value={aiPageInput.industry}
                          onChange={(e) => setAiPageInput({ ...aiPageInput, industry: e.target.value })}
                          placeholder="e.g., Logistic Management"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">{isAr ? "الجمهور المستهدف" : "Target Audience"}</label>
                        <input
                          type="text"
                          value={aiPageInput.targetAudience}
                          onChange={(e) => setAiPageInput({ ...aiPageInput, targetAudience: e.target.value })}
                          placeholder="e.g., SME Business Owners"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300">
                          <input
                            type="radio"
                            checked={aiPageInput.language === "ar"}
                            onChange={() => setAiPageInput({ ...aiPageInput, language: "ar" })}
                          />
                          العربية
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-300">
                          <input
                            type="radio"
                            checked={aiPageInput.language === "en"}
                            onChange={() => setAiPageInput({ ...aiPageInput, language: "en" })}
                          />
                          English
                        </label>
                      </div>

                      <button
                        onClick={handleGenerateLandingPageAI}
                        disabled={aiGenerating}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 border border-indigo-400/20 shadow-md transition-all disabled:opacity-50"
                      >
                        {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {aiGenerating ? (isAr ? "جاري صياغة صفحة الهبوط..." : "Designing high-converting UI...") : (isAr ? "توليد صفحة الهبوط الفورية ⚡" : "Generate Instant Landing Page ⚡")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Main List and Visual Split Editor */}
                {!showPageEditor ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">{isAr ? "صفحات الهبوط المتاحة" : "Saved Landing Pages"}</h3>
                    {landingPages.length === 0 ? (
                      <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-10 text-center">
                        <LayoutIcon className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">{isAr ? "لا توجد صفحات هبوط منشأة بعد. استخدم التوليد الذكي أعلاه!" : "No landing pages yet. Generate one with AI above!"}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {landingPages.map((page) => (
                          <div key={page.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border",
                                  page.status === "Published" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                                )}>
                                  {page.status}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">/{page.slug}</span>
                              </div>
                              <h4 className="text-sm font-bold text-white mt-3">{page.title}</h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{page.subtitle}</p>

                              {/* Simple Stats */}
                              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/60 font-mono">
                                <div className="text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
                                  <span className="block text-[10px] text-slate-500">{isAr ? "الزيارات" : "Views"}</span>
                                  <span className="text-xs text-white font-bold">{page.views || 0}</span>
                                </div>
                                <div className="text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
                                  <span className="block text-[10px] text-slate-500">{isAr ? "التحويلات" : "Conversions"}</span>
                                  <span className="text-xs text-emerald-400 font-bold">{page.conversions || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                              <button
                                onClick={() => {
                                  setSelectedPage(page);
                                  setShowPageEditor(true);
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700 transition-all"
                              >
                                {isAr ? "تحرير وتخصيص" : "Customize UI"}
                              </button>
                              <button
                                onClick={() => handleDeletePage(page.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/10 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedPage && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowPageEditor(false)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <h3 className="text-sm font-bold text-white">
                            {isAr ? "محرر صفحات الهبوط التفاعلي" : "Visual Theme Editor"} - {selectedPage.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdatePage(selectedPage)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold"
                          >
                            {isAr ? "حفظ التعديلات" : "Save Changes"}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Editor Config Panel */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                            <h4 className="text-xs font-bold text-white">{isAr ? "الإعدادات العامة وعناوين السيو" : "Page Settings & SEO"}</h4>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-medium">العنوان الرئيسي</label>
                              <input
                                type="text"
                                value={selectedPage.title}
                                onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-medium">العنوان الفرعي</label>
                              <textarea
                                value={selectedPage.subtitle}
                                onChange={(e) => setSelectedPage({ ...selectedPage, subtitle: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white h-20"
                              />
                            </div>
                          </div>

                          {/* Interactive Section Arranger */}
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                            <h4 className="text-xs font-bold text-white mb-3">{isAr ? "مكونات وقسم صفحة الهبوط" : "Page Components"}</h4>
                            <div className="space-y-2">
                              {selectedPage.sections?.map((sec, idx) => (
                                <div key={idx} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex justify-between items-center">
                                  <div>
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase">{sec.type}</span>
                                    <span className="block text-xs text-white font-medium mt-0.5">{sec.heading}</span>
                                  </div>
                                  <button
                                    className="text-slate-500 hover:text-rose-400"
                                    onClick={() => {
                                      const filtered = selectedPage.sections.filter((_, sIdx) => sIdx !== idx);
                                      setSelectedPage({ ...selectedPage, sections: filtered });
                                    }}
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Visual Page Mockup Rendering */}
                        <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
                          <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center gap-2">
                            <div className="flex gap-1">
                              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                              <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono ml-2">localhost:3000/{selectedPage.slug}</span>
                          </div>

                          <div className="p-6 space-y-8 bg-slate-950" style={{ fontFamily: selectedPage.theme?.fontFamily || "Inter" }}>
                            {/* Rendering Generated Sections */}
                            {selectedPage.sections?.map((sec, idx) => {
                              if (sec.type === "hero") {
                                return (
                                  <div key={idx} className="text-center py-10 space-y-4 border-b border-slate-800">
                                    <h1 className="text-2xl font-extrabold text-white tracking-tight">{sec.heading}</h1>
                                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">{sec.subheading}</p>
                                    <button
                                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-lg"
                                      style={{ backgroundColor: selectedPage.theme?.primaryColor }}
                                    >
                                      {sec.ctaText}
                                    </button>
                                  </div>
                                );
                              }
                              if (sec.type === "features") {
                                return (
                                  <div key={idx} className="py-6 border-b border-slate-800">
                                    <h2 className="text-base font-bold text-center text-white mb-4">{sec.heading}</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      {sec.items?.map((item: any, iIdx: number) => (
                                        <div key={iIdx} className="bg-slate-900/50 p-3 rounded-lg border border-slate-800 text-center">
                                          <Zap className="w-5 h-5 mx-auto text-indigo-400 mb-2" />
                                          <h3 className="text-xs font-bold text-white">{item.title}</h3>
                                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ========================================================
                TAB: SMART FORM BUILDER (AI GENERATED)
                ======================================================== */}
            {activeTab === "forms" && (
              <div className="space-y-6">
                {/* AI Form generator */}
                {!showFormEditor && (
                  <div className="bg-slate-950/80 border border-indigo-500/20 rounded-xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      <h2 className="text-base font-bold text-white">
                        {isAr ? "توليد قوالب النماذج الذكية متعددة الخطوات (AI)" : "AI Multi-Step Smart Form Generator"}
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">{isAr ? "المجال / النشاط التجاري" : "Industry"}</label>
                        <input
                          type="text"
                          value={aiFormInput.industry}
                          onChange={(e) => setAiFormInput({ ...aiFormInput, industry: e.target.value })}
                          placeholder="e.g., Real Estate, Consulting"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-slate-400 font-medium">{isAr ? "الهدف أو العرض من النموذج" : "Offer / Purpose of Form"}</label>
                        <input
                          type="text"
                          value={aiFormInput.purpose}
                          onChange={(e) => setAiFormInput({ ...aiFormInput, purpose: e.target.value })}
                          placeholder="e.g., Free consultation, Get Pricing Plan"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-800">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-300">
                          <input
                            type="radio"
                            checked={aiFormInput.language === "ar"}
                            onChange={() => setAiFormInput({ ...aiFormInput, language: "ar" })}
                          />
                          العربية
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-300">
                          <input
                            type="radio"
                            checked={aiFormInput.language === "en"}
                            onChange={() => setAiFormInput({ ...aiFormInput, language: "en" })}
                          />
                          English
                        </label>
                      </div>

                      <button
                        onClick={handleGenerateFormAI}
                        disabled={aiGenerating}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-5 py-2.5 rounded-lg flex items-center gap-2 border border-indigo-400/20 shadow-md transition-all disabled:opacity-50"
                      >
                        {aiGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                        {aiGenerating ? (isAr ? "جاري صياغة النموذج..." : "Designing Multi-Step Layout...") : (isAr ? "توليد النموذج الفوري ⚡" : "Generate Instant Form ⚡")}
                      </button>
                    </div>
                  </div>
                )}

                {/* Form Lists and Editor */}
                {!showFormEditor ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-white">{isAr ? "النماذج الذكية المخزنة" : "Saved Capture Forms"}</h3>
                    {forms.length === 0 ? (
                      <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-10 text-center">
                        <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-400">{isAr ? "لا توجد نماذج بعد. قم بتوليد نموذج فوق!" : "No smart forms found. Start generating one above!"}</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {forms.map((form) => (
                          <div key={form.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="bg-slate-800 text-indigo-400 border border-indigo-500/10 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold">
                                  {form.steps?.length} {isAr ? "خطوات" : "Steps"}
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white mt-3">{form.name}</h4>
                              <p className="text-xs text-slate-500 mt-1">
                                {isAr ? "حقول ملتقطة: " : "Variables: "}
                                {form.steps?.flatMap((s) => s.fields?.map((f) => f.label)).join(", ")}
                              </p>

                              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/60 font-mono">
                                <div className="text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
                                  <span className="block text-[10px] text-slate-500">{isAr ? "الزيارات" : "Views"}</span>
                                  <span className="text-xs text-white font-bold">{form.views || 0}</span>
                                </div>
                                <div className="text-center bg-slate-900/40 p-1.5 rounded-lg border border-slate-800/40">
                                  <span className="block text-[10px] text-slate-500">{isAr ? "الإكمالات" : "Completions"}</span>
                                  <span className="text-xs text-emerald-400 font-bold">{form.conversions || 0}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                              <button
                                onClick={() => {
                                  setSelectedForm(form);
                                  setShowFormEditor(true);
                                }}
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700 transition-all"
                              >
                                {isAr ? "تحرير وتضمين" : "Customize & Embed"}
                              </button>
                              <button
                                onClick={() => handleDeleteForm(form.id)}
                                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/10 transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  selectedForm && (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-6">
                      <div className="flex justify-between items-center pb-4 border-b border-slate-800 mb-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowFormEditor(false)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <h3 className="text-sm font-bold text-white">
                            {isAr ? "أدوات تحرير النموذج وتخصيص الحقول" : "Multi-Step Form Builder Editor"} - {selectedForm.name}
                          </h3>
                        </div>

                        <button
                          onClick={() => handleUpdateForm(selectedForm)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-4 py-2 rounded-lg font-bold"
                        >
                          {isAr ? "حفظ وتعديل النموذج" : "Save Changes"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left config */}
                        <div className="lg:col-span-5 space-y-4">
                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                            <h4 className="text-xs font-bold text-white">{isAr ? "خصائص النموذج" : "General Properties"}</h4>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-slate-400 font-medium">{isAr ? "اسم النموذج" : "Form Name"}</label>
                              <input
                                type="text"
                                value={selectedForm.name}
                                onChange={(e) => setSelectedForm({ ...selectedForm, name: e.target.value })}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                            <h4 className="text-xs font-bold text-white">{isAr ? "خطوات الحقول وقواعد النوايا" : "Steps Configuration"}</h4>
                            {selectedForm.steps?.map((step, sIdx) => (
                              <div key={sIdx} className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                                <span className="text-[10px] text-indigo-400 font-bold">الخطوة {sIdx + 1}: {step.stepTitle}</span>
                                {step.fields?.map((fld, fIdx) => (
                                  <div key={fIdx} className="text-xs text-slate-300 flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800/80">
                                    <span>{fld.label} <span className="text-[9px] text-slate-500">({fld.type})</span></span>
                                    <X className="w-3 h-3 text-slate-500 cursor-pointer hover:text-rose-400" />
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Visual Form Mockup Live preview */}
                        <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col justify-between">
                          <div className="space-y-4 max-w-md mx-auto w-full py-10">
                            <div className="text-center">
                              <h3 className="text-lg font-bold text-white">{selectedForm.name}</h3>
                              <p className="text-xs text-slate-400 mt-1">{isAr ? "يرجى إكمال خطوات التأهيل" : "Please complete the qualification steps"}</p>
                            </div>

                            {selectedForm.steps?.map((step, sIdx) => {
                              // Render only first step as preview
                              if (sIdx > 0) return null;
                              return (
                                <div key={sIdx} className="space-y-4 bg-slate-950 p-5 rounded-xl border border-slate-800 shadow-lg">
                                  <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 px-2 py-0.5 rounded-full font-mono">{step.stepTitle}</span>
                                  {step.fields?.map((fld, fIdx) => (
                                    <div key={fIdx} className="space-y-1.5">
                                      <label className="text-xs text-slate-300">{fld.label} {fld.required && "*"}</label>
                                      <input
                                        type={fld.type === "email" ? "email" : fld.type === "tel" ? "tel" : "text"}
                                        placeholder={fld.placeholder}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                                        disabled
                                      />
                                    </div>
                                  ))}
                                  <button
                                    className="w-full bg-indigo-600 text-white text-xs py-2 rounded-lg font-bold mt-4"
                                    disabled
                                  >
                                    {isAr ? "التالي" : "Next Step"}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* ========================================================
                TAB: SMART POPUPS BUILDER
                ======================================================== */}
            {activeTab === "popups" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-white">{isAr ? "النوافذ المنبثقة الذكية المخزنة" : "Smart Triggered Popups"}</h3>
                  <button
                    onClick={() => handleCreatePopup({
                      name: "عرض الخروج الخاص 🛒",
                      type: "discount",
                      triggerType: "exit-intent",
                      triggerValue: "0",
                      title: "انتظر! لا ترحل فارغ اليدين",
                      description: "احصل على خصم 20% فوري على اشتراكك السنوي عند ملء النموذج الآن.",
                      ctaText: "احصل على الخصم",
                      status: "Active"
                    })}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    {isAr ? "إنشاء نافذة ذكية" : "New Active Popup"}
                  </button>
                </div>

                {popups.length === 0 ? (
                  <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-10 text-center">
                    <MousePointerClick className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">{isAr ? "لا توجد نوافذ منبثقة بعد." : "No active popups defined yet."}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popups.map((pop) => (
                      <div key={pop.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between shadow-sm">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border",
                              pop.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800 text-slate-400 border-slate-700"
                            )}>
                              {pop.status}
                            </span>
                            <span className="text-[10px] text-indigo-400 font-mono font-bold uppercase">{pop.triggerType}</span>
                          </div>
                          <h4 className="text-sm font-bold text-white mt-3">{pop.name}</h4>
                          <p className="text-xs text-slate-300 mt-2 bg-slate-900/50 p-2.5 rounded-lg border border-slate-800/60 font-medium">
                            {pop.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{pop.description}</p>
                        </div>

                        <div className="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                          <button
                            onClick={() => {
                              const nextStatus = pop.status === "Active" ? "Inactive" : "Active";
                              handleUpdatePopup({ ...pop, status: nextStatus });
                            }}
                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs py-2 rounded-lg border border-slate-700 transition-all"
                          >
                            {pop.status === "Active" ? (isAr ? "إيقاف التشغيل" : "Deactivate") : (isAr ? "تفعيل وتشغيل" : "Activate")}
                          </button>
                          <button
                            onClick={() => handleDeletePopup(pop.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-2 rounded-lg border border-rose-500/10 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================
                TAB: SMART INTERACTIVE CHATBOT (DRIFT / DRIFT ASSISTANT)
                ======================================================== */}
            {activeTab === "chatbot" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Configurations Panel */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings className="w-4 h-4 text-indigo-400" />
                      {isAr ? "إعدادات العميل الذكي للمبيعات (Drift Style)" : "AI Chat Agent Parameters"}
                    </h3>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">{isAr ? "اسم المساعد" : "Agent Name"}</label>
                      <input
                        type="text"
                        value={chatbotConfig.name}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">{isAr ? "رسالة الترحيب الأولى" : "First Greeting Message"}</label>
                      <textarea
                        value={chatbotConfig.greeting}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, greeting: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white h-20 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs text-slate-400 font-medium">System Prompt & Context</label>
                      <textarea
                        value={chatbotConfig.systemPrompt}
                        onChange={(e) => setChatbotConfig({ ...chatbotConfig, systemPrompt: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white h-24 focus:outline-none font-mono"
                      />
                    </div>

                    <button
                      onClick={handleSaveChatbotConfig}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 rounded-lg transition-all"
                    >
                      {isAr ? "حفظ وتعديل الإعدادات" : "Save Chatbot Settings"}
                    </button>
                  </div>
                </div>

                {/* Live Interactive Chat Simulator */}
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-xl" style={{ height: "550px" }}>
                  <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                      <h3 className="text-xs font-bold text-white">{chatbotConfig.name}</h3>
                    </div>
                    <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full font-mono">Simulating Live</span>
                  </div>

                  {/* Message feed */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "max-w-[75%] p-3 rounded-xl text-xs leading-relaxed",
                          msg.role === "assistant"
                            ? "bg-slate-800 text-slate-100 self-start mr-auto border border-slate-700/55"
                            : "bg-indigo-600 text-white self-end ml-auto"
                        )}
                        style={{ alignSelf: msg.role === "assistant" ? "flex-start" : "flex-end" }}
                      >
                        {msg.content}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="bg-slate-800 text-slate-400 p-3 rounded-xl text-xs self-start mr-auto w-14 flex justify-center border border-slate-700/50">
                        <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
                      </div>
                    )}
                  </div>

                  {/* Extracted lead data widget */}
                  <div className="bg-slate-900/80 px-4 py-2 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono">
                    <div>
                      <span className="text-slate-500">Name:</span>{" "}
                      <span className={extractedVars.name ? "text-emerald-400 font-bold" : "text-slate-600"}>{extractedVars.name || "[Extracting]"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Email:</span>{" "}
                      <span className={extractedVars.email ? "text-emerald-400 font-bold" : "text-slate-600"}>{extractedVars.email || "[Extracting]"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Company:</span>{" "}
                      <span className={extractedVars.company ? "text-emerald-400 font-bold" : "text-slate-600"}>{extractedVars.company || "[Extracting]"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Phone:</span>{" "}
                      <span className={extractedVars.phone ? "text-emerald-400 font-bold" : "text-slate-600"}>{extractedVars.phone || "[Extracting]"}</span>
                    </div>
                  </div>

                  {/* Input form */}
                  <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={isAr ? "اكتب رسالتك لمحاكاة الحوار..." : "Type simulated user query..."}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-lg transition-all"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB: DATA ENRICHMENT & SCORING RULES
                ======================================================== */}
            {activeTab === "enrichment" && (
              <div className="space-y-6">
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    {isAr ? "محرك إثراء وتأهيل البيانات المتقدم (Clearbit/Apollo Style)" : "Enrichment & Sales Intelligence Console"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAr
                      ? "يكتشف هذا المحرك تلقائياً حجم موظفي الشركة، النطاق المستهدف، تقنيات التشغيل، والأرباح التقديرية للشركات فور ملء البيانات لإسناد مندوب مبيعات وتجنب البيانات المقلدة والوهمية."
                      : "Automatically fetches headcount, technologies used, estimated ARR and corporate data from the lead domain to prioritize and score them."}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Lead Scoring rules configuring */}
                  <div className="lg:col-span-4 bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">{isAr ? "إسناد نقاط الأهمية والتحويل" : "Lead Scoring Weight Config"}</h4>
                    <div className="space-y-3 text-xs">
                      <div className="space-y-1.5">
                        <label className="text-slate-400">حجم الشركة المستهدف (موظف)</label>
                        <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white">
                          <option>&gt; 100 (+40 points)</option>
                          <option>&gt; 10 (+15 points)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400">معدل الميزانية المقبولة (SAR)</label>
                        <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white">
                          <option>&gt; 50,000 (+50 points)</option>
                          <option>&gt; 10,000 (+20 points)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-400">نطاق الدولة المستهدفة</label>
                        <select className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2 py-1.5 text-white">
                          <option>Saudi Arabia (+30 points)</option>
                          <option>All countries</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* List of Enriched leads */}
                  <div className="lg:col-span-8 bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                    <h4 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">{isAr ? "العملاء الملتقطين الذين تم إثراؤهم" : "Recently Enriched B2B Profiles"}</h4>
                    <div className="space-y-3">
                      {submissions.filter((s) => s.enrichedData).length === 0 ? (
                        <p className="text-xs text-slate-500 font-mono text-center py-6">{isAr ? "لا توجد ملفات غنية حالياً. انقر على 'Deep Analyze' في سجل التحويلات لإثراء ملف العميل." : "No enriched records. Click Deep Analyze on submissions to populate company data."}</p>
                      ) : (
                        submissions.filter((s) => s.enrichedData).map((sub) => (
                          <div key={sub.id} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <span className="text-[10px] text-indigo-400 font-mono font-bold">{sub.enrichedData?.domain}</span>
                              <h5 className="text-xs font-bold text-white mt-1">{sub.enrichedData?.companyName}</h5>
                              <p className="text-[10px] text-slate-400 mt-1">{isAr ? "القطاع: " : "Industry: "}{sub.enrichedData?.industry}</p>
                            </div>
                            <div className="font-mono text-[10px] text-slate-300 space-y-1">
                              <div><span className="text-slate-500">{isAr ? "الموظفين: " : "Employees: "}</span> {sub.enrichedData?.size}</div>
                              <div><span className="text-slate-500">{isAr ? "الدخل التقديري: " : "ARR Revenue: "}</span> {sub.enrichedData?.revenue}</div>
                              <div><span className="text-slate-500">{isAr ? "التقنية: " : "Tech Stack: "}</span> {sub.enrichedData?.technologiesUsed}</div>
                            </div>
                            <div className="flex flex-col justify-between items-end">
                              <span className={cn(
                                "text-[10px] px-2.5 py-0.5 rounded-full font-bold",
                                sub.score === "Hot" ? "bg-emerald-500/10 text-emerald-400" : sub.score === "Warm" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                              )}>
                                {sub.score} Lead
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono mt-2">{sub.qualification?.assignedSalesRep || "غير معين"}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================
                TAB: SUBMISSIONS LOGS (CRITICAL INTEGRATION)
                ======================================================== */}
            {activeTab === "submissions" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* List container */}
                <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-xl p-5 overflow-hidden">
                  <h3 className="text-sm font-bold text-white mb-4">{isAr ? "سجل إدخالات وتحويلات العملاء" : "Acquisition Submission Records"}</h3>
                  <div className="space-y-3 overflow-y-auto max-h-[550px]">
                    {submissions.length === 0 ? (
                      <p className="text-xs text-slate-500 font-mono text-center py-10">{isAr ? "لا توجد عمليات التقاط حالية." : "No captured submissions recorded yet."}</p>
                    ) : (
                      submissions.map((sub) => (
                        <div
                          key={sub.id}
                          onClick={() => setSelectedSubmission(sub)}
                          className={cn(
                            "p-4 rounded-xl border cursor-pointer transition-all",
                            selectedSubmission?.id === sub.id
                              ? "bg-slate-800/80 border-indigo-500 shadow-sm"
                              : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/30"
                          )}
                        >
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-slate-400 font-bold">{sub.source || "Direct"}</span>
                            <span className="text-slate-500">{new Date(sub.createdAt).toLocaleDateString()}</span>
                          </div>

                          <div className="mt-2">
                            <h4 className="text-xs font-bold text-white">{sub.data?.name || "عميل محتمل مجهول"}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{sub.data?.email}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1">{isAr ? "الشركة: " : "Company: "}{sub.data?.company || "N/A"}</p>
                          </div>

                          <div className="mt-3 flex justify-between items-center">
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded-full font-bold",
                              sub.score === "Hot" ? "bg-emerald-500/10 text-emerald-400" : sub.score === "Warm" ? "bg-amber-500/10 text-amber-400" : "bg-slate-800 text-slate-400"
                            )}>
                              {sub.score}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {sub.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Submissions detail pane */}
                <div className="lg:col-span-5">
                  {selectedSubmission ? (
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">{isAr ? "تفاصيل الفرصة والتأهيل المتقدم" : "Sales Intel & Lead Profile"}</h3>
                        <span className="text-[10px] text-slate-500 font-mono">ID: {selectedSubmission.id.slice(-6)}</span>
                      </div>

                      {/* Deep AI Analysis Button */}
                      <button
                        onClick={() => handleRunAIEnrichment(selectedSubmission.id)}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        {isAr ? "إثراء البيانات وتقييم الأهمية بالذكاء الاصطناعي 🧠" : "AI Deep Qualify & Score 🧠"}
                      </button>

                      {/* Lead raw captured data */}
                      <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                        <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{isAr ? "البيانات المدخلة" : "Captured Fields"}</h4>
                        <div className="text-xs space-y-1.5 font-mono text-slate-300">
                          <div><span className="text-slate-500">{isAr ? "الاسم: " : "Name: "}</span> {selectedSubmission.data?.name}</div>
                          <div><span className="text-slate-500">{isAr ? "البريد: " : "Email: "}</span> {selectedSubmission.data?.email}</div>
                          <div><span className="text-slate-500">{isAr ? "الهاتف: " : "Phone: "}</span> {selectedSubmission.data?.phone}</div>
                          <div><span className="text-slate-500">{isAr ? "الشركة: " : "Company: "}</span> {selectedSubmission.data?.company}</div>
                          <div><span className="text-slate-500">{isAr ? "الميزانية: " : "Budget: "}</span> {selectedSubmission.data?.budget} SAR</div>
                          <div><span className="text-slate-500">{isAr ? "الرسالة: " : "Notes: "}</span> <p className="text-[11px] text-slate-400 font-sans mt-1 leading-relaxed">{selectedSubmission.data?.message}</p></div>
                        </div>
                      </div>

                      {/* AI Enrichment & Qualification Results */}
                      {selectedSubmission.enrichedData ? (
                        <div className="space-y-3">
                          <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/10 space-y-2">
                            <h4 className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{isAr ? "ملف الشركة الغني (Clearbit Simulated)" : "Clearbit Company Profile"}</h4>
                            <div className="text-xs space-y-1 font-mono text-slate-300">
                              <div><span className="text-slate-500">{isAr ? "النطاق الرسمي: " : "Domain: "}</span> <a href={`https://${selectedSubmission.enrichedData.domain}`} target="_blank" className="text-indigo-400 hover:underline">{selectedSubmission.enrichedData.domain}</a></div>
                              <div><span className="text-slate-500">{isAr ? "الموظفين: " : "Headcount: "}</span> {selectedSubmission.enrichedData.size}</div>
                              <div><span className="text-slate-500">{isAr ? "العائد السنوي: " : "ARR Revenue: "}</span> {selectedSubmission.enrichedData.revenue}</div>
                              <div><span className="text-slate-500">{isAr ? "الحجم / النشاط: " : "Industry: "}</span> {selectedSubmission.enrichedData.industry}</div>
                              <div><span className="text-slate-500">{isAr ? "التقنيات: " : "Tech Stack: "}</span> <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-relaxed">{selectedSubmission.enrichedData.technologiesUsed}</p></div>
                            </div>
                          </div>

                          <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10 space-y-3">
                            <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">{isAr ? "تأهيل وتوزيع مبيعات Madarij (AI)" : "Sales Intelligence Routing"}</h4>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">{isAr ? "مستوى الأهمية:" : "AI Score:"}</span>
                              <span className="text-emerald-400 font-bold">{selectedSubmission.qualification?.score}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">{isAr ? "احتمالية الإغلاق:" : "Conversion Prob:"}</span>
                              <span className="text-white font-bold">{selectedSubmission.qualification?.conversionProbability}%</span>
                            </div>
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-slate-400">{isAr ? "مندوب المبيعات الموجه:" : "Routed Sales Rep:"}</span>
                              <span className="text-white font-bold">{selectedSubmission.qualification?.assignedSalesRep}</span>
                            </div>
                            <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 font-sans leading-relaxed">
                              <span className="font-bold text-slate-400 block mb-0.5">{isAr ? "تحليل النية والتأهيل:" : "Qualification Verdict:"}</span>
                              {selectedSubmission.qualification?.qualificationExplanation}
                            </div>
                            <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 font-sans leading-relaxed">
                              <span className="font-bold text-slate-400 block mb-0.5">{isAr ? "الإجراء الموصى به:" : "Recommended Sales Action:"}</span>
                              {selectedSubmission.qualification?.recommendedFollowUp}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-900/40 p-5 rounded-xl border border-slate-800 text-center text-xs text-slate-500 font-mono">
                          {isAr ? "انقر على زر 'إثراء البيانات' أعلاه لتأهيل العميل آلياً ومزامنته." : "Run AI Qualify to fetch Clearbit metrics."}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-950/30 border border-slate-800 rounded-xl p-10 text-center text-xs text-slate-500 font-mono">
                      {isAr ? "اختر عميلاً من القائمة لعرض التفاصيل وإثراء بياناته." : "Select a submission to examine sales enrichment."}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
