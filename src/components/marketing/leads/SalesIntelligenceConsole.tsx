import React, { useState, useEffect } from "react";
import {
  Search,
  Building,
  Globe,
  Phone,
  MapPin,
  Cpu,
  Zap,
  CheckCircle,
  TrendingUp,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  ChevronRight,
  Sparkles,
  DollarSign,
  Users,
  Layers,
  Send,
  ExternalLink,
  FileText,
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  ArrowLeftRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";
import {
  leadsIntelligenceService,
  BusinessEntity,
  Collection,
} from "@/src/services/leadsIntelligence.service";
import ExtensionPopupSimulator from "./ExtensionPopupSimulator";

interface SalesIntelligenceConsoleProps {
  isAr: boolean;
}

export default function SalesIntelligenceConsole({ isAr }: SalesIntelligenceConsoleProps) {
  // Directory States
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [leads, setLeads] = useState<BusinessEntity[]>([]);
  const [selectedLead, setSelectedLead] = useState<BusinessEntity | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [enrichingId, setEnrichingId] = useState<string | null>(null);
  const [promotingId, setPromotingId] = useState<string | null>(null);

  // New Collection modal
  const [showCreateCollectionModal, setShowCreateCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [newCollectionDesc, setNewCollectionDesc] = useState("");
  const [creatingCollection, setCreatingCollection] = useState(false);

  // Browser Extension / Google Maps Prospector Simulator States
  const [mapsSearchQuery, setMapsSearchQuery] = useState("");
  const [mapsLocation, setMapsLocation] = useState("Riyadh");
  const [mapsScanning, setMapsScanning] = useState(false);
  const [mapsSearchHasRun, setMapsSearchHasRun] = useState(false);
  const [mapsResults, setMapsResults] = useState<any[]>([]);
  const [importingMapsIndex, setImportingMapsIndex] = useState<number | null>(null);
  const [extensionMode, setExtensionMode] = useState<"popup" | "maps">("popup");

  // Multi-select bulk state
  const [selectedLeadsIds, setSelectedLeadsIds] = useState<string[]>([]);

  // CRM Normalized Stages Flow sequence
  const pipelineStages = [
    { key: "Discovered", labelAr: "مكتشف", labelEn: "Discovered" },
    { key: "Lead", labelAr: "عميل محتمل", labelEn: "Lead" },
    { key: "Prospect", labelAr: "فرصة مهيأة", labelEn: "Prospect" },
    { key: "Qualified Lead", labelAr: "مؤهل للمبيعات", labelEn: "Qualified Lead" },
    { key: "Company", labelAr: "حساب مؤسسة", labelEn: "Company" },
    { key: "Contact", labelAr: "جهة اتصال مفعّلة", labelEn: "Contact" },
    { key: "Opportunity", labelAr: "فرصة تفاوض", labelEn: "Opportunity" },
    { key: "Quotation", labelAr: "تقديم عرض سعر", labelEn: "Quotation" },
    { key: "Invoice", labelAr: "فوترة مالية", labelEn: "Invoice" },
    { key: "Customer", labelAr: "عميل مدفوع", labelEn: "Customer" },
  ];

  useEffect(() => {
    fetchCollections();
    fetchLeads();
  }, [selectedCollectionId, statusFilter, scoreFilter, sortBy, sortOrder, currentPage]);

  const fetchLeads = async () => {
    setLoadingLeads(true);
    try {
      const res = await leadsIntelligenceService.search({
        q: searchQuery,
        location: locationFilter,
        status: statusFilter,
        score: scoreFilter,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 8,
        collectionId: selectedCollectionId,
      });
      setLeads(res.items);
      setTotalPages(res.pagination.pages);
      setTotalCount(res.pagination.total);

      // Keep selection synced if something is selected
      if (selectedLead) {
        const found = res.items.find((l: any) => l.id === selectedLead.id);
        if (found) setSelectedLead(found);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(isAr ? "فشل استدعاء البيانات من السيرفر" : "Failed to load corporate directory");
    } finally {
      setLoadingLeads(false);
    }
  };

  const fetchCollections = async () => {
    setLoadingCollections(true);
    try {
      const list = await leadsIntelligenceService.getCollections();
      setCollections(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCollections(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    setCreatingCollection(true);
    try {
      const col = await leadsIntelligenceService.createCollection(
        newCollectionName,
        newCollectionDesc
      );
      toast.success(isAr ? "تم إنشاء قائمة تجميع جديدة بنجاح" : "Corporate collection created");
      setCollections((prev) => [...prev, col]);
      setSelectedCollectionId(col.id);
      setShowCreateCollectionModal(false);
      setNewCollectionName("");
      setNewCollectionDesc("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingCollection(false);
    }
  };

  // Simulate Google Maps crawler in Browser Extension Panel
  const handleMapsScan = async () => {
    if (!mapsSearchQuery.trim()) {
      toast.error(isAr ? "برجاء كتابة مجال البحث" : "Enter a search query first");
      return;
    }
    setMapsScanning(true);
    setMapsSearchHasRun(true);
    setMapsResults([]);

    // Simulate scraping latency
    setTimeout(() => {
      const city = mapsLocation || "Riyadh";
      const sampleQueries = [
        {
          name: "شركة التقنيات السحابية المتقدمة",
          domain: "advcloudtech.com.sa",
          phone: "+966 11 409 2211",
          address: `طريق الملك فهد، حي الصحافة، ${city}، المملكة العربية السعودية`,
          categoryTags: "Software, Tech, Cloud Solutions, B2B SaaS",
          reviewCount: 142,
          ratingAverage: 4.8,
        },
        {
          name: "مستشفى رعاية العائلة الطبية",
          domain: "familycare.med.sa",
          phone: "+966 12 602 8810",
          address: `حي الورود، طريق الأمير ماجد، ${city}، المملكة العربية السعودية`,
          categoryTags: "Health, Clinic, Medical, Care",
          reviewCount: 389,
          ratingAverage: 4.6,
        },
        {
          name: "مجموعة المذاق العربي للأغذية",
          domain: "arabictaste.co",
          phone: "+966 13 890 4055",
          address: `شارع الملك عبدالعزيز، حي الخبر الشمالي، ${city}، المملكة العربية السعودية`,
          categoryTags: "Food & Beverage, Restaurant Chain, Retail",
          reviewCount: 1205,
          ratingAverage: 4.3,
        },
        {
          name: "سهم للمقاولات والاستشارات الهندسية",
          domain: "sahmconstructions.com",
          phone: "+966 50 144 2233",
          address: `طريق الملك عبدالله، حي النزهة، ${city}، المملكة العربية السعودية`,
          categoryTags: "Construction, Architecture, Engineering, Consulting",
          reviewCount: 34,
          ratingAverage: 4.1,
        },
        {
          name: "رائد للاستشارات الضريبية والمحاسبية",
          domain: "raedtax.sa",
          phone: "+966 11 204 8831",
          address: `طريق التخصصي، حي المعذر الشمالي، ${city}، المملكة العربية السعودية`,
          categoryTags: "Consulting, Finance, Legal, Tax Advisor",
          reviewCount: 18,
          ratingAverage: 3.9,
        },
      ];

      // Custom filter based on query keywords
      const queryLower = mapsSearchQuery.toLowerCase();
      const filtered = sampleQueries.filter(
        (q) =>
          q.name.toLowerCase().includes(queryLower) ||
          q.categoryTags.toLowerCase().includes(queryLower) ||
          q.domain.toLowerCase().includes(queryLower)
      );

      setMapsResults(filtered.length > 0 ? filtered : sampleQueries);
      setMapsScanning(false);
      toast.success(
        isAr
          ? "تم العثور على شركات نشطة وجاري مطابقتها بالـ API"
          : "Discovered local corporate entities via Extension"
      );
    }, 1500);
  };

  const handleImportLead = async (item: any, index: number) => {
    setImportingMapsIndex(index);
    try {
      const entity = {
        ...item,
        sourceConnector: `Google Maps Extension (${mapsLocation})`,
        collectionId: selectedCollectionId || "default_prospects",
      };

      const result = await leadsIntelligenceService.discover(entity);
      if (result.isDuplicate) {
        toast.warning(
          isAr
            ? `الشركة "${item.name}" مسجلة مسبقاً! تم منع تكرار البيانات.`
            : `Duplicate detected: "${item.name}" is already in database.`
        );
      } else {
        toast.success(
          isAr
            ? `تم استيراد وتقييم "${item.name}" بنجاح! النقاط: ${result.leadScore}/100`
            : `Imported "${item.name}". Assigned score: ${result.leadScore}/100`
        );
      }
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setImportingMapsIndex(null);
    }
  };

  // Perform Gemini Enrichment AI Pipeline
  const handleEnrichLead = async (leadId: string) => {
    setEnrichingId(leadId);
    try {
      toast.info(
        isAr
          ? "جاري تفعيل ذكاء Gemini لإثراء البيانات وقراءة مراجعات العملاء وتوليد الخطافات البيعية..."
          : "Running Gemini crawler to harvest corporate emails, ARR estimates, technologies, and localized hooks..."
      );
      const res = await leadsIntelligenceService.enrich(leadId);
      toast.success(
        isAr
          ? "تم إثراء الملف بنجاح! تم استخراج جهات الاتصال وتوليد خطافات مبيعات ذكية."
          : "Enrichment completed! AI classified industry and identified decision makers."
      );
      setSelectedLead(res);
      fetchLeads();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setEnrichingId(null);
    }
  };

  // Promote Lead across normalized pipeline
  const handlePromoteStage = async (leadId: string, nextStage: string) => {
    setPromotingId(leadId);
    try {
      const res = await leadsIntelligenceService.promote(leadId, nextStage);
      toast.success(
        isAr
          ? `تم ترفيع العميل إلى مرحلة (${nextStage})`
          : `Lead advanced to pipeline phase: ${nextStage}`
      );

      // System notification for actions triggered automatically
      if (nextStage === "Lead" || nextStage === "Prospect") {
        toast.success(
          isAr
            ? "تنبيه: تم مزامنة بيانات العميل تلقائياً مع نظام الـ CRM المركزي."
            : "CRM Trigger: Lead profile successfully registered inside master leads folder."
        );
      } else if (nextStage === "Quotation") {
        toast.success(
          isAr
            ? `تم إنشاء مستند عرض السعر بنجاح برقم العقد: ${res.quotationId?.slice(-6)}`
            : `Contract Engine: Strategic quote created. Document Ref: ${res.quotationId?.slice(-6)}`
        );
      } else if (nextStage === "Invoice" || nextStage === "Customer") {
        toast.success(
          isAr
            ? `تنبيه مالي: تم إصدار فاتورة مدفوعات رسمية للشركة برقم: ${res.invoiceId?.slice(-6)}`
            : `Financial Trigger: Real VAT Invoice issued. ID: ${res.invoiceId?.slice(-6)}`
        );
      }

      fetchLeads();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setPromotingId(null);
    }
  };

  // Bulk operation simulation
  const handleBulkEnrich = async () => {
    if (selectedLeadsIds.length === 0) return;
    const toastId = toast.loading(
      isAr
        ? "جاري تفعيل الإثراء الجماعي بالذكاء الاصطناعي..."
        : "Triggering bulk enrichment pipeline..."
    );
    try {
      await leadsIntelligenceService.bulkEnrich(selectedLeadsIds);
      toast.dismiss(toastId);
      toast.success(
        isAr
          ? "اكتمل الإثراء الجماعي لجميع الشركات المحددة"
          : "Bulk enrichment successfully finalized"
      );
      setSelectedLeadsIds([]);
      fetchLeads();
    } catch (err: any) {
      toast.dismiss(toastId);
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. EXTENSION SIMULATOR & COLLECTION HEADER BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Browser Extension Simulator Panel */}
        <div className="lg:col-span-6 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            {/* Top extension header toggle */}
            <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono font-bold flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5" />
                {isAr ? "محاكي الإضافات الذكية" : "Madarij Ext Simulator"}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">v3.4.1 Connected</span>
            </div>

            {/* Mode selection tabs */}
            <div className="flex bg-slate-900/60 p-1 border border-slate-800/80 rounded-xl mb-5 gap-1.5">
              <button
                onClick={() => setExtensionMode("popup")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 border",
                  extensionMode === "popup"
                    ? "bg-indigo-600 text-white border-indigo-500/30 shadow-md"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                )}
              >
                <Cpu className="w-3.5 h-3.5" />
                {isAr ? "إضافة المتصفح (Popup UI)" : "Extension Popup UI"}
              </button>
              <button
                onClick={() => setExtensionMode("maps")}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-[10px] font-black transition-all flex items-center justify-center gap-1.5 border",
                  extensionMode === "maps"
                    ? "bg-indigo-600 text-white border-indigo-500/30 shadow-md"
                    : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
                )}
              >
                <Search className="w-3.5 h-3.5" />
                {isAr ? "منقب الخرائط (Geo-Scraper)" : "Geo-Maps Crawler"}
              </button>
            </div>

            {extensionMode === "popup" ? (
              <div className="space-y-4 animate-fadeIn">
                <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                  {isAr
                    ? "اختبر نافذة إضافة المتصفح المنبثقة الحقيقية. يمكنك اختيار قائمة حفظ مبيعات محددة، والاطلاع على حالة الشركة ومزامنتها، والبدء بإثراء وتأهيل البيانات فورياً باستخدام Gemini AI."
                    : "Simulate a live Chrome Extension experience. Save companies to target lists, inspect CRM history on any page, and execute deep B2B pipeline enrichment with Gemini AI."}
                </p>
                <ExtensionPopupSimulator isAr={isAr} onLeadSaved={fetchLeads} />
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-base font-black text-white mb-1">
                  {isAr
                    ? "منقب البيانات والعملاء الجغرافي الذكي"
                    : "Geo-Discovery Chrome Extension"}
                </h3>
                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  {isAr
                    ? "يقوم هذا النظام بمحاكاة متصفح الملحقات (Extension) للبحث المباشر داخل محيط الأعمال الجغرافي في المملكة، واستخلاص تفاصيل الشركات، التقييمات، والبيانات وتصديرها بضغطة زر لقاعدة البيانات."
                    : "Simulate capturing rich local businesses directly from search footprints. Discovered records are automatically qualified and saved."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-4">
                  <div className="sm:col-span-8 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      type="text"
                      placeholder={
                        isAr
                          ? "بحث: مطاعم، عيادات، شركات تقنية..."
                          : "e.g. Restaurants, clinics, tech startups..."
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
                      value={mapsSearchQuery}
                      onChange={(e) => setMapsSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleMapsScan()}
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <select
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                      value={mapsLocation}
                      onChange={(e) => setMapsLocation(e.target.value)}
                    >
                      <option value="Riyadh">{isAr ? "الرياض" : "Riyadh"}</option>
                      <option value="Jeddah">{isAr ? "جدة" : "Jeddah"}</option>
                      <option value="Dammam">{isAr ? "الدمام" : "Dammam"}</option>
                      <option value="Mecca">{isAr ? "مكة المكرمة" : "Mecca"}</option>
                      <option value="Medina">{isAr ? "المدينة المنورة" : "Medina"}</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleMapsScan}
                  disabled={mapsScanning}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
                >
                  {mapsScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isAr
                        ? "جاري قراءة الخرائط واستخراج الأرقام..."
                        : "Scanning local coordinates & metadata..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      {isAr ? "بدء استخراج وتنقيب البيانات" : "Execute Search & Map Leads"}
                    </>
                  )}
                </button>

                {/* Scrape results preview */}
                {mapsSearchHasRun && (
                  <div className="mt-5 border-t border-slate-900 pt-4 max-h-[190px] overflow-y-auto space-y-2.5 scrollbar-thin">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                      {isAr
                        ? `نتائج البحث المتوفرة (${mapsResults.length})`
                        : `Discovered Google Maps Profiles (${mapsResults.length})`}
                    </p>

                    {mapsResults.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="truncate space-y-1">
                          <div className="flex items-center gap-2 truncate">
                            <h4 className="font-bold text-white truncate text-xs">{item.name}</h4>
                            <span className="bg-emerald-500/10 text-emerald-400 text-[9px] font-mono px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                              ⭐ {item.ratingAverage}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">{item.address}</p>
                          <div className="flex gap-2 text-[9px] text-slate-500 font-mono">
                            <span>📞 {item.phone}</span>
                            <span>🌐 {item.domain}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleImportLead(item, idx)}
                          disabled={importingMapsIndex === idx}
                          className="bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 shrink-0"
                        >
                          {importingMapsIndex === idx ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              {isAr ? "استيراد وتقييم" : "Import & Score"}
                            </>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collections, Filters, and Stats */}
        <div className="lg:col-span-6 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                {isAr ? "قوائم تجميع الفرص الاستراتيجية" : "B2B Target Collections"}
              </h3>
              <button
                onClick={() => setShowCreateCollectionModal(true)}
                className="bg-purple-600/10 hover:bg-purple-600 text-purple-400 hover:text-white border border-purple-500/20 px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {isAr ? "قائمة جديدة" : "New Collection"}
              </button>
            </div>

            {/* Collections grid list */}
            {loadingCollections ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {collections.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => {
                      setSelectedCollectionId(selectedCollectionId === col.id ? "" : col.id);
                      setCurrentPage(1);
                    }}
                    className={cn(
                      "p-3.5 rounded-xl border transition-all cursor-pointer select-none relative group",
                      selectedCollectionId === col.id
                        ? "bg-purple-500/10 border-purple-500"
                        : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-black text-white">{col.name}</h4>
                      {selectedCollectionId === col.id && (
                        <CheckCircle className="w-4 h-4 text-purple-400" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                      {col.description || "No description provided"}
                    </p>
                    <div className="text-[9px] text-slate-500 mt-2 font-mono flex items-center justify-between">
                      <span>📅 {new Date(col.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filter options row */}
          <div className="border-t border-slate-900 pt-5 space-y-4">
            <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isAr ? "محددات وتصفية دليل البحث" : "Directory Directory Filters"}
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">
                  {isAr ? "النطاق الجغرافي" : "Location"}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? "مثال: الرياض" : "e.g. Riyadh"}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none text-[11px]"
                  value={locationFilter}
                  onChange={(e) => {
                    setLocationFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">
                  {isAr ? "مرحلة الأنبوب" : "Pipeline Stage"}
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none text-[11px]"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{isAr ? "الكل" : "All Stages"}</option>
                  {pipelineStages.map((stg) => (
                    <option key={stg.key} value={stg.key}>
                      {isAr ? stg.labelAr : stg.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">
                  {isAr ? "مستوى التقييم" : "Qualification"}
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none text-[11px]"
                  value={scoreFilter}
                  onChange={(e) => {
                    setScoreFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">{isAr ? "الكل" : "All Scores"}</option>
                  <option value="high">{isAr ? "ساخن ممتاز (>= 75)" : "Hot Leads (>= 75)"}</option>
                  <option value="medium">
                    {isAr ? "دافي متوسط (40-74)" : "Warm Leads (40-74)"}
                  </option>
                  <option value="low">{isAr ? "بارد منخفض (< 40)" : "Cold Leads (< 40)"}</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 font-bold">
                  {isAr ? "الترتيب حسب" : "Sort By"}
                </label>
                <select
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white focus:outline-none text-[11px]"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                >
                  <option value="createdAt-desc">{isAr ? "الأحدث أولاً" : "Newest Created"}</option>
                  <option value="leadScore-desc">{isAr ? "الأعلى نقاطاً" : "Highest Score"}</option>
                  <option value="name-asc">{isAr ? "أبجدياً (أ-ي)" : "Name (A-Z)"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DIRECTORY GRID & INTEL AUDIT BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leads Directory (Middle Col) */}
        <div className="lg:col-span-7 bg-slate-950/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-400" />
                {isAr ? "دليل الشركات والعملاء المستكشفين" : "Discovered B2B Corporate Directory"}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {isAr
                  ? `إجمالي الشركات النشطة: ${totalCount}`
                  : `Total Discovered Companies: ${totalCount}`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={isAr ? "تصفية سريعة بالاسم أو المجال..." : "Filter by name or tags..."}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none text-[11px]"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
              <button
                onClick={fetchLeads}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white p-2 rounded-xl border border-slate-800 transition-all shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Bulk Action Panel */}
          {selectedLeadsIds.length > 0 && (
            <div className="bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-2xl flex items-center justify-between text-xs text-indigo-400 animate-fadeIn">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  {isAr
                    ? `تم تحديد عدد ${selectedLeadsIds.length} شركات`
                    : `${selectedLeadsIds.length} companies selected`}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkEnrich}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  {isAr ? "إثراء جماعي (AI)" : "Bulk Enrich (AI)"}
                </button>
                <button
                  onClick={() => setSelectedLeadsIds([])}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl transition-all"
                >
                  {isAr ? "إلغاء التحديد" : "Cancel"}
                </button>
              </div>
            </div>
          )}

          {/* Directory List Grid */}
          {loadingLeads ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-500 font-mono">
                {isAr
                  ? "جاري الاستعلام من خوادم قاعدة البيانات..."
                  : "Querying database indexes..."}
              </p>
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl p-6 bg-slate-900/10">
              <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                {isAr ? "لم نجد نتائج مطابقة" : "No records registered yet"}
              </h4>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                {isAr
                  ? "استخدم محاكي الخرائط بالأعلى لإدخال وتنقيب شركات جديدة، أو قم بتغيير فلاتر تصفية البحث الحالية."
                  : "Use the Geo-Discovery Simulator on the left to pull companies, or adjust filters."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {leads.map((lead) => {
                const isSelected = selectedLead?.id === lead.id;
                const scoreColor =
                  lead.leadScore >= 75
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : lead.leadScore >= 40
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-rose-500/10 text-rose-400 border-rose-500/20";

                return (
                  <div
                    key={lead.id}
                    className={cn(
                      "p-4 rounded-2xl border transition-all relative group flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer",
                      isSelected
                        ? "bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-950/10"
                        : "bg-slate-900/30 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                    )}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Checkbox for bulk actions */}
                      <input
                        type="checkbox"
                        checked={selectedLeadsIds.includes(lead.id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          if (e.target.checked) {
                            setSelectedLeadsIds((prev) => [...prev, lead.id]);
                          } else {
                            setSelectedLeadsIds((prev) => prev.filter((id) => id !== lead.id));
                          }
                        }}
                        className="mt-1 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                      />

                      <div className="truncate space-y-1 min-w-0">
                        <div className="flex items-center gap-2 truncate">
                          <h4 className="font-bold text-xs text-white truncate">{lead.name}</h4>
                          <span
                            className={cn(
                              "text-[9px] font-mono px-2 py-0.5 rounded-full border",
                              scoreColor
                            )}
                          >
                            Score: {lead.leadScore}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          {lead.address}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {lead.categoryTags
                            ?.split(",")
                            .slice(0, 3)
                            .map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="bg-slate-950 text-slate-400 text-[8px] font-mono px-1.5 py-0.5 rounded-md border border-slate-800"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3.5 border-t border-slate-900 md:border-transparent pt-3.5 md:pt-0">
                      <div className="text-right text-xs">
                        <span className="text-[9px] bg-slate-950 border border-slate-800 px-2 py-1 rounded-lg text-slate-400 font-mono font-bold">
                          {lead.status}
                        </span>
                      </div>

                      <ChevronRight
                        className={cn(
                          "w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-all",
                          isAr && "rotate-180"
                        )}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination Row */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-900 pt-4 text-xs">
              <span className="text-slate-400 font-mono">
                {isAr
                  ? `صفحة ${currentPage} من ${totalPages}`
                  : `Page ${currentPage} of ${totalPages}`}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white border border-slate-800 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  {isAr ? "السابق" : "Previous"}
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white border border-slate-800 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  {isAr ? "التالي" : "Next"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI enrichment Audit Panel & Pipeline Controller (Right Col) */}
        <div className="lg:col-span-5 space-y-6">
          <AnimatePresence mode="wait">
            {selectedLead ? (
              <motion.div
                key={selectedLead.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="bg-slate-950/60 border border-indigo-500/20 rounded-3xl p-6 shadow-2xl relative space-y-5"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-mono font-bold">
                      {selectedLead.sourceConnector}
                    </span>
                    <h3 className="text-sm font-black text-white mt-1.5">{selectedLead.name}</h3>
                    {selectedLead.domain && (
                      <a
                        href={`https://${selectedLead.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1 font-mono mt-1"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        {selectedLead.domain}
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-mono font-bold"
                  >
                    Close [x]
                  </button>
                </div>

                {/* Score meters */}
                <div className="grid grid-cols-2 gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isAr ? "نقاط الأهمية" : "Lead Score"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-white">
                        {selectedLead.leadScore}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${selectedLead.leadScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {isAr ? "ثقة البيانات" : "Confidence"}
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-white">
                        {selectedLead.confidenceScore}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${selectedLead.confidenceScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ACTIVE PIPELINE CONTROL SLIDER */}
                <div className="space-y-2.5 border-t border-slate-900 pt-4">
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                    <ArrowLeftRight className="w-3.5 h-3.5 text-purple-400" />
                    {isAr
                      ? "ترفيع وتوجيه مرحلة الأنبوب المركزي"
                      : "Central CRM Lifecycle Transition"}
                  </h4>

                  <div className="flex flex-wrap gap-1.5">
                    {pipelineStages.map((stg) => {
                      const isActive = selectedLead.status === stg.key;
                      return (
                        <button
                          key={stg.key}
                          onClick={() => handlePromoteStage(selectedLead.id, stg.key)}
                          disabled={promotingId === selectedLead.id}
                          className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border shrink-0",
                            isActive
                              ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-950/20"
                              : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-white"
                          )}
                        >
                          {isAr ? stg.labelAr : stg.labelEn}
                        </button>
                      );
                    })}
                  </div>

                  {/* Operational status alerts for triggers */}
                  {selectedLead.crmLeadId && (
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl text-[10px] text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        {isAr
                          ? "مترابط بالكامل: تمت المزامنة مع سجل CRM بنجاح"
                          : "Synced: Registered inside central CRM database."}
                      </span>
                    </div>
                  )}

                  {selectedLead.quotationId && (
                    <div className="bg-purple-500/5 border border-purple-500/10 p-2.5 rounded-xl text-[10px] text-purple-400 flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr ? `توليد عرض سعر استراتيجي: Draft` : `Strategic quote is drafted.`}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">
                        REF: {selectedLead.quotationId.slice(-6)}
                      </span>
                    </div>
                  )}

                  {selectedLead.invoiceId && (
                    <div className="bg-blue-500/5 border border-blue-500/10 p-2.5 rounded-xl text-[10px] text-blue-400 flex items-center gap-1.5 justify-between">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {isAr
                            ? "إصدار فاتورة ضريبية رسمية بنجاح"
                            : "Active VAT Invoice dispatched"}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500">
                        REF: {selectedLead.invoiceId.slice(-6)}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI ENRICHED FIELDS DETAIL */}
                <div className="border-t border-slate-900 pt-4 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                      {isAr ? "بيانات الإثراء وتنقيب المواقع" : "AI Enrichment Payload Data"}
                    </h4>

                    {!selectedLead.estimatedARR && (
                      <button
                        onClick={() => handleEnrichLead(selectedLead.id)}
                        disabled={enrichingId === selectedLead.id}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-lg transition-all flex items-center gap-1"
                      >
                        {enrichingId === selectedLead.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            {isAr ? "إثراء عبر Gemini" : "Enrich Profile"}
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {selectedLead.estimatedARR ? (
                    <div className="space-y-4 text-xs">
                      {/* ARR, Headcount, Stack Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-sans">
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">
                            {isAr ? "الإيرادات السنوية ARR" : "Estimated ARR"}
                          </span>
                          <span className="font-black text-white text-[11px] font-mono mt-0.5 block">
                            {selectedLead.estimatedARR}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">
                            {isAr ? "حجم الموظفين" : "Employee Count"}
                          </span>
                          <span className="font-black text-white text-[11px] font-mono mt-0.5 block">
                            {selectedLead.employeeHeadcount}
                          </span>
                        </div>
                        <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800">
                          <span className="text-[9px] text-slate-500 block">
                            {isAr ? "التقنيات النشطة" : "Active Tech Stack"}
                          </span>
                          <span className="font-black text-indigo-300 text-[10px] mt-0.5 block truncate">
                            {selectedLead.technologiesUsed}
                          </span>
                        </div>
                      </div>

                      {/* Contacts profiles nested array */}
                      {selectedLead.contacts && selectedLead.contacts.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-500 block font-bold">
                            {isAr
                              ? "جهات الاتصال الرئيسية والمسؤولين"
                              : "Decision Makers & Key Contacts"}
                          </span>
                          <div className="space-y-2">
                            {selectedLead.contacts.map((c, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 flex items-center justify-between gap-3 text-[11px]"
                              >
                                <div>
                                  <h5 className="font-black text-white">{c.name}</h5>
                                  <p className="text-[10px] text-slate-400">{c.title}</p>
                                </div>
                                <div className="text-right font-mono text-[10px] text-slate-400 space-y-0.5">
                                  <div className="text-indigo-400">{c.email}</div>
                                  {c.phone && (
                                    <div className="text-[9px] text-slate-500">{c.phone}</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI Sentiment Analysis & classification */}
                      {selectedLead.aiAnalysis && (
                        <div className="space-y-3 bg-indigo-950/20 border border-indigo-500/10 p-4 rounded-2xl">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-indigo-400 font-bold">
                              {isAr
                                ? "تصنيف القطاع ومؤشر الرضا"
                                : "AI Segment & Sentiment Analysis"}
                            </span>
                            <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono text-[9px]">
                              Risk: {selectedLead.aiAnalysis.riskRating}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                            {selectedLead.aiAnalysis.customerSentiment}
                          </p>

                          {/* Suggested Sales Hooks */}
                          <div className="space-y-2 border-t border-slate-900 pt-3">
                            <span className="text-[10px] text-slate-400 block font-bold flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              {isAr
                                ? "خطابات مبيعات مخصصة (Sales Hooks)"
                                : "Suggested Outreach Sales Hooks"}
                            </span>

                            {selectedLead.aiAnalysis.salesHooks.map((hook, hIdx) => (
                              <div
                                key={hIdx}
                                className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px] text-slate-300 leading-relaxed font-sans relative"
                              >
                                {hook}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-[11px] text-slate-500 mb-3">
                        {isAr
                          ? "لم يتم إجراء إثراء مالي أو تقني لهذه المؤسسة حتى الآن."
                          : "No ARR, contacts or technology stack details loaded yet."}
                      </p>
                      <button
                        onClick={() => handleEnrichLead(selectedLead.id)}
                        disabled={enrichingId === selectedLead.id}
                        className="bg-indigo-600/15 hover:bg-indigo-600 text-indigo-400 hover:text-white border border-indigo-500/20 text-[11px] font-black px-4 py-2 rounded-xl transition-all inline-flex items-center gap-1.5"
                      >
                        {enrichingId === selectedLead.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                            {isAr ? "بدء إثراء البيانات عبر Gemini" : "Trigger AI Enrichment"}
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Score Reasons Audit list */}
                {selectedLead.scoreReasons && selectedLead.scoreReasons.length > 0 && (
                  <div className="border-t border-slate-900 pt-4 space-y-2 text-xs">
                    <span className="text-[10px] text-slate-500 block font-bold">
                      {isAr ? "مذكرة تدقيق تقييم النقاط" : "Lead Scoring Logic Audit Trail"}
                    </span>
                    <ul className="space-y-1.5 font-mono text-[10px] text-slate-400">
                      {selectedLead.scoreReasons.map((reason, rIdx) => (
                        <li key={rIdx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">✓</span>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-950/40 border border-slate-900 rounded-3xl p-6 text-center py-20 text-slate-500">
                <Cpu className="w-10 h-10 text-slate-700 mx-auto mb-3.5" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                  {isAr ? "مركز تدقيق وإثراء الشركات" : "AI Audit & Enrichment Console"}
                </h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  {isAr
                    ? "اختر شركة من الدليل لعرض نقاط الثقة، التقنيات المستخدمة، جهات الاتصال، وتوليد خطابات تفاوض عبر Gemini."
                    : "Select any discovered business to view confidence scoring, executive contact lists, active tech stack, and strategic hooks."}
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CREATE COLLECTION DIALOG MODAL */}
      <AnimatePresence>
        {showCreateCollectionModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative"
            >
              <h3 className="text-sm font-black text-white mb-4">
                {isAr ? "إنشاء قائمة تجميع فرص مستهدفة" : "Create Corporate Target Collection"}
              </h3>

              <form onSubmit={handleCreateCollection} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">
                    {isAr ? "اسم قائمة الاستهداف" : "Collection Name"}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      isAr ? "مثال: مكاتب استشارية - الرياض" : "e.g. Riyadh Consulting Agencies"
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 block font-bold">
                    {isAr ? "الوصف الاستراتيجي" : "Description"}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={
                      isAr
                        ? "أضف تفاصيل مستهدفي هذه القائمة..."
                        : "Describe strategic targets of this collection..."
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500/50"
                    value={newCollectionDesc}
                    onChange={(e) => setNewCollectionDesc(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setShowCreateCollectionModal(false)}
                    className="bg-slate-950 hover:bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl transition-all"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={creatingCollection}
                    className="bg-indigo-650 hover:bg-indigo-600 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    {creatingCollection ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {isAr ? "حفظ القائمة" : "Save Collection"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
