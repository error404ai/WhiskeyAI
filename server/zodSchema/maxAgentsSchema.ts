import { z } from "zod";

export const maxAgentsSchema = z.object({
  value: z.number().int().min(0, "Maximum agents must be a zero or positive number"),
});

export type MaxAgentsInput = z.infer<typeof maxAgentsSchema>;
