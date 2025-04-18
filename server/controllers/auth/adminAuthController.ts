"use server";
import { signIn, signOut } from "../../../auth";
import { z } from "zod";
import { adminLoginSchema } from "@/server/zodSchema/adminLoginSchema";
import { redirect } from "next/navigation";

export const adminLogin = async (formData: z.infer<typeof adminLoginSchema>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { username, password } = formData;
    
    // Validate credentials against schema
    const validation = adminLoginSchema.safeParse({ username, password });
    
    if (!validation.success) {
      return { 
        success: false, 
        error: "Invalid credentials format" 
      };
    }
    
    // Attempt login
    const result = await signIn("admin-login", {
      redirect: false,
      username,
      password,
    });

    if (result?.error) {
      return { 
        success: false, 
        error: "Invalid username or password" 
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { 
      success: false, 
      error: "An unexpected error occurred" 
    };
  }
};

export const adminLogout = async (): Promise<void> => {
  await signOut();
  redirect("/admin/login");
}; 