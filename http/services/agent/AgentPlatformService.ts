import { db } from "@/db/db";
import { AgentPlatform, agentPlatformsTable, Credentials } from "@/db/schema";
import { eq } from "drizzle-orm";
import AuthService from "../auth/authService";
import { AgentService } from "./AgentService";

export class AgentPlatformService {
  static async getAgentPlatform(id: number) {
    return await db.query.agentPlatformsTable.findFirst({
      where: eq(agentPlatformsTable.id, id),
    });
  }
  static async getAgentPlatformsByAgentUuid(agentUuid: string): Promise<AgentPlatform[]> {
    const agentId = (await AgentService.getAgentByUuid(agentUuid))?.id;
    if (!agentId) throw new Error("Agent not found");
    return await db.query.agentPlatformsTable.findMany({
      where: eq(agentPlatformsTable.agentId, agentId),
    });
  }
  static async storeAgentPlatform(platform: Omit<AgentPlatform, "id">) {
    const userId = (await AuthService.getAuthUser())?.id;
    if (!userId) throw new Error("User not authenticated");
    return await db.insert(agentPlatformsTable).values({
      ...platform,
    });
  }

  static async deleteAgentPlatform(agentUuid: string, platformId: number): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const platform = await this.getAgentPlatform(platformId);
    if (platform?.id !== platformId) throw new Error("Platform not found");
    if (platform.agentId !== agent?.id) throw new Error("Platform not found");
    const res = await db.delete(agentPlatformsTable).where(eq(agentPlatformsTable.id, platformId));
    if (res) {
      return true;
    } else {
      return false;
    }
  }

  static async updatePlatformCredentials(platformId: number, credentials: Credentials) {
    return await db
      .update(agentPlatformsTable)
      .set({
        credentials,
      })
      .where(eq(agentPlatformsTable.id, platformId));
  }
}
