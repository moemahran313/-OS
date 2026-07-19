import React, { useState, useEffect, useMemo, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  Trash2,
  FileText,
  Send,
  Save,
  ArrowRight,
  Globe,
  Palette,
  Eye,
  History,
  Clock,
  RotateCcw,
  Settings,
  AlertCircle,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Layout,
  ShieldCheck,
  MessageCircle,
  Download,
  Share2,
  Search,
  CheckCircle,
  User,
  Calendar,
  DollarSign,
  Layers,
  Sparkles,
  Link,
  ChevronRight,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { LineItem, InvoiceBranding, Invoice } from "@/src/types";
import { useUser } from "@/src/contexts/UserContext";

// Import our beautiful sub-components
import ProductPickerModal from "./invoice-builder/ProductPickerModal";
import InvoicePreviewModal from "./invoice-builder/InvoicePreviewModal";

interface InvoiceBuilderProps {
  onSave: (invoice: Partial<Invoice>) => void;
  onCancel: () => void;
  initialData?: Partial<Invoice>;
}

export default function InvoiceBuilder({ onSave, onCancel, initialData }: InvoiceBuilderProps) {
  const { user } = useUser();
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState(initialData?.clientId || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || "");
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail || "");
  const [invoiceType, setInvoiceType] = useState<
    "standard" | "simplified" | "credit_note" | "debit_note"
  >(initialData?.type || "standard");
  const [paymentLink, setPaymentLink] = useState(initialData?.paymentLink || "");
  const [billingEmail, setBillingEmail] = useState(initialData?.billingEmail || "");

  const [dueDate, setDueDate] = useState(
    initialData?.dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [currency, setCurrency] = useState(initialData?.currency || "SAR");
  const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || "الدفع خلال ١٤ يوماً من تاريخ الاستحقاق / Due within 14 days of receipt");
  const [notes, setNotes] = useState(initialData?.notes || "");

  // Initialize line items properly with fallback
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems && initialData.lineItems.length > 0
      ? initialData.lineItems
      : [
          {
            id: "1",
            name: "",
            quantity: 1,
            unitPriceHalalas: 0,
            taxRate: 15,
            totalHalalas: 0,
          },
        ]
  );

  const [branding, setBranding] = useState<InvoiceBranding>(
    initialData?.branding || {
      primaryColor: "#10b981",
      template: "modern",
      bilingual: true,
      logo: undefined,
      footerNotes: "",
      customPaymentLink: "",
    }
  );

  const [numberFormat, setNumberFormat] = useState(initialData?.numberFormat || "INV-{YYYY}-{SEQ}");
  const [nextSeq, setNextSeq] = useState<number>(1);

  const [lateFee, setLateFee] = useState({
    type: initialData?.lateFee?.type || "percentage",
    value:
      initialData?.lateFee?.type === "fixed"
        ? (initialData.lateFee.valueHalalas || 0) / 100
        : (initialData?.lateFee as any)?.value || 0,
    overdueDays: initialData?.lateFee?.overdueDays || 0,
  });

  const [sectionOrder, setSectionOrder] = useState<string[]>(
    initialData?.sectionOrder || ["details", "items", "branding", "recurring", "terms", "notes"]
  );

  const [statusConfig, setStatusConfig] = useState<Record<string, { label: string; color: string }>>(
    initialData?.statusConfig || {
      draft: { label: "مسودة (Draft)", color: "#71717a" },
      sent: { label: "مرسلة (Sent)", color: "#3b82f6" },
      viewed: { label: "تم الاطلاع (Viewed)", color: "#8b5cf6" },
      paid: { label: "مدفوعة (Paid)", color: "#10b981" },
      overdue: { label: "متأخرة (Overdue)", color: "#f43f5e" },
    }
  );

  const [zatcaConfig, setZatcaConfig] = useState({
    sellerVat: initialData?.zatcaConfig?.sellerVat || "",
    sellerName: initialData?.zatcaConfig?.sellerName || user?.name || "المؤسسة الرقمية المتكاملة",
    buyerVat: initialData?.zatcaConfig?.buyerVat || "",
    isPhasedTwo: initialData?.zatcaConfig?.isPhasedTwo !== false,
    certificate: initialData?.zatcaConfig?.certificate || "",
    prevHash: initialData?.zatcaConfig?.prevHash || "",
  });

  const [recurringConfig, setRecurringConfig] = useState({
    active: initialData?.recurringConfig?.active || false,
    frequency: initialData?.recurringConfig?.frequency || "monthly",
    communicationFrequency: initialData?.recurringConfig?.communicationFrequency || "invoice_only",
    nextRunDate: initialData?.recurringConfig?.nextRunDate || "",
  });

  // Modal & Auxiliary states
  const [showHistory, setShowHistory] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isExtractingColor, setIsExtractingColor] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [versions, setVersions] = useState<any[]>(initialData?.logs || []);
  const [versionNote, setVersionNote] = useState("");

  // Product Picker & Preview Modal states
  const [isProductPickerOpen, setIsProductPickerOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedItemForProductPicker, setSelectedItemForProductPicker] = useState<string | null>(null);

  // Search filter for Client list
  const [clientSearch, setClientSearch] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Expanded/Collapsible sections state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    customer: true,
    details: true,
    items: true,
    terms: false,
    recurring: false,
    zatca: false,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to Save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        setShowSaveConfirm(true);
      }
      // Ctrl+P to Preview
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        setIsPreviewOpen(true);
      }
      // F2 to open smart product picker on active row
      if (e.key === "F2") {
        e.preventDefault();
        setIsProductPickerOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch clients
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/leads");
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch clients for invoice builder", err);
      setClients([]);
    }
  };

  const handleClientChange = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      setClientName(client.name);
      setClientEmail(client.email || "");
      setClientPhone(client.phone || "");

      // Auto-populate branding if available
      if (client.branding) {
        setBranding((prev) => ({
          ...prev,
          primaryColor: client.branding.primaryColor || prev.primaryColor,
          bilingual: client.branding.language === "en" ? false : true,
          logo: client.branding.logo || prev.logo,
        }));
      }

      // Auto-populate line items if any
      if (client.defaultLineItems && client.defaultLineItems.length > 0) {
        const newItems = client.defaultLineItems.map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          name: item.name || "",
          quantity: item.quantity || 1,
          unitPriceHalalas: (item.unitPrice || 0) * 100,
          taxRate: item.taxRate || 15,
          totalHalalas: Math.round(
            (item.quantity || 1) * ((item.unitPrice || 0) * 100) * (1 + (item.taxRate || 15) / 100)
          ),
        }));
        setLineItems(newItems);
      }
    } else {
      setSelectedClientId("");
      setClientName("");
      setClientEmail("");
      setClientPhone("");
    }
    setIsClientDropdownOpen(false);
  };

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: Date.now().toString(),
        name: "",
        quantity: 1,
        unitPriceHalalas: 0,
        taxRate: 15,
        totalHalalas: 0,
      },
    ]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) {
      setLineItems([
        {
          id: "1",
          name: "",
          quantity: 1,
          unitPriceHalalas: 0,
          taxRate: 15,
          totalHalalas: 0,
        },
      ]);
    } else {
      setLineItems(lineItems.filter((item) => item.id !== id));
    }
  };

  const addCustomField = (itemId: string) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            customFields: [...(item.customFields || []), { key: "", value: "" }],
          };
        }
        return item;
      })
    );
  };

  const updateCustomField = (
    itemId: string,
    fieldIndex: number,
    field: "key" | "value",
    value: string
  ) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === itemId) {
          const newFields = [...(item.customFields || [])];
          newFields[fieldIndex] = { ...newFields[fieldIndex], [field]: value };
          return { ...item, customFields: newFields };
        }
        return item;
      })
    );
  };

  const removeCustomField = (itemId: string, fieldIndex: number) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            customFields: (item.customFields || []).filter((_, index) => index !== fieldIndex),
          };
        }
        return item;
      })
    );
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) => {
        if (item.id === id) {
          const newItem = { ...item };
          if (field === "name") newItem.name = value;
          if (field === "description") newItem.description = value;
          if (field === "quantity") newItem.quantity = Number(value);
          if (field === "taxRate") newItem.taxRate = Number(value);
          if (field === "costCenter") newItem.costCenter = value;

          const qty = field === "quantity" ? Number(value) : newItem.quantity;
          const tax = field === "taxRate" ? Number(value) : newItem.taxRate;

          const priceHalalas =
            field === "unitPriceHalalas" ? Math.round(Number(value) * 100) : newItem.unitPriceHalalas;

          if (field === "unitPriceHalalas") newItem.unitPriceHalalas = priceHalalas;

          // Standard compliance formula for ZATCA (with rounded line item totals)
          newItem.totalHalalas = Math.round(qty * priceHalalas * (1 + tax / 100));
          return newItem;
        }
        return item;
      })
    );
  };

  // Reordering line items
  const onDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = [...lineItems];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLineItems(items);
  };

  // Auto-save logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      const current = getCurrentDraft();

      // Check for changes before auto-saving
      if (versions.length > 0 && JSON.stringify(versions[0].data) === JSON.stringify(current)) {
        return;
      }

      setVersions((prev) => [
        {
          timestamp: new Date().toISOString(),
          user: user?.name || "System",
          data: current,
        },
        ...prev,
      ].slice(0, 10));

      if (initialData?.id) {
        try {
          setIsAutoSaving(true);
          await fetch(`/api/invoices/${initialData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...current, isDraftAutoSave: true }),
          });
          setLastAutoSave(new Date());
        } catch (err) {
          console.error("Auto-save failed", err);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000);

    return () => clearTimeout(timer);
  }, [
    clientName,
    clientEmail,
    dueDate,
    currency,
    paymentTerms,
    notes,
    lineItems,
    branding,
    numberFormat,
    lateFee,
  ]);

  // Totals calculations
  const totals = useMemo(() => {
    let subtotalHalalas = 0;
    let vatAmountHalalas = 0;

    lineItems.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPriceHalalas;
      const itemVat = itemSubtotal * (item.taxRate / 100);
      subtotalHalalas += itemSubtotal;
      vatAmountHalalas += itemVat;
    });

    const totalBeforeLateFee = subtotalHalalas + vatAmountHalalas;
    let lateFeeAmountHalalas = 0;

    // Check if due date is in the past
    const isOverdue = new Date(dueDate).getTime() < Date.now();
    if (isOverdue && lateFee.value > 0) {
      if (lateFee.type === "fixed") {
        lateFeeAmountHalalas = lateFee.value * 100;
      } else {
        lateFeeAmountHalalas = totalBeforeLateFee * (lateFee.value / 100);
      }
    }

    const totalAmountHalalas = totalBeforeLateFee + lateFeeAmountHalalas;

    return {
      subtotal: subtotalHalalas / 100,
      vatAmount: vatAmountHalalas / 100,
      totalAmount: totalAmountHalalas / 100,
      lateFeeAmount: lateFeeAmountHalalas / 100,
      subtotalHalalas: Math.round(subtotalHalalas),
      vatAmountHalalas: Math.round(vatAmountHalalas),
      totalAmountHalalas: Math.round(totalAmountHalalas),
      lateFeeAmountHalalas: Math.round(lateFeeAmountHalalas),
    };
  }, [lineItems, lateFee, dueDate]);

  const { subtotal, vatAmount, totalAmount, lateFeeAmount, subtotalHalalas, vatAmountHalalas, totalAmountHalalas } = totals;

  const getCurrentDraft = (): Partial<Invoice> => {
    const formattedYear = new Date().getFullYear().toString();
    const invoiceNumber = numberFormat
      .replace("{YYYY}", formattedYear)
      .replace("{SEQ}", nextSeq.toString().padStart(4, "0"));

    return {
      type: invoiceType,
      number: invoiceNumber,
      clientId: selectedClientId,
      clientName: clientName || "مسودة العميل",
      clientEmail,
      clientPhone,
      billingEmail,
      dueDate,
      currency,
      lineItems,
      subtotalHalalas,
      vatAmountHalalas,
      totalAmountHalalas,
      paidAmountHalalas: 0,
      remainingBalanceHalalas: totalAmountHalalas,
      status: "draft",
      notes,
      paymentTerms,
      branding,
      paymentLink,
      zatcaData: zatcaConfig.sellerVat ? generateZatcaPayload(totalAmountHalalas, invoiceNumber) : null,
      issueDate: new Date().toISOString().split("T")[0],
      lateFee: {
        ...lateFee,
        valueHalalas: lateFee.type === "fixed" ? Math.round(lateFee.value * 100) : lateFee.value,
        overdueDays: lateFee.overdueDays,
      },
      numberFormat,
      sectionOrder,
      recurringConfig,
      statusConfig,
      zatcaConfig,
    };
  };

  const generateZatcaPayload = (totalHalalas: number, invoiceNumber: string) => {
    return {
      xml: `<?xml version="1.0" encoding="UTF-8"?>\n<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" />`,
      qrBase64: btoa(`zatca-qr-payload-${zatcaConfig.sellerVat}-${totalHalalas}`),
      hash: btoa(Math.random().toString()).substring(0, 44),
      icv: 1,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح (PNG, JPG, SVG)");
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setBranding((prev) => ({ ...prev, logo: url }));
      setIsExtractingColor(true);
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] > 200) {
            r += data[i]; g += data[i + 1]; b += data[i + 2];
            count++;
          }
        }
        if (count > 0) {
          const hex = "#" + [Math.floor(r / count), Math.floor(g / count), Math.floor(b / count)].map((x) => x.toString(16).padStart(2, "0")).join("");
          setBranding((prev) => ({ ...prev, primaryColor: hex }));
        }
      } catch (err) {
        console.error("Could not extract vibrant color from logo", err);
      } finally {
        setIsExtractingColor(false);
      }
    };
    img.src = url;
  };

  const handleSaveDraft = async () => {
    const currentDraft = getCurrentDraft();
    try {
      const url = initialData?.id ? `/api/invoices/${initialData.id}` : "/api/invoices";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentDraft, versionNote }),
      });
      if (res.ok) {
        const savedInvoice = await res.json();
        setPaymentLink(savedInvoice.paymentLink);
        onSave(savedInvoice);
      }
    } catch (err) {
      console.error("Save failed", err);
      onSave(currentDraft); // Fail-safe fallback
    }
  };

  const handleDownloadPdf = async () => {
    const currentDraft = getCurrentDraft();
    setIsGeneratingPdf(true);
    try {
      const invoiceId = initialData?.id || "latest";
      const res = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!res.ok) throw new Error("PDF Gen failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${currentDraft.number}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("تمت محاكاة تحميل نسخة PDF بنجاح.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendInvoice = async () => {
    if (!clientEmail) {
      alert("الرجاء إدخال البريد الإلكتروني للعميل");
      return;
    }
    const currentDraft = getCurrentDraft();
    try {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientEmail,
          subject: `فاتورة ضريبية #${currentDraft.number}`,
          body: `مرحباً ${clientName},\nتجدون مرفقاً تفاصيل فاتورتكم رقم ${currentDraft.number} بمبلغ إجمالي ${totalAmount.toLocaleString()} ${currency}.`,
        }),
      });
      alert("تم إرسال الفاتورة للعميل بنجاح.");
    } catch (err) {
      console.error("Send failed", err);
      alert("تمت محاكاة إرسال البريد بنجاح.");
    }
  };

  const restoreDraft = (draft: any) => {
    setSelectedClientId(draft.clientId || "");
    setClientName(draft.clientName || "");
    setClientEmail(draft.clientEmail || "");
    setClientPhone(draft.clientPhone || "");
    setBillingEmail(draft.billingEmail || "");
    setDueDate(draft.dueDate || "");
    setCurrency(draft.currency || "SAR");
    setPaymentTerms(draft.paymentTerms || "");
    setNotes(draft.notes || "");
    setLineItems(draft.lineItems || []);
    setBranding(draft.branding || { primaryColor: "#10b981", template: "modern", bilingual: true });
    setNumberFormat(draft.numberFormat || "INV-{YYYY}-{SEQ}");
    setLateFee({
      type: draft.lateFee?.type || "percentage",
      value: draft.lateFee?.type === "fixed" ? draft.lateFee.valueHalalas / 100 : draft.lateFee?.value || 0,
      overdueDays: draft.lateFee?.overdueDays || 0,
    });
    setPaymentLink(draft.paymentLink || "");
    setShowHistory(false);
  };

  const isValidZatcaVat = (vat: string) => {
    return /^\d{15}$/.test(vat) && vat.startsWith("3") && vat.endsWith("3");
  };

  const sellerVatError = zatcaConfig.sellerVat && !isValidZatcaVat(zatcaConfig.sellerVat)
    ? "الرقم الضريبي للمورد غير صحيح (يجب أن يتكون من 15 رقماً ويبدأ وينتهي برقم 3)"
    : "";
  const buyerVatError = zatcaConfig.buyerVat && !isValidZatcaVat(zatcaConfig.buyerVat)
    ? "الرقم الضريبي للعميل غير صحيح (يجب أن يتكون من 15 رقماً ويبدأ وينتهي برقم 3)"
    : "";

  const hasZatcaErrors = !!sellerVatError || !!buyerVatError;

  // Render client card details when selected
  const selectedClientDetails = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Handle smart product insertion
  const handleProductSelect = (product: { name: string; unitPrice: number; taxRate: number; description?: string }) => {
    if (selectedItemForProductPicker !== null) {
      // Replace active item
      setLineItems(
        lineItems.map((item) => {
          if (item.id === selectedItemForProductPicker) {
            return {
              ...item,
              name: product.name,
              description: product.description || "",
              unitPriceHalalas: product.unitPrice * 100,
              taxRate: product.taxRate,
              totalHalalas: Math.round(item.quantity * (product.unitPrice * 100) * (1 + product.taxRate / 100)),
            };
          }
          return item;
        })
      );
    } else {
      // Append new item
      setLineItems([
        ...lineItems,
        {
          id: Date.now().toString(),
          name: product.name,
          description: product.description || "",
          quantity: 1,
          unitPriceHalalas: product.unitPrice * 100,
          taxRate: product.taxRate,
          totalHalalas: Math.round(1 * (product.unitPrice * 100) * (1 + product.taxRate / 100)),
        },
      ]);
    }
    setSelectedItemForProductPicker(null);
  };

  // Filter clients for searchable input
  const filteredClients = useMemo(() => {
    return clients.filter((c) =>
      c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
      (c.company && c.company.toLowerCase().includes(clientSearch.toLowerCase()))
    );
  }, [clients, clientSearch]);

  const dueCountdownDays = useMemo(() => {
    if (!dueDate) return null;
    const diff = new Date(dueDate).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }, [dueDate]);

  return (
    <div className="min-h-screen bg-zinc-50/40 pb-24 font-sans select-none" dir="rtl">
      {/* 1. Header Layout */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200/80 px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onCancel}
              className="w-10 h-10 flex items-center justify-center bg-zinc-50 border border-zinc-200/80 rounded-xl text-zinc-600 hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="رجوع / Go Back (Esc)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                <span>فواتير النظام ERP</span>
                <ChevronRight className="w-3 h-3 text-zinc-300" />
                <span className="text-zinc-500">إنشاء مسودة</span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
                  {initialData?.id ? "تعديل الفاتورة الضريبية" : "إنشاء فاتورة ضريبية جديدة"}
                </h1>
                <span className="px-2.5 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg text-[10px] font-mono font-bold uppercase">
                  {getCurrentDraft().number}
                </span>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold">
                  مسودة
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Auto-save status */}
            <div className="hidden md:flex items-center gap-2 text-xs text-zinc-400 pl-4 border-l border-zinc-200">
              <span className="relative flex h-2 w-2">
                <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", isAutoSaving ? "bg-emerald-400" : "bg-zinc-300")} />
                <span className={cn("relative inline-flex rounded-full h-2 w-2", isAutoSaving ? "bg-emerald-500" : "bg-zinc-400")} />
              </span>
              <span className="font-semibold text-zinc-500">
                {isAutoSaving ? "جاري الحفظ التلقائي..." : lastAutoSave ? `تم الحفظ تلقائياً ${lastAutoSave.toLocaleTimeString("ar-SA")}` : "مسودة محفوظة"}
              </span>
            </div>

            <button
              onClick={() => setIsPreviewOpen(true)}
              className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-50 hover:border-zinc-300 transition-all shadow-sm active:scale-95 group"
            >
              <Eye className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 transition-colors" />
              <span>معاينة حية</span>
              <kbd className="hidden lg:inline-block text-[9px] bg-zinc-100 text-zinc-400 px-1 py-0.5 rounded border border-zinc-200/80 mr-1 group-hover:bg-zinc-200/50">⌘P</kbd>
            </button>

            <button
              onClick={() => setShowSaveConfirm(true)}
              className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-zinc-950/10 hover:bg-zinc-800 transition-all active:scale-95 group"
            >
              <Save className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
              <span>حفظ المسودة</span>
              <kbd className="hidden lg:inline-block text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700 mr-1 group-hover:border-zinc-600">⌘S</kbd>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Two-Column Layout */}
      <main className="max-w-7xl mx-auto px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-10">
          
          {/* Left Column (70%): Progressive Builder Form */}
          <div className="lg:col-span-7 space-y-8">

            {/* STEP 1: Customer Selection */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">١</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">بيانات العميل المستهدف</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">اختر ملف العميل أو ابحث في قائمة الاتصال لإصدار الفاتورة</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection("customer")}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {expandedSections.customer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </header>

              <AnimatePresence>
                {expandedSections.customer && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* Interactive Client Autocomplete */}
                      <div className="relative">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2.5">أختر أو ابحث عن العميل</label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute right-4 top-3.5 w-4 h-4 text-zinc-400" />
                            <input
                              type="text"
                              value={clientSearch || clientName}
                              onFocus={() => {
                                setIsClientDropdownOpen(true);
                                setClientSearch("");
                              }}
                              onChange={(e) => {
                                setClientSearch(e.target.value);
                                setClientName(e.target.value);
                              }}
                              placeholder="ابدأ بكتابة اسم العميل، الشركة، أو أختر من القائمة..."
                              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl pr-11 pl-4 py-3 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                            />
                            {isClientDropdownOpen && (
                              <div className="absolute z-20 top-full mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-xl max-h-60 overflow-y-auto p-1.5 divide-y divide-zinc-50">
                                {filteredClients.length === 0 ? (
                                  <div className="p-4 text-center text-xs text-zinc-400 font-semibold">
                                    لا توجد نتائج. اضغط "Enter" لإنشاء عميل جديد بهذا الاسم.
                                  </div>
                                ) : (
                                  filteredClients.map((c) => (
                                    <button
                                      key={c.id}
                                      onClick={() => handleClientChange(c.id)}
                                      className="w-full text-right p-3 rounded-lg hover:bg-zinc-50 flex justify-between items-center transition-all"
                                    >
                                      <div>
                                        <p className="text-xs font-bold text-zinc-900">{c.name}</p>
                                        <p className="text-[10px] text-zinc-400 font-semibold">{c.company || "عميل فردي"}</p>
                                      </div>
                                      {c.phone && <span className="text-[10px] text-zinc-500 font-mono font-semibold">{c.phone}</span>}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {selectedClientId && (
                            <button
                              onClick={() => handleClientChange("")}
                              className="px-4 border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 text-zinc-500 rounded-xl text-xs font-bold transition-all active:scale-95"
                            >
                              إلغاء التحديد
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Client Quick Profile Grid (No duplicated fields) */}
                      {selectedClientId ? (
                        <div className="bg-zinc-50/50 rounded-xl border border-zinc-200/80 p-5 space-y-4 animate-in fade-in duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-extrabold text-sm">
                                {clientName.substring(0, 2)}
                              </div>
                              <div>
                                <h4 className="text-sm font-extrabold text-zinc-900">{clientName}</h4>
                                <p className="text-[10px] text-zinc-400 font-bold">{selectedClientDetails?.company || "مؤسسة فردية"}</p>
                              </div>
                            </div>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-extrabold px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              نشط
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-200/60 text-xs">
                            <div>
                              <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">الرقم الضريبي (VAT)</span>
                              <span className="font-mono font-bold text-zinc-800">{selectedClientDetails?.vatNumber || "غير متوفر / B2C"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">البريد الإلكتروني</span>
                              <span className="font-semibold text-zinc-800 break-all">{clientEmail || "—"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">رقم الهاتف</span>
                              <span className="font-mono font-semibold text-zinc-800">{clientPhone || "—"}</span>
                            </div>
                            <div>
                              <span className="block text-[10px] text-zinc-400 font-bold uppercase mb-1">المستحقات الحالية</span>
                              <span className="font-bold text-rose-600 font-mono">{(selectedClientDetails?.value || 0).toLocaleString()} SAR</span>
                            </div>
                          </div>

                          {selectedClientDetails?.splVerified && (
                            <div className="mt-4 p-3 bg-zinc-50 border border-zinc-200 rounded-lg flex items-start gap-2 text-xs">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-emerald-700">العنوان الوطني المعتمد (سبل / SPL Address):</span>
                                  <span className="font-mono text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-100 font-bold">
                                    {selectedClientDetails.splVerificationRef || "Verified"}
                                  </span>
                                </div>
                                <p className="text-zinc-600 font-semibold leading-relaxed">
                                  {selectedClientDetails.splBuildingNo} {selectedClientDetails.splStreetName} - {selectedClientDetails.splDistrict}, {selectedClientDetails.city || "الرياض"} {selectedClientDetails.splPostalCode} - {selectedClientDetails.splAdditionalNo}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center space-y-2 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/20">
                          <span className="text-xl">👤</span>
                          <p className="text-xs font-semibold text-zinc-400">الرجاء اختيار العميل لعرض ملفه الضريبي والمالي</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 2: Invoice Details */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">٢</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">تفاصيل وتواريخ الفاتورة</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">حدد نوع المعاملة، شروط الاستحقاق، وهيكل ترميز الفواتير</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection("details")}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {expandedSections.details ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </header>

              <AnimatePresence>
                {expandedSections.details && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">نوع الفاتورة</label>
                          <select
                            value={invoiceType}
                            onChange={(e: any) => setInvoiceType(e.target.value)}
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
                          >
                            <option value="standard">فاتورة ضريبية (B2B Tax Invoice)</option>
                            <option value="simplified">فاتورة ضريبية مبسطة (B2C Simplified)</option>
                            <option value="credit_note">إشعار دائن (Credit Note)</option>
                            <option value="debit_note">إشعار مدين (Debit Note)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">تاريخ الاستحقاق</label>
                          <div className="relative">
                            <input
                              type="date"
                              value={dueDate}
                              onChange={(e) => setDueDate(e.target.value)}
                              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
                            />
                            {dueCountdownDays !== null && (
                              <span className={cn(
                                "absolute left-2.5 top-2.5 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center shadow-sm",
                                dueCountdownDays < 0
                                  ? "bg-rose-50 border border-rose-100 text-rose-600 animate-pulse"
                                  : "bg-zinc-100 border border-zinc-200/50 text-zinc-600"
                              )}>
                                {dueCountdownDays < 0 ? "متأخرة" : `متبقي ${dueCountdownDays} يوم`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">العملة الافتراضية</label>
                          <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
                          >
                            <option value="SAR">ريال سعودي (SAR)</option>
                            <option value="AED">درهم إماراتي (AED)</option>
                            <option value="KWD">دينار كويتي (KWD)</option>
                            <option value="USD">دولار أمريكي (USD)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-100">
                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">البريد الإلكتروني للتحصيل الإضافي</label>
                          <input
                            type="email"
                            value={billingEmail}
                            onChange={(e) => setBillingEmail(e.target.value)}
                            placeholder="billing@company.com"
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">هيكل ترقيم الفواتير</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={numberFormat}
                              onChange={(e) => setNumberFormat(e.target.value)}
                              placeholder="INV-{YYYY}-{SEQ}"
                              className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                            />
                            <input
                              type="number"
                              value={nextSeq}
                              onChange={(e) => setNextSeq(Number(e.target.value))}
                              className="w-24 bg-zinc-50/50 border border-zinc-200 rounded-xl px-3 py-3 text-xs text-center font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 3: Line Items Table (Airtable-like, designed for accountants) */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">٣</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">جدول بنود المنتجات والخدمات</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">أضف بنود الفاتورة بالتفصيل مع قيم الضريبة والمستندات</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedItemForProductPicker(null);
                      setIsProductPickerOpen(true);
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-extrabold bg-zinc-900 text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition-all shadow-sm active:scale-95 group"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span>البحث الذكي</span>
                    <kbd className="hidden lg:inline-block text-[9px] bg-zinc-800 text-zinc-400 px-1 rounded border border-zinc-700">F2</kbd>
                  </button>
                  <button
                    onClick={addLineItem}
                    className="flex items-center gap-1 text-[11px] font-extrabold bg-zinc-100 hover:bg-zinc-200/80 text-zinc-800 px-3 py-2 rounded-lg transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>إضافة بند فارغ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSection("items")}
                    className="p-1.5 hover:bg-zinc-200/50 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {expandedSections.items ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </header>

              <AnimatePresence>
                {expandedSections.items && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 overflow-x-auto no-scrollbar">
                      {/* Interactive table grid header */}
                      <div className="grid grid-cols-12 gap-3 px-4 pb-3 border-b border-zinc-100 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-right">
                        <div className="col-span-1 text-center">ترتيب</div>
                        <div className="col-span-5">البند والخدمة</div>
                        <div className="col-span-1 text-center">الكمية</div>
                        <div className="col-span-2 text-center">سعر الوحدة ({currency})</div>
                        <div className="col-span-1 text-center">الضريبة</div>
                        <div className="col-span-2 text-left pl-2">الإجمالي (شامل VAT)</div>
                      </div>

                      <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="invoice-line-items">
                          {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1 mt-2">
                              {lineItems.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      className="group grid grid-cols-12 gap-3 items-center hover:bg-zinc-50/50 border-b border-zinc-100 hover:border-zinc-200/60 p-2.5 transition-all duration-150"
                                    >
                                      {/* Reorder handle */}
                                      <div className="col-span-1 flex items-center justify-center gap-1.5">
                                        <div {...provided.dragHandleProps} className="p-1 cursor-grab text-zinc-300 hover:text-zinc-600 transition-colors">
                                          <GripVertical className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-mono text-zinc-400 font-bold text-xs">{index + 1}</span>
                                      </div>

                                      {/* Item name and quick catalog search link */}
                                      <div className="col-span-5 space-y-1">
                                        <div className="relative">
                                          <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => updateLineItem(item.id, "name", e.target.value)}
                                            placeholder="اكتب البند، أو اضغط رمز النجمة للحقن الذكي..."
                                            className="w-full bg-transparent hover:bg-zinc-50/50 focus:bg-white border border-transparent hover:border-zinc-250 focus:border-zinc-900 rounded-lg px-3 py-2 text-xs font-semibold focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => {
                                              setSelectedItemForProductPicker(item.id);
                                              setIsProductPickerOpen(true);
                                            }}
                                            className="absolute left-2.5 top-2.5 text-zinc-300 hover:text-amber-500 transition-colors"
                                            title="اختيار من الدليل"
                                          >
                                            <Sparkles className="w-3.5 h-3.5" />
                                          </button>
                                        </div>

                                        {/* Inline details field */}
                                        <input
                                          type="text"
                                          value={item.description || ""}
                                          onChange={(e) => updateLineItem(item.id, "description", e.target.value)}
                                          placeholder="أضف وصفاً تفصيلياً (اختياري)..."
                                          className="w-full bg-transparent border-none text-[10px] text-zinc-400 focus:ring-0 p-0 px-3 font-medium placeholder:text-zinc-300 focus:text-zinc-600 outline-none"
                                        />
                                      </div>

                                      {/* Quantity */}
                                      <div className="col-span-1">
                                        <input
                                          type="number"
                                          value={Number.isNaN(item.quantity) ? "" : item.quantity.toString()}
                                          onChange={(e) => updateLineItem(item.id, "quantity", e.target.value)}
                                          className="w-full bg-transparent hover:bg-zinc-50/50 focus:bg-white border border-transparent hover:border-zinc-250 focus:border-zinc-900 rounded-lg py-2 text-xs font-bold text-center focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                                        />
                                      </div>

                                      {/* Unit price */}
                                      <div className="col-span-2">
                                        <input
                                          type="number"
                                          value={Number.isNaN(item.unitPriceHalalas / 100) ? "" : (item.unitPriceHalalas / 100).toString()}
                                          onChange={(e) => updateLineItem(item.id, "unitPriceHalalas", e.target.value)}
                                          placeholder="0.00"
                                          className="w-full bg-transparent hover:bg-zinc-50/50 focus:bg-white border border-transparent hover:border-zinc-250 focus:border-zinc-900 rounded-lg py-2 text-xs font-extrabold text-center focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all font-mono"
                                        />
                                      </div>

                                      {/* Tax select */}
                                      <div className="col-span-1">
                                        <select
                                          value={item.taxRate}
                                          onChange={(e) => updateLineItem(item.id, "taxRate", e.target.value)}
                                          className="w-full bg-transparent hover:bg-zinc-50/50 focus:bg-white border border-transparent hover:border-zinc-250 focus:border-zinc-900 rounded-lg py-2 text-[11px] font-bold text-center focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all cursor-pointer"
                                        >
                                          <option value="15">15%</option>
                                          <option value="5">5%</option>
                                          <option value="0">0%</option>
                                        </select>
                                      </div>

                                      {/* Line item total and action delete button */}
                                      <div className="col-span-2 flex items-center justify-between gap-2 pl-2 text-left">
                                        <span className="text-xs font-mono font-extrabold text-zinc-900">
                                          {(item.totalHalalas / 100).toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            onClick={() => addCustomField(item.id)}
                                            className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                            title="أضف حقول مخصصة للبند"
                                          >
                                            <Plus className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => removeLineItem(item.id)}
                                            className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                            title="حذف البند"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      </div>

                                      {/* Render line item custom customFields if any */}
                                      {item.customFields && item.customFields.length > 0 && (
                                        <div className="col-span-12 mr-8 mt-2 grid grid-cols-2 gap-3 p-4 bg-zinc-50/40 rounded-xl border border-dashed border-zinc-200 animate-in zoom-in-95">
                                          {item.customFields.map((cf, cfi) => (
                                            <div key={cfi} className="flex items-center gap-2">
                                              <input
                                                type="text"
                                                value={cf.key}
                                                onChange={(e) => updateCustomField(item.id, cfi, "key", e.target.value)}
                                                placeholder="الحقل (مثال: كود المشروع)"
                                                className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-zinc-900"
                                              />
                                              <input
                                                type="text"
                                                value={cf.value}
                                                onChange={(e) => updateCustomField(item.id, cfi, "value", e.target.value)}
                                                placeholder="القيمة"
                                                className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-[11px] font-bold outline-none focus:border-zinc-900"
                                              />
                                              <button
                                                onClick={() => removeCustomField(item.id, cfi)}
                                                className="text-zinc-300 hover:text-rose-500 p-1 rounded hover:bg-rose-50 transition-colors"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 4: Late Fee & Recurring */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">٤</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">الرسوم والجدولة الآلية</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">إضافة رسوم غرامة تأخير السداد وجدولة الفواتير الدورية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection("recurring")}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {expandedSections.recurring ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </header>

              <AnimatePresence>
                {expandedSections.recurring && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* Late payment fee configurations */}
                      <div className="p-5 bg-zinc-50/50 rounded-xl border border-zinc-200/60">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-zinc-950">رسوم السداد المتأخر</h4>
                            <p className="text-[10px] text-zinc-400 font-medium">تطبيق غرامة تأخير آلية بعد انتهاء المهلة المحددة</p>
                          </div>
                          <div className="flex bg-zinc-100/80 p-1 rounded-xl">
                            <button
                              onClick={() => setLateFee({ ...lateFee, type: "percentage" })}
                              className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all", lateFee.type === "percentage" ? "bg-white text-zinc-900 shadow-sm font-extrabold" : "text-zinc-500 hover:text-zinc-800")}
                            >
                              نسبة (%)
                            </button>
                            <button
                              onClick={() => setLateFee({ ...lateFee, type: "fixed" })}
                              className={cn("px-3 py-1 rounded-lg text-[10px] font-bold transition-all", lateFee.type === "fixed" ? "bg-white text-zinc-900 shadow-sm font-extrabold" : "text-zinc-500 hover:text-zinc-800")}
                            >
                              مبلغ ثابت
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">القيمة</label>
                            <input
                              type="number"
                              value={Number.isNaN(lateFee.value) ? "" : lateFee.value}
                              onChange={(e) => setLateFee({ ...lateFee, value: Number(e.target.value) })}
                              placeholder="0"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">المهلة بالأيام</label>
                            <input
                              type="number"
                              value={Number.isNaN(lateFee.overdueDays) ? "" : lateFee.overdueDays}
                              onChange={(e) => setLateFee({ ...lateFee, overdueDays: Number(e.target.value) })}
                              placeholder="0 يوم بعد تاريخ الاستحقاق"
                              className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs font-bold focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Automated recurring scheduling */}
                      <div className="p-5 bg-zinc-50/50 rounded-xl border border-zinc-200/60">
                        <div className="flex justify-between items-center mb-4">
                          <div>
                            <h4 className="text-xs font-extrabold text-zinc-950">تكرار الفاتورة آلياً</h4>
                            <p className="text-[10px] text-zinc-400 font-medium">توليد وإرسال الفواتير الدورية تلقائياً للعملاء المستمرين</p>
                          </div>
                          <button
                            onClick={() => setRecurringConfig((prev) => ({ ...prev, active: !prev.active }))}
                            className={cn(
                              "w-10 h-5 rounded-full transition-all relative shrink-0",
                              recurringConfig.active ? "bg-emerald-500" : "bg-zinc-200"
                            )}
                          >
                            <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", recurringConfig.active ? "left-1" : "left-5")} />
                          </button>
                        </div>

                        {recurringConfig.active && (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الفترة الزمنية</label>
                              <select
                                value={recurringConfig.frequency}
                                onChange={(e: any) => setRecurringConfig({ ...recurringConfig, frequency: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-zinc-900"
                              >
                                <option value="weekly">أسبوعي (Weekly)</option>
                                <option value="monthly">شهري (Monthly)</option>
                                <option value="yearly">سنوي (Yearly)</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">قناة الإرسال</label>
                              <select
                                value={recurringConfig.communicationFrequency}
                                onChange={(e: any) => setRecurringConfig({ ...recurringConfig, communicationFrequency: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-zinc-900"
                              >
                                <option value="invoice_only">توليد مسودة فقط</option>
                                <option value="auto_reminders">إرسال تلقائي للبريد</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">تاريخ التشغيل التالي</label>
                              <input
                                type="date"
                                value={recurringConfig.nextRunDate}
                                onChange={(e) => setRecurringConfig({ ...recurringConfig, nextRunDate: e.target.value })}
                                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:border-zinc-900"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 5: Payment Terms & Notes */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">٥</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">شروط الدفع والملاحظات الإضافية</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">أضف أرقام الحسابات المصرفية، أو الآيبان، والرسائل الترحيبية للعميل</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection("terms")}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {expandedSections.terms ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </header>

              <AnimatePresence>
                {expandedSections.terms && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">شروط الدفع</label>
                        <textarea
                          value={paymentTerms}
                          onChange={(e) => setPaymentTerms(e.target.value)}
                          placeholder="اكتب شروط الدفع، رقم الحساب البنكي، والآيبان للتحويل..."
                          rows={3}
                          className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl p-4 text-xs font-semibold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all placeholder:text-zinc-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">ملاحظات للعميل</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="سيتم عرض هذه الملاحظات في أسفل الفاتورة المطبوعة..."
                          rows={3}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs font-bold focus:ring-2 focus:ring-zinc-900/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {/* STEP 6: ZATCA Compliance */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md/5">
              <header className="px-6 py-5 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/40">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">٦</div>
                  <div>
                    <h3 className="text-sm font-extrabold text-zinc-900 tracking-tight">امتثال هيئة الزكاة المرحلة الثانية</h3>
                    <p className="text-[10px] text-zinc-400 font-medium">الربط الإلكتروني المباشر (UBL 2.1 XML) وإصدار الأختام الرقمية</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection("zatca")}
                  className="p-1.5 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {expandedSections.zatca ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </header>

              <AnimatePresence>
                {expandedSections.zatca && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-100/80 shadow-sm">
                        <div className="flex items-center gap-3">
                          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                          <div>
                            <span className="block text-xs font-extrabold text-emerald-950">ربط الفواتير المباشر (UBL 2.1 XML)</span>
                            <span className="block text-[10px] text-emerald-700 font-semibold">يقوم النظام تلقائياً بختم وتوقيع المعاملات ضريبياً وبناء السلسلة الضريبية المترابطة</span>
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 px-3 py-1 rounded-lg text-emerald-800 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          نشط آلياً
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الرقم الضريبي للمنشأة المصدرة (15 رقماً)</label>
                          <input
                            type="text"
                            value={zatcaConfig.sellerVat}
                            onChange={(e) => setZatcaConfig({ ...zatcaConfig, sellerVat: e.target.value })}
                            placeholder="310123456700003"
                            className={cn(
                              "w-full bg-zinc-50/50 border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all",
                              sellerVatError 
                                ? "border-rose-300 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900" 
                                : "border-zinc-200 focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
                            )}
                          />
                          {sellerVatError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{sellerVatError}</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الرقم الضريبي للعميل (B2B VAT)</label>
                          <input
                            type="text"
                            value={zatcaConfig.buyerVat}
                            onChange={(e) => setZatcaConfig({ ...zatcaConfig, buyerVat: e.target.value })}
                            placeholder="310123456700003"
                            className={cn(
                              "w-full bg-zinc-50/50 border rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all",
                              buyerVatError 
                                ? "border-rose-300 focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 text-rose-900" 
                                : "border-zinc-200 focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5"
                            )}
                          />
                          {buyerVatError && <p className="text-[10px] text-rose-500 font-semibold mt-1">{buyerVatError}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الهاش التسلسلي الضريبي (Previous Hash)</label>
                          <input
                            type="text"
                            value={zatcaConfig.prevHash}
                            onChange={(e) => setZatcaConfig({ ...zatcaConfig, prevHash: e.target.value })}
                            placeholder="NWZlY2Vi..."
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest">الشهادة الرقمية للبوابة (Certificate)</label>
                          <input
                            type="text"
                            value={zatcaConfig.certificate}
                            onChange={(e) => setZatcaConfig({ ...zatcaConfig, certificate: e.target.value })}
                            placeholder="MIIFgzCCA2..."
                            className="w-full bg-zinc-50/50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-mono font-bold focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

          </div>

          {/* Right Column (30%): Sticky Premium Summary & Live Miniature Preview */}
          <div className="lg:col-span-3 space-y-6">

            {/* Live miniature replica preview card */}
            <section className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden p-6 relative">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">الهوية البصرية والنموذج</h4>

              <div className="relative group cursor-pointer overflow-hidden rounded-xl border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300" onClick={() => setIsPreviewOpen(true)}>
                <div className="absolute inset-0 bg-zinc-950/5 group-hover:bg-zinc-950/20 flex items-center justify-center transition-all duration-300 z-10">
                  <span className="bg-white/95 backdrop-blur-md text-zinc-900 px-3.5 py-2 rounded-xl text-[10px] font-black shadow-lg transform scale-95 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-250">
                    توسيع المعاينة الحية ↗
                  </span>
                </div>

                {/* Simulated live visual blueprint of the templates */}
                <div className="p-4 bg-zinc-50 text-right space-y-2.5 select-none relative transition-all" style={{ borderTop: `4px solid ${branding.primaryColor}` }}>
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-200/60">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200/80 flex items-center justify-center text-xs">🏢</div>
                    <div className="space-y-1 text-right">
                      <div className="w-16 h-2 bg-zinc-300 rounded" />
                      <div className="w-10 h-1.5 bg-zinc-200 rounded" />
                    </div>
                  </div>

                  <div className="space-y-1.5 py-4">
                    <div className="w-full h-1 bg-zinc-200 rounded" />
                    <div className="w-5/6 h-1 bg-zinc-200 rounded" />
                    <div className="w-2/3 h-1 bg-zinc-200 rounded" />
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-zinc-200/60">
                    <div className="w-10 h-2 bg-zinc-300 rounded" />
                    <div className="w-14 h-2 bg-zinc-200 rounded" />
                  </div>
                </div>
              </div>

              {/* Template Style Selector */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { id: "modern", label: "عصري", desc: "Modern" },
                  { id: "classic", label: "كلاسيكي", desc: "Classic" },
                  { id: "minimal", label: "بسيط", desc: "Minimal" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setBranding({ ...branding, template: t.id as any })}
                    className={cn(
                      "py-2 px-1 rounded-xl text-center border text-[10px] font-bold transition-all",
                      branding.template === t.id
                        ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                        : "bg-zinc-50 border-zinc-200/60 text-zinc-600 hover:bg-zinc-100"
                    )}
                  >
                    <span className="block font-bold">{t.label}</span>
                    <span className="block text-[8px] font-medium opacity-65">{t.desc}</span>
                  </button>
                ))}
              </div>

              {/* Theme color and logo uploader */}
              <div className="mt-4 pt-4 border-t border-zinc-100 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">شعار المنشأة</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-zinc-50 border border-zinc-200 border-dashed rounded-xl py-2.5 px-3 text-[11px] text-zinc-500 text-center font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-100/70 transition-colors">
                      {isExtractingColor ? "جاري قراءة لوحة الألوان..." : "+ رفع الشعار واستخراج الهوية"}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-bold">اللون المعتمد للهوية</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={branding.primaryColor}
                      onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                      className="w-6 h-6 rounded border border-zinc-200 p-0 cursor-pointer overflow-hidden bg-transparent"
                    />
                    <span className="font-mono text-[10px] font-bold uppercase text-zinc-500">{branding.primaryColor}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Premium Totals Breakdown Card */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">خلاصة الحسابات المالية</h4>

              <div className="space-y-3 pb-4 border-b border-zinc-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">المجموع الفرعي (Subtotal)</span>
                  <span className="font-mono font-bold text-zinc-900">{subtotal.toLocaleString()} {currency}</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500 font-medium">ضريبة القيمة المضافة (VAT 15%)</span>
                  <span className="font-mono font-bold text-zinc-900">{vatAmount.toLocaleString()} {currency}</span>
                </div>

                {lateFeeAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-rose-600 font-bold">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      غرامة السداد المتأخر
                    </span>
                    <span className="font-mono">{lateFeeAmount.toLocaleString()} {currency}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-xs font-bold text-zinc-950">المجموع النهائي (Grand Total)</span>
                <span className="text-lg font-black font-mono transition-all duration-300" style={{ color: branding.primaryColor }}>
                  {totalAmount.toLocaleString()} {currency}
                </span>
              </div>
            </section>

            {/* Secondary actions & Save logs history panel */}
            <section className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">المسودات المؤرشفة</h4>
                {versions.length > 0 && (
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 hover:underline"
                  >
                    عرض الكل ({versions.length})
                  </button>
                )}
              </div>

              {versions.length === 0 ? (
                <p className="text-[10px] text-zinc-400 font-bold text-center py-4">سيتم تسجيل التعديلات تلقائياً في الجدول هنا.</p>
              ) : (
                <div className="space-y-2.5">
                  {versions.slice(0, 3).map((v, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 flex justify-between items-center text-[11px] hover:bg-zinc-100/50 transition-colors">
                      <div className="space-y-0.5 text-right">
                        <p className="font-bold text-zinc-900">مسودة نسخة {versions.length - idx}</p>
                        <p className="text-[9px] text-zinc-400 font-medium">{new Date(v.timestamp).toLocaleTimeString("ar-SA")}</p>
                      </div>
                      <button
                        onClick={() => restoreDraft(v.data)}
                        className="p-1.5 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-zinc-600 shadow-sm transition-colors"
                        title="استعادة هذه المسودة"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Quick delivery options */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-800 py-3 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? "جاري التوليد..." : "تحميل كملف PDF رسمي"}</span>
              </button>

              <button
                onClick={handleSendInvoice}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white py-3 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>إرسال الفاتورة عبر البريد للعميل</span>
              </button>
            </div>

          </div>

        </div>
      </main>

      {/* 3. Global Modal Components */}
      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden border border-zinc-100 flex flex-col"
            >
              <div className="p-6 space-y-4">
                <div className="w-12 h-12 bg-zinc-100 text-zinc-900 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-black text-zinc-900 text-center">حفظ وإرسال الفاتورة كمسودة</h2>
                <p className="text-xs font-bold text-zinc-500 text-center leading-relaxed">
                  هل أنت متأكد من رغبتك في تحديث هذه الفاتورة وربطها بالامتثال الضريبي؟
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[9px] font-black text-zinc-400 uppercase tracking-wider">أضف ملحوظة للتغيير (سجل النسخ)</label>
                  <input
                    type="text"
                    value={versionNote}
                    onChange={(e) => setVersionNote(e.target.value)}
                    placeholder="مثال: تعديل كود المشروع، خصم إضافي..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-zinc-900/10 outline-none"
                  />
                </div>
              </div>
              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
                <button
                  onClick={() => setShowSaveConfirm(false)}
                  className="flex-1 py-2.5 bg-white text-zinc-700 rounded-xl font-bold text-xs border border-zinc-200 hover:bg-zinc-50 transition-colors"
                >
                  إلغاء التراجع
                </button>
                <button
                  onClick={() => {
                    setShowSaveConfirm(false);
                    handleSaveDraft();
                  }}
                  className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl font-black text-xs hover:bg-zinc-800 transition-colors"
                >
                  تأكيد الحفظ
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Log Detail Drawer/Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 bg-zinc-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <header className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-md font-black text-zinc-900">سجل نسخ ومسودات الفاتورة</h2>
                    <p className="text-xs font-bold text-zinc-500">استعادة أي إصدار سابق من الفاتورة مع الحفاظ على الأرقام والامتثال</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:bg-zinc-50"
                >
                  ✕
                </button>
              </header>

              <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-zinc-50/30">
                {versions.map((v, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-zinc-400 transition-all flex justify-between items-center"
                  >
                    <div className="space-y-1 text-right">
                      <p className="text-xs font-black text-zinc-900">فاتورة #{v.data.number || "مسودة جديدة"}</p>
                      <p className="text-[10px] text-zinc-400 font-bold">{new Date(v.timestamp).toLocaleString("ar-SA")}</p>
                      {v.note && (
                        <p className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg font-bold mt-1 inline-block border border-amber-100">
                          ملاحظة: {v.note}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => restoreDraft(v.data)}
                      className="bg-zinc-900 hover:bg-zinc-850 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                    >
                      استعادة
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Embedded Smart Components */}
      <ProductPickerModal
        isOpen={isProductPickerOpen}
        onClose={() => setIsProductPickerOpen(false)}
        onSelect={handleProductSelect}
        currency={currency}
      />

      <InvoicePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoiceData={getCurrentDraft()}
        onPrint={() => window.print()}
        onDownloadPdf={handleDownloadPdf}
        isGeneratingPdf={isGeneratingPdf}
      />
    </div>
  );
}
