"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cpu, CheckCircle2, ShoppingCart, ArrowRight, Layers } from "lucide-react";
import { motion } from "framer-motion";

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
      className="group relative overflow-hidden rounded-none border-2 border-black bg-white p-6 shadow-brutal transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Badge className="mb-2 border-2 border-black bg-yellow-300 text-black shadow-none hover:bg-yellow-400">
            {idea.difficulty}
          </Badge>
          <h3 className="text-2xl font-black text-black">{idea.title}</h3>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-none border-2 border-black bg-blue-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Cpu className="h-6 w-6 text-white" />
        </div>
      </div>

      <p className="mt-4 text-sm font-medium leading-relaxed text-neutral-600 line-clamp-3">
        {idea.description}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-500">
            <span>Parts Inventory</span>
            <span>{idea.partsCountInStock}/{totalParts} Ready</span>
          </div>
          <div className="mt-1 h-3 border-2 border-black bg-neutral-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-green-400"
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-bold">
          {idea.requiredComponents.slice(0, 4).map((comp, i) => (
            <span
              key={i}
              className={`flex items-center gap-1 border-2 border-black px-2 py-1 ${comp.status === "In Stock" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
            >
              {comp.status === "In Stock" ? (
                <CheckCircle2 className="h-3 w-3" />
              ) : (
                <ShoppingCart className="h-3 w-3" />
              )}
              {comp.name}
            </span>
          ))}
          {idea.requiredComponents.length > 4 && (
            <span className="flex items-center gap-1 border-2 border-black bg-neutral-100 px-2 py-1 text-neutral-600">
              +{idea.requiredComponents.length - 4} more
            </span>
          )}
        </div>
      </div>

      <Button
        onClick={onSelect}
        variant="neo"
        className="mt-6 w-full py-6 rounded-none text-lg"
      >
        View Guide <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  );
}
