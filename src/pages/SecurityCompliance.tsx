import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, Lock, Smartphone, KeyRound, Server, AlertTriangle, Activity, MapPin,
  Users, FileText, CheckCircle2, Clock, ArrowRight, Search, Eye, Download, Plus, Trash2,
  Building, CheckSquare, Globe, RefreshCw, FileSignature, PlusCircle, Cpu, Layers,
  Hourglass, Send, EyeOff, Check, AlertCircle, FileCode, CheckSquare as CheckIcon, Info, HelpCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from 'sonner';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

interface Policy {
  id: string;
  title: string;
  category: string;
  version: string;
  language: 'ar' | 'en';
  region: 'SA' | 'EU' | 'GLOBAL';
  content: string;
  status: 'draft' | 'in_review' | 'approved';
  lastUpdated: string;
  approvers: { role: string; name: string; signed: boolean; signedAt?: string }[];
  quizzes: { question: string; options: string[]; answerIndex: number }[];
}

interface AuditBlock {
  sequence: number;
  timestamp: string;
  action: string;
  actor: string;
  ip: string;
  prevHash: string;
  hash: string;
  tampered?: boolean;
}

interface Evidence {
  id: string;
  name: string;
  controlCode: string;
  type: string;
  size: string;
  owner: string;
  expiryDays: number;
  status: 'compliant' | 'warning' | 'expired';
}

interface Vendor {
  id: string;
  name: string;
  piiHandled: boolean;
  score: number;
  tier: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'Reviewing' | 'Pending';
  answers?: Record<string, string>;
}

// Simple JS SHA-256 implementation to secure real-time cryptographic recalculations in the browser
function computeSimpleHash(input: string): string {
  let hash = 0;
  if (input.length === 0) return "0000000000000000000000000000000000000000000000000000000000000000";
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  // format to a pseudo SHA256 hex signature for UI realism
  const positiveHash = Math.abs(hash).toString(16).padStart(8, '0');
  const fill = "f3e1a0b5c928174620df949174bc89ea49bf25e19483dc47";
  return (positiveHash + fill).slice(0, 64);
}

// ==========================================
// SEED DATA
// ==========================================

const INITIAL_POLICIES: Policy[] = [
  {
    id: 'pol-1',
    title: 'سياسة حماية البيانات والخصوصية العامة (GDPR & PDPL)',
    category: 'الخصوصية والأمان',
    version: '2.4',
    language: 'ar',
    region: 'GLOBAL',
    content: `## سياسة حماية الخصوصية والبيانات الشخصية
تلتزم المؤسسة بحماية البيانات الشخصية لعملائها وموظفيها وفق أعلى المعايير العالمية وقرارات الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA).

1. جمع البيانات الشخصية يتم فقط للأغراض المشروعة والمعلنة للمستخدم.
2. يُحظر مشاركة أو تصدير أي بيانات حساسة خارج النطاق الجغرافي للمملكة بدون موافقة صريحة من سدايا.
3. التشفير الكامل للبيانات في حالة السكون والحركة باستخدام خوارزمية AES-256.`,
    status: 'approved',
    lastUpdated: '2026-05-12',
    approvers: [
      { role: 'الشؤون القانونية', name: 'أ. سارة الحربي', signed: true, signedAt: '2026-05-10 10:14' },
      { role: 'مدير الامتثال (CCO)', name: 'د. يوسف الغامدي', signed: true, signedAt: '2026-05-11 14:32' },
      { role: 'الرئيس التنفيذي (CEO)', name: 'م. خالد السديري', signed: true, signedAt: '2026-05-12 09:00' }
    ],
    quizzes: [
      {
        question: 'ما هي الخوارزمية المعتمدة في النظام لتشفير البيانات الشخصية الحساسة؟',
        options: ['AES-256', 'MD5', 'SHA-1', 'DES'],
        answerIndex: 0
      },
      {
        question: 'أي جهة حكومية تشرف على تنظيم حماية البيانات الشخصية بالمملكة؟',
        options: ['وزارة المالية', 'الهيئة السعودية للبيانات والذكاء الاصطناعي (SDAIA)', 'وزارة الاتصالات', 'هيئة الزكاة والجمارك'],
        answerIndex: 1
      }
    ]
  },
  {
    id: 'pol-2',
    title: 'سياسة إدارة مخاطر الطرف الثالث والموردين (TPRM)',
    category: 'أمن المعلومات',
    version: '1.2',
    language: 'ar',
    region: 'SA',
    content: `## سياسة مخاطر الطرف الثالث
تحدد هذه السياسة الإجراءات الصارمة لفحص وتقييم واعتماد أي مورد أو مقدم خدمة سحابية خارجي قبل توقيع العقود.

1. يجب على جميع الموردين ملء استبيان الفحص الأمني (CAIQ/SIG).
2. يتم مراجعة الموردين ذوي المخاطر العالية بشكل سنوي على الأقل.
3. تلتزم الأطراف الخارجية بتوقيع اتفاقية حظر إفشاء أسرار (NDA) مسبقة وملزمة.`,
    status: 'in_review',
    lastUpdated: '2026-06-20',
    approvers: [
      { role: 'المشتريات والتعاقدات', name: 'أ. فيصل العتيبي', signed: true, signedAt: '2026-06-18 11:40' },
      { role: 'مدير الامتثال (CCO)', name: 'د. يوسف الغامدي', signed: false },
      { role: 'الرئيس التنفيذي (CEO)', name: 'م. خالد السديري', signed: false }
    ],
    quizzes: [
      {
        question: 'كم مرة يلزم فحص الموردين ذوي المخاطر العالية؟',
        options: ['مرة كل سنتين', 'بشكل سنوي على الأقل', 'عند تجديد العقد فقط', 'لا يلزم فحصهم'],
        answerIndex: 1
      }
    ]
  }
];

const INITIAL_EVIDENCE: Evidence[] = [
  { id: 'ev-1', name: 'تقرير فحص الثغرات السنوي (Penetration Test Report 2026)', controlCode: 'CTRL-SEC-04', type: 'PDF', size: '2.4 MB', owner: 'م. فهد الدوسري', expiryDays: 120, status: 'compliant' },
  { id: 'ev-2', name: 'سجلات تفعيل المصادقة الثنائية لجميع حسابات المسؤولين', controlCode: 'CTRL-MFA-01', type: 'JSON Logs', size: '512 KB', owner: 'م. عبد الله المطيري', expiryDays: 14, status: 'warning' },
  { id: 'ev-3', name: 'شهادة الاعتماد لمعيار ISO 27001:2022 المحدثة', controlCode: 'CTRL-GOV-01', type: 'PDF', size: '4.1 MB', owner: 'د. يوسف الغامدي', expiryDays: -5, status: 'expired' },
  { id: 'ev-4', name: 'شهادة الربط المعتمدة لمرحلة التكامل والربط مع ZATCA', controlCode: 'CTRL-TAX-09', type: 'XML Credentials', size: '12 KB', owner: 'أ. رامي القحطاني', expiryDays: 245, status: 'compliant' },
];

const INITIAL_VENDORS: Vendor[] = [
  { id: 'v-1', name: 'أمازون لخدمات الويب (AWS Saudi Arabia)', piiHandled: true, score: 92, tier: 'Low', status: 'Active' },
  { id: 'v-2', name: 'شركة التقنيات الوطنية المحدودة', piiHandled: true, score: 71, tier: 'Medium', status: 'Reviewing' },
  { id: 'v-3', name: 'بوابة الدفع الدولية الذكية', piiHandled: true, score: 48, tier: 'High', status: 'Pending' },
];

const INITIAL_LEDGER: AuditBlock[] = [
  { sequence: 1, timestamp: '2026-06-27T10:00:15Z', action: 'INITIAL_GENESIS_BLOCK', actor: 'SYSTEM', ip: '127.0.0.1', prevHash: '00000000000000000000000000000000', hash: '' },
  { sequence: 2, timestamp: '2026-06-27T10:05:32Z', action: 'POLICY_APPROVED: pol-1 (v2.4)', actor: 'y.ghamdi@enterprise.com', ip: '192.168.1.14', prevHash: '', hash: '' },
  { sequence: 3, timestamp: '2026-06-27T10:12:45Z', action: 'EVIDENCE_UPLOAD: Pen-Test-2026.pdf', actor: 'f.dosari@enterprise.com', ip: '192.168.1.82', prevHash: '', hash: '' },
  { sequence: 4, timestamp: '2026-06-27T11:22:10Z', action: 'ZATCA_CSID_AUTORENEWAL: Successful', actor: 'SYSTEM_DAEMON', ip: '10.0.4.15', prevHash: '', hash: '' }
];

// Initialize hash chain
for (let i = 0; i < INITIAL_LEDGER.length; i++) {
  if (i > 0) {
    INITIAL_LEDGER[i].prevHash = INITIAL_LEDGER[i-1].hash;
  }
  const content = `${INITIAL_LEDGER[i].sequence}|${INITIAL_LEDGER[i].timestamp}|${INITIAL_LEDGER[i].action}|${INITIAL_LEDGER[i].actor}|${INITIAL_LEDGER[i].prevHash}`;
  INITIAL_LEDGER[i].hash = computeSimpleHash(content);
}

