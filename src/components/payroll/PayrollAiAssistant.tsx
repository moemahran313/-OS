import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, User, LogIn, RefreshCw, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useSettings } from "@/src/contexts/SettingsContext";

interface Message {
  role: "user" | "model";
  text: string;
}

export default function PayrollAiAssistant() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "مرحباً بك! أنا مساعد مدرج HR الذكي المدعوم بنموذج الذكاء الاصطناعي Gemini. أملك وصولاً مباشراً لملفات موظفيك ومسيرات رواتبك لمساعدتك في الامتثال لنظام العمل وحل مشاكل مدد ومدقق العقود وإعداد WPS.",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = { role: "user", text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const response = await fetch("/api/hr/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages,
        }),
      });

      if (!response.ok) {
        throw new Error("فشل المساعد في الاستجابة حالياً");
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.text || "لم تتم الاستجابة بالشكل المتوقع." },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "⚠️ **حدث خطأ فني أثناء التحدث مع الخادم.**\n\nيرجى التأكد من توفر اتصال بالشبكة، وتكوين مفتاح Gemini في إعدادات التطبيق الخاصة بمدير النظام.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const PRESET_PROMPTS = [
    "مقارنة رواتب السعوديين بالأجانب والامتثال لـ GOSI",
    "توصيات لتحسين النطاقات ومستوى التوطين في الشركة",
    "تدقيق ملفات الموظفين - من ينقصه رقم الآيبان (IBAN) أو العقد؟",
    "طريقة توليد ملف SIF وتقديمه لمنصة مدد",
  ];

  return (
    <div
      className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[600px]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-zinc-900 flex items-center gap-2">
              مساعد شؤون الموظفين الذكي (Generative AI)
              <span className="text-[10px] bg-violet-100 text-violet-700 font-bold px-2 py-0.5 rounded-full">
                Gemini 3.5
              </span>
            </h3>
            <p className="text-xs text-zinc-400 font-medium">
              ذكي، فوري ومترابط مع بيانات الموظفين والمسيرات النشطة
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-zinc-50/20">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                  msg.role === "user"
                    ? "bg-zinc-900 border-zinc-900 text-white"
                    : "bg-white border-zinc-200 text-violet-600"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-4 rounded-3xl text-sm font-semibold leading-relaxed shadow-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-zinc-900 text-white rounded-tr-none"
                    : "bg-white border border-zinc-200/85 text-zinc-800 rounded-tl-none"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-3 max-w-[70%] ml-auto">
            <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 text-violet-600 flex items-center justify-center shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-white border border-zinc-200/85 p-4 rounded-3xl rounded-tl-none flex items-center gap-2 text-xs font-bold text-zinc-500 shadow-sm">
              <span
                className="w-2 h-2 rounded-full bg-violet-600 animate-bounce"
                style={{ animationDelay: "0ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-violet-600 animate-bounce"
                style={{ animationDelay: "150ms" }}
              />
              <span
                className="w-2 h-2 rounded-full bg-violet-600 animate-bounce"
                style={{ animationDelay: "300ms" }}
              />
              <span>مساعد مدرج يقوم بمراجعة ملفات موظفيك...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Presets Row */}
      {messages.length <= 2 && !loading && (
        <div className="p-4 border-t border-zinc-100 bg-white flex flex-wrap gap-2">
          {PRESET_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 hover:bg-zinc-100 rounded-xl text-xs font-black text-zinc-600 transition-colors flex items-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-zinc-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="اسأل مساعد الموارد البشرية الذكي عن الرواتب، الغيابات، أو متطلبات حماية الأجور..."
            className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-semibold text-sm outline-none focus:ring-2 focus:ring-violet-600/20 focus:border-violet-600 transition-all placeholder:text-zinc-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="px-5 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-100 text-white disabled:text-zinc-400 rounded-2xl shadow-lg shadow-violet-600/20 active:scale-95 transition-transform flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
