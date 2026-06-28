import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  ArrowLeft, 
  TrendingUp, 
  Workflow, 
  Clock, 
  Layers, 
  Sparkles,
  Search,
  Filter,
  Plus,
  Send,
  Building
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductCRM() {
  const [pipelineState, setPipelineState] = useState([
    { id: 1, name: "مستشفى الموسى", stage: "lead", value: 45000, date: "قبل ساعتين", company: "رعاية طبية" },
    { id: 2, name: "مجموعة الشايع", stage: "contacted", value: 120000, date: "يوم أمس", company: "تجزئة وأغذية" },
    { id: 3, name: "عقارات الماجدية", stage: "proposal", value: 350000, date: "قبل ٣ أيام", company: "تطوير عقاري" },
    { id: 4, name: "مكتبة جرير", stage: "negotiation", value: 85000, date: "قبل ٥ أيام", company: "تجزئة والكترونيات" },
  ]);

  const [whatsappMock, setWhatsappMock] = useState([
    { id: 1, sender: "م. أحمد الغامدي", text: "أهلاً بك، نود الاستفسار عن تفاصيل عرض تسعير الفواتير والمخازن", time: "10:15 ص", parsed: false },
    { id: 2, sender: "سارة الهاشم", text: "تمت الموافقة المبدئية على بنود العقد وسنرسل السجل التجاري قريباً", time: "09:30 ص", parsed: true }
  ]);

  const [activeStageFilter, setActiveStageFilter] = useState("all");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "إدارة علاقات العملاء الذكية CRM | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', 'نظام إدارة علاقات العملاء (CRM) المتكامل من مدارج OS. تتبع مسار صفقاتك ومبيعاتك، أرشفة محادثات واتساب تلقائياً، وأغلق الصفقات بذكاء وسرعة.');
  }, []);

  const handleDragStage = (id: number, newStage: string) => {
    setPipelineState(prev => prev.map(item => item.id === id ? { ...item, stage: newStage } : item));
  };

  const parseMessageToLead = (id: number) => {
    const msg = whatsappMock.find(m => m.id === id);
    if (!msg) return;
    
    // Add to pipeline
    const newLead = {
      id: Date.now(),
      name: msg.sender,
      stage: "lead",
      value: 15000 + Math.floor(Math.random() * 50000),
      date: "الآن عبر واتساب",
      company: "استفسار وارد"
    };

    setPipelineState(prev => [newLead, ...prev]);
    setWhatsappMock(prev => prev.map(m => m.id === id ? { ...m, parsed: true } : m));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden" dir="rtl">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-blue-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-8"
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-200">نظام إدارة علاقات العملاء الذكي (CRM)</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            لا تفقد عميلاً واحداً بعد الآن. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-blue-400 to-cyan-300">أغلق صفقاتك بذكاء خارق.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            مسارات مبيعات تفاعلية، ربط تلقائي ومباشر برقم واتساب الخاص بشركتك، وتوليد بطاقات العملاء الفورية بالذكاء الاصطناعي مع تحليلات ذكية ومقاييس حية.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link to="/app/crm" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              جرب الـ CRM في النظام
            </Link>
            <Link to="/demo" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              عرض تفاعلي مباشر
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- REVOLUTIONARY PIPELINE SIMULATOR (Interactive Mockup) --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">مسار مبيعات سلس مثل البريد الإلكتروني</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">تفاعل مع المحاكاة أدناه لتغيير حالات العملاء بالضغط على الأزرار.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-zinc-950/80 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
            {/* Lead stage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm font-black text-blue-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  عملاء محتملين (Leads)
                </span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg font-bold">
                  {pipelineState.filter(p => p.stage === "lead").length}
                </span>
              </div>
              <div className="space-y-3 min-h-[220px]">
                {pipelineState.filter(p => p.stage === "lead").map(item => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="p-4 bg-zinc-900/80 border border-white/5 rounded-2xl shadow-sm hover:border-blue-500/20 transition-all"
                  >
                    <p className="text-xs text-zinc-500 font-bold mb-1">{item.company}</p>
                    <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-emerald-400 font-black">{item.value.toLocaleString()} ر.س</span>
                      <button 
                        onClick={() => handleDragStage(item.id, "contacted")}
                        className="text-[10px] text-blue-400 hover:underline font-bold"
                      >
                        نقل للمتابعة &larr;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Contacted stage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  قيد التواصل
                </span>
                <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg font-bold">
                  {pipelineState.filter(p => p.stage === "contacted").length}
                </span>
              </div>
              <div className="space-y-3 min-h-[220px]">
                {pipelineState.filter(p => p.stage === "contacted").map(item => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="p-4 bg-zinc-900/80 border border-white/5 rounded-2xl shadow-sm hover:border-amber-500/20 transition-all"
                  >
                    <p className="text-xs text-zinc-500 font-bold mb-1">{item.company}</p>
                    <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-emerald-400 font-black">{item.value.toLocaleString()} ر.س</span>
                      <button 
                        onClick={() => handleDragStage(item.id, "proposal")}
                        className="text-[10px] text-amber-400 hover:underline font-bold"
                      >
                        تقديم عرض &larr;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Proposal stage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm font-black text-purple-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  تقديم العروض والحلول
                </span>
                <span className="text-xs bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded-lg font-bold">
                  {pipelineState.filter(p => p.stage === "proposal").length}
                </span>
              </div>
              <div className="space-y-3 min-h-[220px]">
                {pipelineState.filter(p => p.stage === "proposal").map(item => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="p-4 bg-zinc-900/80 border border-white/5 rounded-2xl shadow-sm hover:border-purple-500/20 transition-all"
                  >
                    <p className="text-xs text-zinc-500 font-bold mb-1">{item.company}</p>
                    <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-emerald-400 font-black">{item.value.toLocaleString()} ر.س</span>
                      <button 
                        onClick={() => handleDragStage(item.id, "negotiation")}
                        className="text-[10px] text-purple-400 hover:underline font-bold"
                      >
                        نقل للتفاوض &larr;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Negotiation stage */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <span className="text-sm font-black text-emerald-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  مفاوضات نهائية وعقود
                </span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg font-bold">
                  {pipelineState.filter(p => p.stage === "negotiation").length}
                </span>
              </div>
              <div className="space-y-3 min-h-[220px]">
                {pipelineState.filter(p => p.stage === "negotiation").map(item => (
                  <motion.div 
                    layout
                    key={item.id}
                    className="p-4 bg-zinc-900/80 border border-white/5 rounded-2xl shadow-sm hover:border-emerald-500/20 transition-all"
                  >
                    <p className="text-xs text-zinc-500 font-bold mb-1">{item.company}</p>
                    <h4 className="text-sm font-bold text-white mb-2">{item.name}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono text-emerald-400 font-black">{item.value.toLocaleString()} ر.س</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 py-0.5 px-2 rounded-md font-bold">عقد جاري</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- INTEGRATED WHATSAPP LEADS GENERATOR --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 relative overflow-hidden"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Left Copy Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-black uppercase">
                <MessageSquare className="w-4 h-4" />
                تحويل المحادثات إلى تدفقات نقدية
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                أول نظام مبيعات متكامل <span className="text-emerald-400">بخدمات واتساب السحابية</span> للشركات السعودية.
              </h2>
              <p className="text-zinc-400 font-medium text-lg leading-relaxed">
                معظم صفقاتك تجري على واتساب، لكنك تفقد السيطرة على البيانات. مدارج يحل هذه المشكلة جذرياً: يستقبل النظام رسائل العملاء، ويحللها بالذكاء الاصطناعي، ويقترح عليك تحويلها فوراً إلى صفقة CRM جديدة بضغطة زر، دون أي إدخال يدوي مجهد.
              </p>
              
              <div className="space-y-4">
                {[
                  "أرشفة رسمية متكاملة لبيانات التواصل ومستندات العملاء.",
                  "تحليل نصوص المحادثات واكتشاف نية الشراء تلقائياً.",
                  "إرسال تنبيهات المتابعة والروابط المالية للعملاء عبر نفس القناة."
                ].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span className="text-zinc-200 text-base font-bold">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Interactive WhatsApp Visual */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="p-8 bg-zinc-900/90 border border-white/10 rounded-[2.5rem] shadow-2xl relative z-10 font-sans max-w-md mx-auto">
                <div className="flex items-center gap-3 pb-6 border-b border-white/5 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
                    <MessageSquare className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">مركز واردات الواتساب (المحاكاة)</h4>
                    <p className="text-[10px] text-zinc-400 font-medium">الرسائل الواردة غير المعالجة</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {whatsappMock.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "p-4 rounded-2xl transition-all border",
                        msg.parsed ? "bg-zinc-950/40 border-zinc-800 opacity-60" : "bg-zinc-900 border-emerald-500/30 shadow-md shadow-emerald-500/5"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-black text-white">{msg.sender}</span>
                        <span className="text-[10px] text-zinc-500 font-bold">{msg.time}</span>
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium mb-3">{msg.text}</p>
                      
                      {!msg.parsed ? (
                        <button
                          onClick={() => parseMessageToLead(msg.id)}
                          className="w-full py-2 bg-emerald-500 text-zinc-950 text-xs font-black rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>تحويل تلقائي لصفقة CRM</span>
                        </button>
                      ) : (
                        <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 justify-center py-1 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>تم المعالجة بنجاح وإدراجه في الـ CRM</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.section>

      {/* --- AGENY DESIGN: DETAILED RICH DATA CARDS --- */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">مصمم للفرق عالية الأداء</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">من الإثارة الأولى وحتى آخر توقيع وعقد، كل التفاعلات في منصة واحدة.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-6">
                <Workflow className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">مسارات مخصصة لقطاعك</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                سواء كنت تعمل في المقاولات أو الخدمات أو التجزئة، يمكنك تهيئة وتخصيص مسار المبيعات والصفقات ليتطابق تماماً مع طبيعة دورة مبيعات شركتك وتحديد المسؤوليات لكل فرد في فريقك.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 w-fit mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">سجل نشاط متكامل للعميل</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                أول خط زمني حقيقي متكامل يجمع كل الاتصالات والملاحظات والعروض والمستندات والفواتير الصادرة والمدفوعة لنفس العميل في شاشة واحدة لسرعة الوصول والفهم الكامل لرحلة العميل.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 w-fit mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">ذكاء التحليلات والتوقع</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                توقع حجم المبيعات والإيرادات المتوقع تحصيلها خلال الأشهر القادمة بناءً على نسب إغلاق صفقاتك السابقة ونسب نجاح المراحل المختلفة لسرعة اتخاذ القرار المالي.
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
            كن مستعداً لإدارة مبيعاتك بكفاءة ١٠ أضعاف.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            انضم إلى مئات الشركات السعودية والخليجية التي تدير صفقاتها وعملائها بالكامل عبر نظام تشغيل مدارج OS.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/app" className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20">
              ابدأ الآن مجاناً وبدون بطاقة
            </Link>
            <Link to="/contact" className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all">
              تحدث مع الخبراء
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
