"use client";

import { useState } from "react";
import { CommunityProjectCard } from "@/components/social/community-project-card";
import { MessageSquare, Terminal, User, Layers, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProjectFullGuide } from "@/components/projects/guide-viewer";
import { CommentSection } from "@/components/social/comment-section";
import { motion, AnimatePresence } from "framer-motion";
import { togglePostLike } from "@/lib/actions/social";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function BlogFeed({ posts, sessionUser }: { posts: any[]; sessionUser: any }) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  if (selectedProject) {
    return (
      <div className="container mx-auto px-4 py-8">
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
          isOwner={selectedProject.userId === sessionUser?.id}
          initialIsPublic={selectedProject.isPublic}
        />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      {posts.length === 0 ? (
        <div className="border-4 border-dashed border-black/10 p-24 text-center bg-white">
          <MessageSquare size={48} className="mx-auto mb-6 text-black/10" />
          <p className="font-black uppercase text-2xl text-black/20 italic tracking-tighter">
            The terminal is quiet. No transmissions detected.
          </p>
        </div>
      ) : (
        posts.map((post) => (
          <BlogPostItem
            key={post.post.id}
            post={post}
            sessionUser={sessionUser}
            onProjectClick={(project) => setSelectedProject(project)}
          />
        ))
      )}
    </div>
  );
}

function BlogPostItem({ post: initialPostData, sessionUser, onProjectClick }: { post: any; sessionUser: any; onProjectClick: (p: any) => void }) {
  const [post, setPost] = useState<any>(initialPostData);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!sessionUser) {
      toast.error("You must be logged in to like posts.");
      return;
    }

    if (isLiking) return;

    const wasLiked = post.isLiked;
    setPost((prev: any) => ({
      ...prev,
      isLiked: !wasLiked,
      likeCount: Number(prev.likeCount) + (wasLiked ? -1 : 1)
    }));

    setIsLiking(true);
    try {
      const result = await togglePostLike(post.post.id);
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      setPost((prev: any) => ({
        ...prev,
        isLiked: wasLiked,
        likeCount: Number(prev.likeCount) + (wasLiked ? 1 : -1)
      }));
      toast.error("Failed to toggle like");
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="relative">
      <div className="flex items-start gap-6">
        <div className="hidden md:flex flex-col items-center gap-4">
          <div className="size-10 border-4 border-black bg-black flex items-center justify-center text-white shrink-0">
            <Terminal size={16} />
          </div>
          <div className="w-1 flex-1 bg-black/10 min-h-[100px]" />
        </div>

        <div className="flex-1 space-y-8 bg-white border-4 border-black p-8 shadow-brutal">
          <div className="flex items-center justify-between border-b-2 border-black border-dashed pb-6">
            <div className="flex items-center gap-4">
              <div className="size-10 border-2 border-black bg-neutral-100 flex items-center justify-center">
                {post.author.image ? <img src={post.author.image} className="size-full object-cover" /> : <User size={18} />}
              </div>
              <div>
                <h3 className="font-black uppercase text-sm leading-none">{post.author.name}</h3>
                <p className="text-[10px] font-black uppercase text-black/40 mt-1">{new Date(post.post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <Badge variant="outline" className="border-2 border-black rounded-none font-black uppercase text-[10px] px-2">LOG_{post.post.id.slice(0, 4)}</Badge>
          </div>

          <div>
            <h2 className="text-4xl font-black uppercase leading-none tracking-tighter mb-6">{post.post.title}</h2>
            <p className="text-lg font-medium leading-relaxed uppercase text-black/60">{post.post.content}</p>
          </div>

          <div className="pt-8 border-t-2 border-black/5">
            <div className="flex items-center gap-2 mb-4 font-black uppercase text-[10px] text-black/40 tracking-widest">
              <Layers size={14} /> Attached Blueprint
            </div>
            <div className="max-w-md">
              <CommunityProjectCard
                project={post.project}
                isBookmarked={post.isBookmarked}
                authorName={post.author.name || "MEMBER"}
                authorImage={post.author.image || undefined}
                showInventoryMatch={!!sessionUser}
                onInitialize={() => onProjectClick(post.project)}
              />
            </div>
          </div>

          <div className="flex items-start gap-6 border-t-2 border-black border-dashed pt-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={cn(
                "group flex items-center transition-all active:scale-95",
                post.isLiked ? "text-brand" : "text-black"
              )}
            >
              <div className={cn(
                "flex items-center gap-2 border-2 border-black px-3 py-1 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all",
                post.isLiked ? "bg-brand/5 border-brand" : "bg-white"
              )}>
                <Heart size={14} className={cn(post.isLiked ? "fill-brand" : "text-black/40")} />
                <span className="font-black uppercase text-[10px] tracking-tight">
                  {post.isLiked ? "Liked" : "Like"}
                </span>
                <div className={cn("w-[2px] h-3", post.isLiked ? "bg-brand/20" : "bg-black/10")} />
                <span className="font-black text-[10px]">
                  {Number(post.likeCount) || 0}
                </span>
              </div>
            </button>

            <CommentSection
              postId={post.post.id}
              sessionUser={sessionUser}
              initialCommentCount={Number(post.commentCount) || 0}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
