import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Input, Button, Avatar, Dropdown, message, Tooltip, Spin } from 'antd'
import { UserOutlined, MoreOutlined, SendOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { commentsApi } from '@/api/comments.api'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types'
import { cn } from '@/utils/cn'

const { TextArea } = Input

interface CommentSectionProps {
  cardId: string
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  
  // UX State: Chỉ hiện nút Cancel/Save khi user đang gõ
  const [isFocused, setIsFocused] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState<{ id: string; content: string } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => commentsApi.getCardComments(cardId),
    enabled: !!cardId,
  })

  // --- Mutations (Giữ nguyên logic cũ, chỉ clean code) ---
  const addCommentMutation = useMutation({
    mutationFn: (content: string) => commentsApi.addComment(cardId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setNewComment('')
      setIsFocused(false) // Reset focus mode
    },
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setEditingComment(null)
      message.success('Updated')
    },
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      message.success('Deleted')
    },
  })

  const handleAddComment = () => {
    if (newComment.trim()) addCommentMutation.mutate(newComment.trim())
  }

  const comments = data?.content || []

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        Comments <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{comments.length}</span>
      </h4>

      {/* 1. INPUT AREA: Smart Expand */}
      <div className="mb-6 flex gap-3">
        <Avatar src={currentUser?.avatarUrl} icon={<UserOutlined />} className="flex-shrink-0" />
        <div className="flex-1">
          <div className={cn(
              "border rounded-lg bg-white transition-all duration-200 overflow-hidden",
              isFocused ? "shadow-md border-blue-400 ring-1 ring-blue-100" : "border-gray-300"
          )}>
            <TextArea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Write a comment..."
              autoSize={{ minRows: isFocused ? 3 : 1, maxRows: 6 }}
              className="!border-none !shadow-none !bg-transparent focus:!ring-0 px-3 py-2"
              onPressEnter={(e) => {
                if (!e.shiftKey && isFocused) {
                  e.preventDefault()
                  handleAddComment()
                }
              }}
            />
            
            {/* Toolbar chỉ hiện khi focus hoặc có text */}
            {(isFocused || newComment) && (
                <div className="flex justify-between items-center px-2 py-2 bg-gray-50 border-t">
                    <span className="text-xs text-gray-400 pl-2">Press Enter to send</span>
                    <div className="flex gap-2">
                        <Button size="small" type="text" onClick={() => {
                            setIsFocused(false)
                            setNewComment('')
                        }}>Cancel</Button>
                        <Button 
                            size="small" 
                            type="primary" 
                            disabled={!newComment.trim()}
                            loading={addCommentMutation.isPending}
                            onClick={handleAddComment}
                            icon={<SendOutlined />}
                        >
                            Send
                        </Button>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. COMMENTS LIST: Chat Style */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
        {isLoading ? <div className="text-center py-4"><Spin /></div> : 
         comments.length === 0 ? <div className="text-center text-gray-400 py-8">No comments yet. Be the first!</div> :
         
         comments.map((comment: Comment) => {
           const isAuthor = comment.author.id === currentUser?.id;
           const isEditing = editingComment?.id === comment.id;

           return (
             <div key={comment.id} className="group flex gap-3 items-start">
               <Avatar 
                 src={comment.author.avatarUrl} 
                 icon={<UserOutlined />} 
                 size="small" 
                 className="mt-1 flex-shrink-0" 
               />
               
               <div className="flex-1 min-w-0">
                 {/* Header: Name + Time */}
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-medium text-sm text-gray-900">{comment.author.fullName}</span>
                   <span className="text-xs text-gray-400">
                     {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                     {comment.edited && <span className="ml-1 italic">(edited)</span>}
                   </span>
                 </div>

                 {/* Content Bubble */}
                 {isEditing ? (
                   <div className="mt-1">
                      <TextArea 
                        value={editingComment.content}
                        onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
                        autoSize={{ minRows: 2 }}
                        className="mb-2"
                      />
                      <div className="flex gap-2">
                          <Button size="small" type="primary" onClick={() => updateCommentMutation.mutate({id: comment.id, content: editingComment.content})}>Save</Button>
                          <Button size="small" onClick={() => setEditingComment(null)}>Cancel</Button>
                      </div>
                   </div>
                 ) : (
                   <div className="bg-gray-50 p-3 rounded-lg rounded-tl-none text-sm text-gray-700 whitespace-pre-wrap break-words border border-gray-100 group-hover:bg-gray-100 transition-colors">
                     {comment.content}
                   </div>
                 )}
               </div>

               {/* Actions Dropdown */}
               {isAuthor && !isEditing && (
                 <Dropdown 
                    trigger={['click']}
                    menu={{
                        items: [
                            { key: 'edit', label: 'Edit', onClick: () => setEditingComment({ id: comment.id, content: comment.content }) },
                            { key: 'delete', label: 'Delete', danger: true, onClick: () => deleteCommentMutation.mutate(comment.id) }
                        ]
                    }}
                 >
                   <Button type="text" size="small" icon={<MoreOutlined />} className="opacity-0 group-hover:opacity-100 text-gray-400" />
                 </Dropdown>
               )}
             </div>
           )
         })
        }
      </div>
    </div>
  )
}