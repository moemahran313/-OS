import {
  LeadCompany,
  LeadContact,
  AiCompanyEnrichment,
  WebsiteAuditReport,
  LeadFilterParams,
  CampaignWorkflow,
  LeadTask,
  AutomationRule,
} from "@/src/types/leadGen";
import { collection, doc, setDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

// Initial seed data for Saudi & GCC business discovery engine
export const INITIAL_LEAD_COMPANIES: LeadCompany[] = [
  {
    id: "lead-comp-1",
    name: "Al-Riyadh Precision Engineering & Contracting",
    nameAr: "شركة الرياض للهندسة الدقيقة والمقاولات",
    website: "https://riyadhprecision-eng.com",
    address: "King Fahd Road, Al-Olaya District",
    city: "Riyadh",
    country: "Saudi Arabia",
    region: "Riyadh Region",
    phone: "+966 11 482 9901",
    email: "contact@riyadhprecision-eng.com",
    industry: "Engineering & Construction",
    category: "Structural Engineering",
    description: "Leading Saudi structural and civil engineering consultant specializing in commercial towers and infrastructure.",
    rating: 4.6,
    reviewCount: 48,
    employeeCount: 120,
    revenueRange: "SAR 20M - 50M",
    foundedYear: 2012,
    businessHours: "Sun-Thu: 8:00 AM - 5:00 PM",
    socialLinks: {
      linkedin: "https://linkedin.com/company/riyadhprecision",
      twitter: "https://x.com/riyadhprecision",
      whatsapp: "+966501234567",
    },
    coordinates: { lat: 24.7136, lng: 46.6753 },
    tags: ["Engineering", "Riyadh", "Government Contractor", "High Value"],
    createdAt: "2026-01-15T09:00:00Z",
    updatedAt: "2026-07-28T10:30:00Z",
    source: "Saudi Public Directory",
    crNumber: "1010348921",
    crStatus: "VALID",
    enrichment: {
      companySummary: "Tier-1 engineering consultancy in Riyadh with large government sub-contracts.",
      industryClassification: "AEC / Heavy Infrastructure",
      servicesOffered: ["BIM Modeling", "Structural Audits", "HVAC Design", "Project Management"],
      products: ["Turnkey Structural Blueprints", "MEP Engineering Services"],
      targetCustomers: ["Real Estate Developers", "Ministry of Housing Contractors"],
      suggestedSalesPitch: "Pitch Madarij OS automated project invoicing and ZATCA Phase 2 E-Invoicing integration to cut billing cycle from 45 days to 3 days.",
      estimatedBusinessType: "B2B Enterprise Corporate",
      potentialNeeds: ["ERP Automation", "ZATCA E-Invoicing", "WPS Payroll Integration", "Subcontractor Contract Management"],
      websiteQualityScore: 62,
      digitalPresenceScore: 70,
      generatedAt: "2026-07-28T12:00:00Z",
    },
    webAudit: {
      mobileFriendly: true,
      hasSsl: true,
      pageSpeedScore: 58,
      seoScore: 65,
      metaTagsFound: true,
      hasContactForms: true,
      hasOnlineBooking: false,
      hasLiveChat: false,
      hasAnalytics: true,
      hasSocialLinks: true,
      hasWhatsappButton: false,
      accessibilityScore: 72,
      techStack: ["WordPress", "PHP", "Apache", "Google Tag Manager"],
      improvementSuggestions: [
        "Add online consultation booking for enterprise clients.",
        "Integrate direct Saudi WhatsApp Business floating widget.",
        "Optimize CAD portfolio images to increase PageSpeed from 58 to 90+",
      ],
      keyGaps: ["No online client portal", "Missing instant WhatsApp sales channel", "Slow mobile performance"],
    },
  },
  {
    id: "lead-comp-2",
    name: "Jeddah Pearl Dental Center & Orthodontics",
    nameAr: "مركز مجمع لؤلؤة جدة لطب الأسنان",
    website: "https://jeddahpearldental.sa",
    address: "Prince Sultan Street, Al-Rawdah",
    city: "Jeddah",
    country: "Saudi Arabia",
    region: "Makkah Region",
    phone: "+966 12 692 4433",
    email: "info@jeddahpearldental.sa",
    industry: "Healthcare & Dentistry",
    category: "Dental Polyclinic",
    description: "Premium dental clinic offering cosmetic dentistry, implants, and pediatric dental care in Jeddah.",
    rating: 4.8,
    reviewCount: 184,
    employeeCount: 35,
    revenueRange: "SAR 5M - 15M",
    foundedYear: 2017,
    businessHours: "Sat-Thu: 9:00 AM - 9:00 PM",
    socialLinks: {
      instagram: "https://instagram.com/jeddahpearldental",
      whatsapp: "+966559876543",
    },
    coordinates: { lat: 21.5433, lng: 39.1728 },
    tags: ["Healthcare", "Polyclinic", "Jeddah", "High Rating"],
    createdAt: "2026-02-10T08:30:00Z",
    updatedAt: "2026-07-28T14:20:00Z",
    source: "MOH Saudi Medical Index",
    crNumber: "4030284910",
    crStatus: "VALID",
    enrichment: {
      companySummary: "High-volume cosmetic and general dental polyclinic in prime Jeddah healthcare corridor.",
      industryClassification: "Private Healthcare / Medical Practice",
      servicesOffered: ["Teeth Whitening", "Dental Implants", "Orthodontics", "Pediatric Care"],
      products: ["Dental Care Subscriptions", "Invisalign Aligners"],
      targetCustomers: ["High Net Worth Individuals", "Corporate Medical Insurance Holders"],
      suggestedSalesPitch: "Demonstrate Madarij OS WhatsApp CRM auto-booking and instant SMS appointment reminders to reduce patient no-shows by 40%.",
      estimatedBusinessType: "B2C Healthcare Clinic",
      potentialNeeds: ["Online Appointment System", "Patient WhatsApp Marketing", "VAT B2C Simplified Invoicing"],
      websiteQualityScore: 45,
      digitalPresenceScore: 82,
      generatedAt: "2026-07-28T12:30:00Z",
    },
    webAudit: {
      mobileFriendly: false,
      hasSsl: false,
      pageSpeedScore: 42,
      seoScore: 50,
      metaTagsFound: false,
      hasContactForms: true,
      hasOnlineBooking: false,
      hasLiveChat: false,
      hasAnalytics: false,
      hasSocialLinks: true,
      hasWhatsappButton: true,
      accessibilityScore: 60,
      techStack: ["Custom HTML", "jQuery", "Shared Hosting"],
      improvementSuggestions: [
        "CRITICAL: Install SSL Certificate immediately (Currently showing HTTP unsecure warning).",
        "Enable 24/7 online dental appointment booking widget.",
        "Redesign mobile layout for emergency dental inquiries.",
      ],
      keyGaps: ["Missing SSL Security", "No online booking integration", "Poor mobile responsiveness"],
    },
  },
  {
    id: "lead-comp-3",
    name: "Al-Dammam Gulf Logistics & Freight Forwarding",
    nameAr: "شركة لوجستيات الخليج بالدمام والشحن الجوي والبحري",
    website: "https://dammamgulftrans.com",
    address: "King Abdulaziz Seaport Zone",
    city: "Dammam",
    country: "Saudi Arabia",
    region: "Eastern Province",
    phone: "+966 13 833 7711",
    email: "operations@dammamgulftrans.com",
    industry: "Logistics & Supply Chain",
    category: "Freight Forwarding",
    description: "Customs clearance, port logistics, and bonded warehousing services at Dammam Port.",
    rating: 4.3,
    reviewCount: 32,
    employeeCount: 85,
    revenueRange: "SAR 15M - 40M",
    foundedYear: 2010,
    businessHours: "Sun-Thu: 7:30 AM - 4:30 PM",
    socialLinks: {
      linkedin: "https://linkedin.com/company/dammamgulftrans",
    },
    coordinates: { lat: 26.4344, lng: 50.1033 },
    tags: ["Logistics", "Port Dammam", "Customs", "Heavy Equipment"],
    createdAt: "2026-03-01T11:15:00Z",
    updatedAt: "2026-07-28T16:00:00Z",
    source: "Saudi Customs Freight Directory",
    crNumber: "2050183920",
    crStatus: "VALID",
    enrichment: {
      companySummary: "Established logistics and customs clearance provider serving industrial hubs in Dammam and Jubail.",
      industryClassification: "Transport & Maritime Logistics",
      servicesOffered: ["Port Clearance", "Bonded Warehousing", "Cold Chain Transport", "GCC Cross-Border Trucking"],
      products: ["Freight Logistics Contracts", "Warehousing Storage Lots"],
      targetCustomers: ["Manufacturing Plants", "Food & Beverage Distributors", "Oil & Gas Suppliers"],
      suggestedSalesPitch: "Offer Madarij OS Supply Chain & Automated Gate Clearance invoicing to streamline customs manifest attachments and driver WPS compliance.",
      estimatedBusinessType: "B2B Logistics Freight",
      potentialNeeds: ["Fleet Driver WPS Payroll", "Multi-Currency Invoicing", "Waybill Tracking Portal"],
      websiteQualityScore: 50,
      digitalPresenceScore: 55,
      generatedAt: "2026-07-28T13:00:00Z",
    },
    webAudit: {
      mobileFriendly: true,
      hasSsl: true,
      pageSpeedScore: 61,
      seoScore: 54,
      metaTagsFound: true,
      hasContactForms: true,
      hasOnlineBooking: false,
      hasLiveChat: false,
      hasAnalytics: false,
      hasSocialLinks: false,
      hasWhatsappButton: false,
      accessibilityScore: 68,
      techStack: ["Bootstrap", "PHP", "Nginx"],
      improvementSuggestions: [
        "Add online freight quote calculator for cargo tracking.",
        "Integrate WhatsApp customer support for port container updates.",
        "Add multi-language Arabic/English logistics portal.",
      ],
      keyGaps: ["No online cargo quote engine", "Missing WhatsApp status updates", "Outdated website UI"],
    },
  },
  {
    id: "lead-comp-4",
    name: "Al-Khobar Gourmet Hospitality & Catering Group",
    nameAr: "مجموعة الضيافة والإعاشة الراقية بالخبر",
    website: "https://khobargourmet.sa",
    address: "Prince Turki Street, Corniche District",
    city: "Khobar",
    country: "Saudi Arabia",
    region: "Eastern Province",
    phone: "+966 13 898 2200",
    email: "events@khobargourmet.sa",
    industry: "Hospitality & Restaurants",
    category: "Corporate Catering & Fine Dining",
    description: "Boutique corporate catering and fine dining group serving Aramco partners and VIP events in Khobar.",
    rating: 4.9,
    reviewCount: 210,
    employeeCount: 60,
    revenueRange: "SAR 10M - 25M",
    foundedYear: 2018,
    businessHours: "Daily: 10:00 AM - 11:30 PM",
    socialLinks: {
      instagram: "https://instagram.com/khobargourmet",
      whatsapp: "+966531112233",
    },
    coordinates: { lat: 26.282, lng: 50.2104 },
    tags: ["Hospitality", "Khobar", "Corporate Events", "Aramco Supplier"],
    createdAt: "2026-04-12T09:40:00Z",
    updatedAt: "2026-07-28T11:10:00Z",
    source: "Saudi Commercial Registry",
    crNumber: "2051093841",
    crStatus: "VALID",
    enrichment: {
      companySummary: "Premium event catering and high-end restaurant group in Eastern Province.",
      industryClassification: "Food & Beverage / Event Catering",
      servicesOffered: ["Corporate Buffet Catering", "VIP Executive Lunches", "Wedding Receptions", "Private Chef Services"],
      products: ["Monthly Corporate Meal Subscriptions", "Catering Packages"],
      targetCustomers: ["Multinational Oil Services Companies", "Government Agencies", "Luxury Wedding Planners"],
      suggestedSalesPitch: "Showcase Madarij OS Lead Engine + Instant Quotation Builder to generate custom PDF proposals with digital signature in under 2 minutes.",
      estimatedBusinessType: "B2B & B2C Hospitality",
      potentialNeeds: ["Digital Proposal Generator", "Event Booking Calendar", "ZATCA QR Code POS Invoicing"],
      websiteQualityScore: 78,
      digitalPresenceScore: 92,
      generatedAt: "2026-07-28T14:00:00Z",
    },
    webAudit: {
      mobileFriendly: true,
      hasSsl: true,
      pageSpeedScore: 82,
      seoScore: 79,
      metaTagsFound: true,
      hasContactForms: true,
      hasOnlineBooking: false,
      hasLiveChat: true,
      hasAnalytics: true,
      hasSocialLinks: true,
      hasWhatsappButton: true,
      accessibilityScore: 85,
      techStack: ["Next.js", "Tailwind CSS", "Vercel", "Google Analytics"],
      improvementSuggestions: [
        "Add online menu quote request builder.",
        "Integrate automated contract signing for high-ticket wedding events.",
      ],
      keyGaps: ["No instant digital menu builder", "Manual PDF contract process"],
    },
  },
  {
    id: "lead-comp-5",
    name: "Dubai Horizon Legal Consultants & Advocates",
    nameAr: "مستشارو أفق دبي للمحاماة والاستشارات القانونية",
    website: "https://dubaihorizonlegal.com",
    address: "Business Bay, Executive Towers Tower B",
    city: "Dubai",
    country: "United Arab Emirates",
    region: "Dubai Emirate",
    phone: "+971 4 388 9011",
    email: "contacts@dubaihorizonlegal.com",
    industry: "Legal & Advisory",
    category: "Corporate Law Firm",
    description: "Corporate law firm specializing in GCC cross-border trade, commercial dispute resolution, and DIFC corporate structuring.",
    rating: 4.7,
    reviewCount: 76,
    employeeCount: 28,
    revenueRange: "AED 10M - 30M",
    foundedYear: 2014,
    businessHours: "Mon-Fri: 9:00 AM - 6:00 PM",
    socialLinks: {
      linkedin: "https://linkedin.com/company/dubaihorizonlegal",
      twitter: "https://x.com/dubaihorizonlaw",
    },
    coordinates: { lat: 25.1852, lng: 55.267 },
    tags: ["Legal", "Dubai", "Corporate Structuring", "DIFC"],
    createdAt: "2026-05-02T14:20:00Z",
    updatedAt: "2026-07-28T09:15:00Z",
    source: "UAE Commercial Directory",
    crNumber: "DED-718293",
    crStatus: "VALID",
    enrichment: {
      companySummary: "Tier-1 boutique corporate law firm in Business Bay Dubai advising regional tech & real estate ventures.",
      industryClassification: "Legal & Professional Services",
      servicesOffered: ["Cross-Border Commercial Law", "DIFC Court Litigation", "Intellectual Property", "M&A Legal Due Diligence"],
      products: ["Corporate Retainer Packages", "Commercial Contract Drafting"],
      targetCustomers: ["Family Businesses", "Tech Startups expanding to KSA", "Foreign Investment Funds"],
      suggestedSalesPitch: "Position Madarij OS 300-DPI High Resolution Digital Signature & Legal Contract Vault for seamless UAE-KSA contract execution.",
      estimatedBusinessType: "Professional B2B Advisory",
      potentialNeeds: ["Client Contract Portal", "Retainer Billing Automation", "Legal Document e-Signatures"],
      websiteQualityScore: 71,
      digitalPresenceScore: 80,
      generatedAt: "2026-07-28T15:00:00Z",
    },
    webAudit: {
      mobileFriendly: true,
      hasSsl: true,
      pageSpeedScore: 70,
      seoScore: 72,
      metaTagsFound: true,
      hasContactForms: true,
      hasOnlineBooking: false,
      hasLiveChat: false,
      hasAnalytics: true,
      hasSocialLinks: true,
      hasWhatsappButton: false,
      accessibilityScore: 78,
      techStack: ["Webflow", "HubSpot", "Cloudflare"],
      improvementSuggestions: [
        "Add online consultation scheduling wizard.",
        "Add instant legal consultation quote form.",
      ],
      keyGaps: ["No online scheduling tool", "Missing WhatsApp client intake link"],
    },
  },
  {
    id: "lead-comp-6",
    name: "Al-Oula Cloud Technology Solutions",
    nameAr: "شركة الأولى لحلول التقنية السحابية",
    website: "https://aloulacloud.sa",
    address: "Olaya Street, Silicon Avenue Building",
    city: "Riyadh",
    country: "Saudi Arabia",
    region: "Riyadh Region",
    phone: "+966 11 200 4488",
    email: "sales@aloulacloud.sa",
    industry: "Information Technology",
    category: "Cloud Infrastructure & Cybersecurity",
    description: "KSA local cloud provider offering sovereign data center hosting and cybersecurity compliance audits.",
    rating: 4.5,
    reviewCount: 52,
    employeeCount: 65,
    revenueRange: "SAR 15M - 35M",
    foundedYear: 2019,
    businessHours: "Sun-Thu: 8:30 AM - 5:30 PM",
    socialLinks: {
      linkedin: "https://linkedin.com/company/aloulacloud",
      twitter: "https://x.com/aloulacloud",
      whatsapp: "+966512348899",
    },
    coordinates: { lat: 24.721, lng: 46.662 },
    tags: ["IT", "Riyadh", "Cybersecurity", "NCA Compliant"],
    createdAt: "2026-06-10T10:00:00Z",
    updatedAt: "2026-07-28T13:45:00Z",
    source: "CITC Saudi Directory",
    crNumber: "1010928374",
    crStatus: "VALID",
    enrichment: {
      companySummary: "Managed cloud and cybersecurity service provider certified by National Cybersecurity Authority (NCA).",
      industryClassification: "Cloud Infrastructure & IT Managed Services",
      servicesOffered: ["Private Cloud Hosting", "SOC Managed Monitoring", "NCA ECC Compliance", "Disaster Recovery"],
      products: ["Monthly Cloud Server Bundles", "Cybersecurity Assessment Package"],
      targetCustomers: ["FinTech Companies", "Saudi SME Retailers", "Healthcare Providers"],
      suggestedSalesPitch: "Propose Madarij OS API & Integration marketplace to bundle Madarij E-Invoicing directly into their hosted client packages.",
      estimatedBusinessType: "B2B Managed Services",
      potentialNeeds: ["SaaS Subscription Billing", "Automated Contract Renewals", "Partner Reseller Portal"],
      websiteQualityScore: 88,
      digitalPresenceScore: 89,
      generatedAt: "2026-07-28T16:00:00Z",
    },
    webAudit: {
      mobileFriendly: true,
      hasSsl: true,
      pageSpeedScore: 91,
      seoScore: 88,
      metaTagsFound: true,
      hasContactForms: true,
      hasOnlineBooking: true,
      hasLiveChat: true,
      hasAnalytics: true,
      hasSocialLinks: true,
      hasWhatsappButton: true,
      accessibilityScore: 92,
      techStack: ["React", "Tailwind", "Cloudflare", "HubSpot", "Google Tag Manager"],
      improvementSuggestions: ["Optimize multi-tenant demo signup flow."],
      keyGaps: ["Could offer embedded financial billing tools for clients"],
    },
  },
];

// Initial seed contacts associated with lead companies
export const INITIAL_LEAD_CONTACTS: LeadContact[] = [
  {
    id: "cnt-1",
    companyId: "lead-comp-1",
    companyName: "Al-Riyadh Precision Engineering & Contracting",
    firstName: "Eng. Tariq",
    lastName: "Al-Mansoor",
    position: "Chief Executive Officer (CEO)",
    department: "Executive Management",
    email: "t.mansoor@riyadhprecision-eng.com",
    phone: "+966 11 482 9901",
    mobile: "+966 50 123 4567",
    linkedin: "https://linkedin.com/in/tariqalmansoor",
    leadStatus: "qualified",
    leadScore: 88,
    tags: ["Decision Maker", "CEO", "High Intent"],
    notes: "Expressed strong interest during Saudi Infrastructure Expo in streamlining billing for Ministry projects.",
    assignedTo: "Moe Mahran",
    createdAt: "2026-07-20T10:00:00Z",
    lastEngagedAt: "2026-07-27T14:30:00Z",
  },
  {
    id: "cnt-2",
    companyId: "lead-comp-1",
    companyName: "Al-Riyadh Precision Engineering & Contracting",
    firstName: "Sultan",
    lastName: "Al-Ghamdi",
    position: "Finance Director & CFO",
    department: "Finance & Accounting",
    email: "s.ghamdi@riyadhprecision-eng.com",
    phone: "+966 11 482 9902",
    mobile: "+966 55 987 1122",
    linkedin: "https://linkedin.com/in/sultanalghamdi-cfo",
    leadStatus: "meeting",
    leadScore: 92,
    tags: ["Finance Leader", "ZATCA Stakeholder"],
    notes: "Requires ZATCA Phase 2 XML clearance validation before signing annual SaaS agreement.",
    assignedTo: "Moe Mahran",
    createdAt: "2026-07-21T11:20:00Z",
    lastEngagedAt: "2026-07-28T09:10:00Z",
  },
  {
    id: "cnt-3",
    companyId: "lead-comp-2",
    companyName: "Jeddah Pearl Dental Center & Orthodontics",
    firstName: "Dr. Laila",
    lastName: "Al-Harbi",
    position: "Medical Director & Owner",
    department: "Clinical Operations",
    email: "dr.laila@jeddahpearldental.sa",
    phone: "+966 12 692 4433",
    mobile: "+966 55 987 6543",
    linkedin: "https://linkedin.com/in/drlaila-alharbi",
    leadStatus: "contacted",
    leadScore: 78,
    tags: ["Owner", "Healthcare", "SSL Warning"],
    notes: "Send website security audit showing missing SSL and how online booking can double weekend appointment conversions.",
    assignedTo: "Sarah Ahmad",
    createdAt: "2026-07-22T08:00:00Z",
    lastEngagedAt: "2026-07-26T16:00:00Z",
  },
  {
    id: "cnt-4",
    companyId: "lead-comp-3",
    companyName: "Al-Dammam Gulf Logistics & Freight Forwarding",
    firstName: "Fahad",
    lastName: "Al-Otaibi",
    position: "VP of Operations",
    department: "Logistics & Fleet",
    email: "f.otaibi@dammamgulftrans.com",
    phone: "+966 13 833 7711",
    mobile: "+966 54 333 9988",
    linkedin: "https://linkedin.com/in/fahadalotaibi-logistics",
    leadStatus: "new",
    leadScore: 65,
    tags: ["Operations", "Dammam Port"],
    notes: "Imported via Saudi Customs Freight Directory sync. Needs automated driver WPS salary file generation.",
    assignedTo: "Unassigned",
    createdAt: "2026-07-25T14:00:00Z",
  },
  {
    id: "cnt-5",
    companyId: "lead-comp-4",
    companyName: "Al-Khobar Gourmet Hospitality & Catering Group",
    firstName: "Youssef",
    lastName: "Al-Mutawa",
    position: "Director of Business Development",
    department: "Sales & Events",
    email: "youssef@khobargourmet.sa",
    phone: "+966 13 898 2200",
    mobile: "+966 53 111 2233",
    linkedin: "https://linkedin.com/in/youssefalmutawa",
    leadStatus: "proposal",
    leadScore: 95,
    tags: ["Hot Prospect", "Aramco Supplier", "Proposal Sent"],
    notes: "Sent digital contract proposal for Madarij OS Lead + Invoicing bundle. Waiting for board approval.",
    assignedTo: "Moe Mahran",
    createdAt: "2026-07-18T09:30:00Z",
    lastEngagedAt: "2026-07-28T11:00:00Z",
  },
];

export const INITIAL_CAMPAIGNS: CampaignWorkflow[] = [
  {
    id: "camp-1",
    title: "Saudi Construction & Engineering E-Invoicing Outreach",
    status: "active",
    targetSegment: "Engineering & Construction Companies > 50 employees in Riyadh",
    steps: [
      { id: "s1", type: "import", label: "Filter Riyadh Engineering Leads", config: {} },
      { id: "s2", type: "ai_qualify", label: "Run AI Web Audit & Score Qualification", config: { minScoreThreshold: 70 } },
      { id: "s3", type: "send_email", label: "Cold Email: ZATCA Phase 2 Audit Mitigation", config: { emailTemplate: "zatca_phase2_pitch" } },
      { id: "s4", type: "delay", label: "Wait 3 Days", config: { delayDays: 3 } },
      { id: "s5", type: "send_whatsapp", label: "Send Personalized WhatsApp Pitch to CFO", config: { whatsappTemplate: "cfo_demo_request" } },
      { id: "s6", type: "create_task", label: "Schedule Follow-up Call for Sales Rep", config: { assignedSalesperson: "Moe Mahran" } },
      { id: "s7", type: "move_pipeline", label: "Move to 'Contacted' Stage in CRM", config: { targetStage: "contacted" } },
    ],
    leadsEnrolled: 142,
    emailsSent: 128,
    repliesReceived: 34,
    conversions: 12,
    createdAt: "2026-07-01T10:00:00Z",
  },
  {
    id: "camp-2",
    title: "Jeddah Medical Clinics SSL & Booking Growth Campaign",
    status: "active",
    targetSegment: "Private Dental & Medical Polyclinics in Jeddah missing SSL/Booking",
    steps: [
      { id: "s20", type: "import", label: "Import Jeddah Healthcare Directory", config: {} },
      { id: "s21", type: "ai_qualify", label: "Filter Websites Missing SSL or Online Booking", config: {} },
      { id: "s22", type: "send_whatsapp", label: "Instant WhatsApp: Emergency SSL & Booking Audit", config: { whatsappTemplate: "clinic_audit" } },
      { id: "s23", type: "delay", label: "Wait 2 Days", config: { delayDays: 2 } },
      { id: "s24", type: "send_email", label: "Email Report: Patient No-Show Reduction", config: {} },
      { id: "s25", type: "create_task", label: "Call Clinic Manager", config: {} },
    ],
    leadsEnrolled: 86,
    emailsSent: 74,
    repliesReceived: 28,
    conversions: 9,
    createdAt: "2026-07-10T12:00:00Z",
  },
];

export const INITIAL_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: "rule-1",
    name: "Auto-Tag High Rating Healthcare Prospects",
    description: "Automatically tag polyclinics with > 4.5 star rating as 'VIP Target'.",
    trigger: "on_lead_imported",
    conditions: [
      { field: "industry", operator: "contains", value: "Healthcare" },
      { field: "rating", operator: "greater_than", value: 4.5 },
    ],
    actions: [
      { actionType: "tag", value: "VIP Target" },
      { actionType: "score_change", value: 15 },
    ],
    active: true,
    runsCount: 42,
  },
  {
    id: "rule-2",
    name: "Flag Security Gaps & Create Urgent Call Task",
    description: "When web audit detects missing SSL or page speed < 50, create call task for sales rep.",
    trigger: "on_web_audit",
    conditions: [
      { field: "hasSsl", operator: "is_false", value: false },
    ],
    actions: [
      { actionType: "tag", value: "Security Gap" },
      { actionType: "task", value: "Urgent Call: Unsecure Website Audit" },
      { actionType: "crm_sync", value: true },
    ],
    active: true,
    runsCount: 19,
  },
];

