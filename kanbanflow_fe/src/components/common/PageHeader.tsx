import { Button, Breadcrumb, Typography } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title } = Typography

interface PageHeaderProps {
  title: string
  breadcrumbs?: Array<{ title: string; path?: string }>
  actions?: React.ReactNode
}

export default function PageHeader({ title, breadcrumbs = [], actions }: PageHeaderProps) {
  return (
    <div className="bg-white p-6 border-b mb-6">
      <div className="flex justify-between items-start">
        <div>
          <Breadcrumb className="mb-4">
            <Breadcrumb.Item>
              <Link to="/">
                <HomeOutlined /> Home
              </Link>
            </Breadcrumb.Item>
            {breadcrumbs.map((item, index) => (
              <Breadcrumb.Item key={index}>
                {item.path ? <Link to={item.path}>{item.title}</Link> : item.title}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <Title level={2} className="!mb-0">
            {title}
          </Title>
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </div>
  )
}