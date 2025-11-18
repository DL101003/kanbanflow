import { useState } from 'react'
import { Card, Form, Input, Button, Avatar, Upload, message, Tabs } from 'antd'
import { UserOutlined, UploadOutlined, SaveOutlined } from '@ant-design/icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import PageHeader from '@/components/common/PageHeader'
import { authApi } from '@/api/auth.api'
import { useAuthStore } from '@/store/authStore'

const { TabPane } = Tabs

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()

  const { data: currentUser, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getMe,
  })

  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      updateUser(data)
      message.success('Profile updated successfully')
    },
  })

  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      message.success('Password changed successfully')
      passwordForm.resetFields()
    },
  })

  const handleProfileUpdate = (values: any) => {
    updateProfileMutation.mutate(values)
  }

  const handlePasswordChange = (values: any) => {
    changePasswordMutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    })
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        breadcrumbs={[{ title: 'Profile' }]}
      />

      <div className="max-w-4xl mx-auto">
        <Card loading={isLoading}>
          <div className="flex items-center mb-6">
            <Avatar size={100} icon={<UserOutlined />} className="mr-4">
              {currentUser?.fullName[0]}
            </Avatar>
            <div>
              <h2 className="text-2xl font-semibold">{currentUser?.fullName}</h2>
              <p className="text-gray-500">@{currentUser?.username}</p>
            </div>
          </div>

          <Tabs defaultActiveKey="1">
            <TabPane tab="General" key="1">
              <Form
                form={form}
                layout="vertical"
                initialValues={currentUser}
                onFinish={handleProfileUpdate}
              >
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Please enter valid email' },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="username"
                  label="Username"
                  rules={[{ required: true, message: 'Please enter username' }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SaveOutlined />}
                    loading={updateProfileMutation.isPending}
                  >
                    Save Changes
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="Security" key="2">
              <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
              >
                <Form.Item
                  name="currentPassword"
                  label="Current Password"
                  rules={[{ required: true, message: 'Please enter current password' }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="newPassword"
                  label="New Password"
                  rules={[
                    { required: true, message: 'Please enter new password' },
                    { min: 6, message: 'Password must be at least 6 characters' },
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  name="confirmPassword"
                  label="Confirm New Password"
                  dependencies={['newPassword']}
                  rules={[
                    { required: true, message: 'Please confirm password' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve()
                        }
                        return Promise.reject('Passwords do not match')
                      },
                    }),
                  ]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={changePasswordMutation.isPending}
                  >
                    Change Password
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}