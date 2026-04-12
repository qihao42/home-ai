import type { FastifyInstance } from 'fastify'
import type { WebSocket } from '@fastify/websocket'
import fastifyPlugin from 'fastify-plugin'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('WsHandler')

export interface WsSubscription {
  readonly events: ReadonlySet<string>
  readonly entities: ReadonlySet<string>
}

export interface TrackedClient {
  readonly socket: WebSocket
  readonly subscription: WsSubscription
}

interface WsMessage {
  readonly type: string
  readonly event_type?: string
  readonly entity_id?: string
}

const clients: Map<WebSocket, WsSubscription> = new Map()

export function getConnectedClients(): ReadonlyMap<WebSocket, WsSubscription> {
  return clients
}

function handleMessage(socket: WebSocket, raw: string): void {
  try {
    const message = JSON.parse(raw) as WsMessage

    if (message.type === 'subscribe_events') {
      const current = clients.get(socket)
      if (current === undefined) return

      const updatedEvents = new Set(current.events)
      if (message.event_type !== undefined) {
        updatedEvents.add(message.event_type)
      } else {
        updatedEvents.add('state_changed')
        updatedEvents.add('automation_triggered')
        updatedEvents.add('service_called')
      }

      clients.set(socket, {
        events: updatedEvents,
        entities: current.entities,
      })

      socket.send(JSON.stringify({
        type: 'subscription_confirmed',
        event_type: message.event_type ?? 'all',
      }))

      logger.info(`Client subscribed to events: ${message.event_type ?? 'all'}`)
    }

    if (message.type === 'subscribe_entities' && message.entity_id !== undefined) {
      const current = clients.get(socket)
      if (current === undefined) return

      const updatedEntities = new Set(current.entities)
      updatedEntities.add(message.entity_id)

      clients.set(socket, {
        events: current.events,
        entities: updatedEntities,
      })

      socket.send(JSON.stringify({
        type: 'subscription_confirmed',
        entity_id: message.entity_id,
      }))

      logger.info(`Client subscribed to entity: ${message.entity_id}`)
    }
  } catch {
    logger.warn('Failed to parse WebSocket message')
    socket.send(JSON.stringify({
      type: 'error',
      error: 'Invalid JSON message',
    }))
  }
}

async function wsHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.get('/api/ws', { websocket: true }, (socket: WebSocket) => {
    const initialSubscription: WsSubscription = {
      events: new Set<string>(),
      entities: new Set<string>(),
    }

    clients.set(socket, initialSubscription)
    logger.info('WebSocket client connected')

    socket.on('message', (data: Buffer | string) => {
      const raw = typeof data === 'string' ? data : data.toString('utf-8')
      handleMessage(socket, raw)
    })

    socket.on('close', () => {
      clients.delete(socket)
      logger.info('WebSocket client disconnected')
    })

    socket.on('error', (error: Error) => {
      logger.error('WebSocket error', error.message)
      clients.delete(socket)
    })
  })
}

export default fastifyPlugin(wsHandlerPlugin, {
  name: 'ws-handler',
  dependencies: ['websocket'],
})
