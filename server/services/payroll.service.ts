import { db } from "./firebase.ts";

export class PayrollService {
  static async simulatePayroll(userId: string, period: string) {
    const employeesSnap = await db
      .collection("employees")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();

    const advSnap = await db
      .collection("advance_requests")
      .where("userId", "==", userId)
      .where("status", "==", "approved")
      .get();
    
    const advances = advSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

    const payrollEntries = employeesSnap.docs.map((docSnap) => {
      const e = docSnap.data();

      // Base contract salary package (Basic + Housing + Transport)
      const basicHalalas = e.baseSalaryHalalas || 0;
      const housingHalalas = e.housingAllowanceHalalas || 0;
      const transportHalalas = e.transportAllowanceHalalas || 0;
      const basePackageHalalas = basicHalalas + housingHalalas + transportHalalas;

      // Custom adjustments
      const overtimeHalalas = e.customOvertimeHalalas || 0;
      const commissionHalalas = e.commissionHalalas || 0;

      // Gross Salary
      const grossHalalas = basePackageHalalas + overtimeHalalas + commissionHalalas;

      // Advance requests deduction
      const employeeAdvances = advances.filter((a: any) => a.employeeId === docSnap.id);
      let advanceDeductionHalalas = 0;
      employeeAdvances.forEach((adv: any) => {
        const advAmountHalalas = adv.amountHalalas || (adv.amount ? adv.amount * 100 : 0);
        if (adv.installments && advAmountHalalas) {
          const installmentHalalas = Math.round(advAmountHalalas / adv.installments);
          advanceDeductionHalalas += installmentHalalas;
        }
      });

      // Nationality check for GOSI (Saudi vs Non-Saudi)
      const isSaudi =
        !e.nationality ||
        e.nationality.toString().toLowerCase().includes("saud") ||
        e.nationality.toString().includes("سعودي");

      // GOSI Base is Basic + Housing
      const gosiBaseHalalas = basicHalalas + housingHalalas;

      // Legally Mandated GOSI rates: 9.75% for Saudi employee, 12.00% for Saudi employer. 2% for non-Saudis
      const gosiRate = isSaudi ? 0.0975 : 0.0;
      const gosiDeductionHalalas = Math.round(gosiBaseHalalas * gosiRate);

      const gosiEmployerRate = isSaudi ? 0.1200 : 0.0200; // 12% for Saudi employer, 2% hazard rate for expat
      const gosiEmployerShareHalalas = Math.round(gosiBaseHalalas * gosiEmployerRate);

      // Absence deduction calculated as (Basic Salary / 30) * absenceDays
      const absenceDays = Number(e.absenceDays || 0);
      const absenceDeductionHalalas = Math.round((basicHalalas / 30) * absenceDays);

      // Total deductions
      const deductionsHalalas =
        gosiDeductionHalalas +
        absenceDeductionHalalas +
        (e.otherDeductionsHalalas || 0) +
        advanceDeductionHalalas;

      const netHalalas = grossHalalas - deductionsHalalas;

      return {
        employeeId: docSnap.id,
        employeeName: e.name,
        position: e.position,
        bank: e.bank,
        gross: grossHalalas / 100,
        basic: basicHalalas / 100,
        housing: housingHalalas / 100,
        transport: transportHalalas / 100,
        allowances: (grossHalalas - basicHalalas) / 100,
        gosiDeduction: gosiDeductionHalalas / 100,
        gosiEmployerShare: gosiEmployerShareHalalas / 100,
        gosiTotalContribution: (gosiDeductionHalalas + gosiEmployerShareHalalas) / 100,
        absenceDeduction: absenceDeductionHalalas / 100,
        otherDeductions: (e.otherDeductionsHalalas || 0) / 100,
        advanceDeductions: advanceDeductionHalalas / 100,
        netPay: netHalalas / 100,
        deductions: deductionsHalalas / 100,
        status: "pending_approval",
        nationality: isSaudi ? "سعودي" : "غير سعودي",
        absenceDays: absenceDays,
      };
    });

    const totalGosi = payrollEntries.reduce((acc, p) => acc + (p.gosiDeduction || 0), 0);
    const totalGosiEmployer = payrollEntries.reduce((acc, p) => acc + (p.gosiEmployerShare || 0), 0);
    const totalGosiCombined = totalGosi + totalGosiEmployer;
    const totalAbsence = payrollEntries.reduce((acc, p) => acc + (p.absenceDeduction || 0), 0);
    const totalOtherDeductions = payrollEntries.reduce((acc, p) => acc + (p.otherDeductions || 0), 0);
    const totalAdvanceDeductions = payrollEntries.reduce((acc, p) => acc + (p.advanceDeductions || 0), 0);

    return {
      id: `pr_${Date.now()}`,
      period,
      totalGross: payrollEntries.reduce((acc, p) => acc + p.basic + p.allowances, 0),
      totalNet: payrollEntries.reduce((acc, p) => acc + p.netPay, 0),
      totalDeductions: payrollEntries.reduce((acc, p) => acc + p.deductions, 0),
      totalGosi,
      totalGosiEmployer,
      totalGosiCombined,
      totalAbsence,
      totalOtherDeductions,
      totalAdvanceDeductions,
      status: "simulated",
      entries: payrollEntries,
    };
  }

  static async generateWPS(userId: string, runId: string) {
    const runDoc = await db.collection("payroll_runs").doc(runId).get();
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    let wpsData = `EDB,1234567890,CompanyBankID,CompanyAccount,${run.period}\n`;
    for (const e of run.entries) {
      const empDoc = await db.collection("employees").doc(e.employeeId).get();
      const emp = empDoc.data();
      wpsData += `EMP,${e.employeeId},${emp?.bank || ""},${emp?.iban || ""},${run.period},${e.basic.toFixed(2)},${e.allowances.toFixed(2)},${e.deductions.toFixed(2)},${e.netPay.toFixed(2)},G\n`;
    }

    return {
      data: wpsData,
      period: run.period,
    };
  }

  static async generateReport(userId: string, runId: string) {
    const runDoc = await db.collection("payroll_runs").doc(runId).get();
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    let csvData = "\uFEFF" + `اسم الموظف,البنك,الراتب الأساسي,البدلات,التأمينات الاجتماعية GOSI,الخصومات الأخرى,الصافي\n`;
    run.entries.forEach((e: any) => {
      csvData += `${e.employeeName || ""},${e.bank || ""},${e.basic.toFixed(2)},${e.allowances.toFixed(2)},${(e.gosiDeduction || 0).toFixed(2)},${(e.deductions - (e.gosiDeduction || 0)).toFixed(2)},${e.netPay.toFixed(2)}\n`;
    });

    return {
      data: csvData,
      period: run.period,
    };
  }
}
