import { collection, addDoc } from "firebase/firestore";
import { db } from "@/src/lib/firebase";

export interface LandingTrackEvent {
  id: string;
  eventName: string;
  category: "CTA" | "DEMO_VIDEO" | "INTEGRATION" | "PRICING" | "AI_INTERACTION" | "CALCULATOR" | "FAQ";
  timestamp: string;
  metadata?: Record<string, any>;
}

// 20% of interaction types that drive 80% of enterprise value / conversions
export const HIGH_INTENT_CATEGORIES = {
  CTA_START_FREE: "CTA - Start Free Journey",
  DEMO_PLAYBACK: "Demo Video Playback Interaction",
  PARTNER_INTEGRATION: "Partner Integration Discovery",
  PRICING_SELECTION: "Pricing Subscription Intent",
  AI_CONVERSATION: "AI Consultation Consultation Initiated",
  ROI_CALCULATOR_CTA: "ROI Savings Calculator Interaction",
  MODULE_TAB_CLICK: "Module Interactive Exploration",
  FAQ_TOGGLE: "FAQ Deep Inquiry Toggle",
  MIGRATION_CTA: "System Migration Request",
  FINAL_CTA_CLICK: "Final Conversion Action",
};

export const trackLandingEvent = async (
  eventName: string,
  category: keyof typeof HIGH_INTENT_CATEGORIES,
  metadata?: Record<string, any>
) => {
  const newEvent: LandingTrackEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    eventName,
    category: getCategoryKey(category),
    timestamp: new Date().toISOString(),
    metadata: {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screenResolution: `${window.innerWidth}x${window.innerHeight}`,
      locale: "GCC-ar",
      ...metadata,
    },
  };

  // 1. Save to LocalStorage for instant real-time visualization on the frontend
  try {
    const existing = localStorage.getItem("mudarij_landing_events");
    const events: LandingTrackEvent[] = existing ? JSON.parse(existing) : [];
    // Keep max 50 recent events
    events.unshift(newEvent);
    localStorage.setItem("mudarij_landing_events", JSON.stringify(events.slice(0, 50)));

    // Dispatch custom event so our UI widgets can listen and update instantly!
    window.dispatchEvent(new CustomEvent("mudarij_tracking_update", { detail: newEvent }));
  } catch (e) {
    console.error("Local storage event tracking failed:", e);
  }

  // 2. Safely push to Firebase Firestore so admins/analysts see the aggregated leads/interactions
  try {
    await addDoc(collection(db, "high_intent_events"), {
      ...newEvent,
      processed: true,
      region: "GCC-KSA",
    });
  } catch (firebaseErr) {
    // Fail silently in development/disconnected environments to guarantee zero-crash robustness
    console.warn("Firestore high-intent event storage failed (non-blocking):", firebaseErr);
  }
};

const getCategoryKey = (category: keyof typeof HIGH_INTENT_CATEGORIES) => {
  switch (category) {
    case "CTA_START_FREE":
    case "FINAL_CTA_CLICK":
    case "MIGRATION_CTA":
      return "CTA";
    case "DEMO_PLAYBACK":
      return "DEMO_VIDEO";
    case "PARTNER_INTEGRATION":
    case "MODULE_TAB_CLICK":
      return "INTEGRATION";
    case "PRICING_SELECTION":
      return "PRICING";
    case "AI_CONVERSATION":
      return "AI_INTERACTION";
    case "ROI_CALCULATOR_CTA":
      return "CALCULATOR";
    case "FAQ_TOGGLE":
      return "FAQ";
    default:
      return "CTA";
  }
};

export const getLandingEvents = (): LandingTrackEvent[] => {
  try {
    const existing = localStorage.getItem("mudarij_landing_events");
    return existing ? JSON.parse(existing) : [];
  } catch {
    return [];
  }
};

export const clearLandingEvents = () => {
  localStorage.removeItem("mudarij_landing_events");
  window.dispatchEvent(new CustomEvent("mudarij_tracking_update", { detail: null }));
};
