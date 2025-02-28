import { relations } from "drizzle-orm";
import { integer, json, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { agentTriggersTable } from "./agentTriggersTable";
import { usersTable } from "./usersTable";

type Information = {
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

export const agentsTable = pgTable("agents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  uuid: uuid().notNull().defaultRandom().unique(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  tickerSymbol: varchar({ length: 255 }),
  information: json().$type<Information>(),
  triggers: json().$type<Trigger[]>(),
  status: varchar({ length: 255 }).notNull().$type<"running" | "paused" | "initial">(),
});

export const agentsRelations = relations(agentsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [agentsTable.userId],
    references: [usersTable.id],
  }),
  triggers: many(agentTriggersTable),
}));
