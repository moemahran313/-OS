export interface LineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPriceHalalas: number; // Stored in Halalas (integer)
  taxRate: number; // e.g., 15 for 15%
  totalHalalas: number;
  customFields?: { key: string; value: string }[];
  costCenter?: string; // ID of the cost center
}

export interface InvoiceBranding {
  logo?: string;
  primaryColor: string;
  template: "modern" | "classic" | "minimal";
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
  type: "credit" | "debit";
  number: string;
  amountHalalas: number;
  reason: string;
  timestamp: string;
  createdBy: string;
}

export interface Invoice {
  id: string;
  userId: string; // Ownership
  type: "standard" | "simplified" | "credit_note" | "debit_note";
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
  status: "draft" | "sent" | "viewed" | "partially paid" | "paid" | "overdue" | "cancelled";
  paymentLink?: string;
  paymentTerms?: string;
  notes?: string;
  billingEmail?: string;
  lateFee?: {
    type: "fixed" | "percentage";
    valueHalalas: number; // or percentage value * 100
    overdueDays: number;
  };
  numberFormat?: string;
  sectionOrder?: string[];
  statusConfig?: Record<string, { label: string; color: string }>;
  zatcaConfig?: {
    sellerVat: string;
    sellerName: string;
    buyerVat: string;
    isPhasedTwo: boolean;
    certificate?: string;
    prevHash?: string;
  };
  zatcaData?: any;
  branding: InvoiceBranding;
  logs: { action: string; timestamp: string; note?: string; user?: string; data?: any }[];
  auditTrail?: AuditEntry[];
  corrections?: CorrectionNote[];
  version: number;
  isLocked: boolean;
  recurringConfig?: {
    active: boolean;
    frequency: "weekly" | "monthly" | "yearly";
    communicationFrequency: "invoice_only" | "auto_reminders";
    nextRunDate: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
  createdAt: string;
  nafathVerified?: boolean;
  verifiedAt?: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  company: string;
  status: "new" | "contacted" | "won" | "lost";
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
  status?: "valid" | "expired" | "expiring_soon";
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  department?: string;
  nationality?: string;
  iqamaExpiry?: string;
  wpsStatus: "compliant" | "delayed" | "violation";
  baseSalaryHalalas: number;
  housingAllowanceHalalas: number;
  transportAllowanceHalalas: number;
  otherDeductionsHalalas: number;
  contractStartDate?: string;
  contractEndDate?: string;
  documents?: WorkerDoc[];
  status: "active" | "inactive" | "terminated";
  joinedDate: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isAi?: boolean;
}

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  type: "Project" | "Branch" | "Department" | "Other";
  parentId: string | null;
  userId: string;
  createdAt: string;
}

export interface FixedAsset {
  id: string;
  userId: string;
  name: string;
  assetCode: string; // e.g. AST001
  purchaseDate: string; // ISO date
  historicalValueHalalas: number;
  depreciationRate: number; // e.g., 10 for 10%
  depreciationMethod: "straight_line" | "diminishing_balance";
  accumulatedDepreciationHalalas: number;
  currentBookValueHalalas: number;
  status: "active" | "disposed";
  createdAt: string;
  lastDepreciationDate?: string; // date of last calculated depreciation
}

export interface Voucher {
  id: string;
  userId: string;
  number: string; // e.g. V-001
  type: "receipt" | "payment";
  date: string; // ISO Date YYYY-MM-DD
  amount: number; // Foreign or local amount
  currency: string; // e.g. USD, EUR, AED, SAR
  exchangeRate: number; // 1 for SAR
  amountSar: number; // amount * exchangeRate
  accountFromId: string; // debit account ID
  accountToId: string; // credit account ID
  descriptionAr: string;
  descriptionEn: string;
  status: "posted" | "draft";
  createdAt: string;
}

export interface BankTransaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number; // positive for receipt, negative for payment
  isReconciled: boolean;
  reconciledWithId?: string; // ID of the voucher or journal entry
}
