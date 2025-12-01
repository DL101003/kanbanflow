import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Modal, Form, Input, InputNumber, Space, message, Spin, Tag } from 'antd'
import {
  PlusOutlined,
  TeamOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { DndContext, type DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Board from '@/components/board/Board'
import Card from '@/components/board/Card'
import CardModal from '@/components/board/CardModal'
import CreateCardModal from '@/components/board/CreateCardModal'
import ProjectStats from '@/components/stats/ProjectStats'
import { useBoard } from '@/hooks/useBoard'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects.api'
import { useBoardStore } from '@/store/boardStore'
import type { Card as CardType, BoardColumn } from '@/types'

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  // States
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

  // Forms
  const [columnForm] = Form.useForm()
  const [editColumnForm] = Form.useForm()

  // Store
  const { selectedCard, setSelectedCard } = useBoardStore()

  // Queries
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
  })

  useEffect(() => {
    if (projectId) {
      setLoadingRole(true)
      projectsApi.getUserProjectRole(projectId)
        .then(role => {
          console.log('User role in project:', role)
          setUserRole(role)
        })
        .catch(error => {
          console.error('Failed to fetch user role:', error)
          setUserRole('VIEWER') // Default to viewer on error
        })
        .finally(() => {
          setLoadingRole(false)
        })
    }
  }, [projectId])

  const canEdit = userRole === 'OWNER' || userRole === 'ADMIN' || userRole === 'EDITOR'
  const canManageMembers = userRole === 'OWNER' || userRole === 'ADMIN'
  const canDeleteProject = userRole === 'OWNER'

  const {
    columns,
    isLoading,
    createColumn,
    updateColumn,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    moveCard,
  } = useBoard(projectId)

  // Handlers
  const handleCreateColumn = (values: any) => {
    createColumn({
      name: values.name,
      color: values.color || '#3B82F6',
    })
    setIsColumnModalOpen(false)
    columnForm.resetFields()
  }

  const handleEditColumn = (column: BoardColumn) => {
    setEditingColumn(column)
    editColumnForm.setFieldsValue({
      name: column.name,
      color: column.color,
      cardLimit: column.cardLimit,
    })
  }

  const handleUpdateColumn = (values: any) => {
    if (editingColumn) {
      updateColumn({
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

    let sourceColumn: BoardColumn | undefined
    let targetColumn: BoardColumn | undefined
    let draggedCard: CardType | undefined

    for (const column of columns) {
      const card = column.cards?.find((c) => c.id === activeId)
      if (card) {
        sourceColumn = column
        draggedCard = card
        break
      }
    }

    targetColumn = columns.find((col) => col.id === overId)
    if (!targetColumn) {
      for (const column of columns) {
        if (column.cards?.some((c) => c.id === overId)) {
          targetColumn = column
          break
        }
      }
    }

    if (!sourceColumn || !targetColumn || !draggedCard) return

    let position = 0
    if (targetColumn.cards && targetColumn.cards.length > 0) {
      const overCardIndex = targetColumn.cards.findIndex((c) => c.id === overId)
      position = overCardIndex >= 0 ? overCardIndex : targetColumn.cards.length
    }

    moveCard({
      cardId: activeId,
      columnId: targetColumn.id,
      position,
    })

    setActiveCard(null)
  }

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
      message.success(`Exported as ${format.toUpperCase()}`)
    } catch (error) {
      message.error('Export failed')
    }
  }

  const calculateStats = () => {
    let totalCards = 0
    let completedCards = 0
    let overdueCards = 0

    columns.forEach((column) => {
      const cards = column.cards || []
      totalCards += cards.length
      completedCards += cards.filter((c) => c.completed).length
      overdueCards += cards.filter((c) => c.overdue).length
    })

    return {
      totalCards,
      completedCards,
      overdueCards,
      totalColumns: columns.length,
    }
  }

  if (isLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Loading board..." />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <Tag color={
            userRole === 'OWNER' ? 'red' :
            userRole === 'ADMIN' ? 'orange' :
            userRole === 'EDITOR' ? 'blue' : 'green'
          }>
            {userRole}
          </Tag>
        </div>
        
        <Space>
          <Button
            icon={<DownloadOutlined />}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          
          {canManageMembers && (
            <Button
              icon={<TeamOutlined />}
              onClick={() => navigate(`/projects/${projectId}/team`)}
            >
              Team Members
            </Button>
          )}
          
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setShowStats(!showStats)}
          >
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>
          
          {canEdit && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsColumnModalOpen(true)}
            >
              Add Column
            </Button>
          )}
        </Space>
      </div>
      
      {/* Stats */}
      {showStats && <ProjectStats {...calculateStats()} />}
      
      {/* Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={canEdit ? handleDragEnd : undefined}
          onDragStart={canEdit ? (event) => {
            const cardId = event.active.id as string
            for (const column of columns) {
              const card = column.cards?.find((c) => c.id === cardId)
              if (card) {
                setActiveCard(card)
                break
              }
            }
          } : undefined}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            <Board
              columns={columns}
              canEdit={canEdit}
              onEditColumn={canEdit ? handleEditColumn : undefined}
              onCreateCard={canEdit ? (columnId) => {
                setCreateCardModal({ open: true, columnId })
              } : undefined}
            />
          </SortableContext>
          
          <DragOverlay>
            {activeCard && <Card card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Card Detail Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (data) => {
            // Wait for update to complete
            await new Promise((resolve) => {
              updateCard({ id: selectedCard.id, data })
              setTimeout(resolve, 100)
            })
            // Modal will auto-close from CardModal component
          }}
          onDelete={async () => {
            // Delete card
            deleteCard(selectedCard.id)
            setSelectedCard(null)
          }}
        />
      )}


      {/* Create Card Modal */}
      {createCardModal.columnId && (
        <CreateCardModal
          open={createCardModal.open}
          columnId={createCardModal.columnId}
          onClose={() => setCreateCardModal({ open: false, columnId: null })}
          onCreate={(params) => {
            createCard(params)
            setCreateCardModal({ open: false, columnId: null }) // Auto close
          }}
        />
      )}

      {/* Create Column Modal */}
      <Modal
        title="Create New Column"
        open={isColumnModalOpen}
        onCancel={() => setIsColumnModalOpen(false)}
        footer={null}
      >
        <Form form={columnForm} layout="vertical" onFinish={handleCreateColumn}>
          <Form.Item
            name="name"
            label="Column Name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter column name" />
          </Form.Item>

          <Form.Item name="color" label="Color">
            <Input placeholder="#3B82F6" maxLength={7} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Create Column
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Column Modal */}
      <Modal
        title="Edit Column"
        open={!!editingColumn}
        onCancel={() => setEditingColumn(null)}
        footer={null}
      >
        <Form form={editColumnForm} layout="vertical" onFinish={handleUpdateColumn}>
          <Form.Item
            name="name"
            label="Column Name"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="color" label="Color">
            <Input placeholder="#3B82F6" maxLength={7} />
          </Form.Item>

          <Form.Item name="cardLimit" label="Card Limit">
            <InputNumber min={1} max={50} className="w-full" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Update Column
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      {/* {canEdit && (
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsColumnModalOpen(true)}
        >
          Add Column
        </Button>
      )} */}
      
      {/* Pass canEdit to components */}
      {/* <Board
        columns={columns}
        canEdit={canEdit}
        onEditColumn={handleEditColumn}
        onCreateCard={(columnId) => {
          if (!canEdit) {
            message.warning('You don\'t have permission to create cards')
            return
          }
          setCreateCardModal({ open: true, columnId })
        }}
      /> */}
    </div>
  )
}