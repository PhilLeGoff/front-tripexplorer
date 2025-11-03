"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { compilationsService, type Compilation } from "@/services"
import AttractionCard from "@/features/home/AttractionCard"
import { CardFooter } from "@/components/ui/card"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { X, DollarSign, MapPin, Share2, Route } from "lucide-react"
import { useRef } from "react"
import { loadGoogleMaps } from "@/lib/googleMaps"

export function TripDetailPage({ id }: { id: string }) {
  const [compilation, setCompilation] = useState<Compilation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false)
  const [showRouteMap, setShowRouteMap] = useState(false)
  const routeMapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const routeMarkersRef = useRef<any[]>([])
  const routeInfoWindowRef = useRef<any>(null)
  const directionsRendererRef = useRef<any>(null)

  useEffect(() => {
    const fetchCompilation = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await compilationsService.getById(id as any)
        setCompilation(data)
      } catch (err: any) {
        setError(err.message || "Failed to load compilation")
      } finally {
        setLoading(false)
      }
    }
    fetchCompilation()
  }, [id])

  // Load Google Maps via singleton loader
  useEffect(() => {
    loadGoogleMaps().then(() => setIsGoogleLoaded(true)).catch(() => setIsGoogleLoaded(false))
  }, [])

  // Cleanup function to properly destroy map instance
  const cleanupMap = () => {
    if (mapInstanceRef.current) {
      routeMarkersRef.current.forEach((m) => {
        if (m && m.setMap) {
          m.setMap(null)
        }
      })
      routeMarkersRef.current = []
      
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null)
        directionsRendererRef.current = null
      }
      
      mapInstanceRef.current = null
    }
  }

  // Initialize map when container is visible (same logic as SearchResults)
  const ensureMapInitialized = () => {
    if (!isGoogleLoaded || !showRouteMap) return
    if (!routeMapRef.current) return
    if (mapInstanceRef.current) return
    
    const gm = (window as any).google?.maps
    if (!gm) return
    
    const rect = routeMapRef.current.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return
    
    const pts = collectPoints()
    let center = { lat: 48.8566, lng: 2.3522 }
    let initialZoom = 12
    
    if (pts.length > 0) {
      const bounds = new gm.LatLngBounds()
      pts.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
      const centerBounds = bounds.getCenter()
      center = { lat: centerBounds.lat(), lng: centerBounds.lng() }
    }
    
    try {
      mapInstanceRef.current = new gm.Map(routeMapRef.current, {
        center,
        zoom: initialZoom,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: true,
      })
      
      setTimeout(() => {
        if (mapInstanceRef.current) {
          window.dispatchEvent(new Event('resize'))
          if ((window as any).google?.maps?.event) {
            (window as any).google.maps.event.trigger(mapInstanceRef.current, 'resize')
          }
          mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom())
        }
      }, 100)
      
      if (pts.length > 0 && mapInstanceRef.current) {
        const bounds = new gm.LatLngBounds()
        pts.forEach((p) => bounds.extend({ lat: p.lat, lng: p.lng }))
        mapInstanceRef.current.fitBounds(bounds)
      }
    } catch (error) {
      console.error('[TripDetailPage] Error initializing map:', error)
    }
  }

  // Initialize map when showRouteMap or isGoogleLoaded changes
  useEffect(() => {
    if (!isGoogleLoaded || !showRouteMap) {
      cleanupMap()
      return
    }
    
    cleanupMap()
    
    const initTimeout = setTimeout(() => {
      ensureMapInitialized()
      const t1 = setTimeout(() => ensureMapInitialized(), 0)
      const t2 = setTimeout(() => ensureMapInitialized(), 100)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }, 50)
    
    return () => {
      clearTimeout(initTimeout)
      cleanupMap()
    }
  }, [isGoogleLoaded, showRouteMap])
  
  // Use IntersectionObserver to detect when map container is visible
  useEffect(() => {
    if (!isGoogleLoaded || !showRouteMap) return
    if (!routeMapRef.current) return
    
    const timeoutId = setTimeout(() => {
      if (routeMapRef.current && !mapInstanceRef.current) {
        ensureMapInitialized()
      }
    }, 200)
    
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
    
    if (routeMapRef.current) {
      observer.observe(routeMapRef.current)
    }
    
    return () => {
      clearTimeout(timeoutId)
      if (routeMapRef.current) {
        observer.unobserve(routeMapRef.current)
      }
    }
  }, [isGoogleLoaded, showRouteMap, compilation?.items.length])

  const collectPoints = () => {
    if (!compilation) return [] as Array<{ lat: number; lng: number; name: string; id: string }>
    return (compilation.items || [])
      .map((it) => {
        const loc = (it.attraction as any).location
        const lat = loc?.lat ?? (it.attraction as any).latitude
        const lng = loc?.lng ?? (it.attraction as any).longitude
        if (typeof lat === 'number' && typeof lng === 'number') {
          const id = (it.attraction as any).place_id || (it.attraction as any).id
          return { lat, lng, name: it.attraction.name as string, id: String(id || '') }
        }
        return null
      })
      .filter(Boolean) as Array<{ lat: number; lng: number; name: string; id: string }>
  }

  // Add markers when compilation changes
  useEffect(() => {
    if (!isGoogleLoaded || !showRouteMap || !mapInstanceRef.current || !compilation) return
    
    const gm = (window as any).google?.maps
    if (!gm) return
    
    const pts = collectPoints()
    if (pts.length === 0) return
    
    setTimeout(() => {
      if (!mapInstanceRef.current) return
      
      routeMarkersRef.current.forEach((m) => {
        if (m && m.setMap) {
          m.setMap(null)
        }
      })
      routeMarkersRef.current = []
      
      if (!routeInfoWindowRef.current) {
        routeInfoWindowRef.current = new gm.InfoWindow()
      }
      
      const bounds = new gm.LatLngBounds()
      pts.forEach((p) => {
        const marker = new gm.Marker({ 
          position: { lat: p.lat, lng: p.lng }, 
          map: mapInstanceRef.current, 
          title: p.name 
        })
        marker.addListener('click', () => {
          try {
            const content = `<div style="min-width:160px"><strong>${p.name}</strong></div>`
            routeInfoWindowRef.current.setContent(content)
            routeInfoWindowRef.current.open(mapInstanceRef.current, marker)
            if (p.id) {
              window.location.href = `/attraction/${p.id}`
            }
          } catch {}
        })
        routeMarkersRef.current.push(marker)
        bounds.extend({ lat: p.lat, lng: p.lng })
      })
      
      if (pts.length > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds)
      }
    }, 150)
  }, [isGoogleLoaded, showRouteMap, compilation?.items.length])

  const handleCalculateRoute = async () => {
    const pts = collectPoints()
    if (!isGoogleLoaded || pts.length < 2) return
    setShowRouteMap(true)
    
    setTimeout(() => {
      const gm = (window as any).google?.maps
      if (!gm || !mapInstanceRef.current) return
      
      const directionsService = new gm.DirectionsService()
      
      if (!directionsRendererRef.current) {
        directionsRendererRef.current = new gm.DirectionsRenderer({ 
          suppressMarkers: true,
          preserveViewport: false 
        })
        directionsRendererRef.current.setMap(mapInstanceRef.current)
      }

      const origin = { lat: pts[0].lat, lng: pts[0].lng }
      const destination = { lat: pts[pts.length - 1].lat, lng: pts[pts.length - 1].lng }
      const middle = pts.slice(1, -1)

      if (middle.length === 0) {
        directionsService.route(
          {
            origin,
            destination,
            travelMode: gm.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === 'OK' || status === gm.DirectionsStatus.OK) {
              directionsRendererRef.current.setDirections(result)
            }
          }
        )
      } else {
        const waypoints = middle.map((p) => ({ 
          location: { lat: p.lat, lng: p.lng },
          stopover: true
        }))

        directionsService.route(
          {
            origin,
            destination,
            waypoints: waypoints,
            optimizeWaypoints: true,
            travelMode: gm.TravelMode.DRIVING,
          },
          (result: any, status: any) => {
            if (status === 'OK' || status === gm.DirectionsStatus.OK) {
              directionsRendererRef.current.setDirections(result)
            }
          }
        )
      }
    }, 200)
  }

  const handleRemoveItem = async (attractionId: string) => {
    if (!compilation) return
    try {
      const updated = await compilationsService.removeItem(compilation.id as any, {
        attraction_id: attractionId as any,
      })
      setCompilation(updated)
    } catch (err: any) {
      setError(err.message || "Failed to remove attraction")
    }
  }

  const calculateTotal = () => {
    if (!compilation) return 0
    return compilation.items.reduce((sum, item) => {
      const priceLevel = item.attraction.price_level || 0
      return sum + (priceLevel + 1)
    }, 0)
  }
  const AttractionCardSkeleton = () => (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-9 w-48" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[420px] w-full rounded-md" />
              </CardContent>
            </Card>
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="relative">
                    <AttractionCardSkeleton />
                    <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }
  if (error || !compilation) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-destructive">{error || "Compilation not found"}</div>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-balance text-3xl font-bold md:text-4xl">{compilation.name}</h1>
              <p className="text-pretty text-muted-foreground mt-2">
                {compilation.country} • {compilation.profile}
              </p>
            </div>
            <Button variant="outline">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="grid gap-6 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Attractions</div>
                    <div className="font-semibold">{compilation.items.length}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Total Budget</div>
                    <div className="font-semibold">${calculateTotal()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Location</div>
                    <div className="font-semibold">{compilation.country}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {/* Route Planning */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-xl">Shortest Route</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleCalculateRoute} disabled={!isGoogleLoaded || !compilation || (compilation.items || []).length < 2}>
                  <Route className="h-4 w-4 mr-2" /> Calculate Shortest Route
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showRouteMap && (
                <div key="route-map" ref={routeMapRef} className="w-full h-[420px] rounded-md border bg-muted/10">
                  {!isGoogleLoaded && (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                        <p className="text-sm">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!showRouteMap && (
                <div className="text-sm text-muted-foreground">
                  {(!isGoogleLoaded) ? (
                    <>Google Maps is not loaded. Set MAPS_PLATFORM_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) and reload the page.</>
                  ) : (
                    <>Add at least two attractions, then click "Calculate Shortest Route" to visualize the driving itinerary on Google Maps.</>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Attractions ({compilation.items.length})</h2>
          </div>
          {compilation.items.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {compilation.items.map((item) => (
                <div key={item.id} className="relative">
                  <AttractionCard attraction={item.attraction} viewMode="grid" />
                  {/* <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleRemoveItem(String(item.attraction.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button> */}
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <div className="text-muted-foreground">
                No attractions in this compilation yet. Add attractions from the search page!
              </div>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TripDetailPage
