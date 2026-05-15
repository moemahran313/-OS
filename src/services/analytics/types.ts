export type MetricStatus = 'strong' | 'average' | 'weak' | 'critical';
export type ImpactLevel = 'high' | 'medium' | 'low';

export interface KPI {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  trend: string;
  isPositiveTrend: boolean;
  status: MetricStatus;
  subDrivers: string[];
  description: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  secondary?: number;
  category?: string;
}

export interface Scenario {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

export interface RiskAlert {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  type: 'anomaly' | 'efficiency' | 'risk' | 'dependence';
}

export interface ActionRecommendation {
  id: string;
  action: string;
  impact: ImpactLevel;
  effort: ImpactLevel;
  priority: number;
  tradeOff: string;
  secondOrderEffect: string;
}

export interface AnalyticsReport {
  timestamp: string;
  executiveSummary: string;
  keyMetrics: KPI[];
  unitEconomics: {
    cac: number | string;
    ltv: number | string;
    paybackPeriod: number | string;
    margin: number | string;
  };
  segments: {
    name: string;
    value: number;
    growth: string;
  }[];
  forecast: {
    scenarios: Scenario[];
    variables: string[];
  };
  alerts: RiskAlert[];
  benchmarks: {
    metric: string;
    current: number;
    industryAvg: number;
    rating: string;
  }[];
  actionPlan: ActionRecommendation[];
  decisiveAction: string;
}
