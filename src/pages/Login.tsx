import React, { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Globe,
  Check,
  X,
  Key,
  Shield,
  Smartphone,
  Info,
} from "lucide-react";
import { Logo } from "@/src/components/Logo";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const dict = {
  ar: {
    login: "تسجيل الدخول",
    register: "إنشاء حساب جديد",
    email: "البريد الإلكتروني للعمل",
    password: "كلمة المرور",
    confirmPassword: "تأكيد كلمة المرور",
    fullName: "الاسم الكامل",
    avatar: "رابط الصورة الشخصية (اختياري)",
    country: "البلد",
    preferredLanguage: "اللغة المفضلة",
    submitLogin: "تسجيل الدخول الآمن",
    submitRegister: "إنشاء الحساب والبدء",
    agreeTerms: "أوافق على الشروط والأحكام وسياسة الخصوصية لمدارج OS",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    noAccount: "ليس لديك حساب؟",
    googleSignIn: "باستخدام حساب جوجل",
    demoSignIn: "الدخول المباشر بنمط التجربة (Offline Bypass)",
    backToHome: "العودة للصفحة الرئيسية",
    capsLockOn: "تنبيه: زر الحروف الكبيرة (Caps Lock) مفعل!",
    passwordGenerator: "توليد كلمة مرور قوية وتلقائية",
    passwordStrength: "قوة كلمة المرور",
    strength1: "ضعيفة جداً",
    strength2: "متوسطة الحماية",
    strength3: "قوية وآمنة",
    strength4: "ممتازة (موصى بها)",
    reqLength: "على الأقل 12 حرفاً",
    reqUpper: "حرف كبير (A-Z)",
    reqLower: "حرف صغير (a-z)",
    reqNumber: "رقم (0-9)",
    reqSymbol: "رمز خاص (@, #, $, ...)",
    errorEmpty: "يرجى إدخال جميع الحقول المطلوبة.",
    errorMatch: "كلمات المرور غير متطابقة.",
    errorTerms: "يجب الموافقة على الشروط والأحكام المعتمدة.",
    carousel1Title: "مزامنة سحابية فائقة الأمان",
    carousel1Desc:
      "تشفير كامل لكافة فواتيرك وبياناتك المالية بالتوافق مع معايير الهيئة والأمان العالمي.",
    carousel2Title: "إدارة متكاملة لعدة منشآت",
    carousel2Desc:
      "تنظيم وهيكلة الفروع والمستودعات في نظام مركزي واحد للمحاسبة والمخزون وحماية الأجور.",
    carousel3Title: "حماية الأجور والامتثال المالي",
    carousel3Desc: "أتمتة رواتب الموظفين بنقرة واحدة ورفع ملفات حماية الأجور (WPS) بآمان تام.",
  },
  en: {
    login: "Sign In",
    register: "Create New Account",
    email: "Business Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    fullName: "Full Name",
    avatar: "Profile Image URL (Optional)",
    country: "Country",
    preferredLanguage: "Preferred Language",
    submitLogin: "Secure Sign In",
    submitRegister: "Create Account & Get Started",
    agreeTerms: "I agree to the Terms of Service & Privacy Policy of Madarij OS",
    alreadyHaveAccount: "Already have an account?",
    noAccount: "Don't have an account?",
    googleSignIn: "Continue with Google",
    demoSignIn: "Direct Sign In - Offline Demo Bypass",
    backToHome: "Back to Home Page",
    capsLockOn: "Warning: Caps Lock is active!",
    passwordGenerator: "Generate Strong Password",
    passwordStrength: "Password Strength",
    strength1: "Very Weak",
    strength2: "Medium Protection",
    strength3: "Strong & Secure",
    strength4: "Excellent (Recommended)",
    reqLength: "At least 12 characters",
    reqUpper: "Uppercase letter (A-Z)",
    reqLower: "Lowercase letter (a-z)",
    reqNumber: "Number (0-9)",
    reqSymbol: "Special symbol (@, #, $, ...)",
    errorEmpty: "Please enter all required fields.",
    errorMatch: "Passwords do not match.",
    errorTerms: "You must accept the terms and conditions.",
    carousel1Title: "Ultra-Secure Cloud Sync",
    carousel1Desc:
      "Full AES-256 encryption of all invoices and financial records compliant with global security regulations.",
    carousel2Title: "Multi-Tenant Integration",
    carousel2Desc:
      "Seamlessly organize branches, companies, and warehouses inside a single unified system.",
    carousel3Title: "WPS & Payroll Compliance",
    carousel3Desc:
      "Automate employee wages and submit Wage Protection files securely with one click.",
  },
};

