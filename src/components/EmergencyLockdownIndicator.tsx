import React, { useState, useEffect } from 'react';
import { AlertOctagon, ArrowLeft, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function EmergencyLockdownIndicator({ navigateToPayroll }: { navigateToPayroll: () => void }) {
  const [isLockdown, setIsLockdown] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const checkLockdown = () => {
      const lockFlag = localStorage.getItem('emergency_lockdown');
      setIsLockdown(lockFlag === 'true');
      
      const now = new Date();
      // Lockout limit is 5th of every month
      let nextLockoutDate = new Date(now.getFullYear(), now.getMonth(), 5);
      if (now > nextLockoutDate) {
        nextLockoutDate = new Date(now.getFullYear(), now.getMonth() + 1, 5);
      }
      
      const diffTime = nextLockoutDate.getTime() - now.getTime();
      const flexDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setDaysRemaining(flexDays);
      
      const prevLockout = new Date(nextLockoutDate);
      prevLockout.setMonth(prevLockout.getMonth() - 1);
      const cycleTotal = Math.ceil((nextLockoutDate.getTime() - prevLockout.getTime()) / (1000 * 60 * 60 * 24));
      
      const p = Math.max(0, Math.min(100, ((cycleTotal - flexDays) / cycleTotal) * 100));
      setProgressPercent(p);
    };

    checkLockdown();

    window.addEventListener('storage', checkLockdown);
    const interval = setInterval(checkLockdown, 2000);
    
    return () => {
      window.removeEventListener('storage', checkLockdown);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLockdown ? (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-rose-50 border-2 border-rose-200 p-4 rounded-2xl mb-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 w-full"
          dir="rtl"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center animate-pulse shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-rose-900">إنذار: إقفال طارئ للنظام</h3>
              <p className="text-xs font-bold text-rose-700 mt-1">تم تفعيل الإقفال الآلي لمسيرات الرواتب. يرجى المراجعة الفورية.</p>
            </div>
          </div>
          <button 
            onClick={navigateToPayroll}
            className="flex items-center justify-center gap-2 bg-rose-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-rose-700 transition shrink-0"
          >
            مراجعة المسيرات <ArrowLeft className="w-4 h-4" />
          </button>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-zinc-200 p-5 rounded-3xl mb-6 shadow-sm flex flex-col gap-4 w-full"
          dir="rtl"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <h3 className="text-sm font-black text-zinc-900">عَدّاد إقفال مسير الرواتب (مُدَد)</h3>
                 <p className="text-xs font-bold text-zinc-500 mt-1">متبقي {daysRemaining} أيام على الإقفال الآلي القادم</p>
               </div>
             </div>
             
             <div className="flex-1 max-w-sm">
                <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-2">
                  <span>الآن</span>
                  <span>موعد الإقفال</span>
                </div>
                <div className="h-2.5 bg-zinc-100 rounded-full overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${daysRemaining < 3 ? 'bg-rose-500' : daysRemaining < 7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  />
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
