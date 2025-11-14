import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Button, Input, Badge, Dropdown, Modal, Form, message } from 'antd'
import { PlusOutlined, MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Card from './Card'
import { boardsApi } from '@/api/boards.api'
import type { BoardColumn } from '@/types'

interface ColumnProps {
  column: BoardColumn
}

export default function Column({ column }: ColumnProps) {
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [form] = Form.useForm()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const createCardMutation = useMutation({
    mutationFn: (title: string) =>
      boardsApi.createCard(column.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      setIsAddingCard(false)
      setNewCardTitle('')
      message.success('Card created')
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => boardsApi.deleteColumn(column.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      message.success('Column deleted')
    },
  })

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle.trim())
    }
  }

  const columnMenu = {
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Delete',
        danger: true,
        onClick: () => {
          Modal.confirm({
            title: 'Delete Column',
            content: `Are you sure you want to delete "${column.name}"?`,
            okText: 'Delete',
            okType: 'danger',
            onOk: () => deleteColumnMutation.mutate(),
          })
        },
      },
    ],
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
              <span {...attributes} {...listeners} className="cursor-move">
                {column.name}
              </span>
              <Badge count={column.cards?.length || 0} showZero />
            </div>
            <Dropdown menu={columnMenu} trigger={['click']}>
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </div>
        }
        bodyStyle={{ padding: '8px' }}
      >
        <div className="space-y-2 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
          {column.cards?.map((card) => (
            <Card key={card.id} card={card} columnId={column.id} />
          ))}

          {isAddingCard ? (
            <div className="p-2 bg-white rounded border">
              <Input.TextArea
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                placeholder="Enter card title..."
                autoSize={{ minRows: 2, maxRows: 4 }}
                autoFocus
                onPressEnter={(e) => {
                  e.preventDefault()
                  handleAddCard()
                }}
              />
              <div className="mt-2 flex gap-2">
                <Button
                  type="primary"
                  size="small"
                  onClick={handleAddCard}
                  loading={createCardMutation.isPending}
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
              onClick={() => setIsAddingCard(true)}
            >
              Add Card
            </Button>
          )}
        </div>
      </AntCard>
    </div>
  )
}