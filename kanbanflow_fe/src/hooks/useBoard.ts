import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from "sonner" // ✅ Fix
import { boardsApi } from '@/api/boards.api'
import { useBoardStore } from '@/store/boardStore'
import type { BoardColumn, Card, Priority } from '@/types'

export function useBoard(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const { setColumns } = useBoardStore()

  // Fetch columns with cards
  const { data: columns, isLoading } = useQuery({
    queryKey: ['board', projectId],
    queryFn: async () => {
      if (!projectId) return []
      const columnsWithCards = await boardsApi.getColumns(projectId)
      setColumns(columnsWithCards)
      return columnsWithCards
    },
    enabled: !!projectId,
    staleTime: 30 * 1000,
  })

  // Create column mutation
  const createColumnMutation = useMutation({
    mutationFn: (data: { name: string; color?: string; cardLimit?: number }) =>
      boardsApi.createColumn(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Column created successfully')
    },
    onError: (error: any) => {
      console.error('Create column error:', error)
      toast.error('Failed to create column')
    },
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BoardColumn> }) =>
      boardsApi.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Column updated')
    },
    onError: () => {
      toast.error('Failed to update column')
    },
  })

  // Delete column mutation
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => boardsApi.deleteColumn(columnId),
    onSuccess: () => {
      // Force refetch
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Column deleted successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to delete column')
      console.error('Delete column error:', error)
    },
  })

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
      return boardsApi.createCard(params.columnId, params.data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Card created successfully')
    },
    onError: (error: any) => {
      console.error('Failed to create card:', error)
      toast.error('Failed to create card')
    },
  })

  // Update card mutation
  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Card> }) =>
      boardsApi.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Card updated')
    },
  })

  // Delete card mutation
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => boardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      toast.success('Card deleted successfully')
    },
    onError: (error: any) => {
      console.error('Delete card error:', error)
      toast.error('Failed to delete card')
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

    onMutate: async (newMove) => {
      await queryClient.cancelQueries({ queryKey: ['board', projectId] })
      const previousBoard = queryClient.getQueryData<BoardColumn[]>(['board', projectId])

      queryClient.setQueryData<BoardColumn[]>(['board', projectId], (oldColumns) => {
        if (!oldColumns) return []
        const newColumns = JSON.parse(JSON.stringify(oldColumns)) as BoardColumn[]
        
        // Optimistic update logic (giữ nguyên logic tính toán của bạn)
        let sourceColumn: BoardColumn | undefined
        let cardToMove: any

        for (const col of newColumns) {
          const cardIndex = col.cards?.findIndex(c => c.id === newMove.cardId)
          if (cardIndex !== undefined && cardIndex !== -1) {
            sourceColumn = col
            cardToMove = col.cards?.splice(cardIndex, 1)[0]
            break
          }
        }

        const targetColumn = newColumns.find(col => col.id === newMove.columnId)
        
        if (targetColumn && cardToMove) {
          cardToMove.columnId = targetColumn.id
          if (!targetColumn.cards) targetColumn.cards = []
          targetColumn.cards.splice(newMove.position, 0, cardToMove)
        }

        return newColumns
      })

      return { previousBoard }
    },

    onError: (err, newMove, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', projectId], context.previousBoard)
      }
      toast.error('Failed to move card')
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })

  return {
    columns: columns || [],
    isLoading,
    createColumn: (data: { name: string; color?: string }) => createColumnMutation.mutate(data),
    updateColumn: (params: { id: string; data: Partial<BoardColumn> }) =>
      updateColumnMutation.mutate(params),
    deleteColumn: (columnId: string) => deleteColumnMutation.mutate(columnId),
    createCard: (params: any) => createCardMutation.mutate(params),
    updateCard: (params: any) => updateCardMutation.mutate(params),
    deleteCard: (cardId: string) => deleteCardMutation.mutate(cardId),
    moveCard: (params: any) => moveCardMutation.mutate(params),
    isCreatingColumn: createColumnMutation.isPending,
    isCreatingCard: createCardMutation.isPending,
  }
}