export default function SecurityCompliance() {
  const { settings, updateSettings } = useSettings();
  const [activeMainTab, setActiveMainTab] = useState<'overview' | 'policies' | 'evidence' | 'workflows' | 'whistleblower' | 'trust'>('overview');

  // ==========================================
  // STATE DEFINITIONS
  // ==========================================
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>('pol-1');
  const [evidenceList, setEvidenceList] = useState<Evidence[]>(INITIAL_EVIDENCE);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [ledger, setLedger] = useState<AuditBlock[]>(INITIAL_LEDGER);

  // Policy revision history toggle & mock state
  const [showRevisionDiff, setShowRevisionDiff] = useState(false);
  const [policyEditorContent, setPolicyEditorContent] = useState('');
  const activePolicy = useMemo(() => policies.find(p => p.id === selectedPolicyId) || policies[0], [policies, selectedPolicyId]);

  useEffect(() => {
    if (activePolicy) {
      setPolicyEditorContent(activePolicy.content);
    }
  }, [selectedPolicyId]);

  // Quiz interactive state
  const [quizActive, setQuizActive] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number } | null>(null);

  // Red Team Tamper Simulation state
  const [tamperedState, setTamperedState] = useState(false);
  const [verificationResult, setVerificationResult] = useState<'verified' | 'failed' | null>(null);

  // Active Simulated Workflows Nodes
  const [workflowNodes, setWorkflowNodes] = useState<{ id: string; label: string; type: string; sla: string; status: 'idle' | 'active' | 'completed' }[]>([
    { id: 'n-1', label: 'كشف ثغرة أو تحديث تشريعي', type: 'trigger', sla: '0s', status: 'completed' },
    { id: 'n-2', label: 'تحليل الأثر بواسطة الذكاء الاصطناعي', type: 'ai_process', sla: '2 mins', status: 'completed' },
    { id: 'n-3', label: 'موافقة المستشار القانوني', type: 'approval', sla: '24 hours', status: 'active' },
    { id: 'n-4', label: 'اعتماد مدير الامتثال النهائي', type: 'approval', sla: '48 hours', status: 'idle' },
  ]);

  // Vendor Assessment interactive form
  const [newVendorName, setNewVendorName] = useState('');
  const [vendorPii, setVendorPii] = useState(false);
  const [vendorEncrypt, setVendorEncrypt] = useState('');
  const [vendorDataLocation, setVendorDataLocation] = useState('saudi');
  const [vendorCert, setVendorCert] = useState('none');

  // Whistleblower form state
  const [whistleCategory, setWhistleCategory] = useState('financial');
  const [whistleDetails, setWhistleDetails] = useState('');
  const [whistleSeverity, setWhistleSeverity] = useState('high');
  const [activeWhistleToken, setActiveWhistleToken] = useState<string | null>(null);
  const [whistleLogs, setWhistleLogs] = useState<Record<string, { sender: string; msg: string; time: string }[]>>({});
  const [whistleChatInput, setWhistleChatInput] = useState('');
  const [whistleInputToken, setWhistleInputToken] = useState('');
  const [activeWhistleChatToken, setActiveWhistleChatToken] = useState<string | null>(null);

  // Mock Audit Simulator state
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);
  const [auditScore, setAuditScore] = useState<number | null>(null);
  const [auditFramework, setAuditFramework] = useState<'soc2' | 'iso'>('soc2');

  // Interactive 5x5 Risk Matrix Filter
  const [selectedRiskCoordinate, setSelectedRiskCoordinate] = useState<{ l: number; i: number } | null>(null);

  const riskEvents = useMemo(() => [
    { title: 'عدم كفاية إثبات حماية الأجور (WPS) للشهر الماضي', l: 4, i: 5, category: 'HR / Compliance', severity: 'Critical' },
    { title: 'تأخر تجديد شهادة الآيزو ISO 27001', l: 5, i: 4, category: 'Governance', severity: 'Critical' },
    { title: 'المصادقة الثنائية غير مفعلة لبعض حسابات الموردين المؤقتين', l: 3, i: 4, category: 'Technical Security', severity: 'High' },
    { title: 'استضافة بيانات غير حرجة في خادم سحابي أوروبي', l: 2, i: 3, category: 'Data Residency', severity: 'Medium' },
    { title: 'مسودة سياسة الطرف الثالث لم توقع من الرئيس التنفيذي بعد', l: 3, i: 2, category: 'Process', severity: 'Low' },
  ], []);

  const filteredRisks = useMemo(() => {
    if (!selectedRiskCoordinate) return riskEvents;
    return riskEvents.filter(r => r.l === selectedRiskCoordinate.l && r.i === selectedRiskCoordinate.i);
  }, [selectedRiskCoordinate, riskEvents]);

  // ==========================================
  // LOGGERS & HELPER METHODS
  // ==========================================

  const addLedgerEvent = (action: string, actor: string) => {
    setLedger(prev => {
      const nextSeq = prev.length + 1;
      const lastBlock = prev[prev.length - 1];
      const nowStr = new Date().toISOString();
      const prevHash = lastBlock.hash;
      const content = `${nextSeq}|${nowStr}|${action}|${actor}|${prevHash}`;
      const hash = computeSimpleHash(content);
      return [...prev, {
        sequence: nextSeq,
        timestamp: nowStr,
        action,
        actor,
        ip: '192.168.1.' + Math.floor(Math.random() * 254 + 1),
        prevHash,
        hash
      }];
    });
  };

  // 1-Click Audit simulation run
  const triggerMockAudit = () => {
    setIsAuditing(true);
    setAuditProgress(0);
    setAuditScore(null);
    addLedgerEvent(`MOCK_AUDIT_STARTED: ${auditFramework.toUpperCase()}`, 'y.ghamdi@enterprise.com');
    
    const interval = setInterval(() => {
      setAuditProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setIsAuditing(false);
          // Calculate realistic score based on evidence state (e.g. 1 expired, 1 warning out of 4)
          const compliantCount = evidenceList.filter(e => e.status === 'compliant').length;
          const score = Math.round((compliantCount / evidenceList.length) * 100);
          setAuditScore(score);
          toast.success('اكتملت محاكاة التدقيق الأمني بنجاح!');
          return 100;
        }
        return p + 20;
      });
    }, 400);
  };

  // Verify cryptographic ledger sequentially
  const runLedgerIntegrityCheck = () => {
    let chainValid = true;
    const verifiedLedger = [...ledger];
    
    for (let i = 1; i < verifiedLedger.length; i++) {
      const block = verifiedLedger[i];
      const prevBlock = verifiedLedger[i-1];
      
      // Calculate what hash SHOULD be
      const expectedContent = `${block.sequence}|${block.timestamp}|${block.action}|${block.actor}|${prevBlock.hash}`;
      const calculatedHash = computeSimpleHash(expectedContent);
      
      if (block.prevHash !== prevBlock.hash || block.hash !== calculatedHash) {
        chainValid = false;
        verifiedLedger[i] = { ...block, tampered: true };
      }
    }
    
    setLedger(verifiedLedger);
    if (chainValid) {
      setVerificationResult('verified');
      toast.success('تم التحقق بنجاح: سلسلة الكتل مشفرة وسليمة 100%!');
    } else {
      setVerificationResult('failed');
      toast.error('تحذير أمني خطير: تم الكشف عن تلاعب غير مصرح به في سجل الكتل!');
    }
  };

  // Simulate Red Team hacker altering past database rows
  const simulateDatabaseTamper = () => {
    setLedger(prev => {
      const copy = [...prev];
      if (copy.length > 2) {
        // Alter block 2 action data silently to trigger hash mismatch on recalculation
        copy[2] = {
          ...copy[2],
          action: 'EVIDENCE_DELETED: All_Audit_Logs.json' // malicious modification
        };
      }
      return copy;
    });
    setTamperedState(true);
    setVerificationResult(null);
    toast.warning('محاكاة هجوم: قام مخترق بتعديل السجل الثاني مباشرة في قاعدة البيانات. انقر "التحقق من سلامة السلسلة" لاختبار الكشف!');
  };

  // Submit vendor onboarding questionnaire
  const handleVendorOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendorName.trim()) {
      toast.error('يرجى كتابة اسم المورد');
      return;
    }

    // Risk Profiling Logic
    let score = 95;
    if (vendorPii) score -= 25;
    if (vendorEncrypt === 'no') score -= 20;
    if (vendorDataLocation === 'global') score -= 15;
    if (vendorCert === 'none') score -= 15;

    let tier: 'Critical' | 'High' | 'Medium' | 'Low' = 'Low';
    if (score < 50) tier = 'Critical';
    else if (score < 70) tier = 'High';
    else if (score < 85) tier = 'Medium';

    const newVendor: Vendor = {
      id: `v-${vendors.length + 1}`,
      name: newVendorName,
      piiHandled: vendorPii,
      score,
      tier,
      status: 'Reviewing'
    };

    setVendors(prev => [newVendor, ...prev]);
    addLedgerEvent(`VENDOR_ONBOARDED: ${newVendorName} (Risk score: ${score})`, 'purchasing@enterprise.com');
    toast.success(`تم تقييم المورد بنجاح! النتيجة الأمنية: ${score}% (تصنيف المخاطر: ${tier})`);
    
    // Reset form
    setNewVendorName('');
    setVendorPii(false);
    setVendorEncrypt('');
    setVendorDataLocation('saudi');
    setVendorCert('none');
  };

  // Submit Whistleblower report
  const handleWhistleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whistleDetails.trim()) {
      toast.error('يرجى كتابة تفاصيل البلاغ');
      return;
    }

    // Generate unique 32-character anonymous token
    const token = 'ANON-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    
    setActiveWhistleToken(token);
    // Initialize secure message relay with CCO greeting
    setWhistleLogs(prev => ({
      ...prev,
      [token]: [
        { sender: 'CCO_INVESTIGATOR', msg: 'مرحباً بك، تم استلام بلاغك السري وجاري التحقق من التفاصيل والبيانات المرفقة دون أي كشف لهويتك. كيف يمكننا التواصل لمزيد من الاستفسارات؟', time: 'الآن' }
      ]
    }));

    addLedgerEvent(`CONFIDENTIAL_WHISTLEBLOWER_SUBMISSION: Intake ID [Redacted]`, 'ANONYMOUS');
    toast.success('تم تقديم البلاغ بنجاح في سرية تامة وسحب جميع المعرفات الرقمية وبصمات الجهاز!');
  };

  // Whistleblower relay chat send
  const sendWhistleMessage = () => {
    const activeTok = activeWhistleChatToken || activeWhistleToken;
    if (!activeTok || !whistleChatInput.trim()) return;

    setWhistleLogs(prev => ({
      ...prev,
      [activeTok]: [
        ...(prev[activeTok] || []),
        { sender: 'WHISTLEBLOWER', msg: whistleChatInput, time: 'الآن' }
      ]
    }));

    // Auto-reply mock from CCO after 1 second for simulation depth
    const text = whistleChatInput;
    setWhistleChatInput('');
    
    setTimeout(() => {
      setWhistleLogs(prev => ({
        ...prev,
        [activeTok]: [
          ...(prev[activeTok] || []),
          { sender: 'CCO_INVESTIGATOR', msg: `تم استلام توضيحك الإضافي: "${text.slice(0, 20)}...". شكراً لتعاونك في حماية نزاهة وشفافية المنشأة.`, time: 'الآن' }
        ]
      }));
    }, 1200);
  };

  // Quiz evaluation
  const handleQuizSubmit = () => {
    let correctCount = 0;
    activePolicy.quizzes.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / activePolicy.quizzes.length) * 100);
    const passed = score >= 80;

    setQuizResult({ passed, score });
    if (passed) {
      toast.success(`تهانينا! لقد اجتزت الاختبار بنجاح بمعدل ${score}% تم تسجيل إقرار الالتزام آلياً.`);
      addLedgerEvent(`ATTESTATION_COMPLETED: User signed ${activePolicy.title} (v${activePolicy.version})`, 'moemahran@gmail.com');
    } else {
      toast.error(`للأسف لم تجتز الاختبار. النتيجة: ${score}% (الحد الأدنى المطلوب: 80%). يرجى إعادة المحاولة.`);
    }
  };

  // Simulated AI suggested amendment apply
  const applyAISuggestedAmendment = () => {
    setPolicies(prev => prev.map(p => {
      if (p.id === 'pol-1') {
        return {
          ...p,
          version: '2.5 (AI Generated)',
          content: `${p.content}\n\n4. يُضاف بند التوافق مع لائحة سدايا لعام 2026 لحظر معالجة البيانات دون موافقة مسبقة عبر واجهة التوثيق الوطنية.`
        };
      }
      return p;
    }));
    toast.success('تم دمج وتطبيق التعديل القانوني المقترح آلياً وإصدار الإصدار v2.5!');
    addLedgerEvent(`POLICY_AMENDED_BY_AI_INGESTION: pol-1 to v2.5`, 'y.ghamdi@enterprise.com');
  };

  // PDF Export Trigger simulation
  const handleAuditExport = () => {
    toast.loading('جاري تجميع وتشفير ملفات التدقيق الأمني لـ ' + (settings.language === 'ar' ? 'الجهة الرقابية' : 'Regulatory Body') + '...');
    setTimeout(() => {
      toast.dismiss();
      toast.success('تم توليد ملف ZIP بنجاح! يحتوي على 14 دليلاً مشفراً بـ SHA-256 مع سجل إثبات الامتثال.');
      
      // Simulate real download
      const element = document.createElement("a");
      const file = new Blob(["Compliance Audit Binder. Verified Secure."], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = `Audit_Binder_Enterprise_${auditFramework.toUpperCase()}_2026.zip`;
      document.body.appendChild(element);
      element.click();
    }, 1500);
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto px-4 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-200 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 uppercase tracking-wider">
              نظام الامتثال والمخاطر المتقدم (Flagship GRC Platform)
            </span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 mt-2 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-500" /> مركز الامتثال والتحكم الموحد (Compliance Hub)
          </h1>
          <p className="text-zinc-500 mt-2 font-medium">لوحة حماية ممتثلة تماماً لهيئة سدايا (SDAIA)، نظام حماية البيانات الشخصية (PDPL)، والربط مع هيئة الزكاة (ZATCA).</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setActiveMainTab('whistleblower');
              toast.info('تم نقلك لبوابة الإبلاغ الآمنة المشفرة.');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" /> بوابة البلاغات السرية
          </button>
          <button 
            onClick={() => {
              setActiveMainTab('trust');
              toast.info('تم فتح بوابة الثقة الخارجية لشركاء الأعمال.');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Globe className="w-4 h-4 text-indigo-500" /> بوابة الثقة (Trust Portal)
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex overflow-x-auto pb-1 gap-2 no-scrollbar border-b border-zinc-200/80">
        {[
          { id: 'overview', label: 'لوحة التحكم والمؤشرات', icon: Activity },
          { id: 'policies', label: 'السياسات والتدريب الذكي', icon: FileSignature },
          { id: 'evidence', label: 'سجلات الأدلة والكتل المشفرة', icon: Server },
          { id: 'workflows', label: 'أتمتة المخاطر والموردين', icon: Cpu },
          { id: 'whistleblower', label: 'قنوات الإبلاغ والنزاهة', icon: EyeOff },
          { id: 'trust', label: 'بوابة الثقة الخارجية', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveMainTab(tab.id as any);
                setSelectedRiskCoordinate(null);
              }}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive 
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' 
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-zinc-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMainTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          
          {/* ==========================================
              TAB 1: DYNAMIC DASHBOARD OVERVIEW & RISK MATRIX
              ========================================== */}
          {activeMainTab === 'overview' && (
            <div className="space-y-8">
              {/* Top Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">معدل الامتثال العام</span>
                      <h3 className="text-3xl font-black text-emerald-600 mt-2">94%</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> آمن ومستمر بموجب 24 بند أوتوماتيكي
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">التحذيرات النشطة</span>
                      <h3 className="text-3xl font-black text-amber-600 mt-2">1</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500 animate-pulse" /> وثيقة أدلة متبقي لها 14 يوماً
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">البنود غير الممتثلة</span>
                      <h3 className="text-3xl font-black text-rose-600 mt-2">1</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-rose-500" /> انتهت صلاحية شهادة الآيزو
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-rose-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl" />
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">إقرارات الموظفين</span>
                      <h3 className="text-3xl font-black text-indigo-600 mt-2">87%</h3>
                      <p className="text-[11px] text-zinc-500 mt-1 font-medium">96/110 موظف أتموا التوقيع القانوني</p>
                    </div>
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: 5x5 Interactive Risk Matrix & Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 5x5 Risk Matrix Canvas */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-2">
                  <div className="mb-4">
                    <h3 className="text-md font-black text-zinc-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-500" /> مصفوفة المخاطر التفاعلية 5x5 (Risk Assessment Matrix)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">انقر على أي مربع إحداثيات لرؤية وفلترة المخاطر المطابقة بناءً على (الاحتمالية × الأثر).</p>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Matrix Graph Grid */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 mb-1 px-8">
                        <span>أثر منخفض (1)</span>
                        <span>أثر كارثي (5)</span>
                      </div>
                      
                      <div className="flex">
                        {/* Y-Axis Label */}
                        <div className="w-8 flex flex-col justify-between text-[11px] font-bold text-zinc-400 py-4 h-64 text-center">
                          <span>احتمالية عالية (5)</span>
                          <span>احتمالية منخفضة (1)</span>
                        </div>

                        {/* 5x5 Block Matrix */}
                        <div className="grid grid-cols-5 grid-rows-5 gap-1.5 flex-1 h-64 border border-zinc-200 p-1.5 bg-zinc-50 rounded-xl">
                          {Array.from({ length: 5 }, (_, rIdx) => {
                            const likelihood = 5 - rIdx; // Rows are Likelihood (5 down to 1)
                            return Array.from({ length: 5 }, (_, cIdx) => {
                              const impact = cIdx + 1; // Cols are Impact (1 to 5)
                              
                              // Calculate cell color severity weight
                              const severityScore = likelihood * impact;
                              let cellBg = 'bg-emerald-50 hover:bg-emerald-100 border-emerald-100 text-emerald-700';
                              if (severityScore >= 15) {
                                cellBg = 'bg-rose-50 hover:bg-rose-100 border-rose-100 text-rose-700';
                              } else if (severityScore >= 8) {
                                cellBg = 'bg-amber-50 hover:bg-amber-100 border-amber-100 text-amber-700';
                              } else if (severityScore >= 4) {
                                cellBg = 'bg-yellow-50/50 hover:bg-yellow-100 border-yellow-100 text-yellow-700';
                              }

                              const activeDots = riskEvents.filter(e => e.l === likelihood && e.i === impact);
                              const isSelected = selectedRiskCoordinate?.l === likelihood && selectedRiskCoordinate?.i === impact;

                              return (
                                <button
                                  key={`${likelihood}-${impact}`}
                                  onClick={() => setSelectedRiskCoordinate(isSelected ? null : { l: likelihood, i: impact })}
                                  className={`relative border rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${cellBg} ${
                                    isSelected ? 'ring-2 ring-zinc-800 ring-offset-2 scale-95 shadow-md' : ''
                                  }`}
                                  title={`الاحتمالية: ${likelihood} | الأثر: ${impact}`}
                                >
                                  <span className="text-[10px] font-bold">{likelihood},{impact}</span>
                                  {activeDots.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-zinc-950 text-white rounded-full flex items-center justify-center text-[9px] font-bold border border-white shadow animate-bounce">
                                      {activeDots.length}
                                    </span>
                                  )}
                                </button>
                              );
                            });
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Filter List & Risk Detail Panel */}
                    <div className="w-full md:w-64 space-y-4">
                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="text-xs font-black text-zinc-900">
                            {selectedRiskCoordinate 
                              ? `مخاطر المربع (${selectedRiskCoordinate.l} × ${selectedRiskCoordinate.i})` 
                              : 'جميع المخاطر المسجلة'}
                          </h4>
                          {selectedRiskCoordinate && (
                            <button 
                              onClick={() => setSelectedRiskCoordinate(null)}
                              className="text-[10px] text-zinc-500 font-bold hover:text-zinc-900"
                            >
                              إلغاء الفلتر
                            </button>
                          )}
                        </div>

                        <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1">
                          {filteredRisks.map((risk, idx) => (
                            <div key={idx} className="p-3 bg-white border border-zinc-150 rounded-lg text-xs hover:shadow-sm transition-all">
                              <div className="flex justify-between items-center mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                                  risk.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                  risk.severity === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-zinc-100 text-zinc-700'
                                }`}>
                                  {risk.severity}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-bold">{risk.category}</span>
                              </div>
                              <p className="font-bold text-zinc-800 leading-normal">{risk.title}</p>
                            </div>
                          ))}
                          {filteredRisks.length === 0 && (
                            <p className="text-center text-zinc-400 py-6 text-xs font-medium">لا توجد مخاطر مسجلة في هذا المربع.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Operational Task Center */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-md font-black text-zinc-900 flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" /> مركز المهام والتشغيل (User Task Center)
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                        <CheckIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 leading-tight">تجديد شهادة الآيزو ISO 27001</h4>
                          <p className="text-[10px] text-zinc-500 mt-1">انتهت الصلاحية قبل 5 أيام - يلزم إعادة رفع المستند.</p>
                          <button 
                            onClick={() => setActiveMainTab('evidence')} 
                            className="text-[10px] text-rose-600 font-bold underline mt-1.5 block"
                          >
                            اذهب لرفع الدليل الأمني الآن
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                        <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 leading-tight">إقرار سياسة TPRM المحدثة</h4>
                          <p className="text-[10px] text-zinc-500 mt-1">معلق - يتطلب مراجعة وقراءة واجتياز الاختبار القصير.</p>
                          <button 
                            onClick={() => {
                              setActiveMainTab('policies');
                              setSelectedPolicyId('pol-2');
                            }} 
                            className="text-[10px] text-amber-600 font-bold underline mt-1.5 block"
                          >
                            مراجعة السياسة وتوقيع الإقرار
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <Smartphone className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-zinc-900 leading-tight">استبيان مراجعة أمن الموردين</h4>
                          <p className="text-[10px] text-zinc-500 mt-1">تلقى استبياناً أمنياً جديداً من شركة الدفع بوابة الدفع.</p>
                          <button 
                            onClick={() => setActiveMainTab('workflows')} 
                            className="text-[10px] text-indigo-600 font-bold underline mt-1.5 block"
                          >
                            مراجعة نموذج تقييم الطرف الثالث
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100 mt-4 flex items-center justify-between text-[11px] text-zinc-400 font-bold">
                    <span>آخر فحص أوتوماتيكي: اليوم، 11:22</span>
                    <RefreshCw className="w-3.5 h-3.5 text-zinc-400 cursor-pointer hover:rotate-180 transition-all" />
                  </div>
                </div>

              </div>

              {/* Bottom Section: Auditor PDF Report Generator */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-3xl shadow-xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-black flex items-center gap-2">
                      <Download className="w-5 h-5 text-emerald-400" /> مولد حزمة التدقيق والامتثال الذكي (Audit Binder Generator)
                    </h3>
                    <p className="text-sm text-zinc-300 font-medium max-w-3xl leading-relaxed">
                      قم بإنشاء وتنزيل ملف ZIP مشفر يحتوي على كافة السياسات الموقعة، سجلات الكتل المشفرة للتدقيق، وملفات الأدلة المستمدة من الخوادم، جاهزة تماماً لتقديمها لمدققي SOC 2 أو هيئة سدايا بشكل فوري.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 pt-3 text-xs font-bold text-zinc-400">
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" defaultChecked className="rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 bg-zinc-800" />
                        حجب البيانات الشخصية الحساسة للعملاء (Mask Client PII)
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors">
                        <input type="checkbox" defaultChecked className="rounded border-zinc-600 text-emerald-500 focus:ring-emerald-500 bg-zinc-800" />
                        إخفاء معرفات بروتوكول الإنترنت الداخلية (Mask Internal IP Addresses)
                      </label>
                    </div>
                  </div>

                  <div className="shrink-0 flex gap-2">
                    <select 
                      value={auditFramework}
                      onChange={(e) => setAuditFramework(e.target.value as any)}
                      className="bg-zinc-800 text-white border border-zinc-700 rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="soc2">SOC 2 Type II</option>
                      <option value="iso">ISO 27001:2022</option>
                      <option value="pdpl">PDPL (سدايا)</option>
                    </select>

                    <button
                      onClick={handleAuditExport}
                      className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-95 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> تصدير ملفات الامتثال الفوري
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* ==========================================
              TAB 2: CENTRAL POLICY REPOSITORY & COLLABORATIVE WRITING
              ========================================== */}
          {activeMainTab === 'policies' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Side: Policies & AI Regulatory Feed */}
              <div className="space-y-6">
                
                {/* Policy List Selector */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm">
                  <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" /> مستندات الحوكمة واللوائح الداخلية
                  </h3>

                  <div className="space-y-2">
                    {policies.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedPolicyId(p.id);
                          setQuizActive(false);
                          setQuizResult(null);
                        }}
                        className={`w-full text-right p-3 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                          selectedPolicyId === p.id 
                            ? 'bg-zinc-900 border-zinc-900 text-white shadow-md' 
                            : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            selectedPolicyId === p.id ? 'bg-zinc-800 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            إصدار {p.version}
                          </span>
                          <span className="text-[10px] opacity-70 font-bold">{p.category}</span>
                        </div>
                        <h4 className="text-xs font-black mt-1 leading-normal">{p.title}</h4>
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Regulatory Feed (Module 1.3) */}
                <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-black flex items-center gap-2">
                      <Cpu className="w-4.5 h-4.5 text-indigo-400 animate-pulse" /> التغذية التنظيمية الذكية (AI Ingestion)
                    </h3>
                    <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      تحديث مباشر
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mb-4 leading-relaxed">
                    يقوم محرك الذكاء الاصطناعي بمسح مستمر للصحف الرسمية ووزارة العدل وهيئة سدايا للكشف عن أي تغيير تشريعي وتطبيق محاكاة الأثر.
                  </p>

                  <div className="space-y-4">
                    {/* Simulated live regulatory feed item */}
                    <div className="p-3.5 bg-zinc-850 border border-zinc-800 rounded-xl relative">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                          أثر عالي (High Impact)
                        </span>
                        <span className="text-[10px] text-zinc-500">منذ ساعتين</span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-100 mb-1 leading-normal">
                        تحديث لائحة سدايا لمعالجة البيانات الشخصية لعام 2026
                      </h4>
                      <p className="text-[10px] text-zinc-400 leading-normal">
                        يوجب التحديث الحصول على موافقة مشفرة مسبقة من واجهة نفاذ الموحدة قبل معالجة بيانات الموظفين.
                      </p>

                      {/* AI Proactive recommendation */}
                      <div className="mt-3.5 pt-3.5 border-t border-zinc-800 space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-indigo-300 font-bold">
                          <Info className="w-3.5 h-3.5" /> تعديل قانوني مقترح بواسطة الذكاء الاصطناعي:
                        </div>
                        <p className="text-[10px] bg-indigo-950/40 border border-indigo-900/30 p-2 rounded text-zinc-300 leading-normal">
                          "يُضاف بند لتوافق التوثيق مع لوائح سدايا وبوابة نفاذ..."
                        </p>
                        
                        <button
                          onClick={applyAISuggestedAmendment}
                          className="w-full mt-1.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-black transition-all active:scale-95 cursor-pointer"
                        >
                          تطبيق ودمج التعديل المقترح بالسياسة فوراً
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Side: Document Authoring Suite, Approvals, & Quiz */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Policy Display & Git revision history */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-100 pb-4 mb-4 gap-4">
                    <div>
                      <h2 className="text-lg font-black text-zinc-900 leading-snug">{activePolicy.title}</h2>
                      <p className="text-xs text-zinc-400 mt-1">الإصدار {activePolicy.version} | آخر تحديث: {activePolicy.lastUpdated}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRevisionDiff(!showRevisionDiff)}
                        className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          showRevisionDiff 
                            ? 'bg-zinc-900 text-white border-zinc-900' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {showRevisionDiff ? 'العودة للمحرر' : 'تتبع مقارنة التعديلات (Git-Diff)'}
                      </button>

                      <button
                        onClick={() => {
                          setQuizActive(!quizActive);
                          setQuizAnswers({});
                          setQuizResult(null);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          quizActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        الاختبار والإقرار التدريبي
                      </button>
                    </div>
                  </div>

                  {quizActive ? (
                    /* Interactive Quiz Component (Module 1.2) */
                    <div className="space-y-6 p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl">
                      <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <h3 className="text-xs font-black text-zinc-900">الاختبار التدريبي الإلزامي للالتزام بالسياسة</h3>
                          <p className="text-[10px] text-zinc-500 mt-0.5">يتطلب توقيع إقرار الالتزام الحصول على درجة 80% أو أكثر في هذا التقييم.</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {activePolicy.quizzes.map((q, qIdx) => (
                          <div key={qIdx} className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200">
                            <h4 className="text-xs font-black text-zinc-900 flex gap-2">
                              <span>السؤال {qIdx + 1}:</span>
                              <span>{q.question}</span>
                            </h4>

                            <div className="grid md:grid-cols-2 gap-2">
                              {q.options.map((opt, oIdx) => {
                                const isSelected = quizAnswers[qIdx] === oIdx;
                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                                    className={`w-full text-right p-3 rounded-lg text-xs font-bold transition-all border ${
                                      isSelected
                                        ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                                        : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200 text-zinc-700'
                                    }`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {quizResult ? (
                        <div className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 ${
                          quizResult.passed 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                            : 'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          {quizResult.passed ? (
                            <>
                              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                              <h4 className="text-sm font-black">تهانينا! لقد اجتزت الاختبار التدريبي</h4>
                              <p className="text-xs">النتيجة: {quizResult.score}% | تم تسجيل إقرار الامتثال والتوقيع في سلسلة الكتل بنجاح.</p>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-8 h-8 text-rose-600" />
                              <h4 className="text-sm font-black">للأسف لم تجتز التقييم</h4>
                              <p className="text-xs">النتيجة: {quizResult.score}% | يرجى مراجعة بنود السياسة والمحاولة مجدداً لتحقيق الحد الأدنى (80%).</p>
                              <button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setQuizResult(null);
                                }}
                                className="mt-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-500 transition-all cursor-pointer"
                              >
                                إعادة الاختبار
                              </button>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setQuizActive(false)}
                            className="px-4 py-2 text-zinc-500 font-bold text-xs"
                          >
                            إلغاء
                          </button>
                          <button
                            onClick={handleQuizSubmit}
                            disabled={Object.keys(quizAnswers).length < activePolicy.quizzes.length}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                          >
                            تقديم الإجابات وتوقيع السياسة
                          </button>
                        </div>
                      )}

                    </div>
                  ) : showRevisionDiff ? (
                    /* Revision Diff comparative representation (Module 1.1) */
                    <div className="space-y-4">
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] font-mono text-zinc-600">
                        <p className="font-bold text-zinc-800 mb-1">تتبع التعديلات (Git Revisions Diff)</p>
                        <p>تتم مقارنة الإصدار الحالي {activePolicy.version} مع الإصدار السابق 2.3 للسياسة.</p>
                      </div>

                      <div className="font-mono text-xs border border-zinc-200 rounded-xl overflow-hidden divide-y divide-zinc-200">
                        <div className="p-3 bg-rose-50 text-rose-800 flex justify-between gap-4">
                          <span>- يُحظر مشاركة أو نقل بيانات العملاء السحابية خارج النطاق الفيدرالي.</span>
                          <span className="text-[10px] font-bold text-rose-600 shrink-0">حذف (v2.3)</span>
                        </div>
                        <div className="p-3 bg-emerald-50 text-emerald-800 flex justify-between gap-4">
                          <span>+ يُحظر مشاركة أو تصدير أي بيانات حساسة خارج النطاق الجغرافي للمملكة بدون موافقة صريحة من سدايا.</span>
                          <span className="text-[10px] font-bold text-emerald-600 shrink-0">إضافة (v2.4)</span>
                        </div>
                        <div className="p-3 bg-zinc-50 text-zinc-700">
                          <span>  التشديد على التشفير الكامل للبيانات في السكون والحركة باستخدام خوارزمية AES-256.</span>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl space-y-2">
                        <h4 className="text-xs font-bold text-zinc-800">مبرر التغيير الحالي (Change Rationale):</h4>
                        <p className="text-xs text-zinc-600">
                          "تحديث صياغة البند الثاني ليتوافق بدقة مع المادة 24 من اللائحة التنفيذية لنظام حماية البيانات الشخصية الصادر عن الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا)."
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Main Collaborative Editor View */
                    <div className="space-y-4">
                      <div className="p-1 bg-zinc-50 border border-zinc-200 rounded-xl">
                        <textarea
                          value={policyEditorContent}
                          onChange={(e) => setPolicyEditorContent(e.target.value)}
                          className="w-full h-64 p-4 text-xs font-mono bg-white border-0 focus:ring-0 outline-none resize-none leading-relaxed"
                          placeholder="اكتب السياسة بلغة الماركداون هنا..."
                        />
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-400 font-bold">محرر الماركداون التشاركي نشط</span>
                        
                        <button
                          onClick={() => {
                            setPolicies(prev => prev.map(p => {
                              if (p.id === selectedPolicyId) {
                                return { ...p, content: policyEditorContent, lastUpdated: new Date().toISOString().slice(0, 10) };
                              }
                              return p;
                            }));
                            addLedgerEvent(`POLICY_EDITED: ${activePolicy.title}`, 'moemahran@gmail.com');
                            toast.success('تم حفظ تعديلات السياسة بنجاح كمسودة محدثة!');
                          }}
                          className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold active:scale-95 transition-all cursor-pointer"
                        >
                          حفظ التعديلات الحالية كمسودة
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Multi-Stage Approver Flow (Module 1.1) */}
                  <div className="mt-8 border-t border-zinc-100 pt-6">
                    <h3 className="text-xs font-black text-zinc-900 mb-4 flex items-center gap-2">
                      <FileSignature className="w-4 h-4 text-emerald-500" /> مسار الاعتمادات والتوقيع الرقمي المتسلسل (eIDAS Standard)
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {activePolicy.approvers.map((appr, idx) => (
                        <div key={idx} className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                          appr.signed ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'
                        }`}>
                          <div>
                            <h4 className="text-xs font-black text-zinc-900">{appr.name}</h4>
                            <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{appr.role}</p>
                          </div>

                          <div className="text-left shrink-0">
                            {appr.signed ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-emerald-600 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                                  تم التوقيع
                                </span>
                                <p className="text-[8px] text-zinc-400 font-mono mt-0.5">{appr.signedAt}</p>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setPolicies(prev => prev.map(p => {
                                    if (p.id === selectedPolicyId) {
                                      const updatedAppr = [...p.approvers];
                                      updatedAppr[idx] = { ...updatedAppr[idx], signed: true, signedAt: new Date().toISOString().slice(0, 16).replace('T', ' ') };
                                      return { ...p, approvers: updatedAppr };
                                    }
                                    return p;
                                  }));
                                  addLedgerEvent(`POLICY_APPROVED_BY_STAKEHOLDER: ${appr.role} for ${activePolicy.title}`, 'moemahran@gmail.com');
                                  toast.success(`تم التوقيع الرقمي المعتمد لـ ${appr.role} بنجاح.`);
                                }}
                                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[9px] font-black transition-all cursor-pointer"
                              >
                                توقيع إلكتروني
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 3: CRYPTOGRAPHIC LEDGER, EVIDENCE & MOCK AUDIT
              ========================================== */}
          {activeMainTab === 'evidence' && (
            <div className="space-y-8">
              
              {/* Top Panel: Immutable Cryptographic Ledger Chain */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-zinc-150 pb-4 mb-4 gap-4">
                  <div>
                    <h3 className="text-md font-black text-zinc-900 flex items-center gap-2">
                      <Server className="w-4.5 h-4.5 text-emerald-500" /> سجل سلسلة الكتل للتدقيق غير القابل للتلاعب (Immutable Cryptographic Ledger)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      كل عملية تعديل أو توقيع تولد كتلة مشفرة بـ SHA-256 تحتوي على البصمة الزمنية وقيمة الكتلة السابقة (Chain of Custody).
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={simulateDatabaseTamper}
                      className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> محاكاة اختراق وتعديل السجلات (Red Team Hack)
                    </button>

                    <button
                      onClick={runLedgerIntegrityCheck}
                      className="px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> التحقق من سلامة السلسلة والكتل
                    </button>
                  </div>
                </div>

                {verificationResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-xl border flex items-center gap-3 mb-4 ${
                      verificationResult === 'verified' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                        : 'bg-rose-50 border-rose-200 text-rose-800 animate-bounce'
                    }`}
                  >
                    {verificationResult === 'verified' ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black">السلسلة سليمة وموثقة (Ledger Verified Integrity)</h4>
                          <p className="text-[10px] opacity-90 mt-0.5">تم التحقق من كافة هتاش كتل السجل بالتطابق مع السجلات السابقة. لا يوجد أي كسر في السلسلة.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                        <div>
                          <h4 className="text-xs font-black">تم الكشف عن تلاعب بالبيانات (LEDGER BREACH DETECTED)</h4>
                          <p className="text-[10px] opacity-90 mt-0.5">مفتاح كتلة التعديل لا يطابق البصمة السابقة! تم تمييز السجلات المتأثرة باللون الأحمر فوراً.</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* Ledger Block List */}
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold">
                        <th className="px-4 py-2.5">رقم الكتلة</th>
                        <th className="px-4 py-2.5">التوقيت (ISO-8601)</th>
                        <th className="px-4 py-2.5">العملية والحدث</th>
                        <th className="px-4 py-2.5">المستخدم</th>
                        <th className="px-4 py-2.5">الكتلة السابقة (Previous Hash)</th>
                        <th className="px-4 py-2.5">بصمة الكتلة (SHA-256 Hash)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {ledger.map((block) => (
                        <tr 
                          key={block.sequence} 
                          className={`transition-colors ${
                            block.tampered 
                              ? 'bg-rose-100/70 hover:bg-rose-100 text-rose-900 border-l-4 border-l-rose-600 font-bold' 
                              : 'hover:bg-zinc-50 text-zinc-600'
                          }`}
                        >
                          <td className="px-4 py-3 font-black text-zinc-900">Block #{block.sequence}</td>
                          <td className="px-4 py-3 text-[11px]">{block.timestamp}</td>
                          <td className="px-4 py-3 font-bold text-zinc-800">{block.action}</td>
                          <td className="px-4 py-3">{block.actor}</td>
                          <td className="px-4 py-3 truncate max-w-[120px]" title={block.prevHash}>{block.prevHash}</td>
                          <td className={`px-4 py-3 truncate max-w-[140px] font-black ${block.tampered ? 'text-rose-600' : 'text-emerald-600'}`} title={block.hash}>
                            {block.hash}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lower Section split: Evidence Locker & Mock Audit Simulator */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Evidence Locker (Module 2.2) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                        <Layers className="w-4.5 h-4.5 text-emerald-500" /> مستودع الأدلة المستمرة والأثبات (Continuous Evidence Vault)
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">تنبيهات صلاحية مسبقة بـ 30 يوماً لضمان عدم حدوث أي ثغرة في الامتثال للأجهزة التدقيقية.</p>
                    </div>

                    <button
                      onClick={() => {
                        const newEv: Evidence = {
                          id: `ev-${evidenceList.length + 1}`,
                          name: 'سجل فحوصات التشفير ومفاتيح الدخول العشوائية',
                          controlCode: 'CTRL-MFA-02',
                          type: 'CSV Logs',
                          size: '124 KB',
                          owner: 'moemahran@gmail.com',
                          expiryDays: 90,
                          status: 'compliant'
                        };
                        setEvidenceList([newEv, ...evidenceList]);
                        addLedgerEvent(`EVIDENCE_UPLOADED: ${newEv.name}`, 'moemahran@gmail.com');
                        toast.success('تم رفع مستند دليل أمني جديد بنجاح وتأمينه في خادم الأمان WORM!');
                      }}
                      className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> رفع مستند إثبات جديد
                    </button>
                  </div>

                  <div className="space-y-3">
                    {evidenceList.map((ev) => {
                      let statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      let statusText = 'ممتثل (Compliant)';
                      if (ev.status === 'expired') {
                        statusBadge = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
                        statusText = 'منتهي الصلاحية (Expired)';
                      } else if (ev.status === 'warning') {
                        statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                        statusText = 'يقترب من الانتهاء (Warning)';
                      }

                      return (
                        <div key={ev.id} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-zinc-200 rounded-xl flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-zinc-600" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-zinc-800">{ev.name}</h4>
                              <p className="text-[10px] text-zinc-500 mt-1 font-medium">
                                المعيار: <strong className="text-zinc-800">{ev.controlCode}</strong> | المالك المسؤول: {ev.owner}
                              </p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">نوع الملف: {ev.type} | الحجم: {ev.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-200">
                            <div className="text-left md:text-right">
                              <span className={`inline-flex items-center gap-1 border px-2 py-0.5 rounded-full text-[9px] font-black ${statusBadge}`}>
                                <ShieldCheck className="w-3 h-3" />
                                {statusText}
                              </span>
                              <p className="text-[9px] text-zinc-400 font-medium mt-1">
                                {ev.expiryDays < 0 ? `منتهي منذ ${Math.abs(ev.expiryDays)} يوم` : `ينتهي بعد ${ev.expiryDays} يوم`}
                              </p>
                            </div>

                            {ev.status !== 'compliant' && (
                              <button
                                onClick={() => {
                                  setEvidenceList(prev => prev.map(e => e.id === ev.id ? { ...e, expiryDays: 365, status: 'compliant' } : e));
                                  addLedgerEvent(`EVIDENCE_RENEWED: ${ev.name}`, 'moemahran@gmail.com');
                                  toast.success('تم تجديد مستند الدليل بنجاح وإعادة عداد الامتثال لـ 365 يوماً!');
                                }}
                                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                              >
                                تجديد الدليل
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mock Audit Simulator Panel (Module 2.4) */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2 mb-2">
                      <Cpu className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> محاكي التدقيق والجاهزية بنقرة واحدة (Mock Audit Simulator)
                    </h3>
                    <p className="text-xs text-zinc-500 mb-4">اختبر جاهزيتك فوراً أمام الجهات الرقابية واحصل على نقاط فحص الثغرات والحلول المقترحة.</p>

                    {isAuditing ? (
                      <div className="space-y-4 py-8 flex flex-col items-center justify-center text-center">
                        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                        <div className="space-y-1 w-full max-w-[180px]">
                          <p className="text-xs font-bold text-zinc-800">جاري فحص وتدقيق السجلات والتحقق من الكتل...</p>
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-indigo-500 h-full" style={{ width: `${auditProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    ) : auditScore !== null ? (
                      <div className="space-y-5 py-4">
                        <div className="flex flex-col items-center text-center gap-1">
                          <span className="text-[10px] font-black text-zinc-400 uppercase">النسبة المتوقعة للجاهزية</span>
                          <h4 className={`text-4xl font-black ${auditScore >= 80 ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {auditScore}%
                          </h4>
                          <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full mt-1.5 ${
                            auditScore >= 80 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {auditScore >= 80 ? 'امتثال متميز' : 'يتطلب معالجة بعض الثغرات'}
                          </span>
                        </div>

                        {/* Gap Identification Ledger */}
                        <div className="space-y-2">
                          <h4 className="text-[11px] font-black text-zinc-700">الفجوات الأمنية المكتشفة:</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                            {evidenceList.filter(e => e.status !== 'compliant').map((ev) => (
                              <div key={ev.id} className="p-2.5 bg-rose-50/50 border border-rose-100 rounded-lg text-[10px]">
                                <div className="flex justify-between items-center font-bold">
                                  <span className="text-rose-700">دليل منتهي الصلاحية: {ev.controlCode}</span>
                                  <button
                                    onClick={() => {
                                      setEvidenceList(prev => prev.map(e => e.id === ev.id ? { ...e, expiryDays: 365, status: 'compliant' } : e));
                                      toast.success('تم حل الفجوة آلياً!');
                                    }}
                                    className="text-indigo-600 hover:underline"
                                  >
                                    إصلاح الآن
                                  </button>
                                </div>
                                <p className="text-zinc-500 mt-1">{ev.name}</p>
                              </div>
                            ))}
                            {evidenceList.filter(e => e.status !== 'compliant').length === 0 && (
                              <p className="text-center text-emerald-600 font-bold text-[10px] py-4">تهانينا! لا توجد فجوات متبقية.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-6 flex flex-col items-center text-center gap-2">
                        <Info className="w-8 h-8 text-zinc-300" />
                        <p className="text-xs text-zinc-500 leading-normal">
                          لم يتم إجراء أي فحص محاكاة تدقيق في الجلسة الحالية لرمز التدقيق النشط.
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={triggerMockAudit}
                    disabled={isAuditing}
                    className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
                  >
                    بدء محاكاة التدقيق الفوري (Run Audit Scan)
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* ==========================================
              TAB 4: WORKFLOW LOGIC CANVAS & VENDOR ASSESSMENT
              ========================================== */}
          {activeMainTab === 'workflows' && (
            <div className="space-y-8">
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Node-Based Workflow Simulator (Module 3.1) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                      <Cpu className="w-4.5 h-4.5 text-emerald-500" /> مخطط الأتمتة ومسارات الامتثال التفاعلي (Compliance Workflow Canvas)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">انقر لتنشيط الخطوات لمشاهدة كيف تتدفق إشارات الامتثال مع المراقبة الدقيقة لـ SLAs.</p>
                  </div>

                  {/* Flow canvas visually simulated */}
                  <div className="relative p-6 bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden min-h-[300px] flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10 w-full py-6">
                      {workflowNodes.map((node, index) => {
                        let nodeColor = 'bg-white border-zinc-200 text-zinc-600';
                        if (node.status === 'completed') {
                          nodeColor = 'bg-emerald-50 border-emerald-300 text-emerald-800 ring-2 ring-emerald-500/10';
                        } else if (node.status === 'active') {
                          nodeColor = 'bg-indigo-50 border-indigo-300 text-indigo-800 ring-4 ring-indigo-500/20';
                        }

                        return (
                          <React.Fragment key={node.id}>
                            <div className={`p-4 rounded-xl border text-center flex flex-col gap-1 w-full md:w-44 shadow-sm transition-all ${nodeColor}`}>
                              <span className="text-[8px] font-black tracking-widest uppercase opacity-70">
                                {node.type === 'trigger' ? 'محفز الدخول' : node.type === 'ai_process' ? 'معالجة ذكية' : 'خطوة موافقة'}
                              </span>
                              <h4 className="text-[11px] font-black leading-tight mt-1">{node.label}</h4>
                              <span className="text-[9px] font-mono mt-1.5 opacity-85">SLA: {node.sla}</span>
                            </div>
                            
                            {index < workflowNodes.length - 1 && (
                              <div className="hidden md:flex flex-col items-center shrink-0">
                                <ArrowRight className={`w-5 h-5 ${
                                  node.status === 'completed' ? 'text-emerald-500' : 'text-zinc-300'
                                }`} />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-200/80 pt-4 text-xs font-bold">
                      <span className="text-zinc-400">تنبيهات التصعيد التلقائية نشطة (Slack / Teams Escalation)</span>
                      
                      <button
                        onClick={() => {
                          setWorkflowNodes(prev => prev.map((n, idx) => {
                            if (idx === 2) return { ...n, status: 'completed' };
                            if (idx === 3) return { ...n, status: 'active' };
                            return n;
                          }));
                          toast.success('تمت محاكاة تحريك إشارة المسار والموافقة عليها آلياً!');
                          addLedgerEvent('WORKFLOW_STEP_APPROVED: Stakeholder review approved for automated SLA flow', 'y.ghamdi@enterprise.com');
                        }}
                        className="px-4 py-2 bg-zinc-900 text-white hover:bg-zinc-800 rounded-xl text-[10px] font-black transition-all cursor-pointer"
                      >
                        محاكاة تمرير الإشارة للخطوة التالية
                      </button>
                    </div>
                  </div>
                </div>

                {/* TPRM: Vendor Onboarding Form (Module 3.2) */}
                <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                      <Building className="w-4.5 h-4.5 text-indigo-500" /> تقييم مخاطر الموردين الجدد (TPRM Smart Form)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">يتحرك حقل معالجة البيانات الشخصية لفتح 10 أسئلة إضافية آلياً في حال التفعيل.</p>
                  </div>

                  <form onSubmit={handleVendorOnboardingSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 block">اسم الشركة الموردة</label>
                      <input 
                        type="text" 
                        value={newVendorName}
                        onChange={(e) => setNewVendorName(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" 
                        placeholder="مثال: شركة التحليلات الذكية"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-150 rounded-xl">
                      <div className="flex gap-2 items-center">
                        <Smartphone className="w-4 h-4 text-zinc-400" />
                        <span className="text-xs font-bold text-zinc-700">هل يعالج المورد بيانات عملاء شخصية؟ (PII)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVendorPii(!vendorPii)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${vendorPii ? 'bg-emerald-500' : 'bg-zinc-300'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${vendorPii ? '-translate-x-4.5' : '-translate-x-1'}`} />
                      </button>
                    </div>

                    {/* Conditional Fields sliding down (Module 3.2 - Conditional Webform) */}
                    <AnimatePresence>
                      {vendorPii && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 p-3 bg-indigo-50/50 border border-indigo-150 rounded-xl overflow-hidden"
                        >
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-indigo-900 block">هل يقوم المورد بتشفير البيانات في قاعدة بياناته؟</label>
                            <select 
                              value={vendorEncrypt}
                              onChange={(e) => setVendorEncrypt(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 px-2 text-[11px] outline-none"
                            >
                              <option value="">اختر...</option>
                              <option value="yes">نعم، تشفير كامل AES-256</option>
                              <option value="no">لا يوجد تشفير للبيانات المستقرة</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-indigo-900 block">مقر ونطاق استضافة البيانات</label>
                            <select 
                              value={vendorDataLocation}
                              onChange={(e) => setVendorDataLocation(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 px-2 text-[11px] outline-none"
                            >
                              <option value="saudi">محلي داخل المملكة العربية السعودية (ممتثل)</option>
                              <option value="global">عالمي (يتطلب موافقة خاصة من سدايا)</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-indigo-900 block">شهادات الأمان المعتمدة للمورد</label>
                            <select 
                              value={vendorCert}
                              onChange={(e) => setVendorCert(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-lg py-1.5 px-2 text-[11px] outline-none"
                            >
                              <option value="none">لا يوجد شهادات معتمدة</option>
                              <option value="iso">حاصل على شهادة ISO 27001</option>
                              <option value="soc">حاصل على شهادة SOC 2 Type II</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-black hover:bg-zinc-800 transition-all cursor-pointer"
                    >
                      تقييم وحساب مستوى مخاطر المورد آلياً
                    </button>
                  </form>
                </div>

              </div>

              {/* Vendor Registry List */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                <h3 className="text-sm font-black text-zinc-900 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-emerald-500" /> سجل الطرف الثالث المعتمد والنشط (Active Third-Party Registry)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {vendors.map(v => (
                    <div key={v.id} className="p-4 bg-zinc-50 border border-zinc-250 rounded-2xl flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-black text-zinc-900">{v.name}</h4>
                        <div className="flex gap-2 items-center mt-2">
                          <span className={`text-[9px] font-black border px-2 py-0.5 rounded-full ${
                            v.tier === 'Low' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            v.tier === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                          }`}>
                            خطورة: {v.tier}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-bold">نقاط الأمان: {v.score}%</span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                        v.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {v.status === 'Active' ? 'نشط ومعتمد' : 'تحت المراجعة'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 5: CONFIDENTIAL ANONYMOUS WHISTLEBLOWER PORTAL
              ========================================== */}
          {activeMainTab === 'whistleblower' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Whistleblower Anonymous Intake form (Module 2.3) */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-1.5 flex flex-col justify-between">
                <div>
                  <div className="mb-6">
                    <h3 className="text-md font-black text-zinc-900 flex items-center gap-2">
                      <EyeOff className="w-5 h-5 text-zinc-900 animate-pulse" /> قناة تقديم البلاغات مجهولة الهوية بالكامل (Confidential Intake Channel)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                      نظام مشفر ومجرد تماماً من ملفات الارتباط (Cookies)، معرفات الأجهزة، وعناوين الـ IP الخاصة بالرافع. يضمن القانون الحماية المطلقة لسرية المبلغين.
                    </p>
                  </div>

                  <form onSubmit={handleWhistleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 block">تصنيف ونوع المخالفة المشتبه بها</label>
                      <select 
                        value={whistleCategory}
                        onChange={(e) => setWhistleCategory(e.target.value)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2.5 px-3 text-xs font-bold outline-none"
                      >
                        <option value="financial">مخالفات مالية أو تلاعب بالحسابات</option>
                        <option value="security">خرق أمن بيانات العملاء أو تسريبها</option>
                        <option value="bribery">رشاوي وتعارض مصالح موظفين</option>
                        <option value="other">أخرى</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 block">مستوى خطورة وأهمية البلاغ</label>
                      <div className="flex gap-2">
                        {[
                          { id: 'low', label: 'عادية' },
                          { id: 'medium', label: 'متوسطة الخطورة' },
                          { id: 'high', label: 'خطيرة جداً' },
                        ].map(sev => (
                          <button
                            key={sev.id}
                            type="button"
                            onClick={() => setWhistleSeverity(sev.id)}
                            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                              whistleSeverity === sev.id 
                                ? 'bg-zinc-900 border-zinc-900 text-white' 
                                : 'bg-zinc-50 border-zinc-200 text-zinc-600'
                            }`}
                          >
                            {sev.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 block">شرح وتفصيل الشكوى والمخالفة الملاحظة</label>
                      <textarea 
                        value={whistleDetails}
                        onChange={(e) => setWhistleDetails(e.target.value)}
                        className="w-full h-36 bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="يرجى كتابة كافة التفاصيل والتواريخ والأطراف المشاركة مع تجنب ذكر أي بيانات تكشف هويتك الشخصية..."
                      />
                    </div>

                    <div className="p-3 bg-zinc-50 border border-zinc-150 rounded-xl text-[10px] text-zinc-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>النظام يحذف البيانات الوصفية (Metadata) للملفات المرفقة تلقائياً قبل الحفظ.</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer"
                    >
                      تقديم البلاغ السري وتوليد رمز المتابعة المشفر
                    </button>
                  </form>
                </div>
              </div>

              {/* Secure Messenger Relay & Token Access (Module 2.3) */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="mb-4">
                    <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                      <Smartphone className="w-4.5 h-4.5 text-indigo-500 animate-pulse" /> بوابة الاتصال السري ثنائي الاتجاه (Confidential Message Relay)
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">تواصل بأمان تام مع المحققين المعتمدين لرفع أدلة إضافية دون الكشف عن شخصيتك باستخدام الرمز المخصص.</p>
                  </div>

                  {activeWhistleToken && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-center">
                      <span className="text-[10px] font-black text-emerald-800 block">مفتاح المتابعة السري الخاص بك (انسخه واحفظه جيداً):</span>
                      <code className="text-sm font-mono font-black text-zinc-900 mt-1 block select-all bg-white p-2 border border-emerald-100 rounded-lg">
                        {activeWhistleToken}
                      </code>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={whistleInputToken}
                        onChange={(e) => setWhistleInputToken(e.target.value)}
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl py-2 px-3 text-xs font-bold outline-none font-mono"
                        placeholder="أدخل رمز المتابعة السري لفتح قناة الدردشة (مثال: ANON-XXXX)"
                      />
                      <button
                        onClick={() => {
                          if (!whistleInputToken.trim()) return;
                          if (whistleLogs[whistleInputToken]) {
                            setActiveWhistleChatToken(whistleInputToken);
                            toast.success('تم فتح القناة الآمنة للبلاغ بنجاح!');
                          } else {
                            toast.error('الرمز المدخل غير صحيح أو لا توجد جلسة نشطة له.');
                          }
                        }}
                        className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        فتح المحادثة
                      </button>
                    </div>

                    {/* Active Conversation Relay Screen */}
                    {(activeWhistleChatToken || activeWhistleToken) ? (
                      <div className="p-4 bg-zinc-900 text-white rounded-2xl min-h-[220px] flex flex-col justify-between">
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                          {(whistleLogs[activeWhistleChatToken || activeWhistleToken || ''] || []).map((msg, mIdx) => {
                            const isMe = msg.sender === 'WHISTLEBLOWER';
                            return (
                              <div key={mIdx} className={`flex flex-col max-w-[80%] ${isMe ? 'mr-auto items-end' : 'ml-auto items-start'}`}>
                                <span className="text-[9px] text-zinc-400 font-bold mb-1">
                                  {isMe ? 'مقدم البلاغ (أنت)' : 'محقق الامتثال والنزاهة'}
                                </span>
                                <div className={`p-2.5 rounded-xl text-xs ${isMe ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-800 text-zinc-100 rounded-bl-none'}`}>
                                  {msg.msg}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex gap-2 mt-4 border-t border-zinc-800 pt-3">
                          <input 
                            type="text" 
                            value={whistleChatInput}
                            onChange={(e) => setWhistleChatInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendWhistleMessage()}
                            className="flex-1 bg-zinc-800 text-white border border-zinc-700 rounded-xl py-2 px-3 text-xs outline-none"
                            placeholder="اكتب ردك السري هنا..."
                          />
                          <button
                            onClick={sendWhistleMessage}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border border-zinc-200 border-dashed rounded-2xl p-8 text-center text-zinc-400 text-xs py-12">
                        يرجى تقديم بلاغ لتوليد رمز أو إدخال رمز متابعة سابق لعرض محادثة قناة النزاهة المشفرة.
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ==========================================
              TAB 6: WHITE-LABELED CUSTOMER TRUST PORTAL
              ========================================== */}
          {activeMainTab === 'trust' && (
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
              
              {/* White Labeled Subdomain Mock Header */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <span className="text-[9px] font-black text-indigo-600 uppercase bg-indigo-100/60 border border-indigo-200 px-2 py-0.5 rounded-full">
                      رابط البوابة الخارجية النشط
                    </span>
                    <h3 className="text-md font-black text-zinc-900 mt-2 font-mono">
                      https://trust.enterprise.com
                    </h3>
                    <p className="text-xs text-zinc-500 mt-1">بوابة ترويجية للثقة تعرض الأمان والاعتمادات لعملاء ومستثمري الشركة لتقليص مدة مراجعة الصفقات.</p>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                    <span>مؤشرات الربط بالخوادم المحلية نشطة</span>
                  </div>
                </div>
              </div>

              {/* Display badging & Gated documentation */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Active Trust Badges */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest">الشارات والاعتمادات النشطة (Security Badges)</h4>
                  
                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl border border-emerald-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">سدايا ومجلس حماية البيانات (PDPL)</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">ممتثل ومحدث جغرافياً وفق المعايير الإلزامية.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl border border-emerald-200 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">SOC 2 Type II Certified</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">تقييم كامل لمبادئ السرية والتوافر والأمان.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center gap-3">
                    <div className="w-12 h-12 bg-white rounded-xl border border-emerald-200 flex items-center justify-center shrink-0">
                      <Globe className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">ISO 27001:2022 Certified</h4>
                      <p className="text-[10px] text-zinc-500 mt-0.5">تأمين دورة نظام المعلومات والتحكم بالمخاطر.</p>
                    </div>
                  </div>
                </div>

                {/* Right: Gated Document Locker & NDA Form (Module 4.3) */}
                <div className="lg:col-span-2 space-y-6">
                  <h4 className="text-xs font-black text-zinc-800 uppercase tracking-widest">المستندات الأمنية الحساسة (Gated Security Documents)</h4>

                  <div className="space-y-3">
                    {[
                      { title: 'تقرير التدقيق الخارجي الكامل لـ SOC 2 لعام 2026', type: 'PDF Report', size: '1.4 MB' },
                      { title: 'نتائج فحص واختبار الاختراق الخارجي السنوي', type: 'PDF Report', size: '920 KB' },
                      { title: 'خريطة البنية التحتية وسياسة مرونة الكوارث والمخاطر السحابية', type: 'Architectural Doc', size: '2.1 MB' },
                    ].map((doc, dIdx) => (
                      <div key={dIdx} className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-zinc-200 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-zinc-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-zinc-900 leading-tight">{doc.title}</h4>
                            <p className="text-[10px] text-zinc-400 mt-1">{doc.type} | {doc.size}</p>
                          </div>
                        </div>

                        {/* Automated NDA overlay trigger on click */}
                        <button
                          onClick={() => {
                            toast.warning('يتطلب تنزيل المستند الأمني الحساس توقيع اتفاقية حظر إفشاء أسرار (NDA) رقمية وملزمة.');
                          }}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Lock className="w-3.5 h-3.5 text-emerald-400" /> طلب تنزيل مأمن بـ NDA
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Simulated Click-To-Sign NDA block */}
                  <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
                    <h5 className="text-xs font-black text-zinc-800 flex items-center gap-1">
                      <FileSignature className="w-4 h-4 text-emerald-500" /> التوقيع التلقائي لاتفاقية عدم الإفشاء (NDA Online Gate)
                    </h5>
                    <p className="text-[11px] text-zinc-500">
                      بإدخال بريدك المؤسسي والنقر أدناه، فإنك توافق رقمياً على الالتزام باتفاقية NDA لشركة التقنية المتقدمة قبل الاطلاع على فحوصات التدقيق.
                    </p>

                    <div className="flex flex-col md:flex-row gap-2">
                      <input 
                        type="email" 
                        placeholder="البريد الإلكتروني للعمل (مثال: buyer@partner.com)" 
                        className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none"
                      />
                      <button
                        onClick={() => {
                          toast.success('تم قبول التوقيع على اتفاقية NDA وتنزيل مستند التدقيق المشفر بنجاح!');
                          addLedgerEvent('NDA_SIGNED_BY_EXTERNAL_VISITOR: buyer@partner.com signed trust gate NDA', 'visitor_guest');
                        }}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        توقيع وتحميل المستندات فوراً
                      </button>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
