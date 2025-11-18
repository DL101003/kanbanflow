import { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, ColorPicker, message } from 'antd'
import type { BoardColumn } from '@/types'

interface EditColumnModalProps {
  column: BoardColumn | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: Partial<BoardColumn>) => void
}

export default function EditColumnModal({ column, open, onClose, onSave }: EditColumnModalProps) {
  const [form] = Form.useForm()

  useEffect(() => {
    if (column) {
      form.setFieldsValue({
        name: column.name,
        color: column.color,
        cardLimit: column.cardLimit,
      })
    }
  }, [column, form])

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      if (column) {
        onSave(column.id, {
          name: values.name,
          color: values.color?.toHexString?.() || values.color,
          cardLimit: values.cardLimit,
        })
        onClose()
      }
    } catch (error) {
      message.error('Please check form fields')
    }
  }

  return (
    <Modal
      title="Edit Column"
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="name"
          label="Column Name"
          rules={[{ required: true, message: 'Please enter column name' }]}
        >
          <Input placeholder="Enter column name" />
        </Form.Item>

        <Form.Item name="color" label="Column Color">
          <ColorPicker />
        </Form.Item>

        <Form.Item
          name="cardLimit"
          label="Card Limit (WIP Limit)"
          tooltip="Maximum number of cards allowed in this column"
        >
          <InputNumber min={1} max={50} placeholder="No limit" className="w-full" />
        </Form.Item>
      </Form>
    </Modal>
  )
}