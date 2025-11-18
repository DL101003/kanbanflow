import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Column from './Column'
import type { BoardColumn } from '@/types'

interface BoardProps {
  columns: BoardColumn[]
  onEditColumn?: (column: BoardColumn) => void
  onCreateCard?: (columnId: string) => void
}

export default function Board({ columns, onEditColumn, onCreateCard }: BoardProps) {
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
              onEdit={() => onEditColumn?.(column)}
              onAddCard={() => onCreateCard?.(column.id)}
            />
          </SortableContext>
        </div>
      ))}
    </div>
  )
}