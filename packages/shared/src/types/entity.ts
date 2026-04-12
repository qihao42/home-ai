export type EntityDomain = 'light' | 'sensor' | 'switch' | 'climate' | 'binary_sensor'

export interface EntityState {
  readonly entity_id: string
  readonly domain: EntityDomain
  readonly state: string
  readonly attributes: Readonly<Record<string, unknown>>
  readonly last_changed: string
  readonly last_updated: string
}

export interface StateChangedEvent {
  readonly entity_id: string
  readonly old_state: EntityState | null
  readonly new_state: EntityState
}
