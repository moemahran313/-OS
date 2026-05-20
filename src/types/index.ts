export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPriceHalalas: number; // Stored in Halalas (integer)
  taxRate: number; // e.g., 15 for 15%
  totalHalalas: number;
  customFields?: { key: string, value: string }[];
}

export interface InvoiceBranding {
  logo?: string;
  primaryColor: string;
  template: 'modern' | 'classic' | 'minimal';
  bilingual: boolean;
  language?: string;
  footerNotes?: string;
  customPaymentLink?: string;
}

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  changes?: { field: string; old: any; new: any }[];
  metadata?: any;
}

export interface CorrectionNote {
  id: string;
  type: 'credit' | 'debit';
  number: string;
  amountHalalas: number;
  reason: string;
  timestamp: string;
  createdBy: string;
}

export interface Invoice {
  id: string;
  userId: string; // Ownership
  number: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  lineItems: LineItem[];
  subtotalHalalas: number;
  vatAmountHalalas: number;
  totalAmountHalalas: number;
  paidAmountHalalas: number;
  remainingBalanceHalalas: number;
  status: 'draft' | 'sent' | 'viewed' | 'partially paid' | 'paid' | 'overdue' | 'cancelled';
  paymentLink?: string;
  paymentTerms?: string;
  notes?: string;
  billingEmail?: string;
  lateFee?: {
    type: 'fixed' | 'percentage';
    valueHalalas: number; // or percentage value * 100
    overdueDays: number;
  };
  numberFormat?: string;
  sectionOrder?: string[];
  statusConfig?: Record<string, { label: string, color: string }>;
  zatcaConfig?: {
    sellerVat: string;
    sellerName: string;
    buyerVat: string;
    isPhasedTwo: boolean;
    certificate?: string;
    prevHash?: string;
  };
  branding: InvoiceBranding;
  logs: { action: string; timestamp: string; note?: string; user?: string; data?: any }[];
  auditTrail?: AuditEntry[];
  corrections?: CorrectionNote[];
  version: number;
  isLocked: boolean;
  recurringConfig?: {
    active: boolean;
    frequency: 'weekly' | 'monthly' | 'yearly';
    communicationFrequency: 'invoice_only' | 'auto_reminders';
    nextRunDate: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company: string;
  status: 'new' | 'contacted' | 'won' | 'lost';
  value: number;
  createdAt: string;
  industry?: string;
  companySize?: string;
  expectedCloseDate?: string;
  contractEndDate?: string;
  projectCode?: string;
  order?: number;
  defaultLineItems?: Partial<LineItem>[];
}

export interface WorkerDoc {
  id: string;
  name: string;
  url: string;
  expiryDate: string; // ISO string
  type: string; // e.g. "Passport", "Visa", "Contract"
  status?: 'valid' | 'expired' | 'expiring_soon';
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department?: string;
  nationality?: string;
  iqamaExpiry?: string;
  wpsStatus: 'compliant' | 'delayed' | 'violation';
  baseSalaryHalalas: number;
  housingAllowanceHalalas: number;
  transportAllowanceHalalas: number;
  otherDeductionsHalalas: number;
  contractStartDate?: string;
  contractEndDate?: string;
  documents?: WorkerDoc[];
  status: 'active' | 'inactive' | 'terminated';
  joinedDate: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAi?: boolean;
}
