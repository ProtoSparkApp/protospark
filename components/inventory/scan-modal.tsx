"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { QRCodeSVG } from "qrcode.react"
import { X, Smartphone, MonitorSmartphone, Camera, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatError } from "@/lib/utils"

import { createScanSession, getScanSession, updateScanSession, processScan, deleteScanSession } from "@/lib/actions/scan"
import { addComponent } from "@/lib/actions/inventory"
import { useRef } from "react"
import { toast } from "sonner"

export function ScanModal({ onClose }: { onClose: () => void }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [view, setView] = useState<'selection' | 'local_camera' | 'results'>('selection')
  const [step, setStep] = useState<1 | 2>(1)
  const [images, setImages] = useState<{ step1?: string, step2?: string }>({})
  const [cameraActive, setCameraActive] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

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

  const handleClose = async () => {
    if (sessionId) {
      // deleteScanSession(sessionId).catch(console.error)
    }
    onClose()
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      })
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraActive(true)
      setView('local_camera')
    } catch (err) {
      console.error("Camera error:", err)
      alert("Could not access camera. Please check permissions.")
    }
  }

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
    const res = await addComponent(result, true)
    if (res.success) {
      toast.success("Component added to inventory")
      handleClose()
    } else {
      toast.error(formatError(res.error) || "Save failed")
    }
    setIsSaving(false)
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
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white border-4 border-black shadow-[16px_16px_0px_#000] w-full max-w-5xl relative flex flex-col overflow-hidden"
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white border-2 border-black hover:bg-black hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {view === 'selection' ? (
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

                <Button
                  size="xl"
                  variant="neo"
                  className="w-full max-w-xs font-black uppercase z-10 relative shadow-[4px_4px_0px_#000]"
                  onClick={startCamera}
                >
                  <Camera className="mr-2" /> Start Lens
                </Button>
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
        ) : view === 'local_camera' ? (
          <div className="flex-1 flex flex-col bg-black relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="flex-1 object-cover"
            />

            <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20 flex items-center justify-center">
              <div className="size-64 border-2 border-white/50 border-dashed" />
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 bg-black/60 backdrop-blur-md border-t-4 border-black flex flex-col items-center">
              <div className="mb-6 flex items-center gap-12">
                <div className={`flex flex-col items-center gap-2 transition-opacity ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="size-8 rounded-none border-2 border-white flex items-center justify-center font-black text-white">1</div>
                  <span className="text-[10px] uppercase font-black text-white">Macro Shot</span>
                </div>
                <div className="w-12 h-[2px] bg-white/20" />
                <div className={`flex flex-col items-center gap-2 transition-opacity ${step === 2 ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="size-8 rounded-none border-2 border-white flex items-center justify-center font-black text-white">2</div>
                  <span className="text-[10px] uppercase font-black text-white">Collection</span>
                </div>
              </div>

              {step === 1 ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-white font-black uppercase text-sm tracking-tight italic">Step 1: Focus on component markings</p>
                  <Button size="xl" className="bg-white text-black hover:bg-zinc-200" onClick={capturePhoto}>
                    Capture Identification
                  </Button>
                </div>
              ) : !images.step2 ? (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-white font-black uppercase text-sm tracking-tight italic">Step 2: Shot of all items for counting</p>
                  <Button size="xl" className="bg-white text-black hover:bg-zinc-200" onClick={capturePhoto}>
                    Capture For Counting
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <p className="text-green-400 font-black uppercase text-sm tracking-tight">Images ready for processing</p>
                  <div className="flex gap-4">
                    <Button variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => { setStep(1); setImages({}); }}>
                      Retake
                    </Button>
                    <Button variant="neo" size="xl" className="bg-green-500 text-black hover:bg-green-600" onClick={handleStartProcessing}>
                      {connecting ? <Loader2 className="animate-spin" /> : "Analyze Stock"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col bg-zinc-50 overflow-hidden">
            {error ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="size-20 bg-red-100 text-red-600 flex items-center justify-center border-4 border-black mb-6">
                  <X size={40} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-red-600">Processing Failed</h3>
                <p className="font-medium text-lg max-w-md mb-8">{error}</p>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-2 border-black h-14 font-black uppercase" onClick={() => { setError(null); setView('selection'); }}>
                    Try Again
                  </Button>
                  <Button
                    variant="neo"
                    className="bg-brand text-white h-14 font-black uppercase"
                    onClick={() => {
                      onClose()
                    }}
                  >
                    Enter Manually
                  </Button>
                </div>
              </div>
            ) : !result ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="size-20 bg-brand text-white flex items-center justify-center border-4 border-black mb-6">
                  <Loader2 className="animate-spin" size={40} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Neural Processing...</h3>
                <p className="font-medium text-lg max-w-md">Our vision engines are analyzing your hardware. Please wait while we correlate markings and count stock.</p>
              </div>
            ) : (
              <div className="flex-1 grid lg:grid-cols-2 divide-x-4 divide-black overflow-hidden">
                <div className="p-12 overflow-y-auto space-y-8">
                  <div className="space-y-2">
                    <span className="bg-fuchsia-500 text-white px-2 py-1 text-[10px] font-black uppercase rounded-sm">AI Suggestion</span>
                    <h3 className="text-5xl font-black uppercase tracking-tighter leading-none">{result.name}</h3>
                    <p className="font-mono text-sm font-bold text-black/40 uppercase">{result.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white border-2 border-black">
                      <span className="block text-[8px] font-black uppercase text-black/40 mb-1">Stock Identified</span>
                      <span className="text-3xl font-black">{result.estimatedQuantity} PCS</span>
                    </div>
                    <div className="p-4 bg-white border-2 border-black">
                      <span className="block text-[8px] font-black uppercase text-black/40 mb-1">Tech Profile</span>
                      <span className="text-xl font-bold">{result.value}{result.unit !== 'None' ? result.unit : ''}</span>
                    </div>
                  </div>

                  <div className="p-6 bg-zinc-100 border-l-4 border-black italic font-medium">
                    "{result.description}"
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 border-2 border-black h-14 font-black uppercase" onClick={() => setView('selection')}>
                      Retake Scan
                    </Button>
                    <Button
                      variant="neo"
                      className="flex-1 bg-green-400 h-14 font-black uppercase text-lg"
                      onClick={handleConfirmResult}
                    >
                      {isSaving ? <Loader2 className="animate-spin" /> : "Confirm & Store"}
                    </Button>
                  </div>
                </div>

                <div className="hidden lg:flex flex-col bg-zinc-100 p-8 justify-center items-center gap-6">
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
                        {/* YOLO Overlay Placeholder */}
                        {result?.detections && (
                          <div className="absolute inset-0 pointer-events-none">
                            {result.detections.map((d: any, i: number) => (
                              <div
                                key={i}
                                className="absolute border-2 border-brand shadow-[0_0_10px_rgba(255,0,255,0.5)] bg-brand/10"
                                style={{
                                  left: `${d.x}%`,
                                  top: `${d.y}%`,
                                  width: `${d.w}%`,
                                  height: `${d.h}%`
                                }}
                              >
                                <span className="absolute -top-6 left-0 bg-brand text-white text-[8px] px-1 font-bold">
                                  {d.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="font-mono text-[9px] font-black uppercase text-black/30 text-center leading-relaxed">
                    Captured via {images.step1?.startsWith('data:') ? 'Local Lens' : 'Remote Uplink'}<br />
                    Confidence score: {(result.confidence * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
