import type { EntityState, StateChangedEvent } from '@smarthome/shared'
import type { EventBus } from './event-bus.js'
import { createLogger } from './logger.js'

const logger = createLogger('EntityRegistry')

function shallowEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

export class EntityRegistry {
  private readonly entities: Map<string, Readonly<EntityState>> = new Map()
  private readonly eventBus: EventBus

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  getState(entityId: string): Readonly<EntityState> | undefined {
    return this.entities.get(entityId)
  }

  getAllStates(): readonly Readonly<EntityState>[] {
    return Object.freeze([...this.entities.values()])
  }

  getByDomain(domain: string): readonly Readonly<EntityState>[] {
    const results: Readonly<EntityState>[] = []
    for (const entity of this.entities.values()) {
      if (entity.domain === domain) {
        results.push(entity)
      }
    }
    return Object.freeze(results)
  }

  setState(
    entityId: string,
    newState: Omit<EntityState, 'entity_id' | 'last_updated'>,
  ): Readonly<EntityState> {
    const oldState = this.entities.get(entityId) ?? null

    // Skip emitting if nothing meaningful changed (same state + same attributes).
    // Still store it to keep last_updated fresh, but don't fan out cascades.
    const unchanged =
      oldState !== null &&
      oldState.state === newState.state &&
      oldState.domain === newState.domain &&
      shallowEqual(oldState.attributes, newState.attributes)

    const fullState: Readonly<EntityState> = Object.freeze({
      ...newState,
      entity_id: entityId,
      last_updated: new Date().toISOString(),
    })

    this.entities.set(entityId, fullState)

    if (unchanged) {
      return fullState
    }

    const event: StateChangedEvent = Object.freeze({
      entity_id: entityId,
      old_state: oldState,
      new_state: fullState,
    })

    logger.info(`State changed for ${entityId}`, {
      old: oldState?.state,
      new: fullState.state,
    })

    this.eventBus.emit('state_changed', event)

    return fullState
  }

  removeEntity(entityId: string): boolean {
    const existed = this.entities.has(entityId)
    if (existed) {
      this.entities.delete(entityId)
      this.eventBus.emit('device_removed', Object.freeze({ device_id: entityId }))
      logger.info(`Entity removed: ${entityId}`)
    }
    return existed
  }
}
