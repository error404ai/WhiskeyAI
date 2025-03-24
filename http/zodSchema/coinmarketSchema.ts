import { z } from "zod";

export const trendingBaseSchema = z.object({
  limit: z.string().optional(),
  start: z.string().optional(),
  time_period: z.enum(["24h", "30d", "7d"]).optional(),
  convert: z.string().optional(),
  convert_id: z.string().optional(),
});

export const trendingGainersLosersSchema = trendingBaseSchema.extend({
  sort: z.enum(["percent_change_24h"]).optional(),
  sort_dir: z.enum(["asc", "desc"]).optional(),
});

export const quotesHistoricalSchema = z.object({
  id: z.string().min(1, "ID is required"),
  symbol: z.string().optional(),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  count: z.string().optional(),
  interval: z.enum([
    "yearly", "monthly", "weekly", "daily", "hourly",
    "5m", "10m", "15m", "30m", "45m",
    "1h", "2h", "3h", "4h", "6h", "12h",
    "24h", "1d", "2d", "3d", "7d", "14d", "15d",
    "30d", "60d", "90d", "365d"
  ]),
  convert: z.string().optional(),
  convert_id: z.string().optional(),
  aux: z.string().optional(),
  skip_invalid: z.boolean().optional(),
});

export const quotesLatestSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  symbol: z.string().optional(),
  convert: z.string().optional(),
  convert_id: z.string().optional(),
  aux: z.string().optional(),
  skip_invalid: z.boolean().optional(),
});

export const metadataSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  symbol: z.string().optional(),
  address: z.string().optional(),
  skip_invalid: z.boolean().optional(),
  aux: z.string().optional(),
}); 