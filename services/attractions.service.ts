import { apiClient } from './api'
import type { Attraction, SearchParams } from './types'

class AttractionsService {
  private normalizeAttraction(raw: any): Attraction {
    if (!raw) return raw
    const normalized: any = { ...raw }
    // If backend returns unified `location` field, map to latitude/longitude for existing frontend code
    if (raw.location && typeof raw.location === 'object') {
      normalized.latitude = raw.location.lat ?? null
      normalized.longitude = raw.location.lng ?? null
    } else if (raw.location == null) {
      // fallback to existing numeric fields if present
      normalized.latitude = raw.latitude ?? null
      normalized.longitude = raw.longitude ?? null
    }
    return normalized as Attraction
  }

  async getAll(): Promise<Attraction[]> {
    const res = await apiClient.get<Attraction[]>('/attractions/')
    return (res || []).map(r => this.normalizeAttraction(r))
  }

  async getById(id: string | number): Promise<Attraction> {
    const res = await apiClient.get<Attraction>(`/attractions/${id}/`)
    return this.normalizeAttraction(res)
  }

  async getPopular(country: string = 'France', limit: number = 20): Promise<Attraction[]> {
    const res = await apiClient.get<Attraction[]>('/attractions/popular/', {
      country,
      limit,
    })
    return (res || []).map(r => this.normalizeAttraction(r))
  }

  async search(params: SearchParams): Promise<Attraction[]> {
    const res = await apiClient.get<Attraction[]>('/attractions/search/', params)
    return (res || []).map(r => this.normalizeAttraction(r))
  }

  async getSimilar(attractionId: string | number, limit: number = 10): Promise<Attraction[]> {
    const res = await apiClient.get<Attraction[]>(`/attractions/${attractionId}/similar/`, {
      limit,
    })
    return (res || []).map(r => this.normalizeAttraction(r))
  }

  async savePlace(placeId: string): Promise<Attraction> {
    const res = await apiClient.post<Attraction>('/attractions/save/', { place_id: placeId })
    return this.normalizeAttraction(res)
  }

  async saveToTrip(placeId: string, compilationId?: string, compilationName?: string) {
    const res = await apiClient.post<any>('/attractions/save/', { place_id: placeId, compilation_id: compilationId, compilation_name: compilationName })
    return res
  }

  async syncFromGoogle(country: string = 'France', limit: number = 20): Promise<{
    message: string
    total_found: number
  }> {
    return apiClient.post<{ message: string; total_found: number }>(
      '/attractions/sync_from_google/',
      { country, limit }
    )
  }
}

export const attractionsService = new AttractionsService()


