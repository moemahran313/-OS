import { PrismaClient } from "@prisma/client";
import path from "path";

const devDbPath = path.join(process.cwd(), "prisma", "dev.db");

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `file:${devDbPath}`,
    },
  },
});
