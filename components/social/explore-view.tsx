"use client";

import { useState, useEffect } from "react";
import {
  searchUsers,
  getExploreFeed,
  getPublicProfile,
  getExploreProjects,
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
  Filter,
  Library,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { CommunityProjectCard } from "./community-project-card";
import { BlogFeed } from "./blog-feed";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RankBadge } from "./rank-badge";
import dynamic from "next/dynamic";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";

const ProjectFullGuide = dynamic(() => import("@/components/projects/guide-viewer").then(mod => mod.ProjectFullGuide), {
  loading: () => <div className="h-96 border-4 border-black animate-pulse bg-neutral-100 flex items-center justify-center font-black uppercase tracking-widest text-black/20">Syncing Guide Protocol...</div>
});

type Tab = "blueprints" | "community";

export function ExploreView({ sessionUser }: { sessionUser?: any }) {
  const [activeTab, setActiveTab] = useState<Tab>("blueprints");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [projectResults, setProjectResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedGuideProject, setSelectedGuideProject] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  const queryClient = useQueryClient();

  const { data: exploreData, isLoading: isLoadingExplore } = useQuery({
    queryKey: ["explore-projects", page],
    queryFn: () => getExploreProjects({ page, limit: 12 }),
    staleTime: 5 * 60 * 1000,
  });

  const topProjectsData = exploreData?.data || [];
  const pagination = {
    total: exploreData?.total || 0,
    totalPages: exploreData?.totalPages || 1,
    currentPage: exploreData?.currentPage || 1
  };

  const { data: trendingEngineersData = [], isLoading: isLoadingTrending } = useQuery({
    queryKey: ["explore-feed"],
    queryFn: () => getExploreFeed(),
    staleTime: 5 * 60 * 1000,
  });

  const loading = isLoadingExplore || isLoadingTrending;

  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      if (activeTab === "blueprints") {
        searchProjects(debouncedQuery).then(setProjectResults);
      } else if (activeTab === "community") {
        searchUsers(debouncedQuery).then(setUserResults);
      }
    } else {
      setProjectResults([]);
      setUserResults([]);
    }
  }, [debouncedQuery, activeTab]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (val: string) => {
    setQuery(val);
  };

  const clearProfile = () => {
    setSelectedUser(null);
    setProfileData(null);
    setSelectedGuideProject(null);
  };

  const prefetchProfile = (userId: string) => {
    queryClient.prefetchQuery({
      queryKey: ["profile", userId],
      queryFn: () => getPublicProfile(userId),
    });
  };

  const viewProfile = async (user: any) => {
    setSelectedUser(user);
    const data = await queryClient.fetchQuery({
      queryKey: ["profile", user.id],
      queryFn: () => getPublicProfile(user.id),
    });
    setProfileData(data);
  };

  return (
    <div className="min-h-screen bg-background pb-20 overflow-x-hidden">
      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-6 mb-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-4">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none"
              >
                Community <br />
                <span className="text-brand">Archives</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-medium text-xl max-w-md"
              >
                The decentralized repository for open-source engineering. Syncing blueprints across all active nodes.
              </motion.p>
            </div>

            <div className="flex flex-col gap-4 w-full md:w-auto">
              {!selectedUser && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col md:flex-row gap-4 items-center bg-white p-3 border-4 border-black shadow-brutal"
                >
                  <div className="relative flex-1 w-full lg:min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40" size={18} />
                    <Input
                      placeholder={activeTab === "blueprints" ? "SEARCH BLUEPRINTS..." : "SEARCH COMMUNITY..."}
                      value={query}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10 border-2 border-black rounded-none h-12 font-bold focus-visible:ring-0 focus-visible:border-brand transition-colors"
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex w-fit md:ml-auto bg-white p-1.5 border-4 border-black shadow-brutal relative">
                {[
                  { id: "blueprints", label: "Blueprints", icon: Library },
                  { id: "community", label: "Community", icon: Users },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as Tab);
                      setQuery("");
                      setProjectResults([]);
                      setUserResults([]);
                      setSelectedUser(null);
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
                  {profileData?.user?.bio && (
                    <p className="text-lg font-medium uppercase text-neutral-600 max-w-2xl leading-tight">
                      {profileData.user.bio}
                    </p>
                  )}
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
                          safetyWarnings: selectedGuideProject.safetyWarnings || [],
                        }}
                        onBack={() => setSelectedGuideProject(null)}
                        savedId={selectedGuideProject.id}
                        isOwner={selectedUser?.id === sessionUser?.id}
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

              {profileData?.blogPosts && profileData.blogPosts.length > 0 && (
                <div className="space-y-10 pt-10 border-t-8 border-black">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-2 bg-brand shadow-[2px_2px_0px_#000]" />
                      <h3 className="text-4xl font-black uppercase tracking-tighter italic">Field Logs</h3>
                    </div>
                  </div>
                  <div className="bg-neutral-50 border-4 border-black p-8 shadow-brutal">
                    <BlogFeed posts={profileData.blogPosts} sessionUser={sessionUser} />
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {activeTab === "blueprints" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between border-b-8 border-black pb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand border-4 border-black shadow-brutal -rotate-3">
                        <Library size={32} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
                          Global <span className="text-brand">Library</span>
                        </h3>
                        <p className="font-bold text-xs uppercase text-black/40 mt-1">Access all shared engineering parameters from the community</p>
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
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {topProjectsData.map((p: any) => (
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

                      {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 pt-8 border-t-4 border-black mt-8">
                          <Button
                            variant="neo"
                            disabled={page <= 1}
                            onClick={() => setPage(page - 1)}
                            className="size-12 p-0 border-4 border-black"
                          >
                            <ChevronLeft />
                          </Button>

                          <div className="flex items-center gap-2">
                            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                              <Button
                                key={p}
                                variant={page === p ? "neo" : "ghost"}
                                onClick={() => setPage(p)}
                                className={`size-12 border-4 border-black font-black ${page === p ? "bg-brand text-white" : "bg-white"
                                  }`}
                              >
                                {p}
                              </Button>
                            ))}
                            {pagination.totalPages > 5 && <span className="font-black">...</span>}
                          </div>

                          <Button
                            variant="neo"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(page + 1)}
                            className="size-12 p-0 border-4 border-black"
                          >
                            <ChevronRight />
                          </Button>
                        </div>
                      )}

                      <div className="bg-neutral-100 border-4 border-black p-8 text-center mt-12">
                        <p className="font-black uppercase tracking-widest text-sm">Use the search protocol to scan more blueprints</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "community" && (
                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tighter shrink-0 flex items-center gap-3">
                        <Users className="text-brand" /> Community Engineers
                      </h3>
                      <p className="text-[10px] font-bold text-black/40 uppercase mt-1 italic">* Engineer Ranks (Novice to Elite) are earned by sharing blueprints to the library.</p>
                    </div>
                    {query && <div className="text-[10px] font-black uppercase bg-black text-white px-2 py-1">Scanning for: {query}</div>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {(query.length > 2 ? userResults : trendingEngineersData).map((u: any, idx: number) => {
                      const user = u.user || u; // handle difference between feed item and search result
                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onMouseEnter={() => prefetchProfile(user.id)}
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
                          </div>

                          {user.bio ? (
                            <p className="text-xs font-bold uppercase text-black/50 line-clamp-2 mb-8 h-8 italic">
                              "{user.bio}"
                            </p>
                          ) : (
                            <div className="mb-8 h-8" />
                          )}

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
