import { useState } from 'react'
import { 
  useSensor, 
  useSensors, 
  PointerSensor, 
  KeyboardSensor,
  type DragStartEvent, 
  type DragOverEvent, 
  type DragEndEvent,
  defaultDropAnimationSideEffects,
  type DropAnimation
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable'
import type { BoardColumn, Card } from '@/types'

// Animation config cho mượt
export const dropAnimationConfig: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.5' },
    },
  }),
}

interface UseKanbanDragProps {
  columns: BoardColumn[]
  setColumns: (cols: BoardColumn[]) => void
  onMoveCard: (params: { cardId: string; columnId: string; position: number }) => void
  onMoveColumn: (columnId: string, position: number) => void
}

export function useKanbanDrag({ columns, setColumns, onMoveCard, onMoveColumn }: UseKanbanDragProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<any>(null) // Lưu data của item đang kéo (Card hoặc Column)

  // 1. Setup Sensors (Quan trọng: activationConstraint để tránh click nhầm)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Kéo chuột 10px mới bắt đầu tính là drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // 2. Handle Drag Start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    setActiveData(active.data.current)
  }

  // 3. Handle Drag Over (Xử lý visual khi kéo Card qua các cột khác nhau)
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Nếu đang kéo Column thì không làm gì ở đây
    if (active.data.current?.type === 'Column') return

    // Tìm cột chứa activeCard và overCard
    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (!activeColumn || !overColumn) return

    // Case 1: Kéo sang cột khác
    if (activeColumn !== overColumn) {
      setColumns((prev) => {
        const activeColIndex = prev.findIndex((col) => col.id === activeColumn.id)
        const overColIndex = prev.findIndex((col) => col.id === overColumn.id)
        
        // Clone mảng để immutability
        const newCols = JSON.parse(JSON.stringify(prev))
        const activeCards = newCols[activeColIndex].cards || []
        const overCards = newCols[overColIndex].cards || []

        // Tìm card index
        const activeIndex = activeCards.findIndex((c: Card) => c.id === activeId)
        const overIndex = overCards.findIndex((c: Card) => c.id === overId)

        let newIndex
        if (overCards.length > 0) {
           // Nếu drop lên card khác, tính toán vị trí trên/dưới
           const isBelowOverItem = over &&
             active.rect.current.translated &&
             active.rect.current.translated.top > over.rect.top + over.rect.height;
           const modifier = isBelowOverItem ? 1 : 0;
           newIndex = overIndex >= 0 ? overIndex + modifier : overCards.length + 1;
        } else {
           // Nếu drop vào cột rỗng
           newIndex = 0
        }
        
        // Logic chuyển nhà cho Card
        if (activeCards[activeIndex]) {
            const [movedCard] = activeCards.splice(activeIndex, 1)
            movedCard.columnId = overColumn.id // Update ID cột mới
            overCards.splice(newIndex, 0, movedCard)
        }
        
        return newCols
      })
    }
  }

  // 4. Handle Drag End (Gọi API để lưu)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    // Reset state
    setActiveId(null)
    setActiveData(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // A. Xử lý Drag Column
    if (active.data.current?.type === 'Column') {
      if (activeId !== overId) {
        const oldIndex = columns.findIndex((c) => c.id === activeId)
        const newIndex = columns.findIndex((c) => c.id === overId)
        
        // Optimistic Update cho UI
        setColumns(arrayMove(columns, oldIndex, newIndex))
        
        // Call API
        onMoveColumn(activeId, newIndex)
      }
      return
    }

    // B. Xử lý Drag Card (trong cùng 1 cột - vì khác cột đã xử lý ở DragOver)
    const activeColumn = findColumn(activeId)
    const overColumn = findColumn(overId)

    if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
       const cards = activeColumn.cards || []
       const oldIndex = cards.findIndex((c) => c.id === activeId)
       const newIndex = cards.findIndex((c) => c.id === overId)

       if (oldIndex !== newIndex) {
         // Optimistic Update
         const newColumns = [...columns]
         const targetCol = newColumns.find(c => c.id === activeColumn.id)
         if(targetCol && targetCol.cards) {
            targetCol.cards = arrayMove(targetCol.cards, oldIndex, newIndex)
            setColumns(newColumns)
            
            // Call API
            onMoveCard({
               cardId: activeId,
               columnId: activeColumn.id,
               position: newIndex
            })
         }
       }
    } else if (activeColumn && overColumn && activeColumn.id !== overColumn.id) {
       // Trường hợp khác cột, DragOver đã visual rồi, giờ chỉ cần gọi API vị trí cuối cùng
       const overCards = overColumn.cards || []
       const newIndex = overCards.findIndex(c => c.id === activeId)
       
       onMoveCard({
           cardId: activeId,
           columnId: overColumn.id,
           position: newIndex >= 0 ? newIndex : 0
       })
    }
  }

  // Helper
  const findColumn = (uniqueId: string) => {
    if (columns.some((c) => c.id === uniqueId)) {
      return columns.find((c) => c.id === uniqueId)
    }
    return columns.find((c) => c.cards?.some((card) => card.id === uniqueId))
  }

  return {
    sensors,
    activeId,
    activeData,
    handleDragStart,
    handleDragOver,
    handleDragEnd
  }
}