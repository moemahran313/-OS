import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { MessageCircle, Calendar, Bot } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Contact() {
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
              to="/app"
              className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              ابدأ الآن
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <h1 className="text-4xl md:text-6xl font-black text-zinc-900 tracking-tight leading-tight mb-6">
              نحن أقرب إليك من <span className="text-emerald-500">محادثة واتساب</span>
            </h1>
            <p className="text-xl text-zinc-500 font-medium">
              اخترت الطريقة الأسهل للوصول لفريقنا. نحن جاهزون للرد على استفساراتك فوراً.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.a
              href="https://wa.me/message/YOUR_NUMBER"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-zinc-900 text-white p-8 rounded-[2rem] border border-zinc-800 shadow-lg flex flex-col justify-center items-center group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20 relative z-10 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8 text-white fill-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 relative z-10">واتساب المباشر</h3>
              <p className="text-zinc-400 text-sm font-medium relative z-10 mb-6">
                الطريقة الأسرع للوصول إلينا
              </p>
              <span className="text-emerald-400 font-bold relative z-10 inline-flex items-center gap-2">
                ابدأ المحادثة &larr;
              </span>
            </motion.a>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-center items-center group"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <Calendar className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-2">احجز عرض تجريبي (Demo)</h3>
              <p className="text-zinc-500 text-sm font-medium mb-6">
                اكتشف لوحة التحكم كاملة مع خبير
              </p>
              <button className="text-blue-500 font-bold inline-flex items-center gap-2">
                تصفح التقويم &larr;
              </button>
            </motion.div>

            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-center items-center group"
            >
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black mb-2">مساعد الذكاء الاصطناعي</h3>
              <p className="text-zinc-500 text-sm font-medium mb-6">
                احصل على إجابات سريعة وفورية لأي سؤال
              </p>
              <button className="text-primary font-bold inline-flex items-center gap-2">
                تحدث الآن &larr;
              </button>
            </motion.div>
          </div>
        </div>
      </main>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white mt-auto"
        dir="rtl"
      >
        <p className="text-zinc-600 text-sm font-medium">
          © 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.
        </p>
      </footer>
    </div>
  );
}
