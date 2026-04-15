import { useMemo } from 'react'
import { useEntityStore } from '../stores/entity-store'
import { EntityCard } from '../components/cards/EntityCard'
import { SceneQuickCards } from '../components/cards/SceneQuickCards'
import { useTranslation } from '../i18n/useTranslation'

export function DashboardPage() {
  const entities = useEntityStore((s) => s.entities)
  const loading = useEntityStore((s) => s.loading)
  const { t } = useTranslation()

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
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border border-slate-700/50 p-5 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20 text-2xl flex-shrink-0">
            👋
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('welcome.title')}
            </h3>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('welcome.body')}
              <span className="mx-1 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                {t('welcome.example1')}
              </span>
              {t('welcome.or')}
              <span className="mx-1 px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)' }}>
                {t('welcome.example2')}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Quick scene activation */}
      <SceneQuickCards />

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
