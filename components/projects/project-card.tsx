"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, CheckCircle2, ShoppingCart, ArrowRight, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProjectIdea {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  requiredComponents: Array<{
    name: string;
    value: string;
    quantity: number;
    status: "In Stock" | "Need to Buy";
  }>;
  partsCountInStock: number;
  partsCountMissing: number;
}

export function ProjectCard({ idea, onSelect }: { idea: ProjectIdea; onSelect: () => void }) {
  const totalParts = idea.partsCountInStock + idea.partsCountMissing;
  const progress = (idea.partsCountInStock / totalParts) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col h-full bg-white border-4 border-black shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_#6c72ff] overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="absolute top-0 right-0 p-2 font-mono text-[40px] font-black leading-none uppercase rotate-90 origin-top-right translate-x-1/2">
          {idea.title.slice(0, 4)}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-b-4 border-black relative z-10 bg-white">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 border-2 border-black bg-black flex items-center justify-center relative z-10">
              <Cpu size={14} className="text-white" />
            </div>
            <div className="absolute -inset-1 border-2 border-brand/20 -z-0 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[8px] font-black uppercase text-black/40 leading-none mb-0.5">Generator Node</span>
            <span className="font-black uppercase text-[10px] tracking-tight truncate max-w-[120px]">
              SPARK AI
            </span>
          </div>
        </div>
        <div className="flex gap-2">
            <div className="h-10 w-10 rounded-none border-2 border-black bg-neutral-50 flex items-center justify-center opacity-40">
                <Badge className="bg-transparent text-black border-none shadow-none p-0">AI</Badge>
            </div>
        </div>
      </div>

      <div className="p-6 flex-1 flex flex-col relative z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge className="border-2 border-black bg-yellow-400 text-black shadow-[2px_2px_0px_#000] rounded-none font-black uppercase text-[10px] px-2 py-0.5">
              {idea.difficulty}
            </Badge>
            <span className="font-mono text-[8px] font-black uppercase text-black/30">V.GEN // PRTCL: {totalParts}P</span>
          </div>
          <h3 className="text-4xl md:text-5xl font-black text-black leading-[0.85] uppercase tracking-tighter group-hover:text-brand transition-colors">
            {idea.title}
          </h3>
        </div>

        <p className="text-sm font-bold leading-tight text-black/60 line-clamp-2 mb-8 uppercase italic border-l-2 border-black/10 pl-3">
          {idea.description}
        </p>

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
              <span className="bg-black text-white px-1.5 py-0.5">{idea.partsCountInStock}/{totalParts}</span>
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
            {idea.requiredComponents.slice(0, 3).map((comp, i) => (
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
      </div>

      <div className="p-4 pt-0 relative z-10">
        <Button
          onClick={onSelect}
          variant="neo"
          className="w-full h-16 text-sm rounded-none font-black uppercase tracking-widest bg-black text-white hover:bg-brand hover:shadow-none transition-all group-hover:-translate-y-1"
        >
          View Guide <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
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
