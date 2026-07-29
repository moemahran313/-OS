/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { ReactNode, lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import Layout from "./components/Layout";
import LandingPage from "./pages/LandingPage";
import { SettingsProvider } from "./contexts/SettingsContext";
import { UserProvider, useUser } from "./contexts/UserContext";
import { Toaster, toast } from "sonner";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";

function GlobalPayrollMonitor() {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    const qRuns = query(collection(db, "payroll_runs"), where("userId", "==", user.uid));
    const unsub = onSnapshot(
      qRuns,
      (snapshot) => {
        const runs = snapshot.docs.map((doc) => doc.data());

        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthStr = lastMonth.toISOString().slice(0, 7);

        const lastRun = runs.find((r) => r.period === lastMonthStr);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const deadline = new Date(endOfLastMonth);
        deadline.setDate(deadline.getDate() + 30);

        const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const isGenerated = lastRun ? lastRun.mudadSifGenerated || lastRun.wpsGenerated : false;
        const isLockdown = !isGenerated && daysLeft <= 0;

        if (isLockdown) {
          const lockKey = `lockdown_sent_${lastMonthStr}`;
          if (!localStorage.getItem(lockKey)) {
            localStorage.setItem(lockKey, "true");
            // trigger WhatsApp and Lockdown automatically
            toast.success("تم إرسال تنبيه واتساب آلي للمدير المالي (CFO)", { duration: 8000 });
            toast.error(
              `تم تفعيل وضع Emergency Lockdown لأنظمة الرواتب بسبب تجاوز مهلة WPS للمسير ${lastMonthStr}`,
              {
                duration: 12000,
              }
            );

            // Note: In a full-backend setup we'd probably write to a DB config to lock them down.
            // For visualization, setting it in localStorage ensures the frontend components know.
            localStorage.setItem("emergency_lockdown", "true");
          }
        } else {
          localStorage.removeItem("emergency_lockdown"); // reset if compliant
        }
      },
      (error) => {
        console.warn(
          "Global payroll monitor failed to sync with Firestore (unreachable/permission):",
          error
        );
      }
    );

    return () => unsub();
  }, [user]);

  return null;
}

function lazyRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    const pageHasAlreadyBeenReloaded = window.sessionStorage.getItem("retry_lazy_reload");
    try {
      const component = await componentImport();
      window.sessionStorage.removeItem("retry_lazy_reload");
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenReloaded) {
        window.sessionStorage.setItem("retry_lazy_reload", "true");
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-900 text-white p-6 text-center font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-black mb-2">حدث خطأ في تحميل الصفحة</h2>
          <p className="text-zinc-400 text-sm max-w-md mb-6 font-bold">
            يرجى تحديث الصفحة لإعادة تحميل وحدات النظام المحدثة.
          </p>
          <button
            onClick={() => {
              window.sessionStorage.removeItem("retry_lazy_reload");
              window.location.reload();
            }}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-black text-sm rounded-xl transition-colors shadow-lg cursor-pointer"
          >
            إعادة تحميل الصفحة
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const Login = lazyRetry(() => import("./pages/Login"));
const Onboarding = lazyRetry(() => import("./pages/Onboarding"));
const Dashboard = lazyRetry(() => import("./pages/Dashboard"));
const About = lazyRetry(() => import("./pages/About"));
const Security = lazyRetry(() => import("./pages/Security"));
const Contact = lazyRetry(() => import("./pages/Contact"));
const Demo = lazyRetry(() => import("./pages/Demo"));
const InvoicingFeature = lazyRetry(() => import("./pages/InvoicingFeature"));
const Product = lazyRetry(() => import("./pages/Product"));
const Solutions = lazyRetry(() => import("./pages/Solutions"));
const Resources = lazyRetry(() => import("./pages/Resources"));

// Product subpages
const ProductCRM = lazyRetry(() => import("./pages/products/ProductCRM"));
const ProductInvoicing = lazyRetry(() => import("./pages/products/ProductInvoicing"));
const ProductPayroll = lazyRetry(() => import("./pages/products/ProductPayroll"));
const ProductContracts = lazyRetry(() => import("./pages/products/ProductContracts"));
const ProductSupplyChain = lazyRetry(() => import("./pages/products/ProductSupplyChain"));
const ProductAI = lazyRetry(() => import("./pages/products/ProductAI"));

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.companyName && location.pathname !== "/onboarding")
    return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

