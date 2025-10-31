"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"

interface SearchHeaderProps {
  initialQuery: string
}

export default function SearchHeader({ initialQuery }: SearchHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(initialQuery)

  useEffect(() => {
    setSearchQuery(initialQuery)
  }, [initialQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("q", searchQuery.trim())
      router.push(`/search?${params.toString()}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("q")
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-balance text-3xl font-bold md:text-4xl">Search Attractions</h1>
        <p className="text-pretty text-muted-foreground mt-2">Find the perfect destination for your next adventure</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, location, or activity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 pl-10 pr-10 text-base"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
        <Button type="submit" size="lg" className="px-8">
          Search
        </Button>
      </form>

      {initialQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Showing results for:</span>
          <span className="font-medium text-foreground">"{initialQuery}"</span>
        </div>
      )}
    </div>
  )
}


