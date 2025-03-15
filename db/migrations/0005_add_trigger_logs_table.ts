/* eslint-disable @typescript-eslint/no-explicit-any */
import { sql } from "drizzle-orm";

export async function up(db: any) {
  await db.execute(sql`
    CREATE TABLE trigger_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      agent_id INTEGER NOT NULL REFERENCES agents(id),
      trigger_id INTEGER NOT NULL REFERENCES agent_triggers(id),
      function_name TEXT NOT NULL,
      step TEXT NOT NULL,
      status TEXT NOT NULL,
      message TEXT,
      request_data JSONB,
      response_data JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      execution_time INTEGER,
      error_details TEXT,
      metadata JSONB
    );

    CREATE INDEX idx_trigger_logs_trigger_id ON trigger_logs (trigger_id);
    CREATE INDEX idx_trigger_logs_agent_id ON trigger_logs (agent_id);
    CREATE INDEX idx_trigger_logs_created_at ON trigger_logs (created_at);
    CREATE INDEX idx_trigger_logs_status ON trigger_logs (status);
  `);
}

export async function down(db: any) {
  await db.execute(sql`DROP TABLE IF EXISTS trigger_logs`);
} 