import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { boardsApi } from '@/api/boards.api'
import { useBoardStore } from '@/store/boardStore'
import type { BoardColumn, Card, Priority } from '@/types'

export function useBoard(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const { setColumns, moveCard } = useBoardStore()

  // Fetch columns with cards
  const { data: columns, isLoading } = useQuery({
    queryKey: ['board', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const cols = await boardsApi.getColumns(projectId)
      const columnsWithCards = await Promise.all(
        cols.map(async (col: BoardColumn) => {
          const cards = await boardsApi.getCards(col.id)
          return { ...col, cards }
        })
      )
      setColumns(columnsWithCards)
      return columnsWithCards
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  })

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      boardsApi.createColumn(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column created')
    },
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BoardColumn> }) =>
      boardsApi.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column updated')
    },
    onError: (error: any) => {
      message.error('Failed to update column')
    },
  })
  
  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => boardsApi.deleteColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column deleted')
    },
    onError: (error: any) => {
      message.error('Failed to delete column')
    },
  })

  const updateColumn = (params: { id: string; data: Partial<BoardColumn> }) => {
    updateColumnMutation.mutate(params)
  }
  
  const deleteColumn = (columnId: string) => {
    deleteColumnMutation.mutate(columnId)
  }

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async (params: {
      columnId: string
      data: {
        title: string
        description?: string
        priority?: Priority
        dueDate?: string
      }
    }) => {
      console.log('createCardMutation called with:', params)
      return boardsApi.createCard(params.columnId, params.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card created successfully')
    },
    onError: (error: any) => {
      console.error('Failed to create card:', error)
      message.error('Failed to create card')
    },
  })

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Card> }) =>
      boardsApi.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card updated')
    },
  })

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => boardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card deleted')
    },
  })

  // Move card mutation
  const moveCardMutation = useMutation({
    mutationFn: ({
      cardId,
      columnId,
      position,
    }: {
      cardId: string
      columnId: string
      position: number
    }) => boardsApi.moveCard(cardId, columnId, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })

  // ✅ WRAP CÁC FUNCTIONS ĐỂ GIỮ CONTEXT
  const createCard = (params: {
    columnId: string
    data: {
      title: string
      description?: string
      priority?: Priority
      dueDate?: string
    }
  }) => {
    console.log('useBoard.createCard wrapper called with:', params)
    createCardMutation.mutate(params)
  }

  const updateCard = (params: { id: string; data: Partial<Card> }) => {
    updateCardMutation.mutate(params)
  }

  const deleteCard = (cardId: string) => {
    deleteCardMutation.mutate(cardId)
  }

  const handleMoveCard = (params: {
    cardId: string
    columnId: string
    position: number
  }) => {
    moveCardMutation.mutate(params)
  }

  return {
    columns: columns || [],
    isLoading,
    createColumn: (data: { name: string; color?: string }) => createColumnMutation.mutate(data),
    updateColumn, // TODO: implement
    deleteColumn, // TODO: implement
    createCard, // ✅ Dùng wrapped function
    updateCard, // ✅ Dùng wrapped function
    deleteCard, // ✅ Dùng wrapped function
    moveCard: handleMoveCard, // ✅ Dùng wrapped function
    isCreatingColumn: createColumnMutation.isPending,
    isCreatingCard: createCardMutation.isPending,
  }
}