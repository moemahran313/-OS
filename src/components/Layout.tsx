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
  { nameKey: "sidebar.zatca_ai", id: "ZatcaAi", href: "/app/zatca-ai", icon: Sparkles },
  {
    nameKey: "sidebar.negotiations",
    id: "SmartNegotiations",
    href: "/app/smart-negotiations",
    icon: Video,
  },
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

const navigationGroups = [
  {
    id: "core",
    titleAr: "التحكم",
    titleEn: "Core",
    itemIds: ["Dashboard", "Chat", "Projects"],
  },
  {
    id: "crm",
    titleAr: "العملاء",
    titleEn: "CRM",
    itemIds: ["CRM", "Suppliers"],
  },
  {
    id: "accounting",
    titleAr: "المالية",
    titleEn: "Accounting",
    itemIds: ["Accounting", "Invoices", "Payroll", "ZatcaAi"],
  },
  {
    id: "operations",
    titleAr: "العمليات",
    titleEn: "Operations",
    itemIds: ["Inventory", "Contracts", "Compliance"],
  },
  {
    id: "tools",
    titleAr: "أدوات متقدمة",
    titleEn: "Advanced Tools",
    itemIds: ["MarketingCopilot", "SmartNegotiations", "Workflows", "Analytics", "Calculations", "Integrations", "Support"],
  },
];

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
      item.id === "SmartNegotiations" ||
      item.id === "Chat" ||
      item.id === "Projects" ||
      item.id === "MarketingCopilot" ||
      hasPermission(item.id)
  );

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  const pinnedGroups = [
    {
      id: "pinned_core",
      titleAr: "الرئيسية والمحادثة",
      titleEn: "Core & Chat",
      items: filteredNavigation.filter((item) => ["Dashboard", "Chat"].includes(item.id)),
    },
    {
      id: "pinned_finance",
      titleAr: "المالية والأعمال",
      titleEn: "Finance & CRM",
      items: filteredNavigation.filter((item) => ["CRM", "Invoices", "Accounting", "Payroll", "ZatcaAi"].includes(item.id)),
    },
  ].filter(g => g.items.length > 0);

  const drawerGroups = [
    {
      id: "ops_and_projects",
      titleAr: "العمليات والمشاريع",
      titleEn: "Operations & Projects",
      items: filteredNavigation.filter((item) => ["Projects", "Inventory", "Suppliers", "Contracts"].includes(item.id)),
    },
    {
      id: "advanced_ai_tools",
      titleAr: "الذكاء الاصطناعي والتسويق",
      titleEn: "AI Assistants & Marketing",
      items: filteredNavigation.filter((item) => ["MarketingCopilot", "SmartNegotiations", "Workflows"].includes(item.id)),
    },
    {
      id: "gov_compliance",
      titleAr: "الامتثال والتحليلات",
      titleEn: "Compliance & Utilities",
      items: filteredNavigation.filter((item) => ["Compliance", "Calculations", "Integrations", "Analytics", "Support"].includes(item.id)),
    },
  ].filter(g => g.items.length > 0);

  const groupedNavigation = pinnedGroups;

  // Auto-expand group containing active route on mount/location change
  React.useEffect(() => {
    const updates: Record<string, boolean> = {};
    let changed = false;
    groupedNavigation.forEach((group) => {
      const hasActiveChild = group.items.some((item) => location.pathname === item.href);
      if (hasActiveChild && collapsedGroups[group.id] !== false) {
        updates[group.id] = false;
        changed = true;
      }
    });
    if (changed) {
      setCollapsedGroups((prev) => ({
        ...prev,
        ...updates,
      }));
    }
  }, [location.pathname]);

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
        <nav className="flex-1 px-3 py-6 space-y-3 overflow-y-auto no-scrollbar scroll-smooth">
          {groupedNavigation.map((group, groupIndex) => {
            const isGroupCollapsed = !!collapsedGroups[group.id];
            return (
              <div key={group.id} className="space-y-1">
                {/* Group Header */}
                {!isSidebarCollapsed ? (
                  <div
                    onClick={() => toggleGroup(group.id)}
                    className="flex items-center justify-between px-3.5 pt-3 pb-1.5 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors select-none group/hdr"
                  >
                    <span>{settings.language === "ar" ? group.titleAr : group.titleEn}</span>
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover/hdr:text-emerald-500",
                        isGroupCollapsed ? "-rotate-90 rtl:rotate-90" : "rotate-0"
                      )}
                    />
                  </div>
                ) : (
                  groupIndex > 0 && (
                    <div className="h-[1px] bg-zinc-200/40 dark:bg-zinc-100/40 my-2 mx-1" />
                  )
                )}

                {/* Group Items container */}
                <motion.div
                  initial={false}
                  animate={{
                    height: !isSidebarCollapsed && isGroupCollapsed ? 0 : "auto",
                    opacity: !isSidebarCollapsed && isGroupCollapsed ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
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
                            {item.id === "SmartNegotiations"
                              ? settings.language === "ar"
                                ? "التفاوض والاجتماعات"
                                : "Smart Negotiations"
                              : item.id === "MarketingCopilot"
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
                            {item.id === "SmartNegotiations"
                              ? settings.language === "ar"
                                ? "التفاوض والاجتماعات"
                                : "Smart Negotiations"
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
                </motion.div>
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-900/50 space-y-2 bg-zinc-50/50 dark:bg-zinc-100/40">
          {/* Toggle Tools & Settings Drawer */}
          <button
            onClick={() => setIsToolsDrawerOpen(!isToolsDrawerOpen)}
            className={cn(
              "flex items-center gap-3 px-3.5 py-3 w-full rounded-xl transition-all duration-300 relative group text-xs font-black cursor-pointer",
              isToolsDrawerOpen
                ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20"
                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            <Blocks className="w-4 h-4 shrink-0 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
            {!isSidebarCollapsed && (
              <span className="whitespace-nowrap">
                {settings.language === "ar" ? "أدوات متقدمة وإضافية" : "Advanced Tools Drawer"}
              </span>
            )}
            {isSidebarCollapsed && (
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-800 text-zinc-100 px-3 py-1.5 rounded-lg text-xs opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 z-50 shadow-xl whitespace-nowrap",
                  settings.language === "ar" ? "right-16" : "left-16"
                )}
              >
                {settings.language === "ar" ? "أدوات متقدمة وإضافية" : "Advanced Tools"}
              </div>
            )}
          </button>

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

      {/* Sliding Advanced Tools Drawer */}
      <AnimatePresence>
        {isToolsDrawerOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsToolsDrawerOpen(false)}
              className="fixed inset-0 bg-zinc-950/25 dark:bg-zinc-950/40 backdrop-blur-[1px] z-10 animate-fade-in"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: settings.language === "ar" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: settings.language === "ar" ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className={cn(
                "fixed top-0 bottom-0 w-80 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-zinc-200 dark:border-zinc-800 shadow-2xl z-30 flex flex-col p-6 text-right",
                settings.language === "ar" ? "right-0 border-l" : "left-0 border-r"
              )}
            >
              <div className="flex items-center justify-between pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <button
                  onClick={() => setIsToolsDrawerOpen(false)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 text-zinc-400" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                    {settings.language === "ar" ? "الأدوات والإعدادات الإضافية" : "Advanced Tools & Settings"}
                  </span>
                  <Blocks className="w-4 h-4 text-emerald-500" />
                </div>
              </div>

              {/* Drawer tools listing */}
              <div className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-6">
                {drawerGroups.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <h5 className="px-2 text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {settings.language === "ar" ? group.titleAr : group.titleEn}
                    </h5>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.id}
                          to={item.href}
                          onClick={() => {
                            setIsToolsDrawerOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800/60",
                            location.pathname === item.href
                              ? "text-emerald-500 dark:text-emerald-400 font-bold"
                              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-100"
                          )}
                        >
                          <item.icon className="w-4.5 h-4.5 shrink-0 text-zinc-400" />
                          <span>
                            {item.id === "SmartNegotiations"
                              ? settings.language === "ar"
                                ? "التفاوض والاجتماعات"
                                : "Smart Negotiations"
                              : item.id === "MarketingCopilot"
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
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
                className="flex-1 px-4 py-6 space-y-3 overflow-y-auto no-scrollbar scroll-smooth"
                dir={settings.language === "ar" ? "rtl" : "ltr"}
              >
                {groupedNavigation.map((group) => {
                  const isGroupCollapsed = !!collapsedGroups[group.id];
                  return (
                    <div key={group.id} className="space-y-1">
                      {/* Group Header */}
                      <div
                        onClick={() => toggleGroup(group.id)}
                        className="flex items-center justify-between px-4 pt-3 pb-1.5 text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors select-none group/hdr"
                      >
                        <span>{settings.language === "ar" ? group.titleAr : group.titleEn}</span>
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 text-zinc-400 dark:text-zinc-500 transition-transform duration-200 group-hover/hdr:text-emerald-500",
                            isGroupCollapsed ? "-rotate-90 rtl:rotate-90" : "rotate-0"
                          )}
                        />
                      </div>

                      {/* Group Items */}
                      <motion.div
                        initial={false}
                        animate={{
                          height: isGroupCollapsed ? 0 : "auto",
                          opacity: isGroupCollapsed ? 0 : 1,
                        }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1 overflow-hidden"
                      >
                        {group.items.map((item) => {
                          const isActive = location.pathname === item.href;
                          return (
                            <Link
                              key={item.id}
                              to={item.href}
                              onClick={() => {
                                setMobileSidebarOpen(false);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group text-sm font-semibold cursor-pointer",
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
                              <span>
                                {item.id === "SmartNegotiations"
                                  ? settings.language === "ar"
                                    ? "التفاوض والاجتماعات"
                                    : "Smart Negotiations"
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
                                        : item.id === "EmailMarketing"
                                          ? settings.language === "ar"
                                            ? "التسويق والبريد الإلكتروني"
                                            : "Email Marketing & Growth"
                                          : item.id === "SocialMedia"
                                            ? settings.language === "ar"
                                              ? "إدارة التواصل الاجتماعي"
                                              : "Social Media & Growth"
                                            : item.id === "Advertising"
                                              ? settings.language === "ar"
                                                ? "إدارة الحملات الإعلانية"
                                                : "Advertising & Copilot"
                                              : t(item.nameKey)}
                              </span>
                            </Link>
                          );
                        })}
                      </motion.div>
                    </div>
                  );
                })}

                {/* Mobile Drawer Trigger */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                  <button
                    onClick={() => {
                      setMobileSidebarOpen(false);
                      setIsToolsDrawerOpen(true);
                    }}
                    className="flex items-center justify-between w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 rounded-xl text-sm font-black text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:text-emerald-600 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Blocks className="w-5 h-5 text-emerald-500" />
                      <span>{settings.language === "ar" ? "أدوات متقدمة وإضافية" : "Advanced Tools & Settings"}</span>
                    </div>
                    <ChevronDown className="-rotate-90 rtl:rotate-90 w-4 h-4 text-zinc-400" />
                  </button>
                </div>
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
        <header className="h-20 border-b border-zinc-200 dark:border-zinc-900/60 bg-white/80 dark:bg-zinc-100/50 backdrop-blur-md flex items-center px-4 md:px-8 justify-between gap-4 md:gap-8 z-10 shrink-0 transition-colors duration-300">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 lg:hidden cursor-pointer shadow-sm"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Elegant Command Center */}
          <div className="flex-1 max-w-2xl relative flex items-center gap-3">
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

          <div className="flex items-center gap-4 relative">
            {/* Seamless Language Toggle Button */}
            <button
              onClick={() => {
                const newLang = settings.language === "ar" ? "en" : "ar";
                updateSettings({ language: newLang });
                toast.success(
                  newLang === "ar" ? t("layout.switch_to_arabic") : t("layout.switch_to_english")
                );
              }}
              className="px-4 py-2 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-100 text-xs font-black text-zinc-650 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 hover:border-emerald-500/20 transition-all cursor-pointer flex items-center gap-2 outline-none shadow-sm"
              title={settings.language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
            >
              <Globe className="w-4 h-4 text-zinc-550 dark:text-zinc-400 group-hover:animate-spin" />
              <span className="font-bold">
                {settings.language === "ar" ? "English" : "العربية"}
              </span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-2xl border border-zinc-200 dark:border-zinc-850 bg-zinc-100 dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-zinc-200 dark:hover:bg-zinc-850 transition-all cursor-pointer flex items-center justify-center outline-none shadow-sm active:scale-95 group"
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
          "flex-1 relative z-0",
          location.pathname === "/app/contracts" ? "overflow-hidden h-full w-full" : "overflow-y-auto p-4 md:p-8"
        )}>
          {children}
        </div>
      </main>
    </div>
  );
}
