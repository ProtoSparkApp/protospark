import { auth } from "@/auth";
import { getUserLibrary } from "@/lib/actions/social";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { redirect } from "next/navigation";
import { Layers, Bookmark, FolderHeart, Sparkles } from "lucide-react";

export default async function LibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const library = await getUserLibrary();
  if (!library || Array.isArray(library)) {
  }

  const mine = "mine" in library ? library.mine : [];
  const bookmarked = "bookmarked" in library ? library.bookmarked : [];

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-20">
      <div className="bg-white border-b-4 border-black py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-16 bg-brand border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <FolderHeart size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none">
                Project <span className="text-brand">Library</span>
              </h1>
              <p className="font-heading font-bold uppercase text-xs text-black/60 mt-2">
                Your personal vault of blueprints and saved community projects
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-12">
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-2 bg-black" />
            <h2 className="text-3xl font-black uppercase italic tracking-tight">
              My Blueprints <span className="text-lg opacity-40 ml-2">({mine.length})</span>
            </h2>
          </div>

          {mine.length === 0 ? (
            <div className="border-4 border-dashed border-black/20 p-12 text-center bg-white">
              <Sparkles size={48} className="mx-auto mb-4 text-black/20" />
              <p className="font-heading font-black uppercase text-xl text-black/40">
                Silence in the lab... Generate some projects first!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {mine.map((project) => (
                <CommunityProjectCard
                  key={project.id}
                  project={project}
                  authorName={session.user?.name || "Me"}
                  authorImage={session.user?.image || undefined}
                  showInventoryMatch={true}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-2 bg-brand" />
            <h2 className="text-3xl font-black uppercase italic tracking-tight">
              Saved community <span className="text-lg opacity-40 ml-2">({bookmarked.length})</span>
            </h2>
          </div>

          {bookmarked.length === 0 ? (
            <div className="border-4 border-dashed border-black/20 p-12 text-center bg-white">
              <Bookmark size={48} className="mx-auto mb-4 text-black/20" />
              <p className="font-heading font-black uppercase text-xl text-black/40">
                No archived projects yet. Explore the community!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookmarked.map((project) => (
                <CommunityProjectCard
                  key={project.id}
                  project={project}
                  isBookmarked={true}
                  showInventoryMatch={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
