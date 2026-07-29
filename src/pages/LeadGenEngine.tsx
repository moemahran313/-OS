import React, { useState } from "react";
import {
  Search,
  Users,
  Compass,
  Zap,
  BarChart3,
  Bot,
  Plus,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  LeadCompany,
  LeadContact,
  CampaignWorkflow,
  AutomationRule,
} from "@/src/types/leadGen";
import {
  INITIAL_LEAD_COMPANIES,
  INITIAL_LEAD_CONTACTS,
  INITIAL_CAMPAIGNS,
  INITIAL_AUTOMATION_RULES,
  enrichCompanyWithAi,
  syncLeadToFirestore,
} from "@/src/services/leadGenService";
import { LeadDiscovery } from "@/src/components/leadgen/LeadDiscovery";
import { CompanyProfileModal } from "@/src/components/leadgen/CompanyProfileModal";
import { CampaignWorkflowBuilder } from "@/src/components/leadgen/CampaignWorkflowBuilder";
import { LeadPipeline } from "@/src/components/leadgen/LeadPipeline";
import { LeadMapViewer } from "@/src/components/leadgen/LeadMapViewer";
import { LeadImportModal } from "@/src/components/leadgen/LeadImportModal";
import { LeadAnalyticsDashboard } from "@/src/components/leadgen/LeadAnalyticsDashboard";
import { LeadCopilotAssistant } from "@/src/components/leadgen/LeadCopilotAssistant";
import { AutomationRulesManager } from "@/src/components/leadgen/AutomationRulesManager";
import { VisualLeadScoringDashboard } from "@/src/components/leadgen/VisualLeadScoringDashboard";
import { LeadQualificationModal } from "@/src/components/leadgen/LeadQualificationModal";
import { useUser } from "@/src/contexts/UserContext";
import { toast } from "sonner";

