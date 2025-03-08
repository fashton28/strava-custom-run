import { XMLParser } from "fast-xml-parser"

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

export function parseGPX(gpxString: string): RunData {
  // Create a parser instance
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  })

  // Parse the GPX string
  const result = parser.parse(gpxString)

  // Extract track points
  const points: Point[] = []
  let name = "My Run"
  let date = ""
  let distance = 0
  let duration = "00:00:00"

  try {
    // Get the track name if available
    if (result.gpx?.trk?.name) {
      name = result.gpx.trk.name
    }

    // Get track points
    const trackPoints = result.gpx?.trk?.trkseg?.trkpt

    if (Array.isArray(trackPoints)) {
      // Extract points
      trackPoints.forEach((point: any) => {
        if (point["@_lat"] && point["@_lon"]) {
          points.push({
            lat: Number.parseFloat(point["@_lat"]),
            lon: Number.parseFloat(point["@_lon"]),
          })
        }
      })

      // Get the date from the first point if available
      if (trackPoints[0]?.time) {
        const timeStr = trackPoints[0].time
        date = new Date(timeStr).toISOString().split("T")[0]
      }

      // Calculate distance (very rough approximation)
      if (points.length > 1) {
        for (let i = 1; i < points.length; i++) {
          distance += calculateDistance(points[i - 1].lat, points[i - 1].lon, points[i].lat, points[i].lon)
        }
      }

      // Calculate duration if time is available
      if (trackPoints[0]?.time && trackPoints[trackPoints.length - 1]?.time) {
        const startTime = new Date(trackPoints[0].time).getTime()
        const endTime = new Date(trackPoints[trackPoints.length - 1].time).getTime()
        const durationMs = endTime - startTime

        // Format duration as HH:MM:SS
        const durationSec = Math.floor(durationMs / 1000)
        const hours = Math.floor(durationSec / 3600)
        const minutes = Math.floor((durationSec % 3600) / 60)
        const seconds = durationSec % 60

        duration = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
    }
  } catch (err) {
    console.error("Error parsing GPX data:", err)
  }

  return {
    points,
    name,
    date,
    distance,
    duration,
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distance in km
  return distance
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

