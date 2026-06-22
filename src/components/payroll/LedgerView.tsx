import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/src/lib/firebase';

export default function LedgerView({ runs }: { runs: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  
  // Transform runs into double-entry ledger format
  const ledgerEntries = useMemo(() => {
    let entries: any[] = [];
    runs.forEach(run => {
      const date = run.month ? `${run.month}-28` : new Date().toISOString().split('T')[0];
      
      // Debit: Salaries Expense
      entries.push({
        id: `${run.id}-exp`,
        date: date,
        accountCode: "5100",
        accountName: "مصروف أجور ورواتب (Salaries Expense)",
        description: `إثبات مستحقات رواتب شهر ${run.period}`,
        debit: run.totalGross,
        credit: 0,
        runId: run.id
      });
      
      // Credit: GOSI Liability
      const totalGosi = run.entries?.reduce((sum: number, e: any) => sum + (e.deductions || 0), 0) || (run.totalGross - run.totalNet);
      if (totalGosi > 0) {
        entries.push({
          id: `${run.id}-gosi-liab`,
          date: date,
          accountCode: "2150",
          accountName: "مستحقات مؤسسة التأمينات (GOSI Payable)",
          description: `اقتطاعات التأمينات شهر ${run.period}`,
          debit: 0,
          credit: totalGosi,
          runId: run.id
        });
      }

      // Credit: Salaries Payable / Bank account (Net Pay)
      entries.push({
        id: `${run.id}-pay`,
        date: date,
        accountCode: "2100",
        accountName: "رواتب وأجور مستحقة (Salaries Payable)",
        description: `الصافي المستحق للموظفين شهر ${run.period}`,
        debit: 0,
        credit: run.totalNet,
        runId: run.id
      });
    });
    
    // Sort by date descending
    entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return entries;
  }, [runs]);

  const filteredEntries = ledgerEntries.filter(e => 
    e.accountName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.accountCode.includes(searchQuery)
  );

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">سجل القيود المزدوجة التلقائي</h2>
          </div>
          <p className="text-zinc-400 text-sm font-medium">Auto-generated double-entry payroll ledger mapper.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10">
             <span className="text-[10px] text-zinc-400 font-bold block mb-1">إجمالي المدين (Debit)</span>
             <span className="text-xl font-black text-emerald-400">{totalDebit.toLocaleString()}</span>
          </div>
          <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/10">
             <span className="text-[10px] text-zinc-400 font-bold block mb-1">إجمالي الدائن (Credit)</span>
             <span className="text-xl font-black text-rose-400">{totalCredit.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-sm p-6 overflow-hidden flex flex-col h-full min-h-[500px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-1.5 w-full md:w-[350px] relative">
            <Search className="w-4 h-4 text-zinc-400 absolute right-3 pointer-events-none" />
            <input 
              type="text"
              placeholder="البحث برقم الحساب أو الوصف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 text-sm pr-9 pl-4 py-3 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none font-bold"
            />
          </div>
          <button className="flex items-center gap-2 bg-zinc-100 text-zinc-600 px-4 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition">
            <Filter className="w-4 h-4" /> تصفية
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b-2 border-zinc-100 text-zinc-500 font-black">
                <th className="pb-3 px-4">التاريخ</th>
                <th className="pb-3 px-4">رقم الحساب</th>
                <th className="pb-3 px-4 w-1/3">اسم الحساب والبيان</th>
                <th className="pb-3 px-4 text-left">مدين (Debit)</th>
                <th className="pb-3 px-4 text-left">دائن (Credit)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                  <td className="py-4 px-4 text-zinc-600">{e.date}</td>
                  <td className="py-4 px-4"><span className="bg-zinc-100 text-zinc-600 px-2 py-1 rounded font-mono text-xs">{e.accountCode}</span></td>
                  <td className="py-4 px-4">
                    <div className="text-zinc-900 font-bold">{e.accountName}</div>
                    <div className="text-xs text-zinc-500 mt-1">{e.description}</div>
                  </td>
                  <td className="py-4 px-4 text-left font-mono">
                    {e.debit > 0 ? (
                      <span className="text-emerald-600 font-black flex items-center justify-end gap-1">
                        {e.debit.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-4 px-4 text-left font-mono">
                    {e.credit > 0 ? (
                      <span className="text-rose-600 font-black flex items-center justify-end gap-1">
                        {e.credit.toLocaleString()}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-zinc-400 font-bold">لا يوجد قيود محاسبية مطابقة.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
