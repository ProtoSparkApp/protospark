"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const COLORS = [
  { name: "Black", color: "#000000", value: 0, multi: 1, tol: null },
  { name: "Brown", color: "#8B4513", value: 1, multi: 10, tol: 1 },
  { name: "Red", color: "#FF0000", value: 2, multi: 100, tol: 2 },
  { name: "Orange", color: "#FFA500", value: 3, multi: 1000, tol: null },
  { name: "Yellow", color: "#FFFF00", value: 4, multi: 10000, tol: null },
  { name: "Green", color: "#008000", value: 5, multi: 100000, tol: 0.5 },
  { name: "Blue", color: "#0000FF", value: 6, multi: 1000000, tol: 0.25 },
  { name: "Violet", color: "#EE82EE", value: 7, multi: 10000000, tol: 0.1 },
  { name: "Grey", color: "#808080", value: 8, multi: null, tol: 0.05 },
  { name: "White", color: "#FFFFFF", value: 9, multi: null, tol: null },
  { name: "Gold", color: "#FFD700", value: null, multi: 0.1, tol: 5 },
  { name: "Silver", color: "#C0C0C0", value: null, multi: 0.01, tol: 10 },
]

import { RefreshCw, Loader2 } from "lucide-react"

export function ResistorCalculator({
  onUpdate,
  onSync,
  isRevalidating
}: {
  onUpdate: (val: string, unit: string) => void,
  onSync: () => void,
  isRevalidating?: boolean
}) {
  const [bands, setBands] = useState<number>(4)
  const [selectedColors, setSelectedColors] = useState<string[]>(["Brown", "Black", "Red", "Gold"])
  const [currentValue, setCurrentValue] = useState<{ v: string, u: string }>({ v: "1", u: "kOhm" })

  useEffect(() => {
    calculate()
  }, [selectedColors, bands])

  const calculate = () => {
    const c1 = COLORS.find(c => c.name === selectedColors[0])
    const c2 = COLORS.find(c => c.name === selectedColors[1])
    const multiplier = COLORS.find(c => c.name === selectedColors[bands === 4 ? 2 : 3])

    if (!c1 || !c2 || !multiplier) return

    let value = 0
    if (bands === 4) {
      value = (c1.value! * 10 + c2.value!) * multiplier.multi!
    } else {
      const c3 = COLORS.find(c => c.name === selectedColors[2])
      if (!c3) return
      value = (c1.value! * 100 + c2.value! * 10 + c3.value!) * multiplier.multi!
    }

    let finalValue = value.toString()
    let finalUnit = "Ohm"

    if (value >= 1000000) {
      finalValue = (value / 1000000).toString() + "M"
    } else if (value >= 1000) {
      finalValue = (value / 1000).toString() + "k"
    }

    setCurrentValue({ v: finalValue, u: finalUnit })
    onUpdate(finalValue, finalUnit)
  }

  const handleColorSelect = (bandIndex: number, colorName: string) => {
    const newColors = [...selectedColors]
    newColors[bandIndex] = colorName
    setSelectedColors(newColors)
  }

  const toggleBands = () => {
    if (bands === 4) {
      setBands(5)
      setSelectedColors(["Brown", "Black", "Black", "Red", "Gold"])
    } else {
      setBands(4)
      setSelectedColors(["Brown", "Black", "Red", "Gold"])
    }
  }

  return (
    <div className="p-6 bg-zinc-900 border-4 border-black shadow-brutal text-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="font-black uppercase italic text-brand leading-none">Colours Calculator</h4>
          <p className="text-[20px] font-black">{currentValue.v} {currentValue.u}</p>
        </div>
        <button
          onClick={toggleBands}
          className="px-3 py-1 border-2 border-white/20 text-[10px] font-black uppercase hover:bg-white hover:text-black transition-colors"
        >
          {bands} Bands
        </button>
      </div>

      <div className="flex justify-center mb-10 py-8 relative bg-zinc-800 border-2 border-white/10 overflow-hidden">
        <div className="w-48 h-10 bg-[#d1b08c] rounded-full relative flex items-center justify-between px-8">
          <div className="absolute top-1/2 -left-12 w-12 h-1 bg-zinc-400 -translate-y-1/2" />
          <div className="absolute top-1/2 -right-12 w-12 h-1 bg-zinc-400 -translate-y-1/2" />

          {selectedColors.map((c, i) => (
            <motion.div
              key={i}
              layoutId={`band-${i}`}
              className="w-3 h-full z-10"
              style={{ backgroundColor: COLORS.find(co => co.name === c)?.color }}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {selectedColors.map((current, i) => {
          const isMultiplier = i === (bands === 4 ? 2 : 3)
          const isTolerance = i === (bands === 4 ? 3 : 4)

          return (
            <div key={i} className="space-y-2">
              <span className="text-[10px] font-black uppercase opacity-50">
                {i === collection_index(bands, i) ? "Mnożnik" : i === tolerance_index(bands) ? "Tolerancja" : `Cyfra ${i + 1}`}
              </span>
              <div className="flex flex-wrap gap-1">
                {COLORS.map(c => {
                  if (!isMultiplier && !isTolerance && c.value === null) return null
                  if (isMultiplier && c.multi === null) return null
                  if (isTolerance && c.tol === null) return null

                  return (
                    <button
                      key={c.name}
                      onClick={() => handleColorSelect(i, c.name)}
                      className={`size-6 border-2 transition-all ${current === c.name ? 'border-brand scale-110 z-10' : 'border-black hover:border-white/40'}`}
                      style={{ backgroundColor: c.color }}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={onSync}
        disabled={isRevalidating}
        className="w-full bg-brand p-3 border-2 border-white font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-white hover:text-black transition-colors disabled:opacity-50"
      >
        {isRevalidating ? <Loader2 className="animate-spin" size={16} /> : <RefreshCw size={16} />}
        Update Mouser Link
      </button>
    </div>
  )
}

function collection_index(bands: number, i: number) {
  return bands === 4 ? 2 : 3
}

function tolerance_index(bands: number) {
  return bands === 4 ? 3 : 4
}

