import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  PlayCircle,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Users,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  Magnet,
  Mail,
  Share2,
  Scale,
  Settings,
  ShieldCheck,
  Send,
  Plus,
  ArrowRight,
  User,
  HelpCircle,
  Truck,
  FolderKanban,
  MessageSquare,
  Globe,
  Printer,
  ChevronRight,
  Menu,
  X,
  Smartphone,
  MapPin,
  Sun,
  Moon,
} from "lucide-react";

import { Logo } from "@/src/components/Logo";
import CompetitorComparison from "@/src/components/demo/CompetitorComparison";
import { useUser } from "@/src/contexts/UserContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import {
  INDUSTRIES_TEMPLATES,
  ROLES_TEMPLATES,
  generateInitialInvoices,
  generateInitialLeads,
  generateInitialProducts,
  generateInitialEmployees,
  generateInitialProjects,
  generateInitialTransactions,
  DemoInvoice,
  DemoLead,
  DemoProduct,
  DemoEmployee,
  DemoProject,
  DemoTransaction,
  CompanyInfo,
} from "@/src/components/demo/DemoDataGenerator";

// Simple custom line chart because of container-size robustness
function CustomSparkline({ data, color = "#10b981" }: { data: number[]; color?: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 40;
  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
    </svg>
  );
}

