"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects, savedProjects, blogPosts, users, components } from "@/lib/db/schema";
import { eq, and, ne, sql, desc, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleProfilePrivacy(isPublic: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(users)
    .set({ isPublicProfile: isPublic })
    .where(eq(users.id, session.user.id));

  revalidatePath("/profile");
  return { success: true };
}

export async function getExploreProjects() {
  const session = await auth();
  const userId = session?.user?.id;

  // Get public projects from users with public profiles
  const results = await db.select({
    project: projects,
    userName: users.name,
    userImage: users.image,
    isBookmarked: userId 
      ? sql<boolean>`EXISTS(SELECT 1 FROM ${savedProjects} WHERE ${savedProjects.projectId} = ${projects.id} AND ${savedProjects.userId} = ${userId})`
      : sql<boolean>`false`
  })
    .from(projects)
    .innerJoin(users, eq(projects.userId, users.id))
    .where(
      and(
        eq(projects.isPublic, true),
        eq(users.isPublicProfile, true),
        userId ? ne(projects.userId, userId) : undefined
      )
    )
    .orderBy(desc(projects.createdAt))
    .limit(20);

  return results;
}

export async function bookmarkProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Login required" };

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (project?.userId === session.user.id) {
    return { error: "You cannot bookmark your own project" };
  }

  try {
    await db.insert(savedProjects).values({
      userId: session.user.id,
      projectId,
    });
    revalidatePath("/projects");
    return { success: true };
  } catch (error) {
    await db.delete(savedProjects).where(
      and(
        eq(savedProjects.userId, session.user.id),
        eq(savedProjects.projectId, projectId)
      )
    );
    revalidatePath("/projects");
    return { success: "removed" };
  }
}

export async function cloneProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Login required" };

  const [original] = await db.select().from(projects).where(eq(projects.id, projectId));
  if (!original) return { error: "Project not found" };

  if (original.userId === session.user.id) {
    return { error: "You cannot clone your own project" };
  }

  const [cloned] = await db.insert(projects).values({
    userId: session.user.id,
    title: `${original.title} (Clone)`,
    description: original.description,
    instructions: original.instructions,
    mermaidDiagram: original.mermaidDiagram,
    schematicUrl: original.schematicUrl,
    requiredComponents: original.requiredComponents,
    difficulty: original.difficulty,
    isPublic: false,
    clonedFromId: original.id,
  }).returning();

  revalidatePath("/projects");
  return { success: true, project: cloned };
}

export async function createBlogPost(data: { projectId: string; title: string; content: string; images?: string[] }) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const [post] = await db.insert(blogPosts).values({
    userId: session.user.id,
    projectId: data.projectId,
    title: data.title,
    content: data.content,
    images: data.images || [],
  }).returning();

  revalidatePath("/blog");
  return { success: true, post };
}

export async function getBlogPosts() {
  const session = await auth();
  const userId = session?.user?.id;

  const results = await db.select({
    post: blogPosts,
    project: projects,
    author: users,
    isBookmarked: userId 
      ? sql<boolean>`EXISTS(SELECT 1 FROM ${savedProjects} WHERE ${savedProjects.projectId} = ${projects.id} AND ${savedProjects.userId} = ${userId})`
      : sql<boolean>`false`
  })
    .from(blogPosts)
    .innerJoin(projects, eq(blogPosts.projectId, projects.id))
    .innerJoin(users, eq(blogPosts.userId, users.id))
    .where(eq(users.isPublicProfile, true))
    .orderBy(desc(blogPosts.createdAt));

  return results;
}

export async function getUserLibrary() {
  const session = await auth();
  if (!session?.user?.id) return { mine: [], bookmarked: [] };

  const myProjects = await db.select().from(projects).where(eq(projects.userId, session.user.id)).orderBy(desc(projects.createdAt));

  const bookmarked = await db.select({
    project: projects,
  })
    .from(savedProjects)
    .innerJoin(projects, eq(savedProjects.projectId, projects.id))
    .where(eq(savedProjects.userId, session.user.id))
    .orderBy(desc(savedProjects.createdAt));

  return {
    mine: myProjects,
    bookmarked: bookmarked.map((b: any) => b.project),
  };
}

