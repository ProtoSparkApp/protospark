"use client";

import { cn } from "@/lib/utils";
import { getRankByProjectCount, getRankProgress } from "@/lib/utils/rank";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface RankBadgeProps {
  projectCount: number;
  showProgress?: boolean;
  className?: string;
}

export function RankBadge({ projectCount, showProgress = true, className }: RankBadgeProps) {
  const rank = getRankByProjectCount(projectCount);
  const progressData = getRankProgress(projectCount);

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className={cn("flex items-center gap-2 font-black uppercase text-sm shrink-0", rank.color)}>
        <Trophy size={18} className="text-yellow-500" />
        <span className="text-black/40 mr-1">Rank:</span> {rank.name}
      </div>

      {showProgress && progressData.next && (
        <div className="hidden md:flex flex-col gap-1 w-48 lg:w-64 shrink-0">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-black/40 tracking-tighter">
            <span>Next: {progressData.next} ({progressData.current}/{progressData.needed})</span>
            <span>{progressData.progress}%</span>
          </div>
          <div className="h-3 w-full bg-white border-2 border-black shadow-[2px_2px_0px_#000]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressData.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-brand" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
