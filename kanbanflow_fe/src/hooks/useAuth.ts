import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner" // ✅ Fix
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { login: setAuth, logout: clearAuth, isAuthenticated } = useAuthStore()

  const loginMutation = useMutation({
    mutationFn: (data: { username: string; password: string }) =>
      authApi.login(data.username, data.password),
    onSuccess: (data) => {
      setAuth(data)
      toast.success('Login successful')
      navigate('/')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed')
    },
  })

  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      setAuth(data)
      toast.success('Registration successful')
      navigate('/')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed')
    },
  })

  const logout = () => {
    clearAuth()
    queryClient.clear()
    navigate('/login')
    toast.info('Logged out successfully')
  }

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  })

  return {
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    currentUser,
    isLoading,
    isAuthenticated,
  }
}