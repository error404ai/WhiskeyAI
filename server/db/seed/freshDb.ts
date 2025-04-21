import { sql } from "drizzle-orm";
import { db } from "../db";

(async () => {
  const query = sql<{ table_name: string }>`SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
  `;

  const tables = await db.execute(query);
  const tableNames = tables.rows.map((row) => row.table_name);

  console.log("Tables found in public schema:", tableNames);

  for (const tableName of tableNames) {
    const dropQuery = sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
    try {
      await db.execute(dropQuery);
      console.log(`Successfully dropped table: ${tableName}`);
    } catch (error) {
      console.error(`Error dropping table ${tableName}:`, (error as Error).message);
    }
  }
})();
