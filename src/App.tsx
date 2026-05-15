/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, lazy, Suspense } from "react";
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
import { Toaster } from "sonner";

const Login = lazy(() => import("./pages/Login"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

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
const Simulator = lazy(() => import("./pages/Simulator"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Calculations = lazy(() => import("./pages/Calculations"));
const Settings = lazy(() => import("./pages/Settings"));
const Suppliers = lazy(() => import("./pages/Suppliers"));

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

function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
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

const ShipmentDetails = lazy(() => import("./pages/ShipmentDetails"));

function AppInnerRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route path="/" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="crm" element={<PageTransition><CRM /></PageTransition>} />

            <Route path="invoices" element={<PageTransition><Invoices /></PageTransition>} />
            <Route path="payroll" element={<PageTransition><Payroll /></PageTransition>} />
            <Route path="fwcos" element={<PageTransition><FWCOS /></PageTransition>} />
            <Route path="simulator" element={<PageTransition><Simulator /></PageTransition>} />
            <Route path="calculations" element={<PageTransition><Calculations /></PageTransition>} />
            <Route path="analytics" element={<PageTransition><Analytics /></PageTransition>} />
            <Route path="settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="suppliers" element={<PageTransition><Suppliers /></PageTransition>} />
            <Route path="suppliers/:id" element={<PageTransition><ShipmentDetails /></PageTransition>} />
            <Route path="*" element={<Navigate to="/app" />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <UserProvider>
      <SettingsProvider>
        <Router>
          <Toaster position="top-center" expand={true} richColors />
          <AppRoutes />
        </Router>
      </SettingsProvider>
    </UserProvider>
  );
}
