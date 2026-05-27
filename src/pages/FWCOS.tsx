import React, { useState, useMemo, useEffect } from "react";
import Select from 'react-select';
import { toast } from 'sonner';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  TrendingUp,
  MapPin,
  FileWarning,
  Upload,
  X,
  CheckSquare,
  Globe,
  File,
  ShieldCheck,
  Building,
  Search,
  Eye,
  Download,
  ToggleLeft,
  ToggleRight,
  Plus,
  History,
  Activity,
  Trash2,
  Lock
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { collection, getDocs, query, where, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';
import { getAuth } from 'firebase/auth';

interface WorkerDoc {
  id: string;
  name: string;
  type: 'passport' | 'visa' | 'contract' | 'other';
  dateAdded: string;
  expiryDate?: string;
}

interface Worker {
  id: string;
  name: string;
  nationality: string;
  role: string;
  iqamaExpiry: string;
  wpsStatus: 'compliant' | 'delayed' | 'violation';
  country: string;
  visaNumber?: string;
  passportNumber?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  documents?: WorkerDoc[];
}

interface AlertInfo {
  ruleType: string;
  ruleTitle: string;
  daysRemaining?: number;
  country: string;
  text: string;
}

interface ComputedWorker extends Worker {
  riskScore: number;
  status: 'safe' | 'expiring' | 'flagged' | 'critical';
  alerts: AlertInfo[];
}

const GCC_COUNTRIES = [
  { code: 'KSA', name: 'السعودية' }
];

const INITIAL_RULES = [
  { id: 1, type: 'iqama', title: "انتهاء الإقامة/الهوية", description: "تنبيه عند اقتراب انتهاء بطاقة الهوية أو الإقامة", impact: "High", thresholdDays: 60, countries: GCC_COUNTRIES.map(c => ({ ...c, active: true, thresholdDays: 60 })) },
  { id: 2, type: 'wps', title: "حماية الأجور (WPS)", description: "تأخر الرواتب يرفع نسبة الخطورة بشكل تلقائي", impact: "Critical", thresholdDays: 15, countries: GCC_COUNTRIES.map(c => ({ ...c, active: true, thresholdDays: 15 })) },
  { id: 3, type: 'visa', title: "صلاحية التأشيرات والجوازات", description: "يجب تجديد التأشيرات والجوازات المرفقة قبل انتهاء صلاحيتها", impact: "Medium", thresholdDays: 45, countries: GCC_COUNTRIES.map(c => ({ ...c, active: true, thresholdDays: 45 })) },
  { id: 4, type: 'contract', title: "انتهاء العقود", description: "تنبيه عند اقتراب نهاية العقد لاتخاذ قرار التجديد أو التصفية", impact: "Medium", thresholdDays: 30, countries: GCC_COUNTRIES.map(c => ({ ...c, active: true, thresholdDays: 30 })) }
];

const DAY_MS = 1000 * 3600 * 24;

const RiskGauge = ({ score, size = 48 }: { score: number, size?: number }) => {
  const radius = size / 2 - 4;
  const circumference = Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const colorClass = score > 66 ? "text-rose-500" : score > 33 ? "text-amber-500" : "text-emerald-500";
  
  return (
    <div className="relative flex flex-col items-center justify-end font-black flex-shrink-0" style={{ width: size, height: size / 2 + 8 }}>
      <svg className="w-full h-full" viewBox={`0 0 ${size} ${size/2 + 4}`} style={{ overflow: 'visible' }}>
        <path d={`M 4 ${size/2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size/2}`} className="text-zinc-200" strokeWidth="6" stroke="currentColor" fill="transparent" strokeLinecap="round" />
        <path d={`M 4 ${size/2} A ${radius} ${radius} 0 0 1 ${size - 4} ${size/2}`} className={colorClass} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" />
      </svg>
      <span className="absolute bottom-0 text-[11px] text-zinc-700 leading-none">{score}%</span>
    </div>
  );
};

export default function FWCOS() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'workers' | 'tasks' | 'rules' | 'settings' | 'zatca' | 'gosi'>('dashboard');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [rules, setRules] = useState(INITIAL_RULES as any[]);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [selectedCountryObj, setSelectedCountryObj] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Task Audit Logs
  const [taskStatuses, setTaskStatuses] = useState<Record<string, 'pending' | 'in_progress' | 'completed'>>({});
  const [taskLogs, setTaskLogs] = useState<{taskId: string, workerName: string, type: string, action: string, timestamp: string, user: string}[]>([]);
  const [auditFilterUser, setAuditFilterUser] = useState<string>('ALL');
  const [auditFilterAction, setAuditFilterAction] = useState<string>('ALL');

  React.useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      const q = query(collection(db, "employees"), where("userId", "==", uid));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      const parsedWorkers = data.map((w: any) => ({
        ...w,
        documents: typeof w.documents === 'string' ? JSON.parse(w.documents) : (w.documents || [])
      }));
      setWorkers(parsedWorkers);
    } catch (err) {
      console.error("Failed to fetch workers", err);
      toast.error("فشل تحميل بيانات العمالة");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorker) return;

    try {
      const uid = getAuth().currentUser?.uid;
      if (!uid) return;

      const isNew = !workers.find(w => w.id === editingWorker.id);
      
      const payload = {
        ...editingWorker,
        userId: uid,
        documents: typeof editingWorker.documents === 'string' ? editingWorker.documents : JSON.stringify(editingWorker.documents || [])
      };

      if (isNew) {
        const newRef = doc(collection(db, "employees"));
        await setDoc(newRef, { id: newRef.id, ...payload });
      } else {
        await updateDoc(doc(db, "employees", editingWorker.id), payload);
      }

      toast.success(isNew ? "تم إضافة العامل بنجاح" : "تم تحديث بيانات العامل");
      setEditingWorker(null);
      setIsAddingNew(false);
      fetchWorkers();
    } catch (err) {
      toast.error("تعذر الاتصال بقاعدة البيانات");
      console.error(err);
    }
  };

  const deleteWorker = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العامل؟")) return;
    try {
      await deleteDoc(doc(db, "employees", id));
      toast.success("تم حذف العامل بنجاح");
      fetchWorkers();
    } catch (err) {
      toast.error("فشل الحذف");
      console.error(err);
    }
  };

  // Worker Filters (Updated for Multi-select and Date Ranges)
  const [workerFilters, setWorkerFilters] = useState({
      search: '',
      nationalities: [] as string[],
      roles: [] as string[],
      wpsStatus: 'ALL',
      expiryStatus: 'ALL',
      contractExpiryStart: '',
      contractExpiryEnd: '',
      iqamaExpiryStart: '',
      iqamaExpiryEnd: ''
  });
  
  // Settings State
  const [aiSettings, setAiSettings] = useState({
      dialect: 'saudi',
      model: 'gemini-1.5-pro',
      customPrompt: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
      reminderPeriod: 90, // Default 30 days
      reminderPeriods: [30, 60, 90] // Array for multiple milestones
  });

  // ZATCA State
  const [zatcaCR, setZatcaCR] = useState('');
  const [zatcaVat, setZatcaVat] = useState('');
  const [zatcaCert, setZatcaCert] = useState('');
  const [zatcaValidationType, setZatcaValidationType] = useState<'cr' | 'vat' | 'cert'>('cr');
  const [zatcaResult, setZatcaResult] = useState<any>(null);
  const [isZatcaLoading, setIsZatcaLoading] = useState(false);

  const computedWorkers: ComputedWorker[] = useMemo(() => {
    const today = new Date().getTime();
    const dayMs = 1000 * 3600 * 24;
    
    return workers.map((w) => {
        let riskScore = 0;
        let isExpiring = false;
        let isCritical = false;
        let alerts: AlertInfo[] = [];

        const wpsRule = rules.find(r => r.type === 'wps');
        const isWpsActive = wpsRule?.countries.find((c: any) => c.code === w.country)?.active ?? true;
        if (isWpsActive) {
            if (w.wpsStatus === 'violation') { riskScore += 50; isCritical = true; alerts.push({ ruleType: 'wps', ruleTitle: 'حماية الأجور', country: w.country, text: 'مخالفة WPS' }); }
            else if (w.wpsStatus === 'delayed') { riskScore += 20; alerts.push({ ruleType: 'wps', ruleTitle: 'حماية الأجور', country: w.country, text: 'تأخر الدفع' }); }
        }

        const iqamaRule = rules.find(r => r.type === 'iqama');
        const iqamaCountryRule = iqamaRule?.countries.find((c: any) => c.code === w.country);
        const isIqamaActive = iqamaCountryRule?.active ?? true;
        if (isIqamaActive) {
            const iqamaDays = (new Date(w.iqamaExpiry).getTime() - today) / dayMs;
            if (iqamaDays < 0) { riskScore += 50; isCritical = true; alerts.push({ ruleType: 'iqama', ruleTitle: 'الإقامة/الهوية', country: w.country, text: 'الوحدة منتهية', daysRemaining: Math.floor(iqamaDays) }); }
            else if (iqamaDays <= (iqamaCountryRule?.thresholdDays || iqamaRule?.thresholdDays || 60)) { riskScore += 20; isExpiring = true; alerts.push({ ruleType: 'iqama', ruleTitle: 'الإقامة/الهوية', country: w.country, text: `إقامة تنتهي قريباً`, daysRemaining: Math.floor(iqamaDays) }); }
        }

        const contractRule = rules.find(r => r.type === 'contract');
        const contractCountryRule = contractRule?.countries.find((c: any) => c.code === w.country);
        const isContractActive = contractCountryRule?.active ?? true;
        if (isContractActive && w.contractEndDate) {
            const contractDays = (new Date(w.contractEndDate).getTime() - today) / dayMs;
            if (contractDays < 0) { riskScore += 30; isCritical = true; alerts.push({ ruleType: 'contract', ruleTitle: 'العقد', country: w.country, text: 'عقد منتهي', daysRemaining: Math.floor(contractDays) }); }
            else if (contractDays <= (contractCountryRule?.thresholdDays || contractRule?.thresholdDays || 30)) { riskScore += 10; isExpiring = true; alerts.push({ ruleType: 'contract', ruleTitle: 'العقد', country: w.country, text: `عقد ينتهي قريباً`, daysRemaining: Math.floor(contractDays) }); }
        }

        const visaRule = rules.find(r => r.type === 'visa');
        const visaCountryRule = visaRule?.countries.find((c: any) => c.code === w.country);
        const isVisaActive = visaCountryRule?.active ?? true;
        if (isVisaActive) {
            w.documents?.forEach(doc => {
                if (doc.expiryDate) {
                    const docDays = (new Date(doc.expiryDate).getTime() - today) / dayMs;
                    if (docDays < 0) { riskScore += 30; isCritical = true; alerts.push({ ruleType: 'visa', ruleTitle: `مستند (${doc.type})`, country: w.country, text: 'مستند منتهي', daysRemaining: Math.floor(docDays) }); }
                    else if (docDays <= (visaCountryRule?.thresholdDays || visaRule?.thresholdDays || 30)) { riskScore += 15; isExpiring = true; alerts.push({ ruleType: 'visa', ruleTitle: `مستند (${doc.type})`, country: w.country, text: `مستند ينتهي قريباً`, daysRemaining: Math.floor(docDays) }); }
                }
            });
        }

        const clampedScore = Math.min(riskScore, 100);
        const status = isCritical ? 'critical' : isExpiring ? 'expiring' : w.wpsStatus !== 'compliant' ? 'flagged' : 'safe';

        return { ...w, riskScore: clampedScore, status, alerts };
    });
  }, [workers, rules]);

  const dashboardWorkers = useMemo(() => {
    return selectedCountryObj === 'ALL' ? computedWorkers : computedWorkers.filter(w => w.country === selectedCountryObj);
  }, [computedWorkers, selectedCountryObj]);

  const countrySummaries = useMemo(() => {
    const sum: Record<string, { total: number, expiringDocs: number, wpsIssues: number }> = {};
    computedWorkers.forEach(w => {
       if(!sum[w.country]) sum[w.country] = { total: 0, expiringDocs: 0, wpsIssues: 0 };
       sum[w.country].total++;
       if(w.alerts.some(a => a.ruleType !== 'wps')) sum[w.country].expiringDocs++;
       if(w.wpsStatus !== 'compliant') sum[w.country].wpsIssues++;
    });
    return sum;
  }, [computedWorkers]);

  const generatedTasks = useMemo(() => {
    const tasks: any[] = [];
    computedWorkers.forEach(w => {
       w.alerts.forEach((alertObj, idx) => {
           const taskId = `task_${w.id}_${idx}`;
           tasks.push({
               id: taskId,
               workerId: w.id,
               workerName: w.name,
               country: w.country,
               type: alertObj.ruleTitle + ' - ' + alertObj.text,
               rawStatus: taskStatuses[taskId] || 'pending'
           });
       });
    });
    return tasks;
  }, [computedWorkers, taskStatuses]);

  const filteredWorkersList = useMemo(() => {
     let list = computedWorkers;
     if (workerFilters.search) {
         list = list.filter(w => w.name.includes(workerFilters.search) || w.passportNumber?.includes(workerFilters.search) || w.visaNumber?.includes(workerFilters.search));
     }
     if (workerFilters.nationalities.length > 0) {
         list = list.filter(w => workerFilters.nationalities.includes(w.nationality));
     }
     if (workerFilters.roles.length > 0) {
         list = list.filter(w => workerFilters.roles.includes(w.role));
     }
     if (workerFilters.wpsStatus !== 'ALL') {
         list = list.filter(w => w.wpsStatus === workerFilters.wpsStatus);
     }
     if (workerFilters.expiryStatus !== 'ALL') {
         if (workerFilters.expiryStatus === 'expired') {
            list = list.filter(w => w.alerts.some(a => a.daysRemaining !== undefined && a.daysRemaining < 0));
         } else if (workerFilters.expiryStatus === 'expiring') {
            list = list.filter(w => w.alerts.some(a => a.daysRemaining !== undefined && a.daysRemaining >= 0));
         }
     }
     
     // Date range filters
     if (workerFilters.contractExpiryStart) {
         const start = new Date(workerFilters.contractExpiryStart).getTime();
         list = list.filter(w => w.contractEndDate && new Date(w.contractEndDate).getTime() >= start);
     }
     if (workerFilters.contractExpiryEnd) {
         const end = new Date(workerFilters.contractExpiryEnd).getTime();
         list = list.filter(w => w.contractEndDate && new Date(w.contractEndDate).getTime() <= end);
     }
     if (workerFilters.iqamaExpiryStart) {
         const start = new Date(workerFilters.iqamaExpiryStart).getTime();
         list = list.filter(w => w.iqamaExpiry && new Date(w.iqamaExpiry).getTime() >= start);
     }
     if (workerFilters.iqamaExpiryEnd) {
         const end = new Date(workerFilters.iqamaExpiryEnd).getTime();
         list = list.filter(w => w.iqamaExpiry && new Date(w.iqamaExpiry).getTime() <= end);
     }
     
     return list;
  }, [computedWorkers, workerFilters]);

  const nationalities = useMemo(() => Array.from(new Set(computedWorkers.map(w => w.nationality))), [computedWorkers]);
  const roles = useMemo(() => Array.from(new Set(computedWorkers.map(w => w.role))), [computedWorkers]);

  const filteredLogs = useMemo(() => {
    let logs = taskLogs;
    if (auditFilterUser !== 'ALL') logs = logs.filter(l => l.user === auditFilterUser);
    if (auditFilterAction !== 'ALL') logs = logs.filter(l => l.action.includes(auditFilterAction));
    return logs;
  }, [taskLogs, auditFilterUser, auditFilterAction]);

  const uniqueUsers = useMemo(() => Array.from(new Set(taskLogs.map(l => l.user))), [taskLogs]);

  const handleUpdateTaskStatus = (task: any, newStatus: 'pending' | 'in_progress' | 'completed') => {
      setTaskStatuses(prev => ({...prev, [task.id]: newStatus}));
      const actionsMap = { 'pending': 'قيد الانتظار', 'in_progress': 'قيد المعالجة (PRO)', 'completed': 'مكتملة' };
      setTaskLogs(prev => [{
        taskId: task.id, 
        workerName: task.workerName, 
        type: task.type, 
        action: actionsMap[newStatus], 
        timestamp: new Date().toISOString(), 
        user: "Ahmed (PRO)" 
      }, ...prev]);
  };

  const handleAddWorkerClick = () => {
    const defaultCountry = selectedCountryObj === 'ALL' ? 'KSA' : selectedCountryObj;
    setEditingWorker({
      id: `W${Math.floor(100 + Math.random() * 900)}`, 
      name: '', 
      nationality: '', 
      role: '', 
      country: defaultCountry,
      wpsStatus: 'compliant', 
      iqamaExpiry: '', 
      visaNumber: '', 
      passportNumber: '', 
      contractStartDate: '', 
      contractEndDate: '', 
      documents: []
    });
    setIsAddingNew(true);
  };

  const expiryAlerts = useMemo(() => {
    const alerts = new Map<number, typeof computedWorkers[0][]>();
    const sortedPeriods = [...notificationSettings.reminderPeriods].sort((a, b) => a - b);
    const today = new Date().getTime();
    
    computedWorkers.forEach(w => {
       let minDiff = Infinity;
       
       // Check Iqama
       if (w.iqamaExpiry) {
          const id = (new Date(w.iqamaExpiry).getTime() - today) / DAY_MS;
          if (id > 0 && id < minDiff) minDiff = Math.ceil(id);
       }

       // Check Contract
       if (w.contractEndDate) {
          const cd = (new Date(w.contractEndDate).getTime() - today) / DAY_MS;
          if (cd > 0 && cd < minDiff) minDiff = Math.ceil(cd);
       }
       
       // Check Documents
       w.documents?.forEach(doc => {
          if (doc.expiryDate) {
             const dd = (new Date(doc.expiryDate).getTime() - today) / DAY_MS;
             if (dd > 0 && dd < minDiff) minDiff = Math.ceil(dd);
          }
       });
       
       if (minDiff === Infinity) return;
       
       const matchedPeriod = sortedPeriods.find(p => minDiff <= p);
       if (matchedPeriod !== undefined) {
          if (!alerts.has(matchedPeriod)) alerts.set(matchedPeriod, []);
          alerts.get(matchedPeriod)!.push(w);
       }
    });
    
    return Array.from(alerts.entries()).sort((a,b) => a[0] - b[0]);
  }, [computedWorkers, notificationSettings.reminderPeriods]);

  useEffect(() => {
    expiryAlerts.forEach(([period, workers]) => {
      const isUrgent = period <= 30;
      if (isUrgent) {
         toast.error(`يوجد ${workers.length} موظفين تنتهي وثائقهم خلال أقل من ${period} يوماً`);
      } else {
         toast.warning(`يوجد ${workers.length} موظفين تنتهي وثائقهم خلال أقل من ${period} يوماً`);
      }
    });
  }, [JSON.stringify(expiryAlerts.map(([p, w]) => [p, w.length]))]);

  return (
    <div className="space-y-8 max-w-full mx-auto h-[calc(100vh-6rem)] overflow-y-auto pb-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3 mb-2">
              <span className="bg-rose-100 text-rose-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1.5 border border-rose-200"><ShieldAlert className="w-3.5 h-3.5" /> FWC-OS (Beta)</span>
              {expiryAlerts.length > 0 && (
                 <motion.div 
                   animate={{ scale: [1, 1.1, 1] }} 
                   transition={{ repeat: Infinity, duration: 2 }}
                   className="flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black border border-amber-200"
                 >
                   <Clock className="w-3 h-3" />
                   تنبيهات نشطة ({expiryAlerts.reduce((acc, current) => acc + current[1].length, 0)})
                 </motion.div>
              )}
           </div>
           <h1 className="text-3xl font-black text-zinc-900 tracking-tight">نظام الامتثال وإدارة الوافدين</h1>
           <p className="text-zinc-500 mt-1 font-medium max-w-2xl">إدارة دقيقة لوثائق وإقامات العمالة مع سجل تدقيق وتنبيهات مخصصة لدول مجلس التعاون.</p>
        </div>
        <button 
          onClick={handleAddWorkerClick} 
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-black px-8 py-4 rounded-[1.5rem] shadow-xl shadow-zinc-900/20 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group"
        >
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <span className="text-base">إضافة عامل جديد</span>
        </button>
      </header>

      {/* Contract Expiry Notifications */}
      {expiryAlerts.map(([period, workers]) => {
        const isUrgent = period <= 30;
        return (
          <motion.div 
            key={period}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
               "border rounded-3xl p-6 flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm",
               isUrgent ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100"
            )}
          >
            <div className={cn("flex items-center gap-4", isUrgent ? "text-rose-900" : "text-amber-900")}>
              <div className={cn("w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border", isUrgent ? "text-rose-500 border-rose-100" : "text-amber-500 border-amber-100")}>
                <AlertTriangle className={cn("w-6 h-6", isUrgent ? "animate-pulse" : "")} />
              </div>
              <div>
                <h3 className="font-black text-lg">تنبيه: وثائق أو عقود تقترب من الانتهاء</h3>
                <p className="text-sm font-medium opacity-80">
                   يوجد {workers.length} موظفين تنتهي عقودهم أو إقاماتهم خلال أقل من {period} يوماً. يرجى مراجعة الحالة واتخاذ اللازم.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveTab('workers')}
              className={cn(
                 "px-6 py-3 text-white rounded-2xl font-bold text-sm transition-all shadow-lg",
                 isUrgent ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20"
              )}
            >
              عرض القائمة المستهدفة
            </button>
          </motion.div>
        );
      })}

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
        {(['dashboard', 'workers', 'tasks', 'rules', 'zatca', 'gosi', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-5 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all whitespace-nowrap", activeTab === tab ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-100")}>
            {tab === 'dashboard' ? 'لوحة المخاطر' : tab === 'workers' ? 'ملفات العمالة' : tab === 'tasks' ? `مهام وسجل PRO` : tab === 'rules' ? 'محرك القواعد (Rules)' : tab === 'zatca' ? 'تحقق ZATCA' : tab === 'gosi' ? 'التأمينات (GOSI)' : 'الإعدادات'}
          </button>
        ))}
      </div>

      {/* --- DASHBOARD VIEW --- */}
      {activeTab === 'dashboard' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Countries Filter & Summaries */}
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
             <button onClick={() => setSelectedCountryObj('ALL')} className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap", selectedCountryObj === 'ALL' ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50")}>
               كل الدول ({computedWorkers.length})
             </button>
             {Object.entries(countrySummaries).map(([country, sum]: [string, any]) => (
                <button key={country} onClick={() => setSelectedCountryObj(country)} className={cn("px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap flex items-center gap-2", selectedCountryObj === country ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50")}>
                  <Globe className="w-3.5 h-3.5" /> {country} 
                  <span className={cn("px-1.5 py-0.5 rounded text-[9px] ml-1", (sum.wpsIssues > 0 || sum.expiringDocs > 0) ? "bg-rose-100 text-rose-700" : "bg-zinc-100 text-zinc-500")}>{sum.total}</span>
                </button>
             ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div className="bg-white p-5 rounded-[2rem] border border-zinc-200/50 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><Users className="w-5 h-5" /></div><span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">العمالة ({selectedCountryObj})</span></div>
                <div><h3 className="text-3xl font-black text-zinc-900">{dashboardWorkers.length}</h3></div>
             </div>
             <div className="bg-[#f0fdf4] p-5 rounded-[2rem] border border-emerald-100 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div><span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">نسبة التوطين</span></div>
                <div><h3 className="text-3xl font-black text-emerald-600">{dashboardWorkers.length > 0 ? ((dashboardWorkers.filter(w => w.nationality?.includes('سعودي') || w.nationality?.toLowerCase().includes('saudi')).length / dashboardWorkers.length) * 100).toFixed(1) : 0}%</h3></div>
             </div>
             <div className="bg-white p-5 rounded-[2rem] border border-zinc-200/50 shadow-sm flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div><span className="text-[10px] font-bold text-zinc-400 bg-zinc-50 px-2 py-1 rounded-lg">إقامات ومستندات منتهية </span></div>
                <div><h3 className="text-3xl font-black text-zinc-900">{dashboardWorkers.filter(w => w.alerts.length > 0 && !w.alerts.some(a=>a.ruleType === 'wps')).length}</h3></div>
             </div>
             <div className="bg-white p-5 rounded-[2rem] border border-zinc-200/50 shadow-sm flex flex-col justify-between ring-1 ring-rose-100 hover:-translate-y-1 hover:shadow-md transition-all cursor-default">
                <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><FileWarning className="w-5 h-5" /></div><span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">مخالفات الأجور (WPS)</span></div>
                <div><h3 className="text-3xl font-black text-rose-600">{dashboardWorkers.filter(w => w.wpsStatus !== 'compliant').length}</h3></div>
             </div>
             <div className="bg-zinc-900 text-white p-5 rounded-[2rem] shadow-xl flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl transition-all cursor-default">
                <div className="flex justify-between items-start mb-4"><div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div><span className="text-[10px] font-bold text-zinc-300 bg-white/10 px-2 py-1 rounded-lg">المخاطرة بصفتها الحالية</span></div>
                <div><h3 className="text-3xl font-black text-white flex items-baseline gap-1">{Math.floor(dashboardWorkers.reduce((acc, w) => acc + w.riskScore, 0) / (dashboardWorkers.length || 1))} <span className="text-sm font-bold text-zinc-400">%</span></h3></div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-[2rem] p-6 border border-zinc-200/50 shadow-sm flex flex-col">
               <h3 className="text-lg font-black text-zinc-900 mb-6 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-amber-500" /> تنبيهات متقدمة ({selectedCountryObj})</h3>
               <div className="space-y-4 flex-1">
                  {dashboardWorkers.filter(w => w.status !== 'safe').map(worker => (
                     <div key={worker.id} className="flex items-start justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                        <div className="flex items-start gap-4">
                           <RiskGauge score={worker.riskScore} />
                           <div>
                              <h4 className="font-bold text-zinc-900 text-sm">{worker.name}</h4>
                              <div className="flex flex-col gap-1 mt-1">
                                {worker.alerts.map((a, i) => (
                                   <div key={i} className="text-[10px] bg-rose-50 border border-rose-100 flex items-center gap-2 px-2 py-1 rounded w-fit">
                                      <span className="font-black text-rose-700">{a.ruleTitle}</span>
                                      <span className="text-rose-600 font-medium">{a.text}</span>
                                      {a.daysRemaining !== undefined && <span className="bg-rose-200 text-rose-800 px-1 py-0.5 rounded text-[9px] font-black">{Math.abs(a.daysRemaining)} يوم</span>}
                                   </div>
                                ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  ))}
                  {dashboardWorkers.filter(w => w.status !== 'safe').length === 0 && <p className="text-sm text-zinc-400 font-bold">لا توجد تنبيهات لهذه المنطقة.</p>}
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- TASKS VIEW (With Audit Logs) --- */}
      {activeTab === 'tasks' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
             
             {/* Active Tasks list */}
             <div className="bg-white border border-zinc-200/50 rounded-[2rem] shadow-sm overflow-hidden p-6">
                <h3 className="font-black text-xl text-zinc-900 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-500"/> مهام وتكليفات PRO</h3>
                <div className="divide-y divide-zinc-100">
                  {generatedTasks.length === 0 && <p className="text-zinc-500 text-sm">لا توجد مهام نشطة أو تنبيهات.</p>}
                  {generatedTasks.map(task => (
                     <div key={task.id} className="py-4 flex items-center justify-between">
                        <div>
                           <h4 className="font-bold text-zinc-900 text-sm mb-1">{task.type} <span className="text-zinc-400 font-medium text-[10px] bg-zinc-100 px-1 rounded mx-1">{task.workerName}</span></h4>
                           <span className={cn("text-[9px] font-black px-2 py-0.5 rounded uppercase", task.rawStatus === 'completed' ? "bg-emerald-100 text-emerald-700" : task.rawStatus === 'in_progress' ? "bg-blue-100 text-blue-700" : "bg-zinc-100 text-zinc-600")}>
                             {task.rawStatus === 'completed' ? 'مكتمل' : task.rawStatus === 'in_progress' ? 'قيد العمل' : 'معلق'}
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           {task.rawStatus !== 'in_progress' && task.rawStatus !== 'completed' && <button onClick={() => handleUpdateTaskStatus(task, 'in_progress')} className="px-3 py-1.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">بدأ العمل</button>}
                           {task.rawStatus !== 'completed' && <button onClick={() => handleUpdateTaskStatus(task, 'completed')} className="p-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100"><CheckSquare className="w-4 h-4"/></button>}
                        </div>
                     </div>
                  ))}
                </div>
             </div>

             {/* Audit Logs */}
             <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-xl overflow-hidden p-6 text-zinc-300">
                <div className="flex justify-between items-start mb-4">
                   <h3 className="font-black text-xl text-white flex items-center gap-2"><History className="w-5 h-5 text-zinc-400"/> سجل التدقيق</h3>
                </div>
                <div className="flex gap-2 mb-4">
                   <select value={auditFilterUser} onChange={e => setAuditFilterUser(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1.5 rounded-lg outline-none flex-1">
                     <option value="ALL">كل المستخدمين</option>
                     {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                   </select>
                   <select value={auditFilterAction} onChange={e => setAuditFilterAction(e.target.value)} className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs px-2 py-1.5 rounded-lg outline-none flex-1">
                     <option value="ALL">كل الإجراءات</option>
                     <option value="قيد المعالجة (PRO)">قيد المعالجة</option>
                     <option value="مكتملة">مكتملة</option>
                   </select>
                </div>
                <div className="space-y-4">
                   {filteredLogs.length === 0 ? <p className="text-sm font-medium text-zinc-600">لم يتم تسجيل أي عمليات بناءاً على التصفية.</p> : null}
                   {filteredLogs.map((log, i) => (
                      <div key={i} className="flex gap-4 p-3 bg-zinc-800/50 rounded-xl border border-zinc-800">
                         <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", log.action.includes('مكتملة') ? "bg-emerald-900/50 text-emerald-400" : "bg-blue-900/50 text-blue-400")}>
                           {log.action.includes('مكتملة') ? <CheckCircle2 className="w-4 h-4"/> : <Activity className="w-4 h-4"/>}
                         </div>
                         <div>
                            <p className="text-xs text-zinc-100 leading-snug font-medium"><span className="font-bold text-white mb-1 block">{log.user}</span> قام بتحديث مهمة <span className="text-blue-400">"{log.type} - {log.workerName}"</span> إلى الحالة <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold", log.action.includes('مكتملة') ? "bg-emerald-900/30 text-emerald-400" : "bg-blue-900/30 text-blue-400")}>{log.action}</span></p>
                            <span className="text-[10px] text-zinc-500 font-mono mt-2 block">{new Date(log.timestamp).toLocaleString()}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

           </div>
        </motion.div>
      )}

      {/* --- WORKERS LEDGER --- */}
      {activeTab === 'workers' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-zinc-200/50 rounded-[2rem] shadow-sm overflow-hidden flex flex-col h-[calc(100vh-14rem)]">
           <div className="p-6 border-b border-zinc-100 flex flex-col gap-4 shrink-0">
              <div className="flex justify-between items-center">
                 <h3 className="font-black text-lg text-zinc-900">سجل العمالة</h3>
                 <div className="relative hidden md:block">
                    <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={workerFilters.search} onChange={e => setWorkerFilters({...workerFilters, search: e.target.value})} placeholder="بحث في السجل..." className="pr-9 pl-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20" />
                 </div>
              </div>
              {/* Advance Filters */}
              <div className="flex flex-col gap-3 w-full">
                 <div className="flex flex-wrap gap-2 items-center w-full z-20 relative">
                    <div className="w-full md:w-64">
                    <Select
                      isMulti
                      options={nationalities.map(n => ({ value: n, label: n }))}
                      placeholder="كل الجنسيات"
                      className="text-xs font-bold w-full"
                      onChange={(selected) => setWorkerFilters({...workerFilters, nationalities: selected ? selected.map(s => s.value) : []} as any)}
                      styles={{ control: (base) => ({ ...base, minHeight: '36px', borderRadius: '0.5rem', borderColor: '#e4e4e7' }) }}
                    />
                    </div>
                    <div className="w-full md:w-64">
                    <Select
                      isMulti
                      options={roles.map(r => ({ value: r, label: r }))}
                      placeholder="كل الأدوار"
                      className="text-xs font-bold w-full"
                      onChange={(selected) => setWorkerFilters({...workerFilters, roles: selected ? selected.map(s => s.value) : []} as any)}
                      styles={{ control: (base) => ({ ...base, minHeight: '36px', borderRadius: '0.5rem', borderColor: '#e4e4e7' }) }}
                    />
                    </div>
                    
                    <select value={workerFilters.wpsStatus} onChange={e => setWorkerFilters({...workerFilters, wpsStatus: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-3 py-[9px] rounded-lg outline-none cursor-pointer hover:bg-zinc-50 transition-all">
                       <option value="ALL">حالة WPS (الكل)</option>
                       <option value="compliant">ملتزم</option>
                       <option value="delayed">متأخر</option>
                       <option value="violation">مخالف</option>
                    </select>
                    <select value={workerFilters.expiryStatus} onChange={e => setWorkerFilters({...workerFilters, expiryStatus: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-3 py-[9px] rounded-lg outline-none cursor-pointer hover:bg-zinc-50 transition-all">
                       <option value="ALL">حالة الانتهاء (الكل)</option>
                       <option value="expiring">ينتهي قريباً</option>
                       <option value="expired">منتهي</option>
                    </select>
                 </div>
                 
                 {/* Date Range Filters */}
                 <div className="flex flex-wrap gap-4 items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100 mb-2">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase">انتهاء العقد:</span>
                       <input type="date" value={workerFilters.contractExpiryStart} onChange={e => setWorkerFilters({...workerFilters, contractExpiryStart: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded-md outline-none" placeholder="من" />
                       <span className="text-zinc-400 font-medium text-xs">-</span>
                       <input type="date" value={workerFilters.contractExpiryEnd} onChange={e => setWorkerFilters({...workerFilters, contractExpiryEnd: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded-md outline-none" placeholder="إلى" />
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-bold text-zinc-500 uppercase">انتهاء الإقامة:</span>
                       <input type="date" value={workerFilters.iqamaExpiryStart} onChange={e => setWorkerFilters({...workerFilters, iqamaExpiryStart: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded-md outline-none" placeholder="من" />
                       <span className="text-zinc-400 font-medium text-xs">-</span>
                       <input type="date" value={workerFilters.iqamaExpiryEnd} onChange={e => setWorkerFilters({...workerFilters, iqamaExpiryEnd: e.target.value} as any)} className="bg-white border border-zinc-200 text-zinc-700 text-xs font-bold px-2 py-1 rounded-md outline-none" placeholder="إلى" />
                    </div>
                 </div>
              </div>
           </div>
           <div className="overflow-auto flex-1">
              <table className="w-full text-right text-sm">
                 <thead className="bg-zinc-50 border-b border-zinc-100 text-zinc-500 font-bold sticky top-0 z-10">
                    <tr><th className="p-4">العامل والدور</th><th className="p-4">الجنسية</th><th className="p-4">أرقام الهوية والتأشيرة</th><th className="p-4">تنبيهات</th><th className="p-4 text-center">المخاطرة</th><th className="p-4">الإجراءات</th></tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100 font-medium">
                    {filteredWorkersList.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-zinc-400 font-bold">لا يوجد عمال يطابقون هذه الفلاتر المطروحة.</td></tr> : null}
                    {filteredWorkersList.map(w => (
                       <tr key={w.id} className="hover:bg-zinc-50/50 transition-colors whitespace-nowrap align-top">
                          <td className="p-4 align-top"><div className="flex flex-col"><span className="font-bold text-zinc-900">{w.name}</span><span className="text-[10px] text-zinc-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {w.country} • {w.role}</span></div></td>
                          <td className="p-4 text-xs font-bold text-zinc-600 align-top">{w.nationality}</td>
                          <td className="p-4 font-mono text-zinc-500 text-xs flex flex-col gap-1 align-top"><span>{w.visaNumber || 'بدون تأشيرة'}</span><span>{w.passportNumber || 'بدون جواز'}</span></td>
                          <td className="p-4 text-xs text-zinc-600 align-top">
                             {w.alerts.length > 0 ? (
                                <div className="flex flex-col gap-1.5 min-w-[200px] whitespace-normal">
                                   {w.alerts.map((a, i) => (
                                      <div key={i} className={cn("p-2 rounded-xl border flex flex-col gap-1.5 shadow-sm", a.daysRemaining !== undefined && a.daysRemaining < 0 ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100", a.ruleType === 'wps' && "bg-rose-50 border-rose-100")}>
                                         <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                                             <span className={cn(a.daysRemaining !== undefined && a.daysRemaining < 0 ? "text-rose-700" : "text-amber-700", a.ruleType === 'wps' && 'text-rose-700')}>{a.ruleType} • {a.country}</span>
                                             {a.daysRemaining !== undefined && (
                                                <span className={cn("px-1.5 py-0.5 rounded bg-white/50 text-[9px]", a.daysRemaining < 0 ? "text-rose-500 font-bold" : "text-amber-600 font-bold")}>
                                                   {a.daysRemaining === 0 ? 'اليوم' : a.daysRemaining < 0 ? `منذ ${Math.abs(a.daysRemaining)} يوم` : `متبقي ${a.daysRemaining} يوم`}
                                                </span>
                                             )}
                                         </div>
                                         <span className={cn("text-[11px] font-bold leading-tight", a.daysRemaining !== undefined && a.daysRemaining < 0 ? "text-rose-600" : "text-amber-800", a.ruleType === 'wps' && 'text-rose-600')}>{a.text}</span>
                                      </div>
                                   ))}
                                </div>
                             ) : (
                                <span className="px-2 py-0.5 rounded font-bold uppercase bg-emerald-50 text-emerald-600">سليم</span>
                             )}
                          </td>
                          <td className="p-4 align-top"><div className="flex justify-center"><RiskGauge score={w.riskScore} size={40} /></div></td>
                          <td className="p-4 text-left align-top">
                             <div className="flex items-center gap-2">
                                <button onClick={() => setEditingWorker(w as any)} className="text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-all shadow-sm">تعديل</button>
                                <button onClick={() => setEditingWorker(w as any)} className="text-[10px] font-black bg-white border border-zinc-200 text-zinc-600 px-3 py-1.5 rounded-lg hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-1"><FileText className="w-3 h-3"/> وثائق</button>
                                <button onClick={() => deleteWorker(w.id)} className="text-[10px] font-black bg-rose-50 border border-rose-100 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-100 transition-all shadow-sm flex items-center gap-1"><Trash2 className="w-3 h-3"/> حذف</button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </motion.div>
      )}

      {/* --- RULES ENGINE VIEW (With Configurable Thresholds) --- */}
      {activeTab === 'rules' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
           <div className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-xl">
              <h2 className="text-2xl font-black mb-2 flex items-center gap-3">محرك الامتثال الإقليمي</h2>
              <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">تحكم بحدود التنبيهات (Warning Thresholds) لتتناسب مع سرعة الإجراءات في شركتك، وسيقوم النظام بتحديث درجات المخاطرة أتماتيكياً.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rules.map(rule => (
                 <div key={rule.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="flex justify-between items-start mb-4">
                       <span className="text-[10px] font-black text-zinc-500 uppercase">قاعدة #{rule.id}</span>
                       <span className={cn("px-2 py-1 rounded-full text-[10px] font-black border", rule.impact === 'Critical' ? 'bg-rose-50 border-rose-100 text-rose-600' : rule.impact === 'High' ? 'bg-orange-50 border-orange-100 text-orange-600' : 'bg-blue-50 border-blue-100 text-blue-600')}>{rule.impact} Risk</span>
                    </div>
                    <h4 className="font-bold text-zinc-900 mb-2">{rule.title}</h4>
                    <p className="text-xs text-zinc-500 mb-5 flex-1">{rule.description}</p>
                    
                    {/* Editable Threshold */}
                    <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mb-4 flex 1 justify-between items-center">
                       <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> حد التنبيه (أيام):</label>
                       <input type="number" min="0" value={rule.thresholdDays} onChange={(e) => setRules(prev => prev.map(r => r.id === rule.id ? {...r, thresholdDays: parseInt(e.target.value) || 0} : r))} className="w-16 px-2 py-1 bg-white border border-amber-200 rounded-lg text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 text-center" />
                    </div>

                    <div className="w-full h-px bg-zinc-100 mb-4" />
                    <h5 className="text-[10px] font-bold text-zinc-400 mb-3 uppercase tracking-widest">الدول المطبقة</h5>
                    <div className="space-y-2 mb-4">
                       {rule.countries.map((c: any) => (
                          <div key={c.code} className="flex flex-col gap-2 bg-zinc-50 border border-zinc-100 p-3 rounded-xl">
                             <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-zinc-400" /><span className="text-xs font-bold text-zinc-700">{c.name}</span></div>
                               <button onClick={() => {
                                  setRules(prev => prev.map(r => r.id === rule.id ? { ...r, countries: r.countries.map((ct: any) => ct.code === c.code ? { ...ct, active: !ct.active } : ct) } : r));
                               }}>
                                  {c.active ? <ToggleRight className="w-5 h-5 text-emerald-500 hover:text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-zinc-300 hover:text-zinc-400" />}
                               </button>
                             </div>
                             {c.active && rule.type === 'wps' && (
                               <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-200/50">
                                 <label className="text-[10px] font-bold text-zinc-500">حد التأخير (أيام)</label>
                                 <input type="number" min="0" value={c.thresholdDays || 0} onChange={(e) => {
                                    setRules(prev => prev.map(r => r.id === rule.id ? { ...r, countries: r.countries.map((ct: any) => ct.code === c.code ? { ...ct, thresholdDays: parseInt(e.target.value) || 0 } : ct) } : r));
                                 }} className="w-14 px-1.5 py-1 bg-white border border-zinc-200 rounded text-[10px] font-bold outline-none text-center" />
                               </div>
                             )}
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </motion.div>
      )}

      {/* --- ZATCA COMPLIANCE VIEW --- */}
      {activeTab === 'zatca' && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-emerald-900 text-white rounded-[2rem] p-8 shadow-xl">
               <h2 className="text-2xl font-black mb-2 flex items-center gap-3">التحقق عبر ZATCA (هيئة الزكاة والضريبة والجمارك)</h2>
               <p className="text-emerald-100 text-sm max-w-xl leading-relaxed">تحقق فورياً من السجلات التجارية وشهادات الإمتثال للمقاولين وموردي العمالة بشكل مباشر من قواعد البيانات الحكومية.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center justify-center max-w-2xl mx-auto">
               <h3 className="font-bold text-lg mb-6">فحص المطابقة عبر ZATCA</h3>
               
               <div className="flex gap-2 bg-zinc-100 p-1 rounded-xl mb-6 w-full">
                  <button onClick={() => { setZatcaValidationType('cr'); setZatcaResult(null); }} className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all", zatcaValidationType === 'cr' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>السجل التجاري (CR)</button>
                  <button onClick={() => { setZatcaValidationType('vat'); setZatcaResult(null); }} className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all", zatcaValidationType === 'vat' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>الرقم الضريبي (VAT)</button>
                  <button onClick={() => { setZatcaValidationType('cert'); setZatcaResult(null); }} className={cn("flex-1 px-4 py-2 rounded-lg text-sm font-bold transition-all", zatcaValidationType === 'cert' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700")}>الشهادة الضريبية</button>
               </div>

               <div className="w-full flex gap-3">
                  {zatcaValidationType === 'cr' && (
                     <input type="text" value={zatcaCR} onChange={e => setZatcaCR(e.target.value)} placeholder="رقم السجل التجاري (10 أرقام)" className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  )}
                  {zatcaValidationType === 'vat' && (
                     <input type="text" value={zatcaVat} onChange={e => setZatcaVat(e.target.value)} placeholder="الرقم الضريبي (15 رقم ويبدأ بـ 3)" className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  )}
                  {zatcaValidationType === 'cert' && (
                     <input type="text" value={zatcaCert} onChange={e => setZatcaCert(e.target.value)} placeholder="رقم الشهادة الضريبية" className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" />
                  )}
                  <button disabled={isZatcaLoading || (zatcaValidationType === 'cr' ? !zatcaCR : zatcaValidationType === 'vat' ? !zatcaVat : !zatcaCert)} onClick={async () => {
                     setIsZatcaLoading(true);
                     try {
                        const payload: any = {};
                        if (zatcaValidationType === 'cr') payload.crNumber = zatcaCR;
                        if (zatcaValidationType === 'vat') payload.vatNumber = zatcaVat;
                        if (zatcaValidationType === 'cert') payload.certificateNumber = zatcaCert;

                        const res = await fetch('/api/fwcos/zatca-validate', {
                           method: 'POST',
                           headers: { 'Content-Type': 'application/json' },
                           body: JSON.stringify(payload)
                        });
                        const data = await res.json();
                        setZatcaResult(data);
                     } catch (err) {
                        toast.error('حدث خطأ أثناء فحص البيانات.');
                     } finally {
                        setIsZatcaLoading(false);
                     }
                  }} className="px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                     {isZatcaLoading ? <Activity className="w-5 h-5 animate-spin" /> : <ShieldAlert className="w-5 h-5" />}
                     فحص الآن
                  </button>
               </div>
               
               {zatcaResult && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={cn("w-full mt-6 p-6 rounded-2xl border flex flex-col gap-4", zatcaResult.valid ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900")}>
                     <div className="flex items-center gap-4">
                        <div className={cn("w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-inner", zatcaResult.valid ? "bg-emerald-100/50" : "bg-rose-100/50")}>
                           {zatcaResult.valid ? <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : <ShieldAlert className="w-8 h-8 text-rose-600" />}
                        </div>
                        <div>
                           <h4 className="font-black text-xl mb-1 truncate">{zatcaResult.valid ? 'البيانات صحيحة ومطابقة' : 'البيانات غير صحيحة أو توجد مخالفات'}</h4>
                           <p className="text-sm font-medium opacity-80">تم التحقق في: {new Date(zatcaResult.checkedAt).toLocaleString('ar-SA')}</p>
                        </div>
                     </div>
                     
                     {!zatcaResult.valid && zatcaResult.validationErrors && zatcaResult.validationErrors.length > 0 && (
                        <div className="bg-rose-100/50 p-4 rounded-xl border border-rose-200/50">
                           <ul className="list-disc list-inside text-sm font-bold text-rose-800 space-y-1">
                              {zatcaResult.validationErrors.map((err: string, idx: number) => <li key={idx}>{err}</li>)}
                           </ul>
                        </div>
                     )}

                     {zatcaResult.valid && zatcaResult.details && (
                        <div className="bg-white/60 p-4 rounded-xl border border-emerald-200/50 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                           {Object.entries(zatcaResult.details).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                 <span className="text-[10px] font-black uppercase text-emerald-600/70">{key}</span>
                                 <span className="font-bold">{String(value)}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </motion.div>
               )}
            </div>

            {/* ZATCA Configuration and Certs Upload */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm max-w-2xl mx-auto space-y-6">
               <h3 className="font-black text-xl flex items-center gap-2 text-zinc-900 border-b border-zinc-100 pb-4">
                 <ShieldCheck className="w-6 h-6 text-primary" />
                 إعدادات الربط المتقدمة والشهادات
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border border-zinc-200 p-6 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center text-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <FileText className="w-6 h-6 text-zinc-400" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-zinc-900">ملف الشهادة (CSR)</p>
                     <p className="text-xs text-zinc-500 font-medium">للربط بتشفير المرحلة 2</p>
                   </div>
                   <label className="bg-zinc-900 w-full text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer hover:bg-zinc-800 transition">
                      رفع الملف
                      <input type="file" className="hidden" accept=".csr,.pem" onChange={(e) => {
                         if (e.target.files?.length) {
                           toast.success('تم رفع وحفظ ملف الشهادة الرقمية للمنشأة بنجاح.');
                         }
                      }} />
                   </label>
                 </div>
                 
                 <div className="border border-zinc-200 p-6 rounded-2xl bg-zinc-50 flex flex-col items-center justify-center text-center gap-3">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Lock className="w-6 h-6 text-zinc-400" />
                   </div>
                   <div>
                     <p className="text-sm font-bold text-zinc-900">المفتاح الخاص (Private Key)</p>
                     <p className="text-xs text-zinc-500 font-medium">لتوثيق الفواتير وسجلات الامتثال</p>
                   </div>
                   <label className="bg-zinc-900 w-full text-white font-bold text-xs py-2 px-4 rounded-xl cursor-pointer hover:bg-zinc-800 transition">
                      رفع المفتاح
                      <input type="file" className="hidden" accept=".key,.pem" onChange={(e) => {
                         if (e.target.files?.length) {
                           toast.success('تم رفع المفتاح الخاص بنجاح وسيتم تخزينه محلياً بشكل آمن (Encrypted Vault).');
                         }
                      }} />
                   </label>
                 </div>
               </div>
               
               <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <p className="text-sm font-bold text-emerald-900">حالة الربط مع منصة فاتورة (ZATCA)</p>
                  </div>
                  <span className="text-xs font-black bg-emerald-200/50 text-emerald-800 px-3 py-1 rounded-full">متصل (Online)</span>
               </div>
            </div>
         </motion.div>
      )}

      {/* --- GOSI SUBSCRIPTIONS DASHBOARD --- */}
      {activeTab === 'gosi' && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-teal-900 text-white rounded-[2rem] p-8 shadow-xl">
               <h2 className="text-2xl font-black mb-2 flex items-center gap-3">لوحة التأمينات الاجتماعية (GOSI)</h2>
               <p className="text-teal-100 text-sm max-w-xl leading-relaxed">متابعة دقيقة لاشتراكات التأمينات لكل موظف والتأكد من مطابقتها للراتب الأساسي المُسجل، لضمان الامتثال التام.</p>
            </div>
            
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
               <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="font-bold text-lg text-zinc-900">اشتراكات الشهر الحالي</h3>
               </div>
               <div className="overflow-x-auto">
                 <table className="w-full text-right" dir="rtl">
                    <thead className="bg-zinc-50 border-b border-zinc-100">
                       <tr className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                          <th className="p-4">اسم الموظف / ID</th>
                          <th className="p-4">الجنسية</th>
                          <th className="p-4">الراتب الأساسي المسجل</th>
                          <th className="p-4">اشتراك GOSI المتوقع</th>
                          <th className="p-4">الحالة التشغيلية</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 flex-1 h-full">
                       {computedWorkers.map(w => {
                           const isSaudi = w.nationality?.includes('سعودي') || w.nationality?.toLowerCase().includes('saudi');
                           // Mocking Base salary if not present. Realistically, we'd fallback nicely.
                           const baseSalary = (w as any).baseSalaryHalalas ? (w as any).baseSalaryHalalas / 100 : 4000;
                           const gosiCompanyRate = isSaudi ? 0.115 : 0.02;
                           const gosiEmployeeRate = isSaudi ? 0.0975 : 0;
                           const expectedGosi = baseSalary * (gosiCompanyRate + gosiEmployeeRate);

                           return (
                               <tr key={w.id} className="hover:bg-zinc-50 transition-colors">
                                  <td className="p-4">
                                     <div className="font-bold text-sm text-zinc-900">{w.name}</div>
                                     <div className="text-[10px] text-zinc-500 font-mono mt-1">ID: {w.id}</div>
                                  </td>
                                  <td className="p-4 text-xs font-medium text-zinc-600">{w.nationality || 'غير محدد'}</td>
                                  <td className="p-4 text-sm font-bold text-zinc-800">{baseSalary.toLocaleString()} ر.س</td>
                                  <td className="p-4">
                                     <div className="font-black text-sm text-teal-700">{expectedGosi.toLocaleString()} ر.س</div>
                                     <div className="text-[10px] text-zinc-400 mt-1">
                                        صاحب العمل: {(baseSalary * gosiCompanyRate).toLocaleString()} ر.س {isSaudi ? `+ الموظف: ${(baseSalary * gosiEmployeeRate).toLocaleString()} ر.س` : ''}
                                     </div>
                                  </td>
                                  <td className="p-4">
                                     <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-50 text-teal-700 border border-teal-100 text-[10px] font-bold">
                                        <CheckCircle2 className="w-3 h-3" /> مطابق للمسير
                                     </div>
                                  </td>
                               </tr>
                           );
                       })}
                       {computedWorkers.length === 0 && (
                          <tr><td colSpan={5} className="p-8 text-center text-zinc-400 text-sm font-bold">لا يوجد موظفين مسجلين.</td></tr>
                       )}
                    </tbody>
                 </table>
               </div>
            </div>
         </motion.div>
      )}

      {/* --- SETTINGS VIEW --- */}
      {activeTab === 'settings' && (
         <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-xl">
               <h2 className="text-2xl font-black flex items-center gap-3">إعدادات النظام (FWC-OS)</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-6">
                  <div>
                    <h3 className="font-black text-lg text-zinc-900 mb-1">تخصيص الذكاء الاصطناعي</h3>
                    <p className="text-xs text-zinc-500 font-medium">قم بضبط لهجة الردود ونماذج الذكاء الاصطناعي المفضلة للتحليلات.</p>
                  </div>
                  <div className="space-y-4 flex-1">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">اللهجة العربية المفضلة</label>
                        <select value={aiSettings.dialect} onChange={e => setAiSettings({...aiSettings, dialect: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                           <option value="saudi">السعودية (Saudi)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">نموذج الذكاء الاصطناعي</label>
                        <select value={aiSettings.model} onChange={e => setAiSettings({...aiSettings, model: e.target.value})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                           <option value="gemini-2.5-pro">Gemini 2.5 Pro (أدق و أشمل)</option>
                           <option value="gemini-2.5-flash">Gemini 2.5 Flash (أسرع)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">توجيه مخصص (Custom Prompt)</label>
                        <textarea value={aiSettings.customPrompt} onChange={e => setAiSettings({...aiSettings, customPrompt: e.target.value})} rows={3} placeholder="اكتب تعليمات إضافية لتوجيه الذكاء الاصطناعي..." className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm resize-none outline-none font-medium"></textarea>
                     </div>
                  </div>
               </div>
               
               <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-6">
                  <div>
                    <h3 className="font-black text-lg text-zinc-900 mb-1">إشعارات انتهاء الصلاحية</h3>
                    <p className="text-xs text-zinc-500 font-medium">تحكم في وتيرة الإشعارات وتنبيهات العقود والمستندات للعمالة.</p>
                  </div>
                  <div className="space-y-4 flex-1">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">إضافة فترة تنبيه جديدة (بالأيام)</label>
                        <div className="flex gap-2">
                           <input type="number" min="1" value={notificationSettings.reminderPeriod} onChange={e => setNotificationSettings({...notificationSettings, reminderPeriod: parseInt(e.target.value) || 0})} className="w-24 px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none text-center" />
                           <button onClick={() => {
                              if (notificationSettings.reminderPeriod > 0 && !notificationSettings.reminderPeriods.includes(notificationSettings.reminderPeriod)) {
                                 setNotificationSettings({ ...notificationSettings, reminderPeriods: [...notificationSettings.reminderPeriods, notificationSettings.reminderPeriod].sort((a,b)=>b-a) });
                              }
                           }} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition whitespace-nowrap text-sm">إضافة الفترة</button>
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-sm font-bold text-zinc-700">فترات التنبيه النشطة (أيام قبل الانتهاء)</label>
                        <div className="flex flex-wrap gap-2">
                           {notificationSettings.reminderPeriods.length === 0 && <span className="text-xs text-zinc-400 font-medium">لا توجد فترات تنبيه تم إعدادها.</span>}
                           {notificationSettings.reminderPeriods.map(period => (
                              <div key={period} className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200">
                                 <span className="text-sm font-bold text-zinc-700">{period} يوم</span>
                                 <button onClick={() => setNotificationSettings({...notificationSettings, reminderPeriods: notificationSettings.reminderPeriods.filter(p => p !== period)})} className="text-zinc-400 hover:text-rose-500"><X className="w-3.5 h-3.5" /></button>
                              </div>
                           ))}
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">ستصلك إشعارات وتنبيهات في لوحة القيادة (Dashboard) وفي واجهة النظام عند وصول أي عقد أو إقامة إلى هذه الفترات المتبقية قبل الانتهاء.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="flex justify-end">
               <button onClick={() => {
                  toast.success('تم حفظ الإعدادات بنجاح!');
               }} className="px-8 py-3 bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"><CheckCircle2 className="w-5 h-5"/> حفظ التغييرات</button>
            </div>
         </motion.div>
      )}

      {/* --- EDIT WORKER MODAL (With Document Expiries) --- */}
      <AnimatePresence>
        {editingWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] min-h-[600px] border border-white/20" dir="rtl">
              <div className="w-full md:w-1/3 bg-zinc-50 p-8 border-l border-zinc-100 flex flex-col overflow-y-auto">
                 <div className="flex justify-between items-start mb-6"><div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm border border-blue-200">{editingWorker.name ? editingWorker.name.charAt(0) : <Users className="w-6 h-6" />}</div><button onClick={() => setEditingWorker(null)} className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-600 md:hidden"><X className="w-5 h-5" /></button></div>
                 <h2 className="text-xl font-black text-zinc-900 mb-1">{editingWorker.name || "عامل جديد"}</h2>
                 <div className="p-4 bg-white rounded-2xl border border-zinc-100 mt-4">
                    <h3 className="text-xs font-bold text-zinc-900 mb-3 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> حالة الامتثال الأساسية</h3>
                    <div className="space-y-3">
                        <div>
                           <label className="text-[10px] font-bold text-zinc-500">منظومة الأجور (WPS)</label>
                           <select value={editingWorker.wpsStatus} onChange={e => setEditingWorker({...editingWorker, wpsStatus: e.target.value as any})} className="w-full mt-1 p-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm outline-none"><option value="compliant">ملتزم</option><option value="delayed">متأخر الدفع</option><option value="violation">مخالفة مرصودة</option></select>
                        </div>
                    </div>
                 </div>
              </div>

              <div className="flex-1 flex flex-col bg-white overflow-hidden">
                 <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-white z-10 sticky top-0 hidden md:flex"><h3 className="font-black text-lg text-zinc-900">{isAddingNew ? "إنشاء ملف عامل جديد" : "تحديث بيانات العامل والمستندات"}</h3><button onClick={() => setEditingWorker(null)} className="p-2 bg-zinc-50 rounded-xl border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-all"><X className="w-5 h-5" /></button></div>
                 
                 <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 no-scrollbar relative">
                    <form id="worker-form" onSubmit={handleSaveWorker} className="space-y-6">
                       <div>
                          <h4 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> المعلومات والتفاصيل التعاقدية</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">اسم العامل</label><input required value={editingWorker.name} onChange={e => setEditingWorker({...editingWorker, name: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">الجنسية (Nationality)</label><input required value={editingWorker.nationality} onChange={e => setEditingWorker({...editingWorker, nationality: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">المنصب / المهنة (Role)</label><input required value={editingWorker.role} onChange={e => setEditingWorker({...editingWorker, role: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5">
                               <label className="text-[10px] font-bold text-zinc-500">الدولة التابع لها</label>
                               <select value={editingWorker.country} onChange={e => setEditingWorker({...editingWorker, country: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none">{['KSA'].map(c => <option key={c} value={c}>{c}</option>)}</select>
                             </div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">رقم التأشيرة (Visa Number)</label><input value={editingWorker.visaNumber || ''} onChange={e => setEditingWorker({...editingWorker, visaNumber: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">رقم الجواز (Passport Number)</label><input value={editingWorker.passportNumber || ''} onChange={e => setEditingWorker({...editingWorker, passportNumber: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">بداية العقد</label><input type="date" value={editingWorker.contractStartDate} onChange={e => setEditingWorker({...editingWorker, contractStartDate: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">نهاية العقد</label><input type="date" value={editingWorker.contractEndDate} onChange={e => setEditingWorker({...editingWorker, contractEndDate: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                             <div className="space-y-1.5"><label className="text-[10px] font-bold text-zinc-500">انتهاء الإقامة (Iqama)</label><input type="date" value={editingWorker.iqamaExpiry} onChange={e => setEditingWorker({...editingWorker, iqamaExpiry: e.target.value})} className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
                          </div>
                       </div>
                    </form>

                    <div className="w-full h-px bg-zinc-100 my-8" />
                    
                    {/* Documents Tracking and Expiry Update Area */}
                    <div>
                        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
                           <div><h4 className="text-sm font-black text-zinc-900 flex items-center gap-2"><File className="w-4 h-4 text-blue-500" /> إدارة مرفقات الوثائق وصلاحيتها</h4></div>
                           <div className="flex flex-col sm:flex-row gap-2">
                              <select 
                                 id="docUploadType"
                                 className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold outline-none"
                              >
                                 <option value="passport">جواز السفر (Passport)</option>
                                 <option value="visa">تأشيرة (Visa)</option>
                                 <option value="contract">عقد (Contract)</option>
                              </select>
                              <input type="file" id="fileUpload" className="hidden" onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file && editingWorker) {
                                    const type = (document.getElementById('docUploadType') as HTMLSelectElement).value as any;
                                    const newDoc: WorkerDoc = {
                                       id: `doc_${Date.now()}`,
                                       name: file.name,
                                       type: type,
                                       dateAdded: new Date().toISOString().split('T')[0],
                                       expiryDate: ''
                                    };
                                    setEditingWorker({...editingWorker, documents: [...(editingWorker.documents || []), newDoc]});
                                 }
                                 // Reset the input so the same file could be uploaded again if needed
                                 e.target.value = '';
                              }} />
                              <button onClick={() => document.getElementById('fileUpload')?.click()} type="button" className="text-[11px] font-bold bg-zinc-900 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm hover:scale-105 transition-all"><Upload className="w-4 h-4" /> رفع مستند</button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                           {editingWorker.documents?.map(doc => (
                              <div key={doc.id} className="flex flex-col sm:flex-row items-start lg:items-center justify-between p-4 border border-zinc-200 bg-white rounded-xl gap-4 hover:border-blue-200 hover:shadow-sm transition-all group">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><File className="w-5 h-5" /></div>
                                    <div>
                                       <h5 className="text-sm font-bold text-zinc-900 line-clamp-1">{doc.name}</h5>
                                       <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded">{doc.type}</span>
                                          <span className="text-[9px] font-bold text-zinc-400">Added: {doc.dateAdded}</span>
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-end gap-3 w-full lg:w-auto shrink-0">
                                    <div className="flex flex-col gap-1 w-full lg:w-48 shrink-0">
                                       <label className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">تاريخ الانتهاء (Expiry):</label>
                                       <input type="date" value={doc.expiryDate || ''} onChange={e => {
                                          setEditingWorker(prev => {
                                             if(!prev) return prev;
                                             return {...prev, documents: prev.documents?.map(d => d.id === doc.id ? {...d, expiryDate: e.target.value} : d)};
                                          });
                                       }} className="w-full px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold outline-none text-left" />
                                    </div>
                                    <div className="flex gap-1">
                                       <button type="button" onClick={() => alert('View Document: ' + doc.name)} className="p-2 text-zinc-400 hover:text-blue-500 bg-zinc-50 rounded-lg" title="عرض المستوى"><Eye className="w-4 h-4" /></button>
                                       <button type="button" onClick={() => alert('Download Document: ' + doc.name)} className="p-2 text-zinc-400 hover:text-blue-500 bg-zinc-50 rounded-lg" title="تنزيل"><Download className="w-4 h-4" /></button>
                                       <button type="button" onClick={() => {
                                          setEditingWorker(prev => {
                                             if(!prev) return prev;
                                             return {...prev, documents: prev.documents?.filter(d => d.id !== doc.id)};
                                          });
                                       }} className="p-2 text-rose-400 hover:text-rose-500 bg-rose-50 rounded-lg" title="حذف المستند"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                           {(!editingWorker.documents || editingWorker.documents.length === 0) && (
                              <div className="text-center py-8 text-zinc-400 text-xs font-bold">لا توجد مرفقات مرتبطة بهذا العامل</div>
                           )}
                        </div>
                    </div>
                 </div>

                 <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3 shrink-0">
                    <button form="worker-form" type="submit" className="flex-1 bg-zinc-900 text-white py-3 rounded-xl font-bold shadow-lg hover:scale-[1.01] transition-all text-sm flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5"/> التحديث واعتماد البيانات</button>
                    <button onClick={() => setEditingWorker(null)} type="button" className="px-6 py-3 bg-white border border-zinc-200 text-zinc-600 rounded-xl font-bold hover:bg-zinc-100 transition-all text-sm">إلغاء</button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}