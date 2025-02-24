"use server";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { signIn, signOut } from "../../auth";

export const login = async ({ publicKey, signature, message }: { publicKey: string; signature: string; message: string }): Promise<string> => {
  try {
    return await signIn("credentials", {
      redirect: false,
      publicKey,
      signature,
      message,
    });
  } catch {
    return new ZodError([{ code: "custom", message: "Login Failed. Please check your credentials", path: ["credentials"] }]).toString();
  }
};

export const signUp = async (): Promise<string> => {
  return "test";
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
