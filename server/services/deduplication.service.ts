import { prisma } from "./prisma.ts";

export interface NormalizationResult {
  normalizedName: string;
  normalizedUrl: string;
  normalizedAddress: string;
}

export class DeduplicationService {
  /**
   * Helper to normalize company names.
   * Lowercases, strips punctuation, and removes common corporate designators (EN/AR).
   */
  public static normalizeName(name: string): string {
    if (!name) return "";
    let clean = name.toLowerCase().trim();
    
    // Arabic corporate prefixes/suffixes
    const arSfx = ["شركة", "مؤسسة", "المحدودة", "ش.م.م", "للمقاولات", "للخدمات", "ش.م", "وشركاه"];
    arSfx.forEach(sfx => {
      clean = clean.replace(new RegExp(`(^|\\s)${sfx}(\\s|$)`, 'g'), " ");
    });

    // English corporate suffixes
    const enSfx = ["co", "ltd", "inc", "corp", "corporation", "company", "llc", "plc", "pvt", "limited"];
    enSfx.forEach(sfx => {
      clean = clean.replace(new RegExp(`\\b${sfx}\\b`, 'g'), " ");
    });

    // Remove punctuation & extra whitespace
    clean = clean.replace(new RegExp('[.,/#!$%^&*;:{}=\\-_`~()]', 'g'), "");
    clean = clean.replace(/\s{2,}/g, " ").trim();

    return clean;
  }

  /**
   * Helper to normalize URLs.
   * Strips protocol, www., paths, and queries, keeping only the bare hostname.
   */
  public static normalizeUrl(url: string): string {
    if (!url) return "";
    let clean = url.toLowerCase().trim();
    
    // Strip protocols
    clean = clean.replace(/^(https?:\/\/)?(www\.)?/, "");
    // Split paths/queries
    clean = clean.split("/")[0];
    clean = clean.split("?")[0];
    
    return clean;
  }

  /**
   * Helper to normalize physical addresses.
   * Strips details to isolate primary city or region indicators.
   */
  public static normalizeAddress(address: string): string {
    if (!address) return "";
    let clean = address.toLowerCase().trim();
    clean = clean.replace(new RegExp('[.,/#!$%^&*;:{}=\\-_`~()]', 'g'), " ");
    clean = clean.replace(/\s{2,}/g, " ").trim();
    return clean;
  }

  /**
   * Normalizes all properties of a lead.
   */
  public static normalizeEntity(name: string, url: string, address: string): NormalizationResult {
    return {
      normalizedName: this.normalizeName(name),
      normalizedUrl: this.normalizeUrl(url),
      normalizedAddress: this.normalizeAddress(address),
    };
  }

  /**
   * Scans the database for potential duplicate records.
   * Logs identified matches to DeduplicationAuditLog.
   * Returns potential matched entities.
   */
  public static async checkForDuplicates(businessId: string): Promise<any[]> {
    const target = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!target) return [];

    // Pre-calculate target normalized parameters if not populated
    const nName = target.normalizedName || this.normalizeName(target.name);
    const nUrl = target.normalizedUrl || this.normalizeUrl(target.website || "");
    const nAddr = target.normalizedAddress || this.normalizeAddress(target.address || "");

    // Ensure they are stored
    await prisma.business.update({
      where: { id: businessId },
      data: {
        normalizedName: nName,
        normalizedUrl: nUrl,
        normalizedAddress: nAddr,
      }
    });

    // Fetch other businesses to compare
    const others = await prisma.business.findMany({
      where: {
        id: { not: businessId }
      }
    });

    const identifiedMatches: any[] = [];

    for (const other of others) {
      const otherName = other.normalizedName || this.normalizeName(other.name);
      const otherUrl = other.normalizedUrl || this.normalizeUrl(other.website || "");
      const otherAddr = other.normalizedAddress || this.normalizeAddress(other.address || "");

      let confidenceScore = 0;
      const criteria: string[] = [];

      // 1. Exact URL match (very strong indicator)
      if (nUrl && otherUrl && nUrl === otherUrl) {
        confidenceScore += 70;
        criteria.push("Exact Domain Match");
      }

      // 2. Name Match
      if (nName && otherName) {
        if (nName === otherName) {
          confidenceScore += 60;
          criteria.push("Exact Normalized Name Match");
        } else if (nName.includes(otherName) || otherName.includes(nName)) {
          confidenceScore += 30;
          criteria.push("Partial Substring Name Match");
        }
      }

      // 3. Address city matching
      if (nAddr && otherAddr && nAddr === otherAddr) {
        confidenceScore += 10;
        criteria.push("Exact Address Match");
      }

      // Bound score to max 100
      const finalConfidence = Math.min(100, confidenceScore);

      // Flag matches with confidence greater than 30%
      if (finalConfidence >= 30) {
        const actionTaken = "Flagged as potential duplicate";
        
        // Log match to audit table
        await prisma.deduplicationAuditLog.create({
          data: {
            businessId: target.id,
            matchedId: other.id,
            confidenceScore: finalConfidence,
            matchCriteria: criteria.join(", "),
            actionTaken,
          }
        });

        identifiedMatches.push({
          entity: other,
          confidence: finalConfidence,
          criteria: criteria.join(", ")
        });
      }
    }

    return identifiedMatches;
  }
}
