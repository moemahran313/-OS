import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import Navbar from "@/src/components/Navbar";
import {
  FileText,
  CheckCircle,
  Sparkles,
  ShieldAlert,
  Code,
  Lock,
  Edit3,
  Globe,
  Plus,
  Layers,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

export default function ProductContracts() {
  const [selectedTemplate, setSelectedTemplate] = useState("employment");
  const [contractVariables, setContractVariables] = useState({
    firstParty: "شركة مدارج لتقنية المعلومات",
    secondParty: "خالد بن عبد الله الدوسري",
    salary: "12,500",
    duration: "سنة واحدة",
    projectName: "مشروع البرج الذكي بمركز الملك عبد الله المالي",
  });

  const templates = [
    { id: "employment", name: "عقد عمل موحد (سعودي)" },
    { id: "muqawala", name: "عقد مقاولات وإنشاءات" },
    { id: "nda", name: "اتفاقية عدم الإفصاح (NDA)" },
    { id: "consulting", name: "اتفاقية تقديم خدمات استشارية" },
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "العقود والاتفاقيات الذكية والتوقيع الإلكتروني المعتمد | مدارج OS";
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "صياغة وتوليد وتوقيع العقود إلكترونياً بختم مرجعي موثق ومتوافق مع المحاكم السعودية. مكتبة من قوالب العقود المجهزة من مستشارين قانونيين."
    );
  }, []);

  return (
    <div
      className="min-h-screen bg-zinc-950 text-white font-sans antialiased selection:bg-primary/30 overflow-hidden public-dark-page"
      dir="rtl"
    >
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-44 pb-24 md:pt-56 md:pb-36 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[300px] bg-purple-500/10 blur-[140px] rounded-full point-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[250px] bg-primary/10 blur-[120px] rounded-full point-events-none" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md mb-8"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-200">
              العقود والاتفاقيات الذكية والتوقيع الإلكتروني
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
          >
            عقودك واتفاقياتك قانونية. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-l from-white via-purple-400 to-pink-300">
              وموقّعة إلكترونياً بختم معتمد وموثق.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 font-medium max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            مكتبة متكاملة من قوالب العقود المعدة من قبل مستشارين قانونيين، تعبئة تلقائية لمتغيرات
            العقود، إرسال فوري لروابط التوقيع الرقمي الآمن، وأرشيف سحابي مشفر يغنيك عن المستندات
            الورقية وتكاليف التوثيق التقليدي.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-24"
          >
            <Link
              to="/app/contracts"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              ابدأ صياغة عقدك الأول
            </Link>
            <Link
              to="/demo"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              احصل على جولة مباشرة
            </Link>
          </motion.div>
        </div>
      </section>

      {/* --- INTERACTIVE CONTRACT BUILDER SIMULATOR --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-900/30 border-y border-white/5 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              مولّد العقود والاتفاقيات التفاعلي
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              اختر نوع العقد وقم بتعديل المتغيرات لتحديث صياغته القانونية فورياً.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left variables config (4 cols) */}
            <div className="lg:col-span-5 bg-zinc-950/85 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-zinc-400 mb-3 uppercase tracking-wider">
                    اختر قالب العقد المعتمد
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t.id)}
                        className={cn(
                          "w-full px-4 py-3 rounded-xl border text-xs text-right font-bold transition-all flex items-center justify-between",
                          selectedTemplate === t.id
                            ? "bg-purple-500/10 border-purple-500 text-purple-400"
                            : "bg-zinc-900 border-white/5 text-zinc-400 hover:bg-zinc-800"
                        )}
                      >
                        <span>{t.name}</span>
                        {selectedTemplate === t.id && <CheckCircle className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-6 space-y-4">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-wider block">
                    متغيرات وبنود العقد الذكية
                  </span>

                  {selectedTemplate === "employment" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">
                          الطرف الأول (المنشأة)
                        </label>
                        <input
                          type="text"
                          value={contractVariables.firstParty}
                          onChange={(e) =>
                            setContractVariables({
                              ...contractVariables,
                              firstParty: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-xs bg-zinc-900 border border-white/5 rounded-xl text-white font-bold focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-zinc-500 font-bold mb-1">
                          الطرف الثاني (الموظف)
                        </label>
                        <input
                          type="text"
                          value={contractVariables.secondParty}
                          onChange={(e) =>
                            setContractVariables({
                              ...contractVariables,
                              secondParty: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 text-xs bg-zinc-900 border border-white/5 rounded-xl text-white font-bold focus:border-purple-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-bold mb-1">
                            الراتب الأساسي (ر.س)
                          </label>
                          <input
                            type="text"
                            value={contractVariables.salary}
                            onChange={(e) =>
                              setContractVariables({ ...contractVariables, salary: e.target.value })
                            }
                            className="w-full px-4 py-2 text-xs bg-zinc-900 border border-white/5 rounded-xl text-white font-bold focus:border-purple-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-zinc-500 font-bold mb-1">
                            مدة العقد
                          </label>
                          <input
                            type="text"
                            value={contractVariables.duration}
                            onChange={(e) =>
                              setContractVariables({
                                ...contractVariables,
                                duration: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 text-xs bg-zinc-900 border border-white/5 rounded-xl text-white font-bold focus:border-purple-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedTemplate !== "employment" && (
                    <p className="text-zinc-500 text-xs font-bold leading-relaxed py-4 text-center">
                      القوالب الإضافية تتيح ربطاً ذكياً بمتغيرات المشاريع وعقود الفسح الجمركي
                      تلقائياً.
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <Link
                  to="/app/contracts"
                  className="w-full py-3.5 bg-purple-500 text-zinc-950 font-black rounded-xl hover:bg-purple-400 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span>استكمال وتصدير التوقيع الإلكتروني</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right dynamic contract visual (7 cols) */}
            <div className="lg:col-span-7 bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl flex flex-col justify-between">
              <div className="p-6 bg-zinc-950 rounded-2xl border border-white/5 min-h-[380px] font-sans text-xs leading-relaxed text-zinc-400 space-y-4 shadow-inner overflow-y-auto max-h-[450px]">
                <div className="text-center font-black text-sm text-white mb-6">
                  {selectedTemplate === "employment"
                    ? "عقد عمل موحد ومطابق للأنظمة"
                    : "صياغة قانونية متوافقة مع القضاء السعودي"}
                </div>

                {selectedTemplate === "employment" ? (
                  <>
                    <p>أنه في هذا اليوم تم الاتفاق بين كل من:</p>
                    <p className="p-3 bg-zinc-900 rounded-xl border border-white/5 text-white font-bold">
                      <span className="text-zinc-500 font-medium">الطرف الأول (صاحب العمل): </span>
                      {contractVariables.firstParty}
                    </p>
                    <p className="p-3 bg-zinc-900 rounded-xl border border-white/5 text-white font-bold">
                      <span className="text-zinc-500 font-medium">الطرف الثاني (الموظف): </span>
                      {contractVariables.secondParty}
                    </p>
                    <p>
                      <strong>البند الأول - موضوع العقد:</strong> يلتزم الطرف الثاني بموجب هذا العقد
                      بالعمل تحت إدارة وإشراف الطرف الأول بمهنة تتطابق مع لوائح المنظمة وتوجيهات
                      المدير التنفيذي وتحدد مدة هذا العقد بـ{" "}
                      <span className="text-purple-400 font-bold">
                        {contractVariables.duration}
                      </span>{" "}
                      تبدأ من تاريخ توقيع الطرفين.
                    </p>
                    <p>
                      <strong>البند الثاني - الأجر والبدلات:</strong> يلتزم الطرف الأول بصرف أجر
                      شهري إجمالي وقدره{" "}
                      <span className="text-emerald-400 font-bold">
                        {contractVariables.salary} ر.س
                      </span>{" "}
                      يلتزم بتحويله بنهاية كل شهر ميلادي وفقاً لأنظمة برنامج حماية الأجور المعتمد في
                      المملكة العربية السعودية.
                    </p>
                  </>
                ) : (
                  <p className="text-center text-zinc-500 py-12 font-bold">
                    جاري تحميل بنود ومواد {templates.find((t) => t.id === selectedTemplate)?.name}{" "}
                    المتكاملة...
                  </p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-zinc-500 font-bold">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  معتمد قانونياً ومطابق للمحاكم العمالية والتجارية بالمملكة
                </span>
                <span>SHA-256 الخاتم الرقمي: 8a4c9b...</span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* --- CORE CONTRACT FEATURES BENTO GRID --- */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="py-24 bg-zinc-950 relative"
      >
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              التوقيع القانوني الأكثر أماناً وسهولة
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              صياغة وتوقيع وأرشفة العقود من شاشة واحدة تحافظ على سير الأعمال.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/10 w-fit mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">شهادة إثبات التوقيع الإلكتروني</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                يصدر النظام مع كل عقد موقّع إلكترونياً شهادة إثبات تتضمن الأرقام المرجعية، العناوين
                الرقمية (IP)، تأكيد النية، والتوثيق عبر رمز التحقق الذي يصل لأجهزة الموقعين لضمان
                حجية التوقيع.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 w-fit mb-6">
                <Edit3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">حقول توقيع تفاعلية وسريعة</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                يمكن للطرف الآخر توقيع الاتفاقية أو العقد عبر الجوال أو الجهاز اللوحي مباشرة برسم
                التوقيع بخط اليد أو التوقيع بالاسم المطبوع دون الحاجة لطابعة أو ماسح ضوئي.
              </p>
            </div>

            <div className="p-8 rounded-[2rem] border border-white/5 bg-zinc-900/40 relative overflow-hidden group hover:border-white/10 transition-colors">
              <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/10 w-fit mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white mb-3">
                التحكم في تواريخ الانتهاء والتجديد
              </h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                نظام تنبيهات ذكي ينبه الأطراف المعنية تلقائياً قبل حلول تاريخ انتهاء العقد أو الحاجة
                لتجديده بـ 30 أو 60 يوماً لضمان قانونية استمرار الأعمال وعدم إيقاف الخدمات.
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
            حافظ على صفقات منشأتك موثقة وقانونية وآمنة.
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            التقِ بالجيل القادم من التواقيع الإلكترونية والعقود الذكية المعززة بحلول تشغيل مدارج OS
            المتطورة.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/app"
              className="px-8 py-4 bg-primary text-white font-black rounded-2xl text-lg hover:scale-105 transition-all shadow-lg shadow-primary/20"
            >
              ابدأ صياغة عقودك مجاناً
            </Link>
            <Link
              to="/contact"
              className="px-8 py-4 bg-white/5 border border-white/10 text-zinc-300 font-bold rounded-2xl text-lg hover:bg-white/10 transition-all"
            >
              احجز موعد شرح وتوضيح فني
            </Link>
          </div>
        </div>
      </motion.section>

      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-zinc-500 font-medium text-sm"
        dir="rtl"
      >
        <p>© 2024 Mudarij OS. صُنع بفخر للشركات الخليجية.</p>
      </footer>
    </div>
  );
}
