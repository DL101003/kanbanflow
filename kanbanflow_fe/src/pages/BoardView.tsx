import { useParams } from 'react-router-dom'
import { Button, Modal, Form, Input, InputNumber, Space, Spin, Tag } from 'antd'
import {
  PlusOutlined,
  TeamOutlined,
  BarChartOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core'
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'

// Components
import Board from '@/components/board/Board'
import Card from '@/components/board/Card'
import CardModal from '@/components/board/CardModal'
import CreateCardModal from '@/components/board/CreateCardModal'
import ProjectStats from '@/components/stats/ProjectStats'

// Logic Hook
import { useBoardLogic } from '@/hooks/useBoardLogic'
import SearchBar from '@/components/board/SearchBar'

export default function BoardView() {
  const { projectId } = useParams<{ projectId: string }>()

  // ✅ Gọi 1 dòng duy nhất để lấy toàn bộ logic
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
    isColumnModalOpen,
    setIsColumnModalOpen,
    editingColumn,
    setEditingColumn,
    createCardModal,
    setCreateCardModal,
    selectedCard,
    setSelectedCard,
    columnForm,
    editColumnForm,
    deleteColumn,
    createCard,
    updateCard,
    deleteCard,
    handlers
  } = useBoardLogic(projectId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="Loading board..." />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 1. Header Section */}
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">{project?.name}</h1>
          <Tag color={
            permissions.roleLabel === 'OWNER' ? 'red' :
              permissions.roleLabel === 'ADMIN' ? 'orange' :
                permissions.roleLabel === 'EDITOR' ? 'blue' : 'green'
          }>
            {permissions.roleLabel}
          </Tag>
        </div>

        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => handlers.handleExport('csv')}>
            Export CSV
          </Button>

          {permissions.canManageMembers && (
            <Button icon={<TeamOutlined />} onClick={handlers.navigateToTeam}>
              Team Members
            </Button>
          )}

          <Button icon={<BarChartOutlined />} onClick={() => setShowStats(!showStats)}>
            {showStats ? 'Hide Stats' : 'Show Stats'}
          </Button>

          {permissions.canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsColumnModalOpen(true)}>
              Add Column
            </Button>
          )}
        </Space>
      </div>

      {/* 2. Stats Section */}
      {showStats && <ProjectStats {...stats} />}

      <div className="px-6"> {/* Thêm padding nếu cần */}
        <SearchBar onSearch={handlers.handleSearch} />
      </div>

      {/* 3. Board Area */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={permissions.canEdit ? handlers.handleDragEnd : undefined}
          onDragStart={permissions.canEdit ? (event) => {
            const cardId = event.active.id as string
            // Logic tìm card active khi drag start
            for (const column of columns) {
              const card = column.cards?.find((c) => c.id === cardId)
              if (card) {
                setActiveCard(card)
                break
              }
            }
          } : undefined}
        >
          <SortableContext items={columns.map((col) => col.id)} strategy={horizontalListSortingStrategy}>
            <Board
              columns={columns}
              canEdit={permissions.canEdit}
              onEditColumn={handlers.openEditColumnModal}
              onCreateCard={(columnId) => setCreateCardModal({ open: true, columnId })}
            />
          </SortableContext>

          <DragOverlay>
            {activeCard && <Card card={activeCard} isDragging />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* 4. Modals Section - Clean and separated */}

      {/* View/Edit Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          open={!!selectedCard}
          onClose={() => setSelectedCard(null)}
          onUpdate={async (data) => {
            await new Promise((resolve) => {
              updateCard({ id: selectedCard.id, data })
              setTimeout(resolve, 100)
            })
          }}
          onDelete={() => {
            deleteCard(selectedCard.id)
            setSelectedCard(null)
          }}
        />
      )}

      {/* Create Card Modal */}
      {createCardModal.columnId && (
        <CreateCardModal
          open={createCardModal.open}
          columnId={createCardModal.columnId}
          onClose={() => setCreateCardModal({ open: false, columnId: null })}
          onCreate={(params) => {
            createCard(params)
            setCreateCardModal({ open: false, columnId: null })
          }}
        />
      )}

      {/* Create Column Modal */}
      <Modal
        title="Create New Column"
        open={isColumnModalOpen}
        onCancel={() => setIsColumnModalOpen(false)}
        footer={null}
      >
        <Form form={columnForm} layout="vertical" onFinish={handlers.handleCreateColumn}>
          <Form.Item name="name" label="Column Name" rules={[{ required: true }]}>
            <Input placeholder="Enter column name" />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Input placeholder="#3B82F6" maxLength={7} />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>Create Column</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Column Modal */}
      <Modal
        title="Edit Column"
        open={!!editingColumn}
        onCancel={() => setEditingColumn(null)}
        footer={null}
      >
        <Form form={editColumnForm} layout="vertical" onFinish={handlers.handleUpdateColumn}>
          <Form.Item name="name" label="Column Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="color" label="Color">
            <Input placeholder="#3B82F6" maxLength={7} />
          </Form.Item>
          <Form.Item name="cardLimit" label="Card Limit">
            <InputNumber min={1} max={50} className="w-full" />
          </Form.Item>
          <Space className="w-full justify-between mt-4">
            <Button danger onClick={() => {
              if (editingColumn) deleteColumn(editingColumn.id);
              setEditingColumn(null);
            }}>
              Delete Column
            </Button>
            <Button type="primary" htmlType="submit">
              Update Column
            </Button>
          </Space>
        </Form>
      </Modal>
    </div>
  )
}