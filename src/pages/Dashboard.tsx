import React, { useEffect, useState } from "react";
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
  X
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
import { Link } from "react-router-dom";
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

interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
}

const DEFAULT_CONFIG: WidgetConfig[] = [
  { id: "quick_actions", title: "الإجراءات السريعة", visible: true },
  { id: "stats", title: "الإحصائيات السريعة", visible: true },
  { id: "payroll", title: "مسيرات الرواتب", visible: true },
  { id: "chart", title: "منحنى المبيعات", visible: true },
  { id: "activity", title: "النشاط الأخير", visible: true },
];

export const AVAILABLE_QUICK_ACTIONS = [
  { id: "create_invoice", label: "إنشاء فاتورة", icon: FileText, path: "/app/invoices/new", color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "add_lead", label: "إضافة عميل محتمل", icon: Users, path: "/app/crm/new", color: "text-blue-500", bg: "bg-blue-50" },
  { id: "unread_chats", label: "المحادثات غير المقروءة", icon: MessageSquare, path: "/app/chat", color: "text-purple-500", bg: "bg-purple-50" },
  { id: "payroll_report", label: "إصدار مسير رواتب", icon: FileCheck, path: "/app/payroll/new", color: "text-amber-500", bg: "bg-amber-50" },
  { id: "add_employee", label: "إضافة موظف", icon: UserPlus, path: "/app/fwcos/new", color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "new_shipment", label: "شحنة جديدة", icon: Package, path: "/app/suppliers/new", color: "text-rose-500", bg: "bg-rose-50" },
];

const DEFAULT_QUICK_ACTIONS = [
  "create_invoice",
  "add_lead",
  "unread_chats",
  "payroll_report"
];

