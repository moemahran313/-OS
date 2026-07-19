import React, { useState } from "react";
import { Search, Plus, Sparkles, Tag, Layers, CheckCircle } from "lucide-react";

interface ProductItem {
  sku: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  category: "services" | "software" | "hardware" | "consulting";
  unitPrice: number;
  taxRate: number;
  stock?: number;
}

const MOCK_PRODUCTS: ProductItem[] = [
  {
    sku: "SRV-ZATCA-01",
    name: "ZATCA Phase 2 Integration Service",
    nameAr: "خدمة ربط نظام فاتورة - المرحلة الثانية",
    description: "Complete integration with FATOORA portal for simplified and standard tax invoices.",
    descriptionAr: "ربط متكامل مع بوابة فاتورة للفواتير الضريبية المبسطة والقياسية.",
    category: "services",
    unitPrice: 4500,
    taxRate: 15,
  },
  {
    sku: "SFT-ERP-LIC",
    name: "Enterprise ERP Cloud License (Annual)",
    nameAr: "رخصة نظام ERP السحابي (سنوي)",
    description: "Multi-user annual license for financial, inventory, and HR modules.",
    descriptionAr: "رخصة سنوية متعددة المستخدمين للحسابات والمستودعات والموارد البشرية.",
    category: "software",
    unitPrice: 12000,
    taxRate: 15,
  },
  {
    sku: "CNS-VAT-AUD",
    name: "VAT & Tax Compliance Audit",
    nameAr: "تدقيق ضريبي وامتثال ضريبة القيمة المضافة",
    description: "Review of transactions, ledgers, and preparation of tax returns by certified public accountant.",
    descriptionAr: "مراجعة المعاملات والدفاتر وإعداد الإقرارات الضريبية بواسطة محاسب قانوني معتمد.",
    category: "consulting",
    unitPrice: 3500,
    taxRate: 15,
  },
  {
    sku: "SFT-API-SMS",
    name: "SMS Gateway API Credits (100k pack)",
    nameAr: "باقة رسائل بوابة الرسائل القصيرة (100 ألف)",
    description: "High speed SMS credits with local sender ID registration.",
    descriptionAr: "رصيد رسائل نصية عالية السرعة مع تسجيل اسم المرسل المحلي.",
    category: "software",
    unitPrice: 2400,
    taxRate: 15,
  },
  {
    sku: "SRV-DEV-HR",
    name: "Senior Software Engineer (Hourly Rate)",
    nameAr: "ساعة عمل مهندس برمجيات محترف",
    description: "Full-stack development, API integration, and database design services.",
    descriptionAr: "خدمات تطوير برمجيات متكاملة، ربط واجهات برمجية، وتصميم قواعد البيانات.",
    category: "services",
    unitPrice: 250,
    taxRate: 15,
  },
  {
    sku: "HWD-QR-SCAN",
    name: "Zebra DS2208 2D Barcode Scanner",
    nameAr: "قارئ باركود ثنائي الأبعاد Zebra DS2208",
    description: "Rugged barcode scanner optimized for reading QR codes on print and digital screens.",
    descriptionAr: "قارئ باركود متين مخصص لقراءة رموز الاستجابة السريعة من الشاشات والمطبوعات.",
    category: "hardware",
    unitPrice: 850,
    taxRate: 15,
    stock: 24,
  },
  {
    sku: "HWD-PRN-INV",
    name: "Epson TM-T88VI Thermal Receipt Printer",
    nameAr: "طابعة إيصالات حرارية Epson TM-T88VI",
    description: "Ultra-fast thermal receipt printer with Ethernet and USB interfaces.",
    descriptionAr: "طابعة إيصالات حرارية فائقة السرعة مع منافذ شبكة و USB.",
    category: "hardware",
    unitPrice: 1450,
    taxRate: 15,
    stock: 12,
  },
  {
    sku: "CNS-BI-SETUP",
    name: "PowerBI Analytics Dashboard Setup",
    nameAr: "إعداد لوحات تحليلات ومؤشرات PowerBI",
    description: "Custom dashboards integrated with inventory and sales data pipelines.",
    descriptionAr: "لوحات تحليلات مخصصة متكاملة مع خطوط بيانات المبيعات والمخزون.",
    category: "consulting",
    unitPrice: 6000,
    taxRate: 15,
  },
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (!isOpen) return null;

  const filteredProducts = MOCK_PRODUCTS.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameAr.includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase());
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
                {isArabic ? "دليل المنتجات والخدمات الذكي" : "Smart Product & Services Catalog"}
              </h2>
              <p className="text-xs font-bold text-zinc-500">
                {isArabic ? "البحث والاختيار السريع للمنتجات مع إمكانية إضافتها مباشرة للفاتورة" : "Quickly search, select and inject catalog items into your invoice"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:bg-zinc-50 transition-all hover:scale-105"
          >
            ✕
          </button>
        </header>

        {/* Search and Filters */}
        <div className="p-6 border-b border-zinc-100 space-y-4">
          <div className="relative">
            <Search className="absolute right-4 top-3.5 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder={isArabic ? "ابحث باسم المنتج، الوصف، أو الرمز (SKU)..." : "Search by product name, description, SKU..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pr-11 pl-4 py-3.5 text-xs font-medium focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: isArabic ? "جميع الفئات" : "All Categories" },
              { id: "software", label: isArabic ? "برمجيات ورخص" : "Software & Licenses" },
              { id: "services", label: isArabic ? "خدمات فنية" : "Technical Services" },
              { id: "hardware", label: isArabic ? "أجهزة ومعدات" : "Hardware & Eq" },
              { id: "consulting", label: isArabic ? "استشارات وحلول" : "Consulting" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/5"
                    : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-100"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Products List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-zinc-50/30">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="text-zinc-300 font-bold text-4xl">📦</div>
              <p className="text-xs font-bold text-zinc-500">
                {isArabic ? "لم نجد أي منتجات تطابق بحثك" : "No products matching your search"}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.sku}
                onClick={() => {
                  onSelect({
                    name: isArabic ? product.nameAr : product.name,
                    unitPrice: product.unitPrice,
                    taxRate: product.taxRate,
                    description: isArabic ? product.descriptionAr : product.description,
                  });
                  onClose();
                }}
                className="group p-4 bg-white border border-zinc-200/80 hover:border-zinc-900 rounded-2xl transition-all cursor-pointer flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] duration-200"
              >
                <div className="space-y-1 text-right flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md font-bold">
                      {product.sku}
                    </span>
                    <span className="text-xs font-black text-zinc-900 group-hover:text-zinc-900 transition-colors">
                      {isArabic ? product.nameAr : product.name}
                    </span>
                    {product.stock !== undefined && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-black">
                        {isArabic ? `${product.stock} متوفر` : `${product.stock} in stock`}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                    {isArabic ? product.descriptionAr : product.description}
                  </p>
                </div>

                <div className="text-left pl-2 shrink-0 flex items-center gap-4">
                  <div>
                    <p className="text-xs font-mono text-zinc-400 font-bold text-right uppercase">
                      {isArabic ? "سعر الوحدة" : "Unit Price"}
                    </p>
                    <p className="text-sm font-black text-zinc-900">
                      {product.unitPrice.toLocaleString()} {currency}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-bold text-right">
                      {isArabic ? `+ ضريبة ${product.taxRate}%` : `+ ${product.taxRate}% VAT`}
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

        {/* Footer */}
        <footer className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
          <p className="text-[10px] text-zinc-400 font-bold">
            {isArabic ? "💡 تلميح: انقر على أي منتج لحقنه فوراً كبند جديد في جدول الفاتورة." : "💡 Tip: Click on any product to inject it instantly into the items table."}
          </p>
        </footer>
      </div>
    </div>
  );
}
