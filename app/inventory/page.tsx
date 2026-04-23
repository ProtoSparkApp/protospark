"use client";

import { useState } from "react";
import { InventoryTable } from "@/components/inventory/table";
import { Button } from "@/components/ui/button";
import { Plus, Camera, Filter, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ManualAddForm } from "@/components/inventory/add-form";
import { ScanModal } from "@/components/inventory/scan-modal";
import { categoryEnum } from "@/lib/validators";
import { cn } from "@/lib/utils";
import { exportInventory } from "@/lib/actions/inventory";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FileCode, FileSpreadsheet } from "lucide-react";

export default function InventoryPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const handleExport = async (format: "csv" | "json") => {
    setIsExporting(true);
    try {
      const data = await exportInventory();
      
      if (!data || data.length === 0) {
        toast.error("No data to export");
        return;
      }

      let content = "";
      let filename = `inventory_export_${new Date().toISOString().split("T")[0]}`;

      if (format === "json") {
        content = JSON.stringify(data, null, 2);
        filename += ".json";
      } else {
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(","),
          ...data.map(row => 
            headers.map(fieldName => {
              const value = (row as any)[fieldName];
              if (value === null || value === undefined) return "";
              
              // Don't export objects/JSON in CSV
              if (typeof value === "object" && !(value instanceof Date)) return "[DATA]";
              
              const stringValue = value instanceof Date ? value.toISOString() : String(value);
              
              if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            }).join(",")
          )
        ];
        content = csvRows.join("\r\n");
        filename += ".csv";
      }

      const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Exported as ${format.toUpperCase()}`);
      setShowExportDialog(false);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export inventory");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-12 relative">
        {showAddForm && (
          <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <ManualAddForm
              onClose={() => {
                setShowAddForm(false);
                handleRefresh();
              }}
            />
          </div>
        )}

        {showScanModal && (
          <ScanModal
            onClose={() => {
              setShowScanModal(false);
              handleRefresh();
            }}
          />
        )}

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Data</DialogTitle>
              <DialogDescription>
                Choose your preferred format for the inventory export.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <button
                disabled={isExporting}
                onClick={() => handleExport("csv")}
                className="flex flex-col items-center justify-center gap-3 p-6 border-4 border-black bg-white hover:bg-yellow-400 transition-colors group disabled:opacity-50"
              >
                <FileSpreadsheet size={40} className="group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase text-xs">CSV Spreadsheet</span>
              </button>
              <button
                disabled={isExporting}
                onClick={() => handleExport("json")}
                className="flex flex-col items-center justify-center gap-3 p-6 border-4 border-black bg-white hover:bg-brand hover:text-white transition-colors group disabled:opacity-50"
              >
                <FileCode size={40} className="group-hover:scale-110 transition-transform" />
                <span className="font-black uppercase text-xs">JSON Objects</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>

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
            <Button
              variant="neo"
              size="xl"
              className="group"
              onClick={() => setShowScanModal(true)}
            >
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
          <aside className="lg:col-span-3 space-y-8">
            <div className="border-4 border-black p-6 bg-white shadow-brutal space-y-6">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <Filter size={18} />
                <span className="font-heading font-black uppercase tracking-tight">Active Filters</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-black uppercase text-black/50">Search Name</label>
                  <div className="relative">
                    <Input
                      placeholder="E.G. RESISTOR..."
                      className="h-8 text-xs pr-8"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      maxLength={255}
                    />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-black/20 hover:text-black transition-colors"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-black uppercase text-black/50">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryEnum.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategory(category === cat ? undefined : cat)}
                        className={cn(
                          "border-2 border-black px-2 py-1 text-[10px] font-black uppercase transition-all",
                          category === cat
                            ? "bg-black text-white shadow-[2px_2px_0px_#000] -translate-x-0.5 -translate-y-0.5"
                            : "hover:bg-black/5"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full font-black uppercase text-xs h-8"
                onClick={() => {
                  setSearch("");
                  setCategory(undefined);
                }}
              >
                Clear All
              </Button>
            </div>

            <div className="border-4 border-black p-6 bg-brand text-white shadow-brutal">
              <Download size={24} className="mb-4" />
              <h3 className="font-heading text-xl font-black uppercase leading-tight mb-2">Export Inventory</h3>
              <p className="text-xs font-bold leading-relaxed mb-4">Download your entire stock as CSV or JSON for offline engineering.</p>
              <Button 
                onClick={() => setShowExportDialog(true)}
                className="w-full bg-white text-black hover:bg-white/90 border-none rounded-none font-black uppercase text-xs"
              >
                Export Now
              </Button>
            </div>
          </aside>

          <div className="lg:col-span-9">
            <InventoryTable
              refreshKey={refreshKey}
              filters={{ search, category }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
