import bcrypt from "bcrypt";
import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return Response.json({ error: "No token or password" }, { status: 400 });
    }

    const vt = await db.query.verificationTokens.findFirst({
      where: and(
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date())
      )
    });

    if (!vt) {
      return Response.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.email, vt.identifier));

    await db.delete(verificationTokens)
      .where(eq(verificationTokens.identifier, vt.identifier));

    return Response.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
