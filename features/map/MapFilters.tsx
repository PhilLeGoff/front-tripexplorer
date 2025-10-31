"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const categories = [
  { id: "Landmarks", label: "Landmarks", color: "bg-red-500" },
  { id: "Parks & Nature", label: "Parks & Nature", color: "bg-green-500" },
  { id: "Museums & Galleries", label: "Museums & Galleries", color: "bg-purple-500" },
  { id: "Entertainment", label: "Entertainment", color: "bg-amber-500" },
]

interface MapFiltersProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  minRating: number
  onMinRatingChange: (rating: number) => void
  maxPrice: number
  onMaxPriceChange: (price: number) => void
}

export default function MapFilters({
  selectedCategories,
  onCategoriesChange,
  minRating,
  onMinRatingChange,
  maxPrice,
  onMaxPriceChange,
}: MapFiltersProps) {
  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter((id) => id !== categoryId))
    } else {
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const clearFilters = () => {
    onCategoriesChange([])
    onMinRatingChange(0)
    onMaxPriceChange(200)
  }

  const hasActiveFilters = selectedCategories.length > 0 || minRating > 0 || maxPrice < 200

  return (
    <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r bg-muted/30">
      <div className="p-4 space-y-6 lg:sticky lg:top-0 max-h-screen overflow-y-auto">
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
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1">
                    {minRating}+ stars
                    <button onClick={() => onMinRatingChange(0)} className="ml-1">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {maxPrice < 200 && (
                  <Badge variant="secondary" className="gap-1">
                    Under ${maxPrice}
                    <button onClick={() => onMaxPriceChange(200)} className="ml-1">
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
                <div key={category.id} className="flex items-center gap-3">
                  <div className={`h-4 w-4 rounded-full ${category.color}`} />
                  <Checkbox
                    id={category.id}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label htmlFor={category.id} className="cursor-pointer text-sm font-normal flex-1">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Minimum Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Minimum Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider value={[minRating]} onValueChange={([value]) => onMinRatingChange(value)} max={5} step={0.5} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Any</span>
                <span className="font-medium">{minRating > 0 ? `${minRating}+ stars` : "All ratings"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maximum Price */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Maximum Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Slider value={[maxPrice]} onValueChange={([value]) => onMaxPriceChange(value)} max={200} step={10} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Free</span>
                <span className="font-medium">${maxPrice}+</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  )
}


