import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calculator,
  CheckCircle,
  Briefcase,
  FileBadge,
  Search,
  Download,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Languages,
  Building2,
  Activity,
  Gem,
  ArrowUpCircle,
  Receipt,
  Percent,
} from "lucide-react";

import { cn } from "@/src/lib/utils";

type TabType = "nitaqat" | "certificate" | "workpermit" | "isic4" | "vatcalculator" | "eos";
type Language = "ar" | "en";

const translations = {
  ar: {
    pageTitle: "أدوات الامتثال والحسابات",
    pageDesc: "أدوات مخصصة للتحقق من توافق المنشأة مع متطلبات وزارة الموارد البشرية.",
    btnTools: "أدوات الامتثال",
    tabs: {
      nitaqat: "حاسبة النطاقات",
      certificate: "التحقق من الشهادات",
      workpermit: "رسوم رخص العمل",
      isic4: "مطابقة ISIC4",
      vatcalculator: "حاسبة الضريبة",
      eos: "مكافأة نهاية الخدمة",
    },
    vatcalculator: {
      title: "حاسبة ضريبة القيمة المضافة (ZATCA)",
      desc: "احسب ضريبة القيمة المضافة حسب لوائح هيئة الزكاة والضريبة والجمارك.",
      amount: "المبلغ",
      calcType: "نوع الحساب",
      exclusive: "المبلغ الخاضع للضريبة (قبل الضريبة)",
      inclusive: "المبلغ الشامل للضريبة (بعد الضريبة)",
      taxRate: "تطبيق الضريبة (حسب حالة ZATCA)",
      standardRate: "النسبة الأساسية (15%)",
      zeroRate: "النسبة الصفرية (0%)",
      results: "شاشة الإجمالي (فاتورة ZATCA)",
      preTax: "المبلغ الإجمالي غير شامل الضريبة المضافة (SAR)",
      vatAmount: "إجمالي ضريبة القيمة المضافة (SAR)",
      totalAmount: "إجمالي المبلغ المستحق (SAR)",
      currency: "ر.س",
      zatcaNote: "ملاحظة: النسبة الصفرية تنطبق على التصدير خارج المملكة و الأدوية المؤهلة.",
    },
    nitaqat: {
      title: "حاسبة النطاقات",
      desc: "قم بحساب وتقييم نطاق منشأتك بناءً على نسبة التوطين وحجم المنشأة.",
      totalEmployees: "إجمالي عدد الموظفين",
      saudiEmployees: "عدد الموظفين السعوديين",
      companySize: "حجم المنشأة",
      sizeSmall: "صغيرة (1-49 موظف)",
      sizeMedium: "متوسطة (50-249 موظف)",
      sizeLarge: "كبيرة (250+ موظف)",
      calcBtn: "حساب النطاق",
      calculating: "جاري الحساب...",
      resultText: "النتيجة",
      localizationRate: "نسبة التوطين",
      recommendations: "التوصيات:",
      emptyState: "أدخل البيانات واضغط على الحساب لتظهر النتيجة هنا.",
      categoryLabels: {
        Platinum: "بلاتيني",
        Green: "أخضر",
        Yellow: "أصفر",
        Red: "أحمر",
      },
    },
    certificate: {
      title: "التحقق من صحة الشهادات",
      desc: "أدخل رقم الشهادة أو السجل للتحقق من صلاحيتها وارتباطها بالمنشأة.",
      placeholder: "رقم الشهادة...",
      crNumber: "رقم السجل التجاري",
      crPlaceholder: "أدخل رقم السجل التجاري",
      province: "المنطقة",
      validateBtn: "تحقق",
      valid: "شهادة صالحة",
      invalid: "شهادة غير صالحة",
      validatedAt: "تم التحقق في",
      compliant: "مطابق",
      issuer: "جهة الإصدار",
      expiry: "تاريخ الانتهاء",
      companyName: "اسم المنشأة",
      cpraNumber: "رقم الموافقة (CPRA)",
      auditId: "رقم المرجع (Audit ID)",
      loading: "جاري...",
    },
    workpermit: {
      title: "حاسبة رسوم رخص العمل",
      totalEmployees: "إجمالي العمالة",
      expats: "عدد الوافدين",
      industry: "نوع النشاط",
      industryGeneral: "عام",
      industryIndustrial: "صناعي",
      industryAgri: "زراعي",
      duration: "مدة الرخصة (سنوات)",
      calcBtn: "حساب الرسوم",
      results: "النتائج التقديرية",
      totalAnnual: "إجمالي التكلفة التقديرية",
      currency: "ر.س",
      exempt: "العمالة المعفاة",
      paying: "العمالة المحتسبة",
      baseFee: "الرسوم الأساسية للوافد",
      monthlyCost: "المتوسط الشهري للمنشأة",
      downloadPdf: "PDF",
    },
    isic4: {
      title: "مطابقة المهن والانشطة الاقتصادية (ISIC4)",
      desc: "أدخل المسمى الوظيفي لمعرفة الرمز والتصنيف المتوافق مع اللوائح.",
      placeholder: "مثال: المبيعات، التصميم...",
      searchBtn: "بحث",
      loading: "جاري المطابقة الذكية...",
      source: "وفقاً لدليل التصنيف الوطني",
      matchScore: "تطابق",
    },
    eos: {
      title: "حاسبة مكافأة نهاية الخدمة",
      desc: "حساب مكافأة نهاية الخدمة للعاملين حسب نظام العمل السعودي.",
      salary: "الراتب الإجمالي (الأساسي + بدل السكن/أخرى)",
      years: "سنوات الخدمة",
      endReason: "سبب انتهاء العلاقة التعاقدية",
      termination: "إنهاء عقد من صاحب العمل",
      resignation: "استقالة",
      calcBtn: "حساب المكافأة",
      results: "تفاصيل المكافأة",
      baseAward: "المكافأة الأساسية (قبل قواعد الاستقالة)",
      deduction: "نِسبة الاستحقاق (حسب مدة الاستقالة)",
      finalAward: "بناءً على 50% لأول 5 سنوات و 100% لما بعدها",
      currency: "ر.س",
      total: "إجمالي المكافأة المستحقة",
    },
  },
  en: {
    pageTitle: "Compliance & Calculations Tools",
    pageDesc: "Specialized tools to verify facility compliance with HRSD regulations.",
    btnTools: "Compliance Tools",
    tabs: {
      nitaqat: "Nitaqat Calculator",
      certificate: "Certificate Validation",
      workpermit: "Work Permit Fees",
      isic4: "ISIC4 Matcher",
      vatcalculator: "VAT Calculator",
      eos: "End of Service",
    },
    vatcalculator: {
      title: "VAT Calculator (ZATCA)",
      desc: "Calculate Value Added Tax based on ZATCA regulations.",
      amount: "Amount",
      calcType: "Calculation Method",
      exclusive: "Amount Excludes Tax (Calculate VAT)",
      inclusive: "Amount Includes Tax (Extract VAT)",
      taxRate: "ZATCA Tax Rate Status",
      standardRate: "Standard Rate (15%)",
      zeroRate: "Zero-Rate (0%)",
      results: "ZATCA Invoice Summary",
      preTax: "Amount (Excluding VAT) SAR",
      vatAmount: "Total Value Added Tax (SAR)",
      totalAmount: "Total Amount Due (SAR)",
      currency: "SAR",
      zatcaNote: "Note: Zero-rate applies to exports and certain medicines per ZATCA.",
    },
    nitaqat: {
      title: "Nitaqat Calculator",
      desc: "Calculate and assess your facility's Nitaqat category based on localization.",
      totalEmployees: "Total Employees",
      saudiEmployees: "Saudi Employees",
      companySize: "Company Size",
      sizeSmall: "Small (1-49 emp)",
      sizeMedium: "Medium (50-249 emp)",
      sizeLarge: "Large (250+ emp)",
      calcBtn: "Calculate Category",
      calculating: "Calculating...",
      resultText: "Result",
      localizationRate: "Localization Rate",
      recommendations: "Recommendations:",
      emptyState: "Enter data and calculate to see results here.",
      categoryLabels: {
        Platinum: "Platinum",
        Green: "Green",
        Yellow: "Yellow",
        Red: "Red",
      },
    },
    certificate: {
      title: "Certificate Validation Tool",
      desc: "Enter certificate or registration number to verify authenticity.",
      placeholder: "Certificate number...",
      crNumber: "CR Number",
      crPlaceholder: "Company Registration Number",
      province: "Province",
      validateBtn: "Validate",
      valid: "Valid Certificate",
      invalid: "Invalid Certificate",
      validatedAt: "Validated at",
      compliant: "Compliant",
      issuer: "Issuer",
      expiry: "Expiry Date",
      companyName: "Company Name",
      cpraNumber: "CPRA Number",
      auditId: "Audit ID",
      loading: "Validating...",
    },
    workpermit: {
      title: "Work Permit Fees Calculator",
      totalEmployees: "Total Workforce",
      expats: "Number of Expats",
      industry: "Industry Type",
      industryGeneral: "General",
      industryIndustrial: "Industrial",
      industryAgri: "Agricultural",
      duration: "Permit Duration (Years)",
      calcBtn: "Calculate Fees",
      results: "Estimated Results",
      totalAnnual: "Total Estimated Cost",
      currency: "SAR",
      exempt: "Exempt Workers",
      paying: "Paying Employees",
      baseFee: "Base Fee per Expat",
      monthlyCost: "Monthly Average Cost",
      downloadPdf: "PDF",
    },
    isic4: {
      title: "Occupation & ISIC4 Matcher",
      desc: "Enter job title to find the compliant ISIC4 code and classification.",
      placeholder: "e.g., Sales, Design...",
      searchBtn: "Search",
      loading: "Smart matching...",
      source: "Based on National Classification Guide",
      matchScore: "Match",
    },
    eos: {
      title: "End of Service Award Calculator",
      desc: "Calculate End of Service Award according to Saudi Labor Law.",
      salary: "Total Salary (Basic + Allowances)",
      years: "Years of Service",
      endReason: "End of Contract Reason",
      termination: "Termination / Contract End",
      resignation: "Resignation",
      calcBtn: "Calculate Award",
      results: "Award Details",
      baseAward: "Base Award (Before Resignation Rules)",
      deduction: "Entitlement Rate (Based on duration)",
      finalAward: "Based on 50% for first 5 years, 100% for subsequent years",
      currency: "SAR",
      total: "Total Final Award",
    },
  },
};

