import type { FastifyInstance } from 'fastify'
import fastifyPlugin from 'fastify-plugin'
import type { ApiResponse, AutomationRule } from '@smarthome/shared'
import { automationRuleSchema } from '@smarthome/shared'

export interface AutomationEngineApi {
  getAllRules(): readonly AutomationRule[]
  getRule(id: string): AutomationRule | undefined
  addRule(rule: Omit<AutomationRule, 'id'>): AutomationRule
  updateRule(id: string, rule: Partial<AutomationRule>): AutomationRule | undefined
  removeRule(id: string): boolean
  triggerRule(id: string): Promise<boolean>
}

interface AutomationsRouteDeps {
  readonly automationEngine: AutomationEngineApi
}

const createAutomationSchema = automationRuleSchema.omit({ id: true })
const updateAutomationSchema = automationRuleSchema.partial().omit({ id: true })

async function automationsRoutes(
  fastify: FastifyInstance,
  opts: AutomationsRouteDeps,
): Promise<void> {
  const { automationEngine } = opts

  fastify.get('/api/automations', async (_request, reply) => {
    const rules = automationEngine.getAllRules()

    const response: ApiResponse<readonly AutomationRule[]> = {
      success: true,
      data: rules,
    }
    return reply.send(response)
  })

  fastify.get<{
    Params: { id: string }
  }>('/api/automations/:id', async (request, reply) => {
    const { id } = request.params
    const rule = automationEngine.getRule(id)

    if (rule === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Automation not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<AutomationRule> = {
      success: true,
      data: rule,
    }
    return reply.send(response)
  })

  fastify.post('/api/automations', async (request, reply) => {
    const body = createAutomationSchema.parse(request.body)
    const rule = automationEngine.addRule(body)

    const response: ApiResponse<AutomationRule> = {
      success: true,
      data: rule,
    }
    return reply.status(201).send(response)
  })

  fastify.put<{
    Params: { id: string }
  }>('/api/automations/:id', async (request, reply) => {
    const { id } = request.params
    const body = updateAutomationSchema.parse(request.body)
    const updated = automationEngine.updateRule(id, body)

    if (updated === undefined) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Automation not found: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<AutomationRule> = {
      success: true,
      data: updated,
    }
    return reply.send(response)
  })

  fastify.delete<{
    Params: { id: string }
  }>('/api/automations/:id', async (request, reply) => {
    const { id } = request.params
    const removed = automationEngine.removeRule(id)

    if (!removed) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Automation not found: ${id}`,
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
  }>('/api/automations/:id/trigger', async (request, reply) => {
    const { id } = request.params
    const triggered = await automationEngine.triggerRule(id)

    if (!triggered) {
      const response: ApiResponse<never> = {
        success: false,
        error: `Automation not found or could not be triggered: ${id}`,
      }
      return reply.status(404).send(response)
    }

    const response: ApiResponse<{ readonly triggered: boolean }> = {
      success: true,
      data: { triggered: true },
    }
    return reply.send(response)
  })
}

export default fastifyPlugin(automationsRoutes, {
  name: 'automations-routes',
})