// Helper to filter leads dynamically
export function filterLeadCompanies(companies: LeadCompany[], params: LeadFilterParams): LeadCompany[] {
  return companies.filter((c) => {
    if (params.search) {
      const q = params.search.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q) || (c.nameAr && c.nameAr.toLowerCase().includes(q));
      const matchCity = c.city.toLowerCase().includes(q);
      const matchInd = c.industry.toLowerCase().includes(q);
      const matchDesc = c.description.toLowerCase().includes(q);
      const matchTags = c.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchName && !matchCity && !matchInd && !matchDesc && !matchTags) return false;
    }

    if (params.industry && params.industry !== "all") {
      if (!c.industry.toLowerCase().includes(params.industry.toLowerCase())) return false;
    }

    if (params.city && params.city !== "all") {
      if (c.city.toLowerCase() !== params.city.toLowerCase()) return false;
    }

    if (params.country && params.country !== "all") {
      if (c.country.toLowerCase() !== params.country.toLowerCase()) return false;
    }

    if (params.minEmployees && c.employeeCount < params.minEmployees) return false;
    if (params.maxEmployees && c.employeeCount > params.maxEmployees) return false;
    if (params.minRating && c.rating < params.minRating) return false;

    if (params.hasWebsite && !c.website) return false;
    if (params.hasPhone && !c.phone) return false;
    if (params.hasEmail && !c.email) return false;

    if (params.missingSsl && c.webAudit && c.webAudit.hasSsl) return false;
    if (params.missingBooking && c.webAudit && c.webAudit.hasOnlineBooking) return false;
    if (params.hasWhatsapp && c.socialLinks && !c.socialLinks.whatsapp) return false;

    return true;
  });
}

