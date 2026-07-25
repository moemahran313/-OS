import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  KeyRound,
  ShieldCheck,
  Download,
  Server,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Sparkles,
  Lock,
  Building2,
  Calendar,
  Layers,
  Settings,
  Bell,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";

interface CsidStatus {
  onboarded: boolean;
  status: "ACTIVE" | "EXPIRING_SOON" | "EXPIRED" | "NOT_ONBOARDED";
  sellerVat?: string;
  companyName?: string;
  commonName?: string;
  serialNumber?: string;
  certFingerprintSha256?: string;
  environment?: string;
  issueDate?: string;
  expiryDate?: string;
  daysRemaining?: number;
  lastRenewedAt?: string;
  autoRenewConfig?: {
    enabled: boolean;
    renewBeforeDays: number;
    notifyEmail: string;
  };
  message?: string;
}

export function ZatcaConfig() {
  const [csidStatus, setCsidStatus] = useState<CsidStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  // Onboarding Form States
  const [step, setStep] = useState(1);
  const [sellerVat, setSellerVat] = useState("310123456700003");
  const [companyName, setCompanyName] = useState("شركة الحلول السعودية المتقدمة");
  const [commonName, setCommonName] = useState("Riyadh Main POS Terminal 01");
  const [location, setLocation] = useState("Riyadh Main Branch");
  const [environment, setEnvironment] = useState<"production" | "simulation" | "sandbox">("production");
  const [otpToken, setOtpToken] = useState("");
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Renewal Modal States
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [renewalOtp, setRenewalOtp] = useState("");
  const [isRenewing, setIsRenewing] = useState(false);

  // Auto-Renew Toggle State
  const [isUpdatingAutoRenew, setIsUpdatingAutoRenew] = useState(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  const fetchCsidStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const res = await fetch("/api/zatca/csid/status", {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setCsidStatus(data);
      }
    } catch (err) {
      console.error("Failed to fetch ZATCA CSID status:", err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchCsidStatus();
  }, []);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpToken || otpToken.trim().length < 4) {
      toast.error("يرجى إدخال رمز OTP المكون من 6 أرقام من منصة فاتورة");
      return;
    }

    setIsOnboarding(true);
    try {
      const res = await fetch("/api/zatca/csid/onboard", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          otp: otpToken,
          sellerVat,
          companyName,
          commonName,
          location,
          environment,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل التأهيل التلقائي مع هيئة الزكاة");
      }

      toast.success(data.message || "تم التأهيل والربط مع منصة فاتورة بنجاح!");
      setCsidStatus(data.csid);
      setStep(1);
      setOtpToken("");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التأهيل التلقائي");
    } finally {
      setIsOnboarding(false);
    }
  };

  const handleManualRenewal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRenewing(true);
    try {
      const res = await fetch("/api/zatca/csid/renew", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          otp: renewalOtp || "123456",
          reason: "تجديد شهادة CSID يدويًا بواسطة مدير النظام",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "فشل تجديد شهادة CSID");
      }

      toast.success("تم تجديد شهادة ZATCA CSID بنجاح لمدة سنة إضافية!");
      setCsidStatus(data.csid);
      setShowRenewalModal(false);
      setRenewalOtp("");
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ أثناء التجديد");
    } finally {
      setIsRenewing(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!csidStatus) return;
    setIsUpdatingAutoRenew(true);
    const newEnabledState = !(csidStatus.autoRenewConfig?.enabled ?? true);

    try {
      const res = await fetch("/api/zatca/csid/auto-renew-config", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          enabled: newEnabledState,
          renewBeforeDays: csidStatus.autoRenewConfig?.renewBeforeDays || 30,
          notifyEmail: csidStatus.autoRenewConfig?.notifyEmail || "compliance@bizos.sa",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "تم تحديث سياسة التجديد التلقائي");
        setCsidStatus((prev) =>
          prev
            ? {
                ...prev,
                autoRenewConfig: {
                  ...prev.autoRenewConfig!,
                  enabled: newEnabledState,
                },
              }
            : null
        );
      }
    } catch (err) {
      toast.error("فشل حفظ إعدادات التجديد التلقائي");
    } finally {
      setIsUpdatingAutoRenew(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 border border-zinc-200/80 shadow-xl space-y-8 dir-rtl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-zinc-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-zinc-900">ربط وتأهيل شهادات ZATCA (CSID)</h2>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                المرحلة الثانية ZATCA
              </span>
            </div>
            <p className="text-zinc-500 font-bold text-sm mt-1">
              التأهيل التلقائي عبر رموز OTP وتجديد الشهادات الكربتوجرافية في الخلفية (Cryptographic Stamp Identifier)
            </p>
          </div>
        </div>

        <button
          onClick={fetchCsidStatus}
          disabled={isLoadingStatus}
          className="self-start md:self-auto flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isLoadingStatus ? "animate-spin" : ""}`} />
          <span>تحديث حالة الشهادة</span>
        </button>
      </div>

      {/* Active CSID Dashboard if Onboarded */}
      {csidStatus?.onboarded ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Main Status Badge Card */}
          <div className="p-6 bg-gradient-to-br from-zinc-900 to-slate-900 text-white rounded-3xl shadow-xl relative overflow-hidden border border-zinc-800">
            <div className="absolute top-0 left-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck className="w-64 h-64 text-emerald-400" />
            </div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]" />
                  <span className="font-black text-sm uppercase tracking-wider text-emerald-400">
                    شهادة CSID إنتاجية نشطة ومعتمدة
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                    {csidStatus.environment?.toUpperCase() || "PRODUCTION"}
                  </span>
                  <span className="bg-white/10 text-white/90 text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/20">
                    Serial: {csidStatus.serialNumber}
                  </span>
                </div>
              </div>

              {/* Company & Vat Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-bold block">اسم المنشأة المسجلة</span>
                  <p className="font-black text-lg text-white">{csidStatus.companyName}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-bold block">الرقم الضريبي (VAT)</span>
                  <p className="font-mono font-black text-lg text-amber-400">{csidStatus.sellerVat}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-zinc-400 font-bold block">الجهاز / الفرع المرتبط</span>
                  <p className="font-bold text-sm text-zinc-200">{csidStatus.commonName}</p>
                </div>
              </div>

              {/* Countdown & Expiry Progress Bar */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-zinc-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    المتبقي على صلاحية الشهادة الكربتوجرافية:
                  </span>
                  <span className="text-emerald-300 font-black text-sm">{csidStatus.daysRemaining} يوم</span>
                </div>

                <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (csidStatus.daysRemaining || 0) < 30
                        ? "bg-amber-400"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400"
                    }`}
                    style={{ width: `${Math.min(100, Math.max(5, ((csidStatus.daysRemaining || 365) / 365) * 100))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                  <span>تاريخ الإصدار: {csidStatus.issueDate ? new Date(csidStatus.issueDate).toLocaleDateString("ar-SA") : "الآن"}</span>
                  <span>تاريخ الانتهاء: {csidStatus.expiryDate ? new Date(csidStatus.expiryDate).toLocaleDateString("ar-SA") : "بعد سنة"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Grid: Background Renewal & Manual Renewal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto-Renewal Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-base">التجديد التلقائي في الخلفية</h4>
                    <p className="text-xs font-bold text-zinc-500">Auto-Renew Before Certificate Expiry</p>
                  </div>
                </div>

                <button
                  onClick={handleToggleAutoRenew}
                  disabled={isUpdatingAutoRenew}
                  className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer p-1 ${
                    csidStatus.autoRenewConfig?.enabled ? "bg-emerald-600" : "bg-zinc-300"
                  }`}
                >
                  <div
                    className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                      csidStatus.autoRenewConfig?.enabled ? "translate-x-0" : "-translate-x-6"
                    }`}
                  />
                </button>
              </div>

              <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                عند تفعيل الخيار، ستقوم المنصة تلقائيًا بتجديد شهادة الـ CSID قبل انتهائها بـ{" "}
                <span className="font-bold text-indigo-700">{csidStatus.autoRenewConfig?.renewBeforeDays || 30} يومًا</span> بدون أي توقف
                في عمليات إرسال الفواتير الضريبية إلى ZATCA.
              </p>

              <div className="flex items-center gap-2 pt-2 text-xs font-bold text-zinc-500">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span>إشعارات التجديد: {csidStatus.autoRenewConfig?.notifyEmail}</span>
              </div>
            </div>

            {/* Manual Renewal Trigger Card */}
            <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-3xl space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-black text-zinc-900 text-base">التجديد المباشر بـ OTP جديد</h4>
                    <p className="text-xs font-bold text-emerald-800">توليد مفاتيح وشهادة جديدة فورية</p>
                  </div>
                </div>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  يمكنك إعادة تجديد الشهادة في أي وقت باستخدام رمز OTP صادر حديثًا من بوابة الفاتورة الخاصة بهيئة الزكاة.
                </p>
              </div>

              <button
                onClick={() => setShowRenewalModal(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-6 rounded-2xl shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <KeyRound className="w-4 h-4" />
                <span>إدخال رمز OTP والتجديد الآن</span>
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        /* Multi-Step Onboarding View */
        <div className="space-y-8">
          {/* Step Stepper Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              className={`p-4 rounded-2xl border-2 transition-all ${
                step >= 1 ? "border-emerald-600 bg-emerald-50/50 text-emerald-900" : "border-zinc-100 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    step >= 1 ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  1
                </div>
                <span className="font-black text-sm">بيانات المنشأة الضريبية</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 transition-all ${
                step >= 2 ? "border-emerald-600 bg-emerald-50/50 text-emerald-900" : "border-zinc-100 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    step >= 2 ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  2
                </div>
                <span className="font-black text-sm">توليد المفاتيح (secp256k1)</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 transition-all ${
                step >= 3 ? "border-emerald-600 bg-emerald-50/50 text-emerald-900" : "border-zinc-100 text-zinc-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    step >= 3 ? "bg-emerald-600 text-white" : "bg-zinc-200 text-zinc-500"
                  }`}
                >
                  3
                </div>
                <span className="font-black text-sm">إدخال OTP التأهيل المباشر</span>
              </div>
            </div>
          </div>

          {/* Form Step 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-2xl">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 text-xs font-bold leading-relaxed flex items-start gap-3">
                <Building2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-black text-sm mb-1">الربط مع بوابة فاتورة ZATCA Fatoora Portal</p>
                  يرجى التأكد من أن الرقم الضريبي واسم الشركة يطابقان البيانات المدخلة في حساب منشأتك بـ ZATCA.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700">الرقم الضريبي للمنشأة (15 رقم)</label>
                  <input
                    type="text"
                    maxLength={15}
                    value={sellerVat}
                    onChange={(e) => setSellerVat(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-sm font-bold text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700">اسم المنشأة المسجلة</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700">معرف الجهاز / الفرع (Common Name)</label>
                  <input
                    type="text"
                    value={commonName}
                    onChange={(e) => setCommonName(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700">بيئة الربط والهيئة</label>
                  <select
                    value={environment}
                    onChange={(e: any) => setEnvironment(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  >
                    <option value="production">بيئة الإنتاج المباشر (Production CSID)</option>
                    <option value="simulation">بيئة المحاكاة والاختبار (Simulation)</option>
                    <option value="sandbox">بيئة المطورين التجريبية (Sandbox)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="bg-zinc-900 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg hover:scale-[1.01] transition-all cursor-pointer"
              >
                المتابعة إلى توليد مفاتيح التشفير
              </button>
            </motion.div>
          )}

          {/* Form Step 2 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-2xl">
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3 text-emerald-900">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-black text-base">تم تجهيز خوارزمية التشفير القياسية (secp256k1 ECDSA)</h4>
                </div>
                <p className="text-xs font-bold leading-relaxed opacity-90">
                  سيتم إنشاء مفتاح خاص آمن وتضمين شفرة الـ SHA-256 CSR Digest طبقاً لاشتراطات اللائحة التنفيذية للفرع
                  الفني بهيئة الزكاة والضريبة والجمارك (ZATCA).
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep(3)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg transition-all cursor-pointer"
                >
                  متابعة إلى خطوة إدخال رمز OTP
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="text-zinc-500 font-bold text-xs hover:underline cursor-pointer"
                >
                  تعديل البيانات
                </button>
              </div>
            </motion.div>
          )}

          {/* Form Step 3: ZATCA Portal OTP Submission */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 max-w-2xl">
              <form onSubmit={handleOnboardSubmit} className="space-y-6">
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-zinc-900 text-base">رمز OTP الخاص ببوابة فاتورة</h4>
                      <p className="text-xs text-zinc-500 font-bold">ZATCA Developer Portal OTP Token</p>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    ادخل إلى بوابة "فاتورة" لهيئة الزكاة والضريبة والجمارك، واذهب إلى إدارة الأجهزة، ثم قم بتوليد رمز OTP
                    جديد للوحدة وأدخله هنا:
                  </p>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-700 uppercase">رمز OTP (6 أرقام)</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otpToken}
                      onChange={(e) => setOtpToken(e.target.value)}
                      className="w-full px-4 py-3.5 bg-white border border-zinc-300 rounded-2xl font-mono text-center tracking-[0.6em] text-2xl font-black text-emerald-700 focus:ring-4 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={isOnboarding}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-8 py-4 rounded-2xl shadow-xl transition-all flex items-center gap-3 disabled:opacity-50 cursor-pointer"
                  >
                    {isOnboarding ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الاتصال بـ ZATCA والتأهيل...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>إتمام الربط والتأهيل التلقائي وإصدار CSID</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="text-zinc-500 font-bold text-xs hover:underline cursor-pointer"
                  >
                    السابق
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      )}

      {/* Renewal Modal Dialog */}
      <AnimatePresence>
        {showRenewalModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-zinc-200 space-y-6 dir-rtl"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-zinc-900">تجديد شهادة CSID</h3>
                </div>
                <button
                  onClick={() => setShowRenewalModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold text-xl cursor-pointer"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleManualRenewal} className="space-y-4">
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  أدخل رمز OTP صادر حديثًا من بوابة فاتورة لإعادة اصدار شهادة CSID وتحديث التوقيع الرقمي فورًا:
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-zinc-700">رمز OTP من منصة فاتورة</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={renewalOtp}
                    onChange={(e) => setRenewalOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-center tracking-[0.4em] text-lg font-black text-zinc-900 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isRenewing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isRenewing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري التجديد...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>تأكيد التجديد الآن</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRenewalModal(false)}
                    className="px-4 py-3 bg-zinc-100 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-200 cursor-pointer"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

