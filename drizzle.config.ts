import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./server/drizzle",
  schema: "./db/schema",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: "migrations",
    schema: "public",
  },
});
