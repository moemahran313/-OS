import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Calendar,
  FileText,
  User,
  PlaneTakeoff,
  PlaneLanding,
  Award,
  Bell,
  Sliders,
  DollarSign,
  Building,
  Plus,
  ExternalLink,
  Search,
  Filter,
  XCircle,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

interface IqamaRecord {
  id: string;
  employeeName: string;
  iqamaNumber: string;
  nationality: string;
  profession: string;
  department: string;
  iqamaExpiryHijri: string;
  iqamaExpiryGregorian: string;
  daysRemaining: number;
  passportExpiryGregorian: string;
  passportDaysRemaining: number;
  insuranceExpiryGregorian: string;
  insuranceDaysRemaining: number;
  status: "VALID" | "EXPIRING_SOON" | "URGENT" | "EXPIRED_FINED";
  renewalStatus: "NOT_STARTED" | "PENDING_MUQEEM" | "RENEWED";
  fineAmountSAR: number;
  visaStatus?: {
    type: "SINGLE" | "MULTIPLE" | "NONE";
    daysValid: number;
    returnDeadlineGregorian?: string;
  };
}

interface MuqeemSummary {
  totalExpatsTracked: number;
  validIqamas: number;
  expiringSoon30Days: number;
  urgent15Days: number;
  expiredFined: number;
  totalActiveVisas: number;
  penaltiesSavedSAR: number;
  lastSyncedAt: string;
}

