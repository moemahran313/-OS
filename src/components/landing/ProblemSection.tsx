import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MessageSquare, FileText, ShieldAlert, ChevronLeft } from "lucide-react";
import { cn } from "@/src/lib/utils";

export const ProblemSection = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden perspective-[2000px]" dir="rtl">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight">
            العمل التقليدي <span className="text-rose-500 line-through decoration-4">فوضوي</span>{" "}
            ومدمر للوقت
          </h2>
          <p className="text-zinc-500 text-xl font-medium mt-4">
            تطبيقات كثيرة، محادثات لا تنتهي، فواتير ضائعة، وغرامات تأخير.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
            hidden: {},
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-[1500px]"
        >
          {[
            {
              title: "واتساب مزدحم مبعثر",
              desc: "طلبات العملاء تضيع بين المحادثات الشخصية والعشوائية.",
              icon: MessageSquare,
              color: "text-emerald-500",
              bg: "bg-emerald-50",
            },
            {
              title: "فواتير يدوية متعبة",
              desc: "أكسيل، وورد، وبحث متواصل عن الأرقام الضريبية وتتبع التحويلات.",
              icon: FileText,
              color: "text-blue-500",
              bg: "bg-blue-50",
            },
            {
              title: "غرامات ومخاطر",
              desc: "تأخر الرواتب، انتهاء الإقامات، وغرامات WPS و التأمينات الاجتماعية.",
              icon: ShieldAlert,
              color: "text-rose-500",
              bg: "bg-rose-50",
            },
          ].map((item, i) => (
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 50, rotateX: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  rotateX: 0,
                  transition: { type: "spring", bounce: 0.4 },
                },
              }}
              whileHover={{
                y: -10,
                rotateX: 0,
                rotateY: i === 0 ? 5 : i === 2 ? -5 : 0,
                scale: 1.02,
              }}
              key={i}
              className="bg-white border border-zinc-100 rounded-[2rem] p-8 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] hover:shadow-[0_40px_60px_-20px_rgba(0,0,0,0.15)] transition-shadow duration-500 relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-zinc-100 to-transparent -mr-10 -mt-10 rounded-full group-hover:scale-150 transition-transform duration-700" />
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 relative z-10",
                  item.bg,
                  item.color
                )}
              >
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-3 relative z-10">{item.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed relative z-10">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-16 flex justify-center"
        >
          <Link
            to="/app"
            className="group inline-flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-200"
          >
            <span>تخلص من الفوضى الآن</span>
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};
export default ProblemSection;
