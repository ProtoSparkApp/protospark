"use client"

import {
  Image as ImageIcon,
  Upload,
  X,
  Check,
  RefreshCcw,
  Loader2,
  FilePlus2,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ScanUploadProps {
  step: 1 | 2
  images: { step1?: string, step2?: string }
  onFileSelect: () => void
  onStartProcessing: () => void
  onRetake: () => void
  connecting: boolean
}

export function ScanUpload({
  step,
  images,
  onFileSelect,
  onStartProcessing,
  onRetake,
  connecting
}: ScanUploadProps) {
  const isComplete = images.step1 && images.step2

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 relative overflow-hidden min-h-[600px]">
      <div className="p-8 border-b-4 border-black bg-white flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter leading-none">
            File Repository
          </h2>
          <p className="font-mono text-[10px] font-black uppercase text-black/40 mt-1">
            Manual Upload Mode
          </p>
        </div>
      </div>

      <div className="flex-1 p-8 flex flex-col items-center justify-center gap-8">
        {!isComplete ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">

            <div className={cn(
              "aspect-video border-4 border-black bg-white shadow-brutal flex flex-col items-center justify-center relative transition-all",
              step === 1 ? "ring-4 ring-brand ring-offset-4" : "opacity-60"
            )}>
              {images.step1 ? (
                <img src={images.step1} className="w-full h-full object-cover" alt="Step 1" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FilePlus2 className="size-12 text-black/10" strokeWidth={1} />
                  <span className="font-black uppercase text-[10px] text-black/40">Identification Scan</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-[8px] font-black uppercase">01 // MACRO</div>
            </div>

            <div className={cn(
              "aspect-video border-4 border-black bg-white shadow-brutal flex flex-col items-center justify-center relative transition-all",
              step === 2 ? "ring-4 ring-brand ring-offset-4" : "opacity-60"
            )}>
              {images.step2 ? (
                <img src={images.step2} className="w-full h-full object-cover" alt="Step 2" />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <FilePlus2 className="size-12 text-black/10" strokeWidth={1} />
                  <span className="font-black uppercase text-[10px] text-black/40">Collection Scan</span>
                </div>
              )}
              <div className="absolute top-4 left-4 bg-black text-white px-2 py-1 text-[8px] font-black uppercase">02 // BULK</div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-4xl space-y-4">
            <div className="bg-green-100 border-4 border-black p-4 flex items-center gap-4 shadow-brutal">
              <div className="size-10 bg-green-500 text-white flex items-center justify-center border-2 border-black">
                <Check size={24} strokeWidth={4} />
              </div>
              <div>
                <h4 className="font-black uppercase text-sm leading-none">Package Complete</h4>
                <p className="text-[10px] font-bold uppercase text-green-700">Send to AI for Analysis</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-video border-4 border-black shadow-brutal overflow-hidden">
                <img src={images.step1} className="w-full h-full object-cover" alt="Step 1" />
              </div>
              <div className="aspect-video border-4 border-black shadow-brutal overflow-hidden">
                <img src={images.step2} className="w-full h-full object-cover" alt="Step 2" />
              </div>
            </div>
          </div>
        )}

        {!isComplete && (
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">
              {step === 1 ? "Upload Identification" : "Upload Collection Shot"}
            </h3>
            <p className="text-[11px] font-bold text-black/40 uppercase leading-tight italic">
              {step === 1
                ? "Select a high-resolution photo showing component markings clearly."
                : "Select a photo showing all items for accurate density analysis."}
            </p>
          </div>
        )}
      </div>

      <div className="bg-white border-t-4 border-black p-8 relative z-30">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {!isComplete ? (
            <Button
              size="xl"
              className="bg-brand text-white hover:bg-brand/90 px-12 shadow-brutal w-full "
              onClick={onFileSelect}
            >
              <Upload className="mr-3 size-6" />
              Select Archive File
            </Button>
          ) : (
            <div className="flex gap-4 mx-auto">
              <Button
                variant="outline"
                size="xl"
                className="border-2 border-black"
                onClick={onRetake}
              >
                <Trash2 className="mr-2" />
                Clear Archive
              </Button>
              <Button
                size="xl"
                className="bg-black text-white hover:bg-zinc-800 px-12 shadow-[8px_8px_0px_#2563eb] flex-1 md:flex-none"
                onClick={onStartProcessing}
                disabled={connecting}
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-3 animate-spin size-6" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="mr-3 size-6" />
                    Execute Scan
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
