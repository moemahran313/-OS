import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Globe, Users, ChevronLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30"
      dir="rtl"
    >
      {/* Simple Global Nav */}
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-zinc-950/90 border-b border-white/10 text-white">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Logo theme="dark" />
          <div className="flex items-center gap-4">
            <Link
              to="/contact"
              className="text-sm font-bold text-zinc-300 hover:text-white transition-colors hidden sm:block"
            >
              تواصل معنا
            </Link>
            <Link
              to="/app"
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
              المحرك الموثوق <span className="text-primary">للشركات الخليجية</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium">
              نحن لا نصنع برمجيات معقدة، بل نبني نظام تشغيل رقمي موحد يعكس ثقافتنا المحلية ويلبي
              احتياجاتنا بدقة.
            </p>
          </motion.div>

          <div className="grid gap-12">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-10 shadow-sm border border-zinc-100"
            >
              <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black mb-4">لماذا بنينا مدارج؟</h2>
              <p className="text-zinc-600 leading-relaxed font-medium">
                في مدارج، نؤمن أن التكنولوجيا يجب أن تعمل من أجلك، وليس العكس. لاحظنا أن العديد من
                الشركات في السوق الخليجي تعاني من الاعتماد على أنظمة مستوردة لا تدعم اللغة العربية
                بشكل أصيل، ولا تتوافق مع التشريعات المحلية مثل الفوترة الإلكترونية أو أنظمة حماية
                الأجور (WPS). لهذا قررنا تصميم بيئة عمل تناسبنا.
              </p>
            </motion.section>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.section
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-zinc-900 text-white rounded-3xl p-10 shadow-md"
              >
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-black mb-4">رؤيتنا</h2>
                <p className="text-zinc-400 leading-relaxed font-medium">
                  نطمح لتمكين مليون منشأة صغيرة ومتوسطة في دول الخليج من إدارة أعمالها بنظام موحد
                  ومتكامل. نبني الأساس الرقمي الذي يمكن رواد الأعمال من التركيز على نمو أعمالهم
                  براحة بال تامة.
                </p>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-10 shadow-sm border border-zinc-100"
              >
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black mb-4">قصتنا</h2>
                <p className="text-zinc-600 leading-relaxed font-medium">
                  بدأنا כفريق صغير عانى شخصياً من فوضى الإدارة اليدوية للفواتير والموظفين. أدركنا أن
                  الحل ليس في استخدام ثلاثة تطبيقات مختلفة، بل في ابتكار عقل إلكتروني واحد يفهم
                  السوق المحلي.
                </p>
              </motion.section>
            </div>
          </div>
        </div>
      </main>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white"
        dir="rtl"
      >
        <p className="text-zinc-600 text-sm font-medium">
          © 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.
        </p>
      </footer>
    </div>
  );
}
