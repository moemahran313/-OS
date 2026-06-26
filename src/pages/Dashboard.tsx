import React, { useEffect, useState } from "react";
import ComplianceDashboard from "@/src/components/ComplianceDashboard";
import EmergencyLockdownIndicator from "@/src/components/EmergencyLockdownIndicator";
import PayrollComplianceWidget from "@/src/components/PayrollComplianceWidget";
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
  GripHorizontal,
  X,
  Zap,
  CheckCircle2,
  Download,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  DollarSign,
  AlertOctagon,
  Truck,
  Anchor,
  ShieldAlert,
  Briefcase
} from "lucide-react";
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
} from "recharts";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  limit,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-errors";
import { PayrollService } from "@/src/services/payroll.service";

interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
}

const DEFAULT_CONFIG: WidgetConfig[] = [
  { id: "intelligence", title: "توصيات مدارج الذكية للنمو", visible: true },
  { id: "quick_actions", title: "الإجراءات السريعة", visible: true },
  { id: "compliance", title: "لوحة الامتثال", visible: true },
  { id: "stats", title: "الإحصائيات السريعة", visible: true },
  { id: "payroll", title: "مسيرات الرواتب", visible: true },
  { id: "chart", title: "منحنى المبيعات", visible: true },
  { id: "activity", title: "النشاط الأخير", visible: true },
];

const AVAILABLE_QUICK_ACTIONS = [
  { id: "create_invoice", label: "إنشاء فاتورة", icon: FileText, path: "/app/invoices/new", color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "add_lead", label: "إضافة عميل محتمل", icon: Users, path: "/app/crm/new", color: "text-blue-500", bg: "bg-blue-50" },
  { id: "unread_chats", label: "المحادثات غير المقروءة", icon: MessageSquare, path: "/app/chat", color: "text-purple-500", bg: "bg-purple-50" },
  { id: "send_whatsapp", label: "إرسال رسالة واتساب", icon: MessageSquare, path: "#", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "payroll_report", label: "إصدار مسير رواتب", icon: FileCheck, path: "/app/payroll/new", color: "text-amber-500", bg: "bg-amber-50" },
  { id: "add_employee", label: "إضافة موظف", icon: UserPlus, path: "/app/fwcos/new", color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "new_shipment", label: "شحنة جديدة", icon: Package, path: "/app/suppliers/new", color: "text-rose-500", bg: "bg-rose-50" },
];

const DEFAULT_QUICK_ACTIONS = [
  "create_invoice",
  "add_lead",
  "send_whatsapp",
  "unread_chats",
  "payroll_report"
];

