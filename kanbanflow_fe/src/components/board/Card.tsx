import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as AntCard, Tag, Button, Tooltip, Avatar } from 'antd'
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

export default function Card({ card, canEdit = false, isDragging }: CardProps) {
  const setSelectedCard = useBoardStore((state) => state.setSelectedCard)
  const [isDraggingLocal, setIsDraggingLocal] = useState(false)

  // Logic màu priority tinh tế hơn
  const priorityColorClass = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  }
  
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
        {/* ✅ UX IMPROVEMENT: 
            - group: để control hiệu ứng hover cho các phần tử con
            - hover:ring-2: tạo viền focus khi hover thay vì shadow đơn điệu
            - select-none: chặn bôi đen text khi đang kéo thả
        */}
      <div
        className={cn(
          'group relative bg-white p-3 rounded-lg shadow-sm border border-gray-200',
          'hover:shadow-md transition-all duration-200',
          'cursor-pointer select-none',
          isDragging && 'shadow-xl rotate-2 scale-105 z-50 opacity-90', // Hiệu ứng khi đang kéo
          card.completed && 'opacity-60 bg-gray-50'
        )}
        onClick={handleViewClick}
        {...(canEdit ? attributes : {})}
        {...(canEdit ? listeners : {})}
      >
        {/* Priority Stripe: Dải màu nhỏ bên trái thay vì Tag to */}
        <div className={cn(
            "absolute left-0 top-3 bottom-3 w-1 rounded-r", 
            priorityColorClass[card.priority] || 'bg-gray-300'
        )} />

        <div className="pl-3"> 
            {/* Title */}
            <h4 className="text-sm font-medium text-gray-800 mb-1 leading-tight group-hover:text-blue-600">
                {card.title}
            </h4>

            {/* Meta info row */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex gap-2 text-xs text-gray-500">
                    {card.dueDate && (
                         <span className={cn(
                            'flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded',
                            card.overdue && 'text-red-600 bg-red-50 font-medium'
                          )}>
                           <CalendarOutlined />
                           {format(new Date(card.dueDate), 'MMM dd')}
                         </span>
                    )}
                    {card.commentCount > 0 && (
                        <span className="flex items-center gap-1 hover:text-gray-700">
                            <CommentOutlined /> {card.commentCount}
                        </span>
                    )}
                </div>

                {/* Avatar Assignee: Cực kỳ quan trọng cho UX Kanban */}
                {card.assignee && (
                    <Tooltip title={card.assignee.fullName}>
                        <Avatar 
                            size={24} 
                            src={card.assignee.avatarUrl} 
                            className="text-xs border border-white"
                        >
                            {card.assignee.fullName[0]}
                        </Avatar>
                    </Tooltip>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}