import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  ArrowLeft,
  ArrowRight,
  Plus,
  Play,
  CheckCircle,
  AlertTriangle,
  Building2,
  Trash2,
  Mail,
  Smartphone,
  MessageSquareCode,
  Bell,
  Clock,
  ArrowRightLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { AutomationRule } from "../../types/chat";

const defaultRules: AutomationRule[] = [
  {
    id: "rule-1",
    name: "إعادة توجيه وتصنيف كبار العملاء (VIP)",
    trigger: "keyword_detected",
    triggerDetail: "VIP / عقد / اشتراك سنوي",
    actions: ["توجيه إلى فريق كبار العملاء", "إضافة وسم 'VIP' للملف", "إرسال إشعار للمدير"],
    isActive: true,
  },
  {
    id: "rule-2",
    name: "التصعيد التلقائي الفوري للعميل الغاضب",
    trigger: "sentiment_angry",
    actions: ["تغيير الأولوية إلى 'عاجل جداً'", "تحويل مباشر لمشرف الدعم", "تنبيه عبر قناة Slack للمشرفين"],
    isActive: true,
  },
  {
    id: "rule-3",
    name: "مستشار المبيعات التلقائي (AI Sales Agent)",
    trigger: "message_received",
    triggerDetail: "تضمين كلمات 'أسعار / اشتراك / عرض سعر'",
    actions: ["إنشاء فرصة مبيعات في الـ CRM تلقائياً", "إرسال بروشور الخدمات والأسعار (PDF)", "إدراج رابط حجز موعد هاتفياً"],
    isActive: true,
  },
  {
    id: "rule-4",
    name: "الردود التلقائية لرسائل خارج أوقات العمل",
    trigger: "off_hours",
    actions: ["إرسال رسالة اعتذار آلية بجدول المواعيد", "تأجيل المحادثة لصباح اليوم التالي"],
    isActive: false,
  },
];

