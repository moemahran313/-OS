import React from "react";
import {
  Play,
  Trash2,
  Database,
  Code2,
  Variable,
  Terminal,
  CheckCircle,
  AlertTriangle,
  X,
  Info,
} from "lucide-react";
import { WorkflowNode, NodeConfig } from "./types";

interface InspectorProps {
  node: WorkflowNode | undefined;
  onUpdateConfig: (nodeId: string, updatedConfig: Partial<NodeConfig>) => void;
  onExecuteSingleNode: (id: string) => void;
  onDeleteNode: (id: string) => void;
  showVarPickerField: string | null;
  setShowVarPickerField: (f: string | null) => void;
  onClose: () => void;
}

export const Inspector: React.FC<InspectorProps> = ({
  node,
  onUpdateConfig,
  onExecuteSingleNode,
  onDeleteNode,
  showVarPickerField,
  setShowVarPickerField,
  onClose,
}) => {
  if (!node) {
    return (
      <div
        className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm text-center py-16 space-y-3 h-full flex flex-col justify-center items-center"
        dir="rtl"
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-400">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-xs font-black text-zinc-800">تفاصيل العقدة والمتغيرات</h3>
        <p className="text-[10px] font-semibold text-zinc-400 max-w-[200px] leading-relaxed">
          انقر على أي عقدة (Node) في المسار لاستعراض المتغيرات، وتدقيق التراسل الهيكلي JSON، أو ضبط
          محاكي الـ API الذكي.
        </p>
      </div>
    );
  }

  // Predefined parameters that are safe to map inside active fields
  const mappableVariables = [
    { token: "trigger.invoice_id", desc: "معرّف الفاتورة المستلمة" },
    { token: "trigger.sum", desc: "إجمالي المبلغ المستخرج" },
    { token: "action.compliantCount", desc: "عدد المعاملات المطابقة" },
    { token: "action.mismatchInvoice", desc: "الفاتورة المخالفة" },
    { token: "action.totalUnvouchedAmount", desc: "العجز المالي المرصود" },
  ];

  const handleFieldChange = (key: keyof NodeConfig, val: string) => {
    onUpdateConfig(node.id, { [key]: val });
  };

  const handleInsertVariable = (field: keyof NodeConfig, token: string) => {
    const currentVal = node.config[field] || "";
    handleFieldChange(field, currentVal + ` {{${token}}}`);
    setShowVarPickerField(null);
  };

  return (
    <div
      className="bg-white border border-zinc-200 rounded-3xl shadow-sm h-full flex flex-col overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/55">
        <div>
          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">
            مفتش الإجراءات
          </span>
          <h3 className="text-sm font-black text-zinc-800 mt-0.5">{node.nameAr || node.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onExecuteSingleNode(node.id)}
            title="تشغيل تجريبي منفرد"
            className="p-1.5 hover:bg-zinc-100 text-emerald-600 rounded-lg border border-zinc-200 bg-white cursor-pointer transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
          </button>
          <button
            onClick={() => onDeleteNode(node.id)}
            title="حذف العقدة"
            className="p-1.5 hover:bg-zinc-100 text-rose-500 rounded-lg border border-zinc-200 bg-white cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-zinc-100 text-zinc-400 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body content scrollable */}
      <div className="p-5 flex-1 overflow-y-auto space-y-6">
        {/* Status Display banner */}
        <div
          className={`p-3 rounded-2xl border text-xs font-semibold flex items-center gap-2 ${
            node.status === "completed"
              ? "bg-emerald-50 text-emerald-800 border-emerald-100"
              : node.status === "running"
                ? "bg-indigo-50 text-indigo-800 border-indigo-100 animate-pulse"
                : node.status === "warning"
                  ? "bg-amber-50 text-amber-800 border-amber-100"
                  : node.status === "error"
                    ? "bg-rose-50 text-rose-800 border-rose-100"
                    : "bg-zinc-50 text-zinc-600 border-zinc-150"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                node.status === "completed"
                  ? "bg-emerald-400"
                  : node.status === "running"
                    ? "bg-indigo-400"
                    : node.status === "warning"
                      ? "bg-amber-400"
                      : "bg-rose-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                node.status === "completed"
                  ? "bg-emerald-500"
                  : node.status === "running"
                    ? "bg-indigo-500"
                    : node.status === "warning"
                      ? "bg-amber-500"
                      : "bg-rose-500"
              }`}
            />
          </span>
          <div>
            <span>الحالة الحالية: </span>
            <strong className="font-extrabold">
              {node.status === "completed"
                ? "ناجح"
                : node.status === "running"
                  ? "جاري التشغيل"
                  : node.status === "warning"
                    ? "مكتمل مع تنبيهات"
                    : node.status === "error"
                      ? "خطأ فادح"
                      : "خامل"}
            </strong>
            {node.durationMs && (
              <span className="text-[10px] text-zinc-400 mr-2">( استغرق {node.durationMs}ms )</span>
            )}
          </div>
        </div>

        {/* Dynamic configurations based on node type */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-zinc-800 pb-1.5 border-b border-zinc-100">
            بارامترات المعالجة والاتصال
          </h4>

          {node.type === "trigger" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500">
                  مُسبّب حافز التنشيط (Trigger Event)
                </label>
                <input
                  type="text"
                  value={node.config.triggerEvent || ""}
                  onChange={(e) => handleFieldChange("triggerEvent", e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800 focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500">
                  رابط الويب هhooks (Webhook URL)
                </label>
                <input
                  type="text"
                  value={node.config.webhookUrl || ""}
                  onChange={(e) => handleFieldChange("webhookUrl", e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
                  placeholder="/api/v1/webhooks/vat"
                />
              </div>
            </div>
          )}

          {node.type === "action" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500">
                  نقطة وصول واجهة التطبيق (API Endpoint)
                </label>
                <input
                  type="text"
                  value={node.config.apiEndpoint || ""}
                  onChange={(e) => handleFieldChange("apiEndpoint", e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl font-mono text-zinc-800 focus:outline-none focus:border-zinc-900"
                />
              </div>

              {/* Token-insertion for Prompt Template or Recipient fields */}
              {node.config.promptTemplate !== undefined && (
                <div className="space-y-1 relative">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-zinc-500">
                      قالب توجيه الذكاء الاصطناعي (AI Prompt)
                    </label>
                    <button
                      onClick={() =>
                        setShowVarPickerField(
                          showVarPickerField === "promptTemplate" ? null : "promptTemplate"
                        )
                      }
                      className="text-[10px] text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-1 cursor-pointer"
                    >
                      <Variable className="w-3.5 h-3.5" />
                      <span>إدراج متغير</span>
                    </button>
                  </div>

                  {showVarPickerField === "promptTemplate" && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl p-2 z-20 space-y-1 text-right">
                      <span className="text-[8px] font-black text-zinc-400 px-2 block uppercase tracking-wider">
                        اختر متغيراً لإدراجه:
                      </span>
                      {mappableVariables.map((v) => (
                        <button
                          key={v.token}
                          onClick={() => handleInsertVariable("promptTemplate", v.token)}
                          className="w-full text-right text-[10px] font-bold p-2 hover:bg-zinc-50 rounded-lg text-zinc-700 flex justify-between border-b last:border-b-0 border-zinc-100"
                        >
                          <span className="font-mono text-indigo-600">{`{{${v.token}}}`}</span>
                          <span className="text-zinc-400">{v.desc}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <textarea
                    value={node.config.promptTemplate || ""}
                    onChange={(e) => handleFieldChange("promptTemplate", e.target.value)}
                    rows={3}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800 focus:outline-none focus:border-zinc-900 leading-relaxed"
                  />
                </div>
              )}

              {node.config.recipientEmail !== undefined && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-zinc-500">
                    عنوان البريد الإلكتروني للمستلم
                  </label>
                  <input
                    type="email"
                    value={node.config.recipientEmail || ""}
                    onChange={(e) => handleFieldChange("recipientEmail", e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800 focus:outline-none"
                    placeholder="example@company.com"
                  />
                </div>
              )}
            </div>
          )}

          {node.type === "condition" && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500">حقل التحقق</label>
                  <input
                    type="text"
                    value={node.config.conditionField || ""}
                    onChange={(e) => handleFieldChange("conditionField", e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500">المعامل الشرطي</label>
                  <select
                    value={node.config.conditionOperator || ""}
                    onChange={(e) => handleFieldChange("conditionOperator", e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-bold p-2.5 rounded-xl text-zinc-800"
                  >
                    <option value="===">يساوي (===)</option>
                    <option value="!==">لا يساوي (!==)</option>
                    <option value=">">أكبر من (&gt;)</option>
                    <option value="<">أصغر من (&lt;)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500">القيمة المستهدفة</label>
                  <input
                    type="text"
                    value={node.config.conditionValue || ""}
                    onChange={(e) => handleFieldChange("conditionValue", e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 text-xs font-semibold p-2.5 rounded-xl text-zinc-800"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side-by-side Telemetry JSON Payload drawer */}
        <div className="space-y-3">
          <h4 className="text-xs font-black text-zinc-800 pb-1.5 border-b border-zinc-100 flex items-center gap-1">
            <Code2 className="w-4 h-4 text-zinc-500" />
            تراسل المدخلات والمخرجات (Payload Telemetry)
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                المدخلات (Input payload)
              </span>
              <pre
                className="bg-zinc-900 text-emerald-400 text-[10px] font-mono p-3 rounded-xl overflow-x-auto max-h-40 leading-relaxed text-left"
                dir="ltr"
              >
                {JSON.stringify(node.inputPayload || { status: "empty" }, null, 2)}
              </pre>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider block">
                المخرجات (Output payload)
              </span>
              <pre
                className="bg-zinc-900 text-indigo-400 text-[10px] font-mono p-3 rounded-xl overflow-x-auto max-h-40 leading-relaxed text-left"
                dir="ltr"
              >
                {JSON.stringify(node.outputPayload || { status: "empty" }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
