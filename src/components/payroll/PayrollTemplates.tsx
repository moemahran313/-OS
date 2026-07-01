import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ClipboardList,
  Check,
  Info,
  Sparkles,
  Sliders,
} from "lucide-react";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { toast } from "sonner";

interface PayrollTemplate {
  id?: string;
  name: string;
  baseSalary: number;
  housingType: "fixed" | "percent";
  housingValue: number;
  transportType: "fixed" | "percent";
  transportValue: number;
  gosiSaudiPercent: number;
  gosiNonSaudiPercent: number;
  absentDeductionRate: number; // e.g. 1.5 times daily rate or flat amount
  notes?: string;
  userId: string;
}

export default function PayrollTemplates() {
  const { user } = useUser();
  const [templates, setTemplates] = useState<PayrollTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [baseSalary, setBaseSalary] = useState(5000);
  const [housingType, setHousingType] = useState<"fixed" | "percent">("percent");
  const [housingValue, setHousingValue] = useState(25); // 25% of base salary is standard housing
  const [transportType, setTransportType] = useState<"fixed" | "percent">("fixed");
  const [transportValue, setTransportValue] = useState(500); // 500 SAR standard transport
  const [gosiSaudiPercent, setGosiSaudiPercent] = useState(10); // Standard employee GOSI
  const [gosiNonSaudiPercent, setGosiNonSaudiPercent] = useState(2); // Standard hazard GOSI for expat
  const [absentDeductionRate, setAbsentDeductionRate] = useState(1); // 1 day base pay deduction per absent day
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(collection(db, "payroll_templates"), where("userId", "==", user.uid));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: PayrollTemplate[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as PayrollTemplate);
        });
        setTemplates(list);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching templates:", error);
        toast.error("حدث خطأ أثناء تحميل قوالب مسير الرواتب");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const resetForm = () => {
    setName("");
    setBaseSalary(5000);
    setHousingType("percent");
    setHousingValue(25);
    setTransportType("fixed");
    setTransportValue(500);
    setGosiSaudiPercent(10);
    setGosiNonSaudiPercent(2);
    setAbsentDeductionRate(1);
    setNotes("");
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid) return;

    if (!name.trim()) {
      toast.error("يرجى إدخال اسم قالب مسير الرواتب");
      return;
    }

    const templateData = {
      name,
      baseSalary: Number(baseSalary),
      housingType,
      housingValue: Number(housingValue),
      transportType,
      transportValue: Number(transportValue),
      gosiSaudiPercent: Number(gosiSaudiPercent),
      gosiNonSaudiPercent: Number(gosiNonSaudiPercent),
      absentDeductionRate: Number(absentDeductionRate),
      notes,
      userId: user.uid,
      updatedAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "payroll_templates", editingId), templateData);
        toast.success("🎉 تم تحديث قالب الرواتب بنجاح!");
      } else {
        await addDoc(collection(db, "payroll_templates"), {
          ...templateData,
          createdAt: serverTimestamp(),
        });
        toast.success("🎉 تم حفظ قالب الرواتب الجديد بنجاح!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error("حدث خطأ أثناء حفظ القالب");
    }
  };

  const handleEdit = (tmpl: PayrollTemplate) => {
    setEditingId(tmpl.id || null);
    setName(tmpl.name);
    setBaseSalary(tmpl.baseSalary);
    setHousingType(tmpl.housingType);
    setHousingValue(tmpl.housingValue);
    setTransportType(tmpl.transportType);
    setTransportValue(tmpl.transportValue);
    setGosiSaudiPercent(tmpl.gosiSaudiPercent);
    setGosiNonSaudiPercent(tmpl.gosiNonSaudiPercent);
    setAbsentDeductionRate(tmpl.absentDeductionRate);
    setNotes(tmpl.notes || "");
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف قالب الرواتب هذا؟")) return;
    try {
      await deleteDoc(doc(db, "payroll_templates", id));
      toast.success("تم حذف القالب بنجاح");
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error("فشل حذف القالب");
    }
  };

  const loadSampleTemplate = () => {
    setName("الفئة التشغيلية والعمالة");
    setBaseSalary(3500);
    setHousingType("fixed");
    setHousingValue(1000);
    setTransportType("fixed");
    setTransportValue(300);
    setGosiSaudiPercent(10);
    setGosiNonSaudiPercent(2);
    setAbsentDeductionRate(1.5);
    setNotes("قالب الرواتب الموحد لعمال تشغيل ومستودعات شركة مدارج ممتثل للحد الأدنى للأجور.");
    toast.success("💡 تم تعبئة البيانات الافتراضية للفئة التشغيلية والعمالية!");
  };

  return (
    <div className="space-y-6">
      {/* Description / Introduction Banner */}
      <div className="bg-zinc-900 p-8 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              قوالب مسير الرواتب الذكية (Payroll Templates)
            </h2>
          </div>
          <p className="text-zinc-400 text-sm font-medium">
            قم بتعريف قوالب مسبقة لتحديد البدلات (السكن، النقل) ونسب التأمينات الاجتماعية (GOSI)
            لتسريع إعداد رواتب المجموعات.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="relative z-10 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-2 transition cursor-pointer self-start md:self-center shrink-0"
          >
            <Plus className="w-4 h-4" />
            إنشاء قالب رواتب جديد
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Editable / Create Template Panel */}
        {isEditing && (
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-[2.25rem] p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-100">
              <h3 className="text-sm font-black text-zinc-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                {editingId ? "تعديل قالب الرواتب القائم" : "إنشاء قالب رواتب متكامل"}
              </h3>
              <div className="flex items-center gap-1.5">
                {!editingId && (
                  <button
                    type="button"
                    onClick={loadSampleTemplate}
                    className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-[10px] text-zinc-600 font-bold rounded"
                  >
                    نموذج تجريبي
                  </button>
                )}
                <button
                  onClick={resetForm}
                  className="text-zinc-400 hover:text-zinc-600 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500">اسم قالب الرواتب</label>
                <input
                  type="text"
                  placeholder="مثال: الإدارة التنفيذية، المهندسين الميدانيين..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500">
                    الراتب الأساسي المرجعي (SAR)
                  </label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 font-mono font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-500">
                    معدل خصم غياب اليوم الواحد
                  </label>
                  <select
                    value={absentDeductionRate}
                    onChange={(e) => setAbsentDeductionRate(Number(e.target.value))}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none"
                  >
                    <option value={1}>1.0 (خصم يوم بيوم)</option>
                    <option value={1.5}>1.5 (خصم يوم بـ 1.5 يوم طبقاً للائحة)</option>
                    <option value={2}>2.0 (خصم يوم بيومين)</option>
                  </select>
                </div>
              </div>

              {/* Allowance 1: Housing */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-150 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-700">🏠 بدل السكن المعتمد</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setHousingType("percent")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${housingType === "percent" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}
                    >
                      نسبة مئوية (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHousingType("fixed")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${housingType === "fixed" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}
                    >
                      مبلغ مقطوع (SAR)
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={housingValue}
                    onChange={(e) => setHousingValue(Number(e.target.value))}
                    className="bg-white border border-zinc-200 rounded-xl px-3 py-2 w-28 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-zinc-400 font-semibold">
                    {housingType === "percent"
                      ? "% من الراتب الأساسي (الافتراضي 25%)"
                      : "ريال سعودي مقطوع"}
                  </span>
                </div>
              </div>

              {/* Allowance 2: Transport */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-150 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-zinc-700">🚗 بدل النقل المعتمد</span>
                  <div className="flex bg-white rounded-lg p-0.5 border border-zinc-200">
                    <button
                      type="button"
                      onClick={() => setTransportType("percent")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${transportType === "percent" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}
                    >
                      نسبة مئوية (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTransportType("fixed")}
                      className={`px-2 py-1 rounded text-[10px] font-bold transition ${transportType === "fixed" ? "bg-zinc-900 text-white" : "text-zinc-500"}`}
                    >
                      مبلغ مقطوع (SAR)
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={transportValue}
                    onChange={(e) => setTransportValue(Number(e.target.value))}
                    className="bg-white border border-zinc-200 rounded-xl px-3 py-2 w-28 font-mono font-bold focus:outline-none"
                  />
                  <span className="text-zinc-400 font-semibold">
                    {transportType === "percent"
                      ? "% من الراتب الأساسي"
                      : "ريال سعودي مقطوع (الافتراضي 500)"}
                  </span>
                </div>
              </div>

              {/* GOSI Parameters */}
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-150">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-750 block">
                    🛡️ استقطاع التأمينات (السعوديين)
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      value={gosiSaudiPercent}
                      onChange={(e) => setGosiSaudiPercent(Number(e.target.value))}
                      className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 w-16 font-mono font-bold text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 font-bold">% من الراتب الأساسي</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-zinc-750 block">
                    🛡️ استقطاع التأمينات (الأجانب)
                  </span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <input
                      type="number"
                      value={gosiNonSaudiPercent}
                      onChange={(e) => setGosiNonSaudiPercent(Number(e.target.value))}
                      className="bg-white border border-zinc-200 rounded-xl px-2.5 py-1.5 w-16 font-mono font-bold text-center focus:outline-none"
                    />
                    <span className="text-[10px] text-zinc-400 font-bold">% من الراتب الأساسي</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-500">
                  ملاحظات توضيحية أو الفئات المستهدفة
                </label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات تظهر للمدقق عند إسناد هذا القالب..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2 font-bold focus:ring-2 focus:ring-emerald-500/10 outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl transition cursor-pointer text-center"
                >
                  {editingId ? "تحديث قالب الرواتب" : "حفظ وحفظ القالب للعمل"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold rounded-xl transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right List: Display Existing Templates */}
        <div className={isEditing ? "lg:col-span-7 space-y-4" : "lg:col-span-12 space-y-4"}>
          <div className="bg-white border border-zinc-200 rounded-[2.25rem] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-black text-zinc-800">
                القوالب المتاحة بالنظام حالياً ({templates.length})
              </h3>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                DURABLE CLOUD SYNC
              </span>
            </div>

            {loading ? (
              <div className="p-16 text-center text-zinc-400 font-bold text-xs">
                جاري تحميل القوالب...
              </div>
            ) : templates.length === 0 ? (
              <div className="p-16 text-center text-zinc-400 space-y-3">
                <ClipboardList className="w-8 h-8 text-zinc-300 mx-auto" />
                <p className="text-xs font-black text-zinc-500">
                  لا توجد قوالب رواتب معرفة حالياً.
                </p>
                <p className="text-[10px] text-zinc-400 font-bold max-w-sm mx-auto">
                  قم بإنشاء قوالب رواتب لتسهيل وتوحيد البدلات وتأمينات GOSI للمجموعات بدلاً من
                  تعبئتها يدوياً لكل موظف.
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-black rounded-xl transition cursor-pointer"
                >
                  ابدأ بتصميم قالب الآن
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map((tmpl) => (
                  <div
                    key={tmpl.id}
                    className="border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 hover:shadow-md transition duration-200 rounded-3xl p-5 flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1 text-right">
                          <h4 className="text-sm font-black text-zinc-900">{tmpl.name}</h4>
                          {tmpl.notes && (
                            <p className="text-[10px] text-zinc-400 font-bold">{tmpl.notes}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 no-print">
                          <button
                            onClick={() => handleEdit(tmpl)}
                            className="p-1.5 bg-white border border-zinc-150 hover:border-zinc-300 rounded-lg text-zinc-600 transition"
                            title="تعديل القالب"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => tmpl.id && handleDelete(tmpl.id)}
                            className="p-1.5 bg-white border border-zinc-150 hover:bg-rose-100 hover:border-rose-200 rounded-lg text-rose-500 transition"
                            title="حذف القالب"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="h-px bg-zinc-200/50 my-2" />

                      <div className="grid grid-cols-2 gap-3 text-[10px] font-bold text-zinc-500">
                        <div className="space-y-0.5 text-right">
                          <span>الراتب المرجعي:</span>
                          <span className="block text-xs font-black text-zinc-800 font-mono">
                            {tmpl.baseSalary.toLocaleString()} ر.س
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span>بدل السكن:</span>
                          <span className="block text-xs font-black text-zinc-850 font-mono">
                            {tmpl.housingValue} {tmpl.housingType === "percent" ? "%" : "ر.س"}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span>بدل النقل:</span>
                          <span className="block text-xs font-black text-zinc-850 font-mono">
                            {tmpl.transportValue} {tmpl.transportType === "percent" ? "%" : "ر.س"}
                          </span>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <span>معدل خصم الغياب:</span>
                          <span className="block text-xs font-black text-zinc-850 font-mono">
                            {tmpl.absentDeductionRate} يوم
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-zinc-150 rounded-2xl p-3 flex justify-between text-[9px] font-black">
                      <div className="text-right text-indigo-700">
                        🛡️ GOSI سعودي: <span className="font-mono">{tmpl.gosiSaudiPercent}%</span>
                      </div>
                      <div className="text-right text-emerald-700">
                        🛡️ GOSI أجنبي:{" "}
                        <span className="font-mono">{tmpl.gosiNonSaudiPercent}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
