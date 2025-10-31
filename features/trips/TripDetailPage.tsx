"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { compilationsService, type Compilation } from "@/services"
import AttractionCard from "@/features/home/AttractionCard"
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
  const routeMarkersRef = useRef<any[]>([])
  const routeInfoWindowRef = useRef<any>(null)

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

  // Ensure a Google Map exists once the container is visible and API is loaded
  useEffect(() => {
    if (!showRouteMap || !isGoogleLoaded) return
    const gm = (window as any).google?.maps
    if (!gm) return
    let map = (TripDetailPage as any)._gmap as any
    if (!map && routeMapRef.current) {
      map = new gm.Map(routeMapRef.current, {
        center: { lat: 48.8566, lng: 2.3522 },
        zoom: 12,
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      })
      ;(TripDetailPage as any)._gmap = map
    }
    // Attach a renderer if missing
    if (!(TripDetailPage as any)._renderer && (TripDetailPage as any)._gmap) {
      const directionsRenderer = new gm.DirectionsRenderer({ suppressMarkers: false, preserveViewport: false })
      directionsRenderer.setMap((TripDetailPage as any)._gmap)
      ;(TripDetailPage as any)._renderer = directionsRenderer
    }
    // Also plot current attractions as markers
    try {
      const pts = collectPoints()
      // clear existing markers
      routeMarkersRef.current.forEach((m) => m.setMap && m.setMap(null))
      routeMarkersRef.current = []
      if (!routeInfoWindowRef.current) {
        routeInfoWindowRef.current = new gm.InfoWindow()
      }
      const bounds = new gm.LatLngBounds()
      pts.forEach((p) => {
        const marker = new gm.Marker({ position: { lat: p.lat, lng: p.lng }, map: (TripDetailPage as any)._gmap, title: p.name })
        marker.addListener('click', () => {
          try {
            const content = `<div style="min-width:160px"><strong>${p.name}</strong></div>`
            routeInfoWindowRef.current.setContent(content)
            routeInfoWindowRef.current.open((TripDetailPage as any)._gmap, marker)
            if (p.id) {
              window.location.href = `/attraction/${p.id}`
            }
          } catch {}
        })
        routeMarkersRef.current.push(marker)
        bounds.extend({ lat: p.lat, lng: p.lng })
      })
      if (pts.length > 0) {
        ;(TripDetailPage as any)._gmap.fitBounds(bounds)
      }
    } catch {}
  }, [showRouteMap, isGoogleLoaded])

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

  const handleCalculateRoute = async () => {
    const pts = collectPoints()
    if (!isGoogleLoaded || pts.length < 2) return
    setShowRouteMap(true)
    // Delay to let the map effect run, then compute route
    setTimeout(() => {
      const gm = (window as any).google.maps
      const map = (TripDetailPage as any)._gmap
      if (!map) return
      // Ensure markers reflect current points
      try {
        routeMarkersRef.current.forEach((m) => m.setMap && m.setMap(null))
        routeMarkersRef.current = []
        if (!routeInfoWindowRef.current) {
          routeInfoWindowRef.current = new gm.InfoWindow()
        }
        const bounds = new gm.LatLngBounds()
        pts.forEach((p) => {
          const marker = new gm.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.name })
          marker.addListener('click', () => {
            try {
              const content = `<div style="min-width:160px"><strong>${p.name}</strong></div>`
              routeInfoWindowRef.current.setContent(content)
              routeInfoWindowRef.current.open(map, marker)
              if (p.id) {
                window.location.href = `/attraction/${p.id}`
              }
            } catch {}
          })
          routeMarkersRef.current.push(marker)
          bounds.extend({ lat: p.lat, lng: p.lng })
        })
        if (pts.length > 0) map.fitBounds(bounds)
      } catch {}
      const directionsService = new gm.DirectionsService()
      let directionsRenderer = (TripDetailPage as any)._renderer as any
      if (!directionsRenderer) {
        directionsRenderer = new gm.DirectionsRenderer({ suppressMarkers: false, preserveViewport: false })
        directionsRenderer.setMap(map)
        ;(TripDetailPage as any)._renderer = directionsRenderer
      }

      const origin = { lat: pts[0].lat, lng: pts[0].lng }
      const destination = { lat: pts[pts.length - 1].lat, lng: pts[pts.length - 1].lng }
      const middle = pts.slice(1, -1)
      const waypoints = middle.map((p) => ({ location: { lat: p.lat, lng: p.lng } }))

      directionsService.route(
        {
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: gm.TravelMode.DRIVING,
        },
        (result: any, status: any) => {
          if (status === 'OK' || status === gm.DirectionsStatus.OK) {
            directionsRenderer!.setDirections(result)
          }
        }
      )
    }, 0)
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
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading compilation...</div>
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
                <Button variant="outline" size="sm" onClick={() => {
                  const gm = (window as any).google?.maps
                  const m = (TripDetailPage as any)._gmap
                  if (gm && m) { m.setZoom((m.getZoom?.() || 12) + 1) }
                }} disabled={!showRouteMap}>
                  +
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  const gm = (window as any).google?.maps
                  const m = (TripDetailPage as any)._gmap
                  if (gm && m) { m.setZoom((m.getZoom?.() || 12) - 1) }
                }} disabled={!showRouteMap}>
                  -
                </Button>
                <Button variant="outline" size="sm" onClick={handleCalculateRoute} disabled={!isGoogleLoaded || !compilation || (compilation.items || []).length < 2}>
                  <Route className="h-4 w-4 mr-2" /> Calculate Shortest Route
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showRouteMap && (
                <div ref={routeMapRef} id="trip-route-map" className="w-full h-[420px] rounded-md border" />
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
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => handleRemoveItem(String(item.attraction.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
