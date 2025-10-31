"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import SearchResults from "@/features/search/SearchResults"
import AdvancedFilters from "@/features/search/AdvancedFilters"
import SearchHeader from "@/features/search/SearchHeader"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""
  const minRating = searchParams.get("minRating") || ""
  const maxPrice = searchParams.get("maxPrice") || ""

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SearchHeader initialQuery={query} />
        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          <AdvancedFilters initialCategory={category} initialMinRating={minRating} initialMaxPrice={maxPrice} />
          <SearchResults query={query} category={category} minRating={minRating} maxPrice={maxPrice} />
        </div>
      </main>
    </>
  )
}

export function SearchPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={<div>Loading search...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </div>
  )
}

export default SearchPage
