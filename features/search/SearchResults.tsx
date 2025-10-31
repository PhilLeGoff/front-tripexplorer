"use client"

import { useState, useEffect, useRef } from "react"
import AttractionCard from "@/features/home/AttractionCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Grid3x3, List, MapPin } from "lucide-react"
import { attractionsService, type Attraction } from "@/services"
import { loadGoogleMaps } from "@/lib/googleMaps"

interface SearchResultsProps {
  query: string
  category: string
  minRating: string
  maxPrice: string
}

export default function SearchResults({ query, category, minRating, maxPrice }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mapViewMode, setMapViewMode] = useState<"split" | "map">("split")
  const [sortBy, setSortBy] = useState("relevance")
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const mapEnsuredRef = useRef(false)

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const searchParams: any = {}
        if (query) searchParams.q = query
        if (category) searchParams.category = category
        if (minRating) searchParams.min_rating = parseFloat(minRating)
        if (maxPrice) searchParams.price_level = parseInt(maxPrice)
        const results = await attractionsService.search(searchParams)
        setAttractions(results)
      } catch (err: any) {
        setError(err.message || "Failed to load search results")
      } finally {
        setIsLoading(false)
      }
    }
    fetchSearchResults()
  }, [query, category, minRating, maxPrice])

  // Load Google Maps for split/map views via singleton loader
  useEffect(() => {
    loadGoogleMaps().then(() => setIsGoogleLoaded(true)).catch(() => setIsGoogleLoaded(false))
  }, [])

  // Initialize map when map area appears (robust, similar to TripDetail)
  const ensureMapInitialized = () => {
    if (!isGoogleLoaded) return
    if (!(mapViewMode === "split" || mapViewMode === "map")) return
    if (!mapRef.current) return
    if (mapInstanceRef.current) return
    const gm = (window as any).google?.maps
    if (!gm) return
    mapInstanceRef.current = new gm.Map(mapRef.current, {
      center: { lat: 48.8566, lng: 2.3522 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
    })
  }

  useEffect(() => {
    if (!isGoogleLoaded) return
    // Try immediately
    ensureMapInitialized()
    // Try again after paint in case container just mounted
    const t = setTimeout(() => ensureMapInitialized(), 0)
    return () => clearTimeout(t)
  }, [isGoogleLoaded, mapViewMode])

  // Update markers whenever results change
  useEffect(() => {
    ensureMapInitialized()
    if (!mapInstanceRef.current || !isGoogleLoaded) return
    const gm = (window as any).google.maps
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []
    const bounds = new gm.LatLngBounds()
    let hasAny = false
    attractions.forEach((a) => {
      const loc: any = (a as any).location
      const lat = loc?.lat ?? (a as any).latitude
      const lng = loc?.lng ?? (a as any).longitude
      if (typeof lat === 'number' && typeof lng === 'number') {
        const marker = new gm.Marker({ position: { lat, lng }, map: mapInstanceRef.current, title: a.name })
        marker.addListener('click', () => {
          const id = (a as any).place_id || (a as any).id
          if (id) window.location.href = `/attraction/${id}`
        })
        markersRef.current.push(marker)
        bounds.extend({ lat, lng })
        hasAny = true
      }
    })
    if (hasAny) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }, [isGoogleLoaded, attractions])

  const sortedAttractions = [...attractions].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return (a.price_level || 0) - (b.price_level || 0)
      case "price-high":
        return (b.price_level || 0) - (a.price_level || 0)
      case "reviews":
        return b.user_ratings_total - a.user_ratings_total
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-9 w-48" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-96 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-destructive mb-4">{error}</div>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">
            {sortedAttractions.length} {sortedAttractions.length === 1 ? "Result" : "Results"}
          </h2>
          {query && <p className="text-sm text-muted-foreground mt-1">Showing attractions matching "{query}"</p>}
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviewed</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>
          <div className="hidden items-center gap-1 rounded-lg border p-1 sm:flex">
            <button
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 transition-colors ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`rounded p-1.5 transition-colors ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <div className="items-center gap-1 rounded-lg border p-1 hidden sm:flex">
            <button onClick={() => setMapViewMode("split")} className={`rounded px-2 py-1.5 text-sm transition-colors ${mapViewMode === "split" ? "bg-muted" : "hover:bg-muted/50"}`}>Split</button>
            <button onClick={() => setMapViewMode("map")} className={`rounded px-2 py-1.5 text-sm transition-colors ${mapViewMode === "map" ? "bg-muted" : "hover:bg-muted/50"}`}>Map</button>
          </div>
        </div>
      </div>

      {/* Split / Map-only views with list */}
      {sortedAttractions.length > 0 ? (
        <div className="flex flex-col gap-4">
          <div className={mapViewMode === "split" ? "flex flex-col lg:flex-row gap-4" : "block"}>
            <div className={mapViewMode === "split" ? "lg:w-1/2 h-[520px]" : "w-full h-[600px]"}>
              <div ref={mapRef} className="w-full h-full rounded-lg border" />
            </div>
            {mapViewMode === "split" && (
              <div className="lg:w-1/2 max-h-[520px] overflow-y-auto pr-2">
                <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-2" : "flex flex-col gap-4"}>
                  {sortedAttractions.map((attraction) => (
                    <AttractionCard key={attraction.id} attraction={attraction} viewMode={viewMode} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4"><MapPin className="h-12 w-12 text-muted-foreground" /></div>
          <h3 className="text-xl font-semibold mb-2">No attractions found</h3>
          <p className="text-muted-foreground mb-6 max-w-md">We couldn't find any attractions matching your search criteria. Try adjusting your filters or search terms.</p>
          <Button variant="outline" onClick={() => (window.location.href = "/search")}>Clear all filters</Button>
        </div>
      )}
    </div>
  )
}


