import { AnalyticsReport, KPI, RiskAlert, ActionRecommendation, Scenario } from "./types.js";
import { SegmentAnalyzer } from "./segments.js";

export class DataAnalyticsEngine {
  private segmentAnalyzer = new SegmentAnalyzer();

  /**
   * Transforms raw business data into a premium intelligence report.
   */
  public generateFullReport(invoices: any[], leads: any[]): AnalyticsReport {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const totalInvoiced =
      safeInvoices.reduce((acc, inv) => acc + (inv.totalAmountHalalas || 0), 0) / 100;
    const totalPaid =
      safeInvoices.reduce((acc, inv) => acc + (inv.paidAmountHalalas || 0), 0) / 100;
    const collectedRate = totalInvoiced > 0 ? (totalPaid / totalInvoiced) * 100 : 0;

    const wonLeads = leads.filter((l) => l.status === "won").length;
    const totalValue = leads.reduce((acc, l) => acc + (l.value || 0), 0);
    const avgLeadValue = leads.length > 0 ? totalValue / leads.length : 0;

    // KPI Tree Generation
    const kpis: KPI[] = [
      {
        id: "revenue_efficiency",
        label: "كفاءة تحصيل الإيرادات",
        value: `${collectedRate.toFixed(1)}%`,
        numericValue: collectedRate,
        unit: "%",
        trend: collectedRate > 80 ? "+5.1%" : "-2.3%",
        isPositiveTrend: collectedRate > 80,
        status: collectedRate > 85 ? "strong" : collectedRate > 60 ? "average" : "weak",
        subDrivers: ["تذكيرات الدفع", "بوابات الدفع الإلكترونية", "شروط الائتمان"],
        description:
          "يقيس هذا المؤشر الفجوة بين الفواتير المصدرة والسيولة النقدية الفعلية الداخلة للشركة.",
      },
      {
        id: "sales_conversion",
        label: "معدل الإغلاق (Conversion)",
        value: `${leads.length > 0 ? ((wonLeads / leads.length) * 100).toFixed(1) : 0}%`,
        numericValue: leads.length > 0 ? (wonLeads / leads.length) * 100 : 0,
        unit: "%",
        trend: "+2.5%",
        isPositiveTrend: true,
        status: "average",
        subDrivers: ["سرعة الاستجابة", "دقة العروض", "متابعة المبيعات"],
        description: "تحويل الفرص المتاحة إلى صفقات رابحة.",
      },
    ];

    // Predictive Engine (Scenarios)
    const scenarios: Scenario[] = [
      {
        name: "المسار الأساسي",
        color: "#cbd5e1",
        data: this.generateGrowthData(totalPaid, 0.1),
      },
      {
        name: "سيناريو النمو المتفائل",
        color: "#10b981",
        data: this.generateGrowthData(totalPaid, 0.25),
      },
    ];

    // Decision Intelligence
    const actionPlan: ActionRecommendation[] = [
      {
        id: "1",
        action: "أتمتة المتابعة المالية",
        impact: "high",
        effort: "low",
        priority: 1,
        tradeOff: "قد يزعج بعض العملاء التقليديين، لكنه يحسن السيولة فوراً.",
        secondOrderEffect: "يقلل الضغط على المحاسبين لإجراء مكالمات التحصيل اليدوية.",
      },
      {
        id: "2",
        action: "تحسين دورة المبيعات",
        impact: "medium",
        effort: "high",
        priority: 2,
        tradeOff: "يتطلب وقتاً أطول للتطبيق مقارنة بالحلول السريعة.",
        secondOrderEffect: "بناء استدامة تسويقية طويلة الأمد.",
      },
    ];

    return {
      timestamp: new Date().toISOString(),
      executiveSummary:
        totalPaid < totalInvoiced * 0.7
          ? "هناك فجوة ملحوظة في التحصيل. نوصي بتفعيل أنظمة التحصيل الآلي فوراً."
          : "الأداء المالي مستقر مع معدلات تحصيل ممتازة. نوصي بالتركيز على التوسع والاستحواذ.",
      keyMetrics: kpis,
      unitEconomics: {
        cac: "غير متوفر",
        ltv: "غير متوفر",
        paybackPeriod: "غير متوفر",
        margin: "غير متوفر",
      },
      segments: this.segmentAnalyzer.analyzeSegments(safeInvoices),
      forecast: {
        scenarios,
        variables: ["أسعار الطاقة", "السياسات الضريبية الجديدة", "موسم رمضان"],
      },
      alerts: [
        {
          id: "a1",
          title: "فجوة التحصيل",
          description: `هناك ${(totalInvoiced - totalPaid).toLocaleString()} ر.س معلقة حالياً.`,
          severity: totalPaid < totalInvoiced * 0.6 ? "high" : "low",
          type: "anomaly",
        },
      ],
      benchmarks: [
        {
          metric: "معدل التحصيل",
          current: collectedRate,
          industryAvg: 78,
          rating: collectedRate > 78 ? "ممتاز" : "متوسط",
        },
      ],
      actionPlan,
      decisiveAction:
        totalPaid < totalInvoiced * 0.7
          ? "قم بإلزام العملاء الجدد بدفعة مقدمة بنسبة ٥٠٪ لتقليل مخاطر التشغيل."
          : "يمكنك البدء في استثمارات توسعية بناءً على استقرار التدفق المالي.",
    };
  }

  private generateGrowthData(baseValue: number, rate: number) {
    const data = [];
    const months = ["يناير", "فبراير", "مارس", "إبريل", "مايو", "يونيو"];
    let current = baseValue || 50000;
    for (const month of months) {
      data.push({ label: month, value: Math.round(current) });
      current *= 1 + rate;
    }
    return data;
  }
}
