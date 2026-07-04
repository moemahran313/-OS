import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import Navbar from "@/src/components/Navbar";
import {
  HardHat,
  Landmark,
  Activity,
  GraduationCap,
  Factory,
  ShoppingBag,
  Truck,
  TrendingUp,
  Briefcase,
  Hotel,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Play,
  Check,
  ChevronDown,
  Cpu,
  FileText,
  BarChart2,
  Settings,
  Database,
  Smartphone,
  X,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpRight,
  CheckSquare,
} from "lucide-react";

// Types
interface Industry {
  id: string;
  name: { ar: string; en: string };
  desc: { ar: string; en: string };
  workflows: { ar: string[]; en: string[] };
  icon: React.ComponentType<any>;
  color: string;
  bgLight: string;
  borderColor: string;
  simTitle: { ar: string; en: string };
  simSteps: { ar: string[]; en: string[] };
  simFields: {
    label: { ar: string; en: string };
    type: "text" | "number" | "select";
    placeholder?: { ar: string; en: string };
    options?: { ar: string; en: string }[];
  }[];
}

export default function Solutions() {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState<"ar" | "en">("ar");

  // Keep in sync with i18n language
  useEffect(() => {
    if (i18n.language === "en") {
      setLang("en");
    } else {
      setLang("ar");
    }
  }, [i18n.language]);

  const isAr = lang === "ar";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. Industries Data Array
  const industries: Industry[] = [
    {
      id: "construction",
      name: { ar: "المقاولات والإنشاءات", en: "Construction & Contracting" },
      desc: {
        ar: "تبسيط المشروعات الهندسية، وعقود الباطن، ومطالبات المواد مع مسارات اعتماد ميدانية فورية وتتبع الموارد.",
        en: "Streamline engineering projects, subcontracting, and materials requests with real-time field approvals.",
      },
      workflows: {
        ar: [
          "إدارة المشاريع",
          "معاينة المواقع الميدانية",
          "طلبات توريد المواد",
          "سلاسل الشراء والمشتريات",
          "تتبع المعدات والآليات",
        ],
        en: [
          "Project Management",
          "Site Inspections",
          "Material Requests",
          "Procurement",
          "Equipment Tracking",
        ],
      },
      icon: HardHat,
      color: "text-amber-500",
      bgLight: "bg-amber-500/5",
      borderColor: "border-amber-500/10",
      simTitle: { ar: "نظام مستخلصات وعقود بناء ذكي", en: "Smart Materials Request Pipeline" },
      simSteps: {
        ar: ["تقديم الطلب", "فحص الموقع", "اعتماد المهندس", "طلب تسعير الموردين", "التسليم والدفع"],
        en: ["Request Sent", "Site Audit", "Engineer Review", "Supplier RFQ", "Logistics & Payout"],
      },
      simFields: [
        {
          label: { ar: "اسم المشروع الميداني", en: "Field Project Name" },
          type: "text",
          placeholder: { ar: "مشروع برج العليا الرياض", en: "Al Olaya Tower Riyadh" },
        },
        {
          label: { ar: "نوع المواد المطلوبة", en: "Material Category" },
          type: "select",
          options: [
            { ar: "خرسانة جاهزة مقاومة للكبريتات", en: "Ready-mix Concrete (Sulfate Resistant)" },
            { ar: "حديد تسليح سابك 16 مم", en: "SABIC Reinforcement Steel 16mm" },
            { ar: "مواد عزل مائي وحراري", en: "Thermal & Waterproofing Materials" },
          ],
        },
        {
          label: { ar: "الكمية المطلوبة (بالأطنان)", en: "Quantity Needed (Tons)" },
          type: "number",
          placeholder: { ar: "50", en: "50" },
        },
      ],
    },
    {
      id: "government",
      name: { ar: "القطاع الحكومي والعام", en: "Government & Public Sector" },
      desc: {
        ar: "أتمتة الخدمات الرقمية للمستفيدين، وتسريع الموافقات الإدارية الداخلية، وحفظ سجل مراجعة آمن وشفاف.",
        en: "Digitize public services, accelerate internal administrative approvals, and maintain a highly secure audit trail.",
      },
      workflows: {
        ar: [
          "الخدمات الرقمية للمستفيدين",
          "مسار الموافقات الداخلية",
          "إدارة التصاريح والتراخيص",
          "الاتصالات الإدارية والمراسلات",
          "سجلات المراجعة والتدقيق",
        ],
        en: [
          "Digital Services",
          "Internal Approvals",
          "Permit Management",
          "Correspondence",
          "Audit Trails",
        ],
      },
      icon: Landmark,
      color: "text-sky-500",
      bgLight: "bg-sky-500/5",
      borderColor: "border-sky-500/10",
      simTitle: { ar: "بوابة تراخيص ونظام معاملات بلدي", en: "Municipal Permit Approval Stream" },
      simSteps: {
        ar: [
          "تقديم الطلب رقمياً",
          "تدقيق الوثائق",
          "موافقة رئيس القسم",
          "مطابقة شروط السلامة",
          "إصدار الترخيص",
        ],
        en: [
          "Submit Online",
          "Document Audit",
          "Director Approval",
          "Safety Clearance",
          "Issue License",
        ],
      },
      simFields: [
        {
          label: { ar: "الجهة الحكومية المعنية", en: "Government Department" },
          type: "text",
          placeholder: { ar: "بلدية وسط الرياض", en: "Central Riyadh Municipality" },
        },
        {
          label: { ar: "نوع الترخيص المطلوب", en: "Requested Permit Type" },
          type: "select",
          options: [
            { ar: "رخصة تشغيل تجاري فوري", en: "Immediate Commercial Permit" },
            { ar: "موافقة سلامة إنشائية معقدة", en: "Structural Safety Approval" },
            { ar: "تصريح استخدام الفضاء العام", en: "Public Space Usage Permit" },
          ],
        },
        {
          label: { ar: "رقم الهوية الوطنية للمستفيد", en: "National ID / Registration" },
          type: "number",
          placeholder: { ar: "1098765432", en: "1098765432" },
        },
      ],
    },
    {
      id: "healthcare",
      name: { ar: "الرعاية الصحية والطبية", en: "Healthcare" },
      desc: {
        ar: "ضمان الامتثال الطبي الكامل للوائح والتعليمات، إدارة تقارير الحوادث، وأتمتة سلاسل مستلزمات المستشفى.",
        en: "Ensure clinical compliance, report patient-safety incidents, and automate hospital asset supply chains.",
      },
      workflows: {
        ar: [
          "تقارير الأحداث الطبية",
          "إدارة المعدات الطبية والتعقيم",
          "طلبات الكوادر البشرية",
          "الامتثال واللوائح الطبية",
          "الجودة الشاملة وتقييم الأداء",
        ],
        en: [
          "Incident Reporting",
          "Medical Equipment",
          "HR Requests",
          "Compliance",
          "Quality Assurance",
        ],
      },
      icon: Activity,
      color: "text-rose-500",
      bgLight: "bg-rose-500/5",
      borderColor: "border-rose-500/10",
      simTitle: {
        ar: "سجل سلامة المرضى والتقارير الطبية",
        en: "Clinical Incident & Safety Workflow",
      },
      simSteps: {
        ar: [
          "تسجيل بلاغ الحادثة",
          "تصنيف درجة الخطورة",
          "إشعار منسق الجودة",
          "التحقيق الطبي والتشخيص",
          "التوصيات الإجرائية المعتمدة",
        ],
        en: [
          "Log Incident",
          "Severity Triage",
          "Quality Notification",
          "Clinical Audit",
          "Action Plan Issued",
        ],
      },
      simFields: [
        {
          label: { ar: "رمز القسم أو الجناح", en: "Hospital Ward/Unit Code" },
          type: "text",
          placeholder: { ar: "جناح العناية المركزة ICU-3", en: "ICU Ward 3" },
        },
        {
          label: { ar: "نوع البلاغ السريري", en: "Clinical Event Category" },
          type: "select",
          options: [
            { ar: "عطل مفاجئ في جهاز مراقبة المريض", en: "Patient Monitor Malfunction" },
            { ar: "بلاغ سلامة دوائية استباقي", en: "Medication Near-Miss Report" },
            { ar: "شعبة مكافحة العدوى والوقاية", en: "Infection Control Clearance" },
          ],
        },
        {
          label: { ar: "مستوى الأهمية الفورية", en: "Priority Level" },
          type: "select",
          options: [
            { ar: "أحمر - طارئ وخطير جداً", en: "Urgent (Red Alert)" },
            { ar: "أصفر - متوسط ومهم", en: "Moderate (Yellow)" },
            { ar: "أخضر - بلاغ جودة روتيني", en: "Routine Review (Green)" },
          ],
        },
      ],
    },
    {
      id: "education",
      name: { ar: "التعليم والجامعات", en: "Education" },
      desc: {
        ar: "تنظيم العمليات الأكاديمية والتعليمية، تبسيط معالجة طلبات الطلاب والمبتعثين، وتتبع أصول ومستلزمات الحرم الجامعي.",
        en: "Optimize academic processes, streamline student request systems, and track campus inventory effortlessly.",
      },
      workflows: {
        ar: [
          "إدارة طلبات الطلاب",
          "سير العمل الأكاديمي",
          "عمليات الشراء والتموين",
          "شؤون المعلمين والموظفين",
          "تتبع العهد والأصول المدرسية",
        ],
        en: [
          "Student Requests",
          "Academic Workflows",
          "Procurement",
          "Staff Management",
          "Asset Tracking",
        ],
      },
      icon: GraduationCap,
      color: "text-indigo-500",
      bgLight: "bg-indigo-500/5",
      borderColor: "border-indigo-500/10",
      simTitle: { ar: "إدارة طلبات الخدمات الأكاديمية", en: "Academic Petition & Request Route" },
      simSteps: {
        ar: [
          "تقديم عريضة الطالب",
          "مراجعة شؤون الطلاب",
          "اعتماد عميد الكلية",
          "تعديل السجل الأكاديمي",
          "إشعار الطالب بالنتيجة",
        ],
        en: [
          "Submit Petition",
          "Advisor Evaluation",
          "Dean Signature",
          "Registrar System Update",
          "Student Notification",
        ],
      },
      simFields: [
        {
          label: { ar: "الرقم الجامعي للطالب", en: "Student Academic ID" },
          type: "number",
          placeholder: { ar: "442109876", en: "442109876" },
        },
        {
          label: { ar: "نوع الطلب الأكاديمي", en: "Petition Service Type" },
          type: "select",
          options: [
            { ar: "طلب إعادة تقييم مقرر دراسي", en: "Course Re-evaluation Request" },
            { ar: "تأجيل فصل دراسي لأسباب قهرية", en: "Semester Deferral Application" },
            { ar: "طلب تحويل تخصص بين الكليات", en: "Major Transfer Form" },
          ],
        },
        {
          label: { ar: "معدل الطالب التراكمي", en: "Current GPA" },
          type: "text",
          placeholder: { ar: "4.85 / 5.00", en: "4.85 / 5.00" },
        },
      ],
    },
    {
      id: "manufacturing",
      name: { ar: "التصنيع والإنتاج", en: "Manufacturing" },
      desc: {
        ar: "مراقبة معايير الجودة لخطوط الإنتاج، تنظيم تنبيهات صيانة الآلات السريعة، وإدارة شحنات القطع من الموردين.",
        en: "Monitor floor quality control, streamline equipment maintenance alerts, and manage vendor components.",
      },
      workflows: {
        ar: [
          "دعم خطوط الإنتاج",
          "الصيانة الوقائية للآلات",
          "مراقبة الجودة الشاملة",
          "إدارة المخزون والتخزين",
          "إدارة الموردين والشركاء",
        ],
        en: [
          "Production Support",
          "Maintenance",
          "Quality Control",
          "Inventory",
          "Supplier Management",
        ],
      },
      icon: Factory,
      color: "text-teal-500",
      bgLight: "bg-teal-500/5",
      borderColor: "border-teal-500/10",
      simTitle: { ar: "نظام صيانة المصانع الذكية", en: "Smart Factory Maintenance Loop" },
      simSteps: {
        ar: [
          "استشعار الخلل / التبليغ",
          "تخصيص فني الصيانة",
          "توفير قطع الغيار",
          "الإصلاح واختبار التشغيل",
          "اعتماد مهندس السلامة",
        ],
        en: [
          "Sensor Flag / Report",
          "Assign Technician",
          "Dispatch Spare Parts",
          "Repair & QA Run",
          "Safety Sign-off",
        ],
      },
      simFields: [
        {
          label: { ar: "معرّف خط الإنتاج والآلة", en: "Production Line & Machine ID" },
          type: "text",
          placeholder: { ar: "خط التعبئة الآلي LINE-B2", en: "Automation Line B2" },
        },
        {
          label: { ar: "نوع الخلل المبلغ عنه", en: "Reported Mechanical Issue" },
          type: "select",
          options: [
            { ar: "انخفاض الضغط الهيدروليكي المفاجئ", en: "Sudden Hydraulic Drop" },
            { ar: "خلل استشعار حراري في المحرك", en: "Motor Overheat Sensor Flag" },
            { ar: "حاجة للمعايرة السنوية الدورية", en: "Scheduled Yearly Calibration" },
          ],
        },
        {
          label: { ar: "تكلفة التوقف التقديرية / ساعة", en: "Estimated Downtime Cost / Hr" },
          type: "text",
          placeholder: { ar: "15,000 ريال", en: "4,000 USD" },
        },
      ],
    },
    {
      id: "retail",
      name: { ar: "قطاع التجزئة والمتاجر", en: "Retail" },
      desc: {
        ar: "مزامنة طلبات الفروع المتعددة والمخازن، تسريع تهيئة وتوظيف الكوادر، وأتمتة اعتمادات نقل وتوريد المخزون.",
        en: "Synchronize multi-branch request routing, manage fast employee onboarding, and automate stock replenishments.",
      },
      workflows: {
        ar: [
          "عمليات المعارض والمتاجر",
          "طلبات الفروع والمستودعات",
          "موافقات توريد ونقل المخزون",
          "توجيه وتعيين الموظفين الجدد",
          "إدارة بائعي التجزئة والموردين",
        ],
        en: [
          "Store Operations",
          "Branch Requests",
          "Inventory Approvals",
          "Employee Onboarding",
          "Vendor Management",
        ],
      },
      icon: ShoppingBag,
      color: "text-emerald-500",
      bgLight: "bg-emerald-500/5",
      borderColor: "border-emerald-500/10",
      simTitle: { ar: "مسار مناقلة المخزون بين الفروع", en: "Branch Stock Reallocation Flow" },
      simSteps: {
        ar: [
          "طلب تحويل كمية من الفرع",
          "فحص رصيد المستودع",
          "موافقة مدير التموين",
          "توليد بوليصة النقل",
          "استلام الفرع وتأكيد الرصيد",
        ],
        en: [
          "Branch Request Sent",
          "Inventory Check",
          "Supply Chain Approval",
          "Generate Shipping Slip",
          "Branch Intake Confirmed",
        ],
      },
      simFields: [
        {
          label: { ar: "الفرع الطالب للمخزون", en: "Requesting Store Location" },
          type: "text",
          placeholder: { ar: "فرع الرياض - النخيل مول", en: "Riyadh Nakheel Mall Branch" },
        },
        {
          label: { ar: "اسم البضاعة / المنتج", en: "Item Description / SKU" },
          type: "select",
          options: [
            { ar: "أجهزة لوحية ذكية - فئة أ", en: "Smart Tablets Series-A" },
            { ar: "شواحن لاسلكية فائقة السرعة", en: "Ultra-fast Wireless Chargers" },
            { ar: "ملحقات وكابلات معتمدة", en: "Certified USB-C Cables" },
          ],
        },
        {
          label: { ar: "الكمية المطلوبة فوراً", en: "Requested Quantity" },
          type: "number",
          placeholder: { ar: "200", en: "200" },
        },
      ],
    },
    {
      id: "logistics",
      name: { ar: "الخدمات اللوجستية والنقل", en: "Logistics & Transportation" },
      desc: {
        ar: "أتمتة طلبات صيانة أسطول الشحن، تبسيط تسليم وإثبات استلام البضائع، وتتبع دورة حياة الأصول اللوجستية.",
        en: "Automate fleet maintenance requests, streamline cargo delivery verification, and track asset handovers.",
      },
      workflows: {
        ar: [
          "إدارة وصيانة أسطول المركبات",
          "طلبات الترحيل والجدولة",
          "سير عمل عمليات التسليم",
          "تقارير الحوادث والتأخير",
          "تتبع الحاويات والأصول",
        ],
        en: [
          "Fleet Management",
          "Dispatch Requests",
          "Delivery Workflows",
          "Incident Reports",
          "Asset Tracking",
        ],
      },
      icon: Truck,
      color: "text-cyan-500",
      bgLight: "bg-cyan-500/5",
      borderColor: "border-cyan-500/10",
      simTitle: {
        ar: "بوابة تسليم وتتبع الشحنات الذكية",
        en: "Cargo Dispatch & Handover Pipeline",
      },
      simSteps: {
        ar: [
          "إنشاء تفاصيل الرحلة",
          "تفتيش وتصريح الحاوية",
          "انطلاق السائق والتتبع",
          "مسح الكود عند الوصول",
          "توقيع إثبات الاستلام الرقمي",
        ],
        en: [
          "Create Shipment Profile",
          "Container Clearance",
          "Driver Dispatch & GPS",
          "Scan QR Code on Arrival",
          "Sign Digital Proof-of-Delivery",
        ],
      },
      simFields: [
        {
          label: { ar: "مسار الرحلة والوجهة", en: "Shipment Destination Route" },
          type: "text",
          placeholder: {
            ar: "من ميناء جدة الإسلامي إلى مستودعات الرياض",
            en: "Jeddah Port to Riyadh Warehouse",
          },
        },
        {
          label: { ar: "وزن الحمولة التقديري (طن)", en: "Estimated Cargo Weight (Tons)" },
          type: "number",
          placeholder: { ar: "22", en: "22" },
        },
        {
          label: { ar: "اسم شركة النقل / الناقل", en: "Logistics Carrier Partner" },
          type: "select",
          options: [
            { ar: "شركة مدارج للنقل السريع", en: "Madarij Express Logistics" },
            { ar: "الناقل الوطني للخليج", en: "Gulf National Transport" },
          ],
        },
      ],
    },
    {
      id: "financial",
      name: { ar: "الخدمات المالية والاستثمارية", en: "Financial Services" },
      desc: {
        ar: "حوكمة واعتماد السياسات المالية، تبسيط تهيئة العملاء والشركات، وأتمتة تقارير الامتثال والتدقيق المالي الشامل.",
        en: "Govern policy approvals, streamline corporate client onboarding, and automate compliance auditing.",
      },
      workflows: {
        ar: [
          "إدارة الامتثال واللوائح",
          "مراجعة وتحليل المخاطر",
          "موافقات التسهيلات الداخلية",
          "تهيئة وفحص الموردين",
          "حوكمة السياسات المالية",
        ],
        en: [
          "Compliance",
          "Risk Reviews",
          "Internal Approvals",
          "Vendor Onboarding",
          "Policy Management",
        ],
      },
      icon: TrendingUp,
      color: "text-violet-500",
      bgLight: "bg-violet-500/5",
      borderColor: "border-violet-500/10",
      simTitle: {
        ar: "بوابة مراجعة المخاطر والائتمان المالي",
        en: "Financial Risk Evaluation Process",
      },
      simSteps: {
        ar: [
          "تقديم طلب العميل التجاري",
          "التحقق المالي التلقائي (سمة)",
          "تقييم محلل المخاطر",
          "موافقة اللجنة المالية",
          "تفعيل الحساب والتمويل",
        ],
        en: [
          "Submit Client Request",
          "Automated Credit Check",
          "Risk Analyst Review",
          "Committee Sign-off",
          "Activate Account & Funds",
        ],
      },
      simFields: [
        {
          label: { ar: "اسم الشركة المتقدمة", en: "Corporate Applicant Name" },
          type: "text",
          placeholder: { ar: "مجموعة العليان التجارية للتقنية", en: "Olayan Commerce Tech" },
        },
        {
          label: { ar: "حجم التسهيل الائتماني المطلوب", en: "Requested Credit Limit" },
          type: "select",
          options: [
            { ar: "1,000,000 ريال سعودي", en: "1,000,000 SAR" },
            { ar: "5,000,000 ريال سعودي", en: "5,000,000 SAR" },
            { ar: "10,000,000 ريال سعودي", en: "10,000,000 SAR" },
          ],
        },
        {
          label: { ar: "التقرير المالي للعام السابق", en: "Previous Year Financial Report" },
          type: "select",
          options: [
            { ar: "مرفق - معتمد ومراجع قانونياً", en: "Attached - Audited & Certified" },
            { ar: "مسودة - بانتظار الاعتماد النهائي", en: "Draft - Waiting Certification" },
          ],
        },
      ],
    },
    {
      id: "professional",
      name: { ar: "الخدمات المهنية والاستشارية", en: "Professional Services" },
      desc: {
        ar: "توزيع وتخصيص الموارد الاستشارية على المشاريع الكبرى، تسريع اعتمادات المخرجات، وبناء بيئة موحدة للشركات.",
        en: "Optimize project resource allocation, streamline milestone signoffs, and structure central workspaces.",
      },
      workflows: {
        ar: [
          "تهيئة وتوجيه العملاء",
          "اعتماد مخرجات المشاريع",
          "قاعدة المعرفة والمستندات",
          "طلبات الاستشاريين والموظفين",
          "جدولة وتوزيع الموارد البشرية",
        ],
        en: [
          "Client Onboarding",
          "Project Approvals",
          "Knowledge Base",
          "Employee Requests",
          "Resource Allocation",
        ],
      },
      icon: Briefcase,
      color: "text-blue-500",
      bgLight: "bg-blue-500/5",
      borderColor: "border-blue-500/10",
      simTitle: { ar: "اعتماد مخرجات ومستندات المشروع", en: "Milestone Review & Signoff" },
      simSteps: {
        ar: [
          "رفع مسودة المخرج المهني",
          "مراجعة شريك الجودة",
          "تقييم العميل للمخرج",
          "طلب التوقيع والاعتماد",
          "إصدار الفاتورة المرتبطة",
        ],
        en: [
          "Upload Deliverable Draft",
          "QA Partner Review",
          "Client Evaluation",
          "Sign-off Document",
          "Issue Milestone Invoice",
        ],
      },
      simFields: [
        {
          label: { ar: "عنوان المخرج الاستشاري", en: "Consulting Deliverable Title" },
          type: "text",
          placeholder: {
            ar: "دراسة الجدوى وخطط التحول الرقمي",
            en: "Digital Transformation Blueprint",
          },
        },
        {
          label: { ar: "رقم المرحلة المعتمدة", en: "Milestone Phase" },
          type: "select",
          options: [
            { ar: "المرحلة الأولى - دراسة الوضع الراهن", en: "Phase 1 - Current State Study" },
            { ar: "المرحلة الثانية - هندسة العمليات", en: "Phase 2 - Process Re-engineering" },
            { ar: "المرحلة الثالثة - خطة التفعيل", en: "Phase 3 - Implementation Roadmap" },
          ],
        },
        {
          label: { ar: "الاستشاري المسؤول عن المخرج", en: "Lead Consultant" },
          type: "text",
          placeholder: { ar: "د. هاني السليمان", en: "Dr. Hani Al-Sulaiman" },
        },
      ],
    },
    {
      id: "hospitality",
      name: { ar: "الضيافة والخدمات الفندقية", en: "Hospitality" },
      desc: {
        ar: "تنسيق مهام النظافة والخدمات اللحظية للفنادق، تسريع اعتمادات التموين، ومعالجة وصيانة الغرف والمرافق.",
        en: "Coordinate housekeeping tasks, streamline procurement approvals, and resolve facility maintenance issues.",
      },
      workflows: {
        ar: [
          "إدارة طلبات النزلاء",
          "أعطال وصيانة الغرف",
          "مشتريات الأغذية والمستلزمات",
          "جدولة المناوبات والورديات",
          "إدارة المرافق والمنشآت",
        ],
        en: [
          "Guest Requests",
          "Maintenance",
          "Procurement",
          "Staff Scheduling",
          "Facility Management",
        ],
      },
      icon: Hotel,
      color: "text-purple-500",
      bgLight: "bg-purple-500/5",
      borderColor: "border-purple-500/10",
      simTitle: {
        ar: "نظام إدارة تلبية طلبات النزلاء والغرف",
        en: "Guest Request Dispatch Pipeline",
      },
      simSteps: {
        ar: [
          "تلقي الطلب من النزيل",
          "توجيه آلي للقسم المختص",
          "تأكيد استلام الموظف للمهمة",
          "تنفيذ الخدمة وتصوير النتيجة",
          "تأكيد النزيل وإغلاق الطلب",
        ],
        en: [
          "Guest Request Received",
          "Auto-dispatch to Department",
          "Staff Acceptance",
          "Service Execution & Quality Check",
          "Guest Feedback & Complete",
        ],
      },
      simFields: [
        {
          label: { ar: "رقم الغرفة أو الجناح", en: "Room or Suite Number" },
          type: "number",
          placeholder: { ar: "402", en: "402" },
        },
        {
          label: { ar: "نوع طلب النزيل الفوري", en: "Service Category" },
          type: "select",
          options: [
            { ar: "طلب صيانة تكييف الغرفة", en: "Room AC Maintenance" },
            { ar: "تنظيف وتجهيز غرف إضافي", en: "Extra Room Housekeeping" },
            { ar: "خدمة الغرف المأكولات والمشروبات", en: "In-Room Dining Request" },
          ],
        },
        {
          label: { ar: "درجة الأولوية للخدمة", en: "Service Urgency" },
          type: "select",
          options: [
            { ar: "عالي جداً - تلبية فورية", en: "High - Immediate Action" },
            { ar: "متوسط - تلبية خلال 15 دقيقة", en: "Medium - Within 15 Minutes" },
          ],
        },
      ],
    },
  ];

  // Selected Industry for Details/Interactive Simulator
  const [selectedInd, setSelectedInd] = useState<Industry>(industries[0]);
  const [simStep, setSimStep] = useState<number>(0);
  const [simActive, setSimActive] = useState<boolean>(false);
  const [showSimModal, setShowSimModal] = useState<boolean>(false);

  // Auto Reset or Progress of Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (simActive && simStep < selectedInd.simSteps[lang].length - 1) {
      timer = setTimeout(() => {
        setSimStep((prev) => prev + 1);
      }, 1500);
    } else if (simStep === selectedInd.simSteps[lang].length - 1) {
      setSimActive(false);
    }
    return () => clearTimeout(timer);
  }, [simActive, simStep, selectedInd, lang]);

  const handleStartSim = (e: React.FormEvent) => {
    e.preventDefault();
    setSimStep(0);
    setSimActive(true);
  };

  const handleSelectIndustry = (ind: Industry) => {
    setSelectedInd(ind);
    setSimStep(0);
    setSimActive(false);
  };

  // 2. Features Data for "Why Madarij OS"
  const features = [
    {
      title: { ar: "مطور مسارات عمل بدون كود", en: "No-Code Workflow Builder" },
      desc: {
        ar: "صمم مسارات الاعتماد والتوجيه بصرياً عبر محاكاة حية للسير الإجرائي لشركتك دون الحاجة لكتابة كود.",
        en: "Design your approval and routing paths visually through a live simulation of your business processes without any coding.",
      },
      icon: Cpu,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: { ar: "نماذج ديناميكية مرنة", en: "Dynamic Forms" },
      desc: {
        ar: "أنشئ حقولاً مخصصة لالتقاط وتخزين وتوجيه كافة البيانات الحيوية بدقة لتسهيل إنجاز المعاملات.",
        en: "Create highly structured custom fields to capture, validate, and route critical data points seamlessly.",
      },
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: { ar: "أتمتة العمليات والمهام", en: "Process Automation" },
      desc: {
        ar: "تخلص من التدخل اليدوي المتكرر واربط العمليات ببعضها عبر محفزات تلقائية وقواعد ذكية.",
        en: "Eliminate repetitive manual triggers. Connect separate processes using auto-triggers and smart rules.",
      },
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: { ar: "وكلاء ومساعدو الذكاء الاصطناعي", en: "AI Assistants" },
      desc: {
        ar: "قراءة وتحليل الطلبات فورياً، استخراج البيانات، تقديم توصيات ذكية، وتوليد ملخصات للمعاملات الكبرى.",
        en: "Instantly analyze incoming requests, extract structured data, provide suggestions, and synthesize summaries.",
      },
      icon: Sparkles,
      color: "text-violet-500",
      bg: "bg-violet-500/10 border-violet-500/20",
    },
    {
      title: { ar: "صلاحيات دقيقة مرنة", en: "Role-Based Permissions" },
      desc: {
        ar: "حماية تامة للبيانات الحساسة عبر منح صلاحيات مخصصة لكل موظف وقسم ومدير مالي.",
        en: "Ensure data security by assigning tailored access rights for employees, department leads, and executives.",
      },
      icon: ShieldCheck,
      color: "text-sky-500",
      bg: "bg-sky-500/10 border-sky-500/20",
    },
    {
      title: { ar: "تحليلات تفاعلية ذكية", en: "Dashboards & Analytics" },
      desc: {
        ar: "رصد مؤشرات الأداء اللحظية، مراقبة الاختناقات الإدارية في الموافقات، وتحسين الكفاءة التشغيلية.",
        en: "Monitor real-time KPIs, identify bottlenecks in approval lines, and optimize operational efficiency.",
      },
      icon: BarChart2,
      color: "text-rose-500",
      bg: "bg-rose-500/10 border-rose-500/20",
    },
    {
      title: { ar: "إدارة وأرشفة المستندات", en: "Document Management" },
      desc: {
        ar: "تنظيم العقود والملفات والمستندات الرسمية وأرشفتها بصورة مركزية آمنة وربطها التلقائي بالمعاملات.",
        en: "Centralize and secure all legal contracts, files, and attachments with direct links to corresponding workflows.",
      },
      icon: Database,
      color: "text-teal-500",
      bg: "bg-teal-500/10 border-teal-500/20",
    },
    {
      title: { ar: "تطبيق متكامل للأجهزة", en: "Mobile Access" },
      desc: {
        ar: "تابع أعمالك، مرر الموافقات الطارئة، وراجع تقارير الأداء اللحظية مباشرة من هاتفك في أي وقت.",
        en: "Run your operations on-the-go. Authorize critical decisions and view real-time reports from your mobile device.",
      },
      icon: Smartphone,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: { ar: "الربط والتكامل الشامل", en: "Enterprise Integrations" },
      desc: {
        ar: "تكامل مباشر مع هيئة الزكاة والضريبة والجمارك (ZATCA)، مدد، قوى، والأنظمة البنكية والمالية المختلفة.",
        en: "Direct integrations with ZATCA, Mudad, Qiwa, regional banks, and core global enterprise APIs.",
      },
      icon: Layers,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10 border-indigo-500/20",
    },
    {
      title: { ar: "بنية تحتية سحابية مرنة", en: "Scalable Architecture" },
      desc: {
        ar: "بنية تحتية متطورة تضمن استقرار النظام والجاهزية بنسبة 99.9% حتى مع معالجة ملايين الطلبات شهرياً.",
        en: "Advanced, highly available architecture guaranteeing 99.9% uptime while handling millions of transactions.",
      },
      icon: Settings,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    },
  ];

  // 3. How It Works Timeline Steps
  const timelineSteps = [
    {
      id: "discover",
      title: { ar: "١. الاستكشاف ورسم الإجراءات", en: "1. Discover Your Needs" },
      desc: {
        ar: "نقوم بفهم عملياتك وتوثيق احتياجاتك الإدارية والميدانية الفعلية ورسم تدفقها المنطقي والعملي.",
        en: "We map your current administrative and field operations to document and refine their logical flow.",
      },
    },
    {
      id: "configure",
      title: { ar: "٢. التهيئة بدون تعقيد برمجي", en: "2. Configure in Minutes" },
      desc: {
        ar: "بناء النماذج، وتحديد مسارات الموافقة، وتهيئة شاشات الموظفين بصرياً خلال ساعات دون كتابة كود واحد.",
        en: "Design forms, assign approval channels, and setup employee interfaces without writing a single line of code.",
      },
    },
    {
      id: "automate",
      title: { ar: "٣. تفعيل الأتمتة التلقائية", en: "3. Automate Operations" },
      desc: {
        ar: "تفعيل الربط والذكاء الاصطناعي لإلغاء المهام المتكررة واليدوية، وتسريع دوران مسار الموافقات بالكامل.",
        en: "Deploy smart rules, triggers, and AI agents to run mundane tasks and accelerate execution routes.",
      },
    },
    {
      id: "optimize",
      title: { ar: "٤. التحسين والذكاء المستمر", en: "4. Optimize & Scale" },
      desc: {
        ar: "قياس زمن الإنجاز من لوحة التحليلات، مع تحديث مسارات العمل ديناميكياً لتجاوز العقبات مستقبلاً.",
        en: "Evaluate speed metrics from your dashboard, updating approval processes on-the-fly to remove hurdles.",
      },
    },
  ];

  // 4. Success Metrics Data
  const metrics = [
    {
      value: "80%",
      label: {
        ar: "إنجاز أسرع للعمليات الإدارية والموافقة",
        en: "Faster Process & Approval Completion",
      },
      desc: {
        ar: "تسريع مذهل في معالجة طلبات الأقسام والمستخلصات وعقود التوريد.",
        en: "Unlocking immediate processing for departments, invoices, and material orders.",
      },
    },
    {
      value: "70%",
      label: {
        ar: "تقليص للمهام الإدارية اليدوية المتكررة",
        en: "Reduction in Manual Administrative Overhead",
      },
      desc: {
        ar: "أتمتة كاملة للأرشفة، المتابعة، والاتصالات الحكومية والمحلية بذكاء.",
        en: "Fully automated folder archival, status checks, and local compliance sync.",
      },
    },
    {
      value: "100%",
      label: { ar: "شفافية وتتبع رقمي كامل لسجلات التدقيق", en: "Digital Approval Transparency" },
      desc: {
        ar: "تتبع كل تعديل، موافقة، وتوقيع بدقة متناهية وبشكل فوري.",
        en: "Track every staff response, department signature, and document change.",
      },
    },
    {
      value: "Enterprise",
      label: {
        ar: "أمان تشفيري وحوكمة على مستوى المؤسسات",
        en: "Enterprise-Grade Security Standards",
      },
      desc: {
        ar: "استضافة سحابية آمنة في السعودية بامتثال كامل لضوابط الهيئة الوطنية للأمن السيبراني.",
        en: "Highly secure cloud-hosting matching national cyber-security regulations.",
      },
    },
  ];

  // 5. Industries Comparison Table Data
  const comparisons = [
    {
      industry: { ar: "المقاولات والإنشاءات", en: "Construction" },
      processes: {
        ar: "المستخلصات، فحص الموقع، طلبات المواد",
        en: "Milestones, Site Audits, RFQs",
      },
      automation: {
        ar: "توليد تلقائي لطلبات الدفع ومستخلصات البناء",
        en: "Auto-generates payout bills & milestone certificates",
      },
      ai: {
        ar: "مقارنة عروض الموردين واكتشاف الفروقات السعرية",
        en: "Extracts vendor proposals & flags price anomalies",
      },
      approvals: {
        ar: "مسارات اعتماد متعددة تبدأ من المهندس الميداني للمدير المالي",
        en: "Chain starts from site engineers to the CFO",
      },
      dashboards: {
        ar: "تكاليف المواد، نسب إنجاز مشاريع المواقع",
        en: "Material procurement logs, project completion rate",
      },
      integrations: {
        ar: "ربط مع سابك، موردي الخرسانة، ومتابعي النقل",
        en: "SABIC API, major raw-material supply platforms",
      },
    },
    {
      industry: { ar: "القطاع الحكومي والعام", en: "Government" },
      processes: {
        ar: "طلب تصاريح المواطنين، المعاملات الداخلية",
        en: "Citizen license applications, public correspondence",
      },
      automation: {
        ar: "توليد فوري للشهادات والتراخيص الرقمية المعتمدة",
        en: "Instantly issues verified digital certificates & permits",
      },
      ai: {
        ar: "فرز آلي للمعاملات الصادرة والواردة وتلخيصها",
        en: "Auto-routes incoming letters & summarizes large briefs",
      },
      approvals: {
        ar: "سير موافقات معتمد مع توقيع رقمي للمدراء",
        en: "Rigid multi-tier routing with digital signature locks",
      },
      dashboards: {
        ar: "أزمنة إنجاز طلبات المستفيدين، رصد كفاءة الموظفين",
        en: "Service level compliance, department turnaround logs",
      },
      integrations: {
        ar: "نفاذ الموحد، أنظمة البريد، والمنصات الوطنية",
        en: "Nafath Identity, official government mail APIs",
      },
    },
    {
      industry: { ar: "الرعاية الصحية والطبية", en: "Healthcare" },
      processes: {
        ar: "بلاغات حوادث السلامة، عهد المعدات الطبية",
        en: "Patient incident logs, ward inventory logs",
      },
      automation: {
        ar: "إرسال تنبيهات حرجة للسلامة والتعقيم تلقائياً",
        en: "Auto-escalates safety alerts and sterilizer requests",
      },
      ai: {
        ar: "تحليل وتصنيف خطورة الحادثة وتسهيل التحقيق",
        en: "Categorizes clinical hazards & predicts safety trends",
      },
      approvals: {
        ar: "توجيه للبلاغ إلى رئيس التمريض ثم إدارة الجودة",
        en: "Chief Nurse approval to Hospital Quality Director",
      },
      dashboards: {
        ar: "رصد بلاغات الجودة ومطابقة شروط وزارة الصحة",
        en: "MOH compliance tracking, incident frequency index",
      },
      integrations: {
        ar: "أنظمة إدارة المستشفيات (HIS)، سجلات المرضى",
        en: "Hospital Information Systems (HIS), local EHRs",
      },
    },
    {
      industry: { ar: "التعليم والجامعات", en: "Education" },
      processes: {
        ar: "طلبات شؤون الطلاب، المشتريات الأكاديمية",
        en: "Student petitions, deanery procurement",
      },
      automation: {
        ar: "تحديث السجلات والدرجات فور الموافقة النهائية",
        en: "Automatically updates student database after signoff",
      },
      ai: {
        ar: "مراجعة مبررات التأجيل وتدقيق مطابقة الشروط",
        en: "Validates study deferral claims & matches guidelines",
      },
      approvals: {
        ar: "سير موافقات يبدأ من المرشد الأكاديمي للعميد",
        en: "Advisor recommendation directly to Faculty Dean",
      },
      dashboards: {
        ar: "توزيع وتصنيف طلبات الطلاب، قياس نسب الرضا",
        en: "Student requests backlog, academic process speeds",
      },
      integrations: {
        ar: "أنظمة تسجيل الطلاب (Banner)، الفواتير والرسوم",
        en: "Banner Registration, payment gateway portals",
      },
    },
    {
      industry: { ar: "التصنيع والإنتاج", en: "Manufacturing" },
      processes: {
        ar: "صيانة الآلات الطارئة، مراقبة الجودة لخطوط الإنتاج",
        en: "Urgent machinery repair, floor quality checks",
      },
      automation: {
        ar: "جدولة الصيانة الوقائية بناء على ساعات التشغيل",
        en: "Triggers preventative work-orders on operating hours",
      },
      ai: {
        ar: "توقع الأعطال الميكانيكية وتوصية بقطع الغيار",
        en: "Predicts machine failures & recommends spare inventory",
      },
      approvals: {
        ar: "اعتماد مالي للقطع، تصريح سلامة من مشرف المصنع",
        en: "Spare procurement signoff, supervisor safety greenlight",
      },
      dashboards: {
        ar: "أعطال الآلات النشطة، أزمنة الإصلاح ومؤشرات الصيانة",
        en: "Active downtime meters, Mean Time to Repair (MTTR)",
      },
      integrations: {
        ar: "أنظمة الحساسات الميدانية (SCADA)، برامج المخزون",
        en: "SCADA industrial sensors, legacy inventory tools",
      },
    },
  ];

  // 6. FAQ Accordions Data
  const faqs = [
    {
      q: {
        ar: "ما هي القطاعات التي يدعمها نظام مدارج (Madarij OS)؟",
        en: "What industries does Madarij OS support?",
      },
      a: {
        ar: "يدعم نظام مدارج جميع القطاعات الحيوية مثل المقاولات، الرعاية الصحية، التعليم، التصنيع، التجزئة، الخدمات المالية والمهنية، والقطاع الحكومي. تم تصميم مدارج كـ 'نظام تشغيل مرن' يتكيف بالكامل مع إجراءاتك الفريدة بدلاً من فرض برنامج جاهز غير قابل للتعديل.",
        en: "Madarij OS supports virtually all industries including Construction, Healthcare, Education, Manufacturing, Retail, Financial, Professional Services, and the Government sector. It is engineered as a configurable Business Operating System that adapts to your exact business flows instead of offering static, uncustomizable software.",
      },
    },
    {
      q: {
        ar: "هل يمكننا تخصيص وتعديل مسارات العمل والتحكم بالحقول بالكامل؟",
        en: "Can workflows be customized?",
      },
      a: {
        ar: "نعم، وبكل سهولة. يحتوي النظام على مطور مسارات عمل ذكي ونماذج ديناميكية بالكامل بدون الحاجة لكتابة كود. يمكنك إضافة حقول مخصصة، تصميم تسلسل الموافقات لكل سيناريو بدقة، وإعادة تصميم واجهات المستخدم لتتناسب مع روتين الموظفين.",
        en: "Absolutely. The platform features an intuitive visual drag-and-drop workflow designer and customizable forms. You can add unique data fields, specify precise multi-level approval hierarchies for any scenario, and rearrange screens to suit your employee workflows.",
      },
    },
    {
      q: {
        ar: "هل يتكامل النظام مع البرامج المالية وأنظمة الـ ERP ومستنداتنا الحالية؟",
        en: "Does it integrate with ERP systems?",
      },
      a: {
        ar: "بالتأكيد. يوفر مدارج واجهات ربط برمجية (APIs) متطورة تتكامل بسهولة مع أنظمة الـ ERP العالمية، بجانب التكامل الفوري والمباشر مع المنصات والجهات الحكومية في المملكة والخليج مثل مدد، قوى، ونظام نفاذ وهيئة الزكاة (ZATCA).",
        en: "Yes, fully. Madarij OS offers powerful, secure API structures that link with global ERP systems, on-premise databases, and localized government services such as Qiwa, Mudad, Nafath Identity, and ZATCA (electronic invoicing Phase 2).",
      },
    },
    {
      q: {
        ar: "هل يمكن للأقسام المختلفة داخل شركتنا الحصول على مسارات عمل مستقلة؟",
        en: "Can departments have different workflows?",
      },
      a: {
        ar: "نعم. يدعم نظام مدارج حوكمة الصلاحيات متعددة المستويات، بحيث يمكن لإدارات مثل المشتريات، الموارد البشرية، التشغيل الميداني، والمالية الحصول على مسارات عمل مستقلة تماماً ومحمية بصلاحيات وصول صارمة تمنع تداخل الصلاحيات.",
        en: "Yes. Madarij OS supports comprehensive, departmental multi-tenancy. Procurement, HR, Field Operations, and Finance can run completely distinct workflows with isolated forms and secure permissions to protect sensitive logs.",
      },
    },
    {
      q: {
        ar: "هل تتطلب عملية التهيئة وبناء الإجراءات معرفة برمجية أو كتابة كود؟",
        en: "Is coding required?",
      },
      a: {
        ar: "لا يتطلب مدارج أي معرفة برمجية مسبقة. تم تصميم واجهة البناء كلياً بأسلوب مرئي ذكي (No-Code)، بحيث يمكن لمدراء الأقسام أو منسقي الإجراءات وبمساعدة مساعد مدارج للذكاء الاصطناعي بناء مسارات العمل بسهولة تامة.",
        en: "No coding skills are required. The entire workflow customization suite is built visually (No-Code). Department heads, quality managers, or operation leads can effortlessly layout business steps, often guided directly by our built-in AI assistant.",
      },
    },
    {
      q: {
        ar: "هل نظام مدارج مناسب للشركات الكبرى والمؤسسات الحكومية العملاقة؟",
        en: "Is Madarij suitable for enterprise organizations?",
      },
      a: {
        ar: "نعم. تم تصميم بنية النظام على خوادم سحابية فائقة الأمان والجاهزية، مع دعم الامتثال للوائح حماية البيانات والمواصفات الأمنية للامتثال الخليجي والأمن السيبراني، ليتلاءم بالكامل مع متطلبات ملايين الحركات والمستخدمين بكفاءة عالية.",
        en: "Yes, definitely. The infrastructure is deployed on enterprise-grade cloud servers with deep focus on scalability, regional data residency compliance, security, and low-latency performance to process millions of transactions smoothly.",
      },
    },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div
      className="min-h-screen bg-zinc-50 font-sans antialiased text-zinc-900 selection:bg-primary/30"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* 1. Navbar */}
      <Navbar />

      {/* Floating Language Switcher for instant localized experience */}
      <div className="fixed bottom-6 right-6 z-[99] bg-white border border-zinc-200 rounded-full shadow-2xl p-1.5 flex items-center gap-1.5 backdrop-blur-md">
        <button
          onClick={() => {
            setLang("ar");
            i18n.changeLanguage("ar");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
            isAr ? "bg-primary text-white shadow-md" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          العربية
        </button>
        <button
          onClick={() => {
            setLang("en");
            i18n.changeLanguage("en");
          }}
          className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${
            !isAr ? "bg-primary text-white shadow-md" : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          English
        </button>
      </div>

      <main className="pt-32 pb-24 overflow-hidden">
        {/* 2. Hero Section */}
        <section className="container mx-auto px-6 max-w-7xl mb-24 relative">
          <div className="absolute top-[-100px] left-1/4 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 text-start space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                  {isAr
                    ? "نظام تشغيل مرن وذكي للأعمال"
                    : "A Flexible, Intelligent Operating System for Business"}
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-zinc-900 tracking-tight leading-[1.15]"
              >
                {isAr ? (
                  <>
                    نظام <span className="text-primary text-emerald-500">مدارج OS</span> <br /> لكل
                    قطاعات الأعمال
                  </>
                ) : (
                  <>
                    Madarij OS <br /> for{" "}
                    <span className="text-primary text-emerald-500">Every Industry</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg sm:text-xl text-zinc-500 font-medium leading-relaxed max-w-2xl"
              >
                {isAr
                  ? "كل مؤسسة لديها روتينها الخاص المتميز. يتكيف مدارج OS تماماً مع عملياتك من خلال مسارات عمل مخصصة، ونماذج ذكية، وأتمتة شاملة، وموافقات، وتقارير ذكاء اصطناعي - دون تكبد تكاليف التطوير البرمجي المخصص."
                  : "Every organization has unique operations. Madarij OS adapts to your processes with customizable workflows, forms, automation, approvals, AI, and dashboards—without custom development."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-4"
              >
                <Link
                  to="/demo"
                  className="px-8 py-4 bg-primary text-white text-base font-black rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/25 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>{isAr ? "احجز ديمو تجريبي" : "Book a Demo"}</span>
                  {isAr ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                </Link>
                <a
                  href="#sectors-grid"
                  className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 text-base font-black rounded-2xl hover:bg-zinc-100 hover:text-zinc-900 transition-all flex items-center gap-2"
                >
                  <span>{isAr ? "استكشف القطاعات" : "Explore Industries"}</span>
                </a>
              </motion.div>
            </div>

            {/* Right Abstract Mockup Column */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="bg-white rounded-[2.5rem] p-6 border border-zinc-200 shadow-2xl relative overflow-hidden"
              >
                {/* Background soft grids */}
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                {/* Simulated Custom Workflow Node Card */}
                <div className="relative space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-zinc-900">
                          {isAr ? "مصمم العمليات التفاعلي" : "Interactive Workflow Sandbox"}
                        </h3>
                        <p className="text-zinc-400 text-xs font-bold">{selectedInd.name[lang]}</p>
                      </div>
                    </div>
                    <div className="px-2.5 py-1 bg-zinc-100 rounded-full text-[10px] font-black text-zinc-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      <span>{isAr ? "تعديل مباشر" : "Live Setup"}</span>
                    </div>
                  </div>

                  {/* Simulated Form Input Area */}
                  <form onSubmit={handleStartSim} className="space-y-4 text-start">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                      {isAr ? "١. تعبئة نموذج العملية الرقمية" : "1. Setup Process Data Fields"}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedInd.simFields.map((f, i) => (
                        <div key={i} className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600">{f.label[lang]}</label>
                          {f.type === "select" ? (
                            <select className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:border-primary">
                              {f.options?.map((o, idx) => (
                                <option key={idx} value={o[lang]}>
                                  {o[lang]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              disabled={simActive}
                              required
                              placeholder={f.placeholder?.[lang]}
                              className="w-full text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:border-primary disabled:opacity-70"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={simActive}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2"
                    >
                      {simActive ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-primary" />
                          <span>
                            {isAr ? "جاري تشغيل الأتمتة..." : "Running Process Stream..."}
                          </span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-primary" />
                          <span>
                            {isAr ? "محاكاة مسار الاعتماد والربط" : "Simulate Approval & API Route"}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Animated Pipeline Simulation */}
                  <div className="pt-4 border-t border-zinc-100 space-y-4 text-start">
                    <p className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                      {isAr ? "٢. تتبع التدفق والربط المباشر" : "2. Live Approval Dispatch Flow"}
                    </p>

                    <div className="relative">
                      {/* Line connector */}
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />

                      {/* Active green progress line */}
                      <div
                        className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{
                          width: `${(simStep / (selectedInd.simSteps[lang].length - 1)) * 90}%`,
                        }}
                      />

                      <div className="relative z-10 flex justify-between items-center">
                        {selectedInd.simSteps[lang].map((step, idx) => {
                          const isActive = idx <= simStep;
                          const isCurrent = idx === simStep;
                          return (
                            <div key={idx} className="flex flex-col items-center space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border ${
                                  isCurrent
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110"
                                    : isActive
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-500"
                                      : "bg-white border-zinc-200 text-zinc-400"
                                }`}
                              >
                                {isActive && idx < simStep ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step Name Box */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase">
                          {isAr ? "الحالة الحالية للعملية" : "Active Flow State"}
                        </p>
                        <p className="text-xs font-black text-zinc-800 mt-1">
                          {selectedInd.simSteps[lang][simStep]}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {simStep === selectedInd.simSteps[lang].length - 1 ? (
                          <div className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-700 text-[10px] font-black flex items-center gap-1 animate-bounce">
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span>{isAr ? "مكتمل ومعتمد" : "Fully Approved"}</span>
                          </div>
                        ) : simActive ? (
                          <div className="px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-[10px] font-black flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>{isAr ? "بانتظار الإجراء" : "Pending Signoff"}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400">
                            {isAr ? "اضغط للمحاكاة" : "Click simulated above"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Industries Grid */}
        <section id="sectors-grid" className="py-20 bg-white border-y border-zinc-200/50 relative">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight leading-tight mb-4">
                {isAr
                  ? "مرونة متناهية تخدم جميع القطاعات"
                  : "Adaptability for Every Single Industry"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "لا نقدم برمجيات مخصصة لكل قطاع قد تقيدك في المستقبل. مدارج OS هو نظام تشغيل للأعمال يتكيف وينمو ليوائم مسارات عملك الفريدة تلقائياً."
                  : "We don't offer generic software templates that lock you down. Madarij OS is a foundational Business OS that adapts and grows with your operational needs."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {industries.map((ind, idx) => {
                const IconComp = ind.icon;
                const isSelected = selectedInd.id === ind.id;
                return (
                  <motion.div
                    key={ind.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    className={`group bg-zinc-50 rounded-[2rem] p-8 border hover:bg-white transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-zinc-200/50 ${
                      isSelected
                        ? "border-primary/40 ring-1 ring-primary/25 bg-white"
                        : "border-zinc-200/80"
                    }`}
                  >
                    <div className="space-y-6">
                      <div className="flex justify-between items-start">
                        <div
                          className={`w-14 h-14 rounded-2xl ${ind.bgLight} ${ind.color} flex items-center justify-center border ${ind.borderColor} shadow-inner`}
                        >
                          <IconComp className="w-7 h-7" />
                        </div>
                        <button
                          onClick={() => handleSelectIndustry(ind)}
                          className="px-3.5 py-1.5 bg-zinc-200/60 hover:bg-primary hover:text-white rounded-full text-[11px] font-black text-zinc-600 transition-all cursor-pointer"
                        >
                          {isAr ? "محاكاة الإجراء" : "Simulate Flow"}
                        </button>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-zinc-900 group-hover:text-primary transition-colors">
                          {ind.name[lang]}
                        </h3>
                        <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                          {ind.desc[lang]}
                        </p>
                      </div>

                      {/* Workflows checklist */}
                      <div className="space-y-2.5 pt-4 border-t border-zinc-200/60">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {isAr ? "مسارات عمل مدمجة نموذجية" : "Adaptable Standard Workflows"}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {ind.workflows[lang].map((wf, wIdx) => (
                            <div key={wIdx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span className="text-xs font-bold text-zinc-600">{wf}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 mt-6 border-t border-zinc-200/40">
                      <button
                        onClick={() => {
                          handleSelectIndustry(ind);
                          setShowSimModal(true);
                        }}
                        className="w-full py-3 bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>
                          {isAr ? "معرفة المزيد عن التشغيل" : "Explore Operational Details"}
                        </span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Why Madarij OS Section */}
        <section className="py-24 bg-zinc-50 border-b border-zinc-200/50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">
                {isAr
                  ? "مدارج مصمم حول أعمالك، لا العكس"
                  : "Built Around Your Business, Not the Other Way Around"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "كل أداة أو ميزة في مدارج تم هندستها لتمنحك السيطرة الكاملة على مسار نموك وأتمتة روتينك اليومي بكل بساطة وسلاسة."
                  : "Every tool in Madarij is engineered to put you in complete control of your growth, automating your daily processes seamlessly."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-white rounded-[2rem] p-8 border border-zinc-200/80 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="space-y-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center border ${feat.bg}`}
                      >
                        <Icon className={`w-5 h-5 ${feat.color}`} />
                      </div>
                      <h3 className="text-lg font-black text-zinc-900">{feat.title[lang]}</h3>
                      <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                        {feat.desc[lang]}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. How It Works Timeline */}
        <section className="py-24 bg-white border-b border-zinc-200/50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">
                {isAr
                  ? "رحلة التحول والتهيئة في 4 خطوات"
                  : "Your 4-Step Operational Transformation"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "من تجميع الإجراءات اليدوية إلى منصة رقمية متكاملة ذاتية التشغيل في قياسي."
                  : "From messy manual operations to a centralized, self-operating dashboard in record time."}
              </p>
            </div>

            {/* Timeline steps */}
            <div className="relative">
              {/* Center connecting line desktop only */}
              <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {timelineSteps.map((step, idx) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-zinc-50 hover:bg-white border border-zinc-200/80 hover:border-primary/30 rounded-[2.2rem] p-8 text-start space-y-4 transition-all duration-300 hover:shadow-xl group"
                  >
                    <div className="w-12 h-12 rounded-full bg-zinc-900 text-white flex items-center justify-center font-black text-sm group-hover:bg-primary transition-colors">
                      {idx + 1}
                    </div>
                    <h3 className="text-lg font-black text-zinc-900 group-hover:text-primary transition-colors">
                      {step.title[lang]}
                    </h3>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                      {step.desc[lang]}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6. Success Metrics Section */}
        <section className="py-24 bg-gradient-to-b from-zinc-50 to-zinc-100 border-b border-zinc-200/50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">
                {isAr ? "نتائج تشغيلية ملموسة لشركتك" : "Proven Operational Impact"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "الأرقام تتحدث عن نفسها. نساعدك في تمكين فريقك وتسريع وتيرة أعمالك بثقة تامة."
                  : "Real metrics backed by actual digital transitions. Empowering organization leaders with certainty."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {metrics.map((m, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-start"
                >
                  <div className="space-y-4">
                    <p className="text-4xl sm:text-5xl font-black text-primary text-emerald-500 tracking-tight">
                      {m.value}
                    </p>
                    <h4 className="text-base font-black text-zinc-800">{m.label[lang]}</h4>
                    <p className="text-zinc-500 text-xs font-medium leading-relaxed">
                      {m.desc[lang]}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. Industries Comparison Section */}
        <section className="py-24 bg-white border-b border-zinc-200/50">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">
                {isAr
                  ? "مقارنة التكيف الإجرائي بين القطاعات"
                  : "Adaptability Matrix Across Sectors"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "انظر كيف يوائم نظام مدارج مكوناته لتلبية طبيعة وحاجة العمليات لكل تخصص."
                  : "See how Madarij OS shifts its architectural components to power different sector demands."}
              </p>
            </div>

            <div className="overflow-x-auto border border-zinc-200 rounded-[2rem] shadow-sm bg-white">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-500 text-xs font-black uppercase border-b border-zinc-200">
                    <th className="p-5">{isAr ? "القطاع" : "Industry"}</th>
                    <th className="p-5">{isAr ? "العمليات المعتادة" : "Typical Processes"}</th>
                    <th className="p-5">{isAr ? "الأتمتة التلقائية" : "Automation"}</th>
                    <th className="p-5">{isAr ? "دور الذكاء الاصطناعي" : "AI Role"}</th>
                    <th className="p-5">{isAr ? "سير الموافقات" : "Approvals"}</th>
                    <th className="p-5">{isAr ? "لوحات التحكم" : "Dashboards"}</th>
                    <th className="p-5">{isAr ? "التكامل والربط" : "Integrations"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 text-xs font-bold text-zinc-600">
                  {comparisons.map((c, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-5 font-black text-zinc-900 text-sm whitespace-nowrap">
                        {c.industry[lang]}
                      </td>
                      <td className="p-5">{c.processes[lang]}</td>
                      <td className="p-5 text-emerald-600">{c.automation[lang]}</td>
                      <td className="p-5 text-indigo-600 font-medium">{c.ai[lang]}</td>
                      <td className="p-5">{c.approvals[lang]}</td>
                      <td className="p-5 whitespace-nowrap">{c.dashboards[lang]}</td>
                      <td className="p-5 text-zinc-500">{c.integrations[lang]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 8. FAQ Section */}
        <section className="py-24 bg-zinc-50 border-b border-zinc-200/50">
          <div className="container mx-auto px-6 max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tight mb-4">
                {isAr ? "الأسئلة الشائعة والاستفسارات" : "Frequently Asked Questions"}
              </h2>
              <p className="text-lg text-zinc-500 font-medium">
                {isAr
                  ? "كل ما تود معرفته عن مرونة نظام تشغيل الأعمال مدارج وتوافقه مع شركتك."
                  : "Answers to key queries about Madarij OS capability and implementation."}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-zinc-200 rounded-2xl overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-6 text-start flex justify-between items-center gap-4 cursor-pointer outline-none"
                    >
                      <span className="font-black text-zinc-800 text-sm sm:text-base leading-snug">
                        {faq.q[lang]}
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="px-6 pb-6 pt-1 text-zinc-500 text-xs sm:text-sm leading-relaxed font-medium border-t border-zinc-50">
                            {faq.a[lang]}
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

        {/* 9. CTA Banner */}
        <section className="container mx-auto px-6 max-w-7xl mt-16">
          <div className="bg-zinc-950 text-white rounded-[3rem] p-12 md:p-16 relative overflow-hidden text-center border border-white/5 shadow-2xl">
            {/* Ambient gradients */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {isAr ? "جاهز لإحداث نقلة تشغيلية لأعمالك؟" : "Ready to Transform Your Operations?"}
              </h2>
              <p className="text-zinc-400 text-base sm:text-lg font-medium leading-relaxed">
                {isAr
                  ? "سواء كنت جهة حكومية، مستشفى، جامعة، شركة مقاولات كبرى، أو مؤسسة تجارية، فإن مدارج OS يتكيف ليلائم روتين عملك، لا العكس."
                  : "Whether you're a government entity, healthcare provider, university, construction company, or enterprise, Madarij OS adapts to your business—not the other way around."}
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Link
                  to="/demo"
                  className="px-8 py-4 bg-primary text-white text-base font-black rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95"
                >
                  {isAr ? "احجز عرضاً تجريبياً" : "Book a Demo"}
                </Link>
                <Link
                  to="/contact"
                  className="px-8 py-4 bg-zinc-900 border border-white/10 text-zinc-300 text-base font-black rounded-2xl hover:bg-white/5 hover:text-white transition-all"
                >
                  {isAr ? "تواصل مع المبيعات" : "Contact Sales"}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 10. Industry Detail & Live Workflow Sandbox Overlay Modal */}
      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowSimModal(false);
                setSimActive(false);
              }}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3 }}
              className="relative w-full max-w-3xl bg-white rounded-[2.5rem] border border-zinc-200 shadow-2xl p-8 z-10 max-h-[90vh] overflow-y-auto text-start"
            >
              <button
                onClick={() => {
                  setShowSimModal(false);
                  setSimActive(false);
                }}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 transition-colors cursor-pointer text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-8">
                {/* Header info */}
                <div className="flex gap-4 items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl ${selectedInd.bgLight} ${selectedInd.color} flex items-center justify-center border ${selectedInd.borderColor}`}
                  >
                    {React.createElement(selectedInd.icon, { className: "w-7 h-7" })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-zinc-900">{selectedInd.name[lang]}</h3>
                    <p className="text-zinc-500 text-xs font-bold mt-1">
                      {isAr
                        ? "حوكمة ذكية وتهيئة روتينية كاملة"
                        : "Intelligent Governance & Routine Auto-flows"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                    {isAr ? "نظرة عامة وشرح الإجراء" : "Overview & Dynamic Scope"}
                  </h4>
                  <p className="text-zinc-600 text-sm sm:text-base leading-relaxed font-medium">
                    {selectedInd.desc[lang]}
                  </p>
                </div>

                {/* Simulated Custom Sandbox */}
                <div className="border border-zinc-100 rounded-3xl p-6 bg-zinc-50 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-zinc-200/60">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <span className="text-xs font-black text-zinc-800">
                        {selectedInd.simTitle[lang]}
                      </span>
                    </div>
                    <div className="px-2 py-0.5 bg-emerald-100 rounded-full text-[9px] font-black text-emerald-700">
                      {isAr ? "محاكاة فورية" : "Interactive Mock"}
                    </div>
                  </div>

                  <form onSubmit={handleStartSim} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {selectedInd.simFields.map((f, i) => (
                        <div key={i} className="space-y-1.5 text-start">
                          <label className="text-xs font-bold text-zinc-600">{f.label[lang]}</label>
                          {f.type === "select" ? (
                            <select className="w-full text-xs font-black bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:border-primary">
                              {f.options?.map((o, idx) => (
                                <option key={idx} value={o[lang]}>
                                  {o[lang]}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={f.type}
                              disabled={simActive}
                              required
                              placeholder={f.placeholder?.[lang]}
                              className="w-full text-xs font-black bg-white border border-zinc-200 rounded-xl p-3 outline-none focus:border-primary disabled:opacity-70"
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={simActive}
                      className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {simActive ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin text-primary" />
                          <span>{isAr ? "جاري الأتمتة..." : "Running Custom Rules..."}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 text-primary" />
                          <span>
                            {isAr ? "بدء محاكاة سير المعاملة" : "Trigger Mock Process Flow"}
                          </span>
                        </>
                      )}
                    </button>
                  </form>

                  {/* Flow pipeline */}
                  <div className="space-y-4 pt-2">
                    <div className="relative">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-zinc-200 -translate-y-1/2" />
                      <div
                        className="absolute top-1/2 left-4 h-0.5 bg-emerald-500 -translate-y-1/2 transition-all duration-500"
                        style={{
                          width: `${(simStep / (selectedInd.simSteps[lang].length - 1)) * 90}%`,
                        }}
                      />
                      <div className="relative z-10 flex justify-between">
                        {selectedInd.simSteps[lang].map((step, idx) => {
                          const isActive = idx <= simStep;
                          const isCurrent = idx === simStep;
                          return (
                            <div key={idx} className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                                  isCurrent
                                    ? "bg-primary border-primary text-white scale-110 shadow-lg"
                                    : isActive
                                      ? "bg-emerald-50 border-emerald-500 text-emerald-500"
                                      : "bg-white border-zinc-200 text-zinc-400"
                                }`}
                              >
                                {isActive && idx < simStep ? (
                                  <Check className="w-3.5 h-3.5" />
                                ) : (
                                  <span className="text-xs font-bold">{idx + 1}</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase">
                          {isAr ? "الخطوة النشطة حالياً" : "Current Active Step"}
                        </p>
                        <p className="text-xs font-black text-zinc-800 mt-1">
                          {selectedInd.simSteps[lang][simStep]}
                        </p>
                      </div>
                      <div>
                        {simStep === selectedInd.simSteps[lang].length - 1 ? (
                          <span className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-700 text-[10px] font-black">
                            {isAr ? "مكتمل ومعتمد" : "Fully Executed"}
                          </span>
                        ) : simActive ? (
                          <span className="px-3 py-1 bg-amber-100 rounded-full text-amber-700 text-[10px] font-black">
                            {isAr ? "تحقق وموافقة" : "Approving..."}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-zinc-400">
                            {isAr ? "بانتظار البدء" : "Ready"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-4 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      setShowSimModal(false);
                      setSimActive(false);
                    }}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </button>
                  <Link
                    to="/demo"
                    className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black hover:bg-primary/90 transition-all shadow-md shadow-primary/25"
                  >
                    {isAr ? "طلب عرض تجريبي كامل" : "Request Full Platform Demo"}
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer
        className="bg-zinc-950 py-12 border-t border-white/5 text-center text-white mt-auto"
        dir="rtl"
      >
        <p className="text-zinc-600 text-sm font-medium">
          © 2026 Mudarij OS. صُنع بفخر للشركات والمؤسسات الخليجية.
        </p>
      </footer>
    </div>
  );
}
