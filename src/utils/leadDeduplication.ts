import { LeadCompany, LeadContact } from "@/src/types/leadGen";

export interface DuplicateMatchReason {
  type: "email" | "linkedin" | "name" | "crNumber" | "phone";
  value: string;
  matchedWith: string; // Existing entity name or email
  entityType: "company" | "contact";
}

export interface DeduplicationCheckResult {
  incomingIndex: number;
  company: LeadCompany;
  isDuplicate: boolean;
  reasons: DuplicateMatchReason[];
}

export interface DeduplicationSummary {
  totalProcessed: number;
  uniqueLeads: LeadCompany[];
  duplicateLeads: DeduplicationCheckResult[];
  duplicateEmailCount: number;
  duplicateLinkedInCount: number;
}

/**
 * Normalizes email address for consistent comparison
 */
export function normalizeEmail(email?: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Normalizes LinkedIn profile or company URL for comparison
 * e.g., "https://www.linkedin.com/in/moe-mahran/" -> "moe-mahran"
 * e.g., "linkedin.com/company/aramco/" -> "aramco"
 */
export function normalizeLinkedIn(url?: string): string {
  if (!url) return "";
  let clean = url.trim().toLowerCase();
  clean = clean.replace(/^https?:\/\/(www\.)?linkedin\.com\/(in|company)\//, "");
  clean = clean.replace(/\/$/, "");
  return clean;
}

/**
 * Utility function to detect duplicate email addresses or LinkedIn profiles
 * before saving new leads to the database.
 */
export function detectDuplicateLeads(
  incomingCompanies: LeadCompany[],
  existingCompanies: LeadCompany[],
  existingContacts: LeadContact[] = []
): DeduplicationSummary {
  // Build lookup sets from existing database records
  const existingEmailMap = new Map<string, string>(); // email -> company or contact name
  const existingLinkedInMap = new Map<string, string>(); // linkedin -> company or contact name
  const existingCrMap = new Map<string, string>(); // crNumber -> company name
  const existingNameMap = new Map<string, string>(); // company name -> company name

  // Populate from existing companies
  existingCompanies.forEach((comp) => {
    if (comp.email) {
      existingEmailMap.set(normalizeEmail(comp.email), comp.nameAr || comp.name);
    }
    if (comp.socialLinks?.linkedin) {
      existingLinkedInMap.set(normalizeLinkedIn(comp.socialLinks.linkedin), comp.nameAr || comp.name);
    }
    if (comp.crNumber) {
      existingCrMap.set(comp.crNumber.trim(), comp.nameAr || comp.name);
    }
    if (comp.name) {
      existingNameMap.set(comp.name.trim().toLowerCase(), comp.nameAr || comp.name);
    }
    if (comp.nameAr) {
      existingNameMap.set(comp.nameAr.trim().toLowerCase(), comp.nameAr || comp.name);
    }
  });

  // Populate from existing contacts
  existingContacts.forEach((contact) => {
    if (contact.email) {
      existingEmailMap.set(normalizeEmail(contact.email), `${contact.firstName} ${contact.lastName} (${contact.companyName})`);
    }
    if (contact.linkedin) {
      existingLinkedInMap.set(normalizeLinkedIn(contact.linkedin), `${contact.firstName} ${contact.lastName} (${contact.companyName})`);
    }
  });

  const uniqueLeads: LeadCompany[] = [];
  const duplicateLeads: DeduplicationCheckResult[] = [];
  let dupEmailCount = 0;
  let dupLinkedInCount = 0;

  // Track incoming leads internally to catch duplicates within the incoming payload itself
  const internalEmailSeen = new Map<string, string>();
  const internalLinkedInSeen = new Map<string, string>();

  incomingCompanies.forEach((incoming, idx) => {
    const reasons: DuplicateMatchReason[] = [];

    const normEmail = normalizeEmail(incoming.email);
    const normLinkedIn = normalizeLinkedIn(incoming.socialLinks?.linkedin);
    const normCr = incoming.crNumber ? incoming.crNumber.trim() : "";
    const normName = incoming.name ? incoming.name.trim().toLowerCase() : "";

    // 1. Check Duplicate Email
    if (normEmail) {
      if (existingEmailMap.has(normEmail)) {
        reasons.push({
          type: "email",
          value: incoming.email,
          matchedWith: existingEmailMap.get(normEmail)!,
          entityType: "company",
        });
        dupEmailCount++;
      } else if (internalEmailSeen.has(normEmail)) {
        reasons.push({
          type: "email",
          value: incoming.email,
          matchedWith: `Lead #${internalEmailSeen.get(normEmail)} in batch`,
          entityType: "company",
        });
        dupEmailCount++;
      }
    }

    // 2. Check Duplicate LinkedIn Profile / Company Page
    if (normLinkedIn) {
      if (existingLinkedInMap.has(normLinkedIn)) {
        reasons.push({
          type: "linkedin",
          value: incoming.socialLinks?.linkedin || normLinkedIn,
          matchedWith: existingLinkedInMap.get(normLinkedIn)!,
          entityType: "company",
        });
        dupLinkedInCount++;
      } else if (internalLinkedInSeen.has(normLinkedIn)) {
        reasons.push({
          type: "linkedin",
          value: incoming.socialLinks?.linkedin || normLinkedIn,
          matchedWith: `Lead #${internalLinkedInSeen.get(normLinkedIn)} in batch`,
          entityType: "company",
        });
        dupLinkedInCount++;
      }
    }

    // 3. Check Duplicate CR Number
    if (normCr && existingCrMap.has(normCr)) {
      reasons.push({
        type: "crNumber",
        value: normCr,
        matchedWith: existingCrMap.get(normCr)!,
        entityType: "company",
      });
    }

    // 4. Check Exact Name Match if no email
    if (!normEmail && !normLinkedIn && normName && existingNameMap.has(normName)) {
      reasons.push({
        type: "name",
        value: incoming.name,
        matchedWith: existingNameMap.get(normName)!,
        entityType: "company",
      });
    }

    if (reasons.length > 0) {
      duplicateLeads.push({
        incomingIndex: idx,
        company: incoming,
        isDuplicate: true,
        reasons,
      });
    } else {
      uniqueLeads.push(incoming);
      if (normEmail) internalEmailSeen.set(normEmail, `${idx + 1}`);
      if (normLinkedIn) internalLinkedInSeen.set(normLinkedIn, `${idx + 1}`);
    }
  });

  return {
    totalProcessed: incomingCompanies.length,
    uniqueLeads,
    duplicateLeads,
    duplicateEmailCount: dupEmailCount,
    duplicateLinkedInCount: dupLinkedInCount,
  };
}
