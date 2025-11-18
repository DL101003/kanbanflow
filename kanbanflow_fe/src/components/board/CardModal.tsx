import { useState, useEffect } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, Tag, Divider, Tabs, message } from 'antd'
import { DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import CommentSection from './CommentSection'
import ActivityTimeline from '@/components/activity/ActivityTimeline'
import type { Card as CardType } from '@/types'

const { TextArea } = Input
const { TabPane } = Tabs

interface CardModalProps {
  card: CardType
  open: boolean
  onClose: () => void
  onUpdate?: (data: Partial<CardType>) => void
  onDelete?: () => void
}

export default function CardModal({ card, open, onClose, onUpdate, onDelete }: CardModalProps) {
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (card && open) {
      form.setFieldsValue({
        ...card,
        dueDate: card.dueDate ? dayjs(card.dueDate) : null,
      })
    }
  }, [card, open, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      onUpdate?.({
        ...values,
        dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
      })
      message.success('Card updated')
    } catch (error) {
      message.error('Please check the form')
    }
  }

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Card',
      content: 'Are you sure you want to delete this card?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        onDelete?.()
        onClose()
      },
    })
  }

  return (
    <Modal
      title={card.title}
      open={open}
      onCancel={onClose}
      width={800}
      footer={[
        <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete
        </Button>,
        <Button key="save" type="primary" icon={<SaveOutlined />} onClick={handleSave}>
          Save
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Details" key="details">
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="Title">
              <Input placeholder="Card title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <TextArea rows={4} placeholder="Add a description..." />
            </Form.Item>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="priority" label="Priority">
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

            <Form.Item name="completed" label="Status">
              <Select>
                <Select.Option value={false}>In Progress</Select.Option>
                <Select.Option value={true}>Completed</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </TabPane>

        <TabPane tab={`Comments (${card.commentCount})`} key="comments">
          <CommentSection cardId={card.id} />
        </TabPane>

        <TabPane tab="Activity" key="activity">
          <ActivityTimeline cardId={card.id} />
        </TabPane>
      </Tabs>
    </Modal>
  )
}