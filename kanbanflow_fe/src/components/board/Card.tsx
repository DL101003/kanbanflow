import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Tag, Avatar, Tooltip } from 'antd'
import { CalendarOutlined, CommentOutlined, UserOutlined } from '@ant-design/icons'
import { format } from 'date-fns'
import { useBoardStore } from '@/store/boardStore'
import { cn } from '@/utils/cn'
import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  columnId?: string
  isDragging?: boolean
}

const priorityColors = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  URGENT: 'red',
}

export default function Card({ card, isDragging }: CardProps) {
  const setSelectedCard = useBoardStore((state) => state.setSelectedCard)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'Card',
      columnId,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const handleClick = () => {
    if (!isDragging && !isSortableDragging) {
      setSelectedCard(card)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={handleClick}
    >
      <AntCard
        size="small"
        className={cn(
          'cursor-move hover:shadow-md transition-shadow',
          card.completed && 'opacity-60'
        )}
        bodyStyle={{ padding: '12px' }}
      >
        {card.coverColor && (
          <div
            className="h-8 -m-3 mb-2 rounded-t"
            style={{ backgroundColor: card.coverColor }}
          />
        )}

        <div className="space-y-2">
          <div className="font-medium">{card.title}</div>

          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={priorityColors[card.priority]}>{card.priority}</Tag>

            {card.dueDate && (
              <Tooltip title={`Due: ${format(new Date(card.dueDate), 'MMM dd, yyyy')}`}>
                <span
                  className={cn(
                    'text-xs flex items-center gap-1',
                    card.overdue ? 'text-red-500' : 'text-gray-500'
                  )}
                >
                  <CalendarOutlined />
                  {format(new Date(card.dueDate), 'MMM dd')}
                </span>
              </Tooltip>
            )}

            {card.commentCount > 0 && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <CommentOutlined />
                {card.commentCount}
              </span>
            )}
          </div>

          {card.assignee && (
            <div className="flex items-center justify-between">
              <Avatar
                size="small"
                src={card.assignee.avatarUrl}
                icon={!card.assignee.avatarUrl && <UserOutlined />}
              >
                {card.assignee.fullName[0]}
              </Avatar>
            </div>
          )}
        </div>
      </AntCard>
    </div>
  )
}