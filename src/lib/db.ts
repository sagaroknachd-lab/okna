import { PrismaClient } from "@prisma/client";

// A single shared PrismaClient. In dev, Next.js hot-reload re-imports modules
// repeatedly; without this global cache we'd open a new connection pool on
// every reload and exhaust SQLite. In prod a single instance is created once.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
