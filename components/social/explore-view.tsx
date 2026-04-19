"use client";

import { useState, useEffect } from "react";
import { 
  searchUsers, 
  getExploreFeed, 
  getPublicProfile, 
  getTopProjects, 
  searchProjects 
} from "@/lib/actions/social";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, 
  User, 
  ArrowRight, 
  Shield, 
  Layout, 
  X, 
  Zap, 
  Trophy, 
  Users, 
  Cpu,
  Sparkles,
  TrendingUp,
  Filter
} from "lucide-react";
import { CommunityProjectCard } from "./community-project-card";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "discover" | "projects" | "engineers";

export function ExploreView() {
  const [activeTab, setActiveTab] = useState<Tab>("discover");
  const [query, setQuery] = useState("");
  const [projectResults, setProjectResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [topProjects, setTopProjects] = useState<any[]>([]);
  const [trendingEngineers, setTrendingEngineers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedGuideProject, setSelectedGuideProject] = useState<any | null>(null);

  useEffect(() => {
    loadDiscoverData();
  }, []);

  const loadDiscoverData = async () => {
    setLoading(true);
    const [top, trending] = await Promise.all([
      getTopProjects(),
      getExploreFeed()
    ]);
    setTopProjects(top);
    setTrendingEngineers(trending);
    setLoading(false);
  };

  const handleSearch = async (val: string) => {
    setQuery(val);
    if (val.length > 2) {
      if (activeTab === "projects") {
        const results = await searchProjects(val);
        setProjectResults(results);
      } else if (activeTab === "engineers") {
        const results = await searchUsers(val);
        setUserResults(results);
      }
    } else {
      setProjectResults([]);
      setUserResults([]);
    }
  };

  const viewProfile = async (user: any) => {
    setLoading(true);
    setSelectedUser(user);
    const data = await getPublicProfile(user.id);
    setProfileData(data);
    setLoading(false);
  };

  const clearProfile = () => {
    setSelectedUser(null);
    setProfileData(null);
    setSelectedGuideProject(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      {/* Header Section */}
      <header className="border-b-4 border-black bg-white py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-brand text-white font-black uppercase text-[10px] tracking-widest shadow-[2px_2px_0px_#000]">
                <Shield size={10} /> Community Registry v2.0
              </div>
              <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8]">
                GLOBAL <br />
                <span className="text-brand">ARCHIVES</span>
              </h1>
              <p className="font-bold text-xl md:text-2xl max-w-xl text-black/60 italic">
                Scanning decentralized nodes for engineering excellence and blueprint transmissions.
              </p>
            </div>

            <div className="w-full md:w-[400px] space-y-4">
              <div className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-black/40">
                <Search size={14} />
                <span>Encrypted Search Protocol</span>
              </div>
              <div className="relative group">
                <Input
                  placeholder={activeTab === "projects" ? "SEARCH BLUEPRINTS..." : activeTab === "engineers" ? "SEARCH ENGINEERS..." : "SWITCH TO TAB TO SEARCH..."}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={activeTab === "discover"}
                  className="h-16 text-lg uppercase font-black border-4 border-black shadow-brutal focus:ring-0 focus:translate-x-1 focus:translate-y-1 focus:shadow-none transition-all placeholder:text-black/20"
                />
                {activeTab === "discover" && (
                   <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
                      <span className="bg-black text-white text-[10px] font-black uppercase px-2 py-1 shadow-brutal">Select tab to enable search</span>
                   </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-40 bg-background border-b-4 border-black">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar">
            {[
              { id: "discover", label: "Discover", icon: Zap },
              { id: "projects", label: "Blueprints", icon: Layout },
              { id: "engineers", label: "Engineers", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as Tab);
                  setQuery("");
                  setProjectResults([]);
                  setUserResults([]);
                }}
                className={cn(
                  "flex items-center gap-3 px-8 py-6 font-black uppercase text-sm tracking-tighter transition-all border-r-4 border-black shrink-0 hover:bg-neutral-50",
                  activeTab === tab.id ? "bg-black text-white" : "text-black"
                )}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row items-center gap-8 bg-neutral-50 border-4 border-black p-10 relative shadow-brutal">
                <button
                  onClick={clearProfile}
                  className="absolute top-6 right-6 p-4 border-2 border-black bg-white hover:bg-red-400 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal"
                >
                  <X size={24} />
                </button>

                <div className="size-40 border-4 border-black bg-white shadow-brutal shrink-0 overflow-hidden">
                  {selectedUser.image ? (
                    <img src={selectedUser.image} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center bg-brand/10"><User size={64} /></div>
                  )}
                </div>

                <div className="text-center md:text-left space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2 justify-center md:justify-start">
                      <span className="px-2 py-0.5 bg-black text-white text-[10px] font-black uppercase">Verified ID</span>
                      <span className="font-mono text-[10px] font-black uppercase text-black/40">UUID: {selectedUser.id.slice(0, 8)}...</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">{selectedUser.name}</h2>
                  </div>
                  <p className="text-lg font-medium uppercase text-neutral-600 max-w-2xl leading-tight">
                    {profileData?.user?.bio || "This engineer has not yet decrypted their tactical biography. Remaining in stealth mode."}
                  </p>
                  <div className="flex flex-wrap gap-6 justify-center md:justify-start pt-4 border-t-2 border-black/10 border-dashed">
                    <div className="flex items-center gap-2 font-black uppercase text-xs">
                      <Layout size={16} className="text-brand" />
                      <span className="text-black/40 mr-1">Assets:</span> {profileData?.projects.length || 0} Blueprints
                    </div>
                    <div className="flex items-center gap-2 font-black uppercase text-xs">
                      <Trophy size={16} className="text-yellow-500" />
                      <span className="text-black/40 mr-1">Rank:</span> Elite Fabricator
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-2 bg-brand shadow-[2px_2px_0px_#000]" />
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic">Tactical Schematics</h3>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {selectedGuideProject ? (
                    <motion.div
                      key="guide"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
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
                        isOwner={false}
                        initialIsPublic={selectedGuideProject.isPublic}
                      />
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {loading ? (
                        [1, 2, 3].map(i => (
                          <div key={i} className="aspect-[4/5] border-4 border-black animate-pulse bg-neutral-100 shadow-brutal" />
                        ))
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
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* DISCOVER TAB content */}
              {activeTab === "discover" && (
                <div className="space-y-20">
                  {/* Top rated projects */}
                  <section className="space-y-10">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                      <div className="flex items-center gap-4">
                        <Trophy size={32} className="text-yellow-500 fill-yellow-500" />
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Top Tier Blueprints</h3>
                      </div>
                      <Button variant="ghost" onClick={() => setActiveTab("projects")} className="hidden md:flex">
                        View All <ArrowRight className="ml-2" />
                      </Button>
                    </div>
                    
                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => <div key={i} className="h-96 border-4 border-black animate-pulse bg-neutral-50 shadow-brutal" />)}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topProjects.map((p: any) => (
                          <div key={p.project.id} className="relative group">
                            <div className="absolute -top-4 -left-4 z-10 size-12 bg-yellow-400 border-4 border-black flex items-center justify-center font-black italic shadow-brutal">
                              TOP
                            </div>
                            <CommunityProjectCard
                              project={p.project}
                              authorName={p.userName}
                              authorImage={p.userImage}
                              isBookmarked={p.isBookmarked}
                              onInitialize={(project) => {
                                  setSelectedUser({ id: p.project.userId, name: p.userName, image: p.userImage });
                                  setSelectedGuideProject(project);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </section>

                  {/* Featured Engineers */}
                  <section className="space-y-10">
                    <div className="flex items-center justify-between border-b-4 border-black pb-4">
                      <div className="flex items-center gap-4">
                        <TrendingUp size={32} className="text-brand" />
                        <h3 className="text-4xl font-black uppercase tracking-tighter leading-none">Active Nodes</h3>
                      </div>
                      <Button variant="ghost" onClick={() => setActiveTab("engineers")} className="hidden md:flex">
                         Personnel Directory <ArrowRight className="ml-2" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {trendingEngineers.map((item: any) => (
                        <div
                          key={item.user.id}
                          onClick={() => viewProfile(item.user)}
                          className="group relative border-4 border-black bg-white p-6 shadow-brutal hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-left cursor-pointer"
                        >
                          <div className="size-20 border-4 border-black mb-6 bg-neutral-50 overflow-hidden shadow-brutal group-hover:scale-105 transition-transform">
                            {item.user.image ? <img src={item.user.image} className="size-full object-cover" /> : <User size={40} className="m-auto mt-4" />}
                          </div>
                          <div className="space-y-1">
                             <h4 className="font-black uppercase tracking-tight text-xl leading-none group-hover:text-brand transition-colors">{item.user.name}</h4>
                             <p className="text-[10px] font-black uppercase text-black/40">{item.projectCount} ARCHIVED BLUEPRINTS</p>
                          </div>
                          <div className="mt-8 pt-4 border-t-4 border-black border-dotted flex items-center justify-between text-[10px] font-black uppercase group-hover:bg-neutral-50">
                            <span>Scan Profile</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              )}

              {/* BLUEPRINTS TAB content */}
              {activeTab === "projects" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-black uppercase tracking-tighter shrink-0 flex items-center gap-3">
                        <Layout className="text-brand" /> Global Feed
                     </h3>
                     {query && <div className="text-[10px] font-black uppercase bg-black text-white px-2 py-1">Searching: {query}</div>}
                  </div>

                  {query.length > 2 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                       {projectResults.length > 0 ? (
                         projectResults.map((p: any) => (
                            <CommunityProjectCard
                              key={p.project.id}
                              project={p.project}
                              authorName={p.userName}
                              authorImage={p.userImage}
                              isBookmarked={p.isBookmarked}
                              onInitialize={(project) => {
                                 setSelectedUser({ id: p.project.userId, name: p.userName, image: p.userImage });
                                 setSelectedGuideProject(project);
                              }}
                            />
                         ))
                       ) : (
                         <div className="col-span-full py-20 border-4 border-black border-dashed flex flex-col items-center justify-center text-center">
                            <Search size={48} className="mb-4 text-black/20" />
                            <h4 className="text-2xl font-black uppercase">No blueprints found</h4>
                            <p className="text-black/40 font-bold uppercase text-xs">Try adjusting your transmission frequency (search query)</p>
                         </div>
                       )}
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                          {topProjects.map((p: any) => (
                             <CommunityProjectCard
                               key={p.project.id}
                               project={p.project}
                               authorName={p.userName}
                               authorImage={p.userImage}
                               isBookmarked={p.isBookmarked}
                               onInitialize={(project) => {
                                  setSelectedUser({ id: p.project.userId, name: p.userName, image: p.userImage });
                                  setSelectedGuideProject(project);
                               }}
                             />
                          ))}
                       </div>
                       <div className="bg-neutral-100 border-4 border-black p-8 text-center">
                          <p className="font-black uppercase tracking-widest text-sm">Use the search protocol to scan more blueprints</p>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* ENGINEERS TAB content */}
              {activeTab === "engineers" && (
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                     <h3 className="text-3xl font-black uppercase tracking-tighter shrink-0 flex items-center gap-3">
                        <Users className="text-brand" /> Engineer Nodes
                     </h3>
                     {query && <div className="text-[10px] font-black uppercase bg-black text-white px-2 py-1">Scanning for: {query}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {(query.length > 2 ? userResults : trendingEngineers).map((u: any) => {
                       const user = u.user || u; // handle difference between feed item and search result
                       return (
                        <div
                          key={user.id}
                          onClick={() => viewProfile(user)}
                          className="group relative border-4 border-black bg-white p-8 shadow-brutal hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] transition-all text-center cursor-pointer"
                        >
                          <div className="mx-auto size-24 border-4 border-black mb-6 bg-neutral-100 overflow-hidden shadow-brutal group-hover:rotate-3 transition-transform">
                            {user.image ? <img src={user.image} className="size-full object-cover" /> : <User size={48} className="m-auto mt-6" />}
                          </div>
                          <h4 className="font-black uppercase tracking-tighter text-2xl leading-none mb-2">{user.name}</h4>
                          <div className="flex items-center justify-center gap-2 mb-6">
                             <div className="px-2 py-0.5 border-2 border-black bg-neutral-50 text-[10px] font-black uppercase">Level 1</div>
                             <div className="px-2 py-0.5 border-2 border-black bg-green-400 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]">ACTIVE</div>
                          </div>
                          <p className="text-[10px] font-bold uppercase text-black/40 line-clamp-2 mb-8">
                            {user.bio || "Bio encrypted. High clearance required for decryption."}
                          </p>
                          <Button variant="neo" size="sm" className="w-full">
                             View Assets <ArrowRight className="ml-2" />
                          </Button>
                        </div>
                      );
                    })}

                    {query.length > 2 && userResults.length === 0 && (
                      <div className="col-span-full py-20 border-4 border-black border-dashed flex flex-col items-center justify-center text-center">
                         <Users size={48} className="mb-4 text-black/20" />
                         <h4 className="text-2xl font-black uppercase">No engineers identified</h4>
                         <p className="text-black/40 font-bold uppercase text-xs">Sensor sweep returned zero matching biological signatures</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
