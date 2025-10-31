"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { attractionsService, type Attraction, getPlacePhotoUrl, compilationsService, type Compilation } from "@/services"
import { Star, Clock, DollarSign, MapPin, Calendar, Users, Heart, Share2, Phone, Mail, ExternalLink, Check, Accessibility } from "lucide-react"

export function AttractionDetailPage({ id }: { id: string }) {
  const [attraction, setAttraction] = useState<Attraction | null>(null)
  const [similar, setSimilar] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedInfo, setSavedInfo] = useState<{ compilationId: number; attractionId: number } | null>(null)

  useEffect(() => {
    if (!id) {
      setError("Missing attraction id")
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        let attractionData: Attraction
        try {
          attractionData = await attractionsService.getById(id)
        } catch (e: any) {
          const msg = String(e?.message || "")
          if (msg.toLowerCase().includes("not found") || msg.toLowerCase().includes("404")) {
            await attractionsService.savePlace(id)
            attractionData = await attractionsService.getById(id)
          } else {
            throw e
          }
        }

        setAttraction(attractionData)

        // Determine if already saved in any user compilation
        try {
          const compilations = await compilationsService.getAll()
          let found: { compilationId: number; attractionId: number } | null = null
          compilations.forEach((c: Compilation) => {
            c.items.forEach((item) => {
              if (item?.attraction?.place_id === (attractionData.place_id || id)) {
                found = { compilationId: c.id, attractionId: item.attraction.id }
              }
            })
          })
          setSavedInfo(found)
        } catch {
          setSavedInfo(null)
        }

        try {
          const sim = await attractionsService.getSimilar(id, 10)
          setSimilar(sim)
        } catch {
          setSimilar([])
        }
      } catch (err: any) {
        setError(err.message || "Failed to load attraction")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const handleToggleTrip = async () => {
    if (!attraction) return
    try {
      if (savedInfo) {
        // Remove from trip
        await compilationsService.removeItem(savedInfo.compilationId, { attraction_id: savedInfo.attractionId })
        setSavedInfo(null)
      } else {
        // Save to trip (default server behavior creates/uses user's default compilation)
        const res = await attractionsService.saveToTrip(attraction.place_id)
        // Try to locate just-added item to capture ids
        if (res && res.items && res.items.length > 0) {
          const match = res.items.find((it: any) => it?.attraction?.place_id === attraction.place_id)
          if (match?.attraction?.id) {
            setSavedInfo({ compilationId: res.id as any, attractionId: match.attraction.id })
          } else {
            setSavedInfo({ compilationId: res.id as any, attractionId: (attraction.id as any) })
          }
        }
      }
    } catch (e: any) {
      // No-op; UI can show a toast in the future
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading attraction...</div>
        </main>
        <Footer />
      </div>
    )
  }
  if (error || !attraction) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-destructive">{error || "Attraction not found"}</div>
        </main>
        <Footer />
      </div>
    )
  }
  const priceDisplay = attraction.price_level === null || attraction.price_level === 0 
    ? "Free" 
    : "$".repeat(attraction.price_level + 1)
  const imageUrl = attraction.photo_reference 
    ? getPlacePhotoUrl(attraction.photo_reference, 1200)
    : "/placeholder.svg"
  const openingHours = attraction.opening_hours as Record<string, string> || {}
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <div className="relative h-[400px] w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={attraction.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <Badge variant="secondary" className="mb-3">
              {attraction.category || "Attraction"}
            </Badge>
            <h1 className="text-balance text-4xl font-bold text-white md:text-5xl">{attraction.name}</h1>
            <p className="text-pretty text-lg text-white/90 mt-2">{attraction.description || attraction.formatted_address}</p>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column - Main Content */}
          <div className="space-y-8">
            {/* Quick Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Rating</div>
                      <div className="font-semibold">
                        {attraction.rating.toFixed(1)} ({attraction.user_ratings_total.toLocaleString()})
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-secondary/10 p-3">
                      <Clock className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Duration</div>
                      <div className="font-semibold">2-4 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-accent/10 p-3">
                      <DollarSign className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Price</div>
                      <div className="font-semibold">{priceDisplay}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Visitors</div>
                      <div className="font-semibold">{attraction.user_ratings_total > 1000 ? "Very Popular" : "Popular"}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="highlights">Highlights</TabsTrigger>
                <TabsTrigger value="tips">Tips</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-pretty leading-relaxed text-muted-foreground">{attraction.description || attraction.formatted_address}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {attraction.types && attraction.types.length > 0 ? (
                        attraction.types.slice(0, 6).map((type: string) => (
                          <div key={type} className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-primary" />
                            <span className="text-sm">{type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No features listed</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Hours of Operation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.keys(openingHours).length > 0 ? (
                        Object.entries(openingHours).map(([day, hours]) => (
                          <div key={day} className="flex items-center justify-between text-sm">
                            <span className="font-medium capitalize">{day}</span>
                            <span className="text-muted-foreground">{String(hours)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">Hours not available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="highlights" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Must-See Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {similar.length > 0 ? (
                        similar.slice(0, 5).map((item, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                              {index + 1}
                            </div>
                            <p className="text-pretty leading-relaxed">{item.name} - {item.formatted_address}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No highlights available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="tips" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Visitor Tips</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {attraction.reviews && attraction.reviews.length > 0 ? (
                        attraction.reviews.slice(0, 5).map((review: any, index: number) => (
                          <div key={index} className="flex gap-3">
                            <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                            <p className="text-pretty leading-relaxed text-muted-foreground">{review.text || review}</p>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No tips available</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="gallery" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {similar.length > 0 ? (
                    similar.slice(0, 4).map((item, index) => (
                      <div key={index} className="overflow-hidden rounded-lg">
                        <AspectRatio ratio={4 / 3}>
                          <Image
                            src={getPlacePhotoUrl(item.photo_reference || "", 800)}
                            alt={`${item.name} - Image ${index + 1}`}
                            fill
                            className="object-cover transition-transform hover:scale-105"
                          />
                        </AspectRatio>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground">No gallery images available</div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
          {/* Right Column - Booking & Info */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">
                    {priceDisplay}
                  </span>
                  <span className="text-sm text-muted-foreground">per person</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="font-semibold">{attraction.rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">({attraction.user_ratings_total.toLocaleString()} reviews)</span>
                </div>
                <Separator />
                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Now
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" size="lg" onClick={handleToggleTrip}>
                    {savedInfo ? "Remove from Trip" : "Add to Trip"}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" className="flex-1 bg-transparent">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Location Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Location & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">{attraction.formatted_address}</div>
                  </div>
                </div>
                {attraction.phone_number && (
                  <div className="flex gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Phone</div>
                      <div className="text-sm text-muted-foreground">{attraction.phone_number}</div>
                    </div>
                  </div>
                )}
                {attraction.website && (
                  <div className="flex gap-3">
                    <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Website</div>
                      <a
                        href={attraction.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        Visit website
                      </a>
                    </div>
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4 bg-transparent">
                  <MapPin className="mr-2 h-4 w-4" />
                  View on Map
                </Button>
              </CardContent>
            </Card>
            {/* Accessibility Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Accessibility className="h-5 w-5" />
                  Accessibility
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This attraction is wheelchair accessible and offers accommodations for visitors with disabilities.
                  Contact directly for specific accessibility needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AttractionDetailPage
