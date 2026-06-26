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
  Smartphone,
  Lock,
  AlertCircle,
  X,
  Check,
  ArrowLeft,
  ChevronRight,
  Info,
  Building,
  Coins
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Invoice } from "@/src/types";
import { downloadElementAsPdf } from "@/src/lib/pdf";

import InvoicePrintTemplate from "@/src/components/InvoicePrintTemplate";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

type PaymentGateway = "paytabs" | "benefitpay" | "applepay" | "sadad" | "paypal" | null;

export default function PublicInvoiceView() {
  const { id } = useParams();
  const isPrintMode = new URLSearchParams(window.location.search).get('print') === 'true';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [paypalClientId, setPaypalClientId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<string>("");

  // GCC Gateways state
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway>(null);
  const [checkoutStep, setCheckoutStep] = useState<"select" | "details" | "3ds" | "success">("select");
  
  // PayTabs Form State
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardType, setCardType] = useState<"mada" | "visa" | "mastercard" | "unknown">("unknown");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");

  // BenefitPay State
  const [benefitTimer, setBenefitTimer] = useState(300);

  // Sadad State
  const [sadadUsername, setSadadUsername] = useState("");
  const [sadadPassword, setSadadPassword] = useState("");

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
        if (data.paypalClientId) {
          setPaypalClientId(data.paypalClientId);
        }
        setLoading(false);
        const balance = data.remainingBalanceHalalas ?? data.totalAmountHalalas ?? 0;
        setPaymentAmount(Number.isNaN(balance) ? "" : (balance / 100).toString());
        
        // Default gateway selection based on currency
        if (data.currency === "BHD") {
          setSelectedGateway("benefitpay");
        } else if (data.currency === "SAR") {
          setSelectedGateway("paytabs");
        } else {
          setSelectedGateway("paytabs");
        }

        // Track the view
        if (!isPrintMode) {
          fetch(`/api/public/invoices/${id}/view`, { method: 'POST' });
        }
      });
  }, [id, isPrintMode]);

  // Card network detector
  useEffect(() => {
    const cleanNumber = cardNumber.replace(/\s+/g, "");
    if (cleanNumber.startsWith("4")) {
      setCardType("visa");
    } else if (/^5[1-5]/.test(cleanNumber)) {
      setCardType("mastercard");
    } else if (
      /^96|58|44|40|45/.test(cleanNumber) || 
      cleanNumber.startsWith("60") || 
      cleanNumber.startsWith("93")
    ) {
      // Common Saudi mada ranges
      setCardType("mada");
    } else {
      setCardType("unknown");
    }
  }, [cardNumber]);

  // BenefitPay timer
  useEffect(() => {
    if (selectedGateway !== "benefitpay" || checkoutStep !== "details") return;
    const interval = setInterval(() => {
      setBenefitTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedGateway, checkoutStep]);

  const handlePayment = async (gatewayName: string, methodName: string, transactionId: string) => {
    setPaying(true);
    try {
      const res = await fetch(`/api/public/invoices/${id}/pay`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Number(paymentAmount),
          gateway: gatewayName,
          method: methodName,
          transactionId: transactionId
        })
      });
      
      const updatedInvoice = await res.json();
      setInvoice(updatedInvoice);
      setPaid(true);
      setCheckoutStep("success");
    } catch (e) {
      console.error("Payment failed", e);
    } finally {
      setPaying(false);
    }
  };

  const handlePayTabsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardName || !cardExpiry || !cardCvv) {
      alert(invoice?.branding?.language === 'en' ? "Please fill all fields" : "يرجى ملء كافة الحقول");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      setCheckoutStep("3ds");
    }, 1500);
  };

  const handleVerifyOTP = () => {
    if (otpInput !== "1234") {
      setOtpError(invoice?.branding?.language === 'en' ? "Invalid OTP. Use 1234 for testing." : "رمز تحقق خاطئ. استخدم 1234 للتجربة.");
      return;
    }
    setOtpError("");
    const randomTxn = "PT_" + Math.random().toString(36).substring(2, 10).toUpperCase();
    const cleanNum = cardNumber.replace(/\s+/g, "");
    const last4 = cleanNum.slice(-4);
    const mType = cardType === "mada" ? "mada card" : cardType === "visa" ? "Visa" : cardType === "mastercard" ? "Mastercard" : "Card";
    handlePayment("PayTabs", `${mType} (•••• ${last4})`, randomTxn);
  };

  const handleBenefitSimulation = () => {
    const randomTxn = "BP_" + Math.random().toString(36).substring(2, 10).toUpperCase();
    handlePayment("BenefitPay", "QR App Approval", randomTxn);
  };

  const handleSadadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sadadUsername || !sadadPassword) {
      alert("يرجى إدخال اسم المستخدم وكلمة المرور الخاصة بسداد");
      return;
    }
    setPaying(true);
    setTimeout(() => {
      const randomTxn = "SD_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      handlePayment("Sadad", "SADAD Account Transfer", randomTxn);
    }, 1800);
  };

  const handleApplePaySubmit = () => {
    setPaying(true);
    setTimeout(() => {
      const randomTxn = "AP_" + Math.random().toString(36).substring(2, 10).toUpperCase();
      handlePayment("Apple Pay", "Apple Pay / mada Classic", randomTxn);
    }, 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
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

  const isEnglish = invoice.branding?.language === 'en';

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-12" dir="rtl">
      {/* Client Facing Header */}
      <nav className="h-16 bg-white border-b border-zinc-100 flex items-center px-8 justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">M</div>
           <span className="text-sm font-black text-zinc-900 tracking-tight">بوابة الدفع الآمنة مدارج Secure Pay</span>
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
              
              {invoice.status === 'paid' || paid ? (
                <div className="text-center p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4 animate-in fade-in zoom-in duration-500">
                   <div className="w-16 h-16 bg-emerald-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <CheckCircle2 className="w-8 h-8" />
                   </div>
                   <div>
                      <h4 className="font-bold text-emerald-900">{isEnglish ? "Payment Successful" : "تم السداد بنجاح"}</h4>
                      <p className="text-xs text-emerald-600 mt-1">
                        {isEnglish ? "Payment of the invoice balance has been confirmed." : "تم استلام دفعتك وتأكيدها وتحديث حالة الفاتورة تلقائياً."}
                      </p>
                   </div>
                   <button 
                     onClick={handleDownload}
                     className="w-full bg-white text-emerald-700 py-3 rounded-xl border border-emerald-200 text-xs font-bold hover:bg-emerald-100/50 transition-all flex items-center justify-center gap-2"
                   >
                      <Download className="w-4 h-4" /> {isEnglish ? "Download Receipt" : "تحميل إيصال الدفع"}
                   </button>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                       {isEnglish ? "Amount to Pay" : "المبلغ المراد سداده"}
                     </label>
                     <div className="relative">
                       <input 
                         type="number" 
                         max={(invoice.remainingBalanceHalalas / 100)}
                         value={paymentAmount}
                         onChange={(e) => setPaymentAmount(e.target.value)}
                         className="w-full bg-zinc-50 border-2 border-zinc-100 rounded-xl py-3 px-4 text-sm font-bold focus:border-zinc-900 transition-all text-left font-mono"
                       />
                       <span className="absolute left-4 inset-y-0 flex items-center text-xs font-black text-zinc-900">{invoice.currency}</span>
                     </div>
                   </div>

                   {/* Multi-step simulated checkout layout */}
                   {checkoutStep === "select" && (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                       <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                         {isEnglish ? "Choose GCC Gateway" : "اختر بوابة دفع خليجية"}
                       </label>
                       
                       <div className="grid grid-cols-1 gap-2">
                         {/* PayTabs Gateway Option */}
                         <button
                           onClick={() => {
                             setSelectedGateway("paytabs");
                             setCheckoutStep("details");
                           }}
                           className="w-full p-4 border border-zinc-200 hover:border-[#E04F2F]/40 hover:bg-[#E04F2F]/5 rounded-2xl flex items-center justify-between transition-all group"
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#E04F2F]/10 rounded-xl flex items-center justify-center text-[#E04F2F] font-bold text-sm">
                               PT
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-zinc-900">PayTabs (بي تابس)</p>
                               <p className="text-[10px] text-zinc-500">مقبول مدى، فيزا، ماستركارد</p>
                             </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-[-4px] transition-transform" />
                         </button>

                         {/* BenefitPay Option */}
                         <button
                           onClick={() => {
                             setSelectedGateway("benefitpay");
                             setCheckoutStep("details");
                           }}
                           className="w-full p-4 border border-zinc-200 hover:border-[#005c8a]/40 hover:bg-[#005c8a]/5 rounded-2xl flex items-center justify-between transition-all group"
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#005c8a]/10 rounded-xl flex items-center justify-center text-[#005c8a] font-bold text-sm">
                               BP
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-zinc-900">BenefitPay (مملكة البحرين)</p>
                               <p className="text-[10px] text-zinc-500">مسح سريع للرمز واستجابة فورية</p>
                             </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-[-4px] transition-transform" />
                         </button>

                         {/* Apple Pay Option */}
                         <button
                           onClick={() => {
                             setSelectedGateway("applepay");
                             setCheckoutStep("details");
                           }}
                           className="w-full p-4 border border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 rounded-2xl flex items-center justify-between transition-all group"
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                               <Smartphone className="w-5 h-5" />
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-zinc-900">Apple Pay</p>
                               <p className="text-[10px] text-zinc-500">بصمة الإصبع أو الوجه بلمسة واحدة</p>
                             </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-[-4px] transition-transform" />
                         </button>

                         {/* Sadad KSA Option */}
                         <button
                           onClick={() => {
                             setSelectedGateway("sadad");
                             setCheckoutStep("details");
                           }}
                           className="w-full p-4 border border-zinc-200 hover:border-emerald-600/40 hover:bg-emerald-50/5 rounded-2xl flex items-center justify-between transition-all group"
                         >
                           <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-xs">
                               سداد
                             </div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-zinc-900">سداد (SADAD Payment)</p>
                               <p className="text-[10px] text-zinc-500">نظام الحوالات والمدفوعات السعودي</p>
                             </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-[-4px] transition-transform" />
                         </button>

                         {/* PayPal Script Integration (Backwards Compatibility) */}
                         {paypalClientId && (
                           <div className="mt-4 pt-4 border-t border-zinc-100 col-span-2 relative z-0 min-h-[45px]">
                             <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD", components: "buttons" }}>
                                <PayPalButtons
                                  style={{ layout: "vertical", height: 45, color: "gold", shape: "rect", label: "paypal" }}
                                  createOrder={(data, actions) => {
                                    return actions.order.create({
                                      intent: "CAPTURE",
                                      purchase_units: [
                                        {
                                          amount: {
                                            currency_code: invoice.currency === "SAR" ? "USD" : invoice.currency,
                                            value: (invoice.currency === "SAR" ? (Number(paymentAmount) / 3.75) : Number(paymentAmount)).toFixed(2),
                                          },
                                        },
                                      ],
                                      application_context: {
                                        shipping_preference: "NO_SHIPPING"
                                      }
                                    });
                                  }}
                                  onApprove={async (data, actions) => {
                                    if (!actions.order) return;
                                    await actions.order.capture();
                                    handlePayment("PayPal", "Direct PayPal", "PP_" + Date.now());
                                  }}
                                />
                             </PayPalScriptProvider>
                           </div>
                         )}
                       </div>
                     </div>
                   )}

                   {/* Dynamic Detail Checkout Forms */}
                   {checkoutStep === "details" && (
                     <div className="space-y-4 animate-in fade-in duration-300">
                       <button
                         onClick={() => setCheckoutStep("select")}
                         className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 font-bold mb-4"
                       >
                         <ArrowLeft className="w-3.5 h-3.5" /> {isEnglish ? "Back to gateways" : "العودة لقائمة البوابات"}
                       </button>

                       {/* PayTabs card Details Form */}
                       {selectedGateway === "paytabs" && (
                         <form onSubmit={handlePayTabsSubmit} className="space-y-4">
                           <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3">
                             <div className="w-8 h-8 bg-[#E04F2F] text-white rounded-lg flex items-center justify-center font-bold text-xs shrink-0">PT</div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-zinc-900">بوابة دفع PayTabs الآمنة</p>
                               <p className="text-[10px] text-zinc-500">معالجة فورية تدعم بطاقات مدى السعودية</p>
                             </div>
                           </div>

                           <div className="space-y-3">
                             <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">اسم حامل البطاقة / Cardholder Name</label>
                               <input 
                                 type="text" 
                                 required
                                 placeholder="MOHAMMAD AL-OTAIBI" 
                                 value={cardName}
                                 onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                 className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold focus:border-zinc-900 outline-none"
                               />
                             </div>

                             <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">رقم البطاقة / Card Number</label>
                               <div className="relative">
                                 <input 
                                   type="text" 
                                   required
                                   maxLength={19}
                                   placeholder="9621 1234 5678 9012" 
                                   value={cardNumber}
                                   onChange={(e) => {
                                     const clean = e.target.value.replace(/\D/g, "");
                                     const formatted = clean.match(/.{1,4}/g)?.join(" ") || clean;
                                     setCardNumber(formatted);
                                   }}
                                   className="w-full bg-white border border-zinc-200 rounded-xl pl-12 pr-3 py-2 text-xs font-mono focus:border-zinc-900 outline-none"
                                 />
                                 <div className="absolute left-3 inset-y-0 flex items-center">
                                   {cardType === "mada" ? (
                                     <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">mada</span>
                                   ) : cardType === "visa" ? (
                                     <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">Visa</span>
                                   ) : cardType === "mastercard" ? (
                                     <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">MC</span>
                                   ) : (
                                     <CreditCard className="w-4 h-4 text-zinc-400" />
                                   )}
                                 </div>
                               </div>
                             </div>

                             <div className="grid grid-cols-2 gap-3">
                               <div>
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">الصلاحية / Expiry</label>
                                 <input 
                                   type="text" 
                                   required
                                   maxLength={5}
                                   placeholder="MM/YY" 
                                   value={cardExpiry}
                                   onChange={(e) => {
                                     let val = e.target.value.replace(/\D/g, "");
                                     if (val.length > 2) {
                                       val = val.slice(0, 2) + "/" + val.slice(2, 4);
                                     }
                                     setCardExpiry(val);
                                   }}
                                   className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-center focus:border-zinc-900 outline-none"
                                 />
                               </div>
                               <div>
                                 <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">الرمز السري / CVV</label>
                                 <input 
                                   type="password" 
                                   required
                                   maxLength={4}
                                   placeholder="•••" 
                                   value={cardCvv}
                                   onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                                   className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono text-center focus:border-zinc-900 outline-none"
                                 />
                               </div>
                             </div>
                           </div>

                           <button
                             type="submit"
                             disabled={paying}
                             className="w-full bg-black text-white py-3.5 rounded-xl font-bold text-xs hover:bg-zinc-900 transition-all flex items-center justify-center gap-2 mt-2"
                           >
                             <Lock className="w-3.5 h-3.5" /> 
                             {paying ? "جاري الاتصال بـ PayTabs..." : `دفع ${Number(paymentAmount).toLocaleString()} ${invoice.currency}`}
                           </button>
                         </form>
                       )}

                       {/* BenefitPay Simulation Interface */}
                       {selectedGateway === "benefitpay" && (
                         <div className="space-y-4 text-center">
                           <div className="p-4 bg-[#005c8a]/10 border border-[#005c8a]/20 rounded-2xl flex items-center gap-3 text-right">
                             <div className="w-10 h-10 bg-[#005c8a] text-[#ffbf1f] rounded-xl flex items-center justify-center font-bold text-sm shrink-0">BP</div>
                             <div>
                               <p className="text-xs font-bold text-zinc-900">محاكاة بنفت باي BenefitPay</p>
                               <p className="text-[10px] text-zinc-500">نظام الدفع الوطني - مملكة البحرين</p>
                             </div>
                           </div>

                           <div className="bg-white border border-zinc-100 p-6 rounded-2xl space-y-4 shadow-sm">
                             <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                               امسح رمز الاستجابة السريع (QR Code) أدناه عبر تطبيق BenefitPay في هاتفك النقال لإتمام عملية الدفع مباشرة.
                             </p>

                             <div className="w-44 h-44 mx-auto bg-zinc-50 border-2 border-[#005c8a] rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                               <QrCode className="w-full h-full text-zinc-800" />
                               <div className="absolute bg-[#005c8a] text-[#ffbf1f] px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider bottom-2">
                                 BenefitPay
                               </div>
                             </div>

                             <div className="flex items-center justify-center gap-2 text-rose-600 bg-rose-50 border border-rose-100 rounded-xl py-2 px-3 text-[10px] font-bold">
                               <span className="animate-ping w-1.5 h-1.5 rounded-full bg-rose-600 block shrink-0" />
                               <span>تنتهي صلاحية الطلب بعد: {formatTimer(benefitTimer)}</span>
                             </div>

                             <button
                               onClick={handleBenefitSimulation}
                               disabled={paying}
                               className="w-full bg-[#005c8a] text-[#ffbf1f] py-3.5 rounded-xl font-bold text-xs hover:bg-[#004e75] transition-all flex items-center justify-center gap-2 shadow-md shadow-[#005c8a]/10"
                             >
                               <CheckCircle2 className="w-4 h-4" />
                               {paying ? "جاري الاستجابة..." : "محاكاة موافقة العميل من تطبيق بنفت"}
                             </button>
                           </div>
                         </div>
                       )}

                       {/* Apple Pay iOS Sheet Simulation */}
                       {selectedGateway === "applepay" && (
                         <div className="space-y-4">
                           <div className="p-4 bg-zinc-900 text-white rounded-2xl flex items-center gap-3">
                             <Smartphone className="w-6 h-6 text-white" />
                             <div className="text-right">
                               <p className="text-xs font-bold">Apple Pay</p>
                               <p className="text-[10px] text-zinc-400">الدفع بلمسة واحدة لبطاقة مدى</p>
                             </div>
                           </div>

                           <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 space-y-3 shadow-inner">
                             <div className="flex justify-between text-xs font-bold border-b border-zinc-200/50 pb-2">
                               <span className="text-zinc-500">التاجر / Merchant</span>
                               <span className="text-zinc-900">{invoice.zatcaConfig?.sellerName || "المتجر الشريك / Merchant"}</span>
                             </div>
                             <div className="flex justify-between text-xs font-bold border-b border-zinc-200/50 pb-2">
                               <span className="text-zinc-500">البطاقة / Card</span>
                               <span className="text-zinc-900 flex items-center gap-1">
                                 <span className="text-[9px] bg-emerald-500 text-white px-1 rounded">mada</span>
                                 <span>Classic (•••• 4921)</span>
                               </span>
                             </div>
                             <div className="flex justify-between text-xs font-black">
                               <span className="text-zinc-900">المبلغ الإجمالي / Total</span>
                               <span className="text-emerald-600 font-mono text-sm">{Number(paymentAmount).toLocaleString()} {invoice.currency}</span>
                             </div>
                           </div>

                           <button
                             onClick={handleApplePaySubmit}
                             disabled={paying}
                             className="w-full bg-black text-white hover:bg-zinc-900 py-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                           >
                             <Smartphone className="w-4 h-4 animate-pulse" />
                             {paying ? "جاري قراءة البصمة..." : "انقر مرتين للموافقة والدفع الفوري"}
                           </button>
                         </div>
                       )}

                       {/* Sadad Payment Account Transfer */}
                       {selectedGateway === "sadad" && (
                         <form onSubmit={handleSadadSubmit} className="space-y-4">
                           <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                             <div className="w-10 h-10 bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center">سداد</div>
                             <div className="text-right">
                               <p className="text-xs font-bold text-emerald-900">حساب سداد الإلكتروني (SADAD)</p>
                               <p className="text-[10px] text-emerald-600">اقتطاع مباشر وآمن من حسابك البنكي</p>
                             </div>
                           </div>

                           <div className="space-y-3">
                             <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">اسم المستخدم لحساب سداد / Sadad Username</label>
                               <input 
                                 type="text" 
                                 required
                                 placeholder="SADAD_USER_123" 
                                 value={sadadUsername}
                                 onChange={(e) => setSadadUsername(e.target.value)}
                                 className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-zinc-900 outline-none"
                               />
                             </div>

                             <div>
                               <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">كلمة المرور / Password</label>
                               <input 
                                 type="password" 
                                 required
                                 placeholder="••••••••" 
                                 value={sadadPassword}
                                 onChange={(e) => setSadadPassword(e.target.value)}
                                 className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-zinc-900 outline-none"
                               />
                             </div>
                           </div>

                           <button
                             type="submit"
                             disabled={paying}
                             className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 mt-2"
                           >
                             <Lock className="w-3.5 h-3.5" /> 
                             {paying ? "جاري الاتصال بالبنك..." : "تأكيد اقتطاع المبلغ عبر سداد"}
                           </button>
                         </form>
                       )}
                     </div>
                   )}

                   {/* Simulated 3D Secure / OTP Bank Screen (Crucial for PayTabs/mada) */}
                   {checkoutStep === "3ds" && (
                     <div className="space-y-6 animate-in zoom-in duration-300">
                       <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden shadow-lg">
                         <div className="bg-zinc-900 text-white px-4 py-3 text-center border-b border-zinc-200 flex items-center justify-between">
                           <div className="flex items-center gap-1 text-[10px] font-black uppercase text-emerald-400">
                             <ShieldCheck className="w-4 h-4 text-emerald-400" />
                             Verified by mada / Visa
                           </div>
                           <div className="text-[9px] text-zinc-400 font-mono">ID: 3DS_SEC_7821</div>
                         </div>

                         <div className="p-6 space-y-4 text-center">
                           <div className="w-12 h-12 bg-zinc-50 border-2 border-zinc-200 rounded-full mx-auto flex items-center justify-center">
                             <Building className="w-5 h-5 text-zinc-700" />
                           </div>

                           <div className="space-y-1">
                             <h4 className="font-bold text-sm text-zinc-900">التحقق الثنائي للعملية</h4>
                             <p className="text-[10px] text-zinc-500 leading-relaxed">
                               لقد أرسلنا رمز التحقق المكون من 4 أرقام عبر رسالة نصية قصيرة (SMS) إلى رقم جوالك المسجل لدى البنك.
                             </p>
                           </div>

                           <div className="space-y-2">
                             <input
                               type="text"
                               maxLength={4}
                               value={otpInput}
                               onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                               placeholder="أدخل الرمز هنا"
                               className="w-32 bg-zinc-50 border-2 border-zinc-200 rounded-xl py-2 px-3 text-center font-bold text-lg font-mono focus:border-zinc-900 outline-none"
                             />
                             {otpError && (
                               <p className="text-[10px] text-rose-500 font-bold flex items-center justify-center gap-1">
                                 <AlertCircle className="w-3.5 h-3.5" /> {otpError}
                               </p>
                             )}
                             <p className="text-[10px] text-zinc-400 font-black">تلميح للتجربة: أدخل الرمز <span className="text-zinc-900 font-mono bg-zinc-100 px-1 py-0.5 rounded">1234</span></p>
                           </div>

                           <div className="pt-2 flex gap-2">
                             <button
                               onClick={handleVerifyOTP}
                               disabled={paying}
                               className="flex-1 bg-black text-white py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-900 transition-all"
                             >
                               {paying ? "جاري التأكيد..." : "تأكيد الرمز وإتمام الدفع"}
                             </button>
                             <button
                               onClick={() => setCheckoutStep("details")}
                               className="px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 rounded-xl text-xs font-bold text-zinc-500"
                             >
                               إلغاء
                             </button>
                           </div>
                         </div>
                       </div>
                     </div>
                   )}

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
                            <p className="text-[10px] text-zinc-400 font-medium">تتم معالجة بياناتك بأمان تام عبر معايير التشفير والامتثال PCI-DSS.</p>
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

           <div className="p-6 bg-white rounded-2xl border border-zinc-100 flex justify-between items-center">
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
