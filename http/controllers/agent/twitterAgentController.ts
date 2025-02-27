"use server";
import { signIn } from "@/auth";

export const connectTwitter = async (): Promise<void> => {
  console.log("twttier connect called");
  signIn("twitter").catch((error) => console.log(error));
};
