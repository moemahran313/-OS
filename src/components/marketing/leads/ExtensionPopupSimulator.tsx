import React, { useState, useEffect } from "react";
import {
  Globe,
  Building,
  CheckCircle,
  Cpu,
  Layers,
  Plus,
  Loader2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  User,
  Shield,
  Phone,
  Mail,
  Zap,
  ArrowRight,
  Database,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import {
  leadsIntelligenceService,
  BusinessEntity,
  Collection,
} from "@/src/services/leadsIntelligence.service";

interface ExtensionPopupSimulatorProps {
  isAr: boolean;
  onLeadSaved?: () => void;
}

// Preset pages that the user can "visit" inside the simulator
const PRESET_TABS = [
  {
    name: "Saudi Aramco",
    domain: "aramco.com",
    address: "Dhahran, Eastern Province, Saudi Arabia",
    categoryTags: "Energy, Oil & Gas, Infrastructure, Enterprise",
    phone: "+966 13 872 0115",
  },
  {
    name: "STC (Saudi Telecom Company)",
    domain: "stc.com.sa",
    address: "King Abdulaziz Road, Riyadh, Saudi Arabia",
    categoryTags: "Telecommunications, 5G, Enterprise IT, Cloud Services",
    phone: "+966 11 452 7000",
  },
  {
    name: "NEOM Company",
    domain: "neom.com",
    address: "Tabuk Region, Saudi Arabia",
    categoryTags: "Giga-Project, Smart City, Sustainability, Tech Innovation",
    phone: "+966 11 834 5000",
  },
  {
    name: "Salla B2B SaaS",
    domain: "salla.sa",
    address: "Makkah, Saudi Arabia",
    categoryTags: "E-Commerce, SaaS, Retail, Payments",
    phone: "+966 9200 11025",
  },
  {
    name: "Unifonic Solutions",
    domain: "unifonic.com",
    address: "Riyadh, Saudi Arabia",
    categoryTags: "SaaS, CPaaS, Communications, Customer Engagement",
    phone: "+966 11 223 9011",
  },
];

export default function ExtensionPopupSimulator({
  isAr,
  onLeadSaved,
}: ExtensionPopupSimulatorProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [showCreateCol, setShowCreateCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  // Extension simulated environment state
  const [activeTabUrl, setActiveTabUrl] = useState("aramco.com");
  const [customDomain, setCustomDomain] = useState("");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [activeBusiness, setActiveBusiness] = useState<(typeof PRESET_TABS)[0] | null>(
    PRESET_TABS[0]
  );

  // Existing database record state
  const [existingRecord, setExistingRecord] = useState<BusinessEntity | null>(null);
  const [checkingRecord, setCheckingRecord] = useState(false);

  // Pipeline/Action states
  const [savingLead, setSavingLead] = useState(false);
  const [enrichingLead, setEnrichingLead] = useState(false);
  const [enrichmentStep, setEnrichmentStep] = useState<string>("");

  useEffect(() => {
    fetchCollections();
  }, []);

  // Sync business details when tab url changes
  useEffect(() => {
    if (isCustomMode) {
      if (customDomain) {
        // Construct basic metadata from custom input
        const cleanDomain = customDomain.replace(/^(https?:\/\/)?(www\.)?/, "").split("/")[0];
        const nameGuess = cleanDomain.split(".")[0].toUpperCase();
        setActiveBusiness({
          name: `${nameGuess} Corp`,
          domain: cleanDomain,
          address: "Saudi Arabia (Inferred)",
          categoryTags: "B2B Entity, Tech, General Corporate",
          phone: "Unknown Contact",
        });
      } else {
        setActiveBusiness(null);
      }
    } else {
      const preset = PRESET_TABS.find((p) => p.domain === activeTabUrl);
      setActiveBusiness(preset || null);
    }
  }, [activeTabUrl, customDomain, isCustomMode]);

  // Check database for existing record
  useEffect(() => {
    if (activeBusiness?.domain) {
      checkDatabaseForRecord(activeBusiness.domain);
    } else {
      setExistingRecord(null);
    }
  }, [activeBusiness]);

  const fetchCollections = async () => {
    setLoadingCollections(true);
    try {
      const list = await leadsIntelligenceService.getCollections();
      setCollections(list);
      if (list.length > 0) {
        // Auto-select first or default
        setSelectedCollectionId(list[0].id);
      }
    } catch (err) {
      console.error("Error getting collections for extension", err);
    } finally {
      setLoadingCollections(false);
    }
  };

  const checkDatabaseForRecord = async (domain: string) => {
    setCheckingRecord(true);
    try {
      const res = await leadsIntelligenceService.search({
        q: domain,
        limit: 1,
      });
      const match = res.items.find(
        (item: BusinessEntity) => item.domain?.toLowerCase() === domain.toLowerCase()
      );
      setExistingRecord(match || null);
    } catch (err) {
      console.error("Error checking database record", err);
      setExistingRecord(null);
    } finally {
      setCheckingRecord(false);
    }
  };

  const handleCreateCollectionInsideExtension = async () => {
    if (!newColName.trim()) return;
    setLoadingCollections(true);
    try {
      const col = await leadsIntelligenceService.createCollection(
        newColName,
        isAr ? "تم إنشاؤها عبر إضافة المتصفح" : "Created via browser extension popup interface"
      );
      setCollections((prev) => [...prev, col]);
      setSelectedCollectionId(col.id);
      setNewColName("");
      setShowCreateCol(false);
      toast.success(isAr ? "تم إنشاء قائمة تجميع جديدة" : "New target list created!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingCollections(false);
    }
  };

  // 1. DISCOVER & SAVE LEAD
  const handleSaveToMadarij = async () => {
    if (!activeBusiness) return;
    setSavingLead(true);
    try {
      const payload = {
        name: activeBusiness.name,
        domain: activeBusiness.domain,
        address: activeBusiness.address,
        phone: activeBusiness.phone,
        categoryTags: activeBusiness.categoryTags,
        sourceConnector: "Chrome Extension Popup",
        collectionId: selectedCollectionId || "default_prospects",
      };

      const res = await leadsIntelligenceService.discover(payload);
      toast.success(
        isAr
          ? `تم حفظ "${activeBusiness.name}" بنجاح في قاعدة البيانات! نقاط التأهيل الأولية: ${res.leadScore}/100`
          : `Saved "${activeBusiness.name}" to directory. Lead score is rated at ${res.leadScore}/100`
      );

      // Refresh state to reflect saved record
      await checkDatabaseForRecord(activeBusiness.domain);
      if (onLeadSaved) onLeadSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSavingLead(false);
    }
  };

  // 2. RUN DEEP AI ENRICHMENT PIPELINE
  const handleRunEnrichment = async () => {
    if (!existingRecord) return;
    setEnrichingLead(true);

    // Simulate high-fidelity AI crawler milestones
    const steps = isAr
      ? [
          "جاري تحليل محتوى الصفحة والميتا تاقس...",
          "جاري استعلام نماذج Gemini AI لتحليل النوايا...",
          "جاري البحث عن عناوين البريد الإلكتروني للشركاء وضباط الاتصال...",
          "توليد خطافات المبيعات الذكية المتوافقة مع السوق السعودي...",
        ]
      : [
          "Scanning active DOM elements & domain registers...",
          "Triggering Gemini intelligence reasoning model...",
          "Discovering key executive contact addresses...",
          "Drafting hyper-personalized localized B2B sales pitch...",
        ];

    try {
      for (let i = 0; i < steps.length; i++) {
        setEnrichmentStep(steps[i]);
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const res = await leadsIntelligenceService.enrich(existingRecord.id);
      toast.success(
        isAr
          ? "تم إثراء بيانات الشركة بنجاح بواسطة Gemini!"
          : "Gemini Enrichment finalized successfully!"
      );
      setExistingRecord(res);
      if (onLeadSaved) onLeadSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnrichingLead(false);
      setEnrichmentStep("");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[580px] w-full max-w-[380px] mx-auto text-xs relative">
      {/* Chrome Window Header decoration */}
      <div className="bg-slate-950 px-4 py-2 flex items-center justify-between border-b border-slate-900 select-none shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="bg-slate-900 rounded-md px-3 py-0.5 text-[10px] text-slate-400 font-mono w-44 truncate text-center">
          {activeBusiness?.domain || "extension-popup"}
        </div>
        <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md font-mono">
          MADARIJ OS
        </span>
      </div>

      {/* Extension Header inside popup */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 p-4 border-b border-slate-800 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-black text-white text-[11px] leading-tight">
              {isAr ? "مستكشف Madarij للمبيعات" : "Madarij B2B Prospector"}
            </h4>
            <p className="text-[9px] text-slate-400 font-mono">Chrome Ext v3.4.1</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5 text-[9px] font-bold text-emerald-400 font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          ACTIVE
        </div>
      </div>

      {/* Main interactive area */}
      <div className="p-4 flex-1 overflow-y-auto space-y-4 scrollbar-thin">
        {/* Simulate Tab Switcher */}
        <div>
          <label className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
            {isAr ? "محاكاة زيارة موقع شركة" : "Simulate Visited Corporate Website"}
          </label>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_TABS.map((tab) => (
              <button
                key={tab.domain}
                onClick={() => {
                  setIsCustomMode(false);
                  setActiveTabUrl(tab.domain);
                }}
                className={cn(
                  "px-2 py-1 rounded-md text-[10px] whitespace-nowrap border shrink-0 transition-all font-mono",
                  !isCustomMode && activeTabUrl === tab.domain
                    ? "bg-indigo-600 text-white border-indigo-500"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.name.split(" ")[0]}
              </button>
            ))}
            <button
              onClick={() => {
                setIsCustomMode(true);
                if (!customDomain) setCustomDomain("stc.com.sa");
              }}
              className={cn(
                "px-2 py-1 rounded-md text-[10px] whitespace-nowrap border shrink-0 transition-all font-mono",
                isCustomMode
                  ? "bg-purple-600 text-white border-purple-500"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
              )}
            >
              {isAr ? "رابط مخصص" : "Custom Domain"}
            </button>
          </div>

          {/* Custom Input */}
          {isCustomMode && (
            <div className="mt-2 relative">
              <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="e.g. stc.com.sa, unifonic.com..."
                className="w-full bg-slate-950 border border-slate-850 rounded-lg py-2 pl-8 pr-3 text-[10px] text-white focus:outline-none focus:border-purple-500/50"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* ORGANIZATION / B2B TARGET LIST SELECTOR */}
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              {isAr ? "قائمة حفظ الأهداف الاستراتيجية" : "B2B Target Organization List"}
            </span>
            <button
              onClick={() => setShowCreateCol(!showCreateCol)}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 text-[9px] font-bold"
            >
              {showCreateCol ? (
                "[x]"
              ) : (
                <>
                  <Plus className="w-3 h-3" />
                  {isAr ? "جديدة" : "New"}
                </>
              )}
            </button>
          </div>

          {showCreateCol ? (
            <div className="flex gap-1.5 mt-1.5">
              <input
                type="text"
                placeholder={isAr ? "اسم قائمة مبيعات جديدة..." : "New list name..."}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-white focus:outline-none focus:border-indigo-500/50"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateCollectionInsideExtension()}
              />
              <button
                onClick={handleCreateCollectionInsideExtension}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-2 rounded-lg text-[10px] font-black"
              >
                {isAr ? "إنشاء" : "Create"}
              </button>
            </div>
          ) : (
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              disabled={loadingCollections}
              className="w-full bg-slate-950 border border-slate-850 rounded-lg py-1.5 px-2.5 text-[10px] text-white focus:outline-none focus:border-indigo-500/50 cursor-pointer"
            >
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  📂 {col.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* ACTIVE WEBPAGE DATA PREVIEW & DATABASE DISCOVERY LOOKUP */}
        {activeBusiness && (
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-850 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h5 className="font-black text-white text-xs leading-snug">
                  {activeBusiness.name}
                </h5>
                <p className="text-[9px] text-indigo-400 font-mono mt-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-500" />
                  {activeBusiness.domain}
                </p>
              </div>

              {/* CRM Live Record Sync Status Display */}
              {checkingRecord ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
              ) : existingRecord ? (
                <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold flex items-center gap-0.5">
                  <CheckCircle className="w-2.5 h-2.5" />
                  {isAr ? "مسجل بالـ CRM" : "In CRM"}
                </span>
              ) : (
                <span className="bg-slate-800 text-slate-400 text-[9px] font-mono px-2 py-0.5 rounded-full border border-slate-700 font-bold">
                  {isAr ? "خارج النظام" : "Not In CRM"}
                </span>
              )}
            </div>

            <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
              {activeBusiness.address}
            </p>

            {/* Display of existing record data if registered */}
            {existingRecord ? (
              <div className="border-t border-slate-900 pt-2.5 space-y-2.5">
                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono text-slate-300">
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block text-[8px] uppercase">
                      {isAr ? "تقييم العميل" : "Lead Score"}
                    </span>
                    <span className="text-white font-bold text-xs">{existingRecord.leadScore}</span>
                    <span className="text-slate-500 text-[8px]">/100</span>
                  </div>
                  <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-900">
                    <span className="text-slate-500 block text-[8px] uppercase">
                      {isAr ? "المرحلة الحالية" : "CRM Stage"}
                    </span>
                    <span className="text-indigo-400 font-bold">{existingRecord.status}</span>
                  </div>
                </div>

                {/* Highly structured enrichment data representation */}
                {existingRecord.employeeHeadcount ? (
                  <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 space-y-2 text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {isAr ? "عدد الموظفين:" : "Employees:"}
                      </span>
                      <span className="text-slate-300 font-mono font-bold">
                        {existingRecord.employeeHeadcount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        {isAr ? "تقدير الإيرادات (ARR):" : "ARR Estimate:"}
                      </span>
                      <span className="text-emerald-400 font-mono font-bold">
                        {existingRecord.estimatedARR || "$1M - $10M"}
                      </span>
                    </div>
                    {existingRecord.technologiesUsed && (
                      <div className="pt-1 border-t border-slate-900">
                        <span className="text-slate-500 block mb-0.5">
                          {isAr ? "التقنيات المستخدمة:" : "Technologies Detected:"}
                        </span>
                        <span className="text-slate-400 text-[8px] font-mono leading-relaxed line-clamp-1">
                          {existingRecord.technologiesUsed}
                        </span>
                      </div>
                    )}

                    {/* Contacts details */}
                    {existingRecord.contacts && existingRecord.contacts.length > 0 && (
                      <div className="pt-1.5 border-t border-slate-900">
                        <span className="text-slate-500 block mb-1 font-bold">
                          {isAr ? "أصحاب القرار المكتشفين:" : "Key Decision Makers:"}
                        </span>
                        <div className="space-y-1 max-h-[80px] overflow-y-auto">
                          {existingRecord.contacts.map((contact, cIdx) => (
                            <div
                              key={cIdx}
                              className="bg-slate-950 p-1.5 rounded border border-slate-900 text-[8px] space-y-0.5"
                            >
                              <div className="flex justify-between text-white font-bold">
                                <span>👤 {contact.name}</span>
                                <span className="text-slate-400">{contact.title}</span>
                              </div>
                              <div className="text-slate-500 font-mono flex items-center justify-between">
                                <span className="truncate">{contact.email}</span>
                                {contact.phone && (
                                  <span className="shrink-0">📞 {contact.phone}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-indigo-950/20 p-2.5 rounded-lg border border-indigo-950/40 text-center">
                    <p className="text-[10px] text-indigo-400 font-medium">
                      {isAr
                        ? "الشركة مسجلة برأس أطراف مالي، ولكن لم يتم تشغيل محرك ذكاء Gemini AI لإثرائها بعد."
                        : "Basic record exists, but Gemini deep AI enrichment is not executed yet."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/20 p-3 rounded-lg border border-dashed border-slate-800 text-center text-slate-500 font-sans">
                {isAr
                  ? "هذه الشركة غير مدرجة في قوائم Madarij OS المركزية للمبيعات حالياً."
                  : "Company domain does not exist inside Madarij CRM system."}
              </div>
            )}
          </div>
        )}
      </div>

      {/* AI Enrichment Live Step Screen Loader */}
      {enrichingLead && (
        <div className="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 space-y-4 text-center z-20">
          <div className="relative">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <Sparkles className="w-5 h-5 text-amber-300 absolute -top-1.5 -right-1.5 animate-pulse" />
          </div>
          <div>
            <h5 className="font-black text-white text-xs uppercase tracking-wider">
              {isAr ? "جاري تفعيل ذكاء Gemini" : "Executing Gemini Deep Engine"}
            </h5>
            <p className="text-[10px] text-slate-400 font-mono mt-1 px-4 leading-relaxed animate-pulse">
              {enrichmentStep}
            </p>
          </div>
        </div>
      )}

      {/* Footer/Trigger CTA Buttons Area */}
      <div className="p-4 bg-slate-950 border-t border-slate-900 shrink-0">
        {existingRecord ? (
          <div className="space-y-2">
            <button
              onClick={handleRunEnrichment}
              disabled={enrichingLead}
              className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/10"
            >
              <Cpu className="w-4 h-4 text-amber-300 animate-pulse" />
              {existingRecord.employeeHeadcount
                ? isAr
                  ? "إعادة تشغيل ذكاء Gemini لإثراء البيانات"
                  : "Re-Run Gemini AI Enrichment"
                : isAr
                  ? "تأهيل وإثراء العميل بذكاء Gemini"
                  : "Trigger Deep AI Enrichment"}
            </button>
            <a
              href="/app/lead-gen"
              className="w-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[10px] py-1.5 rounded-lg border border-slate-800 transition-all flex items-center justify-center gap-1"
            >
              <span>{isAr ? "عرض داخل لوحة مبيعات Madarij" : "Open in Madarij Central CRM"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ) : (
          <button
            onClick={handleSaveToMadarij}
            disabled={savingLead || !activeBusiness}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
          >
            {savingLead ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isAr ? "جاري الحفظ والتحقق..." : "Validating & Saving..."}
              </>
            ) : (
              <>
                <Database className="w-4 h-4" />
                {isAr ? "حفظ كـ عميل محتمل في Madarij" : "Capture & Save to Madarij"}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
