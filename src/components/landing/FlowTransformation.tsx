import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MessageSquare, FileText, ArrowLeft, PieChart, ChevronLeft } from "lucide-react";

export const FlowTransformation = () => {
  return (
    <section className="py-32 bg-zinc-950 text-white relative overflow-hidden" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-zinc-950 to-zinc-950" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            من المحادثة إلى الأرباح، في ثوانٍ.
          </h2>
          <p className="text-xl text-zinc-400 font-medium">
            خط سير أوتوماتيكي يبدأ من رسالة واتساب وينتهي في حسابك البنكي.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.3 } },
            hidden: {},
          }}
          className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 relative"
        >
          {/* 1. Chat */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 50, scale: 0.9 },
              visible: {
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, rotate: -2, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-emerald-400">
              <MessageSquare className="w-6 h-6" />
              <h4 className="font-bold">استقبال الطلب (واتساب)</h4>
            </div>
            <div className="space-y-3">
              <div className="bg-zinc-800 p-3 rounded-xl rounded-tr-none text-sm w-11/12 ml-auto text-zinc-300">
                السلام عليكم، أريد طلب الخدمة الأساسية بـ 500 ريال.
              </div>
              <div className="bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 p-3 rounded-xl rounded-tl-none text-sm w-11/12">
                تم، جاري تجهيز الفاتورة التلقائية لك.
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
          >
            <ArrowLeft className="w-8 h-8 text-zinc-600 hidden md:block" />
            <ArrowLeft className="w-8 h-8 text-zinc-600 rotate-90 md:hidden" />
          </motion.div>

          {/* 2. Invoice */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50, scale: 0.9 },
              visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-blue-400">
              <FileText className="w-6 h-6" />
              <h4 className="font-bold">توليد الفاتورة (AI)</h4>
            </div>
            <div className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs text-zinc-500">فاتورة INV-001</span>
                <span className="text-xs font-bold text-emerald-400">تم الإرسال</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-zinc-300">الخدمة الأساسية</span>
                <span className="font-black">500 SAR</span>
              </div>
              <button className="w-full mt-2 py-2 bg-primary/20 text-primary hover:bg-primary/30 rounded-lg text-xs font-bold transition-all">
                رابط الدفع (Stripe/Tap)
              </button>
            </div>
          </motion.div>

          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0 }, visible: { opacity: 1, scale: 1 } }}
          >
            <ArrowLeft className="w-8 h-8 text-zinc-600 hidden md:block" />
            <ArrowLeft className="w-8 h-8 text-zinc-600 rotate-90 md:hidden" />
          </motion.div>

          {/* 3. Analytics */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: -50, scale: 0.9 },
              visible: {
                opacity: 1,
                x: 0,
                scale: 1,
                transition: { type: "spring", bounce: 0.5, duration: 1 },
              },
            }}
            whileHover={{ y: -15, scale: 1.05, rotate: 2, zIndex: 10 }}
            className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-1/3 backdrop-blur-md relative"
          >
            <div className="flex items-center gap-3 mb-4 text-primary">
              <PieChart className="w-6 h-6" />
              <h4 className="font-bold">تحديث التقارير لحظياً</h4>
            </div>
            <div className="flex items-end gap-2 h-24 pt-4 border-b border-white/5 overflow-hidden group">
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "33.333333%" }}
                transition={{ delay: 0.8, duration: 1 }}
                className="w-1/4 bg-primary/20 rounded-t-sm"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "50%" }}
                transition={{ delay: 1.0, duration: 1 }}
                className="w-1/4 bg-primary/40 rounded-t-sm"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "75%" }}
                transition={{ delay: 1.2, duration: 1 }}
                className="w-1/4 bg-primary/60 rounded-t-sm group-hover:bg-primary/80 transition-colors"
              />
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: "100%" }}
                transition={{ delay: 1.4, duration: 1 }}
                className="w-1/4 bg-primary text-primary-foreground font-black text-[10px] flex items-start justify-center pt-2 rounded-t-sm shadow-[0_0_15px_rgba(var(--primary),0.5)] group-hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] transition-all"
              >
                +500
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-20 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-10 py-5 bg-white text-zinc-950 rounded-2xl font-black text-xl hover:bg-zinc-100 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span>ابدأ خط سيرك المربح</span>
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
export default FlowTransformation;
