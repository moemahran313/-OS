import React, { useRef, useEffect, useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  FileText,
  PieChart,
  Users,
  Zap,
  Shield,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Bot,
  Play,
  Globe,
  Activity,
  Trash2,
  X,
  Target,
  BarChart2,
} from "lucide-react";
import { Logo } from "@/src/components/Logo";
import Navbar from "@/src/components/Navbar";
import {
  trackLandingEvent,
  getLandingEvents,
  clearLandingEvents,
  LandingTrackEvent,
} from "@/src/services/landingTracker";
import { useSettings } from "@/src/contexts/SettingsContext";

// --- Lazy loaded heavier sections to improve GCC load times ---
import FlowTransformation from "../components/landing/FlowTransformation";
const ProblemSection = lazy(() => import("../components/landing/ProblemSection"));
const FeatureShowcase = lazy(() => import("../components/landing/FeatureShowcase"));
const SocialProofSection = lazy(() => import("../components/landing/SocialProofSection"));
const PricingSection = lazy(() => import("../components/landing/PricingSection"));
const FinalCTA = lazy(() => import("../components/landing/FinalCTA"));

// Ogilvy-Grade High Value Landing Sections
const RoiCalculatorSection = lazy(() => import("../components/landing/RoiCalculatorSection"));
const ModulePlaygroundSection = lazy(() => import("../components/landing/ModulePlaygroundSection"));
const ComparisonMatrixSection = lazy(() => import("../components/landing/ComparisonMatrixSection"));
const SaudiComplianceProofSection = lazy(() => import("../components/landing/SaudiComplianceProofSection"));
const OgilvyCaseStudiesSection = lazy(() => import("../components/landing/OgilvyCaseStudiesSection"));
const FaqSection = lazy(() => import("../components/landing/FaqSection"));

// --- Elegant shimmer skeleton for GCC network speeds ---
const SectionLoaderSkeleton = () => (
  <div className="py-24 bg-zinc-950/30 flex flex-col items-center justify-center min-h-[350px] animate-pulse">
    <Activity className="w-8 h-8 text-primary/40 animate-spin mb-4" />
    <div className="h-6 w-48 bg-zinc-800 rounded-full mb-3" />
    <div className="h-4 w-32 bg-zinc-800/60 rounded-full" />
  </div>
);

