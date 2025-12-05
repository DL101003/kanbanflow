export const PRIORITY_COLORS = {
  LOW: '#52c41a',
  MEDIUM: '#1890ff',
  HIGH: '#fa8c16',
  URGENT: '#f5222d',
} as const

export const DEFAULT_COLUMNS = [
  { name: 'Backlog', color: '#94A3B8' },
  { name: 'To Do', color: '#EF4444' },
  { name: 'In Progress', color: '#F59E0B' },
  { name: 'Review', color: '#8B5CF6' },
  { name: 'Done', color: '#10B981' },
]

export const DATE_FORMAT = 'MMM dd, yyyy'
export const API_DATE_FORMAT = 'yyyy-MM-dd'