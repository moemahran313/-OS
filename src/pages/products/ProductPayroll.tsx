import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import {
  CreditCard,
  Users,
  CheckCircle,
  Sparkles,
  Building,
  ShieldCheck,
  Award,
  ChevronRight,
  TrendingUp,
  Percent,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductPayroll() {
  const [saudis, setSaudis] = useState(6);
  const [expats, setExpats] = useState(10);

  const total = saudis + expats;
  const saudizationPct = total > 0 ? (saudis / total) * 100 : 0;

  // Nitaqat Band logic
  let nitaqatLabel = "أحمر";
  let nitaqatColorClass = "text-rose-400 bg-rose-500/10 border-rose-500/20";
  let nitaqatDescription =
    "أنت معرض لإيقاف الخدمات الجمركية وإصدار التأشيرات الفورية بسبب انخفاض نسبة التوطين.";

  if (saudizationPct >= 35) {
    nitaqatLabel = "أخضر مرتفع";
    nitaqatColorClass = "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    nitaqatDescription =
      "شركتك في أمان تام! مؤهلة للاستقدام الفوري للموظفين، وتأشيرات فورية عبر قوى وميزات حماية الأجور.";
  } else if (saudizationPct >= 20) {
    nitaqatLabel = "أخضر منخفض";
    nitaqatColorClass = "text-green-400 bg-green-500/10 border-green-500/20";
    nitaqatDescription =
      "في النطاق الآمن. يمكنك نقل الكفالات والتجديد، ويُنصح بزيادة التوطين لرفع التقييم العام.";
  } else if (saudizationPct > 0) {
    nitaqatLabel = "أصفر";
    nitaqatColorClass = "text-amber-400 bg-amber-500/10 border-amber-500/20";
    nitaqatDescription =
      "نطاق حرج. لا يمكنك إصدار تأشيرات عمل جديدة ويتم تقييد بعض الخدمات تدريجياً.";
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "نظام مسير الرواتب المعتمد وحماية الأجور WPS | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "إدارة الرواتب وشؤون الموظفين بامتثال تام لوزارة الموارد البشرية ومنصات قوى ومدد. حساب التأمينات والبدلات وإصدار ملفات حماية الأجور بضغطة زر."
    );
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden public-dark-page"
      dir="rtl"
    >
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-rose-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 backdrop-blur-md mb-8"
          >
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-200">
              مسير الرواتب المعتمد وحماية الأجور (WPS)
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            إدارة رواتب الموظفين. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-rose-400 to-pink-300">
              بامتثال مطلق لقوى ومدد وتوطين.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            حساب فوري للبدلات والخصومات والتأمينات الاجتماعية، إصدار ملفات حماية الأجور (WPS)
            المتوافقة مع البنوك، وحساب مكافأة نهاية الخدمة، مع مراقبة نطاقات التوطين لحظياً.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link
              to="/app/payroll"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              افتح شاشة مسير الرواتب
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              شاهد جولة حية
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE NITAQAT BAND CALULATOR --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Column - Interactive Nitaqat Band tool */}
            <div className="bg-zinc-950/80 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  أداة تتبع محاكاة توطين نطاقات (Nitaqat)
                </span>
                <span className="text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-lg font-bold">
                  تفاعلي
                </span>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-zinc-400 mb-2 uppercase tracking-wide">
                    عدد الموظفين السعوديين
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSaudis(Math.max(0, saudis - 1))}
                      className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center font-bold hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-white w-12 text-center">{saudis}</span>
                    <button
                      onClick={() => setSaudis(saudis + 1)}
                      className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center font-bold hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-400 mb-2 uppercase tracking-wide">
                    عدد الموظفين الوافدين
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setExpats(Math.max(0, expats - 1))}
                      className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center font-bold hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="text-xl font-black text-white w-12 text-center">{expats}</span>
                    <button
                      onClick={() => setExpats(expats + 1)}
                      className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center font-bold hover:bg-zinc-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-400">نسبة التوطين الإجمالية:</span>
                  <span className="text-rose-400 text-lg font-black">
                    {saudizationPct.toFixed(1)}٪
                  </span>
                </div>

                <div className="flex gap-1.5 h-2.5 rounded-full overflow-hidden bg-zinc-800">
                  <div
                    style={{ width: `${saudizationPct}%` }}
                    className="bg-emerald-500 h-full rounded-full transition-all"
                  />
                  <div
                    style={{ width: `${100 - saudizationPct}%` }}
                    className="bg-zinc-700 h-full rounded-full transition-all"
                  />
                </div>

                <div className="pt-3 border-t border-white/5 flex gap-4 items-start">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-xl text-xs font-black border uppercase tracking-wider shrink-0",
                      nitaqatColorClass
                    )}
                  >
                    نطاق {nitaqatLabel}
                  </span>
                  <p className="text-zinc-400 text-xs leading-relaxed font-bold">
                    {nitaqatDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Beautiful Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-400 text-xs font-black uppercase">
                <Building className="w-4 h-4" />
                تكامل تام مع وزارة الموارد البشرية
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                أول نظام رواتب <span className="text-rose-400">يتطابق مع مدد وقوى تلقائياً</span> في
                المملكة.
              </h2>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                لا تضيع المزيد من الساعات شهرياً في تحضير ملفات الرواتب والأجور بصيغة WPS المتعبة.
                نظام مدارج يقوم بكل الرياضيات بالنيابة عنك: احتساب حصة التأمينات الاجتماعية (GOSI)،
                خصومات الغياب والتأخيرات المستوحاة من السجلات، والبدلات بجميع أنواعها، مع إخراج
                ملفات صرف رواتب مشفرة ومعتمدة تطابق تماماً متطلبات البنوك السعودية.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  "تنبيهات تلقائية قبل انتهاء تأشيرات الموظفين أو إقاماتهم عبر مقيم.",
                  "الاحتساب الآلي المستمر لحصة ساند ومستحقات التأمينات الخليجية.",
                  "حساب مكافأة نهاية الخدمة (EOSB) ومستحقات الإجازات تلقائياً تماشياً مع قانون العمل السعودي.",
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <CheckCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span className="text-zinc-200 text-sm font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- DETAILED FEATURES BENTO GRID --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              كافة احتياجات شؤون الموظفين في مكان واحد
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              تكامل مباشر يربط الحضور والغياب مع المحفظة المالية للمنشأة.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/10 w-fit mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                حماية الأجور والامتثال بنسبة 100%
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                تجنب غرامات تأخر الرواتب ووضع منشأتك تحت طائلة القانون. يقوم النظام بإنشاء وتحديث
                مسيرات الأجور تلقائياً وتصدير ملفات WPS التي تقبلها جميع البنوك السعودية بضغطة زر.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                إدارة الإجازات والتذاكر تلقائياً
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                يتيح النظام للموظفين طلب الإجازات السنوية أو المرضية وعرض رصيد الإجازات المتبقي
                ومتابعة بدلات السفر وتذاكر الطيران، مع ترحيل تكلفتها تلقائياً للمسير المالي.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-6">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">تأمين الموظفين والمستندات</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                نظّم عقود العمل الموثقة بنجاح عبر قوى، بطاقات الهويات الطبية والتأمينية، التوكيلات
                والتفويضات الإدارية لكل موظف بطريقة رقمية متطورة وسريعة الوصول للجميع.
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
            حان الوقت لتجعل إدارة رواتب منشأتك مؤتمتة وسهلة.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            وفّر مئات الساعات المهدرة شهرياً وتخلص من عقبات مسيرات الأجور تماماً مع مدارج OS.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              سجّل منشأتك وابدأ مجاناً
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              احجز جلسة عرض حي للرواتب
            </Link>
          </div>
        </div>
      </motion.section>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium text-sm"
        dir="rtl"
      >
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
