import { auth } from "@/auth";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { Header } from "@/components/header";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const id = params.id;

  const [project] = await db.select().from(projects).where(eq(projects.id, id));

  if (!project) return notFound();

  // Privacy check
  if (!project.isPublic && project.userId !== session?.user?.id) {
    redirect("/explore");
  }

  // Map to the format guide-viewer expects
  const idea = {
    title: project.title,
    description: project.description,
    difficulty: project.difficulty,
    requiredComponents: project.requiredComponents,
  };

  const guide = {
    instructions: project.instructions as any[],
    mermaidiagram: project.mermaidDiagram || "",
    safetyWarnings: [], // We don't store warnings yet, but could be added to schema
  };

  return (
    <>
      <ProjectFullGuide 
        idea={idea} 
        guide={guide} 
        onBack={() => redirect("/library")} 
        savedId={project.id}
        isOwner={project.userId === session?.user?.id}
        initialIsPublic={project.isPublic}
      />
    </>
  );
}
