"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { transporter } from "@/lib/mailer";
import { verificationTokens } from "@/lib/db/schema";
import { loginSchema, registerSchema, resetPasswordSchema } from "@/lib/validators";
import { getBrutalistEmailTemplate } from "@/lib/email-templates";

export async function login(values: any) {
  try {
    const validated = loginSchema.safeParse(values);
    if (!validated.success) {
      return { error: "Invalid input" };
    }

    await signIn("credentials", {
      ...validated.data,
      redirectTo: "/",
    });

  } catch (error: any) {
    if (error.message && error.message.includes("verify your email")) {
      return { error: "Please verify your email before logging in." };
    }
    if (error.type === "CredentialsSignin" || error.type === "CallbackRouteError") {
      return { error: "Invalid credentials or unverified email." };
    }
    throw error;
  }
}

export async function loginWithProvider(provider: "google") {
  await signIn(provider);
}

export async function register(values: any) {
  try {
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

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
    const verifyLink = `${baseUrl}/verify?token=${token}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "ProtoSpark - Verify your identity",
        html: getBrutalistEmailTemplate(
          "Verify Identity",
          "Welcome to ProtoSpark. Click the link below to verify your email address.",
          "Verify Email",
          verifyLink
        ),
      });
    } catch (mailError) {
      console.error("Failed to send verification email:", mailError);
      return { error: "Created account, but failed to send verification email. Please contact support or check SMTP settings." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { error: "Something went wrong during registration." };
  }
}

export async function verifyEmail(token: string) {
  try {
    if (!token) return { error: "Missing token" };

    const [vt] = await db.select().from(verificationTokens).where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    );

    if (!vt) return { error: "Invalid or expired token" };

    await db.update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.email, vt.identifier));

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.identifier, vt.identifier));

    return { success: true };
  } catch (error) {
    console.error("Verify email error:", error);
    return { error: "Something went wrong" };
  }
}

export async function logout() {
  await signOut();
}

export async function forgotPassword(email: string) {
  try {
    if (!email) {
      return { error: "Email is required" };
    }

    const [existingUser] = await db.select().from(users).where(eq(users.email, email));
    if (!existingUser) {
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60);

    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

    await db.insert(verificationTokens).values({
      identifier: email,
      token,
      expires,
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "ProtoSpark - Password Reset Sequence",
      html: getBrutalistEmailTemplate(
        "Reset Password",
        "Click the link below to reset your password (the link will expire in an hour):",
        "Change Password",
        resetLink
      ),
    });

    return { success: true };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong" };
  }
}

export async function resetPassword(token: string, password: string) {
  try {
    if (!token || !password) {
      return { error: "No token or password" };
    }

    const validated = resetPasswordSchema.safeParse({ password });
    if (!validated.success) {
      return { error: "Password is too weak" };
    }

    const [vt] = await db.select().from(verificationTokens).where(
      and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    );

    if (!vt) {
      return { error: "Invalid or expired token" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, vt.identifier));

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.identifier, vt.identifier));

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Something went wrong" };
  }
}
