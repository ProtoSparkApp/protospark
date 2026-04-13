"use client";

import { motion } from "framer-motion";
import { ShoppingCart, ArrowRight, Truck } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

export function MouserIntegration() {
  return (
    <section className="py-24 bg-brand/5">
      <div className="container mx-auto px-4">
        <div className="bg-black text-white border-4 border-black p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-full bg-brand/20 -skew-x-12 translate-x-32"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-brand p-3 border-2 border-white">
                  <ShoppingCart size={32} weight="fill" />
                </div>
                <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                  Global <br />
                  Inventory.
                </h2>
              </div>
              <p className="text-lg text-white/70 max-w-md font-medium leading-relaxed">
                Found a project but missing a specialized MCU or sensor? One click sends your entire "Missing Parts" bill of materials to Mouser for overnight shipping.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="lg">
                  Browse Mouser Catalog
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Next Day", desc: "Global logistics net", icon: Truck },
                { title: "Smart Cart", icon: ShoppingCart, desc: "Auto-BOM assembly" }
              ].map((card, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border-2 border-white/20 p-6 backdrop-blur-sm"
                >
                  <card.icon size={32} className="text-brand mb-4" />
                  <h3 className="font-heading font-black uppercase text-xl">{card.title}</h3>
                  <p className="text-xs text-white/50 uppercase font-mono mt-2">{card.desc}</p>
                  <ArrowRight size={20} className="mt-6 text-brand" strokeWidth={32} />
                </motion.div>
              ))}
            </div>
          </div>

          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <span className="text-[8rem] font-black uppercase leading-none select-none">MOUSER</span>
          </div>
        </div>
      </div>
    </section>
  );
}
