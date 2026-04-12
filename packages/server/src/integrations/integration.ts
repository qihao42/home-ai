import type { EventBus } from '../core/event-bus.js'
import type { EntityRegistry } from '../core/entity-registry.js'
import type { MqttClient } from '../mqtt/client.js'

export interface IntegrationContext {
  readonly eventBus: EventBus
  readonly entityRegistry: EntityRegistry
  readonly mqttClient: MqttClient
}

export interface Integration {
  readonly id: string
  readonly name: string
  setup(context: IntegrationContext): Promise<void>
  teardown(): Promise<void>
}
