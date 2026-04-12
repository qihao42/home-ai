import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { z } from 'zod'
import type { ApiResponse } from '@smarthome/shared'
import { MQTT_TOPIC_SET, buildTopic } from '@smarthome/shared'
import type { EventBus } from '../../core/event-bus.js'
import type { MqttClientApi } from '../types.js'

interface ServicesRouteDeps {
  readonly mqttClient: MqttClientApi
  readonly eventBus: EventBus
}

const serviceCallBodySchema = z.object({
  entity_id: z.string().min(1),
}).passthrough()

async function servicesRoutes(
  fastify: FastifyInstance,
  opts: ServicesRouteDeps,
): Promise<void> {
  const { mqttClient, eventBus } = opts

  fastify.post<{
    Params: { domain: string; action: string }
    Body: unknown
  }>('/api/services/:domain/:action', async (request, reply) => {
    const { domain, action } = request.params
    const parsed = serviceCallBodySchema.parse(request.body)

    const { entity_id, ...params } = parsed
    const deviceId = entity_id.split('.').pop() ?? entity_id

    const topic = buildTopic(MQTT_TOPIC_SET, {
      domain,
      device_id: deviceId,
    })

    const payload = JSON.stringify({
      action,
      ...params,
    })

    await mqttClient.publish(topic, payload)

    eventBus.emit('service_called', Object.freeze({
      domain,
      action,
      data: Object.freeze({ entity_id, ...params }),
    }))

    const response: ApiResponse<{ readonly called: boolean }> = {
      success: true,
      data: { called: true },
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(servicesRoutes, {
  name: 'services-routes',
})
