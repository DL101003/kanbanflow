import { Modal, Form, Input, Select, DatePicker, message } from 'antd'
import type { Priority } from '@/types'

interface CreateCardModalProps {
  open: boolean
  columnId: string
  onClose: () => void
  onCreate: (params: {
    columnId: string
    data: {
      title: string
      description?: string
      priority?: Priority
      dueDate?: string
    }
  }) => void // ✅ Update type để nhận cả object
}

const { TextArea } = Input

export default function CreateCardModal({ open, columnId, onClose, onCreate }: CreateCardModalProps) {
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      const cardData = {
        title: values.title,
        description: values.description,
        priority: values.priority || 'MEDIUM' as Priority,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : undefined,
      }
      
      console.log('CreateCardModal - Submitting with columnId:', columnId)
      console.log('CreateCardModal - Card data:', cardData)
      
      // ✅ GỌI onCreate VỚI CẢ columnId VÀ data
      onCreate({
        columnId: columnId,
        data: cardData
      })
      
      form.resetFields()
    } catch (error) {
      console.error('Form validation error:', error)
      message.error('Please fill required fields')
    }
  }

  const handleCancel = () => {
    form.resetFields()
    onClose()
  }

  return (
    <Modal
      title="Create New Card"
      open={open}
      onOk={handleSubmit}
      onCancel={handleCancel}
      destroyOnHidden
      width={600}
      okText="Create"
      cancelText="Cancel"
    >
      <Form 
        form={form} 
        layout="vertical"
        initialValues={{
          priority: 'MEDIUM'
        }}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter card title' }]}
        >
          <Input placeholder="Enter card title" autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Enter description (optional)" />
        </Form.Item>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item name="priority" label="Priority" initialValue="MEDIUM">
            <Select>
              <Select.Option value="LOW">Low</Select.Option>
              <Select.Option value="MEDIUM">Medium</Select.Option>
              <Select.Option value="HIGH">High</Select.Option>
              <Select.Option value="URGENT">Urgent</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Due Date">
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}