import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Layers,
  ExternalLink,
  Barcode,
  QrCode,
  Grid,
  List,
  CheckCircle2,
  ChevronDown,
  Check,
  Printer,
  Settings,
  FolderTree,
  Bookmark,
  Weight,
  RefreshCw,
  Upload,
  Download,
  Copy,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Info,
  Calendar,
  History,
  User,
  Save,
  Archive,
  X,
  HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";

interface ProductsModuleProps {
  items: any[];
  warehouses: any[];
  onAddProduct: (prodData: any) => Promise<any>;
  onDeleteProduct: (id: string, name: string) => void;
  onUpdateProduct?: (id: string, prodData: any) => void;
}

// Default Categories
const INITIAL_CATEGORIES = [
  {
    id: "cat-1",
    name: "أثاث مكتبي",
    nameEn: "Office Furniture",
    parentId: null,
    color: "#10b981",
    icon: "🪑",
  },
  {
    id: "cat-1-1",
    name: "كراسي طبية",
    nameEn: "Orthopedic Chairs",
    parentId: "cat-1",
    color: "#3b82f6",
    icon: "♿",
  },
  {
    id: "cat-1-2",
    name: "طاولات فخمة",
    nameEn: "Luxury Desks",
    parentId: "cat-1",
    color: "#4f46e5",
    icon: "🪵",
  },
  {
    id: "cat-2",
    name: "إلكترونيات وشاشات",
    nameEn: "Electronics & Displays",
    parentId: null,
    color: "#ef4444",
    icon: "🖥️",
  },
  {
    id: "cat-3",
    name: "مواد تعبئة وتغليف",
    nameEn: "Packaging Materials",
    parentId: null,
    color: "#f59e0b",
    icon: "📦",
  },
];

// Default Brands
const INITIAL_BRANDS = [
  {
    id: "brand-1",
    name: "مجموعة الرياض للتأثيث",
    country: "المملكة العربية السعودية",
    website: "riyadhfurn.com",
    status: "Active",
  },
  {
    id: "brand-2",
    name: "ديل تكنولوجيز (Dell)",
    country: "الولايات المتحدة الأمريكية",
    website: "dell.com",
    status: "Active",
  },
  {
    id: "brand-3",
    name: "سابك للبتروكيماويات",
    country: "المملكة العربية السعودية",
    website: "sabic.com",
    status: "Active",
  },
];

// Default Units
const INITIAL_UNITS = [
  { id: "unit-1", name: "حبة (Piece)", abbreviation: "Pcs", type: "Count", conversions: [] },
  {
    id: "unit-2",
    name: "كرتون (Carton)",
    abbreviation: "Ctn",
    type: "Count",
    conversions: [{ targetUnitId: "unit-1", factor: 24, targetName: "حبة" }],
  },
  {
    id: "unit-3",
    name: "صندوق (Box)",
    abbreviation: "Box",
    type: "Count",
    conversions: [{ targetUnitId: "unit-1", factor: 12, targetName: "حبة" }],
  },
  {
    id: "unit-4",
    name: "كيلوغرام (Kilogram)",
    abbreviation: "Kg",
    type: "Weight",
    conversions: [{ targetUnitId: "unit-5", factor: 1000, targetName: "غرام" }],
  },
  { id: "unit-5", name: "غرام (Gram)", abbreviation: "g", type: "Weight", conversions: [] },
];

