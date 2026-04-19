"use client";

import { useState, useEffect } from "react";
import { generateProjectIdeas, getProjectFullGuide, type ProjectIdea, type ProjectGuide } from "@/lib/actions/projects";
import { ProjectCard } from "./project-card";
import { ProjectFullGuide } from "./guide-viewer";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCcw, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function ProjectGenerator() {
  const [loading, setLoading] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);
  const [ideas, setIdeas] = useState<ProjectIdea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<ProjectIdea | null>(null);
  const [fullGuide, setFullGuide] = useState<ProjectGuide | null>(null);
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
      } else if (res.success) {
        setIdeas(res.ideas || []);
        setResultsMeta({ 
            canBuildAnything: res.canBuildAnything, 
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
          className="inline-flex items-center gap-2 border-2 border-black bg-brand px-4 py-2 text-xs font-black uppercase text-white shadow-[4px_4px_0px_0px_black]"
        >
          <Sparkles className="h-4 w-4" />
          AI Project Lab
        </motion.div>
        
        <h1 className="mt-6 text-6xl font-black tracking-tighter text-black sm:text-7xl uppercase leading-none">
          What will you <br />
          <span className="text-brand">build</span> today?
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-medium text-neutral-600 leading-relaxed">
          We analyzed your inventory. Here are projects you can build right now, or with a few extra parts.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Button
            variant="neo"
            size="xl"
            onClick={() => fetchIdeas(5)}
            disabled={loading}
            className="h-20 px-12 text-2xl rounded-none w-full md:w-auto uppercase"
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
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="border-4 border-black bg-white p-12 text-center shadow-[12px_12px_0px_0px_black] max-w-md">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-brand" />
                <h2 className="mt-6 text-4xl font-black text-black uppercase tracking-tighter">Crafting Your Guide</h2>
                <p className="mt-4 text-neutral-600 font-bold uppercase text-sm">Drawing schematics and writing instructions...</p>
            </div>
        </div>
      )}

      {!loading && resultsMeta && !resultsMeta.canBuildAnything && ideas.length === 0 && (
          <div className="mx-auto max-w-2xl border-4 border-black bg-white p-12 text-center shadow-[8px_8px_0px_0px_rgba(239,68,68,1)]">
            <Package className="mx-auto h-16 w-16 text-red-500" />
            <h2 className="mt-6 text-4xl font-black text-black uppercase tracking-tighter">Limited Inventory</h2>
            <p className="mt-4 text-xl font-bold text-red-600 uppercase italic">"{resultsMeta.emptyStockMessage}"</p>
            <Button 
                variant="neo" 
                onClick={() => fetchIdeas(8)}
                className="mt-8 px-8 py-6 rounded-none bg-black hover:bg-neutral-900"
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
            
            <div className="flex flex-col items-center justify-center border-4 border-black border-dashed bg-white p-8 group hover:bg-neutral-50 transition-colors">
               <button 
                  onClick={() => fetchIdeas(8)} 
                  className="flex flex-col items-center gap-4 w-full h-full py-8"
               >
                  <div className="border-2 border-black bg-neutral-100 p-4 transition-all group-hover:scale-110 shadow-[4px_4px_0px_0px_black] group-hover:shadow-[6px_6px_0px_0px_black]">
                    <RefreshCcw className="h-8 w-8 text-black" />
                  </div>
                  <span className="text-xl font-black text-black uppercase tracking-tighter mt-4">Load More Ideas</span>
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
