import { apiClient } from './api'
import type { AuthResponse, SignUpRequest, SignInRequest, RefreshRequest } from './types'

class AuthService {
  async signup(data: SignUpRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signup/', data)
    
    // Store tokens and user profile
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))
      // Store profile for search requests
      if (response.user.selected_profile) {
        localStorage.setItem('user_profile', response.user.selected_profile)
      }
      if (response.user.selected_country) {
        localStorage.setItem('user_country', response.user.selected_country)
      }
      if (response.user.selected_city) {
        localStorage.setItem('user_city', response.user.selected_city)
      }
    }
    
    return response
  }

  async signin(data: SignInRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/signin/', data)
    
    // Store tokens and user profile
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access)
      localStorage.setItem('refresh_token', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))
      // Store profile for search requests
      if (response.user.selected_profile) {
        localStorage.setItem('user_profile', response.user.selected_profile)
      }
      if (response.user.selected_country) {
        localStorage.setItem('user_country', response.user.selected_country)
      }
      if (response.user.selected_city) {
        localStorage.setItem('user_city', response.user.selected_city)
      }
    }
    
    return response
  }

  async refresh(data: RefreshRequest): Promise<{ access: string }> {
    const response = await apiClient.post<{ access: string }>('/auth/refresh/', data)
    
    // Update access token
    if (typeof window !== 'undefined' && response.access) {
      localStorage.setItem('access_token', response.access)
    }
    
    return response
  }

  async refreshToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return null

    try {
      const response = await this.refresh({ refresh: refreshToken })
      return response.access
    } catch (error) {
      // Refresh failed, clear tokens
      this.logout()
      return null
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
      localStorage.removeItem('user_profile')
      localStorage.removeItem('user_country')
      localStorage.removeItem('user_city')
    }
  }

  getCurrentUser(): any | null {
    if (typeof window === 'undefined') return null
    
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  getUserProfile(): 'tourist' | 'local' | 'pro' | null {
    if (typeof window === 'undefined') return null
    const profile = localStorage.getItem('user_profile') as 'tourist' | 'local' | 'pro' | null
    return profile || null
  }

  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  }

  isAuthenticated(): boolean {
    return this.getAccessToken() !== null
  }
}

export const authService = new AuthService()


