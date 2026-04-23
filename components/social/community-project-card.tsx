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
  Cpu,
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
  onBookmarkToggle?: (projectId: string, isBookmarked: boolean) => void;
}

export function CommunityProjectCard({
  project,
  authorName,
  authorImage,
  isBookmarked: initialIsBookmarked = false,
  showInventoryMatch = true,
  canDelete = false,
  onInitialize,
  onDeleted,
  onBookmarkToggle
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
        if (onBookmarkToggle) onBookmarkToggle(project.id, false);
      } else {
        setIsBookmarked(true);
        toast.success("Saved to archives");
        if (onBookmarkToggle) onBookmarkToggle(project.id, true);
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
      className="group relative flex flex-col h-full bg-white border-4 border-black shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#6c72ff] overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute top-0 right-0 p-2 font-mono text-[40px] font-black leading-none uppercase rotate-90 origin-top-right translate-x-1/2">
          {project.title.slice(0, 4)}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-b-4 border-black relative z-10 bg-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            {authorImage ? (
              <img src={authorImage} alt={authorName} className="w-8 h-8 border-2 border-black object-cover relative z-10" />
            ) : (
              <div className="w-8 h-8 border-2 border-black bg-black flex items-center justify-center relative z-10">
                <User size={14} className="text-white" />
              </div>
            )}
            <div className="absolute -inset-1 border-2 border-brand/20 -z-0 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-black uppercase text-black/40 leading-none mb-0.5">Author Node</span>
            <span className="font-black uppercase text-[10px] tracking-tight truncate max-w-[120px]">
              {authorName || "SYSTEM"}
            </span>
          </div>
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
              className="h-10 w-10 rounded-none border-2 border-black bg-white text-black hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="h-5 w-5" />
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
              "h-10 w-10 rounded-none border-2 border-black transition-all",
              isBookmarked ? "bg-brand text-white hover:bg-brand/90" : "bg-white text-black hover:bg-neutral-100"
            )}
          >
            <Bookmark className={cn("h-5 w-5", isBookmarked && "fill-current")} />
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

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_#000] rounded-none font-black uppercase text-[10px] px-2 py-0.5">
              {project.difficulty}
            </Badge>
            <span className="font-mono text-[8px] font-black uppercase text-black/30">V.042 // PRTCL: {totalParts}P</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-black leading-[0.85] uppercase tracking-tighter group-hover:text-brand transition-colors">
            {project.title}
          </h3>
        </div>

        <p className="text-sm font-bold leading-tight text-black/60 line-clamp-2 mb-8 uppercase italic border-l-2 border-black/10 pl-3">
          {project.description}
        </p>

        {showInventoryMatch && (
          <div className="mt-auto space-y-6">
            <div className="border-4 border-black p-4 bg-neutral-50 shadow-none relative overflow-hidden group/progress">
               {/* Pattern overlay for progress bar section */}
               <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
                    style={{ backgroundImage: 'linear-gradient(45deg, black 25%, transparent 25%, transparent 50%, black 50%, black 75%, transparent 75%, transparent)' , backgroundSize: '10px 10px'}} />
               
              <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-tight text-black mb-3 relative z-10">
                <div className="flex items-center gap-1.5">
                  <Cpu size={14} className="text-brand" />
                  <span>Silicon Match Status</span>
                </div>
                <span className="bg-black text-white px-1.5 py-0.5">{inventoryStatus?.partsCountInStock || 0}/{totalParts}</span>
              </div>
              
              <div className="h-5 border-2 border-black bg-white relative overflow-hidden z-10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand relative"
                  transition={{ duration: 1.5, ease: "easeOut" }}
                >
                  {/* Sheen effect */}
                  <motion.div 
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-white/30 skew-x-12"
                  />
                </motion.div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(inventoryStatus?.status || project.requiredComponents || []).slice(0, 3).map((comp: any, i: number) => (
                <span
                  key={i}
                  className={cn(
                    "flex items-center gap-1.5 border-2 border-black px-2.5 py-1.5 text-[9px] font-black uppercase transition-all hover:scale-105",
                    comp.status === "In Stock" ? "bg-green-100 text-green-700 shadow-[2px_2px_0px_#15803d]" : "bg-red-100 text-red-700 shadow-[2px_2px_0px_#b91c1c]"
                  )}
                >
                  {comp.status === "In Stock" ? (
                    <CheckCircle2 size={12} className="shrink-0" />
                  ) : (
                    <ShoppingCart size={12} className="shrink-0" />
                  )}
                  <span className="truncate max-w-[80px]">{comp.name}</span>
                </span>
              ))}
              {totalParts > 3 && (
                <span className="flex items-center gap-1 border-2 border-black bg-neutral-900 text-white px-2 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_#000]">
                  +{totalParts - 3} MORE
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-0 relative z-10">
        {onInitialize ? (
          <Button
            onClick={() => onInitialize(project)}
            variant="neo"
            className="w-full h-16 text-sm rounded-none font-black uppercase tracking-widest bg-black text-white hover:bg-brand hover:shadow-none transition-all group-hover:-translate-y-1"
          >
            Access Blueprint <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        ) : (
          <Link href={`/projects/${project.id}`} className="block">
            <Button
              variant="neo"
              className="w-full h-16 text-sm rounded-none font-black uppercase tracking-widest bg-black text-white hover:bg-brand transition-all"
            >
              Access Blueprint <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        )}
      </div>

      {/* Modern Tactical Details */}
      <div className="absolute top-0 right-0 p-1 opacity-20 pointer-events-none select-none">
        <div className="size-4 border-t border-r border-black" />
      </div>
      <div className="absolute bottom-0 left-0 p-1 opacity-20 pointer-events-none select-none">
        <div className="size-4 border-b border-l border-black" />
      </div>
    </motion.div>
  );
}
