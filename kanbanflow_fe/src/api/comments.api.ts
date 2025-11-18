import apiClient from './client'
import type { Comment } from '@/types'

export const commentsApi = {
  getCardComments: async (cardId: string, page = 0, size = 20) => {
    const { data } = await apiClient.get(`/api/cards/${cardId}/comments`, {
      params: { page, size },
    })
    return data
  },
  
  addComment: async (cardId: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.post(`/api/cards/${cardId}/comments`, { content })
    return data
  },
  
  updateComment: async (commentId: string, content: string): Promise<Comment> => {
    const { data } = await apiClient.put(`/api/comments/${commentId}`, { content })
    return data
  },
  
  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/api/comments/${commentId}`)
  },
}