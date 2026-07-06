import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Bell,
  Lock,
  Key,
  ShieldCheck,
  Mail,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Save,
  Palette,
  User,
  History,
  FileText,
  Clock,
  Eye,
  AtSign,
  Search,
  Sparkles,
  Users,
  Copy,
  MessageSquare,
  MessageCircle,
  Camera,
  Monitor,
  Code2,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useSettings } from "../contexts/SettingsContext";
import { useUser } from "../contexts/UserContext";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import SecurityCompliance from "./SecurityCompliance";
import DeveloperTools from "./DeveloperTools";
import MobileSimulator from "../components/MobileSimulator";
import MultiTenancySettings from "../components/MultiTenancySettings";
import AIPromptLibrary from "../components/AIPromptLibrary";

export default function Settings() {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const { user, updateProfile } = useUser();
  const [activeTab, setActiveTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingEmail, setTestingEmail] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [expiringContractsCount, setExpiringContractsCount] = useState<number | null>(null);

  // Referral Program states
  const [referralStats, setReferralStats] = useState<any>({
    referralCode: "",
    rewardPreference: "discount",
    discountEarnedSar: 0,
    trialExtensionDays: 0,
    history: [],
  });
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [customCode, setCustomCode] = useState("");
  const [updatingCode, setUpdatingCode] = useState(false);
  const [updatingPreference, setUpdatingPreference] = useState(false);
  const [simulationName, setSimulationName] = useState("");
  const [simulationEmail, setSimulationEmail] = useState("");
  const [simulating, setSimulating] = useState(false);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);

  const fetchReferralStats = async () => {
    setLoadingReferrals(true);
    try {
      const res = await fetch("/api/referrals/my-stats");
      if (res.ok) {
        const data = await res.json();
        setReferralStats(data);
        setCustomCode(data.referralCode || "");
      }
    } catch (err) {
      console.error("Error fetching referral stats:", err);
    } finally {
      setLoadingReferrals(false);
    }
  };

  const handleSaveCustomCode = async () => {
    if (!customCode.trim()) {
      toast.error("الرجاء إدخال الرمز الحصري أولاً.");
      return;
    }
    setUpdatingCode(true);
    try {
      const res = await fetch("/api/referrals/generate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setReferralStats((prev: any) => ({ ...prev, referralCode: data.referralCode }));
        toast.success("تم تحديث رمز الإحالة المخصص بنجاح! 🎉");
      } else {
        toast.error(data.error || "فشل تحديث رمز الإحالة.");
      }
    } catch (err) {
      console.error("Error updating referral code:", err);
      toast.error("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setUpdatingCode(false);
    }
  };

  const handleUpdateRewardPreference = async (pref: "discount" | "trial") => {
    setUpdatingPreference(true);
    try {
      const res = await fetch("/api/referrals/update-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: pref }),
      });
      const data = await res.json();
      if (res.ok) {
        setReferralStats((prev: any) => ({ ...prev, rewardPreference: pref }));
        toast.success(
          `تم تغيير نوع المكافأة المفضلة إلى ${pref === "trial" ? "تمديد الفترة التجريبية" : "خصم مالي"}! 🎁`
        );
      } else {
        toast.error(data.error || "فشل تحديث تفضيلات المكافأة.");
      }
    } catch (err) {
      console.error("Error updating preference:", err);
    } finally {
      setUpdatingPreference(false);
    }
  };

  const handleSimulateSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationName.trim() || !simulationEmail.trim()) {
      toast.error("الرجاء إدخال الاسم والبريد الإلكتروني لتجربة المحاكاة.");
      return;
    }
    setSimulating(true);
    try {
      const res = await fetch("/api/referrals/simulate-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: simulationName,
          email: simulationEmail,
          referrerCode: referralStats.referralCode,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`محاكاة ناجحة! 🎉 سجل ${simulationName} كصديق محال ومُنحت المكافأة فوراً!`);
        setSimulationName("");
        setSimulationEmail("");
        fetchReferralStats();
      } else {
        toast.error(data.error || "فشل محاكاة التسجيل.");
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulatePayment = async (referredUserId: string) => {
    setPaymentLoadingId(referredUserId);
    try {
      const res = await fetch("/api/referrals/simulate-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referredUserId }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("تمت محاكاة أول دفعة بنجاح! تم مضاعفة مكافآتك! 💳🔥");
        fetchReferralStats();
      } else {
        toast.error(data.error || "فشل محاكاة الدفع.");
      }
    } catch (err) {
      console.error("Simulation payment error:", err);
    } finally {
      setPaymentLoadingId(null);
    }
  };

  // Local state for the form so we don't update on every keystroke
  const [formData, setFormData] = useState({
    emailNotif_newLeads: "immediately",
    emailNotif_invoiceReminders: "daily",
    emailNotif_payrollSummaries: "weekly",
    autoReminders_email: true,
    reminderDays_before: 2,
    reminderDays_after: 3,
    zapierWebhookNewLead: "",
    zapierWebhookInvoicePaid: "",
    slackWebhookUrl: "",
    ...settings,
  });

  // Keep formData in sync with settings when they load from DB/Context
  useEffect(() => {
    const timer = setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        ...settings,
        // preserve notification toggles if they exist in settings
        emailNotif_newLeads: (settings as any).emailNotif_newLeads ?? prev.emailNotif_newLeads,
        emailNotif_invoiceReminders:
          (settings as any).emailNotif_invoiceReminders ?? prev.emailNotif_invoiceReminders,
        emailNotif_payrollSummaries:
          (settings as any).emailNotif_payrollSummaries ?? prev.emailNotif_payrollSummaries,
      }));
    }, 0);
    return () => clearTimeout(timer);
  }, [settings]);

  const calculateExpiring = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "employees"), where("userId", "==", user.uid));
      const snap = await getDocs(q);
      const today = new Date();
      let count = 0;
      snap.docs.forEach((doc) => {
        const emp = doc.data();
        const endDateStr = emp.customFields?.contractEndDate;
        if (endDateStr) {
          const endDate = new Date(endDateStr);
          const diffTime = endDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= formData.contractReminderDays && diffDays >= 0) {
            count++;
          }
        }
      });
      setExpiringContractsCount(count);
    } catch (e) {
      console.error("Failed to calculate expiring contracts:", e);
      setExpiringContractsCount(0);
    }
  };

  useEffect(() => {
    if (activeTab === "notifications" && formData.contractEndReminder) {
      const timer = setTimeout(() => {
        calculateExpiring();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [formData.contractReminderDays, formData.contractEndReminder, activeTab]);

  const tabs = [
    { id: "profile", label: t("settings.tabs.profile", "الملف الشخصي والشركة"), icon: Building2 },
    {
      id: "organizations",
      label: t("settings.tabs.organizations", "المنظمات والربط المؤسسي"),
      icon: Building2,
    },
    { id: "notifications", label: t("settings.tabs.notifications", "التنبيهات"), icon: Bell },
    { id: "security", label: t("settings.tabs.security", "الأمان والربط"), icon: ShieldCheck },
    { id: "appearance", label: t("settings.tabs.appearance", "المظهر"), icon: Palette },
    { id: "email", label: t("settings.tabs.email", "إعدادات البريد"), icon: Mail },
    { id: "reminders", label: t("settings.tabs.reminders", "تذكيرات تلقائية"), icon: Smartphone },
    { id: "audit", label: t("settings.tabs.audit", "سجل العمليات"), icon: History },
    { id: "payment", label: t("settings.tabs.payment", "بوابات الدفع"), icon: Lock },
    { id: "referrals", label: t("settings.tabs.referrals", "برنامج الإحالة"), icon: Users },
    {
      id: "compliance",
      label: t("settings.tabs.compliance", "الامتثال والأمان المتقدم"),
      icon: ShieldCheck,
    },
    {
      id: "ai_prompts",
      label: t("settings.tabs.ai_prompts", "موجهات الذكاء الاصطناعي"),
      icon: Sparkles,
    },
    { id: "developer", label: t("settings.tabs.developer", "أدوات المطورين"), icon: Code2 },
    { id: "mobile", label: t("settings.tabs.mobile", "تطبيق الجوال والتحكم"), icon: Smartphone },
  ];

  const fetchAuditLogs = async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const q = query(
        collection(db, "audit_logs"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc"),
        limit(20)
      );
      const snap = await getDocs(q);
      setAuditLogs(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (e) {
      console.error("Failed to fetch audit logs:", e);
      setAuditLogs([]);
    } finally {
      setLoadingLogs(false);
    }
  };

  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const { currentSessionId } = useUser();

  const fetchActiveSessions = async () => {
    if (!user) return;
    setLoadingSessions(true);
    try {
      const q = query(
        collection(db, "user_sessions"),
        where("userId", "==", user.uid || user.id),
        where("status", "==", "Active")
      );
      const snap = await getDocs(q);
      const sessList = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActiveSessions(sessList);
    } catch (e) {
      console.error("Failed to fetch active sessions:", e);
      setActiveSessions([
        {
          id: currentSessionId || "mock-id-1",
          deviceName: "macOS - Chrome",
          location: "الرياض، السعودية",
          lastActivity: "2026-06-30T09:00:00Z",
          isCurrent: true,
        },
        {
          id: "mock-id-2",
          deviceName: "iPhone 13 - Safari",
          location: "جدة، السعودية",
          lastActivity: "2026-06-30T07:00:00Z",
        },
        {
          id: "mock-id-3",
          deviceName: "Windows PC - Edge",
          location: "دبي، الإمارات",
          lastActivity: "2026-06-29T09:00:00Z",
        },
      ]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      const sessionRef = doc(db, "user_sessions", sessionId);
      await updateDoc(sessionRef, { status: "Revoked", lastActivity: new Date().toISOString() });
      toast.success("تم إنهاء الجلسة بنجاح.");

      await addDoc(collection(db, "audit_logs"), {
        userId: user?.uid || user?.id,
        module: "AUTHENTICATION",
        action: "SessionRevoked",
        payload: JSON.stringify({ revokedSessionId: sessionId }),
        result: "Success",
        timestamp: new Date().toISOString(),
      });

      fetchActiveSessions();
    } catch (e) {
      console.error("Failed to revoke session:", e);
      toast.error("فشل إنهاء الجلسة.");
    }
  };

  useEffect(() => {
    if (activeTab === "audit") {
      const timer = setTimeout(() => {
        fetchAuditLogs();
      }, 0);
      return () => clearTimeout(timer);
    }
    if (activeTab === "security") {
      const timer = setTimeout(() => {
        fetchActiveSessions();
      }, 0);
      return () => clearTimeout(timer);
    }
    if (activeTab === "referrals") {
      const timer = setTimeout(() => {
        fetchReferralStats();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  const handleSaveTrigger = () => {
    setShowConfirmModal(true);
  };

  const handleSave = async () => {
    setShowConfirmModal(false);
    updateSettings(formData);

    // Save business profile details via updateProfile (Firestore)
    await updateProfile({
      name: formData.managerName,
      companyName: formData.companyName,
      crNumber: formData.crNumber,
      city: formData.location,
      avatar: formData.avatar,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 space-y-2 shrink-0">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-zinc-900 leading-tight">الإعدادات</h1>
            <p className="text-sm font-medium text-zinc-500">إدارة حسابك وتفضيلات النظام</p>
          </div>

          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                  : "text-zinc-500 hover:bg-zinc-100"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm relative overflow-hidden"
          >
            {activeTab === "organizations" && (
              <div className="relative z-10">
                <MultiTenancySettings />
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-8 relative z-10">
                <section>
                  <h3 className="text-lg font-black text-zinc-900 mb-6">معلومات الشركة والمسؤول</h3>

                  <div className="flex flex-col md:flex-row gap-8 mb-8 items-start">
                    <div className="relative group/avatar">
                      <div className="w-24 h-24 rounded-3xl bg-zinc-100 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden transition-all group-hover/avatar:border-primary relative">
                        {formData.avatar ? (
                          <img
                            src={formData.avatar}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-zinc-300" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          title="اختر صورة"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              const img = new Image();
                              img.onload = () => {
                                const canvas = document.createElement("canvas");
                                const MAX_WIDTH = 256;
                                const MAX_HEIGHT = 256;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                  if (width > MAX_WIDTH) {
                                    height *= MAX_WIDTH / width;
                                    width = MAX_WIDTH;
                                  }
                                } else {
                                  if (height > MAX_HEIGHT) {
                                    width *= MAX_HEIGHT / height;
                                    height = MAX_HEIGHT;
                                  }
                                }
                                canvas.width = width;
                                canvas.height = height;
                                const ctx = canvas.getContext("2d");
                                ctx?.drawImage(img, 0, 0, width, height);
                                handleChange("avatar", canvas.toDataURL("image/jpeg", 0.8));
                              };
                              img.src = event.target?.result as string;
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center text-white gap-1 pointer-events-none">
                          <Camera className="w-6 h-6" />
                          <span className="text-[10px] font-bold">تغيير الصورة</span>
                        </div>
                      </div>
                      <div className="flex justify-center mt-2">
                        <button
                          onClick={() => {
                            const newSeed = Math.floor(Math.random() * 1000);
                            handleChange(
                              "avatar",
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`
                            );
                          }}
                          className="text-[10px] text-zinc-400 font-medium hover:text-primary transition-colors hover:underline"
                        >
                          صورة عشوائية
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          اسم المنشأة
                        </label>
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) => handleChange("companyName", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          رقم السجل التجاري
                        </label>
                        <input
                          type="text"
                          value={formData.crNumber}
                          onChange={(e) => handleChange("crNumber", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          اسم المسؤول
                        </label>
                        <input
                          type="text"
                          value={formData.managerName}
                          onChange={(e) => handleChange("managerName", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          البريد الإلكتروني للاتصال
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          المدينة / الفرع الرئيسي
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleChange("location", e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-8">
                  <h3 className="text-lg font-black text-zinc-900 mb-6">
                    {t("settings.languageTimezone.title", "اللغة والمنطقة الزمنية")}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase block">
                        {t("common.language", "اللغة المفضلة")}
                      </label>
                      <select
                        value={formData.language}
                        onChange={(e) => handleChange("language", e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      >
                        <option value="ar">{t("common.arabic", "العربية (SA)")}</option>
                        <option value="en">{t("common.english", "English (US)")}</option>
                        <option value="fr">{t("common.french", "Français (FR)")}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase block">
                        {t("settings.languageTimezone.timezone", "المنطقة الزمنية")}
                      </label>
                      <select
                        value={formData.timezone}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      >
                        <option value="Asia/Riyadh">
                          {t("settings.languageTimezone.riyadh", "(GMT+03:00) توقيت الرياض")}
                        </option>
                        <option value="Asia/Dubai">
                          {t("settings.languageTimezone.dubai", "(GMT+04:00) توقيت دبي")}
                        </option>
                      </select>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-8 relative z-10">
                <h3 className="text-lg font-black text-zinc-900 mb-6">تفضيلات التنبيهات</h3>
                <div className="space-y-4">
                  {[
                    {
                      id: "emailNotifications",
                      title: "تنبيهات البريد الإلكتروني",
                      desc: "استلام ملخص للنشاطات والفواتير",
                      icon: Mail,
                    },
                    {
                      id: "pushNotifications",
                      title: "تنبيهات المتصفح",
                      desc: "الحصول على تنبيهات لحظية في المتصفح",
                      icon: Bell,
                    },
                    {
                      id: "systemAlerts",
                      title: "تنبيهات النظام",
                      desc: "تنبيهات هامة حول حالة الخدمة والصيانة",
                      icon: AlertCircle,
                    },
                    {
                      id: "wpsAlerts",
                      title: "تنبيهات الامتثال وحماية الأجور",
                      desc: "تلقي تنبيهات عند اقتراب موعد رفع ملف حماية الأجور (WPS)",
                      icon: ShieldCheck,
                    },
                    {
                      id: "contractEndReminder",
                      title: "تنبيهات انتهاء العقود",
                      desc: "إشعارك بقرب انتهاء عقود الموظفين",
                      icon: History,
                    },
                  ].map((item) => (
                    <div key={item.id} className="flex flex-col gap-3">
                      <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-500 shrink-0">
                            <item.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-zinc-900">{item.title}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[item.id as keyof typeof formData] as boolean}
                            onChange={(e) => handleChange(item.id, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                      </div>

                      {item.id === "emailNotifications" && formData.emailNotifications && (
                        <div className="pl-16 pr-4 space-y-4 pb-2">
                          <div className="flex items-center justify-between gap-3 group">
                            <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                              العملاء المحتملين الجدد
                            </span>
                            <select
                              value={String(formData.emailNotif_newLeads || "immediately")}
                              onChange={(e) =>
                                handleChange("emailNotif_newLeads", e.target.value as any)
                              }
                              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 text-zinc-700"
                            >
                              <option value="immediately">فوراً</option>
                              <option value="daily">ملخص يومي</option>
                              <option value="weekly">ملخص أسبوعي</option>
                              <option value="disabled">إيقاف</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between gap-3 group">
                            <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                              تذكير الفواتير
                            </span>
                            <select
                              value={String(formData.emailNotif_invoiceReminders || "daily")}
                              onChange={(e) =>
                                handleChange("emailNotif_invoiceReminders", e.target.value as any)
                              }
                              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 text-zinc-700"
                            >
                              <option value="immediately">فوراً</option>
                              <option value="daily">ملخص يومي</option>
                              <option value="weekly">ملخص أسبوعي</option>
                              <option value="disabled">إيقاف</option>
                            </select>
                          </div>
                          <div className="flex items-center justify-between gap-3 group">
                            <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900">
                              ملخصات الرواتب
                            </span>
                            <select
                              value={String(formData.emailNotif_payrollSummaries || "weekly")}
                              onChange={(e) =>
                                handleChange("emailNotif_payrollSummaries", e.target.value as any)
                              }
                              className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 text-zinc-700"
                            >
                              <option value="weekly">أسبوعي</option>
                              <option value="monthly">شهري</option>
                              <option value="disabled">إيقاف</option>
                            </select>
                          </div>
                        </div>
                      )}
                      {item.id === "contractEndReminder" && formData.contractEndReminder && (
                        <div className="mt-2 bg-white p-4 rounded-xl border border-zinc-200 ml-14 mr-4 animate-in fade-in slide-in-from-top-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1">
                              <label className="text-xs font-bold text-zinc-500 mb-2 block">
                                تذكير قبل (أيام)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={formData.contractReminderDays || 30}
                                onChange={(e) =>
                                  handleChange("contractReminderDays", Number(e.target.value))
                                }
                                className="w-full sm:w-32 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                            {expiringContractsCount !== null && (
                              <div className="self-end sm:self-auto bg-amber-50 text-amber-700 text-xs font-bold px-4 py-3 rounded-lg border border-amber-100 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                <span>
                                  الموظفين المقترب انتهاء عقودهم: {expiringContractsCount}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reminders" && (
              <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900 leading-tight">
                      التذكيرات الآلية والذكية
                    </h3>
                    <p className="text-sm font-medium text-zinc-500">
                      قم بتهيئة تذكيرات واتساب وبريد إلكتروني تلقائية لعملائك
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-6">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
                      قنوات التذكير
                    </h4>
                    <div className="space-y-4">
                      {[
                        {
                          id: "autoReminders_email",
                          title: "تذكيرات البريد الإلكتروني",
                          desc: "إرسال تنبيهات بريدية رسمية للفواتير",
                          icon: Mail,
                        },
                        {
                          id: "autoReminders_whatsapp",
                          title: "تذكيرات واتساب (موصى به)",
                          desc: "أتمتة الرسائل التذكيرية للعملاء عبر واتساب (متضمن مجاناً)",
                          icon: MessageCircle,
                          highlight: true,
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border",
                            item.highlight
                              ? "border-emerald-200 bg-emerald-50/30"
                              : "border-zinc-100"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={cn(
                                "w-5 h-5",
                                item.highlight ? "text-emerald-500" : "text-zinc-400"
                              )}
                            />
                            <div>
                              <p className="text-sm font-bold text-zinc-900">{item.title}</p>
                              <p className="text-[10px] text-zinc-500">{item.desc}</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData[item.id as keyof typeof formData] as boolean}
                              onChange={(e) => handleChange(item.id, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-6">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-2">
                      جدولة التذكيرات
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          تذكير قبل الموعد (أيام)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={
                              Number.isNaN(formData.reminderDays_before)
                                ? ""
                                : formData.reminderDays_before
                            }
                            onChange={(e) =>
                              handleChange("reminderDays_before", Number(e.target.value))
                            }
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 font-black focus:ring-2 focus:ring-zinc-900/20 outline-none"
                          />
                          <Clock className="w-5 h-5 text-zinc-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          سيتم إرسال تذكير "لطيف" للعميل قبل التاريخ المحدد.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase block">
                          تذكير بعد الموعد (أيام)
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="number"
                            value={
                              Number.isNaN(formData.reminderDays_after)
                                ? ""
                                : formData.reminderDays_after
                            }
                            onChange={(e) =>
                              handleChange("reminderDays_after", Number(e.target.value))
                            }
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 font-black focus:ring-2 focus:ring-zinc-900/20 outline-none"
                          />
                          <AlertCircle className="w-5 h-5 text-rose-400" />
                        </div>
                        <p className="text-[10px] text-zinc-400 font-medium">
                          سيتم إرسال تذكير "بطلب السداد" إذا تأخرت الفاتورة.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 border border-amber-200 shrink-0 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black text-amber-900">تلميح ذكي</p>
                    <p className="text-xs font-medium text-amber-700 leading-relaxed">
                      تفعيل التذكيرات التلقائية عبر الواتساب يزيد من سرعة التحصيل بنسبة ٤٠٪ بناءً
                      على بيانات عملائنا في مدارج. تأكد من ربط حساب الواتساب الخاص بك في تبويب
                      "الأمان والربط".
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-8 relative z-10">
                <section>
                  <h3 className="text-lg font-black text-zinc-900 mb-6">إعدادات الأمان</h3>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-6">
                    <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary" />
                      التحكم بالجلسات والوصول
                    </h4>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="text-xs font-bold text-zinc-600 block mb-2">
                          مدة انتهاء الجلسة (بالدقائق)
                        </label>
                        <input
                          type="number"
                          value={formData.sessionTimeout || 60}
                          onChange={(e) =>
                            handleChange("sessionTimeout", parseInt(e.target.value) || 60)
                          }
                          className="w-full md:w-1/3 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30"
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">
                          يتم تسجيل الخروج تلقائياً بعد هذه المدة من الخمول.
                        </p>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-600 block mb-2">
                          القائمة البيضاء لعناوين IP (Trusted IPs)
                        </label>
                        <input
                          type="text"
                          value={formData.trustedIps || ""}
                          onChange={(e) => handleChange("trustedIps", e.target.value)}
                          placeholder="مثال: 192.168.1.1, 10.0.0.1"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/30 font-mono"
                        />
                        <p className="text-[10px] text-zinc-400 mt-1">
                          افصل بين العناوين بفاصلة. أفرغ الحقل للسماح بالوصول من أي مكان.
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-100 pt-4 mb-4">
                      <h5 className="font-bold text-sm text-zinc-800 mb-3">
                        تنبيهات الدخول غير المعتاد
                      </h5>
                      <div className="flex flex-col gap-3">
                        <label className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              <Mail className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 leading-none mb-1">
                                تنبيه البريد الإلكتروني
                              </p>
                              <p className="text-[10px] text-zinc-500 font-medium">
                                إرسال بريد عند تسجيل دخول من جهاز جديد
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.notifyUnusualLoginEmail ? "bg-primary" : "bg-zinc-300"}`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.notifyUnusualLoginEmail ? "translate-x-1" : "-translate-x-3"}`}
                            />
                            <input
                              type="checkbox"
                              className="absolute opacity-0 w-full h-full cursor-pointer"
                              checked={formData.notifyUnusualLoginEmail || false}
                              onChange={(e) =>
                                handleChange("notifyUnusualLoginEmail", e.target.checked)
                              }
                            />
                          </div>
                        </label>

                        <label className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900 leading-none mb-1">
                                تنبيه واتساب
                              </p>
                              <p className="text-[10px] text-zinc-500 font-medium">
                                رسالة واتساب للإداري عند محاولة دخول مشبوهة
                              </p>
                            </div>
                          </div>
                          <div
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${formData.notifyUnusualLoginWhatsapp ? "bg-primary" : "bg-zinc-300"}`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${formData.notifyUnusualLoginWhatsapp ? "translate-x-1" : "-translate-x-3"}`}
                            />
                            <input
                              type="checkbox"
                              className="absolute opacity-0 w-full h-full cursor-pointer"
                              checked={formData.notifyUnusualLoginWhatsapp || false}
                              onChange={(e) =>
                                handleChange("notifyUnusualLoginWhatsapp", e.target.checked)
                              }
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <h4 className="font-bold text-zinc-900 mb-4 flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-indigo-500" />
                      الجلسات النشطة والتحكم بالأجهزة (Active Sessions)
                    </h4>
                    <p className="text-xs text-zinc-500 mb-4">
                      هذه قائمة بالأجهزة والمتصفحات التي سجلت الدخول حالياً إلى حسابك.
                    </p>

                    <div className="space-y-3">
                      {loadingSessions ? (
                        <div className="flex items-center justify-center p-6">
                          <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                        </div>
                      ) : activeSessions.length === 0 ? (
                        <p className="text-xs text-zinc-400 text-center py-4">
                          لا توجد جلسات نشطة أخرى.
                        </p>
                      ) : (
                        activeSessions.map((session) => {
                          const isCurrent = session.id === currentSessionId || session.isCurrent;
                          return (
                            <div
                              key={session.id}
                              className={`flex items-center justify-between p-3 border rounded-xl ${isCurrent ? "border-emerald-100 bg-emerald-50/50" : "border-zinc-100 bg-white"}`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${isCurrent ? "bg-white border border-emerald-100 text-emerald-600" : "bg-zinc-50 text-zinc-500"}`}
                                >
                                  {session.os?.includes("iPhone") ||
                                  session.os?.includes("Device") ||
                                  session.os?.includes("iOS") ||
                                  session.os?.includes("Android") ? (
                                    <Smartphone className="w-5 h-5" />
                                  ) : (
                                    <Monitor className="w-5 h-5" />
                                  )}
                                </div>
                                <div>
                                  <h5 className="text-sm font-bold text-zinc-900">
                                    {session.deviceName || session.name}
                                  </h5>
                                  <p
                                    className={`text-xs mt-0.5 ${isCurrent ? "text-emerald-600 font-bold" : "text-zinc-500"}`}
                                  >
                                    {isCurrent
                                      ? `الجهاز الحالي الموثوق (&rlm;${session.location || "السعودية"})`
                                      : `${session.location || "السعودية"} • آخر نشاط: ${session.lastActivity ? new Date(session.lastActivity).toLocaleTimeString("ar-SA") : "غير معروف"}`}
                                  </p>
                                </div>
                              </div>
                              {isCurrent ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                                  نشط حالياً
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleRevokeSession(session.id)}
                                  className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                                >
                                  إنهاء الجلسة
                                </button>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="mt-8">
                    <button className="flex items-center gap-3 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors">
                      <Lock className="w-4 h-4" />
                      تغيير كلمة المرور
                    </button>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">
                        الربط الخارجي (Webhooks & Integrations)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        زود أنجمتك بنقاط اتصال (Webhooks) لربط مدارج مع مئات التطبيقات عبر من خلال
                        Zapier.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
                            <svg
                              role="img"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M11.968 11.238l5.856-4.542c.864-.67.34-2.07-.743-2.01L5.94 5.253a.965.965 0 00-.737.493L2.174 11.24c-.464.81.164 1.83 1.096 1.77l11.144-.72a.965.965 0 01.88.54l3.02 5.922c.484.948 1.905.815 2.193-.205l1.9-6.73a.965.965 0 00-.65-1.184l-9.79-3.39zM12.032 12.762l-5.856 4.542c-.864.67-.34 2.07.743 2.01l11.14-.567a.965.965 0 00.738-.493l3.028-5.494c.465-.81-.164-1.83-1.096-1.77l-11.144.72a.965.965 0 01-.88-.54l-3.02-5.922c-.484-.948-1.905-.815-2.193.205l-1.9 6.73a.965.965 0 00.65 1.184l9.79 3.39z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900">
                              مفاتيح الدخول Webhook لـ Zapier
                            </h4>
                            <p className="text-xs text-zinc-500">
                              أرسل بيانات مدارج (العملاء الجدد، الفواتير) إلى Zapier
                            </p>
                          </div>
                        </div>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black uppercase">
                          Premium
                        </span>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">
                            عند إضافة عميل جديد (New Lead Created)
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={
                                formData.zapierWebhookNewLead ||
                                "https://hooks.zapier.com/hooks/catch/12345/abcde"
                              }
                              onChange={(e) => handleChange("zapierWebhookNewLead", e.target.value)}
                              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-500 font-mono"
                            />
                            <button className="px-3 py-1.5 bg-zinc-100 font-bold rounded-lg text-xs hover:bg-zinc-200">
                              نسخ
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-zinc-500 uppercase">
                            عند دفع الفاتورة (Invoice Paid)
                          </label>
                          <div className="flex gap-2 mt-1">
                            <input
                              type="text"
                              value={formData.zapierWebhookInvoicePaid || ""}
                              onChange={(e) =>
                                handleChange("zapierWebhookInvoicePaid", e.target.value)
                              }
                              placeholder="https://hooks.zapier.com/hooks/catch/..."
                              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs text-zinc-500 font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                            />
                            <button className="px-3 py-1.5 bg-zinc-900 text-white font-bold rounded-lg text-xs">
                              تفعيل
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#4A154B] text-white rounded-xl flex items-center justify-center">
                            <svg
                              role="img"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                              className="w-5 h-5"
                            >
                              <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.521-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.523-2.522v-2.522h2.523zM15.165 17.688a2.527 2.527 0 0 1-2.523-2.523 2.526 2.526 0 0 1 2.523-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-zinc-900">بوت Slack لـ Mudarij</h4>
                            <p className="text-xs text-zinc-500">
                              تلقّ التنبيهات وإشعارات الدفع والفواتير المتأخرة في قنوات Slack
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-[10px] font-black uppercase border border-emerald-100">
                          مجاني
                        </span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          value={formData.slackWebhookUrl || ""}
                          onChange={(e) => handleChange("slackWebhookUrl", e.target.value)}
                          placeholder="https://hooks.slack.com/services/..."
                          className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                        <button className="px-4 py-1.5 bg-[#4A154B] text-white font-bold rounded-lg text-xs hover:bg-[#3E113F] transition-colors">
                          اتصال بـ Slack
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "payment" && (
              <div className="space-y-8 relative z-10">
                <section>
                  <h3 className="text-lg font-black text-zinc-900 mb-6">بوابات الدفع الإلكتروني</h3>

                  {/* PayPal */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#00457C] text-white rounded-xl flex items-center justify-center">
                          <svg
                            role="img"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                          >
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zM15.426 6.81a3.633 3.633 0 0 0-2.314-.707H8.223L6.96 14.126h3.195c3.6 0 6.425-1.464 7.242-5.696.05-.26.09-.522.12-.782a2.88 2.88 0 0 0-.09-1.037z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">PayPal</h4>
                          <p className="text-xs text-zinc-500">
                            تمكين الدفع عبر بطاقات الائتمان وحسابات PayPal
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase">
                        PayPal Client ID
                      </label>
                      <input
                        type="text"
                        value={formData.paypalClientId || ""}
                        onChange={(e) => handleChange("paypalClientId", e.target.value)}
                        placeholder="ATXXXXXXXXXXX..."
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-1">
                        يمكنك الحصول على Client ID من خلال{" "}
                        <a
                          href="https://developer.paypal.com/dashboard/applications/sandbox"
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          موقع مطوري PayPal
                        </a>
                      </p>
                    </div>
                  </div>

                  {/* Mada */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold text-xl uppercase">
                          M
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">مدى (Mada)</h4>
                          <p className="text-xs text-zinc-500">
                            تمكين الدفع المباشر عبر بطاقات مدى السعودية
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Mada Merchant ID
                        </label>
                        <input
                          type="text"
                          value={formData.madaMerchantId || ""}
                          onChange={(e) => handleChange("madaMerchantId", e.target.value)}
                          placeholder="MADA_MERCHANT_..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Mada Terminal ID
                        </label>
                        <input
                          type="text"
                          value={formData.madaTerminalId || ""}
                          onChange={(e) => handleChange("madaTerminalId", e.target.value)}
                          placeholder="TERMINAL_..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* PayTabs */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-4 mt-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E04F2F] text-white rounded-xl flex items-center justify-center font-bold text-lg">
                          PT
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">PayTabs (بي تابس)</h4>
                          <p className="text-xs text-zinc-500">
                            بوابة الدفع الإقليمية لدعم بطاقات مدى، البطاقات المحلية، وسداد في الخليج
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Profile ID
                        </label>
                        <input
                          type="text"
                          value={formData.paytabsProfileId || ""}
                          onChange={(e) => handleChange("paytabsProfileId", e.target.value)}
                          placeholder="e.g. 12345"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Server Key
                        </label>
                        <input
                          type="password"
                          value={formData.paytabsServerKey || ""}
                          onChange={(e) => handleChange("paytabsServerKey", e.target.value)}
                          placeholder="SG_XXXXXXXXXXXXX..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Client Key
                        </label>
                        <input
                          type="password"
                          value={formData.paytabsClientKey || ""}
                          onChange={(e) => handleChange("paytabsClientKey", e.target.value)}
                          placeholder="CK_XXXXXXXXXXXXX..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* BenefitPay */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 mb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#005c8a] text-[#ffbf1f] rounded-xl flex items-center justify-center font-bold text-lg">
                          BP
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">BenefitPay (بنفت باي)</h4>
                          <p className="text-xs text-zinc-500">
                            بوابة الدفع الوطنية المفضلة في مملكة البحرين عبر QR والتحويلات المباشرة
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Benefit Merchant ID
                        </label>
                        <input
                          type="text"
                          value={formData.benefitPayMerchantId || ""}
                          onChange={(e) => handleChange("benefitPayMerchantId", e.target.value)}
                          placeholder="BEN_MERCH_XXXX..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Secret Key
                        </label>
                        <input
                          type="password"
                          value={formData.benefitPaySecretKey || ""}
                          onChange={(e) => handleChange("benefitPaySecretKey", e.target.value)}
                          placeholder="BEN_SEC_XXXX..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Apple Pay */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center">
                          <svg
                            role="img"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-6 h-6"
                          >
                            <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.702z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900">Apple Pay</h4>
                          <p className="text-xs text-zinc-500">
                            تمكين الدفع السريع والآمن عبر أجهزة آبل
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Merchant Identifier
                        </label>
                        <input
                          type="text"
                          value={formData.applePayMerchantId || ""}
                          onChange={(e) => handleChange("applePayMerchantId", e.target.value)}
                          placeholder="merchant.com.company..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                          Processing Certificate (Base64)
                        </label>
                        <textarea
                          value={formData.applePayCert || ""}
                          onChange={(e) => handleChange("applePayCert", e.target.value)}
                          placeholder="-----BEGIN CERTIFICATE-----\n..."
                          rows={3}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-primary/20 outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-8 relative z-10">
                <h3 className="text-lg font-black text-zinc-900 mb-6">إعدادات المظهر</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      id: "light",
                      label: "الوضع النّهاري",
                      bg: "bg-white",
                      border: "border-zinc-200",
                    },
                    {
                      id: "dark",
                      label: "الوضع الليلي (قريباً)",
                      bg: "bg-zinc-900",
                      border: "border-zinc-800",
                    },
                    {
                      id: "system",
                      label: "حسب النظام",
                      bg: "bg-gradient-to-r from-white to-zinc-900",
                      border: "border-zinc-200",
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => handleChange("theme", mode.id)}
                      className={cn(
                        "group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        formData.theme === mode.id
                          ? "border-emerald-500 bg-emerald-50/50"
                          : "border-transparent hover:bg-zinc-50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-full aspect-video rounded-xl border-2 overflow-hidden flex flex-col transition-all",
                          mode.bg,
                          mode.border
                        )}
                      >
                        <div className="w-full h-3 border-b border-zinc-500/20 px-2 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/20" />
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500/20" />
                        </div>
                        <div className="flex-1 p-2 flex gap-2">
                          <div className="w-4 h-full rounded bg-zinc-500/10" />
                          <div className="flex-1 space-y-1">
                            <div className="w-1/2 h-1.5 rounded bg-zinc-500/20" />
                            <div className="w-3/4 h-1.5 rounded bg-zinc-500/10" />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            formData.theme === mode.id
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-zinc-300"
                          )}
                        >
                          {formData.theme === mode.id && <CheckCircle2 className="w-3 h-3" />}
                        </div>
                        <span className="text-sm font-bold text-zinc-700">{mode.label}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-10 border-t border-zinc-100 pt-8">
                  <h4 className="text-sm font-bold text-zinc-900 mb-4">اللون الرئيسي للنظام</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    {[
                      { id: "#10b981", name: "أخضر زمردي" },
                      { id: "#3b82f6", name: "أزرق" },
                      { id: "#8b5cf6", name: "بنفسجي" },
                      { id: "#f59e0b", name: "برتقالي" },
                      { id: "#ef4444", name: "أحمر" },
                      { id: "#18181b", name: "أسود رمادي" },
                    ].map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleChange("primaryColor", color.id)}
                        className={cn(
                          "w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-105 active:scale-95",
                          formData.primaryColor === color.id
                            ? "border-zinc-900 shadow-md"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: color.id }}
                        title={color.name}
                      >
                        {formData.primaryColor === color.id && (
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        )}
                      </button>
                    ))}

                    <div className="relative flex items-center">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleChange("primaryColor", e.target.value)}
                        className="w-12 h-12 rounded-2xl cursor-pointer opacity-0 absolute inset-0 z-10"
                      />
                      <div className="w-12 h-12 rounded-2xl border-2 border-zinc-200 flex items-center justify-center overflow-hidden relative">
                        <div className="absolute inset-0 z-0 flex rounded-2xl bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-20"></div>
                        <Palette className="w-5 h-5 text-zinc-600 relative z-0" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500 mt-3">
                    يؤثر هذا اللون على الأزرار والقوائم في كافة أرجاء النظام
                  </p>
                </div>
              </div>
            )}

            {activeTab === "email" && (
              <div className="space-y-8 relative z-10">
                <section>
                  <h3 className="text-lg font-black text-zinc-900 mb-2">
                    إعدادات البريد الإلكتروني
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6">
                    قم بتهيئة خادم البريد (SMTP) لإرسال الفواتير والتنبيهات للعملاء تلقائياً.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase block">
                        خادم البريد (SMTP Host)
                      </label>
                      <input
                        type="text"
                        placeholder="smtp.company.com"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase block">
                        المنفذ (Port)
                      </label>
                      <input
                        type="number"
                        placeholder="587"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase block">
                        اسم المستخدم
                      </label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500 uppercase block">
                        كلمة السر
                      </label>
                      <input
                        type="password"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-zinc-100 pt-8">
                  <h4 className="text-sm font-black text-zinc-900 mb-4">اختبار الاتصال</h4>
                  <div className="flex gap-4">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@domain.com"
                      className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                    />
                    <button
                      onClick={async () => {
                        if (!testEmail) return alert("الرجاء إدخال بريد إلكتروني");
                        setTestingEmail(true);
                        try {
                          const res = await fetch("/api/email/test", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", "x-user-id": user.id },
                            body: JSON.stringify({ to: testEmail }),
                          });
                          if (res.ok) {
                            alert("تم إرسال رسالة الاختبار بنجاح");
                          } else {
                            alert("فشل الإرسال، تحقق من الإعدادات");
                          }
                        } catch (e) {
                          alert("خطأ أثناء الاتصال");
                        } finally {
                          setTestingEmail(false);
                        }
                      }}
                      disabled={testingEmail}
                      className="px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                      {testingEmail ? "جاري الإرسال..." : "Test Email Settings"}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {activeTab === "audit" && (
              <div className="space-y-6 relative z-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-zinc-900">
                    سجل عمليات النظام (Audit Log)
                  </h3>
                  <button
                    onClick={fetchAuditLogs}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    تحديث السجل
                  </button>
                </div>

                <div className="space-y-3">
                  {loadingLogs ? (
                    <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs animate-pulse">
                      جاري تحميل السجلات...
                    </div>
                  ) : auditLogs.length === 0 ? (
                    <div className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                      لا توجد سجلات متاحة حالياً
                    </div>
                  ) : (
                    auditLogs.map((log, i) => (
                      <div
                        key={log.id}
                        className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex items-start gap-4 hover:bg-white hover:shadow-lg transition-all group"
                      >
                        <div
                          className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                            log.module === "CRM"
                              ? "bg-blue-50 text-blue-600 border-blue-100"
                              : log.module === "INVOICE"
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : log.module === "EMAIL"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : "bg-zinc-100 text-zinc-600 border-zinc-200"
                          )}
                        >
                          {log.module === "EMAIL" ? (
                            <Mail className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              {log.module}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-medium">
                              #{log.id.split("_")[1]}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-zinc-900">
                            {log.payload?.action ||
                              log.result?.message ||
                              `عملية في وحدة ${log.module}`}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-[10px] bg-white border border-zinc-200 px-2 py-0.5 rounded-lg text-zinc-500 font-bold">
                              <User className="w-3 h-3" /> {log.user?.name || "System"}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-medium">
                              <Clock className="w-3 h-3" />{" "}
                              {new Date(log.timestamp).toLocaleString("ar-SA")}
                            </div>
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === "referrals" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 text-right" dir="rtl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                  <div>
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      برنامج الإحالة والمكافآت المشتركة
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1 font-medium leading-relaxed">
                      ادعُ أصدقاءك وعملاءك للاشتراك في مدارج؛ ليحصل كل منكما على مكافآت فورية فترات تجريبية ممددة أو خصومات تجديد اشتراك عند الدفع.
                    </p>
                  </div>
                  {loadingReferrals && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-bold bg-zinc-50 px-3 py-1.5 rounded-xl border border-zinc-200">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                      جاري مزامنة الإحصائيات...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* 1. Link & Custom Code Generation */}
                  <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border border-emerald-100/70 p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -top-4 -left-4 p-4 opacity-5 text-emerald-600">
                      <Users className="w-32 h-32" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h3 className="text-sm font-bold text-emerald-900">الرمز ورابط الإحالة المخصص</h3>
                      </div>
                      <p className="text-xs text-emerald-700/80 mb-4 leading-relaxed font-medium">
                        خصص رمز إحالتك ليكون معبراً عن شركتك، ثم انسخ الرابط وشاركه للحصول على المكافآت فوراً.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Code customization input */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-emerald-800">تخصيص رمز الإحالة</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customCode}
                            onChange={(e) => setCustomCode(e.target.value)}
                            disabled={updatingCode}
                            placeholder="مثال: SAUDIPRO"
                            className="flex-1 bg-white border border-emerald-200 text-zinc-950 font-black text-xs px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            dir="ltr"
                          />
                          <button
                            onClick={handleSaveCustomCode}
                            disabled={updatingCode}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
                          >
                            {updatingCode ? "جاري الحفظ..." : "تحديث الرمز"}
                          </button>
                        </div>
                      </div>

                      {/* Displaying unique links */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-emerald-800">رابط الإحالة الفعّال</label>
                        <div className="flex gap-2">
                          <div
                            className="flex-1 bg-white/80 backdrop-blur-sm border border-emerald-200 text-emerald-950 font-bold text-xs p-3 rounded-xl flex items-center justify-between overflow-x-auto whitespace-nowrap"
                            dir="ltr"
                          >
                            {window.location.origin}/login?ref={referralStats.referralCode || "PENDING"}
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/login?ref=${referralStats.referralCode || "PENDING"}`
                              );
                              toast.success("تم نسخ رابط الإحالة الفعّال الخاص بك بنجاح!");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-xl transition-colors shrink-0"
                            title="نسخ الرابط"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Choose Reward Preference */}
                  <div className="bg-white border border-zinc-200/80 p-6 rounded-3xl flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900 mb-1.5 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        تفضيلات المكافأة الخاصة بك
                      </h3>
                      <p className="text-xs text-zinc-500 mb-4 leading-relaxed font-medium">
                        اختر المكافأة التي تود تطبيقها تلقائياً على حسابك وصديقك عند حدوث إحالات ناجحة.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleUpdateRewardPreference("discount")}
                        disabled={updatingPreference}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-right transition-all flex items-start gap-3 relative overflow-hidden group",
                          referralStats.rewardPreference === "discount"
                            ? "border-amber-500 bg-amber-50/40 text-amber-950 shadow-inner"
                            : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white text-zinc-600"
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="text-xs font-black">خصومات اشتراكات مالية 💳</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-normal">
                            احصل على 150 ريال سعودي خصم فوري على تجديد اشتراكك (وكذلك صديقك) عند التسجيل، وتتضاعف المكافأة عند الدفع الأول للعميل المحال.
                          </p>
                        </div>
                        {referralStats.rewardPreference === "discount" && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                        )}
                      </button>

                      <button
                        onClick={() => handleUpdateRewardPreference("trial")}
                        disabled={updatingPreference}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-right transition-all flex items-start gap-3 relative overflow-hidden group",
                          referralStats.rewardPreference === "trial"
                            ? "border-amber-500 bg-amber-50/40 text-amber-950 shadow-inner"
                            : "border-zinc-200 hover:border-zinc-300 bg-zinc-50/50 hover:bg-white text-zinc-600"
                        )}
                      >
                        <div className="flex-1">
                          <h4 className="text-xs font-black">تمديد الفترات التجريبية ⏳</h4>
                          <p className="text-[10px] text-zinc-500 mt-1 font-medium leading-normal">
                            احصل على 30 يوماً إضافية مجانية لفترتك التجريبية (وكذلك صديقك) عند التسجيل، وتمتد 30 يوماً إضافية أخرى عند الدفع الأول للإحالة.
                          </p>
                        </div>
                        {referralStats.rewardPreference === "trial" && (
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3. Accrued Real Rewards Stats */}
                  <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-4 opacity-5 text-zinc-500">
                      <Sparkles className="w-24 h-24" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-zinc-400 mb-1">المكافآت التراكمية المحققة</h3>
                      <p className="text-xs text-zinc-500 leading-normal font-medium mb-4">
                        إجمالي رصيد المكافآت الحقيقي المطبق على اشتراكك الحالي فوراً.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl text-center">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block mb-1">
                          الخصومات المالية
                        </span>
                        <div className="text-2xl font-black text-amber-400">
                          {referralStats.discountEarnedSar || 0} <span className="text-xs text-zinc-400 font-bold">SAR</span>
                        </div>
                      </div>

                      <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl text-center">
                        <span className="text-[10px] font-black uppercase text-zinc-500 tracking-wider block mb-1">
                          الأيام المضافة مجاناً
                        </span>
                        <div className="text-2xl font-black text-emerald-400">
                          +{referralStats.trialExtensionDays || 0} <span className="text-xs text-zinc-400 font-bold">يوم</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-[10px] text-zinc-500 font-medium leading-relaxed mt-4 pt-3 border-t border-zinc-900">
                      * يتم تحديث المكافآت وتطبيقها تلقائياً على فواتيرك وخطتك القادمة بفضل الربط الشامل مع محاسبة مدارج OS.
                    </div>
                  </div>
                </div>

                {/* Simulation Sandbox / Tool */}
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-3xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 p-4 opacity-10 text-zinc-300">
                    <Code2 className="w-16 h-16" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2 mb-1">
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      ⚙️ محاكاة واختبار تدفق الإحالات (Sandbox Simulation)
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                      بما أنك في بيئة التطوير، تتيح لك هذه الأداة محاكاة دورة حياة العميل المحال بالكامل. أدخل معلومات لإنشاء مستخدم محال وهمي لتشاهد الفواتير، الإشعارات، والخصومات تُضاف في التو واللحظة!
                    </p>
                  </div>

                  <form onSubmit={handleSimulateSignup} className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 items-end">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">اسم الصديق الوهمي</label>
                      <input
                        type="text"
                        required
                        value={simulationName}
                        onChange={(e) => setSimulationName(e.target.value)}
                        placeholder="مثال: صالح الشهري"
                        className="w-full bg-white border border-zinc-200 text-xs px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">البريد الإلكتروني للعميل</label>
                      <input
                        type="email"
                        required
                        value={simulationEmail}
                        onChange={(e) => setSimulationEmail(e.target.value)}
                        placeholder="saleh@example.com"
                        className="w-full bg-white border border-zinc-200 text-xs px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-500"
                        dir="ltr"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={simulating}
                      className="bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-400 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
                    >
                      {simulating ? "جاري المحاكاة..." : "🚀 محاكاة تسجيل العميل الجديد"}
                    </button>
                  </form>
                </div>

                {/* History Table with Simulated Payment actions */}
                <div className="bg-white border border-zinc-200/80 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-900">سجل الإحالات التفاعلي</h3>
                      <p className="text-xs text-zinc-400 font-medium mt-0.5">
                        العملاء الذين سجلوا اشتراكاً باستخدام رمز الإحالة الخاص بك.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    {referralStats.history && referralStats.history.length > 0 ? (
                      <table className="w-full text-sm text-right">
                        <thead className="bg-zinc-50 text-zinc-500 font-bold text-xs">
                          <tr>
                            <th className="px-6 py-4">الشركة/العميل</th>
                            <th className="px-6 py-4">البريد الإلكتروني</th>
                            <th className="px-6 py-4">تاريخ التسجيل</th>
                            <th className="px-6 py-4">حالة الاشتراك</th>
                            <th className="px-6 py-4">تفاصيل المكافأة</th>
                            <th className="px-6 py-4 text-center">إجراءات الاختبار</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 font-medium">
                          {referralStats.history.map((record: any) => (
                            <tr key={record.id} className="hover:bg-zinc-50/50 transition-colors">
                              <td className="px-6 py-4 text-zinc-900 font-bold">{record.referredUserName}</td>
                              <td className="px-6 py-4 text-zinc-500 font-mono text-xs" dir="ltr">
                                {record.referredUserEmail}
                              </td>
                              <td className="px-6 py-4 text-zinc-500 font-bold">
                                {new Date(record.createdAt).toLocaleDateString("ar-SA")}
                              </td>
                              <td className="px-6 py-4">
                                {record.status === "completed" ? (
                                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                    مدفوع بالكامل
                                  </span>
                                ) : (
                                  <span className="text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 w-fit">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    فترة تجريبية
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-zinc-900 font-black text-xs">
                                {record.rewardValueDescription}
                              </td>
                              <td className="px-6 py-4 text-center">
                                {record.status !== "completed" ? (
                                  <button
                                    onClick={() => handleSimulatePayment(record.referredUserId)}
                                    disabled={paymentLoadingId === record.referredUserId}
                                    className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all active:scale-[0.98] inline-flex items-center gap-1.5"
                                  >
                                    {paymentLoadingId === record.referredUserId ? (
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                      "💳 محاكاة أول دفعة (ترقية)"
                                    )}
                                  </button>
                                ) : (
                                  <span className="text-emerald-600 text-[10px] font-bold">✓ مكتمل وحُصلت المكافآت</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-12 text-center text-zinc-400">
                        <Users className="w-12 h-12 mx-auto text-zinc-300 mb-3" />
                        <p className="text-xs font-bold text-zinc-500">لا يوجد سجل إحالات بعد.</p>
                        <p className="text-[10px] text-zinc-400 mt-1">شارِك رابطك الفريد أعلاه لتشجيع التسجيلات الأولى والحصول على مكافآت ومميزات حصرية!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "compliance" && (
              <div className="relative z-10 -mx-6 -mt-6">
                <SecurityCompliance />
              </div>
            )}

            {activeTab === "ai_prompts" && (
              <div className="relative z-10 -mx-6 -mt-6">
                <AIPromptLibrary />
              </div>
            )}

            {activeTab === "developer" && (
              <div className="relative z-10 -mx-6 -mt-6">
                <DeveloperTools />
              </div>
            )}

            {activeTab === "mobile" && (
              <div className="relative z-10">
                <MobileSimulator />
              </div>
            )}

            {activeTab !== "organizations" && activeTab !== "ai_prompts" && (
              <div className="mt-12 pt-6 border-t border-zinc-100 flex items-center justify-between bg-white relative z-10 w-full rounded-b-3xl">
                <AnimatePresence>
                  {saved && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تم حفظ الإعدادات بنجاح
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  onClick={handleSaveTrigger}
                  className="mr-auto flex items-center gap-2 px-8 py-3.5 bg-zinc-900 text-white rounded-xl font-bold border border-zinc-800 shadow-xl shadow-zinc-200 hover:bg-zinc-800 active:scale-[0.98] transition-all"
                >
                  <Save className="w-4 h-4" />
                  حفظ التغييرات
                </button>
              </div>
            )}

            <AnimatePresence>
              {showConfirmModal && (
                <div
                  className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
                  dir="rtl"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-zinc-100"
                  >
                    <div className="p-8 pb-4 flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center shadow-inner">
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mt-4 tracking-tight">
                          تأكيد حفظ التغييرات
                        </h3>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                          Confirmation Required
                        </p>
                      </div>
                    </div>

                    <div className="p-8 pt-0">
                      <p className="text-sm font-medium text-zinc-600 leading-relaxed">
                        هل أنت متأكد من رغبتك في حفظ التغييرات الجديدة على إعدادات النظام؟ سيتم
                        تطبيق هذه التغييرات فوراً.
                      </p>
                    </div>

                    <footer className="p-8 bg-zinc-50 border-t border-zinc-100 flex gap-4">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-4 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-500 hover:bg-zinc-100 transition-all"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={handleSave}
                        className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10"
                      >
                        تأكيد الحفظ
                      </button>
                    </footer>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
