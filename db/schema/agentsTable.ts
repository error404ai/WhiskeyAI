import { relations } from "drizzle-orm";
import { integer, json, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { agentPlatformsTable } from "./agentPlatformsTable";
import { agentTriggersTable } from "./agentTriggersTable";
import { usersTable } from "./usersTable";

export type Information = {
  description?: string;
  goal?: string;
};

type Trigger = {
  basic: {
    name: string;
    description: string;
    triggerTime: number;
    runEvery: "minute" | "hour";
  };
  function: {
    name: string;
    informationSource: string;
  };
};

export type AgentPlatformList = {
  name: string;
  description: string;
  enabled: boolean;
};

export const agentsTable = pgTable("agents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().notNull().defaultRandom().unique(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  tickerSymbol: varchar({ length: 255 }),
  information: json().$type<Information>(),
  triggers: json().$type<Trigger[]>(),
  status: varchar({ length: 255 }).notNull().$type<"paused" | "running">(),
  agentPlatformList: json().$type<AgentPlatformList[]>(),
  txLink: varchar({ length: 255 }),
  twitterClientId: varchar({ length: 255 }),
  twitterClientSecret: varchar({ length: 255 }),
  // Payment tracking fields
  paymentTxSignature: varchar({ length: 255 }),
  paymentAmount: varchar({ length: 50 }),
  paymentTimestamp: varchar({ length: 255 }),
});

export type Agent = typeof agentsTable.$inferSelect;

export const agentsRelations = relations(agentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [agentsTable.userId],
    references: [usersTable.id],
  }),
  triggers: many(agentTriggersTable),
  agentPlatforms: many(agentPlatformsTable),
}));
