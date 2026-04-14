"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { getScanSession, updateScanSession } from "@/lib/actions/scan"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, RefreshCw, Check, Loader2, Smartphone, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileScanPage() {
  const params = useParams()
  const sessionId = params.id as string

  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'error' | 'camera_error'>('loading')
  const [mode, setMode] = useState<'choice' | 'camera' | 'file'>('choice')
  const [step, setStep] = useState<1 | 2>(1)
  const [images, setImages] = useState<{ step1?: string, step2?: string }>({})
  const [cameraActive, setCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function checkSession() {
      const res = await getScanSession(sessionId)
      if (res.error) {
        setStatus('error')
      } else {
        setStatus('ready')
      }
    }
    checkSession()
    return () => stopCamera()
  }, [sessionId])

  const startCamera = async () => {
    setMode('camera')
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
      handleImageCaptured(dataUrl)
    }
  }

  const handleImageCaptured = (dataUrl: string) => {
    if (step === 1) {
      setImages(prev => ({ ...prev, step1: dataUrl }))
      setStep(2)
    } else {
      setImages(prev => ({ ...prev, step2: dataUrl }))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      handleImageCaptured(dataUrl)
    }
    reader.readAsDataURL(file)
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

  if (mode === 'choice') {
    return (
      <div className="flex-1 bg-black flex flex-col p-6 text-white justify-center items-center">
        <div className="mb-12 text-center">
          <div className="size-20 bg-brand flex items-center justify-center border-4 border-white mb-6 mx-auto rotate-3 shadow-brutal">
            <Smartphone size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">ProtoSpark</h1>
          <p className="font-mono text-[10px] text-brand uppercase font-black">Remote Analysis Terminal</p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            onClick={startCamera}
            className="w-full aspect-[4/3] bg-zinc-900 border-4 border-white p-6 flex flex-col items-center justify-center gap-4 active:bg-brand transition-colors group shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Camera size={48} className="text-brand group-active:text-white" />
            <div className="text-center">
              <span className="block text-2xl font-black uppercase italic">Use Camera</span>
              <span className="text-[10px] font-bold opacity-50 uppercase italic">Take a photo live</span>
            </div>
          </button>

          <button
            onClick={() => { setMode('file'); fileInputRef.current?.click(); }}
            className="w-full bg-brand border-4 border-white p-6 flex flex-col items-center justify-center gap-2 active:bg-black transition-colors group shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <div className="flex items-center gap-4">
              <ImageIcon size={32} className="text-white" />
              <div className="text-left">
                <span className="block text-xl font-black uppercase italic leading-none">Choose File</span>
                <span className="text-[10px] font-bold text-black/60 uppercase italic">From device gallery</span>
              </div>
            </div>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
        />

        <div className="mt-12 text-center opacity-40">
          <p className="font-mono text-[8px] uppercase font-black">Connected to Session: {sessionId.split('-')[0]}...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-black flex flex-col text-white overflow-hidden relative">
      {mode === 'camera' ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="flex-1 object-cover"
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-900 p-8">
          {images[`step${step}` as keyof typeof images] ? (
            <div className="relative w-full aspect-square border-4 border-brand shadow-brutal">
              <img src={images[`step${step}` as keyof typeof images]} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-brand/10" />
            </div>
          ) : (
            <div className="text-center">
              <ImageIcon size={64} className="mx-auto text-brand mb-4 opacity-50" />
              <p className="font-black uppercase italic text-xl">Waiting for file...</p>
            </div>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
      />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 font-mono text-[10px] font-black uppercase bg-black/50 p-2 border border-white/20">
          Remote Lens Enabled • {mode.toUpperCase()} MODE
        </div>

        <div className="absolute top-4 right-4 flex gap-2">
          <div className={`size-6 border-2 flex items-center justify-center font-black ${step === 1 ? 'border-brand bg-brand text-white' : 'border-white/20 text-white/20'}`}>1</div>
          <div className={`size-6 border-2 flex items-center justify-center font-black ${step === 2 ? 'border-brand bg-brand text-white' : 'border-white/20 text-white/20'}`}>2</div>
        </div>

        {mode === 'camera' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="size-64 border-2 border-brand/50 border-dashed relative">
              <div className="absolute -top-1 -left-1 size-4 border-t-4 border-l-4 border-brand" />
              <div className="absolute -top-1 -right-1 size-4 border-t-4 border-r-4 border-brand" />
              <div className="absolute -bottom-1 -left-1 size-4 border-b-4 border-l-4 border-brand" />
              <div className="absolute -bottom-1 -right-1 size-4 border-b-4 border-r-4 border-brand" />
            </div>
          </div>
        )}
      </div>

      <div className="p-8 bg-black/80 backdrop-blur-md border-t-2 border-white/10 flex flex-col items-center gap-6">
        {step === 1 ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-brand">Step 1: Identification</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase">Take a photo of a single element up close</p>
            </div>
            <div className="flex items-center gap-6 w-full justify-center">
              <button
                onClick={() => { setMode('file'); fileInputRef.current?.click(); }}
                className="size-14 rounded-full border-2 border-brand bg-brand/10 text-brand flex items-center justify-center active:scale-95 transition-transform"
              >
                <ImageIcon size={28} />
              </button>
              {mode === 'camera' ? (
                <button
                  onClick={capturePhoto}
                  className="size-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
                >
                  <div className="size-16 bg-white group-active:bg-brand transition-colors" />
                </button>
              ) : (
                <button
                  onClick={() => setMode('choice')}
                  className="size-14 rounded-full border-2 border-white/20 text-white/40 flex items-center justify-center active:scale-95 transition-transform"
                >
                  <RefreshCw size={24} />
                </button>
              )}
              <div className="size-14" />
            </div>
          </>
        ) : !images.step2 ? (
          <>
            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-tight text-brand">Step 2: Counting</h2>
              <p className="text-[10px] font-bold text-white/60 uppercase">Photo of all elements together</p>
            </div>
            <div className="flex items-center gap-8">
              <button
                onClick={() => { setStep(1); setImages({}); if (mode === 'file') setMode('choice'); }}
                className="size-12 rounded-full border-2 border-white/20 flex items-center justify-center"
              >
                <RefreshCw size={20} />
              </button>
              {mode === 'camera' ? (
                <button
                  onClick={capturePhoto}
                  className="size-20 rounded-full border-4 border-white flex items-center justify-center group active:scale-95 transition-transform"
                >
                  <div className="size-16 bg-white group-active:bg-brand transition-colors" />
                </button>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="size-20 rounded-full border-4 border-brand bg-brand/10 text-brand flex items-center justify-center group active:scale-95 transition-transform shadow-brutal"
                >
                  <ImageIcon size={40} />
                </button>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="size-12 rounded-full border-2 border-brand bg-brand/10 text-brand flex items-center justify-center"
              >
                <ImageIcon size={24} />
              </button>
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
              onClick={() => { setStep(1); setImages({}); setMode('choice'); stopCamera(); }}
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

