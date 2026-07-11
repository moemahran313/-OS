import React from "react";
import { motion } from "motion/react";
import { CheckCircle2 } from "lucide-react";

export const PricingSection = () => {
  return (
    <section className="py-32 bg-white perspective-[2000px] overflow-hidden" dir="rtl">
      <div className="container mx-auto px-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-black text-zinc-900 tracking-tight">
            استثمار بسيط. نمو هائل.
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row justify-center gap-8 items-center lg:items-stretch perspective-[1500px]">
          {/* Starter */}
          <motion.div
            initial={{ opacity: 0, x: -50, rotateY: -10 }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            whileHover={{ y: -10, scale: 1.02, rotateY: 5 }}
            className="flex-1 w-full max-w-sm rounded-[2rem] p-8 border border-zinc-200 bg-white shadow-sm hover:shadow-2xl transition-all duration-500"
          >
            <h3 className="text-xl font-bold text-zinc-900 mb-2">البداية (Starter)</h3>
            <p className="text-zinc-500 text-sm font-medium mb-6">لرواد الأعمال المستقلين</p>
            <div className="text-4xl font-black mb-8">
              مجاناً <span className="text-sm text-zinc-400 font-medium">/ مدى الحياة</span>
            </div>
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="space-y-4 mb-8 text-zinc-700 font-medium text-sm"
            >
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:scale-125 transition-transform" />{" "}
                إدارة 50 عميل
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:scale-125 transition-transform" />{" "}
                فواتير إلكترونية أساسية
              </motion.li>
            </motion.ul>
            <button className="w-full py-4 rounded-xl border-2 border-zinc-900 text-zinc-900 font-bold hover:bg-zinc-900 hover:text-white transition-all shadow-[0_0_0_0_rgba(24,24,27,0)] hover:shadow-[0_10px_20px_-10px_rgba(24,24,27,0.5)]">
              ابدأ مجاناً
            </button>
          </motion.div>

          {/* Pro (Highlighted) */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, rotateX: 10 }}
            whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.5 }}
            whileHover={{ y: -10, scale: 1.05 }}
            className="flex-1 w-full max-w-md rounded-[2.5rem] p-10 border-2 border-primary bg-zinc-900 text-white shadow-[0_20px_50px_-15px_rgba(16,185,129,0.3)] relative transform lg:-translate-y-4 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 blur-[80px] rounded-full group-hover:bg-primary/30 transition-colors" />

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-black px-4 py-1.5 rounded-full text-xs tracking-widest uppercase shadow-lg shadow-primary/30">
              الأكثر طلباً
            </div>
            <h3 className="text-2xl font-black mb-2 relative z-10">الاحترافي (Pro)</h3>
            <p className="text-zinc-400 text-sm font-medium mb-6 relative z-10">
              للشركات الصغيرة الطموحة
            </p>
            <div className="text-5xl font-black mb-8 flex items-baseline gap-2 relative z-10">
              299{" "}
              <span className="text-xl text-zinc-500 font-medium tracking-tight">
                ريال / شهرياً
              </span>
            </div>
            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
                hidden: {},
              }}
              className="space-y-4 mb-10 text-zinc-300 font-medium relative z-10"
            >
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                <span className="font-bold text-white">ترخيص ZATCA المرحلة الثانية مدعوم</span>
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                ربط ZATCA المرحلة 2 مباشر (مجاني)
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                جميع أدوات (FWC-OS و ImportOS)
              </motion.li>
              <motion.li
                variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                className="flex gap-3 items-center group/item"
              >
                <CheckCircle2 className="w-5 h-5 text-primary group-hover/item:scale-125 transition-transform shrink-0" />{" "}
                برنامج الشركاء: شهرين مجاناً لكل دعوة
              </motion.li>
            </motion.ul>
            <button className="w-full py-4 rounded-xl bg-primary text-white font-black hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20 transition-all text-lg relative z-10 overflow-hidden group/btn">
              <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300" />
              <span className="relative z-10">اشترك الآن</span>
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
export default PricingSection;
