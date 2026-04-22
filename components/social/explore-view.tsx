"use client";

import { useState, useEffect } from "react";
import {
  searchUsers,
  getExploreFeed,
  getPublicProfile,
  getTopProjects,
  searchProjects
} from "@/lib/actions/social";
import { getRankByProjectCount, getRankProgress } from "@/lib/utils/rank";
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
import { RankBadge } from "./rank-badge";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
      <header className="relative border-b-4 border-black bg-white py-16 md:py-28 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.03] pointer-events-none overflow-hidden select-none">
          <div className="text-[20vw] font-black leading-none -mr-20 -mt-10">CORE</div>
        </div>
        <div className="absolute top-0 left-0 p-4 font-mono text-[8px] font-black text-black/20 vertical-writing-rl hidden md:block">
          ARCHIVE_PROTOCOL_V2.0 // EST_2026 // NODE_01
        </div>
        
        <div className="container mx-auto px-4 relative">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div className="space-y-8">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="inline-flex items-center gap-3 px-4 py-2 border-2 border-black bg-brand text-white font-black uppercase text-[12px] tracking-[0.2em] shadow-brutal"
              >
                <Shield size={14} /> Community Registry
              </motion.div>
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-7xl md:text-9xl lg:text-[11rem] font-black uppercase tracking-tighter leading-[0.75]"
              >
                GLOBAL <br />
                <span className="text-brand relative inline-block">
                  ARCHIVES
                  <motion.span 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute -bottom-2 left-0 h-4 bg-yellow-400 -z-10"
                  />
                </span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="font-bold text-xl md:text-3xl max-w-2xl text-black/80 leading-tight"
              >
                The decentralized repository for open-source engineering. <span className="italic text-black/40">Syncing blueprints across all active nodes.</span>
              </motion.p>
            </div>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full lg:w-[450px] space-y-6"
            >
              <div className="flex items-center justify-between font-mono text-[10px] font-black uppercase text-black/40">
                <div className="flex items-center gap-2">
                  <Search size={14} />
                  <span>Encrypted Search Protocol</span>
                </div>
                <div className="flex gap-1">
                  <div className="size-1 bg-black animate-pulse" />
                  <div className="size-1 bg-black animate-pulse" style={{ animationDelay: "0.2s" }} />
                  <div className="size-1 bg-black animate-pulse" style={{ animationDelay: "0.4s" }} />
                </div>
              </div>
              <div className="relative group">
                <Input
                  placeholder={activeTab === "projects" ? "SEARCH BLUEPRINTS..." : activeTab === "engineers" ? "SEARCH ENGINEERS..." : "SWITCH TO TAB TO SEARCH..."}
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  disabled={activeTab === "discover"}
                  className="h-20 text-xl uppercase font-black border-4 border-black shadow-[8px_8px_0px_#000] focus:ring-0 focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_#000] transition-all placeholder:text-black/20 rounded-none bg-white"
                />
                {activeTab === "discover" && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center pointer-events-none border-4 border-transparent">
                    <span className="bg-black text-white text-[10px] font-black uppercase px-3 py-1.5 shadow-brutal flex items-center gap-2">
                       <Filter size={12} /> Select active tab to search
                    </span>
                  </div>
                )}
                {/* Search Decorative Corners */}
                <div className="absolute -top-1 -right-1 size-3 border-t-2 border-r-2 border-black" />
                <div className="absolute -bottom-1 -left-1 size-3 border-b-2 border-l-2 border-black" />
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-0 z-40 bg-white border-b-4 border-black shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex overflow-x-auto no-scrollbar items-center">
            <div className="pr-6 border-r-4 border-black hidden md:flex items-center gap-2 font-black uppercase text-[10px] whitespace-nowrap">
              <span className="size-2 bg-green-500 rounded-full animate-pulse" />
              Archives Explorer
            </div>
            {[
              { id: "discover", label: "Protocol Discover", icon: Zap },
              { id: "projects", label: "Blueprint Nexus", icon: Layout },
              { id: "engineers", label: "Neural Network", icon: Users },
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
                  "flex items-center gap-3 px-10 py-6 font-black uppercase text-sm tracking-tighter transition-all border-r-4 border-black shrink-0 relative overflow-hidden group",
                  activeTab === tab.id ? "bg-black text-white" : "text-black bg-white hover:bg-neutral-50"
                )}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="tab-underline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-brand"
                  />
                )}
                <tab.icon size={20} className={cn(activeTab === tab.id ? "text-brand" : "group-hover:scale-110 transition-transform")} />
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
                  className="absolute top-6 right-6 p-4 border-4 border-black bg-white hover:bg-red-400 transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-brutal group/close"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Close Profile</div>
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
                    <div className="flex flex-wrap items-center gap-6 pt-4 border-t-2 border-black/10 border-dashed w-full md:w-auto">
                      <div className="flex items-center gap-2 font-black uppercase text-xs">
                        <Layout size={16} className="text-brand" />
                        <span className="text-black/40 mr-1">Assets:</span> {profileData?.totalProjectCount || 0} Blueprints
                      </div>
                      
                      <RankBadge projectCount={profileData?.totalProjectCount || 0} />
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
                <div className="space-y-32">
                  {/* Top rated projects Section */}
                  <section className="space-y-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-8 border-black pb-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-yellow-400 border-4 border-black shadow-brutal rotate-3">
                            <Trophy size={32} className="fill-black" />
                          </div>
                          <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">
                            Top Tier <span className="text-brand">Blueprints</span>
                          </h3>
                        </div>
                        <p className="font-bold text-xl uppercase text-black/40 tracking-tight">Highest rated engineering transmissions from the network</p>
                      </div>
                      <Button 
                        onClick={() => setActiveTab("projects")} 
                        className="bg-black text-white hover:bg-brand h-16 px-10 rounded-none font-black uppercase tracking-widest text-xs shadow-[8px_8px_0px_#6c72ff] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                      >
                        Access Full Database <ArrowRight className="ml-2" />
                      </Button>
                    </div>

                    {loading ? (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 h-[600px]">
                        <div className="md:col-span-2 md:row-span-2 border-4 border-black animate-pulse bg-neutral-100 shadow-brutal" />
                        <div className="border-4 border-black animate-pulse bg-neutral-100 shadow-brutal" />
                        <div className="border-4 border-black animate-pulse bg-neutral-100 shadow-brutal" />
                        <div className="md:col-span-2 border-4 border-black animate-pulse bg-neutral-100 shadow-brutal" />
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {/* Bento Grid Layout - first project featured */}
                        {topProjects.length > 0 && (
                          <>
                            <div className="md:col-span-2 md:row-span-2 relative group">
                               <div className="absolute -top-6 -left-6 z-20 size-20 bg-yellow-400 border-4 border-black flex items-center justify-center font-black italic shadow-brutal text-2xl -rotate-12 group-hover:rotate-0 transition-transform">
                                TOP
                              </div>
                              <div className="absolute top-4 right-4 z-20 px-3 py-1 bg-black text-white text-[10px] font-black uppercase shadow-brutal">
                                Featured Transmission
                              </div>
                              <CommunityProjectCard
                                project={topProjects[0].project}
                                authorName={topProjects[0].userName}
                                authorImage={topProjects[0].userImage}
                                isBookmarked={topProjects[0].isBookmarked}
                                onInitialize={(project) => {
                                  setSelectedUser({ id: topProjects[0].project.userId, name: topProjects[0].userName, image: topProjects[0].userImage });
                                  setSelectedGuideProject(project);
                                }}
                              />
                            </div>
                            
                            {topProjects.slice(1, 6).map((p: any, idx: number) => (
                              <div key={p.project.id} className={cn(
                                "relative group",
                                idx === 2 ? "md:col-span-2" : ""
                              )}>
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
                          </>
                        )}
                      </div>
                    )}
                  </section>

                  {/* Featured Engineers Section */}
                  <section className="space-y-16 py-24 bg-black -mx-4 px-8 md:px-12 border-y-[12px] border-brand relative overflow-hidden">
                    {/* Background Tech Details */}
                    <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                    
                    <div className="container mx-auto max-w-7xl">
                      <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8 relative z-10">
                        <div className="flex items-center gap-6">
                          <div className="size-20 bg-brand border-4 border-white shadow-[0_0_20px_rgba(108,114,255,0.5)] flex items-center justify-center rotate-45">
                            <TrendingUp size={40} className="text-white -rotate-45" />
                          </div>
                          <div>
                            <h3 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white italic">
                              Active <span className="text-brand">Nodes</span>
                            </h3>
                            <p className="text-brand font-black uppercase text-sm tracking-[0.3em] mt-2">Neural network activity detected</p>
                          </div>
                        </div>
                        <Button 
                          onClick={() => setActiveTab("engineers")} 
                          className="bg-white text-black hover:bg-brand hover:text-white h-16 px-10 rounded-none font-black uppercase tracking-widest text-xs transition-all flex items-center gap-3"
                        >
                          Personnel Directory <ArrowRight size={18} />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                        {trendingEngineers.map((item: any, idx: number) => (
                          <motion.div
                            key={item.user.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => viewProfile(item.user)}
                            className="group relative border-4 border-white bg-white/5 backdrop-blur-sm p-8 hover:bg-white hover:text-black transition-all cursor-pointer overflow-hidden"
                          >
                             {/* Tactical scan line */}
                            <motion.div 
                              animate={{ y: [0, 200, 0] }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className="absolute inset-x-0 h-[2px] bg-brand/30 z-0 pointer-events-none"
                            />

                            <div className="relative z-10 flex flex-col items-center text-center">
                              <div className="size-24 border-4 border-brand mb-6 bg-black p-1 overflow-hidden shadow-[0_0_15px_rgba(108,114,255,0.3)] group-hover:scale-110 transition-transform">
                                {item.user.image ? 
                                  <img src={item.user.image} className="size-full object-cover grayscale group-hover:grayscale-0 transition-all" /> : 
                                  <User size={40} className="m-auto mt-6 text-brand" />
                                }
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-black uppercase tracking-tight text-2xl leading-none text-white group-hover:text-black transition-colors">{item.user.name}</h4>
                                <div className="inline-block px-2 py-0.5 border border-brand bg-brand/10 text-[8px] font-black uppercase text-brand group-hover:bg-black group-hover:text-white group-hover:border-black">
                                  Level: {getRankByProjectCount(item.projectCount).name}
                                </div>
                                <p className="text-[10px] font-black uppercase text-white/40 group-hover:text-black/60 pt-2">
                                  {item.projectCount} Assets Linked
                                </p>
                              </div>
                              <div className="mt-8 pt-6 border-t border-white/10 w-full flex items-center justify-between text-[10px] font-black uppercase text-brand">
                                <span>Scan Node</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* BLUEPRINTS TAB content */}
              {activeTab === "projects" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between border-b-8 border-black pb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand border-4 border-black shadow-brutal -rotate-3">
                        <Layout size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                          Blueprint <span className="text-brand">Nexus</span>
                        </h3>
                        <p className="font-bold text-xs uppercase text-black/40 mt-1">Cross-referencing global engineering parameters</p>
                      </div>
                    </div>
                    {query && <div className="hidden md:block text-[10px] font-black uppercase bg-black text-white px-3 py-1.5 shadow-brutal border-2 border-brand animate-pulse">Transmission Query: {query}</div>}
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
                    {(query.length > 2 ? userResults : trendingEngineers).map((u: any, idx: number) => {
                      const user = u.user || u; // handle difference between feed item and search result
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => viewProfile(user)}
                          className="group relative border-4 border-black bg-white p-8 shadow-brutal hover:-translate-x-2 hover:-translate-y-2 hover:shadow-[12px_12px_0px_#000] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all text-center cursor-pointer overflow-hidden"
                        >
                          <div className="absolute top-2 left-2 font-mono text-[8px] text-black/20">NODE_{idx.toString().padStart(2, '0')}</div>
                          <div className="mx-auto size-28 border-4 border-black mb-6 bg-neutral-50 overflow-hidden shadow-brutal group-hover:scale-105 transition-transform relative">
                            {user.image ? <img src={user.image} className="size-full object-cover" /> : <User size={48} className="m-auto mt-8 text-black/20" />}
                            <div className="absolute inset-0 border-2 border-black/10 group-hover:border-brand/40 transition-colors" />
                          </div>
                          
                          <h4 className="font-black uppercase tracking-tighter text-3xl leading-none mb-3 group-hover:text-brand transition-colors">{user.name}</h4>
                          
                          <div className="flex items-center justify-center gap-3 mb-6">
                            <div className={cn("px-2 py-1 border-2 border-black text-[10px] font-black uppercase shadow-[2px_2px_0px_#000]", getRankByProjectCount(u.projectCount || 0).color)}>
                              {getRankByProjectCount(u.projectCount || 0).name}
                            </div>
                            <div className="px-2 py-1 border-2 border-black bg-green-400 text-[10px] font-black uppercase shadow-[2px_2px_0px_#000] flex items-center gap-1">
                              <div className="size-1.5 bg-black rounded-full animate-pulse" />
                              Active
                            </div>
                          </div>
                          
                          <p className="text-xs font-bold uppercase text-black/50 line-clamp-2 mb-8 h-8 italic">
                            "{user.bio || "Bio encrypted. High clearance required for decryption."}"
                          </p>
                          
                          <Button variant="neo" className="w-full h-12 rounded-none font-black text-xs uppercase group-hover:bg-brand group-hover:text-white transition-colors">
                            Access Archives <ArrowRight className="ml-2" size={16} />
                          </Button>
                        </motion.div>
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
