import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Column from './Column'
import type { BoardColumn } from '@/types'

interface BoardProps {
  columns: BoardColumn[]
  canEdit?: boolean
  onEditColumn?: (column: BoardColumn) => void
  onCreateCard?: (columnId: string) => void
}

export default function Board({ columns, canEdit = false, onEditColumn, onCreateCard }: BoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 px-6">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <SortableContext
            items={column.cards?.map((c) => c.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <Column 
              column={column}
              canEdit={canEdit}
              onEdit={canEdit ? () => onEditColumn?.(column) : undefined}
              onAddCard={canEdit ? () => onCreateCard?.(column.id) : undefined}
            />
          </SortableContext>
        </div>
      ))}
    </div>
  )
}