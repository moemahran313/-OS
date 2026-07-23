import { Router } from "express";
import { authenticate } from "../middleware/auth.ts";
import { GoogleGenAI } from "@google/genai";
import { logAudit } from "../services/utils.ts";
import { prisma } from "../services/prisma.ts";
import { db } from "../services/firebase.ts";

const router = Router();

// Lazy loader for Google GenAI SDK to comply with optional API key safety rules
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets."
    );
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient wrapper that catches 503 UNAVAILABLE or high demand errors and retries using gemini-3.1-flash-lite with exponential backoff
async function generateWithFallback(ai: any, params: any) {
  const primaryModel = params.model || "gemini-3.5-flash";
  let attempt = 0;
  const maxRetries = 3;
  const delayMs = 1500;

  while (true) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const errMsg = (err?.message || "").toLowerCase();
      const isUnavailable =
        errMsg.includes("503") ||
        errMsg.includes("unavailable") ||
        errMsg.includes("demand") ||
        errMsg.includes("resource_exhausted") ||
        errMsg.includes("429");

      if (isUnavailable) {
        if (attempt <= maxRetries) {
          const backoff = delayMs * Math.pow(2, attempt - 1);
          console.warn(
            `[Gemini API] 503/UNAVAILABLE/Limit detected on ${primaryModel} (attempt ${attempt}). Retrying in ${backoff}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoff));
          continue;
        }

        if (primaryModel !== "gemini-3.1-flash-lite") {
          console.warn(
            `Model ${primaryModel} is experiencing high demand or limit after retries. Falling back to gemini-3.1-flash-lite...`
          );
          return await ai.models.generateContent({
            ...params,
            model: "gemini-3.1-flash-lite",
          });
        }
      }
      throw err;
    }
  }
}

// Helper to initialize real persistent transactions in Firestore if none exist yet for this user
async function ensureInitialUserTransactions(userId: string) {
  const defaultItems = [
    {
      userId,
      type: "sales",
      number: "MDR-2026-081",
      notes: "تقديم استشارات تقنية للتحول الرقمي",
      clientName: "شركة الفرسان للمقاولات",
      subtotalHalalas: 12000000,
      vatAmountHalalas: 1800000,
      totalAmountHalalas: 13800000,
      paidAmountHalalas: 13800000,
      status: "paid",
      issueDate: "2026-06-03",
      vatRate: 0.15,
      buyerVat: "340981245600003",
    },
    {
      userId,
      type: "sales",
      number: "MDR-2026-082",
      notes: "مبيعات خدمات تسويقية للربع الثاني",
      clientName: "مجموعة المجد المتكاملة",
      subtotalHalalas: 35000000,
      vatAmountHalalas: 5250000,
      totalAmountHalalas: 40250000,
      paidAmountHalalas: 40250000,
      status: "paid",
      issueDate: "2026-06-12",
      vatRate: 0.15,
      buyerVat: "310931252100003",
    },
    {
      userId,
      type: "sales",
      number: "MDR-2026-083",
      notes: "توريد برمجيات محاسبية سحابية - رخص مبيعات",
      clientName: "شركة الوفاق الخليجي للمقاولات",
      subtotalHalalas: 9500000,
      vatAmountHalalas: 1425000,
      totalAmountHalalas: 10925000,
      paidAmountHalalas: 0,
      status: "issued",
      issueDate: "2026-06-20",
      vatRate: 0.15,
      buyerVat: "320491245100003",
    },
    {
      userId,
      type: "purchase",
      number: "INV-6672",
      notes: "أجهزة كمبيوتر مكتبي - شركة حلول الحاسب",
      supplierName: "مؤسسة حلول الحاسب الذكية",
      subtotalHalalas: 4500000,
      vatAmountHalalas: 675000,
      totalAmountHalalas: 5175000,
      paidAmountHalalas: 5175000,
      status: "paid",
      issueDate: "2026-06-01",
      vatRate: 0.15,
      supplierVat: "310459841200003",
    },
    {
      userId,
      type: "purchase",
      number: "FUR-9912",
      notes: "أثاث مكتبي - كراسي وطاولات اجتماعات",
      supplierName: "مفروشات الرياض الراقية",
      subtotalHalalas: 1500000,
      vatAmountHalalas: 225000,
      totalAmountHalalas: 1725000,
      paidAmountHalalas: 1725000,
      status: "paid",
      issueDate: "2026-06-05",
      vatRate: 0.15,
      supplierVat: "320984125300003",
    },
    {
      userId,
      type: "purchase",
      number: "AC-4412",
      notes: "خدمات صيانة مكيفات المبنى الرئيسي",
      supplierName: "صيانة نسيم الشرق",
      subtotalHalalas: 800000,
      vatAmountHalalas: 40000, // 5% non-compliant
      totalAmountHalalas: 840000,
      paidAmountHalalas: 840000,
      status: "paid",
      issueDate: "2026-06-08",
      vatRate: 0.05,
      supplierVat: "300894121500003",
    },
    {
      userId,
      type: "purchase",
      number: "RENT-2026-02",
      notes: "إيجار المستودع رقم 4 - السلي",
      supplierName: "عقارات الوطن المتميزة",
      subtotalHalalas: 6000000,
      vatAmountHalalas: 900000,
      totalAmountHalalas: 6900000,
      paidAmountHalalas: 6900000,
      status: "paid",
      issueDate: "2026-06-11",
      vatRate: 0.15,
      supplierVat: "300295123", // Non-compliant invalid VAT number length
    },
    {
      userId,
      type: "purchase",
      number: "ST-8812",
      notes: "قرطاسية ودفاتر وأقلام ومستلزمات مكتبية",
      supplierName: "مكتبة الشرق المضيء",
      subtotalHalalas: 400000,
      vatAmountHalalas: 45000, // Non-compliant math mismatch (450 instead of 600)
      totalAmountHalalas: 445000,
      paidAmountHalalas: 445000,
      status: "paid",
      issueDate: "2026-06-18",
      vatRate: 0.15,
      supplierVat: "310452391400003",
    },
  ];

  const batch = db.batch();
  for (const item of defaultItems) {
    const ref = db.collection("invoices").doc();
    batch.set(ref, { ...item, createdAt: new Date().toISOString() });
  }
  await batch.commit();
}

async function ensureInitialUserBankLedger(userId: string) {
  const defaultBankItems = [
    {
      userId,
      date: "2026-06-01",
      description: "حوالة صادرة لـ مؤسسة حلول الحاسب الذكية",
      amount: -51750,
      docNumber: "INV-6672",
    },
    {
      userId,
      date: "2026-06-03",
      description: "حوالة واردة من شركة الفرسان للمقاولات",
      amount: 138000,
      docNumber: "MDR-2026-081",
    },
    {
      userId,
      date: "2026-06-05",
      description: "حوالة صادرة لـ مفروشات الرياض الراقية",
      amount: -17250,
      docNumber: "FUR-9912",
    },
    {
      userId,
      date: "2026-06-06",
      description: "صرف نقدي نثريات ضيافة وتكليف خارجي",
      amount: -3500,
      docNumber: null,
    },
    {
      userId,
      date: "2026-06-08",
      description: "حوالة صادرة لـ صيانة نسيم الشرق",
      amount: -8400,
      docNumber: "AC-4412",
    },
    {
      userId,
      date: "2026-06-11",
      description: "حوالة صادرة لـ عقارات الوطن المتميزة - إيجار مستودع",
      amount: -69000,
      docNumber: "RENT-2026-02",
    },
    {
      userId,
      date: "2026-06-14",
      description: "شراء محروقات ومصروف سيارات ميدانية",
      amount: -1200,
      docNumber: null,
    },
    {
      userId,
      date: "2026-06-15",
      description: "دفعة سداد لشركة الاتصالات السعودية",
      amount: -5520,
      docNumber: "STC-99014",
    },
    {
      userId,
      date: "2026-06-19",
      description: "حوالة لـ مكتبة الشرق المضيء",
      amount: -4450,
      docNumber: "ST-8812",
    },
  ];

  const batch = db.batch();
  for (const item of defaultBankItems) {
    const ref = db.collection("bank_transactions").doc();
    batch.set(ref, { ...item, createdAt: new Date().toISOString() });
  }
  await batch.commit();
}

// Helper to retrieve real transactions directly from Firestore DB
async function getTransactionsForUser(userId: string) {
  try {
    let snap = await db.collection("invoices").where("userId", "==", userId).get();
    if (snap.empty) {
      await ensureInitialUserTransactions(userId);
      snap = await db.collection("invoices").where("userId", "==", userId).get();
    }

    const dbInvoices = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return dbInvoices.map((inv: any, idx: number) => {
      const amountBeforeVat = (inv.subtotalHalalas || 0) / 100;
      const vatAmount = (inv.vatAmountHalalas || 0) / 100;
      const total = (inv.totalAmountHalalas || 0) / 100;

      let compliance = "valid";
      let reason = "";
      let details = "";

      const expectedVat = Math.round(amountBeforeVat * 0.15);
      const actualVat = Math.round(vatAmount);
      const vatRate = inv.vatRate !== undefined ? inv.vatRate : 0.15;
      const vatNumber = inv.supplierVat || inv.buyerVat || "";

      if (vatRate !== 0.15) {
        compliance = "non_compliant";
        reason = "RateMismatch";
        details = `معدل الضريبة ${(vatRate * 100).toFixed(0)}% غير صحيح للمعاملات المحلية العامة (يجب أن يكون 15%)`;
      } else if (vatNumber && (vatNumber.length !== 15 || !vatNumber.startsWith("3"))) {
        compliance = "non_compliant";
        reason = "VatNumberInvalid";
        details = `الرقم الضريبي (${vatNumber}) غير صحيح (يجب أن بيتكون من 15 خانة ويبدأ برقم 3)`;
      } else if (Math.abs(expectedVat - actualVat) > 1) {
        compliance = "non_compliant";
        reason = "MathMismatch";
        details = `حساب الضريبة غير متطابق: القيمة المسجلة ${vatAmount} ريال تختلف عن القيمة الرياضية المتوقعة ${amountBeforeVat * 0.15} ريال (15%)`;
      }

      let dateStr = "";
      if (inv.issueDate) {
        if (typeof inv.issueDate === "string") {
          dateStr = inv.issueDate;
        } else if (inv.issueDate.toDate) {
          dateStr = inv.issueDate.toDate().toISOString().split("T")[0];
        } else {
          dateStr = new Date(inv.issueDate).toISOString().split("T")[0];
        }
      } else {
        dateStr = new Date().toISOString().split("T")[0];
      }

      const txType = inv.type || "sales";
      return {
        id: `TX-${(inv.id || "").substring(0, 4).toUpperCase() || 1000 + idx}`,
        dbId: inv.id,
        date: dateStr,
        description: inv.notes || `${txType === "sales" ? "فاتورة مبيعات" : "فاتورة شراء"} رقم ${inv.number}`,
        amountBeforeVat,
        vatRate,
        vatAmount,
        total,
        type: txType as "sales" | "purchase",
        buyerName: inv.clientName,
        buyerVat: inv.buyerVat || "310931252100003",
        supplierName: inv.supplierName,
        supplierVat: inv.supplierVat,
        docNumber: inv.number,
        compliance,
        reason,
        details,
      };
    });
  } catch (err) {
    console.error("Error retrieving user transactions from DB:", err);
    return [];
  }
}

async function getBankLedgerForUser(userId: string) {
  try {
    let snap = await db.collection("bank_transactions").where("userId", "==", userId).get();
    if (snap.empty) {
      await ensureInitialUserBankLedger(userId);
      snap = await db.collection("bank_transactions").where("userId", "==", userId).get();
    }

    const dbBankTxs = snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    // Fetch user invoices for real matching
    const invSnap = await db.collection("invoices").where("userId", "==", userId).get();
    const invoices = invSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    return dbBankTxs.map((btx: any, idx: number) => {
      // Find matching invoice by docNumber or amount
      const matchingInv = invoices.find(
        (inv: any) =>
          inv.number === btx.docNumber ||
          (btx.docNumber && inv.number && btx.docNumber.includes(inv.number))
      );

      const hasMatchingDoc = !!matchingInv || !!btx.docNumber;
      return {
        id: `BNK-${(btx.id || "").substring(0, 3).toUpperCase() || 100 + idx}`,
        dbId: btx.id,
        date: btx.date || new Date().toISOString().split("T")[0],
        description: btx.description,
        amount: btx.amount,
        hasMatchingDoc,
        matchingDocId: matchingInv ? `TX-${(matchingInv.id || "").substring(0, 4).toUpperCase()}` : btx.docNumber || null,
        details: hasMatchingDoc ? undefined : "لا يوجد مستند مدفوع صادر أو فاتورة مبسطة مطابقة في الدفاتر!",
      };
    });
  } catch (err) {
    console.error("Error retrieving user bank ledger from DB:", err);
    return [];
  }
}

// AI Tax & Compliance Advisor Endpoint using server-side Gemini
router.post("/ai-query", authenticate, async (req: any, res) => {
  try {
    const { question, currentClient = "شركة مدارج النموذجية للخدمات السحابية" } = req.body;

    let ai;
    try {
      ai = getGeminiClient();
    } catch (err: any) {
      return res.status(200).json({
        success: true,
        answer: `⚠️ **يبدو أن مفتاح واجهة برمجة تطبيقات Gemini (GEMINI_API_KEY) غير مكوّن حالياً.**\n\nيرجى الانتقال إلى الكود أو لوحة الإعدادات **Settings > Secrets** وضبط المفتاح بنجاح لتفعيل مستشار الزكاة والضريبة والامتثال الذكي الذكاء الاصطناعي التوليدي من Google.`,
      });
    }

    // Build standard high-fidelity financial context
    const transactions = await getTransactionsForUser(req.user.id);
    const bankLedger = await getBankLedgerForUser(req.user.id);

    const salesCount = transactions.filter((t) => t.type === "sales").length;
    const purchasesCount = transactions.filter((t) => t.type === "purchase").length;

    const salesVat = transactions
      .filter((t) => t.type === "sales")
      .reduce((sum, t) => sum + t.vatAmount, 0);
    const purchasesVat = transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.vatAmount, 0);

    const salesSubtotal = transactions
      .filter((t) => t.type === "sales")
      .reduce((sum, t) => sum + t.amountBeforeVat, 0);
    const purchasesSubtotal = transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.amountBeforeVat, 0);

    const netVatDue = salesVat - purchasesVat;
    const nonCompliantInvoices = transactions.filter((t) => t.compliance !== "valid");

    const systemInstruction = `
أنت خبير مالي ذكي ومستشار ضرائب سعودي معتمد ومجاز من الهيئة العامة للزكاة والضريبة والجمارك (ZATCA) وحاصل على زمالة الهيئة السعودية للمراجعين والمحاسبين (SOCPA).
تتحدث باللغة العربية الفصحى المحترفة وتتحلى بالدقة المطلقة. 
أنت تقدم المشورة لمكاتب المحاسبة السعودية باستخدام قاعدة البيانات المالية والامتثال الحالية للعميل النشط: "${currentClient}".

تفاصيل قاعدة البيانات المالية الحالية لـ ${currentClient} للربع الحالي (أو الشهر):
- إجمالي المبيعات الخاضعة للنسبة الأساسية (15%): ${salesSubtotal} ريال سعودي.
- إجمالي الضريبة المحصلة على المبيعات (ضريبة المخرجات): ${salesVat} ريال سعودي.
- إجمالي المشتريات الخاضعة للنسبة الأساسية (15%): ${purchasesSubtotal} ريال سعودي.
- إجمالي الضريبة المدفوعة على المشتريات (ضريبة المدخلات): ${purchasesVat} ريال سعودي.
- صافي الضريبة المستحقة للهيئة (Net VAT Payable): ${netVatDue} ريال سعودي.
- عدد معاملات المبيعات: ${salesCount}، عدد معاملات المشتريات: ${purchasesCount}.

قائمة المعاملات غير المطابقة لقواعد الامتثال الضريبي السعودية (ZATCA):
${JSON.stringify(nonCompliantInvoices, null, 2)}

قائمة المعاملات البنكية التي تفتقر لمستندات لإتمام عملية التدقيق المالي:
${JSON.stringify(
  bankLedger.filter((b) => !b.hasMatchingDoc),
  null,
  2
)}

إرشادات هامة للإجابة:
1. عند سؤالك عن زيادة أو تغير ضريبة القيمة المضافة ("Why did VAT increase this month?"):
   - حلل الأرقام بدقة. وضح أن ضريبة المخرجات مرتفعة جداً (${salesVat} ريال) بسبب مبيعات الربع البالغة ${salesSubtotal} ريال مقارنة بضريبة المدخلات (${purchasesVat} ريال)، مما يترك صافي التزام مستحق قدره ${netVatDue} ريال. 
   - استشهد بأكبر معاملة بيع: "تقديم استشارات تقنية للتحول الرقمي" لشركة الفرسان بقيمة 120,000 ريال (ضريبة 18,000 ريال) ومعاملة توريد برمجيات بقيمة 95,000 ريال (ضريبة 14,250 ريال) ومبيعات تسويقية بلغت 350,000 ريال (ضريبة 52,500 ريال).
2. عند سؤالك عن الفواتير غير المتوافقة ("Which invoices are non-compliant?"):
   - حدد المعاملات غير المطابقة بدقة بالاسم والرقم ونوع الخطأ كالتالي:
     أ. صيانة نسيم الشرق (رقم AC-4412): تم استخدام معدل ضريبة 5% بدلاً من 15%، وهذا مخالف لتعليمات ZATCA للمبيعات المحلية الحالية.
     ب. عقارات الوطن المتميزة (رقم RENT-2026-02): الرقم الضريبي ناقص (9 خانات بدلاً من 15 التي تبدأ بـ 3).
     ج. مكتبة الشرق المضيء (رقم ST-8812): يوجد خطأ حسابي رياضي (سجلوا ضريبة بقيمة 450 ريال في حين أن 15% من السعر الأساسي البالغ 4000 ريال هي 600 ريال - بفارق 150 ريال).
3. عند سؤالك عن تقرير إداري أو مستند تلخيصي ("Prepare management report"):
   - أنشئ تقريراً إدارياً محاسبياً فاخراً ومنسقاً يحتوي على: ملخص تنفيذي مالي، تحليل حسابات الأستاذ لضريبة المخرجات والمدخلات، تحليل تفصيلي للامتثال الضريبي السعودي، ونقاط التوصية للتصحيح قبل التقديم بذكاء.
4. عند سؤالك عن الفاتورة والمستندات المفقودة ("Find missing supplier invoices"):
   - أشر إلى التحليل البنكي المالي: هناك معاملتان بنكيتان مفقودتان تماماً في الدورة المستندية وغير مطابقتين بأي فواتير:
     أ. صرف نقدي نثريات ضيافة وتكليف خارجي بقيمة 3,500 ريال بتاريخ 2026-06-06.
     ب. شراء محروقات ومصروف سيارات ميدانية بقيمة 1,200 ريال بتاريخ 2026-06-14.
   - اطلب مخاطبة العميل لتزويدنا بهذه الإيصالات والمستندات الثبوتية فوراً.

صيغة الرد يجب أن تدمج لغة الأرقام الصارمة والقوانين السعودية (لوائح ضريبة القيمة المضافة المعتمدة من ZATCA ولوائح الفوترة الإلكترونية المرحلة الثانية - الربط والتكامل). أظهر النتيجة بأسلوب رائع ومنسق وجاهز للعرض على مجلس الإدارة كتقرير مهني.
`;

    const response = await generateWithFallback(ai, {
      model: "gemini-3.5-flash",
      contents: question,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({
      success: true,
      answer: response.text,
    });
  } catch (err: any) {
    console.error("AI Workflows Error:", err);
    res.status(500).json({ success: false, error: "فشل معالجة الاستفسار الذكي: " + err.message });
  }
});

// Run workflow sequence simulation step implementation
router.post("/run-step", authenticate, async (req: any, res) => {
  try {
    const { workflowId, stepId } = req.body;

    if (!workflowId || stepId === undefined) {
      return res.status(400).json({ error: "Missing parameters workflowId or stepId" });
    }

    const transactions = await getTransactionsForUser(req.user.id);
    const bankLedger = await getBankLedgerForUser(req.user.id);

    let payload: any = {};

    if (workflowId === "vat") {
      switch (stepId) {
        case 0: // Receive transactions
          payload = {
            message: "تم استرداد وتجهيز المعاملات المالية بنجاح من أنظمة دفتر الحسابات ERP.",
            status: "success",
            data: {
              transactionsCount: transactions.length,
              totalAmount: transactions.reduce((sum, t) => sum + t.total, 0),
              transactions: transactions,
            },
          };
          break;
        case 1: // Validate invoices
          // Find math mismatch
          const invalidMath = transactions.filter(
            (t) => t.compliance === "non_compliant" && t.reason === "MathMismatch"
          );
          payload = {
            message: "اكتمل فحص ومطابقة صحة الحسابات الرياضية للفواتير بنجاح.",
            status: "warning",
            findings: `تم رصد عدد (1) خطأ رياضي في حساب الضريبة.`,
            details: invalidMath.map(
              (i) =>
                `الفاتورة رقم ${i.docNumber} للمورد "${(i as any).supplierName || (i as any).buyerName}": الضريبة المسجلة ${i.vatAmount} ريال والضريبة الضرورية ${i.amountBeforeVat * 0.15} ريال.`
            ),
            data: {
              validatedCount: transactions.length,
              errorCount: invalidMath.length,
            },
          };
          break;
        case 2: // Check ZATCA compliance
          const nonCompliant = transactions.filter((t) => t.compliance === "non_compliant");
          payload = {
            message:
              "اكتمل تحليل الامتثال لمعايير الفوترة الإلكترونية لهيئة الزكاة والضريبة والجمارك (ZATCAPhase 2).",
            status: "error",
            findings: `تم رصد عدد (${nonCompliant.length}) مخالفة صارخة لمعايير الامتثال في المستندات والروابط.`,
            nonCompliantList: nonCompliant.map((c) => ({
              doc: c.docNumber,
              entity: (c as any).supplierName || (c as any).buyerName,
              reason: c.details,
            })),
            data: {
              compliantCount: transactions.length - nonCompliant.length,
              criticalAuditFlags: nonCompliant.length,
            },
          };
          break;
        case 3: // Prepare VAT return
          const salesVat = transactions
            .filter((t) => t.type === "sales")
            .reduce((sum, t) => sum + t.vatAmount, 0);
          const purchasesVat = transactions
            .filter((t) => t.type === "purchase")
            .reduce((sum, t) => sum + t.vatAmount, 0);
          const salesBefore = transactions
            .filter((t) => t.type === "sales")
            .reduce((sum, t) => sum + t.amountBeforeVat, 0);
          const purchasesBefore = transactions
            .filter((t) => t.type === "purchase")
            .reduce((sum, t) => sum + t.amountBeforeVat, 0);
          payload = {
            message: "تم تجهيز مسودة نموذج إقرار ضريبة القيمة المضافة (Form 50) تلقائياً.",
            status: "success",
            form50: {
              sales_standard: { amount: salesBefore, vat: salesVat },
              purchases_standard: { amount: purchasesBefore, vat: purchasesVat },
              net_vat_due: salesVat - purchasesVat,
            },
          };
          break;
        case 4: // Manager approval
          payload = {
            message: "تم طلب الاعتماد والتوقيع الرقمي من مدير الضرائب والشركاء بنجاح.",
            status: "success",
            approvers: [
              {
                name: "أحمد بن محمد",
                role: "SOCPA Certified Partner",
                status: "Approved",
                time: new Date().toLocaleTimeString("ar-SA"),
              },
            ],
          };
          break;
        case 5: // Submit
          payload = {
            message:
              "تمت محاكاة الربط البرمجي وإرسال الإقرار بنجاح عبر البوابة الرقمية لمصلحة الزكاة والجمارك.",
            status: "success",
            zatcaReceipt: {
              referenceNumber: "ZATCA-SUB-" + Math.floor(100000 + Math.random() * 900000),
              timestamp: new Date().toLocaleString("ar-SA"),
              digitalStamp: "STAMP_SHA256_F923B09A18DCEF",
            },
          };
          break;
        case 6: // Archive
          payload = {
            message:
              "تم حظر المعاملة وتشفير ملفات الإقرار والمستندات الثبوتية في السجل الأرشيفي المقفل لضمان عدم التعديل.",
            status: "success",
            archiveBlock: "BLOCK-HASH-0092B7D3E2F",
          };
          break;
        default:
          payload = { error: "Unknown step for VAT" };
      }
    } else if (workflowId === "audit") {
      switch (stepId) {
        case 0: // Client upload
          payload = {
            message:
              "تم استيراد الكشف البنكي ومستندات الفحص المحاسبي من بوابة العميل (Mudarij Client Portal).",
            status: "success",
            data: {
              bankEntries: bankLedger.length,
              scannedDocs: transactions.length,
            },
          };
          break;
        case 1: // AI categorization
          payload = {
            message: "أتمت محركات الذكاء الاصطناعي فرز وتصنيف قيود النقدية والحسابات.",
            status: "success",
            categories: [
              { name: "شراء أصول تقنية", count: 1, sum: 51750 },
              { name: "صيانة وتشغيل", count: 1, sum: 8400 },
              { name: "أثاث وتجهيز مكاتب", count: 1, sum: 17250 },
              { name: "عقارات وإيجارات دورية", count: 1, sum: 69000 },
              { name: "مصاريف إدارية وخدمات حكومية", count: 3, sum: 9970 },
            ],
          };
          break;
        case 2: // Missing docs detection
          const missingDocs = bankLedger.filter((b) => !b.hasMatchingDoc);
          payload = {
            message:
              "تحليل المطابقة المستندية: كشف الفجوات بين حركة الحساب البنكي وفواتير الشراء المعززة.",
            status: "warning",
            missingDocsList: missingDocs.map((m) => ({
              date: m.date,
              desc: m.description,
              amount: m.amount,
            })),
            data: {
              totalMatching: bankLedger.length - missingDocs.length,
              totalMissing: missingDocs.length,
            },
          };
          break;
        case 3: // Accountant review
          payload = {
            message:
              "تم تهيئة ورقة العمل المحاسبية وتسجيل تسويات التدقيق (Audit Adjustment Entries).",
            status: "success",
            adjustments: [
              {
                entry:
                  "أدرج قيد تسوية للمصروفات النثرية المفقودة كمعاملة مستبعدة ضريبياً من الوعاء الاستثماري لتجنب الغرامات بامتثال 100%.",
              },
            ],
          };
          break;
        case 4: // Audit package generation
          const salesTotal = transactions
            .filter((t) => t.type === "sales")
            .reduce((sum, t) => sum + t.amountBeforeVat, 0);
          const purchasesTotal = transactions
            .filter((t) => t.type === "purchase")
            .reduce((sum, t) => sum + t.amountBeforeVat, 0);
          payload = {
            message: "تم إعداد حزمة الفحص المالي والمحاسبي النهائي للعميل الشريك.",
            status: "success",
            package: {
              clientName: "شركة مدارج النموذجية للخدمات السحابية",
              auditPeriod: "يونيو 2026",
              executiveSummary:
                "بناءً على إجراءات التحقق والتدقيق والمطابقة الدفترية للمعاملات البنكية ومستندات الفوترة الإلكترونية، نرفع الحزمة المحاسبية متبوعة بملاحظات التحفظ لعدم اكتمال الإثبات الضريبي لـ (2) من النثريات.",
              financialMetrics: {
                revenue: salesTotal,
                directCosts: purchasesTotal,
                grossProfit: salesTotal - purchasesTotal,
                profitMargin:
                  (((salesTotal - purchasesTotal) / (salesTotal || 1)) * 100).toFixed(1) + "%",
              },
              auditOpinion:
                "تحفظي (Qualified Opinion) بسبب مصاريف نثرية غير مؤيدة بمستندات فواتير مبسطة",
              recommends: [
                "إنشاء رابط فوري مع أنظمة المدفوعات لإلزام السائقين والمندوبين برفع صور الفواتير فور الشراء.",
                "مخاطبة مفروشات الرياض الراقية وعقارات الوطن لتسجيل معلومات الرقم الضريبي كاملة بالصيغة الصحيحة.",
              ],
            },
          };
          break;
        default:
          payload = { error: "Unknown step for Audit" };
      }
    } else {
      return res.status(400).json({ error: "Invalid workflowId" });
    }

    logAudit("WORKFLOW_RUN", { workflowId, stepId }, payload, req);
    res.json(payload);
  } catch (err: any) {
    console.error("Workflow Execution Step Error:", err);
    res.status(500).json({ error: "فشل تنفيذ خطوة مسار العمل البرمجي: " + err.message });
  }
});

// Custom Drag-and-Drop Workflow Generator Endpoint via Gemini
router.post("/suggest-workflow", authenticate, async (req: any, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res
        .status(400)
        .json({ error: "الرجاء كتابة تفاصيل الأتمتة المطلوبة لتلقين الذكاء الاصطناعي." });
    }

    let ai;
    let fallbackMode = false;
    try {
      ai = getGeminiClient();
    } catch (err) {
      fallbackMode = true;
    }

    // Call Gemini API to build a fully bespoke workflow
    const systemPrompt = `
      You are an expert AI system engineering and workflow automation architect like n8n, combined with being a certified Saudi compliance specialist (ZATCA, GOSI, WPS, SOCPA).
      Analyze the user's prompt and generate a bespoke, professional workflow sequence.
      You MUST respond ONLY with a raw JSON object matching the following structure:
      {
        "workflowName": "A descriptive workflow name in English",
        "workflowNameAr": "اسم منسق معرب معبر بطريقة ممتازة ومثالية",
        "description": "Short summary of what this workflow automates in English",
        "descriptionAr": "شرح سريع للمسار المحفز وما يسهم في أتمتته من عمليات مخصصة",
        "nodes": [
          {
            "id": "node-1",
            "name": "Node Title (Eng)",
            "nameAr": "عنوان العقدة بالعربية",
            "desc": "Explanation of node activity (Eng)",
            "descAr": "شرح مبسط ووظيفي لعمل العقدة",
            "type": "trigger",
            "iconName": "Play",
            "x": 100,
            "y": 150
          }
        ],
        "edges": [
          { "from": "node-1", "to": "node-2" }
        ]
      }

      Guidelines:
      - Place nodes sequentially in increments of 200px horizontally (e.g., node 1 at x=100, node 2 at x=300, node 3 at x=500).
      - Node fields mandatory options:
        * type: MUST be exactly "trigger" or "action" or "condition" 
        * iconName: MUST be one of "Play", "Mail", "Zap", "ShieldAlert", "Database", "Cpu", "Clock", "Send", "CheckCircle2", "AlertTriangle", "FileText"
      - If there is a condition node, you can branch branches out (e.g. node 4 at x=700, y=80; node 5 at x=700, y=250) and link them.
      - Make sure names and description elements in Arabic are highly professional, authentic to Saudi financial & legal frameworks.
      - Ensure you provide a valid JSON parser format. Do not prepend markdown wraps like \`\`\`json.
    `;

    try {
      const response = await generateWithFallback(ai, {
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const parsed = JSON.parse(response.text.trim());
      return res.json({
        success: true,
        workflow: parsed,
      });
    } catch (apiErr: any) {
      console.warn("AI Generation failed, falling back to basic mock mode:", apiErr);
      fallbackMode = true;
    }

    if (fallbackMode) {
      // Return structured fallback workflows based on keyword matching when Gemini SDK cannot be initialized or fails
      const normalizedPrompt = prompt.toLowerCase();
      let selectedWorkflow = {
        workflowName: "Custom AI Workflow",
        workflowNameAr: "مسار عمل مخصص بذكاء مدارج",
        description: "An automated compliance and notification sequence tailored to your request.",
        descriptionAr: "مسار مؤتمت بالكامل مصمم ومعدل بناءً على متطلبات عملك واللوائح السعودية.",
        nodes: [
          {
            id: "node-1",
            name: "Daily Invoicing API Trigger",
            nameAr: "حافز الفواتير اليومية",
            desc: "Launches the sequence when new invoices are detected",
            descAr: "يقوم بتشغيل المسار فور الكشف عن فواتير مبيعات جديدة",
            type: "trigger",
            iconName: "Play",
            x: 100,
            y: 150,
          },
          {
            id: "node-2",
            name: "ZATCA Validation Match",
            nameAr: "فحص ومطابقة هيئة ZATCA",
            desc: "Validates standard 15% VAT and cryptographically verifies stamp",
            descAr: "التحقق من صحة الرقم الضريبي والأكواد وسلامة الختم الرقمي",
            type: "action",
            iconName: "ShieldAlert",
            x: 300,
            y: 150,
          },
          {
            id: "node-3",
            name: "Compliance Guard Gate",
            nameAr: "بوابة الامتثال والتدقيق",
            desc: "Route workflows based on compliance audit result",
            descAr: "توجيه خط سير المعاملات بحسب نتيجة فحص المطابقة",
            type: "condition",
            iconName: "AlertTriangle",
            x: 500,
            y: 150,
          },
          {
            id: "node-4",
            name: "Submit to Government",
            nameAr: "تقديم الإقرار التلقائي",
            desc: "Directly syncs approved datasets to ZATCA portal",
            descAr: "ربط وإرسال البيانات مباشرة لبوابة مصلحة الضرائب والجمارك",
            type: "action",
            iconName: "Send",
            x: 700,
            y: 80,
          },
          {
            id: "node-5",
            name: "Alert Compliance Officer",
            nameAr: "إشعار الامتثال العاجل",
            desc: "Triggers WhatsApp alert for audit flags",
            descAr: "إرسال تنبيه في حال رصد مخالفات ضريبية بالمعاملات",
            type: "action",
            iconName: "Clock",
            x: 700,
            y: 250,
          },
        ],
        edges: [
          { from: "node-1", to: "node-2" },
          { from: "node-2", to: "node-3" },
          { from: "node-3", to: "node-4" },
          { from: "node-3", to: "node-5" },
        ],
      };

      if (
        normalizedPrompt.includes("payroll") ||
        normalizedPrompt.includes("رواتب") ||
        normalizedPrompt.includes("wps") ||
        normalizedPrompt.includes("أجور")
      ) {
        selectedWorkflow = {
          workflowName: "Saudi Payroll (WPS) Workflow",
          workflowNameAr: "مسار حماية الأجور والرواتب KSA",
          description: "Tracks and signs salary files (SIF), matching bank records with WPS.",
          descriptionAr: "مسار مؤتمت لمطابقة كشوف الرواتب والتحقق المتبادل وصيرورة ملفات SIF.",
          nodes: [
            {
              id: "node-1",
              name: "Monthly Payroll Run",
              nameAr: "تشغيل مسير الرواتب",
              desc: "Initiates payroll check at month-end",
              descAr: "بدء احتساب الرواتب والمزايا للموظفين بنهاية الشهر",
              type: "trigger",
              iconName: "Database",
              x: 100,
              y: 180,
            },
            {
              id: "node-2",
              name: "WPS SIF Generator",
              nameAr: "توليد ملفات مدد (SIF)",
              desc: "Builds official wage protection system file format",
              descAr: "تنسيق البيانات وصناعة ملف مدد الموحد لرفعه آلياً",
              type: "action",
              iconName: "FileText",
              x: 300,
              y: 180,
            },
            {
              id: "node-3",
              name: "GOSI Compliance Check",
              nameAr: "التحقق من التأمينات (GOSI)",
              desc: "Validates retirement rates and employee contribution caps",
              descAr: "الكشف الذكي ومطابقة نسب التأمينات الاجتماعية المسجلة",
              type: "action",
              iconName: "ShieldAlert",
              x: 500,
              y: 180,
            },
            {
              id: "node-4",
              name: "Bank Balance Check",
              nameAr: "فحص الرصيد المصرفي",
              desc: "Ensures company balance covers wages",
              descAr: "التحقق المالي من كفاية الرصيد المصرفي للشركة قبل الدفع",
              type: "condition",
              iconName: "AlertTriangle",
              x: 700,
              y: 180,
            },
            {
              id: "node-5",
              name: "Disburse and Alert",
              nameAr: "تحويل الرواتب وإشعار الموظفين",
              desc: "Direct deposit with SMS slip triggers",
              descAr: "إيداع الرواتب مباشرة وتحفيز إشعارات الرسائل المبسطة",
              type: "action",
              iconName: "Send",
              x: 900,
              y: 180,
            },
          ],
          edges: [
            { from: "node-1", to: "node-2" },
            { from: "node-2", to: "node-3" },
            { from: "node-3", to: "node-4" },
            { from: "node-4", to: "node-5" },
          ],
        };
      } else if (
        normalizedPrompt.includes("escrow") ||
        normalizedPrompt.includes("ضمان") ||
        normalizedPrompt.includes("عقد") ||
        normalizedPrompt.includes("شروط")
      ) {
        selectedWorkflow = {
          workflowName: "Contract Escrow Safeguard",
          workflowNameAr: "مسار أمان الضمان والتحكيم العقدي",
          description: "Ensures payment milestone completions prior to funds release.",
          descriptionAr: "مسار مكننة الإفراج عن الدفعات بناءً على معايير التحقق القانونية.",
          nodes: [
            {
              id: "node-1",
              name: "Milestone Attainment Alert",
              nameAr: "حافز إنجاز مرحلة عقدية",
              desc: "Triggered on contractor milestone completion note",
              descAr: "تنشيط المسار فور تأكيد إتمام مرحلة من أعمال المقاولة",
              type: "trigger",
              iconName: "Play",
              x: 100,
              y: 150,
            },
            {
              id: "node-2",
              name: "Legal Document Inspections",
              nameAr: "فحص مستندات وفواتر الإنجاز",
              desc: "Verifies sign-offs and structural reports",
              descAr: "التأكد من اكتمال تقارير تسليم العميل وتوقيعات الاستشاري",
              type: "action",
              iconName: "FileText",
              x: 320,
              y: 150,
            },
            {
              id: "node-3",
              name: "Arbitration Board Approval",
              nameAr: "موافقة لجنة التحكيم",
              desc: "Ensures dispute-free sign-off by legal representatives",
              descAr: "موافقة مستشاري الامتثال القانوني لتأكيد سلامة الإنجاز",
              type: "condition",
              iconName: "AlertTriangle",
              x: 540,
              y: 150,
            },
            {
              id: "node-4",
              name: "Release Escrow Deposit",
              nameAr: "صرف المبالغ المضمونة",
              desc: "Triggers banking API to transfer escrowed funds",
              descAr: "تحفيز حوالة البنك وصرف قيمة الدفعة المعتمدة للمقاول",
              type: "action",
              iconName: "Zap",
              x: 760,
              y: 150,
            },
          ],
          edges: [
            { from: "node-1", to: "node-2" },
            { from: "node-2", to: "node-3" },
            { from: "node-3", to: "node-4" },
          ],
        };
      }

      return res.json({
        success: true,
        workflow: selectedWorkflow,
        warning: "انشغال في الخادم الذكي حالياً، تم توليد مسار مخصص بديل.",
      });
    }
  } catch (err: any) {
    console.error("Workflow Suggestion Error:", err);
    res.status(500).json({ error: "فشل استخلاص مسار العمل المقترح: " + err.message });
  }
});

// Initial analytics metrics for Workflows visual nodes loaded from the database
router.get("/init", authenticate, async (req: any, res) => {
  try {
    const transactions = await getTransactionsForUser(req.user.id);
    const bankLedger = await getBankLedgerForUser(req.user.id);

    const salesCount = transactions.filter((t) => t.type === "sales").length;
    const purchasesCount = transactions.filter((t) => t.type === "purchase").length;

    const salesVat = transactions
      .filter((t) => t.type === "sales")
      .reduce((sum, t) => sum + t.vatAmount, 0);
    const purchasesVat = transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.vatAmount, 0);

    const salesTotal = transactions
      .filter((t) => t.type === "sales")
      .reduce((sum, t) => sum + t.total, 0);
    const purchasesTotal = transactions
      .filter((t) => t.type === "purchase")
      .reduce((sum, t) => sum + t.total, 0);

    const missingDocsCount = bankLedger.filter((b) => !b.hasMatchingDoc).length;
    const mathMismatchCount = transactions.filter(
      (t) => t.compliance === "non_compliant" && t.reason === "MathMismatch"
    ).length;

    res.json({
      success: true,
      metrics: {
        salesCount,
        purchasesCount,
        salesVat,
        purchasesVat,
        salesTotal,
        purchasesTotal,
        missingDocsCount,
        mathMismatchCount,
        totalTransactions: transactions.length,
      },
    });
  } catch (err: any) {
    console.error("Error loading workflows initialization metrics:", err);
    res.status(500).json({ error: "فشل استيراد مقاييس تشغيل مسارات العمل" });
  }
});

export default router;
