export interface CompanyInfo {
  name: string;
  industry: string;
  employeesCount: number;
  warehousesCount: number;
  bankAccountsCount: number;
  productsCount: number;
  customersCount: number;
  suppliersCount: number;
  revenue: number;
  expenses: number;
}

export interface DemoInvoice {
  id: string;
  clientName: string;
  date: string;
  amount: number;
  vat: number;
  total: number;
  status: "paid" | "unpaid" | "overdue";
  zatcaStatus: "reported" | "cleared" | "pending";
}

export interface DemoLead {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "new" | "contacted" | "negotiating" | "won" | "lost";
  date: string;
  whatsappLogs: { sender: "client" | "agent"; text: string; time: string }[];
}

export interface DemoProduct {
  id: string;
  name: string;
  sku: string;
  stock: number;
  price: number;
  cost: number;
  warehouse: string;
}

export interface DemoEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  attendanceRate: number;
}

export interface DemoProject {
  id: string;
  name: string;
  progress: number;
  budget: number;
  tasksCount: number;
  status: "active" | "completed" | "delayed";
}

export interface DemoTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  category: string;
}

export interface CompetitorComparisonData {
  feature: string;
  madarij: boolean | string;
  quickbooks: boolean | string;
  odoo: boolean | string;
  zoho: boolean | string;
  qoyod: boolean | string;
}

export const INDUSTRIES_TEMPLATES: Record<
  string,
  { companyName: string; metrics: Partial<CompanyInfo> }
> = {
  retail: {
    companyName: "أسواق الرياض المركزية (Riyadh Central Markets)",
    metrics: {
      employeesCount: 42,
      warehousesCount: 3,
      bankAccountsCount: 4,
      productsCount: 1250,
      customersCount: 8400,
      suppliersCount: 95,
      revenue: 4200000,
      expenses: 2850000,
    },
  },
  restaurant: {
    companyName: "مجموعة جمر ولهب للمأكولات (Jamar & Lahab F&B Group)",
    metrics: {
      employeesCount: 28,
      warehousesCount: 2,
      bankAccountsCount: 3,
      productsCount: 140,
      customersCount: 15000,
      suppliersCount: 45,
      revenue: 2900000,
      expenses: 1950000,
    },
  },
  manufacturing: {
    companyName: "مصنع نجد للمصنوعات البلاستيكية (Najd Plastic Factory)",
    metrics: {
      employeesCount: 110,
      warehousesCount: 4,
      bankAccountsCount: 5,
      productsCount: 480,
      customersCount: 450,
      suppliersCount: 80,
      revenue: 8500000,
      expenses: 5900000,
    },
  },
  distribution: {
    companyName: "المتحدة للخدمات اللوجستية (United Logistics & Dist.)",
    metrics: {
      employeesCount: 75,
      warehousesCount: 6,
      bankAccountsCount: 4,
      productsCount: 3500,
      customersCount: 1200,
      suppliersCount: 110,
      revenue: 12400000,
      expenses: 9200000,
    },
  },
  healthcare: {
    companyName: "مجمع الشفاء الطبي الأهلي (Al Shifa Medical Center)",
    metrics: {
      employeesCount: 55,
      warehousesCount: 1,
      bankAccountsCount: 3,
      productsCount: 650,
      customersCount: 3400,
      suppliersCount: 30,
      revenue: 5600000,
      expenses: 3800000,
    },
  },
  services: {
    companyName: "وكالة الرؤية الرقمية للتسويق (Digital Vision Agency)",
    metrics: {
      employeesCount: 18,
      warehousesCount: 1,
      bankAccountsCount: 2,
      productsCount: 15,
      customersCount: 280,
      suppliersCount: 15,
      revenue: 1800000,
      expenses: 1100000,
    },
  },
};

export const ROLES_TEMPLATES: Record<
  string,
  { focusModule: string; welcomeMsgAr: string; welcomeMsgEn: string }
