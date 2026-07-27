import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Logo } from "./Logo";
import {
  Users,
  Receipt,
  CreditCard,
  FileText,
  Truck,
  Sparkles,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Menu,
  X,
  Globe,
  ShieldCheck,
  Zap,
  Info,
  Play,
  LogIn,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSettings } from "@/src/contexts/SettingsContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"nav" | "products" | "resources">("nav");

  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resourcesDropdownRef = useRef<HTMLDivElement>(null);
  const resourcesTriggerRef = useRef<HTMLDivElement>(null);
  const resourcesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { settings, updateSettings } = useSettings();
  const isAr = settings.language === "ar";

  const products = [
    {
      title: isAr ? "إدارة العملاء (CRM)" : "Customer Management (CRM)",
      subtitle: isAr
        ? "أتمتة المحادثات وبطاقات العملاء والمتابعة الذكية الصادرة والواردة."
        : "Automate chats, customer profiles, and smart inbound & outbound follow-ups.",
      icon: Users,
      href: "/product/crm",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
    },
    {
      title: isAr ? "الفوترة الذكية و ZATCA" : "Smart Invoicing & ZATCA",
      subtitle: isAr
        ? "فواتير إلكترونية تامة الامتثال للمرحلة 2 مشفرة وموقعة رقمياً بضغطة زر."
        : "Fully compliant Phase 2 e-invoicing, digitally signed & encrypted in one click.",
      icon: Receipt,
      href: "/product/invoicing",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20",
    },
    {
      title: isAr ? "مسير الرواتب وقوى" : "Payroll & Qiwa",
      subtitle: isAr
        ? "الربط المباشر مع قوى ومدد والتأمينات، مع حساب التوطين والتزامات WPS."
        : "Direct integration with Qiwa, Mudad & GOSI, calculating nationalization & WPS limits.",
      icon: CreditCard,
      href: "/product/payroll",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20",
    },
    {
      title: isAr ? "العقود والاتفاقيات الذكية" : "Smart Contracts & Agreements",
      subtitle: isAr
        ? "صياغة وتوليد وتوقيع العقود إلكترونياً مع روابط قانونية موثقة وآمنة."
        : "Draft, generate, and sign contracts electronically with secure legal links.",
      icon: FileText,
      href: "/product/contracts",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20",
    },
    {
      title: isAr ? "سلاسل الإمداد واللوجستية" : "Supply Chain & Logistics",
      subtitle: isAr
        ? "تتبع جمركي لحظي، بوابات فسح، وتكامل مع المخلصين والمستودعات."
        : "Real-time customs tracking, clearance gateways, and integration with brokers & warehouses.",
      icon: Truck,
      href: "/product/supply-chain",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
    },
    {
      title: isAr ? "مختبر الأتمتة بالذكاء الاصطناعي" : "AI Automation Lab",
      subtitle: isAr
        ? "محرك وكلاء ذكي يقرأ الرسائل، يحلل الصفقات، ويكمل الإجراءات تلقائياً."
        : "Smart agent engine that reads messages, analyzes deals, and completes steps automatically.",
      icon: Sparkles,
      href: "/product/ai-automation",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500/20",
    },
  ];

  const resourcesCategories = [
    {
      id: "e-invoicing",
      title: isAr ? "الفوترة الإلكترونية (ZATCA)" : "E-Invoicing (ZATCA)",
      description: isAr
        ? "متطلبات الفواتير، التوقيع الرقمي، وحلول المطابقة للمرحلتين الأولى والثانية."
        : "Invoice requirements, digital signing, and compliance solutions for Phase 1 & 2.",
      icon: Receipt,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20 group-hover:bg-amber-500/20",
    },
    {
      id: "payroll",
      title: isAr ? "مسير الرواتب وحماية الأجور" : "Payroll & Wage Protection",
      description: isAr
        ? "دليل حماية الأجور (WPS)، منصة قوى ومدد، وحساب مستحقات الموظفين."
        : "Wages Protection System (WPS) guide, Qiwa & Mudad integration, and benefit calculation.",
      icon: CreditCard,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500/20",
    },
    {
      id: "crm",
      title: isAr ? "إدارة العملاء و المبيعات" : "CRM & Sales Management",
      description: isAr
        ? "أتمتة المتابعة وخدمة العملاء، دمج قنوات الواتساب، وأسرار إغلاق الصفقات."
        : "Automate follow-ups, integrate WhatsApp channels, and close deals faster.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500/20",
    },
    {
      id: "contracts",
      title: isAr ? "العقود والتوثيق القانوني" : "Contracts & Legal Verification",
      description: isAr
        ? "حجية العقود الرقمية، التوقيع الإلكتروني المعتمد، والأمن التشريعي للشركات."
        : "Legal force of digital contracts, authorized e-signing, and legal safety.",
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500/20",
    },
    {
      id: "supply-chain",
      title: isAr ? "سلاسل الإمداد والجمارك" : "Supply Chain & Customs",
      description: isAr
        ? "حساب التكلفة الفعلية (Landed Cost)، التخليص الجمركي وإدارة اللوجستيات."
        : "Landed cost calculation, customs clearance, and logistics management.",
      icon: Truck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20",
    },
    {
      id: "ai",
      title: isAr ? "الأتمتة والذكاء الاصطناعي" : "Automation & AI",
      description: isAr
        ? "أتمتة الأعمال باستخدام وكلاء الذكاء الاصطناعي ومستقبل الإدارة الذكية."
        : "Workflow automation using intelligent AI agents and the future of management.",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20 group-hover:bg-cyan-500/20",
    },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    setIsResourcesOpen(false);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleResourcesMouseEnter = () => {
    if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(false);
    setIsResourcesOpen(true);
  };

  const handleResourcesMouseLeave = () => {
    resourcesTimeoutRef.current = setTimeout(() => {
      setIsResourcesOpen(false);
    }, 150);
  };

  useEffect(() => {
    setIsOpen(false);
    setIsResourcesOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (resourcesTimeoutRef.current) clearTimeout(resourcesTimeoutRef.current);
    };
  }, []);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 pointer-events-none"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto relative pointer-events-auto">
        {/* Floating Glass Dock Bar */}
        <div className="relative flex flex-nowrap items-center justify-between rounded-full bg-zinc-950/85 border border-white/10 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] px-3.5 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 overflow-visible">
          
          {/* Subtle Ambient Top Border Glow */}
          <div className="absolute inset-x-8 -top-px h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 via-teal-400/30 to-transparent pointer-events-none" />

          {/* Logo Section */}
          <div className="flex items-center shrink-0">
            <Logo theme="dark" className="shrink-0 scale-90 sm:scale-100" />
          </div>

          {/* Desktop Navigation Links (Strictly Visible on xl / 1280px+ to ensure zero layout overlap) */}
          <nav className="hidden xl:flex flex-nowrap items-center gap-1.5 mx-auto shrink min-w-0">
            <Link
              to="/about"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0",
                location.pathname === "/about"
                  ? "bg-white/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "text-zinc-300 hover:text-white hover:bg-white/5"
              )}
            >
              {isAr ? "عن مدارج" : "About Us"}
            </Link>

            {/* Products Dropdown Trigger */}
            <div
              className="relative shrink-0"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={triggerRef}
            >
              <button
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none whitespace-nowrap shrink-0",
                  isOpen || location.pathname.startsWith("/product")
                    ? "bg-white/10 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{isAr ? "المنتجات والخدمات" : "Products & Services"}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200",
                    isOpen && "rotate-180 text-emerald-400"
                  )}
                />
              </button>

              {/* Products Mega Menu Panel */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full mt-3 right-1/2 translate-x-1/2 w-[720px] max-w-[calc(100vw-2rem)] bg-zinc-900/95 border border-white/15 rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 sm:p-6 z-[100] grid grid-cols-2 gap-3.5 overflow-hidden"
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

                    {products.map((p, idx) => (
                      <motion.div
                        key={p.href}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <Link
                          to={p.href}
                          className="group flex gap-3 p-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 relative overflow-hidden"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                              p.bg
                            )}
                          >
                            <p.icon className={cn("w-4 h-4", p.color)} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate">
                              {p.title}
                              {isAr ? (
                                <ArrowLeft className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                              )}
                            </h4>
                            <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                              {p.subtitle}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}

                    <div className="col-span-2 mt-1 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium text-[11px]">
                        {isAr
                          ? "منظومة متكاملة تضمن الامتثال التام للأنظمة السعودية."
                          : "Integrated ecosystem ensuring full Saudi compliance."}
                      </span>
                      <Link
                        to="/product"
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>{isAr ? "عرض كافة الميزات" : "View All Features"}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/solutions"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0",
                location.pathname === "/solutions"
                  ? "bg-white/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "text-zinc-300 hover:text-white hover:bg-white/5"
              )}
            >
              {isAr ? "الحلول القطاعية" : "Solutions"}
            </Link>

            {/* Resources Dropdown Trigger */}
            <div
              className="relative shrink-0"
              onMouseEnter={handleResourcesMouseEnter}
              onMouseLeave={handleResourcesMouseLeave}
              ref={resourcesTriggerRef}
            >
              <button
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer outline-none whitespace-nowrap shrink-0",
                  isResourcesOpen || location.pathname.startsWith("/resources")
                    ? "bg-white/10 text-emerald-400 border border-emerald-500/30"
                    : "text-zinc-300 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{isAr ? "المصادر والمعرفة" : "Resources"}</span>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-zinc-400 transition-transform duration-200",
                    isResourcesOpen && "rotate-180 text-emerald-400"
                  )}
                />
              </button>

              {/* Resources Mega Menu Panel */}
              <AnimatePresence>
                {isResourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-full mt-3 right-1/2 translate-x-1/2 w-[720px] max-w-[calc(100vw-2rem)] bg-zinc-900/95 border border-white/15 rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-5 sm:p-6 z-[100] grid grid-cols-2 gap-3.5 overflow-hidden"
                    ref={resourcesDropdownRef}
                    onMouseEnter={handleResourcesMouseEnter}
                    onMouseLeave={handleResourcesMouseLeave}
                  >
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                    {resourcesCategories.map((c, idx) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <Link
                          to={`/resources?category=${c.id}`}
                          className="group flex gap-3 p-3 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/[0.04] transition-all duration-200 relative overflow-hidden"
                        >
                          <div
                            className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors",
                              c.bg
                            )}
                          >
                            <c.icon className={cn("w-4 h-4", c.color)} />
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-white font-black text-xs sm:text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-1.5 truncate">
                              {c.title}
                              {isAr ? (
                                <ArrowLeft className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                              ) : (
                                <ArrowRight className="w-3.5 h-3.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-400 shrink-0" />
                              )}
                            </h4>
                            <p className="text-zinc-400 text-[11px] leading-relaxed line-clamp-2">
                              {c.description}
                            </p>
                          </div>
                        </Link>
                      </motion.div>
                    ))}

                    <div className="col-span-2 mt-1 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                      <span className="text-zinc-400 font-medium text-[11px]">
                        {isAr
                          ? "أدلة عمل وحاسبات ذكية متكاملة لرفع جاهزية المنشأة."
                          : "Guides and calculators to elevate enterprise readiness."}
                      </span>
                      <Link
                        to="/resources"
                        className="text-emerald-400 font-bold hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>{isAr ? "المكتبة الكاملة" : "Full Library"}</span>
                        {isAr ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link
              to="/security"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 whitespace-nowrap shrink-0",
                location.pathname === "/security"
                  ? "bg-white/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                  : "text-zinc-300 hover:text-white hover:bg-white/5"
              )}
            >
              {isAr ? "الامتثال والأمان" : "Security"}
            </Link>

            <Link
              to="/demo"
              className={cn(
                "px-3 py-1.5 rounded-full text-xs xl:text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap shrink-0",
                location.pathname === "/demo"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
              )}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
              <span>{isAr ? "تجربة حية" : "Live Demo"}</span>
            </Link>
          </nav>

          {/* Action Area (Language, Login & Primary CTA) - Enforced Single Row, Zero Overlap */}
          <div className="flex flex-nowrap items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Live Demo Badge on Medium Screens (< xl) */}
            <Link
              to="/demo"
              className="hidden sm:flex xl:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold whitespace-nowrap shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? "تجربة حية" : "Demo"}</span>
            </Link>

            {/* Global Language Toggle */}
            <button
              onClick={() => {
                const newLang = settings.language === "ar" ? "en" : "ar";
                updateSettings({ language: newLang });
              }}
              className="px-2.5 sm:px-3 py-1.5 rounded-full border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center gap-1 outline-none shrink-0"
              title={isAr ? "Switch to English" : "تغيير إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold">{isAr ? "EN" : "عربي"}</span>
            </button>

            {/* Login Link (Visible on xl / 1280px+) */}
            <Link
              to="/login"
              className="text-xs xl:text-sm font-bold text-zinc-300 hover:text-white px-2.5 sm:px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors hidden xl:block whitespace-nowrap shrink-0"
            >
              {isAr ? "تسجيل الدخول" : "Login"}
            </Link>

            {/* Main Primary CTA Button ("ابدأ الآن مجاناً") */}
            <Link
              to="/app"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-zinc-950 font-black text-xs sm:text-sm rounded-full shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap shrink-0"
            >
              {isAr ? "ابدأ الآن مجاناً" : "Start Free"}
            </Link>

            {/* Mobile / Tablet Menu Toggle Button (Visible on screens < 1280px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 sm:p-2 text-zinc-300 hover:text-white xl:hidden transition-colors cursor-pointer outline-none rounded-full bg-white/5 border border-white/10 hover:bg-white/10 shrink-0"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Award-Winning Mobile & Tablet Glass Drawer Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="xl:hidden absolute top-full left-0 right-0 mt-2 bg-zinc-950/95 border border-white/15 rounded-3xl backdrop-blur-2xl p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-[82vh] overflow-y-auto space-y-4"
            >
              {/* Mobile Navigation Category Tabs */}
              <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl text-xs font-bold">
                <button
                  onClick={() => setMobileTab("nav")}
                  className={cn(
                    "flex-1 py-2 rounded-xl transition-all cursor-pointer",
                    mobileTab === "nav" ? "bg-emerald-500 text-zinc-950 font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {isAr ? "الرئيسية" : "Main"}
                </button>
                <button
                  onClick={() => setMobileTab("products")}
                  className={cn(
                    "flex-1 py-2 rounded-xl transition-all cursor-pointer",
                    mobileTab === "products" ? "bg-emerald-500 text-zinc-950 font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {isAr ? "المنتجات" : "Products"}
                </button>
                <button
                  onClick={() => setMobileTab("resources")}
                  className={cn(
                    "flex-1 py-2 rounded-xl transition-all cursor-pointer",
                    mobileTab === "resources" ? "bg-emerald-500 text-zinc-950 font-black" : "text-zinc-400 hover:text-white"
                  )}
                >
                  {isAr ? "المصادر" : "Resources"}
                </button>
              </div>

              {/* Tab 1: Main Pages Navigation */}
              {mobileTab === "nav" && (
                <div className="space-y-1.5 pt-1">
                  <Link
                    to="/about"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                  >
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "عن مدارج" : "About Mudarij"}</span>
                  </Link>
                  <Link
                    to="/solutions"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                  >
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "الحلول القطاعية" : "Sector Solutions"}</span>
                  </Link>
                  <Link
                    to="/security"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "الامتثال والأمان" : "Compliance & Security"}</span>
                  </Link>
                  <Link
                    to="/demo"
                    className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-sm transition-colors"
                  >
                    <Play className="w-4 h-4 text-emerald-400" />
                    <span>{isAr ? "تجربة حية (Demo)" : "Live Demo"}</span>
                  </Link>
                </div>
              )}

              {/* Tab 2: Products & Modules Grid */}
              {mobileTab === "products" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {products.map((p) => (
                    <Link
                      key={p.href}
                      to={p.href}
                      className="flex gap-3 items-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", p.bg)}>
                        <p.icon className={cn("w-4 h-4", p.color)} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white text-xs font-bold truncate">{p.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Tab 3: Resources */}
              {mobileTab === "resources" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {resourcesCategories.map((c) => (
                    <Link
                      key={c.id}
                      to={`/resources?category=${c.id}`}
                      className="flex gap-3 items-center p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border", c.bg)}>
                        <c.icon className={cn("w-4 h-4", c.color)} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-white text-xs font-bold truncate">{c.title}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Bottom Actions in Mobile Menu */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors text-center"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? "تسجيل الدخول" : "Login"}</span>
                </Link>

                <Link
                  to="/app"
                  className="w-full block py-3 text-center bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 text-zinc-950 font-black text-sm rounded-2xl shadow-lg shadow-emerald-500/20"
                >
                  {isAr ? "ابدأ الآن مجاناً" : "Start Free Now"}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

export { Navbar };
