import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  FileText,
  CreditCard,
  PieChart,
  Users,
  Zap,
  Shield,
  ArrowLeft,
  ChevronLeft,
  Sparkles,
  Building2,
  CheckCircle2,
  Bot,
  Play,
  Pause,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Logo } from "@/src/components/Logo";
import Navbar from "@/src/components/Navbar";

// --- HERO SECTION ---
const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
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
      dir="rtl"
    >
      {/* Background Ambience */}
      <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full point-events-none animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full point-events-none animate-pulse"
          style={{ animationDuration: "10s" }}
        />
      </motion.div>

      <div className="z-10 container mx-auto px-6 pt-32 pb-16 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent animate-pulse" />
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold text-zinc-300">
            أتمتة كاملة لشركتك بذكاء الاصطناعي
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-6 mt-4 leading-[1.1] max-w-5xl"
        >
          نظام تشغيل <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-primary to-emerald-400">
            لا يقدر بثمن.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-2xl text-zinc-400 font-medium max-w-3xl mb-12 leading-relaxed"
        >
          كل ما تحتاجه للنمو السريع. CRM، فواتير ZATCA، رواتب مقيم، وتذكيرات واتساب —{" "}
          <span className="text-white font-bold">جميعها مدمجة ومجانية 100%</span> مع باقتك.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 items-center mb-16"
        >
          <Link
            to="/app"
            className="group relative inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-zinc-950 font-black rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all outline-none focus:ring-4 focus:ring-white/20"
          >
            <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] uppercase font-black tracking-widest py-1 px-3 rounded-full shadow-lg -rotate-12 animate-bounce">
              خيار الخبراء
            </div>
            <span>ابدأ مجاناً الآن</span>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/50 shadow-[0_0_40px_rgba(255,255,255,0.4)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Link>
          <button className="inline-flex items-center justify-center gap-3 px-8 py-5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-lg hover:bg-white/10 transition-all outline-none focus:ring-4 focus:ring-white/10 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Play className="w-5 h-5 z-10" fill="currentColor" />
            <span className="z-10">شاهد كيف ينمو عملك</span>
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
              src="data:image/svg+xml;utf8,%3Csvg viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10,2 L15,10 L10,18 L5,10 Z' fill='%231d8c7c'/%3E%3Ctext x='20' y='14' font-family='sans-serif' font-weight='800' font-size='11' fill='%231d8c7c'%3EZATCA%3C/text%3E%3C/svg%3E"
              alt="ZATCA"
              className="h-10 md:h-12 object-contain opacity-40 hover:opacity-100 transition-all duration-500 cursor-pointer"
              title="هيئة الزكاة والضريبة والجمارك"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              alt="WhatsApp"
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="WhatsApp Cloud API"
            />
            <img
              src="https://cdn.salla.network/images/logo/logo.svg"
              alt="Salla"
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="سلة"
            />
            <img
              src="data:image/svg+xml;utf8,%3Csvg viewBox='0 0 60 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10,4 C14,4 16,8 10,12 C4,8 6,4 10,4 Z' fill='%237E57C2'/%3E%3Ctext x='20' y='14' font-family='sans-serif' font-weight='800' font-size='12' fill='%237E57C2'%3Ezid%3C/text%3E%3C/svg%3E"
              alt="Zid"
              className="h-8 md:h-10 object-contain opacity-40 hover:opacity-100 transition-all duration-500 cursor-pointer"
              title="زد"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg"
              alt="Slack"
              className="h-8 md:h-10 object-contain brightness-0 invert opacity-40 hover:opacity-100 hover:brightness-100 hover:invert-0 transition-all duration-500 cursor-pointer"
              title="Slack"
            />
            <img
              src="https://cdn.worldvectorlogo.com/logos/zapier-2.svg"
              alt="Zapier"
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
            style={{ translateZ: -50 }}
            className="absolute inset-[-4rem] bg-gradient-to-b from-primary/20 via-emerald-500/10 to-transparent blur-[100px] rounded-full"
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
                      { icon: CreditCard, label: "الرواتب", active: false },
                      { icon: Shield, label: "الامتثال", active: false },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer",
                          item.active
                            ? "bg-primary text-white shadow-md shadow-primary/10"
                            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                        )}
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
                        {
                          action: "تقرير ضريبي",
                          module: "INVOICE",
                          time: "08:00 ص",
                          color: "text-primary",
                          bg: "bg-primary/10",
                          border: "border-primary/20",
                          icon: FileText,
                        },
                      ].map((log, i) => (
                        <div
                          key={i}
                          className="flex gap-4 items-start pb-4 border-b border-zinc-50 last:border-0 last:pb-0"
                        >
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border",
                              log.bg,
                              log.color,
                              log.border
                            )}
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

