import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=6090a4fe"; const Fragment = __vite__cjsImport0_react_jsxDevRuntime["Fragment"]; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=6090a4fe"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react; const useEffect = __vite__cjsImport1_react["useEffect"]; const useState = __vite__cjsImport1_react["useState"];
import ComplianceDashboard from "/src/components/ComplianceDashboard.tsx";
import EmergencyLockdownIndicator from "/src/components/EmergencyLockdownIndicator.tsx";
import PayrollComplianceWidget from "/src/components/PayrollComplianceWidget.tsx";
import {
  TrendingUp,
  Users,
  FileCheck,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  History,
  Mail,
  FileText,
  Settings2,
  GripVertical,
  Eye,
  EyeOff,
  Check,
  MessageSquare,
  UserPlus,
  Package,
  X,
  Zap,
  CheckCircle2,
  Download,
  ShieldCheck,
  AlertCircle,
  Building2,
  DollarSign,
  Truck,
  Anchor,
  ShieldAlert,
  Briefcase
} from "/node_modules/.vite/deps/lucide-react.js?v=6090a4fe";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from "/node_modules/.vite/deps/recharts.js?v=6090a4fe";
import { motion, AnimatePresence, Reorder } from "/node_modules/.vite/deps/motion_react.js?v=6090a4fe";
import { cn } from "/src/lib/utils.ts";
import { Link, useLocation, useNavigate } from "/node_modules/.vite/deps/react-router-dom.js?v=6090a4fe";
import { toast } from "/node_modules/.vite/deps/sonner.js?v=6090a4fe";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  doc,
  updateDoc
} from "/node_modules/.vite/deps/firebase_firestore.js?v=6090a4fe";
import { db, auth } from "/src/lib/firebase.ts";
import { useUser } from "/src/contexts/UserContext.tsx";
import { useSettings } from "/src/contexts/SettingsContext.tsx";
import { handleFirestoreError, OperationType } from "/src/lib/firestore-issues.ts";
import { PayrollService } from "/src/services/payroll.service.ts";
import OSWorkspaceExplorer from "/src/components/OSWorkspaceExplorer.tsx";
import QuickActionsWidget from "/src/components/QuickActionsWidget.tsx";
import OnboardingWizard from "/src/components/dashboard/OnboardingWizard.tsx";
import LaunchpadOverview from "/src/components/dashboard/LaunchpadOverview.tsx";
import QuickActionsFAB from "/src/components/dashboard/QuickActionsFAB.tsx";
const DEFAULT_CONFIG = [
  { id: "business_health", title: "مؤشر صحة الأعمال الذكي (AI Health Score)", visible: true },
  { id: "intelligence", title: "توصيات مدارج الذكية للنمو", visible: true },
  { id: "quick_actions", title: "الإجراءات السريعة", visible: true },
  { id: "openwa_status", title: "حالة ربط واتساب (OpenWA)", visible: true },
  { id: "compliance", title: "لوحة الامتثال", visible: true },
  { id: "stats", title: "الإحصائيات السريعة", visible: true },
  { id: "payroll", title: "مسيرات الرواتب", visible: true },
  { id: "chart", title: "منحنى المبيعات", visible: true },
  { id: "activity", title: "النشاط الأخير", visible: true }
];
const AVAILABLE_QUICK_ACTIONS = [
  {
    id: "create_invoice",
    label: "إنشاء فاتورة",
    icon: FileText,
    path: "/app/invoices/new",
    color: "text-emerald-500",
    bg: "bg-emerald-50"
  },
  {
    id: "add_lead",
    label: "إضافة عميل محتمل",
    icon: Users,
    path: "/app/crm/new",
    color: "text-blue-500",
    bg: "bg-blue-50"
  },
  {
    id: "unread_chats",
    label: "المحادثات غير المقروءة",
    icon: MessageSquare,
    path: "/app/chat",
    color: "text-purple-500",
    bg: "bg-purple-50"
  },
  {
    id: "send_whatsapp",
    label: "إرسال رسالة واتساب",
    icon: MessageSquare,
    path: "#",
    color: "text-emerald-600",
    bg: "bg-emerald-50"
  },
  {
    id: "payroll_report",
    label: "إصدار مسير رواتب",
    icon: FileCheck,
    path: "/app/payroll/new",
    color: "text-amber-500",
    bg: "bg-amber-50"
  },
  {
    id: "add_employee",
    label: "إضافة موظف",
    icon: UserPlus,
    path: "/app/fwcos/new",
    color: "text-indigo-500",
    bg: "bg-indigo-50"
  },
  {
    id: "new_shipment",
    label: "شحنة جديدة",
    icon: Package,
    path: "/app/suppliers/new",
    color: "text-rose-500",
    bg: "bg-rose-50"
  }
];
const DEFAULT_QUICK_ACTIONS = [
  "create_invoice",
  "add_lead",
  "send_whatsapp",
  "unread_chats",
  "payroll_report"
];
export default function Dashboard() {
  const { user, updateProfile } = useUser();
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(location.state?.showWelcome || false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    if (user && user.onboarding?.completed !== true) {
      setShowOnboarding(true);
    } else {
      setShowOnboarding(false);
    }
  }, [user]);
  const handleNewInvoice = () => navigate("/app/invoices/new");
  const handleNewLead = () => navigate("/app/crm/new");
  const handleNewPayroll = () => navigate("/app/payroll/new");
  const handleNewProject = () => navigate("/app/projects/new");
  const [auditLogs, setAuditLogs] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [quickActions, setQuickActions] = useState(DEFAULT_QUICK_ACTIONS);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [whatsAppTemplate, setWhatsAppTemplate] = useState("welcome");
  const [whatsAppMessage, setWhatsAppMessage] = useState(
    "مرحباً بك في مدارج. نسعد بخدمتك وتقديم أفضل الحلول لإدارة أعمالك بنجاح. فريق المبيعات جاهز لمساعدتك."
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState("ceo");
  const [dismissedLocalAlerts, setDismissedLocalAlerts] = useState([]);
  const [waStatus, setWaStatus] = useState(
    "checking"
  );
  const [waStatusMessage, setWaStatusMessage] = useState("");
  const [queueCount, setQueueCount] = useState(0);
  const [pendingQueueCount, setPendingQueueCount] = useState(0);
  const [leads, setLeads] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [payrollRuns, setPayrollRuns] = useState([]);
  const [activeShipments, setActiveShipments] = useState([]);
  const [shipmentsCount, setShipmentsCount] = useState(0);
  const [quarterlyData, setQuarterlyData] = useState([
    { name: "الربع 1", current: 0, projected: 0 },
    { name: "الربع 2", current: 0, projected: 0 },
    { name: "الربع 3", current: 0, projected: 0 },
    { name: "الربع 4", current: 0, projected: 0 }
  ]);
  useEffect(() => {
    const quarters = [
      { name: "الربع 1", current: 0, projected: 0 },
      { name: "الربع 2", current: 0, projected: 0 },
      { name: "الربع 3", current: 0, projected: 0 },
      { name: "الربع 4", current: 0, projected: 0 }
    ];
    invoices.forEach((inv) => {
      if (!inv.issueDate) return;
      const date = new Date(inv.issueDate);
      if (isNaN(date.getTime())) return;
      const month = date.getMonth();
      const quarterIdx = Math.floor(month / 3);
      const isPaid = inv.status === "paid";
      const amount = (inv.totalAmountHalalas || 0) / 100;
      if (quarterIdx >= 0 && quarterIdx <= 3) {
        if (isPaid) {
          quarters[quarterIdx].current += amount;
        } else if (inv.status !== "cancelled") {
          quarters[quarterIdx].projected += amount;
        }
      }
    });
    leads.forEach((lead) => {
      let date = null;
      if (lead.expectedCloseDate) {
        date = new Date(lead.expectedCloseDate);
      } else if (lead.createdAt) {
        const ts = lead.createdAt.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
        date = ts;
      }
      if (!date || isNaN(date.getTime())) return;
      const month = date.getMonth();
      const quarterIdx = Math.floor(month / 3);
      const val = lead.value || lead.amount || 0;
      if (quarterIdx >= 0 && quarterIdx <= 3) {
        quarters[quarterIdx].projected += val;
      }
    });
    setQuarterlyData(quarters);
  }, [leads, invoices]);
  useEffect(() => {
    if (!user) return;
    if (user.dashboardConfig) {
      const loaded = user.dashboardConfig;
      const missing = DEFAULT_CONFIG.filter((def) => !loaded.some((l) => l.id === def.id));
      setConfig([...loaded, ...missing]);
    } else {
      setConfig(DEFAULT_CONFIG);
    }
    if (user.quickActionsConfig) {
      setQuickActions(user.quickActionsConfig);
    }
    let previousStatus = null;
    const checkStatus = async () => {
      try {
        await auth.authStateReady();
        const token = await auth.currentUser?.getIdToken();
        const res = await fetch("/api/openwa/status", {
          headers: {
            Authorization: token ? `Bearer ${token}` : ""
          }
        });
        if (res.ok) {
          const data = await res.json();
          setWaStatus(data.status);
          setWaStatusMessage(data.message || "");
          if (data.status === "disconnected") {
            if (previousStatus && previousStatus !== "disconnected") {
              toast.error(
                "تنبيه عاجل: تم انقطاع اتصال بوابة واتساب (OpenWA)! يرجى التحقق من الجلسة في الإعدادات لتفادي توقف أتمتة الرسائل.",
                {
                  duration: 8e3
                }
              );
            }
          }
          previousStatus = data.status;
        } else {
          setWaStatus("disconnected");
          setWaStatusMessage("خطأ في الاتصال بالخادم الداخلي");
          previousStatus = "disconnected";
        }
      } catch (err) {
        setWaStatus("disconnected");
        setWaStatusMessage(err.message || "فشل فحص الحالة");
        previousStatus = "disconnected";
      }
    };
    checkStatus();
    const intervalId = setInterval(checkStatus, 1e4);
    let unsubQueue = () => {
    };
    if (user.uid && user.id !== "demo-admin-uid") {
      const queueQuery = query(collection(db, "whatsapp_queue"), where("userId", "==", user.uid));
      unsubQueue = onSnapshot(
        queueQuery,
        (snapshot) => {
          setQueueCount(snapshot.size);
          const pending = snapshot.docs.filter((d) => d.data().status === "pending").length;
          setPendingQueueCount(pending);
        },
        (error) => {
          console.warn("Queue listener error (handled gracefully):", error);
        }
      );
    }
    return () => {
      clearInterval(intervalId);
      unsubQueue();
    };
  }, [user]);
  useEffect(() => {
    if (!user) return;
    const leadsQuery = query(collection(db, "leads"), where("userId", "==", user.uid));
    const unsubLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        const leadsList = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        setLeads(leadsList);
        const revenue = leadsList.reduce((acc, curr) => acc + (curr.value || 0), 0);
        const wonLeads = leadsList.filter((l) => l.status === "won").length;
        const salesByMonth = leadsList.reduce((acc, lead) => {
          if (!lead.expectedCloseDate) return acc;
          const d = new Date(lead.expectedCloseDate);
          const m = d.toLocaleString("ar-SA", { month: "short" });
          acc[m] = (acc[m] || 0) + (lead.value || 0);
          return acc;
        }, {});
        const cData = Object.keys(salesByMonth).length > 0 ? Object.keys(salesByMonth).map((k) => ({ name: k, sales: salesByMonth[k] })) : [{ name: "لا يوجد", sales: 0 }];
        setDashboardStats((prev) => ({
          ...prev,
          revenue,
          leadsCount: leadsList.length,
          wonLeads,
          chartData: cData
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "leads");
      }
    );
    const payrollQuery = query(collection(db, "payroll_runs"), where("userId", "==", user.uid));
    const unsubPayroll = onSnapshot(
      payrollQuery,
      (snapshot) => {
        const runs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        setPayrollRuns(runs);
        const totalCost = runs.reduce((acc, curr) => acc + (curr.totalGross || 0), 0);
        const sortedByPeriod = [...runs].sort(
          (a, b) => (b.period || "").localeCompare(a.period || "")
        );
        const latestPeriod = sortedByPeriod.length > 0 ? sortedByPeriod[0].period : null;
        const now = /* @__PURE__ */ new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toISOString().slice(0, 7);
        const lastRun = runs.find((r) => r.period === lastMonthStr);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const deadline = new Date(endOfLastMonth);
        deadline.setDate(deadline.getDate() + 30);
        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1e3 * 60 * 60 * 24));
        const isGenerated = lastRun ? lastRun.mudadSifGenerated || lastRun.wpsGenerated : false;
        const isLockdown = !isGenerated && daysLeft <= 0;
        setDashboardStats((prev) => ({
          ...prev,
          payrollCost: totalCost,
          recentPayroll: sortedByPeriod.slice(0, 3),
          latestPeriod,
          isLockdown,
          lockdownPeriod: lastMonthStr
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "payroll_runs");
      }
    );
    const employeesQuery = query(collection(db, "employees"), where("userId", "==", user.uid));
    const unsubEmployees = onSnapshot(
      employeesQuery,
      (snapshot) => {
        const emps = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        const saudiEmployees = emps.filter(
          (e) => e.nationality?.includes("سعودي") || e.nationality?.toLowerCase().includes("saudi")
        ).length;
        const localExpiringAlerts = [];
        emps.forEach((emp) => {
          if (emp.contractEndDate) {
            const daysLeft = (new Date(emp.contractEndDate).getTime() - Date.now()) / (1e3 * 3600 * 24);
            if (daysLeft > 0 && daysLeft <= 30) {
              localExpiringAlerts.push({
                id: `local_expr_${emp.id}`,
                title: "تنبيه انتهاء عقد",
                message: `عقد الموظف ${emp.name} ينتهي خلال ${Math.floor(daysLeft)} يوماً.`,
                type: "warning",
                isLocal: true,
                actionPath: "/app/fwcos"
              });
            }
          }
        });
        setDashboardStats((prev) => ({
          ...prev,
          employeesCount: emps.length,
          saudiEmployees,
          expiringContractsAlerts: localExpiringAlerts
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "employees");
      }
    );
    const invoicesQuery = query(collection(db, "invoices"), where("userId", "==", user.uid));
    const unsubInvoices = onSnapshot(
      invoicesQuery,
      (snapshot) => {
        const invs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        setInvoices(invs);
        const pendingInvoices = invs.filter((i) => i.status !== "paid").length;
        const vatExposure = invs.reduce((acc, i) => acc + (i.vatAmountHalalas || 0), 0) / 100;
        setDashboardStats((prev) => ({
          ...prev,
          pendingInvoices,
          vatExposure
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "invoices");
      }
    );
    const rulesQuery = query(collection(db, "compliance_rules"), where("userId", "==", user.uid));
    const unsubRules = onSnapshot(
      rulesQuery,
      (snapshot) => {
        const rules = snapshot.docs.map((doc2) => doc2.data());
        const activeRules = rules.filter((r) => r.active).length;
        const score = rules.length > 0 ? Math.round(activeRules / rules.length * 100) : 100;
        setDashboardStats((prev) => ({
          ...prev,
          complianceScore: score
        }));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "compliance_rules");
      }
    );
    const logsQuery = query(
      collection(db, "audit_logs"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const logs = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        setAuditLogs(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "audit_logs");
      }
    );
    const alertsQuery = query(
      collection(db, "system_alerts"),
      where("userId", "==", user.uid),
      where("isRead", "==", false)
    );
    const unsubAlerts = onSnapshot(
      alertsQuery,
      (snapshot) => {
        setSystemAlerts(snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "system_alerts");
      }
    );
    const shipmentsQuery = query(collection(db, "shipments"), where("userId", "==", user.uid));
    const unsubShipments = onSnapshot(
      shipmentsQuery,
      (snapshot) => {
        const shList = snapshot.docs.map((doc2) => ({ id: doc2.id, ...doc2.data() }));
        setShipmentsCount(shList.length);
        setActiveShipments(
          shList.filter((s) => s.status !== "delivered" && s.status !== "cancelled")
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "shipments");
      }
    );
    return () => {
      unsubLeads();
      unsubLogs();
      unsubAlerts();
      unsubPayroll();
      unsubRules();
      unsubEmployees();
      unsubInvoices();
      unsubShipments();
    };
  }, [user]);
  const saveConfig = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateProfile({ dashboardConfig: config });
      setIsEditing(false);
    } catch (err) {
      toast.error("فشل في حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };
  const renderStats = () => {
    if (!dashboardStats) {
      return /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "p-6 bg-white dark:bg-zinc-100/40 backdrop-blur-md rounded-3xl border border-zinc-150 dark:border-zinc-850/60 shadow-sm animate-pulse md:col-span-2", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 596,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 597,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 595,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded mt-2 mb-2" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 599,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 600,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 594,
          columnNumber: 11
        }, this),
        [1, 2].map((i) => /* @__PURE__ */ jsxDEV(
          "div",
          {
            className: "p-6 bg-white dark:bg-zinc-100/40 backdrop-blur-md rounded-3xl border border-zinc-150 dark:border-zinc-850/60 shadow-sm animate-pulse md:col-span-1",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-4", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 608,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 609,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 607,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded mt-2 mb-2" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 611,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 612,
                columnNumber: 15
              }, this)
            ]
          },
          i,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 603,
            columnNumber: 13
          },
          this
        ))
      ] }, "stats-skeleton", true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 593,
        columnNumber: 9
      }, this);
    }
    let currentStats = [];
    if (activeView === "ceo") {
      currentStats = [
        {
          id: "revenue",
          name: "الصافي المتوقع",
          value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`,
          change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر",
          trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down",
          icon: TrendingUp,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10"
        },
        {
          id: "compliance",
          name: "مؤشر الامتثال العام",
          value: `${dashboardStats?.complianceScore || 0}%`,
          change: dashboardStats?.trends?.compliance ? `${dashboardStats.trends.compliance}%` : "غير متوفر",
          trend: parseFloat(dashboardStats?.trends?.compliance || 0) >= 0 ? "up" : "down",
          icon: FileCheck,
          color: "text-blue-500",
          bg: "bg-blue-500/10"
        },
        {
          id: "payroll_cost",
          name: "تكلفة الرواتب",
          value: `${(dashboardStats?.payrollCost || 0).toLocaleString()} ر.س`,
          change: dashboardStats?.trends?.payroll ? `${dashboardStats.trends.payroll}%` : "غير متوفر",
          trend: parseFloat(dashboardStats?.trends?.payroll || 0) >= 0 ? "down" : "up",
          icon: Users,
          color: "text-amber-500",
          bg: "bg-amber-500/10"
        }
      ];
    } else if (activeView === "hr") {
      currentStats = [
        {
          id: "nitaqat",
          name: "نطاقات (نسبة التوطين)",
          value: `${((dashboardStats?.saudiEmployees || 0) / (dashboardStats?.employeesCount || 1) * 100).toFixed(1)}%`,
          change: dashboardStats?.saudiEmployees / (dashboardStats?.employeesCount || 1) > 0.3 ? "النطاق الأخضر" : "النطاق الأصفر",
          trend: "up",
          icon: Users,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10"
        },
        {
          id: "total_employees",
          name: "إجمالي الموظفين",
          value: dashboardStats?.employeesCount?.toString() || "0",
          change: dashboardStats?.employeesCount ? `${dashboardStats.employeesCount}` : "غير متوفر",
          trend: "up",
          icon: Users,
          color: "text-blue-500",
          bg: "bg-blue-500/10"
        },
        {
          id: "eosb",
          name: "التزامات نهاية الخدمة",
          value: `${((dashboardStats?.payrollCost || 0) * 0.4).toLocaleString()} ر.س`,
          change: "غير متوفر",
          trend: "down",
          icon: FileText,
          color: "text-amber-500",
          bg: "bg-amber-500/10"
        }
      ];
    } else {
      currentStats = [
        {
          id: "vat",
          name: "ضريبة القيمة المضافة",
          value: `${(dashboardStats?.vatExposure || 0).toLocaleString()} ر.س`,
          change: "غير متوفر",
          trend: "up",
          icon: FileCheck,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10"
        },
        {
          id: "invoices",
          name: "فواتير معلقة",
          value: dashboardStats?.pendingInvoices?.toString() || "0",
          change: dashboardStats?.pendingInvoices ? `${dashboardStats.pendingInvoices}` : "غير متوفر",
          trend: "down",
          icon: FileText,
          color: "text-amber-500",
          bg: "bg-amber-500/10"
        },
        {
          id: "revenue_acc",
          name: "إجمالي الإيرادات",
          value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`,
          change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر",
          trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down",
          icon: TrendingUp,
          color: "text-blue-500",
          bg: "bg-blue-500/10"
        }
      ];
    }
    return /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: currentStats.map((stat, i) => {
      const isLarge = i === 0;
      return /* @__PURE__ */ jsxDEV(
        motion.div,
        {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          whileHover: { y: -6, scale: 1.01 },
          transition: {
            opacity: { duration: 0.3, delay: i * 0.1 },
            y: { type: "spring", stiffness: 300, damping: 20 },
            scale: { duration: 0.2 }
          },
          className: cn(
            "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
            "bg-white dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20",
            isLarge ? "md:col-span-2" : "md:col-span-1"
          ),
          children: [
            isLarge && /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 757,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: cn("p-3 rounded-2xl flex items-center justify-center", stat.bg), children: /* @__PURE__ */ jsxDEV(stat.icon, { className: cn("w-6 h-6", stat.color) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 762,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 761,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    className: cn(
                      "flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl border",
                      stat.trend === "up" ? "text-emerald-600 bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/10" : "text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/10"
                    ),
                    children: [
                      stat.trend === "up" ? /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-3.5 h-3.5" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 773,
                        columnNumber: 23
                      }, this) : /* @__PURE__ */ jsxDEV(ArrowDownRight, { className: "w-3.5 h-3.5" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 775,
                        columnNumber: 23
                      }, this),
                      stat.change
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 764,
                    columnNumber: 19
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 760,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: stat.name }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 780,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: stat.value }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 783,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 759,
              columnNumber: 15
            }, this),
            isLarge && /* @__PURE__ */ jsxDEV("div", { className: "mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/40", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between text-[10px] font-black text-zinc-400 mb-1.5 uppercase tracking-wider", children: [
                /* @__PURE__ */ jsxDEV("span", { children: "معدل الأداء المستهدف" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 791,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("span", { children: "92%" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 792,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 790,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-full bg-zinc-100 dark:bg-zinc-800/60 h-2 rounded-full overflow-hidden", children: /* @__PURE__ */ jsxDEV("div", { className: "bg-emerald-500 h-full rounded-full w-[88%]" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 795,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 794,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 789,
              columnNumber: 17
            }, this)
          ]
        },
        stat.id,
        true,
        {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 739,
          columnNumber: 13
        },
        this
      );
    }) }, "stats", false, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 735,
      columnNumber: 7
    }, this);
  };
  const toggleVisibility = (id) => {
    setConfig((prev) => prev.map((w) => w.id === id ? { ...w, visible: !w.visible } : w));
  };
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case "openwa_status":
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "bg-white rounded-[2rem] border border-zinc-100 shadow-sm p-6 relative overflow-hidden",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxDEV(
                    "div",
                    {
                      className: cn(
                        "p-3 rounded-2xl shrink-0",
                        waStatus === "connected" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : waStatus === "disconnected" ? "bg-rose-50 text-rose-600 border border-rose-100" : waStatus === "disabled" ? "bg-zinc-100 text-zinc-500 border border-zinc-200" : "bg-blue-50 text-blue-600 border border-blue-100"
                      ),
                      children: /* @__PURE__ */ jsxDEV(MessageSquare, { className: "w-6 h-6" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 832,
                        columnNumber: 19
                      }, this)
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 820,
                      columnNumber: 17
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "مراقب اتصال واتساب (OpenWA)" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 835,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-400 font-bold", children: "التحقق المستمر من قنوات الربط وحالة طابور المعالجة الآلي" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 836,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 834,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 819,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 self-start sm:self-center", children: [
                  waStatus === "connected" && /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shadow-sm", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "w-2 h-2 rounded-full bg-emerald-500 animate-pulse" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 845,
                      columnNumber: 21
                    }, this),
                    "متصل حياً"
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 844,
                    columnNumber: 19
                  }, this),
                  waStatus === "disconnected" && /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200 rounded-full shadow-sm animate-pulse", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "w-2 h-2 rounded-full bg-rose-500" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 851,
                      columnNumber: 21
                    }, this),
                    "انقطع الاتصال"
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 850,
                    columnNumber: 19
                  }, this),
                  waStatus === "disabled" && /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black bg-zinc-100 text-zinc-600 border border-zinc-200 rounded-full shadow-sm", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "w-2 h-2 rounded-full bg-zinc-400" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 857,
                      columnNumber: 21
                    }, this),
                    "غير مفعّل"
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 856,
                    columnNumber: 19
                  }, this),
                  waStatus === "checking" && /* @__PURE__ */ jsxDEV("span", { className: "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-black bg-blue-50 text-blue-700 border border-blue-200 rounded-full shadow-sm", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "w-2 h-2 rounded-full bg-blue-500 animate-spin border-t-transparent border border-solid" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 863,
                      columnNumber: 21
                    }, this),
                    "جاري الفحص..."
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 862,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 842,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 818,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col justify-between", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-zinc-400 font-black tracking-wider uppercase block mb-1", children: "تفاصيل الجلسة" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 874,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold text-zinc-600 leading-relaxed", children: [
                      waStatus === "connected" && "الربط نشط حالياً وتتم مزامنة المحادثات الواردة مع الفرص البيعية فوراً.",
                      waStatus === "disconnected" && "الجلسة منقطعة حالياً. يرجى إعادة الاتصال لتفادي توقف أتمتة الردود والرسائل.",
                      waStatus === "disabled" && "ربط واتساب غير مفعل حالياً. يمكنك تفعيله من شاشة الإعدادات بضغطة زر.",
                      waStatus === "checking" && "يتم فحص خادم OpenWA والتحقق من سلامة الجلسة..."
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 877,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 873,
                    columnNumber: 17
                  }, this),
                  waStatus === "disconnected" && /* @__PURE__ */ jsxDEV(
                    Link,
                    {
                      to: "/app/settings",
                      className: "mt-4 inline-flex items-center gap-2 text-xs font-black text-rose-600 hover:gap-3 transition-all self-start",
                      children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "إعادة المسح والربط" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 892,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 893,
                          columnNumber: 21
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 888,
                      columnNumber: 19
                    },
                    this
                  ),
                  waStatus === "disabled" && /* @__PURE__ */ jsxDEV(
                    Link,
                    {
                      to: "/app/settings",
                      className: "mt-4 inline-flex items-center gap-2 text-xs font-black text-zinc-600 hover:gap-3 transition-all self-start",
                      children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "تفعيل الخدمة" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 901,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 902,
                          columnNumber: 21
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 897,
                      columnNumber: 19
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 872,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col justify-between", children: /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-zinc-400 font-black tracking-wider uppercase block mb-1", children: "طابور الرسائل (Queue)" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 910,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline gap-2 mb-1", children: [
                    /* @__PURE__ */ jsxDEV("span", { className: "text-2xl font-black text-zinc-900 font-mono", children: queueCount }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 914,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-400 font-bold", children: "مسجلة بالخادم" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 917,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 913,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed", children: "تخزين الأحداث والرسائل آلياً في Firestore لمنع فقدان البيانات عند حدوث ضغط عالٍ للرسائل قبل معالجتها." }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 919,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 909,
                  columnNumber: 17
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 908,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex flex-col justify-between", children: /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-zinc-400 font-black tracking-wider uppercase block mb-1", children: "المعالج الذكي الآلي" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 929,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "flex items-baseline gap-2 mb-1", children: [
                    /* @__PURE__ */ jsxDEV(
                      "span",
                      {
                        className: cn(
                          "text-2xl font-black font-mono",
                          pendingQueueCount > 0 ? "text-amber-600 animate-pulse" : "text-emerald-600"
                        ),
                        children: pendingQueueCount
                      },
                      void 0,
                      false,
                      {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 933,
                        columnNumber: 21
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-400 font-bold", children: "معلقة قيد المعالجة" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 941,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 932,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium leading-relaxed", children: pendingQueueCount > 0 ? "جاري الربط والتصنيف التلقائي للرسائل مع حسابات وملفات العملاء في الـ CRM حياً." : "جميع الرسائل الواردة معالجة ومؤرشفة بالكامل ومرتبطة بملفات العملاء بنجاح." }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 943,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 928,
                  columnNumber: 17
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 927,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 870,
                columnNumber: 13
              }, this)
            ]
          },
          "openwa_status",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 814,
            columnNumber: 11
          },
          this
        );
      case "business_health": {
        const health = dashboardStats?.businessHealth || {
          score: 75,
          cac: 450,
          averageAgingDays: 14,
          explanationAr: "صحة الأعمال معتدلة ومستقرة. الإيرادات تدعم استمرار النمو ولكن هناك فرصة لتحسين التدفق النقدي عبر متابعة الفواتير.",
          explanationEn: "Business health is moderate and stable. Revenue supports continued growth, but there is an opportunity to improve cash flow by following up on invoices.",
          recommendationsAr: [
            "تفعيل تذكيرات الدفع التلقائية (WhatsApp) لتقليص عمر الفواتير المعلقة.",
            "تحسين قنوات استهداف العملاء لخفض تكلفة حيازة العميل.",
            "مراجعة شروط السداد للعملاء ذوي الدفع المتأخر."
          ],
          recommendationsEn: [
            "Activate automated payment reminders (WhatsApp) to accelerate outstanding invoice collection.",
            "Optimize customer targeting channels to lower customer acquisition cost (CAC).",
            "Review credit terms for clients with repeated payment delays."
          ]
        };
        const score = health.score;
        const isAr2 = settings?.language === "ar";
        let colorClass = "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/20";
        let statusText = isAr2 ? "ممتاز جداً" : "Excellent";
        let glowColor = "rgba(16, 185, 129, 0.15)";
        if (score < 60) {
          colorClass = "text-rose-500 bg-rose-500/10 border-rose-500/20 dark:border-rose-500/20";
          statusText = isAr2 ? "بحاجة لتدخل عاجل" : "Critical Intervention Needed";
          glowColor = "rgba(239, 68, 68, 0.15)";
        } else if (score < 85) {
          colorClass = "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:border-amber-500/20";
          statusText = isAr2 ? "مستقر مع تنبيهات" : "Stable with Warnings";
          glowColor = "rgba(245, 158, 11, 0.15)";
        }
        const handleRecommendationClick = (rec) => {
          if (rec.includes("WhatsApp") || rec.includes("واتساب") || rec.includes("تحصيل") || rec.includes("collection")) {
            toast.success(
              isAr2 ? "🪄 تم تفعيل التذكيرات والمتابعات الذكية بنجاح وتوجيه العملاء المتأخرين في WhatsApp Sales Hub!" : "🪄 AI Automated follow-ups activated successfully in WhatsApp Sales Hub for all past-due invoices!"
            );
          } else {
            toast.success(
              isAr2 ? "⚙️ جاري تطبيق التوصية الإستراتيجية وتحسين نموذج حيازة العملاء..." : "⚙️ Applying strategic optimization and refining customer acquisition modeling..."
            );
          }
        };
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "bg-white dark:bg-zinc-100/40 backdrop-blur-md rounded-[2rem] border border-zinc-150 dark:border-zinc-850/60 shadow-sm p-6 relative overflow-hidden transition-all duration-300 hover:shadow-md",
            style: { boxShadow: `0 10px 30px -10px ${glowColor}` },
            children: [
              /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none",
                  style: {
                    backgroundColor: score < 60 ? "#f43f5e" : score < 85 ? "#f59e0b" : "#10b981"
                  }
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1023,
                  columnNumber: 13
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col lg:flex-row items-center gap-6 relative z-10", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center justify-center shrink-0 w-full lg:w-48 p-4 bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl border border-zinc-100 dark:border-zinc-800", children: [
                  /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-2", children: isAr2 ? "مؤشر صحة الأعمال" : "Business Health" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1033,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "relative w-28 h-28 flex items-center justify-center", children: [
                    /* @__PURE__ */ jsxDEV("svg", { className: "w-full h-full transform -rotate-90", viewBox: "0 0 100 100", children: [
                      /* @__PURE__ */ jsxDEV(
                        "circle",
                        {
                          cx: "50",
                          cy: "50",
                          r: "40",
                          fill: "transparent",
                          stroke: "rgba(228, 228, 231, 0.4)",
                          strokeWidth: "10"
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1041,
                          columnNumber: 21
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        "circle",
                        {
                          cx: "50",
                          cy: "50",
                          r: "40",
                          fill: "transparent",
                          stroke: score < 60 ? "#f43f5e" : score < 85 ? "#f59e0b" : "#10b981",
                          strokeWidth: "10",
                          strokeDasharray: "251.2",
                          strokeDashoffset: 251.2 - 251.2 * score / 100,
                          strokeLinecap: "round"
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1050,
                          columnNumber: 21
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1039,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 flex flex-col items-center justify-center", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "text-3xl font-black font-mono text-zinc-900 dark:text-zinc-100", children: score }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1063,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black text-zinc-400", children: "/ 100" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1066,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1062,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1038,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    "span",
                    {
                      className: cn(
                        "mt-3 px-2.5 py-1 rounded-full text-[10px] font-black border",
                        colorClass
                      ),
                      children: statusText
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1070,
                      columnNumber: 17
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1032,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex-1 space-y-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 mb-1.5", children: [
                      /* @__PURE__ */ jsxDEV("span", { className: "flex h-2 w-2 relative", children: [
                        /* @__PURE__ */ jsxDEV("span", { className: "animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1085,
                          columnNumber: 23
                        }, this),
                        /* @__PURE__ */ jsxDEV("span", { className: "relative inline-flex rounded-full h-2 w-2 bg-indigo-500" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1086,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1084,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("h3", { className: "text-sm font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1", children: [
                        /* @__PURE__ */ jsxDEV(Zap, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1089,
                          columnNumber: 23
                        }, this),
                        isAr2 ? "تحليل الذكاء الاصطناعي الفوري" : "Real-time AI Business Analysis"
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1088,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1083,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-relaxed", children: isAr2 ? health.explanationAr : health.explanationEn }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1093,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1082,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800", children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "text-[9px] font-black text-zinc-400 mb-0.5", children: isAr2 ? "اتجاه الإيرادات" : "Revenue Trend" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1101,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "p",
                        {
                          className: cn(
                            "text-xs font-bold font-mono",
                            parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                          ),
                          children: [
                            parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "+" : "",
                            dashboardStats?.trends?.revenue || 0,
                            "%"
                          ]
                        },
                        void 0,
                        true,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1104,
                          columnNumber: 21
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1100,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center border-x border-zinc-200/60 dark:border-zinc-800/60", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "text-[9px] font-black text-zinc-400 mb-0.5", children: isAr2 ? "تكلفة حيازة العميل" : "Customer Acquisition" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1117,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400", children: [
                        health.cac.toLocaleString(),
                        " ",
                        /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-normal", children: isAr2 ? "ر.س" : "SAR" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1122,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1120,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1116,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "text-[9px] font-black text-zinc-400 mb-0.5", children: isAr2 ? "متوسط عمر الفواتير" : "Invoice Aging" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1126,
                        columnNumber: 21
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold font-mono text-amber-600", children: [
                        health.averageAgingDays,
                        " ",
                        /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-normal", children: isAr2 ? "يوم" : "days" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1131,
                          columnNumber: 23
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1129,
                        columnNumber: 21
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1125,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1099,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                    /* @__PURE__ */ jsxDEV("h4", { className: "text-[10px] font-black text-zinc-400 uppercase tracking-wider", children: isAr2 ? "التوصيات المقترحة من مدارج للتحسين بنقرة واحدة:" : "Actionable AI recommendations to improve:" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1138,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: (isAr2 ? health.recommendationsAr : health.recommendationsEn).map(
                      (rec, idx) => /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          onClick: () => handleRecommendationClick(rec),
                          className: "p-2.5 bg-white dark:bg-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold text-right rtl:text-right ltr:text-left hover:border-indigo-500 dark:hover:border-indigo-500 transition-all shadow-xxs hover:shadow-xs flex items-center justify-between group",
                          children: [
                            /* @__PURE__ */ jsxDEV("span", { className: "flex-1 leading-tight", children: rec }, void 0, false, {
                              fileName: "/app/applet/src/pages/Dashboard.tsx",
                              lineNumber: 1152,
                              columnNumber: 27
                            }, this),
                            /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-500 shrink-0 mx-1" }, void 0, false, {
                              fileName: "/app/applet/src/pages/Dashboard.tsx",
                              lineNumber: 1153,
                              columnNumber: 27
                            }, this)
                          ]
                        },
                        idx,
                        true,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1146,
                          columnNumber: 25
                        },
                        this
                      )
                    ) }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1143,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1137,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1081,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1030,
                columnNumber: 13
              }, this)
            ]
          },
          "business_health",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1017,
            columnNumber: 11
          },
          this
        );
      }
      case "intelligence":
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 shadow-sm p-6 relative overflow-hidden",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1171,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center justify-between mb-8 relative z-10", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/10 rotate-3", children: /* @__PURE__ */ jsxDEV(
                    "svg",
                    {
                      width: "28",
                      height: "28",
                      viewBox: "0 0 24 24",
                      fill: "none",
                      stroke: "currentColor",
                      strokeWidth: "2.5",
                      strokeLinecap: "round",
                      strokeLinejoin: "round",
                      className: "text-primary",
                      children: [
                        /* @__PURE__ */ jsxDEV("path", { d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1187,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M5 3v4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1188,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M19 17v4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1189,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M3 5h4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1190,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV("path", { d: "M17 19h4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1191,
                          columnNumber: 21
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1176,
                      columnNumber: 19
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1175,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-2xl text-zinc-900 tracking-tight mb-1", children: "محرك ذكاء مدارج للنمو (AI)" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1195,
                      columnNumber: 19
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-black text-primary tracking-widest uppercase", children: "توصيات مدارج الذكية المخصصة لك لتسريع المبيعات هذا الربع" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1198,
                      columnNumber: 19
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1194,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1174,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/integrations",
                    className: "hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm",
                    children: [
                      "تصفح سوق التطبيقات المجاني",
                      /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1208,
                        columnNumber: 17
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1203,
                    columnNumber: 15
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1173,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10", children: [
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/settings",
                    className: "bg-white p-6 rounded-3xl border border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group flex flex-col justify-between",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", { children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-4", children: [
                          /* @__PURE__ */ jsxDEV("div", { className: "p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100", children: /* @__PURE__ */ jsxDEV(MessageSquare, { className: "w-5 h-5" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1220,
                            columnNumber: 23
                          }, this) }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1219,
                            columnNumber: 21
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-100 shadow-sm", children: "عائد فوري" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1222,
                            columnNumber: 21
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1218,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("h4", { className: "font-black text-zinc-900 mb-2", children: "أتمتة الواتساب + CRM" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1226,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed font-medium", children: "لديك 12 عميل محتمل لم يتم متابعتهم. تفعيل ردود الواتساب التلقائية المدعومة من مدارج سيزيد نسبة الإغلاق بـ 40٪ فوراً." }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1227,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1217,
                        columnNumber: 17
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex items-center gap-2 text-xs font-black text-rose-600 group-hover:gap-3 transition-all", children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "تفعيل مجاني الآن" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1233,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1234,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1232,
                        columnNumber: 17
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1213,
                    columnNumber: 15
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/integrations",
                    className: "bg-white p-6 rounded-3xl border border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group flex flex-col justify-between",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", { children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-4", children: [
                          /* @__PURE__ */ jsxDEV("div", { className: "p-2 bg-blue-50 text-blue-500 rounded-xl border border-blue-100", children: /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-5 h-5" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1245,
                            columnNumber: 23
                          }, this) }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1244,
                            columnNumber: 21
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100 shadow-sm", children: "حماية الثروة" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1247,
                            columnNumber: 21
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1243,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("h4", { className: "font-black text-zinc-900 mb-2", children: "الربط المباشر بـ ZATCA" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1251,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed font-medium", children: "تفادى الغرامات المدمّرة للمنشآت الناشئة. استخدم الربط المتكامل والمجاني مع هيئة الزكاة (المرحلة 2) من مدارج بضغطة زر." }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1252,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1242,
                        columnNumber: 17
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex items-center gap-2 text-xs font-black text-blue-600 group-hover:gap-3 transition-all", children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "بدء الربط مجاناً" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1258,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1259,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1257,
                        columnNumber: 17
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1238,
                    columnNumber: 15
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/settings",
                    className: "bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden text-white",
                    children: [
                      /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl pointer-events-none" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1267,
                        columnNumber: 17
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "relative z-10", children: [
                        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-4", children: [
                          /* @__PURE__ */ jsxDEV("div", { className: "p-2 bg-white/10 text-white rounded-xl border border-white/5 backdrop-blur-md", children: /* @__PURE__ */ jsxDEV(Zap, { className: "w-5 h-5" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1271,
                            columnNumber: 23
                          }, this) }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1270,
                            columnNumber: 21
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)]", children: "برنامج الشركاء" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 1273,
                            columnNumber: 21
                          }, this)
                        ] }, void 0, true, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1269,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("h4", { className: "font-black text-white mb-2 text-lg", children: "دعوة الموردين للشبكة" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1277,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-400 leading-relaxed font-medium", children: "شارك مدارج مع 3 من مورديك أو عملائك واستفد من 3 أشهر مجانية من باقة Premium + تفعيل مزامنة الفواتير المشتركة بينهم." }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1278,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1268,
                        columnNumber: 17
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex items-center gap-2 text-xs font-black text-primary group-hover:gap-3 transition-all relative z-10", children: [
                        /* @__PURE__ */ jsxDEV("span", { children: "انسخ رابط الإحالة" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1284,
                          columnNumber: 19
                        }, this),
                        /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1285,
                          columnNumber: 19
                        }, this)
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1283,
                        columnNumber: 17
                      }, this)
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1263,
                    columnNumber: 15
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1212,
                columnNumber: 13
              }, this)
            ]
          },
          "intelligence",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1167,
            columnNumber: 11
          },
          this
        );
      case "quick_actions":
        return /* @__PURE__ */ jsxDEV(
          QuickActionsWidget,
          {
            quickActions,
            setQuickActions,
            user,
            updateProfile,
            leads
          },
          "quick_actions",
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1293,
            columnNumber: 11
          },
          this
        );
      case "compliance":
        return /* @__PURE__ */ jsxDEV(ComplianceDashboard, {}, "compliance", false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1303,
          columnNumber: 16
        }, this);
      case "stats":
        return renderStats();
      case "payroll":
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "p-6 border-b border-zinc-100 flex justify-between items-center bg-gray-50/50", children: [
                /* @__PURE__ */ jsxDEV("div", { children: [
                  /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-black text-zinc-900", children: "مسيرات الرواتب الأخيرة" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1314,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-zinc-500", children: "موجز مسيرات الرواتب الحديثة وحالتها" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1315,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1313,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2", children: [
                  dashboardStats?.latestPeriod && /* @__PURE__ */ jsxDEV(
                    "button",
                    {
                      onClick: async () => {
                        try {
                          if (!user) return;
                          const { data } = await PayrollService.batchGenerateMudadSIF(
                            user.uid,
                            dashboardStats.latestPeriod
                          );
                          const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.setAttribute("href", url);
                          link.setAttribute(
                            "download",
                            `BATCH_SIF_MUDAD_${dashboardStats.latestPeriod}.sif`
                          );
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        } catch (e) {
                          console.error(e);
                        }
                      },
                      className: "text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-2",
                      children: [
                        /* @__PURE__ */ jsxDEV(Download, { className: "w-3.5 h-3.5" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1347,
                          columnNumber: 21
                        }, this),
                        " تحميل SIF (",
                        dashboardStats.latestPeriod,
                        ")"
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1321,
                      columnNumber: 19
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV("button", { className: "text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors", children: "عرض الكل" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1350,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1319,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1312,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-right text-sm", children: [
                /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "bg-white text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]", children: [
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4", children: "رقم المسير" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1359,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4", children: "الشهر" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1360,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4", children: "الحالة" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1361,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4", children: "تاريخ الاعتماد" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1362,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4", children: "الموظفين" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1363,
                    columnNumber: 21
                  }, this),
                  /* @__PURE__ */ jsxDEV("th", { className: "px-6 py-4 text-left", children: "إجمالي الصافي" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1364,
                    columnNumber: 21
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1358,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1357,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("tbody", { className: "divide-y divide-zinc-100", children: !dashboardStats ? [1, 2, 3].map((i) => /* @__PURE__ */ jsxDEV("tr", { className: "animate-pulse", children: [
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-16" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1372,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1371,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-12" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1375,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1374,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-6 bg-zinc-200 rounded-lg w-14" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1378,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1377,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-20" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1381,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1380,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-8" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1384,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1383,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-24 ml-auto" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1387,
                    columnNumber: 27
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1386,
                    columnNumber: 25
                  }, this)
                ] }, i, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1370,
                  columnNumber: 23
                }, this)) : dashboardStats.recentPayroll?.length > 0 ? dashboardStats.recentPayroll.map((run, idx) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-zinc-50 transition-colors", children: [
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 font-mono font-bold text-zinc-900", children: run.id.substring(0, 8) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1394,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 font-bold text-zinc-700", children: run.period }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1397,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxDEV(
                    "span",
                    {
                      className: cn(
                        "px-2 py-1 rounded-lg text-xs font-bold",
                        run.status === "processed" ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"
                      ),
                      children: run.status === "processed" ? "معتمد" : "مكتمل"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1399,
                      columnNumber: 27
                    },
                    this
                  ) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1398,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 text-zinc-500 font-medium", children: new Date(run.processedDate || run.createdAt).toLocaleDateString("ar-SA") }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1410,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 text-zinc-500 font-bold", children: run.entries?.length || 0 }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1413,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("td", { className: "px-6 py-4 font-black text-zinc-900 text-left", children: [
                    run.totalNet.toLocaleString(),
                    " ر.س"
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1416,
                    columnNumber: 25
                  }, this)
                ] }, run.id || idx, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1393,
                  columnNumber: 23
                }, this)) : /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV(
                  "td",
                  {
                    colSpan: 6,
                    className: "py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]",
                    children: "لا توجد مسيرات رواتب أخيرة"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1423,
                    columnNumber: 23
                  },
                  this
                ) }, "empty-payroll-recent", false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1422,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1367,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1356,
                columnNumber: 15
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1355,
                columnNumber: 13
              }, this)
            ]
          },
          "payroll",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1308,
            columnNumber: 11
          },
          this
        );
      case "chart":
        if (activeView === "ceo") {
          return /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[400px] lg:col-span-2", children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "font-bold text-lg mb-6", children: "نمو الإيرادات المتوقع (المبيعات)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1441,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-full h-full pb-8", children: /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDEV(BarChart, { data: quarterlyData, children: [
                /* @__PURE__ */ jsxDEV(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f0f0f0" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1445,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  XAxis,
                  {
                    dataKey: "name",
                    axisLine: false,
                    tickLine: false,
                    tick: { fill: "#a1a1aa", fontSize: 10 },
                    dy: 10
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1446,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(YAxis, { hide: true, domain: ["auto", "auto"] }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1453,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Tooltip,
                  {
                    cursor: { fill: "#f4f4f5" },
                    contentStyle: {
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      direction: "rtl",
                      textAlign: "right"
                    },
                    formatter: (value) => [`${value.toLocaleString()} ر.س`, ""]
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1454,
                    columnNumber: 23
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(Legend, { wrapperStyle: { fontSize: "12px", paddingTop: "10px" } }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1465,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(Bar, { dataKey: "current", name: "المحقق", fill: "#3b82f6", radius: [4, 4, 0, 0] }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1466,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Bar,
                  {
                    dataKey: "projected",
                    name: "المتوقع (الفرص)",
                    fill: "#bfdbfe",
                    radius: [4, 4, 0, 0]
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1467,
                    columnNumber: 23
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1444,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1443,
                columnNumber: 19
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1442,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1440,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col gap-6", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex-1", children: [
                /* @__PURE__ */ jsxDEV("h3", { className: "font-bold text-sm mb-4", children: "مؤشر الامتثال العام" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1480,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "h-[120px]", children: /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDEV(PieChart, { children: [
                  /* @__PURE__ */ jsxDEV(
                    Pie,
                    {
                      data: [
                        { name: "ممتثل", value: dashboardStats?.complianceScore || 0 },
                        { name: "مخاطر", value: 100 - (dashboardStats?.complianceScore || 0) }
                      ],
                      innerRadius: 40,
                      outerRadius: 55,
                      paddingAngle: 2,
                      dataKey: "value",
                      children: [
                        /* @__PURE__ */ jsxDEV(Cell, { fill: "#10b981" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1494,
                          columnNumber: 27
                        }, this),
                        /* @__PURE__ */ jsxDEV(Cell, { fill: "#f43f5e" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1495,
                          columnNumber: 27
                        }, this)
                      ]
                    },
                    void 0,
                    true,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1484,
                      columnNumber: 25
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(Tooltip, { contentStyle: { direction: "rtl", borderRadius: "8px" } }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1497,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1483,
                  columnNumber: 23
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1482,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1481,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-center mt-2", children: /* @__PURE__ */ jsxDEV("span", { className: "text-3xl font-black text-emerald-500", children: [
                  dashboardStats?.complianceScore || 0,
                  "%"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1502,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1501,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1479,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex-1", children: [
                /* @__PURE__ */ jsxDEV("h3", { className: "font-bold text-sm mb-4", children: "تكلفة الرواتب" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1509,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "h-[100px]", children: /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDEV(
                  LineChart,
                  {
                    data: dashboardStats?.chartData?.slice(-3).map((d, i) => ({
                      name: d.name,
                      cost: (dashboardStats?.payrollCost || 0) * (0.9 + i * 0.05)
                    })) || [],
                    children: [
                      /* @__PURE__ */ jsxDEV(
                        Line,
                        {
                          type: "monotone",
                          dataKey: "cost",
                          stroke: "#f59e0b",
                          strokeWidth: 3,
                          dot: false
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1520,
                          columnNumber: 25
                        },
                        this
                      ),
                      /* @__PURE__ */ jsxDEV(
                        Tooltip,
                        {
                          formatter: (val) => [
                            `${Math.round(val).toLocaleString()} ر.س`,
                            "التكلفة"
                          ],
                          contentStyle: { direction: "rtl", borderRadius: "8px" }
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1527,
                          columnNumber: 25
                        },
                        this
                      )
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1512,
                    columnNumber: 23
                  },
                  this
                ) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1511,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1510,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "text-sm font-bold text-zinc-500 mt-2 text-center", children: [
                  dashboardStats?.trends?.payroll >= 0 ? "اتجاه مستقر" : "انخفاض تدريجي",
                  " (",
                  dashboardStats?.trends?.payroll || 0,
                  "%)"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1537,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1508,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1478,
              columnNumber: 15
            }, this)
          ] }, "chart", true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1439,
            columnNumber: 13
          }, this);
        }
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[400px]",
            children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "font-bold text-lg mb-6", children: "منحنى المبيعات" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1552,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-full h-full pb-8", children: !dashboardStats ? /* @__PURE__ */ jsxDEV("div", { className: "w-full h-full bg-zinc-100 animate-pulse rounded-2xl" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1555,
                columnNumber: 17
              }, this) : /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDEV(AreaChart, { data: dashboardStats?.chartData || [], children: [
                /* @__PURE__ */ jsxDEV("defs", { children: /* @__PURE__ */ jsxDEV("linearGradient", { id: "colorSales", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                  /* @__PURE__ */ jsxDEV("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.1 }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1561,
                    columnNumber: 25
                  }, this),
                  /* @__PURE__ */ jsxDEV("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1562,
                    columnNumber: 25
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1560,
                  columnNumber: 23
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1559,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(CartesianGrid, { strokeDasharray: "3 3", vertical: false, stroke: "#f0f0f0" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1565,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  XAxis,
                  {
                    dataKey: "name",
                    axisLine: false,
                    tickLine: false,
                    tick: { fill: "#a1a1aa", fontSize: 10 },
                    dy: 10
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1566,
                    columnNumber: 21
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(YAxis, { hide: true, domain: ["auto", "auto"] }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1573,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Tooltip,
                  {
                    contentStyle: {
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                      direction: "rtl",
                      textAlign: "right"
                    },
                    formatter: (value) => [`${value.toLocaleString()} ر.س`, "المبيعات"]
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1574,
                    columnNumber: 21
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  Area,
                  {
                    type: "monotone",
                    dataKey: "sales",
                    stroke: "#10b981",
                    strokeWidth: 3,
                    fillOpacity: 1,
                    fill: "url(#colorSales)"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1584,
                    columnNumber: 21
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1558,
                columnNumber: 19
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1557,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1553,
                columnNumber: 13
              }, this)
            ]
          },
          "chart",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1548,
            columnNumber: 11
          },
          this
        );
      case "activity":
        return /* @__PURE__ */ jsxDEV(
          "section",
          {
            className: "p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
                /* @__PURE__ */ jsxDEV("h3", { className: "font-bold text-lg", children: "النشاط الأخير" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1605,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV(Link, { to: "/app/settings", className: "text-xs font-bold text-primary hover:underline", children: "عرض الكل" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1606,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1604,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "space-y-6", children: !dashboardStats && auditLogs.length === 0 ? [1, 2, 3, 4].map((i) => /* @__PURE__ */ jsxDEV("div", { className: "flex gap-4 items-start pb-4 animate-pulse", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 rounded-xl bg-zinc-200 flex-shrink-0" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1614,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "space-y-2 flex-1 pt-1", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "h-4 bg-zinc-200 rounded w-1/2" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1616,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "h-3 bg-zinc-200 rounded w-1/4" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1617,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1615,
                  columnNumber: 21
                }, this)
              ] }, i, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1613,
                columnNumber: 19
              }, this)) : (dashboardStats?.recentLogs || auditLogs).length === 0 ? /* @__PURE__ */ jsxDEV("div", { className: "text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest", children: "لا توجد نشاطات" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1622,
                columnNumber: 17
              }, this) : (dashboardStats?.recentLogs || auditLogs).map((log) => /* @__PURE__ */ jsxDEV(
                "div",
                {
                  className: "flex gap-4 items-start pb-4 border-b border-zinc-50 last:border-0 last:pb-0 group",
                  children: [
                    /* @__PURE__ */ jsxDEV(
                      "div",
                      {
                        className: cn(
                          "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border",
                          log.module === "CRM" ? "bg-blue-50 text-blue-600 border-blue-100" : log.module === "INVOICE" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-zinc-100 text-zinc-400 border-zinc-200"
                        ),
                        children: log.module === "EMAIL" ? /* @__PURE__ */ jsxDEV(Mail, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1642,
                          columnNumber: 25
                        }, this) : log.module === "INVOICE" ? /* @__PURE__ */ jsxDEV(FileText, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1644,
                          columnNumber: 25
                        }, this) : /* @__PURE__ */ jsxDEV(History, { className: "w-4 h-4" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 1646,
                          columnNumber: 25
                        }, this)
                      },
                      void 0,
                      false,
                      {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1631,
                        columnNumber: 21
                      },
                      this
                    ),
                    /* @__PURE__ */ jsxDEV("div", { children: [
                      /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-bold text-zinc-900 line-clamp-1", children: log.action || log.payload?.action || `نشاط في ${log.module}` }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1650,
                        columnNumber: 23
                      }, this),
                      /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-0.5 font-medium", children: [
                        new Date(log.timestamp).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit"
                        }),
                        " ",
                        "• ",
                        log.user?.name || "النظام"
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 1653,
                        columnNumber: 23
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1649,
                      columnNumber: 21
                    }, this)
                  ]
                },
                log.id,
                true,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1627,
                  columnNumber: 19
                },
                this
              )) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1610,
                columnNumber: 13
              }, this)
            ]
          },
          "activity",
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1600,
            columnNumber: 11
          },
          this
        );
      default:
        return null;
    }
  };
  const renderHRView = () => {
    const saudiCount = dashboardStats?.saudiEmployees || 0;
    const totalCount = dashboardStats?.employeesCount || 0;
    const expatCount = totalCount - saudiCount;
    const saudizationPct = totalCount > 0 ? saudiCount / totalCount * 100 : 0;
    let nitaqatLabel = "أحمر";
    let nitaqatColorClass = "text-rose-600 bg-rose-500/10 border-rose-200/20";
    if (saudizationPct >= 30) {
      nitaqatLabel = "أخضر مرتفع";
      nitaqatColorClass = "text-emerald-700 bg-emerald-500/10 border-emerald-200/20";
    } else if (saudizationPct >= 15) {
      nitaqatLabel = "أخضر منخفض";
      nitaqatColorClass = "text-green-700 bg-green-500/10 border-green-200/20";
    } else if (saudizationPct > 0) {
      nitaqatLabel = "أصفر";
      nitaqatColorClass = "text-amber-700 bg-amber-500/10 border-amber-200/20";
    }
    return /* @__PURE__ */ jsxDEV("div", { className: "space-y-8 animate-fade-in", dir: isAr ? "rtl" : "ltr", children: [
      /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1701,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-emerald-500/10", children: /* @__PURE__ */ jsxDEV(Users, { className: "w-6 h-6 text-emerald-500" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1705,
                    columnNumber: 19
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1704,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(
                    "span",
                    {
                      className: cn(
                        "px-2.5 py-1 rounded-xl text-xs font-black border uppercase tracking-wider",
                        nitaqatColorClass
                      ),
                      children: nitaqatLabel
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1707,
                      columnNumber: 17
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1703,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "نطاقات وتوطين الكوادر (Nitaqat)" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1716,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("h3", { className: "text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                  saudizationPct.toFixed(1),
                  "%"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1719,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("div", { className: "mt-6 flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800", children: [
                  /* @__PURE__ */ jsxDEV(
                    "div",
                    {
                      style: { width: `${saudizationPct}%` },
                      className: "bg-emerald-500 h-full rounded-full"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1723,
                      columnNumber: 17
                    },
                    this
                  ),
                  /* @__PURE__ */ jsxDEV(
                    "div",
                    {
                      style: { width: `${100 - saudizationPct}%` },
                      className: "bg-zinc-200 dark:bg-zinc-750 h-full rounded-full"
                    },
                    void 0,
                    false,
                    {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1727,
                      columnNumber: 17
                    },
                    this
                  )
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1722,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: [
                  "سعودي: ",
                  saudiCount,
                  " | وافد: ",
                  expatCount
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1732,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1702,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1696,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-blue-500/10", children: /* @__PURE__ */ jsxDEV(Briefcase, { className: "w-6 h-6 text-blue-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1746,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1745,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10", children: "نشطين" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1748,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1744,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "قوة العمل الحالية (Headcount)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1752,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                totalCount,
                " موظف"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1755,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "عقود موثقة ومطابقة في قوى" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1758,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1743,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1738,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-amber-500/10", children: /* @__PURE__ */ jsxDEV(DollarSign, { className: "w-6 h-6 text-amber-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1772,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1771,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10", children: "موازنة الأجور" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1774,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1770,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "الأجور الشهرية (Payroll)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1778,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                (dashboardStats?.payrollCost || 0).toLocaleString(),
                " ر.س"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1781,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "شامل الأساسي والبدلات" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1784,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1769,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1764,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 1695,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV(OSWorkspaceExplorer, {}, void 0, false, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 1792,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1796,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 mb-6 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10", children: /* @__PURE__ */ jsxDEV(Zap, { className: "w-6 h-6 text-primary" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1799,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1798,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-xl text-zinc-900", children: "مساعد شؤون الموظفين الذكي (HR Advisory)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1802,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold text-primary", children: "توصيات حية لتحسين امتثال الموارد البشرية وتفادي مخالفات الأجور" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1805,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1801,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1797,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100", children: "قوى Qiwa" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1814,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "عقود العمل الرقمية الموحدة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1817,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "تطالب وزارة الموارد البشرية بتغطية 100% من عقود الموظفين رقمياً على منصة قوى. قم بتسجيل وتوثيق العقود فوراً لتجنب إيقاف الاستقدام." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1818,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1813,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/fwcos",
                className: "mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "الذهاب لإدارة العقود" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1827,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1828,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1823,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1812,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100", children: "صندوق هدف" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1834,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "تنمية الكوادر الوطنية" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1837,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "معدل التوطين الحالي لديك يسمح لك بالاستفادة من برامج دعم أجور المواطنين بنسب تصل إلى 50٪ لمدد تصل إلى سنتين. قدم عبر برامج صندوق هدف الآن." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1838,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1833,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              "a",
              {
                href: "https://hrdf.org.sa",
                target: "_blank",
                rel: "noreferrer",
                className: "mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "تصفح برامج دعم هدف" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1849,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1850,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1843,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1832,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: `text-[9px] font-black px-2 py-0.5 rounded-full border ${saudizationPct < 20 ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-zinc-50 text-zinc-600 border-zinc-200"}`,
                  children: "تحكم نطاقات"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1856,
                  columnNumber: 17
                },
                this
              ),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "موازنة التوطين العاجلة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1861,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: saudizationPct < 20 ? "أنت حالياً في نطاق حرج. توظيف شخص سعودي إضافي سينقل منصتك فوراً إلى النطاق الأخضر الآمن ويفتح لك ميزات الاستقدام ونقل الكفالة." : "لقد نجحت في الحفاظ على النطاق الأخضر الآمن. استمر في الالتزام لتأهيل شركتك للحصول على مناقصات حكومية متميزة." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1862,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1855,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/fwcos/new",
                className: "mt-4 text-xs font-black text-rose-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "تسجيل موظف جديد" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1872,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1873,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1868,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1854,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1811,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 1795,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "lg:col-span-7", children: /* @__PURE__ */ jsxDEV(ComplianceDashboard, {}, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1882,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1881,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "lg:col-span-5", children: /* @__PURE__ */ jsxDEV(PayrollComplianceWidget, { runs: payrollRuns }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1885,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1884,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 1880,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-3xl border border-zinc-100 shadow-sm p-6", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "تنبيهات عقود العمل والإقامات" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1895,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium", children: "عقود شارفت على الانتهاء تتطلب إجراءً فورياً لتلافي الإيقاف" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1896,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1894,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/app/fwcos", className: "text-xs font-bold text-primary hover:underline", children: "إدارة الكادر" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1900,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1893,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: dashboardStats?.expiringContractsAlerts?.length > 0 ? dashboardStats.expiringContractsAlerts.map((alert) => /* @__PURE__ */ jsxDEV(
            "div",
            {
              className: "p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex justify-between items-center",
              children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxDEV(AlertCircle, { className: "w-5 h-5 animate-pulse" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1914,
                    columnNumber: 25
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1913,
                    columnNumber: 23
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-bold text-zinc-900", children: alert.message }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1917,
                      columnNumber: 25
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-0.5", children: "موعد التجديد المقترح: قبل 10 أيام من الانتهاء" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 1918,
                      columnNumber: 25
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1916,
                    columnNumber: 23
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1912,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/fwcos",
                    className: "bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-700 transition",
                    children: "تجديد الآن"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1923,
                    columnNumber: 21
                  },
                  this
                )
              ]
            },
            alert.id,
            true,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1908,
              columnNumber: 19
            },
            this
          )) : /* @__PURE__ */ jsxDEV("div", { className: "text-center py-16", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3", children: /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-6 h-6" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1934,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1933,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 text-xs font-bold uppercase tracking-widest leading-none", children: "مؤشر أمان العقود مستقر وممتاز" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1936,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-400 text-[10px] font-medium mt-1", children: "لا توجد عقود تنتهي خلال الـ 30 يوماً القادمة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1939,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1932,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1905,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1892,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "مسيرات رواتب الكادر (الأخيرة)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1951,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium", children: "سجلات الصرف الشهرية المعتمدة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1952,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1950,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(Link, { to: "/app/payroll", className: "text-xs font-bold text-primary hover:underline", children: "كل المسيرات" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1954,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1949,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-right text-sm", children: [
            /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[10px]", children: [
              /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-right", children: "الفترة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1963,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "الموظفين" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1964,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "الصرف المعتمد" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1965,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-left", children: "أوامر SIF" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1966,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1962,
              columnNumber: 19
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1961,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV("tbody", { className: "divide-y divide-zinc-100", children: [
              payrollRuns?.slice(0, 4).map((run, idx) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-zinc-50/50 transition-colors", children: [
                /* @__PURE__ */ jsxDEV("td", { className: "py-3 font-bold text-zinc-800", children: run.period }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1972,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-500 font-bold", children: run.entries?.length || 0 }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1973,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center font-bold text-zinc-950", children: [
                  run.totalNet?.toLocaleString() || run.totalGross?.toLocaleString(),
                  " ر.س"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1976,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-left", children: /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: async () => {
                      try {
                        if (!user) return;
                        const { data } = await PayrollService.batchGenerateMudadSIF(
                          user.uid,
                          run.period
                        );
                        const blob = new Blob([data], { type: "text/csv;charset=utf-8;" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.setAttribute("href", url);
                        link.setAttribute("download", `WPS_SIF_${run.period}.sif`);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success("تم توليد وتحميل ملف SIF لمدد بنجاح");
                      } catch (e) {
                        toast.error("فشل في استخراج ملف مدد");
                      }
                    },
                    className: "text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors inline-flex items-center gap-1",
                    children: [
                      /* @__PURE__ */ jsxDEV(Download, { className: "w-3 h-3" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 2003,
                        columnNumber: 27
                      }, this),
                      " SIF"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 1980,
                    columnNumber: 25
                  },
                  this
                ) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 1979,
                  columnNumber: 23
                }, this)
              ] }, run.id || idx, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 1971,
                columnNumber: 21
              }, this)),
              (!payrollRuns || payrollRuns.length === 0) && /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV(
                "td",
                {
                  colSpan: 4,
                  className: "py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest",
                  children: "لا توجد مسيرات مسجلة حتى الآن"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2010,
                  columnNumber: 23
                },
                this
              ) }, "empty-payroll-runs", false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2009,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 1969,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1960,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 1959,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 1948,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 1890,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 1693,
      columnNumber: 7
    }, this);
  };
  const renderAccountingView = () => {
    const collectedVat = dashboardStats?.vatExposure || 0;
    const pendingInvoicesCount = invoices.filter(
      (i) => i.status !== "paid" && i.status !== "cancelled"
    ).length;
    const totalPendingAmountAr = invoices.filter((i) => i.status !== "paid" && i.status !== "cancelled").reduce((acc, i) => acc + (i.totalAmountHalalas || 0), 0) / 100;
    const paidInvoicesAmount = invoices.filter((i) => i.status === "paid").reduce((acc, i) => acc + (i.totalAmountHalalas || 0), 0) / 100;
    return /* @__PURE__ */ jsxDEV("div", { className: "space-y-8 animate-fade-in", dir: isAr ? "rtl" : "ltr", children: [
      /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2054,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-amber-500/10", children: /* @__PURE__ */ jsxDEV(DollarSign, { className: "w-6 h-6 text-amber-500" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2058,
                    columnNumber: 19
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2057,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10", children: "هيئة الزكاة (VAT)" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2060,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2056,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "التزامات ضريبة القيمة المضافة (Collected VAT)" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2064,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("h3", { className: "text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                  collectedVat.toLocaleString(),
                  " ر.س"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2067,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "يُحتسب تراكمياً ومباشرةً من الفواتير الصادرة للعملاء بمعدل 15٪" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2070,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2055,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2049,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-rose-500/10", children: /* @__PURE__ */ jsxDEV(FileText, { className: "w-6 h-6 text-rose-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2084,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2083,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10 animate-pulse", children: [
                  pendingInvoicesCount,
                  " معلقة"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2086,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2082,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "المدفوعات المستحقة للتحصيل (Receivables)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2090,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                totalPendingAmountAr.toLocaleString(),
                " ر.س"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2093,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "فواتير بانتظار السداد أو التسوية للمرحلة 2" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2096,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2081,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2076,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-emerald-500/10", children: /* @__PURE__ */ jsxDEV(TrendingUp, { className: "w-6 h-6 text-emerald-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2110,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2109,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10", children: "سيولة محققة" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2112,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2108,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "إجمالي كشوف الإيرادات المصونة (Paid Cash)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2116,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                paidInvoicesAmount.toLocaleString(),
                " ر.س"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2119,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "التدفقات النقدية الداخلة التي طابقت بنجاح" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2122,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2107,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2102,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2048,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2131,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 mb-6 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10", children: /* @__PURE__ */ jsxDEV(Zap, { className: "w-6 h-6 text-primary" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2134,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2133,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-xl text-zinc-900", children: "محرك الرقابة والامتثال الضريبي (ZATCA Advisory)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2137,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold text-primary", children: "توصيات حية للامتثال لمتطلبات الفوترة الإلكترونية والتقارير المالية للربع الحالي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2140,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2136,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2132,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100", children: "هيئة الزكاة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2149,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "الربط الإلكتروني للمرحلة الثانية" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2152,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "يتيح لك نظام مدارج إرسال فواتيرك مباشرة إلى بورتال فاتورة (ZATCA) لحظياً باستخدام التوقيعات الرقمية المشفرة. فعل التكامل وتخلص من القلق تماماً." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2155,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2148,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/integrations",
                className: "mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "تفعيل ربط ZATCA" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2164,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2165,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2160,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2147,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100", children: "التدفق المالي" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2171,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "تحصيل المبالغ المستحقة المتأخرة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2174,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "متوسط فترات السداد من عملائك ارتفعت بمعدل 5 أيام. أتمتة إرسال رسائل التذكير بالفواتير عبر مدارج يقلل الذمم المدينة بنسبة 25%." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2177,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2170,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/invoices",
                className: "mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "فحص الفواتير المعلقة" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2186,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2187,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2182,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2169,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100", children: "الإقرار الضريبي" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2193,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "أرشفة وحساب الإقرار بضغطة زر" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2196,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "قاربت نهاية الفترة الضريبية الحالية. نظام الفرز الآلي في مدارج يسمح لك بمشاهدة وتحميل تقرير الإقرارات الربع سنوي المدقق المتوافق مع متطلبات الهيئة." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2197,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2192,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/analytics",
                className: "mt-4 text-xs font-black text-purple-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "توليد تقرير الإقرار الضريبي" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2206,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2207,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2202,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2191,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2146,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2130,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-6", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[380px] lg:col-span-8 flex flex-col", children: [
          /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-zinc-900 text-lg mb-1", children: "تطور الفوترة ومتحصلات السيولة" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2217,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-400 font-bold mb-6", children: "قيمة الفواتير الصادرة المعتمدة مقارنةً بالمتحصلات الفعلية شهرياً" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2218,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "h-full pb-6", children: /* @__PURE__ */ jsxDEV(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxDEV(AreaChart, { data: quarterlyData, children: [
            /* @__PURE__ */ jsxDEV("defs", { children: [
              /* @__PURE__ */ jsxDEV("linearGradient", { id: "paidGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsxDEV("stop", { offset: "5%", stopColor: "#10b981", stopOpacity: 0.15 }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2226,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("stop", { offset: "95%", stopColor: "#10b981", stopOpacity: 0 }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2227,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2225,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("linearGradient", { id: "pendingGrad", x1: "0", y1: "0", x2: "0", y2: "1", children: [
                /* @__PURE__ */ jsxDEV("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.15 }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2230,
                  columnNumber: 23
                }, this),
                /* @__PURE__ */ jsxDEV("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2231,
                  columnNumber: 23
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2229,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2224,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(XAxis, { dataKey: "name", tick: { fill: "#a1a1aa", fontSize: 10 } }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2234,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Tooltip, { formatter: (value) => [`${value.toLocaleString()} ر.س`, ""] }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2235,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(CartesianGrid, { strokeDasharray: "3 3", stroke: "#f4f4f5", vertical: false }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2236,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(Legend, { wrapperStyle: { fontSize: 12 } }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2237,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV(
              Area,
              {
                type: "monotone",
                dataKey: "current",
                name: "المتحصل الفعلي",
                stroke: "#10b981",
                strokeWidth: 3,
                fill: "url(#paidGrad)"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2238,
                columnNumber: 19
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              Area,
              {
                type: "monotone",
                dataKey: "projected",
                name: "تحت التحصيل / ذمم",
                stroke: "#3b82f6",
                strokeWidth: 3,
                fill: "url(#pendingGrad)"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2246,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2223,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2222,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2221,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2216,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm lg:col-span-4 flex flex-col justify-between", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-zinc-900 text-base mb-1", children: "تدقيق الضوابط والامتثال المالي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2262,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-[11px] text-zinc-400 font-bold mb-4", children: "قائمة التحقق التفاعلية لسلامة الدفاتر" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2265,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("div", { className: "space-y-3.5 pt-2", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2272,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2271,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-600 font-bold", children: "تطابق الرقم الضريبي VAT ومرحلة ZATCA 2" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2274,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2270,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2280,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2279,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-600 font-bold", children: "ترميز المنتجات وإشعارات الخصم الضريبية" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2282,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2278,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2288,
                  columnNumber: 21
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2287,
                  columnNumber: 19
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-600 font-bold", children: "تسوية كشوف الأجور ومطابقتها لمسيرات تأمينات" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2290,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2286,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                collectedVat > 0 ? /* @__PURE__ */ jsxDEV("div", { className: "p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0", children: /* @__PURE__ */ jsxDEV(Check, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2297,
                  columnNumber: 23
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2296,
                  columnNumber: 21
                }, this) : /* @__PURE__ */ jsxDEV("div", { className: "p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0", children: /* @__PURE__ */ jsxDEV(AlertCircle, { className: "w-3.5 h-3.5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2301,
                  columnNumber: 23
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2300,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs text-zinc-600 font-bold", children: "احتساب الفروقات الضريبية للداخلة والمخرجات" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2304,
                  columnNumber: 19
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2294,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2269,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2261,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "border-t border-zinc-100 pt-4 mt-6", children: [
            /* @__PURE__ */ jsxDEV("span", { className: "text-[10px] text-zinc-400 font-black tracking-widest uppercase block mb-1", children: "الرتبة في شبكة مدارجOS" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2312,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-black text-emerald-600 flex items-center gap-1", children: [
              /* @__PURE__ */ jsxDEV("span", { children: "شركة مؤهلة وممتثلة بالكامل" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2316,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV(ShieldCheck, { className: "w-4 h-4" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2317,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2315,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2311,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2260,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2214,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "دفتر فواتير المبيعات الصادرة (المتكامل)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2327,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium", children: "سجلات فواتيرك الصادرة من صفحة الفواتير في النظام مجلوبة حياً" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2330,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2326,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Link, { to: "/app/invoices", className: "text-xs font-bold text-primary hover:underline", children: "إدارة الفواتير" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2334,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2325,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-right text-sm", children: [
          /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]", children: [
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-right", children: "رقم الفاتورة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2343,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-right", children: "العميل" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2344,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "التاريخ" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2345,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "مبلغ الضريبة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2346,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "المجموع الكلي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2347,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "الحالة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2348,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-left", children: "أوامر" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2349,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2342,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2341,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("tbody", { className: "divide-y divide-zinc-100", children: [
            invoices?.slice(0, 5).map((inv, idx) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-zinc-50/50 transition-colors", children: [
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 font-mono font-bold text-zinc-800", children: [
                "#",
                inv.invoiceNumber || inv.id?.substring(0, 6)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2355,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 font-bold text-zinc-950", children: inv.customerName || "عميل غير محدد" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2358,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-500 font-bold", children: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString("ar-SA") : "-" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2361,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-500 font-bold", children: [
                ((inv.vatAmountHalalas || 0) / 100).toLocaleString(),
                " ر.س"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2364,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center font-black text-zinc-950", children: [
                ((inv.totalAmountHalalas || 0) / 100).toLocaleString(),
                " ر.س"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2367,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center", children: /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border",
                    inv.status === "paid" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : inv.status === "sent" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-zinc-50 text-zinc-600 border-zinc-100"
                  ),
                  children: inv.status === "paid" ? "مدفوعة" : inv.status === "sent" ? "مرسلة" : "غير مدفوعة"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2371,
                  columnNumber: 23
                },
                this
              ) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2370,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-left", children: /* @__PURE__ */ jsxDEV(
                Link,
                {
                  to: `/invoice/${inv.id || inv.invoiceNumber}`,
                  target: "_blank",
                  className: "text-[11px] font-black text-blue-600 hover:underline",
                  children: "عرض للطباعة"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2389,
                  columnNumber: 23
                },
                this
              ) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2388,
                columnNumber: 21
              }, this)
            ] }, inv.id || idx, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2354,
              columnNumber: 19
            }, this)),
            (!invoices || invoices.length === 0) && /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV(
              "td",
              {
                colSpan: 7,
                className: "py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest",
                children: "لا توجد فواتير صادرة مسجلة في النظام"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2401,
                columnNumber: 21
              },
              this
            ) }, "empty-invoices-ledger", false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2400,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2352,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2340,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2339,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2324,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2046,
      columnNumber: 7
    }, this);
  };
  const renderOperationsView = () => {
    return /* @__PURE__ */ jsxDEV("div", { className: "space-y-8 animate-fade-in", dir: isAr ? "rtl" : "ltr", children: [
      /* @__PURE__ */ jsxDEV("section", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2427,
                columnNumber: 13
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                  /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-rose-500/10", children: /* @__PURE__ */ jsxDEV(Truck, { className: "w-6 h-6 text-rose-500" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2431,
                    columnNumber: 19
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2430,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10 animate-pulse", children: "قيد التتبع" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2433,
                    columnNumber: 17
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2429,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "إجمالي الشحنات النشطة (Active Shipments)" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2437,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("h3", { className: "text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                  activeShipments.length,
                  " شحنة جارية"
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2440,
                  columnNumber: 15
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "شحنات دولية مفعّل لها تتبع الحاويات وبوالص الشحن عبر المنافذ" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2443,
                  columnNumber: 15
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2428,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2422,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-blue-500/10", children: /* @__PURE__ */ jsxDEV(Anchor, { className: "w-6 h-6 text-blue-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2457,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2456,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10", children: "جاهز ومطابق" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2459,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2455,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "سجلات الاستيراد الموثقة (Historical)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2463,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: [
                shipmentsCount,
                " شحنة إجمالية"
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2466,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "بين المخلص والناقل والمستودعات في الرياض" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2469,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2454,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2449,
            columnNumber: 11
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            whileHover: { y: -6, scale: 1.01 },
            transition: { type: "spring", stiffness: 300, damping: 20 },
            className: "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-100/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1",
            children: /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-start mb-6", children: [
                /* @__PURE__ */ jsxDEV("div", { className: "p-3 rounded-2xl bg-amber-500/10", children: /* @__PURE__ */ jsxDEV(ShieldAlert, { className: "w-6 h-6 text-amber-500" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2483,
                  columnNumber: 19
                }, this) }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2482,
                  columnNumber: 17
                }, this),
                /* @__PURE__ */ jsxDEV("span", { className: "text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10", children: "مطابق لفسح" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2485,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2481,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1", children: "مخلصين جمارك معتمدين (Brokers linked)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2489,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h3", { className: "text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight", children: "3 مخلصين نشطين" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2492,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold", children: "مرتبطين بفسح الجمركية بالسعودية" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2495,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2480,
              columnNumber: 13
            }, this)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2475,
            columnNumber: 11
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2421,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2504,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 mb-6 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10", children: /* @__PURE__ */ jsxDEV(Zap, { className: "w-6 h-6 text-primary" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2507,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2506,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-xl text-zinc-900", children: "مساعد اللوجستية الذكي (Operations Advisory)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2510,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold text-primary", children: "توصيات حية لتمثيل سلاسل التوريد وتتبع خطوط الشحن البحري والجوي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2513,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2509,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2505,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100", children: "فسح (Fasah)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2522,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "تطابق البيان الجمركي لفسح" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2525,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "تأكد من إدراج رقم السجل التجاري والرمز الجمركي الموحد في حسابك لتفادي حدوث تعليق المعاملات اللوجستية في الموانئ السعودية عن طريق ربط منصة فسح." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2526,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2521,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/suppliers",
                className: "mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "تعديل السجل الجمركي" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2535,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2536,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2531,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2520,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100", children: "سلاسل الإمداد" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2542,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "جدولة شحنات الصين والخليج" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2545,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "تم رصد تأخير بنسبة 4 أيام في موانئ الشحن المغادرة من جنوب شرق آسيا. ننصح بطلب زيادة الكمية الاحتياطية لتفادي نفاد المخزون هذا الشهر." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2546,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2541,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/suppliers/new",
                className: "mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "طلب وإضافة شحنة جديدة" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2555,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2556,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2551,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2540,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between", children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("span", { className: "text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100", children: "إدارة المستودعات" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2562,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-zinc-900 mt-2 mb-1", children: "تسوية توريد البضائع المستلمة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2565,
                columnNumber: 17
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 leading-relaxed", children: "بمجرد وصول الشحنة، يسمح لك مدارج بإنشاء مطابقة فواتير مشتركة وتحويل الفواتير الأجنبية بعملات متعددة (USD, RMB, SAR) بذكاء وامتثال ضريبي." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2566,
                columnNumber: 17
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2561,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: "/app/suppliers",
                className: "mt-4 text-xs font-black text-purple-600 flex items-center gap-1 group",
                children: [
                  /* @__PURE__ */ jsxDEV("span", { children: "الذهاب لإدارة الموردين" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2575,
                    columnNumber: 17
                  }, this),
                  /* @__PURE__ */ jsxDEV(ArrowUpRight, { className: "w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2576,
                    columnNumber: 17
                  }, this)
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2571,
                columnNumber: 15
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2560,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2519,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2503,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-3xl border border-zinc-100 shadow-sm p-6", children: [
        /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900 mb-1", children: "خط سير الشحنات الدولي النشط (Transit Maps)" }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2584,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium mb-6", children: "مراقب المسار المباشر للحاويات من ميناء التصدير لبلد المنشأ وحتى التسليم بالمستودعات" }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2587,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "relative p-6 pt-12 md:p-12 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2592,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center text-center relative z-10 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors", children: /* @__PURE__ */ jsxDEV(Anchor, { className: "w-6 h-6" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2597,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2596,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-sm text-zinc-800 mt-3", children: "ميناء المنشأ الدولي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2599,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-1 w-32 font-bold", children: "تحميل الشحنة وإتمام الجمارك بالخارج" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2600,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2595,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block flex-1 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 relative z-10", children: /* @__PURE__ */ jsxDEV("div", { className: "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full animate-ping" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2607,
            columnNumber: 15
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2606,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center text-center relative z-10 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-14 h-14 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 text-white flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(Truck, { className: "w-6 h-6 animate-pulse" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2613,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2612,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-sm text-zinc-800 mt-3", children: "عرض البحر (In Oceans)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2615,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-1 w-32 font-bold", children: "بين المحيطات وخطوط الملاحة البحري" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2616,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2611,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block flex-1 h-1 bg-gradient-to-r from-blue-500 to-zinc-300 relative z-10" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2622,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center text-center relative z-10 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors", children: /* @__PURE__ */ jsxDEV(Building2, { className: "w-6 h-6" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2627,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2626,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-sm text-zinc-800 mt-3", children: "التخليص الجمركي السعودي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2629,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-1 w-32 font-bold", children: "ميناء الوصول بجدة / الدمام (فسح)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2630,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2625,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "hidden md:block flex-1 h-1 bg-zinc-300 relative z-10" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2636,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex flex-col items-center text-center relative z-10 group", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors", children: /* @__PURE__ */ jsxDEV(Package, { className: "w-6 h-6" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2641,
              columnNumber: 17
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2640,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("h4", { className: "font-bold text-sm text-zinc-800 mt-3", children: "المستودعات المركزية (SAR)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2643,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-[10px] text-zinc-400 mt-1 w-32 font-bold", children: "الاستلام والمطابقة وحساب التكلفة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2644,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2639,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2591,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2583,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("section", { className: "bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden", children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6", children: [
          /* @__PURE__ */ jsxDEV("div", { children: [
            /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "سجل الشحنات وسلاسل التوريد (المتصل)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2655,
              columnNumber: 15
            }, this),
            /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-500 font-medium", children: "قائمة الشحنات قيد التشغيل المجلوبة من قاعدة البيانات مباشرة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2658,
              columnNumber: 15
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2654,
            columnNumber: 13
          }, this),
          /* @__PURE__ */ jsxDEV(Link, { to: "/app/suppliers", className: "text-xs font-bold text-primary hover:underline", children: "مراجعة الموردين والشحنات" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2662,
            columnNumber: 13
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2653,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxDEV("table", { className: "w-full text-right text-sm", children: [
          /* @__PURE__ */ jsxDEV("thead", { children: /* @__PURE__ */ jsxDEV("tr", { className: "text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]", children: [
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-right", children: "رقم الشحنة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2671,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-right", children: "ميناء المنشأ" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2672,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "ميناء الوصول (المملكة)" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2673,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "الناقل الدولي" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2674,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "تاريخ التوصيل المتوقع" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2675,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-center", children: "الحالة" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2676,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("th", { className: "pb-3 text-left", children: "تفاصيل" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2677,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2670,
            columnNumber: 17
          }, this) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2669,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("tbody", { className: "divide-y divide-zinc-100", children: [
            activeShipments?.slice(0, 5).map((ship, idx) => /* @__PURE__ */ jsxDEV("tr", { className: "hover:bg-zinc-50/50 transition-colors", children: [
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 font-mono font-bold text-zinc-800", children: [
                "#",
                ship.id?.substring(0, 6).toUpperCase()
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2683,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 font-bold text-zinc-950", children: ship.originPort || "ميناء غير محدد" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2686,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-700 font-bold", children: ship.destinationPort || "ميناء المملكة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2689,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-500 font-bold", children: ship.carrier || "ميرسك / ناقل لوجستي" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2692,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center text-zinc-500 font-bold", children: ship.expectedDelivery ? new Date(ship.expectedDelivery).toLocaleDateString("ar-SA") : "-" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2695,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-center", children: /* @__PURE__ */ jsxDEV(
                "span",
                {
                  className: cn(
                    "px-2.5 py-1 rounded-lg text-xs font-bold border",
                    ship.status === "in_transit" ? "bg-blue-50 text-blue-700 border-blue-100" : ship.status === "customs" ? "bg-amber-50 text-amber-700 border-amber-100" : ship.status === "delivered" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-zinc-50 text-zinc-600 border-zinc-100"
                  ),
                  children: ship.status === "in_transit" ? "في عرض البحر" : ship.status === "customs" ? "جمارك" : "تم الاستلام"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2701,
                  columnNumber: 23
                },
                this
              ) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2700,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("td", { className: "py-3 text-left", children: /* @__PURE__ */ jsxDEV(
                Link,
                {
                  to: `/app/suppliers`,
                  className: "text-[11px] font-black text-blue-600 hover:underline",
                  children: "عرض وتحديث"
                },
                void 0,
                false,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2721,
                  columnNumber: 23
                },
                this
              ) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2720,
                columnNumber: 21
              }, this)
            ] }, ship.id || idx, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2682,
              columnNumber: 19
            }, this)),
            (!activeShipments || activeShipments.length === 0) && /* @__PURE__ */ jsxDEV("tr", { children: /* @__PURE__ */ jsxDEV(
              "td",
              {
                colSpan: 7,
                className: "py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest",
                children: "لا توجد شحنات لوجستية نشطة جارية حالياً"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2732,
                columnNumber: 21
              },
              this
            ) }, "empty-shipments-ops", false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2731,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2680,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2668,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2667,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2652,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2419,
      columnNumber: 7
    }, this);
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "space-y-8 max-w-7xl mx-auto pb-20", children: [
    /* @__PURE__ */ jsxDEV(EmergencyLockdownIndicator, { navigateToPayroll: () => navigate("/app/payroll") }, void 0, false, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2750,
      columnNumber: 7
    }, this),
    waStatus === "disconnected" && /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "bg-rose-50 border border-rose-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden",
        dir: isAr ? "rtl" : "ltr",
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-[40px] pointer-events-none" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2759,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 relative z-10 w-full md:w-auto", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-200", children: /* @__PURE__ */ jsxDEV(ShieldAlert, { className: "w-6 h-6 animate-pulse" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2762,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2761,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-black text-rose-900 mb-1", children: "تنبيه عاجل: بوابة واتساب (OpenWA) غير متصلة!" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2765,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-bold text-rose-700", children: "جاري توقف أتمتة الردود وحملات الرسائل والمزامنة التلقائية مع CRM بسبب انقطاع الجلسة." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2768,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2764,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2760,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 relative z-10 w-full md:w-auto shrink-0", children: /* @__PURE__ */ jsxDEV(
            Link,
            {
              to: "/app/settings",
              className: "w-full md:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-rose-600/10",
              children: [
                /* @__PURE__ */ jsxDEV(Zap, { className: "w-4 h-4" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2778,
                  columnNumber: 15
                }, this),
                "إعادة الاتصال ومسح الـ QR"
              ]
            },
            void 0,
            true,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2774,
              columnNumber: 13
            },
            this
          ) }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2773,
            columnNumber: 11
          }, this)
        ]
      },
      void 0,
      true,
      {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2753,
        columnNumber: 9
      },
      this
    ),
    [...systemAlerts, ...dashboardStats?.expiringContractsAlerts || []].filter(
      (a) => !dismissedLocalAlerts.includes(a.id)
    ).length > 0 && /* @__PURE__ */ jsxDEV("div", { className: "space-y-4", children: [...systemAlerts, ...dashboardStats?.expiringContractsAlerts || []].filter((a) => !dismissedLocalAlerts.includes(a.id)).map((alert) => /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        className: "bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden",
        dir: isAr ? "rtl" : "ltr",
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2799,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4 relative z-10 w-full md:w-auto", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200", children: /* @__PURE__ */ jsxDEV(AlertCircle, { className: "w-6 h-6 animate-pulse" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2802,
              columnNumber: 21
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2801,
              columnNumber: 19
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h3", { className: "text-lg font-black text-amber-900 mb-1", children: alert.title }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2805,
                columnNumber: 21
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-bold text-amber-700", children: alert.message }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2806,
                columnNumber: 21
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2804,
              columnNumber: 19
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2800,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-2 relative z-10 w-full md:w-auto shrink-0", children: [
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: async () => {
                  if (!alert.isLocal) {
                    try {
                      await updateDoc(doc(db, "system_alerts", alert.id), { isRead: true });
                    } catch (e) {
                    }
                  } else {
                    setDismissedLocalAlerts((prev) => [...prev, alert.id]);
                  }
                },
                className: "w-full md:w-auto px-5 py-2.5 bg-white text-amber-600 font-bold text-sm rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2",
                children: [
                  /* @__PURE__ */ jsxDEV(Check, { className: "w-4 h-4" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 2822,
                    columnNumber: 21
                  }, this),
                  "تعليم كمقروء"
                ]
              },
              void 0,
              true,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2810,
                columnNumber: 19
              },
              this
            ),
            /* @__PURE__ */ jsxDEV(
              Link,
              {
                to: alert.actionPath || "/app/payroll",
                className: "w-full md:w-auto text-center bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-amber-700 transition",
                children: alert.isLocal ? "مراجعة الموظفين" : "انتقال"
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2825,
                columnNumber: 19
              },
              this
            )
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2809,
            columnNumber: 17
          }, this)
        ]
      },
      alert.id,
      true,
      {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2792,
        columnNumber: 15
      },
      this
    )) }, void 0, false, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2788,
      columnNumber: 9
    }, this),
    dashboardStats?.isLockdown && /* @__PURE__ */ jsxDEV(
      motion.div,
      {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        className: "bg-rose-600 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-rose-200",
        children: [
          /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-4", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "bg-white/20 p-4 rounded-full animate-pulse", children: /* @__PURE__ */ jsxDEV(ShieldCheck, { className: "w-8 h-8" }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2845,
              columnNumber: 15
            }, this) }, void 0, false, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2844,
              columnNumber: 13
            }, this),
            /* @__PURE__ */ jsxDEV("div", { children: [
              /* @__PURE__ */ jsxDEV("h2", { className: "text-xl font-black mb-1", children: "حالة طوارئ: إيقاف الخدمات (Emergency Lockdown)" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2848,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-rose-100", children: [
                "تم تجاوز المدة النظامية (15 يوم) لاعتماد ورفع مسير الرواتب لشهر",
                " ",
                dashboardStats.lockdownPeriod,
                ". بعض الخدمات ستظل مقيدة إلى حين المعالجة بملف WPS أو مدد."
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2851,
                columnNumber: 15
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2847,
              columnNumber: 13
            }, this)
          ] }, void 0, true, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2843,
            columnNumber: 11
          }, this),
          /* @__PURE__ */ jsxDEV(
            Link,
            {
              to: "/app/payroll",
              className: "shrink-0 bg-white text-rose-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2",
              children: "الانتقال للرواتب للمعالجة"
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2858,
              columnNumber: 11
            },
            this
          )
        ]
      },
      void 0,
      true,
      {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2838,
        columnNumber: 9
      },
      this
    ),
    /* @__PURE__ */ jsxDEV("header", { className: "flex flex-col md:flex-row justify-between items-start md:items-end gap-4", children: [
      /* @__PURE__ */ jsxDEV("div", { children: [
        /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-3xl font-bold text-zinc-900 tracking-tight", children: "نظرة عامة" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2870,
            columnNumber: 13
          }, this),
          isEditing && /* @__PURE__ */ jsxDEV("span", { className: "bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none border border-amber-200", children: "وضع التخصيص" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2872,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2869,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ jsxDEV("p", { className: "text-zinc-500 mt-1 mb-4", children: "مرحباً بك مجدداً، إليك أحدث نشاطات عملك اليوم." }, void 0, false, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2877,
          columnNumber: 11
        }, this),
        !isEditing && /* @__PURE__ */ jsxDEV("div", { className: "flex bg-zinc-100 p-1 rounded-2xl flex-wrap gap-1 md:w-fit", children: [
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveView("ceo"),
              className: cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeView === "ceo" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              ),
              children: "نظرة الإدارة (CEO)"
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2881,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveView("hr"),
              className: cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeView === "hr" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              ),
              children: "شؤون الموظفين (HR)"
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2892,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveView("accountant"),
              className: cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeView === "accountant" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              ),
              children: "المحاسبة والمالية"
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2903,
              columnNumber: 15
            },
            this
          ),
          /* @__PURE__ */ jsxDEV(
            "button",
            {
              onClick: () => setActiveView("operations"),
              className: cn(
                "px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeView === "operations" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
              ),
              children: "التشغيل وسلاسل الإمداد"
            },
            void 0,
            false,
            {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2914,
              columnNumber: 15
            },
            this
          )
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2880,
          columnNumber: 13
        }, this)
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2868,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3 w-full md:w-auto", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => isEditing ? saveConfig() : setIsEditing(true),
            disabled: isSaving,
            className: cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
              isEditing ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-zinc-100"
            ),
            children: [
              isSaving ? /* @__PURE__ */ jsxDEV("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2940,
                columnNumber: 15
              }, this) : isEditing ? /* @__PURE__ */ jsxDEV(Check, { className: "w-5 h-5" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2942,
                columnNumber: 15
              }, this) : /* @__PURE__ */ jsxDEV(Settings2, { className: "w-5 h-5" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2944,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("span", { children: isEditing ? "حفظ التغييرات" : "تخصيص الواجهة" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2946,
                columnNumber: 13
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2929,
            columnNumber: 11
          },
          this
        ),
        !isEditing && /* @__PURE__ */ jsxDEV("button", { className: "flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all", children: [
          /* @__PURE__ */ jsxDEV(Plus, { className: "w-5 h-5" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2950,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ jsxDEV("span", { children: "إجراء جديد" }, void 0, false, {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2951,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2949,
          columnNumber: 13
        }, this),
        isEditing && /* @__PURE__ */ jsxDEV(
          "button",
          {
            onClick: () => {
              setIsEditing(false);
            },
            className: "px-6 py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all",
            children: "إلغاء"
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 2955,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2928,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2867,
      columnNumber: 7
    }, this),
    isEditing ? /* @__PURE__ */ jsxDEV("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-sm font-medium", children: "يمكنك سحب وإفلات العناصر لتغيير ترتيبها، أو استخدام أيقونة العين لإخفاء/إظهار العناصر." }, void 0, false, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2969,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ jsxDEV(Reorder.Group, { axis: "y", values: config, onReorder: setConfig, className: "space-y-4", children: config.map((item) => /* @__PURE__ */ jsxDEV(
        Reorder.Item,
        {
          value: item,
          className: cn(
            "bg-white border p-6 rounded-3xl flex items-center justify-between shadow-sm transition-all",
            item.visible ? "border-zinc-200" : "opacity-50 border-dashed border-zinc-300 bg-zinc-50"
          ),
          children: [
            /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-6", children: [
              /* @__PURE__ */ jsxDEV("div", { className: "cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors", children: /* @__PURE__ */ jsxDEV(GripVertical, { className: "w-6 h-6" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2986,
                columnNumber: 21
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2985,
                columnNumber: 19
              }, this),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV("h4", { className: "text-lg font-black text-zinc-900", children: item.title }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2989,
                  columnNumber: 21
                }, this),
                /* @__PURE__ */ jsxDEV("p", { className: "text-xs text-zinc-400 font-medium", children: item.visible ? "مرئي في اللوحة الرئيسية" : "مخفي من اللوحة الرئيسية" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 2990,
                  columnNumber: 21
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2988,
                columnNumber: 19
              }, this)
            ] }, void 0, true, {
              fileName: "/app/applet/src/pages/Dashboard.tsx",
              lineNumber: 2984,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ jsxDEV(
              "button",
              {
                onClick: () => toggleVisibility(item.id),
                className: cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  item.visible ? "bg-primary/10 text-primary" : "bg-zinc-200 text-zinc-500"
                ),
                children: item.visible ? /* @__PURE__ */ jsxDEV(Eye, { className: "w-5 h-5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 3002,
                  columnNumber: 35
                }, this) : /* @__PURE__ */ jsxDEV(EyeOff, { className: "w-5 h-5" }, void 0, false, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 3002,
                  columnNumber: 65
                }, this)
              },
              void 0,
              false,
              {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 2995,
                columnNumber: 17
              },
              this
            )
          ]
        },
        item.id,
        true,
        {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 2974,
          columnNumber: 15
        },
        this
      )) }, void 0, false, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 2972,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 2968,
      columnNumber: 9
    }, this) : /* @__PURE__ */ jsxDEV("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxDEV(
        LaunchpadOverview,
        {
          stats: {
            leadsCount: leads?.length || 0,
            employeesCount: dashboardStats?.employeesCount || 0,
            saudiEmployees: dashboardStats?.saudiEmployees || 0,
            pendingInvoices: dashboardStats?.pendingInvoices || 0,
            vatExposure: dashboardStats?.vatExposure || 0,
            payrollCost: dashboardStats?.payrollCost || 0
          },
          onNewInvoice: handleNewInvoice,
          onNewLead: handleNewLead,
          onNewPayroll: handleNewPayroll,
          onNewProject: handleNewProject
        },
        void 0,
        false,
        {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 3010,
          columnNumber: 11
        },
        this
      ),
      activeView === "ceo" && /* @__PURE__ */ jsxDEV(Fragment, { children: config.filter((w) => w.visible).map((widget) => /* @__PURE__ */ jsxDEV(React.Fragment, { children: renderWidget(widget.id) }, widget.id, false, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 3029,
        columnNumber: 19
      }, this)) }, void 0, false, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 3025,
        columnNumber: 13
      }, this),
      activeView === "hr" && renderHRView(),
      activeView === "accountant" && renderAccountingView(),
      activeView === "operations" && renderOperationsView()
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 3009,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ jsxDEV(AnimatePresence, { children: [
      showWelcomeModal && /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 bg-zinc-900/40 backdrop-blur-sm",
            onClick: () => setShowWelcomeModal(false)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 3042,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            className: "relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col items-center text-center overflow-hidden",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3055,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 relative", children: /* @__PURE__ */ jsxDEV(CheckCircle2, { className: "w-8 h-8" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3057,
                columnNumber: 17
              }, this) }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3056,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("h2", { className: "text-2xl font-black text-zinc-900 mb-4", children: "أهلاً بك في نظام مدارج المتكامل!" }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3059,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("p", { className: "text-sm font-medium text-zinc-500 mb-8 leading-relaxed max-w-md", children: "لقد تم إعداد مساحة العمل الخاصة بك بنجاح. مدارج يربط مبيعاتك، فواتيرك، رواتب موظفيك والشحن في مكان واحد متصل ومؤتمت. نصيحتنا للبدء هي إضافة عملائك المحتملين أو الحاليين." }, void 0, false, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3062,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV("div", { className: "flex gap-4 w-full", children: [
                /* @__PURE__ */ jsxDEV(
                  Link,
                  {
                    to: "/app/crm",
                    className: "flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20",
                    children: [
                      /* @__PURE__ */ jsxDEV(Users, { className: "w-5 h-5" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3072,
                        columnNumber: 19
                      }, this),
                      "الذهاب إلى العملاء المبيعات (CRM)"
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3068,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => setShowWelcomeModal(false),
                    className: "px-6 py-4 rounded-xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors",
                    children: "استكشاف اللوحة"
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3075,
                    columnNumber: 17
                  },
                  this
                )
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3067,
                columnNumber: 15
              }, this)
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 3049,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 3041,
        columnNumber: 11
      }, this),
      isWhatsAppModalOpen && /* @__PURE__ */ jsxDEV("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4", children: [
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
            className: "absolute inset-0 bg-zinc-900/40 backdrop-blur-sm",
            onClick: () => setIsWhatsAppModalOpen(false)
          },
          void 0,
          false,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 3088,
            columnNumber: 13
          },
          this
        ),
        /* @__PURE__ */ jsxDEV(
          motion.div,
          {
            initial: { opacity: 0, scale: 0.95 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.95 },
            className: "relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-right",
            children: [
              /* @__PURE__ */ jsxDEV("div", { className: "flex justify-between items-center mb-6 border-b border-zinc-50 pb-4", children: [
                /* @__PURE__ */ jsxDEV(
                  "button",
                  {
                    onClick: () => setIsWhatsAppModalOpen(false),
                    className: "p-2 hover:bg-zinc-100 rounded-xl transition-all",
                    children: /* @__PURE__ */ jsxDEV(X, { className: "w-5 h-5 text-zinc-400" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3106,
                      columnNumber: 19
                    }, this)
                  },
                  void 0,
                  false,
                  {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3102,
                    columnNumber: 17
                  },
                  this
                ),
                /* @__PURE__ */ jsxDEV("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxDEV("div", { children: [
                    /* @__PURE__ */ jsxDEV("h3", { className: "font-black text-lg text-zinc-900", children: "إرسال رسالة واتساب سريعة" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3110,
                      columnNumber: 21
                    }, this),
                    /* @__PURE__ */ jsxDEV("p", { className: "text-xs font-bold text-emerald-600", children: "افتح واجهة واتساب ويب مباشرة بقوالب سعودية مسبقة" }, void 0, false, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3111,
                      columnNumber: 21
                    }, this)
                  ] }, void 0, true, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3109,
                    columnNumber: 19
                  }, this),
                  /* @__PURE__ */ jsxDEV("div", { className: "w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center", children: /* @__PURE__ */ jsxDEV(MessageSquare, { className: "w-6 h-6" }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3116,
                    columnNumber: 21
                  }, this) }, void 0, false, {
                    fileName: "/app/applet/src/pages/Dashboard.tsx",
                    lineNumber: 3115,
                    columnNumber: 19
                  }, this)
                ] }, void 0, true, {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 3108,
                  columnNumber: 17
                }, this)
              ] }, void 0, true, {
                fileName: "/app/applet/src/pages/Dashboard.tsx",
                lineNumber: 3101,
                columnNumber: 15
              }, this),
              /* @__PURE__ */ jsxDEV(
                "form",
                {
                  onSubmit: (e) => {
                    e.preventDefault();
                    if (!whatsAppPhone) {
                      toast.error("يرجى إدخال رقم الجوال أولاً");
                      return;
                    }
                    let cleanPhone = whatsAppPhone.replace(/\D/g, "");
                    if (cleanPhone.startsWith("05")) {
                      cleanPhone = "966" + cleanPhone.slice(1);
                    } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
                      cleanPhone = "966" + cleanPhone;
                    } else if (!cleanPhone.startsWith("966") && cleanPhone.length === 9) {
                      cleanPhone = "966" + cleanPhone;
                    }
                    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsAppMessage)}`;
                    window.open(url, "_blank");
                    setIsWhatsAppModalOpen(false);
                    toast.success("جاري فتح واتساب ويب في نافذة جديدة... 🚀🟢");
                  },
                  className: "space-y-5",
                  children: [
                    /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxDEV("label", { className: "text-xs font-black text-zinc-400", children: "رقم جوال المستلم" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3144,
                        columnNumber: 19
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "flex gap-2", dir: "ltr", children: [
                        /* @__PURE__ */ jsxDEV("span", { className: "bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-2xl text-zinc-600 font-bold flex items-center justify-center text-sm", children: "+966" }, void 0, false, {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 3146,
                          columnNumber: 21
                        }, this),
                        /* @__PURE__ */ jsxDEV(
                          "input",
                          {
                            type: "text",
                            required: true,
                            placeholder: "5XXXXXXXX",
                            value: whatsAppPhone,
                            onChange: (e) => setWhatsAppPhone(e.target.value),
                            className: "flex-1 px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                          },
                          void 0,
                          false,
                          {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 3149,
                            columnNumber: 21
                          },
                          this
                        )
                      ] }, void 0, true, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3145,
                        columnNumber: 19
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3143,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxDEV("label", { className: "text-xs font-black text-zinc-400", children: "اختر أحد القوالب الجاهزة" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3161,
                        columnNumber: 19
                      }, this),
                      /* @__PURE__ */ jsxDEV("div", { className: "grid grid-cols-3 gap-2", children: [
                        {
                          id: "welcome",
                          title: "ترحيبية",
                          body: "مرحباً بك في مدارج. نسعد بخدمتك وتقديم أفضل الحلول لإدارة أعمالك بنجاح. فريق المبيعات جاهز لمساعدتك."
                        },
                        {
                          id: "invoice",
                          title: "فاتورة",
                          body: "شريكنا العزيز، تم إصدار فاتورتك الضريبية بنجاح. يمكنك الاطلاع عليها وتحميلها عبر المنصة. شكراً لثقتكم."
                        },
                        {
                          id: "followup",
                          title: "متابعة",
                          body: "السلام عليكم، نود الاستفسار عن عرض السعر المقدم لكم مؤخراً، هل لديكم أي ملاحظات أو تعديلات مطلوبة؟ نسعد بخدمتكم."
                        }
                      ].map((t) => /* @__PURE__ */ jsxDEV(
                        "button",
                        {
                          type: "button",
                          onClick: () => {
                            setWhatsAppTemplate(t.id);
                            setWhatsAppMessage(t.body);
                          },
                          className: cn(
                            "p-3 rounded-xl border text-[10px] font-black transition-all text-center",
                            whatsAppTemplate === t.id ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                          ),
                          children: t.title
                        },
                        t.id,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 3182,
                          columnNumber: 23
                        },
                        this
                      )) }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3164,
                        columnNumber: 19
                      }, this)
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3160,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ jsxDEV("div", { className: "space-y-2", children: [
                      /* @__PURE__ */ jsxDEV("label", { className: "text-xs font-black text-zinc-400", children: "نص الرسالة" }, void 0, false, {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3203,
                        columnNumber: 19
                      }, this),
                      /* @__PURE__ */ jsxDEV(
                        "textarea",
                        {
                          rows: 4,
                          value: whatsAppMessage,
                          onChange: (e) => setWhatsAppMessage(e.target.value),
                          className: "w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] placeholder:text-zinc-300 text-right leading-relaxed",
                          placeholder: "اكتب رسالتك المخصصة هنا..."
                        },
                        void 0,
                        false,
                        {
                          fileName: "/app/applet/src/pages/Dashboard.tsx",
                          lineNumber: 3204,
                          columnNumber: 19
                        },
                        this
                      )
                    ] }, void 0, true, {
                      fileName: "/app/applet/src/pages/Dashboard.tsx",
                      lineNumber: 3202,
                      columnNumber: 17
                    }, this),
                    /* @__PURE__ */ jsxDEV(
                      "button",
                      {
                        type: "submit",
                        className: "w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.5rem] font-black shadow-lg shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer",
                        children: [
                          /* @__PURE__ */ jsxDEV(MessageSquare, { className: "w-5 h-5" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 3217,
                            columnNumber: 19
                          }, this),
                          /* @__PURE__ */ jsxDEV("span", { children: "إرسال عبر واتساب (Send WhatsApp)" }, void 0, false, {
                            fileName: "/app/applet/src/pages/Dashboard.tsx",
                            lineNumber: 3218,
                            columnNumber: 19
                          }, this)
                        ]
                      },
                      void 0,
                      true,
                      {
                        fileName: "/app/applet/src/pages/Dashboard.tsx",
                        lineNumber: 3213,
                        columnNumber: 17
                      },
                      this
                    )
                  ]
                },
                void 0,
                true,
                {
                  fileName: "/app/applet/src/pages/Dashboard.tsx",
                  lineNumber: 3121,
                  columnNumber: 15
                },
                this
              )
            ]
          },
          void 0,
          true,
          {
            fileName: "/app/applet/src/pages/Dashboard.tsx",
            lineNumber: 3095,
            columnNumber: 13
          },
          this
        )
      ] }, void 0, true, {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 3087,
        columnNumber: 11
      }, this),
      showOnboarding && /* @__PURE__ */ jsxDEV(
        OnboardingWizard,
        {
          onComplete: () => setShowOnboarding(false),
          onClose: () => setShowOnboarding(false)
        },
        void 0,
        false,
        {
          fileName: "/app/applet/src/pages/Dashboard.tsx",
          lineNumber: 3226,
          columnNumber: 11
        },
        this
      )
    ] }, void 0, true, {
      fileName: "/app/applet/src/pages/Dashboard.tsx",
      lineNumber: 3039,
      columnNumber: 7
    }, this),
    !showOnboarding && /* @__PURE__ */ jsxDEV(
      QuickActionsFAB,
      {
        onNewInvoice: handleNewInvoice,
        onNewLead: handleNewLead,
        onNewPayroll: handleNewPayroll,
        onNewProject: handleNewProject
      },
      void 0,
      false,
      {
        fileName: "/app/applet/src/pages/Dashboard.tsx",
        lineNumber: 3234,
        columnNumber: 9
      },
      this
    )
  ] }, void 0, true, {
    fileName: "/app/applet/src/pages/Dashboard.tsx",
    lineNumber: 2749,
    columnNumber: 5
  }, this);
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkRhc2hib2FyZC50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZUVmZmVjdCwgdXNlU3RhdGUgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCBDb21wbGlhbmNlRGFzaGJvYXJkIGZyb20gXCJAL3NyYy9jb21wb25lbnRzL0NvbXBsaWFuY2VEYXNoYm9hcmRcIjtcbmltcG9ydCBFbWVyZ2VuY3lMb2NrZG93bkluZGljYXRvciBmcm9tIFwiQC9zcmMvY29tcG9uZW50cy9FbWVyZ2VuY3lMb2NrZG93bkluZGljYXRvclwiO1xuaW1wb3J0IFBheXJvbGxDb21wbGlhbmNlV2lkZ2V0IGZyb20gXCJAL3NyYy9jb21wb25lbnRzL1BheXJvbGxDb21wbGlhbmNlV2lkZ2V0XCI7XG5pbXBvcnQge1xuICBUcmVuZGluZ1VwLFxuICBVc2VycyxcbiAgRmlsZUNoZWNrLFxuICBBcnJvd1VwUmlnaHQsXG4gIEFycm93RG93blJpZ2h0LFxuICBQbHVzLFxuICBIaXN0b3J5LFxuICBNYWlsLFxuICBGaWxlVGV4dCxcbiAgU2V0dGluZ3MyLFxuICBHcmlwVmVydGljYWwsXG4gIEV5ZSxcbiAgRXllT2ZmLFxuICBDaGVjayxcbiAgTWVzc2FnZVNxdWFyZSxcbiAgVXNlclBsdXMsXG4gIFBhY2thZ2UsXG4gIEdyaXBIb3Jpem9udGFsLFxuICBYLFxuICBaYXAsXG4gIENoZWNrQ2lyY2xlMixcbiAgRG93bmxvYWQsXG4gIFNoaWVsZENoZWNrLFxuICBBbGVydENpcmNsZSxcbiAgQnVpbGRpbmcyLFxuICBDYWxlbmRhcixcbiAgRG9sbGFyU2lnbixcbiAgQWxlcnRPY3RhZ29uLFxuICBUcnVjayxcbiAgQW5jaG9yLFxuICBTaGllbGRBbGVydCxcbiAgQnJpZWZjYXNlLFxufSBmcm9tIFwibHVjaWRlLXJlYWN0XCI7XG5pbXBvcnQge1xuICBBcmVhQ2hhcnQsXG4gIEFyZWEsXG4gIFhBeGlzLFxuICBZQXhpcyxcbiAgQ2FydGVzaWFuR3JpZCxcbiAgVG9vbHRpcCxcbiAgUmVzcG9uc2l2ZUNvbnRhaW5lcixcbiAgQmFyQ2hhcnQsXG4gIEJhcixcbiAgTGluZUNoYXJ0LFxuICBMaW5lLFxuICBQaWVDaGFydCxcbiAgUGllLFxuICBDZWxsLFxuICBMZWdlbmQsXG59IGZyb20gXCJyZWNoYXJ0c1wiO1xuaW1wb3J0IHsgbW90aW9uLCBBbmltYXRlUHJlc2VuY2UsIFJlb3JkZXIgfSBmcm9tIFwibW90aW9uL3JlYWN0XCI7XG5pbXBvcnQgeyBjbiB9IGZyb20gXCJAL3NyYy9saWIvdXRpbHNcIjtcbmltcG9ydCB7IExpbmssIHVzZUxvY2F0aW9uLCB1c2VOYXZpZ2F0ZSB9IGZyb20gXCJyZWFjdC1yb3V0ZXItZG9tXCI7XG5pbXBvcnQgeyB0b2FzdCB9IGZyb20gXCJzb25uZXJcIjtcbmltcG9ydCB7XG4gIGNvbGxlY3Rpb24sXG4gIHF1ZXJ5LFxuICB3aGVyZSxcbiAgb25TbmFwc2hvdCxcbiAgb3JkZXJCeSxcbiAgbGltaXQsXG4gIGRvYyxcbiAgdXBkYXRlRG9jLFxufSBmcm9tIFwiZmlyZWJhc2UvZmlyZXN0b3JlXCI7XG5pbXBvcnQgeyBkYiwgYXV0aCB9IGZyb20gXCJAL3NyYy9saWIvZmlyZWJhc2VcIjtcbmltcG9ydCB7IHVzZVVzZXIgfSBmcm9tIFwiQC9zcmMvY29udGV4dHMvVXNlckNvbnRleHRcIjtcbmltcG9ydCB7IHVzZVNldHRpbmdzIH0gZnJvbSBcIkAvc3JjL2NvbnRleHRzL1NldHRpbmdzQ29udGV4dFwiO1xuaW1wb3J0IHsgaGFuZGxlRmlyZXN0b3JlRXJyb3IsIE9wZXJhdGlvblR5cGUgfSBmcm9tIFwiQC9zcmMvbGliL2ZpcmVzdG9yZS1pc3N1ZXNcIjtcbmltcG9ydCB7IFBheXJvbGxTZXJ2aWNlIH0gZnJvbSBcIkAvc3JjL3NlcnZpY2VzL3BheXJvbGwuc2VydmljZVwiO1xuaW1wb3J0IE9TV29ya3NwYWNlRXhwbG9yZXIgZnJvbSBcIkAvc3JjL2NvbXBvbmVudHMvT1NXb3Jrc3BhY2VFeHBsb3JlclwiO1xuaW1wb3J0IFF1aWNrQWN0aW9uc1dpZGdldCBmcm9tIFwiQC9zcmMvY29tcG9uZW50cy9RdWlja0FjdGlvbnNXaWRnZXRcIjtcbmltcG9ydCBPbmJvYXJkaW5nV2l6YXJkIGZyb20gXCJAL3NyYy9jb21wb25lbnRzL2Rhc2hib2FyZC9PbmJvYXJkaW5nV2l6YXJkXCI7XG5pbXBvcnQgTGF1bmNocGFkT3ZlcnZpZXcgZnJvbSBcIkAvc3JjL2NvbXBvbmVudHMvZGFzaGJvYXJkL0xhdW5jaHBhZE92ZXJ2aWV3XCI7XG5pbXBvcnQgUXVpY2tBY3Rpb25zRkFCIGZyb20gXCJAL3NyYy9jb21wb25lbnRzL2Rhc2hib2FyZC9RdWlja0FjdGlvbnNGQUJcIjtcblxuaW50ZXJmYWNlIFdpZGdldENvbmZpZyB7XG4gIGlkOiBzdHJpbmc7XG4gIHRpdGxlOiBzdHJpbmc7XG4gIHZpc2libGU6IGJvb2xlYW47XG59XG5cbmNvbnN0IERFRkFVTFRfQ09ORklHOiBXaWRnZXRDb25maWdbXSA9IFtcbiAgeyBpZDogXCJidXNpbmVzc19oZWFsdGhcIiwgdGl0bGU6IFwi2YXYpNi02LEg2LXYrdipINin2YTYo9i52YXYp9mEINin2YTYsNmD2YogKEFJIEhlYWx0aCBTY29yZSlcIiwgdmlzaWJsZTogdHJ1ZSB9LFxuICB7IGlkOiBcImludGVsbGlnZW5jZVwiLCB0aXRsZTogXCLYqtmI2LXZitin2Kog2YXYr9in2LHYrCDYp9mE2LDZg9mK2Kkg2YTZhNmG2YXZiFwiLCB2aXNpYmxlOiB0cnVlIH0sXG4gIHsgaWQ6IFwicXVpY2tfYWN0aW9uc1wiLCB0aXRsZTogXCLYp9mE2KXYrNix2KfYodin2Kog2KfZhNiz2LHZiti52KlcIiwgdmlzaWJsZTogdHJ1ZSB9LFxuICB7IGlkOiBcIm9wZW53YV9zdGF0dXNcIiwgdGl0bGU6IFwi2K3Yp9mE2Kkg2LHYqNi3INmI2KfYqtiz2KfYqCAoT3BlbldBKVwiLCB2aXNpYmxlOiB0cnVlIH0sXG4gIHsgaWQ6IFwiY29tcGxpYW5jZVwiLCB0aXRsZTogXCLZhNmI2K3YqSDYp9mE2KfZhdiq2KvYp9mEXCIsIHZpc2libGU6IHRydWUgfSxcbiAgeyBpZDogXCJzdGF0c1wiLCB0aXRsZTogXCLYp9mE2KXYrdi12KfYptmK2KfYqiDYp9mE2LPYsdmK2LnYqVwiLCB2aXNpYmxlOiB0cnVlIH0sXG4gIHsgaWQ6IFwicGF5cm9sbFwiLCB0aXRsZTogXCLZhdiz2YrYsdin2Kog2KfZhNix2YjYp9iq2KhcIiwgdmlzaWJsZTogdHJ1ZSB9LFxuICB7IGlkOiBcImNoYXJ0XCIsIHRpdGxlOiBcItmF2YbYrdmG2Ykg2KfZhNmF2KjZiti52KfYqlwiLCB2aXNpYmxlOiB0cnVlIH0sXG4gIHsgaWQ6IFwiYWN0aXZpdHlcIiwgdGl0bGU6IFwi2KfZhNmG2LTYp9i3INin2YTYo9iu2YrYsVwiLCB2aXNpYmxlOiB0cnVlIH0sXG5dO1xuXG5jb25zdCBBVkFJTEFCTEVfUVVJQ0tfQUNUSU9OUyA9IFtcbiAge1xuICAgIGlkOiBcImNyZWF0ZV9pbnZvaWNlXCIsXG4gICAgbGFiZWw6IFwi2KXZhti02KfYoSDZgdin2KrZiNix2KlcIixcbiAgICBpY29uOiBGaWxlVGV4dCxcbiAgICBwYXRoOiBcIi9hcHAvaW52b2ljZXMvbmV3XCIsXG4gICAgY29sb3I6IFwidGV4dC1lbWVyYWxkLTUwMFwiLFxuICAgIGJnOiBcImJnLWVtZXJhbGQtNTBcIixcbiAgfSxcbiAge1xuICAgIGlkOiBcImFkZF9sZWFkXCIsXG4gICAgbGFiZWw6IFwi2KXYttin2YHYqSDYudmF2YrZhCDZhdit2KrZhdmEXCIsXG4gICAgaWNvbjogVXNlcnMsXG4gICAgcGF0aDogXCIvYXBwL2NybS9uZXdcIixcbiAgICBjb2xvcjogXCJ0ZXh0LWJsdWUtNTAwXCIsXG4gICAgYmc6IFwiYmctYmx1ZS01MFwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwidW5yZWFkX2NoYXRzXCIsXG4gICAgbGFiZWw6IFwi2KfZhNmF2K3Yp9iv2KvYp9iqINi62YrYsSDYp9mE2YXZgtix2YjYodipXCIsXG4gICAgaWNvbjogTWVzc2FnZVNxdWFyZSxcbiAgICBwYXRoOiBcIi9hcHAvY2hhdFwiLFxuICAgIGNvbG9yOiBcInRleHQtcHVycGxlLTUwMFwiLFxuICAgIGJnOiBcImJnLXB1cnBsZS01MFwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwic2VuZF93aGF0c2FwcFwiLFxuICAgIGxhYmVsOiBcItil2LHYs9in2YQg2LHYs9in2YTYqSDZiNin2KrYs9in2KhcIixcbiAgICBpY29uOiBNZXNzYWdlU3F1YXJlLFxuICAgIHBhdGg6IFwiI1wiLFxuICAgIGNvbG9yOiBcInRleHQtZW1lcmFsZC02MDBcIixcbiAgICBiZzogXCJiZy1lbWVyYWxkLTUwXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJwYXlyb2xsX3JlcG9ydFwiLFxuICAgIGxhYmVsOiBcItil2LXYr9in2LEg2YXYs9mK2LEg2LHZiNin2KrYqFwiLFxuICAgIGljb246IEZpbGVDaGVjayxcbiAgICBwYXRoOiBcIi9hcHAvcGF5cm9sbC9uZXdcIixcbiAgICBjb2xvcjogXCJ0ZXh0LWFtYmVyLTUwMFwiLFxuICAgIGJnOiBcImJnLWFtYmVyLTUwXCIsXG4gIH0sXG4gIHtcbiAgICBpZDogXCJhZGRfZW1wbG95ZWVcIixcbiAgICBsYWJlbDogXCLYpdi22KfZgdipINmF2YjYuNmBXCIsXG4gICAgaWNvbjogVXNlclBsdXMsXG4gICAgcGF0aDogXCIvYXBwL2Z3Y29zL25ld1wiLFxuICAgIGNvbG9yOiBcInRleHQtaW5kaWdvLTUwMFwiLFxuICAgIGJnOiBcImJnLWluZGlnby01MFwiLFxuICB9LFxuICB7XG4gICAgaWQ6IFwibmV3X3NoaXBtZW50XCIsXG4gICAgbGFiZWw6IFwi2LTYrdmG2Kkg2KzYr9mK2K/YqVwiLFxuICAgIGljb246IFBhY2thZ2UsXG4gICAgcGF0aDogXCIvYXBwL3N1cHBsaWVycy9uZXdcIixcbiAgICBjb2xvcjogXCJ0ZXh0LXJvc2UtNTAwXCIsXG4gICAgYmc6IFwiYmctcm9zZS01MFwiLFxuICB9LFxuXTtcblxuY29uc3QgREVGQVVMVF9RVUlDS19BQ1RJT05TID0gW1xuICBcImNyZWF0ZV9pbnZvaWNlXCIsXG4gIFwiYWRkX2xlYWRcIixcbiAgXCJzZW5kX3doYXRzYXBwXCIsXG4gIFwidW5yZWFkX2NoYXRzXCIsXG4gIFwicGF5cm9sbF9yZXBvcnRcIixcbl07XG5cblxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBEYXNoYm9hcmQoKSB7XG4gIGNvbnN0IHsgdXNlciwgdXBkYXRlUHJvZmlsZSB9ID0gdXNlVXNlcigpO1xuICBjb25zdCB7IHNldHRpbmdzIH0gPSB1c2VTZXR0aW5ncygpO1xuICBjb25zdCBpc0FyID0gc2V0dGluZ3MubGFuZ3VhZ2UgPT09IFwiYXJcIjtcbiAgY29uc3QgbG9jYXRpb24gPSB1c2VMb2NhdGlvbigpO1xuICBjb25zdCBuYXZpZ2F0ZSA9IHVzZU5hdmlnYXRlKCk7XG4gIGNvbnN0IFtzaG93V2VsY29tZU1vZGFsLCBzZXRTaG93V2VsY29tZU1vZGFsXSA9IHVzZVN0YXRlKGxvY2F0aW9uLnN0YXRlPy5zaG93V2VsY29tZSB8fCBmYWxzZSk7XG4gIGNvbnN0IFtzaG93T25ib2FyZGluZywgc2V0U2hvd09uYm9hcmRpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKHVzZXIgJiYgdXNlci5vbmJvYXJkaW5nPy5jb21wbGV0ZWQgIT09IHRydWUpIHtcbiAgICAgIHNldFNob3dPbmJvYXJkaW5nKHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRTaG93T25ib2FyZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbdXNlcl0pO1xuXG4gIGNvbnN0IGhhbmRsZU5ld0ludm9pY2UgPSAoKSA9PiBuYXZpZ2F0ZShcIi9hcHAvaW52b2ljZXMvbmV3XCIpO1xuICBjb25zdCBoYW5kbGVOZXdMZWFkID0gKCkgPT4gbmF2aWdhdGUoXCIvYXBwL2NybS9uZXdcIik7XG4gIGNvbnN0IGhhbmRsZU5ld1BheXJvbGwgPSAoKSA9PiBuYXZpZ2F0ZShcIi9hcHAvcGF5cm9sbC9uZXdcIik7XG4gIGNvbnN0IGhhbmRsZU5ld1Byb2plY3QgPSAoKSA9PiBuYXZpZ2F0ZShcIi9hcHAvcHJvamVjdHMvbmV3XCIpO1xuICBjb25zdCBbYXVkaXRMb2dzLCBzZXRBdWRpdExvZ3NdID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW2Rhc2hib2FyZFN0YXRzLCBzZXREYXNoYm9hcmRTdGF0c10gPSB1c2VTdGF0ZTxhbnk+KG51bGwpO1xuICBjb25zdCBbc3lzdGVtQWxlcnRzLCBzZXRTeXN0ZW1BbGVydHNdID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW2NvbmZpZywgc2V0Q29uZmlnXSA9IHVzZVN0YXRlPFdpZGdldENvbmZpZ1tdPihERUZBVUxUX0NPTkZJRyk7XG4gIGNvbnN0IFtxdWlja0FjdGlvbnMsIHNldFF1aWNrQWN0aW9uc10gPSB1c2VTdGF0ZTxzdHJpbmdbXT4oREVGQVVMVF9RVUlDS19BQ1RJT05TKTtcbiAgY29uc3QgW2lzV2hhdHNBcHBNb2RhbE9wZW4sIHNldElzV2hhdHNBcHBNb2RhbE9wZW5dID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbd2hhdHNBcHBQaG9uZSwgc2V0V2hhdHNBcHBQaG9uZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3doYXRzQXBwVGVtcGxhdGUsIHNldFdoYXRzQXBwVGVtcGxhdGVdID0gdXNlU3RhdGUoXCJ3ZWxjb21lXCIpO1xuICBjb25zdCBbd2hhdHNBcHBNZXNzYWdlLCBzZXRXaGF0c0FwcE1lc3NhZ2VdID0gdXNlU3RhdGUoXG4gICAgXCLZhdix2K3YqNin2Ysg2KjZgyDZgdmKINmF2K/Yp9ix2KwuINmG2LPYudivINio2K7Yr9mF2KrZgyDZiNiq2YLYr9mK2YUg2KPZgdi22YQg2KfZhNit2YTZiNmEINmE2KXYr9in2LHYqSDYo9i52YXYp9mE2YMg2KjZhtis2KfYrS4g2YHYsdmK2YIg2KfZhNmF2KjZiti52KfYqiDYrNin2YfYsiDZhNmF2LPYp9i52K/YqtmDLlwiXG4gICk7XG4gIGNvbnN0IFtpc0VkaXRpbmcsIHNldElzRWRpdGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIGNvbnN0IFtpc1NhdmluZywgc2V0SXNTYXZpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbYWN0aXZlVmlldywgc2V0QWN0aXZlVmlld10gPSB1c2VTdGF0ZTxcImNlb1wiIHwgXCJoclwiIHwgXCJhY2NvdW50YW50XCIgfCBcIm9wZXJhdGlvbnNcIj4oXCJjZW9cIik7XG4gIGNvbnN0IFtkaXNtaXNzZWRMb2NhbEFsZXJ0cywgc2V0RGlzbWlzc2VkTG9jYWxBbGVydHNdID0gdXNlU3RhdGU8c3RyaW5nW10+KFtdKTtcbiAgY29uc3QgW3dhU3RhdHVzLCBzZXRXYVN0YXR1c10gPSB1c2VTdGF0ZTxcImNvbm5lY3RlZFwiIHwgXCJkaXNjb25uZWN0ZWRcIiB8IFwiZGlzYWJsZWRcIiB8IFwiY2hlY2tpbmdcIj4oXG4gICAgXCJjaGVja2luZ1wiXG4gICk7XG4gIGNvbnN0IFt3YVN0YXR1c01lc3NhZ2UsIHNldFdhU3RhdHVzTWVzc2FnZV0gPSB1c2VTdGF0ZShcIlwiKTtcbiAgY29uc3QgW3F1ZXVlQ291bnQsIHNldFF1ZXVlQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtwZW5kaW5nUXVldWVDb3VudCwgc2V0UGVuZGluZ1F1ZXVlQ291bnRdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtsZWFkcywgc2V0TGVhZHNdID0gdXNlU3RhdGU8YW55W10+KFtdKTtcbiAgY29uc3QgW2ludm9pY2VzLCBzZXRJbnZvaWNlc10gPSB1c2VTdGF0ZTxhbnlbXT4oW10pO1xuICBjb25zdCBbcGF5cm9sbFJ1bnMsIHNldFBheXJvbGxSdW5zXSA9IHVzZVN0YXRlPGFueVtdPihbXSk7XG4gIGNvbnN0IFthY3RpdmVTaGlwbWVudHMsIHNldEFjdGl2ZVNoaXBtZW50c10gPSB1c2VTdGF0ZTxhbnlbXT4oW10pO1xuICBjb25zdCBbc2hpcG1lbnRzQ291bnQsIHNldFNoaXBtZW50c0NvdW50XSA9IHVzZVN0YXRlPG51bWJlcj4oMCk7XG4gIGNvbnN0IFtxdWFydGVybHlEYXRhLCBzZXRRdWFydGVybHlEYXRhXSA9IHVzZVN0YXRlPFxuICAgIHsgbmFtZTogc3RyaW5nOyBjdXJyZW50OiBudW1iZXI7IHByb2plY3RlZDogbnVtYmVyIH1bXVxuICA+KFtcbiAgICB7IG5hbWU6IFwi2KfZhNix2KjYuSAxXCIsIGN1cnJlbnQ6IDAsIHByb2plY3RlZDogMCB9LFxuICAgIHsgbmFtZTogXCLYp9mE2LHYqNi5IDJcIiwgY3VycmVudDogMCwgcHJvamVjdGVkOiAwIH0sXG4gICAgeyBuYW1lOiBcItin2YTYsdio2LkgM1wiLCBjdXJyZW50OiAwLCBwcm9qZWN0ZWQ6IDAgfSxcbiAgICB7IG5hbWU6IFwi2KfZhNix2KjYuSA0XCIsIGN1cnJlbnQ6IDAsIHByb2plY3RlZDogMCB9LFxuICBdKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHF1YXJ0ZXJzID0gW1xuICAgICAgeyBuYW1lOiBcItin2YTYsdio2LkgMVwiLCBjdXJyZW50OiAwLCBwcm9qZWN0ZWQ6IDAgfSxcbiAgICAgIHsgbmFtZTogXCLYp9mE2LHYqNi5IDJcIiwgY3VycmVudDogMCwgcHJvamVjdGVkOiAwIH0sXG4gICAgICB7IG5hbWU6IFwi2KfZhNix2KjYuSAzXCIsIGN1cnJlbnQ6IDAsIHByb2plY3RlZDogMCB9LFxuICAgICAgeyBuYW1lOiBcItin2YTYsdio2LkgNFwiLCBjdXJyZW50OiAwLCBwcm9qZWN0ZWQ6IDAgfSxcbiAgICBdO1xuXG4gICAgLy8gQ29tcHV0ZSBcImN1cnJlbnRcIiAoUGFpZCBpbnZvaWNlcylcbiAgICBpbnZvaWNlcy5mb3JFYWNoKChpbnYpID0+IHtcbiAgICAgIGlmICghaW52Lmlzc3VlRGF0ZSkgcmV0dXJuO1xuICAgICAgY29uc3QgZGF0ZSA9IG5ldyBEYXRlKGludi5pc3N1ZURhdGUpO1xuICAgICAgaWYgKGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKTsgLy8gMC0xMVxuICAgICAgY29uc3QgcXVhcnRlcklkeCA9IE1hdGguZmxvb3IobW9udGggLyAzKTsgLy8gMC0zXG4gICAgICBjb25zdCBpc1BhaWQgPSBpbnYuc3RhdHVzID09PSBcInBhaWRcIjtcblxuICAgICAgY29uc3QgYW1vdW50ID0gKGludi50b3RhbEFtb3VudEhhbGFsYXMgfHwgMCkgLyAxMDA7XG4gICAgICBpZiAocXVhcnRlcklkeCA+PSAwICYmIHF1YXJ0ZXJJZHggPD0gMykge1xuICAgICAgICBpZiAoaXNQYWlkKSB7XG4gICAgICAgICAgcXVhcnRlcnNbcXVhcnRlcklkeF0uY3VycmVudCArPSBhbW91bnQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaW52LnN0YXR1cyAhPT0gXCJjYW5jZWxsZWRcIikge1xuICAgICAgICAgIC8vIElmIHVucGFpZCBvciBwZW5kaW5nLCBpdCBjb3VudHMgdG93YXJkcyBwcm9qZWN0ZWRcbiAgICAgICAgICBxdWFydGVyc1txdWFydGVySWR4XS5wcm9qZWN0ZWQgKz0gYW1vdW50O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBDb21wdXRlIFwicHJvamVjdGVkXCIgKGxlYWRzIHBpcGVsaW5lKVxuICAgIGxlYWRzLmZvckVhY2goKGxlYWQpID0+IHtcbiAgICAgIGxldCBkYXRlOiBEYXRlIHwgbnVsbCA9IG51bGw7XG4gICAgICBpZiAobGVhZC5leHBlY3RlZENsb3NlRGF0ZSkge1xuICAgICAgICBkYXRlID0gbmV3IERhdGUobGVhZC5leHBlY3RlZENsb3NlRGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKGxlYWQuY3JlYXRlZEF0KSB7XG4gICAgICAgIGNvbnN0IHRzID0gbGVhZC5jcmVhdGVkQXQudG9EYXRlID8gbGVhZC5jcmVhdGVkQXQudG9EYXRlKCkgOiBuZXcgRGF0ZShsZWFkLmNyZWF0ZWRBdCk7XG4gICAgICAgIGRhdGUgPSB0cztcbiAgICAgIH1cblxuICAgICAgaWYgKCFkYXRlIHx8IGlzTmFOKGRhdGUuZ2V0VGltZSgpKSkgcmV0dXJuO1xuXG4gICAgICBjb25zdCBtb250aCA9IGRhdGUuZ2V0TW9udGgoKTtcbiAgICAgIGNvbnN0IHF1YXJ0ZXJJZHggPSBNYXRoLmZsb29yKG1vbnRoIC8gMyk7XG4gICAgICBjb25zdCB2YWwgPSBsZWFkLnZhbHVlIHx8IGxlYWQuYW1vdW50IHx8IDA7XG5cbiAgICAgIGlmIChxdWFydGVySWR4ID49IDAgJiYgcXVhcnRlcklkeCA8PSAzKSB7XG4gICAgICAgIHF1YXJ0ZXJzW3F1YXJ0ZXJJZHhdLnByb2plY3RlZCArPSB2YWw7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBzZXRRdWFydGVybHlEYXRhKHF1YXJ0ZXJzKTtcbiAgfSwgW2xlYWRzLCBpbnZvaWNlc10pO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCF1c2VyKSByZXR1cm47XG5cbiAgICAvLyBMb2FkIHVzZXIgc3BlY2lhbGl6ZWQgY29uZmlnIGFuZCBtZXJnZSB0byBlbnN1cmUgbmV3IHdpZGdldHMgKGxpa2Ugb3BlbndhX3N0YXR1cykgYXJlIGluY2x1ZGVkIGlmIG1pc3NpbmdcbiAgICBpZiAodXNlci5kYXNoYm9hcmRDb25maWcpIHtcbiAgICAgIGNvbnN0IGxvYWRlZCA9IHVzZXIuZGFzaGJvYXJkQ29uZmlnO1xuICAgICAgY29uc3QgbWlzc2luZyA9IERFRkFVTFRfQ09ORklHLmZpbHRlcigoZGVmKSA9PiAhbG9hZGVkLnNvbWUoKGw6IGFueSkgPT4gbC5pZCA9PT0gZGVmLmlkKSk7XG4gICAgICBzZXRDb25maWcoWy4uLmxvYWRlZCwgLi4ubWlzc2luZ10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXRDb25maWcoREVGQVVMVF9DT05GSUcpO1xuICAgIH1cbiAgICBpZiAodXNlci5xdWlja0FjdGlvbnNDb25maWcpIHtcbiAgICAgIHNldFF1aWNrQWN0aW9ucyh1c2VyLnF1aWNrQWN0aW9uc0NvbmZpZyk7XG4gICAgfVxuXG4gICAgLy8gLS0tIFJFQUwtVElNRSBPUEVOV0EgUEVSU0lTVEVOVCBDT05ORUNUSU9OIE1PTklUT1IgJiBRVUVVRSBTVEFUUyBMSVNURU5FUiAtLS1cbiAgICBsZXQgcHJldmlvdXNTdGF0dXM6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gICAgY29uc3QgY2hlY2tTdGF0dXMgPSBhc3luYyAoKSA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBhd2FpdCBhdXRoLmF1dGhTdGF0ZVJlYWR5KCk7XG4gICAgICAgIGNvbnN0IHRva2VuID0gYXdhaXQgYXV0aC5jdXJyZW50VXNlcj8uZ2V0SWRUb2tlbigpO1xuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBmZXRjaChcIi9hcGkvb3BlbndhL3N0YXR1c1wiLCB7XG4gICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogdG9rZW4gPyBgQmVhcmVyICR7dG9rZW59YCA6IFwiXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXMub2spIHtcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKTtcbiAgICAgICAgICBzZXRXYVN0YXR1cyhkYXRhLnN0YXR1cyk7XG4gICAgICAgICAgc2V0V2FTdGF0dXNNZXNzYWdlKGRhdGEubWVzc2FnZSB8fCBcIlwiKTtcblxuICAgICAgICAgIC8vIEFsZXJ0IHVzZXIgaW1tZWRpYXRlbHkgaWYgZGlzY29ubmVjdGVkIGFuZCBzdGF0dXMgY2hhbmdlZFxuICAgICAgICAgIGlmIChkYXRhLnN0YXR1cyA9PT0gXCJkaXNjb25uZWN0ZWRcIikge1xuICAgICAgICAgICAgaWYgKHByZXZpb3VzU3RhdHVzICYmIHByZXZpb3VzU3RhdHVzICE9PSBcImRpc2Nvbm5lY3RlZFwiKSB7XG4gICAgICAgICAgICAgIHRvYXN0LmVycm9yKFxuICAgICAgICAgICAgICAgIFwi2KrZhtio2YrZhyDYudin2KzZhDog2KrZhSDYp9mG2YLYt9in2Lkg2KfYqti12KfZhCDYqNmI2KfYqNipINmI2KfYqtiz2KfYqCAoT3BlbldBKSEg2YrYsdis2Ykg2KfZhNiq2K3ZgtmCINmF2YYg2KfZhNis2YTYs9ipINmB2Yog2KfZhNil2LnYr9in2K/Yp9iqINmE2KrZgdin2K/ZiiDYqtmI2YLZgSDYo9iq2YXYqtipINin2YTYsdiz2KfYptmELlwiLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGR1cmF0aW9uOiA4MDAwLFxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgcHJldmlvdXNTdGF0dXMgPSBkYXRhLnN0YXR1cztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRXYVN0YXR1cyhcImRpc2Nvbm5lY3RlZFwiKTtcbiAgICAgICAgICBzZXRXYVN0YXR1c01lc3NhZ2UoXCLYrti32KMg2YHZiiDYp9mE2KfYqti12KfZhCDYqNin2YTYrtin2K/ZhSDYp9mE2K/Yp9iu2YTZilwiKTtcbiAgICAgICAgICBwcmV2aW91c1N0YXR1cyA9IFwiZGlzY29ubmVjdGVkXCI7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICAgIHNldFdhU3RhdHVzKFwiZGlzY29ubmVjdGVkXCIpO1xuICAgICAgICBzZXRXYVN0YXR1c01lc3NhZ2UoZXJyLm1lc3NhZ2UgfHwgXCLZgdi02YQg2YHYrdi1INin2YTYrdin2YTYqVwiKTtcbiAgICAgICAgcHJldmlvdXNTdGF0dXMgPSBcImRpc2Nvbm5lY3RlZFwiO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBSdW4gaW1tZWRpYXRlbHlcbiAgICBjaGVja1N0YXR1cygpO1xuXG4gICAgLy8gUG9sbCBldmVyeSAxMCBzZWNvbmRzIGZvciBpbnN0YW50IGRpc2Nvbm5lY3Rpb24gd2FybmluZ1xuICAgIGNvbnN0IGludGVydmFsSWQgPSBzZXRJbnRlcnZhbChjaGVja1N0YXR1cywgMTAwMDApO1xuXG4gICAgLy8gTGlzdGVuIHRvIHF1ZXVlIHN0YXRzIGluIEZpcmVzdG9yZSBmb3IgbGl2ZSBkYXNoYm9hcmQgbWV0cmljc1xuICAgIGxldCB1bnN1YlF1ZXVlID0gKCkgPT4ge307XG4gICAgaWYgKHVzZXIudWlkICYmIHVzZXIuaWQgIT09IFwiZGVtby1hZG1pbi11aWRcIikge1xuICAgICAgY29uc3QgcXVldWVRdWVyeSA9IHF1ZXJ5KGNvbGxlY3Rpb24oZGIsIFwid2hhdHNhcHBfcXVldWVcIiksIHdoZXJlKFwidXNlcklkXCIsIFwiPT1cIiwgdXNlci51aWQpKTtcbiAgICAgIHVuc3ViUXVldWUgPSBvblNuYXBzaG90KFxuICAgICAgICBxdWV1ZVF1ZXJ5LFxuICAgICAgICAoc25hcHNob3QpID0+IHtcbiAgICAgICAgICBzZXRRdWV1ZUNvdW50KHNuYXBzaG90LnNpemUpO1xuICAgICAgICAgIGNvbnN0IHBlbmRpbmcgPSBzbmFwc2hvdC5kb2NzLmZpbHRlcigoZCkgPT4gZC5kYXRhKCkuc3RhdHVzID09PSBcInBlbmRpbmdcIikubGVuZ3RoO1xuICAgICAgICAgIHNldFBlbmRpbmdRdWV1ZUNvdW50KHBlbmRpbmcpO1xuICAgICAgICB9LFxuICAgICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJRdWV1ZSBsaXN0ZW5lciBlcnJvciAoaGFuZGxlZCBncmFjZWZ1bGx5KTpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICBjbGVhckludGVydmFsKGludGVydmFsSWQpO1xuICAgICAgdW5zdWJRdWV1ZSgpO1xuICAgIH07XG4gIH0sIFt1c2VyXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoIXVzZXIpIHJldHVybjtcblxuICAgIC8vIExpc3RlbiB0byBMZWFkcyAoZm9yIHNhbGVzIHBpcGVsaW5lIHN0YXRzKVxuICAgIGNvbnN0IGxlYWRzUXVlcnkgPSBxdWVyeShjb2xsZWN0aW9uKGRiLCBcImxlYWRzXCIpLCB3aGVyZShcInVzZXJJZFwiLCBcIj09XCIsIHVzZXIudWlkKSk7XG4gICAgY29uc3QgdW5zdWJMZWFkcyA9IG9uU25hcHNob3QoXG4gICAgICBsZWFkc1F1ZXJ5LFxuICAgICAgKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IGxlYWRzTGlzdDogYW55W10gPSBzbmFwc2hvdC5kb2NzLm1hcCgoZG9jKSA9PiAoeyBpZDogZG9jLmlkLCAuLi5kb2MuZGF0YSgpIH0pKTtcbiAgICAgICAgc2V0TGVhZHMobGVhZHNMaXN0KTtcbiAgICAgICAgY29uc3QgcmV2ZW51ZSA9IGxlYWRzTGlzdC5yZWR1Y2UoKGFjYywgY3VycikgPT4gYWNjICsgKGN1cnIudmFsdWUgfHwgMCksIDApO1xuICAgICAgICBjb25zdCB3b25MZWFkcyA9IGxlYWRzTGlzdC5maWx0ZXIoKGwpID0+IGwuc3RhdHVzID09PSBcIndvblwiKS5sZW5ndGg7XG5cbiAgICAgICAgY29uc3Qgc2FsZXNCeU1vbnRoID0gbGVhZHNMaXN0LnJlZHVjZSgoYWNjOiBhbnksIGxlYWQpID0+IHtcbiAgICAgICAgICBpZiAoIWxlYWQuZXhwZWN0ZWRDbG9zZURhdGUpIHJldHVybiBhY2M7XG4gICAgICAgICAgY29uc3QgZCA9IG5ldyBEYXRlKGxlYWQuZXhwZWN0ZWRDbG9zZURhdGUpO1xuICAgICAgICAgIGNvbnN0IG0gPSBkLnRvTG9jYWxlU3RyaW5nKFwiYXItU0FcIiwgeyBtb250aDogXCJzaG9ydFwiIH0pO1xuICAgICAgICAgIGFjY1ttXSA9IChhY2NbbV0gfHwgMCkgKyAobGVhZC52YWx1ZSB8fCAwKTtcbiAgICAgICAgICByZXR1cm4gYWNjO1xuICAgICAgICB9LCB7fSk7XG4gICAgICAgIGNvbnN0IGNEYXRhID1cbiAgICAgICAgICBPYmplY3Qua2V5cyhzYWxlc0J5TW9udGgpLmxlbmd0aCA+IDBcbiAgICAgICAgICAgID8gT2JqZWN0LmtleXMoc2FsZXNCeU1vbnRoKS5tYXAoKGspID0+ICh7IG5hbWU6IGssIHNhbGVzOiBzYWxlc0J5TW9udGhba10gfSkpXG4gICAgICAgICAgICA6IFt7IG5hbWU6IFwi2YTYpyDZitmI2KzYr1wiLCBzYWxlczogMCB9XTtcblxuICAgICAgICBzZXREYXNoYm9hcmRTdGF0cygocHJldjogYW55KSA9PiAoe1xuICAgICAgICAgIC4uLnByZXYsXG4gICAgICAgICAgcmV2ZW51ZSxcbiAgICAgICAgICBsZWFkc0NvdW50OiBsZWFkc0xpc3QubGVuZ3RoLFxuICAgICAgICAgIHdvbkxlYWRzLFxuICAgICAgICAgIGNoYXJ0RGF0YTogY0RhdGEsXG4gICAgICAgIH0pKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyb3IsIE9wZXJhdGlvblR5cGUuTElTVCwgXCJsZWFkc1wiKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgcGF5cm9sbFF1ZXJ5ID0gcXVlcnkoY29sbGVjdGlvbihkYiwgXCJwYXlyb2xsX3J1bnNcIiksIHdoZXJlKFwidXNlcklkXCIsIFwiPT1cIiwgdXNlci51aWQpKTtcbiAgICBjb25zdCB1bnN1YlBheXJvbGwgPSBvblNuYXBzaG90KFxuICAgICAgcGF5cm9sbFF1ZXJ5LFxuICAgICAgKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IHJ1bnM6IGFueVtdID0gc25hcHNob3QuZG9jcy5tYXAoKGRvYykgPT4gKHsgaWQ6IGRvYy5pZCwgLi4uZG9jLmRhdGEoKSB9KSk7XG4gICAgICAgIHNldFBheXJvbGxSdW5zKHJ1bnMpO1xuICAgICAgICBjb25zdCB0b3RhbENvc3QgPSBydW5zLnJlZHVjZSgoYWNjLCBjdXJyOiBhbnkpID0+IGFjYyArIChjdXJyLnRvdGFsR3Jvc3MgfHwgMCksIDApO1xuXG4gICAgICAgIGNvbnN0IHNvcnRlZEJ5UGVyaW9kID0gWy4uLnJ1bnNdLnNvcnQoKGE6IGFueSwgYjogYW55KSA9PlxuICAgICAgICAgIChiLnBlcmlvZCB8fCBcIlwiKS5sb2NhbGVDb21wYXJlKGEucGVyaW9kIHx8IFwiXCIpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGxhdGVzdFBlcmlvZCA9IHNvcnRlZEJ5UGVyaW9kLmxlbmd0aCA+IDAgPyBzb3J0ZWRCeVBlcmlvZFswXS5wZXJpb2QgOiBudWxsO1xuXG4gICAgICAgIC8vIERldGVybWluZSBsb2NrZG93biBzdGF0dXNcbiAgICAgICAgY29uc3Qgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgbGFzdE1vbnRoID0gbmV3IERhdGUobm93LmdldEZ1bGxZZWFyKCksIG5vdy5nZXRNb250aCgpIC0gMSwgMSk7XG4gICAgICAgIGNvbnN0IGxhc3RNb250aFN0ciA9IGxhc3RNb250aC50b0lTT1N0cmluZygpLnNsaWNlKDAsIDcpO1xuICAgICAgICBjb25zdCBsYXN0UnVuID0gcnVucy5maW5kKChyOiBhbnkpID0+IHIucGVyaW9kID09PSBsYXN0TW9udGhTdHIpO1xuICAgICAgICBjb25zdCBlbmRPZkxhc3RNb250aCA9IG5ldyBEYXRlKG5vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSwgMCk7XG4gICAgICAgIGNvbnN0IGRlYWRsaW5lID0gbmV3IERhdGUoZW5kT2ZMYXN0TW9udGgpO1xuICAgICAgICBkZWFkbGluZS5zZXREYXRlKGRlYWRsaW5lLmdldERhdGUoKSArIDMwKTtcbiAgICAgICAgY29uc3QgZGF5c0xlZnQgPSBNYXRoLmNlaWwoKGRlYWRsaW5lLmdldFRpbWUoKSAtIG5vdy5nZXRUaW1lKCkpIC8gKDEwMDAgKiA2MCAqIDYwICogMjQpKTtcbiAgICAgICAgY29uc3QgaXNHZW5lcmF0ZWQgPSBsYXN0UnVuID8gbGFzdFJ1bi5tdWRhZFNpZkdlbmVyYXRlZCB8fCBsYXN0UnVuLndwc0dlbmVyYXRlZCA6IGZhbHNlO1xuICAgICAgICBjb25zdCBpc0xvY2tkb3duID0gIWlzR2VuZXJhdGVkICYmIGRheXNMZWZ0IDw9IDA7XG5cbiAgICAgICAgc2V0RGFzaGJvYXJkU3RhdHMoKHByZXY6IGFueSkgPT4gKHtcbiAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgIHBheXJvbGxDb3N0OiB0b3RhbENvc3QsXG4gICAgICAgICAgcmVjZW50UGF5cm9sbDogc29ydGVkQnlQZXJpb2Quc2xpY2UoMCwgMyksXG4gICAgICAgICAgbGF0ZXN0UGVyaW9kLFxuICAgICAgICAgIGlzTG9ja2Rvd24sXG4gICAgICAgICAgbG9ja2Rvd25QZXJpb2Q6IGxhc3RNb250aFN0cixcbiAgICAgICAgfSkpO1xuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnJvciwgT3BlcmF0aW9uVHlwZS5MSVNULCBcInBheXJvbGxfcnVuc1wiKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgZW1wbG95ZWVzUXVlcnkgPSBxdWVyeShjb2xsZWN0aW9uKGRiLCBcImVtcGxveWVlc1wiKSwgd2hlcmUoXCJ1c2VySWRcIiwgXCI9PVwiLCB1c2VyLnVpZCkpO1xuICAgIGNvbnN0IHVuc3ViRW1wbG95ZWVzID0gb25TbmFwc2hvdChcbiAgICAgIGVtcGxveWVlc1F1ZXJ5LFxuICAgICAgKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IGVtcHMgPSBzbmFwc2hvdC5kb2NzLm1hcCgoZG9jKSA9PiAoeyBpZDogZG9jLmlkLCAuLi5kb2MuZGF0YSgpIH0pKTtcbiAgICAgICAgY29uc3Qgc2F1ZGlFbXBsb3llZXMgPSBlbXBzLmZpbHRlcihcbiAgICAgICAgICAoZTogYW55KSA9PlxuICAgICAgICAgICAgZS5uYXRpb25hbGl0eT8uaW5jbHVkZXMoXCLYs9i52YjYr9mKXCIpIHx8IGUubmF0aW9uYWxpdHk/LnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoXCJzYXVkaVwiKVxuICAgICAgICApLmxlbmd0aDtcblxuICAgICAgICBjb25zdCBsb2NhbEV4cGlyaW5nQWxlcnRzOiBhbnlbXSA9IFtdO1xuICAgICAgICBlbXBzLmZvckVhY2goKGVtcDogYW55KSA9PiB7XG4gICAgICAgICAgaWYgKGVtcC5jb250cmFjdEVuZERhdGUpIHtcbiAgICAgICAgICAgIGNvbnN0IGRheXNMZWZ0ID1cbiAgICAgICAgICAgICAgKG5ldyBEYXRlKGVtcC5jb250cmFjdEVuZERhdGUpLmdldFRpbWUoKSAtIERhdGUubm93KCkpIC8gKDEwMDAgKiAzNjAwICogMjQpO1xuICAgICAgICAgICAgaWYgKGRheXNMZWZ0ID4gMCAmJiBkYXlzTGVmdCA8PSAzMCkge1xuICAgICAgICAgICAgICBsb2NhbEV4cGlyaW5nQWxlcnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGlkOiBgbG9jYWxfZXhwcl8ke2VtcC5pZH1gLFxuICAgICAgICAgICAgICAgIHRpdGxlOiBcItiq2YbYqNmK2Ycg2KfZhtiq2YfYp9ihINi52YLYr1wiLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IGDYudmC2K8g2KfZhNmF2YjYuNmBICR7ZW1wLm5hbWV9INmK2YbYqtmH2Yog2K7ZhNin2YQgJHtNYXRoLmZsb29yKGRheXNMZWZ0KX0g2YrZiNmF2KfZiy5gLFxuICAgICAgICAgICAgICAgIHR5cGU6IFwid2FybmluZ1wiLFxuICAgICAgICAgICAgICAgIGlzTG9jYWw6IHRydWUsXG4gICAgICAgICAgICAgICAgYWN0aW9uUGF0aDogXCIvYXBwL2Z3Y29zXCIsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgc2V0RGFzaGJvYXJkU3RhdHMoKHByZXY6IGFueSkgPT4gKHtcbiAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgIGVtcGxveWVlc0NvdW50OiBlbXBzLmxlbmd0aCxcbiAgICAgICAgICBzYXVkaUVtcGxveWVlczogc2F1ZGlFbXBsb3llZXMsXG4gICAgICAgICAgZXhwaXJpbmdDb250cmFjdHNBbGVydHM6IGxvY2FsRXhwaXJpbmdBbGVydHMsXG4gICAgICAgIH0pKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyb3IsIE9wZXJhdGlvblR5cGUuTElTVCwgXCJlbXBsb3llZXNcIik7XG4gICAgICB9XG4gICAgKTtcblxuICAgIGNvbnN0IGludm9pY2VzUXVlcnkgPSBxdWVyeShjb2xsZWN0aW9uKGRiLCBcImludm9pY2VzXCIpLCB3aGVyZShcInVzZXJJZFwiLCBcIj09XCIsIHVzZXIudWlkKSk7XG4gICAgY29uc3QgdW5zdWJJbnZvaWNlcyA9IG9uU25hcHNob3QoXG4gICAgICBpbnZvaWNlc1F1ZXJ5LFxuICAgICAgKHNuYXBzaG90KSA9PiB7XG4gICAgICAgIGNvbnN0IGludnM6IGFueVtdID0gc25hcHNob3QuZG9jcy5tYXAoKGRvYykgPT4gKHsgaWQ6IGRvYy5pZCwgLi4uZG9jLmRhdGEoKSB9KSk7XG4gICAgICAgIHNldEludm9pY2VzKGludnMpO1xuICAgICAgICBjb25zdCBwZW5kaW5nSW52b2ljZXMgPSBpbnZzLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgIT09IFwicGFpZFwiKS5sZW5ndGg7XG4gICAgICAgIGNvbnN0IHZhdEV4cG9zdXJlID0gaW52cy5yZWR1Y2UoKGFjYywgaSkgPT4gYWNjICsgKGkudmF0QW1vdW50SGFsYWxhcyB8fCAwKSwgMCkgLyAxMDA7XG4gICAgICAgIHNldERhc2hib2FyZFN0YXRzKChwcmV2OiBhbnkpID0+ICh7XG4gICAgICAgICAgLi4ucHJldixcbiAgICAgICAgICBwZW5kaW5nSW52b2ljZXM6IHBlbmRpbmdJbnZvaWNlcyxcbiAgICAgICAgICB2YXRFeHBvc3VyZTogdmF0RXhwb3N1cmUsXG4gICAgICAgIH0pKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyb3IsIE9wZXJhdGlvblR5cGUuTElTVCwgXCJpbnZvaWNlc1wiKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgY29uc3QgcnVsZXNRdWVyeSA9IHF1ZXJ5KGNvbGxlY3Rpb24oZGIsIFwiY29tcGxpYW5jZV9ydWxlc1wiKSwgd2hlcmUoXCJ1c2VySWRcIiwgXCI9PVwiLCB1c2VyLnVpZCkpO1xuICAgIGNvbnN0IHVuc3ViUnVsZXMgPSBvblNuYXBzaG90KFxuICAgICAgcnVsZXNRdWVyeSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICBjb25zdCBydWxlcyA9IHNuYXBzaG90LmRvY3MubWFwKChkb2MpID0+IGRvYy5kYXRhKCkpO1xuICAgICAgICBjb25zdCBhY3RpdmVSdWxlcyA9IHJ1bGVzLmZpbHRlcigocikgPT4gci5hY3RpdmUpLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2NvcmUgPSBydWxlcy5sZW5ndGggPiAwID8gTWF0aC5yb3VuZCgoYWN0aXZlUnVsZXMgLyBydWxlcy5sZW5ndGgpICogMTAwKSA6IDEwMDtcbiAgICAgICAgc2V0RGFzaGJvYXJkU3RhdHMoKHByZXY6IGFueSkgPT4gKHtcbiAgICAgICAgICAuLi5wcmV2LFxuICAgICAgICAgIGNvbXBsaWFuY2VTY29yZTogc2NvcmUsXG4gICAgICAgIH0pKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyb3IsIE9wZXJhdGlvblR5cGUuTElTVCwgXCJjb21wbGlhbmNlX3J1bGVzXCIpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaXN0ZW4gdG8gQXVkaXQgTG9nc1xuICAgIGNvbnN0IGxvZ3NRdWVyeSA9IHF1ZXJ5KFxuICAgICAgY29sbGVjdGlvbihkYiwgXCJhdWRpdF9sb2dzXCIpLFxuICAgICAgd2hlcmUoXCJ1c2VySWRcIiwgXCI9PVwiLCB1c2VyLnVpZCksXG4gICAgICBvcmRlckJ5KFwidGltZXN0YW1wXCIsIFwiZGVzY1wiKSxcbiAgICAgIGxpbWl0KDEwKVxuICAgICk7XG4gICAgY29uc3QgdW5zdWJMb2dzID0gb25TbmFwc2hvdChcbiAgICAgIGxvZ3NRdWVyeSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICBjb25zdCBsb2dzID0gc25hcHNob3QuZG9jcy5tYXAoKGRvYykgPT4gKHsgaWQ6IGRvYy5pZCwgLi4uZG9jLmRhdGEoKSB9KSk7XG4gICAgICAgIHNldEF1ZGl0TG9ncyhsb2dzKTtcbiAgICAgIH0sXG4gICAgICAoZXJyb3IpID0+IHtcbiAgICAgICAgaGFuZGxlRmlyZXN0b3JlRXJyb3IoZXJyb3IsIE9wZXJhdGlvblR5cGUuTElTVCwgXCJhdWRpdF9sb2dzXCIpO1xuICAgICAgfVxuICAgICk7XG5cbiAgICAvLyBMaXN0ZW4gdG8gU3lzdGVtIEFsZXJ0c1xuICAgIGNvbnN0IGFsZXJ0c1F1ZXJ5ID0gcXVlcnkoXG4gICAgICBjb2xsZWN0aW9uKGRiLCBcInN5c3RlbV9hbGVydHNcIiksXG4gICAgICB3aGVyZShcInVzZXJJZFwiLCBcIj09XCIsIHVzZXIudWlkKSxcbiAgICAgIHdoZXJlKFwiaXNSZWFkXCIsIFwiPT1cIiwgZmFsc2UpXG4gICAgKTtcbiAgICBjb25zdCB1bnN1YkFsZXJ0cyA9IG9uU25hcHNob3QoXG4gICAgICBhbGVydHNRdWVyeSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICBzZXRTeXN0ZW1BbGVydHMoc25hcHNob3QuZG9jcy5tYXAoKGRvYykgPT4gKHsgaWQ6IGRvYy5pZCwgLi4uZG9jLmRhdGEoKSB9KSkpO1xuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnJvciwgT3BlcmF0aW9uVHlwZS5MSVNULCBcInN5c3RlbV9hbGVydHNcIik7XG4gICAgICB9XG4gICAgKTtcblxuICAgIC8vIExpc3RlbiB0byBTaGlwbWVudHMgKExvZ2lzdGljcyBhbmQgc3VwcGx5IGNoYWluKVxuICAgIGNvbnN0IHNoaXBtZW50c1F1ZXJ5ID0gcXVlcnkoY29sbGVjdGlvbihkYiwgXCJzaGlwbWVudHNcIiksIHdoZXJlKFwidXNlcklkXCIsIFwiPT1cIiwgdXNlci51aWQpKTtcbiAgICBjb25zdCB1bnN1YlNoaXBtZW50cyA9IG9uU25hcHNob3QoXG4gICAgICBzaGlwbWVudHNRdWVyeSxcbiAgICAgIChzbmFwc2hvdCkgPT4ge1xuICAgICAgICBjb25zdCBzaExpc3QgPSBzbmFwc2hvdC5kb2NzLm1hcCgoZG9jKSA9PiAoeyBpZDogZG9jLmlkLCAuLi5kb2MuZGF0YSgpIH0pKTtcbiAgICAgICAgc2V0U2hpcG1lbnRzQ291bnQoc2hMaXN0Lmxlbmd0aCk7XG4gICAgICAgIHNldEFjdGl2ZVNoaXBtZW50cyhcbiAgICAgICAgICBzaExpc3QuZmlsdGVyKChzOiBhbnkpID0+IHMuc3RhdHVzICE9PSBcImRlbGl2ZXJlZFwiICYmIHMuc3RhdHVzICE9PSBcImNhbmNlbGxlZFwiKVxuICAgICAgICApO1xuICAgICAgfSxcbiAgICAgIChlcnJvcikgPT4ge1xuICAgICAgICBoYW5kbGVGaXJlc3RvcmVFcnJvcihlcnJvciwgT3BlcmF0aW9uVHlwZS5MSVNULCBcInNoaXBtZW50c1wiKTtcbiAgICAgIH1cbiAgICApO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHVuc3ViTGVhZHMoKTtcbiAgICAgIHVuc3ViTG9ncygpO1xuICAgICAgdW5zdWJBbGVydHMoKTtcbiAgICAgIHVuc3ViUGF5cm9sbCgpO1xuICAgICAgdW5zdWJSdWxlcygpO1xuICAgICAgdW5zdWJFbXBsb3llZXMoKTtcbiAgICAgIHVuc3ViSW52b2ljZXMoKTtcbiAgICAgIHVuc3ViU2hpcG1lbnRzKCk7XG4gICAgfTtcbiAgfSwgW3VzZXJdKTtcblxuICBjb25zdCBzYXZlQ29uZmlnID0gYXN5bmMgKCkgPT4ge1xuICAgIGlmICghdXNlcikgcmV0dXJuO1xuICAgIHNldElzU2F2aW5nKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCB1cGRhdGVQcm9maWxlKHsgZGFzaGJvYXJkQ29uZmlnOiBjb25maWcgfSk7XG4gICAgICBzZXRJc0VkaXRpbmcoZmFsc2UpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgdG9hc3QuZXJyb3IoXCLZgdi02YQg2YHZiiDYrdmB2Lgg2KfZhNil2LnYr9in2K/Yp9iqXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBzZXRJc1NhdmluZyhmYWxzZSk7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbmRlclN0YXRzID0gKCkgPT4ge1xuICAgIGlmICghZGFzaGJvYXJkU3RhdHMpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxzZWN0aW9uIGtleT1cInN0YXRzLXNrZWxldG9uXCIgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtNCBnYXAtNlwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLXdoaXRlIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXppbmMtMTUwIGRhcms6Ym9yZGVyLXppbmMtODUwLzYwIHNoYWRvdy1zbSBhbmltYXRlLXB1bHNlIG1kOmNvbC1zcGFuLTJcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiByb3VuZGVkLTJ4bCBiZy16aW5jLTIwMCBkYXJrOmJnLXppbmMtODAwXCIgLz5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTE2IGgtNiByb3VuZGVkLWxnIGJnLXppbmMtMjAwIGRhcms6YmctemluYy04MDBcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMzIgaC00IGJnLXppbmMtMjAwIGRhcms6YmctemluYy04MDAgcm91bmRlZCBtdC0yIG1iLTJcIiAvPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTI0IGgtOCBiZy16aW5jLTIwMCBkYXJrOmJnLXppbmMtODAwIHJvdW5kZWQgbXQtMVwiIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAge1sxLCAyXS5tYXAoKGkpID0+IChcbiAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAga2V5PXtpfVxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJwLTYgYmctd2hpdGUgZGFyazpiZy16aW5jLTEwMC80MCBiYWNrZHJvcC1ibHVyLW1kIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGFuaW1hdGUtcHVsc2UgbWQ6Y29sLXNwYW4tMVwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMiBoLTEyIHJvdW5kZWQtMnhsIGJnLXppbmMtMjAwIGRhcms6YmctemluYy04MDBcIiAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNiBoLTYgcm91bmRlZC1sZyBiZy16aW5jLTIwMCBkYXJrOmJnLXppbmMtODAwXCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0zMiBoLTQgYmctemluYy0yMDAgZGFyazpiZy16aW5jLTgwMCByb3VuZGVkIG10LTIgbWItMlwiIC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0yNCBoLTggYmctemluYy0yMDAgZGFyazpiZy16aW5jLTgwMCByb3VuZGVkIG10LTFcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKSl9XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICk7XG4gICAgfVxuXG4gICAgbGV0IGN1cnJlbnRTdGF0cyA9IFtdO1xuICAgIGlmIChhY3RpdmVWaWV3ID09PSBcImNlb1wiKSB7XG4gICAgICBjdXJyZW50U3RhdHMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJyZXZlbnVlXCIsXG4gICAgICAgICAgbmFtZTogXCLYp9mE2LXYp9mB2Yog2KfZhNmF2KrZiNmC2LlcIixcbiAgICAgICAgICB2YWx1ZTogYCR7KGRhc2hib2FyZFN0YXRzPy5yZXZlbnVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9INixLtizYCxcbiAgICAgICAgICBjaGFuZ2U6IGRhc2hib2FyZFN0YXRzPy50cmVuZHM/LnJldmVudWVcbiAgICAgICAgICAgID8gYCR7ZGFzaGJvYXJkU3RhdHMudHJlbmRzLnJldmVudWV9JWBcbiAgICAgICAgICAgIDogXCLYutmK2LEg2YXYqtmI2YHYsVwiLFxuICAgICAgICAgIHRyZW5kOiBwYXJzZUZsb2F0KGRhc2hib2FyZFN0YXRzPy50cmVuZHM/LnJldmVudWUgfHwgMCkgPj0gMCA/IFwidXBcIiA6IFwiZG93blwiLFxuICAgICAgICAgIGljb246IFRyZW5kaW5nVXAsXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1lbWVyYWxkLTUwMFwiLFxuICAgICAgICAgIGJnOiBcImJnLWVtZXJhbGQtNTAwLzEwXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJjb21wbGlhbmNlXCIsXG4gICAgICAgICAgbmFtZTogXCLZhdik2LTYsSDYp9mE2KfZhdiq2KvYp9mEINin2YTYudin2YVcIixcbiAgICAgICAgICB2YWx1ZTogYCR7ZGFzaGJvYXJkU3RhdHM/LmNvbXBsaWFuY2VTY29yZSB8fCAwfSVgLFxuICAgICAgICAgIGNoYW5nZTogZGFzaGJvYXJkU3RhdHM/LnRyZW5kcz8uY29tcGxpYW5jZVxuICAgICAgICAgICAgPyBgJHtkYXNoYm9hcmRTdGF0cy50cmVuZHMuY29tcGxpYW5jZX0lYFxuICAgICAgICAgICAgOiBcIti62YrYsSDZhdiq2YjZgdixXCIsXG4gICAgICAgICAgdHJlbmQ6IHBhcnNlRmxvYXQoZGFzaGJvYXJkU3RhdHM/LnRyZW5kcz8uY29tcGxpYW5jZSB8fCAwKSA+PSAwID8gXCJ1cFwiIDogXCJkb3duXCIsXG4gICAgICAgICAgaWNvbjogRmlsZUNoZWNrLFxuICAgICAgICAgIGNvbG9yOiBcInRleHQtYmx1ZS01MDBcIixcbiAgICAgICAgICBiZzogXCJiZy1ibHVlLTUwMC8xMFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IFwicGF5cm9sbF9jb3N0XCIsXG4gICAgICAgICAgbmFtZTogXCLYqtmD2YTZgdipINin2YTYsdmI2KfYqtioXCIsXG4gICAgICAgICAgdmFsdWU6IGAkeyhkYXNoYm9hcmRTdGF0cz8ucGF5cm9sbENvc3QgfHwgMCkudG9Mb2NhbGVTdHJpbmcoKX0g2LEu2LNgLFxuICAgICAgICAgIGNoYW5nZTogZGFzaGJvYXJkU3RhdHM/LnRyZW5kcz8ucGF5cm9sbFxuICAgICAgICAgICAgPyBgJHtkYXNoYm9hcmRTdGF0cy50cmVuZHMucGF5cm9sbH0lYFxuICAgICAgICAgICAgOiBcIti62YrYsSDZhdiq2YjZgdixXCIsXG4gICAgICAgICAgdHJlbmQ6IHBhcnNlRmxvYXQoZGFzaGJvYXJkU3RhdHM/LnRyZW5kcz8ucGF5cm9sbCB8fCAwKSA+PSAwID8gXCJkb3duXCIgOiBcInVwXCIsXG4gICAgICAgICAgaWNvbjogVXNlcnMsXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1hbWJlci01MDBcIixcbiAgICAgICAgICBiZzogXCJiZy1hbWJlci01MDAvMTBcIixcbiAgICAgICAgfSxcbiAgICAgIF07XG4gICAgfSBlbHNlIGlmIChhY3RpdmVWaWV3ID09PSBcImhyXCIpIHtcbiAgICAgIGN1cnJlbnRTdGF0cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcIm5pdGFxYXRcIixcbiAgICAgICAgICBuYW1lOiBcItmG2LfYp9mC2KfYqiAo2YbYs9io2Kkg2KfZhNiq2YjYt9mK2YYpXCIsXG4gICAgICAgICAgdmFsdWU6IGAkeygoKGRhc2hib2FyZFN0YXRzPy5zYXVkaUVtcGxveWVlcyB8fCAwKSAvIChkYXNoYm9hcmRTdGF0cz8uZW1wbG95ZWVzQ291bnQgfHwgMSkpICogMTAwKS50b0ZpeGVkKDEpfSVgLFxuICAgICAgICAgIGNoYW5nZTpcbiAgICAgICAgICAgIGRhc2hib2FyZFN0YXRzPy5zYXVkaUVtcGxveWVlcyAvIChkYXNoYm9hcmRTdGF0cz8uZW1wbG95ZWVzQ291bnQgfHwgMSkgPiAwLjNcbiAgICAgICAgICAgICAgPyBcItin2YTZhti32KfZgiDYp9mE2KPYrti22LFcIlxuICAgICAgICAgICAgICA6IFwi2KfZhNmG2LfYp9mCINin2YTYo9i12YHYsVwiLFxuICAgICAgICAgIHRyZW5kOiBcInVwXCIsXG4gICAgICAgICAgaWNvbjogVXNlcnMsXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1lbWVyYWxkLTUwMFwiLFxuICAgICAgICAgIGJnOiBcImJnLWVtZXJhbGQtNTAwLzEwXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJ0b3RhbF9lbXBsb3llZXNcIixcbiAgICAgICAgICBuYW1lOiBcItil2KzZhdin2YTZiiDYp9mE2YXZiNi42YHZitmGXCIsXG4gICAgICAgICAgdmFsdWU6IGRhc2hib2FyZFN0YXRzPy5lbXBsb3llZXNDb3VudD8udG9TdHJpbmcoKSB8fCBcIjBcIixcbiAgICAgICAgICBjaGFuZ2U6IGRhc2hib2FyZFN0YXRzPy5lbXBsb3llZXNDb3VudCA/IGAke2Rhc2hib2FyZFN0YXRzLmVtcGxveWVlc0NvdW50fWAgOiBcIti62YrYsSDZhdiq2YjZgdixXCIsXG4gICAgICAgICAgdHJlbmQ6IFwidXBcIixcbiAgICAgICAgICBpY29uOiBVc2VycyxcbiAgICAgICAgICBjb2xvcjogXCJ0ZXh0LWJsdWUtNTAwXCIsXG4gICAgICAgICAgYmc6IFwiYmctYmx1ZS01MDAvMTBcIixcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcImVvc2JcIixcbiAgICAgICAgICBuYW1lOiBcItin2YTYqtiy2KfZhdin2Kog2YbZh9in2YrYqSDYp9mE2K7Yr9mF2KlcIixcbiAgICAgICAgICB2YWx1ZTogYCR7KChkYXNoYm9hcmRTdGF0cz8ucGF5cm9sbENvc3QgfHwgMCkgKiAwLjQpLnRvTG9jYWxlU3RyaW5nKCl9INixLtizYCxcbiAgICAgICAgICBjaGFuZ2U6IFwi2LrZitixINmF2KrZiNmB2LFcIixcbiAgICAgICAgICB0cmVuZDogXCJkb3duXCIsXG4gICAgICAgICAgaWNvbjogRmlsZVRleHQsXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1hbWJlci01MDBcIixcbiAgICAgICAgICBiZzogXCJiZy1hbWJlci01MDAvMTBcIixcbiAgICAgICAgfSxcbiAgICAgIF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGN1cnJlbnRTdGF0cyA9IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiBcInZhdFwiLFxuICAgICAgICAgIG5hbWU6IFwi2LbYsdmK2KjYqSDYp9mE2YLZitmF2Kkg2KfZhNmF2LbYp9mB2KlcIixcbiAgICAgICAgICB2YWx1ZTogYCR7KGRhc2hib2FyZFN0YXRzPy52YXRFeHBvc3VyZSB8fCAwKS50b0xvY2FsZVN0cmluZygpfSDYsS7Ys2AsXG4gICAgICAgICAgY2hhbmdlOiBcIti62YrYsSDZhdiq2YjZgdixXCIsXG4gICAgICAgICAgdHJlbmQ6IFwidXBcIixcbiAgICAgICAgICBpY29uOiBGaWxlQ2hlY2ssXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1lbWVyYWxkLTUwMFwiLFxuICAgICAgICAgIGJnOiBcImJnLWVtZXJhbGQtNTAwLzEwXCIsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogXCJpbnZvaWNlc1wiLFxuICAgICAgICAgIG5hbWU6IFwi2YHZiNin2KrZitixINmF2LnZhNmC2KlcIixcbiAgICAgICAgICB2YWx1ZTogZGFzaGJvYXJkU3RhdHM/LnBlbmRpbmdJbnZvaWNlcz8udG9TdHJpbmcoKSB8fCBcIjBcIixcbiAgICAgICAgICBjaGFuZ2U6IGRhc2hib2FyZFN0YXRzPy5wZW5kaW5nSW52b2ljZXNcbiAgICAgICAgICAgID8gYCR7ZGFzaGJvYXJkU3RhdHMucGVuZGluZ0ludm9pY2VzfWBcbiAgICAgICAgICAgIDogXCLYutmK2LEg2YXYqtmI2YHYsVwiLFxuICAgICAgICAgIHRyZW5kOiBcImRvd25cIixcbiAgICAgICAgICBpY29uOiBGaWxlVGV4dCxcbiAgICAgICAgICBjb2xvcjogXCJ0ZXh0LWFtYmVyLTUwMFwiLFxuICAgICAgICAgIGJnOiBcImJnLWFtYmVyLTUwMC8xMFwiLFxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgaWQ6IFwicmV2ZW51ZV9hY2NcIixcbiAgICAgICAgICBuYW1lOiBcItil2KzZhdin2YTZiiDYp9mE2KXZitix2KfYr9in2KpcIixcbiAgICAgICAgICB2YWx1ZTogYCR7KGRhc2hib2FyZFN0YXRzPy5yZXZlbnVlIHx8IDApLnRvTG9jYWxlU3RyaW5nKCl9INixLtizYCxcbiAgICAgICAgICBjaGFuZ2U6IGRhc2hib2FyZFN0YXRzPy50cmVuZHM/LnJldmVudWVcbiAgICAgICAgICAgID8gYCR7ZGFzaGJvYXJkU3RhdHMudHJlbmRzLnJldmVudWV9JWBcbiAgICAgICAgICAgIDogXCLYutmK2LEg2YXYqtmI2YHYsVwiLFxuICAgICAgICAgIHRyZW5kOiBwYXJzZUZsb2F0KGRhc2hib2FyZFN0YXRzPy50cmVuZHM/LnJldmVudWUgfHwgMCkgPj0gMCA/IFwidXBcIiA6IFwiZG93blwiLFxuICAgICAgICAgIGljb246IFRyZW5kaW5nVXAsXG4gICAgICAgICAgY29sb3I6IFwidGV4dC1ibHVlLTUwMFwiLFxuICAgICAgICAgIGJnOiBcImJnLWJsdWUtNTAwLzEwXCIsXG4gICAgICAgIH0sXG4gICAgICBdO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBrZXk9XCJzdGF0c1wiIGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTQgZ2FwLTZcIj5cbiAgICAgICAge2N1cnJlbnRTdGF0cy5tYXAoKHN0YXQsIGkpID0+IHtcbiAgICAgICAgICBjb25zdCBpc0xhcmdlID0gaSA9PT0gMDtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgICAga2V5PXtzdGF0LmlkfVxuICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHk6IDIwIH19XG4gICAgICAgICAgICAgIGFuaW1hdGU9e3sgb3BhY2l0eTogMSwgeTogMCB9fVxuICAgICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHk6IC02LCBzY2FsZTogMS4wMSB9fVxuICAgICAgICAgICAgICB0cmFuc2l0aW9uPXt7XG4gICAgICAgICAgICAgICAgb3BhY2l0eTogeyBkdXJhdGlvbjogMC4zLCBkZWxheTogaSAqIDAuMSB9LFxuICAgICAgICAgICAgICAgIHk6IHsgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDIwIH0sXG4gICAgICAgICAgICAgICAgc2NhbGU6IHsgZHVyYXRpb246IDAuMiB9LFxuICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgIFwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuXCIsXG4gICAgICAgICAgICAgICAgXCJiZy13aGl0ZSBkYXJrOmJnLXppbmMtMTAwLzQwIGJhY2tkcm9wLWJsdXItbWQgYm9yZGVyLXppbmMtMTUwIGRhcms6Ym9yZGVyLXppbmMtODUwLzYwIHNoYWRvdy1zbSBob3ZlcjpzaGFkb3ctbGcgZGFyazpob3ZlcjpzaGFkb3ctYmxhY2svMzAgaG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwIGRhcms6aG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwXCIsXG4gICAgICAgICAgICAgICAgaXNMYXJnZSA/IFwibWQ6Y29sLXNwYW4tMlwiIDogXCJtZDpjb2wtc3Bhbi0xXCJcbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgey8qIEJhY2tncm91bmQgZ2xvd3Mgb24gbGFyZ2UgY2FyZCAqL31cbiAgICAgICAgICAgICAge2lzTGFyZ2UgJiYgKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTMyIGgtMzIgYmctZW1lcmFsZC01MDAvNSBkYXJrOmJnLWVtZXJhbGQtNTAwLzEwIHJvdW5kZWQtZnVsbCBibHVyLTJ4bCBwb2ludGVyLWV2ZW50cy1ub25lXCIgLz5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLXN0YXJ0IG1iLTZcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbihcInAtMyByb3VuZGVkLTJ4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiLCBzdGF0LmJnKX0+XG4gICAgICAgICAgICAgICAgICAgIDxzdGF0Lmljb24gY2xhc3NOYW1lPXtjbihcInctNiBoLTZcIiwgc3RhdC5jb2xvcil9IC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgICAgICBcImZsZXggaXRlbXMtY2VudGVyIGdhcC0xIHRleHQteHMgZm9udC1ibGFjayBweC0yLjUgcHktMSByb3VuZGVkLXhsIGJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgIHN0YXQudHJlbmQgPT09IFwidXBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgPyBcInRleHQtZW1lcmFsZC02MDAgYmctZW1lcmFsZC01MC84MCBkYXJrOmJnLWVtZXJhbGQtNTAwLzEwIGJvcmRlci1lbWVyYWxkLTEwMCBkYXJrOmJvcmRlci1lbWVyYWxkLTUwMC8xMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC1yb3NlLTYwMCBiZy1yb3NlLTUwLzgwIGRhcms6Ymctcm9zZS01MDAvMTAgYm9yZGVyLXJvc2UtMTAwIGRhcms6Ym9yZGVyLXJvc2UtNTAwLzEwXCJcbiAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge3N0YXQudHJlbmQgPT09IFwidXBcIiA/IChcbiAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgICA8QXJyb3dEb3duUmlnaHQgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjVcIiAvPlxuICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICB7c3RhdC5jaGFuZ2V9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIGRhcms6dGV4dC16aW5jLTQwMCB0ZXh0LXNtIGZvbnQtYmxhY2sgbWItMVwiPlxuICAgICAgICAgICAgICAgICAge3N0YXQubmFtZX1cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCBkYXJrOnRleHQtemluYy0xMDAgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICAgIHtzdGF0LnZhbHVlfVxuICAgICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHtpc0xhcmdlICYmIChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm10LTYgcHQtNCBib3JkZXItdCBib3JkZXItemluYy0xMDAgZGFyazpib3JkZXItemluYy04MDAvNDBcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gdGV4dC1bMTBweF0gZm9udC1ibGFjayB0ZXh0LXppbmMtNDAwIG1iLTEuNSB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4+2YXYudiv2YQg2KfZhNij2K/Yp9ihINin2YTZhdiz2KrZh9iv2YE8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPjkyJTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LWZ1bGwgYmctemluYy0xMDAgZGFyazpiZy16aW5jLTgwMC82MCBoLTIgcm91bmRlZC1mdWxsIG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWVtZXJhbGQtNTAwIGgtZnVsbCByb3VuZGVkLWZ1bGwgdy1bODglXVwiIC8+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9O1xuXG4gIGNvbnN0IHRvZ2dsZVZpc2liaWxpdHkgPSAoaWQ6IHN0cmluZykgPT4ge1xuICAgIHNldENvbmZpZygocHJldikgPT4gcHJldi5tYXAoKHcpID0+ICh3LmlkID09PSBpZCA/IHsgLi4udywgdmlzaWJsZTogIXcudmlzaWJsZSB9IDogdykpKTtcbiAgfTtcblxuICBjb25zdCByZW5kZXJXaWRnZXQgPSAod2lkZ2V0SWQ6IHN0cmluZykgPT4ge1xuICAgIHN3aXRjaCAod2lkZ2V0SWQpIHtcbiAgICAgIGNhc2UgXCJvcGVud2Ffc3RhdHVzXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPHNlY3Rpb25cbiAgICAgICAgICAgIGtleT1cIm9wZW53YV9zdGF0dXNcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC1bMnJlbV0gYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gcC02IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIHNtOmZsZXgtcm93IHNtOml0ZW1zLWNlbnRlciBzbTpqdXN0aWZ5LWJldHdlZW4gZ2FwLTQgbWItNlwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgICAgXCJwLTMgcm91bmRlZC0yeGwgc2hyaW5rLTBcIixcbiAgICAgICAgICAgICAgICAgICAgd2FTdGF0dXMgPT09IFwiY29ubmVjdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNjAwIGJvcmRlciBib3JkZXItZW1lcmFsZC0xMDBcIlxuICAgICAgICAgICAgICAgICAgICAgIDogd2FTdGF0dXMgPT09IFwiZGlzY29ubmVjdGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1yb3NlLTUwIHRleHQtcm9zZS02MDAgYm9yZGVyIGJvcmRlci1yb3NlLTEwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA6IHdhU3RhdHVzID09PSBcImRpc2FibGVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcImJnLXppbmMtMTAwIHRleHQtemluYy01MDAgYm9yZGVyIGJvcmRlci16aW5jLTIwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJiZy1ibHVlLTUwIHRleHQtYmx1ZS02MDAgYm9yZGVyIGJvcmRlci1ibHVlLTEwMFwiXG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxNZXNzYWdlU3F1YXJlIGNsYXNzTmFtZT1cInctNiBoLTZcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ibGFjayB0ZXh0LWxnIHRleHQtemluYy05MDBcIj7Zhdix2KfZgtioINin2KrYtdin2YQg2YjYp9iq2LPYp9ioIChPcGVuV0EpPC9oMz5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTQwMCBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICAgICAg2KfZhNiq2K3ZgtmCINin2YTZhdiz2KrZhdixINmF2YYg2YLZhtmI2KfYqiDYp9mE2LHYqNi3INmI2K3Yp9mE2Kkg2LfYp9io2YjYsSDYp9mE2YXYudin2YTYrNipINin2YTYotmE2YpcbiAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBzZWxmLXN0YXJ0IHNtOnNlbGYtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAge3dhU3RhdHVzID09PSBcImNvbm5lY3RlZFwiICYmIChcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IHRleHQtWzExcHhdIGZvbnQtYmxhY2sgYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNzAwIGJvcmRlciBib3JkZXItZW1lcmFsZC0yMDAgcm91bmRlZC1mdWxsIHNoYWRvdy1zbVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3LTIgaC0yIHJvdW5kZWQtZnVsbCBiZy1lbWVyYWxkLTUwMCBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAg2YXYqti12YQg2K3Zitin2YtcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHt3YVN0YXR1cyA9PT0gXCJkaXNjb25uZWN0ZWRcIiAmJiAoXG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEuNSBweC0zIHB5LTEuNSB0ZXh0LVsxMXB4XSBmb250LWJsYWNrIGJnLXJvc2UtNTAgdGV4dC1yb3NlLTcwMCBib3JkZXIgYm9yZGVyLXJvc2UtMjAwIHJvdW5kZWQtZnVsbCBzaGFkb3ctc20gYW5pbWF0ZS1wdWxzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ3LTIgaC0yIHJvdW5kZWQtZnVsbCBiZy1yb3NlLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgICAgINin2YbZgti32Lkg2KfZhNin2KrYtdin2YRcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIHt3YVN0YXR1cyA9PT0gXCJkaXNhYmxlZFwiICYmIChcbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImlubGluZS1mbGV4IGl0ZW1zLWNlbnRlciBnYXAtMS41IHB4LTMgcHktMS41IHRleHQtWzExcHhdIGZvbnQtYmxhY2sgYmctemluYy0xMDAgdGV4dC16aW5jLTYwMCBib3JkZXIgYm9yZGVyLXppbmMtMjAwIHJvdW5kZWQtZnVsbCBzaGFkb3ctc21cIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidy0yIGgtMiByb3VuZGVkLWZ1bGwgYmctemluYy00MDBcIiAvPlxuICAgICAgICAgICAgICAgICAgICDYutmK2LEg2YXZgdi52ZHZhFxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAge3dhU3RhdHVzID09PSBcImNoZWNraW5nXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xLjUgcHgtMyBweS0xLjUgdGV4dC1bMTFweF0gZm9udC1ibGFjayBiZy1ibHVlLTUwIHRleHQtYmx1ZS03MDAgYm9yZGVyIGJvcmRlci1ibHVlLTIwMCByb3VuZGVkLWZ1bGwgc2hhZG93LXNtXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInctMiBoLTIgcm91bmRlZC1mdWxsIGJnLWJsdWUtNTAwIGFuaW1hdGUtc3BpbiBib3JkZXItdC10cmFuc3BhcmVudCBib3JkZXIgYm9yZGVyLXNvbGlkXCIgLz5cbiAgICAgICAgICAgICAgICAgICAg2KzYp9ix2Yog2KfZhNmB2K3YtS4uLlxuICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNFwiPlxuICAgICAgICAgICAgICB7LyogQm94IDE6IFN0YXR1cyBEZXRhaWxzICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNSBiZy16aW5jLTUwIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItemluYy0xMDAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBmb250LWJsYWNrIHRyYWNraW5nLXdpZGVyIHVwcGVyY2FzZSBibG9jayBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgINiq2YHYp9i12YrZhCDYp9mE2KzZhNiz2KlcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIHRleHQtemluYy02MDAgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICAgICAgICAgIHt3YVN0YXR1cyA9PT0gXCJjb25uZWN0ZWRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgIFwi2KfZhNix2KjYtyDZhti02Lcg2K3Yp9mE2YrYp9mLINmI2KrYqtmFINmF2LLYp9mF2YbYqSDYp9mE2YXYrdin2K/Yq9in2Kog2KfZhNmI2KfYsdiv2Kkg2YXYuSDYp9mE2YHYsdi1INin2YTYqNmK2LnZitipINmB2YjYsdin2YsuXCJ9XG4gICAgICAgICAgICAgICAgICAgIHt3YVN0YXR1cyA9PT0gXCJkaXNjb25uZWN0ZWRcIiAmJlxuICAgICAgICAgICAgICAgICAgICAgIFwi2KfZhNis2YTYs9ipINmF2YbZgti32LnYqSDYrdin2YTZitin2YsuINmK2LHYrNmJINil2LnYp9iv2Kkg2KfZhNin2KrYtdin2YQg2YTYqtmB2KfYr9mKINiq2YjZgtmBINij2KrZhdiq2Kkg2KfZhNix2K/ZiNivINmI2KfZhNix2LPYp9im2YQuXCJ9XG4gICAgICAgICAgICAgICAgICAgIHt3YVN0YXR1cyA9PT0gXCJkaXNhYmxlZFwiICYmXG4gICAgICAgICAgICAgICAgICAgICAgXCLYsdio2Lcg2YjYp9iq2LPYp9ioINi62YrYsSDZhdmB2LnZhCDYrdin2YTZitin2YsuINmK2YXZg9mG2YMg2KrZgdi52YrZhNmHINmF2YYg2LTYp9i02Kkg2KfZhNil2LnYr9in2K/Yp9iqINio2LbYuti32Kkg2LLYsS5cIn1cbiAgICAgICAgICAgICAgICAgICAge3dhU3RhdHVzID09PSBcImNoZWNraW5nXCIgJiYgXCLZitiq2YUg2YHYrdi1INiu2KfYr9mFIE9wZW5XQSDZiNin2YTYqtit2YLZgiDZhdmGINiz2YTYp9mF2Kkg2KfZhNis2YTYs9ipLi4uXCJ9XG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAge3dhU3RhdHVzID09PSBcImRpc2Nvbm5lY3RlZFwiICYmIChcbiAgICAgICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgICAgIHRvPVwiL2FwcC9zZXR0aW5nc1wiXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTQgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHMgZm9udC1ibGFjayB0ZXh0LXJvc2UtNjAwIGhvdmVyOmdhcC0zIHRyYW5zaXRpb24tYWxsIHNlbGYtc3RhcnRcIlxuICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICA8c3Bhbj7Ypdi52KfYr9ipINin2YTZhdiz2K0g2YjYp9mE2LHYqNi3PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAge3dhU3RhdHVzID09PSBcImRpc2FibGVkXCIgJiYgKFxuICAgICAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICAgICAgdG89XCIvYXBwL3NldHRpbmdzXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwibXQtNCBpbmxpbmUtZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTIgdGV4dC14cyBmb250LWJsYWNrIHRleHQtemluYy02MDAgaG92ZXI6Z2FwLTMgdHJhbnNpdGlvbi1hbGwgc2VsZi1zdGFydFwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuPtiq2YHYudmK2YQg2KfZhNiu2K/ZhdipPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHsvKiBCb3ggMjogUXVldWUgU3RhdHMgKi99XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC01IGJnLXppbmMtNTAgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIGZvbnQtYmxhY2sgdHJhY2tpbmctd2lkZXIgdXBwZXJjYXNlIGJsb2NrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgICAg2LfYp9io2YjYsSDYp9mE2LHYs9in2KbZhCAoUXVldWUpXG4gICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtYmFzZWxpbmUgZ2FwLTIgbWItMVwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgZm9udC1tb25vXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3F1ZXVlQ291bnR9XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNDAwIGZvbnQtYm9sZFwiPtmF2LPYrNmE2Kkg2KjYp9mE2K7Yp9iv2YU8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBmb250LW1lZGl1bSBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgICAg2KrYrtiy2YrZhiDYp9mE2KPYrdiv2KfYqyDZiNin2YTYsdiz2KfYptmEINii2YTZitin2Ysg2YHZiiBGaXJlc3RvcmUg2YTZhdmG2Lkg2YHZgtiv2KfZhiDYp9mE2KjZitin2YbYp9iqINi52YbYryDYrdiv2YjYqyDYtti62Lcg2LnYp9mE2Y1cbiAgICAgICAgICAgICAgICAgICAg2YTZhNix2LPYp9im2YQg2YLYqNmEINmF2LnYp9mE2KzYqtmH2KcuXG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIHsvKiBCb3ggMzogUmVhbHRpbWUgUHJvY2Vzc29yIFN0YXR1cyAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTUgYmctemluYy01MCByb3VuZGVkLTJ4bCBib3JkZXIgYm9yZGVyLXppbmMtMTAwIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtemluYy00MDAgZm9udC1ibGFjayB0cmFja2luZy13aWRlciB1cHBlcmNhc2UgYmxvY2sgbWItMVwiPlxuICAgICAgICAgICAgICAgICAgICDYp9mE2YXYudin2YTYrCDYp9mE2LDZg9mKINin2YTYotmE2YpcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1iYXNlbGluZSBnYXAtMiBtYi0xXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidGV4dC0yeGwgZm9udC1ibGFjayBmb250LW1vbm9cIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHBlbmRpbmdRdWV1ZUNvdW50ID4gMCA/IFwidGV4dC1hbWJlci02MDAgYW5pbWF0ZS1wdWxzZVwiIDogXCJ0ZXh0LWVtZXJhbGQtNjAwXCJcbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAge3BlbmRpbmdRdWV1ZUNvdW50fVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTQwMCBmb250LWJvbGRcIj7Zhdi52YTZgtipINmC2YrYryDYp9mE2YXYudin2YTYrNipPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgZm9udC1tZWRpdW0gbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICAgICAgICAgIHtwZW5kaW5nUXVldWVDb3VudCA+IDBcbiAgICAgICAgICAgICAgICAgICAgICA/IFwi2KzYp9ix2Yog2KfZhNix2KjYtyDZiNin2YTYqti12YbZitmBINin2YTYqtmE2YLYp9im2Yog2YTZhNix2LPYp9im2YQg2YXYuSDYrdiz2KfYqNin2Kog2YjZhdmE2YHYp9iqINin2YTYudmF2YTYp9ihINmB2Yog2KfZhNmAIENSTSDYrdmK2KfZiy5cIlxuICAgICAgICAgICAgICAgICAgICAgIDogXCLYrNmF2YrYuSDYp9mE2LHYs9in2KbZhCDYp9mE2YjYp9ix2K/YqSDZhdi52KfZhNis2Kkg2YjZhdik2LHYtNmB2Kkg2KjYp9mE2YPYp9mF2YQg2YjZhdix2KrYqNi32Kkg2KjZhdmE2YHYp9iqINin2YTYudmF2YTYp9ihINio2YbYrNin2K0uXCJ9XG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICApO1xuXG4gICAgICBjYXNlIFwiYnVzaW5lc3NfaGVhbHRoXCI6IHtcbiAgICAgICAgY29uc3QgaGVhbHRoID0gZGFzaGJvYXJkU3RhdHM/LmJ1c2luZXNzSGVhbHRoIHx8IHtcbiAgICAgICAgICBzY29yZTogNzUsXG4gICAgICAgICAgY2FjOiA0NTAsXG4gICAgICAgICAgYXZlcmFnZUFnaW5nRGF5czogMTQsXG4gICAgICAgICAgZXhwbGFuYXRpb25BcjpcbiAgICAgICAgICAgIFwi2LXYrdipINin2YTYo9i52YXYp9mEINmF2LnYqtiv2YTYqSDZiNmF2LPYqtmC2LHYqS4g2KfZhNil2YrYsdin2K/Yp9iqINiq2K/YudmFINin2LPYqtmF2LHYp9ixINin2YTZhtmF2Ygg2YjZhNmD2YYg2YfZhtin2YMg2YHYsdi12Kkg2YTYqtit2LPZitmGINin2YTYqtiv2YHZgiDYp9mE2YbZgtiv2Yog2LnYqNixINmF2KrYp9io2LnYqSDYp9mE2YHZiNin2KrZitixLlwiLFxuICAgICAgICAgIGV4cGxhbmF0aW9uRW46XG4gICAgICAgICAgICBcIkJ1c2luZXNzIGhlYWx0aCBpcyBtb2RlcmF0ZSBhbmQgc3RhYmxlLiBSZXZlbnVlIHN1cHBvcnRzIGNvbnRpbnVlZCBncm93dGgsIGJ1dCB0aGVyZSBpcyBhbiBvcHBvcnR1bml0eSB0byBpbXByb3ZlIGNhc2ggZmxvdyBieSBmb2xsb3dpbmcgdXAgb24gaW52b2ljZXMuXCIsXG4gICAgICAgICAgcmVjb21tZW5kYXRpb25zQXI6IFtcbiAgICAgICAgICAgIFwi2KrZgdi52YrZhCDYqtiw2YPZitix2KfYqiDYp9mE2K/Zgdi5INin2YTYqtmE2YLYp9im2YrYqSAoV2hhdHNBcHApINmE2KrZgtmE2YrYtSDYudmF2LEg2KfZhNmB2YjYp9iq2YrYsSDYp9mE2YXYudmE2YLYqS5cIixcbiAgICAgICAgICAgIFwi2KrYrdiz2YrZhiDZgtmG2YjYp9iqINin2LPYqtmH2K/Yp9mBINin2YTYudmF2YTYp9ihINmE2K7Zgdi2INiq2YPZhNmB2Kkg2K3Zitin2LLYqSDYp9mE2LnZhdmK2YQuXCIsXG4gICAgICAgICAgICBcItmF2LHYp9is2LnYqSDYtNix2YjYtyDYp9mE2LPYr9in2K8g2YTZhNi52YXZhNin2KEg2LDZiNmKINin2YTYr9mB2Lkg2KfZhNmF2KrYo9iu2LEuXCIsXG4gICAgICAgICAgXSxcbiAgICAgICAgICByZWNvbW1lbmRhdGlvbnNFbjogW1xuICAgICAgICAgICAgXCJBY3RpdmF0ZSBhdXRvbWF0ZWQgcGF5bWVudCByZW1pbmRlcnMgKFdoYXRzQXBwKSB0byBhY2NlbGVyYXRlIG91dHN0YW5kaW5nIGludm9pY2UgY29sbGVjdGlvbi5cIixcbiAgICAgICAgICAgIFwiT3B0aW1pemUgY3VzdG9tZXIgdGFyZ2V0aW5nIGNoYW5uZWxzIHRvIGxvd2VyIGN1c3RvbWVyIGFjcXVpc2l0aW9uIGNvc3QgKENBQykuXCIsXG4gICAgICAgICAgICBcIlJldmlldyBjcmVkaXQgdGVybXMgZm9yIGNsaWVudHMgd2l0aCByZXBlYXRlZCBwYXltZW50IGRlbGF5cy5cIixcbiAgICAgICAgICBdLFxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnN0IHNjb3JlID0gaGVhbHRoLnNjb3JlO1xuICAgICAgICBjb25zdCBpc0FyID0gc2V0dGluZ3M/Lmxhbmd1YWdlID09PSBcImFyXCI7XG5cbiAgICAgICAgLy8gQ29sb3IgbWFwcGluZ1xuICAgICAgICBsZXQgY29sb3JDbGFzcyA9XG4gICAgICAgICAgXCJ0ZXh0LWVtZXJhbGQtNTAwIGJnLWVtZXJhbGQtNTAwLzEwIGJvcmRlci1lbWVyYWxkLTUwMC8yMCBkYXJrOmJvcmRlci1lbWVyYWxkLTUwMC8yMFwiO1xuICAgICAgICBsZXQgc3RhdHVzVGV4dCA9IGlzQXIgPyBcItmF2YXYqtin2LIg2KzYr9in2YtcIiA6IFwiRXhjZWxsZW50XCI7XG4gICAgICAgIGxldCBnbG93Q29sb3IgPSBcInJnYmEoMTYsIDE4NSwgMTI5LCAwLjE1KVwiO1xuXG4gICAgICAgIGlmIChzY29yZSA8IDYwKSB7XG4gICAgICAgICAgY29sb3JDbGFzcyA9IFwidGV4dC1yb3NlLTUwMCBiZy1yb3NlLTUwMC8xMCBib3JkZXItcm9zZS01MDAvMjAgZGFyazpib3JkZXItcm9zZS01MDAvMjBcIjtcbiAgICAgICAgICBzdGF0dXNUZXh0ID0gaXNBciA/IFwi2KjYrdin2KzYqSDZhNiq2K/YrtmEINi52KfYrNmEXCIgOiBcIkNyaXRpY2FsIEludGVydmVudGlvbiBOZWVkZWRcIjtcbiAgICAgICAgICBnbG93Q29sb3IgPSBcInJnYmEoMjM5LCA2OCwgNjgsIDAuMTUpXCI7XG4gICAgICAgIH0gZWxzZSBpZiAoc2NvcmUgPCA4NSkge1xuICAgICAgICAgIGNvbG9yQ2xhc3MgPVxuICAgICAgICAgICAgXCJ0ZXh0LWFtYmVyLTUwMCBiZy1hbWJlci01MDAvMTAgYm9yZGVyLWFtYmVyLTUwMC8yMCBkYXJrOmJvcmRlci1hbWJlci01MDAvMjBcIjtcbiAgICAgICAgICBzdGF0dXNUZXh0ID0gaXNBciA/IFwi2YXYs9iq2YLYsSDZhdi5INiq2YbYqNmK2YfYp9iqXCIgOiBcIlN0YWJsZSB3aXRoIFdhcm5pbmdzXCI7XG4gICAgICAgICAgZ2xvd0NvbG9yID0gXCJyZ2JhKDI0NSwgMTU4LCAxMSwgMC4xNSlcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhbmRsZVJlY29tbWVuZGF0aW9uQ2xpY2sgPSAocmVjOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICByZWMuaW5jbHVkZXMoXCJXaGF0c0FwcFwiKSB8fFxuICAgICAgICAgICAgcmVjLmluY2x1ZGVzKFwi2YjYp9iq2LPYp9ioXCIpIHx8XG4gICAgICAgICAgICByZWMuaW5jbHVkZXMoXCLYqtit2LXZitmEXCIpIHx8XG4gICAgICAgICAgICByZWMuaW5jbHVkZXMoXCJjb2xsZWN0aW9uXCIpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0b2FzdC5zdWNjZXNzKFxuICAgICAgICAgICAgICBpc0FyXG4gICAgICAgICAgICAgICAgPyBcIvCfqoQg2KrZhSDYqtmB2LnZitmEINin2YTYqtiw2YPZitix2KfYqiDZiNin2YTZhdiq2KfYqNi52KfYqiDYp9mE2LDZg9mK2Kkg2KjZhtis2KfYrSDZiNiq2YjYrNmK2Ycg2KfZhNi52YXZhNin2KEg2KfZhNmF2KrYo9iu2LHZitmGINmB2YogV2hhdHNBcHAgU2FsZXMgSHViIVwiXG4gICAgICAgICAgICAgICAgOiBcIvCfqoQgQUkgQXV0b21hdGVkIGZvbGxvdy11cHMgYWN0aXZhdGVkIHN1Y2Nlc3NmdWxseSBpbiBXaGF0c0FwcCBTYWxlcyBIdWIgZm9yIGFsbCBwYXN0LWR1ZSBpbnZvaWNlcyFcIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdG9hc3Quc3VjY2VzcyhcbiAgICAgICAgICAgICAgaXNBclxuICAgICAgICAgICAgICAgID8gXCLimpnvuI8g2KzYp9ix2Yog2KrYt9io2YrZgiDYp9mE2KrZiNi12YrYqSDYp9mE2KXYs9iq2LHYp9iq2YrYrNmK2Kkg2YjYqtit2LPZitmGINmG2YXZiNiw2Kwg2K3Zitin2LLYqSDYp9mE2LnZhdmE2KfYoS4uLlwiXG4gICAgICAgICAgICAgICAgOiBcIuKame+4jyBBcHBseWluZyBzdHJhdGVnaWMgb3B0aW1pemF0aW9uIGFuZCByZWZpbmluZyBjdXN0b21lciBhY3F1aXNpdGlvbiBtb2RlbGluZy4uLlwiXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzZWN0aW9uXG4gICAgICAgICAgICBrZXk9XCJidXNpbmVzc19oZWFsdGhcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctd2hpdGUgZGFyazpiZy16aW5jLTEwMC80MCBiYWNrZHJvcC1ibHVyLW1kIHJvdW5kZWQtWzJyZW1dIGJvcmRlciBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIHAtNiByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW4gdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIGhvdmVyOnNoYWRvdy1tZFwiXG4gICAgICAgICAgICBzdHlsZT17eyBib3hTaGFkb3c6IGAwIDEwcHggMzBweCAtMTBweCAke2dsb3dDb2xvcn1gIH19XG4gICAgICAgICAgPlxuICAgICAgICAgICAgey8qIE91dGVyIHNvZnQgZ2xvd2luZyBiYWNrZ3JvdW5kIGRlY29yYXRpdmUgY2lyY2xlICovfVxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9XCJhYnNvbHV0ZSAtcmlnaHQtMTYgLXRvcC0xNiB3LTQ4IGgtNDggcm91bmRlZC1mdWxsIGJsdXItM3hsIG9wYWNpdHktMzAgcG9pbnRlci1ldmVudHMtbm9uZVwiXG4gICAgICAgICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZENvbG9yOiBzY29yZSA8IDYwID8gXCIjZjQzZjVlXCIgOiBzY29yZSA8IDg1ID8gXCIjZjU5ZTBiXCIgOiBcIiMxMGI5ODFcIixcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIC8+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBsZzpmbGV4LXJvdyBpdGVtcy1jZW50ZXIgZ2FwLTYgcmVsYXRpdmUgei0xMFwiPlxuICAgICAgICAgICAgICB7LyogTGVmdCBTaWRlOiBTY29yZSBXaGVlbCAvIFZpc3VhbCBHYXVnZSAqL31cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMCB3LWZ1bGwgbGc6dy00OCBwLTQgYmctemluYy01MCBkYXJrOmJnLXppbmMtODAwLzQwIHJvdW5kZWQtMnhsIGJvcmRlciBib3JkZXItemluYy0xMDAgZGFyazpib3JkZXItemluYy04MDBcIj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJsYWNrIHVwcGVyY2FzZSB0ZXh0LXppbmMtNDAwIHRyYWNraW5nLXdpZGVyIG1iLTJcIj5cbiAgICAgICAgICAgICAgICAgIHtpc0FyID8gXCLZhdik2LTYsSDYtdit2Kkg2KfZhNij2LnZhdin2YRcIiA6IFwiQnVzaW5lc3MgSGVhbHRoXCJ9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuXG4gICAgICAgICAgICAgICAgey8qIFZpc3VhbCBDaXJjbGUgUHJvZ3Jlc3MgKi99XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJyZWxhdGl2ZSB3LTI4IGgtMjggZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCB0cmFuc2Zvcm0gLXJvdGF0ZS05MFwiIHZpZXdCb3g9XCIwIDAgMTAwIDEwMFwiPlxuICAgICAgICAgICAgICAgICAgICB7LyogQmFja2dyb3VuZCB0cmFjayAqL31cbiAgICAgICAgICAgICAgICAgICAgPGNpcmNsZVxuICAgICAgICAgICAgICAgICAgICAgIGN4PVwiNTBcIlxuICAgICAgICAgICAgICAgICAgICAgIGN5PVwiNTBcIlxuICAgICAgICAgICAgICAgICAgICAgIHI9XCI0MFwiXG4gICAgICAgICAgICAgICAgICAgICAgZmlsbD1cInRyYW5zcGFyZW50XCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9XCJyZ2JhKDIyOCwgMjI4LCAyMzEsIDAuNClcIlxuICAgICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPVwiMTBcIlxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICB7LyogUHJvZ3Jlc3MgdHJhY2sgKi99XG4gICAgICAgICAgICAgICAgICAgIDxjaXJjbGVcbiAgICAgICAgICAgICAgICAgICAgICBjeD1cIjUwXCJcbiAgICAgICAgICAgICAgICAgICAgICBjeT1cIjUwXCJcbiAgICAgICAgICAgICAgICAgICAgICByPVwiNDBcIlxuICAgICAgICAgICAgICAgICAgICAgIGZpbGw9XCJ0cmFuc3BhcmVudFwiXG4gICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPXtzY29yZSA8IDYwID8gXCIjZjQzZjVlXCIgOiBzY29yZSA8IDg1ID8gXCIjZjU5ZTBiXCIgOiBcIiMxMGI5ODFcIn1cbiAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD1cIjEwXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHJva2VEYXNoYXJyYXk9XCIyNTEuMlwiXG4gICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlRGFzaG9mZnNldD17MjUxLjIgLSAoMjUxLjIgKiBzY29yZSkgLyAxMDB9XG4gICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlTGluZWNhcD1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSBpbnNldC0wIGZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYmxhY2sgZm9udC1tb25vIHRleHQtemluYy05MDAgZGFyazp0ZXh0LXppbmMtMTAwXCI+XG4gICAgICAgICAgICAgICAgICAgICAge3Njb3JlfVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayB0ZXh0LXppbmMtNDAwXCI+LyAxMDA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgICAgICBcIm10LTMgcHgtMi41IHB5LTEgcm91bmRlZC1mdWxsIHRleHQtWzEwcHhdIGZvbnQtYmxhY2sgYm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIGNvbG9yQ2xhc3NcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge3N0YXR1c1RleHR9XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICB7LyogUmlnaHQgU2lkZTogQUkgRXhwbGFuYXRpb25zICYgUmVjb21tZW5kYXRpb25zICovfVxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgtMSBzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiBtYi0xLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiZmxleCBoLTIgdy0yIHJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiYW5pbWF0ZS1waW5nIGFic29sdXRlIGlubGluZS1mbGV4IGgtZnVsbCB3LWZ1bGwgcm91bmRlZC1mdWxsIGJnLWluZGlnby00MDAgb3BhY2l0eS03NVwiPjwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJyZWxhdGl2ZSBpbmxpbmUtZmxleCByb3VuZGVkLWZ1bGwgaC0yIHctMiBiZy1pbmRpZ28tNTAwXCI+PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYmxhY2sgdGV4dC1pbmRpZ28tNjAwIGRhcms6dGV4dC1pbmRpZ28tNDAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTFcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8WmFwIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIHtpc0FyID8gXCLYqtit2YTZitmEINin2YTYsNmD2KfYoSDYp9mE2KfYtdi32YbYp9i52Yog2KfZhNmB2YjYsdmKXCIgOiBcIlJlYWwtdGltZSBBSSBCdXNpbmVzcyBBbmFseXNpc1wifVxuICAgICAgICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtc2VtaWJvbGQgdGV4dC16aW5jLTcwMCBkYXJrOnRleHQtemluYy0zMDAgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICAgICAgICAgIHtpc0FyID8gaGVhbHRoLmV4cGxhbmF0aW9uQXIgOiBoZWFsdGguZXhwbGFuYXRpb25Fbn1cbiAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIHsvKiBTdWItS1BJIHN0YXRzIGJhciBpbnNpZGUgdGhlIGhlYWx0aCBzY29yZSAqL31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTMgcC0zIGJnLXppbmMtNTAgZGFyazpiZy16aW5jLTgwMC80MCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItemluYy0xMDAgZGFyazpib3JkZXItemluYy04MDBcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWJsYWNrIHRleHQtemluYy00MDAgbWItMC41XCI+XG4gICAgICAgICAgICAgICAgICAgICAge2lzQXIgPyBcItin2KrYrNin2Ycg2KfZhNil2YrYsdin2K/Yp9iqXCIgOiBcIlJldmVudWUgVHJlbmRcIn1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cFxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICAgICAgICBcInRleHQteHMgZm9udC1ib2xkIGZvbnQtbW9ub1wiLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VGbG9hdChkYXNoYm9hcmRTdGF0cz8udHJlbmRzPy5yZXZlbnVlIHx8IDApID49IDBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInRleHQtZW1lcmFsZC02MDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC1yb3NlLTYwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgIHtwYXJzZUZsb2F0KGRhc2hib2FyZFN0YXRzPy50cmVuZHM/LnJldmVudWUgfHwgMCkgPj0gMCA/IFwiK1wiIDogXCJcIn1cbiAgICAgICAgICAgICAgICAgICAgICB7ZGFzaGJvYXJkU3RhdHM/LnRyZW5kcz8ucmV2ZW51ZSB8fCAwfSVcbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIGJvcmRlci14IGJvcmRlci16aW5jLTIwMC82MCBkYXJrOmJvcmRlci16aW5jLTgwMC82MFwiPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtYmxhY2sgdGV4dC16aW5jLTQwMCBtYi0wLjVcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7aXNBciA/IFwi2KrZg9mE2YHYqSDYrdmK2KfYstipINin2YTYudmF2YrZhFwiIDogXCJDdXN0b21lciBBY3F1aXNpdGlvblwifVxuICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIGZvbnQtbW9ubyB0ZXh0LWluZGlnby02MDAgZGFyazp0ZXh0LWluZGlnby00MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7aGVhbHRoLmNhYy50b0xvY2FsZVN0cmluZygpfXtcIiBcIn1cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtbm9ybWFsXCI+e2lzQXIgPyBcItixLtizXCIgOiBcIlNBUlwifTwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayB0ZXh0LXppbmMtNDAwIG1iLTAuNVwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtpc0FyID8gXCLZhdiq2YjYs9i3INi52YXYsSDYp9mE2YHZiNin2KrZitixXCIgOiBcIkludm9pY2UgQWdpbmdcIn1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCBmb250LW1vbm8gdGV4dC1hbWJlci02MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7aGVhbHRoLmF2ZXJhZ2VBZ2luZ0RheXN9e1wiIFwifVxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ub3JtYWxcIj57aXNBciA/IFwi2YrZiNmFXCIgOiBcImRheXNcIn08L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgey8qIFJlY29tbWVuZGF0aW9ucyAqL31cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtYmxhY2sgdGV4dC16aW5jLTQwMCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIj5cbiAgICAgICAgICAgICAgICAgICAge2lzQXJcbiAgICAgICAgICAgICAgICAgICAgICA/IFwi2KfZhNiq2YjYtdmK2KfYqiDYp9mE2YXZgtiq2LHYrdipINmF2YYg2YXYr9in2LHYrCDZhNmE2KrYrdiz2YrZhiDYqNmG2YLYsdipINmI2KfYrdiv2Kk6XCJcbiAgICAgICAgICAgICAgICAgICAgICA6IFwiQWN0aW9uYWJsZSBBSSByZWNvbW1lbmRhdGlvbnMgdG8gaW1wcm92ZTpcIn1cbiAgICAgICAgICAgICAgICAgIDwvaDQ+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgc206Z3JpZC1jb2xzLTIgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAgeyhpc0FyID8gaGVhbHRoLnJlY29tbWVuZGF0aW9uc0FyIDogaGVhbHRoLnJlY29tbWVuZGF0aW9uc0VuKS5tYXAoXG4gICAgICAgICAgICAgICAgICAgICAgKHJlYzogc3RyaW5nLCBpZHg6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk9e2lkeH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IGhhbmRsZVJlY29tbWVuZGF0aW9uQ2xpY2socmVjKX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yLjUgYmctd2hpdGUgZGFyazpiZy16aW5jLTEwMCBob3ZlcjpiZy16aW5jLTUwIGRhcms6aG92ZXI6YmctemluYy04NTAgYm9yZGVyIGJvcmRlci16aW5jLTIwMCBkYXJrOmJvcmRlci16aW5jLTgwMCB0ZXh0LXppbmMtNzAwIGRhcms6dGV4dC16aW5jLTMwMCByb3VuZGVkLXhsIHRleHQteHMgZm9udC1ib2xkIHRleHQtcmlnaHQgcnRsOnRleHQtcmlnaHQgbHRyOnRleHQtbGVmdCBob3Zlcjpib3JkZXItaW5kaWdvLTUwMCBkYXJrOmhvdmVyOmJvcmRlci1pbmRpZ28tNTAwIHRyYW5zaXRpb24tYWxsIHNoYWRvdy14eHMgaG92ZXI6c2hhZG93LXhzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBncm91cFwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImZsZXgtMSBsZWFkaW5nLXRpZ2h0XCI+e3JlY308L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxBcnJvd1VwUmlnaHQgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjUgdGV4dC16aW5jLTQwMCBncm91cC1ob3Zlcjp0ZXh0LWluZGlnby01MDAgc2hyaW5rLTAgbXgtMVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGNhc2UgXCJpbnRlbGxpZ2VuY2VcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c2VjdGlvblxuICAgICAgICAgICAga2V5PVwiaW50ZWxsaWdlbmNlXCJcbiAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWdyYWRpZW50LXRvLXIgZnJvbS1wcmltYXJ5LzEwIHZpYS1wcmltYXJ5LzUgdG8tdHJhbnNwYXJlbnQgcm91bmRlZC1bMnJlbV0gYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIHNoYWRvdy1zbSBwLTYgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIC1sZWZ0LTIwIC10b3AtMjAgdy02NCBoLTY0IGJnLXByaW1hcnkvMjAgcm91bmRlZC1mdWxsIGJsdXItWzgwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmUgbWl4LWJsZW5kLW92ZXJsYXlcIiAvPlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBtYi04IHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNCBoLTE0IGJnLXdoaXRlIHJvdW5kZWQtMnhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNoYWRvdy1sZyBzaGFkb3ctcHJpbWFyeS8xMCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMTAgcm90YXRlLTNcIj5cbiAgICAgICAgICAgICAgICAgIDxzdmdcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg9XCIyOFwiXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodD1cIjI4XCJcbiAgICAgICAgICAgICAgICAgICAgdmlld0JveD1cIjAgMCAyNCAyNFwiXG4gICAgICAgICAgICAgICAgICAgIGZpbGw9XCJub25lXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiY3VycmVudENvbG9yXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9XCIyLjVcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lY2FwPVwicm91bmRcIlxuICAgICAgICAgICAgICAgICAgICBzdHJva2VMaW5lam9pbj1cInJvdW5kXCJcbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1wcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIm0xMiAzLTEuOTEyIDUuODEzYTIgMiAwIDAgMS0xLjI3NSAxLjI3NUwzIDEybDUuODEzIDEuOTEyYTIgMiAwIDAgMSAxLjI3NSAxLjI3NUwxMiAyMWwxLjkxMi01LjgxM2EyIDIgMCAwIDEgMS4yNzUtMS4yNzVMMjEgMTJsLTUuODEzLTEuOTEyYTIgMiAwIDAgMS0xLjI3NS0xLjI3NUwxMiAzWlwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDxwYXRoIGQ9XCJNNSAzdjRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTE5IDE3djRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8cGF0aCBkPVwiTTMgNWg0XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZD1cIk0xNyAxOWg0XCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ibGFjayB0ZXh0LTJ4bCB0ZXh0LXppbmMtOTAwIHRyYWNraW5nLXRpZ2h0IG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgICAg2YXYrdix2YMg2LDZg9in2KEg2YXYr9in2LHYrCDZhNmE2YbZhdmIIChBSSlcbiAgICAgICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYmxhY2sgdGV4dC1wcmltYXJ5IHRyYWNraW5nLXdpZGVzdCB1cHBlcmNhc2VcIj5cbiAgICAgICAgICAgICAgICAgICAg2KrZiNi12YrYp9iqINmF2K/Yp9ix2Kwg2KfZhNiw2YPZitipINin2YTZhdiu2LXYtdipINmE2YMg2YTYqtiz2LHZiti5INin2YTZhdio2YrYudin2Kog2YfYsNinINin2YTYsdio2LlcbiAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgdG89XCIvYXBwL2ludGVncmF0aW9uc1wiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiaGlkZGVuIHNtOmZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHB4LTQgcHktMiBiZy13aGl0ZSB0ZXh0LXByaW1hcnkgdGV4dC1zbSBmb250LWJvbGQgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIHJvdW5kZWQteGwgaG92ZXI6YmctcHJpbWFyeSBob3Zlcjp0ZXh0LXdoaXRlIHRyYW5zaXRpb24tYWxsIHNoYWRvdy1zbVwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICDYqti12YHYrSDYs9mI2YIg2KfZhNiq2LfYqNmK2YLYp9iqINin2YTZhdis2KfZhtmKXG4gICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBtZDpncmlkLWNvbHMtMyBnYXAtNSByZWxhdGl2ZSB6LTEwXCI+XG4gICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgdG89XCIvYXBwL3NldHRpbmdzXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTYgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzEwIHNoYWRvdy1zbSBob3ZlcjpzaGFkb3cteGwgaG92ZXI6c2hhZG93LXByaW1hcnkvNSBob3ZlcjotdHJhbnNsYXRlLXktMSB0cmFuc2l0aW9uLWFsbCBncm91cCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi00XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yIGJnLXJvc2UtNTAgdGV4dC1yb3NlLTUwMCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItcm9zZS0xMDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8TWVzc2FnZVNxdWFyZSBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtYmxhY2sgYmctcm9zZS01MCB0ZXh0LXJvc2UtNjAwIHB4LTIuNSBweS0xIHJvdW5kZWQtZnVsbCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgYm9yZGVyIGJvcmRlci1yb3NlLTEwMCBzaGFkb3ctc21cIj5cbiAgICAgICAgICAgICAgICAgICAgICDYudin2KbYryDZgdmI2LHZilxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtemluYy05MDAgbWItMlwiPtij2KrZhdiq2Kkg2KfZhNmI2KfYqtiz2KfYqCArIENSTTwvaDQ+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgbGVhZGluZy1yZWxheGVkIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICAgINmE2K/ZitmDIDEyINi52YXZitmEINmF2K3YqtmF2YQg2YTZhSDZitiq2YUg2YXYqtin2KjYudiq2YfZhS4g2KrZgdi52YrZhCDYsdiv2YjYryDYp9mE2YjYp9iq2LPYp9ioINin2YTYqtmE2YLYp9im2YrYqSDYp9mE2YXYr9i52YjZhdipINmF2YZcbiAgICAgICAgICAgICAgICAgICAg2YXYr9in2LHYrCDYs9mK2LLZitivINmG2LPYqNipINin2YTYpdi62YTYp9mCINio2YAgNDDZqiDZgdmI2LHYp9mLLlxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXhzIGZvbnQtYmxhY2sgdGV4dC1yb3NlLTYwMCBncm91cC1ob3ZlcjpnYXAtMyB0cmFuc2l0aW9uLWFsbFwiPlxuICAgICAgICAgICAgICAgICAgPHNwYW4+2KrZgdi52YrZhCDZhdis2KfZhtmKINin2YTYotmGPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuXG4gICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgdG89XCIvYXBwL2ludGVncmF0aW9uc1wiXG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC02IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMCBzaGFkb3ctc20gaG92ZXI6c2hhZG93LXhsIGhvdmVyOnNoYWRvdy1wcmltYXJ5LzUgaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi1hbGwgZ3JvdXAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMiBiZy1ibHVlLTUwIHRleHQtYmx1ZS01MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWJsdWUtMTAwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPENoZWNrQ2lyY2xlMiBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIGZvbnQtYmxhY2sgYmctYmx1ZS01MCB0ZXh0LWJsdWUtNjAwIHB4LTIuNSBweS0xIHJvdW5kZWQtZnVsbCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXIgYm9yZGVyIGJvcmRlci1ibHVlLTEwMCBzaGFkb3ctc21cIj5cbiAgICAgICAgICAgICAgICAgICAgICDYrdmF2KfZitipINin2YTYq9ix2YjYqVxuICAgICAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtemluYy05MDAgbWItMlwiPtin2YTYsdio2Lcg2KfZhNmF2KjYp9i02LEg2KjZgCBaQVRDQTwvaDQ+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgbGVhZGluZy1yZWxheGVkIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICAgINiq2YHYp9iv2Ykg2KfZhNi62LHYp9mF2KfYqiDYp9mE2YXYr9mF2ZHYsdipINmE2YTZhdmG2LTYotiqINin2YTZhtin2LTYptipLiDYp9iz2KrYrtiv2YUg2KfZhNix2KjYtyDYp9mE2YXYqtmD2KfZhdmEINmI2KfZhNmF2KzYp9mG2Yog2YXYuSDZh9mK2KbYqVxuICAgICAgICAgICAgICAgICAgICDYp9mE2LLZg9in2KkgKNin2YTZhdix2K3ZhNipIDIpINmF2YYg2YXYr9in2LHYrCDYqNi22LrYt9ipINiy2LEuXG4gICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJtdC02IGZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWJsdWUtNjAwIGdyb3VwLWhvdmVyOmdhcC0zIHRyYW5zaXRpb24tYWxsXCI+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj7YqNiv2KEg2KfZhNix2KjYtyDZhdis2KfZhtin2Ys8L3NwYW4+XG4gICAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L0xpbms+XG5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvc2V0dGluZ3NcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWdyYWRpZW50LXRvLWJyIGZyb20temluYy05MDAgdG8temluYy04MDAgcC02IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy03MDAgc2hhZG93LWxnIGhvdmVyOnNoYWRvdy0yeGwgaG92ZXI6c2hhZG93LXByaW1hcnkvMjAgaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi1hbGwgZ3JvdXAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW4gcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIHRleHQtd2hpdGVcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctMzIgaC0zMiBiZy1wcmltYXJ5LzIwIGJsdXItMnhsIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicmVsYXRpdmUgei0xMFwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi00XCI+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0yIGJnLXdoaXRlLzEwIHRleHQtd2hpdGUgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXdoaXRlLzUgYmFja2Ryb3AtYmx1ci1tZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSBmb250LWJsYWNrIGJnLXByaW1hcnkgdGV4dC13aGl0ZSBweC0yLjUgcHktMSByb3VuZGVkLWZ1bGwgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHNoYWRvdy1bMF8wXzE1cHhfcmdiYSgxNiwxODUsMTI5LDAuNSldXCI+XG4gICAgICAgICAgICAgICAgICAgICAg2KjYsdmG2KfZhdisINin2YTYtNix2YPYp9ihXG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cImZvbnQtYmxhY2sgdGV4dC13aGl0ZSBtYi0yIHRleHQtbGdcIj7Yr9i52YjYqSDYp9mE2YXZiNix2K/ZitmGINmE2YTYtNio2YPYqTwvaDQ+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy00MDAgbGVhZGluZy1yZWxheGVkIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAgICAgINi02KfYsdmDINmF2K/Yp9ix2Kwg2YXYuSAzINmF2YYg2YXZiNix2K/ZitmDINij2Ygg2LnZhdmE2KfYptmDINmI2KfYs9iq2YHYryDZhdmGIDMg2KPYtNmH2LEg2YXYrNin2YbZitipINmF2YYg2KjYp9mC2KkgUHJlbWl1bSArXG4gICAgICAgICAgICAgICAgICAgINiq2YHYudmK2YQg2YXYstin2YXZhtipINin2YTZgdmI2KfYqtmK2LEg2KfZhNmF2LTYqtix2YPYqSDYqNmK2YbZh9mFLlxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNiBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiB0ZXh0LXhzIGZvbnQtYmxhY2sgdGV4dC1wcmltYXJ5IGdyb3VwLWhvdmVyOmdhcC0zIHRyYW5zaXRpb24tYWxsIHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxzcGFuPtin2YbYs9iuINix2KfYqNi3INin2YTYpdit2KfZhNipPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICApO1xuICAgICAgY2FzZSBcInF1aWNrX2FjdGlvbnNcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8UXVpY2tBY3Rpb25zV2lkZ2V0XG4gICAgICAgICAgICBrZXk9XCJxdWlja19hY3Rpb25zXCJcbiAgICAgICAgICAgIHF1aWNrQWN0aW9ucz17cXVpY2tBY3Rpb25zfVxuICAgICAgICAgICAgc2V0UXVpY2tBY3Rpb25zPXtzZXRRdWlja0FjdGlvbnN9XG4gICAgICAgICAgICB1c2VyPXt1c2VyfVxuICAgICAgICAgICAgdXBkYXRlUHJvZmlsZT17dXBkYXRlUHJvZmlsZX1cbiAgICAgICAgICAgIGxlYWRzPXtsZWFkc31cbiAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgICAgY2FzZSBcImNvbXBsaWFuY2VcIjpcbiAgICAgICAgcmV0dXJuIDxDb21wbGlhbmNlRGFzaGJvYXJkIGtleT1cImNvbXBsaWFuY2VcIiAvPjtcbiAgICAgIGNhc2UgXCJzdGF0c1wiOlxuICAgICAgICByZXR1cm4gcmVuZGVyU3RhdHMoKTtcbiAgICAgIGNhc2UgXCJwYXlyb2xsXCI6XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgPHNlY3Rpb25cbiAgICAgICAgICAgIGtleT1cInBheXJvbGxcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBib3JkZXItYiBib3JkZXItemluYy0xMDAgZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIGJnLWdyYXktNTAvNTBcIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJsYWNrIHRleHQtemluYy05MDBcIj7Zhdiz2YrYsdin2Kog2KfZhNix2YjYp9iq2Kgg2KfZhNij2K7Zitix2Kk8L2gzPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC16aW5jLTUwMFwiPlxuICAgICAgICAgICAgICAgICAg2YXZiNis2LIg2YXYs9mK2LHYp9iqINin2YTYsdmI2KfYqtioINin2YTYrdiv2YrYq9ipINmI2K3Yp9mE2KrZh9inXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiPlxuICAgICAgICAgICAgICAgIHtkYXNoYm9hcmRTdGF0cz8ubGF0ZXN0UGVyaW9kICYmIChcbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgUGF5cm9sbFNlcnZpY2UuYmF0Y2hHZW5lcmF0ZU11ZGFkU0lGKFxuICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGFzaGJvYXJkU3RhdHMubGF0ZXN0UGVyaW9kXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwgeyB0eXBlOiBcInRleHQvY3N2O2NoYXJzZXQ9dXRmLTg7XCIgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSBVUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJocmVmXCIsIHVybCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rLnNldEF0dHJpYnV0ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJkb3dubG9hZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBgQkFUQ0hfU0lGX01VREFEXyR7ZGFzaGJvYXJkU3RhdHMubGF0ZXN0UGVyaW9kfS5zaWZgXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiB0b2FzdCBpcyBhdmFpbGFibGUgaWYgaW1wb3J0ZWQuIElmIG5vdCwgbWF5YmUgd2UganVzdCB1c2UgYWxlcnQgb3Igbm90aGluZy5cbiAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LWVtZXJhbGQtNzAwIGJnLWVtZXJhbGQtNTAgYm9yZGVyIGJvcmRlci1lbWVyYWxkLTIwMCBweC00IHB5LTIgcm91bmRlZC14bCBob3ZlcjpiZy1lbWVyYWxkLTEwMCB0cmFuc2l0aW9uLWNvbG9ycyBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMlwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxEb3dubG9hZCBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIC8+INiq2K3ZhdmK2YQgU0lGICh7ZGFzaGJvYXJkU3RhdHMubGF0ZXN0UGVyaW9kfSlcbiAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LWJsdWUtNjAwIGJnLWJsdWUtNTAgcHgtNCBweS0yIHJvdW5kZWQteGwgaG92ZXI6YmctYmx1ZS0xMDAgdHJhbnNpdGlvbi1jb2xvcnNcIj5cbiAgICAgICAgICAgICAgICAgINi52LHYtiDYp9mE2YPZhFxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvdmVyZmxvdy14LWF1dG9cIj5cbiAgICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInctZnVsbCB0ZXh0LXJpZ2h0IHRleHQtc21cIj5cbiAgICAgICAgICAgICAgICA8dGhlYWQ+XG4gICAgICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwiYmctd2hpdGUgdGV4dC16aW5jLTQwMCBmb250LWJvbGQgYm9yZGVyLWIgYm9yZGVyLXppbmMtMTAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LVsxMXB4XVwiPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNiBweS00XCI+2LHZgtmFINin2YTZhdiz2YrYsTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC02IHB5LTRcIj7Yp9mE2LTZh9ixPC90aD5cbiAgICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInB4LTYgcHktNFwiPtin2YTYrdin2YTYqTwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC02IHB5LTRcIj7Yqtin2LHZitiuINin2YTYp9i52KrZhdin2K88L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicHgtNiBweS00XCI+2KfZhNmF2YjYuNmB2YrZhjwvdGg+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJweC02IHB5LTQgdGV4dC1sZWZ0XCI+2KXYrNmF2KfZhNmKINin2YTYtdin2YHZijwvdGg+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cImRpdmlkZS15IGRpdmlkZS16aW5jLTEwMFwiPlxuICAgICAgICAgICAgICAgICAgeyFkYXNoYm9hcmRTdGF0cyA/IChcbiAgICAgICAgICAgICAgICAgICAgWzEsIDIsIDNdLm1hcCgoaSkgPT4gKFxuICAgICAgICAgICAgICAgICAgICAgIDx0ciBrZXk9e2l9IGNsYXNzTmFtZT1cImFuaW1hdGUtcHVsc2VcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC02IHB5LTRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTQgYmctemluYy0yMDAgcm91bmRlZCB3LTE2XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC00IGJnLXppbmMtMjAwIHJvdW5kZWQgdy0xMlwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTYgcHktNFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtNiBiZy16aW5jLTIwMCByb3VuZGVkLWxnIHctMTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC02IHB5LTRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLTQgYmctemluYy0yMDAgcm91bmRlZCB3LTIwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC00IGJnLXppbmMtMjAwIHJvdW5kZWQgdy04XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC00IGJnLXppbmMtMjAwIHJvdW5kZWQgdy0yNCBtbC1hdXRvXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgICAgICkgOiBkYXNoYm9hcmRTdGF0cy5yZWNlbnRQYXlyb2xsPy5sZW5ndGggPiAwID8gKFxuICAgICAgICAgICAgICAgICAgICBkYXNoYm9hcmRTdGF0cy5yZWNlbnRQYXlyb2xsLm1hcCgocnVuOiBhbnksIGlkeDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPHRyIGtleT17cnVuLmlkIHx8IGlkeH0gY2xhc3NOYW1lPVwiaG92ZXI6YmctemluYy01MCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTYgcHktNCBmb250LW1vbm8gZm9udC1ib2xkIHRleHQtemluYy05MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3J1bi5pZC5zdWJzdHJpbmcoMCwgOCl9XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB4LTYgcHktNCBmb250LWJvbGQgdGV4dC16aW5jLTcwMFwiPntydW4ucGVyaW9kfTwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwicHgtMiBweS0xIHJvdW5kZWQtbGcgdGV4dC14cyBmb250LWJvbGRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bi5zdGF0dXMgPT09IFwicHJvY2Vzc2VkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcInRleHQtZW1lcmFsZC02MDAgYmctZW1lcmFsZC01MFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LWJsdWUtNjAwIGJnLWJsdWUtNTBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7cnVuLnN0YXR1cyA9PT0gXCJwcm9jZXNzZWRcIiA/IFwi2YXYudiq2YXYr1wiIDogXCLZhdmD2KrZhdmEXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00IHRleHQtemluYy01MDAgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge25ldyBEYXRlKHJ1bi5wcm9jZXNzZWREYXRlIHx8IHJ1bi5jcmVhdGVkQXQpLnRvTG9jYWxlRGF0ZVN0cmluZyhcImFyLVNBXCIpfVxuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweC02IHB5LTQgdGV4dC16aW5jLTUwMCBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3J1bi5lbnRyaWVzPy5sZW5ndGggfHwgMH1cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHgtNiBweS00IGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAge3J1bi50b3RhbE5ldC50b0xvY2FsZVN0cmluZygpfSDYsS7Ys1xuICAgICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICAgICAgPHRyIGtleT1cImVtcHR5LXBheXJvbGwtcmVjZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xTcGFuPXs2fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHktMjAgdGV4dC1jZW50ZXIgdGV4dC16aW5jLTQwMCBmb250LWJvbGQgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVzdCB0ZXh0LVsxMHB4XVwiXG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAg2YTYpyDYqtmI2KzYryDZhdiz2YrYsdin2Kog2LHZiNin2KrYqCDYo9iu2YrYsdipXG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPC90Ym9keT5cbiAgICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvc2VjdGlvbj5cbiAgICAgICAgKTtcbiAgICAgIGNhc2UgXCJjaGFydFwiOlxuICAgICAgICBpZiAoYWN0aXZlVmlldyA9PT0gXCJjZW9cIikge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8c2VjdGlvbiBrZXk9XCJjaGFydFwiIGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTMgZ2FwLTZcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTggYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gaC1bNDAwcHhdIGxnOmNvbC1zcGFuLTJcIj5cbiAgICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtbGcgbWItNlwiPtmG2YXZiCDYp9mE2KXZitix2KfYr9in2Kog2KfZhNmF2KrZiNmC2LkgKNin2YTZhdio2YrYudin2KopPC9oMz5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcGItOFwiPlxuICAgICAgICAgICAgICAgICAgPFJlc3BvbnNpdmVDb250YWluZXIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiPlxuICAgICAgICAgICAgICAgICAgICA8QmFyQ2hhcnQgZGF0YT17cXVhcnRlcmx5RGF0YX0+XG4gICAgICAgICAgICAgICAgICAgICAgPENhcnRlc2lhbkdyaWQgc3Ryb2tlRGFzaGFycmF5PVwiMyAzXCIgdmVydGljYWw9e2ZhbHNlfSBzdHJva2U9XCIjZjBmMGYwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8WEF4aXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk9XCJuYW1lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGF4aXNMaW5lPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tMaW5lPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRpY2s9e3sgZmlsbDogXCIjYTFhMWFhXCIsIGZvbnRTaXplOiAxMCB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZHk9ezEwfVxuICAgICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPFlBeGlzIGhpZGUgZG9tYWluPXtbXCJhdXRvXCIsIFwiYXV0b1wiXX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICA8VG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgICAgY3Vyc29yPXt7IGZpbGw6IFwiI2Y0ZjRmNVwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250ZW50U3R5bGU9e3tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjE2cHhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyOiBcIm5vbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYm94U2hhZG93OiBcIjAgMTBweCAxNXB4IC0zcHggcmdiYSgwLDAsMCwwLjEpXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogXCJydGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGV4dEFsaWduOiBcInJpZ2h0XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyPXsodmFsdWU6IGFueSkgPT4gW2Ake3ZhbHVlLnRvTG9jYWxlU3RyaW5nKCl9INixLtizYCwgXCJcIl19XG4gICAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgICAgICA8TGVnZW5kIHdyYXBwZXJTdHlsZT17eyBmb250U2l6ZTogXCIxMnB4XCIsIHBhZGRpbmdUb3A6IFwiMTBweFwiIH19IC8+XG4gICAgICAgICAgICAgICAgICAgICAgPEJhciBkYXRhS2V5PVwiY3VycmVudFwiIG5hbWU9XCLYp9mE2YXYrdmC2YJcIiBmaWxsPVwiIzNiODJmNlwiIHJhZGl1cz17WzQsIDQsIDAsIDBdfSAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxCYXJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk9XCJwcm9qZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZT1cItin2YTZhdiq2YjZgti5ICjYp9mE2YHYsdi1KVwiXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsPVwiI2JmZGJmZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICByYWRpdXM9e1s0LCA0LCAwLCAwXX1cbiAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8L0JhckNoYXJ0PlxuICAgICAgICAgICAgICAgICAgPC9SZXNwb25zaXZlQ29udGFpbmVyPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgZ2FwLTZcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBiZy13aGl0ZSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXppbmMtMTAwIHNoYWRvdy1zbSBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbSBtYi00XCI+2YXYpNi02LEg2KfZhNin2YXYqtir2KfZhCDYp9mE2LnYp9mFPC9oMz5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC1bMTIwcHhdXCI+XG4gICAgICAgICAgICAgICAgICAgIDxSZXNwb25zaXZlQ29udGFpbmVyIHdpZHRoPVwiMTAwJVwiIGhlaWdodD1cIjEwMCVcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8UGllQ2hhcnQ+XG4gICAgICAgICAgICAgICAgICAgICAgICA8UGllXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE9e1tcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7IG5hbWU6IFwi2YXZhdiq2KvZhFwiLCB2YWx1ZTogZGFzaGJvYXJkU3RhdHM/LmNvbXBsaWFuY2VTY29yZSB8fCAwIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBuYW1lOiBcItmF2K7Yp9i32LFcIiwgdmFsdWU6IDEwMCAtIChkYXNoYm9hcmRTdGF0cz8uY29tcGxpYW5jZVNjb3JlIHx8IDApIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIF19XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlubmVyUmFkaXVzPXs0MH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJSYWRpdXM9ezU1fVxuICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nQW5nbGU9ezJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFLZXk9XCJ2YWx1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDxDZWxsIGZpbGw9XCIjMTBiOTgxXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPENlbGwgZmlsbD1cIiNmNDNmNWVcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9QaWU+XG4gICAgICAgICAgICAgICAgICAgICAgICA8VG9vbHRpcCBjb250ZW50U3R5bGU9e3sgZGlyZWN0aW9uOiBcInJ0bFwiLCBib3JkZXJSYWRpdXM6IFwiOHB4XCIgfX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICA8L1BpZUNoYXJ0PlxuICAgICAgICAgICAgICAgICAgICA8L1Jlc3BvbnNpdmVDb250YWluZXI+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgbXQtMlwiPlxuICAgICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LTN4bCBmb250LWJsYWNrIHRleHQtZW1lcmFsZC01MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7ZGFzaGJvYXJkU3RhdHM/LmNvbXBsaWFuY2VTY29yZSB8fCAwfSVcbiAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtNiBiZy13aGl0ZSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXppbmMtMTAwIHNoYWRvdy1zbSBmbGV4LTFcIj5cbiAgICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbSBtYi00XCI+2KrZg9mE2YHYqSDYp9mE2LHZiNin2KrYqDwvaDM+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImgtWzEwMHB4XVwiPlxuICAgICAgICAgICAgICAgICAgICA8UmVzcG9uc2l2ZUNvbnRhaW5lciB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPExpbmVDaGFydFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YT17XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRhc2hib2FyZFN0YXRzPy5jaGFydERhdGE/LnNsaWNlKC0zKS5tYXAoKGQ6IGFueSwgaTogbnVtYmVyKSA9PiAoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGQubmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb3N0OiAoZGFzaGJvYXJkU3RhdHM/LnBheXJvbGxDb3N0IHx8IDApICogKDAuOSArIGkgKiAwLjA1KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpIHx8IFtdXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgPExpbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm1vbm90b25lXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YUtleT1cImNvc3RcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9XCIjZjU5ZTBiXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3Ryb2tlV2lkdGg9ezN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGRvdD17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPFRvb2x0aXBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyPXsodmFsOiBhbnkpID0+IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBgJHtNYXRoLnJvdW5kKHZhbCkudG9Mb2NhbGVTdHJpbmcoKX0g2LEu2LNgLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwi2KfZhNiq2YPZhNmB2KlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudFN0eWxlPXt7IGRpcmVjdGlvbjogXCJydGxcIiwgYm9yZGVyUmFkaXVzOiBcIjhweFwiIH19XG4gICAgICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvTGluZUNoYXJ0PlxuICAgICAgICAgICAgICAgICAgICA8L1Jlc3BvbnNpdmVDb250YWluZXI+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LWJvbGQgdGV4dC16aW5jLTUwMCBtdC0yIHRleHQtY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIHtkYXNoYm9hcmRTdGF0cz8udHJlbmRzPy5wYXlyb2xsID49IDAgPyBcItin2KrYrNin2Ycg2YXYs9iq2YLYsVwiIDogXCLYp9mG2K7Zgdin2LYg2KrYr9ix2YrYrNmKXCJ9IChcbiAgICAgICAgICAgICAgICAgICAge2Rhc2hib2FyZFN0YXRzPy50cmVuZHM/LnBheXJvbGwgfHwgMH0lKVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgIDxzZWN0aW9uXG4gICAgICAgICAgICBrZXk9XCJjaGFydFwiXG4gICAgICAgICAgICBjbGFzc05hbWU9XCJwLTggYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gaC1bNDAwcHhdXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtbGcgbWItNlwiPtmF2YbYrdmG2Ykg2KfZhNmF2KjZiti52KfYqjwvaDM+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctZnVsbCBoLWZ1bGwgcGItOFwiPlxuICAgICAgICAgICAgICB7IWRhc2hib2FyZFN0YXRzID8gKFxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy1mdWxsIGgtZnVsbCBiZy16aW5jLTEwMCBhbmltYXRlLXB1bHNlIHJvdW5kZWQtMnhsXCIgLz5cbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8UmVzcG9uc2l2ZUNvbnRhaW5lciB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+XG4gICAgICAgICAgICAgICAgICA8QXJlYUNoYXJ0IGRhdGE9e2Rhc2hib2FyZFN0YXRzPy5jaGFydERhdGEgfHwgW119PlxuICAgICAgICAgICAgICAgICAgICA8ZGVmcz5cbiAgICAgICAgICAgICAgICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9XCJjb2xvclNhbGVzXCIgeDE9XCIwXCIgeTE9XCIwXCIgeDI9XCIwXCIgeTI9XCIxXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9XCI1JVwiIHN0b3BDb2xvcj1cIiMxMGI5ODFcIiBzdG9wT3BhY2l0eT17MC4xfSAvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PVwiOTUlXCIgc3RvcENvbG9yPVwiIzEwYjk4MVwiIHN0b3BPcGFjaXR5PXswfSAvPlxuICAgICAgICAgICAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gICAgICAgICAgICAgICAgICAgIDwvZGVmcz5cbiAgICAgICAgICAgICAgICAgICAgPENhcnRlc2lhbkdyaWQgc3Ryb2tlRGFzaGFycmF5PVwiMyAzXCIgdmVydGljYWw9e2ZhbHNlfSBzdHJva2U9XCIjZjBmMGYwXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPFhBeGlzXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YUtleT1cIm5hbWVcIlxuICAgICAgICAgICAgICAgICAgICAgIGF4aXNMaW5lPXtmYWxzZX1cbiAgICAgICAgICAgICAgICAgICAgICB0aWNrTGluZT17ZmFsc2V9XG4gICAgICAgICAgICAgICAgICAgICAgdGljaz17eyBmaWxsOiBcIiNhMWExYWFcIiwgZm9udFNpemU6IDEwIH19XG4gICAgICAgICAgICAgICAgICAgICAgZHk9ezEwfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8WUF4aXMgaGlkZSBkb21haW49e1tcImF1dG9cIiwgXCJhdXRvXCJdfSAvPlxuICAgICAgICAgICAgICAgICAgICA8VG9vbHRpcFxuICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRTdHlsZT17e1xuICAgICAgICAgICAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiBcIjE2cHhcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvcmRlcjogXCJub25lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBib3hTaGFkb3c6IFwiMCAxMHB4IDE1cHggLTNweCByZ2JhKDAsMCwwLDAuMSlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbjogXCJydGxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHRBbGlnbjogXCJyaWdodFwiLFxuICAgICAgICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgICAgICAgZm9ybWF0dGVyPXsodmFsdWU6IGFueSkgPT4gW2Ake3ZhbHVlLnRvTG9jYWxlU3RyaW5nKCl9INixLtizYCwgXCLYp9mE2YXYqNmK2LnYp9iqXCJdfVxuICAgICAgICAgICAgICAgICAgICAvPlxuICAgICAgICAgICAgICAgICAgICA8QXJlYVxuICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJtb25vdG9uZVwiXG4gICAgICAgICAgICAgICAgICAgICAgZGF0YUtleT1cInNhbGVzXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHJva2U9XCIjMTBiOTgxXCJcbiAgICAgICAgICAgICAgICAgICAgICBzdHJva2VXaWR0aD17M31cbiAgICAgICAgICAgICAgICAgICAgICBmaWxsT3BhY2l0eT17MX1cbiAgICAgICAgICAgICAgICAgICAgICBmaWxsPVwidXJsKCNjb2xvclNhbGVzKVwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgICA8L0FyZWFDaGFydD5cbiAgICAgICAgICAgICAgICA8L1Jlc3BvbnNpdmVDb250YWluZXI+XG4gICAgICAgICAgICAgICl9XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgICk7XG4gICAgICBjYXNlIFwiYWN0aXZpdHlcIjpcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICA8c2VjdGlvblxuICAgICAgICAgICAga2V5PVwiYWN0aXZpdHlcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC04IGJnLXdoaXRlIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy0xMDAgc2hhZG93LXNtXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi02XCI+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1sZ1wiPtin2YTZhti02KfYtyDYp9mE2KPYrtmK2LE8L2gzPlxuICAgICAgICAgICAgICA8TGluayB0bz1cIi9hcHAvc2V0dGluZ3NcIiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnkgaG92ZXI6dW5kZXJsaW5lXCI+XG4gICAgICAgICAgICAgICAg2LnYsdi2INin2YTZg9mEXG4gICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTZcIj5cbiAgICAgICAgICAgICAgeyFkYXNoYm9hcmRTdGF0cyAmJiBhdWRpdExvZ3MubGVuZ3RoID09PSAwID8gKFxuICAgICAgICAgICAgICAgIFsxLCAyLCAzLCA0XS5tYXAoKGkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXYga2V5PXtpfSBjbGFzc05hbWU9XCJmbGV4IGdhcC00IGl0ZW1zLXN0YXJ0IHBiLTQgYW5pbWF0ZS1wdWxzZVwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCByb3VuZGVkLXhsIGJnLXppbmMtMjAwIGZsZXgtc2hyaW5rLTBcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMiBmbGV4LTEgcHQtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC00IGJnLXppbmMtMjAwIHJvdW5kZWQgdy0xLzJcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiaC0zIGJnLXppbmMtMjAwIHJvdW5kZWQgdy0xLzRcIiAvPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICkpXG4gICAgICAgICAgICAgICkgOiAoZGFzaGJvYXJkU3RhdHM/LnJlY2VudExvZ3MgfHwgYXVkaXRMb2dzKS5sZW5ndGggPT09IDAgPyAoXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBweS0xMCB0ZXh0LXppbmMtNDAwIHRleHQteHMgZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3RcIj5cbiAgICAgICAgICAgICAgICAgINmE2Kcg2KrZiNis2K8g2YbYtNin2LfYp9iqXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgKGRhc2hib2FyZFN0YXRzPy5yZWNlbnRMb2dzIHx8IGF1ZGl0TG9ncykubWFwKChsb2c6IGFueSkgPT4gKFxuICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICBrZXk9e2xvZy5pZH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleCBnYXAtNCBpdGVtcy1zdGFydCBwYi00IGJvcmRlci1iIGJvcmRlci16aW5jLTUwIGxhc3Q6Ym9yZGVyLTAgbGFzdDpwYi0wIGdyb3VwXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICAgICAgICBcInctMTAgaC0xMCByb3VuZGVkLXhsIGZsZXgtc2hyaW5rLTAgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgYm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsb2cubW9kdWxlID09PSBcIkNSTVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1ibHVlLTUwIHRleHQtYmx1ZS02MDAgYm9yZGVyLWJsdWUtMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgOiBsb2cubW9kdWxlID09PSBcIklOVk9JQ0VcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1lbWVyYWxkLTUwIHRleHQtZW1lcmFsZC02MDAgYm9yZGVyLWVtZXJhbGQtMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiYmctemluYy0xMDAgdGV4dC16aW5jLTQwMCBib3JkZXItemluYy0yMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICB7bG9nLm1vZHVsZSA9PT0gXCJFTUFJTFwiID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPE1haWwgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgKSA6IGxvZy5tb2R1bGUgPT09IFwiSU5WT0lDRVwiID8gKFxuICAgICAgICAgICAgICAgICAgICAgICAgPEZpbGVUZXh0IGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgICAgICAgICAgICA8SGlzdG9yeSBjbGFzc05hbWU9XCJ3LTQgaC00XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYm9sZCB0ZXh0LXppbmMtOTAwIGxpbmUtY2xhbXAtMVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAge2xvZy5hY3Rpb24gfHwgbG9nLnBheWxvYWQ/LmFjdGlvbiB8fCBg2YbYtNin2Lcg2YHZiiAke2xvZy5tb2R1bGV9YH1cbiAgICAgICAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBtdC0wLjUgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtuZXcgRGF0ZShsb2cudGltZXN0YW1wKS50b0xvY2FsZVRpbWVTdHJpbmcoXCJhci1TQVwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGhvdXI6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBtaW51dGU6IFwiMi1kaWdpdFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgfSl9e1wiIFwifVxuICAgICAgICAgICAgICAgICAgICAgICAg4oCiIHtsb2cudXNlcj8ubmFtZSB8fCBcItin2YTZhti42KfZhVwifVxuICAgICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICApKVxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgICApO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuXG4gIGNvbnN0IHJlbmRlckhSVmlldyA9ICgpID0+IHtcbiAgICBjb25zdCBzYXVkaUNvdW50ID0gZGFzaGJvYXJkU3RhdHM/LnNhdWRpRW1wbG95ZWVzIHx8IDA7XG4gICAgY29uc3QgdG90YWxDb3VudCA9IGRhc2hib2FyZFN0YXRzPy5lbXBsb3llZXNDb3VudCB8fCAwO1xuICAgIGNvbnN0IGV4cGF0Q291bnQgPSB0b3RhbENvdW50IC0gc2F1ZGlDb3VudDtcbiAgICBjb25zdCBzYXVkaXphdGlvblBjdCA9IHRvdGFsQ291bnQgPiAwID8gKHNhdWRpQ291bnQgLyB0b3RhbENvdW50KSAqIDEwMCA6IDA7XG5cbiAgICAvLyBOaXRhcWF0IEJhbmRcbiAgICBsZXQgbml0YXFhdExhYmVsID0gXCLYo9it2YXYsVwiO1xuICAgIGxldCBuaXRhcWF0Q29sb3JDbGFzcyA9IFwidGV4dC1yb3NlLTYwMCBiZy1yb3NlLTUwMC8xMCBib3JkZXItcm9zZS0yMDAvMjBcIjtcbiAgICBpZiAoc2F1ZGl6YXRpb25QY3QgPj0gMzApIHtcbiAgICAgIG5pdGFxYXRMYWJlbCA9IFwi2KPYrti22LEg2YXYsdiq2YHYuVwiO1xuICAgICAgbml0YXFhdENvbG9yQ2xhc3MgPSBcInRleHQtZW1lcmFsZC03MDAgYmctZW1lcmFsZC01MDAvMTAgYm9yZGVyLWVtZXJhbGQtMjAwLzIwXCI7XG4gICAgfSBlbHNlIGlmIChzYXVkaXphdGlvblBjdCA+PSAxNSkge1xuICAgICAgbml0YXFhdExhYmVsID0gXCLYo9iu2LbYsSDZhdmG2K7Zgdi2XCI7XG4gICAgICBuaXRhcWF0Q29sb3JDbGFzcyA9IFwidGV4dC1ncmVlbi03MDAgYmctZ3JlZW4tNTAwLzEwIGJvcmRlci1ncmVlbi0yMDAvMjBcIjtcbiAgICB9IGVsc2UgaWYgKHNhdWRpemF0aW9uUGN0ID4gMCkge1xuICAgICAgbml0YXFhdExhYmVsID0gXCLYo9i12YHYsVwiO1xuICAgICAgbml0YXFhdENvbG9yQ2xhc3MgPSBcInRleHQtYW1iZXItNzAwIGJnLWFtYmVyLTUwMC8xMCBib3JkZXItYW1iZXItMjAwLzIwXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS04IGFuaW1hdGUtZmFkZS1pblwiIGRpcj17aXNBciA/IFwicnRsXCIgOiBcImx0clwifT5cbiAgICAgICAgey8qIE1ldHJpYyBDYXJkcyAtIE1vZGVybiBCZW50byBHcmlkICovfVxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy00IGdhcC02XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMlwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctMzIgaC0zMiBiZy1lbWVyYWxkLTUwMC81IGRhcms6YmctZW1lcmFsZC01MDAvMTAgcm91bmRlZC1mdWxsIGJsdXItMnhsIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi02XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTMgcm91bmRlZC0yeGwgYmctZW1lcmFsZC01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxVc2VycyBjbGFzc05hbWU9XCJ3LTYgaC02IHRleHQtZW1lcmFsZC01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgICAgICBcInB4LTIuNSBweS0xIHJvdW5kZWQteGwgdGV4dC14cyBmb250LWJsYWNrIGJvcmRlciB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgbml0YXFhdENvbG9yQ2xhc3NcbiAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAge25pdGFxYXRMYWJlbH1cbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIGRhcms6dGV4dC16aW5jLTQwMCB0ZXh0LXNtIGZvbnQtYmxhY2sgbWItMVwiPlxuICAgICAgICAgICAgICAgINmG2LfYp9mC2KfYqiDZiNiq2YjYt9mK2YYg2KfZhNmD2YjYp9iv2LEgKE5pdGFxYXQpXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCBkYXJrOnRleHQtemluYy0xMDAgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICB7c2F1ZGl6YXRpb25QY3QudG9GaXhlZCgxKX0lXG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibXQtNiBmbGV4IGdhcC0xIGgtMiByb3VuZGVkLWZ1bGwgb3ZlcmZsb3ctaGlkZGVuIGJnLXppbmMtMTAwIGRhcms6YmctemluYy04MDBcIj5cbiAgICAgICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgICAgICBzdHlsZT17eyB3aWR0aDogYCR7c2F1ZGl6YXRpb25QY3R9JWAgfX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWVtZXJhbGQtNTAwIGgtZnVsbCByb3VuZGVkLWZ1bGxcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICAgICAgc3R5bGU9e3sgd2lkdGg6IGAkezEwMCAtIHNhdWRpemF0aW9uUGN0fSVgIH19XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJiZy16aW5jLTIwMCBkYXJrOmJnLXppbmMtNzUwIGgtZnVsbCByb3VuZGVkLWZ1bGxcIlxuICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIGRhcms6dGV4dC16aW5jLTUwMCBtdC0yIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgINiz2LnZiNiv2Yo6IHtzYXVkaUNvdW50fSB8INmI2KfZgdivOiB7ZXhwYXRDb3VudH1cbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi02XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTMgcm91bmRlZC0yeGwgYmctYmx1ZS01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxCcmllZmNhc2UgY2xhc3NOYW1lPVwidy02IGgtNiB0ZXh0LWJsdWUtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYmxhY2sgcHgtMi41IHB5LTEgYmctYmx1ZS01MDAvMTAgdGV4dC1ibHVlLTUwMCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYmx1ZS01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgINmG2LTYt9mK2YZcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIGRhcms6dGV4dC16aW5jLTQwMCB0ZXh0LXNtIGZvbnQtYmxhY2sgbWItMVwiPlxuICAgICAgICAgICAgICAgINmC2YjYqSDYp9mE2LnZhdmEINin2YTYrdin2YTZitipIChIZWFkY291bnQpXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCBkYXJrOnRleHQtemluYy0xMDAgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICB7dG90YWxDb3VudH0g2YXZiNi42YFcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBkYXJrOnRleHQtemluYy01MDAgbXQtMiBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICDYudmC2YjYryDZhdmI2KvZgtipINmI2YXYt9in2KjZgtipINmB2Yog2YLZiNmJXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHk6IC02LCBzY2FsZTogMS4wMSB9fVxuICAgICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDMwMCwgZGFtcGluZzogMjAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInAtNiByb3VuZGVkLVsycmVtXSBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlbiBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlbiBiZy13aGl0ZS84MCBkYXJrOmJnLXppbmMtMTAwLzQwIGJhY2tkcm9wLWJsdXItbWQgYm9yZGVyLXppbmMtMTUwIGRhcms6Ym9yZGVyLXppbmMtODUwLzYwIHNoYWRvdy1zbSBob3ZlcjpzaGFkb3ctbGcgZGFyazpob3ZlcjpzaGFkb3ctYmxhY2svMzAgaG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwIGRhcms6aG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwIG1kOmNvbC1zcGFuLTFcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0zIHJvdW5kZWQtMnhsIGJnLWFtYmVyLTUwMC8xMFwiPlxuICAgICAgICAgICAgICAgICAgPERvbGxhclNpZ24gY2xhc3NOYW1lPVwidy02IGgtNiB0ZXh0LWFtYmVyLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJsYWNrIHB4LTIuNSBweS0xIGJnLWFtYmVyLTUwMC8xMCB0ZXh0LWFtYmVyLTUwMCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYW1iZXItNTAwLzEwXCI+XG4gICAgICAgICAgICAgICAgICDZhdmI2KfYstmG2Kkg2KfZhNij2KzZiNixXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC16aW5jLTUwMCBkYXJrOnRleHQtemluYy00MDAgdGV4dC1zbSBmb250LWJsYWNrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYp9mE2KPYrNmI2LEg2KfZhNi02YfYsdmK2KkgKFBheXJvbGwpXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCBkYXJrOnRleHQtemluYy0xMDAgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICB7KGRhc2hib2FyZFN0YXRzPy5wYXlyb2xsQ29zdCB8fCAwKS50b0xvY2FsZVN0cmluZygpfSDYsS7Ys1xuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIGRhcms6dGV4dC16aW5jLTUwMCBtdC0yIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgINi02KfZhdmEINin2YTYo9iz2KfYs9mKINmI2KfZhNio2K/ZhNin2KpcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG5cbiAgICAgICAgey8qIE11ZGFyaWogT1MgV29ya3NwYWNlIEV4cGxvcmVyICovfVxuICAgICAgICA8T1NXb3Jrc3BhY2VFeHBsb3JlciAvPlxuXG4gICAgICAgIHsvKiBJbnRlbGxpZ2VuY2UgUmVjb21tZW5kZXIgKi99XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLWdyYWRpZW50LXRvLXIgZnJvbS1wcmltYXJ5LzEwIHZpYS1wcmltYXJ5LzUgdG8tdHJhbnNwYXJlbnQgcm91bmRlZC1bMnJlbV0gYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIHAtNiByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIC1sZWZ0LTIwIC10b3AtMjAgdy02NCBoLTY0IGJnLXByaW1hcnkvMjAgcm91bmRlZC1mdWxsIGJsdXItWzgwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmUgbWl4LWJsZW5kLW92ZXJsYXlcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgbWItNiByZWxhdGl2ZSB6LTEwXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiBiZy13aGl0ZSByb3VuZGVkLTJ4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaGFkb3ctbWQgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzEwXCI+XG4gICAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwidy02IGgtNiB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ibGFjayB0ZXh0LXhsIHRleHQtemluYy05MDBcIj5cbiAgICAgICAgICAgICAgICDZhdiz2KfYudivINi02KTZiNmGINin2YTZhdmI2LjZgdmK2YYg2KfZhNiw2YPZiiAoSFIgQWR2aXNvcnkpXG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIHRleHQtcHJpbWFyeVwiPlxuICAgICAgICAgICAgICAgINiq2YjYtdmK2KfYqiDYrdmK2Kkg2YTYqtit2LPZitmGINin2YXYqtir2KfZhCDYp9mE2YXZiNin2LHYryDYp9mE2KjYtNix2YrYqSDZiNiq2YHYp9iv2Yog2YXYrtin2YTZgdin2Kog2KfZhNij2KzZiNixXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0zIGdhcC01IHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC01IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayBiZy1lbWVyYWxkLTUwIHRleHQtZW1lcmFsZC02MDAgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIGJvcmRlciBib3JkZXItZW1lcmFsZC0xMDBcIj5cbiAgICAgICAgICAgICAgICAgINmC2YjZiSBRaXdhXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7YudmC2YjYryDYp9mE2LnZhdmEINin2YTYsdmC2YXZitipINin2YTZhdmI2K3Yr9ipPC9oND5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICAgICAgICDYqti32KfZhNioINmI2LLYp9ix2Kkg2KfZhNmF2YjYp9ix2K8g2KfZhNio2LTYsdmK2Kkg2KjYqti62LfZitipIDEwMCUg2YXZhiDYudmC2YjYryDYp9mE2YXZiNi42YHZitmGINix2YLZhdmK2KfZiyDYudmE2Ykg2YXZhti12Kkg2YLZiNmJLiDZgtmFXG4gICAgICAgICAgICAgICAgICDYqNiq2LPYrNmK2YQg2YjYqtmI2KvZitmCINin2YTYudmC2YjYryDZgdmI2LHYp9mLINmE2KrYrNmG2Kgg2KXZitmC2KfZgSDYp9mE2KfYs9iq2YLYr9in2YUuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvZndjb3NcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTQgdGV4dC14cyBmb250LWJsYWNrIHRleHQtZW1lcmFsZC02MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgZ3JvdXBcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+2KfZhNiw2YfYp9ioINmE2KXYr9in2LHYqSDYp9mE2LnZgtmI2K88L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00IGdyb3VwLWhvdmVyOnRyYW5zbGF0ZS14LTEgZ3JvdXAtaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi10cmFuc2Zvcm1cIiAvPlxuICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzEwIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWJsYWNrIGJnLWJsdWUtNTAgdGV4dC1ibHVlLTYwMCBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgYm9yZGVyIGJvcmRlci1ibHVlLTEwMFwiPlxuICAgICAgICAgICAgICAgICAg2LXZhtiv2YjZgiDZh9iv2YFcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXppbmMtOTAwIG10LTIgbWItMVwiPtiq2YbZhdmK2Kkg2KfZhNmD2YjYp9iv2LEg2KfZhNmI2LfZhtmK2Kk8L2g0PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgINmF2LnYr9mEINin2YTYqtmI2LfZitmGINin2YTYrdin2YTZiiDZhNiv2YrZgyDZitiz2YXYrSDZhNmDINio2KfZhNin2LPYqtmB2KfYr9ipINmF2YYg2KjYsdin2YXYrCDYr9i52YUg2KPYrNmI2LEg2KfZhNmF2YjYp9i32YbZitmGINio2YbYs9ioINiq2LXZhFxuICAgICAgICAgICAgICAgICAg2KXZhNmJIDUw2aog2YTZhdiv2K8g2KrYtdmEINil2YTZiSDYs9mG2KrZitmGLiDZgtiv2YUg2LnYqNixINio2LHYp9mF2Kwg2LXZhtiv2YjZgiDZh9iv2YEg2KfZhNii2YYuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGFcbiAgICAgICAgICAgICAgICBocmVmPVwiaHR0cHM6Ly9ocmRmLm9yZy5zYVwiXG4gICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICByZWw9XCJub3JlZmVycmVyXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWJsdWUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPtiq2LXZgditINio2LHYp9mF2Kwg2K/YudmFINmH2K/ZgTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTQgZ3JvdXAtaG92ZXI6dHJhbnNsYXRlLXgtMSBncm91cC1ob3ZlcjotdHJhbnNsYXRlLXktMSB0cmFuc2l0aW9uLXRyYW5zZm9ybVwiIC8+XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHAtNSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMTAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtgdGV4dC1bOXB4XSBmb250LWJsYWNrIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCBib3JkZXIgJHtzYXVkaXphdGlvblBjdCA8IDIwID8gXCJiZy1yb3NlLTUwIHRleHQtcm9zZS02MDAgYm9yZGVyLXJvc2UtMTAwIGFuaW1hdGUtcHVsc2VcIiA6IFwiYmctemluYy01MCB0ZXh0LXppbmMtNjAwIGJvcmRlci16aW5jLTIwMFwifWB9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAg2KrYrdmD2YUg2YbYt9in2YLYp9iqXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7ZhdmI2KfYstmG2Kkg2KfZhNiq2YjYt9mK2YYg2KfZhNi52KfYrNmE2Kk8L2g0PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgIHtzYXVkaXphdGlvblBjdCA8IDIwXG4gICAgICAgICAgICAgICAgICAgID8gXCLYo9mG2Kog2K3Yp9mE2YrYp9mLINmB2Yog2YbYt9in2YIg2K3YsdisLiDYqtmI2LjZitmBINi02K7YtSDYs9i52YjYr9mKINil2LbYp9mB2Yog2LPZitmG2YLZhCDZhdmG2LXYqtmDINmB2YjYsdin2Ysg2KXZhNmJINin2YTZhti32KfZgiDYp9mE2KPYrti22LEg2KfZhNii2YXZhiDZiNmK2YHYqtitINmE2YMg2YXZitiy2KfYqiDYp9mE2KfYs9iq2YLYr9in2YUg2YjZhtmC2YQg2KfZhNmD2YHYp9mE2KkuXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcItmE2YLYryDZhtis2K3YqiDZgdmKINin2YTYrdmB2KfYuCDYudmE2Ykg2KfZhNmG2LfYp9mCINin2YTYo9iu2LbYsSDYp9mE2KLZhdmGLiDYp9iz2KrZhdixINmB2Yog2KfZhNin2YTYqtiy2KfZhSDZhNiq2KPZh9mK2YQg2LTYsdmD2KrZgyDZhNmE2K3YtdmI2YQg2LnZhNmJINmF2YbYp9mC2LXYp9iqINit2YPZiNmF2YrYqSDZhdiq2YXZitiy2KkuXCJ9XG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvZndjb3MvbmV3XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LXJvc2UtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPtiq2LPYrNmK2YQg2YXZiNi42YEg2KzYr9mK2K88L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00IGdyb3VwLWhvdmVyOnRyYW5zbGF0ZS14LTEgZ3JvdXAtaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi10cmFuc2Zvcm1cIiAvPlxuICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIHsvKiBNaWQgZ3JpZDogQ29tcGxpYW5jZSBEYXNoYm9hcmQgJiBXUFMgUGFuZWwgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMTIgZ2FwLTZcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxnOmNvbC1zcGFuLTdcIj5cbiAgICAgICAgICAgIDxDb21wbGlhbmNlRGFzaGJvYXJkIC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZzpjb2wtc3Bhbi01XCI+XG4gICAgICAgICAgICA8UGF5cm9sbENvbXBsaWFuY2VXaWRnZXQgcnVucz17cGF5cm9sbFJ1bnN9IC8+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuXG4gICAgICAgIHsvKiBCb3R0b20gZG91YmxlIGJlbnRvOiBJbi1mbGlnaHQgUGF5cm9sbCBydW5zIHZzIEV4cGlyaW5nIERvY3VtZW50cyBhbGVydHMgKi99XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZ3JpZCBncmlkLWNvbHMtMSBsZzpncmlkLWNvbHMtMiBnYXAtNlwiPlxuICAgICAgICAgIHsvKiBDb250cmFjdHMgQWxlcnRzICovfVxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLXdoaXRlIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy0xMDAgc2hhZG93LXNtIHAtNlwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1jZW50ZXIgbWItNlwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtbGcgdGV4dC16aW5jLTkwMFwiPtiq2YbYqNmK2YfYp9iqINi52YLZiNivINin2YTYudmF2YQg2YjYp9mE2KXZgtin2YXYp9iqPC9oMz5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICAgINi52YLZiNivINi02KfYsdmB2Kog2LnZhNmJINin2YTYp9mG2KrZh9in2KEg2KrYqti32YTYqCDYpdis2LHYp9ih2Ysg2YHZiNix2YrYp9mLINmE2KrZhNin2YHZiiDYp9mE2KXZitmC2KfZgVxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxMaW5rIHRvPVwiL2FwcC9md2Nvc1wiIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ib2xkIHRleHQtcHJpbWFyeSBob3Zlcjp1bmRlcmxpbmVcIj5cbiAgICAgICAgICAgICAgICDYpdiv2KfYsdipINin2YTZg9in2K/YsVxuICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTRcIj5cbiAgICAgICAgICAgICAge2Rhc2hib2FyZFN0YXRzPy5leHBpcmluZ0NvbnRyYWN0c0FsZXJ0cz8ubGVuZ3RoID4gMCA/IChcbiAgICAgICAgICAgICAgICBkYXNoYm9hcmRTdGF0cy5leHBpcmluZ0NvbnRyYWN0c0FsZXJ0cy5tYXAoKGFsZXJ0OiBhbnkpID0+IChcbiAgICAgICAgICAgICAgICAgIDxkaXZcbiAgICAgICAgICAgICAgICAgICAga2V5PXthbGVydC5pZH1cbiAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC00IHJvdW5kZWQtMnhsIGJnLWFtYmVyLTUwLzUwIGJvcmRlciBib3JkZXItYW1iZXItMTAwIGZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlclwiXG4gICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTAgaC0xMCBiZy1hbWJlci0xMDAgdGV4dC1hbWJlci03MDAgcm91bmRlZC14bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPEFsZXJ0Q2lyY2xlIGNsYXNzTmFtZT1cInctNSBoLTUgYW5pbWF0ZS1wdWxzZVwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtemluYy05MDBcIj57YWxlcnQubWVzc2FnZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIG10LTAuNVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICDZhdmI2LnYryDYp9mE2KrYrNiv2YrYryDYp9mE2YXZgtiq2LHYrTog2YLYqNmEIDEwINij2YrYp9mFINmF2YYg2KfZhNin2YbYqtmH2KfYoVxuICAgICAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICAgICAgICB0bz1cIi9hcHAvZndjb3NcIlxuICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWFtYmVyLTYwMCB0ZXh0LXdoaXRlIHRleHQteHMgZm9udC1ib2xkIHB4LTMgcHktMiByb3VuZGVkLWxnIGhvdmVyOmJnLWFtYmVyLTcwMCB0cmFuc2l0aW9uXCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgINiq2KzYr9mK2K8g2KfZhNii2YZcbiAgICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKSlcbiAgICAgICAgICAgICAgKSA6IChcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInRleHQtY2VudGVyIHB5LTE2XCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiByb3VuZGVkLWZ1bGwgYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNTAwIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIG14LWF1dG8gbWItM1wiPlxuICAgICAgICAgICAgICAgICAgICA8Q2hlY2tDaXJjbGUyIGNsYXNzTmFtZT1cInctNiBoLTZcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIHRleHQteHMgZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3QgbGVhZGluZy1ub25lXCI+XG4gICAgICAgICAgICAgICAgICAgINmF2KTYtNixINij2YXYp9mGINin2YTYudmC2YjYryDZhdiz2KrZgtixINmI2YXZhdiq2KfYslxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC16aW5jLTQwMCB0ZXh0LVsxMHB4XSBmb250LW1lZGl1bSBtdC0xXCI+XG4gICAgICAgICAgICAgICAgICAgINmE2Kcg2KrZiNis2K8g2LnZgtmI2K8g2KrZhtiq2YfZiiDYrtmE2KfZhCDYp9mE2YAgMzAg2YrZiNmF2KfZiyDYp9mE2YLYp9iv2YXYqVxuICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgICAgey8qIFBheXJvbGwgUnVucyAqL31cbiAgICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJiZy13aGl0ZSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXppbmMtMTAwIHNoYWRvdy1zbSBwLTYgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLWNlbnRlciBtYi02XCI+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYmxhY2sgdGV4dC1sZyB0ZXh0LXppbmMtOTAwXCI+2YXYs9mK2LHYp9iqINix2YjYp9iq2Kgg2KfZhNmD2KfYr9ixICjYp9mE2KPYrtmK2LHYqSk8L2gzPlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBmb250LW1lZGl1bVwiPtiz2KzZhNin2Kog2KfZhNi12LHZgSDYp9mE2LTZh9ix2YrYqSDYp9mE2YXYudiq2YXYr9ipPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmsgdG89XCIvYXBwL3BheXJvbGxcIiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnkgaG92ZXI6dW5kZXJsaW5lXCI+XG4gICAgICAgICAgICAgICAg2YPZhCDYp9mE2YXYs9mK2LHYp9iqXG4gICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm92ZXJmbG93LXgtYXV0b1wiPlxuICAgICAgICAgICAgICA8dGFibGUgY2xhc3NOYW1lPVwidy1mdWxsIHRleHQtcmlnaHQgdGV4dC1zbVwiPlxuICAgICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNDAwIGZvbnQtYm9sZCBib3JkZXItYiBib3JkZXItemluYy0xMDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtWzEwcHhdXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJwYi0zIHRleHQtcmlnaHRcIj7Yp9mE2YHYqtix2Kk8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWNlbnRlclwiPtin2YTZhdmI2LjZgdmK2YY8L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWNlbnRlclwiPtin2YTYtdix2YEg2KfZhNmF2LnYqtmF2K88L3RoPlxuICAgICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWxlZnRcIj7Yo9mI2KfZhdixIFNJRjwvdGg+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgIDwvdGhlYWQ+XG4gICAgICAgICAgICAgICAgPHRib2R5IGNsYXNzTmFtZT1cImRpdmlkZS15IGRpdmlkZS16aW5jLTEwMFwiPlxuICAgICAgICAgICAgICAgICAge3BheXJvbGxSdW5zPy5zbGljZSgwLCA0KS5tYXAoKHJ1bjogYW55LCBpZHg6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PXtydW4uaWQgfHwgaWR4fSBjbGFzc05hbWU9XCJob3ZlcjpiZy16aW5jLTUwLzUwIHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB5LTMgZm9udC1ib2xkIHRleHQtemluYy04MDBcIj57cnVuLnBlcmlvZH08L3RkPlxuICAgICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweS0zIHRleHQtY2VudGVyIHRleHQtemluYy01MDAgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICB7cnVuLmVudHJpZXM/Lmxlbmd0aCB8fCAwfVxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB5LTMgdGV4dC1jZW50ZXIgZm9udC1ib2xkIHRleHQtemluYy05NTBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtydW4udG90YWxOZXQ/LnRvTG9jYWxlU3RyaW5nKCkgfHwgcnVuLnRvdGFsR3Jvc3M/LnRvTG9jYWxlU3RyaW5nKCl9INixLtizXG4gICAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZXIpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgZGF0YSB9ID0gYXdhaXQgUGF5cm9sbFNlcnZpY2UuYmF0Y2hHZW5lcmF0ZU11ZGFkU0lGKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1c2VyLnVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcnVuLnBlcmlvZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbZGF0YV0sIHsgdHlwZTogXCJ0ZXh0L2NzdjtjaGFyc2V0PXV0Zi04O1wiIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKFwiaHJlZlwiLCB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoXCJkb3dubG9hZFwiLCBgV1BTX1NJRl8ke3J1bi5wZXJpb2R9LnNpZmApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxpbmsuY2xpY2soKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkucmVtb3ZlQ2hpbGQobGluayk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0b2FzdC5zdWNjZXNzKFwi2KrZhSDYqtmI2YTZitivINmI2KrYrdmF2YrZhCDZhdmE2YEgU0lGINmE2YXYr9ivINio2YbYrNin2K1cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdG9hc3QuZXJyb3IoXCLZgdi02YQg2YHZiiDYp9iz2KrYrtix2KfYrCDZhdmE2YEg2YXYr9ivXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gZm9udC1ibGFjayB0ZXh0LWVtZXJhbGQtNjAwIGJnLWVtZXJhbGQtNTAgaG92ZXI6YmctZW1lcmFsZC0xMDAgcHgtMi41IHB5LTEuNSByb3VuZGVkLWxnIGJvcmRlciBib3JkZXItZW1lcmFsZC0xMDAgdHJhbnNpdGlvbi1jb2xvcnMgaW5saW5lLWZsZXggaXRlbXMtY2VudGVyIGdhcC0xXCJcbiAgICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPERvd25sb2FkIGNsYXNzTmFtZT1cInctMyBoLTNcIiAvPiBTSUZcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICAgIHsoIXBheXJvbGxSdW5zIHx8IHBheXJvbGxSdW5zLmxlbmd0aCA9PT0gMCkgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8dHIga2V5PVwiZW1wdHktcGF5cm9sbC1ydW5zXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPHRkXG4gICAgICAgICAgICAgICAgICAgICAgICBjb2xTcGFuPXs0fVxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHktMTIgdGV4dC1jZW50ZXIgdGV4dC16aW5jLTQwMCB0ZXh0LXhzIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXN0XCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDZhNinINiq2YjYrNivINmF2LPZitix2KfYqiDZhdiz2KzZhNipINit2KrZiSDYp9mE2KLZhlxuICAgICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICAgIDwvdGFibGU+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcblxuICBjb25zdCByZW5kZXJBY2NvdW50aW5nVmlldyA9ICgpID0+IHtcbiAgICAvLyBWQVQgbGlhYmlsaXR5IGNhbGN1bGF0aW9uXG4gICAgY29uc3QgY29sbGVjdGVkVmF0ID0gZGFzaGJvYXJkU3RhdHM/LnZhdEV4cG9zdXJlIHx8IDA7XG5cbiAgICAvLyBJbnZvaWNlcyBzdW1tYXJ5XG4gICAgY29uc3QgcGVuZGluZ0ludm9pY2VzQ291bnQgPSBpbnZvaWNlcy5maWx0ZXIoXG4gICAgICAoaSkgPT4gaS5zdGF0dXMgIT09IFwicGFpZFwiICYmIGkuc3RhdHVzICE9PSBcImNhbmNlbGxlZFwiXG4gICAgKS5sZW5ndGg7XG4gICAgY29uc3QgdG90YWxQZW5kaW5nQW1vdW50QXIgPVxuICAgICAgaW52b2ljZXNcbiAgICAgICAgLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgIT09IFwicGFpZFwiICYmIGkuc3RhdHVzICE9PSBcImNhbmNlbGxlZFwiKVxuICAgICAgICAucmVkdWNlKChhY2MsIGkpID0+IGFjYyArIChpLnRvdGFsQW1vdW50SGFsYWxhcyB8fCAwKSwgMCkgLyAxMDA7XG5cbiAgICBjb25zdCBwYWlkSW52b2ljZXNBbW91bnQgPVxuICAgICAgaW52b2ljZXNcbiAgICAgICAgLmZpbHRlcigoaSkgPT4gaS5zdGF0dXMgPT09IFwicGFpZFwiKVxuICAgICAgICAucmVkdWNlKChhY2MsIGkpID0+IGFjYyArIChpLnRvdGFsQW1vdW50SGFsYWxhcyB8fCAwKSwgMCkgLyAxMDA7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTggYW5pbWF0ZS1mYWRlLWluXCIgZGlyPXtpc0FyID8gXCJydGxcIiA6IFwibHRyXCJ9PlxuICAgICAgICB7LyogS1BJIFJvdyAtIE1vZGVybiBCZW50byBHcmlkICovfVxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy00IGdhcC02XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMlwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctMzIgaC0zMiBiZy1hbWJlci01MDAvNSBkYXJrOmJnLWFtYmVyLTUwMC8xMCByb3VuZGVkLWZ1bGwgYmx1ci0yeGwgcG9pbnRlci1ldmVudHMtbm9uZVwiIC8+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLXN0YXJ0IG1iLTZcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMyByb3VuZGVkLTJ4bCBiZy1hbWJlci01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxEb2xsYXJTaWduIGNsYXNzTmFtZT1cInctNiBoLTYgdGV4dC1hbWJlci01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ibGFjayBweC0yLjUgcHktMSBiZy1hbWJlci01MDAvMTAgdGV4dC1hbWJlci01MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWFtYmVyLTUwMC8xMFwiPlxuICAgICAgICAgICAgICAgICAg2YfZitim2Kkg2KfZhNiy2YPYp9ipIChWQVQpXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC16aW5jLTUwMCBkYXJrOnRleHQtemluYy00MDAgdGV4dC1zbSBmb250LWJsYWNrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYp9mE2KrYstin2YXYp9iqINi22LHZitio2Kkg2KfZhNmC2YrZhdipINin2YTZhdi22KfZgdipIChDb2xsZWN0ZWQgVkFUKVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LTN4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgZGFyazp0ZXh0LXppbmMtMTAwIHRyYWNraW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAge2NvbGxlY3RlZFZhdC50b0xvY2FsZVN0cmluZygpfSDYsS7Ys1xuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIGRhcms6dGV4dC16aW5jLTUwMCBtdC0yIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgINmK2Y/Yrdiq2LPYqCDYqtix2KfZg9mF2YrYp9mLINmI2YXYqNin2LTYsdip2Ysg2YXZhiDYp9mE2YHZiNin2KrZitixINin2YTYtdin2K/YsdipINmE2YTYudmF2YTYp9ihINio2YXYudiv2YQgMTXZqlxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG5cbiAgICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgICAgd2hpbGVIb3Zlcj17eyB5OiAtNiwgc2NhbGU6IDEuMDEgfX1cbiAgICAgICAgICAgIHRyYW5zaXRpb249e3sgdHlwZTogXCJzcHJpbmdcIiwgc3RpZmZuZXNzOiAzMDAsIGRhbXBpbmc6IDIwIH19XG4gICAgICAgICAgICBjbGFzc05hbWU9XCJwLTYgcm91bmRlZC1bMnJlbV0gYm9yZGVyIHRyYW5zaXRpb24tYWxsIGR1cmF0aW9uLTMwMCByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW4gZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW4gYmctd2hpdGUvODAgZGFyazpiZy16aW5jLTEwMC80MCBiYWNrZHJvcC1ibHVyLW1kIGJvcmRlci16aW5jLTE1MCBkYXJrOmJvcmRlci16aW5jLTg1MC82MCBzaGFkb3ctc20gaG92ZXI6c2hhZG93LWxnIGRhcms6aG92ZXI6c2hhZG93LWJsYWNrLzMwIGhvdmVyOmJvcmRlci1lbWVyYWxkLTUwMC8yMCBkYXJrOmhvdmVyOmJvcmRlci1lbWVyYWxkLTUwMC8yMCBtZDpjb2wtc3Bhbi0xXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXgganVzdGlmeS1iZXR3ZWVuIGl0ZW1zLXN0YXJ0IG1iLTZcIj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMyByb3VuZGVkLTJ4bCBiZy1yb3NlLTUwMC8xMFwiPlxuICAgICAgICAgICAgICAgICAgPEZpbGVUZXh0IGNsYXNzTmFtZT1cInctNiBoLTYgdGV4dC1yb3NlLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJsYWNrIHB4LTIuNSBweS0xIGJnLXJvc2UtNTAwLzEwIHRleHQtcm9zZS01MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLXJvc2UtNTAwLzEwIGFuaW1hdGUtcHVsc2VcIj5cbiAgICAgICAgICAgICAgICAgIHtwZW5kaW5nSW52b2ljZXNDb3VudH0g2YXYudmE2YLYqVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtemluYy01MDAgZGFyazp0ZXh0LXppbmMtNDAwIHRleHQtc20gZm9udC1ibGFjayBtYi0xXCI+XG4gICAgICAgICAgICAgICAg2KfZhNmF2K/ZgdmI2LnYp9iqINin2YTZhdiz2KrYrdmC2Kkg2YTZhNiq2K3YtdmK2YQgKFJlY2VpdmFibGVzKVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgZGFyazp0ZXh0LXppbmMtMTAwIHRyYWNraW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAge3RvdGFsUGVuZGluZ0Ftb3VudEFyLnRvTG9jYWxlU3RyaW5nKCl9INixLtizXG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtemluYy00MDAgZGFyazp0ZXh0LXppbmMtNTAwIG10LTIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAg2YHZiNin2KrZitixINio2KfZhtiq2LjYp9ixINin2YTYs9iv2KfYryDYo9mIINin2YTYqtiz2YjZitipINmE2YTZhdix2K3ZhNipIDJcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi02XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTMgcm91bmRlZC0yeGwgYmctZW1lcmFsZC01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxUcmVuZGluZ1VwIGNsYXNzTmFtZT1cInctNiBoLTYgdGV4dC1lbWVyYWxkLTUwMFwiIC8+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJsYWNrIHB4LTIuNSBweS0xIGJnLWVtZXJhbGQtNTAwLzEwIHRleHQtZW1lcmFsZC01MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWVtZXJhbGQtNTAwLzEwXCI+XG4gICAgICAgICAgICAgICAgICDYs9mK2YjZhNipINmF2K3ZgtmC2KlcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIGRhcms6dGV4dC16aW5jLTQwMCB0ZXh0LXNtIGZvbnQtYmxhY2sgbWItMVwiPlxuICAgICAgICAgICAgICAgINil2KzZhdin2YTZiiDZg9i02YjZgSDYp9mE2KXZitix2KfYr9in2Kog2KfZhNmF2LXZiNmG2KkgKFBhaWQgQ2FzaClcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC0yeGwgZm9udC1ibGFjayB0ZXh0LXppbmMtOTAwIGRhcms6dGV4dC16aW5jLTEwMCB0cmFja2luZy10aWdodFwiPlxuICAgICAgICAgICAgICAgIHtwYWlkSW52b2ljZXNBbW91bnQudG9Mb2NhbGVTdHJpbmcoKX0g2LEu2LNcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBkYXJrOnRleHQtemluYy01MDAgbXQtMiBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICDYp9mE2KrYr9mB2YLYp9iqINin2YTZhtmC2K/ZitipINin2YTYr9in2K7ZhNipINin2YTYqtmKINi32KfYqNmC2Kog2KjZhtis2KfYrVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICB7LyogSW50ZWxsaWdlbmNlIFJlY29tbWVuZGVyICovfVxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJiZy1ncmFkaWVudC10by1yIGZyb20tcHJpbWFyeS8xMCB2aWEtcHJpbWFyeS81IHRvLXRyYW5zcGFyZW50IHJvdW5kZWQtWzJyZW1dIGJvcmRlciBib3JkZXItcHJpbWFyeS8yMCBwLTYgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCI+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSAtbGVmdC0yMCAtdG9wLTIwIHctNjQgaC02NCBiZy1wcmltYXJ5LzIwIHJvdW5kZWQtZnVsbCBibHVyLVs4MHB4XSBwb2ludGVyLWV2ZW50cy1ub25lIG1peC1ibGVuZC1vdmVybGF5XCIgLz5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC00IG1iLTYgcmVsYXRpdmUgei0xMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEyIGgtMTIgYmctd2hpdGUgcm91bmRlZC0yeGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgc2hhZG93LW1kIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMFwiPlxuICAgICAgICAgICAgICA8WmFwIGNsYXNzTmFtZT1cInctNiBoLTYgdGV4dC1wcmltYXJ5XCIgLz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYmxhY2sgdGV4dC14bCB0ZXh0LXppbmMtOTAwXCI+XG4gICAgICAgICAgICAgICAg2YXYrdix2YMg2KfZhNix2YLYp9io2Kkg2YjYp9mE2KfZhdiq2KvYp9mEINin2YTYttix2YrYqNmKIChaQVRDQSBBZHZpc29yeSlcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJvbGQgdGV4dC1wcmltYXJ5XCI+XG4gICAgICAgICAgICAgICAg2KrZiNi12YrYp9iqINit2YrYqSDZhNmE2KfZhdiq2KvYp9mEINmE2YXYqti32YTYqNin2Kog2KfZhNmB2YjYqtix2Kkg2KfZhNil2YTZg9iq2LHZiNmG2YrYqSDZiNin2YTYqtmC2KfYsdmK2LEg2KfZhNmF2KfZhNmK2Kkg2YTZhNix2KjYuSDYp9mE2K3Yp9mE2YpcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbWQ6Z3JpZC1jb2xzLTMgZ2FwLTUgcmVsYXRpdmUgei0xMFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZSBwLTUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzEwIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuXCI+XG4gICAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC1bOXB4XSBmb250LWJsYWNrIGJnLWJsdWUtNTAgdGV4dC1ibHVlLTYwMCBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgYm9yZGVyIGJvcmRlci1ibHVlLTEwMFwiPlxuICAgICAgICAgICAgICAgICAg2YfZitim2Kkg2KfZhNiy2YPYp9ipXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj5cbiAgICAgICAgICAgICAgICAgINin2YTYsdio2Lcg2KfZhNil2YTZg9iq2LHZiNmG2Yog2YTZhNmF2LHYrdmE2Kkg2KfZhNir2KfZhtmK2KlcbiAgICAgICAgICAgICAgICA8L2g0PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgINmK2KrZititINmE2YMg2YbYuNin2YUg2YXYr9in2LHYrCDYpdix2LPYp9mEINmB2YjYp9iq2YrYsdmDINmF2KjYp9i02LHYqSDYpdmE2Ykg2KjZiNix2KrYp9mEINmB2KfYqtmI2LHYqSAoWkFUQ0EpINmE2K3YuNmK2KfZiyDYqNin2LPYqtiu2K/Yp9mFXG4gICAgICAgICAgICAgICAgICDYp9mE2KrZiNmC2YrYudin2Kog2KfZhNix2YLZhdmK2Kkg2KfZhNmF2LTZgdix2KkuINmB2LnZhCDYp9mE2KrZg9in2YXZhCDZiNiq2K7ZhNi1INmF2YYg2KfZhNmC2YTZgiDYqtmF2KfZhdin2YsuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvaW50ZWdyYXRpb25zXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWJsdWUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPtiq2YHYudmK2YQg2LHYqNi3IFpBVENBPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBcnJvd1VwUmlnaHQgY2xhc3NOYW1lPVwidy00IGgtNCBncm91cC1ob3Zlcjp0cmFuc2xhdGUteC0xIGdyb3VwLWhvdmVyOi10cmFuc2xhdGUteS0xIHRyYW5zaXRpb24tdHJhbnNmb3JtXCIgLz5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC01IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayBiZy1lbWVyYWxkLTUwIHRleHQtZW1lcmFsZC02MDAgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIGJvcmRlciBib3JkZXItZW1lcmFsZC0xMDBcIj5cbiAgICAgICAgICAgICAgICAgINin2YTYqtiv2YHZgiDYp9mE2YXYp9mE2YpcbiAgICAgICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXppbmMtOTAwIG10LTIgbWItMVwiPlxuICAgICAgICAgICAgICAgICAg2KrYrdi12YrZhCDYp9mE2YXYqNin2YTYuiDYp9mE2YXYs9iq2K3ZgtipINin2YTZhdiq2KPYrtix2KlcbiAgICAgICAgICAgICAgICA8L2g0PlxuICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTUwMCBsZWFkaW5nLXJlbGF4ZWRcIj5cbiAgICAgICAgICAgICAgICAgINmF2KrZiNiz2Lcg2YHYqtix2KfYqiDYp9mE2LPYr9in2K8g2YXZhiDYudmF2YTYp9im2YMg2KfYsdiq2YHYudiqINio2YXYudiv2YQgNSDYo9mK2KfZhS4g2KPYqtmF2KrYqSDYpdix2LPYp9mEINix2LPYp9im2YQg2KfZhNiq2LDZg9mK2LFcbiAgICAgICAgICAgICAgICAgINio2KfZhNmB2YjYp9iq2YrYsSDYudio2LEg2YXYr9in2LHYrCDZitmC2YTZhCDYp9mE2LDZhdmFINin2YTZhdiv2YrZhtipINio2YbYs9io2KkgMjUlLlxuICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgdG89XCIvYXBwL2ludm9pY2VzXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWVtZXJhbGQtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPtmB2K3YtSDYp9mE2YHZiNin2KrZitixINin2YTZhdi52YTZgtipPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBcnJvd1VwUmlnaHQgY2xhc3NOYW1lPVwidy00IGgtNCBncm91cC1ob3Zlcjp0cmFuc2xhdGUteC0xIGdyb3VwLWhvdmVyOi10cmFuc2xhdGUteS0xIHRyYW5zaXRpb24tdHJhbnNmb3JtXCIgLz5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC01IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayBiZy1wdXJwbGUtNTAgdGV4dC1wdXJwbGUtNjAwIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCBib3JkZXIgYm9yZGVyLXB1cnBsZS0xMDBcIj5cbiAgICAgICAgICAgICAgICAgINin2YTYpdmC2LHYp9ixINin2YTYttix2YrYqNmKXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7Yo9ix2LTZgdipINmI2K3Ys9in2Kgg2KfZhNil2YLYsdin2LEg2KjYtti62LfYqSDYstixPC9oND5cbiAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgbGVhZGluZy1yZWxheGVkXCI+XG4gICAgICAgICAgICAgICAgICDZgtin2LHYqNiqINmG2YfYp9mK2Kkg2KfZhNmB2KrYsdipINin2YTYttix2YrYqNmK2Kkg2KfZhNit2KfZhNmK2KkuINmG2LjYp9mFINin2YTZgdix2LIg2KfZhNii2YTZiiDZgdmKINmF2K/Yp9ix2Kwg2YrYs9mF2K0g2YTZgyDYqNmF2LTYp9mH2K/YqVxuICAgICAgICAgICAgICAgICAg2YjYqtit2YXZitmEINiq2YLYsdmK2LEg2KfZhNil2YLYsdin2LHYp9iqINin2YTYsdio2Lkg2LPZhtmI2Yog2KfZhNmF2K/ZgtmCINin2YTZhdiq2YjYp9mB2YIg2YXYuSDZhdiq2LfZhNio2KfYqiDYp9mE2YfZitim2KkuXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvYW5hbHl0aWNzXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LXB1cnBsZS02MDAgZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTEgZ3JvdXBcIlxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPHNwYW4+2KrZiNmE2YrYryDYqtmC2LHZitixINin2YTYpdmC2LHYp9ixINin2YTYttix2YrYqNmKPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxBcnJvd1VwUmlnaHQgY2xhc3NOYW1lPVwidy00IGgtNCBncm91cC1ob3Zlcjp0cmFuc2xhdGUteC0xIGdyb3VwLWhvdmVyOi10cmFuc2xhdGUteS0xIHRyYW5zaXRpb24tdHJhbnNmb3JtXCIgLz5cbiAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvc2VjdGlvbj5cblxuICAgICAgICB7LyogQ2hhcnRzICYgSW52b2ljZWQgc3RhdHMgbGVkZ2VyICovfVxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTEgbGc6Z3JpZC1jb2xzLTEyIGdhcC02XCI+XG4gICAgICAgICAgey8qIFJldmVudWUgZGlzdHJpYnV0aW9uIGNoYXJ0ICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLXdoaXRlIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy0xMDAgc2hhZG93LXNtIGgtWzM4MHB4XSBsZzpjb2wtc3Bhbi04IGZsZXggZmxleC1jb2xcIj5cbiAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtemluYy05MDAgdGV4dC1sZyBtYi0xXCI+2KrYt9mI2LEg2KfZhNmB2YjYqtix2Kkg2YjZhdiq2K3YtdmE2KfYqiDYp9mE2LPZitmI2YTYqTwvaDM+XG4gICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy00MDAgZm9udC1ib2xkIG1iLTZcIj5cbiAgICAgICAgICAgICAg2YLZitmF2Kkg2KfZhNmB2YjYp9iq2YrYsSDYp9mE2LXYp9iv2LHYqSDYp9mE2YXYudiq2YXYr9ipINmF2YLYp9ix2YbYqdmLINio2KfZhNmF2KrYrdi12YTYp9iqINin2YTZgdi52YTZitipINi02YfYsdmK2KfZi1xuICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoLWZ1bGwgcGItNlwiPlxuICAgICAgICAgICAgICA8UmVzcG9uc2l2ZUNvbnRhaW5lciB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCI+XG4gICAgICAgICAgICAgICAgPEFyZWFDaGFydCBkYXRhPXtxdWFydGVybHlEYXRhfT5cbiAgICAgICAgICAgICAgICAgIDxkZWZzPlxuICAgICAgICAgICAgICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9XCJwYWlkR3JhZFwiIHgxPVwiMFwiIHkxPVwiMFwiIHgyPVwiMFwiIHkyPVwiMVwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD1cIjUlXCIgc3RvcENvbG9yPVwiIzEwYjk4MVwiIHN0b3BPcGFjaXR5PXswLjE1fSAvPlxuICAgICAgICAgICAgICAgICAgICAgIDxzdG9wIG9mZnNldD1cIjk1JVwiIHN0b3BDb2xvcj1cIiMxMGI5ODFcIiBzdG9wT3BhY2l0eT17MH0gLz5cbiAgICAgICAgICAgICAgICAgICAgPC9saW5lYXJHcmFkaWVudD5cbiAgICAgICAgICAgICAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPVwicGVuZGluZ0dyYWRcIiB4MT1cIjBcIiB5MT1cIjBcIiB4Mj1cIjBcIiB5Mj1cIjFcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9XCI1JVwiIHN0b3BDb2xvcj1cIiMzYjgyZjZcIiBzdG9wT3BhY2l0eT17MC4xNX0gLz5cbiAgICAgICAgICAgICAgICAgICAgICA8c3RvcCBvZmZzZXQ9XCI5NSVcIiBzdG9wQ29sb3I9XCIjM2I4MmY2XCIgc3RvcE9wYWNpdHk9ezB9IC8+XG4gICAgICAgICAgICAgICAgICAgIDwvbGluZWFyR3JhZGllbnQ+XG4gICAgICAgICAgICAgICAgICA8L2RlZnM+XG4gICAgICAgICAgICAgICAgICA8WEF4aXMgZGF0YUtleT1cIm5hbWVcIiB0aWNrPXt7IGZpbGw6IFwiI2ExYTFhYVwiLCBmb250U2l6ZTogMTAgfX0gLz5cbiAgICAgICAgICAgICAgICAgIDxUb29sdGlwIGZvcm1hdHRlcj17KHZhbHVlOiBhbnkpID0+IFtgJHt2YWx1ZS50b0xvY2FsZVN0cmluZygpfSDYsS7Ys2AsIFwiXCJdfSAvPlxuICAgICAgICAgICAgICAgICAgPENhcnRlc2lhbkdyaWQgc3Ryb2tlRGFzaGFycmF5PVwiMyAzXCIgc3Ryb2tlPVwiI2Y0ZjRmNVwiIHZlcnRpY2FsPXtmYWxzZX0gLz5cbiAgICAgICAgICAgICAgICAgIDxMZWdlbmQgd3JhcHBlclN0eWxlPXt7IGZvbnRTaXplOiAxMiB9fSAvPlxuICAgICAgICAgICAgICAgICAgPEFyZWFcbiAgICAgICAgICAgICAgICAgICAgdHlwZT1cIm1vbm90b25lXCJcbiAgICAgICAgICAgICAgICAgICAgZGF0YUtleT1cImN1cnJlbnRcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwi2KfZhNmF2KrYrdi12YQg2KfZhNmB2LnZhNmKXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiIzEwYjk4MVwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgICAgICAgICAgICAgICBmaWxsPVwidXJsKCNwYWlkR3JhZClcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDxBcmVhXG4gICAgICAgICAgICAgICAgICAgIHR5cGU9XCJtb25vdG9uZVwiXG4gICAgICAgICAgICAgICAgICAgIGRhdGFLZXk9XCJwcm9qZWN0ZWRcIlxuICAgICAgICAgICAgICAgICAgICBuYW1lPVwi2KrYrdiqINin2YTYqtit2LXZitmEIC8g2LDZhdmFXCJcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlPVwiIzNiODJmNlwiXG4gICAgICAgICAgICAgICAgICAgIHN0cm9rZVdpZHRoPXszfVxuICAgICAgICAgICAgICAgICAgICBmaWxsPVwidXJsKCNwZW5kaW5nR3JhZClcIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L0FyZWFDaGFydD5cbiAgICAgICAgICAgICAgPC9SZXNwb25zaXZlQ29udGFpbmVyPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICB7LyogS2V5IENoZWNrbGlzdCBjYXJkICovfVxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC02IGJnLXdoaXRlIHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItemluYy0xMDAgc2hhZG93LXNtIGxnOmNvbC1zcGFuLTQgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtemluYy05MDAgdGV4dC1iYXNlIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYqtiv2YLZitmCINin2YTYttmI2KfYqNi3INmI2KfZhNin2YXYqtir2KfZhCDYp9mE2YXYp9mE2YpcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTFweF0gdGV4dC16aW5jLTQwMCBmb250LWJvbGQgbWItNFwiPlxuICAgICAgICAgICAgICAgINmC2KfYptmF2Kkg2KfZhNiq2K3ZgtmCINin2YTYqtmB2KfYudmE2YrYqSDZhNiz2YTYp9mF2Kkg2KfZhNiv2YHYp9iq2LFcbiAgICAgICAgICAgICAgPC9wPlxuXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0zLjUgcHQtMlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTNcIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0xIHJvdW5kZWQtbGcgYmctZW1lcmFsZC0xMDAgdGV4dC1lbWVyYWxkLTcwMCBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICA8Q2hlY2sgY2xhc3NOYW1lPVwidy0zLjUgaC0zLjVcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy02MDAgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgINiq2LfYp9io2YIg2KfZhNix2YLZhSDYp9mE2LbYsdmK2KjZiiBWQVQg2YjZhdix2K3ZhNipIFpBVENBIDJcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMSByb3VuZGVkLWxnIGJnLWVtZXJhbGQtMTAwIHRleHQtZW1lcmFsZC03MDAgc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNjAwIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICDYqtix2YXZitiyINin2YTZhdmG2KrYrNin2Kog2YjYpdi02LnYp9ix2KfYqiDYp9mE2K7YtdmFINin2YTYttix2YrYqNmK2KlcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMSByb3VuZGVkLWxnIGJnLWVtZXJhbGQtMTAwIHRleHQtZW1lcmFsZC03MDAgc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNjAwIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICDYqtiz2YjZitipINmD2LTZiNmBINin2YTYo9is2YjYsSDZiNmF2LfYp9io2YLYqtmH2Kcg2YTZhdiz2YrYsdin2Kog2KrYo9mF2YrZhtin2KpcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0zXCI+XG4gICAgICAgICAgICAgICAgICB7Y29sbGVjdGVkVmF0ID4gMCA/IChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTEgcm91bmRlZC1sZyBiZy1lbWVyYWxkLTEwMCB0ZXh0LWVtZXJhbGQtNzAwIHNocmluay0wXCI+XG4gICAgICAgICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cInctMy41IGgtMy41XCIgLz5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInAtMSByb3VuZGVkLWxnIGJnLWFtYmVyLTEwMCB0ZXh0LWFtYmVyLTcwMCBzaHJpbmstMFwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxBbGVydENpcmNsZSBjbGFzc05hbWU9XCJ3LTMuNSBoLTMuNVwiIC8+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgdGV4dC16aW5jLTYwMCBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICAgICAg2KfYrdiq2LPYp9ioINin2YTZgdix2YjZgtin2Kog2KfZhNi22LHZitio2YrYqSDZhNmE2K/Yp9iu2YTYqSDZiNin2YTZhdiu2LHYrNin2KpcbiAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJib3JkZXItdCBib3JkZXItemluYy0xMDAgcHQtNCBtdC02XCI+XG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtemluYy00MDAgZm9udC1ibGFjayB0cmFja2luZy13aWRlc3QgdXBwZXJjYXNlIGJsb2NrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYp9mE2LHYqtio2Kkg2YHZiiDYtNio2YPYqSDZhdiv2KfYsdisT1NcbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXNtIGZvbnQtYmxhY2sgdGV4dC1lbWVyYWxkLTYwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMVwiPlxuICAgICAgICAgICAgICAgIDxzcGFuPti02LHZg9ipINmF2KTZh9mE2Kkg2YjZhdmF2KrYq9mE2Kkg2KjYp9mE2YPYp9mF2YQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgPFNoaWVsZENoZWNrIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgey8qIExlZGdlciB0YWJsZSAqL31cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gcC02IG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIG1iLTZcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtbGcgdGV4dC16aW5jLTkwMFwiPlxuICAgICAgICAgICAgICAgINiv2YHYqtixINmB2YjYp9iq2YrYsSDYp9mE2YXYqNmK2LnYp9iqINin2YTYtdin2K/YsdipICjYp9mE2YXYqtmD2KfZhdmEKVxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICDYs9is2YTYp9iqINmB2YjYp9iq2YrYsdmDINin2YTYtdin2K/YsdipINmF2YYg2LXZgdit2Kkg2KfZhNmB2YjYp9iq2YrYsSDZgdmKINin2YTZhti42KfZhSDZhdis2YTZiNio2Kkg2K3Zitin2YtcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8TGluayB0bz1cIi9hcHAvaW52b2ljZXNcIiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnkgaG92ZXI6dW5kZXJsaW5lXCI+XG4gICAgICAgICAgICAgINil2K/Yp9ix2Kkg2KfZhNmB2YjYp9iq2YrYsVxuICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJvdmVyZmxvdy14LWF1dG9cIj5cbiAgICAgICAgICAgIDx0YWJsZSBjbGFzc05hbWU9XCJ3LWZ1bGwgdGV4dC1yaWdodCB0ZXh0LXNtXCI+XG4gICAgICAgICAgICAgIDx0aGVhZD5cbiAgICAgICAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwidGV4dC16aW5jLTQwMCBmb250LWJvbGQgYm9yZGVyLWIgYm9yZGVyLXppbmMtMTAwIHVwcGVyY2FzZSB0cmFja2luZy13aWRlciB0ZXh0LVsxMXB4XVwiPlxuICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInBiLTMgdGV4dC1yaWdodFwiPtix2YLZhSDYp9mE2YHYp9iq2YjYsdipPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJwYi0zIHRleHQtcmlnaHRcIj7Yp9mE2LnZhdmK2YQ8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInBiLTMgdGV4dC1jZW50ZXJcIj7Yp9mE2KrYp9ix2YrYrjwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWNlbnRlclwiPtmF2KjZhNi6INin2YTYttix2YrYqNipPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJwYi0zIHRleHQtY2VudGVyXCI+2KfZhNmF2KzZhdmI2Lkg2KfZhNmD2YTZijwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWNlbnRlclwiPtin2YTYrdin2YTYqTwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWxlZnRcIj7Yo9mI2KfZhdixPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwiZGl2aWRlLXkgZGl2aWRlLXppbmMtMTAwXCI+XG4gICAgICAgICAgICAgICAge2ludm9pY2VzPy5zbGljZSgwLCA1KS5tYXAoKGludjogYW55LCBpZHg6IG51bWJlcikgPT4gKFxuICAgICAgICAgICAgICAgICAgPHRyIGtleT17aW52LmlkIHx8IGlkeH0gY2xhc3NOYW1lPVwiaG92ZXI6YmctemluYy01MC81MCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyBmb250LW1vbm8gZm9udC1ib2xkIHRleHQtemluYy04MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAje2ludi5pbnZvaWNlTnVtYmVyIHx8IGludi5pZD8uc3Vic3RyaW5nKDAsIDYpfVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyBmb250LWJvbGQgdGV4dC16aW5jLTk1MFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtpbnYuY3VzdG9tZXJOYW1lIHx8IFwi2LnZhdmK2YQg2LrZitixINmF2K3Yr9ivXCJ9XG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICAgIDx0ZCBjbGFzc05hbWU9XCJweS0zIHRleHQtY2VudGVyIHRleHQtemluYy01MDAgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAgICAgICAge2ludi5pc3N1ZURhdGUgPyBuZXcgRGF0ZShpbnYuaXNzdWVEYXRlKS50b0xvY2FsZURhdGVTdHJpbmcoXCJhci1TQVwiKSA6IFwiLVwifVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWNlbnRlciB0ZXh0LXppbmMtNTAwIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHsoKGludi52YXRBbW91bnRIYWxhbGFzIHx8IDApIC8gMTAwKS50b0xvY2FsZVN0cmluZygpfSDYsS7Ys1xuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWNlbnRlciBmb250LWJsYWNrIHRleHQtemluYy05NTBcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7KChpbnYudG90YWxBbW91bnRIYWxhbGFzIHx8IDApIC8gMTAwKS50b0xvY2FsZVN0cmluZygpfSDYsS7Ys1xuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgICAgICAgIDxzcGFuXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcInB4LTIuNSBweS0xIHJvdW5kZWQtbGcgdGV4dC14cyBmb250LWJvbGQgYm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGludi5zdGF0dXMgPT09IFwicGFpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcImJnLWVtZXJhbGQtNTAgdGV4dC1lbWVyYWxkLTcwMCBib3JkZXItZW1lcmFsZC0xMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogaW52LnN0YXR1cyA9PT0gXCJzZW50XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1ibHVlLTUwIHRleHQtYmx1ZS03MDAgYm9yZGVyLWJsdWUtMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCJiZy16aW5jLTUwIHRleHQtemluYy02MDAgYm9yZGVyLXppbmMtMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge2ludi5zdGF0dXMgPT09IFwicGFpZFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgID8gXCLZhdiv2YHZiNi52KlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IGludi5zdGF0dXMgPT09IFwic2VudFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcItmF2LHYs9mE2KlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogXCLYutmK2LEg2YXYr9mB2YjYudipXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgdG89e2AvaW52b2ljZS8ke2ludi5pZCB8fCBpbnYuaW52b2ljZU51bWJlcn1gfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0PVwiX2JsYW5rXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cInRleHQtWzExcHhdIGZvbnQtYmxhY2sgdGV4dC1ibHVlLTYwMCBob3Zlcjp1bmRlcmxpbmVcIlxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgINi52LHYtiDZhNmE2LfYqNin2LnYqVxuICAgICAgICAgICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgIDwvdHI+XG4gICAgICAgICAgICAgICAgKSl9XG4gICAgICAgICAgICAgICAgeyghaW52b2ljZXMgfHwgaW52b2ljZXMubGVuZ3RoID09PSAwKSAmJiAoXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PVwiZW1wdHktaW52b2ljZXMtbGVkZ2VyXCI+XG4gICAgICAgICAgICAgICAgICAgIDx0ZFxuICAgICAgICAgICAgICAgICAgICAgIGNvbFNwYW49ezd9XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHktMTIgdGV4dC1jZW50ZXIgdGV4dC16aW5jLTQwMCB0ZXh0LXhzIGZvbnQtYm9sZCB1cHBlcmNhc2UgdHJhY2tpbmctd2lkZXN0XCJcbiAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgINmE2Kcg2KrZiNis2K8g2YHZiNin2KrZitixINi12KfYr9ix2Kkg2YXYs9is2YTYqSDZgdmKINin2YTZhti42KfZhVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA8L3Rib2R5PlxuICAgICAgICAgICAgPC90YWJsZT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfTtcblxuICBjb25zdCByZW5kZXJPcGVyYXRpb25zVmlldyA9ICgpID0+IHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTggYW5pbWF0ZS1mYWRlLWluXCIgZGlyPXtpc0FyID8gXCJydGxcIiA6IFwibHRyXCJ9PlxuICAgICAgICB7LyogTWV0cmljIFJvdyAtIE1vZGVybiBCZW50byBHcmlkICovfVxuICAgICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy00IGdhcC02XCI+XG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMlwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctMzIgaC0zMiBiZy1yb3NlLTUwMC81IGRhcms6Ymctcm9zZS01MDAvMTAgcm91bmRlZC1mdWxsIGJsdXItMnhsIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi02XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTMgcm91bmRlZC0yeGwgYmctcm9zZS01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxUcnVjayBjbGFzc05hbWU9XCJ3LTYgaC02IHRleHQtcm9zZS01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ibGFjayBweC0yLjUgcHktMSBiZy1yb3NlLTUwMC8xMCB0ZXh0LXJvc2UtNTAwIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1yb3NlLTUwMC8xMCBhbmltYXRlLXB1bHNlXCI+XG4gICAgICAgICAgICAgICAgICDZgtmK2K8g2KfZhNiq2KrYqNi5XG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC16aW5jLTUwMCBkYXJrOnRleHQtemluYy00MDAgdGV4dC1zbSBmb250LWJsYWNrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYpdis2YXYp9mE2Yog2KfZhNi02K3Zhtin2Kog2KfZhNmG2LTYt9ipIChBY3RpdmUgU2hpcG1lbnRzKVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LTN4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgZGFyazp0ZXh0LXppbmMtMTAwIHRyYWNraW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAge2FjdGl2ZVNoaXBtZW50cy5sZW5ndGh9INi02K3ZhtipINis2KfYsdmK2KlcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBkYXJrOnRleHQtemluYy01MDAgbXQtMiBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICDYtNit2YbYp9iqINiv2YjZhNmK2Kkg2YXZgdi52ZHZhCDZhNmH2Kcg2KrYqtio2Lkg2KfZhNit2KfZiNmK2KfYqiDZiNio2YjYp9mE2LUg2KfZhNi02K3ZhiDYudio2LEg2KfZhNmF2YbYp9mB2LBcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9tb3Rpb24uZGl2PlxuXG4gICAgICAgICAgPG1vdGlvbi5kaXZcbiAgICAgICAgICAgIHdoaWxlSG92ZXI9e3sgeTogLTYsIHNjYWxlOiAxLjAxIH19XG4gICAgICAgICAgICB0cmFuc2l0aW9uPXt7IHR5cGU6IFwic3ByaW5nXCIsIHN0aWZmbmVzczogMzAwLCBkYW1waW5nOiAyMCB9fVxuICAgICAgICAgICAgY2xhc3NOYW1lPVwicC02IHJvdW5kZWQtWzJyZW1dIGJvcmRlciB0cmFuc2l0aW9uLWFsbCBkdXJhdGlvbi0zMDAgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wganVzdGlmeS1iZXR3ZWVuIGJnLXdoaXRlLzgwIGRhcms6YmctemluYy0xMDAvNDAgYmFja2Ryb3AtYmx1ci1tZCBib3JkZXItemluYy0xNTAgZGFyazpib3JkZXItemluYy04NTAvNjAgc2hhZG93LXNtIGhvdmVyOnNoYWRvdy1sZyBkYXJrOmhvdmVyOnNoYWRvdy1ibGFjay8zMCBob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgZGFyazpob3Zlcjpib3JkZXItZW1lcmFsZC01MDAvMjAgbWQ6Y29sLXNwYW4tMVwiXG4gICAgICAgICAgPlxuICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGp1c3RpZnktYmV0d2VlbiBpdGVtcy1zdGFydCBtYi02XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwLTMgcm91bmRlZC0yeGwgYmctYmx1ZS01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgIDxBbmNob3IgY2xhc3NOYW1lPVwidy02IGgtNiB0ZXh0LWJsdWUtNTAwXCIgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYmxhY2sgcHgtMi41IHB5LTEgYmctYmx1ZS01MDAvMTAgdGV4dC1ibHVlLTUwMCByb3VuZGVkLXhsIGJvcmRlciBib3JkZXItYmx1ZS01MDAvMTBcIj5cbiAgICAgICAgICAgICAgICAgINis2KfZh9iyINmI2YXYt9in2KjZglxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtemluYy01MDAgZGFyazp0ZXh0LXppbmMtNDAwIHRleHQtc20gZm9udC1ibGFjayBtYi0xXCI+XG4gICAgICAgICAgICAgICAg2LPYrNmE2KfYqiDYp9mE2KfYs9iq2YrYsdin2K8g2KfZhNmF2YjYq9mC2KkgKEhpc3RvcmljYWwpXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtMnhsIGZvbnQtYmxhY2sgdGV4dC16aW5jLTkwMCBkYXJrOnRleHQtemluYy0xMDAgdHJhY2tpbmctdGlnaHRcIj5cbiAgICAgICAgICAgICAgICB7c2hpcG1lbnRzQ291bnR9INi02K3ZhtipINil2KzZhdin2YTZitipXG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtemluYy00MDAgZGFyazp0ZXh0LXppbmMtNTAwIG10LTIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAg2KjZitmGINin2YTZhdiu2YTYtSDZiNin2YTZhtin2YLZhCDZiNin2YTZhdiz2KrZiNiv2LnYp9iqINmB2Yog2KfZhNix2YrYp9i2XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cblxuICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICB3aGlsZUhvdmVyPXt7IHk6IC02LCBzY2FsZTogMS4wMSB9fVxuICAgICAgICAgICAgdHJhbnNpdGlvbj17eyB0eXBlOiBcInNwcmluZ1wiLCBzdGlmZm5lc3M6IDMwMCwgZGFtcGluZzogMjAgfX1cbiAgICAgICAgICAgIGNsYXNzTmFtZT1cInAtNiByb3VuZGVkLVsycmVtXSBib3JkZXIgdHJhbnNpdGlvbi1hbGwgZHVyYXRpb24tMzAwIHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlbiBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlbiBiZy13aGl0ZS84MCBkYXJrOmJnLXppbmMtMTAwLzQwIGJhY2tkcm9wLWJsdXItbWQgYm9yZGVyLXppbmMtMTUwIGRhcms6Ym9yZGVyLXppbmMtODUwLzYwIHNoYWRvdy1zbSBob3ZlcjpzaGFkb3ctbGcgZGFyazpob3ZlcjpzaGFkb3ctYmxhY2svMzAgaG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwIGRhcms6aG92ZXI6Ym9yZGVyLWVtZXJhbGQtNTAwLzIwIG1kOmNvbC1zcGFuLTFcIlxuICAgICAgICAgID5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWItNlwiPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwicC0zIHJvdW5kZWQtMnhsIGJnLWFtYmVyLTUwMC8xMFwiPlxuICAgICAgICAgICAgICAgICAgPFNoaWVsZEFsZXJ0IGNsYXNzTmFtZT1cInctNiBoLTYgdGV4dC1hbWJlci01MDBcIiAvPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ibGFjayBweC0yLjUgcHktMSBiZy1hbWJlci01MDAvMTAgdGV4dC1hbWJlci01MDAgcm91bmRlZC14bCBib3JkZXIgYm9yZGVyLWFtYmVyLTUwMC8xMFwiPlxuICAgICAgICAgICAgICAgICAg2YXYt9in2KjZgiDZhNmB2LPYrVxuICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtemluYy01MDAgZGFyazp0ZXh0LXppbmMtNDAwIHRleHQtc20gZm9udC1ibGFjayBtYi0xXCI+XG4gICAgICAgICAgICAgICAg2YXYrtmE2LXZitmGINis2YXYp9ix2YMg2YXYudiq2YXYr9mK2YYgKEJyb2tlcnMgbGlua2VkKVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgZGFyazp0ZXh0LXppbmMtMTAwIHRyYWNraW5nLXRpZ2h0XCI+XG4gICAgICAgICAgICAgICAgMyDZhdiu2YTYtdmK2YYg2YbYtNi32YrZhlxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LVsxMHB4XSB0ZXh0LXppbmMtNDAwIGRhcms6dGV4dC16aW5jLTUwMCBtdC0yIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgINmF2LHYqtio2LfZitmGINio2YHYs9itINin2YTYrNmF2LHZg9mK2Kkg2KjYp9mE2LPYudmI2K/ZitipXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIHsvKiBJbnRlbGxpZ2VuY2UgUmVjb21tZW5kZXIgKi99XG4gICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImJnLWdyYWRpZW50LXRvLXIgZnJvbS1wcmltYXJ5LzEwIHZpYS1wcmltYXJ5LzUgdG8tdHJhbnNwYXJlbnQgcm91bmRlZC1bMnJlbV0gYm9yZGVyIGJvcmRlci1wcmltYXJ5LzIwIHAtNiByZWxhdGl2ZSBvdmVyZmxvdy1oaWRkZW5cIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIC1sZWZ0LTIwIC10b3AtMjAgdy02NCBoLTY0IGJnLXByaW1hcnkvMjAgcm91bmRlZC1mdWxsIGJsdXItWzgwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmUgbWl4LWJsZW5kLW92ZXJsYXlcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgbWItNiByZWxhdGl2ZSB6LTEwXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiBiZy13aGl0ZSByb3VuZGVkLTJ4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaGFkb3ctbWQgYm9yZGVyIGJvcmRlci1wcmltYXJ5LzEwXCI+XG4gICAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwidy02IGgtNiB0ZXh0LXByaW1hcnlcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDMgY2xhc3NOYW1lPVwiZm9udC1ibGFjayB0ZXh0LXhsIHRleHQtemluYy05MDBcIj5cbiAgICAgICAgICAgICAgICDZhdiz2KfYudivINin2YTZhNmI2KzYs9iq2YrYqSDYp9mE2LDZg9mKIChPcGVyYXRpb25zIEFkdmlzb3J5KVxuICAgICAgICAgICAgICA8L2gzPlxuICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnlcIj5cbiAgICAgICAgICAgICAgICDYqtmI2LXZitin2Kog2K3ZitipINmE2KrZhdir2YrZhCDYs9mE2KfYs9mEINin2YTYqtmI2LHZitivINmI2KrYqtio2Lkg2K7Yt9mI2Lcg2KfZhNi02K3ZhiDYp9mE2KjYrdix2Yog2YjYp9mE2KzZiNmKXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJncmlkIGdyaWQtY29scy0xIG1kOmdyaWQtY29scy0zIGdhcC01IHJlbGF0aXZlIHotMTBcIj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYmctd2hpdGUgcC01IHJvdW5kZWQtM3hsIGJvcmRlciBib3JkZXItcHJpbWFyeS8xMCBmbGV4IGZsZXgtY29sIGp1c3RpZnktYmV0d2VlblwiPlxuICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cInRleHQtWzlweF0gZm9udC1ibGFjayBiZy1ibHVlLTUwIHRleHQtYmx1ZS02MDAgcHgtMiBweS0wLjUgcm91bmRlZC1mdWxsIGJvcmRlciBib3JkZXItYmx1ZS0xMDBcIj5cbiAgICAgICAgICAgICAgICAgINmB2LPYrSAoRmFzYWgpXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7Yqti32KfYqNmCINin2YTYqNmK2KfZhiDYp9mE2KzZhdix2YPZiiDZhNmB2LPYrTwvaDQ+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNTAwIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgICAgICAgICAgICAgICAg2KrYo9mD2K8g2YXZhiDYpdiv2LHYp9isINix2YLZhSDYp9mE2LPYrNmEINin2YTYqtis2KfYsdmKINmI2KfZhNix2YXYsiDYp9mE2KzZhdix2YPZiiDYp9mE2YXZiNit2K8g2YHZiiDYrdiz2KfYqNmDINmE2KrZgdin2K/ZiiDYrdiv2YjYqyDYqti52YTZitmCXG4gICAgICAgICAgICAgICAgICDYp9mE2YXYudin2YXZhNin2Kog2KfZhNmE2YjYrNiz2KrZitipINmB2Yog2KfZhNmF2YjYp9mG2KYg2KfZhNiz2LnZiNiv2YrYqSDYudmGINi32LHZitmCINix2KjYtyDZhdmG2LXYqSDZgdiz2K0uXG4gICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgICB0bz1cIi9hcHAvc3VwcGxpZXJzXCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWJsdWUtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPtiq2LnYr9mK2YQg2KfZhNiz2KzZhCDYp9mE2KzZhdix2YPZijwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTQgZ3JvdXAtaG92ZXI6dHJhbnNsYXRlLXgtMSBncm91cC1ob3ZlcjotdHJhbnNsYXRlLXktMSB0cmFuc2l0aW9uLXRyYW5zZm9ybVwiIC8+XG4gICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHAtNSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMTAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtYmxhY2sgYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNjAwIHB4LTIgcHktMC41IHJvdW5kZWQtZnVsbCBib3JkZXIgYm9yZGVyLWVtZXJhbGQtMTAwXCI+XG4gICAgICAgICAgICAgICAgICDYs9mE2KfYs9mEINin2YTYpdmF2K/Yp9ivXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7YrNiv2YjZhNipINi02K3Zhtin2Kog2KfZhNi12YrZhiDZiNin2YTYrtmE2YrYrDwvaDQ+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNTAwIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgICAgICAgICAgICAgICAg2KrZhSDYsdi12K8g2KrYo9iu2YrYsSDYqNmG2LPYqNipIDQg2KPZitin2YUg2YHZiiDZhdmI2KfZhtimINin2YTYtNit2YYg2KfZhNmF2LrYp9iv2LHYqSDZhdmGINis2YbZiNioINi02LHZgiDYotiz2YrYpy4g2YbZhti12K0g2KjYt9mE2KhcbiAgICAgICAgICAgICAgICAgINiy2YrYp9iv2Kkg2KfZhNmD2YXZitipINin2YTYp9it2KrZitin2LfZitipINmE2KrZgdin2K/ZiiDZhtmB2KfYryDYp9mE2YXYrtiy2YjZhiDZh9iw2Kcg2KfZhNi02YfYsS5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgIHRvPVwiL2FwcC9zdXBwbGllcnMvbmV3XCJcbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJtdC00IHRleHQteHMgZm9udC1ibGFjayB0ZXh0LWVtZXJhbGQtNjAwIGZsZXggaXRlbXMtY2VudGVyIGdhcC0xIGdyb3VwXCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxzcGFuPti32YTYqCDZiNil2LbYp9mB2Kkg2LTYrdmG2Kkg2KzYr9mK2K/YqTwvc3Bhbj5cbiAgICAgICAgICAgICAgICA8QXJyb3dVcFJpZ2h0IGNsYXNzTmFtZT1cInctNCBoLTQgZ3JvdXAtaG92ZXI6dHJhbnNsYXRlLXgtMSBncm91cC1ob3ZlcjotdHJhbnNsYXRlLXktMSB0cmFuc2l0aW9uLXRyYW5zZm9ybVwiIC8+XG4gICAgICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLXdoaXRlIHAtNSByb3VuZGVkLTN4bCBib3JkZXIgYm9yZGVyLXByaW1hcnkvMTAgZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWJldHdlZW5cIj5cbiAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICA8c3BhbiBjbGFzc05hbWU9XCJ0ZXh0LVs5cHhdIGZvbnQtYmxhY2sgYmctcHVycGxlLTUwIHRleHQtcHVycGxlLTYwMCBweC0yIHB5LTAuNSByb3VuZGVkLWZ1bGwgYm9yZGVyIGJvcmRlci1wdXJwbGUtMTAwXCI+XG4gICAgICAgICAgICAgICAgICDYpdiv2KfYsdipINin2YTZhdiz2KrZiNiv2LnYp9iqXG4gICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC16aW5jLTkwMCBtdC0yIG1iLTFcIj7Yqtiz2YjZitipINiq2YjYsdmK2K8g2KfZhNio2LbYp9im2Lkg2KfZhNmF2LPYqtmE2YXYqTwvaDQ+XG4gICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNTAwIGxlYWRpbmctcmVsYXhlZFwiPlxuICAgICAgICAgICAgICAgICAg2KjZhdis2LHYryDZiNi12YjZhCDYp9mE2LTYrdmG2KnYjCDZitiz2YXYrSDZhNmDINmF2K/Yp9ix2Kwg2KjYpdmG2LTYp9ihINmF2LfYp9io2YLYqSDZgdmI2KfYqtmK2LEg2YXYtNiq2LHZg9ipINmI2KrYrdmI2YrZhCDYp9mE2YHZiNin2KrZitixXG4gICAgICAgICAgICAgICAgICDYp9mE2KPYrNmG2KjZitipINio2LnZhdmE2KfYqiDZhdiq2LnYr9iv2KkgKFVTRCwgUk1CLCBTQVIpINio2LDZg9in2KEg2YjYp9mF2KrYq9in2YQg2LbYsdmK2KjZii5cbiAgICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgIHRvPVwiL2FwcC9zdXBwbGllcnNcIlxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cIm10LTQgdGV4dC14cyBmb250LWJsYWNrIHRleHQtcHVycGxlLTYwMCBmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMSBncm91cFwiXG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8c3Bhbj7Yp9mE2LDZh9in2Kgg2YTYpdiv2KfYsdipINin2YTZhdmI2LHYr9mK2YY8L3NwYW4+XG4gICAgICAgICAgICAgICAgPEFycm93VXBSaWdodCBjbGFzc05hbWU9XCJ3LTQgaC00IGdyb3VwLWhvdmVyOnRyYW5zbGF0ZS14LTEgZ3JvdXAtaG92ZXI6LXRyYW5zbGF0ZS15LTEgdHJhbnNpdGlvbi10cmFuc2Zvcm1cIiAvPlxuICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIHsvKiBMaXZlIFRyYW5zaXQgVHJhY2tlciBWaWV3IENvbnRhaW5lciAqL31cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gcC02XCI+XG4gICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYmxhY2sgdGV4dC1sZyB0ZXh0LXppbmMtOTAwIG1iLTFcIj5cbiAgICAgICAgICAgINiu2Lcg2LPZitixINin2YTYtNit2YbYp9iqINin2YTYr9mI2YTZiiDYp9mE2YbYtNi3IChUcmFuc2l0IE1hcHMpXG4gICAgICAgICAgPC9oMz5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy01MDAgZm9udC1tZWRpdW0gbWItNlwiPlxuICAgICAgICAgICAg2YXYsdin2YLYqCDYp9mE2YXYs9in2LEg2KfZhNmF2KjYp9i02LEg2YTZhNit2KfZiNmK2KfYqiDZhdmGINmF2YrZhtin2KEg2KfZhNiq2LXYr9mK2LEg2YTYqNmE2K8g2KfZhNmF2YbYtNijINmI2K3YqtmJINin2YTYqtiz2YTZitmFINio2KfZhNmF2LPYqtmI2K/Yudin2KpcbiAgICAgICAgICA8L3A+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInJlbGF0aXZlIHAtNiBwdC0xMiBtZDpwLTEyIGJnLXppbmMtNTAgcm91bmRlZC0yeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBvdmVyZmxvdy1oaWRkZW4gZmxleCBmbGV4LWNvbCBtZDpmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC04XCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgb3BhY2l0eS01IHBvaW50ZXItZXZlbnRzLW5vbmUgYmctW3JhZGlhbC1ncmFkaWVudCgjMDAwXzFweCx0cmFuc3BhcmVudF8xcHgpXSBbYmFja2dyb3VuZC1zaXplOjE2cHhfMTZweF1cIiAvPlxuXG4gICAgICAgICAgICB7LyogVmlzdWFsIFN0ZXAgMSAoT3JpZ2luIFBvcnQpICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciB0ZXh0LWNlbnRlciByZWxhdGl2ZSB6LTEwIGdyb3VwXCI+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xNCBoLTE0IGJnLXdoaXRlIHNoYWRvdy1tZCBib3JkZXIgYm9yZGVyLXppbmMtMjAwIHJvdW5kZWQtZnVsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciB0ZXh0LXppbmMtNTAwIGdyb3VwLWhvdmVyOmJvcmRlci1wcmltYXJ5IGdyb3VwLWhvdmVyOnRleHQtcHJpbWFyeSB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgIDxBbmNob3IgY2xhc3NOYW1lPVwidy02IGgtNlwiIC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwiZm9udC1ib2xkIHRleHQtc20gdGV4dC16aW5jLTgwMCBtdC0zXCI+2YXZitmG2KfYoSDYp9mE2YXZhti02KMg2KfZhNiv2YjZhNmKPC9oND5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBtdC0xIHctMzIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAg2KrYrdmF2YrZhCDYp9mE2LTYrdmG2Kkg2YjYpdiq2YXYp9mFINin2YTYrNmF2KfYsdmDINio2KfZhNiu2KfYsdisXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogTGluZSAxICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoaWRkZW4gbWQ6YmxvY2sgZmxleC0xIGgtMSBiZy1ncmFkaWVudC10by1yIGZyb20tZW1lcmFsZC01MDAgdG8tYmx1ZS01MDAgcmVsYXRpdmUgei0xMFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0xLzIgbGVmdC0xLzIgLXRyYW5zbGF0ZS14LTEvMiAtdHJhbnNsYXRlLXktMS8yIHctMyBoLTMgYmctd2hpdGUgYm9yZGVyLTIgYm9yZGVyLWVtZXJhbGQtNTAwIHJvdW5kZWQtZnVsbCBhbmltYXRlLXBpbmdcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBWaXN1YWwgU3RlcCAyIChTZWEgT2NlYW4gVHJhbnNpdCkgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIHRleHQtY2VudGVyIHJlbGF0aXZlIHotMTAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTE0IGgtMTQgcm91bmRlZC1mdWxsIGJnLWJsdWUtNTAwIHNoYWRvdy1sZyBzaGFkb3ctYmx1ZS01MDAvMjAgdGV4dC13aGl0ZSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlclwiPlxuICAgICAgICAgICAgICAgIDxUcnVjayBjbGFzc05hbWU9XCJ3LTYgaC02IGFuaW1hdGUtcHVsc2VcIiAvPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPGg0IGNsYXNzTmFtZT1cImZvbnQtYm9sZCB0ZXh0LXNtIHRleHQtemluYy04MDAgbXQtM1wiPti52LHYtiDYp9mE2KjYrdixIChJbiBPY2VhbnMpPC9oND5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBtdC0xIHctMzIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAg2KjZitmGINin2YTZhdit2YrYt9in2Kog2YjYrti32YjYtyDYp9mE2YXZhNin2K3YqSDYp9mE2KjYrdix2YpcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgIHsvKiBMaW5lIDIgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImhpZGRlbiBtZDpibG9jayBmbGV4LTEgaC0xIGJnLWdyYWRpZW50LXRvLXIgZnJvbS1ibHVlLTUwMCB0by16aW5jLTMwMCByZWxhdGl2ZSB6LTEwXCIgLz5cblxuICAgICAgICAgICAgey8qIFZpc3VhbCBTdGVwIDMgKEtTQSBDdXN0b21zIENsZWFyYW5jZSkgKi99XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggZmxleC1jb2wgaXRlbXMtY2VudGVyIHRleHQtY2VudGVyIHJlbGF0aXZlIHotMTAgZ3JvdXBcIj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTE0IGgtMTQgYmctd2hpdGUgc2hhZG93LW1kIGJvcmRlciBib3JkZXItemluYy0yMDAgcm91bmRlZC1mdWxsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtemluYy01MDAgZ3JvdXAtaG92ZXI6Ym9yZGVyLXByaW1hcnkgZ3JvdXAtaG92ZXI6dGV4dC1wcmltYXJ5IHRyYW5zaXRpb24tY29sb3JzXCI+XG4gICAgICAgICAgICAgICAgPEJ1aWxkaW5nMiBjbGFzc05hbWU9XCJ3LTYgaC02XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbSB0ZXh0LXppbmMtODAwIG10LTNcIj7Yp9mE2KrYrtmE2YrYtSDYp9mE2KzZhdix2YPZiiDYp9mE2LPYudmI2K/ZijwvaDQ+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtWzEwcHhdIHRleHQtemluYy00MDAgbXQtMSB3LTMyIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgINmF2YrZhtin2KEg2KfZhNmI2LXZiNmEINio2KzYr9ipIC8g2KfZhNiv2YXYp9mFICjZgdiz2K0pXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICB7LyogTGluZSAzICovfVxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJoaWRkZW4gbWQ6YmxvY2sgZmxleC0xIGgtMSBiZy16aW5jLTMwMCByZWxhdGl2ZSB6LTEwXCIgLz5cblxuICAgICAgICAgICAgey8qIFZpc3VhbCBTdGVwIDQgKERlbGl2ZXIgdG8gV2FyZWhvdXNlKSAqL31cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgdGV4dC1jZW50ZXIgcmVsYXRpdmUgei0xMCBncm91cFwiPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTQgaC0xNCBiZy13aGl0ZSBzaGFkb3ctbWQgYm9yZGVyIGJvcmRlci16aW5jLTIwMCByb3VuZGVkLWZ1bGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgdGV4dC16aW5jLTUwMCBncm91cC1ob3Zlcjpib3JkZXItcHJpbWFyeSBncm91cC1ob3Zlcjp0ZXh0LXByaW1hcnkgdHJhbnNpdGlvbi1jb2xvcnNcIj5cbiAgICAgICAgICAgICAgICA8UGFja2FnZSBjbGFzc05hbWU9XCJ3LTYgaC02XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxoNCBjbGFzc05hbWU9XCJmb250LWJvbGQgdGV4dC1zbSB0ZXh0LXppbmMtODAwIG10LTNcIj7Yp9mE2YXYs9iq2YjYr9i52KfYqiDYp9mE2YXYsdmD2LLZitipIChTQVIpPC9oND5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1bMTBweF0gdGV4dC16aW5jLTQwMCBtdC0xIHctMzIgZm9udC1ib2xkXCI+XG4gICAgICAgICAgICAgICAg2KfZhNin2LPYqtmE2KfZhSDZiNin2YTZhdi32KfYqNmC2Kkg2YjYrdiz2KfYqCDYp9mE2KrZg9mE2YHYqVxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9zZWN0aW9uPlxuXG4gICAgICAgIHsvKiBTaGlwbWVudHMgbGlzdCAqL31cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiYmctd2hpdGUgcm91bmRlZC0zeGwgYm9yZGVyIGJvcmRlci16aW5jLTEwMCBzaGFkb3ctc20gcC02IG92ZXJmbG93LWhpZGRlblwiPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIG1iLTZcIj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJmb250LWJsYWNrIHRleHQtbGcgdGV4dC16aW5jLTkwMFwiPlxuICAgICAgICAgICAgICAgINiz2KzZhCDYp9mE2LTYrdmG2KfYqiDZiNiz2YTYp9iz2YQg2KfZhNiq2YjYsdmK2K8gKNin2YTZhdiq2LXZhClcbiAgICAgICAgICAgICAgPC9oMz5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyB0ZXh0LXppbmMtNTAwIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICAgICAg2YLYp9im2YXYqSDYp9mE2LTYrdmG2KfYqiDZgtmK2K8g2KfZhNiq2LTYutmK2YQg2KfZhNmF2KzZhNmI2KjYqSDZhdmGINmC2KfYudiv2Kkg2KfZhNio2YrYp9mG2KfYqiDZhdio2KfYtNix2KlcbiAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8TGluayB0bz1cIi9hcHAvc3VwcGxpZXJzXCIgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJvbGQgdGV4dC1wcmltYXJ5IGhvdmVyOnVuZGVybGluZVwiPlxuICAgICAgICAgICAgICDZhdix2KfYrNi52Kkg2KfZhNmF2YjYsdiv2YrZhiDZiNin2YTYtNit2YbYp9iqXG4gICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm92ZXJmbG93LXgtYXV0b1wiPlxuICAgICAgICAgICAgPHRhYmxlIGNsYXNzTmFtZT1cInctZnVsbCB0ZXh0LXJpZ2h0IHRleHQtc21cIj5cbiAgICAgICAgICAgICAgPHRoZWFkPlxuICAgICAgICAgICAgICAgIDx0ciBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNDAwIGZvbnQtYm9sZCBib3JkZXItYiBib3JkZXItemluYy0xMDAgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVyIHRleHQtWzExcHhdXCI+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LXJpZ2h0XCI+2LHZgtmFINin2YTYtNit2YbYqTwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LXJpZ2h0XCI+2YXZitmG2KfYoSDYp9mE2YXZhti02KM8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInBiLTMgdGV4dC1jZW50ZXJcIj7ZhdmK2YbYp9ihINin2YTZiNi12YjZhCAo2KfZhNmF2YXZhNmD2KkpPC90aD5cbiAgICAgICAgICAgICAgICAgIDx0aCBjbGFzc05hbWU9XCJwYi0zIHRleHQtY2VudGVyXCI+2KfZhNmG2KfZgtmEINin2YTYr9mI2YTZijwvdGg+XG4gICAgICAgICAgICAgICAgICA8dGggY2xhc3NOYW1lPVwicGItMyB0ZXh0LWNlbnRlclwiPtiq2KfYsdmK2K4g2KfZhNiq2YjYtdmK2YQg2KfZhNmF2KrZiNmC2Lk8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInBiLTMgdGV4dC1jZW50ZXJcIj7Yp9mE2K3Yp9mE2Kk8L3RoPlxuICAgICAgICAgICAgICAgICAgPHRoIGNsYXNzTmFtZT1cInBiLTMgdGV4dC1sZWZ0XCI+2KrZgdin2LXZitmEPC90aD5cbiAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICA8L3RoZWFkPlxuICAgICAgICAgICAgICA8dGJvZHkgY2xhc3NOYW1lPVwiZGl2aWRlLXkgZGl2aWRlLXppbmMtMTAwXCI+XG4gICAgICAgICAgICAgICAge2FjdGl2ZVNoaXBtZW50cz8uc2xpY2UoMCwgNSkubWFwKChzaGlwOiBhbnksIGlkeDogbnVtYmVyKSA9PiAoXG4gICAgICAgICAgICAgICAgICA8dHIga2V5PXtzaGlwLmlkIHx8IGlkeH0gY2xhc3NOYW1lPVwiaG92ZXI6YmctemluYy01MC81MCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyBmb250LW1vbm8gZm9udC1ib2xkIHRleHQtemluYy04MDBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAje3NoaXAuaWQ/LnN1YnN0cmluZygwLCA2KS50b1VwcGVyQ2FzZSgpfVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyBmb250LWJvbGQgdGV4dC16aW5jLTk1MFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzaGlwLm9yaWdpblBvcnQgfHwgXCLZhdmK2YbYp9ihINi62YrYsSDZhdit2K/Yr1wifVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWNlbnRlciB0ZXh0LXppbmMtNzAwIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzaGlwLmRlc3RpbmF0aW9uUG9ydCB8fCBcItmF2YrZhtin2KEg2KfZhNmF2YXZhNmD2KlcIn1cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB5LTMgdGV4dC1jZW50ZXIgdGV4dC16aW5jLTUwMCBmb250LWJvbGRcIj5cbiAgICAgICAgICAgICAgICAgICAgICB7c2hpcC5jYXJyaWVyIHx8IFwi2YXZitix2LPZgyAvINmG2KfZgtmEINmE2YjYrNiz2KrZilwifVxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWNlbnRlciB0ZXh0LXppbmMtNTAwIGZvbnQtYm9sZFwiPlxuICAgICAgICAgICAgICAgICAgICAgIHtzaGlwLmV4cGVjdGVkRGVsaXZlcnlcbiAgICAgICAgICAgICAgICAgICAgICAgID8gbmV3IERhdGUoc2hpcC5leHBlY3RlZERlbGl2ZXJ5KS50b0xvY2FsZURhdGVTdHJpbmcoXCJhci1TQVwiKVxuICAgICAgICAgICAgICAgICAgICAgICAgOiBcIi1cIn1cbiAgICAgICAgICAgICAgICAgICAgPC90ZD5cbiAgICAgICAgICAgICAgICAgICAgPHRkIGNsYXNzTmFtZT1cInB5LTMgdGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8c3BhblxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJweC0yLjUgcHktMSByb3VuZGVkLWxnIHRleHQteHMgZm9udC1ib2xkIGJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBzaGlwLnN0YXR1cyA9PT0gXCJpbl90cmFuc2l0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IFwiYmctYmx1ZS01MCB0ZXh0LWJsdWUtNzAwIGJvcmRlci1ibHVlLTEwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBzaGlwLnN0YXR1cyA9PT0gXCJjdXN0b21zXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1hbWJlci01MCB0ZXh0LWFtYmVyLTcwMCBib3JkZXItYW1iZXItMTAwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDogc2hpcC5zdGF0dXMgPT09IFwiZGVsaXZlcmVkXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcImJnLWVtZXJhbGQtNTAgdGV4dC1lbWVyYWxkLTcwMCBib3JkZXItZW1lcmFsZC0xMDBcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwiYmctemluYy01MCB0ZXh0LXppbmMtNjAwIGJvcmRlci16aW5jLTEwMFwiXG4gICAgICAgICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaGlwLnN0YXR1cyA9PT0gXCJpbl90cmFuc2l0XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgPyBcItmB2Yog2LnYsdi2INin2YTYqNit2LFcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICA6IHNoaXAuc3RhdHVzID09PSBcImN1c3RvbXNcIlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCLYrNmF2KfYsdmDXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IFwi2KrZhSDYp9mE2KfYs9iq2YTYp9mFXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgICA8dGQgY2xhc3NOYW1lPVwicHktMyB0ZXh0LWxlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgICAgICAgICAgdG89e2AvYXBwL3N1cHBsaWVyc2B9XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ0ZXh0LVsxMXB4XSBmb250LWJsYWNrIHRleHQtYmx1ZS02MDAgaG92ZXI6dW5kZXJsaW5lXCJcbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICDYudix2LYg2YjYqtit2K/ZitirXG4gICAgICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgICAgICA8L3RkPlxuICAgICAgICAgICAgICAgICAgPC90cj5cbiAgICAgICAgICAgICAgICApKX1cbiAgICAgICAgICAgICAgICB7KCFhY3RpdmVTaGlwbWVudHMgfHwgYWN0aXZlU2hpcG1lbnRzLmxlbmd0aCA9PT0gMCkgJiYgKFxuICAgICAgICAgICAgICAgICAgPHRyIGtleT1cImVtcHR5LXNoaXBtZW50cy1vcHNcIj5cbiAgICAgICAgICAgICAgICAgICAgPHRkXG4gICAgICAgICAgICAgICAgICAgICAgY29sU3Bhbj17N31cbiAgICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweS0xMiB0ZXh0LWNlbnRlciB0ZXh0LXppbmMtNDAwIHRleHQteHMgZm9udC1ib2xkIHVwcGVyY2FzZSB0cmFja2luZy13aWRlc3RcIlxuICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAg2YTYpyDYqtmI2KzYryDYtNit2YbYp9iqINmE2YjYrNiz2KrZitipINmG2LTYt9ipINis2KfYsdmK2Kkg2K3Yp9mE2YrYp9mLXG4gICAgICAgICAgICAgICAgICAgIDwvdGQ+XG4gICAgICAgICAgICAgICAgICA8L3RyPlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgIDwvdGJvZHk+XG4gICAgICAgICAgICA8L3RhYmxlPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9O1xuXG4gIHJldHVybiAoXG4gICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTggbWF4LXctN3hsIG14LWF1dG8gcGItMjBcIj5cbiAgICAgIDxFbWVyZ2VuY3lMb2NrZG93bkluZGljYXRvciBuYXZpZ2F0ZVRvUGF5cm9sbD17KCkgPT4gbmF2aWdhdGUoXCIvYXBwL3BheXJvbGxcIil9IC8+XG5cbiAgICAgIHt3YVN0YXR1cyA9PT0gXCJkaXNjb25uZWN0ZWRcIiAmJiAoXG4gICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgaW5pdGlhbD17eyBvcGFjaXR5OiAwLCB5OiAtMjAgfX1cbiAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEsIHk6IDAgfX1cbiAgICAgICAgICBjbGFzc05hbWU9XCJiZy1yb3NlLTUwIGJvcmRlciBib3JkZXItcm9zZS0yMDAgcC02IHJvdW5kZWQtM3hsIHNoYWRvdy1zbSBmbGV4IGZsZXgtY29sIG1kOmZsZXgtcm93IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWJldHdlZW4gZ2FwLTYgcmVsYXRpdmUgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICBkaXI9e2lzQXIgPyBcInJ0bFwiIDogXCJsdHJcIn1cbiAgICAgICAgPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYWJzb2x1dGUgdG9wLTAgcmlnaHQtMCB3LTMyIGgtMzIgYmctcm9zZS01MDAvMTAgcm91bmRlZC1mdWxsIGJsdXItWzQwcHhdIHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTQgcmVsYXRpdmUgei0xMCB3LWZ1bGwgbWQ6dy1hdXRvXCI+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTIgaC0xMiBiZy1yb3NlLTEwMCB0ZXh0LXJvc2UtNjAwIHJvdW5kZWQtMnhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHNocmluay0wIGJvcmRlciBib3JkZXItcm9zZS0yMDBcIj5cbiAgICAgICAgICAgICAgPFNoaWVsZEFsZXJ0IGNsYXNzTmFtZT1cInctNiBoLTYgYW5pbWF0ZS1wdWxzZVwiIC8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXY+XG4gICAgICAgICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWxnIGZvbnQtYmxhY2sgdGV4dC1yb3NlLTkwMCBtYi0xXCI+XG4gICAgICAgICAgICAgICAg2KrZhtio2YrZhyDYudin2KzZhDog2KjZiNin2KjYqSDZiNin2KrYs9in2KggKE9wZW5XQSkg2LrZitixINmF2KrYtdmE2KkhXG4gICAgICAgICAgICAgIDwvaDM+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtcm9zZS03MDBcIj5cbiAgICAgICAgICAgICAgICDYrNin2LHZiiDYqtmI2YLZgSDYo9iq2YXYqtipINin2YTYsdiv2YjYryDZiNit2YXZhNin2Kog2KfZhNix2LPYp9im2YQg2YjYp9mE2YXYstin2YXZhtipINin2YTYqtmE2YLYp9im2YrYqSDZhdi5IENSTSDYqNiz2KjYqCDYp9mG2YLYt9in2Lkg2KfZhNis2YTYs9ipLlxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZsZXggaXRlbXMtY2VudGVyIGdhcC0yIHJlbGF0aXZlIHotMTAgdy1mdWxsIG1kOnctYXV0byBzaHJpbmstMFwiPlxuICAgICAgICAgICAgPExpbmtcbiAgICAgICAgICAgICAgdG89XCIvYXBwL3NldHRpbmdzXCJcbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIG1kOnctYXV0byBweC01IHB5LTIuNSBiZy1yb3NlLTYwMCBob3ZlcjpiZy1yb3NlLTcwMCB0ZXh0LXdoaXRlIGZvbnQtYm9sZCB0ZXh0LXNtIHJvdW5kZWQteGwgdHJhbnNpdGlvbi1jb2xvcnMgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgc2hhZG93LWxnIHNoYWRvdy1yb3NlLTYwMC8xMFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxaYXAgY2xhc3NOYW1lPVwidy00IGgtNFwiIC8+XG4gICAgICAgICAgICAgINil2LnYp9iv2Kkg2KfZhNin2KrYtdin2YQg2YjZhdiz2K0g2KfZhNmAIFFSXG4gICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICl9XG5cbiAgICAgIHtbLi4uc3lzdGVtQWxlcnRzLCAuLi4oZGFzaGJvYXJkU3RhdHM/LmV4cGlyaW5nQ29udHJhY3RzQWxlcnRzIHx8IFtdKV0uZmlsdGVyKFxuICAgICAgICAoYSkgPT4gIWRpc21pc3NlZExvY2FsQWxlcnRzLmluY2x1ZGVzKGEuaWQpXG4gICAgICApLmxlbmd0aCA+IDAgJiYgKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktNFwiPlxuICAgICAgICAgIHtbLi4uc3lzdGVtQWxlcnRzLCAuLi4oZGFzaGJvYXJkU3RhdHM/LmV4cGlyaW5nQ29udHJhY3RzQWxlcnRzIHx8IFtdKV1cbiAgICAgICAgICAgIC5maWx0ZXIoKGEpID0+ICFkaXNtaXNzZWRMb2NhbEFsZXJ0cy5pbmNsdWRlcyhhLmlkKSlcbiAgICAgICAgICAgIC5tYXAoKGFsZXJ0KSA9PiAoXG4gICAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgICAga2V5PXthbGVydC5pZH1cbiAgICAgICAgICAgICAgICBpbml0aWFsPXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImJnLWFtYmVyLTUwIGJvcmRlciBib3JkZXItYW1iZXItMjAwIHAtNiByb3VuZGVkLTN4bCBzaGFkb3ctc20gZmxleCBmbGV4LWNvbCBtZDpmbGV4LXJvdyBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIGdhcC02IHJlbGF0aXZlIG92ZXJmbG93LWhpZGRlblwiXG4gICAgICAgICAgICAgICAgZGlyPXtpc0FyID8gXCJydGxcIiA6IFwibHRyXCJ9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImFic29sdXRlIHRvcC0wIHJpZ2h0LTAgdy0zMiBoLTMyIGJnLWFtYmVyLTUwMC8xMCByb3VuZGVkLWZ1bGwgYmx1ci1bNDBweF0gcG9pbnRlci1ldmVudHMtbm9uZVwiIC8+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNCByZWxhdGl2ZSB6LTEwIHctZnVsbCBtZDp3LWF1dG9cIj5cbiAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidy0xMiBoLTEyIGJnLWFtYmVyLTEwMCB0ZXh0LWFtYmVyLTYwMCByb3VuZGVkLTJ4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBzaHJpbmstMCBib3JkZXIgYm9yZGVyLWFtYmVyLTIwMFwiPlxuICAgICAgICAgICAgICAgICAgICA8QWxlcnRDaXJjbGUgY2xhc3NOYW1lPVwidy02IGgtNiBhbmltYXRlLXB1bHNlXCIgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtbGcgZm9udC1ibGFjayB0ZXh0LWFtYmVyLTkwMCBtYi0xXCI+e2FsZXJ0LnRpdGxlfTwvaDM+XG4gICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1ib2xkIHRleHQtYW1iZXItNzAwXCI+e2FsZXJ0Lm1lc3NhZ2V9PC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtMiByZWxhdGl2ZSB6LTEwIHctZnVsbCBtZDp3LWF1dG8gc2hyaW5rLTBcIj5cbiAgICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgICAgb25DbGljaz17YXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgIGlmICghYWxlcnQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdXBkYXRlRG9jKGRvYyhkYiwgXCJzeXN0ZW1fYWxlcnRzXCIsIGFsZXJ0LmlkKSwgeyBpc1JlYWQ6IHRydWUgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXREaXNtaXNzZWRMb2NhbEFsZXJ0cygocHJldikgPT4gWy4uLnByZXYsIGFsZXJ0LmlkXSk7XG4gICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9fVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgbWQ6dy1hdXRvIHB4LTUgcHktMi41IGJnLXdoaXRlIHRleHQtYW1iZXItNjAwIGZvbnQtYm9sZCB0ZXh0LXNtIHJvdW5kZWQteGwgYm9yZGVyIGJvcmRlci1hbWJlci0yMDAgaG92ZXI6YmctYW1iZXItMTAwIHRyYW5zaXRpb24tY29sb3JzIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAgPENoZWNrIGNsYXNzTmFtZT1cInctNCBoLTRcIiAvPlxuICAgICAgICAgICAgICAgICAgICDYqti52YTZitmFINmD2YXZgtix2YjYoVxuICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgICAgICAgICB0bz17YWxlcnQuYWN0aW9uUGF0aCB8fCBcIi9hcHAvcGF5cm9sbFwifVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgbWQ6dy1hdXRvIHRleHQtY2VudGVyIGJnLWFtYmVyLTYwMCB0ZXh0LXdoaXRlIHB4LTUgcHktMi41IHJvdW5kZWQteGwgdGV4dC1zbSBmb250LWJvbGQgc2hhZG93LW1kIGhvdmVyOmJnLWFtYmVyLTcwMCB0cmFuc2l0aW9uXCJcbiAgICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgICAge2FsZXJ0LmlzTG9jYWwgPyBcItmF2LHYp9is2LnYqSDYp9mE2YXZiNi42YHZitmGXCIgOiBcItin2YbYqtmC2KfZhFwifVxuICAgICAgICAgICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgICApKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICApfVxuXG4gICAgICB7ZGFzaGJvYXJkU3RhdHM/LmlzTG9ja2Rvd24gJiYgKFxuICAgICAgICA8bW90aW9uLmRpdlxuICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgeTogLTIwIH19XG4gICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCB5OiAwIH19XG4gICAgICAgICAgY2xhc3NOYW1lPVwiYmctcm9zZS02MDAgdGV4dC13aGl0ZSBwLTYgcm91bmRlZC0zeGwgc2hhZG93LXhsIGZsZXggZmxleC1jb2wgbWQ6ZmxleC1yb3cgaXRlbXMtY2VudGVyIGp1c3RpZnktYmV0d2VlbiBnYXAtNiBib3JkZXItNCBib3JkZXItcm9zZS0yMDBcIlxuICAgICAgICA+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNFwiPlxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJiZy13aGl0ZS8yMCBwLTQgcm91bmRlZC1mdWxsIGFuaW1hdGUtcHVsc2VcIj5cbiAgICAgICAgICAgICAgPFNoaWVsZENoZWNrIGNsYXNzTmFtZT1cInctOCBoLThcIiAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC14bCBmb250LWJsYWNrIG1iLTFcIj5cbiAgICAgICAgICAgICAgICDYrdin2YTYqSDYt9mI2KfYsdimOiDYpdmK2YLYp9mBINin2YTYrtiv2YXYp9iqIChFbWVyZ2VuY3kgTG9ja2Rvd24pXG4gICAgICAgICAgICAgIDwvaDI+XG4gICAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cInRleHQtc20gZm9udC1tZWRpdW0gdGV4dC1yb3NlLTEwMFwiPlxuICAgICAgICAgICAgICAgINiq2YUg2KrYrNin2YjYsiDYp9mE2YXYr9ipINin2YTZhti42KfZhdmK2KkgKDE1INmK2YjZhSkg2YTYp9i52KrZhdin2K8g2YjYsdmB2Lkg2YXYs9mK2LEg2KfZhNix2YjYp9iq2Kgg2YTYtNmH2LF7XCIgXCJ9XG4gICAgICAgICAgICAgICAge2Rhc2hib2FyZFN0YXRzLmxvY2tkb3duUGVyaW9kfS4g2KjYudi2INin2YTYrtiv2YXYp9iqINiz2KrYuNmEINmF2YLZitiv2Kkg2KXZhNmJINit2YrZhiDYp9mE2YXYudin2YTYrNipINio2YXZhNmBIFdQUyDYo9mIXG4gICAgICAgICAgICAgICAg2YXYr9ivLlxuICAgICAgICAgICAgICA8L3A+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8TGlua1xuICAgICAgICAgICAgdG89XCIvYXBwL3BheXJvbGxcIlxuICAgICAgICAgICAgY2xhc3NOYW1lPVwic2hyaW5rLTAgYmctd2hpdGUgdGV4dC1yb3NlLTYwMCBweC02IHB5LTMgcm91bmRlZC14bCBmb250LWJvbGQgdGV4dC1zbSBzaGFkb3ctbWQgaG92ZXI6c2NhbGUtMTA1IHRyYW5zaXRpb24tdHJhbnNmb3JtIGZsZXggaXRlbXMtY2VudGVyIGdhcC0yXCJcbiAgICAgICAgICA+XG4gICAgICAgICAgICDYp9mE2KfZhtiq2YLYp9mEINmE2YTYsdmI2KfYqtioINmE2YTZhdi52KfZhNis2KlcbiAgICAgICAgICA8L0xpbms+XG4gICAgICAgIDwvbW90aW9uLmRpdj5cbiAgICAgICl9XG5cbiAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwiZmxleCBmbGV4LWNvbCBtZDpmbGV4LXJvdyBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtc3RhcnQgbWQ6aXRlbXMtZW5kIGdhcC00XCI+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cInRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LXppbmMtOTAwIHRyYWNraW5nLXRpZ2h0XCI+2YbYuNix2Kkg2LnYp9mF2Kk8L2gxPlxuICAgICAgICAgICAge2lzRWRpdGluZyAmJiAoXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImJnLWFtYmVyLTEwMCB0ZXh0LWFtYmVyLTcwMCBweC0zIHB5LTEgcm91bmRlZC1mdWxsIHRleHQtWzEwcHhdIGZvbnQtYmxhY2sgdXBwZXJjYXNlIHRyYWNraW5nLXdpZGVzdCBsZWFkaW5nLW5vbmUgYm9yZGVyIGJvcmRlci1hbWJlci0yMDBcIj5cbiAgICAgICAgICAgICAgICDZiNi22Lkg2KfZhNiq2K7YtdmK2LVcbiAgICAgICAgICAgICAgPC9zcGFuPlxuICAgICAgICAgICAgKX1cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXppbmMtNTAwIG10LTEgbWItNFwiPtmF2LHYrdio2KfZiyDYqNmDINmF2KzYr9iv2KfZi9iMINil2YTZitmDINij2K3Yr9irINmG2LTYp9i32KfYqiDYudmF2YTZgyDYp9mE2YrZiNmFLjwvcD5cblxuICAgICAgICAgIHshaXNFZGl0aW5nICYmIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBiZy16aW5jLTEwMCBwLTEgcm91bmRlZC0yeGwgZmxleC13cmFwIGdhcC0xIG1kOnctZml0XCI+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVWaWV3KFwiY2VvXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICBcInB4LTQgcHktMiByb3VuZGVkLXhsIHRleHQtc20gZm9udC1ib2xkIHRyYW5zaXRpb24tYWxsIHdoaXRlc3BhY2Utbm93cmFwXCIsXG4gICAgICAgICAgICAgICAgICBhY3RpdmVWaWV3ID09PSBcImNlb1wiXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy13aGl0ZSB0ZXh0LXppbmMtOTAwIHNoYWRvdy1zbVwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXppbmMtNTAwIGhvdmVyOnRleHQtemluYy03MDBcIlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICDZhti42LHYqSDYp9mE2KXYr9in2LHYqSAoQ0VPKVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVZpZXcoXCJoclwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgICAgXCJweC00IHB5LTIgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtYm9sZCB0cmFuc2l0aW9uLWFsbCB3aGl0ZXNwYWNlLW5vd3JhcFwiLFxuICAgICAgICAgICAgICAgICAgYWN0aXZlVmlldyA9PT0gXCJoclwiXG4gICAgICAgICAgICAgICAgICAgID8gXCJiZy13aGl0ZSB0ZXh0LXppbmMtOTAwIHNoYWRvdy1zbVwiXG4gICAgICAgICAgICAgICAgICAgIDogXCJ0ZXh0LXppbmMtNTAwIGhvdmVyOnRleHQtemluYy03MDBcIlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICDYtNik2YjZhiDYp9mE2YXZiNi42YHZitmGIChIUilcbiAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiBzZXRBY3RpdmVWaWV3KFwiYWNjb3VudGFudFwiKX1cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e2NuKFxuICAgICAgICAgICAgICAgICAgXCJweC00IHB5LTIgcm91bmRlZC14bCB0ZXh0LXNtIGZvbnQtYm9sZCB0cmFuc2l0aW9uLWFsbCB3aGl0ZXNwYWNlLW5vd3JhcFwiLFxuICAgICAgICAgICAgICAgICAgYWN0aXZlVmlldyA9PT0gXCJhY2NvdW50YW50XCJcbiAgICAgICAgICAgICAgICAgICAgPyBcImJnLXdoaXRlIHRleHQtemluYy05MDAgc2hhZG93LXNtXCJcbiAgICAgICAgICAgICAgICAgICAgOiBcInRleHQtemluYy01MDAgaG92ZXI6dGV4dC16aW5jLTcwMFwiXG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgINin2YTZhdit2KfYs9io2Kkg2YjYp9mE2YXYp9mE2YrYqVxuICAgICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldEFjdGl2ZVZpZXcoXCJvcGVyYXRpb25zXCIpfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICBcInB4LTQgcHktMiByb3VuZGVkLXhsIHRleHQtc20gZm9udC1ib2xkIHRyYW5zaXRpb24tYWxsIHdoaXRlc3BhY2Utbm93cmFwXCIsXG4gICAgICAgICAgICAgICAgICBhY3RpdmVWaWV3ID09PSBcIm9wZXJhdGlvbnNcIlxuICAgICAgICAgICAgICAgICAgICA/IFwiYmctd2hpdGUgdGV4dC16aW5jLTkwMCBzaGFkb3ctc21cIlxuICAgICAgICAgICAgICAgICAgICA6IFwidGV4dC16aW5jLTUwMCBob3Zlcjp0ZXh0LXppbmMtNzAwXCJcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAg2KfZhNiq2LTYutmK2YQg2YjYs9mE2KfYs9mEINin2YTYpdmF2K/Yp9ivXG4gICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBpdGVtcy1jZW50ZXIgZ2FwLTMgdy1mdWxsIG1kOnctYXV0b1wiPlxuICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IChpc0VkaXRpbmcgPyBzYXZlQ29uZmlnKCkgOiBzZXRJc0VkaXRpbmcodHJ1ZSkpfVxuICAgICAgICAgICAgZGlzYWJsZWQ9e2lzU2F2aW5nfVxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbihcbiAgICAgICAgICAgICAgXCJmbGV4LTEgbWQ6ZmxleC1ub25lIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIGdhcC0yIHB4LTYgcHktMyByb3VuZGVkLTJ4bCBmb250LWJvbGQgdHJhbnNpdGlvbi1hbGwgc2hhZG93LWxnXCIsXG4gICAgICAgICAgICAgIGlzRWRpdGluZ1xuICAgICAgICAgICAgICAgID8gXCJiZy1lbWVyYWxkLTYwMCB0ZXh0LXdoaXRlIHNoYWRvdy1lbWVyYWxkLTYwMC8yMFwiXG4gICAgICAgICAgICAgICAgOiBcImJnLXdoaXRlIGJvcmRlciBib3JkZXItemluYy0yMDAgdGV4dC16aW5jLTYwMCBob3ZlcjpiZy16aW5jLTUwIHNoYWRvdy16aW5jLTEwMFwiXG4gICAgICAgICAgICApfVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtpc1NhdmluZyA/IChcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTUgaC01IGJvcmRlci0yIGJvcmRlci13aGl0ZS8zMCBib3JkZXItdC13aGl0ZSByb3VuZGVkLWZ1bGwgYW5pbWF0ZS1zcGluXCIgLz5cbiAgICAgICAgICAgICkgOiBpc0VkaXRpbmcgPyAoXG4gICAgICAgICAgICAgIDxDaGVjayBjbGFzc05hbWU9XCJ3LTUgaC01XCIgLz5cbiAgICAgICAgICAgICkgOiAoXG4gICAgICAgICAgICAgIDxTZXR0aW5nczIgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+XG4gICAgICAgICAgICApfVxuICAgICAgICAgICAgPHNwYW4+e2lzRWRpdGluZyA/IFwi2K3Zgdi4INin2YTYqti62YrZitix2KfYqlwiIDogXCLYqtiu2LXZiti1INin2YTZiNin2KzZh9ipXCJ9PC9zcGFuPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIHshaXNFZGl0aW5nICYmIChcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3NOYW1lPVwiZmxleC0xIG1kOmZsZXgtbm9uZSBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBiZy1wcmltYXJ5IHRleHQtd2hpdGUgcHgtNiBweS0zIHJvdW5kZWQtMnhsIGZvbnQtYm9sZCBzaGFkb3ctbGcgc2hhZG93LXByaW1hcnkvMjAgaG92ZXI6c2NhbGUtWzEuMDJdIGFjdGl2ZTpzY2FsZS1bMC45OF0gdHJhbnNpdGlvbi1hbGxcIj5cbiAgICAgICAgICAgICAgPFBsdXMgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+XG4gICAgICAgICAgICAgIDxzcGFuPtil2KzYsdin2KEg2KzYr9mK2K88L3NwYW4+XG4gICAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgICApfVxuICAgICAgICAgIHtpc0VkaXRpbmcgJiYgKFxuICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgc2V0SXNFZGl0aW5nKGZhbHNlKTtcbiAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicHgtNiBweS0zIGJnLXppbmMtMTAwIHRleHQtemluYy02MDAgcm91bmRlZC0yeGwgZm9udC1ib2xkIGhvdmVyOmJnLXppbmMtMjAwIHRyYW5zaXRpb24tYWxsXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAg2KXZhNi62KfYoVxuICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgKX1cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2hlYWRlcj5cblxuICAgICAge2lzRWRpdGluZyA/IChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTZcIj5cbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImJnLWFtYmVyLTUwIGJvcmRlciBib3JkZXItYW1iZXItMTAwIHJvdW5kZWQtMnhsIHAtNCB0ZXh0LWFtYmVyLTgwMCB0ZXh0LXNtIGZvbnQtbWVkaXVtXCI+XG4gICAgICAgICAgICDZitmF2YPZhtmDINiz2K3YqCDZiNil2YHZhNin2Kog2KfZhNi52YbYp9i12LEg2YTYqti62YrZitixINiq2LHYqtmK2KjZh9in2Iwg2KPZiCDYp9iz2KrYrtiv2KfZhSDYo9mK2YLZiNmG2Kkg2KfZhNi52YrZhiDZhNil2K7Zgdin2KEv2KXYuNmH2KfYsSDYp9mE2LnZhtin2LXYsS5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8UmVvcmRlci5Hcm91cCBheGlzPVwieVwiIHZhbHVlcz17Y29uZmlnfSBvblJlb3JkZXI9e3NldENvbmZpZ30gY2xhc3NOYW1lPVwic3BhY2UteS00XCI+XG4gICAgICAgICAgICB7Y29uZmlnLm1hcCgoaXRlbSkgPT4gKFxuICAgICAgICAgICAgICA8UmVvcmRlci5JdGVtXG4gICAgICAgICAgICAgICAga2V5PXtpdGVtLmlkfVxuICAgICAgICAgICAgICAgIHZhbHVlPXtpdGVtfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICBcImJnLXdoaXRlIGJvcmRlciBwLTYgcm91bmRlZC0zeGwgZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1iZXR3ZWVuIHNoYWRvdy1zbSB0cmFuc2l0aW9uLWFsbFwiLFxuICAgICAgICAgICAgICAgICAgaXRlbS52aXNpYmxlXG4gICAgICAgICAgICAgICAgICAgID8gXCJib3JkZXItemluYy0yMDBcIlxuICAgICAgICAgICAgICAgICAgICA6IFwib3BhY2l0eS01MCBib3JkZXItZGFzaGVkIGJvcmRlci16aW5jLTMwMCBiZy16aW5jLTUwXCJcbiAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtNlwiPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjdXJzb3ItZ3JhYiBhY3RpdmU6Y3Vyc29yLWdyYWJiaW5nIHRleHQtemluYy0zMDAgaG92ZXI6dGV4dC16aW5jLTUwMCB0cmFuc2l0aW9uLWNvbG9yc1wiPlxuICAgICAgICAgICAgICAgICAgICA8R3JpcFZlcnRpY2FsIGNsYXNzTmFtZT1cInctNiBoLTZcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAgICAgICAgICA8aDQgY2xhc3NOYW1lPVwidGV4dC1sZyBmb250LWJsYWNrIHRleHQtemluYy05MDBcIj57aXRlbS50aXRsZX08L2g0PlxuICAgICAgICAgICAgICAgICAgICA8cCBjbGFzc05hbWU9XCJ0ZXh0LXhzIHRleHQtemluYy00MDAgZm9udC1tZWRpdW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICB7aXRlbS52aXNpYmxlID8gXCLZhdix2KbZiiDZgdmKINin2YTZhNmI2K3YqSDYp9mE2LHYptmK2LPZitipXCIgOiBcItmF2K7ZgdmKINmF2YYg2KfZhNmE2YjYrdipINin2YTYsdim2YrYs9mK2KlcIn1cbiAgICAgICAgICAgICAgICAgICAgPC9wPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gdG9nZ2xlVmlzaWJpbGl0eShpdGVtLmlkKX1cbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICAgIFwidy0xMiBoLTEyIHJvdW5kZWQtMnhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRyYW5zaXRpb24tYWxsXCIsXG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udmlzaWJsZSA/IFwiYmctcHJpbWFyeS8xMCB0ZXh0LXByaW1hcnlcIiA6IFwiYmctemluYy0yMDAgdGV4dC16aW5jLTUwMFwiXG4gICAgICAgICAgICAgICAgICApfVxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIHtpdGVtLnZpc2libGUgPyA8RXllIGNsYXNzTmFtZT1cInctNSBoLTVcIiAvPiA6IDxFeWVPZmYgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+fVxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L1Jlb3JkZXIuSXRlbT5cbiAgICAgICAgICAgICkpfVxuICAgICAgICAgIDwvUmVvcmRlci5Hcm91cD5cbiAgICAgICAgPC9kaXY+XG4gICAgICApIDogKFxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktOFwiPlxuICAgICAgICAgIDxMYXVuY2hwYWRPdmVydmlld1xuICAgICAgICAgICAgc3RhdHM9e3tcbiAgICAgICAgICAgICAgbGVhZHNDb3VudDogbGVhZHM/Lmxlbmd0aCB8fCAwLFxuICAgICAgICAgICAgICBlbXBsb3llZXNDb3VudDogZGFzaGJvYXJkU3RhdHM/LmVtcGxveWVlc0NvdW50IHx8IDAsXG4gICAgICAgICAgICAgIHNhdWRpRW1wbG95ZWVzOiBkYXNoYm9hcmRTdGF0cz8uc2F1ZGlFbXBsb3llZXMgfHwgMCxcbiAgICAgICAgICAgICAgcGVuZGluZ0ludm9pY2VzOiBkYXNoYm9hcmRTdGF0cz8ucGVuZGluZ0ludm9pY2VzIHx8IDAsXG4gICAgICAgICAgICAgIHZhdEV4cG9zdXJlOiBkYXNoYm9hcmRTdGF0cz8udmF0RXhwb3N1cmUgfHwgMCxcbiAgICAgICAgICAgICAgcGF5cm9sbENvc3Q6IGRhc2hib2FyZFN0YXRzPy5wYXlyb2xsQ29zdCB8fCAwLFxuICAgICAgICAgICAgfX1cbiAgICAgICAgICAgIG9uTmV3SW52b2ljZT17aGFuZGxlTmV3SW52b2ljZX1cbiAgICAgICAgICAgIG9uTmV3TGVhZD17aGFuZGxlTmV3TGVhZH1cbiAgICAgICAgICAgIG9uTmV3UGF5cm9sbD17aGFuZGxlTmV3UGF5cm9sbH1cbiAgICAgICAgICAgIG9uTmV3UHJvamVjdD17aGFuZGxlTmV3UHJvamVjdH1cbiAgICAgICAgICAvPlxuICAgICAgICAgIHthY3RpdmVWaWV3ID09PSBcImNlb1wiICYmIChcbiAgICAgICAgICAgIDw+XG4gICAgICAgICAgICAgIHtjb25maWdcbiAgICAgICAgICAgICAgICAuZmlsdGVyKCh3KSA9PiB3LnZpc2libGUpXG4gICAgICAgICAgICAgICAgLm1hcCgod2lkZ2V0KSA9PiAoXG4gICAgICAgICAgICAgICAgICA8UmVhY3QuRnJhZ21lbnQga2V5PXt3aWRnZXQuaWR9PntyZW5kZXJXaWRnZXQod2lkZ2V0LmlkKX08L1JlYWN0LkZyYWdtZW50PlxuICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgPC8+XG4gICAgICAgICAgKX1cbiAgICAgICAgICB7YWN0aXZlVmlldyA9PT0gXCJoclwiICYmIHJlbmRlckhSVmlldygpfVxuICAgICAgICAgIHthY3RpdmVWaWV3ID09PSBcImFjY291bnRhbnRcIiAmJiByZW5kZXJBY2NvdW50aW5nVmlldygpfVxuICAgICAgICAgIHthY3RpdmVWaWV3ID09PSBcIm9wZXJhdGlvbnNcIiAmJiByZW5kZXJPcGVyYXRpb25zVmlldygpfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICl9XG5cbiAgICAgIDxBbmltYXRlUHJlc2VuY2U+XG4gICAgICAgIHtzaG93V2VsY29tZU1vZGFsICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIj5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgYmctemluYy05MDAvNDAgYmFja2Ryb3AtYmx1ci1zbVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldFNob3dXZWxjb21lTW9kYWwoZmFsc2UpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIHctZnVsbCBtYXgtdy14bCBiZy13aGl0ZSByb3VuZGVkLVsyLjVyZW1dIHAtOCBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItemluYy0xMDAgZmxleCBmbGV4LWNvbCBpdGVtcy1jZW50ZXIgdGV4dC1jZW50ZXIgb3ZlcmZsb3ctaGlkZGVuXCJcbiAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJhYnNvbHV0ZSB0b3AtMCByaWdodC0wIHctZnVsbCBoLTMyIGJnLWdyYWRpZW50LXRvLWIgZnJvbS1wcmltYXJ5LzEwIHRvLXRyYW5zcGFyZW50IHBvaW50ZXItZXZlbnRzLW5vbmVcIiAvPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInctMTYgaC0xNiBiZy1wcmltYXJ5LzEwIHRleHQtcHJpbWFyeSByb3VuZGVkLTN4bCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBtYi02IHJlbGF0aXZlXCI+XG4gICAgICAgICAgICAgICAgPENoZWNrQ2lyY2xlMiBjbGFzc05hbWU9XCJ3LTggaC04XCIgLz5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LTJ4bCBmb250LWJsYWNrIHRleHQtemluYy05MDAgbWItNFwiPlxuICAgICAgICAgICAgICAgINij2YfZhNin2Ysg2KjZgyDZgdmKINmG2LjYp9mFINmF2K/Yp9ix2Kwg2KfZhNmF2KrZg9in2YXZhCFcbiAgICAgICAgICAgICAgPC9oMj5cbiAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC1zbSBmb250LW1lZGl1bSB0ZXh0LXppbmMtNTAwIG1iLTggbGVhZGluZy1yZWxheGVkIG1heC13LW1kXCI+XG4gICAgICAgICAgICAgICAg2YTZgtivINiq2YUg2KXYudiv2KfYryDZhdiz2KfYrdipINin2YTYudmF2YQg2KfZhNiu2KfYtdipINio2YMg2KjZhtis2KfYrS4g2YXYr9in2LHYrCDZitix2KjYtyDZhdio2YrYudin2KrZg9iMINmB2YjYp9iq2YrYsdmD2Iwg2LHZiNin2KrYqCDZhdmI2LjZgdmK2YNcbiAgICAgICAgICAgICAgICDZiNin2YTYtNit2YYg2YHZiiDZhdmD2KfZhiDZiNin2K3YryDZhdiq2LXZhCDZiNmF2KTYqtmF2KouINmG2LXZitit2KrZhtinINmE2YTYqNiv2KEg2YfZiiDYpdi22KfZgdipINi52YXZhNin2KbZgyDYp9mE2YXYrdiq2YXZhNmK2YYg2KPZiFxuICAgICAgICAgICAgICAgINin2YTYrdin2YTZitmK2YYuXG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC00IHctZnVsbFwiPlxuICAgICAgICAgICAgICAgIDxMaW5rXG4gICAgICAgICAgICAgICAgICB0bz1cIi9hcHAvY3JtXCJcbiAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT1cImZsZXgtMSBiZy1wcmltYXJ5IHRleHQtd2hpdGUgcHktNCByb3VuZGVkLXhsIGZvbnQtYm9sZCBob3ZlcjpzY2FsZS1bMS4wMl0gdHJhbnNpdGlvbi10cmFuc2Zvcm0gZmxleCBpdGVtcy1jZW50ZXIganVzdGlmeS1jZW50ZXIgZ2FwLTIgc2hhZG93LWxnIHNoYWRvdy1wcmltYXJ5LzIwXCJcbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICA8VXNlcnMgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+XG4gICAgICAgICAgICAgICAgICDYp9mE2LDZh9in2Kgg2KXZhNmJINin2YTYudmF2YTYp9ihINin2YTZhdio2YrYudin2KogKENSTSlcbiAgICAgICAgICAgICAgICA8L0xpbms+XG4gICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgb25DbGljaz17KCkgPT4gc2V0U2hvd1dlbGNvbWVNb2RhbChmYWxzZSl9XG4gICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJweC02IHB5LTQgcm91bmRlZC14bCBmb250LWJvbGQgdGV4dC16aW5jLTUwMCBiZy16aW5jLTEwMCBob3ZlcjpiZy16aW5jLTIwMCB0cmFuc2l0aW9uLWNvbG9yc1wiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAg2KfYs9iq2YPYtNin2YEg2KfZhNmE2YjYrdipXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9tb3Rpb24uZGl2PlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICAgIHtpc1doYXRzQXBwTW9kYWxPcGVuICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZpeGVkIGluc2V0LTAgei01MCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBwLTRcIj5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCB9fVxuICAgICAgICAgICAgICBhbmltYXRlPXt7IG9wYWNpdHk6IDEgfX1cbiAgICAgICAgICAgICAgZXhpdD17eyBvcGFjaXR5OiAwIH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cImFic29sdXRlIGluc2V0LTAgYmctemluYy05MDAvNDAgYmFja2Ryb3AtYmx1ci1zbVwiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzV2hhdHNBcHBNb2RhbE9wZW4oZmFsc2UpfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgICAgIDxtb3Rpb24uZGl2XG4gICAgICAgICAgICAgIGluaXRpYWw9e3sgb3BhY2l0eTogMCwgc2NhbGU6IDAuOTUgfX1cbiAgICAgICAgICAgICAgYW5pbWF0ZT17eyBvcGFjaXR5OiAxLCBzY2FsZTogMSB9fVxuICAgICAgICAgICAgICBleGl0PXt7IG9wYWNpdHk6IDAsIHNjYWxlOiAwLjk1IH19XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT1cInJlbGF0aXZlIHctZnVsbCBtYXgtdy1sZyBiZy13aGl0ZSByb3VuZGVkLVsyLjVyZW1dIHAtOCBzaGFkb3ctMnhsIGJvcmRlciBib3JkZXItemluYy0xMDAgZmxleCBmbGV4LWNvbCBvdmVyZmxvdy1oaWRkZW4gdGV4dC1yaWdodFwiXG4gICAgICAgICAgICA+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZmxleCBqdXN0aWZ5LWJldHdlZW4gaXRlbXMtY2VudGVyIG1iLTYgYm9yZGVyLWIgYm9yZGVyLXppbmMtNTAgcGItNFwiPlxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9eygpID0+IHNldElzV2hhdHNBcHBNb2RhbE9wZW4oZmFsc2UpfVxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwicC0yIGhvdmVyOmJnLXppbmMtMTAwIHJvdW5kZWQteGwgdHJhbnNpdGlvbi1hbGxcIlxuICAgICAgICAgICAgICAgID5cbiAgICAgICAgICAgICAgICAgIDxYIGNsYXNzTmFtZT1cInctNSBoLTUgdGV4dC16aW5jLTQwMFwiIC8+XG4gICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGl0ZW1zLWNlbnRlciBnYXAtM1wiPlxuICAgICAgICAgICAgICAgICAgPGRpdj5cbiAgICAgICAgICAgICAgICAgICAgPGgzIGNsYXNzTmFtZT1cImZvbnQtYmxhY2sgdGV4dC1sZyB0ZXh0LXppbmMtOTAwXCI+2KXYsdiz2KfZhCDYsdiz2KfZhNipINmI2KfYqtiz2KfYqCDYs9ix2YrYudipPC9oMz5cbiAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJvbGQgdGV4dC1lbWVyYWxkLTYwMFwiPlxuICAgICAgICAgICAgICAgICAgICAgINin2YHYqtitINmI2KfYrNmH2Kkg2YjYp9iq2LPYp9ioINmI2YrYqCDZhdio2KfYtNix2Kkg2KjZgtmI2KfZhNioINiz2LnZiNiv2YrYqSDZhdiz2KjZgtipXG4gICAgICAgICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ3LTEyIGgtMTIgYmctZW1lcmFsZC01MCB0ZXh0LWVtZXJhbGQtNjAwIHJvdW5kZWQtMnhsIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxNZXNzYWdlU3F1YXJlIGNsYXNzTmFtZT1cInctNiBoLTZcIiAvPlxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgIDxmb3JtXG4gICAgICAgICAgICAgICAgb25TdWJtaXQ9eyhlKSA9PiB7XG4gICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICBpZiAoIXdoYXRzQXBwUGhvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdG9hc3QuZXJyb3IoXCLZitix2KzZiSDYpdiv2K7Yp9mEINix2YLZhSDYp9mE2KzZiNin2YQg2KPZiNmE2KfZi1wiKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgbGV0IGNsZWFuUGhvbmUgPSB3aGF0c0FwcFBob25lLnJlcGxhY2UoL1xcRC9nLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgIGlmIChjbGVhblBob25lLnN0YXJ0c1dpdGgoXCIwNVwiKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhblBob25lID0gXCI5NjZcIiArIGNsZWFuUGhvbmUuc2xpY2UoMSk7XG4gICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNsZWFuUGhvbmUuc3RhcnRzV2l0aChcIjVcIikgJiYgY2xlYW5QaG9uZS5sZW5ndGggPT09IDkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYW5QaG9uZSA9IFwiOTY2XCIgKyBjbGVhblBob25lO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICghY2xlYW5QaG9uZS5zdGFydHNXaXRoKFwiOTY2XCIpICYmIGNsZWFuUGhvbmUubGVuZ3RoID09PSA5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFuUGhvbmUgPSBcIjk2NlwiICsgY2xlYW5QaG9uZTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGNvbnN0IHVybCA9IGBodHRwczovL2FwaS53aGF0c2FwcC5jb20vc2VuZD9waG9uZT0ke2NsZWFuUGhvbmV9JnRleHQ9JHtlbmNvZGVVUklDb21wb25lbnQod2hhdHNBcHBNZXNzYWdlKX1gO1xuICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4odXJsLCBcIl9ibGFua1wiKTtcbiAgICAgICAgICAgICAgICAgIHNldElzV2hhdHNBcHBNb2RhbE9wZW4oZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgdG9hc3Quc3VjY2VzcyhcItis2KfYsdmKINmB2KrYrSDZiNin2KrYs9in2Kgg2YjZitioINmB2Yog2YbYp9mB2LDYqSDYrNiv2YrYr9ipLi4uIPCfmoDwn5+iXCIpO1xuICAgICAgICAgICAgICAgIH19XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwic3BhY2UteS01XCJcbiAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic3BhY2UteS0yXCI+XG4gICAgICAgICAgICAgICAgICA8bGFiZWwgY2xhc3NOYW1lPVwidGV4dC14cyBmb250LWJsYWNrIHRleHQtemluYy00MDBcIj7YsdmC2YUg2KzZiNin2YQg2KfZhNmF2LPYqtmE2YU8L2xhYmVsPlxuICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmbGV4IGdhcC0yXCIgZGlyPVwibHRyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzTmFtZT1cImJnLXppbmMtMTAwIGJvcmRlciBib3JkZXItemluYy0yMDAgcHgtNCBweS0zIHJvdW5kZWQtMnhsIHRleHQtemluYy02MDAgZm9udC1ib2xkIGZsZXggaXRlbXMtY2VudGVyIGp1c3RpZnktY2VudGVyIHRleHQtc21cIj5cbiAgICAgICAgICAgICAgICAgICAgICArOTY2XG4gICAgICAgICAgICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgICAgICAgdHlwZT1cInRleHRcIlxuICAgICAgICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCI1WFhYWFhYWFhcIlxuICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPXt3aGF0c0FwcFBob25lfVxuICAgICAgICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXsoZSkgPT4gc2V0V2hhdHNBcHBQaG9uZShlLnRhcmdldC52YWx1ZSl9XG4gICAgICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwiZmxleC0xIHB4LTUgcHktMy41IGJnLXppbmMtNTAgYm9yZGVyIGJvcmRlci16aW5jLTEwMCByb3VuZGVkLTJ4bCBmb250LWJvbGQgdGV4dC1zbSBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzIwIG91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBwbGFjZWhvbGRlcjp0ZXh0LXppbmMtMzAwXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzcGFjZS15LTJcIj5cbiAgICAgICAgICAgICAgICAgIDxsYWJlbCBjbGFzc05hbWU9XCJ0ZXh0LXhzIGZvbnQtYmxhY2sgdGV4dC16aW5jLTQwMFwiPlxuICAgICAgICAgICAgICAgICAgICDYp9iu2KrYsSDYo9it2K8g2KfZhNmC2YjYp9mE2Kgg2KfZhNis2KfZh9iy2KlcbiAgICAgICAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImdyaWQgZ3JpZC1jb2xzLTMgZ2FwLTJcIj5cbiAgICAgICAgICAgICAgICAgICAge1tcbiAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogXCJ3ZWxjb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCLYqtix2K3Zitio2YrYqVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgYm9keTogXCLZhdix2K3YqNin2Ysg2KjZgyDZgdmKINmF2K/Yp9ix2KwuINmG2LPYudivINio2K7Yr9mF2KrZgyDZiNiq2YLYr9mK2YUg2KPZgdi22YQg2KfZhNit2YTZiNmEINmE2KXYr9in2LHYqSDYo9i52YXYp9mE2YMg2KjZhtis2KfYrS4g2YHYsdmK2YIg2KfZhNmF2KjZiti52KfYqiDYrNin2YfYsiDZhNmF2LPYp9i52K/YqtmDLlwiLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFwiaW52b2ljZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6IFwi2YHYp9iq2YjYsdipXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBib2R5OiBcIti02LHZitmD2YbYpyDYp9mE2LnYstmK2LLYjCDYqtmFINil2LXYr9in2LEg2YHYp9iq2YjYsdiq2YMg2KfZhNi22LHZitio2YrYqSDYqNmG2KzYp9itLiDZitmF2YPZhtmDINin2YTYp9i32YTYp9i5INi52YTZitmH2Kcg2YjYqtit2YXZitmE2YfYpyDYudio2LEg2KfZhNmF2YbYtdipLiDYtNmD2LHYp9mLINmE2KvZgtiq2YPZhS5cIixcbiAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBcImZvbGxvd3VwXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogXCLZhdiq2KfYqNi52KlcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIGJvZHk6IFwi2KfZhNiz2YTYp9mFINi52YTZitmD2YXYjCDZhtmI2K8g2KfZhNin2LPYqtmB2LPYp9ixINi52YYg2LnYsdi2INin2YTYs9i52LEg2KfZhNmF2YLYr9mFINmE2YPZhSDZhdik2K7Ysdin2YvYjCDZh9mEINmE2K/ZitmD2YUg2KPZiiDZhdmE2KfYrdi42KfYqiDYo9mIINiq2LnYr9mK2YTYp9iqINmF2LfZhNmI2KjYqdifINmG2LPYudivINio2K7Yr9mF2KrZg9mFLlwiLFxuICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF0ubWFwKCh0KSA9PiAoXG4gICAgICAgICAgICAgICAgICAgICAgPGJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAga2V5PXt0LmlkfVxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZT1cImJ1dHRvblwiXG4gICAgICAgICAgICAgICAgICAgICAgICBvbkNsaWNrPXsoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFdoYXRzQXBwVGVtcGxhdGUodC5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIHNldFdoYXRzQXBwTWVzc2FnZSh0LmJvZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17Y24oXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwicC0zIHJvdW5kZWQteGwgYm9yZGVyIHRleHQtWzEwcHhdIGZvbnQtYmxhY2sgdHJhbnNpdGlvbi1hbGwgdGV4dC1jZW50ZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgd2hhdHNBcHBUZW1wbGF0ZSA9PT0gdC5pZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgID8gXCJiZy1lbWVyYWxkLTUwIHRleHQtZW1lcmFsZC03MDAgYm9yZGVyLWVtZXJhbGQtMjAwIHNoYWRvdy1zbVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBcImJnLXdoaXRlIHRleHQtemluYy01MDAgYm9yZGVyLXppbmMtMjAwIGhvdmVyOmJvcmRlci16aW5jLTMwMCBob3ZlcjpiZy16aW5jLTUwXCJcbiAgICAgICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAge3QudGl0bGV9XG4gICAgICAgICAgICAgICAgICAgICAgPC9idXR0b24+XG4gICAgICAgICAgICAgICAgICAgICkpfVxuICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInNwYWNlLXktMlwiPlxuICAgICAgICAgICAgICAgICAgPGxhYmVsIGNsYXNzTmFtZT1cInRleHQteHMgZm9udC1ibGFjayB0ZXh0LXppbmMtNDAwXCI+2YbYtSDYp9mE2LHYs9in2YTYqTwvbGFiZWw+XG4gICAgICAgICAgICAgICAgICA8dGV4dGFyZWFcbiAgICAgICAgICAgICAgICAgICAgcm93cz17NH1cbiAgICAgICAgICAgICAgICAgICAgdmFsdWU9e3doYXRzQXBwTWVzc2FnZX1cbiAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9eyhlKSA9PiBzZXRXaGF0c0FwcE1lc3NhZ2UoZS50YXJnZXQudmFsdWUpfVxuICAgICAgICAgICAgICAgICAgICBjbGFzc05hbWU9XCJ3LWZ1bGwgcHgtNSBweS0zIGJnLXppbmMtNTAgYm9yZGVyIGJvcmRlci16aW5jLTEwMCByb3VuZGVkLTJ4bCBmb250LWJvbGQgdGV4dC14cyBmb2N1czpyaW5nLTIgZm9jdXM6cmluZy1wcmltYXJ5LzIwIG91dGxpbmUtbm9uZSB0cmFuc2l0aW9uLWFsbCBtaW4taC1bMTAwcHhdIHBsYWNlaG9sZGVyOnRleHQtemluYy0zMDAgdGV4dC1yaWdodCBsZWFkaW5nLXJlbGF4ZWRcIlxuICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cItin2YPYqtioINix2LPYp9mE2KrZgyDYp9mE2YXYrti12LXYqSDZh9mG2KcuLi5cIlxuICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cblxuICAgICAgICAgICAgICAgIDxidXR0b25cbiAgICAgICAgICAgICAgICAgIHR5cGU9XCJzdWJtaXRcIlxuICAgICAgICAgICAgICAgICAgY2xhc3NOYW1lPVwidy1mdWxsIGJnLWVtZXJhbGQtNjAwIGhvdmVyOmJnLWVtZXJhbGQtNzAwIHRleHQtd2hpdGUgcHktNCByb3VuZGVkLVsxLjVyZW1dIGZvbnQtYmxhY2sgc2hhZG93LWxnIHNoYWRvdy1lbWVyYWxkLTYwMC8xMCBob3ZlcjpzY2FsZS1bMS4wMV0gYWN0aXZlOnNjYWxlLVswLjk5XSB0cmFuc2l0aW9uLWFsbCBmbGV4IGl0ZW1zLWNlbnRlciBqdXN0aWZ5LWNlbnRlciBnYXAtMiBjdXJzb3ItcG9pbnRlclwiXG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgPE1lc3NhZ2VTcXVhcmUgY2xhc3NOYW1lPVwidy01IGgtNVwiIC8+XG4gICAgICAgICAgICAgICAgICA8c3Bhbj7Ypdix2LPYp9mEINi52KjYsSDZiNin2KrYs9in2KggKFNlbmQgV2hhdHNBcHApPC9zcGFuPlxuICAgICAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgICAgICA8L2Zvcm0+XG4gICAgICAgICAgICA8L21vdGlvbi5kaXY+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICl9XG5cbiAgICAgICAge3Nob3dPbmJvYXJkaW5nICYmIChcbiAgICAgICAgICA8T25ib2FyZGluZ1dpemFyZFxuICAgICAgICAgICAgb25Db21wbGV0ZT17KCkgPT4gc2V0U2hvd09uYm9hcmRpbmcoZmFsc2UpfVxuICAgICAgICAgICAgb25DbG9zZT17KCkgPT4gc2V0U2hvd09uYm9hcmRpbmcoZmFsc2UpfVxuICAgICAgICAgIC8+XG4gICAgICAgICl9XG4gICAgICA8L0FuaW1hdGVQcmVzZW5jZT5cblxuICAgICAgeyFzaG93T25ib2FyZGluZyAmJiAoXG4gICAgICAgIDxRdWlja0FjdGlvbnNGQUJcbiAgICAgICAgICBvbk5ld0ludm9pY2U9e2hhbmRsZU5ld0ludm9pY2V9XG4gICAgICAgICAgb25OZXdMZWFkPXtoYW5kbGVOZXdMZWFkfVxuICAgICAgICAgIG9uTmV3UGF5cm9sbD17aGFuZGxlTmV3UGF5cm9sbH1cbiAgICAgICAgICBvbk5ld1Byb2plY3Q9e2hhbmRsZU5ld1Byb2plY3R9XG4gICAgICAgIC8+XG4gICAgICApfVxuICAgIDwvZGl2PlxuICApO1xufVxuIl0sIm1hcHBpbmdzIjoiQUFtbEJjLFNBNjNFRixVQTczRUU7QUFubEJkLE9BQU8sU0FBUyxXQUFXLGdCQUFnQjtBQUMzQyxPQUFPLHlCQUF5QjtBQUNoQyxPQUFPLGdDQUFnQztBQUN2QyxPQUFPLDZCQUE2QjtBQUNwQztBQUFBLEVBQ0U7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFFQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBRUE7QUFBQSxFQUVBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsT0FDSztBQUNQO0FBQUEsRUFDRTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsRUFDQTtBQUFBLEVBQ0E7QUFBQSxFQUNBO0FBQUEsT0FDSztBQUNQLFNBQVMsUUFBUSxpQkFBaUIsZUFBZTtBQUNqRCxTQUFTLFVB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