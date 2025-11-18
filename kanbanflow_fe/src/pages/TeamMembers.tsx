import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Avatar,
  Tag,
  Space,
  message,
  Popconfirm,
} from 'antd'
import { UserAddOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import PageHeader from '@/components/common/PageHeader'
import { projectsApi } from '@/api/projects.api'

interface TeamMember {
  user: {
    id: string
    username: string
    email: string
    fullName: string
    avatarUrl?: string
  }
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER'
  joinedAt: string
}

const roleColors = {
  OWNER: 'purple',
  ADMIN: 'red',
  EDITOR: 'blue',
  VIEWER: 'green',
}

export default function TeamMembers() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()

  const { data: members, isLoading } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => projectsApi.getProjectMembers(projectId!),
    enabled: !!projectId,
  })

  const addMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) =>
      projectsApi.addProjectMember(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      message.success('Member added successfully')
      setIsModalOpen(false)
      form.resetFields()
    },
    onError: () => {
      message.error('Failed to add member')
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      projectsApi.updateMemberRole(projectId!, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      message.success('Role updated')
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] })
      message.success('Member removed')
    },
  })

  const columns = [
    {
      title: 'User',
      key: 'user',
      render: (member: TeamMember) => (
        <Space>
          <Avatar icon={<UserOutlined />}>{member.user.fullName[0]}</Avatar>
          <div>
            <div className="font-semibold">{member.user.fullName}</div>
            <div className="text-xs text-gray-500">{member.user.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Role',
      key: 'role',
      render: (member: TeamMember) =>
        member.role === 'OWNER' ? (
          <Tag color={roleColors[member.role]}>Owner</Tag>
        ) : (
          <Select
            value={member.role}
            onChange={(value) => updateRoleMutation.mutate({ userId: member.user.id, role: value })}
            className="w-32"
          >
            <Select.Option value="ADMIN">Admin</Select.Option>
            <Select.Option value="EDITOR">Editor</Select.Option>
            <Select.Option value="VIEWER">Viewer</Select.Option>
          </Select>
        ),
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (member: TeamMember) =>
        member.role !== 'OWNER' && (
          <Popconfirm
            title="Remove member?"
            description="Are you sure you want to remove this member?"
            onConfirm={() => removeMemberMutation.mutate(member.user.id)}
            okText="Remove"
            okType="danger"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Team Members"
        breadcrumbs={[
          { title: 'Projects', path: '/' },
          { title: 'Team Members' },
        ]}
        actions={
          <Button type="primary" icon={<UserAddOutlined />} onClick={() => setIsModalOpen(true)}>
            Add Member
          </Button>
        }
      />

      <Table
        columns={columns}
        dataSource={members}
        loading={isLoading}
        rowKey={(member) => member.user.id}
      />

      <Modal
        title="Add Team Member"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={addMemberMutation.mutate}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter valid email' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
            initialValue="VIEWER"
          >
            <Select>
              <Select.Option value="ADMIN">Admin</Select.Option>
              <Select.Option value="EDITOR">Editor</Select.Option>
              <Select.Option value="VIEWER">Viewer</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={addMemberMutation.isPending}
              block
            >
              Add Member
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}