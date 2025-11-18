export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatarUrl?: string
  active?: boolean
  createdAt?: string
}

export interface AuthResponse {
  token: string
  userId: string
  username: string
  email: string
  fullName: string
}

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  favorite: boolean
  createdAt: string
  owner: UserSummary
}

export interface ProjectDetail extends Project {
  columns: BoardColumn[]
  stats?: ProjectStats
}

export interface BoardColumn {
  id: string
  name: string
  color?: string
  position: number
  cardLimit?: number
  cardCount?: number
  cards?: Card[]
}

export interface Card {
  id: string
  title: string
  description?: string
  priority: Priority
  dueDate?: string
  coverColor?: string
  completed: boolean
  position: number
  assignee?: UserSummary
  commentCount: number
  overdue: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  id: string
  content: string
  edited: boolean
  author: UserSummary
  createdAt: string
  updatedAt?: string
}

export interface UserSummary {
  id: string
  username: string
  fullName: string
  avatarUrl?: string
}

export interface TeamMember {
  user: UserSummary
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  joinedAt: string
}

export interface Activity {
  id: string
  user: UserSummary
  action: string
  entityType: string
  entityId: string
  details: string
  createdAt: string
}

export interface ProjectStats {
  totalCards: number
  completedCards: number
  overdueCards: number
  totalColumns: number
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type ProjectRole = 'ADMIN' | 'EDITOR' | 'VIEWER'