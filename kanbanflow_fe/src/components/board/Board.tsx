import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import Column from './Column'
import type { BoardColumn } from '@/types'

interface BoardProps {
  columns: BoardColumn[]
}

export default function Board({ columns }: BoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-80">
          <SortableContext
            items={column.cards?.map((c) => c.id) || []}
            strategy={verticalListSortingStrategy}
          >
            <Column column={column} />
          </SortableContext>
        </div>
      ))}
    </div>
  )
}