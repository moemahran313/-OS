import React, { useState } from "react";
import {
  Zap,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Sliders,
  Settings2,
  Trash2,
  Layers,
} from "lucide-react";
import { AutomationRule } from "@/src/types/leadGen";
import { toast } from "sonner";

interface AutomationRulesManagerProps {
  rules: AutomationRule[];
  onSaveRule: (rule: AutomationRule) => void;
}

export const AutomationRulesManager: React.FC<AutomationRulesManagerProps> = ({
  rules,
  onSaveRule,
}) => {
  const [ruleList, setRuleList] = useState<AutomationRule[]>(rules);

  const handleToggleRule = (rule: AutomationRule) => {
    const updated = { ...rule, active: !rule.active };
    onSaveRule(updated);
    setRuleList((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
    toast.success(updated.active ? "تم تفعيل القواعد التلقائية بنجاح" : "تم إيقاف القاعدة");
  };

  return (
    <div className="space-y-6 dir-rtl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <span>محرك قواعد الأتمتة والتوجيه الذكي (Automation Rules Engine)</span>
          </h2>
          <p className="text-xs text-zinc-400">
            أتمتة التصنيف والتوسيم وتكليف المهام للمبيعات بناءً على أحداث استكشاف الشركات وتدقيق المواقع.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ruleList.map((rule) => (
          <div
            key={rule.id}
            className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    rule.active
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-500/10 text-zinc-500"
                  }`}
                >
                  {rule.active ? "مفعلة تلقائياً" : "غير نشطة"}
                </span>
                <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100 mt-1">{rule.name}</h3>
                <p className="text-xs text-zinc-400 font-bold mt-0.5">{rule.description}</p>
              </div>

              <button
                onClick={() => handleToggleRule(rule)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                  rule.active
                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700"
                }`}
              >
                {rule.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>

            <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[10px] font-bold text-zinc-400">
              <span>الحدث المحفز: {rule.trigger}</span>
              <span>مرات التشغيل: {rule.runsCount} مرة</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
