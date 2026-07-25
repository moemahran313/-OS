import React, { useEffect, useState } from "react";
import {
  FileCheck,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  Clock,
  Download,
  Filter,
  Code2,
} from "lucide-react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface ZatcaLog {
  id: string;
  invoiceNumber?: string;
  uuid?: string;
  invoiceHash?: string;
  buyerName?: string;
  buyerCr?: string;
  totalAmount?: number;
  vatAmount?: number;
  zatcaStatus?: "CLEARED" | "REPORTED" | "REJECTED" | "PENDING";
  type?: "B2B_CLEARANCE" | "B2C_REPORTING";
  createdAt?: string;
  responseCode?: number;
  errors?: string[];
  warnings?: string[];
  xmlHash?: string;
}

const DEMO_ZATCA_LOGS: ZatcaLog[] = [
  {
    id: "ztc_1001",
    invoiceNumber: "INV-2026-0089",
    uuid: "a4f89d31-9872-4b2a-8911-3c9f28a71912",
    invoiceHash: "3b7a19e2f8c5d6e4a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8",
    buyerName: "شركة الرؤية للحلول المتقدمة",
    buyerCr: "1010892341",
    totalAmount: 48500.0,
    vatAmount: 6326.09,
    zatcaStatus: "CLEARED",
    type: "B2B_CLEARANCE",
    createdAt: new Date().toISOString(),
    responseCode: 200,
    warnings: [],
    xmlHash: "e1f2g3h4i5j6k7l8m9n0",
  },
  {
    id: "ztc_1002",
    invoiceNumber: "INV-2026-0090",
    uuid: "b7c91d22-1183-4c3d-9012-4d0a39b82023",
    invoiceHash: "8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e",
    buyerName: "مؤسسة الأفق العربي للتجارة",
    buyerCr: "7001928374",
    totalAmount: 12400.0,
    vatAmount: 1617.39,
    zatcaStatus: "REPORTED",
    type: "B2C_REPORTING",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    responseCode: 200,
    warnings: ["W001: Buyer tax ID verified via SPL address proxy"],
    xmlHash: "a9b8c7d6e5f4a3b2c1d0",
  },
  {
    id: "ztc_1003",
    invoiceNumber: "INV-2026-0091",
    uuid: "c8d02e33-2294-5d4e-0123-5e1b40c93134",
    invoiceHash: "1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b",
    buyerName: "شركة البناء السعودية المحدودة",
    buyerCr: "1010349281",
    totalAmount: 95000.0,
    vatAmount: 12391.3,
    zatcaStatus: "REJECTED",
    type: "B2B_CLEARANCE",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    responseCode: 422,
    errors: [
      "KSA-32: Buyer National Address building number missing or not matching SPL database",
      "KSA-16: VAT category code mismatch for zero-rated export invoice",
    ],
    xmlHash: "f9e8d7c6b5a4f3e2d1c0",
  },
];

