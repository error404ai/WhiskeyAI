import { z } from "zod";

export const tokenMetadataSchema = z
  .object({
    launchType: z.enum(["no_token", "new_token", "existing_token"]), //state
    contractAddress: z.string().optional(),
    buyAmount: z.string().nonempty({ message: "Buy amount is required" }),
    file: z.any().refine((val) => val !== null && val !== undefined, {
      message: "File is required",
    }),
    name: z.string().min(1, "Name is required"),
    symbol: z.string().min(1, "Symbol is required"),
    description: z.string().min(1, "Description is required"),
    twitter: z.string().optional(),
    telegram: z.string().optional(),
    website: z.string().url("Website must be a valid URL"),
    tokenMint: z.string().optional(),
  })
  .refine((data) => data.launchType !== "existing_token" || data.tokenMint, {
    message: "Token Mint is required when launchType is 'existing_token'",
    path: ["tokenMint"],
  });
