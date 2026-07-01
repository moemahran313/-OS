import React, { useState, useEffect, useMemo } from "react";
import {
  Warehouse,
  Plus,
  ArrowRightLeft,
  Layers,
  Package,
  Search,
  Filter,
  Trash2,
  FileText,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  CornerDownLeft,
  ClipboardList,
  Info,
  Landmark,
  ShieldAlert,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
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
  writeBatch,
} from "firebase/firestore";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { cn } from "../lib/utils";

// Subcomponents
import DashboardOverview from "../components/inventory/DashboardOverview";
import ProductsModule from "../components/inventory/ProductsModule";
import StocksAndLots from "../components/inventory/StocksAndLots";
import OperationsAndTransfers from "../components/inventory/OperationsAndTransfers";
import ReceivingFulfillment from "../components/inventory/ReceivingFulfillment";
import AdvancedReports from "../components/inventory/AdvancedReports";

// Standard Accounts for Warehouses
const WAREHOUSE_CODES = ["110301", "110302", "110303", "110304", "110305"];

interface WarehouseDoc {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  location: string;
  accountCode: string; // Linked asset account
  accountId?: string; // chart_of_accounts doc ID
  authorUid: string;
}

interface InventoryItem {
  id: string;
  nameAr: string;
  nameEn: string;
  sku: string;
  type: "raw" | "assembly";
  costPriceHalalas: number;
  salePriceHalalas: number;
  warehouseQuantities: Record<string, number>; // warehouseId -> stock
  bomComponents?: { itemId: string; quantity: number }[]; // components for assembled items
  authorUid: string;

  // Advanced added fields
  barcode?: string;
  category?: string;
  brand?: string;
  unit?: string;
  weight?: string;
  dimensions?: string;
  supplier?: string;
  status?: string;
  binLocation?: string;
  minStock?: number;
  maxStock?: number;
  safetyStock?: number;
  leadTimeDays?: number;
  tags?: string[];
  images?: string[];
  variants?: any[];
}

