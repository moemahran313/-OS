import React, { useState } from "react";
import { motion } from "motion/react";
import { Store, CheckCircle2, Zap, ArrowUpRight, Search, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSettings } from "../contexts/SettingsContext";

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  salla: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#00b093" />
      <path
        d="M28 45 C28 65, 33 72, 50 72 C67 72, 72 65, 72 45"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M38 42 C38 28, 62 28, 62 42" stroke="white" strokeWidth="8" strokeLinecap="round" />
      <circle cx="38" cy="45" r="4.5" fill="white" />
      <circle cx="62" cy="45" r="4.5" fill="white" />
      <path
        d="M44 58 C47 61, 53 61, 56 58"
        stroke="white"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  zid: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#4f2d7f" />
      <path
        d="M28 35 H46 V65 H28"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M54 35 H72 V50 H54 V65 H72"
        stroke="white"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="33" y="18" width="9" height="9" rx="2" fill="#ffb400" />
    </svg>
  ),
  zatca: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#0f4a36" />
      <circle cx="50" cy="50" r="28" stroke="#c9a054" strokeWidth="3" />
      <circle cx="50" cy="50" r="20" stroke="white" strokeWidth="1.5" strokeDasharray="4 4" />
      <path d="M50 32 V58" stroke="#c9a054" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M50 32 C46 26, 38 29, 38 34"
        stroke="#c9a054"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M50 32 C54 26, 62 29, 62 34"
        stroke="#c9a054"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path d="M35 56 L65 56" stroke="white" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M35 56 L42 66 H58 L65 56"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M43 45 L48 50 L57 38"
        stroke="#00b093"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  whatsapp: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="45" fill="white" />
      <path
        d="M50 8C26.8 8 8 26.8 8 50C8 57.4 9.9 64.4 13.3 70.5L9 86.5L25.8 82.2C31.6 85.3 38.2 87 45 87C68.2 87 87 68.2 87 45C87 21.8 68.2 8 45 8H50Z"
        fill="#25D366"
      />
      <path
        d="M50 17.5C32.1 17.5 17.5 32.1 17.5 50C17.5 56.2 19.2 62.1 22.3 67.2L20.2 76.5L30 74.4C34.8 77 40.2 78.4 45.8 78.4C63.7 78.4 78.3 63.8 78.3 45.9C78.3 28 63.7 17.5 45.8 17.5H50Z"
        fill="white"
      />
      <path
        d="M38.5 32C37.5 32 36.5 32.5 35.8 33.3C34.5 34.6 33.7 37 34.8 39.8C36.4 44 39.6 48.5 43.6 52.5C47.6 56.5 52.1 59.7 56.3 61.3C59.1 62.4 61.5 61.6 62.8 60.3C63.6 59.6 64.1 58.6 64.1 57.6C64.1 56.8 63.7 56 63 55.6L57.5 52.8C56.8 52.5 56 52.5 55.4 53L53.1 54.8C52.2 55.5 51 55.5 50.1 54.9C47.8 53.4 45.1 50.7 43.6 48.4C43 47.5 43 46.3 43.7 45.4L45.5 43.1C46 42.5 46 41.7 45.7 41L42.9 35.5C42.5 34.8 41.7 34.4 40.9 34.4C39.5 32 38.5 32 38.5 32Z"
        fill="#25D366"
      />
    </svg>
  ),
  muqeem: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#0c2340" />
      <circle cx="50" cy="50" r="30" stroke="#c5a059" strokeWidth="2.5" />
      <g stroke="#c5a059" strokeWidth="3" strokeLinecap="round">
        <path d="M37 40 H53" />
        <path d="M37 50 H63" />
        <path d="M37 60 H58" />
      </g>
      <circle cx="63" cy="40" r="4.5" fill="#10b981" />
    </svg>
  ),
  moyasar: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#001a30" />
      <path
        d="M25 50 C25 35, 45 35, 45 50 C45 65, 65 65, 65 50"
        stroke="#00a2e3"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M35 50 C35 43, 45 43, 45 50 C45 57, 55 57, 55 50"
        stroke="#00e5a3"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  stcpay: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#4a0072" />
      <path d="M25 45 H75 M25 55 H75" stroke="#ff007f" strokeWidth="8" strokeLinecap="round" />
      <path
        d="M38 32 C45 32, 50 38, 50 45 C50 52, 45 58, 38 58"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <circle cx="62" cy="50" r="6" fill="white" />
    </svg>
  ),
  zapier: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#ff4f00" />
      <g stroke="white" strokeWidth="8.5" strokeLinecap="round">
        <path d="M50 22 V78" />
        <path d="M26 34 L74 66" />
        <path d="M26 66 L74 34" />
      </g>
    </svg>
  ),
  slack: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#4a154b" />
      <g transform="translate(18, 18) scale(0.64)">
        <rect x="25" y="0" width="14" height="34" rx="7" fill="#36C5F0" />
        <circle cx="12" cy="17" r="7" fill="#36C5F0" />
        <rect x="66" y="25" width="34" height="14" rx="7" fill="#2EB67D" />
        <circle cx="83" cy="12" r="7" fill="#2EB67D" />
        <rect x="61" y="66" width="14" height="34" rx="7" fill="#ECB22E" />
        <circle cx="88" cy="83" r="7" fill="#ECB22E" />
        <rect x="0" y="61" width="34" height="14" rx="7" fill="#E01E5A" />
        <circle cx="17" cy="88" r="7" fill="#E01E5A" />
      </g>
    </svg>
  ),
  fasah: (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="100" height="100" rx="22" fill="#075985" />
      <path d="M24 35 L50 18 L76 35 L50 52 Z" fill="#0ea5e9" fillOpacity="0.8" />
      <path d="M24 50 L50 33 L76 50 L50 67 Z" fill="white" fillOpacity="0.9" />
      <path d="M24 65 L50 48 L76 65 L50 82 Z" fill="#f97316" />
      <circle cx="50" cy="50" r="3" fill="#075985" />
    </svg>
  ),
};

