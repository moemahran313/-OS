import crypto from "crypto";
import fs from "fs";
import path from "path";

const ENCRYPTION_KEY = process.env.OAUTH_ENCRYPTION_KEY || "mudarij-os-secret-oauth-key-32b!";
const TOKEN_FILE = path.join(process.cwd(), ".oauth_tokens.json");

export interface TokenRecord {
  provider: "google" | "outlook";
  accessToken: string;
  refreshTokenEncrypted: string;
  expiresAt: number; // ms timestamp
  email: string;
  name: string;
  scopes: string[];
  updatedAt: string;
}

export function encryptToken(text: string): string {
  if (!text) return "";
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt_mudarij_oauth", 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (err) {
    return text;
  }
}

export function decryptToken(text: string): string {
  if (!text) return "";
  try {
    const parts = text.split(":");
    if (parts.length !== 2) return text;
    const iv = Buffer.from(parts[0], "hex");
    const key = crypto.scryptSync(ENCRYPTION_KEY, "salt_mudarij_oauth", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    return text;
  }
}

export function saveTokenRecord(record: TokenRecord) {
  let tokens: Record<string, TokenRecord> = {};
  if (fs.existsSync(TOKEN_FILE)) {
    try {
      tokens = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    } catch (e) {
      tokens = {};
    }
  }
  tokens[record.provider] = record;
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8");
}

export function getTokenRecord(provider: "google" | "outlook"): TokenRecord | null {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  try {
    const tokens: Record<string, TokenRecord> = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    return tokens[provider] || null;
  } catch (e) {
    return null;
  }
}

export function deleteTokenRecord(provider: "google" | "outlook") {
  if (!fs.existsSync(TOKEN_FILE)) return;
  try {
    const tokens: Record<string, TokenRecord> = JSON.parse(fs.readFileSync(TOKEN_FILE, "utf-8"));
    delete tokens[provider];
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf-8");
  } catch (e) {}
}
