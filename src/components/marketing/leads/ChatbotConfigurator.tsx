import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Settings,
  Send,
  RefreshCw,
  Cpu,
  Bot,
  User,
  CheckCircle,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import { leadsService, ChatbotConfig } from "@/src/services/leads.service";

interface ChatbotConfiguratorProps {
  chatbotConfig: ChatbotConfig;
  onRefresh: () => void;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatbotConfigurator({
  chatbotConfig: initialConfig,
  onRefresh,
}: ChatbotConfiguratorProps) {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith("ar");

  // Local state for chatbot configuration
  const [config, setConfig] = useState<ChatbotConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  // Live simulation chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: initialConfig.greeting || "مرحباً بك! كيف يمكنني مساعدتك اليوم؟",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Extracted data live widget
  const [extractedVars, setExtractedVars] = useState<Record<string, string>>({
    name: "",
    email: "",
    company: "",
    phone: "",
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  // Handle saving chatbot settings
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await leadsService.saveChatbotConfig(config);
      onRefresh();
      toast.success(
        isAr ? "تم حفظ إعدادات الروبوت بنجاح!" : "Chatbot settings saved successfully!"
      );
    } catch (err) {
      toast.error(isAr ? "فشل الحفظ" : "Failed to save chatbot configurations");
    } finally {
      setSaving(false);
    }
  };

  // Simulate AI chat response
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput("");

    const newMessages = [...chatMessages, { role: "user" as const, content: userMsg }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      // Direct call to API
      const res = await fetch("/api/lead-gen/chatbots/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          systemPrompt: config.systemPrompt,
          capturedFields: ["name", "email", "company", "phone"],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);

        // Extract variables
        if (data.extractedData) {
          const filteredVars = Object.entries(data.extractedData).reduce(
            (acc, [k, v]) => {
              if (v) acc[k] = v as string;
              return acc;
            },
            {} as Record<string, string>
          );
          setExtractedVars((prev) => ({ ...prev, ...filteredVars }));
        }

        if (data.isLeadComplete) {
          toast.success(
            isAr
              ? "تم استخراج بيانات العميل وتأهيله تلقائياً بذكاء!"
              : "Lead qualified and stored automatically!"
          );
        }
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error(isAr ? "تعذر الاتصال بذكاء الروبوت" : "Failed to get AI assistant response");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Left parameter setup pane */}
      <div className="lg:col-span-5 space-y-4">
        <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-400" />
            {isAr ? "عميل المبيعات والتأهيل الذكي (AI)" : "AI Sales Agent Engine"}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isAr
              ? "قم بضبط النبرة وخطوط الإرشاد للروبوت التفاعلي الذي يعمل على صفحات الهبوط لاستقبال العملاء واستخلاص اهتماماتهم تلقائياً."
              : "Customize guidelines and welcome greetings for the instant conversion assistant on your landing pages."}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold">
              {isAr ? "اسم مساعد المبيعات" : "Assistant/Bot Name"}
            </label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold">
              {isAr ? "رسالة الترحيب الأولى" : "Welcome Message"}
            </label>
            <textarea
              value={config.greeting}
              onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-20 focus:outline-none focus:border-indigo-500 resize-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              System Guidelines & Target Criteria
            </label>
            <textarea
              value={config.systemPrompt}
              onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-28 focus:outline-none focus:border-indigo-500 font-mono transition-all"
            />
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 transition-all"
          >
            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isAr ? "حفظ وتنشيط الروبوت الذكي" : "Save & Activate Assistant"}
          </button>
        </div>
      </div>

      {/* 2. Right Live Interactive Chat Simulator pane */}
      <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl min-h-[550px]">
        {/* Top bar header */}
        <div className="bg-slate-950 p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <h3 className="text-xs font-black text-white">{config.name || "AI Agent"}</h3>
          </div>
          <span className="text-[10px] bg-indigo-600/10 text-indigo-400 border border-indigo-500/10 px-3 py-1 rounded-full font-mono font-bold">
            ⚡ Simulation Mode
          </span>
        </div>

        {/* Messaging Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-950/20 max-h-[350px]">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "max-w-[75%] p-3.5 rounded-2xl text-xs leading-relaxed flex items-start gap-2.5",
                msg.role === "assistant"
                  ? "bg-slate-900 text-slate-100 border border-slate-800"
                  : "bg-indigo-600 text-white ml-auto"
              )}
            >
              {msg.role === "assistant" && (
                <Bot className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
              )}
              <div>{msg.content}</div>
            </div>
          ))}

          {chatLoading && (
            <div className="bg-slate-900 text-slate-400 p-3.5 rounded-2xl text-xs max-w-[80px] flex justify-center border border-slate-800">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Active Real-time Variable Extraction Board */}
        <div className="bg-slate-900/40 px-5 py-3.5 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3 text-[10px] font-mono">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/40">
            <span className="text-slate-500 block uppercase mb-1">Name</span>
            <span
              className={cn(
                "font-bold truncate block",
                extractedVars.name ? "text-emerald-400 font-black" : "text-slate-600"
              )}
            >
              {extractedVars.name || "[Pending]"}
            </span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/40">
            <span className="text-slate-500 block uppercase mb-1">Email</span>
            <span
              className={cn(
                "font-bold truncate block",
                extractedVars.email ? "text-emerald-400 font-black" : "text-slate-600"
              )}
            >
              {extractedVars.email || "[Pending]"}
            </span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/40">
            <span className="text-slate-500 block uppercase mb-1">Company</span>
            <span
              className={cn(
                "font-bold truncate block",
                extractedVars.company ? "text-emerald-400 font-black" : "text-slate-600"
              )}
            >
              {extractedVars.company || "[Pending]"}
            </span>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/40">
            <span className="text-slate-500 block uppercase mb-1">Phone</span>
            <span
              className={cn(
                "font-bold truncate block",
                extractedVars.phone ? "text-emerald-400 font-black" : "text-slate-600"
              )}
            >
              {extractedVars.phone || "[Pending]"}
            </span>
          </div>
        </div>

        {/* Input message form footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex gap-2.5">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder={
              isAr
                ? "اكتب رسالة لمحاكاة وتجريب الروبوت المتقدم..."
                : "Type simulated query to test bot context..."
            }
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={chatLoading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-all shadow-lg"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
