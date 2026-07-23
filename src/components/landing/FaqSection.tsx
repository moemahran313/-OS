import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle, Sparkles, ShieldCheck, MessageCircle } from "lucide-react";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "هل نظام مدارج معتمد رسمياً من هيئة الزكاة والضريبة والجمارك (ZATCA) للمرحلة الثانية؟",
      a: "نعم 100%. ينشئ النظام الفواتير الضريبية والتبسيطية بصيغة UBL 2.1 XML ويقوم بتوقيعها إلكترونياً بأسلوب التشفير ECDSA secp256k1 مع توليد الـ QR Code الخاص بالهيئة وإرسالها مباشرة للتطهير (Clearance) أو الإبلاغ (Reporting) لحظياً دون الحاجة لوسيط ثالث.",
    },
    {
      q: "كيف يضمن النظام التوافق مع منصة 'مدد' ونظام حماية الأجور (WPS)؟",
      a: "يولد مدارج ملفات الرواتب بصيغة SIF القياسية التاب المعتمدة لدى البنك المركزي السعودي (SAMA) ومنصة مدد. يتضمن الملف السجلات الإلزامية (14 للهيدر، 15 للموظف) مع احتساب استقطاعات التأمينات الاجتماعية (GOSI) وبدون أي تعديل يدوي قد يرفضه البنك.",
    },
    {
      q: "هل يمكنني نقل بياناتي وفواتيري السابقة من قيود (Qoyod) أو زوهو بوكس (Zoho Books) أو أكسيل؟",
      a: "بالتأكيد. يوفر فريقنا الفني خدمة نقل البيانات مجاناً خلال 24 ساعة. نستورد شجرة الحسابات، قائمة العملاء، المنتجات، والفواتير السابقة دون أن يتعطل عملك ليوم واحد.",
    },
    {
      q: "هل يفرض مدارج أي رسوم إضافية على الرسائل أو المعاملات أو لكل مستخدم (Per Seat)؟",
      a: "لا إطلاقاً. نحن نؤمن بالشفافية المطلقة وفق فلسفة أوجلفي. لا توجد رسوم خفية لكل مستخدم، ويمكنك ربط حساب الواتساب الخاص بشركتك عبر API السحابي المباشر دون دفع عمولات وساطة على كل رسالة.",
    },
    {
      q: "كيف يتعامل النظام مع العنوان الوطني السعودي (SPL)؟",
      a: "يتكامل النظام عبر وكيل آمن Proxy مع API البريد السعودي (api.address.gov.sa)، مما يتيح لك التحقق التلقائي من الرمز البريدي والرقم الإضافي والحي مع كل عميل جديد لمنع أخطاء الشحن والعقود.",
    },
    {
      q: "ما هي مدى أمان وخصوصية البيانات؟ وهل يتم استضافة البيانات داخل المملكة؟",
      a: "بياناتك محفوظة ومعالجة وفق أعلى معايير الخصوصية والسيادة الوطنية KSA Cloud Infrastructure مع سجلات مراجعة مشفرة بـ SHA-256 لتتبع كافة العمليات الحساسة، بالإضافة لإمكانية العمل حتى في حال انقطاع الاتصال مؤقتاً.",
    },
    {
      q: "هل يتيح النظام إصدار وتوقيع العقود إلكترونياً؟",
      a: "نعم، يحتوي مدارج على منصة توقيع رقمية عالية الدقة 300 DPI تتيح للعملاء والموظفين التوقيع بيومترياً على العقود والاتفاقيات مع تثبيت البصمة الرقمية والختم الزمني قانونياً.",
    },
    {
      q: "ما الذي أحتاجه للبدء مع مدارج الآن؟",
      a: "لا تحتاج سوى النقر على 'ابدأ مجاناً الآن'. يمكنك إعداد حسابك ورفع شعار شركتك وإصدار أول فاتورة ضريبية معتمدة خلال أقل من 60 ثانية بدون بطاقة إلكترونية.",
    },
  ];

  // Inject Google Schema.org FAQPage JSON-LD into Document Head for Rich Snippets SEO
  useEffect(() => {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map((faq) => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a,
        },
      })),
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "mudarij-faq-schema";
    script.innerHTML = JSON.stringify(schemaData);

    const existingScript = document.getElementById("mudarij-faq-schema");
    if (existingScript) {
      existingScript.remove();
    }
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById("mudarij-faq-schema");
      if (el) el.remove();
    };
  }, []);

  return (
    <section id="faq" className="py-28 bg-zinc-50 text-zinc-900 border-t border-zinc-200" dir="rtl">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black tracking-wide mb-6 border border-emerald-200">
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>الأسئلة الشائعة والشفافية القانونية</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-zinc-900">
            كل ما تحتاج معرفته عن <br />
            <span className="text-emerald-600">التحول إلى نظام مدارج المحاسبي</span>
          </h2>
          <p className="text-zinc-500 font-medium text-base mt-3">
            إجابات دقيقة ومستفيضة تضع بين يديك الحقائق الفنية والقانونية قبل اتخاذ القرار.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-sm hover:border-zinc-300 transition-all"
              >
                <button
                  onClick={() => {
                    setOpenIndex(isOpen ? null : idx);
                    trackLandingEvent(`فتح سؤال FAQ: ${faq.q.slice(0, 30)}`, "FAQ_TOGGLE");
                  }}
                  className="w-full text-right p-6 flex justify-between items-center gap-4 font-black text-base md:text-lg text-zinc-900 focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? "bg-emerald-600 text-white rotate-180" : "bg-zinc-100 text-zinc-500"
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-zinc-600 leading-relaxed font-medium border-t border-zinc-100">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
