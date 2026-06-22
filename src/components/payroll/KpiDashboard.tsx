import React, { useState } from 'react';
import { Target, TrendingUp, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export default function KpiDashboard({ employees }: { employees: any[] }) {
  // Mock data for demo purposes
  const kpiData = [
    { name: 'Jan', performance: 85, attendance: 95 },
    { name: 'Feb', performance: 88, attendance: 92 },
    { name: 'Mar', performance: 92, attendance: 96 },
    { name: 'Apr', performance: 90, attendance: 94 },
    { name: 'May', performance: 95, attendance: 98 },
    { name: 'Jun', performance: 96, attendance: 97 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">مؤشرات الأداء وتحليل الكفاءة</h2>
          </div>
          <p className="text-zinc-400 text-sm font-medium">مراقبة الأداء، الحضور، وتأثيرهما المباشر على الأجور والمكافآت.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-fuchsia-50 rounded-2xl flex items-center justify-center"><TrendingUp className="w-6 h-6 text-fuchsia-600" /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">متوسط الأداء العام</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-zinc-900">92%</h3>
            <p className="text-emerald-600 text-sm font-bold mt-2 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> +3.2% من الشهر الماضي</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><Clock className="w-6 h-6 text-blue-600" /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">معدل الانضباط الوظيفي</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-zinc-900">96.5%</h3>
            <p className="text-zinc-500 text-sm font-bold mt-2">متوسط حضور كافة الموظفين</p>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:shadow-md transition">
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center"><CheckCircle2 className="w-6 h-6 text-emerald-600" /></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">تحقيق الأهداف</span>
          </div>
          <div>
            <h3 className="text-4xl font-black text-zinc-900">24/28</h3>
            <p className="text-zinc-500 text-sm font-bold mt-2">أهداف رئيسية محققة</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8">
          <h3 className="text-lg font-black text-zinc-900 mb-6">تطور أداء الشركة والحضور (أخر 6 أشهر)</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={kpiData}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 700 }} dx={-10} domain={[60, 100]} />
                <Tooltip cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="performance" stroke="#d946ef" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" name="تقييم الأداء (%)" />
                <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAtt)" name="معدل الحضور (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm p-8 overflow-hidden flex flex-col">
          <h3 className="text-lg font-black text-zinc-900 mb-6">تقييم الموظفين وتأثير الرواتب</h3>
          <div className="space-y-4 overflow-y-auto flex-1 pr-2">
            {employees.slice(0, 5).map(emp => (
              <div key={emp.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 hover:bg-zinc-50 transition cursor-pointer">
                <div>
                  <h4 className="font-bold text-zinc-900">{emp.nameAr || emp.nameEn || emp.email}</h4>
                  <p className="text-xs text-zinc-500 font-medium">{emp.department || "قسم التقنية"} • {emp.position}</p>
                </div>
                <div className="text-left">
                  <div className="text-sm font-black text-emerald-600 mb-1">+5% مكافأة أداء متوقعة</div>
                  <div className="w-32 bg-zinc-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-fuchsia-500 h-full rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
              </div>
            ))}
            {employees.length === 0 && (
              <div className="text-center py-10 text-zinc-400 font-bold">لا يوجد بيانات موظفين لعرض التقييمات.</div>
            )}
            <button className="w-full mt-4 py-3 bg-zinc-50 text-zinc-600 font-bold text-sm rounded-xl hover:bg-zinc-100 transition">
              عرض جميع الموظفين
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
