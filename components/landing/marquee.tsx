"use client";

import { motion } from "framer-motion";
import { CpuIcon, BatteryChargingIcon, RadioIcon, LightbulbIcon } from "@phosphor-icons/react";
import { MicrochipIcon, CircuitBoardIcon } from "lucide-react";

const components = [
  { name: "NE555P", type: "Timer IC", icon: MicrochipIcon },
  { name: "2N2222", type: "Transistor", icon: CircuitBoardIcon },
  { name: "10kΩ", type: "Resistor", icon: RadioIcon },
  { name: "ESP32-WROOM", type: "MCU", icon: CpuIcon },
  { name: "WS2812B", type: "RGB LED", icon: LightbulbIcon },
  { name: "TP4056", type: "Battery Charger", icon: BatteryChargingIcon },
];

export function ComponentMarquee() {
  return (
    <div className="relative border-y-4 border-black bg-white py-4 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, ease: "linear", repeat: Infinity }}
          className="flex gap-8 items-center"
        >
          {[...components, ...components, ...components].map((comp, i) => (
            <div key={i} className="flex items-center gap-4 group">
              <div className="bg-brand/10 p-2 border-2 border-black shadow-[2px_2px_0px_#000] group-hover:-translate-y-1 group-hover:-translate-x-1 group-hover:shadow-[4px_4px_0px_#000] transition-all">
                <comp.icon size={24} weight="bold" className="text-brand" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black uppercase text-lg tracking-tighter leading-none">
                  {comp.name}
                </span>
                <span className="font-mono text-[10px] uppercase font-bold text-black/50">
                  {comp.type}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
