import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import type { ApiResponse, EntityState, EntityDomain } from '@smarthome/shared'
import type { EntityRegistry } from '../../core/entity-registry.js'

interface EntitiesRouteDeps {
  readonly entityRegistry: EntityRegistry
}

async function entitiesRoutes(
  fastify: FastifyInstance,
  opts: EntitiesRouteDeps,
): Promise<void> {
  const { entityRegistry } = opts

  fastify.get<{
    Querystring: { domain?: EntityDomain }
  }>('/api/entities', async (request, reply) => {
    const { domain } = request.query

    const entities = domain !== undefined
      ? entityRegistry.getByDomain(domain)
      : entityRegistry.getAllStates()

    const response: ApiResponse<readonly Readonly<EntityState>[]> = {
      success: true,
      data: entities,
    }
    return reply.send(response)
  })

  fastify.get<{
    Params: { entityId: string }
  }>('/api/entities/:entityId', async (request, reply) => {
    const { entityId } = request.params
    const entity = entityRegistry.getState(entityId)

    if (entity === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Entity not found: ${entityId}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<Readonly<EntityState>> = {
      success: true,
      data: entity,
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(entitiesRoutes, {
  name: 'entities-routes',
})
