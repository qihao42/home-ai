import type { EntityDomain } from '@smarthome/shared'
import type { Integration, IntegrationContext } from '../integration.js'
import { parseTopic } from '../../mqtt/topic-parser.js'
import { mapPayloadToState } from './state-mapper.js'
import { handleDiscoveryMessage } from './discovery.js'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('MqttDeviceIntegration')

const VALID_DOMAINS: ReadonlySet<EntityDomain> = new Set([
  'light',
  'sensor',
  'switch',
  'climate',
  'binary_sensor',
])

function isValidDomain(domain: string): domain is EntityDomain {
  return VALID_DOMAINS.has(domain as EntityDomain)
}

function tryParseJson(payload: string): unknown | null {
  try {
    return JSON.parse(payload) as unknown
  } catch {
    logger.warn('Failed to parse MQTT payload as JSON', { payload })
    return null
  }
}

export class MqttDeviceIntegration implements Integration {
  readonly id = 'mqtt-device'
  readonly name = 'MQTT Device Integration'

  private context: IntegrationContext | null = null

  async setup(context: IntegrationContext): Promise<void> {
    this.context = context

    // Our own devices
    await context.mqttClient.subscribe('smarthome/+/+/state')
    await context.mqttClient.subscribe('smarthome/+/+/config')

    // Home Assistant-compatible discovery (bridged devices from HA instance)
    // See https://www.home-assistant.io/integrations/mqtt/#mqtt-discovery
    await context.mqttClient.subscribe('homeassistant/+/+/state')
    await context.mqttClient.subscribe('homeassistant/+/+/config')

    context.mqttClient.onMessage((topic: string, payload: string) => {
      this.handleMessage(topic, payload)
    })

    logger.info('MQTT Device Integration setup complete (native + Home Assistant compatible)')
  }

  async teardown(): Promise<void> {
    this.context = null
    logger.info('MQTT Device Integration teardown complete')
  }

  private handleMessage(topic: string, payload: string): void {
    if (this.context === null) {
      return
    }

    const parsed = parseTopic(topic)
    if (parsed === null) {
      return
    }

    const { domain, deviceId, suffix } = parsed

    if (!isValidDomain(domain)) {
      logger.warn(`Unknown domain: ${domain}`)
      return
    }

    const data = tryParseJson(payload)
    if (data === null) {
      return
    }

    if (suffix === 'state') {
      this.handleStateMessage(domain, deviceId, data)
    } else if (suffix === 'config') {
      handleDiscoveryMessage(data, this.context.entityRegistry, this.context.eventBus)
    }
  }

  private handleStateMessage(
    domain: EntityDomain,
    deviceId: string,
    data: unknown,
  ): void {
    if (this.context === null) {
      return
    }

    const entityId = `${domain}.${deviceId}`
    const rawPayload = data as Record<string, unknown>

    const stateData = mapPayloadToState(entityId, domain, rawPayload)

    // Merge with existing attributes to preserve room, friendly_name, capabilities
    const existing = this.context.entityRegistry.getState(entityId)
    const mergedAttributes = existing
      ? Object.freeze({ ...existing.attributes, ...stateData.attributes })
      : stateData.attributes

    this.context.entityRegistry.setState(entityId, {
      ...stateData,
      attributes: mergedAttributes,
    })
  }
}
