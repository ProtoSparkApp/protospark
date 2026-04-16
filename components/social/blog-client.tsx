"use client";

import { useState, useMemo } from "react";
import { BlogFeed } from "@/components/social/blog-feed";
import { User, Filter, X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";

interface BlogClientProps {
  initialPosts: any[];
  sessionUser?: any;
}

export function BlogClient({ initialPosts, sessionUser }: BlogClientProps) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string | null>(null);
  
  const debouncedSearch = useDebounce(search, 300);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((p) => {
      const matchesSearch = 
        p.post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.post.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.project.title.toLowerCase().includes(debouncedSearch.toLowerCase());
      
      const matchesDifficulty = !difficulty || p.project.difficulty === difficulty;
      
      return matchesSearch && matchesDifficulty;
    });
  }, [initialPosts, debouncedSearch, difficulty]);

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 w-full">
        {filteredPosts.length > 0 ? (
          <BlogFeed posts={filteredPosts} sessionUser={sessionUser} />
        ) : (
          <div className="p-20 border-4 border-black border-dashed text-center bg-white">
            <Search size={48} className="mx-auto mb-4 text-black/20" />
            <p className="font-black uppercase text-black/40">No records found matching your query.</p>
          </div>
        )}
      </div>

      <aside className="lg:col-span-4 w-full sticky top-8 space-y-6">
        <div className="border-4 border-black bg-white p-6 shadow-brutal space-y-6">
          <div className="flex items-center gap-2 border-b-2 border-black pb-2">
            <Filter size={18} />
            <span className="font-heading font-black uppercase tracking-tight">Filter Logs</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black uppercase text-black/50">Quick Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={14} />
                <Input
                  placeholder="Title or content..."
                  className="h-10 text-xs pl-9 pr-8 border-2 border-black rounded-none font-bold focus-visible:ring-0 focus-visible:border-brand"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-black uppercase text-black/50">Difficulty Grade</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(difficulty === diff ? null : diff)}
                    className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase transition-all ${
                      difficulty === diff
                        ? "bg-brand text-white shadow-[4px_4px_0px_#000] -translate-x-1 -translate-y-1"
                        : "bg-white hover:bg-neutral-50 shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {(search || difficulty) && (
              <Button
                variant="ghost"
                onClick={() => { setSearch(""); setDifficulty(null); }}
                className="w-full h-10 border-2 border-black rounded-none font-black uppercase text-[10px] hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                Clear Matrix Filters
              </Button>
            )}
          </div>
        </div>

        <div className="border-4 border-black bg-white p-6 shadow-brutal w-full">
          <h4 className="font-black uppercase text-xs mb-6 border-b-2 border-black pb-2 tracking-widest text-black/40 leading-none">
            Top Contributors
          </h4>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                <div className="size-12 border-2 border-black bg-neutral-50 group-hover:bg-brand transition-colors flex items-center justify-center shadow-[2px_2px_0px_#000]">
                  <User size={20} className="group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase leading-none mb-1 group-hover:text-brand transition-colors">
                    STATION_DECI_{i}82
                  </p>
                  <p className="text-[9px] font-black text-black/40 uppercase">
                    {15 - i * 2} Deployments
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
