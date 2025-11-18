import { useEffect, useState } from 'react'
import { Input, Select, Button, Space } from 'antd'
import { SearchOutlined, FilterOutlined } from '@ant-design/icons'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (query: string, filters: SearchFilters) => void
}

interface SearchFilters {
  priority?: string
  completed?: boolean
  assigneeId?: string
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<SearchFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedQuery = useDebounce(query, 500)

  useEffect(() => {
    onSearch(debouncedQuery, filters)
  }, [debouncedQuery, filters])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Space direction="vertical" className="w-full">
        <div className="flex gap-2">
          <Input
            placeholder="Search cards..."
            prefix={<SearchOutlined />}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="flex gap-2">
            <Select
              placeholder="Priority"
              allowClear
              className="w-32"
              onChange={(value) => setFilters({ ...filters, priority: value })}
            >
              <Select.Option value="LOW">Low</Select.Option>
              <Select.Option value="MEDIUM">Medium</Select.Option>
              <Select.Option value="HIGH">High</Select.Option>
              <Select.Option value="URGENT">Urgent</Select.Option>
            </Select>

            <Select
              placeholder="Status"
              allowClear
              className="w-32"
              onChange={(value) => setFilters({ ...filters, completed: value })}
            >
              <Select.Option value={false}>In Progress</Select.Option>
              <Select.Option value={true}>Completed</Select.Option>
            </Select>
          </div>
        )}
      </Space>
    </div>
  )
}