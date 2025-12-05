import { Switch } from "@/components/ui/switch"
import { Moon, Sun } from "lucide-react"
import { useTheme } from '@/hooks/useTheme'
import { useEffect } from 'react'

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(isDarkMode ? "dark" : "light")
  }, [isDarkMode])

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4 text-muted-foreground" />
      <Switch 
        checked={isDarkMode} 
        onCheckedChange={toggleTheme} 
      />
      <Moon className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}