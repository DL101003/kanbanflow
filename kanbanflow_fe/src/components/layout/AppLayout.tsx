import { Outlet, useNavigate } from 'react-router-dom'
import { Layout, Menu, Avatar, Dropdown, Typography, Button } from 'antd'
import {
  ProjectOutlined,
  LogoutOutlined,
  UserOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { useAuthStore } from '@/store/authStore'

const { Header, Content, Sider } = Layout
const { Text } = Typography

export default function AppLayout() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

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

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white border-b px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Text strong className="text-xl">KanbanFlow</Text>
        </div>
        
        <Dropdown menu={userMenu} placement="bottomRight">
          <div className="flex items-center cursor-pointer">
            <Avatar icon={<UserOutlined />} className="mr-2" />
            <Text>{user?.fullName}</Text>
          </div>
        </Dropdown>
      </Header>
      
      <Layout>
        <Content className="p-6">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}