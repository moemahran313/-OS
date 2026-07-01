import React, { createContext, useContext, useState, useEffect } from "react";

import {
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as updateAuthProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { toast } from "react-toastify";

export interface User {
  id: string;
  uid?: string; // added alias for compatibility
  name: string;
  email: string;
  role: "Administrator" | "Manager" | "Employee";
  avatar?: string | null;
  organizations?: string[];
  activeOrganizationId?: string;
  activeCompanyId?: string;
  activeBranchId?: string;
  companyName?: string;
  crNumber?: string;
  city?: string;
  dashboardConfig?: any[];
  invoiceRemindersConfig?: any;
  quickActionsConfig?: string[];
  verifiedAt?: string;
  nafathVerified?: boolean;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: (referredBy?: string) => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
    avatar?: string,
    referredBy?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasPermission: (module: string) => boolean;
  loginDemoOffline: () => void;
  refreshUser: () => Promise<void>;
  currentSessionId: string | null;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Helper to execute a promise with a fast timeout to prevent Firestore hanging on unreachable backends
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 1000): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Timeout"));
    }, timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

// User Agent Parser
const parseUserAgent = () => {
  const ua = navigator.userAgent;
  let browser = "Other Browser";
  let os = "Other OS";

  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows PC";
  else if (ua.includes("Macintosh")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux PC";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS Device";
  else if (ua.includes("Android")) os = "Android Device";

  return { browser, os, deviceName: `${os} (${browser})` };
};

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const cached = localStorage.getItem("mudarij_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(() => {
    return sessionStorage.getItem("mudarij_session_id");
  });

  const setUserAndCache = (val: User | null | ((prev: User | null) => User | null)) => {
    setUser((prev) => {
      const updated = typeof val === "function" ? val(prev) : val;
      try {
        if (updated) {
          localStorage.setItem("mudarij_user", JSON.stringify(updated));
        } else {
          localStorage.removeItem("mudarij_user");
        }
      } catch (err) {
        console.warn("Failed to save user to localStorage:", err);
      }
      return updated;
    });
  };

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set token cookie for server-side auth
        const token = await firebaseUser.getIdToken();
        document.cookie = `mudarij_token=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=None; Secure`;
        // Clear old local token if it exists
        localStorage.removeItem("auth_token");
        await syncUser(firebaseUser);
        await registerActiveSession(firebaseUser.uid);
      } else {
        document.cookie = "mudarij_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUserAndCache(null);
        setLoading(false);
        setCurrentSessionId(null);
        sessionStorage.removeItem("mudarij_session_id");
      }
    });

    return () => unsubscribe();
  }, []);

  // Real-time Session listener for immediate revocation
  useEffect(() => {
    if (!currentSessionId || !user) return;

    const sessionDocRef = doc(db, "user_sessions", currentSessionId);
    const unsubSession = onSnapshot(sessionDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === "Revoked") {
          toast.warn("تم إنهاء جلستك الحالية بطلب من الإدارة أو من جهاز آخر.");
          logout();
        }
      } else if (user.id !== "demo-admin-uid") {
        // Session document was deleted
        toast.warn("انتهت صلاحية الجلسة الحالية. يرجى تسجيل الدخول مجدداً.");
        logout();
      }
    });

    return () => unsubSession();
  }, [currentSessionId, user]);

  const registerActiveSession = async (userId: string) => {
    // If we already have a session registered in this tab, skip
    if (sessionStorage.getItem("mudarij_session_id")) return;

    try {
      const { browser, os, deviceName } = parseUserAgent();

      // Determine approximate location based on timezone
      let loc = "الرياض، السعودية";
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Dubai")) loc = "دبي، الإمارات";
      else if (tz.includes("Kuwait")) loc = "الكويت";

      const sessionData = {
        userId,
        deviceName,
        browser,
        os,
        ipAddress: "192.168.1.1", // fallback/mock local client IP
        location: loc,
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        status: "Active",
        userAgent: navigator.userAgent,
      };

      const sessionCollection = collection(db, "user_sessions");
      const docRef = await addDoc(sessionCollection, sessionData);

      // Save ID to session storage
      sessionStorage.setItem("mudarij_session_id", docRef.id);
      setCurrentSessionId(docRef.id);

      // Log Security Audit Event
      await addDoc(collection(db, "audit_logs"), {
        userId,
        module: "AUTHENTICATION",
        action: "UserLoggedIn",
        payload: JSON.stringify({ deviceName, browser, os }),
        result: "Success",
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Could not register session in Firestore:", err);
    }
  };

  const syncUser = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await withTimeout(getDoc(userDocRef), 15000);

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserAndCache({ ...data, id: firebaseUser.uid, uid: firebaseUser.uid } as User);
      } else {
        // Create initial user profile
        const newUser: User = {
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role: "Administrator", // Default role
          avatar: firebaseUser.photoURL || null,
        };
        try {
          await withTimeout(
            setDoc(userDocRef, {
              ...newUser,
              uid: firebaseUser.uid,
              createdAt: serverTimestamp(),
            }),
            15000
          );
        } catch (writeErr) {
          console.warn("Could not write initial profile to Firestore:", writeErr);
        }
        setUserAndCache({ ...newUser, uid: firebaseUser.uid });
      }
    } catch (e) {
      console.warn(
        "User sync failed (offline or permission issue), using fallback local profile:",
        e
      );
      // Construct a valid local fallback user in memory so the application does not break
      setUserAndCache(
        (prev) =>
          prev ||
          ({
            id: firebaseUser.uid,
            uid: firebaseUser.uid,
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || "Administrator",
            role: "Administrator",
            avatar: firebaseUser.photoURL || null,
          } as User)
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await syncUser(auth.currentUser);
    }
  };

  const loginWithGoogle = async (referredBy?: string) => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      try {
        const userDocRef = doc(db, "users", result.user.uid);
        const userDoc = await withTimeout(getDoc(userDocRef), 15000);
        if (!userDoc.exists()) {
          await withTimeout(
            setDoc(
              userDocRef,
              {
                email: result.user.email || "",
                role: "Administrator",
                name: result.user.displayName || "",
                avatar: result.user.photoURL || null,
                referredBy: referredBy || null,
              },
              { merge: true }
            ),
            15000
          );
        }
      } catch (dbErr) {
        console.warn("Could not save Google user record to Firestore:", dbErr);
      }

      return true;
    } catch (e) {
      console.error("Google Login failed", e);
      setLoading(false);
      return false;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (e) {
      console.error("Email Login failed", e);
      setLoading(false);
      throw e;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    avatar?: string,
    referredBy?: string
  ) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);

      if (name || avatar) {
        try {
          await updateAuthProfile(userCredential.user, {
            displayName: name || null,
            photoURL: avatar || null,
          });
        } catch (profileErr) {
          console.warn("Could not update auth profile", profileErr);
        }
      }

      // Update the user document explicitly since syncUser might have written an empty name/avatar
      // if it fired before updateAuthProfile completed.
      try {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        await withTimeout(
          setDoc(
            userDocRef,
            {
              email: userCredential.user.email || "",
              role: "Administrator",
              name: name || "",
              avatar: avatar || null,
              referredBy: referredBy || null,
            },
            { merge: true }
          ),
          15000
        );
      } catch (dbErr) {
        console.warn(
          "Could not write user record to Firestore, proceeding with client sign-up:",
          dbErr
        );
      }

      return true;
    } catch (e) {
      console.error("Email Register failed", e);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    try {
      const activeSessId = sessionStorage.getItem("mudarij_session_id");
      if (activeSessId && user && user.id !== "demo-admin-uid") {
        try {
          // Update status of session to terminated
          const sessionDocRef = doc(db, "user_sessions", activeSessId);
          await updateDoc(sessionDocRef, {
            status: "LoggedOut",
            lastActivity: new Date().toISOString(),
          });

          // Log security event
          await addDoc(collection(db, "audit_logs"), {
            userId: user.id,
            module: "AUTHENTICATION",
            action: "UserLoggedOut",
            payload: JSON.stringify({ sessionId: activeSessId }),
            result: "Success",
            timestamp: new Date().toISOString(),
          });
        } catch (sessErr) {
          console.warn("Session clean up failed:", sessErr);
        }
      }

      await signOut(auth);
      setUserAndCache(null);
      setCurrentSessionId(null);
      sessionStorage.removeItem("mudarij_session_id");

      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Refresh browser to login page
      window.location.href = "/login";
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    // Remove undefined fields
    const cleanUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined)
    );

    try {
      const userDocRef = doc(db, "users", user.id);
      await withTimeout(
        setDoc(userDocRef, { ...cleanUpdates, updatedAt: serverTimestamp() }, { merge: true }),
        15000
      );
      setUserAndCache((prev) =>
        prev ? { ...prev, ...cleanUpdates, id: prev.id, uid: prev.uid || prev.id } : null
      );
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (e) {
      console.warn("Profile update failed on backend (offline/unreachable), updating locally:", e);
      setUserAndCache((prev) =>
        prev ? { ...prev, ...cleanUpdates, id: prev.id, uid: prev.uid || prev.id } : null
      );
      toast.success("تم تحديث الملف الشخصي محلياً");
    }
  };

  const hasPermission = (module: string) => {
    if (!user) return false;
    if (user.role === "Administrator") return true;

    const permissions: Record<string, string[]> = {
      Manager: ["Dashboard", "CRM", "Invoices", "Analytics", "Settings", "Simulator", "Inventory"],
      Employee: ["Dashboard", "CRM", "Inventory"],
    };

    return permissions[user.role as keyof typeof permissions]?.includes(module) || false;
  };

  const loginDemoOffline = () => {
    const demoUser: User = {
      id: "demo-admin-uid",
      uid: "demo-admin-uid",
      name: "مدير النظام التجريبي",
      email: "demo@mudarij.com",
      role: "Administrator",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256",
    };
    setUserAndCache(demoUser);
    setLoading(false);
    toast.success("تم تسجيل الدخول بنمط العرض التجريبي المحلي");
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateProfile,
        hasPermission,
        loginDemoOffline,
        refreshUser,
        currentSessionId,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
