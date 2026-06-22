import React, { useState } from "react";
import { Clock, Check, RefreshCw, Sparkles, Building, Play, UserCheck, Calculator } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { toast } from "sonner";

interface PayrollAttendanceSimProps {
  employees: any[];
}

export default function PayrollAttendanceSim({ employees }: PayrollAttendanceSimProps) {
  const [attData, setAttData] = useState<Record<string, {
    lateMinutes: number;
    absenceDays: number;
    overtimeHours: number;
    commissionAmount: number;
  }>>({});

  const [saving, setSaving] = useState(false);

  const activeEmployees = employees.filter(e => e.status === "active" || e.status === "نشط");

  const getEmpData = (empId: string) => {
    return attData[empId] || {
      lateMinutes: 0,
      absenceDays: 0,
      overtimeHours: 0,
      commissionAmount: 0
    };
  };

  const updateEmpAtt = (empId: string, field: string, value: number) => {
    setAttData(prev => ({
      ...prev,
      [empId]: {
        ...getEmpData(empId),
        [field]: value
      }
    }));
  };

  const calculateDeductionsAndBonuses = (emp: any) => {
    const data = getEmpData(emp.id);
    const basic = (emp.baseSalaryHalalas || 0) / 100;
    
    // Regular daily wage = basic / 30 days
    const dailyWage = basic / 30;
    // Regular hourly wage = baseSalary / 30 days / 8 hours
    const hourlyWage = basic > 0 ? (basic / 30 / 8) : 0;

    // 1. Absence Deduction = absence days * daily wage
    const absenceCost = data.absenceDays * dailyWage;

    // 2. Late/Delay Deduction = (late minutes / 60) * hourly wage
    const delayCost = (data.lateMinutes / 60) * hourlyWage;

    // Total Deductions
    const totalDeductions = absenceCost + delayCost;

    // 3. Overtime Pay: Saudi Labor Law requires 1.5x of hourly wage
    const overtimePay = data.overtimeHours * hourlyWage * 1.5;

    // 4. Bonus/Rewards = Overtime + Commission
    const totalAdditions = overtimePay + data.commissionAmount;

    return {
      absenceCost,
      delayCost,
      totalDeductions,
      overtimePay,
      totalAdditions
    };
  };

  const handleSimulateCheckIn = () => {
    // Produce mock check-in logs for active employees
    const simulated: typeof attData = {};
    activeEmployees.forEach(emp => {
      // Create interesting deterministic logs
      const seed = emp.name.charCodeAt(0) || 12;
      simulated[emp.id] = {
        lateMinutes: seed % 5 === 0 ? 45 : (seed % 7 === 0 ? 90 : 0),
        absenceDays: seed % 9 === 0 ? 1 : 0,
        overtimeHours: seed % 4 === 0 ? 4 : (seed % 6 === 0 ? 8 : 0),
        commissionAmount: seed % 8 === 0 ? 400 : 0
      };
    });
    setAttData(simulated);
    toast.info("تمت محاكاة بصمات الحضور والانصراف للأجهزة الذكية لشهر الحالي بشكل تلقائي!");
  };

  const handleInjectIntoPayroll = async () => {
    if (activeEmployees.length === 0) return;
    setSaving(true);

    try {
      for (const emp of activeEmployees) {
        const calcs = calculateDeductionsAndBonuses(emp);
        const empRef = doc(db, "employees", emp.id);

        // Convert deductions and bonuses to Halalas:
        const otherDeductionsHalalas = Math.round(calcs.totalDeductions * 100);
        
        // Add additions to the employee's existing configuration context or a custom bonuses field
        await updateDoc(empRef, {
          otherDeductionsHalalas,
          // Overwrite/store custom calculated variables
          customAttDeductionsHalalas: otherDeductionsHalalas,
          customOvertimeHalalas: Math.round(calcs.overtimePay * 100),
          commissionHalalas: Math.round(getEmpData(emp.id).commissionAmount * 100),
          attendanceSyncedAt: new Date().toISOString()
        });
      }

      toast.success("تم حقن تفاصيل الغياب والتأخر والعمل الإضافي بنجاح في ملفات الموظفين! سيتم تطبيقها تلقائياً بالمسير القادم.");
    } catch (e: any) {
      console.error(e);
      toast.error("فشل حقن البيانات: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
        <div>
          <h3 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-indigo-600" />
            تكامل الحضور والانصراف والعمل الإضافي
          </h3>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            ربط آلي مع أجهزة البصمة والتحكم بالخصومات والعمل الإضافي (1.5x) والعمولات.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSimulateCheckIn}
            className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100"
          >
            محاكاة وبصمة ذكية
          </button>
          <button
            onClick={handleInjectIntoPayroll}
            disabled={saving || activeEmployees.length === 0}
            className="px-5 py-2.5 text-xs font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            حقن وتحديث الموثق بمسير الرواتب
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase">
              <th className="pb-3 text-right">الموظف والوظيفة</th>
              <th className="pb-3 text-center">الغياب (أيام)</th>
              <th className="pb-3 text-center">التأخر (دقائق)</th>
              <th className="pb-3 text-center">الإضافي (ساعات)</th>
              <th className="pb-3 text-center">العمولة (ر.س)</th>
              <th className="pb-3 text-center">خصومات التأخير</th>
              <th className="pb-3 text-center">أجر العمل الإضافي (1.5x)</th>
              <th className="pb-3 text-left">التأثير الإجمالي</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {activeEmployees.map((emp) => {
              const data = getEmpData(emp.id);
              const calcs = calculateDeductionsAndBonuses(emp);
              
              return (
                <tr key={emp.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-4">
                    <div className="font-bold text-zinc-900">{emp.name}</div>
                    <div className="text-[10px] text-zinc-400 font-medium italic mt-0.5">{emp.position} • {emp.department}</div>
                  </td>
                  <td className="py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-16 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1 py-1.5 font-bold"
                      value={data.absenceDays}
                      onChange={(e) => updateEmpAtt(emp.id, "absenceDays", Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-16 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1 py-1.5 font-bold"
                      value={data.lateMinutes}
                      onChange={(e) => updateEmpAtt(emp.id, "lateMinutes", Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-16 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1 py-1.5 font-bold"
                      value={data.overtimeHours}
                      onChange={(e) => updateEmpAtt(emp.id, "overtimeHours", Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td className="py-4 text-center">
                    <input
                      type="number"
                      min="0"
                      className="w-20 bg-zinc-50 border border-zinc-200 rounded-lg text-center p-1 py-1.5 font-bold"
                      value={data.commissionAmount}
                      onChange={(e) => updateEmpAtt(emp.id, "commissionAmount", Math.max(0, Number(e.target.value)))}
                    />
                  </td>
                  <td className="py-4 text-center font-bold text-rose-500">
                    -{Math.round(calcs.totalDeductions).toLocaleString()} ر.س
                  </td>
                  <td className="py-4 text-center font-bold text-emerald-600">
                    +{Math.round(calcs.overtimePay).toLocaleString()} ر.س
                  </td>
                  <td className="py-4 text-left font-black">
                    {(() => {
                      const netImpact = calcs.totalAdditions - calcs.totalDeductions;
                      if (netImpact >= 0) {
                        return <span className="text-emerald-600">+{Math.round(netImpact).toLocaleString()} ر.س</span>;
                      } else {
                        return <span className="text-rose-500">{Math.round(netImpact).toLocaleString()} ر.س</span>;
                      }
                    })()}
                  </td>
                </tr>
              );
            })}
            {activeEmployees.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center font-bold text-zinc-400">
                  لا يوجد موظفون نشطون لإدراج تفاصيل الحضور.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
