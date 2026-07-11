import React, { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Building2,
  Hash,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Globe,
  Coins,
  Clock,
  Briefcase,
  ShieldAlert,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const industries = [
  { value: "Technology", labelAr: "التقنية والبرمجيات", labelEn: "Technology & Software" },
  { value: "Retail", labelAr: "التجزئة والتجارة الإلكترونية", labelEn: "Retail & E-commerce" },
  { value: "Services", labelAr: "الخدمات المهنية والاستشارات", labelEn: "Professional Services" },
  { value: "Construction", labelAr: "المقاولات والإنشاءات", labelEn: "Construction & Contracting" },
  { value: "Healthcare", labelAr: "الرعاية الصحية والصيدليات", labelEn: "Healthcare & Pharma" },
  { value: "Manufacturing", labelAr: "الصناعة والإنتاج", labelEn: "Manufacturing" },
  { value: "General", labelAr: "نشاط عام / تجاري آخر", labelEn: "General Commercial" },
];

const countries = [
  {
    code: "SA",
    labelAr: "المملكة العربية السعودية",
    labelEn: "Saudi Arabia",
    currency: "SAR",
    flag: "🇸🇦",
  },
  {
    code: "AE",
    labelAr: "دولة الإمارات العربية المتحدة",
    labelEn: "United Arab Emirates",
    currency: "AED",
    flag: "🇦🇪",
  },
  { code: "KW", labelAr: "دولة الكويت", labelEn: "Kuwait", currency: "KWD", flag: "🇰🇼" },
  { code: "OM", labelAr: "سلطنة عمان", labelEn: "Oman", currency: "OMR", flag: "🇴🇲" },
  { code: "BH", labelAr: "مملكة البحرين", labelEn: "Bahrain", currency: "BHD", flag: "🇧🇭" },
  { code: "QA", labelAr: "دولة قطر", labelEn: "Qatar", currency: "QAR", flag: "🇶🇦" },
  { code: "EG", labelAr: "جمهورية مصر العربية", labelEn: "Egypt", currency: "EGP", flag: "🇪🇬" },
];

export default function Onboarding() {
  const { user, refreshUser, updateProfile } = useUser();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [seedingStep, setSeedingStep] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    legalName: "",
    slug: "",
    industry: "General",
    country: "SA",
    baseCurrency: "SAR",
    timezone: "Asia/Riyadh",
    language: "ar",
    taxNumber: "",
    registrationNumber: "",
  });

  const handleCountryChange = (countryCode: string) => {
    const selected = countries.find((c) => c.code === countryCode);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        country: countryCode,
        baseCurrency: selected.currency,
        timezone: countryCode === "AE" ? "Asia/Dubai" : "Asia/Riyadh",
      }));
    }
  };

  const startProvisioning = async () => {
    setLoading(true);

    // Animate seeding phases to show user the ERP scaffolding creation
    const phases = [
      "تأسيس بيئة المنظمة المعزولة بالكامل (Tenant Sandbox)...",
      "إعداد الشركاء والملف المالي والمحاسبي الموحد...",
      "تهيئة الفرع الرئيسي ومستودعات المخزون الأولية...",
      "توليد أدوار الصلاحيات القياسية (Owner, Admin, Accountant)...",
      "ربط وتفعيل لوحة القيادة الذكية (Welcome Dashboard)...",
    ];

    for (let i = 0; i < phases.length; i++) {
      setSeedingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      // Make real backend API call to create organization
      const res = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          legalName: formData.legalName || formData.name,
          slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
          country: formData.country,
          timezone: formData.timezone,
          language: formData.language,
          baseCurrency: formData.baseCurrency,
          industry: formData.industry,
          taxNumber: formData.taxNumber,
          registrationNumber: formData.registrationNumber,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to create organization");
      }

      // Sync user profile client-side
      if (updateProfile) {
        await updateProfile({
          companyName: formData.name,
          crNumber: formData.registrationNumber,
        });
      }
      if (refreshUser) {
        await refreshUser();
      }

      toast.success("تم تأسيس بيئتك المؤسسية بنجاح! جاري توجيهك...");
      setTimeout(() => {
        navigate("/app", { state: { showWelcome: true } });
      }, 1000);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء الاتصال بالخادم وتأسيس المنظمة.");
      setStep(2); // Go back to let them modify values
    } finally {
      setLoading(false);
      setSeedingStep(0);
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.name) {
        toast.error("يرجى إدخال اسم المنشأة التجاري.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
      startProvisioning();
    }
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 selection:bg-zinc-950/10"
      dir="rtl"
    >
      <ToastContainer position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden"
      >
        {/* Step Indicator Headers */}
        <div className="bg-zinc-950 px-8 py-6 text-white flex justify-between items-center border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-black text-sm tracking-wide">مدارج OS — معالج تهيئة الأعمال</h2>
              <p className="text-[10px] text-zinc-400 font-bold">
                بوابة تأسيس البنية التنظيمية متعددة المنشآت
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400">
            <span className={step >= 1 ? "text-emerald-400" : ""}>1</span>
            <span>/</span>
            <span className={step >= 2 ? "text-emerald-400" : ""}>2</span>
            <span>/</span>
            <span className={step >= 3 ? "text-emerald-400" : ""}>3</span>
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                    مرحباً بك! لنبدأ بتأسيس منشأتك
                  </h1>
                  <p className="text-zinc-500 font-semibold text-sm max-w-sm mx-auto leading-relaxed">
                    بيانات السجل والأرقام الضريبية تضمن الامتثال التام مع هيئة الزكاة والضريبة
                    والجمارك (ZATCA).
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Org Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500">
                      اسم المنشأة التجاري *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="مؤسسة مدارج للحلول الرقمية"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3.5 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                      />
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  {/* Legal Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500">
                      الاسم القانوني الكامل (كما هو في السجل التجاري)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        placeholder="شركة مدارج للحلول الرقمية المحدودة"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3.5 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                      />
                      <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  {/* CR and VAT Number Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500">
                        رقم السجل التجاري (CR)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.registrationNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, registrationNumber: e.target.value })
                          }
                          placeholder="1010123456"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                        />
                        <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500">
                        الرقم الضريبي (VAT - 15 خانة)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={15}
                          value={formData.taxNumber}
                          onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                          placeholder="300012345600003"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3 text-sm font-bold text-zinc-900 focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300 font-mono"
                        />
                        <Hash className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Industry Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500">قطاع المنشأة الرئيسي</label>
                    <div className="relative">
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-900"
                      >
                        {industries.map((ind) => (
                          <option key={ind.value} value={ind.value}>
                            {ind.labelAr}
                          </option>
                        ))}
                      </select>
                      <Briefcase className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="w-full bg-zinc-900 text-white py-4 flex items-center justify-center gap-2 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                >
                  <span>متابعة إعداد الإقليم والعملات</span>
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center space-y-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-black text-zinc-900 leading-tight">
                    المنطقة والموقع والمزامنة الزمنية
                  </h1>
                  <p className="text-zinc-500 font-semibold text-sm max-w-sm mx-auto leading-relaxed">
                    نستخدم هذه الإعدادات لهيكلة جداول الرواتب والعملات الافتراضية والفوترة
                    الإلكترونية تلقائياً.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Country Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500">
                      دولة المقر والولاية القضائية *
                    </label>
                    <div className="relative">
                      <select
                        value={formData.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-900"
                      >
                        {countries.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.labelAr}
                          </option>
                        ))}
                      </select>
                      <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    </div>
                  </div>

                  {/* Currency and Timezone Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500">
                        عملة النظام الأساسية (Base Currency)
                      </label>
                      <div className="relative">
                        <select
                          value={formData.baseCurrency}
                          onChange={(e) =>
                            setFormData({ ...formData, baseCurrency: e.target.value })
                          }
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-900"
                        >
                          <option value="SAR">SAR — ريال سعودي</option>
                          <option value="AED">AED — درهم إماراتي</option>
                          <option value="KWD">KWD — دينار كويتي</option>
                          <option value="OMR">OMR — ريال عماني</option>
                          <option value="BHD">BHD — دينار بحريني</option>
                          <option value="QAR">QAR — ريال قطري</option>
                          <option value="EGP">EGP — جنيه مصري</option>
                          <option value="USD">USD — دولار أمريكي</option>
                        </select>
                        <Coins className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-zinc-500">
                        المنطقة الزمنية (Timezone)
                      </label>
                      <div className="relative">
                        <select
                          value={formData.timezone}
                          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-900"
                        >
                          <option value="Asia/Riyadh">Riyadh (GMT+03:00)</option>
                          <option value="Asia/Dubai">Dubai (GMT+04:00)</option>
                          <option value="Asia/Kuwait">Kuwait (GMT+03:00)</option>
                          <option value="Asia/Qatar">Qatar (GMT+03:00)</option>
                          <option value="Asia/Muscat">Muscat (GMT+04:00)</option>
                          <option value="Africa/Cairo">Cairo (GMT+02:00)</option>
                        </select>
                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      </div>
                    </div>
                  </div>

                  {/* Pref Language */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-zinc-500">
                      لغة واجهة النظام الرئيسية
                    </label>
                    <div className="relative">
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-900"
                      >
                        <option value="ar">العربية (الأصلية والافتراضية)</option>
                        <option value="en">English (US)</option>
                      </select>
                      <Globe className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-zinc-100 text-zinc-700 py-4 flex items-center justify-center gap-2 rounded-2xl font-black text-sm hover:bg-zinc-200 transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-[2] bg-zinc-900 text-white py-4 flex items-center justify-center gap-2 rounded-2xl font-black text-sm hover:bg-zinc-800 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
                  >
                    <span>تأسيس المنظمة والبدء</span>
                    <Sparkles className="w-4 h-4 text-amber-400 animate-bounce" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 space-y-8 text-center animate-pulse"
              >
                <div className="w-24 h-24 bg-zinc-950 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl relative">
                  <Loader2 className="w-12 h-12 animate-spin absolute" />
                  <Building2 className="w-6 h-6 text-white" />
                </div>

                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-zinc-900">
                    جاري تشييد منظمتك السحابية...
                  </h2>
                  <p className="text-zinc-500 font-bold text-sm max-w-sm mx-auto leading-relaxed">
                    يرجى الانتظار لحين اكتمال توليد وفصل الجداول ومفاتيح التشفير الآمنة.
                  </p>
                </div>

                {/* Provision Steps */}
                <div className="max-w-md mx-auto bg-zinc-50 border border-zinc-100 rounded-3xl p-6 text-right space-y-4">
                  {[
                    "تأسيس بيئة المنظمة المعزولة بالكامل (Tenant Sandbox)",
                    "إعداد الشركاء والملف المالي والمحاسبي الموحد",
                    "تهيئة الفرع الرئيسي ومستودعات المخزون الأولية",
                    "توليد أدوار الصلاحيات القياسية (Owner, Admin, Accountant)",
                    "ربط وتفعيل لوحة القيادة الذكية (Welcome Dashboard)",
                  ].map((phase, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 text-xs font-bold transition-all duration-300"
                    >
                      {seedingStep > idx ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : seedingStep === idx ? (
                        <Loader2 className="w-5 h-5 text-zinc-900 animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-zinc-200 bg-white shrink-0" />
                      )}
                      <span
                        className={
                          seedingStep === idx
                            ? "text-zinc-900 font-black"
                            : seedingStep > idx
                              ? "text-zinc-500"
                              : "text-zinc-300"
                        }
                      >
                        {phase}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
