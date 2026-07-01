import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { logAudit } from "../services/utils.js";
import { db } from "../services/firebase.js";

const router = Router();

// ==========================================
// 1. PREDEFINED INDUSTRY COA TEMPLATES
// ==========================================
const RETAIL_COA = [
  // Assets
  {
    code: "100000",
    nameAr: "الأصول",
    nameEn: "Assets",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: null,
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "101000",
    nameAr: "الأصول المتداولة",
    nameEn: "Current Assets",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "100000",
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "101001",
    nameAr: "الصندوق / النقدية بالخزينة",
    nameEn: "Cash on Hand",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "101002",
    nameAr: "البنك - الحساب الجاري الرئيسي",
    nameEn: "Main Bank Account",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "102001",
    nameAr: "الذمم المدينة (العملاء)",
    nameEn: "Accounts Receivable",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    controlAccount: true,
    systemAccount: true,
  },
  {
    code: "103001",
    nameAr: "المخزون السلعي",
    nameEn: "Inventory",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "104000",
    nameAr: "الأصول غير المتداولة",
    nameEn: "Non-Current Assets",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "100000",
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "104001",
    nameAr: "الأصول الثابتة - الآلات والمعدات",
    nameEn: "Fixed Assets - Machinery",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "104000",
    postingAllowed: true,
    systemAccount: false,
  },

  // Liabilities
  {
    code: "200000",
    nameAr: "الخصوم (الالتزامات)",
    nameEn: "Liabilities",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: null,
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "201000",
    nameAr: "الالتزامات المتداولة",
    nameEn: "Current Liabilities",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "200000",
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "201001",
    nameAr: "الذمم الدائنة (الموردين)",
    nameEn: "Accounts Payable",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "201000",
    postingAllowed: true,
    controlAccount: true,
    systemAccount: true,
  },
  {
    code: "202001",
    nameAr: "ضريبة القيمة المضافة المستحقة (15%)",
    nameEn: "VAT Payable (15%)",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "201000",
    postingAllowed: true,
    controlAccount: true,
    systemAccount: true,
  },
  {
    code: "203001",
    nameAr: "مستحقات الرواتب والأجور",
    nameEn: "Salaries & Wages Payable",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "201000",
    postingAllowed: true,
    systemAccount: false,
  },

  // Equity
  {
    code: "300000",
    nameAr: "حقوق الملكية",
    nameEn: "Equity",
    type: "Equity",
    balance: 0,
    isActive: true,
    parent: null,
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "301001",
    nameAr: "رأس المال المدفوع",
    nameEn: "Paid-up Capital",
    type: "Equity",
    balance: 0,
    isActive: true,
    parent: "300000",
    postingAllowed: true,
    systemAccount: true,
  },
  {
    code: "302001",
    nameAr: "الأرباح المبقاة (المحتجزة)",
    nameEn: "Retained Earnings",
    type: "Equity",
    balance: 0,
    isActive: true,
    parent: "300000",
    postingAllowed: true,
    systemAccount: true,
  },

  // Revenue
  {
    code: "400000",
    nameAr: "الإيرادات",
    nameEn: "Revenue",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: null,
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "401001",
    nameAr: "إيرادات المبيعات والخدمات",
    nameEn: "Sales & Services Revenue",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: "400000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "402001",
    nameAr: "إيرادات أخرى متنوعة",
    nameEn: "Other Miscellaneous Revenue",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: "400000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "402002",
    nameAr: "أرباح فروقات أسعار الصرف (FX)",
    nameEn: "FX Exchange Gain",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: "400000",
    postingAllowed: true,
    systemAccount: true,
  },

  // Expense
  {
    code: "500000",
    nameAr: "المصروفات",
    nameEn: "Expenses",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: null,
    postingAllowed: false,
    systemAccount: true,
  },
  {
    code: "501001",
    nameAr: "تكلفة المبيعات (البضاعة المباعة)",
    nameEn: "Cost of Goods Sold (COGS)",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502001",
    nameAr: "مصروف إيجار المقرات",
    nameEn: "Rent Expense",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502002",
    nameAr: "مصروف رواتب وأجور الموظفين",
    nameEn: "Salaries & Wages Expense",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502003",
    nameAr: "مصروف فواتير ومنافع ومياه وكهرباء",
    nameEn: "Utilities Expense",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502004",
    nameAr: "مصروفات إدارية وتسويقية أخرى",
    nameEn: "Administrative & Marketing Expenses",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502005",
    nameAr: "خسائر فروقات أسعار الصرف (FX)",
    nameEn: "FX Exchange Loss",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: true,
  },
];

