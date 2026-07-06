import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Scale,
  FileText,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  FolderTree,
  FileSpreadsheet,
  Building,
  Coins,
  ChevronDown,
  ChevronUp,
  ArrowUpRight,
  ShieldAlert,
  Calendar,
  Layers,
  UserCheck,
  Building2,
  Briefcase,
  Percent,
  PiggyBank,
  Sparkles,
} from "lucide-react";
import { auth } from "../lib/firebase";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";

import ReceivablesTab from "../components/accounting/ReceivablesTab";
import PayablesTab from "../components/accounting/PayablesTab";
import FixedAssetsTab from "../components/accounting/FixedAssetsTab";
import BankingTab from "../components/accounting/BankingTab";
import VatTaxTab from "../components/accounting/VatTaxTab";
import BudgetsTab from "../components/accounting/BudgetsTab";
import CopilotTab from "../components/accounting/CopilotTab";

interface Account {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
  isActive: boolean;
  parent?: string | null;
  postingAllowed?: boolean;
  controlAccount?: boolean;
  systemAccount?: boolean;
  currencyRestriction?: string;
}

interface JournalLine {
  accountId: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  description: string;
  costCenter: string;
  branch: string;
  project: string;
}

interface Journal {
  id?: string;
  journalNumber?: string;
  date: string;
  description: string;
  status: "Draft" | "Posted" | "Reversed";
  currency: string;
  exchangeRate: number;
  lines: JournalLine[];
  totalDebits: number;
  totalCredits: number;
  reversed?: boolean;
  reversalRef?: string;
  intercompany?: boolean;
  destinationCompanyId?: string | null;
  createdAt?: string;
  postedAt?: string;
  postedBy?: string;
}

interface Company {
  id: string;
  nameAr: string;
  nameEn: string;
  crNumber: string;
  vatNumber: string;
  defaultCurrency: string;
  reportingCurrency: string;
  address: string;
  manager: string;
  type: "Independent" | "Holding" | "Subsidiary" | "Sister";
}

interface Branch {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  manager: string;
  address: string;
}

interface PeriodChecklist {
  task: string;
  completed: boolean;
}

interface FiscalPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Open" | "Soft Locked" | "Hard Locked" | "Closed";
  checklist: PeriodChecklist[];
  lockedBy?: string | null;
  lockedAt?: string | null;
}

interface FiscalYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  currentFlag: boolean;
  periods: FiscalPeriod[];
}

interface ExchangeRate {
  id: string;
  currencyCode: string;
  rate: number;
  source: string;
  date: string;
}

