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
import {
  ZatcaLogo,
  ZidLogo,
  SallaLogo,
  WhatsappLogo,
  StcPayLogo,
  MoyasarLogo,
} from "@/src/components/common/BrandLogos";

// --- Direct imports for reliable landing sections rendering ---
import FlowTransformation from "@/src/components/landing/FlowTransformation";
import ProblemSection from "@/src/components/landing/ProblemSection";
import FeatureShowcase from "@/src/components/landing/FeatureShowcase";
import SocialProofSection from "@/src/components/landing/SocialProofSection";
import PricingSection from "@/src/components/landing/PricingSection";
import FinalCTA from "@/src/components/landing/FinalCTA";

// Ogilvy-Grade High Value Landing Sections
import ValueJourneySection from "@/src/components/landing/ValueJourneySection";
import SeoCopyGenerator from "@/src/components/landing/SeoCopyGenerator";
import RoiCalculatorSection from "@/src/components/landing/RoiCalculatorSection";
import ModulePlaygroundSection from "@/src/components/landing/ModulePlaygroundSection";
import ComparisonMatrixSection from "@/src/components/landing/ComparisonMatrixSection";
import SaudiComplianceProofSection from "@/src/components/landing/SaudiComplianceProofSection";
import OgilvyCaseStudiesSection from "@/src/components/landing/OgilvyCaseStudiesSection";
import FaqSection from "@/src/components/landing/FaqSection";
import CurvedDivider from "@/src/components/landing/CurvedDivider";

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
      {/* Background Ambience & Radial Lighting */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] rounded-full opacity-30 animate-pulse pointer-events-none"
          style={{
            animationDuration: "7s",
            background: "radial-gradient(ellipse at center, rgba(16, 185, 129, 0.25) 0%, rgba(20, 184, 166, 0.1) 45%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        <div
          className="absolute top-1/4 right-1/3 w-[600px] h-[350px] rounded-full opacity-20 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, rgba(52, 211, 153, 0.2) 0%, transparent 65%)",
            filter: "blur(80px)",
          }}
        />
        {/* Subtle Agency Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.12,
              delayChildren: 0.05,
            },
          },
        }}
        className="z-10 container mx-auto px-6 pt-28 pb-20 flex flex-col items-center relative text-center"
      >
        {/* High-Quality Centered Brand Logo Placeholder */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 35, scale: 0.92 },
            visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="relative group cursor-pointer">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 opacity-30 blur-xl group-hover:opacity-60 transition-opacity duration-500 animate-pulse" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-b from-zinc-900 to-black border border-emerald-500/30 text-emerald-400 shadow-2xl backdrop-blur-2xl p-4 group-hover:border-emerald-400/60 transition-all duration-500">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern Abstract M for Mudarij */}
                <path d="M24 75V25L50 51L76 25V75" stroke="url(#logo-grad)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="50" cy="24" r="8" fill="#10B981" />
                <defs>
                  <linearGradient id="logo-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="50%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Badge */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 backdrop-blur-xl mb-8 shadow-[0_0_25px_rgba(16,185,129,0.15)] hover:border-emerald-500/50 hover:bg-emerald-500/15 transition-all duration-300 group cursor-default"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-sm font-black text-emerald-400 tracking-wide">
            {isAr ? "🇸🇦 صُمم للأعمال السعودية" : "🇸🇦 Built for Saudi Businesses"}
          </span>
        </motion.div>

        {/* H1 Headline */}
        <motion.h1
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter mb-6 mt-1 leading-[1.1] max-w-5xl text-center text-white"
        >
          {isAr ? (
            <>
              نظام تشغيل مدارج{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                المتكامل للأعمال
              </span>
            </>
          ) : (
            <>
              Mudarij OS: The Complete{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(16,185,129,0.3)]">
                Saudi Business OS
              </span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="text-lg sm:text-xl md:text-2xl text-zinc-300 font-semibold max-w-3xl mb-12 leading-relaxed tracking-tight text-center"
        >
          {isAr
            ? "الفواتير الإلكترونية، المحاسبة المالية، إدارة الرواتب، وسلاسل الإمداد في منظومة سحابية متكاملة تضمن الامتثال التام للأنظمة السعودية."
            : "Invoicing, accounting, payroll, and supply chain integrated in one cloud OS compliant with Saudi regulations."}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="flex flex-col sm:flex-row gap-5 items-center mb-10"
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.97 }} 
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Link
              to="/app"
              onClick={() => trackLandingEvent("ابدأ مجاناً (البطل الرئيسي)", "CTA_START_FREE")}
              className="group card-premium-hover relative inline-flex items-center justify-center gap-3 px-9 py-4 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 text-zinc-950 font-black rounded-2xl text-base shadow-[0_0_40px_rgba(16,185,129,0.35)] hover:shadow-[0_0_65px_rgba(16,185,129,0.55)] transition-all duration-300 outline-none overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
              <span className="relative z-10">{isAr ? "ابدأ مجاناً" : "Start Free"}</span>
              {isAr ? (
                <ChevronLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1.5 transition-transform" />
              ) : (
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1.5 transition-transform" />
              )}
            </Link>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }} 
            whileTap={{ scale: 0.97 }} 
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <button
              onClick={() =>
                trackLandingEvent("شاهد العرض التوضيحي", "DEMO_PLAYBACK")
              }
              className="card-premium-hover inline-flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 hover:border-emerald-500/40 text-white font-bold rounded-2xl text-base hover:bg-white/10 hover:shadow-[0_0_30px_rgba(255,255,255,0.08)] transition-all duration-300 outline-none group cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400 fill-current group-hover:scale-110 transition-transform" />
              <span>{isAr ? "شاهد العرض التوضيحي" : "Watch Demo"}</span>
            </button>
          </motion.div>
        </motion.div>

        {/* Micro-Trust Indicators under CTA */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="flex flex-wrap justify-center items-center gap-4 text-xs font-extrabold text-zinc-400 mb-12"
        >
          <span className="flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
            <span className="text-emerald-400">✓</span> معتمد ZATCA Phase 2
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
            <span className="text-emerald-400">✓</span> مطابق لنظام حماية الأجور (مدد)
          </span>
          <span className="flex items-center gap-1.5 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/5">
            <span className="text-emerald-400">✓</span> تجربة مجانية بدون بطاقة
          </span>
        </motion.div>

        {/* Official Integrations - Minimal Grayscale Semi-Transparent Row */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 35 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
          }}
          className="w-full max-w-2xl border-t border-white/5 pt-8 mt-4 flex flex-col items-center"
        >
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.25em] mb-6 text-center">
            {isAr ? "شريك ربط رسمي وموثوق" : "Official Integration Partner"}
          </p>
          <div className="flex items-center justify-center gap-16 md:gap-24">
            {/* ZATCA Logo */}
            <div
              onClick={() =>
                trackLandingEvent(
                  "شعار هيئة الزكاة والضريبة والجمارك (ZATCA)",
                  "PARTNER_INTEGRATION"
                )
              }
              className="filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer flex items-center gap-3.5 group"
              title="هيئة الزكاة والضريبة والجمارك"
            >
              <ZatcaLogo className="w-10 h-10 shrink-0 text-zinc-400 group-hover:text-emerald-400 transition-colors" />
              <div className="text-right">
                <div className="text-xs font-black text-zinc-400 group-hover:text-white transition-colors leading-none mb-1">ZATCA</div>
                <div className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors leading-none">
                  {isAr ? "معتمد للمرحلة الثانية" : "Phase 2 Certified"}
                </div>
              </div>
            </div>

            {/* Zid Logo */}
            <div
              onClick={() =>
                trackLandingEvent("شعار منصة زد (Zid Integration)", "PARTNER_INTEGRATION")
              }
              className="filter grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer flex items-center gap-3.5 group"
              title="زد"
            >
              <ZidLogo className="w-10 h-10 shrink-0 text-zinc-400 group-hover:text-purple-400 transition-colors" />
              <div className="text-right">
                <div className="text-xs font-black text-zinc-400 group-hover:text-white transition-colors leading-none mb-1">ZID</div>
                <div className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-400 transition-colors leading-none">
                  {isAr ? "ربط فوري للمتاجر" : "Instant Store Sync"}
                </div>
              </div>
            </div>
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
      </motion.div>
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

    // Update document title & meta tags for Search Engine Optimization (SEO)
    document.title = "أفضل نظام محاسبي سحابي في السعودية | أتمتة الفوترة الإلكترونية المرحلة الثانية | نظام مدارج";

    // Inject Google Schema.org SoftwareApplication & Organization JSON-LD for Search Engine Optimization
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SoftwareApplication",
          "name": "نظام مدارج - أفضل نظام محاسبي سحابي في السعودية",
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
            "ratingCount": "1420"
          },
          "description": "أفضل نظام محاسبي سحابي في السعودية يضمن أتمتة الفوترة الإلكترونية المرحلة الثانية مع هيئة الزكاة (ZATCA)، وإدارة الموارد البشرية والرواتب المعتمدة لمنصة مدد (WPS)، وإدارة علاقات العملاء."
        },
        {
          "@type": "Organization",
          "name": "نظام مدارج المحاسبي",
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

      <CurvedDivider
        direction="dark-to-light"
        topColorClass="bg-zinc-950"
        bottomColorClass="bg-white"
        bottomFillHex="#ffffff"
        glowColor="emerald"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ProblemSection />
      </Suspense>

      <CurvedDivider
        direction="light-to-dark"
        topColorClass="bg-white"
        bottomColorClass="bg-zinc-950"
        bottomFillHex="#09090b"
        glowColor="teal"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ValueJourneySection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <RoiCalculatorSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ModulePlaygroundSection />
      </Suspense>

      <CurvedDivider
        direction="dark-to-light"
        topColorClass="bg-zinc-900"
        bottomColorClass="bg-white"
        bottomFillHex="#ffffff"
        glowColor="blue"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <ComparisonMatrixSection />
      </Suspense>

      <CurvedDivider
        direction="light-to-dark"
        topColorClass="bg-white"
        bottomColorClass="bg-zinc-950"
        bottomFillHex="#09090b"
        glowColor="emerald"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <SaudiComplianceProofSection />
      </Suspense>

      <CurvedDivider
        direction="dark-to-light"
        topColorClass="bg-zinc-950"
        bottomColorClass="bg-white"
        bottomFillHex="#ffffff"
        glowColor="teal"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <OgilvyCaseStudiesSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <FeatureShowcase />
      </Suspense>

      <CurvedDivider
        direction="light-to-dark"
        topColorClass="bg-zinc-50"
        bottomColorClass="bg-zinc-950"
        bottomFillHex="#09090b"
        glowColor="purple"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <SeoCopyGenerator />
      </Suspense>

      <FlowTransformation />

      <CurvedDivider
        direction="dark-to-light"
        topColorClass="bg-zinc-950"
        bottomColorClass="bg-white"
        bottomFillHex="#ffffff"
        glowColor="emerald"
      />

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <PricingSection />
      </Suspense>

      <Suspense fallback={<SectionLoaderSkeleton />}>
        <FaqSection />
      </Suspense>

      <CurvedDivider
        direction="light-to-dark"
        topColorClass="bg-zinc-50"
        bottomColorClass="bg-zinc-950"
        bottomFillHex="#09090b"
        glowColor="teal"
      />

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
