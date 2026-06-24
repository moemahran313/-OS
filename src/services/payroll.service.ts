import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from "../lib/firebase";

export class PayrollService {
  static async simulatePayroll(userId: string, period: string) {
    const q = query(
      collection(db, "employees"),
      where("userId", "==", userId),
      where("status", "==", "active")
    );
    const employeesSnap = await getDocs(q);

    const advQuery = query(
      collection(db, "advance_requests"),
      where("userId", "==", userId),
      where("status", "==", "approved")
    );
    const advSnap = await getDocs(advQuery);
    const advances = advSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));

    const payrollEntries = employeesSnap.docs.map((docSnap) => {
      const e = docSnap.data();
      
      // Base contract salary package (Basic + Housing + Transport)
      const basePackageHalalas =
        (e.baseSalaryHalalas || 0) +
        (e.housingAllowanceHalalas || 0) +
        (e.transportAllowanceHalalas || 0);

      // Custom adjustments injected by manager
      const overtimeHalalas = e.customOvertimeHalalas || 0;
      const commissionHalalas = e.commissionHalalas || 0;

      // Dynamic Gross Salary (Base Package + Custom additions)
      const grossHalalas = basePackageHalalas + overtimeHalalas + commissionHalalas;

      // Check for advance installments for this employee
      const employeeAdvances = advances.filter(a => a.employeeId === docSnap.id);
      let advanceDeductionHalalas = 0;
      employeeAdvances.forEach(adv => {
          const advAmountHalalas = adv.amountHalalas || (adv.amount ? adv.amount * 100 : 0);
          if (adv.installments && advAmountHalalas) {
              const installmentHalalas = Math.round(advAmountHalalas / adv.installments);
              advanceDeductionHalalas += installmentHalalas;
          }
      });

      // GOSI deduction (9%) computed legally on basic + housing + transport (base contract package), NOT including variable overtime or bonuses
      const gosiDeductionHalalas = Math.round(basePackageHalalas * 0.09);

      // Total deductions (GOSI + other/custom manager deductions + advances)
      const deductionsHalalas = gosiDeductionHalalas + (e.otherDeductionsHalalas || 0) + advanceDeductionHalalas;
      const netHalalas = grossHalalas - deductionsHalalas;

      return {
        employeeId: docSnap.id,
        employeeName: e.name,
        position: e.position,
        bank: e.bank,
        gross: grossHalalas / 100,
        basic: (e.baseSalaryHalalas || 0) / 100,
        allowances: (grossHalalas - (e.baseSalaryHalalas || 0)) / 100,
        deductions: deductionsHalalas / 100,
        advanceDeductions: advanceDeductionHalalas / 100,
        netPay: netHalalas / 100,
        status: "pending_approval",
      };
    });

    return {
      id: `pr_${Date.now()}`,
      period,
      totalGross: payrollEntries.reduce((acc, p) => acc + p.basic + p.allowances, 0),
      totalNet: payrollEntries.reduce((acc, p) => acc + p.netPay, 0),
      totalDeductions: payrollEntries.reduce((acc, p) => acc + p.deductions, 0),
      status: "simulated",
      entries: payrollEntries,
    };
  }

  static async generateMudadSIF(userId: string, runId: string) {
    const runRef = doc(db, "payroll_runs", runId);
    const runDoc = await getDoc(runRef);
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    await updateDoc(runRef, {
      mudadSifGenerated: true
    });

    let csvData = '\uFEFF'; 
    csvData += `رقم هوية الموظف,اسم الموظف,الايبان,الراتب الاساسي,بدل السكن,بدلات اخرى,الخصومات,الراتب الصافي\n`;
    
    for (const e of run.entries) {
      const empDoc = await getDoc(doc(db, "employees", e.employeeId));
      const emp = empDoc.data() || {};
      
      const empIdNumber = emp.idNumber || emp.employeeId || e.employeeId || ""; 
      const name = e.employeeName || emp.name || "";
      const iban = emp.iban || "";
      const basic = e.basic || 0;
      const housing = (emp.housingAllowanceHalalas || 0) / 100;
      const otherAllowances = (e.allowances || 0) - housing;
      const deductions = e.deductions || 0;
      const netPay = e.netPay || 0;

      csvData += `"${empIdNumber}","${name}","${iban}",${basic},${housing},${otherAllowances > 0 ? otherAllowances : 0},${deductions},${netPay}\n`;
    }

    return {
      data: csvData,
      period: run.period
    };
  }

  static async batchGenerateMudadSIF(userId: string, period: string) {
    const q = query(
      collection(db, "payroll_runs"),
      where("userId", "==", userId),
      where("period", "==", period)
    );
    const snap = await getDocs(q);
    
    if (snap.empty) {
      throw new Error("No payroll runs found for this period");
    }

    let csvData = '\uFEFF'; 
    csvData += `رقم هوية الموظف,اسم الموظف,الايبان,الراتب الاساسي,بدل السكن,بدلات اخرى,الخصومات,الراتب الصافي\n`;

    for (const d of snap.docs) {
      // Mark run as having the SIF generated
      await updateDoc(doc(db, "payroll_runs", d.id), {
        mudadSifGenerated: true
      });

      const run = d.data();
      for (const e of run.entries) {
        const empDoc = await getDoc(doc(db, "employees", e.employeeId));
        const emp = empDoc.data() || {};
        
        const empIdNumber = emp.idNumber || emp.employeeId || e.employeeId || ""; 
        const name = e.employeeName || emp.name || "";
        const iban = emp.iban || "";
        const basic = e.basic || 0;
        const housing = (emp.housingAllowanceHalalas || 0) / 100;
        const otherAllowances = (e.allowances || 0) - housing;
        const deductions = e.deductions || 0;
        const netPay = e.netPay || 0;

        csvData += `"${empIdNumber}","${name}","${iban}",${basic},${housing},${otherAllowances > 0 ? otherAllowances : 0},${deductions},${netPay}\n`;
      }
    }

    return {
      data: csvData,
      period
    };
  }

  static async generateWPS(userId: string, runId: string) {
    const runDoc = await getDoc(doc(db, "payroll_runs", runId));
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    let wpsData = `EDB,1234567890,CompanyBankID,CompanyAccount,${run.period}\n`;
    for (const e of run.entries) {
      const empDoc = await getDoc(doc(db, "employees", e.employeeId));
      const emp = empDoc.data();
      wpsData += `EMP,${e.employeeId},${emp?.bank || ""},${emp?.iban || ""},${run.period},${e.basic},${e.allowances},${e.deductions},${e.netPay},G\n`;
    }

    return {
      data: wpsData,
      period: run.period
    };
  }

  static async generateReport(userId: string, runId: string) {
    const runDoc = await getDoc(doc(db, "payroll_runs", runId));
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    let csvData = '\uFEFF' + `اسم الموظف,البنك,الراتب الأساسي,البدلات,الخصومات,الصافي\n`;
    run.entries.forEach((e: any) => {
      csvData += `${e.employeeName || ""},${e.bank || ""},${e.basic},${e.allowances},${e.deductions},${e.netPay}\n`;
    });

    return {
      data: csvData,
      period: run.period
    };
  }
}
