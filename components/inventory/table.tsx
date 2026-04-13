"use client"

import { useEffect, useState } from "react"
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
import { AlertTriangle, Trash2, Edit3, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { ManualAddForm } from "./add-form"
import { toast } from "sonner"
import { useDebounce } from "@/hooks/use-debounce"

export function InventoryTable({
  filters
}: {
  filters?: { search: string, category?: string }
}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);

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
  }, [page, debouncedSearch, filters?.category]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters?.category]);

  async function confirmDelete() {
    if (!deleteId) return;
    setLoading(true);
    try {
      const res = await deleteComponent(deleteId);
      if (res.success) {
        toast.success("Part deleted from inventory");
        fetchInventory();
      } else {
        toast.error(res.error || "Delete failed");
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

      <div className="relative">
        {loading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2 className="animate-spin text-brand" size={48} />
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Component</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Spec / Value</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center font-bold uppercase text-black/20">
                  No components in inventory. Register your first part!
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-heading text-lg font-black uppercase text-brand">
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono font-black">{item.value}</span>
                      <span className="font-mono text-xs text-black/50">{item.unit !== "None" ? item.unit : ""}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-black text-xl">
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="xs"
                        className="size-8 p-0 border-2 border-black hover:bg-brand hover:text-white transition-all active:translate-x-1 active:translate-y-1"
                        onClick={() => setEditItem(item)}
                      >
                        <Edit3 size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="xs"
                        className="size-8 p-0"
                        onClick={() => setDeleteId(item.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
              <p className="font-mono text-xs font-bold uppercase mb-8 leading-relaxed">This action will permanently remove this component from the secure stock repository. This is irreversible.</p>

              <div className="flex gap-4">
                <Button
                  variant="destructive"
                  className="flex-1 h-12 text-xs font-black uppercase"
                  onClick={confirmDelete}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin" /> : "Delete Part"}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-12 border-2 border-black text-xs font-black uppercase"
                  onClick={() => setDeleteId(null)}
                  disabled={loading}
                >
                  Cancel
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

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="outline"
          disabled={page === 1 || loading}
          onClick={() => setPage(p => p - 1)}
          className="font-black uppercase text-xs border-2 border-black"
        >
          <ChevronLeft className="mr-2" size={16} /> Previous
        </Button>
        <Button
          variant="outline"
          disabled={page === totalPages || loading}
          onClick={() => setPage(p => p + 1)}
          className="font-black uppercase text-xs border-2 border-black"
        >
          Next <ChevronRight className="ml-2" size={16} />
        </Button>
      </div>
    </div>
  )
}