// --- HERO SECTION ---
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // 3D Parallax Effect
  const [mouseX, setMouseX] = React.useState(0);
  const [mouseY, setMouseY] = React.useState(0);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    setMouseX((e.clientX - cx) / width);
    setMouseY((e.clientY - cy) / height);
  };

  const rx = useSpring(
    useTransform(() => mouseY * -20),
    { stiffness: 150, damping: 20 }
  );
  const ry = useSpring(
    useTransform(() => mouseX * 20),
    { stiffness: 150, damping: 20 }
  );
  const translateZ = useSpring(
    useTransform(() => Math.abs(mouseX) * -50),
    { stiffness: 150, damping: 20 }
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-zinc-950 text-white selection:bg-primary/30 text-center perspective-[2000px]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background Ambience */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full pointer-events-none animate-pulse"
          style={{
            animationDuration: "8s",
            background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)"
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[300px] rounded-full pointer-events-none animate-pulse"
          style={{
            animationDuration: "10s",
            background: "radial-gradient(circle at center, rgba(52, 211, 153, 0.08) 0%, transparent 70%)"
          }}
        />
      </motion.div>

      <div className="z-10 container mx-auto px-6 pt-32 pb-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md mb-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent animate-pulse" />
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
          <span className="text-sm font-extrabold text-zinc-300 tracking-wide">
            {isAr
              ? "أتمتة كاملة لشركتك بالذكاء الاصطناعي السيادي"
              : "Complete enterprise automation with sovereign AI"}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl md:text-8xl font-black tracking-tight mb-8 mt-4 leading-[1.12] max-w-5xl"
        >
          {isAr ? (
            <>
              نظام التشغيل السعودي الوحيد <br />
              <span className="text-emerald-400 supports-[background-clip:text]:text-transparent supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:bg-gradient-to-l supports-[background-clip:text]:from-white supports-[background-clip:text]:via-emerald-400 supports-[background-clip:text]:to-teal-300">
                الذي يلغي 80% من مصاريف برامجك الإدارية.
              </span>
            </>
          ) : (
            <>
              The Only Sovereign Saudi BizOS <br />
              <span className="text-emerald-400 supports-[background-clip:text]:text-transparent supports-[background-clip:text]:bg-clip-text supports-[background-clip:text]:bg-gradient-to-r supports-[background-clip:text]:from-white supports-[background-clip:text]:via-emerald-400 supports-[background-clip:text]:to-teal-300">
                That Eliminates 80% of Admin Software Costs.
              </span>
            </>
          )}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-zinc-300 font-medium max-w-4xl mb-12 leading-relaxed"
        >
          {isAr ? (
            <>
              من الفوترة الإلكترونية المعتمدة من هيئة الزكاة (ZATCA Phase 2) وملفات مسير الرواتب المعتمدة لـ &apos;مدد&apos;، إلى التحقق اللحظي من العنوان الوطني والتذكيرات التلقائية عبر الواتساب —{" "}
              <span className="text-emerald-400 font-extrabold">كل ما تحتاجه لإدارة شركتك في منصة سيادية واحدة مدمجة ومجانية 100%.</span>
            </>
          ) : (
            <>
              From ZATCA Phase 2 e-invoicing and WPS Mudad payroll SIF files, to live SPL National Address lookups and WhatsApp reminders —{" "}
              <span className="text-emerald-400 font-extrabold">all integrated into one sovereign platform, 100% free to start.</span>
            </>
          )}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-6 items-center mb-16"
        >
          <Link
            to="/app"
            onClick={() => trackLandingEvent("ابدأ مجاناً الآن (البطل الرئيسي)", "CTA_START_FREE")}
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black rounded-full text-lg shadow-[0_10px_35px_rgba(16,185,129,0.3)] hover:shadow-[0_15px_45px_rgba(16,185,129,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 outline-none"
          >
            <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] uppercase font-black tracking-widest py-1 px-3 rounded-full shadow-lg -rotate-12 animate-bounce">
              {isAr ? "خيار الخبراء" : "Expert Choice"}
            </div>
            <span>{isAr ? "ابدأ مجاناً الآن" : "Start Free Now"}</span>
            {isAr ? (
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            )}
          </Link>
          <button
            onClick={() =>
              trackLandingEvent("شاهد كيف ينمو عملك (الفيديو التعريفي)", "DEMO_PLAYBACK")
            }
            className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-full text-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 outline-none focus:ring-4 focus:ring-white/10 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Play className="w-5 h-5 z-10" fill="currentColor" />
            <span className="z-10">
              {isAr ? "شاهد كيف ينمو عملك" : "Watch how your business grows"}
            </span>
          </button>
        </motion.div>

        {/* Free Integrations Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-5xl"
        >
          <p className="text-sm font-black text-zinc-500 mb-8 uppercase tracking-widest text-center">
            يربط كل هذه المنصات مجاناً للأبد
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14">
            <img
              src="https://upload.wikimedia.org/wikipedia/ar/b/be/%D8%B4%D8%B9%D8%A7%D8%B1_%D9%87%D9%8A%D8%A6%D8%A9_%D8%A7%D9%84%D8%B2%D9%83%D8%A7%D8%A9_%D9%88%D8%A7%D9%84%D8%B6%D8%B1%D9%8A%D8%A8%D8%A9_%D9%88%D8%A7%D9%84%D8%AC%D9%85%D8%A7%D8%B1%D9%83.svg"
              alt="ZATCA"
              onClick={() =>
                trackLandingEvent(
                  "شعار هيئة الزكاة والضريبة والجمارك (ZATCA)",
                  "PARTNER_INTEGRATION"
                )
              }
              className="h-10 md:h-12 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="هيئة الزكاة والضريبة والجمارك"
              referrerPolicy="no-referrer"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              onClick={() =>
                trackLandingEvent("شعار واتساب للأعمال (WhatsApp API)", "PARTNER_INTEGRATION")
              }
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="WhatsApp Cloud API"
            />
            <img
              src="https://cdn.salla.network/images/logo/logo.svg"
              alt="Salla"
              onClick={() =>
                trackLandingEvent("شعار منصة سلة (Salla Integration)", "PARTNER_INTEGRATION")
              }
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="سلة"
            />
            <img
              src="https://zid.sa/wp-content/uploads/2021/04/cropped-Zid-Favicon-192x192.png"
              alt="Zid"
              onClick={() =>
                trackLandingEvent("شعار منصة زد (Zid Integration)", "PARTNER_INTEGRATION")
              }
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="زد"
              referrerPolicy="no-referrer"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
              alt="Slack"
              onClick={() =>
                trackLandingEvent("شعار سلاك للاتصال المؤسسي (Slack Link)", "PARTNER_INTEGRATION")
              }
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="Slack"
            />
            <img
              src="https://cdn.worldvectorlogo.com/logos/zapier-2.svg"
              alt="Zapier"
              onClick={() =>
                trackLandingEvent("شعار منصة زابيير للأتمتة (Zapier Hub)", "PARTNER_INTEGRATION")
              }
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="Zapier"
            />
          </div>
        </motion.div>

        {/* Abstract Floating UI Hero Element */}
        <motion.div
          initial={{ opacity: 0, y: 150, rotateX: 45 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.5, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            rotateX: rx,
            rotateY: ry,
            translateZ: translateZ,
            transformStyle: "preserve-3d",
          }}
          className="w-full max-w-6xl mt-24 relative"
        >
          {/* 3D layers */}
          <motion.div
            style={{
              translateZ: -50,
              background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.18) 0%, transparent 75%)"
            }}
            className="absolute inset-[-8rem] rounded-full"
          />
          <motion.div
            style={{ translateZ: 20 }}
            className="relative rounded-[2rem] border border-white/10 bg-zinc-950/50 backdrop-blur-3xl shadow-2xl overflow-hidden ring-1 ring-white/5"
          >
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {/* Dashboard Preview Visual */}
            <div className="px-5 py-4 bg-zinc-900/80 border-b border-white/5 flex gap-3 items-center backdrop-blur-md relative z-20">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="w-96 h-8 bg-black/40 rounded-lg border border-white/10 flex items-center px-4 gap-2 shadow-inner hover:bg-black/60 transition-colors">
                  <Globe className="w-3 h-3 text-zinc-500" />
                  <span className="text-[11px] text-zinc-400 font-mono tracking-widest uppercase mt-0.5">
                    app.mudarij.com
                  </span>
                </div>
              </div>
              <div className="w-16" /> {/* spacer to center the address bar */}
            </div>

            <div className="h-[450px] flex relative z-10 bg-zinc-950/40">
              {/* Sidebar */}
              <div className="w-64 bg-zinc-50 border-l border-zinc-200 p-6 flex flex-col justify-between relative z-10">
                <div className="space-y-8">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Logo isLink={false} iconClassName="w-12 h-12" textClassName="text-3xl" />
                    <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black ring-1 ring-emerald-500/20">
                      Premium
                    </span>
                  </div>
                  <div className="space-y-1 block">
                    {[
                      { icon: PieChart, label: "نظرة عامة", active: true },
                      { icon: Users, label: "العملاء (CRM)", active: false },
                      { icon: FileText, label: "الفواتير الضريبية", active: false },
                      { icon: MessageSquare, label: "مركز واتساب", active: false },
                      { icon: Shield, label: "الامتثال", active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:bg-zinc-50 transition-colors shadow-sm">
                  <div className="w-9 h-9 rounded-xl bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                    <Users className="w-4 h-4 text-zinc-400" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-zinc-900 text-xs font-bold">Admin</span>
                    <span className="text-zinc-500 text-[10px] font-medium">شركة ألفا</span>
                  </div>
                </div>
              </div>

              {/* Main UI */}
              <div className="flex-1 p-8 grid grid-cols-3 gap-6 relative overflow-hidden bg-zinc-50">
                {/* Revenue Card Element (Chart shape) */}
                <div className="col-span-2 bg-white rounded-3xl border border-zinc-100 p-8 flex flex-col relative shadow-sm">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-zinc-900 font-bold text-lg">منحنى المبيعات</h3>
                      <p className="text-zinc-500 text-xs mt-1 font-medium">
                        أداء المبيعات لآخر 6 أشهر
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold tracking-widest uppercase">Live</span>
                    </div>
                  </div>

                  <div className="flex-1 flex items-end pt-4 relative z-10 w-full mb-2 border-b border-zinc-100">
                    <svg
                      className="w-full h-[150px]"
                      preserveAspectRatio="none"
                      viewBox="0 0 100 100"
                    >
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,100 L0,50 C20,40 40,80 60,30 C80,10 90,40 100,20 L100,100 Z"
                        fill="url(#chartGradient)"
                      />
                      <path
                        d="M0,50 C20,40 40,80 60,30 C80,10 90,40 100,20"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  <div className="flex justify-between mt-2 text-[10px] text-zinc-400 font-medium px-2">
                    <span>يناير</span>
                    <span>فبراير</span>
                    <span>مارس</span>
                    <span>أبريل</span>
                    <span>مايو</span>
                    <span>يونيو</span>
                  </div>
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                  {/* Activity Feed */}
                  <div className="flex-1 bg-white rounded-3xl border border-zinc-100 p-6 flex flex-col relative shadow-sm">
                    <h3 className="font-bold text-lg mb-6">النشاط الأخير</h3>

                    <div className="space-y-4">
                      {[
                        {
                          action: "فاتورة لشركة ألفا",
                          module: "INVOICE",
                          time: "10:30 م",
                          color: "text-emerald-500",
                          bg: "bg-emerald-50",
                          border: "border-emerald-100",
                          icon: FileText,
                        },
                        {
                          action: "تسجيل عميل جديد",
                          module: "CRM",
                          time: "09:15 ص",
                          color: "text-blue-500",
                          bg: "bg-blue-50",
                          border: "border-blue-100",
                          icon: Users,
                        },
                      ].map((log, i) => (
                        <div
                          key={i}
                          className="flex gap-4 items-start pb-4 border-b border-zinc-50 last:border-0 last:pb-0"
                        >
                          <div
                            className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border ${log.bg} ${log.color} ${log.border}`}
                          >
                            <log.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{log.action}</p>
                            <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                              {log.time} • مسؤول النظام
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Real-time interaction tracker overlay widget for live feedback ---
const InteractiveTrackingWidget = () => {
  const [events, setEvents] = useState<LandingTrackEvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useSettings();
  const isAr = settings.language === "ar";

  useEffect(() => {
    setEvents(getLandingEvents());

    const handleUpdate = () => {
      setEvents(getLandingEvents());
    };

    window.addEventListener("mudarij_tracking_update", handleUpdate);
    return () => {
      window.removeEventListener("mudarij_tracking_update", handleUpdate);
    };
  }, []);

  return (
    <>
      {/* Small floating pulse button on bottom-left */}
      <div
        className="fixed bottom-6 left-6 z-[9990] flex items-center gap-2"
        dir={isAr ? "rtl" : "ltr"}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800 rounded-full px-5 py-3 shadow-2xl flex items-center gap-2 font-bold text-xs ring-2 ring-primary/40 relative overflow-hidden"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <Target className="w-4 h-4 text-primary" />
          <span>
            {isAr
              ? `مرصد التحويلات الفوري (${events.length})`
              : `Live Conversion Monitor (${events.length})`}
          </span>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
            className="fixed bottom-20 left-6 z-[9991] w-80 max-w-sm bg-zinc-950/95 border border-zinc-800/80 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] text-white"
            dir={isAr ? "rtl" : "ltr"}
          >
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <BarChart2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight text-zinc-100">
                    {isAr ? "تحليلات السلوك المباشر" : "Live Behavior Analytics"}
                  </h4>
                  <p className="text-[10px] text-emerald-400 font-bold">20% High-Intent Drivers</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of actions */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-8 h-8 text-zinc-700 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs text-zinc-500 font-medium">
                    {isAr
                      ? "قم بالنقر فوق الأزرار أو الشعارات لتتبع الحدث الفوري"
                      : "Click on buttons or badges to track conversion drivers"}
                  </p>
                </div>
              ) : (
                events.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors flex items-start gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5 animate-pulse" />
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-200 truncate">{evt.eventName}</p>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="font-semibold bg-white/5 px-2 py-0.5 rounded-full text-zinc-400">
                          {evt.category}
                        </span>
                        <span>
                          {new Date(evt.timestamp).toLocaleTimeString(isAr ? "ar-SA" : "en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {events.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                <button
                  onClick={() => {
                    clearLandingEvents();
                  }}
                  className="flex-1 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {isAr ? "مسح السجل" : "Clear Log"}
                </button>
                <Link
                  to="/app"
                  className="flex-1 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all"
                >
                  {isAr ? "لوحة التحكم العامة" : "Dashboard"}
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (cursorRef.current && cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;

        cursorRef.current.animate(
          {
            transform: `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`,
          },
          {
            duration: 300,
            fill: "forwards",
            easing: "ease-out",
          }
        );
      }
    };

    const handleMouseDown = () => {
      if (cursorRef.current) cursorRef.current.style.transform += " scale(0.8)";
    };

    const handleMouseUp = () => {
      if (cursorRef.current)
        cursorRef.current.style.transform = cursorRef.current.style.transform.replace(
          " scale(0.8)",
          ""
        );
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 border border-white/50 rounded-full pointer-events-none z-[9999] hidden md:block mix-blend-difference"
      />
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2 h-2 -ml-1 -mt-1 bg-white rounded-full pointer-events-none z-[10000] hidden md:block mix-blend-difference"
      />
    </>
  );
};

export default function LandingPage() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);

    // Inject Google Schema.org SoftwareApplication & Organization JSON-LD for Search Engine Optimization
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "Mudarij BizOS",
          "operatingSystem": "Web, Cloud, Windows, macOS, iOS, Android",
          "applicationCategory": "BusinessApplication, AccountingApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "SAR"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "1280"
          },
          "description": "نظام التشغيل الرقمي الموحد للمنشآت السعودية والخليجية. يجمع الفوترة الضريبية ZATCA Phase 2، مسير الرواتب المعتمد لـ مدد (WPS)، إدارة العملاء CRM، والعناوين الوطنية SPL."
        },
        {
          "@type": "Organization",
          "name": "Mudarij Systems",
          "url": "https://mudarij.sa",
          "logo": "https://mudarij.sa/logo.png",
          "sameAs": [
            "https://twitter.com/mudarij_sa",
            "https://linkedin.com/company/mudarij"
          ]
        }
      ]
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "mudarij-org-schema";
    script.innerHTML = JSON.stringify(schemaData);

    const existing = document.getElementById("mudarij-org-schema");
    if (existing) existing.remove();
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("mudarij-org-schema");
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100 selection:bg-primary/30 scroll-smooth public-dark-page">
      <CustomCursor />
      <Navbar />

      <HeroSection />

      {/* Code-split dynamic sub-sections loaded with Suspense skeleton loader */}
      <Suspense fallback={<SectionLoaderSkeleton />}>
        <SocialProofSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ProblemSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <RoiCalculatorSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ModulePlaygroundSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ComparisonMatrixSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <SaudiComplianceProofSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <OgilvyCaseStudiesSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <FeatureShowcase />
      </Suspense>

      <FlowTransformation />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <PricingSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <FaqSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <FinalCTA />
      </Suspense>

      {/* Floating high-intent real-time tracking widget */}
      <InteractiveTrackingWidget />

      {/* Footer */}
      <footer
        className="bg-zinc-950 pt-20 pb-12 border-t border-white/5"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <Logo theme="dark" />
              <p className="text-zinc-500 font-medium mt-6 leading-relaxed text-sm">
                {isAr
                  ? "نظام تشغيل رقمي موحد يعكس ثقافتنا المحلية ويلبي احتياجاتنا بدقة."
                  : "A unified digital operating system tailored for our local GCC culture and business needs."}
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">{isAr ? "المنتج" : "Product"}</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/product" className="hover:text-primary transition-colors">
                    {isAr ? "الميزات الرئيسية" : "Main Features"}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/invoicing" className="hover:text-primary transition-colors">
                    {isAr ? "نظام الفواتير ZATCA" : "ZATCA Invoicing"}
                  </Link>
                </li>
                <li>
                  <Link to="/demo" className="hover:text-primary transition-colors">
                    {isAr ? "جولة تفاعلية (Demo)" : "Interactive Demo"}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">{isAr ? "الحلول" : "Solutions"}</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    {isAr ? "قطاع التجزئة" : "Retail Sector"}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    {isAr ? "المقاولات والبناء" : "Contracting & Construction"}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    {isAr ? "الاستشارات والوكالات" : "Consultancies & Agencies"}
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    {isAr ? "الخدمات والصيانة" : "Services & Maintenance"}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">{isAr ? "الشركة" : "Company"}</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    {isAr ? "عن مدارج" : "About Mudarij"}
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-primary transition-colors">
                    {isAr ? "الأمان والامتثال" : "Security & Compliance"}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    {isAr ? "تواصل معنا" : "Contact Us"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-zinc-600 text-sm font-medium">
              {isAr
                ? "© 2026 Mudarij OS. صُنع بفخر للشركات الخليجية."
                : "© 2026 Mudarij OS. Proudly crafted for GCC enterprises."}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
