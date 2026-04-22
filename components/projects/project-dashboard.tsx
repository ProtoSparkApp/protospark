"use client";

import { useState, useEffect } from "react";
import ProjectGenerator from "./project-generator";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { getUserLibrary } from "@/lib/actions/social";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { Sparkles, Folder, Bookmark, Plus, LayoutGrid, List, Search, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function ProjectDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"generate" | "mine" | "saved">("mine");
  const [library, setLibrary] = useState<{ mine: any[]; bookmarked: any[]; totalMine: number; totalBookmarked: number }>({
    mine: [],
    bookmarked: [],
    totalMine: 0,
    totalBookmarked: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [difficulty, setDifficulty] = useState("All");
  const [page, setPage] = useState(1);
  const limit = 6;

  useEffect(() => {
    setLoading(true);
    getUserLibrary({
      search: debouncedSearch,
      difficulty,
      page,
      limit
    }).then(res => {
      setLibrary(res as any);
      setLoading(false);
    });
  }, [activeTab, debouncedSearch, difficulty, page]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch, difficulty]);

  const totalCount = activeTab === "mine" ? library.totalMine : library.totalBookmarked;
  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
                Project <br />
                <span className="text-brand">Workspace</span>
              </h1>
              <p className="font-medium text-xl max-w-md">
                From automated blueprints to community-sourced schematics. Build, save, and iterate.
              </p>
            </div>


            <div className="flex flex-col gap-4">
              {activeTab !== "generate" && !selectedProject && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 border-4 border-black shadow-brutal"
                >
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                    <Input
                      placeholder="Search by title..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 border-2 border-black rounded-none h-12 font-bold focus-visible:ring-0 focus-visible:border-brand transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto">

                    <Select
                      value={difficulty}
                      onValueChange={setDifficulty}
                    >
                      <SelectTrigger className="w-full max-w-48">
                        <SelectValue placeholder="Select a difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="All">All Difficulties</SelectItem>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1 bg-neutral-100 p-1 border-2 border-black">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border-0 rounded-none hover:bg-brand hover:text-white"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                      >
                        <ChevronLeft size={18} />
                      </Button>
                      <span className="px-3 font-black text-xs min-w-[60px] text-center">
                        PAGE&nbsp;{page}&nbsp;/&nbsp;{totalPages || 1}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 border-0 rounded-none hover:bg-brand hover:text-white"
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      >
                        <ChevronRight size={18} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              <div className="flex w-fit ml-auto bg-white p-1.5 border-4 border-black shadow-brutal relative">
                {[
                  { id: "mine", label: "My Blueprints", icon: Folder },
                  { id: "saved", label: "Archives", icon: Bookmark },
                  { id: "generate", label: "AI Lab", icon: Sparkles },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      setSelectedProject(null);
                    }}
                    className={cn(
                      "relative flex items-center gap-2 px-6 py-3 font-black uppercase text-xs tracking-tight transition-all duration-200",
                      activeTab === tab.id
                        ? "text-white"
                        : "text-black/60 hover:text-black hover:bg-neutral-100"
                    )}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTabHighlight"
                        className="absolute inset-0 bg-brand border-2 border-black"
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <tab.icon size={16} className={cn("transition-transform", activeTab === tab.id && "scale-110")} />
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {selectedProject ? (
              <motion.div
                key="guide"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <ProjectFullGuide
                  idea={{
                    title: selectedProject.title,
                    description: selectedProject.description,
                    difficulty: selectedProject.difficulty,
                    requiredComponents: selectedProject.requiredComponents,
                  }}
                  guide={{
                    instructions: selectedProject.instructions,
                    mermaidiagram: selectedProject.mermaidDiagram || "",
                    safetyWarnings: selectedProject.safetyWarnings || [],
                  }}
                  onBack={() => setSelectedProject(null)}
                  savedId={selectedProject.id}
                  isOwner={selectedProject.userId === user.id}
                  initialIsPublic={selectedProject.isPublic}
                />
              </motion.div>
            ) : activeTab === "generate" ? (
              <motion.div
                key="generate"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <ProjectGenerator />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-12"
              >
                {activeTab === "mine" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                      [1, 2, 3].map(i => <div key={i} className="aspect-square border-4 border-black animate-pulse bg-neutral-50" />)
                    ) : library.mine.length === 0 ? (
                      <div className="col-span-full py-20 text-center border-4 border-black border-dashed">
                        <Plus size={48} className="mx-auto mb-4 text-black/20" />
                        <p className="font-black uppercase text-black/40">No blueprints found. Visit the AI Lab to generate one.</p>
                      </div>
                    ) : (
                      library.mine.map(p => (
                        <CommunityProjectCard
                          key={p.id}
                          project={p}
                          authorName={user.name}
                          authorImage={user.image}
                          canDelete={true}
                          onDeleted={() => {
                            getUserLibrary({
                              search: debouncedSearch,
                              difficulty,
                              page,
                              limit
                            }).then(res => setLibrary(res as any));
                          }}
                          onInitialize={(project) => setSelectedProject(project)}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "saved" && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="aspect-square border-4 border-black animate-pulse bg-neutral-50" />)
                      ) : library.bookmarked.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-4 border-black border-dashed">
                          <Bookmark size={48} className="mx-auto mb-4 text-black/20" />
                          <p className="font-black uppercase text-black/40">Archive is empty. Explore the community to save projects.</p>
                        </div>
                      ) : (
                        library.bookmarked.map(p => (
                          <CommunityProjectCard
                            key={p.id}
                            project={p}
                            isBookmarked={true}
                            onInitialize={(project) => setSelectedProject(project)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {activeTab !== "generate" && !selectedProject && totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <div className="flex items-center gap-1 bg-white p-2 border-4 border-black shadow-brutal">
              <Button
                variant="ghost"
                className="rounded-none border-2 border-transparent hover:border-black font-black uppercase text-xs"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} className="mr-2" /> Previous
              </Button>

              <div className="flex gap-1 mx-4">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={cn(
                      "w-8 h-8 flex items-center justify-center font-black text-xs transition-colors border-2 border-black",
                      page === i + 1 ? "bg-brand text-white" : "bg-white hover:bg-neutral-100"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <Button
                variant="ghost"
                className="rounded-none border-2 border-transparent hover:border-black font-black uppercase text-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
