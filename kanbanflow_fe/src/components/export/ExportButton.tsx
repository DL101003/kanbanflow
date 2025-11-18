import { Button, Dropdown, message } from 'antd'
import { DownloadOutlined, FileTextOutlined, FileExcelOutlined } from '@ant-design/icons'
import { projectsApi } from '@/api/projects.api'

interface ExportButtonProps {
  projectId: string
}

export default function ExportButton({ projectId }: ExportButtonProps) {
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const data = await projectsApi.exportProject(projectId, format)
      
      // Create download link
      const blob = new Blob([format === 'csv' ? data : JSON.stringify(data, null, 2)], {
        type: format === 'csv' ? 'text/csv' : 'application/json',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `project-export.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
      
      message.success(`Project exported as ${format.toUpperCase()}`)
    } catch (error) {
      message.error('Export failed')
    }
  }

  const menu = {
    items: [
      {
        key: 'csv',
        icon: <FileExcelOutlined />,
        label: 'Export as CSV',
        onClick: () => handleExport('csv'),
      },
      {
        key: 'json',
        icon: <FileTextOutlined />,
        label: 'Export as JSON',
        onClick: () => handleExport('json'),
      },
    ],
  }

  return (
    <Dropdown menu={menu}>
      <Button icon={<DownloadOutlined />}>Export</Button>
    </Dropdown>
  )
}