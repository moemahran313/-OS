import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing
  await prisma.shipmentEvent.deleteMany({});
  await prisma.complianceRule.deleteMany({});
  await prisma.integration.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.shipment.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.lead.deleteMany({});
  await prisma.employee.deleteMany({});
  await prisma.payrollEntry.deleteMany({});
  await prisma.payrollRun.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.tenant.deleteMany({});

  console.log("Seeding Enterprise Data...");

  const tenant = await prisma.tenant.create({
    data: {
      id: "default_tenant",
      name: "Madarj Logistics Corp",
      plan: "enterprise",
    },
  });

  const lead1 = await prisma.lead.create({
    data: {
      id: "1",
      name: "محمد العتيبي",
      company: "شركة الرمال",
      value: 15000,
      status: "new",
      phone: "966501234567",
      industry: "التقنية",
      companySize: "11-50",
    },
  });

  const lead2 = await prisma.lead.create({
    data: {
      id: "2",
      name: "سارة الأحمد",
      company: "مستشفى التخصصي",
      value: 45000,
      status: "contacted",
      phone: "966505555555",
      industry: "الرعاية الصحية",
    },
  });

  // Using a pre-hashed password for demo login: 'admin123'
  // $2a$10$mudarij_demo_salt_hashed_password
  const passwordHash = await import("bcryptjs").then(async (bcrypt) => {
    return await bcrypt.hash("admin123", 10);
  });

  const user = await prisma.user.create({
    data: {
      id: "u1",
      email: "admin@mudarij.com",
      name: "أحمد المشرف",
      role: "Administrator",
      passwordHash: passwordHash,
      tenantId: tenant.id,
    },
  });

  await prisma.employee.createMany({
    data: [
      {
        userId: user.id,
        name: "محمد فهد",
        position: "مدير مبيعات",
        baseSalaryHalalas: 1200000,
        housingAllowanceHalalas: 120000,
        transportAllowanceHalalas: 60000,
        bank: "مصرف الراجحي",
        iban: "SA1234567890",
        department: "المبيعات",
      },
      {
        userId: user.id,
        name: "سارة العلي",
        position: "أخصائية تسويق",
        baseSalaryHalalas: 850000,
        housingAllowanceHalalas: 85000,
        transportAllowanceHalalas: 40000,
        bank: "البنك الأهلي",
        iban: "SA0987654321",
        department: "التسويق",
      },
    ],
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      module: "SYSTEM",
      action: "Database Seeded",
      payload: JSON.stringify({ version: "2.0" }),
      result: JSON.stringify({ success: true }),
    },
  });

  const integration = await prisma.integration.create({
    data: {
      tenantId: tenant.id,
      provider: "Aramex",
      apiKey: "ARMX-DEMO-KEY-123",
      isActive: true,
    },
  });

  const rule1 = await prisma.complianceRule.create({
    data: {
      tenantId: tenant.id,
      keyword: "قطع غيار",
      requiredDoc: "SASO Certificate of Conformity",
      approvalBody: "SABER",
      riskLevel: "high",
    },
  });

  const rule2 = await prisma.complianceRule.create({
    data: {
      tenantId: tenant.id,
      keyword: "Electronic",
      requiredDoc: "Energy Efficiency Label",
      approvalBody: "SASO",
      riskLevel: "medium",
    },
  });

  const broker = await prisma.broker.create({
    data: {
      name: "خدمات القمة الجمركية",
      email: "peak@customs.sa",
      phone: "966500001111",
    },
  });

  const shipment = await prisma.shipment.create({
    data: {
      tenantId: tenant.id,
      supplierName: "Berlin Auto Parts",
      productDescription: "قطع غيار سيارات أصلية",
      countryOfOrigin: "ألمانيا",
      originPort: "Hamburg",
      destinationPort: "Jeddah Islamic Port",
      carrier: "Aramex",
      trackingNumber: "ARM-XYZ-999",
      status: "in_transit",
      brokerId: broker.id,
      events: {
        create: [
          { type: "shipment.created", description: "Shipment record initialized in Madarj OS" },
          { type: "shipment.updated", description: "Carrier assigned: Aramex" },
        ],
      },
    },
  });

  console.log("Enterprise Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
