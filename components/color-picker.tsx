"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, ChevronDown } from "lucide-react"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const presetColors = [
  "#FF5353", // Strava orange-red
  "#FC4C02", // Strava orange
  "#FF8C00", // Dark orange
  "#4CAF50", // Green
  "#2196F3", // Blue
  "#9C27B0", // Purple
  "#000000", // Black
  "#FFFFFF", // White
]

export function ColorPicker({ color, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between" onClick={() => setIsOpen(true)}>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-full border" style={{ backgroundColor: color }} />
            <span>{color.toUpperCase()}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="color">Color Picker</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={handleColorChange}
                className="w-10 h-10 p-1 cursor-pointer"
              />
              <Input type="text" value={color} onChange={(e) => onChange(e.target.value)} className="flex-1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Presets</Label>
            <div className="grid grid-cols-4 gap-2">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="h-8 w-8 rounded-full border flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: presetColor }}
                  onClick={() => handlePresetClick(presetColor)}
                >
                  {color.toLowerCase() === presetColor.toLowerCase() && (
                    <Check className={`h-4 w-4 ${presetColor === "#FFFFFF" ? "text-black" : "text-white"}`} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

