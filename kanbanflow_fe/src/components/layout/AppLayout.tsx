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
import ShortcutsModal from '@/components/common/ShortcutsModal'

const { Header, Content, Sider } = Layout
const { Text } = Typography

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

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
        key: 'settings',
        icon: <SettingOutlined />,
        label: 'Settings',
      },
      {
        type: 'divider',
      },
      {
        key: 'shortcuts',
        icon: <QuestionCircleOutlined />,
        label: 'Keyboard Shortcuts',
        onClick: () => setShortcutsOpen(true),
      },
      {
        type: 'divider',
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  }

  const sidebarMenu = [
    {
      key: '/',
      icon: <ProjectOutlined />,
      label: <Link to="/">Projects</Link>,
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Profile</Link>,
    },
  ]

  // Add team menu if in project
  const projectId = location.pathname.match(/\/projects\/([^\/]+)/)?.[1]
  if (projectId) {
    sidebarMenu.push({
      key: `/projects/${projectId}/team`,
      icon: <TeamOutlined />,
      label: <Link to={`/projects/${projectId}/team`}>Team Members</Link>,
    })
  }

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white dark:bg-gray-800 border-b px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Text strong className="text-xl">KanbanFlow</Text>
        </div>
        
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          <Badge count={5}>
            <Button type="text" icon={<BellOutlined />} />
          </Badge>
          
          <Dropdown menu={userMenu} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} className="mr-2" />
              <Text>{user?.fullName}</Text>
            </div>
          </Dropdown>
        </div>
      </Header>
      
      <Layout>
        <Sider width={200} className="bg-white dark:bg-gray-800">
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="h-full border-r-0"
            items={sidebarMenu}
          />
        </Sider>
        
        <Layout className="p-6">
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
      
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </Layout>
  )
}