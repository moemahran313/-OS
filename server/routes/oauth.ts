import { Router } from "express";
import { google } from "googleapis";
import { Client as GraphClient } from "@microsoft/microsoft-graph-client";
import { PrismaClient } from "@prisma/client";
import {
  saveTokenRecord,
  getTokenRecord,
  deleteTokenRecord,
  encryptToken,
  decryptToken,
  TokenRecord,
} from "../services/oauthStore.ts";

const router = Router();
const prisma = new PrismaClient();

// Helper to construct dynamic OAuth redirect URI based on incoming request
function getRedirectUri(req: any, provider: string): string {
  if (process.env.APP_URL) {
    const baseUrl = process.env.APP_URL.replace(/\/$/, "");
    return `${baseUrl}/api/integrations/${provider}/callback`;
  }
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${protocol}://${host}/api/integrations/${provider}/callback`;
}

// ---------------------------------------------------------------------------
// 1. Token Refresh Helpers
// ---------------------------------------------------------------------------
export async function getValidGoogleToken(): Promise<string | null> {
  const record = getTokenRecord("google");
  if (!record) return null;

  if (record.expiresAt > Date.now() + 60000 && record.accessToken) {
    return record.accessToken;
  }

  const refreshToken = decryptToken(record.refreshTokenEncrypted);
  if (!refreshToken) return record.accessToken;

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "google-client-id";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "google-client-secret";

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await oauth2Client.refreshAccessToken();
    if (credentials.access_token) {
      record.accessToken = credentials.access_token;
      record.expiresAt = credentials.expiry_date || Date.now() + 3600 * 1000;
      record.updatedAt = new Date().toISOString();
      saveTokenRecord(record);
      return credentials.access_token;
    }
  } catch (err) {
    console.warn("Failed to refresh Google OAuth token:", err);
  }

  return record.accessToken;
}

export async function getValidOutlookToken(): Promise<string | null> {
  const record = getTokenRecord("outlook");
  if (!record) return null;

  if (record.expiresAt > Date.now() + 60000 && record.accessToken) {
    return record.accessToken;
  }

  const refreshToken = decryptToken(record.refreshTokenEncrypted);
  if (!refreshToken) return record.accessToken;

  try {
    const clientId = process.env.OUTLOOK_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "outlook-client-id";
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "outlook-client-secret";

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    const res = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    if (res.ok) {
      const data = await res.json();
      record.accessToken = data.access_token;
      if (data.refresh_token) {
        record.refreshTokenEncrypted = encryptToken(data.refresh_token);
      }
      record.expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      record.updatedAt = new Date().toISOString();
      saveTokenRecord(record);
      return data.access_token;
    }
  } catch (err) {
    console.warn("Failed to refresh Outlook OAuth token:", err);
  }

  return record.accessToken;
}

// ---------------------------------------------------------------------------
// 2. Integration Status & Disconnect
// ---------------------------------------------------------------------------
router.get("/status", async (req, res) => {
  const googleRecord = getTokenRecord("google");
  const outlookRecord = getTokenRecord("outlook");

  const googleToken = await getValidGoogleToken();
  const outlookToken = await getValidOutlookToken();

  res.json({
    google: {
      connected: !!googleToken,
      email: googleRecord?.email || null,
      name: googleRecord?.name || null,
      expiresAt: googleRecord?.expiresAt || null,
    },
    outlook: {
      connected: !!outlookToken,
      email: outlookRecord?.email || null,
      name: outlookRecord?.name || null,
      expiresAt: outlookRecord?.expiresAt || null,
    },
    timestamp: new Date().toISOString(),
  });
});

router.post("/disconnect", (req, res) => {
  const { provider } = req.body;
  if (provider === "google" || provider === "outlook") {
    deleteTokenRecord(provider);
    return res.json({ success: true, message: `Disconnected ${provider}` });
  }
  deleteTokenRecord("google");
  deleteTokenRecord("outlook");
  res.json({ success: true, message: "Disconnected all integrations" });
});

