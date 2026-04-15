"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Loader2, AlertTriangle } from "lucide-react"
import { categoryEnum, unitEnum, componentSchema } from "@/lib/validators"
import { addComponent, updateComponent } from "@/lib/actions/inventory"
import { toast } from "sonner"
import { formatError } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { lookupMouserProduct } from "@/lib/actions/mouser"
import { MouserSelector, MouserProduct } from "./mouser-selector"


export function ManualAddForm({
  onClose,
  initialData
}: {
  onClose: () => void,
  initialData?: any
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [confirmation, setConfirmation] = useState<{
    required: boolean,
    message: string,
    similar: any[],
    data: any
  } | null>(null);
  const [searchingTme, setSearchingTme] = useState(false);
  const [formValues, setFormValues] = useState<any>(initialData || {
    genericName: "",
    mpn: "",
    manufacturer: "",
    category: categoryEnum[0],
    value: "",
    unit: "None",
    quantity: 1,
    description: "",
    metadata: {}
  });
  const [mouserResults, setMouserResults] = useState<MouserProduct[] | null>(null);

  function extractValueAndUnit(description: string, category: string) {
    let value = "N/A";
    let unit = "None";

    if (category === "Resistor" || description.toLowerCase().includes("resistor")) {
      const resUnitMatch = description.match(/(\d+(?:\.\d+)?)\s*(R|kOhm|MOhm|Ohm|k|M)(?:\s|$|\W)/i);
      if (resUnitMatch) {
        value = resUnitMatch[1];
        const u = resUnitMatch[2].toLowerCase();
        if (u.includes('k')) unit = 'kOhm';
        else if (u.includes('m')) unit = 'MOhm';
        else unit = 'Ohm';
      }
    } else if (category === "Capacitor" || description.toLowerCase().includes("capacitor")) {
      const capUnitMatch = description.match(/(\d+(?:\.\d+)?)\s*(uF|nF|pF)(?:\s|$|\W)/i);
      if (capUnitMatch) {
        value = capUnitMatch[1];
        const u = capUnitMatch[2].toLowerCase();
        if (u === 'uf') unit = 'uF';
        else if (u === 'nf') unit = 'nF';
        else if (u === 'pf') unit = 'pF';
      }
    }
    return { value, unit };
  }

  const isEditing = !!initialData;

  async function handleMouserLookup() {
    if (!formValues.mpn) {
      toast.error("Enter a part number (MPN) first");
      return;
    }

    setSearchingTme(true);
    const result = await lookupMouserProduct(formValues.mpn);
    setSearchingTme(false);

    if (result.success && result.products) {
      if (result.products.length === 1) {
        handleProductSelect(result.products[0]);
      } else {
        setMouserResults(result.products);
      }
    } else {
      toast.error(result.error || "No match found in Mouser");
    }
  }

  function handleProductSelect(product: MouserProduct) {
    const { value, unit } = extractValueAndUnit(product.description, product.category || "");
    const normalizedGenericName = product.category || "Component";

    setFormValues((prev: any) => ({
      ...prev,
      genericName: normalizedGenericName,
      mpn: product.name,
      manufacturer: product.producer,
      description: product.description,
      category: product.category || prev.category,
      value: prev.value && prev.value !== "N/A" ? prev.value : value,
      unit: prev.unit && prev.unit !== "None" ? prev.unit : unit,
      metadata: product
    }));
    setMouserResults(null);
    toast.success("Details fetched from Mouser");
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setErrors({});


    const data = {
      genericName: formData.get("genericName"),
      mpn: formData.get("mpn") || null,
      manufacturer: formData.get("manufacturer") || null,
      category: formData.get("category"),
      value: formData.get("value") || "N/A",
      unit: formData.get("unit"),
      quantity: formData.get("quantity"),
      description: formData.get("description") || null,
      metadata: formValues.metadata || {}
    };

    let result;
    if (isEditing) {
      result = await updateComponent(initialData.id, data);
    } else {
      result = await addComponent(data);
    }


    setLoading(false);

    if (result.error) {
      if (typeof result.error === "object") {
        setErrors(result.error);
      } else {
        toast.error(formatError(result.error));
      }
    } else if (result.requiresConfirmation) {
      setConfirmation({
        required: true,
        message: result.message,
        similar: result.similar || [],
        data
      });
    } else {
      toast.success(isEditing ? "Part updated successfully" : "Part registered successfully");
      onClose();
    }
  }

  async function handleConfirm() {
    if (!confirmation) return;
    setLoading(true);
    const result = await addComponent(confirmation.data, true);
    setLoading(false);
    if (result.success) {
      toast.success("Part registered successfully");
      onClose();
    } else {
      toast.error(formatError(result.error) || "Failed to add part");
    }
  }

  async function handleUpdateExisting(item: any, mode: 'add' | 'replace') {
    if (!confirmation) return;
    setLoading(true);

    const newQuantity = mode === 'add'
      ? Number(item.quantity) + Number(confirmation.data.quantity)
      : Number(confirmation.data.quantity);

    const result = await updateComponent(item.id, {
      ...item,
      quantity: newQuantity
    });

    setLoading(false);
    if (result.success) {
      toast.success(`Part stock ${mode === 'add' ? 'increased' : 'updated'}`);
      onClose();
    } else {
      toast.error(formatError(result.error) || "Update failed");
    }
  }

  return (
    <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
      <AnimatePresence>
        {mouserResults && (
          <MouserSelector
            products={mouserResults}
            onSelect={handleProductSelect}
            onClose={() => setMouserResults(null)}
          />
        )}
      </AnimatePresence>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 border-2 border-black hover:bg-black hover:text-white transition-colors"
      >
        <X size={20} />
      </button>

      <div className="mb-8">
        <h2 className="text-4xl font-black uppercase tracking-tighter">
          {isEditing ? "Update Part" : "Register Part"}
        </h2>
        <p className="font-mono text-[10px] font-bold text-black/40 uppercase">
          Manual Entry Protocol {isEditing ? "v1.1-EDIT" : "v1.1"}
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2 col-span-2">
            <Label htmlFor="mpn">Part Number (MPN) - Optional</Label>
            <div className="flex gap-2">
              <Input
                name="mpn"
                id="mpn"
                placeholder="E.G. HC-SR04, NE555"
                value={formValues.mpn}
                onChange={(e) => setFormValues({ ...formValues, mpn: e.target.value })}
                disabled={loading || !!confirmation}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 border-2 border-black h-10 px-3 hover:bg-blue-50"
                onClick={handleMouserLookup}
                disabled={loading || searchingTme || !!confirmation}
              >
                {searchingTme ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
                <span className="ml-2 text-[10px] font-black uppercase">Lookup</span>
              </Button>
            </div>
            {errors.mpn && <p className="text-red-500 font-mono text-[10px] font-bold uppercase">{errors.mpn[0]}</p>}
          </div>

          <div className="space-y-2 col-span-2">
            <Label htmlFor="genericName">General Component Name</Label>
            <Input
              name="genericName"
              id="genericName"
              placeholder="E.G. Resistor, Capacitor, Microcontroller"
              required
              value={formValues.genericName}
              onChange={(e) => setFormValues({ ...formValues, genericName: e.target.value })}
              disabled={loading || !!confirmation}
            />
            {errors.genericName && <p className="text-red-500 font-mono text-[10px] font-bold uppercase">{errors.genericName[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select
              name="category"
              id="category"
              value={formValues.category}
              onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
              disabled={loading || !!confirmation}
              className="flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              {categoryEnum.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              name="quantity"
              id="quantity"
              type="number"
              value={formValues.quantity}
              onChange={(e) => setFormValues({ ...formValues, quantity: e.target.value })}
              required
              disabled={loading || !!confirmation}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Spec / Value</Label>
            <Input
              name="value"
              id="value"
              placeholder="10k, ESP32, etc"
              value={formValues.value}
              onChange={(e) => setFormValues({ ...formValues, value: e.target.value })}
              disabled={loading || !!confirmation}
            />
            {errors.value && <p className="text-red-500 font-mono text-[10px] font-bold uppercase">{errors.value[0]}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <select
              name="unit"
              id="unit"
              value={formValues.unit}
              onChange={(e) => setFormValues({ ...formValues, unit: e.target.value })}
              disabled={loading || !!confirmation}
              className="flex h-10 w-full rounded-none border-2 border-black bg-white px-3 py-2 text-sm font-bold uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
            >
              {unitEnum.map(unit => <option key={unit} value={unit}>{unit}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            name="description"
            id="description"
            placeholder="Technical details..."
            value={formValues.description || ""}
            onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
            disabled={loading || searchingTme || !!confirmation}
          />
        </div>

        <AnimatePresence>
          {confirmation && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-yellow-50 border-2 border-yellow-400 mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-yellow-600 shrink-0" size={20} />
                  <div>
                    <h3 className="font-bold text-sm uppercase">Confirmation Required</h3>
                    <p className="text-xs text-yellow-800 font-medium">{confirmation.message}</p>
                  </div>
                </div>

                {confirmation.similar.length > 0 && (
                  <div className="space-y-4">
                    <p className="font-mono text-[10px] font-black uppercase text-yellow-900 border-b border-yellow-200 pb-1">Similar existing items:</p>
                    <div className="flex flex-col gap-3">
                      {confirmation.similar.map((item: any) => (
                        <div key={item.id} className="p-3 bg-yellow-200/50 border-2 border-yellow-400/50 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black uppercase text-black leading-tight">{item.genericName}</span>
                              <span className="text-[9px] font-mono font-bold uppercase text-black/50">
                                {item.category} • {item.value}{item.unit !== "None" ? item.unit : ""}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[8px] font-mono font-black uppercase text-black/40">Current Stock</span>
                              <span className="font-mono text-xs font-black uppercase">Qty: {item.quantity}</span>
                            </div>
                          </div>


                          <div className="flex gap-2">
                            <Button
                              variant="neo"
                              size="xs"
                              type="button"
                              className="flex-1 bg-black text-white hover:bg-black/80 h-8 text-[9px]"
                              onClick={() => handleUpdateExisting(item, 'add')}
                            >
                              Use this: Add +{confirmation.data.quantity}
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              type="button"
                              className="flex-1 border-2 border-black h-8 text-[9px] font-bold bg-white"
                              onClick={() => handleUpdateExisting(item, 'replace')}
                            >
                              Use this: Replace with {confirmation.data.quantity}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="neo"
                    size="sm"
                    type="button"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black shadow-[2px_2px_0px_#000] h-10 px-4"
                    onClick={handleConfirm}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="animate-spin" /> : "Add Anyway"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    className="border-2 border-black h-10 px-4"
                    onClick={() => setConfirmation(null)}
                    disabled={loading}
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="pt-4 flex gap-4">
          {!confirmation ? (
            <>
              <Button variant="neo" className="flex-1 h-14" type="submit" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : (isEditing ? "Update Stock" : "Save to Stock")}
              </Button>
              <Button variant="outline" className="h-14" type="button" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  )
}
