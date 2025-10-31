"use client"

import { useState, useEffect } from "react"
import AttractionCard from "@/features/home/AttractionCard"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid3x3, List } from "lucide-react"
import { attractionsService, type Attraction } from "@/services"

interface AttractionsGridProps {
  profile: string
  country: string
}

export default function AttractionsGrid({ profile, country }: AttractionsGridProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState("popular")
  const [attractions, setAttractions] = useState<Attraction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttractions = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await attractionsService.getPopular(country, 20)
        setAttractions(data)
      } catch (err: any) {
        setError(err.message || "Failed to load attractions")
      } finally {
        setLoading(false)
      }
    }

    fetchAttractions()
  }, [country])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Loading attractions...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-destructive">{error}</div>
      </div>
    )
  }

  const featuredAttractions = attractions.filter((a) => a.is_featured)
  const allAttractions = [...attractions]

  // Sort attractions based on sortBy
  let sortedAttractions = [...allAttractions]
  if (sortBy === "rating") {
    sortedAttractions.sort((a, b) => b.rating - a.rating)
  } else if (sortBy === "price-low") {
    sortedAttractions.sort((a, b) => (a.price_level || 0) - (b.price_level || 0))
  } else if (sortBy === "price-high") {
    sortedAttractions.sort((a, b) => (b.price_level || 0) - (a.price_level || 0))
  }

  return (
    <div className="space-y-6">
      {/* View Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing {allAttractions.length} attractions</span>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
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
        </div>
      </div>

      {/* Tabs for Featured/All */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="all">All Attractions</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-6">
          <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {featuredAttractions.length > 0 ? (
              featuredAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} viewMode={viewMode} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No featured attractions found
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
            {sortedAttractions.length > 0 ? (
              sortedAttractions.map((attraction) => (
                <AttractionCard key={attraction.id} attraction={attraction} viewMode={viewMode} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                No attractions found
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}


