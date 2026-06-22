import React, { useState, useEffect } from "react";
import { User, ShieldCheck, FileText, Check, X, ClipboardList, Briefcase, Landmark, RefreshCw, Send } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "@/src/lib/firebase";
import { toast } from "sonner";
import { useUser } from "@/src/contexts/UserContext";

interface PayrollPortalsProps {
  employees: any[];
}

export default function PayrollPortals({ employees }: PayrollPortalsProps) {
  const { user } = useUser();
  const [portalType, setPortalType] = useState<"employee" | "manager">("employee");
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  
  // Requests states
  const [leaves, setLeaves] = useState<any[]>([]);
  const [advances, setAdvances] = useState<any[]>([]);
  
  // Submit states
  const [submitting, setSubmitting] = useState(false);
  
  // Form states
  const [leaveForm, setLeaveForm] = useState({ leaveType: "Annual", startDate: "", endDate: "", notes: "" });
  const [advanceForm, setAdvanceForm] = useState({ amount: 5000, installments: 5, reason: "" });

  // Listen to Leave and Advance requests
  useEffect(() => {
    if (!user) return;

    const qLeaves = query(collection(db, "leave_requests"), where("userId", "==", user.uid));
    const unsubLeaves = onSnapshot(qLeaves, (snap) => {
      setLeaves(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "leave_requests");
    });

    const qAdvances = query(collection(db, "advance_requests"), where("userId", "==", user.uid));
    const unsubAdvances = onSnapshot(qAdvances, (snap) => {
      setAdvances(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "advance_requests");
    });

    return () => {
      unsubLeaves();
      unsubAdvances();
    };
  }, [user]);

  const activeEmployees = employees.filter(e => e.status === "active" || e.status === "نشط");
  const selectedEmp = employees.find(e => e.id === selectedEmpId);

  useEffect(() => {
    if (activeEmployees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(activeEmployees[0].id);
    }
  }, [activeEmployees, selectedEmpId]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEmp) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, "leave_requests"), {
        userId: user.uid,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        endDate: leaveForm.endDate,
        notes: leaveForm.notes,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      toast.success("تم إرسال طلب الإجازة للمراجعة بنجاح");
      setLeaveForm({ leaveType: "Annual", startDate: "", endDate: "", notes: "" });
    } catch (err: any) {
      toast.error("فشل إرسال الطلب: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedEmp) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, "advance_requests"), {
        userId: user.uid,
        employeeId: selectedEmp.id,
        employeeName: selectedEmp.name,
        amount: Number(advanceForm.amount),
        installments: Number(advanceForm.installments),
        reason: advanceForm.reason,
        status: "pending",
        createdAt: new Date().toISOString()
      });

      toast.success("تم إرسال طلب السلفة للتدقيق المالي");
      setAdvanceForm({ amount: 5000, installments: 5, reason: "" });
    } catch (err: any) {
      toast.error("فشل إرسال الطلب: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleActionLeave = async (id: string, status: "approved" | "rejected") => {
    try {
      await updateDoc(doc(db, "leave_requests", id), { status });
      toast.success(`تم ${status === "approved" ? "قبول" : "رفض"} طلب الإجازة بنجاح.`);
    } catch (err: any) {
      toast.error("فشل الإجراء: " + err.message);
    }
  };

  const handleActionAdvance = async (id: string, status: "approved" | "rejected", req: any) => {
    try {
      await updateDoc(doc(db, "advance_requests", id), { status });
      
      // If approved, push to employee's monthly otherDeductions
      if (status === "approved") {
        const empRef = doc(db, "employees", req.employeeId);
        const monthlyDeductionHalalas = Math.round((req.amount / req.installments) * 100);
        await updateDoc(empRef, {
          otherDeductionsHalalas: monthlyDeductionHalalas,
          activeAdvanceAmountHalalas: Math.round(req.amount * 100)
        });
      }

      toast.success(`تم ${status === "approved" ? "اعتماد" : "رفض"} السلفة وتحديث خصومات مسير الرواتب.`);
    } catch (err: any) {
      toast.error("فشل الإجراء: " + err.message);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Switcher */}
      <div className="flex bg-zinc-100 p-1.5 rounded-2xl w-full md:w-max">
        <button
          onClick={() => setPortalType("employee")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            portalType === "employee" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <Briefcase className="w-4 h-4" /> بوابة إداري الخدمة الذاتية (باسم الموظف)
        </button>
        <button
          onClick={() => setPortalType("manager")}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
            portalType === "manager" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> مركز موافقات المدير (Manager Approval)
        </button>
      </div>

      {portalType === "employee" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 space-y-4">
              <label className="text-xs font-bold text-zinc-500">اختر موظفاً لعرض حساب الخدمة الذاتية</label>
              <select
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-semibold text-xs outline-none focus:ring-2 focus:ring-primary/20"
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {activeEmployees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.position})
                  </option>
                ))}
              </select>
            </div>

            {selectedEmp && (
              <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 space-y-4">
                <h4 className="font-bold text-zinc-900 text-sm">طلب إجازة جديدة</h4>
                <form onSubmit={handleApplyLeave} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">نوع الإجازة</label>
                    <select
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 font-medium text-xs outline-none"
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    >
                      <option value="Annual">إجازة سنوية (Annual Leave)</option>
                      <option value="Sick">إجازة مرضية (Sick Leave)</option>
                      <option value="Maternity">إجازة أمومة / طفل</option>
                      <option value="Emergency">إجازة طارئة</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500">تاريخ البدء</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-zinc-500">تاريخ الانتهاء</label>
                      <input
                        type="date"
                        required
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-zinc-950 text-white rounded-xl text-xs font-black shadow hover:opacity-95"
                  >
                    إرسال طلب الإجازة
                  </button>
                </form>
              </div>
            )}

            {selectedEmp && (
              <div className="bg-white rounded-[2rem] border border-zinc-200 p-6 space-y-4">
                <h4 className="font-bold text-zinc-900 text-sm">طلب سلفة مالية</h4>
                <form onSubmit={handleApplyAdvance} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">مبلغ السلفة المطلوب</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 font-bold text-xs"
                      value={advanceForm.amount}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, amount: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500">عدد الشهور المقترحة للتسديد</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 font-bold text-xs"
                      value={advanceForm.installments}
                      onChange={(e) => setAdvanceForm({ ...advanceForm, installments: Number(e.target.value) })}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-650 text-white bg-zinc-900 rounded-xl text-xs font-black shadow hover:bg-zinc-800"
                  >
                    تقديم السلفة
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedEmp ? (
              <div className="bg-zinc-50 rounded-[2.5rem] border border-zinc-200 p-8 space-y-6">
                <div className="flex justify-between items-center border-b pb-6">
                  <div>
                    <h3 className="text-xl font-black text-zinc-900">كشف الراتب الرسمي والمستحقات</h3>
                    <p className="text-xs text-zinc-500 font-medium">مستند إلكتروني معد بنظام حماية الأجور والآيبان المرتبط</p>
                  </div>
                  <button onClick={() => window.print()} className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border rounded-xl hover:bg-zinc-50">
                    طباعة كشف الراتب
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border">
                    <span className="text-[10px] font-bold text-zinc-400">الراتب الأساسي</span>
                    <p className="text-lg font-black text-zinc-900">{((selectedEmp.baseSalaryHalalas || 0) / 100).toLocaleString()} ر.س</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border">
                    <span className="text-[10px] font-bold text-zinc-400">بدل السكن والنقل والهاتف</span>
                    <p className="text-lg font-black text-blue-600">
                      {(((selectedEmp.housingAllowanceHalalas || 0) + (selectedEmp.transportAllowanceHalalas || 0) + (selectedEmp.phoneAllowanceHalalas || 0)) / 100).toLocaleString()} ر.س
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border p-6 space-y-4">
                  <h4 className="font-black text-zinc-900 text-xs border-b pb-2 mb-2">تفصيل كشف الدفع الحالي</h4>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">بدل طبيعة العمل</span>
                      <span className="font-bold">+{((selectedEmp.natureOfWorkAllowanceHalalas || 0) / 100).toLocaleString()} ر.س</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">تأمين اجتماعي GOSI اقتطاع (9.75%)</span>
                      <span className="font-extrabold text-rose-500">
                        -{((((selectedEmp.baseSalaryHalalas || 0) + (selectedEmp.housingAllowanceHalalas || 0)) / 100) * 0.0975).toFixed(2)} ر.س
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-semibold">خصومات الحضور والغيابات (المرتبطة بالبصمة)</span>
                      <span className="font-bold text-rose-500">
                        -{((selectedEmp.otherDeductionsHalalas || 0) / 100).toLocaleString()} ر.س
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t font-black">
                    <span className="text-zinc-900 text-sm">صافي الراتب المستحق للتحويل للبنك</span>
                    {(() => {
                      const base = (selectedEmp.baseSalaryHalalas || 0) / 100;
                      const housing = (selectedEmp.housingAllowanceHalalas || 0) / 100;
                      const transport = (selectedEmp.transportAllowanceHalalas || 0) / 100;
                      const phone = (selectedEmp.phoneAllowanceHalalas || 0) / 100;
                      const nature = (selectedEmp.natureOfWorkAllowanceHalalas || 0) / 100;
                      const deduct = (selectedEmp.otherDeductionsHalalas || 0) / 100;
                      const gosi = (base + housing) * 0.0975;
                      
                      const net = base + housing + transport + phone + nature - deduct - gosi;
                      return <span className="text-xl text-emerald-600">{Math.round(net).toLocaleString()} ر.س</span>;
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 font-bold text-zinc-400 border border-dashed rounded-[2rem]">
                يرجى إضافة أو تحديد موظف لاستعراض كشف الحساب.
              </div>
            )}
          </div>
        </div>
      )}

      {portalType === "manager" && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 space-y-6">
            <h4 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />طلبات سلف الموظفين المعلقة للحساب
            </h4>

            <div className="space-y-4">
              {advances.filter(a => a.status === "pending").map((req) => {
                const monthlyInstallment = Math.round(req.amount / req.installments);
                return (
                <div key={req.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-sm text-zinc-900">{req.employeeName}</p>
                      <p className="text-xs text-zinc-500 font-medium mt-1">يطلب سلفة قدرها {req.amount.toLocaleString()} ر.س مقسمة على {req.installments} أشهر تسديد.</p>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleActionAdvance(req.id, "approved", req)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 flex items-center gap-2 font-bold text-xs"><Check className="w-4 h-4" /> قبول الجدولة</button>
                       <button onClick={() => handleActionAdvance(req.id, "rejected", req)} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 flex items-center gap-2 font-bold text-xs"><X className="w-4 h-4" /> رفض</button>
                    </div>
                  </div>
                  <div className="bg-white border rounded-xl p-3 flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-zinc-400">جدولة الاستقطاع الشهري (Amortization Schedule)</span>
                    <span className="text-xs font-black text-rose-600">- {monthlyInstallment.toLocaleString()} ر.س تخصم من راتب الموظف في كل مسير القادم</span>
                  </div>
                </div>
              )})}

              {advances.filter(a => a.status === "pending").length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-400 font-bold border-2 border-dashed rounded-xl">لا توجد طلبات سلف جديدة حالياً.</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-zinc-200 p-8 space-y-6">
            <h4 className="text-lg font-black text-zinc-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-zinc-650" />طلبات الإجازات السنوية والمرضية المعالجة
            </h4>

            <div className="space-y-4">
              {leaves.filter(l => l.status === "pending").map((req) => (
                <div key={req.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center justify-between gap-4">
                  <div>
                    <p className="font-extrabold text-sm text-zinc-900">{req.employeeName}</p>
                    <p className="text-xs text-zinc-500 font-medium mt-1">يطلب إجازة {req.leaveType === "Annual" ? "سنوية" : "مرضية"} من تاريخ {req.startDate} إلى {req.endDate}.</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleActionLeave(req.id, "approved")} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 flex items-center gap-2 font-bold text-xs"><Check className="w-4 h-4" /> اعتماد</button>
                    <button onClick={() => handleActionLeave(req.id, "rejected")} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 flex items-center gap-2 font-bold text-xs"><X className="w-4 h-4" /> رفض</button>
                  </div>
                </div>
              ))}

              {leaves.filter(l => l.status === "pending").length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-400 font-bold border-2 border-dashed rounded-xl">لا توجد إجازات جديدة معلقة للموافقة.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