const CRM = lazyRetry(() => import("./pages/CRM"));
const Invoices = lazyRetry(() => import("./pages/Invoices"));
const Payroll = lazyRetry(() => import("./pages/Payroll"));
const Analytics = lazyRetry(() => import("./pages/Analytics"));
const PublicInvoiceView = lazyRetry(() => import("./pages/PublicInvoiceView"));
const FWCOS = lazyRetry(() => import("./pages/FWCOS"));
const Calculations = lazyRetry(() => import("./pages/Calculations"));
const Contracts = lazyRetry(() => import("./pages/Contracts"));
const Settings = lazyRetry(() => import("./pages/Settings"));
const Suppliers = lazyRetry(() => import("./pages/Suppliers"));
const Chat = lazyRetry(() => import("./pages/Chat"));
const Accounting = lazyRetry(() => import("./pages/Accounting"));
const Projects = lazyRetry(() => import("./pages/Projects"));
const Support = lazyRetry(() => import("./pages/Support"));
const MarketingCopilot = lazyRetry(() => import("./pages/MarketingCopilot"));
const LeadGenEngine = lazyRetry(() => import("./pages/LeadGenEngine"));

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
          ease: "linear",
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

import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { useSettings } from "./contexts/SettingsContext";

function ThemeRouteHandler() {
  const location = useLocation();
  const { theme } = useTheme();
  const { settings } = useSettings();

  useEffect(() => {
    const isDarkTheme =
      theme === "dark" ||
      settings.theme === "dark" ||
      (settings.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

    const body = document.body;
    const docEl = document.documentElement;

    if (isDarkTheme) {
      body.classList.add("dark");
      docEl.classList.add("dark");
    } else {
      body.classList.remove("dark");
      docEl.classList.remove("dark");
    }
  }, [location.pathname, theme, settings.theme]);

  return null;
}

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
            <Route
              path="/"
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              }
            />
            <Route
              path="/about"
              element={
                <PageTransition>
                  <About />
                </PageTransition>
              }
            />
            <Route
              path="/security"
              element={
                <PageTransition>
                  <Security />
                </PageTransition>
              }
            />
            <Route
              path="/contact"
              element={
                <PageTransition>
                  <Contact />
                </PageTransition>
              }
            />
            <Route
              path="/demo"
              element={
                <PageTransition>
                  <Demo />
                </PageTransition>
              }
            />
            <Route
              path="/solutions/invoicing"
              element={
                <PageTransition>
                  <InvoicingFeature />
                </PageTransition>
              }
            />
            <Route
              path="/product"
              element={
                <PageTransition>
                  <Product />
                </PageTransition>
              }
            />
            <Route
              path="/product/crm"
              element={
                <PageTransition>
                  <ProductCRM />
                </PageTransition>
              }
            />
            <Route
              path="/product/invoicing"
              element={
                <PageTransition>
                  <ProductInvoicing />
                </PageTransition>
              }
            />
            <Route
              path="/product/payroll"
              element={
                <PageTransition>
                  <ProductPayroll />
                </PageTransition>
              }
            />
            <Route
              path="/product/contracts"
              element={
                <PageTransition>
                  <ProductContracts />
                </PageTransition>
              }
            />
            <Route
              path="/product/supply-chain"
              element={
                <PageTransition>
                  <ProductSupplyChain />
                </PageTransition>
              }
            />
            <Route
              path="/product/ai-automation"
              element={
                <PageTransition>
                  <ProductAI />
                </PageTransition>
              }
            />
            <Route
              path="/solutions"
              element={
                <PageTransition>
                  <Solutions />
                </PageTransition>
              }
            />
            <Route
              path="/resources"
              element={
                <PageTransition>
                  <Resources />
                </PageTransition>
              }
            />
            <Route
              path="/login"
              element={
                <PageTransition>
                  <Login />
                </PageTransition>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <PageTransition>
                    <Onboarding />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pay/:id"
              element={
                <PageTransition>
                  <PublicInvoiceView />
                </PageTransition>
              }
            />
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

const SecurityCompliance = lazyRetry(() => import("./pages/SecurityCompliance"));
const DeveloperTools = lazyRetry(() => import("./pages/DeveloperTools"));
const ShipmentDetails = lazyRetry(() => import("./pages/ShipmentDetails"));
const Inventory = lazyRetry(() => import("./pages/Inventory"));

const Workflows = lazyRetry(() => import("./pages/Workflows"));

function AppInnerRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="h-full w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes location={location}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              }
            />
            <Route
              path="workflows"
              element={
                <PageTransition>
                  <Workflows />
                </PageTransition>
              }
            />

            <Route
              path="crm"
              element={
                <PageTransition>
                  <CRM />
                </PageTransition>
              }
            />
            <Route
              path="lead-gen"
              element={
                <PageTransition>
                  <LeadGenEngine />
                </PageTransition>
              }
            />
            <Route
              path="marketing-copilot"
              element={
                <PageTransition>
                  <MarketingCopilot />
                </PageTransition>
              }
            />
            <Route path="growth-intelligence" element={<Navigate to="/app/marketing-copilot" replace />} />
            <Route path="email-marketing" element={<Navigate to="/app/marketing-copilot" replace />} />
            <Route path="social-media" element={<Navigate to="/app/marketing-copilot" replace />} />
            <Route path="advertising" element={<Navigate to="/app/marketing-copilot" replace />} />
            <Route
              path="crm/new"
              element={
                <PageTransition>
                  <CRM />
                </PageTransition>
              }
            />

            <Route
              path="invoices"
              element={
                <PageTransition>
                  <Invoices />
                </PageTransition>
              }
            />
            <Route
              path="invoices/new"
              element={
                <PageTransition>
                  <Invoices />
                </PageTransition>
              }
            />

            <Route
              path="payroll"
              element={
                <PageTransition>
                  <Payroll />
                </PageTransition>
              }
            />
            <Route
              path="payroll/new"
              element={
                <PageTransition>
                  <Payroll />
                </PageTransition>
              }
            />

            <Route
              path="fwcos"
              element={
                <PageTransition>
                  <FWCOS />
                </PageTransition>
              }
            />
            <Route
              path="fwcos/new"
              element={
                <PageTransition>
                  <FWCOS />
                </PageTransition>
              }
            />

            <Route
              path="contracts"
              element={
                <PageTransition>
                  <Contracts />
                </PageTransition>
              }
            />
            <Route
              path="calculations"
              element={
                <PageTransition>
                  <Calculations />
                </PageTransition>
              }
            />
            <Route
              path="analytics"
              element={
                <PageTransition>
                  <Analytics />
                </PageTransition>
              }
            />
            <Route
              path="inventory"
              element={
                <PageTransition>
                  <Inventory />
                </PageTransition>
              }
            />
            <Route
              path="integrations"
              element={
                <PageTransition>
                  <Integrations />
                </PageTransition>
              }
            />
            <Route
              path="developer-tools"
              element={
                <PageTransition>
                  <DeveloperTools />
                </PageTransition>
              }
            />
            <Route
              path="security-compliance"
              element={
                <PageTransition>
                  <SecurityCompliance />
                </PageTransition>
              }
            />
            <Route
              path="settings"
              element={
                <PageTransition>
                  <Settings />
                </PageTransition>
              }
            />

            <Route
              path="suppliers"
              element={
                <PageTransition>
                  <Suppliers />
                </PageTransition>
              }
            />
            <Route
              path="suppliers/new"
              element={
                <PageTransition>
                  <Suppliers />
                </PageTransition>
              }
            />
            <Route
              path="suppliers/:id"
              element={
                <PageTransition>
                  <ShipmentDetails />
                </PageTransition>
              }
            />

            <Route
              path="accounting"
              element={
                <PageTransition>
                  <Accounting />
                </PageTransition>
              }
            />
            <Route
              path="chat"
              element={
                <PageTransition>
                  <Chat />
                </PageTransition>
              }
            />
            <Route
              path="projects"
              element={
                <PageTransition>
                  <Projects />
                </PageTransition>
              }
            />
            <Route
              path="support"
              element={
                <PageTransition>
                  <Support />
                </PageTransition>
              }
            />
            <Route path="*" element={<Navigate to="/app" />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

import Integrations from "./pages/Integrations";

export default function App() {
  return (
    <UserProvider>
      <SettingsProvider>
        <ThemeProvider>
          <Router>
            <ThemeRouteHandler />
            <GlobalPayrollMonitor />
            <Toaster position="top-center" expand={true} richColors />
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </Router>
        </ThemeProvider>
      </SettingsProvider>
    </UserProvider>
  );
}
