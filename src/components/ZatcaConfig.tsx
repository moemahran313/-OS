import React, { useState } from "react";
import { motion } from "motion/react";
import { KeyRound, ShieldCheck, Download, Server, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";

export function ZatcaConfig() {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [csrGenerated, setCsrGenerated] = useState(false);
  const [keys, setKeys] = useState<{ privateKey: string; csr: string } | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setKeys({
        privateKey: "-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIN2w/P2... \n-----END EC PRIVATE KEY-----",
        csr: "-----BEGIN CERTIFICATE REQUEST-----\nMIIB... \n-----END CERTIFICATE REQUEST-----",
      });
      setCsrGenerated(true);
      setIsGenerating(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-zinc-900">إعداد التوافق مع ZATCA - المرحلة الثانية</h2>
          <p className="text-zinc-500 font-bold mt-1">توليد مفاتيح التشفير وطلب توقيع الشهادة (CSR) لمنصة هيئة الزكاة</p>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className={`flex-1 p-4 rounded-2xl border-2 transition-all ${step >= 1 ? "border-primary bg-primary/5" : "border-zinc-100"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"}`}>1</div>
            <h4 className={`font-black ${step >= 1 ? "text-primary" : "text-zinc-500"}`}>توليد المفاتيح (CSR)</h4>
          </div>
        </div>
        <div className={`flex-1 p-4 rounded-2xl border-2 transition-all ${step >= 2 ? "border-primary bg-primary/5" : "border-zinc-100"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"}`}>2</div>
            <h4 className={`font-black ${step >= 2 ? "text-primary" : "text-zinc-500"}`}>تحميل الشهادات</h4>
          </div>
        </div>
        <div className={`flex-1 p-4 rounded-2xl border-2 transition-all ${step >= 3 ? "border-primary bg-primary/5" : "border-zinc-100"}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-primary text-white" : "bg-zinc-100 text-zinc-400"}`}>3</div>
            <h4 className={`font-black ${step >= 3 ? "text-primary" : "text-zinc-500"}`}>التأهيل (Onboarding)</h4>
          </div>
        </div>
      </div>

      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900">
            <h4 className="font-black mb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              توليد المفتاح الخاص و CSR
            </h4>
            <p className="text-sm font-medium opacity-90 leading-relaxed">
              ستقوم هذه العملية بإنشاء مفتاح تشفير خاص (Private Key) متوافق مع معايير ECDSA، بالإضافة إلى طلب توقيع شهادة (CSR) يحتوي على بيانات المنشأة المطلوبة من ZATCA (الرقم الضريبي، العنوان، اسم المنشأة).
            </p>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-zinc-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                جاري توليد المفاتيح الآمنة...
              </>
            ) : (
              <>
                <Server className="w-5 h-5" />
                توليد CSR و Private Key
              </>
            )}
          </button>
        </motion.div>
      )}

      {step === 2 && keys && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-emerald-900 mb-6 flex items-start gap-4">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black mb-1">تم التوليد بنجاح</h4>
              <p className="text-sm font-bold opacity-90">احتفظ بالمفتاح الخاص في مكان آمن، ولا تقم بمشاركته مع أي جهة. سيتم استخدام الـ CSR في الخطوة القادمة عبر منصة فاتورة.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                <span className="font-black text-sm text-zinc-700">Certificate Signing Request (CSR)</span>
                <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                  <Download className="w-3 h-3" /> تحميل .csr
                </button>
              </div>
              <pre className="p-4 text-[10px] font-mono text-zinc-600 overflow-x-auto bg-zinc-50/50 flex-1">
                {keys.csr}
              </pre>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden flex flex-col">
              <div className="bg-zinc-100 px-4 py-3 border-b border-zinc-200 flex items-center justify-between">
                <span className="font-black text-sm text-zinc-700">Private Key (ECDSA)</span>
                <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
                  <Download className="w-3 h-3" /> تحميل .pem
                </button>
              </div>
              <pre className="p-4 text-[10px] font-mono text-zinc-600 overflow-x-auto bg-zinc-50/50 flex-1">
                {keys.privateKey}
              </pre>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100">
            <button 
              onClick={() => setStep(3)}
              className="bg-primary text-white px-8 py-3 rounded-xl font-black shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              متابعة إلى خطوة التأهيل
            </button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-2xl">
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4">
            <h4 className="font-black text-zinc-900">تأهيل الجهاز الكربتوجرافي (CSID)</h4>
            <p className="text-sm font-bold text-zinc-600 leading-relaxed">
              قم بالدخول إلى منصة "فاتورة" التابعة لهيئة الزكاة والضريبة والجمارك (ZATCA)، وقم برفع ملف الـ CSR الذي تم توليده في الخطوة السابقة. ستزودك المنصة بكلمة مرور (OTP).
            </p>
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-400 uppercase">رمز OTP من منصة فاتورة</label>
              <input 
                type="text" 
                placeholder="أدخل الـ OTP المكون من 6 أرقام" 
                className="w-full px-4 py-3 bg-white border border-zinc-200 rounded-xl font-mono text-center tracking-[0.5em] text-lg font-bold focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
          </div>
          <button 
            onClick={() => {
              toast.success("تم الانتهاء من عملية التأهيل بنجاح وإصدار CSID");
              setStep(1);
            }}
            className="w-full sm:w-auto bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all"
          >
            إتمام الربط والتأهيل
          </button>
        </motion.div>
      )}
    </div>
  );
}
