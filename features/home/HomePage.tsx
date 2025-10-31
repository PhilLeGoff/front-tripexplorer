"use client"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import AttractionsGrid from "@/features/home/AttractionsGrid"
import FilterSidebar from "@/features/home/FilterSidebar"
import SearchBar from "@/features/home/SearchBar"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { User } from "lucide-react"

function HomeContent() {
  const searchParams = useSearchParams()
  const profile = searchParams.get("profile") || "tourist"
  const country = searchParams.get("country") || "United States"

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-balance text-3xl font-bold md:text-4xl">Explore {country}</h1>
              <p className="text-pretty text-muted-foreground mt-2">
                Discover amazing attractions tailored for {profile}s
              </p>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm md:flex">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium capitalize">{profile}</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">{country}</span>
            </div>
          </div>
          <SearchBar />
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <FilterSidebar />
          <AttractionsGrid profile={profile} country={country} />
        </div>
      </main>
    </>
  )
}

export function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
      <Footer />
    </div>
  )
}

export default HomePage
