"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import AttractionCard from "@/features/home/AttractionCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Grid3x3, List, MapPin } from "lucide-react"
import { attractionsService, authService, type Attraction } from "@/services"
import { loadGoogleMaps } from "@/lib/googleMaps"

interface SearchResultsProps {
  query: string
  category: string
  minRating: string
  maxPrice: string
  lat?: string
  lng?: string
  radius?: string
}

export default function SearchResults({ query, category, minRating, maxPrice, lat, lng, radius }: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [mapViewMode, setMapViewMode] = useState<"split" | "map" | "carousel">("split")
  const [sortBy, setSortBy] = useState("relevance")
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const mapEnsuredRef = useRef(false)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const searchCacheRef = useRef<Map<string, { data: Attraction[], timestamp: number }>>(new Map())
  
  // Create a unique key for the map container to force React to recreate it when search params change
  // This ensures Google Maps initializes cleanly on a fresh DOM element
  const mapKey = `${query}-${category}-${minRating}-${maxPrice}-${lat}-${lng}-${radius}-${mapViewMode}`

  // Generate cache key from search params
  const cacheKey = useMemo(() => {
    const params = {
      query: query || '',
      category: category || '',
      minRating: minRating || '',
      maxPrice: maxPrice || '',
      lat: lat || '',
      lng: lng || '',
      radius: radius || ''
    }
    return JSON.stringify(params)
  }, [query, category, minRating, maxPrice, lat, lng, radius])

  useEffect(() => {
    // Clear any pending debounce
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    // Check cache first (cache valid for 2 minutes)
    const cached = searchCacheRef.current.get(cacheKey)
    const cacheAge = cached ? Date.now() - cached.timestamp : Infinity
    const CACHE_TTL = 2 * 60 * 1000 // 2 minutes
    
    if (cached && cacheAge < CACHE_TTL) {
      console.log('[SearchResults] Using cached results')
      setAttractions(cached.data)
      setIsLoading(false)
      setError(null)
      return
    }

    // Debounce API calls - wait 500ms after user stops typing/changing filters
    const debounceDelay = query ? 500 : 300 // Longer delay for text queries
    
    setIsLoading(true)
    setError(null)
    
    debounceTimeoutRef.current = setTimeout(async () => {
      try {
        const searchParams: any = {}
        if (query) searchParams.q = query
        if (category && category.trim()) {
          // Category contains Google Places types (comma-separated)
          // Backend will use the first one for the API request and filter results
          searchParams.category = category
        }
        if (minRating && minRating.trim() && parseFloat(minRating) > 0) {
          searchParams.min_rating = parseFloat(minRating)
        }
        if (maxPrice && maxPrice.trim() && parseInt(maxPrice) < 200) {
          searchParams.price_level = parseInt(maxPrice)
        }
        
        // Debug logging for filters
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('[SearchResults] Filters being sent:', {
            category: searchParams.category,
            min_rating: searchParams.min_rating,
            price_level: searchParams.price_level,
            query: searchParams.q,
            lat: searchParams.lat,
            lng: searchParams.lng,
            radius_m: searchParams.radius_m
          })
        }
        
        // Get user profile and country from auth service
        // Priority: user object -> localStorage user_profile -> localStorage user -> default 'tourist'
        const user = authService.getCurrentUser()
        let userProfile: 'tourist' | 'local' | 'pro' = 'tourist'
        
        if (user?.selected_profile) {
          userProfile = user.selected_profile
        } else {
          const profileFromStorage = authService.getUserProfile()
          if (profileFromStorage) {
            userProfile = profileFromStorage
          } else if (typeof window !== 'undefined') {
            // Fallback: try reading directly from localStorage user object
            try {
              const userStr = localStorage.getItem('user')
              if (userStr) {
                const userObj = JSON.parse(userStr)
                if (userObj?.selected_profile && ['tourist', 'local', 'pro'].includes(userObj.selected_profile)) {
                  userProfile = userObj.selected_profile
                }
              }
            } catch (e) {
              // Ignore parse errors
            }
          }
        }
        
        const userCountry = user?.selected_country || (typeof window !== 'undefined' ? localStorage.getItem('user_country') : null)
        const userCity = user?.selected_city || (typeof window !== 'undefined' ? localStorage.getItem('user_city') : null)
        
        // Always include user profile to customize search results
        // This affects search ranking: tourist shows landmarks, local shows restaurants/cafes, pro shows business amenities
        searchParams.profile = userProfile
        
        // Debug logging (remove in production)
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.log('[SearchResults] Profile being sent:', userProfile, 'from user:', user?.selected_profile, 'from storage:', authService.getUserProfile())
        }
        
        // Add location (lat/lng) and radius if provided (location-based search takes priority)
        if (lat && lng) {
          searchParams.lat = lat
          searchParams.lng = lng
          if (radius) {
            searchParams.radius_m = radius
          }
        } else {
          // Add user country and city to search params if available (only if no location search)
          // This helps narrow down results when user hasn't specified a location in their query
          if (userCountry || userCity) {
            // Only add location if the query doesn't already contain location-specific terms
            // This allows users to search for other locations if they want
            const queryLower = query.toLowerCase()
            const countryLower = userCountry?.toLowerCase() || ''
            const cityLower = userCity?.toLowerCase() || ''
            const isQueryLocationSpecific = queryLower.includes('paris') || 
                                           queryLower.includes('london') || 
                                           queryLower.includes('new york') ||
                                           (countryLower && queryLower.includes(countryLower)) ||
                                           (cityLower && queryLower.includes(cityLower))
            
            if (!isQueryLocationSpecific) {
              if (userCountry) {
                searchParams.country = userCountry
              }
              if (userCity) {
                searchParams.city = userCity
              }
            }
          }
        }
        
        const results = await attractionsService.search(searchParams)
        setAttractions(results)
        // Cache the results
        searchCacheRef.current.set(cacheKey, {
          data: results,
          timestamp: Date.now()
        })
        // Limit cache size to prevent memory issues (keep last 20 searches)
        if (searchCacheRef.current.size > 20) {
          const firstKey = searchCacheRef.current.keys().next().value
          if (firstKey) {
            searchCacheRef.current.delete(firstKey)
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load search results")
      } finally {
        setIsLoading(false)
      }
    }, debounceDelay)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [query, category, minRating, maxPrice, lat, lng, radius, cacheKey])

  // Load Google Maps for split/map views via singleton loader
  useEffect(() => {
    loadGoogleMaps().then(() => setIsGoogleLoaded(true)).catch(() => setIsGoogleLoaded(false))
  }, [])

  // Cleanup function to properly destroy map instance
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      // Clear all markers first
      markersRef.current.forEach((m) => {
        if (m && m.setMap) {
          m.setMap(null)
        }
      })
      markersRef.current = []
      
      // Clear the map instance
      mapInstanceRef.current = null
      console.log('[SearchResults] Map cleaned up')
    }
  }

  // Initialize map when map area appears (robust, similar to TripDetail)
  const ensureMapInitialized = () => {
    if (!isGoogleLoaded) {
      console.log('[SearchResults] Map not initialized: Google Maps not loaded')
      return
    }
    if (!(mapViewMode === "split" || mapViewMode === "map")) {
      console.log('[SearchResults] Map not initialized: wrong view mode', mapViewMode)
      return
    }
    if (!mapRef.current) {
      console.log('[SearchResults] Map not initialized: mapRef.current is null')
      return
    }
    if (mapInstanceRef.current) {
      // Map already initialized, just return
      return
    }
    const gm = (window as any).google?.maps
    if (!gm) {
      console.log('[SearchResults] Map not initialized: google.maps not available')
      return
    }
    
    // Ensure container has dimensions before initializing
    const rect = mapRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      console.log('[SearchResults] Map not initialized: container has no dimensions', rect)
      return
    }
    
    console.log('[SearchResults] Initializing map...')
    
    // Use user location if available, otherwise default to Paris
    let center = { lat: 48.8566, lng: 2.3522 }
    let initialZoom = 12
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      if (!isNaN(userLat) && !isNaN(userLng)) {
        center = { lat: userLat, lng: userLng }
        // Zoom closer if radius is small
        const radiusKm = radius ? parseFloat(radius) / 1000 : 5
        if (radiusKm <= 2) initialZoom = 14
        else if (radiusKm <= 5) initialZoom = 13
        else initialZoom = 12
      }
    }
    
    try {
      mapInstanceRef.current = new gm.Map(mapRef.current, {
        center,
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      })
      
      console.log('[SearchResults] Map initialized successfully')
      
      // Force a resize event after initialization to ensure map renders correctly
      // This is crucial when the map container is recreated
      setTimeout(() => {
        if (mapInstanceRef.current) {
          const event = new Event('resize')
          window.dispatchEvent(event)
          // Also trigger Google Maps' resize if available
          if (typeof (window as any).google?.maps?.event !== 'undefined') {
            (window as any).google.maps.event.trigger(mapInstanceRef.current, 'resize')
          }
          // Force map to refresh its tiles
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom())
        }
      }, 100)
      
      // Add user location marker if using location-based search
      if (lat && lng) {
        const userLat = parseFloat(lat)
        const userLng = parseFloat(lng)
        if (!isNaN(userLat) && !isNaN(userLng)) {
          const userMarker = new gm.Marker({
            position: center,
            map: mapInstanceRef.current,
            title: "Your Location",
            icon: {
              path: gm.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#4285F4",
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 2,
            },
          })
        }
      }
    } catch (error) {
      console.error('[SearchResults] Error initializing map:', error)
    }
  }

  // Reinitialize map when search parameters change
  useEffect(() => {
    if (!isGoogleLoaded) return
    
    // Cleanup existing map when search parameters change
    cleanupMap()
    
    // Small delay to ensure cleanup is complete and DOM is ready
    // This is especially important when the mapKey changes (container is recreated)
    const initTimeout = setTimeout(() => {
      // Try immediately
      ensureMapInitialized()
      // Try again after paint in case container just mounted
      const t1 = setTimeout(() => ensureMapInitialized(), 0)
      // Try one more time after a short delay to ensure container is fully rendered
      const t2 = setTimeout(() => ensureMapInitialized(), 100)
      
      // Cleanup function for inner timeouts
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }, 50)
    
    return () => {
      clearTimeout(initTimeout)
      cleanupMap()
    }
  }, [isGoogleLoaded, mapViewMode, lat, lng, radius, query, category, minRating, maxPrice])
  
  // Reset map ref when mapKey changes (container recreated)
  // This ensures the ref points to the new DOM element after React recreates it
  useEffect(() => {
    // Force cleanup when key changes - the new container will need a fresh map instance
    cleanupMap()
  }, [mapKey])
  
  // Also try to initialize map when container might have become visible
  // Use IntersectionObserver to detect when map container is visible
  useEffect(() => {
    if (!isGoogleLoaded || !(mapViewMode === "split" || mapViewMode === "map")) return
    if (!mapRef.current) return
    
    // Try initialization with a small delay to ensure container is rendered
    const timeoutId = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        ensureMapInitialized()
      }
    }, 200)
    
    // Also use IntersectionObserver to detect when container becomes visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !mapInstanceRef.current) {
            setTimeout(() => ensureMapInitialized(), 100)
          }
        })
      },
      { threshold: 0.1 }
    )
    
    if (mapRef.current) {
      observer.observe(mapRef.current)
    }
    
    return () => {
      clearTimeout(timeoutId)
      if (mapRef.current) {
        observer.unobserve(mapRef.current)
      }
    }
  }, [isGoogleLoaded, mapViewMode, attractions.length])

  // Update markers whenever results change
  useEffect(() => {
    if (!isGoogleLoaded) return
    
    // Ensure map is initialized before adding markers
    ensureMapInitialized()
    
    // Wait a bit for map to be ready if it was just initialized
    const timeoutId = setTimeout(() => {
      if (!mapInstanceRef.current) {
        console.log('[SearchResults] Cannot add markers: map not initialized')
        return
      }
      
      const gm = (window as any).google?.maps
      if (!gm) {
        console.log('[SearchResults] Cannot add markers: google.maps not available')
        return
      }
      
      // Clear existing markers
      markersRef.current.forEach((m) => {
        if (m && m.setMap) {
          m.setMap(null)
        }
      })
      markersRef.current = []
      
      // Add new markers
      const bounds = new gm.LatLngBounds()
      let hasAny = false
      attractions.forEach((a) => {
        const loc: any = (a as any).location
        const lat = loc?.lat ?? (a as any).latitude
        const lng = loc?.lng ?? (a as any).longitude
        if (typeof lat === 'number' && typeof lng === 'number') {
          try {
            const marker = new gm.Marker({ 
              position: { lat, lng }, 
              map: mapInstanceRef.current, 
              title: a.name 
            })
            marker.addListener('click', () => {
              const id = (a as any).place_id || (a as any).id
              if (id) window.location.href = `/attraction/${id}`
            })
            markersRef.current.push(marker)
            bounds.extend({ lat, lng })
            hasAny = true
          } catch (error) {
            console.error('[SearchResults] Error creating marker:', error)
          }
        }
      })
      
      if (hasAny && mapInstanceRef.current) {
        try {
          mapInstanceRef.current.fitBounds(bounds)
        } catch (error) {
          console.error('[SearchResults] Error fitting bounds:', error)
        }
      }
    }, 150)
    
    return () => {
      clearTimeout(timeoutId)
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

  const AttractionCardSkeleton = ({ viewMode = "grid" }: { viewMode?: "grid" | "list" }) => {
    if (viewMode === "list") {
      return (
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative w-full overflow-hidden rounded-lg sm:w-48">
              <AspectRatio ratio={16 / 9}>
                <Skeleton className="h-full w-full" />
              </AspectRatio>
            </div>
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex flex-wrap items-center gap-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 flex-1" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </Card>
      )
    }

    return (
      <Card className="overflow-hidden">
        <CardHeader className="p-0">
          <AspectRatio ratio={4 / 3}>
            <Skeleton className="h-full w-full" />
          </AspectRatio>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </div>
        </CardContent>
        <CardFooter className="gap-2 p-4 pt-0">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </CardFooter>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-[180px]" />
            <div className="hidden sm:flex gap-1">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <div className="hidden sm:flex gap-1">
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-16 rounded-md" />
              <Skeleton className="h-9 w-20 rounded-md" />
            </div>
          </div>
        </div>
        
        {(mapViewMode === "split" || mapViewMode === "map" || mapViewMode === "carousel") ? (
          <div className="flex flex-col gap-4 w-full min-w-0 max-w-full">
            {(mapViewMode === "split" || mapViewMode === "map") && (
              <Skeleton className={mapViewMode === "split" ? "w-full h-[400px] rounded-lg" : "w-full h-[600px] rounded-lg"} />
            )}
            {(mapViewMode === "split" || mapViewMode === "carousel") && (
              <div className="w-full min-w-0 overflow-hidden">
                <div className="overflow-x-auto overflow-y-hidden pb-4 scroll-smooth hide-scrollbar">
                  <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex-shrink-0 w-80">
                        <AttractionCardSkeleton viewMode="grid" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <AttractionCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        )}
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
    <div className="space-y-6 w-full min-w-0 max-w-full overflow-hidden">
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
            <button onClick={() => setMapViewMode("carousel")} className={`rounded px-2 py-1.5 text-sm transition-colors ${mapViewMode === "carousel" ? "bg-muted" : "hover:bg-muted/50"}`}>Carousel</button>
          </div>
        </div>
      </div>

      {/* Split / Map / Carousel views */}
      {(mapViewMode === "split" || mapViewMode === "map" || mapViewMode === "carousel") ? (
        <div className="flex flex-col gap-4 w-full min-w-0 max-w-full">
          {/* Map container - shown in split and map views, hidden in carousel view */}
          {(mapViewMode === "split" || mapViewMode === "map") && (
            <div className={mapViewMode === "split" ? "w-full h-[400px] max-w-full" : "w-full h-[600px] max-w-full"}>
              <div key={mapKey} ref={mapRef} className="w-full h-full rounded-lg border bg-muted/10 max-w-full">
                {!isGoogleLoaded && (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Results carousel - shown in split and carousel views */}
          {(mapViewMode === "split" || mapViewMode === "carousel") && (
            <div className="w-full min-w-0">
              {sortedAttractions.length > 0 ? (
                <div className="space-y-3">
                  {/* <h3 className="text-lg font-semibold">Results ({sortedAttractions.length})</h3> */}
                  <div className="w-full min-w-0 overflow-hidden" style={{ maxWidth: '100%' }}>
                    <div className="overflow-x-auto overflow-y-hidden pb-4 scroll-smooth hide-scrollbar" style={{ width: '100%', maxWidth: '100%' }}>
                      <div className="flex gap-3" style={{ width: 'max-content' }}>
                        {sortedAttractions.map((attraction, index) => (
                          <div key={attraction.id || attraction.place_id || `attraction-${index}`} className="flex-shrink-0 w-80">
                            <AttractionCard attraction={attraction} viewMode="grid" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4 mb-4"><MapPin className="h-8 w-8 text-muted-foreground" /></div>
                  <p className="text-sm text-muted-foreground">No attractions found. Adjust your filters or search terms.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : sortedAttractions.length > 0 ? (
        // List-only view (when mapViewMode is not split/map, but this shouldn't happen with current code)
        <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
          {sortedAttractions.map((attraction, index) => (
            <AttractionCard key={attraction.id || attraction.place_id || `attraction-${index}`} attraction={attraction} viewMode={viewMode} />
          ))}
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


