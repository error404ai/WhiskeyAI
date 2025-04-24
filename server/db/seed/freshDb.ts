import { sql } from "drizzle-orm";
import { db } from "../db";

(async () => {
  // Drop tables in public schema
  const publicTablesQuery = sql<{ table_name: string }>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `;

  const publicTables = await db.execute(publicTablesQuery);
  const publicTableNames = publicTables.rows.map((row) => row.table_name);

  console.log("Tables found in public schema:", publicTableNames);

  for (const tableName of publicTableNames) {
    const dropQuery = sql.raw(`DROP TABLE IF EXISTS "public"."${tableName}" CASCADE;`);
    try {
      await db.execute(dropQuery);
      console.log(`Successfully dropped table: ${tableName}`);
    } catch (error) {
      console.error(`Error dropping table ${tableName}:`, (error as Error).message);
    }
  }

  // Drop __drizzle_migrations table in drizzle schema
  const dropDrizzleMigrationsQuery = sql.raw(`DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE;`);
  try {
    await db.execute(dropDrizzleMigrationsQuery);
    console.log("Successfully dropped drizzle.__drizzle_migrations table");
  } catch (error) {
    console.error("Error dropping drizzle.__drizzle_migrations table:", (error as Error).message);
  }

  console.log("Database cleanup completed");
})();
