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
  Menu,
  X,
  Globe,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const products = [
    {
      title: "إدارة العملاء (CRM)",
      subtitle: "أتمتة المحادثات وبطاقات العملاء والمتابعة الذكية الصادرة والواردة.",
      icon: Users,
      href: "/product/crm",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "الفوترة الذكية و ZATCA",
      subtitle: "فواتير إلكترونية تامة الامتثال للمرحلة 2 مشفرة وموقعة رقمياً بضغطة زر.",
      icon: Receipt,
      href: "/product/invoicing",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "مسير الرواتب وقوى",
      subtitle: "الربط المباشر مع قوى ومدد والتأمينات، مع حساب التوطين والتزامات WPS.",
      icon: CreditCard,
      href: "/product/payroll",
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "العقود والاتفاقيات الذكية",
      subtitle: "صياغة وتوليد وتوقيع العقود إلكترونياً مع روابط قانونية موثقة وآمنة.",
      icon: FileText,
      href: "/product/contracts",
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "سلاسل الإمداد واللوجستية",
      subtitle: "تتبع جمركي لحظي، بوابات فسح، وتكامل مع المخلصين والمستودعات.",
      icon: Truck,
      href: "/product/supply-chain",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "مختبر الأتمتة بالذكاء الاصطناعي",
      subtitle: "محرك وكلاء ذكي يقرأ الرسائل، يحلل الصفقات، ويكمل الإجراءات تلقائياً.",
      icon: Sparkles,
      href: "/product/ai-automation",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
  ];

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  useEffect(() => {
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-zinc-950/80 border-b border-white/5 shadow-2xl"
      dir="rtl"
    >
      <div className="container mx-auto max-w-7xl flex items-center justify-between">
        <Logo theme="dark" />

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8 mr-12 ml-auto text-sm font-bold text-zinc-300">
          <Link
            to="/about"
            className={cn(
              "hover:text-white transition-colors",
              location.pathname === "/about" && "text-white text-emerald-400"
            )}
          >
            عن مدارج
          </Link>

          {/* Hover Menu Trigger */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            ref={triggerRef}
          >
            <button
              className={cn(
                "hover:text-white transition-all flex items-center gap-1 cursor-pointer py-2 outline-none",
                (isOpen || location.pathname.startsWith("/product/")) && "text-white"
              )}
            >
              <span>المنتجات والادوات</span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white" />
              </motion.span>
            </button>

            {/* Dropdown Menu Panel (Award Winning Style) */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-1/2 translate-x-1/2 top-full mt-2 w-[720px] bg-zinc-900/95 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl p-8 z-[100] grid grid-cols-2 gap-6 overflow-hidden"
                  ref={dropdownRef}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

                  {products.map((p, idx) => (
                    <motion.div
                      key={p.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        to={p.href}
                        className="group flex gap-4 p-4 rounded-3xl border border-transparent hover:border-white/5 hover:bg-white/[0.03] transition-all duration-300 relative overflow-hidden"
                      >
                        <div
                          className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border",
                            p.bg
                          )}
                        >
                          <p.icon className={cn("w-5 h-5", p.color)} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-white font-black text-sm group-hover:text-primary transition-colors flex items-center gap-1.5">
                            {p.title}
                            <ArrowLeft className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                          </h4>
                          <p className="text-zinc-400 text-xs font-medium leading-relaxed">
                            {p.subtitle}
                          </p>
                        </div>
                      </Link>
                    </motion.div>
                  ))}

                  <div className="col-span-2 mt-2 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-medium">
                      نظام موحد ومترابط يغنيك عن عشرات البرامج والاشتراكات.
                    </span>
                    <Link
                      to="/product"
                      className="text-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <span>عرض كافة الميزات</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link
            to="/solutions"
            className={cn(
              "hover:text-white transition-colors",
              location.pathname === "/solutions" && "text-white text-emerald-400"
            )}
          >
            الحلول القطاعية
          </Link>
          <Link
            to="/security"
            className={cn(
              "hover:text-white transition-colors",
              location.pathname === "/security" && "text-white text-emerald-400"
            )}
          >
            الامتثال والأمان
          </Link>
          <Link to="/demo" className="text-primary hover:text-primary/80 transition-colors">
            تجربة حية (Demo)
          </Link>
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-sm font-bold text-zinc-300 hover:text-white transition-colors hidden sm:block"
          >
            تسجيل الدخول
          </Link>
          <Link
            to="/app"
            className="px-5 py-2.5 bg-primary text-white text-sm font-black rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20 hover:scale-105 active:scale-95"
          >
            ابدأ الآن مجاناً
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white md:hidden transition-colors cursor-pointer outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu (Glass Overlay) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 pt-4 border-t border-white/5 flex flex-col gap-4 overflow-hidden"
          >
            <Link to="/about" className="py-2 text-zinc-300 font-bold hover:text-white">
              عن مدارج
            </Link>

            {/* Products Expansion in Mobile Menu */}
            <div className="border-y border-white/5 py-4 my-2">
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest block mb-3">
                المنتجات والأدوات
              </span>
              <div className="grid grid-cols-1 gap-4">
                {products.map((p) => (
                  <Link
                    key={p.href}
                    to={p.href}
                    className="flex gap-3 items-center hover:bg-white/5 p-2 rounded-2xl transition-colors"
                  >
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                        p.bg
                      )}
                    >
                      <p.icon className={cn("w-4 h-4", p.color)} />
                    </div>
                    <div>
                      <h4 className="text-white text-xs font-bold">{p.title}</h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <Link to="/solutions" className="py-2 text-zinc-300 font-bold hover:text-white">
              الحلول القطاعية
            </Link>
            <Link to="/security" className="py-2 text-zinc-300 font-bold hover:text-white">
              الامتثال والأمان
            </Link>
            <Link to="/demo" className="py-2 text-primary font-bold hover:text-primary/80">
              تجربة حية (Demo)
            </Link>
            <Link to="/login" className="py-2 text-zinc-300 font-bold hover:text-white sm:hidden">
              تسجيل الدخول
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
