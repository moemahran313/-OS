import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  Briefcase,
  History,
  Calendar,
  X,
  Palette,
  Globe,
  Upload,
  User,
  Hash,
  ArrowRight,
  DollarSign,
  ArrowUpDown,
  SortAsc,
  SortDesc,
  Clock,
  Building,
  Users,
  IdCard,
  StickyNote,
  Tag,
  ShieldCheck,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Check,
  Send,
  Bell,
  FileText,
  ListOrdered,
  Edit2,
  Trash2,
  Truck,
  GitBranch,
  Users2,
  Zap,
  XCircle,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useNavigate, useLocation } from "react-router-dom";
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { useTranslation } from "react-i18next";

import PayrollComplianceWidget from "@/src/components/PayrollComplianceWidget";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company: string;
  vatId?: string;
  status: "new" | "contacted" | "won" | "lost" | "contracted";
  value: number;
  expectedCloseDate?: string;
  contractEndDate?: string;
  projectCode?: string;
  industry?: string;
  companySize?: string;
  contactJobTitle?: string;
  notes?: string;
  history?: Array<{
    id: string;
    date: string;
    action: string;
    details: string;
  }>;
  order?: number;
  conversionProbability?: number;
  complianceRisk?: "low" | "medium" | "high" | "critical";
  branding?: {
    logo?: string;
    primaryColor?: string;
    language?: "ar" | "en";
  };
  defaultLineItems?: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
  }>;
  leadScore?: "Hot" | "Warm" | "Cold";
  leadScoreReason?: string;
  leadScoreDate?: string;
  userId: string;
}

const columns = [
  { id: "new", name: "فرص جديدة", color: "bg-blue-500" },
  { id: "contacted", name: "قيد التواصل", color: "bg-amber-500" },
  { id: "contracted", name: "تم التعاقد", color: "bg-purple-600" },
  { id: "won", name: "تم الإغلاق (ربح)", color: "bg-emerald-500" },
  { id: "lost", name: "مفقودة", color: "bg-rose-500" },
];

type SortField = "value" | "expectedCloseDate" | "none";
type SortOrder = "asc" | "desc";

