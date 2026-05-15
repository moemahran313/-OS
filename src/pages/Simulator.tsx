import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Users, TrendingUp, AlertTriangle, CheckCircle2, ChevronDown, DollarSign } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { toast } from 'sonner';
import { useUser } from '@/src/contexts/UserContext';

// Internal type for baseline
interface Baseline {
  totalEmployees: number;
  saudiEmployees: number;
  expatEmployees: number;
  monthlyPayroll: number;
  complianceScore: number;
  vatExposure: number;
}

export default function Simulator() {
  const [activeTab, setActiveTab] = useState<'hiring' | 'salary' | 'expansion'>('hiring');
  const { user } = useUser();
  const [baseline, setBaseline] = useState<Baseline>({
    totalEmployees: 0,
    saudiEmployees: 0,
    expatEmployees: 0,
    monthlyPayroll: 0,
    complianceScore: 100,
    vatExposure: 0,
  });
  const [loading, setLoading] = useState(true);

  // Hiring simulation state
  const [hiringParams, setHiringParams] = useState({
    saudiCount: 0,
    expatCount: 0,
    averageSalary: 5000,
  });

  useEffect(() => {
    if (!user) return;
    const fetchBaseline = async () => {
      try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('@/src/lib/firebase');
        
        const q = query(collection(db, "employees"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const employees = snap.docs.map(d => d.data());
        
        const totalEmployees = employees.length;
        const saudiEmployees = employees.filter(e => e.nationality === 'سعودي' || e.nationality === 'Saudi').length;
        const expatEmployees = totalEmployees - saudiEmployees;
        
        const monthlyPayroll = employees.reduce((acc, e) => {
           return acc + ((e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0) + (e.transportAllowanceHalalas || 0));
        }, 0) / 100;
        
        setBaseline({
          totalEmployees,
          saudiEmployees,
          expatEmployees,
          monthlyPayroll,
          complianceScore: totalEmployees > 0 ? (saudiEmployees / totalEmployees) * 100 : 100, // simplified score
          vatExposure: 0, // Mock removing
        });
      } catch (err) {
        console.error("Failed to fetch baseline:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBaseline();
  }, [user]);

  const calculateHiringImpact = () => {
    const newTotal = baseline.totalEmployees + hiringParams.saudiCount + hiringParams.expatCount;
    const newSaudi = baseline.saudiEmployees + hiringParams.saudiCount;
    const newExpat = baseline.expatEmployees + hiringParams.expatCount;
    
    const saudizationRatio = (newSaudi / newTotal) * 100;
    
    // Nitaqat Band Simulation (simplified ranges)
    let nitaqatBand = 'أحمر';
    let bandColor = 'text-rose-600 bg-rose-50 border-rose-200';
    if (saudizationRatio >= 40) {
      nitaqatBand = 'بلاتيني';
      bandColor = 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (saudizationRatio >= 30) {
      nitaqatBand = 'أخضر مرتفع';
      bandColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    } else if (saudizationRatio >= 20) {
      nitaqatBand = 'أخضر منخفض';
      bandColor = 'text-emerald-500 bg-emerald-50 border-emerald-100';
    } else if (saudizationRatio >= 10) {
      nitaqatBand = 'أصفر';
      bandColor = 'text-amber-600 bg-amber-50 border-amber-200';
    }

    const additionalPayroll = (hiringParams.saudiCount + hiringParams.expatCount) * hiringParams.averageSalary;
    const gosiEmployer = (hiringParams.saudiCount * hiringParams.averageSalary * 0.11) + (hiringParams.expatCount * hiringParams.averageSalary * 0.02); // 11% saudi, 2% expat

    const newComplianceScore = Math.min(100, Math.max(0, baseline.complianceScore + (hiringParams.saudiCount * 2) - (hiringParams.expatCount * 1)));

    return {
      saudizationRatio: parseFloat(saudizationRatio.toFixed(1)),
      nitaqatBand,
      bandColor,
      newPayroll: baseline.monthlyPayroll + additionalPayroll + gosiEmployer,
      gosiImpact: gosiEmployer,
      newComplianceScore,
    };
  };

  // Salary simulation state
  const [salaryParams, setSalaryParams] = useState({
    increasePercent: 0,
    affectedCount: 0,
    housingAllowanceChange: 0,
  });

  // Expansion simulation state
  const [expansionParams, setExpansionParams] = useState({
    branchesCount: 0,
    avgRevenue: 0,
    capexSetup: 0,
  });

  const calculateSalaryImpact = () => {
    // Basic simulation logic assuming affected count distributes roughly equally
    // over the current baseline
    const affectedRatio = baseline.totalEmployees > 0 ? Math.min(1, salaryParams.affectedCount / baseline.totalEmployees) : 0;
    
    const currentAffectedBase = baseline.monthlyPayroll * affectedRatio;
    const baseIncrease = currentAffectedBase * (salaryParams.increasePercent / 100);
    const housingIncrease = salaryParams.housingAllowanceChange * salaryParams.affectedCount;
    
    const newPayroll = baseline.monthlyPayroll + baseIncrease + housingIncrease;
    
    // GOSI roughly 11% on Saudi, 2% on expat. We'll use a weighted average approx.
    const saudiRatio = baseline.totalEmployees > 0 ? baseline.saudiEmployees / baseline.totalEmployees : 0;
    const expatRatio = 1 - saudiRatio;
    const gosiRate = (0.11 * saudiRatio) + (0.02 * expatRatio);
    
    const gosiImpact = (baseIncrease + housingIncrease) * gosiRate;

    return {
      newPayroll,
      increaseAmount: baseIncrease + housingIncrease,
      gosiImpact,
    };
  };

  const calculateExpansionImpact = () => {
    const revenue = expansionParams.branchesCount * expansionParams.avgRevenue;
    const outputVat = revenue * 0.15;
    const inputVat = expansionParams.branchesCount * expansionParams.capexSetup * 0.15;
    return {
      revenue,
      outputVat,
      inputVat,
      netVatMonth1: outputVat - inputVat
    };
  };

  const impact = calculateHiringImpact();
  const salaryImpact = calculateSalaryImpact();
  const expansionImpact = calculateExpansionImpact();

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 text-white rounded-[2rem] p-8 shadow-xl">
        <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" /> محاكي القرارات والامتثال
        </h2>
        <p className="text-zinc-400 text-sm max-w-2xl leading-relaxed">
          قم بمحاكاة قرارات التوظيف، زيادة الرواتب، أو التوسع، وشاهد التأثير المباشر على نسبة التوطين (نطاقات)، تكلفة الرواتب (تأمينات)، ومستوى المخاطرة بشكل استباقي.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-200 pb-2">
        {(['hiring', 'salary', 'expansion'] as const).map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={cn("px-5 py-2.5 rounded-[1.2rem] text-sm font-bold transition-all whitespace-nowrap", activeTab === tab ? "bg-white text-zinc-900 shadow-md border border-zinc-200" : "text-zinc-500 hover:bg-zinc-100")}
          >
            {tab === 'hiring' ? 'محاكاة التوظيف (نطاقات)' : tab === 'salary' ? 'تعديل الرواتب والمزايا' : 'محاكاة توسع الفروع'}
          </button>
        ))}
      </div>

      {activeTab === 'hiring' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-6">
              <h3 className="font-black text-lg text-zinc-900">مدخلات المحاكاة</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>عدد الموظفين السعوديين الجدد</span>
                    <span className="text-primary">{hiringParams.saudiCount}</span>
                  </label>
                  <input type="range" min="0" max="20" value={hiringParams.saudiCount} onChange={e => setHiringParams(prev => ({...prev, saudiCount: parseInt(e.target.value)}))} className="w-full accent-primary" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>عدد المقيمين الجدد (وافدين)</span>
                    <span className="text-zinc-500">{hiringParams.expatCount}</span>
                  </label>
                  <input type="range" min="0" max="20" value={hiringParams.expatCount} onChange={e => setHiringParams(prev => ({...prev, expatCount: parseInt(e.target.value)}))} className="w-full accent-zinc-500" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">متوسط الراتب المتوقع (ريال)</label>
                  <input type="number" step="500" value={hiringParams.averageSalary} onChange={e => setHiringParams(prev => ({...prev, averageSalary: parseInt(e.target.value) || 0}))} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h4 className="font-bold border-b border-zinc-200 pb-2 mb-4 text-xs">الوضع الحالي (قبل المحاكاة)</h4>
               <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">إجمالي الموظفين</span>
                    <span className="font-bold">{baseline.totalEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">نسبة التوطين</span>
                    <span className="font-bold">{((baseline.saudiEmployees / baseline.totalEmployees) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium">تكلفة الرواتب الشهرية</span>
                    <span className="font-bold">{baseline.monthlyPayroll.toLocaleString()} ريال</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex-1">
                <h3 className="font-black text-xl mb-6">نتائج المحاكاة والتأثير المباشر</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className={cn("p-6 rounded-2xl border flex flex-col gap-2", impact.bandColor)}>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">النطاق المتوقع (نطاقات)</span>
                      <span className="text-4xl font-black">{impact.nitaqatBand}</span>
                      <span className="text-sm font-medium opacity-90 mt-1">نسبة التوطين: {impact.saudizationRatio}%</span>
                   </div>

                   <div className={cn("p-6 rounded-2xl border flex flex-col gap-2", impact.newComplianceScore >= 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : impact.newComplianceScore >= 60 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900')}>
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">درجة الامتثال (Nitaqat & Mudad)</span>
                      <div className="flex items-end gap-2">
                         <span className="text-4xl font-black">{impact.newComplianceScore}</span>
                         <span className="text-lg font-bold">/ 100</span>
                      </div>
                      <span className="text-sm font-medium opacity-90 mt-1">
                         {impact.newComplianceScore > baseline.complianceScore ? 'تحسن في مؤشر الامتثال' : impact.newComplianceScore < baseline.complianceScore ? 'تراجع في مؤشر الامتثال' : 'لم يتغير مؤشر الامتثال'}
                      </span>
                   </div>
                </div>

                <h4 className="font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">التأثير المالي المتوقع</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-xs text-zinc-500 font-bold mb-1">الرواتب المتوقعة (شهرياً)</p>
                      <p className="text-lg font-black text-zinc-900">{impact.newPayroll.toLocaleString()} SAR</p>
                      <p className="text-[10px] text-zinc-400 mt-1">+ {(impact.newPayroll - baseline.monthlyPayroll).toLocaleString()} SAR زيادة</p>
                   </div>
                   <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-xs text-zinc-500 font-bold mb-1">تأمينات الموظف (GOSI)</p>
                      <p className="text-lg font-black text-rose-600">{impact.gosiImpact.toLocaleString()} SAR</p>
                      <p className="text-[10px] text-zinc-400 mt-1">حصة صاحب العمل الإضافية</p>
                   </div>
                   <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                      <p className="text-xs text-zinc-500 font-bold mb-1">التأثير على الزكاة/الضريبة</p>
                      <p className="text-lg font-black text-emerald-600">منخفض</p>
                      <p className="text-[10px] text-zinc-400 mt-1">لا يوجد أثر مباشر على ضريبة القيمة المضافة</p>
                   </div>
                </div>
                                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-4 items-start">
                   <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                   <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">توصيات النظام الاستباقية</p>
                      <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                         {impact.newComplianceScore < 70 && <li>الحذر: التوظيف المقترح سيقلل من درجة الامتثال مما قد يمنع المؤسسة من المناقصات الحكومية.</li>}
                         {hiringParams.expatCount > hiringParams.saudiCount * 2 && <li>نسبة توظيف الوافدين للسعوديين عالية، ينصح بزيادة السعوديين للحفاظ على النطاق الأخضر.</li>}
                         {impact.gosiImpact > 10000 && <li>تأكد من تحديث ميزانية الرواتب في نظام حماية الأجور (Mudad) لتفادي غرامات التأخير.</li>}
                         {impact.newComplianceScore >= 80 && <li>قرارات التوظيف الحالية ممتازة وتدعم الاستدامة والامتثال للقوانين السعودية.</li>}
                      </ul>
                   </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">سجل المراجعة (Audit Log - JSON Format)</h4>
                  <div className="bg-zinc-900 rounded-xl p-4 overflow-x-auto" dir="ltr">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify({
                        "simulation_type": "HIRING_IMPACT",
                        "timestamp": new Date().toISOString(),
                        "inputs": {
                          "new_saudi_hires": hiringParams.saudiCount,
                          "new_expat_hires": hiringParams.expatCount,
                          "average_salary_sar": hiringParams.averageSalary
                        },
                        "baseline": baseline,
                        "projected_results": impact,
                        "regulatory_flags": [
                          impact.newComplianceScore < 70 ? "HIGH_RISK_COMPLIANCE" : "COMPLIANT",
                          impact.saudizationRatio < 20 ? "NITAQAT_WARNING" : "NITAQAT_SAFE"
                        ]
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}
      
      {activeTab === 'expansion' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-6">
              <h3 className="font-black text-lg text-zinc-900">محاكاة توسع الفروع</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>عدد الفروع الجديدة</span>
                  </label>
                  <input type="number" min="0" max="10" placeholder="1" value={expansionParams.branchesCount} onChange={e => setExpansionParams({...expansionParams, branchesCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>متوسط الإيراد المتوقع للفرع (شهرياً)</span>
                  </label>
                  <input type="number" step="10000" placeholder="150000" value={expansionParams.avgRevenue} onChange={e => setExpansionParams({...expansionParams, avgRevenue: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">تكلفة التجهيزات للفرع (تدفع مرة واحدة)</label>
                  <input type="number" step="50000" placeholder="300000" value={expansionParams.capexSetup} onChange={e => setExpansionParams({...expansionParams, capexSetup: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-200 shadow-sm">
               <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-2 mb-4 text-xs">قوانين ZATCA ذات الصلة</h4>
               <p className="text-xs text-blue-800 leading-relaxed">
                  أي إيراد جديد يخضع لضريبة القيمة المضافة 15%. وتكاليف التجهيزات (رأس المال) يمكنك خصم ضريبتها (Input VAT) من إجمالي الضريبة المستحقة مما يحسن التدفق النقدي في الأشهر الأولى.
               </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex-1">
                <h3 className="font-black text-xl mb-6">نتائج المحاكاة: التوسع والإيرادات</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="p-6 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">إجمالي الإيرادات المتوقعة</span>
                      <span className="text-4xl font-black">+{expansionImpact.revenue.toLocaleString()} ريال</span>
                      <span className="text-sm font-medium opacity-90 mt-1">يضاف إليها {expansionImpact.outputVat.toLocaleString()} ريال (ضريبة Output VAT)</span>
                   </div>

                   <div className="p-6 rounded-2xl border bg-amber-50 border-amber-200 text-amber-900 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">الضريبة القابلة للخصم (Input VAT)</span>
                      <span className="text-4xl font-black">{expansionImpact.inputVat.toLocaleString()} ريال</span>
                      <span className="text-sm font-medium opacity-90 mt-1">من تجهيزات الفرع ({(expansionParams.capexSetup * expansionParams.branchesCount).toLocaleString()} ريال)</span>
                   </div>
                </div>

                <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                   <h4 className="text-sm font-bold text-zinc-900 mb-2">التدفق النقدي الضريبي (الشهر الأول)</h4>
                   <p className="text-xs text-zinc-600 mb-4">في الشهر الأول، ستكون ضريبة المخرجات أقل من ضريبة المدخلات، مما يعني وجود رصيد دائن لدى هيئة الزكاة والضريبة والجمارك.</p>
                   <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-zinc-100">
                      <span className="font-bold text-zinc-700">صافي الضريبة للشهر الأول (ZATCA)</span>
                      <span className="font-black text-emerald-600">{expansionImpact.netVatMonth1 <= 0 ? '-' : '+'}{Math.abs(expansionImpact.netVatMonth1).toLocaleString()} ريال {expansionImpact.netVatMonth1 <= 0 ? '(رصيد مسترد)' : '(مستحقة للدفع)'}</span>
                   </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">سجل المراجعة الضريبية (Audit Log - JSON Format)</h4>
                  <div className="bg-zinc-900 rounded-xl p-4 overflow-x-auto" dir="ltr">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {JSON.stringify({
                        "simulation_type": "EXPANSION_VAT_IMPACT",
                        "timestamp": new Date().toISOString(),
                        "inputs": {
                          "new_branches": expansionParams.branchesCount,
                          "avg_monthly_revenue": expansionParams.avgRevenue,
                          "capex_setup": expansionParams.capexSetup
                        },
                        "projected_results": {
                          "output_vat": expansionImpact.outputVat,
                          "input_vat_capex": expansionImpact.inputVat,
                          "net_vat_month_1": expansionImpact.netVatMonth1
                        },
                        "zatca_compliance": expansionImpact.netVatMonth1 <= 0 ? "ELIGIBLE_FOR_VAT_RETURN" : "VAT_PAYMENT_REQUIRED"
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'salary' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-6">
              <h3 className="font-black text-lg text-zinc-900">محاكاة تعديل الرواتب والمزايا</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>نسبة الزيادة السنوية للموظفين (٪)</span>
                  </label>
                  <input type="number" min="0" max="50" placeholder="5" value={salaryParams.increasePercent} onChange={e => setSalaryParams({...salaryParams, increasePercent: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700 flex justify-between">
                    <span>عدد الموظفين المشمولين بالزيادة</span>
                  </label>
                  <input type="number" placeholder="45" value={salaryParams.affectedCount} max={baseline.totalEmployees} onChange={e => setSalaryParams({...salaryParams, affectedCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-700">تعديل بدل السكن (مقطوع لكل موظف)</label>
                  <input type="number" step="1000" placeholder="2000" value={salaryParams.housingAllowanceChange} onChange={e => setSalaryParams({...salaryParams, housingAllowanceChange: parseInt(e.target.value) || 0})} className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
                </div>
              </div>
            </div>
            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-200 shadow-sm">
               <h4 className="font-bold text-amber-900 border-b border-amber-200 pb-2 mb-4 text-xs">حماية الأجور (Mudad) & تأمينات (GOSI)</h4>
               <p className="text-xs text-amber-800 leading-relaxed">
                  الزيادة في الراتب الأساسي أو بدل السكن تؤثر تلقائياً على اشتراكات التأمينات الاجتماعية (GOSI) وملف حماية الأجور. تذكر رفع العقود المحدثة في (مدد) لتفادي الانحرافات.
               </p>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex-1">
                <h3 className="font-black text-xl mb-6">نتائج المحاكاة: الالتزامات المالية</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                   <div className="p-6 rounded-2xl border bg-amber-50 border-amber-200 text-amber-900 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">تكلفة الرواتب الجديدة (شهرياً)</span>
                      <span className="text-4xl font-black">{salaryImpact.newPayroll.toLocaleString()} ريال</span>
                      <span className="text-sm font-medium opacity-90 mt-1">زيادة بنحو {salaryImpact.increaseAmount.toLocaleString()} ريال شهرياً</span>
                   </div>

                   <div className="p-6 rounded-2xl border bg-rose-50 border-rose-200 text-rose-900 flex flex-col gap-2">
                      <span className="text-xs font-bold uppercase tracking-widest opacity-80">أثر تأمينات (GOSI) الإضافي</span>
                      <span className="text-4xl font-black">+{salaryImpact.gosiImpact.toLocaleString()} ريال</span>
                      <span className="text-sm font-medium opacity-90 mt-1">يتحملها صاحب العمل شهرياً</span>
                   </div>
                </div>

                <div className="mt-8 p-4 bg-zinc-50 border border-zinc-200 rounded-xl">
                   <h4 className="text-sm font-bold text-zinc-900 mb-2">تحديث ملف حماية الأجور</h4>
                   <p className="text-xs text-zinc-600 mb-4">وفقاً لنظام (Mudad)، أي اختلاف بين المسير المرفوع والمبالغ المحولة عبر البنك بنسبة تتجاوز 10% سيؤدي إلى رفض الملف وإيقاف الخدمات.</p>
                   <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-zinc-100">
                      <span className="font-bold text-zinc-700">تطابق ملف حماية الأجور (متوقع)</span>
                      <span className="font-black text-amber-600">{salaryImpact.increaseAmount > (baseline.monthlyPayroll * 0.1) ? 'يتطلب تحديث العقود' : 'الزيادة ضمن المقبول'}</span>
                   </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold text-zinc-900 mb-4 border-b border-zinc-100 pb-2">سجل المراجعة الامتثالية (Audit Log - JSON Format)</h4>
                  <div className="bg-zinc-900 rounded-xl p-4 overflow-x-auto" dir="ltr">
                    <pre className="text-xs text-amber-400 font-mono">
                      {JSON.stringify({
                        "simulation_type": "SALARY_ADJUSTMENT_IMPACT",
                        "timestamp": new Date().toISOString(),
                        "inputs": {
                          "salary_increase_pct": salaryParams.increasePercent,
                          "employees_affected": salaryParams.affectedCount,
                          "housing_allowance_change_sar": salaryParams.housingAllowanceChange
                        },
                        "projected_results": {
                          "new_monthly_payroll": salaryImpact.newPayroll,
                          "additional_gosi_employer_share": salaryImpact.gosiImpact
                        },
                        "mudad_compliance": salaryImpact.increaseAmount > (baseline.monthlyPayroll * 0.1) ? "REQUIRES_CONTRACT_UPDATE" : "WITHIN_LIMITS"
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
