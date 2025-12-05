import { Download, FileText, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { projectsApi } from '@/api/projects.api'
import { toast } from "sonner"

interface ExportButtonProps {
  projectId: string
}

export default function ExportButton({ projectId }: ExportButtonProps) {
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await projectsApi.exportProject(projectId, format)
      
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success(`Project exported as ${format.toUpperCase()}`)
    } catch (error) {
      toast.error('Export failed')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" /> Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('csv')}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          <FileText className="mr-2 h-4 w-4" /> Export as JSON
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 