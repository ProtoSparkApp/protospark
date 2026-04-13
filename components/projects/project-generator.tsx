"use client";

import { useState, useEffect } from "react";
import { generateProjectIdeas, getProjectFullGuide } from "@/lib/actions/projects";
import { ProjectCard } from "./project-card";
import { ProjectFullGuide } from "./guide-viewer";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProjectGenerator() {
  const [loading, setLoading] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any>(null);
  const [fullGuide, setFullGuide] = useState<any>(null);
  const [resultsMeta, setResultsMeta] = useState<{ canBuildAnything: boolean; emptyStockMessage?: string } | null>(null);

  const fetchIdeas = async (limit = 5) => {
    setLoading(true);
    setIdeas([]);
    setFullGuide(null);
    setSelectedIdea(null);
    
    try {
      const res = await generateProjectIdeas(limit);
      if (res.error) {
        toast.error(res.error);
      } else {
        setIdeas(res.ideas || []);
        setResultsMeta({ 
            canBuildAnything: res.canBuildAnything ?? true, 
            emptyStockMessage: res.emptyStockMessage 
        });
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIdea = async (idea: any) => {
    setSelectedIdea(idea);
    setGuideLoading(true);
    try {
      const res = await getProjectFullGuide(idea);
      if (res.success) {
        setFullGuide(res.data);
      } else {
        toast.error(res.error || "Failed to generate guide.");
      }
    } catch (error) {
      toast.error("Failed to generate project guide.");
    } finally {
      setGuideLoading(false);
    }
  };

  if (fullGuide && selectedIdea) {
    return (
      <ProjectFullGuide 
        idea={selectedIdea} 
        guide={fullGuide} 
        onBack={() => {
          setFullGuide(null);
          setSelectedIdea(null);
        }} 
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-purple-100 px-4 py-2 text-sm font-black text-purple-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
        >
          <Sparkles className="h-4 w-4" />
          AI Project Lab
        </motion.div>
        
        <h1 className="mt-6 text-6xl font-black tracking-tight text-black sm:text-7xl">
          What will you <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent underline decoration-black underline-offset-8">build</span> today?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-neutral-600 leading-relaxed">
          We analyzed your inventory. Here are projects you can build right now, or with a few extra parts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            size="lg"
            onClick={() => fetchIdeas(5)}
            disabled={loading}
            className="h-16 border-4 border-black bg-black px-10 text-xl font-black text-white shadow-brutal transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            {loading ? (
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-6 w-6" />
            )}
            {ideas.length > 0 ? "Regenerate Ideas" : "Generate Project Ideas"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-black" />
          <p className="mt-4 font-black text-xl text-black">Consulting the Spark AI...</p>
        </div>
      )}

      {guideLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="rounded-3xl border-4 border-black bg-white p-12 text-center shadow-brutal">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-purple-600" />
                <h2 className="mt-6 text-3xl font-black text-black">Crafting Your Guide</h2>
                <p className="mt-4 text-neutral-500 font-bold">Drawing schematics and writing instructions...</p>
            </div>
        </div>
      )}

      {!loading && resultsMeta && !resultsMeta.canBuildAnything && ideas.length === 0 && (
         <div className="mx-auto max-w-2xl rounded-3xl border-4 border-black bg-red-50 p-12 text-center shadow-brutal">
            <Package className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-3xl font-black text-black">Limited Inventory</h2>
            <p className="mt-4 text-xl font-bold text-red-800">{resultsMeta.emptyStockMessage}</p>
            <Button 
                variant="outline" 
                onClick={() => fetchIdeas(8)}
                className="mt-8 border-2 border-black font-black"
            >
                Try anyway with more ideas
            </Button>
         </div>
      )}

      <AnimatePresence>
        {ideas.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {ideas.map((idea, index) => (
              <ProjectCard 
                key={index} 
                idea={idea} 
                onSelect={() => handleSelectIdea(idea)} 
              />
            ))}
            
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-300 p-8">
               <Button 
                  onClick={() => fetchIdeas(8)} 
                  variant="ghost" 
                  className="group flex flex-col gap-4 h-auto py-8 hover:bg-neutral-50"
               >
                  <div className="rounded-full bg-neutral-100 p-4 transition-colors group-hover:bg-neutral-200">
                    <RefreshCcw className="h-8 w-8 text-neutral-400 group-hover:text-black" />
                  </div>
                  <span className="text-lg font-black text-neutral-400 group-hover:text-black">Load More Ideas</span>
               </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
