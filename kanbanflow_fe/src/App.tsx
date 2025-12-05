import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/sonner"
import { useAuthStore } from '@/store/authStore'
import { useTheme } from '@/hooks/useTheme'
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'
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
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default App