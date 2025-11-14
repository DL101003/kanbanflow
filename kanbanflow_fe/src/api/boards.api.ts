import apiClient from './client'
import type { BoardColumn, Card } from '@/types'

export const boardsApi = {
  getColumns: async (projectId: string): Promise<BoardColumn[]> => {
    const { data } = await apiClient.get(`/api/projects/${projectId}/columns`)
    return data
  },
  
  createColumn: async (projectId: string, params: {
    name: string
    color?: string
  }): Promise<BoardColumn> => {
    const { data } = await apiClient.post(`/api/projects/${projectId}/columns`, params)
    return data
  },
  
  updateColumn: async (columnId: string, params: Partial<BoardColumn>) => {
    const { data } = await apiClient.put(`/api/columns/${columnId}`, params)
    return data
  },
  
  deleteColumn: async (columnId: string) => {
    await apiClient.delete(`/api/columns/${columnId}`)
  },
  
  moveColumn: async (columnId: string, position: number) => {
    await apiClient.put(`/api/columns/${columnId}/move`, { position })
  },
  
  getCards: async (columnId: string): Promise<Card[]> => {
    const { data } = await apiClient.get(`/api/columns/${columnId}/cards`)
    return data
  },
  
  createCard: async (columnId: string, params: {
    title: string
    description?: string
    priority?: string
    dueDate?: string
  }): Promise<Card> => {
    const { data } = await apiClient.post(`/api/columns/${columnId}/cards`, params)
    return data
  },
  
  updateCard: async (cardId: string, params: Partial<Card>) => {
    const { data } = await apiClient.put(`/api/cards/${cardId}`, params)
    return data
  },
  
  deleteCard: async (cardId: string) => {
    await apiClient.delete(`/api/cards/${cardId}`)
  },
  
  moveCard: async (cardId: string, columnId: string, position: number) => {
    const { data } = await apiClient.put(`/api/cards/${cardId}/move`, {
      columnId,
      position,
    })
    return data
  },
}