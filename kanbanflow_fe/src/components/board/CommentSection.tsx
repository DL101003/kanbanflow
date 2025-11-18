import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { List, Input, Button, Avatar, Typography, Dropdown, Space, Empty, message } from 'antd'
import { UserOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { commentsApi } from '@/api/comments.api'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types'

const { TextArea } = Input
const { Text } = Typography

interface CommentSectionProps {
  cardId: string
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => commentsApi.getCardComments(cardId),
    enabled: !!cardId,
  })

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.addComment(cardId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setNewComment('')
      message.success('Comment added')
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setEditingComment(null)
      message.success('Comment updated')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      message.success('Comment deleted')
    },
  })

  const handleAddComment = () => {
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim())
    }
  }

  const handleUpdateComment = () => {
    if (editingComment && editingComment.content.trim()) {
      updateCommentMutation.mutate({
        id: editingComment.id,
        content: editingComment.content.trim(),
      })
    }
  }

  const getCommentActions = (comment: Comment) => {
    if (comment.author.id !== currentUser?.id) return null

    return {
      items: [
        {
          key: 'edit',
          icon: <EditOutlined />,
          label: 'Edit',
          onClick: () => setEditingComment({ id: comment.id, content: comment.content }),
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => deleteCommentMutation.mutate(comment.id),
        },
      ],
    }
  }

  const comments = data?.content || []

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-4">Comments ({comments.length})</h4>

      <div className="mb-4">
        <Space.Compact className="w-full">
          <TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            autoSize={{ minRows: 2, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleAddComment()
              }
            }}
          />
        </Space.Compact>
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleAddComment}
          loading={addCommentMutation.isPending}
          disabled={!newComment.trim()}
          className="mt-2"
        >
          Comment
        </Button>
      </div>

      {comments.length === 0 ? (
        <Empty description="No comments yet" />
      ) : (
        <List
          className="comment-list"
          itemLayout="horizontal"
          dataSource={comments}
          renderItem={(comment: Comment) => (
            <List.Item
              actions={
                comment.author.id === currentUser?.id
                  ? [
                      <Dropdown menu={getCommentActions(comment)} trigger={['click']}>
                        <Button type="text" size="small" icon={<EditOutlined />} />
                      </Dropdown>,
                    ]
                  : []
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar icon={<UserOutlined />}>
                    {comment.author.fullName[0]}
                  </Avatar>
                }
                title={
                  <div>
                    <Text strong>{comment.author.fullName}</Text>
                    <Text type="secondary" className="ml-2 text-xs">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      {comment.edited && ' (edited)'}
                    </Text>
                  </div>
                }
                description={
                  editingComment?.id === comment.id ? (
                    <div>
                      <TextArea
                        value={editingComment.content}
                        onChange={(e) =>
                          setEditingComment({ ...editingComment, content: e.target.value })
                        }
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                      <Space className="mt-2">
                        <Button
                          size="small"
                          onClick={handleUpdateComment}
                          loading={updateCommentMutation.isPending}
                        >
                          Save
                        </Button>
                        <Button size="small" onClick={() => setEditingComment(null)}>
                          Cancel
                        </Button>
                      </Space>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap">{comment.content}</div>
                  )
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  )
}