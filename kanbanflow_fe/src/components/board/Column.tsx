import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontal, Plus, Trash2, Edit } from 'lucide-react'
import { toast } from "sonner"

import { boardsApi } from '@/api/boards.api'
import type { BoardColumn } from '@/types'
import Card from './Card'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // Shadcn Input
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Shadcn Alert

interface ColumnProps {
  column: BoardColumn
  canEdit?: boolean
  onEdit?: () => void
  onAddCard?: () => void
}

export default function Column({ column, canEdit = false, onEdit, onAddCard }: ColumnProps) {
  const queryClient = useQueryClient()
  const [isAddingCard, setIsAddingCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [showDeleteAlert, setShowDeleteAlert] = useState(false) // State cho Alert Dialog

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: column.id,
    disabled: !canEdit 
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const createCardMutation = useMutation({
    mutationFn: (title: string) => boardsApi.createCard(column.id, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] }) // Invalidate rộng hơn chút để an toàn
      setIsAddingCard(false)
      setNewCardTitle('')
      toast.success('Card created')
    },
    onError: () => toast.error('Failed to create card'),
  })

  const deleteColumnMutation = useMutation({
    mutationFn: () => boardsApi.deleteColumn(column.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] })
      toast.success('Column deleted')
    },
    onError: () => toast.error('Failed to delete column'),
  })

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCardMutation.mutate(newCardTitle.trim())
    }
  }

  return (
    <>
      <div ref={setNodeRef} style={style} className="h-full flex flex-col w-80 max-h-full">
          {/* HEADER */}
          <div className="flex items-center justify-between p-3 mb-2 bg-muted/50 rounded-xl border border-transparent hover:border-border transition-colors group cursor-grab active:cursor-grabbing">
              <div className="flex items-center gap-2.5 font-semibold text-foreground">
                   <div
                      className="w-3 h-3 rounded-full ring-2 ring-background shadow-sm"
                      style={{ backgroundColor: column.color || '#94A3B8' }}
                   />
                   <span {...(canEdit ? attributes : {})} {...(canEdit ? listeners : {})}>
                      {column.name}
                   </span>
                   <span className="text-xs font-normal text-muted-foreground bg-background px-2 py-0.5 rounded-full border">
                      {column.cards?.length || 0}
                   </span>
              </div>
              
              {canEdit && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="mr-2 h-4 w-4" /> Edit Column
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => setShowDeleteAlert(true)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Column
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
          </div>

          {/* BODY */}
          <div className="flex-1 overflow-y-auto px-1 pb-2 space-y-3">
              {column.cards?.map((card) => (
                  <Card key={card.id} card={card} canEdit={canEdit} />
              ))}
          </div>

          {/* FOOTER */}
          {canEdit && (
              <div className="pt-2">
                  {isAddingCard ? (
                    <div className="bg-card p-3 rounded-xl shadow-sm border animate-in fade-in slide-in-from-bottom-2 space-y-3">
                      <Input
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="What needs to be done?"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleAddCard()
                          }
                        }}
                      />
                      <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => { setIsAddingCard(false); setNewCardTitle('') }}>
                              Cancel
                          </Button>
                          <Button size="sm" onClick={handleAddCard} disabled={createCardMutation.isPending}>
                              Add Card
                          </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:text-foreground border border-dashed border-transparent hover:border-border"
                      onClick={() => onAddCard ? onAddCard() : setIsAddingCard(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create new card
                    </Button>
                  )}
              </div>
          )}
      </div>

      {/* Delete Alert Dialog */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{column.name}" column?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All cards in this column will be deleted permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteColumnMutation.mutate()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}