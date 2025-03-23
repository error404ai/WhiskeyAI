/**
 * Dexscreener API response types
 */

// Type for API error responses
export type DexScreenerApiError = {
  status: "error";
  message: string;
  isRateLimit: boolean;
  errorDetails: string; // Stringified error details
};

// Type for API success responses
export type DexScreenerApiSuccess = {
  status: "success";
  data: any;
};

// Type for all possible responses
export type DexScreenerResponse = DexScreenerApiSuccess | DexScreenerApiError; 