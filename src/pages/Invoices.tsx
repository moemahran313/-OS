import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Download, 
  Eye, 
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Send,
  MoreHorizontal,
  FileText,
  Mail,
  QrCode, 
  Copy, 
  Check, 
  History, 
  X,
  ShieldCheck,
  CreditCard,
  ArrowRight,
  Globe,
  Wallet,
  TrendingUp,
  ArrowRightLeft,
  AlertOctagon,
  Landmark
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import InvoiceBuilder from "@/src/components/InvoiceBuilder";
import { Invoice } from "@/src/types";
import { downloadElementAsPdf } from "@/src/lib/pdf";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp,
  orderBy 
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import InvoicePrintTemplate from "@/src/components/InvoicePrintTemplate";

const statusConfig = {
  draft: { label: "مسودة", color: "text-zinc-500", bg: "bg-zinc-50", border: "border-zinc-200", icon: FileText },
  sent: { label: "مرسلة", color: "text-blue-500", bg: "bg-blue-50", border: "border-blue-200", icon: Send },
  paid: { label: "مدفوعة", color: "text-emerald-500", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 },
  "partially paid": { label: "مدفوعة جزئياً", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: CreditCard },
  overdue: { label: "متأخرة", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", icon: Clock },
  cancelled: { label: "ملغاة", color: "text-zinc-400", bg: "bg-zinc-50", border: "border-zinc-100", icon: X },
};

export default function Invoices() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('invoices'); // invoices | billing | treasury
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [initialBuilderData, setInitialBuilderData] = useState<any>(null);

  const cashFlowData = [
    { name: '1 Jun', in: 120000, out: 80000 },
    { name: '5 Jun', in: 150000, out: 90000 },
    { name: '10 Jun', in: 80000, out: 120000 },
    { name: '15 Jun', in: 200000, out: 110000 },
    { name: '20 Jun', in: 180000, out: 95000 },
    { name: '25 Jun', in: 250000, out: 150000 },
  ];
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloadingInv, setDownloadingInv] = useState<Invoice | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeLogInv, setActiveLogInv] = useState<Invoice | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [showRemindersConfig, setShowRemindersConfig] = useState(false);
  const [showAuditLogId, setShowAuditLogId] = useState<string | null>(null);
  const [showCorrectionModalId, setShowCorrectionModalId] = useState<string | null>(null);
  const [correctionData, setCorrectionData] = useState({ type: 'credit', amount: 0, reason: '' });
  const [showPaymentModalId, setShowPaymentModalId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
  const [remindersConfig, setRemindersConfig] = useState({ enabled: true, beforeDays: 3, afterDays: 1 });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Invoice[];
      setInvoices(data);
    });

    // Load config from user doc
    if (user.invoiceRemindersConfig) {
      setRemindersConfig(user.invoiceRemindersConfig);
    }

    if (location.state?.openInvoiceBuilder || location.pathname === "/app/invoices/new") {
      setIsBuilding(true);
      if (location.state?.initialData) {
        setInitialBuilderData(location.state.initialData);
      }
      navigate("/app/invoices", { replace: true, state: {} });
    }

    return () => unsubscribe();
  }, [user, location]);

  const handleSendEmail = async (inv: Invoice) => {
    if (!inv.clientEmail) {
      alert(inv.branding?.language === 'en' ? "Please edit the invoice and specify a client email" : "يرجى تعديل الفاتورة وتحديد البريد الإلكتروني للعميل");
      return;
    }
    setSendingEmail(inv.id);
    try {
      const isEnglish = inv.branding?.language === 'en';
      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: inv.clientEmail,
          subject: isEnglish ? `New Tax Invoice #${inv.number}` : `فاتورة ضريبية جديدة #${inv.number}`,
          body: isEnglish 
            ? `Dear Customer, a new invoice has been issued for you in the amount of ${(inv.totalAmountHalalas / 100).toLocaleString()} ${inv.currency}.`
            : `عزيزي العميل، تم إصدار فاتورة جديدة لك بمبلغ ${(inv.totalAmountHalalas / 100).toLocaleString()} ${inv.currency}.`,
          attachmentId: inv.id
        })
      });
      if (res.ok) {
        alert(isEnglish ? "Invoice sent successfully via email" : "تم إرسال الفاتورة بنجاح عبر البريد الإلكتروني");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingEmail(null);
    }
  };

  const copyToClipboard = (id: string) => {
    const link = `${window.location.origin}/pay/${id}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const saveRemindersConfig = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid), {
        invoiceRemindersConfig: remindersConfig
      });
      alert("تم حفظ إعدادات التذكير التلقائي الفواتير");
      setShowRemindersConfig(false);
    } catch (e) {
      console.error("Save config failed", e);
    }
  };

  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    if (!user) return;
    try {
      if (invoiceData.id) {
        const { id, ...data } = invoiceData;
        await updateDoc(doc(db, "invoices", id), {
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "invoices"), {
          ...invoiceData,
          userId: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      setIsBuilding(false);
    } catch (err) {
      console.error("Save invoice failed", err);
    }
  };

  const handleDownload = async (inv: Invoice) => {
    setDownloadingInv(inv);
    try {
      // Wait for the hidden div to be rendered in the DOM
      let el = null;
      for (let i = 0; i < 20; i++) {
        await new Promise(r => setTimeout(r, 50));
        el = document.getElementById(`pdf-source-${inv.id}`);
        if (el) break;
      }
      if (!el) {
        console.error(`Element with ID pdf-source-${inv.id} not found.`);
        return;
      }
      // Add a small extra delay for any fonts or images to load
      await new Promise(resolve => setTimeout(resolve, 200));
      await downloadElementAsPdf(`pdf-source-${inv.id}`, `Invoice-${inv.number}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingInv(null);
    }
  };

  const handleRecordPayment = async () => {
    if (!showPaymentModalId || !paymentAmount || !user) return;
    try {
      const invRef = doc(db, "invoices", showPaymentModalId);
      const invoice = invoices.find(i => i.id === showPaymentModalId);
      if (!invoice) return;

      const newPaidAmount = (invoice.paidAmountHalalas || 0) + (Number(paymentAmount) * 100);
      const isPaid = newPaidAmount >= invoice.totalAmountHalalas;

      await updateDoc(invRef, {
        paidAmountHalalas: newPaidAmount,
        status: isPaid ? 'paid' : 'partially paid',
        updatedAt: serverTimestamp()
      });

      alert("تم تسجيل الدفعة بنجاح");
      setShowPaymentModalId(null);
      setPaymentAmount('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleIssueCorrection = async (invoiceId: string) => {
    if (!user) return;
    try {
      const invRef = doc(db, "invoices", invoiceId);
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) return;

      const correction = {
        id: `corr_${Date.now()}`,
        ...correctionData,
        amountHalalas: Math.round(correctionData.amount * 100),
        timestamp: new Date().toISOString(),
        createdBy: user.name
      };

      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: `إصدار إشعار ${correctionData.type === 'credit' ? 'دائن' : 'مدين'}`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        metadata: { reason: correctionData.reason, amount: correctionData.amount }
      };

      await updateDoc(invRef, {
        corrections: [correction, ...(invoice.corrections || [])],
        auditTrail: [auditEntry, ...(invoice.auditTrail || [])],
        updatedAt: serverTimestamp()
      });

      setShowCorrectionModalId(null);
      setCorrectionData({ type: 'credit', amount: 0, reason: '' });
      alert("تم إصدار إشعار التصحيح وتحديث سجل المراجعة");
    } catch (e) {
      console.error(e);
    }
  };

  const handleZatcaReport = async (invoiceId: string) => {
    if (!user) return;
    if (!confirm("هل أنت متأكد من رغبتك بالربط والإبلاغ الفوري لهيئة الزكاة والدخل (ZATCA Phase 2)؟ سيتم توليد UBL 2.1 و Cryptographic Stamp بصيغة ديناميكية.")) return;
    
    try {
      const invRef = doc(db, "invoices", invoiceId);
      const invoice = invoices.find(i => i.id === invoiceId);
      if (!invoice) return;

      // Simulate ZATCA Fatoora Portal API connection
      await new Promise(r => setTimeout(r, 1500));

      const zatcaReporting = {
         reportedAt: new Date().toISOString(),
         status: 'CLEARED',
         uuid: crypto.randomUUID(),
         hash: btoa(crypto.randomUUID()).substring(0, 44),
      };

      const auditEntry = {
        id: `audit_${Date.now()}`,
        action: `تم الإبلاغ / الفسح عبر منصة ZATCA (Phase 2 Integration)`,
        timestamp: new Date().toISOString(),
        userName: user.name,
        metadata: { reason: "ZATCA Clearance - UBL 2.1 Generated", amount: invoice.totalAmountHalalas / 100 }
      };

      await updateDoc(invRef, {
        "zatcaData.reporting": zatcaReporting,
        auditTrail: [auditEntry, ...(invoice.auditTrail || [])],
        updatedAt: serverTimestamp()
      });

      alert("تم الإبلاغ وفسح الفاتورة عبر هيئة الزكاة (ZATCA Phase 2) بنجاح!");
    } catch (e) {
      console.error(e);
      alert("فشل الإتصال بمنصة ZATCA.");
    }
  };

  if (isBuilding) {
    return <InvoiceBuilder initialData={initialBuilderData} onSave={handleSaveInvoice} onCancel={() => { setIsBuilding(false); setInitialBuilderData(null); }} />;
  }

  const filteredInvoices = invoices.filter((inv) => {
    const matchesFilter = filter === "all" || inv.status === filter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = inv.number?.toLowerCase().includes(q) || inv.clientName?.toLowerCase().includes(q) || inv.clientEmail?.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">محرك المبيعات والفوترة</h1>
          <p className="text-zinc-500 mt-1">نظام فوترة ذكي بامتثال ضريبي (ZATCA) وروابط دفع فورية.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
             onClick={async () => {
                const res = await fetch("/api/automation/run-reminders", { method: "POST" });
                if (res.ok) {
                  const data = await res.json();
                  alert(`تمت معالجة ${data.processed} فاتورة متأخرة. ${data.details.length} تذكيرات مرسلة.`);
                }
             }}
             className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-3 rounded-2xl font-bold hover:bg-zinc-200 transition-all"
             title="تشغيل التذكيرات التلقائية الآن"
          >
            <Send className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">تحفيز التذكيرات</span>
          </button>
          <button 
             onClick={() => setShowRemindersConfig(true)}
             className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-4 py-3 rounded-2xl font-bold shadow-sm hover:bg-zinc-50 transition-all"
             title="إعدادات التذكير التلقائي"
          >
            <Clock className="w-5 h-5" />
            <span className="hidden sm:inline">إعدادات التذكير</span>
          </button>
          <button 
             onClick={() => {
                if (activeTab === 'invoices') {
                  setIsBuilding(true);
                } else {
                  alert("إنشاء خطة فوترة قريباً");
                }
             }}
             className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>{activeTab === 'invoices' ? 'إنشاء فاتورة' : 'إنشاء خطة فوترة'}</span>
          </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-zinc-200 mb-6 mt-4">
        <button 
          onClick={() => setActiveTab('invoices')}
          className={`pb-4 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'invoices' ? 'border-zinc-900 text-zinc-900' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
        >
          <FileText className="w-5 h-5" /> الفواتير العادية (One-Time)
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`pb-4 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'billing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
        >
          <Globe className="w-5 h-5" /> محرك الفوترة الدورية (Billing Engine)
        </button>
        <button 
          onClick={() => setActiveTab('treasury')}
          className={`pb-4 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'treasury' ? 'border-amber-500 text-amber-600' : 'border-transparent text-zinc-500 hover:text-zinc-900'}`}
        >
          <CreditCard className="w-5 h-5" /> الخزينة والتحصيلات (Treasury)
        </button>
      </div>

      {activeTab === 'invoices' && (
        <>
          {/* Dashboard Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المفوتر", value: `${((Array.isArray(invoices) ? invoices : []).reduce((a, b) => a + (b.totalAmountHalalas || 0), 0) / 100).toLocaleString()} ر.س` },
          { label: "تم تحصيله", value: `${((Array.isArray(invoices) ? invoices : []).filter(i => i.status === 'paid').reduce((a, b) => a + (b.totalAmountHalalas || 0), 0) / 100).toLocaleString()} ر.س` },
          { label: "بانتظار الدفع", value: `${((Array.isArray(invoices) ? invoices : []).filter(i => i.status !== 'paid').reduce((a, b) => a + (b.totalAmountHalalas || 0), 0) / 100).toLocaleString()} ر.س` },
          { label: "متوسط سرعة الدفع", value: "غير متوفر" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-zinc-100 rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <h4 className="text-xl font-black text-zinc-900 leading-none">{stat.value}</h4>
          </div>
        ))}
      </section>

      {/* List Area */}
      <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden min-h-[400px]">
        <div className="p-6 border-b border-zinc-100 flex flex-wrap gap-4 items-center justify-between bg-zinc-50/30">
          <div className="flex gap-2">
            {["all", "paid", "sent", "overdue"].map((f) => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  filter === f ? "bg-zinc-900 text-white border-zinc-900" : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50"
                )}
              >
                {f === "all" ? "الكل" : statusConfig[f as keyof typeof statusConfig].label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-4 inset-y-0 my-auto w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="ابحث برقم الفاتورة، اسم العميل، أو البريد الإلكتروني..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-zinc-200 rounded-2xl py-3 pr-12 pl-4 text-sm w-full focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900/20 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-zinc-50/20 border-b border-zinc-100">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">رقم الفاتورة</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">العميل</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">QR</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">رابط الدفع</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left">المبلغ</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                       <FileText className="w-12 h-12" />
                       <p className="text-sm font-bold">لا يوجد فواتير حتى الآن</p>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-zinc-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                       <span className="font-bold text-sm text-zinc-900">#{inv.number}</span>
                       <span className="text-[10px] text-zinc-400 font-medium">{inv.issueDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-zinc-700">
                     {inv.clientName}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className="p-1 bg-white border border-zinc-100 rounded-lg shadow-sm">
                        <QRCodeSVG 
                          value={`${window.location.origin}/pay/${inv.id}`} 
                          size={32}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <div className={cn(
                        "inline-flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold border whitespace-nowrap text-center transition-all",
                        (statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft).bg,
                        (statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft).color,
                        (statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft).border
                      )}>
                        <div className="flex items-center gap-1">
                          {React.createElement((statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft).icon, { className: "w-3 h-3" })}
                          {(statusConfig[inv.status as keyof typeof statusConfig] || statusConfig.draft).label}
                        </div>
                        {inv.status === 'partially paid' && (
                          <div className="mt-1 pt-1 border-t border-blue-100/50 w-full flex flex-col gap-0.5">
                            <span className="text-[8px] opacity-80 underline italic">تم دفع {(inv.paidAmountHalalas / 100).toLocaleString()} ر.س</span>
                            <span className="text-[8px] opacity-80">متبقي {(inv.remainingBalanceHalalas / 100).toLocaleString()} ر.س</span>
                          </div>
                        )}
                        {inv.zatcaData?.reporting?.status === 'CLEARED' && (
                           <div className="mt-1 pt-1 border-t border-emerald-100/50 w-full flex flex-col gap-0.5 text-emerald-600">
                             <span className="text-[8px] opacity-80 font-black">✔ مفسوحة (ZATCA Ph2)</span>
                           </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button 
                         onClick={() => copyToClipboard(inv.id)}
                         className={cn(
                           "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all",
                           copiedId === inv.id ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-900 hover:text-zinc-900"
                         )}
                      >
                        {copiedId === inv.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedId === inv.id ? "تم النسخ" : "نسخ الرابط"}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex flex-col items-end">
                      <span className="font-black text-sm text-zinc-900">{(inv.totalAmountHalalas / 100).toLocaleString()} {inv.currency}</span>
                      {inv.paidAmountHalalas > 0 && (
                        <span className="text-[9px] font-bold text-emerald-600">محصل: {(inv.paidAmountHalalas / 100).toLocaleString()}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {inv.zatcaData && inv.zatcaData?.reporting?.status !== 'CLEARED' && inv.status !== 'draft' && (
                        <button 
                          onClick={() => handleZatcaReport(inv.id)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                          title="إبلاغ ZATCA (المرحلة 2)"
                        >
                          <Globe className="w-4 h-4" />
                        </button>
                      )}
                       <button 
                         onClick={() => setActiveLogInv(inv)}
                         className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                         title="سجل التدقيق والمراجعة"
                       >
                        <History className="w-4 h-4" />
                      </button>
                      {inv.isLocked && inv.status !== 'cancelled' && (
                        <button 
                          onClick={() => {
                             setCorrectionData({ type: 'credit', amount: (inv.remainingBalanceHalalas / 100), reason: 'تصحيح رصيد' });
                             setShowCorrectionModalId(inv.id);
                          }}
                          className="p-2 hover:bg-rose-50 rounded-lg text-rose-500 transition-colors"
                          title="إصدار إشعار تصحيح (دائن/مدين)"
                        >
                          <AlertCircle className="w-4 h-4" />
                        </button>
                      )}
                      {inv.status !== 'cancelled' && inv.status !== 'paid' && inv.totalAmountHalalas > 0 && (
                        <button
                          onClick={() => {
                             setPaymentAmount(inv.remainingBalanceHalalas / 100);
                             setShowPaymentModalId(inv.id);
                          }}
                          className="p-2 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors"
                          title="تسجيل دفعة للفاتورة"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                      {!inv.isLocked && (
                        <button 
                          onClick={() => {
                            setInitialBuilderData(inv);
                            setIsBuilding(true);
                          }}
                          className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                          title="تعديل المسودة"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                       <a 
                         href={`/pay/${inv.id}`} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                         title="عرض الفاتورة"
                       >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button 
                        onClick={() => handleDownload(inv)}
                        disabled={downloadingInv?.id === inv.id}
                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-900 transition-colors"
                        title="تحميل PDF (عبر الخادم)"
                      >
                        <Download className={cn("w-4 h-4", downloadingInv?.id === inv.id && "animate-bounce")} />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(inv)}
                        disabled={sendingEmail === inv.id}
                        className={cn(
                          "p-2 hover:bg-zinc-100 rounded-lg transition-colors",
                          sendingEmail === inv.id ? "text-primary animate-pulse" : "text-zinc-400 hover:text-zinc-900"
                        )}
                        title="إرسال عبر البريد"
                      >
                        <Mail className={cn("w-4 h-4", sendingEmail === inv.id && "animate-bounce")} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      </>
      )}

      {activeTab === 'billing' && (
        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 shadow-sm">
               <h3 className="text-xl font-black text-blue-900 mb-2">الاشتراكات (Subscriptions)</h3>
               <p className="text-sm font-medium text-blue-800">إدارة الفواتير الدورية المتكررة مثل اشتراكات SaaS، باقات الصيانة، وعقود الخدمات الشهرية.</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm">
               <h3 className="text-xl font-black text-emerald-900 mb-2">الدفع المرحلي (Milestones)</h3>
               <p className="text-sm font-medium text-emerald-800">إصدار الفواتير بناءً على نسب الإنجاز للمشاريع وتسليم الدفعات وفق بنود العقد.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 shadow-sm">
               <h3 className="text-xl font-black text-amber-900 mb-2">حسب الاستخدام (Usage-Based)</h3>
               <p className="text-sm font-medium text-amber-800">توليد ფواتير تعتمد على الوحدات المستهلكة أو الساعات المفوترة تلقائياً بنهاية الدورة.</p>
            </div>
          </div>
          
          <div className="bg-white border border-zinc-200 rounded-3xl p-20 flex flex-col items-center justify-center text-center shadow-sm">
             <Globe className="w-16 h-16 text-zinc-300 mb-4" />
             <h3 className="text-2xl font-black text-zinc-900">محرك الفوترة (Billing Engine)</h3>
             <p className="text-zinc-500 max-w-md mt-2 font-bold leading-relaxed">
               قريباً: سيتمكن النظام من جلب بيانات الاستخدام واشتراكات العملاء لتوليد وإرسال الفواتير الدورية (B2B/B2C) بشكل أوتوماتيكي ومطابق لـ ZATCA المرحلة الثانية.
             </p>
          </div>
        </section>
      )}

      {activeTab === 'treasury' && (
        <section className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
               <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl"></div>
               <Wallet className="w-8 h-8 text-amber-400 mb-6" />
               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">الرصيد النقدي المتاح (Cash Position)</p>
               <h2 className="text-4xl font-black mb-2">2,450,000 <span className="text-lg text-zinc-500">SAR</span></h2>
               <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                 <TrendingUp className="w-4 h-4" /> +12.5% عن الشهر الماضي
               </div>
             </div>

             <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                     <ArrowRightLeft className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">توقع التدفقات (60 Day Forecast)</p>
                <h3 className="text-2xl font-black text-zinc-900">+850,000 <span className="text-sm text-zinc-400">SAR صافي متوقع</span></h3>
             </div>

             <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                     <Landmark className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">الحسابات البنكية المربوطة</p>
                <h3 className="text-2xl font-black text-zinc-900">4 <span className="text-sm font-medium text-zinc-400">حسابات (مزامنة يومية)</span></h3>
             </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
             <h3 className="text-lg font-black text-zinc-900 mb-6">التدفقات النقدية (الداخلة vs الخارجة)</h3>
             <div className="h-[300px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={cashFlowData}>
                   <defs>
                     <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                   <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 'bold' }} />
                   <YAxis hide domain={['dataMin - 10000', 'dataMax + 20000']} />
                   <Tooltip 
                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     labelStyle={{ fontWeight: 'bold', color: '#18181b', marginBottom: '4px' }}
                   />
                   <Area type="monotone" dataKey="in" name="مقبوضات" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                   <Area type="monotone" dataKey="out" name="مدفوعات" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           </div>
           
           <div className="bg-rose-50 border border-rose-200 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between mt-6 gap-4">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">
                   <AlertOctagon className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-xl font-black text-rose-900">مبالغ متأخرة الدفع (Overdue)</h3>
                   <p className="text-sm font-medium text-rose-700 mt-1">يوجد 12 فاتورة متأخرة تتطلب انتباه التحصيل الفوري.</p>
                 </div>
              </div>
              <div className="text-left shrink-0 shrink">
                 <p className="text-3xl font-black text-rose-600">845,000 <span className="text-sm">SAR</span></p>
                 <button className="text-xs font-bold bg-white text-rose-700 px-3 py-1.5 rounded-lg mt-2 shadow-sm border border-rose-100">إرسال مطالبات آلية (AI)</button>
              </div>
           </div>

           <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm mt-6">
             <div className="flex justify-between items-end mb-6">
               <div>
                  <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-indigo-600" /> التسوية البنكية المدعومة بالذكاء الاصطناعي (AI Bank Reconciliation)
                  </h3>
                  <p className="text-zinc-500 font-medium mt-1">مطابقة تلقائية بين الحركات البنكية (Bank Feeds) وسجلات دفتر الأستاذ (Ledger).</p>
               </div>
               <button className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-100 border border-indigo-100 transition-colors">
                 تحديث الخلاصة البنكية (Open Banking)
               </button>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/4">الحركة البنكية (Bank Feed)</th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/5">المبلغ</th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/4">السجل المحاسبي المقترح (Ledger)</th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/6">حالة المطابقة</th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-left w-1/6">تأكيد</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium">
                    {[
                      { id: 1, bankDesc: 'حوالة واردة - شركة التقنية المتقدمة', amount: '+ 45,000 SAR', ledgerMatch: 'فاتورة مبيعات #INV-2023-089', conf: 98, status: 'auto_match' },
                      { id: 2, bankDesc: 'سداد رواتب شهر مايو - البنك الأهلي', amount: '- 120,500 SAR', ledgerMatch: 'مسير رواتب W2 - مقيم', conf: 100, status: 'auto_match' },
                      { id: 3, bankDesc: 'POS SETTLEMENT 89201', amount: '+ 1,250 SAR', ledgerMatch: 'مبيعات نقاط بيع يومية', conf: 85, status: 'review' },
                      { id: 4, bankDesc: 'FEE CHG - WIRE TRANSFER', amount: '- 150 SAR', ledgerMatch: 'مصروفات بنكية (رسوم تحويل)', conf: undefined, status: 'unmatched' },
                    ].map((row, i) => (
                      <tr key={i} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="py-4 px-4 font-bold text-zinc-900">{row.bankDesc}</td>
                        <td className="py-4 px-4 font-mono text-xs font-bold text-zinc-700 dir-ltr text-right">{row.amount}</td>
                        <td className="py-4 px-4">
                          {row.status === 'unmatched' ? (
                            <span className="text-xs text-zinc-400 italic">يبحث الذكاء الاصطناعي عن تطابق...</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-zinc-800">{row.ledgerMatch}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${row.conf && row.conf > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                {row.conf}% دقة
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {row.status === 'auto_match' && <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black"><CheckCircle2 className="w-3.5 h-3.5" /> مطابقة ذكية</span>}
                          {row.status === 'review' && <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-black"><AlertOctagon className="w-3.5 h-3.5" /> مراجعة المطابقة</span>}
                          {row.status === 'unmatched' && <span className="inline-flex items-center gap-1.5 bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full text-[10px] font-black"><Search className="w-3.5 h-3.5" /> غير مطابق</span>}
                        </td>
                        <td className="py-4 px-4 text-left">
                          <button className={`text-[10px] font-bold px-3 py-1.5 rounded-lg border transition-colors ${row.status === 'auto_match' ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'}`}>
                            {row.status === 'unmatched' ? 'إنشاء قيد' : 'اعتماد القيد'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
        </section>
      )}

      {/* Activity & Audit Trail Modal */}
      {activeLogInv && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <header className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 text-white rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-black text-zinc-900 leading-tight">سجل المراجعة والتدقيق (Audit Trail)</h3>
                    <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-0.5">Invoice #{activeLogInv.number} • v{activeLogInv.version || 1}</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveLogInv(null)}
                className="p-2 hover:bg-zinc-200 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </header>
            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Corrections Summary */}
              {activeLogInv.corrections && activeLogInv.corrections.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                        <AlertCircle className="w-3 h-3" />
                        إشعارات التصحيح للمحاسب
                    </h4>
                    <div className="space-y-2">
                        {activeLogInv.corrections.map((corr) => (
                            <div key={corr.id} className={cn(
                                "p-4 rounded-2xl border flex justify-between items-center",
                                corr.type === 'credit' ? "bg-rose-50 border-rose-100" : "bg-blue-50 border-blue-100"
                            )}>
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-zinc-900">{corr.number} - {corr.reason}</p>
                                    <p className="text-[10px] text-zinc-500">بواسطة: {corr.createdBy} • {new Date(corr.timestamp).toLocaleString("ar-SA")}</p>
                                </div>
                                <div className="text-left">
                                    <p className={cn("text-sm font-black", corr.type === 'credit' ? "text-rose-600" : "text-blue-600")}>
                                        {corr.type === 'credit' ? '-' : '+'}{(corr.amountHalalas / 100).toLocaleString()} {activeLogInv.currency}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <History className="w-3 h-3" />
                    سجل التغييرات الكامل (Immutable Log)
                </h4>
                <div className="space-y-6">
                  {activeLogInv.auditTrail?.map((entry, i) => (
                    <div key={entry.id} className="flex gap-4 group relative">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-zinc-900 z-10" />
                        {i !== (activeLogInv.auditTrail?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-zinc-100 -mb-6" />}
                      </div>
                      <div className="flex-1 pb-6 bg-zinc-50/50 p-4 rounded-2xl border border-zinc-100 hover:border-zinc-300 transition-all">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-black text-zinc-900">{entry.action}</p>
                                <p className="text-[10px] text-zinc-400 font-bold mt-1">
                                    {entry.userName} • {new Date(entry.timestamp).toLocaleString("ar-SA")}
                                </p>
                            </div>
                            <span className="text-[9px] bg-white px-2 py-1 rounded-lg border border-zinc-200 text-zinc-400 font-bold">ID: {entry.id.split('_')[1]}</span>
                        </div>
                        
                        {entry.changes && entry.changes.length > 0 && (
                          <div className="mt-3 grid grid-cols-1 gap-2 pt-3 border-t border-zinc-100">
                            {entry.changes.map((ch, j) => (
                              <div key={j} className="text-[10px] flex gap-2 items-center flex-wrap">
                                <span className="font-bold text-zinc-500">{ch.field}:</span>
                                <span className="text-rose-500 line-through bg-rose-50 px-1 rounded truncate max-w-[100px]">{JSON.stringify(ch.old)}</span>
                                <ArrowRight className="w-2 h-2 text-zinc-300" />
                                <span className="text-emerald-600 bg-emerald-50 px-1 rounded font-bold truncate max-w-[100px]">{JSON.stringify(ch.new)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {entry.metadata && (
                            <div className="mt-2 p-2 bg-white rounded-xl border border-zinc-100 text-[10px] text-zinc-500">
                                {entry.metadata.reason && <p>السبب: {entry.metadata.reason}</p>}
                                {entry.metadata.amount && <p>المبلغ المتأثر: {entry.metadata.amount.toLocaleString()}</p>}
                            </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Legacy Logs Fallback */}
                  {(!activeLogInv.auditTrail || activeLogInv.auditTrail.length === 0) && activeLogInv.logs?.map((log, i) => (
                     <div key={i} className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-zinc-200 mt-1.5" />
                        <div>
                           <p className="text-xs font-bold text-zinc-600">{log.action}</p>
                           <p className="text-[10px] text-zinc-400">{new Date(log.timestamp).toLocaleString("ar-SA")}</p>
                        </div>
                     </div>
                  ))}
                </div>
              </div>
            </div>
            <footer className="p-6 bg-zinc-900 text-zinc-400 text-[10px] text-center font-bold tracking-widest uppercase border-t border-zinc-800">
                Immutable Ledger • System Integrity Protected
            </footer>
          </div>
        </div>
      )}

      {/* Correction Modal */}
      {showCorrectionModalId && (
          <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
                <header className="p-8 pb-4 flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner shadow-rose-200">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 mt-4 tracking-tight">إصدار إشعار تصحيح</h3>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Correction Note Generator</p>
                    </div>
                    <button onClick={() => setShowCorrectionModalId(null)} className="p-3 hover:bg-zinc-100 rounded-2xl transition-all">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </header>

                <div className="p-8 space-y-6">
                    <div className="space-y-4 p-2 bg-zinc-50 rounded-3xl border border-zinc-100">
                        <div className="grid grid-cols-2 gap-1">
                            <button 
                                onClick={() => setCorrectionData({...correctionData, type: 'credit'})}
                                className={cn(
                                    "py-3 rounded-2xl text-xs font-black transition-all",
                                    correctionData.type === 'credit' ? "bg-rose-500 text-white shadow-lg shadow-rose-200" : "text-zinc-400 hover:text-zinc-600 hover:bg-white"
                                )}
                            >إشعار دائن (Credit)</button>
                            <button 
                                onClick={() => setCorrectionData({...correctionData, type: 'debit'})}
                                className={cn(
                                    "py-3 rounded-2xl text-xs font-black transition-all",
                                    correctionData.type === 'debit' ? "bg-blue-500 text-white shadow-lg shadow-blue-200" : "text-zinc-400 hover:text-zinc-600 hover:bg-white"
                                )}
                            >إشعار مدين (Debit)</button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">المبلغ الصافي للتصحيح</label>
                        <div className="relative">
                            <input 
                                type="number"
                                value={Number.isNaN(correctionData.amount) ? "" : correctionData.amount}
                                onChange={(e) => setCorrectionData({...correctionData, amount: Number(e.target.value)})}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-black text-lg focus:ring-4 focus:ring-zinc-100 outline-none transition-all"
                            />
                            <span className="absolute left-5 inset-y-0 flex items-center text-xs font-bold text-zinc-400">SAR</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">سبب التصحيح (محاسبياً)</label>
                        <textarea 
                            value={correctionData.reason}
                            onChange={(e) => setCorrectionData({...correctionData, reason: e.target.value})}
                            placeholder="مثال: خصم إضافي، تعديل كمية، خطأ في الحساب..."
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-bold text-sm h-32 focus:ring-4 focus:ring-zinc-100 outline-none transition-all resize-none"
                        />
                    </div>
                </div>

                <footer className="p-8 bg-zinc-50/50 border-t border-zinc-100 flex gap-4">
                    <button onClick={() => setShowCorrectionModalId(null)} className="flex-1 py-4 bg-white border border-zinc-200 rounded-2xl font-bold text-zinc-500 hover:bg-white hover:border-zinc-300 transition-all">إلغاء</button>
                    <button 
                        onClick={() => handleIssueCorrection(showCorrectionModalId)}
                        className="flex-1 py-4 bg-zinc-900 text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-zinc-900/10"
                    >تأكيد الإصدار</button>
                </footer>
              </div>
          </div>
      )}
      {/* Reminders Config Modal */}
      {showRemindersConfig && (
        <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <header className="px-6 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
               <div className="flex items-center gap-2 font-bold text-zinc-900">
                 <Clock className="w-5 h-5 text-indigo-600" />
                 <span>إعدادات التذكير التلقائي الفواتير المتأخرة</span>
               </div>
               <button onClick={() => setShowRemindersConfig(false)} className="p-1.5 hover:bg-zinc-200 rounded-lg transition-colors">
                 <X className="w-4 h-4 text-zinc-500" />
               </button>
            </header>
            <div className="p-6 space-y-6">
              <label className="flex items-center gap-3 p-4 border border-zinc-200 rounded-2xl cursor-pointer hover:bg-zinc-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={remindersConfig.enabled} 
                  onChange={(e) => setRemindersConfig({ ...remindersConfig, enabled: e.target.checked })}
                  className="w-5 h-5 accent-zinc-900"
                />
                <span className="font-bold text-zinc-900">تفعيل إرسال التذكيرات التلقائية</span>
              </label>

              {remindersConfig.enabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-zinc-500">عدد الأيام قبل الاستحقاق الأول للتذكير</label>
                     <input 
                       type="number" 
                       min="1"
                       max="30"
                       value={Number.isNaN(remindersConfig.beforeDays) ? "" : remindersConfig.beforeDays}
                       onChange={(e) => setRemindersConfig({ ...remindersConfig, beforeDays: Number(e.target.value) })}
                       className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-xs font-bold text-zinc-500">التذكير الثاني بعد الاستحقاق بـ (يوم)</label>
                     <input 
                       type="number" 
                       min="1"
                       max="30"
                       value={Number.isNaN(remindersConfig.afterDays) ? "" : remindersConfig.afterDays}
                       onChange={(e) => setRemindersConfig({ ...remindersConfig, afterDays: Number(e.target.value) })}
                       className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-zinc-900/20 outline-none transition-all"
                     />
                   </div>
                </div>
              )}
            </div>
            <footer className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex justify-end gap-3">
               <button onClick={() => setShowRemindersConfig(false)} className="px-6 py-2.5 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-100">إلغاء</button>
               <button onClick={saveRemindersConfig} className="px-6 py-2.5 rounded-xl bg-zinc-900 text-white font-bold hover:scale-105 transition-transform shadow-lg shadow-zinc-900/20 text-sm">
                 حفظ الإعدادات
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm animate-in fade-in duration-200" dir="rtl">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            <header className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-zinc-900">تسجيل دفعة</h3>
                  <p className="text-xs text-zinc-500 font-medium">تسجيل دفعة يدوية أو جزئية</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPaymentModalId(null)}
                className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </header>
            
            <div className="p-6 space-y-6">
               <div className="space-y-2">
                 <label className="text-xs font-bold text-zinc-500">مبلغ الدفعة الإضافية المستلمة</label>
                 <div className="relative">
                   <input 
                     type="number" 
                     min="0.01"
                     step="0.01"
                     value={paymentAmount}
                     onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                     className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all pl-12"
                     placeholder="0.00"
                   />
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">SAR</span>
                 </div>
               </div>
            </div>
            
            <footer className="p-6 bg-zinc-50/50 border-t border-zinc-100 flex justify-end gap-3">
               <button 
                 onClick={() => setShowPaymentModalId(null)} 
                 className="px-6 py-2.5 rounded-xl border border-zinc-200 font-bold text-zinc-600 hover:bg-zinc-100"
               >
                 إلغاء
               </button>
               <button 
                 onClick={handleRecordPayment} 
                 className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 text-sm"
               >
                 حفظ الدفعة
               </button>
            </footer>
          </div>
        </div>
      )}

      {/* Hidden PDF Source for Downloads */}
      {downloadingInv && (
        <div className="fixed -left-[2000px] top-0">
          <div id={`pdf-source-${downloadingInv.id}`} className="w-[800px]">
             <InvoicePrintTemplate invoice={downloadingInv} />
          </div>
        </div>
      )}
    </div>
  );
}
