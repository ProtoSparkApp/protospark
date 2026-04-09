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
import { Trash2, Edit3, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { getInventory, deleteComponent } from "@/lib/actions/inventory"

export function InventoryTable() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  async function fetchInventory() {
    setLoading(true);
    try {
      const res = await getInventory({ page });
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
  }, [page]);

  async function handleDelete(id: string) {
    if (confirm("Are you sure?")) {
      await deleteComponent(id);
      fetchInventory();
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
                      <Button variant="outline" size="xs" className="size-8 p-0 border-2 border-black">
                        <Edit3 size={14} />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="xs" 
                        className="size-8 p-0"
                        onClick={() => handleDelete(item.id)}
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