export default function Login() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [country, setCountry] = useState("SA");
  const [prefLang, setPrefLang] = useState("ar");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref");
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginDemoOffline } = useUser();
  const navigate = useNavigate();

  // Rotate brand testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % 3);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState("CapsLock")) {
      setCapsLock(true);
    } else {
      setCapsLock(false);
    }
  };

  const generateSecurePassword = () => {
    const length = 16;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setPassword(retVal);
    if (!isLogin) {
      setConfirmPassword(retVal);
    }
    // Copy to clipboard
    navigator.clipboard.writeText(retVal);
    toast.success(
      lang === "ar"
        ? "تم توليد كلمة مرور قوية ونسخها لحافظتك!"
        : "Strong password generated and copied to clipboard!"
    );
  };

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (!pwd)
      return {
        score,
        label: lang === "ar" ? "أدخل كلمة المرور" : "Enter password",
        color: "bg-zinc-200",
        width: "w-0",
      };
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2)
      return { score, label: dict[lang].strength1, color: "bg-rose-500", width: "w-1/4" };
    if (score === 3)
      return { score, label: dict[lang].strength2, color: "bg-amber-500", width: "w-2/4" };
    if (score === 4)
      return { score, label: dict[lang].strength3, color: "bg-blue-500", width: "w-3/4" };
    return { score, label: dict[lang].strength4, color: "bg-emerald-500", width: "w-full" };
  };

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      const success = await loginWithGoogle();
      if (success) {
        navigate("/app");
      } else {
        setError(
          lang === "ar" ? "فشل تسجيل الدخول باستخدام جوجل." : "Google authentication failed."
        );
      }
    } catch (err: any) {
      setError(
        lang === "ar"
          ? "حدث خطأ أثناء تسجيل الدخول: " + (err.message || "خطأ غير معروف")
          : "An error occurred: " + (err.message || "Unknown error")
      );
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      setError(dict[lang].errorEmpty);
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      setError(dict[lang].errorMatch);
      return;
    }
    if (!isLogin && !acceptTerms) {
      setError(dict[lang].errorTerms);
      return;
    }

    setError("");
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        // Create user
        // @ts-ignore
        await registerWithEmail(email, password, name, avatar, refCode || undefined);
      }
      navigate("/app");
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        setError(lang === "ar" ? "البريد الإلكتروني مسجل مسبقاً." : "Email is already in use.");
      } else if (err.code === "auth/wrong-password") {
        setError(lang === "ar" ? "كلمة المرور غير صحيحة." : "Incorrect password.");
      } else if (err.code === "auth/user-not-found") {
        setError(
          lang === "ar"
            ? "لم يتم العثور على حساب بهذا البريد."
            : "No account found with this email."
        );
      } else if (err.code === "auth/operation-not-allowed") {
        setError(
          lang === "ar"
            ? "التسجيل بالبريد غير مفعل في Firebase."
            : "Email sign-in is disabled in Firebase."
        );
      } else if (
        err.code === "auth/network-request-failed" ||
        (err.message && err.message.includes("network-request-failed"))
      ) {
        setError(
          lang === "ar"
            ? "فشل اتصال الشبكة. اضغط على الدخول المباشر بنمط التجربة أدناه."
            : "Network connection failed. Click Direct Sign In below to bypass."
        );
      } else {
        setError("Error: " + (err.message || "Unknown error"));
      }
    }
  };

  const text = dict[lang];
  const strengthInfo = getPasswordStrength(password);

  return (
    <div
      className="min-h-screen bg-zinc-50 flex font-sans antialiased"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <ToastContainer position={lang === "ar" ? "top-right" : "top-left"} />

      {/* Brand presentation panel - Left on LTR / Right on RTL (Desktop-only) */}
      <div className="hidden lg:flex w-1/2 bg-zinc-950 p-12 flex-col justify-between text-white relative overflow-hidden select-none">
        {/* Abstract backdrop decor */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#18181b,transparent_70%)] opacity-80" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

        {/* Grid pattern overlays */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="relative z-10">
          <Logo theme="dark" iconClassName="w-12 h-12" textClassName="text-2xl" />
        </div>

        {/* Carousel of dynamic benefits */}
        <div className="relative z-10 my-auto max-w-md space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={carouselIndex}
              initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="inline-flex p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                {carouselIndex === 0 && <Shield className="w-8 h-8 text-emerald-400" />}
                {carouselIndex === 1 && <Sparkles className="w-8 h-8 text-amber-400" />}
                {carouselIndex === 2 && <Smartphone className="w-8 h-8 text-indigo-400" />}
              </div>
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                {carouselIndex === 0 && text.carousel1Title}
                {carouselIndex === 1 && text.carousel2Title}
                {carouselIndex === 2 && text.carousel3Title}
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed font-medium">
                {carouselIndex === 0 && text.carousel1Desc}
                {carouselIndex === 1 && text.carousel2Desc}
                {carouselIndex === 2 && text.carousel3Desc}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Indicators */}
          <div className="flex gap-2 pt-2">
            {[0, 1, 2].map((idx) => (
              <button
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${carouselIndex === idx ? "w-8 bg-emerald-500" : "w-2 bg-white/20 hover:bg-white/40"}`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Footnotes */}
        <div className="relative z-10 flex justify-between items-center border-t border-white/5 pt-6 text-zinc-500 text-xs font-semibold">
          <span>© 2026 Madarij OS</span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            ZATCA Phase 2 Certified
          </span>
        </div>
      </div>

      {/* Main Authentication Panel - LTR Right / RTL Left */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative">
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
          {/* Main Logo for mobile screens */}
          <div className="lg:hidden">
            <Logo iconClassName="w-8 h-8" textClassName="text-lg" />
          </div>

          {/* Bilingual Language Switcher */}
          <button
            type="button"
            onClick={() => setLang((prev) => (prev === "ar" ? "en" : "ar"))}
            className="flex items-center gap-2 bg-white hover:bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 transition-colors cursor-pointer shadow-sm ml-auto"
          >
            <Globe className="w-4 h-4 text-zinc-500" />
            <span>{lang === "ar" ? "English (US)" : "العربية (SA)"}</span>
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-10 border border-zinc-200 shadow-xl shadow-zinc-100/50 space-y-6 mt-12 md:mt-0"
        >
          {/* Card Headers */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight leading-tight">
              {isLogin ? text.login : text.register}
            </h1>
            <p className="text-zinc-500 text-sm font-semibold max-w-xs mx-auto leading-relaxed">
              {isLogin
                ? lang === "ar"
                  ? "مرحباً بك مجدداً في نظام تخطيط الموارد الخليجي مدارج OS."
                  : "Welcome back to Madarij OS Gulf ERP."
                : lang === "ar"
                  ? "انضم إلينا اليوم وأسس منظمتك السحابية المعزولة بالكامل."
                  : "Join us today and provision your isolated cloud organization."}
            </p>
          </div>

          {/* Switch Tab login / register */}
          <div className="flex p-1 bg-zinc-100 rounded-2xl">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              {text.login}
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
              }}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer ${!isLogin ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              {text.register}
            </button>
          </div>

          {/* Authentication Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Full Name field (Register only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    {text.fullName}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === "ar" ? "عبدالله الحربي" : "Abdullah Al-Harbi"}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {text.country}
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-700"
                    >
                      <option value="SA">🇸🇦 السعودية (SAR)</option>
                      <option value="AE">🇦🇪 الإمارات (AED)</option>
                      <option value="KW">🇰🇼 الكويت (KWD)</option>
                      <option value="OM">🇴🇲 عمان (OMR)</option>
                      <option value="BH">🇧🇭 البحرين (BHD)</option>
                      <option value="QA">🇶🇦 قطر (QAR)</option>
                      <option value="EG">🇪🇬 مصر (EGP)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      {text.preferredLanguage}
                    </label>
                    <select
                      value={prefLang}
                      onChange={(e) => setPrefLang(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all text-zinc-700"
                    >
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    {text.avatar}
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://api.dicebear.com/7.x/avataaars/svg"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300 font-mono"
                    dir="ltr"
                  />
                </div>
              </motion.div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                {text.email}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                  dir="ltr"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {text.password}
                </label>
                {/* Secure Password Generator (Register-only) */}
                {!isLogin && (
                  <button
                    type="button"
                    onClick={generateSecurePassword}
                    className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Key className="w-3 h-3" />
                    {text.passwordGenerator}
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••••••"
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                  dir="ltr"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Caps Lock Indicator */}
              {capsLock && (
                <div className="flex items-center gap-1.5 text-amber-600 font-bold text-[10px] py-1 animate-pulse">
                  <Info className="w-3.5 h-3.5" />
                  <span>{text.capsLockOn}</span>
                </div>
              )}
            </div>

            {/* Confirm Password (Register-only) */}
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-1.5"
              >
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  {text.confirmPassword}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="••••••••••••"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-12 py-3.5 text-sm font-bold focus:ring-2 focus:ring-zinc-950/10 outline-none hover:border-zinc-300 transition-all placeholder:text-zinc-300"
                    dir="ltr"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                </div>
              </motion.div>
            )}

            {/* Interactive Password Strength Checklist (Register-only) */}
            {!isLogin && password && (
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3 animate-in fade-in duration-300">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wide">
                    {text.passwordStrength}:
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full text-white ${strengthInfo.color}`}
                  >
                    {strengthInfo.label}
                  </span>
                </div>
                {/* Bar */}
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${strengthInfo.color} ${strengthInfo.width}`}
                  />
                </div>
                {/* List requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-[10px] font-semibold text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    {password.length >= 12 ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <span>{text.reqLength}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/[A-Z]/.test(password) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <span>{text.reqUpper}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/[a-z]/.test(password) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <span>{text.reqLower}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/[0-9]/.test(password) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <span>{text.reqNumber}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    {/[^A-Za-z0-9]/.test(password) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-zinc-300" />
                    )}
                    <span>{text.reqSymbol}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Accept Terms (Register only) */}
            {!isLogin && (
              <label className="flex items-start gap-3 cursor-pointer group pt-1">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 rounded border-zinc-300 text-zinc-950 focus:ring-zinc-950 h-4 w-4 cursor-pointer"
                />
                <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-700 transition-colors">
                  {text.agreeTerms}
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-black text-xs hover:bg-zinc-800 transition-all active:scale-[0.99] shadow-md shadow-zinc-950/10 cursor-pointer"
            >
              {isLogin ? text.submitLogin : text.submitRegister}
            </button>
          </form>

          {/* Separation indicator */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200" />
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              or
            </span>
          </div>

          {/* Social and Demo Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white text-zinc-900 border border-zinc-200 py-3.5 rounded-2xl font-black text-xs hover:border-zinc-900 hover:bg-zinc-50 transition-all active:scale-[0.99] flex items-center justify-center gap-3 shadow-sm group cursor-pointer"
            >
              <svg
                className="w-4 h-4 group-hover:scale-110 transition-transform"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{text.googleSignIn}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loginDemoOffline();
                navigate("/app");
              }}
              className="w-full bg-emerald-50 text-emerald-800 border border-emerald-200 py-3.5 rounded-2xl font-black text-xs hover:bg-emerald-100/70 transition-all active:scale-[0.99] flex items-center justify-center gap-3 shadow-sm group cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>{text.demoSignIn}</span>
            </button>
          </div>

          {/* Dynamic Error Container */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                <p className="text-[10px] font-black text-rose-600">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Back to Home Button */}
          <div className="pt-2">
            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 text-zinc-400 hover:text-zinc-600 font-bold text-xs transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{text.backToHome}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
