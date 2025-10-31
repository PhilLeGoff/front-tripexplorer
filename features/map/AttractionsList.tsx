"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, DollarSign, Clock, MapPin } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from "next/link"

const mockAttractions = [
  {
    id: "1",
    name: "Statue of Liberty",
    category: "Landmarks",
    rating: 4.8,
    reviews: 12453,
    price: 25,
    duration: "3-4 hours",
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
    lat: 40.759,
    lng: -73.9845,
  },
]

interface AttractionsListProps {
  selectedCategories: string[]
  minRating: number
  maxPrice: number
  selectedAttractionId: string | null
  onAttractionSelect: (id: string) => void
}

export default function AttractionsList({
  selectedCategories,
  minRating,
  maxPrice,
  selectedAttractionId,
  onAttractionSelect,
}: AttractionsListProps) {
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

  return (
    <div className="h-[600px] lg:h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg">Attractions List</h2>
        <p className="text-sm text-muted-foreground">{filteredAttractions.length} results</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {filteredAttractions.map((attraction) => (
            <Card
              key={attraction.id}
              className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedAttractionId === attraction.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onAttractionSelect(attraction.id)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold leading-tight">{attraction.name}</h3>
                    <Badge variant="outline" className="mt-1">
                      {attraction.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/attraction/${attraction.place_id}`}>
                      <MapPin className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-medium">{attraction.rating}</span>
                    <span className="text-muted-foreground">({attraction.reviews.toLocaleString()})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{attraction.duration}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-primary">
                    <DollarSign className="h-4 w-4" />
                    <span>{attraction.price === 0 ? "Free" : `$${attraction.price}`}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}


