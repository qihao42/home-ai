import type { FastifyInstance, FastifyError } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import { ZodError } from 'zod'
import type { ApiResponse } from '@smarthome/shared'
import { createLogger } from '../../core/logger.js'

const logger = createLogger('ErrorHandler')

function formatZodErrors(error: ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
}

async function errorHandlerPlugin(fastify: FastifyInstance): Promise<void> {
  fastify.setErrorHandler((error: FastifyError | ZodError, _request, reply) => {
    if (error instanceof ZodError) {
      const response: ApiResponse<never> = {
        success: false,
        error: formatZodErrors(error),
      }
      return reply.status(400).send(response)
    }

    const fastifyError = error as FastifyError
    if (fastifyError.statusCode !== undefined && fastifyError.statusCode < 500) {
      const response: ApiResponse<never> = {
        success: false,
        error: fastifyError.message,
      }
      return reply.status(fastifyError.statusCode).send(response)
    }

    logger.error('Unhandled error', fastifyError.message)

    const response: ApiResponse<never> = {
      success: false,
      error: 'Internal server error',
    }
    return reply.status(500).send(response)
  })
}

export default fastifyPlugin(errorHandlerPlugin, {
  name: 'error-handler',
})
