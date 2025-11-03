"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, SlidersHorizontal } from "lucide-react"

// Categories mapped to Google Places API types
// Reference: https://developers.google.com/maps/documentation/places/web-service/supported_types
const categories = [
  // Culture & Arts
  { id: "museum", label: "Museums", googleType: "museum" },
  { id: "art_gallery", label: "Art Galleries", googleType: "art_gallery" },
  { id: "tourist_attraction", label: "Tourist Attractions", googleType: "tourist_attraction" },
  { id: "church", label: "Churches & Temples", googleType: "church" },
  { id: "historical_site", label: "Historical Sites", googleType: "historical_site" },
  
  // Entertainment & Recreation
  { id: "amusement_park", label: "Amusement Parks", googleType: "amusement_park" },
  { id: "aquarium", label: "Aquariums", googleType: "aquarium" },
  { id: "zoo", label: "Zoos", googleType: "zoo" },
  { id: "park", label: "Parks & Nature", googleType: "park" },
  { id: "stadium", label: "Stadiums & Arenas", googleType: "stadium" },
  { id: "movie_theater", label: "Movie Theaters", googleType: "movie_theater" },
  { id: "night_club", label: "Nightlife & Clubs", googleType: "night_club" },
  { id: "casino", label: "Casinos", googleType: "casino" },
  
  // Food & Dining
  { id: "restaurant", label: "Restaurants", googleType: "restaurant" },
  { id: "cafe", label: "Cafes & Coffee", googleType: "cafe" },
  { id: "bar", label: "Bars & Pubs", googleType: "bar" },
  { id: "bakery", label: "Bakeries", googleType: "bakery" },
  { id: "meal_takeaway", label: "Takeout", googleType: "meal_takeaway" },
  
  // Shopping
  { id: "shopping_mall", label: "Shopping Malls", googleType: "shopping_mall" },
  { id: "clothing_store", label: "Clothing Stores", googleType: "clothing_store" },
  { id: "supermarket", label: "Supermarkets", googleType: "supermarket" },
  { id: "grocery_or_supermarket", label: "Grocery Stores", googleType: "grocery_or_supermarket" },
  { id: "jewelry_store", label: "Jewelry Stores", googleType: "jewelry_store" },
  { id: "book_store", label: "Bookstores", googleType: "book_store" },
  
  // Accommodation & Travel
  { id: "lodging", label: "Hotels & Lodging", googleType: "lodging" },
  { id: "campground", label: "Campgrounds", googleType: "campground" },
  { id: "rv_park", label: "RV Parks", googleType: "rv_park" },
  
  // Transportation
  { id: "airport", label: "Airports", googleType: "airport" },
  { id: "train_station", label: "Train Stations", googleType: "train_station" },
  { id: "bus_station", label: "Bus Stations", googleType: "bus_station" },
  { id: "subway_station", label: "Subway Stations", googleType: "subway_station" },
  
  // Health & Fitness
  { id: "gym", label: "Gyms & Fitness", googleType: "gym" },
  { id: "spa", label: "Spas & Wellness", googleType: "spa" },
  { id: "hospital", label: "Hospitals", googleType: "hospital" },
  { id: "pharmacy", label: "Pharmacies", googleType: "pharmacy" },
  
  // Education & Services
  { id: "library", label: "Libraries", googleType: "library" },
  { id: "university", label: "Universities", googleType: "university" },
  { id: "school", label: "Schools", googleType: "school" },
  { id: "bank", label: "Banks", googleType: "bank" },
  { id: "atm", label: "ATMs", googleType: "atm" },
  
  // Activities & Tours
  { id: "bowling_alley", label: "Bowling", googleType: "bowling_alley" },
  { id: "golf_course", label: "Golf Courses", googleType: "golf_course" },
  { id: "tourist_info", label: "Tourist Information", googleType: "tourist_info" },
]

const durations = [
  { id: "short", label: "Under 2 hours", value: "0-2" },
  { id: "medium", label: "2-4 hours", value: "2-4" },
  { id: "long", label: "4+ hours", value: "4+" },
  { id: "full", label: "Full day", value: "full" },
]

const accessibility = [
  { id: "wheelchair", label: "Wheelchair accessible" },
  { id: "family", label: "Family friendly" },
  { id: "pets", label: "Pet friendly" },
  { id: "indoor", label: "Indoor activities" },
]

interface AdvancedFiltersProps {
  initialCategory?: string
  initialMinRating?: string
  initialMaxPrice?: string
}

