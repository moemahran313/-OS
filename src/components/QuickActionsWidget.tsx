import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  MessageSquare,
  UserPlus,
  Package,
  Plus,
  X,
  Settings2,
  GripHorizontal,
  Zap,
  Check,
  FileCheck,
  Sparkles,
  CheckCircle2,
  Loader2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence, Reorder } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useSettings } from "@/src/contexts/SettingsContext";
import { db } from "@/src/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

// ----------------------------------------------------------------------
// AVAILABLE QUICK ACTIONS DEFINITIONS
// ----------------------------------------------------------------------
const AVAILABLE_QUICK_ACTIONS = [
  {
    id: "create_invoice",
    labelAr: "إنشاء فاتورة سريعة",
    labelEn: "Quick Invoice",
    descAr: "إصدار فاتورة مبسطة وحفظها مباشرة",
    descEn: "Issue & save simplified invoice in 1-click",
    icon: FileText,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100/50",
  },
  {
    id: "add_lead",
    labelAr: "إضافة عميل محتمل",
    labelEn: "Add CRM Lead",
    descAr: "تسجيل فرصة مبيعات جديدة في نظام CRM",
    descEn: "Add a new sales opportunity to CRM",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-50",
    hoverBg: "hover:bg-blue-100/50",
  },
  {
    id: "send_whatsapp",
    labelAr: "مركز مبيعات واتساب",
    labelEn: "WhatsApp Sales Hub",
    descAr: "مراسلة العملاء بقوالب جاهزة وذكية",
    descEn: "Contact clients with smart local templates",
    icon: MessageSquare,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    hoverBg: "hover:bg-emerald-100/50",
  },
  {
    id: "payroll_report",
    labelAr: "إصدار مسير رواتب",
    labelEn: "Quick Payroll",
    descAr: "إنشاء مسير جديد للموظفين فوراً",
    descEn: "Generate payroll run for employees",
    icon: FileCheck,
    color: "text-amber-500",
    bg: "bg-amber-50",
    hoverBg: "hover:bg-amber-100/50",
    path: "/app/payroll/new",
  },
  {
    id: "add_employee",
    labelAr: "إضافة موظف",
    labelEn: "Add Employee",
    descAr: "تسجيل موظف جديد بملف التأمينات",
    descEn: "Onboard new employee into HR system",
    icon: UserPlus,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    hoverBg: "hover:bg-indigo-100/50",
    path: "/app/fwcos/new",
  },
  {
    id: "new_shipment",
    labelAr: "شحنة توريد جديدة",
    labelEn: "New Shipment",
    descAr: "تسجيل أمر توريد ومتابعة الشحنة",
    descEn: "Record a supply chain import order",
    icon: Package,
    color: "text-rose-500",
    bg: "bg-rose-50",
    hoverBg: "hover:bg-rose-100/50",
    path: "/app/suppliers/new",
  },
];

const DEFAULT_QUICK_ACTIONS = [
  "create_invoice",
  "add_lead",
  "send_whatsapp",
  "payroll_report",
];

