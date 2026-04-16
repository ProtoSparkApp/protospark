import { auth } from "@/auth";
import { getBlogPosts } from "@/lib/actions/social";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { Newspaper, MessageSquare, Share2, Terminal, User, Calendar, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function BlogPage() {
  const posts = await getBlogPosts();
  const session = await auth();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-white border-b-4 border-black py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            <div className="size-20 bg-brand border-4 border-black flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <Terminal size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                Field <span className="text-brand">Logs</span>
              </h1>
              <p className="font-heading font-black uppercase text-sm text-black/40 mt-3 bg-black/5 inline-block px-2 py-1">
                Engineering reports and successful prototypes from the network
              </p>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-16">
          {posts.length === 0 ? (
            <div className="border-4 border-dashed border-black/10 p-24 text-center bg-white">
              <MessageSquare size={48} className="mx-auto mb-6 text-black/10" />
              <p className="font-black uppercase text-2xl text-black/20 italic tracking-tighter">
                The terminal is quiet. No transmissions detected.
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <article key={post.post.id} className="relative">
                <div className="flex items-start gap-6">
                  {/* Timeline decor */}
                  <div className="hidden md:flex flex-col items-center gap-4">
                    <div className="size-10 border-4 border-black bg-black flex items-center justify-center text-white shrink-0">
                      <Terminal size={16} />
                    </div>
                    <div className="w-1 flex-1 bg-black/10 min-h-[100px]" />
                  </div>

                  <div className="flex-1 space-y-8 bg-white border-4 border-black p-8 shadow-brutal">
                    <div className="flex items-center justify-between border-b-2 border-black border-dashed pb-6">
                      <div className="flex items-center gap-4">
                        <div className="size-10 border-2 border-black bg-neutral-100 flex items-center justify-center">
                          {post.author.image ? <img src={post.author.image} className="size-full object-cover" /> : <User size={18} />}
                        </div>
                        <div>
                          <h3 className="font-black uppercase text-sm leading-none">{post.author.name}</h3>
                          <p className="text-[10px] font-black uppercase text-black/40 mt-1">{post.post.createdAt.toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-2 border-black rounded-none font-black uppercase text-[10px] px-2">LOG_{post.post.id.slice(0, 4)}</Badge>
                    </div>

                    <div>
                      <h2 className="text-4xl font-black uppercase leading-none tracking-tighter mb-6">{post.post.title}</h2>
                      <p className="text-lg font-medium leading-relaxed uppercase text-black/60">{post.post.content}</p>
                    </div>

                    <div className="pt-8 border-t-2 border-black/5">
                      <div className="flex items-center gap-2 mb-4 font-black uppercase text-[10px] text-black/40 tracking-widest">
                        <Layers size={14} /> Attached Blueprint
                      </div>
                      <div className="max-w-md">
                        <CommunityProjectCard 
                          project={post.project} 
                          authorName={post.author.name || "MEMBER"}
                          authorImage={post.author.image || undefined}
                          showInventoryMatch={!!session?.user}
                        />
                      </div>
                    </div>

                    <div className="flex gap-6 border-t-2 border-black border-dashed pt-6">
                       <button className="flex items-center gap-2 font-black uppercase text-[10px] hover:text-brand transition-colors">
                         <MessageSquare size={14} /> Discuss
                       </button>
                       <button className="flex items-center gap-2 font-black uppercase text-[10px] hover:text-brand transition-colors">
                         <Share2 size={14} /> Broadcast
                       </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <div className="border-4 border-black bg-white p-8 shadow-brutal">
            <h4 className="font-black uppercase text-xs mb-6 border-b-2 border-black pb-2 tracking-widest text-black/40 leading-none">Top Contributors</h4>
            <div className="space-y-6">
               {[1,2,3].map(i => (
                 <div key={i} className="flex items-center gap-4 group cursor-pointer">
                   <div className="size-12 border-2 border-black bg-neutral-50 group-hover:bg-brand transition-colors flex items-center justify-center">
                     <User size={20} className="group-hover:text-white transition-colors" />
                   </div>
                   <div>
                     <p className="text-xs font-black uppercase leading-none mb-1">STATION_DECI_{i}82</p>
                     <p className="text-[10px] font-black text-black/40 uppercase">12 Deployments</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
