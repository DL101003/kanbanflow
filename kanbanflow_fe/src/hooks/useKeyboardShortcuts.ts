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
      if (!event.key) return;
      shortcuts.forEach((shortcut) => {

        if (!shortcut || !shortcut.key) return;
        const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase()

        const requiresCtrl = shortcut.ctrlKey ?? false;
        const requiresShift = shortcut.shiftKey ?? false;
        const requiresAlt = shortcut.altKey ?? false;

        const eventHasCtrl = event.ctrlKey || event.metaKey;
        const eventHasShift = event.shiftKey;
        const eventHasAlt = event.altKey;

        const matchesCtrl = requiresCtrl === eventHasCtrl;
        const matchesShift = requiresShift === eventHasShift;
        const matchesAlt = requiresAlt === eventHasAlt;

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