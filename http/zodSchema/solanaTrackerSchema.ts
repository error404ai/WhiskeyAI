import { z } from "zod";

export const tokenHoldersSchema = z.object({
  tokenAddress: z.string().min(1, "Token address is required"),
});

export const tokenChartBaseSchema = z.object({
  token: z.string().min(1, "Token address is required"),
  type: z.enum(["1s", "5s", "15s", "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1mn"]).optional(),
  time_from: z.number().optional(),
  time_to: z.number().optional(),
});

export const tokenPriceSchema = z.object({
  token: z.string().min(1, "Token address is required"),
  priceChanges: z.boolean().optional(),
});

export const multiTokenPricesSchema = z.object({
  tokens: z.string().min(1, "Token addresses are required"),
  priceChanges: z.boolean().optional(),
});

export const walletTokensSchema = z.object({
  owner: z.string().min(1, "Wallet address is required"),
});

export const walletTradesSchema = z.object({
  owner: z.string().min(1, "Wallet address is required"),
  cursor: z.string().optional(),
});

export const tokenChartSchema = tokenChartBaseSchema.extend({
  marketCap: z.boolean().optional(),
  removeOutliers: z.boolean().optional(),
});

export const tokenPoolChartSchema = tokenChartSchema.extend({
  pool: z.string().min(1, "Pool address is required"),
});

export const tokenHoldersChartSchema = tokenChartBaseSchema;

export const firstBuyersSchema = z.object({
  token: z.string().min(1, "Token address is required"),
}); 