> = {
  ceo: {
    focusModule: "dashboard",
    welcomeMsgAr:
      "مرحباً بك يا سعادة المدير التنفيذي. يعرض لك هذا اللوح رؤية بزاوية 360 درجة عن المبيعات والمصاريف والأداء المالي والمخزون في الوقت الفعلي.",
    welcomeMsgEn:
      "Welcome, CEO. This cockpit dashboard provides a 360° real-time overview of sales, expenses, operational health, and stock valuation across all branches.",
  },
  cfo: {
    focusModule: "accounting",
    welcomeMsgAr:
      "أهلاً بك يا مديرنا المالي. اللوحة مصممة للمراجعة المالية العميقة، والتحقق من قيود اليومية، والربط المباشر مع هيئة الزكاة والضريبة والجمارك (ZATCA).",
    welcomeMsgEn:
      "Welcome, CFO. Your workspace is optimized for complex financial analysis, double-entry accounting journals, VAT audits, and seamless ZATCA integration.",
  },
  accountant: {
    focusModule: "invoices",
    welcomeMsgAr:
      "مرحباً بك. تتيح لك لوحة المحاسبة إدارة الفواتير وإصدار فواتير ضريبية مبسطة للعملاء برمز الاستجابة السريع QR وبنقرة واحدة.",
    welcomeMsgEn:
      "Welcome, Senior Accountant. Here you can generate tax-compliant invoices, record payments, manage credit notes, and instantly sign XML files for ZATCA.",
  },
  sales_manager: {
    focusModule: "crm",
    welcomeMsgAr:
      "أهلاً بك يا مدير المبيعات. تتبع قنوات البيع، وسجل اتصالات العملاء ومحادثات الواتساب التفاعلية مع طاقم مبيعاتك.",
    welcomeMsgEn:
      "Welcome, Sales Manager. Drive your sales pipeline, track agent tasks, and analyze real-time WhatsApp sales hub customer touchpoints.",
  },
  warehouse_manager: {
    focusModule: "shipping",
    welcomeMsgAr:
      "مرحباً بك في إدارة المستودعات والخدمات اللوجستية. يمكنك مراقبة مستويات المخزون، وتوزيع الشحنات عبر المستودعات المختلفة، وتحديث بوالص الشحن.",
    welcomeMsgEn:
      "Welcome, Warehouse & Logistics Manager. Monitor active stock levels, coordinate inter-warehouse transfers, print barcode labels, and manage shipments.",
  },
  hr_manager: {
    focusModule: "payroll",
    welcomeMsgAr:
      "مرحباً بك يا مدير الموارد البشرية. تحكم بالمسيرات، واحسب نسب نطاقات، ورخص العمل، والرواتب المتوافقة مع نظام حماية الأجور (WPS).",
    welcomeMsgEn:
      "Welcome, HR & Payroll Director. Manage employee databases, process monthly payroll, verify WPS export sheets, and calculate instant Nitaqat quotas.",
  },
};

export const COMPETITOR_COMPARISON_DATA: CompetitorComparisonData[] = [
  {
    feature: "ربط الفوترة الإلكترونية (ZATCA Phase 2)",
    madarij: "مدمج تلقائياً مجاناً (Native & Automated)",
    quickbooks: "غير مدعوم (Requires 3rd-party integration)",
    odoo: "يتطلب تعديل مكلف (Requires manual setup & heavy cost)",
    zoho: "محدود (Basic connection)",
    qoyod: "أساسي (Basic support)",
  },
  {
    feature: "نظام حماية الأجور الخليجي (WPS Integration)",
    madarij: "بنقرة واحدة لجميع البنوك (1-Click file export)",
    quickbooks: "غير مدعوم نهائياً (No GCC payroll compliance)",
    odoo: "يتطلب برمجة خاصة (Requires custom module development)",
    zoho: "محدود جداً (Very basic payroll capabilities)",
    qoyod: "يدوي (Manual configuration)",
  },
  {
    feature: "مركز مبيعات واتساب مدمج (WhatsApp Sales Hub)",
    madarij: "مباشر ومربوط بقناة المبيعات والعملاء (Integrated)",
    quickbooks: "غير متوفر (Not available)",
    odoo: "إضافات مدفوعة ومكلفة (Expensive third-party plugin)",
    zoho: "تطبيقات منفصلة (Separate standalone product)",
    qoyod: "غير متوفر (Not available)",
  },
  {
    feature: "تعدد الفروع والمستودعات والعملات",
    madarij: "متاح بالكامل بدون تكلفة إضافية (Enterprise Standard)",
    quickbooks: "متاح فقط في الباقات العليا (Advanced plan only)",
    odoo: "متاح كاشتراك إضافي لكل مستخدم (Extra subscription fee)",
    zoho: "محدود بالباقة (Plan limited)",
    qoyod: "محدود الفروع (Limited multi-branch features)",
  },
  {
    feature: "المساعد المالي الذكي بالذكاء الاصطناعي (AI Copilot)",
    madarij: "توليد فواتير، تقارير، وتوقعات باللغة العربية (Generative AI)",
    quickbooks: "أسئلة عامة بالإنجليزية فقط (English general QA only)",
    odoo: "غير مدعوم محلياً (No native conversational AI)",
    zoho: "مساعد نصي بسيط (Basic search help)",
    qoyod: "غير متوفر (Not available)",
  },
];

