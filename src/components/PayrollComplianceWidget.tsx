import React, { useMemo, useEffect, useState } from "react";
import { ShieldCheck, AlertOctagon, HelpCircle, FileCheck, Phone, Check } from "lucide-react";
import { toast } from "sonner";

export default function PayrollComplianceWidget({ runs }: { runs: any[] }) {
  const [autoSent, setAutoSent] = useState(false);

  const complianceData = useMemo(() => {
    // Determine the last completed month
    const now = new Date();
    // last month
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonth.toISOString().slice(0, 7); // e.g., 2026-04

    // Check if there is a payroll run for last month
    const lastRun = runs.find((r) => r.period === lastMonthStr);

    // Countdown is measured from the end of last month
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const deadline = new Date(endOfLastMonth);
    deadline.setDate(deadline.getDate() + 30);

    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const isGenerated = lastRun ? lastRun.mudadSifGenerated || lastRun.wpsGenerated : false;

    return {
      period: lastMonthStr,
      daysLeft,
      hasRun: !!lastRun,
      isGenerated: !!isGenerated,
      isLockdown: !isGenerated && daysLeft <= 0,
    };
  }, [runs]);

  const handleWhatsAppCFO = () => {
    toast.success("تم إرسال تنبيه واتساب آلي للمدير المالي (CFO)");
  };

  useEffect(() => {
    if (complianceData.isLockdown) {
      const lockKey = `lockdown_sent_${complianceData.period}`;
      if (!localStorage.getItem(lockKey)) {
        localStorage.setItem(lockKey, "true");
        // trigger WhatsApp and Lockdown automatically
        handleWhatsAppCFO();
        // and show toast indicating Emergency Lockdown activated
        toast.error(
          `تم تفعيل وضع Emergency Lockdown لأنظمة الرواتب بسبب تجاوز مهلة WPS للمسير ${complianceData.period}`,
          {
            duration: 10000,
          }
        );
      }
    }
  }, [complianceData.isLockdown, complianceData.period]);

  if (!complianceData.period) return null;

  return (
    <div
      className={`p-6 rounded-3xl border shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all ${complianceData.isLockdown ? "bg-rose-50 border-rose-200" : "bg-white border-zinc-100"}`}
    >
      {complianceData.isLockdown && (
        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500 animate-pulse" />
      )}

      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${complianceData.isLockdown ? "bg-rose-100 text-rose-600" : "bg-emerald-50 text-emerald-600"}`}
          >
            {complianceData.isLockdown ? (
              <AlertOctagon className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-black text-zinc-900">مراقب امتثال (WPS)</h3>
            <p className="text-xs font-bold text-zinc-500">لشهر {complianceData.period}</p>
          </div>
        </div>

        <div className="text-left shrink-0 max-w-[150px] w-full">
          {complianceData.isGenerated ? (
            <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-bold">
              <Check className="w-3 h-3" /> متوافق وتم الرفع
            </span>
          ) : (
            <div className="flex flex-col gap-1.5 items-end">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold ${complianceData.isLockdown ? "bg-rose-500 text-white animate-pulse" : "bg-amber-100 text-amber-700"}`}
              >
                {complianceData.isLockdown
                  ? "متأخر (إيقاف خدمات)"
                  : `متبقي ${complianceData.daysLeft} يوم`}
              </span>
              {!complianceData.isLockdown && (
                <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden flex justify-end">
                  <div
                    className={`h-full transition-all duration-500 ${
                      complianceData.daysLeft > 15
                        ? "bg-emerald-500"
                        : complianceData.daysLeft > 5
                          ? "bg-amber-400"
                          : "bg-rose-500 text-white"
                    }`}
                    style={{
                      width: `${Math.max(0, Math.min(100, (complianceData.daysLeft / 30) * 100))}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {!complianceData.isGenerated && (
        <>
          {complianceData.isLockdown ? (
            <div className="mt-2 p-4 bg-rose-100 rounded-xl border border-rose-200">
              <h4 className="font-bold text-rose-800 text-sm mb-2 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4" /> طوارئ: خطر إيقاف الخدمات من مدد
              </h4>
              <p className="text-xs font-medium text-rose-700 mb-4 leading-relaxed">
                تم تجاوز المدة النظامية (30 يوم) لرفع مسير شهر {complianceData.period}. قد تواجه
                الشركة تجميداً للخدمات الحكومية.
              </p>
              <button
                onClick={handleWhatsAppCFO}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4" /> إرسال واتساب آلي (CFO)
              </button>
            </div>
          ) : (
            <div className="mt-2 bg-zinc-50 p-4 rounded-xl">
              <h4 className="font-bold text-zinc-900 text-sm mb-3">قائمة تدقيق SIF:</h4>
              <ul className="space-y-2 text-xs font-medium text-zinc-600">
                <li className="flex items-center gap-2">
                  {complianceData.hasRun ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <HelpCircle className="w-4 h-4 text-amber-500" />
                  )}
                  اعتماد مسير الرواتب للشهر الماضي
                </li>
                <li className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  توليد ملف SIF (من صفحة الرواتب)
                </li>
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
