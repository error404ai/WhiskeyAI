import { z } from "zod";
import { TwitterApiErrorSchema, TwitterApiResponseSchema } from "../http/zodSchema/twitterSchema";

// Type for API error responses
export type TwitterApiError = z.infer<typeof TwitterApiErrorSchema>;

// Type for API success responses
export type TwitterApiResponse = z.infer<typeof TwitterApiResponseSchema>;

// Type for all possible responses
export type TwitterResponse = TwitterApiResponse | TwitterApiError;
