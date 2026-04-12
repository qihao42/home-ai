import { useMemo, useState } from 'react'
import { useEntityStore } from '../stores/entity-store'
import { StatusBadge } from '../components/common/StatusBadge'
import { getEntityIcon } from '../utils/entity-icon'
import { formatTimestamp } from '../utils/format-value'

type ViewMode = 'table' | 'grid'

export function DevicesPage() {
  const entities = useEntityStore((s) => s.entities)
  const loading = useEntityStore((s) => s.loading)
  const [filter, setFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')

  const entityList = useMemo(() => {
    let list = Object.values(entities)

    if (domainFilter !== 'all') {
      list = list.filter((e) => e.domain === domainFilter)
    }

    if (filter) {
      const lower = filter.toLowerCase()
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(lower) ||
          e.entityId.toLowerCase().includes(lower)
      )
    }

    return list.sort((a, b) => a.name.localeCompare(b.name))
  }, [entities, filter, domainFilter])

  const domains = useMemo(() => {
    const set = new Set(Object.values(entities).map((e) => e.domain))
    return Array.from(set).sort()
  }, [entities])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span>Loading devices...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search devices..."
          className="input-field max-w-xs"
        />

        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          className="select-field w-auto"
        >
          <option value="all">All domains</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="ml-auto flex rounded-lg border border-slate-700 bg-slate-800">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 text-sm transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-500/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Grid
          </button>
        </div>

        <span className="text-sm text-slate-400">
          {entityList.length} device{entityList.length !== 1 ? 's' : ''}
        </span>
      </div>

      {entityList.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-slate-500">
          No devices match your filter.
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-hidden rounded-xl border border-slate-700/50">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700/50 bg-[var(--bg-secondary)]">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Device
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Domain
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  State
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Room
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {entityList.map((entity) => {
                const icon = getEntityIcon(entity.domain, entity.state)
                return (
                  <tr
                    key={entity.entityId}
                    className="bg-[var(--bg-card)] transition-colors hover:bg-slate-700/30"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{icon}</span>
                        <div>
                          <p className="font-medium text-white">{entity.name}</p>
                          <p className="text-xs text-slate-500">{entity.entityId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-slate-700/50 px-2 py-0.5 text-xs text-slate-300">
                        {entity.domain}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        variant={
                          entity.state === 'on' || entity.state === 'heat' || entity.state === 'cool'
                            ? 'online'
                            : entity.state === 'off'
                              ? 'offline'
                              : 'active'
                        }
                        label={entity.state}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400">
                      {(entity.attributes.room as string) ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatTimestamp(entity.lastUpdated)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {entityList.map((entity) => {
            const icon = getEntityIcon(entity.domain, entity.state)
            return (
              <div key={entity.entityId} className="card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50 text-xl">
                    {icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-white">{entity.name}</p>
                    <p className="truncate text-xs text-slate-500">{entity.entityId}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge
                    variant={
                      entity.state === 'on' ? 'online' : entity.state === 'off' ? 'offline' : 'active'
                    }
                    label={entity.state}
                  />
                  <span className="text-xs text-slate-500">
                    {formatTimestamp(entity.lastUpdated)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
