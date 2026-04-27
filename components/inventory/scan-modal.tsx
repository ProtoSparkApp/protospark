"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { toast } from "sonner"

import { createScanSession, updateScanSession, processScan } from "@/lib/actions/scan"
import { addComponent } from "@/lib/actions/inventory"
import { formatError } from "@/lib/utils"

import { MouserSelector } from "./mouser-selector"
import { ScanSelection } from "./scan/selection"
import { ScanCamera } from "./scan/camera"
import { ScanResults } from "./scan/results"
import { ScanUpload } from "./scan/upload"

interface ScanModalProps {
  isOpen: boolean
  onClose: () => void
  onItemsAdded?: () => void
}

export function ScanModal({ isOpen, onClose, onItemsAdded }: ScanModalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [view, setView] = useState<'selection' | 'local_camera' | 'local_upload' | 'results'>('selection')
  const [step, setStep] = useState<1 | 2>(1)
  const [images, setImages] = useState<{ step1?: string, step2?: string }>({})
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [showMouserSelector, setShowMouserSelector] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const [isRevalidating, setIsRevalidating] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function initSession() {
      try {
        const res = await createScanSession()
        if (res.sessionId) {
          setSessionId(res.sessionId)
        }
      } catch (err) {
        console.error("Init session error:", err)
      }
    }
    initSession()

    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.error("Camera API not supported or not in a secure context.");
      toast.error("Camera access not supported. Are you on a secure connection (HTTPS)?")
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      setMediaStream(stream)
      setCameraActive(true)
      setView('local_camera')
    } catch (err) {
      console.error("Camera error:", err)
      toast.error("Could not access camera. Please check permissions.")
    }
  }

  useEffect(() => {
    if (view === 'local_camera' && mediaStream && videoRef.current) {
      videoRef.current.srcObject = mediaStream
    }
  }, [view, mediaStream])

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
      setMediaStream(null)
    }
    setCameraActive(false)
  }

  const capturePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      if (step === 1) {
        setImages(prev => ({ ...prev, step1: dataUrl }))
        setStep(2)
      } else {
        setImages(prev => ({ ...prev, step2: dataUrl }))
      }
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      if (step === 1) {
        setImages(prev => ({ ...prev, step1: dataUrl }))
        setStep(2)
      } else {
        setImages(prev => ({ ...prev, step2: dataUrl }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleStartProcessing = async () => {
    if (!sessionId || !images.step1 || !images.step2) return
    setConnecting(true)
    await updateScanSession(sessionId, {
      status: 'processing',
      step1Image: images.step1,
      step2Image: images.step2
    })
    setView('results')

    const aiRes = await processScan(sessionId)
    if (aiRes.success) {
      setResult(aiRes.analysis)
      setError(null)
    } else {
      setError(aiRes.error || "Analysis failed")
      toast.error("AI Analysis failed. Please try manual entry.")
    }
    setConnecting(false)
  }

  const handleConfirmResult = async () => {
    if (!result) return
    setIsSaving(true)
    const res = await addComponent({
      ...result,
      metadata: result.mouserData || {}
    }, true)
    if (res.success) {
      toast.success("Component added to inventory")
      if (onItemsAdded) onItemsAdded()
      onClose()
    } else {
      toast.error(formatError(res.error) || "Save failed")
    }
    setIsSaving(false)
  }

  const revalidateMouser = async (newValue?: string, newUnit?: string) => {
    if (!result) return
    setIsRevalidating(true)

    const category = result.category || ""
    const val = newValue || result.value
    const unit = newUnit || result.unit
    const query = `${val}${unit !== 'None' ? unit : ''} ${category}`

    const { lookupMouserProduct } = await import("@/lib/actions/mouser")
    const res = await lookupMouserProduct(query, result.category)

    if (res.success && res.products && res.products.length > 0) {
      const top = res.products[0]
      setResult({
        ...result,
        value: val,
        unit: unit as any,
        genericName: top.category || result.category,
        mpn: top.name,
        description: top.description,
        mouserData: {
          producer: top.producer,
          description: top.description,
          photo: top.photo,
          datasheet: top.datasheet,
          url: top.url,
          price: top.price
        },
        mouserAlternatives: res.products
      })
      toast.success("Mouser data synchronized")
    } else {
      setResult({ ...result, value: val, unit: unit as any, description: `${category} ${val}${unit !== 'None' ? unit : ''}` })
    }
    setIsRevalidating(false)
  }

  useEffect(() => {
    if (!sessionId || view !== 'selection') return

    const eventSource = new EventSource(`/api/scan/${sessionId}`)

    eventSource.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.status === 'processing') {
          setView('results')
          setConnecting(true)
          const aiRes = await processScan(sessionId)
          if (aiRes.success) {
            setResult(aiRes.analysis)
            setError(null)
          } else {
            setError(aiRes.error || "Analysis failed")
          }
          setConnecting(false)
        }
      } catch (e) {
        console.error("Event parsing error:", e)
      }
    }

    eventSource.onerror = (error) => {
      console.error("SSE Error:", error)
      eventSource.close()
    }

    return () => eventSource.close()
  }, [sessionId, view])

  const mobileLink = sessionId ? `${window.location.origin}/scan/${sessionId}` : ""

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
        className="bg-white border-4 border-black shadow-[16px_16px_0px_#000] w-full max-w-5xl relative flex flex-col overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        <AnimatePresence>
          {showMouserSelector && result?.mouserAlternatives && (
            <MouserSelector
              products={result.mouserAlternatives.map((a: any) => ({
                name: a.symbol,
                description: a.description,
                category: a.category,
                producer: a.manufacturer,
                photo: a.photo,
                datasheet: a.datasheet,
                url: a.url,
                price: a.price
              }))}
              onSelect={(p) => {
                setResult({
                  ...result,
                  genericName: p.category || result.category,
                  mpn: p.name,
                  mouserData: {
                    producer: p.producer,
                    description: p.description,
                    photo: p.photo,
                    datasheet: p.datasheet,
                    url: p.url,
                    price: p.price
                  }
                });
                setShowMouserSelector(false);
              }}
              onClose={() => setShowMouserSelector(false)}
            />
          )}
        </AnimatePresence>

        {view === 'selection' && (
          <ScanSelection
            sessionId={sessionId}
            mobileLink={mobileLink}
            onCameraSelect={() => {
              setView('local_camera')
              startCamera()
            }}
            onGallerySelect={() => {
              setView('local_upload');
              setTimeout(() => fileInputRef.current?.click(), 100);
            }}
          />
        )}

        {view === 'local_upload' && (
          <ScanUpload
            step={step}
            images={images}
            onFileSelect={() => fileInputRef.current?.click()}
            onStartProcessing={handleStartProcessing}
            onRetake={() => {
              setImages({})
              setStep(1)
            }}
            connecting={connecting}
          />
        )}

        {view === 'local_camera' && (
          <ScanCamera
            videoRef={videoRef}
            step={step}
            images={images}
            connecting={connecting}
            onCapture={capturePhoto}
            onGallerySelect={() => fileInputRef.current?.click()}
            onStartProcessing={handleStartProcessing}
            onRetake={() => { setStep(1); setImages({}); }}
          />
        )}

        {view === 'results' && (
          <ScanResults
            error={error}
            result={result}
            images={images}
            sessionId={sessionId}
            connecting={connecting}
            isSaving={isSaving}
            isRevalidating={isRevalidating}
            onRetry={() => { setError(null); setView('selection'); }}
            onManualEntry={onClose}
            onConfirm={handleConfirmResult}
            onRetake={() => setView('selection')}
            onUpdateResult={setResult}
            onShowMouserSelector={() => setShowMouserSelector(true)}
            onRevalidateMouser={revalidateMouser}
          />
        )}
      </motion.div>
    </div>
  )
}
