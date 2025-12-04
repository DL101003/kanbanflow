import { useState, useEffect, useCallback, useMemo } from 'react'
import { Form, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { DragEndEvent } from '@dnd-kit/core'
import { projectsApi } from '@/api/projects.api'
import { useBoard } from '@/hooks/useBoard'
import { useBoardStore } from '@/store/boardStore'
import type { BoardColumn, Card as CardType } from '@/types'

export function useBoardLogic(projectId: string | undefined) {
  const navigate = useNavigate()
  
  // 1. Local States
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
  const [userRole, setUserRole] = useState<string>('VIEWER')
  const [loadingRole, setLoadingRole] = useState(true)
  const [createCardModal, setCreateCardModal] = useState<{
    open: boolean
    columnId: string | null
  }>({ open: false, columnId: null })
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<{ priority?: string; completed?: boolean }>({})

  // 2. Forms
  const [columnForm] = Form.useForm()
  const [editColumnForm] = Form.useForm()

  // 3. Store Actions
  const { selectedCard, setSelectedCard } = useBoardStore()

  // 4. Queries & Custom Hooks
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
  })

  // Lấy logic CRUD từ useBoard cũ
  const boardOperations = useBoard(projectId)

  // 5. Permission Logic
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

  // 6. Handlers
  const handleCreateColumn = (values: any) => {
    boardOperations.createColumn({
      name: values.name,
      color: values.color || '#3B82F6',
    })
    setIsColumnModalOpen(false)
    columnForm.resetFields()
  }

  const handleUpdateColumn = (values: any) => {
    if (editingColumn) {
      boardOperations.updateColumn({
        id: editingColumn.id,
        data: values,
      })
      setEditingColumn(null)
      editColumnForm.resetFields()
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Tìm cột nguồn và cột đích dựa trên ID
    let targetColumn = boardOperations.columns.find((col) => col.id === overId)
    
    // Nếu over vào một card, tìm cột chứa card đó
    if (!targetColumn) {
      targetColumn = boardOperations.columns.find((col) => 
        col.cards?.some((c) => c.id === overId)
      )
    }

    if (!targetColumn) return

    // Tính toán position mới
    let position = 0
    if (targetColumn.cards && targetColumn.cards.length > 0) {
      const overCardIndex = targetColumn.cards.findIndex((c) => c.id === overId)
      // Nếu drop lên card, lấy index đó. Nếu drop vào cột trống hoặc cuối, lấy length
      position = overCardIndex >= 0 ? overCardIndex : targetColumn.cards.length
    }

    boardOperations.moveCard({
      cardId: activeId,
      columnId: targetColumn.id,
      position,
    })

    setActiveCard(null)
  }

  const filteredColumns = boardOperations.columns.map(col => ({
    ...col,
    cards: col.cards?.filter(card => {
      const matchQuery = !searchQuery || 
        card.title.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchPriority = !filters.priority || card.priority === filters.priority
      
      const matchStatus = filters.completed === undefined || card.completed === filters.completed

      return matchQuery && matchPriority && matchStatus
    })
  }))

  const handleSearch = useCallback((query: string, newFilters: any) => {
    // Chỉ update nếu giá trị thực sự thay đổi để tránh render thừa
    setSearchQuery(prev => prev === query ? prev : query)
    setFilters(prev => JSON.stringify(prev) === JSON.stringify(newFilters) ? prev : newFilters)
  }, [])

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await projectsApi.exportProject(projectId!, format)
      // ... logic download blob giữ nguyên ...
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
      message.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      message.error('Export failed')
    }
  }

  const stats = (() => {
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
  })()

  const handlers = useMemo(() => ({
    handleCreateColumn,
    handleUpdateColumn,
    handleDragEnd,
    handleExport,
    handleSearch, // Hàm đã được useCallback
    navigateToTeam: () => navigate(`/projects/${projectId}/team`),
    openEditColumnModal: (col: BoardColumn) => {
      setEditingColumn(col)
      editColumnForm.setFieldsValue({
        name: col.name,
        color: col.color,
        cardLimit: col.cardLimit
      })
    }
  }), [projectId, project, boardOperations.columns])

  // 7. Return everything UI needs
  return {
    // Data
    project,
    columns: filteredColumns,
    isLoading: boardOperations.isLoading || loadingRole,
    permissions,
    stats,
    
    // States
    activeCard,
    setActiveCard,
    showStats, 
    setShowStats,
    isColumnModalOpen, 
    setIsColumnModalOpen,
    editingColumn, 
    setEditingColumn, // Cần expose cái này để mở modal edit
    createCardModal, 
    setCreateCardModal,
    selectedCard, 
    setSelectedCard,

    // Forms
    columnForm,
    editColumnForm,

    // Methods from useBoard (renamed for clarity)
    deleteColumn: boardOperations.deleteColumn,
    createCard: boardOperations.createCard,
    updateCard: boardOperations.updateCard,
    deleteCard: boardOperations.deleteCard,
    
    
    // UI Handlers
    handlers
  }
}