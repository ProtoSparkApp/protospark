"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components } from "@/lib/db/schema";
import { componentSchema } from "@/lib/validators";
import { eq, and, desc, sql, like } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { findSimilarStrings } from "@/lib/utils/string-similarity";

export type InventoryActionResponse =
  | { success: true; error?: never; requiresConfirmation?: never }
  | { error: string | Record<string, string[] | undefined>; success?: never; requiresConfirmation?: never }
  | { requiresConfirmation: true; similar: any[]; message: string; success?: never; error?: never };


export async function updateComponent(id: string, formData: any): Promise<InventoryActionResponse> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;


  const validated = componentSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    await db.update(components)
      .set(validated.data)
      .where(
        and(
          eq(components.id, id),
          eq(components.userId, userId)
        )
      );

    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    console.error("DB Error:", error);
    return { error: "Update failed" };
  }
}

export async function addComponent(formData: any, force = false): Promise<InventoryActionResponse> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;


  const validated = componentSchema.safeParse(formData);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  try {
    const existingComponents = await db.query.components.findMany({
      where: eq(components.userId, userId),
      columns: { id: true, name: true, category: true, value: true, unit: true, quantity: true }
    });

    const existingNames = existingComponents.map((c: any) => c.name as string);
    const directMatch = existingNames.find((n: string) => n.toLowerCase() === validated.data.name.toLowerCase());

    if (!directMatch && !force) {
      const similarNames = findSimilarStrings(validated.data.name, existingNames);
      if (similarNames.length > 0) {
        const similar = existingComponents.filter((c: any) => similarNames.includes(c.name));

        return {
          requiresConfirmation: true,
          similar,
          message: `The item "${validated.data.name}" doesn't exist yet, but there are similar items. Do you want to add it anyway?`
        };
      } else if (existingNames.length > 0) {
        return {
          requiresConfirmation: true,
          similar: [],
          message: `"${validated.data.name}" is a new item name. Are you sure you want to add it?`
        };
      }
    }

    await db.insert(components).values({
      ...validated.data,
      userId: userId,
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
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;


  const { page = 1, limit = 10, search, category } = params;
  const offset = (page - 1) * limit;

  let whereClause = eq(components.userId, userId);





  const data = await db.query.components.findMany({
    where: (comp: any, { eq, and, like }: any) => {
      const userIdMatch = eq(comp.userId, userId);
      const searchMatch = search ? like(comp.name, `%${search}%`) : undefined;
      const categoryMatch = category ? eq(comp.category, category as any) : undefined;

      return and(userIdMatch, searchMatch, categoryMatch);
    },
    limit,
    offset,
    orderBy: [desc(components.createdAt)],
  });

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(components)
    .where(eq(components.userId, userId))
    .then((res: any) => Number(res[0].count));

  return {
    data,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page
  };
}

export async function deleteComponent(id: string): Promise<InventoryActionResponse> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  try {
    await db.delete(components).where(
      and(
        eq(components.id, id),
        eq(components.userId, userId)
      )
    );
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    return { error: "Delete failed" };
  }
}
