"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

const categories = [
  { id: "museums", label: "Museums & Galleries", count: 45 },
  { id: "landmarks", label: "Landmarks", count: 32 },
  { id: "parks", label: "Parks & Nature", count: 28 },
  { id: "entertainment", label: "Entertainment", count: 56 },
  { id: "food", label: "Food & Dining", count: 89 },
  { id: "shopping", label: "Shopping", count: 67 },
  { id: "nightlife", label: "Nightlife", count: 41 },
  { id: "tours", label: "Tours & Activities", count: 53 },
]

const ratings = [
  { id: "5", label: "5 Stars", value: 5 },
  { id: "4", label: "4+ Stars", value: 4 },
  { id: "3", label: "3+ Stars", value: 3 },
]

export default function FilterSidebar() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedRating, setSelectedRating] = useState<string>("")
  const [priceRange, setPriceRange] = useState([0, 200])

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  const clearFilters = () => {
    setSelectedCategories([])
    setSelectedRating("")
    setPriceRange([0, 200])
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedRating || priceRange[0] > 0 || priceRange[1] < 200

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        {/* Active Filters */}
        {hasActiveFilters && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Active Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-auto p-0 text-xs">
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
                      <button onClick={() => toggleCategory(catId)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )
                })}
                {selectedRating && (
                  <Badge variant="secondary" className="gap-1">
                    {ratings.find((r) => r.id === selectedRating)?.label}
                    <button onClick={() => setSelectedRating("")} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
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
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={category.id} className="cursor-pointer text-sm font-normal">
                      {category.label}
                    </Label>
                  </div>
                  <span className="text-xs text-muted-foreground">{category.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ratings.map((rating) => (
                <div key={rating.id} className="flex items-center gap-2">
                  <Checkbox
                    id={rating.id}
                    checked={selectedRating === rating.id}
                    onCheckedChange={(checked) => setSelectedRating(checked ? rating.id : "")}
                  />
                  <Label htmlFor={rating.id} className="cursor-pointer text-sm font-normal">
                    {rating.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Range */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider value={priceRange} onValueChange={setPriceRange} max={200} step={10} className="w-full" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">${priceRange[0]}</span>
                <span className="text-muted-foreground">${priceRange[1]}+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}


