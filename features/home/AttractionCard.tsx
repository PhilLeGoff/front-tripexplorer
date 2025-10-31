"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Clock, DollarSign, Heart, Plus, Minus } from "lucide-react"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import type { Attraction } from "@/services"
import { getPlacePhotoUrl, attractionsService } from "@/services"
import { compilationsService } from "@/services"

interface AttractionCardProps {
  attraction: Attraction
  viewMode: "grid" | "list"
}

export default function AttractionCard({ attraction, viewMode }: AttractionCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [savedInfo, setSavedInfo] = useState<{ compilationId: string | number; attractionId: string | number } | null>(null)

  // Map API data to display format
  const priceDisplay = attraction.price_level === null || attraction.price_level === 0 
    ? "Free" 
    : "$".repeat(attraction.price_level + 1)
  const initialImageUrl = attraction.photo_reference
    ? getPlacePhotoUrl(attraction.photo_reference, 800)
    : "/placeholder.svg"
  const [imgSrc, setImgSrc] = useState<string>(initialImageUrl)
  const duration = "2-4 hours" // Not in API, using placeholder

  const handleAddToTrip = async () => {
    if (saving) return
    setSaving(true)
    try {
      const res: any = await attractionsService.saveToTrip(attraction.place_id)
      // Try to locate just-added item to capture ids
      if (res && res.items && res.items.length > 0) {
        const match = res.items.find((it: any) => it?.attraction?.place_id === attraction.place_id)
        if (match?.attraction?.id) {
          setSavedInfo({ compilationId: res.id as any, attractionId: match.attraction.id })
          setIsSaved(true)
        }
      }
    } catch (e) {
      // no-op for now; we could show a toast later
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveFromTrip = async () => {
    if (saving || !savedInfo) return
    setSaving(true)
    try {
      await compilationsService.removeItem(savedInfo.compilationId as any, { attraction_id: savedInfo.attractionId as any } as any)
      setIsSaved(false)
      setSavedInfo(null)
    } catch (e) {
      // no-op for now
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    let cancelled = false
    const checkSaved = async () => {
      try {
        const comps = await compilationsService.getAll()
        let found: { compilationId: string | number; attractionId: string | number } | null = null
        comps.forEach((c: any) => {
          (c.items || []).forEach((item: any) => {
            if (item?.attraction?.place_id === attraction.place_id) {
              found = { compilationId: c.id, attractionId: item.attraction.id }
            }
          })
        })
        if (!cancelled) {
          setIsSaved(!!found)
          setSavedInfo(found)
        }
      } catch (e) {
        if (!cancelled) {
          setIsSaved(false)
          setSavedInfo(null)
        }
      }
    }
    checkSaved()
    return () => {
      cancelled = true
    }
  }, [attraction.place_id])
  if (viewMode === "list") {
    return (
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="flex flex-col gap-4 p-4 sm:flex-row">
          <Link href={`/attraction/${attraction.place_id}`} className="relative w-full overflow-hidden rounded-lg sm:w-48">
            <AspectRatio ratio={16 / 9}>
              <Image src={imgSrc} alt={attraction.name} fill className="object-cover" onError={() => setImgSrc('/placeholder.svg')} />
            </AspectRatio>
            {attraction.is_featured && (
              <Badge className="absolute left-2 top-2" variant="secondary">
                Featured
              </Badge>
            )}
          </Link>
          <div className="flex flex-1 flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link href={`/attraction/${attraction.place_id}`}>
                    <h3 className="text-lg font-semibold leading-tight hover:text-primary">{attraction.name}</h3>
                  </Link>
                  <Badge variant="outline" className="mt-1">
                    {attraction.category || "Attraction"}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => setIsFavorite(!isFavorite)} className="shrink-0">
                  <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{attraction.description || attraction.formatted_address}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-accent text-accent" />
                  <span className="font-medium">{attraction.rating.toFixed(1)}</span>
                  <span className="text-muted-foreground">({attraction.user_ratings_total.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{duration}</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <DollarSign className="h-4 w-4" />
                  <span>{priceDisplay}</span>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" size="sm" asChild>
                <Link href={`/attraction/${attraction.place_id}`}>View Details</Link>
              </Button>
              {isSaved ? (
                <Button variant="outline" size="sm" onClick={handleRemoveFromTrip} disabled={saving}>
                  <Minus className="h-4 w-4" />
                  {saving ? "Removing..." : "Remove"}
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleAddToTrip} disabled={saving}>
                  <Plus className="h-4 w-4" />
                  {saving ? "Adding..." : "Add to Trip"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
      <CardHeader className="p-0">
        <Link href={`/attraction/${attraction.place_id}`} className="relative overflow-hidden block">
          <AspectRatio ratio={4 / 3}>
            <Image
              src={imgSrc}
              alt={attraction.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImgSrc('/placeholder.svg')}
            />
          </AspectRatio>
          {attraction.is_featured && (
            <Badge className="absolute left-3 top-3" variant="secondary">
              Featured
            </Badge>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute right-3 top-3 bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Link href={`/attraction/${attraction.place_id}`}>
              <h3 className="text-balance font-semibold leading-tight hover:text-primary">{attraction.name}</h3>
            </Link>
          </div>
          <Badge variant="outline" className="w-fit">
            {attraction.category || "Attraction"}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{attraction.description || attraction.formatted_address}</p>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="font-medium">{attraction.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">({attraction.user_ratings_total.toLocaleString()})</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1 font-semibold text-primary">
            <DollarSign className="h-4 w-4" />
            <span>{priceDisplay}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="gap-2 p-4 pt-0">
        <Button className="flex-1" size="sm" asChild>
          <Link href={`/attraction/${attraction.place_id}`}>View Details</Link>
        </Button>
        {isSaved ? (
          <Button variant="outline" size="icon-sm" onClick={handleRemoveFromTrip} disabled={saving}>
            <Minus className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="icon-sm" onClick={handleAddToTrip} disabled={saving}>
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}


