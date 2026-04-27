"use client";

import { useState, useMemo, useEffect } from "react";
import { BlogFeed } from "@/components/social/blog-feed";
import { User, Filter, X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { useRouter, useSearchParams } from "next/navigation";

interface BlogClientProps {
  initialPosts: any[];
  sessionUser?: any;
  topContributors?: any[];
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

export function BlogClient({ initialPosts, sessionUser, topContributors = [], pagination }: BlogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState<string | null>(searchParams.get("difficulty") || null);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    updateFilters(debouncedSearch, difficulty);
  }, [debouncedSearch]);

  const updateFilters = (newSearch?: string, newDifficulty?: string | null, page = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSearch !== undefined) {
      if (newSearch) params.set("search", newSearch);
      else params.delete("search");
    }
    if (newDifficulty !== undefined) {
      if (newDifficulty) params.set("difficulty", newDifficulty);
      else params.delete("difficulty");
    }
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const difficulties = ["Beginner", "Intermediate", "Advanced"];

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-8 w-full space-y-8">
        {initialPosts.length > 0 ? (
          <>
            <BlogFeed posts={initialPosts} sessionUser={sessionUser} />

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 border-t-4 border-black">
                <Button
                  variant="neo"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => updateFilters(undefined, undefined, pagination.currentPage - 1)}
                  className="size-12 p-0 border-4 border-black"
                >
                  <ChevronLeft />
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={pagination.currentPage === p ? "neo" : "ghost"}
                      onClick={() => updateFilters(undefined, undefined, p)}
                      className={`size-12 border-4 border-black font-black ${pagination.currentPage === p ? "bg-brand text-white" : "bg-white"
                        }`}
                    >
                      {p}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="neo"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => updateFilters(undefined, undefined, pagination.currentPage + 1)}
                  className="size-12 p-0 border-4 border-black"
                >
                  <ChevronRight />
                </Button>
              </div>
            )}
          </>
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && updateFilters(search)}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); updateFilters(""); }}
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
                    onClick={() => {
                      const next = difficulty === diff ? null : diff;
                      setDifficulty(next);
                      updateFilters(undefined, next);
                    }}
                    className={`border-2 border-black px-3 py-1.5 text-[10px] font-black uppercase transition-all ${difficulty === diff
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
                onClick={() => { setSearch(""); setDifficulty(null); updateFilters("", null); }}
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
            {topContributors.length > 0 ? (
              topContributors.map((user) => (
                <div key={user.id} className="flex items-center gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                  <div className="size-12 border-2 border-black bg-neutral-50 group-hover:bg-brand transition-colors flex items-center justify-center shadow-[2px_2px_0px_#000] overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="group-hover:text-white transition-colors" />
                    )}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase leading-none mb-1 group-hover:text-brand transition-colors">
                      {user.name || "ANONYMOUS_ENG"}
                    </p>
                    <p className="text-[9px] font-black text-black/40 uppercase">
                      {user.count} Deployments
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-[10px] font-bold text-black/20 uppercase text-center py-4">No data retrieved</p>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
