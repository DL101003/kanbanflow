import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  Button,
  Empty,
  Spin,
  Modal,
  Form,
  Input,
  ColorPicker,
  Row,
  Col,
  Typography,
  Dropdown,
  message,
} from 'antd'
import {
  PlusOutlined,
  StarOutlined,
  StarFilled,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { projectsApi } from '@/api/projects.api'
import type { Project } from '@/types'

const { Title, Paragraph } = Typography
const { TextArea } = Input

interface CreateProjectFormValues {
  name: string;
  description?: string;
  color?: string | { toHexString: () => string };
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form] = Form.useForm()
  const [editModal, setEditModal] = useState({ open: false, project: null })
  const [editForm] = Form.useForm()

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ['projects'] })
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getProjects(),
  })

  const createMutation = useMutation({
    mutationFn: projectsApi.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      message.success('Project created successfully')
      setIsModalOpen(false)
      form.resetFields()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: projectsApi.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      message.success('Project deleted')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      message.success('Project updated successfully')
    },
  })


  const toggleFavoriteMutation = useMutation({
    mutationFn: projectsApi.toggleFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })

  const handleCreateProject = (values: CreateProjectFormValues) => {
    let colorValue = '#3B82F6'

    if (values.color) {
      if (typeof values.color === 'object' && values.color.toHexString) {
        // Lấy hex color và cắt bỏ alpha channel
        const hexColor = values.color.toHexString()
        // Chỉ lấy 7 ký tự đầu (#RRGGBB)
        colorValue = hexColor.substring(0, 7)
      } else if (typeof values.color === 'string') {
        // Nếu đã là string, đảm bảo chỉ có 7 ký tự
        colorValue = values.color.substring(0, 7)
      }
    }

    createMutation.mutate({
      name: values.name,
      description: values.description,
      color: colorValue,
    })
  }

  const handleEditProject = (project: Project) => {
    setEditModal({ open: true, project })
    editForm.setFieldsValue({
      name: project.name,
      description: project.description,
      color: project.color,
    })
  }

  const handleUpdateProject = (values: any) => {
    if (editModal.project) {
      updateMutation.mutate({
        id: editModal.project.id,
        data: {
          name: values.name,
          description: values.description,
          color: values.color?.substring(0, 7) || editModal.project.color,
        },
      })
      setEditModal({ open: false, project: null })
    }
  }

  const handleDeleteProject = (project: Project, event?: React.MouseEvent) => {
    // Stop event propagation để không navigate vào project
    if (event) {
      event.stopPropagation()
    }

    Modal.confirm({
      title: 'Delete Project',
      content: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: () => {
        deleteMutation.mutate(project.id)
      },
    })
  }

  const getProjectMenu = (project: Project) => ({
    items: [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: 'Edit',
        onClick: (e: any) => {
          e.domEvent.stopPropagation() // Prevent navigation
          handleEditProject(project)
        },
      },
      {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: (menuInfo: any) => {
        menuInfo.domEvent.stopPropagation()
        handleDeleteProject(project)
      },
    },
    ],
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    )
  }

  const projects = data?.content || []

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <Title level={2}>My Projects</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <Empty
            description="No projects yet"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" onClick={() => setIsModalOpen(true)}>
              Create First Project
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {projects.map((project: Project) => (
            <Col key={project.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => navigate(`/projects/${project.id}`)}
                className="h-full"
                actions={[
                  <Button
                    type="text"
                    icon={project.favorite ? <StarFilled /> : <StarOutlined />}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavoriteMutation.mutate(project.id)
                    }}
                    className={project.favorite ? 'text-yellow-500' : ''}
                  />,
                  <Dropdown menu={getProjectMenu(project)} trigger={['click']}>
                    <Button
                      type="text"
                      icon={<MoreOutlined />}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>,
                ]}
              >
                <div className="mb-4">
                  <div
                    className="w-full h-2 rounded mb-4"
                    style={{ backgroundColor: project.color }}
                  />
                  <Title level={4}>{project.name}</Title>
                  {project.description && (
                    <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                      {project.description}
                    </Paragraph>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Create New Project"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Enter project description (optional)"
            />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
          >
            <ColorPicker defaultValue="#3B82F6" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending}
              block
            >
              Create Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Project"
        open={editModal.open}
        onCancel={() => setEditModal({ open: false, project: null })}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProject}
        >
          <Form.Item
            name="name"
            label="Project Name"
            rules={[{ required: true, message: 'Please enter project name' }]}
          >
            <Input placeholder="Enter project name" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} placeholder="Enter project description" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" block>
              Update Project
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}