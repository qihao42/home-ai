import type { Action, CallServiceAction, DelayAction } from '@smarthome/shared'
import { MQTT_TOPIC_SET, buildTopic } from '@smarthome/shared'
import type { MqttClient } from '../mqtt/client.js'
import type { EntityRegistry } from '../core/entity-registry.js'
import type { EventBus } from '../core/event-bus.js'
import { createLogger } from '../core/logger.js'

const logger = createLogger('ActionExecutor')

export class ActionExecutor {
  private readonly mqttClient: MqttClient
  readonly entityRegistry: EntityRegistry
  private readonly eventBus: EventBus

  constructor(
    mqttClient: MqttClient,
    entityRegistry: EntityRegistry,
    eventBus: EventBus,
  ) {
    this.mqttClient = mqttClient
    this.entityRegistry = entityRegistry
    this.eventBus = eventBus
  }

  async executeActions(actions: readonly Action[]): Promise<void> {
    for (const action of actions) {
      try {
        await this.executeAction(action)
      } catch (error) {
        logger.error('Failed to execute action', {
          type: action.type,
          error: String(error),
        })
        throw new Error(
          `Action execution failed: ${action.type} - ${String(error)}`,
        )
      }
    }
  }

  private async executeAction(action: Action): Promise<void> {
    switch (action.type) {
      case 'call_service':
        return this.executeCallService(action)
      case 'delay':
        return this.executeDelay(action)
    }
  }

  private async executeCallService(action: CallServiceAction): Promise<void> {
    const topic = buildTopic(MQTT_TOPIC_SET, {
      domain: action.domain,
      device_id: String(action.data['device_id'] ?? ''),
    })

    const payload = JSON.stringify({
      action: action.action,
      ...action.data,
    })

    await this.mqttClient.publish(topic, payload)

    this.eventBus.emit('service_called', Object.freeze({
      domain: action.domain,
      action: action.action,
      data: action.data,
    }))

    logger.info('Service called', {
      domain: action.domain,
      action: action.action,
      topic,
    })
  }

  private executeDelay(action: DelayAction): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, action.seconds * 1000)
    })
  }
}