function QuickActionsWidget({ quickActions, setQuickActions, user }: { quickActions: string[], setQuickActions: any, user: any }) {
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
        await updateDoc(doc(db, "users", user.uid), {
          quickActionsConfig: finalActions
        });
        toast.success("تم التحديث بنجاح");
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
  const { user } = useUser();
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [config, setConfig] = useState<WidgetConfig[]>(DEFAULT_CONFIG);
  const [quickActions, setQuickActions] = useState<string[]>(DEFAULT_QUICK_ACTIONS);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeView, setActiveView] = useState<'ceo' | 'hr' | 'accountant'>('ceo');

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
      const leads = snapshot.docs.map(doc => doc.data());
      const revenue = leads.reduce((acc, curr) => acc + (curr.value || 0), 0);
      const wonLeads = leads.filter(l => l.status === 'won').length;
      
      const salesByMonth = leads.reduce((acc: any, lead) => {
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
        leadsCount: leads.length,
        wonLeads,
        chartData: cData,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leads");
    });

    const payrollQuery = query(collection(db, "payroll_runs"), where("userId", "==", user.uid));
    const unsubPayroll = onSnapshot(payrollQuery, (snapshot) => {
      const runs = snapshot.docs.map(doc => doc.data());
      const totalCost = runs.reduce((acc, curr) => acc + (curr.totalGross || 0), 0);
      setDashboardStats((prev: any) => ({
        ...prev,
        payrollCost: totalCost,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "payroll_runs");
    });

    const employeesQuery = query(collection(db, "employees"), where("userId", "==", user.uid));
    const unsubEmployees = onSnapshot(employeesQuery, (snapshot) => {
      const emps = snapshot.docs.map(doc => doc.data());
      const saudiEmployees = emps.filter(e => e.nationality === 'سعودي' || e.nationality === 'Saudi').length;
      setDashboardStats((prev: any) => ({
        ...prev,
        employeesCount: emps.length,
        saudiEmployees: saudiEmployees,
      }));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "employees");
    });

    const invoicesQuery = query(collection(db, "invoices"), where("userId", "==", user.uid));
    const unsubInvoices = onSnapshot(invoicesQuery, (snapshot) => {
      const invs = snapshot.docs.map(doc => doc.data());
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

    return () => {
      unsubLeads();
      unsubLogs();
      unsubPayroll();
      unsubRules();
      unsubEmployees();
      unsubInvoices();
    };
  }, [user]);

  const saveConfig = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), {
        dashboardConfig: config
      });
      toast.success("تم حفظ إعدادات الواجهة بنجاح");
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
        <section key="stats-skeleton" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-2xl bg-zinc-200" />
                <div className="w-16 h-6 rounded-lg bg-zinc-200" />
              </div>
              <div className="w-32 h-4 bg-zinc-200 rounded mt-2 mb-2" />
              <div className="w-24 h-8 bg-zinc-200 rounded mt-1" />
            </div>
          ))}
        </section>
      );
    }

    let currentStats = [];
    if (activeView === 'ceo') {
       currentStats = [
         { id: 'revenue', name: "الصافي المتوقع", value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
         { id: 'compliance', name: "مؤشر الامتثال العام", value: `${dashboardStats?.complianceScore || 0}%`, change: dashboardStats?.trends?.compliance ? `${dashboardStats.trends.compliance}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.compliance || 0) >= 0 ? "up" : "down", icon: FileCheck, color: "text-blue-500", bg: "bg-blue-50" },
         { id: 'payroll_cost', name: "تكلفة الرواتب", value: `${(dashboardStats?.payrollCost || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.payroll ? `${dashboardStats.trends.payroll}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.payroll || 0) >= 0 ? "down" : "up", icon: Users, color: "text-amber-500", bg: "bg-amber-50" },
       ];
    } else if (activeView === 'hr') {
       currentStats = [
         { id: 'nitaqat', name: "نطاقات (نسبة التوطين)", value: `${( (dashboardStats?.saudiEmployees || 0) / (dashboardStats?.employeesCount || 1) * 100).toFixed(1)}%`, change: (dashboardStats?.saudiEmployees / (dashboardStats?.employeesCount || 1)) > 0.3 ? "النطاق الأخضر" : "النطاق الأصفر", trend: "up", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
         { id: 'total_employees', name: "إجمالي الموظفين", value: dashboardStats?.employeesCount?.toString() || "0", change: dashboardStats?.employeesCount ? `${dashboardStats.employeesCount}` : "غير متوفر", trend: "up", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
         { id: 'eosb', name: "التزامات نهاية الخدمة", value: `${( (dashboardStats?.payrollCost || 0) * 0.4).toLocaleString()} ر.س`, change: "غير متوفر", trend: "down", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
       ];
    } else {
       currentStats = [
         { id: 'vat', name: "ضريبة القيمة المضافة", value: `${(dashboardStats?.vatExposure || 0).toLocaleString()} ر.س`, change: "غير متوفر", trend: "up", icon: FileCheck, color: "text-emerald-500", bg: "bg-emerald-50" },
         { id: 'invoices', name: "فواتير معلقة", value: dashboardStats?.pendingInvoices?.toString() || "0", change: dashboardStats?.pendingInvoices ? `${dashboardStats.pendingInvoices}` : "غير متوفر", trend: "down", icon: FileText, color: "text-amber-500", bg: "bg-amber-50" },
         { id: 'revenue_acc', name: "إجمالي الإيرادات", value: `${(dashboardStats?.revenue || 0).toLocaleString()} ر.س`, change: dashboardStats?.trends?.revenue ? `${dashboardStats.trends.revenue}%` : "غير متوفر", trend: parseFloat(dashboardStats?.trends?.revenue || 0) >= 0 ? "up" : "down", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-50" },
       ];
    }

    return (
       <section key="stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {currentStats.map((stat, i) => (
           <motion.div 
             key={stat.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="p-6 bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow relative"
           >
             <div className="flex justify-between items-start mb-4">
               <div className={cn("p-3 rounded-2xl", stat.bg)}>
                 <stat.icon className={cn("w-6 h-6", stat.color)} />
               </div>
               <div className={cn(
                 "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                 stat.trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
               )}>
                 {stat.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                 {stat.change}
               </div>
             </div>
             <p className="text-zinc-500 text-sm font-medium">{stat.name}</p>
             <h3 className="text-2xl font-bold text-zinc-900 mt-1">{stat.value}</h3>
           </motion.div>
         ))}
       </section>
    );
  };

  const toggleVisibility = (id: string) => {
    setConfig(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case "quick_actions":
        return <QuickActionsWidget key="quick_actions" quickActions={quickActions} setQuickActions={setQuickActions} user={user} />;
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
              <button className="text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
                عرض الكل
              </button>
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
                    dashboardStats.recentPayroll.map((run: any) => (
                      <tr key={run.id} className="hover:bg-zinc-50 transition-colors">
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
                    <tr>
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
                     <BarChart data={[
                        { name: "الربع 1", current: 400000, projected: 450000 },
                        { name: "الربع 2", current: 380000, projected: 480000 },
                        { name: "الربع 3", current: 520000, projected: 600000 },
                        { name: "الربع 4", current: 0, projected: 750000 },
                     ]}>
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
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
             <div className="flex bg-zinc-100 p-1 rounded-2xl w-fit">
                <button onClick={() => setActiveView('ceo')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeView === 'ceo' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>نظرة الإدارة (CEO)</button>
                <button onClick={() => setActiveView('hr')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeView === 'hr' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>شؤون الموظفين (HR)</button>
                <button onClick={() => setActiveView('accountant')} className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeView === 'accountant' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>المحاسبة والامتثال</button>
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
          {config.filter(w => w.visible).map(widget => (
            <React.Fragment key={widget.id}>
              {renderWidget(widget.id)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
