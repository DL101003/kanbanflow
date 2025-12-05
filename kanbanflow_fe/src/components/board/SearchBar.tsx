import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, Filter, X, Check } from 'lucide-react' // Icons
import { useDebounce } from '@/hooks/useDebounce'

// Shadcn
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

interface SearchBarProps {
  onSearch: (query: string, filters: any) => void
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [localQuery, setLocalQuery] = useState(searchParams.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  
  const debouncedQuery = useDebounce(localQuery, 500)

  useEffect(() => {
    setSearchParams(prev => {
      if (debouncedQuery) prev.set('q', debouncedQuery)
      else prev.delete('q')
      return prev
    }, { replace: true })
  }, [debouncedQuery, setSearchParams])

  useEffect(() => {
    const query = searchParams.get('q') || ''
    const filters = {
      priority: searchParams.get('priority') || undefined,
      completed: searchParams.get('completed') === 'true' ? true : 
                 searchParams.get('completed') === 'false' ? false : undefined,
    }
    onSearch(query, filters)
  }, [searchParams, onSearch])

  const updateFilter = (key: string, value: string | null) => {
    setSearchParams(prev => {
      if (value) prev.set(key, value)
      else prev.delete(key)
      return prev
    })
  }

  const activeFiltersCount = Array.from(searchParams.keys()).filter(k => k !== 'q').length

  return (
    <div className="bg-card p-4 rounded-lg shadow-sm mb-4 border">
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters || activeFiltersCount > 0 ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activeFiltersCount}</Badge>}
          </Button>
          
          {(activeFiltersCount > 0 || localQuery) && (
             <Button 
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => {
                    setLocalQuery('')
                    setSearchParams({})
                }}
             >
                <X className="h-4 w-4" />
             </Button>
          )}
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-md border animate-in fade-in slide-in-from-top-1">
            <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Priority</span>
                <Select
                  value={searchParams.get('priority') || "all"}
                  onValueChange={(val) => updateFilter('priority', val === "all" ? null : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Status</span>
                <Select
                  value={searchParams.get('completed') === 'true' ? "completed" : searchParams.get('completed') === 'false' ? "progress" : "all"}
                  onValueChange={(val) => {
                     const value = val === "completed" ? "true" : val === "progress" ? "false" : null;
                     updateFilter('completed', value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}