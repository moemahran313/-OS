import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import {
  Sparkles,
  CheckCircle,
  TrendingUp,
  MessageSquare,
  Bot,
  Zap,
  Lock,
  Database,
  ArrowLeft,
  ChevronRight,
  Brain,
  Cpu,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductAI() {
  const [budget, setBudget] = useState(8000);
  const [targetProfit, setTargetProfit] = useState(25);
  const [isNegotiating, setIsNegotiating] = useState(false);
  const [negotiationLogs, setNegotiationLogs] = useState<string[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "مختبر أتمتة الأعمال والذكاء الاصطناعي والوكلاء | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "وكلاء ذكاء اصطناعي تفاعليين لإدارة أعمالك والتفاوض الذاتي مع العملاء والموردين باللغة العربية وصياغة ردود المحادثات التلقائية بكفاءة فائقة."
    );
  }, []);

  const startNegotiationSimulation = () => {
    setIsNegotiating(true);
    setNegotiationLogs(["[النظام]: البدء في تحليل عرض العميل المستهدف..."]);

    setTimeout(() => {
      setNegotiationLogs((prev) => [
        ...prev,
        `[الوكيل]: العرض الحالي للعميل هو 7,000 ر.س. الميزانية المحددة: ${budget} ر.س.`,
      ]);
      setTimeout(() => {
        const marginMultiplier = 1 + targetProfit / 100;
        const recommendedCounterOffer = Math.round(budget * marginMultiplier);

        setNegotiationLogs((prev) => [
          ...prev,
          `[الوكيل]: حساب التكلفة التشغيلية مع تحديد هامش ربح مستهدف ٪${targetProfit}.`,
          `[الوكيل]: تقديم عرض مقابل مقترح بقيمة ${recommendedCounterOffer.toLocaleString()} ر.س مع صياغة مبررات فنية باللغة العربية.`,
        ]);

        setTimeout(() => {
          setNegotiationLogs((prev) => [
            ...prev,
            "✓ [الوكيل]: تم إرسال العرض وتبريره تلقائياً عبر البريد الإلكتروني وواتساب.",
          ]);
          setIsNegotiating(false);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden public-dark-page"
      dir="rtl"
    >
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-cyan-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md mb-8"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-200">
              مختبر أتمتة الأعمال والذكاء الاصطناعي (AI Lab)
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            وكلاء ذكاء اصطناعي. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-cyan-400 to-blue-300">
              يتفاوضون ويديرون عملك بالكامل.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            أول وكيل ذكي للشركات الخليجية يفهم عقود المقاولة، يتفاوض مع الموردين بناءً على ميزانياتك
            المستهدفة، يصيغ الردود التلقائية لرسائل واتساب، وينجز الإجراءات من شاشة واحدة بذكاء
            كامل.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link
              to="/app/smart-negotiations"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              ادخل لوحة التفاوض الذكي
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              عرض تفاعلي مباشر
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE AI NEGOTIATION SIMULATOR --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              محاكي وكيل التفاوض الذكي بالذكاء الاصطناعي
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              اضبط محاذاة أهداف المبيعات والميزانية، ودع وكيل مدارج الذكي يقوم بالصياغة وعرض الأرقام
              تلقائياً.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Variables Config */}
            <div className="bg-zinc-950/80 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-500" />
                  إعدادات وكيل مدارج الذاتي
                </span>
                <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-lg font-bold">
                  تفاعلي بالكامل
                </span>
              </div>

              <div className="space-y-5 text-xs font-bold">
                <div>
                  <label className="block text-zinc-400 mb-2 uppercase tracking-wide">
                    الميزانية المقترحة للمشروع / العرض (ر.س)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="5000"
                      max="100000"
                      step="5000"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-white text-sm font-black shrink-0 w-24 text-left">
                      {budget.toLocaleString()} ر.س
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-2 uppercase tracking-wide">
                    نسبة هامش الربح المستهدف (٪)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={targetProfit}
                      onChange={(e) => setTargetProfit(Number(e.target.value))}
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <span className="text-white text-sm font-black shrink-0 w-24 text-left">
                      ٪{targetProfit}
                    </span>
                  </div>
                </div>

                <button
                  onClick={startNegotiationSimulation}
                  disabled={isNegotiating}
                  className="w-full py-4 bg-cyan-500 text-zinc-950 font-black rounded-2xl hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-55"
                >
                  <Bot className="w-5 h-5" />
                  <span>تفعيل وكيل التفاوض التلقائي للمبيعات</span>
                </button>
              </div>
            </div>

            {/* Right Column - Logs terminal */}
            <div className="space-y-6">
              <div className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-6 min-h-[280px] font-mono text-xs text-zinc-300 leading-relaxed shadow-inner flex flex-col justify-between">
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                  {negotiationLogs.length === 0 && (
                    <p className="text-zinc-500 text-center py-16 font-bold font-sans">
                      اضغط على الزر لتفعيل محاكاة وكيل الذكاء الاصطناعي ومشاهدة الأتمتة لحظياً...
                    </p>
                  )}
                  {negotiationLogs.map((log, idx) => (
                    <motion.p
                      key={idx}
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={cn(
                        log.startsWith("✓") ? "text-emerald-400 font-bold" : "",
                        log.includes("[النظام]") ? "text-zinc-500" : ""
                      )}
                    >
                      {log}
                    </motion.p>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5 text-[10px] text-zinc-500 font-bold flex justify-between">
                  <span>مزود بـ Google Gemini Flash v3.5</span>
                  <span>معالجة آمنة ومحلية بالكامل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- CORE AI CAPABILITIES SECTION --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              أتمتة فائقة السرعة بامتثال كامل
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              تكاملات آمنة تحمي بيانات شركتك وسجل معاملاتك المالية بالكامل.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 w-fit mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                فهم عميق للهجة الخليجية المحلية
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                تم صياغة وكلاء مدارج ليتفهموا تماماً اللهجة السعودية وأسلوب التفاوض الخليجي، مع
                مراعاة المصطلحات القانونية والإدارية المحلية الخاصة بسجلات قوى والتجارة والبلديات.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                أمان تام وحماية للسرية والمستندات
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                لا نستخدم بياناتك المالية أو وثائق عملائك لتدريب نماذج الذكاء الاصطناعي العامة.
                خصوصيتك هي الأولوية القصوى ونلتزم بأعلى معايير الهيئة الوطنية للأمن السيبراني.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 w-fit mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">محرك محاكاة وسير عمليات مرن</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                أنشئ تدفقات أتمتة معقدة بضغطة زر: "إذا استلمت بريداً بطلب تسعير، قم بصياغة عرض
                مبيعات CRM مؤقت، وتوليد مسودة عقد NDA جاهزة، وأرسل رسالة واتساب للعميل".
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- REUSABLE BIG FINAL CTA --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-gradient-to-t from-primary/10 via-transparent to-transparent relative border-t border-white/5"
      >
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            انقل كفاءة عمليات منشأتك إلى المستقبل الآن.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            وفّر الجهد، ضاعف المبيعات، ومكن موظفيك من التركيز على القيادة والإبداع الحقيقي مع أتمتة
            مدارج الذكية.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              ابدأ الأتمتة مجاناً
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              اطلب عرض تفصيلي للأتمتة
            </Link>
          </div>
        </div>
      </motion.section>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium text-sm"
        dir="rtl"
      >
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
