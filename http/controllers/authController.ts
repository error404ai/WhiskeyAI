"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z, ZodError } from "zod";
import { signIn, signOut } from "../../auth";
import { db } from "../../db/db";
import { usersTable } from "../../db/schema";
import { makeHash } from "../../utils/utils";

export const login = async (email: string, password: string): Promise<string> => {
  try {
    return await signIn("credentials", { email, password, redirect: false });
  } catch {
    return new ZodError([{ code: "custom", message: "Login Failed. Please check your credentials", path: ["email"] }]).toString();
  }
};

export const signUp = async (): Promise<string> => {
  return 'test';
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
