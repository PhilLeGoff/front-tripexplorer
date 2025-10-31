"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, DollarSign, Clock, X, Navigation } from "lucide-react"
import Link from "next/link"

// Mock attractions data with coordinates
const mockAttractions = [
  {
    id: "1",
    name: "Statue of Liberty",
    category: "Landmarks",
    rating: 4.8,
    reviews: 12453,
    price: 25,
    duration: "3-4 hours",
    image: "/statue-of-liberty.png",
    lat: 40.6892,
    lng: -74.0445,
  },
  {
    id: "2",
    name: "Central Park",
    category: "Parks & Nature",
    rating: 4.9,
    reviews: 8932,
    price: 0,
    duration: "2-6 hours",
    image: "/central-park-autumn.png",
    lat: 40.7829,
    lng: -73.9654,
  },
  {
    id: "3",
    name: "Metropolitan Museum of Art",
    category: "Museums & Galleries",
    rating: 4.7,
    reviews: 15678,
    price: 30,
    duration: "3-5 hours",
    image: "/metropolitan-museum-art.jpg",
    lat: 40.7794,
    lng: -73.9632,
  },
  {
    id: "4",
    name: "Times Square",
    category: "Entertainment",
    rating: 4.5,
    reviews: 9821,
    price: 0,
    duration: "1-2 hours",
    image: "/times-square-night.png",
    lat: 40.758,
    lng: -73.9855,
  },
  {
    id: "5",
    name: "Brooklyn Bridge",
    category: "Landmarks",
    rating: 4.8,
    reviews: 11234,
    price: 0,
    duration: "1-2 hours",
    image: "/brooklyn-bridge-cityscape.png",
    lat: 40.7061,
    lng: -73.9969,
  },
  {
    id: "6",
    name: "Empire State Building",
    category: "Landmarks",
    rating: 4.6,
    reviews: 13567,
    price: 44,
    duration: "2-3 hours",
    image: "/empire-state-building.png",
    lat: 40.7484,
    lng: -73.9857,
  },
  {
    id: "7",
    name: "9/11 Memorial & Museum",
    category: "Museums & Galleries",
    rating: 4.9,
    reviews: 14892,
    price: 33,
    duration: "2-3 hours",
    image: "/911-memorial-museum.jpg",
    lat: 40.7115,
    lng: -74.0134,
  },
  {
    id: "8",
    name: "Broadway Show",
    category: "Entertainment",
    rating: 4.9,
    reviews: 7654,
    price: 120,
    duration: "2-3 hours",
    image: "/broadway-theater.png",
    lat: 40.759,
    lng: -73.9845,
  },
]

interface MapViewProps {
  selectedCategories: string[]
  minRating: number
  maxPrice: number
  selectedAttractionId: string | null
  onAttractionSelect: (id: string | null) => void
}

export default function MapView({
  selectedCategories,
  minRating,
  maxPrice,
  selectedAttractionId,
  onAttractionSelect,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const [selectedAttraction, setSelectedAttraction] = useState<(typeof mockAttractions)[0] | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)

  // Filter attractions based on criteria
  const filteredAttractions = mockAttractions.filter((attraction) => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(attraction.category)) {
      return false
    }
    if (attraction.rating < minRating) {
      return false
    }
    if (attraction.price > maxPrice) {
      return false
    }
    return true
  })

  useEffect(() => {
    if (typeof window === "undefined") return
    const existing = (window as any).google && (window as any).google.maps
    if (existing) {
      setIsGoogleLoaded(true)
      return
    }
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    const scriptId = "google-maps-js"
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existingScript) {
      if (!(window as any).google || !(window as any).google.maps) {
        existingScript.addEventListener('load', () => setIsGoogleLoaded(true))
      } else {
        setIsGoogleLoaded(true)
      }
      return
    }
    if (!key) return
    const script = document.createElement("script") as HTMLScriptElement
    script.id = scriptId
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => setIsGoogleLoaded(true)
    document.head.appendChild(script)
  }, [])

  useEffect(() => {
    if (!isGoogleLoaded || !mapRef.current || mapInstanceRef.current) return
    const gm = (window as any).google.maps
    const map = new gm.Map(mapRef.current, {
      center: { lat: 40.7589, lng: -73.9851 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
    })
    mapInstanceRef.current = map
  }, [isGoogleLoaded])

  useEffect(() => {
    if (!mapInstanceRef.current || !isGoogleLoaded) return
    const gm = (window as any).google.maps
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    const bounds = new gm.LatLngBounds()
    filteredAttractions.forEach((attraction) => {
      const marker = new gm.Marker({
        position: { lat: attraction.lat, lng: attraction.lng },
        map: mapInstanceRef.current,
        title: attraction.name,
      })
      marker.addListener('click', () => {
        setSelectedAttraction(attraction)
        onAttractionSelect(attraction.id)
      })
      markersRef.current.push(marker)
      bounds.extend({ lat: attraction.lat, lng: attraction.lng })
    })
    if (filteredAttractions.length > 0) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [isGoogleLoaded, filteredAttractions, onAttractionSelect])

  // Handle external selection
  useEffect(() => {
    if (selectedAttractionId && mapInstanceRef.current) {
      const attraction = mockAttractions.find((a) => a.id === selectedAttractionId)
      if (attraction) {
        setSelectedAttraction(attraction)
        mapInstanceRef.current.setCenter({ lat: attraction.lat, lng: attraction.lng })
        mapInstanceRef.current.setZoom(15)
      }
    }
  }, [selectedAttractionId])

  return (
    <div className="relative h-[600px] lg:h/full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {!isGoogleLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Attraction Info Card */}
      {selectedAttraction && (
        <Card className="absolute bottom-4 left-4 right-4 z-[1000] max-w-md shadow-lg lg:left-auto">
          <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-tight">{selectedAttraction.name}</h3>
                <Badge variant="outline" className="mt-1">
                  {selectedAttraction.category}
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setSelectedAttraction(null)
                  onAttractionSelect(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{selectedAttraction.rating}</span>
                  <span className="text-muted-foreground">({selectedAttraction.reviews.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{selectedAttraction.duration}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 font-medium text-primary">
                <DollarSign className="h-4 w-4" />
                <span>{selectedAttraction.price === 0 ? "Free" : `$${selectedAttraction.price}`}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" size="sm" asChild>
                <Link href={`/attraction/${(selectedAttraction as any).place_id || selectedAttraction.id}`}>View Details</Link>
              </Button>
              <Button variant="outline" size="sm">
                <Navigation className="h-4 w-4 mr-1" />
                Directions
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results Counter */}
      {isGoogleLoaded && (
        <div className="absolute top-4 left-4 z-[1000]">
          <Badge variant="secondary" className="shadow-md">
            {filteredAttractions.length} attractions
          </Badge>
        </div>
      )}

      {/* Zoom controls */}
      {isGoogleLoaded && (
        <div className="absolute top-4 right-4 z-[1000] flex gap-2">
          <Button variant="outline" size="sm" onClick={() => {
            const m = mapInstanceRef.current
            if (m) m.setZoom(m.getZoom() + 1)
          }}>+
          </Button>
          <Button variant="outline" size="sm" onClick={() => {
            const m = mapInstanceRef.current
            if (m) m.setZoom(m.getZoom() - 1)
          }}>-
          </Button>
        </div>
      )}
    </div>
  )
}


