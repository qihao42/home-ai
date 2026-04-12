import type { DeviceConfig, EntityDomain } from '@smarthome/shared'
import { deviceConfigSchema } from '@smarthome/shared'
import type { EntityRegistry } from '../../core/entity-registry.js'
import type { EventBus } from '../../core/event-bus.js'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('DeviceDiscovery')

const DEFAULT_STATES: Readonly<Record<EntityDomain, string>> = Object.freeze({
  light: 'off',
  sensor: 'unknown',
  switch: 'off',
  climate: 'idle',
  binary_sensor: 'off',
})

export function handleDiscoveryMessage(
  rawConfig: unknown,
  entityRegistry: EntityRegistry,
  eventBus: EventBus,
): void {
  const parsed = deviceConfigSchema.safeParse(rawConfig)

  if (!parsed.success) {
    logger.warn('Invalid device config received', parsed.error.message)
    return
  }

  const config: DeviceConfig = Object.freeze({
    ...parsed.data,
    capabilities: Object.freeze([...parsed.data.capabilities]),
  })

  const entityId = `${config.domain}.${config.id}`
  const existing = entityRegistry.getState(entityId)

  if (existing === undefined) {
    const defaultState = DEFAULT_STATES[config.domain]
    const now = new Date().toISOString()

    entityRegistry.setState(entityId, {
      domain: config.domain,
      state: defaultState,
      attributes: Object.freeze({
        friendly_name: config.name,
        room: config.room,
        capabilities: config.capabilities,
      }),
      last_changed: now,
    })

    logger.info(`Discovered new device: ${entityId}`, { name: config.name, room: config.room })
  }

  eventBus.emit('device_discovered', Object.freeze({
    device_id: config.id,
    domain: config.domain,
    config,
  }))
}
