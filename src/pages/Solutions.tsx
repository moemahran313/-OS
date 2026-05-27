import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Store, HardHat, Briefcase, CarFront, ChevronLeft } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Solutions() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30" dir="rtl">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-zinc-200">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Logo theme="light" />
          <div className="flex items-center gap-4">
             <Link to="/contact" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">تواصل معنا</Link>
             <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20">ابدأ أتمتة عملك</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
              حلول مصممة <span className="text-primary">لواقع أعمالك</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
              نحن لا نقدم وعوداً تقنية معقدة. نحن نمنحك نظاماً يفهم كيف تدير صالونك، متجرك، أو مكتبك الاستشاري في السوق المحلي.
            </p>
          </motion.div>

          <div className="space-y-12">
             {/* Retail */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-12"
             >
                <div className="md:w-1/3 bg-emerald-50 rounded-[2rem] p-8 flex items-center justify-center shrink-0">
                   <Store className="w-32 h-32 text-emerald-500" />
                </div>
                <div>
                   <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                      <span className="bg-emerald-100 text-emerald-600 px-3 py-1 rounded-lg text-sm">متاجر النقل والتجزئة</span> 
                      متجرك التجاري
                   </h2>
                   <p className="text-lg text-zinc-600 font-medium leading-relaxed mb-6">
                      العميل يطلب عبر الواتساب؟ استخدم ربط نقاط البيع (POS) وإدارة الطلبات السريعة. حوّل طلب الواتساب إلى فاتورة مبيعات مدفوعة في ثوانٍ، وتتبع مخزونك بدقة تامة.
                   </p>
                   <ul className="space-y-2 font-bold text-zinc-500 mb-8">
                      <li>• استقبال طلبات واتساب آلياً</li>
                      <li>• فواتير ضريبية مبسطة فورية</li>
                      <li>• ربط سجل العملاء بالطلب</li>
                   </ul>
                   <Link to="/app" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                      جرب الباقة التجارية <ChevronLeft className="w-5 h-5" />
                   </Link>
                </div>
             </motion.div>

             {/* Construction */}
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm flex flex-col md:flex-row-reverse items-center gap-12"
             >
                <div className="md:w-1/3 bg-amber-50 rounded-[2rem] p-8 flex items-center justify-center shrink-0">
                   <HardHat className="w-32 h-32 text-amber-500" />
                </div>
                <div className="text-right">
                   <h2 className="text-3xl font-black mb-4 flex items-center gap-3 flex-row-reverse justify-end">
                      شركات المقاولات والعقار
                      <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg text-sm mr-auto">مقاولات وبناء</span> 
                   </h2>
                   <p className="text-lg text-zinc-600 font-medium leading-relaxed mb-6">
                      إدارة المقاولات تعني مستخلصات، دفعات مجدولة، وإدارة موردين وعمالة. تحكم بمدفوعات المشاريع، وأصدر فواتير الدفعات (Milestones) بسهولة مع نظام يحمي أجور عمالك (WPS).
                   </p>
                   <ul className="space-y-2 font-bold text-zinc-500 mb-8">
                      <li>• فواتير دفعات ومستخلصات مجدولة</li>
                      <li>• تتبع وثائق ومطالبات الموردين</li>
                      <li>• نظام رواتب وعمالة مدمج</li>
                   </ul>
                   <Link to="/app" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                      نموذج شركات البناء <ChevronLeft className="w-5 h-5" />
                   </Link>
                </div>
             </motion.div>

             {/* Consultants */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center gap-12"
             >
                <div className="md:w-1/3 bg-blue-50 rounded-[2rem] p-8 flex items-center justify-center shrink-0">
                   <Briefcase className="w-32 h-32 text-blue-500" />
                </div>
                <div>
                   <h2 className="text-3xl font-black mb-4 flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-sm">وكالات ومكاتب</span> 
                      مكاتب الاستشارات والتسويق
                   </h2>
                   <p className="text-lg text-zinc-600 font-medium leading-relaxed mb-6">
                      رحلة العميل لديك تبدأ باجتماع وتمر بعرض سعر ثم الموافقة. أدر خط الأنابيب (Pipeline) الخاص بمبيعاتك، وحوّل عروض الأسعار إلى فواتير (Retainer) متكررة بكل سلاسة واحترافية.
                   </p>
                   <ul className="space-y-2 font-bold text-zinc-500 mb-8">
                      <li>• إدارة خط سير المبيعات (CRM Pipelines)</li>
                      <li>• عروض أسعار وفواتير متكررة للعملاء</li>
                      <li>• تقارير إيرادات العقود الاحترافية</li>
                   </ul>
                   <Link to="/app" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                      تحسين وكالتي <ChevronLeft className="w-5 h-5" />
                   </Link>
                </div>
             </motion.div>

             {/* Services */}
             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-[2.5rem] p-10 border border-zinc-200 shadow-sm flex flex-col md:flex-row-reverse items-center gap-12"
             >
                <div className="md:w-1/3 bg-rose-50 rounded-[2rem] p-8 flex items-center justify-center shrink-0">
                   <CarFront className="w-32 h-32 text-rose-500" />
                </div>
                <div className="text-right">
                   <h2 className="text-3xl font-black mb-4 flex items-center gap-3 flex-row-reverse justify-end">
                      الخدمات والصيانة الصالونات
                      <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-lg text-sm mr-auto">خدمات ميدانية</span> 
                   </h2>
                   <p className="text-lg text-zinc-600 font-medium leading-relaxed mb-6">
                      حجز موعد عبر الواتساب &rarr; توليد فاتورة &rarr; دفع برابط إلكتروني. من مراكز صيانة السيارات إلى الصالونات، قدم خدمة سريعة بدون انتظار العميل عند نقطة المحاسبة.
                   </p>
                   <ul className="space-y-2 font-bold text-zinc-500 mb-8">
                      <li>• أتمتة حجوزات واتساب</li>
                      <li>• روابط استخراج فواتير سريعة للعملاء</li>
                      <li>• إدارة رواتب وعمولات الموظفين</li>
                   </ul>
                   <Link to="/app" className="inline-flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-zinc-800 transition-colors">
                      تطوير مركز خدماتي <ChevronLeft className="w-5 h-5" />
                   </Link>
                </div>
             </motion.div>
          </div>
        </div>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white mt-auto" dir="rtl">
        <p className="text-zinc-600 text-sm font-medium">© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
