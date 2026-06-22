import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Logo } from "@/src/components/Logo";
import { motion, AnimatePresence } from "motion/react";
import { processBusinessCommand } from "@/src/services/aiService";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useUser } from "@/src/contexts/UserContext";
import { LogOut, ChevronDown, User as UserIcon, Bell, Globe, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";
import { useTranslation } from "react-i18next";

const navigationData = [
  { nameKey: "dashboard", id: "Dashboard", href: "/app", icon: LayoutDashboard },
  { nameKey: "sidebar.employees", id: "CRM", href: "/app/crm", icon: Users },
  { nameKey: "sidebar.suppliers", id: "Suppliers", href: "/app/suppliers", icon: Truck },
  { nameKey: "sidebar.contracts", id: "Contracts", href: "/app/contracts", icon: FileSignature },
  { nameKey: "sidebar.negotiations", id: "SmartNegotiations", href: "/app/smart-negotiations", icon: Video },
  { nameKey: "workflows", id: "Workflows", href: "/app/workflows", icon: Blocks },
  { nameKey: "sidebar.employees", id: "Compliance", href: "/app/fwcos", icon: ShieldCheck },
  { nameKey: "sidebar.home", id: "Simulator", href: "/app/simulator", icon: Calculator },
  { nameKey: "common.dashboard", id: "Calculations", href: "/app/calculations", icon: Calculator },
  { nameKey: "common.invoices", id: "Invoices", href: "/app/invoices", icon: FileText },
  { nameKey: "sidebar.integrations", id: "Integrations", href: "/app/integrations", icon: Blocks },
  { nameKey: "common.payroll", id: "Payroll", href: "/app/payroll", icon: CreditCard },
  { nameKey: "sidebar.analytics", id: "Analytics", href: "/app/analytics", icon: BarChart3 },
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
          "Authorization": `Bearer ${token}`
        }
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
          "Authorization": `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
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
      alert("عذراً، متصفحك لا يدعم التعرف على الصوت.");
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
      if (event.error === 'not-allowed') {
        toast.error("يرجى السماح بالوصول إلى الميكروفون، أو فتح التطبيق في نافذة جديدة.");
      } else {
        toast.error("حدث خطأ في التعرف على الصوت. الرجاء المحاولة مرة أخرى.");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const filteredNavigation = navigationData.filter(item => item.id === "SmartNegotiations" || hasPermission(item.id));

  const handleCommand = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && command.trim()) {
      setIsProcessing(true);
      const result = await processBusinessCommand(command, settings.language);
      setAiResponse(result || "");
      setIsProcessing(false);
      setCommand("");
    }
  };

  return (
    <div
      className="flex h-screen bg-zinc-50 font-sans overflow-hidden"
      dir={settings.language === "ar" ? "rtl" : "ltr"}
    >
      {/* Desktop Sidebar */}
      <aside className={cn(
        "w-64 glass h-full flex flex-col z-20 hidden lg:flex shrink-0", 
        settings.language === 'ar' ? "border-l border-zinc-200" : "border-r border-zinc-200"
      )}>
        <div className="p-6 border-b border-zinc-100 flex justify-center">
          <Logo />
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scroll-smooth">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.id}
                to={item.href}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <item.icon
                  className={cn(
                    "w-5 h-5",
                    isActive
                      ? "text-white"
                      : "group-hover:text-primary transition-colors",
                  )}
                />
                <span className="font-medium">
                  {item.id === "SmartNegotiations"
                    ? (settings.language === "ar" ? "التفاوض والاجتماعات" : "Smart Negotiations")
                    : t(item.nameKey)}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-100 space-y-2">
          {user?.role === "Administrator" && (
            <Link
              to="/app/settings"
              className={cn(
                "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 group text-sm",
                location.pathname === "/app/settings"
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
              )}
            >
              <Settings className="w-4 h-4" />
              <span className="font-medium">{t("common.settings")}</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 lg:hidden"
            />
            {/* Modal Drawer */}
            <motion.aside
              initial={{ x: settings.language === 'ar' ? 260 : -260 }}
              animate={{ x: 0 }}
              exit={{ x: settings.language === 'ar' ? 260 : -260 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={cn(
                "fixed top-0 bottom-0 w-64 bg-white h-full flex flex-col z-50 shadow-2xl lg:hidden",
                settings.language === 'ar' ? "right-0 border-l border-zinc-200 shadow-[-10px_0_30px_rgba(0,0,0,0.15)]" : "left-0 border-r border-zinc-200 shadow-[10px_0_30px_rgba(0,0,0,0.15)]"
              )}
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 font-sans" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-500 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scroll-smooth" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                {filteredNavigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.id}
                      to={item.href}
                      onClick={() => {
                        setMobileSidebarOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-sm",
                        isActive
                          ? "bg-primary text-white shadow-md shadow-primary/10"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0",
                          isActive
                            ? "text-white"
                            : "group-hover:text-primary transition-colors",
                        )}
                      />
                      <span className="font-semibold">
                        {item.id === "SmartNegotiations"
                          ? (settings.language === "ar" ? "التفاوض والاجتماعات" : "Smart Negotiations")
                          : t(item.nameKey)}
                      </span>
                    </Link>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-zinc-100 space-y-2 bg-zinc-50/50" dir={settings.language === 'ar' ? 'rtl' : 'ltr'}>
                {user?.role === "Administrator" && (
                  <Link
                    to="/app/settings"
                    onClick={() => setMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all duration-200 group text-sm",
                      location.pathname === "/app/settings"
                        ? "bg-zinc-900 text-white shadow-md"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                    )}
                  >
                    <Settings className="w-4 h-4" />
                    <span className="font-semibold">{t("common.settings")}</span>
                  </Link>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 md:h-20 glass border-b border-zinc-200 flex items-center px-4 md:px-8 justify-between gap-3 md:gap-8 z-10 shrink-0">
          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 -mr-1 rounded-xl text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 lg:hidden cursor-pointer"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 max-w-2xl relative group flex items-center gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Sparkles
                  className={cn(
                    "w-5 h-5 text-primary",
                    isProcessing && "animate-spin",
                  )}
                />
              </div>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleCommand}
                placeholder={isListening ? "جاري الاستماع..." : "اسأل مدارج... (مثلاً: 'انشئ فاتورة لأحمد' أو 'أرني مبيعات الشهر')"}
                className="w-full bg-zinc-100 border-none rounded-2xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all text-sm placeholder:text-zinc-400 font-medium"
              />

              <AnimatePresence>
                {aiResponse && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full mt-2 left-0 right-0 p-4 glass rounded-2xl shadow-xl z-50 text-sm font-medium text-zinc-800 leading-relaxed"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> مساعد مدارج الذكي
                      </span>
                      <button
                        onClick={() => setAiResponse("")}
                        className="text-zinc-400 hover:text-zinc-900 transition-colors text-xs"
                      >
                        إغلاق
                      </button>
                    </div>
                    {aiResponse}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mic and Dialect Button */}
            <div className="relative">
              <div className="flex items-center bg-zinc-100 rounded-2xl border border-zinc-200">
                <button
                  onClick={handleMicClick}
                  className={cn("p-3 rounded-r-2xl transition-all", isListening ? "bg-rose-100 text-rose-600 animate-pulse" : "hover:bg-zinc-200 text-zinc-500")}
                  title="تحدث مع مدارج"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                </button>
                <div className="w-[1px] h-6 bg-zinc-300"></div>
                <button
                  onClick={() => setShowDialects(!showDialects)}
                  className="p-3 rounded-l-2xl hover:bg-zinc-200 text-zinc-500 flex items-center gap-1"
                  title="اختر اللهجة"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <AnimatePresence>
                {showDialects && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 mt-2 w-40 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="p-1">
                      {dialects.map((d) => (
                        <button
                          key={d.code}
                          onClick={() => { setSelectedDialect(d.code); setShowDialects(false); }}
                          className={cn("w-full text-right px-3 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-between", selectedDialect === d.code ? "bg-primary/10 text-primary" : "text-zinc-700 hover:bg-zinc-50")}
                        >
                          {d.label}
                          {selectedDialect === d.code && <CheckCircle2 className="w-3 h-3" />}
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
                toast.success(newLang === "ar" ? "تم تحويل لغة النظام إلى العربية" : "System language switched to English");
              }}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-black text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300 transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              title={settings.language === "ar" ? "Switch to English" : "تغيير إلى العربية"}
            >
              <Globe className="w-3.5 h-3.5 text-zinc-500 animate-pulse" />
              <span>{settings.language === "ar" ? "English" : "العربية"}</span>
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl hover:bg-zinc-100 text-zinc-500 relative transition-all outline-none"
              >
                <Bell className="w-5 h-5 text-zinc-600" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full mt-2 left-0 w-80 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[400px]"
                  >
                    <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                      <h3 className="text-sm font-black text-zinc-900">التنبيهات</h3>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                        {notifications.filter(n => !n.isRead).length} غير مقروءة
                      </span>
                    </div>
                    <div className="flex-1 overflow-y-auto no-scrollbar">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                          <CheckCircle2 className="w-8 h-8 text-zinc-200 mx-auto" />
                          <p className="text-xs text-zinc-400 font-medium tracking-tight">لا توجد تنبيهات حالية</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={cn(
                              "p-4 border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer transition-colors relative",
                              !n.isRead && "bg-white"
                            )}
                          >
                            {!n.isRead && <div className="absolute top-4 right-2 w-1.5 h-1.5 bg-primary rounded-full"></div>}
                            <h4 className="text-xs font-black text-zinc-900 mb-1">{n.title}</h4>
                            <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">{n.message}</p>
                            <p className="text-[9px] text-zinc-300 mt-2 font-bold uppercase tracking-widest">
                              {new Date(n.createdAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link to="/app/settings" className="text-left rtl:text-right hidden md:block hover:opacity-80 transition-opacity">
              <p className="text-sm font-bold text-zinc-900 leading-tight">{(user?.role === "Administrator" ? settings.managerName : user?.name) || settings.managerName}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{user?.role || "Administrator"}</p>
            </Link>
            
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 group outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden group-hover:border-primary transition-all">
                {(user?.role === "Administrator" ? settings.avatar : user?.avatar) || settings.avatar ? (
                  <img src={(user?.role === "Administrator" ? settings.avatar : user?.avatar) || settings.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5 text-zinc-400" />
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-zinc-400 transition-transform", showProfileMenu && "rotate-180")} />
            </button>
            <button 
              onClick={() => logout()}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 left-0 w-48 glass rounded-xl shadow-2xl p-2 z-[100]"
                >
                  <div className="p-2 border-b border-zinc-100 mb-1">
                    <p className="text-xs font-bold text-zinc-900">{user?.role === 'Administrator' ? settings.email : user?.email}</p>
                  </div>
                  <Link 
                    to="/app/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <UserIcon className="w-4 h-4" /> الملف الشخصي
                  </Link>
                  <Link 
                    to="/app/settings" 
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-50 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" /> التفضيلات
                  </Link>
                  <button 
                    onClick={() => { logout(); setShowProfileMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors mt-1"
                  >
                    <LogOut className="w-4 h-4" /> تسجيل الخروج
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
