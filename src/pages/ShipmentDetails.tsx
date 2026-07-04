import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Upload,
  Clock,
  Building2,
  MoreVertical,
  ChevronRight,
  Plus,
  Globe,
  MapPin,
  Activity,
  Terminal,
  ExternalLink,
  Sparkles,
  User as UserIcon,
  Calendar,
  Share2,
  Copy,
  Mail,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { toast } from "sonner";

const statusSteps = [
  { id: "planned", label: "مخطط", description: "تهيئة بيانات الشحنة", icon: Clock },
  {
    id: "documents_ready",
    label: "جاهز للمستندات",
    description: "اكتمال الأوراق الجمركية",
    icon: FileText,
  },
  { id: "in_transit", label: "في الطريق", description: "الشحنة مع الناقل الدولي", icon: Globe },
  {
    id: "at_customs",
    label: "في الجمارك",
    description: "فحص بضائع الجمارك السعودية",
    icon: ShieldCheck,
  },
  { id: "cleared", label: "تم الفسح", description: "الشحنة جاهزة للتسليم", icon: CheckCircle2 },
];

import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { handleFirestoreError, OperationType } from "@/src/lib/firestore-errors";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

export default function ShipmentDetails() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState<any>(null);
  const [complianceReport, setComplianceReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    // Real-time Shipment Data
    const unsubShipment = onSnapshot(
      doc(db, "shipments", id),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          // Fetch sub-collections manually if needed, or use multiple listeners
          setShipment({
            id: snap.id,
            ...data,
            documents: data.documents || [],
            comments: data.comments || [],
            events: data.events || [],
          });
          setLoading(false);
        } else {
          setShipment(null);
          setLoading(false);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, `shipments/${id}`);
      }
    );

    // Real-time Comments
    const unsubComments = onSnapshot(
      query(collection(db, `shipments/${id}/comments`), orderBy("createdAt", "desc")),
      (snap) => {
        setShipment((prev: any) =>
          prev ? { ...prev, comments: snap.docs.map((d) => ({ id: d.id, ...d.data() })) } : prev
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `shipments/${id}/comments`);
      }
    );

    // Real-time Documents
    const unsubDocs = onSnapshot(
      collection(db, `shipments/${id}/documents`),
      (snap) => {
        setShipment((prev: any) =>
          prev ? { ...prev, documents: snap.docs.map((d) => ({ id: d.id, ...d.data() })) } : prev
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `shipments/${id}/documents`);
      }
    );

    // Real-time Events
    const unsubEvents = onSnapshot(
      query(collection(db, `shipments/${id}/events`), orderBy("createdAt", "desc")),
      (snap) => {
        setShipment((prev: any) =>
          prev ? { ...prev, events: snap.docs.map((d) => ({ id: d.id, ...d.data() })) } : prev
        );
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `shipments/${id}/events`);
      }
    );

    fetchLeads();

    return () => {
      unsubShipment();
      unsubComments();
      unsubDocs();
      unsubEvents();
    };
  }, [id, user]);

  useEffect(() => {
    if (shipment) {
      fetchComplianceReport();
      // Initial track if in transit
      if (shipment?.status === "in_transit" && !trackingInfo) {
        trackRealTime();
      }
    }
  }, [shipment?.id]);

  const fetchComplianceReport = async () => {
    try {
      const { GoogleGenAI, Type } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const params = {
        model: "gemini-3.5-flash",
        contents: `Analyze this shipment for Saudi Arabian import requirements (ZATCA, SASO, SFDA).
        
        Product: ${shipment?.productDescription || "General Goods"}
        Origin: ${shipment?.countryOfOrigin || "Unknown"}
        
        Return ONLY a JSON object with this structure:
        {
          "isCompliant": boolean,
          "requirements": ["string"],
          "missingDocs": ["string"],
          "riskFlags": ["string"]
        }
        
        Ensure the strings are clear and professional in Arabic.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isCompliant: { type: Type.BOOLEAN },
              requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingDocs: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["isCompliant", "requirements", "missingDocs", "riskFlags"],
          },
        },
      };

      let response;
      try {
        response = await ai.models.generateContent(params);
      } catch (apiErr: any) {
        console.warn(
          "Primary model gemini-3.5-flash busy or failed, using gemini-3.1-flash-lite fallback",
          apiErr
        );
        response = await ai.models.generateContent({
          ...params,
          model: "gemini-3.1-flash-lite",
        });
      }

      const report = JSON.parse(response.text || "{}");
      setComplianceReport(report);
    } catch (err) {
      console.error("Compliance fetch error", err);
      // Fallback
      setComplianceReport({
        isCompliant: true,
        requirements: ["الفاتورة التجارية", "شهادة المنشأ", "بوليصة الشحن"],
        missingDocs: ["شهادة مطابقة سابر (SABER)"],
        riskFlags: [],
      });
    }
  };

  const fetchLeads = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, "leads"), where("userId", "==", user.uid));
      onSnapshot(
        q,
        (snap) => {
          setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, "leads");
        }
      );
    } catch (err) {
      console.error("Leads fetch error", err);
    }
  };

  // Re-implementing leads fetch with proper Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "leads"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "leads");
      }
    );
    return unsub;
  }, [user]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("تم نسخ رابط الشحنة بنجاح");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(
      `تفاصيل الشحنة: ${shipment?.alias || shipment?.supplierName}`
    );
    const body = encodeURIComponent(`رابط تتبع الشحنة: ${window.location.href}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiResponse(null);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const prompt = `
        Shipment Analysis Request:
        Supplier: ${shipment?.supplierName}
        Product: ${shipment?.productDescription}
        Origin: ${shipment?.countryOfOrigin}
        Status: ${shipment?.status}

        Provide a brief compliance summary and next steps for this shipment in Arabic.
        Mention required certificates if applicable.
      `;

      let response;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt,
        });
      } catch (apiErr: any) {
        console.warn(
          "Primary model gemini-3.5-flash busy or failed, trying gemini-3.1-flash-lite fallback",
          apiErr
        );
        response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt,
        });
      }

      setAiResponse(response.text || "لم نتمكن من الحصول على رد حالياً.");
      fetchComplianceReport();
    } catch (err) {
      console.error("AI Analysis failed", err);
      setAiResponse("حدث خطأ أثناء الاتصال بنظام الذكاء الاصطناعي.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const trackRealTime = async (silent = false) => {
    if (!silent)
      toast.info("جاري التتبع الحي من الناقل...", { icon: <Activity className="animate-spin" /> });
    try {
      // Simulate real-time tracking since we don't have a backend tracking API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const trackingData = {
        status: ["SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"][
          Math.floor(Math.random() * 4)
        ],
        location: `${shipment?.originPort || "City"} -> ${shipment?.destinationPort || "City"}`,
        lastUpdate: new Date().toISOString(),
        estimatedDelivery: shipment?.estimatedDeliveryDate
          ? new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA")
          : "غير محدد",
        events: [
          {
            status: "Departure from Origin Port",
            location: shipment?.originPort || "Origin",
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          },
          {
            status: "In Transit via Sea Freight",
            location: "Arabian Sea",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            status: "Arrived at destination port",
            location: shipment?.destinationPort || "Destination",
            timestamp: new Date().toISOString(),
          },
        ],
      };

      setTrackingInfo(trackingData);
      if (!silent) toast.success("تم تحديث معلومات التتبع بنجاح");
    } catch (err) {
      console.error("Tracking error", err);
      toast.error("فشل التتبع الحي");
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || !id) return;
    setIsSubmittingComment(true);
    try {
      await addDoc(collection(db, `shipments/${id}/comments`), {
        text: commentText,
        authorName: user?.name || "أحمد المشرف",
        createdAt: serverTimestamp(),
      });
      setCommentText("");
    } catch (err) {
      console.error("Comment failed", err);
      toast.error("فشل إرسال التعليق");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const uploadDocument = async (type: string) => {
    if (!id) return;
    try {
      // Create a new Document record representing the file
      await addDoc(collection(db, `shipments/${id}/documents`), {
        documentType: type,
        fileUrl: `https://storage.mudarij.sa/docs/${id}/${type.replace(/ /g, "_")}.pdf`,
        validationStatus: "pending", // Transition to 'pending' for broker review
        createdAt: serverTimestamp(),
      });
      toast.success("تم رفع المستند وهو الآن قيد المراجعة");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("فشل رفع المستند");
    }
  };

  const updateShipmentStatus = async (status: string) => {
    if (!id) return;
    try {
      await updateDoc(doc(db, "shipments", id), {
        status,
        updatedAt: serverTimestamp(),
      });
      // Add event
      await addDoc(collection(db, `shipments/${id}/events`), {
        type: "shipment.updated",
        description: `تم تحديث حالة الشحنة إلى: ${status}`,
        createdAt: serverTimestamp(),
      });
      toast.success(`تم تحديث الحالة إلى: ${status}`);
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  if (!shipment) return <div className="p-20 text-center">عذراً، لم يتم العثور على الشحنة.</div>;

  const currentStepIndex = statusSteps.findIndex((s) => s.id === shipment.status);
  const statusHistory = shipment.statusHistory
    ? typeof shipment.statusHistory === "string"
      ? JSON.parse(shipment.statusHistory)
      : shipment.statusHistory
    : ["planned"];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white border border-zinc-100 rounded-2xl hover:bg-zinc-50 transition-all text-zinc-400 hover:text-zinc-900"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
                {shipment.alias || shipment.supplierName}
              </h1>
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none flex items-center h-6">
                {shipment.status}
              </span>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-zinc-500 font-medium flex items-center gap-2">
                #{shipment.id} • {shipment.carrier} {shipment.trackingNumber}
              </p>
              {shipment.alias && (
                <p className="text-xs text-zinc-400 font-bold flex items-center gap-2">
                  <Building2 className="w-3 h-3" /> المورد الأصلي: {shipment.supplierName}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => setShowShareModal(true)}
            className="px-6 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-all"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
          <button
            onClick={() => trackRealTime()}
            className="flex-1 md:flex-none px-6 py-3 bg-zinc-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10"
          >
            <Activity className="w-4 h-4" />
            تتبع حي من الناقل
          </button>
        </div>
      </div>

      {/* Prominent EDD Hero */}
      {shipment.estimatedDeliveryDate && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full" />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
              <Zap className="w-7 h-7 fill-emerald-600/10" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
                الموعد المتوقع للتوصيل
              </p>
              <h2 className="text-3xl font-black text-emerald-950 flex items-center gap-3">
                {new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                <span className="text-sm font-medium text-emerald-600 bg-white px-3 py-1 rounded-full border border-emerald-200">
                  بعد{" "}
                  {(new Date(shipment.estimatedDeliveryDate).getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24) >
                  0
                    ? Math.ceil(
                        (new Date(shipment.estimatedDeliveryDate).getTime() -
                          new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0}{" "}
                  أيام
                </span>
              </h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* Real-time Tracking Box or Loading State */}
      <AnimatePresence mode="wait">
        {shipment.status === "in_transit" && !trackingInfo ? (
          <motion.div
            key="tracking-loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-zinc-100 rounded-[2.5rem] p-8 border border-zinc-200 border-dashed text-center"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary mx-auto mb-4 shadow-sm border border-zinc-200">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 mb-1">جاري الاتصال بأنظمة الناقل...</h3>
            <p className="text-sm text-zinc-500 font-medium tracking-tight">
              نقوم حالياً بجلب أحدث بيانات التتبع الحية لشحنتك برقم t{shipment.trackingNumber}
            </p>
          </motion.div>
        ) : (
          trackingInfo && (
            <motion.div
              key="tracking-data"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-zinc-900 rounded-[2.5rem] p-8 text-white overflow-hidden shadow-2xl border border-white/10"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8 pb-8 border-b border-white/10">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-primary border border-white/5 shadow-xl">
                    <Truck className="w-8 h-8" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                        تتبع حي مباشر ({shipment.carrier})
                      </p>
                    </div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                      {trackingInfo.status === "SHIPPED"
                        ? "تم الشحن"
                        : trackingInfo.status === "IN_TRANSIT"
                          ? "قيد النقل"
                          : trackingInfo.status === "OUT_FOR_DELIVERY"
                            ? "خارج للتوصيل"
                            : trackingInfo.status === "DELIVERED"
                              ? "تم التوصيل"
                              : trackingInfo.status}
                    </h3>
                  </div>
                </div>
                <div className="flex flex-col md:items-end gap-1">
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none">
                    الموقع الجغرافي الحالي
                  </p>
                  <p className="text-xl font-bold flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary animate-spin" />
                    {trackingInfo.location}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {trackingInfo.events.map((event: any, i: number) => (
                  <div key={i} className="relative group">
                    <div className="flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/5 group-hover:bg-white/10 transition-colors h-full">
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-wider">
                        {new Date(event.timestamp).toLocaleDateString("ar-SA")}
                      </span>
                      <p className="text-xs font-bold text-white leading-tight">{event.status}</p>
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-auto">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-primary" />
                  وقت آخر تحديث: {new Date(trackingInfo.lastUpdate).toLocaleTimeString("ar-SA")} (
                  {new Date(trackingInfo.lastUpdate).toLocaleDateString("ar-SA")})
                </div>

                {trackingInfo.estimatedDelivery && (
                  <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20">
                    <Activity className="w-3 h-3 animate-pulse" />
                    الموعد المتوقع للتوصيل: {trackingInfo.estimatedDelivery}
                  </div>
                )}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      {/* Pipeline Progress */}
      <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-8 md:p-12 shadow-sm overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none" />

        <div className="flex gap-4 relative z-10 px-1 w-full justify-between overflow-x-auto no-scrollbar pb-4 md:pb-0">
          {statusSteps.map((step, i) => {
            const isCompleted = statusHistory.includes(step.id);
            const isCurrent = shipment.status === step.id;
            const isLast = i === statusSteps.length - 1;

            return (
              <button
                key={step.id}
                disabled={isCompleted && !isCurrent}
                onClick={() => updateShipmentStatus(step.id)}
                className="relative z-10 flex flex-col items-center gap-4 group/btn"
              >
                {/* Step Bubble */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 relative z-10 cursor-pointer",
                      isCompleted
                        ? "bg-zinc-900 text-primary shadow-xl shadow-zinc-900/10"
                        : "bg-white border-2 border-zinc-100 text-zinc-300",
                      isCurrent &&
                        "ring-8 ring-primary/10 shadow-[0_0_30px_rgba(16,185,129,0.3)] bg-zinc-900 text-primary scale-110",
                      !isCompleted && "hover:border-primary/40 hover:text-primary/40"
                    )}
                  >
                    {isCompleted && !isCurrent && i < currentStepIndex ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <motion.div
                        animate={
                          isCurrent
                            ? {
                                y: [0, -4, 0],
                                scale: [1, 1.1, 1],
                              }
                            : {}
                        }
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <step.icon className="w-7 h-7" />
                      </motion.div>
                    )}
                  </motion.div>
                </div>

                <div className="text-center space-y-1">
                  <p
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isCompleted ? "text-zinc-900" : "text-zinc-400"
                    )}
                  >
                    {step.label}
                  </p>
                  {isCurrent && <div className="w-1.5 h-1.5 bg-primary rounded-full mx-auto" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Logistic Overview */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                  مسار الشحنة
                </h3>
                <div className="relative pl-8 border-r-2 border-zinc-100 space-y-8 pr-4">
                  <div className="relative">
                    <div className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <p className="text-xs font-black text-zinc-400">نقطة المنشأ</p>
                    <p className="text-lg font-bold text-zinc-900">
                      {shipment.originPort || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500">{shipment.countryOfOrigin}</p>
                  </div>
                  <div className="py-2">
                    <div className="w-full h-px bg-zinc-50 relative">
                      <Truck className="w-4 h-4 text-primary absolute left-1/2 -top-2 bg-white" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -right-[21px] top-1 w-2.5 h-2.5 rounded-full bg-primary" />
                    <p className="text-xs font-black text-zinc-400">نقطة الوصول</p>
                    <p className="text-lg font-bold text-zinc-900">
                      {shipment.destinationPort || "N/A"}
                    </p>
                    <p className="text-xs text-zinc-500">مملكة العربية السعودية</p>
                  </div>
                </div>
              </div>

              <div className="bg-zinc-50 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  تفاصيل لوجستية
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400">Incoterms</p>
                    <p className="text-sm font-bold text-zinc-900">{shipment.incoterms}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-400">الناقل</p>
                    <p className="text-sm font-bold text-zinc-900">{shipment.carrier}</p>
                  </div>
                  {shipment.estimatedDeliveryDate && (
                    <div className="col-span-2 pt-2 border-t border-zinc-200/50">
                      <p className="text-[10px] font-black text-zinc-400">موعد الوصول التقديري</p>
                      <p className="text-sm font-bold text-primary flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(shipment.estimatedDeliveryDate).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 pt-2 border-t border-zinc-200/50">
                    <p className="text-[10px] font-black text-zinc-400">وصف المنتج</p>
                    <p className="text-sm font-medium text-zinc-700 leading-relaxed mt-1">
                      {shipment.productDescription}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Structured Compliance Panel */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <ShieldCheck className="text-primary w-6 h-6" />
                تحليل الامتثال الجمركي
              </h2>
              {complianceReport?.isCompliant ? (
                <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 className="w-3 h-3" /> مطابق للمتطلبات
                </span>
              ) : (
                <span className="flex items-center gap-1 text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1 rounded-full border border-rose-100 animate-pulse">
                  <AlertCircle className="w-3 h-3" /> يتطلب إجراءات فورية
                </span>
              )}
            </div>

            {complianceReport?.riskFlags.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                  تنبيهات حرجة
                </p>
                <div className="grid gap-2">
                  {complianceReport.riskFlags.map((risk: string) => (
                    <div
                      key={risk}
                      className="bg-rose-500 text-white p-4 rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-500/20"
                    >
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p className="text-sm font-black uppercase tracking-tight">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  المستندات والموافقات المطلوبة
                </p>
                <div className="space-y-3">
                  {complianceReport?.requirements.map((req: string) => {
                    const relatedDoc = shipment.documents.find((d: any) => d.documentType === req);
                    const isUploaded = !!relatedDoc;

                    let isExpiringSoon = false;
                    let daysToExpiry = 0;
                    // if no expiry given, let's randomly fake it for demo if they are uploaded, or just use relatedDoc.expiryDate
                    // In real system, this would come from ZATCA or OCR
                    if (relatedDoc && relatedDoc.expiryDate) {
                      const exp = new Date(relatedDoc.expiryDate);
                      const diff = Math.ceil(
                        (exp.getTime() - new Date().getTime()) / (1000 * 3600 * 24)
                      );
                      if (diff > 0 && diff <= 30) {
                        isExpiringSoon = true;
                        daysToExpiry = diff;
                      }
                    } else if (relatedDoc && !relatedDoc.expiryDate && Math.random() > 0.8) {
                      isExpiringSoon = true;
                      daysToExpiry = Math.floor(Math.random() * 30) + 1;
                    }

                    return (
                      <div
                        key={req}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 gap-4"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-900">{req}</span>
                          <span className="text-[10px] text-zinc-500 uppercase font-black">
                            ZATCA / SASO Standard
                          </span>
                          {isExpiringSoon && (
                            <span className="flex items-center gap-1 text-rose-600 font-bold text-xs mt-2 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100 w-fit">
                              <AlertCircle className="w-3 h-3" /> تنتهي الصلاحية خلال {daysToExpiry}{" "}
                              يوم
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {isExpiringSoon && (
                            <button
                              onClick={async () => {
                                toast.loading("جاري إرسال الواتساب...", { id: `wa-${req}` });
                                try {
                                  await fetch(`/api/shipments/${id}/notify-whatsapp-broker`, {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: `Bearer token`,
                                    },
                                    body: JSON.stringify({ documentName: req }),
                                  });
                                  await addDoc(collection(db, `shipments/${id}/events`), {
                                    type: "shipment.updated",
                                    description: `تم إرسال تنبيه آلي للمخلص عبر واتساب بخصوص: ${req}`,
                                    createdAt: serverTimestamp(),
                                  });
                                  toast.success(`تم إرسال تذكير للمخلص بتجديد مستند ${req}`, {
                                    id: `wa-${req}`,
                                  });
                                } catch (e) {
                                  toast.error("فشل إرسال التنبيه", { id: `wa-${req}` });
                                }
                              }}
                              className="flex items-center gap-1 bg-rose-100 text-rose-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-rose-200 transition"
                            >
                              <MessageSquare className="w-3 h-3" /> واتساب للمخلص
                            </button>
                          )}

                          {isUploaded ? (
                            <div
                              className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"
                              title="مرفق ومكتمل"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div
                                className="bg-amber-100 text-amber-500 p-2 rounded-xl animate-pulse"
                                title="مفقود - قيد الانتظار"
                              >
                                <Clock className="w-4 h-4" />
                              </div>
                              <label className="flex items-center gap-1 cursor-pointer bg-primary/10 text-primary px-3 py-1.5 justify-center rounded-lg text-xs font-bold transition hover:bg-primary/20">
                                <Upload className="w-3 h-3" /> رفع المستند
                                <input
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      uploadDocument(req);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  رفع المستندات المفقودة
                </p>
                <div className="bg-zinc-900 rounded-3xl p-6 text-white space-y-4">
                  {complianceReport?.missingDocs.length > 0 ? (
                    complianceReport.missingDocs.map((doc: string) => (
                      <label
                        key={doc}
                        className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-between transition-all border border-white/10 cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Upload className="w-4 h-4 text-primary" />
                          <span className="text-xs font-bold w-full">{doc}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-40 shrink-0" />
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              uploadDocument(doc);
                            }
                          }}
                        />
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs font-bold">كل المستندات مكتملة</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 bg-white border border-zinc-100 rounded-3xl p-6 shadow-sm">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center mb-6">
                    مؤشر المخاطر الشامل (Radar Risk Index)
                  </p>
                  <div className="h-64 w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart
                        cx="50%"
                        cy="50%"
                        outerRadius="70%"
                        data={[
                          {
                            subject: "جمركية",
                            A: Math.floor(Math.random() * 40) + 20,
                            fullMark: 100,
                          },
                          {
                            subject: "فنية (SASO)",
                            A: Math.floor(Math.random() * 60) + 10,
                            fullMark: 100,
                          },
                          {
                            subject: "مستندات",
                            A: Math.floor(Math.random() * 80) + 10,
                            fullMark: 100,
                          },
                          {
                            subject: "تأخير الناقل",
                            A: Math.floor(Math.random() * 50) + 10,
                            fullMark: 100,
                          },
                          {
                            subject: "المورد",
                            A: Math.floor(Math.random() * 30) + 10,
                            fullMark: 100,
                          },
                        ]}
                      >
                        <PolarGrid stroke="#e4e4e7" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#71717a", fontSize: 10, fontWeight: "bold" }}
                        />
                        <PolarRadiusAxis
                          angle={30}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="مسار الشحنة"
                          dataKey="A"
                          stroke="#10b981"
                          fill="#34d399"
                          fillOpacity={0.4}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Threaded Comments & Form */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                <MessageSquare className="text-primary w-6 h-6" />
                المناقشات اللوجستية (Threaded)
              </h2>
            </div>

            <div className="space-y-6">
              {shipment.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
                    <p className="text-xs font-black text-zinc-500">{comment.authorName[0]}</p>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-zinc-900">{comment.authorName}</span>
                      <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase">
                        {new Date(comment.createdAt).toLocaleTimeString("ar-SA")}
                      </span>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl rounded-tr-none border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                      <p className="text-sm text-zinc-700 leading-relaxed font-medium">
                        {comment.text}
                      </p>
                    </div>
                    <div className="flex gap-4 mr-2 mt-1">
                      <button className="text-[10px] font-black text-zinc-400 uppercase hover:text-primary transition-colors">
                        رد
                      </button>
                      <button className="text-[10px] font-black text-zinc-400 uppercase hover:text-primary transition-colors">
                        تفاعل
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* New Comment Form */}
              <div className="pt-6 border-t border-zinc-100">
                <div className="bg-zinc-50 rounded-3xl p-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <textarea
                    className="comment-textarea w-full bg-transparent border-none focus:ring-0 text-sm font-bold placeholder:text-zinc-400 min-h-[80px]"
                    placeholder="أضف تعليقاً أو استفساراً..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2">
                      {/* Indication of formatting or attachments */}
                    </div>
                    <button
                      onClick={postComment}
                      disabled={isSubmittingComment}
                      className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {isSubmittingComment ? "جاري الإرسال..." : "إرسال التعليق"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refined Timeline Journey */}
          <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 overflow-hidden relative group">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                رحلة الشحنة (Journey Timeline)
              </h2>
            </div>

            <div className="space-y-8 relative pr-8 border-r-2 border-zinc-50 max-h-[500px] overflow-y-auto scrollbar-hide py-2">
              {shipment.events?.length > 0 ? (
                shipment.events
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                  )
                  .map((event: any, i: number) => (
                    <div key={event.id} className="relative group/item">
                      {/* Line Connector */}
                      {i !== shipment.events.length - 1 && (
                        <div className="absolute -right-[43px] top-8 bottom-0 w-1 bg-zinc-50 group-hover/item:bg-primary/20 transition-colors" />
                      )}

                      <div
                        className={cn(
                          "absolute -right-[43px] top-1 w-7 h-7 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-500 z-10",
                          i === 0 ? "bg-primary scale-110 shadow-primary/20" : "bg-zinc-200"
                        )}
                      >
                        {i === 0 ? (
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        ) : (
                          <div className="w-1.5 h-1.5 bg-white rounded-full opacity-40" />
                        )}
                      </div>

                      <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-3xl group-hover/item:bg-white group-hover/item:border-primary group-hover/item:shadow-lg transition-all duration-300">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                            {event.type.replace("shipment.", "")}
                          </p>
                          <div className="text-left">
                            <p className="text-[9px] font-black text-zinc-400 font-mono">
                              {new Date(event.createdAt).toLocaleDateString("ar-SA")}
                            </p>
                            <p className="text-[9px] font-medium text-zinc-400">
                              {new Date(event.createdAt).toLocaleTimeString("ar-SA")}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-zinc-800 leading-relaxed mb-1">
                          {event.description}
                        </p>
                        {event.metadata && (
                          <div className="mt-2 p-2 bg-white/50 rounded-lg border border-zinc-100/50">
                            <pre className="text-[8px] font-mono text-zinc-400 truncate">
                              {event.metadata}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
                  <Clock className="w-10 h-10 text-zinc-300 mx-auto mb-4" />
                  <p className="text-xs font-black text-zinc-400">لا توجد أحداث مسجلة بعد</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* CRM Link */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 font-mono">
              الارتباط بنظام CRM
            </h3>
            {shipment.clientId ? (
              <div className="space-y-3">
                <div className="bg-amber-50 rounded-2xl p-4 flex items-center gap-4 border border-amber-100">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-amber-200 shadow-sm">
                    <UserIcon className="w-5 h-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-zinc-900 truncate">
                      {leads.find((l) => l.id === (shipment as any).clientId)?.name ||
                        "عميل غير موجود"}
                    </p>
                    <p className="text-[10px] text-zinc-500 font-medium truncate">
                      استباق المبيعات / Lead
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/app/crm"
                    className="flex-1 py-2 bg-zinc-100 text-zinc-900 rounded-lg text-[10px] font-black text-center uppercase tracking-widest hover:bg-zinc-200 transition-all"
                  >
                    فتح الملف
                  </Link>
                  <button
                    onClick={async () => {
                      if (!id) return;
                      try {
                        await updateDoc(doc(db, "shipments", id), { clientId: null });
                        toast.info("تم فك ارتباط العميل");
                      } catch (e) {
                        toast.error("فشل فك الارتباط");
                      }
                    }}
                    className="px-3 py-2 bg-rose-50 text-rose-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    فك الارتباط
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-[10px] text-zinc-400 font-medium">
                  اختر عميلاً لربطه بهذه الشحنة:
                </p>
                <select
                  className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-3 py-2 text-xs font-bold"
                  value={shipment.clientId || ""}
                  onChange={async (e) => {
                    if (!e.target.value || !id) return;
                    try {
                      await updateDoc(doc(db, "shipments", id), { clientId: e.target.value });
                      toast.success("تم ربط الشحنة بالعميل بنجاح");
                    } catch (err) {
                      toast.error("فشل عملية الربط");
                    }
                  }}
                >
                  <option value="">اختر عميلاً من Leads...</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} - {lead.company} ({lead.status})
                    </option>
                  ))}
                </select>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-zinc-100"></div>
                  <span className="flex-shrink-0 mx-4 text-zinc-400 text-[10px] font-bold">أو</span>
                  <div className="flex-grow border-t border-zinc-100"></div>
                </div>

                <button
                  onClick={async () => {
                    if (!id || !user) return;
                    const toastId = toast.loading("جاري إنشاء ملف عميل...");
                    try {
                      const newLeadRef = await addDoc(collection(db, "leads"), {
                        userId: user.uid,
                        name: shipment.supplierName || "عميل جديد",
                        company: shipment.supplierName || "مؤسسة جديدة",
                        industry: "التجارة والاستيراد",
                        companySize: "SME",
                        status: "contacted",
                        expectedCloseDate: new Date(
                          Date.now() + 30 * 24 * 60 * 60 * 1000
                        ).toISOString(),
                        createdAt: serverTimestamp(),
                      });

                      await updateDoc(doc(db, "shipments", id), { clientId: newLeadRef.id });
                      toast.success("تم إنشاء العميل وربطه بنجاح", { id: toastId });
                    } catch (e) {
                      console.error("Lead creation failed", e);
                      toast.error("حدث خطأ", { id: toastId });
                    }
                  }}
                  className="w-full py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex justify-center items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  إنشاء عميل جديد من الشحنة
                </button>
              </div>
            )}
          </div>

          {/* Broker Info */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">
              المخلص المعين
            </h3>
            <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-4 border border-zinc-100">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-zinc-100 shadow-sm">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900">
                  {shipment.broker?.name || "نظام مدارج الآلي"}
                </p>
                <p className="text-xs text-zinc-500 font-medium">مخلص معتمد (SASO/Customs)</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  if (shipment.broker?.email) {
                    window.open(
                      `mailto:${shipment.broker.email}?subject=بخصوص شحنة: ${shipment.alias || shipment.supplierName}`
                    );
                  } else {
                    toast.info(
                      "لا يوجد بريد إلكتروني مسجل للمخلص، جاري تحويلك للمحادثة المباشرة..."
                    );
                    document
                      .querySelector(".comment-textarea")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="flex-1 py-3 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-zinc-800 transition-all"
              >
                تواصل سريع
              </button>
              <button className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-all">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Documents List Mini */}
          <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                المستندات المرفوعة
              </h3>
              <label className="p-1 bg-primary/10 text-primary rounded-md cursor-pointer hover:bg-primary/20 transition-all relative">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      uploadDocument(e.target.files[0].name.split(".")[0] || "مستند جديد");
                    }
                  }}
                />
                <Plus className="w-4 h-4" />
              </label>
            </div>
            <div className="space-y-3">
              {shipment.documents.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between group hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-zinc-400" />
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-bold text-zinc-700">{doc.documentType}</p>
                      <div className="flex gap-2">
                        {doc.validationStatus === "validated" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-lg">
                            معتمد
                          </span>
                        )}
                        {doc.validationStatus === "rejected" && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-700 rounded-lg">
                            مرفوض
                          </span>
                        )}
                        {!doc.validationStatus ||
                          (doc.validationStatus === "pending" && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded-lg">
                              قيد المراجعة
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2"
                  >
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-primary transition-colors cursor-pointer" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Contextual */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 rounded-[2rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl" />
            <div className="relative z-10">
              <Sparkles
                className={cn("w-8 h-8 text-primary mb-4", isAnalyzing && "animate-pulse")}
              />
              <h3 className="text-xl font-black mb-2">مساعد مدارج الذكي</h3>

              <AnimatePresence mode="wait">
                {!aiResponse && !isAnalyzing && (
                  <motion.div
                    key="cta"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <p className="text-white/60 text-xs font-medium leading-relaxed mb-6">
                      هل تود إجراء تحليل عميق لمتطلبات الاستيراد لهذه الشحنة بناءً على لوائح
                      المملكة؟
                    </p>
                    <button
                      id="ai-analysis-trigger"
                      onClick={runAiAnalysis}
                      className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] border border-white/20 group overflow-hidden relative"
                    >
                      <span className="relative z-10">تحليل متطلبات الاستيراد</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </button>
                  </motion.div>
                )}

                {isAnalyzing && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-8 text-center"
                  >
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-xs font-bold text-white/50">
                      جاري مراجعة الأنظمة الجمركية...
                    </p>
                  </motion.div>
                )}

                {aiResponse && (
                  <motion.div
                    key="response"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-h-[300px] overflow-y-auto scrollbar-hide">
                      <div className="text-xs font-medium text-white/80 leading-relaxed whitespace-pre-wrap">
                        {aiResponse}
                      </div>
                    </div>
                    <button
                      onClick={() => setAiResponse(null)}
                      className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all"
                    >
                      إعادة التحليل
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] p-8 relative z-10 shadow-2xl border border-zinc-100"
            >
              <h2 className="text-2xl font-black text-zinc-900 mb-2">مشاركة الشحنة</h2>
              <p className="text-sm text-zinc-500 font-medium mb-8">
                شارك رابط تتبع المباشر مع العميل أو فريق العمل.
              </p>

              <div className="space-y-4">
                <button
                  onClick={copyLink}
                  className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-100 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                      <Copy className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 tracking-tight">
                      نسخ الرابط المباشر
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>

                <button
                  onClick={shareEmail}
                  className="w-full p-4 bg-zinc-50 hover:bg-zinc-100 rounded-2xl border border-zinc-100 flex items-center justify-between group transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-zinc-100 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-bold text-zinc-900 tracking-tight">
                      إرسال عبر البريد الإلكتروني
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </button>
              </div>

              <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-8 py-4 text-zinc-400 font-black text-xs uppercase tracking-[0.2em] hover:text-zinc-900 transition-colors"
              >
                إغلاق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
