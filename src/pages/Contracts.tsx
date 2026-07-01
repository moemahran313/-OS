import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import NafathAuth from "@/src/components/NafathAuth";
import { QRCodeSVG } from "qrcode.react";
import { useSettings } from "@/src/contexts/SettingsContext";
import { useUser } from "@/src/contexts/UserContext";
import { db } from "@/src/lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import {
  FileSignature,
  Download,
  Info,
  CheckCircle2,
  ChevronRight,
  Calculator,
  ShieldCheck,
  Scale,
  Globe2,
  Building,
  User,
  Settings2,
  Image as ImageIcon,
  Printer,
  PenTool,
  RotateCw,
  PlusCircle,
  Search,
  Folder,
  FileText,
  Lock,
  Upload,
  FileCheck,
  Users,
  Save,
  Plus,
  Clock,
  Cloud,
  Mail,
} from "lucide-react";

interface ContractData {
  contractCategory?: string;
  employerName: string;
  employerNameEn: string;
  employerCR: string;
  employerAddress: string;
  employerAddressEn: string;
  employerRep: string;
  employerRepEn: string;
  employeeName: string;
  employeeNameEn: string;
  employeeId: string;
  employeeNationality: string;
  employeeNationalityEn: string;
  employeeAddress: string;
  employeeAddressEn: string;
  employeeEmail: string;
  employeeMobile: string;
  jobTitle: string;
  jobTitleEn: string;
  contractType: "fixed" | "indefinite";
  startDate: string;
  durationMonths: string;
  probationDays: string;
  basicSalary: string;
  housingAllowance: string;
  transportAllowance: string;
  otherAllowances: string;
  workingHours: string;
  workingDays: string;
  annualLeaveDays: string;
  disputeResolution: "SA_COURTS" | "SCCA" | "DIFC";
  themeColor: string;
}

const DEFAULT_DATA: ContractData = {
  contractCategory: "employment",
  employerName: "",
  employerNameEn: "",
  employerCR: "",
  employerAddress: "",
  employerAddressEn: "",
  employerRep: "",
  employerRepEn: "",
  employeeName: "",
  employeeNameEn: "",
  employeeId: "",
  employeeNationality: "",
  employeeNationalityEn: "",
  employeeAddress: "",
  employeeAddressEn: "",
  employeeEmail: "",
  employeeMobile: "",
  jobTitle: "",
  jobTitleEn: "",
  contractType: "fixed",
  startDate: new Date().toISOString().split("T")[0],
  durationMonths: "12",
  probationDays: "90",
  basicSalary: "",
  housingAllowance: "",
  transportAllowance: "",
  otherAllowances: "",
  workingHours: "8",
  workingDays: "5",
  annualLeaveDays: "21",
  disputeResolution: "SA_COURTS",
  themeColor: "#0f172a", // Midnight Navy
};

interface CategoryConfig {
  id: string;
  labelAr: string;
  labelEn: string;
  party1Ar: string;
  party1En: string;
  party2Ar: string;
  party2En: string;
  titleAr: string;
  titleEn: string;
}

const CATEGORY_CONFIGS: Record<string, CategoryConfig> = {
  employment: {
    id: "employment",
    labelAr: "عقد عمل",
    labelEn: "Employment Contract",
    party1Ar: "المنشأة (الطرف الأول):",
    party1En: "Employer (First Party):",
    party2Ar: "الموظف (الطرف الثاني):",
    party2En: "Employee (Second Party):",
    titleAr: "عقد عمل موحد (نموذج مزدوج)",
    titleEn: "Unified Employment Contract",
  },
  sales: {
    id: "sales",
    labelAr: "عقد بيع",
    labelEn: "Sales Contract",
    party1Ar: "البائع (الطرف الأول):",
    party1En: "Seller (First Party):",
    party2Ar: "المشتري (الطرف الثاني):",
    party2En: "Buyer (Second Party):",
    titleAr: "عقد بيع وتفرغ رسمي",
    titleEn: "Sales & Conveyance Agreement",
  },
  purchase: {
    id: "purchase",
    labelAr: "عقد شراء",
    labelEn: "Purchase Contract",
    party1Ar: "المشتري (الطرف الأول):",
    party1En: "Buyer (First Party):",
    party2Ar: "البائع (الطرف الثاني):",
    party2En: "Seller (Second Party):",
    titleAr: "عقد شراء وتملك أصول",
    titleEn: "Purchase & Acquisition Agreement",
  },
  supply: {
    id: "supply",
    labelAr: "عقد توريد",
    labelEn: "Supply Contract",
    party1Ar: "المورد (الطرف الأول):",
    party1En: "Supplier (First Party):",
    party2Ar: "العميل (الطرف الثاني):",
    party2En: "Customer (Second Party):",
    titleAr: "اتفاقية توريد خدمات ومواد",
    titleEn: "Services & Materials Supply Agreement",
  },
  distribution: {
    id: "distribution",
    labelAr: "عقد توزيع",
    labelEn: "Distribution Contract",
    party1Ar: "المنتج/المانح (الطرف الأول):",
    party1En: "Producer/Grantor (First Party):",
    party2Ar: "الموزع (الطرف الثاني):",
    party2En: "Distributor (Second Party):",
    titleAr: "عقد توزيع منتجات حصري",
    titleEn: "Exclusive Product Distribution Agreement",
  },
  agency: {
    id: "agency",
    labelAr: "عقد وكالة تجارية",
    labelEn: "Commercial Agency Contract",
    party1Ar: "الموكل (الطرف الأول):",
    party1En: "Principal (First Party):",
    party2Ar: "الوكيل (الطرف الثاني):",
    party2En: "Agent (Second Party):",
    titleAr: "عقد وكالة تجارية معتمد",
    titleEn: "Commercial Agency Agreement",
  },
  franchise: {
    id: "franchise",
    labelAr: "عقد امتياز تجاري",
    labelEn: "Franchise Contract",
    party1Ar: "مانح الامتياز (الطرف الأول):",
    party1En: "Franchisor (First Party):",
    party2Ar: "ممنوح الامتياز (الطرف الثاني):",
    party2En: "Franchisee (Second Party):",
    titleAr: "عقد امتياز تجاري موحد",
    titleEn: "Franchise Agreement",
  },
  partnership: {
    id: "partnership",
    labelAr: "عقد شراكة",
    labelEn: "Partnership Contract",
    party1Ar: "الشريك الأول (الطرف الأول):",
    party1En: "First Partner (First Party):",
    party2Ar: "الشريك الثاني (الطرف الثاني):",
    party2En: "Second Partner (Second Party):",
    titleAr: "عقد شراكة واستثمار تجاري",
    titleEn: "Business Partnership Agreement",
  },
  shareholders: {
    id: "shareholders",
    labelAr: "عقد مساهمين",
    labelEn: "Shareholders' Contract",
    party1Ar: "المساهم الأول (الطرف الأول):",
    party1En: "First Shareholder (First Party):",
    party2Ar: "المساهم الثاني (الطرف الثاني):",
    party2En: "Second Shareholder (Second Party):",
    titleAr: "اتفاقية مساهمين وتأسيس شركة",
    titleEn: "Shareholders' Agreement",
  },
  investment: {
    id: "investment",
    labelAr: "عقد استثمار",
    labelEn: "Investment Contract",
    party1Ar: "الشركة المستفيدة (الطرف الأول):",
    party1En: "Target Company (First Party):",
    party2Ar: "المستثمر (الطرف الثاني):",
    party2En: "Investor (Second Party):",
    titleAr: "عقد استثمار وتمويل جريء",
    titleEn: "Investment & Venture Financing Agreement",
  },
  jv: {
    id: "jv",
    labelAr: "مشروع مشترك",
    labelEn: "Joint Venture",
    party1Ar: "الشريك المشترك 1 (الطرف الأول):",
    party1En: "JV Partner 1 (First Party):",
    party2Ar: "الشريك المشترك 2 (الطرف الثاني):",
    party2En: "JV Partner 2 (Second Party):",
    titleAr: "اتفاقية مشروع مشترك وتضامن",
    titleEn: "Joint Venture Agreement",
  },
  marketing: {
    id: "marketing",
    labelAr: "عقد تسويق",
    labelEn: "Marketing Contract",
    party1Ar: "العميل (الطرف الأول):",
    party1En: "Client (First Party):",
    party2Ar: "شركة التسويق (الطرف الثاني):",
    party2En: "Marketer (Second Party):",
    titleAr: "عقد تقديم خدمات تسويقية احترافية",
    titleEn: "Marketing Services Agreement",
  },
  brokerage: {
    id: "brokerage",
    labelAr: "عقد وساطة",
    labelEn: "Brokerage Contract",
    party1Ar: "صاحب العمل/السلعة (الطرف الأول):",
    party1En: "Principal/Owner (First Party):",
    party2Ar: "الوسيط (الطرف الثاني):",
    party2En: "Broker (Second Party):",
    titleAr: "عقد وساطة وسعي معتمد",
    titleEn: "Brokerage & Commission Agreement",
  },
  consulting: {
    id: "consulting",
    labelAr: "عقد استشارات",
    labelEn: "Consulting Contract",
    party1Ar: "العميل (الطرف الأول):",
    party1En: "Client (First Party):",
    party2Ar: "المستشار (الطرف الثاني):",
    party2En: "Consultant (Second Party):",
    titleAr: "اتفاقية تقديم خدمات استشارية",
    titleEn: "Consulting Services Agreement",
  },
};

