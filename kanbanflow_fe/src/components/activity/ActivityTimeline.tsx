import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { apiClient } from '@/api/client'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from '@/lib/helpers'

interface Activity {
  id: string
  user: {
    fullName: string
    avatarUrl?: string
  }
  action: string
  entityType: string
  details: string
  createdAt: string
}

interface ActivityTimelineProps {
  projectId?: string
  cardId?: string
}

export default function ActivityTimeline({ projectId, cardId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', projectId, cardId],
    queryFn: async () => {
      if (cardId) {
        const { data } = await apiClient.get(`/api/cards/${cardId}/activities`)
        return data
      }
      if (projectId) {
        const { data } = await apiClient.get(`/api/projects/${projectId}/activities`)
        return data
      }
      return []
    },
    enabled: !!projectId || !!cardId,
  })

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="animate-spin h-5 w-5 text-muted-foreground" /></div>
  
  if (!activities || activities.length === 0) {
    return <div className="text-center text-sm text-muted-foreground py-8">No activities recorded yet.</div>
  }

  return (
    <div className="relative pl-6 border-l border-muted space-y-6 my-4">
      {activities.map((activity: Activity) => (
        <div key={activity.id} className="relative group">
          {/* Dot on timeline */}
          <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full border border-background bg-muted-foreground/30 ring-4 ring-background group-hover:bg-primary transition-colors" />
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm">
                <Avatar className="h-5 w-5">
                    <AvatarImage src={activity.user.avatarUrl} />
                    <AvatarFallback className="text-[9px]">{getInitials(activity.user.fullName)}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{activity.user.fullName}</span>
                <span className="text-muted-foreground text-xs">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
            </div>
            <p className="text-sm text-foreground/80 pl-7">
               {activity.details}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}