import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  Clock,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Users,
  Percent,
  TrendingDown,
  Activity,
  Award,
} from "lucide-react";
import { motion } from "motion/react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";

const AI_COLORS = ["#8B5CF6", "#3B82F6", "#9CA3AF"];

export default function AnalyticsView() {
  const { user } = useUser();
  const [tickets, setTickets] = useState<any[]>([]);
  const [whatsappQueue, setWhatsappQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const ticketsQ = query(collection(db, "support_tickets"), where("userId", "==", user.uid));
    const unsubTickets = onSnapshot(
      ticketsQ,
      (snap) => {
        setTickets(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.warn("Error fetching tickets for analytics:", err);
        setLoading(false);
      }
    );

    const waQ = query(collection(db, "whatsapp_queue"), where("userId", "==", user.uid));
    const unsubWa = onSnapshot(
      waQ,
      (snap) => {
        setWhatsappQueue(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (err) => {
        console.warn("Error fetching whatsapp queue for analytics:", err);
      }
    );

    return () => {
      unsubTickets();
      unsubWa();
    };
  }, [user]);

  const totalInteractions = tickets.length + whatsappQueue.length;
  const resolvedTickets = tickets.filter((t) => t.status === "resolved" || t.status === "closed");
  const csatScore =
    tickets.length > 0
      ? Math.round((resolvedTickets.length / tickets.length) * 100)
      : 0;

  const channelData = [
    { name: "واتساب", value: whatsappQueue.length, color: "#25D366" },
    {
      name: "بريد إلكتروني",
      value: tickets.filter((t) => t.channel === "email" || t.category === "Billing").length,
      color: "#EA4335",
    },
    {
      name: "المحادثة المباشرة",
      value: tickets.filter((t) => t.channel === "chat" || !t.channel).length,
      color: "#3B82F6",
    },
  ];

  const totalChannelsCount = channelData.reduce((acc, c) => acc + c.value, 0);

  const aiAutoResolvedCount = tickets.filter((t) => t.isAiResolved || t.aiHandled).length;
  const aiResolutionRate =
    tickets.length > 0 ? Math.round((aiAutoResolvedCount / tickets.length) * 100) : 0;

  const aiPerformanceData = [
    { name: "أتمتة كاملة (AI Bot)", value: aiResolutionRate },
    { name: "توجيه ذكي + وكيل", value: tickets.length > 0 ? 100 - aiResolutionRate : 0 },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "إجمالي المحادثات والرسائل",
            value: totalInteractions.toString(),
            desc: totalInteractions > 0 ? "تفاعلات حية عبر القنوات" : "لا توجد تفاعلات حتى الآن",
            trend: "up",
            icon: Clock,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          },
          {
            title: "تذاكر الدعم المنجزة",
            value: resolvedTickets.length.toString(),
            desc: `من إجمالي ${tickets.length} تذكرة`,
            trend: "up",
            icon: Activity,
            color: "text-blue-600 bg-blue-50 border-blue-100",
          },
          {
            title: "مؤشر رضا العملاء (CSAT)",
            value: `${csatScore}%`,
            desc: tickets.length > 0 ? "مستخرج من التذاكر المكتملة" : "في انتظار التقييمات الأولى",
            trend: "up",
            icon: ThumbsUp,
            color: "text-amber-600 bg-amber-50 border-amber-100",
          },
          {
            title: "نسبة حلول الذكاء الاصطناعي",
            value: `${aiResolutionRate}%`,
            desc: tickets.length > 0 ? "حلول مؤتمتة بدون تدخل" : "جاهز للرد التلقائي",
            trend: "up",
            icon: Sparkles,
            color: "text-purple-600 bg-purple-50 border-purple-100",
          },
        ].map((m, i) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={m.title}
            className="p-5 bg-white border border-zinc-200 rounded-3xl shadow-sm flex items-start justify-between"
          >
            <div className="space-y-2">
              <span className="text-xs font-black text-zinc-400 block">{m.title}</span>
              <span className="text-2xl font-black text-zinc-900 block">{m.value}</span>
              <span className="text-[10px] text-zinc-500 font-bold block flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {m.desc}
              </span>
            </div>
            <div className={`p-3 rounded-2xl ${m.color}`}>
              <m.icon className="w-5 h-5" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Channel Share & AI Resolution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Share Pie Chart */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-extrabold text-sm text-zinc-800">توزيع المحادثات حسب القناة</h3>
            <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
              بيانات حية بناءً على الرسائل والتذاكر المسجلة
            </p>
          </div>
          {totalChannelsCount === 0 ? (
            <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 rounded-2xl my-2">
              <MessageSquare className="w-8 h-8 text-zinc-300 mb-2" />
              <p className="text-xs font-bold text-zinc-500">لا توجد محادثات أو رسائل سابقة</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">ربط القنوات يتيح التتبع اللحظي هنا</p>
            </div>
          ) : (
            <>
              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={channelData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        direction: "rtl",
                        borderRadius: "1rem",
                        border: "1px solid #e2e8f0",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center">
                  <span className="text-xl font-black text-zinc-800">{totalChannelsCount}</span>
                  <span className="text-[9px] text-zinc-400 font-bold">إجمالي المحادثات</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {channelData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs font-bold text-zinc-600">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                    <span className="truncate">{c.name}</span>
                    <span className="text-zinc-400 font-normal">
                      ({totalChannelsCount > 0 ? Math.round((c.value / totalChannelsCount) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* AI Auto-resolution Stats */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h3 className="font-extrabold text-sm text-zinc-800">أتمتة الاستجابة الذكية</h3>
            <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
              نسبة معالجة الطلبات تلقائياً بواسطة AI Agent
            </p>
          </div>
          {tickets.length === 0 ? (
            <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-zinc-200 rounded-2xl my-2">
              <Sparkles className="w-8 h-8 text-purple-300 mb-2" />
              <p className="text-xs font-bold text-zinc-500">لا توجد أتمتة مسجلة بعد</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">سيظهر أداء الذكاء الاصطناعي مع إرسال أول تذكرة</p>
            </div>
          ) : (
            <>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={aiPerformanceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {aiPerformanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={AI_COLORS[index % AI_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        direction: "rtl",
                        borderRadius: "1rem",
                        border: "1px solid #e2e8f0",
                        fontSize: "11px",
                        fontWeight: "bold",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {aiPerformanceData.map((entry, i) => (
                  <div key={entry.name} className="flex justify-between items-center text-xs font-bold text-zinc-600">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: AI_COLORS[i] }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="text-zinc-900 font-black">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
