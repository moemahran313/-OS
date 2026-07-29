import React, { useState } from "react";
import {
  X,
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  CopyCheck,
  FileText,
  Plus,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Linkedin,
  Mail,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { LeadCompany, LeadContact } from "@/src/types/leadGen";
import {
  detectDuplicateLeads,
  DeduplicationSummary,
  DeduplicationCheckResult,
} from "@/src/utils/leadDeduplication";
import { toast } from "sonner";

interface LeadImportModalProps {
  onClose: () => void;
  onImportLeads: (newLeads: LeadCompany[]) => void;
  existingCompanies: LeadCompany[];
  existingContacts?: LeadContact[];
}

export const LeadImportModal: React.FC<LeadImportModalProps> = ({
  onClose,
  onImportLeads,
  existingCompanies,
  existingContacts = [],
}) => {
  const [csvRaw, setCsvRaw] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dedupSummary, setDedupSummary] = useState<DeduplicationSummary | null>(null);
  const [showDuplicatesList, setShowDuplicatesList] = useState(true);
  const [allowImportDuplicates, setAllowImportDuplicates] = useState(false);

  const sampleCsv = `اسم الشركة,النشاط,المدينة,الهاتف,البريد الإلكتروني,الموقع الإلكتروني,لينكدإن,عدد الموظفين
مجموعة الإنشاءات الشرقية,هندسة ومقاولات,الرياض,+966112223344,info@orientalconst.sa,https://orientalconst.sa,https://linkedin.com/company/orientalconst,75
عيادات الأمل التخصصية,صحة وطب أسنان,جدة,+966126667788,contact@alamalclinics.sa,https://alamalclinics.sa,https://linkedin.com/company/alamal,22
شركة التوزيع السريع,شحن ولوجستيات,الدمام,+966138889900,sales@expressdist.sa,https://expressdist.sa,https://linkedin.com/company/expressdist,45`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setCsvRaw(content);
        toast.success(`تم تحميل ملف ${file.name} بنجاح`);
      }
    };
    reader.readAsText(file);
  };

  const handleParseAndCheck = () => {
    if (!csvRaw.trim()) {
      toast.error("يرجى لصق بيانات CSV أو اختيار ملف لتسهيل الاستيراد");
      return;
    }

    setIsProcessing(true);
    const lines = csvRaw.trim().split("\n");
    const parsed: LeadCompany[] = [];

    // Parse CSV lines
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = line.split(",").map((s) => s.trim().replace(/^"/, "").replace(/"$/, ""));
      if (cols.length >= 2) {
        const name = cols[0] || `شركة مستوردة #${i}`;
        const industry = cols[1] || "قطاع الأعمال";
        const city = cols[2] || "الرياض";
        const phone = cols[3] || "+966 11 000 0000";
        const email = cols[4] || `contact@company${i}.sa`;
        const website = cols[5] || `https://company${i}.sa`;
        const linkedin = cols[6] || "";
        const employees = Number(cols[7]) || 25;

        parsed.push({
          id: `imported-${Date.now()}-${i}`,
          name: name,
          nameAr: name,
          website: website,
          address: `${city}، المملكة العربية السعودية`,
          city: city,
          country: "Saudi Arabia",
          region: `${city} Region`,
          phone: phone,
          email: email,
          industry: industry,
          category: industry,
          description: `شركة ${name} متخصصة في مجالات ${industry} بمدينة ${city}.`,
          rating: 4.5,
          reviewCount: 12,
          employeeCount: employees,
          revenueRange: "SAR 5M - 15M",
          foundedYear: 2021,
          businessHours: "Sun-Thu: 8:00 AM - 5:00 PM",
          socialLinks: { whatsapp: phone, linkedin: linkedin },
          coordinates: { lat: 24.7136, lng: 46.6753 },
          tags: ["Imported CSV", city, industry],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          source: "Manual CSV Upload",
          crStatus: "VALID",
        });
      }
    }

    if (parsed.length === 0) {
      toast.error("تعذر قراءة بيانات صالحة من النص الملصوق");
      setIsProcessing(false);
      return;
    }

    // Run Deduplication Check on Email & LinkedIn
    const summary = detectDuplicateLeads(parsed, existingCompanies, existingContacts);
    setDedupSummary(summary);
    setIsProcessing(false);

    if (summary.duplicateLeads.length > 0) {
      toast.warning(
        `تم اكتشاف ${summary.duplicateLeads.length} شركات مكررة (إيميل أو لينكدإن). يمكنك مراجعة واستبعاد المكرر.`
      );
    } else {
      toast.success(`تم التحقق بنجاح! جميع الـ ${summary.uniqueLeads.length} شركات فريدة ولا يوجد تكرار.`);
    }
  };

  const handleConfirmImport = () => {
    if (!dedupSummary) return;

    const leadsToSave = allowImportDuplicates
      ? [...dedupSummary.uniqueLeads, ...dedupSummary.duplicateLeads.map((d) => d.company)]
      : dedupSummary.uniqueLeads;

    if (leadsToSave.length === 0) {
      toast.error("لا توجد شركات جيدة للحفظ");
      return;
    }

    onImportLeads(leadsToSave);
    toast.success(
      `تم استيراد ${leadsToSave.length} شركة بنجاح! (تم استبعاد ${
        allowImportDuplicates ? 0 : dedupSummary.duplicateLeads.length
      } سجلات مكررة)`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm dir-rtl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl space-y-5 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                محرك استيراد وتفتيش التكرار (Lead Deduplication Engine)
              </h3>
              <p className="text-xs text-zinc-400">
                فحص آلي للبريد الإلكتروني وحسابات لينكدإن المكررة قبل الحفظ
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* File Upload & Text Area Controls */}
          {!dedupSummary ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-500">لصق CSV أو رفع ملف Excel / CSV:</label>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded-lg cursor-pointer transition-colors flex items-center gap-1">
                    <Upload className="w-3 h-3 text-emerald-500" />
                    <span>رفع ملف</span>
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <button
                    onClick={() => setCsvRaw(sampleCsv)}
                    className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    نموذج تجريبي
                  </button>
                </div>
              </div>

              <textarea
                value={csvRaw}
                onChange={(e) => {
                  setCsvRaw(e.target.value);
                  setDedupSummary(null);
                }}
                rows={7}
                placeholder="اسم الشركة, النشاط, المدينة, الهاتف, البريد الإلكتروني, الموقع, لينكدإن, عدد الموظفين..."
                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />

              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <CopyCheck className="w-4 h-4 shrink-0" />
                <span>
                  يقوم المحرك تلقائياً بتدقيق وتفتيش عناوين الإيميل وحسابات LinkedIn وسجلات الشركات المكررة.
                </span>
              </div>
            </div>
          ) : (
            /* Deduplication Results Alert & Preview */
            <div className="space-y-4">
              {/* Summary Stats Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 text-center">
                  <span className="text-[10px] font-bold text-zinc-400 block">إجمالي المقروء</span>
                  <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
                    {dedupSummary.totalProcessed} شركة
                  </span>
                </div>

                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 block">
                    فريدة جاهزة للحفظ
                  </span>
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                    {dedupSummary.uniqueLeads.length}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-xl border text-center ${
                    dedupSummary.duplicateLeads.length > 0
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                      : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700"
                  }`}
                >
                  <span className="text-[10px] font-bold block">مكررة مستكشفة</span>
                  <span className="text-base font-black">
                    {dedupSummary.duplicateLeads.length}
                  </span>
                </div>
              </div>

              {/* Detailed Duplicate Alert List */}
              {dedupSummary.duplicateLeads.length > 0 && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-3">
                  <div
                    onClick={() => setShowDuplicatesList(!showDuplicatesList)}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-xs font-black text-rose-600 dark:text-rose-400">
                      <ShieldAlert className="w-4 h-4 animate-bounce" />
                      <span>
                        تنبيه: تم اكتشاف {dedupSummary.duplicateLeads.length} عناصر مكررة (Email / LinkedIn)
                      </span>
                    </div>

                    <button className="text-xs font-bold text-rose-500 flex items-center gap-1">
                      <span>{showDuplicatesList ? "إخفاء التفاصيل" : "عرض المكرر"}</span>
                      {showDuplicatesList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {showDuplicatesList && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="space-y-2 pt-2 border-t border-rose-500/20 max-h-48 overflow-y-auto pr-1"
                      >
                        {dedupSummary.duplicateLeads.map((dup, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white dark:bg-zinc-900 rounded-xl border border-rose-500/20 text-xs flex items-start justify-between gap-2"
                          >
                            <div className="space-y-0.5 min-w-0">
                              <h5 className="font-black text-zinc-900 dark:text-zinc-100 truncate">
                                {dup.company.name}
                              </h5>
                              <div className="flex items-center gap-2 text-[10px] font-mono text-rose-500 flex-wrap">
                                {dup.reasons.map((r, rIdx) => (
                                  <span key={rIdx} className="bg-rose-500/10 px-1.5 py-0.5 rounded">
                                    ⚠️ {r.type === "email" ? "بريد مكرر" : r.type === "linkedin" ? "لينكدإن مكرر" : "اسم مكرر"}: {r.value} (مطابق لـ: {r.matchedWith})
                                  </span>
                                ))}
                              </div>
                            </div>

                            <span className="text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md shrink-0">
                              سيتم استبعاده
                            </span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Override Toggle */}
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allowImportDuplicates}
                      onChange={(e) => setAllowImportDuplicates(e.target.checked)}
                      className="rounded accent-rose-500 w-4 h-4"
                    />
                    <span>السماح باستيراد الشركات المكررة قسراً (Force Import Duplicates)</span>
                  </label>
                </div>
              )}

              <button
                onClick={() => setDedupSummary(null)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                ← العودة إلى نص المدخلات وإعادة المحاولة
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 shrink-0 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
          >
            إلغاء
          </button>

          {!dedupSummary ? (
            <button
              onClick={handleParseAndCheck}
              disabled={isProcessing}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>فحص التكرار والمعالجة</span>
            </button>
          ) : (
            <button
              onClick={handleConfirmImport}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black text-xs font-black rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                تأكيد واستيراد ({allowImportDuplicates ? dedupSummary.totalProcessed : dedupSummary.uniqueLeads.length}) شركة
              </span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
