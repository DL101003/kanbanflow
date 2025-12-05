import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#64748B']

const createColumnSchema = z.object({
  name: z.string().min(1, "Name is required"),
  cardLimit: z.coerce.number().min(0).max(100).default(0),
  color: z.string().default("#3B82F6")
})

type CreateColumnValues = z.infer<typeof createColumnSchema>

interface CreateColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: CreateColumnValues) => void
}

export default function CreateColumnDialog({ open, onOpenChange, onCreate }: CreateColumnDialogProps) {
  const form = useForm<CreateColumnValues>({
    resolver: zodResolver(createColumnSchema),
    defaultValues: { name: "", cardLimit: 0, color: "#3B82F6" }
  })

  const onSubmit = (values: CreateColumnValues) => {
    onCreate(values)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Column Name</FormLabel>
                  <FormControl><Input placeholder="e.g. To Do" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cardLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WIP Limit (0 for unlimited)</FormLabel>
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

            <DialogFooter>
               <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
               <Button type="submit">Create Column</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}