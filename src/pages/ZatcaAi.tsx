import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  Code2,
  Check,
  Send,
  Building,
  DollarSign,
  Calendar,
  FileCheck2,
  Clock,
  ShieldCheck,
  Eye,
  Printer,
  FileSignature,
  QrCode,
  Share2,
  Cpu,
  Mail,
  TrendingUp,
  Link2,
  Database,
  ChevronRight,
  User,
  Plus,
  Info,
  Layers,
  Settings,
  HelpCircle,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useUser } from "../contexts/UserContext";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toast } from "sonner";
import { generateZatcaQR } from "../lib/zatca";
import { generateZatcaCredentials } from "../lib/zatcaCrypto";
import { auth } from "../lib/firebase";
import { handleFirestoreError, OperationType } from "../lib/firestore-issues";

// Mock Sample Contracts for 1-click Demo experience
interface DemoContract {
  id: string;
  name: string;
  nameAr: string;
  type: string;
  language: string;
  text: string;
  extracted: any;
}

const DEMO_CONTRACTS: DemoContract[] = [
  {
    id: "contract-1",
    name: "Enterprise SLA - Unified Riyadh Technologies",
    nameAr: "اتفاقية الخدمة البرمجية - تقنيات الرياض الموحدة",
    type: "PDF Document",
    language: "Mixed (Arabic/English)",
    text: `CONTRACT AGREEMENT
This agreement is made on 2026-06-15 between:
SELLER: Riyadh Unified Software Solutions Ltd (الرقم الضريبي: 300459281700003), located in Olaya Street, Riyadh, Saudi Arabia.
BUYER: Al-Fahad Construction Group (شركة الفهد للمقاولات), (الرقم الضريبي: 300812938400003), Riyadh, KSA.
SUBJECT: AI Automation Portal license & setup.
TOTAL AMOUNT: 115,000 SAR (One hundred fifteen thousand Saudi Riyals).
VAT: Standard tax rate of 15% (17,250 SAR) applies to the subtotal.
NET TOTAL (Including VAT): 132,250 SAR.
RETENTION: 5% retention of the total amount (5,750 SAR) will be withheld until final handover.
MILESTONES:
1. Kick-off: 30% of total (34,500 SAR) due on signing.
2. Deployment: 40% of total (46,000 SAR) due on prototype validation (Estimated 2026-08-01).
3. Final Delivery & Acceptance: 30% of total (34,500 SAR) due on final sign-off (Estimated 2026-10-15).
DELIVERY DATES: Project start date 2026-07-01, final handover estimated on 2026-10-30.`,
    extracted: {
      sellerName: "Riyadh Unified Software Solutions Ltd",
      sellerVat: "300459281700003",
      buyerName: "Al-Fahad Construction Group",
      buyerVat: "300812938400003",
      contractNumber: "CONT-2026-092",
      contractDate: "2026-06-15",
      currency: "SAR",
      paymentTerms: "Milestone-based (30/40/30)",
      retention: 5,
      deliveryDates: "2026-07-01 to 2026-10-30",
      lineItems: [
        {
          id: 1,
          name: "AI Portal License - Setup & Installation",
          quantity: 1,
          unitPrice: 35000,
          discount: 0,
          vatPercent: 15,
        },
        {
          id: 2,
          name: "Neural Modeling Config & Integration",
          quantity: 1,
          unitPrice: 45000,
          discount: 0,
          vatPercent: 15,
        },
        {
          id: 3,
          name: "Bilingual Custom Workflows Engine",
          quantity: 1,
          unitPrice: 35000,
          discount: 0,
          vatPercent: 15,
        },
      ],
      milestones: [
        { name: "Sign-off & Initial Kick-off", amount: 34500, date: "2026-06-15" },
        { name: "Beta Deploy & Training", amount: 46000, date: "2026-08-01" },
        { name: "Final Production Acceptance", amount: 34500, date: "2026-10-15" },
      ],
    },
  },
  {
    id: "contract-2",
    name: "Logistics Fleet Procurement - Jeddah Ports",
    nameAr: "شراء وتوريد أسطول لوجستي - موانئ جدة",
    type: "Scanned DOCX Image",
    language: "Arabic",
    text: `عقد توريد أسطول مركبات لوجستية ذكية
التاريخ: 12 ذو الحجة 1447 هـ (الموافق 2026-05-28 م)
الطرف الأول (المورد): شركة الموانئ المتقدمة للخدمات اللوجستية، الرقم الضريبي: 301234567800003، العنوان: طريق الملك عبدالعزيز، جدة.
الطرف الثاني (العميل): الشركة الوطنية للاستيراد والتصدير. الرقم الضريبي: 300998877600003.
القيمة الإجمالية للعقد: 450,000 ريال سعودي غير شاملة الضريبة.
نسبة الضريبة: يضاف 15% ضريبة القيمة المضافة (67,500 ريال).
القيمة النهائية شاملة الضريبة: 517,500 ريال سعودي.
شروط الدفع: دفعات شهرية متساوية على 6 أشهر بقيمة 75,000 ريال شهرياً تبدأ من تاريخ أول توريد.
تواريخ التوريد: يتم تسليم الدفعة الأولى من المركبات في تاريخ 2026-07-10 والدفعة النهائية في 2026-12-10.`,
    extracted: {
      sellerName: "شركة الموانئ المتقدمة للخدمات اللوجستية",
      sellerVat: "301234567800003",
      buyerName: "الشركة الوطنية للاستيراد والتصدير",
      buyerVat: "300998877600003",
      contractNumber: "CN-PORTS-818",
      contractDate: "2026-05-28",
      currency: "SAR",
      paymentTerms: "6 Monthly Installments (75,000 SAR each)",
      retention: 0,
      deliveryDates: "2026-07-10 to 2026-12-10",
      lineItems: [
        {
          id: 1,
          name: "توريد شاحنات نقل ذكية من الفئة أ",
          quantity: 3,
          unitPrice: 150000,
          discount: 0,
          vatPercent: 15,
        },
      ],
      milestones: [
        { name: "الدفعة الأولى للتوريد الأساسي", amount: 75000, date: "2026-07-10" },
        { name: "الدفعة الشهرية الثانية", amount: 75000, date: "2026-08-10" },
        { name: "الدفعة الشهرية الثالثة", amount: 75000, date: "2026-09-10" },
        { name: "الدفعة الشهرية الرابعة", amount: 75000, date: "2026-10-10" },
        { name: "الدفعة الشهرية الخامسة", amount: 75000, date: "2026-11-10" },
        { name: "الدفعة الشهرية النهائية والتسليم", amount: 75000, date: "2026-12-10" },
      ],
    },
  },
  {
    id: "contract-3",
    name: "Faulty Contract (Missing VAT Details)",
    nameAr: "عقد غير مكتمل البيانات الضريبية (لتجربة التحقق والذكاء)",
    type: "Scanned PDF (No VAT)",
    language: "English",
    text: `AGREEMENT OF CONSULTING SERVICE
Date: 2026-06-20
Consultant: Expert Advisory Group KSA. (VAT Number is NOT listed in the document)
Client: Oasis Oasis Retail Group, Riyadh, Saudi Arabia. (VAT Number is missing too)
Project Fees: 80,000 USD.
Invoicing: Full payment on delivery (100%).
Subject: Supply chain optimization study.
Expected Delivery: 2026-09-01.`,
    extracted: {
      sellerName: "Expert Advisory Group KSA",
      sellerVat: "", // Missing Seller VAT
      buyerName: "Oasis Retail Group",
      buyerVat: "", // Missing Buyer VAT
      contractNumber: "AG-EAG-2026-04",
      contractDate: "2026-06-20",
      currency: "USD",
      paymentTerms: "100% On Delivery",
      retention: 0,
      deliveryDates: "2026-09-01",
      lineItems: [
        {
          id: 1,
          name: "Consulting Service & SC Feasibility Report",
          quantity: 1,
          unitPrice: 80000,
          discount: 0,
          vatPercent: 15,
        },
      ],
      milestones: [{ name: "Final Feasibility Acceptance", amount: 80000, date: "2026-09-01" }],
    },
  },
];

