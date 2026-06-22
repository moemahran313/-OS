import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Activity
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  addDoc
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { toast } from "sonner";

interface ChatMessage {
  id: string;
  sender: "client" | "user" | "ai";
  text: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface ChatLead {
  id: string;
  name: string;
  company: string;
  phone: string;
  status: string;
  value: number;
  messages?: ChatMessage[];
  unreadCount?: number;
  lastMessageTime?: string;
  email?: string;
}

export default function Chat() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "opportunities">("all");
  const [isAiResponderActive, setIsAiResponderActive] = useState(true);
  const [isDraftingReply, setIsDraftingReply] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Seed default messages if CRM Lead doc has none, to make it work immediately with real high-fidelity records
  const getSeededMessages = (lead: any): ChatMessage[] => {
    const baseTime = new Date();
    const timeOffset = (minsAgo: number) => {
      const d = new Date(baseTime.getTime() - minsAgo * 60000);
      return d.toISOString();
    };

    if (lead.status === "new") {
      return [
        {
          id: "m1",
          sender: "client",
          text: `مرحباً، أنا مهتم بالحصول على تسعيرة لخدماتكم في شركة ${lead.company || "الريادة"}. هل يمكنكم تزويدي بالتفاصيل؟`,
          timestamp: timeOffset(45),
          status: "read"
        },
        {
          id: "m2",
          sender: "user",
          text: "أهلاً بك يا فندم، يسعدنا تواصلك معنا. سنقوم بإعداد عرض السعر وربطه بالـ CRM الخاص بكم فوراً. هل هناك متطلبات محددة لشحنتكم القادمة؟",
          timestamp: timeOffset(30),
          status: "read"
        },
        {
          id: "m3",
          sender: "client",
          text: "مرحباً، نعم نحن بحاجة لشحنة سريعة من الصين الأسبوع المقبل بأوراق جمركية معتمدة وفسح فوري.",
          timestamp: timeOffset(10),
          status: "delivered"
        }
      ];
    } else if (lead.status === "contacted") {
      return [
        {
          id: "c1",
          sender: "client",
          text: "السلام عليكم، هل بدأتم بالإجراءات؟ نحتاج لطلب العقد والمصادقة عليه حياً عبر بورتال مدارجOS.",
          timestamp: timeOffset(120),
          status: "read"
        },
        {
          id: "c2",
          sender: "user",
          text: "وعليكم السلام ورحمة الله، تم تفعيل بطاقة الصفقة في النظام وبانتظار تحميل المستندات الرسمية لإتمام الفحص المتكامل للامتثال الضريبي والجمركي.",
          timestamp: timeOffset(90),
          status: "read"
        },
        {
          id: "c3",
          sender: "client",
          text: "قمت برفع شهادة الزكاة والتسجيل التجاري الآن. يرجى مراجعتها وتوليد مسودة الفاتورة لإرسالها للقسم المالي لدينا للتعميد.",
          timestamp: timeOffset(15),
          status: "delivered"
        }
      ];
    } else {
      return [
        {
          id: "o1",
          sender: "client",
          text: "أهلاً وسهلاً، شكراً جزيلاً لسرعة الرد وأتمتة مسيرات الرواتب معنا. رائع جداً.",
          timestamp: timeOffset(180),
          status: "read"
        },
        {
          id: "o2",
          sender: "user",
          text: "سعيدون جداً بتقديم الخدمة لكم في مدارج! تم ربط جميع معاملاتكم بملف التزام الهيئات بنجاح.",
          timestamp: timeOffset(120),
          status: "read"
        },
        {
          id: "o3",
          sender: "client",
          text: "بالمناسبة، هل يمكنكم توليد رابط دفع إلكتروني للفاتورة الأخيرة؟ نريد دفعها قبل نهاية اليوم المالي.",
          timestamp: timeOffset(35),
          status: "read"
        }
      ];
    }
  };

  useEffect(() => {
    if (!user) return;

    // Listen to real-time sync with CRM leads
    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const leadData = doc.data();
        let messages = leadData.messages || [];
        
        // If there are no messages in the document yet, seed sample high-quality messages
        if (messages.length === 0) {
          messages = getSeededMessages(leadData);
        }

        const unreadCount = messages.filter((m: ChatMessage) => m.sender === "client" && m.status !== "read").length;
        const lastMessageTime = messages.length > 0 ? messages[messages.length - 1].timestamp : new Date().toISOString();

        return {
          id: doc.id,
          name: leadData.name || "عميل غير مسمى",
          company: leadData.company || "جهة غير محددة",
          phone: leadData.phone || "+966 50 000 0000",
          status: leadData.status || "new",
          value: leadData.value || 0,
          email: leadData.email || "",
          messages,
          unreadCount,
          lastMessageTime
        } as ChatLead;
      });

