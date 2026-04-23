"use client"

import { QRCodeSVG } from "qrcode.react"
import { Smartphone, MonitorSmartphone, Camera, Loader2, Image as ImageIcon, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScanSelectionProps {
  sessionId: string | null
  mobileLink: string
  onCameraSelect: () => void
  onGallerySelect: () => void
}

export function ScanSelection({ sessionId, mobileLink, onCameraSelect, onGallerySelect }: ScanSelectionProps) {
  return (
    <>
      <div className="p-8 border-b-4 border-black bg-brand text-white flex justify-between items-end">
        <div>
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-2">
            Optical Assessment
          </h2>
          <p className="font-mono text-xs font-bold uppercase tracking-wider opacity-80">
            Select Imaging Device • Session: {sessionId || "GENERATING..."}
          </p>
        </div>
      </div>

      <div className="flex-1 grid md:grid-cols-2 bg-zinc-50 divide-y-4 md:divide-y-0 md:divide-x-4 divide-black">
        <div className="p-8 flex flex-col justify-center items-center group relative overflow-hidden transition-colors hover:bg-zinc-100">
          <MonitorSmartphone size={80} strokeWidth={1} className="mb-6 z-10" />
          <h3 className="text-3xl font-black uppercase tracking-tighter mb-4 z-10 relative">Use This Device</h3>
          <p className="text-center font-medium max-w-xs mb-8 z-10 relative">
            Activate the built-in webcam. Optimal for large components or if you have a secondary macro-lens setup.
          </p>

          <div className="flex gap-2 w-full max-w-xs">
            <Button
              size="xl"
              className="bg-brand text-white hover:bg-brand/90 px-10 shadow-brutal w-full flex-1 font-black uppercase z-10 relative"
              onClick={onCameraSelect}
            >
              <Zap className="mr-3 size-6" />
              Open Lens
            </Button>
            <Button
              size="xl"
              variant="outline"
              className="px-4 border-2 border-black z-10 relative shadow-[4px_4px_0px_#000]"
              onClick={onGallerySelect}
            >
              <ImageIcon />
            </Button>
          </div>
        </div>

        <div className="p-8 flex flex-col justify-center items-center relative transition-colors hover:bg-zinc-100">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone size={32} />
            <h3 className="text-3xl font-black uppercase tracking-tighter">Remote Scan</h3>
          </div>

          <p className="text-center font-medium max-w-xs mb-8">
            Point your smartphone camera at this code. Your phone acts as the macro lens for this session.
          </p>

          <div className="relative group">
            <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 pointer-events-none transition-transform group-hover:translate-x-3 group-hover:translate-y-3" />
            <div className="p-4 bg-white border-4 border-black relative">
              {sessionId ? (
                <QRCodeSVG
                  value={mobileLink}
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="Q"
                />
              ) : (
                <div className="w-[200px] h-[200px] flex items-center justify-center bg-zinc-100">
                  <Loader2 className="animate-spin text-black/20" size={48} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 font-mono text-[9px] font-bold text-black/40 uppercase flex items-center gap-2">
            Waiting for payload <Loader2 size={12} className="animate-spin" />
          </div>
        </div>
      </div>
    </>
  )
}
