import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Globe,
  Activity,
  Zap,
  Settings,
  Sparkles,
  ArrowRight,
  Plus,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { useSettings } from "@/src/contexts/SettingsContext";
import { toast } from "sonner";

// Import Modular Hub Views
import InboxView from "../components/chat/InboxView";
import LiveChatSimulator from "../components/chat/LiveChatSimulator";
import AnalyticsView from "../components/chat/AnalyticsView";
import WorkflowsView from "../components/chat/WorkflowsView";
import ChannelsView from "../components/chat/ChannelsView";

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
  const { settings, updateSettings } = useSettings();

  // Selected Hub View State
  const [currentTab, setCurrentTab] = useState<
    "inbox" | "simulator" | "analytics" | "workflows" | "channels"
  >("inbox");

  // Core Sync States
  const [leads, setLeads] = useState<ChatLead[]>([]);
  const [activeLeadId, setActiveLeadId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "opportunities">("all");
  const [isAiResponderActive, setIsAiResponderActive] = useState(true);
  const [isDraftingReply, setIsDraftingReply] = useState(false);

  // Fallback seed messages if lead has none
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
          text: "مرحباً، أبحث عن حل لأتمتة الفواتير الإلكترونية المعتمدة لشركتنا في جمرك الرياض وحساب الضرائب والزكاة تلقائياً.",
          timestamp: timeOffset(120),
          status: "read",
        },
        {
          id: "m2",
          sender: "user",
          text: "أهلاً بك! نظام مدارج OS يدعم الربط المباشر مع هيئة الزكاة والضريبة والجمارك (ZATCA) في المرحلة الثانية للفوترة الإلكترونية.",
          timestamp: timeOffset(90),
          status: "read",
        },
        {
          id: "m3",
          sender: "client",
          text: "هذا رائع جداً! هل يمكننا تجربة لوحة التحكم لمعرفة سرعة استجابة تقارير المراجعة الضريبية؟",
          timestamp: timeOffset(10),
          status: "delivered",
        },
      ];
    } else {
      return [
        {
          id: "o1",
          sender: "client",
          text: "أهلاً وسهلاً، شكراً جزيلاً لسرعة الرد وأتمتة مسيرات الرواتب معنا. رائع جداً.",
          timestamp: timeOffset(180),
          status: "read",
        },
        {
          id: "o2",
          sender: "user",
          text: "سعيدون جداً بتقديم الخدمة لكم في مدارج! تم ربط جميع معاملاتكم بملف التزام الهيئات بنجاح.",
          timestamp: timeOffset(120),
          status: "read",
        },
        {
          id: "o3",
          sender: "client",
          text: "بالمناسبة، هل يمكنكم توليد رابط دفع إلكتروني للفاتورة الأخيرة؟ نريد دفعها قبل نهاية اليوم المالي.",
          timestamp: timeOffset(35),
          status: "read",
        },
      ];
    }
  };

  // Listen to CRM leads in Firestore in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "leads"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const leadData = doc.data();
        let messages = leadData.messages || [];

        if (messages.length === 0) {
          messages = getSeededMessages(leadData);
        }

        const unreadCount = messages.filter(
          (m: ChatMessage) => m.sender === "client" && m.status !== "read"
        ).length;

        const lastMessageTime =
          messages.length > 0 ? messages[messages.length - 1].timestamp : new Date().toISOString();

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
          lastMessageTime,
        } as ChatLead;
      });

      // Sort leads by last message time descending
      data.sort(
        (a, b) => new Date(b.lastMessageTime!).getTime() - new Date(a.lastMessageTime!).getTime()
      );

      setLeads(data);

      if (data.length > 0 && !activeLeadId) {
        setActiveLeadId(data[0].id);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const activeLead = leads.find((l) => l.id === activeLeadId);

  // Send message handler (updates Firestore database to trigger real-time onSnapshot)
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || !user || !activeLeadId || !activeLead) return;

    if (!textToSend) {
      setInputText("");
    }

    // Direct Integration with OpenWA if enabled
    if (settings.openwaEnabled && settings.openwaUrl) {
      try {
        const response = await fetch("/api/openwa/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: activeLead.phone,
            text: rawText.trim(),
            leadId: activeLeadId,
          }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
          toast.success("تم الإرسال بنجاح عبر واتساب (OpenWA)");
        } else {
          toast.warning(data.error || "تم حفظ الرسالة محلياً (محرك OpenWA لم يستجب حياً)");
        }
      } catch (err) {
        console.error("OpenWA send failed, fallback to local", err);
        toast.warning("تم حفظ الرسالة محلياً (خادم OpenWA غير متصل)");
      }
    }

    // Save to Firestore
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: rawText.trim(),
      timestamp: new Date().toISOString(),
      status: "sent",
    };

    const updatedMessages = [...(activeLead.messages || []), newMessage];

    try {
      await updateDoc(doc(db, "leads", activeLeadId), {
        messages: updatedMessages,
      });

      // Live SSE Streaming Gemini AI Responder Integration
      if (isAiResponderActive) {
        setIsDraftingReply(true);
        try {
          const response = await fetch("/api/chat/stream", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: activeLeadId,
              messageText: rawText.trim(),
              channel: "omnichannel_chat",
            }),
          });

          if (response.ok && response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;

            while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              if (value) {
                const chunk = decoder.decode(value, { stream: true });
                // Firestore automatically syncs via onSnapshot listener as server updates lead doc
              }
            }
          } else {
            console.warn("Chat streaming endpoint returned error status");
          }
        } catch (err) {
          console.error("Gemini SSE Streaming Error:", err);
        } finally {
          setIsDraftingReply(false);
        }
      }
    } catch (err) {
      console.error("Failed to send message", err);
      toast.error("فشل في إرسال الرسالة");
    }
  };

  // Simulator Message Receiver Loop (real-time loop writing back to Firestore!)
  const handleSimulateClientMessage = async (text: string) => {
    if (!activeLeadId || !activeLead) {
      toast.error("يرجى اختيار عميل من صندوق الوارد أولاً لربط المحاكاة بملفه");
      return;
    }

    const newSimMsg: ChatMessage = {
      id: `sim_client_${Date.now()}`,
      sender: "client",
      text: text.trim(),
      timestamp: new Date().toISOString(),
      status: "delivered",
    };

    const updatedMessages = [...(activeLead.messages || []), newSimMsg];

    try {
      await updateDoc(doc(db, "leads", activeLeadId), {
        messages: updatedMessages,
      });
    } catch (err) {
      console.error("Failed to sync simulated message with Firestore", err);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Upper Navigation & Title Card */}
      <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> مركز الاتصالات الموحد
          </span>
          <h2 className="text-xl font-extrabold text-zinc-800 mt-2">Unified Communications Hub</h2>
          <p className="text-[11px] text-zinc-500 font-bold mt-0.5">
            صندوق وارد متكامل لرسائل واتساب، تيليجرام، والبريد الإلكتروني مع ربط كامل بالـ CRM
            والذكاء الاصطناعي
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-100 rounded-2xl w-full md:w-auto">
          {[
            { id: "inbox", label: "صندوق الوارد الموحد", icon: MessageSquare },
            { id: "simulator", label: "محاكي الموقع حياً", icon: Globe },
            { id: "analytics", label: "التقارير والتحليلات", icon: Activity },
            { id: "workflows", label: "سير العمل والأتمتة", icon: Zap },
            { id: "channels", label: "قنوات الاتصال والربط", icon: Settings },
          ].map((tab) => {
            const isSelected = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-1.5 text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer flex-1 md:flex-none justify-center",
                  isSelected
                    ? "bg-primary text-white shadow-md scale-[1.02]"
                    : "text-zinc-650 hover:bg-zinc-200/60"
                )}
              >
                <tab.icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Selected View */}
      <div className="min-h-[500px]">
        {currentTab === "inbox" && (
          <InboxView
            leads={leads}
            activeLeadId={activeLeadId}
            setActiveLeadId={setActiveLeadId}
            inputText={inputText}
            setInputText={setInputText}
            handleSendMessage={handleSendMessage}
            isDraftingReply={isDraftingReply}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filter={filter}
            setFilter={setFilter}
          />
        )}

        {currentTab === "simulator" && (
          <LiveChatSimulator onSimulateClientMessage={handleSimulateClientMessage} />
        )}

        {currentTab === "analytics" && <AnalyticsView />}

        {currentTab === "workflows" && <WorkflowsView />}

        {currentTab === "channels" && <ChannelsView />}
      </div>
    </div>
  );
}
