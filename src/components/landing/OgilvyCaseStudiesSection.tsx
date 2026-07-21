import React from "react";
import { motion } from "motion/react";
import { Award, TrendingUp, Clock, CheckCircle2, ShieldCheck, Star } from "lucide-react";

export const OgilvyCaseStudiesSection = () => {
  const caseStudies = [
    {
      company: "شركة المسار الوطنية للمقاولات العامة",
      city: "الرياض",
      sector: "المقاولات والخدمات الهندسية",
      headline: "كيف وفرت 'المسار' 140,000 ريال سنوياً وقضت على غرامات تأخير الرواتب نهائياً؟",
      metric1: "140,000 ر.س",
      metric1Label: "وفر مالي سنوياً في اشتراكات البرامج",
      metric2: "2 ساعة فقط",
      metric2Label: "زمن إغلاق الحسابات الشهري بدلاً من 12 يوماً",
      quote:
        "كنا نستخدم زوهو للحسابات، وسيستم آخر للرواتب، وجداول أكسيل معقدة للمواقع. في نهاية كل شهر كان المحاسب يستغرق أسبوعين للتحقق من الفواتير والرواتب. بعد الانتقال لـ مدارج BizOS، أصبحت ملفات SIF تصدر بتوافُق 100% مع البنك، والفواتير مرتبطة مباشرة بهيئة الزكاة بدون خطأ واحد.",
      author: "م. فهد السبيعي",
      role: "المدير التنفيذي للعمليات",
      avatarBg: "bg-blue-600 text-white",
    },
    {
      company: "مجموعة الأفق لتجارة الجملة والتجزئة",
      city: "جدة",
      sector: "التجارة والتوزيع",
      headline: "إصدار 18,000 فاتورة ضريبية B2B بدون حالة رفض واحدة من هيئة الزكاة (ZATCA)",
      metric1: "100%",
      metric1Label: "نسبة قبول الفواتير لدى ZATCA Phase 2",
      metric2: "0.03 ثانية",
      metric2Label: "سرعة التوقيع الإلكتروني وتوليد الـ QR",
      quote:
        "التحدي الأكبر لدينا كان ربط الفواتير المباشرة من المتاجر وسلسلة الإمداد بالمرحلة الثانية. مدارج وفر علينا الاستعانة بشركة استشارية تكلف 80 ألف ريال للربط، وبدأنا بالعمل والفوترة الحية من اليوم الأول.",
      author: "أ. طارق عبد العزيز",
      role: "مدير الشؤون المالية",
      avatarBg: "bg-emerald-600 text-white",
    },
    {
      company: "وكالة الرؤية المبتكرة للتسويق والبرمجيات",
      city: "الخبر",
      sector: "الخدمات والوكالات الإعلانية",
      headline: "تحصيل 89% من المستحقات عبر تذكيرات الواتساب التلقائية بدون موظف تحصيل",
      metric1: "89%",
      metric1Label: "تحسن في سرعة تحصيل الفواتير",
      metric2: "0% عمولة",
      metric2Label: "رسوم الوساطة على رسائل الواتساب السحابية",
      quote:
        "الفواتير كانت تتأخر لأن العملاء ينسون الروابط. بمجرد إتاحة خيار إرسال الفاتورة آلياً فور توقيع العقد عبر الواتساب المزود برابط الدفع المباشر، ارتفعت التدفقات النقدية واستعدنا السيطرة على المستحقات.",
      author: "سارة الغامدي",
      role: "المؤسس والرئيس التنفيذي",
      avatarBg: "bg-purple-600 text-white",
    },
  ];

  return (
    <section className="py-28 bg-white text-zinc-900 border-t border-zinc-200" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black tracking-wide mb-6 border border-emerald-200">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>نتائج حقيقية موثقة بالأرقام والشهادات</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 leading-tight">
            حقائق وأرقام من قلب المنشآت السعودية <br />
            <span className="text-emerald-600">التي تعتمد على مدارج يومياً</span>
          </h2>
          <p className="text-zinc-500 font-medium text-lg mt-4">
            تجارب حقيقية لشركات نجحت في القضاء على الفوضى الإدارية وخفض التكاليف التشغيلية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {caseStudies.map((cs, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15, duration: 0.6 }}
              className="bg-zinc-50 border border-zinc-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all duration-300 relative group"
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-zinc-200/80 pb-4">
                  <div>
                    <h3 className="font-black text-base text-zinc-900">{cs.company}</h3>
                    <p className="text-[11px] text-zinc-500 font-bold mt-0.5">
                      {cs.city} • {cs.sector}
                    </p>
                  </div>
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <h4 className="font-extrabold text-base text-zinc-900 leading-snug">{cs.headline}</h4>

                {/* Metrics highlights */}
                <div className="grid grid-cols-2 gap-3 py-3 bg-white p-4 rounded-2xl border border-zinc-200/60">
                  <div>
                    <span className="text-2xl font-black text-emerald-600 font-mono block">{cs.metric1}</span>
                    <span className="text-[10px] text-zinc-500 font-bold block">{cs.metric1Label}</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-blue-600 font-mono block">{cs.metric2}</span>
                    <span className="text-[10px] text-zinc-500 font-bold block">{cs.metric2Label}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-medium italic">
                  &quot;{cs.quote}&quot;
                </p>
              </div>

              <div className="pt-6 border-t border-zinc-200/80 flex items-center gap-3 mt-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-sm ${cs.avatarBg}`}>
                  {cs.author[0]}
                </div>
                <div>
                  <p className="text-xs font-black text-zinc-900">{cs.author}</p>
                  <p className="text-[10px] text-zinc-500 font-bold">{cs.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OgilvyCaseStudiesSection;
