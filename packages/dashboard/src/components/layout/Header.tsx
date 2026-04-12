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
}

export function Header({ currentPage, connected }: HeaderProps) {
  const entityCount = useEntityStore((s) => Object.keys(s.entities).length)

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-700/50 bg-[var(--bg-secondary)] px-8">
      <h2 className="text-xl font-semibold text-white">
        {pageTitles[currentPage]}
      </h2>

      <div className="flex items-center gap-6">
        {/* Entity count */}
        <div className="text-sm text-slate-400">
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
          <span className="text-sm text-slate-400">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
    </header>
  )
}
