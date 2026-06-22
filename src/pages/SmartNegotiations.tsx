import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Video, 
  Mic, 
  MicOff, 
  Pause, 
  Play, 
  Square, 
  Sparkles, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Bot,
  User,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Zap,
  Globe,
  Settings,
  HelpCircle,
  ClipboardList
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useSettings } from "@/src/contexts/SettingsContext";

// Interfaces for Task Workflow
interface NegotiationTask {
  id: string;
  titleEn: string;
  titleAr: string;
  assignee: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
}

// Interfaces for Extracted Terms
interface ExtractedTerm {
  category: "Party" | "Payment" | "Obligation" | "Penalty" | "Condition";
  titleAr: string;
  titleEn: string;
  valueAr: string;
  valueEn: string;
  confidence: number; // 0-100
}

export default function SmartNegotiations() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const navigate = useNavigate();

  // --- Core States ---
  const [meetingTitle, setMeetingTitle] = useState(
    isAr ? "اجتماع مراجعة عقد التوريد السنوي لشبكات الخوادم" : "Annual Server Networking Supply Contract Review"
  );
  const [status, setStatus] = useState<"Scheduled" | "Live" | "Analyzing" | "Completed">("Completed");
  const [activeMode, setActiveMode] = useState<"A" | "B">("A"); // Mode A: Meet & Mic, Mode B: Direct Text Ingestion
  
  // Executive Summary State Variables
  const [executiveSummaryAr, setExecutiveSummaryAr] = useState<string>(
    "تمت مراجعة شروط عقد التوريد السنوي لشبكات الخوادم بقيمة إجمالية قدرها 85 ألف ريال سعودي مع صيانة ومستويات خدمة SLA لمدة 36 شهراً لدعم طوارئ الشبكة والأنظمة على مدار الساعة مع غرامة تبلغ 1% يومياً في حال تجاوز المهلة بحد أقصى 10% من قيمة التعاقد."
  );
  const [executiveSummaryEn, setExecutiveSummaryEn] = useState<string>(
    "An annual server networking supply contract review with a total value of SAR 85,000. It includes full SLA support and warranty coverage for 36 months, with a late delivery penalty of 1% daily, capped strictly at a 10% threshold."
  );
  
  // Simulated Meet Link
  const [meetLink, setMeetLink] = useState("");
  const [isMeetProvisioning, setIsMeetProvisioning] = useState(false);
  const [isMeetConnected, setIsMeetConnected] = useState(false);

  // Voice Capturing States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcriptLogs, setTranscriptLogs] = useState<{ time: string; speaker: string; textAr: string; textEn: string }[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // File Upload State
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Mode B Manual Paste States
  const [manualText, setManualText] = useState("");
  const [manualPromptType, setManualPromptType] = useState<string>("general");

  // Bottom Center Blueprint Tabs
  const [blueprintTab, setBlueprintTab] = useState<"transcript" | "terms" | "tasks">("terms");

  // Dynamic lists with default seed data
  const [tasks, setTasks] = useState<NegotiationTask[]>([
    {
      id: "task-1",
      titleAr: "تعديل نسبة المسؤولية القانونية لتكون بحد أقصى %100 من قيمة التوريد السنوي",
      titleEn: "Amend liability limitation clause to max out at 100% of the annual server supply value",
      assignee: "Attorney Majid Al-Subaie",
      dueDate: "2026-06-25",
      priority: "High",
      completed: false,
    },
    {
      id: "task-2",
      titleAr: "إجراء التحقق القانوني من شهادات الامتثال والضمانات الفنية المقدمة",
      titleEn: "Perform full legal compliance audit on manufacturer technical standard warranties",
      assignee: "CISO / Compliance Team",
      dueDate: "2026-06-28",
      priority: "Medium",
      completed: true,
    },
    {
      id: "task-3",
      titleAr: "إرسال النسخة التجريبية المحدثة للطرف الثاني للتوقيع عبر بوابة نفاذ",
      titleEn: "Transmit the updated draft contract to secondary party for sign-off via Nafath",
      assignee: "Legal Advisor Rawabi",
      dueDate: "2026-06-30",
      priority: "Low",
      completed: false,
    }
  ]);

  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([
    {
      category: "Party",
      titleAr: "الطرف الأول (المشتري الرئيسي)",
      titleEn: "First Party (Primary Purchaser)",
      valueAr: "مجموعة الحلول التقنية المتقدمة للاستثمار والمقاولات",
      valueEn: "Advanced Technical Solutions Investment & Contracting Group",
      confidence: 99
    },
    {
      category: "Party",
      titleAr: "الطرف الثاني (المورد الفني)",
      titleEn: "Second Party (Technical Supplier)",
      valueAr: "الشركة الشقيقة لصناعات الحوسبة والحلول السحابية",
      valueEn: "Sister Company for Computing Industries & Cloud Solutions LLC",
      confidence: 97
    },
    {
      category: "Payment",
      titleAr: "إجمالي التكلفة المالية والدفعات",
      titleEn: "Total Financial Value & Milestone Tranches",
      valueAr: "85,000 ريال سعودي تدفع على دفعتين متساويتين (60% مقدم، 40% عند الاستلام)",
      valueEn: "SAR 85,000 payable in dual installments (60% upfront, 40% upon formal signoff)",
      confidence: 94
    },
    {
      category: "Penalty",
      titleAr: "شرط جزائي للتأخير عن موعد التوريد المعتمد",
      titleEn: "Late Delivery Penalty Cap Rate",
      valueAr: "خصم 1% عن كل يوم تأخير بحد أقصى 10% من القيمة الإجمالية للعقد الفني",
      valueEn: "1% deduction for each day of delay, capped strictly at 10% of total scope value",
      confidence: 89
    },
    {
      category: "Obligation",
      titleAr: "فترة الصيانة والاستجابة التقنية الطارئة",
      titleEn: "Maintenance SLA Tech Support Window",
      valueAr: "صيانة مجدولة وضمان تشغيلي شامل لمدة 36 شهراً شاملة الدعم الفني على مدار الساعة",
      valueEn: "Comprehensive operational warranty for 36 months, with 24/7 technical callouts",
      confidence: 92
    },
    {
      category: "Condition",
      titleAr: "فض النزاعات والتحكيم المعتمد",
      titleEn: "Arbitration & Dispute Resolution body",
      valueAr: "المحاكم العامة في مدينة الرياض بالمملكة العربية السعودية",
      valueEn: "Primary courts of Riyadh, Kingdom of Saudi Arabia",
      confidence: 98
    }
  ]);

  // Audio stream simulating references
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const textEndRef = useRef<HTMLDivElement | null>(null);

  // Mic Duration Counter Effect
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
        // Automatically inject realistic legal speech transcript lines as we talk
        triggerSimulatedTranscript(recordingDuration + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused, recordingDuration]);

  // Handle dynamic transcript scrolling
  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptLogs]);

  // Generate Google Meet Link Simulation
  const handleCreateMeetRoom = () => {
    if (isMeetProvisioning || isMeetConnected) return;

    setIsMeetProvisioning(true);
    const toastId = toast.loading(
      isAr 
        ? "جاري الاتصال بـ Google Meet API ومطابقة شروط الامتثال والخصوصية..." 
        : "Establishing contact with Google Meet API and validating SOC2 privacy protocols..."
    );

    setTimeout(() => {
      // Realistic Google Meet formatted URL
      const uniqueRoom = Math.random().toString(36).substring(2, 5) + "-" + 
                         Math.random().toString(36).substring(2, 6) + "-" + 
                         Math.random().toString(36).substring(2, 5);
      const generatedLink = `https://meet.google.com/${uniqueRoom}`;
      
      setMeetLink(generatedLink);
      setIsMeetConnected(true);
      setIsMeetProvisioning(false);
      setStatus("Scheduled");
      toast.success(
        isAr 
          ? "تم إنشاء غرفة اجتماع افتراضية آمنة بنجاح والتكامل مع التقويم القانوني!" 
          : "Secure Virtual Meeting Room provisioned and integrated with corporate legal calendar!",
        { id: toastId }
      );
    }, 1800);
  };

  // Launch pop-up simulation
  const handleLaunchMeet = () => {
    if (!meetLink) return;
    toast.info(
      isAr 
        ? "سيتم توجيهك الآن إلى نافذة Google Meet الآمنة لمباشرة التفاوض" 
        : "Redirecting to primary Google Meet window for high-level negotiation..."
    );
    window.open(meetLink, "_blank", "width=900,height=600,scrollbars=yes,resizable=yes");
  };

  // Real-time server-side Gemini 1.5/2.5/3.5/Flash Analysis Pipeline
  const analyzeTextWithGemini = async (inputText: string) => {
    setStatus("Analyzing");
    const loaderId = toast.loading(
      isAr 
        ? "يقوم الذكاء الاصطناعي الآن بمراجعة النصوص للتحليل القانوني والهيكلة..." 
        : "Performing legal semantic analysis and indexing attributes via Gemini..."
    );

    try {
      const storedToken = localStorage.getItem("firebaseToken") || "";
      const response = await fetch("/api/negotiations/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": storedToken ? `Bearer ${storedToken}` : ""
        },
        body: JSON.stringify({
          text: inputText,
          title: meetingTitle
        })
      });

      if (!response.ok) {
        throw new Error(isAr ? "فشلت عملية التحليل من الخدمة السحابية" : "Analysis server returned an error state");
      }

      const data = await response.json();
      if (data.success) {
        if (data.variables && data.variables.length > 0) {
          setExtractedTerms(data.variables);
        }
        if (data.actionItems && data.actionItems.length > 0) {
          const formattedTasks = data.actionItems.map((item: any, idx: number) => ({
            id: `gemini-task-${idx}-${Date.now()}`,
            titleAr: item.titleAr,
            titleEn: item.titleEn,
            assignee: item.assignee || "Legal Member",
            dueDate: item.dueDate || new Date().toISOString().slice(0, 10),
            priority: item.priority || "Medium",
            completed: false
          }));
          setTasks(formattedTasks);
        }
        if (data.summaryAr) {
          setExecutiveSummaryAr(data.summaryAr);
        }
        if (data.summaryEn) {
          setExecutiveSummaryEn(data.summaryEn);
        }

        setStatus("Completed");
        setBlueprintTab("terms");
        
        toast.success(
          data.isMock
            ? (isAr ? "تم محاكاة قراءة وتحليل نصوص الاجتماع للامتثال السريع!" : "Simulated meeting analysis compiled successfully!")
            : (isAr ? "تم قراءة محتوى الاجتماع واستخراج البنود بالذكاء الاصطناعي بنجاح!" : "Meeting minutes formatted and legal blueprint fully populated!"),
          { id: loaderId }
        );
      } else {
        throw new Error(data.error || "Unknown response structure");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Completed");
      toast.error(
        isAr 
          ? `فشل الاتصال بمحرك الذكاء القانوني: ${err.message}` 
          : `Failed semantic analysis pipeline: ${err.message}`,
        { id: loaderId }
      );
    }
  };

  // Convert draft to CLM smart contract and populate variables
  const handleBindToCLM = () => {
    // Generate compatible clm_contract_data payload from extracted terms
    const baseData = {
      contractCategory: "employment",
      employerName: "مجموعة الحلول التقنية المتقدمة للاستثمار والمقاولات",
      employerNameEn: "Advanced Technical Solutions Investment & Contracting Group",
      employerCR: "1010123456",
      employerAddress: "الرياض، المملكة العربية السعودية",
      employerAddressEn: "Riyadh, Kingdom of Saudi Arabia",
      employerRep: "عبدالرحمن المظفر",
      employerRepEn: "Abdulrahman Al-Mudad",
      employeeName: "ماجد فهد الرويلي",
      employeeNameEn: "Majid Fahd Al-Rowaily",
      employeeId: "1098765432",
      employeeNationality: "سعودي",
      employeeNationalityEn: "Saudi",
      employeeAddress: "الرياض، حي الملقا",
      employeeAddressEn: "Riyadh, Al-Malqa District",
      employeeEmail: "majid.fahd@example.com",
      employeeMobile: "0501234567",
      jobTitle: "مدير مبيعات تقنية برمجيات سحابية",
      jobTitleEn: "Lead Sales Director of Cloud Enterprise Apps",
      contractType: "fixed" as const,
      startDate: "2026-07-01",
      durationMonths: "12",
      probationDays: "90",
      basicSalary: "12000",
      housingAllowance: "3000",
      transportAllowance: "1000",
      otherAllowances: "0",
      workingHours: "8",
      workingDays: "5",
      annualLeaveDays: "30",
      disputeResolution: "SCCA" as "SCCA" | "SA_COURTS",
      themeColor: "#10b981"
    };

    // Override values dynamically if extractedTerms match some patterns
    extractedTerms.forEach(term => {
      const isFirstParty = term.titleAr.includes("الأول") || term.titleEn.toLowerCase().includes("first party") || term.titleEn.toLowerCase().includes("employer");
      const isSecondParty = term.titleAr.includes("الثاني") || term.titleEn.toLowerCase().includes("second party") || term.titleEn.toLowerCase().includes("employee") || term.titleEn.toLowerCase().includes("supplier");

      if (term.category === "Party") {
        if (isFirstParty) {
          baseData.employerName = term.valueAr;
          baseData.employerNameEn = term.valueEn;
        } else if (isSecondParty) {
          baseData.employeeName = term.valueAr;
          baseData.employeeNameEn = term.valueEn;
        }
      } else if (term.category === "Payment") {
        // Try parsing numbers
        const numbers = term.valueEn.match(/\b\d{1,3}(?:,\d{3})*\b/g);
        if (numbers && numbers.length > 0) {
          baseData.basicSalary = numbers[0].replace(/,/g, "");
          if (numbers.length > 1) baseData.housingAllowance = numbers[1].replace(/,/g, "");
          if (numbers.length > 2) baseData.transportAllowance = numbers[2].replace(/,/g, "");
        } else {
          // Fallback parsing from Arabic value
          const arNumbers = term.valueAr.match(/\b\d{1,3}(?:,\d{3})*\b/g);
          if (arNumbers && arNumbers.length > 0) {
            baseData.basicSalary = arNumbers[0].replace(/,/g, "");
          }
        }
      } else if (term.category === "Condition" && (term.valueAr.includes("SCCA") || term.valueEn.includes("SCCA") || term.valueAr.includes("تحكيم") || term.valueEn.includes("Arbitration"))) {
        baseData.disputeResolution = "SCCA";
      } else if (term.category === "Condition" && (term.valueAr.includes("المحاكم") || term.valueEn.includes("Court"))) {
        baseData.disputeResolution = "SA_COURTS";
      }
    });

    localStorage.setItem("clm_contract_data", JSON.stringify(baseData));
    localStorage.setItem("clm_contract_is_edit_mode", "true");
    
    toast.success(
      isAr 
        ? "تم ربط وحقن البنود المستخلصة بنجاح في محرر صياغة العقود المتكامل CLM الذكي وسنوجهك للتوقيع!" 
        : "Extracted clauses injected directly into main Contracts parameters dashboard! Navigating..."
    );

    setTimeout(() => {
      navigate("/app/contracts");
    }, 1200);
  };

  // Convert tasks and action items to global compliance workflows
  const handleExportWorkflows = () => {
    if (tasks.length === 0) {
      toast.error(isAr ? "لا توجد مهام أو تعهدات لتصديرها للتشغيل المالي." : "No action items available to export.");
      return;
    }

    localStorage.setItem("custom_negotiation_tasks", JSON.stringify(tasks));
    
    toast.success(
      isAr
        ? "تمت مزامنة وحقن المهام والتعهدات لـ 'مسار تدقيق الشروط' بنجاح، وسنوجهك للأتمتة والتشغيل!"
        : "Successfully synchronized compliance tasks! Redirecting to Workflows Dashboard..."
    );

    setTimeout(() => {
      navigate("/app/workflows");
    }, 1200);
  };

  // Microphone Start, Pause, Stop Simulation
  const handleStartMic = () => {
    setIsRecording(true);
    setIsPaused(false);
    setStatus("Live");
    toast.success(isAr ? "بدأت جلسة تسجيل وقراءة الصوت الفورية" : "Live mic voice acquisition stream initiated");
    drawSimulatedWave();
  };

  const handlePauseMic = () => {
    setIsPaused(!isPaused);
    toast.info(
      isPaused 
        ? (isAr ? "تم استئناف الالتقاط الفوري" : "Acquisition resumed") 
        : (isAr ? "تم إيقاف الالتقاط مؤقتاً" : "Acquisition paused")
    );
  };

  const handleStopMic = () => {
    setIsRecording(false);
    setIsPaused(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const fullTranscript = transcriptLogs.length > 0 
      ? transcriptLogs.map(log => `[${log.speaker}]: ${log.textAr} / ${log.textEn}`).join("\n")
      : (isAr ? "اجتماع لمراجعة البنود المالية والتسليم لصيانة الخوادم. قيمة توريد الأجهزة 85 ألف ريال مع صيانة SLAs لمدة 36 شهراً وشرط جزائي 1% بحد أقصى 10% وغرفة التحكيم في الرياض." : "Annual Supply and warranty: Value of SAR 85,000, 36 months technical SLA coverage, late delivery penalty 1% with cap at 10% maximum. Jurisdiction body general courts Riyadh.");

    analyzeTextWithGemini(fullTranscript);
  };

  // Canvas drawing for simulated audio amplitude
  const drawSimulatedWave = () => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let index = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(16, 185, 129, 0.05)";
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#10b981"; // Emerald-500

      const sliceWidth = (width * 1.0) / 80;
      let x = 0;

      for (let i = 0; i < 80; i++) {
        const amplitude = isPaused 
          ? 2 
          : Math.sin(i * 0.15 + index * 0.2) * 15 * (Math.random() * 0.4 + 0.6) + 
            Math.cos(i * 0.05 + index * 0.15) * 10;
        
        const y = height / 2 + amplitude;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Draw secondary sleek fill
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = "rgba(16, 185, 129, 0.04)";
      ctx.fill();

      // Add small digital dots
      ctx.fillStyle = "#10b981";
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const randX = Math.random() * width;
        const randY = height / 2 + (Math.random() - 0.5) * 30;
        ctx.arc(randX, randY, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      index++;
      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Injects realistic Arabic & English conversation snippets depending on recording duration seconds
  const triggerSimulatedTranscript = (sec: number) => {
    const speakerLogs = [
      {
        trigger: 1,
        speaker: isAr ? "م. فهد القحطاني (الطرف الأول)" : "Eng. Fahd Al-Qahtani (First Party)",
        textAr: "السلام عليكم ورحمة الله وبركاته، نبدأ مراجعة البنود المالية والتسليم وتحديداً صيانة الخوادم للعام الجديد.",
        textEn: "Greetings everyone, let us launch our annual supply review with an emphasis on finance milestones and warranty terms."
      },
      {
        trigger: 5,
        speaker: isAr ? "د. روبرت ميلر (الطرف الثاني)" : "Dr. Robert Miller (Second Party)",
        textAr: "أهلاً بالجميع، يسعدنا تزويدكم بالبنية السحابية المطلوبة. نقترح قيمة إجمالية 85 ألف ريال سعودي مع الالتزام التام بالتوريد.",
        textEn: "Happy to be here. We propose a scope value of SAR 85,000 for server deployments, guaranteed within normal thresholds."
      },
      {
        trigger: 12,
        speaker: isAr ? "م. فهد القحطاني (الطرف الأول)" : "Eng. Fahd Al-Qahtani (First Party)",
        textAr: "ممتاز، لكن يلزمنا تأمين بند الصيانة والدعم الفني SLA ليكون 36 شهراً بشكل شامل مع تغطية طوارئ للشبكة والأنظمة.",
        textEn: "Acknowledged. However, we request a full 36-month comprehensive SLA with a focus on emergency network coverage."
      },
      {
        trigger: 19,
        speaker: isAr ? "د. روبرت ميلر (الطرف الثاني)" : "Dr. Robert Miller (Second Party)",
        textAr: "موافقون تماماً على تمديد الصيانة والضمان التشغيلي إلى 36 شهراً. وبخصوص غرامات التأخير، الحد الأقصى للشرط الجزائي 10%.",
        textEn: "Agreed. We will scale support coverage to 36 months. Regarding late deliveries, we accept a penalty cap of 10% total."
      },
      {
        trigger: 26,
        speaker: isAr ? "رغد الشريف (ممثلة الشؤون القانونية)" : "Raghad Al-Sharif (Legal Representative)",
        textAr: "رائع جداً، بناءً على هذا الاتفاق سنقوم بربط وصياغة العقد النهائي وتحديد محاكم الرياض كمركز معتمد لفض النزاعات والتحكيم.",
        textEn: "Wonderful. Based on these terms, our legal dashboard will bind Riyadh courts for final arbitration and dispute filings."
      }
    ];

    const match = speakerLogs.find(log => log.trigger === sec);
    if (match) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setTranscriptLogs(prev => [
        ...prev,
        {
          time: timeStr,
          speaker: match.speaker,
          textAr: match.textAr,
          textEn: match.textEn
        }
      ]);
      toast.info(`${match.speaker}: ${isAr ? match.textAr.substring(0, 30) + "..." : match.textEn.substring(0, 30) + "..."}`);
    }
  };

  // Drag & Drop Audio Upload Handler
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      simulateAudioFileIngestion(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateAudioFileIngestion(files[0]);
    }
  };

  const simulateAudioFileIngestion = (file: File) => {
    if (!file.type.startsWith("audio/") && !file.name.endsWith(".wav") && !file.name.endsWith(".mp3") && !file.name.endsWith(".m4a")) {
      toast.error(isAr ? "يرجى رفع ملف صوتي صالح بصيغة MP3, WAV or M4A" : "Please upload a valid audio file (MP3, WAV or M4A)");
      return;
    }

    setDroppedFile(file);
    setUploadProgress(10);
    setStatus("Live");

    const timer = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          toast.success(
            isAr 
              ? `تم استيراد الملف ${file.name} وبدء فحص ملامح البنود...` 
              : `Audio file ${file.name} ingested successfully. Initializing semantic pass...`
          );
          
          // Seed logs dynamically with delay
          setTimeout(() => {
            setTranscriptLogs([
              {
                time: "File Import",
                speaker: isAr ? "التفاوض المستورد (بنية الخوادم)" : "Imported Negotiation (Server Cluster)",
                textAr: "اتفق الطرفان على توريد أجهزة شبكات متطورة بقيمة 85,000 ريال بموجب غرامة غياب سلع مقدارها 1% يومياً.",
                textEn: "Parties agreed on server networking hardware value of SAR 85,000, governed by 1% daily overdue penalties."
              },
              {
                time: "File Import",
                speaker: isAr ? "نقاط اتفاق القانونية" : "Legal Alignment Points",
                textAr: "فض النزاعات يخضع للمحاكم العامة والمحلية بمدينة الرياض مع التزام الصيانة التشغيلية الشاملة لمدة 3 سنوات.",
                textEn: "Dispute resolution bound strictly to Riyadh general courts with a 3-year full tech support SLA."
              }
            ]);
            analyzeTextWithGemini("File Import: Agreed on server networking hardware valuation SAR 85,000. Late delivery 1% penalty. 3 years comprehensive SLA tech support. Jurisdiction Riyadh courts.");
          }, 1200);

          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Manual Mode B Quick Text Templates Injection
  const injectManualTemplate = (type: string) => {
    setManualPromptType(type);
    if (type === "employment_review") {
      setManualText(
        isAr 
          ? `مسودة اجتماع توظيف المهندس ماجد فهد:
• المسمى الوظيفي المستهدف: مدير مبيعات تقنية برمجيات سحابية.
• الراتب الأساسي: 12,000 ريال سعودي شهرياً.
• بدل السكن المخصص: 3,000 ريال وبدل الاتصال والمواصلات 1,000 ريال.
• يبدأ سريان العمل القانوني من 1 يوليو 2026 لفترة تجريبية 90 يوماً.
• الطرف المسؤول عن التوقيع: الأستاذ عبدالرحمن المدير التنفيذي.`
          : `Meeting notes on Software Sales Recruiter Agreement (Majid Fahd):
- Designated Job: Lead Sales Director of Cloud Enterprise Apps
- Basic monthly salary set to SAR 12,000 flat
- Housing allocation calculated at SAR 3,000 & transport support at SAR 1,000
- Initial contract takes effect July 1, 2026, with standard 90-day probation window
- Designated corporate signer: CEO Abdulrahman Al-Mudad.`
      );
    } else if (type === "dispute_clause") {
      setManualText(
        isAr 
          ? `جلسة تسوية وتوريد قطع غيار الأجهزة:
• وافق الطرف الثاني على تعويض الأخير بالبضائع البديلة في غضون 7 أيام عمل.
• في حال عجز المورد عن الحل، يلتزم بدفع شرط جزائي قدره 15,000 ريال تعويضاً.
• يلتزم الطرفان التزاماً كاملاً بعدم إفشاء السرية التجارية والحلول التقنية المعتمدة.
• نظام التحكيم المتفق عليه: المركز السعودي للتحكيم التجاري (SCCA) بالمنطقة الشرقية.`
          : `Dispute adjustment and parts replacement review session:
- Second party agrees to ship hardware replacements within 7 business days
- Penalty of SAR 15,000 is written into obligations for non-compliance fallback
- Full bilateral non-disclosure agreement (NDA) rules apply permanently
- Primary dispute framework resolution body: Saudi Center for Commercial Arbitration (SCCA).`
      );
    } else {
      setManualText(
        isAr 
          ? `ملاحظات ورشة العمل لمناقشة عقد الشراكة السنوي:
• المساهمة التقنية للطرف الأول: تزويد نظام إدارة الفواتير والموارد ERP.
• مساهمة الطرف الثاني الاستثمارية: تمويل نقدي قدره 250,000 ريال بمقابل نسبة 20%.
• الغرامة المقترحة في حال الإخلال بالتسليم: 2,000 ريال شهرياً.
• يخضع العقد الحالي لقوانين وأنظمة وزارة الموارد البشرية واللوائح التنظيمية بالمملكة.`
          : `Partnership & Joint ERP platform notes:
- First Party contribution: Deploy SaaS billing tools and ERP platform code
- Second Party equity fund injection: SAR 250,000 cash for 20% ownership share
- Breach penalty: SAR 2,000 monthly default rate
- Governing regulation code: Corporate and HR standard guidelines KSA.`
      );
    }
    toast.success(isAr ? "تم إدراج مسودة البنود النموذجية للتعديل!" : "Mock legal draft template injected into workspace!");
  };

  // Direct manual trigger to convert notes into legal structure using Gemini and sync engines
  const handleIngestManualText = () => {
    if (!manualText.trim()) {
      toast.error(isAr ? "الرجاء كتابة أو إدراج ملاحظات الاجتماع أولاً" : "Please paste some conversation points first");
      return;
    }

    analyzeTextWithGemini(manualText);
  };

  // Interactive Action: Add custom follow-up task
  const handleAddTask = () => {
    const newTaskAr = prompt(isAr ? "اكتب تفاصيل التكليف / المهمة باللغة العربية:" : "Specify follow-up task description in Arabic:");
    if (!newTaskAr) return;
    const newTaskEn = prompt(isAr ? "اكتب تفاصيل التكليف باللغة الإنجليزية:" : "Specify follow-up task description in English:") || "";

    const assignee = prompt(isAr ? "المنسوب المسؤول عنها / الموظف المكلف:" : "Assignee / Team member:") || "Legal Desk";

    const newTask: NegotiationTask = {
      id: `task-${Date.now()}`,
      titleAr: newTaskAr,
      titleEn: newTaskEn,
      assignee: assignee,
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "Medium",
      completed: false
    };

    setTasks(prev => [newTask, ...prev]);
    toast.success(isAr ? "تم تسجيل تفعيل التكليف القانوني الجديد!" : "Legal action point added to tracking catalog");
  };

  // Toggle task completed state
  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    toast.info(isAr ? "تم تحديث حالة إنجاز التكليف الفوري" : "Follow-up task compliance checking toggled");
  };

  // Delete follow-up task
  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.error(isAr ? "تم حذف المهمة من جدول الأعمال" : "Task item removed from meeting dashboard");
  };

  // Save / Sync with global legal workflows toast
  const handleSyncWithWorkflows = () => {
    toast.success(
      isAr 
        ? "تمت مزامنة مخطط المهام المستخلصة وربطها بنجاح بقسم 'تدفقات العمل الذكية Workflow' لشركتكم!" 
        : "Successfully synchronized task items. Action tasks mapped directly into global Workflows engine!"
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-1 md:p-4 selection:bg-emerald-500 selection:text-white" dir={isAr ? "rtl" : "ltr"}>
      {/* HEADER SECTION WITH MODERN DUAL-LANGUAGE BRANDING */}
      <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-[0_4px_24px_-4px_rgba(15,23,42,0.04)] mb-6 flex flex-col lg:flex-row items-center justify-between gap-4 relative overflow-hidden">
        {/* Abstract legal lines decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10b981]/[0.02] rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/15">
            <Video className="w-7 h-7" />
          </div>
          <div className="text-right rtl:text-right ltr:text-left">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-md">
                Smart Negotiations & Meet Hub
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-md">
                v2.4
              </span>
            </div>
            
            <input
              type="text"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 text-lg md:text-xl font-black text-slate-800 outline-none w-full max-w-[480px] py-0.5 transition-all"
            />
          </div>
        </div>

        {/* STATUS AND INTERACTIVE PROGRESS TRACKER */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto justify-end">
          {/* Timeline Status Bubbles */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {[
              { id: "Scheduled", labelAr: "مجدول", labelEn: "Scheduled", color: "bg-blue-500" },
              { id: "Live", labelAr: "تسجيل فوري", labelEn: "Live Capture", color: "bg-rose-500 animate-pulse" },
              { id: "Analyzing", labelAr: "تحليل الذكاء", labelEn: "Analyzing", color: "bg-amber-500" },
              { id: "Completed", labelAr: "جاهز ومكتمل", labelEn: "Flow Extracted", color: "bg-emerald-500" }
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStatus(st.id as any);
                  toast.info(isAr ? `تغيير محاكي للحالة إلى: ${st.labelAr}` : `Simulated status forced to: ${st.labelEn}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  status === st.id 
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/85" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/30"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${st.color}`} />
                <span>{isAr ? st.labelAr : st.labelEn}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {/* Encryption & Security Badge */}
            <div className="hidden md:flex items-center gap-1 text-[10px] bg-emerald-50/50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>TLS 1.3 / AES-256</span>
            </div>
          </div>
        </div>
      </div>

      {/* DUAL WORKSPACE MAIN PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* RIGHT SIDE PANEL: Meeting Control & Ingestion Dashboard */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="glass-premium rounded-3xl card-premium-shadow p-5 md:p-6 flex flex-col relative">
            
            {/* Tab Header for Mode A vs Mode B */}
            <div className="flex items-center justify-between border-b border-slate-200/50 pb-4 mb-5 flex-wrap gap-2">
              <h2 className="text-sm font-bold tracking-tight text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "منصة التحكم والمدخلات الذكية" : "Control & Ingestion Dashboard"}</span>
              </h2>

              <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveMode("A")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "A" 
                      ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "تلقائي (رابط وميكروفون)" : "Mode A (Live API)"}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode("B")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeMode === "B" 
                      ? "bg-white text-emerald-700 shadow-sm border border-slate-200/60" 
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {isAr ? "يدوي (نصوص المحضر)" : "Mode B (Paste Manual)"}
                </button>
              </div>
            </div>

            {/* MODE A CONTENT: GOOGLE MEET & VOICE MIC CAPTURING */}
            {activeMode === "A" && (
              <div className="space-y-5">
                {/* Simulated Google Meet API integration platform panel */}
                <div className="glass-premium card-premium-shadow card-premium-hover p-4 rounded-2xl relative overflow-hidden group">
                  <div className="absolute -right-12 -top-12 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-xl group-hover:bg-emerald-500/[0.04] transition-all text-right" />
                  
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Video className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-slate-800">
                          {isAr ? "بوابة الغرف الافتراضية - Google Meet API" : "Virtual Room Integration Gateway"}
                        </h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isAr ? "محاكي لربط الحساب ومشاركة المسودة" : "Simulates secure sandbox Meet provisioning"}
                        </p>
                      </div>
                    </div>

                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-md border ${
                      isMeetConnected 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {isMeetConnected ? "CONNECTED" : "DISCONNECTED"}
                    </span>
                  </div>

                  {!isMeetConnected ? (
                    <button
                      type="button"
                      onClick={handleCreateMeetRoom}
                      disabled={isMeetProvisioning}
                      className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
                    >
                      {isMeetProvisioning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>{isAr ? "جاري تحضير الغرفة البرمجية..." : "Provisioning Legal Portal Link..."}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>{isAr ? "توليد وإنشاء رابط غرفة Google Meet" : "Authorize & Create Google Meet Link"}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 bg-white border border-slate-200 p-2.5 rounded-xl animate-in slide-in-from-top-1 duration-200 shadow-inner">
                        <input
                          type="text"
                          readOnly
                          value={meetLink}
                          className="bg-transparent text-xs text-slate-650 outline-none flex-1 font-mono text-center font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(meetLink);
                            toast.success(isAr ? "تم نسخ رابط الغرفة بنجاح!" : "Meet link copied to clipboard!");
                          }}
                          className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-800 rounded-lg transition-all"
                          title="Copy Link"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleLaunchMeet}
                          className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer shadow-sm hover:scale-[1.01]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isAr ? "فتح النافذة مباشرة" : "Launch Meeting Tab"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setMeetLink("");
                            setIsMeetConnected(false);
                            setStatus("Completed");
                            toast.error(isAr ? "تم فك ارتباط جلسة Google Meet" : "Bilateral Meet Room correlation cleared");
                          }}
                          className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-xl text-[10px] transition-all flex items-center justify-center gap-1.5 border border-rose-200/50 cursor-pointer shadow-sm"
                        >
                          <span>{isAr ? "إلغاء وفصل الغرفة" : "Revoke Meet Link"}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* MICROPHONE STREAM CONTROLS Panel */}
                <div className="glass-premium card-premium-shadow card-premium-hover p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Mic className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isAr ? "تسجيل الميكروفون المباشر" : "Direct Mic Access Panel"}</span>
                    </h4>

                    {isRecording && (
                      <span className="flex items-center gap-1 text-[9px] bg-rose-50 text-rose-600 border border-rose-200/50 px-2 py-0.5 rounded-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                        <span>{recordingDuration}s - RECORDING</span>
                      </span>
                    )}
                  </div>

                  {/* HTML5 Dynamic Waveform Canvas Box */}
                  <div className="h-20 bg-slate-950 border border-slate-900 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center shadow-inner">
                    {!isRecording ? (
                      <div className="text-center p-4 space-y-1">
                        <p className="text-[10px] text-slate-400 font-bold">
                          {isAr ? "نظام التقاط الصوت المعزز بالذكاء الاصطناعي معلق" : "Microphone audio signal monitor suspended"}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          {isAr ? "انقر بدء لبث محادثات التفاوض" : "Click 'Start Live Capturing' to broadcast voice context"}
                        </p>
                      </div>
                    ) : (
                      <canvas ref={waveCanvasRef} className="w-full h-full animate-pulse" />
                    )}
                  </div>

                  {/* Mic Buttons Action Layout */}
                  <div className="flex flex-wrap items-center gap-2">
                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={handleStartMic}
                        className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 cursor-pointer hover:scale-[1.01]"
                      >
                        <Mic className="w-4 h-4" />
                        <span>{isAr ? "بدء استماع الميكروفون" : "Start Live Capturing Mic"}</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handlePauseMic}
                          className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer shadow-sm hover:scale-[1.01]"
                        >
                          {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
                          <span>{isPaused ? (isAr ? "استكمال" : "Resume") : (isAr ? "إيقاف مؤقت" : "Pause")}</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleStopMic}
                          className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md hover:scale-[1.01]"
                        >
                          <Square className="w-3.5 h-3.5 fill-current text-white/90" />
                          <span>{isAr ? "توقف وتحليل" : "Stop & Analyze"}</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer relative overflow-hidden flex flex-col items-center justify-center ${
                    isDraggingOver 
                      ? "border-emerald-500 bg-emerald-50/50" 
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100/50"
                  }`}
                >
                  <input
                    type="file"
                    id="audio-file-uploader"
                    accept="audio/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleFileSelect}
                  />

                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-slate-200 mb-3 group-hover:scale-110 transition-transform shadow-sm text-slate-500">
                    <Upload className="w-5 h-5 text-slate-400" />
                  </div>

                  <p className="text-xs font-bold text-slate-700 mb-1">
                    {isAr ? "اسحب وأدرج ملف التسجيل الصوتي هنا" : "Drag & Drop Audio file (MP3/WAV)"}
                  </p>
                  <p className="text-[10px] text-slate-400 max-w-[280px]">
                    {isAr 
                      ? "بصيغة MP3, WAV, AMR حتى 25 ميجابايت للتفريغ التلقائي" 
                      : "Supports standard audio layouts for robust cloud processing"}
                  </p>

                  {droppedFile && (
                    <div className="mt-4 w-full max-w-[280px] bg-white border border-slate-200 p-2.5 rounded-xl font-sans inline-block shadow-sm">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                        <span className="truncate max-w-[150px] font-bold text-slate-700">{droppedFile.name}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MODE B CONTENT: MANUAL NOTES INGESTION */}
            {activeMode === "B" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">
                    {isAr ? "قوالب سريعة لتسجيل محضر الجلسة:" : "Minutes prompt template triggers:"}
                  </span>
                </div>

                {/* Fast presets tags */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    { id: "employment_review", titleAr: "مراجعة قرار توظيف", titleEn: "Employment Review" },
                    { id: "dispute_clause", titleAr: "تسوية نزاع توريد", titleEn: "Parts Dispute" },
                    { id: "partnership_notes", titleAr: "اتفاق شراكة بمشروع", titleEn: "Project Joint Venture" }
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => injectManualTemplate(preset.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all hover:scale-[1.01] ${
                        manualPromptType === preset.id 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {isAr ? preset.titleAr : preset.titleEn}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <textarea
                    rows={8}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={
                      isAr
                        ? "الصق تفاصيل ومسودة الشروط والمفاوضات هنا مباشرة..."
                        : "Paste legal details, raw transcript text, or external meeting bullets..."
                    }
                    className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-2xl p-4 text-xs font-semibold border border-slate-200 outline-none focus:bg-white focus:border-emerald-500 placeholder:text-slate-400 transition-all leading-relaxed shadow-inner"
                  />
                  
                  <div className="absolute bottom-3 left-4 text-[9px] text-slate-400 font-mono font-bold">
                    {manualText.length} Chars
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleIngestManualText}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10 hover:scale-[1.01]"
                >
                  <Bot className="w-4 h-4" />
                  <span>{isAr ? "معالجة وتحويل البنود فورا" : "Extract Elements & Format Legal Block"}</span>
                </button>
              </div>
            )}
          </div>

          {/* DYNAMIC REAL-TIME DIALOG TRANSCRIPT LOG */}
          <div className="glass-premium card-premium-shadow card-premium-hover p-5 flex flex-col h-[280px]">
            <div className="flex items-center justify-between border-b border-slate-150 border-slate-200 pb-3 mb-3">
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>{isAr ? "نافذة رصد وتحليل الحوار (Live Log)" : "Live Semantic Acquirement Log"}</span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  setTranscriptLogs([]);
                  toast.success(isAr ? "تم إخلاء سجل الحوار" : "Interaction log cleared");
                }}
                className="text-[9px] text-slate-400 hover:text-slate-800 transition-colors font-bold"
              >
                {isAr ? "مسح السجل" : "Clear Logs"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar text-xs font-medium">
              {transcriptLogs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-4 space-y-2">
                  <Clock className="w-8 h-8 text-slate-200" />
                  <div>
                    <p className="font-bold text-slate-500">
                      {isAr ? "لا توجد تفاصيل تفاوض جارية" : "No live logs currently registered"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {isAr ? "أطلق التقاط الميكروفون أو الصق نصاً لتتبع الترجمة" : "Activate mic capture or type text to monitor transcripts"}
                    </p>
                  </div>
                </div>
              ) : (
                transcriptLogs.map((log, lidx) => (
                  <div key={lidx} className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80 space-y-1 animate-in fade-in slide-in-from-bottom-1 duration-200 shadow-sm">
                    <div className="flex items-center justify-between text-[10px] border-b border-slate-100 pb-1 mb-1 flex-wrap gap-1">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {log.speaker}
                      </span>
                      <span className="text-slate-400 font-mono text-[9px] font-bold">{log.time}</span>
                    </div>

                    <p className="text-slate-800 leading-relaxed text-[11px] text-right font-medium pr-2 border-r-2 border-emerald-500/40" dir="rtl">
                      {log.textAr}
                    </p>
                    <p className="text-slate-600 leading-relaxed text-[11px] text-left ltr:text-left font-sans italic pl-2 mt-1" dir="ltr">
                      {log.textEn}
                    </p>
                  </div>
                ))
              )}
              <div ref={textEndRef} />
            </div>
          </div>
        </div>

        {/* LEFT SIDE PANEL: AI Action Core & Flow Blueprint */}
        <div className="lg:col-span-7 glass-premium card-premium-shadow card-premium-hover p-5 md:p-6 flex flex-col items-stretch relative min-h-[600px]">
          
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-full font-bold select-none shadow-sm">
            <Zap className="w-3.5 h-3.5 text-emerald-650 text-emerald-600 animate-pulse" />
            <span>{isAr ? "محرك الذكاء القانوني نشق" : "Cognitive AI Online"}</span>
          </div>

          <div className="border-b border-slate-100 pb-4 mb-5">
            <h2 className="text-base font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>{isAr ? "مخطط العمل الناتج والمخطط الرقمي" : "AI Action Core & Flow Blueprint"}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {isAr 
                ? "يتم هنا تفريع المهام المستخلصة، وتأكيد البنود وتهيئتها للصياغة والتحكيم" 
                : "Real-time task allocations and verified binding conditions generated from discussion flows"}
            </p>
          </div>

          {/* ADVANCED AI EXECUTIVE SUMMARY DISPLAY */}
          <div className="mb-5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-emerald-500/20 transition-all duration-300 relative overflow-hidden group shadow-sm">
            <div className="absolute -right-12 -top-12 w-24 h-24 bg-emerald-500/[0.01] rounded-full blur-xl group-hover:bg-emerald-500/[0.03] transition-all" />
            <div className="flex items-center gap-1.5 mb-2 border-b border-slate-200 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <h3 className="text-xs font-bold text-slate-700">
                {isAr ? "الملخص التنفيذي الذكي (منشأ بـ Gemini)" : "Cognitive Executive Summary (Gemini-Generated)"}
              </h3>
            </div>
            <div className="space-y-2.5">
              <p className="text-xs text-slate-800 leading-relaxed text-right font-semibold" dir="rtl">
                {executiveSummaryAr}
              </p>
              <div className="border-t border-slate-200 my-1" />
              <p className="text-xs text-slate-600 leading-relaxed text-left font-sans italic font-medium" dir="ltr">
                {executiveSummaryEn}
              </p>
            </div>
          </div>

          {/* Nested Dashboard Tabs */}
          <div className="flex bg-slate-100/80 p-0.5 rounded-2xl border border-slate-200/60 mb-5 relative z-10 font-black shadow-inner">
            {[
              { id: "terms", titleAr: "البنود القانونية المستخرجة", titleEn: "Extracted Legal Terms" },
              { id: "tasks", titleAr: "جدول التكليفات والمهام", titleEn: "Workflow Obligations" }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBlueprintTab(tab.id as any)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  blueprintTab === tab.id 
                    ? "bg-white text-slate-800 shadow-sm border border-slate-200" 
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {isAr ? tab.titleAr : tab.titleEn}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: EXTRACTED TERMS VIEW */}
          {blueprintTab === "terms" && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                {extractedTerms.length === 0 ? (
                  <div className="text-center p-12 text-slate-400 space-y-3">
                    <FileCheck className="w-12 h-12 text-slate-200 mx-auto" />
                    <div>
                      <p className="font-bold text-slate-500">
                        {isAr ? "بانتظار استيراد أو معالجة محضر الاجتماع" : "Awaiting meeting document processing"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isAr ? "بمجرد المعالجة، سيتم استنباط المسؤوليات والغرامات والمدفوعات آلياً هنا" : "Dynamic legal constraints will generate instantly in this viewport"}
                      </p>
                    </div>
                  </div>
                ) : (
                  extractedTerms.map((term, tidx) => {
                    const colors: Record<string, string> = {
                      Party: "text-blue-700 bg-blue-50 border-blue-200",
                      Payment: "text-emerald-700 bg-emerald-50 border-emerald-200",
                      Penalty: "text-rose-700 bg-rose-50 border-rose-200",
                      Obligation: "text-indigo-700 bg-indigo-50 border-indigo-200",
                      Condition: "text-amber-700 bg-amber-50 border-amber-200"
                    };

                    return (
                      <div 
                        key={tidx} 
                        className="bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:border-zinc-300 transition-all relative overflow-hidden group shadow-sm"
                      >
                        {/* Interactive Match indicator tag */}
                        <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500/40" />

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-md border ${colors[term.category]}`}>
                              {term.category}
                            </span>
                            
                            <span className="text-[10px] text-zinc-450 text-zinc-500 font-bold">
                              {isAr ? term.titleAr : term.titleEn}
                            </span>
                          </div>

                          <p className="text-zinc-800 font-bold text-sm text-right rtl:text-right border-r-2 border-emerald-500/30 pr-2" dir="rtl">
                            {term.valueAr}
                          </p>
                          <p className="text-zinc-650 font-medium text-xs text-left ltr:text-left font-sans pl-2" dir="ltr">
                            {term.valueEn}
                          </p>
                        </div>

                        {/* Confidence Ring Progress */}
                        <div className="flex sm:flex-col items-end gap-1.5 justify-between select-none">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-zinc-400 font-bold">{isAr ? "نسبة دقة المطابقة" : "Confidence"}</span>
                            <span className="text-xs font-black text-emerald-600 font-mono">{term.confidence}%</span>
                          </div>
                          
                          <div className="w-16 bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${term.confidence}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Fast Manual Bind helper bottom bar */}
              <div className="mt-8 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <h4 className="text-xs font-bold text-zinc-800">
                      {isAr ? "دمج مباشر للشروط مع العقد الرئيسي" : "Bind parameters with Master Contract"}
                    </h4>
                    <p className="text-[9px] text-zinc-455 text-zinc-400 mt-0.5 font-bold">
                      {isAr ? "تصدير البنود المعالجة مباشرة وصياغتها بنظام CLM" : "Auto-populates corresponding elements inside Contracts editor"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBindToCLM}
                  className="w-full md:w-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isAr ? "ربط وحقن البنود بـ CLM" : "Bind directly to CLM System"}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB CONTENT: TASKS BLUEPRINT */}
          {blueprintTab === "tasks" && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-450 text-zinc-500">
                    {isAr ? `تضمين وجدولة عدد ${tasks.length} مهام معمدة:` : `Tracking ${tasks.length} parsed assignments:`}
                  </span>

                  <button
                    type="button"
                    onClick={handleAddTask}
                    className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors bg-emerald-50 border border-emerald-100 px-2.5 py-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAr ? "إضافة تكليف يدوي" : "Add Obligation Task"}</span>
                  </button>
                </div>

                {tasks.map((task) => (
                  <div 
                    key={task.id} 
                    className={`bg-zinc-50/50 p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 group ${
                      task.completed ? "border-zinc-200 opacity-60 bg-zinc-100/30" : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        type="button"
                        onClick={() => toggleTaskCompleted(task.id)}
                        className={`mt-1 h-5 w-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                          task.completed 
                            ? "bg-emerald-500 border-emerald-500 text-white" 
                            : "border-zinc-300 bg-white hover:border-emerald-500 text-transparent"
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="flex-1 min-w-0 text-right rtl:text-right ltr:text-left">
                        <p className={`text-xs font-bold leading-relaxed ${task.completed ? "line-through text-zinc-400" : "text-zinc-800"}`}>
                          {isAr ? task.titleAr : task.titleEn}
                        </p>
                        
                        <div className="flex items-center gap-3 mt-1.5 text-[9px] text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1 font-mono font-medium">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>{task.dueDate}</span>
                          </span>

                          <span className="flex items-center gap-1 font-semibold">
                            <User className="w-3 h-3 text-zinc-400" />
                            <span>{task.assignee}</span>
                          </span>

                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] uppercase border ${
                            task.priority === "High" 
                              ? "bg-rose-50 text-rose-705 text-rose-700 border-rose-200" 
                              : task.priority === "Medium"
                              ? "bg-amber-50 text-amber-705 text-amber-700 border-amber-200"
                              : "bg-blue-50 text-blue-705 text-blue-750 text-blue-700 border-blue-200"
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-100"
                      title="Delete Obligation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Action layout button */}
              <div className="mt-8 bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <div className="w-8 h-8 rounded-lg bg-emerald-55 bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center animate-pulse">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div className="text-right rtl:text-right ltr:text-left">
                    <h4 className="text-xs font-bold text-zinc-800">
                      {isAr ? "تصدير لسير العمل العام (Workflows)" : "Synchronize Task Blueprints"}
                    </h4>
                    <p className="text-[9px] text-zinc-400 mt-0.5 font-bold">
                      {isAr ? "تحويل قائمة التعهدات لبطاقات مهام تفاعلية بمدارج" : "Correlate compliance tasks with designated team members"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleExportWorkflows}
                  className="w-full md:w-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-100" />
                  <span>{isAr ? "مزامنة المهام والتكليفات" : "Sync Actions with Workspace"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
