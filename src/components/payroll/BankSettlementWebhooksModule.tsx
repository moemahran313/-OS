import React, { useState, useEffect } from "react";
import {
  Building2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Send,
  ShieldCheck,
  Copy,
  Code2,
  Terminal,
  Activity,
  ArrowUpRight,
  Clock,
  Layers,
  Zap,
  Sliders,
  DollarSign,
  FileCheck,
  FileText,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/src/lib/firebase";

interface WebhookLog {
  id: string;
  bankId: string;
  bankName: string;
  event: string;
  sifRef: string;
  totalAmount: number;
  employeesCount: number;
  status: "SUCCESS" | "PARTIAL_REJECTED" | "FAILED";
  signatureVerified: boolean;
  httpStatus: number;
  receivedAt: string;
  details: string;
  webhookTxId?: string;
}

interface BankConfig {
  endpoints: Record<string, string>;
  supportedBanks: Array<{
    id: string;
    nameAr: string;
    nameEn: string;
    code: string;
    swift: string;
  }>;
}

export default function BankSettlementWebhooksModule() {
  const [activeTab, setActiveTab] = useState<"activity" | "simulator" | "endpoints">("activity");
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [config, setConfig] = useState<BankConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulator state
  const [simForm, setSimForm] = useState({
    bankId: "snb",
    event: "SETTLEMENT_CONFIRMED",
    sifRef: "SIF_2026-06",
    totalAmount: 142500,
    employeesCount: 18,
    rejectionReason: "خطأ في صيغة الآيبان (IBAN) للموظف رقم 15",
  });

  // Fetch Webhook Config & Live Logs
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const [logsRes, configRes] = await Promise.all([
        fetch("/api/bank-webhooks/logs", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/bank-webhooks/config", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (logsRes.ok) {
        const data = await logsRes.json();
        setLogs(data);
      }
      if (configRes.ok) {
        const confData = await configRes.json();
        setConfig(confData);
      }
    } catch (err) {
      console.error("Failed to fetch bank webhook logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle Simulation Submission
  const handleSimulateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/bank-webhooks/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(simForm),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message || "تم استقبال الكولباك البنكي ومعالجته بنجاح!");
        fetchLogs();
        setActiveTab("activity");
      } else {
        toast.error(data.error || "فشل إرسال الكولباك");
      }
    } catch (err) {
      toast.error("خطأ في الاتصال بسيرفر الكولباك");
    } finally {
      setIsSimulating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الرابط إلى الحافظة!");
  };

  const getBankBadge = (bankId: string) => {
    switch (bankId) {
      case "snb":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "alrajhi":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30";
      case "sab":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30";
      case "anb":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "mudad":
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-full uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                ربط كولباك البنوك المباشر (Direct Bank Settlement Webhooks)
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-mono">
                Real-Time SIF Processing
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              إشعارات إيداع الرواتب الحية ومطابقة منصة مدد و البنوك السعودية
            </h2>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              استقبال كولباك ثنائي الاتجاه (Two-Way Callbacks) مباشرة من البنوك التجارية (الأهلي SNB، الراجحي، الأول SAB، العربي ANB) ومنصة مدد لتأكيد صرف أجور SIF وتحديث حالة السجلات فورياً.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={fetchLogs}
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs px-5 py-3 rounded-2xl border border-indigo-400/30 shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              <span>تحديث سجلات الكولباك</span>
            </button>
          </div>
        </div>

        {/* Bank Integration Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          {[
            { id: "snb", name: "البنك الأهلي (SNB)", code: "NCBKSA22", icon: Building2, status: "نشط / Live" },
            { id: "alrajhi", name: "مصرف الراجحي", code: "RJBISA22", icon: Building2, status: "نشط / Live" },
            { id: "sab", name: "البنك الأول (SAB)", code: "SABB33", icon: Building2, status: "نشط / Live" },
            { id: "anb", name: "البنك العربي (ANB)", code: "ARNBSA22", icon: Building2, status: "نشط / Live" },
            { id: "mudad", name: "منصة مدد (WPS)", code: "MUDADSA", icon: ShieldCheck, status: "توثيق آلي" },
          ].map((b) => (
            <div key={b.id} className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getBankBadge(b.id)}`}>
                  {b.status}
                </span>
                <b.icon className="w-4 h-4 text-slate-400" />
              </div>
              <h4 className="text-xs font-black text-white">{b.name}</h4>
              <p className="text-[10px] font-mono text-slate-400">{b.code}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "activity"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>سجل الإشعارات المباشرة ({logs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("simulator")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "simulator"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>محاكي كولباك البنوك (Live Simulator)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("endpoints")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "endpoints"
              ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>روابط الويب هوك وتوقيع HMAC</span>
        </button>
      </div>

      {/* TAB 1: LIVE ACTIVITY LOGS */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-950">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5">الجهة البنكية / المنصة</th>
                  <th className="p-3.5">نوع الحدث (Event)</th>
                  <th className="p-3.5">مرجع ملف SIF</th>
                  <th className="p-3.5">المبلغ الإجمالي (ر.س)</th>
                  <th className="p-3.5">عدد الموظفين</th>
                  <th className="p-3.5">توقيع SHA-256</th>
                  <th className="p-3.5">حالة التسوية</th>
                  <th className="p-3.5">تاريخ وتوقيت الاستقبال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{log.bankName}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{log.webhookTxId || log.id}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-mono text-[11px] text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {log.event}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-300 font-bold">{log.sifRef}</td>
                    <td className="p-3.5 font-mono text-emerald-400 font-bold">
                      {log.totalAmount ? log.totalAmount.toLocaleString() : "0"} ر.س
                    </td>
                    <td className="p-3.5 font-mono">{log.employeesCount} موظف</td>
                    <td className="p-3.5">
                      {log.signatureVerified ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 w-fit">
                          <Lock className="w-3 h-3" /> موثق HMAC
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                          عام
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      {log.status === "SUCCESS" ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" /> تم الإيداع بنجاح
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 border border-rose-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3.5 h-3.5" /> مرفوض جزئياً
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {new Date(log.receivedAt).toLocaleString("ar-SA")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SIMULATOR */}
      {activeTab === "simulator" && (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>اختبار إرسال كولباك بنكي حي (Simulate Direct Bank Webhook)</span>
              </h3>
              <p className="text-xs text-slate-400">محاكاة إشعارات البنوك التجارية السعودية لتحديث حالة صرف مسيرات الرواتب تلقائياً في النظام</p>
            </div>
          </div>

          <form onSubmit={handleSimulateWebhook} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">اختر البنك أو المنصة المرسلة:</label>
              <select
                value={simForm.bankId}
                onChange={(e) => setSimForm({ ...simForm, bankId: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
              >
                <option value="snb">البنك الأهلي السعودي (SNB)</option>
                <option value="alrajhi">مصرف الراجحي (Al Rajhi)</option>
                <option value="sab">البنك السعودي الأول (SAB)</option>
                <option value="anb">البنك العربي الوطني (ANB)</option>
                <option value="mudad">منصة مدد (Mudad WPS)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">نوع إشعار الكولباك (Event Type):</label>
              <select
                value={simForm.event}
                onChange={(e) => setSimForm({ ...simForm, event: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
              >
                <option value="SETTLEMENT_CONFIRMED">إكتمال تسوية وإيداع الرواتب (SETTLEMENT_CONFIRMED)</option>
                <option value="WPS_COMPLIANCE_APPROVED">توثيق حماية الأجور بـ مدد (WPS_COMPLIANCE_APPROVED)</option>
                <option value="PARTIAL_DISBURSEMENT_REJECTED">رفض جزئي لعدم صحة الآيبان (PARTIAL_REJECTED)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">مرجع ملف الرواتب SIF:</label>
              <input
                type="text"
                required
                value={simForm.sifRef}
                onChange={(e) => setSimForm({ ...simForm, sifRef: e.target.value })}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">المبلغ المسوى إجمالاً (ر.س):</label>
              <input
                type="number"
                required
                value={simForm.totalAmount}
                onChange={(e) => setSimForm({ ...simForm, totalAmount: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">عدد الحوالات / الموظفين:</label>
              <input
                type="number"
                required
                value={simForm.employeesCount}
                onChange={(e) => setSimForm({ ...simForm, employeesCount: Number(e.target.value) })}
                className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            {simForm.event === "PARTIAL_DISBURSEMENT_REJECTED" && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-300">سبب الرفض المرجع من البنك:</label>
                <input
                  type="text"
                  value={simForm.rejectionReason}
                  onChange={(e) => setSimForm({ ...simForm, rejectionReason: e.target.value })}
                  className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-3 w-full focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}

            <div className="md:col-span-2 pt-4 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSimulating}
                className="bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-extrabold text-xs px-6 py-3 rounded-xl border border-amber-400/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSimulating ? "جاري المعالجة..." : "إرسال كولباك الويب هوك التجريبي"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: ENDPOINTS & HMAC CONFIG */}
      {activeTab === "endpoints" && config && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.supportedBanks.map((b) => {
              const url = config.endpoints[b.id] || "";
              return (
                <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-400" />
                      <h4 className="font-extrabold text-white text-xs">{b.nameAr}</h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                      SWIFT: {b.swift}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-slate-400">رابط Webhook Endpoint:</p>
                    <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <input
                        type="text"
                        readOnly
                        value={url}
                        className="bg-transparent text-[11px] font-mono text-emerald-300 w-full focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url)}
                        className="p-1.5 hover:bg-slate-800 text-slate-300 rounded-lg transition-colors cursor-pointer"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between">
                    <span>الهيدر المطلوب للتوقيع:</span>
                    <span className="font-mono text-indigo-300 font-bold">x-bank-signature: SHA256(HMAC)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
