import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import { 
  BookOpen, 
  Receipt, 
  CreditCard, 
  Users, 
  FileText, 
  Truck, 
  Sparkles, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  ChevronRight, 
  HelpCircle, 
  Download, 
  Calculator, 
  ShieldCheck, 
  Cpu, 
  FileCode, 
  AlertTriangle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { resourcesArticles, Article } from "@/src/data/resourcesData";

export default function Resources() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) {
      setActiveTab(cat);
      const artId = params.get("article");
      if (artId) {
        const article = resourcesArticles.find(a => a.id === artId);
        if (article) {
          setSelectedArticle(article);
        } else {
          setSelectedArticle(null);
        }
      } else {
        setSelectedArticle(null);
      }
    } else {
      setActiveTab("all");
      setSelectedArticle(null);
    }
  }, [location.search]);

  // Tools state
  const [vatAmount, setVatAmount] = useState<string>("1000");
  const [vatRate, setVatRate] = useState<number>(15);
  const [vatResult, setVatResult] = useState<{ total: number; vat: number; beforeVat: number }>({ total: 1150, vat: 150, beforeVat: 1000 });

  const [wpsEmployees, setWpsEmployees] = useState<string>("10");
  const [wpsCompliant, setWpsCompliant] = useState<string>("9");
  const [wpsResult, setWpsResult] = useState<{ percentage: number; status: string; color: string }>({ percentage: 90, status: "نطاق آمن (أخضر مرتفع)", color: "text-emerald-400" });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "أكاديمية مدارج للمصادر والمعرفة | ZATCA, WPS & CRM Guides";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'دليلك الشامل للمتطلبات التنظيمية والفوترة الإلكترونية لـ هيئة الزكاة والجمارك (ZATCA)، حماية الأجور (WPS)، وإدارة المبيعات وسلاسل الإمداد في الخليج.');
    }
  }, []);

  // Recalculate VAT tool
  useEffect(() => {
    const val = parseFloat(vatAmount) || 0;
    const vat = (val * vatRate) / 100;
    setVatResult({
      total: val + vat,
      vat: vat,
      beforeVat: val
    });
  }, [vatAmount, vatRate]);

  // Recalculate WPS tool
  useEffect(() => {
    const empCount = parseFloat(wpsEmployees) || 1;
    const compCount = parseFloat(wpsCompliant) || 0;
    const percentage = Math.min(100, Math.max(0, Math.round((compCount / empCount) * 100)));
    let status = "نطاق آمن (أخضر مرتفع)";
    let color = "text-emerald-400";
    if (percentage < 80) {
      status = "نطاق حرج (أحمر) - قد يترتب غرامات وإيقاف خدمات";
      color = "text-rose-400";
    } else if (percentage < 90) {
      status = "نطاق متوسط (أصفر) - بحاجة لتحسين الالتزام فوراً";
      color = "text-amber-400";
    }
    setWpsResult({ percentage, status, color });
  }, [wpsEmployees, wpsCompliant]);

  const categories = [
    { id: "all", label: "كافة المصادر", icon: BookOpen },
    { id: "e-invoicing", label: "الفوترة الإلكترونية (ZATCA)", icon: Receipt },
    { id: "payroll", label: "مسير الرواتب وحماية الأجور", icon: CreditCard },
    { id: "crm", label: "إدارة العملاء و المبيعات", icon: Users },
    { id: "contracts", label: "العقود والتوثيق القانوني", icon: FileText },
    { id: "supply-chain", label: "سلاسل الإمداد والجمارك", icon: Truck },
    { id: "ai", label: "الأتمتة والذكاء الاصطناعي", icon: Sparkles }
  ];

  const articles: Article[] = resourcesArticles;

  const filteredArticles = articles.filter(art => {
    const matchesTab = activeTab === "all" || art.category === activeTab;
    const matchesSearch = 
      art.title.includes(searchQuery) || 
      art.excerpt.includes(searchQuery) || 
      art.tags.some(tag => tag.includes(searchQuery));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30" dir="rtl">
      <Navbar />

      <main className="pt-36 pb-24 relative overflow-hidden">
        {/* Decorative ambient background */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-zinc-400 mb-6"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>أكاديمية مدارج للمعرفة والمصادر</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6"
            >
              دليلك الشامل لـ <span className="text-primary">النمو والالتزام</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-zinc-400 font-medium leading-relaxed"
            >
              تصفح المقالات التقنية والقانونية الشاملة والآلات الحاسبة التفاعلية لامتثال متطلبات الزكاة والدخل وحماية الأجور WPS وإدارة صفقاتك بكفاءة.
            </motion.p>
          </div>

          {/* Interactive Tools Panel Quick Access */}
          <div className="grid lg:grid-cols-2 gap-8 mb-20">
            {/* Tool 1: VAT Calculator */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">حاسبة ضريبة القيمة المضافة السريعة (15%)</h3>
                  <p className="text-xs text-zinc-400">حساب قيمة الضريبة والمجموع الإجمالي أو العكس</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">المبلغ الخاضع للضريبة (ريال)</label>
                  <input 
                    type="number" 
                    value={vatAmount}
                    onChange={(e) => setVatAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">نسبة ضريبة القيمة المضافة (%)</label>
                  <select 
                    value={vatRate}
                    onChange={(e) => setVatRate(parseInt(e.target.value))}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    <option value={15}>15% (المملكة العربية السعودية)</option>
                    <option value={5}>5% (الإمارات والكويت وعمان)</option>
                    <option value={0}>0% (معفاة أو سلع خاصة)</option>
                  </select>
                </div>
              </div>

              <div className="bg-zinc-950/80 rounded-2xl p-6 border border-white/5 grid grid-cols-3 gap-4 text-center font-mono">
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 mb-1">المبلغ الأساسي</span>
                  <span className="text-sm font-black text-white">{vatResult.beforeVat.toLocaleString()} ريال</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 mb-1">قيمة الضريبة</span>
                  <span className="text-sm font-black text-primary">+{vatResult.vat.toLocaleString()} ريال</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-zinc-500 mb-1">المجموع الإجمالي</span>
                  <span className="text-base font-black text-emerald-400">{vatResult.total.toLocaleString()} ريال</span>
                </div>
              </div>
            </motion.div>

            {/* Tool 2: WPS Compliance Calculator */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black">حاسبة نسبة الالتزام لحماية الأجور WPS</h3>
                  <p className="text-xs text-zinc-400">تأكد من نطاق منشأتك لتجنب العقوبات وإيقاف الخدمات</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">إجمالي الموظفين بالتأمينات</label>
                  <input 
                    type="number" 
                    value={wpsEmployees}
                    onChange={(e) => setWpsEmployees(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 mb-2">عدد المطابقين في المسير</label>
                  <input 
                    type="number" 
                    value={wpsCompliant}
                    onChange={(e) => setWpsCompliant(e.target.value)}
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="bg-zinc-950/80 rounded-2xl p-6 border border-white/5 flex items-center justify-between font-sans">
                <div className="space-y-1">
                  <span className="block text-xs font-bold text-zinc-500">حالة النطاق في قوى</span>
                  <span className={`text-sm font-black ${wpsResult.color}`}>{wpsResult.status}</span>
                </div>
                <div className="text-left shrink-0">
                  <span className="block text-xs font-bold text-zinc-500 mb-1">النسبة</span>
                  <span className={`text-2xl font-black font-mono ${wpsResult.color}`}>{wpsResult.percentage}%</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Tabs Container */}
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12 bg-zinc-900/20 p-4 border border-white/5 rounded-[2rem] backdrop-blur-md">
            {/* Tab lists */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab(cat.id);
                    setSelectedArticle(null);
                  }}
                  className={`px-4 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeTab === cat.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
              <input 
                type="text" 
                placeholder="ابحث في المقالات والمصادر..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950/80 border border-white/10 rounded-full pr-11 pl-4 py-2.5 text-xs font-bold text-white placeholder-zinc-500 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Article List / Full Reader View */}
          <AnimatePresence mode="wait">
            {selectedArticle ? (
              <motion.div
                key="reader"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="bg-zinc-900/30 border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md relative"
              >
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                
                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer mb-8 outline-none"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                  <span>العودة إلى كافة المصادر المعرفية</span>
                </button>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary">
                    {categories.find(c => c.id === selectedArticle.category)?.label}
                  </span>
                  {selectedArticle.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white/5 border border-white/5 rounded-full text-[10px] font-bold text-zinc-400">
                      #{tag}
                    </span>
                  ))}
                  <span className="text-xs text-zinc-500 font-bold mr-auto">{selectedArticle.readTime} قراءة</span>
                </div>

                <h2 className="text-2xl md:text-4xl font-black text-white leading-tight mb-8">
                  {selectedArticle.title}
                </h2>

                <div className="prose prose-invert max-w-none text-zinc-300 font-medium leading-relaxed">
                  {selectedArticle.content}
                </div>

                <div className="border-t border-white/5 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-right">
                    <h4 className="text-white font-black text-base mb-1">هل تريد تطبيق هذا الامتثال في شركتك؟</h4>
                    <p className="text-xs text-zinc-400">يقدم نظام مدارج OS حلولاً مؤتمتة متوافقة بالكامل مع القوانين والتشريعات.</p>
                  </div>
                  <div className="flex gap-4">
                    <Link to="/demo" className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl text-xs font-black transition-colors">
                      تجربة النظام الحية
                    </Link>
                    <Link to="/app" className="px-5 py-3 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/95 shadow-md shadow-primary/25 transition-all">
                      ابدأ مجاناً الآن
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((art, idx) => {
                    const CatIcon = categories.find(c => c.id === art.category)?.icon || BookOpen;
                    return (
                      <motion.div
                        key={art.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.5 }}
                        className="bg-zinc-900/40 p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="flex gap-2 mb-6">
                          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0 text-primary">
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <span className="text-[10px] font-black text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1 my-auto mr-1">
                            {categories.find(c => c.id === art.category)?.label}
                          </span>
                        </div>

                        <h3 className="text-lg font-black text-white leading-tight mb-4 group-hover:text-primary transition-colors">
                          {art.title}
                        </h3>

                        <p className="text-zinc-400 font-medium text-xs leading-relaxed mb-6 flex-grow">
                          {art.excerpt}
                        </p>

                        <div className="flex items-center justify-between border-t border-white/5 pt-4 mt-auto">
                          <button 
                            onClick={() => setSelectedArticle(art)}
                            className="text-xs font-black text-white flex items-center gap-1.5 group-hover:text-primary transition-colors cursor-pointer outline-none"
                          >
                            <span>قراءة المقال كاملاً</span>
                            <ArrowLeft className="w-4 h-4 text-primary group-hover:-translate-x-1 transition-transform" />
                          </button>
                          <span className="text-[10px] font-bold text-zinc-500">{art.readTime}</span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center">
                    <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-zinc-400">لم يتم العثور على أي مصادر مطابقة لبحثك</h4>
                    <p className="text-xs text-zinc-500 mt-1">يرجى تعديل مصطلحات البحث أو اختيار فئة تصفح مختلفة.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Compliance Checklist section (agency grade layout) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-24 bg-gradient-to-r from-zinc-900/60 to-zinc-900/30 border border-white/10 rounded-[3.5rem] p-8 md:p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-400 mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span>دليل الجاهزية الرقمية للمؤسسات</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-6">
                  هل منشأتك جاهزة <span className="text-primary">لتفتيش هيئة الزكاة والموارد البشرية؟</span>
                </h2>
                <p className="text-zinc-400 font-medium leading-relaxed text-sm mb-8">
                  اضمن الامتثال الكامل وتجنب التعليق المفاجئ لخدمات رخص العمل وتأشيرات قوى أو الغرامات المالية للفوترة الإلكترونية من خلال استيفاء بنود الفحص الذاتي التالية.
                </p>

                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-zinc-300">الربط التلقائي للرواتب ومسيرات مدد مع التأمينات الاجتماعية شهرياً.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-zinc-300">توقيع الفواتير الضريبية الكلية رقمياً وبصيغة XML المتوافقة للمرحلة الثانية.</p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-zinc-300">حفظ وحماية السجلات المحاسبية والتعاملات من التعديل والتلاعب التاريخي.</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-950/80 border border-white/5 rounded-3xl p-8 relative">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-white font-black text-sm">محاكي فحص مطابقة المنشآت الآلي</h4>
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-black rounded-full uppercase">بيتا</span>
                </div>

                <div className="space-y-6">
                  <div className="bg-zinc-900/40 p-4 rounded-xl border border-white/5">
                    <h5 className="text-xs font-bold text-white mb-2">نوع منشأتك التجاري:</h5>
                    <div className="grid grid-cols-2 gap-2">
                      <button className="px-3 py-2 bg-primary border border-primary/20 text-white rounded-lg text-xs font-black text-center cursor-pointer">محدودة المسؤولية / كبرى</button>
                      <button className="px-3 py-2 bg-white/5 border border-white/5 hover:bg-white/10 text-zinc-400 rounded-lg text-xs font-bold text-center cursor-pointer">فردية / ناشئة</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-zinc-400 font-bold">جاهزية الفوترة الإلكترونية</span>
                           <span className="text-emerald-400 font-black">جاهز تماماً (100%)</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full w-full" />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-zinc-400 font-bold">جاهزية ملفات حماية الأجور</span>
                           <span className="text-emerald-400 font-black">جاهز تماماً (100%)</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 rounded-full w-full" />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-zinc-400 font-bold">جاهزية تكامل المنصات (قوى/مدد/موسان)</span>
                           <span className="text-amber-400 font-black">مكتمل جزئياً (75%)</span>
                        </div>
                        <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-400 rounded-full w-[75%]" />
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-black text-center transition-all flex items-center justify-center gap-2 cursor-pointer outline-none">
                     <Download className="w-4 h-4 text-primary" />
                     <span>تحميل دليلك التفصيلي المخصص (PDF)</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <footer className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium" dir="rtl">
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
