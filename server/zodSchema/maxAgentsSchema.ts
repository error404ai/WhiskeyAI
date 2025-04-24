import { z } from "zod";

export const maxAgentsSchema = z.object({
  value: z.number()
    .int()
    .min(1, "Maximum agents must be at least 1")
    .max(100, "Maximum agents cannot exceed 100"),
});

export type MaxAgentsInput = z.infer<typeof maxAgentsSchema>; 