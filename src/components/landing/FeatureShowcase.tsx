import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Users, FileText, ShieldCheck, ChevronLeft } from "lucide-react";

export const FeatureShowcase = () => {
  return (
    <section className="py-32 bg-zinc-50 border-t border-zinc-200 perspective-[2000px]" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight leading-tight max-w-3xl mx-auto">
            ليس مجرد نظام، بل هو{" "}
            <span className="text-primary tracking-tighter">دماغ إلكتروني</span> لإدارة شركتك
            بالكامل.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] perspective-[1500px]">
          {/* 1. CRM */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -10 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: 2, rotateX: -2 }}
            className="col-span-1 md:col-span-2 bg-zinc-900 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div
              className="absolute right-0 top-0 w-64 h-64 rounded-full translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.15) 0%, transparent 70%)" }}
            />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <Users className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 relative z-10">
                  إدارة علاقات العملاء (CRM)
                </h3>
                <p className="text-zinc-400 font-medium text-lg relative z-10">
                  من العميل المحتمل وحتى إغلاق الصفقة وتوليد الفاتورة.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Invoicing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 20, rotateY: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.1, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: -2, rotateX: -2 }}
            className="col-span-1 bg-white border border-zinc-200 rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_60px_-20px_rgba(0,0,0,0.1)] transition-all cursor-pointer"
          >
            <div
              className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full transition-all duration-300 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)" }}
            />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-zinc-900 mb-2 relative z-10">
                  فواتير وقوائم ضريبية
                </h3>
                <p className="text-zinc-500 font-medium text-sm relative z-10">
                  متوافقة بنسبة 100٪ مع هيئة الزكاة والضريبة ودعم الفوترة الإلكترونية.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 4. FWCOS */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: -20, rotateY: 0 }}
            whileInView={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
            className="col-span-1 md:col-span-2 bg-gradient-to-r from-zinc-900 to-zinc-800 text-white rounded-[2rem] p-8 relative overflow-hidden group shadow-[0_20px_40px_-20px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 block group-hover:opacity-100 transition-opacity" />
            <div
              className="absolute right-1/4 top-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full transition-all duration-300 pointer-events-none"
              style={{ background: "radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 70%)" }}
            />
            <div className="relative z-10 w-full h-full flex flex-col justify-between">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300">
                <ShieldCheck className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              </div>
              <div>
                <h3 className="text-3xl font-black mb-2 flex flex-wrap items-center gap-3 relative z-10">
                  بيئة الامتثال{" "}
                  <span className="bg-rose-500/20 text-rose-300 text-xs px-2 py-1 rounded-full uppercase tracking-widest font-black shrink-0">
                    FWC-OS
                  </span>
                </h3>
                <p className="text-zinc-400 font-medium text-lg relative z-10">
                  أتمتة ذكية لضمان التوافق مع WPS وتجديد الإقامات دون غرامات وبلا مجهود.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
          >
            <span>اكتشف جميع الميزات</span>
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
export default FeatureShowcase;
