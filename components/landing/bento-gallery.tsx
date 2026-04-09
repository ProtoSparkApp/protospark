"use client";

import { motion } from "framer-motion";
import { Lightbulb, Wrench, ShareNetwork, ChartLineUp } from "@phosphor-icons/react";

const projects = [
  {
    title: "ESP32 Cyber-Desk Clock",
    desc: "Nixie-style display using LED strips.",
    difficulty: "Mid",
    class: "md:col-span-2 md:row-span-2",
    theme: "bg-brand/10",
    icon: Lightbulb
  },
  {
    title: "USB PD Trigger",
    desc: "100W Power Delivery testing.",
    difficulty: "Pro",
    class: "md:col-span-1 md:row-span-1",
    theme: "bg-yellow-400/20",
    icon: Wrench
  },
  {
    title: "Retro Console",
    desc: "Pi Zero emulator build.",
    difficulty: "Easy",
    class: "md:col-span-1 md:row-span-2",
    theme: "bg-black/5",
    icon: ShareNetwork
  },
  {
    title: "Smart Solder Hub",
    desc: "Auto-temp monitoring logic.",
    difficulty: "High",
    class: "md:col-span-1 md:row-span-1",
    theme: "bg-brand/20",
    icon: ChartLineUp
  }
];

export function BentoGallery() {
  return (
    <section className="py-24 bg-white border-t-4 border-black">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-center">
            What will you <span className="text-brand">Spark</span>?
          </h2>
          <p className="text-center font-bold uppercase mt-4 text-black/40">Recent projects from the community</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          {projects.map((project, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ translateZ: 20 }}
              className={`border-4 border-black p-8 relative flex flex-col justify-between group ${project.class} ${project.theme}`}
            >
              <div className="flex justify-between items-start">
                <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_#000] transition-all group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none">
                  <project.icon size={32} weight="bold" className="text-brand" />
                </div>
                <span className="font-mono text-[10px] bg-black text-white px-2 py-1 rotate-6 group-hover:rotate-0 transition-transform">
                  LEVEL: {project.difficulty}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black uppercase leading-none tracking-tight mb-2">
                  {project.title}
                </h3>
                <p className="font-mono text-xs font-bold text-black/60 italic">
                  {project.desc}
                </p>
              </div>

              <div className="absolute top-4 right-4 flex gap-1">
                {[1, 2, 3].map(d => <div key={d} className="size-1 rounded-full bg-black/20" />)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
