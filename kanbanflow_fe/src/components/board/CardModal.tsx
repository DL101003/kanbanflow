import { useState } from 'react'
import { Modal, Form, Input, Select, DatePicker, Button, Avatar, List, Tag, message } from 'antd'
import { UserOutlined, DeleteOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import dayjs from 'dayjs'
import { boardsApi } from '@/api/boards.api'
import type { Card as CardType, Priority } from '@/types'

interface CardModalProps {
  card: CardType
  open: boolean
  onClose: () => void
}

const { TextArea } = Input

export default function CardModal({ card, open, onClose }: CardModalProps) {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [comment, setComment] = useState('')

  const updateCardMutation = useMutation({
    mutationFn: (values: Partial<CardType>) =>
      boardsApi.updateCard(card.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      message.success('Card updated')
    },
  })

  const deleteCardMutation = useMutation({
    mutationFn: () => boardsApi.deleteCard(card.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['columns'] })
      message.success('Card deleted')
      onClose()
    },
  })

  const handleUpdate = (values: any) => {
    updateCardMutation.mutate({
      ...values,
      dueDate: values.dueDate ? values.dueDate.format('YYYY-MM-DD') : null,
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Card',
      content: 'Are you sure you want to delete this card?',
      okText: 'Delete',
      okType: 'danger',
      onOk: () => deleteCardMutation.mutate(),
    })
  }

  return (
    <Modal
      title={card.title}
      open={open}
      onCancel={onClose}
      width={700}
      footer={[
        <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete
        </Button>,
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...card,
          dueDate: card.dueDate ? dayjs(card.dueDate) : null,
        }}
        onValuesChange={(_, values) => handleUpdate(values)}
      >
        <Form.Item name="title" label="Title">
          <Input />
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

      <div className="mt-6">
        <h4 className="font-semibold mb-3">Comments</h4>
        
        <div className="mb-4">
          <TextArea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
          />
          <Button
            type="primary"
            size="small"
            className="mt-2"
            disabled={!comment.trim()}
          >
            Add Comment
          </Button>
        </div>

        {/* Comments list would go here */}
      </div>
    </Modal>
  )
}