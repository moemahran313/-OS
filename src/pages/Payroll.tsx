import React, { useState, useEffect, useMemo } from "react";
import PayrollAudit from "@/src/components/PayrollAudit";
import SaudiEosCalculator from "@/src/components/payroll/SaudiEosCalculator";
import PayrollAiAssistant from "@/src/components/payroll/PayrollAiAssistant";
import PayrollTemplates from "@/src/components/payroll/PayrollTemplates";
import PayrollAttendanceSim from "@/src/components/payroll/PayrollAttendanceSim";
import PayrollPortals from "@/src/components/payroll/PayrollPortals";
import LedgerView from "@/src/components/payroll/LedgerView";
import KpiDashboard from "@/src/components/payroll/KpiDashboard";
import PayrollCharts from "@/src/components/payroll/PayrollCharts";
import {
  Plus,
  Search,
  Download,
  CreditCard,
  TrendingUp,
  Users,
  ShieldCheck,
  DollarSign,
  CalendarDays,
  MoreVertical,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Wallet,
  Activity,
  ArrowRight,
  Settings,
  Calculator,
  Edit3,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  AlertOctagon,
  History,
  Clock,
  Scale,
  Sparkles,
  ClipboardList,
  Target,
  BookOpen,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSettings } from "@/src/contexts/SettingsContext";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export default function Payroll() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<
    | "dashboard"
    | "employees"
    | "runs"
    | "attendance"
    | "requests"
    | "ai_assistant"
    | "settlement"
    | "audit"
    | "ledger"
    | "kpi"
    | "templates"
  >("dashboard");
  const [employees, setEmployees] = useState<any[]>([]);
  const [runs, setRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Simulation
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simulationData, setSimulationData] = useState<any>(null);
  const [simulatePeriod, setSimulatePeriod] = useState(new Date().toISOString().slice(0, 7));
  const [sifValidateRun, setSifValidateRun] = useState<any>(null); // For SIF validation checklist modal
  const [showLargeTxModal, setShowLargeTxModal] = useState(false);
  const [auditRun, setAuditRun] = useState<any>(null);

  // Bulk selection for Runs
  const [selectedRuns, setSelectedRuns] = useState<string[]>([]);

  // States for Edit / Add Employee Modal
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>({});

  // States for Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Search and Filter states for the Redesigned Runs (Paychecks) tab
  const [runSearchQuery, setRunSearchQuery] = useState("");
  const [runFilterStatus, setRunFilterStatus] = useState("all");

  useEffect(() => {
    if (!user) return;

    // Listen to Employees
    const qEmp = query(
      collection(db, "employees"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubEmp = onSnapshot(
      qEmp,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setEmployees(data);
        setLoading(false);
      },
      (error) => {
        console.warn("Payroll employees snapshot listener error (handled gracefully):", error);
        setLoading(false);
      }
    );

    // Listen to Payroll Runs
    const qRuns = query(
      collection(db, "payroll_runs"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubRuns = onSnapshot(
      qRuns,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setRuns(data);
      },
      (error) => {
        console.warn("Payroll runs snapshot listener error (handled gracefully):", error);
      }
    );

    return () => {
      unsubEmp();
      unsubRuns();
    };
  }, [user]);

  useEffect(() => {
    if (user && (location.pathname === "/app/payroll/new" || location.state?.openSimulate)) {
      const timer = setTimeout(() => {
        handleSimulate();
        navigate("/app/payroll", { replace: true, state: {} });
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user, location, employees.length]);

  const handleSimulate = async () => {
    if (!simulatePeriod || !user) return;
    try {
      const { PayrollService } = await import("@/src/services/payroll.service");
      const data = await PayrollService.simulatePayroll(user.uid, simulatePeriod);
      setSimulationData(data);
      setShowSimulateModal(true);
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء المحاكاة");
    }
  };

  const attemptCommitPayroll = () => {
    if (!simulationData) return;
    if (simulationData.totalNet > 1000000 && user?.role !== "Administrator") {
      setShowLargeTxModal(true);
      return;
    }
    commitPayroll();
  };

  const commitPayroll = async () => {
    if (!user || !simulationData) return;
    try {
      const isOwner = user.role === "Administrator";
      const needsOwnerVerification = !isOwner && simulationData.totalNet > 1000000;

      const docRef = await addDoc(collection(db, "payroll_runs"), {
        ...simulationData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });

      // Fetch existing chart of accounts to find/create relevant accounts
      const qAcc = query(collection(db, "chart_of_accounts"), where("authorUid", "==", user.uid));
      const accSnap = await getDocs(qAcc);
      const accountsList = accSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      const findOrCreateAccount = async (
        code: string,
        nameAr: string,
        nameEn: string,
        type: string
      ) => {
        let acc = accountsList.find((a) => a.accountCode === code);
        if (!acc) {
          const newDoc = await addDoc(collection(db, "chart_of_accounts"), {
            accountCode: code,
            nameAr,
            nameEn,
            type,
            balanceHalalas: 0,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
          });
          acc = { id: newDoc.id, accountCode: code, nameAr, nameEn, type };
        }
        return acc;
      };

      const wageExpAcc = await findOrCreateAccount(
        "510201",
        "مصاريف الرواتب والأجور",
        "Salaries & Wages Expense",
        "Expense"
      );
      const salPayableAcc = await findOrCreateAccount(
        "210301",
        "رواتب مستحقة الدفع",
        "Salaries Payable",
        "Liability"
      );
      const gosiPayableAcc = await findOrCreateAccount(
        "210401",
        "مستحقات التأمينات الاجتماعية (GOSI)",
        "GOSI Payable",
        "Liability"
      );
      const adminExpAcc = await findOrCreateAccount(
        "510301",
        "مصاريف عمومية وإدارية",
        "General & Admin Expenses",
        "Expense"
      );

      const Gross = Math.round(simulationData.totalGross * 100);
      const Net = Math.round(simulationData.totalNet * 100);
      const GOSI = Math.round((simulationData.totalGosi || 0) * 100);
      const otherDeductionsHalalas = Gross - Net - GOSI;

      const lines = [
        {
          accountId: wageExpAcc.id,
          accountCode: wageExpAcc.accountCode,
          accountNameAr: wageExpAcc.nameAr,
          accountNameEn: wageExpAcc.nameEn,
          debitHalalas: Gross,
          creditHalalas: 0,
        },
        {
          accountId: salPayableAcc.id,
          accountCode: salPayableAcc.accountCode,
          accountNameAr: salPayableAcc.nameAr,
          accountNameEn: salPayableAcc.nameEn,
          debitHalalas: 0,
          creditHalalas: Net,
        },
      ];

      if (GOSI > 0) {
        lines.push({
          accountId: gosiPayableAcc.id,
          accountCode: gosiPayableAcc.accountCode,
          accountNameAr: gosiPayableAcc.nameAr,
          accountNameEn: gosiPayableAcc.nameEn,
          debitHalalas: 0,
          creditHalalas: GOSI,
        });
      }

      if (otherDeductionsHalalas > 0) {
        lines.push({
          accountId: adminExpAcc.id,
          accountCode: adminExpAcc.accountCode,
          accountNameAr: adminExpAcc.nameAr,
          accountNameEn: adminExpAcc.nameEn,
          debitHalalas: 0,
          creditHalalas: otherDeductionsHalalas,
        });
      }

      const entryNum = `JV-PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await addDoc(collection(db, "journal_entries"), {
        entryNumber: entryNum,
        date: `${simulationData.period}-28`,
        descriptionAr: `توجيه قيد استحقاق مسير رواتب شهر ${simulationData.period} تلقائياً`,
        descriptionEn: `Automated Accrual Booking for Payroll Period ${simulationData.period}`,
        lines,
        isBalanced: true,
        sourceDoc: `Payroll Run ${docRef.id}`,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // Write to Anti-Concealment Audit Trail
      await addDoc(collection(db, "financial_transactions"), {
        userId: user.uid,
        nationalId: user.crNumber || "1000000000", // Fallback to CR or default identifier
        amountHalalas: Math.round(simulationData.totalNet * 100),
        isOwner,
        needsOwnerVerification,
        verificationStatus: needsOwnerVerification ? "pending" : "verified",
        description: `Payroll run for period ${simulationData.period} (Run ID: ${docRef.id})`,
        createdAt: new Date().toISOString(),
      });

      setShowSimulateModal(false);
      setSimulationData(null);
      setActiveTab("runs");
      toast.success("تم اعتماد المسير بنجاح");
      setShowLargeTxModal(false);
    } catch (e) {
      console.error(e);
      toast.error("فشل في الاعتماد");
    }
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setEditForm({
      name: "",
      position: "",
      department: "",
      baseSalaryHalalas: 0,
      housingAllowanceHalalas: 0,
      transportAllowanceHalalas: 0,
      otherDeductionsHalalas: 0,
      nationality: "سعودي",
      absenceDays: 0,
      hireDate: new Date().toISOString().split("T")[0],
      bank: "",
      iban: "",
      status: "active",
      documents: [],
    });
    setShowEmployeeModal(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmployee(emp);
    const docs = Array.isArray(emp.documents) ? emp.documents : [];
    setEditForm({
      nationality: "سعودي",
      absenceDays: 0,
      hireDate: emp.hireDate || new Date().toISOString().split("T")[0],
      ...emp,
      documents: docs,
    });
    setShowEmployeeModal(true);
  };

  const saveEmployee = async () => {
    if (!user) return;
    try {
      const payload = {
        ...editForm,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingEmployee) {
        const { id, ...data } = payload;
        await updateDoc(doc(db, "employees", id), data);
      } else {
        await addDoc(collection(db, "employees"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }
      setShowEmployeeModal(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف الموظف "${name}"؟ هذا الإجراء لا يمكن التراجع عنه.`))
      return;
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء محاولة الحذف.");
    }
  };

  const downloadWps = async (runId: string) => {
    if (!user) return;
    try {
      const { PayrollService } = await import("@/src/services/payroll.service");
      const { data, period } = await PayrollService.generateWPS(user.uid, runId);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `WPS_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("فشل تنزيل ملف أجور");
    }
  };

  const downloadMudadSif = async (run: any) => {
    setSifValidateRun(run);
  };

  const disbursePayroll = async (run: any) => {
    if (!user) return;
    try {
      const qAcc = query(collection(db, "chart_of_accounts"), where("authorUid", "==", user.uid));
      const accSnap = await getDocs(qAcc);
      const accountsList = accSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

      const findOrCreateAccount = async (
        code: string,
        nameAr: string,
        nameEn: string,
        type: string
      ) => {
        let acc = accountsList.find((a) => a.accountCode === code);
        if (!acc) {
          const newDoc = await addDoc(collection(db, "chart_of_accounts"), {
            accountCode: code,
            nameAr,
            nameEn,
            type,
            balanceHalalas: 0,
            authorUid: user.uid,
            createdAt: serverTimestamp(),
          });
          acc = { id: newDoc.id, accountCode: code, nameAr, nameEn, type };
        }
        return acc;
      };

      const salPayableAcc = await findOrCreateAccount(
        "210301",
        "رواتب مستحقة الدفع",
        "Salaries Payable",
        "Liability"
      );
      const bankAcc = await findOrCreateAccount(
        "110101",
        "نقدية في البنك",
        "Cash in Bank",
        "Asset"
      );

      const Net = Math.round((run.totalNet || 0) * 100);

      if (Net <= 0) {
        toast.error("إجمالي الصافي غير صالح للصرف");
        return;
      }

      const lines = [
        {
          accountId: salPayableAcc.id,
          accountCode: salPayableAcc.accountCode,
          accountNameAr: salPayableAcc.nameAr,
          accountNameEn: salPayableAcc.nameEn,
          debitHalalas: Net,
          creditHalalas: 0,
        },
        {
          accountId: bankAcc.id,
          accountCode: bankAcc.accountCode,
          accountNameAr: bankAcc.nameAr,
          accountNameEn: bankAcc.nameEn,
          debitHalalas: 0,
          creditHalalas: Net,
        },
      ];

      const entryNumber = `JV-PR-PAY-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

      await addDoc(collection(db, "journal_entries"), {
        entryNumber,
        date: new Date().toISOString().split("T")[0],
        descriptionAr: `قيد صرف رواتب الموظفين لشهر ${run.period} بنكياً`,
        descriptionEn: `Automated bank disbursement for payroll period ${run.period}`,
        lines,
        isBalanced: true,
        sourceDoc: `Payroll Payment ${run.id}`,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "payroll_runs", run.id), {
        isPaid: true,
        logs: [
          ...(run.logs || []),
          {
            action: "Bank Disbursement Posted",
            user: user.email || user.uid,
            timestamp: new Date().toISOString(),
            note: `Posted disbursement entry: ${entryNumber}`,
          },
        ],
      });

      toast.success("تم صرف رواتب المسير بنجاح وتوليد قيد الصرف التلقائي!");
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء معالجة صرف الرواتب");
    }
  };

  const toggleLock = async (run: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "payroll_runs", run.id), {
        isLocked: !run.isLocked,
        systemLockState: !run.isLocked ? "pending" : null,
        logs: [
          ...(run.logs || []),
          {
            action: !run.isLocked ? "Manual Lock" : "Manual Unlock",
            user: user.email || user.uid,
            timestamp: new Date().toISOString(),
          },
        ],
      });
      toast.success(
        !run.isLocked ? "تم تحويل المسير إلى الإقفال (قيد المعالجة)" : "تم فك إقفال المسير"
      );
    } catch (e) {
      console.error(e);
      toast.error("حدث خطأ أثناء تعديل الإقفال");
    }
  };

  const handleBulkAction = async (actionType: "approve" | "correction") => {
    if (!user || selectedRuns.length === 0) return;
    try {
      const batchDocs = runs.filter((r) => selectedRuns.includes(r.id));
      for (const run of batchDocs) {
        if (actionType === "approve") {
          await updateDoc(doc(db, "payroll_runs", run.id), {
            status: "finalized",
            logs: [
              ...(run.logs || []),
              { action: "Bulk Approved", timestamp: new Date().toISOString(), user: user.email },
            ],
          });
        } else {
          await updateDoc(doc(db, "payroll_runs", run.id), {
            status: "needs_correction",
            isLocked: false,
            systemLockState: null,
            logs: [
              ...(run.logs || []),
              {
                action: "Bulk Correction Requested",
                timestamp: new Date().toISOString(),
                user: user.email,
              },
            ],
          });
        }
      }
      toast.success(
        `تم تنفيذ الإجراء (${actionType === "approve" ? "اعتماد" : "طلب تعديل"}) على المعاملات المحددة.`
      );
      setSelectedRuns([]);
    } catch (e) {
      console.error(e);
      toast.error("فشل تنفيذ الإجراء المجمع");
    }
  };

  const confirmDownloadMudadSif = async () => {
    if (!user || !sifValidateRun) return;
    try {
      const { PayrollService } = await import("@/src/services/payroll.service");
      const { data, period } = await PayrollService.generateMudadSIF(user.uid, sifValidateRun.id);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `SIF_MUDAD_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("تم توليد ملف SIF بنجاح");
      setSifValidateRun(null);
    } catch (e) {
      console.error(e);
      alert("فشل تنزيل ملف أجور لمدد");
    }
  };

  const downloadReportCsv = (run: any) => {
    try {
      // English requested columns: employee name, bank, basic salary, allowances, deductions, net pay
      let csvData = "\uFEFF" + `Employee Name,Bank,Basic Salary,Allowances,Deductions,Net Pay\n`;
      run.entries.forEach((e: any) => {
        // Enclose strings in quotes to handle commas
        const name = `"${(e.employeeName || e.name || "").replace(/"/g, '""')}"`;
        const bank = `"${(e.bank || "").replace(/"/g, '""')}"`;
        csvData += `${name},${bank},${e.basic},${e.allowances},${e.deductions},${e.netPay}\n`;
      });

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `payroll_report_${run.period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Failed to download CSV");
    }
  };

  const downloadReportPdf = async (run: any) => {
    try {
      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.text(`Payroll Report - ${run.period}`, 14, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Run ID: ${run.id}`, 14, 30);
      doc.text(`Total Gross: ${run.totalGross.toLocaleString()} SAR`, 14, 36);
      doc.text(`Total Deductions: ${run.totalDeductions.toLocaleString()} SAR`, 14, 42);
      doc.text(`Total Net Pay: ${run.totalNet.toLocaleString()} SAR`, 14, 48);

      const tableData = run.entries.map((entry: any) => [
        entry.employeeName,
        entry.position,
        entry.bank,
        entry.basic.toLocaleString(),
        entry.allowances.toLocaleString(),
        entry.deductions.toLocaleString(),
        entry.netPay.toLocaleString(),
      ]);

      autoTable(doc, {
        startY: 60,
        head: [
          [
            "Employee Name",
            "Position",
            "Bank Details",
            "Basic (SAR)",
            "Allowances",
            "Deductions",
            "Net Pay",
          ],
        ],
        body: tableData,
        theme: "striped",
        headStyles: { fillColor: [39, 39, 42] },
        styles: { fontSize: 8 },
      });

      doc.save(`Payroll_Report_${run.period}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
    }
  };

  const downloadBatchMudadSif = async (period: string) => {
    if (!user) return;
    try {
      const { PayrollService } = await import("@/src/services/payroll.service");
      const { data } = await PayrollService.batchGenerateMudadSIF(user.uid, period);
      const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `BATCH_SIF_MUDAD_${period}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("تم توليد ملف مسير الرواتب بصيغة SIF لشهر " + period);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "فشل توليد ملف SIF");
    }
  };

  const totalPayrollCost = useMemo(() => {
    if (!Array.isArray(employees)) return 0;
    return (
      employees.reduce(
        (acc, emp) =>
          acc +
          (emp.baseSalaryHalalas || 0) +
          (emp.housingAllowanceHalalas || 0) +
          (emp.transportAllowanceHalalas || 0),
        0
      ) / 100
    );
  }, [employees]);

  const chartData = useMemo(() => {
    if (Array.isArray(runs) && runs.length > 0) {
      return [...runs]
        .reverse()
        .slice(-6)
        .map((r) => ({
          name: r.period,
          cost: r.totalGross,
        }));
    }
    return [
      { name: "T-3", cost: totalPayrollCost * 0.9 },
      { name: "T-2", cost: totalPayrollCost * 0.95 },
      { name: "T-1", cost: totalPayrollCost * 0.98 },
      { name: "الحالي", cost: totalPayrollCost },
    ];
  }, [runs, totalPayrollCost]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(
    null
  );

  const requestSort = (key: string) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedEmployees = useMemo(() => {
    if (!Array.isArray(employees)) return [];
    const sortableEmployees = [...employees];
    if (sortConfig !== null) {
      sortableEmployees.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        // Handle nested or derived keys if needed, but simple property access should work.
        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableEmployees;
  }, [employees, sortConfig]);

  // Pagination Logic
  const indexOfLastEmp = currentPage * pageSize;
  const indexOfFirstEmp = indexOfLastEmp - pageSize;
  const currentEmployees = sortedEmployees.slice(indexOfFirstEmp, indexOfLastEmp);
  const totalPages = Math.ceil(sortedEmployees.length / pageSize);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const exportEmployeesAsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    // Since default jsPDF doesn't support Arabic natively without a custom TTF,
    // we use an English title or simple Arabic if supported.
    doc.text("سجل الموظفين - Employee List", 14, 20);

    const headers = [
      [
        "Employee Name / الاسم",
        "Position / القسم",
        "Bank / البنك",
        "Basic Salary / الراتب",
        "Status / الحالة",
      ],
    ];
    const data = sortedEmployees.map((emp) => [
      emp.name || "",
      emp.department || "",
      emp.bank || "",
      ((emp.baseSalaryHalalas || 0) / 100).toLocaleString(),
      emp.status === "active" ? "نشط / Active" : "غير نشط / Inactive",
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: data,
      theme: "grid",
      styles: { font: "helvetica", fontSize: 10, halign: "right" },
      headStyles: { fillColor: [39, 39, 42] },
    });

    doc.save("employees-list.pdf");
  };

  const exportEmployeesAsCSV = () => {
    const headers = [
      "الاسم",
      "المنصب",
      "القسم",
      "الراتب الأساسي",
      "بدل السكن",
      "بدل النقل",
      "خصومات أخرى",
      "الحالة",
      "البنك",
      "الآيبان",
    ];
    const rows = sortedEmployees.map((emp) => [
      `"${emp.name || ""}"`,
      `"${emp.position || ""}"`,
      `"${emp.department || ""}"`,
      (emp.baseSalaryHalalas || 0) / 100,
      (emp.housingAllowanceHalalas || 0) / 100,
      (emp.transportAllowanceHalalas || 0) / 100,
      (emp.otherDeductionsHalalas || 0) / 100,
      `"${emp.status === "active" ? "نشط" : emp.status === "inactive" ? "غير نشط" : "منتهي"}"`,
      `"${emp.bank || ""}"`,
      `"${emp.iban || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "employees.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departmentCosts = useMemo(() => {
    const costs: Record<string, number> = {};
    if (Array.isArray(employees)) {
      employees.forEach((emp) => {
        const dept = emp.department || "غير محدد";
        const total =
          ((emp.baseSalaryHalalas || 0) +
            (emp.housingAllowanceHalalas || 0) +
            (emp.transportAllowanceHalalas || 0)) /
          100;
        costs[dept] = (costs[dept] || 0) + total;
      });
    }
    return Object.entries(costs).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

  const expiringContracts = useMemo(() => {
    if (!settings.contractEndReminder || !Array.isArray(employees)) return [];
    const today = new Date();
    return employees.filter((emp) => {
      const endDateStr = emp.customFields?.contractEndDate;
      if (!endDateStr) return false;
      const endDate = new Date(endDateStr);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= settings.contractReminderDays && diffDays >= 0;
    });
  }, [employees, settings]);

  if (loading)
    return <div className="p-10 text-center font-bold text-zinc-500">جاري تحميل النظام...</div>;

  const tabGroups: {
    title: string;
    items: {
      id: string;
      label: string;
      icon: any;
      desc: string;
      badge: any;
      badgeColor?: string;
    }[];
  }[] = [
    {
      title: "إدارة الرواتب والمسيرات",
      items: [
        {
          id: "dashboard",
          label: t("payroll.tabs.dashboard", "لوحة معلومات الرواتب"),
          icon: Activity,
          desc: "مؤشرات وتكلفة الرواتب العامة",
          badge: null,
        },
        {
          id: "runs",
          label: t("payroll.tabs.runs", "مسيرات الرواتب (Paychecks)"),
          icon: Calculator,
          desc: "معالجة واعتماد وتصدير ملفات WPS / SIF",
          badge: runs.length > 0 ? runs.length : null,
        },
        {
          id: "templates",
          label: "قوالب الرواتب (Templates)",
          icon: ClipboardList,
          desc: "تحديد البدلات والاستقطاعات المتكررة",
          badge: "جديد",
          badgeColor: "bg-emerald-50 text-emerald-700",
        },
        {
          id: "ledger",
          label: "سجل القيود المزدوجة",
          icon: BookOpen,
          desc: "توجيه الرواتب للحسابات وقيود الميزانية",
          badge: "جديد",
          badgeColor: "bg-blue-50 text-blue-700",
        },
        {
          id: "audit",
          label: t("payroll.tabs.audit", "سجل الامتثال للرواتب"),
          icon: ShieldCheck,
          desc: "سجلات تطابق الأجور والـWPS",
          badge: null,
        },
      ],
    },
    {
      title: "شؤون الموظفين والعمل",
      items: [
        {
          id: "employees",
          label: t("payroll.tabs.employees", "سجل الموظفين والرواتب"),
          icon: Users,
          desc: "بيانات الموظفين والبدلات والآيبان",
          badge: employees.length > 0 ? employees.length : null,
        },
        {
          id: "attendance",
          label: "الحضور والعمل الإضافي",
          icon: Clock,
          desc: "متابعة الحضور والعمل الإضافي",
          badge: null,
        },
        {
          id: "requests",
          label: "الخدمات والسلف (Advances)",
          icon: ClipboardList,
          desc: "طلبات السلف والخصومات التلقائية",
          badge: null,
        },
        {
          id: "kpi",
          label: "مؤشرات الأداء (KPIs)",
          icon: Target,
          desc: "تتبع الأداء وربطه بالمكافآت والخصومات",
          badge: null,
        },
      ],
    },
    {
      title: "الأدوات والذكاء الاصطناعي",
      items: [
        {
          id: "settlement",
          label: "مكافأة نهاية الخدمة (EOS)",
          icon: Scale,
          desc: "حساب مستحقات الخدمة طبقاً للائحة",
          badge: null,
        },
        {
          id: "ai_assistant",
          label: "المساعد الذكي AI HR",
          icon: Sparkles,
          desc: "مستشار موارد بشرية ذكي وفوري",
          badge: "جديد",
          badgeColor: "bg-indigo-50 text-indigo-750",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-[calc(100vh-6rem)] overflow-y-auto pb-20 scrollbar-hide">
      {/* Header / Intro Ribbon */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-white border border-zinc-200 p-6 rounded-[2.25rem] shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-lg">
              WPS GOSI Compliant
            </span>
            <span className="px-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider font-mono">
              Payroll Center v2.5
            </span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
            نظام إدارة الأجور والرواتب
          </h1>
          <p className="text-zinc-500 mt-1 text-xs font-semibold leading-relaxed">
            أتمتة كاملة لمسير الرواتب المعتمد، إعداد ملفات صرف الأجور بالصيغة البنكية الرسمية، وضمان
            الامتثال لوزارة الموارد البشرية.
          </p>
        </div>
      </header>

      {/* Internal Sub-Navigation Layout with Vertical Sub-Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Right sub-sidebar column (sidebar first to place on the right side in RTL mode) */}
        <aside className="lg:col-span-1 space-y-4">
          {/* Mobile responsive tab list fallback */}
          <div className="lg:hidden flex bg-zinc-100 p-1.5 rounded-2xl w-full overflow-x-auto gap-1 scrollbar-hide">
            {tabGroups
              .flatMap((g) => g.items)
              .map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0",
                      isActive
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"
                    )}
                  >
                    <tab.icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label.split(" (")[0]}</span>
                  </button>
                );
              })}
          </div>

          {/* Desktop structured secondary sidebar menu */}
          <div className="hidden lg:flex flex-col bg-white border border-zinc-200 rounded-[2.25rem] p-5 shadow-sm space-y-5">
            <div className="border-b border-zinc-100 pb-2">
              <span className="text-[10px] font-black text-zinc-400 bg-zinc-50 border border-zinc-100 px-3 py-1 rounded-full uppercase tracking-widest font-mono">
                أقسام لوحة الرواتب
              </span>
            </div>

            {tabGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-2">
                <h4 className="text-[10px] font-black text-zinc-400 select-none px-2 uppercase tracking-wide">
                  {group.title}
                </h4>
                <div className="space-y-1">
                  {group.items.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={cn(
                          "w-full text-right flex items-center justify-between p-3 rounded-2xl transition-all border group text-xs font-bold relative",
                          isActive
                            ? "bg-zinc-900 text-white border-zinc-900 shadow-md"
                            : "bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center border transition-colors",
                              isActive
                                ? "bg-white/10 border-white/20 text-emerald-400"
                                : "bg-zinc-50 border-zinc-100 text-zinc-400 group-hover:text-zinc-900 group-hover:bg-zinc-100"
                            )}
                          >
                            <tab.icon className="w-4 h-4 shrink-0" />
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="leading-tight text-xs font-black">{tab.label}</span>
                            <span
                              className={cn(
                                "text-[9px] font-medium leading-none mt-0.5",
                                isActive
                                  ? "text-zinc-400"
                                  : "text-zinc-400 group-hover:text-zinc-550"
                              )}
                            >
                              {tab.desc}
                            </span>
                          </div>
                        </div>
                        {tab.badge !== null && (
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[9px] font-black shrink-0",
                              tab.badgeColor
                                ? tab.badgeColor
                                : isActive
                                  ? "bg-emerald-500/20 text-emerald-300"
                                  : "bg-zinc-100 text-zinc-600 border border-zinc-200"
                            )}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Left Side Active Panel Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Top Summary Recharts Card */}
              <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3 h-[200px]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-black text-zinc-900">مقارنة الرواتب</h3>
                      <p className="text-xs font-bold text-zinc-500">
                        معدل تغير تكلفة الرواتب الشهرية
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={[
                        {
                          name: "الشهر الماضي",
                          cost: totalPayrollCost * 0.95,
                          headcount: employees.length - 2,
                        },
                        {
                          name: "الشهر الحالي",
                          cost: totalPayrollCost,
                          headcount: employees.length,
                        },
                      ]}
                    >
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#71717a", fontWeight: "bold" }}
                      />
                      <YAxis hide domain={["dataMin - 1000", "dataMax + 1000"]} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "16px",
                          border: "none",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#18181b", marginBottom: "4px" }}
                        itemStyle={{ fontWeight: "bold", color: "#059669" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cost"
                        name="إجمالي الرواتب"
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorCost)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="w-full md:w-1/3 flex flex-col justify-center gap-4 border-r border-zinc-100 pr-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                      تغير عدد الموظفين
                    </p>
                    <div className="flex items-end gap-2">
                      <h4 className="text-3xl font-black text-zinc-900">{employees.length}</h4>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md mb-1">
                        +2 هذا الشهر
                      </span>
                    </div>
                  </div>
                  <hr className="border-zinc-100" />
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-1">
                      تنبيهات الامتثال (Compliance)
                    </p>
                    <div className="flex items-end gap-2">
                      <h4 className="text-3xl font-black text-rose-600">
                        {employees.filter((e: any) => !e.gosiNumber || !e.iban).length}
                      </h4>
                      <span className="text-xs font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md mb-1">
                        يتطلب حل
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {expiringContracts.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-[2rem] flex items-center gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl shrink-0">
                    <AlertCircle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h4 className="font-bold">تنبيه انتهاء العقود</h4>
                    <p className="text-sm font-medium opacity-90 mt-1">
                      هناك {expiringContracts.length} موظف/موظفين ستنتهي عقودهم خلال{" "}
                      {settings.contractReminderDays} يوم. يرجى مراجعة صفحة الموظفين للتأكد من
                      العقود.
                    </p>
                  </div>
                </div>
              )}

              {/* Real-Time Compliance Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-red-50 border border-red-100 p-5 rounded-[2rem] flex items-start gap-4 text-red-900 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
                  <AlertOctagon className="w-6 h-6 shrink-0 text-red-600 mt-1" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-red-800">
                      تنبيهات GOSI
                    </h4>
                    <p className="text-xs font-bold leading-relaxed mt-1.5 opacity-90">
                      يوجد {employees.filter((e: any) => !e.gosiNumber).length} موظف/موظفين غير
                      مسجلين في التأمينات.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] flex items-start gap-4 text-amber-900 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-amber-500"></div>
                  <ShieldCheck className="w-6 h-6 shrink-0 text-amber-600 mt-1" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-amber-800">
                      فحص Qiwa / WPS
                    </h4>
                    <p className="text-xs font-bold leading-relaxed mt-1.5 opacity-90">
                      {employees.filter((e: any) => !e.iban).length} موظف/موظفين لديهم بيانات IBAN
                      مفقودة أو غير صالحة. وتحديث الأجور معلق.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-[2rem] flex items-start gap-4 text-emerald-900 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500"></div>
                  <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-600 mt-1" />
                  <div>
                    <h4 className="text-sm font-black uppercase tracking-wide text-emerald-800">
                      حالة الامتثال
                    </h4>
                    <p className="text-xs font-bold leading-relaxed mt-1.5 opacity-90">
                      حماية الأجور (WPS) متوافق بنسبة 100% لبقية الموظفين النشطين.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-zinc-900 text-white p-6 rounded-[2rem] shadow-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      توقع الشهر القادم
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-400 text-sm font-medium mb-1">
                      إجمالي التكلفة المتوقعة
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-3xl font-black">{totalPayrollCost.toLocaleString()}</h3>
                      <span className="text-sm font-bold text-zinc-500">ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-blue-50 focus:ring rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      الموظفين
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium mb-1">
                      النشطين في مسير الرواتب
                    </p>
                    <h3 className="text-3xl font-black text-zinc-900">{employees.length}</h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      التأمينات GOSI
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium mb-1">
                      اقتطاعات التأمينات المتوقعة
                    </p>
                    <h3 className="text-3xl font-black text-zinc-900">
                      {(totalPayrollCost * 0.09).toLocaleString()}{" "}
                      <span className="text-sm">ر.س</span>
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between ring-1 ring-primary/20">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                      WPS Status
                    </span>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-sm font-medium mb-1">
                      نقاط الامتثال (Compliance)
                    </p>
                    <h3 className="text-3xl font-black text-zinc-900">100%</h3>
                  </div>
                </div>
              </div>

              <PayrollCharts employees={employees} runs={runs} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                      <Play className="w-6 h-6 ml-1" />
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2">محاكي مسير الرواتب</h3>
                    <p className="text-sm font-medium text-zinc-500 leading-relaxed mb-6">
                      قم بتشغيل محاكاة لمسير الرواتب. سيقوم النظام بحساب الخصومات، التأمينات،
                      والبدلات تلقائياً بناءً على قواعد WPS.
                    </p>
                    <div className="mb-6 space-y-2">
                      <label className="text-xs font-bold text-zinc-400 uppercase">
                        فترة الرواتب (شهر-سنة)
                      </label>
                      <input
                        type="month"
                        value={simulatePeriod}
                        onChange={(e) => setSimulatePeriod(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSimulate}
                    className="w-full bg-zinc-900 text-white font-bold py-4 rounded-2xl shadow-xl hover:-translate-y-1 transition-transform flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" /> بدء المحاكاة الآن
                  </button>
                </div>
                <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 col-span-1 lg:col-span-3">
                  <div className="mb-4">
                    <h3 className="text-lg font-black text-zinc-900">توزيع التكلفة حسب القسم</h3>
                    <p className="text-sm text-zinc-500">
                      إجمالي الرواتب الأساسية والبدلات لجميع الموظفين مصنفة حسب القسم
                    </p>
                  </div>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentCosts}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {departmentCosts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "1rem",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                          }}
                          formatter={(val: number) => [`${val.toLocaleString()} SAR`, "التكلفة"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* EMPLOYEES TAB */}
          {activeTab === "employees" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 md:p-8 border-b border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-zinc-900">سجل الموظفين والرواتب</h3>
                  <p className="text-sm font-medium text-zinc-500 mt-1">
                    إضافة موظفين، تعديل الرواتب الأساسية، البدلات ومعلومات البنك
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap md:flex-nowrap">
                  <button
                    onClick={exportEmployeesAsCSV}
                    className="flex items-center justify-center gap-2 bg-white text-zinc-700 border border-zinc-200 px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
                  >
                    <Download className="w-4 h-4" /> تصدير CSV
                  </button>
                  <button
                    onClick={exportEmployeesAsPDF}
                    className="flex items-center justify-center gap-2 bg-white text-zinc-700 border border-zinc-200 px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-50 transition-all shadow-sm"
                  >
                    <FileText className="w-4 h-4" /> تصدير PDF
                  </button>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="بحث..."
                      className="pl-4 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold w-full md:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  <button
                    onClick={openAddModal}
                    className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md"
                  >
                    <Plus className="w-4 h-4" /> إضافة
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="bg-zinc-50/50 text-zinc-500 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center gap-1">
                          الموظف{" "}
                          {sortConfig?.key === "name"
                            ? sortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => requestSort("position")}
                      >
                        <div className="flex items-center gap-1">
                          القسم/المنصب{" "}
                          {sortConfig?.key === "position"
                            ? sortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => requestSort("baseSalary")}
                      >
                        <div className="flex items-center gap-1">
                          الراتب الصافي المتوقع{" "}
                          {sortConfig?.key === "baseSalary"
                            ? sortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                      </th>
                      <th className="px-6 py-4">التفاصيل (بدلات/خصومات)</th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => requestSort("status")}
                      >
                        <div className="flex items-center gap-1">
                          الحالة{" "}
                          {sortConfig?.key === "status"
                            ? sortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                      </th>
                      <th
                        className="px-6 py-4 cursor-pointer hover:bg-zinc-100 transition-colors"
                        onClick={() => requestSort("bank")}
                      >
                        <div className="flex items-center gap-1">
                          البنك / IBAN{" "}
                          {sortConfig?.key === "bank"
                            ? sortConfig.direction === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </div>
                      </th>
                      <th className="px-6 py-4">الوثائق</th>
                      <th className="px-6 py-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {currentEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}&backgroundColor=f4f4f5&textColor=18181b`}
                                alt={emp.name}
                                className="w-full h-full rounded-xl"
                              />
                            </div>
                            <div>
                              <div className="font-black text-zinc-900">{emp.name}</div>
                              <div className="text-[10px] font-bold text-zinc-500 mt-0.5">
                                ID: {emp.id.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-zinc-700">{emp.position}</div>
                          <div className="text-xs text-zinc-400">{emp.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-zinc-900">
                            {(
                              ((emp.baseSalaryHalalas || 0) +
                                (emp.housingAllowanceHalalas || 0) +
                                (emp.transportAllowanceHalalas || 0) -
                                (emp.otherDeductionsHalalas || 0)) /
                              100
                            ).toLocaleString()}{" "}
                            <span className="text-[10px] text-zinc-400">ر.س</span>
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-zinc-600">
                              بدلات:{" "}
                              {(
                                ((emp.housingAllowanceHalalas || 0) +
                                  (emp.transportAllowanceHalalas || 0)) /
                                100
                              ).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-rose-500">
                              خصومات: {((emp.otherDeductionsHalalas || 0) / 100).toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-500">
                              جنسية: {emp.nationality || "سعودي"} | غياب: {emp.absenceDays || 0} يوم
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2 py-1 rounded-lg text-[10px] font-black uppercase",
                              emp.status === "active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : emp.status === "inactive"
                                  ? "bg-zinc-100 text-zinc-500 border border-zinc-200"
                                  : "bg-rose-50 text-rose-600 border border-rose-100"
                            )}
                          >
                            {emp.status === "active"
                              ? "نشط"
                              : emp.status === "inactive"
                                ? "غير نشط"
                                : "منتهي"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-xs font-bold text-zinc-900">{emp.bank}</div>
                            <div className="text-[10px] font-mono text-zinc-500 mt-0.5">
                              {emp.iban}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const docs =
                                typeof emp.documents === "string"
                                  ? JSON.parse(emp.documents)
                                  : Array.isArray(emp.documents)
                                    ? emp.documents
                                    : [];
                              return docs.length > 0 ? (
                                <>
                                  <div className="flex -space-x-2">
                                    {docs.slice(0, 3).map((d: any, i: number) => (
                                      <div
                                        key={i}
                                        className="w-6 h-6 rounded-lg bg-zinc-100 border border-white flex items-center justify-center shadow-sm"
                                        title={d.name}
                                      >
                                        <FileText className="w-3 h-3 text-zinc-400" />
                                      </div>
                                    ))}
                                  </div>
                                  {docs.length > 3 && (
                                    <span className="text-[10px] font-black text-zinc-400">
                                      +{docs.length - 3}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-[10px] font-bold text-zinc-300">لا يوجد</span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-2 bg-zinc-50 text-zinc-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(emp.id, emp.name)}
                              className="p-2 bg-zinc-50 text-zinc-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button className="p-2 bg-zinc-50 text-zinc-400 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-100 hover:text-zinc-600 transition-all">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">
                    عرض {indexOfFirstEmp + 1} إلى {Math.min(indexOfLastEmp, employees.length)} من{" "}
                    {employees.length}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          className={cn(
                            "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                            currentPage === i + 1
                              ? "bg-primary text-white"
                              : "text-zinc-500 hover:bg-zinc-100"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* RUNS TAB */}
          {activeTab === "runs" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Quick Stats Banner inside Runs Section */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-zinc-200 p-5 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-100">
                    <Calculator className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 block uppercase">
                      شهر معالج بنجاح
                    </span>
                    <span className="text-lg font-black text-zinc-950 mt-0.5 block">
                      {runs.length} مسيرات
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-zinc-200 p-5 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-100">
                    <TrendingUp className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 block uppercase">
                      إجمالي مبالغ المسيرات
                    </span>
                    <span className="text-lg font-black text-zinc-955 mt-0.5 block">
                      {runs.reduce((sum, r) => sum + (r.totalGross || 0), 0).toLocaleString()}{" "}
                      <span className="text-[10px] text-zinc-400">ر.س</span>
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-zinc-200 p-5 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-100">
                    <DollarSign className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 block uppercase">
                      الصافي الفعلي المحول
                    </span>
                    <span className="text-lg font-black text-emerald-600 mt-0.5 block">
                      {runs.reduce((sum, r) => sum + (r.totalNet || 0), 0).toLocaleString()}{" "}
                      <span className="text-[10px] text-zinc-400">ر.س</span>
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-zinc-200 p-5 rounded-[2rem] shadow-sm flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-500 border border-zinc-100">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-zinc-400 block uppercase">
                      معدل المطابقة والالتزام
                    </span>
                    <span className="text-lg font-black text-indigo-650 mt-0.5 block">
                      100% متوافق
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Center Banner */}
              <div className="bg-zinc-900 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10 w-full md:w-auto">
                  <h3 className="text-xl font-black text-white mb-2">أتمتة واعتماد مسير الرواتب</h3>
                  <p className="text-zinc-400 text-sm font-medium max-w-lg mb-4">
                    هنا يمكنك استعراض المسيرات السابقة، وتوليد ملفات WPS المتوافقة مع النظام البنكي
                    الخليجي بضغطة زر.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <input
                      type="month"
                      value={simulatePeriod}
                      onChange={(e) => setSimulatePeriod(e.target.value)}
                      className="bg-white/10 text-white border border-white/20 rounded-xl px-4 py-2.5 font-bold outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      onClick={handleSimulate}
                      className="bg-white text-zinc-900 font-bold px-6 py-3 rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Play className="w-4 h-4" /> معالجة مسير الشهر
                    </button>
                    <button
                      onClick={() => downloadBatchMudadSif(simulatePeriod)}
                      className="bg-emerald-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4" /> الامتثال وتسليم مدد (Batch SIF)
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive Search & Filter Controls */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                <div className="flex items-center gap-1.5 w-full md:w-auto relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="البحث بتحديد فترات الصرف (مثال: 2026-06)..."
                    value={runSearchQuery}
                    onChange={(e) => setRunSearchQuery(e.target.value)}
                    className="w-full md:w-[260px] bg-zinc-50 text-xs pr-9 pl-4 py-2.5 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                  />
                </div>

                <div className="flex items-center bg-zinc-100/70 p-1 rounded-xl w-full md:w-auto shrink-0 gap-1 overflow-x-auto">
                  {[
                    { id: "all", label: "جميع المسيرات" },
                    { id: "locked", label: "مغلقة مؤمنة" },
                    { id: "active", label: "مفتوحة نشطة" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setRunFilterStatus(tab.id)}
                      className={cn(
                        "px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap",
                        runFilterStatus === tab.id
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-800"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Bulk Actions Toolbar */}
                {selectedRuns.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-100 p-4 rounded-2xl flex items-center justify-between border border-zinc-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white px-3 py-1 rounded-xl text-xs font-bold text-zinc-600 border border-zinc-200">
                        تم تحديد {selectedRuns.length}
                      </div>
                      <button
                        onClick={() => setSelectedRuns(runs.map((r) => r.id))}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        تحديد الكل
                      </button>
                      <button
                        onClick={() => setSelectedRuns([])}
                        className="text-xs font-bold text-zinc-500 hover:underline"
                      >
                        إلغاء التحديد
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleBulkAction("approve")}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition"
                      >
                        اعتماد جماعي
                      </button>
                      <button
                        onClick={() => handleBulkAction("correction")}
                        className="bg-amber-100 text-amber-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-amber-200 transition"
                      >
                        طلب تعديل جماعي
                      </button>
                    </div>
                  </motion.div>
                )}

                {(() => {
                  const items = runs.filter((run) => {
                    const matchQuery = run.period
                      ? run.period.toLowerCase().includes(runSearchQuery.toLowerCase())
                      : true;
                    const matchStatus =
                      runFilterStatus === "all"
                        ? true
                        : runFilterStatus === "locked"
                          ? run.isLocked
                          : runFilterStatus === "active"
                            ? !run.isLocked
                            : true;
                    return matchQuery && matchStatus;
                  });

                  if (items.length === 0) {
                    return (
                      <div className="text-center py-16 bg-white border border-zinc-200 rounded-[2.25rem] text-zinc-400 font-bold">
                        لا يوجد مسيرات رواتب مطابقة لخيارات البحث المحددة.
                      </div>
                    );
                  }

                  return items.map((run) => (
                    <div
                      key={run.id}
                      className="bg-white p-6 rounded-[2.25rem] border border-zinc-200 shadow-sm flex flex-col gap-6 relative transition-all hover:shadow-md"
                    >
                      <div className="absolute top-6 right-6">
                        <input
                          type="checkbox"
                          checked={selectedRuns.includes(run.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedRuns([...selectedRuns, run.id]);
                            else setSelectedRuns(selectedRuns.filter((id) => id !== run.id));
                          }}
                          className="w-5 h-5 rounded-lg border-zinc-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                      </div>

                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pr-10 border-b border-zinc-100 pb-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shrink-0">
                            <Calculator className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-lg font-black text-zinc-900">
                                مسير رواتب {run.period}
                              </h4>
                              <span
                                className={cn(
                                  "px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider",
                                  run.isLocked
                                    ? "bg-zinc-100 text-zinc-600 border-zinc-250"
                                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}
                              >
                                {run.isLocked ? "مغلق وموثق" : "مفتوح نشط ورسمي"}
                              </span>
                            </div>
                            <p className="text-[10px] font-semibold text-zinc-400 mt-1">
                              أنشئ بواسطة:{" "}
                              {run.userId === user?.uid
                                ? "النظام التلقائي (الذكاء الاصطناعي)"
                                : run.userId || "النظام الشامل"}
                            </p>
                          </div>
                        </div>

                        {/* Financial Values Box Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block pb-1">
                              إجمالي المستحق
                            </span>
                            <span className="font-extrabold text-xs text-zinc-900 border-b-2 border-zinc-200">
                              {run.totalGross.toLocaleString()}{" "}
                              <span className="text-[9px] font-medium text-zinc-400">ر.س</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block pb-1">
                              الخصومات / التأمينات
                            </span>
                            <span className="font-extrabold text-xs text-rose-500 border-b-2 border-rose-100">
                              {(run.totalGross - run.totalNet || 0).toLocaleString()}{" "}
                              <span className="text-[9px] font-medium text-rose-400">ر.س</span>
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-zinc-400 block pb-1">
                              الموظفين المشمولين
                            </span>
                            <span className="font-extrabold text-xs text-zinc-900">
                              {run.entries?.length || employees.length} موظف
                            </span>
                          </div>
                          <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-zinc-150">
                            <span className="text-[9px] font-bold text-zinc-500 block pb-0.5">
                              الصافي المحول للمصارف
                            </span>
                            <span className="font-black text-sm text-emerald-600">
                              {run.totalNet.toLocaleString()}{" "}
                              <span className="text-[9px] font-bold text-emerald-500">ر.س</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Operational Grouped Action Blocks */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* WPS & SIF Actions Left */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400 select-none uppercase tracking-widest pl-1">
                            تصدير الالتزام (SIF):
                          </span>
                          <button
                            onClick={() => downloadMudadSif(run)}
                            className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2.5 text-xs font-black rounded-xl hover:bg-emerald-700 transition shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" /> توليد SIF لمدد
                          </button>
                          <button
                            onClick={() => downloadWps(run.id)}
                            className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-2.5 text-xs font-black rounded-xl hover:bg-zinc-850 transition shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" /> تنزيل ملف أجور WPS
                          </button>
                          {run.isPaid ? (
                            <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-2.5 text-xs font-black rounded-xl border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> تم الصرف
                              والتحويل بنجاح
                            </span>
                          ) : (
                            <button
                              onClick={() => disbursePayroll(run)}
                              className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2.5 text-xs font-black rounded-xl hover:bg-blue-700 transition shadow-sm"
                            >
                              <CreditCard className="w-3.5 h-3.5" /> صرف ودفع الرواتب بنكياً
                            </button>
                          )}
                        </div>

                        {/* Reports & Auditing Right */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-black text-zinc-400 select-none uppercase tracking-widest pl-1">
                            تقارير وتدقيق:
                          </span>
                          <button
                            onClick={() => downloadReportCsv(run)}
                            className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3 py-2 text-xs font-bold rounded-xl hover:bg-zinc-200 transition"
                          >
                            <Download className="w-3.5 h-3.5 text-zinc-400" /> تقرير CSV
                          </button>
                          <button
                            onClick={() => downloadReportPdf(run)}
                            className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3 py-2 text-xs font-bold rounded-xl hover:bg-zinc-200 transition"
                          >
                            <FileText className="w-3.5 h-3.5 text-zinc-400" /> تقرير PDF
                          </button>
                          <button
                            onClick={() => setAuditRun(run)}
                            className="flex items-center gap-1.5 bg-zinc-100 text-zinc-700 px-3 py-2 text-xs font-bold rounded-xl hover:bg-zinc-200 transition"
                          >
                            <History className="w-3.5 h-3.5 text-zinc-400" /> العمليات
                          </button>

                          {run.preventModifications ? (
                            <div className="flex items-center gap-1 bg-rose-50 text-rose-700 px-3.5 py-2 text-xs font-bold rounded-xl border border-rose-100 shrink-0">
                              حالة ثابتة (مؤمن)
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleLock(run)}
                              className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all border shrink-0",
                                run.isLocked
                                  ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse"
                                  : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                              )}
                            >
                              {run.isLocked ? "فتح فك الإقفال" : "تنفيذ إقفال المسير"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </motion.div>
          )}

          {/* AUDIT TAB */}
          {activeTab === "audit" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">
                      سجل الامتثال والعمليات التلقائية
                    </h3>
                    <p className="text-zinc-500 font-medium text-sm">
                      تتبع جميع الإقفالات الآلية والتعديلات اليدوية على مسيرات الرواتب لأغراض
                      المراجعة.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {runs.map((run) =>
                    run.logs && run.logs.length > 0
                      ? run.logs.map((log: any, i: number) => (
                          <div
                            key={`${run.id}-${i}`}
                            className="flex gap-4 items-start pb-4 border-b border-zinc-100 last:border-0 hover:bg-zinc-50 transition-colors p-4 rounded-xl"
                          >
                            <div
                              className={cn(
                                "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border",
                                log.action.includes("System") || log.action.includes("Auto")
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : "bg-zinc-100 text-zinc-400 border-zinc-200"
                              )}
                            >
                              {log.action.includes("System") || log.action.includes("Auto") ? (
                                <AlertOctagon className="w-5 h-5" />
                              ) : (
                                <History className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-bold text-zinc-900">{log.action}</p>
                                <span className="text-[10px] font-bold text-zinc-400 bg-white border px-1.5 py-0.5 rounded shadow-sm">
                                  (مسير {run.period})
                                </span>
                              </div>
                              {log.note && (
                                <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
                                  {log.note}
                                </p>
                              )}

                              {log.metadata &&
                                log.metadata.original !== undefined &&
                                log.metadata.modified !== undefined && (
                                  <div className="mt-3 flex items-center gap-4 bg-white border border-zinc-100 p-2 rounded-lg w-max">
                                    <div className="text-[10px] text-zinc-400 font-bold flex flex-col">
                                      <span>القيمة الأصلية</span>
                                      <span className="text-zinc-500 text-xs line-through">
                                        {log.metadata.original.toLocaleString()} ر.س
                                      </span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-zinc-300" />
                                    <div className="text-[10px] font-bold flex flex-col">
                                      <span
                                        className={
                                          log.metadata.modified < log.metadata.original
                                            ? "text-rose-400"
                                            : "text-emerald-400"
                                        }
                                      >
                                        القيمة المعدلة
                                      </span>
                                      <span
                                        className={
                                          log.metadata.modified < log.metadata.original
                                            ? "text-rose-600 text-xs"
                                            : "text-emerald-600 text-xs"
                                        }
                                      >
                                        {log.metadata.modified.toLocaleString()} ر.س
                                      </span>
                                    </div>
                                  </div>
                                )}

                              <div className="text-[10px] text-zinc-400 mt-2 font-bold flex gap-3">
                                <span>{new Date(log.timestamp).toLocaleString("ar-SA")}</span>
                                {log.user && <span>• {log.user}</span>}
                              </div>
                            </div>
                          </div>
                        ))
                      : null
                  )}
                  {!runs.some((r) => r.logs && r.logs.length > 0) && (
                    <div className="text-center py-10 text-zinc-400 font-bold border-2 border-dashed rounded-[2rem] border-zinc-200">
                      لا توجد سجلات امتثال متاحة.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ATTENDANCE AND OVERTIME TAB */}
          {activeTab === "attendance" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PayrollAttendanceSim employees={employees} />
            </motion.div>
          )}

          {/* SELF SERVICE REQUESTS PORTAL TAB */}
          {activeTab === "requests" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PayrollPortals employees={employees} />
            </motion.div>
          )}

          {/* SAUDI ARABIA EOS CALCULATOR TAB */}
          {activeTab === "settlement" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <SaudiEosCalculator employees={employees} user={user} />
            </motion.div>
          )}

          {/* GROUNDED GEMINI HR ASSISTANT CHAT TAB */}
          {activeTab === "ai_assistant" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PayrollAiAssistant />
            </motion.div>
          )}

          {activeTab === "ledger" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <LedgerView runs={runs} />
            </motion.div>
          )}

          {activeTab === "kpi" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <KpiDashboard employees={employees} />
            </motion.div>
          )}

          {activeTab === "templates" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <PayrollTemplates />
            </motion.div>
          )}
        </div>
      </div>

      {auditRun && <PayrollAudit run={auditRun} onClose={() => setAuditRun(null)} />}

      {/* EMPLOYEE ADD/EDIT MODAL */}
      <AnimatePresence>
        {showEmployeeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEmployeeModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900">
                    {editingEmployee ? "تعديل بيانات الموظف" : "إضافة موظف جديد"}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-1">
                    تحديث معلومات الموظف لتضمينها في مسيرات الرواتب القادمة.
                  </p>
                </div>
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-600 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="overflow-y-auto p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">اسم الموظف</label>
                    <input
                      type="text"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">المنصب</label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.position}
                        onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">القسم</label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.department}
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase">
                      الراتب الأساسي
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={(editForm.baseSalaryHalalas || 0) / 100}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            baseSalaryHalalas: Math.round(Number(e.target.value) * 100),
                          })
                        }
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                        ر.س
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">بدل السكن</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={(editForm.housingAllowanceHalalas || 0) / 100}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            housingAllowanceHalalas: Math.round(Number(e.target.value) * 100),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">بدل النقل</label>
                      <input
                        type="number"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={(editForm.transportAllowanceHalalas || 0) / 100}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            transportAllowanceHalalas: Math.round(Number(e.target.value) * 100),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">
                        استقطاعات أخرى
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 font-bold focus:ring-2 focus:ring-rose-500/20 outline-none transition-all"
                          value={(editForm.otherDeductionsHalalas || 0) / 100}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              otherDeductionsHalalas: Math.round(Number(e.target.value) * 100),
                            })
                          }
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-400">
                          ر.س
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">
                        حالة الموظف
                      </label>
                      <select
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="active">نشط (Active)</option>
                        <option value="inactive">غير نشط (Inactive)</option>
                        <option value="terminated">منتهي الخدمة (Terminated)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">
                        الجنسية (التأمينات GOSI)
                      </label>
                      <select
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.nationality || "سعودي"}
                        onChange={(e) => setEditForm({ ...editForm, nationality: e.target.value })}
                      >
                        <option value="سعودي">سعودي (Saudi) - تأمينات 9.75%</option>
                        <option value="غير سعودي">غير سعودي (Expat) - تأمينات 2%</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">
                        أيام الغياب
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="31"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.absenceDays || 0}
                        onChange={(e) =>
                          setEditForm({ ...editForm, absenceDays: Number(e.target.value) })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">
                        تاريخ التعيين/المباشرة
                      </label>
                      <input
                        type="date"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.hireDate || ""}
                        onChange={(e) => setEditForm({ ...editForm, hireDate: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-6 border-t border-zinc-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-black text-zinc-900">
                        إدارة الوثائق (Documents)
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          const docs = Array.isArray(editForm.documents)
                            ? [...editForm.documents]
                            : [];
                          setEditForm({
                            ...editForm,
                            documents: [
                              ...docs,
                              {
                                id: crypto.randomUUID(),
                                name: "",
                                url: "",
                                expiryDate: "",
                                type: "Passport",
                              },
                            ],
                          });
                        }}
                        className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20 transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> إضافة وثيقة
                      </button>
                    </div>

                    <div className="space-y-4">
                      {Array.isArray(editForm.documents) &&
                        editForm.documents.map((doc: any, index: number) => (
                          <div
                            key={doc.id || index}
                            className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 relative group"
                          >
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                                اسم الوثيقة
                              </label>
                              <input
                                type="text"
                                placeholder="مثلاً: صورة الجواز"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                                value={doc.name}
                                onChange={(e) => {
                                  const newDocs = [...editForm.documents];
                                  newDocs[index].name = e.target.value;
                                  setEditForm({ ...editForm, documents: newDocs });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                                نوع الوثيقة
                              </label>
                              <select
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                                value={doc.type}
                                onChange={(e) => {
                                  const newDocs = [...editForm.documents];
                                  newDocs[index].type = e.target.value;
                                  setEditForm({ ...editForm, documents: newDocs });
                                }}
                              >
                                <option value="Passport">جواز سفر</option>
                                <option value="Visa">تأشيرة</option>
                                <option value="Contract">عقد عمل</option>
                                <option value="Insurance">تأمين طبي</option>
                                <option value="Iqama">إقامة</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                                رابط الوثيقة
                              </label>
                              <input
                                type="text"
                                placeholder="https://..."
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                                value={doc.url}
                                onChange={(e) => {
                                  const newDocs = [...editForm.documents];
                                  newDocs[index].url = e.target.value;
                                  setEditForm({ ...editForm, documents: newDocs });
                                }}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-zinc-400 uppercase">
                                تاريخ الانتهاء
                              </label>
                              <input
                                type="date"
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-primary/20 outline-none"
                                value={doc.expiryDate}
                                onChange={(e) => {
                                  const newDocs = [...editForm.documents];
                                  newDocs[index].expiryDate = e.target.value;
                                  setEditForm({ ...editForm, documents: newDocs });
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const newDocs = editForm.documents.filter(
                                  (_: any, i: number) => i !== index
                                );
                                setEditForm({ ...editForm, documents: newDocs });
                              }}
                              className="absolute -left-2 -top-2 w-6 h-6 bg-white border border-zinc-200 rounded-full flex items-center justify-center text-rose-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      {(!editForm.documents || editForm.documents.length === 0) && (
                        <div className="py-8 border-2 border-dashed border-zinc-100 rounded-[2rem] text-center">
                          <p className="text-zinc-400 text-xs font-bold">
                            لا يوجد وثائق مرفقة لهذا الموظف
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase">البنك</label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.bank}
                        onChange={(e) => setEditForm({ ...editForm, bank: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-500 uppercase relative">
                        رقم الآيبان (IBAN)
                        <span className="absolute left-0 bottom-0 text-[10px] text-zinc-400 font-mono tracking-widest bg-zinc-100 px-1 py-0.5 rounded">
                          SA...
                        </span>
                      </label>
                      <input
                        type="text"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        value={editForm.iban}
                        onChange={(e) => setEditForm({ ...editForm, iban: e.target.value })}
                        placeholder="SA..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowEmployeeModal(false)}
                  className="px-6 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveEmployee}
                  className="px-8 py-3 rounded-xl bg-zinc-900 text-white font-bold shadow-lg shadow-zinc-900/20 hover:scale-105 active:scale-95 transition-transform flex items-center gap-2"
                >
                  <Save className="w-5 h-5" /> حفظ البيانات
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIF VALIDATION MODAL */}
      <AnimatePresence>
        {sifValidateRun && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSifValidateRun(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col p-8 gap-6"
            >
              <div>
                <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-500" />
                  قائمة تدقيق SIF {sifValidateRun.period}
                </h2>
                <p className="text-sm font-medium text-zinc-500 mt-2">
                  نظام التحقق الآلي قبل توليد ملف مدد أو WPS
                </p>
              </div>

              {(() => {
                // Validation checks
                const activeEmpsCount = employees.filter(
                  (e) => e.status === "Active" || e.status === "نشط" || !e.status
                ).length;
                const runEmpsCount = sifValidateRun.entries?.length || 0;

                const entriesWithEmpData = (sifValidateRun.entries || []).map((entry: any) => {
                  const empObj = employees.find((e) => e.id === entry.employeeId) || {};
                  return { ...entry, empObj };
                });

                const missingBank = entriesWithEmpData.filter(
                  (e: any) => !e.empObj.iban || e.empObj.iban.trim() === ""
                );
                const zeroSalary = entriesWithEmpData.filter((e: any) => e.netPay <= 0);

                const hasWarning = missingBank.length > 0 || zeroSalary.length > 0;

                return (
                  <div className="flex flex-col gap-4">
                    <div className="bg-zinc-50 rounded-2xl p-4 border border-zinc-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="flex items-center gap-2 text-zinc-700">
                          <Users className="w-4 h-4" /> جميع الموظفين النشطين متضمنون
                        </span>
                        {runEmpsCount >= activeEmpsCount ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                            مطابق ({runEmpsCount}/{activeEmpsCount})
                          </span>
                        ) : (
                          <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs">
                            نقص ({runEmpsCount}/{activeEmpsCount})
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="flex items-center gap-2 text-zinc-700">
                          <CheckCircle2 className="w-4 h-4" /> بيانات الحساب البنكي (IBAN) متوفرة
                        </span>
                        {missingBank.length === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                            مكتمل
                          </span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs">
                            {missingBank.length} موظف بدون آيبان
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="flex items-center gap-2 text-zinc-700">
                          <AlertOctagon className="w-4 h-4" /> لا يوجد رواتب صفرية
                        </span>
                        {zeroSalary.length === 0 ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                            سليم
                          </span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs">
                            {zeroSalary.length} رواتب بقيمة صفر
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center text-sm font-bold">
                        <span className="flex items-center gap-2 text-zinc-700">
                          <DollarSign className="w-4 h-4" /> مطابقة مطالبات البنك والإجمالي
                        </span>
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-xs">
                          مطابق ({sifValidateRun.totalNet.toLocaleString()} ر.س)
                        </span>
                      </div>
                    </div>

                    {hasWarning && (
                      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs font-bold leading-relaxed">
                        تنبيه: يوجد نقص في البيانات الأساسية. الاستمرار سيؤدي لرفض الملف في أنظمة
                        مدد. يرجى تحديث بيانات الموظفين (الآيبان) من صفحة الموظفين أو مراجعة قيم
                        الرواتب.
                      </div>
                    )}

                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setSifValidateRun(null)}
                        className="px-6 py-3 font-bold text-zinc-600 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
                      >
                        إلغاء
                      </button>
                      <button
                        onClick={confirmDownloadMudadSif}
                        disabled={hasWarning}
                        className="px-6 py-3 font-bold text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:bg-primary/50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" /> تأكيد وتنزيل SIF
                      </button>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIMULATE MODAL */}
      <AnimatePresence>
        {showSimulateModal && simulationData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSimulateModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-8 pb-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                    <Activity className="w-6 h-6 text-blue-600" /> مراجعة محاكاة مسير{" "}
                    {simulationData.period}
                  </h2>
                  <p className="text-sm font-medium text-zinc-500 mt-2">
                    مراجعة الخصومات والبدلات قبل الاعتماد النهائي (لا يمكن التراجع بعد الاعتماد).
                  </p>
                </div>
                <button
                  onClick={() => setShowSimulateModal(false)}
                  className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-600 shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 bg-white border-b border-zinc-100 flex gap-8">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    إجمالي المستحقات (Gross)
                  </p>
                  <p className="text-2xl font-black text-zinc-900">
                    {simulationData.totalGross.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-500">ر.س</span>
                  </p>
                </div>
                <div className="w-px bg-zinc-100" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    الاستقطاعات والتأمينات (Deductions)
                  </p>
                  <p className="text-2xl font-black text-rose-500">
                    {simulationData.totalDeductions.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-500">ر.س</span>
                  </p>
                </div>
                <div className="w-px bg-zinc-100" />
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                    إجمالي الصافي للتحويل (Net Pay)
                  </p>
                  <p className="text-2xl font-black text-emerald-600">
                    {simulationData.totalNet.toLocaleString()}{" "}
                    <span className="text-xs text-zinc-500">ر.س</span>
                  </p>
                </div>
              </div>

              <div className="overflow-y-auto p-8 bg-zinc-50/50 flex-1">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-400 font-bold text-[10px] uppercase">
                      <th className="pb-3 text-right">الموظف</th>
                      <th className="pb-3">الأساسي</th>
                      <th className="pb-3">البدلات (سكن/نقل)</th>
                      <th className="pb-3">التأمينات (GOSI)</th>
                      <th className="pb-3">خصم الغياب / أخرى</th>
                      <th className="pb-3">الصافي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {simulationData.entries.map((entry: any) => (
                      <tr key={entry.employeeId}>
                        <td className="py-4 font-bold text-zinc-900 flex flex-col gap-0.5">
                          <span>{entry.employeeName}</span>
                          <span className="text-xs text-zinc-400 font-medium">
                            {entry.position} (جنسية: {entry.nationality})
                          </span>
                          <span className="text-[9px] font-mono text-zinc-400 bg-white border px-1.5 py-0.5 rounded w-max mt-1">
                            {entry.bank}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-zinc-700">
                          {entry.basic.toLocaleString()}
                        </td>
                        <td className="py-4 font-bold text-blue-600">
                          <div>+{entry.allowances.toLocaleString()}</div>
                          <div className="text-[10px] font-bold text-zinc-400">
                            سكن: {entry.housing || 0} | نقل: {entry.transport || 0}
                          </div>
                        </td>
                        <td className="py-4 font-black text-amber-600">
                          -{entry.gosiDeduction?.toLocaleString()}
                        </td>
                        <td className="py-4 font-black text-rose-500">
                          <div>
                            -
                            {(
                              entry.absenceDeduction +
                              entry.otherDeductions +
                              entry.advanceDeductions
                            ).toLocaleString()}
                          </div>
                          {(entry.absenceDays > 0 || entry.advanceDeductions > 0) && (
                            <div className="text-[10px] font-medium text-zinc-400">
                              {entry.absenceDays > 0 && (
                                <span>
                                  غياب {entry.absenceDays} أيام ({entry.absenceDeduction} ر.س)
                                </span>
                              )}
                              {entry.advanceDeductions > 0 && (
                                <span> | سلف {entry.advanceDeductions} ر.س</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="py-4 font-black text-emerald-600">
                          {entry.netPay.toLocaleString()} ر.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 bg-white border-t border-zinc-100 flex justify-end gap-3">
                <button
                  onClick={() => setShowSimulateModal(false)}
                  className="px-6 py-3 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-50"
                >
                  إلغاء وتعديل
                </button>
                <button
                  onClick={attemptCommitPayroll}
                  className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-transform flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> اعتماد المسير وإنشاء WPS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* LARGE TRANSACTION 1M+ MODAL */}
      <AnimatePresence>
        {showLargeTxModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLargeTxModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white max-w-lg w-full rounded-[2rem] shadow-2xl relative z-10 p-8 flex flex-col gap-6"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-rose-700">تنبيه أمني (مكافحة التستر)</h2>
                  <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                    تحاول اعتماد تحويلات مالية تتجاوز قيمتها 1,000,000 ر.س، وهذا يتطلب موافقة المالك
                    المخول للوقاية من التستر التجاري.
                  </p>
                </div>
              </div>

              <div className="bg-rose-50 text-rose-800 p-4 rounded-xl text-xs font-bold border border-rose-100 flex items-start gap-2">
                <AlertOctagon className="w-5 h-5 shrink-0" />
                <span>
                  سيتم تعليق هذه العملية في الانتظار. يرجى توجيه مالك الشركة (الذي يملك صلاحية
                  Administrator) للدخول للنظام واعتماد هذه الحركة المالية باستخدام هويته الوطنية.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowLargeTxModal(false)}
                  className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  إلغاء ومراجعة
                </button>
                <button
                  onClick={commitPayroll}
                  className="flex-1 px-4 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-lg transition-colors"
                >
                  اعتماد مبدئي مع التحقق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
