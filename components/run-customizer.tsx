"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/color-picker"
import { Download, RotateCw, Maximize, Type, Palette, Share2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseGPX } from "@/lib/gpx-parser"

type Point = {
  lat: number
  lon: number
}

type RunData = {
  points: Point[]
  name: string
  date: string
  distance: number
  duration: string
}

export default function RunCustomizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [runData, setRunData] = useState<RunData | null>(null)
  const [trackColor, setTrackColor] = useState("#FF5353")
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF")
  const [rotation, setRotation] = useState(0)
  const [showTitle, setShowTitle] = useState(true)
  const [titleText, setTitleText] = useState("")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [fontSize, setFontSize] = useState(24)
  const [fontColor, setFontColor] = useState("#000000")
  const [textPositionX, setTextPositionX] = useState(50)
  const [textPositionY, setTextPositionY] = useState(5)
  const [lineWidth, setLineWidth] = useState(3)
  const [padding, setPadding] = useState(20)
  const [showStartEnd, setShowStartEnd] = useState(true)
  const [noDataAlert, setNoDataAlert] = useState(false)

  useEffect(() => {
    // In a real app, we would fetch the data from the server
    // For this demo, we'll check if there's data in localStorage
    const storedData = localStorage.getItem("stravaRunData")

    if (storedData) {
      try {
        // Parse the GPX data
        const parsedData = parseGPX(storedData)
        setRunData(parsedData)

        // Set default title based on run name
        if (parsedData.name) {
          setTitleText(parsedData.name)
        }
      } catch (err) {
        console.error("Failed to parse GPX data:", err)
        setNoDataAlert(true)
      }
    } else {
      // For demo purposes, create some sample data if none exists
      const samplePoints = generateSampleRunData()
      setRunData({
        points: samplePoints,
        name: "Morning Run",
        date: "2023-05-15",
        distance: 5.2,
        duration: "00:45:30",
      })
      setTitleText("Morning Run")
    }
  }, [])

  useEffect(() => {
    if (runData && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (ctx) {
        drawRunVisualization(ctx, canvas.width, canvas.height)
      }
    }
  }, [
    runData,
    trackColor,
    backgroundColor,
    rotation,
    showTitle,
    titleText,
    fontFamily,
    fontSize,
    fontColor,
    textPositionX,
    textPositionY,
    lineWidth,
    padding,
    showStartEnd,
  ])

  const generateSampleRunData = (): Point[] => {
    // Generate a simple path for demonstration
    const points: Point[] = []
    const centerLat = 37.7749
    const centerLon = -122.4194

    // Create a circular-ish path with some randomness
    for (let i = 0; i < 100; i++) {
      const angle = (i / 100) * Math.PI * 2
      const radius = 0.01 + Math.random() * 0.005
      points.push({
        lat: centerLat + Math.sin(angle) * radius,
        lon: centerLon + Math.cos(angle) * radius,
      })
    }

    return points
  }

  const drawRunVisualization = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    transparentBg = false,
  ) => {
    if (!runData || runData.points.length === 0) return

    // Clear canvas (with or without background color)
    if (transparentBg) {
      ctx.clearRect(0, 0, width, height)
    } else {
      ctx.fillStyle = backgroundColor
      ctx.fillRect(0, 0, width, height)
    }

    // Extract points
    const points = runData.points

    // Find bounds
    let minLat = Number.POSITIVE_INFINITY,
      maxLat = Number.NEGATIVE_INFINITY,
      minLon = Number.POSITIVE_INFINITY,
      maxLon = Number.NEGATIVE_INFINITY

    for (const point of points) {
      minLat = Math.min(minLat, point.lat)
      maxLat = Math.max(maxLat, point.lat)
      minLon = Math.min(minLon, point.lon)
      maxLon = Math.max(maxLon, point.lon)
    }

    // Calculate scale to fit within canvas with padding
    const paddingPx = padding
    const availableWidth = width - paddingPx * 2
    const availableHeight = height - paddingPx * 2

    const latRange = maxLat - minLat
    const lonRange = maxLon - minLon

    // Determine which dimension is limiting
    const latScale = availableHeight / latRange
    const lonScale = availableWidth / lonRange
    const scale = Math.min(latScale, lonScale)

    // Calculate center points for rotation
    const centerX = width / 2
    const centerY = height / 2

    // Save the current state
    ctx.save()

    // Translate to center, rotate, and translate back
    ctx.translate(centerX, centerY)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    // Draw the path
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = trackColor
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    for (let i = 0; i < points.length; i++) {
      const point = points[i]

      // Convert coordinates to canvas position
      const x = paddingPx + (point.lon - minLon) * scale
      // Invert y-axis since canvas 0,0 is top-left
      const y = height - paddingPx - (point.lat - minLat) * scale

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }

    ctx.stroke()

    // Draw start and end points if enabled
    if (showStartEnd && points.length > 0) {
      const startPoint = points[0]
      const endPoint = points[points.length - 1]

      // Start point (green)
      const startX = paddingPx + (startPoint.lon - minLon) * scale
      const startY = height - paddingPx - (startPoint.lat - minLat) * scale

      ctx.beginPath()
      ctx.fillStyle = "#4CAF50"
      ctx.arc(startX, startY, lineWidth * 2, 0, Math.PI * 2)
      ctx.fill()

      // End point (red)
      const endX = paddingPx + (endPoint.lon - minLon) * scale
      const endY = height - paddingPx - (endPoint.lat - minLat) * scale

      ctx.beginPath()
      ctx.fillStyle = "#F44336"
      ctx.arc(endX, endY, lineWidth * 2, 0, Math.PI * 2)
      ctx.fill()
    }

    // Restore the context state (removes rotation)
    ctx.restore()

    // Add title if enabled
    if (showTitle && titleText) {
      ctx.font = `${fontSize}px ${fontFamily}`
      ctx.fillStyle = fontColor
      ctx.textAlign = "center"

      // Calculate text position based on percentages
      const textX = width * (textPositionX / 100)
      const textY = height * (textPositionY / 100) + fontSize

      ctx.fillText(titleText, textX, textY)

      // Add run details below the title
      if (runData.distance && runData.duration) {
        ctx.font = `${fontSize * 0.6}px ${fontFamily}`
        ctx.fillText(`${runData.distance.toFixed(2)} km · ${runData.duration}`, textX, textY + fontSize * 0.8)
      }
    }
  }

  const handleDownload = () => {
    if (!canvasRef.current || !runData || runData.points.length === 0) return

    // Create a new canvas for the download version
    const downloadCanvas = document.createElement("canvas")
    downloadCanvas.width = canvasRef.current.width
    downloadCanvas.height = canvasRef.current.height
    const ctx = downloadCanvas.getContext("2d")
    if (!ctx) return

    // Set transparent background
    ctx.clearRect(0, 0, downloadCanvas.width, downloadCanvas.height)

    // Draw the run visualization on the transparent canvas
    drawRunVisualization(ctx, downloadCanvas.width, downloadCanvas.height, true)

    // Convert to PNG and initiate download
    const dataUrl = downloadCanvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = dataUrl
    a.download = `${titleText || "strava-run"}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  if (noDataAlert) {
    return (
      <Alert>
        <AlertDescription>No run data found. Please upload a Strava GPX file first.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="bg-muted rounded-lg p-4 flex items-center justify-center">
          <canvas ref={canvasRef} width={600} height={600} className="max-w-full h-auto border rounded-md shadow-sm" />
        </div>
        <div className="flex justify-between mt-4">
          <Button
            variant="outline"
            onClick={() => {
              if (canvasRef.current) {
                const canvas = canvasRef.current
                const ctx = canvas.getContext("2d")
                if (ctx) {
                  drawRunVisualization(ctx, canvas.width, canvas.height)
                }
              }
            }}
          >
            <RotateCw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Tabs defaultValue="style">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="style">
              <Palette className="h-4 w-4 mr-2" />
              Style
            </TabsTrigger>
            <TabsTrigger value="layout">
              <Maximize className="h-4 w-4 mr-2" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="text">
              <Type className="h-4 w-4 mr-2" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label>Track Color</Label>
              <ColorPicker color={trackColor} onChange={setTrackColor} />
            </div>

            <div className="space-y-2">
              <Label>Background Color</Label>
              <ColorPicker color={backgroundColor} onChange={setBackgroundColor} />
            </div>

            <div className="space-y-2">
              <Label>Line Width: {lineWidth}px</Label>
              <Slider
                value={[lineWidth]}
                min={1}
                max={10}
                step={0.5}
                onValueChange={(value) => setLineWidth(value[0])}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-markers">Show Start/End Markers</Label>
              <Switch id="show-markers" checked={showStartEnd} onCheckedChange={setShowStartEnd} />
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-2">
              <Label>Rotation: {rotation}°</Label>
              <Slider value={[rotation]} min={0} max={360} step={5} onValueChange={(value) => setRotation(value[0])} />
            </div>

            <div className="space-y-2">
              <Label>Padding: {padding}px</Label>
              <Slider value={[padding]} min={0} max={100} step={5} onValueChange={(value) => setPadding(value[0])} />
            </div>
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-title">Show Title</Label>
              <Switch id="show-title" checked={showTitle} onCheckedChange={setShowTitle} />
            </div>

            {showTitle && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="title-text">Title Text</Label>
                  <Input
                    id="title-text"
                    value={titleText}
                    onChange={(e) => setTitleText(e.target.value)}
                    placeholder="Enter title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select value={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Georgia">Georgia</SelectItem>
                      <SelectItem value="Courier New">Courier New</SelectItem>
                      <SelectItem value="Impact">Impact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Font Size: {fontSize}px</Label>
                  <Slider
                    value={[fontSize]}
                    min={12}
                    max={48}
                    step={2}
                    onValueChange={(value) => setFontSize(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Color</Label>
                  <ColorPicker color={fontColor} onChange={setFontColor} />
                </div>

                <div className="space-y-2">
                  <Label>Text Horizontal Position: {textPositionX}%</Label>
                  <Slider
                    value={[textPositionX]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setTextPositionX(value[0])}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Vertical Position: {textPositionY}%</Label>
                  <Slider
                    value={[textPositionY]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(value) => setTextPositionY(value[0])}
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <Button variant="outline" className="w-full">
            <Share2 className="h-4 w-4 mr-2" />
            Share Design
          </Button>
        </div>
      </div>
    </div>
  )
}

