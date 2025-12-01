import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Button, Input, Badge, Dropdown, Modal, message } from 'antd'
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Card from './Card'
import { boardsApi } from '@/api/boards.api'
import type { BoardColumn } from '@/types'

interface ColumnProps {
  column: BoardColumn
  canEdit?: boolean
  onEdit?: () => void
  onAddCard?: () => void
}

export default function Column({ column, canEdit = false, onEdit, onAddCard }: ColumnProps) {
  const queryClient = useQueryClient()
  const { projectId } = useParams<{ projectId: string }>()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id,
    disabled: !canEdit // Only enable drag if can edit
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const createCardMutation = useMutation({
    mutationFn: (title: string) =>
      boardsApi.createCard(column.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      setIsAddingCard(false)
      setNewCardTitle('')
      message.success('Card created')
    },
    onError: (error: any) => {
      console.error('Error creating card:', error)
      message.error('Failed to create card')
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => boardsApi.deleteColumn(column.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] })
      message.success('Column deleted')
    },
    onError: (error: any) => {
      message.error('Failed to delete column')
    },
  })

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle.trim())
    }
  }

  const handleAddCardClick = () => {
    if (onAddCard) {
      onAddCard()
    } else {
      setIsAddingCard(true)
    }
  }

  const handleDeleteColumn = () => {
    if (column.cards && column.cards.length > 0) {
      message.error('Please remove all cards before deleting column')
      return
    }
    
    Modal.confirm({
      title: 'Delete Column',
      content: `Are you sure you want to delete "${column.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteColumnMutation.mutate(),
    })
  }

  const columnMenu = {
    items: canEdit ? [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: onEdit,
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: handleDeleteColumn,
      },
    ] : [],
  }

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <AntCard
        className="h-full"
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color || '#94A3B8' }}
              />
              <span 
                {...(canEdit ? attributes : {})} 
                {...(canEdit ? listeners : {})} 
                className={canEdit ? "cursor-move" : ""}
              >
                {column.name}
              </span>
              <Badge count={column.cards?.length || 0} showZero />
              {column.cardLimit && (
                <Badge 
                  count={`${column.cards?.length || 0}/${column.cardLimit}`}
                  style={{ 
                    backgroundColor: column.cardLimit && (column.cards?.length || 0) >= column.cardLimit ? '#ff4d4f' : '#52c41a' 
                  }}
                />
              )}
            </div>
            {canEdit && columnMenu.items.length > 0 && (
              <Dropdown menu={columnMenu} trigger={['click']}>
                <Button type="text" size="small" icon={<MoreOutlined />} />
              </Dropdown>
            )}
          </div>
        }
        bodyStyle={{ padding: '8px' }}
      >
        <div className="space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
          {column.cards?.map((card) => (
            <Card key={card.id} card={card} canEdit={canEdit} />
          ))}

          {canEdit && (
            isAddingCard ? (
              <div className="p-2 bg-white rounded border">
                <Input.TextArea
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  placeholder="Enter card title..."
                  autoSize={{ minRows: 2, maxRows: 4 }}
                  autoFocus
                  onPressEnter={(e) => {
                    if (!e.shiftKey) {
                      e.preventDefault()
                      handleAddCard()
                    }
                  }}
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    type="primary"
                    size="small"
                    onClick={handleAddCard}
                    loading={createCardMutation.isPending}
                    disabled={!newCardTitle.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="small"
                    onClick={() => {
                      setIsAddingCard(false)
                      setNewCardTitle('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                block
                onClick={handleAddCardClick}
              >
                Add Card
              </Button>
            )
          )}
        </div>
      </AntCard>
    </div>
  )
}