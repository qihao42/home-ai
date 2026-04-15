import { useEntityStore } from '../../stores/entity-store'
import type { PageId } from '../../types'

interface HeaderProps {
  currentPage: PageId
  connected: boolean
}

const pageTitles: Record<PageId, string> = {
  dashboard: 'Dashboard',
  devices: 'Devices',
  scenes: 'Scenes',
  automations: 'Automations',
  history: 'History',
  orbital: 'Orbital LED Sphere',
}

export function Header({ currentPage, connected }: HeaderProps) {
  const entityCount = useEntityStore((s) => Object.keys(s.entities).length)

  return (
    <header
      className="flex h-16 items-center justify-between gap-3 border-b border-slate-700/50 bg-[var(--bg-secondary)] px-4 md:px-8"
      style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xl md:hidden">🏠</span>
        <h2 className="text-base font-semibold text-white truncate md:text-xl">
          {pageTitles[currentPage]}
        </h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
        {/* Entity count - hidden on small screens */}
        <div className="hidden sm:block text-sm text-slate-400">
          <span className="font-medium text-slate-300">{entityCount}</span>
          {' '}entities
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
              connected
                ? 'bg-green-400 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
                : 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span className="text-xs text-slate-400 md:text-sm">
            {connected ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  )
}
