export { apiClient } from './api'
export { authService } from './auth.service'
export { attractionsService } from './attractions.service'
export { compilationsService } from './compilations.service'
export * from './types'

// Google Places photo helper
export function getPlacePhotoUrl(photoReference: string, maxWidth: number = 800) {
  const apiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY ||
    process.env.NEXT_PUBLIC_MAPS_PLATFORM_API_KEY ||
    process.env.NEXT_PUBLIC_MAPS_API_KEY ||
    process.env.MAPS_PLATFORM_API_KEY
  if (!photoReference || !apiKey) return '/placeholder.svg'
  const params = new URLSearchParams({
    photoreference: photoReference,
    maxwidth: String(maxWidth),
    key: apiKey,
  })
  return `https://maps.googleapis.com/maps/api/place/photo?${params.toString()}`
}


