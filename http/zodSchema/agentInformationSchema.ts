import { z } from "zod";

export const agentInformationSchema = z.object({
  description: z.string().nonempty({ message: "Description is required" }),
  goal: z.string().nonempty({ message: "Goal is required" }),
});
