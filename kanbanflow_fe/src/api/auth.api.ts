import apiClient from './client'
import type { AuthResponse } from '@/types'

export const authApi = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/login', {
      username,
      password,
    })
    return data
  },
  
  register: async (params: {
    email: string
    username: string
    password: string
    fullName: string
  }): Promise<AuthResponse> => {
    const { data } = await apiClient.post('/api/auth/register', params)
    return data
  },
  
  getMe: async () => {
    const { data } = await apiClient.get('/api/auth/me')
    return data
  },
}