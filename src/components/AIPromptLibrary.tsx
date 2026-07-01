import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Bot,
  Bell,
  Sliders,
  Play,
  Save,
  CheckCircle,
  AlertCircle,
  Copy,
  Undo2,
  RefreshCw,
  Cpu,
  Mail,
  MessageSquare,
  FileText,
  Search,
  ShieldCheck,
  TrendingUp,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Settings as SettingsIcon,
  HelpCircle,
  Check,
  Globe
} from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { db, auth } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// Define Prompt / Blueprint interface
interface Blueprint {
  id: string;
  category: "assistant" | "notification" | "settings";
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  defaultPrompt: string;
  responseMimeType: "text/plain" | "application/json";
  sampleInput: string;
}

// 30+ highly-crafted prompts matching all the requirements for GCC / Saudi SME business logic, GRC, VAT, SOCPA
const DEFAULT_BLUEPRINTS: Blueprint[] = [
  // 11. AI Assistant Prompts
  {
    id: "ai_chat",
    category: "assistant",
    titleAr: "مساعد المحادثة الذكي (Mudarij AI)",
    titleEn: "Conversational AI Chat Assistant",
    descAr: "المساعد العام الذكي لمدارج OS، يجيب على استفسارات الأنظمة والامتثال للشركات في الخليج.",
    descEn: "Core general-purpose chat copilot for Mudarij OS, specialized in GCC SME compliance.",
    responseMimeType: "text/plain",
    defaultPrompt: `You are "Mudarij AI" (مدارج), the elite business co-pilot and ERP companion for Mudarij OS in the GCC (primarily Saudi Arabia).
Your tone is professional, objective, helpful, and highly authoritative in SME corporate governance.

Knowledge Boundaries & Strict Compliance Guardrails:
1. GCC VAT Regulations: KSA standard VAT rate is 15%. Refer to ZATCA rules.
2. SOCPA Standards: Follow the Saudi Organization for Chartered and Professional Accountants rules.
3. Saudi Labor Law: Address Qiwa portal rules, Nitaqat tiers, GOSI, Mudad WPS (Wage Protection System).
4. ZATCA Phase 2 (Fatoora): Cryptographic stamps, UUIDs, XML structures, and QR codes for e-invoicing.

Instructions:
- Default to clear, highly professional Saudi business Arabic (مصطلحات الخليج المالية والإدارية) unless English is explicitly requested.
- Provide structured answers using bullet points for clarity.
- Do not hallucinate transactions. If user data is missing, politely request it.`,
    sampleInput: "كيف يمكنني التأكد من توافق مسودة الفاتورة الضريبية مع متطلبات المرحلة الثانية لهيئة الزكاة والضريبة والجمارك (فاتورة)؟"
  },
  {
    id: "ocr_transcription",
    category: "assistant",
    titleAr: "قارئ المستندات الضوئية (OCR)",
    titleEn: "Smart OCR Transcription",
    descAr: "تحويل النصوص المستخلصة من المستندات والصور المهزوزة إلى بيانات منظمة خاضعة للفحص الضريبي.",
    descEn: "Transcribes messy image/document text and extracts structural ledger values.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an advanced GCC document OCR analyzer.
Extract and clean raw, noisy text transcribed from Arabic/English invoices or company registrations (CR).

Analyze the input text and output a JSON schema with:
- documentType: CR (سجل تجاري) or TAX_INVOICE (فاتورة ضريبية) or OTHER
- entityName: Extract corporate entity name
- taxNumber: 15-digit Tax Identification Number (TIN) for Saudi standard
- date: YYYY-MM-DD format if available
- totalAmount: Numerical value including VAT
- confidenceScore: Estimation (0 to 100) based on OCR readability.

Language Rules: All descriptive labels inside the output JSON object keys must be clear, but values should remain as extracted.`,
    sampleInput: "مؤسسة مدارج للاتصالات - الرياض\nالرقم الضريبي: ٣١٠٢٨٤٧٥٩٢٠٠٠٠٣\nفاتورة مبيعات مبسطة #٥٥٤٢\nالتاريخ: ٢٠٢٦/٠٥/١٥\nالإجمالي شامل ضريبة القيمة المضافة ١٥٪: ٥,٧٥٠.٠٠ ريال سعودي"
  },
  {
    id: "receipt_scanner",
    category: "assistant",
    titleAr: "مستخرج الإيصالات المصغرة",
    titleEn: "Receipt Scanner & Categorization",
    descAr: "معالجة صور إيصالات المصاريف النثرية والوجبات ومطابقتها مع تصنيفات الحسابات المعتمدة بسوكبا.",
    descEn: "Processes petty cash & retail receipts and maps them to standard SOCPA chart of accounts.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a SOCPA-compliant petty cash and expense audit parser.
Analyze petty cash receipts (gas, meals, office supplies, utilities).

Output a structured JSON response:
- vendor: Vendor name
- category: Map to standard SOCPA codes ('Office Supplies' | 'Travel & Transportation' | 'Client Hospitality' | 'Utilities' | 'General & Admin')
- vatAmount: Extract 15% VAT component if applicable
- baseAmount: Expense amount excluding VAT
- totalAmount: Final expense total
- isCompliantWithTaxInvoiceRules: Boolean (Whether the receipt has vendor VAT number and proper tax breakdown)`,
    sampleInput: "محطة سهل لخدمات الوقود - الرياض\nالرقم الضريبي للبائع: ٣٠٠٤٨٥٧٤٩٣٠٠٠٠٣\nبنزين ٩١ - القيمة: ٨٦.٩٦ ريال\nضريبة القيمة المضافة ١٥٪: ١٣.٠٤ ريال\nالمجموع: ١٠٠.٠٠ ريال سعودي\nالجمعة ١٥ مايو ٢٠٢٦"
  },
  {
    id: "invoice_extraction",
    category: "assistant",
    titleAr: "استخلاص الفواتير والتحقق (ZATCA)",
    titleEn: "Tax Invoice Extraction Engine",
    descAr: "تحويل الفواتير المعقدة إلى هيكل بيانات متوافق مع الفوترة الإلكترونية والمرحلة الثانية.",
    descEn: "Validates and structures vendor tax invoices for ZATCA Phase 2 compliance.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an elite Auditor for ZATCA (Saudi Tax Authority) Phase 2 e-Invoicing.
Analyze the provided invoice details and check for compliance with standard e-invoicing parameters.

Extract the following into a valid JSON schema:
- sellerName: Official name
- sellerTIN: 15-digit tax number starting with 3
- issueDate: Standard ISO 8601 template
- lineItems: Array of { description, quantity, unitPrice, vatRate, vatAmount, totalWithVat }
- totalVat: Sum of all VAT components
- grandTotal: Total payable
- complianceAudit: {
    has15PercentVat: boolean,
    isTinValidSaudi: boolean (15 digits, starts/ends with 3),
    errors: string[] (Any compliance errors, in Arabic)
  }`,
    sampleInput: "شركة العبيكان للحلول الرقمية\nالرقم الضريبي: ٣٠٠٩٤٨٥٧٦٢٠٠٠٠٣\nتاريخ الفاتورة: ٢٠٢٦-٠٦-١٠\nالبيان:\n١. رخصة برنامج تخطيط الموارد - الكمية: ٢ - سعر الوحدة: ٥٠٠٠ ريال سعودي - الضريبة ١٥٪\nالإجمالي الفرعي: ١٠,٠٠٠ ريال\nالضريبة: ١,٥٠٠ ريال\nالمجموع الإجمالي: ١١,٥٠٠ ريال سعودي"
  },
  {
    id: "journal_suggestions",
    category: "assistant",
    titleAr: "صانع قيود اليومية الآلي (SOCPA)",
    titleEn: "Automated Journal Entry Creator",
    descAr: "تحليل المعاملات أو الفواتير غير المهيكلة واقتراح قيود اليومية المزدوجة المتطابقة بالهللة حسب معايير سوكبا.",
    descEn: "Translates business transactions into SOCPA double-entry ledger journals.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an elite Saudi SOCPA-certified accountant. 
Convert the user's business transaction description or invoice summary into a compliant double-entry journal voucher.

Inputs: Transaction text, amount, and VAT status.

Output Schema (JSON):
{
  "description": "Arabic summary of the journal entry purpose",
  "date": "YYYY-MM-DD",
  "lines": [
    {
      "accountCode": "Standard account code (e.g., 1101 for Cash, 2101 for Accounts Payable, 5102 for VAT Input)",
      "accountNameAr": "اسم الحساب باللغة العربية",
      "debitHalalas": 100000, // debit amount in halalas, or 0
      "creditHalalas": 0 // credit amount in halalas, or 100000
    }
  ]
}

Constraint: Debit totals MUST exactly equal Credit totals. All calculations must be performed in Saudi Halalas (1 SAR = 100 Halalas). Ensure proper accounting rules under SOCPA (e.g., assets/expenses increase on debit; liabilities/equity/revenue increase on credit).`,
    sampleInput: "تم شراء أجهزة حاسب آلي محمول للمكتب بقيمة ٢٣,٠٠٠ ريال شاملة الضريبة ١٥٪ بشيك من حساب الشركة الجاري في مصرف الراجحي."
  },
  {
    id: "forecasting",
    category: "assistant",
    titleAr: "التنبؤ بالأداء المالي والمبيعات",
    titleEn: "Financial Performance Forecasting",
    descAr: "توقع الإيرادات والمبيعات والرواتب المستقبلية بناءً على البيانات التاريخية للأشهر الماضية.",
    descEn: "Generates time-series financial forecasting based on historical transaction volume.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a predictive financial analyst engine. 
Review the historic monthly ledger data provided.
Apply linear regression and seasonal adjustments to estimate the next 3 months of financial performance.

Response Format (JSON):
{
  "predictions": [
    {
      "period": "YYYY-MM",
      "projectedRevenueHalalas": 0,
      "projectedExpenseHalalas": 0,
      "confidenceInterval": { "low": 0, "high": 0 }
    }
  ],
  "growthRatePct": 4.5,
  "primaryDriversAr": "أسباب النمو المتوقعة مثل زيادة مبيعات العقود الربعية"
}

Constraint: Make predictions specific to GCC/Saudi markets, adjusting for local variables like Ramadan, Eid, National Days, and winter seasons where appropriate. Calculations should be outputted in Halalas.`,
    sampleInput: "بيانات الإيرادات الماضية:\n- يناير ٢٠٢٦: ١٥٠,٠٠٠ ريال (المصاريف: ٩٠,٠٠٠)\n- فبراير ٢٠٢٦: ١٦٥,٠٠٠ ريال (المصاريف: ٩٢,٠٠٠)\n- مارس ٢٠٢٦: ١٨٠,٠٠٠ ريال (المصاريف: ٩٥,٠٠٠)\n- أبريل ٢٠٢٦ (موسم رمضان): ٢٤٠,٠٠٠ ريال (المصاريف: ١١٠,٠٠٠)"
  },
  {
    id: "fraud_detection",
    category: "assistant",
    titleAr: "مكافحة الاحتيال والعمليات المشبوهة",
    titleEn: "Fraud & Embezzlement Shield",
    descAr: "فحص العمليات البنكية وطلبات الصرف ومقارنتها بسلوك المستخدمين للحد من التلاعب المالي.",
    descEn: "Inspects banking transactions and expense claims for corporate fraud or double payment.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an expert Forensic Auditor specializing in Saudi corporate governance.
Audit the attached transaction database slice for indicators of compromise, collusion, or internal fraud.

Check list:
- Split invoices (multiple transactions just under approval thresholds).
- Duplicate invoice numbers or identical amounts submitted on the same day.
- Round-dollar transaction spikes (e.g. exactly 50,000 SAR without VAT details).
- Out-of-hours transactions (submitting expense claims on weekends/holidays).

Format: Output a JSON array of risk alerts. Each alert object should contain:
- "issue": Brief title of the issue in Arabic
- "severity": "Low" | "Medium" | "High" | "Critical"
- "descriptionAr": Detailed analysis in Arabic
- "suspectedLines": List of transaction identifiers or amounts
- "recommendationAr": Actionable step to mitigate or investigate further in Arabic.`,
    sampleInput: "محاولة صرف مصاريف نقدية بقيمة ٩,٩٠٠ ريال سعودي تحت بند 'خدمات استشارية مستعجلة' بدون فاتورة ضريبية رسمية، مكررة ٣ مرات في يومين متتاليين من نفس الموظف لمورد مختلف."
  },
  {
    id: "anomaly_detection",
    category: "assistant",
    titleAr: "كاشف الشذوذ المحاسبي",
    titleEn: "Accounting Anomaly Detector",
    descAr: "البحث عن الانحرافات والقيود الشاذة غير المتوقعة في ميزان المراجعة أو كشف الحساب.",
    descEn: "Scans general ledger balances for uncharacteristic accounts or unexpected spikes.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an automated bookkeeping validator. 
Scan the ledger journal lines for structural or numerical anomalies.

Anomalies to flag:
- Non-operating expense accounts debited for high values.
- Customers paying round amounts that don't match any outstanding invoice.
- Mismatch between the state of transaction and its standard VAT rate.

Output Format (JSON):
Provide a detailed audit checklist of anomalies in Arabic. The schema must include:
{
  "anomaliesFound": [
    {
      "anomalyType": "نوع الشذوذ",
      "descriptionAr": "شرح تفصيلي للانحراف باللغة العربية",
      "suggestedVerificationAr": "خطوات التحقق المحاسبي المقترحة لمطابقة الدفاتر"
    }
  ],
  "checklistStatus": "مكتمل"
}`,
    sampleInput: "رصيد حساب 'مصروفات الضيافة' قفز بنسبة ٦٥٠٪ في شهر يونيو مقارنة بالمتوسط السنوي، مع وجود قيود تسوية يدوية مباشرة مدونة كأرباح مرحلة بدون فواتير ساندة."
  },
  {
    id: "cash_flow_prediction",
    category: "assistant",
    titleAr: "مستشعر ومستشرف السيولة النقدية",
    titleEn: "Cash Flow Runway & Runway Planner",
    descAr: "تقدير مدى كفاية السيولة النقدية الحالية للوفاء بالالتزامات والمستحقات والرواتب القادمة.",
    descEn: "Calculates corporate runway and gives advice for maintaining sufficient GCC liquidity.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a liquidity risk manager. 
Given the current bank balance, accounts receivable schedules (with customer payment history/delays), and accounts payable schedules, project daily cash balances for the next 60 days.

Point out critical deficit dates where Accounts Payable demands exceed liquid cash-in-hand.

Output Format (JSON):
{
  "burnRateDailyHalalas": 0,
  "runwayDays": 0,
  "projections": [
    {
      "dayOffset": number,
      "date": "YYYY-MM-DD",
      "projectedBalanceHalalas": number,
      "deficitFlag": boolean
    }
  ],
  "criticalDeficitDates": [
    {
      "date": "YYYY-MM-DD",
      "deficitAmountHalalas": number,
      "causeAr": "سبب العجز المتوقع (مثل دفعات الموردين أو مسير الرواتب)"
    }
  ]
}`,
    sampleInput: "السيولة النقدية المتاحة بالبنك: ٣٥٠,٠٠٠ ريال سعودي.\nفواتير المبيعات قيد التحصيل (المستحقة خلال ٣٠ يوم): ١٢٠,٠٠٠ ريال.\nالالتزامات (مسير الرواتب القادم + إيجار المقر + مستحقات الموردين خلال ٣٠ يوم): ٢٨٠,٠٠٠ ريال."
  },
  {
    id: "report_explanation",
    category: "assistant",
    titleAr: "مفسر القوائم والتقارير المالية",
    titleEn: "Financial Report Explainer",
    descAr: "تحويل تقارير الأرباح والخسائر وميزان المراجعة المعقدة إلى شرح مبسط لصناع القرار غير الماليين.",
    descEn: "Simplifies financial balance sheets and income statements into high-level business insights.",
    responseMimeType: "text/plain",
    defaultPrompt: `You are the Chief Financial Officer (CFO) of Mudarij OS. 
Translate the raw financial ratios and trial balance numbers provided into a narrative Arabic executive summary.

Your narrative executive summary should focus strictly on:
- Working Capital health.
- Gross Profit margin changes vs previous quarter.
- Tax and Zakat implications of the current net asset value.
- Actionable steps to optimize cash burn rate.

Present the output as a beautiful, professional, easy-to-read memo in formal business Arabic (لهجة خليجية مهنية ورسمية).`,
    sampleInput: "صافي المبيعات: ٤٥٠,٠٠٠ ريال\nتكلفة البضاعة المباعة: ٣٠٠,٠٠٠ ريال\nإجمالي الربح: ١٥٠,٠٠٠ ريال (هامش الربح ٣٣٪)\nالمصاريف التشغيلية (الرواتب والإيجار والتسويق): ١٦٥,٠٠٠ ريال\nصافي الخسارة: -١٥,٠٠٠ ريال سعودي"
  },
  {
    id: "ai_search",
    category: "assistant",
    titleAr: "محرك البحث الذكي في الأنظمة",
    titleEn: "Intelligent Semantic Search Searcher",
    descAr: "البحث في السياسات الداخلية للشركة، ونظام العمل السعودي واللوائح الزكوية واستخلاص الفقرات المرتبطة.",
    descEn: "Locates legal clauses, tax codes, and HR bylaws relating to the user's compliance query.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an enterprise AI Knowledge Retrieval Specialist representing Mudarij OS.
Parse the user's natural language search query and provide matching regulatory references.

Map to official sources such as:
- ZATCA VAT Bylaws
- Saudi Labor Law (Articles)
- SOCPA GAAP Standards

Output JSON:
- relevantArticles: Array of {
    source: string,
    articleNumber: string,
    summaryAr: string (Arabic abstract of the regulation),
    complianceImpact: string (Action required by the SME, in Arabic)
  }
- searchConfidence: Number`,
    sampleInput: "ما هي عقوبة التأخر في رفع ملف حماية الأجور (WPS) للموظفين في نظام العمل السعودي؟"
  },
  {
    id: "workflow_automation",
    category: "assistant",
    titleAr: "منظم ومصمم سير العمل الذكي",
    titleEn: "Workflow Automation Agent",
    descAr: "تحويل طلبات المدراء الطبيعية إلى قواعد تشغيل مؤتمتة ومحفزات برمجية دقيقة.",
    descEn: "Converts natural language rules into structured automation triggers and conditional logic.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Business Process Automation Engineer specializing in GCC ERP triggers.
Convert the user's natural language request into a robust automation blueprint.

Output JSON:
- workflowNameAr: Friendly workflow title in Arabic
- triggerEvent: The event that starts the workflow (e.g. INVOICE_PAID, LEAVE_REQUEST_SUBMITTED)
- conditions: Array of variables (e.g. amount > 50000)
- actions: Sequence of operations to execute (e.g. SEND_WHATSAPP_TO_CEO, APPROVE_LEAVE_PORTAL)
- successMessageAr: Explanatory text in Arabic for the administrator.`,
    sampleInput: "إذا تجاوزت قيمة الفاتورة المصدرة ٥٠ ألف ريال، قم بإشعار المدير المالي عبر الواتس آب فوراً، وقم بتوليد تذكير سداد تلقائي بعد ١٠ أيام."
  },
  {
    id: "ai_copilot",
    category: "assistant",
    titleAr: "المساعد البرمجي المرجعي للمطورين",
    titleEn: "Developer Copilot Reference",
    descAr: "شريك المطورين لكتابة شيفرات برمجية واختبارات لربط أنظمة الفوترة والتحقق مع مدارج OS API.",
    descEn: "Provides API code snippets and SDK reference guides for developers integrating Mudarij OS.",
    responseMimeType: "text/plain",
    defaultPrompt: `You are the lead Developer Advocate for Mudarij OS.
Provide clear, robust code snippets, payload formats, and integration instructions for GCC engineers connecting their legacy applications to the Mudarij API.

All response instructions should be clear and well-commented. Emphasize security (bearer tokens, x-tenant-id headers) and compliance with Saudi ZATCA integration workflows.`,
    sampleInput: "أريد كود برمجياً بلغة Node.js لإرسال بيانات فاتورة ضريبية إلى خدمة الربط لمدارج لتوليد الختم التشفيري."
  },

  // 12. Notification Blueprints
  {
    id: "notif_in_app",
    category: "notification",
    titleAr: "تنبيهات داخل النظام (In-App Alerts)",
    titleEn: "In-App Notification Blueprint",
    descAr: "قوالب التنبيهات المباشرة التي تظهر للموظفين داخل لوحة التحكم (الإقفال، الرواتب، النطاقات).",
    descEn: "Configures real-time contextual alerts that pop up inside the Mudarij OS web dashboard.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an In-App Notification Architect. Formulate highly actionable, micro-copy notification alerts for GCC corporate dashboards.
Minimize noise, prioritize urgency, and default to Saudi corporate terms.

Output JSON:
- severity: 'info' | 'success' | 'warning' | 'error'
- titleAr: Compact title (max 40 chars)
- messageAr: Concise, informative body text (max 100 chars)
- actionLink: Dashboard target route for the action (e.g. '/payroll', '/grc/compliance')
- badges: Tag categories`,
    sampleInput: "تحديث طارئ: ملف حماية الأجور (WPS) لشهر مايو جاهز للمراجعة قبل تاريخ ١٠ لتفادي غرامات وزارة الموارد البشرية."
  },
  {
    id: "notif_email",
    category: "notification",
    titleAr: "قوالب البريد الإلكتروني (Email Blueprints)",
    titleEn: "Email Notification Blueprints",
    descAr: "صياغة خطابات رسمية وفواتير وإشعارات سداد ترسل للعملاء أو الإداريين باللغتين العربية والانجليزية.",
    descEn: "Standardizes professional bilingual email correspondence for GCC business transactions.",
    responseMimeType: "text/plain",
    defaultPrompt: `You are an executive Communications Designer specializing in corporate and tax-compliant correspondence for the Middle East.
Draft an elite, responsive HTML email blueprint.

Ensure:
- Perfect bilingual structure (Arabic right-aligned, English left-aligned)
- Professional corporate terminology
- Direct variables placeholder syntax e.g. {{invoice_number}}, {{due_date}}
- Explicit mentions of GCC VAT and compliant payment methods (Mada, Apple Pay, Bank Transfer).`,
    sampleInput: "رسالة مطالبة ودية بالدفع لفاتورة مستحقة متأخرة بقيمة ٢٥,٠٠٠ ريال للعميل 'شركة الوفاق للمقاولات'."
  },
  {
    id: "notif_sms",
    category: "notification",
    titleAr: "رسائل الجوال النصية (SMS templates)",
    titleEn: "SMS Notification Blueprints",
    descAr: "قوالب الرسائل القصيرة الفائقة الإيجاز للتنبيهات الأمنية أو كود التحقق الثنائي (OTP) أو روابط الفواتير.",
    descEn: "Structures concise 160-character mobile SMS templates with integrated checkout links.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an SMS copywriter. Your goal is to write highly compact, professional Arabic SMS notifications (including URLs) under 70 characters (or 140 max) to keep telecom costs minimal for GCC companies.

Output JSON:
- senderId: Standard brand sender name (e.g., 'MudarijOS')
- messageAr: Clean Arabic message
- characterCount: Length validation
- actionUrl: URL placeholders`,
    sampleInput: "تنبيه أمان: محاولة دخول لحسابك من متصفح غريب بالرياض. رمز التحقق الثنائي المؤقت هو: ٨٢٧٤٠١. صالح لـ ٣ دقائق."
  },
  {
    id: "notif_whatsapp",
    category: "notification",
    titleAr: "إشعارات الواتساب (WhatsApp Templates)",
    titleEn: "WhatsApp Automated Blueprints",
    descAr: "قوالب رسائل الواتساب التفاعلية مع أزرار الإجراءات السريعة لدفع الفواتير أو الموافقة على الإجازات.",
    descEn: "Designs Meta Cloud API compatible interactive WhatsApp business templates with CTA buttons.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a WhatsApp Business Template specialist. Create official templates compliant with Meta guidelines.
Include interactive buttons (Quick Replies / Call to Action).

Output JSON:
- templateName: lowercase_with_underscores
- category: UTILITY
- language: ar
- header: Title or document reference
- body: Interactive message text with parameter placeholders {{1}}, {{2}}
- buttons: Array of { type: 'URL' | 'QUICK_REPLY', text: string, payloadOrUrl: string }`,
    sampleInput: "إرسال فاتورة ضريبية مبسطة للعميل مع رابط سداد مباشر عبر مدى وبطاقات مدى الإضافية."
  },
  {
    id: "notif_push",
    category: "notification",
    titleAr: "التنبيهات الفورية للجوال (Push Notifications)",
    titleEn: "Mobile Push Blueprints",
    descAr: "صياغة تنبيهات الهواتف الذكية المخصصة لتطبيق مدارج (تحديثات سير المعاملات، والموافقات المستعجلة).",
    descEn: "Designs Android/iOS native push alert payloads for the Mudarij mobile application.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Mobile UX Writer. Structure rich push notification payloads for iOS (APNS) and Android (FCM).

Output JSON:
- notification: {
    title: Compact localized title,
    body: Catchy description with action verbs,
    sound: 'default'
  },
  data: {
    clickAction: string,
    entityId: string,
    entityType: string
  }`,
    sampleInput: "موافقة مستعجلة: تم طلب اعتماد تصفية عمالة ومستحقات نهاية خدمة من قبل مسؤول الموارد البشرية."
  },
  {
    id: "notif_webhooks",
    category: "notification",
    titleAr: "بث الأحداث البرمجية (Webhooks)",
    titleEn: "Webhook Event Payload Blueprint",
    descAr: "بناء بنية البيانات وهيكلية ملفات JSON المرسلة للأنظمة الخارجية عند وقوع أحداث مالية.",
    descEn: "Specifies JSON structures dispatched to external systems upon accounting events.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an Integration API Architect. Structure standardized Webhook payloads that are dispatched when events like 'invoice.paid' or 'payroll.locked' occur.

Provide a valid, clean JSON payload that developers can map, featuring metadata, tenant details, signature headers configuration, and a strict event payload schema.`,
    sampleInput: "أريد نموذج هيكل ويب هوك (Webhook Payload) لعملية سداد فاتورة مبيعات بنجاح."
  },
  {
    id: "notif_approval",
    category: "notification",
    titleAr: "إشعارات طلبات الاعتماد والموافقة",
    titleEn: "Approval Alert & Delegation templates",
    descAr: "قوالب توجيه الصلاحيات للمدراء الماليين لاعتماد المدفوعات أو طلبات الشراء الكبيرة.",
    descEn: "Structures high-priority approval templates highlighting delegation levels.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Corporate Governance workflow writer. Build authorization templates that provide decision makers with the exact facts needed to approve or deny a request.

Output JSON:
- documentReference: Reference code
- requesterName: Employee name
- transactionDetails: Summary of transaction
- requiredActionAr: Summary of the authority requested
- quickActionsAr: ['موافقة', 'رفض', 'طلب توضيح']`,
    sampleInput: "طلب شراء أثاث مكتب جديد بقيمة ٨٥,٠٠٠ ريال سعودي من المدير التنفيذي يتجاوز حد الصلاحية العادي الممنوح له."
  },
  {
    id: "notif_reminder_rules",
    category: "notification",
    titleAr: "قواعد التذكير والمطالبة",
    titleEn: "Dunning & Collection Reminder Rules",
    descAr: "تحديد القنوات وجدول فترات التنبيه بالمستحقات المتاخرة (قبل ٣ أيام، يوم الاستحقاق، بعد ٥ أيام).",
    descEn: "Configures scheduled dunning schedules to reduce receivable outstanding times.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Credit Control specialist. Design a dunning reminder sequence for unpaid invoices.

Output JSON:
- intervals: Array of {
    daysFromDueDate: number (Negative is before, positive is after),
    channel: 'EMAIL' | 'SMS' | 'WHATSAPP',
    tone: 'Friendly' | 'Firm' | 'Legal_Warning',
    headlineAr: Suggested headline in Arabic,
    contentSnippetAr: Text snippet in Arabic
  }`,
    sampleInput: "أريد خطة تذكيرات تلقائية متكاملة لفاتورة آجلة مستحقة السداد بعد ٣٠ يوماً."
  },
  {
    id: "notif_center",
    category: "notification",
    titleAr: "إعدادات مركز الإشعارات الشامل",
    titleEn: "Notification Center Orchestrator",
    descAr: "لوحة التحكم التي تنظم توجيه التنبيهات حسب خطورة الحدث وطبيعة منصب الموظف.",
    descEn: "Orchestrates multi-channel routing preferences based on severity levels.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an Enterprise System Architect. Create a master orchestration schema in JSON that maps business event severities to their primary and secondary alert channels, ensuring regulatory compliance alerts cannot be turned off.`,
    sampleInput: "تهيئة مركز تنبيهات يضمن إرسال تنبيهات الرواتب وحماية الأجور عبر الجوال والبريد معاً ولا يمكن إلغاؤها من الموظف."
  },
  {
    id: "notif_preferences",
    category: "notification",
    titleAr: "تفضيلات المستخدمين وخيارات القنوات",
    titleEn: "User Channel Preferences Blueprint",
    descAr: "شاشات وخيارات تمنح الموظف والعميل إمكانية اختيار قنوات الاتصال المفضلة لديه.",
    descEn: "Structures preference-saving schemas for client and employee communication channels.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an application state designer. Write a JSON structure representing a user's subscription state to different system notification nodes, ensuring compliance with local telecom anti-spam rules.`,
    sampleInput: "نموذج لحفظ إعدادات الموظف لتلقي إشعارات الحضور والانصراف عبر تطبيق الجوال بدلاً من البريد الإلكتروني."
  },

  // 13. Settings Prompts
  {
    id: "settings_company",
    category: "settings",
    titleAr: "إعدادات الشركة والمنشأة",
    titleEn: "Company Registration Settings",
    descAr: "تنظيم بيانات الهوية الرسمية للشركة، السجل التجاري، والشهادة الضريبية والامتثال لبلدي.",
    descEn: "Structures and validates Saudi official entity settings including Commercial Registrations.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Corporate Secretary specializing in Saudi Arabian commercial bylaws and Ministry of Commerce rules.
Verify and structure corporate registry settings.

Output JSON:
- crNumber: Validated 10-digit registration number
- entityNameAr: Official Arabic name on CR
- entityNameEn: Official English name
- cityOfRegistration: Major Saudi city
- chamberOfCommerceNumber: Chamber ID
- validityStatus: 'Active' | 'Expired' | 'Pending_Renewal'
- issuesFoundAr: Array of issues or missing details.`,
    sampleInput: "رقم السجل التجاري: ١٠١٠٢٣٨٤٧٥، شركة مدارج السعودية المحدودة، الرياض، منتهي في ١٤٤٧/٠٩/١٥هـ."
  },
  {
    id: "settings_financial",
    category: "settings",
    titleAr: "الإعدادات المالية والسنوات المالية",
    titleEn: "Financial Year & Chart of Accounts Settings",
    descAr: "تهيئة تاريخ بدء وإغلاق السنة المالية، والعملة الأساسية وفروق العملات الخليجية.",
    descEn: "Orchestrates structural fiscal year boundaries and standard multicurrency peg rates.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a SOCPA Senior Accountant setting up the financial module for a new SME in Mudarij OS.
Formulate the fiscal year parameters, reporting currency (SAR), and primary account dimensions in a clean, compliant JSON format.`,
    sampleInput: "بدء السنة المالية من ١ يناير ٢٠٢٦ وتنتهي في ٣١ ديسمبر ٢٠٢٦، مع تفعيل عملة الريال السعودي والدرهم الإماراتي كمجموعة عملات تشغيلية."
  },
  {
    id: "settings_tax",
    category: "settings",
    titleAr: "إعدادات الضرائب والامتثال لـ ZATCA",
    titleEn: "Tax Rates & ZATCA Phase 2 Config",
    descAr: "إدارة معدلات ضريبة القيمة المضافة، والربط والختم الإلكتروني الخاص بـ (هيئة الزكاة والجمارك).",
    descEn: "Manages VAT brackets (15%, 0%, Exempt) and cryptographic API keys for ZATCA sandbox.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Saudi Tax Advisor specialized in VAT and ZATCA Phase 2 (Fatoora) onboarding.
Configure the cryptographic onboarding variables and VAT brackets.

Output a highly detailed JSON schema containing:
- vatRateStandard: 0.15
- exemptedCategories: Array of items
- zatcaEnvironment: 'Sandbox' | 'Simulation' | 'Production'
- cryptographicKeysStatus: {
    privateKeyGenerated: boolean,
    csrSubmitted: boolean,
    binarySecurityTokenRetrieved: boolean
  }
- validationMessageAr: Assessment of readiness.`,
    sampleInput: "إعدادات الربط لبيئة التجريب والتحقق (Simulation) لـ ZATCA مع إدخال رقم الشهادة المؤقتة وتحديد الأنشطة المعفاة مثل التعليم الأهلي للمواطنين."
  },
  {
    id: "settings_invoice",
    category: "settings",
    titleAr: "إعدادات وتصاميم الفواتير",
    titleEn: "Invoice Design & Layout Settings",
    descAr: "تحديد عناصر قالب الفاتورة من شعار، وحقول معتمدة، وحسابات بنكية (IBAN) للمدفوعات.",
    descEn: "Defines visual tax invoice elements, including QR structures and banking details.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an Invoice Design coordinator. Standardize invoice layouts to meet the strict regulatory guidelines of ZATCA (QR code with seller name, VAT number, timestamp, totals) while maintaining corporate branding.

Output compliant JSON metadata for invoice rendering engines.`,
    sampleInput: "شعار الشركة بالأعلى، إظهار رقم السجل التجاري ورقم الآيبان لمصرف الراجحي مع طباعة رمز الاستجابة السريعة (QR) في الجانب الأيسر السفلي."
  },
  {
    id: "settings_inventory",
    category: "settings",
    titleAr: "إعدادات المستودعات والمخزون",
    titleEn: "Inventory & Warehouse Settings",
    descAr: "طريقة تقييم المخزون (الوارد أولاً يصرف أولاً FIFO) ومستويات إعادة الطلب والربط الجمركي.",
    descEn: "Defines inventory evaluation metrics (FIFO/LIFO/AVCO) and minimum SKU thresholds.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an Inventory Logistics manager. Configure standard warehouse parameters and SKU alerts.

Output JSON:
- evaluationMethod: 'FIFO' | 'LIFO' | 'AVCO'
- warehouses: Array of warehouses with GCC addresses
- autoReorderThresholdPercent: Minimum margin before alerting
- integrationWithCustoms: Boolean.`,
    sampleInput: "مستودع السلي بالرياض، طريقة التقييم: الوارد أولاً يصرف أولاً، تنبيه عند انخفاض المخزون عن ٢٠٪."
  },
  {
    id: "settings_crm",
    category: "settings",
    titleAr: "إعدادات علاقات العملاء (CRM)",
    titleEn: "CRM Lead Pipeline Settings",
    descAr: "تهيئة مراحل التدفق للعملاء المحتملين، وقواعد التخصيص التلقائي لموظفي المبيعات.",
    descEn: "Configures CRM lead stages and auto-routing rules to specialized sales agents.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Sales Operations Director. Set up a CRM pipeline configuration tailored for B2B transactions in the Gulf.

Output JSON:
- pipelineStages: Array of localized stages (e.g. 'جاري التواصل', 'طلب تسعير', 'تفاوض قانوني', 'مكتملة')
- leadScoringRules: Matrix mapping deal sizes to VIP account executives
- assignmentPolicy: 'Round_Robin' | 'Performance_Based'.`,
    sampleInput: "مراحل المبيعات: عميل محتمل جديد، تم إرسال العرض المالي، التفاوض والمراجعة، تم التوقيع أو الخسارة."
  },
  {
    id: "settings_user",
    category: "settings",
    titleAr: "إعدادات المستخدمين والصلاحيات (RBAC)",
    titleEn: "RBAC User Roles Settings",
    descAr: "تحديد أدوار الموظفين (مدير مالي، إداري، محاسب، مدقق خارجي) والصلاحيات المقترنة بها.",
    descEn: "Defines secure Role-Based Access Control matrix for corporate staff.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Cybersecurity Compliance Officer. Formulate a secure, ZATCA and SOCPA audit-compliant Role-Based Access Control matrix.

Output JSON mapping roles (Admin, Accountant, HR_Manager, Auditor) to system features (Payroll, Invoicing, Tax_Filings, Logs) with permission levels ('Read', 'Write', 'Approve', 'None').`,
    sampleInput: "تحديد صلاحيات 'المحاسب المساعد': إدخال الفواتير وقيد اليومية كمسودة، بدون صلاحية اعتماد الدفعات أو تعديل مسير الرواتب المعتمد."
  },
  {
    id: "settings_branding",
    category: "settings",
    titleAr: "إعدادات الهوية والشعار والخطوط",
    titleEn: "Visual Branding Settings",
    descAr: "تهيئة الهوية البصرية للعميل، من درجات الألوان الأساسية، والخط العربي والإنجليزية المعتمدين.",
    descEn: "Defines UI color palettes, typographic hierarchies, and logo resources.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Visual Identity brand guidelines expert. Configure CSS variables, fonts (such as Cairo, Inter), and logo assets for a white-label SME ERP system.

Output valid theme metadata in JSON.`,
    sampleInput: "اللون الرئيسي: أخضر كلاسيكي (#1D4ED8)، الخط العربي: تجوال (Tajawal)، خلفية واجهة العميل: رمادي خفيف."
  },
  {
    id: "settings_numbering",
    category: "settings",
    titleAr: "إعدادات تسلسل وترقيم المستندات",
    titleEn: "Document Auto-Numbering Settings",
    descAr: "ضبط صيغ وبادئات الترقيم التلقائي للفواتير وعروض الأسعار وأوامر الصرف وتفادي التكرار.",
    descEn: "Defines sequence patterns and prefixes for invoices and transaction records.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Systems Database Engineer. Formulate a strict document numbering format that prevents gaps or duplication in sequence (critical for tax and audit compliance).

Output JSON setting prefix, suffix, minimum digits, and reset schedules.`,
    sampleInput: "فاتورة المبيعات الضريبية تبدأ بـ 'INV-2026-' متبوعاً بـ ٦ خانات رقمية متسلسلة تبدأ من ٠٠٠٠٠١."
  },
  {
    id: "settings_languages",
    category: "settings",
    titleAr: "إعدادات اللغات المترجمة",
    titleEn: "Bilingual Localization Settings",
    descAr: "تفعيل اللغات وتصنيف الفواتير والتقارير ثنائية اللغة لتلبية اشتراطات وزارة التجارة وهيئة الزكاة.",
    descEn: "Enables multi-language and dual-column rendering capabilities for regulatory printouts.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Translation Manager. Configure the locales list, default language, and dictionary fallbacks for a bilingual GCC ERP platform.

Output JSON:
- supportedLocales: ['ar', 'en']
- defaultLocale: 'ar'
- fallbackLocale: 'en'
- printTemplateMode: 'Bilingual_Dual_Column' (Arabic on right, English on left).`,
    sampleInput: "تعيين اللغة العربية كلغة افتراضية للنظام والطباعة، مع إتاحة الإنجليزية كخيار رديف للعملاء الأجانب."
  },
  {
    id: "settings_timezones",
    category: "settings",
    titleAr: "إعدادات الوقت والمناطق الزمنية",
    titleEn: "Timezone & Calendar Settings",
    descAr: "ضبط المنطقة الزمنية الرسمية (توقيت مكة والرياض) والتقويم الافتراضي (هجري/ميلادي).",
    descEn: "Sets system timezone and hijri calendar shifts for official Saudi holidays.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a GCC Localization Engineer. Configure the timezone, work week (Sunday to Thursday as standard corporate/public sector default in Saudi), and dual Hijri/Gregorian calendar setups. Output the compliant JSON schema.`,
    sampleInput: "المنطقة الزمنية: الرياض (+3 GMT)، أيام العمل: من الأحد إلى الخميس، والتقويم الافتراضي للرواتب: ميلادي مع إظهار الهجري."
  },
  {
    id: "settings_backup",
    category: "settings",
    titleAr: "خيارات الاحتفاظ بالبيانات والنسخ الاحتياطي",
    titleEn: "Data Backup & Retention Strategy",
    descAr: "قواعد وجدولة النسخ الاحتياطي المشفر على سحابة جوجل السعودية وحفظ الفواتير لعشر سنوات.",
    descEn: "Configures encrypted backup schedules and the 10-year ZATCA invoice retention rule.",
    responseMimeType: "application/json",
    defaultPrompt: `You are an IT Security Director. Define an encrypted database backup strategy that guarantees compliance with ZATCA and Saudi cyber security guidelines (holding records for 10 years).

Output JSON config detailing schedules, target bucket regions (KSA Riyadh Cloud Region), encryption level, and mock restore checks.`,
    sampleInput: "جدولة نسخ احتياطي تلقائي يومي عند الساعة ٢ صباحاً مشفر بالكامل بـ AES-256 وتخزينه في خوادم سحابية محلية بالرياض لمدة ١٠ سنوات."
  },
  {
    id: "settings_feature_flags",
    category: "settings",
    titleAr: "إعدادات رايات الخصائص المتقدمة",
    titleEn: "Feature Flag & Modular Enablers",
    descAr: "تفعيل أو تعطيل ميزات الذكاء الاصطناعي التجريبية، ووحدات الـ GRC، والامتثال الاستباقي.",
    descEn: "Manages advanced app feature gates and beta AI module switches for progressive rollouts.",
    responseMimeType: "application/json",
    defaultPrompt: `You are a Product Release Manager. Define the state configuration of advanced beta toggles and GRC controls.

Output JSON:
- flags: Array of flags with keys, status, targetGroups (internal/external), and riskLevels.`,
    sampleInput: "تفعيل نظام التنبؤ بالتدفق النقدي الذكي كخصيصة تجريبية (BETA) للمدراء التنفيذيين والشركات المصنفة كـ VIP فقط."
  }
];