export default function ProductsModule({
  items,
  warehouses,
  onAddProduct,
  onDeleteProduct,
  onUpdateProduct,
}: ProductsModuleProps) {
  const [subTab, setSubTab] = useState<"catalog" | "categories" | "brands" | "units" | "labels">(
    "catalog"
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Searching, Filtering & Selection
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Custom definitions state
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [units, setUnits] = useState(INITIAL_UNITS);

  // Modals / Editors
  const [showAddForm, setShowAddForm] = useState(false);
  const [showBarcodePrint, setShowBarcodePrint] = useState<any | null>(null);

  // New States for Advanced Features
  const [selectedProductForDrawer, setSelectedProductForDrawer] = useState<any | null>(null);
  const handleRowClick = (e: React.MouseEvent, prod: any) => {
    const target = e.target as HTMLElement;
    if (target.closest(".checkbox-cell") || target.closest("button") || target.closest("input")) {
      return;
    }
    setSelectedProductForDrawer(prod);
  };
  const [drawerActiveTab, setDrawerActiveTab] = useState<"details" | "stock" | "logs">("details");
  const [drawerAuditLogs, setDrawerAuditLogs] = useState<any[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [editingCell, setEditingCell] = useState<{
    productId: string;
    field: "costPriceHalalas" | "salePriceHalalas";
  } | null>(null);
  const [editingCellValue, setEditingCellValue] = useState<string>("");
  const [scannerMode, setScannerMode] = useState<"search" | "adjust" | "receive">("search");
  const [isScannerListening, setIsScannerListening] = useState(true);
  const [scannedItemsHistory, setScannedItemsHistory] = useState<any[]>([]);
  const [showBulkCategorySelect, setShowBulkCategorySelect] = useState(false);
  const [bulkSelectedCategory, setBulkSelectedCategory] = useState("");

  // States for drawer warehouse custom adjustments
  const [adjustWhId, setAdjustWhId] = useState("");
  const [adjustQtyDiff, setAdjustQtyDiff] = useState("");
  const [adjustReason, setAdjustReason] = useState("جرد تسوية مباشر من لوحة التحكم");

  // Drag and drop image upload simulation
  const [productImages, setProductImages] = useState<string[]>([]);
  const [primaryImageIdx, setPrimaryImageIdx] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatNameEn, setNewCatNameEn] = useState("");
  const [newCatParent, setNewCatParent] = useState("");
  const [newCatColor, setNewCatColor] = useState("#10b981");

  // New Brand State
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandCountry, setNewBrandCountry] = useState("المملكة العربية السعودية");
  const [newBrandWebsite, setNewBrandWebsite] = useState("");

  // New Unit State
  const [newUnitName, setNewUnitName] = useState("");
  const [newUnitAbbr, setNewUnitAbbr] = useState("");
  const [newUnitConversionFactor, setNewUnitConversionFactor] = useState("");
  const [newUnitConversionTarget, setNewUnitConversionTarget] = useState("");

  // Expanded Add Product Form States
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [sellPrice, setSellPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [taxRate, setTaxRate] = useState("15");
  const [prodType, setProdType] = useState("Physical");
  const [status, setStatus] = useState("Active");
  const [itemCategory, setItemCategory] = useState("");
  const [itemBrand, setItemBrand] = useState("");
  const [itemUnit, setItemUnit] = useState("unit-1");
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [supplier, setSupplier] = useState("");

  // Variants Generator State
  const [hasVariants, setHasVariants] = useState(false);
  const [variantAttr1, setVariantAttr1] = useState("اللون (Color)");
  const [variantVals1, setVariantVals1] = useState("أسود, أبيض, بني");
  const [variantAttr2, setVariantAttr2] = useState("المقاس (Size)");
  const [variantVals2, setVariantVals2] = useState("كبير, متوسط");
  const [generatedVariants, setGeneratedVariants] = useState<any[]>([]);

  // CSV Import State
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  // Auto-generate SKU & Barcode based on standard rules
  const generateSkuAndBarcode = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedSku = `MDJ-${randomNum}`;
    const generatedBarcode = `628${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    setSku(generatedSku);
    setBarcode(generatedBarcode);
    toast.info("تم توليد رمز SKU وباركود EAN-13 معتمد تلقائياً");
  };

  // Generate Variant combinations
  const handleGenerateVariants = () => {
    const list1 = variantVals1
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    const list2 = variantVals2
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    if (list1.length === 0) {
      toast.error("يرجى إدخال قيم للخاصية الأولى على الأقل");
      return;
    }

    const combos: any[] = [];

    if (list2.length === 0) {
      list1.forEach((val1, idx) => {
        combos.push({
          id: `var-${idx}-${Math.random()}`,
          name: `${val1}`,
          sku: `${sku}-${val1.substring(0, 3).toUpperCase()}`,
          barcode: `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
          cost: costPrice || "0",
          price: sellPrice || "0",
          stock: 0,
        });
      });
    } else {
      let counter = 0;
      list1.forEach((val1) => {
        list2.forEach((val2) => {
          combos.push({
            id: `var-${counter++}-${Math.random()}`,
            name: `${val1} / ${val2}`,
            sku: `${sku}-${val1.substring(0, 2).toUpperCase()}-${val2.substring(0, 2).toUpperCase()}`,
            barcode: `628${Math.floor(1000000000 + Math.random() * 9000000000)}`,
            cost: costPrice || "0",
            price: sellPrice || "0",
            stock: 0,
          });
        });
      });
    }

    setGeneratedVariants(combos);
    toast.success(`تم توليد ${combos.length} تركيبة من المتغيرات بنجاح!`);
  };

  // Image upload simulator
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const urls: string[] = [];
      Array.from(e.target.files).forEach((file) => {
        const url = URL.createObjectURL(file);
        urls.push(url);
      });
      setProductImages((prev) => [...prev, ...urls]);
      toast.success("تم رفع الصور بنجاح وضغطها تلقائياً");
    }
  };

  const handleCreateProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !sku) {
      toast.error("يرجى إدخال اسم الصنف والـ SKU");
      return;
    }

    const costHalalas = Math.round(Number(costPrice) * 100) || 0;
    const saleHalalas = Math.round(Number(sellPrice) * 100) || 0;
    const wholesaleHalalas = Math.round(Number(wholesalePrice) * 100) || 0;
    const minHalalas = Math.round(Number(minPrice) * 100) || 0;

    // Prep warehouse quantities map
    const quantitiesMap: Record<string, number> = {};
    warehouses.forEach((w) => {
      quantitiesMap[w.id] = 0;
    });

    const newProduct = {
      nameAr,
      nameEn: nameEn || nameAr,
      sku,
      barcode: barcode || `BAR-${sku}`,
      description,
      type: "raw", // compatibility field for original code logic
      productType: prodType, // Detailed physical/service/bundle/variant type
      status,
      category: itemCategory,
      brand: itemBrand,
      unit: itemUnit,
      weight: Number(weight) || 0,
      dimensions,
      costPriceHalalas: costHalalas,
      salePriceHalalas: saleHalalas,
      wholesalePriceHalalas: wholesaleHalalas,
      minPriceHalalas: minHalalas,
      taxPercent: Number(taxRate) || 15,
      supplier,
      warehouseQuantities: quantitiesMap,
      variants: hasVariants ? generatedVariants : null,
      images:
        productImages.length > 0
          ? productImages
          : [
              "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200&auto=format&fit=crop",
            ],
      primaryImageIdx,
      createdAt: new Date().toISOString(),
    };

    try {
      await onAddProduct(newProduct);
      setShowAddForm(false);
      resetForm();
    } catch (err: any) {
      toast.error("حدث خطأ أثناء حفظ المنتج");
    }
  };

  const resetForm = () => {
    setNameAr("");
    setNameEn("");
    setSku("");
    setBarcode("");
    setDescription("");
    setCostPrice("");
    setSellPrice("");
    setWholesalePrice("");
    setMinPrice("");
    setProductImages([]);
    setGeneratedVariants([]);
    setHasVariants(false);
  };

  // Filtering products
  const filteredProducts = useMemo(() => {
    return items.filter((prod) => {
      const matchSearch =
        prod.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.nameEn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.supplier?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === "all" || prod.status === statusFilter;
      const matchType = typeFilter === "all" || prod.productType === typeFilter;
      const matchCat = categoryFilter === "all" || prod.category === categoryFilter;

      return matchSearch && matchStatus && matchType && matchCat;
    });
  }, [items, searchQuery, statusFilter, typeFilter, categoryFilter]);

  // Web Audio beep simulator
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(950, audioCtx.currentTime); // High pitch for professional beep
      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      console.error("Web Audio Beep failed:", e);
    }
  };

  // Barcode / Keyboard scanner detection
  useEffect(() => {
    if (!isScannerListening) return;

    let buffer = "";
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;

      const currentTime = Date.now();
      const timeDiff = currentTime - lastKeyTime;
      lastKeyTime = currentTime;

      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA");

      if (e.key === "Enter") {
        if (buffer.length >= 3) {
          e.preventDefault();
          processBarcode(buffer);
          buffer = "";
        } else {
          buffer = "";
        }
        return;
      }

      if (e.key.length === 1) {
        if (isInputFocused && timeDiff > 60 && buffer.length === 0) {
          buffer = "";
          return;
        }

        if (timeDiff < 55 || !isInputFocused) {
          buffer += e.key;
        } else {
          buffer = e.key;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isScannerListening, items, scannerMode]);

  const processBarcode = (scannedCode: string) => {
    const code = scannedCode.trim();
    if (!code) return;

    const matchedProduct = items.find(
      (prod) =>
        prod.sku?.toLowerCase() === code.toLowerCase() ||
        prod.barcode?.toLowerCase() === code.toLowerCase()
    );

    if (matchedProduct) {
      playBeep();
      setScannedItemsHistory((prev) => [
        {
          code,
          product: matchedProduct,
          time: new Date().toLocaleTimeString("ar-SA"),
          success: true,
        },
        ...prev.slice(0, 4),
      ]);
      toast.success(`تم مسح الباركود بنجاح: ${matchedProduct.nameAr} (${matchedProduct.sku}) 🏷️`);

      if (scannerMode === "search") {
        setSelectedProductForDrawer(matchedProduct);
        setDrawerActiveTab("details");
      } else if (scannerMode === "adjust") {
        setSelectedProductForDrawer(matchedProduct);
        setDrawerActiveTab("stock");
      } else if (scannerMode === "receive") {
        setSelectedProductForDrawer(matchedProduct);
        setDrawerActiveTab("stock");
        toast.info("تم فتح تفاصيل المخزون للتوريد المباشر");
      }
    } else {
      setScannedItemsHistory((prev) => [
        { code, product: null, time: new Date().toLocaleTimeString("ar-SA"), success: false },
        ...prev.slice(0, 4),
      ]);
      toast.error(`الباركود الممسوح غير مسجل: "${code}"`, {
        description: "تأكد من إدراج هذا الباركود لمنتج مخزني.",
      });
    }
  };

  // Subscribe to audit logs for the selected product in drawer
  useEffect(() => {
    if (!selectedProductForDrawer) {
      setDrawerAuditLogs([]);
      return;
    }

    // Subscribe or query the audit logs matching product sku or product id
    const q = query(
      collection(db, "audit_logs"),
      where("itemId", "==", selectedProductForDrawer.id)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as any[];
        // Sort client-side by timestamp in desc order
        logs.sort((a, b) => {
          const timeA = a.timestamp?.seconds
            ? a.timestamp.seconds * 1000
            : new Date(a.date || a.timestamp || 0).getTime();
          const timeB = b.timestamp?.seconds
            ? b.timestamp.seconds * 1000
            : new Date(b.date || b.timestamp || 0).getTime();
          return timeB - timeA;
        });
        setDrawerAuditLogs(logs);
      },
      (error) => {
        console.error("Error loading drawer audit logs:", error);
      }
    );

    return () => unsubscribe();
  }, [selectedProductForDrawer]);

  // Bulk actions handlers
  const handleBulkArchive = () => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach((id) => {
      if (onUpdateProduct) onUpdateProduct(id, { status: "Archived" });
    });
    setSelectedItems([]);
    toast.success(`تم أرشفة ${selectedItems.length} صنف بنجاح 🗄️`);
  };

  const handleBulkChangePrice = () => {
    if (selectedItems.length === 0) return;
    const extraPrice = window.prompt("أدخل قيمة الزيادة المطلوبة لأسعار البيع (ر.س):", "10");
    if (extraPrice === null || isNaN(Number(extraPrice))) return;

    selectedItems.forEach((id) => {
      const prod = items.find((i) => i.id === id);
      if (prod && onUpdateProduct) {
        const curSale = prod.salePriceHalalas || 0;
        const newSale = curSale + Math.round(Number(extraPrice) * 100);
        onUpdateProduct(id, { salePriceHalalas: newSale });
      }
    });
    setSelectedItems([]);
    toast.success("تم تحديث أسعار الأصناف المحددة بنجاح");
  };

  const handleBulkChangeCategory = (categoryId: string) => {
    if (selectedItems.length === 0) return;
    selectedItems.forEach((id) => {
      if (onUpdateProduct) {
        onUpdateProduct(id, { category: categoryId });
      }
    });
    setSelectedItems([]);
    setShowBulkCategorySelect(false);
    toast.success(`تم نقل ${selectedItems.length} صنف إلى التصنيف المحدد بنجاح 📁`);
  };

  const handleBulkExportData = () => {
    const itemsToExport =
      selectedItems.length > 0
        ? items.filter((p) => selectedItems.includes(p.id))
        : filteredProducts;

    if (itemsToExport.length === 0) {
      toast.error("لا توجد أصناف لتصديرها");
      return;
    }

    // Generate CSV Content
    const headers = [
      "الرمز (SKU)",
      "الاسم بالعربية",
      "الاسم بالإنجليزية",
      "الباركود",
      "التصنيف",
      "الماركة",
      "سعر التكلفة (ريال)",
      "سعر البيع (ريال)",
      "المخزون الكلي",
    ];
    const rows = itemsToExport.map((p) => {
      const matchingCat = categories.find((c) => c.id === p.category)?.name || "غير مصنف";
      const matchingBrand = brands.find((b) => b.id === p.brand)?.name || "عام";
      const totalStock = Object.values(p.warehouseQuantities || {}).reduce(
        (a: any, b: any) => Number(a) + Number(b),
        0
      );
      return [
        p.sku || "",
        `"${(p.nameAr || "").replace(/"/g, '""')}"`,
        `"${(p.nameEn || "").replace(/"/g, '""')}"`,
        p.barcode || "",
        matchingCat,
        matchingBrand,
        ((p.costPriceHalalas || 0) / 100).toFixed(2),
        ((p.salePriceHalalas || 0) / 100).toFixed(2),
        totalStock,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `madarij_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`تم تصدير ${itemsToExport.length} صنف إلى ملف Excel/CSV بنجاح 📥`);
  };

  // Add category handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    const newCat = {
      id: `cat-${Date.now()}`,
      name: newCatName,
      nameEn: newCatNameEn || newCatName,
      parentId: newCatParent || null,
      color: newCatColor,
      icon: "📁",
    };
    setCategories([...categories, newCat]);
    setNewCatName("");
    setNewCatNameEn("");
    setNewCatParent("");
    toast.success("تمت إضافة الفئة الجديدة بنجاح 📁");
  };

  // Add brand handler
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName) return;
    const newBrand = {
      id: `brand-${Date.now()}`,
      name: newBrandName,
      country: newBrandCountry,
      website: newBrandWebsite,
      status: "Active",
    };
    setBrands([...brands, newBrand]);
    setNewBrandName("");
    setNewBrandWebsite("");
    toast.success("تم تسجيل العلامة التجارية بنجاح 🏅");
  };

  // Add unit conversion handler
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName || !newUnitAbbr) return;
    const conversions: any[] = [];
    if (newUnitConversionFactor && newUnitConversionTarget) {
      conversions.push({
        targetUnitId: newUnitConversionTarget,
        factor: Number(newUnitConversionFactor),
        targetName: units.find((u) => u.id === newUnitConversionTarget)?.name || "حبة",
      });
    }
    const newUnit = {
      id: `unit-${Date.now()}`,
      name: newUnitName,
      abbreviation: newUnitAbbr,
      type: "Count",
      conversions,
    };
    setUnits([...units, newUnit]);
    setNewUnitName("");
    setNewUnitAbbr("");
    setNewUnitConversionFactor("");
    setNewUnitConversionTarget("");
    toast.success("تم إدراج وحدة القياس المحدثة بنجاح ⚖️");
  };

  // Bulk label print action
  const handleBulkPrintLabels = () => {
    if (selectedItems.length === 0) {
      toast.error("يرجى اختيار أصناف لطباعة ملصقات الباركود الخاصة بها");
      return;
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Products Tab Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-2">
        <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl border border-zinc-200/50 dark:border-zinc-700">
          <button
            onClick={() => setSubTab("catalog")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${subTab === "catalog" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            📦 دليل الصنف العام ({items.length})
          </button>
          <button
            onClick={() => setSubTab("categories")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${subTab === "categories" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            📁 الفئات شجرية ({categories.length})
          </button>
          <button
            onClick={() => setSubTab("brands")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${subTab === "brands" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            🎖️ الماركات ({brands.length})
          </button>
          <button
            onClick={() => setSubTab("units")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${subTab === "units" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            ⚖️ وحدات القياس والتحويل
          </button>
          <button
            onClick={() => setSubTab("labels")}
            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer ${subTab === "labels" ? "bg-white dark:bg-zinc-900 text-indigo-600 shadow-sm" : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"}`}
          >
            🖨️ طباعة ملصقات الباركود ({selectedItems.length})
          </button>
        </div>

        {subTab === "catalog" && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة صنف متقدم
            </button>
          </div>
        )}
      </div>

      {/* --- SUBTAB 1: PRODUCTS CATALOG --- */}
      {subTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters Toolbar */}
          <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row gap-3 items-center justify-between shadow-sm">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، SKU، باركود، المورد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-bold outline-none text-zinc-800 dark:text-zinc-100"
              />
            </div>

            {/* Quick Filter dropdowns */}
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
              >
                <option value="all">كل الحالات (Status)</option>
                <option value="Active">نشط (Active)</option>
                <option value="Draft">مسودة (Draft)</option>
                <option value="Archived">مؤرشف (Archived)</option>
                <option value="Discontinued">موقوف (Discontinued)</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
              >
                <option value="all">نوع المنتج (Product Type)</option>
                <option value="Physical">مادي (Physical)</option>
                <option value="Digital">رقمي (Digital)</option>
                <option value="Service">خدمة (Service)</option>
                <option value="Raw Material">مادة خام</option>
                <option value="Finished Good">منتج تام الصنع</option>
                <option value="Bundle">حزمة تجميعية (Bundle)</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-300 outline-none cursor-pointer"
              >
                <option value="all">كل الفئات (Category)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="border-r h-6 mx-1 border-zinc-200" />

              {/* View toggle */}
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg cursor-pointer ${viewMode === "list" ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600" : "text-zinc-400"}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg cursor-pointer ${viewMode === "grid" ? "bg-zinc-100 dark:bg-zinc-800 text-indigo-600" : "text-zinc-400"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Integrated Barcode Assistant Card */}
          <div className="bg-gradient-to-r from-zinc-900 to-indigo-950 text-white p-5 rounded-3xl border border-zinc-800 shadow-xl flex flex-col md:flex-row gap-5 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 animate-pulse">
                <Barcode className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-zinc-100">
                    مساعد الباركود الذكي (Barcode Assistant)
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 ${isScannerListening ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-500/20 text-zinc-400"}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isScannerListening ? "bg-emerald-400 animate-ping" : "bg-zinc-400"}`}
                    />
                    {isScannerListening ? "نشط ومستعد" : "متوقف"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">
                  يقوم النظام بالتقاط القارئ اليدوي تلقائياً. حدد وضعية المسح للتحكم بالمنتج بمجرد
                  توجيه الباركود.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Scanner mode select */}
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-zinc-400 font-bold">
                  وضعية الإجراء عند المسح:
                </label>
                <select
                  value={scannerMode}
                  onChange={(e) => setScannerMode(e.target.value as any)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs font-bold outline-none cursor-pointer"
                >
                  <option value="search">🔍 عرض وفتح بطاقة التفاصيل</option>
                  <option value="adjust">⚖️ انتقال مباشر لتسوية المخزون</option>
                  <option value="receive">📦 عملية استلام مخزني فوري</option>
                </select>
              </div>

              {/* Manual/Simulated Scanner Input */}
              <div className="flex flex-col gap-1 flex-1 md:flex-none">
                <label className="text-[9px] text-zinc-400 font-bold">
                  محاكاة مسح يدوية (للتجربة بدون قارئ):
                </label>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const inputEl = e.currentTarget.elements.namedItem(
                      "simulatedBarcode"
                    ) as HTMLInputElement;
                    if (inputEl.value) {
                      processBarcode(inputEl.value);
                      inputEl.value = "";
                    }
                  }}
                  className="flex gap-1.5"
                >
                  <input
                    type="text"
                    name="simulatedBarcode"
                    placeholder="مثال: TAB-101 أو CHR-202"
                    className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs font-mono outline-none placeholder:text-zinc-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all"
                  >
                    مسح 🏷️
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Last Scanned History Overlay */}
          {scannedItemsHistory.length > 0 && (
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wide shrink-0">
                آخر الممسوحات:
              </span>
              <div className="flex gap-2">
                {scannedItemsHistory.map((h, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (h.product) {
                        setSelectedProductForDrawer(h.product);
                        setDrawerActiveTab("details");
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl border flex items-center gap-1.5 text-[10px] transition-all hover:-translate-y-0.5 ${h.success ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 text-emerald-800 dark:text-emerald-400" : "bg-red-50 dark:bg-red-950/20 border-red-200 text-red-800 dark:text-red-400"}`}
                  >
                    <span>{h.code}</span>
                    {h.product && (
                      <span className="text-zinc-400 font-normal">| {h.product.nameAr}</span>
                    )}
                    <span className="text-[8px] opacity-60 font-mono font-normal">({h.time})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive TanStack Table View */}
          {viewMode === "list" ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 font-bold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
                      <th className="p-4 w-10 text-center checkbox-cell">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length === filteredProducts.length &&
                            filteredProducts.length > 0
                          }
                          onChange={(e) => {
                            if (e.target.checked)
                              setSelectedItems(filteredProducts.map((p) => p.id));
                            else setSelectedItems([]);
                          }}
                          className="rounded"
                        />
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => {
                          const isSorted = sorting[0]?.id === "nameAr" && !sorting[0]?.desc;
                          setSorting([{ id: "nameAr", desc: isSorted }]);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>الصنف والمواصفات</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => {
                          const isSorted = sorting[0]?.id === "sku" && !sorting[0]?.desc;
                          setSorting([{ id: "sku", desc: isSorted }]);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>رمز SKU / باركود</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </div>
                      </th>
                      <th className="p-4">التصنيف والماركة</th>
                      <th
                        className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => {
                          const isSorted =
                            sorting[0]?.id === "costPriceHalalas" && !sorting[0]?.desc;
                          setSorting([{ id: "costPriceHalalas", desc: isSorted }]);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>سعر التكلفة (انقر مرتين للتعديل)</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => {
                          const isSorted =
                            sorting[0]?.id === "salePriceHalalas" && !sorting[0]?.desc;
                          setSorting([{ id: "salePriceHalalas", desc: isSorted }]);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>سعر البيع الأساسي (نقرتين للتعديل)</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </div>
                      </th>
                      <th
                        className="p-4 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        onClick={() => {
                          const isSorted = sorting[0]?.id === "totalStock" && !sorting[0]?.desc;
                          setSorting([{ id: "totalStock", desc: isSorted }]);
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <span>مؤشر المخزون الكلي vs رصيد الأمان</span>
                          <ChevronDown className="w-3 h-3 text-zinc-400" />
                        </div>
                      </th>
                      <th className="p-4">الحالة والنوع</th>
                      <th className="p-4 text-center actions-cell">الخيارات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-zinc-400 font-bold">
                          لا توجد أصناف تطابق فلاتر البحث الحالية. يمكنك إضافة صنف جديد متقدم أو
                          تعديل البحث.
                        </td>
                      </tr>
                    ) : (
                      (() => {
                        // Implement sorting manually based on sorting state
                        let displayProducts = [...filteredProducts];
                        if (sorting.length > 0) {
                          const { id, desc } = sorting[0];
                          displayProducts.sort((a, b) => {
                            let valA = a[id];
                            let valB = b[id];
                            if (id === "totalStock") {
                              valA = Object.values(a.warehouseQuantities || {}).reduce(
                                (x: any, y: any) => Number(x) + Number(y),
                                0
                              );
                              valB = Object.values(b.warehouseQuantities || {}).reduce(
                                (x: any, y: any) => Number(x) + Number(y),
                                0
                              );
                            }
                            if (typeof valA === "string") {
                              return desc ? valB.localeCompare(valA) : valA.localeCompare(valB);
                            }
                            return desc
                              ? Number(valB || 0) - Number(valA || 0)
                              : Number(valA || 0) - Number(valB || 0);
                          });
                        }

                        // Implement Pagination
                        const totalCount = displayProducts.length;
                        const totalPages = Math.ceil(totalCount / pagination.pageSize);
                        const startIndex = pagination.pageIndex * pagination.pageSize;
                        const paginatedProducts = displayProducts.slice(
                          startIndex,
                          startIndex + pagination.pageSize
                        );

                        return paginatedProducts.map((prod) => {
                          const totalStock = Object.values(prod.warehouseQuantities || {}).reduce(
                            (a: any, b: any) => Number(a) + Number(b),
                            0
                          ) as number;
                          const reorderPoint = Number(prod.minStock) || 15;

                          // Determine stock health
                          let health: "critical" | "low" | "healthy" = "healthy";
                          let healthLabel = "سليم (Healthy)";
                          let barColor = "bg-emerald-500";
                          let badgeBg =
                            "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30";

                          if (totalStock === 0 || totalStock <= reorderPoint * 0.3) {
                            health = "critical";
                            healthLabel = "حرِج (Critical)";
                            barColor = "bg-rose-500 animate-pulse";
                            badgeBg =
                              "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30";
                          } else if (totalStock <= reorderPoint) {
                            health = "low";
                            healthLabel = "منخفض (Low)";
                            barColor = "bg-amber-500";
                            badgeBg =
                              "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30";
                          }

                          // Calculate progress ratio (max cap at 100%)
                          const maxTarget = Number(prod.maxStock) || reorderPoint * 2.5;
                          const stockRatio = Math.min(
                            100,
                            Math.round((totalStock / maxTarget) * 100)
                          );

                          const statusColors: Record<string, string> = {
                            Active:
                              "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100",
                            Draft:
                              "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200",
                            Archived:
                              "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100",
                            Discontinued:
                              "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100",
                          };

                          const matchingCat = categories.find((c) => c.id === prod.category);
                          const matchingBrand = brands.find((b) => b.id === prod.brand);

                          return (
                            <tr
                              key={prod.id}
                              onClick={(e) => handleRowClick(e, prod)}
                              className="border-b border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-all cursor-pointer"
                            >
                              <td className="p-4 text-center checkbox-cell">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.includes(prod.id)}
                                  onChange={(e) => {
                                    if (e.target.checked)
                                      setSelectedItems([...selectedItems, prod.id]);
                                    else
                                      setSelectedItems(
                                        selectedItems.filter((id) => id !== prod.id)
                                      );
                                  }}
                                  className="rounded"
                                />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      prod.images?.[0] ||
                                      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200"
                                    }
                                    alt={prod.nameAr}
                                    referrerPolicy="no-referrer"
                                    className="w-10 h-10 object-cover rounded-xl border border-zinc-100 dark:border-zinc-800 shrink-0"
                                  />
                                  <div>
                                    <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                                      {prod.nameAr}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono block">
                                      {prod.nameEn}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-mono">
                                <span className="block font-bold text-zinc-700 dark:text-zinc-300">
                                  {prod.sku}
                                </span>
                                <span className="text-[10px] text-zinc-400 block">
                                  {prod.barcode}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="block text-zinc-700 dark:text-zinc-300">
                                  {matchingCat ? matchingCat.name : "غير مصنف"}
                                </span>
                                <span className="text-[10px] text-zinc-400 block">
                                  {matchingBrand ? matchingBrand.name : "عام"}
                                </span>
                              </td>

                              {/* Cost Price with Inline Editing */}
                              <td
                                className="p-4 font-mono text-zinc-700 dark:text-zinc-300"
                                onDoubleClick={() => {
                                  setEditingCell({ productId: prod.id, field: "costPriceHalalas" });
                                  setEditingCellValue(
                                    ((prod.costPriceHalalas || 0) / 100).toFixed(2)
                                  );
                                }}
                              >
                                {editingCell?.productId === prod.id &&
                                editingCell?.field === "costPriceHalalas" ? (
                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={editingCellValue}
                                      onChange={(e) => setEditingCellValue(e.target.value)}
                                      onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                          const num = parseFloat(editingCellValue);
                                          if (!isNaN(num) && onUpdateProduct) {
                                            const halalas = Math.round(num * 100);
                                            onUpdateProduct(prod.id, { costPriceHalalas: halalas });
                                            // Write audit log
                                            await addDoc(collection(db, "audit_logs"), {
                                              itemId: prod.id,
                                              sku: prod.sku,
                                              action: "تعديل سعر التكلفة",
                                              details: `تعديل سعر التكلفة للمنتج من الجدول مباشرة إلى ${num} ر.س`,
                                              timestamp: serverTimestamp(),
                                            });
                                            toast.success("تم تحديث سعر التكلفة بنجاح");
                                          }
                                          setEditingCell(null);
                                        }
                                      }}
                                      className="w-16 p-1 border border-indigo-500 rounded bg-white text-black text-xs text-center"
                                      autoFocus
                                    />
                                    <button
                                      onClick={async () => {
                                        const num = parseFloat(editingCellValue);
                                        if (!isNaN(num) && onUpdateProduct) {
                                          const halalas = Math.round(num * 100);
                                          onUpdateProduct(prod.id, { costPriceHalalas: halalas });
                                          await addDoc(collection(db, "audit_logs"), {
                                            itemId: prod.id,
                                            sku: prod.sku,
                                            action: "تعديل سعر التكلفة",
                                            details: `تعديل سعر التكلفة للمنتج من الجدول مباشرة إلى ${num} ر.س`,
                                            timestamp: serverTimestamp(),
                                          });
                                          toast.success("تم تحديث سعر التكلفة");
                                        }
                                        setEditingCell(null);
                                      }}
                                      className="p-1 bg-emerald-500 text-white rounded text-[10px]"
                                    >
                                      ✓
                                    </button>
                                  </div>
                                ) : (
                                  <span className="cursor-edit border-b border-dashed border-zinc-300 hover:border-zinc-800 transition-colors">
                                    {((prod.costPriceHalalas || 0) / 100).toFixed(2)} ر.س
                                  </span>
                                )}
                              </td>

                              {/* Sale Price with Inline Editing */}
                              <td
                                className="p-4 font-mono text-indigo-600 dark:text-indigo-400 font-black"
                                onDoubleClick={() => {
                                  setEditingCell({ productId: prod.id, field: "salePriceHalalas" });
                                  setEditingCellValue(
                                    ((prod.salePriceHalalas || 0) / 100).toFixed(2)
                                  );
                                }}
                              >
                                {editingCell?.productId === prod.id &&
                                editingCell?.field === "salePriceHalalas" ? (
                                  <div
                                    className="flex items-center gap-1"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      type="text"
                                      value={editingCellValue}
                                      onChange={(e) => setEditingCellValue(e.target.value)}
                                      onKeyDown={async (e) => {
                                        if (e.key === "Enter") {
                                          const num = parseFloat(editingCellValue);
                                          if (!isNaN(num) && onUpdateProduct) {
                                            const halalas = Math.round(num * 100);
                                            onUpdateProduct(prod.id, { salePriceHalalas: halalas });
                                            // Write audit log
                                            await addDoc(collection(db, "audit_logs"), {
                                              itemId: prod.id,
                                              sku: prod.sku,
                                              action: "تعديل سعر البيع",
                                              details: `تعديل سعر البيع للمنتج من الجدول مباشرة إلى ${num} ر.س`,
                                              timestamp: serverTimestamp(),
                                            });
                                            toast.success("تم تحديث سعر البيع بنجاح");
                                          }
                                          setEditingCell(null);
                                        }
                                      }}
                                      className="w-16 p-1 border border-indigo-500 rounded bg-white text-black text-xs text-center"
                                      autoFocus
                                    />
                                    <button
                                      onClick={async () => {
                                        const num = parseFloat(editingCellValue);
                                        if (!isNaN(num) && onUpdateProduct) {
                                          const halalas = Math.round(num * 100);
                                          onUpdateProduct(prod.id, { salePriceHalalas: halalas });
                                          await addDoc(collection(db, "audit_logs"), {
                                            itemId: prod.id,
                                            sku: prod.sku,
                                            action: "تعديل سعر البيع",
                                            details: `تعديل سعر البيع للمنتج من الجدول مباشرة إلى ${num} ر.س`,
                                            timestamp: serverTimestamp(),
                                          });
                                          toast.success("تم تحديث سعر البيع");
                                        }
                                        setEditingCell(null);
                                      }}
                                      className="p-1 bg-emerald-500 text-white rounded text-[10px]"
                                    >
                                      ✓
                                    </button>
                                  </div>
                                ) : (
                                  <span className="cursor-edit border-b border-dashed border-indigo-300 hover:border-indigo-600 transition-colors">
                                    {((prod.salePriceHalalas || 0) / 100).toFixed(2)} ر.س
                                  </span>
                                )}
                              </td>

                              {/* Progress bar stock indicator */}
                              <td className="p-4 w-52">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[10px] font-bold">
                                    <span className="font-mono text-zinc-900 dark:text-zinc-100 font-black">
                                      {totalStock} / {maxTarget} حبة
                                    </span>
                                    <span
                                      className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${badgeBg}`}
                                    >
                                      {healthLabel}
                                    </span>
                                  </div>
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                                      style={{ width: `${stockRatio}%` }}
                                    />
                                  </div>
                                  <span className="block text-[8px] text-zinc-400">
                                    نقطة إعادة الطلب: {reorderPoint} حبة
                                  </span>
                                </div>
                              </td>

                              <td className="p-4 space-y-1">
                                <span
                                  className={`px-2 py-0.5 rounded-md text-[9px] font-black inline-block ${statusColors[prod.status || "Active"]}`}
                                >
                                  {prod.status || "Active"}
                                </span>
                                <span className="block text-[9px] text-zinc-400">
                                  {prod.productType || "Physical"}
                                </span>
                              </td>
                              <td className="p-4 text-center actions-cell">
                                <div
                                  className="flex items-center justify-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => setShowBarcodePrint(prod)}
                                    className="p-1.5 text-zinc-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    title="عرض وطباعة الملصق"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => onDeleteProduct(prod.id, prod.nameAr)}
                                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      })()
                    )}
                  </tbody>
                </table>
              </div>

              {/* TanStack-like Table Pagination Toolbar */}
              {filteredProducts.length > 0 && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span>عرض الأسطر لكل صفحة:</span>
                    <select
                      value={pagination.pageSize}
                      onChange={(e) =>
                        setPagination((prev) => ({
                          ...prev,
                          pageSize: Number(e.target.value),
                          pageIndex: 0,
                        }))
                      }
                      className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 rounded-xl outline-none"
                    >
                      <option value="10">10 أصناف</option>
                      <option value="25">25 صنف</option>
                      <option value="50">50 صنف</option>
                      <option value="100">100 صنف</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPagination((prev) => ({ ...prev, pageIndex: 0 }))}
                      disabled={pagination.pageIndex === 0}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl disabled:opacity-40"
                    >
                      الأولى
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: Math.max(0, prev.pageIndex - 1),
                        }))
                      }
                      disabled={pagination.pageIndex === 0}
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl disabled:opacity-40"
                    >
                      السابق
                    </button>
                    <span className="mx-2">
                      صفحة{" "}
                      <strong className="text-zinc-900 dark:text-white font-black">
                        {pagination.pageIndex + 1}
                      </strong>{" "}
                      من{" "}
                      <strong className="text-zinc-900 dark:text-white font-black">
                        {Math.ceil(filteredProducts.length / pagination.pageSize)}
                      </strong>
                    </span>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: Math.min(
                            Math.ceil(filteredProducts.length / prev.pageSize) - 1,
                            prev.pageIndex + 1
                          ),
                        }))
                      }
                      disabled={
                        pagination.pageIndex >=
                        Math.ceil(filteredProducts.length / pagination.pageSize) - 1
                      }
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl disabled:opacity-40"
                    >
                      التالي
                    </button>
                    <button
                      onClick={() =>
                        setPagination((prev) => ({
                          ...prev,
                          pageIndex: Math.ceil(filteredProducts.length / prev.pageSize) - 1,
                        }))
                      }
                      disabled={
                        pagination.pageIndex >=
                        Math.ceil(filteredProducts.length / pagination.pageSize) - 1
                      }
                      className="px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl disabled:opacity-40"
                    >
                      الأخيرة
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* GRID VIEW WITH REORDER BADGES */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const totalStock = Object.values(prod.warehouseQuantities || {}).reduce(
                  (a: any, b: any) => Number(a) + Number(b),
                  0
                ) as number;
                const reorderPoint = Number(prod.minStock) || 15;

                let healthLabel = "سليم (Healthy)";
                let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-100";
                if (totalStock === 0 || totalStock <= reorderPoint * 0.3) {
                  healthLabel = "حرِج (Critical)";
                  badgeClass = "bg-rose-50 text-rose-700 border-rose-100 animate-pulse";
                } else if (totalStock <= reorderPoint) {
                  healthLabel = "منخفض (Low)";
                  badgeClass = "bg-amber-50 text-amber-700 border-amber-100";
                }

                return (
                  <div
                    key={prod.id}
                    onClick={(e) => handleRowClick(e, prod)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-4 shadow-sm flex flex-col justify-between hover:border-indigo-500/30 hover:shadow-lg transition-all duration-300 cursor-pointer"
                  >
                    <div>
                      <div className="relative">
                        <img
                          src={
                            prod.images?.[0] ||
                            "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200"
                          }
                          alt={prod.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-full h-36 object-cover rounded-2xl border border-zinc-50 dark:border-zinc-800 mb-3"
                        />
                        <span className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-mono font-black px-2 py-0.5 rounded-lg">
                          {prod.sku}
                        </span>
                        <span
                          className={`absolute bottom-2 right-2 border text-[8px] font-black px-2 py-0.5 rounded-lg ${badgeClass}`}
                        >
                          {healthLabel}
                        </span>
                      </div>
                      <h4 className="font-black text-zinc-900 dark:text-zinc-100 text-xs mb-1 line-clamp-1">
                        {prod.nameAr}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-mono mb-2">{prod.nameEn}</p>

                      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-800/50 p-2.5 rounded-xl text-[10px] font-bold mb-3">
                        <div className="text-zinc-500">سعر البيع:</div>
                        <div className="text-indigo-600 dark:text-indigo-400 font-black font-mono">
                          {((prod.salePriceHalalas || 0) / 100).toFixed(2)} ر.س
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-black ${totalStock === 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        مخزون: {totalStock} (الحد: {reorderPoint})
                      </span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setShowBarcodePrint(prod)}
                          className="p-1.5 bg-zinc-100 hover:bg-indigo-100 text-zinc-600 hover:text-indigo-600 rounded-lg transition-colors"
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod.id, prod.nameAr)}
                          className="p-1.5 bg-zinc-100 hover:bg-red-100 text-zinc-600 hover:text-red-500 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating Sticky Glassmorphic Bulk Action Toolbar */}
          <AnimatePresence>
            {selectedItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] w-full max-w-2xl px-4"
              >
                <div className="bg-zinc-950/90 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-4 rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full animate-ping shrink-0" />
                    <div>
                      <span className="text-xs font-black block">إجراءات التحكم الجماعية</span>
                      <span className="text-[10px] text-zinc-400">
                        تم تظليل {selectedItems.length} منتجات من الكتالوج الحالي
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    {/* Change Category Inline Select Trigger */}
                    {showBulkCategorySelect ? (
                      <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
                        <select
                          value={bulkSelectedCategory}
                          onChange={(e) => setBulkSelectedCategory(e.target.value)}
                          className="bg-transparent text-white text-[10px] px-2 outline-none font-bold"
                        >
                          <option value="">-- اختر التصنيف المخزني --</option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.id} className="text-zinc-900">
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => {
                            if (bulkSelectedCategory) {
                              handleBulkChangeCategory(bulkSelectedCategory);
                            }
                          }}
                          className="px-2 py-1 bg-indigo-600 text-[9px] font-black rounded-lg hover:bg-indigo-500"
                        >
                          تأكيد نقل
                        </button>
                        <button
                          onClick={() => setShowBulkCategorySelect(false)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowBulkCategorySelect(true)}
                        className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-indigo-400 text-[10px] font-black rounded-xl transition-all"
                      >
                        تغيير التصنيف جماعياً 📁
                      </button>
                    )}

                    <button
                      onClick={handleBulkChangePrice}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-[10px] font-black rounded-xl transition-all"
                    >
                      تعديل الأسعار جماعياً 💰
                    </button>

                    <button
                      onClick={handleBulkExportData}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-emerald-400 text-[10px] font-black rounded-xl transition-all"
                    >
                      تصدير البيانات (Excel/CSV) 📥
                    </button>

                    <button
                      onClick={handleBulkArchive}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-black rounded-xl transition-all"
                    >
                      أرشفة الأصناف جماعياً 🗄️
                    </button>

                    <button
                      onClick={() => setSelectedItems([])}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 hover:underline px-2"
                    >
                      إلغاء التحديد
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Right-Side Rich Product & Stock Detail Drawer */}
          <AnimatePresence>
            {selectedProductForDrawer && (
              <div className="fixed inset-0 z-[9999] overflow-hidden" dir="rtl">
                {/* Backdrop with elegant blur */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedProductForDrawer(null)}
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <div className="absolute inset-y-0 left-0 right-auto max-w-full flex">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 180 }}
                    className="w-screen max-w-2xl bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between"
                  >
                    {/* Drawer Header */}
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            selectedProductForDrawer.images?.[0] ||
                            "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=200"
                          }
                          alt={selectedProductForDrawer.nameAr}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-cover rounded-2xl border border-zinc-200 dark:border-zinc-700"
                        />
                        <div>
                          <h3 className="font-black text-sm text-zinc-900 dark:text-zinc-100">
                            {selectedProductForDrawer.nameAr}
                          </h3>
                          <span className="text-[10px] text-zinc-400 font-mono block">
                            SKU: {selectedProductForDrawer.sku} | Barcode:{" "}
                            {selectedProductForDrawer.barcode}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedProductForDrawer(null)}
                        className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Drawer Tabs Swapper */}
                    <div className="px-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/10 flex gap-4">
                      <button
                        onClick={() => setDrawerActiveTab("details")}
                        className={`py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${drawerActiveTab === "details" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                      >
                        <Info className="w-4 h-4" />
                        بطاقة تفاصيل المنتج
                      </button>
                      <button
                        onClick={() => setDrawerActiveTab("stock")}
                        className={`py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${drawerActiveTab === "stock" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                      >
                        <Layers className="w-4 h-4" />
                        مستويات ومخزون الفروع (
                        {
                          Object.values(selectedProductForDrawer.warehouseQuantities || {}).reduce(
                            (x: any, y: any) => Number(x) + Number(y),
                            0
                          ) as number
                        }
                        )
                      </button>
                      <button
                        onClick={() => setDrawerActiveTab("logs")}
                        className={`py-3 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${drawerActiveTab === "logs" ? "border-indigo-600 text-indigo-600" : "border-transparent text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                      >
                        <History className="w-4 h-4" />
                        سجل العمليات والتدقيق ({drawerAuditLogs.length})
                      </button>
                    </div>

                    {/* Drawer Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      {/* CARD DETAIL TAB */}
                      {drawerActiveTab === "details" && (
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const updatedFields = {
                              nameAr: formData.get("drawerNameAr") as string,
                              nameEn: formData.get("drawerNameEn") as string,
                              sku: formData.get("drawerSku") as string,
                              barcode: formData.get("drawerBarcode") as string,
                              costPriceHalalas: Math.round(
                                Number(formData.get("drawerCost")) * 100
                              ),
                              salePriceHalalas: Math.round(
                                Number(formData.get("drawerPrice")) * 100
                              ),
                              minStock: Number(formData.get("drawerMinStock")),
                              maxStock: Number(formData.get("drawerMaxStock")),
                              weight: Number(formData.get("drawerWeight")),
                              supplier: formData.get("drawerSupplier") as string,
                              description: formData.get("drawerDescription") as string,
                              category: formData.get("drawerCategory") as string,
                              brand: formData.get("drawerBrand") as string,
                              status: formData.get("drawerStatus") as string,
                            };

                            if (onUpdateProduct) {
                              onUpdateProduct(selectedProductForDrawer.id, updatedFields);
                              // Add audit log
                              await addDoc(collection(db, "audit_logs"), {
                                itemId: selectedProductForDrawer.id,
                                sku: selectedProductForDrawer.sku,
                                action: "تحديث بطاقة المنتج",
                                details: `تم تحديث حقول تفاصيل المنتج بنجاح من لوحة التحكم التفاعلية الجانبية.`,
                                timestamp: serverTimestamp(),
                              });
                              toast.success("تم حفظ تفاصيل المنتج والخصائص بنجاح 💾");
                              // Update selected state client side
                              setSelectedProductForDrawer({
                                ...selectedProductForDrawer,
                                ...updatedFields,
                              });
                            }
                          }}
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-400 mb-1">الاسم بالعربية</label>
                              <input
                                type="text"
                                name="drawerNameAr"
                                defaultValue={selectedProductForDrawer.nameAr}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">الاسم بالإنجليزية</label>
                              <input
                                type="text"
                                name="drawerNameEn"
                                defaultValue={selectedProductForDrawer.nameEn}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-400 mb-1">
                                رمز SKU (الرقم المرجعي)
                              </label>
                              <input
                                type="text"
                                name="drawerSku"
                                defaultValue={selectedProductForDrawer.sku}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">الباركود (EAN-13)</label>
                              <input
                                type="text"
                                name="drawerBarcode"
                                defaultValue={selectedProductForDrawer.barcode}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-zinc-400 mb-1">سعر التكلفة (ريال)</label>
                              <input
                                type="number"
                                step="0.01"
                                name="drawerCost"
                                defaultValue={(
                                  (selectedProductForDrawer.costPriceHalalas || 0) / 100
                                ).toFixed(2)}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">
                                سعر البيع الأساسي (ريال)
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                name="drawerPrice"
                                defaultValue={(
                                  (selectedProductForDrawer.salePriceHalalas || 0) / 100
                                ).toFixed(2)}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-zinc-400 mb-1">
                                حد إعادة الطلب (Min)
                              </label>
                              <input
                                type="number"
                                name="drawerMinStock"
                                defaultValue={selectedProductForDrawer.minStock || 15}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">
                                الرصيد الأقصى (Max)
                              </label>
                              <input
                                type="number"
                                name="drawerMaxStock"
                                defaultValue={selectedProductForDrawer.maxStock || 100}
                                required
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">الوزن (كجم)</label>
                              <input
                                type="number"
                                name="drawerWeight"
                                defaultValue={selectedProductForDrawer.weight || 0}
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-zinc-400 mb-1">التصنيف</label>
                              <select
                                name="drawerCategory"
                                defaultValue={selectedProductForDrawer.category}
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              >
                                <option value="">بدون تصنيف</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">العلامة التجارية</label>
                              <select
                                name="drawerBrand"
                                defaultValue={selectedProductForDrawer.brand}
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              >
                                <option value="">بدون ماركة</option>
                                {brands.map((b) => (
                                  <option key={b.id} value={b.id}>
                                    {b.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-zinc-400 mb-1">الحالة التشغيلية</label>
                              <select
                                name="drawerStatus"
                                defaultValue={selectedProductForDrawer.status || "Active"}
                                className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              >
                                <option value="Active">نشط (Active)</option>
                                <option value="Draft">مسودة (Draft)</option>
                                <option value="Archived">مؤرشف (Archived)</option>
                                <option value="Discontinued">موقوف (Discontinued)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-400 mb-1">المورد المفضل</label>
                            <input
                              type="text"
                              name="drawerSupplier"
                              defaultValue={selectedProductForDrawer.supplier}
                              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-400 mb-1">وصف الصنف التفصيلي</label>
                            <textarea
                              name="drawerDescription"
                              defaultValue={selectedProductForDrawer.description}
                              rows={3}
                              className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none resize-none"
                            />
                          </div>

                          <div className="flex justify-end pt-3">
                            <button
                              type="submit"
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              حفظ تعديلات الصنف والمواصفات 💾
                            </button>
                          </div>
                        </form>
                      )}

                      {/* WAREHOUSE INVENTORY LEVEL TAB WITH INLINE DIRECT ADJUSTMENTS */}
                      {drawerActiveTab === "stock" && (
                        <div className="space-y-6">
                          <div className="bg-zinc-50 dark:bg-zinc-800/30 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 space-y-3">
                            <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 border-b pb-2">
                              <Layers className="w-4 h-4 text-indigo-600" />
                              مستويات الكمية الحالية في المستودعات
                            </h4>
                            <div className="space-y-3">
                              {warehouses.map((wh) => {
                                const qty =
                                  selectedProductForDrawer.warehouseQuantities?.[wh.id] || 0;
                                return (
                                  <div
                                    key={wh.id}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-zinc-900 border rounded-xl shadow-sm text-xs"
                                  >
                                    <div>
                                      <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                                        {wh.name}
                                      </span>
                                      <span className="text-[10px] text-zinc-400 font-mono block">
                                        الرمز المرجعي: {wh.id} | الموقع: {wh.location || "السعودية"}
                                      </span>
                                    </div>
                                    <div className="text-left font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
                                      {qty} حبة
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic Instant stock adjustment tool */}
                          <div className="bg-indigo-50/50 dark:bg-indigo-950/10 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 space-y-4">
                            <h4 className="font-black text-xs text-indigo-900 dark:text-indigo-400 flex items-center gap-1.5">
                              <RefreshCw
                                className="w-4 h-4 text-indigo-600 animate-spin"
                                style={{ animationDuration: "4s" }}
                              />
                              أداة التسوية والتوريد المباشر (Adjustment & Receive Engine)
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-zinc-500 text-[10px] mb-1">
                                  المستودع المستهدف
                                </label>
                                <select
                                  value={adjustWhId}
                                  onChange={(e) => setAdjustWhId(e.target.value)}
                                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                                >
                                  <option value="">-- اختر مستودع --</option>
                                  {warehouses.map((wh) => (
                                    <option key={wh.id} value={wh.id}>
                                      {wh.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-zinc-500 text-[10px] mb-1">
                                  التغيير (مثال: 10 أو -5)
                                </label>
                                <input
                                  type="number"
                                  placeholder="فارق الكمية..."
                                  value={adjustQtyDiff}
                                  onChange={(e) => setAdjustQtyDiff(e.target.value)}
                                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-zinc-500 text-[10px] mb-1">
                                السبب أو رقم مستند الحركة
                              </label>
                              <input
                                type="text"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                placeholder="مثال: تسوية جرد ربع سنوي، استلام طلب شراء..."
                                className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                              />
                            </div>

                            <button
                              onClick={async () => {
                                if (!adjustWhId) {
                                  toast.error("يرجى اختيار المستودع المستهدف أولاً");
                                  return;
                                }
                                const diff = Number(adjustQtyDiff);
                                if (isNaN(diff) || diff === 0) {
                                  toast.error("يرجى إدخال فارق كمية صالح وغير صفري");
                                  return;
                                }

                                const whObj = warehouses.find((w) => w.id === adjustWhId);
                                const currentQty = Number(
                                  selectedProductForDrawer.warehouseQuantities?.[adjustWhId] || 0
                                );
                                const newQty = Math.max(0, currentQty + diff);

                                const updatedQuantities = {
                                  ...(selectedProductForDrawer.warehouseQuantities || {}),
                                  [adjustWhId]: newQty,
                                };

                                if (onUpdateProduct) {
                                  onUpdateProduct(selectedProductForDrawer.id, {
                                    warehouseQuantities: updatedQuantities,
                                  });

                                  // Log to stock_adjustments in firestore
                                  await addDoc(collection(db, "stock_adjustments"), {
                                    itemId: selectedProductForDrawer.id,
                                    sku: selectedProductForDrawer.sku,
                                    itemNameAr: selectedProductForDrawer.nameAr,
                                    warehouseId: adjustWhId,
                                    warehouseName: whObj?.name || adjustWhId,
                                    oldQty: currentQty,
                                    newQty: newQty,
                                    difference: diff,
                                    reason: adjustReason,
                                    date: new Date().toISOString(),
                                  });

                                  // Log to audit_logs
                                  await addDoc(collection(db, "audit_logs"), {
                                    itemId: selectedProductForDrawer.id,
                                    sku: selectedProductForDrawer.sku,
                                    action: diff > 0 ? "توريد استلام مباشر" : "تسوية صرف مباشر",
                                    details: `تعديل مخزون المستودع (${whObj?.name || adjustWhId}) بمقدار ${diff > 0 ? "+" : ""}${diff}. الكمية من ${currentQty} إلى ${newQty}. السبب: ${adjustReason}`,
                                    timestamp: serverTimestamp(),
                                  });

                                  // Play beep sound effect
                                  playBeep();
                                  toast.success("تم تحديث المخزون وتسجيل الحركة بنجاح");

                                  // Update client-side selected state
                                  setSelectedProductForDrawer({
                                    ...selectedProductForDrawer,
                                    warehouseQuantities: updatedQuantities,
                                  });

                                  // Reset adjustment states
                                  setAdjustQtyDiff("");
                                }
                              }}
                              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              تنفيذ الحركة وتحديث مستودع التخزين ⚡
                            </button>
                          </div>
                        </div>
                      )}

                      {/* HISTORICAL AUDIT LOGS TAB */}
                      {drawerActiveTab === "logs" && (
                        <div className="space-y-4">
                          <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 border-b pb-2">
                            <History className="w-4 h-4 text-indigo-600" />
                            تاريخ تدقيق التعديلات والحركات المخزنية
                          </h4>

                          {drawerAuditLogs.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800/10 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                              لا توجد سجلات تدقيق سابقة للمنتج {selectedProductForDrawer.sku}. سيتم
                              تسجيل التعديلات والتسويات هنا تلقائياً.
                            </div>
                          ) : (
                            <div className="relative border-r-2 border-indigo-200 dark:border-indigo-900 pr-4 space-y-4">
                              {drawerAuditLogs.map((log) => {
                                const logDate = log.timestamp?.seconds
                                  ? new Date(log.timestamp.seconds * 1000)
                                  : new Date(log.date || 0);

                                return (
                                  <div key={log.id} className="relative text-xs">
                                    {/* Timeline bullet */}
                                    <div className="absolute right-[-21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border border-white dark:border-zinc-900" />

                                    <div className="bg-zinc-50 dark:bg-zinc-800/30 p-3.5 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1 hover:shadow-md transition-all">
                                      <div className="flex items-center justify-between text-[10px]">
                                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-md font-black">
                                          {log.action}
                                        </span>
                                        <span className="font-mono text-zinc-400 flex items-center gap-1">
                                          <Calendar className="w-3 h-3" />
                                          {logDate.toLocaleDateString("ar-SA")} -{" "}
                                          {logDate.toLocaleTimeString("ar-SA", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-[11px] text-zinc-800 dark:text-zinc-200 font-bold leading-relaxed pt-1.5">
                                        {log.details}
                                      </p>
                                      {log.authorName && (
                                        <div className="text-[9px] text-zinc-400 flex items-center gap-1 pt-1">
                                          <User className="w-3 h-3" />
                                          المستخدم: {log.authorName}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* --- SUBTAB 2: NESTED CATEGORIES --- */}
      {subTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <FolderTree className="w-4 h-4 text-indigo-600" />
              إضافة فئة تصنيف شجرية جديدة
            </h3>
            <form onSubmit={handleAddCategory} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">اسم الفئة بالعربية</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="مثال: كراسي طبية"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">الاسم بالإنجليزية</label>
                <input
                  type="text"
                  value={newCatNameEn}
                  onChange={(e) => setNewCatNameEn(e.target.value)}
                  placeholder="Orthopedic Chairs"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">الفئة الأب (التبعية الهرمية)</label>
                <select
                  value={newCatParent}
                  onChange={(e) => setNewCatParent(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                >
                  <option value="">-- فئة رئيسية (لا يوجد أب) --</option>
                  {categories
                    .filter((c) => !c.parentId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">رمز اللون المميز</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={newCatColor}
                    onChange={(e) => setNewCatColor(e.target.value)}
                    className="w-10 h-10 border-0 p-0 rounded-lg cursor-pointer bg-transparent"
                  />
                  <span className="font-mono">{newCatColor}</span>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
              >
                حفظ الفئة في الدليل
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
              هيكلية الفئات المعتمدة (Hierarchy tree)
            </h3>
            <div className="space-y-4">
              {categories
                .filter((c) => !c.parentId)
                .map((parent) => {
                  const children = categories.filter((c) => c.parentId === parent.id);
                  return (
                    <div
                      key={parent.id}
                      className="border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{parent.icon}</span>
                          <span className="font-black text-zinc-950 dark:text-zinc-100">
                            {parent.name}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-mono">
                            ({parent.nameEn})
                          </span>
                        </div>
                        <span
                          className="w-3.5 h-3.5 rounded-full"
                          style={{ backgroundColor: parent.color }}
                        />
                      </div>
                      {children.length > 0 && (
                        <div className="mr-8 mt-3 border-r-2 border-indigo-100 pr-4 space-y-2">
                          {children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-400"
                            >
                              <div className="flex items-center gap-1.5">
                                <span>{child.icon}</span>
                                <span>{child.name}</span>
                                <span className="text-[10px] text-zinc-400 font-mono">
                                  ({child.nameEn})
                                </span>
                              </div>
                              <span className="text-[10px] bg-zinc-50 dark:bg-zinc-800 px-2 py-0.5 rounded">
                                فئة تابعة
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 3: BRANDS --- */}
      {subTab === "brands" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <Bookmark className="w-4 h-4 text-indigo-600" />
              تسجيل ماركة / علامة تجارية
            </h3>
            <form onSubmit={handleAddBrand} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">اسم العلامة التجارية</label>
                <input
                  type="text"
                  required
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="مثال: Dell"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">بلد المنشأ (Country)</label>
                <input
                  type="text"
                  value={newBrandCountry}
                  onChange={(e) => setNewBrandCountry(e.target.value)}
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">الموقع الإلكتروني الرسمي</label>
                <input
                  type="text"
                  value={newBrandWebsite}
                  onChange={(e) => setNewBrandWebsite(e.target.value)}
                  placeholder="example.com"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-left"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
              >
                إدراج الماركة
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
              قائمة الماركات المسجلة
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="p-4 border border-zinc-50 dark:border-zinc-800 rounded-2xl flex items-center justify-between"
                >
                  <div>
                    <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                      {brand.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 block">
                      بلد المنشأ: {brand.country}
                    </span>
                    {brand.website && (
                      <a
                        href={`https://${brand.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-indigo-500 hover:underline inline-flex items-center gap-1 mt-1 font-mono"
                      >
                        {brand.website} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded">
                    نشط
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 4: MEASUREMENT UNITS --- */}
      {subTab === "units" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b pb-2">
              <Weight className="w-4 h-4 text-indigo-600" />
              تعريف وحدة قياس وتحويل
            </h3>
            <form onSubmit={handleAddUnit} className="space-y-4 text-xs font-bold">
              <div>
                <label className="block text-zinc-400 mb-1">اسم الوحدة بالعربية</label>
                <input
                  type="text"
                  required
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="مثال: كرتون"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">الرمز الدولي / الاختصار</label>
                <input
                  type="text"
                  required
                  value={newUnitAbbr}
                  onChange={(e) => setNewUnitAbbr(e.target.value)}
                  placeholder="Ctn"
                  className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                />
              </div>

              <div className="border border-indigo-100 p-3 rounded-2xl bg-indigo-50/20 space-y-3">
                <h4 className="text-[10px] font-black text-indigo-600">
                  معامل التحويل الرياضي (اختياري)
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] text-zinc-400 mb-1">المعامل</label>
                    <input
                      type="number"
                      value={newUnitConversionFactor}
                      onChange={(e) => setNewUnitConversionFactor(e.target.value)}
                      placeholder="24"
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] text-zinc-400 mb-1">الوحدة المقابلة</label>
                    <select
                      value={newUnitConversionTarget}
                      onChange={(e) => setNewUnitConversionTarget(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-xs"
                    >
                      <option value="">-- اختر الوحدة --</option>
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <p className="text-[9px] text-indigo-500 font-bold">
                  مثال: 1 كرتون يحتوي على 24 حبة
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl"
              >
                حفظ وحدة القياس
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
            <h3 className="text-xs font-black text-zinc-900 dark:text-zinc-100 mb-4 border-b pb-2">
              جدول وحدات القياس الحسابية والتحويل البيني
            </h3>
            <div className="space-y-4">
              {units.map((unit) => (
                <div
                  key={unit.id}
                  className="p-4 border border-zinc-50 dark:border-zinc-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="font-black text-zinc-900 dark:text-zinc-100 block">
                      {unit.name} ({unit.abbreviation})
                    </span>
                    <span className="text-[10px] text-zinc-400 block">نوع البعد: {unit.type}</span>
                  </div>
                  {unit.conversions.length > 0 ? (
                    <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1.5 rounded-xl border border-indigo-100 text-xs text-indigo-700 dark:text-indigo-400">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>
                        كل 1 {unit.name.split(" ")[0]} = {unit.conversions[0].factor}{" "}
                        {unit.conversions[0].targetName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-400 font-bold">وحدة أساسية</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBTAB 5: BARCODE LABELS PRINTING --- */}
      {subTab === "labels" && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Barcode className="w-5 h-5 text-indigo-600" />
                توليد وإعداد ملصقات الباركود ورمز الـ QR الموحدة (Label Generator)
              </h3>
              <p className="text-xs text-zinc-400 font-bold">
                تم اختيار {selectedItems.length} صنف لطباعة ملصقات الباركود والـ QR بالجملة.
              </p>
            </div>
            {selectedItems.length > 0 && (
              <button
                onClick={handleBulkPrintLabels}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                طباعة الملصقات المحددة بالجملة
              </button>
            )}
          </div>

          {selectedItems.length === 0 ? (
            <div className="p-12 text-center text-zinc-400 font-bold flex flex-col items-center justify-center gap-2">
              <Printer className="w-8 h-8 text-zinc-300" />
              يرجى تحديد صنف واحد أو أكثر من "دليل الصنف العام" لتوليد ملصقات الباركود والـ QR
              القابلة للطباعة.
            </div>
          ) : (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-4 border border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20"
              id="print-labels-container"
            >
              {items
                .filter((i) => selectedItems.includes(i.id))
                .map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-white dark:bg-zinc-900 p-4 rounded-xl border shadow-sm flex flex-col items-center justify-between space-y-3 relative overflow-hidden group"
                  >
                    <div className="text-center">
                      <span className="text-[10px] font-black text-indigo-600 font-mono block">
                        {prod.sku}
                      </span>
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 block line-clamp-1">
                        {prod.nameAr}
                      </span>
                    </div>

                    {/* QR code containing SKU, name and seller */}
                    <div className="p-1 bg-white border rounded">
                      <QRCodeSVG
                        value={`SKU: ${prod.sku}\nName: ${prod.nameEn}\nSeller: Madarij OS`}
                        size={80}
                        level="M"
                      />
                    </div>

                    <div className="text-center w-full">
                      {/* Simulated standard Code128 bar code */}
                      <div className="flex flex-col items-center">
                        <div className="h-6 w-32 bg-zinc-900 dark:bg-white flex items-center justify-around gap-[1px] px-1">
                          {Array.from({ length: 15 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="bg-white dark:bg-zinc-900 h-full"
                              style={{ width: `${idx % 3 === 0 ? "3px" : "1px"}` }}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-mono font-bold text-zinc-500 mt-1 block">
                          {prod.barcode}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* --- ADD ADVANCED PRODUCT MODAL --- */}
      <AnimatePresence>
        {showAddForm && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            dir="rtl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl overflow-hidden flex flex-col p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-3">
                <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  تعريف صنف مخزني متقدم مع المتغيرات والمستودعات
                </h3>
                <button
                  onClick={generateSkuAndBarcode}
                  type="button"
                  className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black border border-indigo-100"
                >
                  توليد SKU وباركود آلي
                </button>
              </div>

              <form onSubmit={handleCreateProductSubmit} className="space-y-4 text-xs font-bold">
                {/* Image Upload Row */}
                <div>
                  <label className="block text-zinc-400 mb-1">صور المنتج ( drag & drop )</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer text-zinc-400 hover:bg-zinc-50"
                    >
                      <Upload className="w-4 h-4" />
                      <span className="text-[8px] mt-1">ارفع صورة</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />

                    {productImages.map((img, idx) => (
                      <div
                        key={idx}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden border border-zinc-200"
                      >
                        <img src={img} alt="Product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setPrimaryImageIdx(idx)}
                          className={`absolute bottom-0 inset-x-0 text-center text-[8px] py-0.5 text-white ${primaryImageIdx === idx ? "bg-emerald-600 font-bold" : "bg-black/60"}`}
                        >
                          {primaryImageIdx === idx ? "الرئيسية" : "تعيين رئيسية"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ar & En Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">اسم المنتج بالعربية</label>
                    <input
                      type="text"
                      required
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                      placeholder="كرسي طبي أسود"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الاسم بالإنجليزية</label>
                    <input
                      type="text"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                      placeholder="Ergonomic Black Chair"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                </div>

                {/* SKU, Barcode & Type */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-zinc-400 mb-1">رمز الـ SKU</label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      placeholder="MDJ-101"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الباركود (EAN-13)</label>
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      placeholder="6281002345"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">نوع المنتج الأساسي</label>
                    <select
                      value={prodType}
                      onChange={(e) => setProdType(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer text-zinc-700 dark:text-zinc-300"
                    >
                      <option value="Physical">منتج مادي (Physical)</option>
                      <option value="Service">خدمة / صنف خدمي (Service)</option>
                      <option value="Bundle">باقة تجميعية (Bundle)</option>
                      <option value="Raw Material">مادة أولية (Raw Material)</option>
                    </select>
                  </div>
                </div>

                {/* Cost, Selling, Wholesale & Minimum Prices */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">سعر التكلفة (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">سعر البيع (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={sellPrice}
                      onChange={(e) => setSellPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الجملة (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={wholesalePrice}
                      onChange={(e) => setWholesalePrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الحد الأدنى (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                </div>

                {/* Category, Brand, Unit, Supplier */}
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">الفئة شجرية</label>
                    <select
                      value={itemCategory}
                      onChange={(e) => setItemCategory(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                    >
                      <option value="">-- اختر الفئة --</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">العلامة التجارية</label>
                    <select
                      value={itemBrand}
                      onChange={(e) => setItemBrand(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                    >
                      <option value="">-- اختر الماركة --</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">وحدة القياس</label>
                    <select
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الضريبة (VAT)</label>
                    <select
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none cursor-pointer"
                    >
                      <option value="15">خاضع لضريبة القيمة المضافة 15%</option>
                      <option value="0">معفى من الضريبة (0%)</option>
                    </select>
                  </div>
                </div>

                {/* Weight, Dimensions, Supplier */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1">الوزن (كجم)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="0.00"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">الأبعاد (طول x عرض x ارتفاع)</label>
                    <input
                      type="text"
                      value={dimensions}
                      onChange={(e) => setDimensions(e.target.value)}
                      placeholder="120x80x75 cm"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none font-mono text-right"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">المورد المفضل</label>
                    <input
                      type="text"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      placeholder="اسم شركة التوريد"
                      className="w-full p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none"
                    />
                  </div>
                </div>

                {/* Varaiants Setup (Shopify style) */}
                <div className="border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 bg-zinc-50/50 dark:bg-zinc-800/30">
                  <div className="flex items-center justify-between border-b pb-2 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasVariants}
                        onChange={(e) => setHasVariants(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                        هذا المنتج يحتوي على متغيرات (مقاسات، ألوان، إلخ)
                      </span>
                    </label>
                  </div>

                  {hasVariants && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-400 mb-1">الخاصية الأولى</label>
                          <input
                            type="text"
                            value={variantAttr1}
                            onChange={(e) => setVariantAttr1(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-[11px]"
                          />
                          <label className="block text-[10px] text-zinc-400 mt-1">
                            القيم مفصولة بفاصلة
                          </label>
                          <input
                            type="text"
                            value={variantVals1}
                            onChange={(e) => setVariantVals1(e.target.value)}
                            placeholder="أسود, أبيض"
                            className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-400 mb-1">الخاصية الثانية</label>
                          <input
                            type="text"
                            value={variantAttr2}
                            onChange={(e) => setVariantAttr2(e.target.value)}
                            className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-[11px]"
                          />
                          <label className="block text-[10px] text-zinc-400 mt-1">
                            القيم مفصولة بفاصلة
                          </label>
                          <input
                            type="text"
                            value={variantVals2}
                            onChange={(e) => setVariantVals2(e.target.value)}
                            placeholder="كبير, صغير"
                            className="w-full p-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg outline-none text-[11px]"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGenerateVariants}
                        className="py-2 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] rounded-lg transition-colors"
                      >
                        توليد توليفات المتغيرات (Combinations)
                      </button>

                      {generatedVariants.length > 0 && (
                        <div className="max-h-44 overflow-y-auto border border-zinc-200 rounded-xl bg-white dark:bg-zinc-900 p-2 text-[10px] space-y-1.5">
                          {generatedVariants.map((v, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between border-b pb-1 last:border-0 last:pb-0"
                            >
                              <span>{v.name}</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={v.sku}
                                  placeholder="SKU"
                                  disabled
                                  className="w-20 p-1 border rounded bg-zinc-50 font-mono text-center text-[9px]"
                                />
                                <input
                                  type="text"
                                  value={v.barcode}
                                  placeholder="Barcode"
                                  disabled
                                  className="w-24 p-1 border rounded bg-zinc-50 font-mono text-center text-[9px]"
                                />
                                <input
                                  type="text"
                                  defaultValue={v.price}
                                  placeholder="السعر"
                                  className="w-12 p-1 border rounded font-mono text-center text-[9px]"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 border-t dark:border-zinc-800 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-5 py-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-xl"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl"
                  >
                    حفظ وتعريف الصنف المخزني 📦
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Barcode and Label detailed popup */}
      <AnimatePresence>
        {showBarcodePrint && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
            dir="rtl"
          >
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm p-6 flex flex-col items-center space-y-4">
              <h4 className="font-black text-xs text-zinc-900 dark:text-zinc-100 border-b pb-2 w-full text-center">
                طباعة ملصق الصنف المعتمد
              </h4>

              <div
                className="bg-white p-6 border rounded-2xl flex flex-col items-center space-y-4 w-full"
                id="label-print-single"
              >
                <div className="text-center">
                  <span className="text-[10px] font-black text-indigo-600 font-mono block">
                    {showBarcodePrint.sku}
                  </span>
                  <span className="text-[12px] font-bold text-zinc-900 block">
                    {showBarcodePrint.nameAr}
                  </span>
                </div>

                <QRCodeSVG
                  value={`SKU: ${showBarcodePrint.sku}\nBarcode: ${showBarcodePrint.barcode}`}
                  size={120}
                  level="H"
                />

                <div className="flex flex-col items-center w-full">
                  <div className="h-8 w-44 bg-zinc-900 flex items-center justify-around gap-[1px] px-2">
                    {Array.from({ length: 22 }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white h-full"
                        style={{ width: `${idx % 4 === 0 ? "3px" : "1px"}` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1 block">
                    {showBarcodePrint.barcode}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 w-full pt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  اطبع الآن
                </button>
                <button
                  onClick={() => setShowBarcodePrint(null)}
                  className="flex-1 py-2.5 bg-zinc-50 text-zinc-500 rounded-xl text-xs font-black"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