// ---------------------------------------------------------------------------
// 3. Google OAuth Connect & Callback
// ---------------------------------------------------------------------------
router.get("/google/connect", (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "7192837492-mdrj.apps.googleusercontent.com";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "dummy-secret";
  const redirectUri = getRedirectUri(req, "google");

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const scopes = [
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: scopes,
  });

  if (req.query.json === "true" || req.headers.accept?.includes("application/json")) {
    return res.json({ url: authUrl, redirectUri });
  }

  res.redirect(authUrl);
});

router.get("/google/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = getRedirectUri(req, "google");

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "7192837492-mdrj.apps.googleusercontent.com";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "dummy-secret";

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Fetch User Profile
    let email = "user@workspace.com";
    let name = "Google Workspace User";

    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      email = userInfo.data.email || email;
      name = userInfo.data.name || name;
    } catch (e) {
      console.warn("User info fetch warning:", e);
    }

    // Encrypt & Store Token
    const record: TokenRecord = {
      provider: "google",
      accessToken: tokens.access_token || "",
      refreshTokenEncrypted: encryptToken(tokens.refresh_token || ""),
      expiresAt: tokens.expiry_date || Date.now() + 3600 * 1000,
      email,
      name,
      scopes: tokens.scope ? tokens.scope.split(" ") : [],
      updatedAt: new Date().toISOString(),
    };

    saveTokenRecord(record);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; direction: rtl;">
          <h2 style="color: #10b981;">تم الربط والمصادقة مع Google Workspace بنجاح! 🎉</h2>
          <p>تم حفظ رموز التفويض والربط بالبريد والتقويم.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'google', email: '${email}' }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = '/app/crm';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    res.status(500).send(`Failed to complete Google OAuth: ${err.message}`);
  }
});

// ---------------------------------------------------------------------------
// 4. Outlook / Microsoft 365 OAuth Connect & Callback
// ---------------------------------------------------------------------------
router.get("/outlook/connect", (req, res) => {
  const clientId = process.env.OUTLOOK_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "mudarij-outlook-app-id";
  const redirectUri = getRedirectUri(req, "outlook");

  const scopes = [
    "https://graph.microsoft.com/Mail.ReadWrite",
    "https://graph.microsoft.com/Calendars.ReadWrite",
    "https://graph.microsoft.com/User.Read",
    "offline_access",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: scopes,
    prompt: "consent",
  });

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;

  if (req.query.json === "true" || req.headers.accept?.includes("application/json")) {
    return res.json({ url: authUrl, redirectUri });
  }

  res.redirect(authUrl);
});

router.get("/outlook/callback", async (req, res) => {
  const { code } = req.query;
  const redirectUri = getRedirectUri(req, "outlook");

  if (!code) {
    return res.status(400).send("Missing authorization code");
  }

  try {
    const clientId = process.env.OUTLOOK_CLIENT_ID || process.env.OAUTH_CLIENT_ID || "mudarij-outlook-app-id";
    const clientSecret = process.env.OUTLOOK_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || "dummy-secret";

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code: code as string,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    });

    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(tokenData.error_description || "Token exchange failed");
    }

    let email = "ceo@madarij-sa.onmicrosoft.com";
    let name = "Microsoft 365 User";

    try {
      const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        email = userData.mail || userData.userPrincipalName || email;
        name = userData.displayName || name;
      }
    } catch (e) {
      console.warn("Failed to fetch Outlook user info:", e);
    }

    const record: TokenRecord = {
      provider: "outlook",
      accessToken: tokenData.access_token,
      refreshTokenEncrypted: encryptToken(tokenData.refresh_token || ""),
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
      email,
      name,
      scopes: tokenData.scope ? tokenData.scope.split(" ") : [],
      updatedAt: new Date().toISOString(),
    };

    saveTokenRecord(record);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Authentication Successful</title></head>
        <body style="font-family: system-ui; text-align: center; padding: 40px; direction: rtl;">
          <h2 style="color: #10b981;">تم الربط والمصادقة مع Microsoft 365 Outlook بنجاح! 🎉</h2>
          <p>تم تبادل الرموز وحفظ جلسة الربط مع MS Graph API.</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', provider: 'outlook', email: '${email}' }, '*');
              setTimeout(() => window.close(), 1000);
            } else {
              window.location.href = '/app/crm';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error("Outlook OAuth callback error:", err);
    res.status(500).send(`Failed to complete Outlook OAuth: ${err.message}`);
  }
});

export default router;
