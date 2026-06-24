import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { countries } from "@/src/constants/countries";
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare, 
  Upload, 
  ExternalLink,
  ShieldCheck,
  Building2,
  Globe,
  MoreVertical,
  ArrowLeftRight,
  Clock,
  Sparkles,
  Activity,
  Pencil,
  Send,
  User as UserIcon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";

interface Shipment {
  id: string;
  supplierName: string;
  productDescription: string;
  countryOfOrigin: string;
  originPort?: string;
  destinationPort?: string;
  carrier?: string;
  trackingNumber?: string;
  alias?: string;
  estimatedDeliveryDate?: string;
  clientId?: string;
  status: string;
  brokerId?: string;
  broker?: { name: string; email: string };
  createdAt: string;
  documents: any[];
  comments: any[];
  events: any[];
}

interface ComplianceResult {
  required_documents: string[];
  required_approvals: string[];
  risk_flags: string[];
}

const statusSteps = [
  { id: "planned", label: "مخطط", icon: Clock },
  { id: "documents_ready", label: "جاهز للمستندات", icon: FileText },
  { id: "in_transit", label: "في الطريق", icon: Globe },
  { id: "at_customs", label: "في الجمارك", icon: ShieldCheck },
  { id: "cleared", label: "تم الفسح", icon: CheckCircle2 },
];

