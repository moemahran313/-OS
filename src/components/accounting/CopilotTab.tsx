import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Send,
  Bot,
  HelpCircle,
  ArrowUpRight,
  ShieldCheck,
  HeartPulse,
  ShieldAlert,
} from "lucide-react";

interface CopilotMessage {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  suggestedJournal?: {
    description: string;
    lines: { accountCode: string; name: string; debit: number; credit: number }[];
  };
  healthScoreBreakdown?: {
    overall: number;
    metrics: { name: string; score: number; description: string }[];
  };
}

export default function CopilotTab({
  accounts = [],
  onPostJournal,
}: {
  accounts?: any[];
  onPostJournal?: (journal: any) => void;
}) {
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "m-1",
      sender: "copilot",
      text: "مرحباً بك في مساعدك المالي الذكي (Madarij Accounting AI Copilot). يمكنني مساعدتك في تحليل ميزان المراجعة، واكتشاف الأخطاء المحاسبية في الأستاذ العام، وصياغة قيود المزدوج اليومية التلقائية من لغة طبيعية، وتقديم نصائح فورية لتحسين درجة صحة عملك المالي.",
      timestamp: "12:00 م",
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    const userMsg: CopilotMessage = {
      id: "msg-user-" + Date.now(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText("");
    setIsTyping(true);

    // AI Response Simulation
    setTimeout(() => {
      let responseText = "";
      let suggestedJournal: any = undefined;
      let healthScoreBreakdown: any = undefined;

      const normQuery = query.toLowerCase();

      if (
        normQuery.includes("صحة") ||
        normQuery.includes("health") ||
        normQuery.includes("score")
      ) {
        responseText =
          "بناءً على تتبع وتدقيق أرصدة الأستاذ العام والذمم المدينة والدائنة الحالية، قمت بحساب مؤشر صحة العمل المالي (Business Health Score) لمنشأتكم. النتيجة جيدة جداً بنسبة 86%، ولكن هناك نقاط حرجة تتعلق بعمر بعض فواتير العملاء المتأخرة:";
        healthScoreBreakdown = {
          overall: 86,
          metrics: [
            {
              name: "اتجاه نمو الإيرادات (Revenue growth)",
              score: 92,
              description: "نمو ثابت ومطابق للأهداف السنوية بنسبة ارتفاع +12%.",
            },
            {
              name: "متوسط أعمار ديون العملاء (AR Aging)",
              score: 68,
              description:
                "هناك تراكم للفواتير غير المسددة لأكثر من 90 يوماً مما يضغط على رأس المال العامل.",
            },
            {
              name: "نسبة كفاية السيولة النقدية (Cash Ratio)",
              score: 89,
              description: "توفر ممتاز للنقدية وصندوق الطوارئ لتغطية الالتزامات قصيرة الأجل.",
            },
            {
              name: "معدل تكلفة الاستحواذ (CAC to LTV)",
              score: 95,
              description: "تحسن في كفاءة التسويق والحصول على عملاء ذوي ولاء مرتفع بإنفاق منخفض.",
            },
          ],
        };
      } else if (
        normQuery.includes("قيد") ||
        normQuery.includes("journal") ||
        normQuery.includes("دفعنا") ||
        normQuery.includes("استلمنا")
      ) {
        responseText =
          "قمت بتحليل العملية المالية التي ذكرتها، وصيغت لك القيد المزدوج المتوازن تلقائياً لتسجيله بالأستاذ العام للشركة:";
        suggestedJournal = {
          description: "إثبات مصروف إيجار المكاتب نقداً بموجب إشعار Copilot AI",
          lines: [
            {
              accountCode: "502005",
              name: "حـ/ إيجارات المكاتب والفروع (مدين)",
              debit: 12000,
              credit: 0,
            },
            {
              accountCode: "101001",
              name: "حـ/ صندوق النقدية في الخزينة (دائن)",
              debit: 0,
              credit: 12000,
            },
          ],
        };
      } else if (
        normQuery.includes("أخطاء") ||
        normQuery.includes("anomalies") ||
        normQuery.includes("شذوذ")
      ) {
        responseText =
          "أجريت مراجعة شاملة لدفتر اليومية المساعد لكافة الفروع. لم يتم العثور على أخطاء عدم توازن (الدائن والمدين متطابقان). ومع ذلك، هناك تحذير واحد: تم رصد معاملتين متطابقتين بالقيمة (45,000 ر.س) لصالح عميل واحد خلال فترة 24 ساعة، يرجى مراجعتها لمنع تكرار الفوترة المزدوجة.";
      } else {
        responseText =
          "قمت بفحص طلبك المالي. بصفتي خبيراً محاسبياً قانونياً لـ Madarij ERP، يمكنني مساعدتك بشكل مباشر بالضغط على أحد الإجراءات السريعة في الأسفل لتحليل الأصول، مراجعة الأخطاء المفتوحة، أو توليد قيود اليومية من لغتك مباشرة.";
      }

      const copilotMsg: CopilotMessage = {
        id: "msg-copilot-" + Date.now(),
        sender: "copilot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
        suggestedJournal,
        healthScoreBreakdown,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right">
      {/* AI Chat Area */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm flex flex-col justify-between h-[520px]">
        {/* Header */}
        <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 dark:border-zinc-850">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
            <Bot className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
              المستشار والمساعد المالي المدعوم بالذكاء الاصطناعي
            </h3>
            <p className="text-[9px] text-zinc-400 font-bold">
              بوابة الاستعلام السريع والتدقيق المالي الذاتي اللحظي
            </p>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] text-xs ${msg.sender === "user" ? "mr-auto flex-row-reverse" : "ml-auto"}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-black ${
                  msg.sender === "user"
                    ? "bg-zinc-100 text-zinc-650"
                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                }`}
              >
                {msg.sender === "user" ? "أنا" : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl font-bold space-y-3 ${
                  msg.sender === "user"
                    ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100 rounded-tr-none"
                    : "bg-emerald-50/50 text-zinc-800 dark:bg-emerald-950/10 dark:text-zinc-100 rounded-tl-none border border-emerald-100/40 dark:border-emerald-950/20"
                }`}
              >
                <p className="leading-relaxed">{msg.text}</p>

                {/* Simulated health score cards */}
                {msg.healthScoreBreakdown && (
                  <div className="space-y-3 pt-2 bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850">
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-50 dark:border-zinc-850">
                      <span className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                        النتيجة الإجمالية لصحة الأعمال (Score)
                      </span>
                      <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                        {msg.healthScoreBreakdown.overall}%
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {msg.healthScoreBreakdown.metrics.map((m, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-zinc-700 dark:text-zinc-300">{m.name}</span>
                            <span className="font-mono text-zinc-900 dark:text-zinc-100 font-black">
                              {m.score}%
                            </span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-850 h-1 rounded-full">
                            <div
                              className="bg-emerald-500 h-1 rounded-full"
                              style={{ width: `${m.score}%` }}
                            ></div>
                          </div>
                          <p className="text-[9px] text-zinc-400 leading-normal">{m.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested double entry journal card */}
                {msg.suggestedJournal && (
                  <div className="bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-150 dark:border-zinc-850 space-y-3">
                    <div className="text-[10px] text-zinc-400 font-black uppercase">
                      معاينة القيد المقترح:
                    </div>
                    <p className="text-[10px] font-black text-zinc-800 dark:text-zinc-200">
                      {msg.suggestedJournal.description}
                    </p>
                    <div className="space-y-1.5 border-t border-zinc-100 dark:border-zinc-850 pt-2 text-[10px]">
                      {msg.suggestedJournal.lines.map((l: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center font-bold">
                          <span>
                            {l.accountCode} — {l.name}
                          </span>
                          <span
                            className={`font-mono ${l.debit > 0 ? "text-emerald-600" : "text-rose-600"}`}
                          >
                            {l.debit > 0 ? `مدين: ${l.debit}` : `دائن: ${l.credit}`} ر.س
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        if (onPostJournal && msg.suggestedJournal) {
                          onPostJournal(msg.suggestedJournal);
                          alert(
                            "تم ترحيل القيد المحاسبي المولد بالذكاء الاصطناعي للأستاذ العام بنجاح!"
                          );
                        }
                      }}
                      className="w-full py-2 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-[10px] rounded-lg transition-colors cursor-pointer"
                    >
                      موافقة وترحيل القيد للأستاذ العام مباشرة
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center text-zinc-400 text-[10px] font-bold">
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"></div>
              <div
                className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
              <span>المساعد يفكر ويراجع المدونات والتقارير...</span>
            </div>
          )}
        </div>

        {/* Form Inputs */}
        <div className="border-t border-zinc-100 dark:border-zinc-850 pt-3 flex gap-2">
          <input
            type="text"
            placeholder="اسأل المساعد (مثال: 'احسب مؤشر صحة العمل'، 'دفعنا 12000 ريال إيجار مكاتب')"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs focus:outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            className="p-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Commands Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
            تحليلات وإجراءات تشغيل ذكية مقترحة
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold">
            نقرات تشغيل سريعة لتسريع أعمال الرقابة المالية ومراجعة الدفاتر
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => handleSendMessage("احسب مؤشر صحة العمل المالي وتوصيات تحسينه")}
            className="w-full text-right p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4.5 h-4.5 text-emerald-500" />
              <span>حساب مؤشر صحة العمل وتوصيات التطوير</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            onClick={() => handleSendMessage("أريد مراجعة واكتشاف الأخطاء أو القيود غير المتوازنة")}
            className="w-full text-right p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-500" />
              <span>فحص كشف أخطاء ترحيل الأستاذ المفتوح</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            onClick={() => handleSendMessage("دفعنا مبلغ 12000 ريال نقداً لإيجار مكتب فرع الرياض")}
            className="w-full text-right p-3.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 hover:border-zinc-200 dark:hover:border-zinc-800 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4.5 h-4.5 text-indigo-500" />
              <span>تحويل معاملة (دفعنا إيجار) إلى قيد مزدوج</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 text-[10px] text-zinc-500 leading-relaxed font-bold space-y-1">
          <span className="font-black text-zinc-700 dark:text-zinc-300 block mb-1">
            الامتثال والأمان الضريبي:
          </span>
          <p>
            مساعد الذكاء الاصطناعي معزول تماماً محلياً ويقوم فقط بمراجعة الأرصدة التراكمية، ولا
            يشارك أي قيم سرية خارج الحاوية المالية الخاصة بـ Madarij OS.
          </p>
        </div>
      </div>
    </div>
  );
}
