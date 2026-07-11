import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  Plus,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  RefreshCw,
  Layers,
  Check,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNo: string;
  currency: string;
  ledgerBalance: number;
  statementBalance: number;
}

interface StatementLine {
  id: string;
  date: string;
  description: string;
  amount: number;
  matched: boolean;
  matchedWith?: string;
}

interface LedgerLine {
  id: string;
  date: string;
  refNo: string;
  description: string;
  amount: number;
  matched: boolean;
}

export default function BankingTab() {
  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: "bank-1",
      name: "الحساب الجاري الرئيسي - الراجحي",
      bankName: "Al Rajhi Bank",
      accountNo: "SA8080000001092837482",
      currency: "SAR",
      ledgerBalance: 1450000,
      statementBalance: 1450000,
    },
    {
      id: "bank-2",
      name: "المصروفات النثرية والتشغيلية - الأهلي",
      bankName: "SNB",
      accountNo: "SA4030000003091827364",
      currency: "SAR",
      ledgerBalance: 45000,
      statementBalance: 48500,
    },
    {
      id: "bank-3",
      name: "حساب التسهيلات والاعتمادات - الرياض",
      bankName: "Riyadh Bank",
      accountNo: "SA2010000009081726354",
      currency: "SAR",
      ledgerBalance: 820000,
      statementBalance: 820000,
    },
  ]);

  const [activeBankId, setActiveBankId] = useState("bank-1");

  const [statementLines, setStatementLines] = useState<StatementLine[]>([
    {
      id: "stmt-1",
      date: "2026-05-01",
      description: "SAR 5000 - دفع رواتب موظفين فرعيين",
      amount: -5000,
      matched: false,
    },
    {
      id: "stmt-2",
      date: "2026-05-03",
      description: "فاتورة مبيعات عميل - مجموعة الشايع",
      amount: 45000,
      matched: false,
    },
    {
      id: "stmt-3",
      date: "2026-05-05",
      description: "رسوم تشغيل بوابة الدفع مدى",
      amount: -350,
      matched: false,
    },
    {
      id: "stmt-4",
      date: "2026-05-07",
      description: "توريدات خامات ومواد بناء للمستودع",
      amount: -15000,
      matched: false,
    },
    {
      id: "stmt-5",
      date: "2026-05-10",
      description: "دفعة سداد من المراعي",
      amount: 89000,
      matched: false,
    },
  ]);

  const [ledgerLines, setLedgerLines] = useState<LedgerLine[]>([
    {
      id: "ledg-1",
      date: "2026-05-01",
      refNo: "JV-2026-009",
      description: "مسودة قيد سداد أجور",
      amount: -5000,
      matched: false,
    },
    {
      id: "ledg-2",
      date: "2026-05-03",
      refNo: "INV-2026-001",
      description: "فاتورة رقم 001 - الشايع",
      amount: 45000,
      matched: false,
    },
    {
      id: "ledg-3",
      date: "2026-05-08",
      refNo: "PV-2026-022",
      description: "أمر صرف توريد مستودعات",
      amount: -15000,
      matched: false,
    },
    {
      id: "ledg-4",
      date: "2026-05-10",
      refNo: "INV-2026-002",
      description: "سداد فاتورة المراعي",
      amount: 89000,
      matched: false,
    },
  ]);

  const [reconciledCount, setReconciledCount] = useState(0);
  const [reconcileAudit, setReconcileAudit] = useState<string[]>([]);
  const [isMatching, setIsMatching] = useState(false);

  // Auto Matching logic
  const handleAutoMatch = () => {
    setIsMatching(true);
    setTimeout(() => {
      let matchedCount = 0;
      const newAudit: string[] = [];

      const updatedStatements = statementLines.map((stmt) => {
        if (stmt.matched) return stmt;

        // Try to find a ledger line that matches date OR amount closely
        const match = ledgerLines.find((ledg) => !ledg.matched && ledg.amount === stmt.amount);
        if (match) {
          matchedCount++;
          stmt.matched = true;
          stmt.matchedWith = match.refNo;
          match.matched = true;
          newAudit.push(
            `[تطابق تلقائي] تم مطابقة الحركة البنكية بقيمة (${stmt.amount.toLocaleString()} ر.س) مع القيد المحاسبي (${match.refNo}) بنجاح.`
          );
        }
        return stmt;
      });

      setStatementLines(updatedStatements);
      setReconciledCount((prev) => prev + matchedCount);
      setReconcileAudit((prev) => [...prev, ...newAudit]);
      setIsMatching(false);
    }, 1000);
  };

  const handleManualMatch = (stmtId: string, ledgId: string) => {
    const stmt = statementLines.find((s) => s.id === stmtId);
    const ledg = ledgerLines.find((l) => l.id === ledgId);

    if (!stmt || !ledg) return;

    setStatementLines((prev) =>
      prev.map((s) => (s.id === stmtId ? { ...s, matched: true, matchedWith: ledg.refNo } : s))
    );
    setLedgerLines((prev) => prev.map((l) => (l.id === ledgId ? { ...l, matched: true } : l)));
    setReconciledCount((prev) => prev + 1);
    setReconcileAudit((prev) => [
      ...prev,
      `[تطابق يدوي] تم ربط الحركة البنكية الموضحة بـ (${stmt.description}) مع مستند اليومية (${ledg.refNo}) بواسطة الإدارة.`,
    ]);
  };

  const activeAccount = bankAccounts.find((b) => b.id === activeBankId);

  return (
    <div className="space-y-6 text-right">
      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bankAccounts.map((account) => {
          const isSelected = activeBankId === account.id;
          return (
            <div
              key={account.id}
              onClick={() => setActiveBankId(account.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-zinc-100 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400"
                      : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <CreditCard className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] text-zinc-400 font-bold font-mono">
                  {account.accountNo.substring(0, 10)}...
                </span>
              </div>
              <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 mt-4">
                {account.name}
              </h4>
              <p className="text-[10px] text-zinc-400 mt-1">{account.bankName}</p>

              <div className="flex justify-between items-center pt-3 border-t border-zinc-100 dark:border-zinc-850 mt-4 text-xs">
                <div>
                  <span className="text-[9px] text-zinc-400 font-bold block">
                    رصيد الأستاذ (Ledger)
                  </span>
                  <span className="font-mono font-black text-zinc-800 dark:text-zinc-200">
                    {account.ledgerBalance.toLocaleString()} ر.س
                  </span>
                </div>
                <div className="text-left">
                  <span className="text-[9px] text-zinc-400 font-bold block">رصيد كشف الحساب</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {account.statementBalance.toLocaleString()} ر.s
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Reconciliation Work Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Reconcile Interface */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-6 rounded-3xl shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                مطابقة التسوية البنكية اللحظية (Smart Bank Reconciliation)
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">
                مطابقة العمليات الواردة في كشف الحساب البنكي مع قيود اليومية العامة
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAutoMatch}
                disabled={isMatching}
                className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isMatching ? "جاري المطابقة..." : "تطابق تلقائي ذكي"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bank Statement Panel */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                <span>العمليات من كشف الحساب (Statement)</span>
                <span className="font-mono">
                  {statementLines.filter((s) => s.matched).length} / {statementLines.length} مطابقة
                </span>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {statementLines.map((stmt) => (
                  <div
                    key={stmt.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      stmt.matched
                        ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30"
                        : "bg-zinc-50 dark:bg-zinc-100 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-zinc-400">{stmt.date}</span>
                      <span
                        className={`font-mono font-black ${stmt.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}
                      >
                        {stmt.amount > 0 ? "+" : ""}
                        {stmt.amount.toLocaleString()} ر.س
                      </span>
                    </div>
                    <p className="font-bold text-zinc-850 dark:text-zinc-150">{stmt.description}</p>

                    {stmt.matched ? (
                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black">
                        <Check className="w-3 h-3" />
                        <span>تمت المطابقة مع القيد {stmt.matchedWith}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-850">
                        <span className="text-[9px] text-zinc-400 font-bold">
                          بانتظار ربط الحركة
                        </span>
                        <div className="flex gap-1">
                          {ledgerLines
                            .filter((l) => !l.matched && l.amount === stmt.amount)
                            .map((matchLedg) => (
                              <button
                                key={matchLedg.id}
                                onClick={() => handleManualMatch(stmt.id, matchLedg.id)}
                                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-[9px] font-black rounded"
                              >
                                مطابقة مع {matchLedg.refNo}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* General Ledger Bank Entries Panel */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                <span>حركات دفتر الأستاذ العام (Ledger)</span>
                <span className="font-mono">
                  {ledgerLines.filter((l) => l.matched).length} / {ledgerLines.length} مسواة
                </span>
              </div>

              <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                {ledgerLines.map((ledg) => (
                  <div
                    key={ledg.id}
                    className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                      ledg.matched
                        ? "bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30"
                        : "bg-zinc-50 dark:bg-zinc-100 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] text-zinc-400">{ledg.date}</span>
                      <span className="font-mono font-black text-zinc-800 dark:text-zinc-200">
                        {ledg.amount.toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-zinc-850 dark:text-zinc-150">
                        {ledg.description}
                      </p>
                      <span className="font-mono text-[9px] text-indigo-500 font-black">
                        {ledg.refNo}
                      </span>
                    </div>

                    {ledg.matched ? (
                      <div className="flex items-center gap-1.5 text-[9px] text-emerald-600 font-black pt-1">
                        <Check className="w-3 h-3" />
                        <span>الحركة متطابقة ومسواة بنجاح</span>
                      </div>
                    ) : (
                      <span className="text-[9px] text-zinc-400 font-bold block pt-1">
                        حركة غير مستقرة
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audit Trail & Match Metrics */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-100 border border-zinc-150 dark:border-zinc-850 p-5 rounded-3xl shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                سجل عمليات التدقيق والمطابقة
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold">
                سجل تتبع الحركات المسواة بنجاح والتسويات المحاسبية
              </p>
            </div>

            <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {reconcileAudit.length === 0 ? (
                <div className="text-center py-8 text-zinc-400 text-[10px] font-bold">
                  لم يتم إجراء أي مطابقة بعد. اضغط على "تطابق تلقائي ذكي" لبدء التسوية.
                </div>
              ) : (
                reconcileAudit.map((log, index) => (
                  <div
                    key={index}
                    className="text-[10px] text-zinc-600 dark:text-zinc-300 font-bold border-r-2 border-emerald-500 pr-2.5 py-1"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-100 dark:border-zinc-850 space-y-3 mt-4">
            <span className="text-[10px] text-zinc-400 font-black block">
              حالة الحساب البنكي النشط
            </span>
            <div className="flex justify-between text-xs font-bold">
              <span className="text-zinc-500">فروقات غير مسواة:</span>
              <span className="font-mono text-rose-500 font-black">
                {activeAccount
                  ? (activeAccount.statementBalance - activeAccount.ledgerBalance).toLocaleString()
                  : 0}{" "}
                ر.س
              </span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: reconciledCount > 0 ? "80%" : "30%" }}
              ></div>
            </div>
            <span className="text-[9px] text-zinc-400 font-bold block">
              تمت مطابقة {reconciledCount} حركات تجارية بالكامل.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
