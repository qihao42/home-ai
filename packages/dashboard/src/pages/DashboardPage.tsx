import { useMemo } from 'react'
import { useEntityStore } from '../stores/entity-store'
import { EntityCard } from '../components/cards/EntityCard'

export function DashboardPage() {
  const entities = useEntityStore((s) => s.entities)
  const loading = useEntityStore((s) => s.loading)

  const groupedByRoom = useMemo(() => {
    const groups: Record<string, typeof entityList> = {}
    const entityList = Object.values(entities)

    for (const entity of entityList) {
      const room = (entity.attributes.room as string) ?? 'Other'
      if (!groups[room]) {
        groups[room] = []
      }
      groups[room].push(entity)
    }

    // Sort rooms: named rooms first, "Other" last
    const sorted = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Other') return 1
      if (b === 'Other') return -1
      return a.localeCompare(b)
    })

    return sorted
  }, [entities])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          <span>Loading entities...</span>
        </div>
      </div>
    )
  }

  if (groupedByRoom.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <span className="text-5xl">🏠</span>
        <h3 className="mt-4 text-lg font-medium text-slate-300">No devices found</h3>
        <p className="mt-1 text-sm text-slate-500">
          Connect devices to your SmartHome Hub to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groupedByRoom.map(([room, roomEntities]) => (
        <section key={room}>
          <div className="mb-4 flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">{room}</h3>
            <span className="rounded-full bg-slate-700/50 px-2.5 py-0.5 text-xs text-slate-400">
              {roomEntities.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {roomEntities.map((entity) => (
              <EntityCard key={entity.entityId} entity={entity} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
