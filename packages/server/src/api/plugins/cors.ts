import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import fastifyCors from '@fastify/cors'

async function corsPlugin(fastify: FastifyInstance): Promise<void> {
  await fastify.register(fastifyCors, {
    origin: true,
  })
}

export default fastifyPlugin(corsPlugin, {
  name: 'cors',
})
