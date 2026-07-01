import { X, History, Lock, Search } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

interface AuditEntry {
  action: string;
  timestamp: string;
  note?: string;
  user?: string;
  data?: any;
}

interface PayrollAuditProps {
  run: any;
  onClose: () => void;
}

export default function PayrollAudit({ run, onClose }: PayrollAuditProps) {
  if (!run) return null;
  const logs: AuditEntry[] = run.logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div
          className="p-8 pb-6 border-b border-zinc-100 flex justify-between items-start bg-zinc-50"
          dir="rtl"
        >
          <div>
            <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              سجل التدقيق (Audit)
            </h2>
            <p className="text-sm font-medium text-zinc-500 mt-1">
              متابعة إجراءات مسير الرواتب {run.period} وتواريخ الإقفال.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-400 hover:text-zinc-600 shadow-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto" dir="rtl">
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-400 font-bold border-2 border-dashed rounded-[2rem] border-zinc-200">
              <Search className="w-10 h-10 mx-auto mb-4 opacity-50" />
              لا توجد سجلات تدقيق متاحة لهذا المسير.
            </div>
          ) : (
            <div className="space-y-6 relative before:absolute before:inset-y-0 before:right-[15px] before:w-[2px] before:bg-zinc-100 p-2">
              {logs.map((log, idx) => (
                <div key={idx} className="relative rtl:pl-0 rtl:pr-10 text-right">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 text-slate-500 border-4 border-white flex items-center justify-center shadow-sm">
                    {log.action.toLowerCase().includes("lock") ||
                    log.action.toLowerCase().includes("إقفال") ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <History className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="font-black text-sm text-zinc-900">{log.action}</span>
                      <span
                        className="text-[10px] text-zinc-400 font-bold whitespace-nowrap"
                        dir="ltr"
                      >
                        {new Date(log.timestamp).toLocaleString("ar-SA")}
                      </span>
                    </div>
                    {log.note && (
                      <p className="text-xs text-zinc-500 font-medium mt-2 leading-relaxed">
                        {log.note}
                      </p>
                    )}
                    {log.user && (
                      <p className="text-[10px] text-slate-400 font-bold mt-2 pt-2 border-t border-zinc-200 inline-block w-full">
                        المستخدم: {log.user}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
