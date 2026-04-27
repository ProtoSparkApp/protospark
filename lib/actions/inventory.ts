"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components } from "@/lib/db/schema";
import { componentSchema } from "@/lib/validators";
import { eq, and, or, desc, sql, like } from "drizzle-orm";
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
    const duplicateQuery = mpn
      ? or(
        eq(components.mpn, mpn),
        and(
          eq(components.genericName, genericName),
          eq(components.value, value),
          eq(components.unit, unit)
        )
      )
      : and(
        eq(components.genericName, genericName),
        eq(components.value, value),
        eq(components.unit, unit)
      );

    const duplicate = await db.query.components.findFirst({
      where: and(eq(components.userId, userId), duplicateQuery)
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

    if (!force) {
      const { levenshteinDistance } = await import("@/lib/utils/string-similarity");

      const searchPool = await db.query.components.findMany({
        where: and(
          eq(components.userId, userId),
          eq(components.category, category)
        ),
        limit: 50
      });

      const similarItems = searchPool.filter((c: any) => {
        if (mpn && c.mpn) {
          const dist = levenshteinDistance(mpn.trim().toLowerCase(), c.mpn.trim().toLowerCase());
          if (dist > 0 && dist <= 2) return true;
        }

        const nameDist = levenshteinDistance(genericName.toLowerCase(), c.genericName.toLowerCase());
        if (nameDist > 0 && nameDist <= 2) {
          return c.value === value && c.unit === unit;
        }

        return false;
      });

      if (similarItems.length > 0) {
        return {
          requiresConfirmation: true,
          similar: similarItems,
          message: `Found ${similarItems.length} similar item(s) in your category. Did you mean one of these?`
        };
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
    totalPages: Math.max(1, Math.ceil(total / limit)),
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

export async function exportInventory() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const data = await db.query.components.findMany({
    where: eq(components.userId, userId),
    columns: {
      id: false,
      userId: false,
      metadata: false,
      updatedAt: false,
    },
    orderBy: [desc(components.createdAt)],
  });

  return data;
}
