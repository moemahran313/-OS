import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { createServer as createViteServer } from "vite";

// Routes
import authRoutes from "./routes/auth.js";
import shipmentRoutes from "./routes/shipments.js";
import leadRoutes from "./routes/leads.js";
import invoiceRoutes from "./routes/invoices.js";
import payrollRoutes from "./routes/payroll.js";
import employeeRoutes from "./routes/employees.js";
import dashboardRoutes from "./routes/dashboard.js";
import fwcosRoutes from "./routes/fwcos.js";
import notificationRoutes from "./routes/notifications.js";
import settingsRoutes from "./routes/settings.js";
import analyticsRoutes from "./routes/analytics.js";
import hrRoutes from "./routes/hr.js";
import isicRoutes from "./routes/isic.js";
import publicRoutes from "./routes/public.js";
import auditLogRoutes from "./routes/auditLogs.js";
import certificateRoutes from "./routes/certificate.js";
import workflowRoutes from "./routes/workflows.js";
import negotiationRoutes from "./routes/negotiations.js";
import openwaRoutes from "./routes/openwa.js";
import accountingRoutes from "./routes/accounting.js";
import organizationsRoutes from "./routes/organizations.js";
import dmsRoutes from "./routes/dms.js";
import zatcaRoutes from "./routes/zatca.js";
import projectsRoutes from "./routes/projects.js";
import referralRoutes from "./routes/referrals.js";
import ticketRoutes from "./routes/tickets.js";
import leadGenRoutes from "./routes/lead-gen.js";
import emailMarketingRoutes from "./routes/email-marketing.js";
import socialMediaRoutes from "./routes/social-media.js";
import advertisingRoutes from "./routes/advertising.js";
import demoRoutes from "./routes/demo.js";

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
  app.use("/api/organizations", organizationsRoutes);
  app.use("/api/dms", dmsRoutes);
  app.use("/api/zatca", zatcaRoutes);
  app.use("/api/projects", projectsRoutes);
  app.use("/api/referrals", referralRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/lead-gen", leadGenRoutes);
  app.use("/api/email-marketing", emailMarketingRoutes);
  app.use("/api/social-media", socialMediaRoutes);
  app.use("/api/advertising", advertisingRoutes);
  app.use("/api/demo", demoRoutes);

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
