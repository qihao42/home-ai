import { useState } from 'react'
import type { PageId } from '../../types'

interface SidebarProps {
  currentPage: PageId
  onNavigate: (page: PageId) => void
}

interface NavItem {
  id: PageId
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'devices', label: 'Devices', icon: '⚙' },
  { id: 'scenes', label: 'Scenes', icon: '🎬' },
  { id: 'automations', label: 'Automations', icon: '⚡' },
  { id: 'history', label: 'History', icon: '⏱' },
  { id: 'orbital', label: 'Orbital', icon: '🔮' },
]

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (page: PageId) => {
    onNavigate(page)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-xl">
          🏠
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">SmartHome</h1>
          <p className="text-xs text-slate-400">Hub</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNav(item.id)}
                  className={`
                    flex w-full items-center gap-3 rounded-lg px-4 py-3
                    text-sm font-medium transition-all duration-150
                    ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700/50 px-6 py-4">
        <p className="text-xs text-slate-500">SmartHome Hub v1.0.0</p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-white shadow-lg md:hidden"
        aria-label="Open menu"
      >
        ☰
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[var(--bg-secondary)] border-r border-slate-700/50
          transform transition-transform duration-200 ease-in-out md:hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 flex-col bg-[var(--bg-secondary)] border-r border-slate-700/50 md:flex">
        {sidebarContent}
      </aside>
    </>
  )
}
