import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Search,
  MessageSquare,
  Phone,
  User,
  Clock,
  Bot,
  Sparkles,
  Check,
  CheckCheck,
  Plus,
  ArrowRight,
  AlertCircle,
  FileText,
  UserCheck,
  Zap,
  MoreVertical,
  Sliders,
  Settings,
  CircleAlert,
  BrainCircuit,
  Timer,
  MailWarning,
  Activity,
  Globe,
  Mail,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  AlertTriangle,
  FileUp,
  Smile,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

interface InboxViewProps {
  leads: any[];
  activeLeadId: string | null;
  setActiveLeadId: (id: string | null) => void;
  inputText: string;
  setInputText: (text: string) => void;
  handleSendMessage: (textToSend?: string) => Promise<void>;
  isDraftingReply: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filter: "all" | "unread" | "opportunities";
  setFilter: (f: "all" | "unread" | "opportunities") => void;
}

export default function InboxView({
  leads,
  activeLeadId,
  setActiveLeadId,
  inputText,
  setInputText,
  handleSendMessage,
  isDraftingReply,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}: InboxViewProps) {
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "vips" | "closed">("all");
  const [composerMode, setComposerMode] = useState<"reply" | "note">("reply");
  const [expandedSection, setExpandedSection] = useState<string | null>("financials");
  const [isAiSummarizing, setIsAiSummarizing] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState<string | null>(null);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeLead = useMemo(() => {
    return leads.find((l) => l.id === activeLeadId);
  }, [leads, activeLeadId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeLeadId, activeLead?.messages, isDraftingReply]);

  // Channel Mapping helper
  const getChannelDetails = (lead: any) => {
    if (lead.status === "new") {
      return {
        label: "المحادثة المباشرة",
        icon: Globe,
        color: "text-blue-500 bg-blue-50 border-blue-100",
      };
    }
    if (lead.status === "opportunity") {
      return {
        label: "واتساب",
        icon: MessageSquare,
        color: "text-emerald-500 bg-emerald-50 border-emerald-100",
      };
    }
    if (lead.status === "contacted") {
      return {
        label: "البريد الإلكتروني",
        icon: Mail,
        color: "text-rose-500 bg-rose-50 border-rose-100",
      };
    }
    return { label: "تيليجرام", icon: Send, color: "text-sky-500 bg-sky-50 border-sky-100" };
  };

  // Filter conversations list
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // Search filter
      const matchesSearch =
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      // Status sub-tabs filter
      if (activeTab === "unread") return l.unreadCount && l.unreadCount > 0;
      if (activeTab === "vips") return l.value >= 12000;
      if (activeTab === "closed") return l.status === "converted";

      // Main filter props from parent
      if (filter === "unread") return l.unreadCount && l.unreadCount > 0;
      if (filter === "opportunities") return l.status === "opportunity";

      return true;
    });
  }, [leads, searchQuery, activeTab, filter]);

  const toggleSection = (sect: string) => {
    setExpandedSection(expandedSection === sect ? null : sect);
  };

  // AI Instant Actions
  const handleAiSmartReply = async () => {
    if (!activeLead) return;
    setIsAiDrafting(true);
    setTimeout(() => {
      const lastClientMsg =
        [...(activeLead.messages || [])].reverse().find((m) => m.sender === "client")?.text ||
        "مرحباً";

      let generated = "";
      if (lastClientMsg.includes("رابط دفع") || lastClientMsg.includes("فاتورة")) {
        generated = `وعليكم السلام ورحمة الله وبركاته، تم إصدار وتوليد الفاتورة الإلكترونية المعتمدة رقم INV-2026-89 بنجاح بقيمة ${activeLead.value?.toLocaleString("ar-SA")} ر.س شاملة ضريبة القيمة المضافة. يمكنك سدادها مباشرة عبر الرابط الإلكتروني المرفق بكل أمان.`;
      } else if (lastClientMsg.includes("الاتصال") || lastClientMsg.includes("هاتفي")) {
        generated = `يسعدنا جداً ويشرفنا الاتصال بكم غداً في تمام الساعة 10:00 صباحاً بتوقيت الرياض لمناقشة كافة التفاصيل وحل جميع الاستفسارات الفنية. طاب يومكم!`;
      } else {
        generated = `أهلاً بك، يسعدنا تواصلكم معنا في مدارج OS. لقد قام فريق العمل بجدولة طلبك وسيتم مراجعته وموافقتك بأفضل الأسعار المتاحة. هل ترغب في تزويدنا بتفاصيل إضافية؟`;
      }

      setInputText(generated);
      setIsAiDrafting(false);
      toast.success("تم صياغة الرد الذكي المخصص بنجاح بواسطة AI Copilot!");
    }, 1100);
  };

  const handleAiSummarize = async () => {
    if (!activeLead) return;
    setIsAiSummarizing(true);
    setTimeout(() => {
      const summary = `• طبيعة العميل: مهتم جداً بجدولة الأنظمة وأتمتة مسيرات الرواتب.
• درجة الحماس: مرتفعة (طلب رابط الدفع قبل نهاية اليوم المالي).
• المشاعر الحالية: إيجابية وراضية تماماً عن سرعة الرد والمخرجات.
• التوصية المقترحة: توليد رابط الدفع الإلكتروني فوراً وإرساله لحسم التعاقد السنوي.`;
      setAiSummaryResult(summary);
      setIsAiSummarizing(false);
      toast.success("تم تلخيص المحادثة واستنباط البيانات الهامة!");
    }, 1200);
  };

  const handleSendAction = async () => {
    if (!inputText.trim() || !activeLeadId) return;

    if (composerMode === "note") {
      // Simulate/write internal notes in the message timeline
      const newNote = {
        id: `note_${Date.now()}`,
        sender: "user" as const,
        text: `[ملاحظة داخلية للموظفين]: ${inputText.trim()}`,
        timestamp: new Date().toISOString(),
        status: "read" as const,
        isInternalNote: true,
        authorName: "أحمد المنسق",
      };

      try {
        await updateDoc(doc(db, "leads", activeLeadId), {
          messages: arrayUnion(newNote),
        });
        setInputText("");
        toast.info("تم حفظ الملاحظة الداخلية بنجاح!");
      } catch (err) {
        toast.error("فشل إرسال الملاحظة");
      }
    } else {
      await handleSendMessage();
    }
  };

  // Convert to support ticket simulator
  const handleCreateSupportTicket = () => {
    if (!activeLead) return;
    toast.success(
      `تم فتح تذكرة دعم فني جديدة رقم #TK-${Math.floor(1000 + Math.random() * 9000)} للعميل ${activeLead.name}!`
    );
  };

  const handleCreateInvoice = () => {
    if (!activeLead) return;
    toast.info("جاري توجيهك لبرنامج الفواتير ببيانات العميل...");
    // Open in invoices page
    window.location.href = `/app/invoices/new?leadName=${encodeURIComponent(activeLead.name)}&amount=${activeLead.value}`;
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 border border-zinc-200 rounded-3xl bg-white overflow-hidden h-[680px] shadow-sm">
      {/* Pane 1: Conversation List & Search (4 columns) */}
      <div className="xl:col-span-3 border-l border-zinc-200 flex flex-col h-full bg-zinc-50/50">
        {/* Search */}
        <div className="p-4 border-b border-zinc-200 shrink-0 space-y-3">
          <div className="relative">
            <Search className="absolute right-3.5 top-3 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم العميل أو الشركة..."
              className="w-full text-xs font-bold bg-white border border-zinc-200 focus:border-primary/50 focus:outline-none focus:ring-4 focus:ring-primary/5 rounded-xl py-2.5 pr-10 pl-4 transition-all"
            />
          </div>

          {/* Quick Tabs */}
          <div className="flex gap-1.5 p-1 bg-zinc-100 rounded-xl">
            {[
              { id: "all", label: "الكل" },
              { id: "unread", label: "غير مقروء" },
              { id: "vips", label: "VIP" },
              { id: "closed", label: "المغلقة" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={cn(
                  "flex-1 text-[10px] font-black py-1.5 rounded-lg transition-all cursor-pointer",
                  activeTab === t.id
                    ? "bg-white text-zinc-800 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations scroll area */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-zinc-300 mx-auto" />
              <p className="text-xs text-zinc-400 font-bold">لا يوجد محادثات تطابق الفلتر</p>
            </div>
          ) : (
            filteredLeads.map((l) => {
              const isSelected = l.id === activeLeadId;
              const ch = getChannelDetails(l);
              const lastMsg =
                l.messages && l.messages.length > 0 ? l.messages[l.messages.length - 1] : null;

              return (
                <button
                  key={l.id}
                  onClick={() => {
                    setActiveLeadId(l.id);
                    setAiSummaryResult(null); // Clear summary for fresh load
                  }}
                  className={cn(
                    "w-full text-right p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer relative group",
                    isSelected
                      ? "bg-white border-primary shadow-sm"
                      : "bg-transparent border-transparent hover:bg-zinc-100/50"
                  )}
                >
                  {/* Channel icon colored badge */}
                  <div className={cn("p-2 rounded-xl shrink-0", ch.color)}>
                    <ch.icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-extrabold text-xs text-zinc-800 truncate">
                        {l.name}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-bold shrink-0">
                        {lastMsg
                          ? new Date(lastMsg.timestamp).toLocaleTimeString("ar-SA", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-[10px] text-zinc-500 font-semibold truncate max-w-[140px]">
                        {lastMsg ? lastMsg.text : "بدء محادثة جديدة..."}
                      </p>

                      {l.unreadCount && l.unreadCount > 0 ? (
                        <span className="bg-emerald-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                          {l.unreadCount}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex gap-1.5 items-center mt-2">
                      <span className="text-[8px] font-black bg-zinc-200/50 text-zinc-500 px-2 py-0.5 rounded-md">
                        {l.company}
                      </span>
                      {l.value >= 12000 && (
                        <span className="text-[8px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/15 px-2 py-0.5 rounded-md">
                          💎 VIP
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Pane 2: Conversation Window (6 columns) */}
      <div className="xl:col-span-6 flex flex-col h-full bg-white relative">
        {activeLead ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center bg-zinc-50/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-sm shadow-sm">
                  {activeLead.name[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-zinc-800">{activeLead.name}</h4>
                  <p className="text-[9px] text-zinc-400 font-bold mt-0.5">
                    الشركة: {activeLead.company} | الهاتف: {activeLead.phone}
                  </p>
                </div>
              </div>

              {/* Header Channel badges */}
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "px-2.5 py-1 text-[9px] font-black rounded-full border flex items-center gap-1",
                    getChannelDetails(activeLead).color
                  )}
                >
                  {React.createElement(getChannelDetails(activeLead).icon, {
                    className: "w-3 h-3",
                  })}
                  <span>قناة: {getChannelDetails(activeLead).label}</span>
                </span>
                <button
                  onClick={() => toast.success("تم أرشفة المحادثة بنجاح")}
                  className="p-1.5 hover:bg-zinc-100 text-zinc-400 rounded-lg transition-colors cursor-pointer"
                  title="أرشفة المحادثة"
                >
                  <CheckCheck className="w-4 h-4 text-emerald-500" />
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-5 overflow-y-auto bg-zinc-50/30 space-y-4 no-scrollbar scroll-smooth">
              {activeLead.messages?.map((m: any) => {
                const isClient = m.sender === "client";
                const isNote = m.isInternalNote;

                if (isNote) {
                  return (
                    <div
                      key={m.id}
                      className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 max-w-[90%] mx-auto shadow-sm text-amber-800 text-xs font-bold space-y-1 animate-fadeIn"
                    >
                      <div className="flex justify-between items-center border-b border-amber-200/40 pb-1 mb-1.5">
                        <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider">
                          🔒 ملاحظة داخلية للموظفين
                        </span>
                        <span className="text-[8px] text-amber-500">
                          مكتوب بواسطة: {m.authorName}
                        </span>
                      </div>
                      <p className="leading-relaxed">
                        {m.text.replace("[ملاحظة داخلية للموظفين]:", "")}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={m.id}
                    className={cn(
                      "flex flex-col max-w-[80%]",
                      isClient ? "mr-auto items-end" : "ml-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "p-3.5 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm",
                        isClient
                          ? "bg-white border border-zinc-200/80 text-zinc-800 rounded-br-none"
                          : "bg-primary text-white rounded-bl-none"
                      )}
                    >
                      {m.text}
                    </div>
                    <span className="text-[8px] text-zinc-400 font-bold mt-1.5 px-1.5 tracking-wider flex items-center gap-1">
                      {new Date(m.timestamp).toLocaleTimeString("ar-SA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {!isClient && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                    </span>
                  </div>
                );
              })}

              {isDraftingReply && (
                <div className="bg-white border border-zinc-200 px-3 py-2.5 rounded-2xl max-w-max mr-auto shadow-sm flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* AI Assistant Context Helper Panel */}
            <AnimatePresence>
              {aiSummaryResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="bg-purple-50/90 border-t border-purple-100 p-4 shrink-0 text-xs text-purple-800 font-bold space-y-2 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-1.5 font-black text-purple-900">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      ملخص وتوصيات الذكاء الاصطناعي (AI Copilot Analysis)
                    </span>
                    <button
                      onClick={() => setAiSummaryResult(null)}
                      className="text-purple-400 hover:text-purple-600 transition-colors font-black text-sm"
                    >
                      ×
                    </button>
                  </div>
                  <p className="whitespace-pre-line leading-relaxed">{aiSummaryResult}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Composer */}
            <div className="p-4 border-t border-zinc-200 shrink-0 bg-zinc-50/50 space-y-3">
              {/* Tabs: Reply vs Note */}
              <div className="flex justify-between items-center">
                <div className="flex gap-2 bg-zinc-100 p-1 rounded-xl">
                  <button
                    onClick={() => setComposerMode("reply")}
                    className={cn(
                      "text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                      composerMode === "reply"
                        ? "bg-white text-zinc-800 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-800"
                    )}
                  >
                    💬 الرد على العميل
                  </button>
                  <button
                    onClick={() => setComposerMode("note")}
                    className={cn(
                      "text-[10px] font-black px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer",
                      composerMode === "note"
                        ? "bg-amber-500 text-white shadow-sm"
                        : "text-zinc-500 hover:text-amber-600"
                    )}
                  >
                    🔒 ملاحظة داخلية
                  </button>
                </div>

                {/* AI Instant Assistant Action Button */}
                <div className="flex gap-1.5">
                  <button
                    onClick={handleAiSmartReply}
                    disabled={isAiDrafting}
                    className="flex items-center gap-1 text-[9px] font-black bg-purple-100 hover:bg-purple-200 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{isAiDrafting ? "جاري الصياغة..." : "صياغة رد ذكي"}</span>
                  </button>
                  <button
                    onClick={handleAiSummarize}
                    disabled={isAiSummarizing}
                    className="flex items-center gap-1 text-[9px] font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-sm"
                  >
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>تلخيص المحادثة</span>
                  </button>
                </div>
              </div>

              {/* Form Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendAction()}
                  placeholder={
                    composerMode === "note"
                      ? "اكتب ملاحظة داخلية خاصة بالموظفين..."
                      : "اكتب ردك للعميل هنا..."
                  }
                  className={cn(
                    "flex-1 text-xs font-bold px-3.5 py-3 rounded-xl border focus:outline-none transition-all shadow-inner",
                    composerMode === "note"
                      ? "bg-amber-50/50 border-amber-200 focus:bg-white focus:border-amber-400"
                      : "bg-white border-zinc-200 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/5"
                  )}
                />
                <button
                  onClick={handleSendAction}
                  className={cn(
                    "text-white text-xs font-black px-5 rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer active:scale-95",
                    composerMode === "note"
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-primary hover:bg-primary/95"
                  )}
                >
                  <Send className="w-3.5 h-3.5 rotate-180 ml-1.5" />
                  <span>إرسال</span>
                </button>
              </div>

              {/* Footer Toolbar mock uploads */}
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                <div className="flex gap-3">
                  <button
                    onClick={() => toast.info("مرفقات الصور/الملفات مفعلة حياً")}
                    className="flex items-center gap-1 hover:text-zinc-600 cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" /> ملفات
                  </button>
                  <button
                    onClick={() => setInputText(inputText + " 👍")}
                    className="flex items-center gap-1 hover:text-zinc-600 cursor-pointer"
                  >
                    <Smile className="w-3.5 h-3.5" /> إيموجي
                  </button>
                </div>
                <span>* اضغط Enter للإرسال الفوري</span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <MessageSquare className="w-16 h-16 text-zinc-200 animate-pulse" />
            <div>
              <h3 className="font-extrabold text-sm text-zinc-800">صندوق الوارد الموحد</h3>
              <p className="text-xs text-zinc-400 font-bold mt-1">
                اختر محادثة عميل من القائمة الجانبية لبدء التواصل
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pane 3: Customer 360° Profile (3 columns) */}
      <div className="xl:col-span-3 border-r border-zinc-200 bg-zinc-50/30 flex flex-col h-full overflow-y-auto no-scrollbar">
        {activeLead ? (
          <div className="p-4 space-y-5">
            {/* Avatar block */}
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-black text-xl mx-auto shadow-sm">
                {activeLead.name[0]}
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-zinc-800">{activeLead.name}</h4>
                <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{activeLead.company}</p>
              </div>
            </div>

            {/* Quick action triggers */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-black text-center pt-2 border-t border-zinc-200">
              <button
                onClick={handleCreateInvoice}
                className="p-2.5 bg-white border border-zinc-200 hover:border-primary/40 rounded-xl transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center gap-1 text-zinc-700"
              >
                <FileText className="w-4 h-4 text-primary" />
                <span>توليد فاتورة</span>
              </button>
              <button
                onClick={handleCreateSupportTicket}
                className="p-2.5 bg-white border border-zinc-200 hover:border-primary/40 rounded-xl transition-all shadow-sm cursor-pointer flex flex-col items-center justify-center gap-1 text-zinc-700"
              >
                <Sliders className="w-4 h-4 text-indigo-500" />
                <span>فتح تذكرة</span>
              </button>
            </div>

            {/* Expandable Accordions */}
            <div className="space-y-2">
              {/* Section 1: Financial context */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleSection("financials")}
                  className="w-full flex justify-between items-center p-3 text-right bg-zinc-50/50 cursor-pointer"
                >
                  <span className="text-[10px] font-black text-zinc-700">
                    العمليات المالية والفواتير
                  </span>
                  {expandedSection === "financials" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedSection === "financials" && (
                  <div className="p-3 border-t border-zinc-100 text-[10px] font-bold space-y-2">
                    <div className="flex justify-between items-center text-zinc-500 pb-2 border-b border-zinc-50">
                      <span>القيمة المقدرة:</span>
                      <span className="text-zinc-800 font-black">
                        {(activeLead.value || 0).toLocaleString("ar-SA")} ر.س
                      </span>
                    </div>
                    {/* Mock Invoices list */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between items-center p-2 bg-zinc-50 border border-zinc-200/50 rounded-xl">
                        <span>فاتورة #INV-9023</span>
                        <span className="px-1.5 py-0.5 text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md">
                          مدفوعة
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-zinc-50 border border-zinc-200/50 rounded-xl">
                        <span>عرض سعر #QT-109</span>
                        <span className="px-1.5 py-0.5 text-[8px] bg-amber-50 text-amber-600 border border-amber-100 rounded-md">
                          مقبول
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Predictive Risk Analysis */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleSection("predictive")}
                  className="w-full flex justify-between items-center p-3 text-right bg-zinc-50/50 cursor-pointer"
                >
                  <span className="text-[10px] font-black text-purple-700 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-500 animate-pulse" />
                    تحليل الذكاء الاصطناعي والتنبؤ
                  </span>
                  {expandedSection === "predictive" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedSection === "predictive" && (
                  <div className="p-3 border-t border-zinc-100 text-[10px] font-bold space-y-3">
                    {/* Churn risk bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-black text-zinc-400">
                        <span>احتمالية تسرب العميل (Churn Risk):</span>
                        <span className="text-emerald-500">12% (آمن ومنخفض)</span>
                      </div>
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: "12%" }} />
                      </div>
                    </div>

                    {/* Sentiment Analysis */}
                    <div className="space-y-1 bg-zinc-50 p-2.5 rounded-xl border border-zinc-200/50">
                      <span className="text-[9px] font-black text-zinc-400 block">
                        نبرة الحديث الأخيرة (Sentiment):
                      </span>
                      <span className="text-zinc-800 font-extrabold flex items-center gap-1">
                        😊 إيجابية ومتفاعلة (Positive)
                      </span>
                    </div>

                    {/* Urgent flag */}
                    <div className="flex justify-between items-center">
                      <span>درجة الاستعجال:</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full font-black text-[8px]">
                        متوسطة الأولوية
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 3: Contact information details */}
              <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => toggleSection("contact")}
                  className="w-full flex justify-between items-center p-3 text-right bg-zinc-50/50 cursor-pointer"
                >
                  <span className="text-[10px] font-black text-zinc-700">
                    بيانات الاتصال والتوزيع الجغرافي
                  </span>
                  {expandedSection === "contact" ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
                {expandedSection === "contact" && (
                  <div className="p-3 border-t border-zinc-100 text-[10px] font-bold space-y-2">
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[9px] block">البريد الإلكتروني:</span>
                      <span className="text-zinc-800 truncate block">
                        {activeLead.email || "support@madarij-os.com"}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[9px] block">الدولة واللغة:</span>
                      <span className="text-zinc-800 block">
                        المملكة العربية السعودية | العربية (ناجدي)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-zinc-400 text-xs font-bold">
            لا يوجد عميل نشط لعرض بياناته
          </div>
        )}
      </div>
    </div>
  );
}
