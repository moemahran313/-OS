import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Receipt, CreditCard, Clock, Link2, FileText, CheckCircle2 } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function InvoicingFeature() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30" dir="rtl">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-zinc-950/90 border-b border-white/10 text-white">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Logo theme="dark" />
          <div className="flex items-center gap-4">
             <Link to="/app" className="px-4 py-2 bg-white text-zinc-950 text-sm font-black rounded-lg hover:bg-zinc-100 transition-all shadow-md shadow-white/10">جرب منشئ الفواتير مجاناً</Link>
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
               <h1 className="text-5xl md:text-7xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
                  أنشئ فاتورة ضريبية في <span className="bg-primary text-white px-4 py-2 rounded-2xl rotate-2 inline-block">30 ثانية</span>
               </h1>
               <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
                  من صفقات الواتساب إلى فواتير ZATCA معتمدة وروابط دفع فورية. أسرع دورة مبيعات يمكن أن تتخيلها.
               </p>
               
               <div className="mt-10">
                  <Link to="/app" className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-black text-lg hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xl">
                     ابدأ إنشاء فاتورتك الأولى مجاناً
                  </Link>
               </div>
            </motion.div>

            <div className="bg-zinc-900 rounded-[2.5rem] p-10 md:p-16 text-white mb-20 relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-zinc-900 to-zinc-900" />
               <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div>
                     <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">السر في الأتمتة</h2>
                     <p className="text-zinc-400 font-medium text-lg leading-relaxed mb-8">
                        لا داعي لإدخال أسماء العملاء أو الأرقام الضريبية في كل مرة يدوياً. النظام يسحب بيانات العميل، يحسب ضريبة القيمة المضافة، ويُصدر رابط الدفع آلياً (Tap/Stripe).
                     </p>
                     <ul className="space-y-4 font-bold text-zinc-300">
                        <li className="flex gap-3"><CheckCircle2 className="text-primary w-6 h-6" /> امتثال تام 100% (المرحلة الثانية ZATCA)</li>
                        <li className="flex gap-3"><CheckCircle2 className="text-primary w-6 h-6" /> قوالب احترافية تعكس هويتك البصرية</li>
                        <li className="flex gap-3"><CheckCircle2 className="text-primary w-6 h-6" /> روابط سداد ذكية Mada, Visa, ApplePay</li>
                     </ul>
                  </div>
                  <div className="bg-zinc-950 p-6 rounded-3xl border border-white/10 shadow-2xl relative">
                     <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-4">
                        <div className="font-bold text-lg">فاتورة ضريبية #1024</div>
                        <div className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">بانتظار الدفع</div>
                     </div>
                     <div className="space-y-3 mb-6 opacity-70">
                        <div className="h-4 bg-white/10 rounded w-1/2" />
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                     </div>
                     <div className="flex justify-between items-end">
                        <div className="text-sm font-bold text-zinc-400">الإجمالي المستحق</div>
                        <div className="text-3xl font-black text-primary">5,400 ر.س</div>
                     </div>
                     <button className="w-full mt-6 bg-white text-zinc-950 py-3 rounded-xl font-black text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                        <Link2 className="w-4 h-4" /> نسخ رابط الدفع للعميل
                     </button>
                  </div>
               </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[2rem] border border-zinc-200">
                  <Receipt className="w-10 h-10 text-emerald-500 mb-6" />
                  <h3 className="font-black text-xl mb-3">حفظ كمسودة أو قالب مستمر</h3>
                  <p className="text-zinc-500 text-sm font-medium">لو كان لديك خدمة تستخدمها باستمرار، حفظها في دليل المنتجات لإنزاله في الفواتير بضغطة زر واحدة.</p>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-zinc-200">
                  <CreditCard className="w-10 h-10 text-blue-500 mb-6" />
                  <h3 className="font-black text-xl mb-3">تسوية تلقائية للمدفوعات</h3>
                  <p className="text-zinc-500 text-sm font-medium">عندما يدفع العميل عبر الرابط، تتغير حالة الفاتورة تلقائياً إلى "مدفوعة" وتحدث إيرادات الشركة.</p>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-zinc-200">
                  <FileText className="w-10 h-10 text-amber-500 mb-6" />
                  <h3 className="font-black text-xl mb-3">دعم عروض الأسعار</h3>
                  <p className="text-zinc-500 text-sm font-medium">تحويل عروض الأسعار إلى فواتير ضريبية نهائية بضغطة واحدة، دون إعادة إدخال البيانات المكررة.</p>
               </div>
            </div>
         </div>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white" dir="rtl">
        <p className="text-zinc-600 text-sm font-medium">© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
