import React, { createContext, useContext, useState, useEffect } from "react";

import { onIdTokenChanged, signInWithPopup, signOut, User as FirebaseUser, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDocFromServer, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db } from "../lib/firebase";
import { toast } from "sonner";

export interface User {
  id: string;
  uid?: string; // added alias for compatibility
  name: string;
  email: string;
  role: "Administrator" | "Manager" | "Employee";
  avatar?: string;
  companyName?: string;
  crNumber?: string;
  city?: string;
  dashboardConfig?: any[];
  invoiceRemindersConfig?: any;
  quickActionsConfig?: string[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<boolean>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  registerWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  hasPermission: (module: string) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Set token cookie for server-side auth
        const token = await firebaseUser.getIdToken();
        document.cookie = `mudarij_token=${encodeURIComponent(token)}; path=/; max-age=3600; SameSite=None; Secure`;
        // Clear old local token if it exists
        localStorage.removeItem("auth_token");
        await syncUser(firebaseUser);
      } else {
        document.cookie = "mudarij_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncUser = async (firebaseUser: FirebaseUser) => {
    try {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDoc = await getDocFromServer(userDocRef);

      if (userDoc.exists()) {
        setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
      } else {
        // Create initial user profile
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          role: "Administrator", // Default role
          avatar: firebaseUser.photoURL || undefined
        };
        await setDoc(userDocRef, {
          ...newUser,
          uid: firebaseUser.uid,
          createdAt: serverTimestamp(),
        });
        setUser({ ...newUser, uid: firebaseUser.uid });
      }
    } catch (e) {
      console.error("User sync failed", e);
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
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

  const registerWithEmail = async (email: string, pass: string) => {
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, pass);
      return true;
    } catch (e) {
      console.error("Email Register failed", e);
      setLoading(false);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const userDocRef = doc(db, "users", user.id);
      await setDoc(userDocRef, { ...updates, updatedAt: serverTimestamp() }, { merge: true });
      setUser(prev => prev ? { ...prev, ...updates } : null);
      toast.success("تم تحديث الملف الشخصي بنجاح");
    } catch (e) {
      console.error("Profile update failed", e);
      toast.error("فشل تحديث الملف الشخصي");
    }
  };

  const hasPermission = (module: string) => {
    if (!user) return false;
    if (user.role === "Administrator") return true;
    
    const permissions: Record<string, string[]> = {
      Manager: ["Dashboard", "CRM", "Invoices", "Analytics", "Settings", "Simulator"],
      Employee: ["Dashboard", "CRM"],
    };

    return permissions[user.role as keyof typeof permissions]?.includes(module) || false;
  };

  return (
    <UserContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout, updateProfile, hasPermission }}>
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
