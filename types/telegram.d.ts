export interface TelegramApiError {
  status: "error";
  message: string;
  errorDetails?: string;
}

export interface TelegramSuccess<T> {
  status: "success";
  data: T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TelegramResponse = TelegramApiError | TelegramSuccess<any>; 