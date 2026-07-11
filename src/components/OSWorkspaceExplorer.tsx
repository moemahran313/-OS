import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "@/src/contexts/SettingsContext";
import {
  LayoutDashboard,
  BarChart3,
  Calculator,
  Magnet,
  Mail,
  Share2,
  Sparkles,
  Users,
  MessageSquare,
  Video,
  Scale,
  FileText,
  CreditCard,
  ShieldCheck,
  FolderKanban,
  Blocks,
  LifeBuoy,
  Truck,
  FileSignature,
  Warehouse,
  ChevronDown,
  ArrowUpRight,
  Sparkle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ToolItem {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  path: string;
  icon: any;
  badgeAr?: string;
  badgeEn?: string;
}

interface WorkspaceGroup {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  tools: ToolItem[];
}

const WORKSPACE_DATA: WorkspaceGroup[] = [
  {
    id: "core",
    titleAr: "التحكم والقيادة",
    titleEn: "Core & Control",
    descriptionAr: "مركز المراقبة الشامل لوضع الشركة وصحتها التجارية الفورية",
    descriptionEn: "Central command center for immediate business health & metrics",
    icon: LayoutDashboard,
    colorClass: "text-emerald-500",
    bgClass: "from-emerald-500/5 to-transparent",
    borderClass: "hover:border-emerald-500/30",
    tools: [
      {
        id: "Dashboard",
        nameAr: "لوحة التحكم الرئيسية",
        nameEn: "Main Dashboard",
        descriptionAr: "الرؤية البانورامية الشاملة لمؤشرات الأداء وصحة الأعمال",
        descriptionEn: "Panoramic overview of key performance indicators",
        path: "/app",
        icon: LayoutDashboard,
      },
      {
        id: "Analytics",
        nameAr: "التحليلات المتقدمة",
        nameEn: "Advanced Analytics",
        descriptionAr: "رسومات بيانية تفاعلية لتحليل المبيعات والنمو ربع السنوي",
        descriptionEn: "Interactive charts for sales and quarterly growth analysis",
        path: "/app/analytics",
        icon: BarChart3,
      },
      {
        id: "Calculations",
        nameAr: "الحاسبة الذكية ومحاكي التكاليف",
        nameEn: "Smart Cost Simulator",
        descriptionAr: "محاكاة فورية لتكاليف الكوادر ونسب التوطين والامتثال",
        descriptionEn: "Real-time headcount cost and Nitaqat compliance simulation",
        path: "/app/calculations",
        icon: Calculator,
        badgeAr: "محدث",
        badgeEn: "Updated",
      },
    ],
  },
  {
    id: "marketing",
    titleAr: "النمو والتسويق الرقمي",
    titleEn: "Growth & Marketing",
    descriptionAr: "أدوات أتمتة النمو وبناء القنوات الاستقطابية وجذب العملاء",
    descriptionEn: "Growth automation engines to capture and scale GCC pipelines",
    icon: Magnet,
    colorClass: "text-blue-500",
    bgClass: "from-blue-500/5 to-transparent",
    borderClass: "hover:border-blue-500/30",
    tools: [
      {
        id: "LeadGen",
        nameAr: "منصة توليد العملاء",
        nameEn: "Lead Gen Platform",
        descriptionAr: "توليد تلقائي لبيانات الشركات المستهدفة في دول الخليج بذكاء",
        descriptionEn: "AI-targeted local lead databases and extraction tools",
        path: "/app/lead-gen",
        icon: Magnet,
      },
      {
        id: "EmailMarketing",
        nameAr: "التسويق بالبريد الإلكتروني",
        nameEn: "Email Marketing & Growth",
        descriptionAr: "تصميم وإطلاق حملات تواصل جماعية مخصصة للمهتمين",
        descriptionEn: "Create and dispatch bulk conversion email sequences",
        path: "/app/email-marketing",
        icon: Mail,
      },
      {
        id: "SocialMedia",
        nameAr: "إدارة التواصل الاجتماعي",
        nameEn: "Social Media Copilot",
        descriptionAr: "جدولة المنشورات وتصميم محتوى تفاعلي باستخدام الذكاء الاصطناعي",
        descriptionEn: "AI text generation and scheduling for GCC social channels",
        path: "/app/social-media",
        icon: Share2,
      },
      {
        id: "Advertising",
        nameAr: "الحملات الإعلانية ومحاكي الموازنات",
        nameEn: "Ad Campaigns Planner",
        descriptionAr: "إدارة موازنات إعلانات قوقل وسنابشات واحتساب العائد بدقة",
        descriptionEn: "Optimize search & social ad budgets with instant ROI metrics",
        path: "/app/advertising",
        icon: Sparkles,
      },
    ],
  },
  {
    id: "crm_comms",
    titleAr: "العملاء والاتصال الموحد",
    titleEn: "CRM & Unified Comms",
    descriptionAr: "قنوات الاتصال المباشر لإتمام المبيعات وتوثيق حوارات العملاء",
    descriptionEn: "Instant pipelines to secure sales and log client interactions",
    icon: Users,
    colorClass: "text-indigo-500",
    bgClass: "from-indigo-500/5 to-transparent",
    borderClass: "hover:border-indigo-500/30",
    tools: [
      {
        id: "CRM",
        nameAr: "إدارة علاقات العملاء (CRM)",
        nameEn: "Customer CRM",
        descriptionAr: "متابعة تدفق الصفقات والمبيعات من التواصل الأول حتى الإغلاق",
        descriptionEn: "Secure deal pipelines and log client communication histories",
        path: "/app/crm",
        icon: Users,
      },
      {
        id: "Chat",
        nameAr: "مركز الاتصال والواتساب الموحد",
        nameEn: "Unified WhatsApp Chat",
        descriptionAr: "إرسال واستقبال رسائل العملاء وربط إشعارات الفواتير تلقائياً",
        descriptionEn: "Two-way client chats integrated with automatic billing",
        path: "/app/chat",
        icon: MessageSquare,
        badgeAr: "مباشر",
        badgeEn: "Live",
      },
      {
        id: "SmartNegotiations",
        nameAr: "غرفة التفاوض والاجتماعات",
        nameEn: "Smart Negotiations Suite",
        descriptionAr: "تنسيق عروض الأسعار والاتصال المرئي ومحاكي العقود التفاعلي",
        descriptionEn: "Live sales meeting rooms with visual document negotiation",
        path: "/app/smart-negotiations",
        icon: Video,
      },
    ],
  },
  {
    id: "financials",
    titleAr: "المالية والامتثال الضريبي",
    titleEn: "Financials & Compliance",
    descriptionAr: "النظام المحاسبي المتكامل المطابق لمتطلبات هيئة الزكاة والجمارك (ZATCA)",
    descriptionEn: "Secure accounting fully aligned with GCC tax authorities",
    icon: Scale,
    colorClass: "text-amber-500",
    bgClass: "from-amber-500/5 to-transparent",
    borderClass: "hover:border-amber-500/30",
    tools: [
      {
        id: "Accounting",
        nameAr: "دفتر الأستاذ والقيود المحاسبية",
        nameEn: "General Ledger",
        descriptionAr: "شجرة الحسابات والقيود المزدوجة وإصدار ميزان المراجعة آلياً",
        descriptionEn: "Double-entry ledger book and automated balance sheets",
        path: "/app/accounting",
        icon: Scale,
      },
      {
        id: "Invoices",
        nameAr: "الفواتير والإشعارات الضريبية",
        nameEn: "VAT Tax Invoicing",
        descriptionAr: "فواتير مبيعات سريعة مطابقة لضريبة القيمة المضافة ومرحلة الفوترة 2",
        descriptionEn: "VAT tax invoice templates compliant with GCC billing rules",
        path: "/app/invoices",
        icon: FileText,
      },
      {
        id: "Payroll",
        nameAr: "مسيرات الرواتب ونظام WPS",
        nameEn: "WPS Payroll Core",
        descriptionAr: "احتساب الرواتب والبدلات وتوليد ملفات مسيرات WPS المعتمدة سعودياً (SIF)",
        descriptionEn: "Calculate salaries and compile standard SIF bank sheets",
        path: "/app/payroll",
        icon: CreditCard,
        badgeAr: "أساسي",
        badgeEn: "Essential",
      },
      {
        id: "ZatcaAi",
        nameAr: "مساعد هيئة الزكاة الذكي (Zatca AI)",
        nameEn: "ZATCA Compliance Copilot",
        descriptionAr: "التدقيق الذكي للفواتير والتحقق من التشفير الثنائي والربط الفني",
        descriptionEn: "Instant XML validation against official Saudi ZATCA portals",
        path: "/app/zatca-ai",
        icon: Sparkles,
      },
      {
        id: "Compliance",
        nameAr: "بوابة لوائح وقوانين الموارد",
        nameEn: "Labor Compliance Guard",
        descriptionAr: "دليل الامتثال وتفادي المخالفات العمالية وحساب مستحقات نهاية الخدمة",
        descriptionEn: "Labor laws manual, EOS calculations, and regulatory updates",
        path: "/app/fwcos",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "operations",
    titleAr: "المشاريع وأتمتة العمليات",
    titleEn: "Projects & Operations",
    descriptionAr: "منصة تنفيذ الأعمال والربط البرمجي وأتمتة المهام اليومية",
    descriptionEn: "Daily task managers and technical API integration flows",
    icon: FolderKanban,
    colorClass: "text-purple-500",
    bgClass: "from-purple-500/5 to-transparent",
    borderClass: "hover:border-purple-500/30",
    tools: [
      {
        id: "Projects",
        nameAr: "إدارة المشاريع ومساحات العمل",
        nameEn: "Workspace Projects",
        descriptionAr: "تنظيم المهام ومتابعة تقدم مشاريع الكادر عبر لوحات كانبان التفاعلية",
        descriptionEn: "Track team objectives and sprints using elegant Kanban layout",
        path: "/app/projects",
        icon: FolderKanban,
      },
      {
        id: "Workflows",
        nameAr: "العمليات والأتمتة الذكية",
        nameEn: "Automated Workflows",
        descriptionAr: "محرك أتمتة الأحداث لربط العمليات (مثال: إرسال فاتورة عند نجاح صفقة)",
        descriptionEn: "Triggers and automations to sync cross-platform operations",
        path: "/app/workflows",
        icon: Blocks,
      },
      {
        id: "Integrations",
        nameAr: "الربط التقني وبوابات API",
        nameEn: "System Integrations",
        descriptionAr: "واجهة متكاملة لربط المنصة ببرامج الطرف الثالث وبوابات الشحن والاتصال",
        descriptionEn: "Unified developer hubs to connect external systems",
        path: "/app/integrations",
        icon: Blocks,
      },
      {
        id: "Support",
        nameAr: "الدعم الفني والبطاقات",
        nameEn: "Client Helpdesk Support",
        descriptionAr: "إدارة تذاكر الدعم الفني للعملاء الداخليين والخارجيين وحل المشكلات",
        descriptionEn: "Manage customer help tickets and track resolution times",
        path: "/app/support",
        icon: LifeBuoy,
      },
    ],
  },
  {
    id: "supply_chain",
    titleAr: "سلسلة الإمداد والعقود والمخزون",
    titleEn: "Supply Chain & Inventory",
    descriptionAr: "إدارة الموردين والعمليات اللوجستية وعقود المشتريات والمخازن",
    descriptionEn: "Logistical pipelines, vendor lists, and inventory control",
    icon: Truck,
    colorClass: "text-rose-500",
    bgClass: "from-rose-500/5 to-transparent",
    borderClass: "hover:border-rose-500/30",
    tools: [
      {
        id: "Suppliers",
        nameAr: "إدارة الموردين والشحنات",
        nameEn: "Vendor Suppliers Core",
        descriptionAr: "متابعة سجل الموردين وتكلفة الشحنات ومستندات المطابقة الجمركية",
        descriptionEn: "Log logistical carriers, shipping bills, and supplier profiles",
        path: "/app/suppliers",
        icon: Truck,
      },
      {
        id: "Contracts",
        nameAr: "إدارة عقود المشتريات والاتفاقيات",
        nameEn: "B2B Procurement Contracts",
        descriptionAr: "أرشيف العقود التجارية الذكية وتواريخ تجديدها والربط القانوني",
        descriptionEn: "Repository for vendor SLAs and corporate contracts",
        path: "/app/contracts",
        icon: FileSignature,
      },
      {
        id: "Inventory",
        nameAr: "المخزون والمستودعات الذكية",
        nameEn: "Warehouse & Inventory",
        descriptionAr: "مراقبة مستويات المنتجات وإشعارات النقص وإعادة الطلب التلقائي للمواد",
        descriptionEn: "Track item categories, SKUs, and reorder levels instantly",
        path: "/app/inventory",
        icon: Warehouse,
      },
    ],
  },
];

export default function OSWorkspaceExplorer() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  return (
    <section className="bg-white dark:bg-zinc-100/20 rounded-[2.5rem] border border-zinc-150/80 dark:border-zinc-850/60 shadow-sm p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.03] rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/[0.02] rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-zinc-100 dark:border-zinc-900 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl shrink-0 animate-pulse">
            <Sparkle className="w-6 h-6 fill-emerald-500/20" />
          </div>
          <div>
            <h3 className="font-black text-xl text-zinc-950 dark:text-zinc-50">
              {isAr ? "مستكشف مساحات العمل والمجموعات الذكية" : "Mudarij OS Workspace Explorer"}
            </h3>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 mt-1">
              {isAr
                ? "تقسيم تفاعلي شامل لأقسام نظام تشغيل مدارج لسهولة الإدارة والتنقل السريع"
                : "A fully unified view of all 22 tools segmented into 6 core GCC business sub-operating spaces"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-100 text-zinc-500 dark:text-zinc-400 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
            {isAr ? "٢٢ أداة متكاملة" : "22 Total Tools"}
          </span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {WORKSPACE_DATA.map((group) => {
          const GroupIcon = group.icon;
          const isExpanded = selectedGroup === group.id;

          return (
            <motion.div
              layout
              key={group.id}
              onClick={() => setSelectedGroup(isExpanded ? null : group.id)}
              className={cn(
                "p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden cursor-pointer bg-zinc-50/50 dark:bg-zinc-100/10 border-zinc-150 dark:border-zinc-850/60 flex flex-col justify-between select-none shadow-sm",
                group.borderClass,
                isExpanded
                  ? "md:col-span-2 shadow-md bg-white dark:bg-zinc-100/30"
                  : "hover:shadow-md hover:scale-[1.01]"
              )}
            >
              <div
                className={cn(
                  "absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none bg-gradient-to-br opacity-70",
                  group.bgClass
                )}
              />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={cn("p-3 rounded-2xl bg-zinc-100 dark:bg-zinc-850", group.colorClass)}
                  >
                    <GroupIcon className="w-5 h-5" />
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-zinc-400 transition-transform duration-300",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}
                  />
                </div>

                <h4 className="text-base font-black text-zinc-950 dark:text-zinc-100">
                  {isAr ? group.titleAr : group.titleEn}
                </h4>
                <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
                  {isAr ? group.descriptionAr : group.descriptionEn}
                </p>

                {/* Sub-tools list */}
                <AnimatePresence initial={false}>
                  {isExpanded ? (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 border-t border-zinc-100 dark:border-zinc-850/60 pt-5 space-y-4"
                    >
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
                        {isAr ? "الأدوات المتوفرة في مساحة العمل:" : "Available Workspace Tools:"}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {group.tools.map((tool) => {
                          const ToolIcon = tool.icon;
                          return (
                            <Link
                              key={tool.id}
                              to={tool.path}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-start gap-3 p-3 bg-white dark:bg-zinc-100 border border-zinc-150/70 dark:border-zinc-800/80 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 rounded-2xl hover:shadow-sm transition group"
                            >
                              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-850 text-zinc-500 group-hover:text-emerald-500 rounded-xl shrink-0 transition-colors">
                                <ToolIcon className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-emerald-500 transition-colors truncate">
                                    {isAr ? tool.nameAr : tool.nameEn}
                                  </span>
                                  {tool.badgeAr && (
                                    <span className="text-[8px] font-black bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded-full uppercase shrink-0">
                                      {isAr ? tool.badgeAr : tool.badgeEn}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-normal">
                                  {isAr ? tool.descriptionAr : tool.descriptionEn}
                                </p>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {group.tools.map((tool) => (
                        <span
                          key={tool.id}
                          className="text-[10px] font-bold bg-zinc-100 dark:bg-zinc-100 text-zinc-600 dark:text-zinc-400 px-2.5 py-1 rounded-xl"
                        >
                          {isAr ? tool.nameAr : tool.nameEn}
                        </span>
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>

              {/* Enter workspace action */}
              {isExpanded && (
                <div className="mt-6 border-t border-zinc-100 dark:border-zinc-850/60 pt-4 flex justify-end relative z-10">
                  <Link
                    to={group.tools[0].path}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs font-black text-emerald-500 hover:text-emerald-400 transition"
                  >
                    <span>{isAr ? "الدخول السريع لمساحة العمل" : "Launch Workspace"}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
