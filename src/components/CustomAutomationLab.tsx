import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Cpu, CheckCircle2, XCircle, Clock, Zap, AlertTriangle, Database, 
  Send, X, ShieldAlert, FileText, Mail, RefreshCw, Sparkles, Blocks, Trash2, HelpCircle
} from 'lucide-react';

interface CustomAutomationLabProps {
  updateFirebaseToken: () => Promise<string>;
}

export default function CustomAutomationLab({ updateFirebaseToken }: CustomAutomationLabProps) {
  // Drag-and-Drop Node Canvas Workspace States
  const [customWorkflow, setCustomWorkflow] = useState<any>({
    workflowName: "Saudi WPS Real-Time Flow",
    workflowNameAr: "مسار حماية الأجور والرواتب KSA",
    description: "Connects ERP logs directly to official Wage Protection System guidelines.",
    descriptionAr: "يربط سجلات ERP للموظفين بمسيرات الرواتب ومدد المطابقة للموارد الموثقة KSA.",
    nodes: [
      { id: "node-1", name: "Invoices API Trigger", nameAr: "حافز فواتير المبيعات", desc: "Launches flow when invoice is processed", descAr: "يقوم تشغيل المسار فور الكشف عن فواتير مبيعات جديدة آلياً", type: "trigger", iconName: "Play", x: 40, y: 140 },
      { id: "node-2", name: "ZATCA Validation Match", nameAr: "فحص ومطابقة هيئة ZATCA", desc: "Validates 15% VAT metrics and stamp", descAr: "التحقق من صحة الرقم الضريبي والأكواد وسلامة الختم الرقمي لمشغلي مدارج", type: "action", iconName: "ShieldAlert", x: 300, y: 140 },
      { id: "node-3", name: "Compliance Guard Gate", nameAr: "بوابات التحكيم والامتثال", desc: "Verifies compliance factors with partner sign-offs", descAr: "بوابة فحص وتوجيه خط سير المعايير بالتنسيق مع الشريك SOCPA المعتمد", type: "condition", iconName: "AlertTriangle", x: 560, y: 140 }
    ],
    edges: [
      { from: "node-1", to: "node-2" },
      { from: "node-2", to: "node-3" }
    ]
  });

  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
  const [activeCustomNodeSimIndex, setActiveCustomNodeSimIndex] = useState<string | null>(null);
  const [customSimLogs, setCustomSimLogs] = useState<string[]>([
    "لوحة هندسة مسارات الأتمتة المخصصة (n8n Workspace) جاهزة تماماً.",
    "قم بكتابة فكرة الأتمتة بالأعلى لتصميم المسار فورياً بذكاء مدارج الاصطناعي."
  ]);
  const [customSimRunning, setCustomSimRunning] = useState<boolean>(false);
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isAiGenerating, setIsAiGenerating] = useState<boolean>(false);

  // Load custom workflows from LocalStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mudarij_custom_workflows");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.nodes) {
          setCustomWorkflow(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const gridRef = useRef<HTMLDivElement>(null);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const node = customWorkflow.nodes.find((n: any) => n.id === nodeId);
    if (!node) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    setDraggedNodeId(nodeId);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  const handleNodeTouchStart = (e: React.TouchEvent, nodeId: string) => {
    if (!gridRef.current || e.touches.length === 0) return;
    const rect = gridRef.current.getBoundingClientRect();
    const node = customWorkflow.nodes.find((n: any) => n.id === nodeId);
    if (!node) return;

    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    setDraggedNodeId(nodeId);
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!draggedNodeId || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = Math.max(10, Math.min(rect.width - 240, mouseX - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 120, mouseY - dragOffset.y));

    updateNodeCoords(draggedNodeId, newX, newY);
  };

  const handleGridTouchMove = (e: React.TouchEvent) => {
    if (!draggedNodeId || !gridRef.current || e.touches.length === 0) return;
    const rect = gridRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const mouseX = touch.clientX - rect.left;
    const mouseY = touch.clientY - rect.top;

    const newX = Math.max(10, Math.min(rect.width - 240, mouseX - dragOffset.x));
    const newY = Math.max(10, Math.min(rect.height - 120, mouseY - dragOffset.y));

    updateNodeCoords(draggedNodeId, newX, newY);
    if (e.cancelable) e.preventDefault();
  };

  const handleDragEnd = () => {
    setDraggedNodeId(null);
  };

  const updateNodeCoords = (nodeId: string, x: number, y: number) => {
    setCustomWorkflow((prev: any) => {
      const updatedNodes = prev.nodes.map((n: any) => {
        if (n.id === nodeId) {
          return { ...n, x: Math.round(x), y: Math.round(y) };
        }
        return n;
      });
      const nextWf = { ...prev, nodes: updatedNodes };
      localStorage.setItem("mudarij_custom_workflows", JSON.stringify(nextWf));
      return nextWf;
    });
  };

  const deleteCustomNode = (nodeId: string) => {
    setCustomWorkflow((prev: any) => {
      const updatedNodes = prev.nodes.filter((n: any) => n.id !== nodeId);
      const updatedEdges = prev.edges.filter((e: any) => e.from !== nodeId && e.to !== nodeId);
      const nextWf = { ...prev, nodes: updatedNodes, edges: updatedEdges };
      localStorage.setItem("mudarij_custom_workflows", JSON.stringify(nextWf));
      return nextWf;
    });
    setCustomSimLogs((prev: any) => [
      `[المنسق المالي] 🗑️ تم حذف العقدة [${nodeId}] وجميع روابط الاتصال التابعة لها.`,
      ...prev
    ]);
  };

  const clearCustomCanvas = () => {
    const emptyWf = {
      workflowName: "Custom Interactive Flow",
      workflowNameAr: "مسار عمل تفاعلي فارغ",
      description: "Build your custom automation flow from scratch.",
      descriptionAr: "صمّم وهندس أتمتة المعاملات الضريبية أو دورات التدقيق بحرية بالكامل.",
      nodes: [],
      edges: []
    };
    setCustomWorkflow(emptyWf);
    localStorage.setItem("mudarij_custom_workflows", JSON.stringify(emptyWf));
    setCustomSimLogs([
      "تم تصفير المصمم بالكامل. ابدأ بسحب وإضافة عقد جديدة، أو دع مهندس الذكاء الاصطناعي يبنيه لك!"
    ]);
  };

  const addCustomNode = (nodeType: 'trigger' | 'action' | 'condition', presetKey: string) => {
    const presets: Record<string, { name: string, nameAr: string, desc: string, descAr: string, iconName: string }> = {
      'sales_trigger': { name: "Daily Sales Trigger", nameAr: "حافز فواتير المبيعات", desc: "Launches flow when daily invoice drops", descAr: "تنشيط فوري للمسار فور صدور فاتورة مبيعات جديدة", iconName: "Play" },
      'schedule_trigger': { name: "Audit Scheduler", nameAr: "مجدول التدقيق الزمني", desc: "Runs audit routine automated monthly", descAr: "أداة ذاتية لشرارة البدء بنهاية الفترة الضريبية مجدولاً", iconName: "Clock" },
      'erp_trigger': { name: "ERP Live Push", nameAr: "حافز قيود نظام ERP", desc: "Catches double entry logs from ERP push", descAr: "التقاط وتوجيه المعاملات والقيد المزدوج المرفوع لحظياً", iconName: "Database" },
      'zatca_verify': { name: "ZATCA Legal Verification", nameAr: "مطابقة فواتير هيئة ZATCA", desc: "Checks XML status and hashes for ZATCA standard", descAr: "التحقق التقني من الختم وتتبع الرقم التعريفي للضرائب", iconName: "ShieldAlert" },
      'slack_email_alert': { name: "Slack / Email Alert", nameAr: "إشعار البريد الإلكتروني", desc: "Sends custom reports to finance teams", descAr: "توليد وبث التنبيه المباشر لفريق المالية والاستشاريين", iconName: "Mail" },
      'gosi_tax_audit': { name: "GOSI Contribution Audit", nameAr: "فحص قيود التأمينات GOSI", desc: "Ensures legal retirement shares match salary payroll", descAr: "التحقق الذكي من الامتثال في كشوف التأمينات والرواتب", iconName: "FileText" },
      'sms_notifier': { name: "SMS Invoice Notifier", nameAr: "إشعار العميل المصغر", desc: "Dispatches SMS validation link containing QR Code", descAr: "بدء إخطار فوري برسائل نصية قصيرة تفاعلية مطابقة", iconName: "Send" },
      'bank_match': { name: "Direct Bank Matcher", nameAr: "تنسيق ومطابقة كشوف البنك", desc: "Audits bank ledger deposits against internal entries", descAr: "تحليل كشف النقديات البنكي ومطابقته بدقة في الأستاذ العام", iconName: "Cpu" },
      'socpa_check': { name: "SOCPA Lead Gate", nameAr: "بوابة اعتماد مستشار SOCPA", desc: "Branch workflow conditionally on partner sign-off", descAr: "توجيه خط سير المعارك بالاستناد لعلامة موافقة المرخصين", iconName: "AlertTriangle" },
      'balance_capacity_check': { name: "Liquidity Capacity Guard", nameAr: "شرط ملاءة التغطية النقدية", desc: "Route approvals based on minimum threshold", descAr: "تقييم ملاءة تغطية الحساب البنكي وصلاحية الصرف الآلي", iconName: "Zap" }
    };

    const config = presets[presetKey];
    if (!config) return;

    const nodeId = `node-${Date.now()}`;
    const newNode = {
      id: nodeId,
      name: config.name,
      nameAr: config.nameAr,
      desc: config.desc,
      descAr: config.descAr,
      type: nodeType,
      iconName: config.iconName,
      x: 80 + (customWorkflow.nodes.length * 52) % 400,
      y: 110 + (customWorkflow.nodes.length * 48) % 240
    };

    // Auto connect back to previous node if exists to ease UX!
    const updatedEdges = [...customWorkflow.edges];
    if (customWorkflow.nodes.length > 0) {
      const lastNode = customWorkflow.nodes[customWorkflow.nodes.length - 1];
      updatedEdges.push({ from: lastNode.id, to: nodeId });
    }

    setCustomWorkflow((prev: any) => {
      const nextWf = {
        ...prev,
        nodes: [...prev.nodes, newNode],
        edges: updatedEdges
      };
      localStorage.setItem("mudarij_custom_workflows", JSON.stringify(nextWf));
      return nextWf;
    });

    setCustomSimLogs((prev: any) => [
      `[المنسق المالي] ➕ تم إنشاء عقدة جديدة [${config.nameAr}] من فئة [${nodeType}].`,
      ...prev
    ]);
  };

  const generateAiCustomWorkflow = async () => {
    if (!aiPrompt.trim() || isAiGenerating) return;
    setIsAiGenerating(true);
    setCustomSimLogs(prev => [
      `[الذكاء الاصطناعي] 🧠 جاري تحليل التلقين: "${aiPrompt}"... لمواءمتها مع الامتثال المالي السعودي وبدء هندسة المسار مخصصاً...`,
      ...prev
    ]);

    try {
      const idToken = await updateFirebaseToken();
      const response = await fetch('/api/workflows/suggest-workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': idToken ? `Bearer ${idToken}` : ''
        },
        body: JSON.stringify({ prompt: aiPrompt })
      });

      if (!response.ok) {
        throw new Error("فشل توليد مسار مخصص عبر خادم الذكاء الاصطناعي");
      }

      const resData = await response.json();
      if (resData.success && resData.workflow) {
        setCustomWorkflow(resData.workflow);
        localStorage.setItem("mudarij_custom_workflows", JSON.stringify(resData.workflow));
        setCustomSimLogs(prev => [
          `[الذكاء الاصطناعي] ✨ اكتملت هندسة المسار: [${resData.workflow.workflowNameAr}] بنجاح! تم تركيب ${resData.workflow.nodes.length} عقدة و ${resData.workflow.edges.length} صلة انتقال.`,
          ...(resData.warning ? [`[تنبيه] ${resData.warning}`] : []),
          ...prev
        ]);
        setAiPrompt('');
      } else {
        throw new Error("تلقى الخادم استجابة مشوهة");
      }
    } catch (err: any) {
      console.error(err);
      setCustomSimLogs(prev => [
        `[الذكاء الاصطناعي] ❌ فشل البناء: ${err.message}. تم إرجاع الإعدادات الحالية لضمان استقرار اللوحة.`,
        ...prev
      ]);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const runCustomSimulation = async () => {
    if (customSimRunning || customWorkflow.nodes.length === 0) return;
    setCustomSimRunning(true);
    setCustomSimLogs([]);
    
    setCustomSimLogs(prev => [
      `[محاكي مدارج] 🎬 بدء سلسلة تدقق العمليات لمسار: [${customWorkflow.workflowNameAr}]...`,
      ...prev
    ]);

    const sortedNodes = [...customWorkflow.nodes].sort((a: any, b: any) => a.x - b.x);

    for (let i = 0; i < sortedNodes.length; i++) {
      const gNode = sortedNodes[i];
      setActiveCustomNodeSimIndex(gNode.id);
      
      setCustomSimLogs(prev => [
        `[تحفيز] ⚙️ معالجة عقدة [${gNode.nameAr}] (${gNode.type.toUpperCase()})...`,
        ...prev
      ]);

      await new Promise(resolve => setTimeout(resolve, 1100));

      setCustomSimLogs(prev => [
        `[نجاح] ✅ كفاءة أداء العقدة [${gNode.nameAr}] مكتملة ومنقحة دفترياً.`,
        ...prev
      ]);
    }

    setActiveCustomNodeSimIndex(null);
    setCustomSimRunning(false);
    setCustomSimLogs(prev => [
      `[محاكي مدارج] 🏁 تم بنجاح إنهاء محاكاة الأتمتة المخصصة بالكامل بنسبة نجاح 100%.`,
      ...prev
    ]);
  };

  // Generate curve path between elements
  const drawEdge = (fromId: string, toId: string) => {
    const fromNode = customWorkflow.nodes.find((n: any) => n.id === fromId);
    const toNode = customWorkflow.nodes.find((n: any) => n.id === toId);
    if (!fromNode || !toNode) return null;
    
    const startX = fromNode.x + 240;
    const startY = fromNode.y + 40;
    const endX = toNode.x;
    const endY = toNode.y + 40;
    
    const controlX1 = startX + 60;
    const controlY1 = startY;
    const controlX2 = endX - 60;
    const controlY2 = endY;
    
    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Run Sim controls */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">Custom Automation Lab (n8n Workspace)</span>
            {customSimRunning && (
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
                جاري محاكاة العمليات...
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mt-2">
            {customWorkflow.workflowNameAr || "مصمم التدفقات المخصص"}
          </h2>
          <p className="text-xs font-semibold text-zinc-500 mt-1">{customWorkflow.descriptionAr || "قم بسحب وإفلات العناصر أو اطلب من الذكاء الاصطناعي توليد مسار عملك المخصص فورياً."}</p>
        </div>

        <div className="flex gap-2 self-stretch md:self-auto shrink-0">
          <button
            onClick={runCustomSimulation}
            disabled={customSimRunning || customWorkflow.nodes.length === 0}
            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            تشغيل ومحاكاة الأتمتة
          </button>

          <button
            onClick={clearCustomCanvas}
            disabled={customSimRunning}
            className="bg-zinc-150 hover:bg-zinc-200 text-zinc-700 font-bold text-xs px-5 py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            تصفير المساحة
          </button>
        </div>
      </div>

      {/* AI Prompt Design Block */}
      <div className="bg-[#f0f4f8] border-2 border-indigo-200/60 p-5 rounded-3xl space-y-3 shadow-inner">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-700 animate-pulse" />
          <span className="text-[11px] font-black text-indigo-950">هندسة المسار بذكاء مدارج الاصطناعي (AI Suggested Flow Architect)</span>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="صف مسار الأتمتة المخصص، (مثلاً: مطابقة كشف الحساب البنكي شهرياً مع القيود الدفترية لبوابات SOCPA)"
            className="flex-1 bg-white border border-zinc-300 rounded-xl px-4 py-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 text-right text-zinc-900 shadow-sm"
          />
          <button
            onClick={generateAiCustomWorkflow}
            disabled={isAiGenerating || !aiPrompt.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-6 py-3 rounded-xl transition-all shadow-md shrink-0 disabled:opacity-45 flex items-center justify-center gap-1.5"
          >
            {isAiGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : "بناء المسار 🧠"}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-indigo-100 mt-2">
          {[
            "أتمتة إخطار فروقات القيمة المضافة لمدراء الضرائب وإرسال SMS تذكيرية",
            "ربط فواتير ZATCA مع نظام ERP وتفعيل شروط الملاءمة",
            "شرط فحص ملاءة التغطية المالية والاستشاري المعتمد SOCPA قبل الصرف"
          ].map((presetText, idx) => (
            <button
              key={idx}
              onClick={() => setAiPrompt(presetText)}
              className="bg-white hover:bg-indigo-50 border border-zinc-200 text-[10px] font-bold text-indigo-950 px-3 py-1.5 rounded-lg transition-all"
            >
              🚀 {presetText}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Canvas Zone */}
      <div 
        ref={gridRef}
        onMouseMove={handleGridMouseMove}
        onTouchMove={handleGridTouchMove}
        onMouseUp={handleDragEnd}
        onTouchEnd={handleDragEnd}
        className="relative w-full h-[480px] border-2 border-zinc-200 bg-[#fafafa] rounded-3xl overflow-hidden cursor-crosshair select-none shadow-sm"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
          backgroundSize: "20px 20px"
        }}
      >
        {/* SVG Bezier lines */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
          <defs>
            <linearGradient id="gradient-flow-custom" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>
          {customWorkflow.edges?.map((edge: any, i: number) => {
            const pathD = drawEdge(edge.from, edge.to);
            if (!pathD) return null;
            return (
              <g key={i}>
                <path 
                  d={pathD} 
                  stroke="#e2e8f0" 
                  strokeWidth="4" 
                  fill="none" 
                />
                <path 
                  d={pathD} 
                  stroke="url(#gradient-flow-custom)" 
                  strokeWidth="3.2" 
                  fill="none" 
                  strokeDasharray="8 6" 
                  className="animate-dash"
                />
              </g>
            );
          })}
        </svg>

        {/* Empty state instruction overlay */}
        {customWorkflow.nodes.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-[#fafafa]/50 pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 shadow-inner mb-3">
              <Blocks className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-sm font-black text-zinc-700">مساحة عمل مصمم الأتمتة المخصصة فارغة</h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm leading-relaxed font-bold">
              ابدأ بالنقر على العناصر من <strong className="text-indigo-600">لوحة العقد الجانبية</strong> لإدراجها وتوصيلها تلقائياً، أو صف فكرة الأتمتة للذكاء الاصطناعي لتخطيطها فورياً.
            </p>
          </div>
        )}

        {/* Node cards rendering inside viewport */}
        {customWorkflow.nodes.map((node: any) => {
          const isNodeSimActive = activeCustomNodeSimIndex === node.id;
          return (
            <div
              key={node.id}
              onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
              onTouchStart={(e) => handleNodeTouchStart(e, node.id)}
              style={{
                position: "absolute",
                left: `${node.x}px`,
                top: `${node.y}px`,
              }}
              className={`w-60 bg-white/95 backdrop-blur border-2 rounded-2xl p-3.5 shadow-md flex items-start gap-3 transition-all z-10 ${
                isNodeSimActive 
                  ? "border-emerald-500 ring-4 ring-emerald-500/25 shadow-lg scale-[1.03]" 
                  : String(draggedNodeId) === node.id 
                  ? "border-indigo-500 cursor-grabbing shadow-xl scale-95" 
                  : "border-zinc-200 cursor-grab hover:border-zinc-300 hover:shadow-md"
              }`}
            >
              {isNodeSimActive && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              )}

              {/* Icon component */}
              <div className={`p-2.5 rounded-xl shrink-0 ${
                node.type === 'trigger' ? 'bg-rose-50 text-rose-600' :
                node.type === 'condition' ? 'bg-amber-50 text-amber-600' :
                'bg-indigo-50 text-indigo-600'
              }`}>
                {node.iconName === 'Play' ? <Play className="w-4 h-4 fill-current" /> : 
                 node.iconName === 'Clock' ? <Clock className="w-4 h-4" /> : 
                 node.iconName === 'Database' ? <Database className="w-4 h-4" /> : 
                 node.iconName === 'ShieldAlert' ? <ShieldAlert className="w-4 h-4" /> : 
                 node.iconName === 'Mail' ? <Mail className="w-4 h-4" /> : 
                 node.iconName === 'FileText' ? <FileText className="w-4 h-4" /> : 
                 node.iconName === 'Send' ? <Send className="w-4 h-4" /> : 
                 node.iconName === 'Cpu' ? <Cpu className="w-4 h-4 animate-spin-slow" /> : 
                 node.iconName === 'AlertTriangle' ? <AlertTriangle className="w-4 h-4" /> : 
                 <Zap className="w-4 h-4" />}
              </div>

              {/* Node text */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-black text-zinc-950 leading-none">{node.nameAr || node.name}</h4>
                <p className="text-[10px] text-zinc-500 font-bold mt-1.5 leading-normal">{node.descAr || node.desc}</p>
                <span className="inline-block mt-2 bg-zinc-50 border border-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded text-[8px] font-semibold">{node.type}</span>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteCustomNode(node.id);
                }}
                className="text-zinc-300 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors shrink-0 self-start"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Downward Logger */}
      <div className="border border-zinc-200/80 p-5 rounded-3xl bg-zinc-50 space-y-2">
        <h3 className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1.5">
          <Database className="w-4 h-4" /> مسجل أحداث محرك الأتمتة المخصص (Custom Console Logger)
        </h3>
        <div className="bg-zinc-950 text-zinc-400 p-4 rounded-2xl font-mono text-[10px] max-h-40 overflow-y-auto space-y-1 text-right" dir="rtl">
          {customSimLogs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-zinc-750 font-black">■</span>
              <p className="flex-1 text-zinc-300 select-all leading-normal">{log}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
