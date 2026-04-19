import { auth } from "@/auth";
import { ProjectDashboard } from "@/components/projects/project-dashboard";
import { redirect } from "next/navigation";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <ProjectDashboard user={session.user} />
  );
}
