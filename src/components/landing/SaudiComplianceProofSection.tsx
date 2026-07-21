import React from "react";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, Lock, Award, Building, FileCheck } from "lucide-react";

export const SaudiComplianceProofSection = () => {
  const complianceBadges = [
    {
      title: "هيئة الزكاة والضريبة والجمارك (ZATCA)",
      spec: "المرحلة الثانية (الربط والتكامل)",
      desc: "دعم التشفير الرقمي ECDSA secp256k1، إرسال فوري لـ UBL 2.1 XML، واحتساب آلي لـ VAT 15%.",
      status: "متوافق 100%",
      badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      title: "منصة مدد ونظام حماية الأجور (WPS)",
      spec: "ملفات SIF المعتمدة من البنك المركزي",
      desc: "تنسيق صريح لهيكلية سجلات الرواتب (14/15) خالية تماماً من أخطاء القراءة البنكية.",
      status: "معتمد بنكياً",
      badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      title: "العنوان الوطني السعودي (SPL API)",
      spec: "api.address.gov.sa Proxy",
      desc: "التحقق اللحظي المباشر من صحة العناوين الوطنية والرموز البريدية لمنع أخطاء الشحن والعقود.",
      status: "تكامل رسمي",
      badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    },
    {
      title: "التأمينات الاجتماعية وقوى (GOSI & Qiwa)",
      spec: "مؤشر نطاقات واستقطاعات الأجور",
      desc: "احتساب الاستقطاعات النظامية آلياً مع تقديم محاكاة حية لتأثير التوظيف على نطاق الشركة.",
      status: "مستوفى آلياً",
      badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    },
  ];

  return (
    <section className="py-24 bg-zinc-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.1),_transparent_60%)]" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-black tracking-wide mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>الامتثال التنظيمي والأمان السيادي</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            مصمم للامتثال الصارم مع كافة <br />
            <span className="text-emerald-400">الأنظمة واللوائح السعودية الحديثة</span>
          </h2>
          <p className="text-zinc-400 text-base font-medium mt-4">
            لا داعي للقلق بشأن الغرامات أو التحديثات التنظيمية. يتحدث النظام أوتوماتيكياً مع التغييرات الرسمية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {complianceBadges.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${item.badgeBg}`}>
                    {item.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-white">{item.title}</h3>
                  <p className="text-[11px] text-emerald-400 font-mono font-bold mt-0.5">{item.spec}</p>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-zinc-500 font-bold mt-4">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>محدث وفق لائحة 2026</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SaudiComplianceProofSection;
