const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

export interface ApiError {
  detail?: string
  error?: string | Record<string, any>
  [key: string]: any
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  // Decide whether to attach Authorization header. We avoid sending it for auth endpoints
  private getAuthHeaders(endpoint?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    // Do not attach Authorization for auth routes to avoid parsing invalid tokens on signin/signup
    if (endpoint && endpoint.startsWith('/auth/')) {
      return headers
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let error: ApiError
      try {
        error = await response.json()
      } catch {
        error = { detail: `HTTP ${response.status}: ${response.statusText}` }
      }

      // Prefer 'detail', then 'error'. If 'error' is an object, stringify it for a readable message.
      const detailMsg = error.detail
      const errorMsg = error.error
      let message: string
      if (detailMsg) {
        message = typeof detailMsg === 'string' ? detailMsg : JSON.stringify(detailMsg)
      } else if (errorMsg) {
        message = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg)
      } else {
        message = JSON.stringify(error)
      }

      throw new Error(message)
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = `${this.baseURL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        url += `?${queryString}`
      }
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(endpoint),
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(endpoint),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(endpoint),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(endpoint),
      body: data ? JSON.stringify(data) : undefined,
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(endpoint),
    })

    return this.handleResponse<T>(response)
  }
}

export const apiClient = new ApiClient()

