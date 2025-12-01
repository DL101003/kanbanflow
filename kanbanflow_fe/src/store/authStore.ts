import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthResponse } from '@/types'
import { QueryClient } from '@tanstack/react-query'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (data: AuthResponse) => void
  logout: () => void
  updateUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (data: AuthResponse) => {
        const user: User = {
          id: data.userId,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
        }
        set({
          user,
          token: data.token,
          isAuthenticated: true,
        })
        // Clear all cached queries after login
        const queryClient = new QueryClient()
        queryClient.clear()
      },
      
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
        const queryClient = new QueryClient()
        queryClient.clear()
      },
      
      updateUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)