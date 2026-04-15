import type { PageId } from '../../types'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'

interface MobileBottomNavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  labelKey: TranslationKey
  icon: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.home', icon: '⊞' },
  { id: 'devices', labelKey: 'nav.devices', icon: '⚙' },
  { id: 'scenes', labelKey: 'nav.scenes', icon: '🎬' },
  { id: 'orbital', labelKey: 'nav.orbital', icon: '🔮' },
  { id: 'features', labelKey: 'nav.features', icon: '✨' },
]

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const { t } = useTranslation()

  const handleNav = (page: PageId) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(8)
    }
    onNavigate(page)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t backdrop-blur md:hidden"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-secondary) 95%, transparent)',
        borderColor: 'var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Primary navigation"
    >
      {navItems.map((item) => {
        const isActive = currentPage === item.id
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-blue-400' : 'active:opacity-80'
            }`}
            style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
          >
            <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span>{t(item.labelKey)}</span>
          </button>
        )
      })}
    </nav>
  )
}
