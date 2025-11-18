import { Avatar, Tooltip } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import type { UserSummary } from '@/types'

interface UserAvatarProps {
  user?: UserSummary | null
  size?: 'small' | 'default' | 'large' | number
  showTooltip?: boolean
}

export default function UserAvatar({ user, size = 'default', showTooltip = true }: UserAvatarProps) {
  if (!user) {
    return (
      <Avatar size={size} icon={<UserOutlined />} className="bg-gray-400" />
    )
  }

  const avatar = (
    <Avatar
      size={size}
      src={user.avatarUrl}
      icon={!user.avatarUrl && <UserOutlined />}
      className={!user.avatarUrl ? 'bg-blue-500' : ''}
    >
      {!user.avatarUrl && user.fullName[0].toUpperCase()}
    </Avatar>
  )

  if (showTooltip) {
    return (
      <Tooltip title={user.fullName}>
        {avatar}
      </Tooltip>
    )
  }

  return avatar
}