export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
}

export interface AuthResponse {
  user: User
  access: string
  refresh: string
}

export interface SignUpRequest {
  email: string
  first_name: string
  last_name: string
  password: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface RefreshRequest {
  refresh: string
}

export interface Attraction {
  id: number
  place_id: string
  name: string
  formatted_address: string
  country: string
  city: string
  category: string
  types: string[]
  rating: number
  user_ratings_total: number
  price_level: number | null
  // Backwards-compatible numeric fields (may be absent if backend returns `location` GeoJSON)
  latitude?: number | null
  longitude?: number | null
  // New unified geo field returned by backend serializers
  location?: { lat: number | null; lng: number | null } | null
  description: string
  website: string
  phone_number: string
  photo_reference: string
  photos_count: number
  opening_hours: Record<string, any>
  reviews: any[]
  likes: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface SearchParams {
  q?: string
  country?: string
  city?: string
  category?: string
  min_rating?: number
  min_reviews?: number
  min_photos?: number
  price_level?: number
  type?: string
  lat?: number
  lng?: number
  radius_m?: number
  limit?: number
}

export interface CompilationItem {
  id: number
  order_index: number
  attraction: Attraction
  attraction_id: number
}

export interface Compilation {
  id: number
  name: string
  profile: string
  country: string
  items: CompilationItem[]
  created_at: string
  updated_at: string
}

export interface CompilationAddItemRequest {
  attraction_id: number
  order_index?: number
}

export interface CompilationRemoveItemRequest {
  attraction_id: number
}


