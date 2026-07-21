import { collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
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
    const advances = advSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as any);

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
      const employeeAdvances = advances.filter((a) => a.employeeId === docSnap.id);
      let advanceDeductionHalalas = 0;
      employeeAdvances.forEach((adv) => {
        const advAmountHalalas = adv.amountHalalas || (adv.amount ? adv.amount * 100 : 0);
        if (adv.installments && advAmountHalalas) {
          const installmentHalalas = Math.round(advAmountHalalas / adv.installments);
          advanceDeductionHalalas += installmentHalalas;
        }
      });

      // Nationality check for GOSI calculation
      const isSaudi =
        !e.nationality ||
        e.nationality.toString().toLowerCase().includes("saud") ||
        e.nationality.toString().includes("سعودي");

      // GOSI deduction computed legally on (basic + housing)
      const gosiBaseHalalas = (e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0);
      const gosiRate = isSaudi ? 0.0975 : 0.0; // 9.75% for Saudi employee, 0% for non-Saudi employee
      const gosiDeductionHalalas = Math.round(gosiBaseHalalas * gosiRate);

      // GOSI Employer Share calculated legally
      // Saudi: 11.75% (9% Pension + 2% Hazards + 0.75% SANED)
      // Non-Saudi: 2% (Hazards)
      const gosiEmployerRate = isSaudi ? 0.1175 : 0.02;
      const gosiEmployerShareHalalas = Math.round(gosiBaseHalalas * gosiEmployerRate);

      // Absence deduction calculated as (Basic Salary / 30) * absenceDays
      const absenceDays = Number(e.absenceDays || 0);
      const absenceDeductionHalalas = Math.round(((e.baseSalaryHalalas || 0) / 30) * absenceDays);

      // Total deductions (GOSI + absence + other/custom manager deductions + advances)
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
        basic: (e.baseSalaryHalalas || 0) / 100,
        housing: (e.housingAllowanceHalalas || 0) / 100,
        transport: (e.transportAllowanceHalalas || 0) / 100,
        allowances: (grossHalalas - (e.baseSalaryHalalas || 0)) / 100,
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
    const totalOtherDeductions = payrollEntries.reduce(
      (acc, p) => acc + (p.otherDeductions || 0),
      0
    );
    const totalAdvanceDeductions = payrollEntries.reduce(
      (acc, p) => acc + (p.advanceDeductions || 0),
      0
    );

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

  static async generateMudadSIF(userId: string, runId: string) {
    const runRef = doc(db, "payroll_runs", runId);
    const runDoc = await getDoc(runRef);
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    await updateDoc(runRef, {
      mudadSifGenerated: true,
    });

    let crNumber = "1010123456"; // Default standard 10-digit Saudi CR
    let molId = "7001234567"; // Default standard 10-digit MOL ID
    let employerBankCode = "ALBI"; // Bank AlBilad fallback

    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      const userData = userSnap.data();
      if (userData?.crNumber && userData.crNumber.trim().length === 10) {
        crNumber = userData.crNumber.trim();
      }
      if (userData?.molId && userData.molId.trim().length === 10) {
        molId = userData.molId.trim();
      } else if (userData?.crNumber) {
        molId = "700" + userData.crNumber.trim().substring(3);
      }
      if (userData?.iban) {
        const cleanedIban = userData.iban.replace(/[^A-Za-z0-9]/g, "");
        employerBankCode = cleanedIban.substring(4, 8).toUpperCase() || "ALBI";
      }
    } catch (e) {
      console.warn("Could not load user profile for SIF:", e);
    }

    const creationDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const creationTime = new Date().toTimeString().split(" ")[0].substring(0, 5).replace(/:/g, "");
    const periodStr = (run.period || "2026-07").replace("-", "");

    let totalSalaries = 0;
    const employeeRows: string[] = [];

    // Helper to cleanse fields to satisfy strict Saudi bank parsers
    const cleanId = (id: string) => id.replace(/[^\d]/g, "").substring(0, 10);
    const cleanIban = (iban: string) => iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 24);

    for (const e of run.entries) {
      const empDoc = await getDoc(doc(db, "employees", e.employeeId));
      const emp = empDoc.data() || {};

      let empIdNumber = (emp.idNumber || emp.iqamaNumber || emp.nationalId || emp.employeeId || e.employeeId || "").trim();
      empIdNumber = cleanId(empIdNumber).padEnd(10, "0");
      
      const iban = cleanIban(emp.iban || "SA0000000000000000000000").padEnd(24, "0");
      const basic = Number(e.basic || 0).toFixed(2);
      const housing = Number((emp.housingAllowanceHalalas || 0) / 100).toFixed(2);
      const otherAllowances = Number((e.allowances || 0) - Number(housing)).toFixed(2);
      const deductions = Number(e.deductions || 0).toFixed(2);
      const netPay = Number(e.netPay || 0).toFixed(2);
      const empBankCode = iban.substring(4, 8).toUpperCase() || "ALBI";

      totalSalaries += Number(netPay);

      // Saudi MHRSD WPS Employee Row: 15;Iqama;Bank;IBAN;Basic;Housing;Other;Deductions;NetPay;Remarks
      employeeRows.push(`15;${empIdNumber};${empBankCode};${iban};${basic};${housing};${Number(otherAllowances) > 0 ? otherAllowances : "0.00"};${deductions};${netPay};01`);
    }

    // Saudi MHRSD WPS Header Row: 14;CR;MOL_ID;Bank;Date;Time;Period;TotalNet;Count
    const headerRow = `14;${crNumber};${molId};${employerBankCode};${creationDate};${creationTime};${periodStr};${totalSalaries.toFixed(2)};${employeeRows.length}`;
    const sifData = [headerRow, ...employeeRows].join("\n");

    return {
      data: sifData,
      period: run.period,
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

    let crNumber = "1010123456";
    let molId = "7001234567";
    let employerBankCode = "ALBI";

    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      const userData = userSnap.data();
      if (userData?.crNumber && userData.crNumber.trim().length === 10) {
        crNumber = userData.crNumber.trim();
      }
      if (userData?.molId && userData.molId.trim().length === 10) {
        molId = userData.molId.trim();
      } else if (userData?.crNumber) {
        molId = "700" + userData.crNumber.trim().substring(3);
      }
      if (userData?.iban) {
        const cleanedIban = userData.iban.replace(/[^A-Za-z0-9]/g, "");
        employerBankCode = cleanedIban.substring(4, 8).toUpperCase() || "ALBI";
      }
    } catch (e) {
      console.warn("Could not load user profile for SIF:", e);
    }

    const creationDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const creationTime = new Date().toTimeString().split(" ")[0].substring(0, 5).replace(/:/g, "");
    const periodStr = period.replace("-", "");

    let totalSalaries = 0;
    const employeeRows: string[] = [];
    const cleanId = (id: string) => id.replace(/[^\d]/g, "").substring(0, 10);
    const cleanIban = (iban: string) => iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 24);

    for (const d of snap.docs) {
      await updateDoc(doc(db, "payroll_runs", d.id), {
        mudadSifGenerated: true,
      });

      const run = d.data();
      for (const e of run.entries) {
        const empDoc = await getDoc(doc(db, "employees", e.employeeId));
        const emp = empDoc.data() || {};

        let empIdNumber = (emp.idNumber || emp.iqamaNumber || emp.nationalId || emp.employeeId || e.employeeId || "").trim();
        empIdNumber = cleanId(empIdNumber).padEnd(10, "0");

        const iban = cleanIban(emp.iban || "SA0000000000000000000000").padEnd(24, "0");
        const basic = Number(e.basic || 0).toFixed(2);
        const housing = Number((emp.housingAllowanceHalalas || 0) / 100).toFixed(2);
        const otherAllowances = Number((e.allowances || 0) - Number(housing)).toFixed(2);
        const deductions = Number(e.deductions || 0).toFixed(2);
        const netPay = Number(e.netPay || 0).toFixed(2);
        const empBankCode = iban.substring(4, 8).toUpperCase() || "ALBI";

        totalSalaries += Number(netPay);

        employeeRows.push(`15;${empIdNumber};${empBankCode};${iban};${basic};${housing};${Number(otherAllowances) > 0 ? otherAllowances : "0.00"};${deductions};${netPay};01`);
      }
    }

    const headerRow = `14;${crNumber};${molId};${employerBankCode};${creationDate};${creationTime};${periodStr};${totalSalaries.toFixed(2)};${employeeRows.length}`;
    const sifData = [headerRow, ...employeeRows].join("\n");

    return {
      data: sifData,
      period,
    };
  }

  static async generateWPS(userId: string, runId: string) {
    const runRef = doc(db, "payroll_runs", runId);
    const runDoc = await getDoc(runRef);
    const run = runDoc.data();

    if (!run || run.userId !== userId) {
      throw new Error("Payroll run not found");
    }

    let crNumber = "1010123456";
    let molId = "7001234567";
    let employerBankCode = "ALBI";

    try {
      const userSnap = await getDoc(doc(db, "users", userId));
      const userData = userSnap.data();
      if (userData?.crNumber && userData.crNumber.trim().length === 10) {
        crNumber = userData.crNumber.trim();
      }
      if (userData?.molId && userData.molId.trim().length === 10) {
        molId = userData.molId.trim();
      } else if (userData?.crNumber) {
        molId = "700" + userData.crNumber.trim().substring(3);
      }
      if (userData?.iban) {
        const cleanedIban = userData.iban.replace(/[^A-Za-z0-9]/g, "");
        employerBankCode = cleanedIban.substring(4, 8).toUpperCase() || "ALBI";
      }
    } catch (e) {
      console.warn("Could not load user profile for SIF:", e);
    }

    const creationDate = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const creationTime = new Date().toTimeString().split(" ")[0].substring(0, 5).replace(/:/g, "");
    const periodStr = (run.period || "2026-07").replace("-", "");

    let totalSalaries = 0;
    const employeeRows: string[] = [];
    const cleanId = (id: string) => id.replace(/[^\d]/g, "").substring(0, 10);
    const cleanIban = (iban: string) => iban.replace(/[^A-Za-z0-9]/g, "").toUpperCase().substring(0, 24);

    for (const e of run.entries) {
      const empDoc = await getDoc(doc(db, "employees", e.employeeId));
      const emp = empDoc.data() || {};

      let empIdNumber = (emp.idNumber || emp.iqamaNumber || emp.nationalId || emp.employeeId || e.employeeId || "").trim();
      empIdNumber = cleanId(empIdNumber).padEnd(10, "0");

      const iban = cleanIban(emp.iban || "SA0000000000000000000000").padEnd(24, "0");
      const basic = Number(e.basic || 0).toFixed(2);
      const housing = Number((emp.housingAllowanceHalalas || 0) / 100).toFixed(2);
      const otherAllowances = Number((e.allowances || 0) - Number(housing)).toFixed(2);
      const deductions = Number(e.deductions || 0).toFixed(2);
      const netPay = Number(e.netPay || 0).toFixed(2);
      const empBankCode = iban.substring(4, 8).toUpperCase() || "ALBI";

      totalSalaries += Number(netPay);

      employeeRows.push(`15;${empIdNumber};${empBankCode};${iban};${basic};${housing};${Number(otherAllowances) > 0 ? otherAllowances : "0.00"};${deductions};${netPay};01`);
    }

    const headerRow = `14;${crNumber};${molId};${employerBankCode};${creationDate};${creationTime};${periodStr};${totalSalaries.toFixed(2)};${employeeRows.length}`;
    const wpsData = [headerRow, ...employeeRows].join("\n");

    return {
      data: wpsData,
      period: run.period,
    };
  }

  static async generateReport(userId: string, runId: string) {
    const runDoc = await getDoc(doc(db, "payroll_runs", runId));
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
