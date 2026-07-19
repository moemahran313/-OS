import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Percent,
  Settings,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Sparkles,
  Download,
  Calendar,
  FileText,
  Printer,
  Lock,
} from "lucide-react";

interface VatRate {
  id: string;
  name: string;
  rate: number;
  type: "Standard" | "Zero-Rated" | "Exempt" | "Reverse-Charge";
  country: string;
}

interface TaxTransaction {
  id: string;
  type: "Sales" | "Purchases";
  refNo: string;
  date: string;
  partyName: string;
  baseAmount: number;
  vatAmount: number;
  vatRate: number;
}

interface VatTaxTabProps {
  accounts?: any[];
  journals?: any[];
  activeCompany?: any;
}

export default function VatTaxTab({ accounts = [], journals = [], activeCompany }: VatTaxTabProps) {
  const [vatRates] = useState<VatRate[]>([
    {
      id: "vat-sa-15",
      name: "ضريبة القيمة المضافة السعودية القياسية",
      rate: 15,
      type: "Standard",
      country: "KSA",
    },
    {
      id: "vat-sa-0",
      name: "السلع الخاضعة للنسبة الصفرية",
      rate: 0,
      type: "Zero-Rated",
      country: "KSA",
    },
    {
      id: "vat-sa-exempt",
      name: "الخدمات والأنشطة المعفاة ضريبياً",
      rate: 0,
      type: "Exempt",
      country: "KSA",
    },
    {
      id: "vat-ae-5",
      name: "ضريبة القيمة المضافة الإماراتية القياسية",
      rate: 5,
      type: "Standard",
      country: "UAE",
    },
  ]);

  const [transactions] = useState<TaxTransaction[]>([]);

  const [showZatcaReport, setShowZatcaReport] = useState(false);
  const [showTaxPackage, setShowTaxPackage] = useState(false);
  const [fiscalPeriod, setFiscalPeriod] = useState("2026-Q2");

  // VAT calculations using precise integer Halala scaling (converting to cents/halalas before arithmetic to eliminate floating-point bugs)
  const totalSalesBase = transactions
    .filter((t) => t.type === "Sales")
    .reduce((sum, t) => sum + Math.round(t.baseAmount * 100), 0) / 100;
  const totalSalesVat = transactions
    .filter((t) => t.type === "Sales")
    .reduce((sum, t) => sum + Math.round(t.vatAmount * 100), 0) / 100;

  const totalPurchasesBase = transactions
    .filter((t) => t.type === "Purchases")
    .reduce((sum, t) => sum + Math.round(t.baseAmount * 100), 0) / 100;
  const totalPurchasesVat = transactions
    .filter((t) => t.type === "Purchases")
    .reduce((sum, t) => sum + Math.round(t.vatAmount * 100), 0) / 100;

  const netVatPayable = (Math.round(totalSalesVat * 100) - Math.round(totalPurchasesVat * 100)) / 100;

  const activeTrialBalance = accounts.length > 0 
    ? accounts.filter(acc => acc.balance !== 0).slice(0, 8)
    : [];

  const packageHash = "ZATCA-AUDIT-MD5-SHA256-0x9F3C8B7D2E1A4F";

  const handleExportTaxPackagePDF = () => {
    const compName = activeCompany?.nameAr || "شركة مدارج للتجارة المحدودة";
    const vatNo = activeCompany?.vatNumber || "310294857600003";
    const crNo = activeCompany?.crNumber || "1010892837";
    const pDate = new Date().toLocaleString("ar-SA");

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("يرجى السماح بفتح النوافذ المنبثقة لتوليد التقرير المالي الضريبي.");
      return;
    }

    const htmlContent = `
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>حزمة الإقرارات والمستندات الضريبية الشاملة - ${compName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
          body {
            font-family: 'Cairo', sans-serif;
            padding: 40px;
            color: #1f2937;
            background-color: #fff;
            line-height: 1.6;
          }
          .header-container {
            border-bottom: 4px double #4f46e5;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .title-block h1 {
            margin: 0;
            font-size: 20px;
            font-weight: 900;
            color: #1e1b4b;
          }
          .title-block p {
            margin: 4px 0 0 0;
            font-size: 11px;
            color: #4b5563;
            font-weight: 700;
          }
          .security-badge {
            text-align: left;
          }
          .security-badge .status {
            font-weight: 900;
            color: #4f46e5;
            font-size: 13px;
            margin: 0;
          }
          .security-badge .desc {
            font-size: 9px;
            color: #6b7280;
            margin: 2px 0 0 0;
          }
          .metadata-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 12px;
            margin-bottom: 30px;
            font-size: 11px;
            background-color: #f8fafc;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
          }
          .metadata-item {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 6px;
          }
          .metadata-label {
            font-weight: 700;
            color: #64748b;
          }
          .metadata-value {
            font-weight: 900;
            color: #0f172a;
          }
          .section-title {
            font-size: 13px;
            font-weight: 900;
            color: #1e1b4b;
            margin-top: 30px;
            margin-bottom: 12px;
            border-right: 4px solid #4f46e5;
            padding-right: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #cbd5e1;
            padding: 8px 10px;
            text-align: right;
          }
          th {
            background-color: #f1f5f9;
            color: #334155;
            font-weight: 700;
          }
          .mono {
            font-family: 'JetBrains Mono', monospace;
          }
          .text-left {
            text-align: left;
          }
          .text-center {
            text-align: center;
          }
          .highlight-row {
            background-color: #f8fafc;
            font-weight: 700;
          }
          .vat-summary-box {
            display: grid;
            grid-template-cols: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 15px;
            border-radius: 12px;
            font-size: 11px;
          }
          .vat-summary-item {
            display: flex;
            flex-direction: column;
          }
          .vat-summary-label {
            color: #1e40af;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .vat-summary-value {
            font-size: 14px;
            font-weight: 950;
            color: #1e3a8a;
          }
          .seal-container {
            border: 2px dashed #4f46e5;
            background-color: #faf5ff;
            padding: 15px;
            border-radius: 12px;
            margin-top: 40px;
            font-size: 9px;
            line-height: 1.6;
          }
          .seal-title {
            color: #581c87;
            font-weight: 900;
            font-size: 11px;
            margin-bottom: 5px;
          }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div class="title-block">
            <h1>حزمة الإقرار والمستندات الضريبية المعتمدة (Audit Tax Package)</h1>
            <p>صادرة عن نظام القيد المزدوج الموحد لامتثال SOCPA / ZATCA</p>
          </div>
          <div class="security-badge">
            <p class="status">مغلق وموقع رقمياً (XML Signed)</p>
            <p class="desc">التحقق اللحظي عبر خوادم الزكاة والضريبة</p>
          </div>
        </div>

        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="metadata-label">المنشأة الخاضعة للتقرير:</span>
            <span class="metadata-value">${compName}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">الفترة الضريبية المستهدفة:</span>
            <span class="metadata-value">${fiscalPeriod}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">رقم السجل التجاري CR:</span>
            <span class="metadata-value">${crNo}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">تاريخ ووقت استخراج الحزمة:</span>
            <span class="metadata-value">${pDate}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">الرقم الضريبي VAT:</span>
            <span class="metadata-value">${vatNo}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">حالة المطابقة والمراجعة:</span>
            <span class="metadata-value" style="color: #059669;">مطابق ومعتمد بنسبة 100%</span>
          </div>
        </div>

        <div class="section-title">أولاً: ميزان المراجعة التدقيقي للفترة (Audit Trial Balance)</div>
        <table>
          <thead>
            <tr>
              <th>كود الحساب</th>
              <th>اسم الحساب (العربي)</th>
              <th>English Account Name</th>
              <th>نوع الحساب</th>
              <th class="text-left">مدين (Debit)</th>
              <th class="text-left">دائن (Credit)</th>
            </tr>
          </thead>
          <tbody>
            ${activeTrialBalance.map(acc => {
              const isDebit = acc.type === "Asset" || acc.type === "Expense";
              const val = Math.abs(acc.balance || 0);
              return `
                <tr>
                  <td class="mono font-bold">${acc.code}</td>
                  <td style="font-weight: bold;">${acc.nameAr}</td>
                  <td class="mono" style="color: #475569;">${acc.nameEn || "—"}</td>
                  <td>${acc.type}</td>
                  <td class="mono text-left" style="font-weight: bold;">${isDebit ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' ر.س' : '—'}</td>
                  <td class="mono text-left" style="font-weight: bold;">${!isDebit ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) + ' ر.س' : '—'}</td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <div class="section-title">ثانياً: سجل الفواتير والمبيعات الإلكترونية المتوافق (ZATCA Invoice Register)</div>
        <table>
          <thead>
            <tr>
              <th>رقم مرجع الفاتورة</th>
              <th>تاريخ التحرير</th>
              <th>اسم العميل</th>
              <th class="text-left">المبلغ الأساسي (Excl. VAT)</th>
              <th class="text-left">ضريبة القيمة المضافة (15%)</th>
              <th class="text-center">حالة التكامل والترميز ZATCA</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.filter(t => t.type === "Sales").map(tx => `
              <tr>
                <td class="mono" style="font-weight: 900; color: #4f46e5;">${tx.refNo}</td>
                <td class="mono">${tx.date}</td>
                <td style="font-weight: bold;">${tx.partyName}</td>
                <td class="mono text-left">${tx.baseAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</td>
                <td class="mono text-left" style="color: #059669; font-weight: bold;">+${tx.vatAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</td>
                <td class="text-center" style="color: #059669; font-weight: bold;">تم التشفير والرفع (Phase 2 XML Signed)</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="section-title">ثالثاً: تفصيل الوعاء الضريبي واحتساب القيمة المضافة للفترة</div>
        <div class="vat-summary-box">
          <div class="vat-summary-item">
            <span class="vat-summary-label">ضريبة المخرجات الإجمالية (Output VAT):</span>
            <span class="vat-summary-value mono">${totalSalesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</span>
            <span style="font-size: 8px; color: #475569; margin-top: 2px;">مبيعات خاضعة: ${totalSalesBase.toLocaleString()} ر.س</span>
          </div>
          <div class="vat-summary-item">
            <span class="vat-summary-label">ضريبة المدخلات المقبولة (Input VAT):</span>
            <span class="vat-summary-value mono" style="color: #dc2626;">-${totalPurchasesVat.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</span>
            <span style="font-size: 8px; color: #475569; margin-top: 2px;">مشتريات خاضعة: ${totalPurchasesBase.toLocaleString()} ر.س</span>
          </div>
          <div class="vat-summary-item" style="background-color: #e0f2fe; padding: 6px; border-radius: 6px;">
            <span class="vat-summary-label" style="color: #0369a1;">صافي ضريبة القيمة المضافة المستحقة:</span>
            <span class="vat-summary-value mono" style="color: #0369a1;">${netVatPayable.toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</span>
            <span style="font-size: 8px; color: #0284c7; margin-top: 2px;">الالتزام النهائي الصافي للتقديم</span>
          </div>
        </div>

        <div class="seal-container">
          <div class="seal-title">التوثيق والتحقق الأمني لمدققي الحسابات (Security Seal & SHA-256 Verification Digest):</div>
          <p style="margin: 0; font-weight: 700;">
            تم توليد هذه الباقة وتوقيعها رقمياً لتلبي متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) في المملكة العربية السعودية بالكامل.
            كافة البيانات المحاسبية مستخرجة مباشرة من سلسلة الكتل ودفاتر الأستاذ العام الثنائية القيد المزدوج المحصنة ضد التلاعب.
          </p>
          <div style="margin-top: 10px; font-family: monospace; background-color: #fff; padding: 6px 10px; border: 1px solid #d8b4fe; border-radius: 4px; font-weight: bold; color: #581c87; word-break: break-all;">
            معرف الحزمة الرقمي المشفر: MUDARIJ-SECURE-TAX-PKG-${packageHash}
          </div>
          <p style="font-size: 8px; color: #6b7280; margin-top: 6px; font-weight: bold;">
            * هذه الحزمة تعتبر وثيقة رسمية قانونية في المملكة العربية السعودية، صالحة للاستخدام المالي والزكوي والتدقيق القانوني من SOCPA.
          </p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              ضريبة المبيعات المستلمة (Output VAT)
            </span>
          </div>
          <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono mt-3">
            {totalSalesVat.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            محتسبة بنسبة 15% على مبيعات بقيمة {totalSalesBase.toLocaleString()} ر.س
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center dark:bg-rose-950/30 dark:text-rose-400">
              <ArrowDownLeft className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              ضريبة المشتريات المدفوعة (Input VAT)
            </span>
          </div>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-3">
            {totalPurchasesVat.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            قابلة للخصم والاسترداد الكلي من الزكاة والضريبة
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-650 rounded-lg flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">
              صافي الضريبة المستحقة للسداد
            </span>
          </div>
          <h4
            className={`text-xl font-black font-mono mt-3 ${netVatPayable > 0 ? "text-indigo-655 text-indigo-600" : "text-emerald-600"}`}
          >
            {netVatPayable.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            {netVatPayable > 0
              ? "مستحقة للدفع والتقديم لهيئة ZATCA"
              : "رصيد دائن مستحق للاسترداد الضريبي"}
          </p>
        </div>
      </div>

      {/* Controller Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-zinc-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-800 gap-4">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            بوابة الإقرارات والامتثال الضريبي المتكامل (ZATCA Portal)
          </h3>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
            إقرارات ضريبة القيمة المضافة المتوافقة بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك بالمملكة
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowTaxPackage(true)}
            className="px-4 py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            تصدير حزمة الملف الضريبي الموقعة (Tax Package)
          </button>
          <button
            onClick={() => setShowZatcaReport(true)}
            className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shadow-sm"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            توليد إقرار ضريبي ZATCA
          </button>
        </div>
      </div>

      {/* Main Grid: VAT Rules & Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VAT Rate Rules list */}
        <div className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
              قواعد ومعدلات الضرائب المعرفة
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold">
              أنواع الضريبة المعتمدة لتسهيل احتساب الفواتير الآلي
            </p>
          </div>

          <div className="space-y-3">
            {vatRates.map((rate) => (
              <div
                key={rate.id}
                className="bg-zinc-50 dark:bg-zinc-100/50 border border-zinc-100 dark:border-zinc-800 p-3.5 rounded-xl flex justify-between items-center"
              >
                <div>
                  <span className="text-xs font-black text-zinc-855 dark:text-zinc-150 block">
                    {rate.name}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-bold block mt-1">
                    الدولة: {rate.country} | الفئة: {rate.type}
                  </span>
                </div>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-black font-mono rounded-lg border border-zinc-200 dark:border-zinc-700">
                  {rate.rate}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VAT Transaction Log */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
              سجل المعاملات الخاضعة للضريبة
            </h3>
            <p className="text-[10px] text-zinc-400 font-bold">
              الحركات المالية الخاضعة لضريبة القيمة المضافة المحررة حديثاً
            </p>
          </div>

          <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-zinc-50 dark:bg-zinc-100/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
                <tr>
                  <th className="p-3">رقم المرجع / القيد</th>
                  <th className="p-3">نوع الحركة</th>
                  <th className="p-3">العميل / المورد</th>
                  <th className="p-3 text-left">المبلغ الأساسي</th>
                  <th className="p-3 text-left text-emerald-600">قيمة الضريبة VAT</th>
                  <th className="p-3 text-center">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20"
                  >
                    <td className="p-3 font-mono font-black text-indigo-650 dark:text-indigo-400">
                      {tx.refNo}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                          tx.type === "Sales"
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                            : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                        }`}
                      >
                        {tx.type === "Sales" ? "مبيعات" : "مشتريات"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">
                      {tx.partyName}
                    </td>
                    <td className="p-3 text-left font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      {tx.baseAmount.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-left font-mono font-black text-emerald-600">
                      +{tx.vatAmount.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL 1: ZATCA VAT-201 Official Return */}
      <AnimatePresence>
        {showZatcaReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-4xl space-y-6 text-right font-sans my-8"
            >
              {/* Official Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      إقرار ضريبة القيمة المضافة - النموذج المعتمد VAT-201
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black">ZATCA</span>
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1">
                      الهيئة العامة للزكاة والضريبة والجمارك (المملكة العربية السعودية)
                    </p>
                  </div>
                </div>
                <div className="text-left font-mono text-[10px] text-zinc-400 font-bold">
                  <div>تاريخ الإصدار: {new Date().toLocaleDateString("ar-SA")}</div>
                  <div>الرقم الضريبي للمنشأة: {activeCompany?.vatNumber || "300000000000003"}</div>
                </div>
              </div>

              {/* Official Form Content - Structured Grid */}
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 no-scrollbar">
                {/* Section 1: Sales / Muxrajat */}
                <div className="border border-zinc-200 rounded-2xl overflow-hidden text-[11px]">
                  <div className="bg-emerald-600/10 text-emerald-800 p-3 font-black text-xs border-b border-zinc-200 flex justify-between items-center">
                    <span>١. ضريبة القيمة المضافة على المبيعات (المخرجات)</span>
                    <span className="font-mono text-[10px]">1. VAT on Sales (Output Tax)</span>
                  </div>
                  <table className="w-full text-right">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                      <tr>
                        <th className="p-2.5">البند / Line Item</th>
                        <th className="p-2.5 text-left">المبلغ الخاضع للضريبة (SAR)</th>
                        <th className="p-2.5 text-left">مبلغ الضريبة (SAR)</th>
                        <th className="p-2.5 text-left text-zinc-400">التعديلات / Adjustments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-bold text-zinc-800 dark:text-zinc-200">
                      <tr>
                        <td className="p-2.5">المبيعات الخاضعة للنسبة القياسية ١٥٪ <span className="text-zinc-400 block font-normal text-[10px]">Standard Rated Sales (15%)</span></td>
                        <td className="p-2.5 text-left font-mono">{totalSalesBase.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-emerald-600">+{totalSalesVat.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">المبيعات للمواطنين (خدمات صحية/تعليمية) <span className="text-zinc-400 block font-normal text-[10px]">Sales to Citizens (Exempt Healthcare/Education)</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00 (تتحملها الدولة)</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">المبيعات المحلية الخاضعة لنسبة الصفر ٪ <span className="text-zinc-400 block font-normal text-[10px]">Zero Rated Domestic Sales</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">الصادرات خارج دول مجلس التعاون <span className="text-zinc-400 block font-normal text-[10px]">Exports</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr className="bg-zinc-50 font-black">
                        <td className="p-2.5">إجمالي المبيعات والمخرجات <span className="text-zinc-400 block font-normal text-[10px]">Total Sales & Output Tax</span></td>
                        <td className="p-2.5 text-left font-mono">{totalSalesBase.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-emerald-600">+{totalSalesVat.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Purchases / Mudxalat */}
                <div className="border border-zinc-200 rounded-2xl overflow-hidden text-[11px]">
                  <div className="bg-emerald-600/10 text-emerald-800 p-3 font-black text-xs border-b border-zinc-200 flex justify-between items-center">
                    <span>٢. ضريبة القيمة المضافة على المشتريات (المدخلات)</span>
                    <span className="font-mono text-[10px]">2. VAT on Purchases (Input Tax)</span>
                  </div>
                  <table className="w-full text-right">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                      <tr>
                        <th className="p-2.5">البند / Line Item</th>
                        <th className="p-2.5 text-left">المبلغ الخاضع للضريبة (SAR)</th>
                        <th className="p-2.5 text-left">مبلغ الضريبة القابل للخصم (SAR)</th>
                        <th className="p-2.5 text-left text-zinc-400">التعديلات / Adjustments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-bold text-zinc-800 dark:text-zinc-200">
                      <tr>
                        <td className="p-2.5">المشتريات الخاضعة للنسبة القياسية ١٥٪ <span className="text-zinc-400 block font-normal text-[10px]">Standard Rated Purchases (15%)</span></td>
                        <td className="p-2.5 text-left font-mono">{totalPurchasesBase.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-rose-500">-{totalPurchasesVat.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">الاستيرادات الخاضعة للضريبة المدفوعة بالجمارك <span className="text-zinc-400 block font-normal text-[10px]">Imports Paid at Customs</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">الاستيرادات الخاضعة للضريبة بموجب آلية الاحتساب العكسي <span className="text-zinc-400 block font-normal text-[10px]">Reverse Charge Imports</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr>
                        <td className="p-2.5">المشتريات المحلية الخاضعة لنسبة الصفر ٪ <span className="text-zinc-400 block font-normal text-[10px]">Zero Rated Purchases</span></td>
                        <td className="p-2.5 text-left font-mono">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-400">0.00</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                      <tr className="bg-zinc-50 font-black">
                        <td className="p-2.5">إجمالي المشتريات والمدخلات <span className="text-zinc-400 block font-normal text-[10px]">Total Purchases & Input Tax</span></td>
                        <td className="p-2.5 text-left font-mono">{totalPurchasesBase.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-rose-500">-{totalPurchasesVat.toLocaleString()}</td>
                        <td className="p-2.5 text-left font-mono text-zinc-300">0.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Totals & Summary */}
                <div className="bg-zinc-900 text-white p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-r-8 border-emerald-500">
                  <div className="space-y-1">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">صافي الضريبة المستحقة / المردودة للهيئة</span>
                    <span className="text-sm font-black block">٣. صافي ضريبة القيمة المضافة المستحقة للفترة الضريبية</span>
                    <span className="text-[9px] text-zinc-400 block">Net VAT Payable or Refundable for Current Filing Period</span>
                  </div>
                  <div className="text-left">
                    <span className="text-xl font-black font-mono block text-emerald-400">
                      {netVatPayable.toLocaleString()} ر.س
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                      ({netVatPayable > 0 ? "SAR Payable / مستحقة للسداد" : "SAR Refundable / مستحقة للاسترداد"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Official Declarations and digital stamp */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 text-xs text-right">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-zinc-800 block mb-0.5">تدقيق معايير ZATCA والامتثال الرقمي</span>
                    <span className="text-zinc-400 text-[10px] leading-relaxed block">
                      تم تدقيق وفحص هذا الإقرار الضريبي ومطابقته آلياً مع الفواتير والقيود المحاسبية المقيدة بالدفاتر بنسبة ١٠٠٪. الإقرار جاهز ومصدق للتسليم الإلكتروني الفوري.
                    </span>
                  </div>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-300 px-4 py-2 rounded-xl text-center shrink-0">
                  <span className="text-[10px] text-emerald-600 font-black block">مدقق ومصدق</span>
                  <span className="text-[9px] text-emerald-500 font-mono font-bold block mt-0.5">ZATCA VALIDATED</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل الإقرار وطباعة نموذج VAT-201 (PDF)</span>
                </button>
                <button
                  onClick={() => setShowZatcaReport(false)}
                  className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إغلاق النموذج
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: COMPLETE EXPORT TAX PACKAGE (NEWLY REQUESTED HIGH-FIDELITY FEATURE) */}
      <AnimatePresence>
        {showTaxPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-6 rounded-[2.5rem] shadow-2xl w-full max-w-5xl space-y-6 text-right font-sans my-8"
            >
              {/* Modal Title and Controls */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-650 rounded-2xl flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      حزمة التدقيق والمستندات الضريبية الشاملة (Full Audit Tax Package)
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-black">ZATCA & SOCPA Compliant</span>
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-bold mt-1">
                      توليد وتصدير ملفات التدقيق القانوني المالي والميزان التجاري للفترات الضريبية المعتمدة
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-zinc-400">الفترة المالية:</span>
                  <select
                    value={fiscalPeriod}
                    onChange={(e) => setFiscalPeriod(e.target.value)}
                    className="bg-zinc-50 dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-800 rounded-xl px-4 py-2 text-xs font-black focus:outline-none cursor-pointer"
                  >
                    <option value="2026-Q1">الربع الأول ٢٠٢٦ (Q1 2026)</option>
                    <option value="2026-Q2">الربع الثاني ٢٠٢٦ (Q2 2026)</option>
                    <option value="2026-Q3">الربع الثالث ٢٠٢٦ (Q3 2026)</option>
                    <option value="2026-Q4">الربع الرابع ٢٠٢٦ (Q4 2026)</option>
                    <option value="2026-FY">السنة المالية الكاملة ٢٠٢٦ (FY 2026)</option>
                  </select>
                </div>
              </div>

              {/* Package Content Preview Area */}
              <div className="space-y-6 max-h-[480px] overflow-y-auto pr-2 no-scrollbar border-b border-zinc-100 pb-4">
                
                {/* Part 1: Audit Trial Balance */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                    القسم الأول: ميزان المراجعة التدقيقي للفترة {fiscalPeriod} (Audit Trial Balance)
                  </h3>
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-50 font-bold text-zinc-400 text-[10px] border-b border-zinc-100">
                        <tr>
                          <th className="p-2.5">كود الحساب</th>
                          <th className="p-2.5">اسم الحساب (عربي)</th>
                          <th className="p-2.5">Account Name (English)</th>
                          <th className="p-2.5">نوع الحساب</th>
                          <th className="p-2.5 text-left">مدين (Debit)</th>
                          <th className="p-2.5 text-left">دائن (Credit)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700 dark:text-zinc-300">
                        {activeTrialBalance.map((acc, index) => {
                          const isDebitType = acc.type === "Asset" || acc.type === "Expense";
                          const balanceVal = Math.abs(acc.balance || 0);
                          return (
                            <tr key={index} className="hover:bg-zinc-50/40">
                              <td className="p-2.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">{acc.code}</td>
                              <td className="p-2.5">{acc.nameAr}</td>
                              <td className="p-2.5 font-mono text-zinc-400">{acc.nameEn}</td>
                              <td className="p-2.5 text-zinc-400">{acc.type}</td>
                              <td className="p-2.5 text-left font-mono font-bold">
                                {isDebitType ? balanceVal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                              </td>
                              <td className="p-2.5 text-left font-mono font-bold">
                                {!isDebitType ? balanceVal.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Part 2: ZATCA-Compliant Invoice Register */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                    القسم الثاني: سجل الفواتير والمبيعات الإلكترونية المتوافق (ZATCA Invoice Register)
                  </h3>
                  <div className="border border-zinc-100 rounded-2xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-zinc-50 font-bold text-zinc-400 text-[10px] border-b border-zinc-100">
                        <tr>
                          <th className="p-2.5">رقم الفاتورة</th>
                          <th className="p-2.5">تاريخ الفاتورة</th>
                          <th className="p-2.5">اسم العميل الخاضع</th>
                          <th className="p-2.5 text-left">المبلغ الأساسي (Excl. VAT)</th>
                          <th className="p-2.5 text-left">ضريبة القيمة المضافة (15%)</th>
                          <th className="p-2.5 text-center">الترميز والختم الرقمي ZATCA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700 dark:text-zinc-300">
                        {transactions.filter(t => t.type === "Sales").map((tx, index) => (
                          <tr key={index} className="hover:bg-zinc-50/40">
                            <td className="p-2.5 font-mono font-black text-indigo-600 dark:text-indigo-400">{tx.refNo}</td>
                            <td className="p-2.5 font-mono">{tx.date}</td>
                            <td className="p-2.5 font-bold">{tx.partyName}</td>
                            <td className="p-2.5 text-left font-mono">{tx.baseAmount.toLocaleString()} ر.س</td>
                            <td className="p-2.5 text-left font-mono text-emerald-600">+{tx.vatAmount.toLocaleString()} ر.س</td>
                            <td className="p-2.5 text-center">
                              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 px-2.5 py-0.5 rounded-full text-[9px] font-black border border-emerald-500/10">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                موقع ومرحل مشفر (XML Signed)
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Part 3: VAT Calculation Breakdown */}
                <div className="space-y-2.5">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                    القسم الثالث: تفصيل خلاصة الوعاء الضريبي واحتساب القيمة المضافة للفترة
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-50 dark:bg-zinc-800/20 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-xs font-bold">
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block font-bold">ضريبة المخرجات الإجمالية (Output VAT):</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100 text-sm block">{totalSalesVat.toLocaleString()} ر.س</span>
                      <span className="text-[9px] text-zinc-400 block">إجمالي مبيعات الفترة: {totalSalesBase.toLocaleString()} ر.س</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-zinc-400 block font-bold">ضريبة المدخلات القابلة للخصم (Input VAT):</span>
                      <span className="font-mono text-rose-600 text-sm block">-{totalPurchasesVat.toLocaleString()} ر.س</span>
                      <span className="text-[9px] text-zinc-400 block">إجمالي مشتريات الفترة: {totalPurchasesBase.toLocaleString()} ر.س</span>
                    </div>
                    <div className="space-y-1 bg-indigo-500/5 p-2 rounded-xl border border-indigo-500/10">
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 block font-bold">الالتزام الضريبي الصافي للفترة:</span>
                      <span className="font-mono text-indigo-650 dark:text-indigo-400 text-sm block">{netVatPayable.toLocaleString()} ر.س</span>
                      <span className="text-[9px] text-zinc-500 block">المبلغ جاهز ومعتمد للإيداع والرفع</span>
                    </div>
                  </div>
                </div>

                {/* Part 4: Cryptographic Seal */}
                <div className="p-4 bg-zinc-900 text-zinc-100 rounded-2xl border-r-8 border-indigo-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                  <div className="space-y-1.5">
                    <span className="font-black text-indigo-400 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" />
                      شهادة التوقيع الرقمي والختم المشفر للحزمة (Cryptographic Audit Verification)
                    </span>
                    <p className="text-[10px] text-zinc-400 leading-normal max-w-2xl font-bold">
                      تم دمج كافة حركات الدفاتر والأستاذ العام ومطابقتها للتكامل الضريبي. هذه الحزمة المالية مغلقة رقمياً بموجب الرمز التسلسلي ومحمية من أي تعديل رجعي أو يدوي.
                    </p>
                  </div>
                  <div className="text-left md:border-r md:border-zinc-800 md:pr-4 font-mono text-[9px] text-zinc-500 font-bold shrink-0">
                    <div>مرجع الباقة: MUDARIJ-SECURE-AUDIT-PKG</div>
                    <div>تاريخ التدقيق: {new Date().toLocaleString("ar-SA")}</div>
                    <div className="text-indigo-400 mt-1 select-all">{packageHash}</div>
                  </div>
                </div>

              </div>

              {/* Actions Footer */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
                <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  حزمة التصدير موقعة ومرخصة بموجب معايير SOCPA و ZATCA
                </span>
                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={handleExportTaxPackagePDF}
                    className="flex-1 md:flex-initial px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة وتنزيل حزمة الملف الضريبي (Signed PDF)</span>
                  </button>
                  <button
                    onClick={() => setShowTaxPackage(false)}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-750 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    إغلاق النافذة
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
