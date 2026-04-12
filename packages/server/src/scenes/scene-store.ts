import crypto from 'node:crypto'
import type { Scene } from '@smarthome/shared'
import { createLogger } from '../core/logger.js'

const logger = createLogger('SceneStore')

export function generateId(): string {
  return crypto.randomUUID()
}

const SEED_SCENES: readonly Scene[] = Object.freeze([
  Object.freeze({
    id: generateId(),
    name: 'Good Morning',
    icon: 'sunrise',
    entities: Object.freeze([
      Object.freeze({
        entity_id: 'light.living_room_light_1',
        state: 'on',
        attributes: Object.freeze({ brightness: 200 }),
      }),
      Object.freeze({
        entity_id: 'light.kitchen_light',
        state: 'on',
      }),
      Object.freeze({
        entity_id: 'climate.hallway_thermostat',
        state: 'auto',
        attributes: Object.freeze({ temperature: 22 }),
      }),
    ]),
  }),
  Object.freeze({
    id: generateId(),
    name: 'Good Night',
    icon: 'moon',
    entities: Object.freeze([
      Object.freeze({
        entity_id: 'light.living_room_light_1',
        state: 'off',
      }),
      Object.freeze({
        entity_id: 'light.kitchen_light',
        state: 'off',
      }),
      Object.freeze({
        entity_id: 'climate.hallway_thermostat',
        state: 'heat',
        attributes: Object.freeze({ temperature: 18 }),
      }),
      Object.freeze({
        entity_id: 'switch.living_room_switch',
        state: 'off',
      }),
    ]),
  }),
  Object.freeze({
    id: generateId(),
    name: 'Away',
    icon: 'lock',
    entities: Object.freeze([
      Object.freeze({
        entity_id: 'light.living_room_light_1',
        state: 'off',
      }),
      Object.freeze({
        entity_id: 'light.kitchen_light',
        state: 'off',
      }),
      Object.freeze({
        entity_id: 'switch.living_room_switch',
        state: 'off',
      }),
      Object.freeze({
        entity_id: 'climate.hallway_thermostat',
        state: 'heat',
        attributes: Object.freeze({ temperature: 16 }),
      }),
    ]),
  }),
  Object.freeze({
    id: generateId(),
    name: 'Movie Time',
    icon: 'film',
    entities: Object.freeze([
      Object.freeze({
        entity_id: 'light.living_room_light_1',
        state: 'on',
        attributes: Object.freeze({ brightness: 30 }),
      }),
      Object.freeze({
        entity_id: 'light.kitchen_light',
        state: 'off',
      }),
    ]),
  }),
])

export class SceneStore {
  private readonly scenes: Map<string, Scene> = new Map()

  constructor() {
    this.loadSeedScenes()
  }

  private loadSeedScenes(): void {
    if (this.scenes.size > 0) {
      return
    }
    for (const scene of SEED_SCENES) {
      this.scenes.set(scene.id, scene)
    }
    logger.info(`Loaded ${String(SEED_SCENES.length)} seed scenes`)
  }

  getAll(): readonly Scene[] {
    return Object.freeze([...this.scenes.values()])
  }

  getById(id: string): Scene | undefined {
    return this.scenes.get(id)
  }

  save(scene: Scene): Scene {
    const frozen = Object.freeze({ ...scene })
    this.scenes.set(frozen.id, frozen)
    return frozen
  }

  remove(id: string): boolean {
    return this.scenes.delete(id)
  }

  has(id: string): boolean {
    return this.scenes.has(id)
  }
}
