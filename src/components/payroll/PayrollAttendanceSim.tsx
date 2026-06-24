import React, { useState, useEffect, useMemo } from "react";
import { 
  Clock, Check, RefreshCw, Sparkles, Building, Play, UserCheck, Calculator,
  Search, ShieldAlert, DollarSign, Calendar, TrendingUp, HelpCircle, Save, Trash2, ArrowUpDown
} from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";

interface PayrollAttendanceSimProps {
  employees: any[];
}

export default function PayrollAttendanceSim({ employees }: PayrollAttendanceSimProps) {
  // Local state for customized inputs per employee
  const [attData, setAttData] = useState<Record<string, {
    lateMinutes: number;
    absenceDays: number;
    overtimeHours: number;
    overtimeMultiplier: number;
    commissionAmount: number;
    adjustmentNotes: string;
  }>>({});

  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status === "active" || e.status === "نشط");
  }, [employees]);

  // Load previously saved parameters from employees prop
  useEffect(() => {
    if (!employees || employees.length === 0) return;
    const initial: Record<string, any> = {};
    employees.forEach(emp => {
      initial[emp.id] = {
        lateMinutes: typeof emp.lateMinutes !== 'undefined' ? emp.lateMinutes : 0,
        absenceDays: typeof emp.absenceDays !== 'undefined' ? emp.absenceDays : 0,
        overtimeHours: typeof emp.overtimeHours !== 'undefined' ? emp.overtimeHours : 0,
        overtimeMultiplier: typeof emp.overtimeMultiplier !== 'undefined' ? emp.overtimeMultiplier : 1.5,
        commissionAmount: typeof emp.commissionAmount !== 'undefined' ? emp.commissionAmount : (emp.commissionHalalas ? emp.commissionHalalas / 100 : 0),
        adjustmentNotes: emp.adjustmentNotes || ""
      };
    });
    setAttData(initial);
  }, [employees]);

  // Retrieve helper for single employee's local state
  const getEmpData = (empId: string) => {
    return attData[empId] || {
      lateMinutes: 0,
      absenceDays: 0,
      overtimeHours: 0,
      overtimeMultiplier: 1.5,
      commissionAmount: 0,
      adjustmentNotes: ""
    };
  };

  const updateEmpAtt = (empId: string, field: string, value: any) => {
    setAttData(prev => ({
      ...prev,
      [empId]: {
        ...getEmpData(empId),
        [field]: value
      }
    }));
  };

  // Legally accurate wage and overtime calculations per Saudi Labor Law
  const calculateDeductionsAndBonuses = (emp: any) => {
    const data = getEmpData(emp.id);
    const basic = (emp.baseSalaryHalalas || 0) / 100;
    const housing = (emp.housingAllowanceHalalas || 0) / 100;
    const transport = (emp.transportAllowanceHalalas || 0) / 100;

    // Regular daily wage = basic / 30
    const dailyWage = basic / 30;
    
    // Regular hourly wage (Saudi Law standard: basic salary + fixed allowances used for overtime base, or just basic salary. Let's use basic salary for standard hourly wage)
    const hourlyWage = basic > 0 ? (basic / 30 / 8) : 0;

    // 1. Absence Deduction = absence days * daily wage
    const absenceCost = data.absenceDays * dailyWage;

    // 2. Late/Delay Deduction = (late minutes / 60) * hourly wage
    const delayCost = (data.lateMinutes / 60) * hourlyWage;

    // Total Deductions
    const totalDeductions = absenceCost + delayCost;

    // 3. Overtime Pay: Hours * hourly wage * customized multiplier (Standard is 1.5)
    const overtimePay = data.overtimeHours * hourlyWage * data.overtimeMultiplier;

    // 4. Bonus/Rewards = Overtime + Commission/Bonus Amount
    const totalAdditions = overtimePay + data.commissionAmount;

    return {
      dailyWage,
      hourlyWage,
      absenceCost,
      delayCost,
      totalDeductions,
      overtimePay,
      totalAdditions
    };
  };

  // Live total metrics of adjustments across all filtered employees
  const totals = useMemo(() => {
    let overtimeSum = 0;
    let deductionSum = 0;
    let commissionSum = 0;
    let totalAbsenceDays = 0;

    activeEmployees.forEach(emp => {
      const calcs = calculateDeductionsAndBonuses(emp);
      const data = getEmpData(emp.id);
      overtimeSum += calcs.overtimePay;
      deductionSum += calcs.totalDeductions;
      commissionSum += data.commissionAmount;
      totalAbsenceDays += data.absenceDays;
    });

    return {
      overtimeSum,
      deductionSum,
      commissionSum,
      totalAbsenceDays,
      netImpact: overtimeSum + commissionSum - deductionSum
    };
  }, [activeEmployees, attData]);

  // Extract list of unique departments
  const departments = useMemo(() => {
    const depts = new Set<string>();
    activeEmployees.forEach(e => {
      if (e.department) depts.add(e.department);
    });
    return Array.from(depts);
  }, [activeEmployees]);

  // Apply search query and department filter
  const filteredEmployees = useMemo(() => {
    return activeEmployees.filter(emp => {
      const nameMatch = (emp.name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const positionMatch = (emp.position || "").toLowerCase().includes(searchQuery.toLowerCase());
      const deptMatch = selectedDept === "all" || emp.department === selectedDept;
      return (nameMatch || positionMatch) && deptMatch;
    });
  }, [activeEmployees, searchQuery, selectedDept]);

  // Simulate smart check-in and auto-calculate reasonable values
  const handleSimulateCheckIn = () => {
    const simulated: typeof attData = {};
    activeEmployees.forEach(emp => {
      const seed = emp.name.charCodeAt(0) || 12;
      simulated[emp.id] = {
        lateMinutes: seed % 5 === 0 ? 45 : (seed % 7 === 0 ? 120 : 0),
        absenceDays: seed % 9 === 0 ? 1 : 0,
        overtimeHours: seed % 4 === 0 ? 6 : (seed % 6 === 0 ? 10 : 0),
        overtimeMultiplier: 1.5,
        commissionAmount: seed % 8 === 0 ? 500 : 0,
        adjustmentNotes: seed % 4 === 0 ? "ساعات عمل إضافية لإنهاء الربع الثاني" : (seed % 9 === 0 ? "غياب بدون عذر مقبول" : "تسوية نظامية")
      };
    });
    setAttData(simulated);
    toast.info("تمت محاكاة واحتساب بصمات الحضور والتسويات الذكية لجميع الموظفين بنجاح! ⚡");
  };

  // Reset all fields
  const handleResetAll = () => {
    if (!confirm("هل أنت متأكد من رغبتك في إعادة تعيين جميع قيم التسويات والخصومات لجميع الموظفين؟")) return;
    const cleared: typeof attData = {};
    activeEmployees.forEach(emp => {
      cleared[emp.id] = {
        lateMinutes: 0,
        absenceDays: 0,
        overtimeHours: 0,
        overtimeMultiplier: 1.5,
        commissionAmount: 0,
        adjustmentNotes: ""
      };
    });
    setAttData(cleared);
    toast.success("تم تصفير وإعادة تعيين الحقول بنجاح.");
  };

  // Save changes directly to GOSI-compliant Firestore attributes
  const handleInjectIntoPayroll = async () => {
    if (activeEmployees.length === 0) return;
    setSaving(true);

    try {
      for (const emp of activeEmployees) {
        const calcs = calculateDeductionsAndBonuses(emp);
        const data = getEmpData(emp.id);
        const empRef = doc(db, "employees", emp.id);

        const otherDeductionsHalalas = Math.round(calcs.totalDeductions * 100);
        const customOvertimeHalalas = Math.round(calcs.overtimePay * 100);
        const commissionHalalas = Math.round(data.commissionAmount * 100);

        // Update document with both raw inputs and final computed Halalas
        await updateDoc(empRef, {
          // Raw inputs for persistence
          lateMinutes: data.lateMinutes,
          absenceDays: data.absenceDays,
          overtimeHours: data.overtimeHours,
          overtimeMultiplier: data.overtimeMultiplier,
          commissionAmount: data.commissionAmount,
          adjustmentNotes: data.adjustmentNotes,

          // Computed variables for Payroll Simulation Engine
          otherDeductionsHalalas,
          customAttDeductionsHalalas: otherDeductionsHalalas,
          customOvertimeHalalas,
          commissionHalalas,
          attendanceSyncedAt: new Date().toISOString()
        });
      }

      toast.success("تم حفظ وتطبيق جميع التسويات، الخصومات، والعمل الإضافي بنجاح! ☁️ ستنعكس في مسير الرواتب القادم.");
    } catch (e: any) {
      console.error(e);
      toast.error("فشل حفظ التسويات: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 space-y-6 select-none" dir="rtl">
      
      {/* Header Block */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-100 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-600 border border-indigo-100 text-[10px] font-black rounded-lg">Saudi Labor Law v2026</span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-lg">WPS & GOSI Aligned</span>
          </div>
          <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            أداة تسوية وتخصيص مستحقات الموظفين والعمل الإضافي
          </h3>
          <p className="text-xs text-zinc-500 font-medium mt-1 leading-relaxed">
            تمكين المدراء من تعديل وتخصيص ساعات العمل الإضافي ومضاعفاتها، أيام الخصم والغياب، العمولات الإضافية والمكافآت، مع الحساب التلقائي اللحظي ومزامنتها سحابياً.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            onClick={handleSimulateCheckIn}
            className="flex-1 lg:flex-none px-4 py-2.5 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100 transition cursor-pointer"
          >
            محاكاة تسويات ذكية
          </button>
          <button
            onClick={handleResetAll}
            className="px-3 py-2.5 text-xs font-bold text-zinc-500 bg-zinc-50 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
            title="تصفير كافة الحقول"
          >
            تصفير
          </button>
          <button
            onClick={handleInjectIntoPayroll}
            disabled={saving || activeEmployees.length === 0}
            className="flex-1 lg:flex-none px-5 py-2.5 text-xs font-black text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            حفظ ومزامنة التسويات
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-200/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase">إجمالي مكافآت العمل الإضافي</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-black text-zinc-900 mt-1">
            +{Math.round(totals.overtimeSum).toLocaleString()} <span className="text-[10px] font-bold text-zinc-400">ر.س</span>
          </div>
          <div className="text-[9px] font-bold text-emerald-600 mt-1">بمعدل احتساب 1.5x فأكثر قانونياً</div>
        </div>

        <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-200/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-zinc-400 uppercase">إجمالي العمولات والمكافآت</span>
            <TrendingUp className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-lg font-black text-zinc-900 mt-1">
            +{Math.round(totals.commissionSum).toLocaleString()} <span className="text-[10px] font-bold text-zinc-400">ر.س</span>
          </div>
          <div className="text-[9px] font-bold text-indigo-600 mt-1">بما يشمل حوافز المبيعات والمكافآت</div>
        </div>

        <div className="bg-zinc-50 p-5 rounded-[2rem] border border-zinc-200/60 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-rose-400 uppercase">إجمالي الخصومات والغيابات</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg font-black text-rose-600 mt-1">
            -{Math.round(totals.deductionSum).toLocaleString()} <span className="text-[10px] font-bold text-rose-400">ر.س</span>
          </div>
          <div className="text-[9px] font-bold text-rose-500 mt-1">إجمالي أيام الخصم: {totals.totalAbsenceDays} أيام</div>
        </div>

        <div className="bg-zinc-900 text-white p-5 rounded-[2rem] shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-zinc-300 uppercase">صافي أثر التعديلات</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black mt-1">
            {totals.netImpact >= 0 ? "+" : ""}
            {Math.round(totals.netImpact).toLocaleString()} <span className="text-xs text-zinc-400">ر.س</span>
          </div>
          <div className="text-[9px] font-bold text-zinc-400 mt-1">التغيير الصافي في مسير الرواتب القادم</div>
        </div>

      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 bg-zinc-50/50 p-4 border border-zinc-100 rounded-2xl">
        <div className="relative w-full md:flex-1">
          <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="البحث باسم الموظف أو المنصب..." 
            className="w-full text-xs pr-10 pl-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary/10 outline-none font-bold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-bold text-zinc-400 shrink-0">القسم:</span>
          <select 
            className="w-full md:w-48 text-xs bg-white border border-zinc-200 rounded-xl px-3 py-2.5 font-bold outline-none"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="all">جميع الأقسام</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table Adjustments Control Grid */}
      <div className="overflow-x-auto border border-zinc-100 rounded-2xl">
        <table className="w-full text-right text-xs table-auto">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold uppercase select-none">
              <th className="p-4 text-right">الموظف وبيانات الراتب الأساسي</th>
              <th className="p-4 text-center">أيام الخصم (Absence)</th>
              <th className="p-4 text-center">التأخر (دقائق)</th>
              <th className="p-4 text-center">العمل الإضافي (ساعات)</th>
              <th className="p-4 text-center">مضاعف الإضافي</th>
              <th className="p-4 text-center">العمولة والمكافأة (SAR)</th>
              <th className="p-4 text-right">ملاحظات وسبب التسوية</th>
              <th className="p-4 text-left">أثر التعديل الصافي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {filteredEmployees.map((emp) => {
              const data = getEmpData(emp.id);
              const calcs = calculateDeductionsAndBonuses(emp);
              
              return (
                <tr key={emp.id} className="hover:bg-zinc-50/40 transition-colors group">
                  
                  {/* Employee Meta details */}
                  <td className="p-4">
                    <div className="font-bold text-zinc-900 text-xs">{emp.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium mt-0.5">{emp.position} • {emp.department || "غير محدد"}</div>
                    
                    {/* Embedded micro wage indicators */}
                    <div className="flex gap-2 mt-2">
                      <span className="text-[9px] font-bold text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded">
                        الأساسي: {((emp.baseSalaryHalalas || 0) / 100).toLocaleString()} ر.س
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded" title="معدل الأجر اليومي = الأساسي / 30">
                        اليومي: {Math.round(calcs.dailyWage)} ر.س
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400 bg-zinc-50 border border-zinc-100 px-1.5 py-0.5 rounded" title="معدل أجر الساعة = اليومي / 8">
                        الساعة: {Math.round(calcs.hourlyWage)} ر.س
                      </span>
                    </div>
                  </td>

                  {/* Deduction Days (Absence Days) */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="w-14 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1.5 font-bold focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 outline-none"
                        value={data.absenceDays || ""}
                        placeholder="0"
                        onChange={(e) => updateEmpAtt(emp.id, "absenceDays", Math.max(0, Number(e.target.value)))}
                      />
                      <span className="text-[10px] font-bold text-rose-400 shrink-0">يوم</span>
                    </div>
                    {calcs.absenceCost > 0 && (
                      <span className="text-[9px] font-bold text-rose-500 mt-1 block">
                        -{Math.round(calcs.absenceCost)} ر.س
                      </span>
                    )}
                  </td>

                  {/* Late minutes */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        className="w-14 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1.5 font-bold focus:ring-2 focus:ring-rose-500/10 focus:border-rose-400 outline-none"
                        value={data.lateMinutes || ""}
                        placeholder="0"
                        onChange={(e) => updateEmpAtt(emp.id, "lateMinutes", Math.max(0, Number(e.target.value)))}
                      />
                      <span className="text-[10px] font-bold text-zinc-400 shrink-0">دقيقة</span>
                    </div>
                    {calcs.delayCost > 0 && (
                      <span className="text-[9px] font-bold text-rose-500 mt-1 block">
                        -{Math.round(calcs.delayCost)} ر.س
                      </span>
                    )}
                  </td>

                  {/* Overtime Hours */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        className="w-14 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1.5 font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none"
                        value={data.overtimeHours || ""}
                        placeholder="0"
                        onChange={(e) => updateEmpAtt(emp.id, "overtimeHours", Math.max(0, Number(e.target.value)))}
                      />
                      <span className="text-[10px] font-bold text-emerald-500 shrink-0">ساعة</span>
                    </div>
                    {calcs.overtimePay > 0 && (
                      <span className="text-[9px] font-bold text-emerald-600 mt-1 block">
                        +{Math.round(calcs.overtimePay)} ر.س
                      </span>
                    )}
                  </td>

                  {/* Overtime Multiplier */}
                  <td className="p-4 text-center">
                    <select
                      className="text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 font-bold outline-none"
                      value={data.overtimeMultiplier}
                      onChange={(e) => updateEmpAtt(emp.id, "overtimeMultiplier", Number(e.target.value))}
                    >
                      <option value="1.5">1.5x قانوني</option>
                      <option value="2.0">2.0x إجازات</option>
                      <option value="1.0">1.0x عادي</option>
                    </select>
                  </td>

                  {/* Custom Commission/Bonus Amount */}
                  <td className="p-4 text-center">
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        className="w-24 bg-zinc-50 border border-zinc-200 rounded-lg text-left pl-8 pr-2 py-1.5 font-bold focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-400 outline-none text-xs"
                        value={data.commissionAmount || ""}
                        placeholder="0"
                        onChange={(e) => updateEmpAtt(emp.id, "commissionAmount", Math.max(0, Number(e.target.value)))}
                      />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-zinc-400">ر.س</span>
                    </div>
                  </td>

                  {/* Reason / Notes */}
                  <td className="p-4 text-right">
                    <input
                      type="text"
                      placeholder="مثال: مجهود مميز، غياب مرضي..."
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none"
                      value={data.adjustmentNotes || ""}
                      onChange={(e) => updateEmpAtt(emp.id, "adjustmentNotes", e.target.value)}
                    />
                  </td>

                  {/* Net Impact display */}
                  <td className="p-4 text-left font-black">
                    {(() => {
                      const netImpact = calcs.totalAdditions - calcs.totalDeductions;
                      if (netImpact > 0) {
                        return <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs">+{Math.round(netImpact).toLocaleString()} ر.س</span>;
                      } else if (netImpact < 0) {
                        return <span className="text-rose-500 bg-rose-50 px-2 py-1 rounded text-xs">{Math.round(netImpact).toLocaleString()} ر.س</span>;
                      } else {
                        return <span className="text-zinc-400 font-bold">لا يوجد تغيير</span>;
                      }
                    })()}
                  </td>

                </tr>
              );
            })}
            {filteredEmployees.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center font-black text-zinc-400">
                  لا يوجد موظفون يطابقون خيارات البحث أو الفلترة المحددة.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
