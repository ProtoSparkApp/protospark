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
  Save,
  MessageSquare,
  Terminal
} from "lucide-react";
import Mermaid from "./mermaid-renderer";
import { useState, useEffect } from "react";
import { saveProject, toggleProjectVisibility } from "@/lib/actions/projects";
import { createBlogPost, checkInventoryForProject } from "@/lib/actions/social";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface GuideProps {
  idea: any;
  guide: {
    instructions: Array<{ step: number; title: string; content: string }>;
    mermaidiagram: string;
    safetyWarnings: string[];
  };
  onBack: () => void;
  savedId?: string;
  isOwner?: boolean;
  initialIsPublic?: boolean;
}

export function ProjectFullGuide({ idea, guide, onBack, savedId, isOwner, initialIsPublic }: GuideProps) {
  const [saving, setSaving] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic || false);
  const [isPosting, setIsPosting] = useState(false);
  const [showDiagram, setShowDiagram] = useState(true);
  const [components, setComponents] = useState(idea.inventoryStatus?.status || idea.requiredComponents || []);
  const [localSavedId, setLocalSavedId] = useState(savedId);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishData, setPublishData] = useState({
    title: `FINISHED: ${idea.title.toUpperCase()}`,
    content: `I just completed this project using ProtoSpark! The build process was smooth and the connection diagram provided clear guidance. Highly recommended for anyone looking to build this.`
  });

  useEffect(() => {
    setShowDiagram(true);
  }, [guide.mermaidiagram]);

  useEffect(() => {
    if (idea.requiredComponents?.length > 0 && !idea.inventoryStatus) {
      checkInventoryForProject(idea.requiredComponents).then(res => {
        if (res && "status" in res) {
          setComponents(res.status);
        }
      });
    } else if (idea.inventoryStatus) {
      setComponents(idea.inventoryStatus.status);
    }
  }, [idea.requiredComponents, idea.inventoryStatus]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await saveProject({
        ...idea,
        instructions: guide.instructions,
        mermaidiagram: guide.mermaidiagram,
        safetyWarnings: guide.safetyWarnings
      });
      if (res.success) {
        toast.success("Project saved to your dashboard!");
        if (res.project) {
          setLocalSavedId(res.project.id);
        }
      } else {
        toast.error(res.error || "Failed to save project.");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublic = async () => {
    if (!localSavedId) return;
    const newStatus = !isPublic;
    setIsPublic(newStatus);
    const res = await toggleProjectVisibility(localSavedId, newStatus);
    if (res.success) {
      toast.success(newStatus ? "Project is now Public" : "Project is now Private");
    }
  };

  const handlePostToBlog = () => {
    if (!localSavedId) {
      toast.error("Please save the project first.");
      return;
    }
    setIsPublishDialogOpen(true);
  };

  const confirmPostToBlog = async () => {
    if (!publishData.title.trim() || !publishData.content.trim()) {
      toast.error("Title and content are required.");
      return;
    }

    setIsPosting(true);
    try {
      const res = await createBlogPost({
        projectId: localSavedId!,
        title: publishData.title,
        content: publishData.content,
      });
      if ("success" in res) {
        toast.success("Build log shared to community blog!");
        setIsPublishDialogOpen(false);
      } else {
        toast.error(res.error);
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred.");
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="font-bold border-2 border-transparent hover:border-black"
        >
          <ArrowLeft className="mr-2 h-5 w-5" /> Back
        </Button>

        {isOwner && localSavedId && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTogglePublic}
              className={`font-black uppercase italic ${isPublic ? "bg-green-400 text-black border-black" : "border-black"}`}
            >
              {isPublic ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Circle className="mr-2 h-4 w-4" />}
              {isPublic ? "Public" : "Make Public"}
            </Button>
            <Button
              variant="neo"
              size="sm"
              onClick={handlePostToBlog}
              disabled={isPosting}
              className="font-black border-2 border-black"
            >
              {isPosting ? <Terminal className="mr-2 h-4 w-4 animate-pulse" /> : <MessageSquare className="mr-2 h-4 w-4" />}
              Share to Blog
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="h-6 w-6 text-brand" />
              Publish Build Log
            </DialogTitle>
            <p className="text-xs font-black uppercase text-black/40 tracking-widest mt-2">
              Share your success with the ProtoSpark community.
            </p>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-black uppercase text-[10px] tracking-widest">Post Title</Label>
              <Input 
                id="title"
                value={publishData.title}
                onChange={(e) => setPublishData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="The Ultimate Build Log..."
                className="border-2 border-black rounded-none font-bold placeholder:text-black/20 focus-visible:ring-0 focus-visible:border-brand"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="font-black uppercase text-[10px] tracking-widest">Your Report</Label>
              <Textarea 
                id="content"
                value={publishData.content}
                onChange={(e) => setPublishData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Tell us about your experience..."
                className="min-h-[150px] border-2 border-black rounded-none font-medium placeholder:text-black/20 focus-visible:ring-0 focus-visible:border-brand resize-none uppercase text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsPublishDialogOpen(false)}
              className="border-2 border-black rounded-none font-black uppercase"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmPostToBlog}
              disabled={isPosting}
              className="bg-brand text-white border-2 border-black rounded-none font-black uppercase shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {isPosting ? "Transmitting..." : "Initialize Publication"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            {showDiagram && (
              <section>
                <h2 className="mb-6 flex items-center gap-2 text-2xl font-black text-black">
                  <Wrench className="h-6 w-6 text-blue-500" />
                  Connection Diagram
                </h2>
                <div className="rounded-none border-4 border-black bg-neutral-100 p-1 shadow-brutal">
                  <Mermaid chart={guide.mermaidiagram} onHide={() => setShowDiagram(false)} />
                </div>
                <p className="mt-4 text-sm font-bold text-neutral-500 italic text-center">
                  * Diagram shows logical connections. Match pin labels to your physical components.
                </p>
              </section>
            )}

            <section className="space-y-6">
              <h2 className="flex items-center gap-2 text-2xl font-black text-black">
                <div className="flex h-8 w-8 items-center justify-center rounded-none bg-black text-white">1</div>
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
                    <div className="rounded-none border-2 border-black bg-white p-6 shadow-brutal transition-transform hover:-translate-y-1">
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
            <div className="rounded-none border-4 border-black bg-white p-6 shadow-brutal">
              <h4 className="text-lg font-black text-black mb-4">Bill of Materials</h4>
              <ul className="space-y-3">
                {components.map((comp: any, i: number) => (
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

              {(!localSavedId || !isOwner) && (
                <Button
                  onClick={handleSave}
                  className="mt-6 w-full border-2 border-black bg-green-400 text-black font-black hover:bg-green-500 shadow-brutal"
                  disabled={saving}
                >
                  <Save className="mr-2 h-4 w-4" /> 
                  {saving ? "Saving..." : (isOwner ? "Save Project" : "Add to My Library")}
                </Button>
              )}
            </div>

            <div className="rounded-none border-4 border-black bg-red-50 p-6 shadow-brutal">
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
