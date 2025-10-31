import { apiClient } from './api'
import type {
  Compilation,
  CompilationAddItemRequest,
  CompilationRemoveItemRequest,
} from './types'

class CompilationsService {
  async getAll(): Promise<Compilation[]> {
    return apiClient.get<Compilation[]>('/compilations/')
  }

  async getById(id: number): Promise<Compilation> {
    return apiClient.get<Compilation>(`/compilations/${id}/`)
  }

  async create(data: {
    name?: string
    profile: string
    country: string
  }): Promise<Compilation> {
    return apiClient.post<Compilation>('/compilations/', {
      name: data.name || 'Ma compilation',
      profile: data.profile,
      country: data.country,
    })
  }

  async update(id: number, data: Partial<Compilation>): Promise<Compilation> {
    return apiClient.put<Compilation>(`/compilations/${id}/`, data)
  }

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/compilations/${id}/`)
  }

  async addItem(
    compilationId: number,
    data: CompilationAddItemRequest
  ): Promise<Compilation> {
    return apiClient.post<Compilation>(
      `/compilations/${compilationId}/add_item/`,
      data
    )
  }

  async removeItem(
    compilationId: number,
    data: CompilationRemoveItemRequest
  ): Promise<Compilation> {
    return apiClient.post<Compilation>(
      `/compilations/${compilationId}/remove_item/`,
      data
    )
  }
}

export const compilationsService = new CompilationsService()


