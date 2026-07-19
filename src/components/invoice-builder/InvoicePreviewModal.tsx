import React from "react";
import InvoicePrintTemplate from "../InvoicePrintTemplate";
import { Invoice } from "../../types";
import { X, Printer, Download, Mail } from "lucide-react";

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: Partial<Invoice>;
  onPrint?: () => void;
  onDownloadPdf?: () => void;
  isGeneratingPdf?: boolean;
}

export default function InvoicePreviewModal({
  isOpen,
  onClose,
  invoiceData,
  onPrint,
  onDownloadPdf,
  isGeneratingPdf = false,
}: InvoicePreviewModalProps) {
  if (!isOpen) return null;

  // Cast the partial data to full Invoice interface for the print template
  const fullInvoice: Invoice = {
    id: invoiceData.id || "preview-id",
    userId: invoiceData.userId || "system",
    type: invoiceData.type || "standard",
    number: invoiceData.number || "INV-YYYY-SEQ",
    clientId: invoiceData.clientId || "client-id",
    clientName: invoiceData.clientName || "اسم العميل",
    clientEmail: invoiceData.clientEmail || "",
    clientPhone: invoiceData.clientPhone || "",
    issueDate: invoiceData.issueDate || new Date().toISOString().split("T")[0],
    dueDate: invoiceData.dueDate || new Date().toISOString().split("T")[0],
    currency: invoiceData.currency || "SAR",
    lineItems: invoiceData.lineItems || [],
    subtotalHalalas: invoiceData.subtotalHalalas || 0,
    vatAmountHalalas: invoiceData.vatAmountHalalas || 0,
    totalAmountHalalas: invoiceData.totalAmountHalalas || 0,
    paidAmountHalalas: invoiceData.paidAmountHalalas || 0,
    remainingBalanceHalalas: invoiceData.remainingBalanceHalalas || 0,
    status: invoiceData.status || "draft",
    paymentLink: invoiceData.paymentLink,
    paymentTerms: invoiceData.paymentTerms || "",
    notes: invoiceData.notes || "",
    billingEmail: invoiceData.billingEmail || "",
    lateFee: invoiceData.lateFee || { type: "percentage", valueHalalas: 0, overdueDays: 0 },
    branding: invoiceData.branding || { primaryColor: "#10b981", template: "modern", bilingual: true },
    zatcaConfig: invoiceData.zatcaConfig || { sellerVat: "", sellerName: "", buyerVat: "", isPhasedTwo: true },
    logs: invoiceData.logs || [],
    version: invoiceData.version || 1,
    isLocked: invoiceData.isLocked || false,
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-zinc-100 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col my-8 border border-zinc-200 overflow-hidden max-h-[90vh]">
        {/* Actions bar */}
        <header className="px-6 py-4 bg-white border-b border-zinc-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-zinc-50 border border-zinc-200 rounded-full text-zinc-600 hover:bg-zinc-100 transition-all hover:scale-105 active:scale-95"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h3 className="text-sm font-black text-zinc-900">معاينة الفاتورة الحية</h3>
              <p className="text-[10px] text-zinc-400 font-bold">معاينة شكل الفاتورة النهائي المطبوع والمطابق لهيئة الزكاة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onDownloadPdf && (
              <button
                onClick={onDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-zinc-900/10 hover:scale-102 transition-all active:scale-98 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingPdf ? "جاري التوليد..." : "تحميل PDF"}</span>
              </button>
            )}
            {onPrint && (
              <button
                onClick={onPrint}
                className="flex items-center gap-2 bg-white border border-zinc-200 text-zinc-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-zinc-50 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة</span>
              </button>
            )}
          </div>
        </header>

        {/* Real Printable Invoice Element */}
        <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-zinc-100/60 no-scrollbar">
          <div className="bg-white shadow-xl rounded-2xl p-2 max-w-[850px] w-full border border-zinc-200/50 self-start">
            <InvoicePrintTemplate invoice={fullInvoice} />
          </div>
        </div>
      </div>
    </div>
  );
}
