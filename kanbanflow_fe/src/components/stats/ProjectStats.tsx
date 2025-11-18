import { Card, Statistic, Row, Col } from 'antd'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ProjectOutlined,
} from '@ant-design/icons'

interface ProjectStatsProps {
  totalCards: number
  completedCards: number
  overdueCards: number
  totalColumns: number
}

export default function ProjectStats({
  totalCards,
  completedCards,
  overdueCards,
  totalColumns,
}: ProjectStatsProps) {
  const completionRate = totalCards > 0 ? Math.round((completedCards / totalCards) * 100) : 0

  return (
    <Row gutter={16} className="mb-6">
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Total Tasks"
            value={totalCards}
            prefix={<ProjectOutlined />}
            valueStyle={{ color: '#3f8600' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Completed"
            value={completedCards}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
            suffix={`/ ${totalCards}`}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Overdue"
            value={overdueCards}
            prefix={<ExclamationCircleOutlined />}
            valueStyle={{ color: overdueCards > 0 ? '#cf1322' : '#8c8c8c' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Card>
          <Statistic
            title="Completion"
            value={completionRate}
            prefix={<ClockCircleOutlined />}
            suffix="%"
            valueStyle={{ color: completionRate >= 75 ? '#52c41a' : '#1890ff' }}
          />
        </Card>
      </Col>
    </Row>
  )
}