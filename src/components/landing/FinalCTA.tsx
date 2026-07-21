import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, ShieldCheck, Sparkles, Zap, Lock } from "lucide-react";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const FinalCTA = () => {
  return (
    <section className="py-28 relative overflow-hidden bg-zinc-950 text-white text-center" dir="rtl">
      {/* Dynamic Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-emerald-500/15 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-b from-zinc-900/90 to-zinc-950 border-2 border-emerald-500/40 p-10 md:p-16 rounded-[3rem] shadow-[0_30px_80px_-20px_rgba(16,185,129,0.2)] relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide mb-8">
            <Sparkles className="w-4 h-4" />
            <span>ضمان أوجلفي: تجربة بلا مخاطر أو التزامات</span>
          </div>

          <h2 className="text-4xl md:text-7xl font-black tracking-tight mb-6 text-white leading-tight">
            حول منشأتك إلى نظام تشغيل ذكي <br />
            <span className="text-emerald-400">في أقل من 60 ثانية من الآن</span>
          </h2>

          <p className="text-lg md:text-2xl text-zinc-300 font-medium mb-10 max-w-3xl mx-auto leading-relaxed">
            اقضِ على الفوضى الإدارية والرسوم المشتتة. أصدر أول فاتورة ضريبية معتمدة من ZATCA وسلّم مسير الرواتب بدون أي رسوم مخفية.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-5 mb-10">
            <Link
              to="/app"
              onClick={() => trackLandingEvent("ابدأ مجاناً الآن (CTA النهائي)", "FINAL_CTA_CLICK")}
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black rounded-2xl text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_10px_35px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
            >
              <span>ابدأ استخدام مدارج مجاناً فوراً</span>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-wrap justify-center items-center gap-6 md:gap-10 text-xs text-zinc-400 font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>إعداد فوري خلال 60 ثانية</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>بدون بطاقة ائتمانية</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>استعادة ونقل البيانات مجاناً</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>معتمد ZATCA Phase 2</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
