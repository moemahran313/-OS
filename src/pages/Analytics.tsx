import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  Download, 
  Filter, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  Zap,
  Sparkles,
  AlertTriangle,
  Brain,
  Layers,
  ShieldCheck,
  TrendingDown,
  DollarSign,
  Clock,
  Briefcase,
  Users,
  LayoutDashboard,
  Activity,
  ArrowRight
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AnalyticsReport } from "@/src/services/analytics/types";
import { DataAnalyticsEngine } from "@/src/services/analytics/engine";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const { user } = useUser();
  const [data, setData] = useState<AnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      try {
        const invoicesQ = query(collection(db, "invoices"), where("userId", "==", user.uid));
        const leadsQ = query(collection(db, "leads"), where("userId", "==", user.uid));
        
        const [invoicesSnap, leadsSnap] = await Promise.all([
          getDocs(invoicesQ).catch(e => { console.error(e); return { docs: [] }; }),
          getDocs(leadsQ).catch(e => { console.error(e); return { docs: [] }; })
        ]);
        
        const invoices = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        const leads = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

        const engine = new DataAnalyticsEngine();
        const report = engine.generateFullReport(invoices as any[], leads as any[]);
        setData(report);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user]);

  if (loading || !data) return (
    <div className="h-full flex flex-col items-center justify-center p-20 text-center animate-pulse">
      <Brain className="w-16 h-16 text-primary mb-6 animate-bounce" />
      <h2 className="text-2xl font-black text-zinc-900 mb-2">جاري تشغيل محرك التحليلات المتقدم...</h2>
      <p className="text-zinc-500 font-medium tracking-wide">نقوم بتحليل التدفق النقدي، سلوك العملاء، والتوقعات المستقبلية</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-24">
      {/* 🧭 Strategic Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
            Mudarij Intelligence Engine v2.0
          </div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">التقارير والتحليلات الاستراتيجية</h1>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white text-zinc-900 px-6 py-3.5 rounded-2xl font-bold border-2 border-zinc-100 hover:border-zinc-200 transition-all text-xs shadow-sm">
            <Filter className="w-4 h-4" />
            <span>تخصيص البيانات</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3.5 rounded-2xl font-bold shadow-2xl shadow-zinc-900/20 hover:bg-zinc-800 transition-all text-xs">
            <Download className="w-4 h-4" />
            <span>تصدير التقرير الكامل</span>
          </button>
        </div>
      </header>

      {/* 📑 1. Executive Intelligence Summary */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-blue-500 to-amber-500 rounded-[3rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
        <div className="relative bg-white rounded-[2.5rem] border border-zinc-100 p-12 shadow-xl">
          <div className="flex flex-col md:flex-row gap-10">
            <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg rotate-3">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
                الملخص التنفيذي
                <span className="text-xs bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full font-bold uppercase tracking-widest">System Generated</span>
              </h3>
              <p className="text-zinc-600 leading-[2.2] text-xl font-medium rtl:text-right">
                {data.executiveSummary}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 📊 2. KPI Tree & Unit Economics Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Unit Economics Side */}
        <div className="space-y-8">
          <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            اقتصاديات الوحدة / Unit Economics
          </h4>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: "CAC", value: data.unitEconomics.cac, unit: "ر.س", desc: "تكلفة الاستحواذ", icon: Users, color: "text-blue-500" },
              { label: "LTV", value: data.unitEconomics.ltv, unit: "ر.س", desc: "القيمة الدائمة للعميل", icon: Target, color: "text-emerald-500" },
              { label: "Payback", value: data.unitEconomics.paybackPeriod, unit: "أشهر", desc: "فترة استرداد التكلفة", icon: Clock, color: "text-amber-500" },
              { label: "Margin", value: data.unitEconomics.margin, unit: "%", desc: "هامش الربح الإجمالي", icon: DollarSign, color: "text-primary" },
            ].map((eco, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm flex items-center gap-4 group hover:border-zinc-300 transition-all">
                <div className={cn("w-12 h-12 rounded-xl bg-zinc-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", eco.color)}>
                  <eco.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-black text-zinc-900">{eco.value}</span>
                    <span className="text-[10px] font-bold text-zinc-400">{typeof eco.value === 'number' ? eco.unit : ''}</span>
                  </div>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">{eco.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Major KPIs */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.keyMetrics.map((kpi, i) => (
            <div key={i} className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-sm flex flex-col justify-between group hover:shadow-2xl hover:shadow-zinc-100 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div>
                   <h3 className="text-sm font-black text-zinc-900 mb-1">{kpi.label}</h3>
                   <p className="text-[10px] text-zinc-400 font-medium max-w-[200px] leading-relaxed">{kpi.description}</p>
                </div>
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                  kpi.status === 'strong' ? "bg-emerald-500 text-white" :
                  kpi.status === 'average' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                )}>
                  {kpi.status === 'strong' ? "ممتاز" : kpi.status === 'average' ? "تحت المراقبة" : "خطر"}
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-zinc-900 tracking-tighter">{kpi.value}</span>
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-black",
                    kpi.isPositiveTrend ? "text-emerald-500" : "text-rose-500"
                  )}>
                    {kpi.isPositiveTrend ? <ArrowUpRight className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {kpi.trend}
                  </div>
                </div>
                
                <div className="pt-6 border-t border-zinc-50">
                  <div className="text-[10px] font-black text-zinc-400 uppercase mb-4 tracking-widest flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    محركات الأداء المتصلة / Sub-Drivers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {kpi.subDrivers.map((drive, di) => (
                      <span key={di} className="px-4 py-2 bg-zinc-50 text-zinc-600 rounded-xl text-[10px] font-bold border border-zinc-100/50">
                        {drive}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 🔮 3. Forecast Mode & Scenario Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-zinc-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 space-y-12 h-full flex flex-col">
            <header className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  محرك محاكاة السيناريوهات
                  <Sparkles className="w-5 h-5 text-primary" />
                </h3>
                <p className="text-zinc-400 text-xs mt-1 font-medium italic">Forecast Mode: Projected Revenue Growth (Upcoming 180 Days)</p>
              </div>
              <div className="flex gap-4">
                {data.forecast.scenarios.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] font-black uppercase text-zinc-300">{s.name}</span>
                  </div>
                ))}
              </div>
            </header>

            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.forecast.scenarios[0].data.map((point, i) => ({
                  label: point.label,
                  base: point.value,
                  optimistic: data.forecast.scenarios[1].data[i].value
                }))}>
                  <defs>
                    <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: "16px", border: "none", backgroundColor: "#18181b", color: "#fff", direction: "rtl" }}
                    itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorOpt)" />
                  <Area type="monotone" dataKey="base" stroke="#4a5568" strokeWidth={2} strokeDasharray="5 5" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <footer className="pt-8 border-t border-white/5">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">عوامل الحسم المتغيرة:</span>
                {data.forecast.variables.map((v, idx) => (
                  <span key={idx} className="px-5 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-zinc-300">
                    {v}
                  </span>
                ))}
              </div>
            </footer>
          </div>
        </div>

        {/* 📈 4. Benchmarking (Market Comparison) */}
        <div className="bg-white rounded-[3rem] border border-zinc-100 p-10 flex flex-col justify-between shadow-sm lg:h-full">
          <div>
            <h3 className="text-lg font-black text-zinc-900 mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-900" />
              المقارنة المعيارية / Benchmark
            </h3>
            <div className="space-y-10">
              {data.benchmarks.map((bench, idx) => (
                <div key={idx} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-black text-zinc-900 uppercase">{bench.metric}</p>
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-2.5 py-1 rounded-lg font-bold mt-1 inline-block">{bench.rating}</span>
                    </div>
                    <span className="text-3xl font-black text-zinc-900 tracking-tighter">{bench.current.toFixed(0)}%</span>
                  </div>
                  <div className="h-4 bg-zinc-100 rounded-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-full bg-zinc-900 rounded-full" style={{ width: `${bench.current}%` }} />
                    <div className="absolute top-0 right-0 h-full w-[2px] bg-emerald-500 z-10" style={{ right: `${bench.industryAvg}%` }}>
                      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-emerald-600 whitespace-nowrap">متوسط السوق ({bench.industryAvg}%)</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100">
            <p className="text-xs font-bold text-zinc-600 leading-relaxed italic">
              {data.benchmarks[0].current > data.benchmarks[0].industryAvg 
                 ? `"أداؤك الحالي يتجاوز متوسط قطاعك المرجعي (${data.benchmarks[0].industryAvg}٪)، مما يعكس كفاءة متميزة في إدارة التحصيل."`
                 : `"لا يزال الأداء أقل من متوسط السوق (${data.benchmarks[0].industryAvg}٪). نوصي بمراجعة سياساتك لتسريع التحصيل."`}
            </p>
          </div>
        </div>
      </div>

      {/* ⚠️ 5. Smart Alert & Alert Mode */}
      <section className="bg-rose-50 rounded-[3rem] border border-rose-100 p-10">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="shrink-0 flex items-center gap-4">
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-black text-rose-900">تنبيهات استباقية (Alert Mode)</h3>
              <p className="text-rose-600 text-xs font-bold mt-1">نظام رصد المخاطر المدعوم بالذكاء الاصطناعي</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
            {data.alerts.map((alert, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-rose-100 flex gap-5 group hover:shadow-xl hover:shadow-rose-100 transition-all">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                   <h5 className="font-black text-sm text-zinc-900 mb-1">{alert.title}</h5>
                   <p className="text-xs text-zinc-500 font-medium leading-relaxed">{alert.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🎯 6. Decision Intelligence (The Action Center) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[3rem] border-2 border-zinc-100 p-12 space-y-10 shadow-sm">
          <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-3">
             مركز اتخاذ القرار (Decision Engine)
             <ShieldCheck className="w-6 h-6 text-primary" />
          </h3>
          
          <div className="space-y-6">
            {data.actionPlan.map((rec, i) => (
              <div key={i} className="group cursor-default bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-100 hover:bg-white hover:border-zinc-300 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-10 h-10 bg-zinc-900 text-white flex items-center justify-center rounded-2xl text-xs font-black">
                      {rec.priority}
                    </div>
                    <div>
                      <h5 className="font-black text-lg text-zinc-900">{rec.action}</h5>
                      <div className="flex gap-2 mt-1">
                        <span className={cn(
                          "text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest",
                          rec.impact === 'high' ? "bg-emerald-100 text-emerald-700" : "bg-zinc-200 text-zinc-600"
                        )}>التأثير: {rec.impact === 'high' ? 'عالي' : 'متوسط'}</span>
                        <span className="text-[9px] bg-zinc-100 text-zinc-500 px-2.5 py-1 rounded-full font-black uppercase tracking-widest">الجهد: {rec.effort === 'low' ? 'بسيط' : 'متوسط'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-zinc-200/50">
                  <div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">المفاضلة الاستراتيجية / Trade-off</span>
                    <p className="text-[11px] text-zinc-600 font-bold leading-relaxed">{rec.tradeOff}</p>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-zinc-400 uppercase block mb-1">الأثر الثانوي / 2nd Order Effect</span>
                    <p className="text-[11px] text-zinc-600 font-bold leading-relaxed">{rec.secondOrderEffect}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🏆 The Golden Decision */}
        <div className="bg-primary rounded-[3rem] p-12 text-zinc-950 flex flex-col justify-between shadow-2xl shadow-primary/20 scale-[1.02] relative z-10 border-4 border-white">
           <div className="space-y-8">
              <div className="w-16 h-16 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-xl">
                 <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-3xl font-black leading-tight">لو كنت مكانك، هذا هو القرار الوحيد الذي سأبدأ به الآن:</h3>
              <p className="text-lg font-bold leading-loose bg-zinc-900/5 p-6 rounded-2xl border-2 border-zinc-900/10 italic">
                "{data.decisiveAction}"
              </p>
           </div>
           
           <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                 <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-zinc-900 flex items-center justify-center text-[10px] font-black text-primary">CEO</div>
                    ))}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900/60">بناءً على بروتوكول Mudarij الاستشاري</span>
              </div>
              <button className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl shadow-zinc-900/30 group">
                تنفيذ القرار فوراً
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform rtl:rotate-180" />
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
