"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X, MapPin, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchHeaderProps {
  initialQuery: string
}

export default function SearchHeader({ initialQuery }: SearchHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false)
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [radius, setRadius] = useState<string>("5000") // Default 5km
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    setSearchQuery(initialQuery)
    // Check if location search is already active
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const radiusParam = searchParams.get("radius_m")
    if (lat && lng) {
      setUserLocation({ lat: parseFloat(lat), lng: parseFloat(lng) })
      if (radiusParam) {
        setRadius(radiusParam)
      }
    } else {
      // Clear location state if lat/lng are removed from URL
      setUserLocation(null)
    }
  }, [initialQuery, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", searchQuery.trim())
      // Clear location params when doing text search
      params.delete("lat")
      params.delete("lng")
      params.delete("radius_m")
      router.push(`/search?${params.toString()}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    params.delete("lat")
    params.delete("lng")
    params.delete("radius_m")
    setUserLocation(null)
    router.push(`/search?${params.toString()}`)
  }

  const handleLocationButtonClick = () => {
    setIsLocationDialogOpen(true)
    setLocationError(null)
  }

  const requestUserLocation = async () => {
    setIsGettingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser")
      setIsGettingLocation(false)
      return
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        })
      })

      const lat = position.coords.latitude
      const lng = position.coords.longitude
      
      setUserLocation({ lat, lng })
      setIsLocationDialogOpen(false)
      setIsGettingLocation(false)

      // Update URL with location and radius
      // IMPORTANT: Preserve existing filters (category, minRating, maxPrice) when adding location
      const params = new URLSearchParams(searchParams.toString())
      params.set("lat", lat.toString())
      params.set("lng", lng.toString())
      params.set("radius_m", radius)
      // Clear text query when using location search (filters remain intact)
      params.delete("q")
      router.push(`/search?${params.toString()}`)
    } catch (error: any) {
      setIsGettingLocation(false)
      if (error.code === error.PERMISSION_DENIED) {
        setLocationError("Location access denied. Please enable location permissions in your browser settings.")
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        setLocationError("Location information unavailable. Please try again.")
      } else if (error.code === error.TIMEOUT) {
        setLocationError("Location request timed out. Please try again.")
      } else {
        setLocationError("Failed to get your location. Please try again.")
      }
    }
  }

  const clearLocationSearch = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete("lat")
    params.delete("lng")
    params.delete("radius_m")
    setUserLocation(null)
    // Preserve other search parameters (query, filters, etc.)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-balance text-3xl font-bold md:text-4xl">Search Attractions</h1>
        <p className="text-pretty text-muted-foreground mt-2">Find the perfect destination for your next adventure</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, location, or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 pr-10 text-base"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        {userLocation ? (
          <Button 
            type="button" 
            variant="default" 
            size="lg" 
            className="px-4"
            onClick={clearLocationSearch}
          >
            <MapPin className="h-5 w-5 mr-2" />
            Near Me
            <X className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="outline" 
            size="lg" 
            className="px-4"
            onClick={handleLocationButtonClick}
          >
            <MapPin className="h-5 w-5 mr-2" />
            Find Nearby
          </Button>
        )}
        <Button type="submit" size="lg" className="px-8">
          Search
        </Button>
      </form>

      {(initialQuery || userLocation) && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing results for:</span>
          {initialQuery && (
            <span className="font-medium text-foreground">"{initialQuery}"</span>
          )}
          {userLocation && (
            <>
              {initialQuery && <span className="text-muted-foreground">•</span>}
              <span className="font-medium text-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Near my location
                {searchParams.get("radius_m") && (
                  <span className="text-xs text-muted-foreground ml-1">
                    ({parseFloat(searchParams.get("radius_m") || "5000") / 1000} km)
                  </span>
                )}
                <button
                  onClick={clearLocationSearch}
                  className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear location search"
                  title="Clear location search"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            </>
          )}
        </div>
      )}

      {/* Location Dialog */}
      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Find Attractions Near You</DialogTitle>
            <DialogDescription>
              We'll use your current location to find attractions nearby. Select a search radius.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="radius">Search Radius</Label>
              <Select value={radius} onValueChange={setRadius}>
                <SelectTrigger id="radius">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1000">1 km</SelectItem>
                  <SelectItem value="2500">2.5 km</SelectItem>
                  <SelectItem value="5000">5 km</SelectItem>
                  <SelectItem value="10000">10 km</SelectItem>
                  <SelectItem value="20000">20 km</SelectItem>
                  <SelectItem value="50000">50 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {locationError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {locationError}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLocationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={requestUserLocation} disabled={isGettingLocation}>
              {isGettingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use My Location
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


