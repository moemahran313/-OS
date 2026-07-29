export interface LeadCompany {
  id: string;
  name: string;
  nameAr?: string;
  website: string;
  logo?: string;
  address: string;
  city: string;
  country: string;
  region: string;
  phone: string;
  email: string;
  industry: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  employeeCount: number;
  revenueRange: string;
  foundedYear: number;
  businessHours: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
  };
  coordinates: {
    lat: number;
    lng: number;
  };
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  source: string;
  crNumber?: string;
  crStatus?: "VALID" | "EXPIRED" | "PENDING";
  enrichment?: AiCompanyEnrichment;
  webAudit?: WebsiteAuditReport;
}

export interface LeadContact {
  id: string;
  companyId: string;
  companyName: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  email: string;
  phone: string;
  mobile: string;
  linkedin: string;
  leadStatus: "new" | "contacted" | "qualified" | "meeting" | "proposal" | "negotiation" | "won" | "lost";
  leadScore: number;
  tags: string[];
  notes: string;
  assignedTo: string;
  createdAt: string;
  lastEngagedAt?: string;
}

export interface AiCompanyEnrichment {
  companySummary: string;
  industryClassification: string;
  servicesOffered: string[];
  products: string[];
  targetCustomers: string[];
  suggestedSalesPitch: string;
  estimatedBusinessType: string;
  potentialNeeds: string[];
  websiteQualityScore: number; // 0 - 100
  digitalPresenceScore: number; // 0 - 100
  generatedAt: string;
}

export interface WebsiteAuditReport {
  mobileFriendly: boolean;
  hasSsl: boolean;
  pageSpeedScore: number; // 0-100
  seoScore: number; // 0-100
  metaTagsFound: boolean;
  hasContactForms: boolean;
  hasOnlineBooking: boolean;
  hasLiveChat: boolean;
  hasAnalytics: boolean;
  hasSocialLinks: boolean;
  hasWhatsappButton: boolean;
  accessibilityScore: number; // 0-100
  techStack: string[];
  improvementSuggestions: string[];
  keyGaps: string[];
}

export interface CampaignStep {
  id: string;
  type: "import" | "ai_qualify" | "send_email" | "delay" | "send_whatsapp" | "create_task" | "move_pipeline";
  label: string;
  config: {
    delayDays?: number;
    emailTemplate?: string;
    whatsappTemplate?: string;
    targetStage?: string;
    assignedSalesperson?: string;
    minScoreThreshold?: number;
  };
}

export interface CampaignWorkflow {
  id: string;
  title: string;
  status: "active" | "draft" | "paused" | "completed";
  targetSegment: string;
  steps: CampaignStep[];
  leadsEnrolled: number;
  emailsSent: number;
  repliesReceived: number;
  conversions: number;
  createdAt: string;
}

export interface LeadFilterParams {
  search: string;
  industry: string;
  city: string;
  country: string;
  minEmployees: number;
  maxEmployees: number;
  minRating: number;
  hasWebsite?: boolean;
  hasPhone?: boolean;
  hasEmail?: boolean;
  missingSsl?: boolean;
  missingBooking?: boolean;
  hasWhatsapp?: boolean;
  radiusKm: number;
  centerLat?: number;
  centerLng?: number;
  leadStage?: string;
}

export interface LeadTask {
  id: string;
  leadId: string;
  leadName: string;
  companyName: string;
  taskType: "call" | "email" | "meet" | "proposal" | "followup" | "demo";
  title: string;
  dueDate: string;
  status: "pending" | "completed" | "cancelled";
  assignedTo: string;
  notes: string;
  createdAt: string;
}

export interface AutomationCondition {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "is_true" | "is_false";
  value: any;
}

export interface AutomationAction {
  actionType: "tag" | "score_change" | "assign" | "task" | "notification" | "crm_sync";
  value: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: "on_lead_imported" | "on_score_threshold" | "on_status_change" | "on_web_audit";
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  active: boolean;
  runsCount: number;
}
