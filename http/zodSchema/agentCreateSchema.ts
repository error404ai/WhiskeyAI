import { z } from "zod";

export const agentCreateSchema = z.object({
  name: z.string().nonempty({ message: "Name is required" }),
  tickerSymbol: z.string().nonempty({ message: "Ticker Symbol is required" }),
});