function QuickActionsWidget({ quickActions, setQuickActions, user, updateProfile, onWhatsAppClick }: { quickActions: string[], setQuickActions: any, user: any, updateProfile: any, onWhatsAppClick: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [localActions, setLocalActions] = useState(quickActions);

  useEffect(() => {
    setLocalActions(quickActions);
  }, [quickActions]);

  const handleSave = async () => {
    let finalActions = localActions;
    if (finalActions.length === 0) {
      toast.error("يجب اختيار إجراء واحد على الأقل");
      return;
    }
    setQuickActions(finalActions);
    setIsEditing(false);
    if (user) {
      try {
        await updateProfile({ quickActionsConfig: finalActions });
      } catch (err) {
         toast.error("حدث خطأ أثناء الحفظ");
      }
    }
  };

  const removeAction = (id: string) => {
    setLocalActions(prev => prev.filter(a => a !== id));
  };

  const addAction = (id: string) => {
    if (!localActions.includes(id)) {
      setLocalActions(prev => [...prev, id]);
    }
  };

  if (isEditing) {
    const unpinnedActions = AVAILABLE_QUICK_ACTIONS.filter(a => !localActions.includes(a.id));

    return (
       <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 relative">
          <div className="flex justify-between items-center mb-6">
             <div>
               <h3 className="font-bold text-lg">تخصيص الإجراءات السريعة</h3>
               <p className="text-xs text-zinc-500 font-medium">اسحب لترتيب الإجراءات، أو قم بإزالتها وإضافتها.</p>
             </div>
             <div className="flex items-center gap-2">
               <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-bold text-zinc-500 bg-zinc-100 rounded-xl hover:bg-zinc-200">إلغاء</button>
               <button onClick={handleSave} className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-xl hover:bg-primary/90">حفظ</button>
             </div>
          </div>
          
          <div className="space-y-6">
            <Reorder.Group axis="y" values={localActions} onReorder={setLocalActions} className="space-y-2">
              {localActions.map(id => {
                const action = AVAILABLE_QUICK_ACTIONS.find(a => a.id === id);
                if (!action) return null;
                return (
                   <Reorder.Item key={id} value={id} className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-xl cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-3">
                         <GripHorizontal className="w-5 h-5 text-zinc-400" />
                         <div className={cn("p-2 rounded-lg", action.bg, action.color)}>
                           <action.icon className="w-4 h-4" />
                         </div>
                         <span className="font-bold text-sm text-zinc-700">{action.label}</span>
                      </div>
                      <button onClick={() => removeAction(id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                   </Reorder.Item>
                )
              })}
            </Reorder.Group>

            {unpinnedActions.length > 0 && (
              <div className="pt-4 border-t border-zinc-100">
                <h4 className="text-sm font-bold text-zinc-900 mb-3">إجراءات إضافية</h4>
                <div className="flex flex-wrap gap-2">
                  {unpinnedActions.map(action => (
                    <button key={action.id} onClick={() => addAction(action.id)} className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200 hover:border-primary/50 hover:bg-primary/5 rounded-xl transition-all text-sm font-bold text-zinc-600">
                      <Plus className="w-4 h-4 text-primary" />
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
       </section>
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 relative">
      <div className="flex justify-between items-center mb-6">
         <h3 className="font-bold text-lg">الإجراءات السريعة</h3>
         <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-xs font-bold text-zinc-500 hover:text-primary transition-colors bg-zinc-100 hover:bg-primary/10 px-3 py-1.5 rounded-lg">
           <Settings2 className="w-3 h-3" />
           تخصيص
         </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {localActions.map(id => {
          const action = AVAILABLE_QUICK_ACTIONS.find(a => a.id === id);
          if (!action) return null;
          if (id === "send_whatsapp") {
            return (
              <button 
                key={id} 
                onClick={onWhatsAppClick} 
                className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 bg-gradient-to-b from-white to-zinc-50/50 transition-all group cursor-pointer w-full"
              >
                <div className={cn("p-4 rounded-2xl mb-4 group-hover:scale-110 group-active:scale-95 transition-transform", action.bg, action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-zinc-800 text-center">{action.label}</span>
              </button>
            )
          }
          return (
             <Link key={id} to={action.path} className="flex flex-col items-center justify-center p-6 rounded-2xl border border-zinc-100 hover:border-primary/30 hover:shadow-md hover:-translate-y-1 bg-gradient-to-b from-white to-zinc-50/50 transition-all group">
                <div className={cn("p-4 rounded-2xl mb-4 group-hover:scale-110 group-active:scale-95 transition-transform", action.bg, action.color)}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-bold text-zinc-800 text-center">{action.label}</span>
             </Link>
          )
        })}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { user, updateProfile } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const [showWelcomeModal, setShowWelcomeModal] = useState(location.state?.showWelcome || false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [config, setConfig] = useState<WidgetConfig[]>(DEFAULT_CONFIG);
  const [quickActions, setQuickActions] = useState<string[]>(DEFAULT_QUICK_ACTIONS);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [whatsAppTemplate, setWhatsAppTemplate] = useState("welcome");
  const [whatsAppMessage, setWhatsAppMessage] = useState("مرحباً بك في مدارج. نسعد بخدمتك وتقديم أفضل الحلول لإدارة أعمالك بنجاح. فريق المبيعات جاهز لمساعدتك.");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState<'ceo' | 'hr' | 'accountant' | 'operations'>('ceo');
  const [dismissedLocalAlerts, setDismissedLocalAlerts] = useState<string[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [activeShipments, setActiveShipments] = useState<any[]>([]);
  const [shipmentsCount, setShipmentsCount] = useState<number>(0);
  const [quarterlyData, setQuarterlyData] = useState<{name: string, current: number, projected: number}[]>([
    { name: "الربع 1", current: 0, projected: 0 },
    { name: "الربع 2", current: 0, projected: 0 },
    { name: "الربع 3", current: 0, projected: 0 },
    { name: "الربع 4", current: 0, projected: 0 },
  ]);

  useEffect(() => {
    const quarters = [
      { name: "الربع 1", current: 0, projected: 0 },
      { name: "الربع 2", current: 0, projected: 0 },
      { name: "الربع 3", current: 0, projected: 0 },
      { name: "الربع 4", current: 0, projected: 0 },
    ];

    // Compute "current" (Paid invoices)
    invoices.forEach(inv => {
      if (!inv.issueDate) return;
      const date = new Date(inv.issueDate);
      if (isNaN(date.getTime())) return;
      
      const month = date.getMonth(); // 0-11
      const quarterIdx = Math.floor(month / 3); // 0-3
      const isPaid = inv.status === 'paid';
      
      const amount = (inv.totalAmountHalalas || 0) / 100;
      if (quarterIdx >= 0 && quarterIdx <= 3) {
        if (isPaid) {
          quarters[quarterIdx].current += amount;
        } else if (inv.status !== 'cancelled') {
          // If unpaid or pending, it counts towards projected
          quarters[quarterIdx].projected += amount;
        }
      }
    });

    // Compute "projected" (leads pipeline)
    leads.forEach(lead => {
      let date: Date | null = null;
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

    // Load user specialized config
    if (user.dashboardConfig) {
      setConfig(user.dashboardConfig);
    }
    if (user.quickActionsConfig) {
      setQuickActions(user.quickActionsConfig);
    }

    // Listen to Leads (for sales pipeline stats)
    const leadsQuery = query(collection(db, "leads"), where("userId", "==", user.uid));
    const unsubLeads = onSnapshot(leadsQuery, (snapshot) => {
      const leadsList: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadsList);
      const revenue = leadsList.reduce((acc, curr) => acc + (curr.value || 0), 0);
      const wonLeads = leadsList.filter(l => l.status === 'won').length;
      
      const salesByMonth = leadsList.reduce((acc: any, lead) => {
        if (!lead.expectedCloseDate) return acc;
        const d = new Date(lead.expectedCloseDate);
        const m = d.toLocaleString('ar-SA', { month: 'short' });
        acc[m] = (acc[m] || 0) + (lead.value || 0);
        return acc;
      }, {});
      const cData = Object.keys(salesByMonth).length > 0 ? 
        Object.keys(salesByMonth).map(k => ({ name: k, sales: salesByMonth[k] })) : 
        [{ name: 'لا يوجد', sales: 0 }];

      setDashboardStats((prev: any) => ({
        ...prev,
        revenue,
        leadsCount: leadsList.length,
        wonLeads,
        chartData: cData,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leads");
    });

    const payrollQuery = query(collection(db, "payroll_runs"), where("userId", "==", user.uid));
    const unsubPayroll = onSnapshot(payrollQuery, (snapshot) => {
      const runs: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPayrollRuns(runs);
      const totalCost = runs.reduce((acc, curr: any) => acc + (curr.totalGross || 0), 0);
      
      const sortedByPeriod = [...runs].sort((a: any, b: any) => (b.period || '').localeCompare(a.period || ''));
      const latestPeriod = sortedByPeriod.length > 0 ? sortedByPeriod[0].period : null;

      // Determine lockdown status
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      const lastRun = runs.find((r: any) => r.period === lastMonthStr);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); 
      const deadline = new Date(endOfLastMonth);
      deadline.setDate(deadline.getDate() + 30);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isGenerated = lastRun ? (lastRun.mudadSifGenerated || lastRun.wpsGenerated) : false;
      const isLockdown = !isGenerated && daysLeft <= 0;

      setDashboardStats((prev: any) => ({
        ...prev,
        payrollCost: totalCost,
        recentPayroll: sortedByPeriod.slice(0, 3),
        latestPeriod,
        isLockdown,
        lockdownPeriod: lastMonthStr
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "payroll_runs");
    });

    const employeesQuery = query(collection(db, "employees"), where("userId", "==", user.uid));
    const unsubEmployees = onSnapshot(employeesQuery, (snapshot) => {
      const emps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const saudiEmployees = emps.filter((e: any) => e.nationality?.includes('سعودي') || e.nationality?.toLowerCase().includes('saudi')).length;
      
      const localExpiringAlerts: any[] = [];
      emps.forEach((emp: any) => {
         if (emp.contractEndDate) {
            const daysLeft = (new Date(emp.contractEndDate).getTime() - Date.now()) / (1000 * 3600 * 24);
            if (daysLeft > 0 && daysLeft <= 30) {
               localExpiringAlerts.push({
                  id: `local_expr_${emp.id}`,
                  title: "تنبيه انتهاء عقد",
                  message: `عقد الموظف ${emp.name} ينتهي خلال ${Math.floor(daysLeft)} يوماً.`,
                  type: 'warning',
                  isLocal: true,
                  actionPath: "/app/fwcos"
               });
            }
         }
      });

      setDashboardStats((prev: any) => ({
         ...prev,
         employeesCount: emps.length,
         saudiEmployees: saudiEmployees,
         expiringContractsAlerts: localExpiringAlerts
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "employees");
    });

    const invoicesQuery = query(collection(db, "invoices"), where("userId", "==", user.uid));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invs: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvoices(invs);
      const pendingInvoices = invs.filter(i => i.status !== 'paid').length;
      const vatExposure = invs.reduce((acc, i) => acc + (i.vatAmountHalalas || 0), 0) / 100;
      setDashboardStats((prev: any) => ({
        ...prev,
        pendingInvoices: pendingInvoices,
        vatExposure: vatExposure,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "invoices");
    });

    const rulesQuery = query(collection(db, "compliance_rules"), where("userId", "==", user.uid));
    const unsubRules = onSnapshot(rulesQuery, (snapshot) => {
      const rules = snapshot.docs.map(doc => doc.data());
      const activeRules = rules.filter(r => r.active).length;
      const score = rules.length > 0 ? Math.round((activeRules / rules.length) * 100) : 100;
      setDashboardStats((prev: any) => ({
        ...prev,
        complianceScore: score,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "compliance_rules");
    });

    // Listen to Audit Logs
    const logsQuery = query(
      collection(db, "audit_logs"), 
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc"),
      limit(10)
    );
    const unsubLogs = onSnapshot(logsQuery, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAuditLogs(logs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "audit_logs");
    });

    // Listen to System Alerts
    const alertsQuery = query(
      collection(db, "system_alerts"),
      where("userId", "==", user.uid),
      where("isRead", "==", false)
    );
    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      setSystemAlerts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "system_alerts");
    });

    // Listen to Shipments (Logistics and supply chain)
    const shipmentsQuery = query(collection(db, "shipments"), where("userId", "==", user.uid));
    const unsubShipments = onSnapshot(shipmentsQuery, (snapshot) => {
      const shList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setShipmentsCount(shList.length);
      setActiveShipments(shList.filter((s: any) => s.status !== 'delivered' && s.status !== 'cancelled'));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "shipments");
    });

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
      return (
        <section key="stats-skeleton" className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-150 dark:border-zinc-850/60 shadow-sm animate-pulse md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
              <div className="w-16 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded mt-2 mb-2" />
            <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" />
          </div>
          {[1, 2].map((i) => (
            <div key={i} className="p-6 bg-white dark:bg-zinc-900/40 backdrop-blur-md rounded-3xl border border-zinc-150 dark:border-zinc-850/60 shadow-sm animate-pulse md:col-span-1">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-16 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-800" />
              </div>
              <div className="w-32 h-4 bg-zinc-200 dark:bg-zinc-800 rounded mt-2 mb-2" />
              <div className="w-24 h-8 bg-zinc-200 dark:bg-zinc-800 rounded mt-1" />
            </div>
          ))}
        </section>
      );
    }

    let currentStats = [];
    if (activeView === 'ceo') {
       currentStats = [
         { id: 'revenue', name: "الصافي المتوقع", value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
         { id: 'compliance', name: "مؤشر الامتثال العام", value: `${dashboardStats?.complianceScore || 0}%`, change: dashboardStats?.trends?.compliance ? `${dashboardStats.trends.compliance}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.compliance || 0) >= 0 ? "up" : "down", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
         { id: 'payroll_cost', name: "تكلفة الرواتب", value: `${(dashboardStats?.payrollCost || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.payroll ? `${dashboardStats.trends.payroll}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.payroll || 0) >= 0 ? "down" : "up", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
       ];
    } else if (activeView === 'hr') {
       currentStats = [
         { id: 'nitaqat', name: "نطاقات (نسبة التوطين)", value: `${( (dashboardStats?.saudiEmployees || 0) / (dashboardStats?.employeesCount || 1) * 100).toFixed(1)}%`, change: (dashboardStats?.saudiEmployees / (dashboardStats?.employeesCount || 1)) > 0.3 ? "النطاق الأخضر" : "النطاق الأصفر", trend: "up", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
         { id: 'total_employees', name: "إجمالي الموظفين", value: dashboardStats?.employeesCount?.toString() || "0", change: dashboardStats?.employeesCount ? `${dashboardStats.employeesCount}` : "غير متوفر", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
         { id: 'eosb', name: "التزامات نهاية الخدمة", value: `${( (dashboardStats?.payrollCost || 0) * 0.4).toLocaleString()} ر.س`, change: "غير متوفر", trend: "down", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
       ];
    } else {
       currentStats = [
         { id: 'vat', name: "ضريبة القيمة المضافة", value: `${(dashboardStats?.vatExposure || 0).toLocaleString()} ر.س`, change: "غير متوفر", trend: "up", icon: FileCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
         { id: 'invoices', name: "فواتير معلقة", value: dashboardStats?.pendingInvoices?.toString() || "0", change: dashboardStats?.pendingInvoices ? `${dashboardStats.pendingInvoices}` : "غير متوفر", trend: "down", icon: FileText, color: "text-amber-500", bg: "bg-amber-500/10" },
         { id: 'revenue_acc', name: "إجمالي الإيرادات", value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
       ];
    }

    return (
       <section key="stats" className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {currentStats.map((stat, i) => {
           const isLarge = i === 0;
           return (
             <motion.div 
               key={stat.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               whileHover={{ y: -6, scale: 1.01 }}
               transition={{ 
                 opacity: { duration: 0.3, delay: i * 0.1 },
                 y: { type: "spring", stiffness: 300, damping: 20 },
                 scale: { duration: 0.2 }
               }}
               className={cn(
                 "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between",
                 "bg-white dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20",
                 isLarge ? "md:col-span-2" : "md:col-span-1"
               )}
             >
               {/* Background glows on large card */}
               {isLarge && (
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
               )}
               <div>
                 <div className="flex justify-between items-start mb-6">
                   <div className={cn("p-3 rounded-2xl flex items-center justify-center", stat.bg)}>
                     <stat.icon className={cn("w-6 h-6", stat.color)} />
                   </div>
                   <div className={cn(
                     "flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-xl border",
                     stat.trend === "up" 
                       ? "text-emerald-600 bg-emerald-50/80 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/10" 
                       : "text-rose-600 bg-rose-50/80 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/10"
                   )}>
                     {stat.trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                     {stat.change}
                   </div>
                 </div>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">{stat.name}</p>
                 <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{stat.value}</h3>
               </div>
               
               {isLarge && (
                 <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/40">
                   <div className="flex justify-between text-[10px] font-black text-zinc-400 mb-1.5 uppercase tracking-wider">
                     <span>معدل الأداء المستهدف</span>
                     <span>92%</span>
                   </div>
                   <div className="w-full bg-zinc-100 dark:bg-zinc-800/60 h-2 rounded-full overflow-hidden">
                     <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
                   </div>
                 </div>
               )}
             </motion.div>
           );
         })}
       </section>
    );
  };

  const toggleVisibility = (id: string) => {
    setConfig(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "intelligence":
        return (
          <section key="intelligence" className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 shadow-sm p-6 relative overflow-hidden">
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/10 border border-primary/10 rotate-3">
                   <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                </div>
                <div>
                  <h3 className="font-black text-2xl text-zinc-900 tracking-tight mb-1">محرك ذكاء مدارج للنمو (AI)</h3>
                  <p className="text-xs font-black text-primary tracking-widest uppercase">توصيات مدارج الذكية المخصصة لك لتسريع المبيعات هذا الربع</p>
                </div>
              </div>
              <Link to="/app/integrations" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white text-primary text-sm font-bold border border-primary/20 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm">
                تصفح سوق التطبيقات المجاني
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
              <Link to="/app/settings" className="bg-white p-6 rounded-3xl border border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-rose-50 text-rose-500 rounded-xl border border-rose-100">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-rose-100 shadow-sm">عائد فوري</span>
                  </div>
                  <h4 className="font-black text-zinc-900 mb-2">أتمتة الواتساب + CRM</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    لديك 12 عميل محتمل لم يتم متابعتهم. تفعيل ردود الواتساب التلقائية المدعومة من مدارج سيزيد نسبة الإغلاق بـ 40٪ فوراً.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-rose-600 group-hover:gap-3 transition-all">
                  <span>تفعيل مجاني الآن</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
              
              <Link to="/app/integrations" className="bg-white p-6 rounded-3xl border border-primary/10 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl border border-blue-100">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider border border-blue-100 shadow-sm">حماية الثروة</span>
                  </div>
                  <h4 className="font-black text-zinc-900 mb-2">الربط المباشر بـ ZATCA</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                    تفادى الغرامات المدمّرة للمنشآت الناشئة. استخدم الربط المتكامل والمجاني مع هيئة الزكاة (المرحلة 2) من مدارج بضغطة زر.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-blue-600 group-hover:gap-3 transition-all">
                  <span>بدء الربط مجاناً</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>

              <Link to="/app/settings" className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl border border-zinc-700 shadow-lg hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all group flex flex-col justify-between relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-2xl pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-white/10 text-white rounded-xl border border-white/5 backdrop-blur-md">
                      <Zap className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black bg-primary text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.5)]">برنامج الشركاء</span>
                  </div>
                  <h4 className="font-black text-white mb-2 text-lg">دعوة الموردين للشبكة</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    شارك مدارج مع 3 من مورديك أو عملائك واستفد من 3 أشهر مجانية من باقة Premium + تفعيل مزامنة الفواتير المشتركة بينهم.
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-black text-primary group-hover:gap-3 transition-all relative z-10">
                  <span>انسخ رابط الإحالة</span>
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </Link>
            </div>
          </section>
        );
      case "quick_actions":
        return <QuickActionsWidget key="quick_actions" quickActions={quickActions} setQuickActions={setQuickActions} user={user} updateProfile={updateProfile} onWhatsAppClick={() => setIsWhatsAppModalOpen(true)} />;
      case "compliance":
        return <ComplianceDashboard key="compliance" />;
      case "stats":
        return renderStats();
      case "payroll":
        return (
          <section key="payroll" className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-lg font-black text-zinc-900">مسيرات الرواتب الأخيرة</h3>
                <p className="text-sm font-medium text-zinc-500">موجز مسيرات الرواتب الحديثة وحالتها</p>
              </div>
              <div className="flex items-center gap-2">
                {dashboardStats?.latestPeriod && (
                  <button 
                    onClick={async () => {
                       try {
                         if (!user) return;
                         const { data } = await PayrollService.batchGenerateMudadSIF(user.uid, dashboardStats.latestPeriod);
                         const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
                         const url = URL.createObjectURL(blob);
                         const link = document.createElement("a");
                         link.setAttribute("href", url);
                         link.setAttribute("download", `BATCH_SIF_MUDAD_${dashboardStats.latestPeriod}.csv`);
                         document.body.appendChild(link);
                         link.click();
                         document.body.removeChild(link);
                         // Note: toast is available if imported. If not, maybe we just use alert or nothing.
                       } catch(e: any) {
                         console.error(e);
                       }
                    }}
                    className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5" /> تحميل SIF ({dashboardStats.latestPeriod})
                  </button>
                )}
                <button className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                  عرض الكل
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-white text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                    <th className="px-6 py-4">رقم المسير</th>
                    <th className="px-6 py-4">الشهر</th>
                    <th className="px-6 py-4">الحالة</th>
                    <th className="px-6 py-4">تاريخ الاعتماد</th>
                    <th className="px-6 py-4">الموظفين</th>
                    <th className="px-6 py-4 text-left">إجمالي الصافي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {!dashboardStats ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded w-16" /></td>
                        <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded w-12" /></td>
                        <td className="px-6 py-4"><div className="h-6 bg-zinc-200 rounded-lg w-14" /></td>
                        <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded w-20" /></td>
                        <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded w-8" /></td>
                        <td className="px-6 py-4"><div className="h-4 bg-zinc-200 rounded w-24 ml-auto" /></td>
                      </tr>
                    ))
                  ) : dashboardStats.recentPayroll?.length > 0 ? (
                    dashboardStats.recentPayroll.map((run: any, idx: number) => (
                      <tr key={run.id || idx} className="hover:bg-zinc-50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-zinc-900">{run.id.substring(0, 8)}</td>
                        <td className="px-6 py-4 font-bold text-zinc-700">{run.period}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-1 rounded-lg text-xs font-bold",
                            run.status === 'processed' ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"
                          )}>
                            {run.status === 'processed' ? 'معتمد' : 'مكتمل'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-medium">
                          {new Date(run.processedDate || run.createdAt).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-bold">{run.entries?.length || 0}</td>
                        <td className="px-6 py-4 font-black text-zinc-900 text-left">{run.totalNet.toLocaleString()} ر.س</td>
                      </tr>
                    ))
                  ) : (
                    <tr key="empty-payroll-recent">
                      <td colSpan={6} className="py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                        لا توجد مسيرات رواتب أخيرة
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        );
      case "chart":
        if (activeView === 'ceo') {
          return (
            <section key="chart" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[400px] lg:col-span-2">
                 <h3 className="font-bold text-lg mb-6">نمو الإيرادات المتوقع (المبيعات)</h3>
                 <div className="w-full h-full pb-8">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={quarterlyData}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#a1a1aa", fontSize: 10 }} dy={10} />
                       <YAxis hide domain={['auto', 'auto']} />
                       <Tooltip cursor={{fill: '#f4f4f5'}} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", direction: "rtl", textAlign: "right" }} formatter={(value: any) => [`${value.toLocaleString()} ر.س`, ""]} />
                       <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                       <Bar dataKey="current" name="المحقق" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="projected" name="المتوقع (الفرص)" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
               
               <div className="flex flex-col gap-6">
                 <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex-1">
                   <h3 className="font-bold text-sm mb-4">مؤشر الامتثال العام</h3>
                   <div className="h-[120px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                         <Pie data={[{name: 'ممتثل', value: dashboardStats?.complianceScore || 0}, {name: 'مخاطر', value: 100 - (dashboardStats?.complianceScore || 0)}]} innerRadius={40} outerRadius={55} paddingAngle={2} dataKey="value">
                           <Cell fill="#10b981" />
                           <Cell fill="#f43f5e" />
                         </Pie>
                         <Tooltip contentStyle={{ direction: 'rtl', borderRadius: '8px' }} />
                       </PieChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="text-center mt-2">
                     <span className="text-3xl font-black text-emerald-500">{dashboardStats?.complianceScore || 0}%</span>
                   </div>
                 </div>

                 <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm flex-1">
                   <h3 className="font-bold text-sm mb-4">تكلفة الرواتب</h3>
                   <div className="h-[100px]">
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={dashboardStats?.chartData?.slice(-3).map((d: any, i: number) => ({ name: d.name, cost: (dashboardStats?.payrollCost || 0) * (0.9 + i * 0.05) })) || []}>
                         <Line type="monotone" dataKey="cost" stroke="#f59e0b" strokeWidth={3} dot={false} />
                         <Tooltip formatter={(val: any) => [`${Math.round(val).toLocaleString()} ر.س`, "التكلفة"]} contentStyle={{ direction: 'rtl', borderRadius: '8px' }}/>
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                   <div className="text-sm font-bold text-zinc-500 mt-2 text-center">
                     {dashboardStats?.trends?.payroll >= 0 ? "اتجاه مستقر" : "انخفاض تدريجي"} ({dashboardStats?.trends?.payroll || 0}%)
                   </div>
                 </div>
               </div>
            </section>
          );
        }

        return (
          <section key="chart" className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[400px]">
            <h3 className="font-bold text-lg mb-6">منحنى المبيعات</h3>
            <div className="w-full h-full pb-8">
              {!dashboardStats ? (
                <div className="w-full h-full bg-zinc-100 animate-pulse rounded-2xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardStats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fill: "#a1a1aa", fontSize: 10 }} 
                     dy={10}
                  />
                  <YAxis 
                    hide 
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", direction: "rtl", textAlign: "right" }}
                    formatter={(value: any) => [`${value.toLocaleString()} ر.س`, "المبيعات"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSales)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </section>
        );
      case "activity":
        return (
          <section key="activity" className="p-8 bg-white rounded-3xl border border-zinc-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">النشاط الأخير</h3>
              <Link to="/app/settings" className="text-xs font-bold text-primary hover:underline">عرض الكل</Link>
            </div>
              <div className="space-y-6">
                {!dashboardStats && auditLogs.length === 0 ? (
                  [1, 2, 3, 4].map(i => (
                    <div key={i} className="flex gap-4 items-start pb-4 animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-zinc-200 flex-shrink-0" />
                      <div className="space-y-2 flex-1 pt-1">
                        <div className="h-4 bg-zinc-200 rounded w-1/2" />
                        <div className="h-3 bg-zinc-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))
                ) : (dashboardStats?.recentLogs || auditLogs).length === 0 ? (
                  <div className="text-center py-10 text-zinc-400 text-xs font-bold uppercase tracking-widest">لا توجد نشاطات</div>
                ) : (dashboardStats?.recentLogs || auditLogs).map((log: any) => (
                  <div key={log.id} className="flex gap-4 items-start pb-4 border-b border-zinc-50 last:border-0 last:pb-0 group">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center border",
                      log.module === 'CRM' ? "bg-blue-50 text-blue-600 border-blue-100" :
                      log.module === 'INVOICE' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      "bg-zinc-100 text-zinc-400 border-zinc-200"
                    )}>
                      {log.module === 'EMAIL' ? <Mail className="w-4 h-4" /> : 
                       log.module === 'INVOICE' ? <FileText className="w-4 h-4" /> :
                       <History className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 line-clamp-1">{log.action || (log.payload?.action) || `نشاط في ${log.module}`}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">
                        {new Date(log.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} • {log.user?.name || "النظام"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
          </section>
        );
      default:
        return null;
    }
  };

  const renderHRView = () => {
    const saudiCount = dashboardStats?.saudiEmployees || 0;
    const totalCount = dashboardStats?.employeesCount || 0;
    const expatCount = totalCount - saudiCount;
    const saudizationPct = totalCount > 0 ? (saudiCount / totalCount) * 100 : 0;
    
    // Nitaqat Band
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

    return (
      <div className="space-y-8 animate-fade-in" dir="rtl">
        {/* Metric Cards - Modern Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10">
                  <Users className="w-6 h-6 text-emerald-500" />
                </div>
                <span className={cn("px-2.5 py-1 rounded-xl text-xs font-black border uppercase tracking-wider", nitaqatColorClass)}>
                  {nitaqatLabel}
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">نطاقات وتوطين الكوادر (Nitaqat)</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{saudizationPct.toFixed(1)}%</h3>
              <div className="mt-6 flex gap-1 h-2 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <div style={{ width: `${saudizationPct}%` }} className="bg-emerald-500 h-full rounded-full" />
                <div style={{ width: `${100 - saudizationPct}%` }} className="bg-zinc-200 dark:bg-zinc-750 h-full rounded-full" />
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">
                سعودي: {saudiCount} | وافد: {expatCount}
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10">
                  نشطين
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">قوة العمل الحالية (Headcount)</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{totalCount} موظف</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">عقود موثقة ومطابقة في قوى</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
                  موازنة الأجور
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">الأجور الشهرية (Payroll)</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {(dashboardStats?.payrollCost || 0).toLocaleString()} ر.س
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">شامل الأساسي والبدلات</p>
            </div>
          </motion.div>
        </section>


        {/* Intelligence Recommender */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-xl text-zinc-900">مساعد شؤون الموظفين الذكي (HR Advisory)</h3>
              <p className="text-xs font-bold text-primary">توصيات حية لتحسين امتثال الموارد البشرية وتفادي مخالفات الأجور</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">قوى Qiwa</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">عقود العمل الرقمية الموحدة</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  تطالب وزارة الموارد البشرية بتغطية 100% من عقود الموظفين رقمياً على منصة قوى. قم بتسجيل وتوثيق العقود فوراً لتجنب إيقاف الاستقدام.
                </p>
              </div>
              <Link to="/app/fwcos" className="mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group">
                <span>الذهاب لإدارة العقود</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">صندوق هدف</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">تنمية الكوادر الوطنية</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  معدل التوطين الحالي لديك يسمح لك بالاستفادة من برامج دعم أجور المواطنين بنسب تصل إلى 50٪ لمدد تصل إلى سنتين. قدم عبر برامج صندوق هدف الآن.
                </p>
              </div>
              <a href="https://hrdf.org.sa" target="_blank" rel="noreferrer" className="mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group">
                <span>تصفح برامج دعم هدف</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${saudizationPct < 20 ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-zinc-50 text-zinc-600 border-zinc-200"}`}>تحكم نطاقات</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">موازنة التوطين العاجلة</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {saudizationPct < 20 
                    ? "أنت حالياً في نطاق حرج. توظيف شخص سعودي إضافي سينقل منصتك فوراً إلى النطاق الأخضر الآمن ويفتح لك ميزات الاستقدام ونقل الكفالة."
                    : "لقد نجحت في الحفاظ على النطاق الأخضر الآمن. استمر في الالتزام لتأهيل شركتك للحصول على مناقصات حكومية متميزة."}
                </p>
              </div>
              <Link to="/app/fwcos/new" className="mt-4 text-xs font-black text-rose-600 flex items-center gap-1 group">
                <span>تسجيل موظف جديد</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Mid grid: Compliance Dashboard & WPS Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <ComplianceDashboard />
          </div>
          <div className="lg:col-span-5">
            <PayrollComplianceWidget runs={payrollRuns} />
          </div>
        </div>

        {/* Bottom double bento: In-flight Payroll runs vs Expiring Documents alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contracts Alerts */}
          <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-lg text-zinc-900">تنبيهات عقود العمل والإقامات</h3>
                <p className="text-xs text-zinc-500 font-medium">عقود شارفت على الانتهاء تتطلب إجراءً فورياً لتلافي الإيقاف</p>
              </div>
              <Link to="/app/fwcos" className="text-xs font-bold text-primary hover:underline">إدارة الكادر</Link>
            </div>

            <div className="space-y-4">
              {dashboardStats?.expiringContractsAlerts?.length > 0 ? (
                dashboardStats.expiringContractsAlerts.map((alert: any) => (
                  <div key={alert.id} className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">{alert.message}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">موعد التجديد المقترح: قبل 10 أيام من الانتهاء</p>
                      </div>
                    </div>
                    <Link to="/app/fwcos" className="bg-amber-600 text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber-700 transition">
                      تجديد الآن
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-center py-16">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-none">مؤشر أمان العقود مستقر وممتاز</p>
                  <p className="text-zinc-400 text-[10px] font-medium mt-1">لا توجد عقود تنتهي خلال الـ 30 يوماً القادمة</p>
                </div>
              )}
            </div>
          </section>

          {/* Payroll Runs */}
          <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-black text-lg text-zinc-900">مسيرات رواتب الكادر (الأخيرة)</h3>
                <p className="text-xs text-zinc-500 font-medium">سجلات الصرف الشهرية المعتمدة</p>
              </div>
              <Link to="/app/payroll" className="text-xs font-bold text-primary hover:underline">كل المسيرات</Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[10px]">
                    <th className="pb-3 text-right">الفترة</th>
                    <th className="pb-3 text-center">الموظفين</th>
                    <th className="pb-3 text-center">الصرف المعتمد</th>
                    <th className="pb-3 text-left">أوامر SIF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {payrollRuns?.slice(0, 4).map((run: any, idx: number) => (
                    <tr key={run.id || idx} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="py-3 font-bold text-zinc-800">{run.period}</td>
                      <td className="py-3 text-center text-zinc-500 font-bold">{run.entries?.length || 0}</td>
                      <td className="py-3 text-center font-bold text-zinc-950">
                        {run.totalNet?.toLocaleString() || run.totalGross?.toLocaleString()} ر.س
                      </td>
                      <td className="py-3 text-left">
                        <button 
                          onClick={async () => {
                             try {
                               if (!user) return;
                               const { data } = await PayrollService.batchGenerateMudadSIF(user.uid, run.period);
                               const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
                               const url = URL.createObjectURL(blob);
                               const link = document.createElement("a");
                               link.setAttribute("href", url);
                               link.setAttribute("download", `WPS_SIF_${run.period}.csv`);
                               document.body.appendChild(link);
                               link.click();
                               document.body.removeChild(link);
                               toast.success("تم توليد وتحميل ملف SIF لمدد بنجاح");
                             } catch(e) {
                               toast.error("فشل في استخراج ملف مدد");
                             }
                          }}
                          className="text-[10px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-100 transition-colors inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> SIF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {(!payrollRuns || payrollRuns.length === 0) && (
                    <tr key="empty-payroll-runs">
                      <td colSpan={4} className="py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
                        لا توجد مسيرات مسجلة حتى الآن
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderAccountingView = () => {
    // VAT liability calculation
    const collectedVat = dashboardStats?.vatExposure || 0;
    
    // Invoices summary
    const pendingInvoicesCount = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled').length;
    const totalPendingAmountAr = invoices
      .filter(i => i.status !== 'paid' && i.status !== 'cancelled')
      .reduce((acc, i) => acc + (i.totalAmountHalalas || 0), 0) / 100;
    
    const paidInvoicesAmount = invoices
      .filter(i => i.status === 'paid')
      .reduce((acc, i) => acc + (i.totalAmountHalalas || 0), 0) / 100;

    return (
      <div className="space-y-8 animate-fade-in" dir="rtl">
        {/* KPI Row - Modern Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                  <DollarSign className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
                  هيئة الزكاة (VAT)
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">التزامات ضريبة القيمة المضافة (Collected VAT)</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{collectedVat.toLocaleString()} ر.س</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">
                يُحتسب تراكمياً ومباشرةً من الفواتير الصادرة للعملاء بمعدل 15٪
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-rose-500/10">
                  <FileText className="w-6 h-6 text-rose-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10 animate-pulse">
                  {pendingInvoicesCount} معلقة
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">المدفوعات المستحقة للتحصيل (Receivables)</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{totalPendingAmountAr.toLocaleString()} ر.س</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">فواتير بانتظار السداد أو التسوية للمرحلة 2</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-emerald-500/10">
                  <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/10">
                  سيولة محققة
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">إجمالي كشوف الإيرادات المصونة (Paid Cash)</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{paidInvoicesAmount.toLocaleString()} ر.س</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">التدفقات النقدية الداخلة التي طابقت بنجاح</p>
            </div>
          </motion.div>
        </section>

        {/* Intelligence Recommender */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-xl text-zinc-900">محرك الرقابة والامتثال الضريبي (ZATCA Advisory)</h3>
              <p className="text-xs font-bold text-primary">توصيات حية للامتثال لمتطلبات الفوترة الإلكترونية والتقارير المالية للربع الحالي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">هيئة الزكاة</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">الربط الإلكتروني للمرحلة الثانية</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  يتيح لك نظام مدارج إرسال فواتيرك مباشرة إلى بورتال فاتورة (ZATCA) لحظياً باستخدام التوقيعات الرقمية المشفرة. فعل التكامل وتخلص من القلق تماماً.
                </p>
              </div>
              <Link to="/app/integrations" className="mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group">
                <span>تفعيل ربط ZATCA</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">التدفق المالي</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">تحصيل المبالغ المستحقة المتأخرة</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  متوسط فترات السداد من عملائك ارتفعت بمعدل 5 أيام. أتمتة إرسال رسائل التذكير بالفواتير عبر مدارج يقلل الذمم المدينة بنسبة 25%.
                </p>
              </div>
              <Link to="/app/invoices" className="mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group">
                <span>فحص الفواتير المعلقة</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">الإقرار الضريبي</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">أرشفة وحساب الإقرار بضغطة زر</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  قاربت نهاية الفترة الضريبية الحالية. نظام الفرز الآلي في مدارج يسمح لك بمشاهدة وتحميل تقرير الإقرارات الربع سنوي المدقق المتوافق مع متطلبات الهيئة.
                </p>
              </div>
              <Link to="/app/analytics" className="mt-4 text-xs font-black text-purple-600 flex items-center gap-1 group">
                <span>توليد تقرير الإقرار الضريبي</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Charts & Invoiced stats ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue distribution chart */}
          <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm h-[380px] lg:col-span-8 flex flex-col">
            <h3 className="font-black text-zinc-900 text-lg mb-1">تطور الفوترة ومتحصلات السيولة</h3>
            <p className="text-xs text-zinc-400 font-bold mb-6">قيمة الفواتير الصادرة المعتمدة مقارنةً بالمتحصلات الفعلية شهرياً</p>
            <div className="h-full pb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quarterlyData}>
                  <defs>
                    <linearGradient id="paidGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <Tooltip formatter={(value: any) => [`${value.toLocaleString()} ر.س`, ""]} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="current" name="المتحصل الفعلي" stroke="#10b981" strokeWidth={3} fill="url(#paidGrad)" />
                  <Area type="monotone" dataKey="projected" name="تحت التحصيل / ذمم" stroke="#3b82f6" strokeWidth={3} fill="url(#pendingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Key Checklist card */}
          <div className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm lg:col-span-4 flex flex-col justify-between">
            <div>
              <h3 className="font-black text-zinc-900 text-base mb-1">تدقيق الضوابط والامتثال المالي</h3>
              <p className="text-[11px] text-zinc-400 font-bold mb-4">قائمة التحقق التفاعلية لسلامة الدفاتر</p>
              
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-zinc-600 font-bold">تطابق الرقم الضريبي VAT ومرحلة ZATCA 2</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-zinc-600 font-bold">ترميز المنتجات وإشعارات الخصم الضريبية</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-zinc-600 font-bold">تسوية كشوف الأجور ومطابقتها لمسيرات تأمينات</span>
                </div>
                <div className="flex items-center gap-3">
                  {collectedVat > 0 ? (
                    <div className="p-1 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="text-xs text-zinc-600 font-bold">احتساب الفروقات الضريبية للداخلة والمخرجات</span>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-100 pt-4 mt-6">
              <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase block mb-1">الرتبة في شبكة مدارجOS</span>
              <p className="text-sm font-black text-emerald-600 flex items-center gap-1">
                <span>شركة مؤهلة وممتثلة بالكامل</span>
                <ShieldCheck className="w-4 h-4" />
              </p>
            </div>
          </div>
        </div>

        {/* Ledger table */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-lg text-zinc-900">دفتر فواتير المبيعات الصادرة (المتكامل)</h3>
              <p className="text-xs text-zinc-500 font-medium">سجلات فواتيرك الصادرة من صفحة الفواتير في النظام مجلوبة حياً</p>
            </div>
            <Link to="/app/invoices" className="text-xs font-bold text-primary hover:underline">إدارة الفواتير</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 text-right">رقم الفاتورة</th>
                  <th className="pb-3 text-right">العميل</th>
                  <th className="pb-3 text-center">التاريخ</th>
                  <th className="pb-3 text-center">مبلغ الضريبة</th>
                  <th className="pb-3 text-center">المجموع الكلي</th>
                  <th className="pb-3 text-center">الحالة</th>
                  <th className="pb-3 text-left">أوامر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {invoices?.slice(0, 5).map((inv: any, idx: number) => (
                  <tr key={inv.id || idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-zinc-800">#{inv.invoiceNumber || inv.id?.substring(0,6)}</td>
                    <td className="py-3 font-bold text-zinc-950">{inv.customerName || "عميل غير محدد"}</td>
                    <td className="py-3 text-center text-zinc-500 font-bold">
                      {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('ar-SA') : "-"}
                    </td>
                    <td className="py-3 text-center text-zinc-500 font-bold">
                      {((inv.vatAmountHalalas || 0) / 100).toLocaleString()} ر.س
                    </td>
                    <td className="py-3 text-center font-black text-zinc-950">
                      {((inv.totalAmountHalalas || 0) / 100).toLocaleString()} ر.س
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border",
                        inv.status === 'paid' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        inv.status === 'sent' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        "bg-zinc-50 text-zinc-600 border-zinc-100"
                      )}>
                        {inv.status === 'paid' ? 'مدفوعة' : inv.status === 'sent' ? 'مرسلة' : 'غير مدفوعة'}
                      </span>
                    </td>
                    <td className="py-3 text-left">
                      <Link to={`/invoice/${inv.id || inv.invoiceNumber}`} target="_blank" className="text-[11px] font-black text-blue-600 hover:underline">
                        عرض للطباعة
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!invoices || invoices.length === 0) && (
                  <tr key="empty-invoices-ledger">
                    <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
                      لا توجد فواتير صادرة مسجلة في النظام
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };

  const renderOperationsView = () => {
    return (
      <div className="space-y-8 animate-fade-in" dir="rtl">
        {/* Metric Row - Modern Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-2"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 dark:bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-rose-500/10">
                  <Truck className="w-6 h-6 text-rose-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded-xl border border-rose-500/10 animate-pulse">
                  قيد التتبع
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">إجمالي الشحنات النشطة (Active Shipments)</p>
              <h3 className="text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{activeShipments.length} شحنة جارية</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">
                شحنات دولية مفعّل لها تتبع الحاويات وبوالص الشحن عبر المنافذ
              </p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-blue-500/10">
                  <Anchor className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/10">
                  جاهز ومطابق
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">سجلات الاستيراد الموثقة (Historical)</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{shipmentsCount} شحنة إجمالية</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">بين المخلص والناقل والمستودعات في الرياض</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between bg-white/80 dark:bg-zinc-900/40 backdrop-blur-md border-zinc-150 dark:border-zinc-850/60 shadow-sm hover:shadow-lg dark:hover:shadow-black/30 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 md:col-span-1"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                  <ShieldAlert className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-xs font-black px-2.5 py-1 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/10">
                  مطابق لفسح
                </span>
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-black mb-1">مخلصين جمارك معتمدين (Brokers linked)</p>
              <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">3 مخلصين نشطين</h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-2 font-bold">مرتبطين بفسح الجمركية بالسعودية</p>
            </div>
          </motion.div>
        </section>

        {/* Intelligence Recommender */}
        <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-[2rem] border border-primary/20 p-6 relative overflow-hidden">
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none mix-blend-overlay" />
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-black text-xl text-zinc-900">مساعد اللوجستية الذكي (Operations Advisory)</h3>
              <p className="text-xs font-bold text-primary">توصيات حية لتمثيل سلاسل التوريد وتتبع خطوط الشحن البحري والجوي</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">فسح (Fasah)</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">تطابق البيان الجمركي لفسح</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  تأكد من إدراج رقم السجل التجاري والرمز الجمركي الموحد في حسابك لتفادي حدوث تعليق المعاملات اللوجستية في الموانئ السعودية عن طريق ربط منصة فسح.
                </p>
              </div>
              <Link to="/app/suppliers" className="mt-4 text-xs font-black text-blue-600 flex items-center gap-1 group">
                <span>تعديل السجل الجمركي</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">سلاسل الإمداد</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">جدولة شحنات الصين والخليج</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  تم رصد تأخير بنسبة 4 أيام في موانئ الشحن المغادرة من جنوب شرق آسيا. ننصح بطلب زيادة الكمية الاحتياطية لتفادي نفاد المخزون هذا الشهر.
                </p>
              </div>
              <Link to="/app/suppliers/new" className="mt-4 text-xs font-black text-emerald-600 flex items-center gap-1 group">
                <span>طلب وإضافة شحنة جديدة</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-primary/10 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-black bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full border border-purple-100">إدارة المستودعات</span>
                <h4 className="font-bold text-zinc-900 mt-2 mb-1">تسوية توريد البضائع المستلمة</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  بمجرد وصول الشحنة، يسمح لك مدارج بإنشاء مطابقة فواتير مشتركة وتحويل الفواتير الأجنبية بعملات متعددة (USD, RMB, SAR) بذكاء وامتثال ضريبي.
                </p>
              </div>
              <Link to="/app/suppliers" className="mt-4 text-xs font-black text-purple-600 flex items-center gap-1 group">
                <span>الذهاب لإدارة الموردين</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Live Transit Tracker View Container */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6">
          <h3 className="font-black text-lg text-zinc-900 mb-1">خط سير الشحنات الدولي النشط (Transit Maps)</h3>
          <p className="text-xs text-zinc-500 font-medium mb-6">مراقب المسار المباشر للحاويات من ميناء التصدير لبلد المنشأ وحتى التسليم بالمستودعات</p>
          
          <div className="relative p-6 pt-12 md:p-12 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />
            
            {/* Visual Step 1 (Origin Port) */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors">
                <Anchor className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-800 mt-3">ميناء المنشأ الدولي</h4>
              <p className="text-[10px] text-zinc-400 mt-1 w-32 font-bold">تحميل الشحنة وإتمام الجمارك بالخارج</p>
            </div>

            {/* Line 1 */}
            <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-emerald-500 to-blue-500 relative z-10">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-emerald-500 rounded-full animate-ping" />
            </div>

            {/* Visual Step 2 (Sea Ocean Transit) */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-14 h-14 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20 text-white flex items-center justify-center">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-bold text-sm text-zinc-800 mt-3">عرض البحر (In Oceans)</h4>
              <p className="text-[10px] text-zinc-400 mt-1 w-32 font-bold">بين المحيطات وخطوط الملاحة البحري</p>
            </div>

            {/* Line 2 */}
            <div className="hidden md:block flex-1 h-1 bg-gradient-to-r from-blue-500 to-zinc-300 relative z-10" />

            {/* Visual Step 3 (KSA Customs Clearance) */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors">
                <Building2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-800 mt-3">التخليص الجمركي السعودي</h4>
              <p className="text-[10px] text-zinc-400 mt-1 w-32 font-bold">ميناء الوصول بجدة / الدمام (فسح)</p>
            </div>

            {/* Line 3 */}
            <div className="hidden md:block flex-1 h-1 bg-zinc-300 relative z-10" />

            {/* Visual Step 4 (Deliver to Warehouse) */}
            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-14 h-14 bg-white shadow-md border border-zinc-200 rounded-full flex items-center justify-center text-zinc-500 group-hover:border-primary group-hover:text-primary transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-zinc-800 mt-3">المستودعات المركزية (SAR)</h4>
              <p className="text-[10px] text-zinc-400 mt-1 w-32 font-bold">الاستلام والمطابقة وحساب التكلفة</p>
            </div>
          </div>
        </section>

        {/* Shipments list */}
        <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-black text-lg text-zinc-900">سجل الشحنات وسلاسل التوريد (المتصل)</h3>
              <p className="text-xs text-zinc-500 font-medium">قائمة الشحنات قيد التشغيل المجلوبة من قاعدة البيانات مباشرة</p>
            </div>
            <Link to="/app/suppliers" className="text-xs font-bold text-primary hover:underline">مراجعة الموردين والشحنات</Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="text-zinc-400 font-bold border-b border-zinc-100 uppercase tracking-wider text-[11px]">
                  <th className="pb-3 text-right">رقم الشحنة</th>
                  <th className="pb-3 text-right">ميناء المنشأ</th>
                  <th className="pb-3 text-center">ميناء الوصول (المملكة)</th>
                  <th className="pb-3 text-center">الناقل الدولي</th>
                  <th className="pb-3 text-center">تاريخ التوصيل المتوقع</th>
                  <th className="pb-3 text-center">الحالة</th>
                  <th className="pb-3 text-left">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {activeShipments?.slice(0, 5).map((ship: any, idx: number) => (
                  <tr key={ship.id || idx} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 font-mono font-bold text-zinc-800">#{ship.id?.substring(0,6).toUpperCase()}</td>
                    <td className="py-3 font-bold text-zinc-950">{ship.originPort || "ميناء غير محدد"}</td>
                    <td className="py-3 text-center text-zinc-700 font-bold">{ship.destinationPort || "ميناء المملكة"}</td>
                    <td className="py-3 text-center text-zinc-500 font-bold">{ship.carrier || "ميرسك / ناقل لوجستي"}</td>
                    <td className="py-3 text-center text-zinc-500 font-bold">
                      {ship.expectedDelivery ? new Date(ship.expectedDelivery).toLocaleDateString('ar-SA') : "-"}
                    </td>
                    <td className="py-3 text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-bold border",
                        ship.status === 'in_transit' ? "bg-blue-50 text-blue-700 border-blue-100" :
                        ship.status === 'customs' ? "bg-amber-50 text-amber-700 border-amber-100" :
                        ship.status === 'delivered' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        "bg-zinc-50 text-zinc-600 border-zinc-100"
                      )}>
                        {ship.status === 'in_transit' ? 'في عرض البحر' : ship.status === 'customs' ? 'جمارك' : 'تم الاستلام'}
                      </span>
                    </td>
                    <td className="py-3 text-left">
                      <Link to={`/app/suppliers`} className="text-[11px] font-black text-blue-600 hover:underline">
                        عرض وتحديث
                      </Link>
                    </td>
                  </tr>
                ))}
                {(!activeShipments || activeShipments.length === 0) && (
                  <tr key="empty-shipments-ops">
                    <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
                      لا توجد شحنات لوجستية نشطة جارية حالياً
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <EmergencyLockdownIndicator navigateToPayroll={() => navigate('/app/payroll')} />

      {[...systemAlerts, ...(dashboardStats?.expiringContractsAlerts || [])].filter(a => !dismissedLocalAlerts.includes(a.id)).length > 0 && (
        <div className="space-y-4">
          {[...systemAlerts, ...(dashboardStats?.expiringContractsAlerts || [])].filter(a => !dismissedLocalAlerts.includes(a.id)).map(alert => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
              dir="rtl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-200">
                  <AlertCircle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-900 mb-1">{alert.title}</h3>
                  <p className="text-sm font-bold text-amber-700">{alert.message}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 relative z-10 w-full md:w-auto shrink-0">
                <button 
                  onClick={async () => {
                     if (!alert.isLocal) {
                        try {
                           await updateDoc(doc(db, "system_alerts", alert.id), { isRead: true });
                        } catch(e){}
                     } else {
                        setDismissedLocalAlerts(prev => [...prev, alert.id]);
                     }
                  }} 
                  className="w-full md:w-auto px-5 py-2.5 bg-white text-amber-600 font-bold text-sm rounded-xl border border-amber-200 hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  تعليم كمقروء
                </button>
                <Link to={alert.actionPath || "/app/payroll"} className="w-full md:w-auto text-center bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-amber-700 transition">
                  {alert.isLocal ? "مراجعة الموظفين" : "انتقال"}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {dashboardStats?.isLockdown && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-rose-600 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border-4 border-rose-200"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-4 rounded-full animate-pulse">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black mb-1">حالة طوارئ: إيقاف الخدمات (Emergency Lockdown)</h2>
              <p className="text-sm font-medium text-rose-100">
                تم تجاوز المدة النظامية (15 يوم) لاعتماد ورفع مسير الرواتب لشهر {dashboardStats.lockdownPeriod}. بعض الخدمات ستظل مقيدة إلى حين المعالجة بملف WPS أو مدد.
              </p>
            </div>
          </div>
          <Link to="/app/payroll" className="shrink-0 bg-white text-rose-600 px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:scale-105 transition-transform flex items-center gap-2">
             الانتقال للرواتب للمعالجة
          </Link>
        </motion.div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">نظرة عامة</h1>
            {isEditing && (
              <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none border border-amber-200">وضع التخصيص</span>
            )}
          </div>
          <p className="text-zinc-500 mt-1 mb-4">مرحباً بك مجدداً، إليك أحدث نشاطات عملك اليوم.</p>

          {!isEditing && (
             <div className="flex bg-zinc-100 p-1 rounded-2xl flex-wrap gap-1 md:w-fit">
                <button onClick={() => setActiveView('ceo')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeView === 'ceo' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>نظرة الإدارة (CEO)</button>
                <button onClick={() => setActiveView('hr')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeView === 'hr' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>شؤون الموظفين (HR)</button>
                <button onClick={() => setActiveView('accountant')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeView === 'accountant' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>المحاسبة والمالية</button>
                <button onClick={() => setActiveView('operations')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeView === 'operations' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>التشغيل وسلاسل الإمداد</button>
             </div>
          )}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={() => isEditing ? saveConfig() : setIsEditing(true)}
            disabled={isSaving}
            className={cn(
              "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg",
              isEditing ? "bg-emerald-600 text-white shadow-emerald-600/20" : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 shadow-zinc-100"
            )}
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEditing ? (
              <Check className="w-5 h-5" />
            ) : (
              <Settings2 className="w-5 h-5" />
            )}
            <span>{isEditing ? "حفظ التغييرات" : "تخصيص الواجهة"}</span>
          </button>
          {!isEditing && (
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Plus className="w-5 h-5" />
              <span>إجراء جديد</span>
            </button>
          )}
          {isEditing && (
            <button 
              onClick={() => {
                setIsEditing(false);
              }}
              className="px-6 py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
            >
              إلغاء
            </button>
          )}
        </div>
      </header>

      {isEditing ? (
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-amber-800 text-sm font-medium">
            يمكنك سحب وإفلات العناصر لتغيير ترتيبها، أو استخدام أيقونة العين لإخفاء/إظهار العناصر.
          </div>
          <Reorder.Group axis="y" values={config} onReorder={setConfig} className="space-y-4">
            {config.map((item) => (
              <Reorder.Item 
                key={item.id} 
                value={item}
                className={cn(
                  "bg-white border p-6 rounded-3xl flex items-center justify-between shadow-sm transition-all",
                  item.visible ? "border-zinc-200" : "opacity-50 border-dashed border-zinc-300 bg-zinc-50"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className="cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 transition-colors">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-zinc-900">{item.title}</h4>
                    <p className="text-xs text-zinc-400 font-medium">{item.visible ? "مرئي في اللوحة الرئيسية" : "مخفي من اللوحة الرئيسية"}</p>
                  </div>
                </div>
                <button 
                  onClick={() => toggleVisibility(item.id)}
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                    item.visible ? "bg-primary/10 text-primary" : "bg-zinc-200 text-zinc-500"
                  )}
                >
                  {item.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      ) : (
        <div className="space-y-8">
          {activeView === 'ceo' && (
            <>
              {config.filter(w => w.visible).map(widget => (
                <React.Fragment key={widget.id}>
                  {renderWidget(widget.id)}
                </React.Fragment>
              ))}
            </>
          )}
          {activeView === 'hr' && renderHRView()}
          {activeView === 'accountant' && renderAccountingView()}
          {activeView === 'operations' && renderOperationsView()}
        </div>
      )}
      
      <AnimatePresence>
        {showWelcomeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setShowWelcomeModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-6 relative">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-4">أهلاً بك في نظام مدارج المتكامل!</h2>
              <p className="text-sm font-medium text-zinc-500 mb-8 leading-relaxed max-w-md">
                لقد تم إعداد مساحة العمل الخاصة بك بنجاح. مدارج يربط مبيعاتك، فواتيرك، رواتب موظفيك والشحن في مكان واحد متصل ومؤتمت. نصيحتنا للبدء هي إضافة عملائك المحتملين أو الحاليين.
              </p>
              <div className="flex gap-4 w-full">
                <Link
                  to="/app/crm"
                  className="flex-1 bg-primary text-white py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  <Users className="w-5 h-5" />
                  الذهاب إلى العملاء المبيعات (CRM)
                </Link>
                <button
                  onClick={() => setShowWelcomeModal(false)}
                  className="px-6 py-4 rounded-xl font-bold text-zinc-500 bg-zinc-100 hover:bg-zinc-200 transition-colors"
                >
                  استكشاف اللوحة
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {isWhatsAppModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setIsWhatsAppModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-right"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-50 pb-4">
                <button onClick={() => setIsWhatsAppModalOpen(false)} className="p-2 hover:bg-zinc-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-black text-lg text-zinc-900">إرسال رسالة واتساب سريعة</h3>
                    <p className="text-xs font-bold text-emerald-600">افتح واجهة واتساب ويب مباشرة بقوالب سعودية مسبقة</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                </div>
              </div>

              <form onSubmit={(e) => {
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
              }} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400">رقم جوال المستلم</label>
                  <div className="flex gap-2" dir="ltr">
                    <span className="bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-2xl text-zinc-600 font-bold flex items-center justify-center text-sm">+966</span>
                    <input 
                      type="text" 
                      required 
                      placeholder="5XXXXXXXX" 
                      value={whatsAppPhone} 
                      onChange={(e) => setWhatsAppPhone(e.target.value)} 
                      className="flex-1 px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400">اختر أحد القوالب الجاهزة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "welcome", title: "ترحيبية", body: "مرحباً بك في مدارج. نسعد بخدمتك وتقديم أفضل الحلول لإدارة أعمالك بنجاح. فريق المبيعات جاهز لمساعدتك." },
                      { id: "invoice", title: "فاتورة", body: "شريكنا العزيز، تم إصدار فاتورتك الضريبية بنجاح. يمكنك الاطلاع عليها وتحميلها عبر المنصة. شكراً لثقتكم." },
                      { id: "followup", title: "متابعة", body: "السلام عليكم، نود الاستفسار عن عرض السعر المقدم لكم مؤخراً، هل لديكم أي ملاحظات أو تعديلات مطلوبة؟ نسعد بخدمتكم." }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        type="button"
                        onClick={() => {
                          setWhatsAppTemplate(t.id);
                          setWhatsAppMessage(t.body);
                        }}
                        className={cn(
                          "p-3 rounded-xl border text-[10px] font-black transition-all text-center",
                          whatsAppTemplate === t.id 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm" 
                            : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        {t.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-zinc-400">نص الرسالة</label>
                  <textarea 
                    rows={4}
                    value={whatsAppMessage}
                    onChange={(e) => setWhatsAppMessage(e.target.value)}
                    className="w-full px-5 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] placeholder:text-zinc-300 text-right leading-relaxed"
                    placeholder="اكتب رسالتك المخصصة هنا..."
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-[1.5rem] font-black shadow-lg shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>إرسال عبر واتساب (Send WhatsApp)</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
