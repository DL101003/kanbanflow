import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Tag, Button } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { format } from 'date-fns'
import { useBoardStore } from '@/store/boardStore'
import { cn } from '@/utils/cn'
import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
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
  } = useSortable({ id: card.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  // Handle click - separate from drag
  const handleCardClick = (e: React.MouseEvent) => {
    // Only open modal if not dragging
    if (!isDragging && !isSortableDragging) {
      e.stopPropagation()
      console.log('Card clicked:', card.title)
      setSelectedCard(card)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      <AntCard
        size="small"
        className={cn(
          'cursor-move hover:shadow-md transition-shadow',
          card.completed && 'opacity-60'
        )}
        bodyStyle={{ padding: '12px' }}
        onDoubleClick={handleCardClick} // Use double click for details
      >
        {/* Card content - keep existing */}
        <div className="space-y-2">
          <div className="font-medium line-clamp-2">{card.title}</div>
          
          {/* Priority & Due date badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Tag color={priorityColors[card.priority]} className="m-0">
              {card.priority}
            </Tag>
            
            {card.dueDate && (
              <span className={cn(
                'text-xs',
                card.overdue ? 'text-red-500' : 'text-gray-500'
              )}>
                <CalendarOutlined /> {format(new Date(card.dueDate), 'MMM dd')}
              </span>
            )}
          </div>
          
          {/* View Details Button */}
          <Button 
            size="small" 
            type="link" 
            onClick={handleCardClick}
            className="p-0"
          >
            View Details
          </Button>
        </div>
      </AntCard>
    </div>
  )
}