import { prisma } from "./prisma.ts";

export interface ScoringResult {
  leadScore: number;
  confidenceScore: number;
  scoreReasons: string[];
  suggestedActions: string[];
}

export class LeadScoringService {
  /**
   * Calculates overall score (0-100), confidence level, and suggested actions.
   * @param data Business profile data
   */
  public static calculateScore(data: {
    name: string;
    website?: string | null;
    phone?: string | null;
    address?: string | null;
    categoryTags?: string | null;
    contactsCount?: number;
  }): ScoringResult {
    let score = 20; // Base score
    const reasons: string[] = ["Base profile registered (+20 pts)."];
    const suggestedActions: string[] = [];

    // Profile Completeness
    if (data.phone) {
      score += 10;
      reasons.push("Verified telephone number registered (+10 pts).");
    } else {
      suggestedActions.push("Retrieve verified contact phone number.");
    }

    if (data.address) {
      score += 10;
      reasons.push("Verified geographic address registered (+10 pts).");
    } else {
      suggestedActions.push("Verify corporate address details.");
    }

    if (data.categoryTags) {
      score += 10;
      reasons.push("Business categories classified correctly (+10 pts).");
    }

    // Website Quality
    if (data.website) {
      score += 15;
      reasons.push("Active business website URL registered (+15 pts).");
      
      const isHttps = data.website.toLowerCase().startsWith("https://");
      if (isHttps) {
        score += 5;
        reasons.push("Secure SSL/HTTPS domain verified (+5 pts).");
      }
    } else {
      suggestedActions.push("Perform deep web footprint search for missing corporate domain.");
    }

    // Contact Availability
    const contactCount = data.contactsCount || 0;
    if (contactCount > 0) {
      score += 15;
      reasons.push(`Key executive contact available (+15 pts).`);
      if (contactCount >= 2) {
        score += 10;
        reasons.push(`Multiple decision makers mapped (+10 pts).`);
      }
    } else {
      suggestedActions.push("Trigger Gemini B2B Executive Crawler to identify key decision makers.");
    }

    // Industry Priority
    const tagsLower = String(data.categoryTags || "").toLowerCase();
    const highPrioritySectors = [
      "software", "tech", "saas", "consulting", "logistics", 
      "clinic", "hospital", "construction", "restaurant", "retail"
    ];
    
    let industryBoostMatched = false;
    for (const sector of highPrioritySectors) {
      if (tagsLower.includes(sector)) {
        score += 15;
        industryBoostMatched = true;
        reasons.push(`High priority growth industry sector matched: ${sector} (+15 pts).`);
        break;
      }
    }

    if (!industryBoostMatched) {
      suggestedActions.push("Verify if target operates in secondary high-growth sub-sectors.");
    }

    // Bound final score between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));

    // Confidence Level Assessment (0-100)
    let confidence = 40; // Base baseline
    if (data.website) confidence += 20;
    if (data.phone) confidence += 20;
    if (data.address) confidence += 20;
    const finalConfidence = Math.min(100, confidence);

    // Dynamic suggested next actions based on total score
    if (finalScore >= 75) {
      suggestedActions.push("Mark as Hot Prospect: Assign direct Account Executive for immediate outreach.");
    } else if (finalScore >= 40) {
      suggestedActions.push("Mark as Warm Prospect: Enroll in automated drip email campaigns and follow on LinkedIn.");
    } else {
      suggestedActions.push("Mark as Cold Prospect: Place in low-priority background nurture stream.");
    }

    return {
      leadScore: finalScore,
      confidenceScore: finalConfidence,
      scoreReasons: reasons,
      suggestedActions: suggestedActions,
    };
  }

  /**
   * Persists computed scoring details to an existing business record in Prisma.
   */
  public static async persistScore(businessId: string, result: ScoringResult): Promise<void> {
    await prisma.business.update({
      where: { id: businessId },
      data: {
        leadScore: result.leadScore,
        confidenceScore: result.confidenceScore,
        scoreReasons: JSON.stringify(result.scoreReasons),
        suggestedActions: JSON.stringify(result.suggestedActions),
      },
    });
  }
}
