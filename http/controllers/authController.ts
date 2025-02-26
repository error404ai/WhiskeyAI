"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../../auth";

export const login = async ({ publicKey, signature, message }: { publicKey: string; signature: string; message: string }): Promise<boolean | string> => {
  try {
    await signIn("credentials", {
      redirect: false,
      publicKey,
      signature,
      message,
    });
    return true;
  } catch (error) {
    console.log(error);
    return String(error);
  }
};

export const signUp = async (): Promise<string> => {
  return "test";
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
