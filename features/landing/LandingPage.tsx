"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Compass, MapPin, Briefcase, Globe, Star, Heart } from "lucide-react"
import Link from "next/link"

const countries = [
  "United States",
  "United Kingdom",
  "France",
  "Italy",
  "Spain",
  "Germany",
  "Japan",
  "Australia",
  "Canada",
  "Mexico",
  "Brazil",
  "Thailand",
  "Greece",
  "Netherlands",
  "Switzerland",
]

const profiles = [
  { id: "local", label: "Local", description: "Discover hidden gems in your area", icon: MapPin },
  { id: "tourist", label: "Tourist", description: "Explore popular destinations", icon: Compass },
  { id: "professional", label: "Professional", description: "Plan business trips efficiently", icon: Briefcase },
]

export function LandingPage() {
  const router = useRouter()
  const [selectedProfile, setSelectedProfile] = useState("tourist")
  const [selectedCountry, setSelectedCountry] = useState("")

  const handleStartExploring = () => {
    if (selectedCountry) {
      router.push(`/home?profile=${selectedProfile}&country=${encodeURIComponent(selectedCountry)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Globe className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">TripExplorer</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-white/90 transition-colors hover:text-white">Features</a>
            <a href="#about" className="text-sm font-medium text-white/90 transition-colors hover:text-white">About</a>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Main Content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-balance text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                Discover Amazing Attractions
              </h1>
              <p className="text-pretty text-lg text-white/90 md:text-xl">
                Find, plan, and share your perfect trip with personalized recommendations tailored to your travel style
              </p>
            </div>

            {/* Profile Selection */}
            <Card className="border-white/20 bg-white/95 p-6 shadow-2xl backdrop-blur-sm">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Choose Your Profile</Label>
                  <RadioGroup value={selectedProfile} onValueChange={setSelectedProfile}>
                    <div className="grid gap-3">
                      {profiles.map((profile) => {
                        const Icon = profile.icon
                        return (
                          <label
                            key={profile.id}
                            className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-all hover:border-primary/50 hover:bg-primary/5 ${selectedProfile === profile.id ? "border-primary bg-primary/10" : "border-border"}`}
                          >
                            <RadioGroupItem value={profile.id} id={profile.id} className="mt-1" />
                            <div className="flex flex-1 items-start gap-3">
                              <div className="rounded-full bg-primary/10 p-2">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="font-semibold">{profile.label}</div>
                                <div className="text-sm text-muted-foreground">{profile.description}</div>
                              </div>
                            </div>
                          </label>
                        )
                      })}
                    </div>
                  </RadioGroup>
                </div>

                {/* Country Selector */}
                <div className="space-y-3">
                  <Label htmlFor="country" className="text-base font-semibold">Select Country</Label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger id="country" className="h-12">
                      <SelectValue placeholder="Choose a destination..." />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* CTA Button */}
                <Button size="lg" className="w-full text-base font-semibold" onClick={handleStartExploring} disabled={!selectedCountry}>
                  Start Exploring
                  <Compass className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Column - Feature Showcase */}
          <div className="flex flex-col justify-center space-y-6">
            <Card className="border-white/20 bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Why TripExplorer?</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      <Star className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Curated Attractions</h3>
                      <p className="text-sm text-muted-foreground">Discover top-rated destinations with verified reviews and ratings</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-secondary/10 p-3">
                      <MapPin className="h-6 w-6 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Smart Itineraries</h3>
                      <p className="text-sm text-muted-foreground">Create personalized trip plans with budget tracking and route optimization</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-accent/10 p-3">
                      <Heart className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Share Experiences</h3>
                      <p className="text-sm text-muted-foreground">Save favorites and share your adventures with fellow travelers</p>
                    </div>
                  </div>
                </div>
                {/* Statistics */}
                <div className="grid grid-cols-3 gap-4 border-t pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-xs text-muted-foreground">Attractions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary">150+</div>
                    <div className="text-xs text-muted-foreground">Countries</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent">1M+</div>
                    <div className="text-xs text-muted-foreground">Users</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex items-center gap-2">
              <Globe className="h-6 w-6 text-white" />
              <span className="font-semibold text-white">TripExplorer</span>
            </div>
            <p className="text-sm text-white/70">© 2025 TripExplorer. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


