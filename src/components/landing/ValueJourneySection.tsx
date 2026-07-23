import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Database,
  FileCheck2,
  FileText,
  Layers,
  Lock,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Building2,
  Check,
} from "lucide-react";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const ValueJourneySection: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const journeySteps = [
    {
      id: "problem",
      stepNumber: "01",
      badge: "الواقع المأزوم",
      badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      title: "مأزق الشتات والاشتراكات المرتفعة",
      subtitle: "حالة المشكلة: فوضى البرامج المتعددة ومخاطر الامتثال",
      description:
        "تعاني المنشآت السعودية المتوسطة والصغيرة من استخدام 5 برامج مبعثرة على الأقل (برنامج محاسبة، نظام CRM، برنامج رواتب، نماذج أكسيل، ومحادثات واتساب) بأسعار تصل إلى 18,000 ريال سنوياً مع مخاطر غرامات هيئة الزكاة (ZATCA) ونظام مدد.",
      painPoints: [
        "إدخال البيانات يدوياً مرتين مما يتسبب في أخطاء إملائية وضريبية",
        "تأخير ملفات SIF لحماية الأجور وتعرض السجل التجاري للإيقاف",
        "فقدان طلبات العملاء وتشتت العروض في محادثات واتساب شخصية",
        "تكاليف اشتراك باهظة بدون أي ربط متكامل بين الأقسام",
      ],
      visualIcon: ShieldAlert,
      visualAccent: "from-rose-500/20 via-rose-950/40 to-zinc-950",
      metricHighlight: {
        number: "5+",
        label: "برامج مبعثرة ترهق كاهل شركتك",
        color: "text-rose-400",
      },
    },
    {
      id: "transition",
      stepNumber: "02",
      badge: "التحول الأوتوماتيكي",
      badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      title: "الربط الفوري بالسجل التجاري والهيئات",
      subtitle: "مرحلة الانتقال: تهيئة مدارج OS في 60 ثانية",
      description:
        "بمجرد إدخال رقم السجل التجاري (CR)، يقوم مدارج OS تلقائياً بالربط مع العنوان الوطني (SPL)، توثيق شهادة الفوترة الإلكترونية ZATCA Phase 2، واستيراد بيانات الموظفين لإعداد مسير الرواتب المعتمد لـ مدد.",
      painPoints: [
        "استيراد العناوين الوطنية الرسمية بضغطة زر واحدة",
        "توليد الأختام الرقمية والمفاتيح التشفيرية لفواتير ZATCA تلقائياً",
        "مزامنة قاعدة بيانات العملاء والمنتجات بدون فقدان أي سجل سابق",
        "تفعيل الذكاء الاصطناعي السيادي لتحليل العقود والمبيعات",
      ],
      visualIcon: Cpu,
      visualAccent: "from-amber-500/20 via-amber-950/40 to-zinc-950",
      metricHighlight: {
        number: "60 ثانية",
        label: "زمن الربط الكامل والتشغيل الفعلي",
        color: "text-amber-400",
      },
    },
    {
      id: "solution",
      stepNumber: "03",
      badge: "السيادة التشغيلية",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      title: "منظومة موحدة توفر 80% وتضاعف الأرباح",
      subtitle: "حالة الحل النهائي: مدارج OS نظام التشغيل المتكامل",
      description:
        "شاشة مركزية موحدة تضم الفوترة الضريبية، الرواتب، CRM، المخزون والعقود بذكاء اصطناعي سيادي محلي يحميك من الغرامات ويعزز سرعة إغلاق الصفقات.",
      painPoints: [
        "إصدار فواتير ZATCA المرحلة الثانية مشفرة ومقترنة بـ QR Code في 3 ثوانٍ",
        "مسير رواتب دقيق مع ملفات SIF متوافقة 100% مع نظام مدد",
        "مستشار قانوني ومالي ذكي يحلل العقود ويصيغ المقترحات فورياً",
        "توفير يتجاوز 80% مقارنة بالحلول الغربية غير المطابقة للأنظمة السعودية",
      ],
      visualIcon: ShieldCheck,
      visualAccent: "from-emerald-500/20 via-emerald-950/40 to-zinc-950",
      metricHighlight: {
        number: "80%+",
        label: "توفير في تكاليف البرمجيات سنوياً",
        color: "text-emerald-400",
      },
    },
  ];

  const currentStep = journeySteps[activeStep];

  return (
    <section className="py-28 bg-zinc-950 text-white relative overflow-hidden border-t border-white/5" dir="rtl">
      {/* Background Lighting Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مسار القيمة والتحول الرقمي للشركات السعودية</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white mb-4">
            رحلة التحول من <span className="text-rose-400 line-through underline-offset-4">شتات البرامج</span> إلى{" "}
            <span className="text-emerald-400">السيادة التشغيلية الكاملة</span>
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg font-medium leading-relaxed">
            تعرف على كيفية انتقال منشأتك بـ 3 خطوات واضحة من حالة المخاطر والتشتت إلى منظومة سحابية سعودية موحدة.
          </p>
        </div>

        {/* Interactive Step Navigator Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {journeySteps.map((step, index) => {
            const isActive = activeStep === index;
            return (
              <button
                key={step.id}
                onClick={() => {
                  setActiveStep(index);
                  trackLandingEvent(`رحلة القيمة - خطوة ${step.stepNumber}`, "VALUE_JOURNEY_TAB");
                }}
                className={`p-5 rounded-2xl border text-right transition-all duration-300 relative cursor-pointer group flex flex-col justify-between ${
                  isActive
                    ? "bg-zinc-900 border-emerald-500/50 shadow-[0_10px_30px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                    : "bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/70"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${step.badgeColor}`}>
                    الخطوة {step.stepNumber}: {step.badge}
                  </span>
                  {isActive && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </div>
                <h3 className={`text-base font-black transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"}`}>
                  {step.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Main Display Canvas for Active Step */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className={`rounded-3xl border border-white/10 bg-gradient-to-b ${currentStep.visualAccent} p-6 sm:p-10 shadow-2xl relative overflow-hidden`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column: Details & Bullet points */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-block">
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full border ${currentStep.badgeColor}`}>
                    {currentStep.subtitle}
                  </span>
                </div>

                <h3 className="text-2xl sm:text-4xl font-black text-white leading-snug">
                  {currentStep.title}
                </h3>

                <p className="text-zinc-300 text-sm sm:text-base font-medium leading-relaxed">
                  {currentStep.description}
                </p>

                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    {activeStep === 0 ? "المعاناة والآثار السلبية:" : activeStep === 1 ? "إجراءات الأتمتة المباشرة:" : "المكاسب والسيادة المحققة:"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentStep.painPoints.map((point, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 bg-zinc-950/60 p-3.5 rounded-xl border border-white/5">
                        {activeStep === 0 ? (
                          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        ) : activeStep === 1 ? (
                          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <span className="text-xs text-zinc-200 font-medium leading-relaxed">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Action Buttons directly linking to Demo and Login */}
                <div className="pt-6 flex flex-wrap items-center gap-4 border-t border-white/10">
                  <Link
                    to="/demo"
                    onClick={() => trackLandingEvent("رحلة القيمة - تجربة العرض المباشر (Demo)", "DEMO_PLAYBACK")}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black text-sm rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>جرب المنصة مباشرة بدون تسجيل (Interactive Demo)</span>
                  </Link>

                  <Link
                    to="/app"
                    onClick={() => trackLandingEvent("رحلة القيمة - الدخول للنظام (App)", "CTA_START_FREE")}
                    className="inline-flex items-center gap-2 px-5 py-3.5 bg-white/10 border border-white/15 text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-all"
                  >
                    <span>ابدأ مجاناً الآن</span>
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Visual Highlight Box */}
              <div className="lg:col-span-5 flex flex-col justify-center items-center">
                <div className="w-full bg-zinc-950/80 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden backdrop-blur-md shadow-inner">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-white shadow-md">
                    <currentStep.visualIcon className={`w-8 h-8 ${activeStep === 0 ? "text-rose-400" : activeStep === 1 ? "text-amber-400" : "text-emerald-400"}`} />
                  </div>

                  <span className={`text-5xl sm:text-6xl font-black block tracking-tight mb-2 ${currentStep.metricHighlight.color}`}>
                    {currentStep.metricHighlight.number}
                  </span>

                  <p className="text-zinc-300 text-sm font-bold max-w-xs mx-auto leading-relaxed">
                    {currentStep.metricHighlight.label}
                  </p>

                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-around text-xs text-zinc-400 font-bold">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ZATCA Phase 2
                    </span>
                    <span className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> WPS / Mudad
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ValueJourneySection;