export default function InventoryDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "stocks" | "operations" | "fulfillment" | "reports" | "warehouses"
  >("overview");

  // Collections state
  const [warehouses, setWarehouses] = useState<WarehouseDoc[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [assemblies, setAssemblies] = useState<any[]>([]);
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals States
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // New Warehouse Form State
  const [newWhNameAr, setNewWhNameAr] = useState("");
  const [newWhNameEn, setNewWhNameEn] = useState("");
  const [newWhCode, setNewWhCode] = useState("");
  const [newWhLocation, setNewWhLocation] = useState("");

  // Sync data with Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const qWh = query(collection(db, "warehouses"), where("authorUid", "==", user.uid));
    const unsubWh = onSnapshot(qWh, (snap) => {
      setWarehouses(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as WarehouseDoc));
    });

    const qItems = query(collection(db, "inventory_items"), where("authorUid", "==", user.uid));
    const unsubItems = onSnapshot(qItems, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as InventoryItem));
    });

    const qTransfers = query(
      collection(db, "inventory_transfers"),
      where("authorUid", "==", user.uid)
    );
    const unsubTransfers = onSnapshot(qTransfers, (snap) => {
      const sorted = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransfers(sorted);
    });

    const qAssemblies = query(
      collection(db, "assembly_orders"),
      where("authorUid", "==", user.uid)
    );
    const unsubAssemblies = onSnapshot(qAssemblies, (snap) => {
      const sorted = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAssemblies(sorted);
    });

    const qAdjustments = query(
      collection(db, "stock_adjustments"),
      where("authorUid", "==", user.uid)
    );
    const unsubAdjustments = onSnapshot(qAdjustments, (snap) => {
      const sorted = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as any[];
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAdjustments(sorted);
    });

    const qAccounts = query(
      collection(db, "chart_of_accounts"),
      where("authorUid", "==", user.uid)
    );
    const unsubAccounts = onSnapshot(qAccounts, (snap) => {
      setAccounts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubWh();
      unsubItems();
      unsubTransfers();
      unsubAssemblies();
      unsubAdjustments();
      unsubAccounts();
    };
  }, [user]);

  // Map account codes to IDs for manual lookup
  const accountIdMap = useMemo(() => {
    const m: Record<string, string> = {};
    accounts.forEach((acc) => {
      m[acc.accountCode] = acc.id;
    });
    return m;
  }, [accounts]);

  // Bootstrap Demo Data Helper
  const bootstrapDemoData = async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const batch = writeBatch(db);

      // 1. Bootstrap standard warehouses
      const whsDemo = [
        {
          nameAr: "المستودع الرئيسي - الرياض",
          nameEn: "Main Riyadh Warehouse",
          code: "MW-01",
          location: "الرياض - السلي",
          accountCode: "110301",
        },
        {
          nameAr: "مستودع فرع المنطقة الغربية",
          nameEn: "Western Branch Warehouse",
          code: "WW-02",
          location: "جدة - حي الأندلس",
          accountCode: "110302",
        },
        {
          nameAr: "مستودع المنطقة الشرقية",
          nameEn: "Eastern Branch Warehouse",
          code: "EW-03",
          location: "الدمام - المدينة الصناعية",
          accountCode: "110303",
        },
      ];

      const createdWhs: any[] = [];
      whsDemo.forEach((wh) => {
        const whRef = doc(collection(db, "warehouses"));
        batch.set(whRef, {
          nameAr: wh.nameAr,
          nameEn: wh.nameEn,
          code: wh.code,
          location: wh.location,
          accountCode: wh.accountCode,
          authorUid: user.uid,
          createdAt: serverTimestamp(),
        });
        createdWhs.push({ id: whRef.id, ...wh });
      });

      // 2. Add Corresponding Chart of Accounts if not exist
      whsDemo.forEach((wh) => {
        if (!accountIdMap[wh.accountCode]) {
          const accRef = doc(collection(db, "chart_of_accounts"));
          batch.set(accRef, {
            accountCode: wh.accountCode,
            nameAr: `مخزون - ${wh.nameAr}`,
            nameEn: `Inventory - ${wh.nameEn}`,
            type: "Asset",
            balanceHalalas: 25000000, // starting with 250,000 SAR demo inventory value
            authorUid: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      });

      // 3. Create raw materials and assembly items
      const raw1Ref = doc(collection(db, "inventory_items"));
      const raw2Ref = doc(collection(db, "inventory_items"));
      const raw3Ref = doc(collection(db, "inventory_items"));
      const asm1Ref = doc(collection(db, "inventory_items"));

      // Quantities per warehouse: Main has stock, others less
      const mainWhId = createdWhs[0].id;
      const westWhId = createdWhs[1].id;
      const eastWhId = createdWhs[2].id;

      batch.set(raw1Ref, {
        nameAr: "طاولة مكتبية خشبية فاخرة",
        nameEn: "Premium Wooden Office Table",
        sku: "TAB-101",
        type: "raw",
        costPriceHalalas: 25000, // 250 SAR
        salePriceHalalas: 45000,
        warehouseQuantities: { [mainWhId]: 120, [westWhId]: 15, [eastWhId]: 8 },
        barcode: "628110001011",
        category: "أثاث مكتبي",
        brand: "تكنو كرافت",
        unit: "قطعة",
        status: "Active",
        supplier: "مجموعة الرياض للتأثيث",
        binLocation: "A-04-12",
        minStock: 20,
        maxStock: 500,
        safetyStock: 10,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      batch.set(raw2Ref, {
        nameAr: "كرسي مكتب طبي مريح",
        nameEn: "Ergonomic Orthopedic Office Chair",
        sku: "CHR-202",
        type: "raw",
        costPriceHalalas: 12000, // 120 SAR
        salePriceHalalas: 22000,
        warehouseQuantities: { [mainWhId]: 250, [westWhId]: 30, [eastWhId]: 12 },
        barcode: "628110001022",
        category: "أثاث مكتبي",
        brand: "أورثوبيديك بلس",
        unit: "قطعة",
        status: "Active",
        supplier: "مجموعة الرياض للتأثيث",
        binLocation: "B-02-04",
        minStock: 30,
        maxStock: 600,
        safetyStock: 15,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      batch.set(raw3Ref, {
        nameAr: "مسامير تثبيت ومفاصل حديدية",
        nameEn: "Screws & Iron Joints Kit",
        sku: "SCR-303",
        type: "raw",
        costPriceHalalas: 500, // 5 SAR
        salePriceHalalas: 1000,
        warehouseQuantities: { [mainWhId]: 800, [westWhId]: 100, [eastWhId]: 50 },
        barcode: "628110001033",
        category: "مثبتات ومواد إنتاج",
        brand: "سعودي بولت",
        unit: "علبة",
        status: "Active",
        supplier: "مجموعة الرياض للتأثيث",
        binLocation: "C-01-08",
        minStock: 100,
        maxStock: 2000,
        safetyStock: 50,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // Assembled Product (Complete Office Bundle)
      batch.set(asm1Ref, {
        nameAr: "حزمة مكتبية متكاملة (طاولة + كرسيين)",
        nameEn: "Complete Workspace Bundle",
        sku: "BND-505",
        type: "assembly",
        costPriceHalalas: 51000, // Calculated dynamically: 1*250 + 2*120 + 4*5 = 510 SAR
        salePriceHalalas: 95000,
        warehouseQuantities: { [mainWhId]: 5, [westWhId]: 2, [eastWhId]: 0 },
        barcode: "628110001055",
        category: "باقات متكاملة",
        brand: "تكنو كرافت",
        unit: "حزمة",
        status: "Active",
        supplier: "تصنيع داخلي",
        bomComponents: [
          { itemId: raw1Ref.id, quantity: 1 },
          { itemId: raw2Ref.id, quantity: 2 },
          { itemId: raw3Ref.id, quantity: 4 },
        ],
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success("تم تأسيس وتهيئة نظام المستودعات والمخزون الافتراضي بنجاح! 📦🇸🇦");
    } catch (err: any) {
      console.error(err);
      toast.error("حدث خطأ أثناء تهيئة البيانات: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 1. CREATE WAREHOUSE
  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!newWhNameAr || !newWhNameEn || !newWhCode) {
      toast.error("يرجى ملء كافة الحقول الأساسية للمستودع");
      return;
    }

    setSubmitting(true);
    try {
      const nextIndex = warehouses.length;
      const accountCode = WAREHOUSE_CODES[nextIndex % WAREHOUSE_CODES.length];

      // Auto create the Asset account in Chart of Accounts
      const accRef = await addDoc(collection(db, "chart_of_accounts"), {
        accountCode,
        nameAr: `مخزون - ${newWhNameAr}`,
        nameEn: `Inventory - ${newWhNameEn}`,
        type: "Asset",
        balanceHalalas: 0,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // Add Warehouse
      await addDoc(collection(db, "warehouses"), {
        nameAr: newWhNameAr,
        nameEn: newWhNameEn,
        code: newWhCode,
        location: newWhLocation,
        accountCode,
        accountId: accRef.id,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      // Audit Log
      await addDoc(collection(db, "audit_logs"), {
        action: `إنشاء مستودع جديد: ${newWhNameAr}`,
        actionEn: `Warehouse Created: ${newWhNameEn}`,
        targetType: "مستودع",
        targetId: newWhCode,
        riskLevel: "Low",
        user: user.email || "system@madarij.com",
        ipAddress: "192.168.1.102",
        timestamp: new Date().toISOString(),
        details: { nameAr: newWhNameAr, code: newWhCode, accountCode },
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });

      toast.success("تم إنشاء المستودع وتأسيس حسابه المالي تلقائياً بنجاح 🏛️");
      setShowAddWarehouse(false);
      setNewWhNameAr("");
      setNewWhNameEn("");
      setNewWhCode("");
      setNewWhLocation("");
    } catch (err: any) {
      toast.error("فشل إنشاء المستودع: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 2. PRODUCT SAVE WRAPPERS FOR NEW COMPLEX MODULAR FORMS
  const handleAddProductWrapper = async (prodData: any) => {
    if (!user) return;

    // Auto-create initial quantities map if not present
    const quantitiesMap: Record<string, number> = {};
    warehouses.forEach((w) => {
      quantitiesMap[w.id] = 0;
    });

    const docRef = await addDoc(collection(db, "inventory_items"), {
      ...prodData,
      warehouseQuantities: prodData.warehouseQuantities || quantitiesMap,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    // Save audit log
    await addDoc(collection(db, "audit_logs"), {
      action: `إضافة منتج جديد لدليل المواد: ${prodData.nameAr}`,
      actionEn: `Product Added: ${prodData.nameEn}`,
      targetType: "دليل المواد",
      targetId: prodData.sku,
      riskLevel: "Low",
      user: user.email || "system@madarij.com",
      ipAddress: "192.168.10.5",
      timestamp: new Date().toISOString(),
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    return docRef;
  };

  const handleUpdateProductWrapper = async (id: string, prodData: any) => {
    if (!user) return;
    const itemRef = doc(db, "inventory_items", id);
    await updateDoc(itemRef, prodData);
  };

  const handleDeleteItem = async (col: string, id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف الصنف (${name}) نهائياً من قاعدة البيانات؟`)) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, col, id));

      // Save audit log
      const auditRef = doc(collection(db, "audit_logs"));
      batch.set(auditRef, {
        action: `حذف صنف من النظام: حذف صنف مخزني (${name})`,
        actionEn: `Deleted inventory item (${name})`,
        targetType: "مخازن ومواد",
        targetId: id,
        riskLevel: "High",
        user: user?.email || "system@madarij.com",
        ipAddress: "185.190.140.32",
        timestamp: new Date().toISOString(),
        details: { id, col, name },
        authorUid: user?.uid,
        createdAt: serverTimestamp(),
      });

      await batch.commit();
      toast.success(`تم حذف الصنف بنجاح من المستندات`);
    } catch (err: any) {
      toast.error("فشل الحذف: " + err.message);
    }
  };

  // 3. WAREHOUSE OPERATIONS & TRANSFERS WRAPPERS
  const handleAddTransferWrapper = async (transferData: any) => {
    if (!user) return;

    const sourceWh = warehouses.find((w) => w.id === transferData.sourceWarehouseId)!;
    const destWh = warehouses.find((w) => w.id === transferData.destWarehouseId)!;
    const sourceAccId = accountIdMap[sourceWh.accountCode];
    const destAccId = accountIdMap[destWh.accountCode];

    if (!sourceAccId || !destAccId) {
      throw new Error("تعذر إيجاد الربط المحاسبي لأحد المستودعات. يرجى تهيئته أولاً.");
    }

    const entryNumber = `JV-TRANSFER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const descAr = `قيد تحويل بضائع تلقائي من مستودع ${sourceWh.nameAr} إلى مستودع ${destWh.nameAr}`;
    const descEn = `Auto inventory transfer from ${sourceWh.nameEn} to ${destWh.nameEn}`;

    // Add ZATCA-compliant balanced accounting journal entry
    const journalRef = await addDoc(collection(db, "journal_entries"), {
      entryNumber,
      date: new Date().toISOString().split("T")[0],
      descriptionAr: descAr,
      descriptionEn: descEn,
      lines: [
        {
          accountId: destAccId,
          debitHalalas: transferData.totalCostHalalas,
          creditHalalas: 0,
          costCenter: destWh.nameAr,
        },
        {
          accountId: sourceAccId,
          debitHalalas: 0,
          creditHalalas: transferData.totalCostHalalas,
          costCenter: sourceWh.nameAr,
        },
      ],
      isBalanced: true,
      sourceDoc: `Transfer Note ${entryNumber}`,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    const docRef = await addDoc(collection(db, "inventory_transfers"), {
      ...transferData,
      transferNumber: entryNumber,
      journalEntryId: journalRef.id,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    // Save audit log
    await addDoc(collection(db, "audit_logs"), {
      action: `تحويل مخزني بيني: ${descAr}`,
      actionEn: `Warehouse Transfer: ${descEn}`,
      targetType: "تحويل مخزني",
      targetId: entryNumber,
      riskLevel: "Medium",
      user: user.email || "system@madarij.com",
      ipAddress: "192.168.10.22",
      timestamp: new Date().toISOString(),
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    return docRef;
  };

  const handleAddAdjustmentWrapper = async (adjustmentData: any) => {
    if (!user) return;

    const wh = warehouses.find((w) => w.id === adjustmentData.warehouseId)!;
    const whAccId = accountIdMap[wh.accountCode];

    if (!whAccId) {
      throw new Error(`تعذر إيجاد الربط المالي للمستودع ${wh.nameAr}`);
    }

    // Shortage/Surplus financial setup
    let shortageAccId = accountIdMap["510501"];
    let surplusAccId = accountIdMap["410301"];

    const batch = writeBatch(db);

    if (adjustmentData.totalImpactHalalas < 0 && !shortageAccId) {
      const accRef = doc(collection(db, "chart_of_accounts"));
      batch.set(accRef, {
        accountCode: "510501",
        nameAr: "مصاريف عجز جرد المخزون",
        nameEn: "Inventory Shortage Expenses",
        type: "Expense",
        balanceHalalas: 0,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });
      shortageAccId = accRef.id;
    }

    if (adjustmentData.totalImpactHalalas > 0 && !surplusAccId) {
      const accRef = doc(collection(db, "chart_of_accounts"));
      batch.set(accRef, {
        accountCode: "410301",
        nameAr: "إيرادات فائض الجرد",
        nameEn: "Inventory Surplus Revenues",
        type: "Revenue",
        balanceHalalas: 0,
        authorUid: user.uid,
        createdAt: serverTimestamp(),
      });
      surplusAccId = accRef.id;
    }

    const entryNumber = `ADJ-${Math.floor(1000 + Math.random() * 9000)}`;
    const descAr = `قيد تسوية فروقات جرد مخزني تلقائي لـ ${wh.nameAr} - السبب: ${adjustmentData.reason}`;
    const descEn = `Auto stock reconciliation for ${wh.nameEn} - Reason: ${adjustmentData.reason}`;

    const lines: any[] = [];
    const absoluteImpact = Math.abs(adjustmentData.totalImpactHalalas);

    if (adjustmentData.totalImpactHalalas < 0) {
      // Shortage: Debit expense, Credit asset
      lines.push({
        accountId: shortageAccId || "510501",
        debitHalalas: absoluteImpact,
        creditHalalas: 0,
        costCenter: wh.nameAr,
      });
      lines.push({
        accountId: whAccId,
        debitHalalas: 0,
        creditHalalas: absoluteImpact,
        costCenter: wh.nameAr,
      });
    } else {
      // Surplus: Debit asset, Credit revenue
      lines.push({
        accountId: whAccId,
        debitHalalas: absoluteImpact,
        creditHalalas: 0,
        costCenter: wh.nameAr,
      });
      lines.push({
        accountId: surplusAccId || "410301",
        debitHalalas: 0,
        creditHalalas: absoluteImpact,
        costCenter: wh.nameAr,
      });
    }

    // Post journal entry doc
    const journalRef = doc(collection(db, "journal_entries"));
    batch.set(journalRef, {
      entryNumber,
      date: new Date().toISOString().split("T")[0],
      descriptionAr: descAr,
      descriptionEn: descEn,
      lines,
      isBalanced: true,
      sourceDoc: `Adjustment ${entryNumber}`,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    const adjRef = doc(collection(db, "stock_adjustments"));
    batch.set(adjRef, {
      ...adjustmentData,
      adjustmentNumber: entryNumber,
      journalEntryId: journalRef.id,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    // Save audit log
    const auditRef = doc(collection(db, "audit_logs"));
    batch.set(auditRef, {
      action: `تسوية تسوية جردية: ${descAr}`,
      actionEn: `Stock Adjustment: ${descEn}`,
      targetType: "تسوية المخزون",
      targetId: entryNumber,
      riskLevel: "High",
      user: user.email || "system@madarij.com",
      ipAddress: "192.168.1.105",
      timestamp: new Date().toISOString(),
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    await batch.commit();
    return adjRef;
  };

  // 4. BOM ASSEMBLIES WRAPPER
  const handleAddAssemblyWrapper = async (assemblyData: any) => {
    if (!user) return;

    const wh = warehouses.find((w) => w.id === assemblyData.warehouseId)!;
    const whAccId = accountIdMap[wh.accountCode];

    if (!whAccId) {
      throw new Error("تعذر إيجاد الربط المحاسبي للمستودع.");
    }

    const entryNumber = `JV-ASM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const descAr = `قيد تجميع إنتاجي تلقائي: إنتاج ${assemblyData.quantity} من صنف [${assemblyData.finishedItemNameAr}] في مستودع ${wh.nameAr}`;
    const descEn = `Auto product assembly: Produced ${assemblyData.quantity} of finished goods in warehouse ${wh.nameEn}`;

    // Debit and Credit the warehouse asset account since it transforms Raw Materials to Finished Goods within the same warehouse asset bucket
    const journalRef = await addDoc(collection(db, "journal_entries"), {
      entryNumber,
      date: new Date().toISOString().split("T")[0],
      descriptionAr: descAr,
      descriptionEn: descEn,
      lines: [
        {
          accountId: whAccId,
          debitHalalas: assemblyData.totalCostHalalas,
          creditHalalas: 0,
          costCenter: wh.nameAr,
        },
        {
          accountId: whAccId,
          debitHalalas: 0,
          creditHalalas: assemblyData.totalCostHalalas,
          costCenter: wh.nameAr,
        },
      ],
      isBalanced: true,
      sourceDoc: `Assembly Order ${entryNumber}`,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, "assembly_orders"), {
      ...assemblyData,
      assemblyNumber: entryNumber,
      journalEntryId: journalRef.id,
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });

    // Save audit log
    await addDoc(collection(db, "audit_logs"), {
      action: `أمر تصنيع وتجميع: ${descAr}`,
      actionEn: `Manufacturing Assembly Order: ${descEn}`,
      targetType: "تجميع المنتجات",
      targetId: entryNumber,
      riskLevel: "Medium",
      user: user.email || "system@madarij.com",
      ipAddress: "192.168.1.102",
      timestamp: new Date().toISOString(),
      authorUid: user.uid,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <div className="space-y-6 pb-12 font-sans text-zinc-900" dir="rtl">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-indigo-600" />
            إدارة المنتجات والمخزون المتعدد • Madarij OS
          </h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">
            مستودعات غير محدودة، أتمتة تجميع المواد (BOM)، باركود، ومتابعة جردية متوافقة محاسبياً مع
            معايير الهيئة السعودية للمحاسبين القانونيين (SOCPA).
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              onClick={bootstrapDemoData}
              disabled={submitting}
              className="px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-black transition-all border border-emerald-200 dark:border-emerald-900/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              تهيئة بيانات تجريبية (Auto Seed Data)
            </button>
          )}
          <button
            onClick={() => setShowAddWarehouse(true)}
            className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة مستودع
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap border-b border-zinc-200 bg-white dark:bg-zinc-900 p-2 rounded-2xl border gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "overview"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📊 لوحة التحكم والإحصائيات
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "products"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📦 كشاف المواد والباركود والماركات
        </button>
        <button
          onClick={() => setActiveTab("stocks")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "stocks"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📍 الأرصدة والرفوف وصلاحيات الـ FEFO
        </button>
        <button
          onClick={() => setActiveTab("operations")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "operations"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          🛠️ التحويل والتسوية وأوامر التجميع (BOM)
        </button>
        <button
          onClick={() => setActiveTab("fulfillment")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "fulfillment"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📥 الاستلام وتلبية شحنات المبيعات (POs & SOs)
        </button>
        <button
          onClick={() => setActiveTab("reports")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "reports"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📈 تحليل دوران المخزون والتقارير المالية
        </button>
        <button
          onClick={() => setActiveTab("warehouses")}
          className={cn(
            "flex-1 md:flex-none px-4 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "warehouses"
              ? "bg-zinc-900 dark:bg-zinc-800 text-white shadow-md"
              : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          🏛️ تهيئة الفروع والمواقع المادية ({warehouses.length})
        </button>
      </div>

      {loading && (
        <div className="p-12 text-center text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          جاري مزامنة بيانات المستودعات والمخزون مع سحابة Madarij...
        </div>
      )}

      {/* Render Active Component Tab View */}
      {!loading && (
        <div className="animate-in fade-in duration-300">
          {activeTab === "overview" && (
            <DashboardOverview
              items={items}
              warehouses={warehouses}
              transfers={transfers}
              adjustments={adjustments}
              onTabChange={(tab: any) => setActiveTab(tab)}
            />
          )}

          {activeTab === "products" && (
            <ProductsModule
              items={items}
              warehouses={warehouses}
              onAddProduct={handleAddProductWrapper}
              onDeleteProduct={(id, name) => handleDeleteItem("inventory_items", id, name)}
              onUpdateProduct={handleUpdateProductWrapper}
            />
          )}

          {activeTab === "stocks" && (
            <StocksAndLots
              items={items}
              warehouses={warehouses}
              onUpdateProduct={handleUpdateProductWrapper}
            />
          )}

          {activeTab === "operations" && (
            <OperationsAndTransfers
              items={items}
              warehouses={warehouses}
              transfers={transfers}
              adjustments={adjustments}
              onAddTransfer={handleAddTransferWrapper}
              onAddAdjustment={handleAddAdjustmentWrapper}
              onUpdateProduct={handleUpdateProductWrapper}
            />
          )}

          {activeTab === "fulfillment" && (
            <ReceivingFulfillment
              items={items}
              warehouses={warehouses}
              onAddAdjustment={handleAddAdjustmentWrapper}
              onUpdateProduct={handleUpdateProductWrapper}
            />
          )}

          {activeTab === "reports" && <AdvancedReports items={items} warehouses={warehouses} />}

          {/* Simple physical warehouses config tab */}
          {activeTab === "warehouses" && (
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                    هيكلة المستودعات ومواقع التخزين
                  </h3>
                  <p className="text-xs text-zinc-400 font-bold mt-0.5">
                    تهيئة الفروع وربطها مع الحسابات المالية المقابلة لترحيل القيود أوتوماتيكياً.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddWarehouse(true)}
                  className="px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-black rounded-xl hover:bg-zinc-800 transition cursor-pointer"
                >
                  + إضافة مستودع جديد
                </button>
              </div>

              <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl overflow-hidden">
                <table className="w-full text-right text-xs table-auto">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 text-zinc-450 dark:text-zinc-400 font-bold">
                      <th className="p-4">رمز المستودع</th>
                      <th className="p-4">اسم المستودع (العربي)</th>
                      <th className="p-4">الاسم بالإنجليزية</th>
                      <th className="p-4">العنوان والمنطقة</th>
                      <th className="p-4">رمز الحساب في الدليل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {warehouses.map((wh) => (
                      <tr
                        key={wh.id}
                        className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition text-zinc-800 dark:text-zinc-300"
                      >
                        <td className="p-4 font-mono font-black text-zinc-900 dark:text-zinc-100">
                          {wh.code}
                        </td>
                        <td className="p-4 font-black">{wh.nameAr}</td>
                        <td className="p-4 font-mono text-zinc-500">{wh.nameEn}</td>
                        <td className="p-4">{wh.location || "غير محدد"}</td>
                        <td className="p-4 font-mono font-black text-indigo-600 flex items-center gap-1">
                          <Landmark className="w-3.5 h-3.5" />
                          {wh.accountCode} (مخزون السلع)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* WAREHOUSE CREATION MODAL */}
      <AnimatePresence>
        {showAddWarehouse && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-md overflow-hidden flex flex-col p-6 space-y-4"
            >
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 border-b pb-2 flex items-center gap-1.5">
                <Warehouse className="w-5 h-5 text-indigo-600" />
                تأسيس مستودع مادي جديد (New Warehouse)
              </h3>
              <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-zinc-400 mb-1">الاسم بالعربية</label>
                  <input
                    type="text"
                    required
                    value={newWhNameAr}
                    onChange={(e) => setNewWhNameAr(e.target.value)}
                    placeholder="مثال: مستودع المنطقة الوسطى"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={newWhNameEn}
                    onChange={(e) => setNewWhNameEn(e.target.value)}
                    placeholder="e.g. Central Region Warehouse"
                    className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono text-left"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">رمز الكود الموحد</label>
                    <input
                      type="text"
                      required
                      value={newWhCode}
                      onChange={(e) => setNewWhCode(e.target.value)}
                      placeholder="e.g. CR-04"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">موقع المستودع</label>
                    <input
                      type="text"
                      value={newWhLocation}
                      onChange={(e) => setNewWhLocation(e.target.value)}
                      placeholder="الرياض - الصناعية الثانية"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-xl flex gap-2">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-850 dark:text-amber-400 leading-relaxed">
                    سيقوم النظام آلياً بإنشاء حساب أصول متداول مطابق في شجرة الحسابات (دليل
                    الحسابات) تحت كود <strong>1103xx</strong> لربطه بالقوائم المالية المعتمدة فوراً.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddWarehouse(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                  >
                    تأسيس واعتماد المستودع
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
