import { useState, useEffect, useCallback, useMemo } from 'react'
import { useEntityStore } from '../stores/entity-store'
import { fetchHistory } from '../api/client'
import { HistoryChart } from '../components/history/HistoryChart'
import type { HistoryEntry } from '../types'

export function HistoryPage() {
  const entities = useEntityStore((s) => s.entities)
  const [selectedEntityId, setSelectedEntityId] = useState('')
  const [entries, setEntries] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [limit, setLimit] = useState(100)

  const entityList = useMemo(
    () =>
      Object.values(entities).sort((a, b) => a.name.localeCompare(b.name)),
    [entities]
  )

  const loadHistory = useCallback(async () => {
    if (!selectedEntityId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchHistory(selectedEntityId, limit)
      setEntries(data)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load history'
      setError(message)
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [selectedEntityId, limit])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const selectedEntity = selectedEntityId
    ? entities[selectedEntityId]
    : undefined

  return (
    <div>
      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px] max-w-md">
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Entity
          </label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            className="select-field"
          >
            <option value="">Select an entity...</option>
            {entityList.map((entity) => (
              <option key={entity.entityId} value={entity.entityId}>
                {entity.name} ({entity.domain})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="select-field w-auto"
          >
            <option value={50}>50 entries</option>
            <option value={100}>100 entries</option>
            <option value={250}>250 entries</option>
            <option value={500}>500 entries</option>
          </select>
        </div>

        <button
          onClick={loadHistory}
          disabled={!selectedEntityId || loading}
          className="btn-primary disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!selectedEntityId ? (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <span className="text-4xl">📈</span>
          <h3 className="mt-4 text-lg font-medium text-slate-300">
            Select an entity
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Choose an entity above to view its state history.
          </p>
        </div>
      ) : loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
            <span>Loading history...</span>
          </div>
        </div>
      ) : (
        <HistoryChart
          entries={entries}
          entityName={selectedEntity?.name ?? selectedEntityId}
        />
      )}
    </div>
  )
}
