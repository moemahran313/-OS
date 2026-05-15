import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Invoice } from '../types';
import { generateZatcaQR } from '../lib/zatca';

interface InvoicePrintTemplateProps {
  invoice: Invoice;
}

export default function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const isMinimal = invoice.branding?.template === 'minimal';
  const isClassic = invoice.branding?.template === 'classic';
  const isBilingual = invoice.branding?.bilingual !== false;

  const getLabel = (ar: string, en: string) => {
    if (isBilingual) return `${ar} / ${en}`;
    return ar; // Default to Arabic if not bilingual
  };

  const getZatcaQRValue = () => {
    // If we have ZATCA config, use compliant QR
    if (invoice.zatcaConfig?.sellerVat) {
       return generateZatcaQR({
          sellerName: invoice.zatcaConfig.sellerName || "My Company",
          sellerVat: invoice.zatcaConfig.sellerVat,
          timestamp: new Date(invoice.issueDate).toISOString(),
          totalWithVat: (invoice.totalAmountHalalas / 100).toString(),
          vatAmount: (invoice.vatAmountHalalas / 100).toString(),
       });
    }
    // Fallback to simple payment URL
    return invoice.branding?.customPaymentLink || `${window.location.origin}/pay/${invoice.id}`;
  };

  return (
    <div className={`w-full max-w-[800px] mx-auto bg-white p-8 sm:p-12 font-sans overflow-hidden relative ${isMinimal ? 'minimal-template' : isClassic ? 'classic-template' : 'modern-template'}`} dir="rtl" style={{ borderTop: isClassic ? `12px solid ${invoice.branding?.primaryColor || '#18181b'}` : 'none' }}>
      {/* Visual background accents */}
      {!isMinimal && !isClassic && (
         <div 
           className="absolute top-0 right-0 w-32 h-32 -rotate-45 translate-x-16 -translate-y-16 opacity-10" 
           style={{ backgroundColor: invoice.branding?.primaryColor || '#10b981' }}
         />
      )}

      <header className={`flex justify-between items-start mb-12 ${isMinimal ? 'border-b border-zinc-200 pb-8' : isClassic ? 'border-b-2 border-zinc-800 pb-8' : ''}`}>
         <div style={(!isMinimal && !isClassic) ? { borderRight: `4px solid ${invoice.branding?.primaryColor || '#18181b'}`, paddingRight: '1rem' } : {}}>
            {invoice.branding?.logo && (
              <img src={invoice.branding.logo} alt="Company Logo" className="h-12 w-auto mb-4 object-contain" />
            )}
            <h1 className={`text-3xl font-black text-zinc-900 mb-1 ${isMinimal ? 'font-light tracking-tight' : isClassic ? 'font-serif italic' : ''}`}>
                {getLabel('فاتورة ضريبية', 'Tax Invoice')}
            </h1>
            <div className="flex flex-col gap-1 mt-4">
              <div className="flex gap-2 text-xs">
                 <span className="text-zinc-400 font-bold">{getLabel('رقم الفاتورة:', 'Invoice No:')}</span>
                 <span className="text-zinc-900 font-black">{invoice.number}</span>
              </div>
              <div className="flex gap-2 text-xs">
                 <span className="text-zinc-400 font-bold">{getLabel('تاريخ الإصدار:', 'Issue Date:')}</span>
                 <span className="text-zinc-900 font-bold">{invoice.issueDate}</span>
              </div>
              <div className="flex gap-2 text-xs">
                 <span className="text-zinc-400 font-bold">{getLabel('تاريخ الاستحقاق:', 'Due Date:')}</span>
                 <span className="text-zinc-900 font-bold text-rose-600">{invoice.dueDate}</span>
              </div>
            </div>
         </div>
         <div className="text-left rtl:text-right flex flex-col items-end">
            <div className={`p-2 border border-zinc-100 rounded-2xl mb-2 bg-white ${!isMinimal && 'shadow-sm'}`}>
              <QRCodeSVG 
                value={getZatcaQRValue()} 
                size={isMinimal ? 64 : 80}
              />
            </div>
            <span className="text-[8px] text-zinc-400 font-black uppercase tracking-tighter">
                {getLabel('امسح للدفع', 'Scan to Pay')}
            </span>
         </div>
      </header>

      {/* Dynamic Sections Based on sectionOrder */}
      {(invoice.sectionOrder || ['details', 'items', 'terms', 'notes']).map((sectionId) => (
        <React.Fragment key={sectionId}>
          {sectionId === 'details' && (
            <section className={`grid grid-cols-2 gap-12 mb-12 ${isMinimal ? '' : 'border-b border-zinc-100 pb-12'}`}>
               <div>
                  <h4 className={`text-[10px] font-bold text-zinc-400 uppercase mb-4 tracking-wider ${isMinimal ? 'text-zinc-300' : ''}`}>
                      {getLabel('من', 'From')}
                  </h4>
                  <p className="font-bold text-zinc-900 mb-1 font-sans">متجر الأمل للتجارة</p>
                  <p className="text-xs text-zinc-500">{getLabel('الرقم الضريبي:', 'VAT No:')} 3000XXXXXXXX003</p>
                  <p className="text-xs text-zinc-500">الرياض، المملكة العربية السعودية</p>
               </div>
               <div className="text-left rtl:text-left">
                  <h4 className={`text-[10px] font-bold text-zinc-400 uppercase mb-4 tracking-wider ${isMinimal ? 'text-zinc-300' : ''}`}>
                      {getLabel('إلى', 'To')}
                  </h4>
                  <p className="font-bold text-zinc-900 mb-1">{invoice.clientName}</p>
                  <p className="text-xs text-zinc-500">{invoice.clientEmail || '-'}</p>
               </div>
            </section>
          )}

          {sectionId === 'items' && (
            <section className="space-y-4 mb-12">
               <div className={`grid grid-cols-12 gap-4 pb-4 border-b text-[10px] font-bold uppercase tracking-widest ${isMinimal ? 'border-zinc-900 text-zinc-900' : 'border-zinc-100 text-zinc-400'}`}>
                  <div className="col-span-7">{getLabel('الوصف', 'Description')}</div>
                  <div className="col-span-2 text-center">{getLabel('الكمية', 'Qty')}</div>
                  <div className="col-span-3 text-left">{getLabel('الإجمالي', 'Total')}</div>
               </div>
               {invoice.lineItems?.map((item, i) => (
                 <div key={i} className={`flex flex-col border-b border-zinc-50 last:border-0 ${isMinimal ? 'text-sm' : 'text-sm'}`}>
                    <div className="grid grid-cols-12 gap-4 py-3">
                      <div className="col-span-7 font-bold text-zinc-900">{item.name}</div>
                      <div className="col-span-2 text-center text-zinc-500 font-medium">{item.quantity}</div>
                      <div className="col-span-3 text-left font-bold text-zinc-900">{(item.totalHalalas / 100).toLocaleString()} {invoice.currency}</div>
                    </div>
                    {item.customFields && item.customFields.length > 0 && (
                      <div className="pb-3 grid grid-cols-2 gap-x-8 gap-y-1 px-1">
                        {item.customFields.map((cf, cfi) => cf.key && (
                          <div key={cfi} className="flex justify-between items-center bg-zinc-50/50 px-2 py-1 rounded-lg border border-zinc-100/50">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tight">{cf.key}</span>
                            <span className="text-[10px] font-black text-zinc-900">{cf.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
               ))}
            </section>
          )}

          {sectionId === 'terms' && invoice.paymentTerms && (
             <section className="mb-12">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{getLabel('شروط الدفع', 'Payment Terms')}</h4>
                <p className="text-xs text-zinc-600 font-medium">{invoice.paymentTerms}</p>
             </section>
          )}

          {sectionId === 'notes' && invoice.notes && (
             <section className="mb-12">
                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{getLabel('ملاحظات', 'Notes')}</h4>
                <p className="text-xs text-zinc-600 font-medium">{invoice.notes}</p>
             </section>
          )}
        </React.Fragment>
      ))}

      <footer className="flex flex-col items-end pt-8 gap-4 border-t border-zinc-100">
         <div className="flex justify-between w-64 text-sm">
            <span className="text-zinc-500">{getLabel('المجموع الفرعي', 'Subtotal')}</span>
            <span className="font-bold text-zinc-900">{(invoice.subtotalHalalas / 100).toLocaleString()} {invoice.currency}</span>
         </div>
         <div className="flex justify-between w-64 text-sm">
            <span className="text-zinc-500">{getLabel('الضريبة (15%)', 'VAT')}</span>
            <span className="font-bold text-zinc-900">{(invoice.vatAmountHalalas / 100).toLocaleString()} {invoice.currency}</span>
         </div>
         
         {isMinimal ? (
            <div className="w-64 pt-4 border-t-2 border-zinc-900 mt-2">
               <div className="flex justify-between w-full">
                 <span className="text-sm font-black uppercase tracking-wider text-zinc-900">{getLabel('الإجمالي', 'Total')}</span>
                 <span className="text-xl font-black text-zinc-900">{(invoice.totalAmountHalalas / 100).toLocaleString()} {invoice.currency}</span>
               </div>
               {(invoice.paidAmountHalalas ?? 0) > 0 && (
                 <>
                   <div className="flex justify-between w-full pt-3 text-zinc-500">
                     <span className="text-[10px] font-bold uppercase">{getLabel('تم دفعه', 'Paid')}</span>
                     <span className="text-sm font-bold">-{(invoice.paidAmountHalalas / 100).toLocaleString()} {invoice.currency}</span>
                   </div>
                   <div className="flex justify-between w-full pt-1 text-zinc-900">
                     <span className="text-[10px] font-bold uppercase">{getLabel('المتبقي', 'Balance')}</span>
                     <span className="text-lg font-black">{(invoice.remainingBalanceHalalas / 100).toLocaleString()} {invoice.currency}</span>
                   </div>
                 </>
               )}
            </div>
         ) : (
            <div className="flex flex-col gap-2 w-64 p-4 rounded-2xl text-white mt-4 shadow-xl" style={{ backgroundColor: invoice.branding?.primaryColor || '#18181b', boxShadow: `0 10px 25px -5px ${invoice.branding?.primaryColor || '#18181b'}80` }}>
               <div className="flex justify-between w-full">
                 <span className="text-[10px] font-bold uppercase tracking-wider">{getLabel('الإجمالي', 'Total Amount')}</span>
                 <span className="text-xl font-bold">{(invoice.totalAmountHalalas / 100).toLocaleString()} {invoice.currency}</span>
               </div>
               {(invoice.paidAmountHalalas ?? 0) > 0 && (
                 <>
                   <div className="flex justify-between w-full border-t border-white/20 pt-2">
                     <span className="text-[10px] font-bold opacity-70">{getLabel('تم دفعه', 'Paid')}</span>
                     <span className="text-sm font-bold">-{(invoice.paidAmountHalalas / 100).toLocaleString()} {invoice.currency}</span>
                   </div>
                   <div className="flex justify-between w-full border-t border-white/20 pt-2">
                     <span className="text-[10px] font-bold">{getLabel('المتبقي', 'Balance')}</span>
                     <span className="text-lg font-black">{(invoice.remainingBalanceHalalas / 100).toLocaleString()} {invoice.currency}</span>
                   </div>
                 </>
               )}
            </div>
         )}
      </footer>
    </div>
  );
}
