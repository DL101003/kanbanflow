import apiClient from './client'
import type { Project } from '@/types'

export const projectsApi = {
  getProjects: async (page = 0, size = 10) => {
    const { data } = await apiClient.get('/api/projects', {
      params: { page, size },
    })
    return data
  },
  
  getProject: async (projectId: string) => {
    const { data } = await apiClient.get(`/api/projects/${projectId}`)
    return data
  },
  
  createProject: async (params: {
    name: string
    description?: string
    color?: string
  }): Promise<Project> => {
    const { data } = await apiClient.post('/api/projects', params)
    return data
  },
  
  updateProject: async (projectId: string, params: Partial<Project>) => {
    const { data } = await apiClient.put(`/api/projects/${projectId}`, params)
    return data
  },
  
  deleteProject: async (projectId: string) => {
    await apiClient.delete(`/api/projects/${projectId}`)
  },
  
  toggleFavorite: async (projectId: string) => {
    await apiClient.post(`/api/projects/${projectId}/favorite`)
  },
}