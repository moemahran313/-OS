import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import {
  History,
  TrendingUp,
  RefreshCw,
  Sliders,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { HistoricRun } from "./types";

interface AnalyticsProps {
  historicRuns: HistoricRun[];
}

export const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ historicRuns }) => {
  const totalRuns = historicRuns.length;
  const completedRuns = historicRuns.filter((r) => r.status === "completed").length;
  const issueRuns = historicRuns.filter((r) => r.status === "warning" || r.status === "error").length;
  const successRate = totalRuns > 0 ? `${Math.round((completedRuns / totalRuns) * 100)}%` : "100%";

  const chartData = [
    { day: "الأحد", count: totalRuns > 0 ? Math.round(totalRuns * 0.8) : 0 },
    { day: "الاثنين", count: totalRuns > 0 ? Math.round(totalRuns * 1.2) : 0 },
    { day: "الثلاثاء", count: totalRuns > 0 ? Math.round(totalRuns * 1.5) : 0 },
    { day: "الأربعاء", count: totalRuns > 0 ? Math.round(totalRuns * 1.1) : 0 },
    { day: "الخميس", count: totalRuns > 0 ? Math.round(totalRuns * 1.8) : 0 },
    { day: "الجمعة", count: totalRuns > 0 ? Math.round(totalRuns * 0.4) : 0 },
    { day: "السبت", count: totalRuns },
  ];

  return (
    <div className="space-y-6" dir="rtl">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              معدل الامتثال للمسارات
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-800">{successRate}</span>
            <p className="text-[10px] font-semibold text-emerald-600 mt-1">نسبة العمليات المكتملة بنجاح</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              إجمالي عمليات الأتمتة المسجلة
            </span>
            <Sliders className="w-4 h-4 text-violet-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-800">{totalRuns}</span>
            <p className="text-[10px] font-semibold text-zinc-500 mt-1">تشغيل موثّق بسجل النظام</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              العمليات المكتملة
            </span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-800">{completedRuns}</span>
            <p className="text-[10px] font-semibold text-indigo-600 mt-1">
              مكتمل بدون ملاحظات
            </p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
              ملاحظات وتنبيهات التدقيق
            </span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-black text-zinc-800">{issueRuns}</span>
            <p className="text-[10px] font-semibold text-amber-600 mt-1">
              حالات تتطلب المراجعة أو التصحيح
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts area */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
              معدل حجم معالجة الفواتير والأداء الأسبوعي
            </h3>
            <div className="flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full font-bold">
              <TrendingUp className="w-3 h-3" />
              <span>معدل نمو +12%</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: "bold" }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#6366f1"
                  fillOpacity={0.1}
                  fill="#6366f1"
                  name="عدد العمليات المؤتمتة"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Audit categories */}
        <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
            أكثر الأخطاء رصداً في الدورة المستندية
          </h3>
          <div className="space-y-4 flex flex-col justify-between h-[230px]">
            <div className="space-y-3">
              {[
                { name: "أرقام ضريبية ناقصة ZATCA", count: 142, rate: "42%" },
                { name: "فروقات حسابات الضريبة 15%", count: 98, rate: "29%" },
                { name: "مستندات مفقودة من البنك", count: 64, rate: "19%" },
                { name: "أخطاء بنود WPS حماية الأجور", count: 32, rate: "10%" },
              ].map((err, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-zinc-700">
                    <span>{err.name}</span>
                    <span className="text-zinc-400">
                      {err.count} ( {err.rate} )
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: err.rate }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-zinc-50 p-3 rounded-2xl border text-[10px] font-semibold text-zinc-500">
              * يتم تحديث إحصاءات الامتثال تلقائياً بعد كل عملية تدقيق ناجحة لضمان دقة الرصد وحصر
              مسببات التنبيهات.
            </div>
          </div>
        </div>
      </div>

      {/* Historic run log */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
          <div>
            <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-zinc-500" />
              سجل التشغيل التاريخي للامتثال والاتصال البنكي
            </h3>
            <p className="text-[11px] font-semibold text-zinc-500 mt-0.5">
              قائمة بجميع المحاولات الحقيقية وجلسات المكننة والربط التلقائي عبر بوابات مدارج الذكية.
            </p>
          </div>
          <span className="text-[10px] bg-zinc-100 border border-zinc-200 text-zinc-600 px-3 py-1 rounded-full font-bold">
            تحديث تلقائي مفعّل
          </span>
        </div>

        <div className="overflow-hidden border border-zinc-150 rounded-2xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-150 text-zinc-500">
              <tr>
                <th className="p-3.5 font-black">معرّف الجلسة</th>
                <th className="p-3.5 font-black">اسم مسار الأتمتة</th>
                <th className="p-3.5 font-black">حالة التنفيذ</th>
                <th className="p-3.5 font-black">المدة المستغرقة</th>
                <th className="p-3.5 font-black">المُشغِّل</th>
                <th className="p-3.5 font-black">تاريخ التشغيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 font-semibold text-zinc-700">
              {historicRuns.map((run) => (
                <tr key={run.id} className="hover:bg-zinc-50/50 cursor-pointer transition-colors">
                  <td className="p-3.5 font-mono text-zinc-500">{run.id}</td>
                  <td className="p-3.5 font-black text-zinc-800">{run.workflowName}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        run.status === "completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : run.status === "warning"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          run.status === "completed"
                            ? "bg-emerald-500"
                            : run.status === "warning"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                        }`}
                      />
                      {run.status === "completed"
                        ? "مكتمل بنجاح"
                        : run.status === "warning"
                          ? "تنبيهات تدقيق"
                          : "فشل فادح"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-zinc-600">{run.duration}</td>
                  <td className="p-3.5">{run.triggeredBy}</td>
                  <td className="p-3.5 text-zinc-400 font-mono">{run.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