const getGeneratedTexts = (d: ContractData) => {
  const cat = d.contractCategory || "employment";
  const cfg = CATEGORY_CONFIGS[cat] || CATEGORY_CONFIGS.employment;

  const dispText =
    d.disputeResolution === "SCCA"
      ? {
          ar: "يتم تسوية أي نزاع ينشأ عن هذا العقد أو ما يرتبط به عن طريق التحكيم وفقًا لقواعد المركز السعودي للتحكيم التجاري (SCCA).",
          en: "Any dispute arising out of or related to this contract shall be settled by arbitration in accordance with the rules of the Saudi Center for Commercial Arbitration (SCCA).",
        }
      : d.disputeResolution === "DIFC"
        ? {
            ar: "يخضع هذا العقد حصريًا لاختصاص محاكم مركز دبي المالي العالمي (DIFC).",
            en: "This contract is subject exclusively to the jurisdiction of the DIFC Courts.",
          }
        : {
            ar: "تختص محاكم المملكة العربية السعودية بالنظر في أي نزاع ينشأ عن هذا العقد طبقاً للقوانين المرعية.",
            en: "Courts of the Kingdom of Saudi Arabia shall have jurisdiction over any dispute arising from this contract according to laws.",
          };

  const getArVal = (v: string) => (v && v.trim() !== "" ? v : "........................");
  const getEnVal = (v: string) => (v && v.trim() !== "" ? v : "........................");

  let titleAr = cfg.titleAr;
  let titleEn = cfg.titleEn;
  let party1TitleAr = cfg.party1Ar;
  let party1TitleEn = cfg.party1En;
  let party2TitleAr = cfg.party2Ar;
  let party2TitleEn = cfg.party2En;

  let party1TextAr = `الاسم: ${getArVal(d.employerName)}\nسجل تجاري: ${getArVal(d.employerCR)}\nالعنوان: ${getArVal(d.employerAddress)}\nيمثلها: ${getArVal(d.employerRep)}`;
  let party1TextEn = `Name: ${getEnVal(d.employerNameEn)}\nCR No: ${getEnVal(d.employerCR)}\nAddress: ${getEnVal(d.employerAddressEn)}\nRepresented By: ${getEnVal(d.employerRepEn)}`;

  let party2TextAr = `الاسم: ${getArVal(d.employeeName)}\nالجنسية: ${getArVal(d.employeeNationality)} - هوية رقم: ${getArVal(d.employeeId)}\nالعنوان: ${getArVal(d.employeeAddress)}\nالجوال: ${getArVal(d.employeeMobile)} - إيميل: ${getArVal(d.employeeEmail)}`;
  let party2TextEn = `Name: ${getEnVal(d.employeeNameEn)}\nNationality: ${getEnVal(d.employeeNationalityEn)} - ID: ${getEnVal(d.employeeId)}\nAddress: ${getEnVal(d.employeeAddressEn)}\nMobile: ${getEnVal(d.employeeMobile)} - Email: ${getEnVal(d.employeeEmail)}`;

  let clause1TitleAr = "البند الأول: موضوع العقد";
  let clause1TitleEn = "Clause 1: Subject Matter";
  let clause1TextAr = "";
  let clause1TextEn = "";

  let clause2TitleAr = "البند الثاني: المدة والسريان";
  let clause2TitleEn = "Clause 2: Term & Efficacy";
  let clause2TextAr = "";
  let clause2TextEn = "";

  let clause3TitleAr = "البند الثالث: الاحكام المالية والتعويضات";
  let clause3TitleEn = "Clause 3: Financial Terms & Compensation";
  let clause3TextAr = "";
  let clause3TextEn = "";

  if (cat === "employment") {
    clause1TitleAr = "البند الأول: الوظيفة والمهام";
    clause1TitleEn = "Clause 1: Position & Duties";
    clause1TextAr = `سيعمل الطرف الثاني بمهنة (${getArVal(d.jobTitle)}) استجابة لتوجيهات الطرف الأول وعمله.`;
    clause1TextEn = `The Second Party shall serve as (${getEnVal(d.jobTitleEn)}) under the direction of the First Party.`;

    clause2TitleAr = "البند الثاني: المدة والتجربة";
    clause2TitleEn = "Clause 2: Duration & Probation";
    clause2TextAr =
      d.contractType === "fixed"
        ? `مدة العقد (${getArVal(d.durationMonths)}) شهراً تبدأ من ${getArVal(d.startDate)} وفترة التجربة (${getArVal(d.probationDays)}) يوماً.`
        : `هذا العقد غير محدد المدة يبدأ من ${getArVal(d.startDate)} وفترة التجربة (${getArVal(d.probationDays)}) يوماً.`;
    clause2TextEn =
      d.contractType === "fixed"
        ? `Contract duration is (${getEnVal(d.durationMonths)}) months starting ${getEnVal(d.startDate)}. Probation period is (${getEnVal(d.probationDays)}) days.`
        : `This is an indefinite contract starting ${getEnVal(d.startDate)}. Probation period is (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: الراتب والبدلات";
    clause3TitleEn = "Clause 3: Salary & Allowances";
    clause3TextAr = `الراتب الأساسي: ${getArVal(d.basicSalary)} ر.س\nبدل السكن: ${getArVal(d.housingAllowance)} ر.س\nبدل النقل: ${getArVal(d.transportAllowance)} ر.س\nبدلات أخرى: ${getArVal(d.otherAllowances)} ر.س`;
    clause3TextEn = `Basic Salary: SAR ${getEnVal(d.basicSalary)}\nHousing Allowance: SAR ${getEnVal(d.housingAllowance)}\nTransport Allowance: SAR ${getEnVal(d.transportAllowance)}\nOther Allowances: SAR ${getEnVal(d.otherAllowances)}`;
  } else if (cat === "sales") {
    clause1TitleAr = "البند الأول: مبيع العقد ووصفه";
    clause1TitleEn = "Clause 1: Subject of Sale & Description";
    clause1TextAr = `يلتزم الطرف الأول ببيع ونقل ملكية المبيع الموصوف بـ (${getArVal(d.jobTitle)}) إلى الطرف الثاني خالية من أي رهون أو حقوق للغير.`;
    clause1TextEn = `The First Party commits to sell and transfer ownership of the subject matter described as (${getEnVal(d.jobTitleEn)}) to the Second Party free of any liens or third-party rights.`;

    clause2TitleAr = "البند الثاني: سريان العقد والتسليم";
    clause2TitleEn = "Clause 2: Effective Date & Delivery";
    clause2TextAr = `يسري هذا العقد فور توقيعه بتاريخ ${getArVal(d.startDate)}، ويلتزم البائع بتسليم المبيع في غضون (${getArVal(d.durationMonths)}) شهراً وفق المواصفات.`;
    clause2TextEn = `This contract is effective upon signing on ${getEnVal(d.startDate)}, and the Seller commits to deliver the subject matter within (${getEnVal(d.durationMonths)}) months under specs.`;

    clause3TitleAr = "البند الثالث: الثمن وطريقة الدفع";
    clause3TitleEn = "Clause 3: Purchase Price & Payment";
    clause3TextAr = `إجمالي قيمة المبيع المتفق عليها هي: ${getArVal(d.basicSalary)} ر.س، ويلتزم الطرف الثاني بسدادها كاملة شاملة أي تكاليف إضافية مقدرة بـ ${getArVal(d.otherAllowances)} ر.س للطرف الأول.`;
    clause3TextEn = `The total agreed purchase price of the sale is SAR ${getEnVal(d.basicSalary)}, and the Second Party commits to pay it in full including any additional costs estimated at SAR ${getEnVal(d.otherAllowances)} to the First Party.`;
  } else if (cat === "purchase") {
    clause1TitleAr = "البند الأول: موضوع الشراء والمواصفات";
    clause1TitleEn = "Clause 1: Subject of Purchase & Specs";
    clause1TextAr = `يطلب الطرف الأول شراء السلعة/الخدمة المحددة كـ (${getArVal(d.jobTitle)}) من الطرف الثاني وفق المعايير والشروط الفنية المتفق عليها.`;
    clause1TextEn = `The First Party requests to purchase the goods/services identified as (${getEnVal(d.jobTitleEn)}) from the Second Party in accordance with the agreed technical specs and terms.`;

    clause2TitleAr = "البند الثاني: ميعاد المباشرة والتوريد والفحص";
    clause2TitleEn = "Clause 2: Delivery & Inspection Period";
    clause2TextAr = `يسري هذا العقد اعتباراً من تاريخ ${getArVal(d.startDate)}، على أن يتم فحص المواد وقبولها خلال فترة تجريبية ملزمة مدتها (${getArVal(d.probationDays)}) يوماً من تاريخ تسلمها.`;
    clause2TextEn = `The contract is effective starting ${getEnVal(d.startDate)}, provided that materials are tested and accepted within a mandatory inspection period of (${getEnVal(d.probationDays)}) days upon receipt.`;

    clause3TitleAr = "البند الثالث: القيمة الإجمالية وجدول الدفعات";
    clause3TitleEn = "Clause 3: Purchase Value & Payment Milestones";
    clause3TextAr = `تبلغ القيمة الإجمالية للشراء: ${getArVal(d.basicSalary)} ر.س، تُدفع طبقاً لمراحل الإنجاز المتفق عليها، مع التزام الطرف الأول بأي رسوم إضافية تبلغ ${getArVal(d.transportAllowance)} ر.س.`;
    clause3TextEn = `The total purchase value is SAR ${getEnVal(d.basicSalary)}, to be paid according to milestones, with the First Party bearing any additional logistical fees of SAR ${getEnVal(d.transportAllowance)}.`;
  } else if (cat === "supply") {
    clause1TitleAr = "البند الأول: المواد والخدمات الموردة ونطاق العمل";
    clause1TitleEn = "Clause 1: Scope of Supply & Deliverables";
    clause1TextAr = `يلتزم الطرف الأول بتوريد وتوصيل المكونات المحددة وهي (${getArVal(d.jobTitle)}) لصالح الطرف الثاني بجودة عالية ووفق أحكام الملحق الفني.`;
    clause1TextEn = `The First Party commits to supply and deliver the specified items, namely (${getEnVal(d.jobTitleEn)}), to the Second Party with high quality standards and according to technical annex.`;

    clause2TitleAr = "البند الثاني: جدول التوريد والضمان التشغيلي";
    clause2TitleEn = "Clause 2: Supply Schedule & Warranty Period";
    clause2TextAr = `يبلغ مدى تسليم التوريدات فترة (${getArVal(d.durationMonths)}) شهراً تبدأ من تاريخ ${getArVal(d.startDate)}، مع فترة ضمان تشغيلي واختبار جودة مدتها (${getArVal(d.probationDays)}) يوماً.`;
    clause2TextEn = `The delivery supply schedule spans a duration of (${getEnVal(d.durationMonths)}) months starting from ${getEnVal(d.startDate)}, with a testing and operational warranty period of (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: التكلفة وطرق الفوترة والسداد";
    clause3TitleEn = "Clause 3: Supply Cost & Payment Terms";
    clause3TextAr = `تكلفة التوريد الأساسية هي ${getArVal(d.basicSalary)} ر.س، يضاف إليها بدل توصيل وشحن ${getArVal(d.transportAllowance)} ر.س وتكاليف فرز وتعبئة بقيمة ${getArVal(d.otherAllowances)} ر.س.`;
    clause3TextEn = `The basic supply cost is SAR ${getEnVal(d.basicSalary)}, plus delivery/shipping of SAR ${getEnVal(d.transportAllowance)} and packaging fees of SAR ${getEnVal(d.otherAllowances)}.`;
  } else if (cat === "distribution") {
    clause1TitleAr = "البند الأول: تعيين الموزع والنطاق المعياري";
    clause1TitleEn = "Clause 1: Appointment of Distributor & Range";
    clause1TextAr = `يعين الطرف الأول الطرف الثاني كموزع رسمي لمنتجات (${getArVal(d.jobTitle)}) في المنطقة الجغرافية والقطاع المتفق عليه بين الشركاء.`;
    clause1TextEn = `The First Party appoints the Second Party as the official distributor for (${getEnVal(d.jobTitleEn)}) within the agreed geographical region and sector.`;

    clause2TitleAr = "البند الثاني: مدة التوزيع والحصرية الإقليمية";
    clause2TitleEn = "Clause 2: Term & Geographical Exclusivity";
    clause2TextAr = `مدة هذا التعيين والتوزيع الحصري هي (${getArVal(d.durationMonths)}) شهراً تبدأ من تاريخ المباشرة الفعلي وهو ${getArVal(d.startDate)} قابلة للتمديد تجنباً للانقطاع.`;
    clause2TextEn = `The term of this exclusive appointment is (${getEnVal(d.durationMonths)}) months starting from ${getEnVal(d.startDate)}, renewable upon agreement.`;

    clause3TitleAr = "البند الثالث: الحصص والشراء السنوي الأدنى";
    clause3TitleEn = "Clause 3: Quotas & Minimum Annual Purchases";
    clause3TextAr = `يلتزم الموزع بالشراء السنوي الأدنى بقيمة ${getArVal(d.basicSalary)} ر.س، والحفاظ على ميزانية تسويق محلية للعلامة لا تقل عن ${getArVal(d.otherAllowances)} ر.س.`;
    clause3TextEn = `The distributor commits to a minimum annual purchase of SAR ${getEnVal(d.basicSalary)}, and to maintain a local branding/marketing budget of at least SAR ${getEnVal(d.otherAllowances)}.`;
  } else if (cat === "agency") {
    clause1TitleAr = "البند الأول: موضوع الوكالة ونطاق الصلاحيات";
    clause1TitleEn = "Clause 1: Scope of Agency & Representation";
    clause1TextAr = `يفوض الموكل الوكيل لتمثيله تجارياً في أعمال (${getArVal(d.jobTitle)}) والترويج لخدماته ومنتجاته بشكل رسمي في السوق المستهدفة.`;
    clause1TextEn = `The Principal hereby authorizes and appoints the Agent to commercially represent it in (${getEnVal(d.jobTitleEn)}) and officially promote its services/products.`;

    clause2TitleAr = "البند الثاني: مدة الوكالة ومراجعة الأداء الدوري";
    clause2TitleEn = "Clause 2: Term & Performance Review";
    clause2TextAr = `تسري هذه الوكالة القانونية والمسؤولية لمدة (${getArVal(d.durationMonths)}) شهراً تبدأ من ${getArVal(d.startDate)}، مع فترة مراجعة وتقييم أداء كل (${getArVal(d.probationDays)}) يوماً.`;
    clause2TextEn = `This agency is valid for (${getEnVal(d.durationMonths)}) months starting ${getEnVal(d.startDate)}, subject to performance evaluations every (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: العمولات والبدلات والمصاريف التشغيلية";
    clause3TitleEn = "Clause 3: Commissions & Working Capital Retainer";
    clause3TextAr = `العمولة الأساسية للوكيل تبلغ نسبتها أو قيمتها الثابتة ${getArVal(d.basicSalary)} ر.س، بالإضافة إلى ميزانية تشغيلية وبدلات تبلغ ${getArVal(d.transportAllowance)} ر.س.`;
    clause3TextEn = `The agent's basic commission or fixed retainer is SAR ${getEnVal(d.basicSalary)}, plus a specialized operational budget/allowance of SAR ${getEnVal(d.transportAllowance)}.`;
  } else if (cat === "franchise") {
    clause1TitleAr = "البند الأول: منح صيانة العلامة التجارية والملكية الفكرية";
    clause1TitleEn = "Clause 1: Grant of Franchise & Proprietary System";
    clause1TextAr = `يمنح الطرف الأول الطرف الثاني حق تشغيل واستخدام العلامة التجارية ونظام التشغيل الفني الخاص بـ (${getArVal(d.jobTitle)}) وفق المعايير والبروتوكولات التشغيلية للمانح.`;
    clause1TextEn = `The First Party grants the Second Party the right to operate and use the trademark and proprietary system of (${getEnVal(d.jobTitleEn)}) under the Franchisor's manuals.`;

    clause2TitleAr = "البند الثاني: مدة الامتياز ونافذة التجهيز والافتتاح";
    clause2TitleEn = "Clause 2: Franchise Term & Setup Window";
    clause2TextAr = `يسري هذا العقد لمدة تبلغ (${getArVal(d.durationMonths)}) شهراً تبدأ من تاريخ ${getArVal(d.startDate)}، على أن يُمنح الوكيل فترة تجهيز وتدريب مدتها (${getArVal(d.probationDays)}) يوماً.`;
    clause2TextEn = `This agreement is valid for (${getEnVal(d.durationMonths)}) months starting ${getEnVal(d.startDate)}, including a comprehensive prep/training window of (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: رسوم الامتياز ونسب العوائد الشهري";
    clause3TitleEn = "Clause 3: Franchise Entry Fees & Royalties";
    clause3TextAr = `الرسوم الأساسية للامتياز (Franchise Fee) تبلغ: ${getArVal(d.basicSalary)} ر.س، مع اقتطاع نسبة تشغيل وتسويق مستمرة تبلغ قيمتها ${getArVal(d.otherAllowances)} ر.س شهرياً كعوائد.`;
    clause3TextEn = `The basic Franchise Entry Fee is SAR ${getEnVal(d.basicSalary)}, with an ongoing monthly operational/marketing royalty fee of SAR ${getEnVal(d.otherAllowances)}.`;
  } else if (cat === "partnership") {
    clause1TitleAr = "البند الأول: طبيعة الشراكة والنشاط والأهداف";
    clause1TitleEn = "Clause 1: Nature of Partnership & Core Activity";
    clause1TextAr = `يتفق الطرفان على تأسيس ونهوض شراكة تجارية متخصصة في ممارسة وتطوير أعمال (${getArVal(d.jobTitle)}) بهدف تحقيق المصالح المشتركة وتنمية الأعمال.`;
    clause1TextEn = `The parties agree to form a commercial partnership specialized in carrying out and developing (${getEnVal(d.jobTitleEn)}) to enhance mutual business goals.`;

    clause2TitleAr = "البند الثاني: تاريخ المباشرة وسلطات الإدارة والقرار";
    clause2TitleEn = "Clause 2: Commencement & Management Authority";
    clause2TextAr = `تبدأ الشراكة الاستثمارية رسمياً في تاريخ ${getArVal(d.startDate)}، وتكون قرارات الإدارة خاضعة للإجماع التام من الشركاء أو الأغلبية المتفق عليها.`;
    clause2TextEn = `The partnership officially commences on ${getEnVal(d.startDate)}, and all managerial/board choices are subject to partner consensus or majority rules.`;

    clause3TitleAr = "البند الثالث: رأس المال وتوزيـع الحصص والأنصبة";
    clause3TitleEn = "Clause 3: Capital Contributions & Share Ratios";
    clause3TextAr = `رأس مال الشراكة الإجمالي هو: ${getArVal(d.basicSalary)} ر.س، يسهم الطرف الأول بحصة تبلغ ${getArVal(d.housingAllowance)} ر.س والطرف الثاني بحصة تبلغ ${getArVal(d.transportAllowance)} ر.س.`;
    clause3TextEn = `The total partnership capital is SAR ${getEnVal(d.basicSalary)}, where Partner 1 contributes SAR ${getEnVal(d.housingAllowance)} and Partner 2 contributes SAR ${getEnVal(d.transportAllowance)}.`;
  } else if (cat === "shareholders") {
    clause1TitleAr = "البند الأول: غرض الاتفاقية وهيكل رأس المال والتأسيس";
    clause1TitleEn = "Clause 1: Purpose of Agreement & Equity Structure";
    clause1TextAr = `تنظم هذه الاتفاقية العلاقة القانونية للمساهمين في شركة (${getArVal(d.jobTitle)}) وحوكمة اتخاذ القرارات وحماية حقوق الأقلية والأغلبية.`;
    clause1TextEn = `This agreement governs the regulatory relationship of shareholders in (${getEnVal(d.jobTitleEn)}), voting mechanisms, board structure, and minority rights.`;

    clause2TitleAr = "البند الثاني: سريان الحظر وحقوق الشفعة وعرض الأسهم";
    clause2TitleEn = "Clause 2: Lock-up Period & Right of First Refusal";
    clause2TextAr = `تسري الاتفاقية فور التوقيع في ${getArVal(d.startDate)}، مع تفعيل حظر ملزم للتصرف في الأسهم أو التنازل عنها لفترة (${getArVal(d.durationMonths)}) شهراً.`;
    clause2TextEn = `The agreement comes into full force on ${getEnVal(d.startDate)}, imposing a mandatory lock-up period on share transfers for (${getEnVal(d.durationMonths)}) months.`;

    clause3TitleAr = "البند الثالث: قيمـة الأسهم والتمويل الإضافي المساعد";
    clause3TitleEn = "Clause 3: Capital Values & Shareholder Loan Funding";
    clause3TextAr = `قيمة مساهمة الطرف الثاني تبلغ ${getArVal(d.basicSalary)} ر.س مقابل الأسهم المحددة، مع تنظيم دعم إضافي بقيمة ${getArVal(d.otherAllowances)} ر.س كقرض مساهم مالي معتمد.`;
    clause3TextEn = `The capital contribution of the Second Party is SAR ${getEnVal(d.basicSalary)} in exchange for equity, plus a defined shareholder loan of SAR ${getEnVal(d.otherAllowances)} if needed.`;
  } else if (cat === "investment") {
    clause1TitleAr = "البند الأول: جولة الاستثمار الاستراتيجية والتقييم";
    clause1TitleEn = "Clause 1: Strategic Investment Round & Valuation";
    clause1TextAr = `يطرح الطرف الأول جولة استثمارية لتمويل عمليات وتطوير شركة (${getArVal(d.jobTitle)}) وتسريع حضورها الإقليمي والوطني الفعال.`;
    clause1TextEn = `The First Party launches an investment round to fund and scale operations of the company (${getEnVal(d.jobTitleEn)}) and expand regional footprints.`;

    clause2TitleAr = "البند الثاني: شروط الإغلاق المالي ومدة الفحص الفني";
    clause2TitleEn = "Clause 2: Closing Conditions & Due Diligence Window";
    clause2TextAr = `تاريخ الإغلاق المالي المستهدف هو ${getArVal(d.startDate)}، بشرط إتمام الفحص المالي والفني والنافي للجهالة في غضون (${getArVal(d.probationDays)}) يوماً للتوافق.`;
    clause2TextEn = `The target investment close date is set for ${getEnVal(d.startDate)}, subject to completing professional due diligence within (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: مبلـغ الاستثمار الإجمالي ومراحل الحقن المالي";
    clause3TitleEn = "Clause 3: Aggregate Investment Capital & Installments";
    clause3TextAr = `يلتزم المستثمر بتقديم مبلغ استثمار إجمالي وقدره ${getArVal(d.basicSalary)} ر.س مقابل حصة ملكية ونسبة من الأرباح وفق شروط العقد الأساسية والملحقات.`;
    clause3TextEn = `The Investor hereby commits to inject total capital of SAR ${getEnVal(d.basicSalary)} in exchange for equity share as defined in the master terms and schedules.`;
  } else if (cat === "jv") {
    clause1TitleAr = "البند الأول: غرض التحالف وتطوير المشروع المشترك";
    clause1TitleEn = "Clause 1: JV Purpose & Project Scope";
    clause1TextAr = `يتضامن الطرفان لتأسيس مشروع مشترك لتنفيذ وتصميم وتطوير مشروع (${getArVal(d.jobTitle)}) وتبادل وتآزر الموارد التقنية والقوى البشرية الفنية.`;
    clause1TextEn = `The two parties align to establish a joint venture for executing and developing the project known as (${getEnVal(d.jobTitleEn)}) and sharing technical resources.`;

    clause2TitleAr = "البند الثاني: ميعاد المباشرة والمدة التشغيلية للتحالف";
    clause2TitleEn = "Clause 2: Commencement & Agreed JV Term";
    clause2TextAr = `يسري هذا التضامن والمشروع من تاريخ ${getArVal(d.startDate)}، ولمدة تشغيلية تقديرية تبلغ (${getArVal(d.durationMonths)}) شهراً من تاريخ مباشرة التحالف.`;
    clause2TextEn = `This joint venture is effective from ${getEnVal(d.startDate)}, for an estimated operational duration of (${getEnVal(d.durationMonths)}) months.`;

    clause3TitleAr = "البند الثالث: الميزانية المشتركة والحصص المتكافئة";
    clause3TitleEn = "Clause 3: Consolidated Project Budget & Pledges";
    clause3TextAr = `ميزانية التأسيس الإجمالية تقدر بـ: ${getArVal(d.basicSalary)} ر.س يتعهد الطرف الأول بـ ${getArVal(d.housingAllowance)} ر.س والطرف الثاني بـ ${getArVal(d.transportAllowance)} ر.س للتغطية.`;
    clause3TextEn = `The total setup budget is estimated at SAR ${getEnVal(d.basicSalary)}, whereby Partner 1 pledges SAR ${getEnVal(d.housingAllowance)} and Partner 2 pledges SAR ${getEnVal(d.transportAllowance)}.`;
  } else if (cat === "marketing") {
    clause1TitleAr = "البند الأول: الخدمات التسويقية الموصوفة للمسوق";
    clause1TitleEn = "Clause 1: Custom Marketing Deliverables & Channels";
    clause1TextAr = `يفوض العميل المسوق رسمياً لإدارة وتصميم وتوجيه الحملات الإعلانية لأجل تطبيق/خدمة (${getArVal(d.jobTitle)}) لجلب الزيارات وتكبير المبيعات الفوقية.`;
    clause1TextEn = `The Client hereby designates the Marketer to manage, design, and direct ad campaigns for the app/service (${getEnVal(d.jobTitleEn)}) to drive traffic.`;

    clause2TitleAr = "البند الثاني: عهدة تفعيل الإعلانات ونطاق الفحص الدوري";
    clause2TitleEn = "Clause 2: Retainer Duration & Performance Check";
    clause2TextAr = `تسري بنود العمل والتحليلات لمدة (${getArVal(d.durationMonths)}) شهراً تبدأ في ${getArVal(d.startDate)} مع فترة تقييمية للأداء كل (${getArVal(d.probationDays)}) يوماً للتحديث.`;
    clause2TextEn = `The marketing retainer spans (${getEnVal(d.durationMonths)}) months starting from ${getEnVal(d.startDate)} backed by review rounds every (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: الأتعاب الشهرية وميزانية الإنفاق المدفوع للشبكات";
    clause3TitleEn = "Clause 3: Monthly Fees & Paid Traffic Ad Spend";
    clause3TextAr = `الأتعاب الشهرية الثابتة للمسوق تبلغ: ${getArVal(d.basicSalary)} ر.س، بالإضافة إلى توفير ميزانية إعلانية مدفوعة مباشرة للشبكات بقيمة ${getArVal(d.otherAllowances)} ر.س شهرياً.`;
    clause3TextEn = `The fixed monthly fee for the marketer is SAR ${getEnVal(d.basicSalary)}, in addition to a paid ad spend budget provided directly to networks of SAR ${getEnVal(d.otherAllowances)} monthly.`;
  } else if (cat === "brokerage") {
    clause1TitleAr = "البند الأول: موضوع السعي والوساطة وتقريب وجهات النظر";
    clause1TitleEn = "Clause 1: Scope of Brokerage & Referral Services";
    clause1TextAr = `يلتزم الطرف الثاني بتقديم وساطة فاعلة وسعي حقيقي لتعريف ومفاوضة فرص الاستثمار/البيع المتعلقة بـ (${getArVal(d.jobTitle)}) لمشترين ومستثمرين محتملين.`;
    clause1TextEn = `The Second Party commits to provide active mediation to expose and negotiate any sales/investments related to (${getEnVal(d.jobTitleEn)}) with potential buyers.`;

    clause2TitleAr = "البند الثاني: ميعاد الفعالية وشرف الحصرية وعدم الالتفاف";
    clause2TitleEn = "Clause 2: Term of Validity & Non-Circumvention";
    clause2TextAr = `يسري ميعاد هذا التعهد بالوساطة والجهود المقدرة لمدة (${getArVal(d.durationMonths)}) شهراً ابتداءً من تاريخ ${getArVal(d.startDate)} مع الالتزام الصارم بعدم الالتفاف المباشر.`;
    clause2TextEn = `The term for this brokerage commitment and effort spans (${getEnVal(d.durationMonths)}) months starting from ${getEnVal(d.startDate)}, with a strict non-circumvention obligation.`;

    clause3TitleAr = "البند الثالث: عمولة السعي وتاريخ استحقاقها القانوني";
    clause3TitleEn = "Clause 3: Commission & Release Terms";
    clause3TextAr = `يستحق الوسيط عمولة سعي صافية بقيمة ${getArVal(d.basicSalary)} ر.س فور إغلاق الصفقة وتوقيع العقد النهائي والملزم بين الأطراف المحالة بنجاح.`;
    clause3TextEn = `The broker is entitled to a net commission of SAR ${getEnVal(d.basicSalary)} upon successful closing of the deal and signing of the final contract among referred parties.`;
  } else if (cat === "consulting") {
    clause1TitleAr = "البند الأول: نطاق تقديم الخدمات الاستشارية والخبرة";
    clause1TitleEn = "Clause 1: Scope of Advisory & Expertise Deliverables";
    clause1TextAr = `يلتزم المستشار بتقديم الاستشارات الفنية والمهنية والتقارير لقطاع ومشاريع (${getArVal(d.jobTitle)}) لصالح العميل بكل كفاءة وأمانة مهنية كاملة.`;
    clause1TextEn = `The Consultant commits to provide technical and professional consulting for the sector and projects of (${getEnVal(d.jobTitleEn)}) to the Client with supreme efficiency and integrity.`;

    clause2TitleAr = "البند الثاني: مدة الخدمة ومعدل ساعات العمل المرنة";
    clause2TitleEn = "Clause 2: Consulting Duration & Evaluation Days";
    clause2TextAr = `مدة الاستشارات المحددة هي (${getArVal(d.durationMonths)}) شهراً تبدأ من ${getArVal(d.startDate)} مع مراجعة ومصادقة دورية كل (${getArVal(d.probationDays)}) يوماً.`;
    clause2TextEn = `The specified consulting duration is (${getEnVal(d.durationMonths)}) months starting ${getEnVal(d.startDate)}, with a performance checkpoint every (${getEnVal(d.probationDays)}) days.`;

    clause3TitleAr = "البند الثالث: الأتعاب الاستشارية وتكلفة المهمات الخارجية";
    clause3TitleEn = "Clause 3: Retainer Fees & Travel/Expense Allowance";
    clause3TextAr = `أتعاب الاستشارة الأساسية تبلغ: ${getArVal(d.basicSalary)} ر.س، بالإضافة إلى دفع بدلات انتقال ومهمات استشارية تبلغ ${getArVal(d.transportAllowance)} ر.س عند الطلب أو السفر.`;
    clause3TextEn = `The basic consulting fees are SAR ${getEnVal(d.basicSalary)}, plus transition/out-of-pocket allowances of SAR ${getEnVal(d.transportAllowance)} for visits outside headquarters.`;
  }

  return {
    titleAr,
    titleEn,
    party1TitleAr,
    party1TitleEn,
    party1TextAr,
    party1TextEn,
    party2TitleAr,
    party2TitleEn,
    party2TextAr,
    party2TextEn,
    clause1TitleAr,
    clause1TitleEn,
    clause1TextAr,
    clause1TextEn,
    clause2TitleAr,
    clause2TitleEn,
    clause2TextAr,
    clause2TextEn,
    clause3TitleAr,
    clause3TitleEn,
    clause3TextAr,
    clause3TextEn,
    clause4TitleAr: "البند الرابع: تسوية المنازعات ومكافحة الانحراف",
    clause4TitleEn: "Clause 4: Dispute Resolution & Legal Jurisdiction",
    clause4TextAr: dispText.ar,
    clause4TextEn: dispText.en,
  };
};

interface SignaturePadProps {
  onSave: (dataUrl: string) => void;
  onClear: () => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#020617";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL());
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onClear();
  };

  return (
    <div className="flex flex-col items-center gap-1.5 border border-dashed border-zinc-300 bg-zinc-50 p-2 rounded-xl print:hidden w-full max-w-[280px]">
      <div className="relative bg-white border border-zinc-200 rounded-lg overflow-hidden w-full">
        <canvas
          ref={canvasRef}
          width={280}
          height={100}
          className="w-full h-[100px] cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        <div className="absolute bottom-1 right-2 text-[9px] text-zinc-400 font-bold uppercase pointer-events-none select-none">
          ارسم توقيعك هنا / Sign Here
        </div>
      </div>
      <button
        type="button"
        onClick={clearCanvas}
        className="text-[10px] bg-zinc-200 text-zinc-700 hover:bg-zinc-300 font-bold px-2 py-1 rounded transition-colors"
      >
        مسح التوقيع / Clear
      </button>
    </div>
  );
};

const PREDEFINED_CLAUSES = [
  {
    id: "confidentiality",
    titleAr: "بند السرية وحظر الإفشاء",
    titleEn: "Confidentiality & Non-Disclosure Clause",
    textAr:
      "يلتزم الطرفان بالمحافظة التامة على سرية كافة المعلومات والبيانات الفنية أو التجارية التي يتم تبادلها خلال فترة العقد وعدم إفشائها للغير.",
    textEn:
      "Both parties commit to maintain absolute confidentiality over all technical or commercial information and data exchanged during the term.",
  },
  {
    id: "forcemajeure",
    titleAr: "بند القوة القاهرة والظروف الطارئة",
    titleEn: "Force Majeure Clause",
    textAr:
      "لا يتحمل أي من الطرفين مسؤولية التأخير أو عدم التنفيذ الناتج عن ظروف قاهرة خارجة عن السيطرة المعقولة مثل الكوارث الطبيعية أو القرارات السيادية.",
    textEn:
      "Neither party shall be liable for delay or failure to perform resulting from events beyond reasonable control, such as natural disasters or sovereign decrees.",
  },
  {
    id: "termination",
    titleAr: "بند فسخ العقد والإنهاء المبكر",
    titleEn: "Termination & Early Dissolution Clause",
    textAr:
      "يجوز لأي من الطرفين إنهاء العقد فور وقوع أي إخلال جوهري من الطرف الآخر ببنود التعاقد، وبموجب إخطار مكتوب بمهلة 15 يوماً.",
    textEn:
      "Either party may immediately terminate the contract upon material breach by the other party, subject to a 15-day prior written notice.",
  },
  {
    id: "noncompete",
    titleAr: "بند عدم المنافسة وتضارب المصالح",
    titleEn: "Non-Compete & Conflict of Interest",
    textAr:
      "يتعهد الطرف الثاني بعدم القيام بأي نشاط منافس للطرف الأول أو تقديم خدمات لجهات منافسة طوال فترة سريان هذا العقد ولمدة سنتين من تاريخ انتهائه.",
    textEn:
      "The Second Party undertakes not to engage in any competing activity or provide services to competitors throughout the term and for 2 years post-term.",
  },
];

export default function Contracts() {
  const { settings } = useSettings();
  const { user } = useUser();
  const [employees, setEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "employees"), where("userId", "==", user.uid || user.id));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setEmployees(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => {
        console.error("Error loading employees", error);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const handleSyncToPayroll = async (customStatus?: string) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً لإجراء المزامنة والربط!");
      return;
    }
    if (!data.employeeName) {
      toast.error("الرجاء إدخال اسم الموظف على الأقل لمزامنته!");
      return;
    }
    try {
      const matchedEmp = employees.find(
        (x) =>
          (data.employeeId && (x.iqama === data.employeeId || x.nationalId === data.employeeId)) ||
          x.name?.toLowerCase() === data.employeeName?.toLowerCase()
      );

      const empData = {
        name: data.employeeName || "",
        position: data.jobTitle || "",
        nationality: data.employeeNationality || "سعودي",
        baseSalaryHalalas: Math.round((Number(data.basicSalary) || 0) * 100),
        housingAllowanceHalalas: Math.round((Number(data.housingAllowance) || 0) * 100),
        transportAllowanceHalalas: Math.round((Number(data.transportAllowance) || 0) * 100),
        otherDeductionsHalalas: Math.round((Number(data.otherAllowances) || 0) * 100),
        status: customStatus || (documentStatus === "Signed" ? "active" : "pending"),
        iqama: data.employeeId || "",
        email: data.employeeEmail || "",
        mobile: data.employeeMobile || "",
        userId: user.uid || user.id,
        updatedAt: serverTimestamp(),
      };

      if (matchedEmp) {
        await updateDoc(doc(db, "employees", matchedEmp.id), empData);
        toast.success(
          `تم بنجاح تحديث بيانات الموظف المالي ${data.employeeName} في ملفات الرواتب الحية!`
        );
      } else {
        await addDoc(collection(db, "employees"), {
          ...empData,
          createdAt: serverTimestamp(),
        });
        toast.success(
          `تم إنشاء ملف مالي جديد للموظف ${data.employeeName} وتصديره لقسم الرواتب بنجاح!`
        );
      }

      await addDoc(collection(db, "audit_logs"), {
        userId: user.uid || user.id,
        module: "Contracts",
        action: "مزامنة العقد مع نظام الرواتب والموظفين",
        payload: JSON.stringify({ employeeName: data.employeeName, employeeId: data.employeeId }),
        result: "success",
        timestamp: serverTimestamp(),
      });
    } catch (err: any) {
      console.error("Sync to payroll failed:", err);
      toast.error(`فشلت مزامنة حاسبة الرواتب: ${err.message || err}`);
    }
  };

  const [data, setData] = useState<ContractData>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clm_contract_data");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved contract data:", e);
        }
      }
    }
    return DEFAULT_DATA;
  });
  const isEmployment = !data.contractCategory || data.contractCategory === "employment";
  const [activeTab, setActiveTab] = useState<
    "employer" | "employee" | "terms" | "settings" | "templates" | "documents"
  >("templates");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // New features states
  const [documentStatus, setDocumentStatus] = useState<"Draft" | "Pending" | "Signed">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clm_contract_document_status");
      if (saved) return saved as any;
    }
    return "Draft";
  });
  const [autoPopulateFromSettings, setAutoPopulateFromSettings] = useState(true);
  const [isDiffMode, setIsDiffMode] = useState(false);
  const [lastTemplateKey, setLastTemplateKey] = useState("");
  const [isCompareChanges, setIsCompareChanges] = useState(false);
  const [isClausesDrawerOpen, setIsClausesDrawerOpen] = useState(false);
  const [highlightedClauses, setHighlightedClauses] = useState<Record<number, boolean>>({});
  const [pageWidthMode, setPageWidthMode] = useState<"standard" | "fit">("standard");
  const [scale, setScale] = useState(1);
  const [clauseSearchQuery, setClauseSearchQuery] = useState("");
  const [documentSearchQuery, setDocumentSearchQuery] = useState("");
  const [docLayoutTheme, setDocLayoutTheme] = useState<"compact" | "wide">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clm_contract_layout_theme");
      if (saved) return saved as any;
    }
    return "compact";
  });
  const [currentTimestamp, setCurrentTimestamp] = useState("");
  const documentWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTimestamp = () => {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, "0");
      const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      setCurrentTimestamp(`${dateStr} ${timeStr}`);
    };
    updateTimestamp();
    const interval = setInterval(updateTimestamp, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredClauses = PREDEFINED_CLAUSES.filter((clause) => {
    const query = clauseSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      clause.id.toLowerCase().includes(query) ||
      clause.titleAr.toLowerCase().includes(query) ||
      clause.titleEn.toLowerCase().includes(query) ||
      clause.textAr.toLowerCase().includes(query) ||
      clause.textEn.toLowerCase().includes(query)
    );
  });

  // Settings manual trigger helper to bindings
  const handleAutoBindSettings = () => {
    const newData = applySettingsToContract(data);
    setData(newData);

    const generated = getGeneratedTexts(newData);
    setEditedTexts((prev) => ({
      ...prev,
      party1TextAr: generated.party1TextAr,
      party1TextEn: generated.party1TextEn,
    }));

    toast.success("تم جلب بيانات المنشأة من الإعدادات وربطها تلقائياً بالـ placeholders بنجاح! ⚡");
  };

  // Inline diff renderer helper
  const renderInlineDiff = (
    original: string,
    current: string,
    isCompareActive: boolean,
    dir: "rtl" | "ltr" = "rtl"
  ) => {
    if (!isCompareActive) {
      if (!current || current.trim() === "") {
        return "........................";
      }
      return current;
    }

    const cleanOrig = (original || "").trim();
    const cleanCurr = (current || "").trim();

    if (cleanOrig === cleanCurr) {
      if (!cleanCurr) {
        return "........................";
      }
      return current;
    }

    return (
      <span className="inline-block w-full">
        {cleanOrig && (
          <span
            className="text-rose-600 line-through bg-rose-50 px-1 py-0.5 rounded mr-1 font-normal select-all select-none"
            title="النص الأصلي لعقد النظام"
          >
            {cleanOrig}
          </span>
        )}
        {cleanCurr && (
          <span
            className="text-emerald-700 underline decoration-2 bg-emerald-50 px-1 py-0.5 rounded font-bold"
            title="تعديلك المباشر"
          >
            {cleanCurr}
          </span>
        )}
      </span>
    );
  };

  const getSearchHighlightClass = (keyAr: string, keyEn: string) => {
    if (!documentSearchQuery) return "transition-all duration-300";
    const query = documentSearchQuery.toLowerCase().trim();
    const textAr = (editedTexts[keyAr as keyof typeof editedTexts] || "").toLowerCase();
    const textEn = (editedTexts[keyEn as keyof typeof editedTexts] || "").toLowerCase();
    const origTextAr = (
      getGeneratedTexts(data)[keyAr as keyof typeof editedTexts] || ""
    ).toLowerCase();
    const origTextEn = (
      getGeneratedTexts(data)[keyEn as keyof typeof editedTexts] || ""
    ).toLowerCase();

    const matches =
      textAr.includes(query) ||
      textEn.includes(query) ||
      origTextAr.includes(query) ||
      origTextEn.includes(query);
    if (matches) {
      return "ring-4 ring-emerald-500/70 border-emerald-500 bg-emerald-50/20 scale-[1.01] transition-all p-4 -m-4 shadow-lg z-10 relative rounded-2xl";
    } else {
      return "opacity-25 transition-all duration-300 filter grayscale-40 border-dashed";
    }
  };

  // Focus-mode direct edit states
  const [isEditMode, setIsEditMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clm_contract_is_edit_mode") === "true";
    }
    return false;
  });
  const [editedTexts, setEditedTexts] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("clm_contract_edited_texts");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved contract edited texts:", e);
        }
      }
    }
    return getGeneratedTexts(DEFAULT_DATA);
  });
  const [signatureImage, setSignatureImage] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clm_contract_signature_image");
    }
    return null;
  });
  const [verificationLink, setVerificationLink] = useState<string | null>(null);

  const [lastModifiedInfo, setLastModifiedInfo] = useState<{ date: string; author: string } | null>(
    null
  );
  const [isSavingFirebase, setIsSavingFirebase] = useState(false);

  // Load contract from Firestore on mount/category change
  useEffect(() => {
    if (!user) return;
    const contractId = `${user.uid}_${data.contractCategory || "employment"}`;
    const contractDocRef = doc(db, "contracts", contractId);

    const loadDoc = async () => {
      try {
        const docSnap = await getDoc(contractDocRef);
        if (docSnap.exists()) {
          const docData = docSnap.data();
          if (docData.contractData) {
            setData(docData.contractData);
          }
          if (docData.editedTexts) {
            setEditedTexts(docData.editedTexts);
          }
          if (docData.documentStatus) {
            setDocumentStatus(docData.documentStatus);
          }
          if (docData.signatureImage) {
            setSignatureImage(docData.signatureImage);
          }
          if (docData.lastModified) {
            const date = new Date(docData.lastModified);
            setLastModifiedInfo({
              date: date.toLocaleString("ar-SA") + " / " + date.toLocaleString("en-US"),
              author: docData.authorEmail || "Administrator",
            });
          }
        }
      } catch (err) {
        console.warn("Failed to load contract from Firestore:", err);
      }
    };

    loadDoc();
  }, [user, data.contractCategory]);

  const saveContractToFirebase = async (forcedSignature?: string | null, forcedStatus?: string) => {
    if (!user) {
      toast.error("يجب تسجيل الدخول أولاً لحفظ العقد في السحابة!");
      return;
    }
    setIsSavingFirebase(true);
    const contractId = `${user.uid}_${data.contractCategory || "employment"}`;
    try {
      const contractDocRef = doc(db, "contracts", contractId);
      const signatureToSave =
        typeof forcedSignature !== "undefined" ? forcedSignature : signatureImage;
      const statusToSave = forcedStatus || documentStatus;

      const payload = {
        contractCategory: data.contractCategory || "employment",
        contractData: data,
        editedTexts: editedTexts,
        documentStatus: statusToSave,
        signatureImage: signatureToSave || null,
        isSigned: typeof forcedSignature !== "undefined" ? !!forcedSignature : isSigned,
        lastModified: new Date().toISOString(),
        authorEmail: user.email || "Administrator",
        authorUid: user.uid,
      };

      await setDoc(contractDocRef, payload, { merge: true });

      const date = new Date();
      setLastModifiedInfo({
        date: date.toLocaleString("ar-SA") + " / " + date.toLocaleString("en-US"),
        author: user.email || "Administrator",
      });

      toast.success("تم حفظ وتوثيق العقد بنجاح في قاعدة بيانات مدارج السحابية! ☁️");
    } catch (err: any) {
      console.error("Failed to save contract to Firestore:", err);
      toast.error(`فشل حفظ العقد سحابياً: ${err.message || err}`);
    } finally {
      setIsSavingFirebase(false);
    }
  };

  // Settings mapping utility helper
  const applySettingsToContract = (prevData: ContractData) => {
    return {
      ...prevData,
      employerName: settings.companyName || prevData.employerName,
      employerCR: settings.crNumber || prevData.employerCR,
      employerAddress: settings.location || prevData.employerAddress,
      employerRep: settings.managerName || prevData.employerRep,
      employerNameEn: prevData.employerNameEn || settings.companyName || "",
      employerAddressEn: prevData.employerAddressEn || settings.location || "",
      employerRepEn: prevData.employerRepEn || settings.managerName || "",
    };
  };

  // Auto-population mechanism when template loads
  useEffect(() => {
    // Unique key identifying a loaded template content
    const currentKey = `${data.contractCategory}-${data.jobTitle}-${data.basicSalary}`;
    if (lastTemplateKey && currentKey !== lastTemplateKey) {
      if (autoPopulateFromSettings) {
        setData((prev) => applySettingsToContract(prev));
      }
    }
    setLastTemplateKey(currentKey);
  }, [data.contractCategory, data.jobTitle, data.basicSalary, autoPopulateFromSettings]);

  // Inject predefined clauses helper
  const injectClause = (clause: (typeof PREDEFINED_CLAUSES)[number], branchNum: 1 | 2 | 3 | 4) => {
    const textArKey = `clause${branchNum}TextAr` as const;
    const textEnKey = `clause${branchNum}TextEn` as const;

    setEditedTexts((prev) => {
      const updatedAr = prev[textArKey]
        ? `${prev[textArKey]}\n\n[${clause.titleAr}]:\n${clause.textAr}`
        : `[${clause.titleAr}]:\n${clause.textAr}`;

      const updatedEn = prev[textEnKey]
        ? `${prev[textEnKey]}\n\n[${clause.titleEn}]:\n${clause.textEn}`
        : `[${clause.titleEn}]:\n${clause.textEn}`;

      return {
        ...prev,
        [textArKey]: updatedAr,
        [textEnKey]: updatedEn,
      };
    });

    // Automatically trigger highlight animation on the targeted clause
    setHighlightedClauses((prev) => ({ ...prev, [branchNum]: true }));
    setTimeout(() => {
      setHighlightedClauses((prev) => ({ ...prev, [branchNum]: false }));
    }, 3500);

    toast.success(`تم دمج بند (${clause.titleAr}) بنجاح في البند التعاقدي ${branchNum}!`);
  };

  // Revert any local manual adjustments made in edit mode back to original template
  const handleResetToDefault = () => {
    setEditedTexts(getGeneratedTexts(data));
    toast.success(
      "تم إعادة تعيين نصوص وتفاصيل وثيقة المستند لنصوص القالب الأصلي المبرمج في النظام!"
    );
  };

  // Dynamically scales the document structure based on viewport/parent size when Page Width toggle is active
  useEffect(() => {
    if (pageWidthMode !== "fit" || !documentWrapperRef.current) {
      setScale(1);
      return;
    }

    const wrapper = documentWrapperRef.current;
    const parent = wrapper.parentElement;
    if (!parent) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const parentWidth = entry.contentRect.width;
        // Standard A4 document width 210mm equates roughly to 794px in Tailwind style guidelines
        const baseWidth = 794;
        if (parentWidth < baseWidth + 24) {
          const ratio = (parentWidth - 24) / baseWidth;
          setScale(Math.max(0.35, ratio));
        } else {
          setScale(1);
        }
      }
    });

    observer.observe(parent);
    return () => observer.disconnect();
  }, [pageWidthMode]);

  // Sync editedTexts from left questionnaire when NOT in manual edit mode
  useEffect(() => {
    if (!isEditMode) {
      setEditedTexts(getGeneratedTexts(data));
    }
  }, [data, isEditMode]);

  useEffect(() => {
    if (canvasRef.current && data) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // High resolution for printing
        canvas.width = 1600;
        canvas.height = 2400;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.font = 'bold 120px "IBM Plex Sans Arabic", Tajawal, sans-serif';
        ctx.fillStyle = "rgba(0, 0, 0, 0.03)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Add rotation and repeat Pattern
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(-Math.PI / 4);

        // Draw multiple lines of watermark
        for (let i = -3; i <= 3; i++) {
          for (let j = -3; j <= 3; j++) {
            const x = i * 600;
            const y = j * 400;
            ctx.fillText(data.employerCR || "CONFIDENTIAL", x, y);

            // Add a smaller sub-watermark for extra security
            ctx.font = "bold 40px monospace";
            ctx.fillText(data.employeeId, x, y + 60);
            ctx.font = 'bold 120px "IBM Plex Sans Arabic", Tajawal, sans-serif';
          }
        }
      }
    }
  }, [data.employerCR, data.employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditedTextChange = (
    key: keyof ReturnType<typeof getGeneratedTexts>,
    value: string
  ) => {
    setEditedTexts((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isSigned, setIsSigned] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("clm_contract_is_signed") === "true";
    }
    return false;
  });
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);

  // LocalStorage Auto-Save Effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_data", JSON.stringify(data));
    }
  }, [data]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_edited_texts", JSON.stringify(editedTexts));
    }
  }, [editedTexts]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_is_edit_mode", String(isEditMode));
    }
  }, [isEditMode]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_document_status", documentStatus);
    }
  }, [documentStatus]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_is_signed", String(isSigned));
    }
  }, [isSigned]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (signatureImage) {
        localStorage.setItem("clm_contract_signature_image", signatureImage);
      } else {
        localStorage.removeItem("clm_contract_signature_image");
      }
    }
  }, [signatureImage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("clm_contract_layout_theme", docLayoutTheme);
    }
  }, [docLayoutTheme]);

  const downloadContractAsPDF = async () => {
    setIsExportingPDF(true);
    const loadingToast = toast.loading("جاري توليد ملف PDF باستخدام jsPDF...");

    try {
      const contractElement = document.getElementById("contract-document");
      if (!contractElement) {
        toast.error("لم يتم العثور على مستند العقد");
        setIsExportingPDF(false);
        return;
      }

      // We don't need to manually hide elements because we can use the filter option in toPng
      const imgData = await toPng(contractElement, {
        quality: 1.0,
        pixelRatio: 2.5, // Ultra-sharp precision
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains("print:hidden")) {
            return false;
          }
          return true;
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      const categoryLabel =
        CATEGORY_CONFIGS[data.contractCategory || "employment"]?.labelEn || "Contract";
      const employeeNameClean = (data.employeeNameEn || "Document").replace(/\s+/g, "_");
      const fileName = `${categoryLabel}_${employeeNameClean}.pdf`;

      pdf.save(fileName);
      toast.success("تم تصدير وتحميل مستند العقد بصيغة PDF بنجاح 📄", { id: loadingToast });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("حدث خطأ أثناء إنشاء وتنزيل ملف PDF", { id: loadingToast });
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleSignatureSuccess = async () => {
    setIsSigned(true);
    setDocumentStatus("Signed");
    setQrCodeData(`NAFEZ_AUTH_${data.employeeId}_${Date.now()}`);
    await saveContractToFirebase(signatureImage, "Signed");
  };

  const generateVerificationLink = () => {
    const uniqueId = `CNT-${data.employeeId || "DEFAULT"}-${Date.now().toString().slice(-6)}`;
    const link = `https://app.mudarij.com/audit/verify/contract/${uniqueId}`;
    setVerificationLink(link);
    toast.success("تم إصدار رابط التحقق الفوري ورمز الـ QR الموثق لدى مدارج!");
  };

  useEffect(() => {
    const uniqueId = `CNT-${data.employeeId || "DEFAULT"}-${Date.now().toString().slice(-4)}`;
    setVerificationLink(`https://app.mudarij.com/audit/verify/contract/${uniqueId}`);
  }, [data.employeeId]);

  const handlePrint = async () => {
    setIsExporting(true);
    const loadingToast = toast.loading("جاري توليد ملف PDF...");

    // Wait for React to re-render without Tailwind color components (NafathAuth)
    await new Promise((resolve) => setTimeout(resolve, 150));

    try {
      const contractElement = document.getElementById("contract-document");
      if (!contractElement) {
        toast.error("لم يتم العثور على مستند العقد");
        setIsExporting(false);
        return;
      }

      const imgData = await toPng(contractElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node instanceof HTMLElement && node.classList?.contains("print:hidden")) {
            return false;
          }
          return true;
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4", // typical A4 size
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Handle multi-page
      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save("Employment_Contract.pdf");
      toast.success("تم تصدير العقد بصيغة PDF بنجاح", { id: loadingToast });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("حدث خطأ أثناء إنشاء ملف PDF", { id: loadingToast });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="flex flex-col lg:flex-row h-[calc(100vh-6rem)] overflow-hidden bg-zinc-50 font-sans"
      dir="rtl"
    >
      {/* Injected custom native scale rules for gorgeous page-accurate browser printing */}
      <style>{`
        @media print {
          body {
            background-color: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
            height: 0 !important;
            width: 0 !important;
            overflow: hidden !important;
          }
          /* Ensure we hide the entire left-hand custom workflow and frame container and only keep the contract-document */
          div.lg\\:w-\\[45\\%\\] {
            display: none !important;
          }
          div.flex-1 {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            display: block !important;
          }
          /* Target contract document element directly */
          #contract-document {
            width: 210mm !important;
            height: 297mm !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 15mm !important;
            box-shadow: none !important;
            border: none !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            position: relative !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
          }
          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* LEFT PANE: The Questionnaire (Editor) */}
      <div className="w-full lg:w-[45%] h-full flex flex-col border-l border-zinc-200 bg-white print:hidden shadow-xl z-10">
        <header className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-[#0f172a] tracking-tight">CLM الذكي</h1>
              <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-50 border border-zinc-150 px-2 py-0.5 rounded-full font-sans select-none animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>حفظ تلقائي / Auto-saved</span>
              </span>
            </div>
            <p className="text-xs font-bold text-[#10b981] mt-1 tracking-wider uppercase">
              Next-Gen Legal Engine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:from-emerald-600 hover:to-teal-750 transition-all shadow-md"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>طباعة A4 (المتصفح)</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center gap-2 bg-[#0f172a] text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1e293b] disabled:opacity-50 transition-colors shadow-md"
            >
              {isExporting ? (
                <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent animate-spin rounded-full" />
              ) : (
                <Download className="w-4 h-4 text-[#d4af37]" />
              )}
              {isExporting ? "جاري التصدير..." : "تنزيل PDF"}
            </button>
          </div>
        </header>

        <div className="flex border-b border-zinc-100 shrink-0 bg-white px-4 pt-2 gap-2 overflow-x-auto">
          {[
            { id: "templates", icon: FileSignature, label: "النماذج الجاهزة" },
            { id: "documents", icon: Folder, label: "DMS الوثائق" },
            {
              id: "employer",
              icon: Building,
              label:
                data.contractCategory && data.contractCategory !== "employment"
                  ? (CATEGORY_CONFIGS[data.contractCategory]?.party1Ar || "الطرف الأول").replace(
                      " (الطرف الأول):",
                      ""
                    )
                  : "المنشأة",
            },
            {
              id: "employee",
              icon: User,
              label:
                data.contractCategory && data.contractCategory !== "employment"
                  ? (CATEGORY_CONFIGS[data.contractCategory]?.party2Ar || "الطرف الثاني").replace(
                      " (الطرف الثاني):",
                      ""
                    )
                  : "العامل",
            },
            {
              id: "terms",
              icon: Scale,
              label:
                data.contractCategory && data.contractCategory !== "employment"
                  ? "الشروط والبنود"
                  : "الشروط والرواتب",
            },
            { id: "settings", icon: Settings2, label: "الإعدادات الذكية" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-[#10b981] text-[#0f172a] bg-zinc-50 rounded-t-lg"
                  : "border-transparent text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50/50"
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "text-[#10b981]" : ""}`} />{" "}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <form className="space-y-8 pb-10">
            {activeTab === "templates" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 rounded-xl p-4">
                  <h3 className="font-bold text-[#10b981] mb-1">
                    صانع العقود المعتمدة والاتفاقيات الرسمية
                  </h3>
                  <p className="text-sm text-zinc-600">
                    اختر نموذج العقد المطلوب للبدء وسيقوم النظام فوراً بتهيئة البنود القانونية
                    وتوزيع الصلاحيات ثنائية اللغة لتلائم تطلعاتك التشغيلية.
                  </p>
                </div>

                {/* SETTINGS AUTO-POPULATE CONTROL BADGE */}
                <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-extrabold text-xs text-[#0f172a]">
                        تعبئة تلقائية ذكية للمنشأة
                      </h4>
                      <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                        نشغل حالياً المزامنة لـ:{" "}
                        <span className="font-bold text-zinc-800">
                          {settings.companyName || "غير محدد"}
                        </span>{" "}
                        (س.ت: {settings.crNumber || "بدون"})
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={autoPopulateFromSettings}
                        onChange={(e) => {
                          setAutoPopulateFromSettings(e.target.checked);
                          if (e.target.checked) {
                            setData((prev) => applySettingsToContract(prev));
                            toast.success("تم تفعيل وتطبيق المزامنة الذكية فوراً!");
                          } else {
                            toast.info("تم تعطيل المزامنة الذكية للمنشأة.");
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                      <span className="mr-3 text-xs font-black text-zinc-600">نشط</span>
                    </label>
                  </div>
                </div>

                {/* SECTION 1: HR & EMPLOYMENT CONTRACT REPERTOIRE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2">
                    <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                    <h3 className="font-black text-sm text-zinc-800">
                      عقود التوظيف والموارد البشرية (HR Contracts)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "مدير مبيعات",
                          jobTitleEn: "Sales Manager",
                          contractType: "fixed",
                          basicSalary: "6000",
                          housingAllowance: "1500",
                          transportAllowance: "500",
                          otherAllowances: "2000",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد موظف مبيعات المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد موظف مبيعات
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن بدلات وتسويات العمولات والأهداف البيعية
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "مطور برمجيات",
                          jobTitleEn: "Software Developer",
                          contractType: "indefinite",
                          basicSalary: "12000",
                          housingAllowance: "3000",
                          transportAllowance: "1000",
                          otherAllowances: "0",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد مهندس برمجيات المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد مهندس / تقني
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن شروط السرية الفائقة، وحقوق الملكية الفكرية، وعدم المنافسة
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "محاسب",
                          jobTitleEn: "Accountant",
                          contractType: "fixed",
                          basicSalary: "5000",
                          housingAllowance: "1250",
                          transportAllowance: "400",
                          otherAllowances: "0",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد محاسب مالي المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد مالي / محاسب
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن بنود العهدة العظمى والمسؤولية المالية والحوكمة
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "عامل صيانة",
                          jobTitleEn: "Maintenance Worker",
                          contractType: "fixed",
                          basicSalary: "2000",
                          housingAllowance: "500",
                          transportAllowance: "200",
                          otherAllowances: "0",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد عمالة مهنية وفنية المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد عمالة مهنية
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن شروط توفير السكن المناسب، والتنقل، والإعاشة والمستلزمات
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "أخصائي تسويق رقمي",
                          jobTitleEn: "Digital Marketing Specialist",
                          contractType: "fixed",
                          basicSalary: "5500",
                          housingAllowance: "1375",
                          transportAllowance: "500",
                          otherAllowances: "1000",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد أخصائي تسويق وصناعة محتوى المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد تسويق وصناعة محتوى
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يركز على حقوق النشر وحسابات التواصل الاجتماعي وبدلات الأداء الرقمي
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "رئيس تنفيذي للعمليات",
                          jobTitleEn: "Chief Operating Officer (COO)",
                          contractType: "indefinite",
                          basicSalary: "25000",
                          housingAllowance: "6250",
                          transportAllowance: "2000",
                          otherAllowances: "5000",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد القيادة التنفيذية المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد رئيس تنفيذي / إداري قيادي
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن تفويض الصلاحيات الإدارية، العمولات السنوية، والسرية والحوكمة
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "مصمم واجهات المستخدم",
                          jobTitleEn: "UI/UX Designer",
                          contractType: "fixed",
                          basicSalary: "8500",
                          housingAllowance: "2125",
                          transportAllowance: "800",
                          otherAllowances: "0",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد مصمم واجهات مستخدم المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد مصمم واجهات ومجال إبداعي
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يحتوي على بنود نقل ملكية الملكية الفكرية لحقوق التصاميم والهوية البصرية
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "employment",
                          jobTitle: "مدير مشاريع تقنية",
                          jobTitleEn: "Technical Project Manager",
                          contractType: "fixed",
                          basicSalary: "14000",
                          housingAllowance: "3500",
                          transportAllowance: "1200",
                          otherAllowances: "1500",
                        }));
                        toast.success(
                          "تم تحميل نموذج عقد مدير المشاريع المعتمد واختيار وضع عقود العمل!"
                        );
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-[#10b981] hover:ring-1 hover:ring-[#10b981] transition-all group"
                    >
                      <h4 className="font-bold text-zinc-900 group-hover:text-[#10b981] mb-1">
                        عقد مدير مشروع محترف
                      </h4>
                      <p className="text-xs text-zinc-500">
                        يتضمن مؤشرات أداء تسليم المشاريع، والالتزام بمعايير الحوكمة والجودة
                      </p>
                    </button>
                  </div>
                </div>

                {/* SECTION 2: B2B COMMERCIAL & INVESTMENT AGREEMENT REPERTOIRE */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b-2 border-zinc-100 pb-2">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    <h3 className="font-black text-sm text-zinc-800">
                      العقود التجارية والاتفاقيات الاستثمارية (B2B & Investment)
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "sales",
                          jobTitle: "برمجيات سحابية ومعدات شبكات",
                          jobTitleEn: "Cloud Software & Networking Equipment",
                          contractType: "fixed",
                          durationMonths: "6",
                          basicSalary: "45000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "5000",
                        }));
                        toast.success("تم تحميل قالب عقد بيع وتفرغ رسمي للسلع والخدمات!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد بيع
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          بائع ⇌ مشتري
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتضمن التزام نقل الملكية، الضمانات الفنية، والمسؤولية عن جودة المبيع
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "purchase",
                          jobTitle: "أجهزة خوادم ومحطات عمل مكتبية",
                          jobTitleEn: "Office Servers & Workstations Hardware",
                          contractType: "fixed",
                          probationDays: "30",
                          basicSalary: "85000",
                          housingAllowance: "",
                          transportAllowance: "2500",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل قالب عقد شراء وتملك أصول!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد شراء
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          مشتري ⇌ بائع
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يركز على حوكمة الفحص والقبول والمواصفات وجودة التوريد
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "supply",
                          jobTitle: "قطع غيار إلكترونية ولدائن صناعية",
                          jobTitleEn: "Electronic Spare Parts & Industrial Plastics",
                          contractType: "fixed",
                          durationMonths: "24",
                          probationDays: "60",
                          basicSalary: "120000",
                          housingAllowance: "",
                          transportAllowance: "8000",
                          otherAllowances: "4000",
                        }));
                        toast.success("تم تحميل قالب عقد توريد خدمات ومواد!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد توريد
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          مورد ⇌ عميل
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتعلق بجدولة الشحنات، وسلاسل الإمداد وبنود التعبئة وضمان الالتزام
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "distribution",
                          jobTitle: "منتجات غذائية ومكملات غذائية طبيعية",
                          jobTitleEn: "Food Products & Natural Dietary Supplements",
                          contractType: "fixed",
                          durationMonths: "36",
                          basicSalary: "350000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "50000",
                        }));
                        toast.success("تم تحميل قالب عقد توزيع منتجات حصري!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد توزيع
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          منتج ⇌ موزع
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يمنح الحصرية الإقليمية والتزام الحد الأدنى السنوي للاشتراء
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "agency",
                          jobTitle: "حلول وبوابات الدفع الإلكتروني الذكية",
                          jobTitleEn: "Smart Electronic Payment Gateways & Solutions",
                          contractType: "fixed",
                          durationMonths: "12",
                          probationDays: "90",
                          basicSalary: "15000",
                          housingAllowance: "",
                          transportAllowance: "3000",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل قالب عقد وكالة تجارية معتمد!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد وكالة تجارية
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          موكل ⇌ وكيل
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتناول تفويض عمولات التمثيل، الحوكمة والترويج المهني للمنتجات
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "franchise",
                          jobTitle: "سلسلة مقاهي ومطاعم الوجبات السريعة",
                          jobTitleEn: "Coffee Shops & Fast-food Restaurants Chain",
                          contractType: "fixed",
                          durationMonths: "60",
                          probationDays: "180",
                          basicSalary: "250000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "12000",
                        }));
                        toast.success("تم تحميل قالب عقد امتياز تجاري موحد!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد امتياز تجاري (Franchise)
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          مانح ⇌ ممنوح
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يركز على حقوق استخدام الهوية والرسوم التشغيلية وضوابط الالتزام بالجودة
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "partnership",
                          jobTitle: "تأسيس وتشغيل مصنع تعبئة مياه صحية",
                          jobTitleEn: "Establishment & Operation of Water Bottling Plant",
                          contractType: "fixed",
                          basicSalary: "1000000",
                          housingAllowance: "600000",
                          transportAllowance: "400000",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل قالب عقد شراكة واستثمار!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد شراكة
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          شريك ⇌ شريك
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        ينظم رأس المال المشترك، الإدارة بحسن نية، ونهج توزيع الأرباح والمسؤوليات
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "shareholders",
                          jobTitle: "شركة خدمات الإسناد وتوفير الكفاءات",
                          jobTitleEn: "Outsourcing Services & Talent Acquisition Corp",
                          contractType: "fixed",
                          durationMonths: "60",
                          basicSalary: "500000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "100000",
                        }));
                        toast.success("تم تحميل اتفاقية مساهمين وتأسيس شركة!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد مساهمين
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          مؤسس ⇌ مستثمر
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        تختص بنطاق الحظر وحقوق الشفعة وعرض الأسهم والقروض ونسب التصويت
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "investment",
                          jobTitle: "تطبيق التجارة السريعة والخدمات اللوجستية",
                          jobTitleEn: "Quick Commerce App & Logistics Platform",
                          contractType: "fixed",
                          probationDays: "45",
                          basicSalary: "2500000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل قالب عقد استثمار وتمويل جريء!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد استثمار
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          مستهدف ⇌ مستثمر
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتضمن التقييم وما يرتبط به من شروط الإغلاق والدفعات ومراحل التوسع الفعلي
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "jv",
                          jobTitle: "تطوير البنية التحتية لشبكات الإنترنت اللاسلكي",
                          jobTitleEn: "Infrastructure Development of Wireless Internet Networks",
                          contractType: "fixed",
                          durationMonths: "18",
                          basicSalary: "1500000",
                          housingAllowance: "800000",
                          transportAllowance: "700000",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل اتفاقية مشروع مشترك وتضامن!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد مشروع مشترك (JV)
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          متحالف ⇌ متحالف
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        موجه لتظافر الموارد والتكامل الفني وتبادل الوفاء بالمطالب والخدمات المشتركة
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "marketing",
                          jobTitle: "حملات المشاهير وصناعة المحتوى المرئي والمسموع",
                          jobTitleEn: "Influencer Campaigns, Visual & Audio Content Creation",
                          contractType: "fixed",
                          durationMonths: "12",
                          probationDays: "30",
                          basicSalary: "35000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "10000",
                        }));
                        toast.success("تم تحميل قالب عقد خدمات تسويق متميز!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد تسويق
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          عميل ⇌ مسوق
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتضمن تحديد قنوات العرض، الأجر الشهري الثابت وميزانيات الإنفاق المدفوع
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "brokerage",
                          jobTitle: "تسويق وبيع عقارات ومجمعات سكنية وتجارية",
                          jobTitleEn: "Marketing & Sales of Residential & Commercial Real Estate",
                          contractType: "fixed",
                          durationMonths: "6",
                          basicSalary: "75000",
                          housingAllowance: "",
                          transportAllowance: "",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل قالب عقد وساطة وسعي معتمد!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد وساطة
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          صاحب عمل ⇌ وسيط
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يركز على شرف حظر العقد المباشر وتحديد قيم ونسب وجدول سحب العمولات
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setData((prev) => ({
                          ...prev,
                          contractCategory: "consulting",
                          jobTitle: "دراسات جدوى وهيكلة إدارية وتخطيط استراتيجي",
                          jobTitleEn: "Feasibility Studies, Restructuring & Strategic Planning",
                          contractType: "fixed",
                          durationMonths: "3",
                          probationDays: "15",
                          basicSalary: "60000",
                          housingAllowance: "",
                          transportAllowance: "5000",
                          otherAllowances: "",
                        }));
                        toast.success("تم تحميل اتفاقية تقديم خدمات استشارية!");
                      }}
                      className="text-right bg-white border border-zinc-200 p-4 rounded-xl hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-zinc-900 group-hover:text-indigo-600">
                          عقد استشارات
                        </h4>
                        <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                          عميل ⇌ مستشار
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        يتضمن صياغة المخرجات الأسبوعية وبدلات الانتقال والزيارات والتكليفات
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 border-r-4 border-[#10b981] pr-4">
                      نظام إدارة الوثائق الذكي (Smart DMS)
                    </h2>
                    <p className="text-zinc-500 mt-2 font-medium pr-5">
                      أرشفة رقمية مشفرة من الطرفين، مع التعرف البصري (OCR) لتصنيف الوثائق تلقائياً
                      واستخراج التواريخ الحرجة.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-[#10b981] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#059669] transition-shadow shadow-lg shadow-[#10b981]/20"
                  >
                    <Upload className="w-5 h-5" /> رفع مستند (OCR)
                  </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Sidebar (Folders) */}
                    <div className="w-full md:w-64 shrink-0 space-y-2 border-l border-zinc-100 pl-6">
                      <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                        التصنيفات الآلية
                      </h4>
                      {[
                        { name: "عقود الموظفين", count: 145, active: true },
                        { name: "السجلات المدنية والجوازات", count: 320, active: false },
                        { name: "التراخيص والسجلات (Wathiq)", count: 12, active: false },
                        { name: "اتفاقيات الموردين (NDAs)", count: 48, active: false },
                      ].map((folder, i) => (
                        <div
                          key={i}
                          className={`flex items-center justify-between p-3 rounded-xl cursor-pointer ${folder.active ? "bg-emerald-50 text-emerald-800" : "hover:bg-zinc-50 text-zinc-700"}`}
                        >
                          <div className="flex items-center gap-2">
                            <Folder
                              className={`w-4 h-4 ${folder.active ? "text-emerald-500" : "text-zinc-400"}`}
                            />
                            <span className="text-sm font-bold">{folder.name}</span>
                          </div>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${folder.active ? "bg-emerald-200 text-emerald-900" : "bg-zinc-100 text-zinc-500"}`}
                          >
                            {folder.count}
                          </span>
                        </div>
                      ))}
                      <div className="mt-8 p-4 bg-zinc-900 text-white rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"></div>
                        <Lock className="w-5 h-5 mb-2 text-emerald-400" />
                        <h4 className="text-xs font-black mb-1">تشفير AES-256</h4>
                        <p className="text-[10px] text-zinc-400">
                          جميع الوثائق محمية بتشفير عسكري ولا يمكن الوصول لها إلا بصلاحيات RBAC.
                        </p>
                      </div>
                    </div>

                    {/* Main Content (Files Grid) */}
                    <div className="flex-1">
                      <div className="relative mb-6">
                        <Search className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="البحث باستخدام الذكاء الاصطناعي (مثال: عقد أحمد الخاص بالتسويق)..."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-3 pr-12 pl-4 text-sm font-bold focus:ring-2 focus:ring-[#10b981] outline-none transition-all"
                        />
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right">
                          <thead>
                            <tr className="border-b border-zinc-100">
                              <th className="py-3 px-4 text-xs font-black text-zinc-400 w-1/3">
                                اسم المستند
                              </th>
                              <th className="py-3 px-4 text-xs font-black text-zinc-400 w-1/4">
                                الذكاء الاصطناعي (OCR)
                              </th>
                              <th className="py-3 px-4 text-xs font-black text-zinc-400 w-1/4">
                                تاريخ الانتهاء المستخرج
                              </th>
                              <th className="py-3 px-4 text-xs font-black text-zinc-400 text-left">
                                إجراءات
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {
                                name: "عقد توظيف - المهندس خالد.pdf",
                                ocr: "تم المعالجة",
                                status: "valid",
                                date: "2027-01-15",
                              },
                              {
                                name: "تجديد إقامة - محمد سيد.jpeg",
                                ocr: "تم الاستخراج",
                                status: "warning",
                                date: "2024-08-10 (قريباً)",
                              },
                              {
                                name: "اتفاقية سرية مورد تقنية.docx",
                                ocr: "جاري المعالجة...",
                                status: "processing",
                                date: "-",
                              },
                            ].map((file, idx) => (
                              <tr key={idx} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                      <FileText className="w-4 h-4" />
                                    </div>
                                    <p className="font-bold text-sm text-zinc-900">{file.name}</p>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`text-[10px] font-black px-2 py-1 rounded-md ${file.status === "processing" ? "bg-amber-100 text-amber-700 animate-pulse" : "bg-blue-50 text-blue-700"}`}
                                  >
                                    {file.ocr}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span
                                    className={`text-xs font-bold ${file.status === "warning" ? "text-rose-600 font-black" : "text-zinc-600"}`}
                                  >
                                    {file.date}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-left">
                                  <button className="text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors">
                                    معاينة المستند
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employer" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "اسم المنشأة الطرف الأول (عربي)"
                        : `${(CATEGORY_CONFIGS[data.contractCategory]?.party1Ar || "الطرف الأول").replace(" (الطرف الأول):", "")} (عربي)`}
                    </label>
                    <input
                      type="text"
                      name="employerName"
                      value={data.employerName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "اسم المنشأة الطرف الأول (English)"
                        : `${(CATEGORY_CONFIGS[data.contractCategory]?.party1En || "First Party").replace(" (First Party):", "")} (English)`}
                    </label>
                    <input
                      type="text"
                      name="employerNameEn"
                      value={data.employerNameEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">
                    {isEmployment
                      ? "السجل التجاري للمنشأة (CR)"
                      : "السجل التجاري / الهوية الرسمية للطرف الأول"}
                  </label>
                  <input
                    type="text"
                    name="employerCR"
                    value={data.employerCR}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "Representative (English)"
                        : "Authorized Representative (English)"}
                    </label>
                    <input
                      type="text"
                      name="employerRepEn"
                      value={data.employerRepEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "مقر العمل والفرع الرئيسي (عربي)"
                        : "مقر / عنوان الطرف الأول (عربي)"}
                    </label>
                    <input
                      type="text"
                      name="employerAddress"
                      value={data.employerAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment ? "HQ Address (English)" : "Primary Address (English)"}
                    </label>
                    <input
                      type="text"
                      name="employerAddressEn"
                      value={data.employerAddressEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "employee" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* Integration with Payroll System / Select Employee dropdown */}
                <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/60 text-right">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3">
                    <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider flex items-center gap-1.5 bg-emerald-100/80 px-2.5 py-1 rounded-lg w-max">
                      <Users className="w-3.5 h-3.5" />
                      ربط الموظفين والرواتب حياً لكافة الفروع / Live Payroll Core Integration
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSyncToPayroll()}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>مزامنة وتصدير للرواتب / Save & Sync to Payroll</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-bold text-zinc-700 block text-right">
                      اكتشاف واختيار موظف من قاعدة الرواتب لملء العقد تلقائياً / Match & Load
                      Employee:
                    </label>
                    <div className="relative">
                      <select
                        onChange={(e) => {
                          const empId = e.target.value;
                          if (!empId) return;
                          const emp = employees.find((x) => x.id === empId);
                          if (emp) {
                            setData((prev) => ({
                              ...prev,
                              employeeName: emp.name || "",
                              employeeNameEn: emp.nameEn || emp.name || "",
                              employeeId: emp.iqama || emp.nationalId || emp.id || "",
                              employeeNationality: emp.nationality || "سعودي",
                              employeeNationalityEn: emp.nationalityEn || "Saudi",
                              employeeEmail: emp.email || "",
                              employeeMobile: emp.mobile || emp.phone || "",
                              jobTitle: emp.position || "",
                              jobTitleEn: emp.positionEn || emp.position || "",
                              basicSalary: String((emp.baseSalaryHalalas || 0) / 100 || ""),
                              housingAllowance: String(
                                (emp.housingAllowanceHalalas || 0) / 100 || ""
                              ),
                              transportAllowance: String(
                                (emp.transportAllowanceHalalas || 0) / 100 || ""
                              ),
                              otherAllowances: String(
                                (emp.otherDeductionsHalalas || 0) / 100 || ""
                              ),
                            }));
                            toast.success(
                              `تم جلب بيانات الموظف ${emp.name} وتعبئتها في العقد بنجاح!`
                            );
                          }
                        }}
                        className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold focus:border-[#10b981] outline-none cursor-pointer text-right"
                        defaultValue=""
                        dir="rtl"
                      >
                        <option value="">
                          -- اختر موظفًا للتعبئة التلقائية من قاعدة البيانات --
                        </option>
                        {employees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} - {emp.position || "عام"} (
                            {(emp.baseSalaryHalalas / 100).toLocaleString()} ر.س)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "اسم العامل الطرف الثاني (عربي)"
                        : `${(CATEGORY_CONFIGS[data.contractCategory]?.party2Ar || "الطرف الثاني").replace(" (الطرف الثاني):", "")} (عربي)`}
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={data.employeeName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "Employee Name (English)"
                        : `${(CATEGORY_CONFIGS[data.contractCategory]?.party2En || "Second Party").replace(" (Second Party):", "")} (English)`}
                    </label>
                    <input
                      type="text"
                      name="employeeNameEn"
                      value={data.employeeNameEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      {isEmployment
                        ? "رقم السجل المدني / الإقامة"
                        : "رقم الهوية الوطنية / السجل التجاري للثاني"}
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={data.employeeId}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <div className="space-y-2 flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-700">الجنسية</label>
                      <input
                        type="text"
                        name="employeeNationality"
                        value={data.employeeNationality}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-bold text-zinc-700">Nationality (EN)</label>
                      <input
                        type="text"
                        name="employeeNationalityEn"
                        value={data.employeeNationalityEn}
                        onChange={handleChange}
                        dir="ltr"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">العنوان الوطني</label>
                    <input
                      type="text"
                      name="employeeAddress"
                      value={data.employeeAddress}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">National Address</label>
                    <input
                      type="text"
                      name="employeeAddressEn"
                      value={data.employeeAddressEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">الجوال / Mobile</label>
                    <input
                      type="text"
                      name="employeeMobile"
                      value={data.employeeMobile}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none block"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">
                      البريد الإلكتروني / Email
                    </label>
                    <input
                      type="email"
                      name="employeeEmail"
                      value={data.employeeEmail}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "terms" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">المسمى الوظيفي (عربي)</label>
                    <input
                      type="text"
                      name="jobTitle"
                      value={data.jobTitle}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">Job Title (English)</label>
                    <input
                      type="text"
                      name="jobTitleEn"
                      value={data.jobTitleEn}
                      onChange={handleChange}
                      dir="ltr"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">تاريخ المباشرة</label>
                    <input
                      type="date"
                      name="startDate"
                      value={data.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none text-right"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">نوع العقد</label>
                    <select
                      name="contractType"
                      value={data.contractType}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                    >
                      <option value="fixed">محدد المدة (Fixed)</option>
                      <option value="indefinite">غير محدد (Indefinite)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-700">المدة (أشهر)</label>
                    <input
                      type="number"
                      name="durationMonths"
                      value={data.durationMonths}
                      onChange={handleChange}
                      disabled={data.contractType === "indefinite"}
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold disabled:opacity-50 focus:border-[#10b981] outline-none"
                    />
                  </div>
                </div>

                <div className="p-5 border border-[#10b981]/20 bg-[#10b981]/5 rounded-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#10b981]"></div>
                  <h3 className="text-xs font-black text-[#0f172a] mb-4 uppercase tracking-wider">
                    الحزمة المالية / Financial Package
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">
                        الراتب الأساسي / Basic
                      </label>
                      <input
                        type="number"
                        name="basicSalary"
                        value={data.basicSalary}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">السكن / Housing</label>
                      <input
                        type="number"
                        name="housingAllowance"
                        value={data.housingAllowance}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">النقل / Transport</label>
                      <input
                        type="number"
                        name="transportAllowance"
                        value={data.transportAllowance}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700">أخرى / Other</label>
                      <input
                        type="number"
                        name="otherAllowances"
                        value={data.otherAllowances}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 bg-white border border-zinc-200 rounded-xl text-sm font-bold focus:border-[#10b981] outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <Globe2 className="w-5 h-5 text-[#d4af37]" /> آلية تسوية المنازعات
                  </h3>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input
                        type="radio"
                        name="disputeResolution"
                        value="SA_COURTS"
                        checked={data.disputeResolution === "SA_COURTS"}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          المحاكم العمالية السعودية (الافتراضي)
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Saudi Labor Courts (Default for locals/standard hires)
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input
                        type="radio"
                        name="disputeResolution"
                        value="SCCA"
                        checked={data.disputeResolution === "SCCA"}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          المركز السعودي للتحكيم التجاري (SCCA)
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          Saudi Center for Commercial Arbitration (Best for executives)
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 p-3 border border-slate-200 rounded-xl bg-white cursor-pointer hover:border-[#10b981] transition-all">
                      <input
                        type="radio"
                        name="disputeResolution"
                        value="DIFC"
                        checked={data.disputeResolution === "DIFC"}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          محاكم مركز دبي المالي (DIFC)
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          DIFC Courts (Best for cross-border international hires)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                    <ImageIcon className="w-5 h-5 text-[#0f172a]" /> الهوية البصرية (Brand Identity)
                  </h3>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-700">لون العقد الأساسي</label>
                    <div className="flex gap-3">
                      {["#0f172a", "#10b981", "#d4af37", "#3b82f6", "#ef4444"].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setData((prev) => ({ ...prev, themeColor: color }))}
                          className={`w-8 h-8 rounded-full border-2 ${data.themeColor === color ? "border-zinc-900 scale-110 shadow-md" : "border-transparent"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f172a] text-white p-5 rounded-2xl flex gap-3 shadow-lg">
                  <ShieldCheck className="w-6 h-6 text-[#10b981]" />
                  <div>
                    <p className="font-bold text-sm">حماية التستر والموثوقية (Nafath)</p>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      عند إرسال العقد للتوقيع الإلكتروني، سيتم توجيه الممثل القانوني للمصادقة عبر
                      النفاذ الوطني لتأكيد الصلاحية (CR Audit Trail).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* RIGHT PANE: Split-Screen PDF Preview */}
      <div className="flex-1 bg-zinc-400 p-8 overflow-y-auto print:p-0 print:bg-white custom-scrollbar flex flex-col items-center gap-4">
        {/* Interactive Direct Legal Editor Tool Shelf */}
        <div className="w-[210mm] max-w-full bg-white rounded-2xl p-4 shadow-md flex flex-wrap items-center justify-between print:hidden gap-3 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${isEditMode ? "bg-amber-100 text-amber-700" : "bg-zinc-100 text-zinc-700"}`}
            >
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm text-[#0f172a]">
                المحرر المباشر للعقود (Edit Mode)
              </h3>
              <p className="text-xs text-zinc-500 font-medium">
                عدّل أي بند من بنود العقد مباشرة بالضغط على تفعيل وضع التحرير.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      "هل أنت متأكد من إعادة تعيين كافة التعديلات والتوافق التلقائي للمستند مع المدخلات الجانبية؟"
                    )
                  ) {
                    setEditedTexts(getGeneratedTexts(data));
                    toast.info("تمت إعادة مزامنة النصوص تلقائياً!");
                  }
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>إعادة تصفير التعديلات</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsEditMode(!isEditMode);
                toast.success(
                  isEditMode
                    ? "تم حفظ التعديلات وإغلاق المُحرّر المباشر"
                    : "المحرر نشط! اضغط على أي بند لتعديله مباشرة"
                );
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
                isEditMode
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              <span>{isEditMode ? "إنهاء التحرير وحفظ" : "تفعيل التحرير المباشر"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsDiffMode(!isDiffMode);
                toast.info(
                  isDiffMode
                    ? "تم العودة لعرض المستند الكامل"
                    : "نشط عرض المقارنة للفروقات والمراجعة!"
                );
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border ${
                isDiffMode
                  ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>
                {isDiffMode ? "عرض العقد الكامل / Document" : "مقارنة التعديلات / Compare Diff"}
              </span>
            </button>

            {isEditMode && (
              <button
                type="button"
                onClick={() => setIsClausesDrawerOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>إدراج بنود قانونية / Clauses Drawer</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-row gap-6 max-w-full justify-center items-start print:block print:p-0">
          {isDiffMode ? (
            <div className="w-[210mm] max-w-full bg-white rounded-2xl p-6 shadow-xl border border-zinc-200 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Scale className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <h3 className="font-black text-[#0f172a] text-sm">
                      مقارنة التعديلات الفورية للمستند / Split Diff View
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium">
                      مقارنة التعديلات المقولبة بيدك على اليمين مع نصوص القالب الأساسي على اليسار.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDiffMode(false)}
                  className="text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-1.5 rounded-lg transition-all"
                >
                  الرجوع للمحرر / Back
                </button>
              </div>

              {/* Side by side columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* COLUMN 1: Original Version */}
                <div className="space-y-4 text-right animate-in slide-in-from-right duration-200">
                  <h4 className="font-bold text-rose-600 text-xs flex items-center gap-1.5 border-b pb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                    القالب الأصلي (Original Template)
                  </h4>
                  {(() => {
                    const orig = getGeneratedTexts(data);
                    const fields = [
                      {
                        label: "عنوان وثيقة العقد / Contract Title",
                        keyAr: "titleAr",
                        keyEn: "titleEn",
                      },
                      {
                        label: "الطرف الأول (صاحب العمل) / First Party (Employer)",
                        keyAr: "party1TextAr",
                        keyEn: "party1TextEn",
                      },
                      {
                        label: "الطرف الثاني (العامل) / Second Party (Employee)",
                        keyAr: "party2TextAr",
                        keyEn: "party2TextEn",
                      },
                      {
                        label: "البند الأول التعاقدي / Clause 1",
                        keyAr: "clause1TextAr",
                        keyEn: "clause1TextEn",
                      },
                      {
                        label: "البند الثاني التعاقدي / Clause 2",
                        keyAr: "clause2TextAr",
                        keyEn: "clause2TextEn",
                      },
                      {
                        label: "البند الثالث التعاقدي / Clause 3",
                        keyAr: "clause3TextAr",
                        keyEn: "clause3TextEn",
                      },
                      {
                        label: "البند الرابع التعاقدي / Clause 4",
                        keyAr: "clause4TextAr",
                        keyEn: "clause4TextEn",
                      },
                    ];
                    return (
                      <div className="space-y-4">
                        {fields.map((f, i) => {
                          const hasArDiff =
                            (orig[f.keyAr as keyof typeof orig] || "").trim() !==
                            (editedTexts[f.keyAr as keyof typeof editedTexts] || "").trim();
                          const hasEnDiff =
                            (orig[f.keyEn as keyof typeof orig] || "").trim() !==
                            (editedTexts[f.keyEn as keyof typeof editedTexts] || "").trim();
                          return (
                            <div
                              key={i}
                              className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-1 text-right"
                            >
                              <span className="text-[10px] font-black text-zinc-400 block">
                                {f.label}
                              </span>
                              <div
                                className={`p-2 rounded text-xs leading-relaxed whitespace-pre-line text-right font-medium ${
                                  hasArDiff
                                    ? "bg-rose-50 text-rose-800 line-through border-r-2 border-rose-300"
                                    : "text-zinc-650"
                                }`}
                              >
                                {orig[f.keyAr as keyof typeof orig]}
                              </div>
                              <div
                                dir="ltr"
                                className={`p-2 rounded text-[11px] leading-relaxed whitespace-pre-line text-left font-mono ${
                                  hasEnDiff
                                    ? "bg-rose-50/70 text-rose-800 line-through border-l-2 border-rose-300"
                                    : "text-zinc-505"
                                }`}
                              >
                                {orig[f.keyEn as keyof typeof orig]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

                {/* COLUMN 2: Your Edited Version */}
                <div className="space-y-4 text-right animate-in slide-in-from-left duration-200">
                  <h4 className="font-bold text-emerald-600 text-xs flex items-center gap-1.5 border-b pb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    نصوص مسودتك المعدلة (Your Edited Version)
                  </h4>
                  {(() => {
                    const orig = getGeneratedTexts(data);
                    const fields = [
                      {
                        label: "عنوان وثيقة العقد / Contract Title",
                        keyAr: "titleAr",
                        keyEn: "titleEn",
                      },
                      {
                        label: "الطرف الأول (صاحب العمل) / First Party (Employer)",
                        keyAr: "party1TextAr",
                        keyEn: "party1TextEn",
                      },
                      {
                        label: "الطرف الثاني (العامل) / Second Party (Employee)",
                        keyAr: "party2TextAr",
                        keyEn: "party2TextEn",
                      },
                      {
                        label: "البند الأول التعاقدي / Clause 1",
                        keyAr: "clause1TextAr",
                        keyEn: "clause1TextEn",
                      },
                      {
                        label: "البند الثاني التعاقدي / Clause 2",
                        keyAr: "clause2TextAr",
                        keyEn: "clause2TextEn",
                      },
                      {
                        label: "البند الثالث التعاقدي / Clause 3",
                        keyAr: "clause3TextAr",
                        keyEn: "clause3TextEn",
                      },
                      {
                        label: "البند الرابع التعاقدي / Clause 4",
                        keyAr: "clause4TextAr",
                        keyEn: "clause4TextEn",
                      },
                    ];
                    return (
                      <div className="space-y-4">
                        {fields.map((f, i) => {
                          const hasArDiff =
                            (orig[f.keyAr as keyof typeof orig] || "").trim() !==
                            (editedTexts[f.keyAr as keyof typeof editedTexts] || "").trim();
                          const hasEnDiff =
                            (orig[f.keyEn as keyof typeof orig] || "").trim() !==
                            (editedTexts[f.keyEn as keyof typeof editedTexts] || "").trim();
                          return (
                            <div
                              key={i}
                              className="border border-zinc-100 rounded-xl p-3 bg-zinc-50/50 space-y-1 text-right"
                            >
                              <span className="text-[10px] font-black text-zinc-400 block">
                                {f.label}
                              </span>
                              <div
                                className={`p-2 rounded text-xs leading-relaxed whitespace-pre-line text-right font-medium ${
                                  hasArDiff
                                    ? "bg-emerald-50 text-emerald-900 font-bold border-r-2 border-emerald-400"
                                    : "text-zinc-700"
                                }`}
                              >
                                {editedTexts[f.keyAr as keyof typeof editedTexts]}
                              </div>
                              <div
                                dir="ltr"
                                className={`p-2 rounded text-[11px] leading-relaxed whitespace-pre-line text-left font-mono ${
                                  hasEnDiff
                                    ? "bg-emerald-50/70 text-emerald-900 font-bold border-l-2 border-emerald-400"
                                    : "text-zinc-650"
                                }`}
                              >
                                {editedTexts[f.keyEn as keyof typeof editedTexts]}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Layout Toggle Button OUTSIDE #contract-document */}
              <div className="w-full max-w-[210mm] lg:max-w-none flex flex-col sm:flex-row justify-between items-center bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-sm print:hidden gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-zinc-700">
                      تخطيط وثيقة العقد / Contract Style
                    </span>
                  </div>

                  <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => {
                        setDocLayoutTheme("compact");
                        toast.success("تم تشغيل تخطيط العقد التقليدي المدمج (Formal/Compact)!");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        docLayoutTheme === "compact"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-zinc-500" />
                      <span>تخطيط مدمج / Formal Compact</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDocLayoutTheme("wide");
                        toast.success("تم تشغيل تخطيط العقد الحديث العريض (Modern/Wide)!");
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        docLayoutTheme === "wide"
                          ? "bg-white text-zinc-900 shadow-sm"
                          : "text-zinc-500 hover:text-zinc-900"
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>عريض حديث / Modern Wide</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-805 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer border border-zinc-300 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5 text-zinc-650" />
                    <span>طباعة / Print</span>
                  </button>

                  <button
                    type="button"
                    onClick={downloadContractAsPDF}
                    disabled={isExportingPDF}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isExportingPDF ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-indigo-100" />
                    )}
                    <span>تحميل PDF (موثق) / Export PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => saveContractToFirebase()}
                    disabled={isSavingFirebase}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {isSavingFirebase ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-emerald-100" />
                    )}
                    <span>حفظ ومزامنة سحابية / Cloud Sync</span>
                  </button>
                </div>
              </div>

              <div
                ref={documentWrapperRef}
                className={`min-h-[297mm] p-0 print:w-full print:h-auto overflow-hidden relative shrink-0 transition-all duration-500 origin-top shadow-2xl border border-zinc-100 hover:border-zinc-300 hover:shadow-[0_30px_70px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 cursor-default select-text scroll-smooth ${
                  docLayoutTheme === "wide" ? "w-[240mm]" : "w-[210mm]"
                }`}
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                  color: "#0f172a",
                  wordBreak: "break-word",
                  fontFamily:
                    docLayoutTheme === "wide"
                      ? '"Tajawal", "Inter", sans-serif'
                      : '"Cairo", "Tajawal", "IBM Plex Sans Arabic", sans-serif',
                  transform: pageWidthMode === "fit" && scale < 1 ? `scale(${scale})` : undefined,
                  marginBottom:
                    pageWidthMode === "fit" && scale < 1
                      ? `calc(-297mm * ${1 - scale})`
                      : undefined,
                }}
                id="contract-document"
              >
                {/* HIGH-VISIBILITY STATUS RIBBON */}
                <div className="absolute top-0 right-0 z-50 overflow-hidden w-40 h-40 pointer-events-none select-none print:hidden">
                  <div
                    className={`absolute top-8 -right-12 w-48 py-1.5 text-center text-[10px] font-black uppercase tracking-wider rotate-45 shadow-sm border-y text-white ${
                      documentStatus === "Signed"
                        ? "bg-emerald-600 border-emerald-500 text-emerald-50 shadow-emerald-200"
                        : documentStatus === "Pending"
                          ? "bg-amber-500 border-amber-400 text-amber-50 shadow-amber-200 animate-pulse"
                          : "bg-zinc-500 border-zinc-400 text-zinc-50 shadow-zinc-200"
                    }`}
                  >
                    {documentStatus === "Signed"
                      ? "Signed / معتمد"
                      : documentStatus === "Pending"
                        ? "Review / مراجعة"
                        : "Draft / مسودة"}
                  </div>
                </div>

                {/* SECURE CANVAS WATERMARK */}
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 mix-blend-multiply"
                />

                {/* PRINT-ONLY CENTRAL WATERMARK */}
                <section className="hidden print:flex absolute inset-0 items-center justify-center pointer-events-none select-none z-0">
                  <div className="text-emerald-600/10 text-center border-[10px] border-emerald-600/10 text-5xl font-black uppercase tracking-widest px-10 py-5 rounded-3xl transform -rotate-30 select-none">
                    معتمد وصالح مدارج / Certified & Valid
                  </div>
                </section>

                {/* PRINT-ONLY CORNER VERIFICATION BADGE */}
                <section
                  className="hidden print:flex absolute top-6 left-6 items-center gap-1.5 border-2 border-emerald-500 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl font-sans font-black text-[9px] z-50 shadow-xs"
                  dir="rtl"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>
                    مستند رسمي معتمد وصالح - منصة مدارج / Certified & Valid Document - Mudarij OS
                  </span>
                </section>

                <div
                  className="h-4 w-full relative z-10"
                  style={{ backgroundColor: data.themeColor }}
                ></div>

                <div
                  className={`relative z-10 bg-[rgba(255,255,255,0.4)] transition-all duration-300 ${
                    docLayoutTheme === "wide" ? "p-16 space-y-8" : "p-12 space-y-6"
                  }`}
                >
                  {/* Last Modified & Author Indicator fetched from Database */}
                  {lastModifiedInfo && (
                    <section className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-50/90 border border-slate-200 rounded-2xl p-4 text-[10px] text-slate-600 font-sans gap-3 mb-6 shadow-xs z-50">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 block text-right">
                            آخر تعديل سحابي / Last Modified (Cloud)
                          </span>
                          <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-600 font-bold block text-left mt-0.5">
                            {lastModifiedInfo.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-700 block text-right">
                            المؤلف والموثق سحابياً / Document Author
                          </span>
                          <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-600 font-bold block text-left mt-0.5">
                            {lastModifiedInfo.author}
                          </span>
                        </div>
                      </div>
                    </section>
                  )}
                  {/* INTERACTIVE CONTROLS BAR (PRINT HIDDEN) - Statuses, Compare Toggle, Auto-Bind */}
                  <section className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 border-b pb-4 border-zinc-100 print:hidden select-none bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                    {/* Status Lifecycle toggles */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] sm:text-xs font-black text-zinc-500">
                        حالة المستند / Status:
                      </span>
                      <div className="flex items-center gap-1.5 font-sans">
                        {[
                          {
                            key: "Draft",
                            labelAr: "مسودة",
                            labelEn: "Draft",
                            activeColors: "bg-zinc-100 text-zinc-900 border-zinc-400",
                          },
                          {
                            key: "Pending",
                            labelAr: "قيد المراجعة",
                            labelEn: "Pending",
                            activeColors:
                              "bg-amber-100 text-amber-950 border-amber-400 animate-pulse",
                          },
                          {
                            key: "Signed",
                            labelAr: "معتمد وموقع",
                            labelEn: "Signed",
                            activeColors: "bg-emerald-100 text-emerald-950 border-emerald-400",
                          },
                        ].map((item) => {
                          const isActive = documentStatus === item.key;
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setDocumentStatus(item.key as any);
                                if (item.key === "Signed") {
                                  setIsSigned(true);
                                  handleSyncToPayroll("active");
                                } else {
                                  setIsSigned(false);
                                  handleSyncToPayroll("pending");
                                }
                                toast.success(`تغيرت حالة المستند إلى: ${item.labelAr}`);
                              }}
                              className={`px-3 py-1.5 text-xs font-black rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isActive
                                  ? `${item.activeColors} font-extrabold scale-105 shadow-sm`
                                  : "bg-white text-zinc-500 hover:bg-zinc-50 border-zinc-200"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.key === "Signed"
                                    ? "bg-emerald-600"
                                    : item.key === "Pending"
                                      ? "bg-amber-500"
                                      : "bg-zinc-500"
                                }`}
                              />
                              <span>{item.labelAr}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Compare Changes & Auto-Bind Settings */}
                    <div className="flex items-center gap-2.5 flex-wrap justify-end">
                      {/* Page Width View Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setPageWidthMode((prev) => (prev === "standard" ? "fit" : "standard"))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all cursor-pointer ${
                          pageWidthMode === "fit"
                            ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-xs"
                            : "bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${pageWidthMode === "fit" ? "bg-indigo-600 animate-pulse" : "bg-zinc-300"}`}
                        />
                        <span>
                          {pageWidthMode === "fit"
                            ? "تناسب كامل العرض / Fit Page Width"
                            : "عرض طبيعي (A4) / Standard View"}
                        </span>
                      </button>

                      {/* Reset to Default Button */}
                      <button
                        type="button"
                        onClick={handleResetToDefault}
                        className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-105 text-rose-800 hover:text-rose-950 border border-rose-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-rose-600" />
                        <span>إعادة ضبط / Reset to Default</span>
                      </button>

                      {/* Compare Changes Toggle */}
                      <label className="relative inline-flex items-center cursor-pointer select-none border border-zinc-200 rounded-xl py-1.5 px-3 bg-white hover:bg-zinc-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isCompareChanges}
                          onChange={(e) => {
                            setIsCompareChanges(e.target.checked);
                            if (e.target.checked) {
                              toast.info(
                                "وضع مقارنة التغييرات نشط! مواءمة التعديلات الفردية مع قالب النظام الأصلي."
                              );
                            } else {
                              toast.info("تم العودة للعرض الطبيعي للمحتويات.");
                            }
                          }}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4.5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[17px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                        <span className="mr-2 text-[10px] font-black text-zinc-650">
                          مقارنة التغييرات / Compare
                        </span>
                      </label>

                      {/* Auto Bind Settings Button */}
                      <button
                        type="button"
                        onClick={handleAutoBindSettings}
                        className="flex items-center gap-1 bg-teal-50 hover:bg-teal-100 text-teal-850 hover:text-teal-950 border border-teal-200 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                      >
                        <span>ربط البيانات ⚡ Bind Settings</span>
                      </button>

                      {/* Print Button */}
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm"
                      >
                        <Printer className="w-3.5 h-3.5 text-zinc-300" />
                        <span>طباعة العقد / Print</span>
                      </button>

                      {/* Download as PDF Button */}
                      <button
                        type="button"
                        onClick={downloadContractAsPDF}
                        disabled={isExportingPDF}
                        className="flex items-center gap-1.5 bg-indigo-650 hover:bg-indigo-720 text-white px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer shadow-sm disabled:opacity-50"
                      >
                        {isExportingPDF ? (
                          <div className="w-3 h-3 border-2 border-white border-t-transparent animate-spin rounded-full" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-indigo-100" />
                        )}
                        <span>تحميل PDF / Export</span>
                      </button>
                    </div>
                  </section>

                  {/* QUICK-FIND CLAUSE SEARCH (PRINT HIDDEN / within #contract-document) */}
                  <section className="mb-6 relative print:hidden">
                    <input
                      type="text"
                      value={documentSearchQuery}
                      onChange={(e) => setDocumentSearchQuery(e.target.value)}
                      placeholder="ابحث سريعاً لتحديد وإبراز بنود معينة في هذا العقد... Quick-find to filter/highlight clauses..."
                      className="w-full text-xs p-3 pr-10 border border-zinc-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none text-right rounded-xl bg-white shadow-xs font-medium"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
                    {documentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setDocumentSearchQuery("")}
                        className="absolute left-3.5 top-2.5 text-xs text-zinc-400 hover:text-zinc-650 font-sans p-1 hover:bg-zinc-150 rounded"
                      >
                        ✕
                      </button>
                    )}
                  </section>

                  {/* Header Content */}
                  <div
                    className="flex justify-between items-center mb-12 border-b-2 pb-6"
                    style={{ borderColor: data.themeColor }}
                  >
                    <div
                      className="text-right flex-1 group relative cursor-pointer border border-transparent hover:border-amber-300 hover:bg-amber-50/15 p-2 rounded-2xl transition-all"
                      onClick={() => {
                        if (!isEditMode) {
                          setIsEditMode(true);
                          toast.info("تم تفعيل وضع التعديل المباشر / Inline Edit Mode Activated");
                        }
                      }}
                      title={
                        !isEditMode ? "انقر للتعديل المباشر / Click to edit inline" : undefined
                      }
                    >
                      {isEditMode ? (
                        <div className="space-y-1 max-w-[85%]">
                          <input
                            type="text"
                            value={editedTexts.titleAr}
                            onChange={(e) => handleEditedTextChange("titleAr", e.target.value)}
                            className="text-lg font-black border-b border-zinc-200 focus:border-[#10b981] outline-none text-right px-1 w-full bg-amber-50/50"
                          />
                          <input
                            type="text"
                            value={editedTexts.titleEn}
                            onChange={(e) => handleEditedTextChange("titleEn", e.target.value)}
                            className="text-xs font-bold border-b border-zinc-200 focus:border-[#10b981] outline-none text-left px-1 w-full bg-amber-50/50"
                            dir="ltr"
                          />
                        </div>
                      ) : (
                        <>
                          <h1
                            className="text-2xl font-black text-[#0f172a] flex items-center gap-2 flex-wrap"
                            style={{ color: data.themeColor, wordBreak: "break-word" }}
                          >
                            <span>
                              {isCompareChanges
                                ? renderInlineDiff(
                                    getGeneratedTexts(data).titleAr,
                                    editedTexts.titleAr,
                                    isCompareChanges,
                                    "rtl"
                                  )
                                : editedTexts.titleAr}
                            </span>
                            <span
                              title="عقد موثق ومعتمد قانونياً"
                              className="inline-flex items-center shrink-0"
                            >
                              <ShieldCheck className="w-5 h-5 text-emerald-600 inline-block align-middle" />
                            </span>
                          </h1>
                          <p className="text-sm font-bold text-[#64748b] mt-1 pr-32 sm:pr-0">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).titleEn,
                                  editedTexts.titleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.titleEn}
                          </p>
                          <span className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded font-sans select-none print:hidden">
                            تعديل / Edit ✎
                          </span>

                          {/* FLOATING ACTION BUTTONS GROUP NEXT TO TITLE */}
                          <span
                            onClick={(e) => e.stopPropagation()}
                            className="absolute left-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1.5 bg-white border border-zinc-200 p-1 rounded-xl shadow-md print:hidden z-50 transition-all scale-95 hover:scale-100"
                          >
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadContractAsPDF();
                              }}
                              disabled={isExportingPDF}
                              className="flex items-center justify-center p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              title="تحميل كـ PDF / Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toast.info(
                                  "جاري تحضير إرسال العقد عبر البريد الإلكتروني... Preparing Email..."
                                );
                                setTimeout(() => {
                                  toast.success(
                                    "تم إرسال نسخة موثقة من العقد إلى بريدك بنجاح! / Email sent successfully!"
                                  );
                                }, 1000);
                              }}
                              className="flex items-center justify-center p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              title="إرسال بالبريد / Send via Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.print();
                              }}
                              className="flex items-center justify-center p-1.5 text-zinc-700 hover:bg-zinc-100 rounded-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              title="طباعة العقد / Print"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      className="text-left select-none shrink-0 font-mono text-[10px] text-[#94a3b8]"
                      dir="ltr"
                    >
                      <p className="font-bold uppercase">
                        Document Ref: EV-{new Date().getTime().toString().slice(-6)}
                      </p>
                      <p className="font-bold mt-1">{new Date().toISOString().split("T")[0]}</p>

                      {/* STATUS INDICATOR BADGE FOR PRINT/PDF */}
                      <div className="text-right mt-1.5">
                        <span className="text-[8px] font-black border border-zinc-300 bg-zinc-50 px-1.5 py-0.5 rounded text-zinc-700">
                          STATUS: {documentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-8 text-sm text-justify">
                    {/* Employer Definition */}
                    <div
                      dir="rtl"
                      className={`space-y-2 border-r-4 pr-4 ${getSearchHighlightClass("party1TextAr", "party1TextEn")}`}
                      style={{ borderColor: data.themeColor }}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.party1TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("party1TitleAr", e.target.value)
                            }
                            className="font-bold border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50 text-xs"
                          />
                          <textarea
                            value={editedTexts.party1TextAr}
                            onChange={(e) => handleEditedTextChange("party1TextAr", e.target.value)}
                            className="w-full text-[11px] text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a]">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party1TitleAr,
                                  editedTexts.party1TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.party1TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party1TextAr,
                                  editedTexts.party1TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.party1TextAr}
                          </p>
                          <span className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            تعديل✎
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`space-y-2 border-l-4 pl-4 ${getSearchHighlightClass("party1TextAr", "party1TextEn")}`}
                      style={{ borderColor: data.themeColor }}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.party1TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("party1TitleEn", e.target.value)
                            }
                            className="font-bold border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50 text-xs"
                          />
                          <textarea
                            value={editedTexts.party1TextEn}
                            onChange={(e) => handleEditedTextChange("party1TextEn", e.target.value)}
                            className="w-full text-[11px] text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a]">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party1TitleEn,
                                  editedTexts.party1TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.party1TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party1TextEn,
                                  editedTexts.party1TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.party1TextEn}
                          </p>
                          <span className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            Edit✎
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Employee Definition */}
                    <div
                      dir="rtl"
                      className={`space-y-2 border-r-4 pr-4 mt-6 ${getSearchHighlightClass("party2TextAr", "party2TextEn")}`}
                      style={{ borderColor: data.themeColor }}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.party2TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("party2TitleAr", e.target.value)
                            }
                            className="font-bold border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50 text-xs"
                          />
                          <textarea
                            value={editedTexts.party2TextAr}
                            onChange={(e) => handleEditedTextChange("party2TextAr", e.target.value)}
                            className="w-full text-[11px] text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a]">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party2TitleAr,
                                  editedTexts.party2TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.party2TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party2TextAr,
                                  editedTexts.party2TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.party2TextAr}
                          </p>
                          <span className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            تعديل✎
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`space-y-2 border-l-4 pl-4 mt-6 ${getSearchHighlightClass("party2TextAr", "party2TextEn")}`}
                      style={{ borderColor: data.themeColor }}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.party2TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("party2TitleEn", e.target.value)
                            }
                            className="font-bold border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50 text-xs"
                          />
                          <textarea
                            value={editedTexts.party2TextEn}
                            onChange={(e) => handleEditedTextChange("party2TextEn", e.target.value)}
                            className="w-full text-[11px] text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a]">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party2TitleEn,
                                  editedTexts.party2TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.party2TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).party2TextEn,
                                  editedTexts.party2TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.party2TextEn}
                          </p>
                          <span className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            Edit✎
                          </span>
                        </div>
                      )}
                    </div>

                    {/* CLR: Divider */}
                    <div className="col-span-2 my-2 border-b border-[#f1f5f9]"></div>

                    {/* Clause 1: Position */}
                    <div
                      dir="rtl"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[1] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause1TextAr", "clause1TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause1TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause1TitleAr", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause1TextAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause1TextAr", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause1TitleAr,
                                  editedTexts.clause1TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause1TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause1TextAr,
                                  editedTexts.clause1TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause1TextAr}
                          </p>
                          <span className="absolute top-1 left-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            تعديل✎
                          </span>
                        </div>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[1] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause1TextAr", "clause1TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause1TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause1TitleEn", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause1TextEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause1TextEn", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setIsEditMode(true);
                            toast.info(
                              "تم تفعيل وضع التعديل المباشر لهذا البند / Edit mode enabled for this clause"
                            );
                          }}
                          className="cursor-pointer hover:bg-amber-50/15 hover:border-amber-300 border border-transparent p-2 -m-2 rounded-2xl transition-all group relative"
                          title="انقر للتعديل المباشر / Click to edit"
                        >
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause1TitleEn,
                                  editedTexts.clause1TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause1TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause1TextEn,
                                  editedTexts.clause1TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause1TextEn}
                          </p>
                          <span className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[9px] bg-amber-500 text-white px-1 py-0.5 rounded font-sans select-none print:hidden">
                            Edit✎
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Clause 2: Duration */}
                    <div
                      dir="rtl"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[2] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause2TextAr", "clause2TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause2TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause2TitleAr", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause2TextAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause2TextAr", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause2TitleAr,
                                  editedTexts.clause2TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause2TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause2TextAr,
                                  editedTexts.clause2TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause2TextAr}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[2] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause2TextAr", "clause2TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause2TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause2TitleEn", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause2TextEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause2TextEn", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause2TitleEn,
                                  editedTexts.clause2TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause2TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause2TextEn,
                                  editedTexts.clause2TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause2TextEn}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Clause 3: Compensation */}
                    <div
                      dir="rtl"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[3] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause3TextAr", "clause3TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause3TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause3TitleAr", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause3TextAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause3TextAr", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause3TitleAr,
                                  editedTexts.clause3TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause3TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause3TextAr,
                                  editedTexts.clause3TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause3TextAr}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[3] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause3TextAr", "clause3TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause3TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause3TitleEn", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause3TextEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause3TextEn", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded min-h-[90px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause3TitleEn,
                                  editedTexts.clause3TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause3TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause3TextEn,
                                  editedTexts.clause3TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause3TextEn}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Clause 4: Dispute Resolution (Dynamic) */}
                    <div
                      dir="rtl"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[4] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause4TextAr", "clause4TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause4TitleAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause4TitleAr", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-right bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause4TextAr}
                            onChange={(e) =>
                              handleEditedTextChange("clause4TextAr", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded min-h-[70px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause4TitleAr,
                                  editedTexts.clause4TitleAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause4TitleAr}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium bg-[#f8fafc] p-2 rounded border border-[#f1f5f9] whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause4TextAr,
                                  editedTexts.clause4TextAr,
                                  isCompareChanges,
                                  "rtl"
                                )
                              : editedTexts.clause4TextAr}
                          </p>
                        </>
                      )}
                    </div>
                    <div
                      dir="ltr"
                      className={`transition-all duration-1000 rounded-xl ${highlightedClauses[4] ? "bg-emerald-50/90 border-emerald-500 scale-[1.01] p-3 -m-3 shadow-lg z-10 border relative ring-4 ring-emerald-100" : "border-transparent border p-0"} ${getSearchHighlightClass("clause4TextAr", "clause4TextEn")}`}
                    >
                      {isEditMode ? (
                        <div className="space-y-1.5 w-full">
                          <input
                            type="text"
                            value={editedTexts.clause4TitleEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause4TitleEn", e.target.value)
                            }
                            className="font-black text-[#0f172a] border-b border-zinc-200 outline-none w-full text-left bg-amber-50/50"
                          />
                          <textarea
                            value={editedTexts.clause4TextEn}
                            onChange={(e) =>
                              handleEditedTextChange("clause4TextEn", e.target.value)
                            }
                            className="w-full text-xs text-[#334155] border p-1 rounded min-h-[70px] leading-relaxed outline-none focus:border-[#10b981] bg-amber-50/30"
                          />
                        </div>
                      ) : (
                        <>
                          <h3 className="font-black text-[#0f172a] mb-2">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause4TitleEn,
                                  editedTexts.clause4TitleEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause4TitleEn}
                          </h3>
                          <p className="text-[#334155] leading-relaxed font-medium bg-[#f8fafc] p-2 rounded border border-[#f1f5f9] whitespace-pre-line text-xs">
                            {isCompareChanges
                              ? renderInlineDiff(
                                  getGeneratedTexts(data).clause4TextEn,
                                  editedTexts.clause4TextEn,
                                  isCompareChanges,
                                  "ltr"
                                )
                              : editedTexts.clause4TextEn}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Signatures */}
                    <div className="col-span-2 mt-12 pt-8 border-t-2 border-[#f1f5f9] grid grid-cols-2 gap-8 relative">
                      <div
                        id="nafez-qr-container"
                        className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center justify-center opacity-40 mix-blend-multiply"
                      >
                        {isSigned && qrCodeData && <QRCodeSVG value={qrCodeData} size={84} />}
                      </div>

                      <div className="text-center flex flex-col items-center">
                        <p className="font-black text-[#0f172a] mb-5 text-xs">
                          الطرف الأول / First Party
                        </p>
                        {(!isExporting || !isSigned) && (
                          <div className="print:hidden">
                            <NafathAuth onVerified={handleSignatureSuccess} />
                          </div>
                        )}
                        {(isExporting || isSigned) && (
                          <p className="text-[10px] text-emerald-600 font-mono uppercase tracking-widest border border-emerald-200 bg-emerald-50 rounded-lg py-2 px-6">
                            Digital Signature Confirmed
                          </p>
                        )}
                      </div>

                      <div className="text-center flex flex-col items-center gap-2">
                        <p className="font-black text-[#0f172a] mb-5 text-xs">
                          الطرف الثاني / Second Party
                        </p>
                        {signatureImage ? (
                          <div className="relative border border-zinc-200 rounded-lg p-1.5 bg-zinc-50 flex flex-col items-center shadow-inner">
                            <img
                              src={signatureImage}
                              alt="Signature"
                              className="h-10 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSignatureImage(null);
                                saveContractToFirebase(null);
                              }}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs hover:bg-rose-600 print:hidden shadow-md cursor-pointer"
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <SignaturePad
                            onSave={(dataUrl) => {
                              setSignatureImage(dataUrl);
                              saveContractToFirebase(dataUrl);
                            }}
                            onClear={() => {
                              setSignatureImage(null);
                              saveContractToFirebase(null);
                            }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Designated Digital Signature Area with Dynamic Timestamp */}
                    <div className="col-span-2 mt-8 p-6 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-4 shadow-xs">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-zinc-200 pb-3 gap-2">
                        <div className="flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-black text-zinc-800">
                            منطقة التوقيع والتحكم بالمصادقة الرقمية / Cryptographic Authentication
                            Zone
                          </span>
                        </div>
                        <div
                          className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 bg-white border border-zinc-200 px-2.5 py-1 rounded-lg"
                          dir="ltr"
                        >
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                          <span>
                            TIMESTAMP: {currentTimestamp || "2026-06-21 12:58:18"} (MUDARIJ-UTC)
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6 text-right">
                        {/* Employer Digital Signature Place */}
                        <div className="border border-zinc-150 rounded-xl p-3 bg-white space-y-2 flex flex-col items-center justify-center min-h-[105px] relative">
                          <span className="text-[9px] font-black text-zinc-450 absolute top-2 right-2 border-b border-zinc-100 pb-0.5">
                            توقيع صاحب العمل • First Party
                          </span>

                          {isSigned ? (
                            <div className="flex flex-col items-center gap-1.5 mt-4">
                              <span className="text-[9px] text-emerald-700 font-black px-2.5 py-1 bg-emerald-50 border border-emerald-300 rounded-lg shadow-2xs">
                                ✓ مصادق رقميًا بالنفاذ الوطني / Nafath Active
                              </span>
                              <span className="text-[8px] text-zinc-400 font-mono">
                                HASH: SHA256-MDRJ-{data.employerCR || "CR-SEO-482"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 mt-4">
                              <span className="w-16 h-3.5 border-b border-dashed border-zinc-300"></span>
                              <span className="text-[9px] text-zinc-400 font-bold italic">
                                انتظار الموثق المالي / Awaiting Nafath Seal
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Employee Digital Signature Place */}
                        <div className="border border-zinc-150 rounded-xl p-3 bg-white space-y-2 flex flex-col items-center justify-center min-h-[105px] relative">
                          <span className="text-[9px] font-black text-zinc-450 absolute top-2 right-2 border-b border-zinc-100 pb-0.5">
                            توقيع الموظف • Second Party
                          </span>

                          {signatureImage ? (
                            <div className="flex flex-col items-center gap-1.5 mt-4">
                              <img
                                src={signatureImage}
                                alt="Employee Signature Pad Captured"
                                className="h-8 object-contain mix-blend-multiply"
                              />
                              <span className="text-[8px] text-zinc-400 font-mono">
                                REF: {data.employeeId || "EMP-ID-281"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1 mt-4">
                              <span className="w-16 h-3.5 border-b border-dashed border-zinc-300"></span>
                              <span className="text-[9px] text-zinc-400 font-bold italic">
                                انتظار التوقيع اليدوي / Awaiting Pad Signature
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="text-[9px] text-zinc-450 leading-relaxed text-center"
                        dir="rtl"
                      >
                        هذا التوقيع ملزم ونهائي لكلا الطرفين قانونًا ونظامًا، وتم التحقق الفوري من
                        سلامة الهوية التجارية ورمز الاستعلام عبر سجلات التدقيق الآمن لدى منصة مدارج.
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Verification Area with QR Code component rendered on demand */}
                  <div className="mt-14 pt-6 border-t border-[#f1f5f9] flex items-center justify-between gap-4">
                    <div className="text-right max-w-[70%]">
                      <p className="text-[10px] font-black text-[#0f172a] uppercase tracking-wider">
                        ترميز موثق رقمي ورابط التحقق / Cryptographic Verification Seal
                      </p>
                      <p className="text-[9px] text-[#64748b] mt-0.5 leading-relaxed">
                        هذا العقد معتمد وصادر عبر CLM الذكي وموثق رقميًا بالنفاذ الوطني. للتحقق من
                        سلامة العقد ومطابقته للأنظمة، يمكن استخدام رمز الاستجابة السريعة (QR Code).
                      </p>
                      {verificationLink ? (
                        <p className="text-[9px] text-teal-600 font-mono mt-1 select-all" dir="ltr">
                          {verificationLink}
                        </p>
                      ) : (
                        <button
                          onClick={generateVerificationLink}
                          type="button"
                          className="text-[10px] text-teal-600 font-bold hover:underline mt-1 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 transition-all print:hidden"
                        >
                          + إصدار رابط التحقق الفوري (QR On-Demand)
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col items-center select-none shrink-0">
                      {verificationLink ? (
                        <div className="bg-white p-1 border border-zinc-200 rounded-lg shadow-sm">
                          <QRCodeSVG value={verificationLink} size={64} />
                        </div>
                      ) : (
                        <div className="w-[64px] h-[64px] border border-dashed border-zinc-300 bg-zinc-50 rounded-lg flex items-center justify-center text-[9px] text-center text-zinc-400 font-mono select-none px-1 print:hidden">
                          بلا رمز / No QR
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SIDEBAR: Legal Clauses Sidebar Panel */}
          {isEditMode && !isDiffMode && (
            <div className="w-80 bg-white rounded-2xl p-5 shadow-lg border border-zinc-200 shrink-0 self-start animate-in slide-in-from-left duration-300 print:hidden h-auto space-y-4 text-right">
              <div className="flex items-center justify-between border-b pb-3 border-zinc-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-[#10b981]/10 text-[#10b981] rounded-lg">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-[#0f172a] block">
                      مكتبة البنود الإضافية
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-medium font-sans">
                      اختر بنداً لإدراجه فورياً
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time search in sidebar */}
              <div className="relative">
                <input
                  type="text"
                  value={clauseSearchQuery}
                  onChange={(e) => setClauseSearchQuery(e.target.value)}
                  placeholder="ابحث عن بند قانوني... Search..."
                  className="w-full text-xs p-2.5 pr-8.5 border border-zinc-200 rounded-xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none text-right bg-zinc-50 font-medium"
                />
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-3 pointer-events-none" />
                {clauseSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setClauseSearchQuery("")}
                    className="absolute left-2.5 top-2.5 text-zinc-400 hover:text-zinc-650 font-sans text-[9px] bg-zinc-200/50 hover:bg-zinc-200 px-1 rounded-md transition-all sm:block"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Clauses List */}
              <div className="space-y-4 divide-y divide-zinc-100 max-h-[420px] overflow-y-auto pr-1">
                {filteredClauses.length === 0 ? (
                  <div className="text-center py-6 text-zinc-400 text-xs font-medium">
                    لا يوجد بنود متطابقة للبحث / No clauses found
                  </div>
                ) : (
                  filteredClauses.map((clause) => (
                    <div key={clause.id} className="pt-3 first:pt-0 space-y-2">
                      <div>
                        <h5 className="font-bold text-xs text-[#0f172a]">{clause.titleAr}</h5>
                        <span className="text-[9px] text-[#64748b] font-mono block" dir="ltr">
                          {clause.titleEn}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 line-clamp-3 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 mt-1">
                        {clause.textAr}
                      </p>

                      {/* Inject selectors */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-black text-zinc-400 block">
                          :مكان الإدراج كبند إضافي
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => injectClause(clause, num as 1 | 2 | 3 | 4)}
                              className="py-1 text-[9px] font-black bg-zinc-100 hover:bg-[#10b981] hover:text-white rounded text-center transition-all border border-zinc-200 cursor-pointer"
                            >
                              البند {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* SIDE-DRAWER OVERLAY: Predefined Legal Clauses */}
          {isClausesDrawerOpen && (
            <div className="fixed inset-0 z-50 flex justify-end print:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/55 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
                onClick={() => setIsClausesDrawerOpen(false)}
              />

              {/* Drawer Panel */}
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-right animate-in slide-in-from-left md:slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                  <button
                    type="button"
                    onClick={() => setIsClausesDrawerOpen(false)}
                    className="p-1 px-2.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-xs rounded-lg transition-colors font-bold"
                  >
                    إغلاق × Close
                  </button>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-[#0f172a]">
                        ملحق البنود القانونية والإضافة
                      </h3>
                      <p className="text-[10px] text-zinc-500 font-medium">
                        اختر بنداً لإضافته مباشرة في بنود العقد
                      </p>
                    </div>
                  </div>
                </div>

                {/* Content / Clause items */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                  <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-xs text-amber-850 leading-relaxed font-sans">
                    💡 <strong>كيف تعمل الإضافة؟</strong> يمكنك اختيار أي بند كـ (السرية، القوة
                    القاهرة، الإنهاء...) ثم تحديد رقم البند المستهدف في العقد لدمجه فورياً وسيقوم
                    النظام بتعديل المحتوى وتحريمه.
                  </div>

                  {/* Real-time search in Drawer */}
                  <div className="relative">
                    <input
                      type="text"
                      value={clauseSearchQuery}
                      onChange={(e) => setClauseSearchQuery(e.target.value)}
                      placeholder="ابحث بالعنوان أو محتوى البند... Search clauses..."
                      className="w-full text-xs p-3 pr-9 border border-zinc-200 rounded-xl focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] outline-none text-right bg-zinc-50 font-medium"
                    />
                    <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-3.5 pointer-events-none" />
                    {clauseSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setClauseSearchQuery("")}
                        className="absolute left-3 top-3 text-zinc-400 hover:text-zinc-650 font-sans text-[10px] bg-zinc-200/50 hover:bg-zinc-200 px-1.5 py-0.5 rounded-md transition-all cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 divide-y divide-zinc-100">
                    {filteredClauses.length === 0 ? (
                      <div className="text-center py-10 text-zinc-400 text-xs font-semibold bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200">
                        لا يوجد بنود متطابقة لمدخلات البحث
                        <span className="block text-[10px] text-zinc-400 font-normal mt-1">
                          No matching clauses found
                        </span>
                      </div>
                    ) : (
                      filteredClauses.map((clause) => (
                        <div
                          key={clause.id}
                          className="pt-4 first:pt-0 space-y-3 animate-in fade-in duration-200"
                        >
                          <div>
                            <span className="text-[9px] font-black uppercase text-[#10b981] bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                              {clause.id}
                            </span>
                            <h4 className="font-extrabold text-xs text-[#0f172a]">
                              {clause.titleAr}
                            </h4>
                            <span
                              className="text-[10px] text-zinc-400 font-mono block mt-0.5"
                              dir="ltr"
                            >
                              {clause.titleEn}
                            </span>
                          </div>

                          <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-150 text-[11px] leading-relaxed text-zinc-600 space-y-2 font-sans">
                            <p className="font-medium text-right text-zinc-805">{clause.textAr}</p>
                            <p
                              className="font-mono text-left block text-zinc-450 border-t border-zinc-200 pt-1.5"
                              dir="ltr"
                            >
                              {clause.textEn}
                            </p>
                          </div>

                          {/* Selectors */}
                          <div className="space-y-1.5 bg-zinc-50/50 p-2.5 rounded-xl border border-zinc-100">
                            <span className="text-[9px] font-black text-zinc-400 block">
                              :دمج وإدراج في
                            </span>
                            <div className="grid grid-cols-4 gap-1.5 font-sans">
                              {[1, 2, 3, 4].map((num) => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => {
                                    injectClause(clause, num as any);
                                  }}
                                  className="py-1.5 text-[10px] font-black bg-white hover:bg-emerald-600 hover:text-white text-zinc-700 border border-zinc-200 rounded-lg text-center transition-all shadow-sm cursor-pointer"
                                >
                                  البند {num}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-zinc-50 border-t border-zinc-150 flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>PREDEFINED_CLAUSES v2.4</span>
                  <span>SaudiOS CLM Legal Engine</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
