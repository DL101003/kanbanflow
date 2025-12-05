import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { getInitials } from "@/lib/helpers"
import type { UserSummary } from "@/types"

interface UserAvatarProps {
  user?: UserSummary | null
  className?: string
  showTooltip?: boolean
}

export default function UserAvatar({ user, className, showTooltip = true }: UserAvatarProps) {
  const avatar = (
    <Avatar className={className}>
      <AvatarImage src={user?.avatarUrl} />
      <AvatarFallback>{getInitials(user?.fullName || '?')}</AvatarFallback>
    </Avatar>
  )

  if (showTooltip && user?.fullName) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatar}</TooltipTrigger>
          <TooltipContent>
            <p>{user.fullName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return avatar
}