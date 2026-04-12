import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import type { ApiResponse, EntityState } from '@smarthome/shared'
import type { StateHistory } from '../../core/state-history.js'

interface HistoryRouteDeps {
  readonly stateHistory: StateHistory
}

async function historyRoutes(
  fastify: FastifyInstance,
  opts: HistoryRouteDeps,
): Promise<void> {
  const { stateHistory } = opts

  fastify.get<{
    Params: { entityId: string }
    Querystring: { limit?: string }
  }>('/api/history/:entityId', async (request, reply) => {
    const { entityId } = request.params
    const limitParam = request.query.limit
    const limit = limitParam !== undefined ? Number(limitParam) : 50

    const history = stateHistory.getHistory(entityId, {
      limit: Number.isFinite(limit) ? limit : 50,
    })

    const response: ApiResponse<readonly Readonly<EntityState>[]> = {
      success: true,
      data: history,
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(historyRoutes, {
  name: 'history-routes',
})
