import { loadConfig } from './config.js'
import { createLogger } from './core/logger.js'
import { EventBus } from './core/event-bus.js'
import { EntityRegistry } from './core/entity-registry.js'
import { StateHistory } from './core/state-history.js'
import { startBroker, stopBroker } from './mqtt/broker.js'
import { createMqttClient } from './mqtt/client.js'
import type { MqttClient } from './mqtt/client.js'
import { IntegrationRegistry } from './integrations/registry.js'
import { MqttDeviceIntegration } from './integrations/mqtt-device/index.js'
import { ActionExecutor } from './automation/action-executor.js'
import { AutomationEngine } from './automation/engine.js'
import { SceneStore } from './scenes/scene-store.js'
import { SceneExecutor } from './scenes/scene-executor.js'
import { createDatabase } from './persistence/database.js'
import type { DatabaseConnection } from './persistence/database.js'
import { runMigrations } from './persistence/migrations.js'
import { startApi } from './api/server.js'
import type { FastifyInstance } from 'fastify'

const logger = createLogger('Bootstrap')

interface SystemHandles {
  readonly apiServer: FastifyInstance
  readonly automationEngine: AutomationEngine
  readonly integrationRegistry: IntegrationRegistry
  readonly mqttClient: MqttClient
  readonly database: DatabaseConnection
}

async function bootstrap(): Promise<SystemHandles> {
  // 1. Load config
  const config = loadConfig()
  logger.info('Configuration loaded', {
    port: config.port,
    mqttPort: config.mqttPort,
    dbPath: config.dbPath,
  })

  // 2. Initialize database + run migrations
  const database = await createDatabase(config.dbPath)
  runMigrations(database)
  logger.info('Database initialized and migrations applied')

  // 3. Create event bus
  const eventBus = new EventBus()

  // 4. Create entity registry
  const entityRegistry = new EntityRegistry(eventBus)

  // 5. Create state history
  const stateHistory = new StateHistory(eventBus, config.historyBufferSize)

  // 6. Start MQTT broker
  await startBroker(config.mqttPort)
  logger.info('MQTT broker started')

  // 7. Create internal MQTT client
  const mqttClient = await createMqttClient(config.mqttPort)
  logger.info('Internal MQTT client connected')

  // 8. Setup integrations
  const integrationRegistry = new IntegrationRegistry()
  integrationRegistry.register(new MqttDeviceIntegration())
  await integrationRegistry.setupAll({ eventBus, entityRegistry, mqttClient })
  logger.info('Integrations initialized')

  // 9. Create action executor
  const actionExecutor = new ActionExecutor(mqttClient, entityRegistry, eventBus)

  // 10. Create automation engine, load seed rules, start
  const automationEngine = new AutomationEngine(
    eventBus,
    entityRegistry,
    actionExecutor,
  )
  automationEngine.start()
  logger.info('Automation engine started')

  // 11. Create scene store and executor
  const sceneStore = new SceneStore()
  const sceneExecutor = new SceneExecutor(entityRegistry, mqttClient, eventBus)
  logger.info('Scene system initialized')

  // 12. Start API server
  const apiServer = await startApi(
    { entityRegistry, eventBus, mqttClient, automationEngine, stateHistory, sceneStore, sceneExecutor },
    config.port,
  )

  logger.info('SmartHome Hub startup complete', {
    apiPort: config.port,
    mqttPort: config.mqttPort,
  })

  return { apiServer, automationEngine, integrationRegistry, mqttClient, database }
}

async function shutdown(handles: SystemHandles): Promise<void> {
  logger.info('Graceful shutdown initiated')

  try {
    await handles.apiServer.close()
    logger.info('API server stopped')
  } catch (error) {
    logger.error('Error stopping API server', String(error))
  }

  try {
    handles.automationEngine.stop()
    logger.info('Automation engine stopped')
  } catch (error) {
    logger.error('Error stopping automation engine', String(error))
  }

  try {
    await handles.integrationRegistry.teardownAll()
    logger.info('Integrations torn down')
  } catch (error) {
    logger.error('Error tearing down integrations', String(error))
  }

  try {
    await handles.mqttClient.disconnect()
    logger.info('MQTT client disconnected')
  } catch (error) {
    logger.error('Error disconnecting MQTT client', String(error))
  }

  try {
    await stopBroker()
    logger.info('MQTT broker stopped')
  } catch (error) {
    logger.error('Error stopping MQTT broker', String(error))
  }

  try {
    handles.database.close()
    logger.info('Database closed')
  } catch (error) {
    logger.error('Error closing database', String(error))
  }

  logger.info('Shutdown complete')
}

try {
  const handles = await bootstrap()

  let isShuttingDown = false

  const onSignal = (): void => {
    if (isShuttingDown) {
      return
    }
    isShuttingDown = true

    shutdown(handles)
      .catch((error) => {
        logger.error('Shutdown failed', String(error))
      })
      .finally(() => {
        process.exit(0)
      })
  }

  process.on('SIGINT', onSignal)
  process.on('SIGTERM', onSignal)
} catch (error) {
  logger.error('Bootstrap failed', String(error))
  process.exit(1)
}
