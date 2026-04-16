"use client";

import { useState, useEffect } from "react";
import ProjectGenerator from "./project-generator";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { getUserLibrary } from "@/lib/actions/social";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { Button } from "@/components/ui/button";
import { Sparkles, Folder, Bookmark, Plus, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"generate" | "mine" | "saved">("mine");
  const [library, setLibrary] = useState<{ mine: any[]; bookmarked: any[] }>({ mine: [], bookmarked: [] });
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  useEffect(() => {
    getUserLibrary().then(res => {
      setLibrary(res as any);
      setLoading(false);
    });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Project <br />
              <span className="text-brand">Workspace</span>
            </h1>
            <p className="font-medium text-xl max-w-md">
              From automated blueprints to community-sourced schematics. Build, save, and iterate.
            </p>
          </div>

          <div className="flex bg-white p-1.5 border-4 border-black shadow-[6px_6px_0px_0px_black] relative">
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
                    safetyWarnings: [],
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
                          onInitialize={(project) => setSelectedProject(project)}
                        />
                      ))
                    )}
                  </div>
                )}

                {activeTab === "saved" && (
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
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
