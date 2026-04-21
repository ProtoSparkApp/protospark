"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Copy,
  CheckCircle2,
  ShoppingCart,
  ArrowRight,
  User,
  Eye,
  Layers,
  Sparkles,
  Bookmark,
  Trash2,
  X,
  AlertTriangle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bookmarkProject, cloneProject, checkInventoryForProject } from "@/lib/actions/social";
import { deleteProject } from "@/lib/actions/projects";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CommunityProjectCardProps {
  project: any;
  authorName?: string;
  authorImage?: string;
  isBookmarked?: boolean;
  showInventoryMatch?: boolean;
  canDelete?: boolean;
  onInitialize?: (project: any) => void;
  onDeleted?: (projectId: string) => void;
}

export function CommunityProjectCard({
  project,
  authorName,
  authorImage,
  isBookmarked: initialIsBookmarked = false,
  showInventoryMatch = true,
  canDelete = false,
  onInitialize,
  onDeleted
}: CommunityProjectCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setIsBookmarked(initialIsBookmarked);
  }, [initialIsBookmarked]);

  useEffect(() => {
    if (showInventoryMatch) {
      checkInventoryForProject(project.requiredComponents).then(res => {
        if ("status" in res) {
          setInventoryStatus(res);
        }
      });
    }
  }, [project.requiredComponents, showInventoryMatch]);

  const handleBookmark = async () => {
    const res = await bookmarkProject(project.id);
    if ("success" in res) {
      if (res.success === "removed") {
        setIsBookmarked(false);
        toast.success("Removed from archives");
      } else {
        setIsBookmarked(true);
        toast.success("Saved to archives");
      }
    } else {
      toast.error(res.error);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const res = await deleteProject(project.id);
    setIsLoading(false);
    if (res.success) {
      toast.success("Blueprint permanently deleted.");
      if (onDeleted) onDeleted(project.id);
      setShowConfirmDelete(false);
    } else {
      toast.error(res.error || "Failed to delete blueprint.");
    }
  };

  const handleClone = async () => {
    setIsLoading(true);
    const res = await cloneProject(project.id);
    setIsLoading(false);
    if ("success" in res) {
      toast.success("Project cloned to your list!");
    } else {
      toast.error(res.error);
    }
  };

  const totalParts = project.requiredComponents?.length || 0;
  const progress = inventoryStatus ? (inventoryStatus.partsCountInStock / totalParts) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col h-full bg-white border-4 border-black shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-center justify-between p-4 border-b-4 border-black">
        <div className="flex items-center gap-2">
          {authorImage ? (
            <img src={authorImage} alt={authorName} className="w-6 h-6 border-2 border-black" />
          ) : (
            <div className="w-6 h-6 border-2 border-black bg-black flex items-center justify-center">
              <User size={12} className="text-white" />
            </div>
          )}
          <span className="font-mono text-[10px] font-black uppercase tracking-tight truncate max-w-[100px]">
            {authorName || "SYSTEM"}
          </span>
        </div>
        <div className="flex gap-2">
          {canDelete && (
             <Button
              size="icon"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowConfirmDelete(true);
              }}
              className="h-8 w-8 rounded-none border-2 border-black bg-white text-black hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBookmark();
            }}
            className={cn(
              "h-8 w-8 rounded-none border-2 border-black transition-all",
              isBookmarked ? "bg-brand text-white hover:bg-brand/90" : "bg-white text-black hover:bg-neutral-100"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-white/95 backdrop-blur-sm"
          >
            <div className="w-full border-4 border-black bg-white p-6 shadow-brutal text-center space-y-4">
              <div className="flex justify-center">
                <div className="size-12 border-4 border-black bg-red-100 flex items-center justify-center text-red-600">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <div>
                <h4 className="font-black uppercase text-lg leading-tight">Delete Blueprint?</h4>
                <p className="text-[10px] font-black uppercase text-black/40 mt-1">This action cannot be undone.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDelete(false)}
                  className="rounded-none border-2 border-black font-black uppercase text-xs h-10 hover:bg-neutral-100"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="rounded-none border-2 border-black bg-red-600 text-white font-black uppercase text-xs h-10 hover:bg-red-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 flex-1 flex flex-col">
        <div className="mb-4">
          <Badge className="mb-2 border-2 border-black bg-yellow-400 text-black shadow-none rounded-none font-black uppercase text-[10px]">
            {project.difficulty}
          </Badge>
          <h3 className="text-3xl font-black text-black leading-none uppercase tracking-tighter">
            {project.title}
          </h3>
        </div>

        <p className="text-sm font-medium leading-tight text-neutral-500 line-clamp-2 mb-6 uppercase">
          {project.description}
        </p>

        {showInventoryMatch && (
          <div className="mt-auto space-y-4">
            <div className="border-2 border-black p-3 bg-neutral-50">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tight text-black/40 mb-2">
                <span>Silicon Match</span>
                <span>{inventoryStatus?.partsCountInStock || 0}/{totalParts}</span>
              </div>
              <div className="h-3 border-2 border-black bg-white">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand"
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(inventoryStatus?.status || project.requiredComponents || []).slice(0, 4).map((comp: any, i: number) => (
                <span
                  key={i}
                  className={`flex items-center gap-1 rounded-md border-2 border-black px-2 py-1 text-[10px] font-bold ${comp.status === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}
                >
                  {comp.status === "In Stock" ? (
                    <CheckCircle2 size={12} className="shrink-0" />
                  ) : (
                    <ShoppingCart size={12} className="shrink-0" />
                  )}
                  <span className="truncate">{comp.name}</span>
                </span>
              ))}
              {totalParts > 4 && (
                <span className="flex items-center gap-1 rounded-md border-2 border-black bg-neutral-100 px-2 py-1 text-[10px] font-bold text-neutral-600">
                  +{totalParts - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-0">
        {onInitialize ? (
          <Button
            onClick={() => onInitialize(project)}
            variant="neo"
            className="w-full text-xs py-5 rounded-none"
          >
            Initialize Guide <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Link href={`/projects/${project.id}`} className="block">
            <Button
              variant="neo"
              className="w-full text-xs py-5 rounded-none"
            >
              Initialize Guide <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
