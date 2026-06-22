import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { LineItem, InvoiceBranding, Invoice } from "@/src/types";
import { useUser } from "@/src/contexts/UserContext";
import { Joyride, Step } from "react-joyride";

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
  const [paymentLink, setPaymentLink] = useState(initialData?.paymentLink || "");
  const [billingEmail, setBillingEmail] = useState(initialData?.billingEmail || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [currency, setCurrency] = useState(initialData?.currency || "SAR");
  const [paymentTerms, setPaymentTerms] = useState(
    initialData?.paymentTerms ||
      "الرجاء الدفع خلال ١٥ يوماً من تاريخ الفاتورة. تطبق رسوم تأخير بنسبة ٢٪ شهرياً."
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [lineItems, setLineItems] = useState<LineItem[]>(
    initialData?.lineItems || [
      { id: "1", name: "", quantity: 1, unitPriceHalalas: 0, taxRate: 15, totalHalalas: 0 },
    ]
  );
  const [branding, setBranding] = useState<InvoiceBranding>(
    initialData?.branding || {
      primaryColor: "#10b981",
      template: "modern",
      bilingual: true,
    }
  );

  const [isExtractingColor, setIsExtractingColor] = useState(false);
  const [numberFormat, setNumberFormat] = useState(initialData?.numberFormat || "INV-{YYYY}-{SEQ}");
  const [nextSeq, setNextSeq] = useState(1);
  const [lateFee, setLateFee] = useState<{
    type: "fixed" | "percentage";
    value: number;
    overdueDays: number;
  }>(
    initialData?.lateFee
      ? {
          type: initialData.lateFee.type,
          value:
            initialData.lateFee.type === "fixed"
              ? initialData.lateFee.valueHalalas / 100
              : initialData.lateFee.valueHalalas || 0,
          overdueDays: initialData.lateFee.overdueDays || 0,
        }
      : { type: "percentage", value: 0, overdueDays: 0 }
  );
  const [statusConfig, setStatusConfig] = useState<
    Record<string, { label: string; color: string }>
  >(
    initialData?.statusConfig || {
      draft: { label: "مسودة", color: "#71717a" },
      sent: { label: "مرسلة", color: "#3b82f6" },
      viewed: { label: "تم الاطلاع", color: "#8b5cf6" },
      paid: { label: "مدفوعة", color: "#10b981" },
      overdue: { label: "متأخرة", color: "#f43f5e" },
    }
  );

  const [zatcaConfig, setZatcaConfig] = useState(
    initialData?.zatcaConfig || {
      sellerVat: "",
      sellerName: "",
      buyerVat: "",
      isPhasedTwo: true,
      certificate: "",
      prevHash: "NWZlY2ViOTY5NGM1NDllMmJlZTIyOGM3MGVjYmY3YmNmZDRjMGFhNA==",
    }
  );

  const [sectionOrder, setSectionOrder] = useState<string[]>(
    initialData?.sectionOrder || ["details", "items", "branding", "recurring", "terms", "notes"]
  );

  const [recurringConfig, setRecurringConfig] = useState(
    initialData?.recurringConfig || {
      active: false,
      frequency: "monthly" as const,
      communicationFrequency: "invoice_only" as const,
      nextRunDate: "",
    }
  );

  const [versions, setVersions] = useState<any[]>(initialData?.logs || []);
  const [versionNote, setVersionNote] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Only run tour if creating a new invoice and it hasn't been shown before
    const hasSeenTour = localStorage.getItem("invoice_builder_tour_seen");
    if (!hasSeenTour && !initialData?.id) {
      setTimeout(() => setRunTour(true), 1000);
    }
  }, [initialData?.id]);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses = ["finished", "skipped"];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem("invoice_builder_tour_seen", "true");
    }
  };

  const steps: Step[] = [
    {
      target: ".tour-step-details",
      content: "ابدأ باختيار عميل مسجل أو إدخال تفاصيل العميل الجديد.",
    },
    {
      target: ".tour-step-items",
      content: "أضف المنتجات أو الخدمات هنا. يمكنك تغيير الأسعار والكميات وتحديث الضريبة.",
    },
    {
      target: ".tour-step-branding",
      content: "قم بتخصيص فاتورتك! ارفع شعارك وقم بتغيير اللون ليتناسب مع هويتك.",
    },
    {
      target: ".tour-step-zatca",
      content:
        "إذا كانت منشأتك تخضع لمتطلبات هيئة الزكاة المرحلة الثانية، أضف رقمك الضريبي هنا والبيانات الأخرى.",
    },
    {
      target: ".tour-step-save",
      content: "حفظ المسودة أو إرسال الفاتورة عبر الإيميل أو استخراجها كملف PDF يتم كله من هنا.",
    },
  ];

  // Auto-versioning logic (debounced)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const current = getCurrentDraft();

      // Update local versions first
      setVersions((prev) => {
        if (prev.length > 0 && JSON.stringify(prev[0].data) === JSON.stringify(current)) {
          return prev;
        }
        return [
          {
            timestamp: new Date().toISOString(),
            user: user?.name || "System",
            data: current,
          },
          ...prev,
        ].slice(0, 10);
      });

      // Background Save to Server if it's an existing draft
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
          console.error("Auto-save to server failed", err);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000); // 30 second debounce for performance

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

      // Auto-populate branding
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
    }
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
    setLineItems(lineItems.filter((item) => item.id !== id));
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
            customFields: item.customFields?.filter((_, i) => i !== fieldIndex),
          };
        }
        return item;
      })
    );
  };

  const updateLineItem = (id: string, field: string, value: any) => {
    const updated = lineItems.map((item) => {
      if (item.id === id) {
        let newItem = { ...item };

        if (field.startsWith("custom_")) {
          const [_, type, idx] = field.split("_");
          const index = parseInt(idx);
          const newFields = [...(item.customFields || [])];
          if (type === "key") newFields[index].key = value;
          else newFields[index].value = value;
          newItem.customFields = newFields;
        } else {
          newItem = { ...item, [field]: value };
        }

        // Recalculate total in Halalas
        const qty = field === "quantity" ? Number(value) : newItem.quantity;
        const priceHalalas =
          field === "unitPriceHalalas" ? Math.round(Number(value) * 100) : newItem.unitPriceHalalas;
        const tax = field === "taxRate" ? Number(value) : newItem.taxRate;

        if (field === "unitPriceHalalas") newItem.unitPriceHalalas = priceHalalas;

        const itemSubtotalHalalas = qty * newItem.unitPriceHalalas;
        newItem.totalHalalas = Math.round(itemSubtotalHalalas + itemSubtotalHalalas * (tax / 100));
        return newItem;
      }
      return item;
    });
    setLineItems(updated);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("الرجاء اختيار ملف صورة صالح (PNG, JPG, SVG)");
      return;
    }

    // Check for size (optional, but good for "corrupted" or huge files)
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة كبير جداً، الحد الأقصى 5 ميجابايت");
      return;
    }

    const url = URL.createObjectURL(file);

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setBranding({ ...branding, logo: url });
      setIsExtractingColor(true);
      const canvas = document.createElement("canvas");
      // Scale down for faster processing
      const scale = Math.min(1, 200 / Math.max(img.width, img.height));
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      try {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Use a more sophisticated approach: find the most vibrant color
        // instead of just average to avoid mud and grayscale.
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > 200) {
            // Only high opacity pixels
            const pr = data[i],
              pg = data[i + 1],
              pb = data[i + 2];

            // Saturation and Brightness checks to find "real" colors
            const max = Math.max(pr, pg, pb);
            const min = Math.min(pr, pg, pb);
            const saturation = max === 0 ? 0 : (max - min) / max;
            const brightness = max / 255;

            // Prefer colors that are saturated but not too dark/light
            if (saturation > 0.15 && brightness > 0.15 && brightness < 0.95) {
              r += pr;
              g += pg;
              b += pb;
              count++;
            }
          }
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          const hex = "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
          setBranding((prev) => ({ ...prev, primaryColor: hex }));
        } else {
          // Fallback to a default professional color if no vibrant colors found
          setBranding((prev) => ({ ...prev, primaryColor: "#10b981" }));
        }
        setIsExtractingColor(false);
      } catch (err) {
        console.error("Could not extract color. Canvas tainted.", err);
        setIsExtractingColor(false);
      }
    };
    img.onerror = () => {
      alert("تعذر تحميل ملف الصورة. قد يكون الملف تالفاً.");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const isValidZatcaVat = (vat: string | undefined) => {
    if (!vat) return true; // Empty is considered valid here, we check required in UI
    return /^\d{15}$/.test(vat) && vat.startsWith("3") && vat.endsWith("3");
  };

  const sellerVatError =
    zatcaConfig.sellerVat && !isValidZatcaVat(zatcaConfig.sellerVat)
      ? "الرقم الضريبي للمورد يجب أن يكون 15 رقماً ويبدأ وينتهي برقم 3"
      : "";
  const buyerVatError =
    zatcaConfig.buyerVat && !isValidZatcaVat(zatcaConfig.buyerVat)
      ? "الرقم الضريبي للعميل يجب أن يكون 15 رقماً ويبدأ وينتهي برقم 3"
      : "";
  const hasZatcaErrors = !!sellerVatError || !!buyerVatError;

  const calculateTotals = () => {
    const subtotalHalalas = lineItems.reduce(
      (acc, item) => acc + item.quantity * item.unitPriceHalalas,
      0
    );
    const vatAmountHalalas = lineItems.reduce(
      (acc, item) => acc + item.quantity * item.unitPriceHalalas * (item.taxRate / 100),
      0
    );
    let totalAmountHalalas = subtotalHalalas + vatAmountHalalas;

    // Automatic Late Fee Application
    let lateFeeAmountHalalas = 0;
    if (dueDate) {
      const due = new Date(dueDate);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - due.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (now > due && diffDays >= lateFee.overdueDays) {
        if (lateFee.type === "percentage") {
          lateFeeAmountHalalas = Math.round(totalAmountHalalas * (lateFee.value / 100));
        } else {
          lateFeeAmountHalalas = Math.round(lateFee.value * 100);
        }
        totalAmountHalalas += lateFeeAmountHalalas;
      }
    }

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
  };

  // Helper to generate complementary colors
  const getComplementaryColors = (hex: string) => {
    // Basic hex to HSL (simplified)
    let r = parseInt(hex.substring(1, 3), 16) / 255;
    let g = parseInt(hex.substring(3, 5), 16) / 255;
    let b = parseInt(hex.substring(5, 7), 16) / 255;

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      return ["#10b981", "#3b82f6", "#6366f1", "#f43f5e", "#f59e0b"]; // fallback
    }

    let max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    const hslToHex = (h: number, s: number, l: number) => {
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p: number, q: number, t: number) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }
      const toHex = (x: number) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    };

    // Return the base color, its complement (+180 deg), and two triadic (+120, +240) and analogous (+30)
    return [
      hex,
      hslToHex((h + 0.5) % 1, s, l), // Complementary
      hslToHex((h + 1 / 3) % 1, s, l), // Triadic 1
      hslToHex((h + 2 / 3) % 1, s, l), // Triadic 2
      hslToHex((h + 1 / 12) % 1, s, l), // Analogous
    ];
  };

  const {
    subtotal,
    vatAmount,
    totalAmount,
    lateFeeAmount,
    subtotalHalalas,
    vatAmountHalalas,
    totalAmountHalalas,
    lateFeeAmountHalalas,
  } = calculateTotals();

  const getCurrentDraft = () => {
    const year = new Date().getFullYear().toString();
    const invoiceNumber = numberFormat
      .replace("{YYYY}", year)
      .replace("{SEQ}", nextSeq.toString().padStart(3, "0"));

    return {
      clientName,
      clientEmail,
      billingEmail,
      dueDate,
      currency,
      paymentTerms,
      notes,
      lineItems,
      subtotalHalalas,
      vatAmountHalalas,
      totalAmountHalalas,
      branding,
      number: invoiceNumber,
      clientId: selectedClientId,
      clientPhone,
      paymentLink,
      zatcaData: zatcaConfig.sellerVat
        ? generateZatcaPayload(totalAmountHalalas, invoiceNumber)
        : null,
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
    // TLV encoding for ZATCA QR Code (Simplified formulation)
    // 1. Seller Name
    // 2. Tax Number
    // 3. Timestamp
    // 4. Invoice Total
    // 5. VAT Total
    const vatTotal = totalHalalas * (15 / 115); // Assuming standard 15% VAT
    return {
      xml: `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${invoiceNumber}</cbc:ID>
  <cbc:UUID>${crypto.randomUUID()}</cbc:UUID>
  <cbc:IssueDate>${new Date().toISOString().split("T")[0]}</cbc:IssueDate>
  <cbc:IssueTime>${new Date().toISOString().split("T")[1].split(".")[0]}</cbc:IssueTime>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cac:AdditionalDocumentReference><cbc:ID>ICV</cbc:ID><cbc:UUID>1</cbc:UUID></cac:AdditionalDocumentReference>
  <cac:AdditionalDocumentReference><cbc:ID>PIH</cbc:ID><cac:Attachment><cbc:EmbeddedDocumentBinaryObject mimeCode="text/plain">${zatcaConfig.prevHash}</cbc:EmbeddedDocumentBinaryObject></cac:Attachment></cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty><cac:Party><cac:PartyTaxScheme><cbc:CompanyID>${zatcaConfig.sellerVat}</cbc:CompanyID><cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme></cac:PartyTaxScheme></cac:Party></cac:AccountingSupplierParty>
</Invoice>`,
      qrBase64: btoa(`zatca-qr-payload-${zatcaConfig.sellerVat}-${totalHalalas}`),
      hash: btoa(crypto.randomUUID()).substring(0, 44),
      icv: 1,
      generatedAt: new Date().toISOString(),
    };
  };

  const handleSaveDraft = async () => {
    if (hasZatcaErrors) {
      alert("الرجاء تصحيح أخطاء الرقم الضريبي (ZATCA) قبل الحفظ");
      return;
    }
    const currentDraft = getCurrentDraft();
    setVersions((prev) =>
      [
        {
          timestamp: new Date().toISOString(),
          user: user?.name || "System",
          note: versionNote,
          data: currentDraft,
        },
        ...prev,
      ].slice(0, 10)
    );
    setVersionNote("");

    // Call the real save API
    try {
      const url = initialData?.id ? `/api/invoices/${initialData.id}` : "/api/invoices";
      const method = initialData?.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...currentDraft, versionNote }),
      });
      if (res.ok) {
        const savedInvoice = await res.json();
        setPaymentLink(savedInvoice.paymentLink);

        await fetch("/api/audit-logs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module: "INVOICE",
            action: initialData?.id ? "Update Invoice" : "Create Invoice",
            payload: { invoiceNumber: currentDraft.number, clientName: currentDraft.clientName },
          }),
        });

        onSave(savedInvoice);
      }
    } catch (err) {
      console.error("Save failed", err);
      onSave(currentDraft); // Fallback
    }
  };

  const handleDownloadPdf = async () => {
    const currentDraft = getCurrentDraft();
    if (!initialData?.id && !paymentLink) {
      alert("الرجاء حفظ الفاتورة قبل تحميل نسخة PDF");
      return;
    }

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
      alert("فشل توليد نسخة PDF. يرجى المحاولة لاحقاً.");
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
    onSave(currentDraft);

    try {
      await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: clientEmail,
          subject: `Invoice ${currentDraft.number} from Your Company`,
          body: `Dear ${clientName},\n\nPlease find the details of your invoice ${currentDraft.number}.\nTotal Amount: ${totalAmount.toLocaleString()} ${currency}\nDue Date: ${dueDate || "N/A"}\n\nYou can view and pay your invoice online at: ${window.location.origin}/pay/${currentDraft.number}\n\nBest Regards,\nYour Company`,
        }),
      });

      await fetch("/api/audit-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module: "INVOICE",
          action: "Send Invoice",
          payload: {
            invoiceNumber: currentDraft.number,
            clientName: currentDraft.clientName,
            email: clientEmail,
          },
        }),
      });

      alert("تم إرسال الفاتورة بنجاح عبر البريد الإلكتروني.");
    } catch (err) {
      console.error("Failed to send invoice", err);
      alert("حدث خطأ أثناء إرسال الفاتورة.");
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
      value:
        draft.lateFee?.type === "fixed"
          ? draft.lateFee.valueHalalas / 100
          : draft.lateFee?.value || 0,
      overdueDays: draft.lateFee?.overdueDays || 0,
    });
    setSectionOrder(
      draft.sectionOrder || ["details", "items", "branding", "recurring", "terms", "notes"]
    );
    setRecurringConfig(
      draft.recurringConfig || {
        active: false,
        frequency: "monthly",
        communicationFrequency: "invoice_only",
        nextRunDate: "",
      }
    );
    setStatusConfig(
      draft.statusConfig || {
        draft: { label: "مسودة", color: "#71717a" },
        sent: { label: "مرسلة", color: "#3b82f6" },
        viewed: { label: "تم الاطلاع", color: "#8b5cf6" },
        paid: { label: "مدفوعة", color: "#10b981" },
        overdue: { label: "متأخرة", color: "#f43f5e" },
      }
    );
    setZatcaConfig(
      draft.zatcaConfig || {
        sellerVat: "",
        sellerName: "",
        buyerVat: "",
        isPhasedTwo: true,
        certificate: "",
        prevHash: "",
      }
    );
    setPaymentLink(draft.paymentLink || "");
    setShowHistory(false);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newOrder = [...sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    setSectionOrder(newOrder);
  };

  return (
    <div className="relative bg-white rounded-3xl border border-zinc-100 shadow-xl overflow-hidden flex flex-col h-[85vh]">
      <header className="px-4 md:px-8 py-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="p-2 hover:bg-white rounded-xl transition-all">
            <ArrowRight className="w-5 h-5 rtl:rotate-0 rotate-180" />
          </button>
          <div className="flex flex-col">
            <h2 className="text-xl font-bold text-zinc-900 leading-none">إنشاء فاتورة جديدة</h2>
            {isAutoSaving && (
              <span className="text-[10px] text-primary font-black animate-pulse flex items-center gap-1 mt-1">
                <Clock className="w-2.5 h-2.5" /> جاري الحفظ التلقائي...
              </span>
            )}
            {!isAutoSaving && lastAutoSave && (
              <span className="text-[10px] text-zinc-400 font-bold mt-1">
                آخر حفظ تلقائي: {lastAutoSave.toLocaleTimeString("ar-SA")}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-2 md:gap-3 flex-wrap">
          <button
            onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
            className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-3 md:px-4 py-2 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden md:inline">إعدادات متقدمة</span>
          </button>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-3 md:px-4 py-2 rounded-xl font-bold text-xs hover:bg-zinc-200 transition-all"
          >
            <History className="w-4 h-4" />
            <span className="hidden md:inline">سجل النسخ ({versions.length})</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
        <Joyride
          {...({
            steps,
            run: runTour,
            continuous: true,
            showSkipButton: true,
            showProgress: true,
            callback: handleJoyrideCallback,
            styles: {
              options: { primaryColor: "#10b981", zIndex: 1000 },
            },
            locale: { back: "السابق", close: "إغلاق", last: "إنهاء", next: "التالي", skip: "تخطي" },
          } as any)}
        />
        {/* Form Area */}
        <div className="flex-1 p-4 md:p-8 space-y-12 border-b lg:border-b-0 rtl:lg:border-l ltr:lg:border-r border-zinc-100">
          <DragDropContext
            onDragEnd={(result) => {
              if (!result.destination) return;
              const items = Array.from(sectionOrder);
              const [reorderedItem] = items.splice(result.source.index, 1);
              items.splice(result.destination.index, 0, reorderedItem);
              setSectionOrder(items);
            }}
          >
            <Droppable droppableId="builder-sections">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-12 relative pb-20"
                >
                  {sectionOrder.map((sectionId, index) => (
                    <React.Fragment key={sectionId}>
                      <Draggable draggableId={sectionId} index={index}>
                        {(provided, snapshot) => (
                          <section
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={cn(
                              "relative group/section bg-white rounded-2xl border transition-all p-2 -m-2",
                              snapshot.isDragging
                                ? "shadow-2xl border-primary/30 z-50 scale-[1.02]"
                                : "border-transparent hover:border-zinc-100 hover:shadow-sm"
                            )}
                          >
                            {/* Drag/Move Handles */}
                            <div className="absolute -left-10 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
                              <button
                                onClick={() => moveSection(index, "up")}
                                disabled={index === 0}
                                className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                              >
                                <ChevronUp className="w-4 h-4" />
                              </button>
                              <div
                                {...provided.dragHandleProps}
                                className="p-1.5 text-zinc-300 cursor-grab active:cursor-grabbing hover:text-primary"
                              >
                                <GripVertical className="w-4 h-4" />
                              </div>
                              <button
                                onClick={() => moveSection(index, "down")}
                                disabled={index === sectionOrder.length - 1}
                                className="p-1.5 bg-white border border-zinc-200 rounded-lg text-zinc-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                              >
                                <ChevronDown className="w-4 h-4" />
                              </button>
                            </div>

                            {sectionId === "branding" && (
                              <div className="tour-step-branding p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                                    <Palette className="w-6 h-6" />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black text-zinc-900">
                                      هوية الفاتورة (Header)
                                    </h3>
                                    <p className="text-xs font-bold text-zinc-500">
                                      اختر شعار منشأتك والألوان والنمط العام
                                    </p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                  <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                                      شعار المنشأة
                                    </label>
                                    <div className="flex flex-col gap-3">
                                      <div className="w-full h-32 bg-white border-2 border-dashed border-zinc-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                                        {branding.logo ? (
                                          <img
                                            src={branding.logo}
                                            className="w-full h-full object-contain p-4"
                                          />
                                        ) : (
                                          <Plus className="w-8 h-8 text-zinc-300 group-hover:text-primary transition-colors" />
                                        )}
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={handleLogoUpload}
                                          className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                        {branding.logo && (
                                          <button
                                            onClick={() =>
                                              setBranding({ ...branding, logo: undefined })
                                            }
                                            className="absolute top-2 right-2 p-1.5 bg-white shadow-lg rounded-lg text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        )}
                                      </div>
                                      <p className="text-[10px] text-zinc-400 text-center font-bold">
                                        سيتم استخراج اللون الأساسي تلقائياً عند رفع الشعار
                                      </p>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                                      اللون والموضوع كود HEX
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="color"
                                        value={branding.primaryColor || "#10b981"}
                                        onChange={(e) =>
                                          setBranding({ ...branding, primaryColor: e.target.value })
                                        }
                                        className="w-12 h-12 bg-white border border-zinc-200 rounded-2xl cursor-pointer p-1"
                                      />
                                      <input
                                        type="text"
                                        value={branding.primaryColor}
                                        onChange={(e) =>
                                          setBranding({ ...branding, primaryColor: e.target.value })
                                        }
                                        className="flex-1 bg-white border border-zinc-200 rounded-2xl px-4 text-sm font-black font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                                      />
                                    </div>
                                    <div className="flex gap-2 justify-center">
                                      {getComplementaryColors(
                                        branding.primaryColor || "#10b981"
                                      ).map((c, idx) => (
                                        <button
                                          key={`${c}-${idx}`}
                                          onClick={() =>
                                            setBranding({ ...branding, primaryColor: c })
                                          }
                                          className={cn(
                                            "w-6 h-6 rounded-lg",
                                            branding.primaryColor === c &&
                                              "ring-2 ring-primary ring-offset-2 shadow-lg"
                                          )}
                                          style={{ backgroundColor: c }}
                                          title={
                                            idx === 0 ? "الأساسي" : idx === 1 ? "مكمل" : "مقترح"
                                          }
                                        />
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest px-1">
                                      نمط القالب
                                    </label>
                                    <select
                                      value={branding.template}
                                      onChange={(e) =>
                                        setBranding({
                                          ...branding,
                                          template: e.target.value as any,
                                        })
                                      }
                                      className="w-full bg-white border border-zinc-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 appearance-none"
                                    >
                                      <option value="modern">عصري (Modern)</option>
                                      <option value="classic">كلاسيكي (Classic)</option>
                                      <option value="minimal">بسيط (Minimal)</option>
                                    </select>
                                    <div className="flex items-center justify-between px-2">
                                      <span className="text-[10px] font-black text-zinc-400">
                                        لغة الفاتورة الثنائية (Ar/En)
                                      </span>
                                      <button
                                        onClick={() =>
                                          setBranding({
                                            ...branding,
                                            bilingual: !branding.bilingual,
                                          })
                                        }
                                        className={cn(
                                          "w-10 h-5 rounded-full transition-all relative",
                                          branding.bilingual ? "bg-primary" : "bg-zinc-200"
                                        )}
                                      >
                                        <div
                                          className={cn(
                                            "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                            branding.bilingual ? "right-1" : "right-6"
                                          )}
                                        />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {sectionId === "details" && (
                              <div className="tour-step-details grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                                <div className="col-span-2 space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    اختيار عميل مسجل
                                  </label>
                                  <select
                                    value={selectedClientId}
                                    onChange={(e) => handleClientChange(e.target.value)}
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-bold text-zinc-900"
                                  >
                                    <option value="">حدد عميل من القائمة (اختياري)...</option>
                                    {clients.map((c) => (
                                      <option key={c.id} value={c.id}>
                                        {c.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    العميل / المؤسسة
                                  </label>
                                  <input
                                    type="text"
                                    value={clientName}
                                    onChange={(e) => setClientName(e.target.value)}
                                    placeholder="مثلاً: شركة توريدات الرياض"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    البريد الإلكتروني للعميل
                                  </label>
                                  <input
                                    type="email"
                                    value={clientEmail}
                                    onChange={(e) => setClientEmail(e.target.value)}
                                    placeholder="client@domain.com"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    رقم جوال العميل
                                  </label>
                                  <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={(e) => setClientPhone(e.target.value)}
                                    placeholder="مثلاً: 0500000000"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold text-left rtl:text-right"
                                    dir="ltr"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    إرسال الفاتورة إلى (اختياري)
                                  </label>
                                  <input
                                    type="email"
                                    value={billingEmail}
                                    onChange={(e) => setBillingEmail(e.target.value)}
                                    placeholder="billing@domain.com"
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    تاريخ الاستحقاق
                                  </label>
                                  <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    العملة
                                  </label>
                                  <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
                                  >
                                    <option value="SAR">ريال سعودي (SAR)</option>
                                    <option value="AED">درهم إماراتي (AED)</option>
                                    <option value="KWD">دينار كويتي (KWD)</option>
                                    <option value="USD">دولار أمريكي (USD)</option>
                                  </select>
                                </div>
                              </div>
                            )}

                            {sectionId === "items" && (
                              <div className="tour-step-items space-y-4 p-4">
                                <div className="flex justify-between items-center">
                                  <h3 className="font-black text-sm text-zinc-900">
                                    بنود الفاتورة
                                  </h3>
                                  <button
                                    onClick={addLineItem}
                                    className="text-xs font-bold text-primary flex items-center gap-1 hover:underline px-3 py-1 bg-primary/5 rounded-lg"
                                  >
                                    <Plus className="w-3 h-3" /> إضافة بند
                                  </button>
                                </div>

                                <div className="space-y-6">
                                  <div className="grid grid-cols-12 gap-3 px-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                                    <div className="col-span-1">#</div>
                                    <div className="col-span-5">البند / الخدمة</div>
                                    <div className="col-span-1 text-center">الكمية</div>
                                    <div className="col-span-2 text-center">السعر</div>
                                    <div className="col-span-1 text-center">الضريبة</div>
                                    <div className="col-span-2 text-left">الإجمالي</div>
                                  </div>

                                  {lineItems.map((item, index) => (
                                    <div key={item.id} className="space-y-3">
                                      <div className="grid grid-cols-12 gap-3 items-start group">
                                        <div className="col-span-1 py-3 text-zinc-400 font-black text-center">
                                          {index + 1}
                                        </div>
                                        <div className="col-span-5 space-y-2">
                                          <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) =>
                                              updateLineItem(item.id, "name", e.target.value)
                                            }
                                            placeholder="إسم المنتج (مثلاً: تصميم هوية، تطوير موقع...)"
                                            className="w-full bg-zinc-50 border-none rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                                          />
                                          {(!item.customFields ||
                                            item.customFields.length === 0) && (
                                            <button
                                              type="button"
                                              onClick={() => addCustomField(item.id)}
                                              className="text-[10px] text-zinc-400 hover:text-primary font-bold px-2 py-1 transition-colors flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100"
                                            >
                                              <Plus className="w-3 h-3" />
                                              إضافة تفاصيل مخصصة
                                            </button>
                                          )}
                                          {/* Removed duplicated inline custom fields UI */}
                                        </div>
                                        <div className="col-span-1">
                                          <input
                                            type="number"
                                            value={
                                              Number.isNaN(item.quantity)
                                                ? ""
                                                : item.quantity.toString()
                                            }
                                            onChange={(e) =>
                                              updateLineItem(item.id, "quantity", e.target.value)
                                            }
                                            className="w-full bg-zinc-50 border-none rounded-xl px-2 py-2.5 text-xs font-bold text-center focus:ring-2 focus:ring-primary/20"
                                          />
                                        </div>
                                        <div className="col-span-2">
                                          <input
                                            type="number"
                                            value={
                                              Number.isNaN(item.unitPriceHalalas / 100)
                                                ? ""
                                                : (item.unitPriceHalalas / 100).toString()
                                            }
                                            onChange={(e) =>
                                              updateLineItem(
                                                item.id,
                                                "unitPriceHalalas",
                                                e.target.value
                                              )
                                            }
                                            className="w-full bg-zinc-50 border-none rounded-xl px-2 py-2.5 text-xs font-bold text-center focus:ring-2 focus:ring-primary/20"
                                          />
                                        </div>
                                        <div className="col-span-1">
                                          <select
                                            value={item.taxRate}
                                            onChange={(e) =>
                                              updateLineItem(item.id, "taxRate", e.target.value)
                                            }
                                            className="w-full bg-zinc-50 border-none rounded-xl px-1 py-2.5 text-[10px] font-bold text-center focus:ring-2 focus:ring-primary/20 appearance-none"
                                          >
                                            <option value="15">15%</option>
                                            <option value="5">5%</option>
                                            <option value="0">0%</option>
                                          </select>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-between gap-2 pl-2">
                                          <span className="text-xs font-black text-zinc-900">
                                            {(item.totalHalalas / 100).toLocaleString()}
                                          </span>
                                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() => addCustomField(item.id)}
                                              title="Add Custom Field"
                                              className="p-1.5 text-zinc-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                            >
                                              <Plus className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                              onClick={() => removeLineItem(item.id)}
                                              className="p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Custom Fields for Item */}
                                      {item.customFields && item.customFields.length > 0 && (
                                        <div className="ml-12 grid grid-cols-2 gap-3 p-4 bg-zinc-50/50 rounded-2xl border border-dashed border-zinc-200 animate-in zoom-in-95">
                                          {item.customFields.map((cf, cfi) => (
                                            <div key={cfi} className="flex items-center gap-2">
                                              <div className="flex-1 space-y-1">
                                                <label className="text-[8px] font-black text-zinc-400 px-1 uppercase tracking-tighter">
                                                  اسم الحقل (مثال: Project Code)
                                                </label>
                                                <input
                                                  type="text"
                                                  value={cf.key}
                                                  onChange={(e) =>
                                                    updateCustomField(
                                                      item.id,
                                                      cfi,
                                                      "key",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="مثلاً: كود المشروع"
                                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all uppercase"
                                                />
                                              </div>
                                              <div className="flex-1 space-y-1">
                                                <label className="text-[8px] font-black text-zinc-400 px-1 uppercase tracking-tighter">
                                                  القيمة
                                                </label>
                                                <input
                                                  type="text"
                                                  value={cf.value}
                                                  onChange={(e) =>
                                                    updateCustomField(
                                                      item.id,
                                                      cfi,
                                                      "value",
                                                      e.target.value
                                                    )
                                                  }
                                                  placeholder="مثلاً: PRJ-2024-X"
                                                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                />
                                              </div>
                                              <button
                                                onClick={() => removeCustomField(item.id, cfi)}
                                                className="pt-4 text-zinc-300 hover:text-rose-500 transition-colors"
                                              >
                                                <Trash2 className="w-4 h-4" />
                                              </button>
                                            </div>
                                          ))}
                                          {/* Add another field button */}
                                          <div className="col-span-2 flex justify-start mt-2">
                                            <button
                                              type="button"
                                              onClick={() => addCustomField(item.id)}
                                              className="text-xs font-bold text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                                            >
                                              <Plus className="w-3.5 h-3.5" />
                                              إضافة حقل آخر
                                            </button>
                                          </div>
                                        </div>
                                      )}

                                      {/* If no custom fields, maybe show a button underneath the title or just rely on the hover action. Let's rely on hover for the first one for cleanliness, but keep it visible on hover. Actually wait, let's keep the hover action but make it a little more obvious. */}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {sectionId === "recurring" && (
                              <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center font-black">
                                    <Clock className="w-6 h-6" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-black text-zinc-900">
                                      إعدادات الفاتورة الدورية
                                    </h3>
                                    <p className="text-xs font-bold text-zinc-500">
                                      أتمتة إصدار هذه الفاتورة وإرسالها للعميل دورياً
                                    </p>
                                  </div>
                                  <button
                                    onClick={() =>
                                      setRecurringConfig({
                                        ...recurringConfig,
                                        active: !recurringConfig.active,
                                      })
                                    }
                                    className={cn(
                                      "w-12 h-6 rounded-full transition-all relative",
                                      recurringConfig.active ? "bg-primary" : "bg-zinc-200"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                                        recurringConfig.active ? "right-1" : "right-7"
                                      )}
                                    />
                                  </button>
                                </div>

                                {recurringConfig.active && (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4">
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        التكرار (Frequency)
                                      </label>
                                      <select
                                        value={recurringConfig.frequency}
                                        onChange={(e) =>
                                          setRecurringConfig({
                                            ...recurringConfig,
                                            frequency: e.target.value as any,
                                          })
                                        }
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
                                      >
                                        <option value="weekly">أسبوعياً</option>
                                        <option value="monthly">شهرياً</option>
                                        <option value="yearly">سنوياً</option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        التواصل مع العميل
                                      </label>
                                      <select
                                        value={recurringConfig.communicationFrequency}
                                        onChange={(e) =>
                                          setRecurringConfig({
                                            ...recurringConfig,
                                            communicationFrequency: e.target.value as any,
                                          })
                                        }
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 appearance-none font-bold"
                                      >
                                        <option value="invoice_only">إرسال الفاتورة فقط</option>
                                        <option value="auto_reminders">
                                          إرسال الفاتورة مع التذكيرات الآلية
                                        </option>
                                      </select>
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                        تاريخ التنفيذ القادم
                                      </label>
                                      <input
                                        type="date"
                                        value={recurringConfig.nextRunDate}
                                        onChange={(e) =>
                                          setRecurringConfig({
                                            ...recurringConfig,
                                            nextRunDate: e.target.value,
                                          })
                                        }
                                        className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 font-bold"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {sectionId === "terms" && (
                              <div className="p-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    شروط الدفع
                                  </label>
                                  <input
                                    type="text"
                                    value={paymentTerms}
                                    onChange={(e) => setPaymentTerms(e.target.value)}
                                    placeholder="مثلاً: الدفع عند الاستلام، تحويل بنكي خلال 7 أيام..."
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>
                              </div>
                            )}

                            {sectionId === "notes" && (
                              <div className="p-4">
                                <div className="space-y-2">
                                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                                    ملاحظات إضافية
                                  </label>
                                  <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="سيتم عرض هذه الملاحظات في أسفل الفاتورة..."
                                    rows={2}
                                    className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 resize-none"
                                  />
                                </div>
                              </div>
                            )}
                          </section>
                        )}
                      </Draggable>
                    </React.Fragment>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* Customization & Totals Area */}
        <aside className="w-full lg:w-96 p-4 md:p-8 bg-zinc-50/50 flex flex-col gap-8 lg:overflow-y-auto no-scrollbar">
          <section className="space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Palette className="w-4 h-4 text-zinc-400" /> التخصيص والسمات
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-medium text-zinc-500">
                  اللغة الثنائية (Ar/En)
                </span>
                <button
                  onClick={() => setBranding({ ...branding, bilingual: !branding.bilingual })}
                  className={cn(
                    "w-10 h-5 rounded-full transition-all relative",
                    branding.bilingual ? "bg-primary" : "bg-zinc-200"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      branding.bilingual ? "right-6" : "right-1"
                    )}
                  />
                </button>
              </div>
              <div className="space-y-4">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                  نمط التصميم
                </span>

                {/* Live Preview Miniature */}
                <div
                  className="p-4 rounded-3xl bg-white border border-zinc-200 shadow-sm overflow-hidden scale-75 -mx-8 -my-6 origin-center rotate-3 border-t-4"
                  style={{ borderTopColor: branding.primaryColor }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {branding.logo ? (
                        <img src={branding.logo} className="w-full h-full object-contain" />
                      ) : (
                        <Palette className="w-6 h-6 text-zinc-300" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="w-16 h-2 bg-zinc-200 rounded-full mb-1 ml-auto" />
                      <div className="w-10 h-2 bg-zinc-100 rounded-full ml-auto" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="w-full h-1 bg-zinc-100 rounded-full" />
                    <div className="w-3/4 h-1 bg-zinc-100 rounded-full" />
                  </div>
                  <div className="flex gap-1 justify-end">
                    <div
                      className="w-8 h-4 rounded-md"
                      style={{ backgroundColor: branding.primaryColor + "20" }}
                    />
                    <div
                      className="w-12 h-4 rounded-md"
                      style={{ backgroundColor: branding.primaryColor }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  {[
                    { id: "modern", label: "عصري (Modern)", desc: "تصميم أنيق مع مساحات بيضاء" },
                    { id: "classic", label: "كلاسيكي (Classic)", desc: "طابع تقليدي للشركات" },
                    { id: "minimal", label: "بسيط (Minimal)", desc: "تركيز عالي على البيانات" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setBranding({ ...branding, template: t.id as any })}
                      className={cn(
                        "p-4 rounded-2xl text-right transition-all border flex flex-col gap-1",
                        branding.template === t.id
                          ? "bg-zinc-900 text-white border-zinc-900 shadow-xl shadow-zinc-900/10 scale-[1.02]"
                          : "bg-white text-zinc-600 border-zinc-100 hover:border-zinc-200"
                      )}
                    >
                      <span className="text-xs font-black">{t.label}</span>
                      <span
                        className={cn(
                          "text-[9px] font-bold opacity-60",
                          branding.template === t.id ? "text-primary" : "text-zinc-400"
                        )}
                      >
                        {t.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <span className="text-[11px] font-medium text-zinc-500">
                  رابط الشعار المخصص أو رفعه
                </span>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    value={branding.logo || ""}
                    onChange={(e) => setBranding({ ...branding, logo: e.target.value })}
                    placeholder="https://company.com/logo.png"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 text-xs focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="w-full bg-white border border-dashed border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-500 text-center font-bold flex items-center justify-center gap-2 hover:bg-zinc-50 transition-colors relative">
                      {isExtractingColor ? (
                        <div className="animate-pulse flex items-center gap-2 text-primary">
                          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          جاري استخراج اللون...
                        </div>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> تحميل شعار جديد واستخراج اللون
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  <span>الهوية اللونية</span>
                  <div className="flex gap-1">
                    {["#10b981", "#3b82f6", "#6366f1", "#f43f5e", "#f59e0b"].map((c) => (
                      <button
                        key={c}
                        onClick={() => setBranding({ ...branding, primaryColor: c })}
                        className={cn(
                          "w-3 h-3 rounded-full border border-white/20",
                          branding.primaryColor === c && "ring-2 ring-zinc-900 ring-offset-2"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor || "#10b981"}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-10 h-10 p-1 bg-white border border-zinc-200 rounded-xl cursor-pointer shrink-0 shadow-sm transition-transform active:scale-95"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor || "#10b981"}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 text-xs focus:ring-2 focus:ring-primary/20 uppercase font-mono font-black"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                  تنسيق رقم الفاتورة
                </span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value)}
                    placeholder="INV-{YYYY}-{SEQ}"
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-[9px] text-zinc-400">
                    استخدم {"{YYYY}"} للسنة و {"{SEQ}"} للتسلسل.
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                  تخصيص الحالات والخدمات
                </span>
                <div className="space-y-3">
                  {(
                    Object.entries(statusConfig) as [string, { label: string; color: string }][]
                  ).map(([key, config]) => (
                    <div key={key} className="flex gap-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={config.label}
                          onChange={(e) =>
                            setStatusConfig({
                              ...statusConfig,
                              [key]: { ...config, label: e.target.value },
                            })
                          }
                          className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-2 py-1.5 text-[10px] font-bold focus:ring-1 focus:ring-primary/20"
                        />
                      </div>
                      <input
                        type="color"
                        value={config.color}
                        onChange={(e) =>
                          setStatusConfig({
                            ...statusConfig,
                            [key]: { ...config, color: e.target.value },
                          })
                        }
                        className="w-8 h-8 rounded-lg border border-zinc-200 cursor-pointer overflow-hidden p-0"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="tour-step-zatca space-y-4 pt-4 border-t border-zinc-100">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                    التكامل مع هيئة الزكاة المرحلة الثانية (ZATCA Phase 2)
                  </span>
                  <div className="w-8 h-4 bg-emerald-500 rounded-full relative shadow-inner">
                    <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label
                        className={cn(
                          "text-[9px] font-black uppercase",
                          sellerVatError ? "text-rose-500" : "text-zinc-500"
                        )}
                      >
                        الرقم الضريبي للمنشأة (15 رقم)
                      </label>
                      <input
                        type="text"
                        value={zatcaConfig.sellerVat}
                        onChange={(e) =>
                          setZatcaConfig({ ...zatcaConfig, sellerVat: e.target.value })
                        }
                        className={cn(
                          "w-full bg-zinc-50 border rounded-lg px-3 py-2 text-xs focus:ring-1",
                          sellerVatError
                            ? "border-rose-300 focus:ring-rose-200"
                            : "border-zinc-100 focus:ring-primary/20"
                        )}
                        placeholder="310123456700003"
                      />
                      {sellerVatError && (
                        <p className="text-[10px] text-rose-500">{sellerVatError}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <label
                        className={cn(
                          "text-[9px] font-black uppercase",
                          buyerVatError ? "text-rose-500" : "text-zinc-500"
                        )}
                      >
                        الرقم الضريبي للعميل (Buyer VAT)
                      </label>
                      <input
                        type="text"
                        value={zatcaConfig.buyerVat}
                        onChange={(e) =>
                          setZatcaConfig({ ...zatcaConfig, buyerVat: e.target.value })
                        }
                        className={cn(
                          "w-full bg-zinc-50 border rounded-lg px-3 py-2 text-xs focus:ring-1",
                          buyerVatError
                            ? "border-rose-300 focus:ring-rose-200"
                            : "border-zinc-100 focus:ring-primary/20"
                        )}
                        placeholder="اختياري B2B"
                      />
                      {buyerVatError && (
                        <p className="text-[10px] text-rose-500">{buyerVatError}</p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase">
                        الهاش السابق (Previous Hash)
                      </label>
                      <input
                        type="text"
                        value={zatcaConfig.prevHash || ""}
                        onChange={(e) =>
                          setZatcaConfig({ ...zatcaConfig, prevHash: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 font-mono"
                        placeholder="NWZlY2ViNj..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-zinc-500 uppercase">
                        الشهادة الرقمية (Certificate)
                      </label>
                      <input
                        type="text"
                        value={zatcaConfig.certificate || ""}
                        onChange={(e) =>
                          setZatcaConfig({ ...zatcaConfig, certificate: e.target.value })
                        }
                        className="w-full bg-zinc-50 border border-zinc-100 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-primary/20 font-mono"
                        placeholder="MIIFgzCCA2ug..."
                      />
                    </div>
                  </div>
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-[10px] font-black text-emerald-900">
                        الربط المباشر مع بوابة "فاتورة" مفعل
                      </span>
                    </div>
                    <p className="text-[9px] text-emerald-700 leading-relaxed font-bold">
                      يتم الآن توليد XML UBL 2.1 وربط الهاش التسلسلي (Prev Hash:{" "}
                      {zatcaConfig.prevHash ? zatcaConfig.prevHash.substring(0, 10) : "..."}...)
                      آلياً عند الحفظ لضمان الامتثال التام مع متطلبات المرحلة الثانية.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  setBranding({
                    primaryColor: "#10b981",
                    template: "modern",
                    bilingual: true,
                    logo: undefined,
                  })
                }
                className="w-full py-2 bg-zinc-200/50 hover:bg-zinc-200 text-zinc-700 rounded-xl text-xs font-bold transition-colors mt-2"
              >
                إعادة ضبط التخصيص
              </button>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
                  شروط الدفع الافتراضية
                </span>
                <div className="space-y-2">
                  <textarea
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24"
                    placeholder="مثال: الدفع خلال ١٤ يوم..."
                  />
                </div>
              </div>
            </div>
          </section>

          <footer className="tour-step-save mt-auto space-y-4 border-t border-zinc-100 pt-6">
            {paymentLink && (
              <div className="p-4 bg-zinc-900 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Share2 className="w-3 h-3 text-zinc-400" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      رابط الدفع المباشر
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(paymentLink);
                      alert("تم نسخ الرابط بنجاح");
                    }}
                    className="text-[10px] font-black text-primary hover:underline transition-all"
                  >
                    نسخ الرابط
                  </button>
                </div>
                <div className="bg-white/5 p-2 rounded-lg truncate text-[10px] text-zinc-300 font-mono">
                  {paymentLink}
                </div>
              </div>
            )}
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">المجموع الفرعي</span>
              <span className="font-medium">
                {subtotal.toLocaleString()} {currency}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">ضريبة القيمة المضافة</span>
              <span className="font-medium">
                {vatAmount.toLocaleString()} {currency}
              </span>
            </div>
            {lateFeeAmount > 0 && (
              <div className="flex justify-between items-center text-xs text-rose-600 font-bold">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> رسوم تأخير
                </span>
                <span>
                  {lateFeeAmount.toLocaleString()} {currency}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-zinc-900">الإجمالي</span>
              <span className="text-lg font-bold text-primary">
                {totalAmount.toLocaleString()} {currency}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">
                ملاحظة النسخة (اختياري)
              </label>
              <input
                type="text"
                value={versionNote}
                onChange={(e) => setVersionNote(e.target.value)}
                placeholder="مثال: تعديل شروط الدفع، خصم إضافي..."
                className="w-full bg-zinc-50 border-none rounded-xl px-4 py-3 text-xs font-bold focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() =>
                  hasZatcaErrors
                    ? alert("الرجاء تصحيح أخطاء الرقم الضريبي (ZATCA) أولاً")
                    : setShowSaveConfirm(true)
                }
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs transition-all flex-1 justify-center",
                  hasZatcaErrors
                    ? "bg-rose-50 text-rose-500 hover:bg-rose-100"
                    : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
                )}
              >
                <Save className="w-4 h-4" />
                <span>حفظ</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-3 rounded-xl font-bold text-xs hover:bg-zinc-200 disabled:opacity-50 transition-all flex-1 justify-center"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSendInvoice}
                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-3 rounded-xl font-bold text-xs shadow-lg shadow-zinc-900/10 hover:scale-[1.02] active:scale-[0.98] transition-all flex-1 justify-center"
              >
                <Send className="w-4 h-4" />
                <span>إيميل</span>
              </button>
              {paymentLink && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + paymentLink);
                    alert("تم نسخ رابط بوابة العميل للدفع");
                  }}
                  className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-all flex-1 justify-center border border-emerald-200"
                  title="نسخ رابط بوابة الدفع للعميل"
                >
                  <Share2 className="w-4 h-4" />
                  <span>بوابة الدفع</span>
                </button>
              )}
            </div>
          </footer>
        </aside>
      </div>

      {showHistory && (
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <header className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">سجل مسودات الفاتورة</h2>
                  <p className="text-sm font-bold text-zinc-500">استعادة نسخ سابقة تم حفظها</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                ✕
              </button>
            </header>
            <div className="p-6 overflow-y-auto flex-1">
              {versions.length === 0 ? (
                <div className="text-center text-zinc-400 font-bold py-8">
                  لا توجد مسودات سابقة.
                </div>
              ) : (
                <div className="space-y-4">
                  {versions.map((v, i) => (
                    <div
                      key={i}
                      className="group p-5 rounded-3xl bg-zinc-50 border border-zinc-100 hover:border-primary/30 transition-all flex justify-between items-center relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-all font-black text-lg">
                          {versions.length - i}
                        </div>
                        <div>
                          <p className="font-black text-zinc-900">
                            فاتورة #{v.data.number || "جديدة"}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-zinc-500 font-bold">
                              {new Date(v.timestamp).toLocaleString("ar-SA")}
                            </p>
                            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
                            <p className="text-xs text-primary font-black uppercase tracking-widest">
                              {v.user}
                            </p>
                          </div>
                          {v.note && (
                            <div className="mt-2 flex items-start gap-2 bg-white/50 p-2 rounded-xl border border-zinc-200/50">
                              <MessageCircle className="w-3 h-3 text-primary mt-0.5 shrink-0" />
                              <p className="text-[10px] text-zinc-600 font-bold leading-relaxed">
                                {v.note}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-left">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            الإجمالي
                          </p>
                          <p className="text-sm font-black text-zinc-900">
                            {v.data.totalAmount?.toLocaleString()} {v.data.currency}
                          </p>
                        </div>
                        <button
                          onClick={() => restoreDraft(v.data)}
                          className="bg-zinc-900 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-900/10"
                          title="استعادة هذه النسخة"
                        >
                          <RotateCcw className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showSaveConfirm && (
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-zinc-900 text-center">تأكيد الحفظ</h2>
              <p className="text-sm font-medium text-zinc-500 text-center leading-relaxed">
                هل أنت متأكد من حفظ المتغيرات كمسودة جديدة؟
              </p>
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="flex-1 py-3 bg-white text-zinc-700 rounded-xl font-bold text-sm border border-zinc-200 hover:bg-zinc-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  setShowSaveConfirm(false);
                  handleSaveDraft();
                }}
                className="flex-1 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-zinc-900/10 hover:scale-105 active:scale-95 transition-all"
              >
                تأكيد الحفظ
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdvancedSettings && (
        <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <header className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">إعدادات متقدمة</h2>
                  <p className="text-sm font-bold text-zinc-500">
                    تخصيص تنسيق الترقيم، الرسوم، والحالات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAdvancedSettings(false)}
                className="w-8 h-8 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:bg-zinc-50 transition-colors"
              >
                ✕
              </button>
            </header>
            <div className="p-8 overflow-y-auto flex-1 space-y-8">
              {/* Number Format */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  تنسيق رقم الفاتورة
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500">القالب (Template)</label>
                    <input
                      type="text"
                      value={numberFormat}
                      onChange={(e) => setNumberFormat(e.target.value)}
                      placeholder="INV-{YYYY}-{SEQ}"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500">
                      التسلسل التالي (Next Seq)
                    </label>
                    <input
                      type="number"
                      value={Number.isNaN(nextSeq) ? "" : nextSeq}
                      onChange={(e) => setNextSeq(Number(e.target.value))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400">
                  استخدم {"{YYYY}"} للسنة و {"{SEQ}"} للتسلسل الرقمي.
                </p>
              </section>

              {/* Custom Payment Link */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  رابط دفع مخصص (Custom Payment Link)
                </h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={branding.customPaymentLink || ""}
                    onChange={(e) =>
                      setBranding({ ...branding, customPaymentLink: e.target.value })
                    }
                    placeholder="https://company.com/pay/..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none hover:border-zinc-300 transition-colors"
                  />
                  <p className="text-[10px] text-zinc-400 font-medium">
                    إذا تم تحديد هذا الرابط، سيتجاهل النظام رابط الدفع الافتراضي للفاتورة.
                  </p>
                </div>
              </section>

              {/* Late Payment Fee */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                  رسوم التأخر في السداد
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500">نوع الرسم</label>
                    <div className="flex bg-zinc-100 p-1 rounded-xl">
                      <button
                        onClick={() => setLateFee({ ...lateFee, type: "percentage" })}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          lateFee.type === "percentage"
                            ? "bg-white shadow-sm text-zinc-900"
                            : "text-zinc-500"
                        )}
                      >
                        نسبة مئوية (%)
                      </button>
                      <button
                        onClick={() => setLateFee({ ...lateFee, type: "fixed" })}
                        className={cn(
                          "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                          lateFee.type === "fixed"
                            ? "bg-white shadow-sm text-zinc-900"
                            : "text-zinc-500"
                        )}
                      >
                        مبلغ ثابت ({currency})
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500">القيمة</label>
                    <input
                      type="number"
                      value={Number.isNaN(lateFee.value) ? "" : lateFee.value}
                      onChange={(e) => setLateFee({ ...lateFee, value: Number(e.target.value) })}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500">
                      تطبق الرسوم بعد (عدد الأيام المتأخرة)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={Number.isNaN(lateFee.overdueDays) ? "" : lateFee.overdueDays}
                        onChange={(e) =>
                          setLateFee({ ...lateFee, overdueDays: Number(e.target.value) })
                        }
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="0"
                      />
                      <span className="text-xs font-bold text-zinc-400">
                        يوماً من تاريخ الاستحقاق
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Status Customization */}
              <section className="space-y-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex justify-between">
                  <span>تخصيص الحالات والألوان</span>
                  <AlertCircle className="w-3 h-3" />
                </h3>
                <div className="space-y-3">
                  {(
                    Object.entries(statusConfig) as [string, { label: string; color: string }][]
                  ).map(([key, config]) => (
                    <div
                      key={key}
                      className="flex items-center gap-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100"
                    >
                      <div
                        className="w-8 h-8 rounded-full shadow-inner"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={config.label}
                          onChange={(e) =>
                            setStatusConfig({
                              ...statusConfig,
                              [key]: { ...config, label: e.target.value },
                            })
                          }
                          className="bg-transparent border-none p-0 text-xs font-bold focus:ring-0"
                        />
                        <input
                          type="color"
                          value={config.color}
                          onChange={(e) =>
                            setStatusConfig({
                              ...statusConfig,
                              [key]: { ...config, color: e.target.value },
                            })
                          }
                          className="w-full h-8 bg-transparent border-none p-0 cursor-pointer"
                        />
                      </div>
                      <span className="text-[10px] text-zinc-300 font-mono uppercase">{key}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <footer className="p-6 bg-zinc-50 border-t border-zinc-100">
              <button
                onClick={() => setShowAdvancedSettings(false)}
                className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm shadow-xl shadow-zinc-900/10"
              >
                حفظ الإعدادات المتقدمة
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
