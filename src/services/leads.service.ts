import { auth } from "@/src/lib/firebase";

export interface LandingPage {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  status: "Published" | "Draft";
  views: number;
  conversions: number;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  sections: Array<{
    id: string;
    type: "hero" | "features" | "stats" | "testimonials" | "cta";
    content: Record<string, any>;
  }>;
}

export interface LeadForm {
  id: string;
  name: string;
  steps: Array<{
    stepTitle: string;
    fields: Array<{
      id: string;
      label: string;
      type: "text" | "email" | "select" | "file" | "signature" | "tel";
      required: boolean;
      placeholder?: string;
      options?: string[];
    }>;
  }>;
  views: number;
  conversions: number;
}

export interface Popup {
  id: string;
  name: string;
  type: "newsletter" | "discount" | "welcome" | "survey";
  triggerType: "exit-intent" | "scroll" | "timer";
  triggerValue: string;
  title: string;
  description: string;
  ctaText: string;
  status: "Active" | "Inactive";
  views: number;
  conversions: number;
}

export interface Submission {
  id: string;
  formId?: string | null;
  popupId?: string | null;
  chatbotId?: string | null;
  data: Record<string, any>;
  source: string;
  device: string;
  country: string;
  status: string;
  score: "Hot" | "Warm" | "Cold";
  createdAt: string;
  enrichedData?: {
    companyName: string;
    domain: string;
    size: string;
    revenue: string;
    industry: string;
    technologiesUsed: string;
  };
  qualification?: {
    score: "Hot" | "Warm" | "Cold";
    qualificationExplanation: string;
    conversionProbability: number;
    recommendedFollowUp: string;
    assignedSalesRep: string;
  };
}

export interface ChatbotConfig {
  name: string;
  greeting: string;
  systemPrompt: string;
  capturedFields: string[];
  enabled: boolean;
}

// Helper to make authenticated requests
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
    throw new Error(`API Error: ${res.statusText}`);
  }
  return res.json();
}

export const leadsService = {
  // Fetch everything in parallel
  async fetchAllData() {
    await auth.authStateReady();
    const token = await auth.currentUser?.getIdToken();
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const [pages, forms, popups, chatbots, submissions] = await Promise.all([
      fetch("/api/lead-gen/landing-pages", { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/lead-gen/forms", { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/lead-gen/popups", { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/lead-gen/chatbots", { headers }).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/lead-gen/submissions", { headers }).then((r) => (r.ok ? r.json() : [])),
    ]);

    return { pages, forms, popups, chatbots, submissions };
  },

  // Landing pages
  async generateLandingPageAI(input: any) {
    return request("/api/lead-gen/landing-pages/generate-ai", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async createLandingPage(page: Partial<LandingPage>) {
    return request("/api/lead-gen/landing-pages", {
      method: "POST",
      body: JSON.stringify(page),
    });
  },

  async updateLandingPage(id: string, page: Partial<LandingPage>) {
    return request(`/api/lead-gen/landing-pages/${id}`, {
      method: "PUT",
      body: JSON.stringify(page),
    });
  },

  async deleteLandingPage(id: string) {
    return request(`/api/lead-gen/landing-pages/${id}`, {
      method: "DELETE",
    });
  },

  // Forms
  async generateFormAI(input: any) {
    return request("/api/lead-gen/forms/generate-ai", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async createForm(form: Partial<LeadForm>) {
    return request("/api/lead-gen/forms", {
      method: "POST",
      body: JSON.stringify(form),
    });
  },

  async updateForm(id: string, form: Partial<LeadForm>) {
    return request(`/api/lead-gen/forms/${id}`, {
      method: "PUT",
      body: JSON.stringify(form),
    });
  },

  async deleteForm(id: string) {
    return request(`/api/lead-gen/forms/${id}`, {
      method: "DELETE",
    });
  },

  // Popups
  async createPopup(popup: Partial<Popup>) {
    return request("/api/lead-gen/popups", {
      method: "POST",
      body: JSON.stringify(popup),
    });
  },

  async updatePopup(id: string, popup: Partial<Popup>) {
    return request(`/api/lead-gen/popups/${id}`, {
      method: "PUT",
      body: JSON.stringify(popup),
    });
  },

  async deletePopup(id: string) {
    return request(`/api/lead-gen/popups/${id}`, {
      method: "DELETE",
    });
  },

  // Chatbot
  async saveChatbotConfig(config: ChatbotConfig) {
    return request("/api/lead-gen/chatbots", {
      method: "POST",
      body: JSON.stringify(config),
    });
  },

  async sendChatMessage(messages: any[], systemPrompt: string, capturedFields: string[]) {
    return request("/api/lead-gen/chatbots/message", {
      method: "POST",
      body: JSON.stringify({ messages, systemPrompt, capturedFields }),
    });
  },

  // Submissions
  async fetchSubmissions() {
    return request("/api/lead-gen/submissions");
  },

  async createSubmission(payload: any) {
    return request("/api/lead-gen/submissions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async analyzeSubmission(id: string) {
    return request(`/api/lead-gen/submissions/${id}/analyze`, {
      method: "POST",
    });
  },
};
