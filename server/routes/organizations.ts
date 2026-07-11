import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { logAudit } from "../services/utils.ts";
import { db } from "../services/firebase.ts";

const router = Router();

// ==========================================
// UTILITY HELPERS
// ==========================================

// Ensure user has profile & retrieve active organization
const getActiveContext = async (userId: string) => {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  let userData = userDoc.exists ? userDoc.data() : null;

  if (!userData) {
    userData = {
      userId,
      email: "",
      organizations: [],
      activeOrganizationId: "",
      activeCompanyId: "",
      activeBranchId: "",
      createdAt: new Date().toISOString(),
    };
    await userRef.set(userData);
  }

  // If no active organization, boostrap default organization, company, branch
  if (
    !userData.activeOrganizationId ||
    !userData.organizations ||
    userData.organizations.length === 0
  ) {
    const orgRef = db.collection("organizations").doc();
    const orgId = orgRef.id;

    const defaultOrg = {
      id: orgId,
      name: "منظمة مدارج التجريبية",
      legalName: "مؤسسة مدارج لتقنية المعلومات",
      slug: "madarij-org",
      logo: "",
      country: "SA",
      timezone: "Asia/Riyadh",
      language: "ar",
      baseCurrency: "SAR",
      fiscalYear: "2026",
      industry: "Technology",
      taxNumber: "300012345600003",
      registrationNumber: "1010123456",
      subscriptionPlan: "Free", // Free, Starter, Growth, Professional, Enterprise
      billingStatus: "Active",
      status: "Active",
      members: [userId],
      settings: {
        language: "ar",
        currency: "SAR",
        dateFormat: "YYYY-MM-DD",
        numberFormat: "1,234.56",
        fiscalYear: "2026",
        businessHours: "09:00 - 17:00",
        weekendRules: "Friday-Saturday",
        timezone: "Asia/Riyadh",
        branding: {
          logo: "",
          primaryColor: "#18181b",
          secondaryColor: "#71717a",
          banner: "",
        },
        emailTemplates: {
          invoice: "مرحباً {clientName}، تجدون طيه فاتورة مستحقة بقيمة {amount}.",
          receipt: "شكراً لك {clientName}، تم استلام دفعتكم بنجاح.",
        },
        invoiceTemplates: {
          theme: "Classic",
          showLogo: true,
          showTaxId: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orgRef.set(defaultOrg);

    // Bootstrap default Company
    const compRef = db.collection("companies").doc();
    const companyId = compRef.id;
    const defaultComp = {
      id: companyId,
      organizationId: orgId,
      userId, // for backwards compatibility
      nameAr: "شركة مدارج للحلول الرقمية",
      nameEn: "Madarij Digital Solutions Co.",
      legalName: "شركة مدارج للحلول الرقمية المحدودة",
      tradeName: "مدارج التقنية",
      commercialRegistration: "1010987654",
      vatNumber: "300098765400003",
      defaultCurrency: "SAR",
      fiscalCalendar: "Gregorian",
      accountingSettings: {
        method: "Accrual",
        coaSeeded: false,
      },
      invoiceNumbering: "INV-{YYYY}-{SEQ}",
      taxConfiguration: {
        taxRate: 15,
        zatcaPhase: "Phase 1",
      },
      branding: {
        logo: "",
        color: "#18181b",
      },
      logo: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await compRef.set(defaultComp);

    // Bootstrap default Branch
    const branchRef = db.collection("branches").doc();
    const branchId = branchRef.id;
    const defaultBranch = {
      id: branchId,
      organizationId: orgId,
      companyId,
      userId, // backwards compatibility
      nameAr: "الفرع الرئيسي - الرياض",
      nameEn: "Main Branch - Riyadh",
      code: "BR-01",
      address: "العليا، الرياض",
      city: "Riyadh",
      country: "Saudi Arabia",
      manager: "سلمان الحربي",
      warehouse: "مستودع الرياض الرئيسي",
      cashAccount: "الصندوق الرئيسي",
      bankAccount: "حساب مصرف الراجحي الجاري",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await branchRef.set(defaultBranch);

    // Update user context
    userData.organizations = [orgId];
    userData.activeOrganizationId = orgId;
    userData.activeCompanyId = companyId;
    userData.activeBranchId = branchId;
    userData.companyName = "منظمة مدارج التجريبية";
    userData.crNumber = "1010123456";

    await userRef.update({
      organizations: userData.organizations,
      activeOrganizationId: userData.activeOrganizationId,
      activeCompanyId: userData.activeCompanyId,
      activeBranchId: userData.activeBranchId,
      companyName: "منظمة مدارج التجريبية",
      crNumber: "1010123456",
    });
  }

  return userData;
};

// ==========================================
// 1. ORGANIZATIONS API
// ==========================================

// Get list of organizations the user belongs to
router.get("/", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const orgsSnap = await db
      .collection("organizations")
      .where("members", "array-contains", userId)
      .get();

    const orgs = orgsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(orgs);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new Organization
router.post("/", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      legalName,
      slug,
      country,
      timezone,
      language,
      baseCurrency,
      industry,
      taxNumber,
      registrationNumber,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "اسم المنظمة مطلوب" });
    }

    const orgRef = db.collection("organizations").doc();
    const orgId = orgRef.id;

    const newOrg = {
      id: orgId,
      name,
      legalName: legalName || name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      logo: "",
      country: country || "SA",
      timezone: timezone || "Asia/Riyadh",
      language: language || "ar",
      baseCurrency: baseCurrency || "SAR",
      fiscalYear: new Date().getFullYear().toString(),
      industry: industry || "General",
      taxNumber: taxNumber || "",
      registrationNumber: registrationNumber || "",
      subscriptionPlan: "Free",
      billingStatus: "Active",
      status: "Active",
      members: [userId],
      settings: {
        language: language || "ar",
        currency: baseCurrency || "SAR",
        dateFormat: "YYYY-MM-DD",
        numberFormat: "1,234.56",
        fiscalYear: new Date().getFullYear().toString(),
        businessHours: "09:00 - 17:00",
        weekendRules: "Friday-Saturday",
        timezone: timezone || "Asia/Riyadh",
        branding: {
          logo: "",
          primaryColor: "#18181b",
          secondaryColor: "#71717a",
          banner: "",
        },
        emailTemplates: {
          invoice: "مرحباً {clientName}، تجدون طيه فاتورة مستحقة بقيمة {amount}.",
          receipt: "شكراً لك {clientName}، تم استلام دفعتكم بنجاح.",
        },
        invoiceTemplates: {
          theme: "Classic",
          showLogo: true,
          showTaxId: true,
        },
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await orgRef.set(newOrg);

    // Update user profile's organizations list & switch them to the new org
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    let userOrgs = [orgId];
    if (userDoc.exists) {
      const data = userDoc.data();
      userOrgs = data?.organizations || [];
      if (!userOrgs.includes(orgId)) {
        userOrgs.push(orgId);
      }
    }

    // Automatically seed a default company and branch for the new org
    const compRef = db.collection("companies").doc();
    const companyId = compRef.id;
    const defaultComp = {
      id: companyId,
      organizationId: orgId,
      userId,
      nameAr: `شركة ${name}`,
      nameEn: `${name} Company`,
      legalName: `شركة ${name} المحدودة`,
      tradeName: name,
      commercialRegistration: "",
      vatNumber: taxNumber || "",
      defaultCurrency: baseCurrency || "SAR",
      fiscalCalendar: "Gregorian",
      accountingSettings: {
        method: "Accrual",
        coaSeeded: false,
      },
      invoiceNumbering: "INV-{YYYY}-{SEQ}",
      taxConfiguration: {
        taxRate: 15,
        zatcaPhase: "Phase 1",
      },
      logo: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await compRef.set(defaultComp);

    const branchRef = db.collection("branches").doc();
    const branchId = branchRef.id;
    const defaultBranch = {
      id: branchId,
      organizationId: orgId,
      companyId,
      userId,
      nameAr: "الفرع الرئيسي",
      nameEn: "Main Branch",
      code: "BR-01",
      address: "",
      city: "",
      country: country || "Saudi Arabia",
      manager: "",
      warehouse: "مستودع رئيسي",
      cashAccount: "الصندوق",
      bankAccount: "البنك",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await branchRef.set(defaultBranch);

    await userRef.set(
      {
        organizations: userOrgs,
        activeOrganizationId: orgId,
        activeCompanyId: companyId,
        activeBranchId: branchId,
        companyName: name,
        crNumber: registrationNumber || "",
      },
      { merge: true }
    );

    await logAudit(
      "ORGANIZATION",
      { action: "Organization Created", name },
      { success: true, orgId },
      req
    );

    res.status(201).json({ id: orgId, ...newOrg });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get Active Context (Active Org, Company, Branch, Settings)
router.get("/active", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);

    // Fetch active Organization details
    const orgDoc = await db
      .collection("organizations")
      .doc(activeContext.activeOrganizationId)
      .get();
    if (!orgDoc.exists) {
      // If active org was deleted, reset context
      await db
        .collection("users")
        .doc(userId)
        .update({ activeOrganizationId: "", activeCompanyId: "", activeBranchId: "" });
      const freshContext = await getActiveContext(userId);
      const freshOrgDoc = await db
        .collection("organizations")
        .doc(freshContext.activeOrganizationId)
        .get();
      return res.json({
        userContext: freshContext,
        organization: freshOrgDoc.data(),
      });
    }

    res.json({
      userContext: activeContext,
      organization: orgDoc.data(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Switch Active Organization / Company / Branch
router.post("/switch", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { organizationId, companyId, branchId } = req.body;

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "ملف المستخدم غير موجود" });
    }

    const userData = userDoc.data() || {};
    const userOrgs = userData.organizations || [];

    // Security Isolation: Ensure user actually belongs to this organization
    if (organizationId && !userOrgs.includes(organizationId)) {
      return res.status(403).json({ error: "غير مصرح لك بالوصول لهذه المنظمة" });
    }

    const updates: any = {};
    if (organizationId) updates.activeOrganizationId = organizationId;
    if (companyId) updates.activeCompanyId = companyId;
    if (branchId) updates.activeBranchId = branchId;

    // If companyId was changed but branchId wasn't passed, auto-select first branch of the switched company
    if (companyId && !branchId) {
      const branchesSnap = await db
        .collection("branches")
        .where("companyId", "==", companyId)
        .limit(1)
        .get();
      if (!branchesSnap.empty) {
        updates.activeBranchId = branchesSnap.docs[0].id;
      } else {
        updates.activeBranchId = "";
      }
    }

    // If organizationId was changed but companyId wasn't passed, auto-select first company
    if (organizationId && !companyId) {
      const companiesSnap = await db
        .collection("companies")
        .where("organizationId", "==", organizationId)
        .limit(1)
        .get();
      if (!companiesSnap.empty) {
        const firstCompId = companiesSnap.docs[0].id;
        updates.activeCompanyId = firstCompId;

        const branchesSnap = await db
          .collection("branches")
          .where("companyId", "==", firstCompId)
          .limit(1)
          .get();
        if (!branchesSnap.empty) {
          updates.activeBranchId = branchesSnap.docs[0].id;
        } else {
          updates.activeBranchId = "";
        }
      } else {
        updates.activeCompanyId = "";
        updates.activeBranchId = "";
      }
    }

    await userRef.update(updates);

    await logAudit(
      "ORGANIZATION",
      { action: "Switch Active Context", updates },
      { success: true },
      req
    );

    res.json({ success: true, ...updates });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 2. COMPANIES API
// ==========================================

// Get list of companies for the active organization
router.get("/companies", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    const companiesSnap = await db
      .collection("companies")
      .where("organizationId", "==", orgId)
      .get();

    const companies = companiesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(companies);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new Company under active organization
router.post("/companies", authenticate, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    const {
      nameAr,
      nameEn,
      legalName,
      tradeName,
      commercialRegistration,
      vatNumber,
      defaultCurrency,
      fiscalCalendar,
    } = req.body;

    if (!nameAr || !nameEn) {
      return res.status(400).json({ error: "اسم الشركة بالعربية والإنجليزية مطلوب" });
    }

    const compRef = db.collection("companies").doc();
    const companyId = compRef.id;

    const newCompany = {
      id: companyId,
      organizationId: orgId,
      nameAr,
      nameEn,
      legalName: legalName || nameAr,
      tradeName: tradeName || nameAr,
      commercialRegistration: commercialRegistration || "",
      vatNumber: vatNumber || "",
      defaultCurrency: defaultCurrency || "SAR",
      fiscalCalendar: fiscalCalendar || "Gregorian",
      accountingSettings: {
        method: "Accrual",
        coaSeeded: false,
      },
      invoiceNumbering: "INV-{YYYY}-{SEQ}",
      taxConfiguration: {
        taxRate: 15,
        zatcaPhase: "Phase 1",
      },
      logo: "",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await compRef.set(newCompany);

    // Setup a default branch for this company
    const branchRef = db.collection("branches").doc();
    const branchId = branchRef.id;
    const defaultBranch = {
      id: branchId,
      organizationId: orgId,
      companyId,
      userId,
      nameAr: "الفرع الرئيسي",
      nameEn: "Main Branch",
      code: "BR-01",
      address: "",
      city: "",
      country: "Saudi Arabia",
      manager: "",
      warehouse: "مستودع رئيسي",
      cashAccount: "الصندوق",
      bankAccount: "البنك",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await branchRef.set(defaultBranch);

    await logAudit(
      "ORGANIZATION",
      { action: "Company Created", nameAr, companyId },
      { success: true },
      req
    );

    res.status(201).json(newCompany);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete (archive) a company
router.delete("/companies/:companyId", authenticate, async (req: any, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    // Verify company belongs to user's active organization
    const compDoc = await db.collection("companies").doc(companyId).get();
    if (!compDoc.exists) {
      return res.status(404).json({ error: "الشركة غير موجودة" });
    }

    if (compDoc.data()?.organizationId !== orgId) {
      return res.status(403).json({ error: "غير مصرح لك بتعديل هذه الشركة" });
    }

    // Standard archive/soft delete
    await db.collection("companies").doc(companyId).update({
      status: "Archived",
      updatedAt: new Date().toISOString(),
    });

    await logAudit(
      "ORGANIZATION",
      { action: "Company Deleted", companyId },
      { success: true },
      req
    );

    res.json({ success: true, message: "تم أرشفة الشركة بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. BRANCHES API
// ==========================================

// Get list of branches for a company
router.get("/companies/:companyId/branches", authenticate, async (req: any, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    // Security Verification: Ensure company belongs to current active organization
    const compDoc = await db.collection("companies").doc(companyId).get();
    if (!compDoc.exists || compDoc.data()?.organizationId !== orgId) {
      return res.status(403).json({ error: "غير مصرح لك باسترجاع بيانات الفروع لهذه الشركة" });
    }

    const branchesSnap = await db.collection("branches").where("companyId", "==", companyId).get();

    const branches = branchesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(branches);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new Branch
router.post("/companies/:companyId/branches", authenticate, async (req: any, res) => {
  try {
    const { companyId } = req.params;
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    const {
      nameAr,
      nameEn,
      code,
      address,
      city,
      country,
      manager,
      warehouse,
      cashAccount,
      bankAccount,
    } = req.body;

    if (!nameAr || !code) {
      return res.status(400).json({ error: "اسم الفرع وكود الفرع مطلوبان" });
    }

    const compDoc = await db.collection("companies").doc(companyId).get();
    if (!compDoc.exists || compDoc.data()?.organizationId !== orgId) {
      return res.status(403).json({ error: "غير مصرح لك بإضافة فرع لهذه الشركة" });
    }

    const branchRef = db.collection("branches").doc();
    const branchId = branchRef.id;

    const newBranch = {
      id: branchId,
      organizationId: orgId,
      companyId,
      userId,
      nameAr,
      nameEn: nameEn || nameAr,
      code,
      address: address || "",
      city: city || "",
      country: country || "Saudi Arabia",
      manager: manager || "",
      warehouse: warehouse || "مستودع رئيسي للفرع",
      cashAccount: cashAccount || "الصندوق الفرعي",
      bankAccount: bankAccount || "الحساب البنكي للفرع",
      status: "Active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await branchRef.set(newBranch);

    await logAudit(
      "ORGANIZATION",
      { action: "Branch Created", nameAr, branchId },
      { success: true },
      req
    );

    res.status(201).json(newBranch);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Archive (delete) a branch
router.delete("/companies/:companyId/branches/:branchId", authenticate, async (req: any, res) => {
  try {
    const { companyId, branchId } = req.params;
    const userId = req.user.id;
    const activeContext = await getActiveContext(userId);
    const orgId = activeContext.activeOrganizationId;

    // Security Verification: Ensure branch belongs to active company/org
    const branchDoc = await db.collection("branches").doc(branchId).get();
    if (!branchDoc.exists) {
      return res.status(404).json({ error: "الفرع غير موجود" });
    }

    const brData = branchDoc.data();
    if (brData?.companyId !== companyId || brData?.organizationId !== orgId) {
      return res.status(403).json({ error: "غير مصرح لك بتعديل هذا الفرع" });
    }

    await db.collection("branches").doc(branchId).update({
      status: "Archived",
      updatedAt: new Date().toISOString(),
    });

    await logAudit("ORGANIZATION", { action: "Branch Archived", branchId }, { success: true }, req);

    res.json({ success: true, message: "تم أرشفة الفرع بنجاح" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ORGANIZATION SETTINGS & BRANDING
// ==========================================

// Get Organization settings
router.get("/:orgId/settings", authenticate, async (req: any, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    // Security check: must be member of this organization
    const orgDoc = await db.collection("organizations").doc(orgId).get();
    if (!orgDoc.exists) {
      return res.status(404).json({ error: "المنظمة غير موجودة" });
    }

    const orgData = orgDoc.data();
    if (!orgData?.members?.includes(userId)) {
      return res.status(403).json({ error: "غير مصرح لك باسترجاع إعدادات هذه المنظمة" });
    }

    res.json(orgData.settings || {});
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Organization settings & Branding/Localization
router.put("/:orgId/settings", authenticate, async (req: any, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;
    const updatedSettings = req.body;

    const orgDoc = await db.collection("organizations").doc(orgId).get();
    if (!orgDoc.exists) {
      return res.status(404).json({ error: "المنظمة غير موجودة" });
    }

    const orgData = orgDoc.data();
    if (!orgData?.members?.includes(userId)) {
      return res.status(403).json({ error: "غير مصرح لك بتعديل هذه المنظمة" });
    }

    const newSettings = {
      ...(orgData.settings || {}),
      ...updatedSettings,
      branding: {
        ...(orgData.settings?.branding || {}),
        ...(updatedSettings.branding || {}),
      },
      emailTemplates: {
        ...(orgData.settings?.emailTemplates || {}),
        ...(updatedSettings.emailTemplates || {}),
      },
      invoiceTemplates: {
        ...(orgData.settings?.invoiceTemplates || {}),
        ...(updatedSettings.invoiceTemplates || {}),
      },
    };

    await db.collection("organizations").doc(orgId).update({
      settings: newSettings,
      updatedAt: new Date().toISOString(),
    });

    await logAudit(
      "ORGANIZATION",
      { action: "Settings Changed", updatedSettings },
      { success: true },
      req
    );

    res.json({ success: true, settings: newSettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. SUBSCRIPTIONS & LIMITS
// ==========================================

// Get Subscription & Limits based on plan
router.get("/:orgId/subscription", authenticate, async (req: any, res) => {
  try {
    const { orgId } = req.params;
    const userId = req.user.id;

    const orgDoc = await db.collection("organizations").doc(orgId).get();
    if (!orgDoc.exists) {
      return res.status(404).json({ error: "المنظمة غير موجودة" });
    }

    const orgData = orgDoc.data() || {};
    if (!orgData.members?.includes(userId)) {
      return res.status(403).json({ error: "غير مصرح لك بالوصول" });
    }

    const plan = orgData.subscriptionPlan || "Free";

    // Plan-specific limits configuration
    const PLAN_LIMITS: any = {
      Free: {
        userLimit: 3,
        storageLimitGB: 5,
        apiLimitDaily: 1000,
        features: ["القيود المحاسبية البسيطة", "إدارة الفواتير", "التحليلات العامة"],
        price: 0,
      },
      Starter: {
        userLimit: 10,
        storageLimitGB: 20,
        apiLimitDaily: 10000,
        features: [
          "أدوات محاسبية متقدمة",
          "إدارة المخازن",
          "الربط البنكي التلقائي",
          "دعم فني عبر البريد",
        ],
        price: 299,
      },
      Growth: {
        userLimit: 30,
        storageLimitGB: 100,
        apiLimitDaily: 50000,
        features: [
          "تعدد العملات والشركات",
          "أتمتة الرواتب والعمليات الذكية AI",
          "أدوات مبيعات ومشتريات CRM متكاملة",
          "دعم فني فوري 24/7",
        ],
        price: 599,
      },
      Professional: {
        userLimit: 100,
        storageLimitGB: 500,
        apiLimitDaily: 250000,
        features: [
          "مراقب اتصال واتساب OpenWA غير المحدود",
          "إدارة شحن متقدمة وتأشيرات وسلسلة التوريد كاملة",
          "أكاديمية تدريب مخصصة للموظفين",
          "خادم مخصص متميز",
        ],
        price: 999,
      },
      Enterprise: {
        userLimit: 9999,
        storageLimitGB: 5000,
        apiLimitDaily: 5000000,
        features: [
          "تخصيص كامل للنظام وواجهات مخصصة",
          "أمان ممتثل لمعايير هيئات الحكومة والبيانات الحساسة",
          "حساب مخصص ومستشار تقني متاح على مدار الساعة",
          "عقد خدمة مخصص SLA",
        ],
        price: 2499,
      },
    };

    res.json({
      activePlan: plan,
      billingStatus: orgData.billingStatus || "Active",
      limits: PLAN_LIMITS[plan] || PLAN_LIMITS.Free,
      allPlans: PLAN_LIMITS,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update Subscription Plan
router.post("/:orgId/subscription", authenticate, async (req: any, res) => {
  try {
    const { orgId } = req.params;
    const { plan } = req.body; // Free, Starter, Growth, Professional, Enterprise
    const userId = req.user.id;

    if (!["Free", "Starter", "Growth", "Professional", "Enterprise"].includes(plan)) {
      return res.status(400).json({ error: "خطة اشتراك غير صالحة" });
    }

    const orgDoc = await db.collection("organizations").doc(orgId).get();
    if (!orgDoc.exists) {
      return res.status(404).json({ error: "المنظمة غير موجودة" });
    }

    const orgData = orgDoc.data() || {};
    if (!orgData.members?.includes(userId)) {
      return res.status(403).json({ error: "غير مصرح لك بالوصول" });
    }

    await db.collection("organizations").doc(orgId).update({
      subscriptionPlan: plan,
      billingStatus: "Active",
      updatedAt: new Date().toISOString(),
    });

    await logAudit(
      "ORGANIZATION",
      { action: "Subscription Changed", oldPlan: orgData.subscriptionPlan, newPlan: plan },
      { success: true },
      req
    );

    res.json({ success: true, plan, billingStatus: "Active" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
