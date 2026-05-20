import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Store, CheckCircle2, Zap, ArrowUpRight, Search, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useSettings } from '../contexts/SettingsContext';

const APPS = [
  {
    id: 'salla',
    name: 'سلة',
    category: 'e-commerce',
    description: 'مزامنة المنتجات، المخزون، والطلبات تلقائياً مع متجرك في سلة.',
    icon: 'https://cdn.salla.network/images/logo/logo-square.png',
    status: 'connected'
  },
  {
    id: 'zid',
    name: 'زد',
    category: 'e-commerce',
    description: 'إدارة متجرك في زد مباشرة من مدارج، مزامنة الفواتير والعملاء بضغطة زر.',
    icon: 'https://zid.sa/wp-content/uploads/2021/04/Zid-Logo-01.png',
    status: 'available'
  },
  {
    id: 'zatca',
    name: 'هيئة الزكاة والدخل (ZATCA)',
    category: 'compliance',
    description: 'الربط المباشر مع منصة فاتورة (المرحلة الثانية). معتمد رسمياً.',
    icon: 'https://zatca.gov.sa/ar/Style%20Library/ZATCA/assets/images/logo.svg',
    status: 'connected'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud API',
    category: 'communication',
    description: 'أرسل تنبيهات الفواتير المخصصة والرسائل الترحيبية لعملائك تلقائياً.',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    status: 'available'
  },
  {
    id: 'muqeem',
    name: 'مقيم',
    category: 'hr',
    description: 'جلب وتحديث بيانات الموظفين، الإقامات، والتأشيرات تلقائياً للحفاظ على الامتثال.',
    icon: 'https://muqeem.sa/img/muqeem-logo.png', // internal icon can be used if not loading
    status: 'available'
  },
  {
    id: 'moyasar',
    name: 'ميسر',
    category: 'payments',
    description: 'استقبل المدفوعات عبر مدى، آبل باي، والبطاقات الائتمانية فوراً.',
    icon: 'https://moyasar.com/assets/images/logo.svg',
    status: 'connected'
  },
  {
    id: 'stcpay',
    name: 'STC Pay',
    category: 'payments',
    description: 'بوابة الدفع المفضلة في السعودية مدعومة بشكل أصلي في فواتير مدارج.',
    icon: 'https://stcpay.com.sa/wp-content/themes/stcpay/assets/images/logo-ar.svg',
    status: 'available'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'communication',
    description: 'مئات التطبيقات بانتظارك. ارسل العملاء، الفواتير، ونشاطاتك إلى أكثر من 5000 تطبيق.',
    icon: 'https://cdn.worldvectorlogo.com/logos/zapier-2.svg',
    status: 'connected',
    premium: true
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'communication',
    description: 'تلق التنبيهات المباشرة للفواتير المتأخرة والعملاء الجدد في قنوات فريقك.',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b9/Slack_Technologies_Logo.svg',
    status: 'available'
  },
  {
    id: 'fasah',
    name: 'منصة فسح',
    category: 'logistics',
    description: 'تكامل كامل لبيانات الجمارك والاستيراد (ImportOS) وتتبع الشحنات.',
    icon: 'https://fasah.sa/images/fasah-logo.png',
    status: 'available'
  }
];

