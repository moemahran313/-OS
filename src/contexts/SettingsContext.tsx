import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, getDocFromServer, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useUser } from "./UserContext";
import i18n from "../i18n";

export interface Settings {
  companyName: string;
  crNumber: string;
  email: string;
  managerName: string;
  avatar?: string;
  location: string;
  plan: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  emailNotif_newLeads: "immediately" | "daily" | "weekly" | "disabled";
  emailNotif_invoiceReminders: "immediately" | "daily" | "weekly" | "disabled";
  emailNotif_payrollSummaries: "weekly" | "monthly" | "disabled";
  pushNotifications: boolean;
  systemAlerts: boolean;
  wpsAlerts: boolean;
  contractEndReminder: boolean;
  contractReminderDays: number;
  theme: "light" | "dark" | "system";
  primaryColor: string;
  zapierWebhookNewLead?: string;
  zapierWebhookInvoicePaid?: string;
  slackWebhookUrl?: string;
  paypalClientId?: string;
  madaMerchantId?: string;
  madaTerminalId?: string;
  applePayMerchantId?: string;
  applePayCert?: string;
  sessionTimeout?: number;
  trustedIps?: string;
  notifyUnusualLoginEmail?: boolean;
  notifyUnusualLoginWhatsapp?: boolean;
  dataResidency?: "saudi_arabia" | "global";
  pdplComplianceMode?: boolean;
}

const defaultSettings: Settings = {
  companyName: "متجر الأمل",
  crNumber: "1010123456",
  email: "admin@store.sa",
  managerName: "أحمد محمد",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  location: "الرياض",
  plan: "خطة Pro",
  language: "ar",
  timezone: "Asia/Riyadh",
  emailNotifications: true,
  emailNotif_newLeads: "immediately",
  emailNotif_invoiceReminders: "daily",
  emailNotif_payrollSummaries: "weekly",
  pushNotifications: false,
  systemAlerts: true,
  wpsAlerts: true,
  contractEndReminder: true,
  contractReminderDays: 30,
  theme: "light",
  primaryColor: "#10b981", // emerald-500
  sessionTimeout: 60,
  trustedIps: "",
  notifyUnusualLoginEmail: true,
  notifyUnusualLoginWhatsapp: false,
  dataResidency: "saudi_arabia",
  pdplComplianceMode: true,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [userId, setUserId] = useState<string | null>(null);

  // Sync settings with user data from Prisma database
  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        companyName: user.companyName || prev.companyName,
        crNumber: user.crNumber || prev.crNumber,
        location: user.city || prev.location,
        managerName: user.name || prev.managerName,
        avatar: user.avatar || prev.avatar,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  useEffect(() => {
    // Try to load from localStorage initially for fast render
    try {
      const saved = localStorage.getItem("madarij_settings");
      if (saved) {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      }
    } catch (e) {
      console.error(e);
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
        try {
          const docRef = doc(db, "settings", user.uid);
          const docSnap = await getDocFromServer(docRef);
          if (docSnap.exists()) {
            const fbSettings = docSnap.data() as Settings;
            setSettings({ ...defaultSettings, ...fbSettings });
          }
        } catch (error: any) {
          if (error.message?.includes("insufficient permissions")) {
            console.warn("Settings document doesn't exist or permission denied. Creating default.");
            // Try to create it
            await setDoc(doc(db, "settings", user.uid), defaultSettings, { merge: true });
          } else {
            console.error("Failed to load settings from Firebase:", error);
          }
        }
      } else {
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("madarij_settings", JSON.stringify(settings));
    
    // Sync to Firebase if logged in
    if (userId) {
      const timer = setTimeout(() => {
        setDoc(doc(db, "settings", userId), settings, { merge: true })
          .catch((error) => console.error("Failed to save settings to Firebase:", error));
      }, 1000); // debounce
      return () => clearTimeout(timer);
    }
  }, [settings, userId]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  useEffect(() => {
    // Apply primary color to document
    document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    
    // Apply theme
    if (settings.theme === 'dark' || (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply language and direction
    if (settings.language) {
      i18n.changeLanguage(settings.language);
      document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = settings.language;
    }
  }, [settings.theme, settings.primaryColor, settings.language]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
