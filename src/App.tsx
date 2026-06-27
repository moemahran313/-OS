/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Layout from "./components/Layout";
import { SettingsProvider } from "./contexts/SettingsContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Toaster, toast } from "sonner";
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './lib/firebase';

function GlobalPayrollMonitor() {
  const { user } = useUser();
  
  useEffect(() => {
    if (!user) return;
    
    const qRuns = query(collection(db, "payroll_runs"), where("userId", "==", user.uid));
    const unsub = onSnapshot(qRuns, (snapshot) => {
      const runs = snapshot.docs.map(doc => doc.data());
      
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);
      
      const lastRun = runs.find(r => r.period === lastMonthStr);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0); 
      const deadline = new Date(endOfLastMonth);
      deadline.setDate(deadline.getDate() + 30);
      
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const isGenerated = lastRun ? (lastRun.mudadSifGenerated || lastRun.wpsGenerated) : false;
      const isLockdown = !isGenerated && daysLeft <= 0;
      
      if (isLockdown) {
        const lockKey = `lockdown_sent_${lastMonthStr}`;
        if (!localStorage.getItem(lockKey)) {
          localStorage.setItem(lockKey, 'true');
          // trigger WhatsApp and Lockdown automatically
          toast.success("تم إرسال تنبيه واتساب آلي للمدير المالي (CFO)", { duration: 8000 });
          toast.error(`تم تفعيل وضع Emergency Lockdown لأنظمة الرواتب بسبب تجاوز مهلة WPS للمسير ${lastMonthStr}`, {
            duration: 12000
          });
          
          // Note: In a full-backend setup we'd probably write to a DB config to lock them down.
          // For visualization, setting it in localStorage ensures the frontend components know.
          localStorage.setItem('emergency_lockdown', 'true');
        }
      } else {
        localStorage.removeItem('emergency_lockdown'); // reset if compliant
      }
    }, (error) => {
      console.warn("Global payroll monitor failed to sync with Firestore (unreachable/permission):", error);
    });

    return () => unsub();
  }, [user]);

  return null;
}

const Login = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const About = lazy(() => import("./pages/About"));
const Security = lazy(() => import("./pages/Security"));
const Contact = lazy(() => import("./pages/Contact"));
const Demo = lazy(() => import("./pages/Demo"));
const InvoicingFeature = lazy(() => import("./pages/InvoicingFeature"));
const Product = lazy(() => import("./pages/Product"));
const Solutions = lazy(() => import("./pages/Solutions"));
const Resources = lazy(() => import("./pages/Resources"));

// Product subpages
const ProductCRM = lazy(() => import("./pages/products/ProductCRM"));
const ProductInvoicing = lazy(() => import("./pages/products/ProductInvoicing"));
const ProductPayroll = lazy(() => import("./pages/products/ProductPayroll"));
const ProductContracts = lazy(() => import("./pages/products/ProductContracts"));
const ProductSupplyChain = lazy(() => import("./pages/products/ProductSupplyChain"));
const ProductAI = lazy(() => import("./pages/products/ProductAI"));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const location = useLocation();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.companyName && location.pathname !== '/onboarding') return <Navigate to="/onboarding" replace />;
  
  return <>{children}</>;
}