export function generateInitialInvoices(industry: string): DemoInvoice[] {
  const baseClients = [
    "مؤسسة الفهد للتجارة",
    "شركة النور القابضة",
    "مجموعة الشروق الطبية",
    "رغد للتجزئة",
    "توصيل الخليج",
    "سارة وأخواتها",
  ];
  return Array.from({ length: 15 }).map((_, i) => {
    const client = baseClients[i % baseClients.length];
    const amount = Math.floor(Math.random() * 20000) + 1500;
    const vat = Math.round(amount * 0.15);
    const total = amount + vat;
    const daysAgo = i * 2 + 1;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    return {
      id: `INV-2026-${1000 + i}`,
      clientName: client,
      date,
      amount,
      vat,
      total,
      status: i % 4 === 0 ? "overdue" : i % 3 === 0 ? "unpaid" : "paid",
      zatcaStatus: i % 3 === 0 ? "pending" : "cleared",
    };
  });
}

export function generateInitialLeads(industry: string): DemoLead[] {
  const contacts = [
    { name: "أحمد القحطاني", company: "مجموعة الفوزان" },
    { name: "فاطمة الهاشم", company: "الشرق اللوجستية" },
    { name: "خالد الحربي", company: "النهدي للمقاولات" },
    { name: "سلطان العتيبي", company: "مصنع نجد للبلاستيك" },
    { name: "ريم الدوسري", company: "مستشفى الجزيرة" },
  ];

  return Array.from({ length: 8 }).map((_, i) => {
    const item = contacts[i % contacts.length];
    const value = Math.floor(Math.random() * 150000) + 10000;
    const daysAgo = i * 3 + 1;
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const stages: ("new" | "contacted" | "negotiating" | "won" | "lost")[] = [
      "new",
      "contacted",
      "negotiating",
      "won",
    ];

    return {
      id: `LD-${2026}-${100 + i}`,
      name: item.name,
      company: item.company,
      value,
      stage: stages[i % stages.length],
      date,
      whatsappLogs: [
        {
          sender: "client",
          text: "السلام عليكم، هل تتوفر لديكم عروض أسعار تنافسية للموسم القادم؟",
          time: "10:00 ص",
        },
        {
          sender: "agent",
          text: "أهلاً بك يا فندم. بالتأكيد، سيقوم مستشار المبيعات بالتواصل معك فوراً وتقديم باقة مخصصة.",
          time: "10:02 ص",
        },
        {
          sender: "client",
          text: "ممتاز، أريد أيضاً التحقق من تكامل الفاتورة مع نظام الزكاة.",
          time: "10:15 ص",
        },
      ],
    };
  });
}