export default function AdvancedFilters({ initialCategory, initialMinRating, initialMaxPrice }: AdvancedFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? initialCategory.split(",") : [],
  )
  const [minRating, setMinRating] = useState(initialMinRating ? Number.parseFloat(initialMinRating) : 0)
  const [maxPrice, setMaxPrice] = useState(initialMaxPrice ? Number.parseInt(initialMaxPrice) : 200)
  const [selectedDuration, setSelectedDuration] = useState("")
  const [selectedAccessibility, setSelectedAccessibility] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(true)

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const toggleAccessibility = (accessId: string) => {
    setSelectedAccessibility((prev) =>
      prev.includes(accessId) ? prev.filter((id) => id !== accessId) : [...prev, accessId],
    )
  }

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedCategories.length > 0) {
      params.set("category", selectedCategories.join(","))
    } else {
      params.delete("category")
    }

    if (minRating > 0) {
      params.set("minRating", minRating.toString())
    } else {
      params.delete("minRating")
    }

    if (maxPrice < 200) {
      params.set("maxPrice", maxPrice.toString())
    } else {
      params.delete("maxPrice")
    }

    if (selectedDuration) {
      params.set("duration", selectedDuration)
    } else {
      params.delete("duration")
    }

    if (selectedAccessibility.length > 0) {
      params.set("accessibility", selectedAccessibility.join(","))
    } else {
      params.delete("accessibility")
    }

    router.push(`/search?${params.toString()}`)
  }

  const clearAllFilters = () => {
    setSelectedCategories([])
    setMinRating(0)
    setMaxPrice(200)
    setSelectedDuration("")
    setSelectedAccessibility([])

    const params = new URLSearchParams(searchParams.toString())
    params.delete("category")
    params.delete("minRating")
    params.delete("maxPrice")
    params.delete("duration")
    params.delete("accessibility")

    router.push(`/search?${params.toString()}`)
  }

  const hasActiveFilters =
    selectedCategories.length > 0 ||
    minRating > 0 ||
    maxPrice < 200 ||
    selectedDuration ||
    selectedAccessibility.length > 0

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between lg:hidden">
        <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="w-full">
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          {isOpen ? "Hide" : "Show"} Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              {selectedCategories.length + (minRating > 0 ? 1 : 0) + (maxPrice < 200 ? 1 : 0) + (selectedDuration ? 1 : 0) + selectedAccessibility.length}
            </Badge>
          )}
        </Button>
      </div>

      <div className={`space-y-6 ${isOpen ? "block" : "hidden lg:block"}`}>
        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-xs">
                  Clear all
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedCategories.map((catId) => {
                  const category = categories.find((c) => c.id === catId)
                  return (
                    <Badge key={catId} variant="secondary" className="gap-1">
                      {category?.label}
                      <button onClick={() => toggleCategory(catId)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {minRating}+ stars
                    <button onClick={() => setMinRating(0)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {maxPrice < 200 && (
                  <Badge variant="secondary" className="gap-1">
                    Under ${maxPrice}
                    <button onClick={() => setMaxPrice(200)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedDuration && (
                  <Badge variant="secondary" className="gap-1">
                    {durations.find((d) => d.value === selectedDuration)?.label}
                    <button onClick={() => setSelectedDuration("")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedAccessibility.map((accessId) => {
                  const access = accessibility.find((a) => a.id === accessId)
                  return (
                    <Badge key={accessId} variant="secondary" className="gap-1">
                      {access?.label}
                      <button onClick={() => toggleAccessibility(accessId)}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Categories</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">Filter by Google Places types</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {/* Culture & Arts */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Culture & Arts</h4>
                <div className="space-y-2">
                  {categories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Entertainment & Recreation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Entertainment</h4>
                <div className="space-y-2">
                  {categories.slice(5, 13).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Food & Dining */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Food & Dining</h4>
                <div className="space-y-2">
                  {categories.slice(13, 18).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shopping */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Shopping</h4>
                <div className="space-y-2">
                  {categories.slice(18, 24).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accommodation & Travel */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Accommodation</h4>
                <div className="space-y-2">
                  {categories.slice(24, 27).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transportation */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Transportation</h4>
                <div className="space-y-2">
                  {categories.slice(27, 31).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health & Fitness */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Health & Fitness</h4>
                <div className="space-y-2">
                  {categories.slice(31, 35).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education & Services */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Education & Services</h4>
                <div className="space-y-2">
                  {categories.slice(35, 40).map((category) => (
                    <div key={category.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`search-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                        {category.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities & Tours */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Activities</h4>
                <div className="space-y-2">
                  {categories.slice(40).map((category) => (
                <div key={category.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`search-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={`search-${category.id}`} className="cursor-pointer text-sm font-normal">
                    {category.label}
                  </Label>
                </div>
              ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minimum Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number.parseFloat(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any rating</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maximum Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider value={[maxPrice]} onValueChange={(v) => setMaxPrice(v[0])} max={200} step={10} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Free</span>
                <span className="font-medium">${maxPrice}{maxPrice >= 200 ? "+" : ""}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedDuration} onValueChange={setSelectedDuration}>
              <div className="space-y-3">
                {durations.map((duration) => (
                  <div key={duration.id} className="flex items-center gap-2">
                    <RadioGroupItem value={duration.value} id={`duration-${duration.id}`} />
                    <Label htmlFor={`duration-${duration.id}`} className="cursor-pointer text-sm font-normal">
                      {duration.label}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Accessibility & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {accessibility.map((access) => (
                <div key={access.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`access-${access.id}`}
                    checked={selectedAccessibility.includes(access.id)}
                    onCheckedChange={() => toggleAccessibility(access.id)}
                  />
                  <Label htmlFor={`access-${access.id}`} className="cursor-pointer text-sm font-normal">
                    {access.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Apply Filters Button */}
        <Button onClick={applyFilters} className="w-full" size="lg">
          Apply Filters
        </Button>
      </div>
    </aside>
  )
}