// --- PROBLEM SECTION (Chaos) ---
const ProblemSection = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden perspective-[2000px]" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
            العمل التقليدي <span className="text-rose-500 line-through decoration-4">فوضوي</span>{" "}
            ومدمر للوقت
          </h2>
          <p className="text-zinc-500 text-xl font-medium mt-4">
            تطبيقات كثيرة، محادثات لا تنتهي، فواتير ضائعة، وغرامات تأخير.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-[1500px]"
        >
          {[
            {
              title: "واتساب مزدحم مبعثر",
              desc: "طلبات العملاء تضيع بين المحادثات الشخصية والعشوائية.",
              icon: MessageSquare,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              title: "فواتير يدوية متعبة",
              desc: "أكسيل، وورد، وبحث متواصل عن الأرقام الضريبية وتتبع التحويلات.",
              icon: FileText,
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              title: "غرامات ومخاطر",
              desc: "تأخر الرواتب، انتهاء الإقامات، وغرامات WPS و التأمينات الاجتماعية.",
              icon: ShieldAlert,
              color: "text-rose-500",
              bg: "bg-rose-50",
            },
          ].map((item, i) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { type: "spring", bounce: 0.4 },
                },
              }}
              whileHover={{
                y: -10,
                rotateX: 0,
                rotateY: i === 0 ? 5 : i === 2 ? -5 : 0,
                scale: 1.02,
              }}
              key={i}
              className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_60px_-20px_rgba(0,0,0,0.15)] transition-shadow duration-500 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-zinc-100 to-transparent -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10",
                  item.bg,
                  item.color
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-3 relative z-10">{item.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-200"
          >
            <span>تخلص من الفوضى الآن</span>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// --- FEATURE SHOWCASE (Bento Grid) ---
