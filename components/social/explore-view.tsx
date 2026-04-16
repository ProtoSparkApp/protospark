"use client";

import { useState, useEffect } from "react";
import { searchUsers, getExploreFeed, getPublicProfile } from "@/lib/actions/social";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, ArrowRight, Shield, Layout, X } from "lucide-react";
import { CommunityProjectCard } from "./community-project-card";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function ExploreView() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGuideProject, setSelectedGuideProject] = useState<any | null>(null);

  useEffect(() => {
    getExploreFeed().then(setFeed);
  }, []);

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      const results = await searchUsers(val);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const viewProfile = async (user: any) => {
    setLoading(true);
    setSelectedUser(user);
    const data = await getPublicProfile(user.id);
    setProfileData(data);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Community <br />
              <span className="text-brand">Registry</span>
            </h1>
            <p className="font-medium text-xl max-w-md">
              Discover engineering talent and blueprints from around the world.
            </p>
          </div>

          <div className="w-full md:w-80 relative">
            <div className="flex items-center gap-2 border-b-2 border-black pb-2 mb-2">
              <Search size={16} />
              <span className="font-mono text-[10px] font-black uppercase text-black/40">Search Engineers</span>
            </div>
            <Input 
              placeholder="NAME / USER ID..." 
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-12 text-sm uppercase font-black"
            />
            {query && (
              <div className="absolute top-full left-0 right-0 bg-white border-2 border-black mt-2 z-50 shadow-brutal p-2">
                {searchResults.length === 0 ? (
                  <p className="text-[10px] font-black uppercase p-2 text-black/40">No records found</p>
                ) : (
                  searchResults.map(u => (
                    <button 
                      key={u.id} 
                      onClick={() => viewProfile(u)}
                      className="w-full flex items-center gap-3 p-2 hover:bg-neutral-50 transition-colors text-left"
                    >
                      <div className="size-8 border-2 border-black bg-neutral-100 flex items-center justify-center">
                        {u.image ? <img src={u.image} className="size-full object-cover" /> : <User size={14} />}
                      </div>
                      <span className="font-black uppercase text-xs">{u.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 bg-neutral-50 border-4 border-black p-8 relative">
                <button 
                  onClick={() => setSelectedUser(null)}
                  className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-red-400 transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="size-32 border-4 border-black bg-white shadow-[4px_4px_0px_#000] shrink-0">
                  {selectedUser.image ? (
                    <img src={selectedUser.image} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center"><User size={48} /></div>
                  )}
                </div>
                
                <div className="text-center md:text-left space-y-4">
                  <div>
                    <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">{selectedUser.name}</h2>
                    <p className="font-mono text-[10px] font-black uppercase text-black/40 mt-1">Status: Verified Citizen</p>
                  </div>
                  <p className="text-sm font-medium uppercase text-neutral-600 max-w-xl">{profileData?.user?.bio || "No bio decrypted yet."}</p>
                  <div className="flex gap-4 justify-center md:justify-start">
                    <div className="flex items-center gap-2 font-black uppercase text-[10px]">
                      <Layout size={14} />
                      {profileData?.projects.length || 0} Blueprints
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-black" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Public Schematics</h3>
                </div>

                <AnimatePresence mode="wait">
                  {selectedGuideProject ? (
                    <motion.div
                      key="guide"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <ProjectFullGuide
                        idea={{
                          title: selectedGuideProject.title,
                          description: selectedGuideProject.description,
                          difficulty: selectedGuideProject.difficulty,
                          requiredComponents: selectedGuideProject.requiredComponents,
                        }}
                        guide={{
                          instructions: selectedGuideProject.instructions,
                          mermaidiagram: selectedGuideProject.mermaidDiagram || "",
                          safetyWarnings: [],
                        }}
                        onBack={() => setSelectedGuideProject(null)}
                        savedId={selectedGuideProject.id}
                        isOwner={false} // Exploring usually means you're not the owner
                        initialIsPublic={selectedGuideProject.isPublic}
                      />
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {loading ? (
                        [1, 2, 3].map(i => <div key={i} className="aspect-square border-4 border-black animate-pulse bg-neutral-100" />)
                      ) : profileData?.projects.map((p: any) => (
                        <CommunityProjectCard
                          key={p.project.id}
                          project={p.project}
                          isBookmarked={p.isBookmarked}
                          authorName={selectedUser.name}
                          authorImage={selectedUser.image}
                          showInventoryMatch={true}
                          onInitialize={(project) => setSelectedGuideProject(project)}
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="space-y-12">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-brand" />
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic">Recent Transmissions</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {feed.map((item: any) => (
                    <button 
                      key={item.user.id}
                      onClick={() => viewProfile(item.user)}
                      className="border-4 border-black bg-white p-6 shadow-brutal hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] transition-all text-left group"
                    >
                      <div className="size-16 border-2 border-black mb-4 bg-neutral-50 overflow-hidden">
                        {item.user.image ? <img src={item.user.image} className="size-full object-cover" /> : <User size={24} className="m-auto mt-4" />}
                      </div>
                      <h4 className="font-black uppercase tracking-tight text-lg leading-none mb-1 group-hover:text-brand">{item.user.name}</h4>
                      <p className="text-[10px] font-black uppercase text-black/40">{item.projectCount} Public Projects</p>
                      <div className="mt-4 pt-4 border-t-2 border-black border-dashed flex items-center justify-between text-[10px] font-black uppercase">
                        <span>View Profile</span>
                        <ArrowRight size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
