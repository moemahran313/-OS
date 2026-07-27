import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
  Search,
  Sparkles,
  ShieldCheck,
  Calculator,
  Blocks,
  Truck,
  CheckCircle2,
  FileSignature,
  Code2,
  Video,
  Warehouse,
  Scale,
  FolderKanban,
  LifeBuoy,
  Magnet,
  Mail,
  Share2,
  Grid,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Logo } from "@/src/components/Logo";
import { motion, AnimatePresence } from "motion/react";
import { processBusinessCommand } from "@/src/services/aiService";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useUser } from "@/src/contexts/UserContext";
import {
  LogOut,
  ChevronDown,
  User as UserIcon,
  Bell,
  Globe,
  Menu,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";
import { useTranslation } from "react-i18next";

const navigationData = [
  { nameKey: "dashboard", id: "Dashboard", href: "/app", icon: LayoutDashboard },
  {
    nameKey: "sidebar.marketing_copilot",
    id: "MarketingCopilot",
    href: "/app/marketing-copilot",
    icon: Sparkles,
  },
  { nameKey: "sidebar.employees", id: "CRM", href: "/app/crm", icon: Users },
  { nameKey: "sidebar.chat", id: "Chat", href: "/app/chat", icon: MessageSquare },
  { nameKey: "projects", id: "Projects", href: "/app/projects", icon: FolderKanban },
  { nameKey: "دفتر الأستاذ والقيود", id: "Accounting", href: "/app/accounting", icon: Scale },
  { nameKey: "sidebar.suppliers", id: "Suppliers", href: "/app/suppliers", icon: Truck },
  { nameKey: "sidebar.contracts", id: "Contracts", href: "/app/contracts", icon: FileSignature },
  { nameKey: "workflows", id: "Workflows", href: "/app/workflows", icon: Blocks },
  { nameKey: "sidebar.employees", id: "Compliance", href: "/app/fwcos", icon: ShieldCheck },
  { nameKey: "common.dashboard", id: "Calculations", href: "/app/calculations", icon: Calculator },
  { nameKey: "common.invoices", id: "Invoices", href: "/app/invoices", icon: FileText },
  { nameKey: "sidebar.integrations", id: "Integrations", href: "/app/integrations", icon: Blocks },
  { nameKey: "common.payroll", id: "Payroll", href: "/app/payroll", icon: CreditCard },
  { nameKey: "المخزون والمستودعات", id: "Inventory", href: "/app/inventory", icon: Warehouse },
  { nameKey: "sidebar.analytics", id: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { nameKey: "الدعم الفني والبطاقات", id: "Support", href: "/app/support", icon: LifeBuoy },
];

const itemLabels: Record<string, { ar: string; en: string }> = {
  Dashboard: { ar: "لوحة التحكم الرئيسية", en: "Main Dashboard" },
  Chat: { ar: "مركز الاتصال الموحد", en: "Unified Communications" },
  Projects: { ar: "إدارة المشاريع", en: "Project Management" },
  MarketingCopilot: { ar: "مساعد التسويق والعملاء", en: "Marketing Copilot" },
  CRM: { ar: "إدارة العملاء والبيع", en: "Customer Relations & Sales" },
  Invoices: { ar: "الفواتير والمطالبات", en: "Invoices & Claims" },
  Payroll: { ar: "مسيرات الرواتب والأجور", en: "Payroll & Wages" },
  Accounting: { ar: "دفتر الأستاذ والقيود", en: "General Ledger & Accounting" },
  Suppliers: { ar: "الموردون وسلاسل الإمداد", en: "Suppliers & Supply Chain" },
  Contracts: { ar: "عقود العمل والاتفاقيات", en: "Work Contracts & Signatures" },
  Workflows: { ar: "الأتمتة ومسارات العمل", en: "Workflows & Automation" },
  Compliance: { ar: "الالتزام وحماية الأجور", en: "WPS & Regulatory Compliance" },
  Inventory: { ar: "إدارة المخزون والمستودعات", en: "Inventory & Warehouses" },
  Analytics: { ar: "التحليلات ولوحات التقارير", en: "Analytics & Reporting" },
  Calculations: { ar: "الأدوات والمحاسبة الإدارية", en: "Business Tools & Calculations" },
  Integrations: { ar: "سوق التطبيقات والربط", en: "App Integrations" },
  Support: { ar: "الدعم الفني والبطاقات", en: "Technical Support & Tickets" }
};

const getItemLabel = (item: any, language: string) => {
  const custom = itemLabels[item.id];
  if (custom) {
    return language === "ar" ? custom.ar : custom.en;
  }
  return item.id;
};



export default function Layout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { settings, updateSettings } = useSettings();
  const { user, logout, hasPermission } = useUser();
  const [command, setCommand] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [isListening, setIsListening] = useState(false);
  const [showDialects, setShowDialects] = useState(false);
  const [selectedDialect, setSelectedDialect] = useState("ar-SA");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMobileMoreSheetOpen, setIsMobileMoreSheetOpen] = useState(false);
  const [mobileAppSearch, setMobileAppSearch] = useState("");
  const [mobileCategoryFilter, setMobileCategoryFilter] = useState("all");

  const mobileCategories = [
    { id: "all", labelAr: "الكل", labelEn: "All" },
    { id: "finance", labelAr: "المالية", labelEn: "Finance" },
    { id: "crm", labelAr: "العملاء", labelEn: "Clients" },
    { id: "ops", labelAr: "العمليات", labelEn: "Operations" },
    { id: "compliance", labelAr: "الامتثال", labelEn: "Compliance" },
  ];

  const allMobileApps = [
    { id: "Dashboard", nameAr: "لوحة التحكم", nameEn: "Dashboard", category: "all", href: "/app", icon: LayoutDashboard, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { id: "CRM", nameAr: "إدارة العملاء والبيع", nameEn: "CRM & Sales", category: "crm", href: "/app/crm", icon: Users, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "MarketingCopilot", nameAr: "مساعد التسويق والعملاء", nameEn: "Marketing Copilot", category: "crm", href: "/app/marketing-copilot", icon: Sparkles, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { id: "Chat", nameAr: "مركز الاتصال الموحد", nameEn: "Unified Chat", category: "crm", href: "/app/chat", icon: MessageSquare, color: "bg-teal-500/10 text-teal-500 border-teal-500/20" },
    { id: "Payroll", nameAr: "مسيرات الرواتب", nameEn: "Payroll & WPS", category: "finance", href: "/app/payroll", icon: CreditCard, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { id: "Invoices", nameAr: "الفواتير والمطالبات", nameEn: "Invoices & Claims", category: "finance", href: "/app/invoices", icon: FileText, color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20" },
    { id: "Accounting", nameAr: "دفتر الأستاذ والقيود", nameEn: "General Ledger", category: "finance", href: "/app/accounting", icon: Scale, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    { id: "Calculations", nameAr: "الأدوات والمحاسبة", nameEn: "Business Tools", category: "finance", href: "/app/calculations", icon: Calculator, color: "bg-sky-500/10 text-sky-500 border-sky-500/20" },
    { id: "Projects", nameAr: "إدارة المشاريع", nameEn: "Projects", category: "ops", href: "/app/projects", icon: FolderKanban, color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
    { id: "Suppliers", nameAr: "الموردون وسلاسل الإمداد", nameEn: "Suppliers", category: "ops", href: "/app/suppliers", icon: Truck, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
    { id: "Contracts", nameAr: "عقود العمل والتوقيع", nameEn: "Contracts", category: "crm", href: "/app/contracts", icon: FileSignature, color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
    { id: "Workflows", nameAr: "مسارات العمل والأتمتة", nameEn: "Workflows", category: "ops", href: "/app/workflows", icon: Blocks, color: "bg-violet-500/10 text-violet-500 border-violet-500/20" },
    { id: "Inventory", nameAr: "إدارة المخزون", nameEn: "Inventory", category: "ops", href: "/app/inventory", icon: Warehouse, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { id: "Compliance", nameAr: "الالتزام وحماية الأجور", nameEn: "WPS Compliance", category: "compliance", href: "/app/fwcos", icon: ShieldCheck, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    { id: "Analytics", nameAr: "التحليلات والتقارير", nameEn: "Analytics", category: "compliance", href: "/app/analytics", icon: BarChart3, color: "bg-fuchsia-500/10 text-fuchsia-500 border-fuchsia-500/20" },
    { id: "Integrations", nameAr: "سوق التطبيقات والربط", nameEn: "Integrations", category: "compliance", href: "/app/integrations", icon: Blocks, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { id: "Support", nameAr: "الدعم الفني والبطاقات", nameEn: "Support & Tickets", category: "compliance", href: "/app/support", icon: LifeBuoy, color: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
  ];

  React.useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Polling every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await res.json();
          setNotifications(data);
        }
      } else {
        console.warn("Failed to fetch notifications, status: " + res.status);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications (network or parse error)", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error("Failed to mark as read", err);
    }
  };

  const dialects = [
    { code: "ar-SA", label: "السعودية" },
    { code: "ar-AE", label: "الإمارات" },
    { code: "ar-EG", label: "مصر" },
    { code: "ar-QA", label: "قطر" },
    { code: "ar-KW", label: "الكويت" },
    { code: "ar-MA", label: "المغرب" },
  ];

  const handleMicClick = () => {
    if (isListening) return;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t("layout.mic_not_supported"));
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedDialect;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setShowDialects(false);
    };

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommand(transcript);

      // Auto-submit command
      setIsProcessing(true);
      const result = await processBusinessCommand(transcript, settings.language);
      setAiResponse(result || "");
      setIsProcessing(false);
      setCommand("");
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      if (event.error === "not-allowed") {
        toast.error(t("layout.mic_permission_denied"));
      } else {
        toast.error(t("layout.mic_error"));
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredNavigation = navigationData.filter(
    (item) =>
      item.id === "Chat" ||
      item.id === "Projects" ||
      item.id === "MarketingCopilot" ||
      hasPermission(item.id)
  );

  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && command.trim()) {
      setIsProcessing(true);
      const result = await processBusinessCommand(command, settings.language);
      setAiResponse(result || "");
      setIsProcessing(false);
      setCommand("");
    }
  };

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="app-workspace flex h-screen bg-zinc-50 font-sans overflow-hidden text-zinc-900 dark:text-zinc-100 transition-colors duration-300"
      dir={settings.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Background ambient glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-zinc-200/20 dark:bg-zinc-100/40 rounded-full blur-[120px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isSidebarCollapsed ? 88 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "h-full flex flex-col z-20 hidden lg:flex shrink-0 relative transition-all duration-300",
          "backdrop-blur-md bg-white/40 dark:bg-zinc-100/40 border-zinc-200 dark:border-zinc-900/50",
          settings.language === "ar" ? "border-l" : "border-r"
        )}
      >
        {/* Toggle Collapse Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={cn(
            "absolute top-6 p-1.5 rounded-full bg-white dark:bg-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all z-30 cursor-pointer shadow-lg shadow-black/10 dark:shadow-black/50",
            settings.language === "ar"
              ? "-left-3.5 rotate-0 hover:translate-x-[-2px]"
              : "-right-3.5 rotate-0 hover:translate-x-[2px]"
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn(
              "transition-transform duration-300",
              isSidebarCollapsed
                ? settings.language === "ar"
                  ? "rotate-180"
                  : "rotate-0"
                : settings.language === "ar"
                  ? "rotate-0"
                  : "rotate-180"
            )}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Logo Area */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-900/50 flex items-center justify-center h-20 overflow-hidden">
          <AnimatePresence mode="wait">
            {isSidebarCollapsed ? (
              <motion.div
                key="mini-logo"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                م
              </motion.div>
            ) : (
              <motion.div
                key="full-logo"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="scale-90"
              >
                <Logo theme={isDark ? "dark" : "light"} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto no-scrollbar scroll-smooth">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const label = getItemLabel(item, settings.language);
            return (
                      <Link
                        key={item.id}
                        to={item.href}
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className={cn(
                          "flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all duration-300 relative group cursor-pointer",
                          isActive
                            ? "text-emerald-500 dark:text-emerald-400 font-semibold"
                            : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                        )}
                      >
                        {/* Active Highlight Background Pill */}
                        {isActive && (
                          <motion.div
                            layoutId="activeNavBackground"
                            transition={{ type: "spring", stiffness: 350, damping: 30 }}
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent border-r-2 border-emerald-500 rounded-xl"
                            style={{
                              transformOrigin: settings.language === "ar" ? "right" : "left",
                            }}
                          />
                        )}

                        <item.icon
                          className={cn(
                            "w-5 h-5 transition-transform duration-300 group-hover:scale-110 relative z-10 shrink-0",
                            isActive
                              ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                              : "text-zinc-500 group-hover:text-emerald-400"
                          )}
                        />

                        {!isSidebarCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: "auto" }}
                            exit={{ opacity: 0, width: 0 }}
                            className="font-medium text-[13px] tracking-tight relative z-10 whitespace-nowrap overflow-hidden"
                          >
                            {item.id === "MarketingCopilot"
                              ? settings.language === "ar"
                                ? "مساعد التسويق والعملاء"
                                : "Marketing Copilot"
                              : item.id === "Chat"
                                ? settings.language === "ar"
                                  ? "مركز الاتصال الموحد"
                                  : "Unified Communications"
                                : item.id === "Projects"
                                  ? settings.language === "ar"
                                    ? "إدارة المشاريع"
                                    : "Project Management"
                                  : item.id === "LeadGen"
                                    ? settings.language === "ar"
                                      ? "منصة توليد العملاء"
                                      : "Lead Generation Platform"
                                    : t(item.nameKey)}
                          </motion.span>
                        )}

                        {/* Collapsed Tooltip */}
                        {isSidebarCollapsed && (
                          <div
                            className={cn(
                              "absolute top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-lg text-xs opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 shadow-xl whitespace-nowrap",
                              settings.language === "ar" ? "right-16" : "left-16"
                            )}
                          >
                            {item.id === "Chat"
                                ? settings.language === "ar"
                                  ? "مركز الاتصال الموحد"
                                  : "Unified Communications"
                                : item.id === "Projects"
                                  ? settings.language === "ar"
                                    ? "إدارة المشاريع"
                                    : "Project Management"
                                  : item.id === "LeadGen"
                                    ? settings.language === "ar"
                                      ? "منصة توليد العملاء"
                                      : "Lead Generation Platform"
                                    : item.id === "MarketingCopilot"
                                      ? settings.language === "ar"
                                        ? "مساعد التسويق والعملاء"
                                        : "Marketing Copilot"
                                      : t(item.nameKey)}
                          </div>
                        )}
                      </Link>
                    );
                  })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900/50 space-y-2 bg-zinc-50/50 dark:bg-zinc-100/40">
          {user?.role === "Administrator" && (
            <Link
              to="/app/settings"
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 w-full rounded-xl transition-all duration-300 relative group text-xs font-semibold cursor-pointer",
                location.pathname === "/app/settings"
                  ? "text-emerald-500 dark:text-emerald-400"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              {location.pathname === "/app/settings" && (
                <motion.div
                  layoutId="activeNavBackground"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent border-r-2 border-emerald-500 rounded-xl"
                />
              )}
              <Settings
                className={cn(
                  "w-4 h-4 transition-transform duration-300 group-hover:rotate-45 relative z-10 shrink-0",
                  location.pathname === "/app/settings"
                    ? "text-emerald-400"
                    : "text-zinc-500 group-hover:text-emerald-400"
                )}
              />
              {!isSidebarCollapsed && (
                <span className="font-semibold relative z-10">{t("common.settings")}</span>
              )}
              {isSidebarCollapsed && (
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-lg text-xs opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 shadow-xl whitespace-nowrap",
                    settings.language === "ar" ? "right-16" : "left-16"
                  )}
                >
                  {t("common.settings")}
                </div>
              )}
            </Link>
          )}
        </div>
      </motion.aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
            />
            {/* Modal Drawer */}
            <motion.aside
              initial={{ x: settings.language === "ar" ? 280 : -280 }}
              animate={{ x: 0 }}
              exit={{ x: settings.language === "ar" ? 280 : -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 bottom-0 w-72 bg-white dark:bg-zinc-100 border-zinc-200 dark:border-zinc-900 h-full flex flex-col z-50 shadow-2xl lg:hidden",
                settings.language === "ar" ? "right-0 border-l" : "left-0 border-r"
              )}
            >
              <div
                className="p-6 border-b border-zinc-200 dark:border-zinc-900/50 flex justify-between items-center bg-white dark:bg-zinc-100 font-sans"
                dir={settings.language === "ar" ? "rtl" : "ltr"}
              >
                <Logo theme={isDark ? "dark" : "light"} />
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav
                className="flex-1 px-4 py-6 space-y-1 overflow-y-auto no-scrollbar scroll-smooth"
                dir={settings.language === "ar" ? "rtl" : "ltr"}
              >
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const label = getItemLabel(item, settings.language);
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative group text-sm font-semibold cursor-pointer",
                        isActive
                          ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/20"
                          : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                          isActive
                            ? "text-emerald-400"
                            : "text-zinc-500 group-hover:text-emerald-400"
                        )}
                      />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div
                className="p-4 border-t border-zinc-200 dark:border-zinc-900/50 space-y-2 bg-zinc-50 dark:bg-zinc-100"
                dir={settings.language === "ar" ? "rtl" : "ltr"}
              >
                {user?.role === "Administrator" && (
                  <Link
                    to="/app/settings"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 group text-xs font-semibold cursor-pointer",
                      location.pathname === "/app/settings"
                        ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/5 border border-emerald-500/20"
                        : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <Settings className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                    <span>{t("common.settings")}</span>
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-50 relative transition-colors duration-300">
        {/* Top Header */}
        <header className="h-16 md:h-20 border-b border-zinc-200 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-100/50 backdrop-blur-md flex items-center px-3 sm:px-6 md:px-8 justify-between gap-2 sm:gap-4 md:gap-8 z-10 shrink-0 transition-colors duration-300">
          {/* Mobile hamburger menu button & Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer shadow-sm"
              aria-label="Toggle Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="sm:hidden flex items-center gap-1.5">
              <Logo className="h-6 w-auto" />
            </div>
          </div>

          {/* Elegant Command Center (Desktop / Tablet) */}
          <div className="hidden md:flex flex-1 max-w-2xl relative items-center gap-3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none z-10">
                <Sparkles
                  className={cn(
                    "w-4 h-4 text-emerald-500 transition-all",
                    isProcessing && "animate-spin text-emerald-400"
                  )}
                />
              </div>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleCommand}
                placeholder={
                  isListening
                    ? t("layout.voice_placeholder_listening")
                    : t("layout.voice_placeholder")
                }
                className="w-full bg-zinc-100/60 dark:bg-zinc-100/60 hover:bg-zinc-200/50 dark:hover:bg-zinc-900/80 focus:bg-white dark:focus:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 focus:border-emerald-500/50 rounded-2xl py-3 pr-11 pl-4 focus:ring-4 focus:ring-emerald-500/10 transition-all text-[13px] placeholder:text-zinc-500 text-zinc-800 dark:text-zinc-100 font-medium shadow-inner shadow-black/5 dark:shadow-black/30 outline-none"
              />

              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.98 }}
                    className="absolute top-full mt-3 left-0 right-0 p-5 bg-white dark:bg-zinc-100/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 text-[13px] font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed"
                  >
                    <div className="flex justify-between items-center mb-3 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-500/20">
                        <Sparkles className="w-3.5 h-3.5" /> {t("layout.ai_assistant")}
                      </span>
                      <button
                        onClick={() => setAiResponse("")}
                        className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="whitespace-pre-line">{aiResponse}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Elegant Mic & Dialect Selector Panel */}
            <div className="relative flex items-center shrink-0">
              <div className="flex items-center bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-md">
                <button
                  onClick={handleMicClick}
                  className={cn(
                    "p-3.5 transition-all outline-none relative cursor-pointer",
                    isListening
                      ? "bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 animate-pulse"
                      : "hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400"
                  )}
                  title={t("layout.voice_tooltip")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" x2="12" y1="19" y2="22" />
                  </svg>

                  {/* Voice waveform animation bars when listening */}
                  {isListening && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-end gap-0.5 h-2 w-4">
                      <span
                        className="w-0.5 h-1 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0s" }}
                      />
                      <span
                        className="w-0.5 h-2 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-0.5 h-1.5 bg-rose-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  )}
                </button>
                <div className="w-[1px] h-6 bg-zinc-200 dark:bg-zinc-800"></div>
                <button
                  onClick={() => setShowDialects(!showDialects)}
                  className="p-3.5 hover:bg-zinc-200 dark:hover:bg-zinc-850 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors flex items-center justify-center outline-none cursor-pointer"
                  title={t("layout.select_dialect")}
                >
                  <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 px-1">
                    {dialects.find((d) => d.code === selectedDialect)?.label || "SA"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Dialects Dropdown */}
              <AnimatePresence>
                {showDialects && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2.5 w-44 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                  >
                    <div className="p-1.5 space-y-0.5">
                      {dialects.map((d) => (
                        <button
                          key={d.code}
                          onClick={() => {
                            setSelectedDialect(d.code);
                            setShowDialects(false);
                          }}
                          className={cn(
                            "w-full text-right px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-between cursor-pointer",
                            selectedDialect === d.code
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100"
                          )}
                        >
                          {d.label}
                          {selectedDialect === d.code && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 relative shrink-0">
            {/* Mobile Voice AI Quick Action Button */}
            <button
              onClick={handleMicClick}
              className={cn(
                "md:hidden p-2.5 rounded-xl border transition-all cursor-pointer",
                isListening
                  ? "bg-rose-500 text-white border-rose-500 animate-pulse"
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-emerald-500"
              )}
              title={settings.language === "ar" ? "المساعد الصوتي الذكي" : "Voice AI"}
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Seamless Language Toggle Button */}
            <button
              onClick={() => {
                const newLang = settings.language === "ar" ? "en" : "ar";
                updateSettings({ language: newLang });
                toast.success(
                  newLang === "ar" ? t("layout.switch_to_arabic") : t("layout.switch_to_english")
                );
              }}
              className="px-2.5 sm:px-4 py-2 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-100 text-xs font-black text-zinc-650 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1.5 outline-none shadow-sm"
              title={settings.language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-550 dark:text-zinc-400" />
              <span className="font-bold text-[11px] sm:text-xs">
                {settings.language === "ar" ? "EN" : "عربي"}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 transition-all cursor-pointer flex items-center justify-center outline-none shadow-sm active:scale-95 group"
              title={settings.language === "ar" ? "تغيير المظهر" : "Toggle Theme"}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform duration-500 group-hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 transition-transform duration-500 group-hover:-rotate-12" />
              )}
            </button>

            {/* Glowing Notifications Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 relative transition-all outline-none cursor-pointer shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-white dark:ring-zinc-900 animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute top-full mt-3 left-0 w-80 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[420px] shadow-black/10 dark:shadow-black/80"
                  >
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800/60 bg-zinc-50 dark:bg-zinc-100/50 flex justify-between items-center">
                      <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-100">
                        {t("layout.notifications")}
                      </h3>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full font-black border border-emerald-500/15">
                        {notifications.filter((n) => !n.isRead).length} {t("layout.new")}
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar max-h-[300px]">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-zinc-300 dark:text-zinc-800 mx-auto animate-pulse" />
                          <p className="text-xs text-zinc-500 font-semibold">
                            {t("layout.no_notifications")}
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={cn(
                              "p-4 border-b border-zinc-100 dark:border-zinc-800/40 hover:bg-zinc-50 dark:hover:bg-zinc-850/60 cursor-pointer transition-all relative",
                              !n.isRead
                                ? "bg-zinc-50 dark:bg-zinc-100/40 border-r-2 border-r-emerald-500"
                                : "bg-transparent dark:bg-zinc-100/10 opacity-70"
                            )}
                          >
                            <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-100 mb-1 flex items-center justify-between">
                              {n.title}
                              {!n.isRead && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              )}
                            </h4>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                              {n.message}
                            </p>
                            <p className="text-[8px] text-zinc-400 dark:text-zinc-600 mt-2 font-black tracking-widest">
                              {new Date(n.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-left rtl:text-right hidden md:block">
              <p className="text-[13px] font-bold text-zinc-800 dark:text-zinc-100 leading-tight">
                {(user?.role === "Administrator" ? settings.managerName : user?.name) ||
                  settings.managerName}
              </p>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest">
                {user?.role || "Administrator"}
              </p>
            </div>

            {/* User Profile and Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 group outline-none cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-emerald-500 transition-all shadow-md">
                  {(user?.role === "Administrator" ? settings.avatar : user?.avatar) ||
                  settings.avatar ? (
                    <img
                      src={
                        (user?.role === "Administrator" ? settings.avatar : user?.avatar) ||
                        settings.avatar
                      }
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 text-zinc-500 animate-pulse" />
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-zinc-500 transition-transform",
                    showProfileMenu && "rotate-180"
                  )}
                />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 15, scale: 0.95 }}
                    className="absolute top-full mt-3 left-0 w-52 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 z-[100]"
                  >
                    <div className="p-3 border-b border-zinc-200 dark:border-zinc-800 mb-1.5">
                      <p className="text-[10px] font-black text-zinc-450 dark:text-zinc-500 uppercase tracking-wider mb-1">
                        {t("layout.email")}
                      </p>
                      <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {user?.role === "Administrator" ? settings.email : user?.email}
                      </p>
                    </div>
                    <Link
                      to="/app/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-zinc-500" /> {t("layout.profile")}
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setShowProfileMenu(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-850 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-xl transition-colors"
                    >
                      <Settings className="w-4 h-4 text-zinc-500" /> {t("layout.preferences")}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-black text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4" /> {t("layout.logout")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Logout Shortcut */}
            <button
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 rounded-2xl border border-rose-200 dark:border-rose-950 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-150 transition-colors cursor-pointer shrink-0"
              title={t("layout.logout")}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Viewport Content with custom animations */}
        <div className={cn(
          "flex-1 relative z-0 pb-24 lg:pb-0",
          location.pathname === "/app/contracts" ? "overflow-hidden h-full w-full" : "overflow-y-auto p-2.5 sm:p-6 md:p-8"
        )}>
          {children}
        </div>

        {/* Native Mobile App Bottom Navigation Bar (YouTube / Facebook Style) */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 dark:bg-zinc-950/98 border-t border-zinc-200/80 dark:border-zinc-800/80 grid grid-cols-5 items-end justify-items-center h-16 pt-1 pb-safe px-1 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-black/80 lg:hidden select-none">
          <Link
            to="/app"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 transition-all cursor-pointer active:scale-95",
              location.pathname === "/app"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold tracking-tight">
              {settings.language === "ar" ? "الرئيسية" : "Home"}
            </span>
          </Link>

          <Link
            to="/app/crm"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 transition-all cursor-pointer active:scale-95",
              location.pathname === "/app/crm"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Users className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold tracking-tight">
              {settings.language === "ar" ? "العملاء" : "Clients"}
            </span>
          </Link>

          {/* Central AI Voice Mic Button */}
          <div className="flex items-center justify-center w-full">
            <button
              onClick={handleMicClick}
              className={cn(
                "flex flex-col items-center justify-center -mt-5 w-11 h-11 rounded-full text-white shadow-lg shadow-emerald-500/30 transition-all cursor-pointer border-2 border-white dark:border-zinc-950 active:scale-90",
                isListening
                  ? "bg-rose-500 ring-4 ring-rose-500/30 animate-pulse"
                  : "bg-emerald-500"
              )}
              title={settings.language === "ar" ? "المساعد الصوتي" : "Voice AI"}
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          <Link
            to="/app/chat"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 transition-all cursor-pointer active:scale-95 relative",
              location.pathname === "/app/chat"
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold tracking-tight">
              {settings.language === "ar" ? "الدردشة" : "Chat"}
            </span>
          </Link>

          <button
            onClick={() => setIsMobileMoreSheetOpen(true)}
            className={cn(
              "flex flex-col items-center justify-center w-full py-1 transition-all cursor-pointer active:scale-95",
              isMobileMoreSheetOpen
                ? "text-emerald-600 dark:text-emerald-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            )}
          >
            <Grid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-extrabold tracking-tight">
              {settings.language === "ar" ? "المزيد" : "More"}
            </span>
          </button>
        </nav>

        {/* Mobile Launcher Drawer Sheet ("المزيد") */}
        <AnimatePresence>
          {isMobileMoreSheetOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMoreSheetOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 220 }}
                className="fixed bottom-0 left-0 right-0 max-h-[88vh] bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-zinc-200 dark:border-zinc-800 z-50 overflow-hidden flex flex-col shadow-2xl lg:hidden"
              >
                {/* Drag handle */}
                <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto my-3 shrink-0" />

                {/* Header */}
                <div className="px-5 pb-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      {settings.language === "ar" ? "تطبيقات وأقسام المنظومة" : "BizOS Applications"}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {settings.language === "ar" ? "وصول سريع لكافة الأنظمة والأدوات" : "Quick access to all modules"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsMobileMoreSheetOpen(false)}
                    className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Search & Categories */}
                <div className="p-4 space-y-3 bg-zinc-50 dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="relative">
                    <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={mobileAppSearch}
                      onChange={(e) => setMobileAppSearch(e.target.value)}
                      placeholder={settings.language === "ar" ? "ابحث عن تطبيق أو قسم..." : "Search apps..."}
                      className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    {mobileCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setMobileCategoryFilter(cat.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer",
                          mobileCategoryFilter === cat.id
                            ? "bg-emerald-500 text-white shadow-sm"
                            : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                        )}
                      >
                        {settings.language === "ar" ? cat.labelAr : cat.labelEn}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid list of apps */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 no-scrollbar">
                  {allMobileApps
                    .filter((app) => {
                      const matchesCategory =
                        mobileCategoryFilter === "all" || app.category === mobileCategoryFilter;
                      const matchesSearch =
                        !mobileAppSearch ||
                        app.nameAr.includes(mobileAppSearch) ||
                        app.nameEn.toLowerCase().includes(mobileAppSearch.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map((app) => (
                      <Link
                        key={app.id}
                        to={app.href}
                        onClick={() => {
                          setIsMobileMoreSheetOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 hover:border-emerald-500 transition-all text-center group cursor-pointer active:scale-95"
                      >
                        <div className={cn("p-2.5 rounded-xl border mb-2 group-hover:scale-110 transition-transform", app.color)}>
                          <app.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 line-clamp-1">
                          {settings.language === "ar" ? app.nameAr : app.nameEn}
                        </span>
                      </Link>
                    ))}
                </div>

                {/* Footer Quick Settings */}
                <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-around shrink-0 text-xs font-bold">
                  <button
                    onClick={() => {
                      const newLang = settings.language === "ar" ? "en" : "ar";
                      updateSettings({ language: newLang });
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                  >
                    <Globe className="w-4 h-4 text-emerald-500" />
                    <span>{settings.language === "ar" ? "English" : "العربية"}</span>
                  </button>

                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    <span>{isDark ? "مظهر فاتح" : "مظهر داكن"}</span>
                  </button>

                  <Link
                    to="/app/settings"
                    onClick={() => setIsMobileMoreSheetOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200"
                  >
                    <Settings className="w-4 h-4 text-emerald-500" />
                    <span>{t("common.settings")}</span>
                  </Link>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
