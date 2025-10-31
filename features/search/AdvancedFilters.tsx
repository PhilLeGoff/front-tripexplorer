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

const categories = [
  { id: "museums", label: "Museums & Galleries" },
  { id: "landmarks", label: "Landmarks" },
  { id: "parks", label: "Parks & Nature" },
  { id: "entertainment", label: "Entertainment" },
  { id: "food", label: "Food & Dining" },
  { id: "shopping", label: "Shopping" },
  { id: "nightlife", label: "Nightlife" },
  { id: "tours", label: "Tours & Activities" },
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
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {categories.map((category) => (
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


