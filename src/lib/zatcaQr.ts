// ZATCA QR Code TLV Generator
// Compliant with Saudi ZATCA Phase 2 E-Invoicing requirements

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

export function generateZatcaQR(data: ZatcaData): string {
  // Convert string to bytes
  const textEncoder = new TextEncoder();

  // Helper function to create a TLV tag
  const createTLV = (tag: number, value: string): Uint8Array => {
    const valueBytes = textEncoder.encode(value);
    const lengthBytes = new Uint8Array([valueBytes.length]);
    const tagBytes = new Uint8Array([tag]);
    
    const tlv = new Uint8Array(tagBytes.length + lengthBytes.length + valueBytes.length);
    tlv.set(tagBytes, 0);
    tlv.set(lengthBytes, 1);
    tlv.set(valueBytes, 2);
    
    return tlv;
  };

  // Create TLV array
  const tlvArray = [
    createTLV(1, data.sellerName),
    createTLV(2, data.sellerVat),
    createTLV(3, data.timestamp),
    createTLV(4, data.totalWithVat),
    createTLV(5, data.vatAmount),
  ];

  if (data.xmlHash) tlvArray.push(createTLV(6, data.xmlHash));
  if (data.signature) tlvArray.push(createTLV(7, data.signature));
  if (data.publicKey) tlvArray.push(createTLV(8, data.publicKey));

  // Calculate total length
  const totalLength = tlvArray.reduce((acc, curr) => acc + curr.length, 0);

  // Combine all TLVs
  const combinedTLV = new Uint8Array(totalLength);
  let offset = 0;
  for (const tlv of tlvArray) {
    combinedTLV.set(tlv, offset);
    offset += tlv.length;
  }

  // Convert to Base64 avoiding Maximum Call Stack Size Exceeded
  let binary = '';
  const len = combinedTLV.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(combinedTLV[i]);
  }
  
  return btoa(binary);
}
