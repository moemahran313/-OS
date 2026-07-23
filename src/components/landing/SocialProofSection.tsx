import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import {
  Building2,
  Globe,
  Zap,
  ShieldCheck,
  Star,
  CheckCircle2,
  Quote,
  TrendingUp,
  Award,
  Users,
} from "lucide-react";

export const SocialProofSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Framer Motion useScroll and useTransform for smooth scroll-triggered animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const headerY = useTransform(scrollYProgress, [0, 0.3], [50, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);
  const marqueeScale = useTransform(scrollYProgress, [0.1, 0.35], [0.95, 1]);

  const partners = [
    { name: "هيئة الزكاة والضريبة والجمارك", type: "ZATCA Phase 2", icon: ShieldCheck, color: "text-emerald-500" },
    { name: "منصة مدد - حماية الأجور", type: "WPS SIF", icon: CheckCircle2, color: "text-blue-500" },
    { name: "البريد السعودي - العنوان الوطني", type: "SPL API", icon: Globe, color: "text-amber-500" },
    { name: "منصة سلة للتجارة الإلكترونية", type: "Salla Integration", icon: Zap, color: "text-purple-500" },
    { name: "منصة زد للتجزئة", type: "Zid Integration", icon: Building2, color: "text-teal-500" },
    { name: "مصرف الراجحي للشركات", type: "SAMA Banking", icon: TrendingUp, color: "text-emerald-600" },
  ];

  const testimonials = [
    {
      name: "عبد الله بن سلمان آل سعود",
      title: "الرئيس التنفيذي - شركة نماء الرياض للمقاولات",
      city: "الرياض",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      quote:
        "نظام أتمتة الفوترة الإلكترونية المرحلة الثانية من مدارج وفر علينا أكثر من 120,000 ريال سنوياً وقضى تماماً على خطورة تأخير الفواتير الضريبية لدى ZATCA.",
      metrics: "وفر 120,000 ر.س/سنوياً",
      rating: 5,
    },
    {
      name: "د. هدى الغامدي",
      title: "مديرة الشؤون المالية - مجموعة الشفاء الطبية",
      city: "جدة",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      quote:
        "أفضل نظام محاسبي سحابي في السعودية بلا منازع. سهولة إدارة الموارد البشرية والرواتب وتصدير ملفات SIF المعيارية لمنصة مدد اختصرت وقت المعالجة من أسبوعين إلى ساعتين.",
      metrics: "إنجاز الرواتب بـ 2 ساعة",
      rating: 5,
    },
    {
      name: "م. طارق العصيمي",
      title: "المؤسس - سلاسل التوزيع المتكاملة",
      city: "الدمام",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      quote:
        "التكامل الفوري مع العنوان الوطني وإمكانية إصدار الفواتير مع تذكيرات الواتساب السحابية رفع نسبة تحصيل المستحقات لدينا إلى 94% خلال الشهر الأول.",
      metrics: "94% تحصيل المبيعات",
      rating: 5,
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="trusted-by-saudi"
      className="py-24 bg-zinc-950 text-white border-y border-white/10 overflow-hidden relative"
      dir="rtl"
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        {/* Section Header with Framer Motion Entrance */}
        <motion.div style={{ y: headerY, opacity: headerOpacity }} className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide mb-4">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>شركاء النجاح للمنشآت السعودية</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
            محل ثقة أكثر من <span className="text-emerald-400 font-mono">5,200+</span> منشأة وشركة في المملكة
          </h2>
          <p className="text-zinc-400 text-base md:text-lg font-medium mt-3 leading-relaxed">
            منصة سحابية متكاملة تضمن الامتثال الكامل لـ <strong className="text-white">أتمتة الفوترة الإلكترونية المرحلة الثانية</strong> و<strong className="text-white">إدارة الموارد البشرية والرواتب</strong> وفق الأنظمة الوطنية.
          </p>
        </motion.div>

        {/* Auto-Scrolling Logo Marquee */}
        <motion.div style={{ scale: marqueeScale }} className="mb-20">
          <p className="text-center text-xs font-black uppercase tracking-widest text-zinc-500 mb-8">
            التكامل التقني المباشر مع المنظومات والجهات الرسمية
          </p>

          <div className="relative w-full overflow-hidden py-4 border-y border-white/5 bg-white/[0.02]">
            {/* Fade edges */}
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ x: [0, -1200] }}
              transition={{ ease: "linear", duration: 25, repeat: Infinity }}
              className="flex whitespace-nowrap items-center gap-12 md:gap-16"
              style={{ width: "max-content", direction: "ltr" }}
            >
              {[1, 2, 3].map((group) => (
                <React.Fragment key={group}>
                  {partners.map((partner, pIdx) => {
                    const IconComp = partner.icon;
                    return (
                      <div
                        key={pIdx}
                        className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 hover:bg-white/10 transition-all cursor-pointer group"
                      >
                        <IconComp className={`w-6 h-6 ${partner.color} group-hover:scale-110 transition-transform`} />
                        <div className="flex flex-col text-right">
                          <span className="text-sm font-black text-zinc-200 group-hover:text-emerald-400 transition-colors">
                            {partner.name}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500">{partner.type}</span>
                        </div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Customer Testimonials Cards Grid */}
        <div>
          <div className="text-center mb-10">
            <h3 className="text-2xl md:text-3xl font-black text-white">
              ماذا يقول قادة الأعمال عن تجربة الانتقال لـ <span className="text-emerald-400">نظام مدارج</span>؟
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.15 }}
                whileHover={{ y: -6 }}
                className="bg-zinc-900/90 border border-white/10 rounded-3xl p-8 flex flex-col justify-between shadow-xl hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all relative group"
              >
                <div className="space-y-4">
                  {/* Rating Stars & Metric Tag */}
                  <div className="flex justify-between items-center">
                    <div className="flex text-amber-400 gap-1">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[11px] font-black border border-emerald-500/20">
                      {item.metrics}
                    </span>
                  </div>

                  <Quote className="w-8 h-8 text-emerald-500/30 group-hover:text-emerald-500/60 transition-colors" />

                  <p className="text-sm text-zinc-300 font-medium leading-relaxed italic">
                    &quot;{item.quote}&quot;
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 flex items-center gap-4 mt-6">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    loading="lazy"
                    decoding="async"
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
                  />
                  <div>
                    <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                      {item.name}
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />
                    </h4>
                    <p className="text-[11px] text-zinc-400 font-bold">{item.title}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">{item.city}، المملكة العربية السعودية</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