// AI Enrichment simulator and API bridge
export async function enrichCompanyWithAi(company: LeadCompany): Promise<AiCompanyEnrichment> {
  // Simulate AI deep research & synthesis
  const qualityScore = company.webAudit ? Math.round((company.webAudit.pageSpeedScore + company.webAudit.seoScore) / 2) : 65;
  const presenceScore = Math.min(100, Math.round((company.rating * 15) + (company.socialLinks?.whatsapp ? 15 : 0) + (company.website ? 10 : 0)));

  return {
    companySummary: `${company.name} is an influential ${company.industry} entity located in ${company.city}, ${company.country}. Operations focus on ${company.category} with an estimated workforce of ${company.employeeCount} professionals.`,
    industryClassification: `${company.industry} / ${company.category}`,
    servicesOffered: [
      `Turnkey ${company.category} Solutions`,
      `Commercial ${company.industry} Advisory`,
      "Regulatory & Local Compliance",
      "Custom Enterprise Service Agreements",
    ],
    products: [`${company.industry} Package`, "B2B Retainer Plans"],
    targetCustomers: ["Government & SME Corporations in GCC", "High-Growth Commercial Ventures"],
    suggestedSalesPitch: `Highlight how Madarij OS unified ERP automation, ZATCA Phase 2 E-Invoicing, and WPS Payroll eliminate administrative bottlenecks for ${company.name}'s team of ${company.employeeCount} staff in ${company.city}.`,
    estimatedBusinessType: company.employeeCount > 50 ? "Corporate Enterprise" : "High-Growth SME",
    potentialNeeds: [
      "Automated E-Invoicing & ZATCA Compliance",
      "WPS Payroll & SIF File Processing",
      "Digital Client Contracts & High-DPI E-Signatures",
      "Omnichannel WhatsApp CRM & Lead Management",
    ],
    websiteQualityScore: qualityScore,
    digitalPresenceScore: presenceScore,
    generatedAt: new Date().toISOString(),
  };
}

