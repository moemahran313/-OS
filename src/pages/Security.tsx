import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ShieldCheck, Lock, FileKey, Shield, Server, FileText } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Security() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30"
      dir="rtl"
    >
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
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
              أمان مبني <span className="text-primary">للمعايير الخليجية</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
              بياناتك وأعمالك محمية بأعلى المعايير العالمية وبمزامنة تامة مع المتطلبات التنظيمية
              المحلية.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
            >
              <Lock className="w-8 h-8 text-indigo-500 mb-6" />
              <h3 className="text-2xl font-black mb-3">تشفير تام للبيانات</h3>
              <p className="text-zinc-600 font-medium leading-relaxed">
                جميع بياناتك، وفواتيرك، ومعلومات عملائك مشفرة بالكامل بتقنية AES-256 أثناء النقل وفي
                حالة الحفظ، مما يعني أنك الوحيد الذي يملك حق الوصول لمفاتيح أعمالك.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
            >
              <FileKey className="w-8 h-8 text-emerald-500 mb-6" />
              <h3 className="text-2xl font-black mb-3">توافق مع ZATCA</h3>
              <p className="text-zinc-600 font-medium leading-relaxed">
                جاهزية تامة للمرحلة الثانية من الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك
                (ZATCA)، مع ضمان تصديق كافة الفواتير آلياً وختمها برمز QR معتمد دولياً.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm"
            >
              <Server className="w-8 h-8 text-blue-500 mb-6" />
              <h3 className="text-2xl font-black mb-3">استضافة البيانات محلياً</h3>
              <p className="text-zinc-600 font-medium leading-relaxed">
                نحن نلتزم بقوانين حماية البيانات المحلية من خلال استضافة بياناتك على سحابة آمنة
                تتوافق مع متطلبات إبقاء البيانات الحساسة داخل حدود المنطقة.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 text-white p-8 rounded-[2rem] border border-zinc-800 shadow-xl"
            >
              <FileText className="w-8 h-8 text-primary mb-6" />
              <h3 className="text-2xl font-black mb-3">سياسات الامتثال لـ WhatsApp</h3>
              <p className="text-zinc-400 font-medium leading-relaxed">
                تفاعل بآمان: تطبيقنا متوافق بنسبة 100% مع واجهة WhatsApp Business API وسياسات
                الخصوصية المتعلقة بالتسويق، مما يحميك من التعرض للحظر أو فقدان الثقة.
              </p>
            </motion.div>
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
