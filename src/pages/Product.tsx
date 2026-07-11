import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Users,
  Webhook,
  BrainCircuit,
  Receipt,
  CreditCard,
  PieChart,
  Sparkles,
} from "lucide-react";
import Navbar from "@/src/components/Navbar";

export default function Product() {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "كافة المنتجات والأدوات والحلول | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "تصفح كافة الأدوات القوية والحلول المترابطة التي يقدمها نظام مدارج OS للشركات السعودية والخليجية. تتبع مبيعات، فواتير إلكترونية متوافقة ZATCA، شؤون موظفين وأكثر."
    );
  }, []);

  const features = [
    {
      title: "CRM و إدارة العملاء",
      desc: "تتبع دقيق من مرحلة الاهتمام إلى الإغلاق، مع نظرة موحدة لتاريخ تواصل العميل.",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "محرك مبيعات واتساب",
      desc: "أتمتة المحادثات وتحويل رسائل العملاء إلى بطاقات CRM وفواتير بشكل آلي (رسمياً عبر API).",
      icon: Webhook,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "الأتمتة بالذكاء الاصطناعي",
      desc: "توليد نصوص، تلخيص مسار صفقة، واقتراح إجابات لردود واتساب تلقائية.",
      icon: BrainCircuit,
      color: "text-purple-400",
      bg: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "نظام الفوترة ZATCA",
      desc: "إنشاء، تتبع، وتصدير فواتير ضريبية تامة الامتثال للمرحلة 2 بضغطة زر.",
      icon: Receipt,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "نظام الرواتب والأجور",
      desc: "محرك رواتب متكامل لحساب البدلات، الخصومات، وإصدار ملفات حماية الأجور (WPS).",
      icon: CreditCard,
      color: "text-rose-400",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: "لوحات التحكم والتحليل",
      desc: "شاشات بيانات لحظية (BI) للإيرادات، المستحقات، وحالة المبيعات لاتخاذ قرارات أسرع.",
      icon: PieChart,
      color: "text-primary",
      bg: "bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 public-dark-page"
      dir="rtl"
    >
      <Navbar />

      <main className="pt-44 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
              أدوات <span className="text-primary">قوية ومركزة</span>، صممت لتعمل معاً بتناغم.
            </h1>
            <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
              مدارج ليس مجرد CRM أو برنامج فواتير. إنه نظام تشغيل شامل يربط المبيعات، المحادثات،
              الأموال، والتشريعات في مسار عمل واحد منطقي.
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
                className="bg-zinc-900/40 p-8 rounded-[2rem] border border-white/5 hover:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`w-14 h-14 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black mb-3">{item.title}</h3>
                <p className="text-zinc-400 font-medium leading-relaxed mb-6 text-sm">
                  {item.desc}
                </p>
                {/* Logical approach - feature focus */}
                <Link
                  to="/app"
                  className="text-sm font-bold text-white inline-flex items-center gap-2 group"
                >
                  شاهدها في العمل{" "}
                  <span className="text-primary group-hover:-translate-x-1 transition-transform">
                    &larr;
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium mt-auto"
        dir="rtl"
      >
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