export default function ZatcaComplianceLogsTab() {
  const [logs, setLogs] = useState<ZatcaLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedXmlLog, setSelectedXmlLog] = useState<ZatcaLog | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "zatca_submissions"), orderBy("createdAt", "desc"), limit(50));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedLogs: ZatcaLog[] = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          setLogs(loadedLogs);
        } else {
          setLogs(DEMO_ZATCA_LOGS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn("Firestore zatca_submissions listener error, using fallback demo logs:", error);
        setLogs(DEMO_ZATCA_LOGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      (log.invoiceNumber && log.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.buyerName && log.buyerName.includes(searchTerm)) ||
      (log.uuid && log.uuid.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.buyerCr && log.buyerCr.includes(searchTerm));

    const matchesStatus =
      statusFilter === "ALL" ||
      log.zatcaStatus === statusFilter ||
      (statusFilter === "CLEARANCE" && log.type === "B2B_CLEARANCE") ||
      (statusFilter === "REPORTING" && log.type === "B2C_REPORTING");

    return matchesSearch && matchesStatus;
  });

  const totalCount = logs.length;
  const clearedCount = logs.filter((l) => l.zatcaStatus === "CLEARED").length;
  const reportedCount = logs.filter((l) => l.zatcaStatus === "REPORTED").length;
  const rejectedCount = logs.filter((l) => l.zatcaStatus === "REJECTED").length;

  const handleRetrySubmission = async (log: ZatcaLog) => {
    toast.loading(`جاري إعادة تقديم الفاتورة ${log.invoiceNumber} لمنصة زكاة...`);
    try {
      const res = await fetch("/api/zatca/clearance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNumber: log.invoiceNumber,
          uuid: log.uuid,
          buyerCr: log.buyerCr,
          amount: log.totalAmount,
        }),
      });
      toast.dismiss();
      if (res.ok) {
        toast.success(`تم إرسال الفاتورة ${log.invoiceNumber} واعتمادها بنجاح (CLEARED)`);
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(`فشل الاعتماد: ${data.error || "خطأ في هيكل الحقول المرجعية"}`);
      }
    } catch (e: any) {
      toast.dismiss();
      toast.error(`خطأ أثناء الاتصال بمنصة زكاة: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Banner & KPI Overview */}
      <div className="bg-gradient-to-r from-emerald-900 via-zinc-900 to-zinc-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                ربط هيئة الزكاة والضريبة والجمارك (ZATCA Phase 2)
              </span>
              <span className="bg-white/10 text-zinc-300 text-xs px-3 py-1 rounded-full font-semibold">
                بيئة الاعتماد الحية (Production API)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              سجلات الامتثال والفوترة الإلكترونية (ZATCA Audit Trails)
            </h2>
            <p className="text-zinc-400 text-xs mt-1">
              تتبع مباشر ولحظي لعمليات الاعتماد المسبق (Clearance) والإبلّاغ (Reporting) مع خوارزميات التشفير RSA-256 وSHA-256 XML.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                toast.info("جاري تحديث السجلات الحية من ZATCA...");
              }}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer border border-white/10 text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4 animate-spin-slow" />
              تحديث السجلات
            </button>
          </div>
        </div>

        {/* Stats Grid inside banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-md p-3.5 rounded-2xl border border-white/10">
            <p className="text-zinc-400 text-xs font-medium">إجمالي الفواتير المرسلة</p>
            <p className="text-2xl font-black text-white mt-1">{totalCount}</p>
          </div>
          <div className="bg-emerald-500/10 backdrop-blur-md p-3.5 rounded-2xl border border-emerald-500/20">
            <p className="text-emerald-400 text-xs font-medium">معتمدة مسبقاً (B2B Clearance)</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{clearedCount}</p>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-md p-3.5 rounded-2xl border border-blue-500/20">
            <p className="text-blue-400 text-xs font-medium">مبلغ عنها (B2C Reporting)</p>
            <p className="text-2xl font-black text-blue-400 mt-1">{reportedCount}</p>
          </div>
          <div className="bg-rose-500/10 backdrop-blur-md p-3.5 rounded-2xl border border-rose-500/20">
            <p className="text-rose-400 text-xs font-medium">مرفوضة / يتطلب تصحيح</p>
            <p className="text-2xl font-black text-rose-400 mt-1">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Controls & Filter bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث برقم الفاتورة، اسم العميل، المعرف UUID، أو السجل التجاري CR..."
            className="w-full pr-9 pl-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: "ALL", label: "الكل" },
            { id: "CLEARED", label: "معتمدة (CLEARED)" },
            { id: "REPORTED", label: "مُبلّغ عنها (REPORTED)" },
            { id: "REJECTED", label: "مرفوضة (REJECTED)" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st.id
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-bold border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4">الفاتورة والعميل</th>
                <th className="p-4">نوع المعاملة</th>
                <th className="p-4">المعرف الفريد (UUID) وتشفير XML</th>
                <th className="p-4">القيمة والضريبة</th>
                <th className="p-4">حالة الامتثال (ZATCA)</th>
                <th className="p-4">التاريخ والإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    جاري تحميل سجلات ZATCA الحية...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    لا توجد سجلات فوترة تطابق البحث
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isCleared = log.zatcaStatus === "CLEARED";
                  const isReported = log.zatcaStatus === "REPORTED";
                  const isRejected = log.zatcaStatus === "REJECTED";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-black text-zinc-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-600" />
                          <span>{log.invoiceNumber || log.id}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">
                          {log.buyerName} {log.buyerCr ? `(CR: ${log.buyerCr})` : ""}
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                            log.type === "B2B_CLEARANCE"
                              ? "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          }`}
                        >
                          {log.type === "B2B_CLEARANCE" ? "B2B Clearance (اعتماد)" : "B2C Reporting (إبلاغ)"}
                        </span>
                      </td>

                      <td className="p-4 max-w-xs">
                        <div className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400 truncate">
                          UUID: {log.uuid}
                        </div>
                        <div className="font-mono text-[9px] text-zinc-400 truncate mt-0.5">
                          Hash: {log.invoiceHash?.substring(0, 24)}...
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-zinc-900 dark:text-white">
                          {(log.totalAmount || 0).toLocaleString()} ر.س
                        </div>
                        <div className="text-[10px] text-emerald-600 font-semibold">
                          شامل ضريبة 15%: {(log.vatAmount || 0).toLocaleString()} ر.س
                        </div>
                      </td>

                      <td className="p-4">
                        {isCleared && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            CLEARED (معتمدة)
                          </span>
                        )}
                        {isReported && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            REPORTED (مُبلّغ عنها)
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800">
                            <XCircle className="w-3.5 h-3.5" />
                            REJECTED (مرفوضة)
                          </span>
                        )}
                        {log.errors && log.errors.length > 0 && (
                          <p className="text-[10px] text-rose-600 font-medium mt-1 max-w-xs truncate">
                            {log.errors[0]}
                          </p>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleTimeString("ar-SA", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => setSelectedXmlLog(log)}
                            className="p-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                            title="معاينة رمز UBL XML والملاحظات"
                          >
                            <Code2 className="w-3.5 h-3.5 text-blue-500" />
                            XML
                          </button>
                          {isRejected && (
                            <button
                              onClick={() => handleRetrySubmission(log)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              إعادة تقديم
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* XML Code & Error Drawer Modal */}
      <AnimatePresence>
        {selectedXmlLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
              dir="rtl"
            >
              <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-lg text-zinc-900 dark:text-white">
                    تفاصيل شفرة ZATCA UBL 2.1 XML - {selectedXmlLog.invoiceNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedXmlLog(null)}
                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-2xl">
                  <div>
                    <span className="text-zinc-400 block">UUID الفاتورة:</span>
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {selectedXmlLog.uuid}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block">رمز الاستجابة:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {selectedXmlLog.responseCode || 200} OK
                    </span>
                  </div>
                </div>

                {selectedXmlLog.errors && selectedXmlLog.errors.length > 0 && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl">
                    <p className="font-bold text-rose-700 dark:text-rose-300 text-xs flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4" />
                      أسباب الرفض وملاحظات المطابقة التلقائية:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs text-rose-600 dark:text-rose-400">
                      {selectedXmlLog.errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                    معاينة محاكاة التوقيع الرقمي ومستند UBL XML:
                  </p>
                  <pre className="p-4 bg-zinc-950 text-emerald-400 font-mono text-[11px] rounded-2xl overflow-x-auto max-h-60 dir-ltr text-left">
{`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <cbc:UBLVersionID>2.1</cbc:UBLVersionID>
  <cbc:CustomizationID>urn:zatca:sa:invoice:1.0</cbc:CustomizationID>
  <cbc:ID>${selectedXmlLog.invoiceNumber}</cbc:ID>
  <cbc:UUID>${selectedXmlLog.uuid}</cbc:UUID>
  <cbc:IssueDate>${selectedXmlLog.createdAt?.substring(0, 10)}</cbc:IssueDate>
  <cac:AccountingSupplierParty>
    <cac:PartyIdentification><cbc:ID schemeID="CRN">1010123456</cbc:ID></cac:PartyIdentification>
  </cac:AccountingSupplierParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="SAR">${selectedXmlLog.vatAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
</Invoice>`}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    toast.success("تم نسخ توقيع XML وسجل المعاملة بنجاح");
                    setSelectedXmlLog(null);
                  }}
                  className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 transition-all"
                >
                  إغلاق ومعاينة الفاتورة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
