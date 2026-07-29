import React, { useState } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Zap,
  CheckCircle2,
  Building2,
  Search,
  MessageSquare,
} from "lucide-react";
import { LeadCompany } from "@/src/types/leadGen";
import { processBusinessCommand } from "@/src/services/aiService";

interface LeadCopilotAssistantProps {
  companies: LeadCompany[];
  onSelectCompany: (company: LeadCompany) => void;
}

export const LeadCopilotAssistant: React.FC<LeadCopilotAssistantProps> = ({
  companies,
  onSelectCompany,
}) => {
  const [messages, setMessages] = useState<{ sender: "user" | "ai"; text: string; data?: LeadCompany[] }[]>([
    {
      sender: "ai",
      text: "أهلاً بك! أنا مساعد استكشاف العملاء المستهدفين (LeadCopilot). يمكنك توجيه أي سؤال أو أمر باللغة الطبيعية. جرب أحد الاختصارات التالية:",
    },
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const samplePrompts = [
    "اعرض الشركات الهندسية في الرياض ذات الأداء المتقادم",
    "أظهر العيادات الطبية بدون نظام حجز أونلاين بجدة",
    "رتب أفضل العملاء المستهدفين حسب التقييم العام",
    "ملخص الشريحة الأعلى استهدافاً اليوم",
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim()) return;

    const userMsg = { sender: "user" as const, text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsProcessing(true);

    try {
      // Analyze query locally for filter intent or pass to Gemini AI
      let matchedCompanies: LeadCompany[] = [];
      const lowerQ = q.toLowerCase();

      if (lowerQ.includes("هندس") || lowerQ.includes("الرياض")) {
        matchedCompanies = companies.filter((c) => c.industry.includes("Engineering") || c.city === "Riyadh");
      } else if (lowerQ.includes("حجز") || lowerQ.includes("عياد") || lowerQ.includes("جدة")) {
        matchedCompanies = companies.filter((c) => c.webAudit?.hasOnlineBooking === false || c.city === "Jeddah");
      } else {
        matchedCompanies = companies.slice(0, 3);
      }

      const aiResponseText = await processBusinessCommand(
        `أنت مساعد مبيعات لقيادة منصة مدرج. إجابة استفسار المستخدم: "${q}". عدد النتائج المطابقة: ${matchedCompanies.length}. أعطِ تلخيصاً تنفيذياً ممتازاً باللغة العربية.`
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiResponseText.text || aiResponseText.summary || `بناءً على طلبك، تم حصر ${matchedCompanies.length} شركات مطابقة للشروط.`,
          data: matchedCompanies,
        },
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "تم تحليل استفسارك وعرض أفضل النتائج المطابقة أدناه.",
          data: companies.slice(0, 2),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-5 dir-rtl flex flex-col h-[650px]">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
              المساعد الذكي للعملاء المستهدفين (LeadCopilot AI)
            </h2>
            <p className="text-xs text-zinc-400">استكشاف، وتصنيف، وتوليد نصوص الاستهداف بالأوامر الصوتية أو النصية</p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors whitespace-nowrap cursor-pointer shrink-0"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 pl-1">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                m.sender === "user"
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              }`}
            >
              {m.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-3 max-w-xl">
              <div
                className={`p-4 rounded-2xl text-xs font-bold leading-relaxed ${
                  m.sender === "user"
                    ? "bg-emerald-500 text-black font-black"
                    : "bg-zinc-50 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {m.text}
              </div>

              {/* Data Cards inline if returned by AI query */}
              {m.data && m.data.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {m.data.map((comp) => (
                    <div
                      key={comp.id}
                      onClick={() => onSelectCompany(comp)}
                      className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 rounded-xl cursor-pointer shadow-sm text-xs space-y-1"
                    >
                      <span className="text-[10px] font-black text-emerald-600 uppercase block">{comp.industry}</span>
                      <h4 className="font-black text-zinc-900 dark:text-zinc-100">{comp.nameAr || comp.name}</h4>
                      <p className="text-zinc-400 text-[10px] truncate">{comp.city} • {comp.employeeCount} موظف</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 py-2">
            <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
            <span>LeadCopilot يقوم بتحليل الاستفسار وتوليد النتائج...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="relative pt-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="اكتب استفسارك أو أمر البحث باللغة الطبيعية..."
          className="w-full pr-4 pl-12 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        />
        <button
          onClick={() => handleSend()}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