export async function checkInventoryForProject(requiredComponents: any[]) {
  const session = await auth();
  if (!session?.user?.id) return { status: [], partsCountInStock: 0, partsCountMissing: requiredComponents?.length || 0, canBuild: false };

  const userInventory = await db.select().from(components).where(eq(components.userId, session.user.id));

  const normalize = (s: string) => s?.trim().toLowerCase().replace(/\s+/g, '');

  const status = requiredComponents.map(req => {
    const found = userInventory.find((inv: any) => {
      const invName = normalize(inv.genericName);
      const invValue = normalize(inv.value);
      const invUnit = normalize(inv.unit === 'None' ? '' : inv.unit);
      const invCategory = normalize(inv.category || "");
      const invMpn = normalize(inv.mpn || "");
      
      const reqName = normalize(req.name);
      const reqValue = normalize(req.value);

      // 1. Check for name/category/mpn match
      const baseNameMatch = 
        invName === reqName || 
        reqName.includes(invName) || 
        invName.includes(reqName) ||
        invCategory.includes(reqName) ||
        reqName.includes(invCategory) ||
        invMpn.includes(reqName) ||
        reqName.includes(invMpn);

      // 2. Check for value match
      const baseValueMatch = 
        reqValue === invValue || 
        reqValue === (invValue + invUnit) || 
        (invValue !== "" && reqValue.includes(invValue)) ||
        (reqValue !== "" && invValue.includes(reqValue));

      // 3. Fallback: Cross-match (sometimes AI swaps name/value or combines them)
      const fullInv = invName + invValue + invUnit + invCategory + invMpn;
      const fullReq = reqName + reqValue;
      
      const crossMatch = fullInv.includes(reqName) || fullReq.includes(invName);

      return (baseNameMatch && baseValueMatch) || crossMatch;
    });

    const hasEnough = found ? found.quantity >= req.quantity : false;

    return {
      ...req,
      inventoryQuantity: found?.quantity || 0,
      status: hasEnough ? "In Stock" : "Need to Buy"
    };
  });

  const partsCountInStock = status.filter(s => s.status === "In Stock").length;
  const partsCountMissing = status.length - partsCountInStock;

  return {
    status,
    partsCountInStock,
    partsCountMissing,
    canBuild: partsCountMissing === 0
  };
}

export async function searchUsers(query: string) {
  if (!query) return [];

  const results = await db.select({
    id: users.id,
    name: users.name,
    image: users.image,
    bio: users.bio,
  })
    .from(users)
    .where(
      and(
        eq(users.isPublicProfile, true),
        sql`${users.name} ILIKE ${`%${query}%`}`
      )
    )
    .limit(10);

  return results;
}

export async function getPublicProfile(userId: string) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const [user] = await db.select().from(users).where(and(eq(users.id, userId), eq(users.isPublicProfile, true)));
  if (!user) return null;

  const publicProjects = await db.select({
    project: projects,
    isBookmarked: currentUserId 
      ? sql<boolean>`EXISTS(SELECT 1 FROM ${savedProjects} WHERE ${savedProjects.projectId} = ${projects.id} AND ${savedProjects.userId} = ${currentUserId})`
      : sql<boolean>`false`
  })
    .from(projects)
    .where(and(eq(projects.userId, userId), eq(projects.isPublic, true)))
    .orderBy(desc(projects.createdAt));

  return {
    user,
    projects: publicProjects,
  };
}

export async function getExploreFeed() {
  // Get recent public profiles with at least one public project
  const recentProfiles = await db.select({
    user: users,
    projectCount: sql<number>`count(${projects.id})`,
  })
    .from(users)
    .innerJoin(projects, eq(users.id, projects.userId))
    .where(
      and(
        eq(users.isPublicProfile, true),
        eq(projects.isPublic, true)
      )
    )
    .groupBy(users.id)
    .orderBy(desc(users.id))
    .limit(10);

  return recentProfiles;
}
