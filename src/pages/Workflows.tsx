import React, { useState, useEffect } from "react";
import {
  Workflow,
  Activity,
  FileText,
  Database,
  Lock,
  History,
  Sliders,
  Play,
  RefreshCw,
  Terminal,
  ActivitySquare,
} from "lucide-react";

import { WorkflowNode, WorkflowEdge, HistoricRun, NodeConfig } from "./workflows/types";
import { templates } from "./workflows/templates";
import { Canvas } from "./workflows/Canvas";
import { Inspector } from "./workflows/Inspector";
import { AnalyticsDashboard } from "./workflows/AnalyticsDashboard";
import { AiAssistant } from "./workflows/AiAssistant";

export default function Workflows() {
  const [activeTab, setActiveTab] = useState<
    "vat" | "audit" | "negotiation" | "history" | "analytics"
  >("vat");

  // Graph States
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<WorkflowEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Canvas Zoom / Pan states
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging states
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // AI Assistant States
  const [aiQuery, setAiQuery] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "أهلاً بك في **مساعد أتمتة مدارج الذكي** (SOCPA Engine). يمكنك استخدام اللوحة لتصميم واختبار مسارات تدقيق الضرائب والامتثال والرواتب آلياً، أو تطلب مني توليد مسار مخصص بالكامل فورياً!",
    },
  ]);

  // Runner states
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [logs, setLogs] = useState<string[]>([
    "نظام مدارج الأتمتة الذكي (Business OS) جاهز لبدء المهام الروتينية.",
    "اختر أحد القوالب الجاهزة أو استخدم منشئ المسارات المخصصة لتجربة الفحص الفوري.",
  ]);

  // Custom AI prompt generator state
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Variable mapper UI helper
  const [showVarPickerField, setShowVarPickerField] = useState<string | null>(null);

  // Historic execution records loaded from system activity
  const [historicRuns] = useState<HistoricRun[]>([
    {
      id: "RUN-9821",
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString().slice(0, 16).replace("T", " "),
      workflowName: "إقرار ضريبة القيمة المضافة ZATCA",
      status: "completed",
      duration: "1.2s",
      triggeredBy: "النظام الآلي (ZATCA Engine)",
    },
    {
      id: "RUN-9820",
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString().slice(0, 16).replace("T", " "),
      workflowName: "تدقيق المستندات والقوائم البنكية",
      status: "warning",
      duration: "1.8s",
      triggeredBy: "نظام مدارج الموحد",
    },
    {
      id: "RUN-9819",
      timestamp: new Date(Date.now() - 3600000 * 28).toISOString().slice(0, 16).replace("T", " "),
      workflowName: "أمان الضمان والتحكيم العقدي",
      status: "completed",
      duration: "0.9s",
      triggeredBy: "المحرك البرمجي للمستندات",
    },
  ]);

  const [dbMetrics, setDbMetrics] = useState<any>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const idToken = localStorage.getItem("firebaseToken") || "";
        const response = await fetch("/api/workflows/init", {
          headers: {
            Authorization: idToken ? `Bearer ${idToken}` : "",
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.metrics) {
            setDbMetrics(data.metrics);
          }
        }
      } catch (err) {
        console.error("Failed to load workflow db metrics:", err);
      }
    }
    loadMetrics();
  }, []);

  // Load selected template when tab changes or dbMetrics loads
  useEffect(() => {
    if (activeTab === "vat" || activeTab === "audit" || activeTab === "negotiation") {
      const template = templates[activeTab];
      // Clone nodes to prevent mutating the original templates definition
      let mappedNodes = template.nodes.map((n) => ({ ...n }));

      if (dbMetrics) {
        if (activeTab === "vat") {
          mappedNodes = mappedNodes.map((node, index) => {
            if (index === 0) {
              return {
                ...node,
                inputPayload: {
                  ...node.inputPayload,
                  dbSalesCount: dbMetrics.salesCount,
                  dbPurchasesCount: dbMetrics.purchasesCount,
                  totalActiveTransactions: dbMetrics.totalTransactions,
                },
              };
            }
            if (index === 1) {
              return {
                ...node,
                outputPayload: {
                  ...node.outputPayload,
                  mathMismatchesDetected: dbMetrics.mathMismatchCount,
                  status: dbMetrics.mathMismatchCount > 0 ? "warning" : "success",
                },
              };
            }
            if (index === 3) {
              return {
                ...node,
                outputPayload: {
                  ...node.outputPayload,
                  form50: {
                    sales_standard: { amount: dbMetrics.salesTotal, vat: dbMetrics.salesVat },
                    purchases_standard: {
                      amount: dbMetrics.purchasesTotal,
                      vat: dbMetrics.purchasesVat,
                    },
                    net_vat_due: dbMetrics.salesVat - dbMetrics.purchasesVat,
                  },
                },
              };
            }
            return node;
          });
        } else if (activeTab === "audit") {
          mappedNodes = mappedNodes.map((node, index) => {
            if (index === 0) {
              return {
                ...node,
                outputPayload: {
                  ...node.outputPayload,
                  totalBankEntries: dbMetrics.totalTransactions + dbMetrics.missingDocsCount,
                  totalUploadedDocs: dbMetrics.totalTransactions,
                },
              };
            }
            if (index === 2) {
              return {
                ...node,
                outputPayload: {
                  ...node.outputPayload,
                  missingInvoicesDetected: dbMetrics.missingDocsCount,
                },
              };
            }
            return node;
          });
        }
      }

      setNodes(mappedNodes);
      setEdges(template.edges.map((e) => ({ ...e })));
      setSelectedNodeId(null);
      setCurrentStepIndex(-1);
      setIsRunning(false);
      setLogs([
        `تم شحن قالب: ${activeTab === "vat" ? "إقرار ضريبة القيمة المضافة (ZATCA)" : activeTab === "audit" ? "تدقيق المطابقة الدفترية والبنك" : "أمان وعقود الضمان المحكّمة"}`,
        "انقر على أي عقدة (Node) لاستكشاف خصائص المدخلات والمخرجات والمتغيرات وتعديلها مجهّزة بقاعدة بياناتك النشطة.",
      ]);
    }
  }, [activeTab, dbMetrics]);

  // Update specific node's configuration parameters
  const handleUpdateNodeConfig = (nodeId: string, updatedConfig: Partial<NodeConfig>) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              config: { ...n.config, ...updatedConfig },
            }
          : n
      )
    );
  };

  // Execute a single node simulation
  const handleExecuteSingleNode = async (nodeId: string) => {
    const nodeIndex = nodes.findIndex((n) => n.id === nodeId);
    if (nodeIndex === -1 || isRunning) return;

    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, status: "running" } : n)));
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] بدء تشغيل فردي للعقدة: ${nodes[nodeIndex].nameAr}...`,
      ...prev,
    ]);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const stepDuration = Math.floor(Math.random() * 80) + 40;
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: "completed",
              durationMs: stepDuration,
              outputPayload: {
                ...n.outputPayload,
                isolatedRun: true,
                runTimeMs: stepDuration,
                timestamp: new Date().toISOString(),
              },
            }
          : n
      )
    );

    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ✓ انتهى تشغيل العقدة: ${nodes[nodeIndex].nameAr} في ${stepDuration}ms.`,
      ...prev,
    ]);
  };

  // Add a new node to the active canvas
  const handleAddNewNode = (nodeType: "trigger" | "action" | "condition") => {
    const id = "node-" + (nodes.length + 1);
    const newX = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x)) + 240 : 100;
    const newY = 220;

    const defaultNode: WorkflowNode = {
      id,
      name:
        nodeType === "trigger"
          ? "New Webhook Trigger"
          : nodeType === "action"
            ? "Custom API Action"
            : "If/Else Router",
      nameAr:
        nodeType === "trigger"
          ? "حافز ويبهوك مخصص"
          : nodeType === "action"
            ? "إجراء API مخصص"
            : "بوابة شرطية ثنائية",
      desc: "Custom added node parameter",
      descAr: "عقدة أتمتة مخصصة تمت إضافتها يدوياً للمخطط",
      type: nodeType,
      iconName:
        nodeType === "trigger" ? "Play" : nodeType === "action" ? "Settings2" : "AlertTriangle",
      x: newX,
      y: newY,
      status: "idle",
      config:
        nodeType === "condition"
          ? {
              conditionField: "amount",
              conditionOperator: ">",
              conditionValue: "50000",
            }
          : {
              apiEndpoint: "/api/v1/custom-action",
              authMethod: "None",
            },
      inputPayload: { requestBody: { id: "record_id", value: 12000 } },
      outputPayload: { success: true, timestamp: new Date().toISOString() },
    };

    setNodes((prev) => [...prev, defaultNode]);

    // Auto-link to previous node if available
    if (nodes.length > 0) {
      const lastNode = nodes[nodes.length - 1];
      setEdges((prev) => [...prev, { from: lastNode.id, to: id }]);
    }

    setSelectedNodeId(id);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] + أضيفت عقدة جديدة للمسار: ${defaultNode.nameAr}`,
      ...prev,
    ]);
  };

  // Delete selected node and clean links
  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setEdges((prev) => prev.filter((e) => e.from !== nodeId && e.to !== nodeId));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] - تم حذف العقدة وروابطها بنجاح.`,
      ...prev,
    ]);
  };

  // Run full pipeline sequence step-by-step
  const handleExecuteFullPipeline = async () => {
    if (isRunning || nodes.length === 0) return;
    setIsRunning(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ⚡ بدء التشغيل التجريبي ومحاكاة المعالجة الممنهجة للمسار بالكامل.`,
      ...prev,
    ]);

    // Reset status of all nodes to idle
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle" })));

    for (let i = 0; i < nodes.length; i++) {
      setCurrentStepIndex(i);

      // Pulse node status as running
      setNodes((prev) => prev.map((n, idx) => (idx === i ? { ...n, status: "running" } : n)));
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString("ar-SA")}] جاري تشغيل العقدة: ${nodes[i].nameAr}...`,
        ...prev,
      ]);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Simulate output status (completed / warning)
      const randomStatus: "completed" | "warning" | "error" =
        nodes[i].type === "condition"
          ? "completed"
          : i === 2 && activeTab === "vat"
            ? "warning"
            : "completed";

      const stepDuration = Math.floor(Math.random() * 150) + 50;

      setNodes((prev) =>
        prev.map((n, idx) =>
          idx === i
            ? {
                ...n,
                status: randomStatus,
                durationMs: stepDuration,
                outputPayload: {
                  ...n.outputPayload,
                  runTimeMs: stepDuration,
                  status: "success",
                  timestamp: new Date().toISOString(),
                },
              }
            : n
        )
      );

      setLogs((prev) => [
        `[${new Date().toLocaleTimeString("ar-SA")}] اكتمل تشغيل العقدة ${nodes[i].nameAr} بنجاح في غضون ${stepDuration}ms بنتيجة: ${randomStatus === "completed" ? "سليم" : "تنبيه بسيط"}`,
        ...prev,
      ]);
    }

    setIsRunning(false);
    setCurrentStepIndex(-1);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ✓ انتهت محاكاة مسار الأتمتة بالكامل بنجاح.`,
      ...prev,
    ]);
  };

  // Reset all nodes states to idle
  const handleResetCanvas = () => {
    setNodes((prev) => prev.map((n) => ({ ...n, status: "idle", durationMs: undefined })));
    setCurrentStepIndex(-1);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ↺ تم إعادة تصفير حالات تشغيل المسار والملقم التجريبي.`,
      ...prev,
    ]);
  };

  // AI Advisor question submission
  const handleAskAdvisor = async (questionText: string) => {
    if (isAiLoading) return;
    setAiQuery("");
    setIsAiLoading(true);

    setChatHistory((prev) => [...prev, { sender: "user", text: questionText }]);

    try {
      const idToken = localStorage.getItem("firebaseToken") || "";
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
          text: `❌ فشل الاتصال بالمساعد الذكي: ${err.message}. الرجاء ضبط مفتاح Gemini الخاص بك في الإعدادات.`,
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // AI Prompt-to-Graph Generation
  const handleGenerateWorkflow = async () => {
    if (!customPrompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setLogs((prev) => [
      `[${new Date().toLocaleTimeString("ar-SA")}] ⚙️ جاري تحليل هندسة الأتمتة التوليدية بواسطة مدارج AI...`,
      ...prev,
    ]);

    try {
      const idToken = localStorage.getItem("firebaseToken") || "";
      const response = await fetch("/api/workflows/suggest-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: idToken ? `Bearer ${idToken}` : "",
        },
        body: JSON.stringify({ prompt: customPrompt }),
      });

      if (!response.ok) {
        throw new Error("فشل توليد المسار البرمجي المخصص.");
      }

      const resData = await response.json();
      if (resData.success && resData.workflow) {
        const wf = resData.workflow;

        // Map generated workflow JSON nodes
        const mappedNodes: WorkflowNode[] = wf.nodes.map((n: any, idx: number) => ({
          id: n.id,
          name: n.name,
          nameAr: n.nameAr,
          desc: n.desc,
          descAr: n.descAr,
          type: n.type as any,
          iconName:
            n.iconName ||
            (n.type === "trigger"
              ? "Play"
              : n.type === "condition"
                ? "AlertTriangle"
                : "Settings2"),
          x: n.x || idx * 240 + 80,
          y: n.y || 220,
          status: "idle" as const,
          config: n.config || {
            apiEndpoint: n.type === "action" ? "/api/v1/trigger" : undefined,
            triggerEvent: n.type === "trigger" ? "On Webhook Call" : undefined,
          },
          inputPayload: n.inputPayload || { status: "ready" },
          outputPayload: n.outputPayload || { status: "pending" },
        }));

        setNodes(mappedNodes);
        setEdges(wf.edges || []);
        setSelectedNodeId(null);
        setCurrentStepIndex(-1);
        setIsRunning(false);
        setCustomPrompt("");

        setLogs((prev) => [
          `[${new Date().toLocaleTimeString("ar-SA")}] ✓ نجح بناء مسار الأتمتة المخصص: ${wf.workflowNameAr || wf.workflowName}`,
          ...prev,
        ]);

        setChatHistory((prev) => [
          ...prev,
          {
            sender: "ai",
            text: `لقد صممت لك بنجاح مسار عمل مخصصاً بعنوان **${wf.workflowNameAr || wf.workflowName}** يتألف من **${mappedNodes.length} عقود** مترابطة ومبوبة.\n\nيمكنك الآن تشغيل المسار وتفحصه واختبار جودة المعالجة فيه!`,
          },
        ]);
      }
    } catch (err: any) {
      setLogs((prev) => [
        `[${new Date().toLocaleTimeString("ar-SA")}] ❌ خطأ في بناء المسار المخصص: ${err.message}`,
        ...prev,
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedNode = nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 bg-white border border-zinc-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full text-[10px] font-black">
            <ActivitySquare className="w-3.5 h-3.5 animate-pulse" />
            <span>نظام إدارة أتمتة العمليات للمؤسسات (Business OS Flow)</span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
            <Workflow className="w-8 h-8 text-indigo-600" />
            مسارات العمل المؤتمتة الذكية
          </h1>
          <p className="text-xs font-semibold text-zinc-500 max-w-2xl leading-relaxed animate-fade-in">
            محاكي وسير عمل هندسة الأنظمة والربط الضريبي والمالي المتكامل للشركات السعودية. اربط
            النظم المحاسبية، وصنف المعاملات بالـ AI، وطابق الدورة المستندية بامتثال تام للـ ZATCA
            وSOCPA.
          </p>
        </div>

        {/* Real Operational Metrics Summary */}
        {dbMetrics && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">
            <div className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-2xl flex flex-col justify-center min-w-[130px]">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                إجمالي المعاملات المحسوبة
              </span>
              <span className="text-lg font-black text-zinc-800 mt-1">
                {dbMetrics.totalTransactions || 0}
              </span>
            </div>
            <div className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-2xl flex flex-col justify-center min-w-[130px]">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                فواتير المبيعات
              </span>
              <span className="text-lg font-black text-emerald-600 mt-1">
                {dbMetrics.salesCount || 0}
              </span>
            </div>
            <div className="bg-zinc-50 border border-zinc-150 p-3.5 rounded-2xl flex flex-col justify-center min-w-[130px] col-span-2 md:col-span-1">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                المستندات المفقودة
              </span>
              <span className="text-lg font-black text-amber-600 mt-1">
                {dbMetrics.missingDocsCount || 0}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Modern Tabs Bar Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "vat", name: "إقرار القيمة المضافة", icon: FileText, badge: "ZATCA" },
            { id: "audit", name: "مطابقة الحسابات والتدقيق", icon: Database, badge: "SOCPA" },
            { id: "negotiation", name: "عقود الضمان والتحكيم", icon: Lock, badge: "Contract" },
            { id: "history", name: "تاريخ التشغيل واللوائح", icon: History, badge: "Logs" },
            { id: "analytics", name: "لوحة مؤشرات الأداء", icon: Sliders, badge: "KPIs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                  : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-600"
              }`}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? "text-indigo-400" : "text-zinc-400"}`}
              />
              <span>{tab.name}</span>
              <span
                className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500"}`}
              >
                {tab.badge}
              </span>
            </button>
          ))}
        </div>

        {/* Global execution buttons */}
        {(activeTab === "vat" || activeTab === "audit" || activeTab === "negotiation") && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleExecuteFullPipeline}
              disabled={isRunning || nodes.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {isRunning ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>تشغيل تجريبي للمسار بالكامل</span>
            </button>
            <button
              onClick={handleResetCanvas}
              title="تصفير حالات عقد الأتمتة"
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 p-2.5 rounded-xl border border-zinc-200 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {activeTab === "history" ? (
        <AnalyticsDashboard historicRuns={historicRuns} />
      ) : activeTab === "analytics" ? (
        <AnalyticsDashboard historicRuns={historicRuns} />
      ) : (
        /* Workflows Interactive Screen */
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Visual Workspace Column */}
          <div className="xl:col-span-8 space-y-6">
            {/* Visual Canvas Panel */}
            <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-150 pb-4">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                    مخطط الربط وهندسة المسار المرئي
                  </h3>
                  <p className="text-[11px] font-semibold text-zinc-500 mt-0.5">
                    يمكنك سحب وترتيب عقد الأتمتة، والربط الحركي ثلاثي الأبعاد لدفق البيانات وتدقيق
                    العمليات آلياً.
                  </p>
                </div>
                <span className="text-[9px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-black">
                  محرر مرئي نشط
                </span>
              </div>

              <Canvas
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedNodeId}
                setSelectedNodeId={setSelectedNodeId}
                onExecuteSingleNode={handleExecuteSingleNode}
                onDeleteNode={handleDeleteNode}
                onAddNode={handleAddNewNode}
                zoomLevel={zoomLevel}
                setZoomLevel={setZoomLevel}
                panOffset={panOffset}
                setPanOffset={setPanOffset}
                isPanning={isPanning}
                setIsPanning={setIsPanning}
                panStart={panStart}
                setPanStart={setPanStart}
                draggedNodeId={draggedNodeId}
                setDraggedNodeId={setDraggedNodeId}
                dragOffset={dragOffset}
                setDragOffset={setDragOffset}
              />
            </div>

            {/* Run Logs and Terminal Console Output */}
            <div className="bg-zinc-950 border border-zinc-800 text-white rounded-3xl p-6 shadow-xl space-y-3">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-wider">
                    لوحة التحكم وسجل التشغيل الآلي
                  </span>
                </div>
                <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg font-mono">
                  stdout | local_node
                </span>
              </div>
              <div
                className="font-mono text-[11px] space-y-1.5 max-h-40 overflow-y-auto pr-1 text-right"
                dir="rtl"
              >
                {logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 text-zinc-300">
                    <span className="text-zinc-600 font-semibold select-none">
                      [{logs.length - idx}]
                    </span>
                    <span className="font-semibold">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Inspector & AI Assistant Column */}
          <div className="xl:col-span-4 space-y-6">
            {/* Contextual inspector */}
            <div className="h-[430px]">
              <Inspector
                node={selectedNode}
                onUpdateConfig={handleUpdateNodeConfig}
                onExecuteSingleNode={handleExecuteSingleNode}
                onDeleteNode={handleDeleteNode}
                showVarPickerField={showVarPickerField}
                setShowVarPickerField={setShowVarPickerField}
                onClose={() => setSelectedNodeId(null)}
              />
            </div>

            {/* Generative builder & AI Advisor */}
            <AiAssistant
              chatHistory={chatHistory}
              aiQuery={aiQuery}
              setAiQuery={setAiQuery}
              isAiLoading={isAiLoading}
              onAskAdvisor={handleAskAdvisor}
              customPrompt={customPrompt}
              setCustomPrompt={setCustomPrompt}
              isGenerating={isGenerating}
              onGenerateWorkflow={handleGenerateWorkflow}
            />
          </div>
        </div>
      )}
    </div>
  );
}
