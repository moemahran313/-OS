import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Lock, Smartphone, KeyRound, Server, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const securityData = [
  { time: '08:00', authAttempts: 12, apiCalls: 154 },
  { time: '10:00', authAttempts: 45, apiCalls: 320 },
  { time: '12:00', authAttempts: 32, apiCalls: 280 },
  { time: '14:00', authAttempts: 65, apiCalls: 512 },
  { time: '16:00', authAttempts: 20, apiCalls: 190 },
  { time: '18:00', authAttempts: 10, apiCalls: 85 },
  { time: '20:00', authAttempts: 5, apiCalls: 30 },
];

export default function SecurityCompliance() {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto font-sans" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-500" /> الأمان والامتثال (Security & Compliance)
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">لوحة التحكم الأمنية لحماية بيانات منشأتك وعملائك وفق أعلى المعايير.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/20 via-zinc-900 to-zinc-900 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-black">حالة التشفير الحالية</h3>
                <p className="text-xs text-emerald-400 font-bold">نشط وآمن (Active)</p>
              </div>
            </div>
            
            <p className="text-sm text-zinc-300 font-medium leading-relaxed mb-6">
              جميع بيانات العميل، الفواتير، والعقود مشفرة باستخدام خوارزمية <strong className="text-white bg-white/10 px-1 rounded">AES-256</strong> المتقدمة. البيانات محفوظة في خوادم سحابية ممتثلة لمعايير الإقامة المحلية للبيانات.
            </p>

            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
              <Server className="w-4 h-4" /> خوادم منطقة الشرق الأوسط (me-central)
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-black text-zinc-900">التحقق الثنائي (2FA)</h3>
            </div>
            <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-6">
              أضف طبقة حماية إضافية لحسابات المديرين. عند تسجيل الدخول، ستحتاج إلى إدخال رمز مؤقت من تطبيق المُصادق (Authenticator App).
            </p>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-bold text-zinc-700">تفعيل التحقق الثنائي</span>
            </div>
            <button 
              onClick={() => setIs2FAEnabled(!is2FAEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${is2FAEnabled ? 'bg-emerald-500' : 'bg-zinc-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${is2FAEnabled ? '-translate-x-6' : '-translate-x-1'}`} />
            </button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-zinc-900">مراقبة الأمان والوصول</h3>
              <p className="text-xs text-zinc-500 mt-1 font-medium">نشاط تسجيل الدخول واستخدام API خلال اليوم</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              طلبات API
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              محاولات الدخول
            </div>
          </div>
        </div>
        
        <div className="h-72 w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={securityData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAuth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#71717a' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#18181b', marginBottom: '4px' }}
              />
              <Area type="monotone" dataKey="apiCalls" name="API Calls" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApi)" />
              <Area type="monotone" dataKey="authAttempts" name="Auth Attempts" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorAuth)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-amber-50 border border-amber-200/50 p-6 rounded-2xl shadow-sm"
      >
        <div className="flex gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-amber-800 font-bold mb-2">امتثال الفوترة الإلكترونية ZATCA</h3>
            <p className="text-sm text-amber-700/80 font-medium leading-relaxed">
              هذا الحساب مهيأ تماماً لمتطلبات المرحلة الثانية للربط والتكامل من هيئة الزكاة والضريبة والجمارك (ZATCA). المفاتيح التشفيرية CSID صالحة ويتم تجديدها تلقائياً خلف الكواليس.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
