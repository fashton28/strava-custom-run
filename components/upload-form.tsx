"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileUp, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UploadForm() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setError(null)

    // Check if it's a GPX file
    if (file.name.endsWith(".gpx") || file.type === "application/gpx+xml") {
      setFile(file)
    } else {
      setError("Please upload a valid GPX file exported from Strava")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setError("Please select a file to upload")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, we would upload the file to the server here
      // For this demo, we'll simulate a successful upload
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simulate storing the file data in localStorage for the customizer to use
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          localStorage.setItem("stravaRunData", event.target.result as string)
          router.push("/?tab=customize")
          router.refresh()
        }
      }
      reader.readAsText(file)
    } catch (err) {
      setError("Failed to upload file. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-10 text-center mb-6 transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">Drag & Drop your GPX file here</h3>
        <p className="text-sm text-muted-foreground mb-4">Or click the button below to browse your files</p>

        <div className="flex justify-center">
          <Label
            htmlFor="file-upload"
            className="cursor-pointer inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <FileUp className="mr-2 h-4 w-4" />
            Browse Files
          </Label>
          <Input
            id="file-upload"
            type="file"
            accept=".gpx,application/gpx+xml"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {file && (
        <div className="mb-6">
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FileUp className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-2">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
              Remove
            </Button>
          </Card>
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!file || isLoading}>
          {isLoading ? "Uploading..." : "Continue to Customize"}
        </Button>
      </div>
    </form>
  )
}

