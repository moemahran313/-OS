import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  FileCheck,
  ArrowLeftRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Send,
  Zap,
  Plus,
  Copy,
  ExternalLink,
  Users,
  Award,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

interface QiwaStatusData {
  companyName: string;
  crNumber: string;
  nitaqatCategory: "Platinum" | "Green" | "Yellow" | "Red";
  saudizationPercentage: number;
  saudiCount: number;
  expatCount: number;
  totalEmployees: number;
  webhookStatus: "ACTIVE" | "PENDING" | "ERROR";
  webhookUrl: string;
  lastSyncedAt: string;
  contractsSummary: {
    approved: number;
    pendingApproval: number;
    rejected: number;
  };
  transfersSummary: {
    total: number;
    pendingMhrsd: number;
    approved: number;
  };
  recentWebhookLogs: Array<{
    id: string;
    eventType: string;
    payload: any;
    timestamp: string;
    status: "PROCESSED" | "FAILED";
  }>;
}

interface ContractItem {
  id: string;
  employeeName: string;
  nationalId: string;
  profession: string;
  contractStatus: "APPROVED" | "PENDING_EMPLOYEE" | "REJECTED" | "EXPIRED";
  mhrsdContractId: string;
  startDate: string;
  endDate: string;
  salaryBasic: number;
  isSaudi: boolean;
}

interface TransferItem {
  id: string;
  employeeName: string;
  nationalId: string;
  transferType: "SPONSORSHIP_TRANSFER" | "PROFESSION_CHANGE" | "SECONDMENT";
  currentProfession: string;
  targetProfession: string;
  status: "PENDING_MHRSD" | "APPROVED" | "REJECTED" | "CANCELLED";
  mhrsdApplicationId: string;
  createdAt: string;
  notes?: string;
}

