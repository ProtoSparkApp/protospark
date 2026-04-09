"use client";

import { useState } from "react";
import { InventoryTable } from "@/components/inventory/table";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Filter, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManualAddForm } from "@/components/inventory/add-form";

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 relative">
        {showAddForm && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <ManualAddForm onClose={() => setShowAddForm(false)} />
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Inventory <br />
              <span className="text-brand">Manager</span>
            </h1>
            <p className="font-medium text-xl max-w-md">
              The central hub for all your silicon. Sort, scan, and track your components with industrial precision.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="neo" size="xl" className="group">
              <Camera className="mr-2 group-hover:rotate-12 transition-transform" />
              Scan Parts
            </Button>
            <Button 
              variant="default" 
              size="xl" 
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="mr-2" />
              Add Manually
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12">
           {}
           <aside className="lg:col-span-3 space-y-8">
              <div className="border-4 border-black p-6 bg-white shadow-brutal space-y-6">
                <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                  <Filter size={18} />
                  <span className="font-heading font-black uppercase tracking-tight">Active Filters</span>
                </div>
                
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="font-mono text-[10px] font-black uppercase text-black/50">Search Name</label>
                      <Input placeholder="E.G. RESISTOR..." className="h-8 text-xs" />
                   </div>
                   
                   <div className="space-y-2">
                      <label className="font-mono text-[10px] font-black uppercase text-black/50">Category</label>
                      <div className="flex flex-wrap gap-2">
                         {["MCU", "IC", "PASSIVE", "COMS", "POWER"].map(cat => (
                           <button key={cat} className="border-2 border-black px-2 py-1 text-[10px] font-black uppercase hover:bg-black hover:text-white transition-colors">
                              {cat}
                           </button>
                         ))}
                      </div>
                   </div>
                </div>

                <Button variant="outline" className="w-full font-black uppercase text-xs h-8">
                   Clear All
                </Button>
              </div>

              <div className="border-4 border-black p-6 bg-brand text-white shadow-[8px_8px_0px_#000]">
                 <Download size={24} className="mb-4" />
                 <h3 className="font-heading text-xl font-black uppercase leading-tight mb-2">Export Inventory</h3>
                 <p className="text-xs font-bold leading-relaxed mb-4">Download your entire stock as CSV or JSON for offline engineering.</p>
                 <Button className="w-full bg-white text-black hover:bg-white/90 border-none rounded-none font-black uppercase text-xs">
                    Export Now
                 </Button>
              </div>
           </aside>

           {}
           <div className="lg:col-span-9">
              <InventoryTable />
           </div>
        </div>
      </main>
    </div>
  );
}
