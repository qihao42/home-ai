import type { EntityState, StateChangedEvent } from '@smarthome/shared'
import type { EventBus } from './event-bus.js'

interface HistoryQueryOptions {
  readonly limit?: number
}

export class StateHistory {
  private readonly buffers: Map<string, readonly Readonly<EntityState>[]> = new Map()
  private readonly maxSize: number

  constructor(eventBus: EventBus, maxSize: number = 100) {
    this.maxSize = maxSize

    eventBus.on('state_changed', (event: StateChangedEvent) => {
      this.record(event.entity_id, event.new_state)
    })
  }

  record(entityId: string, state: Readonly<EntityState>): void {
    const existing = this.buffers.get(entityId) ?? []
    const updated = [...existing, Object.freeze({ ...state })]

    const trimmed = updated.length > this.maxSize
      ? updated.slice(updated.length - this.maxSize)
      : updated

    this.buffers.set(entityId, Object.freeze(trimmed))
  }

  getHistory(
    entityId: string,
    options?: HistoryQueryOptions,
  ): readonly Readonly<EntityState>[] {
    const history = this.buffers.get(entityId) ?? []
    if (options?.limit !== undefined && options.limit < history.length) {
      return Object.freeze(history.slice(history.length - options.limit))
    }
    return history
  }

  getAllHistory(): ReadonlyMap<string, readonly Readonly<EntityState>[]> {
    return new Map(this.buffers)
  }
}
