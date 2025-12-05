import { format, isAfter, parseISO } from 'date-fns'

export function formatDate(date: string | Date, dateFormat = 'MMM dd, yyyy'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date
  return format(parsedDate, dateFormat)
}

export function isOverdue(dueDate: string | Date | null): boolean {
  if (!dueDate) return false
  const parsedDate = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
  return isAfter(new Date(), parsedDate)
}

export function getInitials(name: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateColor(): string {
  const colors = [
    '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#14B8A6', '#06B6D4'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}