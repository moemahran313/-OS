import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

// Routes
import authRoutes from "./routes/auth.ts";
import shipmentRoutes from "./routes/shipments.ts";
import leadRoutes from "./routes/leads.ts";
import invoiceRoutes from "./routes/invoices.ts";
import payrollRoutes from "./routes/payroll.ts";
import employeeRoutes from "./routes/employees.ts";
import dashboardRoutes from "./routes/dashboard.ts";
import fwcosRoutes from "./routes/fwcos.ts";
import notificationRoutes from "./routes/notifications.ts";
import settingsRoutes from "./routes/settings.ts";
import analyticsRoutes from "./routes/analytics.ts";
import hrRoutes from "./routes/hr.ts";
import isicRoutes from "./routes/isic.ts";
import publicRoutes from "./routes/public.ts";
import auditLogRoutes from "./routes/auditLogs.ts";
import certificateRoutes from "./routes/certificate.ts";
import workflowRoutes from "./routes/workflows.ts";
import negotiationRoutes from "./routes/negotiations.ts";
import openwaRoutes from "./routes/openwa.ts";
import accountingRoutes from "./routes/accounting.ts";
import bankingRoutes from "./routes/banking.ts";
import organizationsRoutes from "./routes/organizations.ts";
import dmsRoutes from "./routes/dms.ts";
import zatcaRoutes from "./routes/zatca.ts";
import projectsRoutes from "./routes/projects.ts";
import referralRoutes from "./routes/referrals.ts";
import ticketRoutes from "./routes/tickets.ts";
import leadGenRoutes from "./routes/lead-gen.ts";
import marketingCopilotRoutes from "./routes/marketing-copilot.ts";
import demoRoutes from "./routes/demo.ts";
import leadsIntelligenceRoutes from "./routes/leads-intelligence.ts";
import stripeRoutes from "./routes/stripe.ts";

export async function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(express.json());
  app.use(cookieParser());

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Attach routes
  app.use("/api/auth", authRoutes);
  app.use("/api/employees", employeeRoutes);
  app.use("/api/shipments", shipmentRoutes);
  app.use("/api/leads", leadRoutes);
  app.use("/api/invoices", invoiceRoutes);
  app.use("/api/payroll", payrollRoutes); // handles /simulate, /commit, /wps, /report
  app.use("/api/payroll-runs", payrollRoutes); // handles GET / for runs
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/fwcos", fwcosRoutes);
  app.use("/api/stats", fwcosRoutes); // handles /simulation-baseline
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/user", settingsRoutes);
  app.use("/api/analytics", analyticsRoutes);
  app.use("/api/isic4", isicRoutes);
  app.use("/api/public", publicRoutes);
  app.use("/api/audit-logs", auditLogRoutes);
  app.use("/api/certificate", certificateRoutes);
  app.use("/api/workflows", workflowRoutes);
  app.use("/api/negotiations", negotiationRoutes);
  app.use("/api/openwa", openwaRoutes);
  app.use("/api/accounting", accountingRoutes);
  app.use("/api/accounting/banking", bankingRoutes);
  app.use("/api/banking", bankingRoutes);
  app.use("/api/organizations", organizationsRoutes);
  app.use("/api/dms", dmsRoutes);
  app.use("/api/zatca", zatcaRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/referrals", referralRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/lead-gen", leadGenRoutes);
  app.use("/api/marketing-copilot", marketingCopilotRoutes);
  app.use("/api/demo", demoRoutes);
  app.use("/api/leads-intelligence", leadsIntelligenceRoutes);
  app.use("/api/stripe", stripeRoutes);

  // HR routes like /api/nitaqat/calculate and /api/workpermit/calculate
  app.use("/api", hrRoutes);

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Mudarij OS API is active" });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}
