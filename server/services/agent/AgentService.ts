import { db } from "@/server/db/db";
import { agentsTable, agentTriggersTable } from "@/server/db/schema";
import { Agent, AgentPlatformList } from "@/server/db/schema/agentsTable";
import { usersTable } from "@/server/db/schema/usersTable";
import { agentCreateSchema } from "@/server/zodSchema/agentCreateSchema";
import { agentInformationSchema } from "@/server/zodSchema/agentInformationSchema";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import AuthService from "../auth/authService";
import UserService from "../userService";

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

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

    // Get user's max agents limit
    const userMaxAgents = await UserService.getUserMaxAgents(Number(userId));
    
    // Check agent limit against user's max_agents
    const currentAgentCount = await this.countUserAgents();

    if (currentAgentCount >= userMaxAgents) {
      throw new Error(`You have reached the maximum limit of ${userMaxAgents} agents. Please upgrade your plan to create more agents.`);
    }

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
    return db.query.agentsTable.findMany({
      where: eq(agentsTable.userId, Number(userId)),
      orderBy: agentsTable.id,
      with: {
        user: true,
        agentPlatforms: true,
      },
    });
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

  static async storeAgentTxLink(agentUuid: string, txLink: string, tokenAddress: string): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");
    const res = await db
      .update(agentsTable)
      .set({
        txLink: txLink,
        tokenAddress: tokenAddress,
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

    return !!res;
  }

  static async toggleAgentStatus(agentUuid: string): Promise<boolean> {
    const authUser = await AuthService.getAuthUser();
    if (!authUser) throw new Error("User not authenticated");

    const agent = await AgentService.getAgentByUuid(agentUuid);
    if (!agent) throw new Error("Agent not found");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");

    // If changing from paused to running, check payment status
    if (agent.status === "paused") {
      const hasPaid = await AgentService.hasUserPaidForAgents();
      if (!hasPaid) {
        throw new Error("Payment required to activate agent");
      }
    }

    // Toggle the status between 'running' and 'paused'
    const newStatus = agent.status === "running" ? "paused" : "running";

    const res = await db
      .update(agentsTable)
      .set({
        status: newStatus,
      })
      .where(eq(agentsTable.uuid, agentUuid));

    return !!res;
  }

  static async updateAgentTwitterCredentials(agentUuid: string, data: { clientId: string; clientSecret: string }): Promise<boolean> {
    const agent = await AgentService.getAgentByUuid(agentUuid);
    const authUser = await AuthService.getAuthUser();
    if (!agent || !authUser) throw new Error("User not authenticated");
    if (Number(authUser.id) !== agent.userId) throw new Error("User not authenticated");

    const res = await db
      .update(agentsTable)
      .set({
        twitterClientId: data.clientId,
        twitterClientSecret: data.clientSecret,
      })
      .where(eq(agentsTable.uuid, agentUuid));

    return !!res;
  }

  static async validateAgentReadiness(agentUuid: string): Promise<ValidationResult> {
    const errors: string[] = [];

    // Get complete agent data with platforms and triggers
    const agent = await AgentService.getAgentByUuid(agentUuid);

    if (!agent) {
      errors.push("Agent not found");
      return { isValid: false, errors };
    }

    // Check agent information
    if (!agent.information || !agent.information.description || !agent.information.goal) {
      errors.push("Agent information is incomplete. Please provide a description and goal in the Information tab.");
    }

    // Check for Twitter platform
    const twitterPlatform = agent.agentPlatforms?.find((platform) => platform.type === "twitter");
    if (!twitterPlatform) {
      errors.push("Twitter account is not connected. Please connect your Twitter account.");
    }

    // Check for Twitter client credentials
    if (!agent.twitterClientId || !agent.twitterClientSecret) {
      errors.push("Twitter client credentials are missing. Please provide your Twitter API client ID and client secret.");
    }

    // Check for triggers using separate query
    const triggers = await db.query.agentTriggersTable.findMany({
      where: eq(agentTriggersTable.agentId, agent.id),
    });

    if (!triggers || triggers.length === 0) {
      errors.push("No triggers have been set up. Please create at least one trigger in the Triggers tab.");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async hasUserPaidForAgents(): Promise<boolean> {
    const user = await AuthService.getAuthUser();
    if (!user) throw new Error("User not authenticated");

    const result = await db
      .select({
        hasPaidForAgents: usersTable.hasPaidForAgents,
        hasUnlimitedAccess: usersTable.has_unlimited_access,
      })
      .from(usersTable)
      .where(eq(usersTable.id, Number(user.id)))
      .limit(1);

    // Return true if user has paid or has unlimited access
    return result.length > 0 && (result[0].hasPaidForAgents || result[0].hasUnlimitedAccess);
  }

  static async markUserAsPaid(txSignature: string, amount: string): Promise<boolean | { error: string }> {
    const user = await AuthService.getAuthUser();
    if (!user) throw new Error("User not authenticated");

    // First verify the transaction on the Solana blockchain
    const { verifyPaymentTransaction } = await import("@/lib/solanaPaymentUtils");
    const verification = await verifyPaymentTransaction(txSignature);

    if (!verification.isValid) {
      return { error: verification.error || "Invalid transaction" };
    }

    // First, record payment info for the user's first agent
    try {
      // Find the user's first agent using db.query syntax
      const agent = await db.query.agentsTable.findFirst({
        where: eq(agentsTable.userId, Number(user.id)),
      });

      if (agent) {
        // Store payment info in the agent record
        await AgentService.storeAgentPaymentInfo(agent.id, txSignature, amount);
      }
    } catch (error) {
      console.error("Error storing payment info:", error);
      // Continue even if this fails, as marking the user as paid is more important
    }

    // Update user payment status
    const result = await db
      .update(usersTable)
      .set({ hasPaidForAgents: true })
      .where(eq(usersTable.id, Number(user.id)));

    return !!result;
  }

  static async countUserAgents(): Promise<number> {
    const user = await AuthService.getAuthUser();
    if (!user) throw new Error("User not authenticated");

    const result = await db
      .select({ count: count() })
      .from(agentsTable)
      .where(eq(agentsTable.userId, Number(user.id)));

    return result[0]?.count || 0;
  }

  static async storeAgentPaymentInfo(agentId: number, txSignature: string, amount: string): Promise<boolean> {
    const timestamp = new Date().toISOString();
    const result = await db
      .update(agentsTable)
      .set({
        paymentTxSignature: txSignature,
        paymentAmount: amount,
        paymentTimestamp: timestamp,
      })
      .where(eq(agentsTable.id, agentId));

    return !!result;
  }

  static async updateAgentTokenAddress(agentUuid: string, tokenAddress: string): Promise<boolean> {
    const result = await db.update(agentsTable).set({ tokenAddress }).where(eq(agentsTable.uuid, agentUuid));

    return !!result;
  }
  
  // Get user's max agents limit
  static async getUserMaxAgents(): Promise<number> {
    const user = await AuthService.getAuthUser();
    if (!user) throw new Error("User not authenticated");
    
    return await UserService.getUserMaxAgents(Number(user.id));
  }
}
