import { auth } from "@/auth";
import { getBlogPosts } from "@/lib/actions/social";
import { BlogFeed } from "@/components/social/blog-feed";
import { MessageSquare, Share2, Terminal, User, Calendar, Layers } from "lucide-react";
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
        <div className="lg:col-span-8">
          <BlogFeed posts={posts} sessionUser={session?.user} />
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
