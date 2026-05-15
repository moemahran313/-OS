import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ComplianceService {
  async evaluateShipment(shipmentId: string, tenantId: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: { documents: true }
    });

    if (!shipment) throw new Error("Shipment not found");

    // Fetch tenant-specific compliance rules
    const rules = await prisma.complianceRule.findMany({
      where: { tenantId }
    });

    const desc = shipment.productDescription.toLowerCase();
    let requirements: string[] = ["Commercial Invoice", "Packing List", "Bill of Lading"];
    let riskFlags: string[] = [];
    let missingDocs: string[] = [];

    // Rule-based augmentation
    for (const rule of rules) {
      if (desc.includes(rule.keyword.toLowerCase())) {
        requirements.push(rule.requiredDoc);
        if (rule.riskLevel === "high") riskFlags.push(`Critical: ${rule.requiredDoc} required for ${rule.keyword}`);
      }
    }

    // Check against uploaded docs
    const uploadedTypes = shipment.documents.map(d => d.documentType);
    for (const req of requirements) {
      if (!uploadedTypes.includes(req)) {
        missingDocs.push(req);
      }
    }

    return {
      requirements,
      riskFlags,
      missingDocs,
      isCompliant: missingDocs.length === 0
    };
  }
}

export const complianceService = new ComplianceService();
