import React, { useState, useEffect, useRef } from "react";
import {
  Blocks,
  Search,
  Plus,
  Play,
  Cpu,
  Lock,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  ArrowRight,
  ArrowLeft,
  BellRing,
  Settings2,
  Smartphone,
  AlertTriangle,
  GitPullRequest,
  Workflow,
  Database,
  Save,
  Send,
  X,
  ShieldAlert,
  FileText,
  Mail,
  Download,
  Printer,
  RefreshCw,
  Sparkles,
  Building2,
  UserCheck,
  HelpCircle,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import CustomAutomationLab from "../components/CustomAutomationLab";

interface WorkflowStep {
  id: number;
  key: string;
  title: string;
  desc: string;
  icon: any;
  status: "not_started" | "running" | "completed" | "warning" | "error";
  statusText: string;
}

export default function Workflows() {
  const [activeTab, setActiveTab] = useState<"vat" | "audit" | "negotiation" | "custom">("vat");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [stepPayload, setStepPayload] = useState<any>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([
    "نظام مدارج الأتمتة الذكي جاهز لبدء المهام الروتينية.",
    "يرجى تحديد مسار للتشغيل التدريجي.",
  ]);

  const [negotiationSteps, setNegotiationSteps] = useState<WorkflowStep[]>([]);

  // Custom interactive AI Advisory sidebar state
  const [isAiOpen, setIsAiOpen] = useState<boolean>(true);
  const [aiQuery, setAiQuery] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "أهلاً بك في **مستشار الضرائب والامتثال الذكي** التابع لمدارج. بصفتي SOCPA معتمد ومستشار ZATCA الرقمي الخاص بك، يمكنني تحليل كل قيود الحسابات والفواتير الحالية والإجابة الفورية عن أسئلتك المعقدة.\n\nجرّب النقر على أحد الأسئلة المقترحة بالأسفل لبدء فحص مالي فوري!",
    },
  ]);

  // VAT automated steps definition
  const [vatSteps, setVatSteps] = useState<WorkflowStep[]>([
    {
      id: 1,
      key: "receive",
      title: "استقبال المعاملات اليومية",
      desc: "استيراد الفواتير من أنظمة المبيعات ودفاتر الأستاذ لشركة مدارج",
      icon: Blocks,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 2,
      key: "validate",
      title: "تدقيق ومطابقة الفواتير",
      desc: "مطابقة العمليات الحسابية وصحة فحص ضريبة المدخلات والمخرجات (15%)",
      icon: FileText,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 3,
      key: "zatca",
      title: "فحص متطلبات هيئة ZATCA",
      desc: "التحقق من الأرقام الضريبية (15 خانة) ورموز الاستجابة السريعة والقوانين المنظمة للربط",
      icon: ShieldAlert,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 4,
      key: "prepare",
      title: "تجهيز مسودة إقرار (Form 50)",
      desc: "احتساب المخرجات والمشتريات وتوزيع البنود الضريبية آلياً",
      icon: GitPullRequest,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 5,
      key: "approve",
      title: "اعتماد الشريك المعتمد (SOCPA)",
      desc: "إشعار الشريك لمراجعة المسودة وتعديلها رقمياً بنظام الموافقات",
      icon: UserCheck,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 6,
      key: "submit",
      title: "إرسال الإقرار إلى الهيئة",
      desc: "محاكاة تقديم البيانات عبر واجهة ربط الهيئة العامة للزكاة والضريبة والجمارك",
      icon: Send,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 7,
      key: "archive",
      title: "الأرشفة والأمان الرقمي",
      desc: "مزامنة الإقرار المعتمد وتشفير المستند النهائي ومنع التعديل مستقبلياً",
      icon: Lock,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
  ]);

  // Audit automated steps definition
  const [auditSteps, setAuditSteps] = useState<WorkflowStep[]>([
    {
      id: 1,
      key: "upload",
      title: "رفع الكشوفات البنكية للمطابقة",
      desc: "استيراد الحركات المالية البنكية ومطابقتها بمسيرات النقد الداخلي",
      icon: Database,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 2,
      key: "ai_categorize",
      title: "التصنيف التلقائي الذكي (AI)",
      desc: "تحليل القيود البنكية وفرز المصروفات والأرباح بالاعتماد على الفرز المالي المتطور",
      icon: Cpu,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 3,
      key: "missing_docs",
      title: "كشف المستندات المفقودة",
      desc: "رصد المعاملات والمدفوعات البنكية التي تفتقر لفاتورة ضريبية رسمية مبسطة",
      icon: AlertTriangle,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 4,
      key: "accountant_review",
      title: "التسويات المحاسبية والمراجعة",
      desc: "تطبيق تسويات التدقيق والتحقق اليدوي للشريك المحاسبي لاعتبارات الوعاء الزكوي",
      icon: Settings2,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
    {
      id: 5,
      key: "audit_pack",
      title: "تجهيز حزمة التدقيق والمصادقة",
      desc: "توليد الرأي المحاسبي النهائي والتقرير التشغيلي مع استخلاص الرسوم البيانية والأهداف",
      icon: Zap,
      status: "not_started",
      statusText: "بانتظار البدء",
    },
  ]);

  // Current active workflow steps helper
  const currentSteps =
    activeTab === "vat" ? vatSteps : activeTab === "audit" ? auditSteps : negotiationSteps;
  const updateSteps =
    activeTab === "vat" ? setVatSteps : activeTab === "audit" ? setAuditSteps : setNegotiationSteps;

  // Load custom negotiation tasks if available
  useEffect(() => {
    try {
      const savedTasks = localStorage.getItem("custom_negotiation_tasks");
      if (savedTasks) {
        const parsed = JSON.parse(savedTasks);
        if (parsed && parsed.length > 0) {
          const formattedSteps = parsed.map((task: any, index: number) => ({
            id: index + 1,
            key: task.id || `neg-${index}`,
            title: task.titleAr || task.titleEn,
            desc: `${task.assignee || "المستشار القانوني"} - الاستحقاق: ${task.dueDate || "-"}`,
            icon: Cpu,
            status: task.completed ? "completed" : "not_started",
            statusText: task.completed ? "مكتمل" : "بانتظار البدء",
          }));
          setNegotiationSteps(formattedSteps);
          setActiveTab("negotiation");
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Sync index on tab change
  useEffect(() => {
    setCurrentStepIndex(0);
    setStepPayload(null);
    let tabLabel = "إعداد الإقرارات الضريبية (VAT)";
    if (activeTab === "audit") tabLabel = "تدقيق ومطابقة الدورة المستندية (Audit)";
    if (activeTab === "negotiation") tabLabel = "تدقيق ومطابقة شروط المفاوضات (Smart Negotiations)";
    if (activeTab === "custom") tabLabel = "لوحة أتمتة مسارات n8n المخصصة (Custom Builder)";
    setLogs([`تم التغيير إلى مسار: ${tabLabel}`, "بانتظار الضغط على تشغيل الخطوة الأولى للبدء."]);
  }, [activeTab]);

  // Function to execute a step from the backend
  const handleExecuteStep = async (stepIdx: number) => {
    if (isRunning) return;
    setIsRunning(true);

    // Mark step as running
    const targetStep = currentSteps[stepIdx];
    const newSteps = [...currentSteps];
    newSteps[stepIdx] = {
      ...targetStep,
      status: "running",
      statusText: "جاري المعالجة الرقمية...",
    };
    updateSteps(newSteps);

    // Push execution logs
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] بدء تنفيذ: ${targetStep.title}...`,
      ...prev,
    ]);

    try {
      if (activeTab === "negotiation") {
        // Run simulated pass for negotiated legal tasks
        await new Promise((resolve) => setTimeout(resolve, 800));

        const isSuccess = Math.random() > 0.15;
        const finalStatus = isSuccess ? "completed" : "warning";

        setStepPayload({
          success: true,
          status: finalStatus,
          message: isSuccess
            ? `تم بنجاح ربط وصيرورة التكليف القانوني: "${targetStep.title}" عبر مسار الأتمتة التفاعلي وتأمينه بنشاط مالي وقانوني معتمد KSA.`
            : `الوعاء التشغيلي رصد تنبيهاً بسيطاً بخصوص: "${targetStep.title}". يرجى التحقق من توفر صورة المستندات الموقعة لاحقاً.`,
          findings: isSuccess
            ? undefined
            : ["الالتزام المالي يحتاج لربط مباشر بالفاتورة الإلكترونية الموحدة ZATCA."],
        });

        const updatedSteps = [...newSteps];
        updatedSteps[stepIdx] = {
          ...targetStep,
          status: finalStatus,
          statusText: finalStatus === "completed" ? "اكتمل بنجاح" : "انتهى مع وجود ملاحظات",
        };
        updateSteps(updatedSteps);

        setLogs((prev) => [
          `[${new Date().toLocaleTimeString("ar-SA")}] اكتمل بنجاح: ${targetStep.title}`,
          ...prev,
        ]);

        if (stepIdx < currentSteps.length - 1) {
          setCurrentStepIndex(stepIdx + 1);
        } else {
          setCurrentStepIndex(stepIdx);
        }
      } else {
        const idToken = await updateFirebaseToken();
        const response = await fetch("/api/workflows/run-step", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: idToken ? `Bearer ${idToken}` : "",
          },
          body: JSON.stringify({
            workflowId: activeTab,
            stepId: stepIdx,
          }),
        });

        if (!response.ok) {
          throw new Error("فشل معالجة خطوة مسار العمل من الخادم");
        }

        const resData = await response.json();
        setStepPayload(resData);

        // Determine step status based on return
        let finalStatus: "completed" | "warning" | "error" = "completed";
        if (resData.status === "warning") finalStatus = "warning";
        if (resData.status === "error") finalStatus = "error";

        const updatedSteps = [...newSteps];
        updatedSteps[stepIdx] = {
          ...targetStep,
          status: finalStatus,
          statusText:
            finalStatus === "completed"
              ? "اكتمل بنجاح"
              : finalStatus === "warning"
                ? "انتهى مع وجود ملاحظات"
                : "رصدت تنبيهات امتثال حرجة!",
        };
        updateSteps(updatedSteps);

        setLogs((prev) => [
          `[${new Date().toLocaleTimeString("ar-SA")}] اكتمل بنجاح: ${resData.message || targetStep.title}`,
          ...prev,
        ]);

        // Focus results automatically
        if (stepIdx < currentSteps.length - 1) {
          setCurrentStepIndex(stepIdx + 1);
        } else {
          setCurrentStepIndex(stepIdx);
        }
      }
    } catch (err: any) {
      console.error(err);
      const updatedSteps = [...newSteps];
      updatedSteps[stepIdx] = { ...targetStep, status: "error", statusText: "فشل التشغيل!" };
      updateSteps(updatedSteps);

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString("ar-SA")}] ❌ خطأ في خطوة ${targetStep.title}: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  // Run whole pipeline at once helper
  const runEntirePipeline = async () => {
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ⚡ تم وضع المسار بالكامل تحت وضع الأتمتة الفائقة والمحاكاة المنظمة.`,
      ...prev,
    ]);
    for (let i = 0; i < currentSteps.length; i++) {
      await handleExecuteStep(i);
      // Wait slightly between steps for nice visual effect
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  };

  // Reset steps
  const resetPipeline = () => {
    const freshSteps = currentSteps.map((s) => ({
      ...s,
      status: "not_started" as const,
      statusText: "بانتظار البدء",
    }));
    updateSteps(freshSteps);
    setCurrentStepIndex(0);
    setStepPayload(null);
    setLogs([
      "تم إعادة تصفير مسار العمل وحالات التنفيذ بنجاح.",
      "بانتظار تشغيل الدورة لتحديد الأخطاء والامتثال.",
    ]);
  };

  // Helper to dynamically obtain firebase ID Token
  const updateFirebaseToken = async () => {
    try {
      // Lazy fetch user token if authenticated
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("firebaseToken") || "";
        return stored;
      }
    } catch {
      return "";
    }
    return "";
  };

  // Run preset Advisor Question
  const handleAskAdvisor = async (questionText: string) => {
    if (isAiLoading) return;
    setAiQuery(questionText);
    setIsAiLoading(true);

    // Append to conversation list
    setChatHistory((prev) => [...prev, { sender: "user", text: questionText }]);

    try {
      const idToken = await updateFirebaseToken();
      const response = await fetch("/api/workflows/ai-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken ? `Bearer ${idToken}` : "",
        },
        body: JSON.stringify({ question: questionText }),
      });

      if (!response.ok) {
        throw new Error("فشل المساعد الذكي بالرد");
      }

      const data = await response.json();
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: data.answer || "عذراً، لم أتمكن من العثور على رد كافٍ في الوقت الحالي.",
        },
      ]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        {
          sender: "ai",
          text: `❌ فشل الاتصال بالمساعد الذكي: ${err.message}. الرجاء فحص إعدادات مفتاح Gemini الخاص بك.`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
      setAiQuery("");
    }
  };

  // Custom JSX Renderer for simplified bold / list markdown parsed output in Advisor Response
  const renderFormattedText = (txt: string) => {
    return txt.split("\n").map((line, idx) => {
      let content = line;
      let isHeader = false;
      let isList = false;

      if (content.startsWith("### ")) {
        content = content.replace("### ", "");
        isHeader = true;
      } else if (content.startsWith("## ")) {
        content = content.replace("## ", "");
        isHeader = true;
      } else if (content.startsWith("* ") || content.startsWith("- ")) {
        content = content.replace(/^[*|-]\s+/, "");
        isList = true;
      }

      // Regex replace bold markers **word** to <strong>word</strong>
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIdx = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIdx) {
          parts.push(content.substring(lastIdx, match.index));
        }
        parts.push(
          <strong
            key={match.index}
            className="text-zinc-900 font-extrabold bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/50"
          >
            {match[1]}
          </strong>
        );
        lastIdx = boldRegex.lastIndex;
      }

      if (lastIdx < content.length) {
        parts.push(content.substring(lastIdx));
      }

      const finalLine = parts.length > 0 ? parts : content;

      if (isHeader) {
        return (
          <h4
            key={idx}
            className="text-sm font-black text-zinc-900 mt-4 mb-2 border-b border-zinc-100 pb-1"
          >
            {finalLine}
          </h4>
        );
      }
      if (isList) {
        return (
          <li
            key={idx}
            className="list-disc list-inside text-xs font-semibold text-zinc-700 mr-2 my-1 leading-relaxed"
          >
            {finalLine}
          </li>
        );
      }
      return (
        <p key={idx} className="text-xs font-medium text-zinc-600 my-1 leading-relaxed">
          {finalLine || <br />}
        </p>
      );
    });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Upper Navigation and Description Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 bg-zinc-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-2xl border border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-800/20 to-zinc-950/80 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" /> نظام المكننة الاستشاري السعودي (SOCPA Engine)
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <Workflow className="w-8 h-8 text-indigo-400" />
            محرك الأتمتة المالي الذكي للشركات المحاسبية
          </h1>
          <p className="text-zinc-300 max-w-2xl text-sm font-semibold">
            أتمت معالجة فحص ضريبة القيمة المضافة ومطابقة الأرصدة البنكية آلياً وفقاً لقواعد امتثال{" "}
            <strong className="text-indigo-300">هيئة الزكاة والضريبة والجمارك (ZATCA)</strong>{" "}
            وإرشادات المراجعة المعتمدة للشركات السعودية.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2.5">
          <button
            onClick={runEntirePipeline}
            disabled={isRunning}
            className="bg-indigo-600 text-white px-5 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-500 disabled:opacity-50 transition-all text-sm shadow-lg shadow-indigo-600/30"
          >
            <Play className="w-4 h-4 fill-current" /> تشغيل المسار آلياً بالكامل
          </button>
          <button
            onClick={resetPipeline}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all text-sm border border-zinc-700"
          >
            <RefreshCw className="w-4 h-4" /> تصفير الخطوات
          </button>
        </div>
      </div>

      {/* Main Container Layout: 3 Columns: Pipeline (Left), Step Results Visualization (Middle/Big), AI Advisor Panel (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Right Section: Interactive Sidebar Navigation (RTL: Left visually, Right structurally) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Engine Selector */}
          <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm space-y-2">
            <label className="text-xs font-black text-zinc-400 block uppercase tracking-wider mb-2">
              اختر محرك الأتمتة المالي
            </label>
            <button
              onClick={() => setActiveTab("vat")}
              className={`w-full text-right p-4 rounded-2xl transition-all border flex items-center gap-3 ${activeTab === "vat" ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm" : "bg-white hover:bg-zinc-50 border-zinc-100 text-zinc-600"}`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${activeTab === "vat" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"}`}
              >
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-bold text-zinc-400">VAT Automation Flow</span>
                <span className="font-extrabold text-sm block">1. مسار ضريبة القيمة المضافة</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("audit")}
              className={`w-full text-right p-4 rounded-2xl transition-all border flex items-center gap-3 ${activeTab === "audit" ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-sm" : "bg-white hover:bg-zinc-50 border-zinc-100 text-zinc-600"}`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${activeTab === "audit" ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-500"}`}
              >
                <Database className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-bold text-zinc-400">Audit Compliance Flow</span>
                <span className="font-extrabold text-sm block">
                  2. مسار تدقيق المستندات والقوائم
                </span>
              </div>
            </button>

            {negotiationSteps.length > 0 && (
              <button
                onClick={() => setActiveTab("negotiation")}
                className={`w-full text-right p-4 rounded-2xl transition-all border flex items-center gap-3 ${activeTab === "negotiation" ? "bg-emerald-50 border-emerald-200 text-emerald-950 shadow-sm animate-pulse" : "bg-white hover:bg-zinc-50 border-zinc-100 text-zinc-600"}`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${activeTab === "negotiation" ? "bg-emerald-600 text-white" : "bg-zinc-100 text-zinc-500"}`}
                >
                  <Workflow className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-bold text-zinc-400">
                    Negotiation Compliance Flow
                  </span>
                  <span className="font-extrabold text-sm block">
                    3. تدقيق شروط ومخرجات المفاوضات
                  </span>
                </div>
              </button>
            )}

            <button
              onClick={() => setActiveTab("custom")}
              className={`w-full text-right p-4 rounded-2xl transition-all border flex items-center gap-3 ${activeTab === "custom" ? "bg-indigo-50 border-indigo-200 text-indigo-950 shadow-md" : "bg-white hover:bg-zinc-50 border-zinc-100 text-zinc-600"}`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${activeTab === "custom" ? "bg-indigo-650 text-white" : "bg-zinc-100 text-zinc-500"}`}
              >
                <Blocks className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-bold text-zinc-400">Custom Automation Lab</span>
                <span className="font-extrabold text-sm block">4. مصمم المسارات المخصصة (n8n)</span>
              </div>
            </button>
          </div>

          {/* Sequential Step Timeline Cards OR Node Palette Library for Custom Tab */}
          {activeTab !== "custom" && (
            <div className="bg-white border border-zinc-200 rounded-3xl p-4 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase text-zinc-400 px-1">
                خطوات المسار البرمجي الممنهجة
              </h3>
              <div className="space-y-2 relative">
                {currentSteps.map((step, idx) => {
                  const IconComp = step.icon;
                  return (
                    <div
                      key={step.id}
                      onClick={() => setCurrentStepIndex(idx)}
                      className={`w-full text-right p-3 rounded-2xl border transition-all cursor-pointer relative shrink-0 ${
                        currentStepIndex === idx
                          ? "border-indigo-600 bg-zinc-50 shadow-sm"
                          : "border-zinc-100 hover:bg-zinc-50/50 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Step index circle / Status check */}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                            step.status === "completed"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : step.status === "warning"
                                ? "bg-amber-50 text-amber-600 border-amber-200"
                                : step.status === "error"
                                  ? "bg-rose-50 text-rose-600 border-rose-200"
                                  : step.status === "running"
                                    ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse"
                                    : "bg-zinc-50 text-zinc-400 border-zinc-200"
                          }`}
                        >
                          {step.status === "completed" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : step.status === "warning" ? (
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                          ) : step.status === "error" ? (
                            <XCircle className="w-4 h-4 text-rose-500" />
                          ) : (
                            idx + 1
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-black text-zinc-900 truncate leading-none">
                              {step.title}
                            </h4>
                          </div>
                          <p className="text-[10px] text-zinc-500 mt-1 truncate leading-none">
                            {step.desc}
                          </p>
                        </div>

                        {/* Manual trigger button per-step */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExecuteStep(idx);
                          }}
                          disabled={isRunning}
                          title="شغّل هذه الخطوة منفردة"
                          className={`p-1.5 rounded-lg border hover:bg-indigo-600 hover:text-white transition-colors shrink-0 ${
                            step.status === "completed"
                              ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                              : "border-zinc-200 text-zinc-400 bg-zinc-50"
                          }`}
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {activeTab === "custom" ? (
          <div className="xl:col-span-9">
            <CustomAutomationLab updateFirebaseToken={updateFirebaseToken} />
          </div>
        ) : (
          <>
            {/* Central Display Column: Step Output Realism Visualization (RECHART graphs, Interactive reports, Form 50 mockup) */}
            <div className="xl:col-span-6 space-y-6">
              <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm min-h-[580px] flex flex-col justify-between">
                <div>
                  {/* Dynamic Step Header */}
                  <div className="border-b border-zinc-100 pb-4 mb-4 flex justify-between items-start">
                    <div>
                      <span className="bg-zinc-100 text-zinc-600 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider mb-1 inline-block">
                        الخطوة {currentStepIndex + 1} من {currentSteps.length}
                      </span>
                      <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2 mt-1">
                        {currentSteps[currentStepIndex].title}
                      </h2>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        {currentSteps[currentStepIndex].desc}
                      </p>
                    </div>

                    {/* Execute Button */}
                    <button
                      onClick={() => handleExecuteStep(currentStepIndex)}
                      disabled={isRunning}
                      className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                    >
                      {isRunning ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      تنفيذ واختبار الخطوة
                    </button>
                  </div>

                  {/* Dynamic View rendering based on specific step indices & run outcome */}
                  <div className="space-y-4 flex-1">
                    {stepPayload ? (
                      /* Standard Result Panel */
                      <div className="space-y-4">
                        {/* Status Alert Badge */}
                        <div
                          className={`p-4 rounded-2xl border flex items-start gap-3 ${
                            stepPayload.status === "warning"
                              ? "bg-amber-50/50 border-amber-200 text-amber-900"
                              : stepPayload.status === "error"
                                ? "bg-rose-50/50 border-rose-200 text-rose-950"
                                : "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                          }`}
                        >
                          <div className="mt-0.5">
                            {stepPayload.status === "warning" ? (
                              <AlertTriangle className="w-5 h-5 text-amber-500" />
                            ) : stepPayload.status === "error" ? (
                              <XCircle className="w-5 h-5 text-rose-500" />
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-extrabold">منظومة الأتمتة المكتملة:</h4>
                            <p className="text-xs font-medium text-zinc-600 mt-1 leading-relaxed">
                              {stepPayload.message}
                            </p>
                            {stepPayload.findings && (
                              <div className="mt-2 bg-white/70 p-2.5 rounded-xl border border-dashed text-xs text-amber-800 font-bold block">
                                ⚠️ {stepPayload.findings}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Detailed Layout Outputs for specific steps */}
                        {activeTab === "vat" && currentStepIndex === 0 && (
                          /* Step 1 VAT: Imported Transactions Dataset */
                          <div className="space-y-3">
                            <h3 className="text-xs font-black text-zinc-400 block uppercase">
                              قائمة المعاملات المكتشفة في قواعد البيانات:
                            </h3>
                            <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-inner max-h-[290px] overflow-y-auto">
                              <table className="w-full text-right text-xs">
                                <thead className="bg-zinc-50 border-b border-zinc-100 sticky top-0">
                                  <tr>
                                    <th className="p-3 font-extrabold text-zinc-500">
                                      المورد/العميل
                                    </th>
                                    <th className="p-3 font-extrabold text-zinc-500">
                                      ميزة الضريبة
                                    </th>
                                    <th className="p-3 font-extrabold text-zinc-500 text-left">
                                      القيمة الأساسية
                                    </th>
                                    <th className="p-3 font-extrabold text-zinc-500 text-left">
                                      صافي الإجمالي
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 font-semibold">
                                  {stepPayload.data?.transactions.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-zinc-50/50">
                                      <td className="p-3">
                                        <span className="block font-black text-zinc-800">
                                          {tx.supplierName || tx.buyerName}
                                        </span>
                                        <span className="text-[10px] text-zinc-400">
                                          مستند: {tx.docNumber} | {tx.date}
                                        </span>
                                      </td>
                                      <td className="p-3">
                                        <span
                                          className={`inline-flex px-1.5 py-0.5 rounded text-[10px] ${tx.type === "sales" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}
                                        >
                                          {tx.type === "sales" ? "مبيعات" : "مشتريات"}
                                        </span>
                                      </td>
                                      <td className="p-3 text-left font-mono">
                                        {tx.amountBeforeVat.toLocaleString()} SAR
                                      </td>
                                      <td className="p-3 text-left text-zinc-900 font-mono font-black">
                                        {tx.total.toLocaleString()} SAR
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {activeTab === "vat" && currentStepIndex === 1 && (
                          /* Step 2 VAT: Validation Check results */
                          <div className="space-y-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 h-64 overflow-y-auto">
                            <span className="text-xs font-black text-zinc-400 block mb-2">
                              أخطاء العمليات الحسابية المكتشفة:
                            </span>
                            {stepPayload.details ? (
                              <div className="space-y-2">
                                <div className="bg-rose-50 text-rose-700 p-3 rounded-xl border border-rose-200 text-xs font-bold leading-relaxed">
                                  {stepPayload.details}
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl border border-emerald-200 text-xs font-semibold">
                                  ✓ تم التحقق من باقي مستندات الفواتير المتبقية بنسبة نجاح محاسبي
                                  90%.
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs font-medium text-zinc-500">
                                لا توجد ملاحظات حسابية رياضية لمطابقتها.
                              </p>
                            )}
                          </div>
                        )}

                        {activeTab === "vat" && currentStepIndex === 2 && (
                          /* Step 3 VAT: ZATCA Compliance rules validation sheet */
                          <div className="space-y-3">
                            <span className="text-xs font-black text-rose-500 block">
                              شعبة تحليل امتثال الزكاة والفوترة الإلكترونية (ZATCA Rules):
                            </span>
                            <div className="space-y-2 h-[260px] overflow-y-auto">
                              {stepPayload.nonCompliantList?.map((c: any, i: number) => (
                                <div
                                  key={i}
                                  className="bg-rose-50 border border-rose-100 p-3.5 rounded-2xl flex items-start gap-2 text-rose-950"
                                >
                                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div className="text-xs flex-1">
                                    <h5 className="font-extrabold">
                                      المستند: {c.doc} - {c.entity}
                                    </h5>
                                    <p className="text-xs text-rose-700 font-semibold mt-1">
                                      {c.reason}
                                    </p>
                                  </div>
                                </div>
                              ))}
                              <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-2xl text-xs font-semibold">
                                💡 توصية الغرفة الضريبية: قم بمراسلة الموردين فوراً لطلب تصحيح أرقام
                                السجلات الضريبية وإعادة إصدارها بنسبة ضريبة 15% صحيحة لمنع
                                الالتزامات المزدوجة.
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "vat" && currentStepIndex === 3 && (
                          /* Step 4 VAT: Form 50 Simulation Model (Official style) */
                          <div className="bg-[#f0f4f8] p-5 rounded-2xl border-2 border-indigo-200 space-y-3">
                            <div className="text-center border-b border-indigo-100 pb-3">
                              <Building2 className="w-8 h-8 text-indigo-700 mx-auto" />
                              <h4 className="text-sm font-black text-indigo-900 mt-1">
                                مسودة نموذج الإقرار الضريبي الرسمي لقيمة الضريبة المضافة (نموذج 50)
                              </h4>
                              <span className="text-[10px] text-zinc-400 font-bold">
                                الهيئة العامة للزكاة والضريبة والجمارك
                              </span>
                            </div>

                            <div className="divide-y divide-indigo-100 text-xs font-bold space-y-2">
                              <div className="flex justify-between items-center pt-2">
                                <span className="text-zinc-600">
                                  البند 1: المبيعات الخاضعة للنسبة الأساسية (15%)
                                </span>
                                <div className="text-left">
                                  <span className="block font-mono text-zinc-900">
                                    المبلغ الخاضع للضريبة:{" "}
                                    {stepPayload.form50?.sales_standard.amount.toLocaleString()} SAR
                                  </span>
                                  <span className="block font-mono text-indigo-700">
                                    قيمة الضريبة:{" "}
                                    {stepPayload.form50?.sales_standard.vat.toLocaleString()} SAR
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2">
                                <span className="text-zinc-600">
                                  البند 9: المشتريات الخاضعة للنسبة الأساسية (15%)
                                </span>
                                <div className="text-left font-semibold">
                                  <span className="block font-mono text-zinc-900">
                                    المبلغ الخاضع للضريبة:{" "}
                                    {stepPayload.form50?.purchases_standard.amount.toLocaleString()}{" "}
                                    SAR
                                  </span>
                                  <span className="block font-mono text-rose-600">
                                    قيمة الضريبة:{" "}
                                    {stepPayload.form50?.purchases_standard.vat.toLocaleString()}{" "}
                                    SAR
                                  </span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center pt-2.5 text-sm font-black text-indigo-950 border-t-2 border-indigo-200">
                                <span>صافي الضريبة القابلة للسداد أو الاسترداد للفترة</span>
                                <span className="font-mono text-emerald-700 text-lg">
                                  {stepPayload.form50?.net_vat_due.toLocaleString()} SAR
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === "vat" && currentStepIndex === 5 && (
                          /* Step 6 VAT: ZATCA Submission Receipt */
                          <div className="bg-zinc-900 text-emerald-400 p-5 rounded-2xl border-2 border-emerald-500/20 font-mono text-xs space-y-2">
                            <div className="flex justify-between items-center border-b border-emerald-500/10 pb-2">
                              <span className="font-sans font-black text-zinc-300">
                                طلب تقديم معتمد لـ ZATCA
                              </span>
                              <span className="bg-emerald-500/20 px-2 py-0.5 rounded text-[10px] text-emerald-300 uppercase font-bold">
                                Submitted
                              </span>
                            </div>
                            <p>رقم المرجع: {stepPayload.zatcaReceipt?.referenceNumber}</p>
                            <p>وقت التقديم: {stepPayload.zatcaReceipt?.timestamp}</p>
                            <p className="break-all whitespace-pre-wrap">
                              الختم الرقمي لمصلحة الضريبة: {stepPayload.zatcaReceipt?.digitalStamp}
                            </p>
                            <div className="bg-zinc-800 text-zinc-400 p-2.5 rounded text-[10px] font-sans">
                              * تم توثيق المعاملة وإدراج التوقيع المشفر للهيئة عبر منصة Mudarij
                              Sandbox بنجاح كامل.
                            </div>
                          </div>
                        )}

                        {/* AUDIT WORKFLOW SPECIFIC VISUALIZATIONS */}
                        {activeTab === "audit" && currentStepIndex === 1 && (
                          /* Step 2 Audit: AI Document Categorization Rechart Bar Visual */
                          <div className="space-y-3">
                            <p className="text-xs font-black text-zinc-400 block uppercase">
                              نتائج فرز وتصنيف بنود المصروفات بواسطة (AI Engine):
                            </p>
                            <div className="h-44 bg-zinc-50 rounded-2xl border border-zinc-100 p-3">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stepPayload.categories}>
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10, fill: "#6c757d", fontWeight: "bold" }}
                                  />
                                  <YAxis tick={{ fontSize: 10, fill: "#6c757d" }} />
                                  <Tooltip />
                                  <Bar
                                    dataKey="sum"
                                    fill="#4f46e5"
                                    radius={[5, 5, 0, 0]}
                                    name="قيمة التصنيف (SAR)"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-bold">
                              {stepPayload.categories?.map((cat: any, i: number) => (
                                <div
                                  key={i}
                                  className="bg-zinc-50 border border-zinc-100 p-1.5 rounded-lg"
                                >
                                  <span className="block text-zinc-500">{cat.name}</span>
                                  <span className="block text-zinc-900 mt-0.5">
                                    {cat.sum.toLocaleString()} SAR
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {activeTab === "audit" && currentStepIndex === 2 && (
                          /* Step 3 Audit: Missing Documents Detection Table */
                          <div className="space-y-3">
                            <span className="text-xs font-black text-rose-500 block">
                              فجوات المستندات والمدفوعات المفقودة (Missing Docs Alert):
                            </span>
                            <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-inner max-h-[250px] overflow-y-auto">
                              <table className="w-full text-right text-xs">
                                <thead className="bg-zinc-50 border-b border-zinc-100">
                                  <tr>
                                    <th className="p-3 font-extrabold text-zinc-500">
                                      تاريخ المعاملة البنكية
                                    </th>
                                    <th className="p-3 font-extrabold text-zinc-500">
                                      حركة القيود المالية
                                    </th>
                                    <th className="p-2 font-extrabold text-zinc-500 text-left">
                                      قيمة العجز المستندي
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50 font-semibold text-rose-950">
                                  {stepPayload.missingDocsList?.map((m: any, i: number) => (
                                    <tr key={i} className="bg-rose-50/40 hover:bg-rose-50/80">
                                      <td className="p-3 font-mono text-zinc-500">{m.date}</td>
                                      <td className="p-3">
                                        <span className="font-extrabold text-zinc-800 block">
                                          {m.desc}
                                        </span>
                                        <span className="text-[10px] text-rose-600 block">
                                          ⚠️ فاتورة إيصال مبسط مفقودة تماماً من النظام الدفتري
                                        </span>
                                      </td>
                                      <td className="p-3 text-left font-mono text-rose-600 font-extrabold">
                                        {m.amount.toLocaleString()} SAR
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {activeTab === "audit" && currentStepIndex === 4 && (
                          /* Killer Feature: STEP 5 Audit Final package mockup generation (Breathtaking details for 10k dollar audit) */
                          <div className="border-4 border-zinc-900/10 p-6 rounded-2xl bg-white space-y-4 shadow-xl text-zinc-900 leading-relaxed text-xs relative overflow-hidden">
                            <div className="absolute top-2 left-2 rotate-12 bg-indigo-50 text-indigo-700 px-3 py-1 rounded border-2 border-indigo-200 uppercase font-black text-[9px] tracking-widest opacity-80 pointer-events-none">
                              Draft Approved
                            </div>

                            <div className="flex justify-between items-start border-b border-zinc-200 pb-3">
                              <div>
                                <span className="bg-indigo-600 text-white font-bold text-[8px] px-2 py-0.5 rounded uppercase tracking-wider block mb-1 w-max">
                                  SOCPA Audit Standard
                                </span>
                                <h3 className="text-sm font-black">
                                  {stepPayload.package?.clientName}
                                </h3>
                                <p className="text-[10px] text-zinc-500">
                                  تقرير المراجعة الضريبة الخارجي لفترة:{" "}
                                  {stepPayload.package?.auditPeriod}
                                </p>
                              </div>
                              <Building2 className="w-10 h-10 text-zinc-800" />
                            </div>

                            <div>
                              <h4 className="text-xs font-black text-zinc-900 mb-1">
                                خلاصة رأي المحاسب المعتمد (Executive Opinion):
                              </h4>
                              <div className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl text-zinc-700 font-semibold leading-relaxed">
                                {stepPayload.package?.executiveSummary}
                              </div>
                              <div className="mt-2 text-xs">
                                <span className="font-extrabold">
                                  رأي مدقق المدونة المحاسبية للشركة:{" "}
                                </span>
                                <span className="text-amber-700 font-extrabold underline">
                                  {stepPayload.package?.auditOpinion}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-center font-bold">
                              <div className="bg-zinc-50 border p-2 rounded-xl">
                                <span className="text-[10px] text-zinc-400">
                                  إجمالي الإيرادات في الأستاذ
                                </span>
                                <span className="block text-sm font-mono text-zinc-900 font-black">
                                  {stepPayload.package?.financialMetrics?.revenue.toLocaleString()}{" "}
                                  SAR
                                </span>
                              </div>
                              <div className="bg-zinc-50 border p-2 rounded-xl">
                                <span className="text-[10px] text-zinc-400">
                                  هامش الربح المحقق (Margins)
                                </span>
                                <span className="block text-sm font-mono text-indigo-700 font-black">
                                  {stepPayload.package?.financialMetrics?.profitMargin}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                              <h5 className="font-black text-rose-600 text-[10px] uppercase">
                                توصيات مراجع التدقيق الموصى بها مسبقاً (SOCPA Rules):
                              </h5>
                              {stepPayload.package?.recommends?.map((rec: string, i: number) => (
                                <div
                                  key={i}
                                  className="flex gap-1.5 items-start font-semibold text-zinc-600"
                                >
                                  <span className="text-indigo-600 font-black">■</span>
                                  <p className="text-xs leading-none">{rec}</p>
                                </div>
                              ))}
                            </div>

                            {/* Print Layout trigger buttons */}
                            <div className="pt-3 flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => window.print()}
                                className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-800 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" /> طباعة ملف التدقيق الشامل
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Initial State before execution */
                      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-inner">
                          <HelpCircle className="w-8 h-8" />
                        </div>
                        <div>
                          <h3 className="font-black text-zinc-900">
                            بانتظار تشغيل خطوة أتمتة مسار العمل
                          </h3>
                          <p className="text-xs text-zinc-500 font-medium max-w-xs mt-1.5">
                            قم بالنقر على{" "}
                            <strong className="text-indigo-600">تنفيذ واختبار الخطوة</strong>{" "}
                            بالأعلى لمحاكاة جلب ومطابقة الفواتير، وفحص قواعد الامتثال مع الهيئة
                            إلكترونياً.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Downward Console Logs terminal at the bottom of the column */}
                <div className="mt-8 border-t border-zinc-100 pt-4">
                  <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-2 flex items-center gap-1">
                    <Database className="w-3.5 h-3.5" /> مسجل أحداث محرك الأتمتة والأحداث النشطة
                    (Live Engine Logs)
                  </h3>
                  <div
                    className="bg-zinc-950 text-zinc-400 p-4 rounded-2xl font-mono text-[10px] max-h-32 overflow-y-auto space-y-1 text-right"
                    dir="rtl"
                  >
                    {logs.map((log, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="text-zinc-650 font-black">■</span>
                        <p className="flex-1 text-zinc-300 select-all">{log}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Left Section: Advanced GPT & ZATCA Rules AI Advisor Box Chat */}
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4 h-[710px] flex flex-col justify-between">
                <div>
                  {/* Header */}
                  <div className="border-b border-zinc-200/60 pb-3 flex justify-between items-center bg-zinc-50">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg text-white">
                        <Sparkles className="w-4 h-4 animate-spin-slow" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 leading-none">
                          مستشار الزكاة والضريبة والامتثال
                        </h3>
                        <span className="text-[9px] text-zinc-400 font-bold block mt-1">
                          SOCPA/ZATCA Advisor AI
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Chat Thread Area */}
                  <div className="mt-3 overflow-y-auto h-[410px] scrollbar-thin scrollbar-thumb-zinc-200 p-1 space-y-3">
                    {chatHistory.map((chat, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[90%] font-semibold ${
                          chat.sender === "user"
                            ? "bg-indigo-600 text-white mr-auto text-left"
                            : "bg-white border border-zinc-200 text-zinc-700 ml-auto text-right shadow-sm"
                        }`}
                      >
                        {chat.sender === "ai" ? (
                          <div>{renderFormattedText(chat.text)}</div>
                        ) : (
                          <p>{chat.text}</p>
                        )}
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="bg-white border border-zinc-200 text-zinc-700 p-3 rounded-2xl text-xs text-right max-w-[90%] ml-auto shadow-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                        <p className="text-[10px] text-zinc-450 font-bold">
                          جاري مراجعة قواعد الضرائب والاعتمادات وحساب العميل الذكي...
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick action preset buttons representing the Killer features */}
                <div className="space-y-2 border-t border-zinc-200/60 pt-3">
                  <span className="text-[9px] font-black uppercase text-zinc-400 block tracking-wider">
                    استفسارات الفحص السريعة المحاسبية:
                  </span>

                  <div className="grid grid-cols-1 gap-1.5">
                    {[
                      {
                        text: "لماذا ارتفعت ضريبة القيمة المضافة هذا الشهر؟",
                        icon: FileText,
                        query: "Why did VAT increase this month?",
                      },
                      {
                        text: "أي الفواتير المحلية غير مطابقة لـ ZATCA؟",
                        icon: AlertTriangle,
                        query: "Which invoices are non-compliant?",
                      },
                      {
                        text: "أصدار مسودة تقرير التدقيق والامتثال الإداري",
                        icon: Zap,
                        query: "Prepare management report",
                      },
                      {
                        text: "ابحث عن المدفوعات المستندية البنكية المفقودة",
                        icon: Search,
                        query: "Find missing supplier invoices",
                      },
                    ].map((preset, i) => (
                      <button
                        key={i}
                        onClick={() => handleAskAdvisor(preset.query)}
                        className="w-full text-right p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-zinc-200 hover:border-indigo-300 transition-colors text-[10px] font-black text-zinc-700 flex items-center gap-2"
                      >
                        <preset.icon className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{preset.text}</span>
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="relative mt-2">
                    <input
                      type="text"
                      value={aiQuery}
                      onChange={(e) => setAiQuery(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && aiQuery.trim() && handleAskAdvisor(aiQuery)
                      }
                      placeholder="اسأل المستشار المالي (مثلاً: ما هي عقوبة الفواتير المفقودة؟)..."
                      className="w-full bg-white border border-zinc-200 rounded-xl py-3 pr-4 pl-10 outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-xs shadow-inner text-right"
                    />
                    <button
                      onClick={() => aiQuery.trim() && handleAskAdvisor(aiQuery)}
                      disabled={isAiLoading || !aiQuery.trim()}
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 text-indigo-600 hover:text-indigo-800 disabled:opacity-40"
                    >
                      <Send className="w-4 h-4 transform rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
