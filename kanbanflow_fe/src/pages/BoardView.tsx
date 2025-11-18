import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Dropdown, Space, Empty } from 'antd'
import {
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import { DndContext, type DragEndEvent, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import Board from '@/components/board/Board'
import Card from '@/components/board/Card'
import CardModal from '@/components/board/CardModal'
import CreateCardModal from '@/components/board/CreateCardModal'
import EditColumnModal from '@/components/board/EditColumnModal'
import SearchBar from '@/components/board/SearchBar'
import ProjectStats from '@/components/stats/ProjectStats'
import PageHeader from '@/components/common/PageHeader'
import Loading from '@/components/common/Loading'
import { useBoard } from '@/hooks/useBoard'
import { useQuery } from '@tanstack/react-query'
import { projectsApi } from '@/api/projects.api'
import { useBoardStore } from '@/store/boardStore'
import type { Card as CardType, BoardColumn } from '@/types'

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [activeCard, setActiveCard] = useState<CardType | null>(null)
  const [createCardModal, setCreateCardModal] = useState<{
    open: boolean
    columnId: string
  }>({ open: false, columnId: '' })
  const [editColumnModal, setEditColumnModal] = useState<{
    open: boolean
    column: BoardColumn | null
  }>({ open: false, column: null })
  const [showStats, setShowStats] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({})

  const { selectedCard, setSelectedCard } = useBoardStore()

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => projectsApi.getProject(projectId!),
    enabled: !!projectId,
  })

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

  if (!projectId) {
    navigate('/')
    return null
  }

  if (isLoading) {
    return <Loading fullScreen tip="Loading board..." />
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

  const handleSearch = (query: string, filters: any) => {
    setSearchQuery(query)
    setSearchFilters(filters)
  }

  const getFilteredColumns = () => {
    if (!searchQuery && Object.keys(searchFilters).length === 0) {
      return columns
    }

    return columns.map((column) => ({
      ...column,
      cards: column.cards?.filter((card) => {
        const matchesQuery =
          !searchQuery ||
          card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesPriority =
          !searchFilters.priority || card.priority === searchFilters.priority

        const matchesStatus =
          searchFilters.completed === undefined ||
          card.completed === searchFilters.completed

        return matchesQuery && matchesPriority && matchesStatus
      }),
    }))
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

  const stats = calculateStats()
  const filteredColumns = getFilteredColumns()

  const actions = (
    <Space>
      <Button
        icon={<BarChartOutlined />}
        onClick={() => setShowStats(!showStats)}
      >
        {showStats ? 'Hide Stats' : 'Show Stats'}
      </Button>
      <Button icon={<TeamOutlined />}>Team</Button>
      <Dropdown
        menu={{
          items: [
            {
              key: 'settings',
              icon: <SettingOutlined />,
              label: 'Project Settings',
            },
          ],
        }}
      >
        <Button icon={<SettingOutlined />}>Settings</Button>
      </Dropdown>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={() =>
          createColumn({
            name: `New Column ${columns.length + 1}`,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
          })
        }
      >
        Add Column
      </Button>
    </Space>
  )

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title={project?.name || 'Project Board'}
        breadcrumbs={[{ title: 'Projects', path: '/' }, { title: project?.name || '' }]}
        actions={actions}
      />

      {showStats && <ProjectStats {...stats} />}

      <SearchBar onSearch={handleSearch} />

      {filteredColumns.length === 0 ? (
        <Empty
          description="No columns yet"
          className="mt-20"
        >
          <Button
            type="primary"
            onClick={() =>
              createColumn({
                name: 'To Do',
                color: '#EF4444',
              })
            }
          >
            Create First Column
          </Button>
        </Empty>
      ) : (
        <div className="flex-1 overflow-hidden">
          <DndContext
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
            onDragStart={(event) => {
              const cardId = event.active.id as string
              for (const column of columns) {
                const card = column.cards?.find((c) => c.id === cardId)
                if (card) {
                  setActiveCard(card)
                  break
                }
              }
            }}
          >
            <SortableContext
              items={filteredColumns.map((col) => col.id)}
              strategy={horizontalListSortingStrategy}
            >
              <Board 
                columns={filteredColumns}
                onEditColumn={(column) =>
                  setEditColumnModal({ open: true, column })
                }
                onCreateCard={(columnId) =>
                  setCreateCardModal({ open: true, columnId })
                }
              />
            </SortableContext>

            <DragOverlay>
              {activeCard && <Card card={activeCard} isDragging />}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {selectedCard && (
        <CardModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(data) => updateCard({ id: selectedCard.id, data })}
          onDelete={() => {
            deleteCard(selectedCard.id)
            setSelectedCard(null)
          }}
        />
      )}

      <CreateCardModal
        open={createCardModal.open}
        columnId={createCardModal.columnId}
        onClose={() => setCreateCardModal({ open: false, columnId: '' })}
        onCreate={createCard}
      />

      <EditColumnModal
        column={editColumnModal.column}
        open={editColumnModal.open}
        onClose={() => setEditColumnModal({ open: false, column: null })}
        onSave={updateColumn}
      />
    </div>
  )
}