import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from "sonner" // ✅ Fix
import { projectsApi } from '@/api/projects.api'

export function useProjects() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
    staleTime: 60 * 1000,
  })

  const createProjectMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created successfully')
    },
  })

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: projectsApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  return {
    projects: data?.content || [],
    totalProjects: data?.totalElements || 0,
    isLoading,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    toggleFavorite: toggleFavoriteMutation.mutate,
    isCreating: createProjectMutation.isPending,
  }
}