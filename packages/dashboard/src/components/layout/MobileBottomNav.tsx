import type { PageId } from '../../types'

interface MobileBottomNavProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Home', icon: '⊞' },
  { id: 'devices', label: 'Devices', icon: '⚙' },
  { id: 'scenes', label: 'Scenes', icon: '🎬' },
  { id: 'orbital', label: 'Orbital', icon: '🔮' },
  { id: 'history', label: 'History', icon: '⏱' },
]

export function MobileBottomNav({ currentPage, onNavigate }: MobileBottomNavProps) {
  const handleNav = (page: PageId) => {
    // Subtle haptic feedback on supporting devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate?.(8)
    }
    onNavigate(page)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch justify-around border-t border-slate-700/50 bg-[var(--bg-secondary)]/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
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
              isActive ? 'text-blue-400' : 'text-slate-400 active:text-slate-200'
            }`}
          >
            <span className={`text-xl transition-transform ${isActive ? 'scale-110' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
