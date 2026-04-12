import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import fastifyWebSocket from '@fastify/websocket'

async function websocketPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyWebSocket)
}

export default fastifyPlugin(websocketPlugin, {
  name: 'websocket',
})
