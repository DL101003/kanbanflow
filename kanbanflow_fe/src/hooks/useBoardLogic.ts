import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from "sonner"
import { projectsApi } from '@/api/projects.api'
import { useBoard } from '@/hooks/useBoard'
import { useBoardStore } from '@/store/boardStore'
import { useKanbanDrag } from './useKanbanDrag'
import type { BoardColumn, Card as CardType } from '@/types'

export function useBoardLogic(projectId: string | undefined) {
  const navigate = useNavigate()
  
  // 1. Local States
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [showStats, setShowStats] = useState(false)
  
  // Modal States
  const [isCreateColumnOpen, setIsCreateColumnOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
  const [createCardModal, setCreateCardModal] = useState<{
    open: boolean
    columnId: string | null
  }>({ open: false, columnId: null })

  // User Role State
  const [userRole, setUserRole] = useState<string>('VIEWER')
  const [loadingRole, setLoadingRole] = useState(true)

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{ priority?: string; completed?: boolean }>({})

  // 2. Store Actions
  const { selectedCard, setSelectedCard } = useBoardStore()

  // 3. Queries & Custom Hooks
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
  })

  // Lấy logic CRUD từ useBoard (đã refactor ở bước trước)
  const boardOperations = useBoard(projectId)

  // 4. Permission Logic
  useEffect(() => {
    if (projectId) {
      setLoadingRole(true)
      projectsApi.getUserProjectRole(projectId)
        .then(setUserRole)
        .catch(() => setUserRole('VIEWER'))
        .finally(() => setLoadingRole(false))
    }
  }, [projectId])

  const permissions = {
    canEdit: ['OWNER', 'ADMIN', 'EDITOR'].includes(userRole),
    canManageMembers: ['OWNER', 'ADMIN'].includes(userRole),
    canDeleteProject: userRole === 'OWNER',
    roleLabel: userRole
  }

  // 5. Drag & Drop Hook
  const { 
    sensors, 
    activeId, 
    activeData,
    handleDragStart, 
    handleDragOver, 
    handleDragEnd 
  } = useKanbanDrag({
    columns: boardOperations.columns,
    setColumns: boardOperations.setColumns, // Make sure useBoard exports this or expose from store
    onMoveCard: boardOperations.moveCard,
    onMoveColumn: boardOperations.moveColumn
  })

  // 6. Handlers
  const handleCreateColumn = (values: { name: string; color?: string; cardLimit?: number }) => {
    boardOperations.createColumn(values)
    setIsCreateColumnOpen(false)
  }

  const handleUpdateColumn = (id: string, values: Partial<BoardColumn>) => {
    boardOperations.updateColumn({ id, data: values })
    setEditingColumn(null)
  }

  // Filter Logic
  const filteredColumns = useMemo(() => {
    return boardOperations.columns.map(col => ({
      ...col,
      cards: col.cards?.filter(card => {
        const matchQuery = !searchQuery || 
          card.title.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchPriority = !filters.priority || card.priority === filters.priority
        
        const matchStatus = filters.completed === undefined || card.completed === filters.completed

        return matchQuery && matchPriority && matchStatus
      })
    }))
  }, [boardOperations.columns, searchQuery, filters])

  const handleSearch = useCallback((query: string, newFilters: any) => {
    setSearchQuery(query)
    setFilters(newFilters)
  }, [])

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await projectsApi.exportProject(projectId!, format)
      const blob = new Blob(
        [format === 'csv' ? data : JSON.stringify(data, null, 2)],
        { type: format === 'csv' ? 'text/csv' : 'application/json' }
      )
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${project?.name || 'project'}-export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  // Stats Calculation
  const stats = useMemo(() => {
    let totalCards = 0
    let completedCards = 0
    let overdueCards = 0
    boardOperations.columns.forEach((column) => {
      const cards = column.cards || []
      totalCards += cards.length
      completedCards += cards.filter((c) => c.completed).length
      overdueCards += cards.filter((c) => c.overdue).length
    })
    return { totalCards, completedCards, overdueCards, totalColumns: boardOperations.columns.length }
  }, [boardOperations.columns])

  return {
    // Data
    project,
    columns: filteredColumns, // Return filtered columns for rendering
    isLoading: boardOperations.isLoading || loadingRole,
    permissions,
    stats,
    
    // States
    activeCard,
    setActiveCard,
    showStats, 
    setShowStats,
    
    // Modal Control States
    isCreateColumnOpen, 
    setIsCreateColumnOpen,
    editingColumn, 
    setEditingColumn,
    createCardModal, 
    setCreateCardModal,
    selectedCard, 
    setSelectedCard,

    // Methods
    deleteColumn: boardOperations.deleteColumn,
    createCard: boardOperations.createCard,
    updateCard: boardOperations.updateCard,
    deleteCard: boardOperations.deleteCard,
    
    // Handlers Wrapper
    handlers: {
      handleCreateColumn,
      handleUpdateColumn,
      handleDragEnd,
      handleExport,
      handleSearch,
      navigateToTeam: () => navigate(`/projects/${projectId}/team`),
    },

    // DnD Props
    dragSensors: sensors,
    activeDragId: activeId,
    activeDragData: activeData,
    onDragStart: handleDragStart,
    onDragOver: handleDragOver,
    onDragEnd: handleDragEnd
  }
}