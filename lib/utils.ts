import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getIntendedRoute(request: Request) {
  const url = new URL(request.url);

  if (process.env.NODE_ENV === "production") {
    url.port = "";
  }
  url.host = new URL(process.env.APP_URL!).host;

  return url.toString();
}
