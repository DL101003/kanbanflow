import { create } from 'zustand'
import type { Project, BoardColumn, Card } from '@/types'

interface BoardState {
  currentProject: Project | null
  columns: BoardColumn[]
  selectedCard: Card | null
  setProject: (project: Project) => void
  setColumns: (columns: BoardColumn[]) => void
  updateColumn: (columnId: string, updates: Partial<BoardColumn>) => void
  moveCard: (cardId: string, sourceColumnId: string, targetColumnId: string, position: number) => void
  setSelectedCard: (card: Card | null) => void
}

export const useBoardStore = create<BoardState>((set) => ({
  currentProject: null,
  columns: [],
  selectedCard: null,
  
  setProject: (project) => set({ currentProject: project }),
  
  setColumns: (columns) => set({ columns }),
  
  updateColumn: (columnId, updates) =>
    set((state) => ({
      columns: state.columns.map((col) =>
        col.id === columnId ? { ...col, ...updates } : col
      ),
    })),
  
  moveCard: (cardId, sourceColumnId, targetColumnId, position) =>
    set((state) => {
      const newColumns = [...state.columns]
      const sourceColumn = newColumns.find((col) => col.id === sourceColumnId)
      const targetColumn = newColumns.find((col) => col.id === targetColumnId)
      
      if (!sourceColumn || !targetColumn) return state
      
      const card = sourceColumn.cards?.find((c) => c.id === cardId)
      if (!card) return state
      
      // Remove from source
      sourceColumn.cards = sourceColumn.cards?.filter((c) => c.id !== cardId)
      
      // Add to target
      targetColumn.cards = targetColumn.cards || []
      targetColumn.cards.splice(position, 0, card)
      
      // Update positions
      sourceColumn.cards?.forEach((c, i) => (c.position = i))
      targetColumn.cards.forEach((c, i) => (c.position = i))
      
      return { columns: newColumns }
    }),
  
  setSelectedCard: (card) => set({ selectedCard: card }),
}))