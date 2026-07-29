import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");

function setup() {
  console.log("[DB Setup] Checking database configuration...");

  const hasPostgres = !!(
    (process.env.DATABASE_URL && (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://"))) ||
    process.env.SQL_HOST
  );

  const targetProvider = hasPostgres ? "postgresql" : "sqlite";
  const targetUrl = hasPostgres ? 'env("DATABASE_URL")' : '"file:./dev.db"';

  console.log(`[DB Setup] Target database provider: ${targetProvider}`);

  if (!fs.existsSync(schemaPath)) {
    console.error("[DB Setup] prisma/schema.prisma not found.");
    return;
  }

  let schemaContent = fs.readFileSync(schemaPath, "utf8");

  // Find the datasource db block
  const datasourceStart = schemaContent.indexOf("datasource db");
  if (datasourceStart === -1) {
    console.error("[DB Setup] Could not find datasource db block in schema.prisma");
    return;
  }
  const datasourceEnd = schemaContent.indexOf("}", datasourceStart);
  const datasourceBlock = schemaContent.substring(datasourceStart, datasourceEnd + 1);

  // Parse provider inside the block
  const providerMatch = /provider\s*=\s*"([^"]+)"/.exec(datasourceBlock);
  const urlMatch = /url\s*=\s*([^\s\n]+)/.exec(datasourceBlock);

  const currentProvider = providerMatch ? providerMatch[1] : null;
  const currentUrl = urlMatch ? urlMatch[1] : null;

  const needsUpdate = currentProvider !== targetProvider || currentUrl !== targetUrl;

  if (needsUpdate) {
    console.log(`[DB Setup] Updating schema.prisma from ${currentProvider} to ${targetProvider}...`);
    
    // Replace provider and url inside the datasource block
    let newDatasourceBlock = datasourceBlock
      .replace(/provider\s*=\s*"([^"]+)"/, `provider = "${targetProvider}"`)
      .replace(/url\s*=\s*([^\s\n]+)/, `url = ${targetUrl}`);

    schemaContent = schemaContent.substring(0, datasourceStart) + newDatasourceBlock + schemaContent.substring(datasourceEnd + 1);
    fs.writeFileSync(schemaPath, schemaContent, "utf8");

    console.log("[DB Setup] Generating Prisma Client...");
    execSync("./node_modules/.bin/prisma generate || npx prisma generate", { stdio: "inherit" });
  } else {
    console.log("[DB Setup] schema.prisma is already up to date.");
  }

  // If using SQLite, run db push to ensure schema is synchronized
  if (targetProvider === "sqlite") {
    console.log("[DB Setup] Synchronizing local SQLite database...");
    const devDbPath = path.join(process.cwd(), "prisma", "dev.db");
    try {
      if (fs.existsSync(devDbPath)) {
        // Double check SQLite file is valid or recreate if corrupted
        try {
          execSync(`DATABASE_URL=file:${devDbPath} ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate || DATABASE_URL=file:${devDbPath} npx prisma db push --skip-generate`, { stdio: "inherit" });
        } catch (pushErr) {
          console.warn("[DB Setup] Warning: Existing dev.db push failed, recreating dev.db:", pushErr);
          const relatedFiles = [devDbPath, `${devDbPath}-journal`, `${devDbPath}-wal`, `${devDbPath}-shm`];
          for (const f of relatedFiles) {
            if (fs.existsSync(f)) {
              try { fs.unlinkSync(f); } catch (_) {}
            }
          }
          execSync(`DATABASE_URL=file:${devDbPath} ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate || DATABASE_URL=file:${devDbPath} npx prisma db push --skip-generate`, { stdio: "inherit" });
        }
      } else {
        execSync(`DATABASE_URL=file:${devDbPath} ./node_modules/.bin/prisma db push --accept-data-loss --skip-generate || DATABASE_URL=file:${devDbPath} npx prisma db push --skip-generate`, { stdio: "inherit" });
      }
    } catch (err) {
      console.warn("[DB Setup] Critical: Prisma db push failed, continuing:", err);
    }
  }
}

setup();
