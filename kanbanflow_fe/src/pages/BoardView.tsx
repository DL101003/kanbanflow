import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Spin, Button, Modal, Form, Input, message } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { DndContext, type DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Board from '@/components/board/Board'
import Card from '@/components/board/Card'
import CardModal from '@/components/board/CardModal'
import { projectsApi } from '@/api/projects.api'
import { boardsApi } from '@/api/boards.api'
import { useBoardStore } from '@/store/boardStore'
import type { BoardColumn, Card as CardType } from '@/types'

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false)
  const [form] = Form.useForm()
  
  const { 
    currentProject, 
    columns, 
    selectedCard,
    setProject, 
    setColumns,
    moveCard,
    setSelectedCard 
  } = useBoardStore()

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
  })

  const { data: columnsData, isLoading: columnsLoading } = useQuery({
    queryKey: ['columns', projectId],
    queryFn: async () => {
      const cols = await boardsApi.getColumns(projectId!)
      // Load cards for each column
      const columnsWithCards = await Promise.all(
        cols.map(async (col: BoardColumn) => {
          const cards = await boardsApi.getCards(col.id)
          return { ...col, cards }
        })
      )
      return columnsWithCards
    },
    enabled: !!projectId,
  })

  const createColumnMutation = useMutation({
    mutationFn: (params: { name: string; color?: string }) =>
      boardsApi.createColumn(projectId!, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
      message.success('Column created')
      setIsColumnModalOpen(false)
      form.resetFields()
    },
  })

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
      queryClient.invalidateQueries({ queryKey: ['columns', projectId] })
    },
  })

  useEffect(() => {
    if (project) setProject(project)
  }, [project])

  useEffect(() => {
    if (columnsData) setColumns(columnsData)
  }, [columnsData])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find card and columns
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

    // Determine target column
    targetColumn = columns.find((col) => col.id === overId)
    if (!targetColumn) {
      // Check if dropped on a card
      for (const column of columns) {
        if (column.cards?.some((c) => c.id === overId)) {
          targetColumn = column
          break
        }
      }
    }

    if (!sourceColumn || !targetColumn || !draggedCard) return

    // Calculate position
    let position = 0
    if (targetColumn.cards && targetColumn.cards.length > 0) {
      const overCardIndex = targetColumn.cards.findIndex((c) => c.id === overId)
      position = overCardIndex >= 0 ? overCardIndex : targetColumn.cards.length
    }

    // Optimistic update
    moveCard(activeId, sourceColumn.id, targetColumn.id, position)

    // Server update
    moveCardMutation.mutate({
      cardId: activeId,
      columnId: targetColumn.id,
      position,
    })

    setActiveCard(null)
  }

  const handleDragStart = (event: DragEndEvent) => {
    const { active } = event
    const cardId = active.id as string

    for (const column of columns) {
      const card = column.cards?.find((c) => c.id === cardId)
      if (card) {
        setActiveCard(card)
        break
      }
    }
  }

  if (projectLoading || columnsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  const columnIds = columns.map((col) => col.id)

  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">{currentProject?.name}</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsColumnModalOpen(true)}
        >
          Add Column
        </Button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          <Board columns={columns} />
        </SortableContext>

        <DragOverlay>
          {activeCard && <Card card={activeCard} isDragging />}
        </DragOverlay>
      </DndContext>

      {selectedCard && (
        <CardModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      <Modal
        title="Create New Column"
        open={isColumnModalOpen}
        onCancel={() => setIsColumnModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={createColumnMutation.mutate}
        >
          <Form.Item
            name="name"
            label="Column Name"
            rules={[{ required: true, message: 'Please enter column name' }]}
          >
            <Input placeholder="Enter column name" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color (Hex)"
          >
            <Input placeholder="#3B82F6" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={createColumnMutation.isPending}
              block
            >
              Create Column
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}