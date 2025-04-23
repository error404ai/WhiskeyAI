import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./server/drizzle",
  schema: "./server/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  tablesFilter: ["!migrations"],

  migrations: {
    table: "migrations",
    schema: "public",
  },
});
