import { z } from "zod";

export const twitterCredentialsSchema = z.object({
  clientId: z.string().nonempty({ message: "Client ID is required" }),
  clientSecret: z.string().nonempty({ message: "Client Secret is required" }),
}); 