import { Modal, Table, Tag } from 'antd'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

const shortcuts = [
  { keys: ['Ctrl', 'N'], description: 'Create new project' },
  { keys: ['Ctrl', 'H'], description: 'Go to home' },
  { keys: ['Ctrl', 'P'], description: 'Go to profile' },
  { keys: ['Ctrl', '/'], description: 'Focus search' },
  { keys: ['Ctrl', 'K'], description: 'Open shortcuts' },
  { keys: ['Esc'], description: 'Close modal/dialog' },
  { keys: ['?'], description: 'Show help' },
]

export default function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const columns = [
    {
      title: 'Shortcut',
      dataIndex: 'keys',
      render: (keys: string[]) => (
        <div className="flex gap-1">
          {keys.map((key) => (
            <Tag key={key}>{key}</Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
  ]

  return (
    <Modal
      title="Keyboard Shortcuts"
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      <Table
        columns={columns}
        dataSource={shortcuts}
        pagination={false}
        size="small"
        rowKey={(record) => record.description}
      />
    </Modal>
  )
}