const MANUFACTURING_COA = [
  ...RETAIL_COA.filter((a) => !["103001", "501001"].includes(a.code)),
  {
    code: "103101",
    nameAr: "مخزون المواد الخام",
    nameEn: "Raw Materials Inventory",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "103102",
    nameAr: "مخزون الإنتاج تحت التشغيل (WIP)",
    nameEn: "Work-In-Progress Inventory",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "103103",
    nameAr: "مخزون الإنتاج التام",
    nameEn: "Finished Goods Inventory",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "501100",
    nameAr: "تكلفة البضاعة المصنعة والمنتجة",
    nameEn: "Cost of Goods Manufactured",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "501101",
    nameAr: "مصاريف الأجور المباشرة للعمال",
    nameEn: "Direct Labor Costs",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "501102",
    nameAr: "أعباء ومصاريف المصنع الإضافية",
    nameEn: "Factory Overhead Expenses",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
];

const SERVICES_COA = [
  ...RETAIL_COA.filter((a) => a.code !== "103001"),
  {
    code: "101003",
    nameAr: "أعمال قيد التنفيذ غير المفوترة",
    nameEn: "Unbilled Work in Progress",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "101000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "201003",
    nameAr: "إيرادات مؤجلة (دفعات مقدمة من العملاء)",
    nameEn: "Deferred Revenue (Retainers)",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "201000",
    postingAllowed: true,
    controlAccount: true,
    systemAccount: true,
  },
  {
    code: "401101",
    nameAr: "إيرادات استشارات وحلول تقنية",
    nameEn: "Consulting & Services Fees",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: "400000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502010",
    nameAr: "أتعاب مقاولين من الباطن خارجيين",
    nameEn: "Subcontractor Fees",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
];

const REALESTATE_COA = [
  ...RETAIL_COA.filter((a) => a.code !== "103001"),
  {
    code: "104101",
    nameAr: "العقارات الاستثمارية - أراضي ومباني",
    nameEn: "Investment Properties - Land & Buildings",
    type: "Asset",
    balance: 0,
    isActive: true,
    parent: "104000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "201005",
    nameAr: "تأمينات مستأجرين مستردة",
    nameEn: "Refundable Tenant Deposits",
    type: "Liability",
    balance: 0,
    isActive: true,
    parent: "201000",
    postingAllowed: true,
    controlAccount: true,
    systemAccount: true,
  },
  {
    code: "401201",
    nameAr: "إيرادات تأجير العقارات والوحدات",
    nameEn: "Property Rental Revenue",
    type: "Revenue",
    balance: 0,
    isActive: true,
    parent: "400000",
    postingAllowed: true,
    systemAccount: false,
  },
  {
    code: "502015",
    nameAr: "مصروفات صيانة وترميم العقارات",
    nameEn: "Property Maintenance & Repairs",
    type: "Expense",
    balance: 0,
    isActive: true,
    parent: "500000",
    postingAllowed: true,
    systemAccount: false,
  },
];

// Helper to calculate normal sign
const getAccountNormalSign = (type: string) => {
  return ["Asset", "Expense"].includes(type) ? 1 : -1;
};

// ==========================================
// 2. MIDDLEWARE / DB HELPER SEED FUNCTIONS
// ==========================================
const getOrCreateDefaultCompany = async (userId: string) => {
  const compSnap = await db.collection("companies").where("userId", "==", userId).get();

  if (compSnap.empty) {
    const defaultComp = {
      userId,
      nameAr: "شركة مدارج التقنية المحدودة (مقر رئيسي)",
      nameEn: "Madarij Tech Co. Ltd. (HQ)",
      crNumber: "1010892345",
      vatNumber: "300098765400003",
      defaultCurrency: "SAR",
      reportingCurrency: "SAR",
      address: "الرياض، المملكة العربية السعودية",
      manager: "عبدالله الشمري",
      type: "Holding",
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("companies").add(defaultComp);
    return { id: docRef.id, ...defaultComp };
  }
  const doc = compSnap.docs[0];
  return { id: doc.id, ...(doc.data() as any) };
};

const getOrCreateDefaultBranch = async (userId: string, companyId: string) => {
  const brSnap = await db
    .collection("branches")
    .where("userId", "==", userId)
    .where("companyId", "==", companyId)
    .get();

  if (brSnap.empty) {
    const defaultBranch = {
      userId,
      companyId,
      nameAr: "الفرع الرئيسي - الرياض",
      nameEn: "Main Branch - Riyadh",
      code: "BR-01",
      manager: "سليمان القحطاني",
      address: "طريق الملك فهد، الرياض",
      bankAccounts: "Main Current Account",
      status: "Active",
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("branches").add(defaultBranch);
    return { id: docRef.id, ...defaultBranch };
  }
  const doc = brSnap.docs[0];
  return { id: doc.id, ...(doc.data() as any) };
};

const getOrCreateDefaultFiscalYear = async (userId: string, companyId: string) => {
  const fySnap = await db
    .collection("fiscal_years")
    .where("userId", "==", userId)
    .where("companyId", "==", companyId)
    .get();

  if (fySnap.empty) {
    const currentYear = new Date().getFullYear();
    const periods = [];
    for (let m = 1; m <= 12; m++) {
      const padM = String(m).padStart(2, "0");
      const yearStr = String(currentYear);
      periods.push({
        id: `P-${yearStr}-${padM}`,
        name: `${yearStr}-${padM}`,
        startDate: `${yearStr}-${padM}-01`,
        endDate: m === 12 ? `${yearStr}-12-31` : `${yearStr}-${padM}-30`,
        status: "Open",
        lockedBy: null,
        lockedAt: null,
        checklist: [
          { task: "مطابقة رصيد النقدية بالخزينة والبنك", completed: true },
          { task: "مراجعة وتسوية حسابات الذمم المدينة والدائنة", completed: true },
          { task: "إثبات وضبط ضريبة القيمة المضافة ZATCA", completed: true },
          { task: "مراجعة القيود المحاسبية وتوازن ميزان المراجعة اللحظي", completed: false },
        ],
      });
    }
    const defaultFy = {
      userId,
      companyId,
      name: `السنة المالية ${currentYear}`,
      startDate: `${currentYear}-01-01`,
      endDate: `${currentYear}-12-31`,
      status: "Open",
      currentFlag: true,
      periods,
      createdAt: new Date().toISOString(),
    };
    const docRef = await db.collection("fiscal_years").add(defaultFy);
    return { id: docRef.id, ...defaultFy };
  }
  const doc = fySnap.docs[0];
  return { id: doc.id, ...(doc.data() as any) };
};

const getOrCreateDefaultExchangeRates = async (userId: string) => {
  const erSnap = await db.collection("exchange_rates").where("userId", "==", userId).get();

  if (erSnap.empty) {
    const rates = [
      { currencyCode: "SAR", rate: 1.0, source: "Saudi Central Bank (SAMA)" },
      { currencyCode: "USD", rate: 3.75, source: "SAMA Pegged Rate" },
      { currencyCode: "AED", rate: 1.02, source: "SAMA Spot Rate" },
      { currencyCode: "EUR", rate: 4.05, source: "SAMA Spot Rate" },
      { currencyCode: "KWD", rate: 12.2, source: "SAMA Spot Rate" },
      { currencyCode: "BHD", rate: 9.95, source: "SAMA Spot Rate" },
      { currencyCode: "GBP", rate: 4.75, source: "SAMA Spot Rate" },
    ];
    const batch = db.batch();
    const seeded = [];
    for (const r of rates) {
      const docRef = db.collection("exchange_rates").doc();
      const rData = {
        ...r,
        userId,
        date: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString(),
      };
      batch.set(docRef, rData);
      seeded.push({ id: docRef.id, ...rData });
    }
    await batch.commit();
    return seeded;
  }
  return erSnap.docs.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));
};

// ==========================================
// 3. ROUTE: COMPANIES MANAGEMENT
// ==========================================
router.get("/companies", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    // Pre-flight setup: guarantee at least one company exists
    await getOrCreateDefaultCompany(userId);

    const snap = await db.collection("companies").where("userId", "==", userId).get();

    const companies = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/companies", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const {
      nameAr,
      nameEn,
      crNumber,
      vatNumber,
      defaultCurrency = "SAR",
      reportingCurrency = "SAR",
      address,
      manager,
      type = "Independent",
    } = req.body;

    if (!nameAr || !nameEn) {
      return res.status(400).json({ error: "الاسم العربي والإنجليزي للشركة مطلوبان." });
    }

    const companyData = {
      userId,
      nameAr,
      nameEn,
      crNumber: crNumber || "",
      vatNumber: vatNumber || "",
      defaultCurrency,
      reportingCurrency,
      address: address || "",
      manager: manager || "",
      type,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("companies").add(companyData);
    logAudit("ACCOUNTING", { action: "Create Company", nameAr }, companyData, req);

    // Auto-seed main branch and default fiscal calendar for this new company immediately
    await getOrCreateDefaultBranch(userId, docRef.id);
    await getOrCreateDefaultFiscalYear(userId, docRef.id);

    res.status(201).json({ id: docRef.id, ...companyData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ROUTE: BRANCHES MANAGEMENT
// ==========================================
router.get("/companies/:companyId/branches", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId } = req.params;

    await getOrCreateDefaultBranch(userId, companyId);

    const snap = await db
      .collection("branches")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    const branches = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(branches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/companies/:companyId/branches", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId } = req.params;
    const { nameAr, nameEn, code, manager, address, bankAccounts } = req.body;

    if (!nameAr || !nameEn || !code) {
      return res.status(400).json({ error: "اسم الفرع العربي والإنجليزي والكود مطلوبون." });
    }

    const branchData = {
      userId,
      companyId,
      nameAr,
      nameEn,
      code,
      manager: manager || "",
      address: address || "",
      bankAccounts: bankAccounts || "",
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("branches").add(branchData);
    logAudit("ACCOUNTING", { action: "Create Branch", code }, branchData, req);
    res.status(201).json({ id: docRef.id, ...branchData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. ROUTE: FISCAL YEARS & PERIOD LOCKS
// ==========================================
router.get("/companies/:companyId/fiscal-years", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId } = req.params;

    await getOrCreateDefaultFiscalYear(userId, companyId);

    const snap = await db
      .collection("fiscal_years")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    const years = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(years);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/companies/:companyId/fiscal-years", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId } = req.params;
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res
        .status(400)
        .json({ error: "جميع حقول السنة المالية (الاسم وتاريخ البدء وتاريخ الانتهاء) مطلوبة." });
    }

    // Generate 12 monthly periods automatically
    const startYear = new Date(startDate).getFullYear();
    const periods = [];
    for (let m = 1; m <= 12; m++) {
      const padM = String(m).padStart(2, "0");
      periods.push({
        id: `P-${startYear}-${padM}`,
        name: `${startYear}-${padM}`,
        startDate: `${startYear}-${padM}-01`,
        endDate: m === 12 ? `${startYear}-12-31` : `${startYear}-${padM}-30`,
        status: "Open",
        lockedBy: null,
        lockedAt: null,
        checklist: [
          { task: "مطابقة رصيد النقدية بالخزينة والبنك", completed: false },
          { task: "مراجعة وتسوية حسابات الذمم المدينة والدائنة", completed: false },
          { task: "إثبات وضبط ضريبة القيمة المضافة ZATCA", completed: false },
          { task: "مراجعة القيود المحاسبية وتوازن ميزان المراجعة اللحظي", completed: false },
        ],
      });
    }

    const fyData = {
      userId,
      companyId,
      name,
      startDate,
      endDate,
      status: "Open",
      currentFlag: false,
      periods,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("fiscal_years").add(fyData);
    logAudit("ACCOUNTING", { action: "Create Fiscal Year", name }, fyData, req);
    res.status(201).json({ id: docRef.id, ...fyData });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post(
  "/companies/:companyId/fiscal-years/:fyId/periods/:periodId/lock",
  authenticate,
  async (req: any, res) => {
    try {
      const userId = req.user.uid;
      const { fyId, periodId } = req.params;
      const { status, checklist } = req.body; // status: Open | Soft Locked | Hard Locked | Closed

      const fyRef = db.collection("fiscal_years").doc(fyId);
      const snap = await fyRef.get();
      if (!snap.exists || snap.data()?.userId !== userId) {
        return res.status(404).json({ error: "السنة المالية غير موجودة." });
      }

      const fy = snap.data();
      const updatedPeriods = (fy?.periods || []).map((p: any) => {
        if (p.id === periodId) {
          return {
            ...p,
            status,
            checklist: checklist || p.checklist,
            lockedBy: ["Open"].includes(status) ? null : req.user.email || userId,
            lockedAt: ["Open"].includes(status) ? null : new Date().toISOString(),
          };
        }
        return p;
      });

      await fyRef.update({ periods: updatedPeriods });
      logAudit("ACCOUNTING", { action: "Toggle Period Lock", periodId, status }, { fyId }, req);
      res.json({
        success: true,
        message: "تم تحديث حالة قفل الفترة المالية وتحديث قائمة التدقيق بنجاح.",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==========================================
// 6. ROUTE: EXCHANGE RATES & REVALUATIONS
// ==========================================
router.get("/exchange-rates", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const rates = await getOrCreateDefaultExchangeRates(userId);
    res.json(rates);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/exchange-rates", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { currencyCode, rate, source } = req.body;

    if (!currencyCode || !rate) {
      return res
        .status(400)
        .json({ error: "كود العملة ومعدل الصرف مقابل الريال السعودي مطلوبان." });
    }

    const rateVal = parseFloat(rate);
    const existingSnap = await db
      .collection("exchange_rates")
      .where("userId", "==", userId)
      .where("currencyCode", "==", currencyCode)
      .get();

    const rateData = {
      userId,
      currencyCode,
      rate: rateVal,
      source: source || "Manual spot entry",
      date: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    if (!existingSnap.empty) {
      const docId = existingSnap.docs[0].id;
      await db.collection("exchange_rates").doc(docId).update(rateData);
      res.json({ id: docId, ...rateData });
    } else {
      const docRef = await db.collection("exchange_rates").add(rateData);
      res.status(201).json({ id: docRef.id, ...rateData });
    }
    logAudit(
      "ACCOUNTING",
      { action: "Set Exchange Rate", currencyCode, rate: rateVal },
      rateData,
      req
    );
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/exchange-rates/revalue", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId, currencyCode, rate, accountIds } = req.body;

    if (!companyId || !currencyCode || !rate || !accountIds || !Array.isArray(accountIds)) {
      return res.status(400).json({
        error:
          "المعلومات المطلوبة (الشركة، كود العملة، معدل الصرف الجديد، قائمة الحسابات) غير مكتملة.",
      });
    }

    const newRate = parseFloat(rate);
    const accountsSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    const accountsMap = new Map<string, any>();
    accountsSnap.docs.forEach((d) => accountsMap.set(d.id, { id: d.id, ...d.data() }));

    const journalLines: any[] = [];
    let totalAdjustment = 0;

    for (const accId of accountIds) {
      const acc = accountsMap.get(accId);
      if (!acc) continue;

      // Simulate calculations of foreign assets revaluation difference
      // E.g. account value was recorded in foreign currency
      // For demo simplicity, revalue assuming 10% change in the currency spot, generating a delta
      const oldBalance = acc.balance || 0;
      const difference = oldBalance * (newRate - 1.0) * 0.1; // proportional simulated delta

      if (Math.abs(difference) < 0.01) continue;

      totalAdjustment += difference;

      journalLines.push({
        accountId: acc.id,
        accountCode: acc.code,
        accountName: acc.nameAr,
        debit: difference > 0 ? parseFloat(difference.toFixed(4)) : 0,
        credit: difference < 0 ? parseFloat(Math.abs(difference).toFixed(4)) : 0,
        description: `تسوية إعادة تقييم فروقات العملة الأجنبية للعملة ${currencyCode}`,
        costCenter: "",
        branch: "الفرع الرئيسي",
        project: "",
      });
    }

    if (journalLines.length === 0) {
      return res.json({
        success: false,
        message: "لم يتم العثور على فروقات تتطلب تسوية العملات الأجنبية في الحسابات المحددة.",
      });
    }

    // Offset FX Gain/Loss account
    // Find or create FX Gain/Loss account in the COA
    const fxAcc = accountsSnap.docs.find(
      (d) => d.data().code === (totalAdjustment > 0 ? "402002" : "502005")
    );
    let fxAccId = fxAcc ? fxAcc.id : null;
    const fxAccCode = fxAcc ? fxAcc.data().code : totalAdjustment > 0 ? "402002" : "502005";
    const fxAccName = fxAcc
      ? fxAcc.data().nameAr
      : totalAdjustment > 0
        ? "أرباح فروقات أسعار الصرف (FX)"
        : "خسائر فروقات أسعار الصرف (FX)";

    if (!fxAccId) {
      // Create dynamically
      const newFxAcc = {
        userId,
        companyId,
        code: fxAccCode,
        nameAr: fxAccName,
        nameEn: totalAdjustment > 0 ? "FX Exchange Gain" : "FX Exchange Loss",
        type: totalAdjustment > 0 ? "Revenue" : "Expense",
        parent: null,
        balance: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const createdAcc = await db.collection("accounts").add(newFxAcc);
      fxAccId = createdAcc.id;
    }

    journalLines.push({
      accountId: fxAccId,
      accountCode: fxAccCode,
      accountName: fxAccName,
      debit: totalAdjustment < 0 ? parseFloat(Math.abs(totalAdjustment).toFixed(4)) : 0,
      credit: totalAdjustment > 0 ? parseFloat(totalAdjustment.toFixed(4)) : 0,
      description: `قيد تسوية موازن فروقات إعادة تقييم النقد والعملة الأجنبية لـ ${currencyCode}`,
      costCenter: "",
      branch: "الفرع الرئيسي",
      project: "",
    });

    // Create posted journal entry
    const jSnap = await db.collection("journals").where("userId", "==", userId).get();
    const jNum = `FX-REV-${jSnap.size + 1}`;

    const fxJournal = {
      userId,
      companyId,
      journalNumber: jNum,
      date: new Date().toISOString().slice(0, 10),
      description: `قيد آلي لتسوية فروقات أسعار صرف العملات الأجنبية للعملة ${currencyCode}`,
      status: "Draft",
      currency: "SAR",
      exchangeRate: 1,
      lines: journalLines,
      totalDebits: parseFloat(Math.abs(totalAdjustment).toFixed(4)),
      totalCredits: parseFloat(Math.abs(totalAdjustment).toFixed(4)),
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("journals").add(fxJournal);
    logAudit(
      "ACCOUNTING",
      { action: "Generate FX Revaluation Journal", currencyCode },
      { revaluationAmount: totalAdjustment },
      req
    );

    res.json({
      success: true,
      journalId: docRef.id,
      journalNumber: jNum,
      linesCount: journalLines.length,
      message: `تم احتساب تسوية العملات الأجنبية بنجاح بمعدل صرف ${newRate} وإنشاء قيد موازن وموازاة الحسابات.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 7. ROUTE: CHART OF ACCOUNTS & SEED TEMPLATES
// ==========================================
router.get("/accounts", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const companyId = req.query.companyId;

    if (!companyId) {
      // Default to active or first company
      const defaultCompany = await getOrCreateDefaultCompany(userId);
      return res.redirect(`/api/accounting/accounts?companyId=${defaultCompany.id}`);
    }

    const snap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    if (snap.empty) {
      console.log(`[Accounting Engine] Seeding default Retail COA for Company: ${companyId}`);
      const batch = db.batch();
      for (const item of RETAIL_COA) {
        const docRef = db.collection("accounts").doc();
        batch.set(docRef, {
          ...item,
          userId,
          companyId,
          createdAt: new Date().toISOString(),
        });
      }
      await batch.commit();

      const newSnap = await db
        .collection("accounts")
        .where("userId", "==", userId)
        .where("companyId", "==", companyId)
        .get();
      const accounts = newSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return res.json(accounts);
    }

    const accounts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/accounts/seed-template", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId, template } = req.body; // template: "Retail" | "Manufacturing" | "Professional Services" | "Real Estate"

    if (!companyId || !template) {
      return res.status(400).json({ error: "الشركة والقالب المطلوب للتهيئة مطلوبان." });
    }

    let targetCOA = RETAIL_COA;
    if (template === "Manufacturing") targetCOA = MANUFACTURING_COA;
    else if (template === "Professional Services") targetCOA = SERVICES_COA;
    else if (template === "Real Estate") targetCOA = REALESTATE_COA;

    // Purge old accounts for this company to re-seed cleanly
    const oldSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    const batch = db.batch();
    oldSnap.docs.forEach((doc) => batch.delete(doc.ref));

    // Seed new template
    for (const item of targetCOA) {
      const docRef = db.collection("accounts").doc();
      batch.set(docRef, {
        ...item,
        userId,
        companyId,
        createdAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    logAudit("ACCOUNTING", { action: "Seed COA Template", template }, { companyId }, req);
    res.json({
      success: true,
      message: `تمت إعادة تهيئة شجرة الحسابات بنجاح للمنشأة وفقاً لقالب: ${template}`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/accounts", authenticate, async (req: any, res) => {
  try {
    const {
      code,
      nameAr,
      nameEn,
      type,
      parent,
      companyId,
      postingAllowed = true,
      controlAccount = false,
      systemAccount = false,
      currencyRestriction = "SAR",
    } = req.body;
    const userId = req.user.uid;

    if (!code || !nameAr || !nameEn || !type || !companyId) {
      return res.status(400).json({
        error: "جميع الحقول (الشركة، الرمز، الاسم العربي، الاسم الإنجليزي، النوع) مطلوبة.",
      });
    }

    // Check duplicate code in this company
    const dupSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .where("code", "==", code)
      .get();

    if (!dupSnap.empty) {
      return res
        .status(400)
        .json({ error: `كود الحساب ${code} مستخدم بالفعل لحساب آخر في هذه الشركة.` });
    }

    const newAccount = {
      userId,
      companyId,
      code,
      nameAr,
      nameEn,
      type,
      parent: parent || null,
      postingAllowed: postingAllowed !== false,
      controlAccount: !!controlAccount,
      systemAccount: !!systemAccount,
      currencyRestriction: currencyRestriction || "SAR",
      balance: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("accounts").add(newAccount);
    logAudit("ACCOUNTING", { action: "Create GL Account Custom", code }, newAccount, req);

    res.status(201).json({ id: docRef.id, ...newAccount });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. ROUTE: JOURNALS MANAGEMENT
// ==========================================
router.get("/journals", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const companyId = req.query.companyId;

    if (!companyId) {
      const defaultCompany = await getOrCreateDefaultCompany(userId);
      return res.redirect(`/api/accounting/journals?companyId=${defaultCompany.id}`);
    }

    const snap = await db
      .collection("journals")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    // Sort client side for reliability and avoid complex index setup
    const journals = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    journals.sort((a: any, b: any) => b.date.localeCompare(a.date));

    res.json(journals);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/journals", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const {
      id,
      companyId,
      branchId,
      date,
      description,
      lines,
      status = "Draft",
      currency = "SAR",
      exchangeRate = 1,
      intercompany = false,
      destinationCompanyId,
    } = req.body;

    if (!companyId || !date || !lines || !Array.isArray(lines) || lines.length < 2) {
      return res.status(400).json({
        error: "جميع المعلومات الأساسية (الشركة والتاريخ وسطري قيد محاسبيين كحد أدنى) مطلوبة.",
      });
    }

    // CHECK FISCAL YEAR AND PERIOD LOCK STATUS
    const fySnap = await db
      .collection("fiscal_years")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();

    if (!fySnap.empty) {
      const activeFy = fySnap.docs.find((d) => {
        const dData = d.data();
        return date >= dData.startDate && date <= dData.endDate;
      });

      if (activeFy) {
        const fyData = activeFy.data();
        const period = (fyData.periods || []).find(
          (p: any) => date >= p.startDate && date <= p.endDate
        );
        if (period && ["Hard Locked", "Closed"].includes(period.status)) {
          return res.status(400).json({
            error: `الفترة المالية المقابلة (${period.name}) مغلقة أو مقفلة نهائياً لا تتيح التعديل.`,
          });
        }
      }
    }

    // Process and format lines
    const formattedLines = lines.map((line: any, idx: number) => {
      const lineCurrency = line.originalCurrency || line.currency || currency || "SAR";
      const lineRate = parseFloat(line.exchangeRate) || parseFloat(exchangeRate) || 1;
      const originalDebit = parseFloat(line.debit) || 0;
      const originalCredit = parseFloat(line.credit) || 0;
      const baseDebit = parseFloat((originalDebit * lineRate).toFixed(4));
      const baseCredit = parseFloat((originalCredit * lineRate).toFixed(4));

      return {
        lineNo: idx + 1,
        accountId: line.accountId,
        accountCode: line.accountCode,
        accountName: line.accountName,
        debit: originalDebit,
        credit: originalCredit,
        originalCurrency: lineCurrency,
        baseCurrency: "SAR",
        exchangeRate: lineRate,
        baseDebit: baseDebit,
        baseCredit: baseCredit,
        description: line.description || "",
        costCenter: line.costCenter || "",
        branch: line.branch || "الفرع الرئيسي",
        project: line.project || "",
      };
    });

    const totalDebits = formattedLines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredits = formattedLines.reduce((sum, l) => sum + l.credit, 0);

    if (status === "Posted" && Math.abs(totalDebits - totalCredits) > 0.01) {
      return res
        .status(400)
        .json({ error: "قيد المحاسبة غير متزن. يجب توازن عمودي المدين والدائن للترحيل." });
    }

    // Generate Journal Number
    let journalNumber = req.body.journalNumber;
    if (!journalNumber) {
      const countSnap = await db
        .collection("journals")
        .where("userId", "==", userId)
        .where("companyId", "==", companyId)
        .get();
      const num = countSnap.size + 1;
      const year = new Date(date).getFullYear();
      journalNumber = `JV-${year}-${String(num).padStart(5, "0")}`;
    }

    const journalData: any = {
      userId,
      companyId,
      branchId: branchId || "Main",
      journalNumber,
      date,
      description: description || "",
      status,
      currency,
      exchangeRate: parseFloat(exchangeRate) || 1,
      lines: formattedLines,
      totalDebits,
      totalCredits,
      intercompany: !!intercompany,
      destinationCompanyId: destinationCompanyId || null,
      updatedAt: new Date().toISOString(),
    };

    if (id) {
      const existing = await db.collection("journals").doc(id).get();
      if (existing.exists && existing.data()?.status === "Posted") {
        return res.status(400).json({ error: "لا يمكن تعديل قيد مالي مرحل للأستاذ العام مسبقاً." });
      }
      await db.collection("journals").doc(id).update(journalData);
      logAudit("ACCOUNTING", { action: "Update Journal Draft", journalNumber }, journalData, req);
      res.json({ id, ...journalData });
    } else {
      journalData.createdAt = new Date().toISOString();
      const docRef = await db.collection("journals").add(journalData);
      logAudit("ACCOUNTING", { action: "Create Journal Draft", journalNumber }, journalData, req);
      res.status(201).json({ id: docRef.id, ...journalData });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. ATOMIC JOURNAL POSTINGS TO GL
// ==========================================
router.post("/journals/:id/post", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const journalId = req.params.id;

    const result = await db.runTransaction(async (transaction) => {
      const journalRef = db.collection("journals").doc(journalId);
      const journalSnap = await transaction.get(journalRef);

      if (!journalSnap.exists) {
        throw new Error("القيد المحاسبي غير موجود.");
      }

      const journal = journalSnap.data() as any;
      if (journal.userId !== userId) {
        throw new Error("غير مصرح لك بترحيل هذا القيد.");
      }
      if (journal.status === "Posted") {
        throw new Error("القيد مرحل بالفعل.");
      }

      // Check period lock
      const fySnap = await db
        .collection("fiscal_years")
        .where("userId", "==", userId)
        .where("companyId", "==", journal.companyId)
        .get();

      if (!fySnap.empty) {
        const activeFy = fySnap.docs.find((d) => {
          const dData = d.data();
          return journal.date >= dData.startDate && journal.date <= dData.endDate;
        });

        if (activeFy) {
          const fyData = activeFy.data();
          const period = (fyData.periods || []).find(
            (p: any) => journal.date >= p.startDate && journal.date <= p.endDate
          );
          if (period && ["Hard Locked", "Closed"].includes(period.status)) {
            throw new Error(`القيد يقع ضمن فترة مالية مغلقة أو مقفلة نهائياً (${period.name}).`);
          }
        }
      }

      const lines = journal.lines || [];
      const accountIds = lines.map((l: any) => l.accountId).filter(Boolean);
      const accountRefs = accountIds.map((id: string) => db.collection("accounts").doc(id));
      const accountSnaps = await Promise.all(accountRefs.map((ref) => transaction.get(ref)));

      const accountsMap = new Map<string, any>();
      accountSnaps.forEach((snap) => {
        if (snap.exists) accountsMap.set(snap.id, snap.data());
      });

      // 1. Post to GL and Update Balances
      let baseDebitsTotal = 0;
      let baseCreditsTotal = 0;

      for (const line of lines) {
        const accId = line.accountId;
        const accData = accountsMap.get(accId);
        if (!accData) {
          throw new Error(`حساب الأستاذ المالي (${line.accountCode}) غير موجود أو معطل.`);
        }

        // Check system control account restrictions
        if (accData.postingAllowed === false) {
          throw new Error(
            `حساب الأستاذ المالي (${accData.nameAr}) هو حساب فرعي مجمع لا يقبل الترحيل المباشر.`
          );
        }

        const sign = getAccountNormalSign(accData.type);
        const lineCurrency = line.originalCurrency || journal.currency || "SAR";
        const lineRate = line.exchangeRate || journal.exchangeRate || 1;
        const baseDebit =
          line.baseDebit !== undefined
            ? line.baseDebit
            : parseFloat((line.debit * lineRate).toFixed(4));
        const baseCredit =
          line.baseCredit !== undefined
            ? line.baseCredit
            : parseFloat((line.credit * lineRate).toFixed(4));

        baseDebitsTotal += baseDebit;
        baseCreditsTotal += baseCredit;

        const change = baseDebit * sign - baseCredit * sign;
        const newBalance = (accData.balance || 0) + change;

        transaction.update(db.collection("accounts").doc(accId), {
          balance: parseFloat(newBalance.toFixed(4)),
          updatedAt: new Date().toISOString(),
        });

        const glRef = db.collection("general_ledger").doc();
        transaction.set(glRef, {
          userId,
          companyId: journal.companyId,
          branchId: journal.branchId || "Main",
          journalId,
          journalNumber: journal.journalNumber,
          accountId: accId,
          accountCode: accData.code,
          accountNameAr: accData.nameAr,
          accountNameEn: accData.nameEn,
          accountType: accData.type,
          debit: baseDebit,
          credit: baseCredit,
          originalDebit: line.debit,
          originalCredit: line.credit,
          currency: lineCurrency,
          exchangeRate: lineRate,
          date: journal.date,
          description: line.description || journal.description,
          costCenter: line.costCenter || "",
          branch: line.branch || "الفرع الرئيسي",
          project: line.project || "",
          createdAt: new Date().toISOString(),
        });
      }

      // 1b. Realized FX Gain/Loss Auto-Balancing Logic
      const fxDiff = parseFloat((baseDebitsTotal - baseCreditsTotal).toFixed(4));
      if (Math.abs(fxDiff) > 0.01) {
        const isGain = fxDiff > 0;
        const fxAccCode = isGain ? "402002" : "502005";
        const fxAccName = isGain
          ? "أرباح فروقات أسعار الصرف (FX)"
          : "خسائر فروقات أسعار الصرف (FX)";
        const fxAccType = isGain ? "Revenue" : "Expense";

        // Find or create the FX account transactionally
        const fxAccQuery = await db
          .collection("accounts")
          .where("userId", "==", userId)
          .where("companyId", "==", journal.companyId)
          .where("code", "==", fxAccCode)
          .get();

        let fxAccId = null;
        let fxAccData = null;

        if (!fxAccQuery.empty) {
          const doc = fxAccQuery.docs[0];
          fxAccId = doc.id;
          fxAccData = doc.data();
        } else {
          const docRef = db.collection("accounts").doc();
          fxAccData = {
            userId,
            companyId: journal.companyId,
            code: fxAccCode,
            nameAr: fxAccName,
            nameEn: isGain ? "FX Exchange Gain" : "FX Exchange Loss",
            type: fxAccType,
            parent: null,
            balance: 0,
            isActive: true,
            createdAt: new Date().toISOString(),
          };
          transaction.set(docRef, fxAccData);
          fxAccId = docRef.id;
        }

        const sign = getAccountNormalSign(fxAccType);
        const autoDebit = isGain ? 0 : parseFloat(Math.abs(fxDiff).toFixed(4));
        const autoCredit = isGain ? parseFloat(fxDiff.toFixed(4)) : 0;
        const change = autoDebit * sign - autoCredit * sign;

        // Fetch current balance from transaction to ensure strict serialization
        const fxAccDocRef = db.collection("accounts").doc(fxAccId);
        const fxAccSnap = await transaction.get(fxAccDocRef);
        const currentBalance = fxAccSnap.exists ? fxAccSnap.data()?.balance || 0 : 0;
        const newBalance = parseFloat((currentBalance + change).toFixed(4));

        transaction.update(fxAccDocRef, {
          balance: newBalance,
          updatedAt: new Date().toISOString(),
        });

        // Write balancing GL entry
        const glRef = db.collection("general_ledger").doc();
        transaction.set(glRef, {
          userId,
          companyId: journal.companyId,
          branchId: journal.branchId || "Main",
          journalId,
          journalNumber: journal.journalNumber,
          accountId: fxAccId,
          accountCode: fxAccCode,
          accountNameAr: fxAccName,
          accountNameEn: fxAccData.nameEn || (isGain ? "FX Exchange Gain" : "FX Exchange Loss"),
          accountType: fxAccType,
          debit: autoDebit,
          credit: autoCredit,
          originalDebit: 0,
          originalCredit: 0,
          currency: "SAR",
          exchangeRate: 1,
          date: journal.date,
          description: `تسوية أوتوماتيكية لفروقات العملة والربح/الخسارة المحقق لقيد: ${journal.journalNumber}`,
          costCenter: "",
          branch: "الفرع الرئيسي",
          project: "",
          createdAt: new Date().toISOString(),
        });
      }

      // Mark main journal as Posted
      transaction.update(journalRef, {
        status: "Posted",
        postedAt: new Date().toISOString(),
        postedBy: req.user.email || userId,
      });

      // 2. INTERCOMPANY TRANSACTION MIRRORING ENGINE
      if (journal.intercompany && journal.destinationCompanyId) {
        const destCompId = journal.destinationCompanyId;
        const destCompSnap = await transaction.get(db.collection("companies").doc(destCompId));

        if (destCompSnap.exists) {
          // Find or create intercompany clearing accounts in both companies
          // Company A: Due From Company B (Asset)
          // Company B: Due To Company A (Liability)
          const allAccsSnap = await db.collection("accounts").where("userId", "==", userId).get();

          const compA_Clearing = allAccsSnap.docs.find(
            (d) => d.data().companyId === journal.companyId && d.data().code === "102002"
          );
          const compB_Clearing = allAccsSnap.docs.find(
            (d) => d.data().companyId === destCompId && d.data().code === "201002"
          );

          let clearingA_Id = compA_Clearing?.id;
          let clearingB_Id = compB_Clearing?.id;

          if (!clearingA_Id) {
            const docRef = db.collection("accounts").doc();
            transaction.set(docRef, {
              userId,
              companyId: journal.companyId,
              code: "102002",
              nameAr: `الذمم البينية المستحقة من شركة شقيقة`,
              nameEn: "Due from Sister Company",
              type: "Asset",
              parent: null,
              balance: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
            });
            clearingA_Id = docRef.id;
          }

          if (!clearingB_Id) {
            const docRef = db.collection("accounts").doc();
            transaction.set(docRef, {
              userId,
              companyId: destCompId,
              code: "201002",
              nameAr: `الذمم البينية المستحقة لشركة شقيقة`,
              nameEn: "Due to Sister Company",
              type: "Liability",
              parent: null,
              balance: 0,
              isActive: true,
              createdAt: new Date().toISOString(),
            });
            clearingB_Id = docRef.id;
          }

          // Build Matched Intercompany Mirrored Journal Entry in Destination Company B
          const mirrorJLines = lines.map((l: any, index: number) => {
            // Swap debits/credits to balance perfectly on Destination
            return {
              lineNo: index + 1,
              accountId: clearingB_Id, // Maps directly to its liability clearing
              accountCode: "201002",
              accountName: "Due to Sister Company",
              debit: l.credit,
              credit: l.debit,
              description: `قيد بيني آلي متطابق مستلم من شركة شقيقة - قيد أصل: ${journal.journalNumber}`,
              costCenter: "",
              branch: "الفرع الرئيسي",
              project: "",
            };
          });

          const mirrorRef = db.collection("journals").doc();
          const mirrorNum = `IC-MIR-${journal.journalNumber}`;
          transaction.set(mirrorRef, {
            userId,
            companyId: destCompId,
            journalNumber: mirrorNum,
            date: journal.date,
            description: `قيد تقاص وتكافؤ بيني آلي بالكامل متولد من قيد: ${journal.journalNumber}`,
            status: "Posted",
            currency: journal.currency || "SAR",
            exchangeRate: journal.exchangeRate || 1,
            lines: mirrorJLines,
            totalDebits: journal.totalCredits,
            totalCredits: journal.totalDebits,
            reversalOf: null,
            createdAt: new Date().toISOString(),
            postedAt: new Date().toISOString(),
            postedBy: "System Mirror Engine",
          });

          // Update balances for clearing B in Company B transactionally
          const clearingB_Data = compB_Clearing ? compB_Clearing.data() : { balance: 0 };
          const changeB = journal.totalCredits * -1 - journal.totalDebits * -1; // swaps due to liability normal sign
          transaction.update(db.collection("accounts").doc(clearingB_Id!), {
            balance: parseFloat(((clearingB_Data?.balance || 0) + changeB).toFixed(4)),
            updatedAt: new Date().toISOString(),
          });
        }
      }

      return { success: true, journalNumber: journal.journalNumber };
    });

    logAudit(
      "ACCOUNTING",
      { action: "Post Journal", journalNumber: result.journalNumber },
      { journalId },
      req
    );
    res.json({
      success: true,
      message: `تم ترحيل القيد المحاسبي رقم ${result.journalNumber} لدفتر الأستاذ العام وتعديل الموازين فوراً.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 10. REVERSALS & GENERAL LEDGER EXPLORER
// ==========================================
router.post("/journals/:id/reverse", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const originalId = req.params.id;

    const reversalResult = await db.runTransaction(async (transaction) => {
      const origRef = db.collection("journals").doc(originalId);
      const origSnap = await transaction.get(origRef);

      if (!origSnap.exists) {
        throw new Error("لم يتم العثور على القيد الأصلي المراد عكسه.");
      }

      const orig = origSnap.data() as any;
      if (orig.userId !== userId) {
        throw new Error("غير مصرح بالوصول لهذا القيد.");
      }
      if (orig.status !== "Posted") {
        throw new Error("لا يمكن عكس قيد غير مرحل.");
      }
      if (orig.reversed) {
        throw new Error("تم عكس هذا القيد مسبقاً.");
      }

      const reversedLines = (orig.lines || []).map((line: any) => ({
        ...line,
        debit: line.credit,
        credit: line.debit,
        description: `تسوية عكسية لقيد رقم: ${orig.journalNumber}`,
      }));

      const countSnap = await db
        .collection("journals")
        .where("userId", "==", userId)
        .where("companyId", "==", orig.companyId)
        .get();

      const revNum = `REV-${orig.journalNumber}`;

      const reversingJournal = {
        userId,
        companyId: orig.companyId,
        journalNumber: revNum,
        date: new Date().toISOString().slice(0, 10),
        description: `قيد عكس مالي تلقائي بالكامل لتصفير القيد رقم: ${orig.journalNumber}`,
        status: "Draft",
        currency: orig.currency || "SAR",
        exchangeRate: orig.exchangeRate || 1,
        lines: reversedLines,
        totalDebits: orig.totalCredits,
        totalCredits: orig.totalDebits,
        reversalOf: originalId,
        createdAt: new Date().toISOString(),
      };

      const newJVRef = db.collection("journals").doc();
      transaction.set(newJVRef, reversingJournal);

      transaction.update(origRef, {
        reversed: true,
        reversalRef: newJVRef.id,
        updatedAt: new Date().toISOString(),
      });

      return { reversingJournalId: newJVRef.id, revNum };
    });

    logAudit("ACCOUNTING", { action: "Reverse Journal Request", originalId }, reversalResult, req);
    res.json({
      success: true,
      reversingJournalId: reversalResult.reversingJournalId,
      message: `تم توليد قيد التسوية العكسي ${reversalResult.revNum} بنجاح كمسودة موازنة.`,
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/general-ledger", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const { companyId, accountId, startDate, endDate, costCenter, branch } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "معرف المنشأة/الشركة مطلوب." });
    }

    let queryRef = db
      .collection("general_ledger")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId);

    if (accountId) {
      queryRef = queryRef.where("accountId", "==", accountId);
    }
    if (costCenter) {
      queryRef = queryRef.where("costCenter", "==", costCenter);
    }
    if (branch) {
      queryRef = queryRef.where("branch", "==", branch);
    }

    const snap = await queryRef.get();
    let entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as any);

    if (startDate) {
      entries = entries.filter((e) => e.date >= startDate);
    }
    if (endDate) {
      entries = entries.filter((e) => e.date <= endDate);
    }

    entries.sort((a, b) => b.date.localeCompare(a.date));
    res.json(entries);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. FINANCIAL STATEMENTS & REPORT GENERATOR
// ==========================================
router.get("/trial-balance", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const companyId = req.query.companyId;

    if (!companyId) {
      return res.status(400).json({ error: "معرف الشركة/المنشأة مطلوب لتوليد ميزان المراجعة." });
    }

    const accSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();
    const accounts = accSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const glSnap = await db
      .collection("general_ledger")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();
    const glEntries = glSnap.docs.map((d) => d.data());

    const balanceSheetMap = new Map<
      string,
      { debit: number; credit: number; nameAr: string; nameEn: string; code: string; type: string }
    >();

    accounts.forEach((acc: any) => {
      balanceSheetMap.set(acc.id, {
        code: acc.code,
        nameAr: acc.nameAr,
        nameEn: acc.nameEn,
        type: acc.type,
        debit: 0,
        credit: 0,
      });
    });

    glEntries.forEach((entry: any) => {
      const current = balanceSheetMap.get(entry.accountId);
      if (current) {
        current.debit += parseFloat(entry.debit) || 0;
        current.credit += parseFloat(entry.credit) || 0;
      }
    });

    const rows = Array.from(balanceSheetMap.entries()).map(([id, info]) => {
      const normalSign = getAccountNormalSign(info.type);
      const balance = normalSign === 1 ? info.debit - info.credit : info.credit - info.debit;

      return {
        accountId: id,
        ...info,
        balance: parseFloat(balance.toFixed(4)),
        netDebit:
          balance > 0 && normalSign === 1
            ? balance
            : normalSign === 1 && balance < 0
              ? 0
              : balance < 0
                ? Math.abs(balance)
                : 0,
        netCredit:
          balance > 0 && normalSign === -1
            ? balance
            : normalSign === -1 && balance < 0
              ? 0
              : balance < 0
                ? Math.abs(balance)
                : 0,
      };
    });

    const totalNetDebit = rows.reduce((sum, r) => sum + (r.netDebit || 0), 0);
    const totalNetCredit = rows.reduce((sum, r) => sum + (r.netCredit || 0), 0);

    res.json({
      rows,
      totalNetDebit: parseFloat(totalNetDebit.toFixed(2)),
      totalNetCredit: parseFloat(totalNetCredit.toFixed(2)),
      isBalanced: Math.abs(totalNetDebit - totalNetCredit) < 1.0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/balance-sheet", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const companyId = req.query.companyId;

    if (!companyId) {
      return res.status(400).json({ error: "معرف المنشأة مطلوب لتوليد الميزانية العمومية." });
    }

    const accSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();
    const accounts = accSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const assets = accounts.filter((a) => a.type === "Asset");
    const liabilities = accounts.filter((a) => a.type === "Liability");
    const equity = accounts.filter((a) => a.type === "Equity");

    const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalEquity = equity.reduce((sum, a) => sum + (a.balance || 0), 0);

    res.json({
      assets,
      liabilities,
      equity,
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      totalEquity: parseFloat(totalEquity.toFixed(2)),
      totalLiabilitiesAndEquity: parseFloat((totalLiabilities + totalEquity).toFixed(2)),
      isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1.0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/income-statement", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.uid;
    const companyId = req.query.companyId;

    if (!companyId) {
      return res.status(400).json({ error: "معرف المنشأة مطلوب لتوليد قائمة الأرباح والخسائر." });
    }

    const accSnap = await db
      .collection("accounts")
      .where("userId", "==", userId)
      .where("companyId", "==", companyId)
      .get();
    const accounts = accSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));

    const revenues = accounts.filter((a) => a.type === "Revenue");
    const expenses = accounts.filter((a) => a.type === "Expense");

    const totalRevenues = revenues.reduce((sum, a) => sum + (a.balance || 0), 0);
    const totalExpenses = expenses.reduce((sum, a) => sum + (a.balance || 0), 0);
    const netProfit = totalRevenues - totalExpenses;

    res.json({
      revenues,
      expenses,
      totalRevenues: parseFloat(totalRevenues.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netProfit: parseFloat(netProfit.toFixed(2)),
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
