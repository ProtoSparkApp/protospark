"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2 } from "lucide-react"
import { categoryEnum, unitEnum, componentSchema } from "@/lib/validators"
import { addComponent } from "@/lib/actions/inventory"
import { toast } from "sonner" 

export function ManualAddForm({ onClose }: { onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});
    
    const data = {
      name: formData.get("name"),
      category: formData.get("category"),
      value: formData.get("value"),
      unit: formData.get("unit"),
      quantity: formData.get("quantity"),
      description: formData.get("description"),
    };

    const result = await addComponent(data);
    setLoading(false);

    if (result.error) {
      if (typeof result.error === "object") {
        setErrors(result.error);
      } else {
        alert(result.error);
      }
    } else {
      onClose();
    }
  }

  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="mb-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter">Register Part</h2>
        <p className="font-mono text-[10px] font-bold text-black/40 uppercase">Manual Entry Protocol v1.0</p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="name">Component Name</Label>
            <Input name="name" id="name" placeholder="E.G. ATMEGA328P" required />
            {errors.name && <p className="text-red-500 font-mono text-[10px] font-bold uppercase">{errors.name[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select name="category" id="category" className="flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
               {categoryEnum.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input name="quantity" id="quantity" type="number" defaultValue="1" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Spec / Value</Label>
            <Input name="value" id="value" placeholder="10k, ESP32, etc" required />
             {errors.value && <p className="text-red-500 font-mono text-[10px] font-bold uppercase">{errors.value[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select name="unit" id="unit" className="flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
               {unitEnum.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <Button variant="neo" className="flex-1 h-14" type="submit" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Save to Stock"}
          </Button>
          <Button variant="outline" className="h-14" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
