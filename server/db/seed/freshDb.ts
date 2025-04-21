import { sql } from "drizzle-orm";
import { db } from "../db";

export const freshDb = async (): Promise<void> => {
  // Fetch all tables in the public schema
  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

  const tables = await db.execute(query);
  console.log(
    "Tables found in public schema:",
    tables.rows.map((row) => row.table_name),
  );

  // Iterate over each table and truncate it
  for (const table of tables.rows) {
    const tableName = table.table_name;
    const truncateQuery = sql.raw(`TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE;`);
    try {
      await db.execute(truncateQuery);
      console.log(`Successfully truncated table: ${tableName}`);
    } catch (error) {
      console.error(`Error truncating table ${tableName}:`, (error as Error).message);
      // Optionally, decide whether to throw or continue
      // throw error; // Uncomment to stop on error
    }
  }
};
