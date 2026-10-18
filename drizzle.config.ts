import "dotenv/config";
import type { Config } from "drizzle-kit";

/**
 * Drizzle CLI config.
 *
 * The connection string comes from the environment, never from this file, so
 * `npx drizzle-kit push` can never accidentally target a hardcoded localhost
 * database. Locally, put the string in `.env`; on CI, export it as an env var.
 *
 * Accepts the same variable names the app does, because hosting integrations
 * do not agree on which one they set.
 */
const CONNECTION_VARS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_PRISMA_URL",
  "POSTGRES_URL_NON_POOLING",
  "NEON_DATABASE_URL",
] as const;

function connectionString(): string {
  for (const name of CONNECTION_VARS) {
    const value = process.env[name];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }

  throw new Error(
    [
      "No database connection string found.",
      "",
      "PowerShell:",
      '  $env:DATABASE_URL = "postgresql://user:password@host:5432/dbname"',
      "  npx drizzle-kit push",
      "",
      "Or put DATABASE_URL=... in a .env file at the project root.",
    ].join("\n"),
  );
}

export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url: connectionString() },
} satisfies Config;
