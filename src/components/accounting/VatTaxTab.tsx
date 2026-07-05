import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Percent, Settings, CheckCircle2, AlertCircle, FileSpreadsheet, 
  ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles 
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

export default function VatTaxTab() {
  const [vatRates] = useState<VatRate[]>([
    { id: "vat-sa-15", name: "ضريبة القيمة المضافة السعودية القياسية", rate: 15, type: "Standard", country: "KSA" },
    { id: "vat-sa-0", name: "السلع الخاضعة للنسبة الصفرية", rate: 0, type: "Zero-Rated", country: "KSA" },
    { id: "vat-sa-exempt", name: "الخدمات والأنشطة المعفاة ضريبياً", rate: 0, type: "Exempt", country: "KSA" },
    { id: "vat-ae-5", name: "ضريبة القيمة المضافة الإماراتية القياسية", rate: 5, type: "Standard", country: "UAE" },
  ]);

  const [transactions] = useState<TaxTransaction[]>([
    { id: "tx-1", type: "Sales", refNo: "INV-2026-001", date: "2026-05-10", partyName: "مجموعة الشايع التجارية", baseAmount: 145000, vatAmount: 21750, vatRate: 15 },
    { id: "tx-2", type: "Purchases", refNo: "BILL-2026-081", date: "2026-05-01", partyName: "مؤسسة التوريدات اللوجستية", baseAmount: 40000, vatAmount: 6000, vatRate: 15 },
    { id: "tx-3", type: "Sales", refNo: "INV-2026-002", date: "2026-05-15", partyName: "شركة المراعي المحدودة", baseAmount: 89000, vatAmount: 13350, vatRate: 15 },
    { id: "tx-4", type: "Purchases", refNo: "BILL-2026-082", date: "2026-04-10", partyName: "شركة الخرسانة المتكاملة", baseAmount: 90000, vatAmount: 13500, vatRate: 15 },
  ]);

  const [showZatcaReport, setShowZatcaReport] = useState(false);

  // VAT calculations
  const totalSalesBase = transactions.filter(t => t.type === "Sales").reduce((sum, t) => sum + t.baseAmount, 0);
  const totalSalesVat = transactions.filter(t => t.type === "Sales").reduce((sum, t) => sum + t.vatAmount, 0);

  const totalPurchasesBase = transactions.filter(t => t.type === "Purchases").reduce((sum, t) => sum + t.baseAmount, 0);
  const totalPurchasesVat = transactions.filter(t => t.type === "Purchases").reduce((sum, t) => sum + t.vatAmount, 0);

  const netVatPayable = totalSalesVat - totalPurchasesVat;

  return (
    <div className="space-y-6 text-right">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center dark:bg-emerald-950/30 dark:text-emerald-400">
              <ArrowUpRight className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">ضريبة المبيعات المستلمة (Output VAT)</span>
          </div>
          <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100 font-mono mt-3">
            {totalSalesVat.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">محتسبة بنسبة 15% على مبيعات بقيمة {totalSalesBase.toLocaleString()} ر.س</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center dark:bg-rose-950/30 dark:text-rose-400">
              <ArrowDownLeft className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">ضريبة المشتريات المدفوعة (Input VAT)</span>
          </div>
          <h4 className="text-xl font-black text-rose-600 font-mono mt-3">
            {totalPurchasesVat.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">قابلة للخصم والاسترداد الكلي من الزكاة والضريبة</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-650 rounded-lg flex items-center justify-center dark:bg-indigo-950/30 dark:text-indigo-400">
              <Percent className="w-4.5 h-4.5" />
            </div>
            <span className="text-[10px] text-zinc-400 font-bold uppercase">صافي الضريبة المستحقة للسداد</span>
          </div>
          <h4 className={`text-xl font-black font-mono mt-3 ${netVatPayable > 0 ? "text-indigo-655 text-indigo-600" : "text-emerald-600"}`}>
            {netVatPayable.toLocaleString()} ر.س
          </h4>
          <p className="text-[10px] text-zinc-400 font-bold mt-1">
            {netVatPayable > 0 ? "مستحقة للدفع والتقديم لهيئة ZATCA" : "رصيد دائن مستحق للاسترداد الضريبي"}
          </p>
        </div>
      </div>

      {/* Controller Controls */}
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
        <div>
          <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">بوابة الإقرارات والامتثال الضريبي المتكامل</h3>
          <p className="text-[10px] text-zinc-400 font-bold">إقرارات ضريبة القيمة المضافة المتوافقة بالكامل مع متطلبات هيئة الزكاة والضريبة والجمارك بالمملكة</p>
        </div>
        <button
          onClick={() => setShowZatcaReport(true)}
          className="px-4 py-2.5 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" /> 
          توليد إقرار ضريبي ZATCA
        </button>
      </div>

      {/* Main Grid: VAT Rules & Transaction Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VAT Rate Rules list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">قواعد ومعدلات الضرائب المعرفة</h3>
            <p className="text-[10px] text-zinc-400 font-bold">أنواع الضريبة المعتمدة لتسهيل احتساب الفواتير الآلي</p>
          </div>

          <div className="space-y-3">
            {vatRates.map((rate) => (
              <div key={rate.id} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 p-3.5 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs font-black text-zinc-850 dark:text-zinc-150 block">{rate.name}</span>
                  <span className="text-[9px] text-zinc-400 font-bold block mt-1">الدولة: {rate.country} | الفئة: {rate.type}</span>
                </div>
                <div className="px-3 py-1 bg-zinc-100 dark:bg-zinc-850 text-zinc-800 dark:text-zinc-200 text-xs font-black font-mono rounded-lg">
                  {rate.rate}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* VAT Transaction Log */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">سجل المعاملات الخاضعة للضريبة</h3>
            <p className="text-[10px] text-zinc-400 font-bold">الحركات المالية الخاضعة لضريبة القيمة المضافة المحررة حديثاً</p>
          </div>

          <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-right">
              <thead className="bg-zinc-50 dark:bg-zinc-950/50 text-[10px] text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-800">
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
                  <tr key={tx.id} className="border-b border-zinc-50 dark:border-zinc-850 hover:bg-zinc-50/20">
                    <td className="p-3 font-mono font-black text-indigo-650 dark:text-indigo-400">{tx.refNo}</td>
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-black ${
                        tx.type === "Sales" 
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30" 
                          : "bg-rose-50 text-rose-600 dark:bg-rose-950/30"
                      }`}>
                        {tx.type === "Sales" ? "مبيعات" : "مشتريات"}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-zinc-700 dark:text-zinc-300">{tx.partyName}</td>
                    <td className="p-3 text-left font-mono font-bold">{tx.baseAmount.toLocaleString()} ر.س</td>
                    <td className="p-3 text-left font-mono font-black text-zinc-900 dark:text-zinc-100">
                      {tx.vatAmount.toLocaleString()} ر.س
                    </td>
                    <td className="p-3 text-center font-mono text-zinc-400">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Official ZATCA formatted tax return modal */}
      {showZatcaReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl max-w-2xl w-full border border-zinc-150 p-6 space-y-6 text-right"
          >
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                مسودة إقرار ضريبة القيمة المضافة (ZATCA VAT Return Form)
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">النموذج الرسمي متوافق مع لوائح الفوترة الضريبية وإجراءات التقديم الإلكتروني</p>
            </div>

            <div className="border border-zinc-100 dark:border-zinc-850 rounded-2xl overflow-hidden text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 font-black border-b border-zinc-100 dark:border-zinc-850">
                1. ضريبة المبيعات والمخرجات (Output VAT)
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-zinc-50 dark:border-zinc-850 font-bold">
                <span className="col-span-1">المبيعات بنسبة 15%</span>
                <span className="text-left font-mono">{totalSalesBase.toLocaleString()} ر.س</span>
                <span className="text-left font-mono text-emerald-600">+{totalSalesVat.toLocaleString()} ر.س</span>
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-zinc-50 dark:border-zinc-850 font-bold text-zinc-400 text-[10px]">
                <span className="col-span-1">المبيعات بنسبة صفر% أو المعفاة</span>
                <span className="text-left font-mono">0 ر.س</span>
                <span className="text-left font-mono">0 ر.س</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-950 p-3 font-black border-b border-zinc-100 dark:border-zinc-850">
                2. ضريبة المشتريات والمدخلات (Input VAT)
              </div>
              <div className="grid grid-cols-3 p-3 border-b border-zinc-50 dark:border-zinc-850 font-bold">
                <span className="col-span-1">المشتريات بنسبة 15%</span>
                <span className="text-left font-mono">{totalPurchasesBase.toLocaleString()} ر.س</span>
                <span className="text-left font-mono text-rose-500">-{totalPurchasesVat.toLocaleString()} ر.س</span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 grid grid-cols-3 font-black text-sm text-zinc-900 dark:text-zinc-50 border-t-2 border-zinc-100 dark:border-zinc-800">
                <span>صافي الضريبة الواجب سدادها / (الاسترداد)</span>
                <span></span>
                <span className="text-left font-mono text-indigo-650 dark:text-indigo-400">
                  {netVatPayable.toLocaleString()} ر.س
                </span>
              </div>
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-950/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 flex items-start gap-2.5 text-xs text-indigo-850 dark:text-indigo-400">
              <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block mb-0.5">ملاحظة التدقيق والامتثال الزكوي</span>
                <span>هذه المسودة تغطي الفترة الضريبية الجارية، ويتوجب ترحيل كافة فواتير المبيعات والمشتريات لليومية العامة بشكل تام قبل تقديم الإقرار عبر بوابة الهيئة.</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert("تم تصدير ملف الإقرار بصيغة PDF وجاهز للتحميل كإكسل لتقديمه لـ ZATCA.");
                  setShowZatcaReport(false);
                }}
                className="flex-1 py-3 bg-emerald-650 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition-colors cursor-pointer"
              >
                تصدير إقرار ضريبي موقع إلكترونياً (PDF)
              </button>
              <button
                onClick={() => setShowZatcaReport(false)}
                className="px-5 py-3 bg-zinc-100 text-zinc-700 rounded-xl text-xs hover:bg-zinc-200 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
