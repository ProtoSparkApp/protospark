"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { registerSchema } from "@/lib/validators";

export async function login(values: any) {
  try {
    await signIn("credentials", {
      ...values,
      redirectTo: "/",
    });
  } catch (error: any) {
    if (error.type === "CredentialsSignin") {
       return { error: "Invalid credentials" };
    }
    throw error;
  }
}

export async function loginWithProvider(provider: "google" | "github") {
  await signIn(provider);
}

export async function register(values: any) {
  const validated = registerSchema.safeParse(values);
  
  if (!validated.success) {
    return { error: "Invalid input" };
  }

  const { email, password, name } = validated.data;
  
  const [existingUser] = await db.select().from(users).where(eq(users.email, email));
  if (existingUser) {
    return { error: "Email already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
}

export async function logout() {
  await signOut();
}
