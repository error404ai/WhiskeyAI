import { z } from "zod";

// Define a standard error response schema
export const DexScreenerApiErrorSchema = z.object({
  status: z.literal("error"),
  message: z.string(),
  isRateLimit: z.boolean().default(false),
  errorDetails: z.string().optional(),
});

// Define a standard success response schema
export const DexScreenerApiResponseSchema = z.object({
  status: z.literal("success"),
  data: z.any(),
});

// Form validation schemas
export const tokenOrdersSchema = z.object({
  chainId: z.string().min(1, "Chain ID is required"),
  tokenAddress: z.string().min(1, "Token address is required"),
});

export const pairsByChainAndPairAddressSchema = z.object({
  chainId: z.string().min(1, "Chain ID is required"),
  pairId: z.string().min(1, "Pair ID is required"),
});

export const searchPairsSchema = z.object({
  query: z.string().min(1, "Search query is required"),
});

export const tokenPairsSchema = z.object({
  chainId: z.string().min(1, "Chain ID is required"),
  tokenAddress: z.string().min(1, "Token address is required"),
});

export const tokensByAddressSchema = z.object({
  chainId: z.string().min(1, "Chain ID is required"),
  tokenAddresses: z.string().min(1, "Token addresses are required"),
}); 