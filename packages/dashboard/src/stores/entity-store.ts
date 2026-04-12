import { create } from 'zustand'
import type { EntityState } from '../types'
import { fetchEntities } from '../api/client'

interface EntityStore {
  entities: Record<string, EntityState>
  loading: boolean
  error: string | null
  fetchAll(): Promise<void>
  updateEntity(entityId: string, state: EntityState): void
  removeEntity(entityId: string): void
  getByDomain(domain: string): EntityState[]
}

export const useEntityStore = create<EntityStore>((set, get) => ({
  entities: {},
  loading: false,
  error: null,

  async fetchAll() {
    set({ loading: true, error: null })
    try {
      const list = await fetchEntities()
      const entities: Record<string, EntityState> = {}
      for (const entity of list) {
        entities[entity.entityId] = entity
      }
      set({ entities, loading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch entities'
      set({ error: message, loading: false })
    }
  },

  updateEntity(entityId: string, state: EntityState) {
    set((prev) => ({
      entities: {
        ...prev.entities,
        [entityId]: state,
      },
    }))
  },

  removeEntity(entityId: string) {
    set((prev) => {
      const { [entityId]: _, ...rest } = prev.entities
      void _
      return { entities: rest }
    })
  },

  getByDomain(domain: string): EntityState[] {
    const { entities } = get()
    return Object.values(entities).filter((e) => e.domain === domain)
  },
}))
