import { db } from "../lib/db";
import { projects, blogPosts } from "../lib/db/schema";
import { inArray, sql } from "drizzle-orm";

async function syncBlogProjects() {
  console.log("Starting sync...");

  const posts = await db.select({ projectId: blogPosts.projectId }).from(blogPosts);
  const projectIds = posts.map(p => p.projectId);

  if (projectIds.length > 0) {
    const res = await db.update(projects)
      .set({ isPublic: true })
      .where(inArray(projects.id, projectIds));
    console.log(`Updated projects to public. Count: ${projectIds.length}`);
  } else {
    console.log("No blog posts found.");
  }

  process.exit(0);
}

syncBlogProjects().catch(err => {
  console.error(err);
  process.exit(1);
});
