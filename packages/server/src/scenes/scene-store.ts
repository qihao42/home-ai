import crypto from 'node:crypto'
import type { Scene } from '@smarthome/shared'
import { createLogger } from '../core/logger.js'
import type { SceneRepository } from '../persistence/repositories/scene.repo.js'

const logger = createLogger('SceneStore')

export function generateId(): string {
  return crypto.randomUUID()
}

const SEED_SCENES: readonly Omit<Scene, 'id'>[] = Object.freeze([
  Object.freeze({
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
  private readonly repo: SceneRepository
  private readonly cache: Map<string, Scene> = new Map()

  constructor(repo: SceneRepository) {
    this.repo = repo
    this.hydrate()
  }

  private hydrate(): void {
    if (this.repo.count() === 0) {
      for (const seed of SEED_SCENES) {
        const scene: Scene = Object.freeze({ ...seed, id: generateId() })
        this.repo.upsert(scene)
      }
      logger.info(`Seeded ${String(SEED_SCENES.length)} default scenes`)
    }

    const scenes = this.repo.findAll()
    for (const scene of scenes) {
      this.cache.set(scene.id, scene)
    }
    logger.info(`Loaded ${String(this.cache.size)} scenes from database`)
  }

  getAll(): readonly Scene[] {
    return Object.freeze([...this.cache.values()])
  }

  getById(id: string): Scene | undefined {
    return this.cache.get(id)
  }

  save(scene: Scene): Scene {
    const frozen = Object.freeze({ ...scene })
    this.repo.upsert(frozen)
    this.cache.set(frozen.id, frozen)
    return frozen
  }

  remove(id: string): boolean {
    const removedInDb = this.repo.delete(id)
    const removedInCache = this.cache.delete(id)
    return removedInDb || removedInCache
  }

  has(id: string): boolean {
    return this.cache.has(id)
  }
}
