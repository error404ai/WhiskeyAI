import { z } from "zod";

export const agentTriggerCreateSchema = z.object({
  agentUuid: z.string().nonempty({ message: "Agent ID is required" }),
  name: z.string().nonempty({ message: "Name is required" }),
  description: z.string().nonempty({ message: "Description is required" }),
  interval: z.union([z.string(), z.number()]).refine(
    (value) => {
      const numberValue = typeof value === "string" ? parseFloat(value) : value;
      return Number.isInteger(numberValue) && numberValue > 0;
    },
    { message: "Interval must be a positive integer" },
  ),
  runEvery: z.enum(["minutes", "hours", "days"]),
  functionName: z.string().nonempty({ message: "Function Name is required" }),
  informationSource: z.string().nonempty({ message: "Information Source is required" }),
});
