import { createLogger } from '../core/logger.js'
import type { Integration, IntegrationContext } from './integration.js'

const logger = createLogger('IntegrationRegistry')

export class IntegrationRegistry {
  private readonly integrations: Map<string, Integration> = new Map()

  register(integration: Integration): void {
    if (this.integrations.has(integration.id)) {
      logger.warn(`Integration already registered: ${integration.id}`)
      return
    }
    this.integrations.set(integration.id, integration)
    logger.info(`Integration registered: ${integration.name} (${integration.id})`)
  }

  async setupAll(context: IntegrationContext): Promise<void> {
    const entries = [...this.integrations.values()]

    for (const integration of entries) {
      try {
        await integration.setup(context)
        logger.info(`Integration setup complete: ${integration.name}`)
      } catch (error) {
        logger.error(
          `Integration setup failed: ${integration.name}`,
          String(error),
        )
      }
    }
  }

  async teardownAll(): Promise<void> {
    const entries = [...this.integrations.values()]

    for (const integration of entries) {
      try {
        await integration.teardown()
        logger.info(`Integration teardown complete: ${integration.name}`)
      } catch (error) {
        logger.error(
          `Integration teardown failed: ${integration.name}`,
          String(error),
        )
      }
    }
  }

  getAll(): readonly Integration[] {
    return Object.freeze([...this.integrations.values()])
  }
}
