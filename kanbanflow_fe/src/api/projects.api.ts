import apiClient from './client'
import type { Project, ProjectDetail, TeamMember } from '@/types'

export const projectsApi = {

  getUserProjectRole: async (projectId: string): Promise<string> => {
    const { data } = await apiClient.get(`/api/projects/${projectId}/my-role`)
    return data
  },
  
  getProjects: async (page = 0, size = 10) => {
    const { data } = await apiClient.get('/api/projects', {
      params: { page, size },
    })
    return data
  },
  
  getProject: async (projectId: string): Promise<ProjectDetail> => {
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
  
  // Team members
  getProjectMembers: async (projectId: string): Promise<TeamMember[]> => {
    const { data } = await apiClient.get(`/api/projects/${projectId}/members`)
    return data
  },
  
  addProjectMember: async (projectId: string, params: {
    email: string
    role: string
  }) => {
    const { data } = await apiClient.post(`/api/projects/${projectId}/members`, params)
    return data
  },
  
  updateMemberRole: async (projectId: string, userId: string, role: string) => {
    await apiClient.put(`/api/projects/${projectId}/members/${userId}`, { role })
  },
  
  removeMember: async (projectId: string, userId: string) => {
    await apiClient.delete(`/api/projects/${projectId}/members/${userId}`)
  },
  
  // Export
  exportProject: async (projectId: string, format: 'csv' | 'json') => {
    const endpoint = format === 'csv' 
      ? `/api/export/projects/${projectId}/csv`
      : `/api/export/projects/${projectId}/json`
    
    const { data } = await apiClient.get(endpoint, {
      responseType: format === 'csv' ? 'blob' : 'json',
    })
    return data
  },
  
  // Activities
  getProjectActivities: async (projectId: string, page = 0, size = 20) => {
    const { data } = await apiClient.get(`/api/projects/${projectId}/activities`, {
      params: { page, size },
    })
    return data
  },
}