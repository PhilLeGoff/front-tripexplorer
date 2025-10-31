"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal } from "lucide-react"

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search attractions, landmarks, museums..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 pl-10"
        />
      </div>
      <Button variant="outline" size="icon" className="h-11 w-11 lg:hidden bg-transparent">
        <SlidersHorizontal className="h-4 w-4" />
      </Button>
    </div>
  )
}


