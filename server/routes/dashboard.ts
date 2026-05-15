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
      where: { userId: req.user.id }
    });
    const userLeads = await prisma.lead.findMany({
      where: { userId: req.user.id }
    });

    const totalInvoicedHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.totalAmountHalalas || 0),
      0,
    );
    const totalPaidHalalas = userInvoices.reduce(
      (acc, inv) => acc + (inv.paidAmountHalalas || 0),
      0,
    );

    // Lead closing notifications logic
    const in3Days = new Date();
    in3Days.setDate(in3Days.getDate() + 3);
    
    const leads = await prisma.lead.findMany({
      where: {
        userId: req.user.id,
        expectedCloseDate: {
          lte: in3Days,
          gte: new Date()
        },
        status: { notIn: ['won', 'lost'] }
      }
    });

    for (const lead of leads) {
      const existing = await prisma.notification.findFirst({
        where: {
          userId: req.user.id,
          relatedId: lead.id,
          type: 'lead_close',
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }
      });

      if (!existing) {
        try {
          await prisma.notification.create({
            data: {
              userId: req.user.id,
              title: "تنبيه موعد إغلاق الصفقة",
              message: `الصفقة مع "${lead.name}" تقترب من موعد الإغلاق المتوقع (${lead.expectedCloseDate?.toLocaleDateString()})`,
              type: 'lead_close',
              relatedId: lead.id
            }
          });
        } catch (notifErr) {
          console.error("Failed to create dashboard notification:", notifErr);
        }
      }
    }

    // Monthly trends
    const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const trendData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
      trendData.push({ name, sales: 0 });
    }
    
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    userInvoices.forEach(inv => {
      if (inv.status === 'paid' && new Date(inv.createdAt) >= oneYearAgo) {
        const d = new Date(inv.createdAt);
        const name = `${months[d.getMonth()]} ${d.getFullYear()}`;
        const item = trendData.find(t => t.name === name);
        if (item) {
           item.sales += (inv.paidAmountHalalas || 0) / 100;
        }
      }
    });

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const revenueThisMonth = userInvoices.reduce((acc, inv) => {
      const d = new Date(inv.createdAt);
      if (inv.status === 'paid' && d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        return acc + (inv.paidAmountHalalas || 0);
      }
      return acc;
    }, 0) / 100;

    const revenueLastMonth = userInvoices.reduce((acc, inv) => {
      const d = new Date(inv.createdAt);
      if (inv.status === 'paid' && d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear) {
        return acc + (inv.paidAmountHalalas || 0);
      }
      return acc;
    }, 0) / 100;

    const revenueTrend = revenueLastMonth === 0 ? (revenueThisMonth > 0 ? 100 : 0) : ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;

    const emps = await prisma.employee.findMany({ where: { userId: req.user.id } });
    const payrollCost = emps.reduce((acc, e) => acc + ( (e.baseSalaryHalalas || 0) + (e.housingAllowanceHalalas || 0) + (e.transportAllowanceHalalas || 0) - (e.otherDeductionsHalalas || 0) ), 0) / 100;
    const totalEmployees = emps.length;
    const saudiEmployeesCount = emps.filter(e => e.nationality === "Saudi" || e.nationality === "سعودي" || e.nationality === "Saudi Arabia").length;

    const saudiRatio = totalEmployees > 0 ? (saudiEmployeesCount / totalEmployees) : 0;
    let complianceScore = 0;
    if (totalEmployees > 0) {
      complianceScore = Math.min(100, Math.round((saudiRatio * 60) + 40));
    }

    const previousRun = (await prisma.payrollRun.findMany({
      where: { userId: req.user.id },
      take: 1,
      orderBy: { createdAt: 'desc' }
    }))[0];
    const previousPayrollCost = previousRun ? previousRun.totalGross : payrollCost * 0.98;
    const payrollTrend = previousPayrollCost > 0 ? ((payrollCost - previousPayrollCost) / previousPayrollCost) * 100 : 0;

    const vatExposure = userInvoices.reduce((acc, inv) => {
      if (inv.status !== 'paid') {
         return acc + (inv.totalAmountHalalas || 0);
      }
      return acc;
    }, 0) * 0.15 / 100;

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
        payroll: payrollTrend.toFixed(1)
      },
      pendingInvoices: userInvoices.filter((i) => i.status !== "paid").length,
      config: user?.dashboardConfig ? (function() { try { return JSON.parse(user.dashboardConfig); } catch(e) { return null; } })() : null,
      chartData: trendData,
      employeesCount: totalEmployees,
      recentLogs: await prisma.auditLog.findMany({
        where: { userId: req.user.id },
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: { user: { select: { name: true } } }
      })
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
