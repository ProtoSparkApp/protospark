"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components } from "@/lib/db/schema";
import { componentSchema } from "@/lib/validators";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addComponent(formData: any) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const validated = componentSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.insert(components).values({
      ...validated.data,
      userId: session.user.id!,
    });
    
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("DB Error:", error);
    return { error: "Database operation failed" };
  }
}

export async function getInventory(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const { page = 1, limit = 10, search, category } = params;
  const offset = (page - 1) * limit;

  let whereClause = eq(components.userId, session.user.id!);

  
  
  
  const data = await db.query.components.findMany({
    where: (components, { eq, and, like }) => {
        const userIdMatch = eq(components.userId, session.user.id!);
        const searchMatch = search ? like(components.name, `%${search}%`) : undefined;
        const categoryMatch = category ? eq(components.category, category as any) : undefined;
        
        return and(userIdMatch, searchMatch, categoryMatch);
    },
    limit,
    offset,
    orderBy: [desc(components.createdAt)],
  });

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(components)
    .where(eq(components.userId, session.user.id!))
    .then(res => Number(res[0].count));

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

export async function deleteComponent(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  try {
    await db.delete(components).where(
      and(
        eq(components.id, id),
        eq(components.userId, session.user.id!)
      )
    );
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { error: "Delete failed" };
  }
}
