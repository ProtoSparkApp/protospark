"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { getScanSession, updateScanSession } from "@/lib/actions/scan"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, RefreshCw, Check, Loader2, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileScanPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error' | 'camera_error'>('loading')
  const [step, setStep] = useState<1 | 2>(1)
  const [images, setImages] = useState<{ step1?: string, step2?: string }>({})
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    async function checkSession() {
      const res = await getScanSession(sessionId)
      if (res.error) {
        setStatus('error')
      } else {
        setStatus('ready')
        startCamera()
      }
    }
    checkSession()
    return () => stopCamera()
  }, [sessionId])

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
    } catch (err) {
      console.error(err)
      setStatus('camera_error')
    }
  }

  const stopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop())
    }
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

  const handleSubmit = async () => {
    if (!images.step1 || !images.step2) return
    setStatus('processing')
    await updateScanSession(sessionId, {
      status: 'processing',
      step1Image: images.step1,
      step2Image: images.step2
    })
  }

  if (status === 'loading') {
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-white">
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="font-mono text-xs uppercase font-black">Establishing Handshake...</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex-1 bg-red-900 flex flex-col items-center justify-center p-8 text-white text-center">
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Handshake Error</h1>
        <p className="font-bold mb-8 opacity-80">This session ID is invalid or has expired. Please refresh the QR code on your main display.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          RETRY CONNECTION
        </Button>
      </div>
    )
  }

  if (status === 'camera_error') {
    return (
      <div className="flex-1 bg-red-900 flex flex-col items-center justify-center p-8 text-white text-center">
        <div className="size-20 bg-red-500 flex items-center justify-center border-4 border-white mb-6">
          <Camera size={40} />
        </div>
        <h1 className="text-4xl font-black uppercase mb-4 tracking-tighter">Hardware Blocked</h1>
        <p className="font-bold mb-4">Remote Lens requires camera permissions and an <span className="text-brand">HTTPS</span> connection.</p>
        <Button variant="outline" onClick={startCamera}>
          GRANT PERMISSION
        </Button>
      </div>
    )
  }

  if (status === 'processing') {
    return (
      <div className="flex-1 bg-brand flex flex-col items-center justify-center p-8 text-white text-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="size-24 bg-white rounded-full flex items-center justify-center mb-8 shadow-brutal"
        >
          <Check className="text-brand" size={48} strokeWidth={4} />
        </motion.div>
        <h1 className="text-5xl font-black uppercase mb-2 tracking-tighter">Uploaded</h1>
        <p className="font-bold text-black/60 uppercase text-xs">Processing on your main display...</p>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black flex flex-col text-white overflow-hidden relative">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="flex-1 object-cover"
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 font-mono text-[10px] font-black uppercase bg-black/50 p-2 border border-white/20">
          Remote Lens Enabled • Session: {sessionId}
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`size-6 border-2 flex items-center justify-center font-black ${step === 1 ? 'border-brand bg-brand text-white' : 'border-white/20 text-white/20'}`}>1</div>
          <div className={`size-6 border-2 flex items-center justify-center font-black ${step === 2 ? 'border-brand bg-brand text-white' : 'border-white/20 text-white/20'}`}>2</div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-64 border-2 border-brand/50 border-dashed relative">
            <div className="absolute -top-1 -left-1 size-4 border-t-4 border-l-4 border-brand" />
            <div className="absolute -top-1 -right-1 size-4 border-t-4 border-r-4 border-brand" />
            <div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-brand" />
            <div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-brand" />
          </div>
        </div>
      </div>

      <div className="p-8 bg-black/80 backdrop-blur-md border-t-2 border-white/10 flex flex-col items-center gap-6">
        {step === 1 ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-brand">Krok 1: Identyfikacja</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase">Zrób zdjęcie pojedynczemu elementowi z bliska</p>
            </div>
            <button
              onClick={capturePhoto}
              className="size-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
            >
              <div className="size-16 bg-white group-active:bg-brand transition-colors" />
            </button>
          </>
        ) : !images.step2 ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-brand">Krok 2: Zliczanie</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase">Zdjęcie wszystkich elementów razem</p>
            </div>
            <div className="flex items-center gap-8">
              <button
                onClick={() => { setStep(1); setImages({}); }}
                className="size-12 rounded-full border-2 border-white/20 flex items-center justify-center"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={capturePhoto}
                className="size-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
              >
                <div className="size-16 bg-white group-active:bg-brand transition-colors" />
              </button>
              <div className="size-12" />
            </div>
          </>
        ) : (
          <>
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-green-400">Scan Complete</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase">Syncing to development station...</p>
            </div>
            <Button
              size="xl"
              className="w-full bg-brand text-white font-black uppercase h-16 text-xl shadow-brutal"
              onClick={handleSubmit}
            >
              Transmit Data <Check className="ml-2" strokeWidth={4} />
            </Button>
            <button
              onClick={() => { setStep(1); setImages({}); }}
              className="font-mono text-[10px] uppercase font-black text-white/40"
            >
              Retake All
            </button>
          </>
        )}
      </div>
    </div>
  )
}
