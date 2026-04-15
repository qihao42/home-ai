import { useState, useEffect, useRef } from 'react'
import { useSettingsStore } from '../../stores/settings-store'
import { useTranslation } from '../../i18n/useTranslation'

export function SettingsMenu() {
  const { t } = useTranslation()
  const { language, theme, setLanguage, setTheme } = useSettingsStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Settings"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-56 rounded-xl border border-slate-700 bg-[var(--bg-secondary)] p-3 shadow-xl">
          {/* Language */}
          <div className="mb-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('settings.language')}
            </p>
            <div className="flex rounded-lg border border-slate-700/50 p-0.5">
              <button
                onClick={() => setLanguage('zh')}
                className={`flex-1 rounded py-1.5 text-xs transition ${
                  language === 'zh' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                中文
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`flex-1 rounded py-1.5 text-xs transition ${
                  language === 'en' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
              {t('settings.theme')}
            </p>
            <div className="flex rounded-lg border border-slate-700/50 p-0.5">
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-xs transition ${
                  theme === 'dark' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                🌙 {t('settings.themeDark')}
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-1 items-center justify-center gap-1 rounded py-1.5 text-xs transition ${
                  theme === 'light' ? 'bg-blue-500/20 text-blue-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                ☀️ {t('settings.themeLight')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
