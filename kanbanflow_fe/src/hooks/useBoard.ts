import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { boardsApi } from '@/api/boards.api'
import { useBoardStore } from '@/store/boardStore'
import type { BoardColumn, Card, Priority } from '@/types'

export function useBoard(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const { setColumns, moveCard: moveCardLocal } = useBoardStore()

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
      message.success('Column created successfully')
    },
    onError: (error: any) => {
      console.error('Create column error:', error)
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
    // Force refetch with no cache
    queryClient.invalidateQueries({ 
      queryKey: ['board', projectId],
      exact: true,
      refetchType: 'all' 
    })
    
    // Also refetch immediately
    queryClient.refetchQueries({ 
      queryKey: ['board', projectId],
      type: 'active'
    })
    
    message.success('Column deleted successfully')
  },
  onError: (error: any) => {
    message.error('Failed to delete column')
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
      message.success('Card deleted successfully', 2) // Duration 2s
    },
    onError: (error: any) => {
      console.error('Delete card error:', error)
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
      // 1. Hủy các query đang chạy để tránh conflict dữ liệu cũ đè lên mới
      await queryClient.cancelQueries({ queryKey: ['board', projectId] })

      // 2. Snapshot (lưu lại) dữ liệu hiện tại để rollback nếu lỗi
      const previousBoard = queryClient.getQueryData<BoardColumn[]>(['board', projectId])

      // 3. Cập nhật cache React Query một cách thủ công (Optimistic Update)
      queryClient.setQueryData<BoardColumn[]>(['board', projectId], (oldColumns) => {
        if (!oldColumns) return []

        // Clone mảng để đảm bảo tính bất biến (immutability)
        const newColumns = JSON.parse(JSON.stringify(oldColumns)) as BoardColumn[]

        // Tìm cột nguồn và cột đích
        let sourceColumn: BoardColumn | undefined
        let cardToMove: any

        // Bước 3.1: Tìm và xóa card khỏi cột cũ
        for (const col of newColumns) {
          const cardIndex = col.cards?.findIndex(c => c.id === newMove.cardId)
          if (cardIndex !== undefined && cardIndex !== -1) {
            sourceColumn = col
            // Cắt card ra khỏi mảng cards
            cardToMove = col.cards?.splice(cardIndex, 1)[0]
            break
          }
        }

        // Bước 3.2: Thêm card vào cột mới
        const targetColumn = newColumns.find(col => col.id === newMove.columnId)
        
        if (targetColumn && cardToMove) {
          // Cập nhật columnId mới cho card (để UI hiển thị đúng nếu cần)
          cardToMove.columnId = targetColumn.id // Lưu ý: check lại type Card của bạn
          
          if (!targetColumn.cards) targetColumn.cards = []
          // Chèn card vào vị trí mới (index = position)
          targetColumn.cards.splice(newMove.position, 0, cardToMove)
        }

        return newColumns
      })

      // Trả về context chứa snapshot cũ để dùng cho onError
      return { previousBoard }
    },

    // ✅ Nếu API lỗi, trả lại dữ liệu cũ ngay lập tức
    onError: (err, newMove, context) => {
      if (context?.previousBoard) {
        queryClient.setQueryData(['board', projectId], context.previousBoard)
      }
      message.error('Failed to move card')
    },

    // ✅ Dù thành công hay thất bại, fetch lại dữ liệu mới nhất từ server để đảm bảo tính đồng bộ
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
    },
  })

  const createCard = (params: {
    columnId: string
    data: {
      title: string
      description?: string
      priority?: Priority
      dueDate?: string
    }
  }) => {
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
    updateColumn: (params: { id: string; data: Partial<BoardColumn> }) =>
      updateColumnMutation.mutate(params),
    deleteColumn: (columnId: string) => deleteColumnMutation.mutate(columnId),
    createCard,
    updateCard,
    deleteCard,
    moveCard: handleMoveCard,
    isCreatingColumn: createColumnMutation.isPending,
    isCreatingCard: createCardMutation.isPending,
  }
}