export default function AIPromptLibrary() {
  const { user } = useUser();
  const [blueprints, setBlueprints] = useState<Blueprint[]>(DEFAULT_BLUEPRINTS);
  const [selectedBlueprint, setSelectedBlueprint] = useState<Blueprint>(DEFAULT_BLUEPRINTS[0]);
  const [activeCategory, setActiveCategory] = useState<"all" | "assistant" | "notification" | "settings">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Sandbox states
  const [promptText, setPromptText] = useState(DEFAULT_BLUEPRINTS[0].defaultPrompt);
  const [inputData, setInputData] = useState(DEFAULT_BLUEPRINTS[0].sampleInput);
  const [mimeType, setMimeType] = useState<"text/plain" | "application/json">(DEFAULT_BLUEPRINTS[0].responseMimeType);
  const [playgroundOutput, setPlaygroundOutput] = useState<string>("");
  const [jsonResult, setJsonResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [activePlaygroundTab, setActivePlaygroundTab] = useState<"output" | "editor">("output");

  // Sync sandbox state when selected blueprint changes
  useEffect(() => {
    setPromptText(selectedBlueprint.defaultPrompt);
    setInputData(selectedBlueprint.sampleInput);
    setMimeType(selectedBlueprint.responseMimeType);
    setPlaygroundOutput("");
    setJsonResult(null);
  }, [selectedBlueprint]);

  // Load custom saved prompts from Firestore
  useEffect(() => {
    const loadSavedPrompts = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "companies_config", user.uid || "default_tenant", "ai_prompts", "custom_blueprints");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const savedData = docSnap.data().blueprints || {};
          const merged = DEFAULT_BLUEPRINTS.map(bp => {
            if (savedData[bp.id]) {
              return {
                ...bp,
                defaultPrompt: savedData[bp.id].promptText || bp.defaultPrompt,
                sampleInput: savedData[bp.id].sampleInput || bp.sampleInput
              };
            }
            return bp;
          });
          setBlueprints(merged);
          // Sync currently selected if it got updated
          const currentUpdated = merged.find(bp => bp.id === selectedBlueprint.id);
          if (currentUpdated) {
            setSelectedBlueprint(currentUpdated);
          }
        }
      } catch (err) {
        console.error("Failed to load custom prompts:", err);
      }
    };
    loadSavedPrompts();
  }, [user]);

  // Save changes to Firestore
  const handleSavePrompt = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول كإداري لحفظ التعديلات.");
      return;
    }
    setSaveLoading(true);
    try {
      const docRef = doc(db, "companies_config", user.uid || "default_tenant", "ai_prompts", "custom_blueprints");
      
      // Load current document to merge
      const docSnap = await getDoc(docRef);
      const existingData = docSnap.exists() ? docSnap.data().blueprints || {} : {};

      const updatedBlueprints = {
        ...existingData,
        [selectedBlueprint.id]: {
          promptText: promptText,
          sampleInput: inputData,
          updatedAt: new Date().toISOString()
        }
      };

      await setDoc(docRef, { blueprints: updatedBlueprints }, { merge: true });

      // Update local blueprints state
      setBlueprints(prev => prev.map(bp => {
        if (bp.id === selectedBlueprint.id) {
          return {
            ...bp,
            defaultPrompt: promptText,
            sampleInput: inputData
          };
        }
        return bp;
      }));

      // Update selected
      setSelectedBlueprint(prev => ({
        ...prev,
        defaultPrompt: promptText,
        sampleInput: inputData
      }));

      toast.success("تم حفظ تعديلات الموجه بنجاح وتعميمها على النظام!");
    } catch (err: any) {
      toast.error(`فشل حفظ الموجه: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Reset to default
  const handleResetToDefault = () => {
    const original = DEFAULT_BLUEPRINTS.find(bp => bp.id === selectedBlueprint.id);
    if (original) {
      setPromptText(original.defaultPrompt);
      setInputData(original.sampleInput);
      setMimeType(original.responseMimeType);
      toast.info("تمت استعادة الإعدادات المصنعية الموصى بها.");
    }
  };

  // Test the prompt using our secure server API route
  const handleRunPlayground = async () => {
    setIsRunning(true);
    setPlaygroundOutput("");
    setJsonResult(null);
    setActivePlaygroundTab("output");
    try {
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("لم نتمكن من الحصول على معرف الجلسة الآمن.");
      }

      const response = await fetch("/api/negotiations/test-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          prompt: promptText,
          inputData: inputData,
          responseMimeType: mimeType
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || `خطأ من الخادم: ${response.status}`);
      }

      const resData = await response.json();
      if (resData.success) {
        setPlaygroundOutput(resData.text);
        if (resData.isJson && resData.jsonPayload) {
          setJsonResult(resData.jsonPayload);
        } else if (mimeType === "application/json") {
          // Attempt manual parsing if response is raw string but expected JSON
          try {
            const parsed = JSON.parse(resData.text.trim());
            setJsonResult(parsed);
          } catch {
            // Check if contains markdown codeblock
            const cleanText = resData.text.replace(/```json/g, "").replace(/```/g, "").trim();
            try {
              const parsed = JSON.parse(cleanText);
              setJsonResult(parsed);
            } catch {
              setJsonResult(null);
            }
          }
        }
        toast.success("اكتمل تشغيل النموذج التجريبي بنجاح!");
      } else {
        throw new Error(resData.error || "فشل تنفيذ الطلب.");
      }
    } catch (err: any) {
      console.error(err);
      setPlaygroundOutput(`⚠️ خطأ في التشغيل:\n\n${err.message || err}`);
      toast.error("فشل تنفيذ الموجه المحاسبي.");
    } finally {
      setIsRunning(false);
    }
  };

  // Filtered blueprints list
  const filteredBlueprints = blueprints.filter(bp => {
    const matchesCategory = activeCategory === "all" || bp.category === activeCategory;
    const matchesSearch = 
      bp.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bp.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bp.descAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bp.descEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bp.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="bg-zinc-50 rounded-3xl border border-zinc-200 overflow-hidden shadow-sm" dir="rtl">
      {/* Top Header */}
      <div className="bg-white p-6 md:p-8 border-b border-zinc-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                مكتبة الموجهات والمسودات الذكية
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">بوابة المطورين و GRC</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-1 font-medium">
                تخصيص وضبط موجهات الذكاء الاصطناعي (Mudarij AI)، قوالب الإشعارات والويب هوكس، وإعدادات المنشأة المتوافقة مع أنظمة الزكاة وسوكبا وقوانين العمل بالمملكة.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 self-start md:self-auto">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeCategory === "all" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              الكل ({blueprints.length})
            </button>
            <button
              onClick={() => setActiveCategory("assistant")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === "assistant" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              <Bot className="w-3.5 h-3.5" />
              الذكاء الاصطناعي
            </button>
            <button
              onClick={() => setActiveCategory("notification")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === "notification" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              <Bell className="w-3.5 h-3.5" />
              الإشعارات
            </button>
            <button
              onClick={() => setActiveCategory("settings")}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeCategory === "settings" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              <Sliders className="w-3.5 h-3.5" />
              الإعدادات
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mt-6">
          <Search className="absolute right-4 top-3.5 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="ابحث عن ميزة مخصصة، موجه، أو إطار امتثال (مثال: ZATCA, SOCPA, رواتب، فواتير...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pr-11 pl-4 py-3 text-xs font-medium focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Main Content Layout - Split Screen Catalog vs Customizer Playground */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[600px] bg-zinc-100">
        
        {/* Left Side: Catalog of prompts */}
        <div className="lg:col-span-4 border-l border-zinc-200 bg-white max-h-[750px] overflow-y-auto divide-y divide-zinc-100">
          {filteredBlueprints.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
              <p className="text-xs font-bold">لا توجد موجهات تطابق البحث</p>
            </div>
          ) : (
            filteredBlueprints.map((bp) => {
              const isSelected = selectedBlueprint.id === bp.id;
              return (
                <button
                  key={bp.id}
                  onClick={() => setSelectedBlueprint(bp)}
                  className={`w-full p-4 text-right flex items-start gap-3 transition-colors ${isSelected ? "bg-emerald-50/70 border-r-4 border-emerald-500" : "hover:bg-zinc-50"}`}
                >
                  <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                    bp.category === "assistant" ? "bg-indigo-50 text-indigo-600" :
                    bp.category === "notification" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {bp.category === "assistant" && <Bot className="w-4 h-4" />}
                    {bp.category === "notification" && <Bell className="w-4 h-4" />}
                    {bp.category === "settings" && <Sliders className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs font-black truncate ${isSelected ? "text-emerald-900" : "text-zinc-900"}`}>
                        {bp.titleAr}
                      </p>
                      <span className="text-[9px] font-bold text-zinc-400 font-mono">
                        {bp.id.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                      {bp.descAr}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                        bp.category === "assistant" ? "bg-indigo-50 text-indigo-700 border border-indigo-100" :
                        bp.category === "notification" ? "bg-amber-50 text-amber-700 border border-amber-100" : 
                        "bg-emerald-50 text-emerald-700 border border-emerald-100"
                      }`}>
                        {bp.category === "assistant" ? "مساعد ذكي" : bp.category === "notification" ? "إشعار" : "إعدادات"}
                      </span>
                      {bp.responseMimeType === "application/json" && (
                        <span className="text-[9px] bg-zinc-100 text-zinc-600 border border-zinc-200 px-1.5 py-0.5 rounded font-mono font-bold">
                          JSON
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Side: Interactive Prompt Customizer & Gemini Playground */}
        <div className="lg:col-span-8 flex flex-col max-h-[750px] overflow-y-auto">
          
          {/* Section 1: Interactive System Prompt Editor */}
          <div className="bg-white p-6 border-b border-zinc-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg text-zinc-500 font-bold font-mono">
                    {selectedBlueprint.category.toUpperCase()} / {selectedBlueprint.id}
                  </span>
                  <Globe className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-[10px] text-zinc-400 font-mono font-medium">{selectedBlueprint.titleEn}</span>
                </div>
                <h3 className="text-md font-black text-zinc-900 mt-1">{selectedBlueprint.titleAr}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefault}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg flex items-center gap-1 border border-transparent hover:border-zinc-200 transition-all"
                  title="استعادة الموجه الافتراضي للمملكة"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  استعادة الافتراضي
                </button>
                <button
                  onClick={handleSavePrompt}
                  disabled={saveLoading}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
                >
                  {saveLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  حفظ وتعميم
                </button>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  موجه النظام لـ Gemini (System Instruction)
                </label>
                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> متوافق مع معايير ZATCA و SOCPA
                </span>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-zinc-200 focus-within:ring-2 focus-within:ring-emerald-500/10">
                <div className="absolute top-3 left-4 text-[10px] text-zinc-400 font-mono select-none" dir="ltr">
                  SYSTEM PROMPT
                </div>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="w-full min-h-[180px] bg-zinc-50/50 p-4 pt-8 text-xs font-mono leading-relaxed outline-none resize-y"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Sandbox Input & Play Run */}
          <div className="p-6 bg-zinc-50/50 flex-1 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Input Panel */}
              <div className="bg-white p-5 rounded-2xl border border-zinc-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                      بيانات المدخلات التجريبية (Sample Input Context)
                    </label>
                    <button
                      onClick={() => setInputData(selectedBlueprint.sampleInput)}
                      className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
                    >
                      <RefreshCw className="w-2.5 h-2.5" /> إعادة ضبط المثال
                    </button>
                  </div>
                  <textarea
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    className="w-full min-h-[140px] bg-zinc-50 border border-zinc-100 rounded-xl p-3 text-xs leading-relaxed outline-none font-mono resize-none"
                    placeholder="أدخل نصاً محاسبياً أو معاملات لتمريرها للموجه المختار..."
                  />
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 font-bold">هيكل الرد المطلوب:</span>
                    <select
                      value={mimeType}
                      onChange={(e) => setMimeType(e.target.value as any)}
                      className="bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[10px] font-bold focus:ring-1 focus:ring-emerald-500/20 text-zinc-600 outline-none"
                    >
                      <option value="text/plain">نص عادي (Text)</option>
                      <option value="application/json">مصفوفة منظمة (Structured JSON)</option>
                    </select>
                  </div>

                  <button
                    onClick={handleRunPlayground}
                    disabled={isRunning}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg disabled:opacity-50"
                  >
                    {isRunning ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        جاري المعالجة...
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        تجربة الموجه بـ Gemini
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Live Gemini Output Panel */}
              <div className="bg-zinc-900 text-zinc-100 rounded-2xl border border-zinc-800 p-5 flex flex-col min-h-[220px]">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>مخرجات النموذج المباشرة (Gemini 3.5 Flash)</span>
                  </div>
                  {playgroundOutput && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(playgroundOutput);
                          toast.success("تم نسخ المخرجات للحافظة.");
                        }}
                        className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="نسخ المخرجات"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex bg-zinc-800 p-0.5 rounded-lg text-[9px] font-bold">
                        <button
                          onClick={() => setActivePlaygroundTab("output")}
                          className={`px-2 py-1 rounded ${activePlaygroundTab === "output" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
                        >
                          المستند
                        </button>
                        {jsonResult && (
                          <button
                            onClick={() => setActivePlaygroundTab("editor")}
                            className={`px-2 py-1 rounded ${activePlaygroundTab === "editor" ? "bg-zinc-700 text-white" : "text-zinc-400"}`}
                          >
                            محلل JSON
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-auto max-h-[180px] text-xs font-mono leading-relaxed text-zinc-300" dir={activePlaygroundTab === "output" ? "rtl" : "ltr"}>
                  {isRunning ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-zinc-500 py-8">
                      <Cpu className="w-8 h-8 text-emerald-500 animate-pulse" />
                      <p className="text-[10px] font-bold animate-pulse">جاري إرسال الطلب إلى Gemini 3.5 واستخراج النتائج...</p>
                    </div>
                  ) : playgroundOutput ? (
                    activePlaygroundTab === "editor" && jsonResult ? (
                      <pre className="text-emerald-400 p-2 bg-black/30 rounded-xl overflow-x-auto text-[11px] leading-normal" dir="ltr">
                        {JSON.stringify(jsonResult, null, 2)}
                      </pre>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans p-1 text-[11px] leading-relaxed text-zinc-200">
                        {playgroundOutput}
                      </div>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-zinc-600 py-10">
                      <HelpCircle className="w-8 h-8 opacity-30 mb-2" />
                      <p className="text-[10px] font-bold">اضغط على زر التشغيل لرؤية مخرجات الذكاء الاصطناعي الحقيقية</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* SME Compliance Guardrail Notes Banner */}
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-8 h-8 bg-white border border-amber-100 rounded-xl flex items-center justify-center text-amber-500 shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <p className="text-[11px] font-bold text-amber-950">إرشادات GRC للامتثال والرقابة الفنية</p>
                <p className="text-[10px] text-amber-800 leading-relaxed">
                  عند حفظ وتعميم أي موجه مخصص، يتم تعميمه فوراً على خادم الويب والمكونات المستهدفة (كاستخلاص الفواتير أو قارئ الإيصالات). تضمن هذه الموجهات مطابقة الفواتير لاشتراطات مرحلة الفاتورة الإلكترونية لـ ZATCA، وتصنيفات الحسابات لهيئة سوكبا، وقوانين وزارة الموارد البشرية السعودية لحماية الأجور (WPS).
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
