import axios from 'axios'
import { toast } from "sonner"
import { useAuthStore } from '@/store/authStore'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message)
    } else if (error.response?.status === 500) {
      console.error('Server error:', error)
      toast.error('Internal Server Error')
    }
    return Promise.reject(error)
  }
)

export default apiClient