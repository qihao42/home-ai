import Fastify, { type FastifyInstance } from 'fastify'
import corsPlugin from './plugins/cors.js'
import websocketPlugin from './plugins/websocket.js'
import errorHandlerPlugin from './plugins/error-handler.js'
import entitiesRoutes from './routes/entities.js'
import servicesRoutes from './routes/services.js'
import automationsRoutes from './routes/automations.js'
import historyRoutes from './routes/history.js'
import devicesRoutes from './routes/devices.js'
import wsHandlerPlugin from './ws/handler.js'
import { WsBroadcaster } from './ws/broadcaster.js'
import type { EntityRegistry } from '../core/entity-registry.js'
import type { EventBus } from '../core/event-bus.js'
import type { StateHistory } from '../core/state-history.js'
import type { AutomationEngineApi } from './routes/automations.js'
import type { MqttClientApi } from './types.js'
import { createLogger } from '../core/logger.js'

const logger = createLogger('ApiServer')

export interface ApiDependencies {
  readonly entityRegistry: EntityRegistry
  readonly eventBus: EventBus
  readonly mqttClient: MqttClientApi
  readonly automationEngine: AutomationEngineApi
  readonly stateHistory: StateHistory
}

export async function createApiServer(
  deps: ApiDependencies,
): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: false,
  })

  // Register plugins
  await fastify.register(corsPlugin)
  await fastify.register(websocketPlugin)
  await fastify.register(errorHandlerPlugin)

  // Register routes
  await fastify.register(entitiesRoutes, {
    entityRegistry: deps.entityRegistry,
  })
  await fastify.register(servicesRoutes, {
    mqttClient: deps.mqttClient,
    eventBus: deps.eventBus,
  })
  await fastify.register(automationsRoutes, {
    automationEngine: deps.automationEngine,
  })
  await fastify.register(historyRoutes, {
    stateHistory: deps.stateHistory,
  })
  await fastify.register(devicesRoutes, {
    entityRegistry: deps.entityRegistry,
  })

  // Register WebSocket handler
  await fastify.register(wsHandlerPlugin)

  // Set up broadcaster
  const broadcaster = new WsBroadcaster(deps.eventBus)
  broadcaster.start()

  fastify.addHook('onClose', () => {
    broadcaster.stop()
  })

  return fastify
}

export async function startApi(
  deps: ApiDependencies,
  port: number,
): Promise<FastifyInstance> {
  const fastify = await createApiServer(deps)

  await fastify.listen({ port, host: '0.0.0.0' })
  logger.info(`API server listening on port ${port}`)

  return fastify
}
