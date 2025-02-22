import { sql } from "drizzle-orm";
import { db } from "../db";

export const freshDb = async (): Promise<void> => {
  const query = sql<string>`SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE';
    `;

  const tables = await db.execute(query);
  for (const table of tables.rows) {
    const query = sql.raw(`TRUNCATE TABLE ${table.table_name} RESTART IDENTITY CASCADE;`);
    await db.execute(query);
  }
};