const APPS = [
  {
    id: "salla",
    name: "سلة",
    category: "e-commerce",
    description: "مزامنة المنتجات، المخزون، والطلبات تلقائياً مع متجرك في سلة.",
    icon: "https://cdn.salla.network/images/logo/logo-square.png",
    status: "connected",
  },
  {
    id: "zid",
    name: "زد",
    category: "e-commerce",
    description: "إدارة متجرك في زد مباشرة من مدارج، مزامنة الفواتير والعملاء بضغطة زر.",
    icon: "https://zid.sa/wp-content/uploads/2021/04/Zid-Logo-01.png",
    status: "available",
  },
  {
    id: "zatca",
    name: "هيئة الزكاة والدخل (ZATCA)",
    category: "compliance",
    description: "الربط المباشر مع منصة فاتورة (المرحلة الثانية). معتمد رسمياً.",
    icon: "https://zatca.gov.sa/ar/Style%20Library/ZATCA/assets/images/logo.svg",
    status: "connected",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Cloud API",
    category: "communication",
    description: "أرسل تنبيهات الفواتير المخصصة والرسائل الترحيبية لعملائك تلقائياً.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    status: "available",
  },
  {
    id: "muqeem",
    name: "مقيم",
    category: "hr",
    description: "جلب وتحديث بيانات الموظفين، الإقامات، والتأشيرات تلقائياً للحفاظ على الامتثال.",
    icon: "https://muqeem.sa/img/muqeem-logo.png", // internal icon can be used if not loading
    status: "available",
  },
  {
    id: "moyasar",
    name: "ميسر",
    category: "payments",
    description: "استقبل المدفوعات عبر مدى، آبل باي، والبطاقات الائتمانية فوراً.",
    icon: "https://moyasar.com/assets/images/logo.svg",
    status: "connected",
  },
  {
    id: "stcpay",
    name: "STC Pay",
    category: "payments",
    description: "بوابة الدفع المفضلة في السعودية مدعومة بشكل أصلي في فواتير مدارج.",
    icon: "https://stcpay.com.sa/wp-content/themes/stcpay/assets/images/logo-ar.svg",
    status: "available",
  },
  {
    id: "zapier",
    name: "Zapier",
    category: "communication",
    description:
      "مئات التطبيقات بانتظارك. ارسل العملاء، الفواتير، ونشاطاتك إلى أكثر من 5000 تطبيق.",
    icon: "https://cdn.worldvectorlogo.com/logos/zapier-2.svg",
    status: "connected",
    premium: true,
  },
  {
    id: "slack",
    name: "Slack",
    category: "communication",
    description: "تلق التنبيهات المباشرة للفواتير المتأخرة والعملاء الجدد في قنوات فريقك.",
    icon: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg",
    status: "available",
  },
  {
    id: "fasah",
    name: "منصة فسح",
    category: "logistics",
    description: "تكامل كامل لبيانات الجمارك والاستيراد (ImportOS) وتتبع الشحنات.",
    icon: "https://fasah.sa/images/fasah-logo.png",
    status: "available",
  },
];

