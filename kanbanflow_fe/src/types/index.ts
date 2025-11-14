export interface User {
  id: string
  username: string
  email: string
  fullName: string
  avatarUrl?: string
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

export interface BoardColumn {
  id: string
  name: string
  color?: string
  position: number
  cardLimit?: number
  cardCount: number
  cards?: Card[]
}

export interface Card {
  id: string
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: string
  coverColor?: string
  completed: boolean
  position: number
  assignee?: UserSummary
  commentCount: number
  overdue: boolean
}

export interface Comment {
  id: string
  content: string
  edited: boolean
  author: UserSummary
  createdAt: string
}

export interface UserSummary {
  id: string
  username: string
  fullName: string
  avatarUrl?: string
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'