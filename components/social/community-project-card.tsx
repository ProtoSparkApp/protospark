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
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { bookmarkProject, cloneProject, checkInventoryForProject } from "@/lib/actions/social";
import { toast } from "sonner";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface CommunityProjectCardProps {
  project: any;
  authorName?: string;
  authorImage?: string;
  isBookmarked?: boolean;
  showInventoryMatch?: boolean;
}

export function CommunityProjectCard({
  project,
  authorName,
  authorImage,
  isBookmarked: initialIsBookmarked = false,
  showInventoryMatch = true
}: CommunityProjectCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [inventoryStatus, setInventoryStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        toast.success("Removed from library");
      } else {
        setIsBookmarked(true);
        toast.success("Saved to library");
      }
    } else {
      toast.error(res.error);
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
      {/* Header */}
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
          <button
            onClick={handleBookmark}
            className={cn(
              "p-1.5 border-2 border-black transition-colors",
              isBookmarked ? "bg-red-400 text-black" : "hover:bg-neutral-100"
            )}
          >
            <Heart size={14} fill={isBookmarked ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleClone}
            disabled={isLoading}
            className="p-1.5 border-2 border-black hover:bg-yellow-400 transition-colors"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

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

            <div className="flex flex-wrap gap-1">
              {inventoryStatus?.status.slice(0, 3).map((comp: any, i: number) => (
                <span
                  key={i}
                  className={`flex items-center gap-1 border-2 border-black px-1.5 py-0.5 text-[9px] font-black uppercase ${comp.status === "In Stock" ? "bg-green-400" : "bg-red-400"
                    }`}
                >
                  {comp.name}
                </span>
              ))}
              {totalParts > 3 && (
                <span className="flex items-center gap-1 border-2 border-black bg-neutral-100 px-1.5 py-0.5 text-[9px] font-black uppercase">
                  +{totalParts - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 pt-0">
        <Link href={`/projects/${project.id}`} className="block">
          <Button
            variant="neo"
            className="w-full text-xs py-5 rounded-none"
          >
            Initialize Guide <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
