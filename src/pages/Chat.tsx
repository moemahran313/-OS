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

  // Listen to CRM leads in Firestore in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "leads"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => {
        const leadData = doc.data();
        const messages = leadData.messages || [];

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
  const handleSendMessage = async (textToSend?: string, isInternalNote?: boolean) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || !user || !activeLeadId || !activeLead) return;

    if (!textToSend) {
      setInputText("");
    }

    const leadChannel =
      (activeLead as any).channel ||
      (activeLead.phone?.startsWith("@") || (activeLead as any).telegramChatId ? "telegram" : "whatsapp");

    try {
      // 1. Dispatch real outbound message or internal note via server
      const sendRes = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: activeLeadId,
          text: rawText.trim(),
          channel: leadChannel,
          isInternalNote: !!isInternalNote,
        }),
      });

      const sendData = await sendRes.json();

      if (sendRes.ok && sendData.success) {
        if (isInternalNote) {
          toast.info("🔒 تم حفظ الملاحظة الداخلية للفريق بنجاح (غير مرئية للعميل)");
        } else if (sendData.sentLive) {
          toast.success(`✓ تم إرسال الرسالة حياً إلى العميل عبر ${leadChannel.toUpperCase()}`);
        } else {
          toast.info(`تم حفظ الرسالة في المحادثة وجاري أتمتة الإرسال عبر ${leadChannel}`);
        }
      } else {
        // Fallback: Save to Firestore directly if send route encounters issue
        const newMessage: ChatMessage = {
          id: isInternalNote ? `note_${Date.now()}` : `msg_${Date.now()}`,
          sender: isInternalNote ? ("internal_note" as any) : "user",
          text: rawText.trim(),
          timestamp: new Date().toISOString(),
          status: "sent",
        };
        await updateDoc(doc(db, "leads", activeLeadId), {
          messages: [...(activeLead.messages || []), newMessage],
          updatedAt: new Date().toISOString(),
        });
        if (isInternalNote) {
          toast.info("🔒 تم حفظ الملاحظة الداخلية للفريق بنجاح");
        }
      }

      // 2. Live SSE Streaming Gemini AI Responder Integration (Only for public client replies)
      if (!isInternalNote && isAiResponderActive) {
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
              channel: leadChannel,
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