export default function Integrations() {
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'الكل' },
    { id: 'e-commerce', label: 'التجارة الإلكترونية' },
    { id: 'payments', label: 'المدفوعات' },
    { id: 'hr', label: 'الموارد البشرية' },
    { id: 'compliance', label: 'الامتثال والجهات الحكومية' },
  ];

  const filteredApps = APPS.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || app.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-l from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 relative overflow-hidden">
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs font-black text-primary border border-primary/20 mb-2 shadow-sm">
            <Sparkles className="w-3 h-3" />
            مجاناً بلا حدود في باقة Premium
          </div>
          <h1 className="text-3xl lg:text-4xl font-black text-zinc-900 tracking-tight">سوق التطبيقات والربط المباشر</h1>
          <p className="text-zinc-600 text-lg font-medium max-w-2xl">
            لا داعي لدفع رسوم إضافية للربط أو الاستعانة بمبرمجين. بنقرة واحدة، اربط مدارج مع أهم الأنظمة والمنصات الحكومية والتجارية لتصبح مركز عملياتك الموحد.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl shadow-primary/10 flex items-center justify-center border-4 border-white rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <Store className="w-10 h-10 text-primary" />
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 shadow-sm">
        <div className="shrink-0 w-12 h-12 bg-amber-100 rounded-2xl flex flex-col items-center justify-center border border-amber-200 text-amber-600 shadow-inner rotate-3">
          <Zap className="w-6 h-6 " />
        </div>
        <div className="text-center sm:text-right">
          <h2 className="text-lg font-black text-amber-900">جميع هذه التكاملات ستتوفر قريباً! (قيد التطوير)</h2>
          <p className="text-sm font-bold text-amber-700 mt-1 max-w-3xl">
            هذه الصفحة للعرض فقط في الوقت الحالي. لا يمكن ربط أي من هذه التطبيقات بشكل حقيقي بعد. نحن نعمل بجد لإتاحة هذه الخصائص قريباً جداً!
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm sticky top-0 z-20">
        <div className="flex overflow-x-auto hide-scrollbar w-full md:w-auto p-1 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300",
                activeTab === tab.id
                  ? "bg-zinc-900 text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="ابحث عن تطبيق للربط..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 border-none rounded-xl pl-10 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/30 transition-shadow outline-none"
          />
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white border border-zinc-200 hover:border-primary/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 cursor-pointer flex flex-col h-full overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center p-3 shadow-sm group-hover:shadow-md transition-shadow bg-white">
                <img 
                  src={app.icon} 
                  alt={app.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://ui-avatars.com/api/?name=" + app.name + "&background=random";
                  }}
                />
              </div>
              <div className="flex flex-col items-end gap-2">
                {app.status === 'connected' ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                    <CheckCircle2 className="w-3 h-3" />
                    متصل
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                    متوفر
                  </span>
                )}
              </div>
            </div>

            <div className="mb-6 flex-1 relative z-10">
              <h3 className="text-xl font-black text-zinc-900 mb-2 group-hover:text-primary transition-colors">{app.name}</h3>
              <p className="text-sm font-medium text-zinc-500 leading-relaxed">{app.description}</p>
            </div>

            <div className="pt-4 border-t border-zinc-100 flex items-center justify-between relative z-10">
              {app.premium ? (
                <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-md">Premium</span>
              ) : (
                <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-md">مجاني 100%</span>
              )}
              
              <button className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all",
                app.status === 'connected' 
                  ? "bg-zinc-100 text-zinc-700 hover:bg-zinc-200" 
                  : "bg-zinc-900 text-white hover:bg-primary shadow-md hover:shadow-lg hover:shadow-primary/30"
              )}>
                {app.status === 'connected' ? 'إدارة الربط' : 'تفعيل الربط الآن'}
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Grow section */}
      <div className="mt-12 bg-zinc-950 rounded-[2rem] p-8 md:p-12 text-center relative overflow-hidden text-white border border-zinc-800 shadow-2xl">
         <div className="absolute inset-0 bg-primary/20 blur-[120px] mix-blend-overlay pointer-events-none" />
         <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 rotate-12">
               <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">برنامج الشركاء: انمو مع مدارج</h2>
            <p className="text-lg text-zinc-400 font-medium max-w-2xl mx-auto">
              شارك مدارج مع زملائك في ريادة الأعمال. احصل على <span className="text-primary font-black">شهرين مجاناً</span> لك ولصديقك عند تسجيله. لا يوجد حد أقصى!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
               <button className="px-8 py-4 bg-white text-zinc-950 rounded-2xl font-black hover:scale-105 active:scale-95 transition-all text-sm w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                 انسخ رابط الدعوة الخاص بك
               </button>
               <button className="px-8 py-4 bg-zinc-800 rounded-2xl font-bold text-white hover:bg-zinc-700 transition-all text-sm w-full sm:w-auto">
                 تتبع أرباحك وإحالاتك
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
