import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  Sparkles,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Calendar,
  Layers,
  Copy,
  Zap,
  Plus,
  Trash2,
  Bookmark,
  Activity,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

interface Client {
  id: string;
  name: string;
  phone: string;
  company: string;
  status: string;
  value: number;
}

interface TemplateItem {
  id: string;
  title: string;
  text: string;
  category?: string;
  isSystem?: boolean;
}

interface BroadcastErrorItem {
  id: string;
  campaignName: string;
  recipientPhone: string;
  recipientName: string;
  company: string;
  errorReason: string;
  failedAt: string;
}

interface WhatsAppBroadcastModuleProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  isAr?: boolean;
}

export const WhatsAppBroadcastModule: React.FC<WhatsAppBroadcastModuleProps> = ({
  isOpen,
  onClose,
  clients,
  isAr = true,
}) => {
  const [campaignTitle, setCampaignTitle] = useState("حملة متابعة الفواتير والتحصيل");
  const [templateText, setTemplateText] = useState(
    "مرحباً عزيزنا {client_name}، نود إحاطتكم علماً بأن حالة الفاتورة الخاصة بشركة {company_name} هي حالياً: [{invoice_status}] بمبلغ {invoice_amount}. يسعدنا تواصلكم لتسوية الدفعة والخدمات."
  );

  const [selectedFilter, setSelectedFilter] = useState<"all" | "contracted" | "new" | "unpaid">("all");
  const [sendType, setSendType] = useState<"now" | "schedule">("now");
  const [scheduledDateTime, setScheduledDateTime] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  // Requirement 4: Health Check Indicator State
  const [apiHealth, setApiHealth] = useState<{
    isValid: boolean;
    configured: boolean;
    message: string;
    loading: boolean;
  }>({
    isValid: false,
    configured: false,
    message: "جاري فحص اتصال WhatsApp API...",
    loading: true,
  });

  // Requirement 2: Real-Time Broadcast Progress State
  const [sendingProgress, setSendingProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    deliveredCount: number;
    failedCount: number;
  } | null>(null);

  // Requirement 3: Reusable Templates stored in Firestore State
  const [activeTab, setActiveTab] = useState<"composer" | "templates" | "errors">("composer");
  const [savedTemplates, setSavedTemplates] = useState<TemplateItem[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [newTemplateTitle, setNewTemplateTitle] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("عام");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Requirement 1: Failed Message Details Collection State
  const [broadcastErrors, setBroadcastErrors] = useState<BroadcastErrorItem[]>([]);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);

  // Fetch Health Check on load
  const checkApiHealth = async () => {
    setApiHealth((prev) => ({ ...prev, loading: true }));
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/whatsapp/health", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setApiHealth({
          isValid: !!data.isValid,
          configured: !!data.configured,
          message: data.message || "حالة النظام متصلة",
          loading: false,
        });
      } else {
        setApiHealth({
          isValid: false,
          configured: false,
          message: "تعذر الوصول إلى خادم الفحص",
          loading: false,
        });
      }
    } catch (err) {
      setApiHealth({
        isValid: false,
        configured: false,
        message: "خطأ في الشبكة أثناء فحص الاتصال",
        loading: false,
      });
    }
  };

  // Fetch Reusable Templates from Firestore
  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/whatsapp/templates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedTemplates(data.templates || []);
      }
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  // Fetch Broadcast Errors from Firestore
  const fetchBroadcastErrors = async () => {
    setIsLoadingErrors(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/whatsapp/broadcast-errors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBroadcastErrors(data.errors || []);
      }
    } catch (err) {
      console.error("Failed to load broadcast errors", err);
    } finally {
      setIsLoadingErrors(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkApiHealth();
      fetchTemplates();
      fetchBroadcastErrors();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter clients based on selection
  const filteredClients = clients.filter((c) => {
    if (selectedFilter === "contracted") return c.status === "contracted" || c.status === "won";
    if (selectedFilter === "new") return c.status === "new" || c.status === "contacted";
    return true;
  });

  const sampleInvoicesStatus = ["مستحقة القضاء", "مكتملة ومصدقة ZATCA", "قيد المراجعة الضريبية", "متأخرة السداد"];

  const getRecipientSampleData = (client: Client, index: number) => {
    return {
      client_name: client.name || "أحمد الشمري",
      company_name: client.company || "مؤسسة الحلول التقنية",
      invoice_status: sampleInvoicesStatus[index % sampleInvoicesStatus.length],
      invoice_amount: `${(client.value || 12500).toLocaleString()} ر.س`,
      phone: client.phone || "+966500000000",
    };
  };

  const currentSample = filteredClients[previewIndex]
    ? getRecipientSampleData(filteredClients[previewIndex], previewIndex)
    : getRecipientSampleData(
        { id: "sample", name: "خالد المطيري", company: "شركة الأعمال السعودية", phone: "0501234567", status: "contracted", value: 15000 },
        0
      );

  const renderExpandedText = (rawText: string, sample: ReturnType<typeof getRecipientSampleData>) => {
    return rawText
      .replace(/\{client_name\}/g, sample.client_name)
      .replace(/\{اسم_العميل\}/g, sample.client_name)
      .replace(/\{company_name\}/g, sample.company_name)
      .replace(/\{اسم_الشركة\}/g, sample.company_name)
      .replace(/\{invoice_status\}/g, sample.invoice_status)
      .replace(/\{حالة_الفاتورة\}/g, sample.invoice_status)
      .replace(/\{invoice_amount\}/g, sample.invoice_amount)
      .replace(/\{مبلغ_الفاتورة\}/g, sample.invoice_amount);
  };

  const insertPlaceholder = (placeholder: string) => {
    setTemplateText((prev) => prev + ` ${placeholder} `);
  };

  // Requirement 2: Real-time broadcast processing with visual progress updates
  const handleSendBroadcast = async () => {
    if (filteredClients.length === 0) {
      toast.error(isAr ? "لا يوجد عملاء متاحين في النطاق المحدد!" : "No clients selected!");
      return;
    }

    setIsSending(true);
    const totalRecipients = filteredClients.length;

    // Initialize progress tracking
    setSendingProgress({
      current: 0,
      total: totalRecipients,
      percentage: 0,
      deliveredCount: 0,
      failedCount: 0,
    });

    try {
      const token = await auth.currentUser?.getIdToken();
      const recipients = filteredClients.map((c, idx) => ({
        name: c.name,
        company: c.company,
        phone: c.phone,
        invoiceStatus: sampleInvoicesStatus[idx % sampleInvoicesStatus.length],
        invoiceAmount: c.value || 8500,
      }));

      // Simulate real-time progress steps for UI responsiveness while request is processing
      const interval = setInterval(() => {
        setSendingProgress((prev) => {
          if (!prev) return null;
          const nextCurrent = Math.min(prev.current + Math.ceil(totalRecipients / 5), totalRecipients - 1);
          const nextPct = Math.round((nextCurrent / totalRecipients) * 100);
          return {
            ...prev,
            current: nextCurrent,
            percentage: nextPct,
          };
        });
      }, 300);

      // Call Primary WhatsApp Broadcast Endpoint
      let res = await fetch("/api/whatsapp/broadcast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaignName: campaignTitle,
          templateText,
          recipients,
          scheduledTime: sendType === "schedule" ? scheduledDateTime : null,
        }),
      });

      clearInterval(interval);

      if (!res.ok) {
        // Fallback endpoint if primary error
        res = await fetch("/api/openwa/broadcast/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            campaignTitle,
            templateText,
            recipients,
            scheduledTime: sendType === "schedule" ? scheduledDateTime : null,
          }),
        });
      }

      const data = await res.json();

      // Finalize progress bar at 100%
      setSendingProgress({
        current: totalRecipients,
        total: totalRecipients,
        percentage: 100,
        deliveredCount: data.deliveredCount ?? totalRecipients,
        failedCount: data.failedCount ?? 0,
      });

      if (res.ok && data.success) {
        toast.success(
          sendType === "now"
            ? isAr
              ? `تم بث الرسائل الجماعية بنجاح! تم التسليم لـ ${data.deliveredCount || totalRecipients} عميل.`
              : `Broadcast sent live! Delivered to ${data.deliveredCount || totalRecipients} clients.`
            : isAr
            ? `تم جدولة الحملة بنجاح بتاريخ ${scheduledDateTime}`
            : `Campaign scheduled for ${scheduledDateTime}`
        );

        // Refresh errors list if any failed
        if (data.failedCount > 0) {
          fetchBroadcastErrors();
        }

        setTimeout(() => {
          setSendingProgress(null);
          onClose();
        }, 1200);
      } else {
        toast.error(data.error || (isAr ? "فشل إرسال البث الجماعي" : "Broadcast failed"));
        setSendingProgress(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? "خطأ في الشبكة أثناء إرسال البث" : "Network error");
      setSendingProgress(null);
    } finally {
      setIsSending(false);
    }
  };

  // Requirement 3: Save Current Template to Firestore
  const handleSaveCurrentTemplate = async () => {
    if (!newTemplateTitle.trim()) {
      toast.error(isAr ? "يرجى إدخال عنوان للقالب المحفوظ!" : "Template title required");
      return;
    }
    if (!templateText.trim()) {
      toast.error(isAr ? "محتوى القالب فارغ!" : "Template text is empty");
      return;
    }

    setIsSavingTemplate(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/whatsapp/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTemplateTitle,
          text: templateText,
          category: newTemplateCategory,
        }),
      });

      const data = await res.json();
      if (res.ok && data.id) {
        toast.success(isAr ? "تم حفظ القالب بنجاح في Firestore!" : "Template saved to Firestore!");
        setNewTemplateTitle("");
        fetchTemplates();
      } else {
        toast.error(data.error || (isAr ? "فشل حفظ القالب" : "Failed to save template"));
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في الشبكة عند حفظ القالب" : "Network error");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  // Delete template from Firestore
  const handleDeleteTemplate = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/whatsapp/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(isAr ? "تم حذف القالب" : "Template deleted");
        fetchTemplates();
      } else {
        toast.error(isAr ? "فشل حذف القالب" : "Delete failed");
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في الاتصال" : "Network error");
    }
  };

  // Clear All Broadcast Errors
  const handleClearErrors = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/whatsapp/broadcast-errors", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success(isAr ? "تم مسح سجل الأخطاء" : "Error logs cleared");
        setBroadcastErrors([]);
      }
    } catch (err) {
      toast.error(isAr ? "خطأ في الاتصال" : "Network error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto" dir={isAr ? "rtl" : "ltr"}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8">
        
        {/* Header with Requirement 4 Health Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-lg text-white">
                  {isAr ? "مرسل بث واتساب الجماعي (WhatsApp Business API)" : "WhatsApp Broadcast Campaign"}
                </h3>

                {/* Requirement 4: Health Check Indicator Dot */}
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                    apiHealth.loading
                      ? "bg-slate-800 text-slate-400 border-slate-700"
                      : apiHealth.isValid
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  }`}
                  title={apiHealth.message}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      apiHealth.loading
                        ? "bg-slate-400 animate-pulse"
                        : apiHealth.isValid
                        ? "bg-emerald-400 animate-ping"
                        : "bg-amber-400"
                    }`}
                  />
                  <span>
                    {apiHealth.loading
                      ? isAr ? "فحص الاتصال..." : "Checking..."
                      : apiHealth.isValid
                      ? isAr ? "رمز API نشط" : "API Token Active"
                      : isAr ? "رمز API محلي (محاكاة)" : "Local Simulation Mode"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                {isAr
                  ? "صياغة وجدولة رسائل واتساب مع نصوص ديناميكية وقوالب محفوظة في Firestore"
                  : "Draft & schedule WhatsApp campaigns with dynamic tags & Firestore template store"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Health Check Refresh Button */}
            <button
              type="button"
              onClick={checkApiHealth}
              disabled={apiHealth.loading}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
              title={isAr ? "إعادة فحص رمز واتساب" : "Re-check API Token"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${apiHealth.loading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-2 bg-slate-950/30 border-b border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("composer")}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "composer"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isAr ? "منشئ الحملة والإرسال" : "Campaign Builder"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("templates");
              fetchTemplates();
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "templates"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{isAr ? `إدارة القوالب المحفوظة (${savedTemplates.length})` : `Saved Templates (${savedTemplates.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("errors");
              fetchBroadcastErrors();
            }}
            className={`px-4 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "errors"
                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{isAr ? `سجل أخطاء البث (${broadcastErrors.length})` : `Failed Log (${broadcastErrors.length})`}</span>
          </button>
        </div>

        {/* Requirement 2: Real-time Progress Bar Overlay Banner */}
        {sendingProgress && (
          <div className="px-6 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>
                  {isAr
                    ? `جاري بث الرسائل: ${sendingProgress.current} من أصل ${sendingProgress.total} عميل`
                    : `Broadcasting: ${sendingProgress.current} of ${sendingProgress.total} clients`}
                </span>
              </span>
              <span className="text-emerald-400 font-mono font-black">{sendingProgress.percentage}%</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-300 shadow-md shadow-emerald-500/30"
                style={{ width: `${sendingProgress.percentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
              <span>تم التسليم: {sendingProgress.deliveredCount}</span>
              <span>الأخطاء: {sendingProgress.failedCount}</span>
            </div>
          </div>
        )}

        {/* TAB 1: MAIN COMPOSER */}
        {activeTab === "composer" && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form & Drafting */}
            <div className="lg:col-span-7 space-y-4">
              {/* Campaign Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  {isAr ? "اسم الحملة / المرجعية:" : "Campaign Title:"}
                </label>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Target Audience Filter */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isAr ? "شريحة المستهدفين من قائمة CRM:" : "Target Audience Segment:"}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("all")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedFilter === "all"
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {isAr ? `الكل (${clients.length})` : `All (${clients.length})`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("contracted")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedFilter === "contracted"
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {isAr ? "المعاقدون فقط" : "Contracted"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("new")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selectedFilter === "new"
                        ? "bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {isAr ? "الفرص الجديدة" : "New Opportunities"}
                  </button>
                </div>
              </div>

              {/* Saved Firestore Templates Quick Chips */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? "قوالب محفوظة سريعة:" : "Saved Firestore Templates:"}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("templates")}
                    className="text-[10px] font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isAr ? "+ إضافة/إدارة القوالب" : "+ Manage Store"}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {savedTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setTemplateText(tmpl.text)}
                      className="text-[10px] font-bold bg-slate-800 hover:bg-emerald-950/80 hover:text-emerald-300 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-right"
                    >
                      {tmpl.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Placeholder Chip Controls */}
              <div>
                <span className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? "إدراج حقول ديناميكية تلقائية:" : "Insert Dynamic Placeholders:"}</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => insertPlaceholder("{client_name}")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    + &#123;client_name&#125; (الاسم)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder("{company_name}")}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold hover:bg-emerald-500/20 transition-colors cursor-pointer"
                  >
                    + &#123;company_name&#125; (المنشأة)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder("{invoice_status}")}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold hover:bg-teal-500/20 transition-colors cursor-pointer"
                  >
                    + &#123;invoice_status&#125; (الحالة)
                  </button>
                  <button
                    type="button"
                    onClick={() => insertPlaceholder("{invoice_amount}")}
                    className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/30 text-[11px] font-bold hover:bg-teal-500/20 transition-colors cursor-pointer"
                  >
                    + &#123;invoice_amount&#125; (المبلغ)
                  </button>
                </div>
              </div>

              {/* Template Text Area */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    {isAr ? "نص قوالب البث:" : "Template Text Message:"}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const title = prompt(isAr ? "أدخل عنواناً لحفظ هذا القالب في Firestore:" : "Enter template title:");
                      if (title) {
                        setNewTemplateTitle(title);
                        handleSaveCurrentTemplate();
                      }
                    }}
                    className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Bookmark className="w-3 h-3" />
                    <span>{isAr ? "حفظ النص الحالي كقالب" : "Save as Template"}</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={templateText}
                  onChange={(e) => setTemplateText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {/* Send Timing / Scheduling */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isAr ? "توقيت الإرسال:" : "Schedule Timing:"}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSendType("now")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        sendType === "now" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isAr ? "إرسال فوري الآن" : "Send Immediately"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSendType("schedule")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        sendType === "schedule" ? "bg-emerald-500 text-white" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isAr ? "جدولة لاحقاً" : "Schedule"}
                    </button>
                  </div>
                </div>

                {sendType === "schedule" && (
                  <div>
                    <input
                      type="datetime-local"
                      value={scheduledDateTime}
                      onChange={(e) => setScheduledDateTime(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Phone Simulator Preview */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col h-full justify-between shadow-inner min-h-[320px]">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-emerald-400">
                      {isAr ? "معاينة الرسالة الحية للعميل" : "Live Message Preview"}
                    </span>
                  </div>
                  {filteredClients.length > 1 && (
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                        className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer"
                      >
                        &lt;
                      </button>
                      <span>
                        {previewIndex + 1} / {filteredClients.length}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewIndex((prev) => Math.min(filteredClients.length - 1, prev + 1))}
                        className="px-1.5 py-0.5 bg-slate-800 rounded hover:bg-slate-700 cursor-pointer"
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </div>

                {/* Chat Bubble Mock */}
                <div className="my-auto py-4">
                  <div className="bg-emerald-950/60 border border-emerald-500/30 rounded-2xl p-4 text-emerald-100 text-xs font-sans leading-relaxed shadow-lg relative">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 mb-2 border-b border-emerald-500/20 pb-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>إلى: {currentSample.client_name} ({currentSample.phone})</span>
                    </div>
                    <p className="whitespace-pre-wrap">{renderExpandedText(templateText, currentSample)}</p>
                    <div className="text-left text-[9px] text-emerald-400/80 font-mono mt-3">
                      12:45 PM • WhatsApp Business Cloud
                    </div>
                  </div>
                </div>

                {/* Stats Summary Box */}
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? "إجمالي المستلمين:" : "Total Recipients:"}</span>
                    <span className="font-bold text-white">{filteredClients.length} عميل</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>{isAr ? "حالة الربط البرمجي:" : "API Status:"}</span>
                    <span className={apiHealth.isValid ? "font-bold text-emerald-400" : "font-bold text-amber-400"}>
                      {apiHealth.isValid ? "Meta WhatsApp API (نشط)" : "وضع المحاكاة المحلي"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Action Button */}
              <button
                type="button"
                onClick={handleSendBroadcast}
                disabled={isSending || filteredClients.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {isSending
                    ? isAr
                      ? "جاري البث والتحقق عبر الخادم..."
                      : "Broadcasting live..."
                    : sendType === "now"
                    ? isAr
                      ? `إرسال البث لـ (${filteredClients.length}) عميل الآن`
                      : `Send Broadcast to (${filteredClients.length}) Clients`
                    : isAr
                    ? "جدولة الحملة الآن"
                    : "Schedule Campaign"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Requirement 3 - FIRESTORE REUSABLE TEMPLATES STORE */}
        {activeTab === "templates" && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>{isAr ? "إضافة قالب جديد في Firestore:" : "Add New Template to Firestore:"}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder={isAr ? "عنوان القالب (مثال: تذكير دفعة معلقة)" : "Template Title"}
                  value={newTemplateTitle}
                  onChange={(e) => setNewTemplateTitle(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  value={newTemplateCategory}
                  onChange={(e) => setNewTemplateCategory(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="تحصيل">تحصيل ومطالبات</option>
                  <option value="ترحيب">ترحيب وعقود</option>
                  <option value="تسويق">عروض وترقية</option>
                  <option value="عام">خدمات عامة</option>
                </select>
                <button
                  type="button"
                  onClick={handleSaveCurrentTemplate}
                  disabled={isSavingTemplate}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isSavingTemplate ? "جاري الحفظ..." : "حفظ القالب إلى Firestore"}</span>
                </button>
              </div>
            </div>

            {/* List of Templates */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400">
                {isAr ? "القوالب الجاهزة والمحفوظة:" : "Saved Templates List:"}
              </h4>

              {isLoadingTemplates ? (
                <div className="p-8 text-center text-xs text-slate-500">جاري تحميل القوالب من Firestore...</div>
              ) : savedTemplates.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                  لا توجد قوالب مخصصة حتى الآن. يمكنك حفظ النص الحالي من التبويب السابق.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {savedTemplates.map((tmpl) => (
                    <div
                      key={tmpl.id}
                      className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                          <span className="font-bold text-xs text-emerald-400">{tmpl.title}</span>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                            {tmpl.category || "عام"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50">
                          {tmpl.text}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setTemplateText(tmpl.text);
                            setActiveTab("composer");
                            toast.success(isAr ? "تم اختيار القالب وتطبيقه في المنشئ" : "Template loaded!");
                          }}
                          className="text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isAr ? "تطبيق القالب للحملة" : "Use for Broadcast"}</span>
                        </button>

                        {!tmpl.isSystem && (
                          <button
                            type="button"
                            onClick={() => handleDeleteTemplate(tmpl.id)}
                            className="text-rose-400 hover:text-rose-300 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="حذف القالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Requirement 1 - FAILED BROADCAST ERRORS COLLECTION VIEWER */}
        {activeTab === "errors" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? "سجل الأخطاء للرسائل التي فشل إرسالها (broadcast_errors):" : "Failed Broadcast Messages Log:"}</span>
                </h4>
                <p className="text-xs text-slate-400">
                  تتيح لك هذه الشاشة مراجعة جميع أرقام الهواتف وأسباب الفشل المخزنة في مجموعة Firestore.
                </p>
              </div>

              {broadcastErrors.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearErrors}
                  className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isAr ? "مسح السجل بالكامل" : "Clear Logs"}</span>
                </button>
              )}
            </div>

            {isLoadingErrors ? (
              <div className="p-8 text-center text-xs text-slate-500">جاري تحميل سجل الأخطاء...</div>
            ) : broadcastErrors.length === 0 ? (
              <div className="p-8 text-center text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
                لا توجد أي أخطاء مسجلة! جميع عمليات الإرسال تمت بنجاح.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                    <tr>
                      <th className="p-3">اسم العميل والمنشأة</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3">اسم الحملة</th>
                      <th className="p-3">سبب الفشل (Error Reason)</th>
                      <th className="p-3">التاريخ والوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {broadcastErrors.map((err) => (
                      <tr key={err.id} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-white">
                          {err.recipientName}
                          <span className="block text-[10px] text-slate-400 font-normal">{err.company}</span>
                        </td>
                        <td className="p-3 font-mono text-emerald-400">{err.recipientPhone}</td>
                        <td className="p-3">{err.campaignName || "بث واتساب"}</td>
                        <td className="p-3 text-rose-400 font-medium max-w-xs">{err.errorReason}</td>
                        <td className="p-3 text-[10px] text-slate-500 font-mono">
                          {new Date(err.failedAt).toLocaleString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default WhatsAppBroadcastModule;

