import { db } from "@/db/db";
import { agentsTable } from "@/db/schema";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import AuthService from "../authService";

export class AgentService {
  static async getAgent(agentUuid: string) {
    return await db.query.agentsTable.findFirst({
      where: eq(agentsTable.uuid, agentUuid),
    });
  }
  static async createAgent(data: z.infer<typeof agentCreateSchema>): Promise<boolean> {
    const userId = (await AuthService.getAuthUser())?.id;
    if (!userId) throw new Error("User not authenticated");
    const res = await db.insert(agentsTable).values({
      name: data.name,
      tickerSymbol: data.tickerSymbol,
      userId: Number(userId),
      status: "initial",
    });

    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async getAgents() {
    const userId = (await AuthService.getAuthUser())?.id;
    if (!userId) throw new Error("User not authenticated");
    return await db
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.userId, Number(userId)));
  }

  static async deleteAgent(agentId: number) {
    return await db.delete(agentsTable).where(eq(agentsTable.id, agentId));
  }
}
