import { useQuery } from '@tanstack/react-query'
import { Timeline, Avatar, Typography, Empty, Spin } from 'antd'
import { UserOutlined, FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'
import { apiClient } from '@/api/client' // Use apiClient instead of fetch

const { Text } = Typography

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

  if (isLoading) return <Spin />
  if (!activities || activities.length === 0) {
    return <Empty description="No activities yet" />
  }

  return (
    <Timeline>
      {activities.map((activity: Activity) => (
        <Timeline.Item
          key={activity.id}
          dot={
            <Avatar size="small" src={activity.user.avatarUrl} icon={<UserOutlined />}>
              {activity.user.fullName?.[0]}
            </Avatar>
          }
        >
          <div>
            <Text strong>{activity.user.fullName}</Text>
            <Text> {activity.details}</Text>
          </div>
          <div>
            <Text type="secondary" className="text-xs">
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </Text>
          </div>
        </Timeline.Item>
      ))}
    </Timeline>
  )
}