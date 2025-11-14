import { Link, useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const { Title, Text } = Typography

export default function Login() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const loginMutation = useMutation({
    mutationFn: (values: { username: string; password: string }) =>
      authApi.login(values.username, values.password),
    onSuccess: (data) => {
      login(data)
      message.success('Login successful!')
      navigate('/')
    },
    onError: () => {
      message.error('Invalid credentials')
    },
  })

  const onFinish = (values: { username: string; password: string }) => {
    loginMutation.mutate(values)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <Title level={2}>Welcome to KanbanFlow</Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: 'Please input your username or email!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Username or Email" 
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              className="w-full"
              loading={loginMutation.isPending}
            >
              Sign In
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text>
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500">
                Sign up
              </Link>
            </Text>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-4 bg-blue-50 rounded">
            <Text type="secondary">
              Demo: username: <strong>demo</strong>, password: <strong>Demo123!@#</strong>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  )
}