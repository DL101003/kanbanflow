import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

export function formatDate(date: string | Date, dateFormat = 'MMM DD, YYYY'): string {
  return dayjs(date).format(dateFormat)
}

export function isOverdue(dueDate: string | Date | null): boolean {
  if (!dueDate) return false
  return dayjs().isAfter(dayjs(dueDate), 'day')
}

export function fromNow(date: string | Date): string {
  return dayjs(date).fromNow()
}

export function getInitials(name: string): string {
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