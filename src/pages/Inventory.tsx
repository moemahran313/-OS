import React, { useState, useEffect, useMemo } from "react";
import { 
  Warehouse, Plus, ArrowRightLeft, Layers, Package, Search, Filter, 
  Trash2, FileText, CheckCircle2, TrendingUp, AlertTriangle, ArrowRight,
  Eye, CornerDownLeft, ClipboardList, Info, Landmark
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../lib/firebase";
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, doc, 
  serverTimestamp, writeBatch 
} from "firebase/firestore";
import { useUser } from "../contexts/UserContext";
import { toast } from "sonner";
import { cn } from "../lib/utils";

// Standard Accounts for Warehouses
const WAREHOUSE_CODES = ["110301", "110302", "110303", "110304", "110305"];

interface WarehouseDoc {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  location: string;
  accountCode: string; // Linked asset account
  accountId?: string;  // chart_of_accounts doc ID
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
}

interface WarehouseTransfer {
  id: string;
  transferNumber: string;
  date: string;
  sourceWarehouseId: string;
  destWarehouseId: string;
  items: {
    itemId: string;
    sku: string;
    nameAr: string;
    quantity: number;
    unitCostHalalas: number;
  }[];
  totalCostHalalas: number;
  journalEntryId?: string;
  status: "completed" | "draft";
  authorUid: string;
  createdAt: any;
}

interface AssemblyOrder {
  id: string;
  assemblyNumber: string;
  date: string;
  warehouseId: string;
  finishedItemId: string;
  finishedItemNameAr: string;
  quantity: number;
  unitCostHalalas: number;
  totalCostHalalas: number;
  journalEntryId?: string;
  authorUid: string;
  createdAt: any;
}

interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: string;
  warehouseId: string;
  warehouseNameAr: string;
  reason: string;
  items: {
    itemId: string;
    sku: string;
    nameAr: string;
    bookQuantity: number;
    actualQuantity: number;
    variance: number; // actual - book
    unitCostHalalas: number;
    totalVarianceCostHalalas: number; // variance * unitCostHalalas
  }[];
  totalImpactHalalas: number; // overall financial impact
  journalEntryId?: string;
  authorUid: string;
  createdAt: any;
}

