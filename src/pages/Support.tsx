import React, { useState, useEffect, useRef } from "react";
import {
  LifeBuoy,
  Search,
  Plus,
  MessageSquare,
  FileText,
  User,
  Tag,
  AlertCircle,
  Clock,
  Briefcase,
  CheckCircle2,
  Trash2,
  Sparkles,
  Send,
  BookOpen,
  BarChart3,
  Sliders,
  Smartphone,
  Check,
  ChevronRight,
  Filter,
  ArrowUpDown,
  CornerDownLeft,
  Settings,
  Bell,
  Scale,
  DollarSign,
  ShieldAlert,
  Bot,
  HelpCircle,
  CornerUpRight,
  Share2,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Zap,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useUser } from "../contexts/UserContext";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Interfaces
interface Ticket {
  id: string;
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  companyName: string;
  contactPhone: string;
  priority: "low" | "medium" | "high" | "urgent";
  category: string;
  department: string;
  status: "open" | "pending" | "resolved" | "closed";
  assignedAgent: string;
  watchers: string[];
  tags: string[];
  linkedProject?: string;
  linkedInvoice?: string;
  linkedProduct?: string;
  linkedContract?: string;
  aiSummary?: string;
  createdAt: string;
  updatedAt: string;
  urgency?: string;
  sentiment?: string;
  predictedCsat?: number;
  rating?: { score: number; comment: string; createdAt: string } | null;
  messages: Array<{
    id: string;
    sender: "customer" | "agent" | "system" | "bot";
    senderName: string;
    text: string;
    createdAt: string;
    read: boolean;
  }>;
}