export function generateInitialProducts(industry: string): DemoProduct[] {
  const productsMap: Record<string, { name: string; sku: string; price: number; cost: number }[]> =
    {
      retail: [
        { name: "شاحن لاسلكي ذكي 15 واط", sku: "CHG-WRL-15", price: 120, cost: 45 },
        { name: "سماعات رأس عازلة للضوضاء", sku: "HP-ANC-02", price: 450, cost: 180 },
        { name: "ساعة ليد رياضية مضادة للماء", sku: "WTCH-LED-S", price: 299, cost: 110 },
        { name: "كابل شحن فائق السرعة 1.5م", sku: "CBL-SL-1.5", price: 35, cost: 10 },
      ],
      manufacturing: [
        { name: "بولي بروبيلين عالي الكثافة (طن)", sku: "RAW-PP-HD", price: 5400, cost: 3800 },
        { name: "قوالب حقن بلاستيكية قياس 5", sku: "MOLD-INJ-5", price: 12000, cost: 7500 },
        { name: "ملونات صناعية أساسية (كجم)", sku: "COL-IND-B", price: 150, cost: 60 },
      ],
      default: [
        { name: "رخصة نظام مدارج السحابية", sku: "LIC-MDRJ-S", price: 2500, cost: 100 },
        {
          name: "استشارات أتمتة الأعمال وسلاسل الإمداد",
          sku: "SRV-CONS-AUT",
          price: 15000,
          cost: 3000,
        },
        { name: "دعم فني مخصص ذهبي (سنوي)", sku: "SRV-SUP-GLD", price: 8000, cost: 1500 },
      ],
    };

  const list = productsMap[industry] || productsMap.default;

  return list.map((p, idx) => ({
    id: `PRD-${100 + idx}`,
    name: p.name,
    sku: p.sku,
    stock: Math.floor(Math.random() * 500) + 20,
    price: p.price,
    cost: p.cost,
    warehouse: idx % 2 === 0 ? "مستودع السلي الرئيسي" : "مستودع جدة الفرعي",
  }));
}

export function generateInitialEmployees(): DemoEmployee[] {
  const names = [
    { name: "عبدالله الشمري", role: "رئيس الحسابات", dept: "المالية" },
    { name: "سارة الزهراني", role: "مهندس واجهات", dept: "التقنية" },
    { name: "فيصل القحطاني", role: "أخصائي مبيعات كبار العملاء", dept: "المبيعات" },
    { name: "هند الحربي", role: "أخصائي موارد بشرية", dept: "الموارد البشرية" },
    { name: "منصور العتيبي", role: "مشرف مستودعات وخدمات لوجستية", dept: "سلاسل الإمداد" },
  ];

  return names.map((emp, i) => ({
    id: `EMP-${100 + i}`,
    name: emp.name,
    role: emp.role,
    department: emp.dept,
    salary: 8000 + i * 2500,
    attendanceRate: 92 + (i % 3) * 3,
  }));
}

export function generateInitialProjects(): DemoProject[] {
  return [
    {
      id: "PRJ-01",
      name: "تأسيس نظام الفوترة الإلكترونية والمزامنة الفورية",
      progress: 85,
      budget: 150000,
      tasksCount: 14,
      status: "active",
    },
    {
      id: "PRJ-02",
      name: "جرد سنوي ومطابقة المخزون في فروع المنطقة الغربية",
      progress: 100,
      budget: 45000,
      tasksCount: 8,
      status: "completed",
    },
    {
      id: "PRJ-03",
      name: "إطلاق حملة الإعلانات الذكية وتوليد قنوات البيع للربع الثالث",
      progress: 40,
      budget: 85000,
      tasksCount: 12,
      status: "active",
    },
  ];
}

export function generateInitialTransactions(): DemoTransaction[] {
  return [
    {
      id: "TXN-001",
      date: "2026-07-01",
      description: "سداد فاتورة مبيعات #INV-2026-1002",
      amount: 17250,
      type: "credit",
      category: "المبيعات",
    },
    {
      id: "TXN-002",
      date: "2026-07-02",
      description: "دفعة سداد مورد - سابك للبتروكيماويات",
      amount: 45000,
      type: "debit",
      category: "شراء مواد خام",
    },
    {
      id: "TXN-003",
      date: "2026-07-03",
      description: "تحصيل من عميل نقدي - فرع العليا",
      amount: 6200,
      type: "credit",
      category: "المبيعات",
    },
    {
      id: "TXN-004",
      date: "2026-07-04",
      description: "مصاريف وقود مركبات الشحن والنقل",
      amount: 1500,
      type: "debit",
      category: "المصاريف التشغيلية",
    },
    {
      id: "TXN-005",
      date: "2026-07-05",
      description: "رواتب الموظفين الشهرية عبر نظام WPS",
      amount: 62500,
      type: "debit",
      category: "الرواتب والأجور",
    },
  ];
}
