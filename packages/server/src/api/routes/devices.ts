import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import type { ApiResponse, EntityState } from '@smarthome/shared'
import type { EntityRegistry } from '../../core/entity-registry.js'

interface DeviceInfo {
  readonly entity_id: string
  readonly domain: string
  readonly state: string
  readonly attributes: Readonly<Record<string, unknown>>
  readonly last_changed: string
  readonly last_updated: string
}

interface GroupedDevices {
  readonly [room: string]: readonly DeviceInfo[]
}

interface DevicesRouteDeps {
  readonly entityRegistry: EntityRegistry
}

function groupByRoom(entities: readonly Readonly<EntityState>[]): GroupedDevices {
  const groups: Record<string, DeviceInfo[]> = {}

  for (const entity of entities) {
    const room = typeof entity.attributes.room === 'string'
      ? entity.attributes.room
      : 'unassigned'

    const deviceInfo: DeviceInfo = {
      entity_id: entity.entity_id,
      domain: entity.domain,
      state: entity.state,
      attributes: entity.attributes,
      last_changed: entity.last_changed,
      last_updated: entity.last_updated,
    }

    const existing = groups[room]
    if (existing !== undefined) {
      groups[room] = [...existing, deviceInfo]
    } else {
      groups[room] = [deviceInfo]
    }
  }

  return Object.freeze(groups)
}

async function devicesRoutes(
  fastify: FastifyInstance,
  opts: DevicesRouteDeps,
): Promise<void> {
  const { entityRegistry } = opts

  fastify.get('/api/devices', async (_request, reply) => {
    const entities = entityRegistry.getAllStates()
    const grouped = groupByRoom(entities)

    const response: ApiResponse<GroupedDevices> = {
      success: true,
      data: grouped,
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(devicesRoutes, {
  name: 'devices-routes',
})
