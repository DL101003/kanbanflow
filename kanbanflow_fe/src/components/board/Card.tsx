import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, MessageSquare } from 'lucide-react'
import { format } from 'date-fns'
import { useBoardStore } from '@/store/boardStore'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/helpers'
import type { Card as CardType } from '@/types'

interface CardProps {
  card: CardType
  canEdit?: boolean
  isDragging?: boolean
}

// Map priority sang màu của Shadcn Badge (hoặc class Tailwind)
const priorityStyles = {
  LOW: 'border-l-emerald-500',
  MEDIUM: 'border-l-blue-500',
  HIGH: 'border-l-orange-500',
  URGENT: 'border-l-red-500',
}

const badgeVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  LOW: 'secondary',
  MEDIUM: 'default', // Xanh (primary)
  HIGH: 'outline',   // Có thể custom thêm class text-orange
  URGENT: 'destructive',
}

export default function Card({ card, canEdit = false, isDragging }: CardProps) {
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
    disabled: !canEdit,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <ShadcnCard
        className={cn(
          "cursor-grab active:cursor-grabbing transition-all hover:shadow-md border-l-4",
          priorityStyles[card.priority] || 'border-l-gray-300', // Giữ cái vạch màu bên trái đặc trưng của Kanban
          isDragging && "rotate-2 scale-105 shadow-xl z-50 ring-2 ring-primary opacity-90",
          card.completed && "opacity-60 bg-muted"
        )}
        onClick={() => setSelectedCard(card)}
        {...(canEdit ? attributes : {})}
        {...(canEdit ? listeners : {})}
      >
        <CardContent className="p-3 space-y-2.5">
          {/* Labels / Tags row (Optional) */}
          <div className="flex justify-between items-start gap-2">
            <span className="text-sm font-medium leading-snug line-clamp-2 text-card-foreground">
                {card.title}
            </span>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3 text-muted-foreground text-xs">
              {card.dueDate && (
                <div className={cn(
                    "flex items-center gap-1",
                    card.overdue && "text-destructive font-medium"
                )}>
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(card.dueDate), 'MMM dd')}</span>
                </div>
              )}
              {card.commentCount > 0 && (
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{card.commentCount}</span>
                </div>
              )}
            </div>

            {card.assignee && (
              <Avatar className="h-6 w-6 border-2 border-background">
                <AvatarImage src={card.assignee.avatarUrl} />
                <AvatarFallback className="text-[10px]">
                    {getInitials(card.assignee.fullName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </CardContent>
      </ShadcnCard>
    </div>
  )
}