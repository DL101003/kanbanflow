import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { MoreHorizontal, Send, Trash2, Edit2, X } from 'lucide-react'
import { commentsApi } from '@/api/comments.api'
import { useAuthStore } from '@/store/authStore'
import type { Comment } from '@/types'
import { getInitials } from '@/lib/helpers'

// Shadcn Components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface CommentSectionProps {
  cardId: string
}

export default function CommentSection({ cardId }: CommentSectionProps) {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)
  
  // Local States
  const [newComment, setNewComment] = useState('')
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['comments', cardId],
    queryFn: () => commentsApi.getCardComments(cardId),
  })

  // Mutations (Giữ logic cũ, thay UI)
  const addMutation = useMutation({
    mutationFn: (content: string) => commentsApi.addComment(cardId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setNewComment('')
      setIsInputFocused(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.updateComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', cardId] })
      setEditingId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsApi.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', cardId] }),
  })

  const comments = data?.content || []

  return (
    <div className="flex flex-col h-[500px]"> {/* Fixed height để scroll */}
      
      {/* 1. Comment Input Area */}
      <div className="mb-6 space-y-3">
        <div className="flex gap-3">
          <Avatar className="h-8 w-8 mt-1">
             <AvatarImage src={currentUser?.avatarUrl} />
             <AvatarFallback>{getInitials(currentUser?.fullName || 'Me')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
             <Textarea
               placeholder="Write a comment..."
               value={newComment}
               onChange={(e) => setNewComment(e.target.value)}
               onFocus={() => setIsInputFocused(true)}
               className="min-h-[80px] resize-none focus-visible:ring-1"
             />
             
             {/* Chỉ hiện nút khi user focus hoặc đã gõ chữ (UX Pattern) */}
             {(isInputFocused || newComment) && (
                <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-top-1">
                   <Button variant="ghost" size="sm" onClick={() => setIsInputFocused(false)}>
                      Cancel
                   </Button>
                   <Button 
                      size="sm" 
                      onClick={() => addMutation.mutate(newComment)}
                      disabled={!newComment.trim() || addMutation.isPending}
                   >
                      {addMutation.isPending ? "Sending..." : "Comment"}
                   </Button>
                </div>
             )}
          </div>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* 2. Comments List */}
      <ScrollArea className="flex-1 pr-4">
         {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">Loading comments...</div>
         ) : comments.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8 italic">
               No comments yet. Start the conversation!
            </div>
         ) : (
            <div className="space-y-6">
               {comments.map((comment: Comment) => {
                 const isAuthor = comment.author.id === currentUser?.id
                 const isEditing = editingId === comment.id

                 return (
                   <div key={comment.id} className="flex gap-3 group">
                      <Avatar className="h-8 w-8">
                         <AvatarImage src={comment.author.avatarUrl} />
                         <AvatarFallback>{getInitials(comment.author.fullName)}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-1">
                         {/* Header: Name + Time */}
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                               <span className="text-sm font-semibold">{comment.author.fullName}</span>
                               <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  {comment.edited && " (edited)"}
                               </span>
                            </div>
                            
                            {/* Actions Dropdown (Only for author) */}
                            {isAuthor && !isEditing && (
                               <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                     <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreHorizontal className="h-4 w-4" />
                                     </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                     <DropdownMenuItem onClick={() => {
                                        setEditingId(comment.id)
                                        setEditContent(comment.content)
                                     }}>
                                        <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                                     </DropdownMenuItem>
                                     <DropdownMenuItem 
                                        className="text-destructive focus:text-destructive"
                                        onClick={() => deleteMutation.mutate(comment.id)}
                                     >
                                        <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                                     </DropdownMenuItem>
                                  </DropdownMenuContent>
                               </DropdownMenu>
                            )}
                         </div>

                         {/* Content Body */}
                         {isEditing ? (
                            <div className="space-y-2 mt-2">
                               <Textarea 
                                  value={editContent} 
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="min-h-[60px]"
                               />
                               <div className="flex gap-2">
                                  <Button size="xs" onClick={() => updateMutation.mutate({ id: comment.id, content: editContent })}>
                                     Save
                                  </Button>
                                  <Button size="xs" variant="ghost" onClick={() => setEditingId(null)}>
                                     Cancel
                                  </Button>
                               </div>
                            </div>
                         ) : (
                            <div className="text-sm text-foreground bg-muted/40 p-3 rounded-md rounded-tl-none">
                               {comment.content}
                            </div>
                         )}
                      </div>
                   </div>
                 )
               })}
            </div>
         )}
      </ScrollArea>
    </div>
  )
}