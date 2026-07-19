import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  TrendingUp,
  Mail,
  Send,
  BarChart3,
  Bot,
  Cpu,
  Users,
  Layout,
  Layers,
  FileText,
  DollarSign,
  Scale,
  Calendar,
  Share2,
  Workflow,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Search,
  MessageSquare,
  Activity,
  Calculator,
  Percent,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface GrowthOrchestratorProps {
  isAr: boolean;
  onNavigateToTab?: (tab: string) => void;
}

export default function GrowthOrchestrator({ isAr, onNavigateToTab }: GrowthOrchestratorProps) {
  // AI Command input state
  const [commandPrompt, setCommandPrompt] = useState(
    isAr
      ? "زيادة المبيعات في الشهر القادم وجذب عملاء باقات التشغيل الفاخرة"
      : "Increase sales next month and target premium enterprise tier customers"
  );

  // Simulation execution state
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [expandedAsset, setExpandedAsset] = useState<number | null>(null);

  // Sample prompt options
  const samplePrompts = [
    {
      ar: "زيادة المبيعات في الشهر القادم وجذب عملاء باقات التشغيل الفاخرة",
      en: "Increase sales next month and target premium enterprise tier customers",
    },
    {
      ar: "تنشيط السلال المتروكة وإعادة استهداف العملاء الخاملين منذ 60 يومًا",
      en: "Re-engage abandoned carts and target inactive leads from past 60 days",
    },
    {
      ar: "إطلاق باقة اشتراكات جديدة وترويجها عبر الإعلانات وشبكات التواصل",
      en: "Launch a new subscription tier and promote via social & digital ads",
    },
  ];

  // Coordinated playbooks
  const growthSteps = [
    {
      id: 1,
      titleAr: "📊 تدقيق ربحية الحسابات (Accounting & ERP Audit)",
      titleEn: "📊 ERP Profitability Audit",
      descAr:
        "يقوم الذكاء الاصطناعي بتحليل دفتر الأستاذ والمبيعات لتحديد المنتجات ذات هامش الربح الصافي الأعلى.",
      descEn: "AI analyzes general ledger to identify high-volume items with maximum net margins.",
      detailsAr:
        "المنتجات المحددة: زعفران سوبر نقيل (هامش 74٪)، بن خولاني فاخر (هامش 68٪)، عسل سدر بلدي (هامش 71٪). تم استبعاد المنتجات منخفضة الهامش لتجنب هدر ميزانية التسويق.",
      detailsEn:
        "Identified high-margin items: Super Saffron (74% margin), Premium Khawlani Coffee (68%), Honey (71%). Avoided promoting low-margin goods.",
      systemLogAr:
        "تم فحص قيود اليومية والفواتير النشطة بنجاح. المنتجات الأكثر ربحية جاهزة للتسويق.",
      systemLogEn:
        "Analyzed journals and active invoices. High-margin products synchronized for marketing.",
    },
    {
      id: 2,
      titleAr: "👥 فحص واستخلاص شرائح الـ CRM (CRM Retention Segments)",
      titleEn: "👥 CRM Audience Segmentation",
      descAr: "تصفية العملاء عالي القيمة الذين توقفوا عن الشراء وتصنيفهم تلقائياً.",
      descEn: "Filter high-value customers who have not placed orders in the last 60 days.",
      detailsAr:
        "تم حصر 1,420 عميلاً مؤهلاً (المنفقون > 500 ريال) وتوزيعهم على شرائح (VIP Retention / Warm Prospects) لشن حملة الاستعادة.",
      detailsEn: "Segmented 1,420 VIP inactive accounts (spending > $150) for re-engagement.",
      systemLogAr: "تم تحديث شرائح العملاء في قاعدة البيانات. جاهز لتوجيه الرسائل المخصصة.",
      systemLogEn: "Client segments synced in CRM database. Nurture paths prepared.",
    },
    {
      id: 3,
      titleAr: "🌐 تصميم صفحة هبوط ذكية عالية التحويل (Dynamic Landing Page)",
      titleEn: "🌐 AI Landing Page Generation",
      descAr: "توليد صفحة هبوط متجاوبة وسريعة باللغتين تدعم RTL متوافقة مع الهوية البصرية.",
      descEn:
        "Generate premium landing pages in Arabic & English, with RTL support and fast load speeds.",
      detailsAr:
        "كود الصفحة تم إنشاؤه ومطابقته مع العروض. كود التتبع بكسل وجوجل تاج مثبت مسبقاً لرصد نقرات الشراء ونسب الارتداد تلقائياً.",
      detailsEn:
        "Landing page HTML/CSS compiled. Tracking pixels & conversions pre-installed to monitor drop-offs.",
      systemLogAr: "تم نشر صفحة الهبوط على الخوادم السحابية بنجاح ومزودة بشهادة أمان SSL.",
      systemLogEn: "Page deployed to CDN edge, SSL secure active. View live link.",
    },
    {
      id: 4,
      titleAr: "📝 إطلاق النماذج المتقدمة وتقييم العملاء (Forms & Popups)",
      titleEn: "📝 Smart Qualifying Forms & Popups",
      descAr: "بناء نماذج متعددة الخطوات ومنبثقات نية الخروج (Exit Intent) لتأهيل العملاء.",
      descEn: "Inject multi-step forms and exit popups to capture high-intent inquiries.",
      detailsAr:
        "الأسئلة التأهيلية: حجم الإيرادات الشهرية، الاحتياج الحالي، والميزانية المتوفرة. يقوم النظام بتقدير حجم الصفقة ودرجة رغبة العميل بدلاً من طلب البيانات التقليدية المملة.",
      detailsEn:
        "Qualifying flow logic: Monthly Revenue, Current Painpoint, Budget. Scores buyer intent instantly.",
      systemLogAr:
        "النماذج جاهزة للاستقبال ومتصلة ببروتوكول التحقق الثنائي من رقم الجوال (OTP Verification).",
      systemLogEn: "Forms deployed, integrated with SMS OTP verification rules.",
    },
    {
      id: 5,
      titleAr: "✉️ أتمتة الحملات البريدية والتنقيط (Automated Email & SMS)",
      titleEn: "✉️ Integrated Klaviyo/ActiveCampaign Flows",
      descAr: "صياغة وتفعيل سلسلة رسائل بريد ترحيبية وخصومات حافزة متتابعة.",
      descEn: "Generate automated responsive email copy and schedule multi-step trigger tracks.",
      detailsAr:
        "العنوان المقترح من الذكاء الاصطناعي: 'أهلاً بك في دليلك المالي الأول - خصم 15٪ ينتظرك!'. كتل التصميم متوافقة مع الهواتف الذكية وتقوم بتحديث الروابط الحيوية.",
      detailsEn:
        "AI Suggested subject: 'Grow your enterprise today: 15% exclusive VIP discount inside'. Content structured dynamically.",
      systemLogAr: "قوالب البريد تم تصميمها برمجياً وتجربتها لضمان الوصول لصندوق الوارد مباشرة.",
      systemLogEn: "Email templates compiled & routed via secure deliverability engine.",
    },
    {
      id: 6,
      titleAr: "📣 صياغة إعلانات Meta و Google وتتبع الـ API (Unified Ads Setup)",
      titleEn: "📣 Ads Creative Generation & Conversions API",
      descAr: "صياغة وتوليد النصوص الإعلانية وتفعيل واجهة التحويلات (CAPI) لتجاوز حظر الكوكيز.",
      descEn: "Write copy, produce creative wireframes, and establish Server-side Conversions API.",
      detailsAr:
        "استهداف جماهير Lookalike المستخلصة من الـ CRM. تفعيل الـ Conversions API لمنصات ميتا وتيك توك لتسجيل الأحداث مباشرة من السيرفر بنسبة دقة 100٪.",
      detailsEn:
        "Lookalike targeting matching active VIP customers. CAPI established on-the-fly to bypass iOS tracking limits.",
      systemLogAr: "تم ربط واجهة التحويلات بنجاح وإعداد المجموعات الإعلانية على Meta Ads Manager.",
      systemLogEn: "Conversions API handshakes verified. Meta ad sets configured.",
    },
    {
      id: 7,
      titleAr: "📱 جدولة قنوات التواصل الاجتماعي العضوية (Organic Social Scheduler)",
      titleEn: "📱 Automated Social Content Calendar",
      descAr: "كتابة نصوص للمنشورات وسيناريوهات للمقاطع القصيرة (Reels) مع وسوم نشطة وجدولتها.",
      descEn:
        "Draft organic captions, generate short-form video scripts (Reels) and schedule posts.",
      detailsAr:
        "المنصات: LinkedIn, Instagram, TikTok. المحتوى يركز على قصص نجاح العملاء الماليين والمنتجات الأكثر مبيعاً مع جدول زمني يتطابق مع ساعات الذروة.",
      detailsEn:
        "Channels: LinkedIn, Instagram, TikTok. Context focused on customer stories and profitability highlights.",
      systemLogAr: "تم حجز الأوقات الموصى بها في تقويم النشر التلقائي للشبكات.",
      systemLogEn: "Calendar scheduled for high-engagement slots in Riyadh & Dubai times.",
    },
    {
      id: 8,
      titleAr: "💬 تغذية روبوت المحادثة المباشرة (Live Chat Knowledge base)",
      titleEn: "💬 AI Chat Agent Training Update",
      descAr: "تحديث ذاكرة المساعد الذكي بالعروض الجديدة والمنتجات الأكثر ربحية للإجابة الفورية.",
      descEn: "Inject promotional parameters directly into the live assistant's prompt context.",
      detailsAr:
        "تم ربط المساعد بواتساب وتليجرام لتوجيه المستفسرين نحو إتمام الحجز أو الدفع الفوري مع خصم الـ 15٪ الجديد.",
      detailsEn:
        "Updated chatbot context with new discount policies. Prepared to capture leads via WhatsApp and Web Chat.",
      systemLogAr: "تم ترقية نموذج المساعد للإجابة على الأسئلة الشائعة وتوليد روابط الحجز الذكية.",
      systemLogEn: "System prompt appended. AI agent knowledge baseline updated successfully.",
    },
    {
      id: 9,
      titleAr: "💰 تخصيص ذكي وموازنة الميزانية المدفوعة (ROAS Budget Allocation)",
      titleEn: "💰 ROAS Budget Allocation Model",
      descAr: "تخصيص ميزانية الإعلانات بناءً على القنوات الأعلى عائداً وتنبؤات الجماهير.",
      descEn: "Allocate dynamic ad-spend across channels based on live attribution projections.",
      detailsAr:
        "الميزانية الإجمالية: 5,000 ريال. التخصيص الموصى به: 60٪ Meta Ads (مبيعات مباشرة)، 30٪ Google Ads (إعلانات البحث)، 10٪ LinkedIn Ads (للقطاع التجاري). العائد المتوقع ROAS: 3.8x.",
      detailsEn:
        "Total Budget: $1,500. Optimal Split: 60% Meta (direct checkout), 30% Google Search (high intent), 10% LinkedIn. Projected ROAS: 3.8x.",
      systemLogAr: "تم حساب ميزانيات التشغيل المثلى وبدء رصد منحنى التكلفة لكل عميل (CAC).",
      systemLogEn:
        "Budget optimization metrics written. Calculated maximum Customer Acquisition Cost threshold.",
    },
    {
      id: 10,
      titleAr: "🔄 ربط الحجوزات وتوزيع العملاء المؤهلين (Appointment Booking & Leads Routing)",
      titleEn: "🔄 Appointments Booking & CRM Routing",
      descAr: "جدولة الاجتماعات آلياً (توزيع Round Robin) وتوزيع العملاء على موظفي المبيعات.",
      descEn:
        "Coordinate calendar slots and auto-assign sales leads using smart round-robin rules.",
      detailsAr:
        "تم ربط مواعيد Google Calendar والتقويم السحابي. العميل المؤهل (الذي تتخطى أرباحه المليون ريال) يتم توجيهه فوراً لأفضل ممثل مبيعات لمكالمة إغلاق الصفقة.",
      detailsEn:
        "Synced with Google/Outlook calendars. Ultra high-value accounts routed instantly to senior account managers.",
      systemLogAr:
        "تم تفعيل سيناريو توزيع العملاء وإرسال تأكيد الحجوزات عبر الرسائل النصية والواتساب.",
      systemLogEn: "Routing parameters verified. Auto-SMS notifications enabled.",
    },
    {
      id: 11,
      titleAr: "📈 رصد العائد الشامل ونظام العزو المالي (Multi-Touch Attribution & ERP Sync)",
      titleEn: "📈 Multi-Touch Revenue Attribution & ERP Sync",
      descAr:
        "ربط كل ريال مبيعات بالمنشور الإعلاني الأول وعزو الإيرادات بدقة والتدفق لدفتر الأستاذ.",
      descEn:
        "Track conversions back to original ad clicks and automatically record transactions inside the ERP.",
      detailsAr:
        "نظام عزو Hyros/Triple Whale متكامل يسجل العميل من أول نقرة (First-Touch) وحتى الدفع وإصدار الفاتورة الضريبية ZATCA، لحساب صافي العائد على الإنفاق بدقة فائقة دون فقدان بيانات.",
      detailsEn:
        "Advanced multi-touch attribution connects payment invoices to original marketing clicks. Syncs revenue back to general ledger.",
      systemLogAr:
        "تم ربط نظام الفواتير الإلكترونية بمحرك العزو الإعلاني لإتمام حلقة النمو بنسبة 100٪.",
      systemLogEn: "ZATCA e-invoicing ledger synced with click attribution tracking logs.",
    },
  ];

  // Trigger the animated play simulation
  const startSimulation = () => {
    setIsRunning(true);
    setCurrentStep(0);
    setIsCompleted(false);
    setExpandedAsset(null);
    setExecutionLogs([
      isAr
        ? "⏳ بدء تشغيل محرك النمو المتكامل لمدارج OS (Growth Operating System)..."
        : "⏳ Initializing Madarij Growth OS unified orchestration engine...",
    ]);

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < growthSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        setExecutionLogs((prev) => [
          ...prev,
          isAr
            ? `✔ تفعيل ${growthSteps[stepIndex].titleAr} - ${growthSteps[stepIndex].systemLogAr}`
            : `✔ Activated ${growthSteps[stepIndex].titleEn} - ${growthSteps[stepIndex].systemLogEn}`,
        ]);
      } else {
        clearInterval(interval);
        setIsCompleted(true);
        setIsRunning(false);
        setExecutionLogs((prev) => [
          ...prev,
          isAr
            ? "🎉 تم اكتمال خطة النمو المتكاملة بنجاح! تم ربط المالية بالـ CRM وإعداد صفحات الهبوط، والبريد، والمنشورات الاجتماعية، وتجهيز الإعلانات المدفوعة وعزو المبيعات."
            : "🎉 Coordinated growth playbook deployed successfully! ERP accounting, CRM contacts, landing pages, email templates, social schedulers, and ad trackers are now running as a single cohesive unit.",
        ]);
        toast.success(
          isAr ? "تم تنفيذ خطة النمو الموحدة بنجاح!" : "Growth OS unified campaign launched!",
          { duration: 6000 }
        );
      }
    }, 1800);
  };

  const resetSimulation = () => {
    setIsRunning(false);
    setCurrentStep(-1);
    setIsCompleted(false);
    setExpandedAsset(null);
    setExecutionLogs([]);
  };

  return (
    <div className="bg-slate-900 text-slate-100 p-6 md:p-8 rounded-[32px] border border-slate-800 shadow-2xl relative overflow-hidden">
      {/* Absolute Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Banner representing the Killer Feature concept */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800 pb-6 mb-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 font-bold">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            {isAr ? "دماغ النمو الموحد لمدارج OS" : "Unified Growth Intelligence"}
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Workflow className="w-8 h-8 text-indigo-500" />
            {isAr ? "منسق النمو الذكي الشامل" : "AI Growth OS Orchestrator"}
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {isAr
              ? "نهاية الأدوات المنفصلة والمكلفة. المنسق الذكي يربط حساباتك المالية، المخازن، الـ CRM، صفحات الهبوط، حملات البريد، المنشورات، وإعلانات ميتا وجوجل لتعمل كأوركسترا نمو متناغمة."
              : "No more paying $2,000/mo for siloed tools. Leverage CRM, Accounting, Invoices, Webpages, Social media, Ad suites, and Attribution in a singular cohesive workflow."}
          </p>
        </div>

        {/* Cohesive status indicators */}
        <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 w-full lg:w-auto">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              {isAr ? "تكامل الأنظمة المترابطة" : "Connected Apps"}
            </span>
            <span className="text-lg font-black text-emerald-400 font-mono">11 / 11</span>
          </div>
          <div className="text-center border-l border-slate-800 pl-4">
            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">
              {isAr ? "عزو المبيعات الإعلانية" : "Sales Attribution"}
            </span>
            <span className="text-lg font-black text-indigo-400 font-mono">100% CAPI</span>
          </div>
        </div>
      </div>

      {/* Visual representation of the Unified Flow Pipeline loop */}
      <div className="mb-8">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-4">
          {isAr
            ? "🔄 حلقة تدفق العميل المتكاملة (Growth OS Customer Journey)"
            : "🔄 The Growth OS Customer Journey Loop"}
        </span>

        {/* 11 loop steps visualized in a bento-style responsive layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-11 gap-2">
          {[
            { labelAr: "زائر موقع", labelEn: "Visitor", step: "1" },
            { labelAr: "عميل محتمل", labelEn: "Lead", step: "2" },
            { labelAr: "مؤهل بالـ AI", labelEn: "Qualified", step: "3" },
            { labelAr: "العلاقات CRM", labelEn: "CRM", step: "4" },
            { labelAr: "مكالمة مبيعات", labelEn: "Sales Call", step: "5" },
            { labelAr: "إصدار فاتورة", labelEn: "Invoicing", step: "6" },
            { labelAr: "دفع سريع", labelEn: "Payment", step: "7" },
            { labelAr: "استبقاء", labelEn: "Retention", step: "8" },
            { labelAr: "تسويق مخصص", labelEn: "Marketing", step: "9" },
            { labelAr: "بيع إضافي", labelEn: "Upsell", step: "10" },
            { labelAr: "توصية وإحالة", labelEn: "Referral", step: "11" },
          ].map((item, idx) => (
            <div
              key={idx}
              className={cn(
                "p-2.5 rounded-xl border flex flex-col justify-between transition-all relative text-center select-none",
                currentStep >= idx || isCompleted
                  ? "bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                  : "bg-slate-950/40 border-slate-800 text-slate-500"
              )}
            >
              {idx < 10 && (
                <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight
                    className={cn(
                      "w-4 h-4",
                      currentStep >= idx || isCompleted ? "text-indigo-400" : "text-slate-800"
                    )}
                  />
                </div>
              )}
              <span className="text-[9px] font-mono font-black block text-slate-400 mb-1">
                {item.step}
              </span>
              <span className="text-[10px] md:text-xs font-bold leading-tight block">
                {isAr ? item.labelAr : item.labelEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Orchestration Interactive Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: AI Input Control Center (5/12 cols) */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl">
              <label className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2.5">
                {isAr
                  ? "🗣️ ماذا تريد أن يحققه مدارج OS لأعمالك؟"
                  : "🗣️ What is your growth goal for next month?"}
              </label>

              <textarea
                value={commandPrompt}
                onChange={(e) => setCommandPrompt(e.target.value)}
                disabled={isRunning}
                rows={4}
                className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs md:text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                placeholder={
                  isAr
                    ? "اكتب هدفك التسويقي أو البيعي مثل: بيع المخزون المتراكم من زيت الزيتون..."
                    : "Write your target business goal..."
                }
              />

              <div className="mt-3.5 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  {isAr ? "💡 أمثلة مقترحة (اضغط للتطبيق)" : "💡 Quick Goal Templates"}
                </span>
                <div className="space-y-1.5">
                  {samplePrompts.map((p, index) => (
                    <button
                      key={index}
                      type="button"
                      disabled={isRunning}
                      onClick={() => setCommandPrompt(isAr ? p.ar : p.en)}
                      className="w-full text-left text-[11px] bg-slate-900/50 hover:bg-slate-900 border border-slate-800/60 p-2 rounded-lg text-slate-300 hover:text-white transition truncate block"
                    >
                      {isAr ? p.ar : p.en}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live Statistics */}
            <div className="bg-slate-950/40 border border-slate-800/80 p-4 rounded-2xl grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-1">
                  {isAr ? "هامش الربح المرصود" : "Max Net Margin"}
                </span>
                <strong className="text-emerald-400 font-mono text-base">74%</strong>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-1">
                  {isAr ? "العملاء VIP المستهدفين" : "Target VIPs"}
                </span>
                <strong className="text-indigo-400 font-mono text-base">1,420</strong>
              </div>
              <div className="p-2.5 bg-slate-900/60 rounded-xl">
                <span className="text-slate-400 text-[10px] block mb-1">
                  {isAr ? "توقع العائد الإعلاني" : "Projected ROAS"}
                </span>
                <strong className="text-amber-400 font-mono text-base">3.8x</strong>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex gap-2">
            {!isCompleted && !isRunning ? (
              <button
                onClick={startSimulation}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Play className="w-4 h-4 fill-current" />
                {isAr ? "تشغيل خطة النمو المتكاملة" : "Execute Coordinated Plan"}
              </button>
            ) : isRunning ? (
              <div className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2 select-none border border-slate-700/80">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span>
                  {isAr
                    ? `جاري التنسيق والمزامنة (${currentStep + 1}/11)...`
                    : `Orchestrating workflows (${currentStep + 1}/11)...`}
                </span>
              </div>
            ) : (
              <button
                onClick={resetSimulation}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {isAr ? "إعادة تهيئة المحاكي" : "Reset Growth Loop"}
              </button>
            )}
          </div>
        </div>

        {/* Right column: Execution timeline tracker and generated assets deep-dive (7/12 cols) */}
        <div className="lg:col-span-7 flex flex-col h-[520px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden">
          {/* Timeline Header */}
          <div className="bg-slate-900/80 px-4 py-3.5 border-b border-slate-800/80 flex justify-between items-center">
            <span className="text-xs font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-indigo-400" />
              {isAr ? "سجل التنسيق والتشغيل الموحد" : "Attribution & Execution Pipeline Logs"}
            </span>

            {isRunning && (
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md animate-pulse">
                {isAr ? "جاري الإطلاق الحي..." : "Active dispatch..."}
              </span>
            )}
          </div>

          {/* Timeline Steps logs */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
            {executionLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Cpu className="w-12 h-12 text-slate-700 animate-pulse mb-3" />
                <p className="text-xs text-slate-400 font-bold max-w-sm">
                  {isAr
                    ? "أدخل هدف أعمالك في الحقل الأيمن واضغط على 'تشغيل خطة النمو المتكاملة' لتشاهد عضلات مدارج OS في التنسيق والمزامنة الفورية."
                    : "Describe your goal and run the playbook to visualize Madarij OS orchestrating your entire marketing ecosystem simultaneously."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Simulated Logs Output */}
                <div className="p-3 bg-slate-900 border border-slate-800/60 rounded-xl font-mono text-[10px] leading-relaxed text-indigo-300 space-y-1 select-text">
                  {executionLogs.map((log, index) => (
                    <p key={index} className="fade-in">
                      {log}
                    </p>
                  ))}
                </div>

                {/* Vertical Step Timeline list */}
                <div className="space-y-2 border-t border-slate-800 pt-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                    {isAr
                      ? "📂 تفاصيل أصول الحملة المستحدثة (انقر للمعاينة):"
                      : "📂 Generated Campaign Assets (Click to Preview):"}
                  </span>

                  {growthSteps.map((step, idx) => {
                    const isPassed = currentStep >= idx || isCompleted;
                    if (!isPassed) return null;

                    const isExpanded = expandedAsset === idx;

                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "border rounded-xl transition-all",
                          isExpanded
                            ? "bg-slate-900/80 border-indigo-500"
                            : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700"
                        )}
                      >
                        <button
                          onClick={() => setExpandedAsset(isExpanded ? null : idx)}
                          className="w-full px-3.5 py-3 text-left flex justify-between items-center"
                        >
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-100">
                            {idx <= currentStep ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                            )}
                            <span>{isAr ? step.titleAr : step.titleEn}</span>
                          </div>
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider">
                            {isExpanded
                              ? isAr
                                ? "إغلاق"
                                : "Hide"
                              : isAr
                                ? "معاينة الأصل"
                                : "Preview"}
                          </span>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden border-t border-slate-800/80 px-4 py-3 space-y-2 text-xs bg-slate-950/80"
                            >
                              <p className="text-slate-300 leading-relaxed font-bold">
                                {isAr ? step.descAr : step.descEn}
                              </p>
                              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-400 font-sans leading-relaxed select-text">
                                {isAr ? step.detailsAr : step.detailsEn}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
