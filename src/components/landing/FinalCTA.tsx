import React from "react";
import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export const FinalCTA = () => {
  return (
    <section
      className="py-32 relative overflow-hidden bg-zinc-950 text-white text-center"
      dir="rtl"
    >
      <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
          ابدأ في تحويل عملك اليوم.
        </h2>
        <p className="text-xl text-zinc-400 mb-12 font-medium">
          انضم لآلاف الشركات الخليجية التي تعتمد على مدارج كنظام تشغيل رقمي موحد وموثوق.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/app"
            className="px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            ابدأ تجربتك المجانية
          </Link>
          <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg">
            <Bot className="w-6 h-6" /> اسأل الذكاء الاصطناعي
          </button>
        </div>
      </div>
    </section>
  );
};
export default FinalCTA;
