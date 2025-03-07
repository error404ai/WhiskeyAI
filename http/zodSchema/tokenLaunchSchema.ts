import { z } from "zod";

export const tokenLaunchSchema = z.object({
  file: z.instanceof(Blob).optional(),
  name: z.string().min(1, "Name is required and cannot be empty"),
  symbol: z.string().min(1, "Symbol is required and cannot be empty").toUpperCase(),
  description: z.string().min(1, "Description is required and cannot be empty"),
  twitter: z.string().url("Twitter must be a valid URL").optional(),
  telegram: z.string().url("Telegram must be a valid URL").optional(),
  website: z.string().url("Website must be a valid URL"),
  showName: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean()),
});
