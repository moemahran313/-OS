import { auth } from "../services/firebase.js";

export const authenticate = async (req: any, res: any, next: any) => {
  const token = req.cookies.mudarij_token || req.headers.authorization?.split(" ")[1];
  
  if (!token || token === "undefined" || token === "null") {
    return res.status(401).json({ error: "Access denied. No token provided or invalid token." });
  }

  try {
    // Basic check to see if it looks like a Firebase ID token (JWT)
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      console.warn("Invalid token format received");
      return res.status(401).json({ error: "Invalid token format" });
    }

    // Diagnostic logging for "no kid" issue
    try {
      const header = JSON.parse(Buffer.from(tokenParts[0], 'base64').toString());
      console.log("DEBUG: Verifying token with Project ID:", (auth as any).app.options.projectId);
      if (!header.kid) {
        console.error("DEBUG: Token header missing 'kid'. Header:", header);
      }
    } catch (e) { /* ignore */ }

    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      id: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      role: decodedToken.role || "Administrator"
    };
    next();
  } catch (err: any) {
    // Log more details about the failing token
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.error("Failing Token Header:", header);
        console.error("Failing Token Payload (subset):", {
          iss: payload.iss,
          aud: payload.aud,
          sub: payload.sub,
          project_id: payload.firebase?.project_id
        });
      }
    } catch (e) {
      console.error("Could not parse failing token header/payload");
    }

    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired" });
    }
    console.error("Firebase auth error details:", {
      code: err.code,
      message: err.message,
      tokenPreview: token.substring(0, 20) + "...",
      stack: err.stack
    });
    res.status(401).json({ error: "Invalid token" });
  }
};
