import type { StateChangedEvent } from '@smarthome/shared'
import type { EventBus } from '../../core/event-bus.js'
import { getConnectedClients } from './handler.js'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('WsBroadcaster')

export class WsBroadcaster {
  private readonly eventBus: EventBus
  private listener: ((event: StateChangedEvent) => void) | null = null

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  start(): void {
    this.listener = (event: StateChangedEvent) => {
      this.broadcastStateChange(event)
    }
    this.eventBus.on('state_changed', this.listener)
    logger.info('WebSocket broadcaster started')
  }

  stop(): void {
    if (this.listener !== null) {
      this.eventBus.off('state_changed', this.listener)
      this.listener = null
      logger.info('WebSocket broadcaster stopped')
    }
  }

  private broadcastStateChange(event: StateChangedEvent): void {
    const clients = getConnectedClients()
    const payload = JSON.stringify({
      type: 'event',
      event_type: 'state_changed',
      data: event,
    })

    for (const [socket, subscription] of clients) {
      const subscribedToEvent = subscription.events.has('state_changed')
      const subscribedToEntity = subscription.entities.has(event.entity_id)

      if (!subscribedToEvent && !subscribedToEntity) {
        continue
      }

      try {
        socket.send(payload)
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logger.error(`Failed to send to WebSocket client: ${message}`)
      }
    }
  }
}
