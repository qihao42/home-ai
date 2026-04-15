import type { PageId } from '../../types'
import { useTranslation } from '../../i18n/useTranslation'
import type { TranslationKey } from '../../i18n/translations'

interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  labelKey: TranslationKey
  icon: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: '⊞' },
  { id: 'devices', labelKey: 'nav.devices', icon: '⚙' },
  { id: 'scenes', labelKey: 'nav.scenes', icon: '🎬' },
  { id: 'automations', labelKey: 'nav.automations', icon: '⚡' },
  { id: 'history', labelKey: 'nav.history', icon: '⏱' },
  { id: 'orbital', labelKey: 'nav.orbital', icon: '🔮' },
  { id: 'features', labelKey: 'nav.features', icon: '✨' },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { t } = useTranslation()

  return (
    <aside
      className="hidden h-screen w-64 flex-col border-r md:flex"
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
          🏠
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            HomeAI
          </h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Hub</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-150 ${
                    isActive ? 'bg-blue-500/15 text-blue-400' : 'hover:bg-slate-700/30'
                  }`}
                  style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{t(item.labelKey)}</span>
                  {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t px-6 py-4" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>HomeAI Hub v1.0.0</p>
      </div>
    </aside>
  )
}