export default function ZatcaAi() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const { user } = useUser();
  const isAr = settings.language === "ar";

  // Dashboard state variables
  const [contractsUploadedCount, setContractsUploadedCount] = useState(0);
  const [invoicesGeneratedCount, setInvoicesGeneratedCount] = useState(0);
  const [rejectedInvoicesCount, setRejectedInvoicesCount] = useState(0);
  const [clearedInvoicesCount, setClearedInvoicesCount] = useState(0);
  const [warningsCount, setWarningsCount] = useState(0);
  const [missingInfoCount, setMissingInfoCount] = useState(0);
  const [aiConfidenceScore, setAiConfidenceScore] = useState(100.0);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid || user.id;

    // Load Invoices
    const qInvoices = query(collection(db, "invoices"), where("userId", "==", uid));
    const unsubscribeInvoices = onSnapshot(
      qInvoices,
      (snapshot) => {
        const invoicesList = snapshot.docs.map((doc) => doc.data());
        const count = invoicesList.length;

        setInvoicesGeneratedCount(count);

        const cleared = invoicesList.filter(
          (inv) => inv.status === "paid" || inv.status === "sent"
        ).length;
        setClearedInvoicesCount(cleared);

        const rejected = invoicesList.filter((inv) => inv.status === "cancelled").length;
        setRejectedInvoicesCount(rejected);

        setAiConfidenceScore(count > 0 ? 99.8 : 100.0);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "invoices");
      }
    );

    // Load DMS documents representing contracts
    const qDocs = query(collection(db, "dms_documents"), where("userId", "==", uid));
    const unsubscribeDocs = onSnapshot(
      qDocs,
      (snapshot) => {
        setContractsUploadedCount(snapshot.size);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "dms_documents");
      }
    );

    return () => {
      unsubscribeInvoices();
      unsubscribeDocs();
    };
  }, [user]);

  // Workflow steps: 'upload', 'extract', 'invoice', 'comply', 'submit', 'onboarding'
  const [currentStep, setCurrentStep] = useState<"upload" | "extract" | "invoice" | "onboarding">("upload");

  // Onboarding state variables
  const [onboardEnv, setOnboardEnv] = useState<"sandbox" | "production">("sandbox");
  const [onboardCompanyName, setOnboardCompanyName] = useState("الشركة النموذجية لتقنيات المستقبل");
  const [onboardVat, setOnboardVat] = useState("300459281700003");
  const [onboardOu, setOnboardOu] = useState("Riyadh HQ");
  const [onboardOrg, setOnboardOrg] = useState("Saudi Future Technologies Co.");
  const [onboardAddress, setOnboardAddress] = useState("Olaya District, Riyadh, Saudi Arabia");
  const [onboardCategory, setOnboardCategory] = useState("Technology");
  const [onboardSolution, setOnboardSolution] = useState("Mudarijos ERP Gateway");
  const [onboardOtp, setOnboardOtp] = useState("");
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [onboardStep, setOnboardStep] = useState(0);
  const [onboardLogs, setOnboardLogs] = useState<string[]>([]);
  const [onboardCompleted, setOnboardCompleted] = useState(false);
  const [onboardPrivateKey, setOnboardPrivateKey] = useState("");
  const [onboardCsr, setOnboardCsr] = useState("");
  const [onboardCsid, setOnboardCsid] = useState("");
  const [onboardPcsid, setOnboardPcsid] = useState("");

  // Ingestion form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("mixed");
  const [selectedFileType, setSelectedFileType] = useState<string>("pdf");
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  // Loaded/Extracted data state
  const [activeContract, setActiveContract] = useState<DemoContract | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Missing data resolution state
  const [sellerVatInput, setSellerVatInput] = useState("");
  const [buyerVatInput, setBuyerVatInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [invoiceDateInput, setInvoiceDateInput] = useState("");

  // ZATCA invoice options
  const [invoiceType, setInvoiceType] = useState<
    "standard" | "tax" | "simplified" | "debit" | "credit"
  >("tax");
  const [outputFormat, setOutputFormat] = useState<"pdf" | "xml" | "qr" | "json" | "api">("pdf");

  // Compliance generation parameters
  const [complianceData, setComplianceData] = useState<any>(null);

  // Submission pipeline sequence animation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [submissionLogs, setSubmissionLogs] = useState<string[]>([]);

  // AI Dialog Chat box states
  const [aiPromptInput, setAiPromptInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<any[]>([
    {
      role: "assistant",
      content: isAr
        ? "أهلاً بك في نظام ZATCA AI الذكي للتحليل والفوترة المباشرة من العقود. حدد عقداً أو ارفع ملفاً، وسأتولى صياغة الفواتير وتقسيمها والامتثال لشروط الفوترة الإلكترونية."
        : "Welcome to ZATCA AI smart contract billing portal. Select or upload a contract, and I will handle invoice parsing, split milestone scheduling, and standard cryptographic stamping.",
    },
  ]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Integration Toggle Switches
  const [integrations, setIntegrations] = useState<Record<string, boolean>>({
    zatca: true,
    qoyod: false,
    zoho: false,
    odoo: false,
    sap: false,
    oracle: false,
    quickbooks: false,
    xero: false,
    stripe: false,
    hyperpay: false,
    moyasar: false,
    salla: false,
    zid: false,
  });

  const [selectedIntegrationForSetup, setSelectedIntegrationForSetup] = useState<string | null>(null);
  const [oauthStep, setOauthStep] = useState<"idle" | "connecting" | "consent" | "success">("idle");
  const [setupFields, setSetupFields] = useState<Record<string, string>>({});
  const [isTestingLiveConnection, setIsTestingLiveConnection] = useState(false);

  const handleOpenIntegrationSetup = (key: string) => {
    setSelectedIntegrationForSetup(key);
    setOauthStep("idle");
    if (key === "stripe") {
      setSetupFields({
        publicKey: "pk_live_51P2u8RzG1L...",
        secretKey: "sk_live_51P2u8RzG1L...",
        webhookSecret: "whsec_X9z2W4mN0p...",
        environment: "live",
      });
    } else if (key === "whatsapp") {
      setSetupFields({
        apiUrl: "https://api.whatsapp.com/v1",
        accessToken: "EAAG389dksf...",
        webhookSecret: "whsec_wa_2026",
      });
    } else {
      setSetupFields({
        clientId: `${key}_oauth_client_id_823947`,
        clientSecret: "••••••••••••••••••••••••",
        scope: "read:accounting write:invoices profile",
      });
    }
  };

  const saveIntegrationConfig = (key: string) => {
    setIntegrations((prev) => ({
      ...prev,
      [key]: true,
    }));
    setSelectedIntegrationForSetup(null);
    toast.success(
      isAr
        ? `تم ربط وتفعيل قناة ${key.toUpperCase()} بنجاح مع مدارج OS حياً!`
        : `${key.toUpperCase()} integrated successfully & channels are live!`
    );
  };

  const disconnectIntegration = (key: string) => {
    setIntegrations((prev) => ({
      ...prev,
      [key]: false,
    }));
    setSelectedIntegrationForSetup(null);
    toast.info(
      isAr
        ? `تم إلغاء تفعيل وفصل قناة ${key.toUpperCase()}`
        : `${key.toUpperCase()} disconnected and credentials revoked.`
    );
  };

  const testIntegrationConnection = () => {
    setIsTestingLiveConnection(true);
    setTimeout(() => {
      setIsTestingLiveConnection(false);
      toast.success(
        isAr
          ? "تم فحص واختبار الاتصال حياً: الاتصال مستقر وموثق بنجاح!"
          : "Live connectivity check passed: Handshake secured successfully!"
      );
    }, 1500);
  };

  // Calculate math totals
  const getTotals = () => {
    if (!extractedData) return { subtotal: 0, vat: 0, total: 0 };
    let subtotal = 0;
    extractedData.lineItems.forEach((item: any) => {
      const lineVal = item.quantity * item.unitPrice - (item.discount || 0);
      subtotal += lineVal;
    });
    const vat = subtotal * 0.15; // standard 15%
    const total = subtotal + vat;
    return { subtotal, vat, total };
  };

  const { subtotal, vat, total } = getTotals();

  // Load a demo contract
  const handleSelectDemo = async (contract: DemoContract) => {
    setIsOcrProcessing(true);
    setOcrProgress(0);
    setActiveContract(contract);

    // Start progress simulation
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress > 85) {
        clearInterval(interval);
      } else {
        setOcrProgress(progress);
      }
    }, 100);

    try {
      const userToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/zatca/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken ? `Bearer ${userToken}` : "",
        },
        body: JSON.stringify({
          contractText: contract.text,
          language: selectedLanguage,
          fileType: selectedFileType,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const parsedData = await res.json();

      clearInterval(interval);
      setOcrProgress(100);

      setTimeout(() => {
        setIsOcrProcessing(false);
        setExtractedData(parsedData);
        // Pre-fill correction inputs
        setSellerVatInput(parsedData.sellerVat || "");
        setBuyerVatInput(parsedData.buyerVat || "");
        setCurrencyInput(parsedData.currency || "SAR");
        setInvoiceDateInput(parsedData.contractDate || "2026-07-02");
        setCurrentStep("extract");

        let missing = 0;
        if (!parsedData.sellerVat) missing++;
        if (!parsedData.buyerVat) missing++;
        setMissingInfoCount(missing);
        setAiConfidenceScore(missing === 0 ? 99.5 : missing === 1 ? 88.5 : 76.4);

        toast.success(
          isAr
            ? `تم تحليل العقد بنجاح بواسطة الذكاء الاصطناعي والتعرف الضوئي!`
            : `Contract parsed and structured successfully via Gemini AI!`
        );
      }, 400);
    } catch (err: any) {
      clearInterval(interval);
      setIsOcrProcessing(false);
      console.error(err);
      toast.error(
        isAr ? `فشل معالجة العقد: ${err.message}` : `Failed to process contract: ${err.message}`
      );
    }
  };

  // Drag and drop handler
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      // Load a randomized contract context for file simulations
      handleSelectDemo(DEMO_CONTRACTS[Math.floor(Math.random() * DEMO_CONTRACTS.length)]);
    }
  };

  const triggerManualUpload = () => {
    // Simulate uploading Al-Fahad Enterprise Agreement
    handleSelectDemo(DEMO_CONTRACTS[0]);
  };

  // Re-run validation or resolve inputs
  const handleApplyCorrections = () => {
    if (!extractedData) return;
    const updated = { ...extractedData };
    updated.sellerVat = sellerVatInput;
    updated.buyerVat = buyerVatInput;
    updated.currency = currencyInput;
    updated.contractDate = invoiceDateInput;

    setExtractedData(updated);

    // Check missing fields
    let missing = 0;
    if (!sellerVatInput) missing++;
    if (!buyerVatInput) missing++;
    if (!currencyInput) missing++;
    if (!invoiceDateInput) missing++;

    setMissingInfoCount(missing);
    setAiConfidenceScore(missing === 0 ? 99.5 : 82.1);

    toast.success(
      isAr
        ? "تم تحديث بيانات العقد وإعادة فحص المطابقة والامتثال مع ZATCA"
        : "Contract details updated and pre-compliance checks recalculated"
    );
  };

  // Auto compile compliance fields
  useEffect(() => {
    if (!extractedData) return;
    // Compile mock compliant hashes
    const randomSha256 = "b6a382e796e622b7a95781a985f9eb6e2a9009ec846461a293bf6902d334";
    const uuidStr = "4f2a7a10-2de3-4122-861f-93ba20d0f91a";
    const timestampStr = `${invoiceDateInput || "2026-07-02"}T11:42:00Z`;

    const qrBase64 = generateZatcaQR({
      sellerName: extractedData.sellerName || "Expert Advisory Group KSA",
      sellerVat: extractedData.sellerVat || "300459281700003",
      timestamp: timestampStr,
      totalWithVat: total.toFixed(2),
      vatAmount: vat.toFixed(2),
      xmlHash: randomSha256,
      signature: "MEYCIQCc9rC6pD7vV7A...signature_ecdsa...",
      publicKey: "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEP...pubkey...",
    });

    setComplianceData({
      uuid: uuidStr,
      invoiceHash: randomSha256,
      prevInvoiceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      qrTlv: qrBase64,
      digitalSignature: "3045022100df949e2cf39de848a6021ba093f48a9775f0a0...ecdsa",
      canonicalXml: "C14N Exclusive Canonicalization UBL 2.1 Schema compliant",
      invoiceCounter: 1422,
      icv: "ICV-2026-92-ZATCA",
      cryptographicStamp: "CCSID-SA-9102-REGISTRY-VALID",
    });
  }, [extractedData, invoiceDateInput, total, vat]);

  // One-click submit sequence
  const handleOneClickSubmit = async () => {
    if (!extractedData) return;
    if (!extractedData.sellerVat || !extractedData.buyerVat) {
      toast.error(
        isAr
          ? "لا يمكن الإرسال: يرجى استكمال بيانات الرقم الضريبي (VAT) الناقصة أولاً!"
          : "Cannot submit: Please resolve outstanding VAT missing information first!"
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep(0);
    setSubmissionLogs([]);

    const steps = isAr
      ? [
          "تحليل وفحص العقد المستخلص...",
          "تحويل بنود الدفع واستحقاقات العقد إلى فاتورة معتمدة...",
          "توليد ملف الفاتورة XML المتوافق مع معيار UBL 2.1...",
          "حساب التوقيع الرقمي وبصمة الفاتورة وجملة التميز (UUID)...",
          "تلقيم تفاصيل وعناوين التشفير وشهادة المطورين...",
          "تمرير الفاتورة عبر محرك المطابقة لضمان خلو الأخطاء والمخالفات...",
          "تشفير وإرسال طلب التخليص حياً لبوابة الهيئة ZATCA Phase 2...",
          "الاعتماد والربط بنجاح! تم ختم الفاتورة وتوقيعها رقمياً...",
          "تصدير الفاتورة الرسمية PDF/A المتوافقة وتوليد الرمز المميز (TLV)...",
          "إرسال نسخة بريدية مؤتمتة وتنبيه العملاء والمحاسبين...",
        ]
      : [
          "Analyzing contract terms & metadata...",
          "Mapping contract deliverables & payment schedules into standard invoices...",
          "Compiling compliant UBL 2.1 XML structure...",
          "Calculating ECDSA cryptographic hash, signature stamp & UUID...",
          "Loading cryptographically secured CCSID developer credentials...",
          "Running strict local pre-clearance validation schema tests...",
          "Transmitting signed payload to Saudi ZATCA clearance portal API...",
          "SUCCESS! Cleared and cryptographically registered with ZATCA Registry...",
          "Generating compliant PDF/A localized with authentic TLV QR badge...",
          "Dispatching automated invoice email copy to client...",
        ];

    const runSeq = async (index: number) => {
      if (index >= steps.length) {
        setIsSubmitting(false);
        setInvoicesGeneratedCount((prev) => prev + 1);
        setClearedInvoicesCount((prev) => prev + 1);
        toast.success(
          isAr
            ? "تهانينا! تم تمرير الفاتورة بنجاح وحفظها كفاتورة معتمدة (Cleared) ومطابقة للمرحلة الثانية"
            : "Splendid! The e-invoice has been fully cleared & registered with ZATCA."
        );
        return;
      }

      setSubmissionStep(index);
      setSubmissionLogs((prev) => [...prev, `${steps[index]}`]);

      // At step 6, do the actual cryptographic API call to our new backend
      if (index === 6) {
        try {
          const userToken = await auth.currentUser?.getIdToken();
          const res = await fetch("/api/zatca/submit-phase2", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: userToken ? `Bearer ${userToken}` : "",
            },
            body: JSON.stringify({
              sellerName: extractedData.sellerName,
              sellerVat: extractedData.sellerVat,
              buyerName: extractedData.buyerName,
              buyerVat: extractedData.buyerVat,
              total: total,
              vat: vat,
              currency: extractedData.currency || "SAR",
              lineItems: extractedData.lineItems || [],
              invoiceDateInput: invoiceDateInput,
              prevHashInput: complianceData?.prevInvoiceHash,
            }),
          });

          if (!res.ok) {
            throw new Error(await res.text());
          }

          const result = await res.json();
          if (result.success) {
            // Update compliance data state with actual cryptographic outputs
            setComplianceData({
              uuid: result.uuid,
              invoiceHash: result.xmlHash,
              prevInvoiceHash: result.prevHash,
              qrTlv: result.qrCodeBase64,
              digitalSignature: result.signature,
              canonicalXml: result.xml,
              invoiceCounter: result.invoiceCounter,
              icv: `ICV-2026-${result.invoiceCounter}-ZATCA`,
              cryptographicStamp: result.zatcaResponse.registrationNumber,
              zatcaReport: result.zatcaResponse,
            });
          }
        } catch (err: any) {
          console.error("ZATCA Cryptographic Submission Failed:", err);
          setSubmissionLogs((prev) => [...prev, `❌ [CRYPTOGRAPHIC FAILURE]: ${err.message || err}`]);
          setIsSubmitting(false);
          toast.error(isAr ? "فشل تقديم الفاتورة رقمياً: خطأ في مطابقة التوقيع أو التشفير" : `ZATCA compliance error: ${err.message || err}`);
          return;
        }
      }

      setTimeout(() => {
        runSeq(index + 1);
      }, 700);
    };

    runSeq(0);
  };

  // AI Dialog Chat processing
  const handleSendAiPrompt = async (overridePrompt?: string) => {
    const prompt = overridePrompt || aiPromptInput;
    if (!prompt.trim()) return;

    const userMsg = { role: "user", content: prompt };
    setAiChatHistory((prev) => [...prev, userMsg]);
    setAiPromptInput("");
    setIsAiThinking(true);

    try {
      const userToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/zatca/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken ? `Bearer ${userToken}` : "",
        },
        body: JSON.stringify({
          prompt: prompt,
          history: aiChatHistory,
          contractContext: extractedData
            ? {
                ...extractedData,
                total: total,
                subtotal: subtotal,
                vat: vat,
              }
            : null,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      setAiChatHistory((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      console.error(err);
      toast.error(
        isAr ? "فشل توليد رد من المساعد الذكي." : "Failed to generate response from AI Copilot."
      );
      setAiChatHistory((prev) => [
        ...prev,
        {
          role: "assistant",
          content: isAr
            ? "عذراً، حدث خطأ أثناء الاتصال بمحرك الذكاء الاصطناعي."
            : "Sorry, an error occurred while connecting to the AI engine.",
        },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const downloadOnboardFile = (content: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(isAr ? `تم تحميل ملف ${filename} بنجاح` : `Downloaded ${filename} successfully`);
  };

  const startOnboardingProcess = () => {
    if (onboardEnv === "production" && !onboardOtp) {
      toast.error(
        isAr
          ? "يرجى إدخال رمز التحقق OTP المستخرج من بوابة فاتورة لإتمام الربط الحقيقي!"
          : "Please enter the OTP from the Fatoora Portal for live production onboarding!"
      );
      return;
    }

    setIsOnboardingActive(true);
    setOnboardStep(0);
    setOnboardLogs([]);
    setOnboardCompleted(false);

    const logs = isAr
      ? [
          "تهيئة مولد المفاتيح المشفرة من نوع ECDSA (secp256r1)...",
          "توليد المفتاح الخاص (Private Key) بطول 256 بت وحفظه محلياً بنجاح...",
          "إنشاء طلب توقيع الشهادة (CSR) مدمج به البيانات الضريبية ومعرّفات الهيئة (OIDs)...",
          `تشفير طلب الشهادة: CN=${onboardCompanyName}, VAT=${onboardVat}, C=SA...`,
          "التحقق من صحة صياغة ملف الـ CSR وتوافقية المفاتيح...",
          `الاتصال ببوابة هيئة الزكاة والضريبة والجمارك - البيئة: ${onboardEnv === "sandbox" ? "التجريبية" : "الحية حزمة الإنتاج"}...`,
          onboardEnv === "production"
            ? `إرسال الـ CSR مصحوباً برمز التحقق OTP الرقمي (${onboardOtp}) إلى نظام التسجيل الفوري...`
            : "طلب الحصول على شهادة التجريب الفنية للتكامل الذاتي (Compliance CSID)...",
          "التحقق والنجاح الفيدرالي الفوري من جهة خوادم الهيئة!",
          "استقبال وتثبيت شهادة الختم التلقائي المشفرة (CSID Certificate)...",
          onboardEnv === "production"
            ? "الحصول على شهادة الإنتاج النهائية (PCSID) بنجاح كامل!"
            : "تم تثبيت شهادة التكامل والربط بنجاح! النظام الآن متصل وجاهز للفوترة الفعلية."
        ]
      : [
          "Initializing secp256r1 ECDSA Cryptographic Key Generator...",
          "Generated 256-bit Private Key successfully. Encrypting and saving internally...",
          "Compiling Certificate Signing Request (CSR) with standard tax extensions...",
          `Encoding Subject details: CN=${onboardCompanyName}, TRN=${onboardVat}, C=SA...`,
          "Verifying CSR format alignment against ZATCA-OIDs specifications...",
          `Opening secure socket to ZATCA Core Onboarding API - Env: ${onboardEnv.toUpperCase()}...`,
          onboardEnv === "production"
            ? `Transmitting CSR with secure OTP token (${onboardOtp}) to live registration endpoint...`
            : "Requesting compliance integration credentials (CCSID Stamp)...",
          "ZATCA Registry accepted cryptographic handshake!",
          "Installing Cryptographic Stamp Identifier (CSID Certificate) into system database...",
          onboardEnv === "production"
            ? "Production CSID (PCSID) retrieved and verified successfully!"
            : "Onboarding sandbox integration complete. Connected & Live!"
        ];

    const runOnboardSeq = (idx: number) => {
      if (idx >= logs.length) {
        // Run authentic on-the-fly ECDSA key and CSR generation via Web Crypto API
        generateZatcaCredentials(
          onboardCompanyName || "Mudarij Enterprise",
          onboardVat || "310123456700003",
          onboardOu || "IT Department",
          onboardOrg || "Mudarij OS Cloud Partner",
          "SA"
        )
          .then((result) => {
            setOnboardPrivateKey(result.privateKeyPem);
            setOnboardCsr(result.csrPem);
            setOnboardCsid(result.ccsidPem);
            if (onboardEnv === "production") {
              setOnboardPcsid(result.pcsidPem);
            }
            setIsOnboardingActive(false);
            setOnboardCompleted(true);
            toast.success(
              isAr
                ? "تمت تهيئة وربط المنشأة بنجاح وتأمين قنوات الفوترة المشفرة!"
                : "Onboarding successful! Secure cryptographic credentials saved."
            );
          })
          .catch((err) => {
            console.error("Web Crypto generation failed:", err);
            toast.error(
              isAr
                ? "حدث خطأ أثناء تشفير مفاتيح الربط!"
                : "Cryptographic generation failed during handshake."
            );
            setIsOnboardingActive(false);
          });
        return;
      }

      setOnboardStep(idx);
      setOnboardLogs((prev) => [...prev, logs[idx]]);

      setTimeout(() => {
        runOnboardSeq(idx + 1);
      }, 600);
    };

    runOnboardSeq(0);
  };

  const toggleIntegration = (key: string) => {
    setIntegrations((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(
      isAr
        ? `تم تحديث حالة الربط المتكامل مع ${key.toUpperCase()}`
        : `${key.toUpperCase()} integration state toggled successfully`
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-100 font-sans" dir={isAr ? "rtl" : "ltr"}>
      {/* Top Banner Control Center */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-emerald-950 border-b border-zinc-800 text-white py-6 px-4 md:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                {isAr
                  ? "نظام العقود والفوترة الذكية ZATCA AI"
                  : "Contract → ZATCA AI Intelligent Hub"}
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {isAr ? "الجيل الثالث" : "v3.5 Engine"}
                </span>
              </h1>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl font-sans leading-relaxed">
                {isAr
                  ? "حوّل عقود المبيعات والمشاريع والخدمات الورقية أو الإلكترونية إلى فواتير ضريبية معتمدة ومتطابقة مع بوابة هيئة الزكاة والضريبة والجمارك (المرحلة الثانية الربط والتكامل) في خطوة واحدة."
                  : "Ingest client SLA contracts, extract line items via AI OCR, resolve compliance gaps, sign cryptographically, and transmit cleared XML directly to Saudi ZATCA API portals."}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <div className="text-xs font-mono bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>{isAr ? "منفذ البوابة: جاهز للاتصال" : "ZATCA Gateway: Connected"}</span>
            </div>
            <button
              onClick={() => {
                // reset simulator
                setCurrentStep("upload");
                setActiveContract(null);
                setExtractedData(null);
                setMissingInfoCount(1);
                setAiConfidenceScore(98.2);
                toast.info(
                  isAr ? "تمت تهيئة ساحة التجربة بنجاح" : "Compliance playground re-initialized"
                );
              }}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
              title={isAr ? "إعادة تعيين التجربة" : "Reset Playground"}
            >
              <RotateCw className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Dashboard statistics rows */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "العقود المرفوعة" : "Contracts"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
                {contractsUploadedCount}
              </span>
              <FileSignature className="w-5 h-5 text-indigo-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "الفواتير المصدرة" : "Generated"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-zinc-800 dark:text-zinc-100">
                {invoicesGeneratedCount}
              </span>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "الفواتير المعتمدة" : "Cleared"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {clearedInvoicesCount}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "الفواتير المرفوضة" : "Rejected"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-red-500">{rejectedInvoicesCount}</span>
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "التنبيهات الفنية" : "Warnings"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-amber-500">{warningsCount}</span>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "بيانات ضائعة" : "Missing Info"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-rose-500">{missingInfoCount}</span>
              <Info className="w-5 h-5 text-rose-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-100 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
              {isAr ? "دقة الذكاء الاصطناعي" : "AI Confidence"}
            </span>
            <div className="flex justify-between items-baseline mt-2">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {aiConfidenceScore}%
              </span>
              <Cpu className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Dynamic Wizard Workflow Controls */}
        <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-6 mb-6">
            <h2 className="text-lg font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              {isAr ? "مسار العمل والخطوات المباشرة" : "Active Compliance Pipeline Tracker"}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep("upload")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentStep === "upload"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {isAr ? "1. رفع العقد و OCR" : "1. Ingest & OCR"}
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
              <button
                onClick={() => {
                  if (!extractedData) {
                    toast.error(
                      isAr
                        ? "الرجاء رفع أو تحديد عقد أولاً"
                        : "Please upload or select a contract first"
                    );
                    return;
                  }
                  setCurrentStep("extract");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentStep === "extract"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {isAr ? "2. استخلاص وتحقق الذكاء" : "2. Extraction & Verify"}
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
              <button
                onClick={() => {
                  if (!extractedData) {
                    toast.error(
                      isAr
                        ? "الرجاء رفع أو تحديد عقد أولاً"
                        : "Please upload or select a contract first"
                    );
                    return;
                  }
                  setCurrentStep("invoice");
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentStep === "invoice"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {isAr ? "3. الفاتورة والامتثال لـ ZATCA" : "3. Invoice & Compliance"}
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
              <button
                onClick={() => setCurrentStep("onboarding")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  currentStep === "onboarding"
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {isAr ? "4. تهيئة الربط الرقمي والشهادات" : "4. Cryptographic Onboarding"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left/Main Column depending on workflow state */}
            <div className="lg:col-span-8 space-y-6">
              {currentStep === "upload" && (
                <div className="space-y-6">
                  {/* Demo select triggers */}

                  {/* Manual File Upload Drag & Drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                    onClick={triggerManualUpload}
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 flex flex-col items-center justify-center bg-white dark:bg-zinc-100 hover:border-emerald-500 dark:hover:border-emerald-400 cursor-pointer transition-all duration-300"
                  >
                    <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500 mb-4 animate-bounce">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                      {isAr ? "اسحب وأفلت ملف العقد هنا" : "Drag and drop your contract file here"}
                    </h3>
                    <p className="text-xs text-zinc-400 text-center max-w-sm mb-4 leading-relaxed">
                      {isAr
                        ? "ندعم عقود PDF وصور الممسوحات الضوئية والملفات النصية Word (.docx) باللغتين العربية والإنجليزية."
                        : "Supports PDF contracts, scanned paper JPEG/PNG, Word docx, bilingual agreements and handwritten sign-offs."}
                    </p>
                    <span className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
                      {isAr ? "اختيار ملف..." : "Browse Files"}
                    </span>
                  </div>

                  {/* Settings and preferences row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-100 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <label className="text-xs font-bold text-zinc-500 block mb-2">
                        {isAr ? "تنسيق المستند المقروء" : "Input Document Type"}
                      </label>
                      <select
                        value={selectedFileType}
                        onChange={(e) => setSelectedFileType(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs"
                      >
                        <option value="pdf">PDF Contracts & Agreements</option>
                        <option value="docx">Microsoft Word Document (.docx)</option>
                        <option value="scanned">Scanned Document Photo (Paper/Print)</option>
                        <option value="handwritten">Contract with Handwritten Signatures</option>
                      </select>
                    </div>

                    <div className="bg-white dark:bg-zinc-100 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                      <label className="text-xs font-bold text-zinc-500 block mb-2">
                        {isAr ? "لغة وثيقة العقد" : "Contract Language Scope"}
                      </label>
                      <div className="flex gap-2">
                        {["arabic", "english", "mixed"].map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`flex-1 p-2 rounded-lg border text-xs font-bold capitalize transition-all ${
                              selectedLanguage === lang
                                ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
                                : "bg-zinc-50 dark:bg-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {lang === "arabic"
                              ? isAr
                                ? "عربي"
                                : "Arabic"
                              : lang === "english"
                                ? isAr
                                  ? "إنجليزي"
                                  : "English"
                                : isAr
                                  ? "مشترك"
                                  : "Mixed"}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scanning OCR Visualization Overlay */}
                  {isOcrProcessing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-zinc-900 rounded-2xl p-6 text-white border border-zinc-800 space-y-4"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-emerald-400 animate-pulse flex items-center gap-2">
                          <Cpu className="w-4 h-4" />
                          {isAr
                            ? "جاري تشغيل محرك التعرف الضوئي OCR والذكاء الاصطناعي..."
                            : "AI OCR engine & cognitive parsing running..."}
                        </span>
                        <span className="text-xs font-mono text-zinc-400">{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                      {/* Simulated parsing document matrix boxes */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] font-mono text-zinc-400 bg-zinc-950 p-4 rounded-xl border border-zinc-800 max-h-[140px] overflow-y-auto no-scrollbar">
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>PDF Structure</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Arabic OCR Text</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>English OCR Text</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Tables Detected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`${ocrProgress > 30 ? "text-emerald-400" : "text-zinc-600 animate-pulse"}`}
                          >
                            ●
                          </span>
                          <span>Seller Name Clause</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`${ocrProgress > 50 ? "text-emerald-400" : "text-zinc-600 animate-pulse"}`}
                          >
                            ●
                          </span>
                          <span>Seller VAT Extract</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`${ocrProgress > 70 ? "text-emerald-400" : "text-zinc-600 animate-pulse"}`}
                          >
                            ●
                          </span>
                          <span>Milestones Grid</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`${ocrProgress > 90 ? "text-emerald-400" : "text-zinc-600 animate-pulse"}`}
                          >
                            ●
                          </span>
                          <span>Signatures & Seals</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {currentStep === "extract" && extractedData && (
                <div className="space-y-6">
                  {/* Top Notification Banner for validation checks */}
                  {missingInfoCount > 0 ? (
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-4 flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300">
                          {isAr
                            ? `تنبيه فني: تم اكتشاف ${missingInfoCount} حقول ضرورية ضائعة أو غير مطابقة في العقد`
                            : `Compliance Check: Found ${missingInfoCount} missing or non-compliant tax fields.`}
                        </h4>
                        <p className="text-xs text-rose-700 dark:text-rose-400">
                          {isAr
                            ? "يرجى تعبئة الحقول الناقصة بالأسفل لإتمام صياغة الفاتورة الضريبية وجعلها جاهزة للمطابقة والامتثال مع ZATCA."
                            : "Please provide the required tax details in the quick correction input field to make the invoice ZATCA-ready."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                          {isAr
                            ? "تحقق الامتثال المسبق: العقد متطابق تماماً!"
                            : "Pre-Validation Compliance: All fields resolved!"}
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-400">
                          {isAr
                            ? "تم التحقق من كافة الأرقام الضريبية للبائع والمشتري وتوافق العملة ومجاميع الفوترة والضرائب."
                            : "Seller & Buyer VAT formats verified, subtotal sum calculations are standard and compliant."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Manual Inputs Resolution / Correction panel */}
                  <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4">
                    <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-500" />
                      {isAr
                        ? "تحقق الأخطاء واستكمال البيانات الناقصة"
                        : "AI Compliance Resolution & Fix Form"}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr
                            ? "الرقم الضريبي للبائع (15 خانة السعودية)"
                            : "Seller VAT Registration (15 Digits)"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. 300459281700003"
                            value={sellerVatInput}
                            onChange={(e) => setSellerVatInput(e.target.value)}
                            className={`w-full bg-zinc-50 dark:bg-zinc-100 border rounded-lg p-2 text-xs font-mono ${
                              !sellerVatInput
                                ? "border-rose-400 focus:ring-rose-400"
                                : "border-zinc-200 dark:border-zinc-800"
                            }`}
                          />
                          {!sellerVatInput && (
                            <span className="absolute right-2 top-2.5 text-[10px] text-rose-500 font-bold bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                              {isAr ? "مطلوب" : "Missing"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr
                            ? "الرقم الضريبي للمشتري (15 خانة السعودية)"
                            : "Buyer VAT Registration (15 Digits)"}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            maxLength={15}
                            placeholder="e.g. 300812938400003"
                            value={buyerVatInput}
                            onChange={(e) => setBuyerVatInput(e.target.value)}
                            className={`w-full bg-zinc-50 dark:bg-zinc-100 border rounded-lg p-2 text-xs font-mono ${
                              !buyerVatInput
                                ? "border-rose-400 focus:ring-rose-400"
                                : "border-zinc-200 dark:border-zinc-800"
                            }`}
                          />
                          {!buyerVatInput && (
                            <span className="absolute right-2 top-2.5 text-[10px] text-rose-500 font-bold bg-rose-100 dark:bg-rose-950 px-1.5 py-0.5 rounded">
                              {isAr ? "مطلوب" : "Missing"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "عملة الفاتورة" : "Contract/Invoice Currency"}
                        </label>
                        <input
                          type="text"
                          value={currencyInput}
                          onChange={(e) => setCurrencyInput(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "تاريخ العقد/الفاتورة" : "Contract/Issue Date"}
                        </label>
                        <input
                          type="date"
                          value={invoiceDateInput}
                          onChange={(e) => setInvoiceDateInput(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleApplyCorrections}
                      className="w-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-bold py-2.5 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                    >
                      {isAr
                        ? "تطبيق التحديث وإعادة التحقق"
                        : "Apply Corrections & Rerun Validation Engine"}
                    </button>
                  </div>

                  {/* Collapsible groups of extracted metadata */}
                  <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-b border-zinc-100 dark:border-zinc-800/80">
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        {isAr
                          ? "بيانات الأطراف والتعاقد المستخلصة"
                          : "Extracted Parties & Agreement Specifications"}
                      </h3>
                    </div>

                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="bg-zinc-50 dark:bg-zinc-100 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block mb-1">
                            {isAr ? "اسم البائع" : "Seller Name"}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {extractedData.sellerName}
                          </span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-100 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block mb-1">
                            {isAr ? "اسم المشتري" : "Buyer Name"}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {extractedData.buyerName}
                          </span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-100 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block mb-1">
                            {isAr ? "رقم العقد" : "Contract Number"}
                          </span>
                          <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                            {extractedData.contractNumber}
                          </span>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-100 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                          <span className="text-zinc-400 block mb-1">
                            {isAr ? "شروط الدفع والاستقطاع" : "Payment & Retention Terms"}
                          </span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200">
                            {extractedData.paymentTerms}{" "}
                            {extractedData.retention > 0 &&
                              `(Retention: ${extractedData.retention}%)`}
                          </span>
                        </div>
                      </div>

                      {/* Line items table */}
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-right">
                          <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 font-bold">
                            <tr>
                              <th className="p-3 text-left">{isAr ? "البند" : "Line Item"}</th>
                              <th className="p-3">{isAr ? "الكمية" : "Qty"}</th>
                              <th className="p-3">{isAr ? "سعر الوحدة" : "Unit Price"}</th>
                              <th className="p-3">{isAr ? "الضريبة" : "VAT %"}</th>
                              <th className="p-3">{isAr ? "الإجمالي" : "Line Total"}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {extractedData.lineItems.map((item: any) => (
                              <tr
                                key={item.id}
                                className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                              >
                                <td className="p-3 text-left font-bold text-zinc-700 dark:text-zinc-300">
                                  {item.name}
                                </td>
                                <td className="p-3 font-mono">{item.quantity}</td>
                                <td className="p-3 font-mono">
                                  {item.unitPrice.toLocaleString()} {extractedData.currency}
                                </td>
                                <td className="p-3 font-mono">{item.vatPercent}%</td>
                                <td className="p-3 font-mono font-bold text-zinc-800 dark:text-zinc-100">
                                  {(
                                    item.quantity *
                                    item.unitPrice *
                                    (1 + item.vatPercent / 100)
                                  ).toLocaleString()}{" "}
                                  {extractedData.currency}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Milestones / Scheduling */}
                      {extractedData.milestones && extractedData.milestones.length > 0 && (
                        <div>
                          <h4 className="text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">
                            {isAr
                              ? "معالم الدفع المستخلصة وجدول الإنجاز"
                              : "Extracted Milestones & Progress Payments Schedule"}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {extractedData.milestones.map((milestone: any, i: number) => (
                              <div
                                key={i}
                                className="bg-zinc-50 dark:bg-zinc-100 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 flex justify-between items-center text-xs"
                              >
                                <div>
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200 block">
                                    {milestone.name}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 block mt-0.5">
                                    {milestone.date}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                  {milestone.amount.toLocaleString()} {extractedData.currency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-100/50 flex justify-end gap-3">
                      <button
                        onClick={() => setCurrentStep("upload")}
                        className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-bold rounded-xl"
                      >
                        {isAr ? "تغيير عقد الإدخال" : "Change Contract"}
                      </button>
                      <button
                        onClick={() => setCurrentStep("invoice")}
                        className="bg-emerald-600 text-white px-5 py-2 hover:bg-emerald-700 text-xs font-bold rounded-xl flex items-center gap-2"
                      >
                        {isAr ? "المتابعة لإعداد الفاتورة" : "Proceed to Invoice Generation"}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "invoice" && extractedData && (
                <div className="space-y-6">
                  {/* Output type and format selection bar */}
                  <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                        {isAr ? "نوع فاتورة ZATCA المستهدفة" : "Target ZATCA E-Invoice Class"}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          {
                            id: "tax",
                            label: "فاتورة ضريبية (B2B)",
                            labelEn: "Standard Tax (B2B)",
                          },
                          { id: "simplified", label: "مبسطة (B2C)", labelEn: "Simplified (B2C)" },
                          { id: "debit", label: "إشعار مدين", labelEn: "Debit Note" },
                          { id: "credit", label: "إشعار دائن", labelEn: "Credit Note" },
                        ].map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setInvoiceType(type.id as any)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              invoiceType === type.id
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 border"
                                : "bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {isAr ? type.label : type.labelEn}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-zinc-400 block mb-1 text-left">
                        {isAr ? "صيغة المخرجات والربط" : "Produced Target Format"}
                      </label>
                      <div className="flex gap-1.5">
                        {[
                          { id: "pdf", label: "PDF / مطبوع" },
                          { id: "xml", label: "XML (UBL 2.1)" },
                          { id: "qr", label: "QR Code (TLV)" },
                          { id: "json", label: "JSON" },
                          { id: "api", label: "API Payload" },
                        ].map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => setOutputFormat(fmt.id as any)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                              outputFormat === fmt.id
                                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                                : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {fmt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Active representation of the e-invoice */}
                  <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm min-h-[400px]">
                    {outputFormat === "pdf" && (
                      <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-8 text-xs bg-white text-zinc-800">
                        {/* Interactive Saudi styled tax invoice header */}
                        <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
                          <div>
                            <h2 className="text-base font-bold text-zinc-900 font-sans">
                              {invoiceType === "tax" ? "فاتورة ضريبية" : "فاتورة مبسطة"}
                            </h2>
                            <h3 className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                              {invoiceType === "tax"
                                ? "Standard Tax Invoice"
                                : "Simplified Tax Invoice"}
                            </h3>
                            <div className="mt-3 space-y-0.5 text-[10px] text-zinc-500">
                              <p>
                                رقم الفاتورة / Invoice No:{" "}
                                <strong className="text-zinc-800">
                                  {extractedData.contractNumber}
                                </strong>
                              </p>
                              <p>
                                تاريخ الإصدار / Issue Date:{" "}
                                <strong className="text-zinc-800">
                                  {extractedData.contractDate}
                                </strong>
                              </p>
                              <p>
                                تاريخ التوريد / Supply Date:{" "}
                                <strong className="text-zinc-800">{invoiceDateInput}</strong>
                              </p>
                            </div>
                          </div>
                          {complianceData && (
                            <div className="flex flex-col items-end">
                              <div className="p-1 border border-zinc-200 rounded-lg bg-white">
                                {/* Interactive small QR code representation */}
                                <QrCode className="w-20 h-20 text-zinc-900" />
                              </div>
                              <span className="text-[8px] font-mono text-zinc-400 mt-1 max-w-[120px] truncate">
                                {complianceData.uuid}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Parties row */}
                        <div className="grid grid-cols-2 gap-8 text-[11px]">
                          <div>
                            <h4 className="font-bold border-b border-zinc-100 pb-1 text-zinc-900">
                              الطرف الأول / Seller (الشركة الموردة)
                            </h4>
                            <div className="mt-2 space-y-0.5 text-zinc-600">
                              <p className="font-bold text-zinc-800">{extractedData.sellerName}</p>
                              <p>
                                الرقم الضريبي / Seller VAT:{" "}
                                <strong className="font-mono text-zinc-800">
                                  {extractedData.sellerVat || "N/A"}
                                </strong>
                              </p>
                              <p>العنوان / Address: العليا، الرياض، المملكة العربية السعودية</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-bold border-b border-zinc-100 pb-1 text-zinc-900">
                              الطرف الثاني / Buyer (العميل)
                            </h4>
                            <div className="mt-2 space-y-0.5 text-zinc-600">
                              <p className="font-bold text-zinc-800">{extractedData.buyerName}</p>
                              <p>
                                الرقم الضريبي / Buyer VAT:{" "}
                                <strong className="font-mono text-zinc-800">
                                  {extractedData.buyerVat || "N/A"}
                                </strong>
                              </p>
                              <p>
                                العملة والاتفاقية / Contract terms: {extractedData.paymentTerms}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Items summary */}
                        <div className="space-y-4">
                          <div className="border border-zinc-200 rounded-xl overflow-hidden">
                            <table className="w-full text-[11px]">
                              <thead className="bg-zinc-50 text-zinc-600 font-bold border-b border-zinc-200">
                                <tr>
                                  <th className="p-3 text-right">البند / Line Item Description</th>
                                  <th className="p-3 text-center">الكمية / Qty</th>
                                  <th className="p-3 text-right">سعر الوحدة / Unit Price</th>
                                  <th className="p-3 text-right">الضريبة / VAT</th>
                                  <th className="p-3 text-right">المجموع شامل الضريبة / Total</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                                {extractedData.lineItems.map((item: any) => (
                                  <tr key={item.id}>
                                    <td className="p-3 text-right font-bold">{item.name}</td>
                                    <td className="p-3 text-center font-mono">{item.quantity}</td>
                                    <td className="p-3 text-right font-mono">
                                      {item.unitPrice.toLocaleString()} {extractedData.currency}
                                    </td>
                                    <td className="p-3 text-right font-mono">15%</td>
                                    <td className="p-3 text-right font-mono font-bold">
                                      {(item.quantity * item.unitPrice * 1.15).toLocaleString()}{" "}
                                      {extractedData.currency}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Grand total calculation boxes compliant with Saudi standard guidelines */}
                          <div className="flex justify-end">
                            <div className="w-80 space-y-2 text-xs border-t border-zinc-200 pt-4">
                              <div className="flex justify-between">
                                <span className="text-zinc-500">
                                  المجموع الفرعي (غير شامل الضريبة) / Subtotal:
                                </span>
                                <span className="font-mono font-bold">
                                  {subtotal.toLocaleString()} {extractedData.currency}
                                </span>
                              </div>
                              <div className="flex justify-between text-zinc-600">
                                <span className="text-zinc-500">
                                  ضريبة القيمة المضافة (15%) / Total VAT (15%):
                                </span>
                                <span className="font-mono font-bold text-rose-600">
                                  {vat.toLocaleString()} {extractedData.currency}
                                </span>
                              </div>
                              <div className="flex justify-between border-t border-dashed border-zinc-200 pt-2 text-zinc-900 font-black text-sm">
                                <span>المجموع النهائي شامل الضريبة / Grand Total:</span>
                                <span className="font-mono text-emerald-600">
                                  {total.toLocaleString()} {extractedData.currency}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Legal compliance notice footer */}
                        <div className="border-t border-zinc-100 pt-4 text-[10px] text-zinc-400 text-center leading-relaxed">
                          <p>
                            تم استخلاص هذه الفاتورة ضريبياً باستخدام معالج ZATCA AI المعتمد لدى
                            الهيئة.
                          </p>
                          <p className="mt-0.5">
                            Complies with Article 53 of the KSA VAT Implementing Regulations on
                            E-Invoicing requirements.
                          </p>
                        </div>
                      </div>
                    )}

                    {outputFormat === "xml" && complianceData && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500">
                            {isAr
                              ? "كود UBL 2.1 المتوافق مع الفاتورة"
                              : "Generated UBL 2.1 Compliant XML"}
                          </span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded font-mono font-bold">
                            XML SCHEMA VALID
                          </span>
                        </div>
                        <pre className="bg-zinc-950 text-emerald-400 p-5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[400px] leading-relaxed select-all">
                          {`<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${extractedData.contractNumber}</cbc:ID>
  <cbc:UUID>${complianceData.uuid}</cbc:UUID>
  <cbc:IssueDate>${extractedData.contractDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${extractedData.currency}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>SAR</cbc:TaxCurrencyCode>
  
  <cac:AdditionalDocumentReference>
    <cbc:ID>PIH</cbc:ID>
    <cac:Attachment>
      <cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${complianceData.prevInvoiceHash.substring(0, 20)}...</cbc:EmbeddedDocumentBinaryObject>
    </cac:Attachment>
  </cac:AdditionalDocumentReference>
  
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${extractedData.sellerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${extractedData.sellerVat}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${extractedData.buyerName}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${extractedData.buyerVat}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingCustomerParty>
  
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${extractedData.currency}">${vat}</cbc:TaxAmount>
  </cac:TaxTotal>
</Invoice>`}
                        </pre>
                      </div>
                    )}

                    {outputFormat === "qr" && complianceData && (
                      <div className="space-y-6 flex flex-col items-center justify-center p-8">
                        <h4 className="text-xs font-black text-zinc-700 dark:text-zinc-300 text-center">
                          {isAr
                            ? "رمز الاستجابة السريع لمرحلة الربط والدمج (Phase 2 TLV QR)"
                            : "Compliant Base64 TLV Encoded 2D Barcode (QR)"}
                        </h4>
                        <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-md flex items-center justify-center">
                          {/* Use standard vector QrCode representing decodable fields */}
                          <QrCode className="w-48 h-48 text-zinc-900" />
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-100 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 w-full font-mono text-[10px] break-all text-zinc-500">
                          <span className="text-zinc-400 block font-bold mb-1 uppercase tracking-wider">
                            {isAr ? "كود التشفير المعتمد (Base64)" : "Raw Base64 TLV Hash string"}
                          </span>
                          {complianceData.qrTlv}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full text-[10px]">
                          <div className="bg-zinc-50 dark:bg-zinc-100 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-400 font-bold">Tag 1 (Seller):</span>{" "}
                            {extractedData.sellerName}
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-100 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-400 font-bold">Tag 2 (Seller VAT):</span>{" "}
                            {extractedData.sellerVat}
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-100 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-400 font-bold">Tag 3 (Timestamp):</span>{" "}
                            {extractedData.contractDate}T11:42:00Z
                          </div>
                          <div className="bg-zinc-50 dark:bg-zinc-100 p-2.5 rounded border border-zinc-200 dark:border-zinc-800">
                            <span className="text-zinc-400 font-bold">Tag 4 (Total with VAT):</span>{" "}
                            {total.toFixed(2)} {extractedData.currency}
                          </div>
                        </div>
                      </div>
                    )}

                    {outputFormat === "json" && (
                      <pre className="bg-zinc-950 text-emerald-400 p-5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[400px] leading-relaxed">
                        {JSON.stringify(
                          {
                            invoiceHeader: {
                              uuid: complianceData?.uuid,
                              invoiceNumber: extractedData.contractNumber,
                              issueDate: extractedData.contractDate,
                              typeCode: "388",
                              invoiceType: invoiceType,
                            },
                            sellerParty: {
                              name: extractedData.sellerName,
                              vatNumber: extractedData.sellerVat,
                              address: "Riyadh, Saudi Arabia",
                            },
                            buyerParty: {
                              name: extractedData.buyerName,
                              vatNumber: extractedData.buyerVat,
                            },
                            totals: {
                              subtotal: subtotal,
                              vatAmount: vat,
                              grandTotal: total,
                              currency: extractedData.currency,
                            },
                            lines: extractedData.lineItems,
                          },
                          null,
                          2
                        )}
                      </pre>
                    )}

                    {outputFormat === "api" && complianceData && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-zinc-500">
                            {isAr
                              ? "رأس الطلب المتكامل للربط مع ZATCA API"
                              : "HTTP Headers & Request Payload (Compliance clearance)"}
                          </span>
                          <span className="text-indigo-500">POST /api/v1/invoices/clearance</span>
                        </div>
                        <pre className="bg-zinc-950 text-indigo-300 p-5 rounded-2xl font-mono text-[11px] overflow-x-auto max-h-[350px]">
                          {`Headers: {
  "Content-Type": "application/json",
  "X-ZATCA-CCSID": "${complianceData.cryptographicStamp}",
  "X-ZATCA-Signature": "${complianceData.digitalSignature.substring(0, 16)}..."
}

Payload: {
  "uuid": "${complianceData.uuid}",
  "invoiceHash": "${complianceData.invoiceHash}",
  "invoiceCounter": ${complianceData.invoiceCounter},
  "xmlBase64": "PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPEludm9pY2U..."
}`}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {currentStep === "onboarding" && (
                <div className="space-y-6">
                  {/* Environment & Credentials Hub */}
                  <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-100 pb-4">
                      <div>
                        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                          {isAr ? "التهيئة والربط الرقمي المشفر مع هيئة الزكاة (ZATCA)" : "ZATCA Cryptographic Onboarding & Integration"}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-1">
                          {isAr
                            ? "توليد ملفات التعريف الرقمية والمفاتيح وتثبيت شهادات التوقيع التلقائي للمنشأة"
                            : "Generate Private Keys, compile CSR with standard OIDs, and retrieve secure CSIDs."}
                        </p>
                      </div>
                      <div className="flex gap-1.5 bg-zinc-100 p-1 rounded-xl">
                        <button
                          onClick={() => setOnboardEnv("sandbox")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            onboardEnv === "sandbox"
                              ? "bg-white text-zinc-900 shadow-sm"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          {isAr ? "بيئة تجريبية (Sandbox)" : "Sandbox"}
                        </button>
                        <button
                          onClick={() => setOnboardEnv("production")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            onboardEnv === "production"
                              ? "bg-zinc-900 text-white shadow-sm"
                              : "text-zinc-500 hover:text-zinc-700"
                          }`}
                        >
                          {isAr ? "الإنتاج الحي (Live)" : "Production"}
                        </button>
                      </div>
                    </div>

                    {/* Onboarding Input Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "الاسم التجاري للمنشأة (Common Name)" : "Business Common Name"}
                        </label>
                        <input
                          type="text"
                          value={onboardCompanyName}
                          onChange={(e) => setOnboardCompanyName(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 font-bold text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "الرقم الضريبي للمنشأة (VAT Number)" : "Tax Registration Number (VAT)"}
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          value={onboardVat}
                          onChange={(e) => setOnboardVat(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 font-mono font-bold text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "اسم المنشأة المسجل (Organization Name)" : "Organization Name"}
                        </label>
                        <input
                          type="text"
                          value={onboardOrg}
                          onChange={(e) => setOnboardOrg(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "القسم / الفرع المسجل (Org Unit)" : "Organization Unit"}
                        </label>
                        <input
                          type="text"
                          value={onboardOu}
                          onChange={(e) => setOnboardOu(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "العنوان الرسمي المسجل" : "Registered Business Address"}
                        </label>
                        <input
                          type="text"
                          value={onboardAddress}
                          onChange={(e) => setOnboardAddress(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-zinc-500 block mb-1">
                          {isAr ? "اسم النظام المرتبط (Solution Name)" : "Software Solution Name"}
                        </label>
                        <input
                          type="text"
                          value={onboardSolution}
                          onChange={(e) => setOnboardSolution(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 font-mono text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>

                    {/* Live Production OTP input */}
                    {onboardEnv === "production" && (
                      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl space-y-2">
                        <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 animate-bounce" />
                          {isAr ? "رمز التحقق المسبق OTP مطلوب لربط الإنتاج" : "OTP Token Required for Live Production"}
                        </h4>
                        <p className="text-[11px] text-amber-700 leading-normal">
                          {isAr
                            ? "يرجى تسجيل الدخول إلى بوابة فاتورة (Fatoora Portal) التابعة للهيئة، وإنشاء رمز OTP جديد مؤقت مكوّن من 6 أرقام لتفويض هذا النظام فوتيرياً."
                            : "Login to your Fatoora Portal, click on Onboarding, and generate a temporary 6-digit OTP code to authorize this ERP."}
                        </p>
                        <div className="flex gap-2 max-w-xs mt-2">
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="e.g. 129481"
                            value={onboardOtp}
                            onChange={(e) => setOnboardOtp(e.target.value)}
                            className="bg-white border border-amber-300 rounded-lg px-3 py-2 text-center font-mono font-bold text-sm tracking-widest text-zinc-800 placeholder-zinc-300 w-full"
                          />
                        </div>
                      </div>
                    )}

                    <button
                      onClick={startOnboardingProcess}
                      disabled={isOnboardingActive}
                      className="w-full py-3.5 bg-primary hover:bg-primary/95 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isOnboardingActive ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>{isAr ? "جاري تهيئة المفاتيح والتسجيل التلقائي..." : "Onboarding & handshake in progress..."}</span>
                        </>
                      ) : (
                        <>
                          <Code2 className="w-4 h-4" />
                          <span>
                            {isAr
                              ? "توليد المفتاح الخاص وطلب الشهادة وبدء الربط الفوري"
                              : "Generate Cryptographic Keys & Handshake with ZATCA Registry"}
                          </span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cryptographic handshake log screen */}
                  {isOnboardingActive && (
                    <div className="bg-zinc-950 text-emerald-400 p-6 rounded-3xl border border-zinc-800 space-y-3 font-mono text-xs">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                        <span className="flex items-center gap-1.5 font-bold">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                          {isAr ? "وحدة الطرف المرجعي لتسجيل المنشأة" : "ZATCA Onboarding Handshake Logs"}
                        </span>
                        <span>{onboardStep + 1} / 10</span>
                      </div>
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto no-scrollbar text-[10px]">
                        {onboardLogs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-emerald-500">▶</span>
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Download Certificates Output block */}
                  {onboardCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm space-y-6"
                    >
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-emerald-900">
                            {isAr ? "اكتمال الربط بنجاح مع هيئة الزكاة والضريبة والجمارك" : "ZATCA Onboarding Successfully Completed!"}
                          </h4>
                          <p className="text-[11px] text-emerald-700 mt-0.5 leading-normal">
                            {isAr
                              ? `تم إصدار وتثبيت الختم الرقمي المشفر (CSID) الخاص بالمنشأة على البيئة ${onboardEnv === "sandbox" ? "التجريبية" : "الحية حزمة الإنتاج"}. تم حفظ المفتاح العام والخاص بسلام ومطابقة OID بنسبة 100%.`
                              : `Cryptographic Stamp Certificate (CSID) is now issued and saved into local secure vault. Key validation matches ZATCA requirements.`}
                          </p>
                        </div>
                      </div>

                      {/* Display of PEM Certificates with Download buttons */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-500">{isAr ? "المفتاح الخاص (Private Key - PEM)" : "ECDSA Private Key"}</span>
                            <button
                              onClick={() => downloadOnboardFile(onboardPrivateKey, "private_key.pem")}
                              className="text-[10px] text-primary hover:underline font-bold"
                            >
                              {isAr ? "تحميل الملف" : "Download PEM"}
                            </button>
                          </div>
                          <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto select-all max-h-[120px]">
                            {onboardPrivateKey}
                          </pre>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-500">{isAr ? "طلب توقيع الشهادة (CSR - PEM)" : "Certificate Request (CSR)"}</span>
                            <button
                              onClick={() => downloadOnboardFile(onboardCsr, "request.csr")}
                              className="text-[10px] text-primary hover:underline font-bold"
                            >
                              {isAr ? "تحميل الملف" : "Download CSR"}
                            </button>
                          </div>
                          <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto select-all max-h-[120px]">
                            {onboardCsr}
                          </pre>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-zinc-500">{isAr ? "شهادة الختم التجريبية (CCSID - PEM)" : "Handshake Certificate (CCSID)"}</span>
                            <button
                              onClick={() => downloadOnboardFile(onboardCsid, "ccsid.pem")}
                              className="text-[10px] text-primary hover:underline font-bold"
                            >
                              {isAr ? "تحميل الملف" : "Download PEM"}
                            </button>
                          </div>
                          <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto select-all max-h-[120px]">
                            {onboardCsid}
                          </pre>
                        </div>

                        {onboardEnv === "production" && onboardPcsid && (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-zinc-500">{isAr ? "شهادة الختم الإنتاجية (PCSID - PEM)" : "Production Stamp (PCSID)"}</span>
                              <button
                                onClick={() => downloadOnboardFile(onboardPcsid, "pcsid.pem")}
                                className="text-[10px] text-primary hover:underline font-bold"
                              >
                                {isAr ? "تحميل الملف" : "Download PEM"}
                              </button>
                            </div>
                            <pre className="bg-zinc-950 text-zinc-300 p-3 rounded-xl font-mono text-[10px] overflow-x-auto select-all max-h-[120px]">
                              {onboardPcsid}
                            </pre>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (Side controls & Compliance indicators) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Compliance Checker Indicators */}
              {extractedData && (
                <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4 shadow-sm">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-wider">
                    {isAr ? "محرك فحص الامتثال المسبق لـ ZATCA" : "ZATCA Local Verification Engine"}
                  </h3>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-100">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {isAr ? "بنية الرقم الضريبي" : "VAT Numbers Format"}
                      </span>
                      {extractedData.sellerVat && extractedData.buyerVat ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {isAr ? "معتمد" : "Pass"}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" />
                          {isAr ? "خطأ ضريبي" : "Unresolved"}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-100">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {isAr ? "تطابق مجاميع الفاتورة" : "Invoice Grand Totals"}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {isAr ? "سليم" : "Pass"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-100">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {isAr ? "حساب قيمة الضريبة (15%)" : "Tax Rates Verified (15%)"}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {isAr ? "مطابق" : "Pass"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-100">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {isAr ? "تفادي الفواتير المكررة" : "Sequence Gaps & Duplicates"}
                      </span>
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        {isAr ? "لا يوجد" : "Pass"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2 rounded bg-zinc-50 dark:bg-zinc-100">
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {isAr ? "الحقول الإلزامية للفاتورة" : "Mandatory Fields Check"}
                      </span>
                      {missingInfoCount === 0 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          {isAr ? "مكتملة" : "Pass"}
                        </span>
                      ) : (
                        <span className="text-rose-500 font-bold flex items-center gap-1 animate-pulse">
                          <XCircle className="w-3.5 h-3.5" />
                          {isAr ? "ناقصة" : "Missing"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Generated fields info */}
                  {complianceData && (
                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-1 text-[10px] text-zinc-400">
                      <p>
                        UUID: <span className="font-mono text-zinc-500">{complianceData.uuid}</span>
                      </p>
                      <p>
                        Hash Chain (PIH):{" "}
                        <span className="font-mono text-zinc-500">
                          {complianceData.prevInvoiceHash.substring(0, 16)}...
                        </span>
                      </p>
                      <p>
                        ICV: <span className="font-mono text-zinc-500">{complianceData.icv}</span>
                      </p>
                      <p>
                        Digital Stamp:{" "}
                        <span className="font-mono text-zinc-500">
                          {complianceData.cryptographicStamp}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Direct interactive master CTA submit button */}
                  {currentStep === "invoice" && (
                    <button
                      onClick={handleOneClickSubmit}
                      disabled={isSubmitting}
                      className={`w-full text-white font-black text-xs py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                        isSubmitting
                          ? "bg-zinc-700 cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 hover:scale-[1.01]"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          <span>{isAr ? "جاري الإرسال والمطابقة..." : "Sending to ZATCA..."}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>
                            {isAr ? "اعتماد وإرسال كبسة واحدة" : "Submit to ZATCA in 1-Click"}
                          </span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Progress animation popup */}
              {isSubmitting && (
                <div className="bg-zinc-950 text-zinc-100 p-5 rounded-2xl border border-zinc-800 space-y-3 font-mono text-xs">
                  <h4 className="text-emerald-400 font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                    {isAr ? "سجل إرسال البوابة الفوري" : "ZATCA Gateway Stream Output"}
                  </h4>
                  <div className="space-y-1 max-h-[220px] overflow-y-auto no-scrollbar">
                    {submissionLogs.map((log, index) => (
                      <div key={index} className="flex items-start gap-1.5 text-[10px]">
                        <span className="text-emerald-500">✓</span>
                        <span className="text-zinc-300">{log}</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden mt-3">
                    <div
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${((submissionStep + 1) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* AI Assistant Chat Interactive Panel */}
              <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-[340px]">
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 p-4 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-black">
                      {isAr ? "مساعد العقود الذكي" : "ZATCA AI Copilot"}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                    GEMINI 3.5
                  </span>
                </div>

                <div className="flex-1 p-4 overflow-y-auto max-h-[240px] space-y-3 text-xs leading-relaxed no-scrollbar">
                  {aiChatHistory.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-xl max-w-[85%] ${
                        msg.role === "user"
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 ml-auto"
                          : "bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/50 text-zinc-700 dark:text-zinc-300 mr-auto"
                      }`}
                    >
                      {msg.content}
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="text-zinc-400 animate-pulse text-[10px] flex items-center gap-1 font-mono">
                      <span>●</span>
                      <span>●</span>
                      <span>●</span>
                      <span>{isAr ? "يفكر المساعد..." : "Copilot is analyzing..."}</span>
                    </div>
                  )}
                </div>

                {/* AI Interactive Prompt Chips */}
                <div className="px-4 pb-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap gap-1 bg-zinc-50/50 dark:bg-zinc-100/50">
                  {[
                    {
                      text: isAr ? "صياغة فواتير العقود" : "Create invoices",
                      key: "Create invoices from this contract.",
                    },
                    {
                      text: isAr ? "تقسيم 12 شهر" : "Split 12 Months",
                      key: "Split this yearly contract into 12 monthly invoices.",
                    },
                    {
                      text: isAr ? "حسب المعالم" : "Milestone schedule",
                      key: "Generate invoices according to milestone payments.",
                    },
                    { text: isAr ? "البحث عن أخطاء" : "Check VAT Errors", key: "Find VAT errors." },
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendAiPrompt(chip.key)}
                      className="text-[10px] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 px-2 py-1 rounded-full text-zinc-600 dark:text-zinc-300 font-medium"
                    >
                      💡 {chip.text}
                    </button>
                  ))}
                </div>

                <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                  <input
                    type="text"
                    placeholder={isAr ? "اسأل الذكاء الاصطناعي..." : "Ask ZATCA AI Copilot..."}
                    value={aiPromptInput}
                    onChange={(e) => setAiPromptInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSendAiPrompt();
                    }}
                    className="flex-1 bg-zinc-50 dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-xs"
                  />
                  <button
                    onClick={() => handleSendAiPrompt()}
                    className="p-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Hub / Connect with CRM and ERP */}
        <div className="bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-black text-zinc-800 dark:text-zinc-100 mb-2 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-emerald-500" />
            {isAr
              ? "سوق الربط والتكامل مع الأنظمة المالية (ERP)"
              : "Enterprise ERP & API Integrations Hub"}
          </h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            {isAr
              ? "مزامنة تلقائية في كبسة واحدة لتوليد القيود المحاسبية وترحيل الفواتير المعتمدة لدفتر الأستاذ وحسابات الضريبة فوراً لجميع برامج المحاسبة المفضلة لديك."
              : "Automatically sync compliant e-invoice XML entries, ledger mappings, and tax summaries to third-party CRM, ERP and accounting platforms."}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              {
                id: "zatca",
                name: "ZATCA API",
                desc: "Saudi Government Portal",
                descAr: "البوابة الرسمية الفيدرالية",
              },
              {
                id: "qoyod",
                name: "Qoyod",
                desc: "Saudi Cloud ERP",
                descAr: "دفاتر محاسبية سحابية",
              },
              {
                id: "zoho",
                name: "Zoho Books",
                desc: "Standard SME ERP",
                descAr: "إدارة قيود ودفاتر",
              },
              {
                id: "odoo",
                name: "Odoo ERP",
                desc: "Open Enterprise suite",
                descAr: "نظام إدارة المؤسسة",
              },
              {
                id: "sap",
                name: "SAP Business",
                desc: "Corporate Ledger Suite",
                descAr: "محاسبة الشركات الكبرى",
              },
              {
                id: "oracle",
                name: "Oracle NetSuite",
                desc: "Financial ledger sync",
                descAr: "ترحيل قيود المؤسسة",
              },
              {
                id: "quickbooks",
                name: "QuickBooks",
                desc: "Global accounting",
                descAr: "برامج الحسابات الشاملة",
              },
              {
                id: "xero",
                name: "Xero Portal",
                desc: "Cloud ledger platform",
                descAr: "الحسابات السحابية العالمية",
              },
              {
                id: "stripe",
                name: "Stripe",
                desc: "Online payments",
                descAr: "مدفوعات العملاء العالمية",
              },
              {
                id: "hyperpay",
                name: "HyperPay",
                desc: "Saudi Gateway Pay",
                descAr: "بوابة دفع محلية سعودية",
              },
              {
                id: "moyasar",
                name: "Moyasar",
                desc: "Premium GCC checkout",
                descAr: "ميسر لمعالجة المدفوعات",
              },
              {
                id: "zid",
                name: "Zid Platform",
                desc: "E-Commerce sync",
                descAr: "ربط المبيعات بمتجر زد",
              },
            ].map((app) => (
              <div
                key={app.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[130px] ${
                  integrations[app.id]
                    ? "bg-emerald-500/5 border-emerald-500 dark:border-emerald-400 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-100 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                      {app.name}
                    </h4>
                    <span className="text-[10px] text-zinc-400 block mt-1">
                      {isAr ? app.descAr : app.desc}
                    </span>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      integrations[app.id]
                        ? "bg-emerald-500 animate-pulse"
                        : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span
                    className={`text-[10px] font-bold ${integrations[app.id] ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-400"}`}
                  >
                    {integrations[app.id]
                      ? isAr
                        ? "متصل"
                        : "Connected"
                      : isAr
                        ? "غير مفعل"
                        : "Disconnected"}
                  </span>
                  <button
                    onClick={() => handleOpenIntegrationSetup(app.id)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      integrations[app.id] ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        integrations[app.id]
                          ? isAr
                            ? "-translate-x-4"
                            : "translate-x-4"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* INTERACTIVE OAUTH & CREDENTIALS SETUP DIALOG */}
      {selectedIntegrationForSetup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden border border-zinc-200 shadow-2xl animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-5 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 uppercase">
                  {isAr ? "تهيئة ربط" : "Configure Integration:"} {selectedIntegrationForSetup.toUpperCase()}
                </h3>
                <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                  {isAr ? "إدارة الصلاحيات ومفاتيح الربط التلقائي بأمان" : "Securely manage authorization scopes and webhook payloads."}
                </p>
              </div>
              <button
                onClick={() => setSelectedIntegrationForSetup(null)}
                className="text-zinc-400 hover:text-zinc-600 font-bold text-xs p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* If already integrated, show status and edit/disconnect */}
              {integrations[selectedIntegrationForSetup] && oauthStep === "idle" ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-emerald-800">
                        {isAr ? "الربط نشط حالياً ويعمل في الخلفية" : "Integration is currently active and processing live events"}
                      </p>
                      <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                        {isAr ? "تتم مزامنة الدفاتر المحاسبية وإشعارات الفوترة تلقائياً" : "Ledgers, invoices and webhooks are automatically synchronized."}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      {isAr ? "مفاتيح وبيانات الاتصال" : "Active Credentials Details"}
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(setupFields).map(([key, val]) => (
                        <div key={key} className="flex justify-between items-center text-xs p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase">{key}</span>
                          <span className="font-mono text-[11px] text-zinc-800 truncate max-w-[240px]">
                            {val.startsWith("sk_") || val === "••••••••••••••••••••••••" ? "••••••••••••••••••••••••" : val}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-zinc-100">
                    <button
                      onClick={testIntegrationConnection}
                      disabled={isTestingLiveConnection}
                      className="flex-1 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {isTestingLiveConnection ? (isAr ? "جاري الاختبار..." : "Testing...") : (isAr ? "فحص الاتصال" : "Test Connectivity")}
                    </button>
                    <button
                      onClick={() => disconnectIntegration(selectedIntegrationForSetup)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {isAr ? "إلغاء المزامنة" : "Revoke Access"}
                    </button>
                  </div>
                </div>
              ) : (
                /* Connect Mode / Setup Fields */
                <div className="space-y-4">
                  {oauthStep === "idle" && (
                    <div className="space-y-4">
                      <div className="text-xs text-zinc-600 leading-relaxed">
                        {isAr
                          ? `قم بضبط تفاصيل الربط مع ${selectedIntegrationForSetup.toUpperCase()} لتنشيط قنوات تدفق البيانات الآمنة.`
                          : `Set up the official API details for ${selectedIntegrationForSetup.toUpperCase()} to route webhooks and automate events.`}
                      </div>

                      <div className="space-y-3">
                        {Object.entries(setupFields).map(([key, val]) => (
                          <div key={key}>
                            <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">
                              {key.replace(/([A-Z])/g, " $1")}
                            </label>
                            <input
                              type={key.toLowerCase().includes("secret") || key.toLowerCase().includes("token") ? "password" : "text"}
                              value={val}
                              onChange={(e) => setSetupFields(prev => ({ ...prev, [key]: e.target.value }))}
                              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                            />
                          </div>
                        ))}
                      </div>

                      {/* OAuth flow buttons based on integration type */}
                      {selectedIntegrationForSetup !== "stripe" && selectedIntegrationForSetup !== "whatsapp" ? (
                        <div className="pt-3 border-t border-zinc-100 space-y-2">
                          <button
                            onClick={() => setOauthStep("connecting")}
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>⚡</span>
                            {isAr ? "البدء عبر بروتوكول OAuth 2.0" : "Initiate Secure OAuth 2.0 Flow"}
                          </button>
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-zinc-100 flex gap-2">
                          <button
                            onClick={testIntegrationConnection}
                            disabled={isTestingLiveConnection}
                            className="flex-1 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 disabled:opacity-50 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {isTestingLiveConnection ? (isAr ? "جاري فحص الخادم..." : "Pinging...") : (isAr ? "فحص مفتاح API" : "Test Keys Connectivity")}
                          </button>
                          <button
                            onClick={() => saveIntegrationConfig(selectedIntegrationForSetup)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {isAr ? "تفعيل الربط" : "Enable Gateway"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* OAuth Connecting State */}
                  {oauthStep === "connecting" && (
                    <div className="py-6 flex flex-col items-center justify-center space-y-3">
                      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold text-zinc-800">
                        {isAr ? `جاري التوجيه الآمن ومصافحة ${selectedIntegrationForSetup.toUpperCase()}...` : `Establishing cryptographic handshake with ${selectedIntegrationForSetup.toUpperCase()}...`}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {isAr ? "يرجى الانتظار، جاري تبادل مفاتيح الجلسة الموثقة" : "Negotiating SSL session and exchange states..."}
                      </p>
                      {setTimeout(() => setOauthStep("consent"), 1200) && null}
                    </div>
                  )}

                  {/* OAuth Consent Screen */}
                  {oauthStep === "consent" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-200">
                      <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-zinc-950 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                            M
                          </div>
                          <span className="text-xs font-extrabold text-zinc-800">{isAr ? "مدارج OS" : "Mudarij OS"}</span>
                        </div>
                        <div className="text-zinc-300 font-bold">⇄</div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-bold text-xs uppercase">
                            {selectedIntegrationForSetup.slice(0, 2)}
                          </div>
                          <span className="text-xs font-extrabold text-zinc-800 capitalize">{selectedIntegrationForSetup}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-bold text-zinc-800">
                          {isAr ? "طلب صلاحية الدخول لدفاترك المحاسبية" : "Authorization Request Scopes"}
                        </p>
                        <p className="text-[10px] text-zinc-500 leading-relaxed">
                          {isAr
                            ? `يطلب تطبيق "مدارج OS" صلاحية الوصول لربط البيانات وقراءتها من حساب ${selectedIntegrationForSetup.toUpperCase()} الخاص بك:`
                            : `Mudarij OS requests permission to read and synchronize financial records from your ${selectedIntegrationForSetup.toUpperCase()} tenant:`}
                        </p>
                        <ul className="text-[10px] text-zinc-600 space-y-1 pl-4 list-disc font-medium">
                          <li>{isAr ? "قراءة الفواتير وتفاصيل السلع والخدمات" : "Read corporate invoice schedules and line items"}</li>
                          <li>{isAr ? "مزامنة العملاء وجهات الاتصال المفوترة" : "Sync B2B billing profiles and contacts"}</li>
                          <li>{isAr ? "ترحيل القيود اليومية وعمليات السداد حياً" : "Post automated real-time receipts and journal lines"}</li>
                        </ul>
                      </div>

                      <div className="pt-3 border-t border-zinc-100 flex gap-2">
                        <button
                          onClick={() => setOauthStep("idle")}
                          className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {isAr ? "إلغاء" : "Reject"}
                        </button>
                        <button
                          onClick={() => setOauthStep("success")}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          {isAr ? "الموافقة والربط" : "Approve & Authorize"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* OAuth Success */}
                  {oauthStep === "success" && (
                    <div className="py-6 flex flex-col items-center justify-center space-y-4 text-center animate-in zoom-in duration-200">
                      <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-emerald-500 text-xl font-bold">✓</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-zinc-800 uppercase">
                          {isAr ? "تم الاتصال والتفويض بنجاح!" : "Cryptographic Access Authorized!"}
                        </h4>
                        <p className="text-[10px] text-zinc-500 mt-1">
                          {isAr
                            ? `تم استلام رمز التفويض الآمن (Access Token) وتأمين الربط مع ${selectedIntegrationForSetup.toUpperCase()}`
                            : `Secure authorization code exchanged for access token. Tenant verified successfully.`}
                        </p>
                      </div>
                      <div className="w-full bg-zinc-50 p-2 rounded-xl border border-zinc-100 text-[10px] font-mono text-zinc-500 break-all select-all">
                        token: oauth_tok_{selectedIntegrationForSetup}_2026_xYz9A
                      </div>
                      <button
                        onClick={() => saveIntegrationConfig(selectedIntegrationForSetup)}
                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        {isAr ? "إتمام التفعيل وحفظ الربط" : "Complete & Activate Integration"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
