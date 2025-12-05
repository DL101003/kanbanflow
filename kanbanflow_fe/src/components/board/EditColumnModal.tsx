import { useEffect } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import type { BoardColumn } from '@/types'
import { cn } from "@/lib/utils"

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#64748B']

const columnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cardLimit: z.coerce.number().min(0).max(100), // coerce để convert string input sang number
  color: z.string().optional()
})

type ColumnFormValues = z.infer<typeof columnSchema>

interface EditColumnModalProps {
  column: BoardColumn | null
  open: boolean
  onClose: () => void
  onSave: (id: string, data: Partial<BoardColumn>) => void
  onDelete?: (id: string) => void
}

export default function EditColumnModal({ column, open, onClose, onSave, onDelete }: EditColumnModalProps) {
  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: { name: "", cardLimit: 0, color: "#3B82F6" }
  })

  // Reset form khi column thay đổi
  useEffect(() => {
    if (column) {
      form.reset({
        name: column.name,
        cardLimit: column.cardLimit || 0,
        color: column.color || "#3B82F6"
      })
    }
  }, [column, form])

  const onSubmit = (values: ColumnFormValues) => {
    if (column) {
      onSave(column.id, values)
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Column</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WIP Limit (Max Cards)</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Indicator</FormLabel>
                  <FormControl>
                     <div className="flex gap-2 flex-wrap">
                        {COLORS.map(c => (
                           <div 
                              key={c}
                              onClick={() => field.onChange(c)}
                              className={cn(
                                 "w-6 h-6 rounded-full cursor-pointer hover:scale-110 transition-transform",
                                 field.value === c ? "ring-2 ring-offset-2 ring-primary" : "opacity-70"
                              )}
                              style={{ backgroundColor: c }}
                           />
                        ))}
                     </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
               {onDelete && column && (
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="mr-auto"
                    onClick={() => { onDelete(column.id); onClose(); }}
                  >
                     Delete
                  </Button>
               )}
               <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
               <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}