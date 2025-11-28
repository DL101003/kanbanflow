import { useState } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Button, Badge } from 'antd'
import {
  ProjectOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'
import ThemeToggle from './ThemeToggle'

const { Header, Content, Sider } = Layout
const { Text } = Typography

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'Profile',
        onClick: () => navigate('/profile'),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
        danger: true,
      },
    ],
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white dark:bg-gray-800 border-b px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Text strong className="text-xl">KanbanFlow</Text>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Dropdown menu={userMenu} placement="bottomRight" trigger={['click']}>
            <Button type="text" className="flex items-center">
              <Avatar icon={<UserOutlined />} className="mr-2" />
              <Text>{user?.fullName || user?.username}</Text>
            </Button>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}