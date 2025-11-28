import { Switch, ConfigProvider, theme } from 'antd'
import { SunOutlined, MoonOutlined } from '@ant-design/icons'
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    // Apply dark class to HTML element
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
      document.body.style.backgroundColor = '#1f2937'
    } else {
      document.documentElement.classList.remove('dark')
      document.body.style.backgroundColor = '#f9fafb'
    }
  }, [isDarkMode])

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <Switch
        checked={isDarkMode}
        onChange={toggleTheme}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
        style={{ backgroundColor: isDarkMode ? '#4b5563' : '#3b82f6' }}
      />
    </ConfigProvider>
  )
}