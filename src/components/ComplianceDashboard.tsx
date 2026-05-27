import React, { useEffect, useState } from "react";
import { db } from "@/src/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useUser } from "@/src/contexts/UserContext";
import { Employee } from "@/src/types";
import { motion } from "motion/react";
import { CheckCircle2, AlertTriangle, ShieldAlert, Users, FileWarning } from "lucide-react";

export default function ComplianceDashboard() {
  const { user } = useUser();
  const [employees, setEmployees] = useState<Employee[]>([]);
  
  useEffect(() => {
    if (!user) return;
    
    const q = query(collection(db, "employees"), where("status", "==", "active")); // just looking at all for simplicity, or ideally scoped by user ID/company if exists
    
    // In our app, employee docs have 'userId' to ensure multi-tenant safety
    const safeQuery = query(collection(db, "employees"), where("userId", "==", user.uid));
    
    const unsub = onSnapshot(safeQuery, (snapshot) => {
       const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Employee));
       setEmployees(docs);
    });
    
    return () => unsub();
  }, [user]);

  const stats = React.useMemo(() => {
    let wpsCompliant = 0;
    let wpsDelayed = 0;
    let wpsViolations = 0;
    
    let docsExpiringSoon = 0;
    let docsExpired = 0;

    employees.forEach(emp => {
      // WPS
      if (emp.wpsStatus === 'compliant') wpsCompliant++;
      else if (emp.wpsStatus === 'delayed') wpsDelayed++;
      else if (emp.wpsStatus === 'violation') wpsViolations++;
      
      // Docs
      if (emp.documents) {
         emp.documents.forEach(doc => {
            if (doc.status === 'expired') docsExpired++;
            if (doc.status === 'expiring_soon') docsExpiringSoon++;
         });
      }
    });

    // Mock Nitaqat evaluation
    const saudiCount = employees.filter(e => e.nationality === 'سعودي').length;
    const expatCount = employees.length - saudiCount;
    const saudizationPct = employees.length > 0 ? (saudiCount / employees.length) * 100 : 0;
    
    let nitaqatColor = 'bg-slate-200 text-slate-700 border-slate-300';
    let nitaqatLabel = 'غير محدد';
    if (saudizationPct >= 20) {
       nitaqatColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
       nitaqatLabel = 'أخضر مرتفع';
    } else if (saudizationPct >= 10) {
       nitaqatColor = 'bg-green-50 text-green-700 border-green-200';
       nitaqatLabel = 'أخضر منخفض';
    } else if (saudizationPct > 0) {
       nitaqatColor = 'bg-yellow-50 text-yellow-700 border-yellow-200';
       nitaqatLabel = 'أصفر';
    } else if (employees.length > 0) {
       nitaqatColor = 'bg-rose-50 text-rose-700 border-rose-200';
       nitaqatLabel = 'أحمر';
    }

    return {
      wpsCompliant, wpsDelayed, wpsViolations,
      docsExpiringSoon, docsExpired,
      saudiCount, expatCount, saudizationPct,
      nitaqatColor, nitaqatLabel
    };
  }, [employees]);

  return (
    <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-black text-slate-900">لوحة الامتثال التنظيمي (Compliance)</h2>
        <span className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-xs">Live</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nitaqat Card */}
        <div className={`p-5 rounded-2xl border ${stats.nitaqatColor}`}>
           <div className="flex items-center gap-2 mb-3">
             <Users className="w-5 h-5" />
             <h3 className="font-bold">نطاقات (Nitaqat)</h3>
           </div>
           <div className="text-3xl font-black mb-1">{stats.nitaqatLabel}</div>
           <p className="text-xs font-bold opacity-80">نسبة التوطين: {stats.saudizationPct.toFixed(1)}%</p>
           
           <div className="mt-4 flex max-w-full gap-1 h-2 rounded-full overflow-hidden bg-white/50">
              {stats.saudiCount > 0 && <div style={{width: `${stats.saudizationPct}%`}} className="bg-emerald-500 h-full"></div>}
              {stats.expatCount > 0 && <div style={{width: `${100 - stats.saudizationPct}%`}} className="bg-slate-300 h-full"></div>}
           </div>
        </div>

        {/* WPS Card */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
           <div className="flex items-center gap-2 mb-3 text-slate-700">
             <ShieldAlert className="w-5 h-5" />
             <h3 className="font-bold">حماية الأجور (WPS)</h3>
           </div>
           <div className="flex justify-between items-end">
              <div>
                 <div className="text-3xl font-black text-slate-900">{stats.wpsCompliant}</div>
                 <p className="text-xs font-bold text-slate-500">موظف ممتثل</p>
              </div>
              <div className="text-right space-y-1">
                 {stats.wpsDelayed > 0 && <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">متأخر: {stats.wpsDelayed}</div>}
                 {stats.wpsViolations > 0 && <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">مخالف: {stats.wpsViolations}</div>}
              </div>
           </div>
        </div>
        
        {/* Documents Card */}
        <div className="p-5 rounded-2xl border border-zinc-200 bg-zinc-50">
           <div className="flex items-center gap-2 mb-3 text-slate-700">
             <FileWarning className="w-5 h-5" />
             <h3 className="font-bold">الوثائق والإقامات</h3>
           </div>
           <div className="space-y-3">
              <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-600">منتهية الصلاحية:</span>
                 <span className={`text-sm font-black ${stats.docsExpired > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{stats.docsExpired}</span>
              </div>
              <div className="flex items-center justify-between">
                 <span className="text-sm font-bold text-slate-600">تنتهي قريباً:</span>
                 <span className={`text-sm font-black ${stats.docsExpiringSoon > 0 ? 'text-amber-600' : 'text-slate-400'}`}>{stats.docsExpiringSoon}</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
