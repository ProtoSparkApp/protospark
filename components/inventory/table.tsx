"use client"

import { useEffect, useState, Fragment } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getInventory, deleteComponent } from "@/lib/actions/inventory"
import { motion, AnimatePresence } from "framer-motion"
import {
  AlertTriangle,
  Trash2,
  Edit3,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Package,
  Info,
  DollarSign,
  Tag
} from "lucide-react"
import { ManualAddForm } from "./add-form"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

export function InventoryTable({
  filters,
  refreshKey
}: {
  filters?: { search: string, category?: string },
  refreshKey?: number
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(filters?.search || "", 300);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await getInventory({
        page,
        search: debouncedSearch,
        category: filters?.category
      });
      setData(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchInventory();
  }, [page, debouncedSearch, filters?.category, refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters?.category]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  async function confirmDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await deleteComponent(deleteId);
      if (res.success) {
        toast.success("Part deleted from inventory");
        fetchInventory();
      } else {
        const errorMessage = typeof res.error === "string" 
          ? res.error 
          : Object.values(res.error || {}).flat().filter(Boolean).join(", ");
        toast.error(errorMessage || "Delete failed");
      }
    } catch (e) {
      toast.error("Operation failed");
    } finally {
      setDeleteId(null);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-4xl font-black uppercase tracking-tighter">Current Stock</h2>
        <div className="flex gap-2 font-mono text-xs font-bold uppercase text-white">
          <span className="bg-black px-2 py-1">Total Items: {total}</span>
          <span className="bg-brand px-2 py-1">Page {page} of {totalPages}</span>
        </div>
      </div>

      <div className="relative border-4 border-black bg-white shadow-brutal">
        {loading && (
          <div className="absolute inset-0 bg-white/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3">
              <div className="size-16 border-4 border-black border-t-brand animate-spin rounded-full" />
              <span className="font-black text-xs uppercase tracking-widest text-black">Scanning Matrix...</span>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b-2 border-black">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[50px] border-r border-black/20"></TableHead>
                <TableHead className="font-black uppercase text-black text-[11px] tracking-wider border-r border-black/20">Identification</TableHead>
                <TableHead className="font-black uppercase text-black text-[11px] tracking-wider border-r border-black/20 hidden md:table-cell">Type_Class</TableHead>
                <TableHead className="font-black uppercase text-black text-[11px] tracking-wider border-r border-black/20">Spec_Values</TableHead>
                <TableHead className="text-right font-black uppercase text-black text-[11px] tracking-wider border-r border-black/20">Quantity</TableHead>
                <TableHead className="text-center font-black uppercase text-black text-[11px] tracking-wider">CMD</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && !loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center bg-zinc-50">
                    <div className="flex flex-col items-center gap-4 opacity-10">
                      <Package size={80} strokeWidth={1} />
                      <span className="font-black uppercase text-2xl tracking-tighter italic">Sector Empty</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => (
                  <Fragment key={item.id}>
                    <TableRow
                      className={`group cursor-pointer transition-all border-b-2 border-black hover:bg-zinc-50/80 ${expandedId === item.id ? 'bg-zinc-100' : ''}`}
                      onClick={() => toggleExpand(item.id)}
                    >
                      <TableCell className="text-center border-r-2 border-black/5">
                        <motion.div
                          animate={{ rotate: expandedId === item.id ? 90 : 0, scale: expandedId === item.id ? 1.2 : 1 }}
                          className="flex justify-center"
                        >
                          <ChevronRight size={18} className={`${expandedId === item.id ? 'text-brand' : 'text-black/20 group-hover:text-black'} transition-colors`} strokeWidth={3} />
                        </motion.div>
                      </TableCell>
                      <TableCell className="border-r-2 border-black/5 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-heading text-lg font-black uppercase text-black leading-none tracking-tight">
                            {item.genericName}
                          </span>
                          {item.mpn && (
                            <span className="font-mono text-[9px] font-black text-brand uppercase tracking-tighter flex items-center gap-1">
                              <Tag size={10} /> {item.mpn}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="border-r-2 border-black/5 hidden md:table-cell">
                        <Badge className="rounded-none border-2 border-black bg-white text-black text-[9px] font-black uppercase hover:bg-zinc-100 shadow-[2px_2px_0px_#000]">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="border-r-2 border-black/5">
                        <div className="flex items-baseline gap-1 bg-zinc-100/50 px-2 py-1 border-2 border-black/5 rounded-none w-fit">
                          <span className="font-mono font-black text-sm text-black">{item.value}</span>
                          <span className="font-mono text-[10px] font-black text-black/40 uppercase">{item.unit !== "None" ? item.unit : ""}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right border-r-2 border-black/5 font-mono font-black text-2xl text-black pr-6">
                        {item.quantity}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()} className="px-4">
                        <div className="flex justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8 rounded-none border-2 border-black bg-white hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                            onClick={() => setEditItem(item)}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="size-8 rounded-none border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-all shadow-[2px_2px_0px_#000] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                            onClick={() => setDeleteId(item.id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    <AnimatePresence>
                      {expandedId === item.id && (
                        <TableRow className="bg-zinc-50 border-b-2 border-black hover:bg-zinc-50">
                          <TableCell colSpan={6} className="p-0">
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="p-10 flex flex-col xl:flex-row gap-12 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none"
                                  style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                                <div className="w-full xl:w-64 shrink-0 space-y-6 z-10">
                                  <div className="aspect-square bg-white border-4 border-black shadow-brutal flex items-center justify-center p-6 relative group bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                                    {item.metadata?.photo ? (
                                      <img src={item.metadata.photo} alt={item.genericName} className="max-w-full max-h-full object-contain drop-shadow-[4px_4px_0px_rgba(0,0,0,0.1)] group-hover:scale-105 transition-transform" />
                                    ) : (
                                      <Package size={64} className="text-black/5" strokeWidth={1} />
                                    )}
                                  </div>
                                  {item.metadata?.price && (
                                    <div className="bg-yellow-300 border-4 border-black p-3 text-center shadow-[4px_4px_0px_#000]">
                                      <span className="block text-[10px] font-black uppercase text-black/50 mb-1 leading-none">Catalog Price</span>
                                      <div className="flex items-center justify-center gap-1 font-mono text-lg font-black text-black">
                                        {item.metadata.price}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 space-y-8 z-10">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-6">
                                      <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 font-mono text-[10px] font-black uppercase text-black/40 mb-1 tracking-[0.2em]">
                                          <Info size={12} className="text-brand" /> OVERVIEW
                                        </h4>
                                        <p className="text-sm font-bold text-black leading-tight border-2 border-black p-4 py-2 bg-white/40 shadow-[4px_4px_0px_#e5e7eb]">
                                          {item.description || "NO_DESCRIPTION_PROVIDED: Technical data incomplete for this component sequence."}
                                        </p>
                                      </div>

                                      {item.manufacturer && (
                                        <div className="space-y-2">
                                          <h4 className="font-mono text-[10px] font-black uppercase text-black/40 mb-1 tracking-[0.2em]">02_VENDOR</h4>
                                          <div className="inline-flex items-center gap-3 bg-black text-white px-4 py-2 text-[12px] font-black uppercase shadow-[6px_6px_0px_#2563eb]">
                                            <Package size={14} className="text-yellow-400" />
                                            {item.manufacturer}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="space-y-6">
                                      <div className="space-y-3">
                                        <h4 className="font-mono text-[10px] font-black uppercase text-black/40 mb-1 tracking-[0.2em]">DOCUMENTATION</h4>
                                        <div className="flex flex-col gap-3">
                                          {item.metadata?.url && (
                                            <a
                                              href={item.metadata.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center justify-between border-2 border-black bg-white p-3 hover:bg-zinc-100 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#000] active:translate-y-0 group"
                                            >
                                              <span className="text-[11px] font-black uppercase tracking-tight">Access Mouser Catalog</span>
                                              <ExternalLink size={14} className="group-hover:text-brand transition-colors" />
                                            </a>
                                          )}
                                          {item.metadata?.datasheet && (
                                            <a
                                              href={item.metadata.datasheet}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center justify-between border-4 border-black bg-white p-3 hover:bg-zinc-100 transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#2563eb] active:translate-y-0 group"
                                            >
                                              <span className="text-[11px] font-black uppercase tracking-tight">Full Technical Datasheet</span>
                                              <ExternalLink size={14} className="group-hover:text-blue-600 transition-colors" />
                                            </a>
                                          )}
                                          {!item.metadata?.url && !item.metadata?.datasheet && (
                                            <div className="p-4 border-2 border-dashed border-black/10 bg-black/5 text-center italic">
                                              <span className="text-[10px] font-bold text-black/30 uppercase">No_External_Uplinks_Detected</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="pt-8 border-t-2 border-dashed border-black/10 flex flex-wrap gap-8">
                                    <div className="flex gap-3 items-center">
                                      <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-black/30 tracking-widest leading-none">Registered</span>
                                        <span className="font-mono text-[10px] font-bold uppercase text-black">{new Date(item.createdAt).toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                      <div className="flex flex-col">
                                        <span className="text-[8px] font-black uppercase text-black/30 tracking-widest leading-none">Last Updated</span>
                                        <span className="font-mono text-[10px] font-bold uppercase text-black">{new Date(item.updatedAt).toLocaleString()}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          </TableCell>
                        </TableRow>
                      )}
                    </AnimatePresence>
                  </Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] w-full max-w-sm"
            >
              <div className="flex items-center gap-4 mb-6 text-red-600">
                <AlertTriangle size={40} strokeWidth={3} />
                <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Confirm <br />Deletion</h3>
              </div>
              <p className="font-mono text-xs font-bold uppercase mb-8 leading-relaxed italic">System Alert: This action will permanently wipe this entry from the secure stock repository. This protocol is non-reversible.</p>

              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="flex-1 h-14 text-xs font-black uppercase rounded-none border-2 border-black shadow-[4px_4px_0px_#000]"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Delete Part"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-14 border-2 border-black text-xs font-black uppercase rounded-none"
                  onClick={() => setDeleteId(null)}
                  disabled={loading}
                >
                  Abort
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {editItem && (
          <div className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <ManualAddForm
              initialData={editItem}
              onClose={() => {
                setEditItem(null);
                fetchInventory();
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center pt-6">
        <Button
          variant="outline"
          disabled={page === 1 || loading}
          onClick={() => setPage(p => p - 1)}
          className="font-black uppercase text-[10px] border-2 border-black h-10 px-6 rounded-none shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          <ChevronLeft className="mr-2" size={14} /> Back
        </Button>
        <div className="font-black text-xs uppercase tracking-widest hidden sm:block">
          Page {page} // {totalPages}
        </div>
        <Button
          variant="outline"
          disabled={page === totalPages || loading}
          onClick={() => setPage(p => p + 1)}
          className="font-black uppercase text-[10px] border-2 border-black h-10 px-6 rounded-none shadow-[4px_4px_0px_#000] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
        >
          Next <ChevronRight className="ml-2" size={14} />
        </Button>
      </div>
    </div>
  )
}
