import { useEffect, useState } from 'react'
import { Input, Select, Button, Space, Tag } from 'antd'
import { SearchOutlined, FilterOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom' // ✅ Dùng cái này thay vì local state
import { useDebounce } from '@/hooks/useDebounce'

interface SearchBarProps {
  onSearch: (query: string, filters: any) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  // 1. Hook quản lý URL params
  const [searchParams, setSearchParams] = useSearchParams()
  
  // 2. Local state chỉ dùng để UI phản hồi nhanh (input typing)
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  
  // Debounce việc set URL để tránh spam history browser
  const debouncedQuery = useDebounce(localQuery, 500)

  // 3. Effect: Khi debounced value đổi -> Update URL
  useEffect(() => {
    setSearchParams(prev => {
      if (debouncedQuery) prev.set('q', debouncedQuery)
      else prev.delete('q')
      return prev
    }, { replace: true })
  }, [debouncedQuery, setSearchParams])

  // 4. Effect: Khi URL thay đổi -> Gọi callback onSearch để cha load lại data
  useEffect(() => {
    const query = searchParams.get('q') || ''
    const filters = {
      priority: searchParams.get('priority') || undefined,
      completed: searchParams.get('completed') === 'true' ? true : 
                 searchParams.get('completed') === 'false' ? false : undefined,
    }
    onSearch(query, filters)
  }, [searchParams])

  // Helpers để update filter
  const updateFilter = (key: string, value: any) => {
    setSearchParams(prev => {
      if (value !== undefined && value !== null) {
        prev.set(key, String(value))
      } else {
        prev.delete(key)
      }
      return prev
    })
  }

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'q').length

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 border border-gray-100">
      <Space direction="vertical" className="w-full">
        <div className="flex gap-2">
          <Input
            placeholder="Search cards by title..."
            prefix={<SearchOutlined className="text-gray-400" />}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            allowClear
            className="flex-1"
          />
          <Button
            icon={<FilterOutlined />}
            type={showFilters || activeFiltersCount > 0 ? 'primary' : 'default'}
            ghost={!showFilters && activeFiltersCount > 0}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>
          
          {/* Nút Clear All nếu có filter */}
          {(activeFiltersCount > 0 || localQuery) && (
             <Button 
                icon={<CloseCircleOutlined />} 
                danger 
                type="text"
                onClick={() => {
                    setLocalQuery('')
                    setSearchParams({})
                }}
             >
                Clear
             </Button>
          )}
        </div>

        {/* Filter Panel - Expandable */}
        {showFilters && (
          <div className="flex gap-4 p-4 bg-gray-50 rounded mt-2 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Priority</span>
                <Select
                  placeholder="Any Priority"
                  allowClear
                  className="w-40"
                  value={searchParams.get('priority')}
                  onChange={(val) => updateFilter('priority', val)}
                >
                  <Select.Option value="LOW"><Tag color="green">Low</Tag></Select.Option>
                  <Select.Option value="MEDIUM"><Tag color="blue">Medium</Tag></Select.Option>
                  <Select.Option value="HIGH"><Tag color="orange">High</Tag></Select.Option>
                  <Select.Option value="URGENT"><Tag color="red">Urgent</Tag></Select.Option>
                </Select>
            </div>

            <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-gray-500 uppercase">Status</span>
                <Select
                  placeholder="Any Status"
                  allowClear
                  className="w-40"
                  value={searchParams.get('completed') === 'true' ? true : searchParams.get('completed') === 'false' ? false : undefined}
                  onChange={(val) => updateFilter('completed', val)}
                >
                  <Select.Option value={false}>In Progress</Select.Option>
                  <Select.Option value={true}>Completed</Select.Option>
                </Select>
            </div>
          </div>
        )}
      </Space>
    </div>
  )
}