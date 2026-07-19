import { auth } from "@/src/lib/firebase";

export interface BusinessEntity {
  id: string;
  name: string;
  domain?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  categoryTags?: string;
  sourceConnector: string;
  status: string;
  reviewCount: number;
  ratingAverage: number;
  discoveryTimestamp: string;
  collectionId: string;
  createdAt: string;

  // Scoring Details
  leadScore: number; // 0-100
  confidenceScore: number; // 0-100
  scoreReasons?: string[];
  suggestedActions?: string[];

  // Rich metadata
  estimatedARR?: string;
  employeeHeadcount?: string;
  technologiesUsed?: string;
  contacts?: Array<{
    name: string;
    title: string;
    email: string;
    phone?: string;
    social?: string;
  }>;
  aiAnalysis?: {
    industryClassification: string;
    customerSentiment: string;
    riskRating: string;
    salesHooks: string[];
  };

  // Associated generated CRM keys
  crmLeadId?: string;
  quotationId?: string;
  invoiceId?: string;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

// Helper to execute authenticated requests
async function request(url: string, options: RequestInit = {}) {
  await auth.authStateReady();
  const token = await auth.currentUser?.getIdToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(errorBody || `API Error: ${res.statusText}`);
  }
  return res.json();
}

export const leadsIntelligenceService = {
  // Search and discover profiles
  async search(params: {
    q?: string;
    location?: string;
    status?: string;
    score?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    collectionId?: string;
  }) {
    const query = new URLSearchParams();
    if (params.q) query.set("q", params.q);
    if (params.location) query.set("location", params.location);
    if (params.status) query.set("status", params.status);
    if (params.score) query.set("score", params.score);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.collectionId) query.set("collectionId", params.collectionId);

    return request(`/api/leads-intelligence/search?${query.toString()}`);
  },

  // Discover/register a new lead profile (Extension Simulation)
  async discover(entity: Partial<BusinessEntity>) {
    return request("/api/leads-intelligence/save", {
      method: "POST",
      body: JSON.stringify(entity),
    });
  },

  // Trigger Gemini enrichment on a profile
  async enrich(id: string) {
    return request(`/api/leads-intelligence/enrich/${id}`, {
      method: "POST",
    });
  },

  // Bulk enrich profiles
  async bulkEnrich(ids: string[]) {
    return request("/api/leads-intelligence/bulk-enrich", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  // Promote lead across the normalized pipeline stages
  async promote(id: string, nextStatus: string) {
    return request(`/api/leads-intelligence/promote/${id}`, {
      method: "POST",
      body: JSON.stringify({ nextStatus }),
    });
  },

  // Get collections list
  async getCollections(): Promise<Collection[]> {
    return request("/api/leads-intelligence/collections");
  },

  // Create a new lead discovery collection
  async createCollection(name: string, description = ""): Promise<Collection> {
    return request("/api/leads-intelligence/collections", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
  },
};
