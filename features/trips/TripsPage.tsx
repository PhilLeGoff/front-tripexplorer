"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Header } from "@/components/shared/Header"
import { Footer } from "@/components/shared/Footer"
import { compilationsService, type Compilation } from "@/services"
import { Plus, Calendar, MapPin, DollarSign, Share2 } from "lucide-react"

export function TripsPage() {
  const searchParams = useSearchParams()
  const profile = searchParams.get("profile") || "tourist"
  const country = searchParams.get("country") || "United States"
  const [compilations, setCompilations] = useState<Compilation[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newTripName, setNewTripName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompilations = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await compilationsService.getAll()
        setCompilations(data)
      } catch (err: any) {
        setError(err.message || "Failed to load trips")
      } finally {
        setIsLoading(false)
      }
    }
    fetchCompilations()
  }, [])

  const calculateTripTotal = (compilation: Compilation) => {
    return compilation.items.reduce((sum, item) => {
      const priceLevel = item.attraction.price_level || 0
      return sum + (priceLevel + 1)
    }, 0)
  }
  const handleCreateTrip = async () => {
    if (newTripName.trim()) {
      try {
        const newCompilation = await compilationsService.create({
          name: newTripName,
          profile: profile,
          country: country,
        })
        setCompilations([...compilations, newCompilation])
        setNewTripName("")
        setIsCreateDialogOpen(false)
      } catch (err: any) {
        setError(err.message || "Failed to create trip")
      }
    }
  }
  const handleDeleteTrip = async (compilationId: string | number) => {
    try {
      await compilationsService.delete(compilationId as any)
      setCompilations(compilations.filter((c) => c.id !== compilationId))
    } catch (err: any) {
      setError(err.message || "Failed to delete trip")
    }
  }
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground">Loading trips...</div>
        </main>
        <Footer />
      </div>
    )
  }
  if (error && compilations.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-destructive">{error}</div>
        </main>
        <Footer />
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold md:text-4xl">My Trips</h1>
            <p className="text-pretty text-muted-foreground mt-2">Plan and manage your travel adventures</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create New Trip
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Trip</DialogTitle>
                <DialogDescription>Start planning your next adventure by creating a new trip.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="trip-name">Trip Name</Label>
                  <Input
                    id="trip-name"
                    placeholder="e.g., Summer Vacation 2025"
                    value={newTripName}
                    onChange={(e) => setNewTripName(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTrip}>Create Trip</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">All Compilations ({compilations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="upcoming" className="mt-6">
            {compilations.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {compilations.map((compilation) => (
                  <Card key={compilation.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden">
                        <AspectRatio ratio={16 / 9}>
                          <Image
                            src={compilation.items[0]?.attraction?.photo_reference ? "/placeholder.svg" : "/placeholder.svg"}
                            alt={compilation.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </AspectRatio>
                        <Badge className="absolute left-3 top-3" variant="secondary">
                          {compilation.items.length} attractions
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      <div>
                        <CardTitle className="text-balance leading-tight">{compilation.name}</CardTitle>
                        <CardDescription className="text-pretty mt-1">{compilation.country} • {compilation.profile}</CardDescription>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{compilation.items.length} attractions</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>Budget: ${calculateTripTotal(compilation)}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {compilation.items.slice(0, 3).map((item) => (
                          <Badge key={item.id} variant="outline" className="text-xs">
                            {item.attraction.name}
                          </Badge>
                        ))}
                        {compilation.items.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{compilation.items.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="gap-2 p-4 pt-0">
                      <Button className="flex-1" asChild>
                        <Link href={`/trips/${compilation.id}`}>View Details</Link>
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteTrip(compilation.id)}>
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">No compilations</h3>
                <p className="text-muted-foreground mb-6">Start planning your next adventure by creating a new compilation.</p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Compilation
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}

export default TripsPage