interface KBArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  status: "draft" | "review" | "published";
  isPublic: boolean;
  views: number;
  helpfulCount: number;
  unhelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function Support() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "workspace" | "omnichannel" | "portal" | "kb" | "analytics" | "automations"
  >("workspace");

  // State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [kbArticles, setKbArticles] = useState<KBArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter/Search
  const [ticketSearch, setTicketSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Live Chat omni simulator
  const [activeChannel, setActiveChannel] = useState<"chat" | "whatsapp" | "telegram" | "email">(
    "chat"
  );
  const [chatbotEnabled, setChatbotEnabled] = useState(true);

  // New Ticket Form (Agent & Portal)
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [newTicketData, setNewTicketData] = useState({
    customerName: "",
    customerEmail: "",
    companyName: "",
    contactPhone: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    category: "Technical Support",
    department: "IT Support",
    linkedProject: "",
    linkedInvoice: "",
    linkedProduct: "",
    text: "",
  });

  // New Article Form
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [newArticleData, setNewArticleData] = useState({
    title: "",
    category: "عام",
    content: "",
    status: "published" as "draft" | "review" | "published",
    isPublic: true,
  });

  const [aiGeneratingArticle, setAiGeneratingArticle] = useState(false);
  const [aiAnalyzingTicket, setAiAnalyzingTicket] = useState(false);
  const [aiDraftingReply, setAiDraftingReply] = useState(false);
  const [aiDraftedReplyText, setAiDraftedReplyText] = useState("");

  // Quick Message reply text
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Portal Simulator Specific
  const [portalView, setPortalView] = useState<"home" | "tickets" | "kb" | "new_ticket">("home");
  const [portalSearch, setPortalSearch] = useState("");
  const [portalChatOpen, setPortalChatOpen] = useState(false);
  const [portalChatText, setPortalChatText] = useState("");

  // Project references for link option
  const [availableProjects, setAvailableProjects] = useState<any[]>([]);
  const [availableInvoices, setAvailableInvoices] = useState<any[]>([]);

  // Keyboard shortcut state visual helper
  const [showShortcutsInfo, setShowShortcutsInfo] = useState(false);

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || null;
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeTicket?.messages]);

  // Load Tickets & Articles
  useEffect(() => {
    if (!user) return;

    // Tickets Snapshot
    const qTickets = query(collection(db, "tickets"), where("userId", "==", user.uid));
    const unsubTickets = onSnapshot(
      qTickets,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Ticket[];
        // Sort by updated time
        list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        setTickets(list);
        setLoading(false);

        // Pre-select first ticket if none selected
        if (list.length > 0 && !selectedTicketId) {
          setSelectedTicketId(list[0].id);
        }
      },
      (err) => {
        console.error("Firestore sync tickets error:", err);
        setLoading(false);
      }
    );

    // Knowledge Articles Snapshot
    const qKb = query(collection(db, "knowledge_articles"), where("userId", "==", user.uid));
    const unsubKb = onSnapshot(
      qKb,
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as KBArticle[];
        setKbArticles(list);
      },
      (err) => {
        console.error("Firestore sync articles error:", err);
      }
    );

    // Fetch actual projects and invoices to link seamlessly!
    const fetchLinkedAssets = async () => {
      try {
        const projSnap = await getDocs(
          query(collection(db, "projects"), where("userId", "==", user.uid))
        );
        setAvailableProjects(projSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

        const invSnap = await getDocs(
          query(collection(db, "invoices"), where("userId", "==", user.uid))
        );
        setAvailableInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.warn("Could not load linked projects/invoices:", err);
      }
    };
    fetchLinkedAssets();

    return () => {
      unsubTickets();
      unsubKb();
    };
  }, [user]);

  // Seed standard tickets and KB articles if empty to make the platform look fully functional
  useEffect(() => {
    if (loading || !user) return;
    if (tickets.length === 0) {
      seedInitialData();
    }
  }, [loading, tickets]);

  const seedInitialData = async () => {
    if (!user) return;
    toast.info("جاري تهيئة بيانات الدعم الفني التجريبية...");

    const initialKB = [
      {
        title: "كيفية تفعيل الربط مع هيئة الزكاة والضريبة والجمارك (ZATCA)",
        category: "الربط الفني",
        content: `خطوات تفعيل الربط مع منصة فاتورة التابعة لهيئة الزكاة والضريبة والجمارك:
1. اذهب إلى قائمة **إعدادات الربط** في لوحة التحكم.
2. اختر **هيئة الزكاة والضريبة والجمارك (ZATCA)**.
3. اضغط على مفتاح **توليد شهادة التشفير (CSID)**.
4. املأ بيانات المنشأة الأساسية مثل الرقم الضريبي والموقع ونوع النشاط.
5. ادخل رمز التفعيل (OTP) الذي تم توليده من منصة فاتورة لمطابقة الربط بنجاح.`,
        status: "published",
        isPublic: true,
        views: 142,
        helpfulCount: 38,
        unhelpfulCount: 1,
      },
      {
        title: "خطوات موازنة الحسابات السنوية وإقفال القيود اليومية",
        category: "المحاسبة والمالية",
        content: `لإجراء عملية الإقفال السنوي ومطابقة الحسابات بنجاح في مدارج:
- تأكد من تسوية كافة البنوك والمطابقات المالية.
- تحقق من أن جميع فواتير الشراء والبيع والرواتب في وضع المعتمدة والمرحلة.
- قم بتوليد تقرير **ميزان المراجعة قبل الإقفال** وتأكد من تساوي الأطراف المدينة والدائنة.
- اضغط على زر **إجراء قيد الإقفال السنوي** لترحيل الأرباح والخسائر إلى الأرباح المبقاة.`,
        status: "published",
        isPublic: true,
        views: 95,
        helpfulCount: 22,
        unhelpfulCount: 0,
      },
    ];

    const initialTickets = [
      {
        ticketNumber: "T-1001",
        customerName: "سليمان الفوزان",
        customerEmail: "s.fawzan@riyadhcorp.sa",
        companyName: "مؤسسة الرياض للتوريد",
        contactPhone: "0502223344",
        priority: "urgent",
        category: "Billing",
        department: "Finance",
        status: "open",
        assignedAgent: "سارة الأحمد",
        watchers: ["أحمد خالد"],
        tags: ["فوترة", "فاتورة معلقة", "عاجل"],
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        messages: [
          {
            id: "m1",
            sender: "customer",
            senderName: "سليمان الفوزان",
            text: "مرحباً فريق الدعم، لدينا مشكلة بخصوص الفاتورة رقم INV-2026-004. لقد قمنا بالتحويل البنكي للمبلغ ولكن حالة الفاتورة لا تزال تظهر قيد الانتظار في حسابنا، يرجى تفعيلها عاجلاً.",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            read: false,
          },
        ],
      },
      {
        ticketNumber: "T-1002",
        customerName: "خالد الحربي",
        customerEmail: "khalid@alnajm.com",
        companyName: "شركة النجم الساطع التجارية",
        contactPhone: "0559988776",
        priority: "medium",
        category: "Technical Support",
        department: "IT Support",
        status: "pending",
        assignedAgent: "بندر المطيري",
        watchers: [],
        tags: ["ZATCA", "ربط ضريبي"],
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
        updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        messages: [
          {
            id: "m2_1",
            sender: "customer",
            senderName: "خالد الحربي",
            text: "السلام عليكم، تظهر لنا رسالة خطأ عند محاولة إرسال الفاتورة المبسطة إلى هيئة الزكاة ZATCA (خطأ في الرقم التسلسلي لجهاز الفوترة). يرجى المساعدة.",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            read: true,
          },
          {
            id: "m2_2",
            sender: "agent",
            senderName: "بندر المطيري",
            text: "وعليكم السلام يا أستاذ خالد. قمنا بالتحقق من ملف ربط جهازك ويبدو أن هناك كود منتهى الصلاحية. هل قمت بإعادة توليد كود الـ OTP مؤخراً؟ يرجى المحاولة وسنتابع معك.",
            createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
            read: true,
          },
        ],
      },
    ];

    try {
      for (const kb of initialKB) {
        await addDoc(collection(db, "knowledge_articles"), { ...kb, userId: user.uid });
      }
      for (const t of initialTickets) {
        await addDoc(collection(db, "tickets"), { ...t, userId: user.uid });
      }
      toast.success("تم إنشاء البيانات الافتراضية بنجاح!");
    } catch (err) {
      console.error("Error seeding support data:", err);
    }
  };

  // Keyboard Shortcuts Handler (Zendesk-style visual simulation / alert)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing shortcuts when user is actively typing in inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA")) {
        return;
      }

      // 'c' to create ticket
      if (e.key === "c" || e.key === "C") {
        e.preventDefault();
        setShowNewTicketModal(true);
      }
      // 's' to switch tabs/views
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        setShowShortcutsInfo((prev) => !prev);
      }
      // '1', '2', '3', '4', '5' to switch main sub-modules
      if (e.key === "1") {
        setActiveTab("workspace");
      }
      if (e.key === "2") {
        setActiveTab("omnichannel");
      }
      if (e.key === "3") {
        setActiveTab("portal");
      }
      if (e.key === "4") {
        setActiveTab("kb");
      }
      if (e.key === "5") {
        setActiveTab("analytics");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // CRUD Actions
  const handleCreateTicket = async () => {
    if (!newTicketData.customerName || !newTicketData.text) {
      toast.error("يرجى إدخال اسم العميل وشرح المشكلة.");
      return;
    }

    const tNum = "T-" + (1000 + tickets.length + 1);
    const payload: Partial<Ticket> = {
      ticketNumber: tNum,
      customerName: newTicketData.customerName,
      customerEmail: newTicketData.customerEmail || "customer@example.com",
      companyName: newTicketData.companyName || "شخصي",
      contactPhone: newTicketData.contactPhone || "",
      priority: newTicketData.priority,
      category: newTicketData.category,
      department: newTicketData.department,
      status: "open",
      assignedAgent: user?.name || "غير معين",
      watchers: [],
      tags: [newTicketData.category],
      linkedProject: newTicketData.linkedProject || undefined,
      linkedInvoice: newTicketData.linkedInvoice || undefined,
      linkedProduct: newTicketData.linkedProduct || undefined,
      messages: [
        {
          id: "m-" + Date.now(),
          sender: "customer",
          senderName: newTicketData.customerName,
          text: newTicketData.text,
          createdAt: new Date().toISOString(),
          read: false,
        },
      ],
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(`تم إنشاء التذكرة ${tNum} بنجاح!`);
        setShowNewTicketModal(false);
        setNewTicketData({
          customerName: "",
          customerEmail: "",
          companyName: "",
          contactPhone: "",
          priority: "medium",
          category: "Technical Support",
          department: "IT Support",
          linkedProject: "",
          linkedInvoice: "",
          linkedProduct: "",
          text: "",
        });
      } else {
        const err = await res.json();
        toast.error("فشل إنشاء التذكرة: " + err.error);
      }
    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال التذكرة.");
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: Ticket["status"]) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        toast.success(`تم تحديث حالة التذكرة إلى: ${status === "resolved" ? "تم الحل" : status}`);
      } else {
        toast.error("فشل تحديث التذكرة.");
      }
    } catch (err) {
      toast.error("خطأ شبكة.");
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه التذكرة نهائياً؟")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("تم حذف التذكرة بنجاح");
        setSelectedTicketId(null);
      } else {
        toast.error("فشل حذف التذكرة");
      }
    } catch (err) {
      toast.error("خطأ شبكة.");
    }
  };

  const handleSendMessage = async () => {
    if (!activeTicket || !replyText.trim()) return;

    const messagePayload = {
      id: "m-" + Date.now(),
      sender: isInternalNote ? ("system" as const) : ("agent" as const),
      senderName: user?.name || "مستشار الدعم",
      text: replyText.trim() + (isInternalNote ? " [ملاحظة داخلية]" : ""),
      createdAt: new Date().toISOString(),
      read: true,
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(messagePayload),
      });

      if (res.ok) {
        setReplyText("");
        setIsInternalNote(false);
      } else {
        toast.error("فشل إرسال الرسالة.");
      }
    } catch (err) {
      toast.error("خطأ شبكة.");
    }
  };

  // AI ACTIONS
  const handleAiSummarize = async () => {
    if (!activeTicket) return;
    setAiAnalyzingTicket(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${activeTicket.id}/copilot/summarize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Update ticket's aiSummary locally or in DB
        await updateDoc(doc(db, "tickets", activeTicket.id), { aiSummary: data.summary });
        toast.success("تم توليد التلخيص الذكي بنجاح!");
      } else {
        toast.error("فشل التلخيص عبر الذكاء الاصطناعي");
      }
    } catch (err) {
      toast.error("خطأ اتصال.");
    } finally {
      setAiAnalyzingTicket(false);
    }
  };

  const handleAiSuggestReply = async () => {
    if (!activeTicket) return;
    setAiDraftingReply(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${activeTicket.id}/copilot/suggest-reply`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAiDraftedReplyText(data.suggestedReply);
        toast.success("تم توليد اقتراح الرد الذكي من قاعدة المعرفة!");
      } else {
        toast.error("فشل اقتراح الرد.");
      }
    } catch (err) {
      toast.error("خطأ اتصال.");
    } finally {
      setAiDraftingReply(false);
    }
  };

  const handleAiCategorize = async () => {
    if (!activeTicket) return;
    setAiAnalyzingTicket(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/${activeTicket.id}/copilot/categorize`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // Update ticket parameters with AI suggestions
        await updateDoc(doc(db, "tickets", activeTicket.id), {
          category: data.category,
          priority: data.priority,
          department: data.department,
          urgency: data.urgency,
          sentiment: data.sentiment,
          predictedCsat: data.predictedCsat,
        });
        toast.success("تم تصنيف وتحليل مشاعر التذكرة بنجاح!");
      } else {
        toast.error("فشل تصنيف الذكاء الاصطناعي.");
      }
    } catch (err) {
      toast.error("خطأ تصنيف.");
    } finally {
      setAiAnalyzingTicket(false);
    }
  };

  const handleAiGenerateArticle = async () => {
    if (!newArticleData.title) {
      toast.error("يرجى إدخال عنوان المقال أولاً.");
      return;
    }
    setAiGeneratingArticle(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/tickets/kb/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newArticleData.title, category: newArticleData.category }),
      });
      if (res.ok) {
        const data = await res.json();
        setNewArticleData((prev) => ({ ...prev, content: data.content }));
        toast.success("تم توليد محتوى المقال التعليمي بالذكاء الاصطناعي!");
      } else {
        toast.error("فشل توليد المقال.");
      }
    } catch (err) {
      toast.error("خطأ توليد المقال.");
    } finally {
      setAiGeneratingArticle(false);
    }
  };

  const handleSaveArticle = async () => {
    if (!newArticleData.title || !newArticleData.content) {
      toast.error("يرجى استكمال الحقول.");
      return;
    }
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/tickets/kb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newArticleData),
      });

      if (res.ok) {
        toast.success("تم حفظ ونشر مقال قاعدة المعرفة بنجاح!");
        setShowNewArticleModal(false);
        setNewArticleData({
          title: "",
          category: "عام",
          content: "",
          status: "published",
          isPublic: true,
        });
      } else {
        toast.error("فشل حفظ المقال.");
      }
    } catch (err) {
      toast.error("خطأ اتصال.");
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟")) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/tickets/kb/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("تم حذف المقال.");
      } else {
        toast.error("فشل حذف المقال.");
      }
    } catch (err) {
      toast.error("خطأ.");
    }
  };

  // Convert ticket -> task auto simulation
  const handleConvertToTask = async () => {
    if (!activeTicket) return;
    try {
      // Trigger update containing createProjectTask flag to notify backend
      await updateDoc(doc(db, "tickets", activeTicket.id), {
        createProjectTask: true,
        linkedProject: activeTicket.linkedProject || "general-proj",
      });
      toast.success("تم تحويل التذكرة آلياً لمهمة تطوير في المشروع المربوط!");
    } catch (err) {
      toast.error("فشل التحويل.");
    }
  };

  // Refund approval automatic credit note sequence
  const handleApproveRefund = async () => {
    if (!activeTicket) return;
    try {
      await updateDoc(doc(db, "tickets", activeTicket.id), {
        status: "resolved",
        category: "Refund",
      });
      toast.success("تمت الموافقة على الاسترداد وتفعيل أتمتة الإشعارات المالية!");
    } catch (err) {
      toast.error("فشل تحديث الحالة.");
    }
  };

  // Customer Portal Live Chat simulation helpers
  const handleCustomerPortalChatSend = async () => {
    if (!portalChatText.trim()) return;

    // Put message onto active customer ticket (simulate T-1001 or first ticket)
    const activeTarget = tickets[0];
    if (!activeTarget) {
      toast.error("يرجى التأكد من وجود تذكرة واحدة على الأقل بالدعم.");
      return;
    }

    const customerMessage = {
      id: "cust-" + Date.now(),
      sender: "customer" as const,
      senderName: activeTarget.customerName,
      text: portalChatText.trim(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch(`/api/tickets/${activeTarget.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerMessage),
      });
      setPortalChatText("");
    } catch (err) {
      toast.error("فشل الإرسال.");
    }
  };

  // Filter computation
  const filteredTickets = tickets.filter((t) => {
    const sMatch = statusFilter === "all" || t.status === statusFilter;
    const pMatch = priorityFilter === "all" || t.priority === priorityFilter;
    const txt = ticketSearch.toLowerCase();
    const qMatch =
      t.customerName.toLowerCase().includes(txt) ||
      t.ticketNumber.toLowerCase().includes(txt) ||
      (t.category && t.category.toLowerCase().includes(txt)) ||
      (t.tags && t.tags.some((tag) => tag.toLowerCase().includes(txt)));
    return sMatch && pMatch && qMatch;
  });

  // KPI Calculations
  const totalTickets = tickets.length;
  const openTicketsCount = tickets.filter((t) => t.status === "open").length;
  const resolvedTicketsCount = tickets.filter((t) => t.status === "resolved").length;
  const pendingTicketsCount = tickets.filter((t) => t.status === "pending").length;
  const closedTicketsCount = tickets.filter((t) => t.status === "closed").length;
  const urgentTicketsCount = tickets.filter(
    (t) => t.priority === "urgent" || t.priority === "high"
  ).length;

  const slaCompliance =
    totalTickets > 0
      ? Math.round(((resolvedTicketsCount + closedTicketsCount) / totalTickets) * 100)
      : 100;

  // Chart Data preparation
  const categoryChartData = [
    {
      name: "الدعم الفني",
      value: tickets.filter((t) => t.category === "Technical Support").length,
    },
    {
      name: "المالية والفوترة",
      value: tickets.filter((t) => t.category === "Billing" || t.category === "Refund").length,
    },
    {
      name: "المبيعات والطلبات",
      value: tickets.filter((t) => t.category === "Sales Inquiry").length,
    },
    { name: "اقتراح ميزة", value: tickets.filter((t) => t.category === "Feature Request").length },
  ].filter((c) => c.value > 0);

  const satisfactionData = [
    {
      rating: "ممتاز (5⭐)",
      count: tickets.filter((t) => t.rating?.score === 5 || t.predictedCsat === 5).length,
    },
    {
      rating: "جيد جداً (4⭐)",
      count: tickets.filter((t) => t.rating?.score === 4 || t.predictedCsat === 4).length,
    },
    {
      rating: "مقبول (3⭐)",
      count: tickets.filter((t) => t.rating?.score === 3 || t.predictedCsat === 3).length,
    },
    {
      rating: "سيء (2-1⭐)",
      count: tickets.filter((t) => (t.rating?.score || 0) <= 2 && (t.predictedCsat || 0) <= 2)
        .length,
    },
  ];

  const SLAColors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-100 font-sans" dir="rtl">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-100 px-6 py-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <LifeBuoy className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
              منصة الدعم الفني الذكي{" "}
              <span className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 px-2.5 py-1 rounded-full font-semibold mr-2">
                Madarij Support OS
              </span>
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              إدارة تذاكر الدعم، القنوات المتعددة، وبوابة الخدمة الذاتية المعززة بالذكاء الاصطناعي
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-full">
          <button
            onClick={() => setActiveTab("workspace")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "workspace"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <User className="w-3.5 h-3.5" />
            مساحة العميل والأخصائي
          </button>
          <button
            onClick={() => setActiveTab("omnichannel")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "omnichannel"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            البريد المتكامل والدردشة
          </button>
          <button
            onClick={() => setActiveTab("portal")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "portal"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <Smartphone className="w-3.5 h-3.5" />
            بوابة الخدمة الذاتية للعميل
          </button>
          <button
            onClick={() => setActiveTab("kb")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "kb"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <BookOpen className="w-3.5 h-3.5" />
            قاعدة المعرفة والوثائق
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "analytics"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            التحليلات وخرائط الأداء
          </button>
          <button
            onClick={() => setActiveTab("automations")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              activeTab === "automations"
                ? "bg-white dark:bg-zinc-100 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50"
            )}
          >
            <Sliders className="w-3.5 h-3.5" />
            قواعد الأتمتة وSLAs
          </button>
        </div>
      </div>

      {/* Shortcuts Help Panel bar */}
      <div className="bg-zinc-100 dark:bg-zinc-100/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 px-6 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            💡 اختصارات لوحة المفاتيح المفعلة:
          </span>
          <span>
            اضغط{" "}
            <kbd className="bg-white border dark:bg-zinc-800 px-1 rounded shadow-xs font-mono">
              C
            </kbd>{" "}
            لتذكرة جديدة
          </span>
          <span>•</span>
          <span>
            اضغط الأرقام{" "}
            <kbd className="bg-white border dark:bg-zinc-800 px-1 rounded shadow-xs font-mono">
              1-5
            </kbd>{" "}
            للتنقل السريع بين النوافذ
          </span>
        </div>
        <button
          onClick={() => setShowShortcutsInfo((prev) => !prev)}
          className="text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          عرض الدليل السريع
        </button>
      </div>

      {/* Main Content Pane */}
      <div className="flex-1 overflow-hidden p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-xs text-zinc-500">جاري تحميل بيانات الدعم الفني...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {/* ------------------ TAB 1: WORKSPACE / AGENT TICKET HUB ------------------ */}
              {activeTab === "workspace" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
                  {/* Left Column: Tickets List */}
                  <div className="lg:col-span-1 flex flex-col bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-full">
                    {/* Header + Search */}
                    <div className="p-4 border-b border-zinc-150 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          قائمة التذاكر ({filteredTickets.length})
                        </span>
                        <button
                          onClick={() => setShowNewTicketModal(true)}
                          className="flex items-center gap-1 bg-indigo-600 text-white px-2 py-1 rounded-lg text-[11px] font-bold hover:bg-indigo-700 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          تذكرة جديدة
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="absolute right-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={ticketSearch}
                          onChange={(e) => setTicketSearch(e.target.value)}
                          placeholder="ابحث بالرقم، العميل، التصنيف..."
                          className="w-full pl-3 pr-8 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Filters */}
                      <div className="flex gap-2 text-[10px]">
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="flex-1 py-1 px-1.5 bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                        >
                          <option value="all">كل الحالات</option>
                          <option value="open">مفتوحة</option>
                          <option value="pending">معلقة</option>
                          <option value="resolved">تم الحل</option>
                          <option value="closed">مغلقة</option>
                        </select>
                        <select
                          value={priorityFilter}
                          onChange={(e) => setPriorityFilter(e.target.value)}
                          className="flex-1 py-1 px-1.5 bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded focus:outline-none"
                        >
                          <option value="all">كل الأولويات</option>
                          <option value="low">منخفضة</option>
                          <option value="medium">متوسطة</option>
                          <option value="high">عالية</option>
                          <option value="urgent">قصوى</option>
                        </select>
                      </div>
                    </div>

                    {/* Scrollable list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-800/60">
                      {filteredTickets.length === 0 ? (
                        <div className="p-8 text-center text-zinc-400 text-xs">
                          لا توجد تذاكر تطابق خيارات البحث.
                        </div>
                      ) : (
                        filteredTickets.map((t) => {
                          const isSelected = t.id === selectedTicketId;
                          return (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTicketId(t.id)}
                              className={cn(
                                "p-3.5 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-all border-r-2 text-right",
                                isSelected
                                  ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-600"
                                  : "border-transparent"
                              )}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono text-[10px] text-zinc-400 font-bold">
                                  {t.ticketNumber}
                                </span>
                                <span
                                  className={cn(
                                    "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full",
                                    t.priority === "urgent"
                                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                      : t.priority === "high"
                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                        : t.priority === "medium"
                                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                  )}
                                >
                                  {t.priority === "urgent"
                                    ? "قصوى"
                                    : t.priority === "high"
                                      ? "عالية"
                                      : t.priority === "medium"
                                        ? "متوسطة"
                                        : "منخفضة"}
                                </span>
                              </div>
                              <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                                {t.customerName}
                              </h4>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                {t.messages[0]?.text || ""}
                              </p>
                              <div className="flex items-center justify-between mt-2.5">
                                <span className="text-[9px] text-zinc-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                                </span>
                                <span
                                  className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded",
                                    t.status === "open"
                                      ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
                                      : t.status === "pending"
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                        : t.status === "resolved"
                                          ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                                  )}
                                >
                                  {t.status === "open"
                                    ? "مفتوحة"
                                    : t.status === "pending"
                                      ? "قيد الانتظار"
                                      : t.status === "resolved"
                                        ? "محلولة"
                                        : "مغلقة"}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Active Conversation (Split View) */}
                  <div className="lg:col-span-2 flex flex-col bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-full">
                    {activeTicket ? (
                      <div className="flex flex-col h-full overflow-hidden">
                        {/* Conversation Header */}
                        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-100/60 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded">
                              <span className="font-mono text-xs font-extrabold text-zinc-600 dark:text-zinc-400">
                                {activeTicket.ticketNumber}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                                  {activeTicket.customerName}
                                </h3>
                                <span className="text-[10px] text-zinc-400">
                                  {activeTicket.companyName}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                                القسم: {activeTicket.department} | الفئة: {activeTicket.category}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* AI Predict Satisfaction Score */}
                            {activeTicket.predictedCsat && (
                              <div className="flex items-center gap-1.5 bg-yellow-50 dark:bg-yellow-900/15 border border-yellow-150 dark:border-yellow-900/30 px-2.5 py-1 rounded-lg text-[10px] text-yellow-700 dark:text-yellow-400 font-bold">
                                <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                                <span>الرضا المتوقع: {activeTicket.predictedCsat}/5</span>
                              </div>
                            )}

                            {/* Options */}
                            <select
                              value={activeTicket.status}
                              onChange={(e) =>
                                handleUpdateTicketStatus(activeTicket.id, e.target.value as any)
                              }
                              className="text-xs bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-1.5 text-zinc-700 dark:text-zinc-300"
                            >
                              <option value="open">مفتوحة</option>
                              <option value="pending">قيد الانتظار</option>
                              <option value="resolved">محلولة</option>
                              <option value="closed">مغلقة</option>
                            </select>

                            <button
                              onClick={() => handleDeleteTicket(activeTicket.id)}
                              className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition"
                              title="حذف التذكرة"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* AI Summary Banner */}
                        {activeTicket.aiSummary && (
                          <div className="px-4 py-3 bg-indigo-50/50 dark:bg-indigo-950/10 border-b border-indigo-100 dark:border-indigo-950/30 flex items-start gap-2 text-xs text-indigo-900 dark:text-indigo-400 leading-relaxed">
                            <Sparkles className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="font-extrabold block text-[10px] text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-0.5">
                                تلخيص الذكاء الاصطناعي التلقائي
                              </span>
                              <p>{activeTicket.aiSummary}</p>
                            </div>
                          </div>
                        )}

                        {/* Scrollable messages history */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-zinc-50/40 dark:bg-zinc-100/10">
                          {activeTicket.messages.map((m, idx) => {
                            const isCustomer = m.sender === "customer";
                            const isSystem = m.sender === "system";
                            const isBot = m.sender === "bot";

                            if (isSystem) {
                              return (
                                <div key={m.id || idx} className="flex justify-center">
                                  <div className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] px-3 py-1 rounded-full flex items-center gap-1 border">
                                    <AlertCircle className="w-3.5 h-3.5" />
                                    <span>{m.text}</span>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={m.id || idx}
                                className={cn(
                                  "flex gap-3 max-w-[85%]",
                                  isCustomer
                                    ? "mr-0 ml-auto flex-row"
                                    : "mr-auto ml-0 flex-row-reverse"
                                )}
                              >
                                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 text-xs font-bold text-zinc-600 dark:text-zinc-400 border">
                                  {isBot ? (
                                    <Bot className="w-4 h-4 text-indigo-500" />
                                  ) : (
                                    m.senderName[0]
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 justify-end">
                                    <span className="text-[10px] text-zinc-400">
                                      {new Date(m.createdAt).toLocaleTimeString("ar-SA", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                                      {m.senderName}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      "p-3 rounded-2xl text-xs leading-relaxed",
                                      isCustomer
                                        ? "bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-none"
                                        : isBot
                                          ? "bg-indigo-50/70 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 border border-indigo-150 dark:border-indigo-900/30 rounded-tl-none"
                                          : "bg-zinc-900 text-white dark:bg-zinc-850 dark:text-zinc-100 rounded-tl-none"
                                    )}
                                  >
                                    <p>{m.text}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={chatEndRef} />
                        </div>

                        {/* Suggest Reply Preview Box */}
                        {aiDraftedReplyText && (
                          <div className="p-3 bg-yellow-50/40 dark:bg-yellow-950/10 border-t border-yellow-100 dark:border-yellow-950/30 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                                مسودة الرد الذكي المقترح:
                              </span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setReplyText(aiDraftedReplyText);
                                    setAiDraftedReplyText("");
                                  }}
                                  className="text-[10px] bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded font-bold"
                                >
                                  اعتماد وتعديل
                                </button>
                                <button
                                  onClick={() => setAiDraftedReplyText("")}
                                  className="text-[10px] text-zinc-400 hover:text-zinc-600 px-1"
                                >
                                  تجاهل
                                </button>
                              </div>
                            </div>
                            <p className="text-xs text-zinc-600 dark:text-zinc-350 bg-white dark:bg-zinc-100 p-2 border rounded-lg whitespace-pre-wrap leading-relaxed">
                              {aiDraftedReplyText}
                            </p>
                          </div>
                        )}

                        {/* Reply Input Area */}
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-100 space-y-3">
                          {/* Toggle Options */}
                          <div className="flex items-center justify-between text-xs text-zinc-500">
                            <div className="flex items-center gap-4">
                              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isInternalNote}
                                  onChange={(e) => setIsInternalNote(e.target.checked)}
                                  className="rounded border-zinc-350 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span
                                  className={cn(
                                    isInternalNote && "font-bold text-amber-600 dark:text-amber-400"
                                  )}
                                >
                                  إرسال كملاحظة داخلية (مخفية للعميل)
                                </span>
                              </label>
                            </div>

                            {/* AI Copilot mini buttons */}
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={handleAiSuggestReply}
                                disabled={aiDraftingReply}
                                className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-200/50"
                              >
                                {aiDraftingReply ? "جاري التوليد..." : "رد ذكي"}
                                <Sparkles className="w-3 h-3 text-amber-500" />
                              </button>
                              <button
                                onClick={handleAiSummarize}
                                disabled={aiAnalyzingTicket}
                                className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-200/50"
                              >
                                {aiAnalyzingTicket ? "جاري التلخيص..." : "ملخص ذكي"}
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                              </button>
                              <button
                                onClick={handleAiCategorize}
                                disabled={aiAnalyzingTicket}
                                className="flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-purple-200/50"
                              >
                                تصنيف ذكي
                                <Bot className="w-3 h-3 text-purple-500" />
                              </button>
                            </div>
                          </div>

                          <div className="flex gap-2.5">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              placeholder={
                                isInternalNote
                                  ? "اكتب ملاحظتك الداخلية هنا..."
                                  : "اكتب ردك للعميل والحل التقني المقترح..."
                              }
                              className={cn(
                                "flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 dark:bg-zinc-100",
                                isInternalNote
                                  ? "border-amber-200/60 focus:ring-amber-500"
                                  : "border-zinc-200 dark:border-zinc-850"
                              )}
                            />
                            <button
                              onClick={handleSendMessage}
                              className={cn(
                                "p-2.5 text-white rounded-xl transition-all shadow-xs",
                                isInternalNote
                                  ? "bg-amber-600 hover:bg-amber-700"
                                  : "bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700"
                              )}
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-zinc-400">
                        <LifeBuoy className="w-10 h-10 mb-3 text-zinc-300" />
                        <h3 className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                          لم يتم اختيار أي تذكرة
                        </h3>
                        <p className="text-[11px] mt-1">
                          اختر تذكرة من القائمة الجانبية أو أنشئ تذكرة جديدة للبدء.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: CRM Sidebar Integration & Asset Linking */}
                  <div className="lg:col-span-1 bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto h-full p-4 space-y-4 text-right">
                    <div className="border-b pb-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 justify-end">
                        <UserCheck className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        الملف التعريفي والربط بالـ CRM
                      </span>
                    </div>

                    {activeTicket ? (
                      <div className="space-y-4">
                        {/* Customer Metadata */}
                        <div className="bg-zinc-50 dark:bg-zinc-100/40 p-3 rounded-xl space-y-2 border">
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase">
                            بيانات العميل
                          </span>
                          <div className="text-xs space-y-1">
                            <p className="text-zinc-900 dark:text-zinc-100 font-bold">
                              {activeTicket.customerName}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400">
                              {activeTicket.customerEmail}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400 font-mono">
                              {activeTicket.contactPhone || "لا يتوفر هاتف"}
                            </p>
                            <p className="text-zinc-500 dark:text-zinc-400">
                              {activeTicket.companyName}
                            </p>
                          </div>
                        </div>

                        {/* CRM Linking Actions */}
                        <div className="bg-zinc-50 dark:bg-zinc-100/40 p-3 rounded-xl space-y-3 border">
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase">
                            إجراءات الأتمتة السريعة
                          </span>

                          <div className="space-y-2">
                            <button
                              onClick={handleConvertToTask}
                              className="w-full text-right flex items-center justify-between text-xs p-2 bg-white dark:bg-zinc-100 border rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50"
                            >
                              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold">
                                مهمة
                              </span>
                              <span>تحويل لمشروع مرتبط</span>
                            </button>

                            <button
                              onClick={handleApproveRefund}
                              className="w-full text-right flex items-center justify-between text-xs p-2 bg-white dark:bg-zinc-100 border rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/50"
                            >
                              <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-bold">
                                صرف مالي
                              </span>
                              <span>اعتماد طلب الاسترداد المالي</span>
                            </button>
                          </div>
                        </div>

                        {/* Project / Assets Linking Display */}
                        <div className="bg-zinc-50 dark:bg-zinc-100/40 p-3 rounded-xl space-y-2.5 border text-xs">
                          <span className="text-[10px] font-extrabold text-zinc-400 uppercase block">
                            الأصول المرتبطة
                          </span>

                          <div className="space-y-1.5">
                            <div>
                              <span className="text-zinc-400 text-[10px]">المشروع المربوط:</span>
                              <div className="font-bold flex items-center gap-1.5 justify-end text-zinc-700 dark:text-zinc-300">
                                <Briefcase className="w-3.5 h-3.5" />
                                <span>{activeTicket.linkedProject || "لم يتم الربط"}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-zinc-400 text-[10px]">الفاتورة المربوطة:</span>
                              <div className="font-bold flex items-center gap-1.5 justify-end text-zinc-700 dark:text-zinc-300">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{activeTicket.linkedInvoice || "لم يتم الربط"}</span>
                              </div>
                            </div>

                            <div>
                              <span className="text-zinc-400 text-[10px]">المنتج المرتبط:</span>
                              <div className="font-bold flex items-center gap-1.5 justify-end text-zinc-700 dark:text-zinc-300">
                                <Tag className="w-3.5 h-3.5" />
                                <span>{activeTicket.linkedProduct || "موقع المنصة الافتراضي"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Health Check */}
                        <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl space-y-1.5">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold block uppercase">
                            مؤشرات الرعاية (CSAT)
                          </span>
                          <div className="text-xs text-zinc-600 dark:text-zinc-400">
                            <p>
                              الحالة الضريبية:{" "}
                              <span className="font-bold text-green-600">متوافقة (ZATCA)</span>
                            </p>
                            <p>
                              قيمة الصفقات الكلية:{" "}
                              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                45,000 SAR
                              </span>
                            </p>
                            <p>
                              مستوى المخاطر: <span className="font-bold text-green-600">منخفض</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 text-center">
                        لا توجد تذكرة نشطة لعرض تفاصيل الـ CRM.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------ TAB 2: OMNICHANNEL INBOX / LIVE CHAT ------------------ */}
              {activeTab === "omnichannel" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full overflow-hidden">
                  {/* Channels selector sidebar */}
                  <div className="lg:col-span-1 bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
                    <h3 className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-right">
                      صناديق البريد المتكامل
                    </h3>

                    <div className="space-y-1.5">
                      <button
                        onClick={() => setActiveChannel("chat")}
                        className={cn(
                          "w-full text-right flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all",
                          activeChannel === "chat"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        )}
                      >
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950/30 text-indigo-800 px-1.5 py-0.5 rounded-full font-bold">
                          نشط
                        </span>
                        <span className="flex items-center gap-2">
                          دردشة الويب المباشرة
                          <MessageSquare className="w-4 h-4 text-indigo-600" />
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveChannel("whatsapp")}
                        className={cn(
                          "w-full text-right flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all",
                          activeChannel === "whatsapp"
                            ? "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        )}
                      >
                        <span className="text-[10px] bg-green-100 dark:bg-green-950/30 text-green-800 px-1.5 py-0.5 rounded-full font-bold">
                          1
                        </span>
                        <span className="flex items-center gap-2">
                          تكامل الواتساب (WhatsApp)
                          <CornerDownLeft className="w-4 h-4 text-green-600" />
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveChannel("telegram")}
                        className={cn(
                          "w-full text-right flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all",
                          activeChannel === "telegram"
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        )}
                      >
                        <span className="text-[10px] bg-blue-100 dark:bg-blue-950/30 text-blue-800 px-1.5 py-0.5 rounded-full font-bold">
                          جديد
                        </span>
                        <span className="flex items-center gap-2">
                          تليجرام بوت (Telegram)
                          <Share2 className="w-4 h-4 text-blue-500" />
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveChannel("email")}
                        className={cn(
                          "w-full text-right flex items-center justify-between px-3 py-2 text-xs font-bold rounded-lg transition-all",
                          activeChannel === "email"
                            ? "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
                        )}
                      >
                        <span className="text-[10px] bg-purple-100 dark:bg-purple-950/30 text-purple-800 px-1.5 py-0.5 rounded-full font-bold">
                          0
                        </span>
                        <span className="flex items-center gap-2">
                          صندوق البريد الإلكتروني (Email)
                          <FileText className="w-4 h-4 text-purple-600" />
                        </span>
                      </button>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={chatbotEnabled}
                            onChange={(e) => setChatbotEnabled(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          الرد الآلي ومساعد الذكاء الاصطناعي (AI Bot)
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 text-right leading-relaxed">
                        عند التفعيل، يقوم مساعد الذكاء الاصطناعي بصياغة ردود فورية مستنداً إلى قاعدة
                        المعرفة والوثائق التقنية المتاحة لديه.
                      </p>
                    </div>
                  </div>

                  {/* Active Omnichannel Stream simulator */}
                  <div className="lg:col-span-3 bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b bg-zinc-50 dark:bg-zinc-100/40 flex items-center justify-between">
                      <div className="text-right">
                        <h3 className="text-xs font-bold text-zinc-900 dark:text-white">
                          محاكي المحادثات المتعددة
                        </h3>
                        <p className="text-[10px] text-zinc-500">
                          القناة النشطة الحالية:{" "}
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                            {activeChannel}
                          </span>
                        </p>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-green-600 font-bold bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
                        النظام متصل
                      </span>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-50/30 dark:bg-zinc-100/10">
                      <div className="flex justify-center text-[10px] text-zinc-400">
                        تحديثات متزامنة في الوقت الفعلي
                      </div>

                      {activeChannel === "chat" && (
                        <>
                          <div className="flex gap-2 max-w-[80%] mr-0 ml-auto flex-row">
                            <div className="p-3 bg-white dark:bg-zinc-100 border rounded-2xl rounded-tr-none text-xs text-right">
                              مرحباً، أواجه صعوبة في العثور على القيود السنوية للإقفال، هل من دليل
                              سريع؟
                            </div>
                          </div>
                          <div className="flex gap-2 max-w-[80%] mr-auto ml-0 flex-row-reverse">
                            <div className="p-3 bg-indigo-50/80 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-400 border border-indigo-200/50 rounded-2xl rounded-tl-none text-xs text-right">
                              <span className="text-[9px] text-indigo-600 font-extrabold block mb-1">
                                المجيب الذكي تلقائياً:
                              </span>
                              بناءً على قاعدة المعرفة لدينا، يمكنك موازنة وإقفال القيود السنوية في
                              لوحة المحاسبة عن طريق التأكد من تسوية البنوك والمطابقات أولاً، ثم
                              توليد ميزان المراجعة قبل الإقفال والضغط على "إجراء قيد الإقفال
                              السنوي".
                            </div>
                          </div>
                        </>
                      )}

                      {activeChannel === "whatsapp" && (
                        <>
                          <div className="flex gap-2 max-w-[80%] mr-0 ml-auto flex-row">
                            <div className="p-3 bg-white dark:bg-zinc-100 border rounded-2xl rounded-tr-none text-xs text-right">
                              أهلاً، هل يمكنني طلب استرجاع مبلغ الفاتورة التكرارية؟ تم سحبها مرتين
                              بالخطأ.
                            </div>
                          </div>
                          <div className="flex gap-2 max-w-[80%] mr-auto ml-0 flex-row-reverse">
                            <div className="p-3 bg-zinc-900 text-white dark:bg-zinc-800 rounded-2xl rounded-tl-none text-xs text-right">
                              أهلاً بك. تم استلام طلبك وجاري مراجعته من قبل بندر المطيري، يمكنك تتبع
                              الطلب عبر التذكرة رقم #T-1001. سنقوم بإبلاغك حال الموافقة لإصدار إشعار
                              دائن فوري.
                            </div>
                          </div>
                        </>
                      )}

                      {activeChannel === "telegram" && (
                        <div className="text-center text-zinc-400 text-xs p-8">
                          لا توجد رسائل نشطة على قناة تليجرام حالياً.
                        </div>
                      )}

                      {activeChannel === "email" && (
                        <div className="text-center text-zinc-400 text-xs p-8">
                          كل رسائل البريد الإلكتروني مأرشفة ومربوطة بالتذاكر بنجاح.
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t bg-white dark:bg-zinc-100 flex gap-2">
                      <input
                        type="text"
                        placeholder="أرسل رداً تجريبياً سريعاً على هذه القناة..."
                        className="flex-1 px-3 py-2 text-xs border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                      />
                      <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs">
                        إرسال القناة
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ TAB 3: CUSTOMER PORTAL SIMULATOR ------------------ */}
              {activeTab === "portal" && (
                <div className="bg-zinc-100 dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden h-full flex flex-col text-right">
                  {/* Portal Bar */}
                  <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping" />
                      <span className="text-xs font-bold">
                        بوابة العميل الرقمية (محاكاة حساب العميل)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPortalView("home")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] rounded transition",
                          portalView === "home" ? "bg-white/10" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        الرئيسية
                      </button>
                      <button
                        onClick={() => setPortalView("tickets")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] rounded transition",
                          portalView === "tickets"
                            ? "bg-white/10"
                            : "text-zinc-400 hover:text-white"
                        )}
                      >
                        تذاكري
                      </button>
                      <button
                        onClick={() => setPortalView("kb")}
                        className={cn(
                          "px-2.5 py-1 text-[11px] rounded transition",
                          portalView === "kb" ? "bg-white/10" : "text-zinc-400 hover:text-white"
                        )}
                      >
                        دليل المعرفة
                      </button>
                      <button
                        onClick={() => setPortalView("new_ticket")}
                        className="bg-indigo-600 text-white px-2.5 py-1 text-[11px] font-bold rounded hover:bg-indigo-700 transition mr-2"
                      >
                        رفع تذكرة جديدة
                      </button>
                    </div>
                  </div>

                  {/* Portal body */}
                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-zinc-100">
                    {portalView === "home" && (
                      <div className="space-y-6">
                        <div className="text-center max-w-xl mx-auto space-y-2.5 py-4">
                          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                            مرحباً بك في مركز رعاية عملاء مدارج
                          </h2>
                          <p className="text-xs text-zinc-500 leading-relaxed">
                            ابحث في قاعدة المعرفة عن حلول سريعة لمشاكلك الضريبية والمالية، أو ارفع
                            تذكرة دعم وسيتولى فريقنا الفني مساعدتك فوراً.
                          </p>

                          <div className="relative max-w-md mx-auto mt-2">
                            <Search className="absolute right-3 top-3 w-4 h-4 text-zinc-400" />
                            <input
                              type="text"
                              value={portalSearch}
                              onChange={(e) => setPortalSearch(e.target.value)}
                              placeholder="كيف يمكننا مساعدتك اليوم؟ ابحث عن مقالات الدعم والمساعدة..."
                              className="w-full pl-3 pr-10 py-2 text-xs bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Portal Quick Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div
                            className="p-4 border rounded-xl bg-zinc-50 hover:bg-zinc-100/50 transition cursor-pointer"
                            onClick={() => setPortalView("new_ticket")}
                          >
                            <HelpCircle className="w-5 h-5 text-indigo-600 mb-2" />
                            <h4 className="text-xs font-bold text-zinc-900">إنشاء طلب جديد</h4>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              ارسل استفسارك أو مشكلتك الفنية لفريق الدعم المتخصص.
                            </p>
                          </div>

                          <div
                            className="p-4 border rounded-xl bg-zinc-50 hover:bg-zinc-100/50 transition cursor-pointer"
                            onClick={() => setPortalView("tickets")}
                          >
                            <Clock className="w-5 h-5 text-amber-600 mb-2" />
                            <h4 className="text-xs font-bold text-zinc-900">
                              تتبع الطلبات القائمة
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              تابع تقدم حلول تذاكرك السابقة والردود المحدثة عليها.
                            </p>
                          </div>

                          <div
                            className="p-4 border rounded-xl bg-zinc-50 hover:bg-zinc-100/50 transition cursor-pointer"
                            onClick={() => setPortalView("kb")}
                          >
                            <BookOpen className="w-5 h-5 text-green-600 mb-2" />
                            <h4 className="text-xs font-bold text-zinc-900">
                              الربط الضريبي والزكاة
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-1">
                              تصفح أدلة استخدام الربط وتوليد فواتير ZATCA المتوافقة.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {portalView === "tickets" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          تذاكر الدعم والطلبات الخاصة بك
                        </h3>

                        <div className="border rounded-xl divide-y">
                          {tickets.map((t) => (
                            <div
                              key={t.id}
                              className="p-4 flex items-center justify-between text-xs hover:bg-zinc-50 transition"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-zinc-400 font-bold">
                                  {t.ticketNumber}
                                </span>
                                <div>
                                  <h4 className="font-bold text-zinc-800">{t.category}</h4>
                                  <p className="text-[10px] text-zinc-500">
                                    مفتوحة بتاريخ{" "}
                                    {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="px-2 py-0.5 text-[10px] bg-indigo-50 text-indigo-700 font-semibold rounded-full">
                                  {t.assignedAgent}
                                </span>
                                <span className="px-2 py-0.5 text-[10px] bg-green-50 text-green-700 font-bold rounded">
                                  {t.status === "open" ? "نشط" : "قيد المعالجة"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {portalView === "kb" && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          أدلة ووثائق المساعدة الذاتية
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {kbArticles.map((art) => (
                            <div key={art.id} className="p-4 border rounded-xl space-y-2">
                              <span className="text-[9px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-extrabold">
                                {art.category}
                              </span>
                              <h4 className="text-xs font-bold text-zinc-900">{art.title}</h4>
                              <p className="text-[11px] text-zinc-500 leading-relaxed truncate">
                                {art.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {portalView === "new_ticket" && (
                      <div className="max-w-lg mx-auto space-y-4">
                        <h3 className="text-sm font-bold text-zinc-900">
                          إنشاء تذكرة دعم فني جديدة للعميل
                        </h3>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              الاسم الكامل
                            </label>
                            <input
                              type="text"
                              value={newTicketData.customerName}
                              onChange={(e) =>
                                setNewTicketData((prev) => ({
                                  ...prev,
                                  customerName: e.target.value,
                                }))
                              }
                              placeholder="أدخل اسمك الكريم"
                              className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              البريد الإلكتروني للرد والمتابعة
                            </label>
                            <input
                              type="email"
                              value={newTicketData.customerEmail}
                              onChange={(e) =>
                                setNewTicketData((prev) => ({
                                  ...prev,
                                  customerEmail: e.target.value,
                                }))
                              }
                              placeholder="yourname@domain.com"
                              className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              فئة المشكلة أو الدعم المطلوب
                            </label>
                            <select
                              value={newTicketData.category}
                              onChange={(e) =>
                                setNewTicketData((prev) => ({ ...prev, category: e.target.value }))
                              }
                              className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 focus:outline-none"
                            >
                              <option value="Technical Support">مشكلة فنية أو برمجية</option>
                              <option value="Billing">الفوترة والاشتراكات</option>
                              <option value="Refund">طلب استرداد مالي</option>
                              <option value="Feature Request">اقتراح ميزة إضافية</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-zinc-700 mb-1">
                              شرح مفصل للاستفسار أو المشكلة الفنية
                            </label>
                            <textarea
                              rows={4}
                              value={newTicketData.text}
                              onChange={(e) =>
                                setNewTicketData((prev) => ({ ...prev, text: e.target.value }))
                              }
                              placeholder="يرجى كتابة كل التفاصيل والخطوات اللازمة لإعادة إظهار المشكلة لمساعدتنا على حلها سريعاً..."
                              className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 focus:outline-none"
                            />
                          </div>

                          <button
                            onClick={handleCreateTicket}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold rounded-lg transition-all"
                          >
                            إرسال التذكرة لفريق الدعم
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floating Client Webchat widget Simulator button */}
                  <div className="absolute bottom-6 left-6 z-25">
                    <button
                      onClick={() => setPortalChatOpen((prev) => !prev)}
                      className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-xs font-bold">الدردشة الحية مع المساعد الذكي</span>
                    </button>
                  </div>

                  {/* Active Portal Chat Window popup */}
                  {portalChatOpen && (
                    <div className="absolute bottom-20 left-6 w-80 bg-white border dark:bg-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col h-[400px] z-30 text-right overflow-hidden border-indigo-200">
                      <div className="bg-indigo-600 text-white p-3 flex items-center justify-between">
                        <span className="text-xs font-bold">
                          مساعد مدارج الذكي (AI Support Bot)
                        </span>
                        <button
                          onClick={() => setPortalChatOpen(false)}
                          className="text-white hover:text-zinc-200"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Chat screen */}
                      <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-zinc-50">
                        <div className="p-2.5 bg-indigo-50 text-indigo-900 border text-[11px] rounded-xl rounded-tl-none">
                          مرحباً! أنا مساعد مدارج الذكي لخدمة العملاء. كيف يمكنني مساعدتك اليوم
                          بخصوص نظام الفوترة أو المحاسبة أو الربط الضريبي؟
                        </div>

                        {/* Customer simulated conversation */}
                        {tickets[0] &&
                          tickets[0].messages.slice(1).map((m, idx) => (
                            <div
                              key={idx}
                              className={cn(
                                "p-2.5 text-[11px] rounded-xl max-w-[90%] border",
                                m.sender === "customer"
                                  ? "bg-white text-zinc-800 rounded-tr-none mr-0 ml-auto"
                                  : "bg-indigo-50 text-indigo-900 border-indigo-150 rounded-tl-none mr-auto ml-0"
                              )}
                            >
                              <span className="text-[9px] font-bold block mb-0.5 text-zinc-500">
                                {m.senderName}
                              </span>
                              {m.text}
                            </div>
                          ))}
                      </div>

                      {/* Input */}
                      <div className="p-2 border-t bg-white flex gap-1.5">
                        <input
                          type="text"
                          value={portalChatText}
                          onChange={(e) => setPortalChatText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCustomerPortalChatSend();
                          }}
                          placeholder="اكتب استفسارك هنا لمساعد الذكاء الاصطناعي..."
                          className="flex-1 px-3 py-1.5 text-xs border rounded-lg bg-zinc-50 focus:outline-none"
                        />
                        <button
                          onClick={handleCustomerPortalChatSend}
                          className="bg-indigo-600 text-white p-1.5 rounded-lg hover:bg-indigo-700"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ------------------ TAB 4: KNOWLEDGE BASE (KB) ------------------ */}
              {activeTab === "kb" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full overflow-hidden">
                  {/* Left Column: Manage articles */}
                  <div className="lg:col-span-1 bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-4 flex flex-col h-full">
                    <div className="flex items-center justify-between border-b pb-2">
                      <button
                        onClick={() => setShowNewArticleModal(true)}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        مقال جديد
                      </button>
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        مقالات الدعم المعرفية
                      </span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                      {kbArticles.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-8">
                          لا تتوفر مقالات حالياً.
                        </p>
                      ) : (
                        kbArticles.map((art) => (
                          <div
                            key={art.id}
                            className="p-3 bg-zinc-50 dark:bg-zinc-100/40 rounded-xl border text-right space-y-2 relative"
                          >
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="text-zinc-400 hover:text-red-500 transition"
                                title="حذف المقال"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[9px] bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 px-1.5 py-0.5 rounded font-extrabold">
                                {art.category}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {art.title}
                            </h4>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate leading-relaxed">
                              {art.content}
                            </p>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 border-t pt-1.5">
                              <span>مشاهدات: {art.views || 0}</span>
                              <span>
                                تحديث: {new Date(art.updatedAt).toLocaleDateString("ar-SA")}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Right Column: AI Knowledge Base Writer helper */}
                  <div className="lg:col-span-2 bg-white dark:bg-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 space-y-4 h-full overflow-y-auto text-right">
                    <div className="flex items-center gap-2 justify-end text-zinc-800 dark:text-zinc-200 border-b pb-2">
                      <span className="text-xs font-bold">
                        توليد وثيقة معرفية بالذكاء الاصطناعي (AI Document Generator)
                      </span>
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            فئة المقال الجديد
                          </label>
                          <select
                            value={newArticleData.category}
                            onChange={(e) =>
                              setNewArticleData((prev) => ({ ...prev, category: e.target.value }))
                            }
                            className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                          >
                            <option value="الربط الفني">الربط الفني والزكاة</option>
                            <option value="المحاسبة والمالية">المحاسبة والمالية</option>
                            <option value="إدارة الموظفين والرواتب">إدارة الموظفين والرواتب</option>
                            <option value="عام">استفسارات عامة</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                            عنوان المقال التعليمي المطلوب
                          </label>
                          <input
                            type="text"
                            value={newArticleData.title}
                            onChange={(e) =>
                              setNewArticleData((prev) => ({ ...prev, title: e.target.value }))
                            }
                            placeholder="مثال: كيفية إدخال أصول المنشأة السنوية..."
                            className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAiGenerateArticle}
                        disabled={aiGeneratingArticle || !newArticleData.title}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
                      >
                        {aiGeneratingArticle
                          ? "جاري صياغة المقال والحل الفني..."
                          : "صياغة المقال المتكامل بالذكاء الاصطناعي"}
                        <Sparkles className="w-4 h-4" />
                      </button>

                      {newArticleData.content && (
                        <div className="space-y-2 border-t pt-4">
                          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">
                            محتوى المقال التوليدي المقترح:
                          </label>
                          <textarea
                            rows={10}
                            value={newArticleData.content}
                            onChange={(e) =>
                              setNewArticleData((prev) => ({ ...prev, content: e.target.value }))
                            }
                            className="w-full p-4 text-xs font-mono border rounded-xl bg-zinc-50 dark:bg-zinc-100 focus:outline-none leading-relaxed"
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() =>
                                setNewArticleData((prev) => ({ ...prev, content: "" }))
                              }
                              className="px-4 py-1.5 border rounded-lg text-xs hover:bg-zinc-50"
                            >
                              مسح المسودة
                            </button>
                            <button
                              onClick={handleSaveArticle}
                              className="px-4 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800"
                            >
                              حفظ ونشر المقال في قاعدة المعرفة
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ TAB 5: ANALYTICS & REPORTS ------------------ */}
              {activeTab === "analytics" && (
                <div className="space-y-6 h-full overflow-y-auto pb-8">
                  {/* KPI overview row */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="p-4 bg-white dark:bg-zinc-100 border rounded-xl text-right">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        إجمالي تذاكر الدعم
                      </span>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                        {totalTickets}
                      </h3>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-100 border rounded-xl text-right">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        تذاكر مفتوحة حالياً
                      </span>
                      <h3 className="text-xl font-bold text-green-600 mt-1">{openTicketsCount}</h3>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-100 border rounded-xl text-right">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        تذاكر قيد المعالجة
                      </span>
                      <h3 className="text-xl font-bold text-amber-600 mt-1">
                        {pendingTicketsCount}
                      </h3>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-100 border rounded-xl text-right">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        نسبة التزام SLAs
                      </span>
                      <h3 className="text-xl font-bold text-indigo-600 mt-1">{slaCompliance}%</h3>
                    </div>

                    <div className="p-4 bg-white dark:bg-zinc-100 border rounded-xl text-right">
                      <span className="text-[10px] text-zinc-400 font-extrabold uppercase">
                        تذاكر محلولة تلقائياً بالـ Bot
                      </span>
                      <h3 className="text-xl font-bold text-purple-600 mt-1">42%</h3>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SLA compliance bar */}
                    <div className="p-5 bg-white dark:bg-zinc-100 border rounded-xl space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 text-right">
                        توزيع التذاكر حسب الأولوية ومستوى الاستجابة
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              {
                                priority: "منخفضة",
                                count: tickets.filter((t) => t.priority === "low").length || 1,
                              },
                              {
                                priority: "متوسطة",
                                count: tickets.filter((t) => t.priority === "medium").length || 2,
                              },
                              {
                                priority: "عالية",
                                count: tickets.filter((t) => t.priority === "high").length || 1,
                              },
                              {
                                priority: "قصوى",
                                count: tickets.filter((t) => t.priority === "urgent").length || 1,
                              },
                            ]}
                            margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="priority" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                              {tickets.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={SLAColors[index % SLAColors.length]}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Customer Satisfaction Pie */}
                    <div className="p-5 bg-white dark:bg-zinc-100 border rounded-xl space-y-3">
                      <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 text-right">
                        مؤشرات رضا العملاء وتنبؤات CSAT
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={satisfactionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name} ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="count"
                            >
                              {satisfactionData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={SLAColors[index % SLAColors.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ------------------ TAB 6: SLA & ESCALATION RULES (AUTOMATION CONTROL CENTER) ------------------ */}
              {activeTab === "automations" && (
                <div className="space-y-6 h-full overflow-y-auto pb-8 text-right">
                  <div className="p-5 bg-white dark:bg-zinc-100 border rounded-xl space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        محرك قواعد التشغيل والأتمتة (Workflows & SLAs Engine)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        تهيئة شروط إحالة التذاكر وتنبيهات تجاوز المهلة المحددة لحل المشاكل الفنية
                        والمالية للعملاء.
                      </p>
                    </div>

                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {/* Rule 1 */}
                      <div className="py-3.5 flex items-center justify-between text-xs gap-4 flex-row-reverse">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                              التذاكر ذات الأولوية القصوى (Urgent SLAs)
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              تنبيه المدير المباشر عبر الجوال، الإحالة التلقائية لأخصائي أول، وبدء
                              مؤقت الاستجابة (15 دقيقة).
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          مفعلة ونشطة
                        </span>
                      </div>

                      {/* Rule 2 */}
                      <div className="py-3.5 flex items-center justify-between text-xs gap-4 flex-row-reverse">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                              أتمتة الفواتير والاسترداد (Refund Flows)
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              عند اعتماد طلب استرداد مالي، يتم إصدار إشعار دائن (Credit Note) تجريبي
                              وإرساله آلياً للمحاسبة.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          مفعلة ونشطة
                        </span>
                      </div>

                      {/* Rule 3 */}
                      <div className="py-3.5 flex items-center justify-between text-xs gap-4 flex-row-reverse">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Bot className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900 dark:text-zinc-100">
                              الفرز والتصنيف الآلي بالذكاء الاصطناعي
                            </h4>
                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              تحليل لغة العميل واستخراج فئة التذكرة، مستوى الإلحاح، وتحليل مشاعر
                              العميل بمجرد الإرسال.
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] bg-green-50 text-green-700 font-bold px-2 py-0.5 rounded-full">
                          مفعلة ونشطة
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ----------------- MODAL: CREATE NEW TICKET ----------------- */}
      {showNewTicketModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-100 border dark:border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-right flex flex-col max-h-[90vh]"
          >
            <div className="p-4 border-b flex items-center justify-between bg-zinc-50 dark:bg-zinc-100/60">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                إنشاء تذكرة دعم فني جديدة
              </h3>
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="text-zinc-400 hover:text-zinc-600"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    value={newTicketData.customerName}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, customerName: e.target.value }))
                    }
                    placeholder="سليمان الأحمد..."
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    البريد الإلكتروني للعميل
                  </label>
                  <input
                    type="email"
                    value={newTicketData.customerEmail}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, customerEmail: e.target.value }))
                    }
                    placeholder="customer@domain.com"
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    اسم المنشأة/الشركة
                  </label>
                  <input
                    type="text"
                    value={newTicketData.companyName}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, companyName: e.target.value }))
                    }
                    placeholder="مؤسسة التقنية للتوريد..."
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    هاتف الاتصال
                  </label>
                  <input
                    type="text"
                    value={newTicketData.contactPhone}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    placeholder="050XXXXXXXX"
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    أولوية التذكرة
                  </label>
                  <select
                    value={newTicketData.priority}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, priority: e.target.value as any }))
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  >
                    <option value="low">منخفضة</option>
                    <option value="medium">متوسطة</option>
                    <option value="high">عالية</option>
                    <option value="urgent">قصوى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    تصنيف المشكلة
                  </label>
                  <select
                    value={newTicketData.category}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  >
                    <option value="Technical Support">مشكلة فنية أو برمجية</option>
                    <option value="Billing">الفوترة والاشتراكات</option>
                    <option value="Refund">طلب استرداد مالي</option>
                    <option value="Feature Request">اقتراح ميزة إضافية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    الإحالة للقسم
                  </label>
                  <select
                    value={newTicketData.department}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  >
                    <option value="IT Support">قسم الدعم الفني والبرمجي</option>
                    <option value="Finance">قسم المالية والفوترة</option>
                    <option value="Sales">قسم المبيعات والطلبات</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ربط بمشروع من الـ CRM
                  </label>
                  <select
                    value={newTicketData.linkedProject}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, linkedProject: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  >
                    <option value="">-- اختر مشروعاً لربطه تلقائياً --</option>
                    {availableProjects.map((p) => (
                      <option key={p.id} value={p.name || p.title}>
                        {p.name || p.title}
                      </option>
                    ))}
                    <option value="مشروع تطوير ZATCA">مشروع تطوير ربط ZATCA التجاري</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    ربط بفاتورة مالية
                  </label>
                  <select
                    value={newTicketData.linkedInvoice}
                    onChange={(e) =>
                      setNewTicketData((prev) => ({ ...prev, linkedInvoice: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                  >
                    <option value="">-- اختر فاتورة لربطها --</option>
                    {availableInvoices.map((inv) => (
                      <option key={inv.id} value={inv.invoiceNumber || inv.id}>
                        {inv.invoiceNumber || inv.id} ({inv.total || inv.amount} SAR)
                      </option>
                    ))}
                    <option value="INV-2026-004">INV-2026-004 (15,000 SAR)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                  شرح مفصل للمشكلة
                </label>
                <textarea
                  rows={4}
                  value={newTicketData.text}
                  onChange={(e) => setNewTicketData((prev) => ({ ...prev, text: e.target.value }))}
                  placeholder="يرجى توضيح المشكلة بالتفصيل والرسائل التقنية الظاهرة..."
                  className="w-full px-3 py-2 text-xs border rounded-lg bg-zinc-50 dark:bg-zinc-100 focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-100/60 flex gap-2 justify-end">
              <button
                onClick={() => setShowNewTicketModal(false)}
                className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-zinc-100 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateTicket}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              >
                إنشاء وحفظ التذكرة
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ----------------- SHORTCUTS DIALOG ----------------- */}
      {showShortcutsInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          dir="rtl"
        >
          <div className="bg-white dark:bg-zinc-100 border dark:border-zinc-800 rounded-2xl w-full max-w-sm p-6 text-right space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2 justify-end">
              دليل اختصارات لوحة المفاتيح
              <Zap className="w-4 h-4 text-indigo-500 animate-bounce" />
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  C
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  إنشاء تذكرة دعم جديدة فوراً
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  S
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">فتح/إغلاق دليل الاختصارات</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  1
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  الانتقال لمساحة عمل الأخصائي والتذاكر
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  2
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  الانتقال للبريد الوارد المتكامل
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  3
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  الانتقال لبوابة الخدمة الذاتية للعملاء
                </span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  4
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  الانتقال لقسم صياغة ونشر أدلة المساعدة
                </span>
              </div>
              <div className="flex items-center justify-between">
                <kbd className="bg-zinc-100 dark:bg-zinc-800 border px-2 py-0.5 rounded font-mono shadow-xs text-[11px]">
                  5
                </kbd>
                <span className="text-zinc-600 dark:text-zinc-400">
                  الانتقال لقسم التحليلات وخرائط الأداء
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShortcutsInfo(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white py-1.5 rounded-lg text-xs font-bold"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