// ----------------------------------------------------------------------
// HELPER FOR CLICK FREQUENCY
// ----------------------------------------------------------------------
const getClickFrequency = (): Record<string, number> => {
  try {
    const raw = localStorage.getItem("mudarij_quick_action_frequency");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const incrementClickFrequency = (id: string) => {
  try {
    const freq = getClickFrequency();
    freq[id] = (freq[id] || 0) + 1;
    localStorage.setItem("mudarij_quick_action_frequency", JSON.stringify(freq));
  } catch (e) {
    console.error("Failed to write action frequency", e);
  }
};

// ----------------------------------------------------------------------
// MAIN QUICK ACTIONS WIDGET COMPONENT
// ----------------------------------------------------------------------
export default function QuickActionsWidget({
  quickActions = DEFAULT_QUICK_ACTIONS,
  setQuickActions,
  user,
  updateProfile,
  leads = [],
}: {
  quickActions: string[];
  setQuickActions: (actions: string[]) => void;
  user: any;
  updateProfile: any;
  leads?: any[];
}) {
  const { settings } = useSettings();
  const isAr = settings?.language === "ar";

  const [isEditing, setIsEditing] = useState(false);
  const [localActions, setLocalActions] = useState<string[]>(quickActions);
  const [frequencies, setFrequencies] = useState<Record<string, number>>({});

  // Modals state
  const [activeModal, setActiveModal] = useState<"invoice" | "lead" | "whatsapp" | null>(null);

  useEffect(() => {
    setLocalActions(quickActions);
  }, [quickActions]);

  useEffect(() => {
    setFrequencies(getClickFrequency());
  }, [isEditing, activeModal]);

  const handleSaveConfig = async () => {
    if (localActions.length === 0) {
      toast.error(isAr ? "يجب اختيار إجراء واحد على الأقل" : "Select at least one action");
      return;
    }
    setQuickActions(localActions);
    setIsEditing(false);
    if (user && updateProfile) {
      try {
        await updateProfile({ quickActionsConfig: localActions });
        toast.success(isAr ? "تم حفظ ترتيب الإجراءات بنجاح" : "Actions layout saved!");
      } catch (err) {
        toast.error(isAr ? "حدث خطأ أثناء الحفظ" : "Error saving configuration");
      }
    }
  };

  const removeAction = (id: string) => {
    setLocalActions((prev) => prev.filter((a) => a !== id));
  };

  const addAction = (id: string) => {
    if (!localActions.includes(id)) {
      setLocalActions((prev) => [...prev, id]);
    }
  };

  const handleActionClick = (id: string, path?: string) => {
    incrementClickFrequency(id);
    setFrequencies(getClickFrequency());

    if (id === "create_invoice") {
      setActiveModal("invoice");
    } else if (id === "add_lead") {
      setActiveModal("lead");
    } else if (id === "send_whatsapp") {
      setActiveModal("whatsapp");
    } else if (path) {
      // For standard routing actions, navigate to their respective pages
      window.location.hash = path; // fall back to hash navigation or link
    }
  };

  // Find most frequent action
  const sortedByFreq = Object.entries(frequencies).sort((a, b) => b[1] - a[1]);
  const topActionId = sortedByFreq.length > 0 && sortedByFreq[0][1] > 1 ? sortedByFreq[0][0] : null;

  if (isEditing) {
    const unpinnedActions = AVAILABLE_QUICK_ACTIONS.filter((a) => !localActions.includes(a.id));

    return (
      <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 relative text-right" dir={isAr ? "rtl" : "ltr"}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-black text-lg text-zinc-950">
              {isAr ? "تخصيص الإجراءات السريعة" : "Customize Quick Actions"}
            </h3>
            <p className="text-xs text-zinc-500 font-medium">
              {isAr
                ? "اسحب لترتيب الإجراءات، أو قم بإزالتها وإضافتها حسب استخدامك اليومي."
                : "Drag to reorder actions, or add/remove them for your daily routines."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-500 bg-zinc-100 rounded-xl hover:bg-zinc-200 transition-colors"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              {isAr ? "حفظ الترتيب" : "Save Layout"}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <Reorder.Group
            axis="y"
            values={localActions}
            onReorder={setLocalActions}
            className="space-y-2"
          >
            {localActions.map((id) => {
              const action = AVAILABLE_QUICK_ACTIONS.find((a) => a.id === id);
              if (!action) return null;
              const clickCount = frequencies[id] || 0;

              return (
                <Reorder.Item
                  key={id}
                  value={id}
                  className="flex justify-between items-center p-3 bg-zinc-50 border border-zinc-100 rounded-2xl cursor-grab active:cursor-grabbing hover:bg-zinc-100/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <GripHorizontal className="w-5 h-5 text-zinc-400 cursor-grab" />
                    <div className={cn("p-2.5 rounded-xl", action.bg, action.color)}>
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-zinc-800">
                        {isAr ? action.labelAr : action.labelEn}
                      </span>
                      {clickCount > 0 && (
                        <span className="mx-2 px-2 py-0.5 bg-zinc-200/50 text-[10px] text-zinc-500 rounded-full font-bold">
                          {isAr ? `نُفذ ${clickCount} مرات` : `${clickCount} uses`}
                        </span>
                      )}
                      {topActionId === id && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[10px] rounded-full font-bold inline-flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          {isAr ? "الأكثر استخداماً" : "Most Active"}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeAction(id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>

          {unpinnedActions.length > 0 && (
            <div className="pt-4 border-t border-zinc-100">
              <h4 className="text-xs font-black text-zinc-400 mb-3 uppercase tracking-wider">
                {isAr ? "إجراءات إضافية متاحة" : "Available Extra Actions"}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {unpinnedActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => addAction(action.id)}
                    className="flex items-center justify-between p-3 bg-white border border-zinc-200 hover:border-emerald-600/30 hover:bg-emerald-50/20 rounded-2xl transition-all text-right"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", action.bg, action.color)}>
                        <action.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-zinc-800">
                          {isAr ? action.labelAr : action.labelEn}
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {isAr ? action.descAr : action.descEn}
                        </div>
                      </div>
                    </div>
                    <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Plus className="w-4 h-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-white rounded-3xl border border-zinc-100 shadow-sm p-6 relative text-right" dir={isAr ? "rtl" : "ltr"}>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 fill-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-lg text-zinc-950">
                {isAr ? "الإجراءات السريعة بنقرة واحدة" : "One-Click Quick Actions"}
              </h3>
              <p className="text-[11px] font-bold text-zinc-400">
                {isAr
                  ? "نفّذ مهامك اليومية فوراً دون مغادرة لوحة التحكم الرئيسية"
                  : "Perform core business operations instantly without navigating away"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-emerald-600 transition-all bg-zinc-50 hover:bg-emerald-50/50 px-3 py-2 rounded-xl border border-zinc-100"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{isAr ? "تخصيص الإجراءات" : "Customize"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {localActions.map((id) => {
            const action = AVAILABLE_QUICK_ACTIONS.find((a) => a.id === id);
            if (!action) return null;
            const isFrequent = topActionId === id;

            return (
              <button
                key={id}
                onClick={() => handleActionClick(id, action.path)}
                className="group flex flex-col items-center justify-center p-6 rounded-[2rem] border border-zinc-100 hover:border-emerald-600/20 hover:shadow-lg hover:-translate-y-1 bg-gradient-to-b from-white to-zinc-50/30 transition-all cursor-pointer relative overflow-hidden text-center"
              >
                {/* Frequent Action Indicator Ring/Ribbon */}
                {isFrequent && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 text-[9px] rounded-full font-black flex items-center gap-0.5 shadow-sm">
                    <Sparkles className="w-2.5 h-2.5" />
                    {isAr ? "الأكثر نشاطاً" : "Popular"}
                  </span>
                )}

                <div
                  className={cn(
                    "p-4 rounded-[1.25rem] mb-4 group-hover:scale-110 group-active:scale-95 transition-all shadow-sm",
                    action.bg,
                    action.color
                  )}
                >
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-black text-zinc-800 transition-colors group-hover:text-emerald-700">
                  {isAr ? action.labelAr : action.labelEn}
                </span>
                <span className="text-[10px] font-bold text-zinc-400 mt-1 max-w-[130px] line-clamp-1 opacity-80 group-hover:opacity-100">
                  {isAr ? action.descAr : action.descEn}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---------------------------------------------------------------------- */}
      {/* 1. QUICK CREATE INVOICE MODAL */}
      {/* ---------------------------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === "invoice" && (
          <QuickInvoiceModal
            onClose={() => setActiveModal(null)}
            user={user}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. QUICK ADD LEAD MODAL */}
      {/* ---------------------------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === "lead" && (
          <QuickLeadModal
            onClose={() => setActiveModal(null)}
            user={user}
            isAr={isAr}
          />
        )}
      </AnimatePresence>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. QUICK WHATSAPP PREDEFINED SALES HUB */}
      {/* ---------------------------------------------------------------------- */}
      <AnimatePresence>
        {activeModal === "whatsapp" && (
          <QuickWhatsAppModal
            onClose={() => setActiveModal(null)}
            leads={leads}
            user={user}
            isAr={isAr}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ======================================================================
// SUB-COMPONENT: QUICK INVOICE MODAL
// ======================================================================
function QuickInvoiceModal({ onClose, user, isAr }: { onClose: () => void; user: any; isAr: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto invoice number
  const initialInvoiceNum = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Form Fields
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [amountSr, setAmountSr] = useState<number | "">("");
  const [itemDescription, setItemDescription] = useState("");
  const [dueDateDays, setDueDateDays] = useState(7);
  const [includeVat, setIncludeVat] = useState(true);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!clientName || !amountSr) {
      toast.error(isAr ? "يرجى تعبئة الحقول الأساسية" : "Please fill out required fields");
      return;
    }

    setLoading(true);

    try {
      const subtotalHalalas = Math.round(Number(amountSr) * 100);
      const vatAmountHalalas = includeVat ? Math.round(subtotalHalalas * 0.15) : 0;
      const totalAmountHalalas = subtotalHalalas + vatAmountHalalas;

      const issueDate = new Date().toISOString().split("T")[0];
      const dueDateObj = new Date();
      dueDateObj.setDate(dueDateObj.getDate() + dueDateDays);
      const dueDate = dueDateObj.toISOString().split("T")[0];

      const lineItems = [
        {
          description: itemDescription || (isAr ? "خدمات استشارية / توريد أعمال" : "Professional services & consultancy"),
          quantity: 1,
          unitPriceHalalas: subtotalHalalas,
          vatRatePercentage: includeVat ? 15 : 0,
          totalPriceHalalas: subtotalHalalas,
        },
      ];

      const invoicePayload = {
        userId: user.uid,
        type: "simplified",
        number: initialInvoiceNum,
        clientId: "quick_client_" + Math.random().toString(36).substring(2, 7),
        clientName,
        clientEmail: clientEmail || "info@client-quick.com",
        clientPhone: clientPhone || "+966500000000",
        issueDate,
        dueDate,
        currency: "SAR",
        lineItems,
        subtotalHalalas,
        vatAmountHalalas,
        totalAmountHalalas,
        paidAmountHalalas: 0,
        remainingBalanceHalalas: totalAmountHalalas,
        status: "sent",
        notes: isAr ? "فاتورة منشأة بضغطة واحدة عبر منصة مدارج" : "Invoice generated via Mudarij Quick Actions Panel",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, "invoices"), invoicePayload);
      
      // Save Quick Log
      await addDoc(collection(db, "audit_logs"), {
        userId: user.uid,
        action: "QUICK_INVOICE_CREATED",
        timestamp: new Date().toISOString(),
        details: { invoiceNumber: initialInvoiceNum, amountSr: Number(amountSr), clientName },
      });

      setSuccess(true);
      toast.success(isAr ? "تم إصدار الفاتورة الضريبية وحفظها بنجاح!" : "Tax Invoice issued & cataloged!");
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? "حدث خطأ أثناء إصدار الفاتورة" : "Error writing to Firestore database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-right"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="font-black text-lg text-zinc-950">
                {isAr ? "إصدار فاتورة بنقرة واحدة" : "1-Click Quick Invoice"}
              </h3>
              <p className="text-[11px] font-bold text-emerald-600">
                {isAr ? "رقم الفاتورة المقترح:" : "Suggested Number:"} {initialInvoiceNum}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/10"
            >
              <Check className="w-10 h-10 stroke-[3]" />
            </motion.div>
            <h4 className="font-black text-xl text-zinc-900">
              {isAr ? "تم الإصدار والحفظ بنجاح!" : "Tax Invoice Issued!"}
            </h4>
            <p className="text-sm font-semibold text-zinc-500">
              {isAr ? "تم ترحيل البيانات وتحديث منحنيات النمو" : "Database metrics updated in real-time."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Customer Details */}
            <div className="space-y-1">
              <label className="text-xs font-black text-zinc-500">
                {isAr ? "اسم العميل الضريبي *" : "Tax Customer Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? "شركة الحلول المتقدمة المحدودة" : "e.g., Saudi Advanced Solutions Ltd"}
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300"
              />
            </div>

            {/* Email & Phone side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "رقم الجوال" : "Mobile Phone"}
                </label>
                <input
                  type="text"
                  placeholder="05XXXXXXXX"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "البريد الإلكتروني" : "Client Email"}
                </label>
                <input
                  type="email"
                  placeholder="billing@client.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Invoice Amount & Description */}
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "وصف الخدمة / المنتج" : "Item / Service Description"}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? "رسوم استشارات فنية وتطويرية" : "e.g., Custom software dev services"}
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "المبلغ (ريال) *" : "Price (SAR) *"}
                </label>
                <input
                  type="number"
                  required
                  placeholder="15,000"
                  value={amountSr}
                  onChange={(e) => setAmountSr(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 text-center"
                />
              </div>
            </div>

            {/* VAT Toggle & Due Date Slider */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeVat"
                  checked={includeVat}
                  onChange={(e) => setIncludeVat(e.target.checked)}
                  className="w-4.5 h-4.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="includeVat" className="text-xs font-black text-zinc-700 cursor-pointer">
                  {isAr ? "شامل ضريبة القيمة المضافة الكلية (15%)" : "Apply standard 15% VAT on top"}
                </label>
              </div>
              {amountSr !== "" && (
                <div className="text-xs font-black text-zinc-600">
                  {isAr ? "الضريبة:" : "VAT:"}{" "}
                  <span className="text-emerald-600 font-black">
                    SR {(Number(amountSr) * (includeVat ? 0.15 : 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>

            {/* Due date period */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-black">
                <span className="text-zinc-500">{isAr ? "مهلة السداد المتوقعة" : "Due Date Period"}</span>
                <span className="text-emerald-600 font-bold">
                  {dueDateDays} {isAr ? "أيام" : "days"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={dueDateDays}
                onChange={(e) => setDueDateDays(Number(e.target.value))}
                className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>

            {/* Summary details */}
            {amountSr !== "" && (
              <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-black text-emerald-800">
                  {isAr ? "إجمالي مبلغ الفاتورة بعد الضريبة:" : "Grand Total (with VAT):"}
                </span>
                <span className="text-lg font-black text-emerald-700">
                  SR {(Number(amountSr) * (includeVat ? 1.15 : 1)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-sm font-black rounded-2xl transition-all cursor-pointer"
              >
                {isAr ? "تراجع" : "Discard"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isAr ? "حفظ وإصدار ضريبي" : "Save & Issue"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ======================================================================
// SUB-COMPONENT: QUICK ADD LEAD MODAL
// ======================================================================
function QuickLeadModal({ onClose, user, isAr }: { onClose: () => void; user: any; isAr: boolean }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [valueSr, setValueSr] = useState<number | "">("");
  const [status, setStatus] = useState("new");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!name || !company) {
      toast.error(isAr ? "يرجى ملء اسم العميل والشركة" : "Name and Company are required");
      return;
    }

    setLoading(true);

    try {
      const leadPayload = {
        userId: user.uid,
        name,
        company,
        phone: phone || "+966500000000",
        email: email || "contact@company.com",
        value: valueSr ? Number(valueSr) : 0,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "leads"), leadPayload);

      // Save CRM log
      await addDoc(collection(db, "audit_logs"), {
        userId: user.uid,
        action: "QUICK_LEAD_ADDED",
        timestamp: new Date().toISOString(),
        details: { leadName: name, company, value: Number(valueSr) },
      });

      setSuccess(true);
      toast.success(isAr ? "تمت إضافة العميل المحتمل بنجاح وتحديث خط الأنابيب!" : "CRM Opportunity saved!");
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? "حدث خطأ أثناء حفظ بيانات العميل" : "Error saving lead to database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-right"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="font-black text-lg text-zinc-950">
                {isAr ? "إضافة عميل CRM محتمل" : "Add Quick CRM Lead"}
              </h3>
              <p className="text-[11px] font-bold text-blue-500">
                {isAr ? "تسجيل فرصة نمو مبيعات جديدة" : "Record new sales pipeline activity"}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {success ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/10"
            >
              <Check className="w-10 h-10 stroke-[3]" />
            </motion.div>
            <h4 className="font-black text-xl text-zinc-900">
              {isAr ? "تم تسجيل العميل بنجاح!" : "Opportunity Cataloged!"}
            </h4>
            <p className="text-sm font-semibold text-zinc-500">
              {isAr ? "تم ترحيله بنجاح لفرص المبيعات النشطة" : "Lead is active in sales funnel."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4">
            {/* Lead Name */}
            <div className="space-y-1">
              <label className="text-xs font-black text-zinc-500">
                {isAr ? "اسم العميل / جهة الاتصال *" : "Contact Full Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? "محمد المهنا" : "e.g., Mohammad Al-Muhanna"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-300"
              />
            </div>

            {/* Corporate / Company Name */}
            <div className="space-y-1">
              <label className="text-xs font-black text-zinc-500">
                {isAr ? "اسم الشركة / المنشأة التجارية *" : "Company Name *"}
              </label>
              <input
                type="text"
                required
                placeholder={isAr ? "مجموعة المهنا للتجارة والاستثمار" : "e.g., Al-Muhanna Trading Group"}
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-300"
              />
            </div>

            {/* Contact Details side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "رقم الجوال" : "Mobile Phone"}
                </label>
                <input
                  type="text"
                  placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-300 text-left"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-300 text-left"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Estimated Value & Deal Stage */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "القيمة المتوقعة للصفقة (ريال)" : "Expected Deal Value (SAR)"}
                </label>
                <input
                  type="number"
                  placeholder="45,000"
                  value={valueSr}
                  onChange={(e) => setValueSr(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-zinc-300 text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black text-zinc-500">
                  {isAr ? "مرحلة الصفقة الحالية" : "Sales Funnel Stage"}
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-right"
                >
                  <option value="new">{isAr ? "عميل جديد (New)" : "New Lead"}</option>
                  <option value="contacted">{isAr ? "تم التواصل (Contacted)" : "Contacted"}</option>
                  <option value="proposal">{isAr ? "تقديم العرض (Proposal)" : "Proposal Sent"}</option>
                  <option value="won">{isAr ? "تم الكسب (Won)" : "Closed Won"}</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-sm font-black rounded-2xl transition-all cursor-pointer"
              >
                {isAr ? "تراجع" : "Discard"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-blue-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{isAr ? "تسجيل العميل فوراً" : "Add Pipeline Opportunity"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}

// ======================================================================
// SUB-COMPONENT: SMART WHATSAPP SALES HUB MODAL
// ======================================================================
function QuickWhatsAppModal({
  onClose,
  leads = [],
  user,
  isAr,
}: {
  onClose: () => void;
  leads: any[];
  user: any;
  isAr: boolean;
}) {
  const [loading, setLoading] = useState(false);

  // Selection state
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [whatsAppPhone, setWhatsAppPhone] = useState("");
  const [whatsAppMessage, setWhatsAppMessage] = useState("");
  const [whatsAppTemplate, setWhatsAppTemplate] = useState("welcome");

  // GCC Local Pre-defined high-converting templates
  const TEMPLATES = [
    {
      id: "welcome",
      titleAr: "ترحيب ومتابعة",
      titleEn: "Welcome Call",
      bodyAr: "مرحباً {name}، نسعد بتواصلنا معكم من منصة مدارج لتطوير أعمال شركة {company}. فريقنا جاهز لتقديم الدعم ومساعدتكم في أتمتة الأنظمة وحوكمتها الرقمية.",
      bodyEn: "Hi {name}, we are delighted to connect with you from Mudarij OS. We look forward to supporting {company} in automating your financial operations.",
    },
    {
      id: "invoice",
      titleAr: "إشعار فاتورة",
      titleEn: "Invoice Issued",
      bodyAr: "عزيزنا {name}، نود إحاطتكم بصدور الفاتورة الرقمية لشركة {company} بنجاح. يمكنكم سداد الفاتورة مباشرة عبر الرابط المؤمن المرفق بحسابكم في مدارج.",
      bodyEn: "Dear {name}, your digital invoice for {company} has been issued successfully. You may fulfill payment through your secure Mudarij portal.",
    },
    {
      id: "followup",
      titleAr: "متابعة عرض سعر",
      titleEn: "Proposal Followup",
      bodyAr: "السلام عليكم أستاذ {name}، نود الاستفسار عن عرض السعر المقدم مؤخراً لتطوير أعمال {company}. هل لديكم أي ملاحظات أو تعديلات مطلوبة لنقوم باعتمادها؟ دمتم بود.",
      bodyEn: "Hello {name}, following up on the proposal we prepared for {company}. Let us know if you require any adjustments before we finalize.",
    },
  ];

  // Auto-fill form fields when a lead is selected
  useEffect(() => {
    if (selectedLeadId === "manual") {
      setWhatsAppPhone("");
      return;
    }
    const lead = leads.find((l) => l.id === selectedLeadId);
    if (lead) {
      // Auto formatting phone
      let formattedPhone = lead.phone || "";
      if (formattedPhone.startsWith("966")) {
        formattedPhone = formattedPhone.slice(3);
      } else if (formattedPhone.startsWith("+966")) {
        formattedPhone = formattedPhone.slice(4);
      } else if (formattedPhone.startsWith("05")) {
        formattedPhone = formattedPhone.slice(1);
      }
      setWhatsAppPhone(formattedPhone);

      // Load template and replace placeholders
      updateMessage(whatsAppTemplate, lead);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeadId]);

  // Update message body with replaced values
  const updateMessage = (templateId: string, leadObj?: any) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    let lead = leadObj;
    if (!lead && selectedLeadId && selectedLeadId !== "manual") {
      lead = leads.find((l) => l.id === selectedLeadId);
    }

    const nameVal = lead ? lead.name : (isAr ? "شريكنا العزيز" : "Valued Customer");
    const companyVal = lead ? lead.company : (isAr ? "منشأتكم الموقرة" : "Your Corporation");

    let text = isAr ? template.bodyAr : template.bodyEn;
    text = text.replace(/{name}/g, nameVal).replace(/{company}/g, companyVal);
    setWhatsAppMessage(text);
  };

  const handleTemplateChange = (templateId: string) => {
    setWhatsAppTemplate(templateId);
    updateMessage(templateId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppPhone) {
      toast.error(isAr ? "يرجى إدخال رقم الجوال" : "Phone number is required");
      return;
    }

    setLoading(true);

    try {
      let cleanPhone = whatsAppPhone.replace(/\D/g, "");
      if (cleanPhone.startsWith("05")) {
        cleanPhone = "966" + cleanPhone.slice(1);
      } else if (cleanPhone.startsWith("5") && cleanPhone.length === 9) {
        cleanPhone = "966" + cleanPhone;
      } else if (!cleanPhone.startsWith("966") && cleanPhone.length === 9) {
        cleanPhone = "966" + cleanPhone;
      }

      // Log WhatsApp outreach to Audit logs
      if (user) {
        const lead = leads.find((l) => l.id === selectedLeadId);
        await addDoc(collection(db, "audit_logs"), {
          userId: user.uid,
          action: "QUICK_WHATSAPP_SENT",
          timestamp: new Date().toISOString(),
          details: {
            recipientPhone: cleanPhone,
            recipientName: lead ? lead.name : "Manual Recipient",
            templateUsed: whatsAppTemplate,
            messageSnippet: whatsAppMessage.substring(0, 50) + "...",
          },
        });
      }

      // Open WhatsApp Web
      const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(whatsAppMessage)}`;
      window.open(url, "_blank");

      toast.success(isAr ? "جاري توجيهك إلى واتساب ويب... 🟢🚀" : "Opening WhatsApp...");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-zinc-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 shadow-2xl border border-zinc-100 flex flex-col overflow-hidden text-right"
        dir={isAr ? "rtl" : "ltr"}
      >
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100">
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <h3 className="font-black text-lg text-zinc-950">
                {isAr ? "مركز مبيعات واتساب الذكي" : "WhatsApp Sales Hub"}
              </h3>
              <p className="text-[11px] font-bold text-emerald-600">
                {isAr ? "راسل عملائك بقوالب سريعة ومخصصة للمملكة" : "Message contacts with predefined Saudi templates"}
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* CRM Leads Selection dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500">
              {isAr ? "اختر جهة اتصال من العملاء المحتملين" : "Select CRM Contact"}
            </label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all text-right"
            >
              <option value="">-- {isAr ? "اختر عميلاً لتعبئة البيانات تلقائياً" : "Select client to auto-fill"} --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} - {l.company} ({l.phone || (isAr ? "بلا جوال" : "No Phone")})
                </option>
              ))}
              <option value="manual">{isAr ? "إدخال رقم جوال يدوي" : "Manual Custom Number"}</option>
            </select>
          </div>

          {/* WhatsApp Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500">
              {isAr ? "رقم جوال المستلم *" : "Recipient Mobile *"}
            </label>
            <div className="flex gap-2" dir="ltr">
              <span className="bg-zinc-100 border border-zinc-200 px-4 py-3 rounded-2xl text-zinc-600 font-bold flex items-center justify-center text-sm">
                +966
              </span>
              <input
                type="text"
                required
                placeholder="5XXXXXXXX"
                value={whatsAppPhone}
                onChange={(e) => setWhatsAppPhone(e.target.value)}
                className="flex-1 px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-300 text-left"
              />
            </div>
          </div>

          {/* Templates list selection */}
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500">
              {isAr ? "اختر أحد القوالب مسبقة التخصيص" : "Choose Smart Predefined Template"}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleTemplateChange(t.id)}
                  className={cn(
                    "p-3 rounded-xl border text-[11px] font-black transition-all text-center leading-tight cursor-pointer",
                    whatsAppTemplate === t.id
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm"
                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                  )}
                >
                  {isAr ? t.titleAr : t.titleEn}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Edit text */}
          <div className="space-y-1">
            <label className="text-xs font-black text-zinc-500">
              {isAr ? "نص الرسالة المخصص" : "Tailored Message text"}
            </label>
            <textarea
              rows={4}
              required
              value={whatsAppMessage}
              onChange={(e) => setWhatsAppMessage(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-100 rounded-2xl font-semibold text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all min-h-[90px] placeholder:text-zinc-300 leading-relaxed text-right"
              placeholder={isAr ? "اكتب تفاصيل رسالتك هنا..." : "Enter custom message..."}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 text-sm font-black rounded-2xl transition-all cursor-pointer"
            >
              {isAr ? "تراجع" : "Discard"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-black text-sm shadow-md shadow-emerald-600/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{isAr ? "فتح محادثة واتساب" : "Open Chat Window"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
