import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Heart,
  Globe,
  Users,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Target,
  Award,
  Search,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  Shield,
  Zap,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  BarChart2,
  Check,
  Loader2,
  Building2,
  MapPin,
  Send,
  Cpu,
  FileText,
} from "lucide-react";
import { Logo } from "@/src/components/Logo";
import Navbar from "@/src/components/Navbar";
import { useSettings } from "@/src/contexts/SettingsContext";

interface KeywordItem {
  keyword: string;
  intent: string;
  potentialVolume: string;
  reason: string;
}

interface SeoActionItem {
  title: string;
  description: string;
  impact: string;
  effort: string;
  implementation: string;
}

interface LocalInsightItem {
  title: string;
  insight: string;
}

interface SeoAnalysisResult {
  paretoKeywords: KeywordItem[];
  seoActions: SeoActionItem[];
  localInsights: LocalInsightItem[];
  leadUpliftProjection: {
    beforeTrafficQuality: number;
    afterTrafficQuality: number;
    explanation: string;
  };
}

export default function About() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // SEO Tool States
  const [url, setUrl] = useState("");
  const [industry, setIndustry] = useState("العقارات والتطوير العقاري");
  const [city, setCity] = useState("الرياض (المنطقة الوسطى)");
  const [channel, setChannel] = useState("بحث جوجل الطبيعي (SEO)");
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SeoAnalysisResult | null>(null);

  const loadingSteps = isAr
    ? [
        "جاري قراءة سلوك المستخدم والبحث المحلي في السعودية...",
        "تحديد الفئة المستهدفة وسلوك الشراء في المنطقة المختارة...",
        "حساب معادلة باريتو 80/20 لتصفية الكلمات الأعلى قيمة...",
        "صياغة الإجراءات الذهبية الـ 3 الفورية لتصدر محركات البحث...",
      ]
    : [
        "Reading user intent and localized search query behaviors in KSA...",
        "Identifying target demographic and buying patterns in selected region...",
        "Calculating Pareto 80/20 formula to filter high-intent key phrases...",
        "Formulating the top 3 gold action items to instantly rank on Google...",
      ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading, loadingSteps.length]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(e ? "" : "");
    setResult(null);

    try {
      const response = await fetch("/api/public/seo-analyze-saudi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, industry, city, channel }),
      });

      if (!response.ok) {
        throw new Error(
          isAr
            ? "فشل الاتصال بخادم التحليل الذكي. يرجى المحاولة مرة أخرى."
            : "Failed to connect to the smart analysis server. Please try again."
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(
        err.message ||
          (isAr
            ? "حدث خطأ غير متوقع أثناء معالجة البيانات."
            : "An unexpected error occurred while processing data.")
      );
    } finally {
      setLoading(false);
    }
  };

  const features = isAr
    ? [
        {
          icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
          title: "فوترة إلكترونية متكاملة مع هيئة الزكاة والضريبة والجمارك",
          desc: "متوافقة تماماً مع متطلبات المرحلة الثانية (الربط والتكامل). ختم تشفيري تلقائي، إنشاء بصمة الفاتورة ومعرف UUID بشكل لحظي ومستندات XML متكاملة دون أي جهد تقني.",
          tag: "الامتثال الضريبي",
        },
        {
          icon: <Shield className="w-6 h-6 text-purple-400" />,
          title: "نظام حماية الأجور (WPS) المتطور",
          desc: "تحضير مسيرات الرواتب تلقائياً، توليد ملفات الأجور بالصيغة المعتمدة لوزارة الموارد البشرية وبوابات البنوك، وحساب البدلات والاستقطاعات بدقة متناهية.",
          tag: "شؤون الموظفين",
        },
        {
          icon: <Cpu className="w-6 h-6 text-blue-400" />,
          title: "الذكاء الاصطناعي السيادي المحلي",
          desc: "محركات ذكاء اصطناعي تفهم التشريعات والأنظمة في المملكة العربية السعودية والخليج، وتساعدك في صياغة العقود القانونية، وتحليل الفرص التجارية، وتوليد التقارير المالية واللوجستية.",
          tag: "الذكاء السيادي",
        },
        {
          icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
          title: "منصة إدارة وتتبع العملاء الفائقة",
          desc: "متابعة صفقاتك وفرصك البيعية بدقة وعناية، مع نظام تنبيهات ذكي ومزامنة قنوات الاتصال مثل واتساب والبريد الإلكتروني للوصول إلى أعلى نسبة تحويل.",
          tag: "التسويق والمبيعات",
        },
        {
          icon: <Globe className="w-6 h-6 text-cyan-400" />,
          title: "سلاسل الإمداد والشحن الدولي والداخلي",
          desc: "تتبع شحناتك وسفن الشحن والموردين المحليين والدوليين، مع نظام إدارة المخازن المتعددة المتكامل لضمان بقاء مستويات مخزونك دائمًا في المنطقة الآمنة.",
          tag: "العمليات واللوجستيات",
        },
        {
          icon: <FileText className="w-6 h-6 text-rose-400" />,
          title: "الحوكمة وسجل الامتثال المشفر SHA-256",
          desc: "أول نظام تشغيل يدعم دمج سجل امتثال مشفر وغير قابل للتعديل لتتبع العمليات الحساسة، مما يجعل منشأتك دائمًا جاهزة للتدقيق والمطابقة دون أي تحضير مسبق.",
          tag: "الحوكمة والامتثال",
        },
      ]
    : [
        {
          icon: <Sparkles className="w-6 h-6 text-emerald-400" />,
          title: "ZATCA Compliant Electronic Invoicing",
          desc: "Fully integrated with Phase 2 (Integration & Clearing) requirements. Automatic cryptographic signing, instant UUID & invoice hash generation, and compliant XML structures without technical overhead.",
          tag: "Tax Compliance",
        },
        {
          icon: <Shield className="w-6 h-6 text-purple-400" />,
          title: "Advanced Wage Protection System (WPS)",
          desc: "Automate payroll preparation, generate wages files in strict compliance with the Ministry of Human Resources, and accurately handle allowances and deductions.",
          tag: "Human Resources",
        },
        {
          icon: <Cpu className="w-6 h-6 text-blue-400" />,
          title: "Sovereign Localized Artificial Intelligence",
          desc: "Built-in AI engines that deeply understand KSA and GCC regulations. Assist in drafting legal contracts, auditing suppliers, and synthesizing actionable business intelligence reports.",
          tag: "Sovereign AI",
        },
        {
          icon: <TrendingUp className="w-6 h-6 text-amber-400" />,
          title: "Ultra CRM & Sales Intelligence",
          desc: "Nurture leads and close deals. Features high-converting WhatsApp automation, automated follow-ups, and native channel synchronization to double your conversion rates.",
          tag: "Sales & Marketing",
        },
        {
          icon: <Globe className="w-6 h-6 text-cyan-400" />,
          title: "Global & Domestic Supply Chain Logistics",
          desc: "Trace international marine vessels, land freight corridors, and local warehouse structures. Maintain full control of inventories across multiple locations safely.",
          tag: "Operations & Logistics",
        },
        {
          icon: <FileText className="w-6 h-6 text-rose-400" />,
          title: "SHA-256 Encrypted Compliance Ledger",
          desc: "The world's first OS to record key structural data on an immutable compliance ledger, keeping your enterprise continuously audit-ready without manual preparation.",
          tag: "Governance & Audit",
        },
      ];

  const saudiCitiesAr = [
    "الرياض (المنطقة الوسطى)",
    "جدة (المنطقة الغربية)",
    "الدمام والخبر (المنطقة الشرقية)",
    "مكة المكرمة",
    "المدينة المنورة",
    "المنطقة الجنوبية (أبها وخميس مشيط)",
    "المنطقة الشمالية (تبوك وحائل)",
    "عموم المملكة العربية السعودية",
  ];

  const saudiCitiesEn = [
    "Riyadh (Central Province)",
    "Jeddah (Western Province)",
    "Dammam & Khobar (Eastern Province)",
    "Makkah",
    "Madinah",
    "Southern Region (Abha & Khamis Mushait)",
    "Northern Region (Tabuk & Hail)",
    "Whole Kingdom of Saudi Arabia",
  ];

  const industriesAr = [
    "العقارات والتطوير العقاري",
    "المقاولات والإنشاءات والترميم",
    "التجارة الإلكترونية والتجزئة والسلع الاستهلاكية",
    "الخدمات المهنية والاستشارات والتعليم",
    "الخدمات اللوجستية والنقل وسلاسل الإمداد",
    "السياحة والضيافة والترفيه",
    "التقنية والبرمجيات والحلول الرقمية",
    "الصناعة والتوريد والمعادن والأغذية",
    "الخدمات الطبية والرعاية الصحية العيادات",
  ];

  const industriesEn = [
    "Real Estate & Development",
    "Contracting, Construction & Renovation",
    "E-commerce, Retail & Consumer Goods",
    "Professional Services, Consulting & Education",
    "Logistics, Transportation & Supply Chain",
    "Tourism, Hospitality & Entertainment",
    "Tech, Software & Digital Solutions",
    "Manufacturing, Industrial & Food Supply",
    "Medical Services, Healthcare & Clinics",
  ];

  const channelsAr = [
    "بحث جوجل الطبيعي (SEO)",
    "خرائط جوجل والبحث المحلي المحيط بجريد",
    "منصات التواصل الاجتماعي (تيك توك وسناب شات وتويتر)",
    "الإعلانات المدفوعة (جوجل أدز، ميتسا أدز)",
  ];

  const channelsEn = [
    "Organic Google Search (SEO)",
    "Google Maps & Local Search Grid",
    "Social Media Platforms (TikTok, Snapchat, X)",
    "Paid Advertising (Google Ads, Meta Ads)",
  ];

  const saudiCities = isAr ? saudiCitiesAr : saudiCitiesEn;
  const industries = isAr ? industriesAr : industriesEn;
  const channels = isAr ? channelsAr : channelsEn;

  return (
    <div
      className="min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100 selection:bg-emerald-500/30 overflow-x-hidden public-dark-page"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Decorative background grid and ambient lights */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_left,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Global Navigation */}
      <Navbar />

      {/* Main Container */}
      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Header Hero Section */}
          <section className="text-center max-w-4xl mx-auto mb-20 md:mb-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-xs text-emerald-400 mb-6 shadow-inner">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isAr
                    ? "نظام التشغيل الرقمي الأول للشركات السعودية والخليجية"
                    : "The Premier Sovereign Digital OS for Saudi & GCC Enterprises"}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight md:leading-snug mb-8 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                {isAr ? (
                  <>
                    السيادة التقنية الفائقة <br />
                    <span className="text-emerald-400">لتشغيل وتنمية منشأتك</span>
                  </>
                ) : (
                  <>
                    Sovereign Digital Infrastructure <br />
                    <span className="text-emerald-400">to Run & Scale Your Enterprise</span>
                  </>
                )}
              </h1>

              <p className="text-lg md:text-xl text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto mb-10">
                {isAr
                  ? "في مدارج، لا نصنع مجرد برمجيات معقدة. بل نبني العقل الرقمي الموحد والممتثل محلياً بنسبة 100% ليقود كافة عملياتك المالية، القانونية، اللوجستية، والتسويقية بكفاءة لامتناهية."
                  : "At Mudarij, we don't just build complex software. We construct a 100% locally compliant sovereign digital mind to run all financial, legal, logistical, and marketing workflows with effortless efficiency."}
              </p>
            </motion.div>
          </section>

          {/* Award-winning Bento Grid Philosophy */}
          <section className="mb-24 md:mb-36">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {isAr
                  ? "هندسة متكاملة مصممة للتميز المحلي"
                  : "Unified Engineering Built for Local Excellence"}
              </h2>
              <p className="text-zinc-400 max-w-2xl mx-auto text-sm md:text-base">
                {isAr
                  ? "استبدل 10 تطبيقات متباعدة بنظام واحد مركزي فائق القوة والذكاء."
                  : "Replace 10 disconnected tools with a single central engine of unparalleled intelligence."}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  className="group bg-zinc-900/40 border border-zinc-900 hover:border-zinc-800 rounded-2xl p-8 transition-all hover:bg-zinc-900/80 hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 rounded-full filter blur-xl group-hover:bg-emerald-500/5 transition-all" />
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6 shadow-inner">
                    {feat.icon}
                  </div>
                  <span className="text-xs font-semibold text-emerald-400 tracking-wider mb-2 block uppercase">
                    {feat.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed font-normal">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Interactive Saudi SEO & Lead Pareto 80/20 Analyzer Tool */}
          <section className="bg-zinc-900/20 border border-zinc-900 rounded-3xl p-8 md:p-12 relative overflow-hidden mb-24 md:mb-36">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full filter blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full filter blur-[100px] pointer-events-none" />

            <div className="max-w-4xl mx-auto relative z-10">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs text-emerald-400 mb-4 font-semibold">
                  <Target className="w-3.5 h-3.5" />
                  <span>
                    {isAr
                      ? "محرك باريتو للتسويق والنمو 20 / 80"
                      : "Pareto 80/20 Growth & Marketing Engine"}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight">
                  {isAr ? "محلل السيو وقائد النمو السعودي" : "KSA Growth & SEO Analyzer"}
                </h2>
                <p className="text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
                  {isAr ? (
                    <>
                      تؤكد الإحصاءات أن{" "}
                      <span className="text-emerald-400 font-bold">20% من الكلمات البحثية</span> في
                      السوق السعودي تجذب{" "}
                      <span className="text-emerald-400 font-bold">
                        80% من العملاء المحتملين ذوي النية الشرائية العالية
                      </span>
                      . دع ذكاء مدارج يحلل مشروعك ويرشدك إليها فوراً.
                    </>
                  ) : (
                    <>
                      Studies demonstrate that{" "}
                      <span className="text-emerald-400 font-bold">20% of search terms</span> in the
                      Saudi market capture{" "}
                      <span className="text-emerald-400 font-bold">
                        80% of high-intent buying customers
                      </span>
                      . Let Mudarij analyze your project and isolate them instantly.
                    </>
                  )}
                </p>
              </div>

              {/* Analyzer Form */}
              <form
                onSubmit={handleAnalyze}
                className="bg-zinc-950/60 border border-zinc-900 rounded-2xl p-6 md:p-8 shadow-2xl mb-8"
              >
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">
                      {isAr ? "رابط الموقع الإلكتروني (اختياري)" : "Website URL (Optional)"}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="example.com.sa"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">
                      {isAr ? "نوع النشاط التجاري / الصناعة *" : "Business Industry *"}
                    </label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                      {industries.map((ind, i) => (
                        <option key={i} value={industriesAr[i]} className="bg-zinc-950 text-white">
                          {ind}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">
                      {isAr
                        ? "المنطقة الجغرافية / المدينة المستهدفة *"
                        : "Target Province / City *"}
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                      {saudiCities.map((ct, i) => (
                        <option key={i} value={saudiCitiesAr[i]} className="bg-zinc-950 text-white">
                          {ct}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-400 mb-2">
                      {isAr ? "قناة الاستحواذ الرئيسية المفضلة" : "Preferred Acquisition Channel"}
                    </label>
                    <select
                      value={channel}
                      onChange={(e) => setChannel(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                    >
                      {channels.map((chan, i) => (
                        <option key={i} value={channelsAr[i]} className="bg-zinc-950 text-white">
                          {chan}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                        <span>
                          {isAr
                            ? "جاري التحليل واستخراج كنز البيانات..."
                            : "Analyzing & mining precious behavior data..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Search className="w-5 h-5" />
                        <span>
                          {isAr
                            ? "أطلق تحليل باريتو الذكي لجمهور السعودية"
                            : "Run Pareto 80/20 Saudi Audience Analysis"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Progress and scanning steps indicator */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 text-center shadow-xl"
                  >
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-12 h-12 rounded-full border-2 border-emerald-500/30 border-t-emerald-500 animate-spin flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                      </div>

                      <p className="text-sm font-medium text-emerald-400 transition-all duration-300">
                        {loadingSteps[loadingStep]}
                      </p>

                      {/* Step ticks */}
                      <div className="flex items-center gap-3 mt-2">
                        {loadingSteps.map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              index <= loadingStep ? "w-6 bg-emerald-500" : "w-2 bg-zinc-800"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-5 text-rose-400 text-sm text-center">
                  {error}
                </div>
              )}

              {/* Beautiful Result Dashboard Display */}
              <AnimatePresence>
                {result && !loading && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                  >
                    {/* Header Score Visualizer */}
                    <div className="bg-gradient-to-br from-zinc-900 via-zinc-950 to-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl">
                      <div className="grid md:grid-cols-3 gap-8 items-center">
                        <div className="text-center md:text-right md:col-span-2">
                          <h3 className="text-xl font-bold text-white mb-2">
                            {isAr
                              ? "نتائج إسقاط باريتو المقدر لنمو منشأتك"
                              : "Your Estimated Pareto Growth Projection Results"}
                          </h3>
                          <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                            {result.leadUpliftProjection.explanation}
                          </p>
                          <div className="inline-flex items-center gap-2 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2.5 text-emerald-400">
                            <Award className="w-4 h-4 shrink-0" />
                            <span>
                              {isAr
                                ? "تطبيق هذه الاستراتيجية يحول جودة زوارك من تصفح عشوائي إلى نية شراء حقيقية ممتدة."
                                : "Applying this strategy converts your visitor traffic from casual browsing to long-term commercial intent."}
                            </span>
                          </div>
                        </div>

                        {/* Projection Graphic */}
                        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full filter blur-md pointer-events-none" />
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">
                            {isAr
                              ? "كفاءة وجودة العملاء المحتملين"
                              : "Lead Quality & Conversion Rate"}
                          </span>

                          <div className="w-full space-y-4">
                            <div>
                              <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-zinc-400">
                                  {isAr
                                    ? "قبل تطبيق الـ 20% الذهبية:"
                                    : "Before applying the golden 20%:"}
                                </span>
                                <span className="text-rose-400 font-bold">
                                  {result.leadUpliftProjection.beforeTrafficQuality}%
                                </span>
                              </div>
                              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${result.leadUpliftProjection.beforeTrafficQuality}%`,
                                  }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="bg-rose-500 h-full rounded-full"
                                />
                              </div>
                            </div>

                            <div>
                              <div className="flex justify-between text-xs font-medium mb-1.5">
                                <span className="text-emerald-400 font-bold">
                                  {isAr
                                    ? "بعد استهداف النية الشرائية (قاعدة 80/20):"
                                    : "After targeting commercial intent (80/20 rule):"}
                                </span>
                                <span className="text-emerald-400 font-bold">
                                  {result.leadUpliftProjection.afterTrafficQuality}%
                                </span>
                              </div>
                              <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-800">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${result.leadUpliftProjection.afterTrafficQuality}%`,
                                  }}
                                  transition={{ duration: 1.5, ease: "easeOut" }}
                                  className="bg-emerald-400 h-full rounded-full shadow-lg shadow-emerald-500/20 animate-pulse"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Keywords Tier Lists */}
                    <div>
                      <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        {isAr
                          ? `الـ 20% من الكلمات البحثية التي تصنع 80% من المبيعات لـ ${industry}`
                          : `The 20% of high-intent keywords generating 80% of sales for ${industry}`}
                      </h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {result.paretoKeywords.map((item, index) => (
                          <div
                            key={index}
                            className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-5 hover:border-zinc-800 transition-all flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-xs px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 font-bold">
                                  {item.intent}
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono">
                                  {isAr
                                    ? `الطلب: ${item.potentialVolume}`
                                    : `Volume: ${item.potentialVolume}`}
                                </span>
                              </div>
                              <h5
                                className="text-base font-bold text-white mb-2 font-mono"
                                dir="ltr"
                              >
                                {item.keyword}
                              </h5>
                              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                                {item.reason}
                              </p>
                            </div>
                            <div className="mt-4 pt-3 border-t border-zinc-900 text-[10px] text-zinc-500 flex items-center gap-1.5">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              <span>
                                {isAr
                                  ? "توصية مدارج: مستهدفة للاستحواذ"
                                  : "Mudarij Recommend: Acquire"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SEO Golden Action Plan */}
                    <div className="grid md:grid-cols-2 gap-8">
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8">
                        <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-400" />
                          {isAr
                            ? "خطة التحسين العاجلة الـ 3 الفورية لتصدر النتائج"
                            : "Immediate 3-Step Action Plan to Outrank Competitors"}
                        </h4>

                        <div className="space-y-6">
                          {result.seoActions.map((action, i) => (
                            <div
                              key={i}
                              className="space-y-2 border-b border-zinc-900 pb-5 last:border-0 last:pb-0"
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs text-emerald-400 font-bold">
                                    {i + 1}
                                  </span>
                                  {action.title}
                                </h5>
                                <div className="flex gap-2">
                                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded font-medium">
                                    {isAr ? `الأثر: ${action.impact}` : `Impact: ${action.impact}`}
                                  </span>
                                  <span className="text-[10px] px-2 py-0.5 bg-zinc-900 text-zinc-400 border border-zinc-800 rounded font-medium">
                                    {isAr ? `الجهد: ${action.effort}` : `Effort: ${action.effort}`}
                                  </span>
                                </div>
                              </div>
                              <p className="text-xs text-zinc-400 leading-relaxed ps-7 font-normal">
                                {action.description}
                              </p>
                              <div className="text-[11px] text-emerald-300 leading-relaxed bg-zinc-900/50 rounded-lg p-2.5 ps-3 border border-zinc-900/80 font-normal ps-7">
                                <strong>{isAr ? "خطوات التنفيذ:" : "How to Implement:"}</strong>{" "}
                                {action.implementation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Consumer Localized Insights */}
                      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between">
                        <div>
                          <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-emerald-400" />
                            {isAr
                              ? "سلوك الباحث والمستهلك السعودي بمدينتك"
                              : "Saudi Consumer Behavior in Selected City"}
                          </h4>

                          <div className="space-y-6">
                            {result.localInsights.map((insight, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-900/30 border border-zinc-900/60 rounded-xl p-4 space-y-2"
                              >
                                <h5 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5" />
                                  {insight.title}
                                </h5>
                                <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                                  {insight.insight}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Direct Pitch */}
                        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-zinc-500 font-bold block uppercase tracking-wide">
                              {isAr ? "الخطوة القادمة للمنشأة" : "Next Step for Your Business"}
                            </span>
                            <span className="text-xs text-zinc-300">
                              {isAr
                                ? "دعنا نبرمج هذه الكلمات داخل فواتيرك وصفحات هبوطك تلقائياً."
                                : "Let us integrate these keywords into your pages & invoices automatically."}
                            </span>
                          </div>
                          <Link
                            to="/contact"
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-bold rounded-lg transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>
                              {isAr
                                ? "احصل على استشارة نمو مجانية"
                                : "Get Free Growth Consultation"}
                            </span>
                            {isAr ? (
                              <ChevronLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>

          {/* Core Vision & Mission - Agency Written Style */}
          <section className="grid md:grid-cols-2 gap-12 items-center mb-24 md:mb-36">
            <div className="space-y-6">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block font-bold">
                {isAr ? "ثقافة السيادة والنمو" : "Culture of Growth & Sovereignty"}
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
                {isAr ? (
                  <>
                    لسنا مجرد شركة تقنية. <br />
                    نحن شركاؤك في الريادة والسيادة الرقمية.
                  </>
                ) : (
                  <>
                    We are not just a tech company. <br />
                    We are your partner in sovereign digital leadership.
                  </>
                )}
              </h2>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
                {isAr
                  ? "تأسست مدارج كحل جذري لمعاناة رواد الأعمال الخليجيين من تشتت العمليات والأنظمة المستوردة التي لا تفهم بيئتنا المحلية، ولا لغتنا الأم، ولا القواعد التشريعية والتنظيمية المتسارعة مثل الفوترة الإلكترونية أو منصات الامتثال للأجور."
                  : "Mudarij was founded as a radical cure for the operational dispersion suffered by GCC entrepreneurs relying on imported software. General systems fail to understand our local environment, native language, or the rapidly evolving regulatory landscape like electronic invoicing (ZATCA Phase 2) and wage protection systems (WPS)."}
              </p>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-normal">
                {isAr
                  ? "من خلال بنية أساسية سحابية ممتثلة تماماً، وقابلة للتخصيص الكامل، نمكّن الشركات الصغيرة والمتوسطة والكيانات العملاقة في الخليج من إدارة أعمالها بذكاء كامل، وتركيز جهدها الحقيقي على تنمية علامتها التجارية واكتساح الأسواق."
                  : "Through a fully compliant, hyper-secure cloud infrastructure, we empower SMEs and large enterprises in the GCC to manage operations with absolute intelligence, allowing them to channel raw effort into scale, brand-building, and market capture."}
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span className="text-xs text-zinc-300 font-bold">
                    {isAr ? "متوافق 100% مع ZATCA و WPS" : "100% ZATCA & WPS Compliant"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
                  <span className="text-xs text-zinc-300 font-bold">
                    {isAr ? "استضافة محلية آمنة" : "Secure Local Cloud Hosting"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/30 border border-zinc-900 rounded-3xl p-8 md:p-12 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-xl pointer-events-none" />

              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                  <Heart className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {isAr ? "الرسالة والرؤية" : "Mission & Vision"}
                </h3>
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-normal">
                  {isAr
                    ? "نهدف إلى تمكين مليون شركة ومنشأة خليجية من الانتقال إلى عهد الرقمنة الفائقة والموحدة بحلول عام 2030. نسخر أحدث تقنيات الـ AI وهندسة البرمجيات الآمنة لتقديم نظام تشغيل متين يحقق راحة البال التامة لك ولفريق عملك."
                    : "We aim to empower 1 million Gulf enterprises to transition into hyper-digitized, integrated efficiency by 2030. We harness cutting-edge AI and secure software engineering to deliver a bulletproof operating system, ensuring absolute peace of mind for you and your team."}
                </p>
              </div>

              <div className="space-y-4 pt-6 border-t border-zinc-800/80">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-white">{isAr ? "قصتنا" : "Our Story"}</h3>
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-normal">
                  {isAr
                    ? "ولدت مدارج من قلب المعاناة اليومية لفريقنا من المطورين والمسوقين في إدارة الفواتير والموظفين وطلبات الشحن يدوياً عبر برامج منفصلة. أدركنا أن الحل ليس إضافة تطبيق آخر، بل نسف هذا التشتت وبناء نظام واحد متماسك وذكي."
                    : "Mudarij was born from the daily friction of our founders, developers, and marketers managing bills, employees, and shipping demands manually across isolated spreadsheets and tools. We realized the solution wasn't another app, but completely vaporizing the separation and building one cohesive, intelligent OS."}
                </p>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="text-center bg-gradient-to-br from-emerald-500/10 via-zinc-950 to-zinc-950 border border-emerald-500/10 rounded-3xl p-8 md:p-16">
            <h2 className="text-2xl md:text-4xl font-extrabold text-white mb-4">
              {isAr
                ? "انضم إلى مستقبل إدارة الأعمال الخليجية"
                : "Join the Future of GCC Business Operations"}
            </h2>
            <p className="text-sm md:text-base text-zinc-400 max-w-xl mx-auto mb-8 leading-relaxed font-normal">
              {isAr
                ? "انعم براحة البال لعمليات منشأتك المالية والإدارية والتسويقية مع أول نظام تشغيل سيادي خليجي مصمم لأجلك."
                : "Gain ultimate clarity and ease for your financial, HR, and sales channels with the first sovereign Gulf operating system designed around your native environment."}
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 text-sm active:scale-95 text-center"
              >
                {isAr ? "ابدأ رحلة نموك اليوم مجاناً" : "Start Your Free Growth Journey Today"}
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white hover:bg-zinc-800/80 font-bold rounded-xl transition-all text-sm text-center"
              >
                {isAr ? "تواصل مع مستشار التشغيل" : "Connect with an Operations Advisor"}
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-zinc-950 py-16 border-t border-zinc-900 text-center relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <Logo theme="dark" />
            <p className="text-zinc-500 text-xs font-medium max-w-md leading-relaxed font-normal">
              {isAr
                ? "منصة مدارج هي علامة تجارية مسجلة لنظام تشغيل الشركات الخليجية المتكامل لتشغيل الفوترة والحسابات وإدارة شؤون الموظفين واللوجستيات محلياً."
                : "Mudarij OS is a registered trademark of the Gulf Enterprise Operating System, integrated for compliant local invoicing, accounting, HR operations, and logistics."}
            </p>
          </div>
          <div className="h-px bg-zinc-900 w-24 mx-auto mb-6" />
          <p className="text-zinc-600 text-[11px] font-medium leading-relaxed font-normal">
            © {new Date().getFullYear()} Mudarij OS.{" "}
            {isAr
              ? "صُنع بفخر واعتزاز لتمكين الريادة والسيادة الرقمية للشركات الخليجية."
              : "Crafted with pride to empower digital sovereignty and market leadership for GCC enterprises."}
          </p>
        </div>
      </footer>
    </div>
  );
}