export default function WorkflowsView() {
  const [rules, setRules] = useState<AutomationRule[]>(defaultRules);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTrigger, setNewTrigger] = useState<AutomationRule["trigger"]>("message_received");
  const [newTriggerDetail, setNewTriggerDetail] = useState("");
  const [newActionInput, setNewActionInput] = useState("");
  const [newActions, setNewActions] = useState<string[]>([]);

  const handleToggleRule = (id: string) => {
    setRules(
      rules.map((r) => {
        if (r.id === id) {
          const updated = !r.isActive;
          toast.success(`تم ${updated ? "تفعيل" : "تعطيل"} قاعدة الأتمتة بنجاح!`);
          return { ...r, isActive: updated };
        }
        return r;
      })
    );
  };

  const handleAddAction = () => {
    if (newActionInput.trim()) {
      setNewActions([...newActions, newActionInput.trim()]);
      setNewActionInput("");
    }
  };

  const handleRemoveAction = (idx: number) => {
    setNewActions(newActions.filter((_, i) => i !== idx));
  };

  const handleSaveRule = () => {
    if (!newName.trim() || newActions.length === 0) {
      toast.error("يرجى إدخال اسم القاعدة وإضافة إجراء واحد على الأقل.");
      return;
    }

    const created: AutomationRule = {
      id: "rule-" + Date.now(),
      name: newName,
      trigger: newTrigger,
      triggerDetail: newTriggerDetail || undefined,
      actions: newActions,
      isActive: true,
    };

    setRules([created, ...rules]);
    setNewName("");
    setNewTrigger("message_received");
    setNewTriggerDetail("");
    setNewActions([]);
    setIsAdding(false);
    toast.success("تم تجميع وحفظ قاعدة الأتمتة الذكية الجديدة!");
  };

  const handleDeleteRule = (id: string) => {
    setRules(rules.filter((r) => r.id !== id));
    toast.info("تم حذف قاعدة الأتمتة");
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center bg-white border border-zinc-200 p-5 rounded-3xl shadow-sm">
        <div>
          <h3 className="font-extrabold text-sm text-zinc-800 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            قواعد الفرز الذكي والأتمتة التلقائية (AI Workflows)
          </h3>
          <p className="text-[10px] text-zinc-500 font-bold mt-0.5">
            قم بصياغة شروط ذكية لتوجيه المحادثات، وتعديل بطاقات الـ CRM، والرد تلقائياً على مدار الساعة
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 text-xs font-black bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء قاعدة جديدة</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-50 border-2 border-dashed border-primary/20 rounded-3xl p-6 space-y-4 overflow-hidden"
          >
            <h4 className="font-black text-xs text-primary uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> مصمم القواعد الذكي
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-zinc-500 block mb-1.5">اسم القاعدة</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="مثال: تصعيد فوري لشكاوى الامتثال والزكاة"
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl focus:border-primary/50 focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-zinc-500 block mb-1.5">نوع المحفّز (Trigger)</label>
                <select
                  value={newTrigger}
                  onChange={(e) => setNewTrigger(e.target.value as AutomationRule["trigger"])}
                  className="w-full text-xs font-bold px-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl focus:border-primary/50 focus:outline-none"
                >
                  <option value="message_received">عند تلقي أي رسالة عميل</option>
                  <option value="sentiment_angry">عند كشف نبرة غضب أو استياء (AI Angry Sentiment)</option>
                  <option value="keyword_detected">عند مطابقة كلمات دلالية معينة</option>
                  <option value="off_hours">خارج أوقات العمل الرسمية للمؤسسة</option>
                </select>
              </div>
            </div>

            {newTrigger === "keyword_detected" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-zinc-200 rounded-2xl p-4"
              >
                <label className="text-[10px] font-black text-zinc-500 block mb-1.5">الكلمات المفتاحية المطلوبة (مفصولة بـ فاصلة)</label>
                <input
                  type="text"
                  value={newTriggerDetail}
                  onChange={(e) => setNewTriggerDetail(e.target.value)}
                  placeholder="مثال: أسعار، باقة، اشتراك، كم السعر"
                  className="w-full text-xs font-bold px-3.5 py-2 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-primary/50 focus:bg-white focus:outline-none"
                />
              </motion.div>
            )}

            {/* Actions list designer */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
              <label className="text-[10px] font-black text-zinc-500 block mb-1.5">الإجراءات المتتالية (Actions Sequence)</label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newActionInput}
                  onChange={(e) => setNewActionInput(e.target.value)}
                  placeholder="مثال: إضافة وسم 'مستعجل' وتنبيه قسم العمليات هاتفياً"
                  className="flex-1 text-xs font-bold px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-primary/50 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddAction}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-4 rounded-xl transition-colors cursor-pointer"
                >
                  إضافة إجراء
                </button>
              </div>

              {newActions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {newActions.map((act, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 text-xs font-bold px-3 py-1.5 rounded-xl animate-fadeIn"
                    >
                      <Play className="w-3 h-3 rotate-180" />
                      <span>{act}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAction(idx)}
                        className="text-primary hover:text-rose-600 transition-colors ml-1 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl border border-zinc-200 cursor-pointer"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={handleSaveRule}
                className="px-5 py-2 bg-primary hover:bg-primary/95 text-white text-xs font-black rounded-xl transition-all cursor-pointer"
              >
                تفعيل وحفظ القاعدة
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((r, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={r.id}
            className={`bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between transition-all ${
              !r.isActive ? "opacity-60 bg-zinc-50/50" : "hover:border-primary/45"
            }`}
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-extrabold text-sm text-zinc-800 leading-tight">{r.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-bold block mt-1">توليد بواسطة: أتمتة النظام</span>
                </div>
                <button
                  onClick={() => handleToggleRule(r.id)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 cursor-pointer shrink-0 ${
                    r.isActive ? "bg-primary" : "bg-zinc-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
                      r.isActive ? "-translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Trigger detail info */}
              <div className="bg-zinc-50 border border-zinc-200/50 rounded-2xl p-3.5 space-y-1.5">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-550" /> الشرط / المحفّز (IF)
                </span>
                <span className="text-xs font-extrabold text-zinc-700 block">
                  {r.trigger === "sentiment_angry" && "كشف نبرة غضب أو شكوى شديدة اللهجة بالذكاء الاصطناعي"}
                  {r.trigger === "message_received" && "استلام رسالة جديدة من العميل عبر أي وسيلة"}
                  {r.trigger === "keyword_detected" && "العثور على كلمات دلالية ومفتاحية محددة"}
                  {r.trigger === "off_hours" && "استلام رسالة في غير ساعات العمل (الجمعة/السبت أو 6م - 8ص)"}
                </span>
                {r.triggerDetail && (
                  <span className="text-[10px] font-bold bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-lg inline-block">
                    {r.triggerDetail}
                  </span>
                )}
              </div>

              {/* Actions details list */}
              <div className="space-y-2">
                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 text-primary rotate-180" /> الإجراءات المتتالية (THEN)
                </span>
                <div className="space-y-1.5">
                  {r.actions.map((act, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-100 pt-3 mt-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                <CheckCircle className="w-3 h-3" /> جاهز للعمل حياً
              </span>
              <button
                onClick={() => handleDeleteRule(r.id)}
                className="p-1 text-zinc-400 hover:text-rose-600 transition-colors"
                title="حذف قاعدة الأتمتة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