const CRM = lazy(() => import("./pages/CRM"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Payroll = lazy(() => import("./pages/Payroll"));
const Analytics = lazy(() => import("./pages/Analytics"));
const PublicInvoiceView = lazy(() => import("./pages/PublicInvoiceView"));
const FWCOS = lazy(() => import("./pages/FWCOS"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Calculations = lazy(() => import("./pages/Calculations"));
const Contracts = lazy(() => import("./pages/Contracts"));
const Settings = lazy(() => import("./pages/Settings"));
const Suppliers = lazy(() => import("./pages/Suppliers"));
const Chat = lazy(() => import("./pages/Chat"));
const SmartNegotiations = lazy(() => import("./pages/SmartNegotiations"));

function LoadingSpinner() {
  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[400px]">
      <motion.div
        animate={{
          rotate: 360,
          borderRadius: ["25%", "50%", "50%", "25%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-xl"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-xs font-black text-zinc-400 uppercase tracking-widest"
      >
        جاري تهيئة النظام...
      </motion.p>
    </div>
  );
}

import { ThemeProvider } from "./contexts/ThemeContext";

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-full w-full"
    >
      {children}
    </motion.div>
  );
}

function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname.split("/")[1] || "/"} className="h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/security" element={<PageTransition><Security /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
            <Route path="/demo" element={<PageTransition><Demo /></PageTransition>} />
            <Route path="/solutions/invoicing" element={<PageTransition><InvoicingFeature /></PageTransition>} />
            <Route path="/product" element={<PageTransition><Product /></PageTransition>} />
            <Route path="/product/crm" element={<PageTransition><ProductCRM /></PageTransition>} />
            <Route path="/product/invoicing" element={<PageTransition><ProductInvoicing /></PageTransition>} />
            <Route path="/product/payroll" element={<PageTransition><ProductPayroll /></PageTransition>} />
            <Route path="/product/contracts" element={<PageTransition><ProductContracts /></PageTransition>} />
            <Route path="/product/supply-chain" element={<PageTransition><ProductSupplyChain /></PageTransition>} />
            <Route path="/product/ai-automation" element={<PageTransition><ProductAI /></PageTransition>} />
            <Route path="/solutions" element={<PageTransition><Solutions /></PageTransition>} />
            <Route path="/resources" element={<PageTransition><Resources /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/onboarding" element={<ProtectedRoute><PageTransition><Onboarding /></PageTransition></ProtectedRoute>} />
            <Route path="/pay/:id" element={<PageTransition><PublicInvoiceView /></PageTransition>} />
            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Layout>
                      <AppInnerRoutes />
                    </Layout>
                  </PageTransition>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const SecurityCompliance = lazy(() => import("./pages/SecurityCompliance"));
const DeveloperTools = lazy(() => import("./pages/DeveloperTools"));
const ShipmentDetails = lazy(() => import("./pages/ShipmentDetails"));
const Inventory = lazy(() => import("./pages/Inventory"));

const Workflows = lazy(() => import("./pages/Workflows"));

function AppInnerRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="workflows" element={<PageTransition><Workflows /></PageTransition>} />

            <Route path="crm" element={<PageTransition><CRM /></PageTransition>} />
            <Route path="crm/new" element={<PageTransition><CRM /></PageTransition>} />

            <Route path="invoices" element={<PageTransition><Invoices /></PageTransition>} />
            <Route path="invoices/new" element={<PageTransition><Invoices /></PageTransition>} />

            <Route path="payroll" element={<PageTransition><Payroll /></PageTransition>} />
            <Route path="payroll/new" element={<PageTransition><Payroll /></PageTransition>} />

            <Route path="fwcos" element={<PageTransition><FWCOS /></PageTransition>} />
            <Route path="fwcos/new" element={<PageTransition><FWCOS /></PageTransition>} />

            <Route path="contracts" element={<PageTransition><Contracts /></PageTransition>} />
            <Route path="smart-negotiations" element={<PageTransition><SmartNegotiations /></PageTransition>} />
            <Route path="calculations" element={<PageTransition><Calculations /></PageTransition>} />
            <Route path="analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="inventory" element={<PageTransition><Inventory /></PageTransition>} />
            <Route path="integrations" element={<PageTransition><Integrations /></PageTransition>} />
            <Route path="developer-tools" element={<PageTransition><DeveloperTools /></PageTransition>} />
            <Route path="security-compliance" element={<PageTransition><SecurityCompliance /></PageTransition>} />
            <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
            
            <Route path="suppliers" element={<PageTransition><Suppliers /></PageTransition>} />
            <Route path="suppliers/new" element={<PageTransition><Suppliers /></PageTransition>} />
            <Route path="suppliers/:id" element={<PageTransition><ShipmentDetails /></PageTransition>} />
            
            <Route path="chat" element={<PageTransition><Chat /></PageTransition>} />
            <Route path="*" element={<Navigate to="/app" />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

import Integrations from './pages/Integrations';

export default function App() {
  return (
    <UserProvider>
      <SettingsProvider>
        <ThemeProvider>
          <Router>
            <GlobalPayrollMonitor />
            <Toaster position="top-center" expand={true} richColors />
            <AppRoutes />
          </Router>
        </ThemeProvider>
      </SettingsProvider>
    </UserProvider>
  );
}
