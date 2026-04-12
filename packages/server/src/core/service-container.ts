import { createLogger } from './logger.js'

const logger = createLogger('ServiceContainer')

export class ServiceContainer {
  private readonly services: Map<string, unknown> = new Map()

  set<T>(key: string, service: T): void {
    if (this.services.has(key)) {
      logger.warn(`Overwriting existing service: ${key}`)
    }
    this.services.set(key, service)
    logger.info(`Service registered: ${key}`)
  }

  get<T>(key: string): T {
    const service = this.services.get(key)
    if (service === undefined) {
      throw new Error(`Service not found: ${key}`)
    }
    return service as T
  }

  has(key: string): boolean {
    return this.services.has(key)
  }

  keys(): readonly string[] {
    return Object.freeze([...this.services.keys()])
  }
}
