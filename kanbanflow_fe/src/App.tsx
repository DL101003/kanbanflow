import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ConfigProvider, theme } from 'antd'
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import Dashboard from '@/pages/Dashboard'
import BoardView from '@/pages/BoardView'
import Profile from '@/pages/Profile'
import TeamMembers from '@/pages/TeamMembers'
import AppLayout from '@/components/layout/AppLayout'

function AppContent() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const { isDarkMode } = useTheme()
  
  useGlobalShortcuts()

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
        },
      }}
    >
      <div className={isDarkMode ? 'dark' : ''}>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
          
          <Route element={isAuthenticated ? <AppLayout /> : <Navigate to="/login" />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects/:projectId" element={<BoardView />} />
            <Route path="/projects/:projectId/team" element={<TeamMembers />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </div>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
        <Toaster position="top-right" />
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App