// Calculate dynamic lead score (0 - 100)
export function calculateLeadScore(company: LeadCompany, contact?: LeadContact): number {
  let score = 40; // baseline

  // Company size score
  if (company.employeeCount >= 100) score += 20;
  else if (company.employeeCount >= 30) score += 15;
  else if (company.employeeCount >= 10) score += 10;

  // Rating score
  if (company.rating >= 4.5) score += 10;

  // Web audit gaps (gaps mean higher sales opportunity for agency/SaaS)
  if (company.webAudit) {
    if (!company.webAudit.hasSsl) score += 15; // huge pitch angle
    if (!company.webAudit.hasOnlineBooking) score += 10;
    if (!company.webAudit.hasWhatsappButton) score += 5;
    if (company.webAudit.pageSpeedScore < 60) score += 5;
  }

  // Contact seniority
  if (contact) {
    const pos = contact.position.toLowerCase();
    if (pos.includes("ceo") || pos.includes("owner") || pos.includes("cfo") || pos.includes("founder") || pos.includes("director")) {
      score += 15;
    }
  }

  return Math.min(100, score);
}

// Firebase Firestore persistence helper
export async function syncLeadToFirestore(userId: string, company: LeadCompany, contact?: LeadContact): Promise<void> {
  try {
    const compRef = doc(db, "lead_companies", company.id);
    await setDoc(compRef, { ...company, userId, updatedAt: new Date().toISOString() }, { merge: true });

    if (contact) {
      const cntRef = doc(db, "lead_contacts", contact.id);
      await setDoc(cntRef, { ...contact, userId, companyId: company.id, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    console.warn("Firestore lead sync warning (offline/permission fallback):", err);
  }
}
