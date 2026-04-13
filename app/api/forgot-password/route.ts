import { transporter } from "@/lib/mailer";
import crypto from "crypto";
import { db } from "@/lib/db";
import { verificationTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email)
    });

    if (!existingUser) {

      return Response.json({ message: "Email sent" });
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
      subject: "Reset password in the service",
      html: `
        <h2>Reset password</h2>
        <p>Click the link below to reset your password (the link will expire in an hour):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    return Response.json({ message: "Email sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