export default function QiwaSyncModule() {
  const [activeTab, setActiveTab] = useState<"overview" | "contracts" | "transfers" | "webhooks">("overview");
  const [statusData, setStatusData] = useState<QiwaStatusData | null>(null);
  const [contracts, setContracts] = useState<ContractItem[]>([]);
  const [transfers, setTransfers] = useState<TransferItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // New Transfer Modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [newTransferForm, setNewTransferForm] = useState({
    employeeName: "",
    nationalId: "",
    transferType: "SPONSORSHIP_TRANSFER" as const,
    currentProfession: "عامل عام",
    targetProfession: "أخصائي تقنية معلومات",
    notes: "",
  });
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // Simulation test state
  const [simEventType, setSimEventType] = useState<string>("EMPLOYEE_CONTRACT_APPROVED");
  const [isSimulating, setIsSimulating] = useState(false);

  // Fetch QIWA status and records
  const fetchQiwaData = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/qiwa/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        if (data.contracts) setContracts(data.contracts);
        if (data.transfers) setTransfers(data.transfers);
      }
    } catch (err) {
      console.error("Failed to fetch QIWA status", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQiwaData();
  }, []);

  // Trigger manual API Sync with MHRSD QIWA Gateway
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/qiwa/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "تمت المزامنة المباشرة مع بوابة وزارة الموارد البشرية (قوى)");
        fetchQiwaData();
      } else {
        toast.error(data.error || "فشل الاتصال بمنصة قوى");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit new transfer application
  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransferForm.employeeName || !newTransferForm.nationalId) {
      toast.error("يرجى ملء كافة البيانات المطلوبة");
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/qiwa/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTransferForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("تم إرسال طلب نقل الخدمات / تعديل المهنة إلى منصة قوى MHRSD برقم: " + data.mhrsdApplicationId);
        setShowTransferModal(false);
        setNewTransferForm({
          employeeName: "",
          nationalId: "",
          transferType: "SPONSORSHIP_TRANSFER",
          currentProfession: "عامل عام",
          targetProfession: "أخصائي تقنية معلومات",
          notes: "",
        });
        fetchQiwaData();
      } else {
        toast.error(data.error || "فشل إرسال الطلب لـ قوى");
      }
    } catch (err) {
      toast.error("خطأ أثناء الاتصال بمنصة قوى");
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  // Simulate Webhook Event
  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/qiwa/simulate-webhook", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ eventType: simEventType }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`[Webhook Triggered] ${data.message}`);
        fetchQiwaData();
      } else {
        toast.error(data.error || "فشل اختبار الـ Webhook");
      }
    } catch (err) {
      toast.error("خطأ في إرسال الـ Webhook المحاكي");
    } finally {
      setIsSimulating(false);
    }
  };

  const getNitaqatColorClass = (category?: string) => {
    switch (category) {
      case "Platinum":
        return "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/40";
      case "Green":
        return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/40";
      case "Yellow":
        return "bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/40";
      case "Red":
        return "bg-gradient-to-r from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  const getNitaqatArabicName = (category?: string) => {
    switch (category) {
      case "Platinum":
        return "النطاق البلاتيني (Platinum)";
      case "Green":
        return "النطاق الأخضر المرتفع (Green)";
      case "Yellow":
        return "النطاق الأصفر (Yellow)";
      case "Red":
        return "النطاق الأحمر (Red)";
      default:
        return "غير محدد";
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ربط مباشر مع منصة قوى - وزارة الموارد البشرية (QIWA MHRSD API)
              </span>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                HMAC-SHA256 Webhook Active
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              منظومة المزامنة اللحظية لعقود ونطاقات قوى (QIWA Real-Time Sync)
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              تتبع آلي وفوري لنسبة التوطين (نطاقات - Nitaqat)، حالة اعتماد العقود الموثقة، وطلبات نقل الخدمات وتعديل المهن عبر استقبال الأحداث المباشرة (Webhooks) الصادرة من بوابة MHRSD الرسمية.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleTriggerSync}
              disabled={isSyncing}
              className="w-full lg:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-5 py-3 rounded-2xl border border-emerald-400/30 shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "جاري الاتصال بـ قوى..." : "مزامنة لحظية الآن (Sync Now)"}</span>
            </button>
          </div>
        </div>

        {/* Nitaqat & Compliance Score Bar */}
        {statusData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            {/* Tier Card */}
            <div className={`p-4 rounded-2xl border ${getNitaqatColorClass(statusData.nitaqatCategory)} flex items-center justify-between`}>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">تصنيف نطاقات (Nitaqat Tier)</p>
                <h4 className="text-lg font-black mt-0.5">{getNitaqatArabicName(statusData.nitaqatCategory)}</h4>
                <p className="text-[11px] opacity-80 font-medium">نسبة التوطين: {statusData.saudizationPercentage.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 opacity-70" />
            </div>

            {/* Saudization Count */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">عدد السعوديين / المقيمين</p>
                <h4 className="text-base font-black text-white mt-0.5">
                  <span className="text-emerald-400">{statusData.saudiCount} سعودي</span> / <span className="text-slate-400">{statusData.expatCount} مقيم</span>
                </h4>
                <p className="text-[11px] text-slate-400 font-medium">إجمالي الكادر: {statusData.totalEmployees} موظف</p>
              </div>
              <Users className="w-7 h-7 text-indigo-400 opacity-70" />
            </div>

            {/* Contracts Status */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">عقود قوى المعتمدة</p>
                <h4 className="text-base font-black text-emerald-400 mt-0.5">
                  {statusData.contractsSummary.approved} عقد معتمد
                </h4>
                <p className="text-[11px] text-amber-400 font-medium">
                  {statusData.contractsSummary.pendingApproval} قيد موافقة الموظف
                </p>
              </div>
              <FileCheck className="w-7 h-7 text-emerald-400 opacity-70" />
            </div>

            {/* Transfers Status */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">طلبات نقل الخدمات والمهن</p>
                <h4 className="text-base font-black text-indigo-400 mt-0.5">
                  {statusData.transfersSummary.total} طلب إجمالي
                </h4>
                <p className="text-[11px] text-sky-400 font-medium">
                  {statusData.transfersSummary.pendingMhrsd} قيد المعالجة في MHRSD
                </p>
              </div>
              <ArrowLeftRight className="w-7 h-7 text-indigo-400 opacity-70" />
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "overview"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>ملخص التوطين ونطاقات</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "contracts"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>اعتماد العقود الموثقة ({contracts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("transfers")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "transfers"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>نقل الخدمات وتعديل المهن ({transfers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("webhooks")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "webhooks"
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>ربط الـ Webhooks واختبار المحاكاة</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & NITAQAT HEALTH */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visual Nitaqat Gauge */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-white">مؤشر نطاقات وحساب التوطين الآلي</h3>
                <p className="text-xs text-slate-400">تحديث آلي مطابق للضوابط الرسمية لوزارة الموارد البشرية والتنمية الاجتماعية</p>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl text-emerald-400">
                MHRSD Calculator v2.4
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-rose-400">أحمر (&lt;10%)</span>
                <span className="text-amber-400">أصفر (10%-19%)</span>
                <span className="text-green-400">أخضر منخفض (20%-29%)</span>
                <span className="text-emerald-400">أخضر مرتفع (30%-39%)</span>
                <span className="text-teal-300">بلاتيني (≥40%)</span>
              </div>
              <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800 relative">
                <div className="w-[10%] h-full bg-rose-500/80 rounded-r-full" />
                <div className="w-[10%] h-full bg-amber-500/80" />
                <div className="w-[10%] h-full bg-green-500/80" />
                <div className="w-[10%] h-full bg-emerald-500/80" />
                <div className="w-[60%] h-full bg-teal-400/80 rounded-l-full" />

                {/* Marker pointer */}
                {statusData && (
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-white rounded-full shadow-lg shadow-white/50 border border-slate-900 transition-all duration-500"
                    style={{
                      right: `${Math.min(100, Math.max(0, statusData.saudizationPercentage))}%`,
                    }}
                    title={`نسبة التوطين الحالية: ${statusData.saudizationPercentage.toFixed(1)}%`}
                  />
                )}
              </div>
            </div>

            {/* Real-time Recommendations */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>توصيات الامتثال والرفع النطاقي:</span>
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>المنشأة حالياً تقع في <strong>{getNitaqatArabicName(statusData?.nitaqatCategory)}</strong> مما يتيح لك إصدار وتجديد رخص العمل ونقل الخدمات بحرية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>لتجنب الهبوط إلى النطاق الأدنى، حافظ على توثيق كافة عقود الموظفين السعوديين الجدد في منصة قوى خلال 14 يوماً من المباشرة.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>ربط منصة قوى بـ التأمينات الاجتماعية (GOSI) مفعّل تلقائياً لتسجيل الأجر الخاضع للاشتراك دون الحاجة لمدخلات يدوية مكررة.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Side Info Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white border-b border-slate-800 pb-3">حالة الاتصال والخدمات</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">بوابة QIWA Gateway:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  نشط - MHRSD Live
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">آخر مزامنة ناجحة:</span>
                <span className="text-slate-200 font-mono text-[11px]">
                  {statusData?.lastSyncedAt ? new Date(statusData.lastSyncedAt).toLocaleString("ar-SA") : "الآن"}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400">رقم السجل التجاري CR:</span>
                <span className="text-indigo-300 font-mono font-bold">1010889922</span>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 space-y-1">
                <p className="font-bold text-[11px]">معلومات الحماية والأمان:</p>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  تتم كافة الاتصالات والـ API Webhooks مع منصة قوى باستخدام تشفير SSL متبادل والتوقيع الرقمي المعتمد للشركات.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACTS APPROVAL (توثيق واعتماد عقود قوى) */}
      {activeTab === "contracts" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-extrabold text-base text-white">العقود المعتمدة والموثقة في منصة قوى (Qiwa Labor Contracts)</h3>
              <p className="text-xs text-slate-400">متابعة حالة قبول الموظفين للعقود الوظيفية الرقمية الصادرة من المنشأة</p>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              إجمالي العقود المعتمدة: {contracts.filter(c => c.contractStatus === "APPROVED").length}
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">الهوية / الإقامة</th>
                  <th className="p-3.5">المهنة المسجلة</th>
                  <th className="p-3.5">الراتب الأساسي</th>
                  <th className="p-3.5">رقم العقد الموحد (MHRSD)</th>
                  <th className="p-3.5">حالة التوثيق بـ قوى</th>
                  <th className="p-3.5">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {contracts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-white flex items-center gap-2">
                      <span>{c.employeeName}</span>
                      {c.isSaudi ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-black">سعودي</span>
                      ) : (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">مقيم</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300 font-bold">{c.nationalId}</td>
                    <td className="p-3.5 font-medium">{c.profession}</td>
                    <td className="p-3.5 font-mono font-extrabold text-emerald-400">
                      {c.salaryBasic.toLocaleString()} ر.س
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{c.mhrsdContractId}</td>
                    <td className="p-3.5">
                      {c.contractStatus === "APPROVED" ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> العقد معتمد المبدئي
                        </span>
                      ) : c.contractStatus === "PENDING_EMPLOYEE" ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> قيد موافقة الموظف
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit">
                          <XCircle className="w-3.5 h-3.5" /> مرفوض من الموظف
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => toast.info(`تم طلب تحديث العقد ${c.mhrsdContractId} من منصة قوى`)}
                        className="text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded-lg font-bold text-[11px] border border-indigo-500/20 transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>تحديث الحالة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: OCCUPATIONAL TRANSFERS (نقل الخدمات وتعديل المهن) */}
      {activeTab === "transfers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-extrabold text-base text-white">طلبات نقل الخدمات وتعديل المهن (Sponsorship & Occupation Transfers)</h3>
              <p className="text-xs text-slate-400">إدارة ومعالجة معاملات نقل كفالة العاملين وتغيير المهن الرسمية عبر منصة قوى</p>
            </div>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-indigo-400/30 flex items-center gap-1.5 shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>تقديم طلب نقل / تعديل مهنة</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">رقم الهوية / الإقامة</th>
                  <th className="p-3.5">نوع المعاملة</th>
                  <th className="p-3.5">المهنة الحالية &larr; المستهدفة</th>
                  <th className="p-3.5">رقم الطلب بـ MHRSD</th>
                  <th className="p-3.5">الحالة الحالية</th>
                  <th className="p-3.5">تاريخ التقديم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{t.employeeName}</td>
                    <td className="p-3.5 font-mono text-indigo-300 font-bold">{t.nationalId}</td>
                    <td className="p-3.5">
                      {t.transferType === "SPONSORSHIP_TRANSFER" ? (
                        <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-indigo-500/30">
                          نقل خدمات (كفالة)
                        </span>
                      ) : (
                        <span className="bg-sky-500/20 text-sky-300 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-sky-500/30">
                          تعديل مهنة
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium">
                      <span className="text-slate-400">{t.currentProfession}</span>
                      <span className="mx-1.5 text-emerald-400 font-bold">&larr;</span>
                      <span className="text-emerald-300 font-bold">{t.targetProfession}</span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-400 font-bold">{t.mhrsdApplicationId}</td>
                    <td className="p-3.5">
                      {t.status === "APPROVED" ? (
                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> تم القبول والتحديث
                        </span>
                      ) : t.status === "PENDING_MHRSD" ? (
                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <Clock className="w-3.5 h-3.5 animate-spin" /> قيد المراجعة بـ MHRSD
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <XCircle className="w-3.5 h-3.5" /> مرفوض
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(t.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS & SIMULATION TESTER */}
      {activeTab === "webhooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Webhook Settings */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <span>إعدادات رابط استقبال الأحداث المباشرة (Qiwa Webhook URL)</span>
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded-full font-bold border border-emerald-500/30">
                مفعّل - Listening
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              يقوم هذا الرابط باستقبال التحديثات الفورية المباشرة من خوادم منصة قوى (MHRSD) عند اعتماد عقود جديدة، تعديل حالة النطاق، أو الموافقة على نقل الموظفين.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400">عنوان الـ Webhook الخاص بنظامك:</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/api/qiwa/webhook`}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-indigo-300 w-full focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/qiwa/webhook`);
                    toast.success("تم نسخ رابط الـ Webhook إلى الحافظة!");
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-white p-2.5 rounded-xl border border-slate-700 transition-colors cursor-pointer"
                  title="نسخ الرابط"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">نوع التشفير والسلامة:</span>
                <span className="text-emerald-400 font-mono font-extrabold">HMAC SHA-256 Signature</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">عنوان الـ API الأصلي:</span>
                <span className="text-slate-300 font-mono text-[11px]">https://api.qiwa.sa/v2/webhooks</span>
              </div>
            </div>
          </div>

          {/* Webhook Interactive Tester Simulator */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span>محاكي إرسال الأحداث تجريبياً (MHRSD Webhook Simulator)</span>
              </h3>
              <p className="text-xs text-slate-400">اختبار استجابة المنظومة اللحظية للـ Webhooks القادمة من قوى</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400">اختر نوع الحدث المراد محاكاته:</label>
              <select
                value={simEventType}
                onChange={(e) => setSimEventType(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs w-full focus:outline-none focus:border-indigo-500"
              >
                <option value="EMPLOYEE_CONTRACT_APPROVED">اعتماد عقد عمل موثق جديد (EMPLOYEE_CONTRACT_APPROVED)</option>
                <option value="NITAQAT_TIER_CHANGED">تغيير فئة النطاق إلى البلاتيني (NITAQAT_TIER_CHANGED)</option>
                <option value="OCCUPATIONAL_TRANSFER_APPROVED">الموافقة على نقل خدمات موظف (OCCUPATIONAL_TRANSFER_APPROVED)</option>
              </select>

              <button
                type="button"
                onClick={handleSimulateWebhook}
                disabled={isSimulating}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-3 rounded-xl border border-indigo-400/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Zap className={`w-4 h-4 ${isSimulating ? "animate-spin" : ""}`} />
                <span>{isSimulating ? "جاري إرسال الحدث..." : "إرسال حدث الـ Webhook التجريبي"}</span>
              </button>
            </div>

            {/* Recent Webhook Audit Log */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-slate-400">آخر الـ Webhooks المستقبلة بالمنظومة:</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {statusData?.recentWebhookLogs && statusData.recentWebhookLogs.length > 0 ? (
                  statusData.recentWebhookLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-indigo-400 font-bold text-[11px]">{log.eventType}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString("ar-SA")}
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-400 font-mono">Status: {log.status}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-4">لا يوجد سجلات استلام حالياً.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE TRANSFER REQUEST */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
                <span>تقديم طلب نقل خدمات / تعديل مهنة منصة قوى</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTransfer} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">نوع المعاملة المطلوب:</label>
                <select
                  value={newTransferForm.transferType}
                  onChange={(e) =>
                    setNewTransferForm({ ...newTransferForm, transferType: e.target.value as any })
                  }
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                >
                  <option value="SPONSORSHIP_TRANSFER">نقل خدمات موظف (Sponsorship Transfer)</option>
                  <option value="PROFESSION_CHANGE">تعديل المهنة الرسمية (Profession Change)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">اسم الموظف الكامل:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: محمد علي العتيبي"
                    value={newTransferForm.employeeName}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, employeeName: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">رقم الهوية / الإقامة:</label>
                  <input
                    type="text"
                    required
                    placeholder="10XXXXXXXX / 20XXXXXXXX"
                    value={newTransferForm.nationalId}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, nationalId: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المهنة الحالية:</label>
                  <input
                    type="text"
                    required
                    value={newTransferForm.currentProfession}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, currentProfession: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">المهنة المستهدفة في قوى:</label>
                  <input
                    type="text"
                    required
                    value={newTransferForm.targetProfession}
                    onChange={(e) => setNewTransferForm({ ...newTransferForm, targetProfession: e.target.value })}
                    className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTransfer}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-indigo-400/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingTransfer ? "جاري التقديم..." : "إرسال لـ قوى MHRSD"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
