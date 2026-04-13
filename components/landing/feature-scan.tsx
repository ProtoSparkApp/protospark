"use client";

import { motion } from "framer-motion";
import { Camera, Scan, Brain, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function FeatureScan() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="absolute inset-0 bg-yellow-400 border-4 border-black translate-x-4 translate-y-4 -z-10"></div>
            <div className="bg-white border-4 border-black p-4 relative">
               <div className="aspect-video bg-gray-100 border-2 border-black relative overflow-hidden group">
                  {}
                  <motion.div 
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-x-0 h-1 bg-brand shadow-[0_0_15px_#6c72ff] z-20"
                  />
                  
                  {}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="absolute top-1/4 left-1/4 border-2 border-brand bg-brand/10 p-2 z-10"
                  >
                    <span className="font-mono text-[8px] bg-brand text-white px-1 font-bold">ATMega328P</span>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="absolute bottom-1/3 right-1/4 border-2 border-yellow-500 bg-yellow-500/10 p-2 z-10"
                  >
                    <span className="font-mono text-[8px] bg-yellow-500 text-white px-1 font-bold">10uF CAP</span>
                  </motion.div>

                  <div className="absolute inset-0 flex items-center justify-center grayscale opacity-10">
                    <Scan size={120} weight="thin" />
                  </div>
               </div>
               
               <div className="mt-4 flex justify-between items-center px-2">
                 <div className="flex gap-2">
                    <div className="size-3 bg-red-500 border-2 border-black rounded-none"></div>
                    <div className="size-3 bg-yellow-400 border-2 border-black rounded-none"></div>
                    <div className="size-3 bg-green-500 border-2 border-black rounded-none"></div>
                 </div>
                 <span className="font-mono text-xs font-bold uppercase">System: Scanning...</span>
               </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 bg-brand text-white px-3 py-1 border-2 border-black font-bold uppercase text-[10px]">
              <Camera weight="fill" />
              Vision Engine v2.0
            </div>
            <h2 className="text-4xl md:text-6xl font-black leading-none uppercase tracking-tighter">
              Stop <br />
              <span className="bg-brand text-white px-2">Manual</span> <br />
              Inventory.
            </h2>
            <p className="text-lg font-medium leading-relaxed max-w-md text-black/70">
              Dumping your parts bin? Take a photo. Our neural engine identifies 1,000+ electronic components in seconds including small SMT parts and ICs.
            </p>
            <ul className="space-y-4">
              {[
                { text: "Barcode & IC Marking Recognition", icon: Brain },
                { text: "Automatic Quantity Estimation", icon: CheckCircle },
                { text: "Cloud-Sync with Desktop App", icon: CheckCircle },
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 font-heading font-bold uppercase">
                  <item.icon size={24} weight="bold" className="text-brand" />
                  {item.text}
                </li>
              ))}
            </ul>
            <Button variant="neo" size="lg">
              Try Scanner Demo
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
