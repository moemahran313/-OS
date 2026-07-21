import React, { useState } from "react";
import { motion } from "motion/react";
import { Calculator, DollarSign, TrendingUp, Sparkles, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const RoiCalculatorSection = () => {
  const [employees, setEmployees] = useState<number>(12);
  const [invoices, setInvoices] = useState<number>(150);
  const [currentSpend, setCurrentSpend] = useState<number>(3500); // monthly SAR spend on various software

  // Calculations based on typical Saudi enterprise software fragmentation:
  // - Accounting (Zoho/Qoyod): ~ 300-600 SAR/mo
  // - CRM (Salesforce/HubSpot): ~ 800-1500 SAR/mo
  // - HR & WPS payroll addon: ~ 400-800 SAR/mo
  // - WhatsApp Cloud API gateway commission: ~ 300-700 SAR/mo
  // - Manual ZATCA filing & accountant time wasted (~ 10 hrs/mo @ 150 SAR/hr): ~ 1,500 SAR/mo
  const traditionalMonthlyCost = Math.round(
    currentSpend + (employees * 45) + (invoices * 1.8) + 1200
  );
  const mudarijMonthlyCost = 0; // Included in free tier or flat 299 SAR for unlimited scale
  const monthlySavings = Math.max(0, traditionalMonthlyCost - 299);
  const annualSavings = monthlySavings * 12;
  const hoursSavedPerMonth = Math.round((invoices * 0.12) + (employees * 0.8));

  return (
    <section id="roi-calculator" className="py-28 bg-zinc-950 text-white relative overflow-hidden" dir="rtl">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide mb-6">
            <Calculator className="w-4 h-4" />
            <span>حاسبة العائد على الاستثمار والوفر المالي الشفاف</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            كم تحرق شركتك سنوياً في برمجيات مشتتة؟ <br />
            <span className="text-emerald-400">احسب وفرك الصافي بالريال السعودي</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium mt-4 leading-relaxed">
            وفقاً لأسلوب "ديفيد أوجلفي" في الشفافية المطلقة: لا نطلب منك تصديق الوعود، بل نحسب بالأرقام الدقيقة كم ستوفر بمجرد توحيد الفواتير، والرواتب، والـ CRM في منصة واحدة.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Sliders */}
          <div className="lg:col-span-7 bg-white/[0.03] border border-white/10 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl space-y-8">
            {/* Slider 1: Employees */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-extrabold text-zinc-200">عدد الموظفين بمسير الرواتب (WPS):</label>
                <span className="text-xl font-black text-emerald-400 font-mono bg-emerald-500/10 px-4 py-1 rounded-xl border border-emerald-500/20">
                  {employees} موظف
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={200}
                value={employees}
                onChange={(e) => setEmployees(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                <span>1 موظف</span>
                <span>100 موظف</span>
                <span>200+ موظف</span>
              </div>
            </div>

            {/* Slider 2: Monthly Invoices */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-extrabold text-zinc-200">عدد الفواتير الضريبية (ZATCA) شهرياً:</label>
                <span className="text-xl font-black text-blue-400 font-mono bg-blue-500/10 px-4 py-1 rounded-xl border border-blue-500/20">
                  {invoices.toLocaleString()} فاتورة
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={3000}
                step={10}
                value={invoices}
                onChange={(e) => setInvoices(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                <span>10 فواتير</span>
                <span>1,500 فاتورة</span>
                <span>3,000+ فاتورة</span>
              </div>
            </div>

            {/* Slider 3: Current Software Spend */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <label className="font-extrabold text-zinc-200">مجموع اشتراكات البرامج الحالية (قيود/زوهو/واتساب/سحابة):</label>
                <span className="text-xl font-black text-amber-400 font-mono bg-amber-500/10 px-4 py-1 rounded-xl border border-amber-500/20">
                  {currentSpend.toLocaleString()} ر.س / شهرياً
                </span>
              </div>
              <input
                type="range"
                min={500}
                max={20000}
                step={250}
                value={currentSpend}
                onChange={(e) => setCurrentSpend(Number(e.target.value))}
                className="w-full h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-bold">
                <span>500 ر.س</span>
                <span>10,000 ر.س</span>
                <span>20,000+ ر.س</span>
              </div>
            </div>

            {/* Micro Breakdown Note */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-zinc-400 space-y-1.5 leading-relaxed">
              <div className="flex items-center gap-2 text-zinc-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>كيف نحسب هذا الوفر؟</span>
              </div>
              <p>
                يشمل الحساب تكاليف الاشتراكات المنفصلة (Zoho Books + Salesforce + بوابات الواتساب + إدخال ملفات SIF اليدوية في مدد) بالإضافة لساعات العمل المهدورة في الإدخال المزدوج.
              </p>
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="lg:col-span-5 bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-emerald-500/40 p-8 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(16,185,129,0.25)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">المجموع النهائي للوفر</span>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-full uppercase border border-emerald-500/30">
                  نتيجة حقيقية 100%
                </span>
              </div>

              <div>
                <p className="text-xs font-bold text-zinc-400 mb-1">الوفر المالي السنوي المتوقع:</p>
                <div className="text-5xl md:text-6xl font-black text-emerald-400 tracking-tight font-mono">
                  {annualSavings.toLocaleString()}{" "}
                  <span className="text-lg text-white font-sans">ريال/سنة</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/10">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">الوقت المحرَّر شهرياً:</span>
                  <span className="text-2xl font-black text-white font-mono">{hoursSavedPerMonth} ساعة</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">بدون إدخال يدوي</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-zinc-400 block mb-1">تكلفة مدارج BizOS:</span>
                  <span className="text-2xl font-black text-emerald-400 font-mono">299 ر.س</span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">أو مجاناً للبدايات</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>إلغاء 5 اشتراكات برمجية مختلفة فوراً</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تجنب غرامات عدم الامتثال لـ ZATCA ونظام مدد</span>
                </div>
              </div>

              <Link
                to="/app"
                onClick={() => trackLandingEvent("احسب وفرك المالي (حاسبة ROI)", "ROI_CALCULATOR_CTA")}
                className="w-full py-4 bg-gradient-to-r from-emerald-400 to-teal-500 text-white font-black rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>احصل على هذا الوفر المالي الآن</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoiCalculatorSection;
