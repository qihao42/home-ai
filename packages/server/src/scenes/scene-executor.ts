import type { Scene } from '@smarthome/shared'
import { MQTT_TOPIC_SET, buildTopic } from '@smarthome/shared'
import type { EntityRegistry } from '../core/entity-registry.js'
import type { EventBus } from '../core/event-bus.js'
import type { MqttClientApi } from '../api/types.js'
import { createLogger } from '../core/logger.js'

const logger = createLogger('SceneExecutor')

export class SceneExecutor {
  private readonly mqttClient: MqttClientApi
  private readonly eventBus: EventBus

  constructor(
    _entityRegistry: EntityRegistry,
    mqttClient: MqttClientApi,
    eventBus: EventBus,
  ) {
    this.mqttClient = mqttClient
    this.eventBus = eventBus
  }

  async activate(scene: Scene): Promise<void> {
    logger.info(`Activating scene: ${scene.name}`)

    for (const entity of scene.entities) {
      const domain = entity.entity_id.split('.')[0] ?? ''
      const deviceId = entity.entity_id.split('.').pop() ?? entity.entity_id

      const topic = buildTopic(MQTT_TOPIC_SET, {
        domain,
        device_id: deviceId,
      })

      const action = entity.state === 'off' ? 'turn_off' : entity.state === 'on' ? 'turn_on' : `set_${entity.state === 'auto' || entity.state === 'heat' || entity.state === 'cool' ? 'mode' : entity.state}`
      const payload = JSON.stringify({
        action,
        ...entity.attributes,
        ...(entity.state === 'auto' || entity.state === 'heat' || entity.state === 'cool'
          ? { mode: entity.state }
          : {}),
      })

      await this.mqttClient.publish(topic, payload)
    }

    this.eventBus.emit('scene_activated', Object.freeze({
      scene_id: scene.id,
      scene_name: scene.name,
    }))

    logger.info(`Scene activated: ${scene.name}`)
  }
}
