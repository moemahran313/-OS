import React, { useState } from "react";
import {
  X,
  Sparkles,
  Flame,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Send,
  UserCheck,
  Briefcase,
  Building2,
  Zap,
  Globe,
  Phone,
  Mail,
  Linkedin,
  ShieldCheck,
  TrendingUp,
  Award,
  DollarSign,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { LeadCompany, LeadContact } from "@/src/types/leadGen";
import { calculateLeadScore } from "@/src/services/leadGenService";
import { toast } from "sonner";

interface LeadQualificationModalProps {
  company: LeadCompany | null;
  contacts: LeadContact[];
  onClose: () => void;
  onPromoteToDeal: (company: LeadCompany, contact?: LeadContact, dealValue?: number, stage?: string) => void;
  onQualifyLead: (company: LeadCompany) => void;
  onEnrichCompany: (company: LeadCompany) => void;
}

export const LeadQualificationModal: React.FC<LeadQualificationModalProps> = ({
  company,
  contacts,
  onClose,
  onPromoteToDeal,
  onQualifyLead,
  onEnrichCompany,
}) => {
  if (!company) return null;

  const [dealValue, setDealValue] = useState<number>(
    company.employeeCount ? company.employeeCount * 2500 : 50000
  );
  const [dealStage, setDealStage] = useState<string>("hot");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    contacts.length > 0 ? contacts[0].id : null
  );
  const [isPromoting, setIsPromoting] = useState(false);
  const [isQualifying, setIsQualifying] = useState(false);

  const score = calculateLeadScore(company);
  const isHot = score >= 80;
  const isWarm = score >= 60 && score < 80;

  const companyContacts = contacts.filter((c) => c.companyId === company.id);
  const selectedContact = companyContacts.find((c) => c.id === selectedContactId) || companyContacts[0];

  const handlePromoteSubmit = () => {
    setIsPromoting(true);
    setTimeout(() => {
      onPromoteToDeal(company, selectedContact, dealValue, dealStage);
      setIsPromoting(false);
      toast.success(`🔥 تم إطلاق الصفقة وترقيتها بنجاح لقناة المبيعات بقيمة ${dealValue.toLocaleString()} ر.س!`);
      onClose();
    }, 400);
  };

  const handleQualifySubmit = () => {
    setIsQualifying(true);
    setTimeout(() => {
      onQualifyLead(company);
      setIsQualifying(false);
      toast.success("تم اعتماد وتأهيل العميل المحتمل في قواعد البيانات");
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md dir-rtl">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-lg shrink-0 shadow-md shadow-orange-500/20">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="px-2.5 py-0.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-md text-[10px] font-black uppercase tracking-wider">
                  مركز التأهيل والتصعيد (AI Qualification Hub)
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    isHot
                      ? "bg-rose-500/10 text-rose-600 border border-rose-500/30"
                      : isWarm
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                      : "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                  }`}
                >
                  {isHot ? "🔥 Tier 1: Hot Prospect" : isWarm ? "⚡ Tier 2: Warm Prospect" : "❄️ Tier 3: Cold Prospect"}
                </span>
              </div>

              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 truncate">
                {company.nameAr || company.name}
              </h2>
              <p className="text-xs text-zinc-400">{company.industry} • {company.city}، {company.country}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* AI Qualification Score Gauge */}
          <div className="p-5 bg-zinc-900 text-white rounded-2xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-emerald-400">
                <Award className="w-4 h-4" />
                <span>ملخص تقييم الذكاء الاصطناعي (AI Lead Score):</span>
              </span>
              <span className="font-mono text-xl font-black text-amber-400">{score} / 100</span>
            </div>

            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed pt-1">
              {company.enrichment?.suggestedSalesPitch ||
                `تم قياس الجاهزية بناءً على عدد الموظفين (${company.employeeCount})، والنشاط التجاري (${company.industry})، والتوثيق بالسجل التجاري.`}
            </p>
          </div>

          {/* AI Insights & Identified Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>نقاط القوة وإشارات الشراء (Buying Signals)</span>
              </h4>
              <ul className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>شركة موثقة بالسجل التجاري #{company.crNumber || "ساري"}</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>حجم الموظفين: {company.employeeCount} موظف</span>
                </li>
                {company.socialLinks?.linkedin && (
                  <li className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>تتواجد الشركة بنشاط على LinkedIn</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-2">
              <h4 className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                <span>الاحتياجات والفرص المكتشفة</span>
              </h4>
              <ul className="space-y-1 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                {company.enrichment?.potentialNeeds && company.enrichment.potentialNeeds.length > 0 ? (
                  company.enrichment.potentialNeeds.map((need, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{need}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>ربط نظام الفوترة الإلكترونية ZATCA Phase 2</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>أتمتة مسيرات الرواتب WPS بنظام مدد</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Decision Makers List */}
          {companyContacts.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-black text-zinc-900 dark:text-zinc-100 block">
                اختر صاحب القرار المستهدف للصفقة (Contact):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {companyContacts.map((cnt) => (
                  <div
                    key={cnt.id}
                    onClick={() => setSelectedContactId(cnt.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      selectedContactId === cnt.id
                        ? "bg-emerald-500/10 border-emerald-500 text-zinc-900 dark:text-zinc-100"
                        : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:border-zinc-400"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black flex items-center justify-center text-xs shrink-0">
                      {cnt.firstName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h5 className="text-xs font-black truncate">{cnt.firstName} {cnt.lastName}</h5>
                      <p className="text-[10px] text-zinc-400 truncate">{cnt.position} • {cnt.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deal Configuration Form */}
          <div className="p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4">
            <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>إعدادات الصفقة لإنشاء كارت CRM (Deal Configuration)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  القيمة المتوقعة للصفقة (ر.س):
                </label>
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value))}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-500 mb-1">
                  مرحلة القناة (Pipeline Stage):
                </label>
                <select
                  value={dealStage}
                  onChange={(e) => setDealStage(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-black text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="hot">فرص ساخنة (Hot Lead 🔥)</option>
                  <option value="contacted">قيد التواصل</option>
                  <option value="contracted">تم التعاقد</option>
                  <option value="new">فرصة جديدة</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => onEnrichCompany(company)}
            className="w-full sm:w-auto px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>إعادة التحليل الذكي</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleQualifySubmit}
              disabled={isQualifying}
              className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>اعتماد وتأهيل (Qualify)</span>
            </button>

            <button
              onClick={handlePromoteSubmit}
              disabled={isPromoting}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-black cursor-pointer shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4" />
              <span>ترقية إلى صفقة (Promote to Deal)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
