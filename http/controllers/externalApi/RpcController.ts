"use server";

import quickNodeRpcService from "@/http/services/externalApi/QuickNodeRpcService";

// Define response type to match what the component expects
type RpcResponse = {
  status: "success" | "error";
  data?: unknown;
  message?: string;
  errorDetails?: string;
};

/**
 * Get account information for a Solana public key
 */
export async function getAccountInfo(publicKey: string): Promise<RpcResponse> {
  try {
    if (!publicKey) {
      return {
        status: "error",
        message: "Missing publicKey parameter",
      };
    }

    const accountInfo = await quickNodeRpcService.getAccountInfo(publicKey);
    return {
      status: "success",
      data: accountInfo,
    };
  } catch (error) {
    console.error("Error in getAccountInfo:", error);
    return {
      status: "error",
      message: `Error fetching account info: ${(error as Error).message}`,
      errorDetails: JSON.stringify(error),
    };
  }
}

/**
 * Get balance for a Solana public key
 */
export async function getBalance(publicKey: string): Promise<RpcResponse> {
  try {
    if (!publicKey) {
      return {
        status: "error",
        message: "Missing publicKey parameter",
      };
    }

    const balance = await quickNodeRpcService.getBalance(publicKey);
    return {
      status: "success",
      data: balance,
    };
  } catch (error) {
    console.error("Error in getBalance:", error);
    return {
      status: "error",
      message: `Error fetching balance: ${(error as Error).message}`,
      errorDetails: JSON.stringify(error),
    };
  }
}

/**
 * Get a block at the specified slot
 */
export async function getBlock(slot: number): Promise<RpcResponse> {
  try {
    if (isNaN(slot) || slot < 0) {
      return {
        status: "error",
        message: "Invalid slot parameter. Must be a non-negative number.",
      };
    }

    const block = await quickNodeRpcService.getBlock(slot);
    return {
      status: "success",
      data: block,
    };
  } catch (error) {
    console.error("Error in getBlock:", error);
    return {
      status: "error",
      message: `Error fetching block: ${(error as Error).message}`,
      errorDetails: JSON.stringify(error),
    };
  }
}
