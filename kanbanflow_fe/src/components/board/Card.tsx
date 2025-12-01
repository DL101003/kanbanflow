import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Tag, Button } from 'antd'
import { CalendarOutlined, CommentOutlined, EyeOutlined } from '@ant-design/icons'
import { format } from 'date-fns'
import { useBoardStore } from '@/store/boardStore'
import { cn } from '@/utils/cn'
import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  canEdit?: boolean
  isDragging?: boolean
}

const priorityColors = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

export default function Card({ card, canEdit = false, isDragging }: CardProps) {
  const setSelectedCard = useBoardStore((state) => state.setSelectedCard)
  const [isDraggingLocal, setIsDraggingLocal] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: card.id,
    disabled: !canEdit, // Disable drag if user can't edit
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging || isDraggingLocal ? 0.5 : 1,
  }

  const handleViewClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Opening card details:', card.title)
    setSelectedCard(card)
  }

  return (
    <div ref={setNodeRef} style={style}>
      <AntCard
        size="small"
        className={cn(
          'hover:shadow-md transition-shadow',
          card.completed && 'opacity-60'
        )}
        bodyStyle={{ padding: '12px' }}
      >
        {/* Draggable area - only enabled if user can edit */}
        <div
          {...(canEdit ? attributes : {})}
          {...(canEdit ? listeners : {})}
          onMouseDown={() => canEdit && setIsDraggingLocal(true)}
          onMouseUp={() => canEdit && setIsDraggingLocal(false)}
          className={canEdit ? "cursor-move" : ""}
        >
          {card.coverColor && (
            <div
              className="h-8 -m-3 mb-2 rounded-t"
              style={{ backgroundColor: card.coverColor }}
            />
          )}

          <div className="space-y-2">
            <div className="font-medium line-clamp-2">{card.title}</div>
            
            {card.description && (
              <div className="text-sm text-gray-500 line-clamp-2">
                {card.description}
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-wrap">
              <Tag color={priorityColors[card.priority]} className="m-0">
                {card.priority}
              </Tag>
              
              {card.dueDate && (
                <span className={cn(
                  'text-xs flex items-center gap-1',
                  card.overdue ? 'text-red-500' : 'text-gray-500'
                )}>
                  <CalendarOutlined />
                  {format(new Date(card.dueDate), 'MMM dd')}
                </span>
              )}
              
              {card.commentCount > 0 && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <CommentOutlined />
                  {card.commentCount}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* View Details Button - always visible regardless of permissions */}
        <div className="mt-2 pt-2 border-t">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={handleViewClick}
            className="p-0"
          >
            View Details
          </Button>
        </div>
      </AntCard>
    </div>
  )
}