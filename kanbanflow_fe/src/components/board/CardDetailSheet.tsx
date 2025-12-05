import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trash2, Save, X, Calendar as CalendarIcon } from "lucide-react"
import type { Card } from "@/types"
import CommentSection from "./CommentSection" // Component này lát nữa chỉnh CSS sau

interface CardDetailSheetProps {
  card: Card | null
  open: boolean
  onClose: () => void
  onUpdate: (data: any) => void
  onDelete: (id: string) => void
}

export default function CardDetailSheet({
  card,
  open,
  onClose,
  onUpdate,
  onDelete
}: CardDetailSheetProps) {
  // State local để handle việc edit title nhanh
  const [title, setTitle] = useState("")

  useEffect(() => {
    if (card) setTitle(card.title)
  }, [card])

  if (!card) return null

  const handleSaveTitle = () => {
    if (title !== card.title) {
      onUpdate({ title })
    }
  }

  return (
    <Sheet open={open} onOpenChange={(val) => !val && onClose()}>
      {/* sm:max-w-xl giúp sheet rộng hơn một chút để thoải mái nội dung */}
      <SheetContent className="sm:max-w-xl overflow-y-auto flex flex-col gap-0 p-0"> 
        
        {/* Header Custom */}
        <div className="p-6 pb-2 border-b">
           <div className="flex items-start justify-between gap-4 mb-4">
              {/* Title Input: UX cho phép sửa title ngay tại header */}
              <Input 
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 onBlur={handleSaveTitle} // Auto save khi click ra ngoài
                 className="text-lg font-bold border-transparent hover:border-input focus:border-primary px-2 -ml-2 h-auto py-1"
              />
              {/* Badge Priority */}
              <Badge variant={card.priority === 'URGENT' ? 'destructive' : 'outline'}>
                {card.priority}
              </Badge>
           </div>
           
           <div className="flex items-center text-sm text-muted-foreground gap-4">
              <div className="flex items-center gap-1">
                 <span className="text-xs uppercase font-semibold">In Column:</span>
                 <span className="text-foreground font-medium">To Do</span> {/* Cái này cần logic lấy tên cột */}
              </div>
           </div>
        </div>

        {/* Body Scrollable */}
        <div className="flex-1 p-6">
           <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start mb-4 bg-muted/50 p-1">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                <TabsTrigger value="comments" className="flex-1">Comments ({card.commentCount})</TabsTrigger>
                <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                 {/* Description Section */}
                 <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase">Description</h3>
                    {/* Chỗ này nên dùng Textarea auto-resize hoặc Rich Text Editor sau này */}
                    <div className="min-h-[100px] p-3 rounded-md border bg-muted/20 text-sm">
                       {card.description || "No description provided."}
                    </div>
                 </div>

                 <Separator />

                 {/* Meta Data Grid */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <h3 className="text-xs font-semibold text-muted-foreground uppercase">Assignee</h3>
                       <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer">
                          {/* Avatar Component Shadcn */}
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs">
                             {card.assignee?.fullName[0] || "?"}
                          </div>
                          <span className="text-sm">{card.assignee?.fullName || "Unassigned"}</span>
                       </div>
                    </div>

                    <div className="space-y-1">
                       <h3 className="text-xs font-semibold text-muted-foreground uppercase">Due Date</h3>
                       <div className="flex items-center gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{card.dueDate ? card.dueDate : "No due date"}</span>
                       </div>
                    </div>
                 </div>
              </TabsContent>

              <TabsContent value="comments">
                 <CommentSection cardId={card.id} />
              </TabsContent>
              
              <TabsContent value="activity">
                 {/* Activity Component here */}
                 <div className="text-sm text-muted-foreground text-center py-8">
                    No recent activity.
                 </div>
              </TabsContent>
           </Tabs>
        </div>

        {/* Footer Fixed */}
        <SheetFooter className="p-4 border-t bg-muted/10 sm:justify-between">
           <Button 
             variant="destructive" 
             size="sm" 
             onClick={() => onDelete(card.id)}
             className="gap-2"
           >
             <Trash2 className="w-4 h-4" /> Delete Card
           </Button>
           <Button onClick={onClose}>Close</Button>
        </SheetFooter>

      </SheetContent>
    </Sheet>
  )
}