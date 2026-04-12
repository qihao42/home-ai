import type { StateChangedEvent } from '@smarthome/shared'
import type { EventBus } from '../../core/event-bus.js'
import type { SceneActivatedEvent } from '../../core/event-bus.js'
import { getConnectedClients } from './handler.js'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('WsBroadcaster')

export class WsBroadcaster {
  private readonly eventBus: EventBus
  private stateListener: ((event: StateChangedEvent) => void) | null = null
  private sceneListener: ((event: SceneActivatedEvent) => void) | null = null

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
  }

  start(): void {
    this.stateListener = (event: StateChangedEvent) => {
      this.broadcastStateChange(event)
    }
    this.eventBus.on('state_changed', this.stateListener)

    this.sceneListener = (event: SceneActivatedEvent) => {
      this.broadcastSceneActivated(event)
    }
    this.eventBus.on('scene_activated', this.sceneListener)

    logger.info('WebSocket broadcaster started')
  }

  stop(): void {
    if (this.stateListener !== null) {
      this.eventBus.off('state_changed', this.stateListener)
      this.stateListener = null
    }
    if (this.sceneListener !== null) {
      this.eventBus.off('scene_activated', this.sceneListener)
      this.sceneListener = null
    }
    logger.info('WebSocket broadcaster stopped')
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

  private broadcastSceneActivated(event: SceneActivatedEvent): void {
    const clients = getConnectedClients()
    const payload = JSON.stringify({
      type: 'event',
      event_type: 'scene_activated',
      data: event,
    })

    for (const [socket, subscription] of clients) {
      const subscribedToEvent = subscription.events.has('scene_activated')

      if (!subscribedToEvent) {
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
