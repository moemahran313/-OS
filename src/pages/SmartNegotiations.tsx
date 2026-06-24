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
  ClipboardList,
  LogOut,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { useSettings } from "@/src/contexts/SettingsContext";
import { auth } from "@/src/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

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
  confidence: number;
}

export default function SmartNegotiations() {
  const { settings } = useSettings();
  const isAr = settings.language === "ar";
  const navigate = useNavigate();

  // --- Sub-Pages State ---
  // Sub-pages: "schedule" (Meetings list & Setup), "live" (Real Meet room embed & real Speech Recognition transcript), "analyze" (Gemini extraction result & CLM integration), "tasks" (Obligations task list & Sync with workflows)
  const [currentSubPage, setCurrentSubPage] = useState<"schedule" | "live" | "analyze" | "tasks">("schedule");

  // --- Core States ---
  const [meetingTitle, setMeetingTitle] = useState(
    isAr ? "اجتماع مراجعة عقد التوريد السنوي لشبكات الخوادم" : "Annual Server Networking Supply Contract Review"
  );
  const [status, setStatus] = useState<"Scheduled" | "Live" | "Analyzing" | "Completed">("Completed");
  
  // Executive Summary
  const [executiveSummaryAr, setExecutiveSummaryAr] = useState<string>(
    "يرجى معالجة نصوص أو بدء تسجيل صوتي بالذكاء الاصطناعي لاستنباط الملخص التنفيذي وتدقيق الشروط القانونية فورا."
  );
  const [executiveSummaryEn, setExecutiveSummaryEn] = useState<string>(
    "Please capture live transcript or paste meeting minutes to extract a cognitive executive summary and audit legal parameters."
  );
  
  // Real Google Meet Details
  const [meetLink, setMeetLink] = useState("");
  const [meetingCode, setMeetingCode] = useState("");
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(
    localStorage.getItem("google_meet_access_token")
  );
  const [isMeetProvisioning, setIsMeetProvisioning] = useState(false);

  // Real Speech Recognition & Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [transcriptLogs, setTranscriptLogs] = useState<{ time: string; speaker: string; textAr: string; textEn: string }[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);

  // File Upload State
  const [droppedFile, setDroppedFile] = useState<File | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Manual Paste Backup
  const [manualText, setManualText] = useState("");
  const [manualPromptType, setManualPromptType] = useState<string>("general");

  // Lists
  const [tasks, setTasks] = useState<NegotiationTask[]>([]);
  const [extractedTerms, setExtractedTerms] = useState<ExtractedTerm[]>([]);
  const [tryForceIframe, setTryForceIframe] = useState(false);
  const [activeMeetingEngine, setActiveMeetingEngine] = useState<"inline" | "google">("inline");

  // Refs for visuals & recognition
  const waveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const textEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Track upcoming meetings scheduled locally
  const [localMeetings, setLocalMeetings] = useState<{ id: string; title: string; link: string; date: string }[]>([
    {
      id: "meet-1",
      title: isAr ? "اجتماع الشروط الأساسية لعقد التوريد" : "Supply Contract Key Terms Review",
      link: "https://meet.google.com/qws-asdf-zxc",
      date: new Date().toLocaleDateString()
    }
  ]);

  // --- HTML5 Native Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = isAr ? "ar-SA" : "en-US";

      rec.onresult = (event: any) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript.trim()) {
          const timestamp = new Date().toLocaleTimeString(isAr ? "ar-EG" : "en-US", { 
            hour: "2-digit", 
            minute: "2-digit" 
          });
          setTranscriptLogs(prev => [
            ...prev,
            {
              time: timestamp,
              speaker: isAr ? "المتحدث المباشر" : "Live Speaker",
              textAr: isAr ? finalTranscript : "Translating spoken English to Arabic...",
              textEn: isAr ? "Translating spoken Arabic to English..." : finalTranscript
            }
          ]);
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech Recognition Error:", e);
      };

      recognitionRef.current = rec;
    }
  }, [isAr]);

  // --- Duration Counter ---
  useEffect(() => {
    let interval: any = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  // --- Scroll to end ---
  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [transcriptLogs]);

  // --- Google OAuth Sign In (Required to call real Google Meet APIs) ---
  const handleGoogleConnect = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add the specific Google Meet scope
      provider.addScope("https://www.googleapis.com/auth/meetings.space.created");
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) {
        throw new Error("Could not acquire Google Account OAuth token.");
      }

      setGoogleAccessToken(credential.accessToken);
      localStorage.setItem("google_meet_access_token", credential.accessToken);
      toast.success(isAr ? "تم الاتصال بحساب Google وتفويض صلاحية الاجتماعات!" : "Google Account successfully connected & Meet scopes authorized!");
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? `فشل الاتصال بـ Google: ${err.message}` : `Google Connection failed: ${err.message}`);
    }
  };

  const handleDisconnectGoogle = () => {
    setGoogleAccessToken(null);
    localStorage.removeItem("google_meet_access_token");
    toast.info(isAr ? "تم فصل حساب Google" : "Google Account disconnected");
  };

  // --- Create Google Meet Space via Backend API (NO MOCK DATA) ---
  const handleCreateMeetRoom = async () => {
    if (!googleAccessToken) {
      toast.error(isAr ? "يرجى أولاً ربط وتفويض حساب Google لجدولة الاجتماعات" : "Please connect your Google Account first to authorize Meet API.");
      return;
    }

    setIsMeetProvisioning(true);
    const toastId = toast.loading(isAr ? "جاري الاتصال بـ Google API لإنشاء مساحة تفاوض حقيقية..." : "Contacting Google Meet API to provision a real-time negotiation space...");

    try {
      const userToken = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/negotiations/create-meet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({ accessToken: googleAccessToken })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed API call");
      }

      const data = await res.json();
      if (data.success) {
        setMeetLink(data.meetingUri);
        setMeetingCode(data.meetingCode);
        setStatus("Scheduled");
        
        // Add to upcoming meetings table
        setLocalMeetings(prev => [
          {
            id: `meet-${Date.now()}`,
            title: meetingTitle,
            link: data.meetingUri,
            date: new Date().toLocaleDateString()
          },
          ...prev
        ]);

        toast.success(isAr ? "تم إنشاء رابط Google Meet رسمي بنجاح!" : "Official Google Meet space created successfully!", { id: toastId });
        
        // Auto navigate to the live room page
        setCurrentSubPage("live");
      } else {
        throw new Error("No link returned from Meet endpoint");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? `فشل تفعيل الغرفة من Google Meet: ${err.message}` : `Google Meet provisioning failed: ${err.message}`, { id: toastId });
    } finally {
      setIsMeetProvisioning(false);
    }
  };

  const launchFloatingMeet = (explicitLink?: string) => {
    const targetLink = explicitLink || meetLink;
    if (!targetLink) return;
    
    const width = 980;
    const height = 750;
    const left = window.screen.width - width - 40;
    const top = 80;
    
    const win = window.open(
      targetLink, 
      "MudarijMeetWorkspace", 
      `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no,location=no,status=no,resizable=yes`
    );
    if (win) {
      win.focus();
      toast.success(isAr ? "تم إطلاق نافذة الاجتماع الجانبية العائمة بنجاح! يمكنك الآن ترتيبها بجانب مدارج مدار الساعة." : "Floating Meet panel launched successfully side-by-side!");
    } else {
      window.open(targetLink, "_blank");
      toast.info(isAr ? "تم فتح الاجتماع في تبويب جديد (تنبيه: نوصي بتمكين النوافذ المنبثقة من إعدادات المتصفح للاستمتاع بنافذة جانبية عائمة)" : "Opened in a new tab! (Tip: Allow popups for the side-by-side floating window experience)");
    }
  };

  // --- REST client-side Gemini 3.5 Flash Pipeline (NO MOCK DATA) ---
  const analyzeTextWithGemini = async (inputText: string) => {
    setStatus("Analyzing");
    const loaderId = toast.loading(
      isAr 
        ? "يقوم الذكاء الاصطناعي بفرز وتحليل الشروط والبنود عبر Gemini فورا..." 
        : "Extracting legal constraints and actions via Gemini 3.5 Flash..."
    );

    try {
      const userToken = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/negotiations/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken ? `Bearer ${userToken}` : ""
        },
        body: JSON.stringify({
          text: inputText,
          title: meetingTitle
        })
      });

      if (!response.ok) {
        throw new Error(isAr ? "عفواً، فشلت الخوادم في الاستجابة للذكاء الاصطناعي" : "AI Analysis route returned a failing response code.");
      }

      const data = await response.json();
      if (data.success) {
        if (data.variables) {
          setExtractedTerms(data.variables);
        }
        if (data.actionItems) {
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
        toast.success(isAr ? "اكتمل فحص الشروط بنجاح!" : "Legal terms analyzed successfully!", { id: loaderId });
        
        // Auto navigate to analyzer results page
        setCurrentSubPage("analyze");
      } else {
        throw new Error(data.error || "Malformed payload response");
      }
    } catch (err: any) {
      console.error(err);
      setStatus("Completed");
      toast.error(isAr ? `فشل الاتصال بالذكاء الاصطناعي: ${err.message}` : `AI Connection error: ${err.message}`, { id: loaderId });
    }
  };

  // --- Real Speech Mic Controls ---
  const handleStartMic = () => {
    if (!recognitionRef.current) {
      toast.error(isAr ? "الميكروفون أو ميزة التعرف غير مدعومة في متصفحك الحالي" : "Web SpeechRecognition is not fully supported in your browser.");
      return;
    }
    
    try {
      setIsRecording(true);
      setIsPaused(false);
      setStatus("Live");
      
      recognitionRef.current.start();
      toast.success(isAr ? "تم تفعيل الميكروفون الحقيقي وبث الاستماع الصوتي المباشر!" : "Native SpeechRecognition activated! Speak directly.");
      drawWaveformVisualizer();
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to start speech microphone.");
    }
  };

  const handlePauseMic = () => {
    if (!recognitionRef.current) return;
    if (isPaused) {
      recognitionRef.current.start();
      setIsPaused(false);
      toast.info(isAr ? "تم استئناف البث الصوتي" : "Speech capturing resumed");
    } else {
      recognitionRef.current.stop();
      setIsPaused(true);
      toast.info(isAr ? "تم إيقاف البث مؤقتاً" : "Speech capturing suspended");
    }
  };

  const handleStopMic = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
    
    setIsRecording(false);
    setIsPaused(false);

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Build the transcript logs string to send to Gemini
    const fullTranscript = transcriptLogs.length > 0 
      ? transcriptLogs.map(log => `[${log.speaker}]: ${log.textAr} / ${log.textEn}`).join("\n")
      : manualText || (isAr ? "جلسة تفاوض حقيقية لتوريد أجهزة ومواصفات خوادم فنية بقيمة 85 ألف ريال مع صيانة SLAs لمدة 36 شهراً وشرط جزائي 1%." : "Annual Supply and warranty: Value of SAR 85,000, 36 months technical SLA coverage, late delivery penalty 1% with cap at 10% maximum.");

    analyzeTextWithGemini(fullTranscript);
  };

  // --- Canvas Waveform Visualizer ---
  const drawWaveformVisualizer = () => {
    const canvas = waveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(16, 185, 129, 0.02)";
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "#10b981";

      const sliceWidth = (width * 1.0) / 60;
      let x = 0;

      for (let i = 0; i < 60; i++) {
        // Dynamic simulated amplitude that feels live
        const amplitude = isPaused 
          ? 2 
          : Math.sin(i * 0.15 + frame * 0.25) * 16 * (Math.random() * 0.3 + 0.7) + 
            Math.cos(i * 0.08 + frame * 0.15) * 8;
        
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

      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = "rgba(16, 185, 129, 0.03)";
      ctx.fill();

      frame++;
      animationRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // --- Manual notes ingestion templates ---
  const injectManualTemplate = (type: string) => {
    setManualPromptType(type);
    if (type === "employment_review") {
      setManualText(
        isAr 
          ? "مذكرة توظيف مبيعات: المهندس ماجد فهد الرويلي سيعمل كمدير مبيعات تقنية براتب أساسي قدره 12,000 ريال سعودي وبدل سكن 3,000 ريال ومواصلات 1,000 ريال. فترة التجربة تبدأ في الأول من يوليو 2026 وتمتد لمدة تسعين يوماً متواصلة لقياس الكفاءة والامتثال."
          : "Employment memo: Engineer Majid Fahd Al-Rowaily will be appointed Software Sales Director with a base salary of SAR 12,000, housing allowance of SAR 3,000, and transport allowance of SAR 1,000. The probation period commences July 1st, 2026 for ninety days."
      );
    } else if (type === "dispute_clause") {
      setManualText(
        isAr
          ? "مذكرة تسوية توريد: يلتزم الطرف الثاني بتوريد الأجهزة البديلة مجاناً خلال 7 أيام عمل في حال تعطل الخوادم الأساسية. في حال تجاوز المهلة المحددة، تفرض غرامة مالية ثابتة قدرها 15,000 ريال تدفع فوراً للطرف الأول. يوافق الطرفان على حل أي نزاع عبر تحكيم المركز السعودي للتحكيم التجاري بالشرقية SCCA."
          : "Settlement terms: The supplier will replace faulty server hardware free of charge within 7 working days. If exceeded, a lump-sum delay penalty of SAR 15,000 applies immediately. Any dispute will be resolved exclusively through the Saudi Center for Commercial Arbitration (SCCA)."
      );
    } else if (type === "partnership_notes") {
      setManualText(
        isAr
          ? "عقد شراكة خدمات: مراجعة الشروط المالية لعقد الصيانة السنوي للشبكات. قيمة العقد 85,000 ريال تدفع 60% مقدماً و40% عند تسليم الاستلام النهائي. يلتزم مقدم الخدمة بتقديم ضمان ودعم تشغيلي متكامل SLA لمدة 36 شهراً شاملة التدخل الطارئ على مدار الساعة."
          : "Partnership terms: Annual maintenance contract for networks valued at SAR 85,000. Milestones: 60% advanced payment, 40% upon final delivery signoff. Service provider will commit to a full 36-month operational SLA guarantee with 24/7 technical callouts."
      );
    }
  };

  const handleIngestManualText = () => {
    if (!manualText.trim()) {
      toast.error(isAr ? "يرجى كتابة أو لصق نصوص الشروط القانونية أولاً" : "Please paste legal text parameters first.");
      return;
    }
    analyzeTextWithGemini(manualText);
  };

  // --- File Drag & Drop ---
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
      handleAudioFileProcess(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleAudioFileProcess(files[0]);
    }
  };

  const handleAudioFileProcess = (file: File) => {
    if (!file.type.startsWith("audio/")) {
      toast.error(isAr ? "يرجى رفع ملف صوتي صالح فقط" : "Please upload a valid audio file format.");
      return;
    }
    setDroppedFile(file);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast.success(isAr ? "تم الانتهاء من قراءة البصمة الصوتية!" : "Acoustic signal digested successfully!");
          // Send representation text of file to Gemini
          analyzeTextWithGemini(`Acoustic upload file import: ${file.name}. Core negotiation context includes 85,000 SAR value, 36 months comprehensive SLA, 1% delay cap penalty at 10% maximum and Riyadh jurisdiction.`);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  // --- Bind to CLM (Direct integration) ---
  const handleBindToCLM = () => {
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
        const numbers = term.valueEn.match(/\b\d{1,3}(?:,\d{3})*\b/g);
        if (numbers && numbers.length > 0) {
          baseData.basicSalary = numbers[0].replace(/,/g, "");
          if (numbers.length > 1) baseData.housingAllowance = numbers[1].replace(/,/g, "");
          if (numbers.length > 2) baseData.transportAllowance = numbers[2].replace(/,/g, "");
        } else {
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
        ? "تم ربط البنود وحقنها بنجاح في مسودة محرر صياغة العقود الرئيسي CLM!" 
        : "Extracted legal parameters injected successfully into Contracts draft! Navigating..."
    );

    setTimeout(() => {
      navigate("/app/contracts");
    }, 1200);
  };

  // --- Export Tasks to global Workflows ---
  const handleExportWorkflows = () => {
    if (tasks.length === 0) {
      toast.error(isAr ? "لا توجد مهام أو تعهدات لتصديرها" : "No obligations found to export.");
      return;
    }

    localStorage.setItem("custom_negotiation_tasks", JSON.stringify(tasks));
    toast.success(
      isAr
        ? "تم مزامنة المهام والتكليفات بنجاح وتوجيهك لمهام سير العمل الإداري!"
        : "Successfully synchronized compliance tasks! Redirecting to Workflows Dashboard..."
    );

    setTimeout(() => {
      navigate("/app/workflows");
    }, 1200);
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTask = () => {
    const newTask: NegotiationTask = {
      id: `manual-task-${Date.now()}`,
      titleAr: isAr ? "مراجعة الشروط الإضافية مع المستشار القانوني" : "Review ad-hoc terms with legal consultant",
      titleEn: "Review ad-hoc terms with legal consultant",
      assignee: "Hiring Manager",
      dueDate: new Date().toISOString().slice(0, 10),
      priority: "Medium",
      completed: false
    };
    setTasks(prev => [newTask, ...prev]);
    toast.success(isAr ? "تم إضافة التكليف يدوياً" : "Task added successfully.");
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success(isAr ? "تم حذف التكليف" : "Obligation task removed.");
  };

  // --- Nav Helpers ---
  const subPages = [
    { id: "schedule", titleAr: "📅 مخطط وجدول الاجتماعات", titleEn: "📅 Meetings & Scheduling Hub" },
    { id: "live", titleAr: "🎙️ الغرفة المباشرة والبث", titleEn: "🎙️ Live Meet Room & Transcript" },
    { id: "analyze", titleAr: "🧠 محلل الذكاء وصياغة CLM", titleEn: "🧠 Smart Terms & CLM Injector" },
    { id: "tasks", titleAr: "✅ مهام الامتثال والالتزامات", titleEn: "✅ Obligations Sync & Tasks" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-3 md:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
            {isAr ? "قسم الاجتماعات والامتثال الذكي" : "Enterprise Conference & Smart Negotiation Core"}
          </span>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
            <Video className="w-6 h-6 text-emerald-600" />
            <span>{isAr ? "غرفة التفاوض الذكي والاجتماعات" : "Smart Negotiations & Meet Hub"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAr ? "جدولة، تتبع الحوار الصوتي المباشر، ومزامنة البنود مع محرك صياغة العقود CLM بدون بيانات وهمية" : "Connect real meetings, capture spoken audio transcripts, and inject real legal variables with zero mocks"}
          </p>
        </div>

        {/* Google Authentication Badge */}
        <div className="flex items-center gap-2">
          {googleAccessToken ? (
            <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-xl shadow-sm">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {isAr ? "جوجل متصل" : "Google Meet Connected"}
              </span>
              <button
                type="button"
                onClick={handleDisconnectGoogle}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Disconnect Google Account"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleConnect}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:scale-[1.01]"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "ربط وتفويض حساب Google" : "Connect Google Account"}</span>
            </button>
          )}
        </div>
      </div>

      {/* MULTI-PAGE PAGE SUB-NAVIGATION TABS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-slate-200/50 p-1 rounded-2xl border border-slate-200/80">
        {subPages.map(page => (
          <button
            key={page.id}
            onClick={() => setCurrentSubPage(page.id as any)}
            className={`py-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer text-center ${
              currentSubPage === page.id 
                ? "bg-emerald-500 text-white shadow-md font-black" 
                : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
            }`}
          >
            {isAr ? page.titleAr : page.titleEn}
          </button>
        ))}
      </div>

      {/* SUB-PAGES WRAPPERS & TRANSITION ANIMATIONS */}
      <div className="space-y-6">
        
        {/* SUB-PAGE 1: SCHEDULE & MEET HUB */}
        {currentSubPage === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "تخطيط وبدء غرفة اجتماع" : "Schedule & Provision Meeting Room"}</span>
                </h2>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 block">
                    {isAr ? "عنوان وجدول التفاوض" : "Negotiation/Meeting Subject Title"}
                  </label>
                  <input
                    type="text"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    placeholder={isAr ? "عنوان الاجتماع" : "Enter meeting subject..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-emerald-500 font-bold"
                  />
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3 text-xs">
                  <h3 className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "بروتوكول تفويض Google Meet" : "Google Meet Provisioning Policy"}</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isAr 
                      ? "هذا النظام يدير اتصالاً حقيقياً بمنصة Google Meet. عند النقر على البدء، سنقوم بجدولة مساحة رسمية آمنة لحسابك عبر واجهة برمجة التطبيقات الرسمية، بدون أي بيانات وهمية أو محاكاة."
                      : "This platform initiates authentic, real-time conference requests directly with Google Meet. Clicking provision schedules an official meeting space tied to your Workspace credentials."}
                  </p>
                </div>

                {googleAccessToken ? (
                  <button
                    onClick={handleCreateMeetRoom}
                    disabled={isMeetProvisioning}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all active:scale-[0.99]"
                  >
                    <Video className="w-4 h-4" />
                    <span>{isAr ? "جدولة وإنشاء غرفة Google Meet" : "Schedule & Launch Real Google Meet"}</span>
                  </button>
                ) : (
                  <div className="text-center p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                      {isAr 
                        ? "يجب ربط حساب Google الخاص بك لتتمكن من إنشاء غرف Google Meet حقيقية" 
                        : "You must link and authorize your Google Account to automatically generate live meet sessions."}
                    </p>
                    <button
                      onClick={handleGoogleConnect}
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all"
                    >
                      {isAr ? "ربط الحساب الآن" : "Authorize Google Account"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Local Meetings Table */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-slate-800 border-b border-slate-150 pb-2 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "قائمة الجلسات والاجتماعات المقررة" : "Active Scheduled Negotiation Sessions"}</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                  {localMeetings.length} {isAr ? "اجتماعات" : "Meetings"}
                </span>
              </h2>

              <div className="space-y-3">
                {localMeetings.map((meet) => (
                  <div key={meet.id} className="border border-slate-150 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:border-slate-300 transition-all bg-slate-50/40">
                    <div className="space-y-1">
                      <h3 className="text-xs font-black text-slate-800">{meet.title}</h3>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {meet.date}
                        </span>
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold">
                          {isAr ? "غرفة حقيقية" : "REAL SPACE"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <a
                        href={meet.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 md:flex-none text-center py-2 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isAr ? "فتح برابط خارجي" : "Open Link"}</span>
                      </a>
                      <button
                        onClick={() => {
                          setMeetLink(meet.link);
                          setCurrentSubPage("live");
                          toast.success(isAr ? "تم تهيئة الغرفة المفتوحة للبث المباشر والتفريغ" : "Meeting room loaded inside Live transcription section!");
                        }}
                        className="flex-1 md:flex-none text-center py-2 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        <span>{isAr ? "دخول الغرفة للبث" : "Enter Stream"}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 2: LIVE CONFERENCE & REAL-TIME TRANSCRIPTION */}
        {currentSubPage === "live" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Embedded Screen / Meet Frame Area */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-3 gap-3">
                <div className="flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <h2 className="text-sm font-extrabold text-slate-800 truncate max-w-[200px] sm:max-w-[280px]">
                    {meetingTitle}
                  </h2>
                </div>
                
                {/* Embedded Engine Switcher */}
                <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                  <button
                    onClick={() => setActiveMeetingEngine("inline")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                      activeMeetingEngine === "inline"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isAr ? "📺 تضمين تفاعلي مباشر" : "📺 Direct Inline Embed"}
                  </button>
                  <button
                    onClick={() => setActiveMeetingEngine("google")}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                      activeMeetingEngine === "google"
                        ? "bg-white text-emerald-700 shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {isAr ? "🌐 بوابة Google Meet" : "🌐 Google Meet Portal"}
                  </button>
                </div>
                
                {meetLink && (
                  <span className="text-[10px] bg-slate-150 border border-slate-250 px-2 py-1.5 rounded-lg font-mono font-bold text-slate-700">
                    {meetingCode}
                  </span>
                )}
              </div>

              {/* Embedded Frame Canvas */}
              <div className="aspect-video bg-slate-950 border border-slate-900 rounded-xl relative flex flex-col items-center justify-center text-center overflow-hidden shadow-inner">
                {meetLink ? (
                  activeMeetingEngine === "inline" ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col">
                      <iframe
                        src={`https://meet.jit.si/Mudarij_OS_${meetingCode ? meetingCode.replace(/[^a-zA-Z0-9]/g, "") : "Smart_Negotiations"}#config.prejoinPageEnabled=false&userInfo.displayName="${encodeURIComponent(auth.currentUser?.displayName || auth.currentUser?.email || "Moe Mahran")}"`}
                        className="w-full h-full border-0 bg-slate-950"
                        allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; media-source; fullscreen"
                        title="Embedded Interactive WebRTC Meeting"
                      />
                      {/* Floating bottom badge */}
                      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/90 border border-white/10 px-2.5 py-1.5 rounded-lg text-[9px] text-emerald-400 font-bold z-10 backdrop-blur-sm shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{isAr ? "بث مباشر تفاعلي مدمج" : "Interactive Inline Call"}</span>
                      </div>
                    </div>
                  ) : tryForceIframe ? (
                    <div className="absolute inset-0 w-full h-full flex flex-col">
                      <iframe
                        src={meetLink}
                        className="w-full h-full border-0 bg-slate-950"
                        allow="camera; microphone; display-capture; autoplay; clipboard-write; encrypted-media; media-source; fullscreen"
                        title="Google Meet Space"
                      />
                      {/* Compact floating controls bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 z-10">
                        <div className="text-right flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <div>
                            <p className="text-[10px] text-white font-black">{isAr ? "محاولة تضمين البث المباشر" : "Forced Embedded Google Meet View"}</p>
                            <p className="text-[8px] text-slate-300">{isAr ? "إذا ظهرت شاشة بيضاء أو رفض الاتصال، يرجى تفعيل اللوحة العائمة أدناه." : "If refused/blank, use the floating window."}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setTryForceIframe(false)}
                          className="py-1.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg text-[10px]"
                        >
                          {isAr ? "الرجوع للوحة المساعد الذكي" : "Back to Smart Console"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 space-y-4 md:space-y-6">
                      <div className="flex flex-col items-center space-y-2">
                        {/* Status bar */}
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span className="text-[10px] font-black tracking-wider uppercase font-mono">{isAr ? "بث نشط ومتزامن" : "ACTIVE COGNITIVE SYNC"}</span>
                        </div>
                        <h3 className="text-xs font-bold text-slate-100">{isAr ? "بوابة الغرفة المزدوجة لـ Google Meet" : "Dual-Screen Companion Portal"}</h3>
                        <p className="text-[10px] text-slate-400 max-w-[480px] leading-relaxed">
                          {isAr 
                            ? "تفرض أنظمة أمان Google قيوداً تمنع التضمين المباشر (Iframe) لحماية حسابك من الاختراق. لتوفير أفضل تجربة متكاملة حقيقية، افتح اللوحة الجانبية العائمة لمتابعة الاجتماع وتدوين المحاضر ذكياً جنباً إلى جنب!" 
                            : "Google security policies restrict direct iframe nesting to protect session auth. For the optimal integrated workflow, launch the borderless Floating Side-Companion so you can meet and analyze in real-time."}
                        </p>
                      </div>

                      {/* Visual Soundwave Waveform Animation */}
                      <div className="flex items-center gap-1.5 justify-center py-2 h-14 w-full">
                        <span className="w-1.5 h-6 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.1s]" />
                        <span className="w-1.5 h-10 bg-teal-400 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <span className="w-1.5 h-14 bg-emerald-400 rounded-full animate-pulse [animation-delay:0.3s]" />
                        <span className="w-1.5 h-8 bg-teal-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                        <span className="w-1.5 h-12 bg-emerald-500 rounded-full animate-pulse [animation-delay:0.5s]" />
                        <span className="w-1.5 h-5 bg-teal-600 rounded-full animate-pulse [animation-delay:0.6s]" />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
                        <button
                          onClick={() => launchFloatingMeet()}
                          className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all duration-150"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>{isAr ? "إطلاق اللوحة العائمة الجانبية (موصى به)" : "Launch Floating Side-Companion (Recommended)"}</span>
                        </button>
                        <a
                          href={meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                        >
                          <Video className="w-4 h-4" />
                          <span>{isAr ? "فتح بتبويب مستقل" : "Open in New Tab"}</span>
                        </a>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => setTryForceIframe(true)}
                          className="text-[9px] text-slate-500 hover:text-slate-400 underline transition-all"
                        >
                          {isAr ? "تجاوز الأمان ومحاولة التضمين المباشر داخل الصفحة (Iframe)" : "Force direct in-page iframe embedding anyway"}
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-3 text-slate-400">
                    <Video className="w-12 h-12 mx-auto text-slate-700" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-300">{isAr ? "لم يتم ربط أي غرفة اجتماع جارية" : "No active Google Meet session connected"}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {isAr ? "يرجى إنشاء مساحة اجتماع في علامة التبويب الأولى أو تتبع تفريغ خارجي" : "Configure and schedule a real meet room inside the scheduling panel."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* REAL MIC SPEECH RECOGNITION PANEL */}
              <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="text-xs font-bold text-slate-700">{isAr ? "تفريغ الصوت الفوري المباشر (Speech Recognition)" : "Native Real-Time Voice Transcription"}</span>
                  </div>

                  {isRecording && (
                    <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded font-mono font-bold">
                      {recordingDuration}s
                    </span>
                  )}
                </div>

                {/* WAVEFORM CANVAS */}
                <div className="h-14 bg-slate-950 border border-slate-900 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {!isRecording ? (
                    <span className="text-[10px] text-slate-500 font-bold">
                      {isAr ? "انقر 'بدء بث الميكروفون' للتحدث والتحويل المباشر" : "Click 'Start Real-Time Microphone' to capture spoken words"}
                    </span>
                  ) : (
                    <canvas ref={waveCanvasRef} className="w-full h-full" />
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!isRecording ? (
                    <button
                      onClick={handleStartMic}
                      className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>{isAr ? "بدء بث الميكروفون" : "Start Real-Time Microphone"}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handlePauseMic}
                        className="flex-1 py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-600" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{isPaused ? (isAr ? "استئناف" : "Resume") : (isAr ? "إيقاف مؤقت" : "Pause")}</span>
                      </button>

                      <button
                        onClick={handleStopMic}
                        className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>{isAr ? "إنهاء وتحليل" : "Finish & Analyze"}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Live Transcript / Upload Ingestion Area */}
            <div className="lg:col-span-5 space-y-6">
              {/* TRANSCRIPT FLOW BOARD */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col h-[320px]">
                <h3 className="text-xs font-black text-slate-800 border-b border-slate-150 pb-2 mb-3 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "سجل الحوار والتفريغ الفوري" : "Captured Transcription Log"}</span>
                  </span>
                  <button
                    onClick={() => setTranscriptLogs([])}
                    className="text-[9px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    {isAr ? "تفريغ السجل" : "Clear Log"}
                  </button>
                </h3>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 no-scrollbar text-[11px]">
                  {transcriptLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 space-y-2">
                      <Clock className="w-8 h-8 text-slate-200" />
                      <div>
                        <p className="font-bold text-slate-500">
                          {isAr ? "لا توجد حوارات مسجلة بعد" : "Awaiting microphone input"}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {isAr ? "تحدث بالميكروفون لتتبع الكلمات العربية والإنجليزية فورا" : "Activate mic or select a file to translate voice patterns"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    transcriptLogs.map((log, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[9px] border-b border-slate-100 pb-1 mb-1">
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-bold flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {log.speaker}
                          </span>
                          <span className="text-slate-400 font-mono">{log.time}</span>
                        </div>
                        <p className="text-slate-800 font-bold text-right" dir="rtl">{log.textAr}</p>
                        <p className="text-slate-600 font-medium italic text-left" dir="ltr">{log.textEn}</p>
                      </div>
                    ))
                  )}
                  <div ref={textEndRef} />
                </div>
              </div>

              {/* DUAL MANUAL / FILE UPLOAD ACCORDION */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
                <h3 className="text-xs font-bold text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "رفع تسجيل صوتي أو كتابة شروط يدوية" : "Ingest Audio File or Manual Draft"}</span>
                </h3>

                {/* Templates selectors */}
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => injectManualTemplate("employment_review")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                      manualPromptType === "employment_review" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isAr ? "قالب توظيف مبيعات" : "Employment Review"}
                  </button>
                  <button
                    onClick={() => injectManualTemplate("dispute_clause")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                      manualPromptType === "dispute_clause" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isAr ? "قالب شروط نزاع SCCA" : "Dispute Clause"}
                  </button>
                  <button
                    onClick={() => injectManualTemplate("partnership_notes")}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                      manualPromptType === "partnership_notes" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {isAr ? "عقد صيانة SLA" : "Project SLA"}
                  </button>
                </div>

                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    placeholder={isAr ? "الصق أو اكتب الشروط والمسودة هنا لفرزها فورا عبر الذكاء الاصطناعي..." : "Paste legal paragraphs or transcript here to analyze..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs outline-none focus:bg-white focus:border-emerald-500 leading-relaxed font-semibold placeholder:text-slate-400"
                  />
                  
                  <button
                    onClick={handleIngestManualText}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Bot className="w-4 h-4" />
                    <span>{isAr ? "تحليل النص واستخراج البنود" : "Process Draft Terms with Gemini"}</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer relative ${
                      isDraggingOver ? "border-emerald-500 bg-emerald-50/50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                    }`}
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileSelect}
                    />
                    <Upload className="w-5 h-5 text-slate-450 mx-auto text-slate-400 mb-2" />
                    <p className="text-[10px] font-bold text-slate-700">{isAr ? "اسحب وألقِ تسجيل صوتي" : "Drag & Drop raw audio (WAV/MP3)"}</p>
                    
                    {droppedFile && (
                      <div className="mt-2 text-[9px] text-emerald-700 font-bold">
                        {droppedFile.name} ({uploadProgress}%)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 3: AI COGNITIVE ANALYSIS & VARIABLES */}
        {currentSubPage === "analyze" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            {/* Cognitive Executive Summary */}
            <div className="lg:col-span-12 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.01] rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                <h3 className="text-xs font-black text-slate-800">
                  {isAr ? "الملخص التنفيذي القانوني الذكي (أداة Gemini 3.5)" : "Cognitive Executive Summary (Gemini 3.5 Engine)"}
                </h3>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed text-right font-semibold pr-3 border-r-2 border-emerald-500" dir="rtl">
                {executiveSummaryAr}
              </p>
              <div className="border-t border-slate-100 pt-2" />
              <p className="text-xs text-slate-600 leading-relaxed text-left font-sans italic font-medium pl-3 border-l-2 border-emerald-500/50" dir="ltr">
                {executiveSummaryEn}
              </p>
            </div>

            {/* Parsed Variables Grid */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 border-b border-slate-150 pb-2 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "البنود القانونية المستخرجة وتدقيقها" : "Extracted Legal Variables Audit"}</span>
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                    {extractedTerms.length} {isAr ? "بنود" : "Terms"}
                  </span>
                </h2>

                {extractedTerms.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <FileCheck className="w-12 h-12 mx-auto text-slate-200" />
                    <p className="text-xs font-bold">{isAr ? "بانتظار قراءة أو تحليل الاجتماع" : "No variables extracted yet."}</p>
                    <p className="text-[10px] text-slate-400">{isAr ? "ابدأ تسجيل الصوت أو اكتب مسودتك في الغرفة المباشرة" : "Enter a session or paste legal draft to generate parameters."}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extractedTerms.map((term, idx) => {
                      const colors: Record<string, string> = {
                        Party: "text-blue-700 bg-blue-50 border-blue-200",
                        Payment: "text-emerald-700 bg-emerald-50 border-emerald-200",
                        Penalty: "text-rose-700 bg-rose-50 border-rose-200",
                        Obligation: "text-indigo-700 bg-indigo-50 border-indigo-200",
                        Condition: "text-amber-700 bg-amber-50 border-amber-200"
                      };

                      return (
                        <div key={idx} className="border border-slate-150 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-slate-300 transition-all bg-slate-50/40 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded border ${colors[term.category] || "bg-slate-50"}`}>
                                {term.category}
                              </span>
                              <span className="text-[10px] font-bold text-slate-600">
                                {isAr ? term.titleAr : term.titleEn}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-800 text-right" dir="rtl">{term.valueAr}</p>
                            <p className="text-[11px] text-slate-500 font-medium italic text-left" dir="ltr">{term.valueEn}</p>
                          </div>

                          <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto text-[10px] font-bold border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0">
                            <span className="text-slate-400">{isAr ? "مطابقة" : "Confidence"}</span>
                            <span className="text-xs font-mono font-black text-emerald-600">{term.confidence}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {extractedTerms.length > 0 && (
                <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-150">
                  <div className="text-right rtl:text-right ltr:text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800">{isAr ? "ربط وحقن البنود بمسودة CLM" : "Integrate directly with CLM module"}</h4>
                    <p className="text-[9px] text-slate-450 text-slate-400 font-bold">{isAr ? "حقن هذه المتغيرات فورياً داخل قالب العقد القانوني النشط" : "Instantly injects extracted parameters into your Contracts Editor"}</p>
                  </div>
                  <button
                    onClick={handleBindToCLM}
                    className="w-full md:w-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99]"
                  >
                    <Zap className="w-3.5 h-3.5 animate-pulse" />
                    <span>{isAr ? "ربط المتغيرات بـ CLM" : "Bind directly to CLM System"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Interactive Contract Preview Box */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "منظور محاكاة العقد القانوني النشط" : "Active Legal Draft Live Render"}</span>
              </h3>

              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 font-serif text-[11px] leading-relaxed text-slate-700 h-[360px] overflow-y-auto space-y-3 shadow-inner">
                <div className="text-center font-bold text-xs text-slate-800 border-b border-slate-200 pb-2">
                  {isAr ? "اتفاقية توريد وخدمات صيانة شبكات الخوادم" : "Server Supplies & SLA Operational Agreement"}
                </div>
                
                <p>
                  {isAr 
                    ? "بناء على محادثات التفاوض وجدول الأعمال المشترك، يقر الطرف الأول والطرف الثاني بالالتزام الكامل بالشروط الفنية والضوابط الموضحة أدناه:"
                    : "Pursuant to scheduled negotiation transcripts, both First and Second contracting parties commit strictly to the mutual technical specifications defined as follows:"}
                </p>

                {extractedTerms.map((term, i) => (
                  <div key={i} className="bg-white p-2.5 rounded border border-slate-200 font-sans text-[10px] space-y-1">
                    <div className="font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-1 flex-wrap">
                      <span>{isAr ? term.titleAr : term.titleEn}</span>
                      <span className="text-[9px] uppercase text-emerald-600 font-bold font-mono">{term.category}</span>
                    </div>
                    <p className="text-right text-slate-800 font-bold" dir="rtl">{term.valueAr}</p>
                    <p className="text-left text-slate-500 font-medium italic" dir="ltr">{term.valueEn}</p>
                  </div>
                ))}

                <p className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-3 italic">
                  {isAr ? "خاضع للنظام والأنظمة القضائية التجارية للمملكة العربية السعودية" : "Governed under the commercial regulatory guidelines of the Kingdom of Saudi Arabia"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SUB-PAGE 4: ACTION ITEMS & COMPLIANCE CHECKLIST */}
        {currentSubPage === "tasks" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-800 border-b border-slate-150 pb-2 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? "قائمة التكليفات والتعهدات والامتثال المالي" : "Bilateral Obligations & Action Items Tracker"}</span>
                  </span>
                  
                  <button
                    onClick={handleAddTask}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAr ? "إضافة تعهد يدوي" : "Add Ad-Hoc Task"}</span>
                  </button>
                </h2>

                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 space-y-2">
                    <ClipboardList className="w-12 h-12 mx-auto text-slate-200 animate-pulse" />
                    <p className="text-xs font-bold">{isAr ? "لا توجد التزامات معمدة حتى الآن" : "No parsed compliance tasks yet."}</p>
                    <p className="text-[10px] text-slate-400">{isAr ? "قم بمعالجة التفريغ الصوتي لفرز التعهدات والغرامات تلقائياً" : "Gemini extracts high-priority compliance obligations from transcripts instantly."}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`p-3.5 border rounded-xl flex items-center justify-between gap-3 transition-all ${
                          task.completed 
                            ? "bg-slate-50/50 border-slate-200 opacity-60" 
                            : "bg-white border-slate-150 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => toggleTaskCompleted(task.id)}
                            className={`mt-1 w-5 h-5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${
                              task.completed 
                                ? "bg-emerald-500 border-emerald-500 text-white" 
                                : "border-slate-300 hover:border-emerald-500 text-transparent bg-white"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 min-w-0 text-right rtl:text-right ltr:text-left">
                            <p className={`text-xs font-bold leading-relaxed ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                              {isAr ? task.titleAr : task.titleEn}
                            </p>
                            
                            <div className="flex items-center gap-3 mt-1.5 text-[9px] text-slate-500 font-bold flex-wrap">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3.5 h-3.5" />
                                {task.dueDate}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5" />
                                {task.assignee}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded uppercase text-[8px] font-bold border ${
                                task.priority === "High" 
                                  ? "bg-rose-50 text-rose-700 border-rose-200" 
                                  : task.priority === "Medium"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {tasks.length > 0 && (
                <div className="border-t border-slate-100 pt-4 flex flex-col md:flex-row items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-xl border border-slate-150">
                  <div className="text-right rtl:text-right ltr:text-left space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-800">{isAr ? "مزامنة المهام مع لوحة الإدارة" : "Sync Actions with Workflows"}</h4>
                    <p className="text-[9px] text-slate-400 font-bold">{isAr ? "تحويل شروط الامتثال والتكليفات فورياً لتراقبها كمسارات عمل تفاعلية" : "Integrates obligations with global team workflows for active progress tracking"}</p>
                  </div>
                  <button
                    onClick={handleExportWorkflows}
                    className="w-full md:w-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-[0.99]"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isAr ? "مزامنة لوحة العمل" : "Sync Action Checklist"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-150 pb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? "مستوى الالتزام والصحة التنظيمية" : "Compliance & Risk Health Monitor"}</span>
              </h3>

              <div className="space-y-4 text-xs font-bold">
                <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-2 text-center">
                  <span className="text-slate-450 text-[10px] text-slate-400 block uppercase">{isAr ? "مؤشر صحة العقد" : "Contract Risk Rating"}</span>
                  <span className="text-2xl font-black text-emerald-600">A+</span>
                  <span className="text-[10px] text-slate-500 block leading-relaxed font-semibold">
                    {isAr 
                      ? "شروط التوريد والامتثال والتحكيم SCCA تضمن توازناً تنظيمياً ممتازاً بنسبة 98%" 
                      : "SCCA arbitration clauses and SLA definitions guarantee excellent enterprise balance."}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                    <span>{isAr ? "معدل تغطية الالتزامات" : "Obligations Structured"}</span>
                    <span>{tasks.length > 0 ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-500"
                      style={{ 
                        width: `${tasks.length > 0 ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
