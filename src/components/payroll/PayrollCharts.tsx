import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#64748b'];

export default function PayrollCharts({ employees, runs }: { employees: any[], runs: any[] }) {
  // Monthly costs from historic runs
  const monthlyData = useMemo(() => {
    // Generate last 6 months data based on runs, plus forecast
    const data = [];
    const runMap = new Map();
    runs.forEach(r => {
      if (r.month) runMap.set(r.month, r.totalGross);
    });
    
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toISOString().substring(0, 7); // YYYY-MM
      const amount = runMap.get(monthStr) || (employees.reduce((sum, e) => sum + (e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0), 0) / 100);
      data.push({
        name: d.toLocaleString('en-US', { month: 'short' }),
        cost: amount,
        forecast: null
      });
    }
    
    // Add forecast for next month
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const forecastCost = employees.reduce((sum, e) => sum + (e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0), 0) / 100;
    data.push({
      name: nextMonth.toLocaleString('en-US', { month: 'short' }) + ' (Forecast)',
      cost: null,
      forecast: forecastCost * 1.05 // 5% projected growth 
    });

    return data;
  }, [runs, employees]);

  // Department breakdown
  const deptData = useMemo(() => {
    const deps: Record<string, number> = {};
    employees.forEach(e => {
      const g = ((e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0)) / 100;
      const d = e.department || 'General';
      deps[d] = (deps[d] || 0) + g;
    });
    return Object.entries(deps).map(([name, value]) => ({ name, value }));
  }, [employees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-6 border border-zinc-200 rounded-[2rem] shadow-sm">
        <h3 className="text-lg font-black text-zinc-900 mb-6">Month-over-Month Salary Costs & Forecast</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 700 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a', fontWeight: 700 }} dx={-10} />
              <Tooltip cursor={{ stroke: '#e4e4e7', strokeWidth: 2 }} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Area type="monotone" dataKey="cost" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" name="Actual Cost (SAR)" connectNulls />
              <Area type="monotone" dataKey="forecast" stroke="#8b5cf6" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorForecast)" name="Forecast Cost (SAR)" connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 border border-zinc-200 rounded-[2rem] shadow-sm">
        <h3 className="text-lg font-black text-zinc-900 mb-6">Payroll Breakdown by Department</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deptData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {deptData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toLocaleString()} SAR`} contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