export default function InventoryDashboard() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"overview" | "warehouses" | "products" | "transfers" | "assemblies" | "adjustments">("overview");

  // Collections state
  const [warehouses, setWarehouses] = useState<WarehouseDoc[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([]);
  const [assemblies, setAssemblies] = useState<AssemblyOrder[]>([]);
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms / Modals States
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showAssemblyModal, setShowAssemblyModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // New Warehouse Form State
  const [newWhNameAr, setNewWhNameAr] = useState("");
  const [newWhNameEn, setNewWhNameEn] = useState("");
  const [newWhCode, setNewWhCode] = useState("");
  const [newWhLocation, setNewWhLocation] = useState("");

  // New Product Form State
  const [newProdNameAr, setNewProdNameAr] = useState("");
  const [newProdNameEn, setNewProdNameEn] = useState("");
  const [newProdSku, setNewProdSku] = useState("");
  const [newProdType, setNewProdType] = useState<"raw" | "assembly">("raw");
  const [newProdCost, setNewProdCost] = useState("");
  const [newProdSale, setNewProdSale] = useState("");
  const [newProdBom, setNewProdBom] = useState<{ itemId: string; quantity: number }[]>([]);

  // Inter-Warehouse Transfer Form State
  const [txSourceWh, setTxSourceWh] = useState("");
  const [txDestWh, setTxDestWh] = useState("");
  const [txItems, setTxItems] = useState<{ itemId: string; quantity: number }[]>([
    { itemId: "", quantity: 1 }
  ]);

  // Product Assembly Form State
  const [asmWh, setAsmWh] = useState("");
  const [asmProduct, setAsmProduct] = useState("");
  const [asmQuantity, setAsmQuantity] = useState("1");

  // Stock Adjustment Form State
  const [adjWh, setAdjWh] = useState("");
  const [adjReason, setAdjReason] = useState("");
  const [adjQuantities, setAdjQuantities] = useState<Record<string, string>>({}); // itemId -> actualQty input

  // Loading indicator helper
  const [submitting, setSubmitting] = useState(false);

  // Sync data with Firestore
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const qWh = query(collection(db, "warehouses"), where("authorUid", "==", user.uid));
    const unsubWh = onSnapshot(qWh, (snap) => {
      setWarehouses(snap.docs.map(d => ({ id: d.id, ...d.data() } as WarehouseDoc)));
    });

    const qItems = query(collection(db, "inventory_items"), where("authorUid", "==", user.uid));
    const unsubItems = onSnapshot(qItems, (snap) => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() } as InventoryItem)));
    });

    const qTransfers = query(collection(db, "inventory_transfers"), where("authorUid", "==", user.uid));
    const unsubTransfers = onSnapshot(qTransfers, (snap) => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() } as WarehouseTransfer));
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransfers(sorted);
    });

    const qAssemblies = query(collection(db, "assembly_orders"), where("authorUid", "==", user.uid));
    const unsubAssemblies = onSnapshot(qAssemblies, (snap) => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() } as AssemblyOrder));
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAssemblies(sorted);
    });

    const qAdjustments = query(collection(db, "stock_adjustments"), where("authorUid", "==", user.uid));
    const unsubAdjustments = onSnapshot(qAdjustments, (snap) => {
      const sorted = snap.docs.map(d => ({ id: d.id, ...d.data() } as StockAdjustment));
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAdjustments(sorted);
    });

    const qAccounts = query(collection(db, "chart_of_accounts"), where("authorUid", "==", user.uid));
    const unsubAccounts = onSnapshot(qAccounts, (snap) => {
      setAccounts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    accounts.forEach(acc => {
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
        { nameAr: "المستودع الرئيسي", nameEn: "Main Warehouse", code: "MW-01", location: "الرياض - السلي", accountCode: "110301" },
        { nameAr: "مستودع فرع الرياض", nameEn: "Riyadh Branch Warehouse", code: "RW-02", location: "الرياض - المروج", accountCode: "110302" },
        { nameAr: "مستودع فرع جدة", nameEn: "Jeddah Warehouse", code: "JW-03", location: "جدة - حي الأندلس", accountCode: "110303" }
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
          createdAt: serverTimestamp()
        });
        createdWhs.push({ id: whRef.id, ...wh });
      });

      // 2. Add Corresponding Chart of Accounts if not exist
      whsDemo.forEach(wh => {
        if (!accountIdMap[wh.accountCode]) {
          const accRef = doc(collection(db, "chart_of_accounts"));
          batch.set(accRef, {
            accountCode: wh.accountCode,
            nameAr: `مخزون - ${wh.nameAr}`,
            nameEn: `Inventory - ${wh.nameEn}`,
            type: "Asset",
            balanceHalalas: 25000000, // starting with 250,000 SAR demo inventory value
            authorUid: user.uid,
            createdAt: serverTimestamp()
          });
        }
      });

      // 3. Create raw materials and assembly items
      const raw1Ref = doc(collection(db, "inventory_items"));
      const raw2Ref = doc(collection(db, "inventory_items"));
      const raw3Ref = doc(collection(db, "inventory_items"));
      const asm1Ref = doc(collection(db, "inventory_items"));

      // Quantities per warehouse: Main has 100, others 0
      const mainWhId = createdWhs[0].id;
      const riyadhWhId = createdWhs[1].id;
      const jeddahWhId = createdWhs[2].id;

      batch.set(raw1Ref, {
        nameAr: "طاولة مكتبية خشبية فاخرة",
        nameEn: "Premium Wooden Office Table",
        sku: "TAB-101",
        type: "raw",
        costPriceHalalas: 25000, // 250 SAR
        salePriceHalalas: 45000,
        warehouseQuantities: { [mainWhId]: 120, [riyadhWhId]: 15, [jeddahWhId]: 8 },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      batch.set(raw2Ref, {
        nameAr: "كرسي مكتب طبي مريح",
        nameEn: "Ergonomic Orthopedic Office Chair",
        sku: "CHR-202",
        type: "raw",
        costPriceHalalas: 12000, // 120 SAR
        salePriceHalalas: 22000,
        warehouseQuantities: { [mainWhId]: 250, [riyadhWhId]: 30, [jeddahWhId]: 12 },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      batch.set(raw3Ref, {
        nameAr: "مسامير تثبيت ومفاصل حديدية",
        nameEn: "Screws & Iron Joints Kit",
        sku: "SCR-303",
        type: "raw",
        costPriceHalalas: 500, // 5 SAR
        salePriceHalalas: 1000,
        warehouseQuantities: { [mainWhId]: 800, [riyadhWhId]: 100, [jeddahWhId]: 50 },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // Assembled Product (Complete Office Bundle)
      batch.set(asm1Ref, {
        nameAr: "حزمة مكتبية متكاملة (طاولة + كرسيين)",
        nameEn: "Complete Workspace Bundle",
        sku: "BND-505",
        type: "assembly",
        costPriceHalalas: 51000, // Calculated dynamically: 1*250 + 2*120 + 4*5 = 510 SAR
        salePriceHalalas: 95000,
        warehouseQuantities: { [mainWhId]: 5, [riyadhWhId]: 2, [jeddahWhId]: 0 },
        bomComponents: [
          { itemId: raw1Ref.id, quantity: 1 },
          { itemId: raw2Ref.id, quantity: 2 },
          { itemId: raw3Ref.id, quantity: 4 }
        ],
        authorUid: user.uid,
        createdAt: serverTimestamp()
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
      toast.error("يرجى ملء كافة الحقول الأساسية");
      return;
    }

    setSubmitting(true);
    try {
      const nextIndex = warehouses.length;
      const accountCode = WAREHOUSE_CODES[nextIndex % WAREHOUSE_CODES.length];

      // Auto create the Asset account
      const accRef = await addDoc(collection(db, "chart_of_accounts"), {
        accountCode,
        nameAr: `مخزون - ${newWhNameAr}`,
        nameEn: `Inventory - ${newWhNameEn}`,
        type: "Asset",
        balanceHalalas: 0,
        authorUid: user.uid,
        createdAt: serverTimestamp()
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
        createdAt: serverTimestamp()
      });

      // Audit Log
      await addDoc(collection(db, "audit_logs"), {
        action: `إنشاء مستودع جديد: ${newWhNameAr}`,
        actionEn: `Warehouse Created: ${newWhNameEn}`,
        targetType: "مستودع",
        targetId: newWhCode,
        riskLevel: "Low",
        user: user.email || "moemahran@gmail.com",
        ipAddress: "192.168.1.102",
        timestamp: new Date().toISOString(),
        details: { nameAr: newWhNameAr, code: newWhCode, accountCode },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      toast.success("تم إنشاء المستودع وتأمين حسابه المالي بنجاح 🏛️");
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

  // 2. CREATE PRODUCT (RAW OR ASSEMBLY)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!newProdNameAr || !newProdNameEn || !newProdSku) {
      toast.error("يرجى إدخال اسم المنتج ورمز الـ SKU");
      return;
    }

    setSubmitting(true);
    try {
      let costHalalas = Math.round(Number(newProdCost) * 100) || 0;
      const saleHalalas = Math.round(Number(newProdSale) * 100) || 0;

      // If it's an assembly product, calculate total cost from constituents
      if (newProdType === "assembly") {
        if (newProdBom.length === 0) {
          toast.error("يرجى إضافة مكون واحد على الأقل في قائمة المواد (BOM)");
          setSubmitting(false);
          return;
        }
        costHalalas = newProdBom.reduce((total, bomItem) => {
          const matchingItem = items.find(i => i.id === bomItem.itemId);
          return total + (matchingItem ? matchingItem.costPriceHalalas * bomItem.quantity : 0);
        }, 0);
      }

      // Prepare quantities map (initially 0 everywhere)
      const quantitiesMap: Record<string, number> = {};
      warehouses.forEach(w => {
        quantitiesMap[w.id] = 0;
      });

      await addDoc(collection(db, "inventory_items"), {
        nameAr: newProdNameAr,
        nameEn: newProdNameEn,
        sku: newProdSku,
        type: newProdType,
        costPriceHalalas: costHalalas,
        salePriceHalalas: saleHalalas,
        warehouseQuantities: quantitiesMap,
        bomComponents: newProdType === "assembly" ? newProdBom : null,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      toast.success("تم تسجيل الصنف في دليل المواد والمخزون بنجاح 📦");
      setShowAddProduct(false);
      setNewProdNameAr("");
      setNewProdNameEn("");
      setNewProdSku("");
      setNewProdType("raw");
      setNewProdCost("");
      setNewProdSale("");
      setNewProdBom([]);
    } catch (err: any) {
      toast.error("فشل إضافة المنتج: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add component to BOM builder
  const addBomComponent = (itemId: string, qty: number) => {
    if (!itemId) return;
    if (newProdBom.some(b => b.itemId === itemId)) {
      toast.error("هذا الصنف مضاف مسبقاً بالمكونات");
      return;
    }
    setNewProdBom([...newProdBom, { itemId, quantity: qty }]);
  };

  const removeBomComponent = (itemId: string) => {
    setNewProdBom(newProdBom.filter(b => b.itemId !== itemId));
  };

  // 3. WAREHOUSE TRANSFER WITH AUTO JOURNAL ENTRIES
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!txSourceWh || !txDestWh) {
      toast.error("يرجى تحديد مستودع الصادر والوارد");
      return;
    }
    if (txSourceWh === txDestWh) {
      toast.error("لا يمكن التحويل لنفس المستودع");
      return;
    }

    setSubmitting(true);
    try {
      const sourceWh = warehouses.find(w => w.id === txSourceWh)!;
      const destWh = warehouses.find(w => w.id === txDestWh)!;

      // 1. Verify available quantities and retrieve cost value
      let transferValueHalalas = 0;
      const updatedItemsToSave: { item: InventoryItem; qty: number }[] = [];
      const transferItemsList: any[] = [];

      for (const txItem of txItems) {
        if (!txItem.itemId || txItem.quantity <= 0) {
          throw new Error("يرجى التحقق من الأصناف المحددة للتحويل والكمية");
        }

        const dbItem = items.find(i => i.id === txItem.itemId);
        if (!dbItem) throw new Error("تعذر العثور على الصنف في دليل المواد");

        const availableQty = dbItem.warehouseQuantities[txSourceWh] || 0;
        if (availableQty < txItem.quantity) {
          throw new Error(`رصيد المخزون غير كافٍ للصنف ${dbItem.nameAr}. المتوفر: ${availableQty}`);
        }

        transferValueHalalas += dbItem.costPriceHalalas * txItem.quantity;

        // Prepare updated item
        const nextSourceQty = availableQty - txItem.quantity;
        const nextDestQty = (dbItem.warehouseQuantities[txDestWh] || 0) + txItem.quantity;

        const updatedQuantities = {
          ...dbItem.warehouseQuantities,
          [txSourceWh]: nextSourceQty,
          [txDestWh]: nextDestQty
        };

        updatedItemsToSave.push({
          item: { ...dbItem, warehouseQuantities: updatedQuantities },
          qty: txItem.quantity
        });

        transferItemsList.push({
          itemId: dbItem.id,
          sku: dbItem.sku,
          nameAr: dbItem.nameAr,
          quantity: txItem.quantity,
          unitCostHalalas: dbItem.costPriceHalalas
        });
      }

      // 2. Add automatic balanced journal entry
      // Debit: Destination Warehouse Asset Inventory Account
      // Credit: Source Warehouse Asset Inventory Account
      const sourceAccId = accountIdMap[sourceWh.accountCode];
      const destAccId = accountIdMap[destWh.accountCode];

      if (!sourceAccId || !destAccId) {
        throw new Error("لم يتم العثور على الدليل المحاسبي لأحد المستودعات. يرجى تهيئتهم أولاً.");
      }

      const entryNumber = `JV-TRANSFER-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const descAr = `قيد تحويل بضائع تلقائي من مستودع ${sourceWh.nameAr} إلى مستودع ${destWh.nameAr}`;
      const descEn = `Auto inventory transfer from ${sourceWh.nameEn} to ${destWh.nameEn}`;

      const journalRef = await addDoc(collection(db, "journal_entries"), {
        entryNumber,
        date: new Date().toISOString().split("T")[0],
        descriptionAr: descAr,
        descriptionEn: descEn,
        lines: [
          { accountId: destAccId, debitHalalas: transferValueHalalas, creditHalalas: 0, costCenter: destWh.nameAr },
          { accountId: sourceAccId, debitHalalas: 0, creditHalalas: transferValueHalalas, costCenter: sourceWh.nameAr }
        ],
        isBalanced: true,
        sourceDoc: `Transfer Note ${entryNumber}`,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // Update balances in local chart of accounts (or let LedgerView recalculate, but let's update firestore balances directly if possible)
      // Since balances are computed dynamically in trial balance / ledger, adding the journal entry is sufficient and compliant!

      // 3. Update stock levels in firestore
      const batch = writeBatch(db);
      updatedItemsToSave.forEach(({ item }) => {
        const itemRef = doc(db, "inventory_items", item.id);
        batch.update(itemRef, { warehouseQuantities: item.warehouseQuantities });
      });

      // 4. Save transfer record
      const transferRef = doc(collection(db, "inventory_transfers"));
      batch.set(transferRef, {
        transferNumber: entryNumber,
        date: new Date().toISOString().split("T")[0],
        sourceWarehouseId: txSourceWh,
        destWarehouseId: txDestWh,
        items: transferItemsList,
        totalCostHalalas: transferValueHalalas,
        journalEntryId: journalRef.id,
        status: "completed",
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // 5. Save audit log
      const auditRef = doc(collection(db, "audit_logs"));
      batch.set(auditRef, {
        action: `تحويل مخزني: ${descAr}`,
        actionEn: `Warehouse Transfer: ${descEn}`,
        targetType: "تحويل مخزني",
        targetId: entryNumber,
        riskLevel: "Medium",
        user: user.email || "moemahran@gmail.com",
        ipAddress: "192.168.10.45",
        timestamp: new Date().toISOString(),
        details: { transferNumber: entryNumber, totalCostHalalas: transferValueHalalas, itemsCount: txItems.length },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("تمت عملية التحويل بنجاح، وتم ترحيل القيد المحاسبي التلقائي! 🚛🏛️");
      setShowTransferModal(false);
      setTxSourceWh("");
      setTxDestWh("");
      setTxItems([{ itemId: "", quantity: 1 }]);
    } catch (err: any) {
      toast.error(err.message || "فشلت عملية التحويل");
    } finally {
      setSubmitting(false);
    }
  };

  // 4. PRODUCT ASSEMBLY ORDER
  const handleExecuteAssembly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!asmWh || !asmProduct || !asmQuantity || Number(asmQuantity) <= 0) {
      toast.error("يرجى إدخال بيانات التجميع بشكل كامل وصحيح");
      return;
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find(w => w.id === asmWh)!;
      const finishedItem = items.find(i => i.id === asmProduct)!;
      const qtyToAssemble = Number(asmQuantity);

      if (finishedItem.type !== "assembly" || !finishedItem.bomComponents) {
        throw new Error("هذا المنتج غير معرف كمنتج مجمع أو لا يحتوي على قائمة مواد (BOM)");
      }

      // 1. Verify availability of raw materials
      const rawMaterialsToUpdate: { item: InventoryItem; nextQuantities: Record<string, number> }[] = [];
      let totalAssemblyCostHalalas = 0;

      for (const component of finishedItem.bomComponents) {
        const rawItem = items.find(i => i.id === component.itemId);
        if (!rawItem) throw new Error("تعذر العثور على أحد المكونات الخام في قاعدة البيانات");

        const requiredQty = component.quantity * qtyToAssemble;
        const availableQty = rawItem.warehouseQuantities[asmWh] || 0;

        if (availableQty < requiredQty) {
          throw new Error(`المخزون غير كافٍ للمكون الخام: ${rawItem.nameAr}. المطلوب: ${requiredQty}، المتوفر: ${availableQty}`);
        }

        totalAssemblyCostHalalas += rawItem.costPriceHalalas * requiredQty;

        rawMaterialsToUpdate.push({
          item: rawItem,
          nextQuantities: {
            ...rawItem.warehouseQuantities,
            [asmWh]: availableQty - requiredQty
          }
        });
      }

      // 2. Add automatic balanced journal entry
      // Debit: Finished Goods Inventory Account of the warehouse
      // Credit: Raw Materials Inventory Account of the warehouse
      // (Since we have separate accounts for warehouses, we can debit and credit the corresponding sub-account)
      const whAccId = accountIdMap[wh.accountCode];
      if (!whAccId) {
        throw new Error("لم يتم العثور على الدليل المحاسبي لهذا المستودع.");
      }

      const entryNumber = `JV-ASM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const descAr = `قيد تجميع بضائع تلقائي: إنتاج ${qtyToAssemble} من صنف [${finishedItem.nameAr}] في مستودع ${wh.nameAr}`;
      const descEn = `Auto product assembly: Produced ${qtyToAssemble} of [${finishedItem.nameEn}] in warehouse ${wh.nameEn}`;

      // In formal SOCPA standards, we track this within the inventory asset account
      // or record:
      // Debit: Finished Goods Inventory Account (Asset)
      // Credit: Raw Materials/Work in Progress Inventory Account (Asset)
      // Since we are shifting materials inside the same warehouse asset account (or into finished goods),
      // we generate a balanced journal entry reflecting the value addition.
      const journalRef = await addDoc(collection(db, "journal_entries"), {
        entryNumber,
        date: new Date().toISOString().split("T")[0],
        descriptionAr: descAr,
        descriptionEn: descEn,
        lines: [
          { accountId: whAccId, debitHalalas: totalAssemblyCostHalalas, creditHalalas: 0, costCenter: wh.nameAr },
          { accountId: whAccId, debitHalalas: 0, creditHalalas: totalAssemblyCostHalalas, costCenter: wh.nameAr }
        ],
        isBalanced: true,
        sourceDoc: `Assembly Order ${entryNumber}`,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // 3. Update all quantities in firestore
      const batch = writeBatch(db);

      // Decrease raw materials
      rawMaterialsToUpdate.forEach(({ item, nextQuantities }) => {
        const itemRef = doc(db, "inventory_items", item.id);
        batch.update(itemRef, { warehouseQuantities: nextQuantities });
      });

      // Increase finished goods
      const currentFinishedQty = finishedItem.warehouseQuantities[asmWh] || 0;
      const nextFinishedQuantities = {
        ...finishedItem.warehouseQuantities,
        [asmWh]: currentFinishedQty + qtyToAssemble
      };
      const finishedRef = doc(db, "inventory_items", finishedItem.id);
      batch.update(finishedRef, { warehouseQuantities: nextFinishedQuantities });

      // 4. Save assembly order
      const assemblyRef = doc(collection(db, "assembly_orders"));
      batch.set(assemblyRef, {
        assemblyNumber: entryNumber,
        date: new Date().toISOString().split("T")[0],
        warehouseId: asmWh,
        finishedItemId: asmProduct,
        finishedItemNameAr: finishedItem.nameAr,
        quantity: qtyToAssemble,
        unitCostHalalas: Math.round(totalAssemblyCostHalalas / qtyToAssemble),
        totalCostHalalas: totalAssemblyCostHalalas,
        journalEntryId: journalRef.id,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // 5. Save audit log
      const auditRef = doc(collection(db, "audit_logs"));
      batch.set(auditRef, {
        action: `أمر تصنيع وتجميع: ${descAr}`,
        actionEn: `Manufacturing Assembly Order: ${descEn}`,
        targetType: "تجميع المنتجات",
        targetId: entryNumber,
        riskLevel: "Medium",
        user: user.email || "moemahran@gmail.com",
        ipAddress: "192.168.1.102",
        timestamp: new Date().toISOString(),
        details: { assemblyNumber: entryNumber, totalCostHalalas: totalAssemblyCostHalalas, quantity: qtyToAssemble },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("تم إنتاج وتجميع الصنف النهائي وتحديث المواد الخام والقيد المالي! 🛠️📦");
      setShowAssemblyModal(false);
      setAsmWh("");
      setAsmProduct("");
      setAsmQuantity("1");
    } catch (err: any) {
      toast.error(err.message || "فشلت عملية التجميع");
    } finally {
      setSubmitting(false);
    }
  };

  // STOCK ADJUSTMENT HANDLER
  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || submitting) return;
    if (!adjWh) {
      toast.error("يرجى تحديد مستودع الجرد أولاً");
      return;
    }
    if (!adjReason) {
      toast.error("يرجى اختيار مبرر أو سبب التسوية");
      return;
    }

    setSubmitting(true);
    try {
      const wh = warehouses.find(w => w.id === adjWh);
      if (!wh) throw new Error("المستودع المحدد غير موجود");

      const adjustmentItemsList: any[] = [];
      let totalImpactHalalas = 0;
      let totalShortageValueHalalas = 0;
      let totalSurplusValueHalalas = 0;

      const updatedItemsToSave: { item: InventoryItem; nextQuantities: Record<string, number> }[] = [];

      for (const item of items) {
        const actualStr = adjQuantities[item.id];
        // If the supervisor entered a count for this item (including 0)
        if (actualStr !== undefined && actualStr !== "") {
          const actualQty = Number(actualStr);
          if (isNaN(actualQty) || actualQty < 0) {
            throw new Error(`الكمية الفعلية المدخلة للصنف ${item.nameAr} غير صالحة`);
          }

          const bookQty = item.warehouseQuantities[adjWh] || 0;
          const variance = actualQty - bookQty;
          
          if (variance !== 0) {
            const itemCost = item.costPriceHalalas;
            const totalVarianceCost = variance * itemCost;

            totalImpactHalalas += totalVarianceCost;
            if (variance < 0) {
              totalShortageValueHalalas += Math.abs(totalVarianceCost);
            } else {
              totalSurplusValueHalalas += totalVarianceCost;
            }

            adjustmentItemsList.push({
              itemId: item.id,
              sku: item.sku,
              nameAr: item.nameAr,
              bookQuantity: bookQty,
              actualQuantity: actualQty,
              variance,
              unitCostHalalas: itemCost,
              totalVarianceCostHalalas: totalVarianceCost
            });

            const nextQuantities = {
              ...item.warehouseQuantities,
              [adjWh]: actualQty
            };

            updatedItemsToSave.push({
              item,
              nextQuantities
            });
          }
        }
      }

      if (adjustmentItemsList.length === 0) {
        throw new Error("لم يتم إدخال أي تغييرات أو فروقات في الكميات الفعلية لتسويتها!");
      }

      const batch = writeBatch(db);
      
      const whAccId = accountIdMap[wh.accountCode];
      if (!whAccId) {
        throw new Error(`لم يتم العثور على الحساب المالي للمستودع (${wh.nameAr}) في شجرة الحسابات.`);
      }

      // Shortage Expense Account
      let shortageAccId = accountIdMap["510501"];
      if (totalShortageValueHalalas > 0 && !shortageAccId) {
        const accRef = doc(collection(db, "chart_of_accounts"));
        batch.set(accRef, {
          accountCode: "510501",
          nameAr: "مصاريف عجز جرد المخزون",
          nameEn: "Inventory Shortage Expenses",
          type: "Expense",
          balanceHalalas: 0,
          authorUid: user.uid,
          createdAt: serverTimestamp()
        });
        shortageAccId = accRef.id;
        accountIdMap["510501"] = accRef.id;
      }

      // Surplus Revenue Account
      let surplusAccId = accountIdMap["410301"];
      if (totalSurplusValueHalalas > 0 && !surplusAccId) {
        const accRef = doc(collection(db, "chart_of_accounts"));
        batch.set(accRef, {
          accountCode: "410301",
          nameAr: "إيرادات فروقات جرد المخزون",
          nameEn: "Inventory Surplus Revenues",
          type: "Revenue",
          balanceHalalas: 0,
          authorUid: user.uid,
          createdAt: serverTimestamp()
        });
        surplusAccId = accRef.id;
        accountIdMap["410301"] = accRef.id;
      }

      // Create Balanced Journal Entry lines
      const entryNumber = `JV-ADJ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const descAr = `تسوية فروقات جرد مخزن تلقائية لـ ${wh.nameAr} - السبب: ${adjReason}`;
      const descEn = `Auto inventory adjustment for ${wh.nameEn} - Reason: ${adjReason}`;

      const lines: any[] = [];

      // Shortage lines: Debit shortage expense, Credit warehouse asset
      if (totalShortageValueHalalas > 0) {
        lines.push({
          accountId: shortageAccId,
          debitHalalas: totalShortageValueHalalas,
          creditHalalas: 0,
          costCenter: wh.nameAr
        });
        lines.push({
          accountId: whAccId,
          debitHalalas: 0,
          creditHalalas: totalShortageValueHalalas,
          costCenter: wh.nameAr
        });
      }

      // Surplus lines: Debit warehouse asset, Credit surplus revenue
      if (totalSurplusValueHalalas > 0) {
        lines.push({
          accountId: whAccId,
          debitHalalas: totalSurplusValueHalalas,
          creditHalalas: 0,
          costCenter: wh.nameAr
        });
        lines.push({
          accountId: surplusAccId,
          debitHalalas: 0,
          creditHalalas: totalSurplusValueHalalas,
          costCenter: wh.nameAr
        });
      }

      // Post Journal Entry
      const journalRef = doc(collection(db, "journal_entries"));
      batch.set(journalRef, {
        entryNumber,
        date: new Date().toISOString().split("T")[0],
        descriptionAr: descAr,
        descriptionEn: descEn,
        lines,
        isBalanced: true,
        sourceDoc: `Adjustment Note ${entryNumber}`,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // Save stock adjustments record
      const adjRef = doc(collection(db, "stock_adjustments"));
      batch.set(adjRef, {
        adjustmentNumber: entryNumber,
        date: new Date().toISOString().split("T")[0],
        warehouseId: adjWh,
        warehouseNameAr: wh.nameAr,
        reason: adjReason,
        items: adjustmentItemsList,
        totalImpactHalalas,
        journalEntryId: journalRef.id,
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      // Update actual item quantities
      updatedItemsToSave.forEach(({ item, nextQuantities }) => {
        const itemRef = doc(db, "inventory_items", item.id);
        batch.update(itemRef, { warehouseQuantities: nextQuantities });
      });

      // Log to Audit Log
      const auditRef = doc(collection(db, "audit_logs"));
      batch.set(auditRef, {
        action: `تسوية جرد مخزني: ${descAr}`,
        actionEn: `Stock Adjustment: ${descEn}`,
        targetType: "تسوية المخزون",
        targetId: entryNumber,
        riskLevel: "High",
        user: user.email || "moemahran@gmail.com",
        ipAddress: "192.168.1.102",
        timestamp: new Date().toISOString(),
        details: {
          adjustmentNumber: entryNumber,
          totalImpactHalalas,
          shortages: totalShortageValueHalalas,
          surpluses: totalSurplusValueHalalas,
          itemsCount: adjustmentItemsList.length
        },
        authorUid: user.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();

      toast.success("تم ترحيل تسوية الجرد المخزني وتحديث الكميات وتوليد القيود بنجاح! ⚖️📦");
      setShowAdjustmentModal(false);
      setAdjWh("");
      setAdjReason("");
      setAdjQuantities({});
    } catch (err: any) {
      toast.error(err.message || "فشلت عملية تسوية الجرد المخزني");
    } finally {
      setSubmitting(false);
    }
  };

  // 5. DELETE WAREHOUSE OR PRODUCT (WITH SAFETY GAURDS)
  const handleDeleteItem = async (col: string, id: string, name: string) => {
    if (!window.confirm(`هل أنت متأكد من حذف (${name}) نهائياً؟`)) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, col, id));

      // Save audit log
      const auditRef = doc(collection(db, "audit_logs"));
      batch.set(auditRef, {
        action: `حذف من النظام: حذف ${col === "warehouses" ? "مستودع" : "صنف مخزني"} (${name})`,
        actionEn: `Deleted ${col === "warehouses" ? "warehouse" : "inventory item"} (${name})`,
        targetType: "مخازن ومواد",
        targetId: id,
        riskLevel: "High",
        user: user?.email || "moemahran@gmail.com",
        ipAddress: "185.190.140.32",
        timestamp: new Date().toISOString(),
        details: { id, col, name },
        authorUid: user?.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      toast.success(`تم حذف ${col === "warehouses" ? "المستودع" : "الصنف"} بنجاح`);
    } catch (err: any) {
      toast.error("فشل الحذف: " + err.message);
    }
  };

  // 6. FILTERED ITEMS FOR DISPLAY
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = 
        item.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === "all" || item.type === typeFilter;

      let matchesWarehouse = true;
      if (warehouseFilter !== "all") {
        matchesWarehouse = (item.warehouseQuantities[warehouseFilter] || 0) > 0;
      }

      return matchesSearch && matchesType && matchesWarehouse;
    });
  }, [items, searchQuery, typeFilter, warehouseFilter]);

  // Aggregate statistics for Overview panel
  const stats = useMemo(() => {
    let totalStockValue = 0;
    let totalItemsCount = items.length;
    let rawMaterialsCount = items.filter(i => i.type === "raw").length;
    let assembledProductsCount = items.filter(i => i.type === "assembly").length;

    items.forEach(item => {
      // sum up quantities across all warehouses
      const qtySum = Object.values(item.warehouseQuantities || {}).reduce((a, b) => a + b, 0);
      totalStockValue += (qtySum * item.costPriceHalalas) / 100;
    });

    return {
      totalStockValue,
      totalItemsCount,
      rawMaterialsCount,
      assembledProductsCount,
      warehousesCount: warehouses.length,
      totalTransfers: transfers.length,
      totalAssemblies: assemblies.length
    };
  }, [items, warehouses, transfers, assemblies]);

  return (
    <div className="space-y-6 pb-12 font-sans text-zinc-900" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-indigo-600" />
            نظام إدارة المستودعات المتعددة وتجميع المنتجات (BOM Module)
          </h2>
          <p className="text-xs text-zinc-500 font-bold mt-1">
            إدارة كاملة للمخزون اللامركزي، عمليات التحويل البيني، تجميع الطلبات (Bills of Materials)، وتوليد القيود المحاسبية الآلية المطابقة لـ SOCPA.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              onClick={bootstrapDemoData}
              disabled={submitting}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black transition-all border border-emerald-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              تهيئة بيانات تجريبية (Auto Seed Data)
            </button>
          )}
          <button
            onClick={() => setShowAddWarehouse(true)}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            إضافة مستودع
          </button>
          <button
            onClick={() => setShowAddProduct(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Package className="w-4 h-4" />
            تعريف صنف جديد
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 bg-white p-2 rounded-2xl border gap-1">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "overview" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📊 لوحة الإحصائيات العامة
        </button>
        <button
          onClick={() => setActiveTab("warehouses")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "warehouses" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          🏛️ تهيئة المستودعات ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "products" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          📦 كشاف المخزون والـ BOM ({items.length})
        </button>
        <button
          onClick={() => setActiveTab("transfers")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "transfers" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          🚛 حركات التحويل ({transfers.length})
        </button>
        <button
          onClick={() => setActiveTab("assemblies")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "assemblies" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          🛠️ تصنيع وتجميع الأوامر ({assemblies.length})
        </button>
        <button
          onClick={() => setActiveTab("adjustments")}
          className={cn(
            "flex-1 md:flex-none px-5 py-2.5 text-xs font-black rounded-xl transition-all cursor-pointer",
            activeTab === "adjustments" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-500 hover:bg-zinc-50"
          )}
        >
          ⚖️ تسويات الجرد المخزني ({adjustments.length})
        </button>
      </div>

      {loading && (
        <div className="p-12 text-center text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          جاري مزامنة بيانات المستودعات والمخزون...
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {!loading && activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">إجمالي القيمة التقديرية للمخزون</span>
              <h3 className="text-2xl font-black text-indigo-600 mt-2 font-mono">
                {stats.totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-zinc-400 font-sans">ر.س</span>
              </h3>
              <span className="text-[9px] text-zinc-400 mt-2 block">محتسب بالتكلفة المعتمدة للقطع والمواد</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase block">المستودعات المفعلة</span>
              <h3 className="text-2xl font-black text-zinc-900 mt-2 font-mono">
                {stats.warehousesCount} <span className="text-xs text-zinc-400 font-sans">مستودع</span>
              </h3>
              <span className="text-[9px] text-emerald-600 mt-2 block font-black">مربوطة مع دليل الحسابات ZATCA</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase block">دليل المواد (SKUs)</span>
              <h3 className="text-2xl font-black text-zinc-900 mt-2 font-mono">
                {stats.totalItemsCount} <span className="text-xs text-zinc-400 font-sans">صنف</span>
              </h3>
              <span className="text-[9px] text-zinc-400 mt-2 block">
                {stats.rawMaterialsCount} مواد خام • {stats.assembledProductsCount} منتجات مجمعة (BOM)
              </span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase block">كفاءة الأتمتة والعمليات</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                {stats.totalTransfers + stats.totalAssemblies} <span className="text-xs text-zinc-400 font-sans">حركة</span>
              </h3>
              <span className="text-[9px] text-emerald-600 mt-2 block font-bold">قيود يومية ومراجعات آلية 100%</span>
            </div>
          </div>

          {/* Prompt to create data if empty */}
          {warehouses.length === 0 && (
            <div className="bg-amber-50 border border-amber-200 p-8 rounded-[2.5rem] text-center space-y-4">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
              <h3 className="text-lg font-black text-amber-800">لا توجد مستودعات نشطة بالنظام</h3>
              <p className="text-xs text-amber-600 font-bold max-w-xl mx-auto">
                يرجى البدء بإضافة المستودعات وتأسيس دليل المواد، أو الضغط على زر "تهيئة بيانات تجريبية" بالأعلى لتأسيس دليل مخازن افتراضي جاهز بالكامل للتجربة الفورية.
              </p>
              <button
                onClick={bootstrapDemoData}
                disabled={submitting}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black transition cursor-pointer"
              >
                تأسيس البيانات التجريبية الآن
              </button>
            </div>
          )}

          {warehouses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Warehouse List Summary */}
              <div className="md:col-span-2 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-zinc-800 border-b pb-2 flex items-center gap-2">
                  <Warehouse className="w-4 h-4 text-zinc-500" />
                  حالة المخزون المتوفر في كل مستودع
                </h3>
                <div className="space-y-4">
                  {warehouses.map(wh => {
                    const whValue = items.reduce((sum, item) => {
                      const qty = item.warehouseQuantities[wh.id] || 0;
                      return sum + (qty * item.costPriceHalalas) / 100;
                    }, 0);

                    const totalItemsInWh = items.reduce((sum, item) => {
                      return sum + (item.warehouseQuantities[wh.id] || 0);
                    }, 0);

                    return (
                      <div key={wh.id} className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center hover:bg-zinc-100/50 transition">
                        <div>
                          <h4 className="text-xs font-black text-zinc-900">{wh.nameAr} ({wh.code})</h4>
                          <span className="text-[10px] text-zinc-400 font-bold mt-1 block">{wh.location || "الموقع غير محدد"}</span>
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-black text-zinc-900 block font-mono">{whValue.toLocaleString()} ر.س</span>
                          <span className="text-[9px] text-zinc-400 font-bold block mt-1">المخزون المتوفر: {totalItemsInWh} قطعة</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Actions / Operations Links */}
              <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm space-y-4 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-800 border-b pb-2">عمليات المستودعات الفورية</h3>
                  <p className="text-xs text-zinc-400 font-bold mt-2 leading-relaxed">
                    نفذ حركات التحويل الداخلي بين الفروع والمخازن أو تجميع الطلبيات والمواد الخام مباشرة، وسيتحمل النظام توليد القيود المطابقة محاسبياً بشكل فوري.
                  </p>
                </div>
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      if (warehouses.length < 2) {
                        toast.error("تحتاج إلى مستودعين على الأقل لإجراء تحويل");
                        return;
                      }
                      setShowTransferModal(true);
                    }}
                    className="w-full p-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-2xl border border-indigo-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>🚛 إجراء تحويل بين المستودعات</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (items.filter(i => i.type === "assembly").length === 0) {
                        toast.error("يرجى تعريف منتج مجمع (BOM) أولاً لبدء التجميع");
                        return;
                      }
                      setShowAssemblyModal(true);
                    }}
                    className="w-full p-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black rounded-2xl border border-emerald-100 transition flex items-center justify-between cursor-pointer"
                  >
                    <span>🛠️ تجميع وتصنيع أمر إنتاج (BOM)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WAREHOUSES CONFIG */}
      {!loading && activeTab === "warehouses" && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-zinc-900">هيكلة المستودعات المتعددة وعناوينها</h3>
              <p className="text-xs text-zinc-400 font-bold mt-0.5">تهيئة الفروع والمواقع وربطها مع دليل حسابات SOCPA المقابل لترحيل القيمة المالية تلقائياً.</p>
            </div>
            <button
              onClick={() => setShowAddWarehouse(true)}
              className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl hover:bg-zinc-800 transition cursor-pointer"
            >
              + إضافة مستودع جديد
            </button>
          </div>

          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs table-auto">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold">
                  <th className="p-4">رمز المستودع</th>
                  <th className="p-4">اسم المستودع (العربي)</th>
                  <th className="p-4">الاسم بالإنجليزية</th>
                  <th className="p-4">موقع المستودع والعنوان الوطني</th>
                  <th className="p-4">رمز الحساب المرتبط في الدليل</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {warehouses.map(wh => (
                  <tr key={wh.id} className="hover:bg-zinc-50/50 transition">
                    <td className="p-4 font-mono font-black text-zinc-900">{wh.code}</td>
                    <td className="p-4 font-bold text-zinc-800">{wh.nameAr}</td>
                    <td className="p-4 font-mono text-zinc-500">{wh.nameEn}</td>
                    <td className="p-4 font-bold text-zinc-500">{wh.location || "غير محدد"}</td>
                    <td className="p-4 font-mono font-black text-indigo-600 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5" />
                      {wh.accountCode} - {accounts.find(a => a.accountCode === wh.accountCode)?.nameAr || "حساب المخزون"}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteItem("warehouses", wh.id, wh.nameAr)}
                        className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        title="حذف المستودع"
                      >
                        <Trash2 className="w-4 h-4 mx-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
                {warehouses.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-zinc-400 font-bold">
                      لا توجد مستودعات مسجلة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: PRODUCTS & BOM DIRECTORY */}
      {!loading && activeTab === "products" && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="البحث بالاسم أو SKU أو رمز القطعة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs p-3 pr-10 bg-white border border-zinc-200 rounded-xl outline-none font-bold"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            <div>
              <select
                value={warehouseFilter}
                onChange={(e) => setWarehouseFilter(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-zinc-200 rounded-xl outline-none font-bold"
              >
                <option value="all">فرز حسب المستودع (كل المستودعات)</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.nameAr}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full text-xs p-3 bg-white border border-zinc-200 rounded-xl outline-none font-bold"
              >
                <option value="all">كل تصنيفات الأصناف</option>
                <option value="raw">مادة خام / قطعة منفصلة</option>
                <option value="assembly">منتج مجمع (BOM)</option>
              </select>
            </div>
          </div>

          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs table-auto">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold">
                  <th className="p-4">رمز الـ SKU</th>
                  <th className="p-4">اسم الصنف والمواصفات</th>
                  <th className="p-4">تصنيف الصنف</th>
                  <th className="p-4">تكلفة الشراء</th>
                  <th className="p-4">سعر البيع</th>
                  <th className="p-4">قائمة المواد (BOM)</th>
                  <th className="p-4 text-center">الكمية المتوفرة وموقعها</th>
                  <th className="p-4 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {filteredItems.map(item => {
                  const qtyTotal = Object.values(item.warehouseQuantities || {}).reduce((a, b) => a + b, 0);

                  return (
                    <tr key={item.id} className="hover:bg-zinc-50/50 transition">
                      <td className="p-4 font-mono font-black text-indigo-600">{item.sku}</td>
                      <td className="p-4">
                        <div className="font-bold text-zinc-900">{item.nameAr}</div>
                        <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{item.nameEn}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] font-bold rounded-lg border",
                          item.type === "assembly" 
                            ? "bg-indigo-50 border-indigo-100 text-indigo-700" 
                            : "bg-zinc-100 border-zinc-200 text-zinc-700"
                        )}>
                          {item.type === "assembly" ? "منتج مجمع (BOM) 🛠️" : "مادة خام"}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-zinc-800">
                        {(item.costPriceHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-4 font-mono font-bold text-emerald-600">
                        {(item.salePriceHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-4 max-w-xs">
                        {item.type === "assembly" && item.bomComponents ? (
                          <div className="space-y-1">
                            {item.bomComponents.map((comp, cIdx) => {
                              const matchingRaw = items.find(i => i.id === comp.itemId);
                              return (
                                <div key={cIdx} className="text-[10px] text-zinc-500 font-bold flex items-center gap-1">
                                  <CornerDownLeft className="w-3 h-3 text-zinc-400" />
                                  <span>{matchingRaw?.nameAr || "مكون غير معروف"} (الكمية: {comp.quantity})</span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-zinc-400 font-bold">- مادة أولية بسيطة -</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-center font-mono font-bold">
                          {warehouses.map(wh => {
                            const qtyInWh = item.warehouseQuantities[wh.id] || 0;
                            return (
                              <div key={wh.id} className="text-[10px] flex justify-between px-4 py-0.5 bg-zinc-50 border border-zinc-100 rounded">
                                <span className="text-zinc-400">{wh.nameAr}:</span>
                                <span className={qtyInWh > 0 ? "text-zinc-900" : "text-zinc-300"}>{qtyInWh} قطعة</span>
                              </div>
                            );
                          })}
                          <div className="border-t pt-1 flex justify-between px-4 font-black text-indigo-600">
                            <span>الإجمالي العام:</span>
                            <span>{qtyTotal} قطعة</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleDeleteItem("inventory_items", item.id, item.nameAr)}
                          className="p-1.5 hover:bg-rose-50 text-rose-600 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4 mx-auto" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-zinc-400 font-bold">
                      لا توجد مواد تطابق معايير البحث والفرز المحددة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: INTER-WAREHOUSE TRANSFERS */}
      {!loading && activeTab === "transfers" && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-zinc-900">سجل حركات التحويل المخزني بين الفروع والمستودعات</h3>
              <p className="text-xs text-zinc-400 font-bold mt-0.5">متابعة الحركات المشتركة للتحقق من سلامة الأرصدة وتأكيد القيود المحاسبية التلقائية المربوطة.</p>
            </div>
            <button
              onClick={() => {
                if (warehouses.length < 2) {
                  toast.error("تحتاج إلى مستودعين على الأقل لإجراء تحويل");
                  return;
                }
                setShowTransferModal(true);
              }}
              className="px-4 py-2.5 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition cursor-pointer"
            >
              + إنشاء حركة تحويل جديدة
            </button>
          </div>

          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs table-auto">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold">
                  <th className="p-4">رقم التحويل / السند</th>
                  <th className="p-4">تاريخ المعاملة</th>
                  <th className="p-4">مستودع الصادر (From)</th>
                  <th className="p-4">مستودع الوارد (To)</th>
                  <th className="p-4">المواد المحولة</th>
                  <th className="p-4">إجمالي تكلفة التحويل</th>
                  <th className="p-4">القيد المالي المولد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {transfers.map(tx => {
                  const sWh = warehouses.find(w => w.id === tx.sourceWarehouseId);
                  const dWh = warehouses.find(w => w.id === tx.destWarehouseId);

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-50/50 transition">
                      <td className="p-4 font-mono font-black text-indigo-600">{tx.transferNumber}</td>
                      <td className="p-4 font-mono text-zinc-500">{tx.date}</td>
                      <td className="p-4 font-bold text-zinc-800">{sWh?.nameAr || "مستودع صادر"}</td>
                      <td className="p-4 font-bold text-zinc-800">{dWh?.nameAr || "مستودع وارد"}</td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {tx.items.map((it, idx) => (
                            <div key={idx} className="font-bold text-zinc-700 flex justify-between gap-4 max-w-xs">
                              <span>{it.nameAr}</span>
                              <span className="text-zinc-400 font-mono">الكمية: {it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono font-black text-zinc-900">
                        {(tx.totalCostHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full font-mono text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          JV-AUTO ({tx.transferNumber})
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-zinc-400 font-bold">
                      لا توجد عمليات تحويل مخزني مسجلة حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSEMBLIES */}
      {!loading && activeTab === "assemblies" && (
        <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-zinc-900">سجل أوامر تجميع وإنتاج البضائع (BOM Assemblies)</h3>
              <p className="text-xs text-zinc-400 font-bold mt-0.5">تتبع عمليات تحويل المواد الخام إلى منتجات نهائية تامة الصنع وتحديث حسابات المخازن المقابلة.</p>
            </div>
            <button
              onClick={() => {
                if (items.filter(i => i.type === "assembly").length === 0) {
                  toast.error("يرجى تعريف منتج مجمع (BOM) أولاً لبدء التجميع");
                  return;
                }
                setShowAssemblyModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition cursor-pointer"
            >
              + تنفيذ أمر تجميع إنتاجي جديد
            </button>
          </div>

          <div className="border border-zinc-100 rounded-2xl overflow-hidden">
            <table className="w-full text-right text-xs table-auto">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold">
                  <th className="p-4">رقم الحركة / المرجع</th>
                  <th className="p-4">تاريخ الحركة</th>
                  <th className="p-4">مستودع التشغيل</th>
                  <th className="p-4">المنتج النهائي المجمع</th>
                  <th className="p-4 text-center">الكمية المصنعة</th>
                  <th className="p-4">تكلفة القطعة الواحدة</th>
                  <th className="p-4">إجمالي تكلفة أمر التجميع</th>
                  <th className="p-4">القيد المالي المولد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white">
                {assemblies.map(asm => {
                  const wh = warehouses.find(w => w.id === asm.warehouseId);

                  return (
                    <tr key={asm.id} className="hover:bg-zinc-50/50 transition">
                      <td className="p-4 font-mono font-black text-emerald-600">{asm.assemblyNumber}</td>
                      <td className="p-4 font-mono text-zinc-500">{asm.date}</td>
                      <td className="p-4 font-bold text-zinc-800">{wh?.nameAr || "مستودع التشغيل"}</td>
                      <td className="p-4 font-black text-zinc-900">{asm.finishedItemNameAr}</td>
                      <td className="p-4 text-center font-mono font-black text-indigo-600 text-sm">{asm.quantity} حزمة</td>
                      <td className="p-4 font-mono font-bold text-zinc-800">
                        {(asm.unitCostHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-4 font-mono font-black text-zinc-950 text-sm">
                        {(asm.totalCostHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono text-[10px] font-black">
                          <CheckCircle2 className="w-3 h-3" />
                          JV-AUTO ({asm.assemblyNumber})
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {assemblies.length === 0 && (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-zinc-400 font-bold">
                      لا توجد أوامر تجميع وإنتاج مسجلة بالنظام حتى الآن.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADJUSTMENTS */}
      {!loading && activeTab === "adjustments" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Quick Metrics for Adjustments */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">إجمالي التسويات المجراة</span>
              <h3 className="text-2xl font-black text-zinc-900 mt-2 font-mono">
                {adjustments.length} <span className="text-xs text-zinc-400 font-sans">تسوية</span>
              </h3>
              <span className="text-[9px] text-zinc-400 mt-2 block">حركات التسوية المعتمدة والمرحلة محاسبياً</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-rose-500 uppercase tracking-wider block">إجمالي عجز المخزون (Shortages)</span>
              <h3 className="text-2xl font-black text-rose-600 mt-2 font-mono">
                {(adjustments.reduce((acc, adj) => {
                  const shortage = adj.items.reduce((s, item) => item.variance < 0 ? s + Math.abs(item.totalVarianceCostHalalas) : s, 0);
                  return acc + shortage;
                }, 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-zinc-400 font-sans">ر.س</span>
              </h3>
              <span className="text-[9px] text-rose-400 mt-2 block">القيمة المالية الكلية للنقص في البضائع</span>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-wider block">إجمالي فائض المخزون (Surpluses)</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-2 font-mono">
                {(adjustments.reduce((acc, adj) => {
                  const surplus = adj.items.reduce((s, item) => item.variance > 0 ? s + item.totalVarianceCostHalalas : s, 0);
                  return acc + surplus;
                }, 0) / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} <span className="text-xs text-zinc-400 font-sans">ر.س</span>
              </h3>
              <span className="text-[9px] text-emerald-400 mt-2 block">القيمة المالية الكلية للمكاسب والزيادة</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-zinc-900">سجل تسويات جرد المخزون (Stock Adjustment & Reconciliation Ledger)</h3>
                <p className="text-xs text-zinc-400 font-bold mt-0.5">تسجيل ومطابقة نتائج الجرد الفعلي للمخازن، واحتساب فروقات الأرباح والخسائر وترحيلها محاسبياً فوراً.</p>
              </div>
              <button
                onClick={() => {
                  if (warehouses.length === 0) {
                    toast.error("يرجى تعريف مستودع واحد على الأقل أولاً لبدء التسوية");
                    return;
                  }
                  if (items.length === 0) {
                    toast.error("يرجى تعريف أصناف مخزنية أولاً لإجراء الجرد");
                    return;
                  }
                  setShowAdjustmentModal(true);
                }}
                className="px-4 py-2.5 bg-zinc-900 text-white text-xs font-black rounded-xl hover:bg-zinc-800 transition cursor-pointer flex items-center gap-1.5"
              >
                <ClipboardList className="w-4 h-4" />
                إجراء تسوية جرد جديدة
              </button>
            </div>

            <div className="border border-zinc-100 rounded-2xl overflow-hidden">
              <table className="w-full text-right text-xs table-auto">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-400 font-bold">
                    <th className="p-4">رقم التسوية / الحركة</th>
                    <th className="p-4">تاريخ الحركة</th>
                    <th className="p-4">المستودع المجرود</th>
                    <th className="p-4">مبرر التسوية</th>
                    <th className="p-4 text-center">الأصناف المتأثرة</th>
                    <th className="p-4">صافي الأثر المالي</th>
                    <th className="p-4">القيد المحاسبي</th>
                    <th className="p-4 text-center">التفاصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {adjustments.map(adj => {
                    const isSurplus = adj.totalImpactHalalas > 0;
                    const isShortage = adj.totalImpactHalalas < 0;

                    return (
                      <React.Fragment key={adj.id}>
                        <tr className="hover:bg-zinc-50/50 transition">
                          <td className="p-4 font-mono font-black text-indigo-600">{adj.adjustmentNumber}</td>
                          <td className="p-4 font-mono text-zinc-500">{adj.date}</td>
                          <td className="p-4 font-bold text-zinc-800">{adj.warehouseNameAr}</td>
                          <td className="p-4 font-bold text-zinc-600">{adj.reason}</td>
                          <td className="p-4 text-center font-mono font-black text-zinc-700">{adj.items.length} أصناف</td>
                          <td className="p-4 font-mono font-black text-sm">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-xs",
                              isSurplus && "bg-emerald-50 text-emerald-700 border border-emerald-100",
                              isShortage && "bg-rose-50 text-rose-700 border border-rose-100",
                              adj.totalImpactHalalas === 0 && "bg-zinc-50 text-zinc-600"
                            )}>
                              {isSurplus && "+"}
                              {(adj.totalImpactHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-full font-mono text-[10px] font-black">
                              <CheckCircle2 className="w-3 h-3" />
                              JV-AUTO ({adj.adjustmentNumber})
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => {
                                const rowId = `details-${adj.id}`;
                                const el = document.getElementById(rowId);
                                if (el) {
                                  el.classList.toggle("hidden");
                                }
                              }}
                              className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold rounded-lg cursor-pointer transition text-[10px]"
                            >
                              عرض الفروقات تفصيلاً
                            </button>
                          </td>
                        </tr>
                        {/* Nested detail row */}
                        <tr id={`details-${adj.id}`} className="hidden bg-zinc-50/40">
                          <td colSpan={8} className="p-4 border-t border-b border-zinc-100">
                            <div className="p-4 bg-white border border-zinc-200/60 rounded-2xl space-y-3">
                              <h4 className="text-[11px] font-black text-zinc-800 flex items-center gap-1.5">
                                <Info className="w-3.5 h-3.5 text-indigo-600" />
                                تفاصيل الفروقات الجردية للصنف والكميات المطابقة:
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {adj.items.map((it, idx) => {
                                  const itemSurplus = it.variance > 0;
                                  const itemShortage = it.variance < 0;
                                  return (
                                    <div key={idx} className="flex justify-between items-center bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                      <div>
                                        <p className="font-black text-zinc-900">{it.nameAr}</p>
                                        <p className="text-[10px] text-zinc-400 font-mono mt-0.5">SKU: {it.sku} • التكلفة: {(it.unitCostHalalas/100).toFixed(2)} ر.س</p>
                                      </div>
                                      <div className="text-left font-mono font-bold">
                                        <p className="text-[11px] text-zinc-500">الدفترية: {it.bookQuantity} | الفعلية: {it.actualQuantity}</p>
                                        <p className={cn(
                                          "text-xs font-black mt-0.5",
                                          itemSurplus && "text-emerald-600",
                                          itemShortage && "text-rose-600"
                                        )}>
                                          الفارق: {itemSurplus && "+"}{it.variance} ({itemSurplus ? "فائض" : "عجز"})
                                        </p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">الأثر المالي: {(it.totalVarianceCostHalalas/100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س</p>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  {adjustments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-zinc-400 font-bold">
                        لا توجد تسويات جرد مسجلة بالنظام حتى الآن.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 1. ADD WAREHOUSE MODAL */}
      <AnimatePresence>
        {showAddWarehouse && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 w-full max-w-lg overflow-hidden flex flex-col p-6 space-y-4"
            >
              <h3 className="text-base font-black text-zinc-900 border-b pb-2">إضافة مستودع جديد للنظام</h3>
              <form onSubmit={handleCreateWarehouse} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-zinc-400 mb-1">اسم المستودع بالعربية</label>
                  <input
                    type="text"
                    required
                    value={newWhNameAr}
                    onChange={(e) => setNewWhNameAr(e.target.value)}
                    placeholder="مثال: مستودع جدة المركزي"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">اسم المستودع بالإنجليزية</label>
                  <input
                    type="text"
                    required
                    value={newWhNameEn}
                    onChange={(e) => setNewWhNameEn(e.target.value)}
                    placeholder="مثال: Jeddah Central Warehouse"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">رمز المستودع المميز (Code)</label>
                  <input
                    type="text"
                    required
                    value={newWhCode}
                    onChange={(e) => setNewWhCode(e.target.value)}
                    placeholder="مثال: JW-03"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                  />
                </div>
                <div>
                  <label className="block text-zinc-400 mb-1">الموقع الفعلي / العنوان الوطني بالتفصيل</label>
                  <input
                    type="text"
                    value={newWhLocation}
                    onChange={(e) => setNewWhLocation(e.target.value)}
                    placeholder="مثال: جدة، حي السلامة، شارع الأمل"
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                  />
                </div>

                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-2xl flex gap-2.5">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                  <p className="text-[10px] text-indigo-700 leading-relaxed">
                    ملاحظة هامة: عند إنشاء المستودع، سيقوم النظام تلقائياً بإنشاء حساب أصول فرعي مقابل له في "دليل الحسابات" لتتبع تكلفة البضاعة المودعة به وتصفية ميزان المراجعة.
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
                    className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 cursor-pointer disabled:opacity-50"
                  >
                    تأكيد وإنشاء المستودع
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. ADD PRODUCT MODAL */}
      <AnimatePresence>
        {showAddProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 w-full max-w-xl overflow-hidden flex flex-col p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-base font-black text-zinc-900 border-b pb-2">تسجيل صنف مخزني جديد</h3>
              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">اسم الصنف بالعربية</label>
                    <input
                      type="text"
                      required
                      value={newProdNameAr}
                      onChange={(e) => setNewProdNameAr(e.target.value)}
                      placeholder="اسم القطعة أو المنتج"
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الاسم بالإنجليزية</label>
                    <input
                      type="text"
                      required
                      value={newProdNameEn}
                      onChange={(e) => setNewProdNameEn(e.target.value)}
                      placeholder="English Item Name"
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">رمز الـ SKU المميز</label>
                    <input
                      type="text"
                      required
                      value={newProdSku}
                      onChange={(e) => setNewProdSku(e.target.value)}
                      placeholder="SKU-XXXX"
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">تصنيف المخزون</label>
                    <select
                      value={newProdType}
                      onChange={(e) => setNewProdType(e.target.value as "raw" | "assembly")}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl"
                    >
                      <option value="raw">مادة خام / قطعة أولية (Raw Material)</option>
                      <option value="assembly">منتج مجمع (Assembled Product / BOM)</option>
                    </select>
                  </div>
                </div>

                {newProdType === "raw" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-400 mb-1">تكلفة الشراء الأساسية (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProdCost}
                        onChange={(e) => setNewProdCost(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-400 mb-1">سعر البيع الافتراضي للجمهور (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={newProdSale}
                        onChange={(e) => setNewProdSale(e.target.value)}
                        placeholder="0.00"
                        className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-right"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 border border-indigo-100 p-4 rounded-2xl bg-indigo-50/20">
                    <h4 className="text-xs font-black text-indigo-700 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" />
                      بناء قائمة المواد والمكونات المجمع منها المنتج (Bill of Materials - BOM)
                    </h4>

                    {/* BOM components selector */}
                    <div className="grid grid-cols-3 gap-2 items-end">
                      <div className="col-span-2">
                        <label className="block text-zinc-400 mb-1 text-[10px]">اختر المادة الخام من القائمة:</label>
                        <select
                          id="bomComponentSelector"
                          className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-[11px]"
                          defaultValue=""
                        >
                          <option value="" disabled>--- اختر صنفاً خام ---</option>
                          {items.filter(i => i.type === "raw").map(i => (
                            <option key={i.id} value={i.id}>{i.nameAr} ({i.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={() => {
                            const sel = document.getElementById("bomComponentSelector") as HTMLSelectElement;
                            if (sel && sel.value) {
                              addBomComponent(sel.value, 1);
                              sel.value = "";
                            } else {
                              toast.error("يرجى اختيار مادة أولاً");
                            }
                          }}
                          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black cursor-pointer"
                        >
                          إضافة صنف
                        </button>
                      </div>
                    </div>

                    {/* Selected components list */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {newProdBom.map((bomItem, idx) => {
                        const originalRaw = items.find(i => i.id === bomItem.itemId);
                        return (
                          <div key={idx} className="flex justify-between items-center p-2 bg-white rounded-xl border border-zinc-100 text-[11px]">
                            <span className="font-bold text-zinc-800">{originalRaw?.nameAr}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-400">الكمية المطلوبة:</span>
                              <input
                                type="number"
                                min="1"
                                value={bomItem.quantity}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  const updated = [...newProdBom];
                                  updated[idx].quantity = val > 0 ? val : 1;
                                  setNewProdBom(updated);
                                }}
                                className="w-12 p-1 border rounded text-center font-mono font-bold"
                              />
                              <button
                                type="button"
                                onClick={() => removeBomComponent(bomItem.itemId)}
                                className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {newProdBom.length === 0 && (
                        <div className="text-center p-4 text-zinc-400 text-[10px]">
                          قائمة المواد فارغة، يرجى إضافة المواد والمكونات التي تدخل في تجميع هذا المنتج لتمكين نظام تجميع المخزون التلقائي.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                  >
                    تأكيد وحفظ الصنف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. INTER-WAREHOUSE TRANSFER MODAL */}
      <AnimatePresence>
        {showTransferModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 w-full max-w-xl overflow-hidden flex flex-col p-6 space-y-4"
            >
              <h3 className="text-base font-black text-zinc-900 border-b pb-2 flex items-center gap-1.5">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                تحويل بضائع داخلي بين المستودعات (Inter-Warehouse Transfer)
              </h3>
              <form onSubmit={handleExecuteTransfer} className="space-y-4 text-xs font-bold">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">مستودع الصادر (المصدر)</label>
                    <select
                      required
                      value={txSourceWh}
                      onChange={(e) => setTxSourceWh(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                    >
                      <option value="">-- اختر مستودع الشحن --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">مستودع الوارد (الوجهة)</label>
                    <select
                      required
                      value={txDestWh}
                      onChange={(e) => setTxDestWh(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                    >
                      <option value="">-- اختر مستودع الاستلام --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3 border border-zinc-100 p-4 rounded-2xl bg-zinc-50/50">
                  <h4 className="text-xs font-black text-zinc-700">تحديد الأصناف والكميات المراد نقلها:</h4>

                  {txItems.map((txItem, idx) => {
                    const selectedDbItem = items.find(i => i.id === txItem.itemId);
                    const availableInSource = selectedDbItem && txSourceWh 
                      ? (selectedDbItem.warehouseQuantities[txSourceWh] || 0) 
                      : 0;

                    return (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <select
                            required
                            value={txItem.itemId}
                            onChange={(e) => {
                              const updated = [...txItems];
                              updated[idx].itemId = e.target.value;
                              setTxItems(updated);
                            }}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-[11px]"
                          >
                            <option value="">-- اختر صنفاً للنقل --</option>
                            {items.map(i => (
                              <option key={i.id} value={i.id}>{i.nameAr} ({i.sku})</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-4 flex items-center gap-1.5">
                          <input
                            type="number"
                            min="1"
                            required
                            placeholder="الكمية"
                            value={txItem.quantity}
                            onChange={(e) => {
                              const updated = [...txItems];
                              updated[idx].quantity = Number(e.target.value);
                              setTxItems(updated);
                            }}
                            className="w-full p-2.5 bg-white border border-zinc-200 rounded-xl text-center font-mono"
                          />
                          {selectedDbItem && (
                            <span className="text-[9px] text-zinc-400 shrink-0 font-bold">
                              متوفر: {availableInSource}
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-center">
                          {txItems.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setTxItems(txItems.filter((_, iIdx) => iIdx !== idx))}
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setTxItems([...txItems, { itemId: "", quantity: 1 }])}
                    className="text-[10px] text-indigo-600 hover:underline font-black block"
                  >
                    + إضافة صنف إضافي لأمر التحويل
                  </button>
                </div>

                <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex gap-2">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-relaxed">
                    سيقوم النظام بترحيل قيد مالي فوري: بقيمة تكلفة البضاعة المنقولة لتخفيض قيمة مخزون مستودع الصادر وزيادة رصيد مخزون مستودع الوارد بشكل فوري ومتكامل.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTransferModal(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 cursor-pointer disabled:opacity-50"
                  >
                    تأكيد وترحيل التحويل المخزني
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. PRODUCT ASSEMBLY MODAL */}
      <AnimatePresence>
        {showAssemblyModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 w-full max-w-xl overflow-hidden flex flex-col p-6 space-y-4"
            >
              <h3 className="text-base font-black text-zinc-900 border-b pb-2 flex items-center gap-1.5">
                <Layers className="w-5 h-5 text-emerald-600" />
                تجميع وتصنيع صنف نهائي من المواد الخام (Assemble Order / BOM)
              </h3>
              <form onSubmit={handleExecuteAssembly} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="block text-zinc-400 mb-1">مستودع التشغيل والإنتاج</label>
                  <select
                    required
                    value={asmWh}
                    onChange={(e) => setAsmWh(e.target.value)}
                    className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                  >
                    <option value="">-- اختر مستودع التشغيل --</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">المنتج النهائي المراد تجميعه</label>
                    <select
                      required
                      value={asmProduct}
                      onChange={(e) => setAsmProduct(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs"
                    >
                      <option value="">-- اختر صنفاً مجمعاً (BOM) --</option>
                      {items.filter(i => i.type === "assembly").map(i => (
                        <option key={i.id} value={i.id}>{i.nameAr} ({i.sku})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الكمية المطلوبة للإنتاج (حزمة)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={asmQuantity}
                      onChange={(e) => setAsmQuantity(e.target.value)}
                      className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-mono text-center text-sm font-black"
                    />
                  </div>
                </div>

                {/* Show BOM Preview dynamically */}
                {asmProduct && asmQuantity && (
                  <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl space-y-3">
                    <h4 className="text-[11px] font-black text-emerald-700">معاينة استهلاك المواد والمكونات المطلوبة للتجميع:</h4>
                    <div className="space-y-1.5">
                      {items.find(i => i.id === asmProduct)?.bomComponents?.map((component, idx) => {
                        const rawItem = items.find(ri => ri.id === component.itemId);
                        const requiredQty = component.quantity * Number(asmQuantity);
                        const availableQty = asmWh ? (rawItem?.warehouseQuantities[asmWh] || 0) : 0;
                        const isSufficient = availableQty >= requiredQty;

                        return (
                          <div key={idx} className="flex justify-between items-center text-[10px] bg-white p-2 rounded-lg border border-zinc-100">
                            <span className="font-bold text-zinc-800">{rawItem?.nameAr}</span>
                            <div className="flex gap-4 font-mono font-bold">
                              <span>المطلوب: {requiredQty} قطع</span>
                              <span className={isSufficient ? "text-emerald-600" : "text-rose-600 animate-pulse"}>
                                المتوفر بالمستودع: {availableQty} قطعة {isSufficient ? "✓" : "❌ غير كافٍ"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl flex gap-2">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                  <p className="text-[10px] text-indigo-800 leading-relaxed">
                    محاسبة الإنتاج المعتمدة: سيقوم النظام بإنقاص كميات المواد الخام تلقائياً من المستودع المختار وزيادة كمية الحزمة النهائية المنتجة مع احتساب التكلفة الإجمالية بدقة وترحيل القيد الدفتري فورا.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAssemblyModal(false)}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
                  >
                    تأكيد وبدء التجميع الإنتاجي
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. STOCK ADJUSTMENT & RECONCILIATION MODAL */}
      <AnimatePresence>
        {showAdjustmentModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-black text-zinc-900 flex items-center gap-1.5">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    ورقة تسوية جرد المخزون الفعلي (Stock Reconciliation Sheet)
                  </h3>
                  <p className="text-[11px] text-zinc-400 font-bold mt-0.5">أدخل الأرصدة الفعلية الموجودة بالمستودع وسيقوم النظام باحتساب الفروقات وترحيل القيود المالية فوراً.</p>
                </div>
                <button
                  onClick={() => setShowAdjustmentModal(false)}
                  className="p-2 text-zinc-400 hover:bg-zinc-200/60 rounded-full transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleExecuteAdjustment} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-bold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
                  <div>
                    <label className="block text-zinc-500 mb-1 font-black">1. المستودع المجرود (المخزن)</label>
                    <select
                      required
                      value={adjWh}
                      onChange={(e) => {
                        setAdjWh(e.target.value);
                        // Reset entered counts on warehouse switch
                        const initialCounts: Record<string, string> = {};
                        items.forEach(it => {
                          initialCounts[it.id] = String(it.warehouseQuantities[e.target.value] ?? 0);
                        });
                        setAdjQuantities(initialCounts);
                      }}
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold"
                    >
                      <option value="">-- اختر المستودع --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.nameAr} ({w.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-zinc-500 mb-1 font-black">2. سبب الجرد / مبرر التسوية</label>
                    <select
                      required
                      value={adjReason}
                      onChange={(e) => setAdjReason(e.target.value)}
                      className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-xs font-bold"
                    >
                      <option value="">-- حدد السبب --</option>
                      <option value="جرد دوري شهري / ربع سنوي">جرد دوري شهري / ربع سنوي (Periodic Count)</option>
                      <option value="تسوية عجز تالف أو فاقد مخزني">تسوية عجز تالف أو فاقد مخزني (Damaged/Lost)</option>
                      <option value="تسوية فائض بضائع غير مثبتة">تسوية فائض بضائع غير مثبتة (Unrecorded Goods)</option>
                      <option value="تصحيح أخطاء إدخال واستلام سابقة">تصحيح أخطاء إدخال واستلام سابقة (Correction)</option>
                      <option value="جرد مفاجئ للرقابة الداخلية">جرد مفاجئ للرقابة الداخلية (Surprise Audit)</option>
                    </select>
                  </div>
                </div>

                {adjWh ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black text-zinc-800">جدول جرد الأصناف المخزنية ومقارنة الكميات:</h4>
                      <span className="text-[10px] font-mono text-zinc-400">إجمالي الأصناف: {items.length}</span>
                    </div>

                    <div className="border border-zinc-200 rounded-2xl overflow-hidden">
                      <table className="w-full text-right text-[11px]">
                        <thead>
                          <tr className="bg-zinc-100/80 text-zinc-500 font-black border-b border-zinc-200">
                            <th className="p-3">الصنف / كود SKU</th>
                            <th className="p-3 text-center">الرصيد الدفتري</th>
                            <th className="p-3 w-32 text-center">الجرد الفعلي</th>
                            <th className="p-3 text-center">الفارق (Variance)</th>
                            <th className="p-3 text-left">الأثر المالي المتوقع</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 bg-white">
                          {items.map(it => {
                            const bookQty = it.warehouseQuantities[adjWh] || 0;
                            const actualStr = adjQuantities[it.id] ?? String(bookQty);
                            const actualQty = actualStr === "" ? bookQty : Number(actualStr);
                            const variance = actualQty - bookQty;
                            const varianceCost = variance * it.costPriceHalalas;

                            return (
                              <tr key={it.id} className={cn("transition", variance !== 0 && "bg-amber-50/30")}>
                                <td className="p-3">
                                  <p className="font-black text-zinc-900">{it.nameAr}</p>
                                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">SKU: {it.sku} | التكلفة: {(it.costPriceHalalas/100).toFixed(2)} ر.س</p>
                                </td>
                                <td className="p-3 text-center font-mono font-bold text-zinc-600">{bookQty}</td>
                                <td className="p-3">
                                  <input
                                    type="number"
                                    min="0"
                                    value={actualStr}
                                    onChange={(e) => {
                                      setAdjQuantities({
                                        ...adjQuantities,
                                        [it.id]: e.target.value
                                      });
                                    }}
                                    className="w-full p-2 bg-white border border-zinc-300 rounded-lg text-center font-mono font-black text-xs shadow-inner focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 outline-none"
                                  />
                                </td>
                                <td className="p-3 text-center font-mono font-black">
                                  <span className={cn(
                                    "px-2 py-0.5 rounded",
                                    variance > 0 && "bg-emerald-100 text-emerald-800",
                                    variance < 0 && "bg-rose-100 text-rose-800",
                                    variance === 0 && "text-zinc-400"
                                  )}>
                                    {variance > 0 && "+"}{variance}
                                  </span>
                                </td>
                                <td className="p-3 text-left font-mono font-black">
                                  <span className={cn(
                                    variance > 0 && "text-emerald-600",
                                    variance < 0 && "text-rose-600",
                                    variance === 0 && "text-zinc-400"
                                  )}>
                                    {variance > 0 && "+"}{(varianceCost/100).toLocaleString(undefined, { minimumFractionDigits: 2 })} ر.س
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                    <p className="text-zinc-400 font-bold text-sm">يرجى تحديد المستودع أولاً لعرض أرصدة الجرد الدفتري</p>
                  </div>
                )}

                <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3">
                  <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-[11px] text-indigo-900">
                    <p className="font-black">معالجة محاسبية آلية متوافقة مع معايير IFRS:</p>
                    <p className="leading-relaxed text-indigo-800/80">
                      عند الاعتماد، سيقوم النظام بتوليد قيد تسوية جردية أوتوماتيكي: يثبت خسائر العجز في حساب (مصاريف عجز الجرد 510501) أو يثبت مكاسب الزيادة في حساب (إيرادات فروقات الجرد 410301) مع تحديث أصل المخزون وحفظ ورقة المراجعة بـ Audit Logs.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setShowAdjustmentModal(false)}
                    className="px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl cursor-pointer font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !adjWh || !adjReason}
                    className="px-6 py-3 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 cursor-pointer font-black disabled:opacity-50 flex items-center gap-2 shadow-lg"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    اعتماد الجرد وترحيل القيود المحاسبية
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
