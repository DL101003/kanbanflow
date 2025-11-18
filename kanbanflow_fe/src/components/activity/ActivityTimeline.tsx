import { useQuery } from '@tanstack/react-query'
import { Timeline, Avatar, Typography, Empty, Spin } from 'antd'
import { UserOutlined, FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { formatDistanceToNow } from 'date-fns'

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

const actionIcons = {
  CREATE: <FileAddOutlined />,
  UPDATE: <EditOutlined />,
  DELETE: <DeleteOutlined />,
}

export default function ActivityTimeline({ projectId, cardId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['activities', projectId, cardId],
    queryFn: () => {
      if (cardId) {
        return fetch(`/api/cards/${cardId}/activities`).then(res => res.json())
      }
      if (projectId) {
        return fetch(`/api/projects/${projectId}/activities`).then(res => res.json())
      }
      return []
    },
    enabled: !!projectId || !!cardId,
  })

  if (isLoading) return <Spin />
  if (!activities || activities.length === 0) return <Empty description="No activities yet" />

  return (
    <Timeline>
      {activities.map((activity: Activity) => (
        <Timeline.Item
          key={activity.id}
          dot={
            <Avatar size="small" src={activity.user.avatarUrl} icon={<UserOutlined />}>
              {activity.user.fullName[0]}
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