export default function Accounting() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    | "accounts"
    | "journals"
    | "receivables"
    | "payables"
    | "banking"
    | "fixed-assets"
    | "budgets"
    | "vat-tax"
    | "copilot"
    | "periods"
    | "trial"
    | "statements"
  >("accounts");
  const [loading, setLoading] = useState(true);

  // Entities state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("all");
  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>([]);
  const [activeFiscalYearId, setActiveFiscalYearId] = useState<string>("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);

  // Accounts & Journals lists
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("all");

  // Modals visibility
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [showFiscalYearModal, setShowFiscalYearModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showFXModal, setShowFXModal] = useState(false);

  // New Forms State
  const [newCompany, setNewCompany] = useState({
    nameAr: "",
    nameEn: "",
    crNumber: "",
    vatNumber: "",
    defaultCurrency: "SAR",
    reportingCurrency: "SAR",
    address: "",
    manager: "",
    type: "Independent" as Company["type"],
  });

  const [newBranch, setNewBranch] = useState({
    nameAr: "",
    nameEn: "",
    code: "",
    manager: "",
    address: "",
  });

  const [newFiscalYear, setNewFiscalYear] = useState({
    name: "",
    startDate: "",
    endDate: "",
  });

  const [newAccount, setNewAccount] = useState({
    code: "",
    nameAr: "",
    nameEn: "",
    type: "Asset" as Account["type"],
    parent: "",
    postingAllowed: true,
    controlAccount: false,
    systemAccount: false,
    currencyRestriction: "SAR",
  });

  const [journalForm, setJournalForm] = useState<Journal>({
    date: new Date().toISOString().slice(0, 10),
    description: "",
    status: "Draft",
    currency: "SAR",
    exchangeRate: 1,
    lines: [
      {
        accountId: "",
        accountCode: "",
        accountName: "",
        debit: 0,
        credit: 0,
        description: "",
        costCenter: "",
        branch: "الفرع الرئيسي",
        project: "",
      },
      {
        accountId: "",
        accountCode: "",
        accountName: "",
        debit: 0,
        credit: 0,
        description: "",
        costCenter: "",
        branch: "الفرع الرئيسي",
        project: "",
      },
    ],
    totalDebits: 0,
    totalCredits: 0,
    intercompany: false,
    destinationCompanyId: null,
  });

  const [fxRevalue, setFxRevalue] = useState({
    currencyCode: "USD",
    rate: 3.75,
    selectedAccountIds: [] as string[],
  });

  // Statement report states
  const [trialBalanceData, setTrialBalanceData] = useState<any>(null);
  const [balanceSheetData, setBalanceSheetData] = useState<any>(null);
  const [incomeStatementData, setIncomeStatementData] = useState<any>(null);

  // Load Companies initially
  useEffect(() => {
    fetchCompanies();
  }, [user]);

  // Load dependents when Company changes
  useEffect(() => {
    if (activeCompanyId) {
      fetchCompanyDependents();
    }
  }, [activeCompanyId]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/accounting/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const comps = await res.json();
        setCompanies(comps);
        if (comps.length > 0 && !activeCompanyId) {
          setActiveCompanyId(comps[0].id);
        }
      }
    } catch (e) {
      toast.error("فشل اتصال خادم الشركات.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyDependents = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      // 1. Fetch Branches
      const brRes = await fetch(`/api/accounting/companies/${activeCompanyId}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (brRes.ok) setBranches(await brRes.json());

      // 2. Fetch Fiscal Years
      const fyRes = await fetch(`/api/accounting/companies/${activeCompanyId}/fiscal-years`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (fyRes.ok) {
        const years = await fyRes.json();
        setFiscalYears(years);
        const currentYear = years.find((y: any) => y.currentFlag) || years[0];
        if (currentYear) {
          setActiveFiscalYearId(currentYear.id);
        }
      }

      // 3. Fetch Exchange Rates
      const exRes = await fetch("/api/accounting/exchange-rates", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (exRes.ok) setExchangeRates(await exRes.json());

      // 4. Fetch Accounts & Journals
      fetchAccountsAndJournals(token);
    } catch (e) {
      toast.error("خطأ في تحميل ملحقات الشركة.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsAndJournals = async (token: string) => {
    try {
      // Accounts
      const accRes = await fetch(`/api/accounting/accounts?companyId=${activeCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (accRes.ok) setAccounts(await accRes.json());

      // Journals
      const jvRes = await fetch(`/api/accounting/journals?companyId=${activeCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (jvRes.ok) setJournals(await jvRes.json());

      // Reports
      fetchFinancialReports(token);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchFinancialReports = async (token: string) => {
    try {
      // Trial Balance
      const tRes = await fetch(`/api/accounting/trial-balance?companyId=${activeCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (tRes.ok) setTrialBalanceData(await tRes.json());

      // Balance Sheet
      const bRes = await fetch(`/api/accounting/balance-sheet?companyId=${activeCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (bRes.ok) setBalanceSheetData(await bRes.json());

      // Income Statement
      const iRes = await fetch(`/api/accounting/income-statement?companyId=${activeCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (iRes.ok) setIncomeStatementData(await iRes.json());
    } catch (e) {
      console.warn(e);
    }
  };

  // 1. ADD COMPANY
  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/accounting/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newCompany),
      });

      if (res.ok) {
        toast.success("تم إنشاء الشركة الجديدة وتهيئة أستاذها بنجاح.");
        setShowCompanyModal(false);
        setNewCompany({
          nameAr: "",
          nameEn: "",
          crNumber: "",
          vatNumber: "",
          defaultCurrency: "SAR",
          reportingCurrency: "SAR",
          address: "",
          manager: "",
          type: "Independent",
        });
        fetchCompanies();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل إنشاء الكيان.");
      }
    } catch (e) {
      toast.error("خطأ بالاتصال بالخادم.");
    }
  };

  // 2. ADD BRANCH
  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/accounting/companies/${activeCompanyId}/branches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBranch),
      });

      if (res.ok) {
        toast.success("تم تسجيل فرع المنشأة الإضافي.");
        setShowBranchModal(false);
        setNewBranch({ nameAr: "", nameEn: "", code: "", manager: "", address: "" });
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل إنشاء الفرع.");
      }
    } catch (e) {
      toast.error("خطأ بالاتصال بالخادم.");
    }
  };

  // 3. SEED COA TEMPLATE
  const handleSeedTemplate = async (template: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const confirmText = template === "Retail" ? "الافتراضي للتجزئة" : template;
      if (
        !confirm(
          `هل أنت متأكد من رغبتك في إعادة تهيئة شجرة الحسابات وفقاً لقالب: ${confirmText}؟ سيتم حذف الحسابات غير المستخدمة أولاً.`
        )
      )
        return;

      const res = await fetch("/api/accounting/accounts/seed-template", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId: activeCompanyId, template }),
      });

      if (res.ok) {
        toast.success(`تم بنجاح تحميل وإعادة بناء دليل الحسابات (${confirmText})`);
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل تحميل شجرة الحسابات.");
      }
    } catch (e) {
      toast.error("خطأ في معالجة طلب دليل الحسابات.");
    }
  };

  // 4. ADD CUSTOM ACCOUNT
  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/accounting/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...newAccount, companyId: activeCompanyId }),
      });

      if (res.ok) {
        toast.success("تمت إضافة الحساب المحاسبي لدليل شجرة الشركة.");
        setShowAccountModal(false);
        setNewAccount({
          code: "",
          nameAr: "",
          nameEn: "",
          type: "Asset",
          parent: "",
          postingAllowed: true,
          controlAccount: false,
          systemAccount: false,
          currencyRestriction: "SAR",
        });
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل إنشاء الحساب.");
      }
    } catch (e) {
      toast.error("خطأ اتصال.");
    }
  };

  // 5. FISCAL PERIOD LOCK/UNLOCK TOGGLE WITH CHECKLIST
  const handleLockPeriod = async (
    periodId: string,
    currentStatus: string,
    checklist: PeriodChecklist[]
  ) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      // Cycle lock states
      let nextStatus: FiscalPeriod["status"] = "Open";
      if (currentStatus === "Open") nextStatus = "Soft Locked";
      else if (currentStatus === "Soft Locked") nextStatus = "Hard Locked";
      else if (currentStatus === "Hard Locked") nextStatus = "Closed";
      else nextStatus = "Open";

      const res = await fetch(
        `/api/accounting/companies/${activeCompanyId}/periods/${periodId}/lock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: nextStatus, checklist }),
        }
      );

      if (res.ok) {
        toast.success(
          `تم تغيير حالة الفترة المالية لـ: ${nextStatus === "Soft Locked" ? "مقفل برمجياً مؤقتاً" : nextStatus === "Hard Locked" ? "مقفل نهائياً للمراجعة" : nextStatus === "Closed" ? "مغلق نهائياً" : "مفتوح مجدداً"}`
        );
        fetchCompanyDependents();
      }
    } catch (e) {
      toast.error("فشل تعديل حالة قفل الفترة.");
    }
  };

  const handleToggleChecklistItem = async (periodId: string, taskIndex: number) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const fy = fiscalYears.find((y) => y.id === activeFiscalYearId);
      if (!fy) return;

      const period = fy.periods.find((p) => p.id === periodId);
      if (!period) return;

      const updatedChecklist = period.checklist.map((item, idx) => {
        if (idx === taskIndex) return { ...item, completed: !item.completed };
        return item;
      });

      const res = await fetch(
        `/api/accounting/companies/${activeCompanyId}/periods/${periodId}/lock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: period.status, checklist: updatedChecklist }),
        }
      );

      if (res.ok) {
        toast.success("تم تحديث بند تدقيق الإغلاق المحاسبي.");
        fetchCompanyDependents();
      }
    } catch (e) {
      toast.error("فشل تحديث قائمة التدقيق.");
    }
  };

  // 6. ADD FISCAL YEAR
  const handleAddFiscalYear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/accounting/companies/${activeCompanyId}/fiscal-years`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newFiscalYear),
      });

      if (res.ok) {
        toast.success("تم تهيئة السنة المالية وتوليد فتراتها الـ 12 بنجاح.");
        setShowFiscalYearModal(false);
        setNewFiscalYear({ name: "", startDate: "", endDate: "" });
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل إنشاء السنة المالية.");
      }
    } catch (e) {
      toast.error("خطأ اتصال.");
    }
  };

  // 7. FX REVALUATION OPERATION
  const handleFXRevaluation = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      if (fxRevalue.selectedAccountIds.length === 0) {
        toast.error("يرجى اختيار حساب مالي واحد على الأقل لإعادة التقييم.");
        return;
      }

      const res = await fetch("/api/accounting/exchange-rates/revalue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: activeCompanyId,
          currencyCode: fxRevalue.currencyCode,
          rate: fxRevalue.rate,
          accountIds: fxRevalue.selectedAccountIds,
        }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(result.message);
        setShowFXModal(false);
        setFxRevalue({ currencyCode: "USD", rate: 3.75, selectedAccountIds: [] });
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل إجراء إعادة تقييم الحسابات.");
      }
    } catch (e) {
      toast.error("خطأ.");
    }
  };

  // 8. ADD/REMOVE JOURNAL LINES
  const addJournalLine = () => {
    setJournalForm((prev) => ({
      ...prev,
      lines: [
        ...prev.lines,
        {
          accountId: "",
          accountCode: "",
          accountName: "",
          debit: 0,
          credit: 0,
          description: "",
          costCenter: "",
          branch: "الفرع الرئيسي",
          project: "",
        },
      ],
    }));
  };

  const removeJournalLine = (index: number) => {
    if (journalForm.lines.length <= 2) {
      toast.error("يجب إدخال سطرين محاسبيين كحد أدنى.");
      return;
    }
    const updated = [...journalForm.lines];
    updated.splice(index, 1);
    setJournalForm((prev) => ({ ...prev, lines: updated }));
  };

  const handleLineChange = (index: number, field: string, value: any) => {
    const updated = [...journalForm.lines];
    if (field === "accountId") {
      const targetAcc = accounts.find((a) => a.id === value);
      if (targetAcc) {
        updated[index].accountId = value;
        updated[index].accountCode = targetAcc.code;
        updated[index].accountName = targetAcc.nameAr;
      }
    } else {
      (updated[index] as any)[field] = value;
    }

    const debits = updated.reduce((sum, l) => sum + (parseFloat(l.debit as any) || 0), 0);
    const credits = updated.reduce((sum, l) => sum + (parseFloat(l.credit as any) || 0), 0);

    setJournalForm((prev) => ({
      ...prev,
      lines: updated,
      totalDebits: debits,
      totalCredits: credits,
    }));
  };

  // 9. SAVE & POST JOURNAL
  const handleSaveJournal = async (status: "Draft" | "Posted") => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const debits = journalForm.lines.reduce(
        (sum, l) => sum + (parseFloat(l.debit as any) || 0),
        0
      );
      const credits = journalForm.lines.reduce(
        (sum, l) => sum + (parseFloat(l.credit as any) || 0),
        0
      );

      if (Math.abs(debits - credits) > 0.01) {
        toast.error("تنبيه: القيد غير متزن! يجب توازن عمودي المدين والدائن.");
        return;
      }

      const invalidLine = journalForm.lines.some(
        (l) => !l.accountId || (l.debit === 0 && l.credit === 0)
      );
      if (invalidLine) {
        toast.error("يجب تحديد الحساب المالي وقيمة أكبر من الصفر مدين أو دائن لكل الأسطر.");
        return;
      }

      // Save draft first
      const res = await fetch("/api/accounting/journals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...journalForm,
          companyId: activeCompanyId,
          status: "Draft",
          totalDebits: debits,
          totalCredits: credits,
        }),
      });

      if (res.ok) {
        const saved = await res.json();

        if (status === "Posted") {
          const postRes = await fetch(`/api/accounting/journals/${saved.id}/post`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (postRes.ok) {
            toast.success("تم ترحيل قيد اليومية للأستاذ العام وتعديل موازين الأرصدة بنجاح.");
          } else {
            const err = await postRes.json();
            toast.error(err.error || "تم الحفظ كمسودة ولكن فشل الترحيل بسبب قيود التدقيق.");
          }
        } else {
          toast.success("تم حفظ القيد كمسودة محاسبية.");
        }

        setShowJournalForm(false);
        setJournalForm({
          date: new Date().toISOString().slice(0, 10),
          description: "",
          status: "Draft",
          currency: "SAR",
          exchangeRate: 1,
          lines: [
            {
              accountId: "",
              accountCode: "",
              accountName: "",
              debit: 0,
              credit: 0,
              description: "",
              costCenter: "",
              branch: "الفرع الرئيسي",
              project: "",
            },
            {
              accountId: "",
              accountCode: "",
              accountName: "",
              debit: 0,
              credit: 0,
              description: "",
              costCenter: "",
              branch: "الفرع الرئيسي",
              project: "",
            },
          ],
          totalDebits: 0,
          totalCredits: 0,
          intercompany: false,
          destinationCompanyId: null,
        });
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل حفظ القيد.");
      }
    } catch (e) {
      toast.error("خطأ.");
    }
  };

  const handlePostJournal = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/accounting/journals/${id}/post`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("تم ترحيل القيد المحاسبي لدفتر الأستاذ العام وتعديل الأرصدة.");
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل ترحيل القيد.");
      }
    } catch (e) {
      toast.error("خطأ.");
    }
  };

  const handleReverseJournal = async (id: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch(`/api/accounting/journals/${id}/reverse`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        fetchCompanyDependents();
      } else {
        const err = await res.json();
        toast.error(err.error || "فشل العكس المحاسبي.");
      }
    } catch (e) {
      toast.error("خطأ.");
    }
  };

  // Helper stats
  const getTotalsByAccountType = (type: string) => {
    return accounts.filter((a) => a.type === type).reduce((sum, a) => sum + (a.balance || 0), 0);
  };

  const activeCompany = companies.find((c) => c.id === activeCompanyId);
  const activeFiscalYear = fiscalYears.find((y) => y.id === activeFiscalYearId);

  // Search filter implementation for Chart of Accounts
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.code.includes(searchQuery) ||
      acc.nameAr.includes(searchQuery) ||
      acc.nameEn.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = accountTypeFilter === "all" || acc.type === accountTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20" dir="rtl">
      {/* 1. DYNAMIC MULTI-COMPANY & MULTI-BRANCH ERP HEADER CONTROL */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto relative z-10">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
            <Scale className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black px-2.5 py-1 rounded-full border border-emerald-500/15 uppercase tracking-wider">
                نظام القيد المزدوج والأستاذ العام
              </span>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-full font-bold">
                Madarij OS
              </span>
            </div>

            {/* Company Selector */}
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-zinc-400" />
              <select
                value={activeCompanyId}
                onChange={(e) => setActiveCompanyId(e.target.value)}
                className="bg-transparent border-none text-lg font-black text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer p-0 select-none"
              >
                {companies.map((c) => (
                  <option
                    key={c.id}
                    value={c.id}
                    className="bg-white dark:bg-zinc-900 text-sm font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    {c.nameAr} ({c.nameEn})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCompanyModal(true)}
                className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-lg transition-all"
                title="إضافة شركة محاسبية جديدة"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CR / VAT Metadata display */}
            {activeCompany && (
              <p className="text-[11px] text-zinc-400 font-bold flex flex-wrap gap-x-4 gap-y-1">
                <span>سجل تجاري: {activeCompany.crNumber || "—"}</span>
                <span>رقم ضريبي ZATCA: {activeCompany.vatNumber || "—"}</span>
                <span>العملة الأساسية: {activeCompany.defaultCurrency}</span>
              </p>
            )}
          </div>
        </div>

        {/* Global Controls & Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto relative z-10">
          {/* Branch Selector */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400">الفرع:</span>
            <select
              value={activeBranchId}
              onChange={(e) => setActiveBranchId(e.target.value)}
              className="bg-transparent border-none p-0 focus:outline-none cursor-pointer"
            >
              <option value="all">كافة الفروع المحاسبية</option>
              {branches.map((br) => (
                <option key={br.id} value={br.id}>
                  {br.nameAr}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowBranchModal(true)}
              className="p-0.5 hover:text-emerald-500"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => fetchCompanies()}
            className="p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-150 dark:border-zinc-850 rounded-xl transition-all shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowJournalForm(true)}
            className="px-5 py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            إدخال قيد يدوي
          </button>
        </div>
      </div>

      {/* 2. TABS CONTROLLER */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 gap-2 overflow-x-auto no-scrollbar pb-px">
        {[
          { id: "accounts", label: "دليل شجرة الحسابات (COA)", icon: FolderTree },
          { id: "journals", label: "دفتر اليومية المساعد", icon: FileText },
          { id: "receivables", label: "حسابات العملاء والمدينين (AR)", icon: UserCheck },
          { id: "payables", label: "حسابات الموردين والدائنين (AP)", icon: Building2 },
          { id: "banking", label: "الخزينة والربط البنكي", icon: Coins },
          { id: "fixed-assets", label: "الأصول الثابتة والإهلاك", icon: Briefcase },
          { id: "budgets", label: "الموازنات التقديرية", icon: PiggyBank },
          { id: "vat-tax", label: "الضرائب وضريبة القيمة المضافة", icon: Percent },
          { id: "copilot", label: "المستشار الذكي (AI Copilot)", icon: Sparkles },
          { id: "periods", label: "الأقفال والفترات المالية", icon: Calendar },
          { id: "trial", label: "ميزان المراجعة اللحظي", icon: ArrowRightLeft },
          { id: "statements", label: "القوائم المالية للشركة", icon: FileSpreadsheet },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-black text-xs transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. MAIN CONTENT MODULES */}
      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mb-4"
          />
          <p className="text-zinc-400 text-xs font-bold">
            جاري تحميل البيانات المالية الموحدة والمدونات...
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {/* TAB 1: CHART OF ACCOUNTS */}
          {activeTab === "accounts" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-accounts"
              className="space-y-6"
            >
              {/* Financial Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    title: "الأصول والممتلكات (Assets)",
                    value: getTotalsByAccountType("Asset"),
                    color: "emerald",
                    icon: Building,
                  },
                  {
                    title: "الخصوم والالتزامات (Liabilities)",
                    value: getTotalsByAccountType("Liability"),
                    color: "amber",
                    icon: Coins,
                  },
                  {
                    title: "حقوق ملكية المساهمين (Equity)",
                    value: getTotalsByAccountType("Equity"),
                    color: "indigo",
                    icon: Layers,
                  },
                  {
                    title: "صافي الربح التقديري (P&L)",
                    value: getTotalsByAccountType("Revenue") - getTotalsByAccountType("Expense"),
                    color: "emerald",
                    icon: TrendingUp,
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-6 rounded-2xl flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <span className="text-[10px] text-zinc-400 font-bold block mb-1">
                        {stat.title}
                      </span>
                      <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                        {stat.value.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}{" "}
                        <span className="text-xs font-bold text-zinc-400">ر.س</span>
                      </span>
                    </div>
                    <div
                      className={`p-3 rounded-xl bg-${stat.color === "emerald" ? "emerald" : stat.color === "amber" ? "amber" : "indigo"}-500/10 text-${stat.color === "emerald" ? "emerald" : stat.color === "amber" ? "amber" : "indigo"}-500 shrink-0`}
                    >
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>

              {/* COA Control Tools */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl shadow-sm">
                <div className="relative w-full md:max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="ابحث برمز الحساب، الاسم العربي، أو الإنجليزي..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl pr-10 pl-4 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                  {/* Seeder dropup */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 text-xs font-black">
                    <span className="text-zinc-400 px-2 font-bold text-[10px]">تهيئة القالب:</span>
                    {["Retail", "Manufacturing", "Professional Services", "Real Estate"].map(
                      (tpl) => (
                        <button
                          key={tpl}
                          onClick={() => handleSeedTemplate(tpl)}
                          className="px-2.5 py-1.5 hover:bg-white dark:hover:bg-zinc-900 rounded-lg transition-all font-black text-[10px] cursor-pointer"
                        >
                          {tpl === "Retail"
                            ? "تجزئة"
                            : tpl === "Manufacturing"
                              ? "صناعي"
                              : tpl === "Professional Services"
                                ? "خدمات"
                                : "عقاري"}
                        </button>
                      )
                    )}
                  </div>

                  <select
                    value={accountTypeFilter}
                    onChange={(e) => setAccountTypeFilter(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none cursor-pointer"
                  >
                    <option value="all">كل التصنيفات</option>
                    <option value="Asset">الأصول (Asset)</option>
                    <option value="Liability">الالتزامات (Liability)</option>
                    <option value="Equity">حقوق الملكية (Equity)</option>
                    <option value="Revenue">الإيرادات (Revenue)</option>
                    <option value="Expense">المصروفات (Expense)</option>
                  </select>

                  <button
                    onClick={() => setShowFXModal(true)}
                    className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Coins className="w-4 h-4" /> إعادة تقييم الصرف
                  </button>

                  <button
                    onClick={() => setShowAccountModal(true)}
                    className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> إضافة حساب دليل
                  </button>
                </div>
              </div>

              {/* Chart Table Render */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-black tracking-wider uppercase">
                      <th className="p-4">كود الحساب</th>
                      <th className="p-4">الاسم (عربي)</th>
                      <th className="p-4">الاسم (En)</th>
                      <th className="p-4">التصنيف</th>
                      <th className="p-4">خصائص وقواعد</th>
                      <th className="p-4 text-left">الرصيد اللحظي</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((acc) => {
                      const isParentNode = acc.postingAllowed === false;
                      return (
                        <tr
                          key={acc.id}
                          className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 text-xs font-semibold ${
                            isParentNode
                              ? "bg-zinc-50/30 font-black text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          <td className="p-4 font-mono font-black">{acc.code}</td>
                          <td className="p-4 flex items-center gap-1.5">
                            {isParentNode ? (
                              <FolderTree className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                            )}
                            <span>{acc.nameAr}</span>
                          </td>
                          <td className="p-4 font-medium text-zinc-400">{acc.nameEn}</td>
                          <td className="p-4">
                            <span
                              className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                acc.type === "Asset"
                                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                  : acc.type === "Liability"
                                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                    : acc.type === "Equity"
                                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400"
                                      : acc.type === "Revenue"
                                        ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                              }`}
                            >
                              {acc.type === "Asset"
                                ? "أصول"
                                : acc.type === "Liability"
                                  ? "خصوم"
                                  : acc.type === "Equity"
                                    ? "حقوق ملكية"
                                    : acc.type === "Revenue"
                                      ? "إيرادات"
                                      : "مصروفات"}
                            </span>
                          </td>
                          <td className="p-4 flex flex-wrap gap-1">
                            {acc.controlAccount && (
                              <span className="text-[9px] bg-red-500/10 text-red-600 px-1.5 py-0.5 rounded">
                                تحكم مالي
                              </span>
                            )}
                            {isParentNode && (
                              <span className="text-[9px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">
                                تجميعي فقط
                              </span>
                            )}
                            {acc.systemAccount && (
                              <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">
                                نظامي
                              </span>
                            )}
                            {acc.currencyRestriction && acc.currencyRestriction !== "SAR" && (
                              <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-mono">
                                {acc.currencyRestriction}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-left font-mono font-black">
                            {acc.balance.toLocaleString("ar-SA", { minimumFractionDigits: 2 })}{" "}
                            <span className="text-[10px] text-zinc-400">ر.س</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 2: JOURNAL ENTRIES */}
          {activeTab === "journals" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-journals"
              className="space-y-6"
            >
              {/* Informational PRD warning */}
              <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 p-5 rounded-2xl flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-emerald-550 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200">
                    التحقق من سلامة الدفاتر المحاسبية (Double-Entry Guard)
                  </h4>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold">
                    لا تتيح منظومة Madarij OS تعديل أو إتلاف أي قيد بعد ترحيله للأستاذ العام حفاظاً
                    على الموثوقية الزكوية والأرشيف المالي. استخدم ميزة **عكس القيد** لتعديل الموازين
                    تلقائياً.
                  </p>
                </div>
              </div>

              {/* Journals List */}
              <div className="space-y-4">
                {journals.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-12 rounded-2xl text-center">
                    <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-400 text-xs font-bold">
                      لا توجد قيود مسجلة للشركة حتى الآن.
                    </p>
                  </div>
                ) : (
                  journals.map((jv) => (
                    <div
                      key={jv.id}
                      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-200 transition-all"
                    >
                      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 bg-zinc-50/40 dark:bg-zinc-950/10">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                          <span className="font-mono font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-lg">
                            {jv.journalNumber}
                          </span>
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                              jv.status === "Posted"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                            }`}
                          >
                            {jv.status === "Posted" ? "مرحل" : "مسودة مؤقتة"}
                          </span>
                          <span className="text-zinc-400 font-bold">{jv.date}</span>
                          {jv.intercompany && (
                            <span className="bg-indigo-100 text-indigo-700 text-[9px] px-2 py-0.5 rounded font-bold">
                              عملية بينية (Intercompany)
                            </span>
                          )}
                          {jv.currency !== "SAR" && (
                            <span className="bg-amber-100 text-amber-700 text-[9px] px-2 py-0.5 rounded font-mono font-bold">
                              {jv.currency} @ {jv.exchangeRate}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {jv.status === "Draft" && (
                            <button
                              onClick={() => handlePostJournal(jv.id!)}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer"
                            >
                              ترحيل الآن
                            </button>
                          )}
                          {jv.status === "Posted" && !jv.reversed && (
                            <button
                              onClick={() => handleReverseJournal(jv.id!)}
                              className="px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 rounded-lg text-xs font-black transition-all cursor-pointer"
                            >
                              إجراء تسوية عكسية (Reverse)
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-3 text-xs">
                        <p className="font-bold text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400">البيان العام:</span>{" "}
                          {jv.description || "لا يوجد بيان"}
                        </p>

                        <div className="border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                          <table className="w-full text-right text-xs">
                            <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                              <tr>
                                <th className="p-3">الحساب المالي</th>
                                <th className="p-3">البيان الفرعي</th>
                                <th className="p-3">الأبعاد والمشروع</th>
                                <th className="p-3 text-left">مدين (Dr)</th>
                                <th className="p-3 text-left">دائن (Cr)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jv.lines.map((l, lIdx) => (
                                <tr
                                  key={lIdx}
                                  className="border-b border-zinc-50 dark:border-zinc-850"
                                >
                                  <td className="p-3 font-bold">
                                    {l.accountName}{" "}
                                    <span className="font-mono text-zinc-400 font-medium block text-[10px]">
                                      {l.accountCode}
                                    </span>
                                  </td>
                                  <td className="p-3 text-zinc-500 font-medium">
                                    {l.description || "—"}
                                  </td>
                                  <td className="p-3 text-zinc-400 font-bold">
                                    {l.branch} {l.costCenter && `| ${l.costCenter}`}{" "}
                                    {l.project && `| ${l.project}`}
                                  </td>
                                  <td className="p-3 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                                    {l.debit > 0
                                      ? `${l.debit.toLocaleString()} ${jv.currency}`
                                      : "—"}
                                  </td>
                                  <td className="p-3 text-left font-mono font-black text-rose-600 dark:text-rose-400">
                                    {l.credit > 0
                                      ? `${l.credit.toLocaleString()} ${jv.currency}`
                                      : "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 3: FISCAL PERIODS & LOCKS */}
          {activeTab === "periods" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-periods"
              className="space-y-6"
            >
              {/* Year Selector and Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-2xl shadow-sm">
                <div className="space-y-1">
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    سجل الفترات المحاسبية والأقفال الدورية
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    قفل دفاتر اليومية والأستاذ العام للشهور والفترات لمنع إدخال المعاملات السابقة
                    والمستقبلية
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                  <select
                    value={activeFiscalYearId}
                    onChange={(e) => setActiveFiscalYearId(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-black focus:outline-none cursor-pointer"
                  >
                    {fiscalYears.map((fy) => (
                      <option key={fy.id} value={fy.id}>
                        {fy.name}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => setShowFiscalYearModal(true)}
                    className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> سنة مالية جديدة
                  </button>
                </div>
              </div>

              {/* Render periods card list */}
              {activeFiscalYear ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {activeFiscalYear.periods.map((p) => {
                    const completedTasks = p.checklist?.filter((c) => c.completed).length || 0;
                    const totalTasks = p.checklist?.length || 0;
                    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                    return (
                      <div
                        key={p.id}
                        className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm space-y-4"
                      >
                        <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-800 pb-3">
                          <div>
                            <span className="text-xs font-mono font-black text-zinc-850 dark:text-zinc-150 block">
                              {p.name}
                            </span>
                            <span className="text-[9px] text-zinc-400 font-bold block mt-0.5">
                              من {p.startDate} إلى {p.endDate}
                            </span>
                          </div>

                          <button
                            onClick={() => handleLockPeriod(p.id, p.status, p.checklist)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                              p.status === "Open"
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : p.status === "Soft Locked"
                                  ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                  : p.status === "Hard Locked"
                                    ? "bg-red-50 text-red-700 hover:bg-red-100"
                                    : "bg-zinc-150 text-zinc-700 hover:bg-zinc-200"
                            }`}
                          >
                            {p.status === "Open"
                              ? "مفتوح"
                              : p.status === "Soft Locked"
                                ? "قفل مرن"
                                : p.status === "Hard Locked"
                                  ? "قفل صلب"
                                  : "مغلق نهائياً"}
                          </button>
                        </div>

                        {/* Checklist progress bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] text-zinc-400 font-bold">
                            <span>قائمة تدقيق الإغلاق الشهري:</span>
                            <span>
                              {completedTasks} / {totalTasks}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                        </div>

                        {/* Interactive checklist list */}
                        <div className="space-y-2 text-[11px] font-bold">
                          {p.checklist?.map((task, idx) => (
                            <label
                              key={idx}
                              className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 cursor-pointer hover:text-zinc-800 dark:hover:text-zinc-200"
                            >
                              <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleChecklistItem(p.id, idx)}
                                className="mt-0.5 rounded border-zinc-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span>{task.task}</span>
                            </label>
                          ))}
                        </div>

                        {/* Lock audit trial */}
                        {p.lockedBy && (
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[8px] text-zinc-400 font-bold flex flex-wrap gap-2 justify-between">
                            <span>بواسطة: {p.lockedBy}</span>
                            <span>تاريخ: {p.lockedAt?.slice(0, 16)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center text-zinc-400 text-xs font-bold">
                  يرجى تهيئة سنة مالية للشركة المحاسبية.
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: TRIAL BALANCE */}
          {activeTab === "trial" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-trial"
              className="space-y-6"
            >
              {trialBalanceData && (
                <>
                  <div
                    className={`p-6 rounded-2xl border flex items-center justify-between gap-6 ${
                      trialBalanceData.isBalanced
                        ? "bg-emerald-50/40 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50"
                        : "bg-amber-50/40 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {trialBalanceData.isBalanced ? (
                        <CheckCircle2 className="w-10 h-10 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-10 h-10 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-200">
                          {trialBalanceData.isBalanced
                            ? "ميزان المراجعة متزن ومطابق!"
                            : "ميزان المراجعة غير متزن!"}
                        </h4>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed font-bold">
                          {trialBalanceData.isBalanced
                            ? "تتطابق المدونات في دفتر الأستاذ العام مع المدين والدائن تماماً وفقاً للقيد المزدوج."
                            : "يرجى التحقق من مسودات القيود المفتوحة أو الحسابات غير المعرفة لتعديل الفرق الإجمالي."}
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono font-black text-sm shrink-0">
                      <div>إجمالي مدين: {trialBalanceData.totalNetDebit.toLocaleString()} ر.س</div>
                      <div className="mt-1">
                        إجمالي دائن: {trialBalanceData.totalNetCredit.toLocaleString()} ر.س
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                          <th className="p-4">كود الحساب</th>
                          <th className="p-4">اسم الحساب</th>
                          <th className="p-4">النوع</th>
                          <th className="p-4 text-left">مدين (Dr)</th>
                          <th className="p-4 text-left">دائن (Cr)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {trialBalanceData.rows.map((row: any) => (
                          <tr
                            key={row.accountId}
                            className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50/50"
                          >
                            <td className="p-4 font-mono font-black">{row.code}</td>
                            <td className="p-4 font-bold">{row.nameAr}</td>
                            <td className="p-4 text-zinc-400">
                              {row.type === "Asset"
                                ? "أصول"
                                : row.type === "Liability"
                                  ? "خصوم"
                                  : row.type === "Equity"
                                    ? "حقوق ملكية"
                                    : row.type === "Revenue"
                                      ? "إيراد"
                                      : "مصروف"}
                            </td>
                            <td className="p-4 text-left font-mono font-black text-emerald-600 dark:text-emerald-400">
                              {row.netDebit > 0 ? `${row.netDebit.toLocaleString()} ر.س` : "—"}
                            </td>
                            <td className="p-4 text-left font-mono font-black text-rose-600 dark:text-rose-400">
                              {row.netCredit > 0 ? `${row.netCredit.toLocaleString()} ر.س` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* TAB 5: FINANCIAL STATEMENTS */}
          {activeTab === "statements" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-statements"
              className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-bold"
            >
              {/* Balance Sheet (الميزانية العمومية) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-[2rem] shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    الميزانية العمومية اللحظية (Balance Sheet)
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    الوضعية المالية للمنشأة - الأصول مقابل الالتزامات وحقوق المساهمين
                  </p>
                </div>

                {balanceSheetData && (
                  <div className="space-y-4">
                    {/* Assets section */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        الأصول والممتلكات (Assets)
                      </div>
                      {balanceSheetData.assets.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex justify-between border-b border-zinc-50 dark:border-zinc-850 pb-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{acc.nameAr}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">
                            {acc.balance.toLocaleString()} ر.س
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-emerald-600 dark:text-emerald-400 pt-1">
                        <span>إجمالي الأصول والموجودات</span>
                        <span className="font-mono">
                          {balanceSheetData.totalAssets.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Liabilities section */}
                    <div className="space-y-2 pt-4">
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        الخصوم والالتزامات (Liabilities)
                      </div>
                      {balanceSheetData.liabilities.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex justify-between border-b border-zinc-50 dark:border-zinc-850 pb-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{acc.nameAr}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">
                            {acc.balance.toLocaleString()} ر.س
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-zinc-800 dark:text-zinc-200 pt-1">
                        <span>إجمالي الالتزامات المتداولة</span>
                        <span className="font-mono">
                          {balanceSheetData.totalLiabilities.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Equity section */}
                    <div className="space-y-2 pt-4">
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        حقوق ملكية المساهمين (Equity)
                      </div>
                      {balanceSheetData.equity.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex justify-between border-b border-zinc-50 dark:border-zinc-850 pb-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{acc.nameAr}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">
                            {acc.balance.toLocaleString()} ر.س
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-zinc-800 dark:text-zinc-200 pt-1">
                        <span>إجمالي حقوق الملكية</span>
                        <span className="font-mono">
                          {balanceSheetData.totalEquity.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Match total proof */}
                    <div className="pt-4 border-t-2 border-zinc-100 dark:border-zinc-800 flex justify-between font-black text-sm text-indigo-650 dark:text-indigo-400">
                      <span>إجمالي الالتزامات وحقوق الملكية</span>
                      <span className="font-mono">
                        {balanceSheetData.totalLiabilitiesAndEquity.toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Income Statement (قائمة الدخل) */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-6 rounded-[2rem] shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    قائمة الدخل والأرباح والخسائر (Income Statement)
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    التشغيل المالي - الإيرادات التشغيلية مطروحاً منها كافة المصروفات
                  </p>
                </div>

                {incomeStatementData && (
                  <div className="space-y-4">
                    {/* Revenues */}
                    <div className="space-y-2">
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        المبيعات والإيرادات التشغيلية (Revenues)
                      </div>
                      {incomeStatementData.revenues.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex justify-between border-b border-zinc-50 dark:border-zinc-850 pb-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{acc.nameAr}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">
                            {acc.balance.toLocaleString()} ر.س
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-emerald-600 dark:text-emerald-400 pt-1">
                        <span>إجمالي الإيرادات المكتسبة</span>
                        <span className="font-mono">
                          {incomeStatementData.totalRevenues.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Expenses */}
                    <div className="space-y-2 pt-4">
                      <div className="text-[10px] text-zinc-400 font-black uppercase tracking-wider">
                        تكلفة التشغيل والمصروفات الإدارية (Expenses)
                      </div>
                      {incomeStatementData.expenses.map((acc: any) => (
                        <div
                          key={acc.id}
                          className="flex justify-between border-b border-zinc-50 dark:border-zinc-850 pb-2"
                        >
                          <span className="text-zinc-700 dark:text-zinc-300">{acc.nameAr}</span>
                          <span className="font-mono text-zinc-900 dark:text-zinc-100">
                            {acc.balance.toLocaleString()} ر.س
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between font-black text-rose-600 dark:text-rose-400 pt-1">
                        <span>إجمالي كلفة النشاط والمصروفات</span>
                        <span className="font-mono">
                          {incomeStatementData.totalExpenses.toLocaleString()} ر.س
                        </span>
                      </div>
                    </div>

                    {/* Net profit proof */}
                    <div className="pt-6 border-t-2 border-zinc-150 dark:border-zinc-850 flex justify-between font-black text-sm text-indigo-650 dark:text-indigo-400">
                      <span>صافي الربح / الخسارة النهائي (Net Profit)</span>
                      <span className="font-mono">
                        {incomeStatementData.netProfit.toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: RECEIVABLES */}
          {activeTab === "receivables" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-receivables"
            >
              <ReceivablesTab accounts={accounts} activeBranchId={activeBranchId} />
            </motion.div>
          )}

          {/* TAB: PAYABLES */}
          {activeTab === "payables" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-payables"
            >
              <PayablesTab accounts={accounts} activeBranchId={activeBranchId} />
            </motion.div>
          )}

          {/* TAB: BANKING */}
          {activeTab === "banking" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-banking"
            >
              <BankingTab />
            </motion.div>
          )}

          {/* TAB: FIXED ASSETS */}
          {activeTab === "fixed-assets" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-fixed-assets"
            >
              <FixedAssetsTab
                onPostJournal={(newJr) => {
                  const created: Journal = {
                    id: "jr-auto-" + Date.now(),
                    journalNumber: `JV-AUTO-${journals.length + 101}`,
                    date: new Date().toISOString().split("T")[0],
                    description: newJr.description,
                    status: "Posted",
                    currency: "SAR",
                    exchangeRate: 1,
                    lines: newJr.lines.map((line: any) => ({
                      accountId: "auto-id",
                      accountCode: line.accountCode,
                      accountName: line.accountName,
                      debit: line.debit,
                      credit: line.credit,
                      description: newJr.description,
                      costCenter: "HQ",
                      branch: activeBranchId !== "all" ? activeBranchId : "HQ-Branch",
                      project: "General",
                    })),
                    totalDebits: newJr.lines.reduce((sum: number, l: any) => sum + l.debit, 0),
                    totalCredits: newJr.lines.reduce((sum: number, l: any) => sum + l.credit, 0),
                  };
                  setJournals([created, ...journals]);
                  toast.success("تم ترحيل قيد الإهلاك بنجاح للأستاذ العام");
                }}
              />
            </motion.div>
          )}

          {/* TAB: BUDGETS */}
          {activeTab === "budgets" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-budgets"
            >
              <BudgetsTab />
            </motion.div>
          )}

          {/* TAB: VAT TAX */}
          {activeTab === "vat-tax" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-vat-tax"
            >
              <VatTaxTab />
            </motion.div>
          )}

          {/* TAB: COPILOT */}
          {activeTab === "copilot" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              key="tab-copilot"
            >
              <CopilotTab
                accounts={accounts}
                onPostJournal={(newJr) => {
                  const created: Journal = {
                    id: "jr-copilot-" + Date.now(),
                    journalNumber: `JV-AI-${journals.length + 101}`,
                    date: new Date().toISOString().split("T")[0],
                    description: newJr.description,
                    status: "Posted",
                    currency: "SAR",
                    exchangeRate: 1,
                    lines: newJr.lines.map((line: any) => ({
                      accountId: "auto-id",
                      accountCode: line.accountCode,
                      accountName: line.name,
                      debit: line.debit,
                      credit: line.credit,
                      description: newJr.description,
                      costCenter: "HQ",
                      branch: activeBranchId !== "all" ? activeBranchId : "HQ-Branch",
                      project: "General",
                    })),
                    totalDebits: newJr.lines.reduce((sum: number, l: any) => sum + l.debit, 0),
                    totalCredits: newJr.lines.reduce((sum: number, l: any) => sum + l.credit, 0),
                  };
                  setJournals([created, ...journals]);
                  toast.success("تم تسجيل ترحيل القيد الذكي الموصى به");
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* ==========================================
          MODALS PANEL FOR ALL ERP FUNCTIONS
         ========================================== */}

      {/* MODAL 1: ADD COMPANY */}
      <AnimatePresence>
        {showCompanyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                تسجيل منشأة / شركة محاسبية جديدة
              </h3>
              <form
                onSubmit={handleAddCompany}
                className="space-y-3.5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <div className="space-y-1.5">
                  <label>الاسم الرسمي (بالعربي)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: شركة مدارج اللوجستية"
                    value={newCompany.nameAr}
                    onChange={(e) => setNewCompany((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>الاسم الرسمي (En)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Madarij Logistics Co."
                    value={newCompany.nameEn}
                    onChange={(e) => setNewCompany((prev) => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label>السجل التجاري (CR)</label>
                    <input
                      type="text"
                      placeholder="1010XXXXXX"
                      value={newCompany.crNumber}
                      onChange={(e) =>
                        setNewCompany((prev) => ({ ...prev, crNumber: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label>الرقم الضريبي VAT</label>
                    <input
                      type="text"
                      placeholder="3000XXXXXXXX"
                      value={newCompany.vatNumber}
                      onChange={(e) =>
                        setNewCompany((prev) => ({ ...prev, vatNumber: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label>تصنيف ونوع المنشأة</label>
                  <select
                    value={newCompany.type}
                    onChange={(e) =>
                      setNewCompany((prev) => ({ ...prev, type: e.target.value as any }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                  >
                    <option value="Independent">مستقلة بذاتها (Independent)</option>
                    <option value="Holding">مجموعة / قابضة (Holding Group)</option>
                    <option value="Subsidiary">تابعة لكيان (Subsidiary)</option>
                    <option value="Sister">شقيقة لمجموعة (Sister Company)</option>
                  </select>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black"
                  >
                    حفظ المنشأة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ADD BRANCH */}
      <AnimatePresence>
        {showBranchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                إضافة فرع تشغيلي مالي جديد
              </h3>
              <form
                onSubmit={handleAddBranch}
                className="space-y-3.5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <div className="space-y-1.5">
                  <label>اسم الفرع (بالعربي)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: فرع المنطقة الغربية - جدة"
                    value={newBranch.nameAr}
                    onChange={(e) => setNewBranch((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>اسم الفرع (En)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Western Region Branch"
                    value={newBranch.nameEn}
                    onChange={(e) => setNewBranch((prev) => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>كود الفرع</label>
                  <input
                    type="text"
                    required
                    placeholder="BR-02"
                    value={newBranch.code}
                    onChange={(e) => setNewBranch((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black"
                  >
                    حفظ الفرع
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBranchModal(false)}
                    className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ADD FISCAL YEAR */}
      <AnimatePresence>
        {showFiscalYearModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                إنشاء سنة مالية جديدة
              </h3>
              <form
                onSubmit={handleAddFiscalYear}
                className="space-y-3.5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <div className="space-y-1.5">
                  <label>اسم السنة المالية</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: السنة المالية 2026"
                    value={newFiscalYear.name}
                    onChange={(e) =>
                      setNewFiscalYear((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label>تاريخ البدء</label>
                    <input
                      type="date"
                      required
                      value={newFiscalYear.startDate}
                      onChange={(e) =>
                        setNewFiscalYear((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label>تاريخ الانتهاء</label>
                    <input
                      type="date"
                      required
                      value={newFiscalYear.endDate}
                      onChange={(e) =>
                        setNewFiscalYear((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black"
                  >
                    حفظ وإطلاق الـ 12 فترة
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFiscalYearModal(false)}
                    className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: ADD CUSTOM COA ACCOUNT */}
      <AnimatePresence>
        {showAccountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-md w-full border border-zinc-150 p-6 space-y-4 text-right"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                إضافة حساب مالي لشجرة دليل الشركة
              </h3>
              <form
                onSubmit={handleAddAccount}
                className="space-y-3.5 text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                <div className="space-y-1.5">
                  <label>رمز / كود الحساب الفريد</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 101005"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount((prev) => ({ ...prev, code: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>اسم الحساب (عربي)</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: ذمم عملاء التوصيل السريع"
                    value={newAccount.nameAr}
                    onChange={(e) => setNewAccount((prev) => ({ ...prev, nameAr: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label>اسم الحساب (En)</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Delivery Receivables"
                    value={newAccount.nameEn}
                    onChange={(e) => setNewAccount((prev) => ({ ...prev, nameEn: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label>نوع الحساب الرئيسي</label>
                    <select
                      value={newAccount.type}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, type: e.target.value as any }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                    >
                      <option value="Asset">أصول (Asset)</option>
                      <option value="Liability">خصوم (Liability)</option>
                      <option value="Equity">حقوق ملكية (Equity)</option>
                      <option value="Revenue">إيرادات (Revenue)</option>
                      <option value="Expense">مصروفات (Expense)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label>الكود الأب (أعلى منه في التسلسل)</label>
                    <input
                      type="text"
                      placeholder="اختياري (مثال: 101000)"
                      value={newAccount.parent}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, parent: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAccount.postingAllowed}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, postingAllowed: e.target.checked }))
                      }
                      className="rounded border-zinc-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>السماح بالترشيح والترحيل اللحظي للحساب</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAccount.controlAccount}
                      onChange={(e) =>
                        setNewAccount((prev) => ({ ...prev, controlAccount: e.target.checked }))
                      }
                      className="rounded border-zinc-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>حساب رقابة وتحكم نظامي (Control Account)</span>
                  </label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl font-black"
                  >
                    حفظ الحساب
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAccountModal(false)}
                    className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: CREATE JOURNAL ENTRY FORM */}
      <AnimatePresence>
        {showJournalForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-5xl w-full border border-zinc-150 p-6 space-y-6 text-right max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                      إنشاء قيد محاسبي يدوي مزدوج (Double-Entry Form)
                    </h3>
                    <p className="text-[10px] text-zinc-400 font-bold">
                      تسجيل حركات الأصول والخصوم والالتزامات مع التحقق من توازن الأستاذ العام
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowJournalForm(false)}
                  className="p-1 rounded-md hover:bg-zinc-150 text-zinc-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <div className="space-y-1.5">
                  <label>تاريخ القيد</label>
                  <input
                    type="date"
                    required
                    value={journalForm.date}
                    onChange={(e) => setJournalForm((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label>عملة المعاملة</label>
                  <select
                    value={journalForm.currency}
                    onChange={(e) => {
                      const selCurr = e.target.value;
                      const activeRate =
                        exchangeRates.find((r) => r.currencyCode === selCurr)?.rate || 1;
                      setJournalForm((prev) => ({
                        ...prev,
                        currency: selCurr,
                        exchangeRate: activeRate,
                      }));
                    }}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                  >
                    {exchangeRates.map((r) => (
                      <option key={r.currencyCode} value={r.currencyCode}>
                        {r.currencyCode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label>معدل الصرف مقابل الريال السعودي</label>
                  <input
                    type="number"
                    step="0.001"
                    value={journalForm.exchangeRate}
                    onChange={(e) =>
                      setJournalForm((prev) => ({
                        ...prev,
                        exchangeRate: parseFloat(e.target.value) || 1,
                      }))
                    }
                    disabled={journalForm.currency === "SAR"}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none disabled:bg-zinc-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={journalForm.intercompany}
                      onChange={(e) =>
                        setJournalForm((prev) => ({ ...prev, intercompany: e.target.checked }))
                      }
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>عملية بينية مع شركة شقيقة</span>
                  </label>
                  {journalForm.intercompany && (
                    <select
                      value={journalForm.destinationCompanyId || ""}
                      onChange={(e) =>
                        setJournalForm((prev) => ({
                          ...prev,
                          destinationCompanyId: e.target.value,
                        }))
                      }
                      className="w-full mt-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 focus:outline-none cursor-pointer"
                    >
                      <option value="">اختر الشركة المقابلة...</option>
                      {companies
                        .filter((c) => c.id !== activeCompanyId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameAr}
                          </option>
                        ))}
                    </select>
                  )}
                </div>

                <div className="space-y-1.5 md:col-span-4">
                  <label>الوصف العام / البيان (Memo)</label>
                  <input
                    type="text"
                    placeholder="مثال: إثبات فاتورة ومشتريات الأصول برقم..."
                    value={journalForm.description}
                    onChange={(e) =>
                      setJournalForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                  />
                </div>
              </div>

              {/* Lines Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                    تفاصيل أسطر القيد المحاسبي
                  </h4>
                  <button
                    type="button"
                    onClick={addJournalLine}
                    className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> إضافة سطر جديد
                  </button>
                </div>

                <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden max-h-[40vh] overflow-y-auto">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                      <tr>
                        <th className="p-3 w-1/4">الحساب المالي</th>
                        <th className="p-3">مدين (Debit)</th>
                        <th className="p-3">دائن (Credit)</th>
                        <th className="p-3">البيان الفرعي</th>
                        <th className="p-3">مركز التكلفة / المشروع</th>
                        <th className="p-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody>
                      {journalForm.lines.map((line, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
                        >
                          <td className="p-3">
                            <select
                              required
                              value={line.accountId}
                              onChange={(e) => handleLineChange(idx, "accountId", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-2.5 py-2.5 focus:outline-none cursor-pointer font-bold"
                            >
                              <option value="">اختر الحساب...</option>
                              {accounts
                                .filter((a) => a.postingAllowed !== false)
                                .map((a) => (
                                  <option key={a.id} value={a.id}>
                                    {a.code} — {a.nameAr}
                                  </option>
                                ))}
                            </select>
                          </td>

                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={line.debit || ""}
                              onChange={(e) => handleLineChange(idx, "debit", e.target.value)}
                              className="w-28 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none font-mono text-left text-emerald-600 font-black"
                            />
                          </td>

                          <td className="p-3">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={line.credit || ""}
                              onChange={(e) => handleLineChange(idx, "credit", e.target.value)}
                              className="w-28 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none font-mono text-left text-rose-600 font-black"
                            />
                          </td>

                          <td className="p-3">
                            <input
                              type="text"
                              placeholder="وصف اختياري..."
                              value={line.description}
                              onChange={(e) => handleLineChange(idx, "description", e.target.value)}
                              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-3 py-2.5 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 flex gap-2">
                            <input
                              type="text"
                              placeholder="مركز تكلفة..."
                              value={line.costCenter}
                              onChange={(e) => handleLineChange(idx, "costCenter", e.target.value)}
                              className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-2 py-2.5 focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="المشروع..."
                              value={line.project}
                              onChange={(e) => handleLineChange(idx, "project", e.target.value)}
                              className="w-24 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-2 py-2.5 focus:outline-none"
                            />
                          </td>

                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => removeJournalLine(idx)}
                              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50"
                            >
                              <XCircle className="w-4.5 h-4.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Bottom Totals and Symmetry Validation */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-3 text-xs">
                  {Math.abs(journalForm.totalDebits - journalForm.totalCredits) < 0.01 &&
                  journalForm.totalDebits > 0 ? (
                    <div className="flex items-center gap-2 text-emerald-600 font-black">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>القيد متزن! إجمالي المدين والدائن متطابقان تماماً.</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-600 font-black">
                      <AlertCircle className="w-5 h-5 animate-pulse" />
                      <span>
                        القيد غير متزن! الفرق:{" "}
                        {(journalForm.totalDebits - journalForm.totalCredits).toFixed(2)}{" "}
                        {journalForm.currency}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6 font-mono font-black text-sm text-zinc-800 dark:text-zinc-200">
                  <div className="text-left">
                    <span className="text-[10px] text-zinc-400 font-bold block mb-0.5">
                      مجموع المدين (Dr)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400">
                      {journalForm.totalDebits.toLocaleString()} {journalForm.currency}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="text-left">
                    <span className="text-[10px] text-zinc-400 font-bold block mb-0.5">
                      مجموع الدائن (Cr)
                    </span>
                    <span className="text-rose-600 dark:text-rose-400">
                      {journalForm.totalCredits.toLocaleString()} {journalForm.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => handleSaveJournal("Posted")}
                  className="flex-1 py-3.5 bg-emerald-650 hover:bg-emerald-700 text-white font-black rounded-xl transition-all shadow-lg cursor-pointer"
                >
                  ترحيل القيد اللحظي للأستاذ العام (Post Ledger)
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveJournal("Draft")}
                  className="px-6 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black rounded-xl transition-all cursor-pointer"
                >
                  حفظ كمسودة (Save Draft)
                </button>
                <button
                  type="button"
                  onClick={() => setShowJournalForm(false)}
                  className="px-6 py-3.5 bg-zinc-50 border border-zinc-200 text-zinc-650 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 6: FX SPOT RATE & BALANCE REVALUATIONS */}
      <AnimatePresence>
        {showFXModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl max-w-lg w-full border border-zinc-150 p-6 space-y-4 text-right"
            >
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  إعادة تقييم النقدية والعملات الأجنبية (FX Revaluation)
                </h3>
                <p className="text-[10px] text-zinc-400 font-bold">
                  تعديل أرصدة الحسابات الأجنبية بالأسعار السائدة وتوليد قيد الفروقات تلقائياً
                </p>
              </div>

              <div className="space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label>العملة المطلوب إعادة تقييمها</label>
                    <select
                      value={fxRevalue.currencyCode}
                      onChange={(e) =>
                        setFxRevalue((prev) => ({ ...prev, currencyCode: e.target.value }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none cursor-pointer"
                    >
                      <option value="USD">USD (الدولار الأمريكي)</option>
                      <option value="EUR">EUR (اليورو الأوروبي)</option>
                      <option value="AED">AED (الدرهم الإماراتي)</option>
                      <option value="KWD">KWD (الدينار الكويتي)</option>
                      <option value="BHD">BHD (الدينار البحريني)</option>
                      <option value="GBP">GBP (الجنيه الإسترليني)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label>سعر الصرف الفوري الجديد مقابل SAR</label>
                    <input
                      type="number"
                      step="0.001"
                      value={fxRevalue.rate}
                      onChange={(e) =>
                        setFxRevalue((prev) => ({
                          ...prev,
                          rate: parseFloat(e.target.value) || 1.0,
                        }))
                      }
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label>اختر حسابات العملة الأجنبية المعنية بالتسوية</label>
                  <div className="border border-zinc-100 dark:border-zinc-850 p-3 rounded-xl max-h-40 overflow-y-auto space-y-2">
                    {accounts
                      .filter((a) => a.postingAllowed !== false)
                      .map((a) => (
                        <label key={a.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={fxRevalue.selectedAccountIds.includes(a.id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setFxRevalue((prev) => ({
                                ...prev,
                                selectedAccountIds: checked
                                  ? [...prev.selectedAccountIds, a.id]
                                  : prev.selectedAccountIds.filter((id) => id !== a.id),
                              }));
                            }}
                            className="rounded border-zinc-300 dark:border-zinc-800 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span>
                            {a.code} — {a.nameAr} ({a.balance.toLocaleString()} ر.س)
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    onClick={handleFXRevaluation}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl font-black transition-colors"
                  >
                    تشغيل محرك احتساب فروق العملة
                  </button>
                  <button
                    onClick={() => setShowFXModal(false)}
                    className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
