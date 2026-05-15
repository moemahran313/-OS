import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { 
  CheckCircle2, 
  CreditCard, 
  Download, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  QrCode,
  Smartphone
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Invoice } from "@/src/types";
import { downloadElementAsPdf } from "@/src/lib/pdf";

import InvoicePrintTemplate from "@/src/components/InvoicePrintTemplate";

export default function PublicInvoiceView() {
  const { id } = useParams();
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  const handleDownload = () => {
    if (invoice) {
      downloadElementAsPdf("invoice-printable", `Invoice-${invoice.number}.pdf`);
    }
  };

  useEffect(() => {
    // Fetch invoice and track view
    fetch(`/api/public/invoices/${id}`)
      .then(res => res.json())
      .then(data => {
        setInvoice(data);
        setLoading(false);
        setPaymentAmount(((data.remainingBalanceHalalas || data.totalAmountHalalas) / 100).toString());
        
        // Track the view
        if (!isPrintMode) {
          fetch(`/api/public/invoices/${id}/view`, { method: 'POST' });
        }
      });
  }, [id, isPrintMode]);

  const handlePayment = async () => {
    setPaying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const res = await fetch(`/api/public/invoices/${id}/pay`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(paymentAmount) })
    });
    
    const updatedInvoice = await res.json();
    setInvoice(updatedInvoice);
    setPaying(false);
    if (updatedInvoice.status === 'paid') setPaid(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-sans tracking-tight">جاري التحميل...</div>;
  if (!invoice) return <div className="min-h-screen flex items-center justify-center font-sans">لم يتم العثور على الفاتورة.</div>;

  if (isPrintMode) {
    return (
      <div className="bg-white p-0 m-0" dir="rtl">
        <InvoicePrintTemplate invoice={invoice} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans" dir="rtl">
      {/* Client Facing Header */}
      <nav className="h-16 bg-white border-b border-zinc-100 flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">M</div>
           <span className="text-sm font-bold text-zinc-900 tracking-tight">Mudarij Secure Payment</span>
        </div>
        <div className="flex gap-4">
           <button 
             onClick={handleDownload}
             className="text-zinc-500 hover:text-zinc-900 transition-colors text-xs font-bold flex items-center gap-1.5"
           >
              <Download className="w-3.5 h-3.5" /> PDF
           </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-12 px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invoice Preview */}
        <div className="lg:col-span-2 space-y-6">
           <div id="invoice-printable" className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 relative overflow-hidden flex justify-center">
              <InvoicePrintTemplate invoice={invoice} />
           </div>
        </div>

        {/* Payment Sidebar */}
        <div className="space-y-6">
           <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-100/50 sticky top-28">
              <h3 className="text-lg font-bold text-zinc-900 mb-6">الدفع الآمن</h3>
              
              {invoice.status === 'paid' || paid ? (
                <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in duration-500">
                   <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="font-bold text-emerald-900">تم الدفع بنجاح</h4>
                      <p className="text-xs text-emerald-600 mt-1">وصلت الدفعة، شكراً لتعاملك معنا.</p>
                   </div>
                   <button className="w-full bg-white text-emerald-700 py-3 rounded-xl border border-emerald-200 text-xs font-bold hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> تحميل الإيصال
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">المبلغ المراد دفعه / Amount to Pay</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            max={(invoice.remainingBalanceHalalas / 100)}
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl py-3 px-4 text-sm font-bold focus:border-zinc-900 transition-all"
                          />
                          <span className="absolute left-4 inset-y-0 flex items-center text-xs font-bold text-zinc-400">{invoice.currency}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={handlePayment}
                          disabled={paying}
                          className={cn(
                            "col-span-2 bg-black text-white py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-zinc-900/10",
                            paying ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                          )}
                        >
                           <Smartphone className={cn("w-5 h-5", paying && "animate-pulse")} />
                           {paying ? "جاري معالجة الدفع..." : "Apple Pay"}
                        </button>
                        <button 
                          onClick={handlePayment}
                          disabled={paying}
                          className={cn(
                            "col-span-2 bg-zinc-900 text-white py-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2",
                            paying ? "opacity-50 cursor-not-allowed" : "hover:bg-zinc-800"
                          )}
                        >
                           <CreditCard className="w-5 h-5" />
                           بطاقة ائتمان
                        </button>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-zinc-50 space-y-4">
                      <div className="flex flex-col gap-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 font-bold">تم دفعه / Paid</span>
                          <span className="font-bold text-emerald-600">{(invoice.paidAmountHalalas / 100).toLocaleString() || 0} {invoice.currency}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-zinc-500 font-bold">المتبقي / Remaining</span>
                          <span className="font-bold text-zinc-900">{(invoice.remainingBalanceHalalas / 100).toLocaleString() || 0} {invoice.currency}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="p-2 bg-emerald-50 rounded-lg">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                         </div>
                         <div>
                            <h5 className="text-[11px] font-bold text-zinc-900 leading-none mb-1">دفع مشفر وآمن</h5>
                            <p className="text-[10px] text-zinc-400">تتم معالجة بياناتك بأمان تام عبر معايير PCI-DSS.</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3 grayscale opacity-30 justify-center py-2">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                         <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" alt="Mastercard" />
                         <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="Paypal" />
                      </div>
                   </div>
                </div>
              )}
           </div>

           <div className="p-6 glass rounded-2xl border border-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <FileText className="w-5 h-5 text-zinc-400" />
                 <div>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">حالة الفاتورة / Status</p>
                    <p className="text-xs font-bold text-zinc-900">{invoice.status === 'paid' ? 'مدفوعة' : 'بانتظار الدفع'}</p>
                 </div>
              </div>
              <CheckCircle2 className={cn("w-6 h-6", invoice.status === 'paid' ? "text-emerald-500" : "text-zinc-200")} />
           </div>
        </div>
      </main>
    </div>
  );
}
