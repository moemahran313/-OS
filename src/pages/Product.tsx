import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Users, Webhook, BrainCircuit, Receipt, CreditCard, PieChart } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Product() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { title: "CRM و إدارة العملاء", desc: "تتبع دقيق من مرحلة الاهتمام إلى الإغلاق، مع نظرة موحدة لتاريخ تواصل العميل.", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { title: "محرك مبيعات واتساب", desc: "أتمتة المحادثات وتحويل رسائل العملاء إلى بطاقات CRM وفواتير بشكل آلي (رسمياً عبر API).", icon: Webhook, color: "text-emerald-500", bg: "bg-emerald-50" },
    { title: "الأتمتة بالذكاء الاصطناعي", desc: "توليد نصوص، تلخيص مسار صفقة، واقتراح إجابات لردود واتساب تلقائية.", icon: BrainCircuit, color: "text-purple-500", bg: "bg-purple-50" },
    { title: "نظام الفوترة ZATCA", desc: "إنشاء، تتبع، وتصدير فواتير ضريبية تامة الامتثال للمرحلة 2 بضغطة زر.", icon: Receipt, color: "text-amber-500", bg: "bg-amber-50" },
    { title: "نظام الرواتب والأجور", desc: "محرك رواتب متكامل لحساب البدلات، الخصومات، وإصدار ملفات حماية الأجور (WPS).", icon: CreditCard, color: "text-rose-500", bg: "bg-rose-50" },
    { title: "لوحات التحكم والتحليل", desc: "شاشات بيانات لحظية (BI) للإيرادات، المستحقات، وحالة المبيعات لاتخاذ قرارات أسرع.", icon: PieChart, color: "text-primary", bg: "bg-primary/10" }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30" dir="rtl">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-white/70 border-b border-zinc-200">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Logo theme="light" />
          <div className="flex items-center gap-4">
             <Link to="/contact" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors hidden sm:block">تواصل معنا</Link>
             <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20">ابدأ الآن</Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
              أدوات <span className="text-primary">قوية ومركزة</span>، صممت لتعمل معاً بتناغم.
            </h1>
            <p className="text-xl text-zinc-500 font-medium max-w-2xl mx-auto">
              مدارج ليس مجرد CRM أو برنامج فواتير. إنه نظام تشغيل شامل يربط المبيعات، المحادثات، الأموال، والتشريعات في مسار عمل واحد منطقي.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {features.map((item, idx) => (
                <motion.div 
                   key={idx}
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: idx * 0.1 }}
                   className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                   <div className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <item.icon className="w-6 h-6" />
                   </div>
                   <h3 className="text-xl font-black mb-3">{item.title}</h3>
                   <p className="text-zinc-500 font-medium leading-relaxed mb-6">{item.desc}</p>
                   {/* Logical approach - feature focus */}
                   <Link to="/app" className="text-sm font-bold text-zinc-900 inline-flex items-center gap-2 group">
                      شاهدها في العمل <span className="text-primary group-hover:-translate-x-1 transition-transform">&larr;</span>
                   </Link>
                </motion.div>
             ))}
          </div>
        </div>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white mt-auto" dir="rtl">
        <p className="text-zinc-600 text-sm font-medium">© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