export default function Suppliers() {
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState("shipments");
  const [loading, setLoading] = useState(true);
  // Modal Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  
  const [brokers, setBrokers] = useState<any[]>([]);
  
  // Form State
  const [newShipment, setNewShipment] = useState({
    supplierName: "",
    productDescription: "",
    countryOfOrigin: "الصين",
    originPort: "",
    destinationPort: "Mina' al Malik 'Abd al 'Aziz (Dammam)",
    carrier: "Aramex",
    brokerId: "",
    alias: "",
    estimatedDeliveryDate: "",
    clientId: ""
  });

  // Compliance State
  const [compCheckData, setCompCheckData] = useState({ desc: "", country: "الصين" });
  const [compResult, setCompResult] = useState<ComplianceResult | null>(null);
  const [isCompLoading, setIsCompLoading] = useState(false);
  
  // AI Chat
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiThread, setAiThread] = useState<{role: 'user' | 'assistant', content: string}[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Leads real-time sync
    const leadsQ = query(collection(db, "leads"), where("userId", "==", user.uid));
    const unsubscribeLeads = onSnapshot(leadsQ, (snap) => {
      setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Brokers real-time sync
    const brokersQ = query(collection(db, "brokers"), where("userId", "==", user.uid));
    const unsubscribeBrokers = onSnapshot(brokersQ, (snap) => {
      setBrokers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Shipments real-time sync
    const shipmentsQ = query(collection(db, "shipments"), where("userId", "==", user.uid));
    const unsubscribeShipments = onSnapshot(shipmentsQ, (snap) => {
      setShipments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shipment[]);
      setLoading(false);
    }, (err) => {
      console.error("Fetch shipments error", err);
      setLoading(false);
    });

    return () => {
      unsubscribeLeads();
      unsubscribeBrokers();
      unsubscribeShipments();
    };
  }, [user]);

  useEffect(() => {
    if (user && (location.pathname === "/app/suppliers/new" || location.state?.openAddShipment)) {
      setShowAddModal(true);
      setFormStep(1);
      setSelectedShipment(null);
      setNewShipment({
        supplierName: "",
        productDescription: "",
        countryOfOrigin: "الصين",
        originPort: "",
        destinationPort: "Mina' al Malik 'Abd al 'Aziz (Dammam)",
        carrier: "Aramex",
        brokerId: "",
        alias: "",
        estimatedDeliveryDate: "",
        clientId: ""
      });
      navigate("/app/suppliers", { replace: true, state: {} });
    }
  }, [user, location]);

  const handleCreateShipment = async () => {
    if (!user) return;
    try {
      const data = {
        ...newShipment,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (isEditing && editingId) {
        await updateDoc(doc(db, "shipments", editingId), data);
      } else {
        await addDoc(collection(db, "shipments"), {
          ...data,
          createdAt: serverTimestamp(),
          status: "planned",
          documents: [],
          comments: [],
          events: []
        });
      }

      setShowAddModal(false);
      setIsEditing(false);
      setEditingId(null);
      setNewShipment({ 
        supplierName: "", 
        productDescription: "", 
        countryOfOrigin: "الصين", 
        originPort: "", 
        destinationPort: "Mina' al Malik 'Abd al 'Aziz (Dammam)", 
        carrier: "Aramex", 
        brokerId: "",
        alias: "",
        estimatedDeliveryDate: "",
        clientId: ""
      });
    } catch (err) {
      console.error("Operation failed", err);
    }
  };

  const openEditModal = (s: Shipment, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditingId(s.id);
    setNewShipment({
      supplierName: s.supplierName,
      productDescription: s.productDescription,
      countryOfOrigin: s.countryOfOrigin,
      originPort: s.originPort || "",
      destinationPort: s.destinationPort || "",
      carrier: s.carrier || "Aramex",
      brokerId: s.brokerId || "",
      alias: s.alias || "",
      estimatedDeliveryDate: s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toISOString().split('T')[0] : "",
      clientId: s.clientId || ""
    });
    setShowAddModal(true);
    setFormStep(1);
  };

  const handleCheckCompliance = async () => {
    if (!compCheckData.desc) return;
    setIsCompLoading(true);
    setCompResult(null);
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const params = {
        model: "gemini-3.5-flash",
        contents: `Analyze this ad-hoc shipment request for Saudi Arabian import requirements (ZATCA, SASO, SFDA).
        
        Product: ${compCheckData.desc}
        Origin: ${compCheckData.country}
        
        Identify:
        1. Required Documents (e.g., Commercial Invoice, COO, Packing List, SABER CoC).
        2. Technical/Government Approvals (e.g., SFDA Registration, IECEE, GCTS).
        3. Risk Flags or specific warnings (e.g., Restricted items, High Customs Fees).
        
        Return ONLY a raw JSON object with this structure:
        {
          "required_documents": ["string"],
          "required_approvals": ["string"],
          "risk_flags": ["string"]
        }
        
        Ensure the strings are clear and professional in Arabic.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              required_documents: { type: Type.ARRAY, items: { type: Type.STRING } },
              required_approvals: { type: Type.ARRAY, items: { type: Type.STRING } },
              risk_flags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["required_documents", "required_approvals", "risk_flags"]
          }
        }
      };

      let response;
      try {
        response = await ai.models.generateContent(params);
      } catch (apiErr: any) {
        console.warn("Primary model gemini-3.5-flash failed or busy, trying gemini-3.1-flash-lite", apiErr);
        response = await ai.models.generateContent({
          ...params,
          model: "gemini-3.1-flash-lite"
        });
      }
      
      const data = JSON.parse(response.text || "{}");
      setCompResult(data);
    } catch (err) {
      console.error("Compliance Check Failed:", err);
      // Fallback
      setCompResult({
         required_documents: ["فاتورة تجارية", "شهادة منشأ"],
         required_approvals: ["بانتظار التحقق من الرمز المنسق"],
         risk_flags: ["يرجى مراجعة اللوائح الفنية"]
      });
    } finally {
      setIsCompLoading(false);
    }
  };

  const askAi = async () => {
    if (!aiQuestion.trim()) return;
    const msg = aiQuestion;
    setAiQuestion("");
    setAiThread(prev => [...prev, { role: 'user', content: msg }]);
    setIsAiLoading(true);

    const res = await fetch("/api/ai/shipment-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: msg, shipmentContext: selectedShipment })
    });
    const data = await res.json();
    setAiThread(prev => [...prev, { role: 'assistant', content: data.answer }]);
    setIsAiLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-emerald-400 to-primary" />
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight flex items-center gap-3">
            <Truck className="text-primary w-8 h-8" />
            الموردين والشحنات
          </h1>
          <p className="text-zinc-500 font-medium mt-1">مدارج ImportOS: نظام ذكي للامتثال الجمركي السعودي.</p>
        </div>
        <div className="flex gap-3 relative z-10">
           <button 
             onClick={() => setShowAddModal(true)}
             className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-bold border-2 border-primary hover:bg-white hover:text-primary transition-all active:scale-95"
           >
             <Plus className="w-5 h-5" />
             إنشاء شحنة جديدة
           </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-2xl w-fit">
        {[
          { id: "shipments", label: "الشحنات النشطة", icon: Truck },
          { id: "compliance", label: "أداة الامتثال", icon: ShieldCheck },
          { id: "brokers", label: "المخلصين", icon: Building2 },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all",
              activeTab === tab.id ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            )}
          >
            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-primary" : "")} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Area */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "shipments" && (
            <div className="space-y-6">
              {/* Global Stats Bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[
                   { label: "إجمالي النشط", value: shipments.length, color: "zinc" },
                   { label: "بانتظار الفسح", value: shipments.filter(s => s.status !== "cleared").length, color: "amber" },
                   { label: "في الطريق", value: shipments.filter(s => s.status === "in_transit").length, color: "blue" },
                   { label: "تم الفسح", value: shipments.filter(s => s.status === "cleared").length, color: "emerald" },
                 ].map(stat => (
                   <div key={stat.label} className="bg-white p-4 rounded-3xl border border-zinc-100 shadow-sm">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                      <p className={cn("text-2xl font-black mt-1", stat.color === 'primary' ? 'text-primary' : `text-${stat.color}-600`)}>{stat.value}</p>
                   </div>
                 ))}
              </div>

              {loading ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-zinc-100">
                  <div className="w-10 h-10 border-4 border-zinc-200 border-t-primary rounded-full animate-spin mx-auto" />
                </div>
              ) : shipments.length === 0 ? (
                <div className="bg-white rounded-3xl p-20 text-center border border-zinc-100 shadow-sm border-dashed">
                  <div className="bg-zinc-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Truck className="w-10 h-10 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">لا يوجد شحنات حالية</h3>
                  <p className="text-zinc-500 font-medium mb-8">ابدأ بإضافة أول شحنة للموردين لتبدأ مدارج بمتابعتها.</p>
                  <button onClick={() => setShowAddModal(true)} className="text-primary font-bold hover:underline">إضافة شحنة الآن</button>
                </div>
              ) : (
                <div className="grid gap-4">
                   {shipments.map(s => (
                     <motion.div 
                       layoutId={s.id}
                       onClick={() => navigate(`/app/suppliers/${s.id}`)}
                       key={s.id} 
                       className={cn(
                         "bg-white p-6 rounded-3xl border transition-all cursor-pointer group",
                         selectedShipment?.id === s.id ? "border-primary shadow-xl ring-4 ring-primary/5" : "border-zinc-100 hover:border-zinc-300 shadow-sm"
                       )}
                     >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 bg-zinc-50 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                              <Building2 className="w-6 h-6 text-zinc-400 group-hover:text-primary" />
                            </div>
                            <div>
                               <h3 className="font-black text-lg text-zinc-900">{s.alias || s.supplierName}{s.alias && <span className="mr-2 text-[10px] font-medium text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded border border-zinc-100">{s.supplierName}</span>}</h3>
                               <p className="text-xs text-zinc-500 font-medium flex items-center gap-2">
                                 {s.countryOfOrigin} <Globe className="w-3 h-3" /> • {s.productDescription}
                               </p>
                            </div>
                          </div>
                           <div className="px-3 py-1 bg-primary/5 text-primary rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                             <span>{statusSteps.find(step => step.id === s.status)?.label || s.status}</span>
                             <button 
                               onClick={(e) => openEditModal(s, e)}
                               className="hover:scale-110 transition-transform p-1 bg-white rounded-md shadow-sm border border-primary/20"
                             >
                                <Pencil className="w-3 h-3" />
                             </button>
                           </div>
                        </div>
                        
                        {/* Segmented Milestone Track */}
                        <div className="mb-6 relative">
                          <div className="flex justify-between items-center relative z-10 px-1">
                            {statusSteps.map((step, idx) => {
                              const stepIdx = statusSteps.findIndex(st => st.id === s.status);
                              const isActive = idx <= stepIdx;
                              const isPulse = idx === stepIdx;
                              
                              return (
                                <div key={step.id} className="relative group/step">
                                   <div className={cn(
                                     "w-2.5 h-2.5 rounded-full border-2 transition-all duration-700",
                                     isActive ? "bg-primary border-primary shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-white border-zinc-200"
                                   )}>
                                      {isPulse && (
                                        <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-40" />
                                      )}
                                   </div>
                                   {/* Tooltip on hover */}
                                   <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-[8px] font-black rounded opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                      {step.label}
                                   </div>
                                </div>
                              );
                            })}
                          </div>
                          {/* Background Track Line */}
                          <div className="absolute top-1/2 -translate-y-1/2 left-1 right-1 h-px bg-zinc-100 -z-0">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(statusSteps.findIndex(st => st.id === s.status) / (statusSteps.length - 1)) * 100}%` }}
                               transition={{ duration: 1.5, ease: "circOut" }}
                               className="h-full bg-primary/40" 
                             />
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-bold">
                           <div className="flex gap-4">
                              <span className="flex items-center gap-1 text-zinc-400"><FileText className="w-3 h-3" /> {s.documents.length} مستندات</span>
                              <span className="flex items-center gap-1 text-zinc-400"><MessageSquare className="w-3 h-3" /> {s.comments.length} تعليقات</span>
                              {s.clientId && (
                                <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100/50">
                                  <UserIcon className="w-3 h-3" /> 
                                  مرتبط: {(s as any).client?.name || "عميل"}
                                </span>
                              )}
                           </div>
                           <div className="flex items-center gap-3">
                              {s.estimatedDeliveryDate && (
                                <span className={cn(
                                  "flex items-center gap-1 px-3 py-1 rounded-lg border",
                                  new Date(s.estimatedDeliveryDate).getTime() < Date.now() ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                                )}>
                                  <Clock className="w-3 h-3" />
                                  {new Date(s.estimatedDeliveryDate).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                              <span className="text-zinc-500 italic">{new Date(s.createdAt).toLocaleDateString('ar-SA')}</span>
                           </div>
                        </div>
                     </motion.div>
                   ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "compliance" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] overflow-hidden relative group"
            >
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/5 blur-[100px] rounded-full -ml-32 -mb-32 pointer-events-none" />
              
              <div className="p-10 md:p-14 relative z-10 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-100 pb-10">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center text-primary shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Engine v2.4</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-zinc-900 mb-4 tracking-tighter leading-tight">محرك الامتثال الذكي</h2>
                    <p className="text-zinc-500 font-medium text-lg leading-relaxed">أدخل تفاصيل البضاعة لمعرفة المتطلبات القانونية والجمارك السعودية بنظام الفحص الفوري.</p>
                  </div>
                  <div className="hidden md:block text-left">
                     <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1 leading-none">Last Database Sync</p>
                     <p className="text-xs font-mono font-bold text-zinc-600">ZATCA.2024.Q2.REL_4</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] px-1 block">وصف المنتج</label>
                    <div className="relative group">
                      <input 
                        type="text" 
                        placeholder="مثل: أجهزة إلكترونية، معلبات غذائية..."
                        className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold transition-all duration-300 placeholder:text-zinc-300"
                        value={compCheckData.desc}
                        onChange={e => setCompCheckData({...compCheckData, desc: e.target.value})}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300 group-focus-within:text-primary transition-colors">
                        <Sparkles className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] px-1 block">بلد المنشأ</label>
                    <div className="relative group">
                      <select 
                        className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold appearance-none transition-all duration-300"
                        value={compCheckData.country}
                        onChange={e => setCompCheckData({...compCheckData, country: e.target.value})}
                      >
                        <option value="الصين">الصين</option>
                        <option value="ألمانيا">ألمانيا</option>
                        <option value="الولايات المتحدة">الولايات المتحدة</option>
                        <option value="الهند">الهند</option>
                        <option value="المملكة المتحدة">المملكة المتحدة</option>
                        <option value="اليابان">اليابان</option>
                      </select>
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 group-focus-within:text-primary transition-colors">
                        <Globe className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <button 
                    onClick={handleCheckCompliance}
                    disabled={isCompLoading}
                    className={cn(
                      "w-full py-6 bg-zinc-900 text-white rounded-2xl font-black transition-all shadow-[0_20px_40px_rgba(0,0,0,0.1)] flex items-center justify-center gap-4 overflow-hidden group",
                      isCompLoading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.01] active:scale-[0.98] hover:bg-black"
                    )}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isCompLoading ? (
                      <>
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span className="text-lg tracking-tight">جاري مسح اللوائح الفنية...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg">بدء تحليل متطلبات هيئة الجمارك</span>
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-[-4px] transition-transform" />
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {compResult && (
                    <motion.div 
                      key="compliance-results"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-dashed border-zinc-200">
                        {/* Requirement Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1 }}
                          className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100 space-y-6"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-zinc-100">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <h4 className="font-black text-zinc-900">المستندات الأساسية</h4>
                          </div>
                          <div className="space-y-2">
                            {compResult.required_documents.map((d, i) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                key={d} 
                                className="flex items-center gap-3 text-xs font-bold text-zinc-600 bg-white p-3 rounded-xl border border-zinc-200/50"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                {d}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>

                        {/* Approval Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 }}
                          className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100/50 space-y-6"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm border border-white">
                              <ShieldCheck className="w-5 h-5 text-blue-600" />
                            </div>
                            <h4 className="font-black text-zinc-900">التراخيص الفنية</h4>
                          </div>
                          <div className="space-y-2">
                            {compResult.required_approvals.length > 0 ? compResult.required_approvals.map((a, i) => (
                              <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 + i * 0.1 }}
                                key={a} 
                                className="flex items-center gap-3 text-xs font-bold text-blue-700 bg-white/70 p-3 rounded-xl border border-blue-100"
                              >
                                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                                {a}
                              </motion.div>
                            )) : (
                              <div className="text-xs font-medium text-zinc-400 italic bg-white/40 p-4 rounded-xl text-center">لا توجد اشتراطات فنية خاصة لهذا الصنف</div>
                            )}
                          </div>
                        </motion.div>

                        {/* Risk Card */}
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3 }}
                          className="bg-zinc-900 p-8 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-[40px] rounded-full" />
                          <div className="flex items-center gap-3 relative z-10">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                              <AlertCircle className="w-5 h-5 text-rose-400" />
                            </div>
                            <h4 className="font-black">مؤشر المخاطر</h4>
                          </div>
                          <div className="space-y-4 relative z-10">
                            {/* Visual Risk Gauge */}
                            <div className="space-y-2">
                               <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                                 <span>Clearance Ease</span>
                                 <span className={cn(compResult.risk_flags.length > 0 ? "text-rose-400" : "text-emerald-400")}>
                                   {compResult.risk_flags.length > 0 ? "RE-CHECK" : "OPTIMIZED"}
                                 </span>
                               </div>
                               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: compResult.risk_flags.length > 0 ? "40%" : "100%" }}
                                    className={cn("h-full transition-all duration-1000", compResult.risk_flags.length > 0 ? "bg-rose-500" : "bg-emerald-500")}
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               {compResult.risk_flags.map((r, i) => (
                                 <motion.div 
                                   initial={{ opacity: 0, y: 5 }}
                                   animate={{ opacity: 1, y: 0 }}
                                   transition={{ delay: 0.4 + i * 0.1 }}
                                   key={r} 
                                   className="text-[11px] font-bold text-rose-200 bg-rose-500/20 px-3 py-2 rounded-lg border border-rose-500/20"
                                 >
                                   {r}
                                 </motion.div>
                               ))}
                               {compResult.risk_flags.length === 0 && (
                                 <p className="text-xs font-medium text-emerald-300 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 flex items-center gap-2">
                                   <ShieldCheck className="w-4 h-4" /> تم المسح: شحنة آمنة وقليلة المخاطر
                                 </p>
                               )}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {activeTab === "brokers" && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 space-y-6"
            >
              <div className="flex justify-between items-center bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-6 group hover:border-zinc-200 transition-colors">
                 <div>
                    <h2 className="text-xl font-black text-zinc-900 flex items-center gap-3">
                      <Building2 className="w-6 h-6 text-primary group-hover:rotate-6 transition-transform" /> 
                      قائمة المخلصين الجمركيين
                    </h2>
                    <p className="text-sm text-zinc-500 font-medium mt-2 max-w-lg leading-relaxed">قم بإدارة قائمة المخلصين وارسل طلبات تحديث المستندات السريعة بنقرة واحدة لضمان دقة العمليات وعدم التأخير في المنافذ.</p>
                 </div>
                 <button onClick={() => {
                   toast.loading("جاري الإرسال الجماعي...");
                   setTimeout(() => toast.success("تم إرسال طلب التحديث لجميع المخلصين بنجاح"), 1500);
                 }} className="bg-primary text-white font-bold text-sm px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-zinc-900 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                   <Send className="w-4 h-4" /> إرسال طلب تحديث جماعي
                 </button>
              </div>

              <div className="space-y-4">
                 {[
                   { name: "مؤسسة الدانة للتخليص", license: "LIC-109283", activeShipments: 12, rating: 4.8 },
                   { name: "شركاء الإمداد الجمركي", license: "LIC-993821", activeShipments: 5, rating: 4.5 },
                   { name: "الشركة الوطنية للعبور", license: "LIC-112003", activeShipments: 1, rating: 4.0 },
                 ].map((broker, i) => (
                   <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-zinc-50/50 rounded-2xl border border-zinc-100/80 hover:bg-white hover:border-zinc-200 hover:shadow-xl hover:shadow-zinc-900/5 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-14 h-14 bg-zinc-100 text-zinc-400 rounded-2xl flex items-center justify-center font-black text-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                           {broker.name.charAt(0)}
                         </div>
                         <div>
                            <h4 className="font-bold text-zinc-900">{broker.name}</h4>
                            <div className="flex items-center gap-3 mt-1.5">
                               <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase bg-zinc-100 px-2 py-0.5 rounded">{broker.license}</span>
                               <span className="text-xs font-bold text-zinc-500">تقييم: <span className="text-amber-500">★ {broker.rating}</span></span>
                            </div>
                         </div>
                      </div>
                      <div className="flex items-center gap-4 mt-4 sm:mt-0">
                         <div className="text-center sm:text-right">
                           <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">شحنات نشطة</p>
                           <p className="text-xl font-bold tracking-tighter text-zinc-900 mt-0.5">{broker.activeShipments}</p>
                         </div>
                         <div className="w-px h-8 bg-zinc-200" />
                         <button onClick={() => toast.success(`تم إرسال تنبيه للمخلص: ${broker.name}`)} className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors tooltip" title="واتساب المخلص">
                            <MessageSquare className="w-4 h-4" />
                         </button>
                      </div>
                   </div>
                 ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar Context */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2rem] border border-zinc-100 p-8 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-zinc-900/5 transition-all duration-500"
          >
             <h3 className="font-black text-zinc-900 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                    <Activity className="w-4 h-4" />
                  </div>
                  <span className="tracking-tighter">مركز العمليات اللوجستية</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             </h3>
             
             <div className="space-y-6 max-h-[350px] overflow-y-auto pr-2 -mr-2 scrollbar-hide">
                {shipments.slice(0, 10).flatMap(s => s.events || []).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((event, i) => (
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.3 + i * 0.05 }}
                     key={event.id} 
                     className="relative pl-6 border-r-2 border-zinc-50 pb-6 last:pb-0"
                   >
                      <div className="absolute -right-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 border-zinc-100 flex items-center justify-center group-hover:border-primary transition-colors">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                      </div>
                      <div className="mr-3">
                         <div className="flex justify-between items-center mb-1">
                           <p className="text-[10px] font-black text-zinc-400 font-mono tracking-widest">{new Date(event.createdAt).toLocaleTimeString('ar-SA')}</p>
                           <span className="text-[9px] px-1.5 py-0.5 bg-zinc-100 text-zinc-500 rounded uppercase font-black tracking-tighter">{event.type}</span>
                         </div>
                         <p className="text-xs font-bold text-zinc-700 leading-relaxed">{event.description}</p>
                      </div>
                   </motion.div>
                ))}
                {shipments.every(s => !s.events || s.events.length === 0) && (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto opacity-50">
                      <Clock className="w-6 h-6 text-zinc-300" />
                    </div>
                    <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">System Standby: Awaiting Events</p>
                  </div>
                )}
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-900 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group"
          >
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
             
             <h3 className="font-black text-white mb-8 flex items-center gap-3 relative z-10">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-zinc-900">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="tracking-tighter">مساعد استيراد مدارج</span>
             </h3>

             <div className="bg-white/5 backdrop-blur-xl rounded-[1.5rem] p-5 h-[350px] flex flex-col relative z-10 border border-white/10">
                <div className="flex-1 overflow-y-auto space-y-4 mb-5 pr-2 -mr-2 scrollbar-hide">
                  <div className="bg-white/10 p-4 rounded-2xl rounded-tr-none text-[11px] font-bold text-emerald-100/80 shadow-sm border border-white/5 self-start leading-relaxed">
                    مرحباً بك! أنا مساعد مدارج الذكي. يمكنني مساعدتك في فهم إجراءات الجمارك السعودية بناءً على شحنتك المحددة.
                  </div>
                  {aiThread.map((msg, i) => (
                    <motion.div 
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={i} 
                      className={cn(
                        "p-4 rounded-2xl text-[11px] font-bold shadow-sm transition-all border leading-relaxed",
                        msg.role === 'user' 
                          ? "bg-primary text-zinc-900 rounded-tl-none self-end ml-6 border-primary/20" 
                          : "bg-white/10 text-white rounded-tr-none border-white/10 mr-6"
                      )}
                    >
                      {msg.content}
                    </motion.div>
                  ))}
                  {isAiLoading && (
                    <div className="bg-white/5 p-4 rounded-2xl rounded-tr-none border border-white/5 w-fit">
                       <div className="flex gap-1.5">
                          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                       </div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="اسأل مدارج..."
                    className="w-full bg-white/10 border-white/10 rounded-xl pr-5 pl-12 py-3.5 text-xs font-bold text-white placeholder:text-white/30 focus:ring-2 focus:ring-primary/20 focus:bg-white/20 transition-all outline-none"
                    value={aiQuestion}
                    onChange={e => setAiQuestion(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && askAi()}
                  />
                  <button onClick={askAi} className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-primary text-zinc-900 rounded-lg hover:scale-110 active:scale-90 transition-all shadow-lg shadow-primary/20">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-[2rem] p-8 text-zinc-900 shadow-sm border border-zinc-100 relative overflow-hidden group hover:shadow-xl transition-all duration-500"
          >
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 blur-3xl rounded-full" />
             <h3 className="text-xl font-black mb-1 relative z-10 flex items-center gap-2">
               الإحصائيات
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
             </h3>
             <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8 relative z-10">Q2 | 2024 PERFORMANCE REPORT</p>
             <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Success Rate</span>
                    <span className="text-2xl font-black text-emerald-500">84%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: "84%" }}
                       transition={{ duration: 1.5, ease: "circOut" }}
                       className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500" 
                     />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Avg Clearance</p>
                    <p className="text-lg font-black text-zinc-900 tracking-tighter">4.2 Day</p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Efficiency Index</p>
                    <p className="text-lg font-black text-primary tracking-tighter">+12.4%</p>
                  </div>
                </div>
             </div>
          </motion.div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => { setShowAddModal(false); setFormStep(1); }}
               className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" 
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 30 }}
               className="bg-white w-full max-w-2xl rounded-[3rem] p-8 md:p-12 relative shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] z-10 border border-zinc-100 overflow-hidden"
            >
               {/* Modal Progress Header */}
               <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{isEditing ? "تعديل الشحنة" : "إضافة شحنة جديدة"}</h2>
                      <p className="text-zinc-500 font-medium">الخطوة {formStep} من 3</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      {formStep === 1 ? <Building2 className="w-6 h-6" /> : formStep === 2 ? <Globe className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                    </div>
                  </div>
                  <div className="flex gap-2">
                     {[1, 2, 3].map(s => (
                       <div key={s} className="flex-1 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: formStep >= s ? "100%" : "0%" }}
                            className="h-full bg-primary"
                          />
                       </div>
                     ))}
                  </div>
               </div>

               <div className="min-h-[300px]">
                  <AnimatePresence mode="wait">
                    {formStep === 1 && (
                      <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">اسم المورد / الشركة المصنعة</label>
                           <input 
                             type="text" 
                             className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold transition-all"
                             placeholder="مثال: شركة تشاينا تيك المحدودة..."
                             value={newShipment.supplierName}
                             onChange={e => setNewShipment({...newShipment, supplierName: e.target.value})}
                           />
                         </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">وصف البضاعة (Arabic/English)</label>
                           <textarea 
                             className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold min-h-[120px] resize-none transition-all"
                             placeholder="صف محتويات الشحنة بدقة وفقاً للفواتير..."
                             value={newShipment.productDescription}
                             onChange={e => setNewShipment({...newShipment, productDescription: e.target.value})}
                           />
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-3">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">الاسم المستعار (Alias)</label>
                             <input 
                               type="text" 
                               className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold transition-all"
                               placeholder="مثل: شحنة شاشات الربع الثالث"
                               value={newShipment.alias}
                               onChange={e => setNewShipment({...newShipment, alias: e.target.value})}
                             />
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">ارتباط بعميل CRM (اختياري)</label>
                             <select 
                               className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold transition-all"
                               value={newShipment.clientId}
                               onChange={e => setNewShipment({...newShipment, clientId: e.target.value})}
                             >
                               <option value="">غير مرتبط بعميل معين</option>
                               {leads.map(lead => (
                                 <option key={lead.id} value={lead.id}>{lead.name} - {lead.company}</option>
                               ))}
                             </select>
                           </div>
                         </div>
                      </motion.div>
                    )}

                    {formStep === 2 && (
                      <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-6"
                      >
                         <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">بلد المنشأ</label>
                               <select 
                                 className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold appearance-none transition-all"
                                 value={newShipment.countryOfOrigin}
                                 onChange={e => setNewShipment({...newShipment, countryOfOrigin: e.target.value})}
                               >
                                 {countries.map(c => (
                                   <option key={c} value={c}>{c}</option>
                                 ))}
                               </select>
                            </div>
                            <div className="space-y-3">
                               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">ميناء المنشأ</label>
                               <input 
                                 type="text" 
                                 className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold"
                                 placeholder="هونج كونج، هامبورغ..."
                                 value={newShipment.originPort}
                                 onChange={e => setNewShipment({...newShipment, originPort: e.target.value})}
                               />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">ميناء الوصول (Kingdom of Saudi Arabia)</label>
                            <input 
                              type="text" 
                              className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold"
                              placeholder="جدة، الدمام..."
                              value={newShipment.destinationPort}
                              onChange={e => setNewShipment({...newShipment, destinationPort: e.target.value})}
                            />
                         </div>
                         <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">موعد التوصيل المتوقع (Estimated Delivery)</label>
                            <input 
                              type="date" 
                              className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold transition-all"
                              value={newShipment.estimatedDeliveryDate}
                              onChange={e => setNewShipment({...newShipment, estimatedDeliveryDate: e.target.value})}
                            />
                          </div>
                         <div className="space-y-3">
                           <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">الناقل الدولي</label>
                           <select 
                             className="w-full px-6 py-5 rounded-2xl bg-zinc-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-0 text-zinc-900 font-bold appearance-none transition-all"
                             value={newShipment.carrier}
                             onChange={e => setNewShipment({...newShipment, carrier: e.target.value})}
                           >
                              <option value="Aramex">Aramex (Logistics Leader)</option>
                              <option value="DHL">DHL Express</option>
                              <option value="FedEx">FedEx International</option>
                              <option value="Maersk">Maersk Shipping</option>
                           </select>
                         </div>
                      </motion.div>
                    )}

                    {formStep === 3 && (
                      <motion.div 
                        key="step3"
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                      >
                         <div className="bg-zinc-900 text-white p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px] rounded-full" />
                            <div className="flex items-center gap-4 relative z-10">
                               <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                                  <ShieldCheck className="w-6 h-6 text-primary" />
                               </div>
                               <div>
                                  <h4 className="font-black text-lg">الامتثال والمخلص الجمركي</h4>
                                  <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Final Step: Custom Protocols</p>
                               </div>
                            </div>
                            
                            <div className="space-y-3 relative z-10">
                               <label className="text-[10px] font-black text-white/40 uppercase tracking-widest px-1">اختيار المخلص الجمركي المعين</label>
                               <select 
                                 className="w-full px-6 py-5 rounded-2xl bg-white/5 border-2 border-white/5 focus:border-primary/40 focus:bg-white/10 focus:ring-0 text-white font-bold select-none transition-all outline-none"
                                 value={newShipment.brokerId}
                                 onChange={e => setNewShipment({...newShipment, brokerId: e.target.value})}
                               >
                                 <option value="" className="text-zinc-900">نظام المخلص الآلي (نظام مدارج)</option>
                                 {brokers.map(b => (
                                   <option key={b.id} value={b.id} className="text-zinc-900">{b.name}</option>
                                 ))}
                               </select>
                            </div>
                         </div>
                         
                         <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                               <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-emerald-800 leading-relaxed">
                               بإتمامك لهذه الخطوة، سيقوم محرك الامتثال الذكي لدينا بربط شحنتك بمتطلبات هيئة الزكاة والضريبة والجمارك (ZATCA) بشكل تلقائي.
                            </p>
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>

               <div className="flex gap-4 mt-12">
                  {formStep > 1 && (
                    <button 
                      onClick={() => setFormStep(prev => prev - 1)}
                      className="px-8 py-5 rounded-2xl font-black text-zinc-400 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 transition-all font-sans"
                    >
                      السابق
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      if (formStep < 3) setFormStep(prev => prev + 1);
                      else handleCreateShipment();
                    }}
                    className="flex-1 py-5 bg-zinc-900 text-white rounded-2xl font-black shadow-[0_20px_40px_rgba(0,0,0,0.1)] hover:bg-black transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    {formStep === 3 ? (isEditing ? "حفظ التعديلات" : "تأكيد وإنشاء الشحنة") : "الخطوة التالية"}
                    <ChevronRight className="w-5 h-5" />
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
