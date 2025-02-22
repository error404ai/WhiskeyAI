"use server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z, ZodError } from "zod";
import { signIn, signOut } from "../../auth";
import { db } from "../../db/db";
import { usersTable } from "../../db/schema";
import { signupSchema } from "../../db/zodSchema/signupSchema";
import { makeHash } from "../../utils/utils";

export const login = async (email: string, password: string): Promise<string> => {
  try {
    return await signIn("credentials", { email, password, redirect: false });
  } catch {
    return new ZodError([{ code: "custom", message: "Login Failed. Please check your credentials", path: ["email"] }]).toString();
  }
};

export const signUp = async (data: z.infer<typeof signupSchema>): Promise<string> => {
  const result = signupSchema.parse(data);
  const email = result.email;
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (user) {
    return new ZodError([{ code: "custom", message: "User with this email already exists", path: ["email"] }]).toString();
  }

  const { password, ...signupUser } = data;
  await db.insert(usersTable).values({ ...signupUser, roleId: 2, password: await makeHash(password) });
  return await signIn("credentials", { email, password, redirect: false });
};

export const logout = async (): Promise<string> => {
  await signOut();
  return redirect("/login");
};