export default function Calculations() {
  const [activeTab, setActiveTab] = useState<TabType>("nitaqat");
  const [lang, setLang] = useState<Language>("ar");

  const toggleLanguage = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  const t = translations[lang];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20" dir={lang === "ar" ? "rtl" : "ltr"}>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">
              {t.btnTools}
            </span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">{t.pageTitle}</h1>
          <p className="text-zinc-500 mt-1 text-sm font-medium">{t.pageDesc}</p>
        </div>
        <button
          onClick={toggleLanguage}
          aria-label={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors shadow-sm text-sm font-bold w-max"
        >
          <Languages className="w-4 h-4 text-zinc-500" />
          {lang === "ar" ? "English" : "عربي"}
        </button>
      </header>

      <div className="flex flex-wrap gap-2 mb-8 border-b border-zinc-200 pb-4" role="tablist">
        {[
          { id: "nitaqat", label: t.tabs.nitaqat, icon: Calculator },
          { id: "certificate", label: t.tabs.certificate, icon: FileBadge },
          { id: "vatcalculator", label: t.tabs.vatcalculator, icon: Receipt },
          { id: "workpermit", label: t.tabs.workpermit, icon: Briefcase },
          { id: "isic4", label: t.tabs.isic4, icon: Search },
          { id: "eos", label: t.tabs.eos, icon: Activity },
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-zinc-900 text-white shadow-md"
                : "text-zinc-600 hover:bg-zinc-100 border border-transparent hover:border-zinc-200"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div
        className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 md:p-10 min-h-[500px]"
        role="tabpanel"
        id={`panel-${activeTab}`}
      >
        {activeTab === "nitaqat" && <NitaqatCalculator t={t.nitaqat} lang={lang} />}
        {activeTab === "certificate" && <CertificateValidator t={t.certificate} lang={lang} />}
        {activeTab === "workpermit" && <WorkPermitCalculator t={t.workpermit} lang={lang} />}
        {activeTab === "isic4" && <Isic4Matcher t={t.isic4} lang={lang} />}
        {activeTab === "vatcalculator" && <VatCalculator t={t.vatcalculator} lang={lang} />}
        {activeTab === "eos" && <EosCalculator t={t.eos} lang={lang} />}
      </div>
    </div>
  );
}

// 1. Nitaqat Calculator
function NitaqatCalculator({ t, lang }: { t: any; lang: Language }) {
  const [totalEmployees, setTotalEmployees] = useState(25);
  const [saudiEmployees, setSaudiEmployees] = useState(5);
  const [companySize, setCompanySize] = useState("Small");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/nitaqat/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalEmployees, saudiEmployees, companySize }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Failed to calculate Nitaqat:", e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (totalEmployees >= 1 && saudiEmployees >= 0) {
        calculate();
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [totalEmployees, saudiEmployees, companySize]);

  const badgeProps = useMemo(() => {
    if (!result) return null;
    switch (result.category) {
      case "Platinum":
        return {
          bg: "bg-slate-100 border-slate-300",
          text: "text-slate-800",
          icon: Gem,
          label: t.categoryLabels.Platinum,
          barBg: "bg-slate-800",
        };
      case "Green":
        return {
          bg: "bg-emerald-100 border-emerald-300",
          text: "text-emerald-800",
          icon: CheckCircle2,
          label: t.categoryLabels.Green,
          barBg: "bg-emerald-500",
        };
      case "Yellow":
        return {
          bg: "bg-amber-100 border-amber-300",
          text: "text-amber-800",
          icon: AlertTriangle,
          label: t.categoryLabels.Yellow,
          barBg: "bg-amber-500",
        };
      case "Red":
        return {
          bg: "bg-rose-100 border-rose-300",
          text: "text-rose-800",
          icon: XCircle,
          label: t.categoryLabels.Red,
          barBg: "bg-rose-500",
        };
      default:
        return null;
    }
  }, [result, t]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900">{t.title}</h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">{t.desc}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="compSize" className="text-sm font-bold text-zinc-700">
              {t.companySize}
            </label>
            <select
              id="compSize"
              aria-label={t.companySize}
              role="combobox"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all dropdown-select"
            >
              <option value="Small">{t.sizeSmall}</option>
              <option value="Medium">{t.sizeMedium}</option>
              <option value="Large">{t.sizeLarge}</option>
            </select>
          </div>
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="totEmp" className="text-sm font-bold text-zinc-700">
              {t.totalEmployees}
            </label>
            <input
              id="totEmp"
              aria-label={t.totalEmployees}
              role="spinbutton"
              type="number"
              min="1"
              value={Number.isNaN(totalEmployees) ? "" : totalEmployees}
              onChange={(e) => setTotalEmployees(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="saudiEmp" className="text-sm font-bold text-zinc-700">
              {t.saudiEmployees}
            </label>
            <input
              id="saudiEmp"
              aria-label={t.saudiEmployees}
              role="spinbutton"
              type="number"
              min="0"
              max={totalEmployees}
              value={Number.isNaN(saudiEmployees) ? "" : saudiEmployees}
              onChange={(e) => setSaudiEmployees(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div
        className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100 flex flex-col justify-center relative overflow-hidden"
        aria-live="polite"
      >
        {result && badgeProps ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 relative z-10 w-full"
          >
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <span className="text-sm font-bold text-zinc-500">{t.resultText}</span>
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-xl border border-zinc-200 shadow-sm font-black text-sm",
                  badgeProps.bg,
                  badgeProps.text
                )}
              >
                <badgeProps.icon className="w-5 h-5" />
                {badgeProps.label}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-4xl font-black tabular-nums">{result.score}%</span>
                <span className="text-xs font-bold text-zinc-400">{t.localizationRate}</span>
              </div>
              <div
                className="w-full h-3 bg-zinc-200 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={Math.min(result.score, 100)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={cn("h-full transition-all duration-1000", badgeProps.barBg)}
                  style={{ width: `${Math.min(result.score, 100)}%` }}
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm mt-6">
              <h4 className="text-sm font-black text-zinc-800 mb-3 flex items-center gap-2">
                <ArrowUpCircle className="w-4 h-4 text-blue-500" />
                {t.recommendations}
              </h4>
              <ul className="text-sm font-medium text-zinc-600 space-y-2">
                {result.recommendations?.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-zinc-300 font-black">•</span>
                    <span className="leading-snug">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : (
          <div className="text-center text-zinc-400">
            <Calculator className="w-12 h-12 mx-auto mb-3 opacity-20" aria-hidden="true" />
            <p className="font-bold text-sm max-w-[200px] mx-auto">{t.emptyState}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 2. Certificate Validation Tool
function CertificateValidator({ t, lang }: { t: any; lang: Language }) {
  const [certId, setCertId] = useState("");
  const [crNumber, setCrNumber] = useState("");
  const [province, setProvince] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/certificate/logs");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch certificate logs:", e);
      setLogs([]);
    }
  };

  useEffect(() => {
    if (showLogs) {
      fetchLogs();
    }
  }, [showLogs]);

  const validate = async () => {
    if (!certId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/certificate/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateNumber: certId,
          companyRegistrationNumber: crNumber,
          province,
        }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResult(data);
      if (showLogs) fetchLogs();
    } catch (e) {
      console.error("Failed to validate certificate:", e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8" aria-live="polite">
      <div className="text-center">
        <h2 className="text-2xl font-black text-zinc-900 mb-2">{t.title}</h2>
        <p className="text-sm font-medium text-zinc-500">{t.desc}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-bold text-zinc-500 mb-1.5 block" htmlFor="certId">
            {t.placeholder}
          </label>
          <input
            id="certId"
            type="text"
            aria-label="Certificate number input"
            role="textbox"
            placeholder={t.placeholder}
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && validate()}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none text-center text-lg tracking-widest"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500 mb-1.5 block" htmlFor="crNumber">
            {t.crNumber}
          </label>
          <input
            id="crNumber"
            type="text"
            aria-label={t.crNumber}
            role="textbox"
            placeholder={t.crPlaceholder}
            value={crNumber}
            onChange={(e) => setCrNumber(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none text-center tracking-widest"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-500 mb-1.5 block" htmlFor="province">
            {t.province}
          </label>
          <input
            id="province"
            type="text"
            aria-label={t.province}
            role="textbox"
            placeholder={t.province}
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none text-center"
          />
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={validate}
          disabled={loading}
          aria-busy={loading}
          className="px-12 py-3.5 bg-zinc-900 text-white font-bold rounded-xl shadow-md hover:bg-zinc-800 transition-colors"
        >
          {loading ? t.loading : t.validateBtn}
        </button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 space-y-4 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-200 gap-4">
            <div className="flex items-center gap-3">
              {result.valid ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              ) : (
                <XCircle className="w-8 h-8 text-rose-500" />
              )}
              <div>
                <h4 className="font-black text-zinc-900 text-lg">
                  {result.valid ? t.valid : t.invalid}
                </h4>
                <p className="text-xs font-medium text-zinc-500">
                  {t.validatedAt}:{" "}
                  <span className="font-mono text-zinc-700 ml-1">
                    {new Date(result.timestamp).toLocaleDateString(
                      lang === "ar" ? "ar-SA" : "en-US"
                    )}
                  </span>
                </p>
              </div>
            </div>
            {result.valid && (
              <span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-lg text-xs self-start sm:self-auto border border-emerald-200">
                {t.compliant}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm font-medium">
            <div className="lg:col-span-3 pb-2 border-b border-zinc-100 mb-2">
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.companyName}
              </span>
              <span className="text-zinc-900 font-bold text-base">{result.companyName || "-"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.issuer}
              </span>
              <span className="text-zinc-900 font-bold">{result.issuer || "-"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.expiry}
              </span>
              <span className="text-zinc-900 font-bold font-mono">{result.expiryDate || "-"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.cpraNumber}
              </span>
              <span className="text-zinc-900 font-bold font-mono">{result.cpraNumber || "-"}</span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.auditId}
              </span>
              <span className="font-mono text-xs bg-zinc-200 px-2 py-1 rounded text-zinc-700 font-black">
                {result.auditId || "-"}
              </span>
            </div>
            <div>
              <span className="text-zinc-400 block mb-1 text-[10px] uppercase font-bold">
                {t.province}
              </span>
              <span className="text-zinc-900 font-bold">{result.province || "-"}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200 mt-2 flex justify-between items-center">
            <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs font-bold font-mono">
              AUDIT LOG SAVED: {result.auditId}
            </div>
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 underline"
            >
              {showLogs ? "Hide Audit Logs" : "View Audit Logs"}
            </button>
          </div>
        </motion.div>
      )}

      {showLogs && (
        <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mt-8">
          <h3 className="font-black text-lg mb-4 text-zinc-900">Validation Audit Logs</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-sm font-medium text-zinc-500">No logs found.</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-zinc-100 p-4 rounded-xl shadow-sm text-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-mono font-bold text-xs text-zinc-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-bold",
                        log.result.valid
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      )}
                    >
                      {log.result.valid ? "VALID" : "INVALID"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Certificate
                      </span>
                      <span className="font-bold text-zinc-800">
                        {log.payload.certificateNumber || "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        CR Number
                      </span>
                      <span className="font-bold text-zinc-800">
                        {log.payload.companyRegistrationNumber || "-"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Company
                      </span>
                      <span className="font-bold text-zinc-800">
                        {log.result.companyName || "-"} - {log.payload.province || "Riyadh"}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                        Issuer Details
                      </span>
                      <span className="text-zinc-600 text-xs">
                        {log.result.issuer} (Audit: {log.result.auditId})
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Work Permit Calculator
function WorkPermitCalculator({ t, lang }: { t: any; lang: Language }) {
  const [totalEmployees, setTotalEmployees] = useState(50);
  const [expats, setExpats] = useState(30);
  const [industry, setIndustry] = useState("general");
  const [durationYears, setDurationYears] = useState(1);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const calculate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/workpermit/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalEmployees, expats, industry, durationYears }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error("Failed to calculate work permit fees:", e);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h2 className="text-xl font-black text-zinc-900 mb-6 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-500" />
          {t.title}
        </h2>
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label htmlFor="industry" className="text-xs font-bold text-zinc-500 mb-1.5">
                {t.industry}
              </label>
              <select
                id="industry"
                aria-label={t.industry}
                role="combobox"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all dropdown-select"
              >
                <option value="general">{t.industryGeneral}</option>
                <option value="industrial">{t.industryIndustrial}</option>
                <option value="agricultural">{t.industryAgri}</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label htmlFor="durationYears" className="text-xs font-bold text-zinc-500 mb-1.5">
                {t.duration}
              </label>
              <select
                id="durationYears"
                aria-label={t.duration}
                role="combobox"
                value={Number.isNaN(durationYears) ? "" : durationYears}
                onChange={(e) => setDurationYears(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col">
            <label htmlFor="wpTotEmp" className="text-xs font-bold text-zinc-500 mb-1.5">
              {t.totalEmployees}
            </label>
            <input
              id="wpTotEmp"
              aria-label={t.totalEmployees}
              role="spinbutton"
              type="number"
              min="1"
              value={Number.isNaN(totalEmployees) ? "" : totalEmployees}
              onChange={(e) => setTotalEmployees(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="wpExpats" className="text-xs font-bold text-zinc-500 mb-1.5">
              {t.expats}
            </label>
            <input
              id="wpExpats"
              aria-label={t.expats}
              role="spinbutton"
              type="number"
              min="0"
              max={totalEmployees}
              value={Number.isNaN(expats) ? "" : expats}
              onChange={(e) => setExpats(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>
          <button
            onClick={calculate}
            aria-busy={loading}
            className="w-full mt-2 bg-zinc-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:bg-zinc-800 hover:shadow-xl transition-all"
          >
            {loading ? t.loading || "..." : t.calcBtn}
          </button>
        </div>
      </div>

      <div
        className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm flex flex-col"
        aria-live="polite"
      >
        {result ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6 flex-1 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg text-zinc-900">{t.results}</h3>
              <button
                title="Download as PDF"
                aria-label="Download as PDF"
                className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.downloadPdf}</span>
              </button>
            </div>

            <div className="p-6 bg-zinc-900 text-white rounded-2xl flex flex-col justify-center items-center relative overflow-hidden shadow-inset-md mt-4">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
              <span className="text-xs font-bold text-zinc-400 mt-2 relative z-10 flex items-center gap-2">
                {durationYears > 1 ? (
                  <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] uppercase font-bold">
                    {durationYears} Years
                  </span>
                ) : null}
                {t.totalAnnual}
              </span>
              <span className="text-4xl font-black tracking-tight relative z-10 tabular-nums">
                {result.totalFees.toLocaleString()}{" "}
                <span className="text-sm text-zinc-500">{t.currency}</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                  {t.exempt}
                </span>
                <span className="text-2xl font-black text-emerald-600 border-b-2 border-emerald-100 pb-1 w-full">
                  {result.exemptCount}
                </span>
              </div>
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                  {t.paying}
                </span>
                <span className="text-2xl font-black text-rose-600 border-b-2 border-rose-100 pb-1 w-full">
                  {result.payingExpats}
                </span>
              </div>
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                  {t.baseFee}
                </span>
                <span className="text-lg font-black text-zinc-900 tabular-nums">
                  {result.baseFee.toLocaleString()}
                  <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">
                    {t.currency}
                  </span>
                </span>
              </div>
              <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] uppercase font-bold text-zinc-500 mb-2">
                  {t.monthlyCost}
                </span>
                <span className="text-lg font-black text-zinc-900 tabular-nums">
                  {Math.round(result.totalFees / (12 * durationYears)).toLocaleString()}
                  <span className="text-[10px] text-zinc-400 block -mt-1 font-medium">
                    {t.currency}
                  </span>
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-300 gap-4 min-h-[300px]">
            <div className="w-20 h-20 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
              <Briefcase className="w-10 h-10 text-zinc-300" aria-hidden="true" />
            </div>
            <p className="text-sm font-bold max-w-[200px] text-center text-zinc-400">{t.results}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 4. Occupation & ISIC4 Matcher
function Isic4Matcher({ t, lang }: { t: any; lang: Language }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      search();
    } else if (debouncedQuery.trim().length === 0) {
      setResults([]);
    }
  }, [debouncedQuery]);

  const search = async () => {
    if (!debouncedQuery) return;
    setLoading(true);
    try {
      const res = await fetch("/api/isic4/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupation: debouncedQuery }),
      });
      const data = await res.json();
      setResults(data.matches);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6" aria-live="polite">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-2xl mx-auto flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900 mb-2">{t.title}</h2>
        <p className="text-sm font-medium text-zinc-500">{t.desc}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <label htmlFor="isicQuery" className="sr-only">
            Search Occupation
          </label>
          <input
            id="isicQuery"
            type="text"
            role="searchbox"
            aria-label="Search Occupation"
            placeholder={t.placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="w-full bg-white border-2 border-zinc-200 rounded-xl px-5 py-4 font-bold text-zinc-900 outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-400"
          />
        </div>
        <button
          onClick={search}
          disabled={loading}
          aria-busy={loading}
          className="px-8 py-4 bg-blue-600 text-white font-black rounded-xl shadow-md hover:bg-blue-700 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none sm:w-auto"
        >
          <Search className="w-5 h-5" /> {t.searchBtn}
        </button>
      </div>

      <div className="space-y-3 pt-6 min-h-[200px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-10"
            >
              <div className="text-center text-blue-500 font-bold flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                {t.loading}
              </div>
            </motion.div>
          ) : results.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {results.map((r, i) => (
                <ExpandableIsic4Result key={i} result={r} t={t} lang={lang} />
              ))}
            </motion.div>
          ) : query && !loading ? (
            <motion.div key="no-results" className="text-center py-10 text-zinc-500 font-bold">
              لم يتم العثور على نتائج. جرب كلمات مفتاحية أخرى.
            </motion.div>
          ) : (
            <motion.div key="empty" className="hidden"></motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const ExpandableIsic4Result: React.FC<{ result: any; t: any; lang: Language }> = ({
  result,
  t,
  lang,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      window.location.origin + window.location.pathname + "?isic=" + result.isicCode
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="p-5 border border-zinc-800 rounded-2xl bg-zinc-950 text-zinc-50 flex flex-col shadow-sm transition-all gap-4 cursor-pointer hover:border-zinc-700"
      onClick={() => setExpanded(!expanded)}
      role="button"
      aria-expanded={expanded}
      aria-label={`Show more details for ${result.activityDescription}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h4 className="font-black text-zinc-100 text-base mb-1.5">
            {result.activityDescription}
          </h4>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold border border-zinc-700 shadow-sm">
              ISIC4: {result.isicCode}
            </span>
            <p className="text-[10px] text-zinc-500 font-medium hidden sm:block">
              • {t.source || "Based on National Classification Guide"}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-950/50 text-emerald-400 sm:w-24 border border-emerald-900/50 self-start sm:self-auto w-full sm:w-auto transition-transform">
          <span className="text-xl font-black">{result.confidence}%</span>
          <span className="text-[9px] font-black uppercase tracking-widest">
            {t.matchScore || "Match"}
          </span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="border-t border-zinc-800 pt-4 mt-2 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
              <p className="text-sm text-zinc-400">
                Detailed matching data derived from local taxonomy. This category is fully compliant
                with external reporting systems.
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleShare}
                  aria-label="Share this result"
                  className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 border border-zinc-700"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {copied ? "Copied" : "Share"}
                </button>
                <a
                  href="#/details"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-xs font-bold transition-colors flex justify-center items-center gap-2 text-white"
                >
                  Learn More
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// 5. VAT Calculator (ZATCA Compliant)
function VatCalculator({ t, lang }: { t: any; lang: Language }) {
  const [amount, setAmount] = useState<string>("1000");
  const [calcType, setCalcType] = useState<"exclusive" | "inclusive">("exclusive");
  const [taxRate, setTaxRate] = useState<number>(15);

  const parsedAmount = parseFloat(amount) || 0;

  const results = useMemo(() => {
    let preTax = 0;
    let vatAmt = 0;
    let total = 0;

    if (calcType === "exclusive") {
      preTax = parsedAmount;
      vatAmt = preTax * (taxRate / 100);
      total = preTax + vatAmt;
    } else {
      total = parsedAmount;
      preTax = total / (1 + taxRate / 100);
      vatAmt = total - preTax;
    }

    return {
      preTax: preTax.toFixed(2),
      vatAmount: vatAmt.toFixed(2),
      totalAmount: total.toFixed(2),
    };
  }, [parsedAmount, calcType, taxRate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-500" />
            {t.title}
          </h2>
          <p className="text-sm font-medium text-zinc-500 mt-1">{t.desc}</p>
        </div>

        <div className="space-y-5 bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm">
          <div className="space-y-1.5 flex flex-col">
            <label htmlFor="amountInput" className="text-sm font-bold text-zinc-700">
              {t.amount} ({t.currency})
            </label>
            <input
              id="amountInput"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg tracking-wider"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-zinc-700">{t.calcType}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCalcType("exclusive")}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold border transition-all text-center",
                  calcType === "exclusive"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                )}
              >
                {t.exclusive}
              </button>
              <button
                type="button"
                onClick={() => setCalcType("inclusive")}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold border transition-all text-center",
                  calcType === "inclusive"
                    ? "bg-zinc-900 text-white border-zinc-900"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                )}
              >
                {t.inclusive}
              </button>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-sm font-bold text-zinc-700">{t.taxRate}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTaxRate(15)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold border transition-all text-center flex items-center justify-center gap-2",
                  taxRate === 15
                    ? "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-500"
                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <Percent className="w-4 h-4" />
                {t.standardRate}
              </button>
              <button
                type="button"
                onClick={() => setTaxRate(0)}
                className={cn(
                  "px-4 py-3 rounded-xl text-sm font-bold border transition-all text-center flex items-center justify-center gap-2",
                  taxRate === 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-500"
                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                )}
              >
                <CheckCircle2 className="w-4 h-4" />
                {t.zeroRate}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200 flex flex-col justify-center relative overflow-hidden shadow-sm">
        <h3 className="font-black text-xl text-zinc-900 mb-6 flex items-center gap-2 border-b border-zinc-200 pb-4">
          <Activity className="w-5 h-5 text-zinc-400" />
          {t.results}
        </h3>

        <div className="space-y-4 relative z-10 w-full mb-8">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
            <span className="text-sm font-bold text-zinc-500">{t.preTax}</span>
            <span className="text-xl font-black text-zinc-800 tabular-nums font-mono">
              {results.preTax}
            </span>
          </div>

          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
            <span className="text-sm font-bold text-zinc-500">{t.vatAmount}</span>
            <span className="text-xl font-black text-blue-600 tabular-nums font-mono">
              + {results.vatAmount}
            </span>
          </div>

          <div className="flex justify-between items-center bg-zinc-900 p-6 rounded-2xl border border-black shadow-lg mt-2 text-white">
            <span className="text-sm font-black uppercase tracking-widest opacity-80">
              {t.totalAmount}
            </span>
            <span className="text-3xl font-black tabular-nums tracking-tight">
              {results.totalAmount}
            </span>
          </div>
        </div>

        <div className="bg-amber-50 text-amber-800 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mt-auto">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
          <p className="text-xs font-bold leading-relaxed">{t.zatcaNote}</p>
        </div>
      </div>
    </div>
  );
}

// 6. End of Service Calculator
function EosCalculator({ t, lang }: { t: any; lang: Language }) {
  const [salary, setSalary] = useState<string>("5000");
  const [yearsStr, setYearsStr] = useState<string>("5");
  const [endReason, setEndReason] = useState<"termination" | "resignation">("termination");

  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const s = parseFloat(salary) || 0;
    const y = parseFloat(yearsStr) || 0;

    if (s <= 0 || y <= 0) {
      setResults(null);
      return;
    }

    // Base award based on years:
    // 50% for first 5 years, 100% for subsequent years
    const firstPeriod = Math.min(y, 5);
    const secondPeriod = Math.max(0, y - 5);
    const baseAward = firstPeriod * 0.5 * s + secondPeriod * 1.0 * s;

    let deductionPercent = 0;

    if (endReason === "resignation") {
      if (y < 2) {
        deductionPercent = 100; // 0% entitlement
      } else if (y >= 2 && y < 5) {
        deductionPercent = 66.67; // 33.33% entitlement (1/3)
      } else if (y >= 5 && y < 10) {
        deductionPercent = 33.33; // 66.67% entitlement (2/3)
      } else {
        deductionPercent = 0; // 100% entitlement
      }
    }

    const entitlementPercent = 100 - deductionPercent;
    const finalAward = baseAward * (entitlementPercent / 100);

    setResults({
      baseAward: baseAward.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      entitlementPercent: entitlementPercent.toFixed(2),
      finalAward: finalAward.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    });
  };

  useEffect(() => {
    calculate();
  }, [salary, yearsStr, endReason]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-8 max-w-md">
        <div className="space-y-4">
          <label className="block text-sm font-black text-zinc-900" htmlFor="salaryInput">
            {t.salary}
          </label>
          <div className="relative">
            <span
              className={cn(
                "absolute inset-y-0 flex items-center text-zinc-400 font-bold select-none text-xs",
                lang === "ar" ? "right-4" : "left-4"
              )}
            >
              {t.currency}
            </span>
            <input
              id="salaryInput"
              type="number"
              min="0"
              step="100"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className={cn(
                "w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg tracking-wider",
                lang === "ar" ? "pr-12 pl-4" : "pl-12 pr-4"
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-black text-zinc-900" htmlFor="yearsInput">
            {t.years}
          </label>
          <input
            id="yearsInput"
            type="number"
            min="0"
            step="0.5"
            value={yearsStr}
            onChange={(e) => setYearsStr(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-lg tracking-wider"
          />
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-black text-zinc-900">{t.endReason}</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setEndReason("termination")}
              className={cn(
                "px-4 py-3 rounded-xl text-xs font-bold border transition-all text-center",
                endReason === "termination"
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                  : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {t.termination}
            </button>
            <button
              type="button"
              onClick={() => setEndReason("resignation")}
              className={cn(
                "px-4 py-3 rounded-xl text-xs font-bold border transition-all text-center",
                endReason === "resignation"
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                  : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
              )}
            >
              {t.resignation}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-200 flex flex-col justify-center relative overflow-hidden shadow-sm">
        <h3 className="font-black text-xl text-zinc-900 mb-6 flex items-center gap-2 border-b border-zinc-200 pb-4">
          <Activity className="w-5 h-5 text-zinc-400" />
          {t.results}
        </h3>

        {results ? (
          <div className="space-y-4 relative z-10 w-full mb-8">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
              <span className="text-sm font-bold text-zinc-500">{t.baseAward}</span>
              <span className="text-xl font-black text-zinc-800 tabular-nums font-mono">
                {results.baseAward}
              </span>
            </div>

            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
              <span className="text-sm font-bold text-zinc-500">{t.deduction}</span>
              <span className="text-xl font-black text-blue-600 tabular-nums font-mono">
                {results.entitlementPercent}%
              </span>
            </div>

            <div className="flex justify-between items-center bg-emerald-900 p-6 rounded-2xl border border-emerald-950 shadow-lg mt-2 text-white">
              <span className="text-sm font-black uppercase tracking-widest opacity-80">
                {t.total}
              </span>
              <span className="text-3xl font-black tabular-nums tracking-tight">
                {results.finalAward}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
            <Calculator className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-medium text-sm text-center">
              أدخل بيانات الراتب والمدة لعرض النتيجة
            </p>
          </div>
        )}

        <div className="bg-blue-50 text-blue-800 border border-blue-200 p-4 rounded-xl flex items-start gap-3 mt-auto">
          <Info className="w-5 h-5 shrink-0 mt-0.5 text-blue-600" />
          <p className="text-xs font-bold leading-relaxed">{t.finalAward}</p>
        </div>
      </div>
    </div>
  );
}
