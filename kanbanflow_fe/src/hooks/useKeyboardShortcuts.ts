import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from "sonner" // ✅ Fix

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
        const eventHasCtrl = event.ctrlKey || event.metaKey;
        const eventHasShift = event.shiftKey;
        const eventHasAlt = event.altKey;

        if (matchesKey && 
            (shortcut.ctrlKey === undefined || shortcut.ctrlKey === eventHasCtrl) &&
            (shortcut.shiftKey === undefined || shortcut.shiftKey === eventHasShift) &&
            (shortcut.altKey === undefined || shortcut.altKey === eventHasAlt)
        ) {
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
        toast.info('Shortcut: Create new project pressed')
        // Open create project modal logic here if needed
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
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
        if (searchInput) searchInput.focus()
      },
      description: 'Focus search',
    },
  ])
}