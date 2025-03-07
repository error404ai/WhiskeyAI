import { z } from "zod";

export const tokenLaunchSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1),
  description: z.string().min(1),
  twitter: z.string().url(),
  telegram: z.string().url(),
  website: z.string().url(),
  showName: z.union([z.string(), z.boolean()]).transform((value) => {
    if (typeof value === "string") return value.toLowerCase() === "true";
    return value;
  }),
});
