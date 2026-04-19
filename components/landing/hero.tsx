"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Activity, CircuitBoard, Target } from "lucide-react";
import { CpuIcon, CubeIcon, LightningIcon } from "@phosphor-icons/react";
import Image from "next/image";

export function Hero() {
  return (
    <section className="min-h-[80dvh] flex items-center relative py-12 lg:py-20">
      <video
        src="/hero.mp4"
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      <div className="container mx-auto px-4 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-black text-white font-mono text-[10px] px-3 py-1.5 uppercase tracking-widest border-2 border-black"
            >
              <LightningIcon weight="fill" className="text-yellow-400" />
              Your Project Management System
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl sm:text-6xl md:text-8xl font-black leading-[0.85] tracking-tighter uppercase"
            >
              Turn your <br />
              <span className="text-brand italic">Electronic slop</span> <br />
              into <span className="underline decoration-black dark:decoration-white decoration-[6px] underline-offset-[8px]">pure gold</span>.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl font-semibold max-w-lg leading-snug text-black/80"
            >
              ProtoSpark scans your component hoard and sparks your next build. From basic circuits to advanced robotics.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Button variant="neo" size="lg" className="group h-14 px-8 text-lg cursor-target">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg" className="h-14 px-8 text-lg cursor-target">
                Browse Projects
              </Button>
            </motion.div>

            <div className="flex gap-8 pt-6 border-t-2 border-black/10 max-w-sm">
              {[
                { label: "Scanned", val: "2.4M", icon: Target },
                { label: "Projects", val: "84k", icon: CubeIcon },
                { label: "Efficiency", val: "99%", icon: Activity }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-xl font-black">{stat.val}</span>
                  <span className="text-[9px] font-mono font-bold uppercase text-black/40">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 hidden lg:block">
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white border-4 border-black p-8 shadow-[10px_10px_0px_#6c72ff] relative z-10"
              >
                <div className="aspect-square bg-white border-2 border-black border-dashed flex items-center justify-center relative overflow-hidden">
                  <Image src="/pcb_hero_render_new.png" alt="Hero" fill className="object-cover" />
                </div>
                <div className="mt-6 space-y-3">
                  <div className="h-1.5 bg-black w-3/4"></div>
                  <div className="h-1.5 bg-black/10 w-full"></div>
                  <div className="h-1.5 bg-black/10 w-5/6"></div>
                </div>
              </motion.div>
              <div className="absolute -top-8 -right-8 size-24 border-4 border-black bg-yellow-400 -z-10 rotate-12"></div>
              <div className="absolute -bottom-8 -left-8 size-32 border-4 border-black bg-brand/20 -z-10 -rotate-6"></div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
