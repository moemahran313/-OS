import React from "react";
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

const channelData = [
  { name: "واتساب", value: 4850, color: "#25D366" },
  { name: "بريد إلكتروني", value: 3120, color: "#EA4335" },
  { name: "المحادثة المباشرة", value: 2980, color: "#3B82F6" },
  { name: "تيليجرام", value: 1450, color: "#0088cc" },
  { name: "رسائل قصيرة (SMS)", value: 850, color: "#6366F1" },
  { name: "إنستغرام + فيسبوك", value: 1650, color: "#E1306C" },
];

const trendData = [
  { Day: "الأحد", "وقت الاستجابة (دقائق)": 2.1, "وقت الحل (ساعات)": 1.4, "مستوى الرضا (%)": 92 },
  { Day: "الأثنين", "وقت الاستجابة (دقائق)": 1.8, "وقت الحل (ساعات)": 1.2, "مستوى الرضا (%)": 94 },
  { Day: "الثلاثاء", "وقت الاستجابة (دقائق)": 1.4, "وقت الحل (ساعات)": 0.9, "مستوى الرضا (%)": 95 },
  { Day: "الأربعاء", "وقت الاستجابة (دقائق)": 1.1, "وقت الحل (ساعات)": 0.8, "مستوى الرضا (%)": 97 },
  { Day: "الخميس", "وقت الاستجابة (دقائق)": 1.2, "وقت الحل (ساعات)": 0.85, "مستوى الرضا (%)": 96 },
  { Day: "الجمعة", "وقت الاستجابة (دقائق)": 2.4, "وقت الحل (ساعات)": 1.6, "مستوى الرضا (%)": 90 },
  { Day: "السبت", "وقت الاستجابة (دقائق)": 1.9, "وقت الحل (ساعات)": 1.3, "مستوى الرضا (%)": 93 },
];

const aiPerformanceData = [
  { name: "أتمتة كاملة (AI Bot)", value: 65 },
  { name: "توجيه ذكي + وكيل", value: 25 },
  { name: "تدخل يدوي بالكامل", value: 10 },
];

const AI_COLORS = ["#8B5CF6", "#3B82F6", "#9CA3AF"];

const agentsPerformance = [
  {
    name: "أحمد العتيبي",
    avatar: "A",
    resolved: 342,
    csat: 4.9,
    art: "8.5 دقيقة",
    channel: "واتساب",
  },
  {
    name: "سارة الشمري",
    avatar: "S",
    resolved: 298,
    csat: 4.8,
    art: "11.2 دقيقة",
    channel: "بريد إلكتروني",
  },
  {
    name: "فيصل خالد",
    avatar: "F",
    resolved: 276,
    csat: 4.7,
    art: "12.4 دقيقة",
    channel: "محادثة الموقع",
  },
  {
    name: "هدى عسيري",
    avatar: "H",
    resolved: 224,
    csat: 4.6,
    art: "14.1 دقيقة",
    channel: "تيليجرام",
  },
];

export default function AnalyticsView() {
  return (
    <div className="space-y-6" dir="rtl">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: "سرعة الرد الأول (FRT)",
            value: "1.2 دقيقة",
            desc: "أسرع بـ 35% من الأسبوع الماضي",
            trend: "up",
            icon: Clock,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          },
          {
            title: "متوسط وقت الحل",
            value: "14.5 دقيقة",
            desc: "تحسن ملحوظ بفضل AI Copilot",
            trend: "up",
            icon: Activity,
            color: "text-blue-600 bg-blue-50 border-blue-100",
          },
          {
            title: "مؤشر رضا العملاء (CSAT)",
            value: "94.6%",
            desc: "تقييم 5 نجوم لـ 880 محادثة",
            trend: "up",
            icon: ThumbsUp,
            color: "text-amber-600 bg-amber-50 border-amber-100",
          },
          {
            title: "نسبة حلول الذكاء الاصطناعي",
            value: "68.4%",
            desc: "أتمتة آمنة دون تدخل بشري",
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart - Volume & Response Time */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-800">
                معدل الاستجابة والحل الأسبوعي
              </h3>
              <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
                مقارنة وقت الرد بالدقائق وتأثير رضا العميل
              </p>
            </div>
            <div className="flex gap-3 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> وقت الرد
              </span>
              <span className="flex items-center gap-1.5 text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> رضا العميل
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary, #0f9b7e)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--color-primary, #0f9b7e)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCsat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="Day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    direction: "rtl",
                    borderRadius: "1rem",
                    border: "1px solid #e2e8f0",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="وقت الاستجابة (دقائق)"
                  stroke="var(--color-primary, #0f9b7e)"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorResponse)"
                />
                <Area
                  type="monotone"
                  dataKey="مستوى الرضا (%)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCsat)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Share Pie Chart */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-zinc-800">توزيع المحادثات حسب القناة</h3>
            <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
              القنوات الأكثر نشاطاً هذا الشهر
            </p>
          </div>
          <div className="h-44 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={channelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
              <span className="text-xl font-black text-zinc-800">14.9K</span>
              <span className="text-[9px] text-zinc-400 font-bold">مجموع التفاعلات</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {channelData.map((c) => (
              <div
                key={c.name}
                className="flex items-center gap-1.5 text-xs font-bold text-zinc-600"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: c.color }}
                />
                <span className="truncate">{c.name}</span>
                <span className="text-zinc-400 font-normal">
                  ({Math.round((c.value / 14900) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Productivity */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-zinc-800">إنتاجية وجودة أداء الوكلاء</h3>
            <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
              الوكلاء المتصلون حالياً ومؤشرات أدائهم
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-black text-zinc-400 tracking-wider">
                  <th className="pb-3 font-black">الوكيل</th>
                  <th className="pb-3 font-black">المحادثات المنجزة</th>
                  <th className="pb-3 font-black">تقييم الرضا (CSAT)</th>
                  <th className="pb-3 font-black">متوسط وقت الحل</th>
                  <th className="pb-3 font-black">القناة الرئيسية</th>
                  <th className="pb-3 font-black">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {agentsPerformance.map((a, idx) => (
                  <tr key={a.name} className="text-xs font-bold text-zinc-700">
                    <td className="py-3.5 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                        {a.avatar}
                      </div>
                      <span>{a.name}</span>
                    </td>
                    <td className="py-3.5 font-bold text-zinc-900">{a.resolved}</td>
                    <td className="py-3.5 text-amber-500 flex items-center gap-1">
                      ⭐ <span>{a.csat} / 5.0</span>
                    </td>
                    <td className="py-3.5 text-zinc-500">{a.art}</td>
                    <td className="py-3.5">
                      <span className="px-2 py-1 rounded-lg bg-zinc-100 border border-zinc-200/50 text-[10px]">
                        {a.channel}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full">
                        نشط حياً
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Auto-resolution Stats */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-zinc-800">معدل الحل التلقائي بالـ AI</h3>
            <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
              كيف يتعامل الذكاء الاصطناعي مع القنوات
            </p>
          </div>
          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={aiPerformanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
          <div className="space-y-2 mt-4">
            {aiPerformanceData.map((entry, i) => (
              <div
                key={entry.name}
                className="flex justify-between items-center text-xs font-bold text-zinc-600"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: AI_COLORS[i] }}
                  />
                  <span>{entry.name}</span>
                </div>
                <span className="text-zinc-900 font-black">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
