"use server";
import { redirect } from "next/navigation";
import { signIn, signOut } from "../../../auth";
import UserService from "@/server/services/userService";

export const login = async ({ publicKey, signature, message }: { publicKey: string; signature: string; message: string }): Promise<{success: boolean; message?: string}> => {
  try {
    // First check if the user exists and is active
    const user = await UserService.findUserByPublicKey(publicKey);
    if (user && user.is_active === false) {
      return { 
        success: false, 
        message: "Your account has been blocked. Please contact support for assistance." 
      };
    }

    // Proceed with authentication
    const result = await signIn("wallet-login", {
      redirect: false,
      publicKey,
      signature,
      message,
    });

    if (!result) {
      return { success: false, message: "Authentication failed. Please try again." };
    }

    return { success: true };
  } catch (error) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Authentication failed. Please try again." 
    };
  }
};

export const signUp = async (): Promise<string> => {
  return "test";
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