export default function LeadGenEngine() {
  const { user } = useUser();

  const [companies, setCompanies] = useState<LeadCompany[]>(INITIAL_LEAD_COMPANIES);
  const [contacts, setContacts] = useState<LeadContact[]>(INITIAL_LEAD_CONTACTS);
  const [campaigns, setCampaigns] = useState<CampaignWorkflow[]>(INITIAL_CAMPAIGNS);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(INITIAL_AUTOMATION_RULES);

  const [activeTab, setActiveTab] = useState<"discovery" | "scoring" | "map" | "campaigns" | "pipeline" | "copilot" | "analytics">("discovery");
  const [selectedCompany, setSelectedCompany] = useState<LeadCompany | null>(null);
  const [qualifyingCompany, setQualifyingCompany] = useState<LeadCompany | null>(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Push lead to Madarij CRM
  const handlePushToCrm = async (company: LeadCompany, contact?: LeadContact) => {
    if (user?.uid) {
      await syncLeadToFirestore(user.uid, company, contact);
    }
    toast.success(`تم حفظ وحزم شركة "${company.nameAr || company.name}" إلى Madarij CRM بنجاح`);
  };

  // Run AI Enrichment
  const handleEnrichCompany = async (company: LeadCompany) => {
    toast.info("جاري تحليل النطاق والبيانات بواسطة Gemini AI...");
    try {
      const enrichment = await enrichCompanyWithAi(company);
      const updatedComp: LeadCompany = {
        ...company,
        enrichment,
        updatedAt: new Date().toISOString(),
      };

      setCompanies((prev) => prev.map((c) => (c.id === company.id ? updatedComp : c)));
      if (selectedCompany?.id === company.id) setSelectedCompany(updatedComp);
      toast.success("تم إثراء وتحليل بيانات الشركة بواسطة الذكاء الاصطناعي بنجاح!");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء إجراء الإثراء الذكي");
    }
  };

  // Import Leads callback
  const handleImportLeads = (newLeads: LeadCompany[]) => {
    setCompanies((prev) => [...newLeads, ...prev]);
  };

  // Update contact status in pipeline
  const handleUpdateContactStatus = (contactId: string, newStatus: LeadContact["leadStatus"]) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, leadStatus: newStatus } : c))
    );
    toast.success("تم نقل العميل إلى المرحلة الجديدة في خط الأنابيب");
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 p-4 sm:p-6 lg:p-8 space-y-6 dir-rtl font-sans">
      {/* Top Main Banner Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 dark:from-zinc-900 dark:to-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lead Generation OS • نظام توليد واستكشاف العملاء المقارن لـ Apollo.io & Clay</span>
            </span>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-black">
              متكامل مع نظام مدرج لإدارة الأعمال
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            مستكشف ومولد العملاء المحتملين والصفقات (Lead Generation OS)
          </h1>
          <p className="text-xs sm:text-sm text-zinc-300 font-bold leading-relaxed">
            استكشاف الشركات وأصحاب القرار بالسعودية والخليج، وتدقيق المواقع الإلكترونية بالذكاء الاصطناعي، وأتمتة حملات التواصل، وتصدير الصفقات مباشرة لـ CRM.
          </p>
        </div>

        {/* Quick Top Stats & Import Trigger */}
        <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsImportOpen(true)}
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>استيراد ملف شركات (CSV)</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab("discovery")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "discovery"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Search className="w-4 h-4 text-emerald-500" />
          <span>استكشاف الشركات والفرص ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("scoring")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "scoring"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>تصنيف وجاهزية العملاء (Lead Scoring)</span>
        </button>

        <button
          onClick={() => setActiveTab("map")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "map"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-500" />
          <span>الخارطة والنطاق الجغرافي</span>
        </button>

        <button
          onClick={() => setActiveTab("campaigns")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "campaigns"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Zap className="w-4 h-4 text-amber-500" />
          <span>حملات التواصل الآلية ({campaigns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("pipeline")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "pipeline"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Users className="w-4 h-4 text-purple-500" />
          <span>خط أنابيب المبيعات (Pipeline)</span>
        </button>

        <button
          onClick={() => setActiveTab("copilot")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "copilot"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Bot className="w-4 h-4 text-emerald-500" />
          <span>المساعد الذكي (LeadCopilot)</span>
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "analytics"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md"
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-blue-500" />
          <span>التقارير والأتمتة</span>
        </button>
      </div>

      {/* Main Tab Render Body */}
      <div>
        {activeTab === "discovery" && (
          <LeadDiscovery
            companies={companies}
            contacts={contacts}
            onSelectCompany={(c) => setSelectedCompany(c)}
            onPushToCrm={handlePushToCrm}
            onEnrichCompany={handleEnrichCompany}
            onOpenImport={() => setIsImportOpen(true)}
            onOpenQualificationModal={(c) => setQualifyingCompany(c)}
          />
        )}

        {activeTab === "scoring" && (
          <VisualLeadScoringDashboard
            companies={companies}
            contacts={contacts}
            onSelectCompany={(c) => setSelectedCompany(c)}
            onOpenQualificationModal={(c) => setQualifyingCompany(c)}
            onPushToCrm={handlePushToCrm}
          />
        )}

        {activeTab === "map" && (
          <LeadMapViewer
            companies={companies}
            onSelectCompany={(c) => setSelectedCompany(c)}
          />
        )}

        {activeTab === "campaigns" && (
          <CampaignWorkflowBuilder
            campaigns={campaigns}
            onSaveCampaign={(updatedCamp) => {
              setCampaigns((prev) =>
                prev.some((c) => c.id === updatedCamp.id)
                  ? prev.map((c) => (c.id === updatedCamp.id ? updatedCamp : c))
                  : [updatedCamp, ...prev]
              );
            }}
          />
        )}

        {activeTab === "pipeline" && (
          <LeadPipeline
            contacts={contacts}
            onUpdateStatus={handleUpdateContactStatus}
            onSelectContact={(cnt) => {
              const comp = companies.find((c) => c.id === cnt.companyId);
              if (comp) setSelectedCompany(comp);
            }}
          />
        )}

        {activeTab === "copilot" && (
          <LeadCopilotAssistant
            companies={companies}
            onSelectCompany={(c) => setSelectedCompany(c)}
          />
        )}

        {activeTab === "analytics" && (
          <div className="space-y-8">
            <LeadAnalyticsDashboard companies={companies} contacts={contacts} />
            <AutomationRulesManager
              rules={automationRules}
              onSaveRule={(updatedRule) => {
                setAutomationRules((prev) =>
                  prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
                );
              }}
            />
          </div>
        )}
      </div>

      {/* Company Detailed Modal Drawer */}
      <AnimatePresence>
        {selectedCompany && (
          <CompanyProfileModal
            company={selectedCompany}
            contacts={contacts}
            onClose={() => setSelectedCompany(null)}
            onPushToCrm={handlePushToCrm}
            onEnrichCompany={handleEnrichCompany}
            onOpenQualificationModal={(c) => setQualifyingCompany(c)}
          />
        )}
      </AnimatePresence>

      {/* Interactive AI Lead Qualification Modal */}
      <AnimatePresence>
        {qualifyingCompany && (
          <LeadQualificationModal
            company={qualifyingCompany}
            contacts={contacts}
            onClose={() => setQualifyingCompany(null)}
            onPromoteToDeal={(comp, contact, dealVal, stage) => {
              handlePushToCrm(comp, contact);
            }}
            onQualifyLead={(comp) => {
              handleEnrichCompany(comp);
            }}
            onEnrichCompany={handleEnrichCompany}
          />
        )}
      </AnimatePresence>

      {/* CSV Import Modal */}
      <AnimatePresence>
        {isImportOpen && (
          <LeadImportModal
            onClose={() => setIsImportOpen(false)}
            onImportLeads={handleImportLeads}
            existingCompanies={companies}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
