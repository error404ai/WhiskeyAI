import { z } from "zod";
import { TwitterApiErrorSchema, TwitterApiResponseSchema } from "../http/zodSchema/twitterSchema";

// Type for API error responses
export type TwitterApiError = {
  status: "error";
  code?: number;
  message: string;
  isRateLimit: boolean;
  errorDetails: string; // Stringified error details instead of the actual Error object
};

// Type for API success responses
export type TwitterApiSuccess = {
  status: "success";
  data: any;
};

// Type for all possible responses
export type TwitterResponse = TwitterApiSuccess | TwitterApiError;
