import { Router } from "express";
import { prisma } from "../services/prisma.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// This should be mounted at /api/dashboard
router.get("/", authenticate, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const userInvoices = await prisma.invoice.findMany({
      where: { userId: req.user.id },
    });
    const userLeads = await prisma.lead.findMany({
      where: { userId: req.user.id },
    });

    const totalInvoicedHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.totalAmountHalalas || 0),
      0
    );
    const totalPaidHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.paidAmountHalalas || 0),
      0
    );

    // Lead closing notifications logic
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);

    const leads = await prisma.lead.findMany({
      where: {
        userId: req.user.id,
        expectedCloseDate: {
          lte: in3Days,
          gte: new Date(),
        },
        status: { notIn: ["won", "lost"] },
      },
    });

    for (const lead of leads) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: req.user.id,
          relatedId: lead.id,
          type: "lead_close",
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      });

      if (!existing) {
        try {
          await prisma.notification.create({
            data: {
              userId: req.user.id,
              title: "تنبيه موعد إغلاق الصفقة",
              message: `الصفقة مع "${lead.name}" تقترب من موعد الإغلاق المتوقع (${lead.expectedCloseDate?.toLocaleDateString()})`,
              type: "lead_close",
              relatedId: lead.id,
            },
          });
        } catch (notifErr) {
          console.error("Failed to create dashboard notification:", notifErr);
        }
      }
    }

    // Monthly trends
    const months = [
      "يناير",
      "فبراير",
      "مارس",
      "أبريل",
      "مايو",
      "يونيو",
      "يوليو",
      "أغسطس",
      "سبتمبر",
      "أكتوبر",
      "نوفمبر",
      "ديسمبر",
    ];
    const trendData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendData.push({ name, sales: 0 });
    }

    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    userInvoices.forEach((inv) => {
      if (inv.status === "paid" && new Date(inv.createdAt) >= oneYearAgo) {
        const d = new Date(inv.createdAt);
        const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const item = trendData.find((t) => t.name === name);
        if (item) {
          item.sales += (inv.paidAmountHalalas || 0) / 100;
        }
      }
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const revenueThisMonth =
      userInvoices.reduce((acc, inv) => {
        const d = new Date(inv.createdAt);
        if (
          inv.status === "paid" &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        ) {
          return acc + (inv.paidAmountHalalas || 0);
        }
        return acc;
      }, 0) / 100;

    const revenueLastMonth =
      userInvoices.reduce((acc, inv) => {
        const d = new Date(inv.createdAt);
        if (
          inv.status === "paid" &&
          d.getMonth() === lastMonth &&
          d.getFullYear() === lastMonthYear
        ) {
          return acc + (inv.paidAmountHalalas || 0);
        }
        return acc;
      }, 0) / 100;

    const revenueTrend =
      revenueLastMonth === 0
        ? revenueThisMonth > 0
          ? 100
          : 0
        : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

    const emps = await prisma.employee.findMany({ where: { userId: req.user.id } });
    const payrollCost =
      emps.reduce(
        (acc, e) =>
          acc +
          ((e.baseSalaryHalalas || 0) +
            (e.housingAllowanceHalalas || 0) +
            (e.transportAllowanceHalalas || 0) -
            (e.otherDeductionsHalalas || 0)),
        0
      ) / 100;
    const totalEmployees = emps.length;
    const saudiEmployeesCount = emps.filter(
      (e) =>
        e.nationality === "Saudi" || e.nationality === "سعودي" || e.nationality === "Saudi Arabia"
    ).length;

    const saudiRatio = totalEmployees > 0 ? saudiEmployeesCount / totalEmployees : 0;
    let complianceScore = 0;
    if (totalEmployees > 0) {
      complianceScore = Math.min(100, Math.round(saudiRatio * 60 + 40));
    }

    const previousRun = (
      await prisma.payrollRun.findMany({
        where: { userId: req.user.id },
        take: 1,
        orderBy: { createdAt: "desc" },
      })
    )[0];
    const previousPayrollCost = previousRun ? previousRun.totalGross : payrollCost * 0.98;
    const payrollTrend =
      previousPayrollCost > 0
        ? ((payrollCost - previousPayrollCost) / previousPayrollCost) * 100
        : 0;

    const vatExposure =
      (userInvoices.reduce((acc, inv) => {
        if (inv.status !== "paid") {
          return acc + (inv.totalAmountHalalas || 0);
        }
        return acc;
      }, 0) *
        0.15) /
      100;

    // Calculate Business Health Score dynamically
    // Base score starts at 70
    let healthScore = 70;

    // 1. Revenue trend impact (max +/- 10)
    const revTrendVal = parseFloat(revenueTrend.toFixed(1));
    if (revTrendVal > 0) {
      healthScore += Math.min(10, revTrendVal * 0.3);
    } else {
      healthScore -= Math.min(15, Math.abs(revTrendVal) * 0.4);
    }

    // 2. Sales performance: leads conversion/ratio (max +/- 10)
    const activeLeadsCount = userLeads.length;
    if (activeLeadsCount > 5) {
      healthScore += 8;
    } else if (activeLeadsCount > 0) {
      healthScore += 4;
    } else {
      healthScore -= 5;
    }

    // 3. Outstanding invoice aging (max +/- 15)
    // Calculate average aging of pending invoices in days
    const pendingInvoicesList = userInvoices.filter((i) => i.status !== "paid");
    let totalAgingDays = 0;
    let averageAgingDays = 0;
    if (pendingInvoicesList.length > 0) {
      const now = new Date();
      pendingInvoicesList.forEach((inv) => {
        const created = new Date(inv.createdAt);
        const diffTime = Math.abs(now.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        totalAgingDays += diffDays;
      });
      averageAgingDays = Math.round(totalAgingDays / pendingInvoicesList.length);
      
      // Impact of outstanding aging
      if (averageAgingDays > 30) {
        healthScore -= 12;
      } else if (averageAgingDays > 15) {
        healthScore -= 6;
      } else {
        healthScore += 5;
      }
    } else {
      healthScore += 10; // no pending invoices is excellent for cash flow!
    }

    // 4. Customer Acquisition Cost (CAC) vs Customer Value
    // Simulate CAC based on marketing expenses / leads
    const simulatedMarketingExpense = 3500; // SAR
    const simulatedCAC = activeLeadsCount > 0 ? Math.round(simulatedMarketingExpense / activeLeadsCount) : 450;
    // Standard customer value is around 4500 SAR. If CAC is low (CAC < 1000), add score. If CAC is high, subtract.
    if (simulatedCAC < 600) {
      healthScore += 7;
    } else if (simulatedCAC > 1500) {
      healthScore -= 5;
    } else {
      healthScore += 3;
    }

    // Bound the score between 35 and 98
    healthScore = Math.max(35, Math.min(98, Math.round(healthScore)));

    // Generate explanations and recommendations dynamically based on the score
    let explanationAr = "";
    let explanationEn = "";
    let recommendationsAr: string[] = [];
    let recommendationsEn: string[] = [];

    if (healthScore >= 85) {
      explanationAr = "صحة الأعمال ممتازة جداً. يظهر المشروع نمواً قوياً في الإيرادات، مع كفاءة عالية في التحصيل ونسب منخفضة لتكلفة حيازة العملاء. التدفقات النقدية مستقرة ومتينة.";
      explanationEn = "Business health is excellent. Strong revenue growth is supported by high collection efficiency and low customer acquisition costs. Cash flows are stable and resilient.";
      recommendationsAr = [
        "التوسع في الحملات التسويقية لزيادة حصتك السوقية.",
        "استثمار السيولة الفائضة لتطوير منتجات وخدمات جديدة.",
        "تقديم عروض حصرية للعملاء المميزين لزيادة ولائهم."
      ];
      recommendationsEn = [
        "Scale marketing campaigns to capture more market share.",
        "Invest surplus cash flow into developing new products and services.",
        "Offer exclusive rewards to premium clients to boost long-term loyalty."
      ];
    } else if (healthScore >= 65) {
      explanationAr = "صحة الأعمال مستقرة، ولكن هناك بعض الجوانب التي تتطلب المتابعة. توجد فواتير معلقة تقترب من مواعيد استحقاقها، وتكلفة حيازة العميل (CAC) معتدلة.";
      explanationEn = "Business health is stable, but a few areas require attention. There are pending invoices nearing their due dates, and customer acquisition cost (CAC) is moderate.";
      recommendationsAr = [
        "تفعيل تذكيرات الدفع التلقائية (WhatsApp) لتقليص عمر الفواتير المعلقة.",
        "تحسين قنوات استهداف العملاء لخفض تكلفة حيازة العميل.",
        "مراجعة شروط السداد للعملاء ذوي الدفع المتأخر."
      ];
      recommendationsEn = [
        "Activate automated payment reminders (WhatsApp) to accelerate outstanding invoice collection.",
        "Optimize customer targeting channels to lower customer acquisition cost (CAC).",
        "Review credit terms for clients with repeated payment delays."
      ];
    } else {
      explanationAr = "انتباه: مؤشر صحة الأعمال منخفض. السيولة قد تتأثر نتيجة تكدس الفواتير غير المحصلة وتراجع وتيرة المبيعات، مع ارتفاع نسبي في تكلفة الاستحواذ على العملاء الجدد.";
      explanationEn = "Warning: Business health score is critical. Cash flow is impacted by overdue invoices and slow sales velocity, combined with high customer acquisition costs.";
      recommendationsAr = [
        "إطلاق حملة تحصيل عاجلة والتواصل الفوري مع العملاء عبر الواتساب للمتأخرات.",
        "إيقاف شروط الدفع المؤجل للعملاء غير الملتزمين والتركيز على التحصيل الفوري.",
        "إعادة هيكلة ميزانية التسويق فوراً لخفض تكلفة حيازة العميل والاعتماد على الإحالات المباشرة."
      ];
      recommendationsEn = [
        "Launch an urgent collection campaign and contact clients immediately via WhatsApp regarding overdues.",
        "Suspend deferred credit terms for non-compliant accounts and focus on immediate payment.",
        "Restructure marketing budgets immediately to reduce CAC, prioritizing direct referrals."
      ];
    }

    res.json({
      revenue: totalPaidHalalas / 100,
      totalInvoiced: totalInvoicedHalalas / 100,
      activeLeads: userLeads.length,
      payrollCost: payrollCost,
      complianceScore: complianceScore,
      saudiEmployees: saudiEmployeesCount,
      vatExposure: vatExposure,
      trends: {
        revenue: revenueTrend.toFixed(1),
        compliance: (saudiRatio * 5).toFixed(1),
        payroll: payrollTrend.toFixed(1),
      },
      businessHealth: {
        score: healthScore,
        cac: simulatedCAC,
        averageAgingDays: averageAgingDays,
        explanationAr,
        explanationEn,
        recommendationsAr,
        recommendationsEn
      },
      pendingInvoices: userInvoices.filter((i) => i.status !== "paid").length,
      config: user?.dashboardConfig
        ? (function () {
            try {
              return JSON.parse(user.dashboardConfig);
            } catch (e) {
              return null;
            }
          })()
        : null,
      chartData: trendData,
      employeesCount: totalEmployees,
      recentLogs: await prisma.auditLog.findMany({
        where: { userId: req.user.id },
        take: 5,
        orderBy: { timestamp: "desc" },
        include: { user: { select: { name: true } } },
      }),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
