import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Invoice } from '../types';
import { generateZatcaQR } from '../lib/zatca';
import { cn } from '../lib/utils';

interface InvoicePrintTemplateProps {
  invoice: Invoice;
}

export default function InvoicePrintTemplate({ invoice }: InvoicePrintTemplateProps) {
  const isMinimal = invoice.branding?.template === 'minimal';
  const isClassic = invoice.branding?.template === 'classic';
  const isModern = !isMinimal && !isClassic;

  const isBilingual = invoice.branding?.bilingual !== false;

  const getLabel = (ar: string, en: string) => {
    if (isBilingual) return (
      <div className="flex flex-col gap-0.5">
        <span>{ar}</span>
        <span className="text-[0.8em] opacity-80 font-normal">{en}</span>
      </div>
    );
    return <span>{ar}</span>;
  };

  const getLabelString = (ar: string, en: string) => {
    if (isBilingual) return `${ar} / ${en}`;
    return ar;
  };

  const getZatcaQRValue = () => {
    if (invoice.zatcaConfig?.sellerVat) {
       return generateZatcaQR({
          sellerName: invoice.zatcaConfig.sellerName || "My Company",
          sellerVat: invoice.zatcaConfig.sellerVat,
          timestamp: new Date(invoice.issueDate).toISOString(),
          totalWithVat: (invoice.totalAmountHalalas / 100).toString(),
          vatAmount: (invoice.vatAmountHalalas / 100).toString(),
       });
    }
    return invoice.branding?.customPaymentLink || `${window.location.origin}/pay/${invoice.id}`;
  };

  const primaryColor = invoice.branding?.primaryColor || '#10b981';

  return (
    <div 
      className={cn(
        "w-full max-w-[850px] mx-auto bg-white font-sans overflow-hidden relative",
        isMinimal ? "p-10" : "p-12",
        "print:p-0 print:shadow-none shadow-2xl"
      )} 
      dir="rtl"
    >
      {isModern && (
         <div 
            className="absolute top-0 right-0 w-[400px] h-[400px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-[0.03] pointer-events-none mix-blend-multiply"
            style={{ backgroundColor: primaryColor }}
         />
      )}
      
      {isClassic && (
        <div className="absolute top-0 left-0 w-full h-3" style={{ backgroundColor: primaryColor }} />
      )}

      {/* HEADER */}
      <header className={cn(
        "flex justify-between items-start mb-12 relative z-10",
        isClassic && "pt-6",
        isMinimal && "border-b border-zinc-100 pb-8"
      )}>
        <div className="flex-1 flex flex-col items-start gap-6">
           {invoice.branding?.logo ? (
             <img src={invoice.branding.logo} alt="Logo" className={cn("object-contain", isMinimal ? "h-10" : isClassic ? "h-16" : "h-14")} />
           ) : (
             <h2 className="text-xl font-black text-zinc-900 tracking-tight">{invoice.zatcaConfig?.sellerName || "مدارجOS"}</h2>
           )}
           
           <div className={cn("flex flex-col gap-1", isMinimal ? "text-zinc-500" : "text-zinc-600")}>
             <h1 className={cn(
               "text-3xl font-black mb-2 text-zinc-900",
               isClassic && "text-4xl italic font-serif",
             )}>
               {getLabel('فاتورة ضريبية', 'Tax Invoice')}
             </h1>
             <p className="text-sm font-bold tracking-widest text-zinc-400">
                #{invoice.number}
             </p>
           </div>
        </div>

        <div className="flex flex-col items-end gap-4 text-left rtl:text-right">
           <div className={cn(
             "p-3 bg-white rounded-2xl border",
             isModern ? "border-zinc-100 shadow-xl shadow-zinc-900/5 rotate-1" : "border-zinc-200"
           )}>
             <QRCodeSVG value={getZatcaQRValue()} size={isMinimal ? 72 : 88} />
           </div>
           {isBilingual ? (
             <div className="text-[10px] font-black text-zinc-400 tracking-widest uppercase flex flex-col items-end gap-0.5">
               <span>امسح للتحقق</span>
               <span className="font-medium text-zinc-300">Scan to verify</span>
             </div>
           ) : (
             <div className="text-[10px] font-black text-zinc-400 tracking-widest uppercase">امسح للتحقق</div>
           )}
        </div>
      </header>

      {/* DYNAMIC SECTIONS */}
      <div className="flex flex-col gap-10">
        {(invoice.sectionOrder || ['details', 'items', 'terms', 'notes']).map((sectionId) => (
          <React.Fragment key={sectionId}>
            
            {sectionId === 'details' && (
              <section className={cn(
                "grid grid-cols-2 gap-8",
                isModern && "bg-zinc-50/50 p-6 rounded-3xl border border-zinc-100/50",
                isClassic && "border-y border-zinc-200 py-6"
              )}>
                {/* SELLER */}
                <div className="flex flex-col gap-4 border-l border-zinc-200/60 pl-6">
                   <div className="text-xs font-black text-zinc-400 tracking-widest uppercase">
                     {getLabel('تفاصيل المورد', 'Supplier Details')}
                   </div>
                   <div className="flex flex-col gap-1">
                     <h3 className="font-black text-zinc-900 text-lg">{invoice.zatcaConfig?.sellerName || "اسم المنشأة"}</h3>
                     
                     <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mt-2 text-[11px]">
                       <span className="text-zinc-500">{getLabel('الرقم الضريبي', 'VAT Number')}</span>
                       <span className="font-bold text-zinc-900">{invoice.zatcaConfig?.sellerVat || "---"}</span>
                       
                       <span className="text-zinc-500">{getLabel('تاريخ الإصدار', 'Issue Date')}</span>
                       <span className="font-bold text-zinc-900">{invoice.issueDate}</span>
                     </div>
                   </div>
                </div>

                {/* BUYER */}
                <div className="flex flex-col gap-4">
                   <div className="text-xs font-black text-zinc-400 tracking-widest uppercase">
                     {getLabel('تفوتر إلى', 'Billed To')}
                   </div>
                   <div className="flex flex-col gap-1">
                     <h3 className="font-black text-zinc-900 text-lg">{invoice.clientName}</h3>
                     <p className="text-xs text-zinc-500 max-w-[200px]">{invoice.clientEmail}</p>

                     <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 mt-2 text-[11px]">
                       {invoice.zatcaConfig?.buyerVat && (
                         <>
                           <span className="text-zinc-500">{getLabel('الرقم الضريبي', 'VAT Number')}</span>
                           <span className="font-bold text-zinc-900">{invoice.zatcaConfig.buyerVat}</span>
                         </>
                       )}
                       
                       <span className="text-zinc-500">{getLabel('تاريخ الاستحقاق', 'Due Date')}</span>
                       <span className="font-bold text-rose-600">{invoice.dueDate}</span>
                     </div>
                   </div>
                </div>
              </section>
            )}

            {sectionId === 'items' && invoice.lineItems && invoice.lineItems.length > 0 && (
              <section className="mt-4">
                <table className="w-full text-sm text-left rtl:text-right border-collapse">
                  <thead>
                    <tr className={cn(
                      "text-[10px] uppercase tracking-widest font-black text-zinc-400 bg-zinc-50/50",
                      isClassic ? "border-y-2 border-zinc-900 bg-transparent" : "rounded-lg"
                    )}>
                      <th className={cn("py-4 px-4 font-bold w-1/2", isClassic ? "px-0" : "rounded-r-xl")}>{getLabel('الوصف / التفاصيل', 'Description / Details')}</th>
                      <th className="py-4 px-2 font-bold text-center">{getLabel('الكمية', 'QTY')}</th>
                      <th className="py-4 px-2 font-bold text-center">{getLabel('سعر الوحدة', 'Unit Price')}</th>
                      <th className={cn("py-4 px-4 font-bold text-left rtl:text-left", isClassic ? "px-0" : "rounded-l-xl")}>{getLabel('المجموع', 'Total')}</th>
                    </tr>
                  </thead>
                  <tbody className={cn(!isClassic && "divide-y divide-zinc-100")}>
                    {invoice.lineItems.map((item, idx) => {
                      const unitPrice = (item.unitPriceHalalas / 100) || ((item.totalHalalas / 100) / item.quantity);
                      return (
                        <tr key={idx} className={cn("group transition-colors", !isMinimal && "hover:bg-zinc-50/50")}>
                          <td className={cn("py-4 align-top", isClassic ? "px-0" : "px-4")}>
                            <div className="font-bold text-zinc-900">{item.name}</div>
                            {item.customFields && item.customFields.length > 0 && (
                              <div className="flex gap-3 flex-wrap mt-2">
                                {item.customFields.map((cf, cfi) => cf.key && (
                                  <div key={cfi} className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-100/80 text-[10px]">
                                    <span className="text-zinc-500 uppercase tracking-tighter">{cf.key}:</span>
                                    <span className="font-bold text-zinc-900">{cf.value}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-2 align-top text-center font-bold text-zinc-600">{item.quantity}</td>
                          <td className="py-4 px-2 align-top text-center font-bold text-zinc-600">
                            {unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className={cn("py-4 align-top text-left rtl:text-left font-black text-zinc-900", isClassic ? "px-0" : "px-4")}>
                            {(item.totalHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </section>
            )}

            {sectionId === 'terms' && invoice.paymentTerms && (
               <section className="text-xs text-zinc-500 mt-2">
                  <div className="font-bold text-zinc-900 mb-2 uppercase tracking-widest">{getLabel('شروط الدفع', 'Payment Terms')}</div>
                  <p className="leading-relaxed whitespace-pre-wrap">{invoice.paymentTerms}</p>
               </section>
            )}

            {sectionId === 'notes' && invoice.notes && (
               <section className="text-xs text-zinc-500 mt-2">
                  <div className="font-bold text-zinc-900 mb-2 uppercase tracking-widest">{getLabel('ملاحظات إضافية', 'Additional Notes')}</div>
                  <p className="leading-relaxed whitespace-pre-wrap">{invoice.notes}</p>
               </section>
            )}

          </React.Fragment>
        ))}
      </div>

      {/* SUMMARY FOOTER */}
      <div className={cn(
        "mt-12 flex justify-between items-end gap-12",
        isClassic ? "border-t-2 border-zinc-900 pt-8" : "border-t border-zinc-100 pt-8"
      )}>
        {/* Signatures or Stamps */}
        <div className="flex-1 max-w-[250px] mb-8">
           <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-12">{getLabel('ختم المنشأة والتوقيع', 'Company Stamp & Signature')}</div>
           <div className="border-b-2 border-dotted border-zinc-300 w-full" />
        </div>

        {/* Totals */}
        <div className="w-[360px] shrink-0">
          <div className="flex flex-col gap-4 text-sm">
             <div className="flex justify-between items-center text-zinc-600 px-4">
               <span className="font-bold">{getLabel('المجموع الفرعي', 'Subtotal')}</span>
               <span className="font-black">{(invoice.subtotalHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] ml-1 opacity-60 font-black">{invoice.currency}</span></span>
             </div>
             <div className="flex justify-between items-center text-zinc-600 px-4">
               <span className="font-bold">{getLabel('ضريبة القيمة المضافة (15%)', 'VAT (15%)')}</span>
               <span className="font-black">{(invoice.vatAmountHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] ml-1 opacity-60 font-black">{invoice.currency}</span></span>
             </div>
             
             <div className={cn(
               "mt-4 flex flex-col gap-3 p-6 rounded-3xl text-white relative overflow-hidden shadow-2xl",
               isMinimal ? "bg-zinc-900 shadow-zinc-900/20" : ""
             )}
             style={!isMinimal ? { backgroundColor: primaryColor, boxShadow: `0 20px 40px -15px ${primaryColor}60` } : {}}
             >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-black/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                
                <div className="flex justify-between items-end relative z-10 w-full">
                  <div className="text-[11px] uppercase tracking-widest font-black opacity-90">{getLabel('الإجمالي المستحق', 'Total Due')}</div>
                  <div className="text-3xl font-black text-left rtl:text-left whitespace-nowrap tracking-tight">
                    {(invoice.totalAmountHalalas / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-sm ml-1 opacity-80 font-bold">{invoice.currency}</span>
                  </div>
                </div>
                
                {(invoice.paidAmountHalalas ?? 0) > 0 && (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-white/20 relative z-10">
                    <div className="flex justify-between w-full opacity-90">
                      <span className="text-[10px] font-bold uppercase">{getLabel('المبلغ المدفوع', 'Amount Paid')}</span>
                      <span className="text-sm font-bold">-{(invoice.paidAmountHalalas / 100).toLocaleString()} <span className="text-[10px] opacity-70 ml-1">{invoice.currency}</span></span>
                    </div>
                    <div className="flex justify-between w-full">
                      <span className="text-[11px] font-black uppercase text-amber-300">{getLabel('الرصيد المتبقي', 'Remaining Balance')}</span>
                      <span className="text-lg font-black text-amber-300">{(invoice.remainingBalanceHalalas / 100).toLocaleString()} <span className="text-[10px] opacity-70 ml-1">{invoice.currency}</span></span>
                    </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>

      <div className="mt-16 text-center text-[10px] text-zinc-400 font-bold tracking-widest uppercase border-t border-zinc-100 pt-6">
        {getLabel('تم إصدار هذه الفاتورة آلياً ومطابقة لمتطلبات هيئة الزكاة والضريبة والجمارك.', 'This tax invoice is issued electronically and complies with ZATCA regulations.')}
      </div>
    </div>
  );
}
