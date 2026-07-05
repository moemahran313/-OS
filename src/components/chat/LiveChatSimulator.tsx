import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Paperclip,
  Smile,
  ShieldCheck,
  CheckCheck,
  Building,
  ArrowLeft,
  ArrowRight,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

interface LiveChatSimulatorProps {
  onSimulateClientMessage: (text: string) => void;
  brandColor?: string;
  widgetTitle?: string;
}

export default function LiveChatSimulator({
  onSimulateClientMessage,
  brandColor = "#0f9b7e",
  widgetTitle = "الدعم المباشر - مدارج OS",
}: LiveChatSimulatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { id: string; sender: "client" | "agent" | "bot"; text: string; time: string }[]
  >([
    {
      id: "wel-1",
      sender: "bot",
      text: "أهلاً بك في خدمات مدارج OS المتكاملة! كيف يمكننا مساعدتك اليوم؟ يمكنك الاستفسار عن باقات المحاسبة والـ CRM وإدارة الموارد.",
      time: "10:00 ص",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg = {
      id: "sim-" + Date.now(),
      sender: "client" as const,
      text: inputText,
      time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    onSimulateClientMessage(inputText);
    setInputText("");

    // Simulate agent reply or AI typing
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: "rep-" + Date.now(),
          sender: "bot",
          text: "تم استلام رسالتك وتوجيهها لـ AI Copilot والوكيل في صندوق الوارد الموحد. يرجى مراجعة لوحة تحكم الوكيل لمتابعة المحادثة والرد!",
          time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 2000);
  };

  const handleRating = (stars: number) => {
    setRating(stars);
    toast.success("شكرًا لتقييمك لمستوى الخدمة!");
    setMessages((prev) => [
      ...prev,
      {
        id: "rat-" + Date.now(),
        sender: "bot",
        text: `شكرًا جزيلاً لتقييمك بـ (${stars === 4 ? "ممتاز 😍" : stars === 3 ? "جيد 🙂" : stars === 2 ? "مقبول 😐" : "سيء 😡"}). نقدر ملاحظاتك لتحسين الخدمة.`,
        time: new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Simulation Workspace Panel */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-2">
        <h3 className="font-extrabold text-sm text-zinc-800 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-primary" />
          محاكي ويدجت محادثة الموقع حياً (Client View Simulator)
        </h3>
        <p className="text-[10px] text-zinc-500 font-bold leading-relaxed">
          هذا المحاكي يتيح لك تجربة تجربة العميل (Customer Experience) كاملة! قم بالكتابة وإرسال الرسائل كزائر للموقع، ثم انتقل لعلامة تبويب <span className="text-primary">صندوق الوارد الموحد</span> لتشاهد كيف تتدفق رسائل العميل وتظهر مع وسم "المحادثة المباشرة" وسنتيمترات الذكاء الاصطناعي.
        </p>
      </div>

      {/* Simulated Website Container */}
      <div className="relative border border-zinc-200 rounded-3xl h-[560px] bg-zinc-50 overflow-hidden shadow-inner flex flex-col justify-between">
        {/* Mock Homepage Navbar */}
        <div className="bg-white border-b border-zinc-200/60 px-5 py-3.5 flex justify-between items-center z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center font-black text-xs">
              M
            </div>
            <span className="font-extrabold text-xs text-zinc-800">موقعك الإلكتروني المزعوم</span>
          </div>
          <div className="flex gap-4 text-[10px] font-bold text-zinc-500">
            <span>الرئيسية</span>
            <span>الخدمات</span>
            <span>الأسعار</span>
            <span>اتصل بنا</span>
          </div>
        </div>

        {/* Mock Homepage Content */}
        <div className="flex-1 p-8 flex flex-col justify-center items-center text-center space-y-4 max-w-xl mx-auto">
          <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black text-primary uppercase tracking-widest block">
            بوابة المبيعات والخدمات السحابية
          </span>
          <h2 className="text-xl font-extrabold text-zinc-800 leading-tight">
            حول زوار موقعك لصفقات مبيعات وتذاكر دعم مغلقة بنقرة واحدة!
          </h2>
          <p className="text-[11px] text-zinc-500 font-semibold leading-relaxed">
            الآن مع مدارج OS، يحصل زوار موقعك على استجابة فورية فائقة السرعة بفضل الذكاء الاصطناعي، مع فرز تلقائي لطلبات التسعير وتوليد للفرص في الـ CRM دون مغادرة المحادثة.
          </p>
          <div className="flex gap-3">
            <button className="bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-md">
              ابدأ الآن مجاناً
            </button>
            <button className="bg-white border border-zinc-200 text-zinc-600 text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-sm">
              شاهد التفاصيل
            </button>
          </div>
        </div>

        {/* Floating Chat Widget Trigger Trigger */}
        <div className="absolute bottom-6 right-6 z-30">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-xl cursor-pointer active:scale-95 group hover:scale-105"
            style={{ backgroundColor: brandColor }}
          >
            {isOpen ? (
              <X className="w-6 h-6 transition-transform duration-300 rotate-90" />
            ) : (
              <div className="relative">
                <MessageSquare className="w-6 h-6 shrink-0" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
              </div>
            )}
          </button>
        </div>

        {/* Sliding Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute bottom-22 right-6 w-[340px] h-[430px] bg-white border border-zinc-200 rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
            >
              {/* Widget Header */}
              <div
                className="p-4 text-white flex justify-between items-center shadow-md shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center font-bold text-xs uppercase">
                      AI
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black truncate">{widgetTitle}</h4>
                    <span className="text-[8px] opacity-80 font-bold block mt-0.5">نشطون حالياً للرد على استفسارك</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Message Feed */}
              <div
                ref={feedRef}
                className="flex-1 p-4 overflow-y-auto bg-zinc-50 space-y-3 scroll-smooth no-scrollbar"
              >
                {messages.map((m) => {
                  const isClient = m.sender === "client";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col max-w-[85%] ${isClient ? "mr-auto items-end" : "ml-auto items-start"}`}
                    >
                      <div
                        className={`p-3 rounded-2xl text-xs font-bold leading-relaxed ${
                          isClient
                            ? "bg-primary text-white rounded-br-none"
                            : "bg-white border border-zinc-200/80 text-zinc-800 rounded-bl-none shadow-sm"
                        }`}
                        style={isClient ? { backgroundColor: brandColor } : {}}
                      >
                        {m.text}
                      </div>
                      <span className="text-[8px] text-zinc-400 font-bold mt-1 tracking-wider px-1">
                        {m.time}
                      </span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-1 bg-white border border-zinc-200 px-3 py-2 rounded-2xl max-w-max ml-auto shadow-sm">
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                )}
              </div>

              {/* Ratings Panel (CSAT) inside chat */}
              {messages.length >= 2 && !rating && (
                <div className="p-3 bg-zinc-100 border-t border-zinc-200 text-center space-y-2 shrink-0 animate-fadeIn">
                  <span className="text-[10px] text-zinc-500 font-black">كيف تقيم جودة إجابتنا؟</span>
                  <div className="flex justify-center gap-4 text-lg">
                    <button onClick={() => handleRating(4)} className="hover:scale-125 transition-transform" title="ممتاز">😍</button>
                    <button onClick={() => handleRating(3)} className="hover:scale-125 transition-transform" title="جيد">🙂</button>
                    <button onClick={() => handleRating(2)} className="hover:scale-125 transition-transform" title="مقبول">😐</button>
                    <button onClick={() => handleRating(1)} className="hover:scale-125 transition-transform" title="سيء">😡</button>
                  </div>
                </div>
              )}

              {/* Composer */}
              <div className="p-3.5 bg-white border-t border-zinc-200/80 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="اكتب استفسارك هنا..."
                  className="flex-1 text-xs font-bold bg-zinc-50 border border-zinc-200 px-3 py-2.5 focus:bg-white focus:border-primary/40 rounded-xl focus:outline-none transition-all"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2.5 rounded-xl text-white transition-all cursor-pointer active:scale-95 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: brandColor }}
                >
                  <Send className="w-3.5 h-3.5 rotate-180" />
                </button>
              </div>

              {/* Footer Brand */}
              <div className="bg-zinc-50 border-t border-zinc-100 py-1.5 text-center flex justify-center items-center gap-1 text-[8px] text-zinc-400 font-bold shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>مؤمن بالكامل بواسطة نظام مدارج OS</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
