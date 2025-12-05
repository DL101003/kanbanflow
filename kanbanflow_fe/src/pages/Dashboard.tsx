import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { projectsApi } from '@/api/projects.api'
import type { Project } from '@/types'

// Shadcn & Lucide
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, MoreHorizontal, FolderOpen, Star, StarOff, Trash2, Edit, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// 1. Zod Schema
const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color").default("#3B82F6"),
})

type ProjectFormValues = z.infer<typeof projectSchema>

// 2. Custom Color Picker (Thay thế Antd ColorPicker)
const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6']

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // States quản lý Dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [editProject, setEditProject] = useState<Project | null>(null)

  // Forms
  const createForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", color: "#3B82F6" }
  })

  const editForm = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", color: "#3B82F6" }
  })

  // Sync data vào Edit Form khi mở modal
  useEffect(() => {
    if (editProject) {
      editForm.reset({
        name: editProject.name,
        description: editProject.description || "",
        color: editProject.color
      })
    }
  }, [editProject, editForm])

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
      setCreateOpen(false)
      createForm.reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated')
      setEditProject(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: projectsApi.toggleFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  // Handlers
  const onCreateSubmit = (values: ProjectFormValues) => createMutation.mutate(values)
  
  const onEditSubmit = (values: ProjectFormValues) => {
    if (editProject) {
      updateMutation.mutate({ id: editProject.id, data: values })
    }
  }

  const projects = data?.content || []

  // Component render Form (Dùng chung cho Create và Edit để đỡ lặp code)
  const ProjectFormFields = ({ form }: { form: any }) => (
    <div className="space-y-4 py-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Name</FormLabel>
            <FormControl><Input placeholder="My Awesome Project" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl><Textarea placeholder="What is this project about?" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="color"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Color Theme</FormLabel>
            <FormControl>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((color) => (
                  <div
                    key={color}
                    onClick={() => field.onChange(color)}
                    className={cn(
                      "w-8 h-8 rounded-full cursor-pointer transition-all hover:scale-110",
                      field.value === color ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-70 hover:opacity-100"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )

  if (isLoading) {
    return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
  }

  return (
    <div className="container mx-auto max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your projects and tasks.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} size="lg" className="shadow-md">
          <Plus className="mr-2 h-4 w-4" /> New Project
        </Button>
      </div>

      {/* Empty State */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl bg-muted/10">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FolderOpen className="h-10 w-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No projects found</h3>
          <p className="text-muted-foreground mt-2 mb-6">Get started by creating your first project.</p>
          <Button onClick={() => setCreateOpen(true)}>Create Project</Button>
        </div>
      ) : (
        /* Projects Grid (Thay cho Antd Row/Col) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {projects.map((project: Project) => (
            <Card 
              key={project.id} 
              className="group relative cursor-pointer hover:shadow-lg transition-all duration-300 border-l-4 overflow-hidden"
              style={{ borderLeftColor: project.color }}
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm"
                    style={{ backgroundColor: project.color }}
                  >
                    {project.name[0].toUpperCase()}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={(e) => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditProject(project) }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(project.id) }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="mt-3 truncate">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">
                   {project.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              
              <CardFooter className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "ml-auto transition-colors",
                    project.favorite ? "text-yellow-500 hover:text-yellow-600" : "text-muted-foreground hover:text-yellow-500"
                  )}
                  onClick={(e) => { e.stopPropagation(); toggleFavoriteMutation.mutate(project.id) }}
                >
                   {project.favorite ? <Star className="h-4 w-4 fill-current" /> : <Star className="h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Create Project Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Setup your new kanban board.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)}>
              <ProjectFormFields form={createForm} />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={!!editProject} onOpenChange={(open) => !open && setEditProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)}>
              <ProjectFormFields form={editForm} />
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setEditProject(null)}>Cancel</Button>
                <Button type="submit" disabled={updateMutation.isPending}>
                   {updateMutation.isPending ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}