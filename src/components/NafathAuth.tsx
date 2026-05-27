import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Fingerprint, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUser } from '@/src/contexts/UserContext';
import { db } from '@/src/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export default function NafathAuth({ onVerified, className }: { onVerified?: () => void, className?: string }) {
  const { user, updateProfile } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'waiting' | 'success' | 'failed'>('idle');
  const [requestNumber, setRequestNumber] = useState('');

  const handleSuccess = async () => {
    try {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          verifiedAt: serverTimestamp(),
          nafathVerified: true
        });
        updateProfile({ verifiedAt: new Date().toISOString(), nafathVerified: true });
      }
      setStatus('success');
      if (onVerified) onVerified();
      setTimeout(() => setIsOpen(false), 2000);
    } catch (e) {
      console.error(e);
      setStatus('failed');
    }
  };

  const initiateNafath = () => {
    setIsOpen(true);
    setStatus('waiting');
    // Generate a random 2-digit number for Nafath app
    setRequestNumber(Math.floor(10 + Math.random() * 90).toString());

    // Mock Nafath delay (auto-success after 15 seconds if not clicked)
    setTimeout(() => {
      if (status === 'waiting') {
         // handleSuccess(); // Optionally auto-resolve, but let's leave it manual for test harness
      }
    }, 15000);
  };

  const isVerified = user?.verifiedAt || user?.nafathVerified;

  if (isVerified && !isOpen) {
    return (
      <div className={`flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-100 ${className}`}>
        <ShieldCheck className="w-4 h-4" />
        <span className="text-xs font-bold">موثق في النفاذ الوطني</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={initiateNafath}
        className={`flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-slate-800 transition-colors ${className}`}
      >
        <Fingerprint className="w-4 h-4 text-emerald-400" />
        المصادقة عبر نفاذ
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden"
              dir="rtl"
            >
              <div className="p-6 relative">
                {status === 'waiting' && (
                  <button onClick={() => setIsOpen(false)} className="absolute left-4 top-4 text-slate-400 hover:text-slate-600">
                    <X className="w-5 h-5" />
                  </button>
                )}
                
                <div className="flex flex-col items-center text-center space-y-4">
                  {status === 'waiting' && (
                    <>
                      <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center relative">
                         <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                         <img src="https://upload.wikimedia.org/wikipedia/ar/thumb/5/5f/Nafath_app_logo.svg/512px-Nafath_app_logo.svg.png" className="w-10 h-10 object-contain" alt="Nafath Logo" crossOrigin="anonymous" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                         {!document.querySelector('img[src*="Nafath_app_logo"]') && <Fingerprint className="w-8 h-8 text-emerald-600" />}
                      </div>
                      <h3 className="font-black text-xl text-slate-900">توثيق الهوية</h3>
                      <p className="text-sm font-medium text-slate-500">
                        الرجاء فتح تطبيق نفاذ واختيار الرقم التالي:
                      </p>
                      <div className="text-5xl font-black text-emerald-600 tracking-widest my-4">
                        {requestNumber}
                      </div>
                      <p className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                        بانتظار مصادقة الممثل القانوني...
                      </p>
                      
                      {/* TEST HARNESS BUTTONS */}
                      <div className="mt-8 pt-4 border-t border-slate-100 w-full flex flex-col gap-2">
                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Developer Test Harness</p>
                        <button onClick={handleSuccess} className="w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                          Simulate Success (Accept in App)
                        </button>
                        <button onClick={() => setStatus('failed')} className="w-full py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold border border-rose-100 hover:bg-rose-100 transition-colors">
                          Simulate Failure (Reject)
                        </button>
                      </div>
                    </>
                  )}
                  {status === 'success' && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h3 className="font-black text-xl text-slate-900">تمت المصادقة بنجاح</h3>
                      <p className="text-sm font-medium text-slate-500">تم توثيق هويتك إلكترونياً واعتماد التوقيع.</p>
                    </motion.div>
                  )}
                  {status === 'failed' && (
                    <div className="flex flex-col items-center text-rose-600">
                       <X className="w-10 h-10 mb-4" />
                       <h3 className="font-black text-xl">فشلت المصادقة</h3>
                       <button onClick={() => setIsOpen(false)} className="mt-4 px-4 py-2 bg-slate-100 text-slate-800 font-bold rounded-xl text-sm">إلغاء</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
