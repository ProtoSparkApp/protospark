"use client";

import { useState, useEffect } from "react";
import ProjectGenerator from "./project-generator";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { getUserLibrary } from "@/lib/actions/social";
import { Button } from "@/components/ui/button";
import { Sparkles, Folder, Bookmark, Plus, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ProjectDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState<"generate" | "mine" | "saved">("mine");
  const [library, setLibrary] = useState<{ mine: any[]; bookmarked: any[] }>({ mine: [], bookmarked: [] });
  const [loading, setLoading] = useState(true);

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

          <div className="flex bg-neutral-100 p-1 border-4 border-black border-dashed">
            {[
              { id: "mine", label: "My Blueprints", icon: Folder },
              { id: "saved", label: "Archives", icon: Bookmark },
              { id: "generate", label: "AI Lab", icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 font-black uppercase text-xs transition-all",
                  activeTab === tab.id 
                    ? "bg-black text-white shadow-[4px_4px_0px_#000]" 
                    : "hover:bg-black/5"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "generate" ? (
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
