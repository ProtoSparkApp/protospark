import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { User, Shield, ShieldOff, Settings, Sparkles, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleProfilePrivacy } from "@/lib/actions/social";
import { revalidatePath } from "next/cache";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
  const myProjects = await db.select().from(projects).where(eq(projects.userId, session.user.id)).orderBy(desc(projects.createdAt));

  async function updateProfile(formData: FormData) {
    "use server";
    const isPublic = formData.get("isPublic") === "on";
    await toggleProfilePrivacy(isPublic);
    revalidatePath("/profile");
  }

  return (
    <div className="min-h-screen bg-[#f0f0f0] pb-20">
      <div className="bg-white border-b-4 border-black py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              {user.image ? (
                <img src={user.image} alt={user.name || ""} className="size-32 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] object-cover" />
              ) : (
                <div className="size-32 bg-brand border-4 border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <User size={48} className="text-white" />
                </div>
              )}
              <div className="absolute -bottom-2 -right-2 bg-yellow-300 border-2 border-black p-1">
                <Settings size={16} />
              </div>
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-2">
                {user.name}
              </h1>
              <p className="font-mono text-sm text-black/40 uppercase font-bold mb-4">{user.email}</p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <div className={`flex items-center gap-2 px-3 py-1 border-2 border-black font-black uppercase text-[10px] ${user.isPublicProfile ? "bg-green-400" : "bg-neutral-800 text-white"}`}>
                  {user.isPublicProfile ? <Shield size={12} /> : <ShieldOff size={12} />}
                  {user.isPublicProfile ? "Public Profile" : "Private Profile"}
                </div>
                <div className="flex items-center gap-2 px-3 py-1 border-2 border-black bg-white font-black uppercase text-[10px]">
                  <Layout size={12} />
                  {myProjects.length} Projects
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <section className="border-4 border-black bg-white p-6 shadow-brutal">
            <h2 className="text-xl font-black uppercase italic tracking-tight mb-6 flex items-center gap-2">
              <Settings size={20} /> Interaction Settings
            </h2>
            
            <form action={updateProfile} className="space-y-6">
              <div className="flex items-center justify-between p-4 border-2 border-black bg-neutral-50">
                <div>
                  <label className="font-heading font-black uppercase text-sm block">Public Visibility</label>
                  <p className="text-[10px] text-black/50 leading-tight uppercase font-bold">Allows others to see your projects and library</p>
                </div>
                <input 
                  type="checkbox" 
                  name="isPublic" 
                  defaultChecked={user.isPublicProfile} 
                  className="size-6 border-4 border-black rounded-none appearance-none checked:bg-brand cursor-pointer"
                />
              </div>

              <Button type="submit" variant="neo" className="w-full py-6 italic font-black">
                Save Changes
              </Button>
            </form>
          </section>

          <div className="border-4 border-black bg-yellow-300 p-6 shadow-brutal">
            <h3 className="font-black uppercase italic text-sm mb-2 flex items-center gap-2">
              <Sparkles size={16} /> Pro Tip
            </h3>
            <p className="text-xs font-bold uppercase leading-relaxed text-black/80">
              Private profiles work like Instagram. Only you can access your saved projects and community posts until you switch to Public.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-2">
           <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-2 bg-black" />
            <h2 className="text-3xl font-black uppercase italic tracking-tight">
              My Activity Feed
            </h2>
          </div>
          
          <div className="space-y-6">
            {myProjects.map(p => (
              <div key={p.id} className="border-4 border-black bg-white p-4 flex items-center justify-between hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-12 border-2 border-black bg-neutral-100 flex items-center justify-center shrink-0">
                    <Layout size={20} />
                  </div>
                  <div>
                    <h4 className="font-black uppercase italic leading-none">{p.title}</h4>
                    <span className="text-[10px] font-mono text-black/40 uppercase font-bold">Created {p.createdAt.toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`size-3 rounded-full border-2 border-black ${p.isPublic ? "bg-green-400" : "bg-neutral-200"}`} />
                  <span className="text-[10px] font-black uppercase tracking-tighter">{p.isPublic ? "Public" : "Draft"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
