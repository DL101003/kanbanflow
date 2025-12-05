import { useParams } from 'react-router-dom'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, Download, Users, BarChart3, Loader2 } from 'lucide-react'

// Components
import Board from '@/components/board/Board'
import Card from '@/components/board/Card'
import ProjectStats from '@/components/stats/ProjectStats'
import SearchBar from '@/components/board/SearchBar'
import CardDetailSheet from '@/components/board/CardDetailSheet'
import CreateCardDialog from '@/components/board/CreateCardDialog'
import EditColumnModal from '@/components/board/EditColumnModal'
import CreateColumnDialog from '@/components/board/CreateColumnDialog' // Import mới

// UI Lib
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Logic Hook
import { useBoardLogic } from '@/hooks/useBoardLogic'

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()

  const {
    project,
    columns,
    isLoading,
    permissions,
    stats,
    activeCard,
    setActiveCard,
    showStats,
    setShowStats,
    
    // Modal States
    isCreateColumnOpen,
    setIsCreateColumnOpen,
    editingColumn,
    setEditingColumn,
    createCardModal,
    setCreateCardModal,
    selectedCard,
    setSelectedCard,

    // Methods
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    handlers, // Chứa các handler đã bọc logic
    
    // DnD
    dragSensors,
    onDragStart,
    onDragEnd
  } = useBoardLogic(projectId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading board...</span>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 px-6 pt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{project?.name}</h1>
          <Badge variant={
            permissions.roleLabel === 'OWNER' ? 'destructive' :
            permissions.roleLabel === 'ADMIN' ? 'default' : 'secondary'
          }>
            {permissions.roleLabel}
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => handlers.handleExport('csv')}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          {permissions.canManageMembers && (
            <Button variant="outline" size="sm" onClick={handlers.navigateToTeam}>
              <Users className="mr-2 h-4 w-4" /> Team
            </Button>
          )}

          <Button variant={showStats ? "secondary" : "outline"} size="sm" onClick={() => setShowStats(!showStats)}>
            <BarChart3 className="mr-2 h-4 w-4" /> {showStats ? 'Hide Stats' : 'Stats'}
          </Button>

          {permissions.canEdit && (
            <Button onClick={() => setIsCreateColumnOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Column
            </Button>
          )}
        </div>
      </div>

      {/* 2. Stats Section */}
      <div className="px-6">
        {showStats && <ProjectStats {...stats} />}
        <SearchBar onSearch={handlers.handleSearch} />
      </div>

      {/* 3. Board Area */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={dragSensors}
          collisionDetection={closestCorners}
          onDragStart={(event) => {
             // Logic tìm active card để hiển thị DragOverlay
             const cardId = event.active.id as string
             const card = columns.flatMap(c => c.cards || []).find(c => c.id === cardId)
             if (card) setActiveCard(card)
             if (onDragStart) onDragStart(event)
          }}
          onDragEnd={permissions.canEdit ? onDragEnd : undefined}
        >
          <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
            <Board
              columns={columns}
              canEdit={permissions.canEdit}
              onEditColumn={setEditingColumn} // Mở modal edit
              onCreateCard={(columnId) => setCreateCardModal({ open: true, columnId })}
            />
          </SortableContext>

          <DragOverlay>
            {activeCard && <Card card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 4. Modals Section */}

      {/* View/Edit Card Sheet */}
      {selectedCard && (
        <CardDetailSheet
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={(data) => updateCard({ id: selectedCard.id, data })}
          onDelete={(id) => {
            deleteCard(id)
            setSelectedCard(null)
          }}
        />
      )}

      {/* Create Card Dialog */}
      {createCardModal.columnId && (
        <CreateCardDialog
          open={createCardModal.open}
          onOpenChange={(val) => !val && setCreateCardModal({ open: false, columnId: null })}
          columnId={createCardModal.columnId}
          onCreate={(params) => {
            createCard(params)
            setCreateCardModal({ open: false, columnId: null })
          }}
        />
      )}

      {/* Create Column Dialog (NEW) */}
      <CreateColumnDialog 
        open={isCreateColumnOpen}
        onOpenChange={setIsCreateColumnOpen}
        onCreate={handlers.handleCreateColumn}
      />

      {/* Edit Column Modal */}
      {editingColumn && (
        <EditColumnModal 
          column={editingColumn}
          open={!!editingColumn}
          onClose={() => setEditingColumn(null)}
          onSave={(id, data) => handlers.handleUpdateColumn(id, data)}
          onDelete={deleteColumn}
        />
      )}
    </div>
  )
}