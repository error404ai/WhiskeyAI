import { z } from "zod";

export const maxAgentsSchema = z.object({
  value: z.string().refine(
    (val) => {
      const num = parseInt(val, 10);
      return !isNaN(num) && num >= 0;
    },
    {
      message: "Maximum agents must be a zero or positive number",
    },
  ),
});

export type MaxAgentsInput = z.infer<typeof maxAgentsSchema>;
