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

  // Create column
  const createColumnMutation = useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      boardsApi.createColumn(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column created')
    },
  })

  // Update column
  const updateColumnMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BoardColumn> }) =>
      boardsApi.updateColumn(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column updated')
    },
  })

  // Delete column
  const deleteColumnMutation = useMutation({
    mutationFn: (columnId: string) => boardsApi.deleteColumn(columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column deleted')
    },
  })

  // Create card
  const createCardMutation = useMutation({
    mutationFn: ({
      columnId,
      data,
    }: {
      columnId: string
      data: {
        title: string
        description?: string
        priority?: Priority
        dueDate?: string
      }
    }) => boardsApi.createCard(columnId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card created')
    },
  })

  // Update card
  const updateCardMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Card> }) =>
      boardsApi.updateCard(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card updated')
    },
  })

  // Delete card
  const deleteCardMutation = useMutation({
    mutationFn: (cardId: string) => boardsApi.deleteCard(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Card deleted')
    },
  })

  // Move card
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
    onMutate: async ({ cardId, columnId, position }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['board', projectId] })
      
      const previousColumns = queryClient.getQueryData<BoardColumn[]>(['board', projectId])
      
      if (previousColumns) {
        // Find source column and card
        let sourceColumn: BoardColumn | undefined
        let card: Card | undefined
        
        for (const col of previousColumns) {
          const foundCard = col.cards?.find(c => c.id === cardId)
          if (foundCard) {
            sourceColumn = col
            card = foundCard
            break
          }
        }
        
        if (sourceColumn && card) {
          // Update local state optimistically
          moveCard(cardId, sourceColumn.id, columnId, position)
        }
      }
      
      return { previousColumns }
    },
    onError: (err, variables, context) => {
      // Revert on error
      if (context?.previousColumns) {
        queryClient.setQueryData(['board', projectId], context.previousColumns)
      }
      message.error('Failed to move card')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })

  return {
    columns: columns || [],
    isLoading,
    createColumn: createColumnMutation.mutate,
    updateColumn: updateColumnMutation.mutate,
    deleteColumn: deleteColumnMutation.mutate,
    createCard: createCardMutation.mutate,
    updateCard: updateCardMutation.mutate,
    deleteCard: deleteCardMutation.mutate,
    moveCard: moveCardMutation.mutate,
    isCreatingColumn: createColumnMutation.isPending,
    isCreatingCard: createCardMutation.isPending,
  }
}