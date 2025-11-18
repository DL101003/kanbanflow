import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { message } from 'antd'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const matchesCtrl = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : true
        const matchesShift = shortcut.shiftKey ? event.shiftKey : true
        const matchesAlt = shortcut.altKey ? event.altKey : true

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          event.preventDefault()
          shortcut.action()
        }
      })
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [shortcuts])
}

// Global shortcuts
export function useGlobalShortcuts() {
  const navigate = useNavigate()

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrlKey: true,
      action: () => {
        message.info('Create new project')
        // Open create project modal
      },
      description: 'New project',
    },
    {
      key: 'h',
      ctrlKey: true,
      action: () => navigate('/'),
      description: 'Go to home',
    },
    {
      key: 'p',
      ctrlKey: true,
      action: () => navigate('/profile'),
      description: 'Go to profile',
    },
    {
      key: '/',
      ctrlKey: true,
      action: () => {
        // Focus search
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) searchInput.focus()
      },
      description: 'Focus search',
    },
  ])
}