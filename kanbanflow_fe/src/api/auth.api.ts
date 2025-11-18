import apiClient from './client'
import type { AuthResponse, User } from '@/types'

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
  
  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/api/auth/me')
    return data
  },
  
  updateProfile: async (params: {
    fullName: string
    email: string
    username: string
    avatarUrl?: string
  }): Promise<User> => {
    const { data } = await apiClient.put('/api/users/me', params)
    return data
  },
  
  changePassword: async (params: {
    currentPassword: string
    newPassword: string
  }): Promise<void> => {
    await apiClient.put('/api/users/me/password', params)
  },
}