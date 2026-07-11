import { db } from "./firebase.ts";

export class PayrollService {
  static async simulatePayroll(userId: string, period: string) {
    const employeesSnap = await db
      .collection("employees")
      .where("userId", "==", userId)
      .where("status", "==", "active")
      .get();

    const payrollEntries = employeesSnap.docs.map((doc) => {
      const e = doc.data();
      const grossHalalas =
        (e.baseSalaryHalalas || 0) +
        (e.housingAllowanceHalalas || 0) +
        (e.transportAllowanceHalalas || 0);
      const deductionsHalalas = Math.round(grossHalalas * 0.09) + (e.otherDeductionsHalalas || 0);
      const netHalalas = grossHalalas - deductionsHalalas;

      return {
        employeeId: doc.id,
        employeeName: e.name,
        position: e.position,
        bank: e.bank,
        basic: (e.baseSalaryHalalas || 0) / 100,
        allowances: (grossHalalas - (e.baseSalaryHalalas || 0)) / 100,
        deductions: deductionsHalalas / 100,
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
      wpsData += `EMP,${e.employeeId},${emp?.bank || ""},${emp?.iban || ""},${run.period},${e.basic},${e.allowances},${e.deductions},${e.netPay},G\n`;
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

    let csvData = "\uFEFF" + `اسم الموظف,البنك,الراتب الأساسي,البدلات,الخصومات,الصافي\n`;
    run.entries.forEach((e: any) => {
      csvData += `${e.employeeName || ""},${e.bank || ""},${e.basic},${e.allowances},${e.deductions},${e.netPay}\n`;
    });

    return {
      data: csvData,
      period: run.period,
    };
  }
}
