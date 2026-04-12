import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import type { ApiResponse, Scene } from '@smarthome/shared'
import { sceneSchema } from '@smarthome/shared'
import type { SceneStore } from '../../scenes/scene-store.js'
import type { SceneExecutor } from '../../scenes/scene-executor.js'
import { generateId } from '../../scenes/scene-store.js'

interface ScenesRouteDeps {
  readonly sceneStore: SceneStore
  readonly sceneExecutor: SceneExecutor
}

const createSceneSchema = sceneSchema.omit({ id: true })
const updateSceneSchema = sceneSchema.partial().omit({ id: true })

async function scenesRoutes(
  fastify: FastifyInstance,
  opts: ScenesRouteDeps,
): Promise<void> {
  const { sceneStore, sceneExecutor } = opts

  fastify.get('/api/scenes', async (_request, reply) => {
    const scenes = sceneStore.getAll()

    const response: ApiResponse<readonly Scene[]> = {
      success: true,
      data: scenes,
    }
    return reply.send(response)
  })

  fastify.get<{
    Params: { id: string }
  }>('/api/scenes/:id', async (request, reply) => {
    const { id } = request.params
    const scene = sceneStore.getById(id)

    if (scene === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Scene not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<Scene> = {
      success: true,
      data: scene,
    }
    return reply.send(response)
  })

  fastify.post('/api/scenes', async (request, reply) => {
    const body = createSceneSchema.parse(request.body)
    const scene = sceneStore.save(Object.freeze({
      ...body,
      id: generateId(),
    }))

    const response: ApiResponse<Scene> = {
      success: true,
      data: scene,
    }
    return reply.status(201).send(response)
  })

  fastify.put<{
    Params: { id: string }
  }>('/api/scenes/:id', async (request, reply) => {
    const { id } = request.params

    if (!sceneStore.has(id)) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Scene not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const body = updateSceneSchema.parse(request.body)
    const existing = sceneStore.getById(id)!
    const updated = sceneStore.save(Object.freeze({
      ...existing,
      ...body,
      id,
    }))

    const response: ApiResponse<Scene> = {
      success: true,
      data: updated,
    }
    return reply.send(response)
  })

  fastify.delete<{
    Params: { id: string }
  }>('/api/scenes/:id', async (request, reply) => {
    const { id } = request.params
    const removed = sceneStore.remove(id)

    if (!removed) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Scene not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<{ readonly deleted: boolean }> = {
      success: true,
      data: { deleted: true },
    }
    return reply.send(response)
  })

  fastify.post<{
    Params: { id: string }
  }>('/api/scenes/:id/activate', async (request, reply) => {
    const { id } = request.params
    const scene = sceneStore.getById(id)

    if (scene === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Scene not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    await sceneExecutor.activate(scene)

    const response: ApiResponse<{ readonly activated: boolean }> = {
      success: true,
      data: { activated: true },
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(scenesRoutes, {
  name: 'scenes-routes',
})