export default function Demo() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [industry, setIndustry] = useState<string>("retail");
  const [role, setRole] = useState<string>("ceo");

  const t = (ar: string, en: string, fr?: string): string => {
    if (lang === "ar") return ar;
    return en;
  };

  const tr = (text: string): string => {
    if (!text) return text;
    const dictionary: Record<string, Record<"ar" | "en", string>> = {
      // Roles
      "رئيس الحسابات": { ar: "رئيس الحسابات", en: "Chief Accountant" },
      "مهندس واجهات": { ar: "مهندس واجهات", en: "Frontend Engineer" },
      "أخصائي مبيعات كبار العملاء": { ar: "أخصائي مبيعات كبار العملاء", en: "Key Account Sales Specialist" },
      "أخصائي موارد بشرية": { ar: "أخصائي موارد بشرية", en: "HR Specialist" },
      "مشرف مستودعات وخدمات لوجستية": { ar: "مشرف مستودعات وخدمات لوجستية", en: "Warehouse & Logistics Supervisor" },
      "مدير تسويق": { ar: "مدير تسويق", en: "Marketing Manager" },
      "أخصائي عمليات": { ar: "أخصائي عمليات", en: "Operations Specialist" },
      
      // Departments
      "المالية": { ar: "المالية", en: "Finance" },
      "التقنية": { ar: "التقنية", en: "Technology" },
      "المبيعات": { ar: "المبيعات", en: "Sales" },
      "الموارد البشرية": { ar: "الموارد البشرية", en: "HR" },
      "سلاسل الإمداد": { ar: "سلاسل الإمداد", en: "Supply Chain" },

      // Products
      "شاحن لاسلكي ذكي 15 واط": { ar: "شاحن لاسلكي ذكي 15 واط", en: "Smart Wireless Charger 15W" },
      "سماعات رأس عازلة للضوضاء": { ar: "سماعات رأس عازلة للضوضاء", en: "Noise-Cancelling Headphones" },
      "ساعة ليد رياضية مضادة للماء": { ar: "ساعة ليد رياضية مضادة للماء", en: "Waterproof Sports LED Watch" },
      "كابل شحن فائق السرعة 1.5م": { ar: "كابل شحن فائق السرعة 1.5م", en: "Ultra Fast Charging Cable 1.5m" },
      "بولي بروبيلين عالي الكثافة (طن)": { ar: "بولي بروبيلين عالي الكثافة (طن)", en: "High-Density Polypropylene (ton)" },
      "قوالب حقن بلاستيكية قياس 5": { ar: "قوالب حقن بلاستيكية قياس 5", en: "Plastic Injection Molds Size 5" },
      "ملونات صناعية أساسية (كجم)": { ar: "ملونات صناعية أساسية (كجم)", en: "Basic Industrial Colorants (kg)" },
      "رخصة نظام مدارج السحابية": { ar: "رخصة نظام مدارج السحابية", en: "Madarij Cloud System License" },
      "استشارات أتمتة الأعمال وسلاسل الإمداد": { ar: "استشارات أتمتة الأعمال وسلاسل الإمداد", en: "Business Automation & Supply Chain Consulting" },
      "دعم فني مخصص ذهبي (سنوي)": { ar: "دعم فني مخصص ذهبي (سنوي)", en: "Dedicated Gold Tech Support (Annual)" },

      // Warehouses
      "مستودع السلي الرئيسي": { ar: "مستودع السلي الرئيسي", en: "As-Sulay Main Warehouse" },
      "مستودع جدة الفرعي": { ar: "مستودع جدة الفرعي", en: "Jeddah Branch Warehouse" },

      // Projects
      "تأسيس نظام الفوترة الإلكترونية والمزامنة الفورية": { ar: "تأسيس نظام الفوترة الإلكترونية والمزامنة الفورية", en: "E-Invoicing Integration & Real-time Sync" },
      "جرد سنوي ومطابقة المخزون في فروع المنطقة الغربية": { ar: "جرد سنوي ومطابقة المخزون في فروع المنطقة الغربية", en: "Annual Stock Count & Auditing - Western Region Branches" },
      "إطلاق حملة الإعلانات الذكية وتوليد قنوات البيع للربع الثالث": { ar: "إطلاق حملة الإعلانات الذكية وتوليد قنوات البيع للربع الثالث", en: "Smart Ad Campaign Launch & Lead Generation Q3" },

      // Transactions
      "سداد فاتورة مبيعات #INV-2026-1002": { ar: "سداد فاتورة مبيعات #INV-2026-1002", en: "Payment received for invoice #INV-2026-1002" },
      "صرف رواتب الموظفين لشهر يونيو": { ar: "صرف رواتب الموظفين لشهر يونيو", en: "Employee salaries disbursement - June" },
      "شراء مواد خام ومستلزمات": { ar: "شراء مواد خام ومستلزمات", en: "Purchase of raw materials and supplies" },
      "تحصيل دفعة مقدمة من عميل": { ar: "تحصيل دفعة مقدمة من عميل", en: "Advance payment collected from client" },
      "سداد مستحقات المورد": { ar: "سداد مستحقات المورد", en: "Payment to supplier" },
      "فاتورة كهرباء ومرافق": { ar: "فاتورة كهرباء ومرافق", en: "Electricity and utilities bill" },
      "خدمات استشارية": { ar: "خدمات استشارية", en: "Consulting services" },

      // Categories
      "التشغيل": { ar: "التشغيل", en: "Operations" },
      "المشتريات": { ar: "المشتريات", en: "Purchases" },
      "المرافق": { ar: "المرافق", en: "Utilities" },
      "الخدمات": { ar: "الخدمات", en: "Services" },
      
      // WhatsApp chats
      "السلام عليكم، هل تتوفر لديكم عروض أسعار تنافسية للموسم القادم؟": {
        ar: "السلام عليكم، هل تتوفر لديكم عروض أسعار تنافسية للموسم القادم؟",
        en: "Hello, do you have competitive price quotes available for the next season?"
      },
      "أهلاً بك يا فندم. بالتأكيد، سيقوم مستشار المبيعات بالتواصل معك فوراً وتقديم باقة مخصصة.": {
        ar: "أهلاً بك يا فندم. بالتأكيد، سيقوم مستشار المبيعات بالتواصل معك فوراً وتقديم باقة مخصصة.",
        en: "Welcome, sir. Absolutely, a sales consultant will contact you immediately and provide a customized package."
      },
      "ممتاز، أريد أيضاً التحقق من تكامل الفاتورة مع نظام الزكاة.": {
        ar: "ممتاز، أريد أيضاً التحقق من تكامل الفاتورة مع نظام الزكاة.",
        en: "Excellent, I also want to verify the invoice integration with the ZATCA system."
      },
      
      // Cities & Districts
      "حي الياسمين": { ar: "حي الياسمين", en: "Al Yasmeen District" },
      "طريق الملك عبدالعزيز": { ar: "طريق الملك عبدالعزيز", en: "King Abdulaziz Road" },
      "الرياض": { ar: "الرياض", en: "Riyadh" },
      "حي الحمراء": { ar: "حي الحمراء", en: "Al Hamra District" },
      "طريق الكورنيش": { ar: "طريق الكورنيش", en: "Corniche Road" },
      "جدة": { ar: "جدة", en: "Jeddah" },
      "حي الشاطئ": { ar: "حي الشاطئ", en: "Al Shatea District" },
      "طريق الملك فيصل": { ar: "طريق الملك فيصل", en: "King Faisal Road" },
      "الدمام": { ar: "الدمام", en: "Dammam" },
      "حي مجتمعات نيوم": { ar: "حي مجتمعات نيوم", en: "NEOM Communities District" },
      "طريق المستقبل": { ar: "طريق المستقبل", en: "Future Avenue" },
      "نيوم": { ar: "نيوم", en: "NEOM" },
      "حي العزيزية": { ar: "حي العزيزية", en: "Al Aziziyah District" },
      "طريق المسجد الحرام": { ar: "طريق المسجد الحرام", en: "Masjid Al Haram Road" },
      "مكة المكرمة": { ar: "مكة المكرمة", en: "Makkah" },
      "حي بئر عثمان": { ar: "حي بئر عثمان", en: "Bir Uthman District" },
      "طريق سلطانة": { ar: "طريق سلطانة", en: "Sultana Road" },
      "المدينة المنورة": { ar: "المدينة المنورة", en: "Madinah" },
      "حي الحزام الذهبي": { ar: "حي الحزام الذهبي", en: "Al Hizam Al Thahaby District" },
      "طريق الملك فهد": { ar: "طريق الملك فهد", en: "King Fahd Road" },
      "الخبر": { ar: "الخبر", en: "Khobar" },

      // ZATCA / Cryptographic logs & steps
      "بدء عملية الفوترة الإلكترونية وتبادل حزم البيانات...": {
        ar: "بدء عملية الفوترة الإلكترونية وتبادل حزم البيانات...",
        en: "Starting electronic invoicing and data packet transmission..."
      },
      "توليد مستند XML المطابق لمعيار UBL 2.1...": {
        ar: "توليد مستند XML المطابق لمعيار UBL 2.1...",
        en: "Generating XML document compliant with UBL 2.1 standard..."
      },
      "حساب رمز SHA-256 الفرعي وتشفير الهاش الفوري...": {
        ar: "حساب رمز SHA-256 الفرعي وتشفير الهاش الفوري...",
        en: "Computing unique SHA-256 hash and instant hash encryption..."
      },
      "التوقيع الرقمي للمستند باستخدام مفتاح التشفير الخاص RSA...": {
        ar: "التوقيع الرقمي للمستند باستخدام مفتاح التشفير الخاص RSA...",
        en: "Digital signing of document using private cryptographic RSA key..."
      },
      "توليد رمز الاستجابة السريعة (QR Code) المتوافق مع الفئة ب...": {
        ar: "توليد رمز الاستجابة السريعة (QR Code) المتوافق مع الفئة ب...",
        en: "Generating QR Code compliant with category B requirements..."
      },
      "ربط مباشر واستعلام API مع خوادم هيئة الزكاة والضريبة والجمارك (ZATCA)...": {
        ar: "ربط مباشر واستعلام API مع خوادم هيئة الزكاة والضريبة والجمارك (ZATCA)...",
        en: "Direct link and API query with ZATCA servers..."
      },
      "الاستجابة: تم المصادقة والاعتماد الفوري وجاهز للتكامل!": {
        ar: "الاستجابة: تم المصادقة والاعتماد الفوري وجاهز للتكامل!",
        en: "Response: Instant authorization and validation complete, ready for sync!"
      }
    };

    if (dictionary[text]) {
      return dictionary[text][lang];
    }

    let translated = text;
    Object.keys(dictionary).forEach((key) => {
      if (text.includes(key)) {
        translated = translated.replace(new RegExp(key, "g"), dictionary[key][lang]);
      }
    });

    return translated;
  };

  const { user } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [isRealDataSynced, setIsRealDataSynced] = useState(false);

  // ZATCA Cryptographic Simulation States
  const [zatcaSigningInvoiceId, setZatcaSigningInvoiceId] = useState<string | null>(null);
  const [zatcaSigningStep, setZatcaSigningStep] = useState<number>(0);
  const [zatcaSigningLogs, setZatcaSigningLogs] = useState<string[]>([]);

  // SPL National Address Validation simulation states
  const [nationalAddressInput, setNationalAddressInput] = useState<string>("");
  const [isSearchingAddress, setIsSearchingAddress] = useState<boolean>(false);
  const [searchedAddressResult, setSearchedAddressResult] = useState<{
    buildingNumber: string;
    postalCode: string;
    additionalNumber: string;
    unitNumber: string;
    streetName: string;
    district: string;
    city: string;
    fullAddressAr: string;
    fullAddressEn: string;
    qrDataUrl: string;
  } | null>(null);

  // Local sandbox data state
  const [company, setCompany] = useState<CompanyInfo>({
    name: INDUSTRIES_TEMPLATES.retail.companyName,
    industry: "retail",
    employeesCount: 42,
    warehousesCount: 3,
    bankAccountsCount: 4,
    productsCount: 1250,
    customersCount: 8400,
    suppliersCount: 95,
    revenue: 4200000,
    expenses: 2850000,
  });

  const [invoices, setInvoices] = useState<DemoInvoice[]>([]);
  const [leads, setLeads] = useState<DemoLead[]>([]);
  const [products, setProducts] = useState<DemoProduct[]>([]);
  const [employees, setEmployees] = useState<DemoEmployee[]>([]);
  const [projects, setProjects] = useState<DemoProject[]>([]);
  const [transactions, setTransactions] = useState<DemoTransaction[]>([]);

  // Active Sandbox navigation tab
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Guided Tours & Missions Checklist State
  const [mission1, setMission1] = useState({
    createInvoice: false,
    zatcaSign: false,
    receivePayment: false,
    viewPL: false,
    completed: false,
  });

  const [mission2, setMission2] = useState({
    addEmployee: false,
    runPayroll: false,
    verifyWPS: false,
    completed: false,
  });

  // Dialog/modal forms state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: "", amount: "" });
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ name: "", role: "", salary: "6000" });
  const [payrollViewTab, setPayrollViewTab] = useState<"roster" | "wps">("roster");

  // AI assistant states
  const [aiInput, setAiInput] = useState("");
  const [aiChat, setAiChat] = useState<{ role: "user" | "assistant"; text: string }[]>([
    {
      role: "assistant",
      text:
        lang === "ar"
          ? "أهلاً بك في منصة مدارج التجريبية! أنا المستشار الذكي لمساعدتك في استكشاف النظام المالي والإداري المتكامل. يمكنك سؤالي عن الفواتير غير المدفوعة، أو المقارنة مع QuickBooks و Odoo، أو حتى إعطائي أوامر مثل 'أرني المحاسبة'."
          : "Welcome to the Madarij OS Interactive Demo! I am your AI Sales & ERP specialist. Ask me about unpaid invoices, comparisons with Odoo/QuickBooks, or instruct me to 'show payroll' or 'generate an invoice'!",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Success celebration message
  const [celebration, setCelebration] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load initial templates
  useEffect(() => {
    resetDemo();
  }, [industry, role]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiChat]);

  const resetDemo = () => {
    const indTemplate = INDUSTRIES_TEMPLATES[industry] || INDUSTRIES_TEMPLATES.retail;
    const roleTemplate = ROLES_TEMPLATES[role] || ROLES_TEMPLATES.ceo;

    setCompany({
      name: indTemplate.companyName,
      industry,
      employeesCount: indTemplate.metrics.employeesCount || 25,
      warehousesCount: indTemplate.metrics.warehousesCount || 3,
      bankAccountsCount: indTemplate.metrics.bankAccountsCount || 4,
      productsCount: indTemplate.metrics.productsCount || 500,
      customersCount: indTemplate.metrics.customersCount || 1000,
      suppliersCount: indTemplate.metrics.suppliersCount || 100,
      revenue: indTemplate.metrics.revenue || 3500000,
      expenses: indTemplate.metrics.expenses || 2100000,
    });

    setInvoices(generateInitialInvoices(industry));
    setLeads(generateInitialLeads(industry));
    setProducts(generateInitialProducts(industry));
    setEmployees(generateInitialEmployees());
    setProjects(generateInitialProjects());
    setTransactions(generateInitialTransactions());

    // Switch focus module based on chosen role
    setActiveTab(roleTemplate.focusModule);

    // Reset Missions
    setMission1({
      createInvoice: false,
      zatcaSign: false,
      receivePayment: false,
      viewPL: false,
      completed: false,
    });
    setMission2({
      addEmployee: false,
      runPayroll: false,
      verifyWPS: false,
      completed: false,
    });

    // Reset AI message
    setAiChat([
      {
        role: "assistant",
        text:
          lang === "ar"
            ? `${roleTemplate.welcomeMsgAr} جرب بدء الجولة الاستكشافية في الأسفل أو اسألني أي سؤال عن أعمالك!`
            : `${roleTemplate.welcomeMsgEn} Start our guided checklists below or ask me any question about your GCC business operations!`,
      },
    ]);
  };

  // Sync real registered business profile from User Context
  const syncRealCompanyData = () => {
    if (!user) return;
    setIsRealDataSynced(true);
    setCompany(prev => ({
      ...prev,
      name: user.companyName || "شركة " + user.name,
      industry: user.onboarding?.industry || prev.industry,
      employeesCount: prev.employeesCount + 3,
      revenue: prev.revenue + 150000,
      expenses: prev.expenses + 75000,
    }));
    showToast(
      lang === "ar"
        ? `تم ربط الساندبوكس بنجاح بشركتك الموثقة: ${user.companyName || user.name}`
        : `Successfully linked sandbox with your verified profile: ${user.companyName || user.name}`
    );
  };

  // Compliant Wages Protection SIF File Downloader
  const downloadWpsSifFile = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0].replace(/-/g, "");
    const timeStr = today.toTimeString().split(" ")[0].replace(/:/g, "").slice(0, 4);
    const yearMonth = today.toISOString().slice(0, 7).replace("-", "");
    
    const crNumber = user?.crNumber || "1010948271";
    const employerIban = "SA804000001010948271001";
    
    const count = employees.length;
    let totalNet = 0;
    let employeesSifLines = "";
    
    const bankCodes = ["ALBI", "ARBJ", "NCBK", "RYBD", "SABB", "BSFR"];
    
    employees.forEach((emp, index) => {
      // Determine if Saudi based on name or index
      const isSaudi = emp.name.includes("الشمر") || emp.name.includes("الزهر") || emp.name.includes("القحط") || emp.name.includes("الحرب") || emp.name.includes("العتيب") || index % 2 === 0;
      const nationalId = (isSaudi ? "1" : "2") + (1002394821 + index).toString().slice(1);
      const bankCode = bankCodes[index % bankCodes.length];
      const employeeIban = `SA20${bankCode}000002100${123456 + index}`;
      
      const basic = Math.round(emp.salary * 0.7);
      const housing = Math.round(emp.salary * 0.2);
      const allowances = Math.round(emp.salary * 0.1);
      
      // GOSI Deduction: 9% of Basic + Housing for Saudi, 2% Occupational Hazard for Expats
      const deductions = Math.round((basic + housing) * (isSaudi ? 0.09 : 0.02));
      const netPay = emp.salary - deductions;
      totalNet += netPay;
      const status = "ACTV";
      
      employeesSifLines += `15\t${nationalId}\t${employeeIban}\t${emp.name}\t${bankCode}\t${basic}\t${housing}\t${allowances}\t${deductions}\t${netPay}\t${status}\n`;
    });
    
    let sifContent = `14\t${crNumber}\t${employerIban}\t${dateStr}\t${timeStr}\t${yearMonth}\t${totalNet}\t${count}\tSAR\n` + employeesSifLines;
    
    const blob = new Blob([sifContent], { type: "text/tab-separated-values;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `WPS_Payroll_${yearMonth}_${crNumber}.sif`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Satisfy Mission 2 wps validation
    setMission2((prev) => {
      const next = { ...prev, verifyWPS: true };
      checkMission2Completion(next);
      return next;
    });

    showToast(
      lang === "ar"
        ? "تم تحميل ملف مسير الرواتب المعتمد للبنوك .SIF بنجاح"
        : "Downloaded compliant WPS banking SIF payroll file successfully"
    );
  };

  // Saudi National Address SPL Live Lookup Simulation
  const handleNationalAddressLookup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalAddressInput.trim()) return;

    setIsSearchingAddress(true);
    setSearchedAddressResult(null);

    setTimeout(() => {
      setIsSearchingAddress(false);
      const inputVal = nationalAddressInput.trim();
      const inputLower = inputVal.toLowerCase();

      // Advanced regional address parsing
      let cityAr = "الرياض";
      let cityEn = "Riyadh";
      let districtAr = "حي الياسمين";
      let districtEn = "Al Yasmeen District";
      let streetAr = "طريق الملك عبدالعزيز";
      let streetEn = "King Abdulaziz Road";
      let defaultPostal = "13315";
      let defaultBld = "8329";

      if (inputLower.includes("jeddah") || inputLower.includes("جدة")) {
        cityAr = "جدة";
        cityEn = "Jeddah";
        districtAr = "حي الحمراء";
        districtEn = "Al Hamra District";
        streetAr = "طريق الكورنيش";
        streetEn = "Corniche Road";
        defaultPostal = "23321";
        defaultBld = "4213";
      } else if (inputLower.includes("dammam") || inputLower.includes("الدمام")) {
        cityAr = "الدمام";
        cityEn = "Dammam";
        districtAr = "حي الشاطئ";
        districtEn = "Al Shatea District";
        streetAr = "طريق الملك فيصل";
        streetEn = "King Faisal Road";
        defaultPostal = "32413";
        defaultBld = "7619";
      } else if (inputLower.includes("neom") || inputLower.includes("نيوم")) {
        cityAr = "نيوم";
        cityEn = "NEOM";
        districtAr = "حي مجتمعات نيوم";
        districtEn = "NEOM Communities District";
        streetAr = "طريق المستقبل";
        streetEn = "Future Avenue";
        defaultPostal = "49643";
        defaultBld = "1001";
      } else if (inputLower.includes("makkah") || inputLower.includes("mecca") || inputLower.includes("مكة")) {
        cityAr = "مكة المكرمة";
        cityEn = "Makkah";
        districtAr = "حي العزيزية";
        districtEn = "Al Aziziyah District";
        streetAr = "طريق المسجد الحرام";
        streetEn = "Masjid Al Haram Road";
        defaultPostal = "24243";
        defaultBld = "3112";
      } else if (inputLower.includes("madinah") || inputLower.includes("medina") || inputLower.includes("المدينة")) {
        cityAr = "المدينة المنورة";
        cityEn = "Madinah";
        districtAr = "حي بئر عثمان";
        districtEn = "Bir Uthman District";
        streetAr = "طريق سلطانة";
        streetEn = "Sultana Road";
        defaultPostal = "42331";
        defaultBld = "6231";
      } else if (inputLower.includes("khobar") || inputLower.includes("الخبر")) {
        cityAr = "الخبر";
        cityEn = "Khobar";
        districtAr = "حي الحزام الذهبي";
        districtEn = "Al Hizam Al Thahaby District";
        streetAr = "طريق الملك فهد";
        streetEn = "King Fahd Road";
        defaultPostal = "34433";
        defaultBld = "2910";
      }

      // Extract numeric components from user input if present
      const matches = (inputVal.match(/\b\d+\b/g) || []) as string[];
      const pst = matches.find(num => num.length === 5) || defaultPostal;
      
      const fourDigitNumbers = matches.filter(num => num.length === 4);
      const bld = fourDigitNumbers[0] || defaultBld;
      const add = fourDigitNumbers[1] || "4128";
      
      const smallerNumbers = matches.filter(num => num.length >= 1 && num.length <= 3);
      const unit = smallerNumbers[0] || "12";

      const fullAr = `العنوان الوطني الموحد: رقم المبنى ${bld}، ${streetAr}، ${districtAr}، ${cityAr} ${pst} - ${add}، وحدة رقم ${unit}`;
      const fullEn = `National Address: Building ${bld}, ${streetEn}, ${districtEn}, ${cityEn} ${pst} - ${add}, Unit ${unit}`;

      setSearchedAddressResult({
        buildingNumber: bld,
        postalCode: pst,
        additionalNumber: add,
        unitNumber: unit,
        streetName: lang === "ar" ? streetAr : streetEn,
        district: lang === "ar" ? districtAr : districtEn,
        city: lang === "ar" ? cityAr : cityEn,
        fullAddressAr: fullAr,
        fullAddressEn: fullEn,
        qrDataUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(fullAr)}`
      });

      showToast(
        lang === "ar"
          ? "تم مطابقة وتوثيق العنوان الوطني بنجاح مع قاعدة بيانات SPL"
          : "National Address verified & synchronized successfully with SPL registers"
      );
    }, 1200);
  };

  // ERP actions: Create Invoice
  const handleCreateInvoice = (client: string, amountNum: number) => {
    if (!client || !amountNum) return;
    const vat = Math.round(amountNum * 0.15);
    const total = amountNum + vat;
    const date = new Date().toISOString().split("T")[0];

    const newInv: DemoInvoice = {
      id: `INV-2026-${1000 + invoices.length + 1}`,
      clientName: client,
      date,
      amount: amountNum,
      vat,
      total,
      status: "unpaid",
      zatcaStatus: "pending",
    };

    setInvoices([newInv, ...invoices]);
    setCompany((prev) => ({
      ...prev,
      revenue: prev.revenue + total,
    }));

    // Trigger Mission 1 step
    setMission1((prev) => {
      const next = { ...prev, createInvoice: true };
      checkMission1Completion(next);
      return next;
    });

    showToast(
      lang === "ar"
        ? `تم إنشاء الفاتورة ${newInv.id} بنجاح وقيد المراجعة الضريبية`
        : `Invoice ${newInv.id} created successfully, awaiting tax review`
    );
  };

  // ZATCA Phase 2 Cryptographic Multi-Step Simulation
  const handleZatcaSign = (invId: string) => {
    setZatcaSigningInvoiceId(invId);
    setZatcaSigningStep(0);
    
    const arSteps = [
      "جاري توليد بنية XML المطابقة لمعيار الفوترة الإلكترونية UBL 2.1 بنجاح...",
      "جاري احتساب البصمة الرقمية للهاش الموحد SHA-256 للمستند...",
      "جاري التوقيع الرقمي المشفر باستخدام الشهادة الرقمية للمنشأة (ECDSA P-256)...",
      "جاري استدعاء منصة فاتورة التابعة لهيئة الزكاة ومطابقة الرمز التعريفي للفاتورة (Fatoora API)...",
      "تم الاعتماد والتطهير بنجاح! كود هيئة الزكاة المرتجع: ZATCA-PH2-OK-2026"
    ];
    
    const enSteps = [
      "Generating compliant UBL 2.1 XML schema and injecting structural tags...",
      "Calculating standard cryptographic SHA-256 hash digest for XML payload...",
      "Signing document digitally with organization's private key (ECDSA P-256)...",
      "Transmitting payload to ZATCA Fatoora Platform web service gateway...",
      "Cleared and reported successfully! Received official ZATCA Approval UUID."
    ];
    
    const steps = lang === "ar" ? arSteps : enSteps;
    setZatcaSigningLogs([`⏳ ${steps[0]}`]);

    let stepCounter = 0;
    const interval = setInterval(() => {
      stepCounter++;
      setZatcaSigningStep(stepCounter);
      
      if (stepCounter < 5) {
        setZatcaSigningLogs(prev => [...prev, `⏳ ${steps[stepCounter]}`]);
      } else {
        clearInterval(interval);
        
        // Completed signing! Update invoice status
        setInvoices((prev) =>
          prev.map((inv) => (inv.id === invId ? { ...inv, zatcaStatus: "cleared" } : inv))
        );

        setMission1((prev) => {
          const next = { ...prev, zatcaSign: true };
          checkMission1Completion(next);
          return next;
        });

        showToast(
          lang === "ar"
            ? `تم توقيع واعتماد الفاتورة ${invId} بنجاح لدى هيئة الزكاة (ZATCA)`
            : `Invoice ${invId} signed & reported successfully to ZATCA Platform!`
        );
        
        // Auto close overlay after 1.5 seconds
        setTimeout(() => {
          setZatcaSigningInvoiceId(null);
        }, 1500);
      }
    }, 800);
  };

  // Receive Invoice Payment
  const handleReceivePayment = (invId: string) => {
    let paidAmt = 0;
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id === invId) {
          paidAmt = inv.total;
          return { ...inv, status: "paid" };
        }
        return inv;
      })
    );

    // Record bank transaction
    const newTxn: DemoTransaction = {
      id: `TXN-00${transactions.length + 1}`,
      date: new Date().toISOString().split("T")[0],
      description: `تحصيل فاتورة مبيعات ${invId}`,
      amount: paidAmt,
      type: "credit",
      category: "المبيعات",
    };

    setTransactions([newTxn, ...transactions]);

    setMission1((prev) => {
      const next = { ...prev, receivePayment: true };
      checkMission1Completion(next);
      return next;
    });

    showToast(
      lang === "ar"
        ? `تم تحصيل مبلغ الفاتورة ومطابقة الحساب البنكي تلقائياً`
        : `Payment collected, bank account reconciled automatically`
    );
  };

  // ERP actions: Hire Employee
  const handleHireEmployee = (name: string, roleName: string, salaryNum: number) => {
    const newEmp: DemoEmployee = {
      id: `EMP-${100 + employees.length + 1}`,
      name,
      role: roleName,
      department: "العمليات",
      salary: salaryNum,
      attendanceRate: 100,
    };

    setEmployees([...employees, newEmp]);
    setMission2((prev) => {
      const next = { ...prev, addEmployee: true };
      checkMission2Completion(next);
      return next;
    });

    showToast(
      lang === "ar"
        ? `تم توظيف ${name} وتسجيله في التأمينات الاجتماعية`
        : `Hired ${name} and registered in GOSI social insurance system`
    );
  };

  // Run Payroll Simulation
  const handleRunPayroll = () => {
    const totalPayroll = employees.reduce((acc, emp) => acc + emp.salary, 0);

    // Subtract from bank & record transaction
    const newTxn: DemoTransaction = {
      id: `TXN-Payroll-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString().split("T")[0],
      description: "صرف مسير الرواتب الشهري - نظام حماية الأجور (WPS)",
      amount: totalPayroll,
      type: "debit",
      category: "الرواتب والأجور",
    };

    setTransactions([newTxn, ...transactions]);
    setCompany((prev) => ({
      ...prev,
      expenses: prev.expenses + totalPayroll,
    }));

    setMission2((prev) => {
      const next = { ...prev, runPayroll: true, verifyWPS: true };
      checkMission2Completion(next);
      return next;
    });

    showToast(
      lang === "ar"
        ? `تم صرف الرواتب وتصدير ملف حماية الأجور المعتمد (WPS) للبنوك`
        : `Payroll generated & GCC Wages Protection System (WPS) compliant file exported`
    );
  };

  // Check mission completions
  const checkMission1Completion = (next: typeof mission1) => {
    if (
      next.createInvoice &&
      next.zatcaSign &&
      next.receivePayment &&
      next.viewPL &&
      !next.completed
    ) {
      next.completed = true;
      triggerCelebration(
        lang === "ar"
          ? "أحسنت! أكملت مهمة الدورة المالية: الفوترة، الربط مع الزكاة، تحصيل الأموال، والمراجعة المحاسبية."
          : "Congratulations! You completed the Financial Mission: Billing, ZATCA Signing, Bank Ingress, and P&L audit!"
      );
    }
  };

  const checkMission2Completion = (next: typeof mission2) => {
    if (next.addEmployee && next.runPayroll && next.verifyWPS && !next.completed) {
      next.completed = true;
      triggerCelebration(
        lang === "ar"
          ? "رائع! أكملت مهمة الموارد البشرية والرواتب (WPS) بنجاح."
          : "Fantastic! You completed the HR & GCC Payroll compliance mission successfully."
      );
    }
  };

  const triggerCelebration = (msg: string) => {
    setCelebration(msg);
    setTimeout(() => {
      setCelebration(null);
    }, 6000);
  };

  const showToast = (msg: string) => {
    const toastDiv = document.createElement("div");
    toastDiv.className =
      "fixed bottom-8 left-8 bg-zinc-100 border-2 border-primary text-white font-bold py-3 px-6 rounded-2xl shadow-2xl z-50 animate-bounce flex items-center gap-2";
    toastDiv.innerHTML = `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> <span>${msg}</span>`;
    document.body.appendChild(toastDiv);
    setTimeout(() => {
      toastDiv.remove();
    }, 4000);
  };

  // AI Assistant Client Request handler
  const handleAiChatSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const userMsg = aiInput;
    setAiInput("");
    setAiChat((prev) => [...prev, { role: "user", text: userMsg }]);
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: aiChat,
          currentModule: activeTab,
          language: lang,
        }),
      });

      const data = await response.json();

      setAiChat((prev) => [...prev, { role: "assistant", text: data.text }]);

      // Dynamically execute action suggested by AI inside sandbox
      if (data.action === "navigate_to_module" && data.actionPayload?.module) {
        setActiveTab(data.actionPayload.module);
        showToast(
          lang === "ar"
            ? `تم الانتقال تلقائياً لقسم: ${data.actionPayload.module}`
            : `AI navigated to: ${data.actionPayload.module}`
        );
      } else if (data.action === "create_record" && data.actionPayload?.recordType) {
        if (data.actionPayload.recordType === "invoice") {
          const clientName = data.actionPayload.recordData?.client || "مؤسسة جديدة";
          const amount = data.actionPayload.recordData?.amount || 10000;
          handleCreateInvoice(clientName, amount);
          setActiveTab("invoices");
        } else if (data.actionPayload.recordType === "lead") {
          const name = data.actionPayload.recordData?.name || "عميل محتمل جديد";
          const val = data.actionPayload.recordData?.amount || 50000;
          const newLd: DemoLead = {
            id: `LD-${2026}-${100 + leads.length + 1}`,
            name,
            company: "شركة الاتصال السريع",
            value: val,
            stage: "new",
            date: new Date().toISOString().split("T")[0],
            whatsappLogs: [
              {
                sender: "client",
                text: "أهلاً، مهتم بمنتجاتكم لخط الإنتاج الجديد.",
                time: "11:00",
              },
            ],
          };
          setLeads([newLd, ...leads]);
          setActiveTab("crm");
          showToast(
            lang === "ar"
              ? "تم إضافة عميل محتمل جديد بواسطة الذكاء الاصطناعي"
              : "New Lead added via AI Assistant"
          );
        }
      } else if (data.action === "load_demo_data" && data.actionPayload?.query) {
        // Handle filter commands
        if (data.actionPayload.query === "unpaid_invoices") {
          setActiveTab("invoices");
        } else if (
          data.actionPayload.query === "cash_flow" ||
          data.actionPayload.query === "revenue_analysis"
        ) {
          setActiveTab("accounting");
        }
      }
    } catch (err) {
      console.error(err);
      setAiChat((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            lang === "ar"
              ? "عذراً، حدث عطل أثناء الاتصال بمساعد الذكاء الاصطناعي. تفضل بمتابعة التصفح يدوياً."
              : "Sorry, I had trouble processing that request. Feel free to explore manually via the sidebar tabs!",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const getIndustryLabel = (key: string) => {
    const labels: Record<string, string> = {
      retail: t("قطاع التجزئة", "Retail Sector", "Secteur de la Vente au Détail"),
      restaurant: t("المطاعم والأغذية", "F&B / Restaurants", "Restauration & Alimentation"),
      manufacturing: t("المصانع والتصنيع", "Manufacturing Group", "Usines & Fabrication"),
      distribution: t("التوزيع والخدمات اللوجستية", "Logistics & Distribution", "Logistique & Distribution"),
      healthcare: t("الرعاية الطبية والعيادات", "Clinics & Healthcare", "Cliniques & Santé"),
      services: t("الخدمات المهنية والاستشارات", "Professional Services", "Services Professionnels"),
    };
    return labels[key] || key;
  };

  const getRoleLabel = (key: string) => {
    const labels: Record<string, string> = {
      ceo: t("الرئيس التنفيذي (CEO)", "CEO Experience", "Expérience du PDG"),
      cfo: t("المدير المالي (CFO)", "CFO Dashboard", "Tableau de Bord du DAF"),
      accountant: t("المحاسب الرئيسي", "Senior Accountant", "Comptable Principal"),
      sales_manager: t("مدير المبيعات", "Sales Director", "Directeur des Ventes"),
      warehouse_manager: t("مسؤول المستودعات", "Warehouse Coordinator", "Coordonnateur d'Entrepôt"),
      hr_manager: t("مدير الموارد البشرية", "HR & Payroll Lead", "Responsable RH & Paie"),
    };
    return labels[key] || key;
  };

  return (
    <div
      className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30 relative overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Absolute background visual flares */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Celebration & ZATCA signing overlays */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="fixed top-1/4 left-1/2 -translate-x-1/2 bg-zinc-100 border-4 border-emerald-400 p-8 rounded-[2.5rem] shadow-2xl z-50 text-center max-w-md"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-black text-emerald-400 mb-2">
              {lang === "ar" ? "تم إنجاز المهمة بنجاح!" : "Mission Accomplished!"}
            </h3>
            <p className="text-zinc-700 text-lg font-medium leading-relaxed">{celebration}</p>
            <button
              onClick={() => setCelebration(null)}
              className="mt-6 px-6 py-2 bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors"
            >
              {lang === "ar" ? "متابعة التصفح" : "Keep Exploring"}
            </button>
          </motion.div>
        )}

        {zatcaSigningInvoiceId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-zinc-100 border border-zinc-200 p-6 rounded-[2rem] w-full max-w-xl shadow-2xl space-y-4 text-right"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-zinc-200 pb-3">
                <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/20 text-primary rounded-md animate-pulse">
                  {t("ممتثل بالكامل", "ZATCA COMPLIANT", "CONFORME À LA ZATCA")}
                </span>
                <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  {t("مجمع التوقيع الإلكتروني والربط الضريبي", "ZATCA Cryptographic Signing Terminal", "Terminal de Signature Cryptographique ZATCA")}
                </h3>
              </div>

              <div className="bg-black/50 border border-zinc-200 p-4 rounded-xl font-mono text-xs text-zinc-600 space-y-2.5 min-h-[180px] overflow-y-auto">
                <div className="text-[10px] text-zinc-500 border-b border-zinc-200 pb-1.5 mb-2 flex justify-between items-center font-sans">
                  <span>Invoice Ref: {zatcaSigningInvoiceId}</span>
                  <span className="text-primary font-bold">SHA-256 Engine v2.0</span>
                </div>
                {zatcaSigningLogs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`leading-relaxed ${i === zatcaSigningStep ? "text-primary font-bold animate-pulse" : "text-zinc-500"}`}
                  >
                    {tr(log)}
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 font-sans">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] text-zinc-500">
                    {lang === "ar"
                      ? "جاري معالجة الهاش والتسجيل الفوري..."
                      : "Computing ECDSA-256 digital signature..."}
                  </span>
                </div>
                
                <span className="text-[11px] font-bold text-zinc-500">
                  {lang === "ar" ? `مرحلة ${zatcaSigningStep + 1} من 5` : `Step ${zatcaSigningStep + 1} of 5`}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header bar */}
      <nav className="fixed top-0 left-0 w-full z-40 px-6 py-4 backdrop-blur-md bg-zinc-50/80 dark:bg-zinc-50/80 border-b border-zinc-200 dark:border-zinc-200">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Logo theme={theme === "dark" ? "dark" : "light"} />
            <div className="hidden lg:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-200 text-xs text-zinc-600 dark:text-zinc-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {t("نظام الديمو التفاعلي النشط", "Live Simulation Engine", "Moteur de Simulation Actif")}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <button
              onClick={() => {
                const newLang = lang === "ar" ? "en" : "ar";
                setLang(newLang);
                showToast(
                  newLang === "ar" ? "تم تغيير اللغة للعربية" : "Language switched to English"
                );
              }}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-200 text-zinc-700 dark:text-zinc-700 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-all text-xs font-bold flex items-center gap-2"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span>{lang === "ar" ? "English" : "عربي"}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-200 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-200 transition-all text-xs font-bold flex items-center gap-2 text-zinc-700 dark:text-white"
              title={lang === "ar" ? "تغيير المظهر" : "Toggle Theme"}
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">{lang === "ar" ? "مظهر مضيء" : "Light"}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <span className="hidden sm:inline">{lang === "ar" ? "مظهر داكن" : "Dark"}</span>
                </>
              )}
            </button>

            {/* Reset button */}
            <button
              onClick={() => {
                resetDemo();
                showToast(
                  t(
                    "تم إعادة تصفير قاعدة بيانات الساندبوكس",
                    "Sandbox Database Reset Successfully",
                    "Base de données sandbox réinitialisée avec succès"
                  )
                );
              }}
              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-200 text-rose-500 dark:text-rose-400 hover:text-zinc-900 dark:hover:text-white hover:bg-rose-900/30 rounded-xl transition-all text-xs font-bold flex items-center gap-2"
              title={t("إعادة تعيين الديمو", "Reset Demo", "Réinitialiser la Démo")}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t("إعادة تعيين", "Reset Demo", "Réinitialiser")}
              </span>
            </button>

            <Link
              to="/app"
              className="px-4 py-2 bg-primary text-white text-xs sm:text-sm font-black rounded-xl hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              {lang === "ar" ? "ابدأ ريادتك مجاناً" : "Start Free Trial"}
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-4 md:px-6">
        <div className="container mx-auto max-w-7xl space-y-10">
          {/* Controls: Industry & Role selectors */}
          <div className="bg-zinc-100 border border-zinc-200 rounded-3xl p-6 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs text-primary font-black uppercase tracking-wider block mb-1">
                  {lang === "ar" ? "تخصيص الساندبوكس بالكامل" : "Full Sandbox Customization"}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-zinc-900">
                  {lang === "ar" ? "شاهد نظامك في ثوانٍ" : "See Your Business Live"}
                </h2>
                <p className="text-zinc-500 text-sm md:text-base mt-2 leading-relaxed">
                  {lang === "ar"
                    ? "اختر قطاع شركتك ودور الموظف لتوليد قاعدة بيانات متكاملة ومترابطة تحاكي المعاملات الحقيقية."
                    : "Pick your industry and team role to populate a live interconnected transactional database for your business model."}
                </p>
              </div>

              <div className="space-y-4">
                {/* Industry Picker */}
                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-2">
                    {lang === "ar" ? "١. قطاع الشركة المستهدفة:" : "1. Pick Target Industry:"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(INDUSTRIES_TEMPLATES).map((indKey) => (
                      <button
                        key={indKey}
                        onClick={() => setIndustry(indKey)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                          industry === indKey
                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                            : "bg-zinc-950 text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        {getIndustryLabel(indKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Role Picker */}
                <div>
                  <label className="block text-xs text-zinc-500 font-bold mb-2">
                    {lang === "ar" ? "٢. دور ووظيفة العميل التجريبي:" : "2. Choose User Role:"}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys(ROLES_TEMPLATES).map((roleKey) => (
                      <button
                        key={roleKey}
                        onClick={() => setRole(roleKey)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                          role === roleKey
                            ? "bg-white text-black border-white shadow-lg"
                            : "bg-zinc-950 text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                        }`}
                      >
                        {getRoleLabel(roleKey)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Business Account Synchronization Banner */}
          {user ? (
            <div className="bg-zinc-100 border border-emerald-500/30 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                      {lang === "ar" ? "جاهز للمزامنة" : "SYNC READY"}
                    </span>
                    <h3 className="text-sm font-black text-zinc-900">
                      {lang === "ar" ? "تكامل حسابك التجاري الحقيقي نشط" : "Live Corporate Synchronization"}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {lang === "ar"
                      ? `مرحباً ${user.name}. تم التحقق من هويتك. هل ترغب بربط الساندبوكس ببيانات شركتك الرسمية (${user.companyName || "تأسيس منشأة"}) وسجلك التجاري (${user.crNumber || "سجل معتمد"})؟`
                      : `Welcome ${user.name}. Verified. Would you like to bind the sandbox with your official registered name (${user.companyName || "Company Profile"}) and CR record (${user.crNumber || "Verified"})?`}
                  </p>
                </div>
              </div>
              <button
                onClick={syncRealCompanyData}
                disabled={isRealDataSynced}
                className={`px-5 py-2 text-xs font-black rounded-xl transition-all shadow-lg shrink-0 ${
                  isRealDataSynced
                    ? "bg-zinc-200 text-zinc-500 border border-zinc-700/50 cursor-not-allowed"
                    : "bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/15"
                }`}
              >
                {isRealDataSynced
                  ? lang === "ar"
                    ? "✓ تم دمج مؤشراتك الحقيقية"
                    : "✓ Live Indicators Merged"
                  : lang === "ar"
                    ? "دمج بيانات شركتي الحقيقية"
                    : "Sync My Live Business"}
              </button>
            </div>
          ) : (
            <div className="bg-zinc-100 border border-zinc-200 rounded-3xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-zinc-900">
                    {lang === "ar" ? "هل ترغب بتجربة الساندبوكس ببياناتك الفعلية؟" : "Want to test sandbox with your live profile?"}
                  </h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                    {lang === "ar"
                      ? "قم بتسجيل الدخول أو إنشاء حساب الآن لربط اسم شركتك، سجلك التجاري الفعلي، والموارد البشرية تلقائياً داخل لوحة القيادة التفاعلية."
                      : "Login or register now to automatically bind your actual business name, active CR, and payroll directly inside the sandbox."}
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="px-5 py-2.5 bg-zinc-950 border border-zinc-200 hover:border-zinc-300 text-xs font-black rounded-xl text-white transition-all text-center shrink-0"
              >
                {lang === "ar" ? "سجل دخولك الآن" : "Sign In / Register"}
              </Link>
            </div>
          )}

          {/* Interactive Split Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT Column (4/12): AI Sales specialist & Dynamic Agent */}
            <div className="xl:col-span-4 bg-zinc-100 border border-zinc-200 rounded-[2rem] p-6 h-[640px] flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between border-b border-zinc-200 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="font-black text-zinc-900 text-sm md:text-base">
                        {lang === "ar" ? "مساعد مدارج الذكي (AI Copilot)" : "Madarij AI Copilot"}
                      </h4>
                      <p className="text-[10px] text-zinc-500">
                        {lang === "ar"
                          ? "مستشار المنتجات وتغيير الشاشات تلقائياً"
                          : "Product consultant & UI action handler"}
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full">
                    {lang === "ar" ? "متصل" : "Online"}
                  </span>
                </div>

                {/* Suggestions triggers */}
                <div className="mb-4">
                  <span className="text-[10px] text-zinc-500 font-bold block mb-1.5">
                    {lang === "ar" ? "اضغط على الأسئلة السريعة المتاحة:" : "Quick Trigger Prompts:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      lang === "ar"
                        ? "ما الفارق بينكم وبين QuickBooks؟"
                        : "How are you better than QuickBooks?",
                      lang === "ar" ? "أرني المحاسبة والقيود" : "Show me accounting",
                      lang === "ar" ? "إنشاء فاتورة ضريبية" : "Create an invoice",
                      lang === "ar"
                        ? "هل يدعم الزكاة والربط الضريبي؟"
                        : "Is Saudi ZATCA supported?",
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setAiInput(q);
                        }}
                        className="text-[10px] font-medium bg-zinc-950 hover:bg-zinc-200 text-zinc-600 px-2 py-1 rounded-lg border border-zinc-200 transition-all text-right"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chat history logs */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-zinc-800 mb-4">
                {aiChat.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[90%] ${
                      msg.role === "user"
                        ? "bg-primary text-white mr-auto text-left rounded-br-none"
                        : "bg-zinc-950 text-zinc-600 ml-auto rounded-bl-none border border-zinc-200"
                    }`}
                  >
                    <div className="font-bold text-[10px] mb-1 text-zinc-500">
                      {msg.role === "user"
                        ? lang === "ar"
                          ? "أنت"
                          : "You"
                        : lang === "ar"
                          ? "مستشار مدارج"
                          : "Madarij Specialist"}
                    </div>
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="p-3 bg-zinc-950 text-zinc-500 rounded-2xl text-xs max-w-[80%] ml-auto flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                    <span>
                      {lang === "ar" ? "يرتب الرد المحاسبي الذكي..." : "Thinking deeply..."}
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleAiChatSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder={
                    lang === "ar"
                      ? "اسألني أي شيء عن النظام أو جودة الفوترة..."
                      : "Ask about compliance, competitors, or automate records..."
                  }
                  className="flex-1 bg-zinc-950 border border-zinc-200 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-primary text-white"
                />
                <button
                  type="submit"
                  disabled={isAiLoading}
                  className="p-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors shrink-0 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* RIGHT Column (8/12): Main Interactive Sandbox Frame */}
            <div className="xl:col-span-8 bg-zinc-100 border border-zinc-200 rounded-[2rem] overflow-hidden min-h-[640px] flex flex-col shadow-xl relative">
              {/* Simulator Navigation Bar */}
              <div className="bg-zinc-950 border-b border-zinc-200 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-zinc-500 font-mono ml-2">
                    sandbox-session-client@mudarij.os/workspace
                  </span>
                </div>

                {/* Sub-tabs menu */}
                <div className="flex items-center gap-1.5 overflow-x-auto max-w-full">
                  {[
                    { id: "dashboard", labelAr: "لوحة القيادة", labelEn: "Cockpit" },
                    { id: "invoices", labelAr: "الفواتير والزكاة", labelEn: "Invoicing" },
                    { id: "crm", labelAr: "المبيعات والواتساب", labelEn: "CRM & WA" },
                    { id: "accounting", labelAr: "المحاسبة المتقدمة", labelEn: "Ledger" },
                    { id: "payroll", labelAr: "الموارد والرواتب", labelEn: "WPS Payroll" },
                    { id: "shipping", labelAr: "المستودعات والشحن", labelEn: "Logistics" },
                    { id: "marketing", labelAr: "الحملات الإعلانية", labelEn: "AD Platform" },
                    { id: "tours_missions", labelAr: "المهام والجولات", labelEn: "Missions" },
                    { id: "comparison", labelAr: "مقارنة المنافسين", labelEn: "Compare" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (tab.id === "accounting") {
                          setMission1((prev) => {
                            const next = { ...prev, viewPL: true };
                            checkMission1Completion(next);
                            return next;
                          });
                        }
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                        activeTab === tab.id
                          ? "bg-primary/20 text-primary border border-primary/30"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {lang === "ar" ? tab.labelAr : tab.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Tab Screen Area */}
              <div className="flex-1 p-6 md:p-8 bg-zinc-50/60">
                <AnimatePresence mode="wait">
                  {/* TAB: DASHBOARD */}
                  {activeTab === "dashboard" && (
                    <motion.div
                      key="dashboard"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "لوحة القيادة والمؤشرات العامة"
                              : "Executive Cockpit Dashboard"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {company.name} | {getIndustryLabel(company.industry)}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 font-bold">
                          {lang === "ar"
                            ? "حالة الديمو: sandbox_active"
                            : "Demo Session: sandbox_active"}
                        </span>
                      </div>

                      {/* Top Metrics Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <span className="text-zinc-500 text-xs font-bold">
                            {t("الرصيد الإجمالي", "Net Revenue", "Chiffre d'Affaires Net")}
                          </span>
                          <div className="text-xl md:text-2xl font-black mt-1 text-emerald-400">
                            {company.revenue.toLocaleString()}{" "}
                            <span className="text-xs">{t("ريال", "SAR", "SAR")}</span>
                          </div>
                          <span className="text-[10px] text-emerald-500 mt-1 block">
                            {t("▲ +12.4% الربع الأخير", "▲ +12.4% Last Quarter", "▲ +12.4% Dernier Trimestre")}
                          </span>
                        </div>

                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <span className="text-zinc-500 text-xs font-bold">
                            {t("إجمالي المصاريف", "Operating Expenses", "Charges d'Exploitation")}
                          </span>
                          <div className="text-xl md:text-2xl font-black mt-1 text-rose-400">
                            {company.expenses.toLocaleString()}{" "}
                            <span className="text-xs">{t("ريال", "SAR", "SAR")}</span>
                          </div>
                          <span className="text-[10px] text-rose-500 mt-1 block">
                            {t("▼ -2.1% ضبط التكاليف", "▼ -2.1% Cost Control", "▼ -2.1% Maîtrise des Coûts")}
                          </span>
                        </div>

                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <span className="text-zinc-500 text-xs font-bold">
                            {t("قوة المبيعات والعملاء", "Total Customers", "Nombre de Clients")}
                          </span>
                          <div className="text-xl md:text-2xl font-black mt-1 text-white">
                            {company.customersCount.toLocaleString()}
                          </div>
                          <span className="text-[10px] text-zinc-500 mt-1 block">
                            {t("نشطين عبر الواتساب والويب", "Active on WhatsApp & Web", "Actifs sur WhatsApp & Web")}
                          </span>
                        </div>

                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <span className="text-zinc-500 text-xs font-bold">
                            {t("الربح الصافي المستهدف", "Target Net Profit", "Bénéfice Net Cible")}
                          </span>
                          <div className="text-xl md:text-2xl font-black mt-1 text-primary">
                            {(company.revenue - company.expenses).toLocaleString()}{" "}
                            <span className="text-xs">{t("ريال", "SAR", "SAR")}</span>
                          </div>
                          <span className="text-[10px] text-emerald-500 mt-1 block">
                            {t("مؤشر أداء إيجابي", "Positive KPI", "Indicateur de Performance Positif")}
                          </span>
                        </div>
                      </div>

                      {/* Live Sparkline Charting */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-zinc-500">
                              {t(
                                "رسم بياني: التدفق النقدي والسيولة",
                                "Graph: Cash Flow & Liquidity",
                                "Graphique: Flux de Trésorerie & Liquidités"
                              )}
                            </span>
                            <span className="text-xs text-emerald-400 font-bold">
                              {t("صعود إيجابي", "Positive flow", "Flux Positif")}
                            </span>
                          </div>
                          <div className="h-28 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-200 px-4">
                            <CustomSparkline data={[10, 24, 18, 42, 35, 68, 80, 75, 95]} />
                          </div>
                        </div>

                        <div className="bg-zinc-100 p-5 rounded-2xl border border-zinc-200">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold text-zinc-500">
                              {t("أداء المبيعات والرواد", "Graph: Sales Performance", "Graphique: Performance des Ventes")}
                            </span>
                            <span className="text-xs text-primary font-bold">
                              {t("محدث لحظياً", "Live synced", "Synchro en Direct")}
                            </span>
                          </div>
                          <div className="h-28 flex items-center justify-center bg-zinc-950 rounded-xl border border-zinc-200 px-4">
                            <CustomSparkline
                              data={[50, 42, 60, 55, 78, 92, 85, 110]}
                              color="#fb923c"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Quick system warnings/notices */}
                      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-primary" />
                          <span className="text-xs font-bold text-zinc-600">
                            {lang === "ar"
                              ? "جميع بيانات الساندبوكس معزولة وتأمين الحسابات يتطابق مع المعايير السعودية والخليجية."
                              : "This is an isolated sandbox workspace. Financials are auto-reconciled and fully protected."}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: INVOICES & ZATCA */}
                  {activeTab === "invoices" && (
                    <motion.div
                      key="invoices"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "إصدار الفواتير وامتثال الزكاة (ZATCA)"
                              : "Compliant Invoicing & ZATCA"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "تصدير فواتير بصيغة XML والربط الفوري مع المرحلة الثانية لهيئة الزكاة والجمارك"
                              : "Sign XML and instantly report tax-compliant invoices to Saudi government portal"}
                          </p>
                        </div>

                        <button
                          onClick={() => setShowInvoiceModal(true)}
                          className="px-4 py-2 bg-primary text-zinc-900 text-xs font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{lang === "ar" ? "فاتورة جديدة" : "New Invoice"}</span>
                        </button>
                      </div>

                      {/* Invoices List Table */}
                      <div className="overflow-x-auto bg-zinc-100 border border-zinc-200 rounded-2xl">
                        <table className="w-full text-right text-xs">
                          <thead>
                            <tr className="border-b border-zinc-200 text-zinc-500">
                              <th className="p-4">
                                {lang === "ar" ? "رقم الفاتورة" : "Invoice ID"}
                              </th>
                              <th className="p-4">{lang === "ar" ? "العميل" : "Client"}</th>
                              <th className="p-4">{lang === "ar" ? "التاريخ" : "Date"}</th>
                              <th className="p-4">
                                {lang === "ar" ? "المبلغ والضريبة" : "VAT & Total"}
                              </th>
                              <th className="p-4 text-center">
                                {lang === "ar" ? "الحالة" : "Status"}
                              </th>
                              <th className="p-4 text-center">
                                {lang === "ar" ? "الزكاة ZATCA" : "ZATCA System"}
                              </th>
                              <th className="p-4 text-left">
                                {lang === "ar" ? "العمليات" : "Actions"}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {invoices.map((inv) => (
                              <tr key={inv.id} className="hover:bg-zinc-50/40">
                                <td className="p-4 font-mono font-bold text-zinc-900">{inv.id}</td>
                                <td className="p-4 font-bold text-zinc-600">{inv.clientName}</td>
                                <td className="p-4 text-zinc-500">{inv.date}</td>
                                <td className="p-4 font-bold">
                                  {inv.total.toLocaleString()}{" "}
                                  <span className="text-[10px] text-zinc-500">SAR</span>
                                  <div className="text-[10px] text-zinc-500 font-normal">
                                    ضريبة: {inv.vat.toLocaleString()}
                                  </div>
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                      inv.status === "paid"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : inv.status === "overdue"
                                          ? "bg-rose-500/10 text-rose-400"
                                          : "bg-amber-500/10 text-amber-400"
                                    }`}
                                  >
                                    {inv.status === "paid"
                                      ? lang === "ar"
                                        ? "مدفوعة"
                                        : "Paid"
                                      : inv.status === "overdue"
                                        ? lang === "ar"
                                          ? "متأخرة"
                                          : "Overdue"
                                        : lang === "ar"
                                          ? "غير مدفوعة"
                                          : "Unpaid"}
                                  </span>
                                </td>
                                <td className="p-4 text-center">
                                  <span
                                    className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                                      inv.zatcaStatus === "cleared"
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "bg-amber-500/10 text-amber-400"
                                    }`}
                                  >
                                    {inv.zatcaStatus === "cleared"
                                      ? lang === "ar"
                                        ? "معتمدة وموقعة"
                                        : "Reported"
                                      : lang === "ar"
                                        ? "بانتظار الإرسال"
                                        : "Pending Report"}
                                  </span>
                                </td>
                                <td className="p-4 text-left space-x-1 space-y-1">
                                  {inv.zatcaStatus !== "cleared" && (
                                    <button
                                      onClick={() => handleZatcaSign(inv.id)}
                                      className="px-2.5 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500 hover:text-black rounded-lg text-[10px] font-bold"
                                    >
                                      {lang === "ar" ? "ربط زكاة" : "ZATCA Link"}
                                    </button>
                                  )}
                                  {inv.status !== "paid" && (
                                    <button
                                      onClick={() => handleReceivePayment(inv.id)}
                                      className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black rounded-lg text-[10px] font-bold"
                                    >
                                      {lang === "ar" ? "تحصيل نقدي" : "Collect"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() =>
                                      showToast(
                                        lang === "ar"
                                          ? "تم توليد وتنزيل الفاتورة الضريبية بصيغة PDF"
                                          : "Downloaded VAT compliant PDF"
                                      )
                                    }
                                    className="px-2.5 py-1 bg-zinc-200 text-zinc-600 hover:bg-zinc-300 rounded-lg text-[10px] font-bold"
                                  >
                                    <Printer className="w-3 h-3 inline-block" /> PDF
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: CRM & WHATSAPP */}
                  {activeTab === "crm" && (
                    <motion.div
                      key="crm"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Magnet className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "إدارة العملاء والصفقات والواتساب"
                              : "CRM & WhatsApp Sales Hub"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "مركز مبيعات متكامل لمحادثات الواتساب وتصنيف العملاء آلياً"
                              : "Track leads, manage deal stages and review integrated WhatsApp messages in real-time"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Deals Pipeline / Kanban */}
                        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <h4 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                            {lang === "ar" ? "قمع صفقات المبيعات النشط" : "Active Deal Pipeline"}
                          </h4>
                          <div className="grid grid-cols-4 gap-2 text-[10px] text-center">
                            {["جديد", "تواصل", "تفاوض", "مغلق رابح"].map((s, idx) => (
                              <div
                                key={idx}
                                className="bg-zinc-950 p-2 rounded-xl border border-zinc-200"
                              >
                                <span className="font-bold text-zinc-500 block mb-1">{s}</span>
                                <div className="text-primary font-black text-xs">
                                  {
                                    leads.filter((l) => {
                                      if (idx === 0) return l.stage === "new";
                                      if (idx === 1) return l.stage === "contacted";
                                      if (idx === 2) return l.stage === "negotiating";
                                      return l.stage === "won";
                                    }).length
                                  }
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                            {leads.map((ld) => (
                              <div
                                key={ld.id}
                                className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 flex justify-between items-center"
                              >
                                <div>
                                  <span className="font-bold text-zinc-600 block text-xs">
                                    {ld.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">{ld.company}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-black text-primary text-xs block">
                                    {ld.value.toLocaleString()} SAR
                                  </span>
                                  <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">
                                    {ld.stage}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* WhatsApp Simulator Frame */}
                        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 flex flex-col justify-between h-[360px]">
                          <div>
                            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3">
                              <Smartphone className="w-5 h-5 text-emerald-400" />
                              <div>
                                <h4 className="font-bold text-zinc-800 text-xs">
                                  {lang === "ar"
                                    ? "محادثة عميل: أحمد القحطاني"
                                    : "Client: Ahmad Al-Qahtani"}
                                </h4>
                                <span className="text-[9px] text-emerald-400">
                                  منفذ واتساب الرسمي المعتمد
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-2 scrollbar-thin">
                              {leads[0]?.whatsappLogs.map((log, i) => (
                                <div
                                  key={i}
                                  className={`p-2.5 rounded-xl text-[11px] leading-relaxed max-w-[85%] ${
                                    log.sender === "client"
                                      ? "bg-zinc-950 text-zinc-600 ml-auto"
                                      : "bg-emerald-500/10 text-emerald-400 mr-auto border border-emerald-500/20"
                                  }`}
                                >
                                  <div>{tr(log.text)}</div>
                                  <span className="text-[8px] text-zinc-600 block text-left mt-1">
                                    {log.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={
                                lang === "ar"
                                  ? "اكتب رداً لإرساله عبر واتساب مدارج..."
                                  : "Write a response..."
                              }
                              className="flex-1 bg-zinc-950 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-white"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  const text = (e.target as HTMLInputElement).value;
                                  if (!text) return;
                                  (e.target as HTMLInputElement).value = "";

                                  // Update whatsapp logs of first lead
                                  setLeads((prev) =>
                                    prev.map((ld, i) =>
                                      i === 0
                                        ? {
                                            ...ld,
                                            whatsappLogs: [
                                              ...ld.whatsappLogs,
                                              { sender: "agent", text, time: "الآن" },
                                            ],
                                          }
                                        : ld
                                    )
                                  );
                                  showToast(
                                    lang === "ar"
                                      ? "تم إرسال رسالة الواتساب للعميل"
                                      : "Sent WhatsApp Message successfully"
                                  );
                                }
                              }}
                            />
                            <button className="px-3 py-2 bg-emerald-500 text-black rounded-xl text-xs font-black hover:bg-emerald-400 transition-colors">
                              {lang === "ar" ? "إرسال" : "Send"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: ADVANCED ACCOUNTING & LEDGER */}
                  {activeTab === "accounting" && (
                    <motion.div
                      key="accounting"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Scale className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "المحاسبة المتقدمة ودفتر الأستاذ"
                              : "Double-Entry Ledger & Accounts"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "إعداد القيود المحاسبية الآلية، الأستاذ العام والقوائم المالية الختامية"
                              : "View transaction logs, double-entry journal items and financial statements"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Financial Statements Links */}
                        <div className="lg:col-span-1 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider">
                            {lang === "ar" ? "التقارير المالية المعتمدة" : "Financial Audits"}
                          </h4>

                          <div className="space-y-2">
                            {[
                              {
                                label:
                                  lang === "ar"
                                    ? "قائمة الأرباح والخسائر (P&L)"
                                    : "Profit & Loss Statement",
                              },
                              { label: lang === "ar" ? "الميزانية العمومية" : "Balance Sheet" },
                              {
                                label:
                                  lang === "ar" ? "بيان التدفقات النقدية" : "Cash Flow Statement",
                              },
                              { label: lang === "ar" ? "ميزان المراجعة" : "Trial Balance" },
                            ].map((rep, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setMission1((prev) => {
                                    const next = { ...prev, viewPL: true };
                                    checkMission1Completion(next);
                                    return next;
                                  });
                                  showToast(`${rep.label} generated instantly for audited company`);
                                }}
                                className="w-full text-right p-3 bg-zinc-950 hover:bg-zinc-200 rounded-xl border border-zinc-200 transition-all flex justify-between items-center text-xs font-bold text-zinc-600"
                              >
                                <span>{rep.label}</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Recent Transactions & Ledgers */}
                        <div className="lg:col-span-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <h4 className="font-bold text-zinc-800 text-xs uppercase tracking-wider">
                            {t("سجل القيود اليومية والمطابقة البنكية", "Double-Entry Journal Entries", "Entrées de Journal à Double Entrée")}
                          </h4>

                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                            {transactions.map((txn) => (
                              <div
                                key={txn.id}
                                className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <span className="font-mono text-zinc-500 block text-[10px]">
                                    {txn.id} | {txn.date}
                                  </span>
                                  <span className="font-bold text-zinc-600 mt-1 block">
                                    {tr(txn.description)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span
                                    className={`font-black text-sm block ${txn.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}
                                  >
                                    {txn.type === "credit" ? "+" : "-"}{" "}
                                    {txn.amount.toLocaleString()} SAR
                                  </span>
                                  <span className="text-[10px] text-zinc-500">{tr(txn.category)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: HR & WPS PAYROLL */}
                  {activeTab === "payroll" && (
                    <motion.div
                      key="payroll"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "الموارد البشرية والرواتب (WPS)"
                              : "GCC WPS Payroll & HR"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "تأصيل نظام مسيرات حماية الأجور، كشوفات البنوك، ونسب توطين الوظائف (نطاقات)"
                              : "Manage employees, generate compliant salary sheets and export WPS files"}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowEmployeeModal(true)}
                            className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-bold text-white hover:bg-zinc-200"
                          >
                            + {lang === "ar" ? "إضافة موظف" : "Add Employee"}
                          </button>
                          <button
                            onClick={handleRunPayroll}
                            className="px-4 py-2 bg-primary text-zinc-900 text-xs font-bold rounded-xl hover:bg-primary/90 shadow-md transition-all"
                          >
                            {lang === "ar" ? "صرف مسير الرواتب" : "Generate Payroll"}
                          </button>
                          {mission2.runPayroll && (
                            <button
                              onClick={downloadWpsSifFile}
                              className="px-4 py-2 bg-emerald-500 text-black text-xs font-black rounded-xl hover:bg-emerald-400 shadow-md transition-all animate-bounce"
                            >
                              📥 {lang === "ar" ? "تحميل كشف الأجور المعتمد .SIF" : "Download Compliant .SIF SIF"}
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Employees List */}
                        <div className="lg:col-span-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-2">
                            <h4 className="font-bold text-zinc-800 text-xs">
                              {t("قاعدة بيانات الموظفين والرواتب", "Employee & Payroll Registry", "Registre des Employés & Paie")}
                            </h4>
                            <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-200 self-start sm:self-auto">
                              <button
                                onClick={() => setPayrollViewTab("roster")}
                                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                  payrollViewTab === "roster"
                                    ? "bg-primary text-white"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                              >
                                {t("قائمة الموظفين", "Staff List", "Liste du Personnel")}
                              </button>
                              <button
                                onClick={() => setPayrollViewTab("wps")}
                                className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${
                                  payrollViewTab === "wps"
                                    ? "bg-primary text-white"
                                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                                }`}
                              >
                                {t("مسير حماية الأجور (WPS)", "WPS Audit Sheet", "Fiche de Paie WPS")}
                              </button>
                            </div>
                          </div>

                          {payrollViewTab === "roster" ? (
                            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
                              {employees.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 flex justify-between items-center text-xs"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-bold text-primary">
                                      {emp.name[0]}
                                    </div>
                                    <div>
                                      <span className="font-bold text-zinc-600 block">
                                        {emp.name}
                                      </span>
                                      <span className="text-[10px] text-zinc-500">
                                        {tr(emp.role)} | {tr(emp.department)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <span className="font-bold text-zinc-900 block">
                                      {emp.salary.toLocaleString()} SAR
                                    </span>
                                    <span className="text-[9px] text-emerald-400">
                                      {t("حضور", "Attendance", "Présence")}: {emp.attendanceRate}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="overflow-x-auto border border-zinc-200 rounded-xl bg-zinc-950 scrollbar-thin">
                              <table className="w-full text-[11px] text-zinc-600 min-w-[700px] border-collapse">
                                <thead className="bg-zinc-100/50 text-zinc-500 font-bold border-b border-zinc-200">
                                  <tr>
                                    <th className="px-3 py-2 text-right">{t("الموظف", "Employee", "Employé")}</th>
                                    <th className="px-2 py-2 text-center">{t("رقم الهوية / الإقامة", "National ID / Iqama", "ID National / Iqama")}</th>
                                    <th className="px-2 py-2 text-center">{t("البنك", "Bank Code", "Code Banque")}</th>
                                    <th className="px-2 py-2 text-center">{t("الأساسي (70%)", "Basic", "Base")}</th>
                                    <th className="px-2 py-2 text-center">{t("السكن (20%)", "Housing", "Logement")}</th>
                                    <th className="px-2 py-2 text-center">{t("البدلات (10%)", "Allowances", "Indemnités")}</th>
                                    <th className="px-2 py-2 text-center">{t("التأمينات (GOSI)", "GOSI Ded.", "Déd. GOSI")}</th>
                                    <th className="px-3 py-2 text-left">{t("الصافي", "Net Pay", "Salaire Net")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {employees.map((emp, index) => {
                                    const isSaudi = emp.name.includes("الشمر") || emp.name.includes("الزهر") || emp.name.includes("القحط") || emp.name.includes("الحرب") || emp.name.includes("العتيب") || index % 2 === 0;
                                    const nationalId = (isSaudi ? "1" : "2") + (1002394821 + index).toString().slice(1);
                                    const bankCodes = ["ALBI", "ARBJ", "NCBK", "RYBD", "SABB", "BSFR"];
                                    const bankCode = bankCodes[index % bankCodes.length];
                                    
                                    const basic = Math.round(emp.salary * 0.7);
                                    const housing = Math.round(emp.salary * 0.2);
                                    const allowances = Math.round(emp.salary * 0.1);
                                    const deductions = Math.round((basic + housing) * (isSaudi ? 0.09 : 0.02));
                                    const netPay = emp.salary - deductions;

                                    return (
                                      <tr key={emp.id} className="border-b border-zinc-200 hover:bg-zinc-100/40 transition-colors">
                                        <td className="px-3 py-2.5 font-bold text-white text-right">
                                          <div>{emp.name}</div>
                                          <div className="text-[9px] text-zinc-500 font-normal">{tr(emp.role)}</div>
                                        </td>
                                        <td className="px-2 py-2.5 text-center font-mono text-zinc-500">{nationalId}</td>
                                        <td className="px-2 py-2.5 text-center font-black text-primary">{bankCode}</td>
                                        <td className="px-2 py-2.5 text-center">{basic.toLocaleString()}</td>
                                        <td className="px-2 py-2.5 text-center">{housing.toLocaleString()}</td>
                                        <td className="px-2 py-2.5 text-center">{allowances.toLocaleString()}</td>
                                        <td className="px-2 py-2.5 text-center text-rose-400 font-bold">
                                          -{deductions.toLocaleString()}
                                          <span className="text-[8px] text-zinc-500 block">({isSaudi ? t("9% التأمينات", "9% GOSI", "9% GOSI") : t("2% الأخطار", "2% Haz", "2% Risques")})</span>
                                        </td>
                                        <td className="px-3 py-2.5 text-left font-black text-emerald-400">{netPay.toLocaleString()} SAR</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>

                        {/* Nitaqat & GOSI KPI */}
                        <div className="lg:col-span-1 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-zinc-800 text-xs border-b border-zinc-200 pb-2 mb-3">
                              {lang === "ar" ? "مؤشرات نطاقات والتأمين" : "Compliance KPIs"}
                            </h4>

                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between text-[11px] font-bold text-zinc-500 mb-1">
                                  <span>
                                    {lang === "ar" ? "نطاق التوطين الفعلي" : "Saudization Quota"}
                                  </span>
                                  <span className="text-emerald-400">
                                    {lang === "ar" ? "النطاق البلاتيني (38%)" : "Platinum Zone"}
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 rounded-full"
                                    style={{ width: "85%" }}
                                  />
                                </div>
                              </div>

                              <div>
                                <div className="flex justify-between text-[11px] font-bold text-zinc-500 mb-1">
                                  <span>
                                    {lang === "ar"
                                      ? "الامتثال لنظام حماية الأجور (WPS)"
                                      : "WPS Compliance Rate"}
                                  </span>
                                  <span className="text-emerald-400">100%</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-400 rounded-full"
                                    style={{ width: "100%" }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-200 text-[11px] text-zinc-500">
                            {lang === "ar"
                              ? "تم توليد وتدقيق ملف مسير الرواتب الأخير بنجاح. ملف الـ .WPS جاهز للتصدير البنكي الفوري."
                              : "Latest payroll audited. Compliant .WPS files prepared."}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: WAREHOUSE & SHIPPING */}
                  {activeTab === "shipping" && (
                    <motion.div
                      key="shipping"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Truck className="w-6 h-6 text-primary" />
                            {lang === "ar"
                              ? "إدارة المستودعات والشحنات"
                              : "Warehousing & Logistics"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "تتبع بوالص الشحن، وإرسال الطلبات، ومطابقة وجرد المخزون"
                              : "Track dispatch shipments, inter-warehouse transfers and print barcodes"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Products Inventory List */}
                        <div className="lg:col-span-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <h4 className="font-bold text-zinc-800 text-xs">
                            {t("مستويات المخزون والوفرة", "Live Product Stock Metrics", "Métriques de Stock en Direct")}
                          </h4>

                          <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
                            {products.map((p) => (
                              <div
                                key={p.id}
                                className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-200 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <span className="font-bold text-zinc-600 block">{tr(p.name)}</span>
                                  <span className="text-[10px] text-zinc-500">
                                    {t("رمز المنتج SKU:", "SKU:", "SKU:")} {p.sku} | {tr(p.warehouse)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-zinc-900 block">
                                    {t("المخزون:", "Stock:", "Stock:")} {p.stock} {t("وحدة", "units", "unités")}
                                  </span>
                                  <span className="text-[10px] text-zinc-500">
                                    {t("سعر البيع:", "Selling Price:", "Prix de Vente:")} {p.price} SAR
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Dispatch Actions & SPL address verification */}
                        <div className="lg:col-span-1 space-y-6">
                          <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                            <h4 className="font-bold text-zinc-800 text-xs border-b border-zinc-200 pb-2">
                              {lang === "ar" ? "إجراءات لوجستية سريعة" : "Dispatch Controls"}
                            </h4>

                            <div className="space-y-2 text-xs">
                              <button
                                onClick={() =>
                                  showToast(
                                    lang === "ar"
                                      ? "تم طباعة باركود لـ 150 وحدة منتج بنجاح"
                                      : "Generated Barcode labels for inventory"
                                  )
                                }
                                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-200 rounded-xl border border-zinc-200 text-zinc-600 font-bold"
                              >
                                📦 {lang === "ar" ? "طباعة ملصقات الباركود" : "Print Barcodes"}
                              </button>
                              <button
                                onClick={() =>
                                  showToast(
                                    lang === "ar"
                                      ? "تم جدولة جرد يدوي ومطابقة المخازن للفروع"
                                      : "Scheduled cycle counts for branches"
                                  )
                                }
                                className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-200 rounded-xl border border-zinc-200 text-zinc-600 font-bold"
                              >
                                📋 {lang === "ar" ? "طلب جرد دوري" : "Request Cycle Count"}
                              </button>
                            </div>
                          </div>

                          {/* SPL National Address Validator */}
                          <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                            <h4 className="font-bold text-zinc-800 text-xs border-b border-zinc-200 pb-2 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-primary" />
                              {lang === "ar" ? "موثق العنوان الوطني الموحد (SPL)" : "SPL National Address Validator"}
                            </h4>
                            
                            <form onSubmit={handleNationalAddressLookup} className="space-y-2">
                              <label className="block text-[10px] text-zinc-500 font-bold">
                                {lang === "ar" ? "أدخل العنوان الوطني (مثال: 8329, 13315):" : "Enter Building No, Postal Code:"}
                              </label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={nationalAddressInput}
                                  onChange={(e) => setNationalAddressInput(e.target.value)}
                                  placeholder={lang === "ar" ? "رقم المبنى، الرمز البريدي" : "8329, 13315"}
                                  className="flex-1 bg-zinc-950 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-white"
                                />
                                <button
                                  type="submit"
                                  disabled={isSearchingAddress}
                                  className="px-3 py-2 bg-primary text-zinc-900 text-xs font-bold rounded-xl hover:bg-primary/95 transition-colors"
                                >
                                  {isSearchingAddress ? "..." : (lang === "ar" ? "تحقق" : "Verify")}
                                </button>
                              </div>
                            </form>

                            {searchedAddressResult && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-zinc-950 p-3.5 rounded-xl border border-emerald-500/20 space-y-3"
                              >
                                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>{lang === "ar" ? "عنوان وطني معتمد وموثق" : "Address Verified"}</span>
                                </div>
                                <p className="text-[11px] text-zinc-600 leading-relaxed">
                                  {lang === "ar" ? searchedAddressResult.fullAddressAr : searchedAddressResult.fullAddressEn}
                                </p>
                                <div className="flex items-center gap-3 border-t border-zinc-200 pt-3">
                                  <img
                                    src={searchedAddressResult.qrDataUrl}
                                    alt="SPL QR"
                                    className="w-16 h-16 bg-white p-1 rounded-lg shrink-0"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="text-[10px] text-zinc-500 space-y-0.5">
                                    <div>الرمز البريدي: {searchedAddressResult.postalCode}</div>
                                    <div>رقم المبنى: {searchedAddressResult.buildingNumber}</div>
                                    <div>وحدة رقم: {searchedAddressResult.unitNumber}</div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: MARKETING & AI ADVERTISING */}
                  {activeTab === "marketing" && (
                    <motion.div
                      key="marketing"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <div className="flex justify-between items-center gap-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                            {lang === "ar"
                              ? "لوحة الإعلانات الذكية وتأثير الـ ROAS"
                              : "AI Advertising Platform & ROAS"}
                          </h3>
                          <p className="text-xs text-zinc-500 mt-1">
                            {lang === "ar"
                              ? "قياس العائد على الإنفاق الإعلاني ودعم المزيج التسويقي بالذكاء الاصطناعي"
                              : "Multi-touch ROAS attribution and AI text/image generator for campaigns"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* ROAS Multi-touch */}
                        <div className="lg:col-span-2 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <h4 className="font-bold text-zinc-800 text-xs">
                            {lang === "ar"
                              ? "تتبع قنوات التسويق وعائد الإعلانات"
                              : "Multi-touch ROAS Analytics"}
                          </h4>

                          <div className="grid grid-cols-3 gap-3 text-center text-xs">
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-200">
                              <span className="text-zinc-500 block text-[10px]">
                                {lang === "ar" ? "حملات سناب شات" : "Snapchat Ads"}
                              </span>
                              <span className="font-black text-white mt-1 block">4.2x ROAS</span>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-200">
                              <span className="text-zinc-500 block text-[10px]">
                                {lang === "ar" ? "حملات تيك توك" : "TikTok Ads"}
                              </span>
                              <span className="font-black text-white mt-1 block">5.8x ROAS</span>
                            </div>
                            <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-200">
                              <span className="text-zinc-500 block text-[10px]">
                                {lang === "ar" ? "جوجل سيرش" : "Google Search"}
                              </span>
                              <span className="font-black text-white mt-1 block">3.1x ROAS</span>
                            </div>
                          </div>
                        </div>

                        {/* Creative generator mock */}
                        <div className="lg:col-span-1 bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-zinc-800 text-xs border-b border-zinc-200 pb-2 mb-3">
                              {lang === "ar" ? "توليد نصوص إعلانية بالذكاء" : "AI Ad Copywriter"}
                            </h4>
                            <p className="text-[10px] text-zinc-500">
                              {lang === "ar"
                                ? "توليد محتوى تسويقي ترويجي متكامل للخليج العربي في ثوانٍ"
                                : "Generate localized ad copy for Saudi/GCC audiences instantly"}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              showToast(
                                lang === "ar"
                                  ? "تم توليد 5 نصوص إعلانية مبهرة لقطاعك"
                                  : "Generated 5 high-converting ad copy layouts"
                              );
                            }}
                            className="w-full py-2 bg-primary text-white text-xs font-black rounded-xl hover:bg-primary/90 transition-all"
                          >
                            ⚡ {lang === "ar" ? "توليد نصوص الحملة" : "Generate Campaign Copy"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* TAB: COMPETE COMPARISON */}
                  {activeTab === "comparison" && (
                    <motion.div
                      key="comparison"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CompetitorComparison language={lang} />
                    </motion.div>
                  )}

                  {/* TAB: TOURS & MISSIONS CHECKLISTS */}
                  {activeTab === "tours_missions" && (
                    <motion.div
                      key="tours_missions"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-6"
                    >
                      <h3 className="text-xl md:text-2xl font-black text-zinc-900">
                        {lang === "ar"
                          ? "مهمات الساندبوكس التفاعلية"
                          : "Sandbox Challenge Missions"}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {lang === "ar"
                          ? "جرب هذه المسارات المحددة لتعيش تجربة استخدام النظام المحاسبي الفعلي."
                          : "Follow these structural paths to experience direct hands-on enterprise compliance."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* MISSION 1 CHECKLIST */}
                        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                            <h4 className="font-bold text-zinc-800 text-xs flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center font-bold text-[10px]">
                                1
                              </span>
                              {lang === "ar"
                                ? "المهمة الأولى: الدورة المالية ومطابقتها"
                                : "Mission 1: Billing & ZATCA"}
                            </h4>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                mission1.completed
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {mission1.completed
                                ? lang === "ar"
                                  ? "مكتملة"
                                  : "Completed"
                                : lang === "ar"
                                  ? "قيد التنفيذ"
                                  : "Active"}
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs text-zinc-600">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission1.createInvoice}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={
                                  mission1.createInvoice ? "line-through text-zinc-500" : ""
                                }
                              >
                                {lang === "ar"
                                  ? "أنشئ فاتورة جديدة من قسم الفواتير"
                                  : "Create a new invoice in billing page"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission1.zatcaSign}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={mission1.zatcaSign ? "line-through text-zinc-500" : ""}
                              >
                                {lang === "ar"
                                  ? "اضغط 'ربط زكاة' لإرسالها ضريبياً"
                                  : "Click 'ZATCA Link' to sign e-invoice XML"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission1.receivePayment}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={
                                  mission1.receivePayment ? "line-through text-zinc-500" : ""
                                }
                              >
                                {lang === "ar"
                                  ? "اضغط 'تحصيل نقدي' لتحديث الرصيد"
                                  : "Click 'Collect' to reconcile bank deposit"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission1.viewPL}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span className={mission1.viewPL ? "line-through text-zinc-500" : ""}>
                                {lang === "ar"
                                  ? "تصفح قائمة الأرباح والخسائر للمراجعة المالي"
                                  : "Audit audited Profit & Loss statement"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* MISSION 2 CHECKLIST */}
                        <div className="bg-zinc-100 border border-zinc-200 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-between items-center border-b border-zinc-200 pb-2">
                            <h4 className="font-bold text-zinc-800 text-xs flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary text-black flex items-center justify-center font-bold text-[10px]">
                                2
                              </span>
                              {lang === "ar"
                                ? "المهمة الثانية: مسيرات الأجور WPS"
                                : "Mission 2: WPS Salary Sync"}
                            </h4>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                mission2.completed
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-amber-500/10 text-amber-400"
                              }`}
                            >
                              {mission2.completed
                                ? lang === "ar"
                                  ? "مكتملة"
                                  : "Completed"
                                : lang === "ar"
                                  ? "قيد التنفيذ"
                                  : "Active"}
                            </span>
                          </div>

                          <div className="space-y-2.5 text-xs text-zinc-600">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission2.addEmployee}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={mission2.addEmployee ? "line-through text-zinc-500" : ""}
                              >
                                {lang === "ar"
                                  ? "أضف موظفاً جديداً من قسم الموارد"
                                  : "Add an employee on payroll view"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission2.runPayroll}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={mission2.runPayroll ? "line-through text-zinc-500" : ""}
                              >
                                {lang === "ar"
                                  ? "اضغط 'صرف مسير الرواتب' المعتمد"
                                  : "Click 'Generate Payroll' sheet"}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={mission2.verifyWPS}
                                readOnly
                                className="w-4 h-4 rounded text-primary focus:ring-primary"
                              />
                              <span
                                className={mission2.verifyWPS ? "line-through text-zinc-500" : ""}
                              >
                                {lang === "ar"
                                  ? "التحقق من تصدير كشوفات حماية الأجور"
                                  : "Confirm compliant WPS bank files"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Invoice Modal Form */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-100 border border-zinc-200 p-6 rounded-[2rem] w-full max-w-sm space-y-4"
          >
            <h4 className="font-black text-lg text-white">
              {lang === "ar" ? "إصدار فاتورة سريعة" : "Generate Fast Invoice"}
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 mb-1">
                  {lang === "ar" ? "اسم العميل:" : "Client Name:"}
                </label>
                <input
                  type="text"
                  placeholder="شركة اليمامة المحدودة"
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-200 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">
                  {lang === "ar" ? "القيمة الإجمالية (ريال):" : "Amount (SAR):"}
                </label>
                <input
                  type="number"
                  placeholder="8500"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-200 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleCreateInvoice(newInvoice.client, Number(newInvoice.amount));
                  setShowInvoiceModal(false);
                  setNewInvoice({ client: "", amount: "" });
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs"
              >
                {lang === "ar" ? "تأكيد وإصدار" : "Confirm & Issue"}
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 py-2.5 bg-zinc-200 text-zinc-600 font-bold rounded-xl text-xs hover:bg-zinc-300"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Employee Modal Form */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-100 border border-zinc-200 p-6 rounded-[2rem] w-full max-w-sm space-y-4"
          >
            <h4 className="font-black text-lg text-white">
              {lang === "ar" ? "إضافة موظف جديد" : "Hire New Employee"}
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-500 mb-1">
                  {lang === "ar" ? "الاسم الكامل للموظف:" : "Full Name:"}
                </label>
                <input
                  type="text"
                  placeholder="فيصل المطيري"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-200 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">
                  {lang === "ar" ? "المسمى الوظيفي:" : "Role / Title:"}
                </label>
                <input
                  type="text"
                  placeholder="أخصائي عمليات شحن"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-200 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-500 mb-1">
                  {lang === "ar" ? "الراتب الأساسي (ريال):" : "Base Salary (SAR):"}
                </label>
                <input
                  type="number"
                  placeholder="6500"
                  value={newEmployee.salary}
                  onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-200 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  handleHireEmployee(
                    newEmployee.name,
                    newEmployee.role,
                    Number(newEmployee.salary)
                  );
                  setShowEmployeeModal(false);
                  setNewEmployee({ name: "", role: "", salary: "6000" });
                }}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white font-black rounded-xl text-xs"
              >
                {lang === "ar" ? "تسجيل الموظف" : "Confirm Hire"}
              </button>
              <button
                onClick={() => setShowEmployeeModal(false)}
                className="flex-1 py-2.5 bg-zinc-200 text-zinc-600 font-bold rounded-xl text-xs hover:bg-zinc-300"
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Footer credits bar */}
      <footer
        className="bg-zinc-950 py-12 border-t border-zinc-200 text-center text-white"
        dir="rtl"
      >
        <p className="text-zinc-600 text-sm font-medium">
          © 2026 Mudarij OS. صُنع بفخر لمستقبل الشركات الخليجية المتكاملة مع الأنظمة الحكومية.
        </p>
      </footer>
    </div>
  );
}
