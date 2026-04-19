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

  const { genericName, mpn, manufacturer, category, value, unit, quantity, metadata, description } = validated.data;

  try {
    const existingComponents = await db.query.components.findMany({
      where: eq(components.userId, userId),
    });

    const duplicate = existingComponents.find((c: any) => {
      if (mpn && c.mpn && mpn.trim().toLowerCase() === c.mpn.trim().toLowerCase()) {
        return true;
      }
      return c.genericName.toLowerCase() === genericName.toLowerCase() &&
        c.value === value &&
        c.unit === unit;
    });

    if (duplicate) {
      if (!force) {
        return {
          requiresConfirmation: true,
          similar: [duplicate],
          message: `Component (${genericName} ${mpn || ""}) is already in inventory. Do you want to update its stock?`
        };
      } else {
        await db.update(components)
          .set({
            quantity: (duplicate.quantity || 0) + Number(quantity),
            updatedAt: new Date()
          })
          .where(eq(components.id, duplicate.id));

        revalidatePath("/inventory");
        return { success: true };
      }
    }

    await db.insert(components).values({
      userId,
      genericName,
      mpn: mpn || null,
      manufacturer: manufacturer || null,
      category,
      value,
      unit,
      quantity: Number(quantity),
      metadata: metadata || {},
      description: description || null,
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

  const data = await db.query.components.findMany({
    where: (comp: any, { eq, and, like, or }: any) => {
      const userIdMatch = eq(comp.userId, userId);
      const searchMatch = search ? or(like(comp.genericName, `%${search}%`), like(comp.mpn, `%${search}%`)) : undefined;
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
