import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDarkMode: boolean
  toggleTheme: () => void
  setTheme: (dark: boolean) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setTheme: (dark: boolean) => set({ isDarkMode: dark }),
    }),
    {
      name: 'theme-storage',
    }
  )
)