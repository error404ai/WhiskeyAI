/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldValues, UseFormSetError } from "react-hook-form";

export const setFormErrors = <TFieldValues extends FieldValues>(error: any, setError: UseFormSetError<TFieldValues>): boolean => {
  if (error && typeof error === "string") {
    try {
      const parsedError = JSON.parse(error);

      if (Array.isArray(parsedError) && parsedError.length > 0 && parsedError[0]?.code && parsedError[0]?.message && parsedError[0]?.path) {
        parsedError.forEach((err: any) => {
          if (err.path && err.message) {
            setError(err.path[0], { type: err.code, message: err.message });
          }
        });
      }
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};
