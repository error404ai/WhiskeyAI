"use server";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { signIn, signOut } from "../../auth";

export const login = async ({ publicKey, signature, message }: { publicKey: string; signature: string; message: string }): Promise<string> => {
  try {
    await signIn("credentials", {
      redirect: false,
      publicKey,
      signature,
      message,
    });
    return "/dashboard";
  } catch (error) {
    console.log(error);
    return new ZodError([{ code: "custom", message: "Something went wrong", path: ["credentials"] }]).toString();
  }
};

export const signUp = async (): Promise<string> => {
  return "test";
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
