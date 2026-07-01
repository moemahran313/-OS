import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Building,
  GitBranch,
  ShieldAlert,
  Settings,
  CreditCard,
  Crown,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Globe,
  Palette,
  Clock,
  Briefcase,
  ChevronRight,
  User,
  Users,
  Activity,
  Calendar,
  DollarSign,
  ArrowRightLeft,
  FileText,
  BadgeAlert,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function MultiTenancySettings() {
  // Navigation & View selection
  const [activeSubTab, setActiveSubTab] = useState<
    | "dashboard"
    | "companies"
    | "branches"
    | "subscription"
    | "settings"
    | "branding"
    | "localization"
  >("dashboard");

  // Multi-tenancy backend context states
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [activeContext, setActiveContext] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Form inputs for creating models
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgLegalName, setNewOrgLegalName] = useState("");
  const [newOrgCountry, setNewOrgCountry] = useState("SA");
  const [newOrgTaxNumber, setNewOrgTaxNumber] = useState("");
  const [newOrgIndustry, setNewOrgIndustry] = useState("Technology");
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);

  const [newCompanyNameAr, setNewCompanyNameAr] = useState("");
  const [newCompanyNameEn, setNewCompanyNameEn] = useState("");
  const [newCompanyCr, setNewCompanyCr] = useState("");
  const [newCompanyVat, setNewCompanyVat] = useState("");
  const [newCompanyCurrency, setNewCompanyCurrency] = useState("SAR");
  const [showCreateCompModal, setShowCreateCompModal] = useState(false);

  const [newBranchNameAr, setNewBranchNameAr] = useState("");
  const [newBranchNameEn, setNewBranchNameEn] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [newBranchCity, setNewBranchCity] = useState("");
  const [newBranchManager, setNewBranchManager] = useState("");
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);

  // Settings update fields
  const [settingsForm, setSettingsForm] = useState<any>({
    language: "ar",
    currency: "SAR",
    dateFormat: "YYYY-MM-DD",
    numberFormat: "1,234.56",
    fiscalYear: "2026",
    businessHours: "09:00 - 17:00",
    weekendRules: "Friday-Saturday",
    timezone: "Asia/Riyadh",
    branding: {
      primaryColor: "#18181b",
      secondaryColor: "#71717a",
      banner: "",
    },
  });

  // Fetch all necessary multi-tenancy information
  const loadContext = async () => {
    setLoading(true);
    try {
      // 1. Fetch active context
      const contextRes = await fetch("/api/organizations/active");
      if (!contextRes.ok) throw new Error("Failed to fetch active context");
      const contextData = await contextRes.json();
      setActiveContext(contextData);

      if (contextData.userContext?.activeOrganizationId) {
        const orgId = contextData.userContext.activeOrganizationId;
        setSettingsForm({
          ...contextData.organization?.settings,
          language: contextData.organization?.language || "ar",
          currency: contextData.organization?.baseCurrency || "SAR",
          timezone: contextData.organization?.timezone || "Asia/Riyadh",
          fiscalYear: contextData.organization?.fiscalYear || "2026",
        });

        // 2. Fetch companies of active organization
        const compRes = await fetch("/api/organizations/companies");
        if (compRes.ok) {
          const compData = await compRes.json();
          setCompanies(compData);

          // 3. Fetch branches of current active company
          const activeCompanyId = contextData.userContext.activeCompanyId;
          if (activeCompanyId) {
            const brRes = await fetch(`/api/organizations/companies/${activeCompanyId}/branches`);
            if (brRes.ok) {
              const brData = await brRes.json();
              setBranches(brData);
            }
          }
        }

        // 4. Fetch subscription data
        const subRes = await fetch(`/api/organizations/${orgId}/subscription`);
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscription(subData);
        }
      }

      // 5. Fetch all organizations for switching list
      const orgsRes = await fetch("/api/organizations");
      if (orgsRes.ok) {
        const orgsData = await orgsRes.json();
        setOrganizations(orgsData);
      }
    } catch (err: any) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل بيانات المنظمة المتعددة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContext();
  }, []);

  // Switch context trigger
  const handleSwitchContext = async (orgId?: string, compId?: string, brId?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/organizations/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: orgId,
          companyId: compId,
          branchId: brId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to switch context");
      }

      toast.success("تم تبديل سياق العمل والمؤسسة بنجاح");
      await loadContext();
    } catch (err: any) {
      toast.error(err.message || "فشل التبديل");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Organization
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newOrgName,
          legalName: newOrgLegalName,
          country: newOrgCountry,
          industry: newOrgIndustry,
          taxNumber: newOrgTaxNumber,
        }),
      });

      if (!res.ok) throw new Error("Failed to create organization");
      toast.success("تم إنشاء المنظمة الجديدة وتهيئة إعداداتها الافتراضية");
      setShowCreateOrgModal(false);
      setNewOrgName("");
      setNewOrgLegalName("");
      setNewOrgTaxNumber("");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل إنشاء المنظمة");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Company
  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyNameAr || !newCompanyNameEn) return;
    setActionLoading(true);
    try {
      const res = await fetch("/api/organizations/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: newCompanyNameAr,
          nameEn: newCompanyNameEn,
          commercialRegistration: newCompanyCr,
          vatNumber: newCompanyVat,
          defaultCurrency: newCompanyCurrency,
        }),
      });

      if (!res.ok) throw new Error("Failed to create company");
      toast.success("تم إضافة الشركة القانونية الجديدة للكيان بنجاح");
      setShowCreateCompModal(false);
      setNewCompanyNameAr("");
      setNewCompanyNameEn("");
      setNewCompanyCr("");
      setNewCompanyVat("");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل إنشاء الشركة");
    } finally {
      setActionLoading(false);
    }
  };

  // Create Branch
  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchNameAr || !newBranchCode) return;
    const activeCompanyId = activeContext?.userContext?.activeCompanyId;
    if (!activeCompanyId) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/companies/${activeCompanyId}/branches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameAr: newBranchNameAr,
          nameEn: newBranchNameEn,
          code: newBranchCode,
          city: newBranchCity,
          manager: newBranchManager,
        }),
      });

      if (!res.ok) throw new Error("Failed to create branch");
      toast.success("تم إضافة الفرع الجديد للمنشأة");
      setShowCreateBranchModal(false);
      setNewBranchNameAr("");
      setNewBranchNameEn("");
      setNewBranchCode("");
      setNewBranchCity("");
      setNewBranchManager("");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل إنشاء الفرع");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Company
  const handleDeleteCompany = async (compId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في أرشفة وحذف هذه الشركة؟")) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/companies/${compId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete company");
      toast.success("تم أرشفة الشركة بنجاح");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل أرشفة الشركة");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Branch
  const handleDeleteBranch = async (branchId: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في أرشفة هذا الفرع؟")) return;
    const activeCompanyId = activeContext?.userContext?.activeCompanyId;
    if (!activeCompanyId) return;

    setActionLoading(true);
    try {
      const res = await fetch(
        `/api/organizations/companies/${activeCompanyId}/branches/${branchId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to archive branch");
      toast.success("تم أرشفة الفرع بنجاح");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل أرشفة الفرع");
    } finally {
      setActionLoading(false);
    }
  };

  // Upgrade Plan
  const handleUpgradePlan = async (plan: string) => {
    const orgId = activeContext?.userContext?.activeOrganizationId;
    if (!orgId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error("Failed to change plan");
      toast.success(`تم تبديل خطة الاشتراك بنجاح إلى: ${plan}`);
      await loadContext();
    } catch (err: any) {
      toast.error("فشل تبديل خطة الاشتراك");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Settings Form (settings/branding/localization)
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const orgId = activeContext?.userContext?.activeOrganizationId;
    if (!orgId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("تم حفظ إعدادات المنظمة وتعديل القالب والهوية البصرية بنجاح");
      await loadContext();
    } catch (err: any) {
      toast.error("فشل حفظ التعديلات");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-zinc-200 border-t-zinc-900 rounded-full mb-4"
        />
        <p className="text-zinc-500 font-bold text-sm">
          جاري جلب إعدادات المنظمات والربط المؤسسي...
        </p>
      </div>
    );
  }

  const userContext = activeContext?.userContext || {};
  const currentOrg = activeContext?.organization || {};
  const currentComp = companies.find((c) => c.id === userContext.activeCompanyId) || {};
  const currentBranch = branches.find((b) => b.id === userContext.activeBranchId) || {};

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Dynamic Selector Header */}
      <div className="bg-zinc-50 rounded-3xl p-6 border border-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-zinc-900 text-white rounded-2xl shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black px-2 py-0.5 bg-zinc-200 text-zinc-800 rounded-md uppercase tracking-wider">
                {subscription?.activePlan || "Free"}
              </span>
              <h2 className="text-xl font-black text-zinc-900">
                {currentOrg.name || "المنظمة الافتراضية"}
              </h2>
            </div>
            <p className="text-xs text-zinc-500 font-medium">
              الشركة النشطة:{" "}
              <span className="text-zinc-800 font-black">
                {currentComp.nameAr || "لم يتم تحديد شركة"}
              </span>
              {" | "}
              الفرع:{" "}
              <span className="text-zinc-800 font-black">
                {currentBranch.nameAr || "لم يتم تحديد فرع"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Organization Switcher */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-zinc-400 mb-1">المنظمة الحالية</label>
            <select
              value={userContext.activeOrganizationId || ""}
              onChange={(e) => handleSwitchContext(e.target.value, undefined, undefined)}
              disabled={actionLoading}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Company Switcher */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-zinc-400 mb-1">الشركة القانونية</label>
            <select
              value={userContext.activeCompanyId || ""}
              onChange={(e) =>
                handleSwitchContext(userContext.activeOrganizationId, e.target.value, undefined)
              }
              disabled={actionLoading}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {companies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.nameAr}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Switcher */}
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-zinc-400 mb-1">الفرع النشط</label>
            <select
              value={userContext.activeBranchId || ""}
              onChange={(e) =>
                handleSwitchContext(
                  userContext.activeOrganizationId,
                  userContext.activeCompanyId,
                  e.target.value
                )
              }
              disabled={actionLoading}
              className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-900"
            >
              {branches.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.nameAr}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowCreateOrgModal(true)}
            className="mt-4 lg:mt-0 flex items-center gap-1.5 px-3 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            منظمة جديدة
          </button>
        </div>
      </div>

      {/* Internal Navigation Sub-tabs */}
      <div className="flex overflow-x-auto gap-1 border-b border-zinc-100 pb-2 scrollbar-none">
        {[
          { id: "dashboard", label: "لوحة التحكم للمنظمة", icon: Activity },
          { id: "companies", label: "الشركات القانونية", icon: Building },
          { id: "branches", label: "الفروع والمواقع", icon: GitBranch },
          { id: "subscription", label: "الاشتراكات والحدود", icon: CreditCard },
          { id: "settings", label: "إعدادات التشغيل", icon: Settings },
          { id: "branding", label: "الهوية والعلامة التجارية", icon: Palette },
          { id: "localization", label: "اللغة والترجمة", icon: Globe },
        ].map((subTab) => (
          <button
            key={subTab.id}
            onClick={() => setActiveSubTab(subTab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
              activeSubTab === subTab.id
                ? "bg-zinc-100 text-zinc-900"
                : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"
            }`}
          >
            <subTab.icon className="w-4 h-4" />
            {subTab.label}
          </button>
        ))}
      </div>

      {/* Content area with transitions */}
      <div className="bg-white min-h-[350px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSubTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. ORGANIZATION DASHBOARD */}
            {activeSubTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Org details card */}
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm space-y-4">
                    <h3 className="font-black text-sm text-zinc-500 mb-2">
                      معلومات الكيان الرئيسي
                    </h3>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between border-b border-zinc-50 pb-2">
                        <span className="text-zinc-400 font-bold">الاسم القانوني</span>
                        <span className="text-zinc-900 font-black">{currentOrg.legalName}</span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-50 pb-2">
                        <span className="text-zinc-400 font-bold">المعرف الفريد (Slug)</span>
                        <span className="text-zinc-900 font-mono font-medium">
                          {currentOrg.slug}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-50 pb-2">
                        <span className="text-zinc-400 font-bold">الرقم الضريبي VAT</span>
                        <span className="text-zinc-900 font-mono">
                          {currentOrg.taxNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-zinc-50 pb-2">
                        <span className="text-zinc-400 font-bold">رقم السجل التجاري</span>
                        <span className="text-zinc-900 font-mono">
                          {currentOrg.registrationNumber || "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-bold">البلد والمنطقة الزمنية</span>
                        <span className="text-zinc-900 font-bold">
                          {currentOrg.country} ({currentOrg.timezone})
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription card */}
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-black text-sm text-zinc-500">حالة الاشتراك النشط</h3>
                        <span className="px-2.5 py-1 bg-zinc-900 text-white rounded-full text-[10px] font-black uppercase">
                          {subscription?.activePlan}
                        </span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">حالة الدفع والفوترة</span>
                          <span className="text-emerald-600 font-black flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {subscription?.billingStatus === "Active" ? "نشط ومنتظم" : "معلق"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">عدد المستخدمين المتاحين</span>
                          <span className="text-zinc-900 font-black">
                            {companies.length} شركات / {subscription?.limits?.userLimit || 3}{" "}
                            مستخدمين
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">سعة التخزين السحابي</span>
                          <span className="text-zinc-900 font-black">
                            {subscription?.limits?.storageLimitGB || 5} جيجابايت
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveSubTab("subscription")}
                      className="mt-4 w-full py-2 bg-zinc-50 border border-zinc-200 text-zinc-800 text-xs font-black rounded-xl hover:bg-zinc-100 transition text-center flex items-center justify-center gap-1"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      إدارة خطة الاشتراك والأسعار
                    </button>
                  </div>

                  {/* System resources card */}
                  <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-sm text-zinc-500 mb-4">
                        استهلاك الواجهات والوصول المجمع (API)
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1.5">
                            <span>استهلاك طلبات API اليومية</span>
                            <span>214 / {subscription?.limits?.apiLimitDaily || 1000}</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="bg-zinc-900 h-full rounded-full"
                              style={{ width: "21.4%" }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold text-zinc-600 mb-1.5">
                            <span>استهلاك الذاكرة السحابية المخزنة</span>
                            <span>1.2 / {subscription?.limits?.storageLimitGB || 5} GB</span>
                          </div>
                          <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                            <div
                              className="bg-zinc-400 h-full rounded-full"
                              style={{ width: "24%" }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-400 text-center font-bold">
                      تم التحديث تلقائياً • المدة الزمنية ممتثلة لمعايير SAMA
                    </div>
                  </div>
                </div>

                {/* Tenant hierarchy visualize */}
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                  <h3 className="font-black text-sm text-zinc-800 mb-3 flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-zinc-900" />
                    هيكل الكيانات والعزل الهرمي (Tenant Hierarchy)
                  </h3>
                  <p className="text-xs text-zinc-500 mb-6">
                    يقوم Madarij OS بعزل كل منظمة عزلًا تامًا على مستوى قاعدة البيانات. جميع
                    العمليات والمحاسبة والرواتب والعملاء مشفرة ومصنفة بحسب الهيكلية التالية:
                  </p>
                  <div className="flex flex-col lg:flex-row items-center justify-around gap-4 text-center">
                    <div className="p-4 bg-white border border-zinc-100 rounded-2xl w-full max-w-[160px] shadow-sm">
                      <div className="text-xs font-black text-zinc-400 mb-1">المنصة (Platform)</div>
                      <div className="text-xs font-black text-zinc-900">Madarij Cloud</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 hidden lg:block rotate-180" />
                    <div className="p-4 bg-zinc-900 text-white rounded-2xl w-full max-w-[160px] shadow-md">
                      <div className="text-xs text-zinc-400 font-bold mb-1">المنظمة (Tenant)</div>
                      <div className="text-xs font-black truncate">{currentOrg.name}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 hidden lg:block rotate-180" />
                    <div className="p-4 bg-white border border-zinc-100 rounded-2xl w-full max-w-[160px] shadow-sm">
                      <div className="text-xs font-black text-zinc-400 mb-1">
                        الشركات (Companies)
                      </div>
                      <div className="text-xs font-black text-zinc-900">
                        {companies.length} شركات قانونية
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-300 hidden lg:block rotate-180" />
                    <div className="p-4 bg-white border border-zinc-100 rounded-2xl w-full max-w-[160px] shadow-sm">
                      <div className="text-xs font-black text-zinc-400 mb-1">الفروع والمواقع</div>
                      <div className="text-xs font-black text-zinc-900">
                        {branches.length} فروع تشغيلية
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. COMPANIES LIST & CREATE */}
            {activeSubTab === "companies" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base text-zinc-900">
                      إدارة الشركات الكيان القانوني
                    </h3>
                    <p className="text-xs text-zinc-500">
                      الشركات التابعة لمنظمة {currentOrg.name} والتي تملك دفاتر محاسبية وقوائم مالية
                      مستقلة
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateCompModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة شركة جديدة
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {companies.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-base text-zinc-900">{comp.nameAr}</h4>
                            <span className="text-xs font-bold text-zinc-400 font-mono">
                              {comp.nameEn}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              comp.status === "Active"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-zinc-100 text-zinc-500"
                            }`}
                          >
                            {comp.status === "Active" ? "نشط وقانوني" : "مؤرشف"}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs border-t border-zinc-50 pt-3">
                          <div className="flex justify-between text-zinc-600">
                            <span>رقم السجل التجاري CR</span>
                            <span className="font-mono text-zinc-900 font-black">
                              {comp.commercialRegistration || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>الرقم الضريبي VAT</span>
                            <span className="font-mono text-zinc-900 font-black">
                              {comp.vatNumber || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>العملة الافتراضية والتقارير</span>
                            <span className="text-zinc-900 font-black">
                              {comp.defaultCurrency || "SAR"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-zinc-50 pt-4">
                        <button
                          onClick={() =>
                            handleSwitchContext(
                              userContext.activeOrganizationId,
                              comp.id,
                              undefined
                            )
                          }
                          className={`flex-1 py-2 text-xs font-black rounded-xl transition text-center ${
                            userContext.activeCompanyId === comp.id
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-50 border border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                          }`}
                        >
                          {userContext.activeCompanyId === comp.id
                            ? "الشركة الحالية النشطة"
                            : "تبديل لهذه الشركة"}
                        </button>
                        {companies.length > 1 && (
                          <button
                            onClick={() => handleDeleteCompany(comp.id)}
                            className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition"
                            title="أرشفة وحذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. BRANCHES LIST & CREATE */}
            {activeSubTab === "branches" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-black text-base text-zinc-900">
                      فروع ومواقع الشركة النشطة
                    </h3>
                    <p className="text-xs text-zinc-500">
                      الفروع والمواقع التابعة لشركة {currentComp.nameAr || "الشركة النشطة"}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateBranchModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة فرع جديد
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {branches.map((br) => (
                    <div
                      key={br.id}
                      className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-black text-base text-zinc-900">{br.nameAr}</h4>
                            <span className="text-xs font-bold text-zinc-400 font-mono">
                              {br.nameEn || br.nameAr}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 font-mono text-[10px] font-black rounded-md">
                            {br.code}
                          </span>
                        </div>

                        <div className="space-y-2 text-xs border-t border-zinc-50 pt-3">
                          <div className="flex justify-between text-zinc-600">
                            <span>المدينة والمنطقة</span>
                            <span className="text-zinc-900 font-black">{br.city || "—"}</span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>مدير الفرع / الموقع</span>
                            <span className="text-zinc-900 font-black">{br.manager || "—"}</span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>المستودع الرئيسي المرتبط</span>
                            <span className="text-zinc-900 font-black">{br.warehouse || "—"}</span>
                          </div>
                          <div className="flex justify-between text-zinc-600">
                            <span>الحساب البنكي النشط للفرع</span>
                            <span className="text-zinc-900 font-black">
                              {br.bankAccount || "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-2 border-t border-zinc-50 pt-4">
                        <button
                          onClick={() =>
                            handleSwitchContext(
                              userContext.activeOrganizationId,
                              userContext.activeCompanyId,
                              br.id
                            )
                          }
                          className={`flex-1 py-2 text-xs font-black rounded-xl transition text-center ${
                            userContext.activeBranchId === br.id
                              ? "bg-zinc-900 text-white"
                              : "bg-zinc-50 border border-zinc-200 text-zinc-800 hover:bg-zinc-100"
                          }`}
                        >
                          {userContext.activeBranchId === br.id
                            ? "الفرع الحالي النشط"
                            : "تبديل لهذا الفرع"}
                        </button>
                        {branches.length > 1 && (
                          <button
                            onClick={() => handleDeleteBranch(br.id)}
                            className="p-2 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl hover:bg-rose-100 transition"
                            title="أرشفة الفرع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. SUBSCRIPTION PLANS */}
            {activeSubTab === "subscription" && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-black text-base text-zinc-900">
                    باقات الاشتراك والفوترة والحدود التشغيلية
                  </h3>
                  <p className="text-xs text-zinc-500">
                    اختر الباقة المثلى للكيان والمؤسسة لتمكين الميزات المتقدمة وتوسيع حدود النظام
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  {subscription &&
                    Object.entries(subscription.allPlans || {}).map(
                      ([pName, pData]: [string, any]) => {
                        const isActive = subscription.activePlan === pName;
                        return (
                          <div
                            key={pName}
                            className={`rounded-3xl border p-5 flex flex-col justify-between transition-all relative ${
                              isActive
                                ? "border-zinc-950 bg-zinc-950 text-white ring-4 ring-zinc-200 shadow-xl"
                                : "border-zinc-100 bg-white text-zinc-900 hover:border-zinc-300 shadow-sm"
                            }`}
                          >
                            {isActive && (
                              <span className="absolute -top-2.5 right-6 bg-zinc-900 border border-zinc-800 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Crown className="w-3 h-3 text-amber-400" />
                                نشط حالياً
                              </span>
                            )}

                            <div>
                              <div className="mb-4">
                                <span
                                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                    isActive
                                      ? "bg-zinc-800 text-zinc-200"
                                      : "bg-zinc-100 text-zinc-700"
                                  }`}
                                >
                                  {pName}
                                </span>
                                <div className="mt-3 flex items-baseline">
                                  <span className="text-2xl font-black font-mono">
                                    {pData.price}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-bold mr-1">
                                    ر.س / شهرياً
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-2.5 text-[11px] mb-6 border-t border-zinc-100 pt-3">
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">الحد الأقصى للمستخدمين</span>
                                  <span className={isActive ? "text-white" : "text-zinc-800"}>
                                    {pData.userLimit}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">سعة الذاكرة السحابية</span>
                                  <span className={isActive ? "text-white" : "text-zinc-800"}>
                                    {pData.storageLimitGB} GB
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-zinc-400">طلبات API يومية</span>
                                  <span className={isActive ? "text-white" : "text-zinc-800"}>
                                    {pData.apiLimitDaily}
                                  </span>
                                </div>
                              </div>

                              <div className="space-y-1.5 text-[10px] text-zinc-500 font-bold">
                                {pData.features?.map((f: string, i: number) => (
                                  <div key={i} className="flex items-start gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    <span>{f}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button
                              disabled={isActive || actionLoading}
                              onClick={() => handleUpgradePlan(pName)}
                              className={`mt-6 w-full py-2 text-xs font-black rounded-xl transition ${
                                isActive
                                  ? "bg-zinc-800 text-zinc-400 cursor-default"
                                  : "bg-zinc-100 text-zinc-800 hover:bg-zinc-200"
                              }`}
                            >
                              {isActive ? "الخطة النشطة" : "ترقية والتبديل"}
                            </button>
                          </div>
                        );
                      }
                    )}
                </div>
              </div>
            )}

            {/* 5. OPERATIONAL SETTINGS */}
            {activeSubTab === "settings" && (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-black text-base text-zinc-900">إعدادات تشغيل المنظمة</h3>
                  <p className="text-xs text-zinc-500">
                    تفضيلات المعاملات المالية، أوقات العمل، والسياسات الخاصة بالمنشأة
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">السنة المالية النشطة</label>
                    <input
                      type="text"
                      value={settingsForm.fiscalYear || "2026"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, fiscalYear: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">أوقات وساعات العمل</label>
                    <input
                      type="text"
                      value={settingsForm.businessHours || "09:00 - 17:00"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, businessHours: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">
                      سياسة وتحديد عطلة نهاية الأسبوع
                    </label>
                    <select
                      value={settingsForm.weekendRules || "Friday-Saturday"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, weekendRules: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="Friday-Saturday">الجمعة والسبت</option>
                      <option value="Saturday-Sunday">السبت والأحد</option>
                      <option value="Friday">الجمعة فقط</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">
                      المنطقة الزمنية المعتمدة
                    </label>
                    <select
                      value={settingsForm.timezone || "Asia/Riyadh"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, timezone: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="Asia/Riyadh">Asia/Riyadh (مكة المكرمة)</option>
                      <option value="Asia/Dubai">Asia/Dubai (دبي)</option>
                      <option value="Europe/London">Europe/London (لندن)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 border-t border-zinc-100 pt-4">
                  <h4 className="font-black text-xs text-zinc-800">
                    قوالب نصوص الإشعارات والبريد الإلكتروني للفواتير
                  </h4>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500">
                      رسالة الفاتورة المرفقة
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.emailTemplates?.invoice || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          emailTemplates: {
                            ...(settingsForm.emailTemplates || {}),
                            invoice: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500">
                      رسالة إيصال الدفع
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.emailTemplates?.receipt || ""}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          emailTemplates: {
                            ...(settingsForm.emailTemplates || {}),
                            receipt: e.target.value,
                          },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-medium text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-md"
                >
                  حفظ إعدادات التشغيل
                </button>
              </form>
            )}

            {/* 6. BRANDING & THEME */}
            {activeSubTab === "branding" && (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-black text-base text-zinc-900">
                    هوية وتخصيص العلامة التجارية للتقارير
                  </h3>
                  <p className="text-xs text-zinc-500">
                    قم بتعيين الألوان والشعارات الموحدة لعلامتك التجارية ليتم تطبيقها على فواتير
                    ZATCA وعقود الموظفين
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-zinc-700">
                        اللون الرئيسي للعلامة (Primary Color)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.branding?.primaryColor || "#18181b"}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              branding: {
                                ...(settingsForm.branding || {}),
                                primaryColor: e.target.value,
                              },
                            })
                          }
                          className="w-10 h-10 border border-zinc-200 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settingsForm.branding?.primaryColor || "#18181b"}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              branding: {
                                ...(settingsForm.branding || {}),
                                primaryColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-2xl text-xs font-mono font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-black text-zinc-700">
                        اللون الثانوي للعلامة (Secondary Color)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={settingsForm.branding?.secondaryColor || "#71717a"}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              branding: {
                                ...(settingsForm.branding || {}),
                                secondaryColor: e.target.value,
                              },
                            })
                          }
                          className="w-10 h-10 border border-zinc-200 rounded-xl cursor-pointer"
                        />
                        <input
                          type="text"
                          value={settingsForm.branding?.secondaryColor || "#71717a"}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              branding: {
                                ...(settingsForm.branding || {}),
                                secondaryColor: e.target.value,
                              },
                            })
                          }
                          className="flex-1 px-4 py-2 bg-white border border-zinc-200 rounded-2xl text-xs font-mono font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo preview */}
                  <div className="bg-zinc-50 border border-zinc-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-xl shadow-md">
                      {currentOrg.name?.substring(0, 2) || "M"}
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-zinc-800">شعار المنظمة والشركات</h4>
                      <p className="text-[10px] text-zinc-400 font-bold">
                        يفضل رفع الشعار بصيغة SVG أو PNG بخلفية شفافة
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success("تم إدراج الشعار التلقائي للكيان في ترويسة الفواتير")
                      }
                      className="px-3 py-1.5 bg-white border border-zinc-200 hover:bg-zinc-100 text-zinc-700 text-[10px] font-black rounded-xl transition"
                    >
                      تغيير الشعار
                    </button>
                  </div>
                </div>

                <div className="space-y-4 border-t border-zinc-100 pt-4">
                  <h4 className="font-black text-xs text-zinc-800">تنسيق قوالب الفواتير الموحدة</h4>

                  <div className="flex flex-wrap gap-4 text-xs font-bold">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.invoiceTemplates?.showLogo ?? true}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            invoiceTemplates: {
                              ...(settingsForm.invoiceTemplates || {}),
                              showLogo: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-zinc-900 focus:ring-zinc-950 w-4 h-4"
                      />
                      <span>إظهار شعار المنظمة في الفواتير الصادرة</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settingsForm.invoiceTemplates?.showTaxId ?? true}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            invoiceTemplates: {
                              ...(settingsForm.invoiceTemplates || {}),
                              showTaxId: e.target.checked,
                            },
                          })
                        }
                        className="rounded text-zinc-900 focus:ring-zinc-950 w-4 h-4"
                      />
                      <span>إظهار الرقم الضريبي والسجل التجاري في الترويسة</span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-md"
                >
                  حفظ وتطبيق الهوية البصرية
                </button>
              </form>
            )}

            {/* 7. LOCALIZATION & SYSTEM FORMATS */}
            {activeSubTab === "localization" && (
              <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="font-black text-base text-zinc-900">
                    إعدادات اللغة والترجمة والتنسيق للمستندات
                  </h3>
                  <p className="text-xs text-zinc-500">
                    اختر اللغة الافتراضية للنظام والشركات، وتنسيق الأرقام والتواريخ للمعاملات
                    والتقارير
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">
                      اللغة الافتراضية للتقارير والواجهة
                    </label>
                    <select
                      value={settingsForm.language || "ar"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, language: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">الإنجليزية (English)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">
                      العملة الأساسية للمنظمة
                    </label>
                    <select
                      value={settingsForm.currency || "SAR"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, currency: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                      <option value="AED">درهم إماراتي (AED)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">تنسيق كتابة التواريخ</label>
                    <select
                      value={settingsForm.dateFormat || "YYYY-MM-DD"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, dateFormat: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="YYYY-MM-DD">YYYY-MM-DD (مثال: 2026-06-30)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (مثال: 30/06/2026)</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY (مثال: 06/30/2026)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-black text-zinc-700">
                      تنسيق كتابة الأرقام والكسور العشرية
                    </label>
                    <select
                      value={settingsForm.numberFormat || "1,234.56"}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, numberFormat: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs font-bold text-zinc-800 outline-none focus:ring-2 focus:ring-zinc-950"
                    >
                      <option value="1,234.56">1,234.56 (فاصلة آلاف ونقطة عشرية)</option>
                      <option value="1.234,56">1.234,56 (نقطة آلاف وفاصلة عشرية)</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl max-w-md">
                  <h4 className="font-black text-xs text-zinc-800 mb-2">معاينة التنسيق المختار:</h4>
                  <div className="text-xs space-y-1 text-zinc-600 font-bold">
                    <div>
                      التاريخ: <span className="font-mono text-zinc-900">2026-06-30</span>
                    </div>
                    <div>
                      المبلغ المالي:{" "}
                      <span className="font-mono text-zinc-900">
                        1,452,780.50 {settingsForm.currency}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition shadow-md"
                >
                  حفظ تنسيق النظام
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ==========================================
          MODALS
         ========================================== */}

      {/* 1. Create Organization Modal */}
      {showCreateOrgModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4"
          >
            <h3 className="font-black text-lg text-zinc-900">إنشاء منظمة / Tenant جديد</h3>
            <p className="text-xs text-zinc-500">
              سيتم تهيئة منظمة مستقلة تماماً ومحمية ومعزولة بأرقامها وعملاتها وفواتيرها الخاصة
            </p>

            <form onSubmit={handleCreateOrg} className="space-y-4 text-xs font-bold text-right">
              <div className="space-y-1">
                <label className="text-zinc-600">اسم المنظمة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مجموعة الحربي التجارية"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">الاسم القانوني الكامل</label>
                <input
                  type="text"
                  placeholder="مثال: شركة عبد الله سليمان الحربي القابضة"
                  value={newOrgLegalName}
                  onChange={(e) => setNewOrgLegalName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-600">البلد الرئيسي</label>
                  <select
                    value={newOrgCountry}
                    onChange={(e) => setNewOrgCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl"
                  >
                    <option value="SA">المملكة العربية السعودية</option>
                    <option value="AE">الإمارات العربية المتحدة</option>
                    <option value="EG">جمهورية مصر العربية</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-600">مجال العمل والقطاع</label>
                  <input
                    type="text"
                    value={newOrgIndustry}
                    onChange={(e) => setNewOrgIndustry(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">الرقم الضريبي الموحد VAT</label>
                <input
                  type="text"
                  placeholder="3000XXXXXXXXXXX"
                  value={newOrgTaxNumber}
                  onChange={(e) => setNewOrgTaxNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                />
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-black"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-black"
                >
                  إنشاء المنظمة والتهيئة
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Create Company Modal */}
      {showCreateCompModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4"
          >
            <h3 className="font-black text-lg text-zinc-900">إضافة شركة قانونية تابعة للكيان</h3>
            <p className="text-xs text-zinc-500">
              سيتم إنشاء شركة قانونية جديدة بملف ضريبي وسجل تجاري منفصل لعمليات الدفاتر المحاسبية
              المستقلة
            </p>

            <form onSubmit={handleCreateCompany} className="space-y-4 text-xs font-bold text-right">
              <div className="space-y-1">
                <label className="text-zinc-600">اسم الشركة (بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="شركة مدارج لتقنية المعلومات"
                  value={newCompanyNameAr}
                  onChange={(e) => setNewCompanyNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">اسم الشركة (بالإنجليزية)</label>
                <input
                  type="text"
                  required
                  placeholder="Madarij Tech Co."
                  value={newCompanyNameEn}
                  onChange={(e) => setNewCompanyNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-600">رقم السجل التجاري CR</label>
                  <input
                    type="text"
                    placeholder="1010XXXXXX"
                    value={newCompanyCr}
                    onChange={(e) => setNewCompanyCr(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-600">الرقم الضريبي VAT</label>
                  <input
                    type="text"
                    placeholder="3000XXXXXXXXXXX"
                    value={newCompanyVat}
                    onChange={(e) => setNewCompanyVat(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">العملة الافتراضية للشركة</label>
                <select
                  value={newCompanyCurrency}
                  onChange={(e) => setNewCompanyCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="AED">درهم إماراتي (AED)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateCompModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-black"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-black"
                >
                  إضافة الشركة وتأسيس الدفاتر
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Create Branch Modal */}
      {showCreateBranchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-100 space-y-4"
          >
            <h3 className="font-black text-lg text-zinc-900">إضافة فرع / موقع تشغيلي جديد</h3>
            <p className="text-xs text-zinc-500">
              سيتم تأسيس فرع تشغيلي جديد تحت إدارة الشركة القانونية الحالية
            </p>

            <form onSubmit={handleCreateBranch} className="space-y-4 text-xs font-bold text-right">
              <div className="space-y-1">
                <label className="text-zinc-600">اسم الفرع (بالعربية)</label>
                <input
                  type="text"
                  required
                  placeholder="فرع المنطقة الغربية - جدة"
                  value={newBranchNameAr}
                  onChange={(e) => setNewBranchNameAr(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">اسم الفرع (بالإنجليزية)</label>
                <input
                  type="text"
                  placeholder="Western Region Branch - Jeddah"
                  value={newBranchNameEn}
                  onChange={(e) => setNewBranchNameEn(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-600">كود الفرع (Code)</label>
                  <input
                    type="text"
                    required
                    placeholder="BR-02"
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-600">المدينة</label>
                  <input
                    type="text"
                    placeholder="جدة"
                    value={newBranchCity}
                    onChange={(e) => setNewBranchCity(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-600">مدير الفرع والموقع</label>
                <input
                  type="text"
                  placeholder="محمد الرويلي"
                  value={newBranchManager}
                  onChange={(e) => setNewBranchManager(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateBranchModal(false)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-black"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-xs font-black"
                >
                  تأكيد الفرع
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
