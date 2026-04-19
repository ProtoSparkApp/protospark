"use client"

import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, ExternalLink, Box } from "lucide-react"

export interface MouserProduct {
  name: string;
  description: string;
  category: string;
  producer: string;
  photo?: string;
  datasheet?: string;
  url?: string;
  price?: string;
}

export function MouserSelector({ 
  products, 
  onSelect, 
  onClose 
}: { 
  products: MouserProduct[], 
  onSelect: (product: MouserProduct) => void,
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white border-4 border-black shadow-[16px_16px_0px_#000] w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b-4 border-black flex justify-between items-center bg-blue-600 text-white">
          <div className="flex items-center gap-3">
             <Box size={32} strokeWidth={3} />
             <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Mouser Catalog Matched</h2>
                <p className="text-[10px] font-mono font-bold uppercase opacity-80">Select the exact component variant from Mouser database</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 border-2 border-white hover:bg-white hover:text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-zinc-50">
          <div className="grid grid-cols-1 gap-4">
            {products.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group p-4 bg-white border-2 border-black hover:border-blue-600 hover:shadow-[4px_4px_0px_#000000] transition-all cursor-pointer flex gap-6 items-center"
                onClick={() => onSelect(p)}
              >
                <div className="size-20 bg-zinc-100 border-2 border-black overflow-hidden flex items-center justify-center p-2 group-hover:bg-blue-50 transition-colors shrink-0">
                   {p.photo ? (
                     <img src={p.photo} alt={p.name} className="max-w-full max-h-full object-contain" />
                   ) : (
                     <Box size={24} className="text-black/20" />
                   )}
                </div>

                <div className="flex-1 space-y-1">
                   <div className="flex justify-between items-start">
                      <h4 className="font-black text-xl uppercase tracking-tight group-hover:text-blue-600 transition-colors">{p.name}</h4>
                      {p.price && <span className="font-mono font-black text-xs bg-zinc-100 px-2 py-1 border border-black">{p.price}</span>}
                   </div>
                   <p className="font-mono text-[10px] font-bold text-black/40 uppercase">{p.producer} • {p.category}</p>
                   <p className="text-sm font-medium line-clamp-2 text-zinc-600 leading-snug">{p.description}</p>
                </div>

                <div className="flex flex-col gap-2">
                   <Button 
                    variant="neo" 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-black"
                   >
                     Select <Check size={16} className="ml-2" />
                   </Button>
                   {p.url && (
                     <a 
                      href={p.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[9px] font-black uppercase text-black/40 hover:text-blue-600 flex items-center justify-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                     >
                       Specs <ExternalLink size={10} />
                     </a>
                   )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t-4 border-black bg-white">
           <Button variant="outline" className="w-full border-2 border-black h-12 font-black uppercase" onClick={onClose}>
             None of these match, continue manually
           </Button>
        </div>
      </motion.div>
    </div>
  )
}