      // Sort leads by last message time descending
      data.sort((a, b) => new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime());
      
      setLeads(data);

      if (data.length > 0 && !activeLeadId) {
        setActiveLeadId(data[0].id);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Autoscroll chat window
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeLeadId, leads]);

  const activeLead = leads.find(l => l.id === activeLeadId);

  // Send message handler
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || !user || !activeLeadId || !activeLead) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: rawText.trim(),
      timestamp: new Date().toISOString(),
      status: "sent"
    };

    const updatedMessages = [...(activeLead.messages || []), newMessage];

    if (!textToSend) {
      setInputText("");
    }

    try {
      // Safely update lead document in Firestore
      await updateDoc(doc(db, "leads", activeLeadId), {
        messages: updatedMessages
      });

      // If simulated live AI responding is active, trigger an automated client reply
      if (isAiResponderActive) {
        setIsDraftingReply(true);
        setTimeout(async () => {
          try {
            const aiClientResponses = [
              "أشكرك جزيل الشكر على كريم ردك. هل يمكننا الاتصال بك غداً صباحاً لمناقشة التفاصيل هاتفياً؟",
              "رائع جداً! تم استلام ردكم بامتياز وسنقوم بالتحقق من العرض وتعميده من جهتنا بأسرع وقت.",
              "ممتاز للغاية. نظام مدارج فاق توقعاتنا من حيث السرعة والشفافية. ننتظر إصدار الفاتورة.",
              "وعليكم السلام، ممتاز. يرجى تزويدنا بالتفاصيل الجمركية لنصيغ الطلب بالكامل."
            ];
            
            // Randomly select one or customize based on prompt context
            const responseText = aiClientResponses[Math.floor(Math.random() * aiClientResponses.length)];
            
            const autoClientMessage: ChatMessage = {
              id: `msg_auto_${Date.now()}`,
              sender: "client",
              text: responseText,
              timestamp: new Date().toISOString(),
              status: "delivered"
            };

            await updateDoc(doc(db, "leads", activeLeadId), {
              messages: [...updatedMessages, autoClientMessage]
            });
            
          } catch (err) {
            console.error("Auto responder failed", err);
          } finally {
            setIsDraftingReply(false);
          }
        }, 1500);
      }

    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("فشل في إرسال الرسالة");
    }
  };

  // Convert quick action suggestions
  const sendQuickReply = (replyText: string) => {
    handleSendMessage(replyText);
  };

  // Mark all active messages as read
  useEffect(() => {
    if (!user || !activeLeadId || !activeLead) return;

    const unreadMessages = activeLead.messages?.filter(m => m.sender === "client" && m.status !== "read") || [];
    if (unreadMessages.length > 0) {
      const updatedMessages = activeLead.messages?.map(m => {
        if (m.sender === "client") {
          return { ...m, status: "read" as const };
        }
        return m;
      }) || [];

      // Update in background
      updateDoc(doc(db, "leads", activeLeadId), {
        messages: updatedMessages
      }).catch(err => console.error("Mark read error:", err));
    }
  }, [activeLeadId, activeLead?.unreadCount]);

  // Filters leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === "unread") {
      return (l.unreadCount || 0) > 0;
    }
    if (filter === "opportunities") {
      return l.value > 10000;
    }
    return true;
  });

  return (
    <div className="flex h-[calc(100vh-140px)] bg-zinc-50 rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden" dir="rtl">
      
      {/* 1. Conversations Sidebar (Right in RTL) */}
      <div className="w-[380px] border-l border-zinc-200 bg-white flex flex-col h-full shrink-0">
        
        {/* Search & Header */}
        <div className="p-5 border-b border-zinc-100 shrink-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-black text-xl text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              <span>محادثات واتساب + CRM</span>
            </h2>
            <div className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>متصل حياً</span>
            </div>
          </div>

          <div className="relative">
            <input 
              type="text"
              placeholder="ابحث عن عميل أو شركة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-3 pr-9 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-primary/50 focus:bg-white rounded-xl transition-all focus:outline-none"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Tab Filters */}
        <div className="px-4 py-2 border-b border-zinc-100 bg-zinc-50/50 flex gap-1 shrink-0">
          <button 
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              filter === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            الكل ({leads.length})
          </button>
          <button 
            onClick={() => setFilter("unread")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              filter === "unread" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            غير المقروءة ({leads.filter(l => (l.unreadCount || 0) > 0).length})
          </button>
          <button 
            onClick={() => setFilter("opportunities")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
              filter === "opportunities" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            )}
          >
            فرص نشطة ({leads.filter(l => l.value > 10000).length})
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
          {filteredLeads.map(lead => {
            const hasUnread = (lead.unreadCount || 0) > 0;
            const lastMsg = lead.messages && lead.messages.length > 0 ? lead.messages[lead.messages.length - 1] : null;
            const isActive = lead.id === activeLeadId;

            return (
              <button 
                key={lead.id}
                onClick={() => setActiveLeadId(lead.id)}
                className={cn(
                  "w-full text-right p-4 flex items-start gap-3 transition-colors",
                  isActive ? "bg-primary/5 border-r-4 border-primary" : "hover:bg-zinc-50/60"
                )}
              >
                {/* Avatar with Initials */}
                <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-600 shrink-0 select-none">
                  {lead.name.slice(0, 1) || <User className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-sm text-zinc-800 truncate block">{lead.name}</span>
                    <span className="text-[10px] text-zinc-400 font-medium">
                      {lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>

                  <span className="text-[11px] font-black text-zinc-400 block mb-1 truncate">{lead.company}</span>
                  
                  <div className="flex justify-between items-center mt-1">
                    <p className={cn(
                      "text-xs truncate max-w-[200px] font-medium block",
                      hasUnread ? "text-primary font-bold" : "text-zinc-500"
                    )}>
                      {lastMsg ? lastMsg.text : "لا توجد رسائل"}
                    </p>

                    {hasUnread && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white bg-primary text-center leading-none">
                        {lead.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}

          {filteredLeads.length === 0 && (
            <div className="py-12 text-center text-zinc-400 text-xs font-bold px-4">
              <CircleAlert className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              لا توجد محادثات تطابق هذا التصنيف
            </div>
          )}
        </div>
      </div>

      {/* 2. Active Chat Area (Left in RTL) */}
      <div className="flex-1 flex flex-col h-full bg-zinc-50 relative">
        <AnimatePresence mode="wait">
          {activeLead ? (
            <motion.div 
              key={activeLead.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              
              {/* Header */}
              <div className="p-5 border-b border-zinc-200 bg-white flex justify-between items-center shadow-sm relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-zinc-800 flex items-center gap-2">
                      <span>{activeLead.name}</span>
                      <span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg border border-primary/20">
                        {activeLead.company}
                      </span>
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{activeLead.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Smart Convert Button: Creates VAT ZATCA Invoice */}
                  <button 
                    onClick={() => {
                      navigate("/app/invoices", { 
                        state: { 
                          openInvoiceBuilder: true,
                          initialData: {
                            clientName: activeLead.name,
                            clientEmail: activeLead.email || "client@company.com",
                            clientCR: activeLead.phone || "",
                            customerName: activeLead.name,
                            customerVatId: "300000000000003", // Pre-populated sample VAT
                            companyName: activeLead.company,
                            netSalariesTotal: activeLead.value,
                            currency: "ر.س"
                          }
                        } 
                      });
                      toast.success(`تم تحويل الصادرات لـ ${activeLead.name} إلى مسودة فاتورة معتمدة!`);
                    }}
                    className="flex items-center gap-1.5 text-xs font-black bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3.5 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>توليد فاتورة للعميل</span>
                  </button>

                  {/* AI Auto-reply Toggle */}
                  <div className="flex items-center gap-2 border-r border-zinc-100 pr-3">
                    <span className="text-xs font-black text-zinc-600 flex items-center gap-1">
                      <Bot className="w-4 h-4 text-primary" />
                      <span>محاكي مبيعات مدارج حياً</span>
                    </span>
                    <button 
                      onClick={() => setIsAiResponderActive(!isAiResponderActive)}
                      className={cn(
                        "w-11 h-6 rounded-full p-0.5 transition-colors duration-200 shrink-0",
                        isAiResponderActive ? "bg-primary" : "bg-zinc-300"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200",
                        isAiResponderActive ? "-translate-x-5" : "translate-x-0"
                      )} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/287191442-86d4f139-3d10-47b2-ac9f-96e00cf7ed65.png')] bg-repeat bg-opacity-5">
                {activeLead.messages?.map((msg, idx) => {
                  const isClient = msg.sender === "client";
                  const isSystemAI = msg.sender === "ai";

                  return (
                    <div 
                      key={msg.id || idx}
                      className={cn(
                        "flex items-end gap-2.5 max-w-[75%]",
                        isClient ? "mr-0 ml-auto flex-row" : "mr-auto ml-0 flex-row-reverse"
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold leading-none shrink-0",
                        isClient ? "bg-primary/10 text-primary border border-primary/20" : "bg-zinc-200 text-zinc-700"
                      )}>
                        {isClient ? activeLead.name.slice(0, 1) : "أنت"}
                      </div>

                      {/* Msg Wrap */}
                      <div className="flex flex-col">
                        <div className={cn(
                          "px-4 py-3 rounded-2xl text-xs font-bold select-text leading-relaxed shadow-sm",
                          isClient 
                            ? "bg-white text-zinc-800 rounded-tr-none border border-zinc-100" 
                            : "bg-primary text-white rounded-tl-none"
                        )}>
                          {msg.text}
                        </div>
                        
                        <div className={cn(
                          "flex items-center gap-1.5 mt-1 text-[9px] text-zinc-400 font-bold",
                          isClient ? "justify-start" : "justify-end"
                        )}>
                          <span>
                            {new Date(msg.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!isClient && (
                            <span>
                              {msg.status === "read" ? (
                                <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-zinc-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Drafting live response dot block */}
                {isDraftingReply && (
                  <div className="flex items-end gap-2.5 max-w-[70%] mr-0 ml-auto">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold">
                      {activeLead.name.slice(0, 1)}
                    </div>
                    <div className="bg-white px-4 py-3 border border-zinc-100 rounded-2xl rounded-tr-none flex justify-center items-center gap-1 shadow-sm shrink-0">
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Quick Actions & Inputs */}
              <div className="p-4 border-t border-zinc-200 bg-white shrink-0">
                
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-2 mb-3 items-center">
                  <span className="text-[10px] text-zinc-400 font-extrabold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>ردود سريعة ذكية:</span>
                  </span>
                  
                  <button 
                    onClick={() => sendQuickReply("أهلاً بك، تم إرسال مسودة العقد المالي معتمد بالخطوات. يرجى تزويدنا بالموافقة للتصنيف.")}
                    className="px-2.5 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-zinc-600 border border-zinc-200 rounded-lg transition-all"
                  >
                    إرسال العقد
                  </button>
                  <button 
                    onClick={() => sendQuickReply("لقد قمنا بتوليد فاتورتكم الإلكترونية بالكامل. يمكنك مراجعتها وسدادها من خلال هذا الرابط المدقّق.")}
                    className="px-2.5 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-zinc-600 border border-zinc-200 rounded-lg transition-all"
                  >
                    رابط السداد والفاتورة
                  </button>
                  <button 
                    onClick={() => sendQuickReply("تم اعتماد ملف مدد ومطابقة كافة مسيرات الرواتب لشهر الالتزام بنجاح.")}
                    className="px-2.5 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-primary/5 hover:text-primary hover:border-primary/30 text-zinc-600 border border-zinc-200 rounded-lg transition-all"
                  >
                    تأكيد حماية الأجور
                  </button>
                </div>

                {/* Main Text Input Area */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2 items-center"
                >
                  <input 
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`اكتب رسالة إلى ${activeLead.name}...`}
                    className="flex-1 bg-zinc-50 border border-zinc-200 focus:border-primary/40 focus:bg-white text-xs font-bold px-4 py-3 focus:outline-none focus:ring-0 rounded-xl transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center transition-all shrink-0",
                      inputText.trim() 
                        ? "bg-primary text-white hover:bg-primary/95 shadow-md hover:-translate-y-0.5 active:translate-y-0" 
                        : "bg-zinc-100 text-zinc-400 border border-zinc-200 cursor-not-allowed"
                    )}
                  >
                    <Send className="w-5 h-5 -rotate-90" />
                  </button>
                </form>
              </div>

            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 p-8">
              <MessageSquare className="w-12 h-12 text-zinc-300 animate-pulse mb-3" />
              <p className="font-bold text-sm">حدد عميلاً من القائمة لبدء المحادثة الذكية</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. AI Automation & Insights Panel (Far Left in RTL) */}
      {activeLead && (
        <div className="w-[320px] bg-white border-r border-zinc-200 flex flex-col h-full shrink-0 overflow-y-auto">
          <div className="p-5 border-b border-zinc-100 sticky top-0 bg-white z-10 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" />
            <h2 className="font-black text-lg text-zinc-900">أتمتة الذكاء الاصطناعي</h2>
          </div>

          <div className="p-5 space-y-6">
            {/* Qualification Panel */}
            <div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                تحليل النوايا والتأهيل
              </h3>
              
              {(() => {
                // Extract intent based on keywords in client messages
                const clientMessages = activeLead.messages?.filter(m => m.sender === "client").map(m => m.text) || [];
                const fullText = clientMessages.join(" ").toLowerCase();
                
                let intent = "استكشاف (Exploration)";
                let score = 30;
                let colorClass = "text-zinc-600 bg-zinc-100 border-zinc-200";
                
                if (fullText.includes("شراء") || fullText.includes("سعر") || fullText.includes("تسعيرة") || fullText.includes("دفع") || fullText.includes("فاتورة")) {
                  intent = "جاهز للشراء (High Intent)";
                  score = 90;
                  colorClass = "text-emerald-700 bg-emerald-50 border-emerald-200";
                } else if (fullText.includes("سؤال") || fullText.includes("استفسار") || fullText.includes("تفاصيل") || fullText.includes("كيف")) {
                  intent = "جمع معلومات (Information Gathering)";
                  score = 60;
                  colorClass = "text-blue-700 bg-blue-50 border-blue-200";
                } else if (fullText.includes("مشكلة") || fullText.includes("دعم") || fullText.includes("خطأ")) {
                  intent = "شكوى / دعم فني (Support)";
                  score = 40;
                  colorClass = "text-amber-700 bg-amber-50 border-amber-200";
                }

                return (
                  <div className="space-y-4">
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-zinc-500">مستوى التأهيل (Score)</span>
                        <span className="text-sm font-black text-zinc-900">{score}%</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-1.5 mb-4 overflow-hidden">
                        <motion.div 
                          className="h-full bg-primary" 
                          initial={{ width: 0 }}
                          animate={{ width: `${score}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        />
                      </div>
                      <div className={`text-xs font-black px-3 py-1.5 rounded-lg border text-center ${colorClass}`}>
                        {intent}
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 shadow-sm">
                       <h4 className="text-[11px] font-black text-purple-800 mb-2 uppercase tracking-wide">الكلمات المفتاحية المكتشفة</h4>
                       <div className="flex flex-wrap gap-1.5">
                         {["تسعيرة", "دفع", "سريع", "عقد"].filter(k => fullText.includes(k)).map(keyword => (
                           <span key={keyword} className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                             {keyword}
                           </span>
                         ))}
                         {["تسعيرة", "دفع", "سريع", "عقد"].filter(k => fullText.includes(k)).length === 0 && (
                            <span className="text-xs text-purple-600/70 font-medium">لم يتم العثور على كلمات مفتاحية واضحة</span>
                         )}
                       </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="w-full h-px bg-zinc-100" />

            {/* Follow-up Sequence Settings */}
            <div>
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Timer className="w-4 h-4 text-blue-500" />
                تتابعات المتابعة التلقائية
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <MailWarning className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">سلسلة التخلي (Abandonment)</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">متابعة آلية بعد 24 ساعة من التجاهل</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="abandonment-toggle" className="sr-only peer" defaultChecked />
                    <label htmlFor="abandonment-toggle" className="w-9 h-5 bg-zinc-300 peer-checked:bg-primary rounded-full cursor-pointer relative block transition-colors before:content-[''] before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:absolute before:top-[3px] before:left-[3px] peer-checked:before:translate-x-4 before:transition-transform" />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900">تذكير الدفع (Payment Nudge)</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">عند إصدار الفاتورة وعدم الدفع</p>
                    </div>
                  </div>
                  <div className="relative">
                    <input type="checkbox" id="payment-toggle" className="sr-only peer" defaultChecked />
                    <label htmlFor="payment-toggle" className="w-9 h-5 bg-zinc-300 peer-checked:bg-emerald-500 rounded-full cursor-pointer relative block transition-colors before:content-[''] before:w-3.5 before:h-3.5 before:bg-white before:rounded-full before:absolute before:top-[3px] before:left-[3px] peer-checked:before:translate-x-4 before:transition-transform" />
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2">
                <Settings className="w-4 h-4" />
                تخصيص قواعد الأتمتة
              </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
