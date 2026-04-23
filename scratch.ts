import { db } from "./lib/db";
import { projects, savedProjects } from "./lib/db/schema";
import { sql } from "drizzle-orm";

async function run() {
  const query = db.select({
    id: projects.id,
    saveCount: sql<number>`(SELECT count(*) FROM ${savedProjects} WHERE ${savedProjects.projectId} = ${projects.id})`,
  }).from(projects).limit(1);
  
  console.log("SQL:", query.toSQL());
  process.exit(0);
}
run();
