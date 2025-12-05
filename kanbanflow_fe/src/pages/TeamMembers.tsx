import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { projectsApi } from '@/api/projects.api'
import { getInitials } from '@/lib/helpers'

// Shadcn Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Trash2, Shield, Loader2, ArrowLeft } from "lucide-react"

// Types & Schema
interface TeamMember {
  user: {
    id: string
    email: string
    fullName: string
    avatarUrl?: string
  }
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  joinedAt: string
}

const addMemberSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.string().default("VIEWER"),
})

export default function TeamMembers() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  
  // States
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null) // ID user cần xóa

  const form = useForm<z.infer<typeof addMemberSchema>>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { email: "", role: "VIEWER" }
  })

  // Queries
  const { data: members, isLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectsApi.getProjectMembers(projectId!),
    enabled: !!projectId,
  })

  // Mutations
  const addMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      projectsApi.addProjectMember(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      toast.success('Member added successfully')
      setIsAddOpen(false)
      form.reset()
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to add member')
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectsApi.updateMemberRole(projectId!, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      toast.success('Role updated')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      toast.success('Member removed')
      setMemberToRemove(null)
    },
  })

  const roleColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    OWNER: 'destructive', // Red
    ADMIN: 'default', // Primary Color
    EDITOR: 'secondary', // Gray
    VIEWER: 'outline', // Outline
  }

  return (
    <div className="container max-w-5xl mx-auto py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Members</h1>
          <p className="text-muted-foreground mt-1">Manage access and roles for your project.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Add Member
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                 </TableCell>
               </TableRow>
            ) : members?.map((member: TeamMember) => (
              <TableRow key={member.user.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.user.avatarUrl} />
                    <AvatarFallback>{getInitials(member.user.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{member.user.fullName}</span>
                    <span className="text-xs text-muted-foreground">{member.user.email}</span>
                  </div>
                </TableCell>
                
                <TableCell>
                  {member.role === 'OWNER' ? (
                     <Badge variant="destructive" className="gap-1">
                        <Shield className="h-3 w-3" /> Owner
                     </Badge>
                  ) : (
                    <Select 
                      defaultValue={member.role} 
                      onValueChange={(val) => updateRoleMutation.mutate({ userId: member.user.id, role: val })}
                    >
                      <SelectTrigger className="w-[110px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="EDITOR">Editor</SelectItem>
                        <SelectItem value="VIEWER">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                
                <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
                
                <TableCell className="text-right">
                  {member.role !== 'OWNER' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setMemberToRemove(member.user.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
            <DialogDescription>Invite a user by email to collaborate.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((v) => addMutation.mutate(v))} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="colleague@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                       <FormControl>
                         <SelectTrigger>
                           <SelectValue placeholder="Select a role" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent>
                         <SelectItem value="ADMIN">Admin</SelectItem>
                         <SelectItem value="EDITOR">Editor</SelectItem>
                         <SelectItem value="VIEWER">Viewer</SelectItem>
                       </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                 <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                 <Button type="submit" disabled={addMutation.isPending}>
                    {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Invite
                 </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation Alert */}
      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the user from the project. They will lose access to all boards and cards immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
               onClick={() => memberToRemove && removeMutation.mutate(memberToRemove)}
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}