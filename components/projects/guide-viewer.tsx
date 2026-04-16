"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Wrench, 
  AlertTriangle, 
  ChevronRight, 
  CheckCircle2, 
  Circle,
  Save
} from "lucide-react";
import Mermaid from "./mermaid-renderer";
import { useState } from "react";
import { saveProject } from "@/lib/actions/projects";
import { toast } from "sonner";

interface GuideProps {
  idea: any;
  guide: {
    instructions: Array<{ step: number; title: string; content: string }>;
    mermaidiagram: string;
    safetyWarnings: string[];
  };
  onBack: () => void;
}

export function ProjectFullGuide({ idea, guide, onBack }: GuideProps) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveProject({
        ...idea,
        instructions: guide.instructions,
        mermaidiagram: guide.mermaidiagram
      });
      if (res.success) {
        toast.success("Project saved to your dashboard!");
      } else {
        toast.error(res.error || "Failed to save project.");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-8 font-bold border-2 border-transparent hover:border-black"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Ideas
      </Button>

      <div className="grid gap-12 md:grid-cols-[1fr_350px]">
        <div>
          <div className="space-y-4">
            <Badge className="border-2 border-black bg-yellow-300 text-black shadow-none font-bold">
              {idea.difficulty}
            </Badge>
            <h1 className="text-5xl font-black text-black leading-tight">{idea.title}</h1>
            <p className="text-lg text-neutral-600 font-medium">{idea.description}</p>
          </div>

          <div className="mt-12 space-y-12">
            <section>
              <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-black">
                <Wrench className="h-6 w-6 text-blue-500" />
                Connection Diagram
              </h2>
              <div className="rounded-3xl border-4 border-black bg-neutral-100 p-1 shadow-brutal">
                 <Mermaid chart={guide.mermaidiagram} />
              </div>
              <p className="mt-4 text-sm font-bold text-neutral-500 italic text-center">
                * Diagram shows logical connections. Match pin labels to your physical components.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-2 text-2xl font-black text-black">
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">1</div>
                 Step-by-Step Build Guide
              </h2>
              
              <div className="space-y-8">
                {guide.instructions.map((step, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    key={i}
                    className="relative pl-10 before:absolute before:left-3 before:top-8 before:h-[calc(100%-16px)] before:w-1 before:bg-neutral-200"
                  >
                    <div className="absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-white font-bold text-xs ring-4 ring-white">
                      {step.step}
                    </div>
                    <div className="rounded-2xl border-2 border-black bg-white p-6 shadow-brutal transition-transform hover:-translate-y-1">
                      <h3 className="text-xl font-black text-black">{step.title}</h3>
                      <p className="mt-2 text-neutral-600 font-medium leading-relaxed">{step.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <aside className="space-y-8">
          <div className="sticky top-8 space-y-6">
            <div className="rounded-2xl border-4 border-black bg-white p-6 shadow-brutal">
              <h4 className="text-lg font-black text-black mb-4">Bill of Materials</h4>
              <ul className="space-y-3">
                {idea.requiredComponents.map((comp: any, i: number) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-bold">
                    {comp.status === "In Stock" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-neutral-300 shrink-0" />
                    )}
                    <div className="flex-1">
                      <span className="block text-black">{comp.name}</span>
                      <span className="text-[10px] text-neutral-400 uppercase">{comp.value} x{comp.quantity}</span>
                    </div>
                    {comp.status !== "In Stock" && (
                      <Badge className="bg-red-100 text-red-600 border-none text-[10px]">Buy</Badge>
                    )}
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={handleSave} 
                className="mt-6 w-full border-2 border-black bg-green-400 text-black font-black hover:bg-green-500 shadow-brutal"
                disabled={saving}
              >
                <Save className="mr-2 h-4 w-4" /> {saving ? "Saving..." : "Save Project"}
              </Button>
            </div>

            <div className="rounded-2xl border-4 border-black bg-red-50 p-6 shadow-brutal">
              <h4 className="flex items-center gap-2 text-lg font-black text-red-600 mb-4">
                <AlertTriangle className="h-5 w-5" />
                Safety First
              </h4>
              <ul className="list-disc pl-4 space-y-2 text-sm font-medium text-red-800">
                {guide.safetyWarnings.map((warn: string, i: number) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
