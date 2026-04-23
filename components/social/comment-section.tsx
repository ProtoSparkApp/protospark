"use client";

import { useState, useEffect, useMemo } from "react";
import { MessageSquare, Send, User, Reply, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addComment, getComments, toggleCommentLike } from "@/lib/actions/social";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
  sessionUser?: any;
  initialCommentCount: number;
}

export function CommentSection({ postId, sessionUser, initialCommentCount }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!isExpanded) return;

    async function loadComments() {
      const data = await getComments(postId);
      setComments(data);
      setIsFetching(false);
    }
    loadComments();
  }, [postId, isExpanded]);

  const handleSubmit = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!sessionUser) {
      toast.error("You must be logged in to comment.");
      return;
    }

    const text = parentId ? replyContent : content;
    if (!text.trim()) return;

    setIsLoading(true);
    const result = await addComment(postId, text, parentId);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else if (result.comment) {
      toast.success(parentId ? "Reply added!" : "Comment added!");
      if (parentId) {
        setReplyContent("");
        setReplyingToId(null);
      } else {
        setContent("");
      }
      setComments(prev => [...prev, {
        comment: result.comment,
        user: sessionUser,
        likeCount: 0,
        isLiked: false,
      }]);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!sessionUser) {
      toast.error("You must be logged in to like.");
      return;
    }


    setComments(prev => prev.map(item => {
      if (item.comment.id === commentId) {
        const isLiked = !item.isLiked;
        return {
          ...item,
          isLiked,
          likeCount: Number(item.likeCount) + (isLiked ? 1 : -1)
        };
      }
      return item;
    }));

    try {
      const result = await toggleCommentLike(commentId);
      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {

      setComments(prev => prev.map(item => {
        if (item.comment.id === commentId) {
          const isLiked = !item.isLiked;
          return {
            ...item,
            isLiked,
            likeCount: Number(item.likeCount) + (isLiked ? 1 : -1)
          };
        }
        return item;
      }));
      toast.error(error instanceof Error ? error.message : "Failed to toggle like");
    }
  };

  const commentTree = useMemo(() => {
    const map = new Map();
    const roots: any[] = [];

    comments.forEach(item => {
      map.set(item.comment.id, { ...item, children: [] });
    });

    comments.forEach(item => {
      if (item.comment.parentId) {
        const parent = map.get(item.comment.parentId);
        if (parent) {
          parent.children.push(map.get(item.comment.id));
        } else {

          roots.push(map.get(item.comment.id));
        }
      } else {
        roots.push(map.get(item.comment.id));
      }
    });


    roots.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
    return roots;
  }, [comments]);

  const renderCommentForm = (parentId?: string) => (
    <form onSubmit={(e) => handleSubmit(e, parentId)} className="flex gap-4">
      <div className="size-10 border-2 border-black bg-neutral-100 flex items-center justify-center shrink-0">
        {sessionUser?.image ? <img src={sessionUser.image} className="size-full object-cover" /> : <User size={18} />}
      </div>
      <div className="flex-1 flex gap-2">
        <Input
          value={parentId ? replyContent : content}
          onChange={(e) => parentId ? setReplyContent(e.target.value) : setContent(e.target.value)}
          placeholder={parentId ? "WRITE A REPLY..." : "WRITE A COMMENT..."}
          className="border-2 border-black rounded-none shadow-brutal-sm font-medium uppercase focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-black/30 bg-white"
          disabled={isLoading}
          autoFocus={!!parentId}
        />
        <Button
          type="submit"
          disabled={isLoading || !(parentId ? replyContent.trim() : content.trim())}
          className="border-2 border-black rounded-none shadow-brutal-sm font-black uppercase px-6"
        >
          {isLoading ? "..." : <Send size={16} />}
        </Button>
      </div>
    </form>
  );

  const renderComment = (node: any, depth = 0) => {
    const isReplying = replyingToId === node.comment.id;
    return (
      <div key={node.comment.id} className="flex flex-col gap-2">
        <div className="flex gap-4 group">
          <div className="size-8 border-2 border-black bg-neutral-100 flex items-center justify-center shrink-0">
            {node.user.image ? <img src={node.user.image} className="size-full object-cover" /> : <User size={14} />}
          </div>
          <div className="flex-1 bg-neutral-50 border-2 border-black p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-black uppercase text-xs">{node.user.name}</span>
              <span className="font-black uppercase text-[10px] text-black/40">
                {new Date(node.comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="font-medium uppercase text-sm text-black/80 break-words mb-4">
              {node.comment.content}
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={() => handleLike(node.comment.id)}
                className={cn(
                  "flex items-center gap-1 font-black uppercase text-[10px] transition-colors hover:text-brand",
                  node.isLiked ? "text-brand" : "text-black/40"
                )}
              >
                <Heart size={12} className={node.isLiked ? "fill-brand" : ""} />
                {Number(node.likeCount) || 0}
              </button>

              {sessionUser && depth < 3 && (
                <button
                  onClick={() => setReplyingToId(isReplying ? null : node.comment.id)}
                  className="flex items-center gap-1 font-black uppercase text-[10px] text-black/40 hover:text-brand transition-colors"
                >
                  <Reply size={12} /> {isReplying ? "Cancel" : "Reply"}
                </button>
              )}
            </div>
          </div>
        </div>

        {isReplying && (
          <div className="ml-12 mt-2">
            {renderCommentForm(node.comment.id)}
          </div>
        )}

        {node.children && node.children.length > 0 && (
          <div className="ml-8 md:ml-12 border-l-2 border-black/10 pl-4 mt-2 flex flex-col gap-4">
            {node.children.map((child: any) => renderComment(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group flex items-center transition-all active:scale-95 text-black"
      >
        <div className="flex items-center gap-2 border-2 border-black px-3 py-1 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-[2px] group-hover:translate-y-[2px] transition-all">
          <MessageSquare size={14} className="text-black/40" />
          <span className="font-black uppercase text-[10px] tracking-tight">Discuss</span>
          <div className="w-[2px] h-3 bg-black/10" />
          <span className="font-black text-[10px]">
            {comments.length > 0 ? comments.length : (initialCommentCount || 0)}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t-2 border-black/10 flex flex-col gap-6"
          >
            {sessionUser ? (
              renderCommentForm()
            ) : (
              <div className="p-4 border-2 border-dashed border-black/20 text-center font-black uppercase text-xs text-black/40">
                Log in to join the discussion
              </div>
            )}

            <div className="flex flex-col gap-4 mt-4">
              {isFetching ? (
                <div className="text-center font-black uppercase text-xs text-black/40 py-4">
                  LOADING COMMUNICATIONS...
                </div>
              ) : commentTree.length === 0 ? (
                <div className="text-center font-black uppercase text-xs text-black/40 py-4">
                  NO COMMENTS YET. BE THE FIRST.
                </div>
              ) : (
                commentTree.map(node => renderComment(node))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
