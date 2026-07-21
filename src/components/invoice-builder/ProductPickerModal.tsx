import React, { useState, useEffect } from "react";
import { Search, Plus, Sparkles, Tag, Layers, CheckCircle, PackagePlus } from "lucide-react";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";
import { useUser } from "@/src/contexts/UserContext";
import { toast } from "sonner";

interface ProductItem {
  id?: string;
  sku: string;
  name: string;
  nameAr?: string;
  description?: string;
  category?: string;
  unitPrice: number;
  taxRate: number;
  stock?: number;
}

interface ProductPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: { name: string; unitPrice: number; taxRate: number; description?: string }) => void;
  currency: string;
  isArabic?: boolean;
}

export default function ProductPickerModal({
  isOpen,
  onClose,
  onSelect,
  currency,
  isArabic = true,
}: ProductPickerModalProps) {
  const { user } = useUser();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customPrice, setCustomPrice] = useState<number | "">("");
  const [customSku, setCustomSku] = useState("");

  useEffect(() => {
    if (!user || !isOpen) return;

    const q = query(collection(db, "inventory_items"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const items = snap.docs.map((doc) => {
          const d = doc.data();
          return {
            id: doc.id,
            sku: d.sku || d.code || `SKU-${doc.id.slice(0, 5)}`,
            name: d.name || d.nameAr || "منتج بدون عنوان",
            nameAr: d.nameAr || d.name,
            description: d.description || d.details || "",
            category: d.category || "general",
            unitPrice: d.unitPrice || d.price || d.salePrice || 0,
            taxRate: d.taxRate || 15,
            stock: d.quantity || d.stock,
          };
        });
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.warn("Failed to load inventory for picker:", err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleAddQuickProduct = async () => {
    if (!customName || !customPrice) {
      toast.error(isArabic ? "يرجى تعبئة الاسم والسعر" : "Please provide name and price");
      return;
    }

    try {
      if (user) {
        await addDoc(collection(db, "inventory_items"), {
          userId: user.uid,
          name: customName,
          nameAr: customName,
          unitPrice: Number(customPrice),
          sku: customSku || `SKU-${Math.floor(Math.random() * 90000 + 10000)}`,
          taxRate: 15,
          createdAt: new Date().toISOString(),
        });
      }
      onSelect({
        name: customName,
        unitPrice: Number(customPrice),
        taxRate: 15,
        description: "",
      });
      toast.success(isArabic ? "تم إضافة المادة وحقنها بالفاتورة بنجاح" : "Product added and injected");
      setCustomName("");
      setCustomPrice("");
      setCustomSku("");
      setShowAddCustom(false);
      onClose();
    } catch (err) {
      toast.error(isArabic ? "فشل حفظ المادة" : "Failed to add product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-zinc-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-zinc-900">
                {isArabic ? "دليل المنتجات والخدمات" : "Product Catalog"}
              </h2>
              <p className="text-xs font-bold text-zinc-500">
                {isArabic ? "من مستودعك الخاص مباشرة بدون بيانات تجريبية" : "Directly from your inventory"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:bg-zinc-50 transition-all"
          >
            ✕
          </button>
        </header>

        {/* Search and Filters */}
        <div className="p-6 border-b border-zinc-100 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-4 top-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={isArabic ? "ابحث باسم المنتج أو الرمز (SKU)..." : "Search by product name, SKU..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pr-11 pl-4 py-3 text-xs font-medium focus:ring-2 focus:ring-zinc-900/10 outline-none"
                autoFocus
              />
            </div>
            <button
              onClick={() => setShowAddCustom(!showAddCustom)}
              className="px-4 py-3 bg-zinc-900 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 shrink-0"
            >
              <PackagePlus className="w-4 h-4" />
              {isArabic ? "إضافة مادة جديدة" : "Add New Item"}
            </button>
          </div>

          {showAddCustom && (
            <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-3">
              <p className="text-xs font-black text-zinc-800">
                {isArabic ? "إضافة بند جديد للمستودع وتضمينه بالفاتورة:" : "Add new item to inventory:"}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={isArabic ? "اسم المنتج / الخدمة" : "Product Name"}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder={isArabic ? "سعر الوحدة (ر.س)" : "Unit Price"}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value ? Number(e.target.value) : "")}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs"
                />
                <input
                  type="text"
                  placeholder={isArabic ? "رمز SKU (اختياري)" : "SKU (optional)"}
                  value={customSku}
                  onChange={(e) => setCustomSku(e.target.value)}
                  className="px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  onClick={() => setShowAddCustom(false)}
                  className="px-3 py-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-700"
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </button>
                <button
                  onClick={handleAddQuickProduct}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700"
                >
                  {isArabic ? "حفظ وتحديد" : "Save & Select"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-zinc-50/30">
          {loading ? (
            <div className="text-center py-10 animate-pulse text-xs font-bold text-zinc-400">
              {isArabic ? "جاري تحميل قائمة المنتجات..." : "Loading products..."}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="text-zinc-300 font-bold text-4xl">📦</div>
              <p className="text-xs font-bold text-zinc-600">
                {isArabic
                  ? "لا توجد منتجات أو خدمات مضافة في مستودعك حالياً"
                  : "No items found in your inventory catalog"}
              </p>
              <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                {isArabic
                  ? "يمكنك النقر على زر 'إضافة مادة جديدة' بالأعلى لإدخال منتجات حقيقية فوراً."
                  : "Click 'Add New Item' above to insert real items into your inventory."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id || product.sku}
                onClick={() => {
                  onSelect({
                    name: product.name,
                    unitPrice: product.unitPrice,
                    taxRate: product.taxRate,
                    description: product.description,
                  });
                  onClose();
                }}
                className="group p-4 bg-white border border-zinc-200/80 hover:border-zinc-900 rounded-2xl transition-all cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md"
              >
                <div className="space-y-1 text-right flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-bold">
                      {product.sku}
                    </span>
                    <span className="text-xs font-black text-zinc-900">
                      {product.name}
                    </span>
                    {product.stock !== undefined && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-black">
                        {isArabic ? `${product.stock} متوفر` : `${product.stock} in stock`}
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                      {product.description}
                    </p>
                  )}
                </div>

                <div className="text-left pl-2 shrink-0 flex items-center gap-4">
                  <div>
                    <p className="text-xs font-mono text-zinc-400 font-bold text-right uppercase">
                      {isArabic ? "سعر الوحدة" : "Unit Price"}
                    </p>
                    <p className="text-sm font-black text-zinc-900">
                      {product.unitPrice.toLocaleString()} {currency}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-zinc-50 group-hover:bg-zinc-900 group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
