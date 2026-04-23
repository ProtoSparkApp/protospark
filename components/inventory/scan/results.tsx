"use client"

import { Check, ChevronRight, Loader2, X, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResistorCalculator } from "../resistor-calculator"

interface ScanResultsProps {
  error: string | null
  result: any
  images: { step1?: string, step2?: string }
  sessionId: string | null
  connecting: boolean
  isSaving: boolean
  isRevalidating: boolean
  onRetry: () => void
  onManualEntry: () => void
  onConfirm: () => void
  onRetake: () => void
  onUpdateResult: (newResult: any) => void
  onShowMouserSelector: () => void
  onRevalidateMouser: (val?: string, unit?: string) => void
}

export function ScanResults({
  error,
  result,
  images,
  sessionId,
  connecting,
  isSaving,
  isRevalidating,
  onRetry,
  onManualEntry,
  onConfirm,
  onRetake,
  onUpdateResult,
  onShowMouserSelector,
  onRevalidateMouser
}: ScanResultsProps) {
  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="size-20 bg-red-100 text-red-600 flex items-center justify-center border-4 border-black mb-6">
          <X size={40} />
        </div>
        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-red-600">Processing Failed</h3>
        <p className="font-medium text-lg max-w-md mb-8">{error}</p>
        <div className="flex gap-4">
          <Button variant="outline" className="border-2 border-black h-14 font-black uppercase" onClick={onRetry}>
            Try Again
          </Button>
          <Button variant="neo" className="bg-brand text-white h-14 font-black uppercase" onClick={onManualEntry}>
            Enter Manually
          </Button>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="size-20 bg-brand text-white flex items-center justify-center border-4 border-black mb-6">
          <Loader2 className="animate-spin" size={40} />
        </div>
        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Neural Processing...</h3>
        <p className="font-medium text-lg max-w-md">Our vision engines are analyzing your hardware. Please wait while we correlate markings and count stock.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 grid lg:grid-cols-2 divide-x-4 divide-black overflow-hidden">
      <div className="p-12 overflow-y-auto space-y-8">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="bg-fuchsia-500 text-white px-2 py-1 text-[10px] font-black uppercase rounded-sm">AI Suggestion</span>
            {result.mouserData && (
              <span className="bg-blue-600 text-white px-2 py-1 text-[10px] font-black uppercase rounded-sm flex items-center gap-1">
                <Check size={10} strokeWidth={4} /> Mouser Verified
              </span>
            )}
          </div>
          <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">{result.genericName}</h3>
          {result.mpn && (
            <p className="font-mono text-xs font-black text-black/40 uppercase bg-zinc-200 px-2 py-1 inline-block mt-2 border border-black shadow-[2px_2px_0px_#000]">
              MPN: {result.mpn}
            </p>
          )}
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <p className="font-mono text-sm font-bold text-black/40 uppercase">{result.category}</p>
              {result.mouserData?.producer && (
                <>
                  <span className="text-black/20">•</span>
                  <p className="font-mono text-sm font-bold text-brand uppercase">{result.mouserData.producer}</p>
                </>
              )}
            </div>

            {result.mouserAlternatives?.length > 1 && (
              <button
                onClick={onShowMouserSelector}
                className="text-[10px] font-black uppercase text-blue-600 hover:underline"
              >
                Not the right part?
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-2 border-black group">
            <span className="block text-[8px] font-black uppercase text-black/40 mb-1">Stock Identified</span>
            <div className="flex items-baseline gap-1">
              <input
                type="number"
                value={result.quantity}
                min="1"
                className="text-3xl font-black bg-transparent w-24 outline-none focus:text-brand transition-colors"
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  onUpdateResult({ ...result, quantity: isNaN(val) ? 1 : val });
                }}
              />
              <span className="text-xl font-black text-black/20">PCS</span>
            </div>
          </div>
          <div className="p-4 bg-white border-2 border-black">
            <span className="block text-[8px] font-black uppercase text-black/40 mb-1">Tech Profile</span>
            <span className="text-xl font-bold">{result.value}{result.unit !== 'None' ? result.unit : ''}</span>
          </div>
        </div>

        <div className="p-6 bg-zinc-100 border-l-4 border-black italic font-medium relative group">
          "{result.description || result.mouserData?.description}"
          {(result.mouserData?.datasheet || result.mouserData?.url) && (
            <a
              href={result.mouserData.datasheet || result.mouserData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-[10px] font-black uppercase text-brand hover:underline flex items-center gap-1"
            >
              View Official Specs <ChevronRight size={12} />
            </a>
          )}
        </div>

        {result.category === "Resistor" && (
          <ResistorCalculator
            isRevalidating={isRevalidating}
            onUpdate={(val, unit) => {
              onUpdateResult({ ...result, value: val, unit: unit as any })
            }}
            onSync={() => onRevalidateMouser()}
          />
        )}

        {result.mouserData?.photo && (
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-black/40">Mouser Official Reference Image</span>
            <div className="w-32 aspect-square bg-white border-2 border-black flex items-center justify-center p-2">
              <img src={result.mouserData.photo} alt="Mouser Reference" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button variant="outline" className="flex-1 border-2 border-black h-14 font-black uppercase" onClick={onRetake}>
            Retake Scan
          </Button>
          <Button
            variant="neo"
            className="flex-1 bg-green-400 h-14 font-black uppercase text-lg"
            onClick={onConfirm}
          >
            {isSaving ? <Loader2 className="animate-spin" /> : "Confirm & Store"}
          </Button>
        </div>
      </div>

      <div className="hidden lg:flex flex-col bg-zinc-100 p-8 justify-center items-center gap-6 overflow-hidden">
        <div className="w-full space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-black/40">Macro Scan (ID)</span>
            <div className="w-full aspect-video bg-white border-4 border-black shadow-brutal relative overflow-hidden group">
              <img
                src={images.step1 || `/api/images/scan/${sessionId}/1`}
                alt="Macro Scan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-black/40">Collection Scan (Counting)</span>
            <div className="w-full aspect-video bg-white border-4 border-black shadow-brutal relative overflow-hidden group">
              <img
                src={images.step2 || `/api/images/scan/${sessionId}/2`}
                alt="Collection Scan"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>
        </div>

        <p className="font-mono text-[9px] font-black uppercase text-black/30 text-center leading-relaxed">
          Captured via {images.step1?.startsWith('data:') ? 'Local Lens' : 'Remote Uplink'}<br />
          Confidence score: {(result.confidence * 100).toFixed(1)}%
        </p>
      </div>
    </div>
  )
}
