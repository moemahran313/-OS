import { PrismaClient } from "@prisma/client";

import path from "path";

const getDatabaseUrl = (): string => {
  if (
    process.env.SQL_HOST &&
    process.env.SQL_USER &&
    process.env.SQL_PASSWORD &&
    process.env.SQL_DB_NAME
  ) {
    const user = encodeURIComponent(process.env.SQL_USER);
    const password = encodeURIComponent(process.env.SQL_PASSWORD);
    const dbName = encodeURIComponent(process.env.SQL_DB_NAME);
    const host = encodeURIComponent(process.env.SQL_HOST);
    // Standard PostgreSQL connection URL for Cloud SQL UNIX sockets
    return `postgresql://${user}:${password}@localhost/${dbName}?host=${host}`;
  }

  const hasPostgresUrl = !!(
    process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith("postgresql://") || process.env.DATABASE_URL.startsWith("postgres://"))
  );

  if (hasPostgresUrl) {
    return process.env.DATABASE_URL!;
  }

  // Fallback to local SQLite DB path
  const devDbPath = path.join(process.cwd(), "prisma", "dev.db");
  return `file:${devDbPath}`;
};

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: getDatabaseUrl(),
    },
  },
});

