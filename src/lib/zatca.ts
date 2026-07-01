/**
 * ZATCA Phase 2 (Fatoora) Compliance Utilities
 * Implements TLV encoding for QR codes and simplified UBL 2.1 mapping.
 */

export interface ZatcaData {
  sellerName: string;
  sellerVat: string;
  timestamp: string;
  totalWithVat: string;
  vatAmount: string;
  xmlHash?: string;
  signature?: string;
  publicKey?: string;
}

/**
 * Encodes data into TLV (Tag-Length-Value) format as required by ZATCA.
 */
function toTLV(tag: number, value: string): Uint8Array {
  const encoder = new TextEncoder();
  const valBytes = encoder.encode(value);
  const tlv = new Uint8Array(2 + valBytes.length);
  tlv[0] = tag;
  tlv[1] = valBytes.length;
  tlv.set(valBytes, 2);
  return tlv;
}

/**
 * Generates the Base64 encoded TLV string for Phase 2 QR code.
 */
export function generateZatcaQR(data: ZatcaData): string {
  const tags = [
    toTLV(1, data.sellerName),
    toTLV(2, data.sellerVat),
    toTLV(3, data.timestamp),
    toTLV(4, data.totalWithVat),
    toTLV(5, data.vatAmount),
  ];

  // Phase 2 specific tags (Simulated tags since real signing needs private key)
  if (data.xmlHash) tags.push(toTLV(6, data.xmlHash));
  if (data.signature) tags.push(toTLV(7, data.signature));
  if (data.publicKey) tags.push(toTLV(8, data.publicKey));

  // Combine all tags
  const totalLength = tags.reduce((acc, t) => acc + t.length, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;
  for (const tag of tags) {
    combined.set(tag, offset);
    offset += tag.length;
  }

  // Convert to Base64 safely avoiding Maximum call stack size exceeded
  let binary = "";
  for (let i = 0; i < combined.length; i++) {
    binary += String.fromCharCode(combined[i]);
  }
  return btoa(binary);
}

/**
 * Generates a simplified UBL 2.1 XML for ZATCA Phase 2.
 * Note: Real UBL 2.1 is very complex, this is a structure for compliance verification.
 */
export function generateUBL21(invoice: any): string {
  const {
    number,
    issueDate,
    clientName,
    lineItems,
    subtotal,
    vatAmount,
    totalAmount,
    currency,
    zatcaConfig,
  } = invoice;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" 
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" 
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ID>${number}</cbc:ID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="0100000">388</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>${currency}</cbc:DocumentCurrencyCode>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${zatcaConfig?.sellerName || "My Company"}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${zatcaConfig?.sellerVat || "3000XXXXXXXX003"}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${clientName}</cbc:Name></cac:PartyName>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${currency}">${vatAmount}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="${currency}">${subtotal}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="${currency}">${subtotal}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${currency}">${totalAmount}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="${currency}">${totalAmount}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${lineItems
    .map(
      (item: any) => `
  <cac:InvoiceLine>
    <cbc:ID>${item.id}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${currency}">${item.quantity * item.unitPrice}</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>${item.name}</cbc:Name></cac:Item>
  </cac:InvoiceLine>`
    )
    .join("")}
</Invoice>`;
}
