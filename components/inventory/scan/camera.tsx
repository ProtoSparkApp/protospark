"use client"

import { useEffect, useRef } from "react"
import {
  Loader2,
  Image as ImageIcon,
  Camera,
  RefreshCcw,
  Zap,
  Target,
  ChevronRight,
  Maximize2,
  Scan,
  AlertCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ScanCameraProps {
  videoRef: React.RefObject<HTMLVideoElement | null>
  step: 1 | 2
  images: { step1?: string, step2?: string }
  onCapture: () => void
  onGallerySelect: () => void
  onStartProcessing: () => void
  onRetake: () => void
  connecting: boolean
}

export function ScanCamera({
  videoRef,
  step,
  images,
  onCapture,
  onGallerySelect,
  onStartProcessing,
  onRetake,
  connecting
}: ScanCameraProps) {

  useEffect(() => {
    const video = videoRef.current
    if (video && video.srcObject) {
      video.play().catch(err => console.error("Video play error:", err))
    }
  }, [videoRef, step])

  const isComplete = images.step1 && images.step2

  return (
    <div className="flex-1 flex flex-col bg-zinc-950 relative overflow-hidden min-h-[600px]">
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-8">
        <div className="relative w-full max-w-3xl aspect-[4/3] bg-black border-4 border-black shadow-[20px_20px_0px_rgba(0,0,0,0.3)] overflow-hidden group">

          <div className="w-full h-full relative">
            {!isComplete ? (
              (step === 1 && images.step1) || (step === 2 && images.step2) ? (
                <img
                  src={step === 1 ? images.step1 : images.step2}
                  className="w-full h-full object-contain bg-zinc-900"
                  alt="Captured Preview"
                />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )
            ) : (
              <div className="w-full h-full grid grid-cols-2 gap-1 bg-black">
                <div className="relative group">
                  <img src={images.step1} className="w-full h-full object-cover opacity-80" alt="Step 1" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] px-2 py-0.5 uppercase font-black">Macro_ID</div>
                </div>
                <div className="relative group">
                  <img src={images.step2} className="w-full h-full object-cover opacity-80" alt="Step 2" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[8px] px-2 py-0.5 uppercase font-black">Collection</div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-brand text-white px-4 py-2 border-2 border-black font-black uppercase text-xs shadow-[4px_4px_0px_#000] rotate-[-5deg]">
                    Ready for Analysis
                  </div>
                </div>
              </div>
            )}

            <div className="absolute inset-0 pointer-events-none z-10">
              <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <div className="size-48 border-2 border-white/20 border-dashed rounded-full animate-[spin_20s_linear_infinite]" />
                <Target className="absolute size-10 text-brand" strokeWidth={1} />
              </div>
            </div>

            <div className="absolute top-0 left-0 right-0 p-6 z-20 pointer-events-none">
              <div className="flex justify-between items-start">
                <div className="text-white px-4 py-2 ">
                  <div className="text-[10px] font-black uppercase text-brand/70 leading-none mb-1">Current Step</div>
                  <div className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                    <span className="size-5 bg-brand text-white flex items-center justify-center text-[10px]">0{step}</span>
                    {step === 1 ? 'Component Identification' : 'Bulk Collection Scan'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t-4 border-black p-6 sm:p-10 relative z-30 shadow-[0_-10px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "size-16 border-4 border-black flex items-center justify-center transition-all overflow-hidden bg-zinc-100",
                step === 1 ? "ring-4 ring-brand/20 ring-offset-2" : "opacity-40",
                images.step1 && "border-brand"
              )}>
                {images.step1 ? (
                  <img src={images.step1} className="w-full h-full object-cover" alt="Captured 1" />
                ) : (
                  <Scan className={cn("size-6", step === 1 ? "text-brand" : "text-black/20")} />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Step 01</span>
            </div>

            <ChevronRight className="text-black/20" size={24} strokeWidth={3} />

            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "size-16 border-4 border-black flex items-center justify-center transition-all overflow-hidden bg-zinc-100",
                step === 2 ? "ring-4 ring-brand/20 ring-offset-2" : "opacity-40",
                images.step2 && "border-brand"
              )}>
                {images.step2 ? (
                  <img src={images.step2} className="w-full h-full object-cover" alt="Captured 2" />
                ) : (
                  <Maximize2 className={cn("size-6", step === 2 ? "text-brand" : "text-black/20")} />
                )}
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Step 02</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center md:items-start gap-4">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-heading text-xl font-black uppercase leading-none tracking-tighter">
                {step === 1 ? "Component Macro-Identification" : "Collection Density Analysis"}
              </h3>
              <p className="text-[11px] font-bold text-black/40 uppercase tracking-tight max-w-sm italic">
                {step === 1
                  ? "Ensure component markings are centered and well-lit for optimal OCR extraction."
                  : "Spread items across the surface to ensure accurate quantity estimation."}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-2">
              {!isComplete ? (
                <>
                  <Button
                    size="xl"
                    className="bg-brand text-white hover:bg-brand/90 px-10 relative overflow-hidden group/btn"
                    onClick={onCapture}
                  >
                    <Camera className="mr-3 size-6 group-hover/btn:scale-110 transition-transform" />
                    <span>Capture Frame</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-2 border-black px-6"
                    onClick={onGallerySelect}
                  >
                    <ImageIcon className="mr-2 size-5" />
                    Archive
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="xl"
                    className="bg-black text-white hover:bg-zinc-800 px-12 shadow-[8px_8px_0px_#2563eb]"
                    onClick={onStartProcessing}
                    disabled={connecting}
                  >
                    {connecting ? (
                      <>
                        <Loader2 className="mr-3 animate-spin size-6" />
                        Initializing AI Analysis...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="mr-3 size-6" />
                        Execute Stock Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-2 border-black px-6"
                    onClick={onRetake}
                  >
                    Wipe & Restart
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
