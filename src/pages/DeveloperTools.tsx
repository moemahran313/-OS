import React from 'react';
import { motion } from 'motion/react';
import { Code2, Key, Globe, Terminal, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function DeveloperTools() {
  const apiKey = 'sk_mudarij_8x9a7b6c5d4e3f2g1h0';
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('تم النسخ بنجاح');
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
          <Code2 className="w-8 h-8 text-primary" /> أدوات المطورين و واجهة برمجة التطبيقات (API)
        </h1>
        <p className="text-zinc-500 mt-2 font-medium">اربط أنظمتك الحالية، مثل المنصات المحلية كـ "سلة" و"زد"، مع مدارج OS بسهولة.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <Key className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-black">مفاتيح API الخاصة بالمنشأة</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-zinc-500 mb-1 block">Live API Key (الإنتاج)</label>
              <div className="flex items-center gap-2">
                <input 
                  type="password" 
                  readOnly 
                  value={apiKey} 
                  className="flex-1 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2 font-mono text-sm text-zinc-600 outline-none"
                />
                <button 
                  onClick={() => copyToClipboard(apiKey)}
                  className="p-2.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1">يُستخدم للتشغيل الفعلي. لا تشارك هذا المفتاح أبداً.</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6 border-b border-zinc-100 pb-4">
            <Globe className="w-6 h-6 text-blue-500" />
            <h3 className="text-lg font-black">حالة الربط مع المتاجر المحلية</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-zinc-100 rounded-xl bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center font-bold text-emerald-500">سلة</div>
                <div>
                  <h4 className="font-bold text-sm">متجر سلة</h4>
                  <p className="text-xs text-zinc-500">غير متصل</p>
                </div>
              </div>
              <button className="text-xs font-bold bg-white border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-zinc-50">توصيل</button>
            </div>
            
            <div className="flex items-center justify-between p-3 border border-zinc-100 rounded-xl bg-zinc-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm border border-zinc-100 flex items-center justify-center font-bold text-purple-500">زد</div>
                <div>
                  <h4 className="font-bold text-sm">متجر زد</h4>
                  <p className="text-xs text-zinc-500">متصل عبر API</p>
                </div>
              </div>
              <button className="text-xs font-bold bg-white text-zinc-400 border border-zinc-200 px-3 py-1.5 rounded-lg shadow-sm" disabled>متصل</button>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-3">
          <Terminal className="w-5 h-5 text-zinc-400" />
          <h3 className="font-bold text-white text-sm">توثيق مبسط (Salla / Zid Webhook Example)</h3>
        </div>
        <div className="p-6">
          <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap overflow-x-auto" dir="ltr">
{`// مثال: استقبال طلب جديد من سلة وإنشاء فاتورة في مدارج

fetch('https://api.mudarij.com/v1/invoices', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + process.env.MUDARIJ_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    customer_name: sallaPayload.customer.name,
    customer_phone: sallaPayload.customer.mobile,
    items: sallaPayload.products.map(p => ({
      name: p.name,
      price: p.price,
      tax_rate: 15 // ضريبة القيمة المضافة ZATCA
    })),
    source: 'salla_webhook'
  })
})
.then(res => res.json())
.then(data => console.log('Invoice created:', data.invoice_id));`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}
