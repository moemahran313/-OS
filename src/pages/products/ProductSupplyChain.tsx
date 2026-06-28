import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import { 
  Truck, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Globe,
  Settings,
  Anchor,
  Box,
  Compass,
  ArrowLeft,
  ChevronRight,
  DollarSign
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductSupplyChain() {
  const [productCost, setProductCost] = useState(500);
  const [customsPct, setCustomsPct] = useState(5);
  const [brokerFee, setBrokerFee] = useState(350);
  const [transportFee, setTransportFee] = useState(1200);
  const [quantity, setQuantity] = useState(100);

  // Math for Landed Cost
  const totalBaseCost = productCost * quantity;
  const customsDuty = totalBaseCost * (customsPct / 100);
  const totalLandedCost = totalBaseCost + customsDuty + brokerFee + transportFee;
  const landedCostPerItem = quantity > 0 ? totalLandedCost / quantity : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "تتبع سلاسل الإمداد والشحنات الجمركية واللوجستية | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'لوحة تحكم ذكية لتتبع الحاويات والشحنات الجمركية وربطها المباشر مع منصة فسح لإدارة المخلصين وحساب التكلفة الفعلية الواصلة للمخازن بدقة.');
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden" dir="rtl">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-emerald-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md mb-8"
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-200">سلاسل الإمداد وتتبع الشحنات الجمركية والمخازن</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            تتبع جمركي لحظي. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-emerald-400 to-teal-300">من الموانئ حتى مستودعاتك بالكامل.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            أول نظام متكامل يربط المخلصين الجمركيين وتحديثات بوابة فسح، تتبع الشحنات والحاويات البحرية والجوية والبرية، حساب التكلفة الكلية للمنتج المستورد (Landed Cost)، والمزامنة اللحظية مع المخزون والموردين.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link to="/app/suppliers" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              افتح لوحة سلاسل الإمداد
            </Link>
            <Link to="/demo" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              عرض تفاعلي حي
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE LANDED COST CALCULATOR --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">أداة حساب تكلفة المنتج المستورد الإجمالية (Landed Cost)</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">احسب تكلفتك الفعلية الشاملة للجمارك والنقل والرسوم الإدارية لتقييم هوامش الربح.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left variables calculator input */}
            <div className="bg-zinc-950/80 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <span className="text-sm font-black text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  محاكاة وحساب هوامش الاستيراد
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-bold">حساب لحظي</span>
              </div>

              <div className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-black uppercase tracking-wider">سعر المنتج الأصلي من المورد (ر.س)</label>
                    <input 
                      type="number" 
                      value={productCost} 
                      onChange={(e) => setProductCost(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-black uppercase tracking-wider">الكمية المستوردة (قطعة)</label>
                    <input 
                      type="number" 
                      value={quantity} 
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-2 font-black uppercase tracking-wider">نسبة التعرفة الجمركية (٪)</label>
                    <input 
                      type="number" 
                      value={customsPct} 
                      onChange={(e) => setCustomsPct(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-black uppercase tracking-wider">رسوم التخليص والمخلص (ر.س)</label>
                    <input 
                      type="number" 
                      value={brokerFee} 
                      onChange={(e) => setBrokerFee(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-2 font-black uppercase tracking-wider">تكلفة الشحن والنقل الداخلي (ر.س)</label>
                    <input 
                      type="number" 
                      value={transportFee} 
                      onChange={(e) => setTransportFee(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl text-white font-black outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-2xl border border-white/5 space-y-2 pt-4">
                  <div className="flex justify-between text-zinc-400">
                    <span>قيمة الفاتورة الأساسية للمورد:</span>
                    <span>{totalBaseCost.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>الرسوم الجمركية المقدرة (٪{customsPct}):</span>
                    <span>{customsDuty.toLocaleString()} ر.س</span>
                  </div>
                  <div className="flex justify-between text-white text-sm pt-2 border-t border-white/5 font-black">
                    <span>التكلفة الكلية للشحنة:</span>
                    <span className="text-emerald-400">{totalLandedCost.toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right calculator output (Landed Cost per item) */}
            <div className="space-y-8">
              <div className="p-8 bg-zinc-900/50 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between">
                <div>
                  <span className="text-zinc-500 text-xs font-black uppercase tracking-wider block mb-2">تكلفة المنتج النهائي الواصل للمخزن (Landed Cost Per Item)</span>
                  <h3 className="text-5xl md:text-6xl font-black text-emerald-400 tracking-tight">
                    {landedCostPerItem.toFixed(1)} <span className="text-2xl text-white">ر.س / قطعة</span>
                  </h3>
                  <p className="text-zinc-400 text-sm font-bold mt-4 leading-relaxed">
                    هذا هو الرقم الحقيقي الذي يجب عليك تسعير منتجك ومنافسة السوق بناءً عليه. استخدام مدارج يمنع تماماً الخسائر الناتجة عن إغفال مصاريف الشحن أو رسوم التخليص والفسح الجمركي.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-white text-sm font-black mb-2">ربط مباشر مع منصات فسح</h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">أول لوحة تحكم تمنحك إشعارات وتحديثات جمركية لحظية للبضائع القادمة عبر الموانئ السعودية.</p>
                </div>

                <div className="p-4 bg-zinc-900/40 rounded-2xl border border-white/5">
                  <h4 className="text-white text-sm font-black mb-2">تحديث المخزون التلقائي</h4>
                  <p className="text-zinc-400 text-xs font-medium leading-relaxed">بمجرد فسح الحاوية ودخول البضاعة للمستودع في الرياض، يتم تحديث الأرصدة تلقائياً في المخزن.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* --- AGENY DESIGN: CORE FEATURES GRID --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">تحكّم مطلق بسلاسل الإمداد والتوريد</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">أتمتة ذكية تفصل بين مرحلة التصنيع بالخارج ووصول الحاويات لشركة النقل المحلية.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-6">
                <Anchor className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">ملفات المخلصين الجمركيين</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                أنشئ قاعدة بيانات بجميع المخلصين المعتمدين لديك في الموانئ السعودية (ميناء الملك عبد العزيز، ميناء جدة الإسلامي، إلخ) وشارك المستندات والملفات والمدفوعات المالية معهم تلقائياً.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-6">
                <Box className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">حسابات الإيرادات والأرصدة</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                اربط حركة الشحن ومستندات بوالص الشحن الجمركي مباشرةً مع حسابات الموردين في الخارج وتسهيل الدفعات بالدولار أو العملات الأجنبية مع مراجعة هوامش التحويل المصرفي.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 w-fit mb-6">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">رؤية لوجستية كاملة للرئيس التنفيذي</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                لوحات تحكم ومؤشرات تتبع الشحنات الجارية والمتوقع وصولها تتيح للمجلس التنفيذي تخطيط الحملات التسويقية والبيعية وتحديد الموازنات بدقة وثقة عالية.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- REUSABLE BIG FINAL CTA --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-gradient-to-t from-primary/10 via-transparent to-transparent relative border-t border-white/5"
      >
        <div className="container mx-auto px-6 max-w-5xl text-center relative z-10">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-6 animate-pulse" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
            سيطر على حركة بضائعك وعقود التوريد بكفاءة كاملة.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            انضم إلى شركات الاستيراد والتوزيع السعودية الرائدة التي تبني أعمالها اللوجستية بالكامل عبر مدارج OS.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              ابدأ التتبع مجاناً
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              احجز جلسة استشارة لوجستية
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium text-sm" dir="rtl">
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
