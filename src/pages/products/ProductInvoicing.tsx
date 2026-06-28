import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import { 
  Receipt, 
  ShieldCheck, 
  CheckCircle, 
  ArrowLeft, 
  Sparkles,
  FileText,
  Clock,
  Code,
  Eye,
  Lock,
  RefreshCw,
  QrCode,
  DollarSign
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductInvoicing() {
  const [invoiceAmount, setInvoiceAmount] = useState(15000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const vatAmount = invoiceAmount * 0.15;
  const totalWithVat = invoiceAmount + vatAmount;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "الفوترة الإلكترونية المتوافقة مع ZATCA المرحلة الثانية | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'برنامج الفوترة الإلكترونية المعتمد من هيئة الزكاة والضريبة والجمارك (فاتورة) للمرحلة الثانية. فواتير مشفرة وتوقيع رقمي فوري لجميع الأعمال والشركات.');
  }, []);

  const triggerSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(1);
    
    setTimeout(() => {
      setSimulationStep(2); // XML generated
      setTimeout(() => {
        setSimulationStep(3); // Hash generated
        setTimeout(() => {
          setSimulationStep(4); // Cleared by ZATCA
          setTimeout(() => {
            setIsSimulating(false);
          }, 2000);
        }, 1200);
      }, 1000);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden" dir="rtl">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-amber-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md mb-8"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-semibold text-amber-200">الفوترة الذكية والامتثال لـ هيئة الزكاة والضريبة (ZATCA)</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            فوترة إلكترونية متطابقة. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-amber-400 to-yellow-300">معتمدة بالكامل للمرحلة الثانية.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            توليد تلقائي للفواتير الضريبية المبسطة وفواتير الأعمال (B2B)، تشفير XML رقمي، ختم هيئة الزكاة الفوري، والتحقق التلقائي من الأرقام الضريبية للعملاء لامتثال خالٍ من العقبات.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link to="/solutions/invoicing" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              استكشف تفاصيل الامتثال
            </Link>
            <Link to="/app/invoices" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              ابدأ تحرير فاتورتك الأولى
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE ZATCA COMPLIANCE SIMULATOR --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Column - Form & Simulator */}
            <div className="bg-zinc-950/80 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  مُنشئ الفواتير الفوري والسريع
                </span>
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-bold">المحاكاة التفاعلية</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-zinc-400 mb-2 uppercase tracking-wide">مبلغ الفاتورة الأساسي (ر.س)</label>
                  <input 
                    type="range" 
                    min="1000" 
                    max="100000" 
                    step="1000"
                    value={invoiceAmount} 
                    onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-zinc-500 font-bold mt-2">
                    <span>1,000 ر.س</span>
                    <span className="text-white text-sm font-black">{invoiceAmount.toLocaleString()} ر.س</span>
                    <span>100,000 ر.س</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-2 text-xs font-bold">
                  <div className="flex justify-between text-zinc-400">
                    <span>القيمة قبل الضريبة:</span>
                    <span>{invoiceAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>ضريبة القيمة المضافة (15٪):</span>
                    <span>{vatAmount.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-white text-sm pt-2 border-t border-white/5 font-black">
                    <span>المجموع الإجمالي:</span>
                    <span className="text-emerald-400">{totalWithVat.toLocaleString()} ر.س</span>
                  </div>
                </div>

                <button
                  onClick={triggerSimulation}
                  disabled={isSimulating}
                  className="w-full py-4 bg-amber-500 text-zinc-950 font-black rounded-2xl hover:bg-amber-400 transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2 disabled:opacity-55"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>جاري تشفير وختم الفاتورة قانونياً...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-5 h-5" />
                      <span>إنشاء فاتورة متطابقة مع ZATCA المرحلة 2</span>
                    </>
                  )}
                </button>
              </div>

              {/* Simulation Steps Panel */}
              <AnimatePresence>
                {(isSimulating || simulationStep > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="p-4 bg-zinc-900/80 rounded-2xl border border-white/5 space-y-3"
                  >
                    <div className="flex gap-3 items-center text-xs">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", simulationStep >= 1 ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>1</div>
                      <span className={cn("font-bold", simulationStep >= 1 ? "text-white" : "text-zinc-500")}>توليد ملف الفاتورة بصيغة ZATCA XML</span>
                    </div>

                    <div className="flex gap-3 items-center text-xs">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", simulationStep >= 2 ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>2</div>
                      <span className={cn("font-bold", simulationStep >= 2 ? "text-white" : "text-zinc-500")}>حساب الهاش الرقمي والتوقيع بختم مدارج المعتمد</span>
                    </div>

                    <div className="flex gap-3 items-center text-xs">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", simulationStep >= 3 ? "bg-amber-500 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>3</div>
                      <span className={cn("font-bold", simulationStep >= 3 ? "text-white" : "text-zinc-500")}>تشفير رمز الاستجابة السريعة QR بترميز Base64 المعتمد</span>
                    </div>

                    <div className="flex gap-3 items-center text-xs">
                      <div className={cn("w-4 h-4 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold", simulationStep >= 4 ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-500")}>✓</div>
                      <span className={cn("font-bold", simulationStep >= 4 ? "text-emerald-400" : "text-zinc-500")}>تم الفسح والإبلاغ التلقائي في خوادم الهيئة بنجاح</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Column - Deep Agency Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-black uppercase">
                <ShieldCheck className="w-4 h-4" />
                تكامل آمن وموثوق ومضمون
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                أمنح المحاسبين والمدراء الماليين <span className="text-amber-400">راحة بال مطلقة.</span>
              </h2>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                قوانين الفوترة الإلكترونية السعودية (فاتورة) تتطلب دقة فنية متكاملة. نظام مدارج مبني من الصفر ليتعامل مع هذه المتطلبات الفنية تلقائياً دون إجهاد لفرق العمل: توليد الكود التعريفي العالمي الموحد (UUID)، والتحقق من الأرقام الضريبية، وحفظ السجلات لعقد كامل بطريقة غير قابلة للتعديل.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-white text-sm font-black mb-2">QR Code متوافق</h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">يتضمن رمز الاستجابة السريعة كافة البيانات الإلزامية مثل اسم المورد ورقمه والضريبة والمجموع بترميز معتمد.</p>
                </div>

                <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-white text-sm font-black mb-2">امتثال فوري (Integration)</h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">يتم ربط فواتير الأعمال ومطابقتها بشكل مباشر مع واجهات برمجة تطبيقات الهيئة للمرحلة الثانية.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* --- AGENY DESIGN: THE THREE COMPLIANCE PILLARS --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">آلية الامتثال الكاملة في النظام</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">صُمم ليغنيك عن البرامج والخدمات الوسيطة المكلفة والمعقدة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/10 w-fit mb-6">
                <Code className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">ملفات XML الموقعة رقمياً</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                يقوم النظام تلقائياً بتشفير وتوليد ملف XML الخاص بكل فاتورة وفقاً لمعايير الهيئة، موقعاً رقمياً بشهادة الأمان المشفرة الخاصة بشركتك، تمهيداً لحفظه وتصديره وإرساله.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">حفظ آمن ومطابق لمكافحة التستر</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                تُخزن جميع الفواتير في خوادم مدارج الآمنة والمشفرة محلياً داخل المملكة، بطريقة تمنع بشكل قاطع أي تعديل أو تلاعب في التواريخ والبيانات المالية تماشياً مع متطلبات النزاهة والامتثال.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-6">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">واجهات مستخدم مخصصة للتدقيق</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                يمكنك تصدير كشوفات ضريبة القيمة المضافة الإجمالية بضغطة زر، وإعطاء مراجع الحسابات الخارجي صلاحيات مخصصة لعرض السجلات وتسهيل عمليات التدقيق الربع سنوية أو السنوية.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- REUSABLE BIG FINAL CTA --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-gradient-to-t from-primary/10 via-transparent to-transparent relative border-t border-white/5"
      >
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            حافظ على توازن شركتك وامتثالها المالي بذكاء.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            التقِ بالجيل القادم من أنظمة الفوترة الإلكترونية الخليجية المعتمدة والأكثر أماناً وسرعة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              ابدأ توليد فواتيرك مجاناً
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              احجز جلسة استشارة فنية
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium text-sm" dir="rtl">
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