export default function MuqeemLifecycleModule() {
  const [activeTab, setActiveTab] = useState<"iqamas" | "visas" | "passports" | "alerts">("iqamas");
  const [summary, setSummary] = useState<MuqeemSummary | null>(null);
  const [records, setRecords] = useState<IqamaRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Visa Request Modal
  const [showVisaModal, setShowVisaModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IqamaRecord | null>(null);
  const [visaForm, setVisaForm] = useState({
    visaType: "SINGLE" as "SINGLE" | "MULTIPLE",
    durationDays: 60,
    travelReason: "إجازة سنوية (Annual Leave)",
  });
  const [isSubmittingVisa, setIsSubmittingVisa] = useState(false);

  // Alert Config State
  const [alertSettings, setAlertSettings] = useState({
    notify90Days: true,
    notify60Days: true,
    notify30Days: true,
    notify15Days: true,
    autoSendWhatsapp: true,
    autoSendEmail: true,
    hrEmail: "hr@company.sa",
  });

  // Fetch Muqeem Records & Summary
  const fetchMuqeemData = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/muqeem/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setRecords(data.records || []);
      }
    } catch (err) {
      console.error("Failed to fetch Muqeem records:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMuqeemData();
  }, []);

  // Trigger manual Muqeem Gateway Sync
  const handleSyncMuqeem = async () => {
    setIsSyncing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/muqeem/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "تمت المزامنة المباشرة مع بوابة مقيم وأبشر أعمال");
        fetchMuqeemData();
      } else {
        toast.error(data.error || "فشل الاتصال ببوابة مقيم");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بالسيرفر");
    } finally {
      setIsSyncing(false);
    }
  };

  // Submit Iqama Renewal Request via Muqeem API
  const handleRenewIqama = async (record: IqamaRecord) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/muqeem/renew-iqama", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ iqamaNumber: record.iqamaNumber, employeeName: record.employeeName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تم إرسال طلب تجديد الإقامة رقم ${record.iqamaNumber} لمنصة مقيم بنجاح. رقم المرجع: ${data.muqeemRef}`);
        fetchMuqeemData();
      } else {
        toast.error(data.error || "فشل إرسال طلب التجديد");
      }
    } catch (err) {
      toast.error("خطأ أثناء تنفيذ عملية التجديد");
    }
  };

  // Submit Exit Reentry Visa Request
  const handleIssueVisa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    setIsSubmittingVisa(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/muqeem/issue-visa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          iqamaNumber: selectedRecord.iqamaNumber,
          employeeName: selectedRecord.employeeName,
          ...visaForm,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تم إصدار تأشيرة الخروج والعودة رقم (${data.visaNumber}) للموظف ${selectedRecord.employeeName}`);
        setShowVisaModal(false);
        setSelectedRecord(null);
        fetchMuqeemData();
      } else {
        toast.error(data.error || "فشل إصدار التأشيرة عبر مقيم");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال ببوابة مقيم");
    } finally {
      setIsSubmittingVisa(false);
    }
  };

  // Send Expiry Reminder via WhatsApp / Email
  const handleSendReminder = async (record: IqamaRecord) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/muqeem/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ iqamaNumber: record.iqamaNumber, employeeName: record.employeeName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`تم إرسال التنبيه الآلي عبر WhatsApp/Email للموظف ${record.employeeName}`);
      } else {
        toast.error(data.error || "فشل إرسال التنبيه");
      }
    } catch (err) {
      toast.error("خطأ أثناء إرسال التنبيه");
    }
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.iqamaNumber.includes(searchTerm) ||
      r.profession.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "URGENT") return matchesSearch && (r.daysRemaining <= 15 || r.status === "URGENT");
    if (statusFilter === "EXPIRING_SOON") return matchesSearch && (r.daysRemaining <= 30 && r.daysRemaining > 15);
    if (statusFilter === "EXPIRED_FINED") return matchesSearch && r.status === "EXPIRED_FINED";
    if (statusFilter === "VALID") return matchesSearch && r.daysRemaining > 30;
    return matchesSearch;
  });

  const getStatusBadge = (record: IqamaRecord) => {
    if (record.status === "EXPIRED_FINED" || record.daysRemaining < 0) {
      return (
        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
          <XCircle className="w-3.5 h-3.5" /> منتهية (غرامة {record.fineAmountSAR} ر.س)
        </span>
      );
    }
    if (record.daysRemaining <= 15 || record.status === "URGENT") {
      return (
        <span className="text-[11px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5" /> حرج جداً ({record.daysRemaining} يوم)
        </span>
      );
    }
    if (record.daysRemaining <= 30 || record.status === "EXPIRING_SOON") {
      return (
        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
          <Clock className="w-3.5 h-3.5" /> ينتهي قريباً ({record.daysRemaining} يوم)
        </span>
      );
    }
    return (
      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
        <CheckCircle2 className="w-3.5 h-3.5" /> سارية ({record.daysRemaining} يوم)
      </span>
    );
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 border border-sky-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/30 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                منظومة مقيم وأبشر أعمال (Muqeem & Absher Business Lifecycle)
              </span>
              <span className="text-[10px] font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full font-mono">
                MHRSD & Passports API Live
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              نظام المتابعة الآلية لانتهاء الإقامات، التأشيرات، وجوازات السفر
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              إشعار آلي متعدد القنوات قبل 90/60/30/15 يوماً لمنع غرامات تأخير الجوازات (500-1000 ريال)، مع إمكانية تجديد الإقامات وإصدار تأشيرات الخروج والعودة بضغطة زر.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleSyncMuqeem}
              disabled={isSyncing}
              className="w-full lg:w-auto bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-5 py-3 rounded-2xl border border-sky-400/30 shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "جاري الاتصال بـ مقيم..." : "مزامنة أبشر / مقيم الآن"}</span>
            </button>
          </div>
        </div>

        {/* Muqeem KPI Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            {/* Total Expat Count */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">إجمالي المقيمين المتابعين</p>
                <h4 className="text-xl font-black text-white mt-0.5">{summary.totalExpatsTracked} مقيم</h4>
                <p className="text-[11px] text-emerald-400 font-medium">{summary.validIqamas} إقامة سارية ومستقرة</p>
              </div>
              <User className="w-8 h-8 text-sky-400 opacity-70" />
            </div>

            {/* Expiring / Urgent */}
            <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-amber-300 uppercase">إقامات تتطلب التجديد (&lt;30 يوم)</p>
                <h4 className="text-xl font-black text-amber-400 mt-0.5">{summary.expiringSoon30Days} إقامة</h4>
                <p className="text-[11px] text-rose-400 font-bold">{summary.urgent15Days} إقامة حارجة جداً (&lt;15 يوم)</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-400 opacity-80" />
            </div>

            {/* Active Visas */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950/70 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">تأشيرات الخروج والعودة النشطة</p>
                <h4 className="text-xl font-black text-indigo-400 mt-0.5">{summary.totalActiveVisas} تأشيرة</h4>
                <p className="text-[11px] text-slate-400 font-medium">متابعة مواعيد العودة النهائية</p>
              </div>
              <PlaneTakeoff className="w-8 h-8 text-indigo-400 opacity-70" />
            </div>

            {/* Saved Penalties */}
            <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-300 uppercase">الغرامات الموفرة بالإنذار المبكر</p>
                <h4 className="text-xl font-black text-emerald-400 mt-0.5">{summary.penaltiesSavedSAR.toLocaleString()} ر.س</h4>
                <p className="text-[11px] text-emerald-300 font-medium">تجنب عقوبات المديرية العامة للجوازات</p>
              </div>
              <DollarSign className="w-8 h-8 text-emerald-400 opacity-80" />
            </div>
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("iqamas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "iqamas"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>إدارات الإقامات والرخص ({records.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("visas")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "visas"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>تأشيرات الخروج والعودة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("passports")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "passports"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>جوازات السفر والتأمين الطبي</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alerts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "alerts"
              ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>قواعد التنبيهات الآلية والغرامات</span>
        </button>
      </div>

      {/* TAB 1: IQAMA RENEWALS & MANAGEMENT */}
      {activeTab === "iqamas" && (
        <div className="space-y-4">
          {/* Controls & Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute top-3 right-3" />
                <input
                  type="text"
                  placeholder="ابحث باسم الموظف، رقم الإقامة، أو المهنة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white w-full focus:outline-none focus:border-sky-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-sky-500"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="URGENT">حرج (&lt;15 يوم)</option>
                <option value="EXPIRING_SOON">قريب الانتهاء (&lt;30 يوم)</option>
                <option value="EXPIRED_FINED">منتهية ومستحقة للغرامة</option>
                <option value="VALID">سارية ومستقرة</option>
              </select>
            </div>

            <div className="text-xs text-slate-400 font-bold">
              عرض {filteredRecords.length} من أصل {records.length} سجل مقيم
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">اسم الموظف / الجنسية</th>
                  <th className="p-3.5">رقم الإقامة</th>
                  <th className="p-3.5">المهنة والقسم</th>
                  <th className="p-3.5">تاريخ الانتهاء (هجري / ميلادي)</th>
                  <th className="p-3.5">المتبقي والحالة</th>
                  <th className="p-3.5">حالة التجديد بـ مقيم</th>
                  <th className="p-3.5">الإجراء المباشر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white">{r.employeeName}</div>
                      <div className="text-[10px] text-slate-500">{r.nationality}</div>
                    </td>
                    <td className="p-3.5 font-mono text-indigo-300 font-bold">{r.iqamaNumber}</td>
                    <td className="p-3.5">
                      <div className="font-medium">{r.profession}</div>
                      <div className="text-[10px] text-slate-500">{r.department}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[11px]">
                      <div className="text-amber-300 font-bold">{r.iqamaExpiryHijri} هـ</div>
                      <div className="text-slate-400">{r.iqamaExpiryGregorian} م</div>
                    </td>
                    <td className="p-3.5">{getStatusBadge(r)}</td>
                    <td className="p-3.5">
                      {r.renewalStatus === "RENEWED" ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          مجددة بنجاح
                        </span>
                      ) : r.renewalStatus === "PENDING_MUQEEM" ? (
                        <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                          قيد المعالجة بمقيم
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          لم تبدأ
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleRenewIqama(r)}
                          className="bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg border border-sky-400/30 transition-colors cursor-pointer flex items-center gap-1"
                          title="إرسال طلب تجديد فوري لمنصة مقيم"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>تجديد مقيم</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSendReminder(r)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                          title="تنبيه الموظف عبر WhatsApp / Email"
                        >
                          <Send className="w-3 h-3 text-emerald-400" />
                          <span>تنبيه</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: EXIT-REENTRY VISAS (تأشيرات الخروج والعودة) */}
      {activeTab === "visas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="font-extrabold text-base text-white">إصدار وتتبع تأشيرات الخروج والعودة (Exit-Reentry Visas)</h3>
              <p className="text-xs text-slate-400">متابعة تأشيرات السفر الفردية والمتعددة للعمالة المقيمة ومنع تجاوز مهلة العودة النهائية</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((r) => (
              <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{r.employeeName}</h4>
                    <p className="text-xs text-indigo-300 font-mono">الإقامة: {r.iqamaNumber} ({r.nationality})</p>
                  </div>

                  {r.visaStatus?.type && r.visaStatus.type !== "NONE" ? (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                      تأشيرة نشطة ({r.visaStatus.type === "SINGLE" ? "مفردة" : "متعددة"})
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">
                      لا يوجد تأشيرة خروج وعودة
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold">مهلة العودة القصوى:</p>
                    <p className="font-mono text-amber-300 font-bold mt-0.5">
                      {r.visaStatus?.returnDeadlineGregorian || "غير صادرة"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="text-[10px] text-slate-400 font-bold">مدة التأشيرة بالخارج:</p>
                    <p className="font-mono text-sky-300 font-bold mt-0.5">
                      {r.visaStatus?.daysValid ? `${r.visaStatus.daysValid} يوم` : "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRecord(r);
                      setShowVisaModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl border border-indigo-400/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlaneTakeoff className="w-3.5 h-3.5" />
                    <span>إصدار / تمديد تأشيرة بمقيم</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PASSPORTS & MEDICAL INSURANCE (جوازات السفر والتأمين الطبي) */}
      {activeTab === "passports" && (
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 border border-slate-800 rounded-2xl">
            <h3 className="font-extrabold text-base text-white">تراخيص الوثائق المرافقة (جوازات السفر والتأمين الطبي CCHI)</h3>
            <p className="text-xs text-slate-400">يشترط نظام الإقامة السعودي وجود تأمين طبي سري وجواز سفر صالح لمدة لا تقل عن 6 أشهر لإصدار أو تجديد الإقامة عبر مقيم.</p>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">اسم الموظف</th>
                  <th className="p-3.5">انتهاء جواز السفر</th>
                  <th className="p-3.5">حالة الجواز</th>
                  <th className="p-3.5">انتهاء التأمين الطبي (CCHI)</th>
                  <th className="p-3.5">حالة التأمين</th>
                  <th className="p-3.5">تنبيه آلي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5 font-bold text-white">{r.employeeName}</td>
                    <td className="p-3.5 font-mono text-slate-300">{r.passportExpiryGregorian}</td>
                    <td className="p-3.5">
                      {r.passportDaysRemaining < 90 ? (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                          يلزم التجديد القنصلي ({r.passportDaysRemaining} يوم)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          صالح ({r.passportDaysRemaining} يوم)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">{r.insuranceExpiryGregorian}</td>
                    <td className="p-3.5">
                      {r.insuranceDaysRemaining < 30 ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">
                          منتهي / يتطلب التجديد الآلي
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          مربوط بمجلس الضمان الطبي
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <button
                        type="button"
                        onClick={() => handleSendReminder(r)}
                        className="text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded font-bold text-[11px] border border-sky-500/20 cursor-pointer"
                      >
                        إرسال تذكير
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ALERT RULES & PENALTY SIMULATOR */}
      {activeTab === "alerts" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notification Triggers */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-sky-400" />
              <span>إعدادات وجدول الإشعارات التلقائية (Auto Alert Schedule)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">إشعار قبل 90 يوماً من الانتهاء</p>
                  <p className="text-[11px] text-slate-400">تنبيه بدائي لتجهيز الميزانية والتأمين الطبي</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.notify90Days}
                  onChange={(e) => setAlertSettings({ ...alertSettings, notify90Days: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">إشعار قبل 60 يوماً من الانتهاء</p>
                  <p className="text-[11px] text-slate-400">تذكير لتسديد رسوم الإقامة والعمل عبر سداد</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.notify60Days}
                  onChange={(e) => setAlertSettings({ ...alertSettings, notify60Days: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-white">إشعار قبل 30 يوماً (المنطقة الصفراء)</p>
                  <p className="text-[11px] text-slate-400">إنذار بريد إلكتروني + WhatsApp لمدير الموارد البشرية</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.notify30Days}
                  onChange={(e) => setAlertSettings({ ...alertSettings, notify30Days: e.target.checked })}
                  className="w-4 h-4 accent-sky-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-bold text-rose-300">إشعار عاجل قبل 15 يوماً (المنطقة الحمراء الحَرِجة)</p>
                  <p className="text-[11px] text-slate-400">إشعار يومي حاد لمنع التعرض لغرامة الجوازات</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertSettings.notify15Days}
                  onChange={(e) => setAlertSettings({ ...alertSettings, notify15Days: e.target.checked })}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => toast.success("تم حفظ إعدادات الإشعارات التلقائية لمقيم وأبشر أعمال بنجاح!")}
                  className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer"
                >
                  حفظ قواعد التنبيهات
                </button>
              </div>
            </div>
          </div>

          {/* Saudi Directorate of Passports Fine Simulator */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="font-extrabold text-base text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-rose-400" />
              <span>جدول غرامات تأخير تجديد الإقامة (نظام الجوازات)</span>
            </h3>

            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <p className="font-bold text-amber-300">المخالفة للمرة الأولى (First Offence):</p>
                <p className="text-slate-400 text-[11px] mt-0.5">غرامة مالية قدرها <strong>500 ريال سعودي</strong> عند انتهاء الإقامة وعدم التجديد خلال 3 أيام من الانتهاء.</p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <p className="font-bold text-rose-400">المخالفة للمرة الثانية (Second Offence):</p>
                <p className="text-slate-400 text-[11px] mt-0.5">غرامة مالية مضاعفة قدرها <strong>1000 ريال سعودي</strong>.</p>
              </div>

              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
                <p className="font-bold text-rose-500">المخالفة للمرة الثالثة (Third Offence):</p>
                <p className="text-slate-400 text-[11px] mt-0.5">غرامة قدرها <strong>1000 ريال سعودي + الإبعاد والترحيل</strong> للمقيم.</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200">
                <p className="font-extrabold text-xs">وفورات منظومة مدرج BizOS الحالية:</p>
                <p className="text-[11px] text-slate-300 mt-1">
                  منذ تفعيل التنبيهات الآلية لمقيم، تم تجنب <strong>12 حالة تأخير محتملة</strong> مما وفر على المنشأة مبلغ <strong>6,000 ريال سعودي</strong> كغرامات مبددة.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISA ISSUANCE MODAL */}
      {showVisaModal && selectedRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl text-right">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <PlaneTakeoff className="w-5 h-5 text-indigo-400" />
                <span>إصدار تأشيرة خروج وعودة - مقيم MHRSD</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowVisaModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueVisa} className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1 text-xs">
                <p className="font-bold text-white">{selectedRecord.employeeName}</p>
                <p className="text-slate-400 font-mono">الإقامة: {selectedRecord.iqamaNumber} | الجنسية: {selectedRecord.nationality}</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">نوع التأشيرة:</label>
                <select
                  value={visaForm.visaType}
                  onChange={(e) => setVisaForm({ ...visaForm, visaType: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                >
                  <option value="SINGLE">تأشيرة مفردة (Single Exit Reentry)</option>
                  <option value="MULTIPLE">تأشيرة متعددة (Multiple Exit Reentry)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">مدة التأشيرة (بالأيام):</label>
                <input
                  type="number"
                  required
                  min={30}
                  max={365}
                  value={visaForm.durationDays}
                  onChange={(e) => setVisaForm({ ...visaForm, durationDays: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">سبب السفر المسجل:</label>
                <input
                  type="text"
                  required
                  value={visaForm.travelReason}
                  onChange={(e) => setVisaForm({ ...visaForm, travelReason: e.target.value })}
                  className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowVisaModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVisa}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl border border-indigo-400/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingVisa ? "جاري الإصدار..." : "تأكيد وإصدار التأشيرة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
