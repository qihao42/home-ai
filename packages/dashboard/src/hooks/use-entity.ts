import { useMemo } from 'react'
import { useEntityStore } from '../stores/entity-store'
import type { EntityState } from '../types'

export function useEntity(entityId: string): EntityState | undefined {
  return useEntityStore((state) => state.entities[entityId])
}

export function useEntitiesByDomain(domain: string): EntityState[] {
  const entities = useEntityStore((state) => state.entities)
  return useMemo(
    () => Object.values(entities).filter((e) => e.domain === domain),
    [entities, domain]
  )
}
