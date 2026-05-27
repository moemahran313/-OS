import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { PlayCircle, MousePointer2 } from "lucide-react";
import { Logo } from "@/src/components/Logo";

export default function Demo() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased text-white selection:bg-primary/30" dir="rtl">
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 transition-all duration-300 backdrop-blur-md bg-zinc-950/90 border-b border-white/10">
        <div className="container mx-auto max-w-7xl flex items-center justify-between">
          <Logo theme="dark" />
          <div className="flex items-center gap-4">
             <Link to="/contact" className="text-sm font-bold text-zinc-300 hover:text-white transition-colors hidden sm:block">تواصل معنا</Link>
             <Link to="/app" className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 transition-all shadow-md shadow-primary/20">حساب مجاني</Link>
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
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              جرب النظام <span className="text-primary">مباشرةً</span>
            </h1>
            <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto">
              تصفح الواجهات التفاعلية واكتشف كيف يبدو العمل عند تحويل الفوضى إلى تدفق أوتوماتيكي. (بدون تسجيل)
            </p>
          </motion.div>

          <div className="space-y-12">
            {[
              { title: "ديمو الفاتورة الذكية", subtitle: "كيف تحول طلب واتساب إلى فاتورة ومحصلة في ثوانٍ", color: "from-blue-500/20 to-transparent", border: "border-blue-500/30" },
              { title: "ديمو إدارة العملاء (CRM)", subtitle: "تتبع حالة العميل من الاهتمام وحتى إتمام البيع", color: "from-emerald-500/20 to-transparent", border: "border-emerald-500/30" },
              { title: "ديمو المساعد الاصطناعي", subtitle: "إجابات فورية وتقارير مالية لحظية بالنصوص", color: "from-purple-500/20 to-transparent", border: "border-purple-500/30" }
            ].map((demo, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.01 }}
                className="bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden group cursor-pointer relative"
              >
                <div className={`absolute top-0 right-0 w-full h-full bg-gradient-to-bl ${demo.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                <div className="grid md:grid-cols-2">
                  <div className="p-12 flex flex-col justify-center">
                    <h3 className="text-3xl font-black mb-3">{demo.title}</h3>
                    <p className="text-zinc-400 font-medium mb-8 text-lg">{demo.subtitle}</p>
                    <div className="flex items-center gap-4 text-primary font-bold">
                       <PlayCircle className="w-8 h-8" /> <span>بدء الجولة التفاعلية</span>
                    </div>
                  </div>
                  <div className="bg-zinc-800 border-r border-white/5 relative min-h-[300px] flex items-center justify-center overflow-hidden">
                     {/* Mock Browser/App Frame */}
                     <div className="w-[80%] h-[80%] bg-zinc-950 rounded-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="h-8 bg-zinc-900 border-b border-white/10 flex items-center px-4 gap-2">
                           <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                           <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        </div>
                        <div className="flex-1 p-4 flex items-center justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                           <MousePointer2 className="w-12 h-12 text-primary animate-bounce" />
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white" dir="rtl">
        <p className="text-zinc-600 text-sm font-medium">© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