const FeatureShowcase = () => {
  return (
    <section className="py-32 bg-zinc-50 border-t border-zinc-200 perspective-[2000px]" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight max-w-3xl mx-auto">
            ليس مجرد نظام، بل هو{" "}
            <span className="text-primary tracking-tighter">دماغ إلكتروني</span> لإدارة شركتك
            بالكامل.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] perspective-[1500px]">
          {/* 1. CRM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
            className="col-span-1 md:col-span-2 bg-zinc-900 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] cursor-none"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/30 transition-colors" />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 relative z-10">
                  إدارة علاقات العملاء (CRM)
                </h3>
                <p className="text-zinc-400 font-medium text-lg relative z-10">
                  من العميل المحتمل وحتى إغلاق الصفقة وتوليد الفاتورة.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Invoicing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20, rotateY: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: -2, rotateX: -2 }}
            className="col-span-1 bg-white border border-zinc-200 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_60px_-20px_rgba(0,0,0,0.1)] transition-all cursor-none"
          >
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full group-hover:bg-blue-500/20 transition-colors" />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2 relative z-10">
                  فواتير وقوائم ضريبية
                </h3>
                <p className="text-zinc-500 font-medium text-sm relative z-10">
                  متوافقة بنسبة 100٪ مع هيئة الزكاة والضريبة ودعم الفوترة الإلكترونية.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4. FWCOS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -20, rotateY: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] cursor-none"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 block group-hover:opacity-100 transition-opacity" />
            <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full group-hover:bg-emerald-500/20 transition-colors" />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <ShieldCheck className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 flex flex-wrap items-center gap-3 relative z-10">
                  بيئة الامتثال{" "}
                  <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-1 rounded-full uppercase tracking-widest font-black shrink-0">
                    FWC-OS
                  </span>
                </h3>
                <p className="text-zinc-400 font-medium text-lg relative z-10">
                  أتمتة ذكية لضمان التوافق مع WPS وتجديد الإقامات دون غرامات وبلا مجهود.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <span>اكتشف جميع الميزات</span>
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// --- INTERACTIVE DEMO (Flow Transformation) ---
const FlowTransformation = () => {
  return (
    <section className="py-32 bg-zinc-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-zinc-950 to-zinc-950" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            من المحادثة إلى الأرباح، في ثوانٍ.
          </h2>
          <p className="text-xl text-zinc-400 font-medium">
            خط سير أوتوماتيكي يبدأ من رسالة واتساب وينتهي في حسابك البنكي.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.3 } },
            hidden: {},
          }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative"
        >
          {/* 1. Chat */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 50, scale: 0.9 },
              visible: {
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, rotate: -2, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
              <h4 className="font-bold">استقبال الطلب (واتساب)</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-800 p-3 rounded-xl rounded-tr-none text-sm w-11/12 ml-auto text-zinc-300">
                السلام عليكم، أريد طلب الخدمة الأساسية بـ 500 ريال.
              </div>
              <div className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 p-3 rounded-xl rounded-tl-none text-sm w-11/12">
                تم، جاري تجهيز الفاتورة التلقائية لك.
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
          >
            <ArrowLeft className="w-8 h-8 text-zinc-600 hidden md:block" />
            <ArrowLeft className="w-8 h-8 text-zinc-600 rotate-90 md:hidden" />
          </motion.div>

          {/* 2. Invoice */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <FileText className="w-6 h-6" />
              <h4 className="font-bold">توليد الفاتورة (AI)</h4>
            </div>
            <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-zinc-500">فاتورة INV-001</span>
                <span className="text-xs font-bold text-emerald-400">تم الإرسال</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-zinc-300">الخدمة الأساسية</span>
                <span className="font-black">500 SAR</span>
              </div>
              <button className="w-full mt-2 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold transition-all">
                رابط الدفع (Stripe/Tap)
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
          >
            <ArrowLeft className="w-8 h-8 text-zinc-600 hidden md:block" />
            <ArrowLeft className="w-8 h-8 text-zinc-600 rotate-90 md:hidden" />
          </motion.div>

          {/* 3. Analytics */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -50, scale: 0.9 },
              visible: {
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, rotate: 2, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-primary">
              <PieChart className="w-6 h-6" />
              <h4 className="font-bold">تحديث التقارير لحظياً</h4>
            </div>
            <div className="flex items-end gap-2 h-24 pt-4 border-b border-white/5 overflow-hidden group">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "33.333333%" }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-1/4 bg-primary/20 rounded-t-sm"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "50%" }}
                transition={{ delay: 1.0, duration: 1 }}
                className="w-1/4 bg-primary/40 rounded-t-sm"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "75%" }}
                transition={{ delay: 1.2, duration: 1 }}
                className="w-1/4 bg-primary/60 rounded-t-sm group-hover:bg-primary/80 transition-colors"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                transition={{ delay: 1.4, duration: 1 }}
                className="w-1/4 bg-primary text-primary-foreground font-black text-[10px] flex items-start justify-center pt-2 rounded-t-sm shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] transition-all"
              >
                +500
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black text-xl hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span>ابدأ خط سيرك المربح</span>
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

// --- SOCIAL PROOF ---
const SocialProofSection = () => {
  return (
    <section
      className="py-24 bg-zinc-50 border-y border-zinc-200 overflow-hidden relative"
      dir="rtl"
    >
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-50 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-50 to-transparent z-10 pointer-events-none" />

      <div className="container mx-auto px-6 text-center max-w-7xl relative z-0">
        <h3 className="text-zinc-500 font-black tracking-widest uppercase text-xs mb-12">
          الخيار الأول لأكثر من 5,000 شركة ورائد أعمال في المملكة والخليج
        </h3>

        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ ease: "linear", duration: 20, repeat: Infinity }}
          className="flex whitespace-nowrap items-center gap-16 md:gap-24 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
          style={{ width: "max-content", direction: "ltr" }}
        >
          {/* Corporate logos placeholders - duplicated for infinite effect */}
          {[1, 2].map((group) => (
            <React.Fragment key={group}>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Building2 className="w-8 h-8 text-primary" /> مجموعة الرائدة
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Globe className="w-8 h-8 text-emerald-500" /> خدمات ألفا
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Zap className="w-8 h-8 text-blue-500" /> تقنية الغد
              </div>
              <div className="flex items-center gap-3 font-black text-2xl text-zinc-800">
                <Shield className="w-8 h-8 text-rose-500" /> درع الأمن
              </div>
            </React.Fragment>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// --- PRICING SECTION ---
const PricingSection = () => {
  return (
    <section className="py-32 bg-white perspective-[2000px] overflow-hidden" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
            استثمار بسيط. نمو هائل.
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row justify-center gap-8 items-center lg:items-stretch perspective-[1500px]">
          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ y: -10, scale: 1.02, rotateY: 5 }}
            className="flex-1 w-full max-w-sm rounded-[2rem] p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <h3 className="text-xl font-bold text-zinc-900 mb-2">البداية (Starter)</h3>
            <p className="text-zinc-500 text-sm font-medium mb-6">لرواد الأعمال المستقلين</p>
            <div className="text-4xl font-black mb-8">
              مجاناً <span className="text-sm text-zinc-400 font-medium">/ مدى الحياة</span>
            </div>
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="space-y-4 mb-8 text-zinc-700 font-medium text-sm"
            >
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:scale-125 transition-transform" />{" "}
                إدارة 50 عميل
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:scale-125 transition-transform" />{" "}
                فواتير إلكترونية أساسية
              </motion.li>
            </motion.ul>
            <button className="w-full py-4 rounded-xl border-2 border-zinc-900 text-zinc-900 font-bold hover:bg-zinc-900 hover:text-white transition-all shadow-[0_0_0_0_rgba(24,24,27,0)] hover:shadow-[0_10px_20px_-10px_rgba(24,24,27,0.5)]">
              ابدأ مجاناً
            </button>
          </motion.div>

          {/* Pro (Highlighted) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.5 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="flex-1 w-full max-w-md rounded-[2.5rem] p-10 border-2 border-primary bg-zinc-900 text-white shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)] relative transform lg:-translate-y-4 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-black px-4 py-1.5 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-primary/30">
              الأكثر طلباً
            </div>
            <h3 className="text-2xl font-black mb-2 relative z-10">الاحترافي (Pro)</h3>
            <p className="text-zinc-400 text-sm font-medium mb-6 relative z-10">
              للشركات الصغيرة الطموحة
            </p>
            <div className="text-5xl font-black mb-8 flex items-baseline gap-2 relative z-10">
              299{" "}
              <span className="text-xl text-zinc-500 font-medium tracking-tight">
                ريال / شهرياً
              </span>
            </div>
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="space-y-4 mb-10 text-zinc-300 font-medium relative z-10"
            >
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                <span className="font-bold text-white">ترخيص ZATCA المرحلة الثانية مدعوم</span>
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                ربط ZATCA المرحلة 2 مباشر (مجاني)
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                جميع أدوات (FWC-OS و ImportOS)
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                برنامج الشركاء: شهرين مجاناً لكل دعوة
              </motion.li>
            </motion.ul>
            <button className="w-full py-4 rounded-xl bg-primary text-white font-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 transition-all text-lg relative z-10 overflow-hidden group/btn">
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300" />
              <span className="relative z-10">اشترك الآن</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// --- FINAL CTA ---
const FinalCTA = () => {
  return (
    <section
      className="py-32 relative overflow-hidden bg-zinc-950 text-white text-center"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full point-events-none" />
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
          ابدأ في تحويل عملك اليوم.
        </h2>
        <p className="text-xl text-zinc-400 mb-12 font-medium">
          انضم لآلاف الشركات الخليجية التي تعتمد على مدارج كنظام تشغيل رقمي موحد وموثوق.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/app"
            className="px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            ابدأ تجربتك المجانية
          </Link>
          <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg">
            <Bot className="w-6 h-6" /> اسأل الذكاء الاصطناعي
          </button>
        </div>
      </div>
    </section>
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
  useEffect(() => {
    // Small logic to ensure page starts at top on mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased text-zinc-900 selection:bg-primary/30 scroll-smooth">
      <CustomCursor />
      <Navbar />

      <HeroSection />
      <SocialProofSection />
      <ProblemSection />
      <FeatureShowcase />
      <FlowTransformation />
      <PricingSection />
      <FinalCTA />

      {/* Footer */}
      <footer className="bg-zinc-950 pt-20 pb-12 border-t border-white/5" dir="rtl">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            <div>
              <Logo theme="dark" />
              <p className="text-zinc-500 font-medium mt-6 leading-relaxed text-sm">
                نظام تشغيل رقمي موحد يعكس ثقافتنا المحلية ويلبي احتياجاتنا بدقة.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">المنتج</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/product" className="hover:text-primary transition-colors">
                    الميزات الرئيسية
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/invoicing" className="hover:text-primary transition-colors">
                    نظام الفواتير ZATCA
                  </Link>
                </li>
                <li>
                  <Link to="/demo" className="hover:text-primary transition-colors">
                    جولة تفاعلية (Demo)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">الحلول</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    قطاع التجزئة
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    المقاولات والبناء
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    الاستشارات والوكالات
                  </Link>
                </li>
                <li>
                  <Link to="/solutions" className="hover:text-primary transition-colors">
                    الخدمات والصيانة
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">الشركة</h4>
              <ul className="space-y-4 text-sm font-medium text-zinc-400">
                <li>
                  <Link to="/about" className="hover:text-primary transition-colors">
                    عن مدارج
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="hover:text-primary transition-colors">
                    الأمان والامتثال
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary transition-colors">
                    تواصل معنا
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-zinc-600 text-sm font-medium">
              © 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
