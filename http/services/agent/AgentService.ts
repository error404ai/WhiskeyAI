import { db } from "@/db/db";
import { agentsTable } from "@/db/schema";
import { Agent, AgentPlatformList } from "@/db/schema/agentsTable";
import { agentCreateSchema } from "@/http/zodSchema/agentCreateSchema";
import { agentInformationSchema } from "@/http/zodSchema/agentInformationSchema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import AuthService from "../authService";

export class AgentService {
  static async getAgentById(agentId: number): Promise<Agent | undefined> {
    return await db.query.agentsTable.findFirst({
      where: eq(agentsTable.id, agentId),
    });
  }
  static async getAgentByUuid(agentUuid: string) {
    return await db.query.agentsTable.findFirst({
      where: eq(agentsTable.uuid, agentUuid),
      with: {
        user: true,
        agentPlatforms: true,
      },
    });
  }
  static async createAgent(data: z.infer<typeof agentCreateSchema>): Promise<boolean> {
    const userId = (await AuthService.getAuthUser())?.id;
    if (!userId) throw new Error("User not authenticated");
    const res = await db.insert(agentsTable).values({
      name: data.name,
      tickerSymbol: data.tickerSymbol,
      userId: Number(userId),
      status: "paused",
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

  static async saveAgentInformation(agentUuid: string, data: z.infer<typeof agentInformationSchema>): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    const res = await db
      .update(agentsTable)
      .set({
        information: data,
      })
      .where(eq(agentsTable.uuid, agentUuid));
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async storeAgentPlatformList(agentUuid: string, platformList: AgentPlatformList[]) {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    const res = await db
      .update(agentsTable)
      .set({
        agentPlatformList: platformList,
      })
      .where(eq(agentsTable.uuid, agentUuid));
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async storeAgentTxLink(agentUuid: string, txLink: string): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    const res = await db
      .update(agentsTable)
      .set({
        txLink: txLink,
      })
      .where(eq(agentsTable.uuid, agentUuid));
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async deployAgent(agentUuid: string): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    const res = await db
      .update(agentsTable)
      .set({
        status: "running",
      })
      .where(eq(agentsTable.uuid, agentUuid));
    if (res) {
      return true;
    } else {
      return false;
    }
  }
}
