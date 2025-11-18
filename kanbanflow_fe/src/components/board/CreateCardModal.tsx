import { Modal, Form, Input, Select, DatePicker, message } from 'antd'

interface CreateCardModalProps {
  open: boolean
  columnId: string
  onClose: () => void
  onCreate: (columnId: string, data: any) => void
}

const { TextArea } = Input

export default function CreateCardModal({ open, columnId, onClose, onCreate }: CreateCardModalProps) {
  const [form] = Form.useForm()

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      onCreate(columnId, {
        ...values,
        dueDate: values.dueDate?.format('YYYY-MM-DD'),
      })
      form.resetFields()
      onClose()
    } catch (error) {
      message.error('Please fill required fields')
    }
  }

  return (
    <Modal
      title="Create New Card"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnHidden
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter card title' }]}
        >
          <Input placeholder="Enter card title" />
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
            <DatePicker className="w-full" />
          </Form.Item>
        </div>
      </Form>
    </Modal>
  )
}