export default function Integrations() {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const tabs = [
    { id: "all", label: "الكل" },
    { id: "e-commerce", label: "التجارة الإلكترونية" },
    { id: "payments", label: "المدفوعات" },
    { id: "hr", label: "الموارد البشرية" },
    { id: "compliance", label: "الامتثال والجهات الحكومية" },
  ];

  const filteredApps = APPS.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || app.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-l from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-black text-primary border border-primary/20 mb-2 shadow-sm">
            <Sparkles className="w-3 h-3" />
            مجاناً بلا حدود في باقة Premium
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">
            سوق التطبيقات والربط المباشر
          </h1>
          <p className="text-zinc-600 text-lg font-medium max-w-2xl">
            لا داعي لدفع رسوم إضافية للربط أو الاستعانة بمبرمجين. بنقرة واحدة، اربط مدارج مع أهم
            الأنظمة والمنصات الحكومية والتجارية لتصبح مركز عملياتك الموحد.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-primary/10 flex items-center justify-center border-4 border-white rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Store className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
        <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-2xl flex flex-col items-center justify-center border border-amber-200 text-amber-600 shadow-inner rotate-3">
          <Zap className="w-6 h-6 " />
        </div>
        <div className="text-center sm:text-right">
          <h2 className="text-lg font-black text-amber-900">
            جميع هذه التكاملات ستتوفر قريباً! (قيد التطوير)
          </h2>
          <p className="text-sm font-bold text-amber-700 mt-1 max-w-3xl">
            هذه الصفحة للعرض فقط في الوقت الحالي. لا يمكن ربط أي من هذه التطبيقات بشكل حقيقي بعد.
            نحن نعمل بجد لإتاحة هذه الخصائص قريباً جداً!
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm sticky top-0 z-20">
        <div className="flex overflow-x-auto hide-scrollbar w-full md:w-auto p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ابحث عن تطبيق للربط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/30 transition-shadow outline-none"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-zinc-200 hover:border-primary/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform pointer-events-none" />

            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all overflow-hidden bg-white shrink-0">
                {BRAND_LOGOS[app.id] ? (
                  BRAND_LOGOS[app.id]
                ) : (
                  <div className="w-full h-full bg-zinc-50 border border-zinc-100 flex items-center justify-center p-3">
                    <img
                      src={app.icon}
                      alt={app.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://ui-avatars.com/api/?name=" +
                          encodeURIComponent(app.name) +
                          "&background=random";
                      }}
                    />
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                {app.status === "connected" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    متصل
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    متوفر
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6 flex-1 relative z-10">
              <h3 className="text-xl font-black text-zinc-900 mb-2 group-hover:text-primary transition-colors">
                {app.name}
              </h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">{app.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between relative z-10">
              {app.premium ? (
                <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">
                  Premium
                </span>
              ) : (
                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-md">
                  مجاني 100%
                </span>
              )}

              <button
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                  app.status === "connected"
                    ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                    : "bg-zinc-900 text-white hover:bg-primary shadow-md hover:shadow-lg hover:shadow-primary/30"
                )}
              >
                {app.status === "connected" ? "إدارة الربط" : "تفعيل الربط الآن"}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Grow section */}
      <div className="mt-12 bg-zinc-950 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden text-white border border-zinc-800 shadow-2xl">
        <div className="absolute inset-0 bg-primary/20 blur-[120px] mix-blend-overlay pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 rotate-12">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            برنامج الشركاء: انمو مع مدارج
          </h2>
          <p className="text-lg text-zinc-400 font-medium max-w-2xl mx-auto">
            شارك مدارج مع زملائك في ريادة الأعمال. احصل على{" "}
            <span className="text-primary font-black">شهرين مجاناً</span> لك ولصديقك عند تسجيله. لا
            يوجد حد أقصى!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              انسخ رابط الدعوة الخاص بك
            </button>
            <button className="px-8 py-4 bg-zinc-800 rounded-2xl font-bold text-white hover:bg-zinc-700 transition-all text-sm w-full sm:w-auto">
              تتبع أرباحك وإحالاتك
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
