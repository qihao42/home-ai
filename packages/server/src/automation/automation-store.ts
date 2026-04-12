import crypto from 'node:crypto'
import type { AutomationRule } from '@smarthome/shared'
import { createLogger } from '../core/logger.js'

const logger = createLogger('AutomationStore')

export function generateId(): string {
  return crypto.randomUUID()
}

const SEED_AUTOMATIONS: readonly AutomationRule[] = Object.freeze([
  Object.freeze({
    id: generateId(),
    name: 'Cool down when hot',
    enabled: true,
    trigger: Object.freeze({
      type: 'numeric_state' as const,
      entity_id: 'sensor.living_room_temp',
      attribute: 'temperature',
      above: 30,
    }),
    conditions: [],
    actions: Object.freeze([
      Object.freeze({
        type: 'call_service' as const,
        domain: 'climate',
        action: 'set_mode',
        data: Object.freeze({
          device_id: 'hallway_thermostat',
          mode: 'cool',
          temperature: 24,
        }),
      }),
    ]),
  }),
  Object.freeze({
    id: generateId(),
    name: 'Lights on motion',
    enabled: true,
    trigger: Object.freeze({
      type: 'state' as const,
      entity_id: 'binary_sensor.living_room_motion',
      to: 'on',
    }),
    conditions: [],
    actions: Object.freeze([
      Object.freeze({
        type: 'call_service' as const,
        domain: 'light',
        action: 'turn_on',
        data: Object.freeze({
          device_id: 'living_room_light_1',
        }),
      }),
    ]),
  }),
  Object.freeze({
    id: generateId(),
    name: 'Night mode dim lights',
    enabled: true,
    trigger: Object.freeze({
      type: 'time' as const,
      at: '22:00',
    }),
    conditions: [],
    actions: Object.freeze([
      Object.freeze({
        type: 'call_service' as const,
        domain: 'light',
        action: 'set_brightness',
        data: Object.freeze({
          device_id: 'living_room_light_1',
          brightness: 50,
        }),
      }),
    ]),
  }),
])

export class AutomationStore {
  private readonly rules: Map<string, AutomationRule> = new Map()

  constructor() {
    this.loadSeedAutomations()
  }

  private loadSeedAutomations(): void {
    if (this.rules.size > 0) {
      return
    }
    for (const rule of SEED_AUTOMATIONS) {
      this.rules.set(rule.id, rule)
    }
    logger.info(`Loaded ${String(SEED_AUTOMATIONS.length)} seed automations`)
  }

  getAll(): readonly AutomationRule[] {
    return Object.freeze([...this.rules.values()])
  }

  getById(id: string): AutomationRule | undefined {
    return this.rules.get(id)
  }

  save(rule: AutomationRule): AutomationRule {
    const frozen = Object.freeze({ ...rule })
    this.rules.set(frozen.id, frozen)
    return frozen
  }

  remove(id: string): boolean {
    return this.rules.delete(id)
  }

  has(id: string): boolean {
    return this.rules.has(id)
  }
}
