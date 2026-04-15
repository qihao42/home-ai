import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'en' | 'zh'
export type Theme = 'dark' | 'light'

interface SettingsStore {
  language: Language
  theme: Theme
  setLanguage: (lang: Language) => void
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

// Detect browser defaults
function detectLanguage(): Language {
  if (typeof navigator === 'undefined') return 'zh'
  const langs = [navigator.language, ...(navigator.languages ?? [])]
  for (const l of langs) {
    if (l.toLowerCase().startsWith('zh')) return 'zh'
    if (l.toLowerCase().startsWith('en')) return 'en'
  }
  return 'zh'
}

function detectTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  if (window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light'
  return 'dark'
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      language: detectLanguage(),
      theme: detectTheme(),
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
    }),
    { name: 'homeai-settings' }
  )
)
