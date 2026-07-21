import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  CreditCard,
  Users,
  PenTool,
  Package,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Building,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  Lock,
} from "lucide-react";
import { Link } from "react-router-dom";
import { trackLandingEvent } from "@/src/services/landingTracker";

export const ModulePlaygroundSection = () => {
  const [activeTab, setActiveTab] = useState<"zatca" | "wps" | "crm" | "contracts" | "inventory">("zatca");

  const modules = [
    {
      id: "zatca",
      title: "الفوترة والربط مع ZATCA",
      subtitle: "المرحلة الثانية (الفلترة والربط)",
      icon: FileText,
      badge: "معتمد 100%",
    },
    {
      id: "wps",
      title: "مسير الرواتب و'مدد'",
      subtitle: "نظام حماية الأجور (WPS SIF)",
      icon: CreditCard,
      badge: "البنك المركزي",
    },
    {
      id: "crm",
      title: "إدارة العملاء والعنوان الوطني",
      subtitle: "تكامل مباشر مع SPL API",
      icon: Users,
      badge: "البريد السعودي",
    },
    {
      id: "contracts",
      title: "العقود والتوقيع البيومتري",
      subtitle: "دقة 300 DPI وتوثيق قانوني",
      icon: PenTool,
      badge: "موثق قانونياً",
    },
    {
      id: "inventory",
      title: "المخزون والربط التجاري",
      subtitle: "تزامن لحظي مع سلة وزد",
      icon: Package,
      badge: "متعدد الفروع",
    },
  ];

  return (
    <section id="features-playground" className="py-28 bg-zinc-900 text-white relative overflow-hidden" dir="rtl">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 max-w-7xl relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-emerald-400 text-xs font-black tracking-wide mb-6">
            <Sparkles className="w-4 h-4" />
            <span>مختبر المعاينة التفاعلية الحية</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            استكشف المحرك السيادي لـ <br />
            <span className="text-emerald-400">دعائم التشغيل الـ 9 في منصتك</span>
          </h2>
          <p className="text-zinc-400 text-lg font-medium mt-4">
            انقر على الوحدة التنفيذية أدناه للرؤية المباشرة لكيفية معالجة النظام للبيانات المشفرة بالثواني.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  setActiveTab(m.id as any);
                  trackLandingEvent(`استكشاف وحدة: ${m.title}`, "MODULE_TAB_CLICK");
                }}
                className={`px-5 py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 font-bold text-xs md:text-sm border ${
                  isActive
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20 scale-105"
                    : "bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:border-white/20"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-emerald-400"}`} />
                <div className="text-right">
                  <span className="block font-black">{m.title}</span>
                  <span className={`text-[10px] block font-normal ${isActive ? "text-emerald-100" : "text-zinc-400"}`}>
                    {m.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tab Interactive Preview Box */}
        <div className="bg-zinc-950 border border-white/10 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">
          <AnimatePresence mode="wait">
            {/* ZATCA TAB */}
            {activeTab === "zatca" && (
              <motion.div
                key="zatca"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    <ShieldCheck className="w-4 h-4" />
                    <span>ZATCA Phase 2 Cleared & Signed</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">الفوترة الضريبية الإلكترونية المباشرة</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    النظام يولّد تلقائياً ملفات UBL 2.1 XML ويوقعها بـ ECDSA secp256k1، مع تشفير Hashing وتوليد QR Code بمعايير Base64/TLV الصارمة لهيئة الزكاة دون أي تدخل يدوي.
                  </p>
                  <div className="space-y-3 text-xs text-zinc-300 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>دعم الفواتير الضريبية (B2B) والتبسيطية (B2C)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>إرسال تلقائي للقرارات الضريبية والإصدار خلال 0.03 ثانية</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>احتساب تلقائي لضريبة القيمة المضافة 15% وإنشاء الإقرار الربعي</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-zinc-900 border border-white/10 rounded-3xl p-6 font-mono text-xs text-zinc-300 space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <span className="text-emerald-400 font-bold">INV-2026-8841.xml</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-sans">
                      ZATCA STATUS: REPORTED (200 OK)
                    </span>
                  </div>
                  <div className="bg-black/60 p-4 rounded-xl text-[11px] text-emerald-400 overflow-x-auto space-y-1">
                    <p>&lt;Invoice xmlns=&quot;urn:oasis:names:tc:ubl:schema:xsd:Invoice-2&quot;&gt;</p>
                    <p className="pl-4 text-zinc-400">&lt;cbc:ID&gt;INV-2026-8841&lt;/cbc:ID&gt;</p>
                    <p className="pl-4 text-zinc-400">&lt;cbc:UUID&gt;3f82a901-7b32-4d91&lt;/cbc:UUID&gt;</p>
                    <p className="pl-4 text-amber-300">&lt;cac:TaxTotal&gt;15.00 SAR&lt;/cac:TaxTotal&gt;</p>
                    <p className="pl-4 text-cyan-300">&lt;ds:SignatureValue&gt;MEQCID8x9Z...3a/==&lt;/ds:SignatureValue&gt;</p>
                    <p>&lt;/Invoice&gt;</p>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div className="w-16 h-16 bg-white p-1 rounded-xl flex items-center justify-center shrink-0">
                      <QrCode className="w-14 h-14 text-black" />
                    </div>
                    <div>
                      <p className="font-sans font-bold text-white text-xs">رمز الاستجابة السريع (TLV QR)</p>
                      <p className="font-sans text-[11px] text-zinc-400">يتضمن اسم المورد، الرقم الضريبي، الختم الزمني، والمجموع مع الضريبة</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* WPS TAB */}
            {activeTab === "wps" && (
              <motion.div
                key="wps"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                    <CreditCard className="w-4 h-4" />
                    <span>WPS Salary Information File (SIF)</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">إصدار مسير الرواتب المعتمد من 'مدد'</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    توليد صريح لملفات SIF المبوبة بنسق التاب الحصري المعتمد من البنوك السعودية ومستضيف منصة 'مدد'، لضمان حماية الأجور وتفادي غرامات وزارة الموارد البشرية.
                  </p>
                  <div className="space-y-3 text-xs text-zinc-300 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>حساب حيازي دقيق لاستقطاعات التأمينات الاجتماعية (GOSI)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>مؤشر محاكاة نسبة التوطين (نطاقات) فوري مع كل تغيير بالطاقم</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-zinc-900 border border-white/10 rounded-3xl p-6 font-mono text-xs text-zinc-300 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10">
                    <span className="text-rose-400 font-bold">BATCH_SIF_MUDAD_202607.sif</span>
                    <span className="bg-rose-500/20 text-rose-300 text-[10px] px-2 py-0.5 rounded font-sans">
                      SAMA FORMAT VERIFIED
                    </span>
                  </div>
                  <div className="bg-black/60 p-4 rounded-xl text-[11px] text-zinc-300 overflow-x-auto space-y-2">
                    <p className="text-amber-300 font-bold">14	1010884920	SA0380000129837190	20260721	1430	202607	145000.00	12	SAR</p>
                    <p className="text-emerald-400">15	1092837482	SA98400000192837	أحمد العتيبي	ANBK	8000	3000	1000	0	12000.00	P</p>
                    <p className="text-emerald-400">15	2394827102	SA12400000293847	محمد خان	SABB	4000	1500	500	0	6000.00	P</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CRM TAB */}
            {activeTab === "crm" && (
              <motion.div
                key="crm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    <Building className="w-4 h-4" />
                    <span>SPL Saudi Post Live API Proxy</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">إدارة العملاء والتحقق من العنوان الوطني</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    التحقق المباشر من صحة العناوين الوطنية السعودية من خلال ربط خفي مع `api.address.gov.sa` لمنع الأخطاء في التوصيل والشحن وخطابات التعميد.
                  </p>
                  <div className="space-y-3 text-xs text-zinc-300 font-medium">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>مزامنة المحادثات وتوجيه العروض تلقائياً عبر الواتساب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>تتبع خطة المبيعات والصفقات بنظام كأنبان تفاعلي</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 bg-zinc-900 border border-white/10 rounded-3xl p-6 text-xs text-zinc-300 space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-white/10 font-mono">
                    <span className="text-blue-400 font-bold">SPL_NATIONAL_ADDRESS_LOOKUP</span>
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-sans">
                      VERIFIED 200 OK
                    </span>
                  </div>
                  <div className="bg-black/60 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between text-zinc-300">
                      <span>الرمز البريدي: <strong className="text-white font-mono">12211</strong></span>
                      <span>الرقم الإضافي: <strong className="text-white font-mono">3412</strong></span>
                    </div>
                    <p className="text-emerald-400 font-bold">حي العليا - طريق الملك فهد - الرياض - المملكة العربية السعودية</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* CONTRACTS TAB */}
            {activeTab === "contracts" && (
              <motion.div
                key="contracts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                    <PenTool className="w-4 h-4" />
                    <span>300 DPI Canvas Biometric Signature</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">العقود الذكية والتوقيع الرقمي</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    توليد العقود وسندات الأمر إلكترونياً مع لوحة توقيع رقمية بدقة عالية 300 DPI وتثبيت معالم الأمان بالبصمة الزمنية لتفادي النزاعات القضائية.
                  </p>
                </div>

                <div className="lg:col-span-6 bg-zinc-900 border border-white/10 rounded-3xl p-6 text-xs text-zinc-300 space-y-3 text-center">
                  <p className="text-zinc-400 font-bold mb-2">معاينة لوحة التوقيع البيومتري الموثق:</p>
                  <div className="h-32 bg-white rounded-2xl flex items-center justify-center border-2 border-dashed border-zinc-300 relative">
                    <span className="text-3xl font-serif text-blue-900 italic font-black transform -rotate-6">
                      A. Al-Otaibi Signature
                    </span>
                    <span className="absolute bottom-2 left-2 text-[9px] bg-emerald-100 text-emerald-800 font-mono px-2 py-0.5 rounded">
                      HASH: 8f92a1c028e3
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === "inventory" && (
              <motion.div
                key="inventory"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-6 space-y-6">
                  <div className="inline-flex items-center gap-2 text-xs font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    <Package className="w-4 h-4" />
                    <span>Salla & Zid Integration</span>
                  </div>
                  <h3 className="text-3xl font-black text-white">إدارة المخزون والمتاجر الإلكترونية</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    مزامنة المخزون تلقائياً بين مستودعاتك الحقيقية ومتجرك الإلكتروني في سلة وزد. خصم آلي فور كل عملية بيع وإصدار الفاتورة الضريبية فوراً.
                  </p>
                </div>

                <div className="lg:col-span-6 bg-zinc-900 border border-white/10 rounded-3xl p-6 text-xs text-zinc-300 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-black/60 rounded-xl border border-white/5">
                    <div>
                      <p className="font-bold text-white">طابعة باركود حرارية POS</p>
                      <p className="text-[10px] text-zinc-400">SKU-99201 • المتوفر: 48 قطعة</p>
                    </div>
                    <span className="text-emerald-400 font-bold font-mono">1,200 SAR</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default ModulePlaygroundSection;
