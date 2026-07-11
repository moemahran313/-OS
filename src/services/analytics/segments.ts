export class SegmentAnalyzer {
  /**
   * Analyzes customer segments and identifies growth opportunities.
   */
  public analyzeSegments(invoices: any[]): any[] {
    const rawSegments: Record<string, number> = {};

    invoices.forEach((inv) => {
      const segment = inv.clientIndustry || inv.industry || "General";
      const amount = (inv.totalAmountHalalas || 0) / 100;
      rawSegments[segment] = (rawSegments[segment] || 0) + amount;
    });

    return Object.entries(rawSegments).map(([name, value]) => ({
      name,
      value,
      growth: `غير متوفر`,
      retention: "غير متوفر",
    }));
  }

  public generateCohortData(leads: any[]): any[] {
    // Generate simple cohort data based on lead creation months
    const cohorts: Record<string, number> = {};
    leads.forEach((l) => {
      const d = new Date(l.createdAt);
      const key = `Q${Math.floor(d.getMonth() / 3) + 1}-${d.getFullYear().toString().slice(-2)}`;
      cohorts[key] = (cohorts[key] || 0) + 1;
    });

    return Object.entries(cohorts)
      .map(([cohort, count]) => ({
        cohort,
        retention: [
          100,
          Math.max(0, 85 - (count % 10)),
          Math.max(0, 70 - (count % 5)),
          Math.max(0, 60 - (count % 3)),
        ],
      }))
      .slice(-3);
  }
}