export default function CRM() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history" | "shipments" | "invoices">(
    "details"
  );
  const [mainTab, setMainTab] = useState<"crm" | "identity">("crm");
  const [identityTab, setIdentityTab] = useState("companies");
  const [scoringInProgress, setScoringInProgress] = useState(false);

  const identityTabsArr = [
    { id: "companies", label: "الشركات", icon: Building },
    { id: "branches", label: "الفروع", icon: GitBranch },
    { id: "employees", label: "الموظفين", icon: Users },
    { id: "customers", label: "العملاء", icon: Briefcase },
    { id: "suppliers", label: "الموردين", icon: Truck },
    { id: "contractors", label: "المقاولين", icon: Briefcase },
    { id: "shareholders", label: "المساهمين", icon: Users2 },
  ];
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);
  const [shipments, setShipments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const [columnSort, setColumnSort] = useState<
    Record<
      string,
      {
        primaryField: SortField;
        primaryOrder: SortOrder;
        secondaryField: SortField;
        secondaryOrder: SortOrder;
      }
    >
  >({});
  const [multiSortMenu, setMultiSortMenu] = useState<string | null>(null);
  const [statusChangePrompt, setStatusChangePrompt] = useState<{
    client: Client;
    itemsToUpdate: any[];
    sourceStatus: string;
    destStatus: string;
  } | null>(null);
  const [statusChangeNote, setStatusChangeNote] = useState("");
  const [filters, setFilters] = useState({
    industry: "",
    companySize: "",
    expectedCloseDate: "",
    search: "",
  });
  const [filterLogic, setFilterLogic] = useState<"AND" | "OR">("AND");
  const [isImporting, setIsImporting] = useState(false);
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "leads"),
      where("userId", "==", user.uid),
      orderBy("order", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Client[];
        setClients(data);
        setLoading(false);
      },
      (error) => {
        console.error("Firestore leads error:", error);
        setLoading(false);
      }
    );

    const qRuns = query(
      collection(db, "payroll_runs"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubRuns = onSnapshot(qRuns, (snapshot) => {
      setPayrollRuns(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qShipments = query(
      collection(db, "shipments"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubShipments = onSnapshot(qShipments, (snapshot) => {
      setShipments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    const qInvoices = query(
      collection(db, "invoices"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubInvoices = onSnapshot(qInvoices, (snapshot) => {
      setInvoices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubscribe();
      unsubRuns();
      unsubShipments();
      unsubInvoices();
    };
  }, [user]);

  useEffect(() => {
    if (user && (location.pathname === "/app/crm/new" || location.state?.openAddLead)) {
      setEditingClient({ status: "new", value: 0 });
      setActiveTab("details");
      setIsModalOpen(true);
      navigate("/app/crm", { replace: true, state: {} });
    }
  }, [user, location]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !user) return;

    try {
      const currentClient = { ...editingClient };
      const historyItem = {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: editingClient.id ? "تم تحديث البيانات" : "تم إنشاء الصفقة",
        details: editingClient.id ? "تم تعديل بيانات العميل" : "تمت إضافة العميل إلى النظام",
      };

      const history = editingClient.id
        ? [historyItem, ...(editingClient.history || [])]
        : [historyItem];

      const leadData = {
        ...currentClient,
        history,
        userId: user.uid,
        updatedAt: serverTimestamp(),
      };

      if (editingClient.id) {
        const { id, ...updateData } = leadData;
        await updateDoc(doc(db, "leads", id), updateData);
      } else {
        await addDoc(collection(db, "leads"), {
          ...leadData,
          createdAt: serverTimestamp(),
          order: clients.length,
        });
      }

      setIsModalOpen(false);
      setEditingClient(null);
    } catch (err) {
      console.error("Save lead failed", err);
    }
  };

  const handleAutoReminders = async () => {
    const clientsToRemind = clients.filter((c) => c.status === "new" || c.status === "contacted");
    if (clientsToRemind.length === 0) {
      alert("لا يوجد عملاء بحاجة إلى تذكير حالياً.");
      return;
    }

    try {
      for (const client of clientsToRemind) {
        const historyItem = {
          id: `h_${Date.now() + Math.random()}`,
          date: new Date().toISOString(),
          action: "تذكير تلقائي",
          details: "تم إرسال رسالة متابعة للعميل بناءً على حالته الحالية.",
        };
        await updateDoc(doc(db, "leads", client.id), {
          history: [historyItem, ...(client.history || [])],
          updatedAt: serverTimestamp(),
        });
      }
      alert(`تم إرسال تذكيرات إلى ${clientsToRemind.length} عميل بنجاح.`);
    } catch (err) {
      console.error("Failed to sync reminders history", err);
    }
  };

  const toggleSortMenu = (columnId: string) => {
    setMultiSortMenu((prev) => (prev === columnId ? null : columnId));
  };

  const updateSort = (
    columnId: string,
    primaryField: SortField,
    primaryOrder: SortOrder,
    secondaryField: SortField,
    secondaryOrder: SortOrder
  ) => {
    setColumnSort((prev) => ({
      ...prev,
      [columnId]: { primaryField, primaryOrder, secondaryField, secondaryOrder },
    }));
  };

  const getSortedClients = (columnId: string) => {
    const colClients = clients.filter((l) => {
      if (l.status !== columnId) return false;

      const searchTerms = filters.search.toLowerCase().split(/\s+/).filter(Boolean);
      const searchMatch =
        searchTerms.length === 0 ||
        searchTerms.every(
          (term) =>
            l.name.toLowerCase().includes(term) ||
            l.company.toLowerCase().includes(term) ||
            l.industry?.toLowerCase().includes(term) ||
            (l.projectCode && l.projectCode.toLowerCase().includes(term))
        );
      const indMatch = !filters.industry || l.industry === filters.industry;
      const sizeMatch = !filters.companySize || l.companySize === filters.companySize;
      const dateMatch =
        !filters.expectedCloseDate ||
        (l.expectedCloseDate && String(l.expectedCloseDate).startsWith(filters.expectedCloseDate));

      if (!searchMatch) return false;

      const hasAdvancedFilters =
        filters.industry || filters.companySize || filters.expectedCloseDate;
      if (!hasAdvancedFilters) return true;

      if (filterLogic === "AND") {
        return indMatch && sizeMatch && dateMatch;
      } else {
        const matches = [];
        if (filters.industry) matches.push(indMatch);
        if (filters.companySize) matches.push(sizeMatch);
        if (filters.expectedCloseDate) matches.push(dateMatch);
        return matches.some(Boolean);
      }
    });

    const sort = columnSort[columnId];
    if (!sort || (sort.primaryField === "none" && sort.secondaryField === "none")) {
      return colClients.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return [...colClients].sort((a, b) => {
      // Primary Compare
      let pA = a[sort.primaryField];
      let pB = b[sort.primaryField];

      if (sort.primaryField === "expectedCloseDate") {
        pA = pA || "9999-12-31";
        pB = pB || "9999-12-31";
      }

      const pCmp = pA < pB ? -1 : pA > pB ? 1 : 0;
      if (pCmp !== 0 && sort.primaryField !== "none") {
        return sort.primaryOrder === "asc" ? pCmp : -pCmp;
      }

      // Secondary Compare
      let sA = a[sort.secondaryField];
      let sB = b[sort.secondaryField];
      if (sort.secondaryField === "expectedCloseDate") {
        sA = sA || "9999-12-31";
        sB = sB || "9999-12-31";
      }

      const sCmp = sA < sB ? -1 : sA > sB ? 1 : 0;
      if (sCmp !== 0 && sort.secondaryField !== "none") {
        return sort.secondaryOrder === "asc" ? sCmp : -sCmp;
      }

      return 0;
    });
  };

  const onDragEnd = async (result: any) => {
    const { destination, source } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const sourceClients = getSortedClients(sourceStatus);
    const destClients = sourceStatus === destStatus ? sourceClients : getSortedClients(destStatus);

    const clientMoved = sourceClients[source.index];
    const newClients = [...clients];

    const sourceArr = Array.from(sourceClients);
    sourceArr.splice(source.index, 1);

    let destArr;
    if (sourceStatus === destStatus) {
      destArr = sourceArr;
      destArr.splice(destination.index, 0, clientMoved);
    } else {
      destArr = Array.from(destClients);
      destArr.splice(destination.index, 0, clientMoved);

      const sourceArrStr = columns.find((c) => c.id === sourceStatus)?.name;
      const destArrStr = columns.find((c) => c.id === destStatus)?.name;
      const newHistory = {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: "تغيير حالة",
        details: `انتقل من ${sourceArrStr} إلى ${destArrStr}`,
      };
      clientMoved.status = destStatus as any;
      clientMoved.history = clientMoved.history
        ? [newHistory, ...clientMoved.history]
        : [newHistory];

      import("firebase/firestore").then(({ addDoc, collection, serverTimestamp }) => {
        addDoc(collection(db, "audit_logs"), {
          userId: user?.uid,
          module: "CRM",
          action: `تم تغيير حالة العميل ${clientMoved.name} من ${sourceArrStr} إلى ${destArrStr}`,
          timestamp: new Date().toISOString(),
          user: { name: user?.name || "نظام CRM" },
        }).catch(console.error);
      });
    }

    const itemsToUpdate: any[] = [];
    destArr.forEach((c, index) => {
      const idx = newClients.findIndex((curr) => curr.id === c.id);
      if (idx !== -1) {
        newClients[idx].order = index;
        if (newClients[idx].id === clientMoved.id) {
          newClients[idx].status = destStatus as any;
          newClients[idx].history = clientMoved.history;
          itemsToUpdate.push({
            id: clientMoved.id,
            status: destStatus,
            order: index,
            history: clientMoved.history,
          });
        } else {
          itemsToUpdate.push({ id: newClients[idx].id, order: index });
        }
      }
    });

    if (sourceStatus !== destStatus) {
      sourceArr.forEach((c: any, index) => {
        const idx = newClients.findIndex((curr) => curr.id === c.id);
        if (idx !== -1) {
          newClients[idx].order = index;
          itemsToUpdate.push({ id: newClients[idx].id, order: index });
        }
      });
    }

    setClients(newClients);

    if (sourceStatus !== destStatus) {
      setStatusChangePrompt({
        client: clientMoved,
        sourceStatus,
        destStatus,
        itemsToUpdate,
      });
      return;
    }

    try {
      const batch = writeBatch(db);
      itemsToUpdate.forEach((item) => {
        const { id, ...data } = item;
        batch.update(doc(db, "leads", id), { ...data, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      console.error("Batch update failed", err);
    }
  };

  const executeStatusChangeSave = async (items: any[]) => {
    try {
      const batch = writeBatch(db);
      items.forEach((item) => {
        const { id, ...data } = item;
        batch.update(doc(db, "leads", id), { ...data, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    } catch (err) {
      console.error("Status change save failed", err);
    }
  };

  const handleCsvImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const rows = text.split("\n").filter((row) => row.trim());
      const headers = rows[0].split(",").map((h) => h.trim().toLowerCase());

      const newClients = rows.slice(1).map((row) => {
        const values = row.split(",").map((v) => v.trim());
        const data: any = {};
        headers.forEach((header, index) => {
          data[header] = values[index];
        });

        return {
          name: data.name || data["اسم العميل"] || "بدون اسم",
          email: data.email || data["البريد الإلكتروني"] || "",
          phone: data.phone || data["الهاتف"] || "",
          company: data.company || data["الشركة"] || "غير محدد",
          status: ["new", "contacted", "won", "lost", "contracted"].includes(
            data.status?.toLowerCase()
          )
            ? data.status.toLowerCase()
            : "new",
          value: parseFloat(data.value || data["القيمة"]) || 0,
          userId: user.uid,
          createdAt: serverTimestamp(),
          history: [
            {
              id: `h_${Date.now()}_${Math.random()}`,
              date: new Date().toISOString(),
              action: "استيراد CSV",
              details: "تم استيراد بيانات العميل من ملف CSV",
            },
          ],
        };
      });

      if (newClients.length > 0) {
        const batch = writeBatch(db);
        newClients.forEach((client) => {
          const docRef = doc(collection(db, "leads"));
          batch.set(docRef, client);
        });
        await batch.commit();
        alert(`تم استيراد ${newClients.length} عميل بنجاح`);
      }
    } catch (err) {
      console.error("CSV Import Error", err);
      alert(
        "حدث خطأ أثناء استيراد الملف. يرجى التأكد من أن الهيكل صحيح (name, email, phone, company, status, value)"
      );
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const submitStatusChange = (addNote: boolean) => {
    if (!statusChangePrompt) return;

    const items = [...statusChangePrompt.itemsToUpdate];

    if (addNote && statusChangeNote.trim()) {
      const noteHistoryItem = {
        id: `h_${Date.now() + 1}`,
        date: new Date().toISOString(),
        action: "ملاحظة تغيير الحالة",
        details: statusChangeNote.trim(),
      };

      const newClients = [...clients];
      const clientIdx = newClients.findIndex((c) => c.id === statusChangePrompt.client.id);

      if (clientIdx !== -1) {
        newClients[clientIdx].history = [noteHistoryItem, ...(newClients[clientIdx].history || [])];
        setClients(newClients);

        // Update items to push to backend
        const updateIdx = items.findIndex((item) => item.id === statusChangePrompt.client.id);
        if (updateIdx !== -1) {
          items[updateIdx].history = newClients[clientIdx].history;
        }
      }
    }

    executeStatusChangeSave(items);
    setStatusChangePrompt(null);
    setStatusChangeNote("");
  };

  if (loading)
    return (
      <div className="h-full flex items-center justify-center">تحميل قاعدة بيانات العملاء...</div>
    );

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-10rem)] flex flex-col pb-10">
      <PayrollComplianceWidget runs={payrollRuns} />
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            {t("crm.title", "العملاء والموظفين والهويات")}
          </h1>
          <p className="text-zinc-500 mt-1 font-medium italic">
            {t("crm.subtitle", "مدارج CRM: تتبع وتحكم في رحلة العميل والهويات الاستراتيجية.")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isImporting}
            />
            <button className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-emerald-100 transition-all text-sm border border-emerald-100 disabled:opacity-50">
              <Upload className="w-4 h-4" />
              <span>{isImporting ? "جاري الاستيراد..." : "استيراد عملاء (CSV)"}</span>
            </button>
          </div>
          <button
            onClick={handleAutoReminders}
            className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3.5 rounded-2xl font-bold hover:bg-blue-100 transition-all text-sm border border-blue-100"
          >
            <Send className="w-4 h-4" />
            <span>تذكيرات المتابعة</span>
          </button>
          <button
            onClick={() => {
              setEditingClient({ status: "new", value: 0 });
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-zinc-900 text-white px-8 py-3.5 rounded-2xl font-bold shadow-xl shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة سجل جديد</span>
          </button>
        </div>
      </header>

      <div className="flex gap-4 border-b border-zinc-200 mb-2">
        <button
          onClick={() => setMainTab("crm")}
          className={`pb-4 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-colors ${mainTab === "crm" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
        >
          <Briefcase className="w-5 h-5" /> إدارة علاقات العملاء (CRM)
        </button>
        <button
          onClick={() => setMainTab("identity")}
          className={`pb-4 px-2 font-black text-sm flex items-center gap-2 border-b-2 transition-colors ${mainTab === "identity" ? "border-purple-600 text-purple-600" : "border-transparent text-zinc-500 hover:text-zinc-900"}`}
        >
          <IdCard className="w-5 h-5" /> محرك الهوية والبيانات (Identity Engine)
        </button>
      </div>

      {mainTab === "crm" ? (
        <>
          {/* Advanced Filters */}
          <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث عن عميل أو شركة..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pr-10 pl-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all placeholder:text-zinc-400"
              />
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="">جميع القطاعات</option>
                <option value="التقنية">التقنية</option>
                <option value="الرعاية الصحية">الرعاية الصحية</option>
                <option value="التجارة">التجارة</option>
                <option value="المقاولات">المقاولات</option>
                <option value="التعليم">التعليم</option>
                <option value="المالية">المالية</option>
              </select>

              <select
                value={filters.companySize}
                onChange={(e) => setFilters({ ...filters, companySize: e.target.value })}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10"
              >
                <option value="">حجم الشركة</option>
                <option value="1-10">1-10 موظفين</option>
                <option value="11-50">11-50 موظف</option>
                <option value="51-200">51-200 موظف</option>
                <option value="201-500">201-500 موظف</option>
                <option value="500+">500+ موظف</option>
              </select>

              <input
                type="date"
                value={filters.expectedCloseDate}
                onChange={(e) => setFilters({ ...filters, expectedCloseDate: e.target.value })}
                className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-zinc-900/10"
                title="تاريخ الإغلاق المتوقع"
              />

              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg">
                <button
                  onClick={() => setFilterLogic("AND")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                    filterLogic === "AND"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  AND
                </button>
                <button
                  onClick={() => setFilterLogic("OR")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-md transition-all",
                    filterLogic === "OR"
                      ? "bg-white text-zinc-900 shadow-sm"
                      : "text-zinc-500 hover:text-zinc-700"
                  )}
                >
                  OR
                </button>
              </div>

              {(filters.search ||
                filters.industry ||
                filters.companySize ||
                filters.expectedCloseDate) && (
                <button
                  onClick={() => {
                    setFilters({
                      industry: "",
                      companySize: "",
                      expectedCloseDate: "",
                      search: "",
                    });
                    setFilterLogic("AND");
                  }}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>

          {/* Pipeline View */}
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4 no-scrollbar">
              {columns.map((column) => (
                <div
                  key={column.id}
                  className="flex-shrink-0 w-85 bg-zinc-50 rounded-[2.5rem] p-5 flex flex-col border border-zinc-200/50"
                >
                  <div className="flex items-center justify-between mb-4 px-3">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-3 h-3 rounded-full shadow-sm", column.color)} />
                      <h3 className="font-black text-zinc-900 text-sm tracking-tight">
                        {column.name}
                      </h3>
                      <span className="text-[10px] bg-white px-2.5 py-1 rounded-full border border-zinc-200 text-zinc-500 font-black">
                        {clients.filter((l) => l.status === column.id).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 relative">
                      <button
                        onClick={() => toggleSortMenu(column.id)}
                        title="فرز متعدد الحقول"
                        className={cn(
                          "p-1.5 rounded-lg transition-all border",
                          columnSort[column.id] &&
                            (columnSort[column.id].primaryField !== "none" ||
                              columnSort[column.id].secondaryField !== "none")
                            ? "bg-zinc-900 text-white border-zinc-900"
                            : "bg-white text-zinc-400 border-zinc-200 hover:border-zinc-300"
                        )}
                      >
                        <ListOrdered className="w-3.5 h-3.5" />
                      </button>
                      <AnimatePresence>
                        {multiSortMenu === column.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-10 left-0 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 p-4"
                          >
                            <h4 className="text-xs font-bold text-zinc-900 mb-3">إعدادات الفرز</h4>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500">
                                  الفرز الأساسي
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    value={columnSort[column.id]?.primaryField || "none"}
                                    onChange={(e) =>
                                      updateSort(
                                        column.id,
                                        e.target.value as any,
                                        columnSort[column.id]?.primaryOrder || "desc",
                                        columnSort[column.id]?.secondaryField || "none",
                                        columnSort[column.id]?.secondaryOrder || "desc"
                                      )
                                    }
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs px-2 py-1"
                                  >
                                    <option value="none">بدون</option>
                                    <option value="value">القيمة</option>
                                    <option value="expectedCloseDate">تاريخ الإغلاق</option>
                                  </select>
                                  <select
                                    value={columnSort[column.id]?.primaryOrder || "desc"}
                                    onChange={(e) =>
                                      updateSort(
                                        column.id,
                                        columnSort[column.id]?.primaryField || "none",
                                        e.target.value as any,
                                        columnSort[column.id]?.secondaryField || "none",
                                        columnSort[column.id]?.secondaryOrder || "desc"
                                      )
                                    }
                                    className="w-20 bg-zinc-50 border border-zinc-200 rounded-md text-xs px-2 py-1"
                                  >
                                    <option value="desc">تنازلي</option>
                                    <option value="asc">تصاعدي</option>
                                  </select>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500">
                                  الفرز الثانوي
                                </label>
                                <div className="flex gap-2">
                                  <select
                                    value={columnSort[column.id]?.secondaryField || "none"}
                                    onChange={(e) =>
                                      updateSort(
                                        column.id,
                                        columnSort[column.id]?.primaryField || "none",
                                        columnSort[column.id]?.primaryOrder || "desc",
                                        e.target.value as any,
                                        columnSort[column.id]?.secondaryOrder || "desc"
                                      )
                                    }
                                    className="flex-1 bg-zinc-50 border border-zinc-200 rounded-md text-xs px-2 py-1"
                                  >
                                    <option value="none">بدون</option>
                                    <option value="value">القيمة</option>
                                    <option value="expectedCloseDate">تاريخ الإغلاق</option>
                                  </select>
                                  <select
                                    value={columnSort[column.id]?.secondaryOrder || "desc"}
                                    onChange={(e) =>
                                      updateSort(
                                        column.id,
                                        columnSort[column.id]?.primaryField || "none",
                                        columnSort[column.id]?.primaryOrder || "desc",
                                        columnSort[column.id]?.secondaryField || "none",
                                        e.target.value as any
                                      )
                                    }
                                    className="w-20 bg-zinc-50 border border-zinc-200 rounded-md text-xs px-2 py-1"
                                  >
                                    <option value="desc">تنازلي</option>
                                    <option value="asc">تصاعدي</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => setMultiSortMenu(null)}
                                className="text-xs font-bold text-primary px-3 py-1 bg-primary/10 rounded-md"
                              >
                                إغلاق
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={cn(
                          "flex-1 space-y-5 overflow-y-auto no-scrollbar pt-1",
                          snapshot.isDraggingOver ? "bg-zinc-100/50 rounded-2xl" : ""
                        )}
                      >
                        {getSortedClients(column.id).map((client, index) => (
                          <React.Fragment key={client.id}>
                            <Draggable draggableId={client.id} index={index}>
                              {(provided, snapshot) => (
                                <PipelineCard
                                  client={client}
                                  provided={provided}
                                  snapshot={snapshot}
                                  onClick={() => {
                                    setEditingClient(client);
                                    setActiveTab("details");
                                    setIsModalOpen(true);
                                  }}
                                  onStatusChange={async (clientId: string, newStatus: string) => {
                                    const clientIdx = clients.findIndex((c) => c.id === clientId);
                                    if (clientIdx === -1) return;

                                    const updatedClients = [...clients];
                                    const oldStatus = updatedClients[clientIdx].status;
                                    updatedClients[clientIdx].status = newStatus as any;

                                    const newStatusName =
                                      columns.find((c) => c.id === newStatus)?.name || newStatus;
                                    const oldStatusName =
                                      columns.find((c) => c.id === oldStatus)?.name || oldStatus;
                                    const historyItem = {
                                      id: `h_${Date.now()}`,
                                      date: new Date().toISOString(),
                                      action: "تغيير حالة مباشر",
                                      details: `تغيير الحالة من ${oldStatusName} إلى ${newStatusName}`,
                                    };

                                    updatedClients[clientIdx].history = [
                                      historyItem,
                                      ...(updatedClients[clientIdx].history || []),
                                    ];
                                    setClients(updatedClients);

                                    try {
                                      import("firebase/firestore").then(
                                        ({ updateDoc, doc, addDoc, collection }) => {
                                          updateDoc(
                                            doc(db, "leads", clientId),
                                            updatedClients[clientIdx] as any
                                          );
                                          addDoc(collection(db, "audit_logs"), {
                                            userId: user?.uid,
                                            module: "CRM",
                                            action: `تم تغيير حالة العميل ${updatedClients[clientIdx].name} من ${oldStatusName} إلى ${newStatusName}`,
                                            timestamp: new Date().toISOString(),
                                            user: { name: user?.name || "نظام CRM" },
                                          }).catch(console.error);
                                        }
                                      );
                                    } catch (e) {
                                      console.error("Failed to update status", e);
                                    }
                                  }}
                                />
                              )}
                            </Draggable>
                          </React.Fragment>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>

                  <button
                    onClick={() => {
                      setEditingClient({ status: column.id as any, value: 0 });
                      setActiveTab("details");
                      setIsModalOpen(true);
                    }}
                    className="mt-4 flex items-center justify-center gap-2 py-4 rounded-[1.5rem] border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-600 hover:bg-white transition-all text-xs font-black tracking-tight"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صفقة في هذا الخط</span>
                  </button>
                </div>
              ))}
            </div>
          </DragDropContext>

          {/* Add/Edit Modal */}
          <AnimatePresence>
            {isModalOpen && editingClient && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-zinc-50 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] border border-white/20"
                  dir="rtl"
                >
                  {/* Branding Sidebar */}
                  <div className="w-full md:w-1/3 bg-zinc-900 p-8 text-white space-y-8">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
                      <Palette className="w-8 h-8 text-primary" />
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-xl font-black">هوية العميل</h3>
                      <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                        سيتم تطبيق هذه التفضيلات تلقائياً على جميع فواتير هذا العميل في مدارج OS.
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                          <Upload className="w-3 h-3" />
                          رابط الشعار (Logo URL)
                        </label>
                        <input
                          value={editingClient.branding?.logo || ""}
                          onChange={(e) =>
                            setEditingClient({
                              ...editingClient,
                              branding: {
                                ...editingClient.branding,
                                logo: e.target.value,
                              },
                            })
                          }
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-zinc-600"
                          placeholder="https://company.com/logo.png"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                          <Palette className="w-3 h-3" />
                          اللون الأساسي
                        </label>
                        <div className="flex gap-2">
                          {["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#18181b"].map((c) => (
                            <button
                              key={c}
                              onClick={() =>
                                setEditingClient({
                                  ...editingClient,
                                  branding: {
                                    ...editingClient.branding,
                                    primaryColor: c,
                                  },
                                })
                              }
                              className={cn(
                                "w-6 h-6 rounded-lg transition-transform",
                                editingClient.branding?.primaryColor === c
                                  ? "ring-2 ring-white scale-110"
                                  : "opacity-60"
                              )}
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                          <Globe className="w-3 h-3" />
                          اللغة الافتراضية
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setEditingClient({
                                ...editingClient,
                                branding: {
                                  ...editingClient.branding,
                                  language: "ar",
                                },
                              })
                            }
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-black border transition-all",
                              editingClient.branding?.language === "ar"
                                ? "bg-white text-zinc-900 border-white"
                                : "border-white/10 text-zinc-500"
                            )}
                          >
                            العربية
                          </button>
                          <button
                            onClick={() =>
                              setEditingClient({
                                ...editingClient,
                                branding: {
                                  ...editingClient.branding,
                                  language: "en",
                                },
                              })
                            }
                            className={cn(
                              "px-4 py-2 rounded-xl text-xs font-black border transition-all",
                              editingClient.branding?.language === "en"
                                ? "bg-white text-zinc-900 border-white"
                                : "border-white/10 text-zinc-500"
                            )}
                          >
                            English
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest flex items-center gap-2">
                          <ListOrdered className="w-3 h-3" />
                          البنود الافتراضية
                        </label>
                        <p className="text-[10px] text-zinc-500 pr-1 leading-relaxed">
                          قم بتحديد البنود الافتراضية التي تتم إضافتها تلقائياً عند إنشاء فاتورة
                          جديدة لهذا العميل.
                        </p>
                        <button
                          onClick={() => {
                            const currentItems = editingClient.defaultLineItems || [];
                            setEditingClient({
                              ...editingClient,
                              defaultLineItems: [
                                ...currentItems,
                                { name: "خدمات تصميم", quantity: 1, unitPrice: 100, taxRate: 15 },
                              ],
                            });
                          }}
                          className="w-full py-2 bg-white/10 text-white border border-white/20 rounded-xl text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-3 h-3" />
                          إضافة بند افتراضي
                        </button>
                        {(editingClient.defaultLineItems || []).map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex flex-col gap-2 p-3 bg-black/20 rounded-xl border border-white/5"
                          >
                            <input
                              value={item.name}
                              onChange={(e) => {
                                const newItems = [...(editingClient.defaultLineItems || [])];
                                newItems[i].name = e.target.value;
                                setEditingClient({ ...editingClient, defaultLineItems: newItems });
                              }}
                              className="w-full bg-transparent text-white text-xs font-bold border-b border-white/20 pb-1 focus:border-white focus:outline-none"
                              placeholder="وصف البند"
                            />
                            <div className="flex gap-2">
                              <input
                                type="number"
                                value={Number.isNaN(item.quantity) ? "" : item.quantity}
                                onChange={(e) => {
                                  const newItems = [...editingClient.defaultLineItems];
                                  newItems[i].quantity = Number(e.target.value);
                                  setEditingClient({
                                    ...editingClient,
                                    defaultLineItems: newItems,
                                  });
                                }}
                                className="w-16 bg-transparent text-center text-white text-xs border-b border-white/20 pb-1"
                                placeholder="الكمية"
                              />
                              <input
                                type="number"
                                value={Number.isNaN(item.unitPrice) ? "" : item.unitPrice}
                                onChange={(e) => {
                                  const newItems = [...editingClient.defaultLineItems];
                                  newItems[i].unitPrice = Number(e.target.value);
                                  setEditingClient({
                                    ...editingClient,
                                    defaultLineItems: newItems,
                                  });
                                }}
                                className="flex-1 bg-transparent text-center text-white text-xs border-b border-white/20 pb-1"
                                placeholder="السعر"
                              />
                              <button
                                onClick={() => {
                                  const newItems = editingClient.defaultLineItems.filter(
                                    (_: any, idx: number) => idx !== i
                                  );
                                  setEditingClient({
                                    ...editingClient,
                                    defaultLineItems: newItems,
                                  });
                                }}
                                className="text-rose-400 p-1"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Area / History Tab Area */}
                  <div className="flex-1 bg-white p-10 overflow-y-auto no-scrollbar relative flex flex-col">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="absolute top-6 left-6 p-2 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                      <X className="w-5 h-5 text-zinc-400" />
                    </button>

                    {editingClient.id && (
                      <div className="flex gap-4 border-b border-zinc-100 pb-2 mb-6 w-max">
                        <button
                          onClick={() => setActiveTab("details")}
                          className={cn(
                            "px-4 py-2 font-black text-sm uppercase tracking-widest relative transition-all",
                            activeTab === "details"
                              ? "text-zinc-900"
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          تفاصيل العميل
                          {activeTab === "details" && (
                            <motion.div
                              layoutId="activetab"
                              className="absolute -bottom-[9px] left-0 right-0 h-1 bg-primary rounded-t-full"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("history")}
                          className={cn(
                            "px-4 py-2 font-black text-sm uppercase tracking-widest relative transition-all",
                            activeTab === "history"
                              ? "text-zinc-900"
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          سجل النشاط
                          {activeTab === "history" && (
                            <motion.div
                              layoutId="activetab"
                              className="absolute -bottom-[9px] left-0 right-0 h-1 bg-primary rounded-t-full"
                            />
                          )}
                        </button>
                        <button
                          onClick={() => setActiveTab("shipments")}
                          className={cn(
                            "px-4 py-2 font-black text-sm uppercase tracking-widest relative transition-all",
                            activeTab === "shipments"
                              ? "text-zinc-900"
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          الشحنات
                          {activeTab === "shipments" && (
                            <motion.div
                              layoutId="activetab"
                              className="absolute -bottom-[9px] left-0 right-0 h-1 bg-primary rounded-t-full"
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("invoices")}
                          className={cn(
                            "px-4 py-2 font-black text-sm uppercase tracking-widest relative transition-all",
                            activeTab === "invoices"
                              ? "text-zinc-900"
                              : "text-zinc-400 hover:text-zinc-600"
                          )}
                        >
                          الفواتير والتحصيل
                          {activeTab === "invoices" && (
                            <motion.div
                              layoutId="activetab"
                              className="absolute -bottom-[9px] left-0 right-0 h-1 bg-primary rounded-t-full"
                            />
                          )}
                        </button>
                      </div>
                    )}

                    {activeTab === "details" ? (
                      <form
                        onSubmit={handleSave}
                        className="space-y-8 flex-1 overflow-y-auto pr-6 scrollbar-hide"
                      >
                        {!editingClient.id && (
                          <div className="space-y-1">
                            <h2 className="text-2xl font-black text-zinc-900">إضافة عميل جديد</h2>
                            <p className="text-xs text-zinc-400 font-bold tracking-tight">
                              أدخل بيانات العميل والشركة بدقة لضمان تحصيل سهل.
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <User className="w-3 h-3" />
                              اسم العميل الكامل
                            </label>
                            <input
                              required
                              value={editingClient.name || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="الاسم الثلاثي"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <IdCard className="w-3 h-3" />
                              المسمى الوظيفي
                            </label>
                            <div className="relative">
                              <input
                                value={editingClient.contactJobTitle || ""}
                                onChange={(e) =>
                                  setEditingClient({
                                    ...editingClient,
                                    contactJobTitle: e.target.value,
                                  })
                                }
                                className="w-full pl-12 pr-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                                placeholder="مدير المشتريات / رئيس تنفيذي"
                              />
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-lg shadow-sm text-zinc-400">
                                {(() => {
                                  const t = (editingClient.contactJobTitle || "").toLowerCase();
                                  if (t.includes("hr") || t.includes("موارد"))
                                    return <GraduationCap className="w-4 h-4 text-purple-500" />;
                                  if (
                                    t.includes("ceo") ||
                                    t.includes("رئيس") ||
                                    t.includes("مدير عام")
                                  )
                                    return <Briefcase className="w-4 h-4 text-blue-500" />;
                                  if (
                                    t.includes("tech") ||
                                    t.includes("تقني") ||
                                    t.includes("cto") ||
                                    t.includes("it")
                                  )
                                    return <Globe className="w-4 h-4 text-green-500" />;
                                  return <User className="w-4 h-4" />;
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Briefcase className="w-3 h-3" />
                              الشركة / المنظمة
                            </label>
                            <input
                              required
                              value={editingClient.company || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  company: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="اسم الكيان القانوني"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Building className="w-3 h-3" />
                              قطاع النشاط (Industry)
                            </label>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {[
                                "التقنية",
                                "الرعاية الصحية",
                                "التجارة",
                                "المقاولات",
                                "التعليم",
                                "المالية",
                              ].map((ind) => (
                                <button
                                  key={ind}
                                  type="button"
                                  onClick={() =>
                                    setEditingClient({ ...editingClient, industry: ind })
                                  }
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                                    editingClient.industry === ind
                                      ? "bg-blue-50 text-blue-600 border-blue-200 shadow-sm"
                                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                  )}
                                >
                                  {ind}
                                </button>
                              ))}
                            </div>
                            <input
                              value={editingClient.industry || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  industry: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="أو أدخل قطاعاً مخصصاً..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              نسبة تحويل الفرصة البيعية (٪)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editingClient.conversionProbability || 0}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  conversionProbability: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Check className="w-3 h-3" />
                              مستوى مخاطر الامتثال (ZATCA/قانونية)
                            </label>
                            <select
                              value={editingClient.complianceRisk || "low"}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  complianceRisk: e.target.value as any,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all cursor-pointer"
                            >
                              <option value="low">منخفضة (Low)</option>
                              <option value="medium">متوسطة (Medium)</option>
                              <option value="high">مرتفعة (High)</option>
                              <option value="critical">حرجة جدًا (Critical)</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              حجم الشركة
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                              {[
                                { id: "1-10", label: "1-10 موظف" },
                                { id: "11-50", label: "11-50 موظف" },
                                { id: "51-200", label: "51-200 موظف" },
                                { id: "200+", label: "أكثر من 200" },
                              ].map((size) => (
                                <button
                                  key={size.id}
                                  type="button"
                                  onClick={() =>
                                    setEditingClient({ ...editingClient, companySize: size.id })
                                  }
                                  className={cn(
                                    "py-3 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1",
                                    editingClient.companySize === size.id
                                      ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                                      : "bg-white text-zinc-500 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                                  )}
                                >
                                  <span>{size.id}</span>
                                  <span className="text-[10px] opacity-70 font-medium">موظف</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Mail className="w-3 h-3" />
                              البريد الإلكتروني
                            </label>
                            <input
                              type="email"
                              value={editingClient.email || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  email: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="mail@domain.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              رقم الجوال
                            </label>
                            <input
                              required
                              value={editingClient.phone || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  phone: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300 text-left"
                              dir="ltr"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Hash className="w-3 h-3" />
                              الرقم الضريبي (VAT ID)
                            </label>
                            <input
                              value={editingClient.vatId || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  vatId: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="3000XXXXXXXX003"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <DollarSign className="w-3 h-3" />
                              قيمة الصفقة المتوقعة
                            </label>
                            <input
                              type="number"
                              value={editingClient.value || 0}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  value: Number(e.target.value),
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Calendar className="w-3 h-3" />
                              تاريخ الإغلاق المتوقع
                            </label>
                            <input
                              type="date"
                              value={editingClient.expectedCloseDate || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  expectedCloseDate: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <StickyNote className="w-3 h-3" />
                              ملاحظات استراتيجية (Notes)
                            </label>
                            <textarea
                              value={editingClient.notes || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  notes: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] placeholder:text-zinc-300"
                              placeholder="سجل أهم الملاحظات حول هذا العميل أو أهداف التواصل للمرحلة القادمة..."
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              تاريخ انتهاء العقد
                            </label>
                            <input
                              type="date"
                              value={editingClient.contractEndDate || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  contractEndDate: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Hash className="w-3 h-3" />
                              كود المشروع (Project Code)
                            </label>
                            <input
                              value={editingClient.projectCode || ""}
                              onChange={(e) =>
                                setEditingClient({
                                  ...editingClient,
                                  projectCode: e.target.value,
                                })
                              }
                              className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-zinc-300"
                              placeholder="PROJ-001"
                            />
                          </div>
                        </div>

                        <div className="py-4 border-t border-zinc-100">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                            <DollarSign className="w-3 h-3" />
                            إجراءات الفواتير
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              navigate("/app/invoices", {
                                state: {
                                  openInvoiceBuilder: true,
                                  initialData: {
                                    clientName: editingClient.name,
                                    clientEmail: editingClient.email,
                                    clientId: editingClient.id,
                                  },
                                },
                              });
                            }}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary/5 text-primary border border-primary/10 rounded-[1.5rem] font-black text-sm hover:bg-primary/10 transition-all shadow-sm"
                          >
                            <FileText className="w-5 h-5" />
                            <span>إنشاء طلب تحصيل أو فاتورة لهذا العميل</span>
                          </button>
                        </div>

                        {editingClient.id && (
                          <div className="py-4 border-t border-zinc-100 space-y-3">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5 text-amber-500" />
                              تقييم أولوية العميل بالذكاء الاصطناعي (AI Lead Scoring)
                            </label>
                            <p className="text-[11px] text-zinc-400 font-bold leading-relaxed">
                              يقوم محرك الذكاء الاصطناعي بتحليل القطاع، وحجم الشركة، وقيمة الصفقة،
                              وتاريخ التواصل لتقدير أولوية الصفقة بدقة وتوجيه فريق المبيعات.
                            </p>

                            {editingClient.leadScore && (
                              <div
                                className={cn(
                                  "p-4 rounded-2xl border flex flex-col gap-2 text-right",
                                  editingClient.leadScore === "Hot"
                                    ? "bg-orange-50/70 border-orange-100 text-orange-950"
                                    : editingClient.leadScore === "Warm"
                                      ? "bg-yellow-50/70 border-yellow-100 text-yellow-950"
                                      : "bg-blue-50/70 border-blue-100 text-blue-950"
                                )}
                              >
                                <div className="flex justify-between items-center border-b pb-2 border-zinc-200/40">
                                  <span className="text-[11px] font-black flex items-center gap-1.5">
                                    <Zap
                                      className={cn(
                                        "w-4 h-4",
                                        editingClient.leadScore === "Hot"
                                          ? "text-orange-500"
                                          : editingClient.leadScore === "Warm"
                                            ? "text-amber-500"
                                            : "text-blue-500"
                                      )}
                                    />
                                    أولوية الفرصة:{" "}
                                    <span className="font-black underline decoration-2">
                                      {editingClient.leadScore === "Hot"
                                        ? "ساخن (أولوية قصوى)"
                                        : editingClient.leadScore === "Warm"
                                          ? "دافئ (أولوية متوسطة)"
                                          : "بارد (أولوية منخفضة)"}
                                    </span>
                                  </span>
                                  {editingClient.leadScoreDate && (
                                    <span className="text-[9px] opacity-60 font-mono">
                                      تاريخ التقييم:{" "}
                                      {new Date(editingClient.leadScoreDate).toLocaleDateString(
                                        "ar-EG"
                                      )}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-semibold leading-relaxed">
                                  {editingClient.leadScoreReason}
                                </p>
                              </div>
                            )}

                            <button
                              type="button"
                              disabled={scoringInProgress}
                              onClick={async () => {
                                if (!editingClient.id) return;
                                setScoringInProgress(true);
                                try {
                                  const res = await fetch(`/api/leads/${editingClient.id}/score`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                  });
                                  if (!res.ok) {
                                    const errData = await res.json();
                                    throw new Error(errData.error || "Failed to score lead");
                                  }
                                  const scored = await res.json();
                                  setEditingClient({
                                    ...editingClient,
                                    leadScore: scored.score,
                                    leadScoreReason: scored.reason,
                                    leadScoreDate: scored.date,
                                  });
                                  // Update local clients state
                                  setClients((prev) =>
                                    prev.map((c) =>
                                      c.id === editingClient.id
                                        ? {
                                            ...c,
                                            leadScore: scored.score,
                                            leadScoreReason: scored.reason,
                                            leadScoreDate: scored.date,
                                          }
                                        : c
                                    )
                                  );
                                  toast.success(
                                    "تم تقييم الفرصة البيعية بنجاح بواسطة الذكاء الاصطناعي! 🚀"
                                  );
                                } catch (err: any) {
                                  toast.error(
                                    err.message ||
                                      "عذراً، فشل احتساب تقييم الفرصة بالذكاء الاصطناعي."
                                  );
                                } finally {
                                  setScoringInProgress(false);
                                }
                              }}
                              className={cn(
                                "w-full flex items-center justify-center gap-3 px-6 py-4 border rounded-[1.5rem] font-black text-sm transition-all shadow-sm cursor-pointer",
                                scoringInProgress
                                  ? "bg-zinc-100 text-zinc-400 border-zinc-200 animate-pulse"
                                  : "bg-amber-500/10 text-amber-700 border-amber-500/20 hover:bg-amber-500/20"
                              )}
                            >
                              <Zap
                                className={cn(
                                  "w-5 h-5",
                                  scoringInProgress ? "animate-spin" : "text-amber-500"
                                )}
                              />
                              <span>
                                {scoringInProgress
                                  ? "جاري تحليل البيانات واحتساب الأولوية بالذكاء الاصطناعي..."
                                  : "تحديث التقييم بالذكاء الاصطناعي (AI Score Lead)"}
                              </span>
                            </button>
                          </div>
                        )}

                        <div className="pt-6 border-t border-zinc-100 flex gap-4 mt-auto">
                          <button
                            type="submit"
                            className="flex-1 bg-zinc-900 text-white py-4 rounded-[1.5rem] font-black shadow-xl shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                          >
                            {editingClient.id ? "تحديث البيانات" : "حفظ الملف التعريفي"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 bg-zinc-100 text-zinc-600 py-4 rounded-[1.5rem] font-black hover:bg-zinc-200 transition-all"
                          >
                            إلغاء
                          </button>
                        </div>
                      </form>
                    ) : activeTab === "shipments" ? (
                      <div className="flex-1 flex flex-col pt-4 space-y-6 overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center px-2">
                          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            الشحنات اللوجستية المرتبطة بالعميل
                          </h4>
                          <button
                            onClick={() => navigate("/app/suppliers")}
                            className="text-[10px] font-black text-primary hover:underline"
                          >
                            تتبع كافة الشحنات
                          </button>
                        </div>
                        {shipments.filter((s) => s.clientId === editingClient.id).length > 0 ? (
                          <div className="grid gap-4">
                            {shipments
                              .filter((s) => s.clientId === (editingClient as any).id)
                              .map((s) => (
                                <div
                                  key={s.id}
                                  onClick={() => navigate(`/app/suppliers/${s.id}`)}
                                  className="p-5 bg-zinc-50 border border-zinc-100 rounded-3xl flex justify-between items-center cursor-pointer hover:border-primary hover:bg-white transition-all group"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white shadow-sm border border-zinc-100 rounded-xl flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                      <Truck className="w-5 h-5 text-zinc-400 group-hover:text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-black text-zinc-900 group-hover:text-primary transition-colors">
                                        {s.alias || s.supplierName}
                                      </p>
                                      <p className="text-[9px] text-zinc-400 font-bold">
                                        #{s.id} • {s.carrier}
                                      </p>
                                    </div>
                                  </div>
                                  <span
                                    className={cn(
                                      "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                                      s.status === "cleared"
                                        ? "bg-emerald-50 text-emerald-600"
                                        : "bg-primary/10 text-primary"
                                    )}
                                  >
                                    {s.status}
                                  </span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-20 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 border-dashed">
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                              <Truck className="w-8 h-8 text-zinc-200" />
                            </div>
                            <p className="text-xs font-black text-zinc-900">لا توجد شحنات مرتبطة</p>
                            <p className="text-[10px] text-zinc-400 font-medium mt-1 uppercase tracking-tight">
                              يرجى الربط من صفحة الموردين
                            </p>
                            <button
                              onClick={() => navigate("/app/suppliers")}
                              className="mt-6 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10"
                            >
                              تخصيص شحنة للعميل
                            </button>
                          </div>
                        )}
                      </div>
                    ) : activeTab === "invoices" ? (
                      <div className="flex-1 flex flex-col pt-4 space-y-6 overflow-y-auto scrollbar-hide">
                        <div className="flex justify-between items-center px-2">
                          <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            الفواتير وطلبات التحصيل المرتبطة بالعميل
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              setIsModalOpen(false);
                              navigate("/app/invoices", {
                                state: {
                                  openInvoiceBuilder: true,
                                  initialData: {
                                    clientName: editingClient.name,
                                    clientEmail: editingClient.email,
                                    clientId: editingClient.id,
                                  },
                                },
                              });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black hover:bg-emerald-100 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إنشاء فاتورة جديدة / Create Invoice</span>
                          </button>
                        </div>

                        {/* Simple summary stats for this client's invoices */}
                        {(() => {
                          const clientInvoices = invoices.filter(
                            (inv) =>
                              inv.clientId === editingClient.id ||
                              inv.clientName?.toLowerCase() === editingClient.name?.toLowerCase()
                          );
                          const totalAmount =
                            clientInvoices.reduce(
                              (acc, current) => acc + (current.totalAmountHalalas || 0),
                              0
                            ) / 100;
                          const paidAmount =
                            clientInvoices
                              .filter((inv) => inv.status === "paid")
                              .reduce(
                                (acc, current) => acc + (current.totalAmountHalalas || 0),
                                0
                              ) / 100;
                          const outstandingAmount = totalAmount - paidAmount;

                          return (
                            <div className="space-y-6 text-right">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                                  <p className="text-[10px] font-extrabold text-zinc-400">
                                    إجمالي المبيعات / Total Billed
                                  </p>
                                  <p className="text-base font-black text-zinc-900 mt-1">
                                    {totalAmount.toLocaleString()} ر.س
                                  </p>
                                </div>
                                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                                  <p className="text-[10px] font-extrabold text-emerald-700">
                                    المحصل / Total Paid
                                  </p>
                                  <p className="text-base font-black text-emerald-800 mt-1">
                                    {paidAmount.toLocaleString()} ر.س
                                  </p>
                                </div>
                                <div className="p-4 bg-amber-50/60 border border-amber-100 rounded-2xl">
                                  <p className="text-[10px] font-extrabold text-amber-700 font-sans">
                                    المستحق / Outstanding
                                  </p>
                                  <p className="text-base font-black text-amber-900 mt-1">
                                    {outstandingAmount.toLocaleString()} ر.س
                                  </p>
                                </div>
                              </div>

                              {clientInvoices.length > 0 ? (
                                <div className="grid gap-3">
                                  {clientInvoices.map((inv) => (
                                    <div
                                      key={inv.id}
                                      onClick={() => {
                                        setIsModalOpen(false);
                                        navigate("/app/invoices");
                                      }}
                                      className="p-4 bg-white border border-zinc-200 hover:border-emerald-600 rounded-2xl flex justify-between items-center cursor-pointer transition-all shadow-2xs group"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-zinc-50 border border-zinc-150 rounded-xl flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                          <FileText className="w-4 h-4 text-zinc-400 group-hover:text-emerald-600" />
                                        </div>
                                        <div className="text-right">
                                          <p className="text-xs font-black text-zinc-900 group-hover:text-emerald-700 transition-colors">
                                            فاتورة #{inv.number || "0000"}
                                          </p>
                                          <p className="text-[10px] text-zinc-400 font-bold">
                                            {inv.issueDate
                                              ? new Date(inv.issueDate).toLocaleDateString("ar-SA")
                                              : ""}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-zinc-950 font-sans">
                                          {((inv.totalAmountHalalas || 0) / 100).toLocaleString()}{" "}
                                          ر.س
                                        </span>
                                        <span
                                          className={cn(
                                            "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase",
                                            inv.status === "paid"
                                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                              : inv.status === "overdue"
                                                ? "bg-rose-50 text-rose-700 border border-rose-100 animate-pulse"
                                                : "bg-amber-50 text-amber-700 border border-amber-100"
                                          )}
                                        >
                                          {inv.status === "paid"
                                            ? "مدفوعة"
                                            : inv.status === "overdue"
                                              ? "متأخرة السداد"
                                              : "بانتظار التحصيل"}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-16 bg-zinc-50 rounded-[2rem] border border-zinc-150 border-dashed">
                                  <div className="w-12 h-12 bg-white rounded-full shadow-2xs flex items-center justify-center mx-auto mb-3">
                                    <FileText className="w-6 h-6 text-zinc-300" />
                                  </div>
                                  <p className="text-xs font-black text-zinc-800">
                                    لا توجد فواتير صادرة لهذا العميل
                                  </p>
                                  <p className="text-[10px] text-zinc-400 font-medium mt-1 text-center">
                                    هل ترغب في إصدار أول فاتورة تحصيل فوراً؟
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col pt-4">
                        <div className="mb-6 flex gap-2">
                          <input
                            type="text"
                            placeholder="إضافة ملاحظة أو تحديث..."
                            className="flex-1 px-4 py-2 border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                e.preventDefault();
                                const newNote = e.currentTarget.value.trim();
                                const newHistoryItem = {
                                  id: `h_${Date.now()}`,
                                  date: new Date().toISOString(),
                                  action: "تمت إضافة ملاحظة",
                                  details: newNote,
                                };
                                setEditingClient((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        history: [newHistoryItem, ...(prev.history || [])],
                                      }
                                    : prev
                                );
                                e.currentTarget.value = "";
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.currentTarget
                                .previousElementSibling as HTMLInputElement;
                              if (input.value.trim()) {
                                const newNote = input.value.trim();
                                const newHistoryItem = {
                                  id: `h_${Date.now()}`,
                                  date: new Date().toISOString(),
                                  action: "تمت إضافة ملاحظة",
                                  details: newNote,
                                };
                                setEditingClient((prev) =>
                                  prev
                                    ? {
                                        ...prev,
                                        history: [newHistoryItem, ...(prev.history || [])],
                                      }
                                    : prev
                                );
                                input.value = "";
                              }
                            }}
                            className="px-4 py-2 bg-primary text-zinc-900 font-bold text-sm rounded-xl hover:bg-primary/90"
                          >
                            إضافة
                          </button>
                        </div>
                        {!editingClient.history || editingClient.history.length === 0 ? (
                          <div className="text-center py-20 text-zinc-400">
                            <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p className="font-bold">لا يوجد سجل تاريخي لهذا العميل حتى الآن.</p>
                          </div>
                        ) : (
                          <div className="space-y-6 relative before:absolute before:inset-y-0 before:right-[15px] before:w-[2px] before:bg-zinc-100 p-2">
                            {editingClient.history.map((item, idx) => (
                              <div key={item.id} className="relative rtl:pl-0 rtl:pr-10 text-right">
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-50 text-blue-500 border-4 border-white flex items-center justify-center shadow-sm">
                                  <History className="w-3.5 h-3.5" />
                                </div>
                                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-black text-sm text-zinc-900">
                                      {item.action}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-bold" dir="ltr">
                                      {new Date(item.date).toLocaleString("ar-SA")}
                                    </span>
                                  </div>
                                  <p className="text-xs text-zinc-500 font-medium">
                                    {item.details}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {statusChangePrompt && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8"
                  dir="rtl"
                >
                  <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">ملاحظة تغيير الحالة</h3>
                  <p className="text-sm font-medium text-zinc-500 mb-6">
                    قمت بنقل{" "}
                    <strong className="text-zinc-900">{statusChangePrompt.client.name}</strong> متى
                    ما أردت يمكنك إضافة ملاحظة سريعة توضح سبب أو تفاصيل هذه الخطوة.
                  </p>

                  <textarea
                    value={statusChangeNote}
                    onChange={(e) => setStatusChangeNote(e.target.value)}
                    className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl font-bold text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[100px] mb-6 placeholder:text-zinc-300"
                    placeholder="مثال: تم التواصل هاتفياً وطلب إرسال عرض فني..."
                    autoFocus
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => submitStatusChange(true)}
                      className="flex-1 bg-zinc-900 text-white py-3.5 rounded-2xl font-black shadow-xl shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      حفظ الملاحظة
                    </button>
                    <button
                      onClick={() => submitStatusChange(false)}
                      className="px-6 bg-zinc-100 text-zinc-600 py-3.5 rounded-2xl font-black hover:bg-zinc-200 transition-all"
                    >
                      تخطي
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {identityTabsArr.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setIdentityTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold whitespace-nowrap transition-colors ${
                  identityTab === tab.id
                    ? "bg-purple-600 text-white shadow-md"
                    : "bg-white text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div
            key={identityTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black text-zinc-900 mb-1 flex items-center gap-3">
                    {React.createElement(
                      identityTabsArr.find((t) => t.id === identityTab)?.icon || Building,
                      { className: "w-6 h-6 text-purple-600" }
                    )}
                    سجل {identityTabsArr.find((t) => t.id === identityTab)?.label} المركزي
                  </h3>
                  <p className="text-zinc-500 font-medium">
                    سجل موحد (Single Source of Truth) مرتبط بكافة إدارات مدارج لضمان الامتثال
                    الدقيق.
                  </p>
                </div>
                <button className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-600/20">
                  <Plus className="w-5 h-5" /> إضافة سجل جديد
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/3">
                        الاسم / السجل
                      </th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/4">
                        معرف الهوية / KYC
                      </th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest w-1/4">
                        حالة الامتثال (Compliance)
                      </th>
                      <th className="py-4 px-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-left w-1/4">
                        إجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        id: 1,
                        name: "مؤسسة الرمال الذهبية",
                        kycId: "CR-1010101010",
                        kycStatus: "verified",
                        compliance: "active",
                        meta: "نشط منذ 2024",
                      },
                      {
                        id: 2,
                        name: "أحمد محمود العبدالله",
                        kycId: "NID-2019283746",
                        kycStatus: "pending",
                        compliance: "warning",
                        meta: "إقامة تنتهي قريباً",
                      },
                      {
                        id: 3,
                        name: "شركة الصناعات المتقدمة",
                        kycId: "CR-2938475610",
                        kycStatus: "verified",
                        compliance: "active",
                        meta: "مورد معتمد",
                      },
                      {
                        id: 4,
                        name: "سارة خالد الدوسري",
                        kycId: "NID-1029384756",
                        kycStatus: "rejected",
                        compliance: "danger",
                        meta: "وثائق مرفوضة",
                      },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors"
                      >
                        <td className="py-4 px-4">
                          <p className="font-bold text-zinc-900">{row.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{row.meta}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-mono text-sm font-bold text-zinc-700">{row.kycId}</p>
                          {row.kycStatus === "verified" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 border border-emerald-100">
                              <ShieldCheck className="w-3 h-3" /> تم التحقق (Yaqeen)
                            </span>
                          )}
                          {row.kycStatus === "pending" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-100">
                              <Clock className="w-3 h-3" /> قيد المراجعة
                            </span>
                          )}
                          {row.kycStatus === "rejected" && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full mt-1 border border-rose-100">
                              <XCircle className="w-3 h-3" /> مراجعته مطلوبة
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {row.compliance === "active" && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                              <span className="text-xs font-bold text-emerald-700">
                                متوافق (100%)
                              </span>
                            </div>
                          )}
                          {row.compliance === "warning" && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                              <span className="text-xs font-bold text-amber-700">تنويه امتثال</span>
                            </div>
                          )}
                          {row.compliance === "danger" && (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-rose-500 translate-y-[-1px] animate-pulse"></div>
                              <span className="text-xs font-bold text-rose-700">
                                حظر مؤقت (معلق)
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-left">
                          <button className="text-xs font-bold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition-colors border border-purple-100">
                            عرض السجل (360°)
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 shadow-sm">
                <h4 className="text-lg font-black text-zinc-900 mb-4">
                  التحقق الآلي ومطابقة الهويات
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">ربط مقيم ويقين (Yaqeen API)</p>
                      <p className="text-xs text-zinc-500">
                        مزامنة حية لبيانات الإقامات والهويات الوطنية.
                      </p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200 flex gap-1.5 items-center">
                      <Zap className="w-3.5 h-3.5 fill-current" /> متصل الآﻥ
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                    <div>
                      <p className="text-sm font-bold text-zinc-900">ربط وزارة التجارة (Wathiq)</p>
                      <p className="text-xs text-zinc-500">
                        التحقق اللحظي من السجلات والمنشآت التجارية.
                      </p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full border border-emerald-200 flex gap-1.5 items-center">
                      <Zap className="w-3.5 h-3.5 fill-current" /> متصل الآﻥ
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-900 border border-purple-800 rounded-[2.5rem] p-8 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-600/30 rounded-full blur-3xl"></div>
                <h4 className="text-lg font-black mb-1 relative z-10">
                  إدارة صلاحيات الوصول والدخول
                </h4>
                <p className="text-purple-200 text-sm mb-6 relative z-10 w-4/5">
                  نظام التحكم بالمناصب (RBAC) يعتمد على السجل المركزي مباشرة.
                </p>
                <button className="bg-white text-purple-900 w-full rounded-2xl py-3 font-bold text-sm shadow-xl shadow-black/10 relative z-10 border-b-4 border-purple-100 active:border-b-0 active:translate-y-1 transition-all">
                  تكوين الصلاحيات وهيكلة الحوكمة
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function PipelineCard({ client, provided, snapshot, onClick, onStatusChange }: any) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={(e) => onClick(e)}
      className={cn(
        "bg-white p-5 rounded-[2rem] border shadow-sm hover:shadow-xl hover:border-zinc-300 transition-all group cursor-pointer relative flex flex-col",
        snapshot.isDragging
          ? "shadow-2xl border-zinc-300 scale-105 z-50 ring-4 ring-primary/10"
          : "border-zinc-100"
      )}
      style={{ ...provided.draggableProps.style }}
    >
      <div className="flex justify-between items-start mb-4">
        <span className="text-[10px] font-black text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-full">
          {(client.value || 0).toLocaleString()} ر.س
        </span>
        <div className="flex items-center gap-2">
          {client.expectedCloseDate && (
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {client.expectedCloseDate}
            </span>
          )}
          <div className="flex -space-x-2 -space-x-reverse">
            {client.branding?.logo ? (
              <img
                src={client.branding.logo}
                className="w-7 h-7 rounded-full border-2 border-white ring-2 ring-zinc-50"
                alt="Logo"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-7 h-7 bg-zinc-100 rounded-full border-2 border-white ring-2 ring-zinc-50 flex items-center justify-center text-[8px] font-bold">
                {client.name[0]}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 mb-1">
        <h4 className="font-black text-zinc-900 text-sm">{client.name}</h4>
        {client.leadScore && (
          <span
            className={cn(
              "text-[9px] font-black px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 shadow-sm",
              client.leadScore === "Hot"
                ? "bg-orange-50 text-orange-600 border-orange-100"
                : client.leadScore === "Warm"
                  ? "bg-yellow-50 text-yellow-600 border-yellow-100"
                  : "bg-blue-50 text-blue-600 border-blue-100"
            )}
          >
            <Zap
              className={cn(
                "w-2.5 h-2.5",
                client.leadScore === "Hot"
                  ? "text-orange-500 animate-pulse"
                  : client.leadScore === "Warm"
                    ? "text-amber-500"
                    : "text-blue-500"
              )}
            />
            {client.leadScore === "Hot" ? "ساخن" : client.leadScore === "Warm" ? "دافئ" : "بارد"}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {client.contactJobTitle && (
          <p className="text-[11px] text-zinc-500 font-bold flex items-center gap-1.5 capitalize mt-1 border-b border-zinc-50 pb-1.5">
            <IdCard className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{client.contactJobTitle}</span>
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <p className="text-[11px] text-zinc-400 font-bold flex items-center gap-1.5 capitalize tracking-tight shrink-0">
            <Briefcase className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[100px]">{client.company}</span>
          </p>
          {client.industry && (
            <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded shrink-0">
              {client.industry}
            </span>
          )}
          {client.companySize && (
            <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded shrink-0">
              {client.companySize} موظف
            </span>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{client.phone}</span>
        </p>

        {(client.contractEndDate ||
          client.projectCode ||
          client.complianceRisk ||
          client.conversionProbability) && (
          <div className="flex flex-wrap gap-2 mt-1 border-t border-zinc-50 pt-1.5">
            {client.projectCode && (
              <span className="text-[9px] font-black bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Hash className="w-2.5 h-2.5" />
                {client.projectCode}
              </span>
            )}
            {client.contractEndDate && (
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Calendar className="w-2.5 h-2.5" />
                ينتهي: {client.contractEndDate}
              </span>
            )}
            {client.conversionProbability !== undefined && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                <ArrowUpDown className="w-2.5 h-2.5" />
                تحويل: %{client.conversionProbability}
              </span>
            )}
            {client.complianceRisk && (
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1",
                  client.complianceRisk === "low"
                    ? "bg-emerald-50 text-emerald-600"
                    : client.complianceRisk === "medium"
                      ? "bg-amber-50 text-amber-600"
                      : client.complianceRisk === "high"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-red-100 text-red-700"
                )}
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                مخاطر:{" "}
                {client.complianceRisk === "low"
                  ? "منخفضة"
                  : client.complianceRisk === "medium"
                    ? "متوسطة"
                    : client.complianceRisk === "high"
                      ? "مرتفعة"
                      : "حرجة"}
              </span>
            )}
          </div>
        )}

        {client.notes && (
          <div
            className="mt-2 bg-yellow-50/50 border border-yellow-100/50 rounded-xl p-3"
            onClick={(e) => {
              e.stopPropagation();
              setNotesExpanded(!notesExpanded);
            }}
          >
            <div className="flex items-center justify-between cursor-pointer">
              <span className="text-[10px] font-bold text-yellow-800 flex items-center gap-1.5">
                <StickyNote className="w-3 h-3 text-yellow-600" />
                ملاحظات
              </span>
              <div className="p-1 rounded hover:bg-yellow-100/50 transition-colors">
                <motion.div
                  animate={{ rotate: notesExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-3 h-3 text-yellow-600" />
                </motion.div>
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{
                height: notesExpanded ? "auto" : "2.5rem",
                opacity: 1,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden mt-2"
            >
              <p
                className={cn(
                  "text-[10px] text-yellow-900 font-medium leading-relaxed transition-all",
                  !notesExpanded && "line-clamp-2"
                )}
              >
                {client.notes}
              </p>
            </motion.div>

            {!notesExpanded && client.notes.length > 50 && (
              <span className="text-[8px] font-black text-yellow-600/50 uppercase tracking-tighter mt-1 block">
                Click to read more...
              </span>
            )}
          </div>
        )}

        {client.leadScoreReason && (
          <div
            className={cn(
              "mt-2 border rounded-xl p-3 text-[10px] leading-relaxed font-semibold text-right",
              client.leadScore === "Hot"
                ? "bg-orange-50/40 border-orange-100 text-orange-950"
                : client.leadScore === "Warm"
                  ? "bg-yellow-50/40 border-yellow-100 text-yellow-950"
                  : "bg-blue-50/40 border-blue-100 text-blue-950"
            )}
          >
            <div className="flex items-center gap-1 mb-1 text-[9px] font-black justify-start">
              <Zap
                className={cn(
                  "w-3 h-3 shrink-0",
                  client.leadScore === "Hot"
                    ? "text-orange-500"
                    : client.leadScore === "Warm"
                      ? "text-amber-500"
                      : "text-blue-500"
                )}
              />
              <span>توجيه المبيعات بالذكاء الاصطناعي:</span>
            </div>
            <p className="opacity-90">{client.leadScoreReason}</p>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mt-5 pt-5 border-t border-zinc-50">
        <div className="flex gap-2 items-center">
          {client.vatId && (
            <span className="text-[8px] font-black text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
              VAT: {client.vatId}
            </span>
          )}
          <select
            value={client.status}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              onStatusChange(client.id, e.target.value);
            }}
            className="text-[9px] font-black bg-zinc-50 border-none rounded px-2 py-1 focus:ring-0 cursor-pointer"
          >
            <option value="new">جديد</option>
            <option value="contacted">قيد التواصل</option>
            <option value="contracted">تم التعاقد</option>
            <option value="won">ربح</option>
            <option value="lost">خسارة</option>
          </select>
        </div>

        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="opacity-0 group-hover:opacity-100 p-2 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900 rounded-xl transition-all"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showOptions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute left-0 bottom-full mb-2 bg-white border border-zinc-100 shadow-xl rounded-xl w-36 z-50 p-1 origin-bottom-left"
              >
                <button
                  onClick={(e) => {
                    setShowOptions(false);
                    onClick(e);
                  }}
                  className="w-full text-right px-3 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-50 flex items-center gap-2 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-zinc-400" /> تعديل وتفاصيل
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
