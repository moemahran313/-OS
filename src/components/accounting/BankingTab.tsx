import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth } from "@/src/lib/firebase";
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
  Link,
  Wifi,
  Lock,
  Loader2,
  CheckCircle,
} from "lucide-react";

interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  accountNo: string;
  currency: string;
  ledgerBalance: number;
  statementBalance: number;
  provider?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
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
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [activeBankId, setActiveBankId] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Connect Wizard Form States
  const [connectStep, setConnectStep] = useState<"provider" | "bank" | "credentials" | "success">("provider");
  const [selectedProvider, setSelectedProvider] = useState<"lean" | "tarabut">("lean");
  const [selectedBankName, setSelectedBankName] = useState("Al Rajhi Bank");
  const [accountNoInput, setAccountNoInput] = useState("");
  const [initialBalance, setInitialBalance] = useState("250000");
  const [isConnecting, setIsConnecting] = useState(false);

  // Statement File Upload States (MT940 / CAMT.053)
  const [showFileModal, setShowFileModal] = useState(false);
  const [fileContentInput, setFileContentInput] = useState("");
  const [fileTypeSelect, setFileTypeSelect] = useState<"mt940" | "camt053" | "csv">("mt940");
  const [isParsingFile, setIsParsingFile] = useState(false);

  const [statementLines, setStatementLines] = useState<StatementLine[]>([]);
  const [ledgerLines, setLedgerLines] = useState<LedgerLine[]>([]);

  const [reconciledCount, setReconciledCount] = useState(0);
  const [reconcileAudit, setReconcileAudit] = useState<string[]>([
    "[نظام] تم تشغيل المحرك المالي اللحظي المتوافق مع معايير البنك المركزي السعودي SAMA."
  ]);
  const [isMatching, setIsMatching] = useState(false);

  // Fetch Connected Bank Accounts from DB on load
  const loadBankConnections = async () => {
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/accounting/banking/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const formatted = data.map((item: any) => ({
            id: item.id,
            name: `${item.bankName} - المباشر`,
            bankName: item.bankName,
            accountNo: item.accountNo,
            currency: "SAR",
            ledgerBalance: item.ledgerBalance,
            statementBalance: item.statementBalance,
            provider: item.provider,
            connectedAt: item.connectedAt,
            lastSyncedAt: item.lastSyncedAt || item.connectedAt,
          }));
          setBankAccounts([...bankAccounts, ...formatted]);
        }
      }
    } catch (e) {
      console.error("Failed to load bank connections", e);
    }
  };

  useEffect(() => {
    loadBankConnections();
  }, []);

  // Initiate Open Banking Connection Session
  const handleConnectBank = async () => {
    setIsConnecting(true);
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        alert("يرجى تسجيل الدخول أولاً للمتابعة.");
        return;
      }

      const generatedAccountNo = accountNoInput || `SA${Math.floor(10000000000000000000 + Math.random() * 90000000000000000000)}`;
      const res = await fetch("/api/accounting/banking/connect", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          provider: selectedProvider,
          bankName: selectedBankName,
          accountNo: generatedAccountNo,
          balance: parseFloat(initialBalance) || 120000,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        const newAcct: BankAccount = {
          id: created.id,
          name: `${created.bankName} - المباشر`,
          bankName: created.bankName,
          accountNo: created.accountNo,
          currency: "SAR",
          ledgerBalance: created.ledgerBalance,
          statementBalance: created.statementBalance,
          provider: created.provider,
          connectedAt: created.connectedAt,
          lastSyncedAt: created.lastSyncedAt || created.connectedAt || new Date().toISOString(),
        };
        setBankAccounts((prev) => [newAcct, ...prev]);
        setActiveBankId(created.id);
        setConnectStep("success");
        setReconcileAudit((prev) => [
          ...prev,
          `[ربط بنكي] تم ربط حسابك في ${created.bankName} (${created.accountNo}) بنجاح عبر بوابة ${selectedProvider === "lean" ? "Lean Technologies" : "Tarabut Gateway"}.`
        ]);
      } else {
        const err = await res.json();
        alert(`فشل الربط المصرفي: ${err.error}`);
      }
    } catch (e) {
      console.error(e);
      alert("فشل اتصال بوابة الخدمات المصرفية المفتوحة.");
    } finally {
      setIsConnecting(false);
    }
  };

  // Live Bank Feed Synchronization
  const handleSyncBankFeed = async () => {
    const activeAccount = bankAccounts.find((b) => b.id === activeBankId);
    if (!activeAccount) return;

    if (!activeAccount.provider) {
      alert("هذا الحساب البنكي محاكاة يدوية. يرجى الضغط على زر 'ربط حساب بنكي مباشر' لربط حساب مالي مباشر عبر Lean أو Tarabut والاستمتاع بالمزامنة التلقائية اللحظية.");
      return;
    }

    setIsSyncing(true);
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const res = await fetch("/api/accounting/banking/sync", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ connectionId: activeBankId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Append live transaction statement lines
        const newFeeds = data.feeds.map((feed: any) => ({
          id: feed.id,
          date: feed.date,
          description: feed.description,
          amount: feed.amount,
          matched: false,
        }));

        setStatementLines((prev) => [...newFeeds, ...prev]);
        setBankAccounts((prev) =>
          prev.map((b) =>
            b.id === activeBankId
              ? { 
                  ...b, 
                  statementBalance: data.newStatementBalance,
                  lastSyncedAt: data.syncedAt || new Date().toISOString()
                }
              : b
          )
        );

        setReconcileAudit((prev) => [
          ...prev,
          `[مزامنة فورية] تم جلب ${data.feeds.length} عمليات بنكية فورية مباشرة عبر ${data.provider === "lean" ? "Lean Technologies API" : "Tarabut Gateway API"}.`
        ]);
        alert("تمت المزامنة اللحظية وجلب كشف الحساب الفوري من البنك المركزي بنجاح!");
      }
    } catch (e) {
      console.error(e);
      alert("خطأ أثناء الاتصال بخوادم المالية المفتوحة.");
    } finally {
      setIsSyncing(false);
    }
  };

  // MT940 / CAMT.053 File Import Handler
  const handleParseStatementFile = async () => {
    if (!fileContentInput.trim()) {
      alert("يرجى إدخال أو إرفاق نص ملف MT940 أو CAMT.053 أولاً.");
      return;
    }
    setIsParsingFile(true);
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/accounting/bank-feed/parse-statement", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fileContent: fileContentInput,
          fileType: fileTypeSelect,
          bankName: activeAccount?.bankName || "البنك الأهلي / الراجحي",
          accountNo: activeAccount?.accountNo || "",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lines && data.lines.length > 0) {
          setStatementLines((prev) => [...data.lines, ...prev]);
          setReconcileAudit((prev) => [
            ...prev,
            `[استيراد كشف حساب] تم تفريغ ${data.lines.length} عملية بنكية بنجاح من ملف ${fileTypeSelect.toUpperCase()}.`
          ]);
          alert(`تم تحليل واستيراد ${data.lines.length} حركة بنكية من ملف ${fileTypeSelect.toUpperCase()} بنجاح!`);
          setShowFileModal(false);
          setFileContentInput("");
        }
      } else {
        alert("فشل تحليل ملف كشف الحساب المصرفي.");
      }
    } catch (err) {
      alert("خطأ في الاتصال أثناء معالجة كشف الحساب.");
    } finally {
      setIsParsingFile(false);
    }
  };

  // Auto Matching logic calling backend SAMA reconciliation engine
  const [serverMatches, setServerMatches] = useState<any[]>([]);
  const [unmatchedTxs, setUnmatchedTxs] = useState<any[]>([]);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitTxItem, setSplitTxItem] = useState<any>(null);
  const [splitLines, setSplitLines] = useState<any[]>([
    { accountCode: "1011", accountName: "البنك الأهلي / Cash at Bank", debit: 0, credit: 0, description: "قيد البنك" },
    { accountCode: "1201", accountName: "ذمم العملاء / Accounts Receivable", debit: 0, credit: 0, description: "تسوية فاتورة العميل" },
  ]);
  const [isSubmittingSplit, setIsSubmittingSplit] = useState(false);

  const handleAutoMatch = async () => {
    setIsMatching(true);
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/banking/reconcile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ connectionId: activeBankId }),
      });

      if (res.ok) {
        const data = await res.json();
        setServerMatches(data.matches || []);
        setUnmatchedTxs(data.unmatchedBankTxs || []);
        setReconciledCount(data.matches?.length || 0);
        setReconcileAudit((prev) => [
          `[SAMA Engine] تم تحليل ${data.totalAnalyzed || 0} حركة بنكية. تم العثور على ${data.matches?.length || 0} مطابقة بدرجات ثقة متفاوتة (تام / عالي / جزئي).`,
          ...prev,
        ]);
      } else {
        alert("فشل تشغيل محرك المطابقة البنكية.");
      }
    } catch (err) {
      console.error("Reconcile error:", err);
      alert("حدث خطأ أثناء إجراء عملية المطابقة مع السجل المحاسبي.");
    } finally {
      setIsMatching(false);
    }
  };

  useEffect(() => {
    handleAutoMatch();
  }, [activeBankId]);

  // Accept Auto Match Endpoint Call
  const handleAcceptMatch = async (matchItem: any) => {
    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();
      const { bankTransaction, matchDetails } = matchItem;

      const res = await fetch("/api/banking/reconcile/accept-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankTxId: bankTransaction.id,
          targetType: matchDetails.targetType,
          targetId: matchDetails.targetId,
          amount: Math.abs(bankTransaction.amount),
          journalData: matchDetails.suggestedJournal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setServerMatches((prev) => prev.filter((m) => m.bankTransaction.id !== bankTransaction.id));
        setReconciledCount((prev) => prev + 1);
        setReconcileAudit((prev) => [
          `[قبول مطابقة] تم ترحيل القيد ${data.journalNumber} بنجاح للحركة بقيمة (${Math.abs(bankTransaction.amount).toLocaleString()} ر.س) والمرتبطة بـ ${matchDetails.targetNumber}.`,
          ...prev,
        ]);
        alert(`تم قبول المطابقة وتوليد القيد المحاسبي ${data.journalNumber} وتسويته مع الفاتورة بنجاح!`);
      } else {
        alert("فشل قبول المطابقة وتسجيل القيد.");
      }
    } catch (err) {
      alert("خطأ أثناء ترحيل قيد المطابقة.");
    }
  };

  // Open Split Modal for a transaction
  const handleOpenSplitModal = (tx: any) => {
    setSplitTxItem(tx);
    const amt = Math.abs(tx.amount || 0);
    setSplitLines([
      { accountCode: "1011", accountName: "البنك الأهلي / Cash at Bank", debit: tx.amount > 0 ? amt : 0, credit: tx.amount < 0 ? amt : 0, description: tx.description || "حساب البنك" },
      { accountCode: "1201", accountName: "ذمم العملاء / Accounts Receivable", debit: tx.amount < 0 ? amt : 0, credit: tx.amount > 0 ? amt : 0, description: "تسوية الحساب" },
      { accountCode: "5201", accountName: "مصاريف وعمولات بنكية / Bank Charges", debit: 0, credit: 0, description: "عمولة بنكية" },
    ]);
    setShowSplitModal(true);
  };

  // Save Split Transaction
  const handleSaveSplit = async () => {
    if (!splitTxItem) return;
    setIsSubmittingSplit(true);

    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/banking/reconcile/split-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankTxId: splitTxItem.id,
          description: `تقسيم العملية البنكية - ${splitTxItem.description}`,
          lines: splitLines,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUnmatchedTxs((prev) => prev.filter((t) => t.id !== splitTxItem.id));
        setReconciledCount((prev) => prev + 1);
        setReconcileAudit((prev) => [
          `[تقسيم عملية] تم تقسيم الحركة البنكية بقيمة (${Math.abs(splitTxItem.amount).toLocaleString()} ر.س) عبر القيد المحاسبي ${data.journalNumber}.`,
          ...prev,
        ]);
        alert(`تم حفظ القيد المركّب وتقسيم الحركة البنكية بنجاح! رقم القيد: ${data.journalNumber}`);
        setShowSplitModal(false);
      } else {
        const errData = await res.json();
        alert(errData.error || "فشل تقسيم العملية.");
      }
    } catch (err) {
      alert("خطأ أثناء حفظ القيد المركّب.");
    } finally {
      setIsSubmittingSplit(false);
    }
  };

  // One-click post missing bank fee
  const handlePostBankFee = async (tx: any) => {
    const feeAmt = prompt("أدخل قيمة العمولة والرسوم البنكية المراد تسجيلها مباشرة (SAR):", Math.abs(tx.amount || 0).toString());
    if (!feeAmt || isNaN(parseFloat(feeAmt))) return;

    try {
      await auth.authStateReady();
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/banking/reconcile/post-bank-fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bankTxId: tx.id,
          feeAmount: parseFloat(feeAmt),
          description: tx.description || "رسوم وعمولات تحويل بنكية",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setUnmatchedTxs((prev) => prev.filter((t) => t.id !== tx.id));
        setReconciledCount((prev) => prev + 1);
        setReconcileAudit((prev) => [
          `[عمولة بنكية] تم تسجيل القيد ${data.journalNumber} لرسوم وعمولات بنكية بقيمة (${parseFloat(feeAmt).toLocaleString()} ر.س) بنجاح.`,
          ...prev,
        ]);
        alert(`تم تسجيل قيد العمولات والمصاريف البنكية بنجاح! القيد: ${data.journalNumber}`);
      } else {
        alert("فشل تسجيل العمولة البنكية.");
      }
    } catch (err) {
      alert("خطأ أثناء تسجيل المصاريف البنكية.");
    }
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
      {/* Upper Bank Hub Banner */}
      <div className="bg-gradient-to-l from-emerald-900 to-zinc-900 p-8 rounded-[2rem] text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl border border-emerald-800/20">
        <div className="space-y-2">
          <span className="px-3.5 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
            Open Banking Hub (SAMA Compliant)
          </span>
          <h2 className="text-2xl font-black tracking-tight">منصة ربط الحسابات المصرفية المباشرة</h2>
          <p className="text-xs text-zinc-300 max-w-xl">
            تخلص من كشوف الحساب الورقية والإدخال اليدوي. قم بربط منشأتك مباشرة ببوابة شركاء المالية المفتوحة المعتمدة في المملكة العربية السعودية لمزامنة الحركات فورياً وتأمين كشوفاتك في الأستاذ العام.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowFileModal(true)}
            className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-2xl flex items-center gap-2 border border-white/20 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            استيراد ملف MT940 / CAMT.053
          </button>
          <button
            onClick={() => {
              setConnectStep("provider");
              setShowConnectModal(true);
            }}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-xs font-black rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            ربط حساب بنكي مباشر
          </button>
          {activeAccount?.provider && (
            <button
              onClick={handleSyncBankFeed}
              disabled={isSyncing}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-2xl flex items-center gap-2 border border-white/10 transition-colors cursor-pointer"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              ) : (
                <Wifi className="w-4 h-4 text-emerald-400 animate-pulse" />
              )}
              {isSyncing ? "جاري جلب الفيد..." : "مزامنة لحظية للمالية المفتوحة"}
            </button>
          )}
        </div>
      </div>

      {/* Account Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {bankAccounts.map((account) => {
          const isSelected = activeBankId === account.id;
          return (
            <div
              key={account.id}
              onClick={() => setActiveBankId(account.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 shadow-sm"
                  : "bg-white dark:bg-zinc-100 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200"
              }`}
            >
              {account.provider && (
                <span className="absolute top-0 left-0 bg-emerald-500 text-zinc-950 font-mono text-[8px] font-black px-2 py-0.5 rounded-br-lg flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-950 rounded-full animate-ping"></span>
                  LIVE: {account.provider.toUpperCase()}
                </span>
              )}
              <div className="flex justify-between items-start mt-1">
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
                    {account.statementBalance.toLocaleString()} ر.س
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

          {/* Reconciled Auto Matches Workspace */}
          <div className="space-y-6">
            {/* Auto Matches Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                  <Sparkles className="w-3.5 h-3.5" />
                  اقتراحات المطابقة الآلية الذكية (SAMA Open Banking Matching)
                </span>
                <span className="font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-black">
                  {serverMatches.length} مطابقة متاحة
                </span>
              </div>

              {serverMatches.length === 0 ? (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-xs font-black text-zinc-700 dark:text-zinc-300">
                    لا توجد مطابقات مقترحة معلقة حالياً!
                  </p>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    جميع الحركات البنكية المستوردة مسواة بالكامل أو بانتظار استيراد تغذية جديدة.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {serverMatches.map((item, idx) => {
                    const { bankTransaction: tx, matchDetails: m } = item;
                    const isExact = m.confidenceLevel === "EXACT";
                    const isHigh = m.confidenceLevel === "HIGH";

                    return (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 hover:border-emerald-500 transition-all"
                      >
                        {/* Header Badge & Confidence */}
                        <div className="flex justify-between items-center border-b pb-2 dark:border-zinc-800">
                          <div className="flex items-center gap-2">
                            {isExact ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                تطابق تام (100% Exact Match)
                              </span>
                            ) : isHigh ? (
                              <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 text-[10px] font-black border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                توافق عالي ({m.confidenceScore}% High)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-black border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                توافق جزئي ({m.confidenceScore}% Partial)
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-400">{tx.date}</span>
                          </div>

                          <span className={`font-mono font-black text-sm ${tx.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                            {tx.amount > 0 ? "+" : ""}{Math.abs(tx.amount).toLocaleString()} SAR
                          </span>
                        </div>

                        {/* Statement Line vs Target Invoice / Vendor Bill */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-xl text-xs">
                          {/* Statement Details */}
                          <div className="space-y-1">
                            <span className="text-[9px] font-black text-zinc-400 uppercase">حركة كشف الحساب البنكي</span>
                            <p className="font-bold text-zinc-800 dark:text-zinc-200">{tx.description}</p>
                            <span className="text-[9px] font-mono text-zinc-400 block">البنك: {tx.bankName || "SNB"}</span>
                          </div>

                          {/* Matched Target Details */}
                          <div className="space-y-1 border-r pr-3 border-zinc-200 dark:border-zinc-700">
                            <span className="text-[9px] font-black text-zinc-400 uppercase">
                              المستند المقابل ({m.targetType === "INVOICE" ? "فاتورة ZATCA" : "فاتورة مورد"})
                            </span>
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              {m.targetNumber} - {m.targetName}
                            </p>
                            <span className="text-[9px] font-mono text-zinc-400 block">
                              القيمة المستحقة: {m.targetAmount?.toLocaleString()} SAR
                            </span>
                          </div>
                        </div>

                        {/* Reason / Suggested Journal */}
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/10 space-y-1">
                          <p className="font-bold text-zinc-700 dark:text-zinc-300">💡 سبب التوصية: {m.reason}</p>
                          {m.suggestedJournal && (
                            <p className="font-mono text-[9px] text-zinc-500">
                              القيد المقترح: مدين ({m.suggestedJournal.debitAccountName || m.suggestedJournal.debitAccountCode}) / دائن ({m.suggestedJournal.creditAccountName || m.suggestedJournal.creditAccountCode})
                            </p>
                          )}
                        </div>

                        {/* Interactive Workspace Action Buttons */}
                        <div className="flex flex-wrap gap-2 pt-1 justify-end">
                          <button
                            onClick={() => handleOpenSplitModal(tx)}
                            className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-[10px] font-black rounded-lg transition-colors flex items-center gap-1"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            تقسيم العملية (Split)
                          </button>
                          <button
                            onClick={() => handleAcceptMatch(item)}
                            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 text-[10px] font-black rounded-lg transition-all shadow-md flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            قبول المطابقة وتوليد القيد (Accept)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Unmatched Bank Transactions Section */}
            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                <span>حركات بنكية غير مطابقة (Unmatched Transactions)</span>
                <span className="font-mono">{unmatchedTxs.length} حركات</span>
              </div>

              <div className="space-y-2 max-h-[250px] overflow-y-auto pr-1">
                {unmatchedTxs.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 text-center py-4 font-bold">لا توجد حركات معلقة غير مطابقة.</p>
                ) : (
                  unmatchedTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl border bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs"
                    >
                      <div className="space-y-0.5 max-w-[60%]">
                        <span className="font-mono text-[9px] text-zinc-400 block">{tx.date}</span>
                        <p className="font-bold text-zinc-800 dark:text-zinc-200 truncate">{tx.description}</p>
                        <span className={`font-mono font-black ${tx.amount < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                          {tx.amount > 0 ? "+" : ""}{Math.abs(tx.amount).toLocaleString()} SAR
                        </span>
                      </div>

                      <div className="flex gap-1.5">
                        {tx.amount < 0 && (
                          <button
                            onClick={() => handlePostBankFee(tx)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 text-[9px] font-black rounded-lg border border-amber-200/50"
                          >
                            عمولة بنكية
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenSplitModal(tx)}
                          className="px-2.5 py-1 bg-zinc-900 text-white hover:bg-zinc-800 text-[9px] font-black rounded-lg"
                        >
                          تقسيم وقيد
                        </button>
                      </div>
                    </div>
                  ))
                )}
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

          <div className="bg-zinc-50 dark:bg-zinc-100 p-5 rounded-2xl border border-zinc-150 dark:border-zinc-850 space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-zinc-400 font-black uppercase">
                مؤشر حالة الربط البنكي (Banking Status)
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {activeAccount?.provider ? (
              <div className="space-y-3 bg-white dark:bg-zinc-200/50 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-850">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-500">حالة الربط الآمن:</span>
                  <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-1 rounded-lg font-black text-[10px] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    متصل ومتزامن (Synced)
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-500">بوابة الربط المصرفي:</span>
                  <span className="font-black text-zinc-800 dark:text-zinc-200 uppercase font-mono">
                    {activeAccount.provider === "lean" ? "Lean Technologies" : "Tarabut Gateway"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-zinc-500">آخر مزامنة ناجحة:</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                    {activeAccount.lastSyncedAt 
                      ? new Date(activeAccount.lastSyncedAt).toLocaleString("ar-SA", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }) 
                      : "غير متوفر"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-amber-500/5 p-3.5 rounded-xl border border-amber-500/10 text-xs font-bold">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">وضع الحساب:</span>
                  <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded text-[10px] font-black">
                    وضع المحاكاة (Sandbox)
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal font-medium">
                  هذا حساب تجريبي غير مرتبط بالبوابة المصرفية. يرجى استخدام زر "ربط حساب بنكي مباشر" في الأعلى لربط حساب سعودي معتمد عبر Lean أو Tarabut.
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-850 space-y-3">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-zinc-500">الفروقات المعلقة (أستاذ / كشف):</span>
                <span className={`font-mono font-black ${
                  activeAccount && activeAccount.statementBalance - activeAccount.ledgerBalance !== 0 
                    ? "text-rose-500" 
                    : "text-emerald-600"
                }`}>
                  {activeAccount
                    ? (activeAccount.statementBalance - activeAccount.ledgerBalance).toLocaleString()
                    : 0}{" "}
                  ر.س
                </span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: reconciledCount > 0 ? "100%" : "30%" }}
                ></div>
              </div>
              <span className="text-[9px] text-zinc-400 font-bold block">
                مؤشر التسوية: تم مطابقة {reconciledCount} حركات بنكية بنجاح مع كود الأستاذ العام المقابل.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Split Transaction Modal */}
      <AnimatePresence>
        {showSplitModal && splitTxItem && (
          <div className="fixed inset-0 bg-zinc-950/70 backdrop-blur-sm z-[160] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 text-right space-y-5"
            >
              <header className="flex justify-between items-center border-b pb-4 dark:border-zinc-800">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
                    تقسيم الحركة البنكية بين عدة حسابات (Split Ledger Entry)
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold">
                    الحركة: {splitTxItem.description} | المبلغ الإجمالي: {Math.abs(splitTxItem.amount).toLocaleString()} SAR
                  </p>
                </div>
                <button
                  onClick={() => setShowSplitModal(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-bold text-xs"
                >
                  إغلاق ✕
                </button>
              </header>

              <div className="space-y-4">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-zinc-500">أسطر القيد المحاسبي المركّب:</span>
                    <button
                      onClick={() =>
                        setSplitLines((prev) => [
                          ...prev,
                          { accountCode: "5201", accountName: "حساب آخر", debit: 0, credit: 0, description: "سطر جديد" },
                        ])
                      }
                      className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-lg text-[10px] font-black"
                    >
                      + إضافة سطر آخر
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {splitLines.map((line, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs">
                        <div className="col-span-3">
                          <label className="text-[9px] text-zinc-400 font-black block">كود الحساب</label>
                          <input
                            type="text"
                            value={line.accountCode}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSplitLines((prev) => prev.map((l, i) => (i === idx ? { ...l, accountCode: val } : l)));
                            }}
                            className="w-full p-1.5 border rounded-lg font-mono text-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                          />
                        </div>
                        <div className="col-span-4">
                          <label className="text-[9px] text-zinc-400 font-black block">اسم الحساب / البيان</label>
                          <input
                            type="text"
                            value={line.accountName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSplitLines((prev) => prev.map((l, i) => (i === idx ? { ...l, accountName: val } : l)));
                            }}
                            className="w-full p-1.5 border rounded-lg text-xs dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] text-emerald-600 font-black block">مدين (Debit)</label>
                          <input
                            type="number"
                            value={line.debit}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSplitLines((prev) => prev.map((l, i) => (i === idx ? { ...l, debit: val } : l)));
                            }}
                            className="w-full p-1.5 border rounded-lg font-mono text-xs text-emerald-600 font-bold dark:bg-zinc-800 dark:border-zinc-700"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[9px] text-rose-600 font-black block">دائن (Credit)</label>
                          <input
                            type="number"
                            value={line.credit}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) || 0;
                              setSplitLines((prev) => prev.map((l, i) => (i === idx ? { ...l, credit: val } : l)));
                            }}
                            className="w-full p-1.5 border rounded-lg font-mono text-xs text-rose-600 font-bold dark:bg-zinc-800 dark:border-zinc-700"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center pt-3">
                          {splitLines.length > 2 && (
                            <button
                              onClick={() => setSplitLines((prev) => prev.filter((_, i) => i !== idx))}
                              className="text-rose-500 font-black text-xs hover:text-rose-700"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Balance Check */}
                  <div className="flex justify-between items-center text-xs font-mono font-black pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <span className="text-zinc-500">
                      إجمالي المدين: {splitLines.reduce((s, l) => s + (l.debit || 0), 0).toLocaleString()} SAR
                    </span>
                    <span className="text-zinc-500">
                      إجمالي الدائن: {splitLines.reduce((s, l) => s + (l.credit || 0), 0).toLocaleString()} SAR
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black ${
                        Math.abs(
                          splitLines.reduce((s, l) => s + (l.debit || 0), 0) -
                            splitLines.reduce((s, l) => s + (l.credit || 0), 0)
                        ) < 0.01
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {Math.abs(
                        splitLines.reduce((s, l) => s + (l.debit || 0), 0) -
                          splitLines.reduce((s, l) => s + (l.credit || 0), 0)
                      ) < 0.01
                        ? "القيد متزن 100%"
                        : "القيد غير متزن!"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowSplitModal(false)}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveSplit}
                    disabled={isSubmittingSplit}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {isSubmittingSplit ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري حفظ وتوزيع القيد...
                      </>
                    ) : (
                      "اعتماد قيد التقسيم"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Open Banking Direct Link Wizard Modal */}
      <AnimatePresence>
        {showConnectModal && (
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden border border-zinc-150 shadow-2xl"
            >
              <header className="p-8 pb-4 flex justify-between items-center bg-zinc-50/50 border-b border-zinc-100">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                    <Wifi className="w-5 h-5 text-emerald-500" />
                    ربط الخدمات المصرفية المفتوحة (Open Banking Link)
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    SAMA Sandboxed Direct Feed SDK Integration
                  </p>
                </div>
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="p-2 hover:bg-zinc-100 rounded-xl font-bold text-zinc-400 text-sm"
                >
                  إغلاق
                </button>
              </header>

              <div className="p-8 space-y-6">
                {/* Step indicators */}
                <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 border-b border-zinc-100 pb-4">
                  <span className={connectStep === "provider" ? "text-emerald-600 font-black" : ""}>١. اختيار المزود</span>
                  <span className={connectStep === "bank" ? "text-emerald-600 font-black" : ""}>٢. اختيار البنك المعتمد</span>
                  <span className={connectStep === "credentials" ? "text-emerald-600 font-black" : ""}>٣. التفويض المصرفي</span>
                  <span className={connectStep === "success" ? "text-emerald-600 font-black" : ""}>٤. الربط الناجح</span>
                </div>

                {connectStep === "provider" && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-600">الرجاء اختيار مزود خدمات التقنية المالية المفتوحة المعتمد:</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => setSelectedProvider("lean")}
                        className={`p-6 rounded-2xl border text-center cursor-pointer transition-all ${
                          selectedProvider === "lean"
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                            : "bg-white hover:bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        <h4 className="font-black text-sm text-zinc-800">Lean Technologies</h4>
                        <p className="text-[10px] text-zinc-400 mt-2">البوابة الرائدة لربط البنوك في السعودية</p>
                      </div>
                      <div
                        onClick={() => setSelectedProvider("tarabut")}
                        className={`p-6 rounded-2xl border text-center cursor-pointer transition-all ${
                          selectedProvider === "tarabut"
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20"
                            : "bg-white hover:bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        <h4 className="font-black text-sm text-zinc-800">Tarabut Gateway</h4>
                        <p className="text-[10px] text-zinc-400 mt-2">الشبكة الأولى للمصرفية المفتوحة بالخليج</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConnectStep("bank")}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs rounded-xl mt-4"
                    >
                      التالي: اختيار البنك
                    </button>
                  </div>
                )}

                {connectStep === "bank" && (
                  <div className="space-y-4">
                    <p className="text-xs font-bold text-zinc-600">الرجاء تحديد البنك السعودي المراد سحب تغذيته المالية:</p>
                    <div className="grid grid-cols-2 gap-3 max-h-[180px] overflow-y-auto p-1">
                      {["Al Rajhi Bank", "SNB (الأهلي)", "Riyadh Bank", "SABB (ساب)", "Alinma Bank"].map((bank) => (
                        <div
                          key={bank}
                          onClick={() => setSelectedBankName(bank)}
                          className={`p-4 rounded-xl border text-center text-xs font-black cursor-pointer transition-colors ${
                            selectedBankName === bank ? "bg-emerald-50 border-emerald-500" : "bg-white hover:bg-zinc-50"
                          }`}
                        >
                          {bank}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => setConnectStep("provider")}
                        className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl"
                      >
                        السابق
                      </button>
                      <button
                        onClick={() => setConnectStep("credentials")}
                        className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs rounded-xl"
                      >
                        التالي: التفويض الآمن
                      </button>
                    </div>
                  </div>
                )}

                {connectStep === "credentials" && (
                  <div className="space-y-4">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-black text-emerald-650">
                        <Lock className="w-4 h-4" />
                        بوابة تفويض عملاء {selectedBankName} الآمنة
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        بموجب إطار المصرفية المفتوحة، سيتم تحويلك إلى نافذة تفويض مشفرة بالكامل. لا نقوم بتخزين بيانات دخولك المصرفية أبداً.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">رقم الحساب أو الآيبان الاختياري</label>
                      <input
                        type="text"
                        placeholder="SA808000000..."
                        value={accountNoInput}
                        onChange={(e) => setAccountNoInput(e.target.value)}
                        className="w-full p-3 border rounded-xl font-mono text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] text-zinc-400 font-black uppercase">الرصيد الافتتاحي الفعلي (SAR)</label>
                      <input
                        type="number"
                        value={initialBalance}
                        onChange={(e) => setInitialBalance(e.target.value)}
                        className="w-full p-3 border rounded-xl font-mono text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setConnectStep("bank")}
                        className="flex-1 py-3.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-xl"
                      >
                        السابق
                      </button>
                      <button
                        onClick={handleConnectBank}
                        disabled={isConnecting}
                        className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        {isConnecting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            جاري الاتصال الآمن...
                          </>
                        ) : (
                          "تأكيد وربط الحساب"
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {connectStep === "success" && (
                  <div className="text-center space-y-4 py-6">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h4 className="text-base font-black text-zinc-900">تم الربط المباشر مع {selectedBankName} بنجاح!</h4>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      تم جلب كشف حسابك والتفويض اللحظي تحت إشراف الهيئة المصرفية ومزود الخدمة {selectedProvider.toUpperCase()}. الحركات البنكية ستتدفق تلقائياً في دفتر الأستاذ العام بمعدل لحظي.
                    </p>
                    <button
                      onClick={() => setShowConnectModal(false)}
                      className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs rounded-xl"
                    >
                      بدء إدارة الحساب ومطابقة العمليات
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* MT940 / CAMT.053 File Upload Modal */}
        {showFileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-zinc-200 dark:border-zinc-800 space-y-5 text-right"
            >
              <div className="flex justify-between items-center border-b pb-4 dark:border-zinc-800">
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-500" />
                  استيراد وتحليل كشف الحساب البنكي (SWIFT MT940 / ISO CAMT.053)
                </h3>
                <button
                  onClick={() => setShowFileModal(false)}
                  className="text-zinc-400 hover:text-zinc-600 font-bold text-xs"
                >
                  إغلاق ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase">نوع الملف المصرفي</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFileTypeSelect("mt940")}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        fileTypeSelect === "mt940"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                    >
                      SWIFT MT940
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileTypeSelect("camt053")}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        fileTypeSelect === "camt053"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                    >
                      CAMT.053 (XML)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFileTypeSelect("csv")}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all ${
                        fileTypeSelect === "csv"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:border-zinc-700"
                      }`}
                    >
                      CSV / Excel
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-zinc-500 font-black uppercase">محتوى الكشف البنكي (ألصق النص أو اسحب الملف)</label>
                  <textarea
                    rows={7}
                    value={fileContentInput}
                    onChange={(e) => setFileContentInput(e.target.value)}
                    placeholder={
                      fileTypeSelect === "mt940"
                        ? ":20:STAT20260722\n:25:SA0380000000608010167519\n:28C:00001/001\n:60F:C240701SAR120000,00\n:61:2407220722C145000,00NTRFNONREF//REF123\n:86:تحصيل مستحقات مبيعات مدى"
                        : fileTypeSelect === "camt053"
                        ? "<camt.053.001.02>\n<Stmt>\n<Ntry>\n<Amt Ccy='SAR'>45000.00</Amt>\n<CdtDbtInd>CRDT</CdtDbtInd>\n<Ustrd>تحويل مالي من عميل - البنك الأهلي</Ustrd>\n</Ntry>\n</Stmt>"
                        : "التاريخ, البيان, المبلغ\n2026-07-22, تحصيل مستحقات, 45000\n2026-07-21, سداد الموردين, -12500"
                    }
                    className="w-full p-3 border rounded-xl font-mono text-xs text-right focus:ring-2 focus:ring-emerald-500 focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowFileModal(false)}
                    className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold text-xs rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleParseStatementFile}
                    disabled={isParsingFile}
                    className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-300 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"
                  >
                    {isParsingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري تحليل وتفريغ الملف...
                      </>
                    ) : (
                      "استيراد وتسوية الحركات"
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}